interface OAuthResponse {
  code: string;
  msg: string;
  token?: string;
}

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
let tokenRefreshPromise: Promise<string> | null = null;
let isRefreshing = false;

const TOKEN_LIFETIME = 10 * 1000;
const TOKEN_REFRESH_THRESHOLD = 2 * 1000;

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

async function fetchNewToken(): Promise<string> {
  if (isRefreshing && tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  isRefreshing = true;
  
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`OAuth request failed`);
    }

    const text = await response.text();
    let data: OAuthResponse;
    
    try {
      data = JSON.parse(text);
      if (Array.isArray(data)) {
        data = data[0];
      }
    } catch {
      throw new Error('OAuth 응답을 처리할 수 없습니다');
    }

    if (data.code !== '1000' || !data.token) {
      throw new Error(data.msg || 'OAuth 토큰 발급 실패');
    }

    return data.token;
  } catch (error) {
    throw error instanceof Error ? error : new Error('OAuth 인증에 실패했습니다');
  } finally {
    isRefreshing = false;
  }
}

async function refreshToken(): Promise<string> {
  try {
    const newToken = await fetchNewToken();
    cachedToken = newToken;
    tokenExpiry = Date.now() + TOKEN_LIFETIME;
    return newToken;
  } finally {
    tokenRefreshPromise = null;
  }
}

export async function getOAuthToken(): Promise<string> {
  try {
    const now = Date.now();

    if (cachedToken && tokenExpiry && now < tokenExpiry - TOKEN_REFRESH_THRESHOLD) {
      return cachedToken;
    }

    if (!tokenRefreshPromise) {
      tokenRefreshPromise = refreshToken();
    }

    return await tokenRefreshPromise;
  } catch (error) {
    clearTokenCache();
    throw error;
  }
}

export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = null;
  tokenRefreshPromise = null;
  isRefreshing = false;
}

if (typeof window !== 'undefined') {
  let refreshInterval: NodeJS.Timeout | undefined;

  function startTokenRefresh() {
    if (!refreshInterval) {
      refreshInterval = setInterval(async () => {
        try {
          await getOAuthToken();
        } catch {
          // Silently handle token refresh errors
        }
      }, TOKEN_LIFETIME / 2);
    }
  }

  function stopTokenRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = undefined;
    }
  }

  window.addEventListener('focus', startTokenRefresh);
  window.addEventListener('blur', stopTokenRefresh);
  
  startTokenRefresh();
}


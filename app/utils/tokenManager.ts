let lastToken: string | null = null;
let lastTokenTime: number = 0;
const TOKEN_REFRESH_INTERVAL = 1000; // 1초
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1초

async function fetchOAuthToken(): Promise<string> {
  const response = await fetch('/api/get-oauth-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || 'Failed to fetch OAuth token');
  }

  const data = await response.json();
  
  if (data.error || data.code !== '1000' || !data.token) {
    throw new Error(data.msg || 'Invalid OAuth response');
  }

  return data.token;
}

export async function getOAuthToken(): Promise<string> {
  const currentTime = Date.now();
  
  // 토큰이 있고 만료되지 않았다면 재사용
  if (lastToken && currentTime - lastTokenTime < TOKEN_REFRESH_INTERVAL) {
    return lastToken;
  }

  // 재시도 로직
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const token = await fetchOAuthToken();
      lastToken = token;
      lastTokenTime = currentTime;
      return token;
    } catch (error) {
      console.error(`Error fetching OAuth token (attempt ${i + 1}):`, error);
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Failed to obtain OAuth token after multiple attempts');
}


import { NextRequest, NextResponse } from 'next/server'

interface LoginResponse {
  code: string;
  msg: string;
  token?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login Request Body:', {
      m_code: body.m_code,
      cc_code: body.cc_code,
      token: body.token,
      user_id: body.user_id,
      password: '[REDACTED]'
    });

    if (!body.token) {
      console.error('No token provided in login request');
      return NextResponse.json(
        {
          code: '1001',
          msg: 'OAuth 토큰이 필요합니다.',
          error: true
        },
        { status: 400 }
      );
    }

    const loginUrl = 'https://quick.api.insungdata.com/api/login/';
    console.log('Sending login request to:', loginUrl);

    const params = new URLSearchParams({
      m_code: body.m_code,
      cc_code: body.cc_code,
      token: body.token,
      user_id: body.user_id,
      password: body.password,
    });

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/xml, application/json',
      },
      body: params.toString(),
    });

    const text = await response.text();
    console.log('Raw Login Response:', text);

    // Parse XML response
    const codeMatch = text.match(/<code>(\d+)<\/code>/);
    const msgMatch = text.match(/<msg>\s*<!\[CDATA\[(.*?)\]\]>\s*<\/msg>/);
    
    if (!codeMatch || !msgMatch) {
      throw new Error('응답을 처리할 수 없습니다.');
    }

    const responseData: LoginResponse = {
      code: codeMatch[1],
      msg: msgMatch[1].trim(),
    };

    console.log('Processed Login Response:', responseData);

    // Check for specific error codes
    if (responseData.code === '1001' && responseData.msg.includes('OAUTH-FAILED')) {
      return NextResponse.json({
        code: '1001',
        msg: 'OAuth 인증에 실패했습니다. 다시 로그인해 주세요.',
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      {
        code: '1002',
        msg: error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.',
        error: true
      },
      { status: 500 }
    );
  }
}


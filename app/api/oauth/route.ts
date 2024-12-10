import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('OAuth request initiated');
    
    const host = request.headers.get('host') || '';
    console.log('Request host:', host);

    const baseUrl = 'https://quick.api.insungdata.com';
    const apiUrl = new URL('/api/oauth/', baseUrl);

    if (!apiUrl) {
      console.error('Failed to construct API URL');
      return NextResponse.json(
        { 
          code: '1001',
          msg: 'API URL 구성에 실패했습니다.',
          error: true 
        },
        { status: 500 }
      );
    }

    console.log('Target API URL:', apiUrl.toString());

    const params = new URLSearchParams({
      m_code: '1119',
      cc_code: '2076',
      ukey: '15885480bfafe78dadc820236c913914b6dce7b7',
      akey: 'b36eb0f84aca48d032d01b3b29f87013',
      type: 'json'
    });

    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Origin': `https://${host}`,
        'Referer': `https://${host}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('OAuth API error:', response.status, response.statusText);
      throw new Error(`OAuth API returned ${response.status}`);
    }

    const text = await response.text();
    console.log('Raw OAuth Response:', text);

    let responseData;
    try {
      responseData = JSON.parse(text);
      if (Array.isArray(responseData)) {
        console.log('Response is an array, taking first element');
        responseData = responseData[0];
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return NextResponse.json(
        { 
          code: '1001',
          msg: '서버 응답을 처리할 수 없습니다.',
          error: true 
        },
        { status: 400 }
      );
    }

    if (!responseData || typeof responseData !== 'object') {
      console.error('Invalid response format:', responseData);
      return NextResponse.json(
        { 
          code: '1001',
          msg: '올바르지 않은 응답 형식입니다.',
          error: true 
        },
        { status: 400 }
      );
    }

    if (responseData.code !== '1000' || !responseData.token) {
      console.error('OAuth error response:', responseData);
      return NextResponse.json(
        { 
          code: responseData.code || '1001',
          msg: responseData.msg || '인증 서버 오류가 발생했습니다.',
          error: true 
        },
        { status: 400 }
      );
    }

    console.log('OAuth request completed successfully');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { 
        code: '1001',
        msg: error instanceof Error ? error.message : '인증 서버와의 통신에 실패했습니다.',
        error: true 
      },
      { status: 500 }
    );
  }
}


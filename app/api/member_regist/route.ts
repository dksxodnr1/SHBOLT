import { NextRequest, NextResponse } from 'next/server'
import { getOAuthToken } from '../auth'
import { XMLParser } from 'fast-xml-parser'

interface RegistrationData {
  m_code: string;
  cc_code: string;
  token: string;
  user_id: string;
  password: string;
  password_confirm: string;
  cust_name: string;
  dong_name: string;
  tel_no: string;
  credit?: string;
  dept_name?: string;
  charge_name?: string;
  email?: string;
  location?: string;
  lon?: string;
  lat?: string;
  address?: string;
  comp_no?: string;
  type?: string;
}

interface XMLResponse {
  Result?: {
    code?: string;
    msg?: string;
    item?: {
      user_id?: string;
      comp_no?: string;
      department_name?: string;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get a fresh OAuth token
    const oauthToken = await getOAuthToken();
    
    const data: RegistrationData = await request.json();
    console.log('Registration Request:', {
      ...data,
      password: '[REDACTED]',
      password_confirm: '[REDACTED]'
    });

    // 필수 항목 검증
    const requiredFields = ['m_code', 'cc_code', 'user_id', 'password', 'password_confirm', 'cust_name', 'dong_name', 'tel_no'];
    for (const field of requiredFields) {
      if (!data[field as keyof RegistrationData]) {
        return NextResponse.json({ code: '2001', msg: `${field.toUpperCase()}-VALUE-EMPTY` }, { status: 400 });
      }
    }

    // 비밀번호 길이 검증
    if (data.password.length < 5 || data.password.length > 10) {
      return NextResponse.json({ code: '2005', msg: 'PASSWORD-VALUE-LENGTHS' }, { status: 400 });
    }

    // 비밀번호 일치 검증
    if (data.password !== data.password_confirm) {
      return NextResponse.json({ code: '2007', msg: 'PASSWORD-NOT-MATCH-UP' }, { status: 400 });
    }

    // 이메일 유효성 검증 (선택적)
    if (data.email && !validateEmail(data.email)) {
      return NextResponse.json({ code: '4001', msg: 'EMAIL-VALIDATE-FAILED' }, { status: 400 });
    }

    // API 요청 준비
    const apiUrl = 'https://quick.api.insungdata.com/api/member_regist/';
    const formData = new URLSearchParams();
    
    // Use the fresh OAuth token
    const requestData = {
      ...data,
      token: oauthToken // This ensures we're using the fresh token
    };

    console.log('Using OAuth token for registration:', oauthToken);
    console.log('Registration request data:', requestData);

    Object.entries(requestData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    console.log('Sending registration request to:', apiUrl);
    
    // API 요청
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/xml, application/json',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    console.log('Raw API Response:', responseText);

    // XML 파싱
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true
    });
    
    try {
      const result: XMLResponse = parser.parse(responseText);
      console.log('Parsed Response:', result);

      const code = result.Result?.code?.toString() || '';
      const msg = result.Result?.msg || '';
      const user_id = result.Result?.item?.user_id;
      const comp_no = result.Result?.item?.comp_no;
      const department_name = result.Result?.item?.department_name;

      if (code === '1000') {
        return NextResponse.json({
          code,
          msg,
          user_id,
          comp_no,
          department_name,
        }, {
          status: 200  // 성공 시 200 상태 코드 반환
        });
      } else {
        // Check for specific error cases
        if (msg.includes('OAUTH-FAILED')) {
          return NextResponse.json({ 
            code: '1001', 
            msg: 'OAuth 인증에 실패했습니다. 다시 시도해주세요.' 
          }, { 
            status: 401 
          });
        }
        
        return NextResponse.json({ 
          code: code || '1001', 
          msg: msg || '회원가입 처리 중 오류가 발생했습니다.' 
        }, { 
          status: 400 
        });
      }
    } catch (parseError) {
      console.error('XML Parsing Error:', parseError);
      return NextResponse.json({ 
        code: '5000', 
        msg: 'XML 응답 파싱 중 오류가 발생했습니다.' 
      }, { 
        status: 500 
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      code: '5000', 
      msg: error instanceof Error ? error.message : '서버 내부 오류가 발생했습니다.' 
    }, { 
      status: 500 
    });
  }
}

function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(email);
}


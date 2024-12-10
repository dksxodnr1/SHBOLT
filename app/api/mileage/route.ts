import { NextRequest, NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const contentType = request.headers.get('content-type');
    let requestBody;

    if (contentType?.includes('application/json')) {
      requestBody = await request.json();
    } else {
      const formData = await request.formData();
      requestBody = Object.fromEntries(formData);
    }

    // API 요청 준비
    const apiUrl = 'http://quick.api.insungdata.com/api/mileage/';
    const apiFormData = new URLSearchParams();

    // requestBody 데이터를 apiFormData로 변환
    Object.entries(requestBody).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        apiFormData.append(key, value.toString());
      }
    });

    console.log('마일리지 API 요청 데이터:', apiFormData.toString());

    // 외부 API 호출
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/xml, application/json',
      },
      body: apiFormData.toString(),
    });

    const responseText = await response.text();
    console.log('외부 API 응답:', responseText);

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true
    });
    
    const result = parser.parse(responseText);
    console.log('파싱된 결과:', result);

    // 성공적인 응답이든 실패든 항상 200 상태 코드로 반환
    return NextResponse.json({
      code: result.Result?.code || '9000',
      mileage: result.Result?.mileage || '0',
      mileage_type: result.Result?.mileage_type || '',
      // msg 필드 제거
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });


  } catch (error) {
    console.error('마일리지 조회 오류:', error);
    
    return NextResponse.json({ 
      code: '9000', 
      mileage: '0',
      // 에러 메시지 필드 제거
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}


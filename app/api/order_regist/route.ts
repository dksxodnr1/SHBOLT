import { NextRequest, NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'
import { MongoClient } from 'mongodb'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null;
  let requestBody: any = null;
  
  try {
    // request.json()을 사용하여 body 파싱하고 변수에 저장
    requestBody = await request.json();
    console.log('주문 등록 요청 데이터:', requestBody);

    // MongoDB 연결
    client = await clientPromise;
    const db = client.db("orderHistory");
    
    // orders 컬렉션이 없으면 생성
    const collections = await db.listCollections({ name: 'orders' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('orders');
      console.log('orders 컬렉션이 생성되었습니다.');
    }
    
    const collection = db.collection("orders");

    // API 요청 준비
    const apiUrl = 'http://quick.api.insungdata.com/api/order_regist/';
    const formData = new URLSearchParams();

    // requestBody 데이터를 formData로 변환
    Object.entries(requestBody).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });

    // 외부 API 호출
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/xml, application/json',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    console.log('외부 API 응답:', responseText);

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true
    });
    
    const result = parser.parse(responseText);
    
    // MongoDB에 데이터 저장
    const orderData = {
      userId: requestBody.user_id,
      requestBody: requestBody,
      apiResponse: result,
      createdAt: new Date(),
      status: result.Result?.code === '1000' ? 'success' : 'failed'
    };

    const insertResult = await collection.insertOne(orderData);
    console.log('MongoDB 저장 결과:', insertResult);

    if (!insertResult.acknowledged) {
      throw new Error('MongoDB 저장 실패');
    }

    if (result.Result?.code === '1000') {
      return NextResponse.json({
        code: '1000',
        msg: 'OK',
        serial_number: result.Result.serial_number,
        mongoDbId: insertResult.insertedId.toString(),
        savedData: orderData
      });
    } else {
      return NextResponse.json({
        code: result.Result?.code || '9000',
        msg: result.Result?.msg || '오더 등록 중 오류가 발생했습니다.',
        mongoDbId: insertResult.insertedId.toString(),
        savedData: orderData
      }, { status: 400 });
    }
  } catch (error) {
    console.error('주문 등록 오류:', error);
    
    // 에러 발생시에도 MongoDB에 저장 시도
    if (client) {
      try {
        const errorData = {
          userId: requestBody?.user_id, // requestBody 변수 사용
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          timestamp: new Date(),
          requestBody: requestBody // requestBody 변수 사용
        };
        
        await client.db("orderHistory")
          .collection("orders")
          .insertOne({
            error: errorData,
            status: 'error',
            createdAt: new Date()
          });
      } catch (dbError) {
        console.error('에러 로그 저장 실패:', dbError);
      }
    }

    return NextResponse.json({ 
      code: '9000', 
      msg: error instanceof Error ? error.message : '서버 내부 오류가 발생했습니다.' 
    }, { 
      status: 500 
    });
  }
}


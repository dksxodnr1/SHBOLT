import { NextRequest, NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

interface CDataWrapper {
  _cdata?: string;
}

interface OrderItem {
  serial_number: string | number;
  order_state: string | CDataWrapper;
  order_date: string | CDataWrapper;
  departure_dong_name: string | CDataWrapper;
  departure_address: string | CDataWrapper;
  destination_dong_name: string | CDataWrapper;
  destination_address: string | CDataWrapper;
  total_cost: string | CDataWrapper;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    
    if (!requestBody.token) {
      console.error('인증 토큰 누락')
      return NextResponse.json({
        code: '1001',
        msg: 'OAUTH-FAILED',
      }, { status: 401 })
    }

    const apiUrl = 'http://quick.api.insungdata.com/api/order_list/include_cancel/'
    const apiFormData = new URLSearchParams()

    // 필수 파라미터
    const requiredParams = ['m_code', 'cc_code', 'user_id', 'token']
    for (const param of requiredParams) {
      if (!requestBody[param]) {
        return NextResponse.json({
          code: '9000',
          msg: `필수 파라미터 누락: ${param}`,
        }, { status: 400 })
      }
      apiFormData.append(param, requestBody[param])
    }

    // 선택적 파라미터
    const optionalParams = ['limit', 'page', 'from_date', 'to_date', 'type']
    for (const param of optionalParams) {
      if (requestBody[param]) {
        apiFormData.append(param, requestBody[param])
      }
    }

    console.log('API 요청 데이터:', apiFormData.toString())

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/xml, application/json',
      },
      body: apiFormData.toString(),
    })

    const responseText = await response.text()
    console.log('API 응답:', responseText)

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
      removeNSPrefix: true,
      textNodeName: "_text",
      cdataPropName: "_cdata",
    })
    
    const result = parser.parse(responseText)

    if (result.Result?.code === 1000) {
      // Ensure item is always an array
      const orders = result.Result.item ? 
        (Array.isArray(result.Result.item) ? result.Result.item : [result.Result.item]) : 
        []

      // Transform orders to handle CDATA content
      const transformedOrders = orders.map((order: OrderItem) => ({
        serial_number: order.serial_number,
        order_state: typeof order.order_state === 'string' ? order.order_state : order.order_state?._cdata,
        order_date: typeof order.order_date === 'string' ? order.order_date : order.order_date?._cdata,
        departure_dong_name: typeof order.departure_dong_name === 'string' ? order.departure_dong_name : order.departure_dong_name?._cdata,
        departure_address: typeof order.departure_address === 'string' ? order.departure_address : order.departure_address?._cdata,
        destination_dong_name: typeof order.destination_dong_name === 'string' ? order.destination_dong_name : order.destination_dong_name?._cdata,
        destination_address: typeof order.destination_address === 'string' ? order.destination_address : order.destination_address?._cdata,
        total_cost: typeof order.total_cost === 'string' ? order.total_cost : order.total_cost?._cdata,
      }))

      const pageInfo = {
        from_date: result.Result.page_info.from_date?._cdata || result.Result.page_info.from_date,
        to_date: result.Result.page_info.to_date?._cdata || result.Result.page_info.to_date,
        total_record: parseInt(result.Result.page_info.total_record),
        total_page: parseInt(result.Result.page_info.total_page),
        current_page: parseInt(result.Result.page_info.current_page),
        display_article: parseInt(result.Result.page_info.display_article),
        current_display_article: parseInt(result.Result.page_info.current_display_article),
      }

      console.log('Transformed orders:', transformedOrders)
      console.log('Page info:', pageInfo)

      return NextResponse.json({
        code: '1000',
        orders: transformedOrders,
        pageInfo: pageInfo,
      }, { status: 200 })
    } else {
      console.error('API 응답 오류:', result)
      return NextResponse.json({
        code: result.Result?.code || '9000',
        msg: result.Result?.msg?._cdata || result.Result?.msg || '주문 목록을 가져오는 중 오류가 발생했습니다.',
      }, { status: 400 })
    }
  } catch (error) {
    console.error('주문 목록 조회 오류:', error)
    return NextResponse.json({ 
      code: '9000', 
      msg: error instanceof Error ? error.message : '서버 내부 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}


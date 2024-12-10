import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("orderHistory");
    const collection = db.collection("orders");

    const recentOrders = await collection.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const formattedOrders = recentOrders.map(order => {
      const orderData = order.requestBody || order;

      return {
        id: order._id.toString(),
        createdAt: order.createdAt,
        senderInfo: {
          name: orderData.s_start || 'N/A',
          contact: orderData.start_telno || 'N/A',
          address: `${orderData.start_sido} ${orderData.start_gugun} ${orderData.start_dong}`.trim(),
          detailAddress: orderData.start_location?.match(/(\d+[동호층실]\s*\d*호?|\d+층\s*\d*호?)/)?.[0] || '',
          fullAddress: orderData.start_location || 'N/A',
          displayAddress: orderData.start_display_address || orderData.start_location || 'N/A'
        },
        receiverInfo: {
          name: orderData.s_dest || 'N/A',
          contact: orderData.dest_telno || 'N/A',
          address: `${orderData.dest_sido} ${orderData.dest_gugun} ${orderData.dest_dong}`.trim(),
          detailAddress: orderData.dest_location?.match(/(\d+[동호층실]\s*\d*호?|\d+층\s*\d*호?)/)?.[0] || '',
          fullAddress: orderData.dest_location || 'N/A',
          displayAddress: orderData.dest_display_address || orderData.dest_location || 'N/A'
        },
        boxSize: 
          orderData.item_type === '2' ? '소박스' : 
          orderData.item_type === '3' ? '중박스' : 
          orderData.item_type === '4' ? '대박스' : 'N/A',
        deliveryOption: orderData.sfast === '3' ? '급송' : '일반',
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('최근 주문 조회 오류:', error);
    return NextResponse.json({ error: '최근 주문을 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}


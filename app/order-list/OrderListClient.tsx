'use client'

import { useState, useEffect } from 'react'
import { OrderListForm } from './OrderListForm'
import { OrderListTable } from './OrderListTable'
import { getOAuthToken } from '@/app/utils/tokenManager'
import { useAuth } from '@/app/AuthContext'
import { toast } from 'sonner'

interface PageInfo {
  from_date: string;
  to_date: string;
  total_record: number;
  total_page: number;
  current_page: number;
  display_article: number;
  current_display_article: number;
}

interface Order {
  serial_number: string;
  order_state: string;
  order_date: string;
  departure_dong_name: string;
  departure_address: string;
  destination_dong_name: string;
  destination_address: string;
  total_cost: string;
}

export default function OrderListClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { userId } = useAuth()

  const fetchOrders = async (searchParams: { from_date?: string; to_date?: string; limit?: string; page?: number }) => {
    setIsLoading(true)
    try {
      let token: string;
      try {
        token = await getOAuthToken();
      } catch (tokenError) {
        console.error('OAuth 토큰 가져오기 실패:', tokenError);
        toast.error('인증에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      if (!userId) {
        toast.error('사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      const response = await fetch('/api/order-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...searchParams,
          m_code: '1119',
          cc_code: '2076',
          user_id: userId,
          token,
          type: 'xml',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.code === '1001' && errorData.msg === 'RESULT:OAUTH-FAILED') {
          // OAuth 실패 시 토큰을 재발급 받고 다시 시도
          console.log('OAuth 토큰 만료, 재발급 시도');
          await getOAuthToken(); // 이 호출로 토큰이 갱신됩니다
          return fetchOrders(searchParams); // 재귀적으로 다시 시도
        }
        throw new Error(errorData.msg || `서버 오류: ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== '1000') {
        throw new Error(data.msg || '주문 목록을 가져오는데 실패했습니다')
      }

      setOrders(data.orders)
      setPageInfo(data.pageInfo)
    } catch (error) {
      console.error('주문 목록 가져오기 오류:', error)
      toast.error(error instanceof Error ? error.message : '주문 목록을 가져오는 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      const today = new Date().toISOString().split('T')[0]
      fetchOrders({
        from_date: today,
        to_date: today,
        limit: '10',
        page: 1
      })
    }
  }, [userId])

  const handlePageChange = (newPage: number) => {
    if (pageInfo) {
      fetchOrders({
        from_date: pageInfo.from_date,
        to_date: pageInfo.to_date,
        limit: pageInfo.display_article.toString(),
        page: newPage
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-[#FF9776] mb-6">주문 목록</h1>
      <OrderListForm onSubmit={fetchOrders} />
      <OrderListTable 
        orders={orders} 
        pageInfo={pageInfo} 
        isLoading={isLoading} 
        onPageChange={handlePageChange} 
      />
    </div>
  )
}


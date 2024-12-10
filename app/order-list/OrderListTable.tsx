import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

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

interface PageInfo {
  current_page: number;
  total_page: number;
  total_record: number;
  current_display_article: number;
}

interface OrderListTableProps {
  orders: Order[];
  pageInfo: PageInfo | null;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export function OrderListTable({ orders, pageInfo, isLoading, onPageChange }: OrderListTableProps) {
  if (isLoading) {
    return <div className="text-center">로딩 중...</div>
  }

  if (!orders || orders.length === 0) {
    return <div className="text-center">주문 내역이 없습니다.</div>
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>주문 번호</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>접수일</TableHead>
            <TableHead>출발지</TableHead>
            <TableHead>도착지</TableHead>
            <TableHead>요금</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.serial_number}>
              <TableCell>{order.serial_number}</TableCell>
              <TableCell>{order.order_state}</TableCell>
              <TableCell>{order.order_date}</TableCell>
              <TableCell>{`${order.departure_dong_name} ${order.departure_address}`}</TableCell>
              <TableCell>{`${order.destination_dong_name} ${order.destination_address}`}</TableCell>
              <TableCell>{order.total_cost}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pageInfo && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            총 {pageInfo.total_record}개 중 {pageInfo.current_display_article}개 표시
          </div>
          <div className="space-x-2">
            <Button
              onClick={() => onPageChange(pageInfo.current_page - 1)}
              disabled={pageInfo.current_page === 1}
              className="bg-[#FF9776] hover:bg-[#FF8561] text-white"
            >
              이전
            </Button>
            <span>{pageInfo.current_page} / {pageInfo.total_page}</span>
            <Button
              onClick={() => onPageChange(pageInfo.current_page + 1)}
              disabled={pageInfo.current_page === pageInfo.total_page}
              className="bg-[#FF9776] hover:bg-[#FF8561] text-white"
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


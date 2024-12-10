import React from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RecentOrder } from '@/types/recentOrder'
import { X } from 'lucide-react'

interface RecentOrderHistoryProps {
  orders: RecentOrder[]
  onSelect: (order: RecentOrder) => void
  onClose: () => void
}

export function RecentOrderHistory({ orders, onSelect, onClose }: RecentOrderHistoryProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl relative">
        <Button
          onClick={onClose}
          variant="ghost"
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </Button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#FF9776]">최근 접수 이력</h2>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="mb-4 p-4 border rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                onClick={() => onSelect(order)}
              >
                <p className="font-semibold text-[#FF9776]">{new Date(order.createdAt).toLocaleString()}</p>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>보내는 분:</strong> {order.senderInfo.name}</p>
                    <p className="text-sm text-gray-600">{order.senderInfo.address}</p>
                    {order.senderInfo.detailAddress && (
                      <p className="text-sm font-medium text-[#FF9776]">
                        {order.senderInfo.detailAddress}
                      </p>
                    )}
                  </div>
                  <div>
                    <p><strong>받는 분:</strong> {order.receiverInfo.name}</p>
                    <p className="text-sm text-gray-600">{order.receiverInfo.address}</p>
                    {order.receiverInfo.detailAddress && (
                      <p className="text-sm font-medium text-[#FF9776]">
                        {order.receiverInfo.detailAddress}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex justify-between">
                  <p><strong>물품 종류:</strong> {order.boxSize}</p>
                  <p><strong>배송 옵션:</strong> {order.deliveryOption}</p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OrderListFormProps {
  onSubmit: (params: { from_date: string; to_date: string; limit: string; page: number }) => void;
}

export function OrderListForm({ onSubmit }: OrderListFormProps) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [limit, setLimit] = useState('10')

  // 컴포넌트 마운트 시 오늘 날짜로 초기화
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFromDate(today)
    setToDate(today)
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({ 
      from_date: fromDate, 
      to_date: toDate, 
      limit, 
      page: 1 
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="fromDate">시작 날짜</Label>
          <Input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="toDate">종료 날짜</Label>
          <Input
            id="toDate"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="limit">페이지당 항목 수</Label>
          <Input
            id="limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            min="1"
            max="100"
            className="mt-1"
            required
          />
        </div>
      </div>
      <Button type="submit" className="mt-4 bg-[#FF9776] hover:bg-[#FF8561] text-white">
        검색
      </Button>
    </form>
  )
}


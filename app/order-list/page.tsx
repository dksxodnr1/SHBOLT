import OrderListClient from './OrderListClient'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function OrderListPage() {
  return (
    <ErrorBoundary>
      <OrderListClient />
    </ErrorBoundary>
  )
}


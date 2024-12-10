'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러를 콘솔에만 기록합니다
    console.error('Application error:', error)
  }, [error])

  // null을 반환하여 에러 UI를 완전히 숨깁니다
  return null
}


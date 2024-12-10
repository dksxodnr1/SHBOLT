'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // 에러를 콘솔에만 기록하고 UI는 완전히 숨깁니다
  console.error('Application error:', error);
  return null;
}


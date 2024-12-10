import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from './AuthContext'
import { Toaster } from 'sonner'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "우리는 빠르고 안전합니다! 퀴노스",
  description: "퀴노스 - 빠르고 안전한 배송 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <style>{`
          /* 개발 환경의 에러 오버레이를 강제로 숨깁니다 */
          [data-nextjs-dialog-overlay],
          [data-nextjs-dialog],
          [data-nextjs-toast],
          [data-nextjs-error-overlay],
          iframe#webpack-dev-server-client-overlay {
            display: none !important;
          }
          
          /* 에러 표시 버튼을 숨깁니다 */
          .nextjs-error-button {
            display: none !important;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}


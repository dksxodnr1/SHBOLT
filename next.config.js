/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/oauth',
        destination: 'https://quick.api.insungdata.com/api/oauth/',
      },
      {
        source: '/api/login',
        destination: 'https://quick.api.insungdata.com/api/login/',
      },
      {
        source: '/api/order_regist',
        destination: 'http://quick.api.insungdata.com/api/order_regist/',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://t1.daumcdn.net https://*.daumcdn.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "frame-src 'self' https://t1.daumcdn.net https://*.daumcdn.net https://*.daum.net",
              "connect-src 'self' https://quick.api.insungdata.com http://quick.api.insungdata.com"
            ].join('; ')
          },
        ],
      },
    ]
  },
  // 에러 표시 관련 설정 수정
  devIndicators: {
    buildActivity: false,
  },
  // TypeScript 및 ESLint 오류 무시 설정
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
}

module.exports = nextConfig


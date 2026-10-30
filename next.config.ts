import type { NextConfig } from 'next'
import { securityHeaders } from './src/lib/security-headers'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  // Dev-only routes are named page.dev.tsx; production builds never see them.
  pageExtensions: isProd ? ['tsx', 'ts'] : ['dev.tsx', 'tsx', 'ts'],
  poweredByHeader: false,
  devIndicators: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async headers() {
    return [{ source: '/:path*', headers: [...securityHeaders] }]
  },
}

export default nextConfig

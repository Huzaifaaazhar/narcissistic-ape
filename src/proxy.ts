import { NextResponse, type NextRequest } from 'next/server'
import { buildCsp } from '@/lib/security-headers'

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development'

  // Second guard (first is pageExtensions): /dev/* never exists in production.
  if (!isDev && request.nextUrl.pathname.startsWith('/dev')) {
    return new NextResponse(null, { status: 404 })
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  const csp = buildCsp(nonce, isDev, supabase ? [supabase, supabase.replace(/^https/, 'wss')] : [])

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|textures|fonts|posters|icons|sw.js|offline.html|manifest.webmanifest).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}

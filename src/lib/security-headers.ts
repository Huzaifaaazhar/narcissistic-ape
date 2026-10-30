/** Static security headers applied to every response (next.config.ts). CSP is per-request in proxy.ts. */
export const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
] as const

export function buildCsp(nonce: string, isDev: boolean, connect: string[] = []): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    // Dev HMR injects <style> tags without a nonce; production serves CSS as files.
    'style-src': isDev ? ["'self'", "'unsafe-inline'"] : ["'self'", `'nonce-${nonce}'`],
    // React SSR emits style="" attributes (torn-edge clip paths, CSS vars). Attribute-only, no <style> injection.
    'style-src-attr': ["'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'media-src': ["'self'", 'blob:'],
    'worker-src': ["'self'", 'blob:'],
    'connect-src': ["'self'", ...connect, ...(isDev ? ['ws:'] : [])],
    'frame-src': ['https://challenges.cloudflare.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  }
  const csp = Object.entries(directives).map(([k, v]) => `${k} ${v.join(' ')}`)
  if (!isDev) csp.push('upgrade-insecure-requests')
  return csp.join('; ')
}

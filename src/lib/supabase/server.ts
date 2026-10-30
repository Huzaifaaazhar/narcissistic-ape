import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

function backend() {
  const e = env()
  if (!e.FEATURE_BACKEND || !e.NEXT_PUBLIC_SUPABASE_URL || !e.NEXT_PUBLIC_SUPABASE_ANON_KEY || !e.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Backend is not enabled (FEATURE_BACKEND=0)')
  }
  return e as typeof e & { NEXT_PUBLIC_SUPABASE_URL: string; NEXT_PUBLIC_SUPABASE_ANON_KEY: string; SUPABASE_SERVICE_ROLE_KEY: string }
}

/**
 * Per-request client acting as the signed-in (anonymous) player. Auth cookies are httpOnly:
 * the browser never touches Supabase auth directly, every call goes through our route handlers.
 */
export async function sessionClient() {
  const e = backend()
  const store = await cookies()
  return createServerClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookieOptions: { httpOnly: true, secure: e.NODE_ENV === 'production', sameSite: 'lax', path: '/' },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options)
        } catch {
          // Called from a Server Component render; the proxy/route handler refreshes instead.
        }
      },
    },
  })
}

/** Service-role client. Bypasses RLS: only for server-side score writes after validation. */
export function serviceClient() {
  const e = backend()
  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

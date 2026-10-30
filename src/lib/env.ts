import 'server-only'
import { z } from 'zod'

const flag = z.enum(['0', '1']).default('0').transform((v) => v === '1')
const secret = (min: number) => z.string().trim().min(min)

const base = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FEATURE_BACKEND: flag,
  FEATURE_DEAN: flag,
})

const backend = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().startsWith('https://'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: secret(20),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: secret(10),
  SUPABASE_SERVICE_ROLE_KEY: secret(20),
  UPSTASH_REDIS_REST_URL: z.url().startsWith('https://'),
  UPSTASH_REDIS_REST_TOKEN: secret(20),
  TURNSTILE_SECRET_KEY: secret(10),
  RUN_SIGNING_SECRET: secret(32),
  IP_HASH_SALT: secret(16),
})

const dean = z.object({ ANTHROPIC_API_KEY: secret(20) })

export type ServerEnv = z.infer<typeof base> &
  Partial<z.infer<typeof backend>> &
  Partial<z.infer<typeof dean>>

/**
 * Validates process.env. Throws (listing variable NAMES only, never values) when a
 * feature tier is switched on without its variables, so a misconfigured deploy never boots.
 */
export function parseEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  const b = base.parse(source)
  const parts: z.ZodObject[] = []
  if (b.FEATURE_BACKEND) parts.push(backend)
  if (b.FEATURE_DEAN) {
    if (!b.FEATURE_BACKEND) throw new Error('FEATURE_DEAN=1 requires FEATURE_BACKEND=1')
    parts.push(dean)
  }
  let out: ServerEnv = b
  for (const schema of parts) {
    const r = schema.safeParse(source)
    if (!r.success) {
      const names = [...new Set(r.error.issues.map((i) => String(i.path[0])))].join(', ')
      throw new Error(`Invalid or missing environment variables: ${names}`)
    }
    out = { ...out, ...r.data }
  }
  return out
}

let cached: ServerEnv | undefined
export function env(): ServerEnv {
  return (cached ??= parseEnv())
}

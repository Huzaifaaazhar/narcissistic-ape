import { describe, expect, it, vi } from 'vitest'
vi.mock('server-only', () => ({}))
import { parseEnv } from './env'

const full = {
  FEATURE_BACKEND: '1',
  NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'a'.repeat(40),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAA',
  SUPABASE_SERVICE_ROLE_KEY: 's'.repeat(40),
  UPSTASH_REDIS_REST_URL: 'https://x.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 't'.repeat(30),
  TURNSTILE_SECRET_KEY: '0x4BBBBBBBBB',
  RUN_SIGNING_SECRET: 'r'.repeat(32),
  IP_HASH_SALT: 'h'.repeat(16),
}

describe('parseEnv', () => {
  it('boots with no backend vars when FEATURE_BACKEND is off', () => {
    expect(parseEnv({}).FEATURE_BACKEND).toBe(false)
  })
  it('refuses when backend is on and vars are missing, naming vars but not values', () => {
    const secret = 'super-secret-value-123456789'
    expect(() => parseEnv({ FEATURE_BACKEND: '1', SUPABASE_SERVICE_ROLE_KEY: secret })).toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
    try {
      parseEnv({ FEATURE_BACKEND: '1', SUPABASE_SERVICE_ROLE_KEY: secret })
    } catch (e) {
      expect((e as Error).message).not.toContain(secret)
    }
  })
  it('accepts a complete backend config', () => {
    expect(parseEnv(full).SUPABASE_SERVICE_ROLE_KEY).toHaveLength(40)
  })
  it('rejects non-https Supabase URLs and short signing secrets', () => {
    expect(() => parseEnv({ ...full, NEXT_PUBLIC_SUPABASE_URL: 'http://abc.supabase.co' })).toThrow(/SUPABASE_URL/)
    expect(() => parseEnv({ ...full, RUN_SIGNING_SECRET: 'short' })).toThrow(/RUN_SIGNING_SECRET/)
  })
  it('requires backend before the AI Dean', () => {
    expect(() => parseEnv({ FEATURE_DEAN: '1' })).toThrow(/FEATURE_BACKEND/)
    expect(() => parseEnv({ ...full, FEATURE_DEAN: '1' })).toThrow(/ANTHROPIC_API_KEY/)
  })
})

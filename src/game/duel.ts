import { z } from 'zod'
import { sanitiseNickname } from '@/lib/sanitise'

/**
 * Friend duels without a server: the link carries the seed and the challenger's result.
 * Anyone can edit a link, so duel scores are bragging rights between friends only; they
 * never feed a leaderboard (that waits for server-verified runs).
 */
const Payload = z.object({
  s: z.string().regex(/^[a-z0-9-]{4,32}$/),
  n: z.string().max(40),
  h: z.enum(['red', 'blue']),
  t: z.number().int().min(0).max(1000),
}).strict()

export type Duel = { seed: string; name: string; house: 'red' | 'blue'; total: number }

const b64url = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64url = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))

export function encodeDuel(d: Duel): string {
  return b64url(JSON.stringify({ s: d.seed, n: d.name, h: d.house, t: Math.round(d.total) }))
}

export function decodeDuel(code: string): Duel | null {
  if (!/^[A-Za-z0-9_-]{8,200}$/.test(code)) return null
  try {
    const p = Payload.safeParse(JSON.parse(unb64url(code)))
    if (!p.success) return null
    const name = sanitiseNickname(p.data.n)
    if (!name.ok) return null
    return { seed: p.data.s, name: name.value, house: p.data.h, total: p.data.t }
  } catch {
    return null
  }
}

/** Same seed for everyone on a calendar day (local date). */
export function dailySeed(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0')
  return `daily-${y}-${m}-${day}`
}

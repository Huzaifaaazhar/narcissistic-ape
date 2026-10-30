import { rng } from './rng'

/**
 * Penalty logic in goal space: x ∈ [-1, 1] post to post, y ∈ [0, 1] ground to crossbar.
 * Pure and deterministic per (seed, shot index) so a duel replays the same keeper.
 */
export type Shot = { x: number; y: number; power: number; curve: number }
export type Outcome = 'goal' | 'saved' | 'wide' | 'over'
export type ShotResult = { outcome: Outcome; points: number; corner: boolean; keeper: { x: number; y: number; read: boolean } }

export const SHOTS = 5
export const GOAL_POINTS = 100
export const CORNER_BONUS = 50
export const FOOTBALL_MAX = SHOTS * (GOAL_POINTS + CORNER_BONUS)

/** Chance the keeper reads your side, rising every shot. */
export const readChance = (i: number) => 0.2 + i * 0.12

export function isCorner(x: number, y: number) {
  return Math.abs(x) > 0.68 && (y > 0.58 || y < 0.24)
}

export function resolveShot(shot: Shot, index: number, seed: string): ShotResult {
  const r = rng(`pen:${seed}:${index}`)
  // the curve bends the ball late; where it actually arrives:
  const x = shot.x + shot.curve * 0.18
  const y = shot.y
  const read = r() < readChance(index)
  // the keeper commits to a third of the goal; reading means picking the right third
  const zone = (v: number) => (v < -0.33 ? -1 : v > 0.33 ? 1 : 0)
  const guess = read ? zone(x) : ([-1, 0, 1] as const)[Math.floor(r() * 3)]!
  const kx = guess * (0.55 + r() * 0.15)
  // soft shots give him time to adjust; hard ones don't
  const reach = 0.36 + (shot.power < 0.45 ? 0.25 : 0) - (shot.power > 0.85 ? 0.06 : 0)
  const reachY = guess === 0 ? 0.95 : 0.72
  const ky = guess === 0 ? 0.5 : Math.min(y, reachY)
  const keeper = { x: kx, y: ky, read }

  if (y > 1.0) return { outcome: 'over', points: 0, corner: false, keeper }
  if (Math.abs(x) > 1.0) return { outcome: 'wide', points: 0, corner: false, keeper }
  const saved = Math.abs(x - kx) < reach && y < reachY + (shot.power < 0.45 ? 0.15 : 0)
  if (saved) return { outcome: 'saved', points: 0, corner: false, keeper }
  const corner = isCorner(x, y)
  return { outcome: 'goal', points: GOAL_POINTS + (corner ? CORNER_BONUS : 0), corner, keeper }
}

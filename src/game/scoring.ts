import { ROUNDS, TOTAL_SCALE, roundMax, weights, type Round } from '@/config/scoring'

export type RoundScores = Partial<Record<Round, number>>

/** Normalised 0..1000 total. Missing rounds count as 0. Server-side source of truth (spec 5.4). */
export function totalScore(scores: RoundScores): number {
  let sum = 0
  for (const r of ROUNDS) {
    const raw = scores[r] ?? 0
    const clamped = Math.min(Math.max(raw, 0), roundMax[r])
    sum += (clamped / roundMax[r]) * weights[r]
  }
  return Math.round(sum * TOTAL_SCALE)
}

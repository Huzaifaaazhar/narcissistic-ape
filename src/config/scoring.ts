import { QUIZ_MAX } from '@/game/quiz'
import { HUNT_MAX } from '@/game/hunt'
import { FOOTBALL_MAX } from '@/game/football'
import { DANCE_MAX } from '@/game/dance'

export const ROUNDS = ['football', 'quiz', 'hunt', 'dance'] as const
export type Round = (typeof ROUNDS)[number]

/** Final total weights (spec 5.4). Must sum to 1. */
export const weights: Record<Round, number> = { football: 0.15, quiz: 0.3, hunt: 0.25, dance: 0.3 }

/** Raw score that maps to 1000 on the normalised scale, per round. */
export const roundMax: Record<Round, number> = {
  football: FOOTBALL_MAX, // 5 shots x (100 goal + 50 corner)
  quiz: QUIZ_MAX, // 10 answers, instant, full streak = 2626
  hunt: HUNT_MAX,
  dance: DANCE_MAX,
}

export const TOTAL_SCALE = 1000

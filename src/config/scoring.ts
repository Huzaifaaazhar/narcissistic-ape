export const ROUNDS = ['football', 'quiz', 'hunt', 'dance'] as const
export type Round = (typeof ROUNDS)[number]

/** Final total weights (spec 5.4). Must sum to 1. */
export const weights: Record<Round, number> = { football: 0.15, quiz: 0.3, hunt: 0.25, dance: 0.3 }

/** Raw score that maps to 1000 on the normalised scale, per round. */
export const roundMax: Record<Round, number> = {
  football: 750, // 5 shots x (100 goal + 50 corner)
  quiz: 3000, // 10 x 100 x 1.5 time x 2 streak
  hunt: 2500,
  dance: 2000,
}

export const TOTAL_SCALE = 1000

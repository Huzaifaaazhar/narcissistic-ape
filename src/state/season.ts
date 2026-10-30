'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Round } from '@/config/scoring'
import { totalScore } from '@/game/scoring'
import type { SeasonOutcome } from './progress'

export type RoundStats = Partial<Record<'goals' | 'corners' | 'correct' | 'lifelines' | 'firstTry' | 'hints' | 'maxCombo' | 'perfect', number>>
export type RoundResult = { score: number; detail: string; at: number; stats?: RoundStats }
export type RunMode = 'season' | 'daily' | 'duel'
export type DuelTarget = { name: string; house: 'red' | 'blue'; total: number }
export type PastRun = { total: number; at: number; scores: Partial<Record<Round, number>>; mode?: RunMode; seed?: string; duel?: DuelTarget }

type SeasonState = {
  runId: string | null
  seed: string | null
  mode: RunMode
  duel: DuelTarget | null
  results: Partial<Record<Round, RoundResult>>
  history: PastRun[]
  /** Rewards for the current run, set once at the finale so a refresh can't award twice. */
  award: SeasonOutcome | null
  setAward: (a: SeasonOutcome) => void
  /** Fresh run. Daily and duel runs pass a fixed seed so everyone gets the same game. */
  startRun: (opts?: { seed?: string; mode?: RunMode; duel?: DuelTarget }) => void
  record: (round: Round, score: number, detail: string, stats?: RoundStats) => void
  finishRun: () => PastRun | null
}

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()))

/**
 * Local-first season. One run = four rounds in any order, then the finale.
 * Scores live on this device until the server-authoritative version lands.
 */
export const useSeason = create<SeasonState>()(
  persist(
    (set, get) => ({
      runId: null,
      seed: null,
      mode: 'season',
      duel: null,
      results: {},
      history: [],
      award: null,
      setAward: (award) => set({ award }),
      startRun: (opts = {}) => {
        const id = newId()
        set({ runId: id, seed: opts.seed ?? id.slice(0, 8), mode: opts.mode ?? 'season', duel: opts.duel ?? null, results: {}, award: null })
      },
      record: (round, score, detail, stats) => {
        if (!get().runId) get().startRun()
        set((s) => ({ results: { ...s.results, [round]: { score: Math.max(0, Math.round(score)), detail, at: Date.now(), stats } } }))
      },
      finishRun: () => {
        const { results, history, mode, seed, duel } = get()
        const scores = Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v!.score])) as Partial<Record<Round, number>>
        if (Object.keys(scores).length < 4) return null
        const run: PastRun = { total: totalScore(scores), at: Date.now(), scores, mode, seed: seed ?? undefined, duel: duel ?? undefined }
        set({ history: [run, ...history].slice(0, 30), runId: null, seed: null, mode: 'season', duel: null, results: {}, award: null })
        return run
      },
    }),
    { name: 'sty-season', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)

'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Round } from '@/config/scoring'
import { totalScore } from '@/game/scoring'

export type RoundResult = { score: number; detail: string; at: number }
export type PastRun = { total: number; at: number; scores: Partial<Record<Round, number>> }

type SeasonState = {
  runId: string | null
  seed: string | null
  results: Partial<Record<Round, RoundResult>>
  history: PastRun[]
  startRun: () => void
  record: (round: Round, score: number, detail: string) => void
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
      results: {},
      history: [],
      startRun: () => {
        const id = newId()
        set({ runId: id, seed: id.slice(0, 8), results: {} })
      },
      record: (round, score, detail) => {
        if (!get().runId) get().startRun()
        set((s) => ({ results: { ...s.results, [round]: { score: Math.max(0, Math.round(score)), detail, at: Date.now() } } }))
      },
      finishRun: () => {
        const { results, history } = get()
        const scores = Object.fromEntries(Object.entries(results).map(([k, v]) => [k, v!.score])) as Partial<Record<Round, number>>
        if (Object.keys(scores).length < 4) return null
        const run: PastRun = { total: totalScore(scores), at: Date.now(), scores }
        set({ history: [run, ...history].slice(0, 20), runId: null, seed: null, results: {} })
        return run
      },
    }),
    { name: 'sty-season', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)

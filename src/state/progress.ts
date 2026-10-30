'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { EMPTY_STREAK, newAchievements, playToday, rollLocker, gradeFor, type AchievementId, type LockerItem, type RunFacts, type Streak } from '@/game/progress'

export type SeasonOutcome = { newAch: AchievementId[]; drop: LockerItem | null; usedFreeze: boolean; gradeUp: string | null; streak: number }

type ProgressState = {
  xp: number
  streak: Streak
  achievements: string[]
  owned: string[]
  dryRuns: number
  seasons: number
  /** Called once when a season is archived. Returns what to celebrate. */
  applySeason: (facts: Omit<RunFacts, 'seasonsPlayed' | 'streak'>, seed: string) => SeasonOutcome
  unlock: (id: AchievementId) => boolean
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: EMPTY_STREAK,
      achievements: [],
      owned: [],
      dryRuns: 0,
      seasons: 0,
      applySeason: (f, seed) => {
        const s = get()
        const { streak, usedFreeze } = playToday(s.streak)
        const seasons = s.seasons + 1
        const facts: RunFacts = { ...f, seasonsPlayed: seasons, streak: streak.current }
        const newAch = newAchievements(facts, s.achievements)
        const { item, rarity } = rollLocker(`${seed}:${seasons}`, s.owned, s.dryRuns)
        const before = gradeFor(s.xp).name
        const xp = s.xp + f.total
        const after = gradeFor(xp).name
        set({
          xp,
          streak,
          seasons,
          achievements: [...s.achievements, ...newAch],
          owned: item ? [...s.owned, item.id] : s.owned,
          dryRuns: rarity === 'common' ? s.dryRuns + 1 : 0,
        })
        return { newAch, drop: item, usedFreeze, gradeUp: after !== before ? after : null, streak: streak.current }
      },
      unlock: (id) => {
        if (get().achievements.includes(id)) return false
        set((s) => ({ achievements: [...s.achievements, id] }))
        return true
      },
    }),
    { name: 'sty-progress', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)

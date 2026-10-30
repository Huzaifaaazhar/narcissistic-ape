import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS, EMPTY_STREAK, LOCKER, PITY_AFTER, gradeFor, newAchievements, playToday, rollLocker, type RunFacts } from './progress'

const day = (d: number) => new Date(2026, 9, d, 15)

describe('streaks', () => {
  it('counts consecutive days and ignores replays on the same day', () => {
    let s = playToday(EMPTY_STREAK, day(1)).streak
    s = playToday(s, day(1)).streak
    s = playToday(s, day(2)).streak
    s = playToday(s, day(3)).streak
    expect(s.current).toBe(3)
    expect(s.best).toBe(3)
  })
  it('a one-day gap spends a Sick Note; a longer gap resets', () => {
    let s = playToday(EMPTY_STREAK, day(5)).streak // Monday-week starts the 5th
    const skip = playToday(s, day(7))
    expect(skip.usedFreeze).toBe(true)
    expect(skip.streak.current).toBe(2)
    s = playToday(skip.streak, day(11)).streak
    expect(s.current).toBe(1)
    expect(s.best).toBe(2)
  })
  it('only one Sick Note per week', () => {
    let s = playToday(EMPTY_STREAK, day(5)).streak
    s = playToday(s, day(7)).streak // uses the freeze
    const again = playToday(s, day(9))
    expect(again.usedFreeze).toBe(false)
    expect(again.streak.current).toBe(1)
  })
})

describe('grades', () => {
  it('maps xp to grade with progress', () => {
    expect(gradeFor(0).name).toBe('Freshman')
    expect(gradeFor(1500).name).toBe('Sophomore')
    expect(gradeFor(30000)).toMatchObject({ name: 'Legend', next: null, progress: 1 })
    expect(gradeFor(750).progress).toBeCloseTo(0.5)
  })
})

describe('achievements', () => {
  const base: RunFacts = { total: 500, mode: 'season', beatDuel: false, stats: {}, seasonsPlayed: 1, streak: 1, declined: false }
  it('unlocks once and only when earned', () => {
    expect(newAchievements(base, [])).toEqual(['first-season'])
    expect(newAchievements(base, ['first-season'])).toEqual([])
    const big = newAchievements({ ...base, total: 900, stats: { goals: 5, correct: 10, lifelines: 0 } }, ['first-season'])
    expect(big).toEqual(expect.arrayContaining(['golden-boot', 'topper', 'no-lifelines', 'head-prefect', 'soty']))
  })
  it('ids are unique', () => expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length))
})

describe('locker', () => {
  it('is deterministic, prefers unowned items, and pity guarantees rare+', () => {
    expect(rollLocker('a', [], 0)).toEqual(rollLocker('a', [], 0))
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      const r = rollLocker(seed, [], PITY_AFTER)
      expect(r.rarity).not.toBe('common')
    }
    const commons: string[] = LOCKER.filter((i) => i.rarity === 'common').map((i) => i.id)
    const r = rollLocker('x', commons, 0)
    expect(r.item && commons.includes(r.item.id)).toBe(false)
  })
  it('returns null once everything is owned', () => {
    expect(rollLocker('z', LOCKER.map((i) => i.id), 0).item).toBeNull()
  })
})

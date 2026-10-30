import { rng } from './rng'

/* ------------------------------------------------------------------ streaks */

export type Streak = { current: number; best: number; lastDay: string | null; freezes: number; freezeWeek: string | null }
export const EMPTY_STREAK: Streak = { current: 0, best: 0, lastDay: null, freezes: 1, freezeWeek: null }

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const weekKey = (d: Date) => {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  t.setDate(t.getDate() - ((t.getDay() + 6) % 7)) // Monday
  return dayKey(t)
}
const daysBetween = (a: string, b: string) => Math.round((new Date(b + 'T12:00').getTime() - new Date(a + 'T12:00').getTime()) / 86_400_000)

/**
 * "Perfect Attendance": playing on consecutive days builds the streak. Missing exactly one day
 * spends a Sick Note (one is granted each week) instead of resetting. Never shames; just counts.
 */
export function playToday(s: Streak, now = new Date()): { streak: Streak; usedFreeze: boolean } {
  const today = dayKey(now)
  const week = weekKey(now)
  let freezes = s.freezeWeek === week ? s.freezes : Math.max(s.freezes, 1)
  if (s.lastDay === today) return { streak: { ...s, freezes, freezeWeek: week }, usedFreeze: false }
  let current = 1
  let usedFreeze = false
  if (s.lastDay) {
    const gap = daysBetween(s.lastDay, today)
    if (gap === 1) current = s.current + 1
    else if (gap === 2 && freezes > 0) {
      current = s.current + 1
      freezes -= 1
      usedFreeze = true
    }
  }
  return { streak: { current, best: Math.max(s.best, current), lastDay: today, freezes, freezeWeek: week }, usedFreeze }
}

/* ------------------------------------------------------------------ XP and grades */

export const GRADES = [
  { name: 'Freshman', xp: 0 },
  { name: 'Sophomore', xp: 1500 },
  { name: 'Junior', xp: 4000 },
  { name: 'Senior', xp: 8000 },
  { name: 'Head Prefect', xp: 14000 },
  { name: 'Legend', xp: 22000 },
] as const

export function gradeFor(xp: number) {
  let i = 0
  while (i + 1 < GRADES.length && xp >= GRADES[i + 1]!.xp) i++
  const next = GRADES[i + 1]
  return { index: i, name: GRADES[i]!.name, next: next?.name ?? null, progress: next ? (xp - GRADES[i]!.xp) / (next.xp - GRADES[i]!.xp) : 1 }
}

/* ------------------------------------------------------------------ achievements */

export type RunFacts = {
  total: number
  mode: 'season' | 'daily' | 'duel'
  beatDuel: boolean
  stats: { goals?: number; corners?: number; correct?: number; lifelines?: number; firstTry?: number; hints?: number; maxCombo?: number; perfect?: number }
  seasonsPlayed: number
  streak: number
  declined: boolean
}

export const ACHIEVEMENTS = [
  { id: 'first-season', name: 'Enrolled and Survived', desc: 'Finish your first season.', test: (f: RunFacts) => f.seasonsPlayed >= 1 },
  { id: 'golden-boot', name: 'Golden Boot', desc: 'Score all five penalties.', test: (f: RunFacts) => f.stats.goals === 5 },
  { id: 'top-bins', name: 'Top Bins', desc: 'Hit three corner bonuses in one match.', test: (f: RunFacts) => (f.stats.corners ?? 0) >= 3 },
  { id: 'topper', name: 'Topper', desc: 'Get all ten quiz questions right.', test: (f: RunFacts) => f.stats.correct === 10 },
  { id: 'no-lifelines', name: 'No Help Needed', desc: 'Get 8+ quiz answers right without a lifeline.', test: (f: RunFacts) => (f.stats.correct ?? 0) >= 8 && f.stats.lifelines === 0 },
  { id: 'sherlock', name: 'Campus Sherlock', desc: 'Find all five hunt places on the first try.', test: (f: RunFacts) => f.stats.firstTry === 5 },
  { id: 'no-hints', name: 'Map in My Head', desc: 'Finish the hunt without a hint.', test: (f: RunFacts) => f.stats.hints === 0 },
  { id: 'dance-machine', name: 'Dance Machine', desc: 'Reach a 40-note combo.', test: (f: RunFacts) => (f.stats.maxCombo ?? 0) >= 40 },
  { id: 'head-prefect', name: 'Head Prefect', desc: 'Finish a season with 700+.', test: (f: RunFacts) => f.total >= 700 },
  { id: 'soty', name: 'Student of the Year', desc: 'Finish a season with 850+.', test: (f: RunFacts) => f.total >= 850 },
  { id: 'attendance', name: 'Perfect Attendance', desc: 'Play three days in a row.', test: (f: RunFacts) => f.streak >= 3 },
  { id: 'early-bird', name: 'Daily Regular', desc: 'Finish a daily challenge.', test: (f: RunFacts) => f.mode === 'daily' },
  { id: 'duelist', name: 'Challenge Accepted', desc: 'Beat a friend in a duel.', test: (f: RunFacts) => f.beatDuel },
  { id: 'humble-legend', name: 'Humble Legend', desc: 'Decline the trophy. Somehow.', test: (f: RunFacts) => f.declined },
] as const

export type AchievementId = (typeof ACHIEVEMENTS)[number]['id']

export function newAchievements(f: RunFacts, have: readonly string[]): AchievementId[] {
  return ACHIEVEMENTS.filter((a) => !have.includes(a.id) && a.test(f)).map((a) => a.id)
}

/* ------------------------------------------------------------------ locker rewards */

export type Rarity = 'common' | 'rare' | 'legendary'
export const LOCKER = [
  { id: 'pennant-red', name: 'Red House pennant', kind: 'Pennant', rarity: 'common', icon: 'pennant' },
  { id: 'pennant-blue', name: 'Blue House pennant', kind: 'Pennant', rarity: 'common', icon: 'pennant' },
  { id: 'sticker-chai', name: 'Cutting chai sticker', kind: 'Locker sticker', rarity: 'common', icon: 'coffee' },
  { id: 'sticker-ball', name: 'Muddy football sticker', kind: 'Locker sticker', rarity: 'common', icon: 'football' },
  { id: 'sticker-note', name: 'Mixtape sticker', kind: 'Locker sticker', rarity: 'common', icon: 'music' },
  { id: 'patch-star', name: 'Gold star patch', kind: 'Jacket patch', rarity: 'common', icon: 'star' },
  { id: 'patch-key', name: 'Master key patch', kind: 'Jacket patch', rarity: 'rare', icon: 'key' },
  { id: 'patch-crest', name: 'House crest patch', kind: 'Jacket patch', rarity: 'rare', icon: 'crest' },
  { id: 'patch-megaphone', name: 'Cheer captain patch', kind: 'Jacket patch', rarity: 'rare', icon: 'megaphone' },
  { id: 'plate-walnut', name: 'Walnut trophy plinth', kind: 'Trophy style', rarity: 'rare', icon: 'trophy' },
  { id: 'confetti-gold', name: 'Gold confetti', kind: 'Celebration', rarity: 'rare', icon: 'flame' },
  { id: 'whistle-ref', name: 'Referee’s whistle', kind: 'Keepsake', rarity: 'legendary', icon: 'whistle' },
  { id: 'medal-founder', name: 'Founder’s medal', kind: 'Keepsake', rarity: 'legendary', icon: 'medal' },
  { id: 'scroll-charter', name: 'The original college charter', kind: 'Keepsake', rarity: 'legendary', icon: 'scroll' },
] as const satisfies readonly { id: string; name: string; kind: string; rarity: Rarity; icon: string }[]

export type LockerItem = (typeof LOCKER)[number]
export const PITY_AFTER = 5

/**
 * One drop per finished season: 70% common / 25% rare / 5% legendary, rerolled toward items
 * you don't own. After PITY_AFTER seasons without a rare or better, the next drop is rare+.
 */
export function rollLocker(seed: string, owned: readonly string[], dryRuns: number): { item: LockerItem | null; rarity: Rarity } {
  const r = rng(`locker:${seed}`)
  const x = r()
  let rarity: Rarity = x < 0.05 ? 'legendary' : x < 0.3 ? 'rare' : 'common'
  if (dryRuns >= PITY_AFTER && rarity === 'common') rarity = 'rare'
  const order: Rarity[] = rarity === 'legendary' ? ['legendary', 'rare', 'common'] : rarity === 'rare' ? ['rare', 'legendary', 'common'] : ['common', 'rare', 'legendary']
  for (const tier of order) {
    const pool = LOCKER.filter((i) => i.rarity === tier && !owned.includes(i.id))
    if (pool.length) return { item: pool[Math.floor(r() * pool.length)]!, rarity: tier }
  }
  return { item: null, rarity }
}

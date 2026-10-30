import { rng } from './rng'

export type Note = { t: number; lane: 0 | 1 | 2 | 3 }
export type Judgement = 'perfect' | 'great' | 'ok' | 'miss'

export const BPM = 116
export const LEAD_IN_BEATS = 4
export const BARS = 26 // ≈ 54 s of play at 116 BPM
export const WINDOWS = { perfect: 0.045, great: 0.09, ok: 0.15 } as const
export const BASE: Record<Exclude<Judgement, 'miss'>, number> = { perfect: 300, great: 200, ok: 100 }
export const DANCE_MAX = 2000

const beat = 60 / BPM

/**
 * Seeded chart. Density ramps up through the song (goal gradient): quarter notes, then
 * eighth-note runs, then doubles near the end. Times are seconds from song start.
 */
export function makeChart(seed: string): Note[] {
  const r = rng(`dance:${seed}`)
  const notes: Note[] = []
  let last = 1
  const lane = (): Note['lane'] => {
    let l = Math.floor(r() * 4)
    if (l === last && r() < 0.6) l = (l + 1 + Math.floor(r() * 3)) % 4
    last = l
    return l as Note['lane']
  }
  for (let bar = 0; bar < BARS; bar++) {
    const phase = bar / BARS
    for (let b = 0; b < 4; b++) {
      const t = (LEAD_IN_BEATS + bar * 4 + b) * beat
      // breathe every 8th bar
      if (bar % 8 === 7 && b >= 2) continue
      if (phase < 0.25) {
        if (b % 2 === 0 || r() < 0.5) notes.push({ t, lane: lane() })
      } else if (phase < 0.6) {
        notes.push({ t, lane: lane() })
        if (r() < 0.35) notes.push({ t: t + beat / 2, lane: lane() })
      } else {
        notes.push({ t, lane: lane() })
        if (r() < 0.55) notes.push({ t: t + beat / 2, lane: lane() })
        if (b === 0 && r() < 0.5) {
          const a = lane()
          notes.push({ t, lane: ((a + 2) % 4) as Note['lane'] })
        }
      }
    }
  }
  return dedupe(notes.sort((a, b) => a.t - b.t || a.lane - b.lane))
}

function dedupe(ns: Note[]) {
  return ns.filter((n, i) => !ns.slice(0, i).some((m) => m.lane === n.lane && Math.abs(m.t - n.t) < 0.001))
}

export function songLength() {
  return (LEAD_IN_BEATS + BARS * 4 + 2) * beat
}

export function judge(deltaSeconds: number): Judgement {
  const d = Math.abs(deltaSeconds)
  if (d <= WINDOWS.perfect) return 'perfect'
  if (d <= WINDOWS.great) return 'great'
  if (d <= WINDOWS.ok) return 'ok'
  return 'miss'
}

/** Combo multiplier ramps from ×1 to ×2 over 40 consecutive hits. */
export function points(j: Judgement, comboBefore: number) {
  if (j === 'miss') return 0
  return Math.round(BASE[j] * (1 + Math.min(comboBefore, 40) / 40))
}

export function maxPoints(chart: Note[]) {
  return chart.reduce((sum, _, i) => sum + points('perfect', i), 0)
}

/** Round score on the 0..DANCE_MAX scale. */
export function danceScore(raw: number, chart: Note[]) {
  return Math.round((DANCE_MAX * raw) / maxPoints(chart))
}

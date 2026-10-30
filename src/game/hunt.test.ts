import { describe, expect, it } from 'vitest'
import { CLUES, HUNT_CLUES, HUNT_MAX, PLACES, locationPoints, pickHunt, puzzlePoints } from './hunt'

describe('hunt', () => {
  it('every place has at least two clues', () => {
    for (const p of Object.keys(PLACES)) expect(CLUES.filter((c) => c.place === p).length, p).toBeGreaterThanOrEqual(2)
  })
  it('picks five distinct places deterministically, all three puzzle kinds', () => {
    const a = pickHunt('s1')
    expect(a.map((x) => x.text)).toEqual(pickHunt('s1').map((x) => x.text))
    expect(new Set(a.map((x) => x.place)).size).toBe(HUNT_CLUES)
    expect(new Set(a.map((x) => x.puzzle))).toEqual(new Set(['unscramble', 'memory', 'odd']))
  })
  it('puzzles are solvable', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      for (const s of pickHunt(seed)) {
        expect([...s.scrambled].sort()).toEqual(s.word.split('').sort())
        expect(s.scrambled.join('')).not.toBe(s.word)
        const counts = s.memory.reduce<Record<string, number>>((m, k) => ({ ...m, [k]: (m[k] ?? 0) + 1 }), {})
        expect(Object.values(counts).every((n) => n === 2)).toBe(true)
        expect(s.odd.index).toBeGreaterThanOrEqual(0)
        expect(s.odd.index).toBeLessThan(9)
      }
    }
  })
  it('scores', () => {
    expect([locationPoints(0), locationPoints(1), locationPoints(4)]).toEqual([300, 150, 50])
    expect(puzzlePoints(0)).toBe(200)
    expect(puzzlePoints(60)).toBe(150)
    expect(HUNT_MAX).toBe(2500)
  })
})

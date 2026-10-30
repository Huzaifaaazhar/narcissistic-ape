import { describe, expect, it } from 'vitest'
import { dailySeed, decodeDuel, encodeDuel } from './duel'

describe('duel links', () => {
  it('round-trips', () => {
    const d = { seed: 'abc12345', name: 'Zara K', house: 'red' as const, total: 734 }
    expect(decodeDuel(encodeDuel(d))).toEqual(d)
  })
  it('rejects junk, out-of-range scores, bad seeds and abusive or markup names', () => {
    expect(decodeDuel('!!!')).toBeNull()
    expect(decodeDuel('aGVsbG8gd29ybGQ')).toBeNull()
    expect(decodeDuel(encodeDuel({ seed: 'abc12345', name: 'Zara', house: 'red', total: 5000 }))).toBeNull()
    expect(decodeDuel(encodeDuel({ seed: '../etc', name: 'Zara', house: 'red', total: 10 }))).toBeNull()
    expect(decodeDuel(encodeDuel({ seed: 'abc12345', name: '<script>', house: 'red', total: 10 }))).toBeNull()
    expect(decodeDuel(encodeDuel({ seed: 'abc12345', name: 'admin', house: 'red', total: 10 }))).toBeNull()
  })
  it('daily seed is per local date', () => {
    expect(dailySeed(new Date(2026, 9, 30))).toBe('daily-2026-10-30')
  })
})

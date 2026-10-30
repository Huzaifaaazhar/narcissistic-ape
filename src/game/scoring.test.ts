import { describe, expect, it } from 'vitest'
import { totalScore } from './scoring'
import { weights, roundMax } from '@/config/scoring'

describe('totalScore', () => {
  it('weights sum to 1', () => {
    expect(Object.values(weights).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
  })
  it('perfect run scores 1000', () => {
    expect(totalScore({ ...roundMax })).toBe(1000)
  })
  it('empty run scores 0', () => {
    expect(totalScore({})).toBe(0)
  })
  it('clamps out-of-range and negative raw scores', () => {
    expect(totalScore({ quiz: 1e9, football: -50 })).toBe(300)
  })
})

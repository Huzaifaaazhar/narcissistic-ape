import { describe, expect, it } from 'vitest'
import { rng } from './rng'

describe('rng', () => {
  it('is deterministic per seed', () => {
    const a = rng('duel-abc'), b = rng('duel-abc')
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('differs across seeds and stays in [0,1)', () => {
    const a = rng('x'), b = rng('y')
    const xs = Array.from({ length: 1000 }, a)
    expect(xs.every((v) => v >= 0 && v < 1)).toBe(true)
    expect(a()).not.toBe(b())
  })
})

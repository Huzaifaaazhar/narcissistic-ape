import { describe, expect, it } from 'vitest'
import { FOOTBALL_MAX, isCorner, readChance, resolveShot } from './football'

describe('resolveShot', () => {
  it('misses: over the bar and wide', () => {
    expect(resolveShot({ x: 0.2, y: 1.2, power: 0.7, curve: 0 }, 0, 's').outcome).toBe('over')
    expect(resolveShot({ x: 1.3, y: 0.5, power: 0.7, curve: 0 }, 0, 's').outcome).toBe('wide')
  })
  it('curve can bring a wide shot back in', () => {
    expect(resolveShot({ x: 1.08, y: 0.4, power: 0.7, curve: -1 }, 0, 's').outcome).not.toBe('wide')
  })
  it('top corners are unsaveable at full power', () => {
    for (let i = 0; i < 5; i++) for (const s of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const res = resolveShot({ x: 0.92, y: 0.9, power: 0.9, curve: 0 }, i, s)
      expect(res.outcome).toBe('goal')
      expect(res.points).toBe(150)
    }
  })
  it('a soft shot down the middle is usually saved when read', () => {
    const outcomes = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((s) => resolveShot({ x: 0, y: 0.3, power: 0.3, curve: 0 }, 4, s).outcome)
    expect(outcomes.filter((o) => o === 'saved').length).toBeGreaterThan(2)
  })
  it('is deterministic and the keeper gets sharper', () => {
    const a = resolveShot({ x: -0.5, y: 0.4, power: 0.6, curve: 0.2 }, 2, 'z')
    expect(resolveShot({ x: -0.5, y: 0.4, power: 0.6, curve: 0.2 }, 2, 'z')).toEqual(a)
    expect(readChance(4)).toBeGreaterThan(readChance(0))
  })
  it('corner zones and max', () => {
    expect(isCorner(0.8, 0.8)).toBe(true)
    expect(isCorner(0.8, 0.1)).toBe(true)
    expect(isCorner(0.2, 0.9)).toBe(false)
    expect(FOOTBALL_MAX).toBe(750)
  })
})

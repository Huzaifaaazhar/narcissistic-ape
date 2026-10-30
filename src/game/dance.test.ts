import { describe, expect, it } from 'vitest'
import { DANCE_MAX, danceScore, judge, makeChart, maxPoints, points, songLength } from './dance'

describe('dance', () => {
  it('chart is deterministic, sorted, ramps in density and fits the song', () => {
    const c = makeChart('s')
    expect(c).toEqual(makeChart('s'))
    expect(c.every((n, i) => i === 0 || n.t >= c[i - 1]!.t)).toBe(true)
    expect(c[c.length - 1]!.t).toBeLessThan(songLength())
    const third = songLength() / 3
    const early = c.filter((n) => n.t < third).length
    const late = c.filter((n) => n.t > 2 * third).length
    expect(late).toBeGreaterThan(early)
    expect(c.length).toBeGreaterThan(80)
  })
  it('never stacks two notes in one lane at the same time', () => {
    const c = makeChart('t')
    const keys = c.map((n) => `${n.lane}:${n.t.toFixed(3)}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
  it('judges timing windows', () => {
    expect(judge(0.01)).toBe('perfect')
    expect(judge(-0.07)).toBe('great')
    expect(judge(0.14)).toBe('ok')
    expect(judge(0.2)).toBe('miss')
  })
  it('scores with a capped combo multiplier and normalises to DANCE_MAX', () => {
    expect(points('perfect', 0)).toBe(300)
    expect(points('perfect', 40)).toBe(600)
    expect(points('perfect', 400)).toBe(600)
    expect(points('miss', 10)).toBe(0)
    const c = makeChart('u')
    expect(danceScore(maxPoints(c), c)).toBe(DANCE_MAX)
  })
})

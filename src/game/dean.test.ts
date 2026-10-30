import { describe, expect, it } from 'vitest'
import { deanVerdict, grade } from './dean'

describe('dean', () => {
  it('fills name and house, picks by band, deterministic', () => {
    const v = deanVerdict(900, 'Zara K', 'red', 's')
    expect(v).toContain('Zara K')
    expect(v).not.toContain('{')
    expect(deanVerdict(900, 'Zara K', 'red', 's')).toBe(v)
    expect(deanVerdict(10, 'A', 'blue', 'x')).toMatch(/Blue House|A/)
  })
  it('grades', () => {
    expect([grade(900), grade(720), grade(510), grade(320), grade(0)]).toEqual(['Student of the Year', 'Head Prefect', 'House Captain', 'Rising Senior', 'Freshman'])
  })
})

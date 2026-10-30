import { describe, expect, it } from 'vitest'
import { decideTier, type DeviceInfo } from './quality'

const desk: DeviceInfo = { webgl: true, reducedMotion: false, cores: 8, mobile: false, saveData: false }
describe('decideTier', () => {
  it('desktop auto → high', () => expect(decideTier(desk, 'auto')).toBe('high'))
  it('no WebGL / reduced motion / save-data → poster regardless of pref', () => {
    expect(decideTier({ ...desk, webgl: false }, 'high')).toBe('poster')
    expect(decideTier({ ...desk, reducedMotion: true }, 'high')).toBe('poster')
    expect(decideTier({ ...desk, saveData: true }, 'auto')).toBe('poster')
  })
  it('low-end phone auto → poster, mid phone → low', () => {
    expect(decideTier({ ...desk, mobile: true, cores: 4 }, 'auto')).toBe('poster')
    expect(decideTier({ ...desk, mobile: true, cores: 8 }, 'auto')).toBe('low')
  })
  it('explicit preference wins when capable', () => {
    expect(decideTier({ ...desk, mobile: true, cores: 4 }, 'low')).toBe('low')
    expect(decideTier(desk, 'low')).toBe('low')
  })
})

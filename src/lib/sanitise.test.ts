import { describe, expect, it } from 'vitest'
import { sanitiseNickname } from './sanitise'

const ok = (s: string) => sanitiseNickname(s)
describe('sanitiseNickname', () => {
  it('accepts normal names and trims/collapses spaces', () => {
    expect(ok('  Zara   K ')).toEqual({ ok: true, value: 'Zara K' })
    expect(ok('Library_Ghost')).toEqual({ ok: true, value: 'Library_Ghost' })
    expect(ok('Ayeša')).toMatchObject({ ok: true })
  })
  it('enforces length 3–16 by characters', () => {
    expect(ok('ab')).toEqual({ ok: false, error: 'too_short' })
    expect(ok('a'.repeat(17))).toEqual({ ok: false, error: 'too_long' })
  })
  it('rejects markup and punctuation', () => {
    expect(ok('<script>')).toEqual({ ok: false, error: 'bad_chars' })
    expect(ok("x' OR 1=1")).toEqual({ ok: false, error: 'bad_chars' })
  })
  it('strips zero-width and bidi controls before checking', () => {
    expect(ok('ad​min')).toEqual({ ok: false, error: 'reserved' })
    expect(ok('Ali‮khan')).toEqual({ ok: true, value: 'Alikhan' })
    expect(ok('​​ab')).toEqual({ ok: false, error: 'too_short' })
  })
  it('NFKC folds fullwidth lookalikes', () => {
    expect(ok('ａｄｍｉｎ')).toEqual({ ok: false, error: 'reserved' })
  })
  it('blocks reserved names incl. spacing and leet', () => {
    for (const n of ['Admin', 'the dean', 'D3an', 'M_o_d']) expect(ok(n)).toEqual({ ok: false, error: 'reserved' })
  })
  it('blocks English and romanised Urdu/Hindi abuse incl. leet and repeats', () => {
    for (const n of ['fuuuck you', 'sh1t head', 'Chutiya', 'bh0sdk', 'madarchod', 'g4andu']) {
      expect(ok(n)).toMatchObject({ ok: false })
    }
  })
  it('does not over-block innocent names', () => {
    for (const n of ['Lunar', 'Kyser', 'Sussex Kid', 'Hassan', 'Ghalib']) {
      expect(ok(n), n).toMatchObject({ ok: true })
    }
  })
  it('accepts the known Scunthorpe trade-off (substring stems may over-block)', () => {
    // Documented in docs/DECISIONS.md: for public nicknames we prefer false positives.
    expect(ok('Scunthorpe')).toMatchObject({ ok: false })
  })
})

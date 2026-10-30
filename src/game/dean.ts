import type { House } from '@/config/brand'
import { rng } from './rng'

/**
 * Canned Dean verdicts (the AI Dean comes later; these are also its fallback).
 * Plain text only; the nickname is inserted as data and rendered as text.
 */
const BANDS: { min: number; lines: string[] }[] = [
  { min: 850, lines: [
    '{name}, I have signed a lot of certificates. This is the first one I wanted to frame.',
    'Legendary, {name}. {house} will be telling this story at every reunion.',
  ] },
  { min: 700, lines: [
    'Seriously impressive, {name}. The trophy cabinet is clearing a shelf.',
    '{name}, that was the kind of season prospectuses are written about.',
  ] },
  { min: 500, lines: [
    'Solid work, {name}. {house} is proud, and slightly nervous about next year’s rivals.',
    'Good season, {name}. A little more practice and that plate is yours for keeps.',
  ] },
  { min: 300, lines: [
    'Respectable, {name}. You showed up, you competed, and nobody was sent to detention.',
    '{name}, there is talent here. There is also a library. Use both.',
  ] },
  { min: 0, lines: [
    'Beta, focus. Every legend at {house} started somewhere, {name}.',
    'Rough season, {name}. The canteen has samosas and second chances. Come back stronger.',
  ] },
]

export function deanVerdict(total: number, name: string, house: House, seed: string) {
  const band = BANDS.find((b) => total >= b.min)!
  const line = band.lines[Math.floor(rng(`dean:${seed}`)() * band.lines.length)]!
  return line.replaceAll('{name}', name).replaceAll('{house}', house === 'red' ? 'Red House' : 'Blue House')
}

export function grade(total: number) {
  return total >= 850 ? 'Student of the Year' : total >= 700 ? 'Head Prefect' : total >= 500 ? 'House Captain' : total >= 300 ? 'Rising Senior' : 'Freshman'
}

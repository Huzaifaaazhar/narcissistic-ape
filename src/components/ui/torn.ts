import { rng } from '@/game/rng'

/**
 * Deterministic torn-paper outline as a CSS polygon (percent units, so it scales with the box).
 * Same seed → same edge on server and client, so no hydration mismatch.
 */
export function tornPolygon(seed: string, opts: { depth?: number; steps?: number } = {}): string {
  const r = rng(seed)
  const depth = opts.depth ?? 1.6 // % of box: how far the tear bites in
  const steps = opts.steps ?? 34
  const jag = () => (r() * 0.7 + r() * 0.3) * depth
  const pts: string[] = []
  // top edge: left → right
  for (let i = 0; i <= steps; i++) pts.push(`${((i / steps) * 100).toFixed(2)}% ${jag().toFixed(2)}%`)
  // right edge: top → bottom (side tears are shallower)
  for (let i = 1; i < steps / 3; i++) pts.push(`${(100 - jag() * 0.45).toFixed(2)}% ${((i / (steps / 3)) * 100).toFixed(2)}%`)
  // bottom edge: right → left
  for (let i = steps; i >= 0; i--) pts.push(`${((i / steps) * 100).toFixed(2)}% ${(100 - jag()).toFixed(2)}%`)
  // left edge: bottom → top
  for (let i = Math.ceil(steps / 3) - 1; i > 0; i--) pts.push(`${(jag() * 0.45).toFixed(2)}% ${((i / (steps / 3)) * 100).toFixed(2)}%`)
  return `polygon(${pts.join(', ')})`
}

/** Small seeded tilt in degrees within ±max. */
export function tilt(seed: string, max = 0.6): number {
  return Number(((rng(seed + ':tilt')() * 2 - 1) * max).toFixed(2))
}

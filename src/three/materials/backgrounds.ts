import * as THREE from 'three'

/** Screen-space radial glow for viewer backgrounds. Outer colour should match the fog. */
export function glowBackground(inner: string, outer: string, cy = 0.42) {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = outer
  ctx.fillRect(0, 0, 64, 128)
  ctx.setTransform(1, 0, 0, 2, 0, 0)
  const g = ctx.createRadialGradient(32, 64 * cy, 0, 32, 64 * cy, 40)
  g.addColorStop(0, inner)
  g.addColorStop(1, outer)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

import * as THREE from 'three'
import { rng } from '@/game/rng'

/**
 * Procedural texture kit. Everything is generated on the client from a seed, so the 3D
 * scenes ship with zero image downloads. Colour maps are tagged sRGB; data maps stay linear.
 */

type Ctx = CanvasRenderingContext2D

function canvas(w: number, h = w): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d', { willReadFrequently: true })!]
}

function tex(c: HTMLCanvasElement, opts: { srgb?: boolean; repeat?: [number, number]; aniso?: number } = {}) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = opts.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  if (opts.repeat) t.repeat.set(...opts.repeat)
  t.anisotropy = opts.aniso ?? 4
  t.needsUpdate = true
  return t
}

/** Tileable value noise, `octaves` layered, returned as Float32 0..1. */
function valueNoise(size: number, seed: string, cells = 8, octaves = 4): Float32Array {
  const out = new Float32Array(size * size)
  let amp = 1
  let total = 0
  for (let o = 0; o < octaves; o++) {
    const n = cells << o
    const r = rng(`${seed}:${o}`)
    const grid = Float32Array.from({ length: n * n }, () => r())
    for (let y = 0; y < size; y++) {
      const gy = (y / size) * n
      const y0 = Math.floor(gy), ty = gy - y0
      const sy = ty * ty * (3 - 2 * ty)
      for (let x = 0; x < size; x++) {
        const gx = (x / size) * n
        const x0 = Math.floor(gx), tx = gx - x0
        const sx = tx * tx * (3 - 2 * tx)
        const a = grid[(y0 % n) * n + (x0 % n)]!
        const b = grid[(y0 % n) * n + ((x0 + 1) % n)]!
        const c = grid[((y0 + 1) % n) * n + (x0 % n)]!
        const d = grid[((y0 + 1) % n) * n + ((x0 + 1) % n)]!
        out[y * size + x]! += amp * (a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy)
      }
    }
    total += amp
    amp *= 0.5
  }
  for (let i = 0; i < out.length; i++) out[i]! /= total
  return out
}

function grayToCanvas(data: Float32Array, size: number, map: (v: number) => number): HTMLCanvasElement {
  const [c, ctx] = canvas(size)
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < data.length; i++) {
    const v = Math.max(0, Math.min(255, map(data[i]!) * 255))
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v
    img.data[i * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c
}

/** Height (grey canvas) → tangent-space normal map. */
function heightToNormal(src: HTMLCanvasElement, strength = 2): HTMLCanvasElement {
  const w = src.width, h = src.height
  const s = src.getContext('2d')!.getImageData(0, 0, w, h).data
  const [c, ctx] = canvas(w, h)
  const img = ctx.createImageData(w, h)
  const H = (x: number, y: number) => s[(((y + h) % h) * w + ((x + w) % w)) * 4]! / 255
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const i = (y * w + x) * 4
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return c
}

/** Roughness map: base ± noise, plus optional fine directional scratches (micro-imperfection). */
export function roughnessMap(
  seed: string,
  base: number,
  spread: number,
  opts: { size?: number; scratches?: number; scratchLength?: number; scratchAlpha?: number; repeat?: [number, number] } = {},
) {
  const size = opts.size ?? 256
  const n = valueNoise(size, seed, 4, 5)
  const c = grayToCanvas(n, size, (v) => base + (v - 0.5) * 2 * spread)
  if (opts.scratches) {
    const ctx = c.getContext('2d')!
    const r = rng(seed + ':scr')
    ctx.lineCap = 'round'
    for (let i = 0; i < opts.scratches; i++) {
      const x = r() * size, y = r() * size, a = r() * Math.PI, l = 3 + r() * (opts.scratchLength ?? 40)
      ctx.strokeStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${(opts.scratchAlpha ?? 0.12) * (0.4 + r())})`
      ctx.lineWidth = 0.6 + r() * 0.8
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l)
      ctx.stroke()
    }
  }
  return tex(c, { repeat: opts.repeat })
}

/**
 * Locker door: seams, louvred vents top/bottom, handle recess, number-plate inset.
 * Returns a normal map + roughness map (scuffs near the handle, fingerprints).
 */
export function lockerMaps() {
  const W = 256, H = 768
  const [hc, h] = canvas(W, H)
  h.fillStyle = '#808080'
  h.fillRect(0, 0, W, H)
  // door edge bevel (raised panel)
  const g = h.createLinearGradient(0, 0, 14, 0)
  g.addColorStop(0, '#202020'); g.addColorStop(1, '#808080')
  h.fillStyle = g; h.fillRect(0, 0, 14, H)
  const g2 = h.createLinearGradient(W - 14, 0, W, 0)
  g2.addColorStop(0, '#808080'); g2.addColorStop(1, '#202020')
  h.fillStyle = g2; h.fillRect(W - 14, 0, 14, H)
  h.fillStyle = '#202020'; h.fillRect(0, 0, W, 6); h.fillRect(0, H - 6, W, 6)
  // louvres
  const louvre = (y0: number) => {
    for (let i = 0; i < 6; i++) {
      const y = y0 + i * 16
      const lg = h.createLinearGradient(0, y, 0, y + 10)
      lg.addColorStop(0, '#1a1a1a'); lg.addColorStop(0.5, '#3a3a3a'); lg.addColorStop(1, '#d0d0d0')
      h.fillStyle = lg
      h.beginPath(); h.roundRect(52, y, W - 104, 10, 5); h.fill()
    }
  }
  louvre(60); louvre(H - 170)
  // number plate inset
  h.fillStyle = '#5a5a5a'; h.beginPath(); h.roundRect(W / 2 - 34, 178, 68, 30, 4); h.fill()
  h.fillStyle = '#9a9a9a'; h.beginPath(); h.roundRect(W / 2 - 30, 182, 60, 22, 3); h.fill()
  // handle recess
  h.fillStyle = '#3a3a3a'; h.beginPath(); h.roundRect(W - 62, H / 2 - 50, 22, 100, 10); h.fill()
  const normal = tex(heightToNormal(hc, 3.2), { aniso: 8 })

  const rough = roughnessMap('locker', 0.38, 0.1, { size: 256, scratches: 70 })
  // scuffs round the handle where hands go
  const rc = rough.image as HTMLCanvasElement
  const rctx = rc.getContext('2d')!
  const sg = rctx.createRadialGradient(W * 0.78, 128, 2, W * 0.78, 128, 60)
  sg.addColorStop(0, 'rgba(255,255,255,0.22)'); sg.addColorStop(1, 'rgba(255,255,255,0)')
  rctx.fillStyle = sg; rctx.fillRect(0, 0, 256, 256)
  rough.needsUpdate = true
  rough.wrapS = rough.wrapT = THREE.ClampToEdgeWrapping
  normal.wrapS = normal.wrapT = THREE.ClampToEdgeWrapping
  return { normal, rough }
}

/** Polished red-oxide floor tiles (a South Asian school classic), with grout and wear. */
export function floorMaps(tilesAcross = 2) {
  const S = 512
  const [c, ctx] = canvas(S)
  const n = valueNoise(S, 'floor', 6, 5)
  const img = ctx.createImageData(S, S)
  const tile = S / tilesAcross
  const r = rng('floor-tones')
  const tones = Array.from({ length: tilesAcross * tilesAcross }, () => 0.9 + r() * 0.2)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = y * S + x
      const tx = Math.floor(x / tile), ty = Math.floor(y / tile)
      const k = tones[ty * tilesAcross + tx]! * (0.82 + n[i]! * 0.36)
      const gx = x % tile, gy = y % tile
      const grout = gx < 2 || gy < 2 || gx > tile - 3 || gy > tile - 3
      const o = i * 4
      if (grout) {
        img.data[o] = 48; img.data[o + 1] = 28; img.data[o + 2] = 22
      } else {
        img.data[o] = 104 * k; img.data[o + 1] = 36 * k; img.data[o + 2] = 30 * k
      }
      img.data[o + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const map = tex(c, { srgb: true, aniso: 8 })

  const [rc, rctx] = canvas(S)
  const rn = valueNoise(S, 'floor-r', 3, 4)
  const rimg = rctx.createImageData(S, S)
  for (let i = 0; i < rn.length; i++) {
    const x = i % S, y = Math.floor(i / S)
    const gx = x % tile, gy = y % tile
    const grout = gx < 2 || gy < 2 || gx > tile - 3 || gy > tile - 3
    const v = grout ? 0.9 : 0.06 + rn[i]! * 0.16
    rimg.data[i * 4] = rimg.data[i * 4 + 1] = rimg.data[i * 4 + 2] = v * 255
    rimg.data[i * 4 + 3] = 255
  }
  rctx.putImageData(rimg, 0, 0)
  const rough = tex(rc, { aniso: 8 })
  return { map, rough }
}

/** Lime-washed plaster: colour + roughness. */
export function plasterMaps(seed = 'plaster') {
  const S = 256
  const n = valueNoise(S, seed, 5, 5)
  const [c, ctx] = canvas(S)
  const img = ctx.createImageData(S, S)
  for (let i = 0; i < n.length; i++) {
    const k = 0.93 + n[i]! * 0.1
    img.data[i * 4] = 236 * k; img.data[i * 4 + 1] = 222 * k; img.data[i * 4 + 2] = 196 * k; img.data[i * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return { map: tex(c, { srgb: true }), rough: roughnessMap(seed + 'r', 0.85, 0.08) }
}

/** Soft vertical light-shaft gradient (additive, alpha in luminance). */
export function shaftTexture() {
  const [c, ctx] = canvas(64, 256)
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 256)
  const side = ctx.createLinearGradient(0, 0, 64, 0)
  side.addColorStop(0, 'rgba(0,0,0,1)'); side.addColorStop(0.25, 'rgba(0,0,0,0)'); side.addColorStop(0.75, 'rgba(0,0,0,0)'); side.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = side
  ctx.fillRect(0, 0, 64, 256)
  const t = tex(c, { srgb: true })
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  return t
}

/** Soft round sprite for dust motes. */
export function moteTexture() {
  const [c, ctx] = canvas(64)
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,248,230,1)'); g.addColorStop(0.35, 'rgba(255,240,210,0.5)'); g.addColorStop(1, 'rgba(255,240,210,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const t = tex(c, { srgb: true })
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  return t
}

/**
 * Engraved trophy plate. Text is drawn as pixels from an already-sanitised string; never HTML.
 */
export function plateMaps(lines: { title: string; name: string; sub: string }) {
  const W = 1024, H = 384
  const [c, ctx] = canvas(W, H)
  // brushed brass base
  ctx.fillStyle = '#8a8a8a'
  ctx.fillRect(0, 0, W, H)
  const r = rng('plate')
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.035)`
    ctx.fillRect(0, r() * H, W, 1)
  }
  // engraving = dark (recessed) in height, and rough
  const engrave = (draw: (c: Ctx) => void) => {
    ctx.save(); ctx.fillStyle = '#2a2a2a'; ctx.strokeStyle = '#2a2a2a'; draw(ctx); ctx.restore()
  }
  engrave((g) => {
    g.lineWidth = 6
    g.strokeRect(26, 26, W - 52, H - 52)
    g.lineWidth = 2
    g.strokeRect(42, 42, W - 84, H - 84)
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '700 40px "Montserrat Variable", Montserrat, sans-serif'
    g.letterSpacing = '9px'
    g.fillText(lines.title.toUpperCase(), W / 2, 100)
    g.font = '400 120px Graduate, serif'
    g.letterSpacing = '2px'
    fitText(g, lines.name.toUpperCase(), W / 2, 210, W - 140)
    g.font = '700 36px "Montserrat Variable", Montserrat, sans-serif'
    g.letterSpacing = '8px'
    g.fillText(lines.sub.toUpperCase(), W / 2, 302)
  })
  const height = c
  const normal = tex(heightToNormal(height, 4), { aniso: 8 })
  // roughness: engraved letters are matte, plate is satin
  const [rc, rctx] = canvas(W, H)
  rctx.drawImage(height, 0, 0)
  const id = rctx.getImageData(0, 0, W, H)
  for (let i = 0; i < id.data.length; i += 4) {
    const v = id.data[i]! < 90 ? 235 : 70
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v
  }
  rctx.putImageData(id, 0, 0)
  const rough = tex(rc)
  // colour: engraved = darker filled (patina), rest = full
  const [cc, cctx] = canvas(W, H)
  cctx.drawImage(height, 0, 0)
  const cd = cctx.getImageData(0, 0, W, H)
  for (let i = 0; i < cd.data.length; i += 4) {
    const dark = cd.data[i]! < 90
    cd.data[i] = dark ? 26 : 255; cd.data[i + 1] = dark ? 18 : 255; cd.data[i + 2] = dark ? 8 : 255
  }
  cctx.putImageData(cd, 0, 0)
  const map = tex(cc, { srgb: true })
  for (const t of [normal, rough, map]) t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  return { map, normal, rough }
}

function fitText(g: Ctx, text: string, x: number, y: number, max: number) {
  const w = g.measureText(text).width
  if (w > max) {
    g.save()
    g.translate(x, y)
    g.scale(max / w, 1)
    g.fillText(text, 0, 0)
    g.restore()
  } else g.fillText(text, x, y)
}

/** Varnished walnut: warped grain stripes (colour) + roughness. */
export function woodMaps(seed = 'walnut') {
  const S = 512
  const n = valueNoise(S, seed, 3, 4)
  const fine = valueNoise(S, seed + 'f', 64, 2)
  const [c, ctx] = canvas(S)
  const img = ctx.createImageData(S, S)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = y * S + x
      const warp = n[i]! * 14 + (x / S) * 3
      const ring = 0.5 + 0.5 * Math.sin((y / S) * 38 + warp + fine[i]! * 0.8)
      const k = 0.62 + ring * 0.12 + fine[i]! * 0.22 + n[i]! * 0.1
      img.data[i * 4] = 92 * k; img.data[i * 4 + 1] = 52 * k; img.data[i * 4 + 2] = 30 * k; img.data[i * 4 + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return { map: tex(c, { srgb: true, aniso: 8 }), rough: roughnessMap(seed + 'r', 0.32, 0.08, { scratches: 40 }) }
}

/** Felt house banner: colour field, cream stitched border, house name in collegiate type. */
export function bannerTexture(fill: string, label: string) {
  const W = 256, H = 512
  const [c, ctx] = canvas(W, H)
  ctx.fillStyle = fill
  ctx.fillRect(0, 0, W, H)
  // felt fuzz
  const r = rng('felt' + label)
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},0.05)`
    ctx.fillRect(r() * W, r() * H, 1.5, 1.5)
  }
  ctx.strokeStyle = '#f3e6cc'
  ctx.lineWidth = 10
  ctx.strokeRect(18, 18, W - 36, H - 110)
  ctx.setLineDash([10, 8])
  ctx.lineWidth = 3
  ctx.strokeRect(34, 34, W - 68, H - 142)
  ctx.setLineDash([])
  ctx.fillStyle = '#f3e6cc'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // crest: shield outline
  ctx.beginPath()
  ctx.moveTo(W / 2, 90); ctx.lineTo(W / 2 + 58, 110); ctx.lineTo(W / 2 + 58, 170)
  ctx.quadraticCurveTo(W / 2 + 54, 222, W / 2, 246); ctx.quadraticCurveTo(W / 2 - 54, 222, W / 2 - 58, 170)
  ctx.lineTo(W / 2 - 58, 110); ctx.closePath()
  ctx.lineWidth = 7; ctx.stroke()
  ctx.font = '400 74px Graduate, serif'
  ctx.fillText(label[0]!, W / 2, 168)
  ctx.font = '400 50px Graduate, serif'
  ctx.fillText(label, W / 2, 320)
  ctx.font = '700 22px "Montserrat Variable", sans-serif'
  ctx.letterSpacing = '6px'
  ctx.fillText('HOUSE', W / 2, 368)
  return tex(c, { srgb: true, aniso: 8 })
}

/** Walnut "Roll of Honour" board with gilt lettering (original, fictional entries). */
export function honourBoardTexture(entries: string[]) {
  const W = 512, H = 768
  const wood = woodMaps('honour')
  const [c, ctx] = canvas(W, H)
  ctx.drawImage(wood.map.image as HTMLCanvasElement, 0, 0, W, H)
  wood.map.dispose(); wood.rough.dispose()
  ctx.strokeStyle = '#c9a24b'
  ctx.lineWidth = 6
  ctx.strokeRect(22, 22, W - 44, H - 44)
  ctx.lineWidth = 2
  ctx.strokeRect(36, 36, W - 72, H - 72)
  ctx.fillStyle = '#d9b45e'
  ctx.textAlign = 'center'
  ctx.font = '400 46px Graduate, serif'
  ctx.fillText('ROLL OF HONOUR', W / 2, 104)
  ctx.font = '700 18px "Montserrat Variable", sans-serif'
  ctx.letterSpacing = '5px'
  ctx.fillText('STUDENT OF THE YEAR', W / 2, 140)
  ctx.letterSpacing = '2px'
  ctx.font = '600 24px "Montserrat Variable", sans-serif'
  entries.forEach((e, i) => ctx.fillText(e, W / 2, 200 + i * 44))
  return tex(c, { srgb: true, aniso: 8 })
}

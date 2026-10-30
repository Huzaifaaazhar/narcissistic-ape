'use client'

type Card = { name: string; house: 'red' | 'blue'; total: number; grade: string; school: string; url: string; title: string }

const C = { paper: '#efe3cf', deep: '#e4d3b9', navy: '#101d3a', maroon: '#6e0c16', red: '#a8202b', ink: '#1b1b26', cream: '#fbf4e6', gold: '#c9a24b' }

function load(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = src
  })
}

/** Varsity lettering on canvas: ink keyline, cream band, maroon fill (same recipe as the CSS). */
function varsity(g: CanvasRenderingContext2D, text: string, x: number, y: number, size: number) {
  g.font = `400 ${size}px Graduate, serif`
  g.textAlign = 'center'
  g.lineJoin = 'round'
  g.strokeStyle = C.ink
  g.lineWidth = size * 0.25
  g.strokeText(text, x, y)
  g.strokeStyle = C.cream
  g.lineWidth = size * 0.15
  g.strokeText(text, x, y)
  g.fillStyle = C.maroon
  g.fillText(text, x, y)
}

/**
 * 1080×1350 result card (Instagram portrait). Everything user-supplied is drawn as pixels.
 * Returns a PNG blob.
 */
export async function makeShareCard(c: Card): Promise<Blob> {
  await Promise.all([document.fonts.load('80px Graduate'), document.fonts.load('80px "Alfa Slab One"'), document.fonts.load('700 30px "Montserrat Variable"')]).catch(() => undefined)
  const W = 1080, H = 1350
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const g = cv.getContext('2d')!
  g.fillStyle = C.paper
  g.fillRect(0, 0, W, H)
  try {
    const grain = await load('/textures/paper-grain.png')
    const pat = g.createPattern(grain, 'repeat')
    if (pat) { g.fillStyle = pat; g.fillRect(0, 0, W, H) }
  } catch { /* plain paper is fine */ }

  g.textBaseline = 'alphabetic'
  g.fillStyle = C.ink
  g.font = '600 30px "Montserrat Variable", sans-serif'
  g.textAlign = 'center'
  g.letterSpacing = '12px'
  g.fillText(c.school.toUpperCase(), W / 2, 110)
  g.letterSpacing = '0px'
  varsity(g, 'STUDENT OF', W / 2, 220, 96)
  varsity(g, 'THE YEAR', W / 2, 320, 96)
  // red→navy divider
  g.fillStyle = C.maroon
  g.fillRect(W / 2 - 260, 362, 260, 6)
  g.fillStyle = C.navy
  g.fillRect(W / 2, 362, 260, 6)

  // trophy plate
  const tx = 200, ty = 410, ts = 680
  g.fillStyle = '#0b0c11'
  g.fillRect(tx, ty, ts, ts * 0.72)
  try {
    const trophy = await load('/posters/trophy-square.webp')
    g.save()
    g.beginPath(); g.rect(tx, ty, ts, ts * 0.72); g.clip()
    // drawn low so the generic plate falls outside the frame; the real name is printed below
    g.drawImage(trophy, tx, ty + ts * 0.03, ts, ts)
    g.restore()
  } catch { /* frame only */ }

  // name, house, score
  g.fillStyle = C.navy
  g.font = '400 84px Graduate, serif'
  const name = c.name.toUpperCase()
  const nw = g.measureText(name).width
  const maxW = W - 160
  g.save()
  g.translate(W / 2, 1010)
  if (nw > maxW) g.scale(maxW / nw, 1)
  g.fillText(name, 0, 0)
  g.restore()

  const pill = c.house === 'red' ? C.red : C.navy
  const houseText = `${c.house === 'red' ? 'RED' : 'BLUE'} HOUSE`
  g.font = '700 28px "Montserrat Variable", sans-serif'
  g.letterSpacing = '6px'
  const pw = g.measureText(houseText).width + 60
  g.fillStyle = pill
  g.beginPath(); g.roundRect(W / 2 - pw / 2, 1040, pw, 52, 26); g.fill()
  g.fillStyle = C.cream
  g.fillText(houseText, W / 2 + 3, 1076)
  g.letterSpacing = '0px'

  // score centred, "/ 1000" tucked after it; grade on its own line
  g.font = '400 128px "Alfa Slab One", serif'
  const scoreText = String(c.total)
  const sw = g.measureText(scoreText).width
  g.font = '700 26px "Montserrat Variable", sans-serif'
  g.letterSpacing = '4px'
  const ow = g.measureText('/ 1000').width
  const sx = W / 2 - (sw + 16 + ow) / 2
  g.textAlign = 'left'
  g.fillStyle = C.maroon
  g.font = '400 128px "Alfa Slab One", serif'
  g.letterSpacing = '0px'
  g.fillText(scoreText, sx, 1222)
  g.fillStyle = C.ink
  g.font = '700 26px "Montserrat Variable", sans-serif'
  g.letterSpacing = '4px'
  g.fillText('/ 1000', sx + sw + 16, 1222)
  g.textAlign = 'center'
  g.letterSpacing = '1px'
  g.fillStyle = C.navy
  g.font = '400 40px Graduate, serif'
  g.fillText(c.grade.toUpperCase(), W / 2, 1272)

  g.textAlign = 'center'
  g.letterSpacing = '4px'
  g.font = '700 24px "Montserrat Variable", sans-serif'
  g.fillStyle = C.ink
  g.fillText(`THINK YOU CAN BEAT ${c.total}?  ${c.url.toUpperCase()}`, W / 2, 1322)

  return await new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'))
}

/** Native share sheet with the image when supported; otherwise download it. */
export async function shareOrDownload(blob: Blob, text: string, url: string) {
  const file = new File([blob], 'student-of-the-year.png', { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text, url })
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'student-of-the-year.png'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  return 'downloaded'
}

/** Share a link (duel challenge): share sheet, else clipboard. */
export async function shareLink(text: string, url: string) {
  if (navigator.share) {
    try {
      await navigator.share({ text, url })
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'
    }
  }
  await navigator.clipboard.writeText(`${text} ${url}`)
  return 'copied'
}

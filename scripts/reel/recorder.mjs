// Frame-stepped 4K recorder for promo clips.
//
// A virtual clock is installed in the page before any app code runs: performance.now, Date.now,
// requestAnimationFrame and timers run on it, and CSS/Web Animations are paused and stepped with
// it. Each frame advances the clock exactly 1/fps, then a device-pixel screenshot is piped into
// ffmpeg (H.264). Capture can be as slow as it likes; playback is perfectly smooth.
// (Chrome's CDP virtual time stalls screenshots in this environment, hence the in-page clock.)
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'

export const VIEW = { width: 432, height: 768 } // 9:16; × scale 5 = 2160×3840 (4K UHD portrait)
export const SCALE = 5
export const FPS = 30
export const BASE = process.env.BASE_URL ?? 'http://localhost:3123'

export const ENROLMENT = { nickname: 'Zara K', house: 'red', archetype: 'ghost', enrolledAt: 1 }

/** Runs in the page before app code. Real time until __rec.start(); virtual after. */
function installClock() {
  const realNow = performance.now.bind(performance)
  const realDateNow = Date.now
  const realRaf = window.requestAnimationFrame.bind(window)
  const realCancelRaf = window.cancelAnimationFrame.bind(window)
  const realSetTimeout = window.setTimeout.bind(window)
  const realClearTimeout = window.clearTimeout.bind(window)
  const realSetInterval = window.setInterval.bind(window)
  const realClearInterval = window.clearInterval.bind(window)

  let virtual = false
  let vt = 0
  let dateBase = 0
  let perfBase = 0
  let nextId = 1e9
  let rafQueue = new Map()
  const timers = new Map()
  const tracked = new WeakSet()

  performance.now = () => (virtual ? vt : realNow())
  Date.now = () => (virtual ? Math.round(dateBase + (vt - perfBase)) : realDateNow())
  window.requestAnimationFrame = (cb) => {
    if (!virtual) return realRaf(cb)
    const id = nextId++
    rafQueue.set(id, cb)
    return id
  }
  window.cancelAnimationFrame = (id) => (rafQueue.delete(id) ? undefined : realCancelRaf(id))
  const add = (fn, ms, args, repeat) => {
    const id = nextId++
    timers.set(id, { fn, args, due: vt + Math.max(0, Number(ms) || 0), every: repeat ? Math.max(1, Number(ms) || 0) : 0 })
    return id
  }
  window.setTimeout = (fn, ms, ...args) => (virtual ? add(fn, ms, args, false) : realSetTimeout(fn, ms, ...args))
  window.setInterval = (fn, ms, ...args) => (virtual ? add(fn, ms, args, true) : realSetInterval(fn, ms, ...args))
  window.clearTimeout = (id) => (timers.delete(id) ? undefined : realClearTimeout(id))
  window.clearInterval = (id) => (timers.delete(id) ? undefined : realClearInterval(id))

  const stepAnimations = (ms) => {
    for (const a of document.getAnimations()) {
      if (a.playState === 'finished') continue
      if (!tracked.has(a)) {
        tracked.add(a)
        a.pause()
        continue // the frame it appears in counts as its t=0
      }
      const end = a.effect?.getComputedTiming().endTime
      const t = (a.currentTime ?? 0) + ms
      if (typeof end === 'number' && Number.isFinite(end) && t >= end) a.finish()
      else a.currentTime = t
    }
  }

  window.__rec = {
    start() {
      if (virtual) return
      perfBase = vt = realNow()
      dateBase = realDateNow()
      virtual = true
    },
    step(ms) {
      const target = vt + ms
      // timers in due order (callbacks may add more)
      for (;;) {
        let next = null
        for (const [id, t] of timers) if (t.due <= target && (!next || t.due < next[1].due)) next = [id, t]
        if (!next) break
        const [id, t] = next
        vt = Math.max(vt, t.due)
        if (t.every) t.due += t.every
        else timers.delete(id)
        try {
          if (typeof t.fn === 'function') t.fn(...t.args)
          else (0, eval)(t.fn)
        } catch (e) { console.error(e) }
      }
      vt = target
      stepAnimations(ms)
      const q = rafQueue
      rafQueue = new Map()
      for (const cb of q.values()) {
        try { cb(vt) } catch (e) { console.error(e) }
      }
    },
  }
}

export async function launch() {
  return chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] })
}

/** New phone-shaped context with the virtual clock installed. */
export async function phone(browser) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: SCALE, isMobile: true, hasTouch: true })
  await ctx.addInitScript(installClock)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  return { ctx, page, errors }
}

export async function recorder(page, file, { crf = 17 } = {}) {
  const cdp = await page.context().newCDPSession(page)
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf), '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-level', '5.2', '-r', String(FPS), '-movflags', '+faststart', file,
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  await page.evaluate(() => window.__rec.start())
  let n = 0
  const t0 = Date.now()

  const advance = (ms) => page.evaluate((m) => window.__rec.step(m), ms)

  const frame = async () => {
    await advance(1000 / FPS)
    const scrollY = await page.evaluate(() => scrollY)
    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'jpeg', quality: 94,
      clip: { x: 0, y: scrollY, width: VIEW.width, height: VIEW.height, scale: SCALE },
    })
    if (!ff.stdin.write(Buffer.from(shot.data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r))
    n++
    if (n % 60 === 0) console.log(`    ${file}: ${n} frames, ${((Date.now() - t0) / n / 1000).toFixed(2)}s/frame`)
  }

  const api = {
    frames: async (k) => { for (let i = 0; i < k; i++) await frame() },
    seconds: async (s) => api.frames(Math.round(s * FPS)),
    count: () => n,
    /** Tap the centre of a locator. */
    tap: async (locator) => {
      const b = await locator.boundingBox()
      if (!b) throw new Error('tap: element not visible')
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
    },
    /** Type one character every `every` frames, so the typing is visible. */
    type: async (text, every = 4) => {
      for (const ch of text) { await page.keyboard.type(ch); await api.frames(every) }
    },
    /** Eased scroll to `toY` over `s` seconds, filming every frame. */
    scrollTo: async (toY, s) => {
      const from = await page.evaluate(() => scrollY)
      const k = Math.round(s * FPS)
      for (let i = 1; i <= k; i++) {
        const t = i / k
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        await page.evaluate((y) => scrollTo(0, y), from + (toY - from) * e)
        await frame()
      }
    },
    /** Swipe from a to b across `steps` filmed frames (pointer events carry virtual timestamps). */
    swipe: async (a, b, steps = 4, bulge = 0) => {
      await page.mouse.move(a.x, a.y)
      await page.mouse.down()
      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        await page.mouse.move(a.x + (b.x - a.x) * t + Math.sin(Math.PI * t) * bulge, a.y + (b.y - a.y) * t)
        await frame() // film the swipe trail
      }
      await page.mouse.up()
    },
    close: async () => {
      ff.stdin.end()
      await new Promise((r) => ff.on('close', r))
      await cdp.detach().catch(() => {})
      console.log(`  ${file}: ${n} frames (${(n / FPS).toFixed(1)}s) in ${((Date.now() - t0) / 1000).toFixed(0)}s`)
    },
  }
  return api
}

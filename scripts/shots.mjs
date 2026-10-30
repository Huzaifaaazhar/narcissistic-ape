// Visual verification loop (spec 4.9). Usage: npm run shots [-- route1 route2 ...]
// Starts `next dev` unless BASE_URL is set. Writes shots/<name>-<viewport>.png.
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'

const ROUTES = {
  gallery: '/dev/gallery',
  type: '/dev/type',
  icons: '/dev/gallery?section=icons',
  home: '/',
}
const VIEWPORTS = {
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
}
const PORT = process.env.PORT ?? '3123'
let base = process.env.BASE_URL
let server

async function waitFor(url, ms = 90_000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    try { if ((await fetch(url)).status < 500) return } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`server not ready at ${url}`)
}

if (!base) {
  base = `http://localhost:${PORT}`
  server = spawn('npx', ['next', 'dev', '-p', PORT], { stdio: 'ignore', detached: true, env: { ...process.env, NODE_ENV: 'development' } })
  await waitFor(base + '/dev/gallery')
}

const want = process.argv.slice(2)
const names = want.length ? want : Object.keys(ROUTES)
const full = process.env.FULL !== '0'
await mkdir('shots', { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
try {
  for (const name of names) {
    const path = ROUTES[name] ?? name
    for (const [vp, opts] of Object.entries(VIEWPORTS)) {
      // Chrome can't capture >16k device px; tall full-page phone shots drop to 1x.
      const ctx = await browser.newContext({ ...opts, ...(full && vp === 'phone' ? { deviceScaleFactor: 1 } : {}), reducedMotion: 'reduce' })
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      const sep = path.includes('?') ? '&' : '?'
      await page.goto(`${base}${path}${sep}debug=1&freeze=1`, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(Number(process.env.SETTLE_MS ?? 700))
      const file = `shots/${name.replace(/[^a-z0-9-]/gi, '_')}-${vp}.png`
      await page.screenshot({ path: file, fullPage: full })
      console.log(file, errors.length ? `ERRORS (${errors.length}): ${[...new Set(errors.map((e) => e.slice(0, 160)))].join(' | ')}` : 'ok')
      await ctx.close()
    }
  }
} finally {
  await browser.close()
  // detached → own process group; kill the group so next's child server dies too
  if (server) try { process.kill(-server.pid, 'SIGTERM') } catch {}
}

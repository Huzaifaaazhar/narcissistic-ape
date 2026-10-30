// Pre-renders 3D scenes to still posters (LCP image + no-WebGL fallback). Usage: npm run posters
// Renders with software GL, so it's slow but deterministic (?freeze=1 pins time and camera).
import { chromium } from '@playwright/test'
import { spawn, execFileSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'

const PORT = process.env.PORT ?? '3125'
const base = process.env.BASE_URL ?? `http://localhost:${PORT}`
const ONLY = process.argv.slice(2)
const JOBS_ALL = [
  { name: 'corridor-portrait', path: '/dev/scenes/corridor?tier=high&freeze=1&p=0', viewport: { width: 390, height: 844 }, scale: 2 },
  { name: 'corridor-landscape', path: '/dev/scenes/corridor?tier=high&freeze=1&p=0', viewport: { width: 1440, height: 900 }, scale: 1.334 },
  { name: 'trophy-square', path: '/dev/scenes/trophy?freeze=1&name=Your%20name%20here&sub=Season%20one', viewport: { width: 600, height: 600 }, scale: 2 },
]
const JOBS = ONLY.length ? JOBS_ALL.filter((j) => ONLY.includes(j.name)) : JOBS_ALL

let server
if (!process.env.BASE_URL) {
  server = spawn('npx', ['next', 'dev', '-p', PORT], { stdio: 'ignore', detached: true })
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(base + '/dev/scenes')).ok) break } catch {}
    await new Promise((r) => setTimeout(r, 1000))
  }
}
await mkdir('public/posters', { recursive: true })
await mkdir('shots', { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
try {
  for (const j of JOBS) {
    const ctx = await browser.newContext({ viewport: j.viewport, deviceScaleFactor: j.scale })
    const page = await ctx.newPage()
    await page.goto(base + j.path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(Number(process.env.SETTLE_MS ?? 10000))
    const png = `shots/poster-${j.name}.png`
    await page.screenshot({ path: png, timeout: 180_000 })
    // WebP via Pillow (installed in this environment); q≈72 keeps the portrait poster < 150 KB
    execFileSync('python3', ['-I', '-c', `from PIL import Image; Image.open('${png}').convert('RGB').save('public/posters/${j.name}.webp','WEBP',quality=72,method=6)`])
    console.log('wrote', `public/posters/${j.name}.webp`)
    await ctx.close()
  }
} finally {
  await browser.close()
  if (server) try { process.kill(-server.pid, 'SIGTERM') } catch {}
}

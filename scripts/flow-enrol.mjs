// Drives the enrol flow and screenshots each step (incl. the house flood) at phone + desktop.
import { chromium } from '@playwright/test'
const base = process.env.BASE_URL ?? 'http://localhost:3123'
const VPS = { phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1440, height: 900 } } }
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
for (const [vp, opts] of Object.entries(VPS)) {
  const ctx = await browser.newContext({ ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const shot = (n) => page.screenshot({ path: `shots/enrol-${n}-${vp}.png`, timeout: 180_000 })
  await page.goto(`${base}/enrol?tier=${vp === 'phone' ? 'low' : 'high'}`, { waitUntil: 'networkidle' })
  await page.getByLabel('Your name on the trophy').fill('Zara K')
  await page.waitForTimeout(300)
  await shot('1-name')
  await page.getByRole('button', { name: 'Next' }).click()
  await page.waitForTimeout(500)
  await shot('2-house')
  await page.getByText('Fortune favours the loud.').click()
  await page.waitForTimeout(700)
  await shot('2b-flood')
  await page.getByRole('heading', { name: 'Who are you on campus?' }).waitFor({ timeout: 10_000 })
  await page.waitForTimeout(600)
  await page.getByText('Library Ghost').click()
  await page.waitForTimeout(300)
  await shot('3-type')
  await page.getByRole('button', { name: 'Approve my admission' }).click()
  await page.waitForTimeout(9000)
  await page.screenshot({ path: `shots/enrol-4-done-${vp}.png`, fullPage: true, timeout: 180_000 })
  console.log(vp, errors.length ? `ERRORS: ${[...new Set(errors)].join(' | ').slice(0, 400)}` : 'ok')
  await ctx.close()
}
await browser.close()

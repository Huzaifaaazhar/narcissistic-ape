// Plays the quiz end-to-end (as an enrolled player) and screenshots key moments.
import { chromium } from '@playwright/test'
const base = process.env.BASE_URL ?? 'http://localhost:3123'
const VPS = { phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1440, height: 900 } } }
const browser = await chromium.launch()
for (const [vp, opts] of Object.entries(VPS)) {
  const ctx = await browser.newContext(opts)
  await ctx.addInitScript(() => {
    localStorage.setItem('sty-player', JSON.stringify({ state: { enrolment: { nickname: 'Zara K', house: 'red', archetype: 'ghost', enrolledAt: 1 } }, version: 1 }))
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const shot = (n) => page.screenshot({ path: `shots/quiz-${n}-${vp}.png` })
  await page.goto(`${base}/season`, { waitUntil: 'networkidle' })
  await shot('0-hub')
  await page.getByRole('link', { name: /Play round 2/ }).click()
  await page.getByRole('button', { name: 'Ready' }).click()
  for (let q = 0; q < 10; q++) {
    await page.getByRole('heading', { level: 1 }).waitFor()
    if (q === 0) await shot('1-question')
    const answers = page.locator('button.answer:not([disabled])')
    await answers.nth(q % 3 === 2 ? 1 : 0).click()
    await page.waitForTimeout(250)
    if (q === 0 || q === 2) await shot(`2-reveal-${q}`)
    await page.getByRole('button', { name: /Next question|See my score/ }).click()
  }
  await page.waitForTimeout(1200)
  await shot('3-results')
  await page.getByRole('button', { name: /Save and back/ }).click()
  await page.waitForURL('**/season')
  await page.waitForTimeout(800)
  await shot('4-hub-after')
  console.log(vp, errors.length ? `ERRORS: ${[...new Set(errors)].join(' | ').slice(0, 400)}` : 'ok')
  await ctx.close()
}
await browser.close()

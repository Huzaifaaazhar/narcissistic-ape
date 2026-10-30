// Seeds a finished season, checks the hub unlocks the finale, screenshots the verdict, plays again.
import { chromium } from '@playwright/test'
const base = process.env.BASE_URL ?? 'http://localhost:3123'
const VPS = { phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1440, height: 900 } } }
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
for (const [vp, opts] of Object.entries(VPS)) {
  const ctx = await browser.newContext(opts)
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    localStorage.setItem('sty-player', JSON.stringify({ state: { enrolment: { nickname: 'Zara K', house: 'red', archetype: 'ghost', enrolledAt: 1 } }, version: 1 }))
    const r = (score, detail) => ({ score, detail, at: 1 })
    localStorage.setItem('sty-season', JSON.stringify({ state: { runId: 'r1', seed: 'abc12345', history: [{ total: 512, at: 1, scores: {} }], results: {
      football: r(450, '3/5 scored · 1 top bins'), quiz: r(1890, '8/10 correct · best streak 5'), hunt: r(2150, '4/5 found first try · 1 hints'), dance: r(1420, '61 / 30 / 12 · best combo 34'),
    } }, version: 1 }))
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${base}/season`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `shots/finale-0-hub-${vp}.png` })
  // the hub must offer the finale; open it with the trophy as a still (software GL here can't keep up)
  await page.getByRole('link', { name: /Dean’s verdict/ }).waitFor()
  await page.goto(`${base}/finale?tier=poster`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(5000)
  await page.screenshot({ path: `shots/finale-1-verdict-${vp}.png`, fullPage: true, timeout: 180000 })
  await page.getByRole('button', { name: 'Decline the trophy' }).click()
  await page.waitForTimeout(600)
  await page.screenshot({ path: `shots/finale-2-humble-${vp}.png`, fullPage: true, timeout: 180000 })
  await page.getByRole('button', { name: 'Play another season' }).click()
  await page.waitForURL('**/season')
  await page.waitForTimeout(800)
  const best = await page.getByText('Best season').locator('..').innerText()
  console.log(vp, 'after play-again →', best.replace(/\n/g, ' '), '| done stamps:', await page.getByText('Done', { exact: true }).count(), errors.length ? 'ERRORS ' + errors.join(' | ').slice(0, 200) : 'ok')
  await ctx.close()
}
await browser.close()

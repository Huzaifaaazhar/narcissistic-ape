// Takes five penalties with real swipes (and one tap) and screenshots the action.
import { chromium } from '@playwright/test'
const base = process.env.BASE_URL ?? 'http://localhost:3123'
const VPS = { phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1440, height: 900 } } }
const browser = await chromium.launch()
for (const [vp, opts] of Object.entries(VPS)) {
  const ctx = await browser.newContext(opts)
  await ctx.addInitScript(() => localStorage.setItem('sty-player', JSON.stringify({ state: { enrolment: { nickname: 'Zara K', house: 'red', archetype: 'ghost', enrolledAt: 1 } }, version: 1 })))
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const shot = (n) => page.screenshot({ path: `shots/football-${n}-${vp}.png` })
  await page.goto(`${base}/play/football`, { waitUntil: 'networkidle' })
  await shot('0-intro')
  await page.getByRole('button', { name: 'Ready' }).click()
  await page.waitForTimeout(600)
  const box = await page.locator('canvas').boundingBox()
  const bx = box.x + box.width / 2, by = box.y + box.height * 0.84
  await shot('1-aim')
  // swipes: [dx fraction, dy fraction, bulge px]
  const swipes = [[0.2, 0.36, 0], [-0.22, 0.34, 25], [0.02, 0.2, 0], [0.26, 0.42, -20], null]
  for (let s = 0; s < 5; s++) {
    if (swipes[s]) {
      const [fx, fy, bulge] = swipes[s]
      const ex = bx + fx * box.width, ey = by - fy * box.height
      await page.mouse.move(bx, by)
      await page.mouse.down()
      for (let k = 1; k <= 6; k++) {
        const t = k / 6
        await page.mouse.move(bx + (ex - bx) * t + Math.sin(Math.PI * t) * bulge, by + (ey - by) * t)
      }
      await page.mouse.up()
    } else {
      // tap top-left corner of the goal
      await page.mouse.click(box.x + box.width * 0.16, box.y + box.height * 0.27)
    }
    await page.waitForTimeout(s === 0 ? 420 : 900)
    if (s === 0) await shot('2-flight')
    await page.waitForTimeout(s === 0 ? 450 : 0)
    if (s === 0) await shot('3-result')
    await page.waitForTimeout(1300)
  }
  await page.getByText('The Match · Results').waitFor({ timeout: 8000 })
  await page.waitForTimeout(1000)
  await shot('4-results')
  const summary = await page.locator('dl').innerText()
  console.log(vp, summary.replace(/\n/g, ' | '), errors.length ? `ERRORS: ${[...new Set(errors)].join(' | ').slice(0, 300)}` : 'ok')
  await ctx.close()
}
await browser.close()

// Plays the dance round with key presses through the whole song; screenshots mid-song and results.
import { chromium } from '@playwright/test'
const base = process.env.BASE_URL ?? 'http://localhost:3123'
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await ctx.addInitScript(() => localStorage.setItem('sty-player', JSON.stringify({ state: { enrolment: { nickname: 'Zara K', house: 'red', archetype: 'ghost', enrolledAt: 1 } }, version: 1 })))
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto(`${base}/play/dance`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Ready' }).click()
await page.waitForTimeout(1500)
await page.screenshot({ path: 'shots/dance-1-countin-phone.png' })
const keys = ['d', 'f', 'j', 'k']
const t0 = Date.now()
let shot2 = false
while (Date.now() - t0 < 62000) {
  if (await page.getByText('The Battle · Results').count()) break
  await page.keyboard.press(keys[Math.floor(Math.random() * 4)])
  await page.waitForTimeout(120)
  if (!shot2 && Date.now() - t0 > 20000) { await page.screenshot({ path: 'shots/dance-2-play-phone.png' }); shot2 = true }
}
await page.getByText('The Battle · Results').waitFor({ timeout: 15000 })
await page.waitForTimeout(1200)
await page.screenshot({ path: 'shots/dance-3-results-phone.png' })
console.log('song ran', Math.round((Date.now() - t0) / 1000), 's ·', (await page.locator('dl').innerText()).replace(/\n/g, ' | '), errors.length ? 'ERRORS ' + errors.join(' | ').slice(0, 300) : 'ok')
await browser.close()

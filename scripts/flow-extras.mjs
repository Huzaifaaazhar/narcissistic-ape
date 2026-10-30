// Finale rewards (once only), share card, duel link round-trip, locker, settings, daily challenge.
import { chromium } from '@playwright/test'
const base = process.env.BASE_URL ?? 'http://localhost:3123'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] })
await ctx.addInitScript(() => {
  if (sessionStorage.getItem('seeded')) return
  sessionStorage.setItem('seeded', '1')
  localStorage.setItem('sty-player', JSON.stringify({ state: { enrolment: { nickname: 'Zara K', house: 'red', archetype: 'ghost', enrolledAt: 1 } }, version: 1 }))
  const r = (score, detail, stats) => ({ score, detail, at: 1, stats })
  localStorage.setItem('sty-season', JSON.stringify({ state: { runId: 'r1', seed: 'abc12345', mode: 'season', duel: null, award: null, history: [], results: {
    football: r(750, '5/5 scored · 5 top bins', { goals: 5, corners: 5 }), quiz: r(2400, '10/10 correct · best streak 10', { correct: 10, lifelines: 0 }),
    hunt: r(2300, '5/5 found first try · 0 hints', { firstTry: 5, hints: 0 }), dance: r(1800, '90 / 20 / 5 · best combo 60', { maxCombo: 60, perfect: 90 }),
  } }, version: 1 }))
})
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const out = []

await page.goto(`${base}/finale?tier=poster`, { waitUntil: 'networkidle' })
await page.waitForTimeout(5500)
await page.screenshot({ path: 'shots/extras-1-finale-phone.png', fullPage: true })
const xp1 = await page.evaluate(() => JSON.parse(localStorage.getItem('sty-progress')).state)
out.push(`award: xp=${xp1.xp} seasons=${xp1.seasons} achievements=${xp1.achievements.length} owned=${xp1.owned.join(',')}`)
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const xp2 = await page.evaluate(() => JSON.parse(localStorage.getItem('sty-progress')).state)
out.push(`after refresh (must be unchanged): xp=${xp2.xp} seasons=${xp2.seasons}`)

const dl = page.waitForEvent('download', { timeout: 15000 })
await page.getByRole('button', { name: 'Share card' }).click()
const file = await dl
await file.saveAs('shots/extras-share-card.png')
out.push(`share card: ${await file.suggestedFilename()}`)

await page.getByRole('button', { name: 'Challenge' }).click()
await page.waitForTimeout(500)
const clip = await page.evaluate(() => navigator.clipboard.readText())
const link = clip.match(/https?:\/\/\S+/)[0]
out.push(`duel link: ${link.slice(0, 70)}…`)

await page.getByRole('button', { name: 'Play another season' }).click()
await page.waitForURL('**/season')
await page.goto(link, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: 'shots/extras-2-duel-phone.png' })
await page.getByRole('button', { name: 'Accept the challenge' }).click()
await page.waitForURL('**/season')
await page.waitForTimeout(600)
out.push(`hub duel banner: ${await page.getByText(/^Duel vs Zara K/).count() === 1}`)
await page.screenshot({ path: 'shots/extras-3-hub-duel-phone.png' })

await page.getByRole('button', { name: 'Open settings' }).click()
await page.getByRole('switch', { name: 'Music' }).click()
out.push(`music switch: ${await page.getByRole('switch', { name: 'Music' }).getAttribute('aria-checked')}`)
await page.screenshot({ path: 'shots/extras-4-settings-phone.png' })
await page.getByRole('button', { name: 'Done' }).click()

await page.goto(`${base}/locker`, { waitUntil: 'networkidle' })
await page.screenshot({ path: 'shots/extras-5-locker-phone.png', fullPage: true })

// daily: start fresh so the card shows
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('sty-season')); s.state.results = {}; s.state.mode = 'season'; s.state.duel = null; localStorage.setItem('sty-season', JSON.stringify(s)) })
await page.goto(`${base}/season`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Start' }).click()
await page.waitForTimeout(400)
out.push(`daily banner: ${await page.getByText(/Daily challenge: the same game/).count() === 1}`)

console.log(out.join('\n'))
console.log(errors.length ? 'ERRORS: ' + [...new Set(errors)].join(' | ').slice(0, 400) : 'no console errors')
await browser.close()

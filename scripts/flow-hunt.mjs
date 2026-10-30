// Plays the Hunt end-to-end: reads each clue, taps the right place, solves the puzzle. Screenshots along the way.
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const base = process.env.BASE_URL ?? 'http://localhost:3123'
// pull clue → place/word straight from the source so the script never drifts from the game
const src = readFileSync('src/game/hunt.ts', 'utf8')
const CLUES = [...src.matchAll(/\{ place: '(\w+)', text: '((?:[^'\\]|\\.)*)', word: '(\w+)' \}/g)].map((m) => ({ place: m[1], text: m[2].replace(/\\'/g, "'"), word: m[3] }))
const NAMES = { library: 'Library', canteen: 'Canteen', lockers: 'Locker room', field: 'Football field', auditorium: 'Auditorium', office: 'Principal’s office', rooftop: 'Rooftop' }
const VPS = { phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { viewport: { width: 1440, height: 900 } } }
const browser = await chromium.launch()
for (const [vp, opts] of Object.entries(VPS)) {
  const ctx = await browser.newContext(opts)
  await ctx.addInitScript(() => localStorage.setItem('sty-player', JSON.stringify({ state: { enrolment: { nickname: 'Zara K', house: 'red', archetype: 'ghost', enrolledAt: 1 } }, version: 1 })))
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const shot = (n) => page.screenshot({ path: `shots/hunt-${n}-${vp}.png` })
  await page.goto(`${base}/play/hunt`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Ready' }).click()
  const seen = new Set()
  for (let c = 0; c < 5; c++) {
    const text = (await page.locator('p[aria-live="polite"]').first().innerText()).replace(/[“”]/g, '')
    const clue = CLUES.find((x) => x.text === text)
    if (!clue) throw new Error('unknown clue: ' + text)
    if (c === 0) {
      // one wrong guess first, to exercise that path
      const wrong = Object.keys(NAMES).find((k) => k !== clue.place)
      await page.getByRole('button', { name: NAMES[wrong], exact: true }).click()
      await shot('1-clue')
    }
    await page.getByRole('button', { name: NAMES[clue.place], exact: true }).click()
    await page.waitForTimeout(300)
    if (c === 0) await shot('2-found')
    await page.getByRole('button', { name: 'Open it' }).click()
    await page.waitForTimeout(300)
    const kind = (await page.getByText('Unscramble the word').count()) ? 'unscramble' : (await page.getByText('Match the pairs').count()) ? 'memory' : 'odd'
    if (!seen.has(kind)) { await shot(`3-${kind}`); seen.add(kind) }
    if (kind === 'unscramble') {
      const used = new Set()
      const tiles = page.locator('button.size-12')
      const letters = await tiles.allInnerTexts()
      for (const ch of clue.word) {
        const j = letters.findIndex((l, k) => l === ch && !used.has(k))
        used.add(j)
        await tiles.nth(j).click()
      }
    } else if (kind === 'memory') {
      // brute force: try every pair of still-unmatched cards until the puzzle closes
      outer: for (let x = 0; x < 6; x++) for (let y = x + 1; y < 6; y++) {
        if (!(await page.getByText('Match the pairs').count())) break outer
        const card = (k) => page.locator('button.flip').nth(k)
        const matched = async (k) => (await card(k).getAttribute('class')).includes('ring-gold')
        if ((await matched(x)) || (await matched(y))) continue
        await card(x).click()
        await card(y).click()
        await page.waitForTimeout(820)
      }
    } else {
      const idx = await page.locator('button[aria-label^="Sticker"] svg').evaluateAll((els) => els.findIndex((e) => e.style.transform.includes('scaleX(-1)')))
      await page.locator('button[aria-label^="Sticker"]').nth(idx).click()
    }
    await page.waitForTimeout(700)
  }
  await page.getByText('The Hunt · Results').waitFor({ timeout: 10000 })
  await page.waitForTimeout(1000)
  await shot('4-results')
  console.log(vp, 'puzzles seen:', [...seen].join(','), errors.length ? `ERRORS: ${[...new Set(errors)].join(' | ').slice(0, 300)}` : 'ok')
  await ctx.close()
}
await browser.close()

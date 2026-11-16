// Records 4K (2160×3840, 30 fps) promo clips of real gameplay against a DEV server (recording mode
// needs dev). Usage: node scripts/reel/clips.mjs [clip ...]   Output: reel-clips/*.mp4
import { mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { BASE, ENROLMENT, FPS, launch, phone, recorder } from './recorder.mjs'

const OUT = 'reel-clips'
const SEED = 'promo6' // hunt opens on an unscramble; kicks go goal, saved, goal

const seedPlayer = () => ([e, s]) => {
  localStorage.setItem('sty-player', JSON.stringify({ state: { enrolment: e }, version: 1 }))
  if (s) localStorage.setItem('sty-season', JSON.stringify({ state: s, version: 1 }))
  localStorage.setItem('sty-settings', JSON.stringify({ state: { graphics: 'high', sound: false, music: false, haptics: false }, version: 1 }))
}
const freshSeason = { runId: 'promo', seed: SEED, mode: 'season', duel: null, award: null, results: {}, history: [] }

async function open(browser, path, season) {
  const { ctx, page, errors } = await phone(browser)
  await ctx.addInitScript(seedPlayer(), [ENROLMENT, season ?? freshSeason])
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 120000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(2500) // let dev-mode compile/refresh settle before the clock is taken over
  return { ctx, page, errors }
}

const CLIPS = {
  /** Enrolment: type a name, house flood, pick a character, admission approved. */
  async enrol(browser) {
    const { ctx, page } = await phone(browser)
    await page.goto(BASE + '/enrol?rec=1&tier=poster', { waitUntil: 'load', timeout: 120000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(2500)
    const r = await recorder(page, `${OUT}/02-enrol.mp4`)
    await r.seconds(0.6)
    await r.tap(page.getByLabel('Your name on the trophy'))
    await r.type('Zara K', 4)
    await r.seconds(0.9)
    await r.tap(page.getByRole('button', { name: 'Next' }))
    await r.seconds(1.0)
    await r.tap(page.getByText('Fortune favours the loud.'))
    await r.seconds(2.6) // the red flood + welcome, then auto-advance
    await r.seconds(0.8)
    await r.tap(page.getByText('Library Ghost'))
    await r.seconds(0.9)
    await r.tap(page.getByRole('button', { name: 'Approve my admission' }))
    await r.seconds(2.8)
    await r.close()
    await ctx.close()
  },

  /** Round 1: three penalties (top-bins goal, a save, a corner goal). */
  async football(browser) {
    const { ctx, page } = await open(browser, '/play/football?rec=1')
    const r = await recorder(page, `${OUT}/03-football.mp4`)
    await r.seconds(0.6)
    await r.tap(page.getByRole('button', { name: 'Ready' }))
    await r.seconds(1.0)
    const box = await page.locator('canvas').boundingBox()
    const W = box.width, H = box.height
    const gw = Math.min(W * 0.86, H * 1.1), gh = gw * 0.34, gx = (W - gw) / 2, gy = H * 0.24
    const ball = { x: W / 2, y: H * 0.84 }
    const scale = (ball.y - (gy + gh / 2)) / (H * 0.32)
    const kick = async (gxN, gyN, power) => {
      const tx = gx + ((gxN + 1) / 2) * gw, ty = gy + gh - gyN * gh
      const d = { x: (tx - ball.x) / scale, y: (ty - ball.y) / scale }
      const len = Math.hypot(d.x, d.y)
      const pxPerFrame = (0.25 + 1.6 * power) * (1000 / FPS)
      const steps = Math.max(2, Math.min(8, Math.round(len / pxPerFrame)))
      const a = { x: box.x + ball.x, y: box.y + ball.y }
      await r.swipe(a, { x: a.x + d.x, y: a.y + d.y }, steps)
      await r.seconds(2.6) // flight + banner + reset
    }
    await kick(0.86, 0.86, 0.92)
    await r.seconds(0.3)
    await kick(-0.45, 0.25, 0.6)
    await r.seconds(0.3)
    await kick(-0.8, 0.8, 0.92)
    await r.close()
    await ctx.close()
  },

  /** Round 2: three correct answers in a row (streak flame, "on fire"). */
  async quiz(browser) {
    const { ctx, page } = await open(browser, '/play/quiz?rec=1')
    const r = await recorder(page, `${OUT}/04-quiz.mp4`)
    await r.seconds(0.6)
    await r.tap(page.getByRole('button', { name: 'Ready' }))
    for (const think of [1.4, 0.9, 0.7]) {
      await r.seconds(think)
      await r.tap(page.locator('button[data-correct]'))
      await r.seconds(think === 0.7 ? 2.4 : 1.6)
      if (think !== 0.7) {
        await r.tap(page.getByRole('button', { name: /Next question/ }))
      }
    }
    await r.close()
    await ctx.close()
  },

  /** Round 3: read a clue, one wrong guess, the right place, "Found", unscramble the word. */
  async hunt(browser) {
    const src = readFileSync('src/game/hunt.ts', 'utf8')
    const clues = [...src.matchAll(/\{ place: '(\w+)', text: '((?:[^'\\]|\\.)*)', word: '(\w+)' \}/g)].map((m) => ({ place: m[1], text: m[2].replace(/\\'/g, "'"), word: m[3] }))
    const NAMES = { library: 'Library', canteen: 'Canteen', lockers: 'Locker room', field: 'Football field', auditorium: 'Auditorium', office: 'Principal’s office', rooftop: 'Rooftop' }
    const { ctx, page } = await open(browser, '/play/hunt?rec=1')
    const r = await recorder(page, `${OUT}/05-hunt.mp4`)
    await r.seconds(0.6)
    await r.tap(page.getByRole('button', { name: 'Ready' }))
    await r.seconds(2.0)
    const text = (await page.locator('p[aria-live="polite"]').first().innerText()).replace(/[“”]/g, '')
    const clue = clues.find((c) => c.text === text)
    const wrong = Object.keys(NAMES).find((k) => k !== clue.place && k !== 'field')
    await r.tap(page.getByRole('button', { name: NAMES[wrong], exact: true }))
    await r.seconds(1.0)
    await r.tap(page.getByRole('button', { name: NAMES[clue.place], exact: true }))
    await r.seconds(1.8)
    await r.tap(page.getByRole('button', { name: 'Open it' }))
    await r.seconds(1.0)
    const tiles = page.locator('button.size-12')
    const letters = await tiles.allInnerTexts()
    const used = new Set()
    for (const ch of clue.word) {
      const j = letters.findIndex((l, k) => l === ch && !used.has(k))
      used.add(j)
      await r.tap(tiles.nth(j))
      await r.frames(5)
    }
    await r.seconds(1.8)
    await r.close()
    await ctx.close()
  },

  /** Round 4: the dance battle, autoplayed on the stepped clock, with the real beat muxed in. */
  async dance(browser) {
    const { ctx, page } = await open(browser, '/play/dance?rec=1&autoplay=1')
    const r = await recorder(page, `${OUT}/_06-dance-silent.mp4`)
    await r.seconds(0.5)
    const tapFrame = r.count()
    await r.tap(page.getByRole('button', { name: 'Ready' }))
    await r.seconds(18)
    await r.close()
    await ctx.close()
    // render the beat offline (same synth as the game) and lay it under the video
    const { ctx: c2, page: p2 } = await phone(browser)
    await p2.goto(BASE + '/dev/beat', { waitUntil: 'load', timeout: 120000 })
    await p2.waitForFunction(() => document.getElementById('status')?.textContent !== 'rendering', null, { timeout: 120000 })
    const b64 = await p2.evaluate(() => window.__beatWav)
    writeFileSync(`${OUT}/_beat.wav`, Buffer.from(b64, 'base64'))
    await c2.close()
    const delayMs = Math.round((tapFrame / FPS) * 1000) // the tap lands on the clock at tapFrame/FPS
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${OUT}/_06-dance-silent.mp4`, '-i', `${OUT}/_beat.wav`,
      '-filter_complex', `[1:a]adelay=${delayMs}|${delayMs},apad[a]`, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', `${OUT}/06-dance.mp4`])
    console.log(`  ${OUT}/06-dance.mp4: audio muxed (offset ${delayMs} ms)`)
  },

  /** Finale: tally, total, grade, Dean's verdict, locker drop and achievements. */
  async finale(browser) {
    const res = (score, detail, stats) => ({ score, detail, at: 1, stats })
    const season = { ...freshSeason, results: {
      football: res(650, '4/5 scored · 3 top bins', { goals: 4, corners: 3 }),
      quiz: res(2300, '9/10 correct · best streak 7', { correct: 9, lifelines: 0 }),
      hunt: res(2200, '5/5 found first try · 0 hints', { firstTry: 5, hints: 0 }),
      dance: res(1800, '88 / 21 / 6 · best combo 52', { maxCombo: 52, perfect: 88 }),
    } }
    const { ctx, page } = await open(browser, '/finale?rec=1&tier=poster', season)
    const r = await recorder(page, `${OUT}/07-finale.mp4`)
    await r.seconds(5.0) // rows, total, grade, verdict, rewards land
    const verdict = await page.locator('blockquote').boundingBox()
    await r.scrollTo(Math.max(0, verdict.y + (await page.evaluate(() => scrollY)) - 160), 1.6)
    await r.seconds(1.6)
    const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
    await r.scrollTo(max, 2.4)
    await r.seconds(1.2)
    await r.close()
    await ctx.close()
  },

  /** The 3D trophy turning, engraved with the player's name and score. */
  async trophy(browser) {
    const { ctx, page } = await phone(browser)
    await page.goto(BASE + '/dev/scenes/trophy?rec=1&spin=5&name=Zara%20K&sub=Red%20House%20%C2%B7%20883%20pts', { waitUntil: 'load', timeout: 120000 })
    await page.waitForTimeout(6000)
    const r = await recorder(page, `${OUT}/08-trophy.mp4`)
    await r.seconds(Number(process.env.TROPHY_SECONDS ?? 6))
    await r.close()
    await ctx.close()
  },

  /** Landing: the 3D corridor, scrolling down to the trophy. */
  async corridor(browser) {
    const { ctx, page } = await phone(browser)
    await page.goto(BASE + '/?rec=1&tier=high', { waitUntil: 'load', timeout: 120000 })
    await page.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 120000 })
    await page.waitForTimeout(12000) // let the scene build and fade in
    const r = await recorder(page, `${OUT}/01-corridor.mp4`)
    const total = Number(process.env.CORRIDOR_SECONDS ?? 6)
    await r.seconds(Math.min(1, total * 0.15))
    const max = await page.evaluate(() => document.querySelector('.hero-track').getBoundingClientRect().height - innerHeight)
    await r.scrollTo(max, total * 0.7)
    await r.seconds(total * 0.15)
    await r.close()
    await ctx.close()
  },
}

await mkdir(OUT, { recursive: true })
const want = process.argv.slice(2)
const browser = await launch()
try {
  for (const name of want.length ? want : Object.keys(CLIPS)) {
    console.log(`recording ${name}…`)
    await CLIPS[name](browser)
  }
} finally {
  await browser.close()
}

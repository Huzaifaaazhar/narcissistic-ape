'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BPM, DANCE_MAX, WINDOWS, danceScore, judge, makeChart, maxPoints, points, songLength, type Judgement, type Note } from '@/game/dance'
import { useSeason } from '@/state/season'
import { usePlayer } from '@/state/player'
import { useSettings } from '@/state/settings'
import { audio } from '@/lib/feedback'
import { playBeat } from '@/lib/beat'
import { RoundHud, RoundIntro, RoundResults } from './RoundShell'
import { MusicIcon } from '@/components/icons'

type Phase = 'intro' | 'play' | 'done'
const KEYS = ['d', 'f', 'j', 'k']
const ARROWS = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight']
const LANE_COLORS = ['#a8202b', '#24396b', '#c9a24b', '#fbf4e6']
const NOTE_SPEED = 0.55 // fraction of canvas height per second
const beat = 60 / BPM

type Live = {
  hit: boolean[]
  missed: boolean[]
  raw: number
  combo: number
  maxCombo: number
  counts: Record<Judgement, number>
  thirds: { hits: number; total: number }[]
  flash: { text: string; at: number; lane: number } | null
  laneFlash: number[]
}

export function DanceRound() {
  const router = useRouter()
  const seed = useSeason((s) => s.seed)
  const record = useSeason((s) => s.record)
  const startRun = useSeason((s) => s.startRun)
  const house = usePlayer((s) => s.enrolment?.house ?? 'red')
  const chart = useMemo(() => makeChart(seed ?? 'practice'), [seed])

  const [phase, setPhase] = useState<Phase>('intro')
  const [hud, setHud] = useState({ score: 0, combo: 0 })
  const [final, setFinal] = useState<{ score: number; lines: [string, string][]; maxCombo: number; perfect: number } | null>(null)

  const canvas = useRef<HTMLCanvasElement>(null)
  const live = useRef<Live | null>(null)
  const clock = useRef<{ ctx: AudioContext; start: number; latency: number; stop: () => void } | null>(null)

  const songTime = () => {
    const c = clock.current
    return c ? c.ctx.currentTime - c.start - c.latency : -1
  }

  const thirdOf = (t: number) => Math.min(2, Math.floor((t / songLength()) * 3))

  const hitLane = useCallback(
    (lane: number) => {
      const L = live.current
      if (!L) return
      L.laneFlash[lane] = performance.now()
      const t = songTime()
      // nearest unhit note in this lane within the ok window
      let best = -1, bestD = Infinity
      for (let i = 0; i < chart.length; i++) {
        const n = chart[i]!
        if (n.lane !== lane || L.hit[i] || L.missed[i]) continue
        const d = t - n.t
        if (d < -WINDOWS.ok) break
        if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i }
      }
      if (best < 0 || bestD > WINDOWS.ok) return // stray tap: no penalty
      const j = judge(bestD)
      L.hit[best] = true
      L.raw += points(j, L.combo)
      L.combo++
      L.maxCombo = Math.max(L.maxCombo, L.combo)
      L.counts[j]++
      L.thirds[thirdOf(chart[best]!.t)]!.hits++
      L.flash = { text: j.toUpperCase(), at: performance.now(), lane }
      if (useSettings.getState().haptics && 'vibrate' in navigator) navigator.vibrate(j === 'perfect' ? 12 : 6)
    },
    [chart],
  )

  const start = () => {
    if (!seed) startRun()
    const ctx = audio()
    if (!ctx) return
    const s = useSettings.getState()
    const b = playBeat(ctx, s.music || s.sound ? 0.9 : 0)
    const latency = (ctx as AudioContext & { outputLatency?: number }).outputLatency ?? ctx.baseLatency ?? 0
    clock.current = { ctx, start: b.start, latency, stop: b.stop }
    const thirds = [0, 1, 2].map((k) => ({ hits: 0, total: chart.filter((n) => thirdOf(n.t) === k).length }))
    live.current = {
      hit: chart.map(() => false), missed: chart.map(() => false), raw: 0, combo: 0, maxCombo: 0,
      counts: { perfect: 0, great: 0, ok: 0, miss: 0 }, thirds, flash: null, laneFlash: [0, 0, 0, 0],
    }
    setPhase('play')
  }

  // input: keys + lane taps
  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const lane = KEYS.indexOf(e.key.toLowerCase()) >= 0 ? KEYS.indexOf(e.key.toLowerCase()) : ARROWS.indexOf(e.key)
      if (lane >= 0) { e.preventDefault(); hitLane(lane) }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [phase, hitLane])

  // game loop
  useEffect(() => {
    if (phase !== 'play') return
    const c = canvas.current!
    const g = c.getContext('2d')!
    let raf = 0, lastHud = 0
    const rival = 0.72 * maxPoints(chart)
    const resize = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(2, devicePixelRatio || 1)
      c.width = r.width * dpr; c.height = r.height * dpr
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c)
    const loop = (now: number) => {
      const L = live.current!
      const t = songTime()
      // misses
      for (let i = 0; i < chart.length; i++) {
        const n = chart[i]!
        if (n.t > t) break
        if (!L.hit[i] && !L.missed[i] && t - n.t > WINDOWS.ok) {
          L.missed[i] = true
          L.counts.miss++
          L.combo = 0
          L.flash = { text: 'MISS', at: now, lane: n.lane }
        }
      }
      const r = c.getBoundingClientRect()
      drawStage(g, r.width, r.height, t, chart, L, now, Math.min(1, t / songLength()), L.raw / maxPoints(chart), rival / maxPoints(chart), house)
      if (now - lastHud > 120) { lastHud = now; setHud({ score: danceScore(L.raw, chart), combo: L.combo }) }
      if (t > songLength()) {
        clock.current?.stop()
        const total = chart.length
        const acc = (k: number) => (L.thirds[k]!.total ? L.thirds[k]!.hits / L.thirds[k]!.total : 0)
        const comeback = Math.round((acc(2) - acc(0)) * 100)
        setFinal({
          score: danceScore(L.raw, chart),
          maxCombo: L.maxCombo,
          perfect: L.counts.perfect,
          lines: [
            ['Perfect / great / ok', `${L.counts.perfect} / ${L.counts.great} / ${L.counts.ok}`],
            ['Missed', `${L.counts.miss} of ${total}`],
            ['Judge 1 · Precision', `${Math.round((L.counts.perfect / total) * 100)}% perfect`],
            ['Judge 2 · Flow', `best combo ${L.maxCombo}`],
            ['Judge 3 · Comeback', comeback >= 0 ? `+${comeback}% late surge` : `${comeback}% (faded)`],
          ],
        })
        setPhase('done')
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [phase, chart, house])

  // stop the music if the player leaves mid-song
  useEffect(() => () => clock.current?.stop(), [])

  if (phase === 'intro') {
    return (
      <RoundIntro
        number={4}
        title="The Battle"
        rule="Hit the notes as they cross the line. Chain hits for a bigger multiplier and outdance the rival house. Sound on for this one."
        icon={<MusicIcon size={44} className="text-cream-hi [--icon-accent:var(--color-gold)]" />}
        onStart={start}
        extra={<p className="mt-3 text-[13px] text-ink-soft">Tap the four lanes, or use D F J K (or the arrow keys).</p>}
      />
    )
  }

  if (phase === 'done' && final) {
    return (
      <RoundResults
        title="The Battle · Results"
        score={final.score}
        max={DANCE_MAX}
        lines={final.lines}
        onNext={() => {
          record('dance', final.score, `${final.lines[0]![1]} · ${final.lines[3]![1]}`, { maxCombo: final.maxCombo, perfect: final.perfect })
          router.push('/season')
        }}
        nextLabel="Save and back to the hub"
      />
    )
  }

  return (
    <div className="mx-auto flex h-dvh max-w-[560px] flex-col bg-night">
      <div className="bg-paper">
        <RoundHud label={hud.combo >= 5 ? `Combo ×${hud.combo}` : 'The Battle'} score={hud.score} />
      </div>
      {/* The canvas is pinned inside a sized box: as a direct flex child, Safari sizes it from its
          own width/height attributes, which we rewrite on resize, so it grew until the hit line
          fell off-screen. */}
      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full touch-none select-none"
          onPointerDown={(e) => {
            const r = canvas.current!.getBoundingClientRect()
            hitLane(Math.min(3, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * 4))))
          }}
          role="application"
          aria-label="Rhythm game. Tap a lane, or press D, F, J or K, as each note crosses the line."
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ drawing */

function drawStage(
  g: CanvasRenderingContext2D, W: number, H: number, t: number, chart: Note[], L: Live, now: number,
  progress: number, you: number, rival: number, house: 'red' | 'blue',
) {
  const pulse = t > 0 ? Math.pow(1 - ((t / beat) % 1), 3) : 0
  g.fillStyle = '#0b1020'
  g.fillRect(0, 0, W, H)
  // dance-floor tiles lighting on the beat
  const tile = W / 8
  for (let y = H * 0.18, row = 0; y < H; y += tile, row++) {
    for (let x = 0, col = 0; x < W; x += tile, col++) {
      const lit = (col + row + Math.floor(t / beat)) % 4 === 0
      g.fillStyle = lit ? `rgba(168,32,43,${0.12 + pulse * 0.25})` : (col + row) % 2 ? 'rgba(36,57,107,0.18)' : 'rgba(36,57,107,0.08)'
      g.fillRect(x + 1, y + 1, tile - 2, tile - 2)
    }
  }
  // sweeping spotlights
  for (const [ox, hue, speed] of [[0.2, '255,220,170', 0.6], [0.8, '170,190,255', -0.5]] as const) {
    const a = Math.sin(t * speed) * 0.5
    g.save()
    g.translate(W * ox, 0)
    g.rotate(a)
    const grad = g.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, `rgba(${hue},0.28)`)
    grad.addColorStop(1, `rgba(${hue},0)`)
    g.fillStyle = grad
    g.beginPath(); g.moveTo(-8, 0); g.lineTo(8, 0); g.lineTo(W * 0.22, H); g.lineTo(-W * 0.22, H); g.fill()
    g.restore()
  }

  // you vs rival bars (label column, then bar)
  const lx = 12, bx = 112, bw = W - bx - 12, barH = 8
  g.font = '700 10px "Montserrat Variable", sans-serif'
  g.textAlign = 'left'
  g.textBaseline = 'middle'
  for (const [k, label, fill, frac] of [
    [0, 'YOU', house === 'red' ? '#c22f3a' : '#3d5ba0', you],
    [1, `RIVAL · ${house === 'red' ? 'BLUE' : 'RED'}`, 'rgba(251,244,230,0.5)', rival * progress],
  ] as const) {
    const y = 14 + k * 18
    g.fillStyle = '#fbf4e6'
    g.fillText(label, lx, y + barH / 2)
    g.fillStyle = 'rgba(251,244,230,0.12)'
    g.fillRect(bx, y, bw, barH)
    g.fillStyle = fill
    g.fillRect(bx, y, bw * Math.min(1, frac), barH)
  }
  g.textBaseline = 'alphabetic'

  // lanes
  const top = H * 0.12
  const hitY = H * 0.84
  const lw = W / 4
  for (let l = 0; l < 4; l++) {
    const flash = Math.max(0, 1 - (now - L.laneFlash[l]!) / 180)
    g.fillStyle = `rgba(251,244,230,${0.04 + flash * 0.16})`
    g.fillRect(l * lw + 4, top, lw - 8, H - top)
    // receptor
    g.strokeStyle = LANE_COLORS[l]!
    g.lineWidth = 3
    g.beginPath(); g.arc(l * lw + lw / 2, hitY, Math.min(lw * 0.32, 30) * (1 + flash * 0.15 + pulse * 0.05), 0, Math.PI * 2); g.stroke()
    g.fillStyle = 'rgba(251,244,230,0.6)'
    g.font = '700 12px "Montserrat Variable", sans-serif'
    g.textAlign = 'center'
    g.fillText(KEYS[l]!.toUpperCase(), l * lw + lw / 2, hitY + 4)
  }
  g.strokeStyle = 'rgba(251,244,230,0.5)'
  g.lineWidth = 2
  g.beginPath(); g.moveTo(0, hitY); g.lineTo(W, hitY); g.stroke()

  // notes
  const speed = NOTE_SPEED * H
  for (let i = 0; i < chart.length; i++) {
    const n = chart[i]!
    const y = hitY - (n.t - t) * speed
    if (y < top - 40) break
    if (y > H + 40 || L.hit[i]) continue
    const x = n.lane * lw + lw / 2
    const r = Math.min(lw * 0.3, 28)
    g.globalAlpha = L.missed[i] ? 0.25 : 1
    g.fillStyle = LANE_COLORS[n.lane]!
    g.beginPath(); g.roundRect(x - r, y - r * 0.55, r * 2, r * 1.1, r * 0.5); g.fill()
    g.fillStyle = n.lane === 3 || n.lane === 2 ? '#101d3a' : '#fbf4e6'
    g.beginPath(); g.arc(x, y, r * 0.18, 0, Math.PI * 2); g.fill()
    g.globalAlpha = 1
  }

  // judgement pop
  if (L.flash && now - L.flash.at < 450) {
    const k = (now - L.flash.at) / 450
    g.globalAlpha = 1 - k
    g.fillStyle = L.flash.text === 'MISS' ? '#c22f3a' : L.flash.text === 'PERFECT' ? '#c9a24b' : '#fbf4e6'
    g.font = `400 ${28 + (1 - k) * 8}px Anton, Impact, sans-serif`
    g.textAlign = 'center'
    g.fillText(L.flash.text, L.flash.lane * lw + lw / 2, hitY - 70 - k * 20)
    g.globalAlpha = 1
  }
  if (L.combo >= 5) {
    g.fillStyle = 'rgba(251,244,230,0.9)'
    g.font = '400 40px Anton, Impact, sans-serif'
    g.textAlign = 'center'
    g.fillText(`${L.combo}`, W / 2, H * 0.36)
    g.font = '700 11px "Montserrat Variable", sans-serif'
    g.fillText('COMBO', W / 2, H * 0.36 + 18)
  }
  // count-in
  if (t < 0 || t < 4 * beat) {
    const left = Math.ceil(4 - Math.max(0, t) / beat)
    g.fillStyle = '#fbf4e6'
    g.font = '400 72px Anton, Impact, sans-serif'
    g.textAlign = 'center'
    g.fillText(left > 0 ? String(left) : 'GO', W / 2, H * 0.5)
  }
  // progress
  g.fillStyle = 'rgba(201,162,75,0.9)'
  g.fillRect(0, H - 3, W * progress, 3)
}

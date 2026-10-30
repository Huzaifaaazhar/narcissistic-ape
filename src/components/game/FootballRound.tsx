'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FOOTBALL_MAX, SHOTS, resolveShot, type Shot, type ShotResult } from '@/game/football'
import { useSeason } from '@/state/season'
import { feedback } from '@/lib/feedback'
import { RoundHud, RoundIntro, RoundResults } from './RoundShell'
import { CheckIcon, CloseIcon, FootballIcon } from '@/components/icons'

type Phase = 'intro' | 'play' | 'done'
type Flight = { shot: Shot; result: ShotResult; t0: number; dur: number }

const OUTCOME_TEXT = { goal: 'GOAL!', saved: 'SAVED!', wide: 'WIDE!', over: 'OVER THE BAR!' } as const

/** Screen layout derived from canvas size (CSS px). */
function layout(W: number, H: number) {
  const gw = Math.min(W * 0.86, H * 1.1)
  const gh = gw * 0.34
  const gx = (W - gw) / 2
  const gy = H * 0.24
  return { gw, gh, gx, gy, ball: { x: W / 2, y: H * 0.84, r: Math.max(10, W * 0.045) } }
}
type L = ReturnType<typeof layout>
const toScreen = (l: L, x: number, y: number) => ({ x: l.gx + ((x + 1) / 2) * l.gw, y: l.gy + l.gh - y * l.gh })
const toGoal = (l: L, sx: number, sy: number) => ({ x: ((sx - l.gx) / l.gw) * 2 - 1, y: (l.gy + l.gh - sy) / l.gh })

export function FootballRound() {
  const router = useRouter()
  const seed = useSeason((s) => s.seed)
  const record = useSeason((s) => s.record)
  const startRun = useSeason((s) => s.startRun)

  const [phase, setPhase] = useState<Phase>('intro')
  const [results, setResults] = useState<ShotResult[]>([])
  const [banner, setBanner] = useState<string | null>(null)
  const score = results.reduce((a, r) => a + r.points, 0)

  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useRef({ W: 390, H: 600 })
  const flight = useRef<Flight | null>(null)
  const aim = useRef({ x: 0, y: 0.5, visible: false })
  const drag = useRef<{ pts: { x: number; y: number; t: number }[] } | null>(null)
  const busy = useRef(false)
  const shotIndex = results.length

  const shoot = useCallback(
    (shot: Shot) => {
      if (busy.current || shotIndex >= SHOTS) return
      busy.current = true
      const result = resolveShot(shot, shotIndex, seed ?? 'practice')
      feedback('kick')
      flight.current = { shot, result, t0: performance.now(), dur: 700 - shot.power * 260 }
      window.setTimeout(() => {
        feedback(result.outcome === 'goal' ? 'goal' : 'wrong')
        setBanner(OUTCOME_TEXT[result.outcome] + (result.corner ? ' Top bins +50' : ''))
      }, flight.current.dur)
      window.setTimeout(() => {
        setResults((r) => [...r, result])
        setBanner(null)
        flight.current = null
        busy.current = false
        aim.current.visible = false
      }, flight.current.dur + 1300)
    },
    [seed, shotIndex],
  )

  useEffect(() => {
    if (results.length === SHOTS) {
      const t = setTimeout(() => setPhase('done'), 300)
      return () => clearTimeout(t)
    }
  }, [results.length])

  // render loop
  useEffect(() => {
    if (phase !== 'play') return
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    let raf = 0
    const resize = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(2, devicePixelRatio || 1)
      c.width = r.width * dpr
      c.height = r.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      size.current = { W: r.width, H: r.height }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c)
    const loop = (now: number) => {
      draw(ctx, size.current.W, size.current.H, now, flight.current, aim.current, drag.current)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [phase])

  // keyboard: arrows aim, space/enter shoots
  useEffect(() => {
    if (phase !== 'play') return
    const onKey = (e: KeyboardEvent) => {
      const a = aim.current
      const step = 0.12
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(e.key)) e.preventDefault()
      if (e.key === 'ArrowLeft') a.x = Math.max(-1.1, a.x - step)
      if (e.key === 'ArrowRight') a.x = Math.min(1.1, a.x + step)
      if (e.key === 'ArrowUp') a.y = Math.min(1.15, a.y + step)
      if (e.key === 'ArrowDown') a.y = Math.max(0.05, a.y - step)
      if (e.key.startsWith('Arrow')) a.visible = true
      if (e.key === ' ' || e.key === 'Enter') shoot({ x: a.x, y: a.y, power: 0.75, curve: 0 })
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [phase, shoot])

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }
  }
  const onDown = (e: React.PointerEvent) => {
    if (busy.current) return
    canvas.current!.setPointerCapture(e.pointerId)
    drag.current = { pts: [pos(e)] }
  }
  const onMove = (e: React.PointerEvent) => {
    if (drag.current) drag.current.pts.push(pos(e))
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d || busy.current) return
    const pts = [...d.pts, pos(e)]
    const a = pts[0]!, b = pts[pts.length - 1]!
    const dx = b.x - a.x, dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    const l = layout(size.current.W, size.current.H)
    if (len < 24) {
      // a tap on the goal shoots straight at that spot
      const g = toGoal(l, a.x, a.y)
      if (g.y > -0.2 && g.y < 1.4 && Math.abs(g.x) < 1.4) shoot({ x: g.x, y: g.y, power: 0.7, curve: 0 })
      return
    }
    if (dy > -10) return // swipes must go up the pitch
    // Swipe toward the spot: the swipe vector is scaled so a typical swipe (~a third of the
    // screen) reaches mid-goal. Short = low, long = high, too long = over the bar.
    const scale = (l.ball.y - (l.gy + l.gh / 2)) / (size.current.H * 0.32)
    const g = toGoal(l, l.ball.x + dx * scale, l.ball.y + dy * scale)
    const x = g.x
    const y = Math.max(0.04, g.y)
    // bulge of the path from the straight line → curve
    let bulge = 0
    for (const p of pts) {
      const cross = ((p.x - a.x) * dy - (p.y - a.y) * dx) / len
      if (Math.abs(cross) > Math.abs(bulge)) bulge = cross
    }
    const curve = Math.max(-1, Math.min(1, (-bulge / len) * 5))
    const speed = len / Math.max(16, b.t - a.t)
    const power = Math.max(0, Math.min(1, (speed - 0.25) / 1.6))
    shoot({ x, y, power, curve })
  }

  const finish = () => {
    const goals = results.filter((r) => r.outcome === 'goal').length
    const corners = results.filter((r) => r.corner).length
    record('football', score, `${goals}/${SHOTS} scored · ${corners} top bins`, { goals, corners })
    router.push('/season')
  }

  if (phase === 'intro') {
    return (
      <RoundIntro
        number={1}
        title="The Match"
        rule="Five penalties. Swipe up toward where you want it to go; curve your swipe to bend it, swipe fast for power. Corners score a bonus. The keeper learns."
        icon={<FootballIcon size={44} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:transparent]" />}
        onStart={() => {
          if (!seed) startRun()
          feedback('whistle')
          setPhase('play')
        }}
        extra={<p className="mt-3 text-[13px] text-ink-soft">Keyboard: arrow keys to aim, Space to shoot. Or tap a spot in the goal.</p>}
      />
    )
  }

  if (phase === 'done') {
    const goals = results.filter((r) => r.outcome === 'goal').length
    return (
      <RoundResults
        title="The Match · Results"
        score={score}
        max={FOOTBALL_MAX}
        lines={[
          ['Goals', `${goals} of ${SHOTS}`],
          ['Top-bins bonuses', String(results.filter((r) => r.corner).length)],
          ['Saves by the keeper', String(results.filter((r) => r.outcome === 'saved').length)],
        ]}
        onNext={finish}
        nextLabel="Save and back to the hub"
      />
    )
  }

  return (
    <div className="mx-auto flex h-dvh max-w-[560px] flex-col bg-night sm:my-0 sm:shadow-lift">
      <div className="bg-paper">
        <RoundHud label={`Kick ${Math.min(shotIndex + 1, SHOTS)}/${SHOTS}`} score={score}>
          <span className="flex gap-1" aria-label={`${results.filter((r) => r.outcome === 'goal').length} goals so far`}>
            {Array.from({ length: SHOTS }, (_, k) => {
              const r = results[k]
              return (
                <span key={k} className={`grid size-6 place-items-center rounded-full border-2 ${r ? (r.outcome === 'goal' ? 'border-navy bg-navy text-cream-hi' : 'border-red bg-red text-cream-hi') : 'border-ink-soft/40'}`}>
                  {r ? r.outcome === 'goal' ? <CheckIcon size={12} /> : <CloseIcon size={10} /> : null}
                </span>
              )
            })}
          </span>
        </RoundHud>
      </div>
      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full touch-none select-none"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => (drag.current = null)}
          role="img"
          aria-label="Penalty: swipe up toward the goal to shoot, or tap a spot in the goal."
        />
        {banner && (
          <p className="pop-points pointer-events-none absolute inset-x-0 top-[8%] text-center font-[family-name:var(--font-condensed)] text-[48px] text-cream-hi uppercase drop-shadow-[0_3px_0_rgb(0_0_0_/_0.35)]" role="status">
            {banner}
          </p>
        )}
        <p className="pointer-events-none absolute inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] text-center text-[13px] font-semibold text-cream-hi/80">
          Swipe up from the ball · curve it to bend it
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ drawing */

function draw(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  now: number,
  f: Flight | null,
  aim: { x: number; y: number; visible: boolean },
  drag: { pts: { x: number; y: number }[] } | null,
) {
  const l = layout(W, H)
  // dusk sky + stands
  const sky = ctx.createLinearGradient(0, 0, 0, l.gy + l.gh)
  sky.addColorStop(0, '#2b2a4a')
  sky.addColorStop(0.55, '#a9586a')
  sky.addColorStop(1, '#f2a35c')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#1c1730'
  ctx.fillRect(0, l.gy - l.gh * 0.55, W, l.gh * 0.75)
  for (let i = 0; i < 60; i++) {
    const x = (i * 97) % W, y = l.gy - l.gh * 0.5 + ((i * 37) % (l.gh * 0.6))
    ctx.fillStyle = i % 3 ? 'rgba(255,220,180,0.35)' : i % 2 ? 'rgba(168,32,43,0.6)' : 'rgba(36,57,107,0.7)'
    ctx.fillRect(x, y, 3, 3)
  }
  // floodlight glow
  const glow = ctx.createRadialGradient(W * 0.85, l.gy - l.gh * 0.7, 0, W * 0.85, l.gy - l.gh * 0.7, W * 0.5)
  glow.addColorStop(0, 'rgba(255,240,210,0.55)')
  glow.addColorStop(1, 'rgba(255,240,210,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // pitch with mowing stripes
  const top = l.gy + l.gh - 2
  for (let i = 0; i < 9; i++) {
    const y0 = top + (H - top) * Math.pow(i / 9, 1.6)
    const y1 = top + (H - top) * Math.pow((i + 1) / 9, 1.6)
    ctx.fillStyle = i % 2 ? '#4f8a3a' : '#5a9842'
    ctx.fillRect(0, y0, W, y1 - y0 + 1)
  }
  const shade = ctx.createLinearGradient(0, top, 0, H)
  shade.addColorStop(0, 'rgba(20,10,30,0.35)')
  shade.addColorStop(1, 'rgba(20,10,30,0)')
  ctx.fillStyle = shade
  ctx.fillRect(0, top, W, H - top)
  // box lines
  ctx.strokeStyle = 'rgba(251,244,230,0.85)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(l.gx - l.gw * 0.25, top); ctx.lineTo(l.gx - l.gw * 0.45, H * 0.72); ctx.lineTo(l.gx + l.gw * 1.45, H * 0.72); ctx.lineTo(l.gx + l.gw * 1.25, top)
  ctx.moveTo(0, top); ctx.lineTo(W, top)
  ctx.stroke()
  ctx.fillStyle = 'rgba(251,244,230,0.9)'
  ctx.beginPath(); ctx.ellipse(l.ball.x, l.ball.y + l.ball.r * 0.9, l.ball.r * 0.5, l.ball.r * 0.18, 0, 0, Math.PI * 2); ctx.fill()

  // net (back panel, then side lines)
  const back = { x: l.gx + l.gw * 0.04, y: l.gy - l.gh * 0.08, w: l.gw * 0.92, h: l.gh * 1.02 }
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(back.x, back.y, back.w, back.h)
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 1
  const ripple = f && f.result.outcome === 'goal' ? Math.max(0, 1 - (now - f.t0 - f.dur) / 900) : 0
  for (let i = 0; i <= 24; i++) {
    const x = back.x + (back.w * i) / 24
    ctx.beginPath(); ctx.moveTo(x, back.y); ctx.lineTo(x + Math.sin(i + now / 60) * ripple * 3, back.y + back.h); ctx.stroke()
  }
  for (let j = 0; j <= 8; j++) {
    const y = back.y + (back.h * j) / 8
    ctx.beginPath(); ctx.moveTo(back.x, y); ctx.lineTo(back.x + back.w, y + Math.sin(j + now / 70) * ripple * 3); ctx.stroke()
  }

  // keeper
  const k0 = f ? f.result.keeper : { x: 0, y: 0.5, read: false }
  // on a goal he must visibly fall short, or it reads as a save
  const k = f && f.result.outcome === 'goal' ? { ...k0, x: k0.x * 0.78, y: Math.min(k0.y, 0.42) } : k0
  const t = f ? Math.min(1, Math.max(0, (now - f.t0 - f.dur * 0.15) / (f.dur * 0.55))) : 0
  const ease = 1 - Math.pow(1 - t, 3)
  const idle = f ? 0 : Math.sin(now / 260) * 0.03
  const kx = idle + k.x * ease
  const ky = 0.32 + (k.y - 0.32) * ease
  const kp = toScreen(l, kx, ky)
  const tilt = (k.x === 0 ? 0 : Math.sign(k.x)) * ease * 1.1
  drawKeeper(ctx, kp.x, kp.y, l.gh * 0.62, tilt)

  // posts and bar (drawn over keeper/net)
  ctx.fillStyle = '#fbf4e6'
  const post = Math.max(4, l.gw * 0.018)
  ctx.fillRect(l.gx - post, l.gy - post, post, l.gh + post)
  ctx.fillRect(l.gx + l.gw, l.gy - post, post, l.gh + post)
  ctx.fillRect(l.gx - post, l.gy - post, l.gw + post * 2, post)

  // aim reticle (keyboard / tap)
  if (aim.visible && !f) {
    const a = toScreen(l, aim.x, aim.y)
    ctx.strokeStyle = '#c9a24b'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(a.x, a.y, 14, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(a.x - 20, a.y); ctx.lineTo(a.x + 20, a.y); ctx.moveTo(a.x, a.y - 20); ctx.lineTo(a.x, a.y + 20); ctx.stroke()
  }

  // swipe trail
  if (drag && drag.pts.length > 1) {
    ctx.strokeStyle = 'rgba(251,244,230,0.55)'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.beginPath()
    drag.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
    ctx.stroke()
  }

  // ball
  let bx = l.ball.x, by = l.ball.y, br = l.ball.r, spin = 0
  if (f) {
    const p = Math.min(1, (now - f.t0) / f.dur)
    const pre = toScreen(l, f.shot.x, f.shot.y)
    const fin = toScreen(l, f.shot.x + f.shot.curve * 0.18, f.shot.y)
    const saved = f.result.outcome === 'saved'
    const end = saved ? { x: (pre.x + kp.x) / 2, y: (pre.y + kp.y) / 2 } : fin
    bx = l.ball.x + (pre.x - l.ball.x) * p + (end.x - pre.x) * p * p
    by = l.ball.y + (end.y - l.ball.y) * p - Math.sin(Math.PI * p) * l.gh * 0.12
    br = l.ball.r * (1 - 0.62 * p)
    spin = p * 12
    if (saved && p >= 1) {
      // parried away
      const q = Math.min(1, (now - f.t0 - f.dur) / 600)
      bx = end.x + Math.sign(end.x - W / 2 || 1) * q * W * 0.25
      by = end.y + q * l.gh * 0.8
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath(); ctx.ellipse(bx, Math.max(by, top) + br * 0.9, br * 0.9, br * 0.3, 0, 0, Math.PI * 2); ctx.fill()
  drawBall(ctx, bx, by, br, spin)
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(1, '#cfc8bd')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1b1b26'
  for (let i = 0; i < 5; i++) {
    const a = spin + (i * Math.PI * 2) / 5
    const px = x + Math.cos(a) * r * 0.62, py = y + Math.sin(a) * r * 0.62
    ctx.beginPath(); ctx.arc(px, py, r * 0.22, 0, Math.PI * 2); ctx.fill()
  }
  ctx.beginPath(); ctx.arc(x + Math.cos(spin) * r * 0.05, y, r * 0.26, 0, Math.PI * 2); ctx.fill()
}

function drawKeeper(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, tilt: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(tilt)
  const w = h * 0.34
  // legs
  ctx.fillStyle = '#101d3a'
  ctx.fillRect(-w * 0.42, h * 0.12, w * 0.3, h * 0.36)
  ctx.fillRect(w * 0.12, h * 0.12, w * 0.3, h * 0.36)
  // body (navy kit, red sash)
  ctx.fillStyle = '#24396b'
  ctx.beginPath(); ctx.roundRect(-w / 2, -h * 0.26, w, h * 0.42, 6); ctx.fill()
  ctx.fillStyle = '#a8202b'
  ctx.fillRect(-w / 2, -h * 0.06, w, h * 0.06)
  // arms up
  ctx.strokeStyle = '#24396b'
  ctx.lineWidth = w * 0.24
  ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-w * 0.45, -h * 0.2); ctx.lineTo(-w * 1.05, -h * 0.42); ctx.moveTo(w * 0.45, -h * 0.2); ctx.lineTo(w * 1.05, -h * 0.42); ctx.stroke()
  ctx.fillStyle = '#c9a24b'
  ctx.beginPath(); ctx.arc(-w * 1.1, -h * 0.44, w * 0.2, 0, Math.PI * 2); ctx.arc(w * 1.1, -h * 0.44, w * 0.2, 0, Math.PI * 2); ctx.fill()
  // head
  ctx.fillStyle = '#b97d55'
  ctx.beginPath(); ctx.arc(0, -h * 0.36, w * 0.28, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#231a17'
  ctx.beginPath(); ctx.arc(0, -h * 0.4, w * 0.28, Math.PI, 0); ctx.fill()
  ctx.restore()
}

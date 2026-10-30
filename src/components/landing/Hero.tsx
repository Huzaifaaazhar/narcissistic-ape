'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { preload } from 'react-dom'
import { brand } from '@/config/brand'
import { copy } from '@/config/copy'
import { Varsity } from '@/components/ui/Varsity'
import { Divider } from '@/components/ui/Divider'
import { PlayIcon, TrophyIcon } from '@/components/icons'
import { corridorInput } from '@/three/input'
import { useTier } from '@/three/quality'
import { usePlayer } from '@/state/player'
import { SettingsButton } from '@/components/layout/SettingsButton'

const CorridorCanvas = dynamic(() => import('@/three/CorridorCanvas'), { ssr: false })

/**
 * Landing hero: a 260vh scroll track with a sticky stage. The poster paints first (LCP);
 * the live corridor loads after `load` + idle and cross-fades in once it has drawn a frame.
 * Scroll progress drives the camera dolly and the overlay without re-rendering React.
 */
export function Hero() {
  preload('/posters/corridor-portrait.webp', { as: 'image', fetchPriority: 'high', media: '(orientation: portrait)' })
  preload('/posters/corridor-landscape.webp', { as: 'image', fetchPriority: 'high', media: '(orientation: landscape)' })

  const track = useRef<HTMLDivElement>(null)
  const tier = useTier()
  const [load3d, setLoad3d] = useState(false)
  const [live, setLive] = useState(false)
  const [failed, setFailed] = useState(false)
  const enrolment = usePlayer((s) => s.enrolment)

  // Defer the 3D chunk. Desktop: after `load` + idle. Phones: the poster is already the hero, so
  // boot the scene on first scroll/touch to keep first-load main-thread work and
  // battery cost down. No timer fallback: an idle reader shouldn't pay for a scene they aren't using.
  useEffect(() => {
    if (!tier || tier === 'poster') return
    const go = () => setLoad3d(true)
    const cleanups: (() => void)[] = []
    if (tier === 'low') {
      const evs = ['scroll', 'touchstart', 'pointerdown', 'keydown'] as const
      const once = () => go()
      evs.forEach((e) => addEventListener(e, once, { once: true, passive: true }))
      cleanups.push(() => evs.forEach((e) => removeEventListener(e, once)))
    } else {
      type IdleWin = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void }
      const w = window as IdleWin
      let handle = 0
      const onLoad = () => { handle = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 2500 }) : window.setTimeout(go, 300) }
      if (document.readyState === 'complete') onLoad()
      else addEventListener('load', onLoad, { once: true })
      cleanups.push(() => {
        removeEventListener('load', onLoad)
        if (w.cancelIdleCallback) w.cancelIdleCallback(handle)
        else clearTimeout(handle)
      })
    }
    return () => cleanups.forEach((c) => c())
  }, [tier])

  // Scroll → progress (0..1), written to the 3D input object and a CSS var. rAF-throttled.
  useEffect(() => {
    const el = track.current!
    let raf = 0
    const fixed = new URLSearchParams(location.search).get('p')
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const span = r.height - innerHeight
      const p = fixed !== null ? Number(fixed) : Math.min(1, Math.max(0, -r.top / Math.max(1, span)))
      corridorInput.progress = p
      el.style.setProperty('--p', p.toFixed(4))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const show3d = load3d && !failed && tier && tier !== 'poster'
  return (
    <div ref={track} className="hero-track relative h-[260vh]" style={{ ['--p' as string]: 0 }}>
      <div className="sticky top-0 h-dvh w-full overflow-hidden bg-[#c9a07a]">
        {/* Poster: LCP element and permanent fallback. Gentle zoom with scroll stands in for the dolly. */}
        <picture>
          <source media="(orientation: landscape)" srcSet="/posters/corridor-landscape.webp" />
          <img
            src="/posters/corridor-portrait.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            className="hero-poster absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        {show3d && (
          <CorridorCanvas
            tier={tier}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-[var(--ease-out-expo)] ${live ? 'opacity-100' : 'opacity-0'}`}
            onReady={() => setLive(true)}
            onFallback={() => setFailed(true)}
          />
        )}

        {/* scrims keep overlay text readable over a bright scene */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-[#f4e7d1d9] via-[#f4e7d166] to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#1b1310cc] to-transparent" />

        <header className="hero-title absolute inset-x-0 top-0 flex flex-col items-center px-4 pt-[max(28px,env(safe-area-inset-top))] text-center">
          <p className="label text-[12px] tracking-[0.42em] text-ink sm:text-[13px]">{copy.landing.kicker}</p>
          <h1 className="mt-4 text-[46px] sm:text-[84px]">
            <Varsity>STUDENT OF<br />THE YEAR</Varsity>
          </h1>
          <p className="label mt-5 text-[12px] font-extrabold text-navy sm:text-[15px]">{brand.tagline}</p>
          <Divider className="mt-4 max-w-[300px]" />
        </header>

        <SettingsButton className="absolute top-[max(14px,env(safe-area-inset-top))] right-3 z-10" />

        <div className="hero-end pointer-events-none absolute inset-x-0 top-[16%] px-6 text-center">
          <p className="font-[family-name:var(--font-condensed)] text-[34px] leading-none text-navy uppercase drop-shadow-[0_1px_0_#fbf4e6] sm:text-[52px]">{copy.landing.endLine}</p>
          <p className="label mt-3 text-[13px] font-extrabold text-maroon">{copy.landing.endSub}</p>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-[max(22px,env(safe-area-inset-bottom))]">
          <Link href="/enrol" className="btn btn-block max-w-[360px]">
            <span className="btn-face">
              <span className="btn-stub">
                {enrolment ? <PlayIcon size={20} className="[--icon-accent:currentColor]" /> : <TrophyIcon size={22} className="[--icon-accent:var(--color-gold)] [--icon-paper:var(--color-red)]" />}
              </span>
              <span>{enrolment ? copy.landing.ctaReturning(enrolment.nickname) : copy.landing.cta}</span>
            </span>
          </Link>
          <p className="hero-hint label text-[11px] text-cream-hi/90" aria-hidden="true">{copy.landing.scrollHint}</p>
        </div>
      </div>
    </div>
  )
}

'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { brand } from '@/config/brand'
import { copy } from '@/config/copy'
import { ROUNDS, roundMax, weights } from '@/config/scoring'
import { totalScore } from '@/game/scoring'
import { deanVerdict, grade } from '@/game/dean'
import { useSeason } from '@/state/season'
import { usePlayer } from '@/state/player'
import { useTier } from '@/three/quality'
import { feedback } from '@/lib/feedback'
import { TornCard } from '@/components/ui/TornCard'
import { Divider } from '@/components/ui/Divider'
import { ScoreCounter } from '@/components/ui/ScoreCounter'
import { Button } from '@/components/ui/Button'
import { Toast, ToastRegion } from '@/components/ui/Toast'
import { MedalIcon, PlayIcon } from '@/components/icons'

const TrophyViewer = dynamic(() => import('@/three/TrophyViewer'), { ssr: false })

/** The Dean's verdict: tally → total → verdict → trophy. Local-first until the server version. */
export function Finale() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- persisted stores hydrate after mount
  useEffect(() => setReady(true), [])
  const enrolment = usePlayer((s) => s.enrolment)
  const results = useSeason((s) => s.results)
  const history = useSeason((s) => s.history)
  const seed = useSeason((s) => s.seed)
  const finishRun = useSeason((s) => s.finishRun)
  const startRun = useSeason((s) => s.startRun)
  const tier = useTier()
  const [stage, setStage] = useState(0)
  const [humble, setHumble] = useState(false)

  const scores = useMemo(() => Object.fromEntries(ROUNDS.map((r) => [r, results[r]?.score ?? 0])), [results])
  const total = totalScore(scores)
  const complete = ROUNDS.every((r) => results[r])
  const prevBest = history.reduce((m, r) => Math.max(m, r.total), 0)

  // reveal in beats: tally rows, total, verdict, trophy
  useEffect(() => {
    if (!ready || !complete) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers = [1, 2, 3, 4, 5, 6, 7].map((s, k) =>
      window.setTimeout(() => { setStage(s); if (s === 5) feedback('stamp') }, reduce ? 0 : 450 + k * 520),
    )
    return () => timers.forEach(clearTimeout)
  }, [ready, complete])

  if (!ready) return <div className="min-h-dvh" />
  if (!enrolment || !complete) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center px-5 text-center">
        <h1 className="font-[family-name:var(--font-condensed)] text-[44px] leading-none text-navy uppercase">Not so fast</h1>
        <p className="mt-4 text-[17px] text-ink">The Dean only hands out verdicts after all four rounds.</p>
        <Link href="/season" className="btn btn-block mt-8 max-w-[360px]"><span className="btn-face">Back to the hub</span></Link>
      </main>
    )
  }

  const playAgain = () => {
    finishRun()
    startRun()
    router.push('/season')
  }
  const name = enrolment.nickname
  const verdict = deanVerdict(total, name, enrolment.house, seed ?? 'x')

  return (
    <main className="mx-auto max-w-[560px] px-4 pt-[max(24px,env(safe-area-inset-top))] pb-16 lg:max-w-[1040px]">
      <p className="label text-center text-[12px] font-bold tracking-[0.3em] text-maroon">The Dean’s verdict</p>
      <h1 className="mt-2 text-center font-[family-name:var(--font-condensed)] text-[52px] leading-none text-navy uppercase">Season results</h1>
      <Divider className="mt-5" />

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <TornCard seed="finale-tally" paperClassName="px-5 py-5">
            <ul className="space-y-3">
              {ROUNDS.map((r, k) => {
                const meta = copy.rounds[r]
                const pts = Math.round((scores[r]! / roundMax[r]) * weights[r] * 1000)
                return (
                  <li key={r} className={`flex items-baseline justify-between border-b border-dashed border-ink-soft/30 pb-2 transition-all duration-500 ${stage > k ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
                    <span>
                      <span className="label block text-[11px] font-bold text-ink">Round {meta.n} · {meta.title}</span>
                      <span className="text-[13px] text-ink-soft">{results[r]!.detail}</span>
                    </span>
                    <span className="font-[family-name:var(--font-slab)] text-[22px] text-maroon">+{pts}</span>
                  </li>
                )
              })}
            </ul>
            <div className={`mt-5 text-center transition-opacity duration-500 ${stage >= 5 ? 'opacity-100' : 'opacity-0'}`}>
              <p className="label text-[11px] text-ink-soft">Season total · out of 1000</p>
              <p className="font-[family-name:var(--font-slab)] text-[80px] leading-none text-navy">{stage >= 5 ? <ScoreCounter value={total} digits={String(total).length} label="Season total" /> : '0'}</p>
              <p className="collegiate mt-2 text-[24px] text-maroon">{grade(total).toUpperCase()}</p>
              {total > prevBest && prevBest > 0 && <p className="label mt-2 text-[11px] font-bold text-navy">New personal best (was {prevBest})</p>}
            </div>
          </TornCard>

          <blockquote className={`mt-6 border-l-4 border-red pl-4 transition-opacity duration-700 ${stage >= 6 ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-[19px] leading-snug text-ink italic [font-family:var(--font-slab-italic)]">“{verdict}”</p>
            <footer className="label mt-2 text-[11px] text-ink-soft">The Dean, {brand.schoolLong}</footer>
          </blockquote>
        </div>

        <div className={`transition-opacity duration-700 ${stage >= 7 ? 'opacity-100' : 'opacity-0'}`}>
          <figure className="overflow-hidden rounded-[2px] bg-[#0b0c11] shadow-lift">
            <div className="relative aspect-square w-full">
              {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised poster fallback */}
              <img src="/posters/trophy-square.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
              {tier && tier !== 'poster' && stage >= 7 && !humble && (
                <TrophyViewer tier={tier} name={name} sub={`${total} pts · ${brand.houses[enrolment.house].name}`} className="absolute inset-0" />
              )}
              {humble && (
                <div className="absolute inset-0 grid place-items-center bg-night/85 px-8 text-center text-cream-hi">
                  <div>
                    <MedalIcon size={56} className="mx-auto text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:var(--color-night)]" />
                    <p className="collegiate mt-4 text-[28px]">HUMBLE LEGEND</p>
                    <p className="mt-2 text-[15px] text-cream-hi/85">You turned down the trophy. The Dean is speechless, which has never happened before.</p>
                  </div>
                </div>
              )}
            </div>
            <figcaption className="px-4 py-3 text-center text-[14px] text-cream-hi/85">{tier && tier !== 'poster' ? 'Your name, your score, engraved. Drag to turn it.' : `Engraved for ${name} · ${total} pts`}</figcaption>
          </figure>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button block onClick={playAgain} icon={<PlayIcon size={20} className="[--icon-accent:currentColor]" />}>Play another season</Button>
            <Link href="/" className="label min-h-11 px-3 pt-3 text-[11px] font-bold text-navy underline-offset-4 hover:underline">Back to the corridor</Link>
            {!humble && (
              <button type="button" onClick={() => { setHumble(true); feedback('streak') }} className="mt-2 text-[12px] text-ink-soft/70 underline-offset-4 hover:underline">
                Decline the trophy
              </button>
            )}
          </div>
        </div>
      </div>
      {humble && (
        <ToastRegion>
          <Toast enter icon={<MedalIcon size={22} />}>Rare badge unlocked: Humble Legend</Toast>
        </ToastRegion>
      )}
    </main>
  )
}

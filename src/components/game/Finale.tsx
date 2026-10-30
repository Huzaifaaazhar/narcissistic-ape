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
import { DuelIcon, FlameIcon, MedalIcon, PlayIcon, ShareIcon, icons, type IconName } from '@/components/icons'
import { Patch } from '@/components/ui/Patch'
import { useProgress } from '@/state/progress'
import { ACHIEVEMENTS } from '@/game/progress'
import { encodeDuel } from '@/game/duel'
import { makeShareCard, shareLink, shareOrDownload } from '@/lib/shareCard'
import { useInstallPrompt } from '@/lib/pwa'

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
  const mode = useSeason((s) => s.mode)
  const duel = useSeason((s) => s.duel)
  const award = useSeason((s) => s.award)
  const setAward = useSeason((s) => s.setAward)
  const applySeason = useProgress((s) => s.applySeason)
  const unlock = useProgress((s) => s.unlock)
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const tier = useTier()
  const pwa = useInstallPrompt()
  const [stage, setStage] = useState(0)
  const [humble, setHumble] = useState(false)

  const scores = useMemo(() => Object.fromEntries(ROUNDS.map((r) => [r, results[r]?.score ?? 0])), [results])
  const total = totalScore(scores)
  const complete = ROUNDS.every((r) => results[r])
  const prevBest = history.reduce((m, r) => Math.max(m, r.total), 0)

  // award once per run: streak, XP, achievements, locker drop
  useEffect(() => {
    if (!ready || !complete || award || !enrolment) return
    const stats = Object.assign({}, ...ROUNDS.map((r) => results[r]?.stats ?? {}))
    setAward(applySeason({ total, mode, beatDuel: !!duel && total > duel.total, stats, declined: false }, seed ?? 'x'))
  }, [ready, complete, award, enrolment, results, total, mode, duel, seed, applySeason, setAward])

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
  const origin = typeof location === 'undefined' ? '' : location.origin
  const duelUrl = `${origin}/duel?c=${encodeDuel({ seed: seed ?? 'season', name, house: enrolment.house, total })}`

  const share = async () => {
    setBusy('share')
    try {
      const blob = await makeShareCard({ name, house: enrolment.house, total, grade: grade(total), school: brand.schoolLong, url: location.host, title: brand.gameTitle })
      const r = await shareOrDownload(blob, `I scored ${total}/1000 at ${brand.school}. Beat that.`, duelUrl)
      setNote(r === 'downloaded' ? 'Card saved to your downloads.' : r === 'shared' ? 'Shared. The rivalry begins.' : null)
    } finally {
      setBusy(null)
    }
  }
  const challenge = async () => {
    setBusy('duel')
    try {
      const r = await shareLink(`I scored ${total} in ${brand.gameTitle}. Same questions, same beats. Beat me:`, duelUrl)
      setNote(r === 'copied' ? 'Challenge link copied. Send it to a friend.' : r === 'shared' ? 'Challenge sent.' : null)
    } finally {
      setBusy(null)
    }
  }

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

          {duel && stage >= 6 && (
            <div className={`mt-6 rounded-[2px] p-4 text-center text-cream-hi shadow-lift ${total > duel.total ? 'bg-navy' : 'bg-red'}`} role="status">
              <p className="label text-[11px] font-bold">Duel result</p>
              <p className="mt-1 font-[family-name:var(--font-condensed)] text-[30px] leading-none uppercase">
                You {total} · {duel.name} {duel.total}
              </p>
              <p className="mt-1 text-[14px]">{total > duel.total ? 'You win. Same questions, same beats, better student.' : total === duel.total ? 'A dead heat. Rematch?' : `${duel.name} takes it this time. Rematch?`}</p>
            </div>
          )}

          {award && stage >= 7 && <Rewards award={award} />}
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
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" size="sm" block loading={busy === 'share'} onClick={share} icon={<ShareIcon size={18} className="[--icon-paper:transparent] text-cream-hi" />}>Share card</Button>
            <Button variant="secondary" size="sm" block loading={busy === 'duel'} onClick={challenge} icon={<DuelIcon size={18} className="[--icon-accent:var(--color-gold)] text-cream-hi" />}>Challenge</Button>
          </div>
          {note && <p className="mt-2 text-center text-[13px] font-semibold text-navy" role="status">{note}</p>}
          <div className="mt-4 flex flex-col items-center gap-3">
            <Button block onClick={playAgain} icon={<PlayIcon size={20} className="[--icon-accent:currentColor]" />}>Play another season</Button>
            {pwa.can && (
              <Button variant="ghost" size="sm" onClick={() => void pwa.install()}>Add to home screen</Button>
            )}
            <Link href="/" className="label min-h-11 px-3 pt-3 text-[11px] font-bold text-navy underline-offset-4 hover:underline">Back to the corridor</Link>
            {!humble && (
              <button type="button" onClick={() => { setHumble(true); feedback('streak'); unlock('humble-legend') }} className="mt-2 text-[12px] text-ink-soft/70 underline-offset-4 hover:underline">
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

function Rewards({ award }: { award: NonNullable<ReturnType<typeof useSeason.getState>['award']> }) {
  const ach = ACHIEVEMENTS.filter((a) => award.newAch.includes(a.id))
  return (
    <div className="mt-6 space-y-3">
      {award.drop && (
        <div className="locker-drop flex items-center gap-4 rounded-[2px] bg-cream-hi p-4 shadow-lift">
          <Patch tone={award.drop.rarity === 'legendary' ? 'gold' : award.drop.rarity === 'rare' ? 'red' : 'navy'} size={56}>
            {(() => {
              const I = icons[award.drop.icon as IconName]
              return <I size={26} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:transparent]" />
            })()}
          </Patch>
          <div>
            <p className={`label text-[10px] font-bold ${award.drop.rarity === 'legendary' ? 'text-gold' : award.drop.rarity === 'rare' ? 'text-red' : 'text-ink-soft'}`}>Locker drop · {award.drop.rarity}</p>
            <p className="text-[16px] font-bold text-navy">{award.drop.name}</p>
            <p className="text-[13px] text-ink-soft">{award.drop.kind} · <Link href="/locker" className="underline underline-offset-2">see your locker</Link></p>
          </div>
        </div>
      )}
      {ach.slice(0, 2).map((a) => (
        <div key={a.id} className="flex items-center gap-3 rounded-[2px] border-l-4 border-gold bg-cream-hi/70 px-4 py-3">
          <MedalIcon size={22} className="text-navy [--icon-accent:var(--color-gold)]" />
          <div>
            <p className="text-[14px] font-bold text-navy">Achievement: {a.name}</p>
            <p className="text-[13px] text-ink-soft">{a.desc}</p>
          </div>
        </div>
      ))}
      {ach.length > 2 && (
        <p className="text-[14px] text-ink">
          <strong className="text-navy">+{ach.length - 2} more achievements:</strong> {ach.slice(2).map((a) => a.name).join(', ')}.{' '}
          <Link href="/locker" className="font-semibold text-navy underline underline-offset-2">See them all</Link>
        </p>
      )}
      <p className="flex items-center gap-2 text-[14px] text-ink">
        <FlameIcon size={18} />
        {award.streak > 1 ? `${award.streak}-day attendance streak${award.usedFreeze ? ' (a Sick Note covered yesterday)' : ''}.` : 'Come back tomorrow to start an attendance streak.'}
        {award.gradeUp && <strong className="ml-1 text-maroon">Promoted to {award.gradeUp}!</strong>}
      </p>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { brand } from '@/config/brand'
import { copy } from '@/config/copy'
import { ROUNDS, type Round } from '@/config/scoring'
import { useSeason } from '@/state/season'
import { usePlayer } from '@/state/player'
import { ReportCard } from '@/components/ui/ReportCard'
import { TornCard } from '@/components/ui/TornCard'
import { Patch, Badge } from '@/components/ui/Patch'
import { Portrait } from '@/components/characters/Portrait'
import { Button } from '@/components/ui/Button'
import { CheckIcon, DuelIcon, FlameIcon, FootballIcon, LockerIcon, MusicIcon, PinIcon, PlayIcon, ScrollIcon, StarIcon, TrophyIcon } from '@/components/icons'
import { useProgress } from '@/state/progress'
import { gradeFor } from '@/game/progress'
import { dailySeed } from '@/game/duel'
import { SettingsButton } from '@/components/layout/SettingsButton'
import { PENDING_DUEL } from './DuelInvite'

/** Rounds that are playable right now (others show "Opening soon"). */
export const PLAYABLE: Round[] = ['football', 'quiz', 'hunt', 'dance']

const ICON: Record<Round, typeof ScrollIcon> = { football: FootballIcon, quiz: ScrollIcon, hunt: PinIcon, dance: MusicIcon }

export function SeasonHub() {
  const [ready, setReady] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- persisted stores hydrate after mount
  useEffect(() => setReady(true), [])
  const enrolment = usePlayer((s) => s.enrolment)
  const results = useSeason((s) => s.results)
  const history = useSeason((s) => s.history)
  const mode = useSeason((s) => s.mode)
  const seed = useSeason((s) => s.seed)
  const duel = useSeason((s) => s.duel)
  const startRun = useSeason((s) => s.startRun)
  const xp = useProgress((s) => s.xp)
  const streak = useProgress((s) => s.streak)

  // a duel accepted before enrolling resumes here
  useEffect(() => {
    if (!ready || !enrolment) return
    const raw = sessionStorage.getItem(PENDING_DUEL)
    if (!raw) return
    sessionStorage.removeItem(PENDING_DUEL)
    try {
      const d = JSON.parse(raw) as { seed: string; name: string; house: 'red' | 'blue'; total: number }
      startRun({ seed: d.seed, mode: 'duel', duel: { name: d.name, house: d.house, total: d.total } })
    } catch { /* ignore a malformed pending duel */ }
  }, [ready, enrolment, startRun])

  if (!ready) return <div className="min-h-dvh" />

  if (!enrolment) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center px-5 text-center">
        <h1 className="font-[family-name:var(--font-condensed)] text-[48px] leading-none text-navy uppercase">{copy.hub.title}</h1>
        <p className="mt-4 text-[17px] text-ink">{copy.hub.notEnrolled}</p>
        <Link href="/enrol" className="btn btn-block mt-8 max-w-[360px]"><span className="btn-face">{copy.hub.enrol}</span></Link>
      </main>
    )
  }

  const done = ROUNDS.filter((r) => results[r])
  const allDone = done.length === ROUNDS.length
  const best = history.reduce((m, r) => Math.max(m, r.total), 0)
  return (
    <main className="mx-auto max-w-[620px] px-4 pt-[max(20px,env(safe-area-inset-top))] pb-32">
      <header className="flex items-center gap-3">
        <Portrait id={enrolment.archetype} size={52} backdrop={enrolment.house === 'red' ? 'red' : 'navy'} />
        <div className="min-w-0 flex-1">
          <p className="collegiate truncate text-[22px] text-navy">{enrolment.nickname.toUpperCase()}</p>
          <Badge tone={enrolment.house === 'red' ? 'red' : 'navy'}>{brand.houses[enrolment.house].name}</Badge>
        </div>
        {best > 0 && (
          <div className="text-right">
            <p className="label text-[10px] text-ink-soft">Best season</p>
            <p className="font-[family-name:var(--font-slab)] text-[24px] leading-none text-maroon">{best}</p>
          </div>
        )}
        <SettingsButton />
      </header>

      <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[2px] bg-cream-hi/70 px-4 py-3 shadow-paper">
        <span className="flex items-center gap-1 font-[family-name:var(--font-slab)] text-[20px] text-maroon" aria-label={`${streak.current}-day streak`}>
          <FlameIcon size={22} />{streak.current}
        </span>
        <div>
          <p className="label text-[10px] font-bold text-navy">{gradeFor(xp).name}{gradeFor(xp).next ? ` → ${gradeFor(xp).next}` : ''}</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-pill bg-paper-shade" role="progressbar" aria-label="Grade progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(gradeFor(xp).progress * 100)}>
            <div className="h-full bg-navy" style={{ width: `${gradeFor(xp).progress * 100}%` }} />
          </div>
        </div>
        <Link href="/locker" className="label flex min-h-11 items-center gap-1.5 rounded-pill border-2 border-navy px-3 text-[11px] font-bold text-navy hover:bg-navy hover:text-cream-hi">
          <LockerIcon size={16} />Locker
        </Link>
      </div>

      {mode !== 'season' && (
        <div className={`mt-4 flex items-center gap-3 rounded-[2px] px-4 py-3 text-cream-hi ${mode === 'duel' ? 'bg-red' : 'bg-navy'}`}>
          {mode === 'duel' ? <DuelIcon size={22} className="[--icon-accent:var(--color-gold)]" /> : <StarIcon size={22} className="[--icon-accent:var(--color-gold)]" />}
          <p className="text-[14px] font-semibold">
            {mode === 'duel' && duel ? `Duel vs ${duel.name}: beat ${duel.total}. Same questions, same beats.` : 'Daily challenge: the same game for everyone today.'}
          </p>
        </div>
      )}

      <h1 className="mt-8 font-[family-name:var(--font-condensed)] text-[48px] leading-none text-navy uppercase">{copy.hub.title}</h1>
      <p className="mt-2 text-[16px] text-ink-soft">{copy.hub.any}</p>
      <div className="mt-6">
        <ReportCard done={1 + done.length} doneIds={['admission', ...done]} />
      </div>

      <ol className="mt-8 grid gap-4">
        {ROUNDS.map((r, i) => {
          const meta = copy.rounds[r]
          const Icon = ICON[r]
          const res = results[r]
          const playable = PLAYABLE.includes(r)
          return (
            <li key={r}>
              <TornCard seed={`hub-${r}`} paperClassName="flex items-center gap-4 px-5 py-4">
                <Patch tone={i % 2 ? 'navy' : 'red'} size={50}>
                  <Icon size={24} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:transparent]" />
                </Patch>
                <div className="min-w-0 flex-1">
                  <p className="label text-[11px] font-bold text-ink">Round {meta.n} · {meta.title}</p>
                  <p className="text-[14px] text-ink-soft">{res ? res.detail : meta.blurb}</p>
                </div>
                {res ? (
                  <div className="flex flex-col items-end">
                    <span className="font-[family-name:var(--font-slab)] text-[24px] leading-none text-maroon">{res.score}</span>
                    <span className="label mt-1 flex items-center gap-1 text-[10px] font-bold text-navy"><CheckIcon size={12} />Done</span>
                  </div>
                ) : playable ? (
                  <Link href={meta.href} className="label flex min-h-11 items-center gap-1.5 rounded-pill bg-red px-4 text-[12px] font-bold text-cream-hi shadow-paper hover:bg-red-hi">
                    <PlayIcon size={14} className="[--icon-accent:currentColor]" />{copy.hub.play}
                  </Link>
                ) : (
                  <span className="label text-right text-[10px] text-ink-soft">{copy.hub.soon}</span>
                )}
              </TornCard>
            </li>
          )
        })}
      </ol>

      {done.length === 0 && !(mode === 'daily' && seed === dailySeed()) && (
        <TornCard seed="daily" className="mt-6" paperClassName="flex items-center gap-4 px-5 py-4">
          <Patch tone="gold" size={50}><StarIcon size={24} className="text-[#5a3f0c] [--icon-accent:#fff1c9]" /></Patch>
          <div className="min-w-0 flex-1">
            <p className="label text-[11px] font-bold text-ink">Daily challenge</p>
            <p className="text-[14px] text-ink-soft">
              Same game for everyone today.{(() => {
                const today = history.filter((h) => h.mode === 'daily' && h.seed === dailySeed())
                return today.length ? ` Your best today: ${Math.max(...today.map((h) => h.total))}.` : ''
              })()}
            </p>
          </div>
          <button type="button" onClick={() => startRun({ seed: dailySeed(), mode: 'daily' })} className="label flex min-h-11 items-center gap-1.5 rounded-pill bg-navy px-4 text-[12px] font-bold text-cream-hi shadow-paper hover:bg-navy-hi">
            <PlayIcon size={14} className="[--icon-accent:currentColor]" />Start
          </button>
        </TornCard>
      )}

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-paper via-paper/95 to-transparent px-4 pt-6 pb-[max(18px,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[620px]">
          {allDone ? (
            <Link href="/finale" className="btn btn-block">
              <span className="btn-face"><span className="btn-stub"><TrophyIcon size={22} className="[--icon-accent:var(--color-gold)] [--icon-paper:var(--color-red)]" /></span><span>{copy.hub.finale}</span></span>
            </Link>
          ) : (
            <NextRoundButton results={results} />
          )}
        </div>
      </div>
    </main>
  )
}

function NextRoundButton({ results }: { results: Partial<Record<Round, unknown>> }) {
  const next = ROUNDS.find((r) => !results[r] && PLAYABLE.includes(r))
  if (!next) return <Button block disabled>More rounds opening soon</Button>
  const meta = copy.rounds[next]
  return (
    <Link href={meta.href} className="btn btn-block">
      <span className="btn-face"><span className="btn-stub"><PlayIcon size={20} className="[--icon-accent:currentColor]" /></span><span>Play round {meta.n}: {meta.title}</span></span>
    </Link>
  )
}

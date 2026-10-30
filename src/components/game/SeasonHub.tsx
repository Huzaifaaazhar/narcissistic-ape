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
import { CheckIcon, FootballIcon, MusicIcon, PinIcon, PlayIcon, ScrollIcon, TrophyIcon } from '@/components/icons'

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
      </header>

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

'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { brand } from '@/config/brand'
import { decodeDuel, type Duel } from '@/game/duel'
import { usePlayer } from '@/state/player'
import { useSeason } from '@/state/season'
import { TornCard } from '@/components/ui/TornCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Patch'
import { DuelIcon } from '@/components/icons'

export const PENDING_DUEL = 'sty-pending-duel'

export function DuelInvite() {
  const router = useRouter()
  const [duel, setDuel] = useState<Duel | null | 'bad'>(null)
  const enrolment = usePlayer((s) => s.enrolment)
  const startRun = useSeason((s) => s.startRun)
  const inProgress = useSeason((s) => Object.keys(s.results).length > 0)

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('c') ?? ''
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the code lives in the URL
    setDuel(decodeDuel(code) ?? 'bad')
  }, [])

  if (duel === null) return <div className="min-h-dvh" />
  if (duel === 'bad') {
    return (
      <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col items-center justify-center px-5 text-center">
        <h1 className="font-[family-name:var(--font-condensed)] text-[44px] leading-none text-navy uppercase">That challenge link is broken</h1>
        <p className="mt-4 text-[17px] text-ink">Ask your friend to send it again, or start your own season.</p>
        <Link href="/" className="btn btn-block mt-8 max-w-[360px]"><span className="btn-face">Go to the front gate</span></Link>
      </main>
    )
  }

  const accept = () => {
    const target = { name: duel.name, house: duel.house, total: duel.total }
    if (!enrolment) {
      sessionStorage.setItem(PENDING_DUEL, JSON.stringify({ seed: duel.seed, ...target }))
      router.push('/enrol')
      return
    }
    startRun({ seed: duel.seed, mode: 'duel', duel: target })
    router.push('/season')
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-5 py-10 text-center">
      <p className="label text-[12px] font-bold tracking-[0.3em] text-maroon">You’ve been challenged</p>
      <TornCard seed="duel-invite" className="mt-6" paperClassName="px-6 py-7">
        <DuelIcon size={40} className="mx-auto text-navy [--icon-accent:var(--color-red)]" />
        <p className="collegiate mt-4 text-[34px] text-navy">{duel.name.toUpperCase()}</p>
        <div className="mt-2 flex justify-center"><Badge tone={duel.house === 'red' ? 'red' : 'navy'}>{brand.houses[duel.house].name}</Badge></div>
        <p className="mt-5 text-[16px] text-ink">scored</p>
        <p className="font-[family-name:var(--font-slab)] text-[72px] leading-none text-maroon">{duel.total}</p>
        <p className="mt-4 text-[15px] text-ink-soft">Same quiz questions, same clues, same keeper, same beat. Play all four rounds and beat their score.</p>
      </TornCard>
      {inProgress && enrolment && <p className="mt-4 text-[14px] font-semibold text-maroon">Accepting replaces the season you have in progress.</p>}
      <div className="mt-8"><Button block onClick={accept}>{enrolment ? 'Accept the challenge' : 'Enrol and accept'}</Button></div>
      <p className="mt-4 text-[12px] text-ink-soft">Duel links are for friendly rivalry; they don’t count towards any leaderboard.</p>
    </main>
  )
}

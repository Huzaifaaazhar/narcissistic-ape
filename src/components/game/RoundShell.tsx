'use client'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { TornCard } from '@/components/ui/TornCard'
import { Divider } from '@/components/ui/Divider'
import { Patch } from '@/components/ui/Patch'
import { ScoreCounter } from '@/components/ui/ScoreCounter'
import { CloseIcon, PlayIcon } from '@/components/icons'

/** Slim in-round top bar: quit, round label, live score. */
export function RoundHud({ label, score, children }: { label: string; score: number; children?: ReactNode }) {
  return (
    <header className="flex items-center gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2">
      <Link href="/season" aria-label="Leave round" className="grid size-11 shrink-0 place-items-center rounded-full text-navy hover:bg-paper-shade/60">
        <CloseIcon size={20} />
      </Link>
      <p className="label flex-1 truncate text-[11px] font-bold text-navy">{label}</p>
      {children}
      <span className="font-[family-name:var(--font-slab)] text-[24px] leading-none text-maroon">
        <ScoreCounter value={score} digits={4} label="Score" />
      </span>
    </header>
  )
}

/** Pre-round card: what, one-line rule, start. Tap anywhere on Start to begin. */
export function RoundIntro({ number, title, rule, icon, onStart, extra }: { number: number; title: string; rule: string; icon: ReactNode; onStart: () => void; extra?: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[520px] flex-col items-center justify-center px-5 py-10 text-center">
      <Patch tone={number % 2 ? 'red' : 'navy'} size={92}>{icon}</Patch>
      <p className="label mt-6 text-[12px] font-bold tracking-[0.3em] text-maroon">Round {number}</p>
      <h1 className="mt-2 font-[family-name:var(--font-condensed)] text-[64px] leading-[0.9] text-navy uppercase">{title}</h1>
      <Divider className="mt-5 max-w-[240px]" />
      <p className="mt-5 max-w-[32ch] text-[17px] leading-relaxed text-ink">{rule}</p>
      {extra}
      <div className="mt-10 w-full max-w-[360px]">
        <Button block onClick={onStart} icon={<PlayIcon size={20} className="[--icon-accent:currentColor]" />}>Ready</Button>
      </div>
      <Link href="/season" className="label mt-5 text-[11px] font-bold text-navy underline-offset-4 hover:underline">Back to the hub</Link>
    </main>
  )
}

/** End-of-round panel: score, stat lines, next action. Never a dead end. */
export function RoundResults({ title, score, max, lines, onNext, nextLabel }: { title: string; score: number; max: number; lines: [string, string][]; onNext: () => void; nextLabel: string }) {
  const pct = Math.round((score / max) * 100)
  const verdict = pct >= 85 ? 'Topper material.' : pct >= 60 ? 'Solid. The Dean noticed.' : pct >= 35 ? 'Not bad. Not legendary either.' : 'Beta, focus. Next round is yours.'
  return (
    <main className="mx-auto flex min-h-dvh max-w-[520px] flex-col justify-center px-5 py-10">
      <p className="label text-center text-[12px] font-bold tracking-[0.3em] text-maroon">{title}</p>
      <TornCard seed={`result-${title}`} className="mt-5" paperClassName="px-6 py-7 text-center">
        <p className="label text-[11px] text-ink-soft">Round score</p>
        <p className="mt-1 font-[family-name:var(--font-slab)] text-[72px] leading-none text-maroon"><ScoreCounter value={score} digits={4} label="Round score" /></p>
        <p className="mt-3 text-[17px] font-semibold text-navy">{verdict}</p>
        <dl className="mt-6 space-y-2 text-left">
          {lines.map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-dashed border-ink-soft/30 pb-1.5">
              <dt className="label text-[11px] text-ink-soft">{k}</dt>
              <dd className="font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </TornCard>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button block onClick={onNext} icon={<PlayIcon size={20} className="[--icon-accent:currentColor]" />}>{nextLabel}</Button>
      </div>
    </main>
  )
}

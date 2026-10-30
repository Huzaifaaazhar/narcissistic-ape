'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ACHIEVEMENTS, GRADES, LOCKER, gradeFor } from '@/game/progress'
import { useProgress } from '@/state/progress'
import { Patch } from '@/components/ui/Patch'
import { Divider } from '@/components/ui/Divider'
import { LockIcon, MedalIcon, icons, type IconName } from '@/components/icons'

export function Locker() {
  const [ready, setReady] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- persisted store hydrates after mount
  useEffect(() => setReady(true), [])
  const { owned, achievements, xp, seasons, streak } = useProgress()
  if (!ready) return <div className="min-h-dvh" />
  const g = gradeFor(xp)
  return (
    <main className="mx-auto max-w-[720px] px-4 pt-[max(20px,env(safe-area-inset-top))] pb-16">
      <Link href="/season" className="label text-[11px] font-bold text-navy underline-offset-4 hover:underline">← Season hub</Link>
      <h1 className="mt-5 font-[family-name:var(--font-condensed)] text-[52px] leading-none text-navy uppercase">Your locker</h1>
      <Divider className="mt-4 ml-0" />

      <section className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[
          ['Grade', g.name],
          ['Seasons', String(seasons)],
          ['Best streak', `${streak.best} ${streak.best === 1 ? 'day' : 'days'}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[2px] bg-cream-hi/70 px-2 py-3 shadow-paper">
            <p className="label text-[10px] text-ink-soft">{k}</p>
            <p className="mt-1 text-[16px] font-bold text-navy">{v}</p>
          </div>
        ))}
      </section>
      <p className="mt-3 text-[13px] text-ink-soft">
        {xp.toLocaleString('en-GB')} XP. {g.next ? `${GRADES[g.index + 1]!.xp - xp} more to ${g.next}.` : 'Top of the school.'} Every season adds its total to your XP.
      </p>

      <h2 className="label mt-10 text-[13px] font-bold text-navy">Collectibles · {owned.length} of {LOCKER.length}</h2>
      <p className="mt-1 text-[13px] text-ink-soft">One drops after every season you finish. Five seasons without a rare guarantees one.</p>
      <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {LOCKER.map((item) => {
          const have = owned.includes(item.id)
          const Icon = icons[item.icon as IconName]
          return (
            <li key={item.id} className={`flex flex-col items-center gap-2 rounded-[2px] px-2 py-4 text-center ${have ? 'bg-cream-hi shadow-paper' : 'border-2 border-dashed border-paper-shade'}`}>
              {have ? (
                <Patch tone={item.rarity === 'legendary' ? 'gold' : item.rarity === 'rare' ? 'red' : 'navy'} size={56}>
                  <Icon size={26} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:transparent]" />
                </Patch>
              ) : (
                <span className="grid size-14 place-items-center rounded-full bg-paper-deep/60 text-ink-soft/50"><LockIcon size={22} /></span>
              )}
              <span className={`text-[12px] leading-tight font-semibold ${have ? 'text-navy' : 'text-ink-soft/60'}`}>{have ? item.name : '???'}</span>
              <span className={`label text-[9px] ${item.rarity === 'legendary' ? 'text-gold' : item.rarity === 'rare' ? 'text-red' : 'text-ink-soft'}`}>{item.rarity}</span>
            </li>
          )
        })}
      </ul>

      <h2 className="label mt-10 text-[13px] font-bold text-navy">Achievements · {achievements.length} of {ACHIEVEMENTS.length}</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const have = achievements.includes(a.id)
          return (
            <li key={a.id} className={`flex items-center gap-3 rounded-[2px] px-4 py-3 ${have ? 'border-l-4 border-gold bg-cream-hi/80' : 'bg-paper-deep/40'}`}>
              <MedalIcon size={22} className={have ? 'text-navy [--icon-accent:var(--color-gold)]' : 'text-ink-soft/40 [--icon-accent:transparent]'} />
              <div>
                <p className={`text-[14px] font-bold ${have ? 'text-navy' : 'text-ink-soft'}`}>{a.name}</p>
                <p className="text-[12px] text-ink-soft">{a.desc}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

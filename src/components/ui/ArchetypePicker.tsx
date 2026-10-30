'use client'
import { useState } from 'react'
import { copy, type ArchetypeId } from '@/config/copy'
import { Portrait } from '@/components/characters/Portrait'

type Props = { defaultValue?: ArchetypeId; onChange?: (a: ArchetypeId) => void; hideLegend?: boolean }

/** Archetype radio grid with the original illustrated portraits. */
export function ArchetypePicker({ defaultValue, onChange, hideLegend }: Props) {
  const [value, setValue] = useState<ArchetypeId | undefined>(defaultValue)
  return (
    <fieldset className="w-full">
      <legend className={hideLegend ? 'sr-only' : 'label mb-3 text-xs font-bold text-navy'}>Who are you on campus?</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {copy.archetypes.map((a, i) => {
          const on = value === a.id
          return (
            <label
              key={a.id}
              className={`relative flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[2px] border-2 p-3 text-center transition-all duration-200 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy ${
                on ? 'border-navy bg-cream-hi shadow-lift' : 'border-transparent bg-paper-deep/60 hover:bg-paper-deep'
              }`}
            >
              <input
                type="radio" name="archetype" value={a.id} checked={on} className="sr-only"
                onChange={() => { setValue(a.id); onChange?.(a.id) }}
              />
              <Portrait id={a.id} size={72} backdrop={i % 2 ? 'navy' : 'red'} className={`rounded-full transition-transform duration-300 ease-[var(--ease-spring)] ${on ? 'scale-105 ring-3 ring-navy ring-offset-2 ring-offset-cream-hi' : ''}`} />
              <span className="mt-1 text-[14px] leading-tight font-bold text-navy">{a.name}</span>
              <span className="label text-[10px] text-ink-soft">{a.perk}</span>
              {on && <span className="absolute top-2 right-2 size-2.5 rounded-full bg-red" aria-hidden="true" />}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

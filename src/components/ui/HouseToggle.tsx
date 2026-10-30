'use client'
import { useState } from 'react'
import { brand, type House } from '@/config/brand'
import { PennantIcon } from '@/components/icons'

type Props = { defaultValue?: House; onChange?: (h: House) => void; disabled?: boolean; name?: string }

/** Red vs Blue picker as a radio group of two pennant panels. Pattern + label, not colour alone. */
export function HouseToggle({ defaultValue, onChange, disabled, name = 'house' }: Props) {
  const [value, setValue] = useState<House | undefined>(defaultValue)
  const pick = (h: House) => {
    setValue(h)
    onChange?.(h)
  }
  return (
    <fieldset className="w-full" disabled={disabled}>
      <legend className="label mb-3 text-xs font-bold text-navy">Pick your side</legend>
      <div className="grid grid-cols-2 gap-3">
        {(['red', 'blue'] as const).map((h) => {
          const on = value === h
          const off = value !== undefined && !on
          const bg = h === 'red' ? 'var(--color-red)' : 'var(--color-navy)'
          return (
            <label
              key={h}
              className={`group relative flex min-h-36 cursor-pointer flex-col justify-between overflow-hidden rounded-[2px] p-4 text-cream-hi transition-[transform,filter,opacity] duration-300 ease-[var(--ease-out-expo)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-navy has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${
                on ? 'scale-[1.02] shadow-lift' : off ? 'scale-[0.97] opacity-75 saturate-[0.65]' : 'shadow-paper'
              }`}
              style={{
                background: `${h === 'red'
                  ? 'repeating-linear-gradient(135deg, rgb(255 255 255 / 0.07) 0 6px, transparent 6px 14px)'
                  : 'radial-gradient(rgb(255 255 255 / 0.09) 1.2px, transparent 1.5px) 0 0 / 10px 10px'}, url('/textures/paper-grain.png') 0 0 / 192px 192px, ${bg}`,
              }}
            >
              <input type="radio" name={name} value={h} checked={on} onChange={() => pick(h)} className="sr-only" />
              <span className="flex items-center justify-between">
                <PennantIcon size={30} className="text-cream-hi [--icon-accent:var(--color-cream-hi)]" />
                <span
                  className={`grid size-7 place-items-center rounded-full border-2 border-cream-hi transition-colors ${on ? 'bg-cream-hi' : ''}`}
                  aria-hidden="true"
                >
                  {on && <span className="size-3 rounded-full" style={{ background: bg }} />}
                </span>
              </span>
              <span>
                <span className="collegiate block text-[30px] leading-none">{brand.houses[h].short.toUpperCase()}</span>
                <span className="mt-1 block text-[12px] leading-snug text-cream-hi/85">{brand.houses[h].motto}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

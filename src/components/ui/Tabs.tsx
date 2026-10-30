'use client'
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

type Tab = { id: string; label: string; content: ReactNode }

/** ARIA tabs with roving focus (arrow keys, Home/End). */
export function Tabs({ tabs, label, defaultId }: { tabs: Tab[]; label: string; defaultId?: string }) {
  const base = useId()
  const [active, setActive] = useState(defaultId ?? tabs[0]?.id)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = tabs.length
    const next = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (next < 0) return
    e.preventDefault()
    setActive(tabs[next]!.id)
    refs.current[next]?.focus()
  }
  return (
    <div className="w-full">
      <div role="tablist" aria-label={label} className="relative flex border-b-2 border-paper-shade">
        {tabs.map((t, i) => {
          const on = t.id === active
          return (
            <button
              key={t.id}
              ref={(el) => { refs.current[i] = el }}
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`label relative -mb-[2px] min-h-12 flex-1 px-2 text-[12px] font-bold transition-colors ${on ? 'text-navy' : 'text-ink-soft hover:text-navy'}`}
            >
              {t.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-2 -bottom-0 h-[3px] origin-center transition-transform duration-300 ease-[var(--ease-out-expo)] ${on ? 'scale-x-100' : 'scale-x-0'}`}
                style={{ background: 'var(--divider)' }}
              />
            </button>
          )
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" id={`${base}-panel-${t.id}`} aria-labelledby={`${base}-tab-${t.id}`} hidden={t.id !== active} tabIndex={0} className="pt-4 focus-visible:outline-offset-[-3px]">
          {t.content}
        </div>
      ))}
    </div>
  )
}

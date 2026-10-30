'use client'
import { useEffect, useState } from 'react'

type Props = { value: number; digits?: number; className?: string; label?: string }

/** Rolling-digit odometer. Each column slides to its digit; reduced motion collapses to a swap. */
export function ScoreCounter({ value, digits = 4, className = '', label = 'Score' }: Props) {
  // Start from zero on mount so the first render rolls up.
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value))
    return () => cancelAnimationFrame(id)
  }, [value])
  const str = String(Math.max(0, Math.floor(shown))).padStart(digits, '0')
  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span className="sr-only" aria-live="polite">{`${label}: ${value}`}</span>
      <span className="roll font-[family-name:var(--font-slab)]" aria-hidden="true">
        {[...str].map((d, i) => {
          const lead = str.slice(0, i).split('').every((c) => c === '0') && d === '0' && i < str.length - 1
          // Leading zeros keep the width stable but read as faint ruled boxes, not digits.
          return (
            <span key={i} className={`roll-col ${lead ? 'opacity-0' : ''}`} style={{ transform: `translateY(${-Number(d)}em)`, transitionDelay: `${(str.length - i) * 60}ms` }}>
              {'0123456789'.split('').map((n) => <span key={n}>{n}</span>)}
            </span>
          )
        })}
      </span>
    </span>
  )
}

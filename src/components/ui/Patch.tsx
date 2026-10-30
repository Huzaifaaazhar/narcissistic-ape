import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  tone?: 'navy' | 'red' | 'gold' | 'cream'
  size?: number
  label?: string
  className?: string
}

/** Embroidered round patch with stitched border. Decorative unless `label` is given. */
export function Patch({ children, tone = 'navy', size = 64, label, className = '' }: Props) {
  return (
    <span
      className={`patch ${tone !== 'navy' ? `patch-${tone}` : ''} ${className}`}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </span>
  )
}

/** Small pill badge for status text (rarity, house, "NEW"). */
export function Badge({ children, tone = 'navy' }: { children: ReactNode; tone?: 'navy' | 'red' | 'gold' | 'outline' }) {
  const tones = {
    navy: 'bg-navy text-cream-hi',
    red: 'bg-red text-cream-hi',
    gold: 'bg-gold text-ink',
    outline: 'border-2 border-navy text-navy',
  }
  return (
    <span className={`label inline-flex h-7 items-center gap-1.5 rounded-pill px-3 text-[11px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  )
}

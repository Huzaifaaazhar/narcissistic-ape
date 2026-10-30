import type { ReactNode } from 'react'

type Props = { children: ReactNode; icon?: ReactNode; tone?: 'navy' | 'red' | 'paper'; enter?: boolean }

/** A slip of paper that drops in. Mount inside a role="status" region (see ToastRegion). */
export function Toast({ children, icon, tone = 'navy', enter }: Props) {
  const tones = {
    navy: 'bg-navy text-cream-hi',
    red: 'bg-red text-cream-hi',
    paper: 'bg-cream-hi text-navy border-l-4 border-red',
  }
  return (
    <div className={`toast flex min-h-14 w-full max-w-[380px] items-center gap-3 rounded-[2px] px-4 py-3 shadow-lift ${tones[tone]}`} data-enter={enter || undefined}>
      {icon && <span className="shrink-0 [--icon-accent:var(--color-gold)]">{icon}</span>}
      <p className="text-[14px] leading-snug font-semibold">{children}</p>
    </div>
  )
}

export function ToastRegion({ children }: { children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-[max(12px,env(safe-area-inset-top))] z-50 flex flex-col items-center gap-2 px-4">
      {children}
    </div>
  )
}

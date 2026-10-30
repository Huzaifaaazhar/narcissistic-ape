import { copy } from '@/config/copy'

type Props = { seconds: number; total: number; size?: number }

/** Countdown ring. Goes red under 5s; the number is announced politely by the round HUD, not here. */
export function TimerRing({ seconds, total, size = 72 }: Props) {
  const r = 30
  const c = 2 * Math.PI * r
  const frac = Math.max(0, Math.min(1, seconds / total))
  const urgent = seconds <= 5
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="timer" aria-label={copy.timer.label(seconds)}>
      <svg viewBox="0 0 72 72" width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx="36" cy="36" r={r + 4} fill="var(--color-cream-hi)" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-paper-shade)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={urgent ? 'var(--color-red)' : 'var(--color-navy)'}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - frac)}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 180ms' }}
        />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="36" y1="2.5" x2="36" y2="5.5" stroke="var(--color-ink)" strokeOpacity=".35" strokeWidth="1.5" transform={`rotate(${i * 30} 36 36)`} />
        ))}
      </svg>
      <span className={`absolute font-[family-name:var(--font-condensed)] text-[28px] leading-none ${urgent ? 'text-red' : 'text-navy'}`}>{seconds}</span>
    </div>
  )
}

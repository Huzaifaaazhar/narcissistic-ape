import { copy } from '@/config/copy'
import { CheckIcon, LockIcon } from '@/components/icons'

type Props = {
  /** Steps completed, including admission (so a fresh player is 1). */
  done: number
  /** Index of the step currently being played, if any. */
  current?: number
}

/** Season progress as a report card of ink stamps. Starts with admission stamped (endowed progress). */
export function ReportCard({ done, current }: Props) {
  const steps = copy.reportCard.steps
  return (
    <section aria-label={copy.reportCard.title} className="w-full">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="label text-xs font-bold text-navy">{copy.reportCard.title}</h3>
        <p className="label text-xs text-ink-soft">{copy.reportCard.progress(done, steps.length)}</p>
      </div>
      <div className="relative h-2 overflow-hidden rounded-pill bg-paper-shade/70" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={done} aria-label="Season progress">
        <div
          className="h-full rounded-pill transition-[width] duration-[600ms] ease-[var(--ease-out-expo)]"
          style={{ width: `${(done / steps.length) * 100}%`, background: 'linear-gradient(90deg, var(--color-maroon), var(--color-red) 60%, var(--color-navy))' }}
        />
      </div>
      <ol className="mt-4 grid grid-cols-5 gap-1">
        {steps.map((s, i) => {
          const isDone = i < done
          const isNow = current === i
          return (
            <li key={s.id} className="flex flex-col items-center gap-2 text-center">
              {isDone ? (
                <span
                  className={`stamp ${i % 2 ? 'stamp-navy' : ''} size-[60px] text-[7.5px] tracking-[0.06em]`}
                  style={{ transform: `rotate(${[-8, 6, -4, 9, -6][i]}deg)` }}
                >
                  <span className="flex flex-col items-center gap-0.5">
                    <CheckIcon size={16} />
                    {s.stamp}
                  </span>
                </span>
              ) : (
                <span
                  className={`grid size-[60px] place-items-center rounded-full border-2 border-dashed ${isNow ? 'border-red text-red' : 'border-paper-shade text-ink-soft/60'}`}
                >
                  {isNow ? <span className="label text-[9px] font-bold">Now</span> : <LockIcon size={18} />}
                </span>
              )}
              <span className={`label text-[9.5px] leading-tight ${isDone || isNow ? 'text-navy font-bold' : 'text-ink-soft'}`}>{s.label}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

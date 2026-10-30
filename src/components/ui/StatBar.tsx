type Props = { label: string; value: number; max?: number; tone?: 'navy' | 'red' }

/** Segmented stat meter (Brains / Instinct / Style / Grit). */
export function StatBar({ label, value, max = 100, tone = 'navy' }: Props) {
  const segs = 10
  const filled = Math.round((value / max) * segs)
  return (
    <div className="grid grid-cols-[84px_1fr_36px] items-center gap-3">
      <span className="label text-[11px] font-bold text-navy">{label}</span>
      <div className="flex gap-[3px]" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        {Array.from({ length: segs }, (_, i) => (
          <span
            key={i}
            className={`h-3 flex-1 -skew-x-12 rounded-[1px] ${i < filled ? (tone === 'red' ? 'bg-red' : 'bg-navy') : 'bg-paper-shade/80'}`}
          />
        ))}
      </div>
      <span className="text-right font-[family-name:var(--font-slab)] text-sm text-ink">{value}</span>
    </div>
  )
}

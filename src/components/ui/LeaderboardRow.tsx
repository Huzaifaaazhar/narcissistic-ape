import type { House } from '@/config/brand'
import { copy } from '@/config/copy'
import { CrestIcon, TrophyIcon } from '@/components/icons'

type Props = { rank: number; name: string; house: House; score: number; you?: boolean; delta?: number }

const houseStyle: Record<House, string> = {
  red: '[--icon-accent:var(--color-red)] text-red',
  blue: '[--icon-accent:var(--color-navy-hi)] text-navy',
}

/** One leaderboard line. House is shown by crest + text label, never colour alone. */
export function LeaderboardRow({ rank, name, house, score, you, delta }: Props) {
  const podium = rank <= 3
  return (
    <div
      className={`grid min-h-14 grid-cols-[44px_1fr_auto] items-center gap-3 px-3 py-2 ${
        you ? 'bg-navy text-cream-hi shadow-lift' : 'border-b border-paper-shade/80'
      }`}
      aria-current={you ? 'true' : undefined}
    >
      <span className={`grid place-items-center font-[family-name:var(--font-slab)] text-xl ${you ? 'text-gold' : podium ? 'text-maroon' : 'text-ink-soft'}`}>
        {rank === 1 ? <TrophyIcon size={26} title="First place" className={you ? 'text-cream-hi' : 'text-navy'} /> : rank}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">
          {name}
          {you && <span className="label ml-2 text-[10px] text-gold">{copy.board.you}</span>}
        </span>
        <span className={`label flex items-center gap-1 text-[10px] ${you ? 'text-cream-hi/75' : houseStyle[house]}`}>
          <CrestIcon size={13} />
          {house === 'red' ? 'Red House' : 'Blue House'}
        </span>
      </span>
      <span className="text-right">
        <span className="block font-[family-name:var(--font-slab)] text-lg leading-none">{score.toLocaleString('en-GB')}</span>
        {delta !== undefined && delta !== 0 && (
          <span className={`label text-[10px] ${delta > 0 ? (you ? 'text-gold' : 'text-navy') : 'text-red'}`}>
            {delta > 0 ? `▲ ${delta}` : `▼ ${-delta}`}
          </span>
        )}
      </span>
    </div>
  )
}

'use client'
import type { PlaceId } from '@/game/hunt'
import { PLACES } from '@/game/hunt'

/** Hotspot centres in % of the map box (portrait 3:4). */
export const SPOTS: Record<PlaceId, { x: number; y: number }> = {
  library: { x: 18, y: 15 },
  auditorium: { x: 80, y: 15 },
  rooftop: { x: 50, y: 27 },
  office: { x: 50, y: 45 },
  lockers: { x: 16, y: 52 },
  canteen: { x: 84, y: 52 },
  field: { x: 50, y: 81 },
}

type Props = {
  onPick: (p: PlaceId) => void
  wrong?: PlaceId | null
  hinted?: PlaceId[]
  disabled?: boolean
}

/**
 * Illustrated campus (SVG) with accessible HTML hotspot buttons on top.
 * Drawn top-down in the poster palette: lawns, paths, red-roofed blocks, the pitch.
 */
export function CampusMap({ onPick, wrong, hinted = [], disabled }: Props) {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[440px] overflow-hidden rounded-[2px] shadow-lift">
      <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="grass" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#9bb07a" />
            <path d="M1 7l1-2M5 3l1-2" stroke="#8aa069" strokeWidth=".8" />
          </pattern>
          <pattern id="roof" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#a8202b" />
            <path d="M0 0v6" stroke="#8f1a24" strokeWidth="2" />
          </pattern>
          <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#3c1e0a" floodOpacity=".28" />
          </filter>
        </defs>
        <rect width="300" height="400" fill="url(#grass)" />
        {/* paths */}
        <g fill="none" stroke="#e8d7b6" strokeWidth="12" strokeLinecap="round">
          <path d="M150 400V60M54 60h192M48 208h204" />
          <path d="M150 300c-30 0-40 10-40 20" strokeWidth="8" />
        </g>
        <g fill="none" stroke="#d6c3a5" strokeWidth="1" strokeDasharray="2 3">
          <path d="M150 400V60M54 60h192M48 208h204" />
        </g>
        {/* trees */}
        {[[26, 120], [272, 118], [30, 270], [270, 268], [110, 130], [192, 132], [96, 360], [206, 362]].map(([x, y]) => (
          <g key={`${x}${y}`} filter="url(#soft)">
            <circle cx={x} cy={y} r="11" fill="#5f7a45" />
            <circle cx={x! - 3} cy={y! - 3} r="5" fill="#7a965c" />
          </g>
        ))}
        {/* buildings */}
        <g filter="url(#soft)">
          <rect x="18" y="30" width="72" height="46" rx="3" fill="url(#roof)" />
          <rect x="204" y="28" width="80" height="52" rx="18" fill="#24396b" />
          <rect x="212" y="36" width="64" height="36" rx="13" fill="none" stroke="#fbf4e6" strokeOpacity=".35" strokeDasharray="3 3" />
          <rect x="96" y="92" width="108" height="98" rx="3" fill="url(#roof)" />
          <rect x="132" y="98" width="36" height="22" rx="2" fill="#d6c3a5" />
          <path d="M136 104h28M136 110h28M136 116h28" stroke="#a89c88" strokeWidth="1.5" />
          <rect x="16" y="180" width="64" height="58" rx="3" fill="#6e0c16" />
          <path d="M24 190v40M34 190v40M44 190v40M54 190v40M64 190v40" stroke="#4a0910" strokeWidth="2" />
          <rect x="220" y="182" width="68" height="56" rx="3" fill="url(#roof)" />
          <circle cx="254" cy="210" r="10" fill="#e8d7b6" />
          <path d="M249 210h10M254 205v10" stroke="#a8202b" strokeWidth="2" />
        </g>
        {/* pitch */}
        <g filter="url(#soft)">
          <rect x="60" y="262" width="180" height="120" rx="4" fill="#6f9a4f" />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <rect key={k} x="60" y={262 + k * 20} width="180" height="10" fill="#79a557" />
          ))}
        </g>
        <g fill="none" stroke="#fbf4e6" strokeWidth="1.6" opacity=".9">
          <rect x="68" y="270" width="164" height="104" />
          <path d="M68 322h164" />
          <circle cx="150" cy="322" r="14" />
          <rect x="120" y="270" width="60" height="18" />
          <rect x="120" y="356" width="60" height="18" />
        </g>
      </svg>

      {(Object.keys(SPOTS) as PlaceId[]).map((id) => {
        const s = SPOTS[id]
        const isWrong = wrong === id
        const isHint = hinted.includes(id)
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onPick(id)}
            className={`absolute flex min-h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-pill py-1.5 pr-3 pl-1.5 text-[12px] font-bold shadow-paper transition-transform hover:scale-105 focus-visible:scale-105 ${
              isWrong ? 'answer-wrong bg-red text-cream-hi' : 'bg-cream-hi text-navy'
            } ${isHint ? 'hint-ring' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <span className={`grid size-7 place-items-center rounded-full ${isWrong ? 'bg-cream-hi/20' : 'bg-navy text-cream-hi'}`} aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s-7-6.4-7-12a7 7 0 0 1 14 0c0 5.6-7 12-7 12z" /></svg>
            </span>
            {PLACES[id].name}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Design tokens. Sampled from /design-refs (see docs/DECISIONS.md) and mirrored in
 * src/app/globals.css @theme. Use from TS only where CSS vars can't reach (canvas, three).
 */
export const color = {
  paper: '#EFE3CF',
  paperWarm: '#ECDCC4',
  paperDeep: '#E4D3B9',
  paperShade: '#D6C3A5',
  navy: '#101D3A',
  navyHi: '#24396B',
  maroon: '#6E0C16',
  red: '#A8202B',
  redHi: '#C22F3A',
  ink: '#1B1B26',
  inkSoft: '#4A4552',
  gold: '#C9A24B',
  creamHi: '#FBF4E6',
  night: '#0B1020',
} as const

export const radius = { paper: '2px', pill: '999px' } as const

/** Mobile type scale in px (spec 3.2). */
export const typeScale = [12, 14, 16, 20, 28, 40, 56, 72] as const

import type { ArchetypeId } from '@/config/copy'

/**
 * Original illustrated busts for the six archetypes. Flat poster style in the brand palette,
 * 120×120 grid. Each one is told by silhouette first (hair, outfit, one prop) so it reads at 48px.
 */

type Skin = { base: string; shade: string }
const SKINS: Record<ArchetypeId, Skin> = {
  scholar: { base: '#c68a62', shade: '#a8704c' },
  rebel: { base: '#e2b48d', shade: '#c79470' },
  royal: { base: '#a86f4c', shade: '#8c5a3b' },
  ghost: { base: '#f0caa6', shade: '#d8ab86' },
  canteen: { base: '#8d5a3b', shade: '#74472d' },
  backbencher: { base: '#b97d55', shade: '#9c6542' },
}
const INK = '#1b1b26'
const HAIR = '#231a17'
const NAVY = '#101d3a'
const NAVY_HI = '#24396b'
const MAROON = '#6e0c16'
const RED = '#a8202b'
const CREAM = '#fbf4e6'
const GOLD = '#c9a24b'

function Head({ skin, eyes = 'open', mouth = 'smile' }: { skin: Skin; eyes?: 'open' | 'wink' | 'hidden'; mouth?: 'smile' | 'smirk' | 'flat' | 'grin' }) {
  return (
    <g>
      <rect x="52" y="70" width="16" height="22" rx="6" fill={skin.shade} />
      <ellipse cx="41" cy="57" rx="3.6" ry="5.4" fill={skin.shade} />
      <ellipse cx="79" cy="57" rx="3.6" ry="5.4" fill={skin.shade} />
      <path d="M41 52c0-14 8.5-24 19-24s19 10 19 24c0 13-7 25-19 25S41 65 41 52z" fill={skin.base} />
      {eyes !== 'hidden' && (
        <g fill={INK}>
          <ellipse cx="52.5" cy="56.5" rx="2" ry="2.5" />
          {eyes === 'open' ? <ellipse cx="67.5" cy="56.5" rx="2" ry="2.5" /> : <path d="M65 57q2.5-2 5 0" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />}
          <path d="M49 51.5q3.5-2 7-.6M64 50.9q3.5-1.4 7 .6" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      )}
      <path d="M60 58.5q-2 5.5 1.2 6.6" stroke={skin.shade} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {mouth === 'smile' && <path d="M54.5 69q5.5 4 11 0" stroke={MAROON} strokeWidth="1.8" fill="none" strokeLinecap="round" />}
      {mouth === 'smirk' && <path d="M55 69.5q6 2 10.5-1.5" stroke={MAROON} strokeWidth="1.8" fill="none" strokeLinecap="round" />}
      {mouth === 'flat' && <path d="M56 69.5h8" stroke={MAROON} strokeWidth="1.8" strokeLinecap="round" />}
      {mouth === 'grin' && <path d="M54 68q6 6 12 0z" fill={MAROON} />}
      <circle cx="48" cy="64" r="2.6" fill={RED} opacity=".14" />
      <circle cx="72" cy="64" r="2.6" fill={RED} opacity=".14" />
    </g>
  )
}

const shoulders = 'M12 120c2-20 20-31 48-31s46 11 48 31z'

function Scholar() {
  const skin = SKINS.scholar
  return (
    <>
      <path d={shoulders} fill={NAVY} />
      <path d="M49 89l11 24 11-24z" fill={CREAM} />
      <path d="M57.5 93h5l2 17-4.5 6-4.5-6z" fill={MAROON} />
      <path d="M49 89l-6 9 14 22h3zM71 89l6 9-14 22h-3z" fill={NAVY_HI} />
      <path d="M88 103l1.6 3.3 3.6.4-2.7 2.4.8 3.6-3.3-1.8-3.2 1.8.7-3.6-2.6-2.4 3.6-.4z" fill={GOLD} />
      <Head skin={skin} />
      <path d="M41 51c-1-16 9-24 20-24 12 0 19 8 18 22-3-7-9-10-16-9-6-4-16-1-20 9z" fill={HAIR} />
      <path d="M58 30c-6 2-10 6-11 11" stroke="#3a2b25" strokeWidth="1.4" fill="none" />
      <g fill="none" stroke={INK} strokeWidth="1.6">
        <circle cx="52.5" cy="56.5" r="5.4" />
        <circle cx="67.5" cy="56.5" r="5.4" />
        <path d="M57.9 56h4.2M47.1 55.5l-5-1.5M72.9 55.5l5-1.5" />
      </g>
      <circle cx="51" cy="55" r="1.1" fill={CREAM} opacity=".8" />
    </>
  )
}

function Rebel() {
  const skin = SKINS.rebel
  return (
    <>
      <path d={shoulders} fill="#22222a" />
      <path d="M50 89c3 6 7 9 10 9s7-3 10-9z" fill={CREAM} />
      <path d="M50 89l-10 6 9 14 6-12zM70 89l10 6-9 14-6-12z" fill="#34343e" />
      <path d="M63 98v22" stroke="#9a9aa4" strokeWidth="1.4" strokeDasharray="2 1.6" />
      <path d="M35 106h10M75 106h10" stroke="#4a4a56" strokeWidth="1.6" />
      <Head skin={skin} mouth="smirk" />
      <path d="M41 53c-3-12 1-22 10-27 8-5 19-6 27-1 5 3 6 8 3 11 1 5 0 11-2 16-2-9-8-14-16-14-9 0-17 5-22 15z" fill="#3b2418" />
      <path d="M52 26c6-5 18-6 25-1" stroke="#5b3a28" strokeWidth="1.4" fill="none" />
      <g>
        <rect x="45" y="52" width="13" height="8.5" rx="3.5" fill={INK} />
        <rect x="62" y="52" width="13" height="8.5" rx="3.5" fill={INK} />
        <path d="M58 55.5h4M45 54.5l-4-1M75 54.5l4-1" stroke={INK} strokeWidth="1.6" />
        <path d="M47 54l4 4M64 54l4 4" stroke="#ffffff" strokeWidth="1.2" opacity=".55" />
      </g>
      <circle cx="79" cy="62.5" r="1.4" fill={GOLD} />
    </>
  )
}

function Royal() {
  const skin = SKINS.royal
  return (
    <>
      <path d="M38 52c-5-20 8-28 22-28s28 8 24 30c4 17 2 34-4 46H42c-7-12-8-30-4-48z" fill={HAIR} />
      <path d={shoulders} fill={CREAM} />
      <path d="M44 90c4 10 10 14 16 14s12-4 16-14z" fill={NAVY} />
      <path d="M36 99l8-6 52 25-11 2z" fill={RED} />
      <path d="M41 96l3 3M96 118" stroke={MAROON} strokeWidth="1" />
      <Head skin={skin} mouth="smile" />
      <path d="M42 50c2-13 12-20 22-19 9 1 15 8 15 18-7-8-19-10-30-4-3 2-5 3-7 5z" fill={HAIR} />
      <path d="M42 44c6-10 26-14 36-4" stroke={GOLD} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="35.5" r="2" fill={GOLD} />
      <circle cx="41" cy="65" r="3" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <circle cx="79" cy="65" r="3" fill="none" stroke={GOLD} strokeWidth="1.6" />
    </>
  )
}

function Ghost() {
  const skin = SKINS.ghost
  return (
    <>
      <path d="M30 76c-4-30 12-52 30-52s34 22 30 52l-6 18H36z" fill="#a89c88" />
      <path d={shoulders} fill="#b9ad98" />
      <path d="M44 88c4 6 10 9 16 9s12-3 16-9" stroke="#9c907c" strokeWidth="3" fill="none" />
      <path d="M54 96v12M66 96v12" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="54" cy="109" r="1.6" fill={CREAM} />
      <circle cx="66" cy="109" r="1.6" fill={CREAM} />
      <Head skin={skin} eyes="hidden" mouth="flat" />
      <path d="M41 54c0-17 10-25 21-24 11 1 18 10 17 26-4-4-7-5-12-4-5-3-11 1-15 2-5 0-8 1-11 0z" fill="#3a2a22" />
      <path d="M50 46c4 4 6 9 5 13M62 44c3 4 4 9 3 14" stroke="#58423a" strokeWidth="1.3" fill="none" />
      <path d="M38 92c-2 10 46 10 44 0" stroke={NAVY} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <rect x="32" y="84" width="10" height="13" rx="4.5" fill={RED} />
      <rect x="78" y="84" width="10" height="13" rx="4.5" fill={RED} />
    </>
  )
}

function Canteen() {
  const skin = SKINS.canteen
  return (
    <>
      <path d={shoulders} fill={NAVY} />
      <path d="M12 120c1-11 6-20 14-25l8 25zM108 120c-1-11-6-20-14-25l-8 25z" fill={CREAM} />
      <path d="M47 89c4 5 8 7 13 7s9-2 13-7" stroke={CREAM} strokeWidth="4" fill="none" />
      <path d="M47 89c4 5 8 7 13 7s9-2 13-7" stroke={RED} strokeWidth="1.6" fill="none" />
      <text x="44" y="113" fontFamily="Graduate, serif" fontSize="15" fill={GOLD}>A</text>
      <Head skin={skin} mouth="grin" />
      <path d="M41 48c0-14 9-22 19-22 11 0 19 8 19 22z" fill={RED} />
      <path d="M41 48h38" stroke={MAROON} strokeWidth="2" />
      <ellipse cx="60" cy="26.6" rx="2.6" ry="1.4" fill={MAROON} />
      <path d="M51 32c3-2 6-3 9-3" stroke={CREAM} strokeWidth="1.2" fill="none" opacity=".5" />
      <path d="M41 50c-1 3-1 6 0 8M79 50c1 3 1 6 0 8" stroke={HAIR} strokeWidth="2.4" strokeLinecap="round" />
      {/* cutting chai, steaming */}
      <path d="M86 98h11l-1.6 14h-7.8z" fill="#f4e3c3" stroke="#d9c39d" strokeWidth="1" />
      <path d="M87.2 103h8.6l-.9 8.2h-6.8z" fill="#b5713e" />
      <path d="M89 95c-1.4-2 1.4-3 0-5M94 95c-1.4-2 1.4-3 0-5" stroke={CREAM} strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </>
  )
}

function Backbencher() {
  const skin = SKINS.backbencher
  return (
    <>
      <path d={shoulders} fill={CREAM} />
      <path d="M48 89l7 9 5-4 5 4 7-9" stroke="#d6c3a5" strokeWidth="2" fill="none" strokeLinejoin="round" />
      <path d="M57 99h6l1.6 13-4.6 6-4.6-6z" fill={RED} transform="rotate(12 60 108)" />
      <path d="M32 104l6 16M88 104l-6 16" stroke="#d6c3a5" strokeWidth="1.6" />
      <Head skin={skin} eyes="wink" mouth="grin" />
      <path d="M40 52l-3-12 6 2 0-12 7 6 3-12 6 9 6-11 3 11 8-7-1 10 8-3-3 10 4 9c-4-7-11-11-19-11-9 0-17 4-25 11z" fill={HAIR} />
      <path d="M78 41l14-8" stroke="#e8b44a" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M92 33l2.4-1.4" stroke="#f3d9a6" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M78 41l-1.6 1" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    </>
  )
}

const BUSTS: Record<ArchetypeId, () => React.JSX.Element> = {
  scholar: Scholar,
  rebel: Rebel,
  royal: Royal,
  ghost: Ghost,
  canteen: Canteen,
  backbencher: Backbencher,
}

type Props = { id: ArchetypeId; size?: number; title?: string; className?: string; backdrop?: 'navy' | 'red' | 'paper' | 'none' }

export function Portrait({ id, size = 96, title, className = '', backdrop = 'paper' }: Props) {
  const Bust = BUSTS[id]
  const bg = { navy: NAVY_HI, red: RED, paper: '#e4d3b9', none: 'transparent' }[backdrop]
  const clip = `pc-${id}`
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <clipPath id={clip}>
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="120" height="120" fill={bg} />
        {backdrop !== 'none' && <path d="M0 96L120 70V120H0z" fill="#000" opacity=".06" />}
        <g transform="translate(-7 -3) scale(1.12)">
          <Bust />
        </g>
      </g>
    </svg>
  )
}

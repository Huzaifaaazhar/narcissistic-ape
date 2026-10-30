import type { SVGProps } from 'react'

/**
 * Custom icon set: 24px grid, 2px stroke in currentColor (navy by default), fills in
 * --icon-accent (red) and --icon-paper (cream) so the set reads like embroidered patches.
 * Pass `title` for a meaningful icon; without it the icon is decorative (aria-hidden).
 */
export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number; title?: string }

const A = 'var(--icon-accent, var(--color-red))'
const P = 'var(--icon-paper, var(--color-cream-hi))'

function Svg({ size = 24, title, children, ...rest }: IconProps & { children: React.ReactNode }) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...a11y}
      {...rest}
    >
      {children}
    </svg>
  )
}

export const TrophyIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3.5h10V9a5 5 0 0 1-10 0z" fill={A} />
    <path d="M7 5.5H4.5V7a3.5 3.5 0 0 0 3 3.4M17 5.5h2.5V7a3.5 3.5 0 0 1-3 3.4M12 14v3" />
    <path d="M9.2 17h5.6l.9 3.5H8.3z" fill={P} />
  </Svg>
)

export const FootballIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" fill={P} />
    <path d="M12 9l2.85 2.07-1.09 3.36h-3.52l-1.09-3.36z" fill={A} />
    <path d="M12 9V5.4M14.85 11.07l3.4-1.1M13.76 14.43l2.1 2.9M10.24 14.43l-2.1 2.9M9.15 11.07l-3.4-1.1" />
  </Svg>
)

export const CoffeeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 9h11.5v4.5a5 5 0 0 1-5 5H9.5a5 5 0 0 1-5-5z" fill={A} />
    <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M3 21.5h15M8 3c-.7.9.7 1.8 0 2.8M12 3c-.7.9.7 1.8 0 2.8" />
  </Svg>
)

export const LockerIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="2.5" width="18" height="19" rx="1" fill={P} />
    <path d="M12 2.5v19M5.5 5.5h4M5.5 7.5h4M14.5 5.5h4M14.5 7.5h4" />
    <path d="M9.5 12v3M14.5 12v3" stroke={A} strokeWidth={2.4} />
  </Svg>
)

export const KeyIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7.5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill={A} fillRule="evenodd" />
    <path d="M10.7 11.2l9 9M15.5 16l2.2-2.2M18 18.5l2-2" />
  </Svg>
)

export const PennantIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 3v18.5" />
    <path d="M5 4.5l15 5-15 5z" fill={A} />
  </Svg>
)

export const CrestIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.8l8 3v5.5c0 5-3.6 8.5-8 10-4.4-1.5-8-5-8-10V5.8z" fill={P} />
    <path d="M12 2.8v18.5c-4.4-1.5-8-5-8-10V5.8z" fill={A} />
    <path d="M12 2.8l8 3v5.5c0 5-3.6 8.5-8 10-4.4-1.5-8-5-8-10V5.8z" />
  </Svg>
)

export const MedalIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 2.5l3.6 7.2M17 2.5l-3.6 7.2" />
    <circle cx="12" cy="15" r="6" fill={A} />
    <circle cx="12" cy="15" r="2.8" fill={P} strokeWidth={1.5} />
  </Svg>
)

export const StarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.8l2.75 5.95 6.5.75-4.8 4.45 1.3 6.45L12 17.15 6.25 20.4l1.3-6.45L2.75 9.5l6.5-.75z" fill={A} />
  </Svg>
)

export const FlameIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.5c.9 3.6 6 5.6 6 11.4a6 6 0 0 1-12 0c0-2.8 1.5-4.6 2.8-5.7.2 1.9 1 3 2.1 3.6-.3-3.8.3-6.5 1.1-9.3z" fill={A} />
    <path d="M12 20.4a2.3 2.3 0 0 1-2.3-2.3c0-1.7 1.3-2.5 2.3-4 1 1.5 2.3 2.3 2.3 4a2.3 2.3 0 0 1-2.3 2.3z" fill={P} strokeWidth={1.5} />
  </Svg>
)

export const ScrollIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 5h11v13a2.5 2.5 0 0 1-2.5 2.5H6" fill={P} />
    <path d="M7 5a2 2 0 1 0-4 0v1.5h4M6 20.5A2.5 2.5 0 0 0 8.5 18v-.5H21v.5a2.5 2.5 0 0 1-2.5 2.5H6zM10.5 9h4.5M10.5 12h4.5" />
    <circle cx="15.5" cy="15" r="1.4" fill={A} strokeWidth={1.2} />
  </Svg>
)

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21.5s-6.5-6-6.5-11.5a6.5 6.5 0 0 1 13 0c0 5.5-6.5 11.5-6.5 11.5z" fill={A} />
    <circle cx="12" cy="10" r="2.4" fill={P} />
  </Svg>
)

export const MusicIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 17.5V5.5l10.5-2.5v12M9 9l10.5-2.5" />
    <ellipse cx="6.5" cy="17.5" rx="2.7" ry="2.2" fill={A} />
    <ellipse cx="17" cy="15" rx="2.7" ry="2.2" fill={A} />
  </Svg>
)

export const WhistleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 9.5h11v3.5h-6.2" />
    <path d="M10 9.5a5.5 5.5 0 1 1-5.4 4.5" fill={A} />
    <path d="M4.6 14L10 9.5" />
    <circle cx="9" cy="15" r="1.5" fill={P} strokeWidth={1.5} />
    <path d="M14 9.5V7.5h2.5v2" />
  </Svg>
)

export const MegaphoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 10v4h3.5l9.5 5.5v-15L7 10z" fill={A} />
    <path d="M7.5 14l1.3 5.5h2.6l-.9-4.6M19.5 9.5a3.5 3.5 0 0 1 0 5" />
  </Svg>
)

export const TimerIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="13.5" r="7.8" fill={P} />
    <path d="M12 13.5V5.7a7.8 7.8 0 0 1 6.75 3.9z" fill={A} strokeWidth={0} />
    <circle cx="12" cy="13.5" r="7.8" />
    <path d="M10 2.5h4M12 2.5v3.2M12 13.5l3-3M18.7 5.3l1.4 1.4" />
  </Svg>
)

export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 10.5v-3a4 4 0 0 1 8 0v3" />
    <rect x="5" y="10.5" width="14" height="10.5" rx="1.5" fill={A} />
    <path d="M12 14.6v2.6" stroke={P} />
  </Svg>
)

export const ShareIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7.5 10H5.5v10.5h13V10h-2" fill={P} />
    <path d="M12 3v11.5M8 7l4-4 4 4" />
  </Svg>
)

export const HeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20.5s-8.5-4.8-8.5-11a4.6 4.6 0 0 1 8.5-2.5 4.6 4.6 0 0 1 8.5 2.5c0 6.2-8.5 11-8.5 11z" fill={A} />
  </Svg>
)

export const DuelIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8h15M15 4l4 4-4 4" stroke={A} />
    <path d="M20 16H5M9 12l-4 4 4 4" />
  </Svg>
)

export const SettingsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M18.83 10.47L21.12 10.81 21.12 13.19 18.83 13.53 17.91 15.75 19.29 17.61 17.61 19.29 15.75 17.91 13.53 18.83 13.19 21.12 10.81 21.12 10.47 18.83 8.25 17.91 6.39 19.29 4.71 17.61 6.09 15.75 5.17 13.53 2.88 13.19 2.88 10.81 5.17 10.47 6.09 8.25 4.71 6.39 6.39 4.71 8.25 6.09 10.47 5.17 10.81 2.88 13.19 2.88 13.53 5.17 15.75 6.09 17.61 4.71 19.29 6.39 17.91 8.25Z"
      fill={P}
      strokeWidth={1.75}
    />
    <circle cx="12" cy="12" r="3" fill={A} />
  </Svg>
)

const Speaker = () => <path d="M3.5 9.5H7l4.5-4v13L7 14.5H3.5z" fill={A} />

export const SoundOnIcon = (p: IconProps) => (
  <Svg {...p}>
    <Speaker />
    <path d="M15 9a4 4 0 0 1 0 6M17.8 6.3a7.8 7.8 0 0 1 0 11.4" />
  </Svg>
)

export const SoundOffIcon = (p: IconProps) => (
  <Svg {...p}>
    <Speaker />
    <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
  </Svg>
)

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" strokeWidth={2.4} />
  </Svg>
)

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12.5l5 5 10-11" strokeWidth={2.4} />
  </Svg>
)

export const PlayIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4.5v15l12.5-7.5z" fill={A} />
  </Svg>
)

export const PauseIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="4.5" width="4" height="15" rx="1" fill={A} />
    <rect x="14" y="4.5" width="4" height="15" rx="1" fill={A} />
  </Svg>
)

export const icons = {
  trophy: TrophyIcon,
  football: FootballIcon,
  coffee: CoffeeIcon,
  locker: LockerIcon,
  key: KeyIcon,
  pennant: PennantIcon,
  crest: CrestIcon,
  medal: MedalIcon,
  star: StarIcon,
  flame: FlameIcon,
  scroll: ScrollIcon,
  pin: PinIcon,
  music: MusicIcon,
  whistle: WhistleIcon,
  megaphone: MegaphoneIcon,
  timer: TimerIcon,
  lock: LockIcon,
  share: ShareIcon,
  heart: HeartIcon,
  duel: DuelIcon,
  settings: SettingsIcon,
  soundOn: SoundOnIcon,
  soundOff: SoundOffIcon,
  close: CloseIcon,
  check: CheckIcon,
  play: PlayIcon,
  pause: PauseIcon,
} as const

export type IconName = keyof typeof icons

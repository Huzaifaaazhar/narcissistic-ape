import type { ElementType, ReactNode } from 'react'
import { tornPolygon, tilt } from './torn'

type Props = {
  seed: string
  children: ReactNode
  as?: ElementType
  className?: string
  paperClassName?: string
  /** Rotate slightly like a label stuck on by hand. */
  tilted?: boolean
  depth?: number
}

/** Torn-paper label (ref-3 ticket cards). Shadow lives on the wrapper because clip-path would cut it. */
export function TornCard({ seed, children, as: Tag = 'div', className = '', paperClassName = '', tilted = true, depth }: Props) {
  const rot = tilted ? tilt(seed) : 0
  return (
    <Tag className={`torn ${className}`} style={rot ? { transform: `rotate(${rot}deg)` } : undefined}>
      <div className={`torn-paper ${paperClassName}`} style={{ clipPath: tornPolygon(seed, { depth }) }}>
        {children}
      </div>
    </Tag>
  )
}

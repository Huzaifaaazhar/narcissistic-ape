import type { ElementType, ReactNode } from 'react'

type Props = {
  children: ReactNode
  as?: ElementType
  tone?: 'maroon' | 'navy'
  className?: string
}

/** Collegiate title with the poster's triple outline. The back layer is decorative only. */
export function Varsity({ children, as: Tag = 'span', tone = 'maroon', className = '' }: Props) {
  return (
    <Tag className={`varsity ${tone === 'navy' ? 'varsity-navy' : ''} ${className}`}>
      <span className="varsity-back" aria-hidden="true">{children}</span>
      <span className="varsity-front">{children}</span>
    </Tag>
  )
}

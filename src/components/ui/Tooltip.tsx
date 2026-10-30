'use client'
import { useId, type ReactElement, cloneElement } from 'react'

type Props = { text: string; children: ReactElement<{ 'aria-describedby'?: string }>; forceOpen?: boolean }

/** Hover/focus tooltip. Supplementary only: never the sole place information lives. */
export function Tooltip({ text, children, forceOpen }: Props) {
  const id = useId()
  return (
    <span className="tip" data-force={forceOpen ? 'open' : undefined}>
      {cloneElement(children, { 'aria-describedby': id })}
      <span role="tooltip" id={id} className="tip-bubble">{text}</span>
    </span>
  )
}

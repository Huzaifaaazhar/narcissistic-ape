'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from '@/components/icons'
import { tornPolygon } from './torn'

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode; seed?: string }

/**
 * Bottom sheet on phones, centred modal from 640px. Native <dialog> gives focus trap,
 * Esc to close and inert background for free.
 */
export function Sheet({ open, onClose, title, children, seed = 'sheet' }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  // Torn top edge only: clip a polygon whose sides/bottom are straight.
  const edge = tornPolygon(seed, { depth: 0.9, steps: 40 }).replace(/polygon\((.*)\)/, '$1').split(', ').slice(0, 41)
  const clip = `polygon(${edge.join(', ')}, 100% 100%, 0% 100%)`
  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={`${seed}-title`}
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="torn-paper px-5 pt-8 pb-[max(24px,env(safe-area-inset-bottom))] sm:pb-7" style={{ clipPath: clip }}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-pill bg-paper-shade sm:hidden" aria-hidden="true" />
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={`${seed}-title`} className="font-[family-name:var(--font-condensed)] text-[32px] leading-none text-navy uppercase">{title}</h2>
          <button type="button" onClick={onClose} className="-mt-1 -mr-1 grid size-11 shrink-0 place-items-center rounded-full text-navy hover:bg-paper-shade/60" aria-label="Close">
            <CloseIcon size={22} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}

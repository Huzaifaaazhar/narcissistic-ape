'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { SettingsIcon, SoundOnIcon } from '@/components/icons'

export function SheetDemo({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen)
  return (
    <>
      <Button variant="secondary" icon={<SettingsIcon size={20} className="[--icon-paper:var(--color-navy)] [--icon-accent:var(--color-red)] text-cream-hi" />} onClick={() => setOpen(true)}>
        Open settings
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Settings">
        <ul className="divide-y divide-paper-shade">
          {['Sound effects', 'Music', 'Haptics', 'Reduce motion'].map((s, i) => (
            <li key={s} className="flex min-h-14 items-center justify-between">
              <span className="flex items-center gap-3 font-semibold text-navy">
                {i === 0 && <SoundOnIcon size={22} />}
                {s}
              </span>
              <span className={`label rounded-pill px-3 py-1 text-[11px] font-bold ${i < 2 ? 'bg-navy text-cream-hi' : 'border-2 border-navy text-navy'}`}>{i < 2 ? 'On' : 'Off'}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6"><Button block onClick={() => setOpen(false)}>Done</Button></div>
      </Sheet>
    </>
  )
}

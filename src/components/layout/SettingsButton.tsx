'use client'
import { useEffect, useState } from 'react'
import { copy } from '@/config/copy'
import { useSettings, type GraphicsPref } from '@/state/settings'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { SettingsIcon } from '@/components/icons'

/** Gear button + settings sheet. Phase 1 ships the graphics preference; sound/haptics arrive with audio. */
export function SettingsButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const graphics = useSettings((s) => s.graphics)
  const setGraphics = useSettings((s) => s.setGraphics)
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a media query after mount
    setReducedMotion(matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={copy.settings.open}
        className={`grid size-12 place-items-center rounded-full bg-cream-hi/85 text-navy shadow-paper backdrop-blur-sm hover:bg-cream-hi ${className}`}
      >
        <SettingsIcon size={24} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={copy.settings.title} seed="settings">
        <fieldset>
          <legend className="label text-[12px] font-bold text-navy">{copy.settings.graphics}</legend>
          <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup">
            {(['auto', 'high', 'low'] as GraphicsPref[]).map((g) => (
              <label
                key={g}
                className={`label flex min-h-12 cursor-pointer items-center justify-center rounded-pill border-2 text-[12px] font-bold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-navy ${graphics === g ? 'border-navy bg-navy text-cream-hi' : 'border-navy/40 text-navy'}`}
              >
                <input type="radio" name="graphics" value={g} checked={graphics === g} onChange={() => setGraphics(g)} className="sr-only" />
                {copy.settings.options[g]}
              </label>
            ))}
          </div>
          <p className="mt-3 text-[14px] text-ink-soft">{copy.settings.graphicsHint}</p>
          {reducedMotion && <p className="mt-2 text-[14px] font-semibold text-maroon">{copy.settings.motionNote}</p>}
        </fieldset>
        <div className="mt-6"><Button block onClick={() => setOpen(false)}>{copy.settings.done}</Button></div>
      </Sheet>
    </>
  )
}

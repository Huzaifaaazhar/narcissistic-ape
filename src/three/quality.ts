'use client'
import { useEffect, useState } from 'react'
import { useSettings, type GraphicsPref } from '@/state/settings'

export type Tier = 'high' | 'low' | 'poster'

export type DeviceInfo = {
  webgl: boolean
  reducedMotion: boolean
  cores: number
  mobile: boolean
  saveData: boolean
}

export function probeDevice(): DeviceInfo {
  let webgl = false
  try {
    const c = document.createElement('canvas')
    webgl = !!c.getContext('webgl2')
  } catch {
    webgl = false
  }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; userAgentData?: { mobile?: boolean } }
  return {
    webgl,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    cores: navigator.hardwareConcurrency || 4,
    mobile: nav.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    saveData: !!nav.connection?.saveData,
  }
}

/** Pure decision so it can be unit-tested. Low-end = few cores AND mobile; the fps probe can demote later. */
export function decideTier(d: DeviceInfo, pref: GraphicsPref): Tier {
  if (!d.webgl || d.reducedMotion || d.saveData) return 'poster'
  if (pref === 'low') return 'low'
  if (pref === 'high') return 'high'
  if (d.mobile && d.cores <= 4) return 'poster'
  return d.mobile ? 'low' : 'high'
}

/** Resolves on the client only; `null` during SSR/first paint so the poster is always what paints first. */
export function useTier(): Tier | null {
  const pref = useSettings((s) => s.graphics)
  const [tier, setTier] = useState<Tier | null>(null)
  useEffect(() => {
    const url = new URL(location.href)
    const forced = url.searchParams.get('tier') as Tier | null
    // eslint-disable-next-line react-hooks/set-state-in-effect -- probing browser capabilities is inherently post-mount
    setTier(forced ?? decideTier(probeDevice(), pref))
  }, [pref])
  return tier
}

export const tierConfig = {
  high: { dpr: [1, 2] as [number, number], post: true, reflectRes: 512, shadows: true, motes: 260 },
  low: { dpr: [1, 1.5] as [number, number], post: false, reflectRes: 256, shadows: true, motes: 90 },
} as const

'use client'
import { useEffect, useState } from 'react'

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
let deferred: InstallEvent | null = null
const listeners = new Set<() => void>()

/** Registers the offline shell (production only) and keeps the install prompt for a good moment. */
export function registerPwa() {
  if (typeof window === 'undefined') return
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // never on first load: we offer it after a win
    deferred = e as InstallEvent
    listeners.forEach((l) => l())
  })
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    // this runs from an effect, which can be after `load` already fired
    if (document.readyState === 'complete') register()
    else addEventListener('load', register, { once: true })
  }
}

/** True when the browser will let us show "Add to home screen". */
export function useInstallPrompt() {
  const [can, setCan] = useState(false)
  useEffect(() => {
    const update = () => setCan(!!deferred)
    update()
    listeners.add(update)
    return () => { listeners.delete(update) }
  }, [])
  const install = async () => {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    deferred = null
    listeners.forEach((l) => l())
    return outcome === 'accepted'
  }
  return { can, install }
}

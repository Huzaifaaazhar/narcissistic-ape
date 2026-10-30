'use client'
import { useSettings } from '@/state/settings'

/**
 * Micro-feedback within 100 ms of every tap: synthesised blips (WebAudio, no files) + haptics.
 * Audio starts only after a user gesture (first call creates the context inside the tap handler).
 */
let ctx: AudioContext | null = null
export function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.15, when = 0, slideTo?: number) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + when
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

const SOUNDS = {
  tap: () => tone(660, 0.05, 'triangle', 0.08),
  correct: () => { tone(660, 0.09, 'triangle', 0.14); tone(990, 0.16, 'triangle', 0.14, 0.08) },
  wrong: () => tone(220, 0.25, 'sawtooth', 0.06, 0, 140),
  streak: () => { tone(784, 0.08, 'square', 0.06); tone(988, 0.08, 'square', 0.06, 0.07); tone(1318, 0.14, 'square', 0.06, 0.14) },
  tick: () => tone(1200, 0.03, 'square', 0.04),
  whistle: () => tone(2100, 0.35, 'sine', 0.08, 0, 2300),
  kick: () => tone(150, 0.12, 'sine', 0.3, 0, 60),
  goal: () => { tone(523, 0.12, 'triangle', 0.15); tone(659, 0.12, 'triangle', 0.15, 0.1); tone(784, 0.3, 'triangle', 0.15, 0.2) },
  stamp: () => tone(110, 0.12, 'square', 0.12, 0, 70),
} as const

const HAPTICS: Partial<Record<keyof typeof SOUNDS, number | number[]>> = {
  tap: 8, correct: 18, wrong: [30, 40, 30], streak: [10, 30, 10], goal: [40, 30, 60], kick: 25, stamp: 35,
}

export function feedback(kind: keyof typeof SOUNDS) {
  const s = useSettings.getState()
  if (s.sound) {
    try { SOUNDS[kind]() } catch { /* audio is a nicety */ }
  }
  const h = HAPTICS[kind]
  // browsers block vibration until the user has interacted with the page
  const active = typeof navigator !== 'undefined' && (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive !== false
  if (s.haptics && h && active && 'vibrate' in navigator) navigator.vibrate(h)
}

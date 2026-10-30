'use client'
import { BARS, BPM, LEAD_IN_BEATS } from '@/game/dance'

/**
 * Original 116 BPM loop synthesised with WebAudio: four-on-the-floor kick, snare on 2 & 4,
 * eighth-note hats, a simple bassline and a count-in. Scheduled up front against the audio
 * clock so gameplay timing never drifts. Returns the song start time and a stop function.
 */
export function playBeat(ctx: AudioContext, gainLevel = 0.9) {
  const beat = 60 / BPM
  const start = ctx.currentTime + 0.15
  const master = ctx.createGain()
  master.gain.value = gainLevel
  master.connect(ctx.destination)
  const nodes: AudioScheduledSourceNode[] = []

  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1

  const kick = (t: number, level = 1) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.frequency.setValueAtTime(140, t)
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14)
    g.gain.setValueAtTime(0.9 * level, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.32); nodes.push(o)
  }
  const hiss = (t: number, dur: number, freq: number, level: number, type: BiquadFilterType) => {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain()
    s.buffer = noise; f.type = type; f.frequency.value = freq
    g.gain.setValueAtTime(level, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + dur + 0.02); nodes.push(s)
  }
  const bass = (t: number, freq: number) => {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain()
    o.type = 'sawtooth'; o.frequency.value = freq
    f.type = 'lowpass'; f.frequency.value = 380
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.45)
    o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + beat * 0.5); nodes.push(o)
  }
  const blip = (t: number, freq: number) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'square'; o.frequency.value = freq
    g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.14); nodes.push(o)
  }

  // count-in
  for (let b = 0; b < LEAD_IN_BEATS; b++) blip(start + b * beat, b === LEAD_IN_BEATS - 1 ? 1320 : 880)
  // A minor-ish progression: A, F, C, G (Hz of the bass root)
  const roots = [55, 43.65, 65.41, 49]
  for (let bar = 0; bar < BARS; bar++) {
    const root = roots[Math.floor(bar / 2) % 4]!
    const drop = bar % 8 === 7
    for (let b = 0; b < 4; b++) {
      const t = start + (LEAD_IN_BEATS + bar * 4 + b) * beat
      if (!(drop && b >= 2)) kick(t, b === 0 ? 1 : 0.85)
      if (b % 2 === 1) hiss(t, 0.18, 1800, 0.45, 'bandpass')
      hiss(t, 0.04, 8000, 0.12, 'highpass')
      hiss(t + beat / 2, 0.04, 8000, bar / BARS > 0.6 ? 0.16 : 0.08, 'highpass')
      bass(t, root * (b === 3 ? 1.5 : 1))
      if (b === 2 && bar % 2 === 1) bass(t + beat / 2, root * 2)
    }
  }
  const end = start + (LEAD_IN_BEATS + BARS * 4 + 1) * beat
  kick(end, 1.1)
  hiss(end, 1.2, 6000, 0.25, 'highpass')

  return {
    start,
    stop: () => {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
      setTimeout(() => { nodes.forEach((n) => { try { n.stop() } catch { /* already stopped */ } }); master.disconnect() }, 200)
    },
  }
}

'use client'
import { useEffect, useState } from 'react'
import { playBeat } from '@/lib/beat'
import { songLength } from '@/game/dance'

/** Dev-only: renders the dance beat offline to a 48 kHz stereo WAV (base64) for promo muxing. */
export default function BeatRender() {
  const [status, setStatus] = useState('rendering')
  useEffect(() => {
    const run = async () => {
      const rate = 48000
      const seconds = songLength() + 0.15 + 2
      const ctx = new OfflineAudioContext(2, Math.ceil(rate * seconds), rate)
      playBeat(ctx as unknown as AudioContext, 0.9)
      const buf = await ctx.startRendering()
      const n = buf.length
      const out = new DataView(new ArrayBuffer(44 + n * 4))
      const w = (o: number, s: string) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)))
      w(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); w(8, 'WAVE'); w(12, 'fmt ')
      out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true)
      out.setUint32(24, rate, true); out.setUint32(28, rate * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true)
      w(36, 'data'); out.setUint32(40, n * 4, true)
      const L = buf.getChannelData(0), R = buf.getChannelData(1)
      for (let i = 0; i < n; i++) {
        out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i]!)) * 0x7fff, true)
        out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i]!)) * 0x7fff, true)
      }
      const bytes = new Uint8Array(out.buffer)
      let bin = ''
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
      ;(window as unknown as { __beatWav: string }).__beatWav = btoa(bin)
      setStatus('done')
    }
    run().catch((e) => setStatus('error: ' + (e as Error).message))
  }, [])
  return <p id="status">{status}</p>
}

'use client'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

/**
 * Frozen (screenshot/poster) scenes render on demand. This forces a burst of frames after mount
 * so late-mounting objects, font-gated textures and the camera rig all land, then goes idle so
 * the main thread is free for capture.
 */
export function Kick({ ms = 4000 }: { ms?: number }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let raf = 0
    const until = performance.now() + ms
    const tick = () => {
      invalidate()
      if (performance.now() < until) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [invalidate, ms])
  return null
}

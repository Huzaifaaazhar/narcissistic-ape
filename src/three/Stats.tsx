'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'

/** Dev overlay: fps, draw calls, triangles (of the previous frame, incl. post passes). Writes to a DOM node; no React state per frame. */
export function SceneStats({ target }: { target: RefObject<HTMLElement | null> }) {
  const gl = useThree((s) => s.gl)
  const acc = useRef({ frames: 0, t: 0, calls: 0, tris: 0 })
  useEffect(() => {
    gl.info.autoReset = false
    return () => { gl.info.autoReset = true }
  }, [gl])
  useFrame((_, dt) => {
    const a = acc.current
    a.frames++
    a.t += dt
    a.calls = gl.info.render.calls
    a.tris = gl.info.render.triangles
    gl.info.reset()
    const el = target.current
    if (a.t >= 0.5 && el) {
      el.textContent = `${Math.round(a.frames / a.t)} fps · ${a.calls} calls · ${(a.tris / 1000).toFixed(1)}k tris · dpr ${gl.getPixelRatio().toFixed(2)}`
      a.frames = 0
      a.t = 0
    }
  })
  return null
}

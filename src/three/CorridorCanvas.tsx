'use client'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { CorridorScene, CORRIDOR } from './scenes/Corridor'
import { corridorInput } from './input'
import { CorridorEnvironment } from './Lighting'
import { Post } from './postfx/Post'
import { SceneStats } from './Stats'
import { Kick } from './hooks/Kick'
import { useSceneParams } from './hooks/useSceneParams'
import { tierConfig, type Tier } from './quality'

type Props = { tier: Exclude<Tier, 'poster'>; className?: string; onReady?: () => void; onFallback?: () => void }

/**
 * Landing hero. Starts at the tier's DPR and steps down if fps sags (PerformanceMonitor);
 * if it keeps sagging, falls back to the poster via onFallback.
 */
export default function CorridorCanvas({ tier, className = '', onReady, onFallback }: Props) {
  const cfg = tierConfig[tier]
  const { freeze, debug, p } = useSceneParams()
  const [dpr, setDpr] = useState(cfg.dpr[1])
  const [post, setPost] = useState<boolean>(cfg.post)
  const statsEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (freeze) return
    const onMove = (e: PointerEvent) => {
      corridorInput.pointerX = (e.clientX / innerWidth) * 2 - 1
      corridorInput.pointerY = -((e.clientY / innerHeight) * 2 - 1)
    }
    addEventListener('pointermove', onMove, { passive: true })
    return () => removeEventListener('pointermove', onMove)
  }, [freeze])

  return (
    <div className={className || 'relative h-full w-full'}>
      <Canvas
        dpr={dpr}
        shadows={cfg.shadows}
        frameloop={freeze ? 'demand' : 'always'}
        camera={{ fov: 40, position: [0.28, 1.58, 1.6], near: 0.1, far: 60 }}
        gl={{ antialias: !cfg.post, powerPreference: 'high-performance', alpha: false, stencil: false }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
          const haze = new THREE.Color('#c9a07a')
          scene.background = haze
          scene.fog = new THREE.Fog(haze, 13, 46)
          // two frames: one to compile, one to show
          requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))
        }}
        aria-hidden="true"
      >
        <PerformanceMonitor
          bounds={() => [42, 58]}
          flipflops={3}
          onDecline={() => {
            if (post) setPost(false)
            else setDpr((d) => Math.max(1, d - 0.25))
          }}
          onFallback={() => onFallback?.()}
        >
          <Suspense fallback={null}>
            <CorridorEnvironment />
            <CorridorScene quality={tier} frozen={freeze} fixedP={p} />
            {post && <Post bloom={0.5} />}
            {debug && <SceneStats target={statsEl} />}
            {freeze && <Kick />}
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
      {debug && <div ref={statsEl} className="pointer-events-none absolute top-2 left-2 z-10 rounded-[2px] bg-night/80 px-2 py-1 font-mono text-[11px] text-cream-hi" />}
    </div>
  )
}

export { CORRIDOR }

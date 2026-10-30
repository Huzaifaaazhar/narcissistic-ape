'use client'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Motes } from './objects/Motes'
import { FitCamera } from './hooks/FitCamera'
import { useEffect as useFloorEffect, useMemo } from 'react'
import { glowBackground } from './materials/backgrounds'
import { Suspense, useRef, useState } from 'react'
import * as THREE from 'three'
import { Trophy } from './objects/Trophy'
import { StudioEnvironment } from './Lighting'
import { Post } from './postfx/Post'
import { SceneStats } from './Stats'
import { Kick } from './hooks/Kick'
import { useSceneParams } from './hooks/useSceneParams'
import { tierConfig, type Tier } from './quality'

const TARGET: [number, number, number] = [0, 0.05, 0]

/** Dark stage disc that fades to transparent so the background glow shows past it (no horizon line). */
function StageFloor() {
  const { mat, alpha } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, '#fff'); g.addColorStop(0.18, '#fff'); g.addColorStop(0.42, '#555'); g.addColorStop(0.7, '#000')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    const alpha = new THREE.CanvasTexture(c)
    const mat = new THREE.MeshStandardMaterial({ color: '#121318', roughness: 0.82, transparent: true, alphaMap: alpha, depthWrite: false })
    return { mat, alpha }
  }, [])
  useFloorEffect(() => () => { mat.dispose(); alpha.dispose() }, [mat, alpha])
  return (
    <mesh rotation-x={-Math.PI / 2} material={mat} receiveShadow>
      <circleGeometry args={[1.5, 64]} />
    </mesh>
  )
}

type Props = {
  name?: string
  sub?: string
  tier: Exclude<Tier, 'poster'>
  className?: string
  /** Lets the parent cross-fade from the poster once the first frame is on screen. */
  onReady?: () => void
}

/**
 * Drag to rotate (damped inertia), pinch/scroll to zoom, auto-rotates after 3 s idle.
 * Rendered on a dark stage so the gold reads; the page around it stays paper.
 */
export default function TrophyViewer({ name, sub, tier, className = '', onReady }: Props) {
  const cfg = tierConfig[tier]
  const { freeze, debug } = useSceneParams()
  const [auto, setAuto] = useState(!freeze)
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined)
  const statsEl = useRef<HTMLDivElement>(null)

  return (
    <div className={className || 'relative h-full w-full'}>
      <Canvas
        dpr={cfg.dpr}
        shadows={cfg.shadows}
        frameloop={freeze ? 'demand' : 'always'}
        camera={{ fov: 32, position: [0.36, 0.34, 1.12], near: 0.05, far: 20 }}
        gl={{ antialias: !cfg.post, powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
          scene.background = glowBackground('#4a2f1a', '#0b0c11', 0.46)
          scene.fog = null
          requestAnimationFrame(() => onReady?.())
        }}
        aria-label={`3D trophy engraved for ${name ?? 'you'}. Drag to rotate.`}
        role="img"
      >
        <Suspense fallback={null}>
          <StudioEnvironment />
          <spotLight position={[0.6, 1.6, 0.8]} angle={0.4} penumbra={0.8} intensity={14} color="#fff1dc" castShadow={cfg.shadows} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
          <Motes count={tier === 'high' ? 70 : 30} box={[0.7, 0.9, 0.6]} position={[0.05, 0.2, -0.05]} size={0.0035} opacity={0.7} frozen={freeze} />
          <group position={[0, -0.2, 0]}>
            <Trophy name={name} sub={sub} quality={tier} />
            <StageFloor />
            <ContactShadows position={[0, 0.001, 0]} opacity={0.75} scale={0.9} blur={2.4} far={0.5} resolution={512} color="#000000" frames={freeze ? 1 : Infinity} />
          </group>
          <FitCamera width={0.42} height={0.6} target={TARGET} margin={1.2} />
          <OrbitControls
            makeDefault
            target={TARGET}
            enablePan={false}
            enableDamping
            dampingFactor={0.07}
            rotateSpeed={0.7}
            minDistance={0.55}
            maxDistance={1.6}
            minPolarAngle={Math.PI * 0.2}
            maxPolarAngle={Math.PI * 0.52}
            autoRotate={auto}
            autoRotateSpeed={0.9}
            onStart={() => { clearTimeout(idle.current); setAuto(false) }}
            onEnd={() => { idle.current = setTimeout(() => setAuto(true), 3000) }}
          />
          {cfg.post && <Post bloom={0.4} />}
          {debug && <SceneStats target={statsEl} />}
            {freeze && <Kick />}
        </Suspense>
      </Canvas>
      {debug && <div ref={statsEl} className="pointer-events-none absolute top-2 left-2 rounded-[2px] bg-night/80 px-2 py-1 font-mono text-[11px] text-cream-hi" />}
    </div>
  )
}

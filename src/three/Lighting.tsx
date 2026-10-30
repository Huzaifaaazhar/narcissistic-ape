'use client'
import { Environment, Lightformer } from '@react-three/drei'

/**
 * Image-based lighting built from softboxes (no HDRI download). Rendered once into a cube map.
 * Studio: big key from upper-left, strip rims, warm floor bounce, so gold gets long clean highlights.
 */
export function StudioEnvironment({ intensity = 1 }: { intensity?: number }) {
  // Dark room + shaped softboxes. The bowl's front reflects what's behind the camera, so the
  // big soft front box carries the read; strips give the long edge highlights; warm floor bounce
  // fills the underside. Dark gaps between boxes keep contrast (metals need something to not reflect).
  return (
    <Environment resolution={256} frames={1} environmentIntensity={intensity}>
      <color attach="background" args={['#08090d']} />
      <Lightformer form="circle" intensity={1.5} color="#fff3e0" position={[0.4, 1.8, 4]} scale={[4.5, 3, 1]} target={[0, 0.2, 0]} />
      <Lightformer form="rect" intensity={7} color="#fff1dc" position={[-2.6, 2.8, 1.4]} scale={[1.8, 1.4, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={5} color="#ffffff" position={[3, 1.2, -0.6]} scale={[0.35, 5, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={3.5} color="#ffe2b0" position={[-3, 0.8, -1.6]} scale={[0.3, 4, 1]} target={[0, 0, 0]} />
      <Lightformer form="rect" intensity={1.1} color="#d8a868" position={[0, -2.2, 1.5]} rotation-x={Math.PI / 2} scale={[6, 3, 1]} />
      <Lightformer form="ring" intensity={1.2} color="#fff6e8" position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={1.4} />
      <Lightformer form="rect" intensity={0.4} color="#7f93c4" position={[3, 2, 3]} scale={[2, 1.5, 1]} target={[0, 0, 0]} />
    </Environment>
  )
}

/** Golden-hour corridor bounce: warm windows on one side, cool ceiling, warm floor. */
export function CorridorEnvironment({ intensity = 0.55 }: { intensity?: number }) {
  return (
    <Environment resolution={128} frames={1} environmentIntensity={intensity}>
      {/* the corridor is bright plaster: a mid-warm base so metals never reflect a black void */}
      <color attach="background" args={['#8a6a50']} />
      <Lightformer form="rect" intensity={5} color="#ffc27a" position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[20, 2.5, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#f3e2c7" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[4, 20, 1]} />
      <Lightformer form="rect" intensity={0.35} color="#b07a62" position={[0, -2, 0]} rotation-x={-Math.PI / 2} scale={[6, 20, 1]} />
      <Lightformer form="rect" intensity={0.5} color="#8ea0c8" position={[6, 2, 0]} rotation-y={-Math.PI / 2} scale={[20, 3, 1]} />
    </Environment>
  )
}

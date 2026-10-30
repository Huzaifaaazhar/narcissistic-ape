'use client'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { rng } from '@/game/rng'
import { moteTexture } from '@/three/materials/textures'

type Props = {
  count: number
  /** Box the motes live in: [w, h, d] centred on position. */
  box: [number, number, number]
  position?: [number, number, number]
  /** World-space size in metres. */
  size?: number
  opacity?: number
  color?: string
  frozen?: boolean
  seed?: string
}

/**
 * Dust motes: additive soft sprites, drifting in the vertex shader (no per-frame CPU work or
 * allocation; only a time uniform changes).
 */
export function Motes({ count, box, position = [0, 0, 0], size = 0.01, opacity = 0.6, color = '#ffe9c2', frozen, seed = 'motes' }: Props) {
  const { geo, mat } = useMemo(() => {
    const r = rng(seed)
    const pos = new Float32Array(count * 3)
    const phase = new Float32Array(count)
    const scale = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * box[0]
      pos[i * 3 + 1] = (r() - 0.5) * box[1]
      pos[i * 3 + 2] = (r() - 0.5) * box[2]
      phase[i] = r() * Math.PI * 2
      scale[i] = 0.4 + r() * r() * 1.6
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: size },
        uMap: { value: moteTexture() },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
        uPixelRatio: { value: 1 },
        uHalfHeight: { value: box[1] / 2 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime, uSize, uPixelRatio, uHalfHeight;
        attribute float aPhase, aScale;
        varying float vFade;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.21 + aPhase) * 0.05;
          p.z += cos(uTime * 0.17 + aPhase * 1.3) * 0.05;
          p.y = mod(p.y + uTime * 0.012 * (0.5 + aScale) + uHalfHeight, uHalfHeight * 2.0) - uHalfHeight;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * aScale * uPixelRatio * (projectionMatrix[1][1] * 0.5) * 1000.0 / -mv.z;
          vFade = smoothstep(uHalfHeight, uHalfHeight * 0.6, abs(p.y)) * (0.55 + 0.45 * sin(uTime * 0.9 + aPhase * 3.0));
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; uniform vec3 uColor; uniform float uOpacity;
        varying float vFade;
        void main() {
          float a = texture2D(uMap, gl_PointCoord).a * uOpacity * vFade;
          if (a < 0.003) discard;
          gl_FragColor = vec4(uColor * a, a);
          #include <colorspace_fragment>
        }`,
    })
    return { geo, mat }
  }, [count, box, size, opacity, color, seed])

  useEffect(() => () => { geo.dispose(); (mat.uniforms.uMap!.value as THREE.Texture).dispose(); mat.dispose() }, [geo, mat])

  useFrame((state, dt) => {
    mat.uniforms.uPixelRatio!.value = state.viewport.dpr * (state.size.height / 1000)
    if (!frozen) mat.uniforms.uTime!.value += dt
  })

  return <points geometry={geo} material={mat} position={position} frustumCulled={false} />
}

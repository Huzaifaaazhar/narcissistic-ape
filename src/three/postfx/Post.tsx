'use client'
import { Bloom, EffectComposer, Noise, SMAA, ToneMapping, Vignette, DepthOfField } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'

type Props = { bloom?: number; dof?: { focusDistance: number; focalLength: number; bokehScale: number } | null }

/**
 * Restrained chain (checklist #8). The composer disables renderer tone mapping, so ToneMapping
 * (ACES filmic) runs here, after bloom and DoF (which want linear HDR), and before SMAA/grain.
 */
export function Post({ bloom = 0.55, dof = null }: Props) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {dof ? <DepthOfField focusDistance={dof.focusDistance} focalLength={dof.focalLength} bokehScale={dof.bokehScale} /> : <></>}
      <Bloom mipmapBlur luminanceThreshold={1.05} luminanceSmoothing={0.2} intensity={bloom} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.32} darkness={0.55} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.12} />
      <SMAA />
    </EffectComposer>
  )
}

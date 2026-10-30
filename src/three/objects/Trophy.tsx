'use client'
import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { plateMaps, roughnessMap, woodMaps } from '@/three/materials/textures'

/**
 * Loving-cup trophy, built procedurally (spec 4.4). Units are metres: ~0.48 m tall with plinth.
 * Profile is hand-authored (radius, height) from foot to rim and back down the inside, then
 * smoothed with a Catmull-Rom spline so every edge catches a highlight.
 */
const PROFILE: [number, number][] = [
  [0.0, 0.0], [0.082, 0.0], [0.088, 0.004], [0.088, 0.013], [0.082, 0.018], // foot, chamfered
  [0.072, 0.02], [0.07, 0.03], [0.062, 0.034], // step
  [0.044, 0.048], [0.026, 0.07], [0.017, 0.095], // foot rising into stem
  [0.014, 0.13], [0.016, 0.142], [0.026, 0.15], [0.028, 0.158], [0.026, 0.166], [0.016, 0.174], // knop
  [0.015, 0.186], [0.026, 0.198], [0.052, 0.212], [0.078, 0.232], [0.096, 0.258], // bowl underside
  [0.106, 0.29], [0.11, 0.325], [0.112, 0.352], // bowl wall
  [0.118, 0.358], [0.12, 0.364], [0.116, 0.369], [0.108, 0.366], // rolled lip
  [0.104, 0.352], [0.1, 0.31], [0.088, 0.27], [0.06, 0.245], [0.0, 0.236], // inside
]

function latheGeometry(segments: number, samples: number) {
  const curve = new THREE.SplineCurve(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)))
  const pts = curve.getSpacedPoints(samples).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y))
  // LatheGeometry computes seam-aware normals itself; recomputing would split the seam.
  return new THREE.LatheGeometry(pts, segments)
}

function handleGeometry(side: 1 | -1, tubular: number) {
  const s = side
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1 * s, 0.338, 0),
    new THREE.Vector3(0.145 * s, 0.346, 0),
    new THREE.Vector3(0.178 * s, 0.322, 0),
    new THREE.Vector3(0.176 * s, 0.282, 0),
    new THREE.Vector3(0.146 * s, 0.252, 0),
    new THREE.Vector3(0.082 * s, 0.243, 0),
  ])
  return new THREE.TubeGeometry(curve, tubular, 0.0072, 14, false)
}

type Props = {
  name?: string
  title?: string
  sub?: string
  quality?: 'high' | 'low'
}

export function Trophy({ name = 'Your name here', title = 'Student of the Year', sub = 'St. Alder’s', quality = 'high' }: Props) {
  const hi = quality === 'high'
  const geo = useMemo(
    () => ({
      cup: latheGeometry(hi ? 128 : 48, hi ? 220 : 96),
      handleL: handleGeometry(-1, hi ? 64 : 24),
      handleR: handleGeometry(1, hi ? 64 : 24),
      plinthLow: new RoundedBoxGeometry(0.25, 0.06, 0.25, 4, 0.008),
      plinthHigh: new RoundedBoxGeometry(0.2, 0.064, 0.2, 4, 0.006),
      plate: new RoundedBoxGeometry(0.168, 0.058, 0.004, 2, 0.0015),
      boss: new THREE.SphereGeometry(0.0115, 24, 16),
    }),
    [hi],
  )

  const mats = useMemo(() => {
    const goldRough = roughnessMap('gold', 0.22, 0.06, { size: 512, scratches: 160, scratchLength: 10, scratchAlpha: 0.08 })
    const gold = new THREE.MeshPhysicalMaterial({
      color: '#E3BE5E', // paler than #D4AF37: ACES pushes saturated yellows toward orange
      metalness: 1,
      roughness: 1, // actual value comes from the map (≈0.17–0.31)
      roughnessMap: goldRough,
      clearcoat: 0.3,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.2,
    })
    const wood = woodMaps()
    const walnut = new THREE.MeshPhysicalMaterial({
      map: wood.map,
      roughness: 1,
      roughnessMap: wood.rough,
      clearcoat: 0.7,
      clearcoatRoughness: 0.18,
    })
    const marble = new THREE.MeshPhysicalMaterial({
      color: '#15171f',
      roughness: 1,
      roughnessMap: roughnessMap('marble', 0.22, 0.08, { scratches: 60 }),
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    })
    return { gold, walnut, marble, textures: [goldRough, wood.map, wood.rough] }
  }, [])

  // Plate waits for fonts so the engraving uses Graduate/Montserrat, not a fallback.
  const [plate, setPlate] = useState<THREE.MeshPhysicalMaterial | null>(null)
  useEffect(() => {
    let live = true
    let made: ReturnType<typeof plateMaps> | null = null
    Promise.all([document.fonts.load('112px Graduate'), document.fonts.load('600 44px "Montserrat Variable"')])
      .catch(() => undefined)
      .then(() => {
        if (!live) return
        made = plateMaps({ title, name, sub })
        setPlate(
          new THREE.MeshPhysicalMaterial({
            color: '#F0D38C',
            map: made.map,
            metalness: 1,
            roughness: 1,
            roughnessMap: made.rough,
            normalMap: made.normal,
            normalScale: new THREE.Vector2(0.6, 0.6),
            clearcoat: 0.4,
            envMapIntensity: 1.1,
          }),
        )
      })
    return () => {
      live = false
      made?.map.dispose(); made?.normal.dispose(); made?.rough.dispose()
    }
  }, [name, title, sub])
  useEffect(() => () => plate?.dispose(), [plate])

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose())
      mats.gold.dispose(); mats.walnut.dispose(); mats.marble.dispose()
      mats.textures.forEach((t) => t.dispose())
    },
    [geo, mats],
  )

  return (
    <group>
      <mesh geometry={geo.plinthLow} material={mats.walnut} position={[0, 0.03, 0]} castShadow receiveShadow />
      <mesh geometry={geo.plinthHigh} material={mats.marble} position={[0, 0.092, 0]} castShadow receiveShadow />
      {plate && <mesh geometry={geo.plate} material={plate} position={[0, 0.092, 0.1015]} />}
      <group position={[0, 0.124, 0]}>
        <mesh geometry={geo.cup} material={mats.gold} castShadow receiveShadow />
        <mesh geometry={geo.handleL} material={mats.gold} castShadow />
        <mesh geometry={geo.handleR} material={mats.gold} castShadow />
        {/* soldered bosses where the handles meet the bowl */}
        {([[-0.1, 0.338], [0.1, 0.338], [-0.082, 0.243], [0.082, 0.243]] as const).map(([x, y]) => (
          <mesh key={`${x}${y}`} geometry={geo.boss} material={mats.gold} position={[x, y, 0]} scale={[1, 1.15, 1]} />
        ))}
      </group>
    </group>
  )
}

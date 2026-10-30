'use client'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { rng } from '@/game/rng'
import { bannerTexture, floorMaps, honourBoardTexture, lockerMaps, plasterMaps, shaftTexture, woodMaps } from '@/three/materials/textures'
import { Trophy } from '@/three/objects/Trophy'
import { Motes } from '@/three/objects/Motes'
import { corridorInput } from '@/three/input'

/**
 * Hero corridor (spec 4.5): golden-hour colonnade. Units are metres; corridor runs down -Z.
 * Left: open arcade with pillars, sun pours through and throws pillar shadows on a polished
 * red-oxide floor. Right: a bank of steel lockers. Far end: the trophy under a spotlight.
 */

export const CORRIDOR = {
  halfW: 1.7,
  height: 3.3,
  zStart: 3,
  zEnd: -20,
  bay: 2.4, // pillar spacing
  trophyZ: -17.4,
} as const


const SUN_DIR = new THREE.Vector3(1, -0.62, -0.42).normalize()
const LOCKER = { w: 0.395, h: 1.86, d: 0.42, base: 0.1 }
const LOCKER_START = 1.6
const LOCKER_END = -15.2

type Quality = 'high' | 'low'

/* ---------------------------------------------------------------- lockers */

function Lockers({ quality }: { quality: Quality }) {
  const count = Math.floor((LOCKER_START - LOCKER_END) / LOCKER.w)
  const x = CORRIDOR.halfW - LOCKER.d / 2
  const { body, handle, plate, kick, bodyMat, handleMat, plateMat, kickMat, maps } = useMemo(() => {
    const maps = lockerMaps()
    return {
      maps,
      body: new RoundedBoxGeometry(LOCKER.d, LOCKER.h, LOCKER.w - 0.008, 2, 0.012),
      handle: new RoundedBoxGeometry(0.03, 0.15, 0.028, 2, 0.008),
      plate: new RoundedBoxGeometry(0.006, 0.032, 0.075, 1, 0.002),
      kick: new RoundedBoxGeometry(LOCKER.d - 0.06, LOCKER.base, LOCKER_START - LOCKER_END, 2, 0.01),
      bodyMat: new THREE.MeshPhysicalMaterial({
        metalness: 0.45,
        roughness: 1,
        roughnessMap: maps.rough,
        normalMap: maps.normal,
        normalScale: new THREE.Vector2(1, 1),
        clearcoat: 0.35,
        clearcoatRoughness: 0.35,
      }),
      handleMat: new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 1, roughness: 0.22 }),
      plateMat: new THREE.MeshStandardMaterial({ color: '#c9a24b', metalness: 1, roughness: 0.35 }),
      kickMat: new THREE.MeshStandardMaterial({ color: '#1a1a1f', roughness: 0.6 }),
    }
  }, [])

  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const handleRef = useRef<THREE.InstancedMesh>(null)
  const plateRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const p = new THREE.Vector3()
    const s = new THREE.Vector3(1, 1, 1)
    const e = new THREE.Euler()
    const r = rng('lockers')
    // House blocks of six (red/blue rivalry), with slight per-door paint variation.
    const navy = new THREE.Color('#2a3d68')
    const maroon = new THREE.Color('#55222a')
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const z = LOCKER_START - LOCKER.w * (i + 0.5)
      // a couple of doors left slightly ajar / out of true: imperfection
      const tilt = r() < 0.06 ? (r() - 0.5) * 0.05 : (r() - 0.5) * 0.004
      e.set(0, tilt, 0)
      q.setFromEuler(e)
      p.set(x, LOCKER.base + LOCKER.h / 2, z)
      m.compose(p, q, s)
      bodyRef.current!.setMatrixAt(i, m)
      c.copy(Math.floor(i / 6) % 2 ? maroon : navy).offsetHSL(0, (r() - 0.5) * 0.04, (r() - 0.5) * 0.03)
      bodyRef.current!.setColorAt(i, c)
      p.set(x - LOCKER.d / 2 - 0.012, LOCKER.base + LOCKER.h * 0.5, z - LOCKER.w * 0.3)
      m.compose(p, q, s)
      handleRef.current!.setMatrixAt(i, m)
      p.set(x - LOCKER.d / 2 - 0.002, LOCKER.base + LOCKER.h * 0.735, z)
      m.compose(p, q, s)
      plateRef.current!.setMatrixAt(i, m)
    }
    for (const ref of [bodyRef, handleRef, plateRef]) {
      ref.current!.instanceMatrix.needsUpdate = true
      ref.current!.computeBoundingSphere()
    }
    if (bodyRef.current!.instanceColor) bodyRef.current!.instanceColor.needsUpdate = true
  }, [count, x])

  useEffect(
    () => () => {
      for (const g of [body, handle, plate, kick]) g.dispose()
      for (const mt of [bodyMat, handleMat, plateMat, kickMat]) mt.dispose()
      maps.normal.dispose()
      maps.rough.dispose()
    },
    [body, handle, plate, kick, bodyMat, handleMat, plateMat, kickMat, maps],
  )

  const shadows = quality === 'high'
  return (
    <group>
      <instancedMesh ref={bodyRef} args={[body, bodyMat, count]} castShadow={shadows} receiveShadow />
      <instancedMesh ref={handleRef} args={[handle, handleMat, count]} />
      <instancedMesh ref={plateRef} args={[plate, plateMat, count]} />
      <mesh geometry={kick} material={kickMat} position={[x + 0.02, LOCKER.base / 2, (LOCKER_START + LOCKER_END) / 2]} receiveShadow />
    </group>
  )
}

/* ---------------------------------------------------------------- architecture */

function Architecture({ quality }: { quality: Quality }) {
  const { halfW, height, zStart, zEnd, bay } = CORRIDOR
  const len = zStart - zEnd
  const midZ = (zStart + zEnd) / 2
  const bays = Math.floor(len / bay)

  const { plaster, plasterMat, trimMat, pillarGeo, beamGeo, pillarMat, dadoMat, parapetGeo, parapetMat } = useMemo(() => {
    const plaster = plasterMaps()
    plaster.map.repeat.set(6, 2)
    plaster.rough.repeat.set(6, 2)
    return {
      plaster,
      plasterMat: new THREE.MeshStandardMaterial({ map: plaster.map, roughnessMap: plaster.rough, roughness: 1 }),
      trimMat: new THREE.MeshStandardMaterial({ color: '#e6d6bb', roughness: 0.75 }),
      pillarGeo: new RoundedBoxGeometry(0.34, height, 0.46, 3, 0.03),
      beamGeo: new RoundedBoxGeometry(halfW * 2, 0.24, 0.26, 2, 0.02),
      pillarMat: new THREE.MeshStandardMaterial({ color: '#e9dcc4', roughness: 0.82 }),
      dadoMat: new THREE.MeshStandardMaterial({ color: '#6e0c16', roughness: 0.5 }),
      parapetGeo: new RoundedBoxGeometry(0.34, 0.9, zStart - zEnd, 3, 0.025),
      parapetMat: new THREE.MeshStandardMaterial({ map: plaster.map, roughnessMap: plaster.rough, roughness: 1, color: '#efe2cb' }),
    }
  }, [halfW, height, zStart, zEnd])

  const pillarRef = useRef<THREE.InstancedMesh>(null)
  const beamRef = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    for (let i = 0; i <= bays; i++) {
      const z = zStart - i * bay
      m.makeTranslation(-halfW - 0.05, height / 2, z)
      pillarRef.current!.setMatrixAt(i, m)
      m.makeTranslation(0, height - 0.12, z)
      beamRef.current!.setMatrixAt(i, m)
    }
    pillarRef.current!.instanceMatrix.needsUpdate = true
    beamRef.current!.instanceMatrix.needsUpdate = true
    pillarRef.current!.computeBoundingSphere()
    beamRef.current!.computeBoundingSphere()
  }, [bays, bay, halfW, height, zStart])

  useEffect(
    () => () => {
      plaster.map.dispose(); plaster.rough.dispose()
      for (const x of [plasterMat, trimMat, pillarMat, dadoMat, parapetMat]) x.dispose()
      pillarGeo.dispose(); beamGeo.dispose(); parapetGeo.dispose()
    },
    [plaster, plasterMat, trimMat, pillarGeo, beamGeo, pillarMat, dadoMat, parapetGeo, parapetMat],
  )

  const shadows = true // pillars/parapet/lintel: a handful of casters, cheap on both tiers
  void quality
  return (
    <group>
      {/* right wall above lockers, with a maroon dado rail */}
      <mesh position={[halfW, height / 2, midZ]} rotation-y={-Math.PI / 2} material={plasterMat} receiveShadow>
        <planeGeometry args={[len, height]} />
      </mesh>
      <mesh position={[halfW - 0.03, LOCKER.base + LOCKER.h + 0.06, (zStart + LOCKER_END) / 2]} material={dadoMat}>
        <boxGeometry args={[0.06, 0.07, zStart - LOCKER_END]} />
      </mesh>
      {/* left arcade: parapet + lintel + pillars */}
      <mesh position={[-halfW - 0.05, 0.45, midZ]} geometry={parapetGeo} material={parapetMat} castShadow={shadows} receiveShadow />
      <mesh position={[-halfW - 0.05, 0.92, midZ]} material={dadoMat} castShadow={shadows}>
        <boxGeometry args={[0.4, 0.05, len]} />
      </mesh>
      <mesh position={[-halfW - 0.05, height - 0.34, midZ]} material={trimMat} castShadow={shadows}>
        <boxGeometry args={[0.34, 0.68, len]} />
      </mesh>
      <mesh position={[-halfW + 0.13, 0.06, midZ]} material={dadoMat}>
        <boxGeometry args={[0.03, 0.12, len]} />
      </mesh>
      <instancedMesh ref={pillarRef} args={[pillarGeo, pillarMat, bays + 1]} castShadow={shadows} receiveShadow />
      {/* ceiling + beams */}
      <mesh position={[0, height, midZ]} rotation-x={Math.PI / 2} material={plasterMat}>
        <planeGeometry args={[halfW * 2 + 0.6, len]} />
      </mesh>
      <instancedMesh ref={beamRef} args={[beamGeo, trimMat, bays + 1]} />
      {/* end wall */}
      <mesh position={[0, height / 2, zEnd]} material={plasterMat} receiveShadow>
        <planeGeometry args={[halfW * 2 + 0.4, height]} />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- floor */

function Floor({ quality }: { quality: Quality }) {
  const { halfW, zStart, zEnd } = CORRIDOR
  const len = zStart - zEnd
  const maps = useMemo(() => {
    const m = floorMaps(2)
    // 2 tiles per texture → 0.6 m tiles
    m.map.repeat.set((halfW * 2) / 1.2, len / 1.2)
    m.rough.repeat.copy(m.map.repeat)
    return m
  }, [halfW, len])
  useEffect(() => () => { maps.map.dispose(); maps.rough.dispose() }, [maps])

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, (zStart + zEnd) / 2]} receiveShadow>
      <planeGeometry args={[halfW * 2 + 0.6, len]} />
      {quality === 'high' ? (
        <MeshReflectorMaterial
          map={maps.map}
          roughnessMap={maps.rough}
          roughness={1}
          metalness={0}
          resolution={512}
          blur={[220, 60]}
          mixBlur={0.9}
          mixStrength={3.6}
          mixContrast={1.05}
          mirror={0}
          depthScale={0.6}
          minDepthThreshold={0.2}
          maxDepthThreshold={1.6}
        />
      ) : (
        <meshStandardMaterial map={maps.map} roughnessMap={maps.rough} roughness={0.5} envMapIntensity={1.6} />
      )}
    </mesh>
  )
}

/* ---------------------------------------------------------------- outside, sun, shafts */

function Outside() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 128)
    g.addColorStop(0, '#ffe7c0'); g.addColorStop(0.55, '#ffc983'); g.addColorStop(1, '#f2a35c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 128)
    // soft tree line, blurred
    const r = rng('trees')
    ctx.filter = 'blur(6px)'
    ctx.fillStyle = 'rgba(70,60,30,0.55)'
    for (let i = 0; i < 40; i++) {
      const x = r() * 512, h = 18 + r() * 34, w = 20 + r() * 50
      ctx.beginPath(); ctx.ellipse(x, 128 - h * 0.4, w, h, 0, 0, Math.PI * 2); ctx.fill()
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <mesh position={[-6, 1.8, (CORRIDOR.zStart + CORRIDOR.zEnd) / 2]} rotation-y={Math.PI / 2}>
      <planeGeometry args={[40, 7]} />
      {/* >1 colour so the sky blooms past the white point, as a bright exterior does */}
      <meshBasicMaterial map={tex} color={new THREE.Color(2.2, 2.0, 1.8)} fog={false} toneMapped />
    </mesh>
  )
}

function Sun({ quality }: { quality: Quality }) {
  const light = useRef<THREE.DirectionalLight>(null)
  const scene = useThree((s) => s.scene)
  useLayoutEffect(() => {
    const l = light.current!
    const target = new THREE.Object3D()
    target.position.set(0, 0, -8)
    scene.add(target)
    l.target = target
    l.position.copy(target.position).addScaledVector(SUN_DIR, -14)
    const cam = l.shadow.camera
    cam.left = -15; cam.right = 15; cam.top = 6; cam.bottom = -6; cam.near = 1; cam.far = 30
    cam.updateProjectionMatrix()
    return () => { scene.remove(target) }
  }, [scene])
  const hi = quality === 'high'
  // Pillar shadows are the scene's signature, so both tiers keep this one shadow-casting light.
  return (
    <directionalLight
      ref={light}
      color="#ffc98c"
      intensity={hi ? 5.2 : 4.6}
      castShadow
      shadow-mapSize={hi ? [2048, 2048] : [1024, 1024]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
    />
  )
}

function Shafts() {
  const { halfW, zStart, bay } = CORRIDOR
  const { geo, mat } = useMemo(() => {
    const map = shaftTexture()
    return {
      geo: new THREE.PlaneGeometry(1.7, 4.2),
      mat: new THREE.MeshBasicMaterial({
        map,
        color: new THREE.Color('#ffcf94').multiplyScalar(0.085),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: true,
      }),
    }
  }, [])
  useEffect(() => () => { geo.dispose(); mat.map?.dispose(); mat.dispose() }, [geo, mat])

  const placements = useMemo(() => {
    // Basis: Y points back up the beam to the window; normal faces down the corridor (+Z) so
    // the quad reads from the hero camera.
    const yAxis = SUN_DIR.clone().negate()
    const fwd = new THREE.Vector3(0, 0, 1)
    const n = fwd.clone().sub(yAxis.clone().multiplyScalar(fwd.dot(yAxis))).normalize()
    const xAxis = new THREE.Vector3().crossVectors(yAxis, n)
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, n))
    const out: { pos: THREE.Vector3; q: THREE.Quaternion }[] = []
    for (let i = 0; i < 7; i++) {
      const window = new THREE.Vector3(-halfW, 1.75, zStart - bay * (i + 0.5))
      out.push({ pos: window.addScaledVector(SUN_DIR, 2.1), q })
    }
    return out
  }, [halfW, zStart, bay])

  return (
    <group>
      {placements.map((p, i) => (
        <mesh key={i} geometry={geo} material={mat} position={p.pos} quaternion={p.q} renderOrder={2} />
      ))}
    </group>
  )
}

/* ---------------------------------------------------------------- lamps + trophy end */

function Pendants({ quality }: { quality: Quality }) {
  // three lamps: each also renders in the reflection pass, so they're the cheapest draw calls to trim
  const zs = [0.6, -4.8, -10.2]
  const { shade, shadeMat, bulbMat } = useMemo(() => {
    const prof = [[0.02, 0.0], [0.05, -0.04], [0.14, -0.16], [0.2, -0.24], [0.205, -0.25], [0.19, -0.25], [0.13, -0.17], [0.045, -0.05], [0.015, -0.01]].map(
      ([r, y]) => new THREE.Vector2(r, y),
    )
    return {
      shade: new THREE.LatheGeometry(new THREE.SplineCurve(prof).getSpacedPoints(40), 40),
      shadeMat: new THREE.MeshPhysicalMaterial({ color: '#1c3a2f', roughness: 0.3, clearcoat: 0.8, side: THREE.DoubleSide }),
      bulbMat: new THREE.MeshStandardMaterial({ color: '#000', emissive: new THREE.Color('#ffd9a3'), emissiveIntensity: 9 }),
    }
  }, [])
  useEffect(() => () => { shade.dispose(); shadeMat.dispose(); bulbMat.dispose() }, [shade, shadeMat, bulbMat])
  return (
    <group>
      {zs.map((z) => (
        <group key={z} position={[0, CORRIDOR.height - 0.6, z]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.6, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh geometry={shade} material={shadeMat} castShadow={false} />
          <mesh position={[0, -0.16, 0]} material={bulbMat}>
            <sphereGeometry args={[0.055, 16, 12]} />
          </mesh>
          {quality === 'high' && <pointLight position={[0, -0.25, 0]} intensity={1.6} distance={4.5} decay={2} color="#ffd29a" />}
        </group>
      ))}
    </group>
  )
}

/** Cloth banner: swallow-tail outline, gently bowed (static, baked into the vertices). */
function bannerGeometry(w: number, h: number) {
  const g = new THREE.PlaneGeometry(w, h, 12, 24)
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i)
    const v = (h / 2 - y) / h // 0 top → 1 bottom
    // swallow-tail: pull the bottom-centre up into a V
    if (v > 0.82) {
      const cut = (1 - Math.abs(x) / (w / 2)) * (v - 0.82) * h * 0.9
      pos.setY(i, y + cut)
    }
    pos.setZ(i, Math.sin((x / w) * Math.PI) * 0.02 + Math.sin(v * Math.PI * 1.4) * 0.025 * v)
  }
  g.computeVertexNormals()
  return g
}

const HONOUR = ['2019 · R. MALIK · RED', '2020 · S. FERNANDES · BLUE', '2021 · A. QURESHI · BLUE', '2022 · N. VERMA · RED', '2023 · H. SIDDIQUI · RED', '2024 · M. D’SOUZA · BLUE', '2025 · Z. AHMED · BLUE', '2026 · ?']

function TrophyEnd({ quality }: { quality: Quality }) {
  const key = useRef<THREE.SpotLight>(null)
  const fill = useRef<THREE.SpotLight>(null)
  const ready = useFontsReady()
  const assets = useMemo(() => {
    if (!ready) return null
    const wood = woodMaps('pedestal')
    const walnut = new THREE.MeshPhysicalMaterial({ map: wood.map, roughness: 1, roughnessMap: wood.rough, clearcoat: 0.7, clearcoatRoughness: 0.2 })
    const red = bannerTexture('#a8202b', 'RED')
    const blue = bannerTexture('#1d2d5a', 'BLUE')
    const board = honourBoardTexture(HONOUR)
    return {
      wood, walnut, red, blue, board,
      plinth: new RoundedBoxGeometry(0.74, 0.12, 0.74, 3, 0.02),
      shaft: new RoundedBoxGeometry(0.56, 0.78, 0.56, 3, 0.015),
      cap: new RoundedBoxGeometry(0.68, 0.1, 0.68, 3, 0.02),
      banner: bannerGeometry(0.62, 1.25),
      rod: new THREE.CylinderGeometry(0.012, 0.012, 0.76, 8),
      boardGeo: new RoundedBoxGeometry(1.0, 1.5, 0.04, 2, 0.01),
      redMat: new THREE.MeshPhysicalMaterial({ map: red, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color('#ffb3a6'), sheenRoughness: 0.5, side: THREE.DoubleSide }),
      blueMat: new THREE.MeshPhysicalMaterial({ map: blue, roughness: 0.9, sheen: 1, sheenColor: new THREE.Color('#b8c6ff'), sheenRoughness: 0.5, side: THREE.DoubleSide }),
      boardMat: new THREE.MeshPhysicalMaterial({ map: board, roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
      brass: new THREE.MeshStandardMaterial({ color: '#c9a24b', metalness: 1, roughness: 0.3 }),
    }
  }, [ready])
  useEffect(() => () => {
    if (!assets) return
    const { wood, red, blue, board, ...rest } = assets
    wood.map.dispose(); wood.rough.dispose(); red.dispose(); blue.dispose(); board.dispose()
    for (const v of Object.values(rest)) (v as { dispose?: () => void }).dispose?.()
  }, [assets])
  useLayoutEffect(() => {
    for (const l of [key.current!, fill.current!]) {
      l.target.position.set(0, 1.25, CORRIDOR.trophyZ)
      l.target.updateMatrixWorld()
    }
  }, [])
  const z = CORRIDOR.trophyZ
  return (
    <group>
      {assets && (
        <>
          <mesh geometry={assets.plinth} material={assets.walnut} position={[0, 0.06, z]} castShadow receiveShadow />
          <mesh geometry={assets.shaft} material={assets.walnut} position={[0, 0.51, z]} castShadow receiveShadow />
          <mesh geometry={assets.cap} material={assets.walnut} position={[0, 0.95, z]} castShadow receiveShadow />
          {([[-0.78, assets.redMat], [0.78, assets.blueMat]] as const).map(([x, m]) => (
            <group key={x} position={[x, 2.72, CORRIDOR.zEnd + 0.06]}>
              <mesh geometry={assets.rod} material={assets.brass} rotation-z={Math.PI / 2} position={[0, 0.03, 0.01]} />
              <mesh geometry={assets.banner} material={m} position={[0, -0.62, 0]} castShadow={quality === 'high'} />
            </group>
          ))}
          <mesh geometry={assets.boardGeo} material={assets.boardMat} position={[CORRIDOR.halfW - 0.025, 1.85, -16.9]} rotation-y={-Math.PI / 2} />
        </>
      )}
      <group position={[0, 1.0, z]} scale={1.7}>
        {/* low-poly variant: it's 15 m away and also renders in the reflection pass */}
        <Trophy name="Your name here" sub="Season one" quality="low" />
      </group>
      <spotLight ref={key} position={[0.5, CORRIDOR.height - 0.15, z + 1.6]} angle={0.36} penumbra={0.75} intensity={30} distance={8} decay={1.5} color="#fff0d8" />
      <spotLight ref={fill} position={[-1.1, 1.5, z + 2.2]} angle={0.4} penumbra={1} intensity={6} distance={6} decay={1.5} color="#ffd9a8" />
    </group>
  )
}

/** Textures that draw text must wait for webfonts; flips true once they're ready. */
function useFontsReady(): boolean {
  const [v, set] = useState(false)
  useEffect(() => {
    let live = true
    Promise.all([document.fonts.load('50px Graduate'), document.fonts.load('700 22px "Montserrat Variable"')])
      .catch(() => undefined)
      .then(() => live && set(true))
    return () => { live = false }
  }, [])
  return v
}

/* ---------------------------------------------------------------- camera */

const camPos = new THREE.Vector3()
const camLook = new THREE.Vector3()
const lookNow = new THREE.Vector3(0, 1.4, -10)

function CameraRig({ frozen, fixedP }: { frozen: boolean; fixedP: number | null }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const aspect = useThree((s) => s.size.width / s.size.height)

  useLayoutEffect(() => {
    // Hold ~36° horizontal on wide screens; portrait gets more vertical FOV so the lockers stay in.
    const hfov = THREE.MathUtils.degToRad(aspect >= 1 ? 58 : 44)
    const vfov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(hfov / 2) / aspect))
    camera.fov = THREE.MathUtils.clamp(vfov, 34, 66)
    camera.updateProjectionMatrix()
  }, [camera, aspect])

  useFrame((_, dt) => {
    const p = fixedP ?? corridorInput.progress
    const e = p * p * (3 - 2 * p)
    const px = frozen ? 0 : corridorInput.pointerX
    const py = frozen ? 0 : corridorInput.pointerY
    camPos.set(0.28 - e * 0.22 + px * 0.12, 1.58 - e * 0.02 + py * 0.06, THREE.MathUtils.lerp(1.6, -12.9, e))
    camLook.set(px * 0.25, THREE.MathUtils.lerp(1.45, 1.62, e), THREE.MathUtils.lerp(-10, CORRIDOR.trophyZ, e))
    if (frozen) {
      camera.position.copy(camPos)
      lookNow.copy(camLook)
    } else {
      const k = 1 - Math.exp(-dt * 3.2)
      camera.position.lerp(camPos, k)
      lookNow.lerp(camLook, k)
    }
    camera.lookAt(lookNow)
  })
  return null
}

/* ---------------------------------------------------------------- scene */

export function CorridorScene({ quality, frozen = false, fixedP = null }: { quality: Quality; frozen?: boolean; fixedP?: number | null }) {
  return (
    <>
      <CameraRig frozen={frozen} fixedP={fixedP} />
      <Sun quality={quality} />
      <hemisphereLight args={['#f2e2c8', '#c2a184', 0.45]} />
      <Architecture quality={quality} />
      <Lockers quality={quality} />
      <Floor quality={quality} />
      <Outside />
      <Shafts />
      <Pendants quality={quality} />
      <TrophyEnd quality={quality} />
      <Motes
        count={quality === 'high' ? 260 : 90}
        box={[3.2, 2.8, 20]}
        position={[0, 1.5, -7]}
        size={0.012}
        opacity={0.55}
        frozen={frozen}
        seed="corridor"
      />
    </>
  )
}

'use client'
import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import * as THREE from 'three'

const dir = new THREE.Vector3()

/**
 * Keeps a subject of `width` × `height` (metres) in frame at any aspect by moving the camera
 * along its view direction toward `target`. Portrait phones need more distance than desktop.
 */
export function FitCamera({ width, height, target, margin = 1.2 }: { width: number; height: number; target: [number, number, number]; margin?: number }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const aspect = useThree((s) => s.size.width / s.size.height)
  useLayoutEffect(() => {
    const vfov = THREE.MathUtils.degToRad(camera.fov)
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect)
    const dist = Math.max((height / 2) / Math.tan(vfov / 2), (width / 2) / Math.tan(hfov / 2)) * margin
    const t = new THREE.Vector3(...target)
    dir.copy(camera.position).sub(t).normalize()
    camera.position.copy(t).addScaledVector(dir, dist)
    camera.updateProjectionMatrix()
  }, [camera, aspect, width, height, target, margin])
  return null
}

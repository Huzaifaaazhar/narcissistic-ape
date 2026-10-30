'use client'
import dynamic from 'next/dynamic'
import { useTier } from '@/three/quality'

const CorridorCanvas = dynamic(() => import('@/three/CorridorCanvas'), { ssr: false })

export default function CorridorScenePage() {
  const tier = useTier()
  if (!tier) return null
  return <CorridorCanvas tier={tier === 'poster' ? 'low' : tier} className="relative h-dvh w-full" />
}

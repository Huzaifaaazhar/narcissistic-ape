'use client'
import dynamic from 'next/dynamic'

const TrophyViewer = dynamic(() => import('@/three/TrophyViewer'), { ssr: false })

export default function TrophyScene() {
  return <TrophyViewer tier="high" name="Library Ghost" sub="Blue House · 2026" className="relative h-dvh w-full" />
}

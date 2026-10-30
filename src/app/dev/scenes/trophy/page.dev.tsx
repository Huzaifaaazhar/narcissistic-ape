'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const TrophyViewer = dynamic(() => import('@/three/TrophyViewer'), { ssr: false })

export default function TrophyScene() {
  // read params after mount: the server render has no URL to read
  const [p, setP] = useState<{ name: string; sub: string } | null>(null)
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL
    setP({ name: q.get('name') ?? 'Library Ghost', sub: q.get('sub') ?? 'Blue House · Season one' })
  }, [])
  if (!p) return null
  return <TrophyViewer tier="high" name={p.name} sub={p.sub} className="relative h-dvh w-full" />
}

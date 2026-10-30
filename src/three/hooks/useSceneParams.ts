'use client'
import { useMemo } from 'react'

/** Debug/screenshot params: ?freeze=1 stops time, ?p=0..1 pins scroll progress, ?debug=1 shows stats. */
export function useSceneParams() {
  return useMemo(() => {
    if (typeof window === 'undefined') return { freeze: false, debug: false, p: null as number | null }
    const q = new URLSearchParams(location.search)
    const p = q.get('p')
    return { freeze: q.get('freeze') === '1', debug: q.get('debug') === '1', p: p === null ? null : Math.min(1, Math.max(0, Number(p))) }
  }, [])
}

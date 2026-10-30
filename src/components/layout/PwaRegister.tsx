'use client'
import { useEffect } from 'react'
import { registerPwa } from '@/lib/pwa'

export function PwaRegister() {
  useEffect(() => registerPwa(), [])
  return null
}

'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type GraphicsPref = 'auto' | 'high' | 'low'

type Settings = {
  graphics: GraphicsPref
  sound: boolean
  music: boolean
  haptics: boolean
  setGraphics: (g: GraphicsPref) => void
  toggle: (k: 'sound' | 'music' | 'haptics') => void
}

/** Per-device preferences. Nothing personal lives here. */
export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      graphics: 'auto',
      sound: true,
      music: true,
      haptics: true,
      setGraphics: (graphics) => set({ graphics }),
      toggle: (k) => set((s) => ({ [k]: !s[k] }) as Partial<Settings>),
    }),
    { name: 'sty-settings', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)

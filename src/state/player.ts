'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { House } from '@/config/brand'
import type { ArchetypeId } from '@/config/copy'

export type Enrolment = { nickname: string; house: House; archetype: ArchetypeId; enrolledAt: number }

type PlayerState = {
  enrolment: Enrolment | null
  enrol: (e: Omit<Enrolment, 'enrolledAt'>) => void
  clear: () => void
}

/**
 * Local enrolment until the server session exists (Phase 2 mirrors it server-side).
 * Holds only the chosen handle, house and archetype: no email, phone or real name.
 */
export const usePlayer = create<PlayerState>()(
  persist(
    (set) => ({
      enrolment: null,
      enrol: (e) => set({ enrolment: { ...e, enrolledAt: Date.now() } }),
      clear: () => set({ enrolment: null }),
    }),
    { name: 'sty-player', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)

export const duration = { instant: 90, quick: 180, base: 320, slow: 600, cinematic: 1200 } as const

export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
} as const

export const spring = { stiffness: 260, damping: 22 } as const

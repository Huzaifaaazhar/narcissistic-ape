import { brand } from './brand'

/** All user-facing strings. Original copy only (no film dialogue). */
export const copy = {
  reportCard: {
    title: 'Report card',
    steps: [
      { id: 'admission', label: 'Admission', stamp: 'Approved' },
      { id: 'football', label: 'The Match', stamp: 'Played' },
      { id: 'quiz', label: 'The Quiz', stamp: 'Passed' },
      { id: 'hunt', label: 'The Hunt', stamp: 'Found' },
      { id: 'dance', label: 'The Battle', stamp: 'Danced' },
    ],
    progress: (done: number, total: number) => `${done} of ${total} done`,
  },
  nickname: {
    label: 'Your name on the trophy',
    hint: '3–16 letters, numbers, spaces or underscores.',
    placeholder: 'e.g. Library Ghost',
    errors: {
      too_short: 'A bit short. Give us at least 3 characters.',
      too_long: 'Trophy plates are small. Keep it to 16 characters.',
      bad_chars: 'Letters, numbers, spaces and underscores only.',
      reserved: 'That name belongs to the staff room. Pick another.',
      blocked: "Beta, the Dean reads these. Try a different name.",
    },
    ok: 'Looks good on a trophy.',
  },
  house: {
    legend: 'Pick your side',
    red: brand.houses.red,
    blue: brand.houses.blue,
  },
  archetypes: [
    { id: 'scholar', name: 'Scholarship Star', perk: '+5% Brains', icon: 'star' },
    { id: 'rebel', name: 'Rich Rebel', perk: '+5% Style', icon: 'key' },
    { id: 'royal', name: 'Campus Royal', perk: '+5% Style', icon: 'crest' },
    { id: 'ghost', name: 'Library Ghost', perk: '+5% Brains', icon: 'scroll' },
    { id: 'canteen', name: 'Canteen Legend', perk: '+5% Instinct', icon: 'coffee' },
    { id: 'backbencher', name: 'Backbencher', perk: '+5% Grit', icon: 'megaphone' },
  ],
  stats: { brains: 'Brains', instinct: 'Instinct', style: 'Style', grit: 'Grit' },
  timer: { label: (s: number) => `${s} seconds left` },
  board: { you: 'You', points: 'pts' },
  toasts: {
    streak: 'Streak up! Three in a row.',
    rival: 'A Red House student just scored 912.',
    saved: 'Run saved. Refresh all you like.',
    offline: "You're offline. We'll sync when you're back.",
  },
} as const

export type ArchetypeId = (typeof copy.archetypes)[number]['id']

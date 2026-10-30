import { rng } from './rng'

export type PlaceId = 'library' | 'canteen' | 'lockers' | 'field' | 'auditorium' | 'office' | 'rooftop'
export type PuzzleKind = 'unscramble' | 'memory' | 'odd'

export const PLACES: Record<PlaceId, { name: string }> = {
  library: { name: 'Library' },
  canteen: { name: 'Canteen' },
  lockers: { name: 'Locker room' },
  field: { name: 'Football field' },
  auditorium: { name: 'Auditorium' },
  office: { name: 'Principal’s office' },
  rooftop: { name: 'Rooftop' },
}

type Clue = { place: PlaceId; text: string; word: string }

/** Two original clues per place; `word` is the unscramble answer tied to that place. */
export const CLUES: Clue[] = [
  { place: 'library', text: 'Silence is golden here. So are the late fees.', word: 'BOOKWORM' },
  { place: 'library', text: 'Rows of spines, none of them belong to students.', word: 'SHELVES' },
  { place: 'canteen', text: 'Where samosas vanish faster than attendance.', word: 'SAMOSA' },
  { place: 'canteen', text: 'Chai in a cutting glass, gossip on the side.', word: 'CHAIWALA' },
  { place: 'lockers', text: 'A wall of doors, a code you forgot, and someone’s gym socks.', word: 'PADLOCK' },
  { place: 'lockers', text: 'Love letters go in through the vents.', word: 'COMBINATION' },
  { place: 'field', text: 'Chalk lines, two goals, zero mercy.', word: 'PENALTY' },
  { place: 'field', text: 'Mud on the knees means the match went well.', word: 'STRIKER' },
  { place: 'auditorium', text: 'Annual-day dreams and microphone feedback live here.', word: 'SPOTLIGHT' },
  { place: 'auditorium', text: 'Rows of folding seats facing one very nervous speaker.', word: 'REHEARSAL' },
  { place: 'office', text: 'Knock twice. Explain yourself once.', word: 'DETENTION' },
  { place: 'office', text: 'The only room with a carpet and a very loud clock.', word: 'PRINCIPAL' },
  { place: 'rooftop', text: 'Highest point on campus. Secrets get told at sunset.', word: 'SKYLINE' },
  { place: 'rooftop', text: 'Up the stairs nobody is supposed to use.', word: 'TERRACE' },
]

export const HUNT_CLUES = 5
export const HUNT_HINTS = 3
export const HINT_COST = 50
export const PUZZLE_PAR_SECONDS = 20

/** Odd-one-out: nine copies of an asymmetric icon; the one at `index` is drawn mirrored. */
export type HuntStep = Clue & { puzzle: PuzzleKind; scrambled: string[]; memory: string[]; odd: { icon: string; index: number } }

const ICON_POOL = ['trophy', 'football', 'coffee', 'pennant', 'star', 'medal', 'music', 'key', 'scroll'] as const
const ASYMMETRIC = ['key', 'pennant', 'music', 'megaphone', 'whistle', 'flame'] as const

/** Five distinct places in a seeded order, each with a puzzle (cycling the three kinds). */
export function pickHunt(seed: string): HuntStep[] {
  const r = rng(`hunt:${seed}`)
  const shuffle = <T,>(xs: readonly T[]) => {
    const a = xs.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      ;[a[i], a[j]] = [a[j]!, a[i]!]
    }
    return a
  }
  const places = shuffle(Object.keys(PLACES) as PlaceId[]).slice(0, HUNT_CLUES)
  const kinds = shuffle(['unscramble', 'memory', 'odd'] as PuzzleKind[])
  return places.map((place, i) => {
    const options = CLUES.filter((c) => c.place === place)
    const clue = options[Math.floor(r() * options.length)]!
    let scrambled = shuffle(clue.word.split(''))
    if (scrambled.join('') === clue.word) scrambled = scrambled.reverse()
    const pairs = shuffle(ICON_POOL).slice(0, 3)
    const memory = shuffle([...pairs, ...pairs])
    const icon = ASYMMETRIC[Math.floor(r() * ASYMMETRIC.length)]!
    const index = Math.floor(r() * 9)
    return { ...clue, puzzle: kinds[i % kinds.length]!, scrambled, memory, odd: { icon, index } }
  })
}

/** 300 on the first tap, 150 on the second, 50 after that. */
export function locationPoints(wrongTaps: number): number {
  return wrongTaps === 0 ? 300 : wrongTaps === 1 ? 150 : 50
}

/** 150 for solving + up to 50 for speed (linear to zero at PUZZLE_PAR_SECONDS). */
export function puzzlePoints(seconds: number): number {
  return 150 + Math.round(50 * Math.max(0, 1 - seconds / PUZZLE_PAR_SECONDS))
}

export const HUNT_MAX = HUNT_CLUES * (300 + 200)

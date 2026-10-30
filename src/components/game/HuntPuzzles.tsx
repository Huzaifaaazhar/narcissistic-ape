'use client'
import { useEffect, useState } from 'react'
import { icons, type IconName } from '@/components/icons'
import { feedback } from '@/lib/feedback'

type Solved = () => void

/** Tap letter tiles in order to spell the word. `hintCount` pre-fills that many correct letters. */
export function Unscramble({ word, letters, hintCount, onSolved }: { word: string; letters: string[]; hintCount: number; onSolved: Solved }) {
  const [picked, setPicked] = useState<number[]>([])
  const [bad, setBad] = useState(false)

  // apply hints: lock in the first `hintCount` letters of the answer
  useEffect(() => {
    if (hintCount === 0) return
    const out: number[] = []
    const used = new Set<number>()
    for (let k = 0; k < Math.min(hintCount, word.length - 1); k++) {
      const idx = letters.findIndex((l, j) => l === word[k] && !used.has(j))
      used.add(idx)
      out.push(idx)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hint is an external event
    setPicked(out)
  }, [hintCount, letters, word])

  const tap = (j: number) => {
    if (picked.includes(j)) return
    feedback('tap')
    const next = [...picked, j]
    setPicked(next)
    if (next.length === word.length) {
      if (next.map((k) => letters[k]).join('') === word) {
        feedback('correct')
        onSolved()
      } else {
        feedback('wrong')
        setBad(true)
        setTimeout(() => { setBad(false); setPicked(picked.slice(0, Math.min(hintCount, word.length - 1))) }, 450)
      }
    }
  }
  const undo = () => setPicked((p) => (p.length > hintCount ? p.slice(0, -1) : p))

  return (
    <div>
      <p className="text-[15px] text-ink">Unscramble the word that belongs here.</p>
      <div className={`mt-4 flex flex-wrap justify-center gap-1.5 ${bad ? 'answer-wrong' : ''}`} aria-live="polite" aria-label={`Your word: ${picked.map((k) => letters[k]).join('')}`}>
        {word.split('').map((_, k) => (
          <span key={k} className={`grid h-12 w-9 place-items-center border-b-[3px] font-[family-name:var(--font-slab)] text-[24px] ${bad ? 'border-maroon text-maroon' : 'border-navy text-navy'}`}>
            {picked[k] !== undefined ? letters[picked[k]!] : ''}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {letters.map((l, j) => (
          <button
            key={j}
            type="button"
            onClick={() => tap(j)}
            disabled={picked.includes(j)}
            className="grid size-12 place-items-center rounded-[2px] bg-cream-hi font-[family-name:var(--font-slab)] text-[22px] text-navy shadow-paper transition-all active:translate-y-0.5 disabled:opacity-25 disabled:shadow-none"
          >
            {l}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center">
        <button type="button" onClick={undo} className="label min-h-11 px-4 text-[11px] font-bold text-navy underline-offset-4 hover:underline">Undo letter</button>
      </div>
    </div>
  )
}

/** Three pairs, flip two at a time. `peek` briefly shows every card (hint). */
export function Memory({ cards, peek, onSolved }: { cards: string[]; peek: number; onSolved: Solved }) {
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!peek) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hint is an external event
    setShowAll(true)
    const t = setTimeout(() => setShowAll(false), 1200)
    return () => clearTimeout(t)
  }, [peek])

  const flip = (k: number) => {
    if (open.length === 2 || open.includes(k) || matched.includes(k)) return
    feedback('tap')
    const next = [...open, k]
    setOpen(next)
    if (next.length === 2) {
      const [a, b] = next as [number, number]
      if (cards[a] === cards[b]) {
        const m = [...matched, a, b]
        setMatched(m)
        setOpen([])
        feedback('correct')
        if (m.length === cards.length) setTimeout(onSolved, 350)
      } else {
        setTimeout(() => setOpen([]), 700)
      }
    }
  }

  return (
    <div>
      <p className="text-[15px] text-ink">Someone left their locker stickers everywhere. Match the pairs.</p>
      <div className="mx-auto mt-5 grid max-w-[340px] grid-cols-3 gap-3">
        {cards.map((c, k) => {
          const up = showAll || open.includes(k) || matched.includes(k)
          const Icon = icons[c as IconName]
          return (
            <button
              key={k}
              type="button"
              onClick={() => flip(k)}
              aria-label={up ? c : `Card ${k + 1}, face down`}
              className={`flip grid aspect-[3/4] place-items-center rounded-[2px] shadow-paper transition-transform duration-300 ${up ? 'bg-cream-hi' : 'bg-navy'} ${matched.includes(k) ? 'ring-3 ring-gold' : ''}`}
              style={{ transform: up ? 'rotateY(0deg)' : 'rotateY(180deg)' }}
            >
              {up ? <Icon size={40} className="text-navy" /> : <span className="font-[family-name:var(--font-varsity)] text-[26px] text-cream-hi/70" style={{ transform: 'rotateY(180deg)' }}>A</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Nine stickers, one printed backwards. `hintRow` highlights the row it's in. */
export function OddOneOut({ icon, index, hintRow, onSolved }: { icon: string; index: number; hintRow: boolean; onSolved: Solved }) {
  const [miss, setMiss] = useState<number | null>(null)
  const Icon = icons[icon as IconName]
  const tap = (k: number) => {
    if (k === index) {
      feedback('correct')
      onSolved()
    } else {
      feedback('wrong')
      setMiss(k)
      setTimeout(() => setMiss(null), 400)
    }
  }
  return (
    <div>
      <p className="text-[15px] text-ink">The print shop messed up one sticker. Find the one that’s backwards.</p>
      <div className="mx-auto mt-5 grid max-w-[320px] grid-cols-3 gap-3">
        {Array.from({ length: 9 }, (_, k) => (
          <button
            key={k}
            type="button"
            onClick={() => tap(k)}
            aria-label={`Sticker ${k + 1}`}
            className={`grid aspect-square place-items-center rounded-full bg-cream-hi shadow-paper transition-all ${miss === k ? 'answer-wrong bg-red/20' : ''} ${hintRow && Math.floor(k / 3) === Math.floor(index / 3) ? 'hint-ring' : ''}`}
          >
            <Icon size={42} className="text-navy" style={k === index ? { transform: 'scaleX(-1)' } : undefined} />
          </button>
        ))}
      </div>
    </div>
  )
}

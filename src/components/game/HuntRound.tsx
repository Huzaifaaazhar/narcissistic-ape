'use client'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { HINT_COST, HUNT_CLUES, HUNT_HINTS, HUNT_MAX, PLACES, locationPoints, pickHunt, puzzlePoints, type PlaceId } from '@/game/hunt'
import { useSeason } from '@/state/season'
import { feedback } from '@/lib/feedback'
import { RoundHud, RoundIntro, RoundResults } from './RoundShell'
import { CampusMap } from './CampusMap'
import { Memory, OddOneOut, Unscramble } from './HuntPuzzles'
import { TornCard } from '@/components/ui/TornCard'
import { Button } from '@/components/ui/Button'
import { PinIcon, ScrollIcon, StarIcon } from '@/components/icons'

type Phase = 'intro' | 'clue' | 'found' | 'puzzle' | 'done'

export function HuntRound() {
  const router = useRouter()
  const seed = useSeason((s) => s.seed)
  const record = useSeason((s) => s.record)
  const startRun = useSeason((s) => s.startRun)
  const steps = useMemo(() => pickHunt(seed ?? 'practice'), [seed])

  const [phase, setPhase] = useState<Phase>('intro')
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [wrongTaps, setWrongTaps] = useState(0)
  const [wrongPlace, setWrongPlace] = useState<PlaceId | null>(null)
  const [hintsLeft, setHintsLeft] = useState(HUNT_HINTS)
  const [hinted, setHinted] = useState<PlaceId[]>([])
  const [puzzleHints, setPuzzleHints] = useState(0)
  const [firstTry, setFirstTry] = useState(0)
  const [gain, setGain] = useState(0)
  const puzzleStart = useRef(0)
  const roundStart = useRef(0)
  const [elapsed, setElapsed] = useState(0)

  const step = steps[i]!

  const pick = (p: PlaceId) => {
    if (phase !== 'clue') return
    if (p === step.place) {
      const pts = locationPoints(wrongTaps)
      if (wrongTaps === 0) setFirstTry((n) => n + 1)
      setScore((s) => s + pts)
      setGain(pts)
      feedback('stamp')
      setPhase('found')
    } else {
      feedback('wrong')
      setWrongTaps((n) => n + 1)
      setWrongPlace(p)
      setTimeout(() => setWrongPlace(null), 450)
    }
  }

  const startPuzzle = () => {
    puzzleStart.current = performance.now()
    setPuzzleHints(0)
    setPhase('puzzle')
  }

  const solved = () => {
    const secs = (performance.now() - puzzleStart.current) / 1000
    setScore((s) => s + puzzlePoints(secs))
    if (i + 1 >= HUNT_CLUES) {
      setElapsed(Math.round((performance.now() - roundStart.current) / 1000))
      setPhase('done')
      return
    }
    setI((n) => n + 1)
    setWrongTaps(0)
    setHinted([])
    setPhase('clue')
  }

  const hint = () => {
    if (hintsLeft === 0) return
    feedback('tap')
    setHintsLeft((n) => n - 1)
    setScore((s) => Math.max(0, s - HINT_COST))
    if (phase === 'clue') {
      const others = (Object.keys(PLACES) as PlaceId[]).filter((p) => p !== step.place)
      const decoy = others[Math.floor(Math.random() * others.length)]!
      setHinted(Math.random() < 0.5 ? [step.place, decoy] : [decoy, step.place])
    } else if (phase === 'puzzle') {
      setPuzzleHints((n) => n + 1)
    }
  }

  const finish = () => {
    record('hunt', score, `${firstTry}/${HUNT_CLUES} found first try · ${HUNT_HINTS - hintsLeft} hints`)
    router.push('/season')
  }

  if (phase === 'intro') {
    return (
      <RoundIntro
        number={3}
        title="The Hunt"
        rule="Five cryptic clues hidden around campus. Tap the right place, then crack the puzzle you find there. Hints help, but cost points."
        icon={<PinIcon size={44} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:var(--color-red)]" />}
        onStart={() => {
          if (!seed) startRun()
          roundStart.current = performance.now()
          feedback('tap')
          setPhase('clue')
        }}
      />
    )
  }

  if (phase === 'done') {
    return (
      <RoundResults
        title="The Hunt · Results"
        score={score}
        max={HUNT_MAX}
        lines={[
          ['Found first try', `${firstTry} of ${HUNT_CLUES}`],
          ['Hints used', String(HUNT_HINTS - hintsLeft)],
          ['Time', `${Math.floor(elapsed / 60)}m ${String(elapsed % 60).padStart(2, '0')}s`],
        ]}
        onNext={finish}
        nextLabel="Save and back to the hub"
      />
    )
  }

  const hintLabel = hintsLeft ? `Hint (${hintsLeft} left, −${HINT_COST})` : 'No hints left'
  return (
    <div className="mx-auto flex min-h-dvh max-w-[620px] flex-col">
      <RoundHud label={`The Hunt · Clue ${i + 1} of ${HUNT_CLUES}`} score={score} />
      <main className="flex flex-1 flex-col px-4 pt-3 pb-6">
        {phase === 'clue' && (
          <>
            <TornCard seed={`clue-${i}`} paperClassName="px-5 py-4">
              <p className="label flex items-center gap-1.5 text-[10px] font-bold text-maroon"><ScrollIcon size={14} />Clue {i + 1}</p>
              <p className="mt-1 text-[19px] leading-snug font-semibold text-navy italic [font-family:var(--font-slab-italic)]" aria-live="polite">“{step.text}”</p>
            </TornCard>
            <div className="mt-4">
              <CampusMap onPick={pick} wrong={wrongPlace} hinted={hinted} />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[13px] text-ink-soft">{wrongTaps ? `${wrongTaps} wrong ${wrongTaps === 1 ? 'guess' : 'guesses'}. Worth ${locationPoints(wrongTaps)} now.` : 'First-try find: 300 pts.'}</p>
              <Button variant="ghost" size="sm" disabled={!hintsLeft || hinted.length > 0} onClick={hint}>{hintLabel}</Button>
            </div>
          </>
        )}

        {phase === 'found' && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="stamp size-[120px] -rotate-12 text-[12px]" aria-hidden="true">
              <span className="flex flex-col items-center gap-1"><StarIcon size={22} />Found</span>
            </span>
            <p className="mt-6 font-[family-name:var(--font-condensed)] text-[44px] leading-none text-navy uppercase">{PLACES[step.place].name}</p>
            <p className="mt-2 font-[family-name:var(--font-slab)] text-[22px] text-maroon">+{gain}</p>
            <p className="mt-4 max-w-[30ch] text-[16px] text-ink">There’s something waiting here. Solve it fast for bonus points.</p>
            <div className="mt-8 w-full max-w-[360px]"><Button block onClick={startPuzzle}>Open it</Button></div>
          </div>
        )}

        {phase === 'puzzle' && (
          <>
            <p className="label text-[11px] font-bold text-maroon">{PLACES[step.place].name}</p>
            <div className="mt-3 flex-1">
              {step.puzzle === 'unscramble' && <Unscramble word={step.word} letters={step.scrambled} hintCount={puzzleHints * 2} onSolved={solved} />}
              {step.puzzle === 'memory' && <Memory cards={step.memory} peek={puzzleHints} onSolved={solved} />}
              {step.puzzle === 'odd' && <OddOneOut icon={step.odd.icon} index={step.odd.index} hintRow={puzzleHints > 0} onSolved={solved} />}
            </div>
            <div className="mt-6 flex justify-center">
              <Button variant="ghost" size="sm" disabled={!hintsLeft} onClick={hint}>{hintLabel}</Button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

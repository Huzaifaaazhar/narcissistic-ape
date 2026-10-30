'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { pickQuiz, quizPoints, QUIZ_LENGTH, QUIZ_MAX, QUIZ_SECONDS } from '@/game/quiz'
import { useSeason } from '@/state/season'
import { feedback } from '@/lib/feedback'
import { RoundHud, RoundIntro, RoundResults } from './RoundShell'
import { TornCard } from '@/components/ui/TornCard'
import { TimerRing } from '@/components/ui/TimerRing'
import { CheckIcon, CloseIcon, FlameIcon, ScrollIcon, TimerIcon } from '@/components/icons'

type Phase = 'intro' | 'ask' | 'reveal' | 'done'
type Lifeline = 'fifty' | 'skip' | 'time'

const CAT_LABEL = { pop: '2010s & tech', cinema: 'Cinema', sport: 'Sport', gk: 'General knowledge', campus: 'Campus life' } as const

export function QuizRound() {
  const router = useRouter()
  const seed = useSeason((s) => s.seed)
  const record = useSeason((s) => s.record)
  const startRun = useSeason((s) => s.startRun)
  const questions = useMemo(() => pickQuiz(seed ?? 'practice'), [seed])

  const [phase, setPhase] = useState<Phase>('intro')
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [gained, setGained] = useState(0)
  const [removed, setRemoved] = useState<number[]>([])
  const [used, setUsed] = useState<Record<Lifeline, boolean>>({ fifty: false, skip: false, time: false })
  const [left, setLeft] = useState(QUIZ_SECONDS)
  const deadline = useRef(0)
  const total = useRef(QUIZ_SECONDS)
  const [totalSecs, setTotalSecs] = useState(QUIZ_SECONDS)

  const q = questions[i]!

  const startQuestion = useCallback(() => {
    total.current = QUIZ_SECONDS
    setTotalSecs(QUIZ_SECONDS)
    deadline.current = performance.now() + QUIZ_SECONDS * 1000
    setLeft(QUIZ_SECONDS)
    setChosen(null)
    setRemoved([])
    setGained(0)
    setPhase('ask')
  }, [])

  const answer = useCallback(
    (choice: number | null) => {
      if (phase !== 'ask') return
      const secs = Math.max(0, (deadline.current - performance.now()) / 1000)
      const ok = choice === q.answer
      const pts = quizPoints(ok, secs, streak, total.current)
      setChosen(choice ?? -1)
      setGained(pts)
      setScore((s) => s + pts)
      if (ok) {
        const n = streak + 1
        setStreak(n)
        setBest((b) => Math.max(b, n))
        setCorrect((c) => c + 1)
        feedback(n > 0 && n % 3 === 0 ? 'streak' : 'correct')
      } else {
        setStreak(0)
        feedback('wrong')
      }
      setPhase('reveal')
    },
    [phase, q, streak],
  )

  const next = useCallback(() => {
    if (i + 1 >= QUIZ_LENGTH) {
      setPhase('done')
      return
    }
    setI((n) => n + 1)
    startQuestion()
  }, [i, startQuestion])

  // countdown (10 Hz is plenty for a seconds display)
  useEffect(() => {
    if (phase !== 'ask') return
    let lastWhole = QUIZ_SECONDS + 1
    const id = window.setInterval(() => {
      const secs = (deadline.current - performance.now()) / 1000
      const whole = Math.max(0, Math.ceil(secs))
      setLeft(whole)
      if (whole <= 3 && whole < lastWhole && whole > 0) feedback('tick')
      lastWhole = whole
      if (secs <= 0) answer(null)
    }, 100)
    return () => clearInterval(id)
  }, [phase, answer])

  // keyboard: 1-4 / A-D to answer, Enter/Space to continue
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'ask') {
        const k = e.key.toLowerCase()
        const idx = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k)
        if (idx >= 0 && idx < q.options.length && !removed.includes(idx)) answer(idx)
      } else if (phase === 'reveal' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        next()
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [phase, q, removed, answer, next])

  const applyLifeline = (l: Lifeline) => {
    if (used[l] || phase !== 'ask') return
    feedback('tap')
    setUsed((u) => ({ ...u, [l]: true }))
    if (l === 'fifty') {
      const wrong = q.options.map((_, k) => k).filter((k) => k !== q.answer)
      setRemoved(wrong.sort(() => 0.5 - Math.random()).slice(0, Math.max(0, q.options.length - 2)))
    } else if (l === 'time') {
      deadline.current += 5000
      total.current += 5
      setTotalSecs(total.current)
    } else {
      // skip: no points, streak kept, straight to the next question
      next()
    }
  }

  const finish = () => {
    record('quiz', score, `${correct}/${QUIZ_LENGTH} correct · best streak ${best}`)
    router.push('/season')
  }

  if (phase === 'intro') {
    return (
      <RoundIntro
        number={2}
        title="The Quiz"
        rule="Ten questions, fifteen seconds each. Answer fast and keep a streak going for bonus points."
        icon={<ScrollIcon size={44} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:transparent]" />}
        onStart={() => {
          if (!seed) startRun()
          feedback('tap')
          startQuestion()
        }}
      />
    )
  }

  if (phase === 'done') {
    return (
      <RoundResults
        title="The Quiz · Results"
        score={score}
        max={QUIZ_MAX}
        lines={[
          ['Correct', `${correct} of ${QUIZ_LENGTH}`],
          ['Best streak', String(best)],
          ['Lifelines used', String(Object.values(used).filter(Boolean).length)],
        ]}
        onNext={finish}
        nextLabel="Save and back to the hub"
      />
    )
  }

  const revealed = phase === 'reveal'
  const timedOut = revealed && chosen === -1
  return (
    <div className="mx-auto flex min-h-dvh max-w-[620px] flex-col">
      <RoundHud label={`The Quiz · ${i + 1} of ${QUIZ_LENGTH}`} score={score}>
        {streak >= 2 && (
          <span className="label flex items-center gap-1 rounded-pill bg-red px-2.5 py-1 text-[11px] font-bold text-cream-hi" aria-label={`Streak ${streak}`}>
            <FlameIcon size={16} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:var(--color-red)]" />×{streak}
          </span>
        )}
      </RoundHud>
      <div className="mx-4 h-1.5 overflow-hidden rounded-pill bg-paper-shade" aria-hidden="true">
        <div className="h-full bg-navy transition-[width] duration-300" style={{ width: `${((i + (revealed ? 1 : 0)) / QUIZ_LENGTH) * 100}%` }} />
      </div>

      <main className="flex flex-1 flex-col px-4 pt-5 pb-6">
        <div className="flex items-start justify-between gap-4">
          <p className="label pt-2 text-[11px] font-bold text-maroon">{CAT_LABEL[q.cat]}{q.kind === 'tf' ? ' · True or false' : q.kind === 'year' ? ' · Guess the year' : ''}</p>
          <TimerRing seconds={left} total={totalSecs} size={60} />
        </div>
        <TornCard seed={`q-${q.id}`} className="mt-3" paperClassName="px-5 py-6">
          <h1 className="text-[22px] leading-snug font-bold text-navy sm:text-[26px]" aria-live="polite">{q.q}</h1>
        </TornCard>

        <div className={`mt-5 grid gap-3 ${q.kind === 'tf' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {q.options.map((opt, k) => {
            const isRight = k === q.answer
            const isChosen = chosen === k
            const gone = removed.includes(k)
            const state = !revealed ? 'idle' : isRight ? 'right' : isChosen ? 'wrong' : 'dim'
            return (
              <button
                key={opt}
                type="button"
                disabled={revealed || gone}
                onClick={() => answer(k)}
                className={`answer group relative flex min-h-[60px] items-center gap-3 rounded-[2px] border-2 px-4 py-3 text-left text-[17px] font-semibold transition-all duration-200 ${
                  gone ? 'border-transparent bg-paper-deep/40 text-ink-soft/40 line-through' :
                  state === 'right' ? 'border-navy bg-navy text-cream-hi' :
                  state === 'wrong' ? 'answer-wrong border-maroon bg-red text-cream-hi' :
                  state === 'dim' ? 'border-paper-shade bg-cream-hi/50 text-ink-soft' :
                  'border-navy/25 bg-cream-hi text-navy shadow-paper hover:border-navy active:translate-y-0.5 active:shadow-none'
                }`}
              >
                <span className={`label grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-bold ${state === 'right' || state === 'wrong' ? 'bg-cream-hi/20' : 'bg-paper-deep text-navy'}`}>
                  {state === 'right' ? <CheckIcon size={16} /> : state === 'wrong' ? <CloseIcon size={14} /> : 'ABCD'[k]}
                </span>
                <span className="flex-1">{opt}</span>
                {state === 'right' && isChosen && gained > 0 && <span className="pop-points font-[family-name:var(--font-slab)] text-[18px] text-gold">+{gained}</span>}
              </button>
            )
          })}
        </div>

        {revealed ? (
          <div className="mt-5" role="status">
            <p className={`text-[15px] font-bold ${chosen === q.answer ? 'text-navy' : 'text-maroon'}`}>
              {chosen === q.answer ? (streak >= 3 ? `On fire. ${streak} in a row.` : 'Correct.') : timedOut ? 'Time’s up.' : 'Not quite.'}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-ink">{q.why}</p>
            <button type="button" onClick={next} className="btn btn-block mt-5">
              <span className="btn-face">{i + 1 >= QUIZ_LENGTH ? 'See my score' : 'Next question'}</span>
            </button>
          </div>
        ) : (
          <div className="mt-auto flex justify-center gap-2 pt-6" aria-label="Lifelines">
            {([
              ['fifty', '50/50', null],
              ['time', '+5s', <TimerIcon key="t" size={16} />],
              ['skip', 'Skip', null],
            ] as const).map(([k, label, icon]) => (
              <button
                key={k}
                type="button"
                disabled={used[k] || (k === 'fifty' && q.options.length < 3)}
                onClick={() => applyLifeline(k)}
                className="label flex min-h-11 items-center gap-1.5 rounded-pill border-2 border-navy px-4 text-[12px] font-bold text-navy hover:bg-navy hover:text-cream-hi disabled:border-paper-shade disabled:text-ink-soft/50 disabled:hover:bg-transparent"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

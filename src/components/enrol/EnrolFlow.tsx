'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { brand, type House } from '@/config/brand'
import { copy, type ArchetypeId } from '@/config/copy'
import { duration } from '@/config/motion'
import { hashSeed } from '@/game/rng'
import { sanitiseNickname } from '@/lib/sanitise'
import { usePlayer, type Enrolment } from '@/state/player'
import { useTier } from '@/three/quality'
import { Button } from '@/components/ui/Button'
import { NicknameInput } from '@/components/ui/NicknameInput'
import { HouseToggle } from '@/components/ui/HouseToggle'
import { ArchetypePicker } from '@/components/ui/ArchetypePicker'
import { TornCard } from '@/components/ui/TornCard'
import { Badge } from '@/components/ui/Patch'
import { Portrait } from '@/components/characters/Portrait'
import { CheckIcon, CrestIcon, PlayIcon } from '@/components/icons'

const TrophyViewer = dynamic(() => import('@/three/TrophyViewer'), {
  ssr: false,
})

type Step = 0 | 1 | 2 | 3

const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function EnrolFlow() {
  const saved = usePlayer((s) => s.enrolment)
  const enrol = usePlayer((s) => s.enrol)
  const [hydrated, setHydrated] = useState(false)
  const [step, setStep] = useState<Step>(0)
  const [name, setName] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [house, setHouse] = useState<House | undefined>()
  const [archetype, setArchetype] = useState<ArchetypeId | undefined>()
  const [flood, setFlood] = useState<House | null>(null)
  const floodRef = useRef<HTMLDivElement>(null)
  const tap = useRef({ x: 0.5, y: 0.5 })
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Returning players land on their card; zustand's persisted state arrives after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate once from persisted store
    setHydrated(true)
    const s = usePlayer.getState().enrolment
    if (s) {
      setName(s.nickname)
      setDraft(s.nickname)
      setHouse(s.house)
      setArchetype(s.archetype)
      setStep(3)
    }
  }, [])

  // Move focus to the step heading so screen readers announce the change.
  const firstStep = useRef(true)
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const pickHouse = (h: House) => {
    setHouse(h)
    setFlood(h)
  }

  // House colour flood from the tap point, a beat on the welcome, then on to step 3.
  useEffect(() => {
    if (!flood || !floodRef.current) return
    const el = floodRef.current
    const { x, y } = tap.current
    const at = `${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`
    const anims: Animation[] = []
    const run = async () => {
      if (reduced()) {
        anims.push(
          el.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: duration.quick,
            fill: 'forwards',
          }),
        )
      } else {
        anims.push(
          el.animate([{ clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})` }], {
            duration: duration.slow,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards',
          }),
        )
        const words = el.querySelector('[data-words]') as HTMLElement
        anims.push(
          words.animate(
            [
              { opacity: 0, transform: 'translateY(16px) scale(.96)' },
              { opacity: 1, transform: 'none' },
            ],
            {
              duration: duration.slow,
              delay: 220,
              easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              fill: 'both',
            },
          ),
        )
      }
      await anims[anims.length - 1]!.finished
      await new Promise((r) => setTimeout(r, reduced() ? 500 : 900))
      setStep(2)
      const out = el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: duration.base,
        fill: 'forwards',
      })
      anims.push(out)
      await out.finished
      setFlood(null)
    }
    run().catch(() => setFlood(null))
    return () => anims.forEach((a) => a.cancel())
  }, [flood])

  const finish = () => {
    const r = sanitiseNickname(name ?? '')
    if (!r.ok || !house || !archetype) return
    enrol({ nickname: r.value, house, archetype })
    setStep(3)
  }

  const recordTap = (e: RPointerEvent) => {
    tap.current = { x: e.clientX / innerWidth, y: e.clientY / innerHeight }
  }

  if (hydrated && step === 3 && saved) return <Approved enrolment={saved} onEdit={() => setStep(0)} />

  const formStep = Math.min(step, 2) as 0 | 1 | 2
  const canNext = step === 0 ? !!name : step === 1 ? !!house : !!archetype
  return (
    <div className="mx-auto flex min-h-dvh max-w-[560px] flex-col px-4 pt-[max(20px,env(safe-area-inset-top))]" data-house={house}>
      <header className="flex items-center justify-between gap-4">
        {step === 0 ? (
          <Link href="/" className="label -ml-2 flex min-h-12 items-center px-2 text-[11px] font-bold text-navy">
            ← {copy.enrol.back}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="label -ml-2 min-h-12 px-2 text-[11px] font-bold text-navy"
          >
            ← {copy.enrol.back}
          </button>
        )}
        <p className="label text-[11px] text-ink-soft">Step {formStep + 1} of 3</p>
      </header>
      <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded-pill transition-colors duration-300 ${i <= step ? (i === 2 ? 'bg-navy' : i === 1 ? 'bg-red' : 'bg-maroon') : 'bg-paper-shade'}`}
          />
        ))}
      </div>

      <main className="flex flex-1 flex-col pt-8 pb-32">
        <p className="label text-[11px] font-bold text-maroon">{copy.enrol.steps[formStep]}</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-1 font-[family-name:var(--font-condensed)] text-[44px] leading-[0.95] text-navy uppercase outline-none sm:text-[56px]"
        >
          {copy.enrol.titles[formStep]}
        </h1>
        <div className="mt-8">
          {step === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (name) setStep(1)
              }}
            >
              <NicknameInput
                defaultValue={name ?? ''}
                onValid={(v) => {
                  setName(v)
                  setDraft(v ?? '')
                }}
              />
              <button type="submit" hidden />
              <RegisterEntry name={draft} />
            </form>
          )}
          {step === 1 && (
            <div onPointerDownCapture={recordTap}>
              <HouseToggle defaultValue={house} onChange={pickHouse} size="lg" hideLegend />
            </div>
          )}
          {step === 2 && <ArchetypePicker defaultValue={archetype} onChange={setArchetype} hideLegend />}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-paper via-paper/95 to-transparent px-4 pt-6 pb-[max(18px,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[560px]">
          {step < 2 ? (
            <Button block disabled={!canNext} onClick={() => setStep((s) => (s + 1) as Step)}>
              {copy.enrol.next}
            </Button>
          ) : (
            <Button block disabled={!canNext} onClick={finish} icon={<CheckIcon size={20} />}>
              {copy.enrol.finish}
            </Button>
          )}
        </div>
      </div>

      {flood && (
        <div
          ref={floodRef}
          className="fixed inset-0 z-50 grid place-items-center text-center text-cream-hi"
          style={{
            clipPath: 'circle(0% at 50% 50%)',
            background: `${flood === 'red' ? 'repeating-linear-gradient(135deg, rgb(255 255 255 / 0.06) 0 10px, transparent 10px 22px)' : 'radial-gradient(rgb(255 255 255 / 0.08) 1.5px, transparent 2px) 0 0 / 14px 14px'}, url('/textures/paper-grain.png') 0 0 / 192px 192px, var(--color-${flood === 'red' ? 'red' : 'navy'})`,
          }}
          role="status"
          aria-live="assertive"
        >
          <div data-words className="px-6">
            <CrestIcon size={64} className="mx-auto text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:transparent]" />
            <p className="label mt-6 text-[13px] font-bold tracking-[0.3em]">{copy.enrol.welcome}</p>
            <p className="collegiate mt-2 text-[64px] sm:text-[96px]">{brand.houses[flood].name.toUpperCase()}</p>
            <p className="mt-3 text-[17px] italic opacity-90 [font-family:var(--font-slab-italic)]">{brand.houses[flood].motto}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function studentNo(e: Enrolment) {
  return `STA-26-${String(hashSeed(e.nickname + e.enrolledAt) % 10000).padStart(4, '0')}`
}

function Approved({ enrolment, onEdit }: { enrolment: Enrolment; onEdit: () => void }) {
  const tier = useTier()
  const arch = copy.archetypes.find((a) => a.id === enrolment.archetype)!
  const h = brand.houses[enrolment.house]
  const [stamped, setStamped] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setStamped(true), reduced() ? 0 : 250)
    return () => clearTimeout(t)
  }, [])
  return (
    <main className="mx-auto grid min-h-dvh overflow-x-clip max-w-[560px] content-start gap-x-12 px-4 pt-[max(24px,env(safe-area-inset-top))] pb-10 lg:max-w-[1080px] lg:grid-cols-[1fr_1.1fr] lg:content-center lg:pt-12">
      <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
        <div className="relative mt-2 text-center lg:text-left">
          <p className="label text-[11px] font-bold text-maroon">{brand.schoolLong}</p>
          <h1 className="mt-1 font-[family-name:var(--font-condensed)] text-[48px] leading-none text-navy uppercase sm:text-[60px]">
            {copy.enrol.doneTitle}
          </h1>
        </div>

        <div className="relative mt-8">
          <span
            aria-hidden="true"
            className={`stamp absolute -top-9 -right-2 z-10 size-[84px] text-[9.5px] transition-all duration-[420ms] ease-[var(--ease-spring)] ${stamped ? 'scale-100 -rotate-12 opacity-100' : 'scale-[1.8] rotate-6 opacity-0'}`}
          >
            <span className="flex flex-col items-center gap-0.5">
              <CheckIcon size={18} />
              Approved
            </span>
          </span>
          <TornCard seed={`id-${enrolment.nickname}`} paperClassName="px-5 py-5">
            <div className="flex items-center gap-4">
              <Portrait id={enrolment.archetype} size={92} backdrop={enrolment.house === 'red' ? 'red' : 'navy'} title={arch.name} />
              <div className="min-w-0 flex-1 pr-12 text-left lg:pr-10">
                <p className="label text-[10px] text-ink-soft">
                  {copy.enrol.idLabel} {studentNo(enrolment)}
                </p>
                <p className="collegiate mt-1 truncate text-[28px] text-navy">{enrolment.nickname.toUpperCase()}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={enrolment.house === 'red' ? 'red' : 'navy'}>
                    <CrestIcon size={13} className="[--icon-accent:var(--color-gold)] [--icon-paper:transparent]" />
                    {h.name}
                  </Badge>
                  <span className="label text-[10px] text-ink-soft">{arch.name}</span>
                </div>
              </div>
            </div>
          </TornCard>
        </div>
      </div>
      <figure className="mt-6 overflow-hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 rounded-[2px] bg-[#0b0c11] shadow-lift">
        <div className="relative aspect-square w-full">
          {/* poster first (and fallback), live viewer on top when the device can take it */}
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-optimised 30 KB WebP poster; next/image adds nothing here */}
          <img src="/posters/trophy-square.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
          {tier && tier !== 'poster' && (
            <TrophyViewer tier={tier} name={enrolment.nickname} sub={`${h.name} · Season one`} className="absolute inset-0" />
          )}
        </div>
        <figcaption className="px-4 py-3 text-center text-[14px] text-cream-hi/85">{tier && tier !== 'poster' ? copy.enrol.trophyCaption : `To be engraved: ${enrolment.nickname}`}</figcaption>
      </figure>

      <div className="lg:col-start-1 lg:row-start-2 lg:self-start">
        <p className="mt-6 text-center text-[16px] text-ink lg:text-left">{copy.enrol.doneBody}</p>
        <div className="mt-6 flex flex-col items-center gap-3 lg:items-start">
          <Link href="/season" className="btn btn-block max-w-[400px]">
            <span className="btn-face">
              <span className="btn-stub">
                <PlayIcon size={20} className="[--icon-accent:currentColor]" />
              </span>
              <span>{copy.enrol.toCorridor}</span>
            </span>
          </Link>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            {copy.enrol.edit}
          </Button>
        </div>
      </div>
    </main>
  )
}

/** Live "admission register" line: the name inks in as you type (sanitised value only). */
function RegisterEntry({ name }: { name: string }) {
  return (
    <TornCard seed="register" tilted className="mt-10" paperClassName="px-5 pt-4 pb-5">
      <div className="flex items-baseline justify-between">
        <p className="label text-[10px] font-bold text-maroon">Admission register</p>
        <p className="label text-[10px] text-ink-soft">Entry no. 0427</p>
      </div>
      <div className="mt-4 space-y-4" aria-hidden="true">
        <div className="flex items-end gap-3 border-b border-dashed border-ink-soft/40 pb-1">
          <span className="label w-16 shrink-0 text-[10px] text-ink-soft">Name</span>
          <span className="collegiate min-h-[30px] truncate text-[26px] leading-none text-navy">{name.toUpperCase()}</span>
        </div>
        <div className="flex items-end gap-3 border-b border-dashed border-ink-soft/40 pb-1">
          <span className="label w-16 shrink-0 text-[10px] text-ink-soft">House</span>
          <span className="text-[14px] text-ink-soft italic [font-family:var(--font-slab-italic)]">to be decided…</span>
        </div>
        <div className="flex items-end gap-3 border-b border-dashed border-ink-soft/40 pb-1">
          <span className="label w-16 shrink-0 text-[10px] text-ink-soft">Course</span>
          <span className="text-[14px] text-ink-soft italic [font-family:var(--font-slab-italic)]">Student of the Year (pending)</span>
        </div>
      </div>
    </TornCard>
  )
}

import { brand } from '@/config/brand'
import { Varsity } from '@/components/ui/Varsity'
import { Divider } from '@/components/ui/Divider'
import { TornCard } from '@/components/ui/TornCard'
import { Patch } from '@/components/ui/Patch'
import { FootballIcon, MusicIcon, PinIcon, ScrollIcon, TrophyIcon } from '@/components/icons'

const rounds = [
  { name: 'The Match', what: 'Five penalties. One keeper with a grudge.', Icon: FootballIcon },
  { name: 'The Quiz', what: 'Ten questions. Fifteen seconds each.', Icon: ScrollIcon },
  { name: 'The Hunt', what: 'Five clues hidden across campus.', Icon: PinIcon },
  { name: 'The Battle', what: 'One dance-off. Three picky judges.', Icon: MusicIcon },
]

/** Phase 0 holding page: real copy, no placeholders. The 3D corridor lands here in Phase 1. */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[720px] flex-col items-center px-4 pt-12 pb-16 text-center">
      <p className="label text-[13px] tracking-[0.5em] text-ink">{brand.schoolLong}</p>
      <h1 className="mt-6 text-[50px] sm:text-[92px]">
        <Varsity>STUDENT OF<br />THE YEAR</Varsity>
      </h1>
      <p className="label mt-8 text-[13px] font-extrabold text-navy sm:text-[16px]">{brand.tagline}</p>
      <Divider className="mt-6" />
      <p className="mt-8 max-w-[34ch] text-[16px] leading-relaxed text-ink sm:text-[18px]">
        Pick a house. Play four rounds. The highest score takes the trophy home.
      </p>

      <Patch tone="gold" size={104} label="The trophy" className="mt-10">
        <TrophyIcon size={50} className="text-[#5a3f0c] [--icon-accent:#fff1c9] [--icon-paper:#e6c470]" />
      </Patch>
      <p className="mt-6 font-[family-name:var(--font-condensed)] text-[40px] leading-none text-navy uppercase">Enrolment opens soon</p>

      <ol className="mt-10 grid w-full max-w-[420px] gap-3 text-left">
        {rounds.map(({ name, what, Icon }, i) => (
          <li key={name}>
            <TornCard seed={`home-round-${i}`} paperClassName="flex items-center gap-4 px-6 py-4">
              <span className="font-[family-name:var(--font-slab)] text-[28px] leading-none text-maroon">{i + 1}</span>
              <Icon size={26} className="shrink-0 text-navy" />
              <span>
                <span className="label block text-[13px] font-bold text-ink">{name}</span>
                <span className="block text-[14px] text-ink-soft">{what}</span>
              </span>
            </TornCard>
          </li>
        ))}
      </ol>

      <Divider className="mt-12" />
      <p className="label mt-6 text-[12px] font-bold text-navy">Red or Blue. Pick your side.</p>
    </main>
  )
}

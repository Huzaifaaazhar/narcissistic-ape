import Link from 'next/link'
import { brand } from '@/config/brand'
import { copy } from '@/config/copy'
import { Divider } from '@/components/ui/Divider'
import { TornCard } from '@/components/ui/TornCard'
import { Patch } from '@/components/ui/Patch'
import { Hero } from '@/components/landing/Hero'
import { FootballIcon, MusicIcon, PinIcon, ScrollIcon } from '@/components/icons'

const rounds = [
  { name: 'The Match', what: 'Five penalties. One keeper with a grudge.', Icon: FootballIcon, tone: 'navy' as const },
  { name: 'The Quiz', what: 'Ten questions. Fifteen seconds each.', Icon: ScrollIcon, tone: 'red' as const },
  { name: 'The Hunt', what: 'Five clues hidden across campus.', Icon: PinIcon, tone: 'navy' as const },
  { name: 'The Battle', what: 'One dance-off. Three picky judges.', Icon: MusicIcon, tone: 'red' as const },
]

export default function Home() {
  return (
    <>
      <Hero />
      <main className="relative mx-auto flex max-w-[720px] flex-col items-center px-4 pt-16 pb-12 text-center">
        <h2 className="font-[family-name:var(--font-slab)] text-[40px] leading-[0.95] text-navy sm:text-[56px]">THE SEASON</h2>
        <p className="mt-4 max-w-[34ch] text-[17px] leading-relaxed text-ink">{copy.landing.intro}</p>
        <Divider className="mt-6" />
        <ol className="mt-10 grid w-full max-w-[440px] gap-3 text-left" aria-label={copy.landing.howTitle}>
          {rounds.map(({ name, what, Icon, tone }, i) => (
            <li key={name}>
              <TornCard seed={`home-round-${i}`} paperClassName="flex items-center gap-4 px-5 py-4">
                <Patch tone={tone} size={46}>
                  <Icon size={22} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:transparent]" />
                </Patch>
                <span className="flex-1">
                  <span className="label block text-[12px] font-bold text-ink">Round {i + 1} · {name}</span>
                  <span className="block text-[15px] text-ink-soft">{what}</span>
                </span>
              </TornCard>
            </li>
          ))}
        </ol>
        <p className="label mt-10 text-[12px] font-bold text-navy">Red or Blue. Pick your side.</p>
      </main>
      <footer className="border-t border-paper-shade/80 px-4 py-8 text-center">
        <nav aria-label="Footer" className="flex justify-center gap-6">
          <Link href="/privacy" className="label text-[11px] font-bold text-navy underline-offset-4 hover:underline">Privacy</Link>
          <Link href="/credits" className="label text-[11px] font-bold text-navy underline-offset-4 hover:underline">Credits</Link>
        </nav>
        <p className="mt-3 text-[12px] text-ink-soft">{brand.schoolLong} is fictional. Any resemblance to your actual college rivalries is entirely deserved.</p>
      </footer>
    </>
  )
}

import type { ReactNode } from 'react'
import { color } from '@/config/tokens'
import { icons, TrophyIcon, FlameIcon, MegaphoneIcon, PlayIcon, ShareIcon, DuelIcon, StarIcon, MedalIcon, CrestIcon, FootballIcon, MusicIcon, ScrollIcon } from '@/components/icons'
import { Button } from '@/components/ui/Button'
import { TornCard } from '@/components/ui/TornCard'
import { Patch, Badge } from '@/components/ui/Patch'
import { Divider } from '@/components/ui/Divider'
import { Varsity } from '@/components/ui/Varsity'
import { ReportCard } from '@/components/ui/ReportCard'
import { TimerRing } from '@/components/ui/TimerRing'
import { StatBar } from '@/components/ui/StatBar'
import { LeaderboardRow } from '@/components/ui/LeaderboardRow'
import { Toast } from '@/components/ui/Toast'
import { ScoreCounter } from '@/components/ui/ScoreCounter'
import { NicknameInput } from '@/components/ui/NicknameInput'
import { HouseToggle } from '@/components/ui/HouseToggle'
import { ArchetypePicker } from '@/components/ui/ArchetypePicker'
import { Tabs } from '@/components/ui/Tabs'
import { Tooltip } from '@/components/ui/Tooltip'
import { SheetDemo } from './SheetDemo'

export const metadata = { title: 'Gallery', robots: { index: false } }

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="border-t border-paper-shade/80 py-10">
      <h2 className="mb-6 font-[family-name:var(--font-condensed)] text-[34px] leading-none text-navy uppercase">{title}</h2>
      {children}
    </section>
  )
}

function Cap({ children }: { children: ReactNode }) {
  return <p className="label mb-2 text-[10px] text-ink-soft">{children}</p>
}

const rounds = [
  { name: 'The Match', what: 'Five penalties', pts: '750', icon: <FootballIcon size={26} /> },
  { name: 'The Quiz', what: 'Ten questions', pts: '3,000', icon: <ScrollIcon size={26} /> },
  { name: 'The Hunt', what: 'Five clues', pts: '2,500', icon: <CrestIcon size={26} /> },
  { name: 'The Battle', what: 'One dance-off', pts: '2,000', icon: <MusicIcon size={26} /> },
]

export default async function Gallery({ searchParams }: { searchParams: Promise<{ sheet?: string }> }) {
  const { sheet } = await searchParams
  return (
    <main className="mx-auto max-w-[1080px] px-4 pb-24 sm:px-8">
      {/* Poster-style masthead: the vibe check against ref-2 */}
      <header className="pt-10 pb-12 text-center">
        <p className="label text-[13px] tracking-[0.5em] text-ink">Component gallery</p>
        <h1 className="mt-5 text-[46px] sm:text-[96px]">
          <Varsity>STUDENT OF<br />THE YEAR</Varsity>
        </h1>
        <p className="label mt-7 text-[13px] font-extrabold text-navy sm:text-[17px]">Friends. Rivals. First loves. Big dreams.</p>
        <Divider className="mt-6" />
        <nav aria-label="Gallery sections" className="mt-6 flex flex-wrap justify-center gap-2">
          {['tokens', 'surfaces', 'icons', 'buttons', 'inputs', 'game', 'board', 'feedback'].map((s) => (
            <a key={s} href={`#${s}`} className="label rounded-pill border-2 border-navy px-3 py-1.5 text-[11px] font-bold text-navy hover:bg-navy hover:text-cream-hi">
              {s}
            </a>
          ))}
        </nav>
      </header>

      <Section id="tokens" title="Tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Object.entries(color).map(([k, v]) => (
            <div key={k} className="overflow-hidden rounded-[2px] bg-cream-hi shadow-paper">
              <div className="h-16" style={{ background: v }} />
              <div className="px-3 py-2">
                <p className="text-[13px] font-bold text-navy">{k}</p>
                <p className="font-mono text-[11px] text-ink-soft">{v}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <Cap>Condensed · Anton</Cap>
            <p className="font-[family-name:var(--font-condensed)] text-[56px] leading-[0.9] text-navy">DRESS CODE</p>
            <div className="h-5" />
            <Cap>Slab · Alfa Slab One</Cap>
            <p className="font-[family-name:var(--font-slab)] text-[56px] leading-[0.95] text-navy">TICKETS</p>
          </div>
          <div>
            <Cap>Collegiate · Graduate</Cap>
            <p className="text-[44px]"><span className="collegiate text-navy">CAMPUS</span> <span className="collegiate text-maroon">COOL</span></p>
            <Cap>Body · Montserrat</Cap>
            <p className="label text-[15px] font-semibold text-ink">Dress the part. Live the vibe.</p>
            <p className="mt-2 max-w-[60ch] text-ink">You missed the top corner by a whisker. Retry the round? Nobody saw. Probably.</p>
            <p className="mt-1 text-[22px] text-ink [font-family:var(--font-slab-italic)] font-semibold italic">per round</p>
          </div>
        </div>
      </Section>

      <Section id="surfaces" title="Surfaces">
        {/* ref-3 layout: slab head, torn stubs stacked */}
        <div className="grid items-start gap-10 sm:grid-cols-2">
          <div className="text-center">
            <p className="font-[family-name:var(--font-slab)] text-[64px] leading-[0.9] text-navy sm:text-[80px]">THE SEASON</p>
            <p className="label mt-3 text-[13px] font-bold text-navy">Four rounds. One trophy.</p>
            <div className="mx-auto mt-6 flex max-w-[360px] flex-col gap-3">
              {rounds.map((r, i) => (
                <TornCard key={r.name} seed={`round-${i}`} paperClassName="px-6 py-4">
                  <div className="flex items-center gap-4 text-left">
                    <span className="text-navy">{r.icon}</span>
                    <span className="flex-1">
                      <span className="label block text-[13px] text-ink">{r.name}</span>
                      <span className="block text-[13px] text-ink-soft">{r.what}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-[family-name:var(--font-slab)] text-[26px] leading-none text-maroon">{r.pts}</span>
                      <span className="text-[13px] text-ink [font-family:var(--font-slab-italic)] font-semibold italic">max pts</span>
                    </span>
                  </div>
                </TornCard>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Cap>Torn label, untilted, deep tear</Cap>
              <TornCard seed="deep" tilted={false} depth={3} paperClassName="px-6 py-8 text-center">
                <p className="collegiate text-[34px] text-navy">CAMPUS <span className="text-maroon">COOL</span></p>
                <p className="label mt-2 text-[12px] text-ink">Think 2010s. Think {`St. Alder's`}.</p>
              </TornCard>
            </div>
            <div>
              <Cap>Divider (maroon → navy)</Cap>
              <Divider />
            </div>
            <div>
              <Cap>Paper elevations</Cap>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid h-20 place-items-center rounded-[2px] bg-paper-deep text-[12px] text-ink-soft">inset</div>
                <div className="grid h-20 place-items-center rounded-[2px] bg-cream-hi text-[12px] text-ink-soft shadow-paper">paper</div>
                <div className="grid h-20 place-items-center rounded-[2px] bg-cream-hi text-[12px] text-ink-soft shadow-lift">lift</div>
              </div>
            </div>
            <div>
              <Cap>Night surface (dance + ceremony only)</Cap>
              <div className="rounded-[2px] bg-night p-6 text-center">
                <p className="font-[family-name:var(--font-condensed)] text-[40px] leading-none text-cream-hi">DANCE BATTLE</p>
                <p className="label mt-2 text-[11px] text-gold">Combo x12</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="icons" title="Icons">
        <Cap>24px · navy stroke · red accents</Cap>
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-9">
          {Object.entries(icons).map(([name, Icon]) => (
            <li key={name} className="flex flex-col items-center gap-2 rounded-[2px] bg-cream-hi/60 px-1 py-4 text-navy">
              <Icon size={24} />
              <Icon size={40} />
              <span className="font-mono text-[10px] text-ink-soft">{name}</span>
            </li>
          ))}
        </ul>
        <Cap>Stitched patches</Cap>
        <div className="mt-4 flex flex-wrap items-center gap-6 pb-2">
          <Patch tone="gold" size={88} label="Trophy"><TrophyIcon size={42} className="text-[#5a3f0c] [--icon-accent:#fff1c9] [--icon-paper:#e6c470]" /></Patch>
          <Patch tone="red" size={72} label="Streak"><FlameIcon size={34} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:var(--color-red)]" /></Patch>
          <Patch size={72} label="Golden Boot"><FootballIcon size={34} className="text-cream-hi [--icon-accent:var(--color-red)] [--icon-paper:var(--color-navy)]" /></Patch>
          <Patch tone="cream" size={72} label="Topper"><StarIcon size={34} /></Patch>
          <Patch tone="navy" size={56} label="Medal"><MedalIcon size={28} className="text-cream-hi [--icon-accent:var(--color-gold)] [--icon-paper:var(--color-navy)]" /></Patch>
          <Badge tone="gold">Legendary</Badge>
          <Badge tone="red">Red House</Badge>
          <Badge>Blue House</Badge>
          <Badge tone="outline">New</Badge>
        </div>
      </Section>

      <Section id="buttons" title="Buttons">
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
          {(['primary', 'secondary', 'ghost'] as const).map((v) => (
            <div key={v} className="flex flex-col items-start gap-4">
              <Cap>{v}</Cap>
              <Button variant={v} icon={v === 'ghost' ? undefined : <PlayIcon size={20} className="[--icon-accent:currentColor]" />}>Start round 1</Button>
              <Button variant={v} force="hover">Hover</Button>
              <Button variant={v} force="pressed">Pressed</Button>
              <Button variant={v} force="focus">Focus visible</Button>
              <Button variant={v} disabled>Disabled</Button>
              <Button variant={v} loading>Saving</Button>
              <Button variant={v} error>Try again</Button>
            </div>
          ))}
        </div>
        <div className="mt-8 max-w-[390px] space-y-3">
          <Cap>Block + small (thumb zone CTAs)</Cap>
          <Button block icon={<TrophyIcon size={22} className="[--icon-accent:var(--color-gold)] [--icon-paper:var(--color-red)]" />}>Enrol now</Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" icon={<DuelIcon size={18} className="[--icon-accent:var(--color-cream-hi)]" />}>Challenge a friend</Button>
            <Button variant="ghost" size="sm" icon={<ShareIcon size={18} className="[--icon-paper:transparent]" />}>Share</Button>
          </div>
        </div>
      </Section>

      <Section id="inputs" title="Inputs">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-6">
            <div><Cap>Empty</Cap><NicknameInput /></div>
            <div><Cap>Hover</Cap><NicknameInput force="hover" /></div>
            <div><Cap>Focus</Cap><NicknameInput force="focus" defaultValue="Zara" /></div>
          </div>
          <div className="space-y-6">
            <div><Cap>Valid</Cap><NicknameInput defaultValue="Library Ghost" /></div>
            <div><Cap>Error</Cap><NicknameInput defaultValue="<script>" /></div>
            <div><Cap>Disabled</Cap><NicknameInput defaultValue="Locked In" disabled /></div>
          </div>
        </div>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <div><Cap>House toggle · unselected</Cap><HouseToggle /></div>
          <div><Cap>House toggle · Red picked</Cap><HouseToggle defaultValue="red" name="house2" /></div>
        </div>
        <div className="mt-10"><Cap>Archetype picker</Cap><ArchetypePicker defaultValue="ghost" /></div>
      </Section>

      <Section id="game" title="Game HUD">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="space-y-8">
            <div><Cap>Report card · fresh enrolment (endowed)</Cap><ReportCard done={1} current={1} /></div>
            <div><Cap>Report card · 3 of 5</Cap><ReportCard done={3} current={3} /></div>
          </div>
          <div className="space-y-8">
            <div>
              <Cap>Timer ring</Cap>
              <div className="flex items-center gap-5">
                <TimerRing seconds={15} total={15} />
                <TimerRing seconds={9} total={15} />
                <TimerRing seconds={4} total={15} />
                <TimerRing seconds={0} total={15} size={56} />
              </div>
            </div>
            <div>
              <Cap>Score counter</Cap>
              <p className="text-[56px] leading-none text-navy"><ScoreCounter value={912} /></p>
            </div>
            <div className="space-y-2.5">
              <Cap>Stat bars</Cap>
              <StatBar label="Brains" value={82} />
              <StatBar label="Instinct" value={64} />
              <StatBar label="Style" value={91} tone="red" />
              <StatBar label="Grit" value={38} />
            </div>
          </div>
        </div>
      </Section>

      <Section id="board" title="Leaderboard">
        <div className="max-w-[560px]">
          <Tabs
            label="Leaderboard period"
            tabs={[
              {
                id: 'today', label: 'Today', content: (
                  <div className="rounded-[2px] bg-cream-hi/70 shadow-paper">
                    <LeaderboardRow rank={1} name="Library Ghost" house="blue" score={968} />
                    <LeaderboardRow rank={2} name="Zara K" house="red" score={951} delta={2} />
                    <LeaderboardRow rank={3} name="Canteen_Legend" house="red" score={940} delta={-1} />
                    <LeaderboardRow rank={4} name="Backbencher99" house="blue" score={902} />
                    <LeaderboardRow rank={27} name="Ali Raza" house="red" score={734} you delta={5} />
                  </div>
                ),
              },
              { id: 'week', label: 'This week', content: <p className="text-ink-soft">Weekly board loads here.</p> },
              { id: 'all', label: 'All-time', content: <p className="text-ink-soft">All-time board loads here.</p> },
            ]}
          />
        </div>
      </Section>

      <Section id="feedback" title="Feedback">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <Cap>Toasts</Cap>
            <Toast icon={<FlameIcon size={24} />}>Streak up! Three in a row.</Toast>
            <Toast tone="red" icon={<MegaphoneIcon size={24} className="text-cream-hi [--icon-accent:var(--color-gold)]" />}>A Red House student just scored 912.</Toast>
            <Toast tone="paper" icon={<StarIcon size={24} />}>Run saved. Refresh all you like.</Toast>
          </div>
          <div className="space-y-6">
            <div>
              <Cap>Tooltip (forced open)</Cap>
              <div className="pt-16">
                <Tooltip text="50/50 removes two wrong answers. You have 1 left." forceOpen>
                  <Button variant="ghost" size="sm">50/50</Button>
                </Tooltip>
              </div>
            </div>
            <div>
              <Cap>Sheet / modal</Cap>
              <SheetDemo initialOpen={sheet === '1'} />
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}

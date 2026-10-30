import '@fontsource/archivo-black/400.css'
import '@fontsource/ultra/400.css'
import { Varsity } from '@/components/ui/Varsity'

const row = 'border-b border-paper-shade py-6'
const cap = 'label text-xs text-ink-soft mb-2'

export default function TypeSpecimen() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <section className={row}>
        <p className={cap}>Condensed sans · Anton</p>
        <p className="text-navy text-[64px] leading-[0.9]" style={{ fontFamily: 'Anton' }}>DRESS CODE</p>
        <p className={cap + ' mt-4'}>Condensed sans · Archivo Black</p>
        <p className="text-navy text-[64px] leading-[0.9] tracking-tight" style={{ fontFamily: 'Archivo Black' }}>DRESS CODE</p>
      </section>
      <section className={row}>
        <p className={cap}>Slab · Alfa Slab One</p>
        <p className="text-navy text-[72px] leading-[0.9]" style={{ fontFamily: 'Alfa Slab One' }}>TICKETS</p>
        <p className="text-maroon text-[40px]" style={{ fontFamily: 'Alfa Slab One' }}>PKR 1,500</p>
        <p className={cap + ' mt-4'}>Slab · Ultra</p>
        <p className="text-navy text-[72px] leading-[0.9]" style={{ fontFamily: 'Ultra' }}>TICKETS</p>
        <p className="text-maroon text-[40px]" style={{ fontFamily: 'Ultra' }}>PKR 1,500</p>
      </section>
      {(['Graduate', 'Alfa Slab One', 'Ultra'] as const).map((f) => (
        <section key={f} className={row}>
          <p className={cap}>Varsity treatment · {f}</p>
          <div className="text-center text-[44px] sm:text-[88px]" style={{ fontFamily: f }}>
            <Varsity className="[font-family:inherit]">A NIGHT AT<br />ST. ALDER&apos;S</Varsity>
          </div>
          <p className="mt-4 text-center text-[40px] sm:text-[64px]" style={{ fontFamily: f }}>
            <span className="text-navy">CAMPUS</span> <span className="text-maroon">COOL</span>
          </p>
        </section>
      ))}
      <section className={row}>
        <p className={cap}>Body · Montserrat (wide-tracked label + sentence)</p>
        <p className="label text-navy text-lg font-bold">Friends. Rivals. First loves. Big dreams.</p>
        <p className="label mt-2 text-ink text-base font-normal">For one night, leave real life at the door.</p>
        <p className="mt-2 text-ink">You missed by 0.2 seconds. Retry the round?</p>
        <p className="mt-2 text-ink text-2xl" style={{ fontFamily: 'Zilla Slab', fontStyle: 'italic', fontWeight: 600 }}>per person</p>
      </section>
    </main>
  )
}

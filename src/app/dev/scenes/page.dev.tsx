import Link from 'next/link'

const scenes = [
  { href: '/dev/scenes/trophy', name: 'Trophy viewer', note: 'Hero object; studio IBL, AgX, bloom, SMAA' },
  { href: '/dev/scenes/corridor', name: 'Hero corridor', note: 'Landing; golden hour, reflector floor, shafts, motes' },
]

export default function Scenes() {
  return (
    <main className="mx-auto max-w-[720px] px-4 py-10">
      <h1 className="font-[family-name:var(--font-condensed)] text-[44px] text-navy uppercase">Scenes</h1>
      <p className="mt-2 text-ink-soft">Append <code>?debug=1</code> for fps / draw calls / triangles, <code>&amp;tier=low</code> to force the mobile path, <code>&amp;freeze=1&amp;p=0.4</code> to pin a frame.</p>
      <ul className="mt-6 divide-y divide-paper-shade">
        {scenes.map((s) => (
          <li key={s.href} className="py-4">
            <Link className="text-lg font-bold text-navy underline-offset-4 hover:underline" href={`${s.href}?debug=1`}>{s.name}</Link>
            <p className="text-sm text-ink-soft">{s.note}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}

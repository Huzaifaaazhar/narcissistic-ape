import { Portrait } from '@/components/characters/Portrait'
import { copy } from '@/config/copy'

export default function Characters() {
  return (
    <main className="mx-auto grid max-w-[1000px] grid-cols-2 gap-6 p-6 sm:grid-cols-3">
      {copy.archetypes.map((a, i) => (
        <figure key={a.id} className="flex flex-col items-center gap-2">
          <Portrait id={a.id} size={200} backdrop={i % 2 ? 'navy' : 'red'} />
          <div className="flex gap-2">
            <Portrait id={a.id} size={64} />
            <Portrait id={a.id} size={40} />
          </div>
          <figcaption className="label text-[12px] font-bold text-navy">{a.name}</figcaption>
        </figure>
      ))}
    </main>
  )
}

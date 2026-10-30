import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[560px] flex-col items-center justify-center px-4 text-center">
      <p className="stamp size-28 rotate-[-8deg] text-[13px]">Detention</p>
      <h1 className="mt-8 font-[family-name:var(--font-condensed)] text-[44px] leading-none text-navy uppercase">This page doesn&apos;t exist</h1>
      <p className="mt-4 text-ink-soft">Wrong corridor. The staff room is that way.</p>
      <Link href="/" className="label mt-8 rounded-pill border-2 border-navy px-5 py-3 text-[13px] font-bold text-navy hover:bg-navy hover:text-cream-hi">
        Back to the front gate
      </Link>
    </main>
  )
}

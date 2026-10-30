import Link from 'next/link'
import type { ReactNode } from 'react'
import { Divider } from '@/components/ui/Divider'

export function StaticPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[640px] px-4 pt-12 pb-20">
      <Link href="/" className="label text-[11px] font-bold text-navy underline-offset-4 hover:underline">← Front gate</Link>
      <h1 className="mt-6 font-[family-name:var(--font-condensed)] text-[48px] leading-none text-navy uppercase">{title}</h1>
      <Divider className="mt-5 ml-0" />
      <div className="prose-static mt-8 space-y-5 text-[16px] leading-relaxed text-ink">{children}</div>
    </main>
  )
}

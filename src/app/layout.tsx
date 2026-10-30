import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import '@fontsource-variable/montserrat'
import '@fontsource/anton/400.css'
import '@fontsource/alfa-slab-one/400.css'
import '@fontsource/graduate/400.css'
import '@fontsource/zilla-slab/600-italic.css'
import './globals.css'
import { brand } from '@/config/brand'

export const metadata: Metadata = {
  title: { default: `${brand.gameTitle} · ${brand.school}`, template: `%s · ${brand.gameTitle}` },
  description: `Enrol at ${brand.schoolLong}, pick Red or Blue, and compete for the trophy.`,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#EFE3CF',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading headers opts every route into dynamic rendering so the CSP nonce applies (docs/DECISIONS.md).
  await headers()
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  )
}

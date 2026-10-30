import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import '@fontsource/anton/400.css'
import '@fontsource/alfa-slab-one/400.css'
import '@fontsource/zilla-slab/600-italic.css'
import './fonts.css'
import './globals.css'
import { preload } from 'react-dom'
import { brand } from '@/config/brand'
import { PwaRegister } from '@/components/layout/PwaRegister'

export const metadata: Metadata = {
  title: { default: `${brand.gameTitle} · ${brand.school}`, template: `%s · ${brand.gameTitle}` },
  description: `Enrol at ${brand.schoolLong}, pick Red or Blue, and compete for the trophy.`,
  appleWebApp: { capable: true, title: brand.gameTitle, statusBarStyle: 'default' },
  icons: { apple: '/icons/apple-touch-icon.png' },
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
  preload('/fonts/montserrat-latin-wght-normal.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  preload('/fonts/graduate-latin-400-normal.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  // Paper grain sits behind the CTA and body; it's the LCP candidate on the landing page.
  preload('/textures/paper-grain.png', { as: 'image', fetchPriority: 'high' })
  return (
    <html lang="en-GB">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}

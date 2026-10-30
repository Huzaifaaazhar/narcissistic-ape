import type { MetadataRoute } from 'next'
import { brand } from '@/config/brand'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.gameTitle} · ${brand.school}`,
    short_name: brand.gameTitle,
    description: `Enrol at ${brand.schoolLong}, pick Red or Blue, and play four rounds for the trophy.`,
    start_url: '/season',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#efe3cf',
    theme_color: '#a8202b',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}

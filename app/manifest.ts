import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NeuroLearn AI',
    short_name: 'NeuroLearn',
    description: 'Personalized AI-powered learning for every mind',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f7f4',
    theme_color: '#0f766e',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}

import type { MetadataRoute } from 'next'

/**
 * Manifest PWA — la WebApp mobile (CDC §5).
 * Permet l'installation sur l'écran d'accueil sans passer par un store.
 */
const manifest = (): MetadataRoute.Manifest => ({
  name: 'Memphis Country Club',
  short_name: 'Memphis',
  description: 'Playlist des danses — Memphis Country Club',
  start_url: '/danses',
  display: 'standalone',
  background_color: '#FFFFFF',
  theme_color: '#C0392B',
  lang: 'fr-FR',
  orientation: 'portrait',
  icons: [
    {
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icons/maskable-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  categories: ['lifestyle', 'sports', 'social'],
})

export default manifest

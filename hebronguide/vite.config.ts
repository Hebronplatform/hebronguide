import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Transparent 1×1 PNG (base64) — fallback for Figma-hosted assets
const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

/** Resolves Figma-proprietary module protocols so standard Vite can build */
const figmaCompatPlugin = {
  name: 'figma-compat',
  enforce: 'pre' as const,
  resolveId(id: string) {
    if (id.startsWith('figma:')) return '\0figma-compat:' + id.slice(6)
  },
  load(id: string) {
    if (!id.startsWith('\0figma-compat:')) return
    const sub = id.slice('\0figma-compat:'.length)
    if (sub.startsWith('asset/')) {
      return `export default '${TRANSPARENT_PNG}'`
    }
    // figma:foundry-client-api and any other figma: namespace
    return `export default {};\nexport const registerComponent = () => {};\nexport const foundryClientApi = {};`
  },
}

export default defineConfig({
  base: '/seattle/',
  plugins: [
    figmaCompatPlugin,
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'HebronGuide 시애틀',
        short_name: 'HebronGuide',
        description: '재외 한인 정착 가이드 — 시애틀',
        theme_color: '#F2994A',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/seattle/',
        scope: '/seattle/',
        lang: 'ko',
        icons: [
          {
            src: '/seattle/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/seattle/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['lifestyle', 'travel', 'social'],
        shortcuts: [
          {
            name: '정착 가이드',
            short_name: '정착',
            description: '시애틀 정착 필수 정보',
            url: '/seattle/?tab=settle',
            icons: [{ src: '/seattle/icon-192.png', sizes: '192x192' }],
          },
          {
            name: '한인 교회',
            short_name: '교회',
            description: '시애틀 한인 교회 목록',
            url: '/seattle/?tab=church',
            icons: [{ src: '/seattle/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'unsplash-image-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
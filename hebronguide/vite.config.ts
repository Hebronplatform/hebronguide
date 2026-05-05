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
        name: 'HebronGuide',
        short_name: 'HebronGuide',
        description: '재외 한인 정착 가이드 — 도시를 알고, 사람을 찾다',
        theme_color: '#F2994A',
        background_color: '#1a2535',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/seattle/',
        scope: '/',
        lang: 'ko',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
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
            url: '/seattle/',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: '한인 교회',
            short_name: '교회',
            description: '시애틀 한인 교회 목록',
            url: '/seattle/',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: null,
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
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 10 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.mymemory\.translated\.net\/.*/i,
            handler: 'NetworkOnly',
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
  build: {
    // 최신 브라우저 타겟 → 더 작은 번들
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // 벤더 라이브러리 분리 → 브라우저 캐시 장기 활용
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core'
          }
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase'
          }
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
  },
})

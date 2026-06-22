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
        description: '71개+ 도시 정착 가이드 — 함께 만들어가는 이민자·이주자 커뮤니티',
        theme_color: '#0d1117',
        background_color: '#0d1117',
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
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 포털 앱 전략: 항상 최신 정보 제공
        // JS/CSS 번들은 precache ❌ → NetworkFirst로 런타임 처리
        // 아이콘·이미지만 precache (안 바뀌는 것만)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        globPatterns: ['**/*.{ico,png,svg}'], // JS·CSS·woff2 precache 제거
        navigateFallback: null,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        additionalManifestEntries: [],

        runtimeCaching: [
          // ① HTML — 항상 서버에서 (캐시 절대 사용 안 함)
          {
            urlPattern: /\/index\.html$/,
            handler: 'NetworkOnly',
          },

          // ② 메인 JS·CSS 번들 — NetworkFirst
          //    온라인: 항상 최신 번들 다운로드 (도시 추가·업데이트 즉시 반영)
          //    오프라인: 캐시 폴백 (최대 24시간)
          {
            urlPattern: /\/assets\/.*\.(js|css)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-bundle-v2',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ③ 구글 폰트 — CacheFirst (1년, 절대 안 바뀜)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 날씨 API: 네트워크 우선, 10분 캐시
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api-cache',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 10 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 번역 API: 캐시 없음 (항상 네트워크)
          {
            urlPattern: /^https:\/\/api\.mymemory\.translated\.net\/.*/i,
            handler: 'NetworkOnly',
          },
          // Unsplash 이미지: 하루 캐시
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
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
  build: {
    // 최신 브라우저 타겟 → 더 작은 번들
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
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

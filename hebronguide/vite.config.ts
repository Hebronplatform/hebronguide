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
        description: '44개+ 도시 정착 가이드 — 함께 만들어가는 이민자·이주자 커뮤니티',
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
        // JS/CSS는 빌드 시 hash가 바뀌므로 캐싱 OK
        // HTML·SW·workbox 파일은 항상 네트워크에서 최신본 확인
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        navigateFallback: null,

        // 새 SW 즉시 활성화 — 대기 없이 바로 교체
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,

        // SW 내부에서 SKIP_WAITING 메시지 처리
        // (main.tsx의 UpdateBanner와 연동)
        additionalManifestEntries: [],

        runtimeCaching: [
          // HTML 페이지: 항상 네트워크 우선 (캐시 없이) → 항상 최신 버전 로드
          {
            urlPattern: /\/index\.html$/,
            handler: 'NetworkOnly',  // NetworkFirst → NetworkOnly: 절대 캐시 안 씀
            options: {
              cacheName: 'html-cache',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 구글 폰트: 장기 캐시 (거의 바뀌지 않음)
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

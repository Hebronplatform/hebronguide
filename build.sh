#!/bin/bash
# HebronGuide 통합 빌드 스크립트
# Vercel 배포 시 자동 실행됨
# 결과물: public/ 폴더 (Vercel outputDirectory)

set -ex

echo "🏗️  HebronGuide 통합 빌드 시작..."
echo "📍 현재 경로: $(pwd)"
echo "📂 파일 목록:"
ls -la

# 1. public/ 폴더 초기화
rm -rf public
mkdir -p public

# 2. 루트 정적 파일 복사
# ⚠️ index.html은 복사 안 함 → vercel.json redirect(/ → /seattle/)가 작동하도록
echo "📁 정적 파일 복사 중..."
cp robots.txt      public/robots.txt
cp sitemap.xml     public/sitemap.xml
cp llms.txt        public/llms.txt
[ -f icon-192.png ] && cp icon-192.png public/
[ -f icon-512.png ] && cp icon-512.png public/
# iPhone PWA 아이콘 — apple-touch-icon.png 이름으로 루트에 필수
[ -f icon-192.png ] && cp icon-192.png public/apple-touch-icon.png
[ -f icon-192.png ] && cp icon-192.png public/apple-touch-icon-precomposed.png

# 3. React 앱 빌드 (모든 도시 공통 UI — base: '/')
echo "⚛️  React 앱 빌드 중 (멀티시티)..."
cd hebronguide
npx --yes pnpm@10 install --no-frozen-lockfile
npx --yes pnpm@10 build
cd ..

# 4. React 빌드를 모든 활성 도시에 복사
echo "📦 React 빌드를 모든 도시에 복사 중..."
for city in seattle dallas sf newyork nashville boston la toronto vancouver; do
  mkdir -p public/$city
  cp -r hebronguide/dist/* public/$city/
  echo "  ✅ $city/ React 빌드 완료"
done

# 5. 공유 정적파일 루트 복사 (base:'/seattle/' 이므로 별도 assets 복사 불필요)
cp hebronguide/dist/registerSW.js public/registerSW.js 2>/dev/null || true
cp hebronguide/dist/manifest.webmanifest public/manifest.webmanifest 2>/dev/null || true
echo "  ✅ 루트 정적파일 복사 완료"

echo "✅ 빌드 완료! public/ 폴더 준비됨"
echo "📂 구조:"
ls -la public/

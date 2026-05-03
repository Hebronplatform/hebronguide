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

# 2. 루트 정적 파일 복사 (허브·도시 단일 파일 PWA)
echo "📁 정적 파일 복사 중..."
cp index.html      public/index.html
cp robots.txt      public/robots.txt
cp sitemap.xml     public/sitemap.xml
cp llms.txt        public/llms.txt
[ -f icon-192.png ] && cp icon-192.png public/
[ -f icon-512.png ] && cp icon-512.png public/

# 도시별 단일 파일 PWA 복사
for city in dallas la sf newyork nashville vancouver toronto; do
  if [ -d "$city" ]; then
    mkdir -p public/$city
    cp -r $city/* public/$city/
    echo "  ✅ $city/ 복사 완료"
  fi
done

# 3. 시애틀 React 앱 빌드 (npx pnpm@10으로 버전 고정)
echo "⚛️  시애틀 React 앱 빌드 중..."
cd hebronguide
npx --yes pnpm@10 install --no-frozen-lockfile
npx --yes pnpm@10 build
cd ..

# 4. React 빌드 결과물을 public/seattle/로 복사
echo "📦 시애틀 빌드 결과물 복사 중..."
mkdir -p public/seattle
cp -r hebronguide/dist/* public/seattle/

echo "✅ 빌드 완료! public/ 폴더 준비됨"
echo "📂 구조:"
ls -la public/

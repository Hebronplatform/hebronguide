#!/bin/bash
# HebronGuide 빌드 스크립트 — Vercel 자동 실행
set -e

echo "=== HebronGuide Build Start ==="

# 1. public 초기화
rm -rf public && mkdir -p public

# 2. 루트 정적 파일
cp robots.txt   public/robots.txt
cp sitemap.xml  public/sitemap.xml
cp llms.txt     public/llms.txt
cp icon-192.png public/icon-192.png
cp icon-512.png public/icon-512.png
# iPhone 홈 화면 아이콘 (apple-touch-icon.png 이름 필수)
cp icon-192.png public/apple-touch-icon.png
cp icon-192.png public/apple-touch-icon-precomposed.png

# 3. React 빌드
echo "--- React Build ---"
cd hebronguide
# Vercel에서 pnpm 사용하는 가장 안정적인 방법
corepack enable
corepack prepare pnpm@10 --activate
pnpm install --frozen-lockfile
pnpm build
cd ..

# 4. 도시별 복사 (모두 같은 React 빌드 공유)
echo "--- Copy to cities ---"
for city in seattle dallas sf newyork nashville boston la toronto vancouver; do
  mkdir -p public/$city
  cp -r hebronguide/dist/* public/$city/
  echo "  OK: $city"
done

# 5. 루트 공유 파일
cp hebronguide/dist/registerSW.js    public/registerSW.js    2>/dev/null || true
cp hebronguide/dist/manifest.webmanifest public/manifest.webmanifest 2>/dev/null || true

echo "=== Build Complete ==="
ls public/

#!/bin/bash
# HebronGuide 빌드 스크립트 — Vercel 자동 실행
# dist/는 로컬에서 미리 빌드 후 git에 포함 → Vercel은 복사만 수행
set -e

echo "=== HebronGuide Deploy Start ==="

# 1. public 초기화
rm -rf public && mkdir -p public

# 2. 루트 정적 파일
cp robots.txt    public/robots.txt
cp sitemap.xml   public/sitemap.xml
cp llms.txt      public/llms.txt
cp icon-192.png  public/icon-192.png
cp icon-512.png  public/icon-512.png
cp icon-192.png  public/apple-touch-icon.png
cp icon-192.png  public/apple-touch-icon-precomposed.png

# 3. 도시별 배포 (미리 빌드된 dist/ 사용)
echo "--- Deploying to cities ---"
for city in seattle dallas sf newyork nashville boston la toronto vancouver; do
  mkdir -p public/$city
  cp -r hebronguide/dist/* public/$city/
  echo "  OK: $city"
done

# 4. 루트 공유 파일
cp hebronguide/dist/registerSW.js       public/registerSW.js       2>/dev/null || true
cp hebronguide/dist/manifest.webmanifest public/manifest.webmanifest 2>/dev/null || true

echo "=== Deploy Complete ==="
ls public/

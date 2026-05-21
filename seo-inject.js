#!/usr/bin/env node
/**
 * seo-inject.js — HebronGuide SEO JSON-LD 자동 삽입
 *
 * 역할: 각 도시의 public/[city]/index.html 에 Schema.org JSON-LD 구조화 데이터 삽입
 * 효과: 구글에서 "시애틀지구촌교회", "달라스 한인 교회" 등으로 검색 시 HebronGuide 노출
 *
 * 실행: build.sh 에서 자동 호출 (node seo-inject.js)
 */

const fs   = require('fs');
const path = require('path');

const DATA_FILE   = path.join(__dirname, 'seo-churches.json');
const PUBLIC_DIR  = path.join(__dirname, 'public');
const BASE_URL    = 'https://hebronguide.com';

if (!fs.existsSync(DATA_FILE)) {
  console.error('  SKIP: seo-churches.json not found');
  process.exit(0);
}

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
let injected = 0;
let skipped  = 0;

for (const [slug, city] of Object.entries(data)) {
  const htmlPath = path.join(PUBLIC_DIR, slug, 'index.html');

  if (!fs.existsSync(htmlPath)) {
    skipped++;
    continue;
  }

  let html = fs.readFileSync(htmlPath, 'utf8');

  // 교회 목록 JSON-LD가 이미 삽입됐으면 스킵 (중복 방지)
  if (html.includes('data-seo-churches="true"')) {
    injected++;
    continue;
  }

  const cityUrl = `${BASE_URL}/${slug}/`;

  // ── 1. WebPage 스키마 ──────────────────────────────────
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${city.cityKo} 한인 정착 가이드 — HebronGuide`,
    "description": `${city.cityKo} 한인 이민자·이주자를 위한 교회·정착·생활 정보 가이드`,
    "url": cityUrl,
    "inLanguage": ["ko", "en"],
    "isPartOf": {
      "@type": "WebSite",
      "name": "HebronGuide",
      "url": BASE_URL
    }
  };

  // ── 2. 교회 목록 스키마 ────────────────────────────────
  const churchListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${city.cityKo} 한인 교회 목록 — HebronGuide`,
    "description": `${city.cityEn} Korean churches for immigrants and Korean community`,
    "url": cityUrl,
    "numberOfItems": city.churches.length,
    "itemListElement": city.churches.map((c, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Church",
        "name": c.name,
        "alternateName": c.nameEn,
        "url": cityUrl,
        "areaServed": {
          "@type": "City",
          "name": city.cityEn,
          "containedInPlace": {
            "@type": "AdministrativeArea",
            "name": city.region
          }
        }
      }
    }))
  };

  const jsonLdBlock = [
    `<script type="application/ld+json" data-seo-churches="true">\n${JSON.stringify(webPageSchema, null, 2)}\n</script>`,
    `<script type="application/ld+json">\n${JSON.stringify(churchListSchema, null, 2)}\n</script>`
  ].join('\n');

  // </head> 직전에 삽입
  html = html.replace('</head>', `${jsonLdBlock}\n</head>`);
  fs.writeFileSync(htmlPath, html, 'utf8');
  injected++;
}

console.log(`  OK: SEO JSON-LD 삽입 완료 — ${injected}개 도시 / ${skipped}개 스킵`);

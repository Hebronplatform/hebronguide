#!/usr/bin/env node
/**
 * city-content-inject.js — 도시별 FAQ·meta keywords·JSON-LD(areaServed·LocalBusiness) 치환
 *
 * 역할: build.sh의 for 루프가 모든 도시 폴더에 복사한 index.html은 시애틀 전용
 *       FAQ/keywords/areaServed를 그대로 갖고 있다(바이트 단위 동일).
 *       이 스크립트는 hebronguide/city-content.json에 데이터가 있는 도시만
 *       해당 블록을 도시별 콘텐츠로 치환한다. 데이터 없는 도시는 그대로 둔다.
 *
 * 제외: public/seattle/index.html은 영구 제외(원본이라 시애틀 콘텐츠가 맞음).
 *       city-content.json에 "seattle" 키를 넣어도 무시한다.
 *
 * 실행: build.sh 에서 seo-inject.js 호출 뒤에 자동 실행.
 *
 * 안전장치:
 *   - 데이터 없는 도시는 손대지 않음 (파일럿 안전)
 *   - 각 JSON-LD 블록은 @type로 식별, 블록 단위 교체 (부분 치환 X)
 *   - 파싱 실패 시 해당 블록 유지 (해당 도시 skip 아님, 그 블록만 skip)
 *   - 치환 결과 수를 로그로 출력
 */

const fs   = require('fs');
const path = require('path');

const DATA_FILE  = path.join(__dirname, 'hebronguide', 'city-content.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const BASE_URL   = 'https://hebronguide.com';

if (!fs.existsSync(DATA_FILE)) {
  console.error('  SKIP: hebronguide/city-content.json not found');
  process.exit(0);
}

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// 각 JSON-LD <script> 블록을 매칭 (type="application/ld+json")
const JSONLD_RE = /<script\s+type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/g;

// JSON-LD 블록을 @type로 찾아 통째로 교체.
// Returns {html, replaced:boolean}
function replaceJsonLdByType(html, typeValue, newObj) {
  let replaced = false;
  const next = html.replace(JSONLD_RE, (match, body) => {
    if (replaced) return match; // 같은 @type이 여러 번 있으면 첫 블록만 치환
    try {
      const obj = JSON.parse(body);
      if (obj['@type'] === typeValue) {
        replaced = true;
        return `<script type="application/ld+json">\n${JSON.stringify(newObj, null, 2)}\n</script>`;
      }
    } catch {
      // 파싱 실패 블록은 그대로 둠
    }
    return match;
  });
  return { html: next, replaced };
}

function buildBlocks(slug, c) {
  const cityUrl = `${BASE_URL}/${slug}/`;
  const nameEn = c.nameEn;
  const nameKo = c.nameKo;
  const areaCountry = c.country || 'US';

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HebronGuide',
    alternateName: ['헤브론가이드', `${nameKo} 한인 가이드`],
    url: cityUrl,
    logo: `${BASE_URL}/${slug}/icon-512.png`,
    description: '재외 한인 700만을 위한 도시별 정착·생활·커뮤니티 가이드. Hebron Platform 사역의 디지털 도구.',
    sameAs: [],
    areaServed: (c.areaServed || [nameEn]).map(cityName => ({
      '@type': 'City',
      name: cityName,
      addressRegion: c.regionEn || '',
      addressCountry: areaCountry,
    })),
    knowsLanguage: ['ko', 'en', 'es'],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `HebronGuide ${nameKo}`,
    url: cityUrl,
    inLanguage: ['ko', 'en', 'es'],
    publisher: {
      '@type': 'Organization',
      name: 'HebronGuide',
      logo: `${BASE_URL}/${slug}/icon-512.png`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${cityUrl}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'HebronGuide', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: nameKo, item: cityUrl },
    ],
  };

  const cityObj = {
    '@context': 'https://schema.org',
    '@type': 'City',
    name: nameEn,
    alternateName: nameKo,
    containedInPlace: {
      '@type': areaCountry === 'US' ? 'State' : 'AdministrativeArea',
      name: c.regionEn || '',
      addressCountry: areaCountry,
    },
    url: cityUrl,
    description: c.cityDescKo || `${nameKo} 한인 이민자·이주자를 위한 정착 생활 가이드 — HebronGuide`,
  };

  const touristCenter = {
    '@context': 'https://schema.org',
    '@type': 'TouristInformationCenter',
    name: c.touristCenterName || `HebronGuide ${nameEn} — ${nameKo} 한인 정착 가이드`,
    url: cityUrl,
    description: c.touristCenterDesc || `${nameKo} 한인 이민자·유학생·이주자를 위한 완전 정착 가이드.`,
    availableLanguage: [
      { '@type': 'Language', name: 'Korean' },
      { '@type': 'Language', name: 'English' },
    ],
    areaServed: (c.areaServed || [nameEn]).map(cityName => ({ '@type': 'City', name: cityName })),
    logo: `${BASE_URL}/icon-512.png`,
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (c.faqs || []).map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: c.localBusinessName || `HebronGuide ${nameEn} Korean Community`,
    description: c.localBusinessDesc || `${nameKo} 한인 커뮤니티 정보 허브 — 교회·마트·식당·기관`,
    url: cityUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: nameEn,
      addressRegion: c.regionEn || '',
      addressCountry: areaCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: c.lat,
      longitude: c.lng,
    },
    areaServed: `${nameEn} Metropolitan Area`,
    availableLanguage: ['Korean', 'English'],
  };

  return { organization, website, breadcrumb, cityObj, touristCenter, faqPage, localBusiness };
}

let processed = 0;
let skippedMissing = 0;
let totalReplacements = 0;

for (const [slug, c] of Object.entries(data)) {
  if (slug.startsWith('_')) continue; // _doc, _schema 등 메타 키 skip
  if (slug === 'seattle') continue;    // 원본 영구 제외

  const htmlPath = path.join(PUBLIC_DIR, slug, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    skippedMissing++;
    console.log(`  SKIP: public/${slug}/index.html 없음 (아직 배포 안 된 도시일 수 있음)`);
    continue;
  }

  let html = fs.readFileSync(htmlPath, 'utf8');
  let replacementsThisCity = 0;

  // 1. meta keywords
  if (c.keywords) {
    const before = html;
    html = html.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?\s*>/,
      `<meta name="keywords" content="${c.keywords.replace(/"/g, '&quot;')}" />`
    );
    if (html !== before) replacementsThisCity++;
  }

  // 2-8. JSON-LD 블록들
  const blocks = buildBlocks(slug, c);
  const typeMap = [
    ['Organization',               blocks.organization],
    ['WebSite',                    blocks.website],
    ['BreadcrumbList',             blocks.breadcrumb],
    ['City',                       blocks.cityObj],
    ['TouristInformationCenter',   blocks.touristCenter],
    ['FAQPage',                    blocks.faqPage],
    ['LocalBusiness',              blocks.localBusiness],
  ];

  for (const [typeValue, newObj] of typeMap) {
    const { html: next, replaced } = replaceJsonLdByType(html, typeValue, newObj);
    if (replaced) {
      html = next;
      replacementsThisCity++;
    }
  }

  fs.writeFileSync(htmlPath, html, 'utf8');
  processed++;
  totalReplacements += replacementsThisCity;
  console.log(`  OK: ${slug} → ${replacementsThisCity}개 블록 치환 (keywords + JSON-LD) · 재검증: ${c.verifiedAt || '미기재'}`);
}

console.log(`  SUMMARY: ${processed}개 도시 치환 완료, 총 ${totalReplacements}개 블록. (${skippedMissing}개 도시 폴더 없음)`);

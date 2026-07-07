#!/usr/bin/env node
/**
 * HebronGuide 도시 수 자동 업데이트 스크립트
 *
 * 새 도시를 HEBRON_CITIES 배열에 추가한 후 실행:
 *   node scripts/update-city-count.js
 *
 * 업데이트되는 곳:
 *   1. /js/hg-config.js          ← 모든 HTML 페이지가 여기서 읽음 (핵심)
 *   2. index.html meta 태그       ← JS로 못 바꾸는 SEO 태그만 직접 수정
 *   3. HebronGuide.tsx 정적 문자열 ← 동적 LIVE_CITY_COUNT 외 나머지
 *   4. api/city-planner.js        ← AI 시스템 프롬프트
 *   5. ad-request.html            ← 파트너 통합 신청 페이지 meta·하드코딩 숫자
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// ── 1. 실제 도시 수 계산 ───────────────────────────────────
const tsx = fs.readFileSync(
  path.join(ROOT, 'hebronguide/src/app/components/HebronGuide.tsx'), 'utf8'
);
const COUNT = [...tsx.matchAll(/status:\s*["']live["']/g)].length;
console.log(`✅ HEBRON_CITIES live 도시 수: ${COUNT}개`);

// ── 2. hg-config.js 업데이트 (핵심 — 나머지 HTML은 자동 반영) ──
const configPath = path.join(ROOT, 'hebronguide/public/js/hg-config.js');
let cfg = fs.readFileSync(configPath, 'utf8');
cfg = cfg.replace(/CITY_COUNT\s*=\s*\d+/, `CITY_COUNT = ${COUNT}`);
fs.writeFileSync(configPath, cfg, 'utf8');
console.log(`  ✅ hg-config.js → ${COUNT}`);

// ── 3. index.html meta 태그 (JS 접근 불가 SEO 태그) ─────────
const idxPath = path.join(ROOT, 'index.html');
let idx = fs.readFileSync(idxPath, 'utf8');
const idxBefore = idx;
idx = idx
  .replace(/전 세계 \d+개\+ 도시\./g, `전 세계 ${COUNT}개+ 도시.`)
  .replace(/content="전 세계 \d+개\+ 도시/g, `content="전 세계 ${COUNT}개+ 도시`);
if (idx !== idxBefore) {
  fs.writeFileSync(idxPath, idx, 'utf8');
  console.log(`  ✅ index.html meta 태그 → ${COUNT}`);
}

// ── 4. HebronGuide.tsx 정적 문자열 ──────────────────────────
const tsxPath = path.join(ROOT, 'hebronguide/src/app/components/HebronGuide.tsx');
let tsxContent = fs.readFileSync(tsxPath, 'utf8');
const tsxBefore = tsxContent;
// 주석의 도시 수와 정적 문자열만 교체 (LIVE_CITY_COUNT는 건드리지 않음)
tsxContent = tsxContent
  .replace(/\/\/ 현재 \d+개 도시/g, `// 현재 ${COUNT}개 도시`)
  .replace(/"✦ \d+개 도시의 이야기"/g, `"✦ ${COUNT}개 도시의 이야기"`)
  .replace(/"✦ \d+ Cities"/g, `"✦ ${COUNT} Cities"`)
  .replace(/\d+개 도시 한인을 만납니다/g, `${COUNT}개 도시 한인을 만납니다`)
  .replace(/Meet Koreans across \d+ cities/g, `Meet Koreans across ${COUNT} cities`);
if (tsxContent !== tsxBefore) {
  fs.writeFileSync(tsxPath, tsxContent, 'utf8');
  console.log(`  ✅ HebronGuide.tsx 정적 문자열 → ${COUNT}`);
}

// ── 5. api/city-planner.js ───────────────────────────────────
const cpPath = path.join(ROOT, 'api/city-planner.js');
let cp = fs.readFileSync(cpPath, 'utf8');
const cpBefore = cp;
cp = cp
  .replace(/currently serves \d+ cities worldwide/g, `currently serves ${COUNT} cities worldwide`)
  .replace(/2025: \d+ cities →/g, `2025: ${COUNT} cities →`);
if (cp !== cpBefore) {
  fs.writeFileSync(cpPath, cp, 'utf8');
  console.log(`  ✅ city-planner.js → ${COUNT}`);
}

// ── 6. ad-request.html (파트너 통합 신청 — meta + 하드코딩 도시 수) ──
const adPath = path.join(ROOT, 'hebronguide/public/ad-request.html');
let ad = fs.readFileSync(adPath, 'utf8');
const adBefore = ad;
ad = ad
  .replace(/등재하고 \d+개\+ 도시/g, `등재하고 ${COUNT}개+ 도시`)
  .replace(/파트너 신청 — \d+개\+ 도시/g, `파트너 신청 — ${COUNT}개+ 도시`)
  .replace(/hg-city-count">\d+</g, `hg-city-count">${COUNT}<`);
if (ad !== adBefore) {
  fs.writeFileSync(adPath, ad, 'utf8');
  console.log(`  ✅ ad-request.html → ${COUNT}`);
}

console.log(`\n완료: 도시 수 ${COUNT}개로 통일됨`);
console.log('다음: git add -A && git commit -m "chore: city count → ' + COUNT + '" && git push');

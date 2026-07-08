#!/usr/bin/env node
/**
 * HebronGuide 도시 수 자동 업데이트 스크립트 (전 페이지 통일)
 *
 * 새 도시를 HEBRON_CITIES 배열에 추가한 후 실행 (또는 build.sh 가 배포마다 자동 실행):
 *   node scripts/update-city-count.js
 *
 * 실제 도시 수 = HebronGuide.tsx 의 status:"live" 개수 (SSOT).
 * 그 값으로 아래 전부를 한 번에 통일한다:
 *   1. /js/hg-config.js               ← 모든 HTML 페이지 런타임이 여기서 읽음 (.hg-city-count)
 *   2. index.html                     ← 루트 랜딩 (meta + 본문)
 *   3. hebronguide/public/*.html      ← 전체 정적 페이지 (ad-request·story-submit·church-* 등)
 *   4. HebronGuide.tsx 정적 문자열     ← 동적 LIVE_CITY_COUNT 상수는 미접촉
 *   5. api/city-planner.js            ← AI 시스템 프롬프트
 *
 * 안전 원칙: "총계" 문구만 교체한다. 지역 카운트(예: "미국 31개 도시")는
 * 숫자(31·6·4…)도 문맥도 총계 패턴과 겹치지 않으므로 건드리지 않는다.
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// ── 1. 실제 도시 수 계산 (SSOT) ───────────────────────────────
const tsxPath = path.join(ROOT, 'hebronguide/src/app/components/HebronGuide.tsx');
const tsxSrc = fs.readFileSync(tsxPath, 'utf8');
const COUNT = [...tsxSrc.matchAll(/status:\s*["']live["']/g)].length;
console.log(`✅ HEBRON_CITIES live 도시 수: ${COUNT}개`);

// ── 2. 총계 도시 수 문구 통일 함수 ────────────────────────────
// 오직 "전체 도시 총계"를 가리키는 문구만 매칭한다.
function syncCount(t) {
  return t
    // ── 한국어 총계 ──
    .replace(/전 세계 \d+개\+ 도시/g, `전 세계 ${COUNT}개+ 도시`)
    .replace(/전 세계 \d+개 도시/g, `전 세계 ${COUNT}개 도시`)
    .replace(/\d+개\+ 도시/g, `${COUNT}개+ 도시`)        // '개+' = 총계 (지역 카운트는 '개'만)
    .replace(/현재 \d+개 도시/g, `현재 ${COUNT}개 도시`)
    .replace(/HebronGuide는 \d+개 도시/g, `HebronGuide는 ${COUNT}개 도시`)
    .replace(/\d+개 도시의 이야기/g, `${COUNT}개 도시의 이야기`)
    .replace(/\d+개 도시 한인/g, `${COUNT}개 도시 한인`)   // "N개 도시 한인 커뮤니티/한인을 만납니다"
    // 접두어 없는 맨 "N개 도시" 총계 — 단, 지역 pill(미국/캐나다/중남미/유럽/오세아니아 N개)은 제외
    .replace(/(?<!\d)(?<!미국 |캐나다 |중남미 |유럽 |오세아니아 |동남아 |일본 |한국 |중동 )\d+개 도시/g, `${COUNT}개 도시`)
    // ── 영어 총계 ──
    .replace(/\d+\+ Cities/g, `${COUNT}+ Cities`)
    .replace(/\b\d+ Cities\b/g, `${COUNT} Cities`)
    .replace(/across \d+ cities/gi, `across ${COUNT} cities`)
    .replace(/serves? \d+ cities/gi, `serves ${COUNT} cities`)
    .replace(/\b\d+ cities\b/g, `${COUNT} cities`)          // en 총계 ("N cities. One community")
    .replace(/\d+-city\b/g, `${COUNT}-city`)
    // .hg-city-count 스팬의 fallback 텍스트 (JS 미로드 시 대비 — 런타임엔 city-count.js가 갱신)
    .replace(/hg-city-count">\d+</g, `hg-city-count">${COUNT}<`)
    .replace(/hg-city-count-plus">\d+/g, `hg-city-count-plus">${COUNT}`);
}

let changed = [];

function syncFile(absPath, label) {
  if (!fs.existsSync(absPath)) return;
  const before = fs.readFileSync(absPath, 'utf8');
  const after = syncCount(before);
  if (after !== before) {
    fs.writeFileSync(absPath, after, 'utf8');
    changed.push(label);
    console.log(`  ✅ ${label} → ${COUNT}`);
  }
}

// ── 3. hg-config.js (런타임 핵심 — .hg-city-count 요소 자동 반영) ──
const configPath = path.join(ROOT, 'hebronguide/public/js/hg-config.js');
let cfg = fs.readFileSync(configPath, 'utf8');
const cfgAfter = cfg.replace(/CITY_COUNT\s*=\s*\d+/, `CITY_COUNT = ${COUNT}`);
if (cfgAfter !== cfg) {
  fs.writeFileSync(configPath, cfgAfter, 'utf8');
  console.log(`  ✅ hg-config.js → ${COUNT}`);
}

// ── 4. index.html (루트 랜딩) ────────────────────────────────
syncFile(path.join(ROOT, 'index.html'), 'index.html');

// ── 5. 전체 정적 페이지 (hebronguide/public/*.html) ──────────
const pubDir = path.join(ROOT, 'hebronguide/public');
for (const f of fs.readdirSync(pubDir)) {
  if (f.endsWith('.html')) syncFile(path.join(pubDir, f), `public/${f}`);
}

// ── 6. HebronGuide.tsx 정적 문자열 (동적 LIVE_CITY_COUNT 상수는 미접촉) ──
syncFile(tsxPath, 'HebronGuide.tsx');

// ── 7. api/city-planner.js (AI 시스템 프롬프트) ──────────────
const cpPath = path.join(ROOT, 'api/city-planner.js');
if (fs.existsSync(cpPath)) {
  let cp = fs.readFileSync(cpPath, 'utf8');
  const cpAfter = syncCount(cp).replace(/2025: \d+ cities/g, `2025: ${COUNT} cities`);
  if (cpAfter !== cp) {
    fs.writeFileSync(cpPath, cpAfter, 'utf8');
    console.log(`  ✅ city-planner.js → ${COUNT}`);
  }
}

console.log(`\n완료: 도시 수 ${COUNT}개로 통일 (변경 ${changed.length}곳)`);

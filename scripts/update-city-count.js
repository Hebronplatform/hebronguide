#!/usr/bin/env node
/**
 * HebronGuide 도시 수 자동 업데이트 스크립트
 * 사용법: node scripts/update-city-count.js
 *
 * HEBRON_CITIES 배열에서 status:"live" 도시 수를 세어
 * 아래 FILES 목록의 모든 파일을 한 번에 업데이트합니다.
 * 새 도시를 HebronGuide.tsx에 추가한 뒤 반드시 실행하세요.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── 1. 실제 도시 수 계산 ──────────────────────────────────
const tsx = fs.readFileSync(
  path.join(ROOT, 'hebronguide/src/app/components/HebronGuide.tsx'),
  'utf8'
);
const matches = [...tsx.matchAll(/status:\s*["']live["']/g)];
const COUNT = matches.length;
console.log(`✅ 실제 live 도시 수: ${COUNT}개`);

// ── 2. 업데이트할 파일 & 패턴 목록 ──────────────────────────
const FILES = [
  // index.html (랜딩 페이지) — 5곳
  {
    file: 'index.html',
    replacements: [
      [/전 세계 \d+개\+ 도시\./g,        `전 세계 ${COUNT}개+ 도시.`],
      [/\d+개 도시에서 <span>전 세계로<\/span>/g, `${COUNT}개 도시에서 <span>전 세계로</span>`],
      [/전 세계 <span>\d+개\+ 도시<\/span>/g,   `전 세계 <span>${COUNT}개+ 도시</span>`],
      [/ko">\d+개 도시<\/span><span class="en">\d+\+ Cities/g,
                                          `ko">${COUNT}개 도시</span><span class="en">${COUNT}+ Cities`],
      [/<div class="stat-n">\d+<sup/g,    `<div class="stat-n">${COUNT}<sup`],
      [/From \d+ Cities/g,                `From ${COUNT} Cities`],
      [/>\d+\+ Cities<\/span> Worldwide/g,`>${COUNT}+ Cities</span> Worldwide`],
    ]
  },
  // api/city-planner.js — 2곳
  {
    file: 'api/city-planner.js',
    replacements: [
      [/currently serves \d+ cities worldwide/g, `currently serves ${COUNT} cities worldwide`],
      [/2025: \d+ cities →/g,                    `2025: ${COUNT} cities →`],
    ]
  },
  // hebronguide/public/partner-benefits.html — 2곳
  {
    file: 'hebronguide/public/partner-benefits.html',
    replacements: [
      [/\d+개\+ 도시 한인 디렉토리/g,   `${COUNT}개+ 도시 한인 디렉토리`],
      [/\d+개\+ 도시 디렉토리 노출/g,   `${COUNT}개+ 도시 디렉토리 노출`],
    ]
  },
  // hebronguide/public/qr-assets.html — 2곳
  {
    file: 'hebronguide/public/qr-assets.html',
    replacements: [
      [/\d+개\+ 도시 — 무료/g,  `${COUNT}개+ 도시 — 무료`],
      [/📍 \d+개\+ 도시/g,      `📍 ${COUNT}개+ 도시`],
    ]
  },
  // hebronguide/public/ad-request.html — 1곳
  {
    file: 'hebronguide/public/ad-request.html',
    replacements: [
      [/\d+개 도시 한인 커뮤니티에/g, `${COUNT}개 도시 한인 커뮤니티에`],
    ]
  },
];

// ── 3. 각 파일 업데이트 ──────────────────────────────────
let totalChanged = 0;
for (const { file, replacements } of FILES) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠️  파일 없음: ${file}`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = 0;
  for (const [pattern, replacement] of replacements) {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) changed++;
  }
  if (changed > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ ${file} — ${changed}곳 업데이트`);
    totalChanged += changed;
  } else {
    console.log(`  ℹ️  ${file} — 변경 없음`);
  }
}

console.log(`\n완료: 총 ${totalChanged}곳 업데이트 (도시 수: ${COUNT}개)`);
console.log('다음 단계: git add -A && git commit -m "chore: city count → ' + COUNT + '" && git push');

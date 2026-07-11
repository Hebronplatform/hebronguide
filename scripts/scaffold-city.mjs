#!/usr/bin/env node
// scripts/scaffold-city.mjs — City Engine v2 핵심 자동화
//
// 검증(verified)된 도시 초안 하나로 CLAUDE.md "새 도시 체크리스트" 6개 파일을
// 한 번에·멱등하게 편집한다. 기본은 --dry (diff만 출력), --apply로만 실제 수정.
//
//   node scripts/scaffold-city.mjs <slug> --dry              (기본 — Supabase에서 verified 초안 조회)
//   node scripts/scaffold-city.mjs <slug> --apply            (실제 수정 + 빌드 검증)
//   node scripts/scaffold-city.mjs <slug> --file draft.json  (로컬 JSON 사용 — 시뮬레이션)
//   추가 데이터 플래그: --lat --lng --population --state --taglineKo --taglineEn --color --flag --emoji
//
// 절대 원칙:
//  - git commit/push·배포는 하지 않는다 (목사님 확인 후 수동).
//  - verified 상태가 아니면 --apply 거부 (--file 시뮬레이션은 dry만 허용).
//  - 이미 존재하는 slug 항목은 각 편집을 건너뛴다 (멱등).

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { slugify, unSection, sectionComment, regionMapValue, indexRegionKo, logStage, fetchDraft } from './city-utils.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const F = {
  tsx: path.join(ROOT, 'hebronguide/src/app/components/HebronGuide.tsx'),
  buildSh: path.join(ROOT, 'build.sh'),
  indexHtml: path.join(ROOT, 'index.html'),
  sitemap: path.join(ROOT, 'sitemap.xml'),
  roadmap: path.join(ROOT, 'roadmap.json'),
};

// ── CLI 파싱 ─────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const slugArg = argv.find(a => !a.startsWith('--'));
const APPLY = argv.includes('--apply');
const SIMULATE = argv.includes('--simulate');
const fileIdx = argv.indexOf('--file');
const draftFile = fileIdx >= 0 ? argv[fileIdx + 1] : null;
const flag = (name, dflt = '') => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : dflt; };

if (!slugArg) { console.log('사용법: node scripts/scaffold-city.mjs <slug> [--dry|--apply] [--file draft.json]'); process.exit(1); }

// ── 데이터 로드 ──────────────────────────────────────────────────
async function loadCity() {
  let d = {};
  if (draftFile) {
    d = JSON.parse(fs.readFileSync(draftFile, 'utf8'));
  } else if (!SIMULATE) {
    const row = await fetchDraft(slugArg);
    if (!row) throw new Error(`초안 없음: '${slugArg}' — admin-city-drafts.html에서 먼저 초안 생성`);
    if (APPLY && row.status !== 'verified') {
      throw new Error(`'${slugArg}' 상태=${row.status} — verified가 아니면 --apply 불가 (Hard Rule: 검증 게이트). admin-city-drafts.html에서 검증 먼저.`);
    }
    d = { nameKo: row.name_ko, nameEn: row.name_en, country: row.country, lat: row.lat, lng: row.lng, status: row.status };
  }
  const city = {
    slug: slugArg,
    nameKo: d.nameKo || flag('nameKo'),
    nameEn: d.nameEn || flag('nameEn'),
    country: d.country || flag('country'),
    lat: d.lat ?? parseFloat(flag('lat', 'NaN')),
    lng: d.lng ?? parseFloat(flag('lng', 'NaN')),
    population: d.population || flag('population', ''),
    state: d.state || flag('state', d.country || flag('country')),
    taglineKo: d.taglineKo || flag('taglineKo', ''),
    taglineEn: d.taglineEn || flag('taglineEn', ''),
    color: d.color || flag('color', '#0EA5E9'),
    flagEmoji: d.flag || flag('flag', ''),
    emoji: d.emoji || flag('emoji', ''),
    status: d.status || 'file',
  };
  if (!city.nameKo || !city.nameEn || !city.country) throw new Error('nameKo/nameEn/country 필수 (초안 또는 플래그)');
  if (!isFinite(city.lat) || !isFinite(city.lng)) throw new Error('lat/lng 필수 — 초안 행 또는 --lat/--lng 플래그로 제공 (추측 금지)');
  if (slugify(city.nameEn) !== city.slug) console.log(`  참고: slug '${city.slug}' vs slugify('${city.nameEn}')='${slugify(city.nameEn)}'`);
  city.section = unSection(city.country);
  if (!city.taglineKo) city.taglineKo = `${city.nameKo}에서 시작하는 우리 이야기`;
  if (!city.taglineEn) city.taglineEn = `Your story begins in ${city.nameEn}.`;
  return city;
}

// ── 편집 헬퍼 ────────────────────────────────────────────────────
const edits = []; // {file, name, skipped, preview}
function record(file, name, skipped, preview) { edits.push({ file: path.relative(ROOT, file), name, skipped, preview }); }
function insertAt(text, idx, insert) { return text.slice(0, idx) + insert + text.slice(idx); }

function previewaround(text, idx, insert) {
  const before = text.slice(0, idx).split('\n').slice(-2).join('\n');
  const after = text.slice(idx).split('\n').slice(0, 2).join('\n');
  return `${before}\n${insert.split('\n').map(l => '+ ' + l).join('\n')}\n${after}`.trim();
}

// ── 1. HebronGuide.tsx ───────────────────────────────────────────
function editTsx(text, c) {
  // 1-a. type CitySlug union
  if (new RegExp(`"${c.slug}"`).test(text.slice(text.indexOf('type CitySlug'), text.indexOf(';', text.indexOf('type CitySlug')) + 1))) {
    record(F.tsx, 'type CitySlug', true, '이미 존재');
  } else {
    const start = text.indexOf('type CitySlug');
    const end = text.indexOf(';', start);
    const block = text.slice(start, end);
    const lastQuote = block.lastIndexOf('"');
    const insertIdx = start + lastQuote + 1;
    const ins = ` |\n  // City Engine v2 스캐폴딩\n  "${c.slug}"`;
    record(F.tsx, 'type CitySlug', false, previewaroundSafe(text, insertIdx, ins));
    text = insertAt(text, insertIdx, ins);
  }

  // 1-b. CITY_CONFIGS
  const cfgStart = text.indexOf('const CITY_CONFIGS');
  const cfgEnd = text.indexOf('\n};', cfgStart);
  if (text.slice(cfgStart, cfgEnd).includes(`\n  ${c.slug}: {`)) {
    record(F.tsx, 'CITY_CONFIGS', true, '이미 존재');
  } else {
    const ins = [
      `  ${c.slug}: {`,
      `    slug: "${c.slug}", nameKo: "${c.nameKo}", nameEn: "${c.nameEn}", color: "${c.color}",`,
      `    heroVideo: "",`,
      `    population: "${c.population}", state: "${c.state}",`,
      `    taglineKo: "${c.taglineKo}", taglineEn: "${c.taglineEn}",`,
      `    taglineEs: "${c.taglineEn}",`,
      `  },`,
      '',
    ].join('\n');
    record(F.tsx, 'CITY_CONFIGS', false, previewaroundSafe(text, cfgEnd + 1, ins));
    text = insertAt(text, cfgEnd + 1, ins);
  }

  // 1-c. HEBRON_CITIES (UN 섹션 주석 아래)
  const arrStart = text.indexOf('const HEBRON_CITIES');
  const arrEnd = text.indexOf('\n];', arrStart);
  if (text.slice(arrStart, arrEnd).includes(`url: "/${c.slug}/"`)) {
    record(F.tsx, 'HEBRON_CITIES', true, '이미 존재');
  } else {
    const comment = sectionComment(c.section);
    const cIdx = text.indexOf(comment, arrStart);
    if (cIdx < 0 || cIdx > arrEnd) throw new Error(`HEBRON_CITIES에서 섹션 주석을 찾지 못함: ${comment}`);
    const lineEnd = text.indexOf('\n', cIdx) + 1;
    const ins = `  { emoji: "${c.emoji}", nameKo: "${c.nameKo}", nameEn: "${c.nameEn}", flag: "${c.flagEmoji}", url: "/${c.slug}/", status: "live", color: "${c.color}" },\n`;
    record(F.tsx, `HEBRON_CITIES (${c.section})`, false, previewaroundSafe(text, lineEnd, ins));
    text = insertAt(text, lineEnd, ins);
  }
  return text;
}

function previewaroundSafe(text, idx, ins) { try { return previewaround(text, idx, ins); } catch { return '+ ' + ins.trim(); } }

// ── 2. build.sh ──────────────────────────────────────────────────
function appendToParenBlock(text, blockStartMarker, line, name) {
  const start = text.indexOf(blockStartMarker);
  if (start < 0) throw new Error(`build.sh에서 블록을 찾지 못함: ${blockStartMarker}`);
  const closeMatch = text.slice(start).match(/\n\)\s*\n/);
  if (!closeMatch) throw new Error(`build.sh 블록 닫는 괄호 못 찾음: ${blockStartMarker}`);
  const closeIdx = start + closeMatch.index + 1;
  if (text.slice(start, closeIdx).includes(`["${line.split('"')[1]}"]`)) {
    record(F.buildSh, name, true, '이미 존재');
    return text;
  }
  const ins = line + '\n';
  record(F.buildSh, name, false, previewaroundSafe(text, closeIdx, ins));
  return insertAt(text, closeIdx, ins);
}

function editBuildSh(text, c) {
  text = appendToParenBlock(text, 'declare -A CITY_KO=(', `  ["${c.slug}"]="${c.nameKo}"`, 'CITY_KO');
  text = appendToParenBlock(text, 'declare -A CITY_EN=(', `  ["${c.slug}"]="${c.nameEn}"`, 'CITY_EN');
  text = appendToParenBlock(text, 'REGION_MAP=(', `  ["${c.slug}"]="${regionMapValue(c.section, c.country)}"`, 'REGION_MAP');
  text = appendToParenBlock(text, 'declare -A CITY_GEO=(', `  ["${c.slug}"]="${c.lat},${c.lng},${c.country}"`, 'CITY_GEO');

  // 배포 for 루프 2곳 (도시 목록 마지막 줄 "... neworleans; do")
  const loopRe = /(orlando maryland virginia neworleans[^\n;]*); do/g;
  const matches = [...text.matchAll(loopRe)];
  if (!matches.length) throw new Error('build.sh 배포 루프 앵커(orlando maryland virginia neworleans; do)를 찾지 못함');
  if (matches[0][1].includes(` ${c.slug}`)) {
    record(F.buildSh, `배포 루프 x${matches.length}`, true, '이미 존재');
  } else {
    record(F.buildSh, `배포 루프 x${matches.length}`, false, `  ${matches[0][1]}; do\n+ ${matches[0][1]} ${c.slug}; do`);
    text = text.replace(loopRe, `$1 ${c.slug}; do`);
  }
  return text;
}

// ── 3. index.html (#cityRegions city-pill) ───────────────────────
function editIndexHtml(text, c) {
  if (text.includes(`href="/${c.slug}/"`)) { record(F.indexHtml, 'city-pill', true, '이미 존재'); return text; }
  const regionKo = indexRegionKo(c.section, c.country);
  const labelIdx = text.indexOf(`<span class="ko">${regionKo}</span>`);
  if (labelIdx < 0) throw new Error(`index.html에서 지역 라벨을 찾지 못함: ${regionKo}`);
  const firstCloseA = text.indexOf('</a>', labelIdx);
  const insertIdx = firstCloseA + '</a>'.length;
  const ins = `\n      <a href="/${c.slug}/" class="city-pill"><span class="ko">${c.nameKo}</span><span class="en">${c.nameEn}</span></a>`;
  record(F.indexHtml, `city-pill (${regionKo})`, false, previewaroundSafe(text, insertIdx, ins));
  return insertAt(text, insertIdx, ins);
}

// ── 4. sitemap.xml ───────────────────────────────────────────────
function editSitemap(text, c) {
  if (text.includes(`/${c.slug}/</loc>`)) { record(F.sitemap, 'sitemap', true, '이미 존재'); return text; }
  const today = new Date().toISOString().slice(0, 10);
  const ins = `  <url><loc>https://hebronguide.com/${c.slug}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
  const idx = text.indexOf('</urlset>');
  record(F.sitemap, 'sitemap', false, '+ ' + ins.trim());
  return insertAt(text, idx, ins);
}

// ── 5. roadmap.json (라이브 승격 시 예정 목록에서 제거) ───────────
function editRoadmap(text, c) {
  const lines = text.split('\n');
  const hit = lines.findIndex(l => l.includes(`"nameEn":"${c.nameEn}"`) || l.includes(`"nameKo":"${c.nameKo}"`));
  if (hit < 0) { record(F.roadmap, 'roadmap 제거', true, '예정 목록에 없음 (신규 직행 도시)'); return text; }
  record(F.roadmap, 'roadmap 제거', false, '- ' + lines[hit].trim());
  lines.splice(hit, 1);
  let out = lines.join('\n');
  out = out.replace(/,(\s*\n\s*)\]/, '$1]'); // 마지막 항목 제거 시 dangling comma 정리
  JSON.parse(out); // 유효성 검증 — 실패하면 throw
  return out;
}

// ── 실행 ─────────────────────────────────────────────────────────
(async () => {
  const c = await loadCity();
  console.log(`\n=== 도시 스캐폴딩: ${c.nameKo} (${c.nameEn}) → /${c.slug}/ ===`);
  console.log(`  국가: ${c.country} | UN 섹션: ${c.section} | 좌표: ${c.lat},${c.lng} | 초안상태: ${c.status}`);
  console.log(`  모드: ${APPLY ? 'APPLY (실제 수정)' : 'DRY-RUN (수정 없음)'}\n`);

  const files = {
    [F.tsx]: editTsx,
    [F.buildSh]: editBuildSh,
    [F.indexHtml]: editIndexHtml,
    [F.sitemap]: editSitemap,
    [F.roadmap]: editRoadmap,
  };

  const results = {};
  for (const [file, fn] of Object.entries(files)) {
    const before = fs.readFileSync(file, 'utf8');
    results[file] = fn(before, c);
  }

  // 결과 출력
  for (const e of edits) {
    console.log(`--- ${e.file} · ${e.name} ${e.skipped ? '[건너뜀: ' + e.preview + ']' : ''}`);
    if (!e.skipped) console.log(e.preview.split('\n').map(l => '    ' + l).join('\n'));
  }
  console.log(`\n요약: 편집 ${edits.filter(e => !e.skipped).length}건 · 건너뜀 ${edits.filter(e => e.skipped).length}건`);
  console.log('참고: 도시 수 표기는 손대지 않음 — update-city-count.js가 빌드 시 자동 통일');

  if (!APPLY) {
    console.log('\nDRY-RUN 완료 — 실제 적용: --apply');
    await logStage(c.slug, 'scaffold', 'ok', 'dry-run', { simulate: SIMULATE || !!draftFile });
    return;
  }

  // APPLY: 쓰기 + 빌드 검증
  for (const [file, after] of Object.entries(results)) fs.writeFileSync(file, after, 'utf8');
  console.log('\n파일 수정 완료 — 빌드 검증 시작 (컴파일 통과 확인)...');
  const b = spawnSync('npm', ['run', 'build'], { cwd: path.join(ROOT, 'hebronguide'), shell: true, encoding: 'utf8' });
  const ok = b.status === 0;
  console.log((b.stdout || '').split('\n').slice(-6).join('\n'));
  await logStage(c.slug, 'scaffold', ok ? 'ok' : 'error', ok ? 'apply+build ok' : '빌드 실패', {});
  if (!ok) {
    console.error('\n빌드 실패 — 롤백: git checkout -- hebronguide/src/app/components/HebronGuide.tsx build.sh index.html sitemap.xml roadmap.json');
    process.exit(1);
  }
  console.log('\n스캐폴딩 + 빌드 검증 완료.');
  console.log('다음 (사람 게이트): 목사님 확인 후 수동으로 git add/commit/push (일요일 제외). 자동 배포하지 않습니다.');
})().catch(e => { console.error('오류:', e.message); process.exit(1); });

#!/usr/bin/env node
// scripts/city-pipeline.mjs — City Engine v2 파이프라인 오케스트레이터
//
// 흐름 (사람 게이트에서 반드시 정지 — 자동으로 건너뛰지 않음):
//   ingest/draft  →  [사람 게이트 1: 검증]  →  scaffold(dry)  →  buildCheck  →  [사람 게이트 2: 배포]
//
//   node scripts/city-pipeline.mjs draft --nameKo 쿠알라룸푸르 --nameEn "Kuala Lumpur" --country 말레이시아 [--raw file.json]
//       (환경변수 HG_ADMIN_TOKEN 필요 — 관리자 비밀번호. 코드/레포에 저장 금지)
//   node scripts/city-pipeline.mjs status <slug>       — 초안 상태·로그 확인
//   node scripts/city-pipeline.mjs scaffold <slug>     — verified 초안 dry-run (적용은 scaffold-city --apply 직접)
//   node scripts/city-pipeline.mjs test               — Stage 7: roadmap.json 첫 도시로 전 구간 시뮬레이션 (쓰기 전혀 없음)

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SUPABASE_URL, anonHeaders, slugify, unSection, logStage } from './city-utils.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = process.env.HG_API_BASE || 'https://hebronguide.com';
const [cmd, ...rest] = process.argv.slice(2);
const flag = (name, dflt = '') => { const i = rest.indexOf('--' + name); return i >= 0 ? rest[i + 1] : dflt; };

async function draft() {
  const token = process.env.HG_ADMIN_TOKEN;
  if (!token) throw new Error('HG_ADMIN_TOKEN 환경변수 필요 (관리자 비밀번호). 예: HG_ADMIN_TOKEN=... node scripts/city-pipeline.mjs draft ...');
  const nameKo = flag('nameKo'), nameEn = flag('nameEn'), country = flag('country');
  if (!nameKo || !nameEn || !country) throw new Error('--nameKo --nameEn --country 필수');
  const rawFile = flag('raw');
  const rawData = rawFile ? JSON.parse(fs.readFileSync(rawFile, 'utf8')) : undefined;

  console.log(`[1/2] AI 초안 요청: ${nameKo} (${nameEn}), ${country} — UN 섹션: ${unSection(country)}`);
  const r = await fetch(`${API}/api/city-draft`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, action: 'draft', nameKo, nameEn, country, rawData }),
  });
  const d = await r.json();
  if (!r.ok || !d.ok) throw new Error(`초안 실패: ${d.error || r.status}`);
  console.log(`[2/2] 초안 저장됨: slug=${d.slug}, status=${d.status}`);
  console.log('\n[사람 게이트 1 — 여기서 정지]');
  console.log(`다음: hebronguide.com/admin-city-drafts.html 에서 그 도시에 살아본 한인이 출처 대조 후 "검증 완료"`);
  console.log('검증 없이 다음 단계로 자동 진행하지 않습니다 (Hard Rule).');
}

async function status() {
  const slug = rest.find(a => !a.startsWith('--'));
  if (!slug) throw new Error('slug 필요');
  const d = await fetch(`${SUPABASE_URL}/rest/v1/city_drafts?slug=eq.${slug}&select=slug,status,verified_by,verified_at,updated_at`, { headers: anonHeaders() }).then(r => r.json());
  const logs = await fetch(`${SUPABASE_URL}/rest/v1/city_pipeline_logs?slug=eq.${slug}&order=created_at.desc&limit=10`, { headers: anonHeaders() }).then(r => r.json());
  console.log('초안:', JSON.stringify(d[0] || null, null, 1));
  console.log('최근 로그:');
  for (const l of (Array.isArray(logs) ? logs : [])) console.log(`  ${l.created_at?.slice(0, 16)} ${l.stage} ${l.status} — ${l.message}`);
}

function runScaffold(slug, extra = []) {
  const r = spawnSync('node', [path.join(ROOT, 'scripts/scaffold-city.mjs'), slug, ...extra], { stdio: 'inherit', shell: false });
  return r.status === 0;
}

async function scaffold() {
  const slug = rest.find(a => !a.startsWith('--'));
  if (!slug) throw new Error('slug 필요');
  console.log('[scaffold] dry-run 실행 (적용하려면 scaffold-city.mjs를 --apply로 직접 실행)');
  const ok = runScaffold(slug, ['--dry']);
  if (ok) {
    console.log('\n[사람 게이트 2 — 여기서 정지]');
    console.log('diff 확인 후: node scripts/scaffold-city.mjs ' + slug + ' --apply');
    console.log('빌드 통과 후: 목사님 확인 → 수동 git push (일요일 제외)');
  }
}

// ── Stage 7: 전 구간 시뮬레이션 (Supabase 쓰기·API 호출 전혀 없음) ──
async function test() {
  const roadmap = JSON.parse(fs.readFileSync(path.join(ROOT, 'roadmap.json'), 'utf8'));
  const city = roadmap[0]; // 이미 계획된 실제 한인 커뮤니티 도시 (추측 도시 아님)
  const slug = slugify(city.nameEn);
  console.log('=== Stage 7 테스트: 전 구간 시뮬레이션 (파일·DB 수정 없음) ===');
  console.log(`대상: roadmap.json 1번 — ${city.nameKo} (${city.nameEn}), ${city.country}, ${city.year}년 예정`);
  console.log(`slug=${slug} | UN 섹션=${unSection(city.country)} | 예상 URL=https://hebronguide.com/${slug}/\n`);

  // 가짜 초안 (AI 호출 없이 — 시뮬레이션용 최소 구조)
  const fake = {
    nameKo: city.nameKo, nameEn: city.nameEn, country: city.country,
    lat: city.lat, lng: city.lng,
    _simulated: true, _warning: '시뮬레이션 초안 — 실제 데이터 아님',
  };
  const tmp = path.join(ROOT, 'scripts', `.test-draft-${slug}.json`);
  fs.writeFileSync(tmp, JSON.stringify(fake, null, 1), 'utf8');
  try {
    console.log('[1/2] 초안 생성 — 시뮬레이션 (AI·DB 미호출)');
    console.log('[2/2] 스캐폴딩 dry-run (아래 diff가 실제 --apply 시 적용될 내용):\n');
    const ok = runScaffold(slug, ['--dry', '--simulate', '--file', tmp]);
    console.log('\n=== 시뮬레이션 ' + (ok ? '성공' : '실패') + ' ===');
    if (ok) console.log('실제 진행 순서: draft(AI) → 사람 검증 → scaffold --dry → --apply → 빌드 확인 → 목사님 승인 후 push');
  } finally { fs.unlinkSync(tmp); }
}

(async () => {
  if (cmd === 'draft') await draft();
  else if (cmd === 'status') await status();
  else if (cmd === 'scaffold') await scaffold();
  else if (cmd === 'test') await test();
  else console.log('사용법: node scripts/city-pipeline.mjs draft|status|scaffold|test ...  (자세한 옵션은 파일 상단 주석)');
})().catch(async e => {
  console.error('오류:', e.message);
  try { await logStage(rest.find(a => !a.startsWith('--')) || 'unknown', cmd || 'pipeline', 'error', e.message, { simulate: true }); } catch {}
  process.exit(1);
});

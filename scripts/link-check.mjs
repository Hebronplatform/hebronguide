#!/usr/bin/env node
/**
 * link-check.mjs — HebronGuide 링크·라우트 헬스체크
 *
 * 왜 필요한가 (2026-07-15, 실제 사고 기반):
 *   "파트너 10가지 혜택 보기" 링크가 먹통이었다. 파일(partner-benefits.html)은 멀쩡한데
 *   vercel.json의 리다이렉트가 그 페이지를 통째로 가려서(308) 등록 폼으로 튕겼다.
 *   목사님이 직접 눌러보고서야 발견됐다. 리다이렉트 규칙이 170개가 넘으므로 같은 사고가
 *   또 날 수 있다. 이 스크립트는 그 사고를 배포 전에 자동으로 잡는다.
 *
 * 검사 항목
 *   1) SHADOW  — 리다이렉트가 "실제 존재하는 페이지"를 가리고 있는가 (치명)
 *   2) DEADLINK— HTML 내부 링크가 존재하지 않는 곳을 가리키는가 (치명)
 *   3) LIVE    — (--live) 라이브에서 핵심 라우트가 200으로 열리는가
 *
 * 사용법
 *   node scripts/link-check.mjs              # 정적 검사 (빠름, 네트워크 불필요)
 *   node scripts/link-check.mjs --live       # 라이브 라우트까지 확인
 *   node scripts/link-check.mjs --json       # 기계 판독용 출력
 *
 * 종료 코드: 문제 발견 시 1 (CI에서 실패 처리)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_SRC = path.join(ROOT, 'hebronguide', 'public'); // 루트로 배포되는 정적 페이지 원본
const VERCEL_JSON = path.join(ROOT, 'vercel.json');
const LIVE_BASE = 'https://hebronguide.com';

const argv = process.argv.slice(2);
const WANT_LIVE = argv.includes('--live');
const AS_JSON = argv.includes('--json');

/**
 * 의도적으로 실제 파일을 가리는 리다이렉트 (사람이 확인해 승인한 것만 여기 등록).
 * 새 항목을 넣기 전에 반드시 물어볼 것: "이 페이지는 정말 더 이상 보이면 안 되는가?"
 * 형식: '리다이렉트 source' : '왜 의도적인지'
 */
const INTENTIONAL_SHADOWS = {
  // 2026-07-15 목사님 확인: 아래는 모두 교회 등재·파트너 신청의 "구버전"이며
  // /ad-request.html 한 곳으로 일원화한다. (구버전 파일은 남아 있으나 노출하지 않음)
  '/church-partner.html':    '구버전 — /ad-request.html로 일원화',
  '/church-guide.html':      '구버전 — /ad-request.html로 일원화',
  '/church-submit.html':     '구버전 — /ad-request.html로 일원화',
  '/partner-church.html':    '구버전 — /ad-request.html로 일원화',
  '/church-join.html':       '구버전 — /ad-request.html로 일원화',
  '/founding-partner.html':  '구버전 — /ad-request.html로 일원화',
  '/church-bulletin.html':   '구버전(주보용) — /ad-request.html로 일원화',
  '/church-notice.html':     '구버전(게시판용) — /ad-request.html로 일원화',
  '/church-abc-korean.html': '구버전(미주침례교 한인총회 맞춤) — /ad-request.html로 일원화',
  '/ksbc-partner.html':      '구버전(미주남침례회 한인교회총회 맞춤) — /ad-request.html로 일원화',
};

const problems = [];
const notes = [];
const add = (level, kind, msg, hint) => problems.push({ level, kind, msg, hint });

// ── 유틸 ──────────────────────────────────────────────────────────────────────
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const exists = (p) => fs.existsSync(p);
const isWildcard = (s) => s.includes('(') || s.includes(':') || s.includes('*');

/** '/foo.html' → hebronguide/public/foo.html 로 매핑되는 실제 파일 경로 */
function srcToFile(routePath) {
  const clean = routePath.split('?')[0].split('#')[0];
  if (!clean.startsWith('/')) return null;
  return path.join(PUBLIC_SRC, clean.slice(1));
}

// ── 1) SHADOW: 리다이렉트가 실존 페이지를 가리는가 ─────────────────────────────
function checkShadows(vercel) {
  const redirects = vercel.redirects || [];
  let checked = 0;
  for (const r of redirects) {
    const src = r.source;
    if (!src || isWildcard(src)) continue;          // 와일드카드는 대상 아님
    if (/\/index\.html$/.test(src)) continue;       // /{city}/index.html → /{city}/ 는 정규화(정상)
    const f = srcToFile(src);
    if (!f || !exists(f)) continue;                 // 실제 파일 없음 = 정상적인 옛 경로 정리
    checked++;
    if (INTENTIONAL_SHADOWS[src]) {
      notes.push(`의도적 가림(승인됨): ${src} → ${r.destination} — ${INTENTIONAL_SHADOWS[src]}`);
      continue;
    }
    add('ERROR', 'SHADOW',
      `리다이렉트가 실제 페이지를 가림: ${src} → ${r.destination}`,
      `hebronguide/public${src} 파일이 실존합니다. 이 페이지를 보이게 하려면 vercel.json에서 이 규칙을 지우세요. 정말 가리는 게 맞다면 scripts/link-check.mjs의 INTENTIONAL_SHADOWS에 사유와 함께 등록하세요.`);
  }
  return checked;
}

// ── 2) DEADLINK: HTML 내부 링크가 실존하는가 ──────────────────────────────────
function collectHtml(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.html')).map((f) => path.join(dir, f));
}

function checkDeadLinks(vercel, cities) {
  const files = collectHtml(PUBLIC_SRC);
  const rewrites = (vercel.rewrites || []).map((r) => r.source);
  const redirectSrcs = new Set((vercel.redirects || []).map((r) => r.source));
  let linkCount = 0;

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const base = path.basename(file);
    // 내부 절대경로 링크만 검사 (외부 http(s)·mailto·tel·앵커 제외)
    const hrefs = [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]);
    for (const href of new Set(hrefs)) {
      if (href.includes('${')) continue;                           // JS 템플릿 문자열(`/${city}/`)은 링크가 아님
      linkCount++;
      if (href === '/') continue;                                  // 랜딩
      if (redirectSrcs.has(href)) continue;                        // 의도된 리다이렉트 경로
      const cityMatch = href.match(/^\/([a-z0-9-]+)\/$/);
      if (cityMatch && cities.has(cityMatch[1])) continue;         // /{city}/ 도시 라우트
      if (rewrites.some((rw) => !isWildcard(rw) && rw === href)) continue;
      // /{city}/foo.html — build.sh가 루트 정적 페이지를 각 도시 폴더로 복사하므로,
      // 원본(hebronguide/public/foo.html)이 있으면 정상이다.
      const cityPage = href.match(/^\/([a-z0-9-]+)\/(.+\.html)$/);
      if (cityPage && cities.has(cityPage[1]) && exists(path.join(PUBLIC_SRC, cityPage[2]))) continue;
      const f = srcToFile(href);
      if (f && exists(f)) continue;                                // 실제 파일 존재
      if (exists(path.join(ROOT, href.slice(1)))) continue;        // 저장소 루트 자산(예: /roadmap.json)
      add('ERROR', 'DEADLINK',
        `${base} → 없는 곳으로 링크: ${href}`,
        `hebronguide/public${href} 파일이 없고, 도시 라우트/리라이트에도 해당하지 않습니다. 오타이거나 삭제된 페이지입니다.`);
    }
  }
  return linkCount;
}

// ── 도시 목록 (status:"live") ────────────────────────────────────────────────
function liveCities() {
  const tsx = path.join(ROOT, 'hebronguide', 'src', 'app', 'components', 'HebronGuide.tsx');
  const set = new Set();
  if (!exists(tsx)) return set;
  const s = fs.readFileSync(tsx, 'utf8');
  for (const m of s.matchAll(/url:\s*"\/([a-z0-9-]+)\/"[^}]*status:\s*"live"/g)) set.add(m[1]);
  for (const m of s.matchAll(/status:\s*"live"[^}]*url:\s*"\/([a-z0-9-]+)\/"/g)) set.add(m[1]);
  return set;
}

// ── 3) LIVE: 핵심 라우트가 실제로 열리는가 ────────────────────────────────────
async function checkLive(cities) {
  const targets = [
    '/', '/ad-request.html', '/partner-benefits.html', '/story-invite.html',
    '/story-submit.html', '/privacy.html',
    ...[...cities].slice(0, 5).map((c) => `/${c}/`),
  ];
  for (const t of targets) {
    try {
      const res = await fetch(LIVE_BASE + t, { redirect: 'manual' });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location') || '(?)';
        add('ERROR', 'LIVE',
          `라이브에서 리다이렉트됨: ${t} → ${loc} (HTTP ${res.status})`,
          `이 경로는 그대로 열려야 합니다. vercel.json 리다이렉트를 확인하세요.`);
      } else if (res.status !== 200) {
        add('ERROR', 'LIVE', `라이브 응답 이상: ${t} → HTTP ${res.status}`, `배포 또는 build.sh 복사 누락 가능성.`);
      }
    } catch (e) {
      add('WARN', 'LIVE', `요청 실패: ${t} (${e.message})`, `네트워크 문제일 수 있습니다.`);
    }
  }
  return targets.length;
}

// ── 실행 ─────────────────────────────────────────────────────────────────────
const vercel = readJson(VERCEL_JSON);
const cities = liveCities();
const shadowChecked = checkShadows(vercel);
const linkCount = checkDeadLinks(vercel, cities);
let liveChecked = 0;
if (WANT_LIVE) liveChecked = await checkLive(cities);

const errors = problems.filter((p) => p.level === 'ERROR');
const warns = problems.filter((p) => p.level === 'WARN');

if (AS_JSON) {
  console.log(JSON.stringify({ problems, notes, stats: { cities: cities.size, links: linkCount, shadowChecked, liveChecked } }, null, 2));
} else {
  console.log('HebronGuide 링크·라우트 헬스체크');
  console.log(`  도시(live) ${cities.size} · 내부링크 ${linkCount} · 리다이렉트 실존검사 ${shadowChecked}${WANT_LIVE ? ` · 라이브 ${liveChecked}` : ''}`);
  console.log('');
  if (notes.length) { notes.forEach((n) => console.log(`  참고: ${n}`)); console.log(''); }
  if (!problems.length) {
    console.log('  문제 없음. 모든 링크와 라우트가 정상입니다.');
  } else {
    for (const p of problems) {
      console.log(`  [${p.level}] ${p.kind}  ${p.msg}`);
      console.log(`         ↳ ${p.hint}`);
    }
    console.log('');
    console.log(`  오류 ${errors.length}건 · 경고 ${warns.length}건`);
  }
}

process.exit(errors.length ? 1 : 0);

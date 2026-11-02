#!/usr/bin/env node
/**
 * health-check.mjs — HebronGuide 주간 건강 검진 (2026-11-02, 설계도 ⑧)
 *
 * 왜: 배포가 조용히 멈춰도(ver.txt 정지), 도시 주소 하나가 404여도 사람이 우연히 볼 때까지 몰랐다.
 *     매주 월요일 GitHub Actions가 이 스크립트를 돌리고, 실패하면 이슈를 만든다.
 *
 * 보는 것
 *   1. 살아 있는 도시 전부 /{slug}/ 와 하위 주소 /{slug}/church 가 200인지
 *   2. 처음 오신 분의 문(1면·도착·도울게요·자원봉사·자주 묻는 질문 등)이 200인지
 *   3. ver.txt 가 8일 넘게 멈췄는지 (배포가 조용히 실패하는지)
 *   4. 서버 함수 수가 12개 이하인지 (Vercel Hobby 한도)
 *   5. 죽은 링크(link-check) · 자가 점검(self-audit) 통과 여부 — 결과만, 상세는 남기지 않는다
 *
 * ⚠️ 공개 저장소다. 이슈와 로그에는 '무엇이 실패했는지'만 쓰고, 취약점의 상세는 쓰지 않는다.
 *
 * 사용법: node scripts/health-check.mjs   → 결과를 health-report.md 로 쓰고, 실패가 있으면 종료 코드 1
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://www.hebronguide.com'
const STALE_DAYS = 8

const fails = []
const notes = []

// ── 살아 있는 도시 목록 — HEBRON_CITIES 의 status:"live" (도시 수 SSOT) ──
const tsx = fs.readFileSync(path.join(ROOT, 'hebronguide/src/app/components/HebronGuide.tsx'), 'utf8')
const start = tsx.indexOf('const HEBRON_CITIES')
const seg = tsx.slice(start, tsx.indexOf('];', start))
const cities = [...seg.matchAll(/url:\s*"\/([a-z]+)\/"[^}\n]*status:\s*"live"/g)].map(m => m[1])

async function status(url) {
  for (let i = 0; i < 2; i++) {               // 한 번 실패는 일시적일 수 있다 — 두 번 본다
    try {
      const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'HebronGuide-HealthCheck' } })
      if (r.ok) return r.status
      if (i === 1) return r.status
    } catch (e) { if (i === 1) return 'ERR' }
    await new Promise(r => setTimeout(r, 1500))
  }
}

async function checkAll(urls) {
  const out = []
  for (let i = 0; i < urls.length; i += 10) {   // 10개씩 — 사이트를 두드리지 않게
    const batch = urls.slice(i, i + 10)
    out.push(...await Promise.all(batch.map(async u => [u, await status(u)])))
  }
  return out
}

// 1. 도시
const cityUrls = cities.flatMap(c => [`${SITE}/${c}/`, `${SITE}/${c}/church`])
const cityRes = await checkAll(cityUrls)
const cityBad = cityRes.filter(([, s]) => s !== 200)
if (cityBad.length) fails.push(`도시 주소 ${cityBad.length}곳이 열리지 않음:\n` + cityBad.map(([u, s]) => `  - ${u} → ${s}`).join('\n'))
notes.push(`도시 ${cities.length}곳 · 주소 ${cityUrls.length}개 확인 (실패 ${cityBad.length})`)

// 2. 처음 오신 분의 문
const pages = ['/', '/arrive.html', '/open.html', '/volunteer.html', '/faq.html', '/about.html',
  '/hospitality-board.html', '/ad-request.html', '/donate.html', '/privacy.html', '/sitemap.xml', '/llms.txt']
const pageRes = await checkAll(pages.map(p => SITE + p))
const pageBad = pageRes.filter(([, s]) => s !== 200)
if (pageBad.length) fails.push(`주요 페이지 ${pageBad.length}곳이 열리지 않음:\n` + pageBad.map(([u, s]) => `  - ${u} → ${s}`).join('\n'))
notes.push(`주요 페이지 ${pages.length}개 확인 (실패 ${pageBad.length})`)

// 3. 배포가 멈췄는지 — build.sh 가 배포마다 ver.txt 에 시각(초)을 쓴다
try {
  const v = (await (await fetch(`${SITE}/ver.txt`, { cache: 'no-store' })).text()).trim()
  const days = (Date.now() / 1000 - Number(v)) / 86400
  if (!Number.isFinite(days)) fails.push(`ver.txt 를 읽을 수 없음 ("${v.slice(0, 20)}")`)
  else if (days > STALE_DAYS) fails.push(`마지막 배포가 ${days.toFixed(1)}일 전 — 배포가 조용히 실패하고 있을 수 있다 (Vercel 빌드 로그 확인)`)
  else notes.push(`마지막 배포 ${days.toFixed(1)}일 전`)
} catch (e) { fails.push('ver.txt 확인 실패') }

// 4. 서버 함수 수
const fnCount = fs.readdirSync(path.join(ROOT, 'api')).filter(f => f.endsWith('.js')).length
if (fnCount > 12) fails.push(`서버 함수 ${fnCount}개 — Vercel Hobby 한도 12개를 넘었다. 배포가 조용히 실패한다`)
else notes.push(`서버 함수 ${fnCount}개 (한도 12)`)

// 5. 죽은 링크 · 자가 점검 — 출력은 버리고 통과 여부만 본다 (공개 로그에 상세를 남기지 않는다)
function passes(cmd) {
  try { execSync(cmd, { cwd: ROOT, stdio: 'ignore', timeout: 300_000 }); return true } catch { return false }
}
if (!passes('node scripts/link-check.mjs')) fails.push('죽은 링크 점검(link-check) 실패 — 로컬에서 `node scripts/link-check.mjs` 로 확인')
else notes.push('죽은 링크 없음')
if (!passes('node scripts/self-audit.mjs --net')) fails.push('자가 점검(self-audit --net)에서 치명 항목 — 로컬에서 `node scripts/self-audit.mjs --net` 으로 확인')
else notes.push('자가 점검 치명 0건')

// ── 보고 ──
const today = new Date().toISOString().slice(0, 10)
const report = [
  `## HebronGuide 주간 건강 검진 — ${today}`,
  '',
  fails.length ? `### 고칠 것 ${fails.length}건` : '### 이상 없음',
  ...fails.map(f => `- ${f}`),
  '',
  '### 확인한 것',
  ...notes.map(n => `- ${n}`),
].join('\n')
fs.writeFileSync(path.join(ROOT, 'health-report.md'), report + '\n')
console.log(report)
process.exit(fails.length ? 1 : 0)

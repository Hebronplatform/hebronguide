#!/usr/bin/env node
/**
 * self-audit.mjs — HebronGuide 자가 점검
 *
 * 왜 만들었나 (2026-09-20, 실제 사고 기반):
 *   이날 하루에 이런 것들이 나왔다. 전부 '사람이 우연히' 발견한 것이다.
 *     · 데이터베이스를 통째로 여는 열쇠가 공개 저장소에 두 달 넘게 살아 있었다
 *     · 관리자 비밀번호가 주석에 평문으로 적혀 있었다
 *     · 화면이 부르는 서버 기능 6개가 존재하지 않았다 (교회 CRM 전체가 죽어 있었다)
 *     · 상황판이 「파트너 교회 0」이라고 거짓말하고 있었다 (실제 13)
 *     · 온 사이트가 도시 수를 82라고 말했다 (실제 81 — 주석 한 줄이 도시로 세어졌다)
 *   우연에 맡기지 않는다. 이 스크립트가 매번 같은 자리를 본다.
 *
 * 사용법
 *   node scripts/self-audit.mjs           # 빠름 · 네트워크 불필요 (배포마다 자동 실행)
 *   node scripts/self-audit.mjs --net     # + 라이브 확인 (RLS 노출 · 열쇠 생사)
 *   node scripts/self-audit.mjs --deep    # + 지난 기록 전체에서 비밀 찾기 (느림)
 *   node scripts/self-audit.mjs --json    # 기계 판독용
 *
 * 종료 코드: 치명(CRITICAL) 발견 시 1
 *
 * ⚠️ 공개 주의: 이 스크립트가 쓰는 public/audit.json 은 웹에 올라간다.
 *    그래서 거기에는 '몇 건 통과/실패'만 담는다. 무엇이 왜 실패했는지는
 *    터미널에만 나온다. 취약점의 상세를 인터넷에 올리지 않는다.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const WANT_NET = argv.includes('--net')
const WANT_DEEP = argv.includes('--deep')
const AS_JSON = argv.includes('--json')

const SUPA_URL = 'https://vextxqzggznulwpganwt.supabase.co'
const PUBLISHABLE = 'sb_publishable_j1cYftObx8VDVkEQAvluXg_rn20pnfX'

/* ── 결과 모으기 ──────────────────────────────────────────────────────────── */
const results = []
/** level: CRITICAL | WARN | OK   group: 보안 | 배포 | 사실 | 법·문서 */
const add = (group, level, name, detail, fix) =>
  results.push({ group, level, name, detail, fix })

const sh = (cmd) => {
  try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }) }
  catch { return '' }
}
const read = (p) => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8') } catch { return '' } }
const exists = (p) => fs.existsSync(path.join(ROOT, p))

/** git 이 추적하는 파일 전체 (한 번만 읽어 둔다) */
const ALL_TRACKED = sh('git ls-files')
  .split('\n').map(s => s.trim()).filter(Boolean)
  .filter(f => !f.startsWith('99_Archive/') && !f.startsWith('hebronguide/dist/'))

/**
 * 확장자로 고른다.
 * 처음엔 git ls-files 에 glob 을 넘겼는데, 따옴표가 그대로 전달되어
 * 목록이 텅 비었고 — 점검기는 0개를 검사하고 '정상'이라고 말했다 (2026-09-20).
 * 그래서 목록은 통째로 받아 여기서 거른다.
 */
function trackedFiles(exts) {
  return ALL_TRACKED.filter(f => exts.some(e => f.endsWith(e)))
}

/* ══ 1. 보안 ═══════════════════════════════════════════════════════════════ */

/** 1-1. 지금 코드에 비밀이 적혀 있는가 */
function checkSecretsInCode() {
  const files = trackedFiles(['.js', '.mjs', '.html', '.tsx', '.ts', '.md', '.json', '.sh'])
  const PATTERNS = [
    { re: /sb_secret_[A-Za-z0-9_-]{12,}/,                         what: 'Supabase 비밀 키(sb_secret_)' },
    { re: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{20,}\./, what: '레거시 Supabase JWT' },
    { re: /GMAIL_APP_PASS\s*[:=]\s*['"][^'"]{8,}/,                what: 'Gmail 앱 비밀번호' },
    { re: /(비밀번호|password|passwd)\s*[:=(]?\s*['"][^'"\s]{8,}['"]/i, what: '평문처럼 보이는 비밀번호' },
  ]
  const hits = []
  for (const f of files) {
    const s = read(f)
    if (!s) continue
    for (const p of PATTERNS) {
      const m = s.match(p.re)
      if (m) hits.push(`${f} — ${p.what}`)
    }
  }
  if (hits.length) {
    add('보안', 'CRITICAL', '코드에 비밀이 적혀 있음', hits,
      '해당 줄을 지우고, 그 비밀 자체를 교체하십시오. 지우기만 하면 지난 기록에 남습니다.')
  } else if (!files.length) {
    // 0개를 검사하고 '정상'이라 말하면, 점검기가 고장난 것을 안전으로 착각하게 된다
    add('보안', 'WARN', '검사할 파일을 못 찾음', ['git ls-files 가 빈 목록을 돌려줬습니다'],
      '저장소 안에서 실행 중인지 확인하십시오. 점검기가 고장난 상태입니다.')
  } else {
    add('보안', 'OK', '코드에 비밀 없음', [`검사한 파일 ${files.length}개`])
  }
}

/** 1-2. 저장소가 공개인가 (공개면 비밀 관리 기준이 달라진다) */
function checkRepoVisibility() {
  const remote = sh('git remote get-url origin').trim()
  const m = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/)
  if (!m) { add('보안', 'WARN', '저장소 주소를 못 읽음', [remote || '(없음)']); return }
  add('보안', 'OK', '저장소', [`${m[1]}/${m[2]} — 공개 여부는 --net 으로 확인`])
}

/** 1-3. 지난 기록에 비밀이 있는가 (--deep) */
function checkSecretsInHistory() {
  if (!WANT_DEEP) { add('보안', 'OK', '지난 기록 검사', ['건너뜀 — --deep 으로 실행']); return }
  const out = sh(`git log --all -p --no-color -- "api/*" "*.html" "*.js"`)
  const found = new Set()
  for (const m of out.matchAll(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/g)) found.add(m[0])
  for (const m of out.matchAll(/sb_secret_[A-Za-z0-9_-]{12,}/g)) found.add(m[0])
  if (!found.size) { add('보안', 'OK', '지난 기록에 비밀 없음', []); return }

  const detail = []
  let anyElevated = false
  for (const t of found) {
    if (t.startsWith('sb_secret_')) { anyElevated = true; detail.push('sb_secret_… (권한 높음)'); continue }
    try {
      const p = JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
      if (p.role === 'service_role') anyElevated = true
      detail.push(`role=${p.role} ref=${p.ref}`)
    } catch { detail.push('(해독 실패한 JWT)') }
  }
  add('보안', anyElevated ? 'CRITICAL' : 'WARN',
    '지난 기록에 비밀이 남아 있음', detail,
    anyElevated
      ? '권한 높은 열쇠입니다. Supabase 에서 교체하고 옛 것을 Disable 하십시오. 지우는 것만으로는 부족합니다.'
      : 'anon/공개 키는 설계상 안전합니다. 다만 아직 유효한지 --net 으로 확인하십시오.')
  globalThis.__historyTokens = [...found]
}

/** 1-4. 익명으로 개인정보가 읽히는가 (--net) — RLS 가 걸려 있는지 보는 진짜 시험 */
async function checkRls() {
  if (!WANT_NET) { add('보안', 'OK', 'RLS 노출 검사', ['건너뜀 — --net 으로 실행']); return }
  const H = { apikey: PUBLISHABLE, Authorization: `Bearer ${PUBLISHABLE}` }
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/community_items?select=name,email,phone&limit=5`, { headers: H })
    if (!r.ok) { add('보안', 'OK', 'RLS — 익명 읽기 차단됨', [`HTTP ${r.status}`]); return }
    const rows = await r.json()
    const leaked = (Array.isArray(rows) ? rows : []).filter(x => x.email || x.phone)
    if (leaked.length) {
      add('보안', 'CRITICAL', 'RLS — 신청자 연락처가 익명에게 열려 있음',
        [`이메일·전화가 담긴 행 ${leaked.length}건이 로그인 없이 읽힙니다`],
        'sql-guide.html 1~5단계(마이그레이션 015)를 적용하십시오.')
    } else {
      add('보안', 'OK', 'RLS — 연락처 노출 없음', [])
    }
  } catch (e) { add('보안', 'WARN', 'RLS 검사 실패', [e.message]) }
}

/** 1-5. 지난 기록에서 찾은 열쇠가 아직 살아 있는가 (--net + --deep) */
async function checkLeakedKeyLiveness() {
  const tokens = globalThis.__historyTokens
  if (!WANT_NET || !tokens?.length) return
  const alive = []
  for (const t of tokens.slice(0, 10)) {
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/churches?select=id&limit=1`, {
        headers: { apikey: t, Authorization: `Bearer ${t}` },
      })
      if (r.ok) alive.push(t.slice(0, 24) + '…')
    } catch { /* 네트워크 문제는 넘어간다 */ }
  }
  if (alive.length) {
    add('보안', 'CRITICAL', '새어 나간 열쇠가 아직 살아 있음', alive,
      'Supabase → Settings → API Keys → Legacy API keys 를 Disable 하십시오.')
  } else {
    add('보안', 'OK', '새어 나간 열쇠는 모두 죽어 있음', [`검사 ${tokens.length}개`])
  }
}

/* ══ 2. 배포 건전성 ════════════════════════════════════════════════════════ */

/** 2-1. 서버 함수 개수 (Vercel Hobby 12개 한도 — 넘으면 배포가 조용히 실패) */
function checkFunctionCount() {
  const dir = path.join(ROOT, 'api')
  const n = exists('api') ? fs.readdirSync(dir).filter(f => f.endsWith('.js')).length : 0
  if (n > 12) {
    add('배포', 'CRITICAL', `서버 함수 ${n}개 — 한도 초과`, [`api/*.js 가 12개를 넘으면 배포가 조용히 실패합니다`],
      '여러 함수를 하나의 라우터로 합치거나 미사용 함수를 지우십시오.')
  } else {
    add('배포', 'OK', `서버 함수 ${n}/12`, [])
  }
}

/** 2-2. vercel.json 이 없는 함수를 가리키는가 (가리키면 배포가 즉시 실패) */
function checkVercelGhosts() {
  const v = read('vercel.json')
  const ghosts = [...new Set([...v.matchAll(/api\/[a-z0-9-]+\.js/g)].map(m => m[0]))]
    .filter(p => !exists(p))
  if (ghosts.length) {
    add('배포', 'CRITICAL', 'vercel.json 이 없는 함수를 가리킴', ghosts,
      'vercel.json 의 functions·crons 에서 그 줄을 지우십시오.')
  } else {
    add('배포', 'OK', 'vercel.json 유령 참조 없음', [])
  }
}

/** 2-3. 화면이 부르는 /api/* 가 실제로 있는가 (오늘 CRM 이 죽어 있던 이유) */
function checkApiRefs() {
  const files = trackedFiles(['.html', '.js', '.tsx']).filter(f => !f.startsWith('api/'))
  const called = new Map()
  for (const f of files) {
    const s = read(f)
    for (const m of s.matchAll(/["'`]\/api\/([a-z0-9-]+)/g)) {
      called.set(m[1], (called.get(m[1]) || 0) + 1)
    }
  }
  const missing = [...called.entries()].filter(([a]) => !exists(`api/${a}.js`))
  if (missing.length) {
    add('배포', 'CRITICAL', '화면이 없는 서버 기능을 부름',
      missing.map(([a, n]) => `/api/${a} — ${n}곳에서 호출`),
      '그 기능을 살아 있는 함수 안으로 옮겨 심거나, 화면에서 그 버튼을 내리십시오.')
  } else if (!called.size) {
    add('배포', 'WARN', '화면에서 서버 기능 호출을 못 찾음', [`검사한 파일 ${files.length}개`],
      '정말 하나도 없을 리 없습니다. 점검기가 파일을 못 읽고 있습니다.')
  } else {
    add('배포', 'OK', `화면이 부르는 서버 기능 ${called.size}개 모두 존재`, [])
  }
}

/* ══ 3. 사실성 — 화면이 거짓말하지 않는가 ═════════════════════════════════ */

/** 3-1. 도시 수: 정본(HEBRON_CITIES) 과 화면 표기가 맞는가 */
function checkCityCount() {
  const tsx = read('hebronguide/src/app/components/HebronGuide.tsx')
  const slugs = new Set()
  for (const m of tsx.matchAll(/\{[^{}]*status:\s*["']live["'][^{}]*\}/g)) {
    const u = m[0].match(/url:\s*["']\/([a-z0-9-]+)\/["']/)
    if (u) slugs.add(u[1])
  }
  const truth = slugs.size
  if (!truth) { add('사실', 'WARN', '도시 수를 셀 수 없음', []); return }

  const bad = []
  for (const f of ['index.html', 'ops.html', 'llms.txt']) {
    const s = read(f)
    for (const m of s.matchAll(/(\d+)\s*개\+?\s*도시/g)) {
      if (Number(m[1]) !== truth) bad.push(`${f} — ${m[1]} (실제 ${truth})`)
    }
  }
  if (bad.length) {
    add('사실', 'CRITICAL', '화면의 도시 수가 실제와 다름', [...new Set(bad)],
      'node scripts/update-city-count.js 를 실행하십시오.')
  } else {
    add('사실', 'OK', `도시 수 ${truth} — 화면과 일치`, [])
  }
}

/** 3-2. 상황판 숫자가 실제 데이터와 맞는가 (--net) */
async function checkDashboardNumbers() {
  if (!WANT_NET) { add('사실', 'OK', '상황판 숫자 검사', ['건너뜀 — --net 으로 실행']); return }
  const H = { apikey: PUBLISHABLE, Authorization: `Bearer ${PUBLISHABLE}`, Prefer: 'count=exact', Range: '0-0' }
  const count = async (q) => {
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/${q}`, { headers: H })
      const n = (r.headers.get('content-range') || '').split('/')[1]
      return n && n !== '*' ? Number(n) : null
    } catch { return null }
  }
  const listed = await count('churches?select=id')
  const partner = await count('churches?select=id&hebron_partner=is.true')
  if (listed == null) { add('사실', 'WARN', '교회 수를 못 읽음', []); return }
  add('사실', 'OK', '교회 수', [`등재 ${listed}곳 · 협력 ${partner ?? '?'}곳`])
}

/* ══ 4. 법·문서 — 기한이 지난 것이 있는가 ═════════════════════════════════ */

/**
 * 문서에 이런 줄이 있으면 기한을 본다:
 *   <!-- 점검주기: 90 · 최종점검: 2026-09-20 -->
 * 법은 수시로 바뀐다. 한 번 쓰고 잊는 문서를 만들지 않기 위한 장치다.
 */
function checkDocFreshness() {
  const docs = trackedFiles(['.md']).filter(f => f.startsWith('docs/'))
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const overdue = [], tracked = []
  for (const f of docs) {
    const m = read(f).match(/점검주기:\s*(\d+)\s*·\s*최종점검:\s*(\d{4}-\d{2}-\d{2})/)
    if (!m) continue
    const days = Number(m[1])
    const last = new Date(m[2] + 'T00:00:00')
    const age = Math.floor((today - last) / 86400000)
    tracked.push(f)
    if (age > days) overdue.push(`${f} — ${age}일 지남 (주기 ${days}일)`)
  }
  if (!tracked.length) {
    add('법·문서', 'WARN', '기한이 붙은 문서가 없음',
      ['어떤 문서도 재검토 기한을 갖고 있지 않습니다'],
      "법·규정 문서 머리에 <!-- 점검주기: 90 · 최종점검: YYYY-MM-DD --> 를 넣으십시오.")
  } else if (overdue.length) {
    add('법·문서', 'WARN', '재검토 기한이 지난 문서', overdue,
      '내용을 다시 확인하고 최종점검 날짜를 오늘로 고치십시오. 법은 수시로 바뀝니다.')
  } else {
    add('법·문서', 'OK', `기한 관리 문서 ${tracked.length}개 — 모두 유효`, [])
  }
}

/* ══ 실행 ═════════════════════════════════════════════════════════════════ */

checkSecretsInCode()
checkRepoVisibility()
checkSecretsInHistory()
checkFunctionCount()
checkVercelGhosts()
checkApiRefs()
checkCityCount()
checkDocFreshness()
await checkRls()
await checkLeakedKeyLiveness()
await checkDashboardNumbers()

const crit = results.filter(r => r.level === 'CRITICAL')
const warn = results.filter(r => r.level === 'WARN')

/* ── 공개돼도 안전한 요약만 파일로 (상황판이 읽는다) ──────────────────────
   무엇이 왜 실패했는지는 여기에 쓰지 않는다. 그건 터미널에만 나온다. */
const GROUPS = ['보안', '배포', '사실', '법·문서']
const summary = {
  ranAt: new Date().toISOString(),
  mode: WANT_DEEP ? 'deep' : (WANT_NET ? 'net' : 'fast'),
  groups: GROUPS.map(g => {
    const rs = results.filter(r => r.group === g)
    return {
      name: g,
      ok: rs.filter(r => r.level === 'OK').length,
      warn: rs.filter(r => r.level === 'WARN').length,
      critical: rs.filter(r => r.level === 'CRITICAL').length,
    }
  }),
  totals: { ok: results.length - crit.length - warn.length, warn: warn.length, critical: crit.length },
  // 무엇을 봐야 하는지 '이름'만 담는다. 무엇이 왜 실패했는지는 터미널에만 둔다.
  // (개수만 있으면 'Vercel 에서만 주의 1건' 같은 때 무엇인지 알 길이 없다 — 2026-09-20)
  attention: [...crit, ...warn].map(r => ({ group: r.group, level: r.level, name: r.name })),
}
try {
  fs.writeFileSync(path.join(ROOT, 'hebronguide/public/audit.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8')
} catch { /* 파일을 못 써도 점검 자체는 계속한다 */ }

if (AS_JSON) {
  console.log(JSON.stringify({ summary, results }, null, 2))
  process.exit(crit.length ? 1 : 0)
}

const ICON = { CRITICAL: '[치명]', WARN: '[주의]', OK: '[정상]' }
console.log('\nHebronGuide 자가 점검  ·  ' + summary.mode + ' 모드\n')
for (const g of GROUPS) {
  const rs = results.filter(r => r.group === g)
  if (!rs.length) continue
  console.log(`  ── ${g} ──`)
  for (const r of rs) {
    console.log(`  ${ICON[r.level]} ${r.name}`)
    for (const d of (r.detail || [])) console.log(`         ${d}`)
    if (r.fix && r.level !== 'OK') console.log(`         → ${r.fix}`)
  }
  console.log('')
}
console.log(`  치명 ${crit.length}건 · 주의 ${warn.length}건 · 정상 ${summary.totals.ok}건`)
if (!WANT_NET) console.log('  (--net 을 붙이면 라이브 노출까지 확인합니다)')
if (!WANT_DEEP) console.log('  (--deep 을 붙이면 지난 기록 전체에서 비밀을 찾습니다)')
console.log('')
process.exit(crit.length ? 1 : 0)

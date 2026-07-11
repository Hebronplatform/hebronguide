// api/db-migrate.js — 선언형 DB 마이그레이션 러너
//
// 목적: 목사님이 Supabase SQL Editor에 SQL을 복붙하던 반복 작업을 대체.
//       Claude Code가 채팅에서 목사님 승인("예")을 받은 뒤 이 엔드포인트를 호출한다.
//
// 안전 설계:
//  1) 임의 SQL 실행 불가 — 마이그레이션은 아래 MIGRATIONS에 '코드로 선언'된 것만 실행.
//     (git 커밋 = 감사 기록. 무엇이 언제 왜 바뀌는지 항상 추적 가능)
//  2) 시크릿 해시 게이트 — 실행 시크릿의 SHA-256만 코드에 둠 (원문은 코드·git에 없음).
//  3) 멱등 — 같은 마이그레이션을 여러 번 실행해도 결과 동일 (재실행 안전).
//  4) 서비스 키는 Vercel env에만 존재 (SUPABASE_SERVICE_KEY_MAIN) — 로컬 유출 없음.
//
// 사용: POST /api/db-migrate  { "name": "<마이그레이션 이름>", "secret": "<실행 시크릿>" }
//       GET  /api/db-migrate  → 사용 가능한 마이그레이션 목록(읽기 전용)

import crypto from 'node:crypto'

const SUPABASE_URL = 'https://vextxqzggznulwpganwt.supabase.co'
// 실행 시크릿의 SHA-256 (2026-07-11 발급 — 원문은 세션 스크래치패드에만 존재)
const RUN_HASH = 'caf15eb418cdefc3faa540a7d44cab390b623e2c55673e77df78ebfca8c19b4c'

function svcHeaders(key, representation = true) {
  return {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: representation ? 'return=representation' : 'return=minimal',
  }
}

// ── 마이그레이션 선언부 ──────────────────────────────────────────
// 각 항목: desc(무엇·왜), enabled, run(key) → { ok, ...결과 }
const MIGRATIONS = {
  // 뉴욕에 잘못 등재돼 있던 실제 뉴저지 교회들 → newjersey 이전
  // 근거: 주소 검증 (475 Grand Ave Englewood Cliffs / 17 W Harwood Ter Palisades Park /
  //       177 Princeton-Hightstown Rd / 100 Rockwood Pl Englewood — 웹 검증 완료)
  'nj-churches-2026-07': {
    desc: '뉴욕 → 뉴저지: 뉴져지지구촌·Englewood Cliff·리버델·즐거운침례·세움 (5곳)',
    enabled: true,
    async run(key) {
      const ids = [
        '5ea2a545-cfce-491e-b511-fe20b08ea373', // 뉴져지지구촌교회
        '7f05830c-929f-45e9-8714-a28d081c6b4c', // Englewood Cliff Korean Baptist Church
        '3e12511a-adeb-4439-884b-b194226981f3', // 리버델교회
        'c553b2ef-df90-4098-95f6-918f8c27d33a', // 즐거운침례교회
        '54e4ffaf-1e17-42ca-a4fd-5625e58ff7ec', // 세움교회
      ]
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/churches?id=in.(${ids.join(',')})`,
        { method: 'PATCH', headers: svcHeaders(key), body: JSON.stringify({ city_slug: 'newjersey' }) }
      )
      const rows = r.ok ? await r.json() : []
      return {
        ok: r.ok, status: r.status, updated: rows.length,
        churches: rows.map(x => ({ name: x.name, city_slug: x.city_slug })),
      }
    },
  },

  // 온누리침례교회(김레오니드 목사) — 주소(251 12th Street)의 NJ 여부 웹 미확정.
  // 목사님이 "뉴저지 맞다" 확인해 주신 경우에만 실행.
  'nj-onnuri-2026-07': {
    desc: '뉴욕 → 뉴저지: 온누리침례교회 (목사님 확인 후에만)',
    enabled: true,
    async run(key) {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/churches?id=eq.1ffba71f-97f5-4014-a696-001af6488bab`,
        { method: 'PATCH', headers: svcHeaders(key), body: JSON.stringify({ city_slug: 'newjersey' }) }
      )
      const rows = r.ok ? await r.json() : []
      return {
        ok: r.ok, status: r.status, updated: rows.length,
        churches: rows.map(x => ({ name: x.name, city_slug: x.city_slug })),
      }
    },
  },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // GET: 목록만 (읽기 전용 — 시크릿 불필요)
  if (req.method === 'GET') {
    return res.status(200).json({
      migrations: Object.entries(MIGRATIONS).map(([name, m]) => ({ name, desc: m.desc, enabled: m.enabled })),
    })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, secret } = req.body || {}
  const hash = crypto.createHash('sha256').update(String(secret || '')).digest('hex')
  if (hash !== RUN_HASH) return res.status(401).json({ error: 'unauthorized' })

  const mig = MIGRATIONS[name]
  if (!mig) return res.status(404).json({ error: `unknown migration: ${name}` })
  if (!mig.enabled) return res.status(410).json({ error: `migration disabled: ${name}` })

  const key = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY
  if (!key) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY not set' })

  try {
    const result = await mig.run(key)
    console.log(`[db-migrate] ${name}:`, JSON.stringify(result))
    return res.status(200).json({ name, desc: mig.desc, ...result })
  } catch (e) {
    console.error(`[db-migrate] ${name} failed:`, e.message)
    return res.status(500).json({ error: e.message })
  }
}

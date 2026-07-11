// api/city-draft.js — City Engine v2: AI 도시 가이드 "초안" 생성 + 검증 처리
//
// 절대 원칙 (Hard Rule):
//  - AI 출력은 항상 status:'draft' — 이 엔드포인트는 어떤 경우에도 발행/스캐폴딩하지 않는다.
//  - verified_at은 사람(그 도시에 살아본 한인)의 검증으로만 채워진다 (action:'verify').
//  - 사실을 지어내지 않도록 프롬프트에서 강제하고, 항목마다 출처를 요구한다.
//
// 사용:
//  POST { token, action:'draft',  nameKo, nameEn, country, rawData?, model? }
//  POST { token, action:'verify', slug, verifiedBy }
//  (token = 관리자 비밀번호 — city-planner.js와 동일한 SHA-256 해시 게이트)

import crypto from 'node:crypto'

const SUPABASE_URL = 'https://vextxqzggznulwpganwt.supabase.co'
const ADMIN_HASH = '614fea13745bbaa53de1c1c36b216c3cd5009df185b9f642089eb7ea76a69b90'
const ALLOWED_MODELS = ['claude-haiku-4-5', 'claude-sonnet-5']

function slugify(nameEn) { return String(nameEn || '').toLowerCase().replace(/[^a-z0-9]/g, '') }

function svcHeaders(key) {
  return { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}`, Prefer: 'return=representation' }
}

async function logStage(key, slug, stage, status, message) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/city_pipeline_logs`, {
      method: 'POST',
      headers: { ...svcHeaders(key), Prefer: 'return=minimal' },
      body: JSON.stringify({ slug, stage, status, message: String(message).slice(0, 500) }),
    })
  } catch (_) { /* 로그 실패는 무시 */ }
}

// ── 검증-우선 프롬프트 (환대 톤·추측 금지) ─────────────────────────
function buildPrompt(nameKo, nameEn, country, rawData) {
  const system = [
    '당신은 HebronGuide의 "도시 가이드 초안 도우미"입니다.',
    'HebronGuide는 "내가 나그네 되었을 때 너희가 영접하였다"(마 25:35)를 따르는',
    '전 세계 한인 디아스포라 환대·교회연결 플랫폼입니다.',
    '',
    "당신의 역할은 '초안'을 만드는 것이지 '사실을 확정'하는 것이 아닙니다.",
    '반드시 지킬 것:',
    '1. 사실을 지어내지 마라(DO NOT invent). 모르면 값을 null로 두고 "[검증필요]"로 표시.',
    '2. 각 항목마다 출처(공식 사이트·정부·한인회 URL)가 있으면 sources에 기록, 없으면 "출처 필요".',
    '3. 톤: 한국어, 따뜻하고 목회적이며 실용적. 짧은 문단. 강요 없이 환대.',
    '4. 정치 중립. 성경적 세계관 필터(생명·가정·이민자 환대·정직·인간 존엄).',
    "5. 이 도시에 '살아본 한인'이 검증할 것을 전제로, 검증하기 쉽게 항목을 구조화.",
    '6. 이모티콘을 사용하지 않는다 (텍스트 라벨만).',
  ].join('\n')

  const user = [
    `도시: ${nameKo} (${nameEn}), 국가: ${country}`,
    `원자료(있으면): ${rawData ? JSON.stringify(rawData).slice(0, 20000) : '없음'}`,
    '',
    '시애틀 표준 구조로 초안 JSON을 생성:',
    '- city_profile (인구·한인인구 추정·타임존·태그 — 추정치는 "추정" 명시)',
    '- living, safety, transport, education_health (확인 필요 사실은 "[검증필요]" 태그)',
    '- churches (교회는 임의 등재 금지 — "현지 한인회/교회 군집 확인 후 등재" 안내만)',
    '- diaspora_tips, mission_points (환대·연결 관점)',
    '- seo (키워드 5~10, meta_title 60자 이내, meta_description 160자 이내)',
    '',
    '각 사실 옆에 sources[] (URL 또는 "출처 필요").',
    '',
    'OUTPUT: 유효한 JSON만. 최상위에 "_status":"draft","_warning":"검증 전 공개 금지" 포함.',
  ].join('\n')

  return { system, user }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { token, action } = req.body || {}
  const hash = crypto.createHash('sha256').update(String(token || '')).digest('hex')
  if (hash !== ADMIN_HASH) return res.status(401).json({ error: 'unauthorized' })

  const key = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY
  if (!key) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY not set (Vercel env)' })

  try {
    // ── 검증 완료 처리 (사람 게이트의 기록) ──────────────────────
    if (action === 'verify') {
      const { slug, verifiedBy } = req.body
      if (!slug || !verifiedBy?.trim()) return res.status(400).json({ error: 'slug와 verifiedBy(검증자 이름)는 필수' })
      const r = await fetch(`${SUPABASE_URL}/rest/v1/city_drafts?slug=eq.${encodeURIComponent(slug)}`, {
        method: 'PATCH', headers: svcHeaders(key),
        body: JSON.stringify({ status: 'verified', verified_by: verifiedBy.trim(), verified_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
      })
      const rows = r.ok ? await r.json() : []
      await logStage(key, slug, 'verify', r.ok && rows.length ? 'ok' : 'error', `verified_by=${verifiedBy}`)
      if (!r.ok || !rows.length) return res.status(500).json({ error: `검증 기록 실패 (HTTP ${r.status})` })
      return res.status(200).json({ ok: true, slug, status: 'verified', verified_by: verifiedBy, message: '검증 완료 — 이제 scaffold-city.mjs로 스캐폴딩 가능 (dry-run 먼저)' })
    }

    // ── AI 초안 생성 (기본 action) ───────────────────────────────
    if (action !== 'draft') return res.status(400).json({ error: `unknown action: ${action}` })

    const { nameKo, nameEn, country, rawData } = req.body
    if (!nameKo?.trim() || !nameEn?.trim() || !country?.trim()) {
      return res.status(400).json({ error: 'nameKo, nameEn, country는 필수' })
    }
    const slug = slugify(nameEn)

    // 이미 verified/published인 초안은 덮어쓰지 않는다 (검증 결과 보호)
    const existing = await fetch(`${SUPABASE_URL}/rest/v1/city_drafts?slug=eq.${slug}&select=slug,status`, { headers: svcHeaders(key) }).then(r => r.ok ? r.json() : [])
    if (existing[0] && ['verified', 'published'].includes(existing[0].status)) {
      return res.status(409).json({ error: `'${slug}'는 이미 ${existing[0].status} 상태 — 덮어쓰기 금지. 필요 시 admin에서 상태 변경 후 재시도.` })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set (Vercel env)' })
    const model = ALLOWED_MODELS.includes(req.body.model) ? req.body.model : 'claude-haiku-4-5'

    const { system, user } = buildPrompt(nameKo, nameEn, country, rawData)
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 4000, system, messages: [{ role: 'user', content: user }] }),
    })
    const aiData = await aiRes.json()
    const raw = aiData?.content?.[0]?.text || ''
    const m = raw.match(/\{[\s\S]*\}/)
    if (!m) {
      await logStage(key, slug, 'draft', 'error', 'AI 응답에서 JSON 파싱 실패')
      return res.status(502).json({ error: 'AI 응답 JSON 파싱 실패', raw: raw.slice(0, 300) })
    }
    let guide
    try { guide = JSON.parse(m[0]) } catch (e) {
      await logStage(key, slug, 'draft', 'error', `JSON.parse 실패: ${e.message}`)
      return res.status(502).json({ error: `JSON 파싱 실패: ${e.message}` })
    }

    // sources 분리 저장 (검증 근거 추적)
    const sources = {}
    for (const [k, v] of Object.entries(guide)) {
      if (v && typeof v === 'object' && Array.isArray(v.sources)) sources[k] = v.sources
    }

    // upsert (draft 상태로만)
    const record = {
      slug, name_ko: nameKo.trim(), name_en: nameEn.trim(), country: country.trim(),
      status: 'draft', guide_json: guide, sources_json: sources, updated_at: new Date().toISOString(),
    }
    const up = await fetch(`${SUPABASE_URL}/rest/v1/city_drafts?on_conflict=slug`, {
      method: 'POST',
      headers: { ...svcHeaders(key), Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(record),
    })
    const saved = up.ok ? await up.json() : []
    await logStage(key, slug, 'draft', up.ok ? 'ok' : 'error', up.ok ? `model=${model}` : `HTTP ${up.status}`)
    if (!up.ok) return res.status(500).json({ error: `초안 저장 실패 (HTTP ${up.status}) — SQL 실행 여부 확인`, detail: saved })

    return res.status(200).json({
      ok: true, slug, status: 'draft', model,
      warning: '초안 — 검증 전 공개 금지. admin-city-drafts.html에서 출처 대조 후 검증하세요.',
      draft: saved[0] || record,
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

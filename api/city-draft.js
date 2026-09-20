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
const ADMIN_HASH = 'c0832739b0def5f86bf059aab9d58cea77ae10391ba45124d5bc4640cd94d119'
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

/* ═══════════════════════════════════════════════════════════
   아래는 2026-09-20 옮겨 심은 것 — 옛 /api/city-reviewer
   12개 함수 한도를 맞추려고 2026-07-09 '미사용'으로 지워졌는데,
   관리자 화면은 계속 그 주소를 부르고 있었다 (404).

   왜 여기인가: 도구를 여러 번 부르는 에이전트라 Node 런타임이 필요하다.
   같은 AI 검수 짝인 content-curator 는 Edge 라 city-planner.js 로 갔지만,
   이것은 Edge 에 들어갈 수 없어 Node 인 이 파일로 왔다.

   ⚠️ Vercel Hobby 의 함수 최대 실행 시간은 60초다. 옛 코드는 120초를
      요구했는데 Hobby 에서는 받아들여지지 않는다. 섹션을 한 번에 하나씩
      돌리는 것이 안전하다 (admin.html 은 section 하나씩 보낸다).

   Cron 자동 실행 경로는 옮기지 않았다 — vercel.json 에 그 cron 이 없다.
   ═══════════════════════════════════════════════════════════ */

const TOOLS = [
  {
    name: 'read_city_data',
    description: '현재 Supabase DB에서 도시의 특정 섹션 데이터를 읽습니다. 변경사항을 비교하기 전에 반드시 현재 데이터를 먼저 읽으세요.',
    input_schema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          enum: ['churches', 'restaurants', 'cafes', 'areas', 'content_reviews'],
          description: '조회할 Supabase 테이블명'
        },
        city_slug: { type: 'string', description: '도시 슬러그 (예: seattle, la, toronto)' },
        limit: { type: 'number', description: '최대 조회 건수 (기본 20)', default: 20 }
      },
      required: ['table', 'city_slug']
    }
  },
  {
    name: 'save_review_proposal',
    description: '발견한 변경사항이나 업데이트 제안을 content_reviews 테이블에 저장합니다. 확실한 변경사항만 저장하세요.',
    input_schema: {
      type: 'object',
      properties: {
        section:        { type: 'string', description: '섹션명 (church, food, settle, explore, job, edu)' },
        type:           { type: 'string', enum: ['update', 'add', 'remove'], description: '변경 유형' },
        title:          { type: 'string', description: '변경 항목 제목 (간결하게)' },
        current_value:  { type: 'string', description: 'DB에 현재 저장된 값' },
        proposed_value: { type: 'string', description: '제안하는 새 값' },
        source:         { type: 'string', description: '정보 출처 (URL 또는 출처명)' },
        confidence:     { type: 'string', enum: ['high', 'medium', 'low'] },
        reason:         { type: 'string', description: '변경이 필요한 이유 (한 줄)' }
      },
      required: ['section', 'type', 'title', 'proposed_value', 'confidence', 'reason']
    }
  },
  {
    name: 'mark_review_complete',
    description: '모든 섹션 검토가 완료됐음을 표시합니다. 더 이상 확인할 것이 없을 때 호출하세요.',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: '이번 리뷰 요약 (한 문장)' },
        total_proposals: { type: 'number', description: '총 제안 건수' }
      },
      required: ['summary', 'total_proposals']
    }
  }
]

// ── Supabase 직접 조회 ──────────────────────────────────────────────
async function sbRead(table, citySlug, limit = 20) {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY
  const url = `${SB_URL}/rest/v1/${table}?city_slug=eq.${encodeURIComponent(citySlug)}&limit=${limit}&order=created_at.desc`
  const res = await fetch(url, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    }
  })
  if (!res.ok) throw new Error(`Supabase 읽기 실패: ${res.status}`)
  return res.json()
}

async function sbWrite(table, rows) {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY
  const res = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(rows)
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase 저장 실패: ${res.status} ${err}`)
  }
  return true
}

// ── 도구 실행 핸들러 ────────────────────────────────────────────────
async function executeTool(toolName, toolInput, citySlug, cityName) {
  switch (toolName) {

    case 'read_city_data': {
      const { table, city_slug, limit } = toolInput
      const slug = city_slug || citySlug
      try {
        const data = await sbRead(table, slug, limit || 20)
        return {
          success: true,
          table,
          city_slug: slug,
          count: data.length,
          data: data.map(r => ({
            id: r.id,
            name: r.name || r.name_en || r.title,
            desc: (r.desc || r.description || '').slice(0, 200),
            phone: r.phone,
            email: r.email,
            website: r.website,
            address: r.address,
            active: r.active,
            tier: r.tier,
          }))
        }
      } catch (e) {
        return { success: false, error: e.message }
      }
    }

    case 'save_review_proposal': {
      const row = {
        city_slug:      citySlug,
        city_name:      cityName,
        section:        toolInput.section,
        type:           toolInput.type || 'update',
        title:          toolInput.title,
        current_value:  toolInput.current_value || '',
        proposed_value: toolInput.proposed_value,
        source:         toolInput.source || '(Claude 분석)',
        confidence:     toolInput.confidence,
        reason:         toolInput.reason,
        status:         'pending',
        created_at:     new Date().toISOString(),
        week:           new Date().toISOString().slice(0, 10),
      }
      try {
        await sbWrite('content_reviews', [row])
        return { success: true, saved: toolInput.title }
      } catch (e) {
        return { success: false, error: e.message }
      }
    }

    case 'mark_review_complete': {
      return {
        success: true,
        done: true,
        summary: toolInput.summary,
        total_proposals: toolInput.total_proposals
      }
    }

    default:
      return { error: `알 수 없는 도구: ${toolName}` }
  }
}

// ── Claude 에이전트 루프 ────────────────────────────────────────────
async function runReviewAgent(citySlug, cityName, sections) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 미설정')

  const systemPrompt = `당신은 HebronGuide 콘텐츠 품질 에이전트입니다.
${cityName} 도시의 한인 이민자 정보를 정확하게 유지하는 것이 임무입니다.

작업 순서:
1. read_city_data 도구로 현재 DB 데이터를 먼저 확인하세요
2. 확인된 데이터와 당신의 최신 지식을 비교하세요
3. 변경이 확실한 항목만 save_review_proposal로 저장하세요
4. 모든 섹션 검토 후 mark_review_complete를 호출하세요

검토할 섹션: ${sections.join(', ')}

중요 원칙:
- 추측 데이터는 절대 저장하지 마세요
- 확실한 정보만 confidence: "high"로 저장
- 불확실하면 저장하지 않는 것이 낫습니다
- 교회 정보는 특히 신중하게 (예배시간, 담임목사 변경 등)
- 응답은 한국어로`

  const messages = [{
    role: 'user',
    content: `${cityName}의 다음 섹션들을 검토해 주세요: ${sections.join(', ')}

먼저 각 섹션의 현재 DB 데이터를 read_city_data로 확인한 후 변경사항을 분석해 주세요.`
  }]

  let totalProposals = 0
  let isDone = false
  let maxIterations = 15  // 무한루프 방지
  let iteration = 0

  while (!isDone && iteration < maxIterations) {
    iteration++

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Claude API 오류: ${response.status} ${err}`)
    }

    const data = await response.json()
    const stopReason = data.stop_reason

    // 어시스턴트 메시지 추가
    messages.push({ role: 'assistant', content: data.content })

    // 종료 조건
    if (stopReason === 'end_turn') {
      isDone = true
      break
    }

    // 도구 호출 처리
    if (stopReason === 'tool_use') {
      const toolResults = []

      for (const block of data.content) {
        if (block.type !== 'tool_use') continue

        const result = await executeTool(block.name, block.input, citySlug, cityName)

        // mark_review_complete 호출 → 종료
        if (block.name === 'mark_review_complete' && result.done) {
          isDone = true
          totalProposals = result.total_proposals || totalProposals
        }

        // save_review_proposal 성공 → 카운트
        if (block.name === 'save_review_proposal' && result.success) {
          totalProposals++
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result)
        })
      }

      // 도구 결과를 메시지에 추가
      messages.push({ role: 'user', content: toolResults })
    }
  }

  return { totalProposals, iterations: iteration }
}

// ── 핸들러 ──────────────────────────────────────────────────────────

/* ── 관리자 출입증 ─────────────────────────────────────────────
   지문(PW_HASH)은 화면 소스에 들어 있어 출입증이 될 수 없다 (2026-09-20).
   화면이 비밀번호를 보내면 서버가 확인하고, 서버만 아는 비밀로 서명한
   시간 제한 출입증을 내준다. 발급은 admin-action.js 의 action:'login'.
   ※ 같은 코드가 네 함수에 복사돼 있다 — 공통 파일을 두면 13번째 함수로
      세어져 배포가 조용히 실패할 위험이 있다 (2026-07 사고 2건).
   ─────────────────────────────────────────────────────────── */
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000   // 12시간

const _hex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')

async function _signingKey() {
  // 서버에만 있는 값에서 서명 키를 만든다. 원래 용도와 섞이지 않게 앞에 표식을 붙인다.
  const base = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY || ''
  if (!base) throw new Error('서명 키 없음: Vercel 환경변수 SUPABASE_SERVICE_KEY_MAIN 확인')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('hebron-admin-session|' + base))
  return crypto.subtle.importKey('raw', digest, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
}

async function issueAdminToken() {
  const exp = Date.now() + TOKEN_TTL_MS
  const sig = _hex(await crypto.subtle.sign('HMAC', await _signingKey(), new TextEncoder().encode(String(exp))))
  return { token: `${exp}.${sig}`, expiresAt: exp }
}

async function validAdminToken(t) {
  // 출입증이 틀린 것과 '서버가 고장난 것'을 섞지 않는다.
  // 서명 키가 없거나 crypto 를 못 쓰면 여기서 던져서 500 으로 나가게 한다.
  // 그걸 401 로 삼키면, 관리자가 못 들어오는 이유를 영영 모른다 (2026-09-20).
  if (typeof t !== 'string' || !t.includes('.')) return false
  const [expStr, sig] = t.split('.')
  const exp = Number(expStr)
  if (!exp || exp < Date.now()) return false
  const want = _hex(await crypto.subtle.sign('HMAC', await _signingKey(), new TextEncoder().encode(expStr)))
  if (!sig || sig.length !== want.length) return false
  let diff = 0
  for (let i = 0; i < want.length; i++) diff |= sig.charCodeAt(i) ^ want.charCodeAt(i)
  return diff === 0
}

async function sha256Hex(s) {
  return _hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s))))
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { token, action } = req.body || {}
  const hash = crypto.createHash('sha256').update(String(token || '')).digest('hex')
  let _authed = false
  try { _authed = await validAdminToken(token) }
  catch (e) { return res.status(500).json({ error: '서버 설정 문제: ' + e.message }) }
  if (!_authed) return res.status(401).json({ error: 'unauthorized' })

  const key = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY
  if (!key) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY not set (Vercel env)' })

  try {
    // ── 검증 완료 처리 (사람 게이트의 기록) ──────────────────────
    // ── action: 'review' — 옛 /api/city-reviewer ──────────────
    //    그 도시의 자료를 AI 가 훑어 '고칠 것 제안'을 DB 에 쌓는다.
    //    사람이 admin.html 리뷰 패널에서 보고 판단한다 — 자동 반영이 아니다.
    if (action === 'review') {
      const { citySlug, cityName } = req.body || {}
      const sections = req.body?.section
        ? [req.body.section]
        : (req.body?.sections || ['church', 'food', 'settle'])
      if (!citySlug || !cityName) {
        return res.status(400).json({ error: 'citySlug, cityName 필수' })
      }
      const { totalProposals, iterations } = await runReviewAgent(citySlug, cityName, sections)
      return res.status(200).json({
        ok: true,
        city: cityName,
        week: new Date().toISOString().slice(0, 10),
        totalProposals,
        iterations,
        message: totalProposals > 0
          ? `${totalProposals}건의 업데이트 제안이 저장됐습니다. admin.html → 리뷰 패널에서 확인하세요.`
          : '변경사항 없음 — DB 데이터와 최신 정보가 일치합니다.',
      })
    }

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

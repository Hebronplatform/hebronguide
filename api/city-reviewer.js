// api/city-reviewer.js — HebronGuide 도시 콘텐츠 리뷰 에이전트 v2
// Claude가 Supabase를 직접 읽고 쓰는 완전 자동화 에이전트
// tool_use 패턴: read_city_data → 비교 → save_review_proposal
// Vercel Cron(GET) 또는 admin.html(POST)에서 호출

export const config = { runtime: 'nodejs', maxDuration: 120 }

const ADMIN_HASH = '614fea13745bbaa53de1c1c36b216c3cd5009df185b9f642089eb7ea76a69b90'
const SB_URL     = 'https://vextxqzggznulwpganwt.supabase.co'
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// ── Claude에게 줄 도구 정의 ──────────────────────────────────────────
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
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS)
    res.end()
    return
  }

  // Vercel Cron 자동 실행 (GET)
  const isCron = req.headers['authorization'] === `Bearer ${process.env.CRON_SECRET}`
  let citySlug, cityName, sections, token

  if (req.method === 'GET' && isCron) {
    const WEEKLY_CITIES = [
      { slug: 'seattle',  name: '시애틀 Seattle' },
      { slug: 'dallas',   name: '달라스 Dallas' },
      { slug: 'la',       name: '로스앤젤레스 LA' },
      { slug: 'toronto',  name: '토론토 Toronto' },
      { slug: 'newyork',  name: '뉴욕 New York' },
      { slug: 'houston',  name: '휴스턴 Houston' },
      { slug: 'chicago',  name: '시카고 Chicago' },
      { slug: 'vancouver', name: '밴쿠버 Vancouver' },
    ]
    const weekIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % WEEKLY_CITIES.length
    const city = WEEKLY_CITIES[weekIndex]
    citySlug = city.slug
    cityName = city.name
    sections = ['church', 'food', 'settle']  // Cron은 핵심 3개만
    token = ADMIN_HASH

  } else if (req.method === 'POST') {
    let body = {}
    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      body = JSON.parse(Buffer.concat(chunks).toString())
    } catch {}

    citySlug  = body.citySlug
    cityName  = body.cityName
    sections  = body.section ? [body.section] : (body.sections || ['church', 'food', 'settle'])
    token     = body.token

    if (!token || token !== ADMIN_HASH) {
      res.writeHead(401, CORS)
      res.end(JSON.stringify({ error: '인증 실패' }))
      return
    }
  } else {
    res.writeHead(405, CORS)
    res.end('Method not allowed')
    return
  }

  if (!citySlug || !cityName) {
    res.writeHead(400, CORS)
    res.end(JSON.stringify({ error: 'citySlug, cityName 필수' }))
    return
  }

  try {
    const { totalProposals, iterations } = await runReviewAgent(citySlug, cityName, sections)

    res.writeHead(200, CORS)
    res.end(JSON.stringify({
      ok: true,
      city: cityName,
      week: new Date().toISOString().slice(0, 10),
      totalProposals,
      iterations,
      message: totalProposals > 0
        ? `${totalProposals}건의 업데이트 제안이 저장됐습니다. admin.html → 리뷰 패널에서 확인하세요.`
        : `변경사항 없음 — DB 데이터와 최신 정보가 일치합니다.`,
    }))

  } catch (e) {
    console.error('city-reviewer error:', e)
    res.writeHead(500, CORS)
    res.end(JSON.stringify({ error: e.message }))
  }
}

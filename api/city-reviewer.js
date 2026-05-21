// api/city-reviewer.js — HebronGuide 주간 도시 콘텐츠 리뷰 에이전트
// Vercel Cron 또는 admin.html에서 수동 호출
// 각 도시의 정보를 Claude가 점검 → 변경사항 Supabase content_reviews 테이블에 저장
// 관리자가 admin.html에서 검토·승인 → 자동 반영

export const config = { runtime: 'edge' }

const ADMIN_HASH = '614fea13745bbaa53de1c1c36b216c3cd5009df185b9f642089eb7ea76a69b90'
const SB_URL     = 'https://vextxqzggznulwpganwt.supabase.co'
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// 도시별 점검 항목 체크리스트
const REVIEW_CHECKLIST = {
  settle: [
    '비자 수수료 또는 처리기간 변경',
    '건강보험 정책 업데이트',
    '은행 한인 지점 변화',
    '정부기관 연락처·주소 변경',
  ],
  food: [
    '폐업 또는 신규 오픈 식당',
    '평점 4.0 이상 새 맛집',
    '영업시간·주소 변경',
  ],
  church: [
    '예배시간 변경',
    '담임목사 교체',
    '신규 한인 교회',
    '교회 연락처·주소 변경',
  ],
  explore: [
    '입장료 변경',
    '임시 휴관·폐관',
    '신규 명소·문화 행사',
  ],
  job: [
    '비자 취업 정책 변화 (H-1B 등)',
    '한인 채용 정보 업데이트',
  ],
  edu: [
    '한국학교 등록 기간',
    '학원·어학원 수업료 변동',
  ],
}

async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
      system: `당신은 HebronGuide 콘텐츠 리뷰 에이전트입니다.
한인 이민자를 위한 도시 정보의 변경사항을 점검합니다.
반드시 JSON 배열만 반환하세요. 변경사항이 없으면 빈 배열 []을 반환하세요.
추측 데이터는 절대 포함하지 마세요.`,
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text ?? '[]'
}

async function sbRequest(path, method, body, serviceKey) {
  const res = await fetch(`${SB_URL}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  // Vercel Cron은 Authorization 헤더로 호출
  const isCron = req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`
  let citySlug, cityName, sections, token

  if (req.method === 'GET' && isCron) {
    // 자동 실행 — 주요 도시 순환
    const WEEKLY_CITIES = [
      { slug: 'seattle', name: '시애틀 Seattle' },
      { slug: 'dallas', name: '달라스 Dallas' },
      { slug: 'houston', name: '휴스턴 Houston' },
      { slug: 'la', name: '로스앤젤레스 LA' },
      { slug: 'newyork', name: '뉴욕 New York' },
      { slug: 'chicago', name: '시카고 Chicago' },
      { slug: 'toronto', name: '토론토 Toronto' },
      { slug: 'sydney', name: '시드니 Sydney' },
    ]
    // 이번 주 순서 (요일 기반 순환)
    const weekIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % WEEKLY_CITIES.length
    const city = WEEKLY_CITIES[weekIndex]
    citySlug = city.slug
    cityName = city.name
    sections = Object.keys(REVIEW_CHECKLIST)
    token = ADMIN_HASH
  } else if (req.method === 'POST') {
    const body = await req.json()
    citySlug  = body.citySlug
    cityName  = body.cityName
    sections  = body.sections || Object.keys(REVIEW_CHECKLIST)
    token     = body.token
    if (!token || token !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: '인증 실패' }), { status: 401, headers: CORS })
    }
  } else {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  if (!citySlug || !cityName) {
    return new Response(JSON.stringify({ error: 'citySlug, cityName 필수' }), { status: 400, headers: CORS })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  if (!serviceKey) {
    return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_KEY 미설정' }), { status: 500, headers: CORS })
  }

  const results = {}
  let totalProposed = 0

  for (const section of sections) {
    const checklist = REVIEW_CHECKLIST[section]
    if (!checklist) continue

    try {
      const prompt = `
${cityName}의 한인 이민자를 위한 HebronGuide ${section} 섹션을 점검합니다.
현재 날짜 기준으로 다음 항목들의 변경사항을 웹에서 조사하세요:
${checklist.map((c, i) => `${i+1}. ${c}`).join('\n')}

변경사항이 있으면 JSON 배열로 반환하세요:
[
  {
    "type": "update|add|remove",
    "category": "${section}",
    "title": "변경 항목 제목",
    "current": "현재 HebronGuide에 있는 정보 (추정)",
    "proposed": "새로운 정보 또는 수정 내용",
    "source": "출처 URL 또는 출처명",
    "confidence": "high|medium|low",
    "reason": "변경 이유 한 줄"
  }
]

변경사항이 없으면 [] 반환.
`
      const raw = await callClaude(prompt)
      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      const proposals = jsonMatch ? JSON.parse(jsonMatch[0]) : []

      if (proposals.length > 0) {
        // Supabase에 검토 대기 항목으로 저장
        const rows = proposals.map(p => ({
          city_slug: citySlug,
          city_name: cityName,
          section,
          type: p.type || 'update',
          title: p.title || '',
          current_value: p.current || '',
          proposed_value: p.proposed || '',
          source: p.source || '',
          confidence: p.confidence || 'medium',
          reason: p.reason || '',
          status: 'pending',
          created_at: new Date().toISOString(),
          week: new Date().toISOString().slice(0, 10),
        }))

        await sbRequest('/content_reviews', 'POST', rows, serviceKey)
        totalProposed += proposals.length
      }

      results[section] = { proposed: proposals.length }
    } catch (e) {
      results[section] = { error: e.message }
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    city: cityName,
    week: new Date().toISOString().slice(0, 10),
    totalProposed,
    results,
    message: totalProposed > 0
      ? `${totalProposed}건의 업데이트 제안이 있습니다. admin.html 리뷰 패널에서 확인하세요.`
      : '이번 주 변경사항이 없습니다.',
  }), { headers: CORS })
}

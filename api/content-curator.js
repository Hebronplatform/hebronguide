// api/content-curator.js — HebronGuide AI 자동 콘텐츠 큐레이터
// Claude가 도시별 각 섹션 정보를 자동 조사 → Supabase 저장 → 관리자 승인 후 앱 반영
// Vercel Edge Function

export const config = { runtime: 'edge' }

const ADMIN_HASH = '614fea13745bbaa53de1c1c36b216c3cd5009df185b9f642089eb7ea76a69b90'
const SB_URL     = 'https://vextxqzggznulwpganwt.supabase.co'
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// 섹션별 조사 프롬프트
const SECTION_PROMPTS = {
  settle: (city, lang) => `
당신은 ${city} 거주 한인 이민자를 위한 정착 정보 전문가입니다.
다음을 한국어와 영어로 조사해 JSON 배열로 반환하세요 (각 5개):

1. 비자·체류 관련 주요 기관 (이름, 주소, 전화, 웹사이트, 설명)
2. 건강보험 가입 방법 (기관명, 연락처, 팁)
3. 은행 개설 추천 (은행명, 한인 지점 여부, 특이사항)
4. 초기 정착 필수 앱 3가지

반환 형식:
[{"category":"visa|health|bank|app","nameKo":"...","nameEn":"...","address":"...","phone":"...","website":"...","descKo":"...","descEn":"...","tip":"..."}]
`,

  food: (city, lang) => `
당신은 ${city} 음식 전문가입니다.
구글·옐프에서 4.0 이상 평점을 받은 한인 음식점과 현지 인기 식당을 조사해 JSON으로 반환하세요 (10개):

반환 형식:
[{"rank":1,"emoji":"🍖","nameKo":"...","nameEn":"...","address":"...","phone":"...","hours":"...","rating":4.5,"ratingCount":"300+","why":"한인 이민자에게 추천하는 이유 2-3문장","tip":"방문 팁","website":"..."}]
`,

  church: (city, lang) => `
당신은 ${city} 한인 교회 정보 전문가입니다.
${city}의 한인 교회를 조사해 JSON으로 반환하세요 (5개):

반환 형식:
[{"nameKo":"...","nameEn":"...","address":"...","phone":"...","website":"...","pastor":"...","descKo":"교회 특징","denominationKo":"교단"}]
`,

  explore: (city, lang) => `
당신은 ${city} 관광·문화 전문가입니다.
한인 이민자가 꼭 가봐야 할 명소·문화 장소를 조사해 JSON으로 반환하세요 (10개):

반환 형식:
[{"rank":1,"emoji":"🏛️","nameKo":"...","nameEn":"...","address":"...","hours":"...","price":"...","descKo":"설명","tip":"팁","website":"..."}]
`,

  job: (city, lang) => `
당신은 ${city} 한인 취업 전문가입니다.
한인 이민자의 취업을 돕는 기관·리소스를 조사해 JSON으로 반환하세요 (5개):

반환 형식:
[{"nameKo":"...","nameEn":"...","website":"...","descKo":"설명","tip":"팁"}]
`,

  edu: (city, lang) => `
당신은 ${city} 교육 전문가입니다.
한인 이민자 자녀를 위한 학교·어학원·교육 기관을 조사해 JSON으로 반환하세요 (5개):

반환 형식:
[{"nameKo":"...","nameEn":"...","address":"...","phone":"...","website":"...","descKo":"설명","ageRange":"대상 연령","cost":"비용"}]
`,
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
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
      system: '당신은 HebronGuide AI 큐레이터입니다. 요청된 정보를 정확하고 검증 가능한 JSON 형식으로만 반환하세요. 추측 데이터는 절대 포함하지 마세요. JSON 배열만 반환하고 다른 텍스트는 쓰지 마세요.',
    }),
  })
  const data = await res.json()
  return data.content?.[0]?.text ?? '[]'
}

async function saveToSupabase(items, citySlug, section, serviceKey) {
  const rows = items.map(item => ({
    city_slug: citySlug,
    category: section,
    name: item.nameKo || item.nameEn || '',
    pastor: item.pastor || item.nameEn || '',
    phone: item.phone || '',
    email: '',
    website: item.website || '',
    description: JSON.stringify(item),
    status: 'pending',  // 관리자 승인 대기
    created_at: new Date().toISOString(),
  }))

  const res = await fetch(`${SB_URL}/rest/v1/community_items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(rows),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase 저장 실패: ${err}`)
  }
  return rows.length
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  try {
    const { city, citySlug, section, token } = await req.json()

    // ── 인증 ──────────────────────────────────────────────────
    if (!token || token !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: '인증 실패' }), { status: 401, headers: CORS })
    }

    if (!city || !citySlug || !section) {
      return new Response(JSON.stringify({ error: 'city, citySlug, section 필수' }), { status: 400, headers: CORS })
    }

    const SECTIONS = ['settle', 'food', 'church', 'explore', 'job', 'edu']
    if (!SECTIONS.includes(section) && section !== 'all') {
      return new Response(JSON.stringify({ error: `섹션은 ${SECTIONS.join('|')}|all 중 하나` }), { status: 400, headers: CORS })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_KEY
    if (!serviceKey) {
      return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_KEY 미설정' }), { status: 500, headers: CORS })
    }

    // ── 단일 섹션 또는 전체 조사 ──────────────────────────────
    const targets = section === 'all' ? SECTIONS : [section]
    const results = {}

    for (const sec of targets) {
      try {
        const promptFn = SECTION_PROMPTS[sec]
        if (!promptFn) continue

        const prompt = promptFn(city, 'ko')
        const raw = await callClaude(prompt)

        // JSON 파싱
        const jsonMatch = raw.match(/\[[\s\S]*\]/)
        const items = jsonMatch ? JSON.parse(jsonMatch[0]) : []

        // Supabase 저장
        const saved = await saveToSupabase(items, citySlug, sec, serviceKey)
        results[sec] = { items: items.length, saved, status: 'pending' }

      } catch (e) {
        results[sec] = { error: e.message }
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      city,
      citySlug,
      results,
      message: `조사 완료. admin.html에서 검토·승인 후 앱에 반영됩니다.`
    }), { headers: CORS })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS })
  }
}

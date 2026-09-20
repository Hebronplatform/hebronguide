// api/city-planner.js — Hebron Global Diaspora Planner
// Claude에게 500도시 전략 프레임워크를 시스템 프롬프트로 주입하여
// 관리자의 도시 확장 전략 질문에 답변

export const config = { runtime: 'edge' }

const ADMIN_HASH = 'c0832739b0def5f86bf059aab9d58cea77ae10391ba45124d5bc4640cd94d119'
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

const SYSTEM_PROMPT = `You are "Hebron Global Diaspora Planner," an AI system whose mission is to design, structure, and expand the world's first global diaspora-based hospitality mission platform.

PLATFORM CONTEXT:
- HebronGuide (hebronguide.com) currently serves 81 cities worldwide
- Mission: 500 global cities by 2030 through Korean diaspora–based hospitality mission
- Core verse: "I was a stranger and you welcomed me." — Matthew 25:35
- Servant leadership (Mark 10:45) is the organizational DNA

CORE MISSIONAL PHILOSOPHY:
1. The Korean diaspora is both a mission field and a mission force.
2. Cities are not geographic units but spiritual, cultural, economic, and relational ecosystems.
3. Hospitality (welcoming, serving, connecting) is the primary missional posture.
4. Hebron's role is to map, empower, and mobilize diaspora communities to bless their cities.

TIER CLASSIFICATION:
- Tier 1 (Global Hubs, ~81 cities): Korean population 50,000+ OR global influence score 5
- Tier 2 (Regional Hubs, ~81 cities): Korean population 10,000–50,000
- Tier 3 (Strategic Growth, ~81 cities): Korean population 3,000–10,000
- Tier 4 (Pioneering, ~81 cities): Korean population <3,000

Classification logic:
IF est_korean_population >= 50000 OR economic_influence_score >= 5 THEN Tier 1
ELSE IF est_korean_population >= 10000 THEN Tier 2
ELSE IF est_korean_population >= 3000 THEN Tier 3
ELSE Tier 4

MASTER DATABASE SCHEMA (use for all city outputs):
- continent, country, iso_country_code, city, metro_name
- tier (1–4)
- metro_population (Est. allowed)
- est_korean_population (Est. allowed)
- est_korean_ratio (Est. allowed)
- diaspora_significance_score (1–5)
- hospitality_potential_score (1–5)
- economic_influence_score (1–5)
- migration_hub_score (1–5)
- airport_hub (Yes/No + notes)
- universities_presence (Yes/No + notes)
- local_church_presence (Yes/No + notes)
- notes_missional
- data_confidence_level (High / Medium / Low)

HOSPITALITY MISSION STRATEGY:
1. Korean Home Hospitality — families welcoming neighbors, students, migrants
2. Campus Hospitality — serving international students, researchers, scholars
3. Workplace Hospitality — professional networks, business owners
4. Church-based Hospitality — local church + Korean church collaboration
5. Digital Hospitality — HebronGuide, HebronHome, HebronLingua platforms

Per Tier emphasis:
- Tier 1: All five elements (Digital + Workplace + Campus emphasis)
- Tier 2: Home + Church + Campus
- Tier 3: Home + Campus + Digital
- Tier 4: Home + Church (pioneering focus)

2030 ROADMAP:
2025: 81 cities → 2026: 100 → 2027: 200 → 2028: 300 → 2029: 400 → 2030: 500

OUTPUT RULES:
- Always use "Est." for estimated data
- Never fabricate precise statistics without basis
- Present tables when listing multiple cities
- Provide JSON format when requested by developer
- Balance continental representation in city recommendations
- Maintain theological seriousness — this is a mission, not just a business
- Respond in Korean unless explicitly asked for English
- Be concise and structured; avoid unnecessary verbosity`

/* ═══════════════════════════════════════════════════════════
   아래는 2026-09-20 옮겨 심은 것 — 옛 /api/content-curator
   12개 함수 한도를 맞추려고 2026-07-09 '미사용'으로 지워졌는데,
   관리자 화면은 계속 그 주소를 부르고 있었다 (404).
   Edge 런타임·같은 AI 키·같은 관리자 지문이라 이 파일이 제자리다.
   ═══════════════════════════════════════════════════════════ */

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
    const payload = await req.json()
    const { action, question, token, history = [] } = payload

    if (!token || token !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: '인증 실패' }), { status: 401, headers: CORS })
    }

    // ── action: 'curate' — 옛 /api/content-curator ────────────
    if (action === 'curate') {
      const { city, citySlug, section } = payload
  
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
    }

    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: '질문을 입력해 주세요' }), { status: 400, headers: CORS })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY 미설정' }), { status: 500, headers: CORS })
    }

    // 대화 히스토리 + 현재 질문 구성
    const messages = [
      ...history.slice(-6),  // 최근 6턴 유지
      { role: 'user', content: question }
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Claude API 오류 (${response.status}): ${err}`)
    }

    const data = await response.json()
    const answer = data.content?.[0]?.text ?? ''

    return new Response(JSON.stringify({
      ok: true,
      answer,
      model: data.model,
      usage: data.usage,
    }), { headers: CORS })

  } catch (e) {
    console.error('city-planner error:', e)
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS })
  }
}

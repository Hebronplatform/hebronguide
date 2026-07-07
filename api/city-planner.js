// api/city-planner.js — Hebron Global Diaspora Planner
// Claude에게 500도시 전략 프레임워크를 시스템 프롬프트로 주입하여
// 관리자의 도시 확장 전략 질문에 답변

export const config = { runtime: 'edge' }

const ADMIN_HASH = '614fea13745bbaa53de1c1c36b216c3cd5009df185b9f642089eb7ea76a69b90'
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

const SYSTEM_PROMPT = `You are "Hebron Global Diaspora Planner," an AI system whose mission is to design, structure, and expand the world's first global diaspora-based hospitality mission platform.

PLATFORM CONTEXT:
- HebronGuide (hebronguide.com) currently serves 77 cities worldwide
- Mission: 500 global cities by 2030 through Korean diaspora–based hospitality mission
- Core verse: "I was a stranger and you welcomed me." — Matthew 25:35
- Servant leadership (Mark 10:45) is the organizational DNA

CORE MISSIONAL PHILOSOPHY:
1. The Korean diaspora is both a mission field and a mission force.
2. Cities are not geographic units but spiritual, cultural, economic, and relational ecosystems.
3. Hospitality (welcoming, serving, connecting) is the primary missional posture.
4. Hebron's role is to map, empower, and mobilize diaspora communities to bless their cities.

TIER CLASSIFICATION:
- Tier 1 (Global Hubs, ~50 cities): Korean population 50,000+ OR global influence score 5
- Tier 2 (Regional Hubs, ~150 cities): Korean population 10,000–50,000
- Tier 3 (Strategic Growth, ~200 cities): Korean population 3,000–10,000
- Tier 4 (Pioneering, ~100 cities): Korean population <3,000

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
2025: 77 cities → 2026: 100 → 2027: 200 → 2028: 300 → 2029: 400 → 2030: 500

OUTPUT RULES:
- Always use "Est." for estimated data
- Never fabricate precise statistics without basis
- Present tables when listing multiple cities
- Provide JSON format when requested by developer
- Balance continental representation in city recommendations
- Maintain theological seriousness — this is a mission, not just a business
- Respond in Korean unless explicitly asked for English
- Be concise and structured; avoid unnecessary verbosity`

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  try {
    const { question, token, history = [] } = await req.json()

    if (!token || token !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: '인증 실패' }), { status: 401, headers: CORS })
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

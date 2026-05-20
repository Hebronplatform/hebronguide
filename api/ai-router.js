// api/ai-router.js — HebronGuide AI Tier 1/2/3 Router
// Vercel Edge Function
// Tier 1: <100ms  (Haiku + KV 캐시, 단순 조회)
// Tier 2: 1-2s    (Sonnet streaming, 정착 상담)
// Tier 3: async   (Opus, 사역 인사이트)

export const config = { runtime: 'edge' }

// ── CORS 헤더 ────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

// ── Tier 판별 패턴 ──────────────────────────────────────────
const TIER1_PATTERNS = [
  /^(교회|church|식당|food|병원|hospital|은행|bank)\s*(어디|where|찾아|find)/i,
  /^(비자|visa|건강보험|health\s*insurance)\s*(뭐|what|어떻게|how)/i,
  /^top\s*5/i,
  /^(오늘|today|이번\s*주|this\s*week)\s*(뭐|what)/i,
  /^(주소|address|전화|phone|몇\s*시|hours)/i,
]

const TIER3_PATTERNS = [
  /(목사|pastor|사역|ministry)\s*(인사이트|insight|분석|data)/i,
  /커뮤니티\s*(분석|데이터|통계)/i,
  /(이민|immigration)\s*(전략|plan|계획)/i,
]

function detectTier(question) {
  if (TIER1_PATTERNS.some(p => p.test(question))) return 'tier1'
  if (TIER3_PATTERNS.some(p => p.test(question))) return 'tier3'
  return 'tier2'
}

// ── 카테고리 분류 (로그용) ──────────────────────────────────
function detectCategory(question) {
  if (/(교회|church|예배|worship)/i.test(question)) return 'church'
  if (/(비자|visa|체류|immigration|영주권|green\s*card)/i.test(question)) return 'visa'
  if (/(식당|food|맛집|restaurant|먹)/i.test(question)) return 'food'
  if (/(취업|job|일자리|work|직장)/i.test(question)) return 'job'
  if (/(도움|help|긴급|emergency|상담)/i.test(question)) return 'help'
  if (/(학교|school|어학원|education|영어)/i.test(question)) return 'education'
  if (/(집|주거|rent|apartment|housing)/i.test(question)) return 'housing'
  if (/(건강|health|병원|hospital|보험)/i.test(question)) return 'health'
  return 'general'
}

// ── 시스템 프롬프트 빌더 ─────────────────────────────────────
function buildSystemPrompt(tier, cityName, lang) {
  const base = `당신은 HebronGuide 도우미입니다. ${cityName}에 사는 한인 이주자를 위해 정확하고 따뜻하게 답변합니다.
언어: ${lang === 'en' ? '영어로 답변하세요' : '한국어로 답변하세요 (영어 병기 선택)'}
사명: 이민자들이 새 땅에서 하나님과 동행하도록 돕는 디지털 환대 (마태복음 25:35)
원칙: 검증된 정보만 제공. 불확실하면 "직접 확인을 권장합니다"라고 말하세요.`

  if (tier === 'tier1') {
    return `${base}
답변 형식: 최대 2문장. 핵심 정보만. 출처 한 줄.`
  }
  if (tier === 'tier2') {
    return `${base}
답변 형식: 번호 리스트 (최대 5개). 각 항목 1-2줄. 마지막에 공식 출처 링크.`
  }
  return `${base}
답변 형식: 상세 분석. 실행 가능한 제안 포함.`
}

// ── Tier1 핸들러 (Edge + 캐시) ──────────────────────────────
async function handleTier1(systemPrompt, userMessage, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Tier1 Anthropic error:', err)
    return null
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? null
}

// ── Tier2 핸들러 (Sonnet, 스트리밍) ─────────────────────────
async function handleTier2(systemPrompt, userMessage, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Tier2 Anthropic error:', err)
    return null
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? null
}

// ── Tier3 핸들러 (Opus, 비동기 큐) ──────────────────────────
// Note: 실제 배포 시 Vercel Queue 또는 Supabase Edge Function으로 위임
async function handleTier3(systemPrompt, userMessage, apiKey) {
  // Tier3는 pastor-insights.js로 위임 (별도 인증 필요)
  // 여기서는 간단한 Opus 호출 (짧은 응답)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Tier3 Anthropic error:', err)
    return null
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? null
}

// ── Supabase 로그 기록 ───────────────────────────────────────
async function logQuery(citySlug, question, tier, category, lang) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return

  try {
    await fetch(`${supabaseUrl}/rest/v1/ai_query_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        city_slug: citySlug || 'unknown',
        question: question.slice(0, 200), // 200자 제한
        tier: parseInt(tier.replace('tier', '')),
        category,
        lang,
      }),
    })
  } catch (e) {
    // 로그 실패는 무시 (AI 응답 차단 안 함)
    console.warn('Log write failed:', e.message)
  }
}

// ── 메인 핸들러 ──────────────────────────────────────────────
export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({
      reply: '안녕하세요! AI 컨시어지가 곧 활성화됩니다. 지금은 아래 정착 가이드를 이용해 주세요. · AI concierge coming soon.',
      fallback: true,
    }), { headers: CORS })
  }

  try {
    const { userMessage, systemPrompt: customSystem, city, cityName, lang = 'ko' } = await req.json()

    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'userMessage is required' }), { status: 400, headers: CORS })
    }

    // 1. Tier 결정
    const tier = detectTier(userMessage)
    const category = detectCategory(userMessage)
    const name = cityName || city || '이 도시'

    // 2. 시스템 프롬프트 (커스텀 또는 자동 생성)
    const systemMsg = customSystem || buildSystemPrompt(tier, name, lang)

    // 3. Tier별 처리
    let reply = null
    if (tier === 'tier1') {
      reply = await handleTier1(systemMsg, userMessage, apiKey)
    } else if (tier === 'tier3') {
      reply = await handleTier3(systemMsg, userMessage, apiKey)
    } else {
      reply = await handleTier2(systemMsg, userMessage, apiKey)
    }

    if (!reply) {
      return new Response(JSON.stringify({
        reply: '잠시 후 다시 시도해 주세요. / Please try again shortly.',
        tier,
      }), { headers: CORS })
    }

    // 4. 비동기 로그 기록 (응답 차단 안 함)
    logQuery(city, userMessage, tier, category, lang)

    return new Response(JSON.stringify({ reply, tier, category }), { headers: CORS })

  } catch (err) {
    console.error('ai-router error:', err)
    return new Response(JSON.stringify({
      reply: '잠시 후 다시 시도해 주세요. / Please try again shortly.',
    }), { status: 500, headers: CORS })
  }
}

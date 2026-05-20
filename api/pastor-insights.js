// api/pastor-insights.js — HebronGuide 사역 인사이트 분석
// Vercel Edge Function — fetch() 직접 사용 (npm 의존성 없음)
// Tier 3: Claude Opus — 목사 파트너 전용 (인증 필요)

export const config = { runtime: 'edge' }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

// ── Supabase 헬퍼 ────────────────────────────────────────────
async function supabaseRequest(path, method = 'GET', body = null) {
  const url = `${process.env.SUPABASE_URL}/rest/v1${path}`
  const headers = {
    'Content-Type': 'application/json',
    'apikey': process.env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  }

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase ${method} ${path}: ${err}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// ── 사용자 인증 확인 ─────────────────────────────────────────
async function verifyPastorAuth(token) {
  if (!token) return null

  // Supabase JWT 검증
  const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!res.ok) return null
  const user = await res.json()

  // pastor_partners 테이블에서 verified 확인
  try {
    const partners = await supabaseRequest(
      `/pastor_partners?email=eq.${encodeURIComponent(user.email)}&verified=eq.true&select=id,city_slug,tier`
    )
    return partners?.[0] ? { ...user, partner: partners[0] } : null
  } catch {
    return null
  }
}

// ── 질의 로그 집계 ───────────────────────────────────────────
async function fetchQueryLogs(citySlug, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  try {
    const logs = await supabaseRequest(
      `/ai_query_logs?city_slug=eq.${citySlug}&created_at=gte.${since}&select=question,tier,category,lang,created_at`
    )
    return logs || []
  } catch {
    return []
  }
}

// ── 카테고리별 집계 ──────────────────────────────────────────
function aggregateCategories(logs) {
  return logs.reduce((acc, log) => {
    const cat = log.category || 'general'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})
}

// ── 상위 키워드 추출 (비식별화) ──────────────────────────────
function extractTopKeywords(logs, limit = 5) {
  const freq = {}
  logs.forEach(log => {
    const keywords = (log.question || '').match(/[가-힣a-zA-Z]{2,}/g) || []
    keywords.forEach(k => {
      // 민감 정보 필터링
      if (/이름|name|email|전화|phone|주민/i.test(k)) return
      freq[k] = (freq[k] || 0) + 1
    })
  })

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, v]) => `"${k}" (${v}건)`)
}

// ── Tier 분포 계산 ────────────────────────────────────────────
function getTierDistribution(logs) {
  const dist = { 1: 0, 2: 0, 3: 0 }
  logs.forEach(log => { if (log.tier) dist[log.tier]++ })
  return dist
}

// ── AI 인사이트 프롬프트 ─────────────────────────────────────
function buildInsightsPrompt(city, categoryCounts, topKeywords, tierDist, totalCount, period) {
  const categoryList = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `  - ${k}: ${v}건 (${Math.round(v / totalCount * 100)}%)`)
    .join('\n')

  return `당신은 HebronGuide 사역 분석가입니다. 아래 ${city} 도시의 ${period} 사용 데이터를 분석하여
목사님과 사역자에게 실질적인 인사이트를 제공해주세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ${city} HebronGuide 사용 현황 (${period})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

총 AI 질의 수: ${totalCount}건
AI 활용 단계별:
  - Tier1 (단순 조회): ${tierDist[1]}건
  - Tier2 (상담·안내): ${tierDist[2]}건
  - Tier3 (복합 분석): ${tierDist[3]}건

주요 관심 카테고리:
${categoryList}

자주 등장하는 키워드 TOP5 (비식별화):
${topKeywords.map((k, i) => `  ${i + 1}. ${k}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

위 데이터를 바탕으로 다음 3가지를 작성해주세요:

1. **이번 달 이 도시 한인 이주자들의 가장 큰 필요(needs) 3가지**
   - 데이터가 말해주는 구체적 필요를 서술해주세요

2. **목사·사역자가 이번 달 집중해야 할 사역 영역**
   - 데이터 기반 우선순위 2-3가지

3. **막10:45 "섬기러 오심" 관점의 실천 제안**
   - 한인 교회가 즉시 실행할 수 있는 환대·섬김 아이디어 2가지

답변은 한국어로, 목사님이 이해하기 쉽게 간결하고 따뜻하게 작성해주세요.
분량: 400-600자 내외`
}

// ── 캐시 저장 ────────────────────────────────────────────────
async function saveInsightsCache(citySlug, period, insightsData) {
  try {
    await supabaseRequest('/pastor_insights_cache', 'POST', {
      city_slug: citySlug,
      period,
      insights_json: insightsData,
      generated_at: new Date().toISOString(),
    })
  } catch (e) {
    console.warn('Cache save failed:', e.message)
  }
}

// ── 캐시 조회 ────────────────────────────────────────────────
async function loadInsightsCache(citySlug, period) {
  try {
    const cache = await supabaseRequest(
      `/pastor_insights_cache?city_slug=eq.${citySlug}&period=eq.${period}&select=insights_json,generated_at&order=generated_at.desc&limit=1`
    )
    return cache?.[0] || null
  } catch {
    return null
  }
}

// ── 메인 핸들러 ──────────────────────────────────────────────
export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  const supabaseUrl = process.env.SUPABASE_URL
  if (!apiKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: CORS })
  }

  // 1. 인증 확인
  const token = req.headers.get?.('authorization')?.split(' ')[1] ||
    req.headers?.authorization?.split(' ')[1]

  const user = await verifyPastorAuth(token)
  if (!user) {
    return new Response(JSON.stringify({ error: '인증이 필요합니다. 목사 파트너 계정으로 로그인해주세요.' }), {
      status: 401, headers: CORS
    })
  }

  try {
    const { city, refresh = false } = await req.json()
    const citySlug = city || user.partner?.city_slug || 'unknown'
    const period = new Date().toISOString().slice(0, 7) // "2026-05"

    // 2. 캐시 확인 (refresh=false 이고 오늘 이후 캐시 있으면 반환)
    if (!refresh) {
      const cached = await loadInsightsCache(citySlug, period)
      if (cached) {
        return new Response(JSON.stringify({
          ...cached.insights_json,
          cached: true,
          generatedAt: cached.generated_at,
        }), { headers: CORS })
      }
    }

    // 3. 최근 30일 질의 로그 조회
    const logs = await fetchQueryLogs(citySlug, 30)
    const totalCount = logs.length

    if (totalCount === 0) {
      return new Response(JSON.stringify({
        summary: `${citySlug} 도시에 아직 AI 질의 데이터가 없습니다. HebronGuide가 더 많이 사용되면 풍부한 인사이트를 제공할 수 있습니다.`,
        categoryCounts: {},
        topKeywords: [],
        totalQueries: 0,
        period,
      }), { headers: CORS })
    }

    // 4. 데이터 집계
    const categoryCounts = aggregateCategories(logs)
    const topKeywords = extractTopKeywords(logs, 5)
    const tierDist = getTierDistribution(logs)

    // 5. Claude Opus 분석
    const prompt = buildInsightsPrompt(citySlug, categoryCounts, topKeywords, tierDist, totalCount, period)

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text()
      console.error('Opus API error:', err)
      return new Response(JSON.stringify({ error: 'AI 분석 중 오류가 발생했습니다.' }), {
        status: 500, headers: CORS
      })
    }

    const anthropicData = await anthropicRes.json()
    const summary = anthropicData.content?.[0]?.text ?? '분석 결과를 가져오지 못했습니다.'

    // 6. 결과 구성
    const insightsData = {
      summary,
      categoryCounts,
      topKeywords,
      tierDist,
      totalQueries: totalCount,
      period,
      generatedAt: new Date().toISOString(),
      citySlug,
    }

    // 7. 캐시 저장 (비동기)
    saveInsightsCache(citySlug, period, insightsData)

    return new Response(JSON.stringify({ ...insightsData, cached: false }), { headers: CORS })

  } catch (err) {
    console.error('pastor-insights error:', err)
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), {
      status: 500, headers: CORS
    })
  }
}

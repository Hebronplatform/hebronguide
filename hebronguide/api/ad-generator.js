// Vercel Edge Function — AI Ad Generator
// 광고주 신청 → Claude API로 3개 언어 광고 카피 자동 생성
// Set ANTHROPIC_API_KEY in Vercel Project Settings → Environment Variables

export const config = { runtime: 'edge' }

export default async function handler(req) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'AI Ad Generator not configured. Set ANTHROPIC_API_KEY in Vercel.',
      fallback: true,
    }), { status: 503, headers: CORS })
  }

  try {
    const {
      businessName,    // 업소명
      businessType,    // 한식당·교회·마트 등
      city,            // 도시 (slug)
      address,
      phone,
      website,
      adGoal,          // 할인·신메뉴·이벤트
      adDuration,      // 1주·1개월·3개월
      budget,          // $50 / $100 / $200
      uniqueValue,     // 이 업소만의 강점
    } = await req.json()

    // 입력 검증
    if (!businessName || !businessType || !city || !adGoal) {
      return new Response(JSON.stringify({
        error: '필수 항목 누락: businessName, businessType, city, adGoal'
      }), { status: 400, headers: CORS })
    }

    // 마10:16 윤리 자동 점검 (Hard Rules)
    const ethicalIssues = checkEthics({ businessName, adGoal, uniqueValue })
    if (ethicalIssues.length > 0) {
      return new Response(JSON.stringify({
        error: 'Ethics check failed',
        issues: ethicalIssues,
        message: 'Please revise your ad request based on the issues above.',
      }), { status: 400, headers: CORS })
    }

    // Claude API 프롬프트 (시스템)
    const systemPrompt = `You are HebronGuide's AI Ad Generator. Your role:

1. Create compelling but truthful ad copy in 3 languages: Korean, English, Spanish
2. Follow HebronGuide's vision (마7:12 황금률 + 마10:16 지혜+순결)
3. Never fabricate facts. Use only what user provided.
4. Tone: warm, hospitable, trustworthy (not pushy/salesy)
5. Each language version: 2-3 sentences, max 100 chars per line
6. Include a call-to-action with QR code reference

Output JSON format ONLY:
{
  "copy_ko": "한국어 광고 카피",
  "copy_en": "English ad copy",
  "copy_es": "Copia de anuncio en español",
  "headline_ko": "짧은 헤드라인 (15자 이하)",
  "headline_en": "Short headline (15 chars max)",
  "headline_es": "Titular corto (15 caracteres)",
  "image_prompt": "DALL-E prompt for ad visual (English)",
  "qr_url_suggestion": "hebronguide.com/[city]?ref=ad_[unique_id]",
  "recommended_placement": "Which tab in app (settle/dining/help/etc)",
  "ethical_check": "Confirmation this ad respects HebronGuide values"
}`

    const userMessage = `Generate a 3-language ad for this business:

Business: ${businessName}
Type: ${businessType}
City: ${city}
Address: ${address || 'Not provided'}
Phone: ${phone || 'Not provided'}
Website: ${website || 'Not provided'}
Ad Goal: ${adGoal}
Duration: ${adDuration || '1 month'}
Budget: ${budget || '$50/month'}
Unique Value: ${uniqueValue || 'Not specified'}

Generate ad copy in Korean, English, and Spanish. Be warm, hospitable, and truthful.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      return new Response(JSON.stringify({
        error: 'Claude API error',
        details: errorText,
      }), { status: 500, headers: CORS })
    }

    const data = await res.json()
    const aiResponse = data.content?.[0]?.text || ''

    // JSON 파싱 시도
    let adContent
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      adContent = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch (e) {
      adContent = null
    }

    if (!adContent) {
      return new Response(JSON.stringify({
        error: 'AI response parsing failed',
        rawResponse: aiResponse,
      }), { status: 500, headers: CORS })
    }

    // QR 코드 URL 자동 생성 (추적 매개변수)
    const adId = `ad_${Date.now()}_${city}`
    const trackedUrl = `https://hebronguide.com/${city}/?ref=${adId}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(trackedUrl)}`

    // 응답
    const response = {
      success: true,
      adId,
      generated: adContent,
      qr: {
        url: trackedUrl,
        qrImageUrl: qrUrl,
      },
      metadata: {
        businessName,
        city,
        budget,
        duration: adDuration,
        generatedAt: new Date().toISOString(),
        model: 'claude-sonnet-4-5',
      },
      humanReviewRequired: true,
      reviewerEmail: 'gmc.hc300@gmail.com',
      message: '광고가 생성되었습니다. 폴 김 목사 검수 후 게시됩니다 (보통 24시간 이내).',
    }

    return new Response(JSON.stringify(response), { headers: CORS })

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Ad generation failed',
      message: error.message,
    }), { status: 500, headers: CORS })
  }
}

// 마10:16 자동 윤리 점검 (Hard Rules)
function checkEthics({ businessName, adGoal, uniqueValue }) {
  const issues = []
  const fullText = [businessName, adGoal, uniqueValue].filter(Boolean).join(' ').toLowerCase()

  // ❌ 거짓 표시
  if (fullText.includes('fifa official') || fullText.includes('fifa 공식')) {
    issues.push('FIFA 공식 표시 사용 금지 (저작권·진정성 위반)')
  }
  if (fullText.includes('bts official') || fullText.includes('bts 공식')) {
    issues.push('BTS 공식 표시 사용 금지')
  }

  // ❌ 과장
  if (fullText.includes('최고') && fullText.includes('100%')) {
    issues.push('과장 광고 금지 (검증 가능한 표현 사용)')
  }

  // ❌ 종교 강요
  if (fullText.match(/(예수.*믿어|구원.*받|회개)/)) {
    issues.push('직접 전도 메시지 금지 (HebronGuide는 환대로 빛나는 플랫폼)')
  }

  // ❌ 이단
  if (fullText.match(/(신천지|통일교|jms|만남|하나님의교회)/)) {
    issues.push('이단·사이비 단체 광고 절대 금지')
  }

  // ❌ 차별
  if (fullText.match(/(한국인만|한인 전용|외국인 출입금지)/)) {
    issues.push('민족·인종 차별 표현 금지 (HebronGuide는 모두를 환대)')
  }

  return issues
}

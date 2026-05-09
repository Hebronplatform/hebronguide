// Vercel Serverless Function — AI Ad Generator (Node.js)
// 광고주 신청 → Claude API로 3개 언어 광고 카피 자동 생성

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI Ad Generator not configured. Set ANTHROPIC_API_KEY in Vercel.',
      fallback: true,
    })
  }

  try {
    const {
      businessName,
      businessType,
      city,
      address,
      phone,
      website,
      adGoal,
      adDuration,
      budget,
      uniqueValue,
      languages,  // 선택 언어 배열 ['ko','en','es'] — 없으면 전체 생성
    } = req.body

    if (!businessName || !businessType || !city || !adGoal) {
      return res.status(400).json({ error: '필수 항목 누락: businessName, businessType, city, adGoal' })
    }

    // 선택 언어 결정 (기본값: 전체 3개)
    const langs = Array.isArray(languages) && languages.length > 0
      ? languages
      : ['ko', 'en', 'es']

    const ethicalIssues = checkEthics({ businessName, adGoal, uniqueValue })
    if (ethicalIssues.length > 0) {
      return res.status(400).json({ error: 'Ethics check failed', issues: ethicalIssues })
    }

    // 선택 언어별 출력 필드 구성
    const langFields = {
      ko: `"copy_ko": "한국어 광고 카피 (2-3문장)",\n  "headline_ko": "짧은 헤드라인 (15자 이하)",`,
      en: `"copy_en": "English ad copy (2-3 sentences)",\n  "headline_en": "Short headline (15 chars max)",`,
      es: `"copy_es": "Copia de anuncio en español (2-3 oraciones)",\n  "headline_es": "Titular corto (15 caracteres)",`,
    }
    const langNames = { ko: 'Korean', en: 'English', es: 'Spanish' }
    const selectedLangNames = langs.map(l => langNames[l]).join(', ')
    const selectedFields = langs.map(l => langFields[l]).join('\n  ')

    const systemPrompt = `You are HebronGuide's AI Ad Generator. Create compelling but truthful ad copy in the following language(s): ${selectedLangNames}.
Follow HebronGuide's vision (마7:12 황금률 + 마10:16 지혜+순결). Never fabricate facts.
Tone: warm, hospitable, trustworthy.

Output JSON format ONLY (include ONLY the requested languages):
{
  ${selectedFields}
  "qr_url_suggestion": "hebronguide.com/[city]?ref=ad_[unique_id]",
  "recommended_placement": "Which tab (settle/dining/explore/etc)",
  "ethical_check": "Confirmation this ad respects HebronGuide values"
}`

    const userMessage = `Generate a 3-language ad:
Business: ${businessName}
Type: ${businessType}
City: ${city}
Address: ${address || 'Not provided'}
Phone: ${phone || 'Not provided'}
Website: ${website || 'Not provided'}
Ad Goal: ${adGoal}
Duration: ${adDuration || '1 month'}
Budget: ${budget || '$50/month'}
Unique Value: ${uniqueValue || 'Not specified'}`

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!anthropicRes.ok) {
      const errorText = await anthropicRes.text()
      return res.status(500).json({ error: 'Claude API error', details: errorText })
    }

    const data = await anthropicRes.json()
    const aiResponse = data.content?.[0]?.text || ''

    let adContent
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      adContent = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch (e) {
      adContent = null
    }

    if (!adContent) {
      return res.status(500).json({ error: 'AI response parsing failed', rawResponse: aiResponse })
    }

    const adId = `ad_${Date.now()}_${city}`
    const trackedUrl = `https://hebronguide.com/${city}/?ref=${adId}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(trackedUrl)}`

    return res.status(200).json({
      success: true,
      adId,
      generated: adContent,
      qr: { url: trackedUrl, qrImageUrl: qrUrl },
      metadata: {
        businessName, city, budget,
        duration: adDuration,
        generatedAt: new Date().toISOString(),
        model: 'claude-opus-4-5',
      },
      humanReviewRequired: true,
      reviewerEmail: 'gmc.hc300@gmail.com',
      message: '광고가 생성되었습니다. 폴 김 목사 검수 후 게시됩니다 (보통 24시간 이내).',
    })

  } catch (error) {
    return res.status(500).json({ error: 'Ad generation failed', message: error.message })
  }
}

function checkEthics({ businessName, adGoal, uniqueValue }) {
  const issues = []
  const text = [businessName, adGoal, uniqueValue].filter(Boolean).join(' ').toLowerCase()
  if (text.includes('fifa official') || text.includes('fifa 공식')) issues.push('FIFA 공식 표시 금지')
  if (text.match(/(예수.*믿어|구원.*받|회개)/)) issues.push('직접 전도 메시지 금지')
  if (text.match(/(신천지|통일교|jms|하나님의교회)/)) issues.push('이단·사이비 광고 절대 금지')
  if (text.match(/(한국인만|한인 전용|외국인 출입금지)/)) issues.push('차별 표현 금지')
  return issues
}

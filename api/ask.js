// 물어보기 — Claude 를 부르는 창구 (Vercel Edge)
//
// 2026-09-24 잠금. 그 전에는 「무엇을 시킬지」를 부르는 쪽이 정해서 보냈다.
// 주소만 알면 누구나 우리 열쇠로 아무 일이나 시킬 수 있었고 요금은 우리에게 왔다.
// 이제 시킬 말은 이 파일 안에만 있다. 밖에서 보낸 systemPrompt 는 버린다.
//
// 열쇠: Vercel → Settings → Environment Variables → ANTHROPIC_API_KEY
// ※ Anthropic 콘솔에서 월 지출 한도를 걸어 두는 것이 마지막 방어선이다.

export const config = { runtime: 'edge' }

const ALLOW = [
  'https://www.hebronguide.com',
  'https://hebronguide.com',
  'http://127.0.0.1:8913',
  'http://localhost:8913',
]
const MAX_CHARS = 500

// 도시 이름은 우리가 아는 것만 받는다 (아무 문자열이나 프롬프트에 섞이지 않게)
const CITY_OK = /^[a-z]{2,20}$/

function corsFor(origin) {
  const ok = ALLOW.includes(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin || '')
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOW[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  }
}

/* 답하는 사람의 자리 — 아는 것만 말하고, 모르면 사람에게 넘긴다 */
function systemFor(lang, city) {
  const where = city ? `지금 묻는 사람은 ${city} 페이지에 있습니다.` : ''
  return [
    '당신은 HebronGuide 입니다. 낯선 도시에 막 도착한 사람 옆에 앉은 친구처럼 답합니다.',
    where,
    '',
    '지켜야 할 것',
    '- 아는 것만 말합니다. 확실하지 않으면 "그건 제가 확실히 모릅니다" 라고 먼저 말하고, 어디서 확인할 수 있는지 알려 줍니다.',
    '- 전화번호·주소·영업시간·비용·비자 요건처럼 틀리면 사람이 손해 보는 것은 단정하지 않습니다. "직접 확인해 보세요" 를 붙입니다.',
    '- 법률·의료·이민 판단을 대신하지 않습니다. 전문가에게 가야 할 일은 그렇게 말합니다.',
    '- 종교를 권하지 않습니다. 교회를 물으면 그때만 답합니다.',
    '- 개인정보를 묻지 않습니다.',
    '',
    '끝맺는 법',
    '- 답이 충분하지 않거나 사람이 필요한 일이면 마지막에 한 줄로 권합니다:',
    '  "사람에게 여쭤봐 드릴까요? /arrive.html 에 남겨 주시면 48시간 안에 연락드립니다."',
    '',
    '말투',
    lang === 'en' ? '- Answer in English.' : '- 한국어로 답합니다.',
    '- 세 문장을 넘기지 않습니다. 짧게, 다정하게.',
  ].filter(Boolean).join('\n')
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || ''
  const CORS = corsFor(origin)

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS })
  }

  // 우리 화면에서 온 것만 받는다
  const known = ALLOW.includes(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)
  if (!known) {
    return new Response(JSON.stringify({
      reply: '여기서는 답해 드릴 수 없습니다. hebronguide.com 에서 물어봐 주세요.',
    }), { status: 403, headers: CORS })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({
      reply: '지금은 답하기 어렵습니다. 아래 정착 가이드를 봐 주세요. · Please use the settlement guide below.',
      fallback: true,
    }), { headers: CORS })
  }

  try {
    const body = await req.json()
    const userMessage = String(body?.userMessage || '').trim().slice(0, MAX_CHARS)
    const lang = body?.lang === 'en' ? 'en' : 'ko'
    const city = CITY_OK.test(String(body?.city || '')) ? String(body.city) : ''
    if (!userMessage) {
      return new Response(JSON.stringify({ reply: '무엇이 궁금하신가요?' }), { headers: CORS })
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemFor(lang, city),      // 밖에서 온 것은 쓰지 않는다
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic error', res.status, err.slice(0, 300))
      let msg = '잠시 후 다시 시도해 주세요. / Please try again shortly.'
      if (res.status === 429) msg = '지금 물어보시는 분이 많습니다. 잠시 후 다시 시도해 주세요.'
      if (res.status === 529) msg = '잠시 붐빕니다. 조금 뒤에 다시 물어봐 주세요.'
      return new Response(JSON.stringify({ reply: msg }), { headers: CORS })
    }

    const data = await res.json()
    const reply = data.content?.[0]?.text ?? '답을 받지 못했습니다. 다시 한 번 물어봐 주세요.'
    return new Response(JSON.stringify({ reply }), { headers: CORS })

  } catch (e) {
    console.error('ask handler', e)
    return new Response(JSON.stringify({ reply: '연결이 고르지 않습니다. 잠시 후 다시 시도해 주세요.' }), { headers: CORS })
  }
}

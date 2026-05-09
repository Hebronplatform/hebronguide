// Vercel Edge Function — Claude API proxy
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
      reply: '안녕하세요! AI 컨시어지가 곧 활성화됩니다. 지금은 아래 정착 가이드를 이용해 주세요. · AI concierge coming soon. Please use the settlement guide below.',
      fallback: true,
    }), { headers: CORS })
  }

  try {
    const { userMessage, systemPrompt } = await req.json()

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic error:', err)
      return new Response(JSON.stringify({ reply: '잠시 후 다시 시도해 주세요. / Please try again shortly.' }), { headers: CORS })
    }

    const data = await res.json()
    const reply = data.content?.[0]?.text ?? '응답을 받지 못했습니다.'
    return new Response(JSON.stringify({ reply }), { headers: CORS })

  } catch (e) {
    console.error('Handler error:', e)
    return new Response(JSON.stringify({ reply: '네트워크 오류입니다. 잠시 후 다시 시도해 주세요.' }), { headers: CORS })
  }
}

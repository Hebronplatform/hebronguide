// api/submit-form.js — HebronGuide 폼 직접 제출 (이메일 앱 불필요)
// Vercel Edge Function
// 1. Supabase community_items 저장
// 2. Resend로 관리자 알림 이메일 (RESEND_API_KEY 설정 시)

export const config = { runtime: 'edge' }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// community_items 는 vextxqzggznulwpganwt (sbNew) 프로젝트에 있음
const SUPABASE_URL = 'https://vextxqzggznulwpganwt.supabase.co'
const SUPABASE_KEY = 'sb_publishable_j1cYftObx8VDVkEQAvluXg_rn20pnfX'
const ADMIN_EMAIL   = 'hebronplatform@gmail.com'

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  try {
    const { type, subject, body, name, email, phone, city } = await req.json()

    if (!subject || !body) {
      return new Response(JSON.stringify({ error: '필수 항목이 없습니다' }), { status: 400, headers: CORS })
    }

    // ── 1. Supabase 저장 ─────────────────────────────────────
    const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/community_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        title:       subject,
        description: body,
        category:    type || 'general',
        name:        name  || '',
        contact:     email || '',
        phone:       phone || '',
        city_slug:   city  || '',
        status:      'pending',
      }),
    })

    // Supabase 저장 실패해도 계속 진행 (이메일 시도)
    const savedOk = saveRes.ok

    // ── 2. Resend 이메일 알림 (API KEY 있을 때만) ────────────
    const resendKey = process.env.RESEND_API_KEY
    let emailOk = false

    if (resendKey) {
      const emailBody = body
        + '\n\n─────────────────────────────────────\n'
        + `신청자: ${name || '—'}\n`
        + `이메일: ${email || '—'}\n`
        + `전화: ${phone || '—'}\n`
        + `도시: ${city || '—'}\n`
        + `── HebronGuide Partner · hebronguide.com ──`

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:     'HebronGuide <noreply@hebronguide.com>',
          to:       ADMIN_EMAIL,
          reply_to: email || ADMIN_EMAIL,
          subject,
          text:     emailBody,
        }),
      })
      emailOk = emailRes.ok
    }

    // ── 3. 응답 ──────────────────────────────────────────────
    if (!savedOk && !emailOk) {
      return new Response(JSON.stringify({
        error: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      }), { status: 500, headers: CORS })
    }

    return new Response(JSON.stringify({
      ok: true,
      saved: savedOk,
      emailed: emailOk,
      message: '신청이 접수되었습니다. 48시간 이내에 연락드리겠습니다. 🙏',
    }), { headers: CORS })

  } catch (err) {
    console.error('submit-form error:', err)
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다' }), {
      status: 500, headers: CORS
    })
  }
}

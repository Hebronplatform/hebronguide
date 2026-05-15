// Vercel Edge Function — 교회 등재 신청 + Supabase 자동 게시
// 환경변수: RESEND_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

export const config = { runtime: 'edge' }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS })

  let data
  try { data = await req.json() }
  catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: CORS }) }

  const { churchName, city, pastor, email, phone, website, description } = data

  if (!churchName || !city) {
    return new Response(JSON.stringify({ status: 'error', message: '교회명과 도시는 필수입니다.' }), { status: 400, headers: CORS })
  }

  const RESEND_KEY   = process.env.RESEND_API_KEY || ''
  const SUPA_URL     = process.env.SUPABASE_URL || ''
  const SUPA_KEY     = process.env.SUPABASE_ANON_KEY || ''
  const ADMIN        = 'hebronplatform@gmail.com'
  const FROM         = 'HebronGuide <noreply@hebronguide.com>'
  const now          = new Date().toLocaleString('ko-KR', { timeZone: 'America/Los_Angeles' })

  // ── Supabase 자동 저장 (즉시 게시) ──
  if (SUPA_URL && SUPA_KEY) {
    try {
      await fetch(`${SUPA_URL}/rest/v1/community_items`, {
        method: 'POST',
        headers: {
          'apikey': SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          category: 'church',
          city_slug: city,
          name: churchName,
          pastor: pastor || null,
          contact: email || phone || null,
          phone: phone || null,
          email: email || null,
          description: description || null,
          website: website || null,
          status: 'published',
        }),
      })
    } catch (_) {}
  }

  // ── 관리자 알림 이메일 ──
  const adminHtml = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8f8f8;border-radius:8px;border:1px solid #ddd;">
  <div style="background:#1a2535;padding:18px 22px;border-radius:8px 8px 0 0;">
    <div style="color:#C9A227;font-family:Georgia,serif;font-size:16px;font-weight:bold;">⛪ 새 교회 등재 신청</div>
  </div>
  <div style="padding:20px 22px;font-size:13px;color:#333;line-height:2.2;">
    <b>교회명:</b> ${churchName}<br>
    <b>도시:</b> ${city}<br>
    ${pastor      ? `<b>담당 목사:</b> ${pastor}<br>` : ''}
    ${email       ? `<b>이메일:</b> ${email}<br>` : ''}
    ${phone       ? `<b>전화:</b> ${phone}<br>` : ''}
    ${website     ? `<b>홈페이지:</b> ${website}<br>` : ''}
    ${description ? `<b>소개:</b> ${description}<br>` : ''}
    <br><b>신청 시각:</b> ${now} (LA 기준)
  </div>
  <div style="background:#f0f0f0;padding:10px 22px;font-size:11px;color:#999;border-radius:0 0 8px 8px;">
    HebronGuide · Hebron Platform LLC
  </div>
</div>`

  // ── 신청 교회 확인 이메일 ──
  const confirmHtml = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d1117;color:#ECFDF5;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a2535,#0d1117);padding:28px 24px;text-align:center;border-bottom:2px solid #C9A227;">
    <img src="https://hebronguide.com/hebronguide-logo.svg" alt="HebronGuide" width="180" height="47" style="display:block;margin:0 auto 6px;">
    <div style="font-size:11px;color:rgba(236,253,245,.4);">hebronguide.com</div>
  </div>
  <div style="padding:26px 24px;">
    <div style="font-size:15px;font-weight:bold;color:#ECFDF5;margin-bottom:14px;">✅ 교회 등재 신청이 접수되었습니다</div>
    <div style="font-size:13px;color:rgba(236,253,245,.7);line-height:1.9;margin-bottom:20px;">
      <strong style="color:#6EE7B7;">${churchName}</strong> 교회의 신청을 받았습니다.<br>
      별도 연락 없이 검토 후 <strong>1~2주 내</strong>에 등재 완료됩니다.
    </div>
    <div style="margin-top:16px;font-size:11px;color:rgba(236,253,245,.3);">
      문의: hebronplatform@gmail.com<br>
      © 2026 Hebron Platform LLC · 1 Cor. 10:31
    </div>
  </div>
</div>`

  // ── Resend 발송 ──
  let resendStatus = 'no_key'
  if (RESEND_KEY) {
    try {
      // 관리자(Paul)에게 알림
      const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: [ADMIN], subject: `[HebronGuide 신청] ${churchName} — ${city}`, html: adminHtml }),
      })
      const adminJson = await adminRes.json()
      resendStatus = adminRes.ok ? 'sent' : `error:${JSON.stringify(adminJson)}`
      console.log('[submit-church] admin email result:', adminRes.status, JSON.stringify(adminJson))

      // 신청 교회에 확인 이메일
      if (email) {
        const confRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: FROM, to: [email], subject: `[HebronGuide] ${churchName} 교회 등재 신청 접수`, html: confirmHtml }),
        })
        const confJson = await confRes.json()
        console.log('[submit-church] confirm email result:', confRes.status, JSON.stringify(confJson))
      }
    } catch (e) {
      resendStatus = `exception:${e.message}`
      console.error('[submit-church] email error:', e.message)
    }
  }

  return new Response(JSON.stringify({
    status: 'pending',
    message: `${churchName} 교회 신청이 접수되었습니다.${email ? ' 확인 이메일을 보내 드렸습니다.' : ''} 1~2주 내 등재 완료됩니다.`,
  }), { status: 200, headers: CORS })
}

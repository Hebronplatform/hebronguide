// Vercel Edge Function — 교회 등재 신청 자동 이메일 처리
// 필요한 환경변수 (Vercel Project Settings → Environment Variables):
//   RESEND_API_KEY  →  resend.com 에서 무료 발급

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

  const RESEND_KEY = globalThis.RESEND_API_KEY || ''
  const FROM      = 'HebronGuide <hello@hebronguide.com>'
  const ADMIN     = 'hebronplatform@gmail.com'

  // ── 이메일 내용 ──────────────────────────────
  const cityLabel = city || '미입력'
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'America/Los_Angeles' })

  // 1. 신청 교회에 보내는 확인 이메일
  const confirmHtml = `
<div style="font-family:'Apple SD Gothic Neo',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d1117;color:#ECFDF5;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a2535,#0d1117);padding:32px 28px 24px;text-align:center;border-bottom:2px solid #C9A227;">
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#C9A227;letter-spacing:2px;margin-bottom:4px;">HebronGuide</div>
    <div style="font-size:13px;color:rgba(236,253,245,.5);">hebronguide.com</div>
  </div>
  <div style="padding:28px;">
    <div style="font-size:15px;font-weight:bold;color:#ECFDF5;margin-bottom:14px;">
      ✅ 교회 등재 신청이 접수되었습니다
    </div>
    <div style="font-size:13px;color:rgba(236,253,245,.7);line-height:1.9;margin-bottom:20px;">
      <strong style="color:#6EE7B7;">${churchName}</strong> 교회의 등재 신청을 받았습니다.<br>
      검토 완료 후 <strong>1~2주 내</strong>에 등재 완료 알림을 다시 보내 드립니다.<br><br>
      별도 연락 없이 자동으로 처리됩니다. 기다려 주세요.
    </div>
    <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:16px 18px;font-size:12px;color:rgba(236,253,245,.6);line-height:2;">
      교회명: ${churchName}<br>
      도시: ${cityLabel}<br>
      ${pastor ? `담당 목사: ${pastor}<br>` : ''}
      ${phone  ? `전화: ${phone}<br>` : ''}
      ${website ? `홈페이지: ${website}<br>` : ''}
    </div>
    <div style="margin-top:18px;font-size:12px;color:rgba(236,253,245,.35);line-height:1.8;">
      문의: <a href="mailto:${ADMIN}" style="color:#C9A227;">${ADMIN}</a><br>
      © 2026 Hebron Platform LLC · 1 Cor. 10:31
    </div>
  </div>
</div>`

  // 2. Paul 목사님(관리자)에게 보내는 신청 알림
  const adminHtml = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8f8f8;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
  <div style="background:#1a2535;padding:20px 24px;color:#C9A227;font-family:Georgia,serif;font-size:18px;font-weight:bold;">
    ⛪ 새 교회 등재 신청
  </div>
  <div style="padding:20px 24px;font-size:13px;color:#333;line-height:2;">
    <strong>교회명:</strong> ${churchName}<br>
    <strong>도시:</strong> ${cityLabel}<br>
    ${pastor  ? `<strong>담당 목사:</strong> ${pastor}<br>` : ''}
    ${email   ? `<strong>이메일:</strong> ${email}<br>` : ''}
    ${phone   ? `<strong>전화:</strong> ${phone}<br>` : ''}
    ${website ? `<strong>홈페이지:</strong> ${website}<br>` : ''}
    ${description ? `<strong>소개:</strong> ${description}<br>` : ''}
    <br>
    <strong>신청 시각:</strong> ${now} (LA 기준)<br>
  </div>
  <div style="background:#f0f0f0;padding:12px 24px;font-size:11px;color:#999;">
    HebronGuide · Hebron Platform LLC
  </div>
</div>`

  // ── Resend API 호출 ──────────────────────────
  const emails = []

  if (RESEND_KEY) {
    // 신청자에게 확인 이메일 (이메일 있는 경우)
    if (email) {
      emails.push(fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM,
          to: [email],
          subject: `[HebronGuide] ${churchName} 교회 등재 신청 접수 완료`,
          html: confirmHtml,
        }),
      }))
    }

    // 관리자(Paul)에게 알림
    emails.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [ADMIN],
        subject: `[HebronGuide 신청] ${churchName} — ${cityLabel}`,
        html: adminHtml,
        reply_to: email || ADMIN,
      }),
    }))

    try { await Promise.all(emails) } catch (e) { /* 이메일 실패해도 접수는 완료 */ }
  }

  // ── 응답 ────────────────────────────────────
  return new Response(JSON.stringify({
    status: 'pending',
    message: `${churchName} 교회 등재 신청이 접수되었습니다.${email ? ' 확인 이메일을 보내 드렸습니다.' : ''} 1~2주 내 등재 완료 후 알려 드립니다.`,
  }), { status: 200, headers: CORS })
}

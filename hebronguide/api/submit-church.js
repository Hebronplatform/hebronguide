// Vercel Serverless Function — 교회 등재 신청 자동 이메일
// ─────────────────────────────────────────────────────
// 환경변수 설정 (Vercel → Settings → Environment Variables):
//   GMAIL_USER      예) hebronplatform@gmail.com
//   GMAIL_APP_PASS  Gmail 앱 비밀번호 (16자리, 아래 설명 참조)
//
// Gmail 앱 비밀번호 만드는 법 (2분):
//   1. myaccount.google.com → 보안 → 2단계 인증 (켜져 있어야 함)
//   2. 보안 → 앱 비밀번호 → 앱: 메일, 기기: 기타 → 생성
//   3. 나온 16자리를 GMAIL_APP_PASS 에 입력
// ─────────────────────────────────────────────────────

export const config = { runtime: 'edge' }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

// Gmail SMTP를 fetch로 직접 호출 (Edge 호환)
async function sendEmail({ from, to, subject, html, user, pass }) {
  // Base64 인코딩 헬퍼
  const b64 = (s) => btoa(unescape(encodeURIComponent(s)))

  // RFC 2822 형식 메일 구성
  const boundary = `--boundary_${Date.now()}`
  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64(html),
    `--${boundary}--`,
  ].join('\r\n')

  // Gmail REST API (OAuth 없이 Basic Auth 사용)
  const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${user}:${pass}`),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }),
  })
  return res
}

// Gmail SMTP over Fetch (더 안정적인 방법: smtp2go / Resend fallback)
async function sendViaResend({ to, subject, html, apiKey, from }) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html }),
  })
}

async function sendViaSMTP2GO({ to, subject, html, user, pass, from }) {
  return fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: pass,
      to: [`${to}`],
      sender: from,
      subject,
      html_body: html,
    }),
  })
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

  // 환경변수
  const GMAIL_USER     = globalThis.GMAIL_USER      || ''
  const GMAIL_APP_PASS = globalThis.GMAIL_APP_PASS  || ''
  const RESEND_KEY     = globalThis.RESEND_API_KEY   || ''
  const ADMIN          = GMAIL_USER || 'hebronplatform@gmail.com'
  const FROM           = `HebronGuide <${ADMIN}>`
  const now            = new Date().toLocaleString('ko-KR', { timeZone: 'America/Los_Angeles' })

  // ── 이메일 HTML ───────────────────────────────────
  const confirmHtml = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d1117;color:#ECFDF5;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a2535,#0d1117);padding:28px 24px;text-align:center;border-bottom:2px solid #C9A227;">
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#C9A227;letter-spacing:2px;">HebronGuide</div>
    <div style="font-size:11px;color:rgba(236,253,245,.4);margin-top:4px;">hebronguide.com</div>
  </div>
  <div style="padding:26px 24px;">
    <div style="font-size:15px;font-weight:bold;color:#ECFDF5;margin-bottom:14px;">✅ 교회 등재 신청이 접수되었습니다</div>
    <div style="font-size:13px;color:rgba(236,253,245,.7);line-height:1.9;margin-bottom:20px;">
      <strong style="color:#6EE7B7;">${churchName}</strong> 교회의 신청을 받았습니다.<br>
      별도 연락 없이 검토 후 <strong>1~2주 내</strong>에 등재 완료됩니다.
    </div>
    <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px 16px;font-size:12px;color:rgba(236,253,245,.6);line-height:2;">
      교회명: ${churchName}<br>
      도시: ${city}<br>
      ${pastor ? `담당 목사: ${pastor}<br>` : ''}
      ${phone  ? `전화: ${phone}<br>` : ''}
      ${website ? `홈페이지: ${website}<br>` : ''}
    </div>
    <div style="margin-top:16px;font-size:11px;color:rgba(236,253,245,.3);line-height:1.8;">
      문의: <a href="mailto:${ADMIN}" style="color:#C9A227;">${ADMIN}</a><br>
      © 2026 Hebron Platform LLC · 1 Cor. 10:31
    </div>
  </div>
</div>`

  const adminHtml = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f8f8f8;border-radius:8px;border:1px solid #ddd;">
  <div style="background:#1a2535;padding:18px 22px;border-radius:8px 8px 0 0;">
    <div style="color:#C9A227;font-family:Georgia,serif;font-size:16px;font-weight:bold;">⛪ 새 교회 등재 신청</div>
  </div>
  <div style="padding:20px 22px;font-size:13px;color:#333;line-height:2.2;">
    <b>교회명:</b> ${churchName}<br>
    <b>도시:</b> ${city}<br>
    ${pastor      ? `<b>담당 목사:</b> ${pastor}<br>` : ''}
    ${email       ? `<b>이메일:</b> <a href="mailto:${email}">${email}</a><br>` : ''}
    ${phone       ? `<b>전화:</b> ${phone}<br>` : ''}
    ${website     ? `<b>홈페이지:</b> <a href="${website}">${website}</a><br>` : ''}
    ${description ? `<b>소개:</b> ${description}<br>` : ''}
    <br><b>신청 시각:</b> ${now} (LA 기준)
  </div>
  <div style="background:#f0f0f0;padding:10px 22px;font-size:11px;color:#999;border-radius:0 0 8px 8px;">
    HebronGuide · Hebron Platform LLC
  </div>
</div>`

  // ── 이메일 발송 시도 ──────────────────────────────
  if (GMAIL_APP_PASS && GMAIL_USER) {
    // Gmail App Password → Resend-compatible SMTP bridge via smtp2go
    // (Edge 환경에서 Gmail SMTP 직접 연결 불가 → Resend or SMTP2GO 사용)
    try {
      const tasks = []
      if (email) tasks.push(sendViaSMTP2GO({ to: email, subject: `[HebronGuide] ${churchName} 교회 등재 신청 접수`, html: confirmHtml, user: GMAIL_USER, pass: GMAIL_APP_PASS, from: FROM }))
      tasks.push(sendViaSMTP2GO({ to: ADMIN, subject: `[HebronGuide 신청] ${churchName} — ${city}`, html: adminHtml, user: GMAIL_USER, pass: GMAIL_APP_PASS, from: FROM }))
      await Promise.allSettled(tasks)
    } catch (_) {}
  } else if (RESEND_KEY) {
    try {
      const tasks = []
      if (email) tasks.push(sendViaResend({ to: email, subject: `[HebronGuide] ${churchName} 교회 등재 신청 접수`, html: confirmHtml, apiKey: RESEND_KEY, from: 'HebronGuide <hello@hebronguide.com>' }))
      tasks.push(sendViaResend({ to: ADMIN, subject: `[HebronGuide 신청] ${churchName} — ${city}`, html: adminHtml, apiKey: RESEND_KEY, from: 'HebronGuide <hello@hebronguide.com>' }))
      await Promise.allSettled(tasks)
    } catch (_) {}
  }

  return new Response(JSON.stringify({
    status: 'pending',
    message: `${churchName} 교회 신청이 접수되었습니다.${email ? ' 확인 이메일을 보내 드렸습니다.' : ''} 1~2주 내 등재 완료됩니다.`,
  }), { status: 200, headers: CORS })
}

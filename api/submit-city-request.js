// api/submit-city-request.js
// 도시 신청 접수 → Supabase(community_items, category=city_request) 저장 + 관리자 이메일 알림
// Node.js Serverless Function (Edge 아님 — nodemailer 사용)
import nodemailer from 'nodemailer'

const SUPABASE_URL  = 'https://vextxqzggznulwpganwt.supabase.co'
// anon 키 (fallback) — 서비스 키 미설정 시 사용. status=pending 삽입은 RLS 허용.
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZleHR4cXpnZ3pudWx3cGdhbnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MTUzOTIsImV4cCI6MjA5NDM5MTM5Mn0.XghaQZYtI-dq5mf8i-DPVCxtw_XBBjxGUnvaiwGQFWk'
const ADMIN_EMAIL   = 'hebronplatform@gmail.com'
const FROM_EMAIL    = 'Hebronplatform@gmail.com'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).json({})
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { role, name, email, city, reason, ref } = req.body || {}
    if (!email || !city) return res.status(400).json({ error: '이메일과 도시는 필수입니다' })

    const description =
      `역할: ${role || '(미선택)'}\n성함: ${name || '(미입력)'}\n이메일: ${email}\n신청 도시: ${city}\n신청 이유: ${reason || '(미입력)'}\n추천인: ${ref || '(미입력)'}`

    // ── 1. Supabase 저장 (admin.html '도시 신청' 섹션이 읽는 필드 그대로) ──
    const writeKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY || SUPABASE_ANON
    let savedOk = false
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/community_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: writeKey,
          Authorization: `Bearer ${writeKey}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          title:       `[도시 신청] ${city}`,
          name:        name || email,
          contact:     email,
          description,
          category:    'city_request',
          // ⚠️ community_items 실제 컬럼만 사용 (city·submitted_at 없음 → 넣으면 42703로 저장 실패)
          city_slug:   '',
          status:      'pending',
        }),
      })
      savedOk = r.ok || r.status === 201 || r.status === 204
      if (!savedOk) console.warn('Supabase save non-ok:', r.status, await r.text().catch(() => ''))
    } catch (e) { console.warn('Supabase save failed:', e.message) }

    // ── 2. 관리자 이메일 알림 ──
    let emailOk = false, emailSkipped = false
    const gmailPass = process.env.GMAIL_APP_PASS
    if (gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: FROM_EMAIL, pass: gmailPass },
        })
        await transporter.sendMail({
          from:    `"HebronGuide 도시신청" <${FROM_EMAIL}>`,
          to:      ADMIN_EMAIL,
          replyTo: email || FROM_EMAIL,
          subject: `[HebronGuide] 새 도시 신청 — ${city}`,
          text: [
            '새 도시 신청이 접수되었습니다.',
            '─────────────────────────────────────',
            description,
            '─────────────────────────────────────',
            '관리: hebronguide.com/admin.html (도시 신청 섹션)',
          ].join('\n'),
        })
        emailOk = true
        console.log('City request email sent to', ADMIN_EMAIL)
      } catch (e) { console.error('Gmail send failed:', e.message) }
    } else {
      emailSkipped = true
      console.warn('GMAIL_APP_PASS not set — email skipped')
    }

    if (savedOk || emailOk || emailSkipped) {
      return res.status(200).json({ ok: true, saved: savedOk, email: emailOk })
    }
    return res.status(500).json({ error: '저장·발송에 실패했습니다' })
  } catch (e) {
    console.error('submit-city-request error:', e)
    return res.status(500).json({ error: e.message })
  }
}

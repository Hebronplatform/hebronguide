// api/submit-form.js — HebronGuide 폼 직접 제출
// Node.js Serverless Function (Edge 아님 — nodemailer 사용)
// 1. Supabase community_items 저장
// 2. Gmail SMTP → hebronplatform@gmail.com 즉시 알림

import nodemailer from 'nodemailer'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

const SUPABASE_URL = 'https://vextxqzggznulwpganwt.supabase.co'
const SUPABASE_KEY = 'sb_publishable_j1cYftObx8VDVkEQAvluXg_rn20pnfX'
const ADMIN_EMAIL  = 'hebronplatform@gmail.com'
const FROM_EMAIL   = 'gmc.hc300@gmail.com'

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({})
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { type, subject, body, name, email, phone, city } = req.body

    if (!subject || !body) {
      return res.status(400).json({ error: '필수 항목이 없습니다' })
    }

    // ── 1. Supabase 저장 ─────────────────────────────────────
    let savedOk = false
    try {
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
      savedOk = saveRes.ok
    } catch (e) {
      console.warn('Supabase save failed:', e.message)
    }

    // ── 2. Gmail SMTP 이메일 전송 ─────────────────────────────
    let emailOk = false
    const gmailPass = process.env.GMAIL_APP_PASS

    if (gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: FROM_EMAIL,
            pass: gmailPass,
          },
        })

        const emailBody = [
          subject,
          '─────────────────────────────────────',
          body,
          '─────────────────────────────────────',
          `신청자: ${name  || '—'}`,
          `이메일: ${email || '—'}`,
          `전화:   ${phone || '—'}`,
          `도시:   ${city  || '—'}`,
          '── HebronGuide Partner · hebronguide.com ──',
        ].join('\n')

        await transporter.sendMail({
          from:     `"HebronGuide 신청" <${FROM_EMAIL}>`,
          to:       ADMIN_EMAIL,
          replyTo:  email || FROM_EMAIL,
          subject:  subject,
          text:     emailBody,
        })
        emailOk = true
        console.log('Email sent successfully to', ADMIN_EMAIL)
      } catch (e) {
        console.error('Gmail send failed:', e.message)
      }
    } else {
      console.warn('GMAIL_APP_PASS not set — email skipped')
    }

    // ── 3. 응답 ──────────────────────────────────────────────
    if (!savedOk && !emailOk) {
      return res.status(500).json({
        error: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      })
    }

    return res.status(200).json({
      ok:      true,
      saved:   savedOk,
      emailed: emailOk,
      message: '신청이 접수되었습니다. 48시간 이내에 연락드리겠습니다. 🙏',
    })

  } catch (err) {
    console.error('submit-form error:', err)
    return res.status(500).json({ error: '서버 오류가 발생했습니다' })
  }
}

// api/notify-partner.js — 파트너 교회 승인 확인 이메일 자동 발송
// Node.js Serverless Function (nodemailer 사용)

import nodemailer from 'nodemailer'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
}

const ADMIN_HASH = '614fea13745bbaa53de1c1c36b216c3cd5009df185b9f642089eb7ea76a69b90'
const FROM_EMAIL = 'gmc.hc300@gmail.com'
const ADMIN_EMAIL = 'hebronplatform@gmail.com'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).json({})
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { token, type, church } = req.body

    // 토큰 인증
    if (!token || token !== ADMIN_HASH) {
      return res.status(401).json({ error: '인증 실패' })
    }

    if (!church || !church.email || church.email === '없음' || church.email === '') {
      return res.status(200).json({ ok: true, skipped: true, msg: '이메일 주소 없음 — 발송 건너뜀' })
    }

    const gmailPass = process.env.GMAIL_APP_PASS
    if (!gmailPass) {
      return res.status(200).json({ ok: true, skipped: true, msg: 'GMAIL_APP_PASS 미설정' })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: FROM_EMAIL, pass: gmailPass },
    })

    const cityUrl = church.city_slug
      ? `https://hebronguide.com/${church.city_slug}/`
      : 'https://hebronguide.com/'

    const ko_body = `
안녕하세요, ${church.pastor || '목사님'}! 🙏

${church.name}이(가) HebronGuide 파트너 교회로 등재되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 등재된 페이지 확인하기
${cityUrl}
(교회 탭에서 확인하세요)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 등재된 교회 정보
  교회명: ${church.name}${church.name_en ? ' / ' + church.name_en : ''}
  도시: ${church.city || '—'}
  예배시간: ${church.service_time || '—'}
  전화: ${church.phone || '—'}
  이메일: ${church.email}
  ${church.website && church.website !== '없음' ? '웹사이트: ' + church.website : ''}

수정이 필요한 정보가 있으시면 아래로 연락해 주세요:
  📧 이메일: hebronplatform@gmail.com
  💬 카카오톡 채널: pf.kakao.com/_dxdxlbX

HebronGuide를 통해 많은 이주민 성도들이
교회를 찾고 연결되기를 바랍니다. 감사합니다!

"내가 나그네 되었을 때 너희가 영접하였다" — 마태복음 25:35

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HebronGuide 팀 | hebronguide.com
68개 도시 한인 이주민 정착 가이드
`.trim()

    const en_body = `
Hello, ${church.pastor_en || 'Pastor'}! 🙏

${church.name_en || church.name} has been successfully listed as a HebronGuide Partner Church.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ View Your Church Listing
${cityUrl}
(Check the Church tab)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Your Listed Information
  Church: ${church.name}${church.name_en ? ' / ' + church.name_en : ''}
  City: ${church.city || '—'}
  Service: ${church.service_time || '—'}
  Phone: ${church.phone || '—'}
  Email: ${church.email}
  ${church.website && church.website !== '없음' ? 'Website: ' + church.website : ''}

If any information needs correction, please contact us:
  📧 Email: hebronplatform@gmail.com
  💬 KakaoTalk: pf.kakao.com/_dxdxlbX

We pray that many Korean diaspora members will find
your church through HebronGuide. Thank you!

"I was a stranger and you welcomed me." — Matthew 25:35

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HebronGuide Team | hebronguide.com
Korean Immigrant Settlement Guide · 68 Cities
`.trim()

    // 교회에 발송
    await transporter.sendMail({
      from: `"HebronGuide" <${FROM_EMAIL}>`,
      to: church.email,
      replyTo: ADMIN_EMAIL,
      subject: `[HebronGuide] ${church.name} 파트너 교회 등재 완료 안내`,
      text: ko_body + '\n\n---\n\n' + en_body,
    })

    // 관리자에게도 CC 발송
    await transporter.sendMail({
      from: `"HebronGuide Admin" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `[관리자 알림] ${church.name} 승인 완료 · ${church.city}`,
      text: `교회명: ${church.name}\n도시: ${church.city}\n담임: ${church.pastor}\n이메일: ${church.email}\n\n파트너 교회 자동 등록 및 확인 이메일 발송 완료.`,
    })

    return res.status(200).json({
      ok: true,
      msg: `${church.name} → ${church.email} 발송 완료`,
    })

  } catch (e) {
    console.error('notify-partner error:', e)
    return res.status(500).json({ error: e.message })
  }
}

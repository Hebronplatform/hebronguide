// api/notify-partner.js — 파트너 승인 확인 이메일 자동 발송
// 지원 type: 'church' | 'business' | 'promo'
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

const KAKAO_BLOCK = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 HebronGuide 카카오톡 채널을 추가해 주세요!

  👉 pf.kakao.com/_dxdxlbX

채널을 추가하시면:
  ✅ 새 도시 오픈 소식을 가장 먼저 받으실 수 있습니다
  ✅ 정보 수정 요청을 카카오톡으로 간편하게 보내실 수 있습니다
  ✅ HebronGuide 업데이트·이민자 정착 정보를 공유받으실 수 있습니다
  ✅ 파트너 간 네트워크 소식도 받아보실 수 있습니다

앞으로 더 원활한 소통을 위해 채널 추가를 정중히 권해 드립니다. 🙏
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

const KAKAO_BLOCK_EN = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 We warmly invite you to add our KakaoTalk Channel!

  👉 pf.kakao.com/_dxdxlbX

By adding our channel, you will:
  ✅ Be the first to know when new cities launch
  ✅ Send info correction requests easily via KakaoTalk
  ✅ Receive HebronGuide updates & diaspora settlement news
  ✅ Stay connected with our partner network

For smoother communication going forward,
we kindly encourage you to add our KakaoTalk channel. 🙏
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

// ── 교회 이메일 ───────────────────────────────────────────────────────
function buildChurchEmail(church) {
  const cityUrl = church.city_slug
    ? `https://hebronguide.com/${church.city_slug}/`
    : 'https://hebronguide.com/'

  const ko = `
안녕하세요, ${church.pastor || '목사님'}! 🙏

${church.name}이(가) HebronGuide 파트너 교회로 등재되었습니다.
수고하신 섬김에 진심으로 감사드립니다.

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

수정이 필요한 정보가 있으시면 이 이메일로 회신해 주시거나
카카오톡 채널로 편하게 문의해 주세요.
  📧 hebronplatform@gmail.com
${KAKAO_BLOCK}

HebronGuide를 통해 많은 이주민 성도들이
교회를 찾고 연결되기를 바랍니다. 감사합니다!

"내가 나그네 되었을 때 너희가 영접하였다" — 마태복음 25:35

HebronGuide 팀 | hebronguide.com
68개 도시 한인 이주민 정착 가이드`.trim()

  const en = `
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

If any information needs correction, please reply to this email.
  📧 hebronplatform@gmail.com
${KAKAO_BLOCK_EN}

We pray that many Korean diaspora members will find
your church through HebronGuide. Thank you!

"I was a stranger and you welcomed me." — Matthew 25:35

HebronGuide Team | hebronguide.com
Korean Immigrant Settlement Guide · 68 Cities`.trim()

  return {
    to: church.email,
    subject: `[HebronGuide] ${church.name} 파트너 교회 등재 완료 안내`,
    text: ko + '\n\n---\n\n' + en,
    adminSubject: `[관리자 알림] 교회 승인 완료 · ${church.name} · ${church.city || ''}`,
    adminText: `교회명: ${church.name}\n도시: ${church.city}\n담임: ${church.pastor}\n이메일: ${church.email}\n\n파트너 교회 자동 등록 및 확인 이메일 발송 완료.`,
  }
}

// ── 사업체 이메일 ──────────────────────────────────────────────────────
function buildBusinessEmail(biz) {
  const cityUrl = biz.city_slug
    ? `https://hebronguide.com/${biz.city_slug}/`
    : 'https://hebronguide.com/'

  const ko = `
안녕하세요, ${biz.owner || '사장님'}! 🙏

${biz.name}이(가) HebronGuide에 사업체로 등재되었습니다.
신청해 주셔서 진심으로 감사드립니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 등재된 페이지 확인하기
${cityUrl}
(해당 카테고리 탭에서 확인하세요)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 등재된 사업체 정보
  업체명: ${biz.name}${biz.name_en ? ' / ' + biz.name_en : ''}
  업종: ${biz.type || '—'}
  도시: ${biz.city || '—'}
  주소: ${biz.address || '—'}
  전화: ${biz.phone || '—'}
  이메일: ${biz.email}
  ${biz.website && biz.website !== '없음' ? '웹사이트: ' + biz.website : ''}

수정이 필요한 정보가 있으시면 이 이메일로 회신해 주시거나
카카오톡 채널로 편하게 문의해 주세요.
  📧 hebronplatform@gmail.com
${KAKAO_BLOCK}

HebronGuide를 통해 많은 분들이
찾아오시기를 바랍니다. 감사합니다!

HebronGuide 팀 | hebronguide.com
68개 도시 한인 이주민 정착 가이드`.trim()

  const en = `
Hello, ${biz.owner_en || biz.owner || 'Owner'}! 🙏

${biz.name_en || biz.name} has been successfully listed on HebronGuide.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ View Your Listing
${cityUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Your Listed Information
  Business: ${biz.name}${biz.name_en ? ' / ' + biz.name_en : ''}
  Type: ${biz.type || '—'}
  City: ${biz.city || '—'}
  Address: ${biz.address || '—'}
  Phone: ${biz.phone || '—'}
  Email: ${biz.email}
  ${biz.website && biz.website !== '없음' ? 'Website: ' + biz.website : ''}

If any information needs correction, please reply to this email.
  📧 hebronplatform@gmail.com
${KAKAO_BLOCK_EN}

We hope HebronGuide brings many visitors to your business!

HebronGuide Team | hebronguide.com
Korean Immigrant Settlement Guide · 68 Cities`.trim()

  return {
    to: biz.email,
    subject: `[HebronGuide] ${biz.name} 사업체 등재 완료 안내`,
    text: ko + '\n\n---\n\n' + en,
    adminSubject: `[관리자 알림] 사업체 승인 완료 · ${biz.name} · ${biz.city || ''}`,
    adminText: `업체명: ${biz.name}\n업종: ${biz.type}\n도시: ${biz.city}\n이메일: ${biz.email}\n\n사업체 자동 등록 및 확인 이메일 발송 완료.`,
  }
}

// ── 광고/홍보 이메일 ──────────────────────────────────────────────────
function buildPromoEmail(promo) {
  const ko = `
안녕하세요, ${promo.contact || '담당자님'}! 🙏

${promo.name || promo.title}의 HebronGuide 홍보 신청이 승인되었습니다.
신청해 주셔서 진심으로 감사드립니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📣 승인된 홍보 정보
  제목/업체명: ${promo.name || promo.title || '—'}
  도시: ${promo.city || '—'}
  홍보 기간: ${promo.period || '협의 후 확정'}
  연락처: ${promo.phone || '—'}
  이메일: ${promo.email}
  ${promo.website && promo.website !== '없음' ? '웹사이트: ' + promo.website : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

세부 일정 및 광고 내용 확정을 위해 곧 연락드리겠습니다.
문의 사항은 이 이메일로 회신해 주시거나
카카오톡 채널로 편하게 연락해 주세요.
  📧 hebronplatform@gmail.com
${KAKAO_BLOCK}

HebronGuide와 함께해 주셔서 감사합니다!

HebronGuide 팀 | hebronguide.com
68개 도시 한인 이주민 정착 가이드`.trim()

  const en = `
Hello, ${promo.contact_en || promo.contact || 'Contact'}! 🙏

Your promotional listing request for ${promo.name || promo.title} has been approved on HebronGuide.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📣 Approved Promotion Details
  Name/Title: ${promo.name || promo.title || '—'}
  City: ${promo.city || '—'}
  Period: ${promo.period || 'To be confirmed'}
  Phone: ${promo.phone || '—'}
  Email: ${promo.email}
  ${promo.website && promo.website !== '없음' ? 'Website: ' + promo.website : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We will contact you shortly to confirm details and content.
For any questions, please reply to this email.
  📧 hebronplatform@gmail.com
${KAKAO_BLOCK_EN}

Thank you for partnering with HebronGuide!

HebronGuide Team | hebronguide.com
Korean Immigrant Settlement Guide · 68 Cities`.trim()

  return {
    to: promo.email,
    subject: `[HebronGuide] ${promo.name || promo.title} 홍보 신청 승인 안내`,
    text: ko + '\n\n---\n\n' + en,
    adminSubject: `[관리자 알림] 광고 승인 완료 · ${promo.name || promo.title} · ${promo.city || ''}`,
    adminText: `제목: ${promo.name || promo.title}\n도시: ${promo.city}\n이메일: ${promo.email}\n기간: ${promo.period || '미정'}\n\n광고 승인 확인 이메일 발송 완료.`,
  }
}

// ── 추천 목사 알림 이메일 ─────────────────────────────────────────────────
function buildPastorReferralEmail(biz) {
  const cityUrl = biz.city_slug
    ? `https://hebronguide.com/${biz.city_slug}/`
    : 'https://hebronguide.com/'

  const ko = `
안녕하세요, 목사님! 🙏

목사님께서 추천해 주신 ${biz.biz_name || biz.name}이(가) HebronGuide에 등재되었습니다.
귀한 연결에 감사드립니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 등재 확인
${cityUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  업체명: ${biz.biz_name || biz.name}
  업종: ${biz.type || '—'}
  도시: ${biz.city || '—'}
  ${biz.biz_email ? '업체 이메일: ' + biz.biz_email : ''}

HebronGuide는 목사님의 파트너 네트워크를 통해 성장하고 있습니다.
이민자 정착과 교회 연결을 위해 함께해 주셔서 감사합니다.
${KAKAO_BLOCK}

HebronGuide 팀 | hebronguide.com
"내가 나그네 되었을 때 너희가 영접하였다" — 마태복음 25:35`.trim()

  return {
    to: biz.email,  // pastor_email
    subject: `[HebronGuide] 추천하신 ${biz.biz_name || biz.name} 등재 완료 안내`,
    text: ko,
    adminSubject: `[관리자 알림] 목사 추천 사업체 등재 · ${biz.biz_name || biz.name} · ${biz.city || ''}`,
    adminText: `추천 목사 이메일: ${biz.email}\n업체명: ${biz.biz_name || biz.name}\n도시: ${biz.city}\n\n추천 목사님께 알림 발송 완료.`,
  }
}

// ── 핸들러 ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).json({})
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { token, type, church, business, promo } = req.body

    // 토큰 인증
    if (!token || token !== ADMIN_HASH) {
      return res.status(401).json({ error: '인증 실패' })
    }

    const gmailPass = process.env.GMAIL_APP_PASS
    if (!gmailPass) {
      return res.status(200).json({ ok: true, skipped: true, msg: 'GMAIL_APP_PASS 미설정' })
    }

    // type에 따른 이메일 빌드
    let emailData
    if (type === 'business') {
      const biz = business || church
      if (!biz || !biz.email || biz.email === '없음' || biz.email === '') {
        return res.status(200).json({ ok: true, skipped: true, msg: '이메일 주소 없음 — 발송 건너뜀' })
      }
      emailData = buildBusinessEmail(biz)
    } else if (type === 'pastor_referral') {
      const biz = business || church
      if (!biz || !biz.email || biz.email === '없음' || biz.email === '') {
        return res.status(200).json({ ok: true, skipped: true, msg: '목사 이메일 없음 — 발송 건너뜀' })
      }
      emailData = buildPastorReferralEmail(biz)
    } else if (type === 'promo') {
      const p = promo || church
      if (!p || !p.email || p.email === '없음' || p.email === '') {
        return res.status(200).json({ ok: true, skipped: true, msg: '이메일 주소 없음 — 발송 건너뜀' })
      }
      emailData = buildPromoEmail(p)
    } else {
      // default: church
      if (!church || !church.email || church.email === '없음' || church.email === '') {
        return res.status(200).json({ ok: true, skipped: true, msg: '이메일 주소 없음 — 발송 건너뜀' })
      }
      emailData = buildChurchEmail(church)
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: FROM_EMAIL, pass: gmailPass },
    })

    // 수신자에게 발송
    await transporter.sendMail({
      from: `"HebronGuide" <${FROM_EMAIL}>`,
      to: emailData.to,
      replyTo: ADMIN_EMAIL,
      subject: emailData.subject,
      text: emailData.text,
    })

    // 관리자 CC
    await transporter.sendMail({
      from: `"HebronGuide Admin" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: emailData.adminSubject,
      text: emailData.adminText,
    })

    return res.status(200).json({
      ok: true,
      msg: `${emailData.to} 발송 완료`,
    })

  } catch (e) {
    console.error('notify-partner error:', e)
    return res.status(500).json({ error: e.message })
  }
}

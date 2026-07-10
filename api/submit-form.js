// api/submit-form.js — HebronGuide 폼 직접 제출
// Node.js Serverless Function (Edge 아님 — nodemailer 사용)
// 1. Supabase community_items 저장
// 2. Gmail SMTP → hebronplatform@gmail.com 즉시 알림
// 수정: title 컬럼 제거 (community_items 스키마에 없음) + 에러 상세 로그

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
const FROM_EMAIL   = 'Hebronplatform@gmail.com'

// 홍보 기간(~2026-10-1): 이단·금지 키워드가 없으면 즉시 자동 게시(approved)
const PROMO_AUTO_PUBLISH_UNTIL = new Date('2026-10-01T00:00:00-07:00')
const CULT_KEYWORDS = [
  '신천지','통일교','JMS','하나님의교회','여호와의증인','몰몬교','구원파','다단계','MLM',
  'Shincheonji','Unification Church','전능신교','동방번개','안상홍',
]

// 자동 게시 대상 community_items type (도시 페이지가 실제로 읽는 값)
//   businesses → 사업체 목록 / citynews → "이 도시 소식"(광고) 영역
const DISPLAY_TYPES = ['businesses', 'citynews']

// 한글 도시명·별칭 → 도시 슬러그 (city 페이지 매칭용)
function normalizeCitySlug(input) {
  if (!input) return ''
  const map = {
    '시애틀':'seattle','seattle':'seattle',
    '로스앤젤레스':'la','la':'la','l.a.':'la','오렌지카운티':'la','오씨':'la',
    'sf':'sf','샌프란시스코':'sf','베이':'sf','san francisco':'sf',
    '뉴욕':'newyork','newyork':'newyork','new york':'newyork','뉴저지':'newyork',
    '달라스':'dallas','dallas':'dallas','dfw':'dallas',
    '휴스턴':'houston','houston':'houston',
    '시카고':'chicago','chicago':'chicago',
    '워싱턴dc':'dc','dc':'dc','메릴랜드':'dc','워싱턴':'dc','washington':'dc',
    '토론토':'toronto','toronto':'toronto',
    '밴쿠버':'vancouver','vancouver':'vancouver',
    '서울':'seoul','seoul':'seoul',
    '애틀랜타':'atlanta','atlanta':'atlanta',
    '보스턴':'boston','boston':'boston',
    '내쉬빌':'nashville','nashville':'nashville',
    '필라델피아':'philadelphia','philadelphia':'philadelphia',
    '마이애미':'miami','miami':'miami',
    '캔자스시티':'kansascity','kansas city':'kansascity',
    '탬파':'tampa','tampa':'tampa',
    '도쿄':'tokyo','tokyo':'tokyo','오사카':'osaka','osaka':'osaka',
  }
  const key = String(input).trim().toLowerCase()
  return map[key] || (/^[a-z0-9]+$/.test(key) ? key : '')
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({})
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      type, subject, body, name, email, phone, city,
      // 구조화 자동 게시용 (프론트에서 사업체·광고 신청 시 함께 전송)
      itemType,   // 도시 페이지 표시 타입: 'businesses' | 'citynews'
      citySlug,   // 도시 슬러그 / 한글 도시명 / 'all'(전 도시)
      bizName,    // 목록에 표시할 이름 (업체명·광고 제목)
      website,    // 링크
      desc,       // 목록에 표시할 짧은 소개
      endDate,    // 광고 종료일 (YYYY-MM-DD) — 지나면 자동 숨김
    } = req.body

    if (!subject || !body) {
      return res.status(400).json({ error: '필수 항목이 없습니다' })
    }

    // ── 0. 이단·금지 키워드 검사 (즉시 차단) ──────────────────
    const scanText = [subject, body, name, bizName].join(' ').toLowerCase()
    const cultHit = CULT_KEYWORDS.find(kw => scanText.includes(kw.toLowerCase()))
    if (cultHit) {
      return res.status(200).json({
        status: 'rejected',
        message: '등재가 어렵습니다. 문의: hebronplatform@gmail.com',
      })
    }

    // ── 홍보 기간 자동 게시 판단 ──────────────────────────────
    // 실제 도시 페이지에 뜨려면: 표시 타입 + 도시 슬러그가 있어야 함.
    // (교회는 별도 submit-church(AI 심사). 여기선 사업체·홍보만.)
    const inPromo = new Date() < PROMO_AUTO_PUBLISH_UNTIL
    const rawSlug = String(citySlug || city || '').trim().toLowerCase()
    const isAllCities = rawSlug === 'all'
    const slug = isAllCities ? 'all' : normalizeCitySlug(citySlug || city)
    const displayType = DISPLAY_TYPES.includes((itemType || '').toLowerCase())
      ? itemType.toLowerCase() : ''
    // 전 도시(all) 광고는 파급이 크므로 자동 게시 제외 → 검토 후 게시.
    // 특정 도시 + 슬러그 매칭 시에만 홍보 기간 자동 게시.
    // 협력 사업체 신청건은 자동 게시 제외 → 반드시 목사님 검토 후 승인 (Hard Rule: 미검증 파트너 자동연결 금지)
    const wantsPartner = !!req.body.hebronPartner
    const autoPublish = inPromo && !!displayType && !!slug && !isAllCities && !wantsPartner
    const itemStatus = autoPublish ? 'approved' : 'pending'
    // 협력 사업체는 pending이라도 '표시형 레코드'로 저장 → 목사님 승인(status→approved) 즉시 최상단 노출
    const hasDisplayShape = !!displayType && !!slug && !isAllCities
    const useDisplayRecord = autoPublish || (wantsPartner && hasDisplayShape)
    // 파트너 마커는 서버가 심음(사용자가 자유 텍스트로 위조 불가) — 도시 페이지가 이 마커로 협력 사업체를 격상
    const partnerMark = wantsPartner ? '🤝Hebron파트너✅ ' : ''

    // 종료일 토큰 — 프론트가 파싱해 지난 광고 자동 숨김 (별도 컬럼 없이 description에 저장)
    const endTok = /^\d{4}-\d{2}-\d{2}$/.test(String(endDate || '')) ? `⏳END:${endDate}⏳ ` : ''

    // ── 1. Supabase 저장 ─────────────────────────────────────
    const record = useDisplayRecord
      ? {
          // 도시 페이지가 실제로 읽는 구조화 레코드
          type:        displayType,
          category:    displayType === 'businesses' ? 'business' : 'citynews',
          city_slug:   slug,
          emoji:       displayType === 'businesses' ? '🏪' : '📣',
          name:        bizName || name || subject,
          description: (displayType === 'citynews' ? endTok : '') + partnerMark + (desc || body),
          website:     website || null,
          contact:     email || '',
          phone:       phone || '',
          status:      itemStatus,
          submitted_at: new Date().toISOString(),
        }
      : {
          // 문의 접수 (표시 안 됨 — 관리자 검토용)
          name:        name || subject,
          description: `[${subject}]\n\n${body}`,
          category:    type || 'general',
          contact:     email || '',
          phone:       phone || '',
          city_slug:   slug || city || '',
          status:      'pending',
          submitted_at: new Date().toISOString(),
        }
    // status='approved' 삽입은 RLS를 우회하는 서비스 키 필요 (anon 키는 pending만 허용될 수 있음)
    const writeKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY || SUPABASE_KEY
    let savedOk = false
    let saveErrorDetail = ''
    try {
      const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/community_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': writeKey,
          'Authorization': `Bearer ${writeKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(record),
      })

      if (saveRes.ok) {
        savedOk = true
        console.log('Supabase save OK')
      } else {
        const errText = await saveRes.text().catch(() => 'unknown')
        saveErrorDetail = `HTTP ${saveRes.status}: ${errText}`
        console.error('Supabase save failed:', saveErrorDetail)
      }
    } catch (e) {
      saveErrorDetail = e.message
      console.warn('Supabase save exception:', e.message)
    }

    // ── 2. Gmail SMTP 이메일 전송 ─────────────────────────────
    let emailOk = false
    let emailSkipped = false
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
          `유형:   ${type  || '—'}`,
          '── HebronGuide Partner · hebronguide.com ──',
        ].join('\n')

        await transporter.sendMail({
          from:     `"HebronGuide 신청" <${FROM_EMAIL}>`,
          to:       ADMIN_EMAIL,
          replyTo:  email || FROM_EMAIL,
          subject:  `[HebronGuide] ${subject}`,
          text:     emailBody,
        })
        emailOk = true
        console.log('Email sent successfully to', ADMIN_EMAIL)
      } catch (e) {
        console.error('Gmail send failed:', e.message)
      }
    } else {
      // GMAIL_APP_PASS 미설정 — 이메일은 선택 기능, 실패로 카운트 안 함
      emailSkipped = true
      console.warn('GMAIL_APP_PASS not set — email skipped (not a failure)')
    }

    // ── 3. 응답 ──────────────────────────────────────────────
    // 이메일 미설정 시: Supabase 저장만 필요
    // 이메일 설정 시: 둘 중 하나만 성공해도 OK
    const anythingWorked = savedOk || emailOk || emailSkipped

    if (!savedOk && !emailOk && !emailSkipped) {
      // 이메일 설정됐는데 둘 다 실패
      return res.status(500).json({
        error: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        _debug: process.env.NODE_ENV !== 'production' ? saveErrorDetail : undefined,
      })
    }

    if (!savedOk && emailSkipped) {
      // 이메일 미설정 + Supabase 실패 → 진짜 에러
      return res.status(500).json({
        error: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        _debug: process.env.NODE_ENV !== 'production' ? saveErrorDetail : undefined,
      })
    }

    return res.status(200).json({
      ok:      true,
      saved:   savedOk,
      emailed: emailOk,
      status:  itemStatus,
      message: autoPublish
        ? '등재되었습니다! 지금 바로 도시 페이지에서 확인하실 수 있습니다. 🎉'
        : '신청이 접수되었습니다. 48시간 이내에 연락드리겠습니다. 🙏',
    })

  } catch (err) {
    console.error('submit-form error:', err)
    return res.status(500).json({ error: '서버 오류가 발생했습니다' })
  }
}

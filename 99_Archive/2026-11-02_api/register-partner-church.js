// api/register-partner-church.js
// 파트너 교회 등록 신청 → churches 테이블(협력교회 데이터가 사는 곳)에 '풍부한 필드'로 저장.
// 흐름: 폼 제출(협력교회 체크 + 상세) → 여기서 status=pending·active=false·hebron_partner=false 로 저장
//       → 관리자가 admin에서 확인 후 승인(active=true, 협력교회면 hebron_partner=true) → 시애틀지구촌교회처럼 협력교회 카드로 노출.
// churches 실제 컬럼만 사용: name·name_en·city_slug·description·phone·email·website·address·denomination·service_time·hebron_partner·hcmi·tier·active·source·status
import nodemailer from 'nodemailer'

const SUPABASE_URL = 'https://vextxqzggznulwpganwt.supabase.co'
const ADMIN_EMAIL  = 'hebronplatform@gmail.com'
const FROM_EMAIL   = 'Hebronplatform@gmail.com'

// 이단·사이비 (즉시 거절)
const CULT_KEYWORDS = [
  '신천지', '통일교', 'JMS', '정명석', '하나님의교회',
  '여호와의증인', '몰몬교', 'LDS', '구원파', '이만희', '안상홍', '세계일보',
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const {
      nameKo, nameEn,          // 교회명 (한/영)
      pastorKo, pastorEn,      // 담임목사 (한/영)
      city_slug,
      address,                 // 주소
      serviceTime,             // 예배시간
      denomination,            // 교단
      website, phone, email,
      hcmi,                    // 가정교회(HCMI) 여부 (bool)
      features,                // 특징 (쉼표 구분: "정착도움, 가정교회, 시니어 환영")
      requestPartner,          // ☑ Hebron 협력교회 신청 (bool)
      note,                    // 자유 메모
    } = req.body || {}

    const name = (nameKo || nameEn || '').trim()
    if (!name || !city_slug?.trim()) {
      return res.status(400).json({ error: '교회명과 도시는 필수입니다.' })
    }

    // ── 이단 키워드 차단 ──
    const fullText = [name, nameEn, denomination, features, note].join(' ')
    const cultHit = CULT_KEYWORDS.find(kw => fullText.toLowerCase().includes(kw.toLowerCase()))
    if (cultHit) {
      return res.status(200).json({ status: 'rejected', message: '등재가 어렵습니다. 문의: hebronplatform@gmail.com' })
    }

    // ── description 구성 (churches엔 pastor·tags 컬럼이 없어 여기에 담아 카드에 표시) ──
    const pastorLine = pastorKo ? `담임: ${pastorKo}${pastorEn ? ` (${pastorEn})` : ''}` : ''
    const description = [pastorLine, features, note].map(s => (s || '').trim()).filter(Boolean).join(' · ') || null

    // ── churches 저장 (service key — RLS 통과) · 승인 전이라 숨김 ──
    const key = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY
    let insertedId = null, savedOk = false
    if (key) {
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/churches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: key,
            Authorization: `Bearer ${key}`,
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            name,
            name_en:      nameEn || null,
            city_slug:    city_slug.trim(),
            description,
            phone:        phone || null,
            email:        email || null,
            website:      website || null,
            address:      address || null,
            denomination: denomination || null,
            service_time: serviceTime || null,
            hebron_partner: false,        // 승인 시 목사님이 true로 (협력교회 신청건이면)
            hcmi:         !!hcmi,
            tier:         requestPartner ? 1 : 2,
            active:       false,          // 승인 전 비노출
            source:       requestPartner ? 'partner_form_request' : 'church_form',
            status:       'pending',
          }),
        })
        const data = await r.json().catch(() => null)
        savedOk = r.ok || r.status === 201
        insertedId = Array.isArray(data) ? data[0]?.id ?? null : null
        if (!savedOk) console.warn('partner-church save non-ok:', r.status, JSON.stringify(data))
      } catch (e) { console.error('partner-church insert failed:', e.message) }
    } else {
      console.warn('SUPABASE_SERVICE_KEY 미설정 — churches 저장 건너뜀')
    }

    // ── 관리자 이메일 (승인 유도) ──
    let emailOk = false
    const gmailPass = process.env.GMAIL_APP_PASS
    if (gmailPass) {
      try {
        const t = nodemailer.createTransport({ service: 'gmail', auth: { user: FROM_EMAIL, pass: gmailPass } })
        await t.sendMail({
          from:    `"HebronGuide 파트너교회" <${FROM_EMAIL}>`,
          to:      ADMIN_EMAIL,
          replyTo: email || FROM_EMAIL,
          subject: `[HebronGuide] ${requestPartner ? '⭐ 협력교회 신청' : '교회 등록 신청'} — ${name} (${city_slug})`,
          text: [
            `${requestPartner ? '⭐ Hebron 협력교회 신청' : '교회 등록 신청'}이 접수되었습니다.`,
            '─────────────────────────────────────',
            `교회명: ${name}${nameEn ? ` (${nameEn})` : ''}`,
            `담임목사: ${pastorKo || '-'}${pastorEn ? ` (${pastorEn})` : ''}`,
            `도시: ${city_slug}`,
            `주소: ${address || '-'}`,
            `예배시간: ${serviceTime || '-'}`,
            `교단: ${denomination || '-'}`,
            `가정교회(HCMI): ${hcmi ? '예' : '아니오'}`,
            `홈페이지: ${website || '-'}`,
            `전화: ${phone || '-'}  이메일: ${email || '-'}`,
            `특징: ${features || '-'}`,
            requestPartner ? '\n※ 협력교회 신청건 — 확인 후 admin에서 active=true, hebron_partner=true 로 승인하면 협력교회 카드로 노출됩니다.' : '',
            '─────────────────────────────────────',
            `DB ID: ${insertedId || '저장 실패'} · 관리: hebronguide.com/admin.html (교회)`,
          ].join('\n'),
        })
        emailOk = true
      } catch (e) { console.error('partner-church email failed:', e.message) }
    }

    if (savedOk || emailOk) {
      return res.status(200).json({
        status: 'pending', saved: savedOk, id: insertedId,
        message: requestPartner
          ? '협력교회 신청이 접수되었습니다. 확인 후 등재해 드립니다. 감사합니다! 🙏'
          : '교회 등록 신청이 접수되었습니다. 확인 후 등재해 드립니다. 감사합니다! 🙏',
      })
    }
    return res.status(500).json({ error: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.' })
  } catch (e) {
    console.error('register-partner-church error:', e)
    return res.status(500).json({ error: e.message })
  }
}

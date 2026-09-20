/**
 * HebronGuide — 교회 환영·축하 편지 (재)발송 API
 *
 * admin.html 교회 카드의 "환영메일 보내기/재발송" 버튼이 호출한다.
 * DB 직접 등재 등으로 환영 편지를 못 받은 교회에게 목사님이 언제든 보낼 수 있게 한다.
 *
 * 왜 별도 파일인가:
 *   admin-action.js는 Edge 런타임이라 nodemailer(이메일)를 못 쓴다.
 *   이 파일은 Node 런타임(기본)이라 submit-church.js처럼 Gmail SMTP 발송이 가능하다.
 *
 * 발송 상태 추적:
 *   community_items에는 발송여부 전용 컬럼이 없다(스키마 제약).
 *   → tags 배열에 'welcome_sent' 마커를 추가해 대시보드가 상태를 표시한다.
 */

import nodemailer from 'nodemailer';

const SUPABASE_URL = "https://vextxqzggznulwpganwt.supabase.co";
const ADMIN_EMAIL  = "hebronplatform@gmail.com";
const FROM_EMAIL   = "Hebronplatform@gmail.com";

// admin-action.js 와 같은 지문. 평문은 적지 않는다.
const ADMIN_HASH = "c0832739b0def5f86bf059aab9d58cea77ae10391ba45124d5bc4640cd94d119";

// ── 도시 슬러그 정규화 (submit-church.js와 동일 기준 — DC/VA/MD 분리) ──
function normalizeCitySlug(input) {
  if (!input) return input;
  const map = {
    '서울':'seoul','la':'la','로스앤젤레스':'la','los angeles':'la',
    'seattle':'seattle','시애틀':'seattle',
    'dallas':'dallas','달라스':'dallas','dfw':'dallas',
    'new york':'newyork','newyork':'newyork','뉴욕':'newyork',
    'houston':'houston','휴스턴':'houston',
    'atlanta':'atlanta','애틀랜타':'atlanta',
    'miami':'miami','마이애미':'miami',
    'philadelphia':'philadelphia','필라델피아':'philadelphia',
    'boston':'boston','보스턴':'boston',
    'nashville':'nashville','내쉬빌':'nashville',
    'san francisco':'sf','sf':'sf','샌프란시스코':'sf',
    'kansas city':'kansascity','캔자스시티':'kansascity',
    'chicago':'chicago','시카고':'chicago',
    'dc':'dc','washington':'dc','washington dc':'dc','워싱턴':'dc','워싱턴dc':'dc',
    'virginia':'virginia','버지니아':'virginia','va':'virginia',
    'fairfax':'virginia','페어팩스':'virginia','centreville':'virginia','센터빌':'virginia','woodbridge':'virginia','우드브리지':'virginia',
    'maryland':'maryland','메릴랜드':'maryland','md':'maryland','silver spring':'maryland','실버스프링':'maryland',
    'memphis':'memphis','멤피스':'memphis',
    'huntsville':'huntsville','헌츠빌':'huntsville',
    'toronto':'toronto','토론토':'toronto',
    'vancouver':'vancouver','밴쿠버':'vancouver',
  };
  const key = input.trim().toLowerCase();
  return map[key] || key.replace(/[^a-z0-9]/g,'') || input;
}

/* ═══════════════════════════════════════════════════════════════
   여기부터 — 2026-09-20 옮겨 심은 것
   notify-partner.js / send-church-invite.js 는 12개 함수 한도를 맞추려고
   2026-07-09·07-24 에 '미사용'으로 지워졌는데, 실제로는 쓰이고 있었다.
   화면은 계속 그 주소를 불렀고 404 가 돌아왔다 — 두 달 넘게 조용히 죽어 있었다.
   편지 본문은 목사님 글이라 그대로 옮긴다.
   ═══════════════════════════════════════════════════════════════ */

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
81개 도시 한인 이주민 정착 가이드`.trim()

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
Korean Immigrant Settlement Guide · 81 Cities`.trim()

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
81개 도시 한인 이주민 정착 가이드`.trim()

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
Korean Immigrant Settlement Guide · 81 Cities`.trim()

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
81개 도시 한인 이주민 정착 가이드`.trim()

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
Korean Immigrant Settlement Guide · 81 Cities`.trim()

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

/* ── 관리자 출입증 ─────────────────────────────────────────────
   지문(PW_HASH)은 화면 소스에 들어 있어 출입증이 될 수 없다 (2026-09-20).
   화면이 비밀번호를 보내면 서버가 확인하고, 서버만 아는 비밀로 서명한
   시간 제한 출입증을 내준다. 발급은 admin-action.js 의 action:'login'.
   ※ 같은 코드가 네 함수에 복사돼 있다 — 공통 파일을 두면 13번째 함수로
      세어져 배포가 조용히 실패할 위험이 있다 (2026-07 사고 2건).
   ─────────────────────────────────────────────────────────── */
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000   // 12시간

const _hex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')

async function _signingKey() {
  // 서버에만 있는 값에서 서명 키를 만든다. 원래 용도와 섞이지 않게 앞에 표식을 붙인다.
  const base = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY || ''
  if (!base) throw new Error('서명 키 없음: Vercel 환경변수 SUPABASE_SERVICE_KEY_MAIN 확인')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('hebron-admin-session|' + base))
  return crypto.subtle.importKey('raw', digest, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
}

async function issueAdminToken() {
  const exp = Date.now() + TOKEN_TTL_MS
  const sig = _hex(await crypto.subtle.sign('HMAC', await _signingKey(), new TextEncoder().encode(String(exp))))
  return { token: `${exp}.${sig}`, expiresAt: exp }
}

async function validAdminToken(t) {
  try {
    if (typeof t !== 'string' || !t.includes('.')) return false
    const [expStr, sig] = t.split('.')
    const exp = Number(expStr)
    if (!exp || exp < Date.now()) return false
    const want = _hex(await crypto.subtle.sign('HMAC', await _signingKey(), new TextEncoder().encode(expStr)))
    if (!sig || sig.length !== want.length) return false
    let diff = 0
    for (let i = 0; i < want.length; i++) diff |= sig.charCodeAt(i) ^ want.charCodeAt(i)
    return diff === 0
  } catch { return false }
}

async function sha256Hex(s) {
  return _hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s))))
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, token, id, email, pastor, churchName, city, serviceTimes, phone, approved } = req.body || {};

  // ── 관리자 인증 ──
  if (!(await validAdminToken(token))) {
    return res.status(401).json({ error: "인증 실패: 관리자 토큰 불일치" });
  }

  // ── action: 'notify' — 옛 /api/notify-partner ────────────────
  //    승인 확인 편지 (교회 · 사업체 · 홍보 · 목사 추천)
  if (action === 'notify') {
    try {
      const { type, church, business, promo } = req.body || {};
  
      // 토큰 인증
      if (!(await validAdminToken(token))) {
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
      console.error('[send-welcome] notify 실패:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  // ── action: 'invite' — 옛 /api/send-church-invite ────────────
  //    파트너 교회 초대장. 옛 함수에는 인증이 없어 누구나 목사님 이름으로
  //    메일을 보낼 수 있었다. 여기서는 관리자 지문을 반드시 통과해야 한다.
  if (action === 'invite') {
    try {
  const { churchName, pastorName, email, city = '(도시)', memo = '' } = req.body || {};
  
    if (!churchName?.trim() || !pastorName?.trim() || !email?.trim()) {
      return res.status(400).json({ message: '교회명, 목사님 성함, 이메일은 필수입니다.' });
    }
  
    const cityUrl = city.toLowerCase().replace(/\s+/g, '').replace(/[^a-z가-힣]/g, '');
  
    const bodyKo = [
      `${pastorName} 목사님, 안녕하세요.`,
      '',
      '저는 HebronGuide 대표 폴 김 목사입니다.',
      '',
      `${city}에 새로 도착하는 한인 이민자들을 위해`,
      '목사님의 교회가 첫 환대자가 되어 주시기를 바랍니다.',
      '',
      'HebronGuide는 전 세계 81개+ 도시에서',
      '새 이민자가 처음 맞이하는 글로벌 환대 커뮤니티입니다.',
      '"낯선 도시, 이미 누군가 기다리고 있습니다."',
      '그 누군가가 목사님의 교회가 되어 주시기를 바랍니다.',
      '',
      '─── 파트너 교회 혜택 ───────────────',
      '· 교회 무료 등재 (hebronguide.com 도시 페이지)',
      '· HebronGuide 카카오 채널 소개',
      '· 새 이민자 정착 연결 서비스',
      '· 매월 파트너 목사님 Zoom 교류 모임',
      '',
      '─── 함께하시려면 ────────────────────',
      '아래 링크에서 교회 등재 신청 (무료, 3분):',
      'https://hebronguide.com/ad-request.html',
      '',
      '카카오 채널 구독:',
      'https://pf.kakao.com/_dxdxlbX',
      '',
      ...(memo ? [`─── 메모 ───────────────────────────`, memo, ''] : []),
      '감사합니다.',
      '폴 김 목사 | HebronGuide',
      'hebronplatform@gmail.com',
      'hebronguide.com',
    ].join('\n');
  
    const htmlBody = `
  <!DOCTYPE html>
  <html lang="ko">
  <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;padding:0;background:#f4f1ea;font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:32px 16px;">
  <tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
  
    <!-- HEADER -->
    <tr><td style="background:linear-gradient(135deg,#0a0e14 0%,#1a2035 100%);border-radius:16px 16px 0 0;padding:32px 32px 28px;text-align:center;">
      <div style="font-family:'Georgia',serif;font-weight:700;font-size:1.5rem;color:#fff;letter-spacing:.02em;">
        Hebron<span style="color:#C9A227;">Guide</span>
      </div>
      <div style="font-size:.72rem;color:rgba(255,255,255,.45);margin-top:4px;letter-spacing:.06em;">낯선 도시, 이미 누군가 기다렸습니다</div>
    </td></tr>
  
    <!-- BODY -->
    <tr><td style="background:#fff;padding:32px 32px 28px;">
      <p style="font-size:1rem;color:#1a1a1a;font-weight:700;margin:0 0 20px;">${pastorName} 목사님, 안녕하세요.</p>
      <p style="font-size:.9rem;color:#444;line-height:1.85;margin:0 0 16px;">
        저는 <strong>HebronGuide</strong> 대표 폴 김 목사입니다.<br><br>
        <strong>${city}</strong>에 새로 도착하는 한인 이민자들을 위해<br>
        <strong style="color:#C9A227;">${churchName}</strong>이 첫 번째 얼굴이 되어 주시기를 부탁드립니다.
      </p>
      <div style="background:#fdf9f0;border-left:3px solid #C9A227;border-radius:0 10px 10px 0;padding:16px 20px;margin:20px 0;">
        <p style="font-size:.88rem;color:#333;font-style:italic;margin:0;line-height:1.8;">
          "낯선 도시, 이미 누군가 기다리고 있습니다."<br>
          그 누군가가 목사님의 교회가 되어 주시기를 바랍니다.
        </p>
      </div>
  
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td style="background:#f8f7f4;border-radius:12px;padding:20px 22px;">
          <p style="font-size:.72rem;font-weight:800;color:#C9A227;letter-spacing:.1em;text-transform:uppercase;margin:0 0 14px;">파트너 교회 혜택</p>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="padding:4px 0;font-size:.84rem;color:#333;">
              <span style="color:#C9A227;font-weight:900;margin-right:8px;">·</span>교회 무료 등재 (hebronguide.com 도시 페이지)
            </td></tr>
            <tr><td style="padding:4px 0;font-size:.84rem;color:#333;">
              <span style="color:#C9A227;font-weight:900;margin-right:8px;">·</span>HebronGuide 카카오 채널 소개 및 홍보
            </td></tr>
            <tr><td style="padding:4px 0;font-size:.84rem;color:#333;">
              <span style="color:#C9A227;font-weight:900;margin-right:8px;">·</span>새 이민자 정착 연결 서비스
            </td></tr>
            <tr><td style="padding:4px 0;font-size:.84rem;color:#333;">
              <span style="color:#C9A227;font-weight:900;margin-right:8px;">·</span>매월 파트너 목사님 Zoom 교류 모임
            </td></tr>
          </table>
        </td></tr>
      </table>
  
      <p style="font-size:.88rem;color:#444;line-height:1.8;margin:0 0 20px;">
        모든 등재는 <strong>완전 무료</strong>이며, 3분이면 신청이 완료됩니다.
      </p>
  
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48%" style="padding-right:6px;">
            <a href="https://hebronguide.com/ad-request.html" style="display:block;background:linear-gradient(135deg,#C9A227,#f0c040);color:#0a0e14;text-decoration:none;font-weight:900;font-size:.85rem;text-align:center;padding:14px;border-radius:10px;">
              교회 등재 신청 (무료) →
            </a>
          </td>
          <td width="4%"></td>
          <td width="48%" style="padding-left:6px;">
            <a href="https://pf.kakao.com/_dxdxlbX" style="display:block;background:#FEE500;color:#3C1E1E;text-decoration:none;font-weight:900;font-size:.85rem;text-align:center;padding:14px;border-radius:10px;">
              카카오 채널 구독
            </a>
          </td>
        </tr>
      </table>
    </td></tr>
  
    <!-- FOOTER -->
    <tr><td style="background:#0a0e14;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
      <p style="font-size:.75rem;color:rgba(255,255,255,.4);margin:0;line-height:1.8;">
        폴 김 목사 · HebronGuide · Hebron Platform LLC<br>
        <a href="mailto:hebronplatform@gmail.com" style="color:#C9A227;text-decoration:none;">hebronplatform@gmail.com</a>
        &nbsp;·&nbsp;
        <a href="https://hebronguide.com" style="color:#C9A227;text-decoration:none;">hebronguide.com</a>
      </p>
    </td></tr>
  
  </table>
  </td></tr>
  </table>
  </body>
  </html>`;
  
    const gmailPass = process.env.GMAIL_APP_PASS;
    if (!gmailPass) {
      return res.status(500).json({ message: 'GMAIL_APP_PASS 환경 변수가 설정되지 않았습니다.' });
    }
  
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: FROM_EMAIL, pass: gmailPass },
      });
  
      // 교회에 발송
      await transporter.sendMail({
        from: `"폴 김 목사 · HebronGuide" <${FROM_EMAIL}>`,
        to: email,
        subject: `[HebronGuide] ${churchName} — 파트너 교회 초대`,
        text: bodyKo,
        html: htmlBody,
      });
  
      // 관리자 발송 기록
      await transporter.sendMail({
        from: `"HebronGuide Admin" <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: `[발송완료] ${churchName} (${pastorName} 목사) · ${city}`,
        text: [
          `초대 이메일 발송 완료`,
          ``,
          `교회명: ${churchName}`,
          `목사님: ${pastorName}`,
          `이메일: ${email}`,
          `도시:   ${city}`,
          ...(memo ? [`메모:   ${memo}`] : []),
          ``,
          `발송 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'America/Los_Angeles' })} (PT)`,
        ].join('\n'),
      });
  
      return res.status(200).json({
        status: 'sent',
        message: `${pastorName} 목사님께 초대 이메일이 발송되었습니다.`,
      });
  
    } catch (e) {
      console.error('[send-church-invite]', e.message);
      return res.status(500).json({ message: '이메일 발송 실패: ' + e.message });
    }
    } catch (e) {
      console.error('[send-welcome] invite 실패:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }
  if (!email?.trim()) {
    return res.status(400).json({ error: "받는 이메일이 없습니다. 신청자 이메일을 먼저 등록해 주세요." });
  }

  // ── 환영 편지 발송 ──
  const sent = await sendEmail({
    to: email,
    subject: `[HebronGuide] ${pastor || "목사님"}, 환대 운동에 함께해 주셔서 감사합니다`,
    text: partnerWelcomeLetter({ pastor, churchName, city, phone, serviceTimes, approved: approved !== false }),
  });

  if (!sent) {
    return res.status(500).json({
      error: "발송에 실패했습니다. 서버 Gmail 설정(GMAIL_APP_PASS)을 확인해 주세요.",
    });
  }

  // ── 발송 상태 마커 (tags에 welcome_sent 추가) ──
  let marked = false;
  if (id) marked = await markWelcomeSent(id);

  // ── 관리자에게도 발송 사본 통지 ──
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[HebronGuide] 환영 편지 발송됨 — ${churchName || email}`,
    text: [
      `환영·축하 편지를 발송했습니다.`,
      `받는이: ${pastor || "—"} <${email}>`,
      `교회: ${churchName || "—"} / 도시: ${city || "—"}`,
      marked ? "대시보드에 '발송됨'으로 표시됩니다." : "(발송 상태 마커 저장은 실패 — 재발송해도 무방)",
    ].join("\n"),
  });

  return res.status(200).json({ ok: true, sent: true, marked });
}

// ── tags에 welcome_sent 추가 ──
async function markWelcomeSent(id) {
  const svcKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY;
  if (!svcKey) return false;
  const H = { apikey: svcKey, Authorization: `Bearer ${svcKey}`, "Content-Type": "application/json" };
  try {
    // 현재 tags 읽기
    const r = await fetch(`${SUPABASE_URL}/rest/v1/community_items?id=eq.${id}&select=tags`, { headers: H });
    const rows = r.ok ? await r.json() : [];
    const tags = Array.isArray(rows?.[0]?.tags) ? rows[0].tags : [];
    if (!tags.includes("welcome_sent")) tags.push("welcome_sent");
    const p = await fetch(`${SUPABASE_URL}/rest/v1/community_items?id=eq.${id}`, {
      method: "PATCH", headers: { ...H, Prefer: "return=minimal" },
      body: JSON.stringify({ tags }),
    });
    return p.ok;
  } catch (e) {
    console.error("[send-welcome] markWelcomeSent failed:", e.message);
    return false;
  }
}

// ── Gmail SMTP 발송 ──
async function sendEmail({ to, subject, text }) {
  const gmailPass = process.env.GMAIL_APP_PASS;
  if (!gmailPass) {
    console.warn("[send-welcome] GMAIL_APP_PASS not set — skipped:", subject);
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: FROM_EMAIL, pass: gmailPass } });
    await transporter.sendMail({ from: `"HebronGuide" <${FROM_EMAIL}>`, to, subject, text });
    return true;
  } catch (e) {
    console.error("[send-welcome] sendEmail failed:", e.message);
    return false;
  }
}

// ── 파트너 환영 편지 (submit-church.js와 동일 본문) ──
function partnerWelcomeLetter({ pastor, churchName, city, phone, serviceTimes, approved }) {
  const citySlug = normalizeCitySlug(city) || city;
  const cityUrl  = `https://hebronguide.com/${citySlug}/`;
  const pendingNote = approved ? "" : [
    "",
    "※ 교단 정보 등 일부 내용을 담당자가 확인 후 1~2일 내 도시 페이지에 정식 게재합니다.",
    "   카카오채널은 지금 바로 참여하실 수 있습니다.",
  ].join("\n");

  return [
    `${pastor || "목사님"}, 안녕하세요.`,
    "",
    `${churchName || "귀 교회"}이(가) HebronGuide 파트너 교회로 함께해 주셔서 진심으로 감사드립니다.`,
    `단순한 디렉터리 등록이 아닙니다.`,
    `목사님은 오늘, 이 도시 한인 이민자·유학생·주재원을 함께 섬기는`,
    `환대 운동의 일원이 되셨습니다.`,
    pendingNote,
    "",
    "━━━ 우리가 함께 만드는 것 ━━━━━━━━━━━━━━━━━━━━",
    "",
    "낯선 도시에 처음 도착한 누군가가",
    "HebronGuide에서 목사님 교회를 발견하고,",
    "파트너 사업체에서 첫 도움을 받고,",
    "자연스럽게 교회 공동체 안으로 연결됩니다.",
    "",
    "    교회  +  사업체  +  HebronGuide",
    "    셋이 손을 잡는 환대 구조입니다.",
    "",
    "    \"내가 나그네 되었을 때 너희가 영접하였다\"",
    "    — 마태복음 25:35 (새번역)",
    "",
    "━━━ 지금 바로 하실 두 가지 ━━━━━━━━━━━━━━━━━━━",
    "",
    "1. 카카오채널 친구추가 — 파트너 교회·사업체 소통 공간",
    "   새 이민자 연결 요청, 도시 소식, 파트너 협업이 여기서 시작됩니다.",
    "   → https://pf.kakao.com/_dxdxlbX",
    "",
    `2. 도시 페이지에서 교회 확인`,
    `   → ${cityUrl}`,
    "",
    "정보 수정·문의: hebronplatform@gmail.com",
    "(이 이메일로 회신하시면 됩니다)",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "HebronGuide · hebronguide.com",
    "하나님 나라를 위한 환대의 디지털 첫 관문",
  ].filter(l => l !== null && l !== undefined).join("\n");
}

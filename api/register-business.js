/**
 * /api/register-business  — HebronGuide 사업체 등록 자동 처리
 *
 * 흐름:
 *   biz-join.html 폼 제출
 *     → community_items 저장 (status: 'pending', category: 'business')
 *     → 신청자에게 감사 이메일 자동 발송
 *     → 관리자(hebronplatform@gmail.com)에게 알림 이메일
 */

import nodemailer from 'nodemailer';

const SUPABASE_URL = 'https://vextxqzggznulwpganwt.supabase.co';
const ADMIN_EMAIL  = 'hebronplatform@gmail.com';
const FROM_EMAIL   = 'Hebronplatform@gmail.com';

const CULT_KEYWORDS = [
  '신천지','통일교','JMS','하나님의교회','여호와의증인','몰몬교','구원파','다단계','MLM',
];

/* ── 사기 위험 신호 감지 ─────────────────────────────────────────
   KBS 중고거래 사기 취재(2026-08) 분석 → 업소 등록에 적용.
   HebronGuide에 등재되면 "여기 있으니 믿을 만하다"가 된다.
   그 신뢰를 사기꾼이 빌려 쓰는 것이 가장 큰 위험이다.

   ⚠️ 자동 거절하지 않는다. 한인 소상공인은 실제로 카톡으로 영업하고
      홈페이지가 없는 경우가 많다. 기계가 자르면 정직한 사람이 먼저 잘린다.
      신호를 세어 목사님께 보여드리고, 승인 여부는 사람이 정한다.
─────────────────────────────────────────────────────────────── */
const RISK_MONEY = [
  '선입금', '먼저 입금', '계좌이체', '계좌 이체', '보증금', '예치금',
  '송금', '입금하시면', '입금 후', 'zelle', 'venmo', 'cashapp', 'cash app',
  '비트코인', '코인', '기프트카드', 'gift card',
];
const RISK_URGENT = [
  '급처', '급매', '오늘만', '선착순', '마감임박', '한정', '즉시',
  '빨리', '서둘', '기회를 놓치',
];
const RISK_TOOGOOD = [
  '무조건', '100% 보장', '보장합니다', '최저가', '반값', '공짜', '免',
  '수익 보장', '고수익', '월 수익',
];

function scanRisk({ name, owner, phone, email, website, address, description, category }) {
  const text = [name, owner, address, description, category].filter(Boolean).join(' ').toLowerCase();
  const flags = [];

  // ① 실체를 확인할 방법이 없다 — 가장 중요한 신호
  if (!String(phone || '').trim())   flags.push({ tag: 'risk:no_phone',   ko: '전화번호 없음' });
  if (!String(address || '').trim()) flags.push({ tag: 'risk:no_address', ko: '주소 없음' });

  // ② 추적 안 되는 채널만 남긴다 — 사기의 전형
  const hasKakaoOnly = /카카오|카톡|kakao|텔레그램|telegram|라인|line\s*id/.test(text)
                       && !String(phone || '').trim();
  if (hasKakaoOnly) flags.push({ tag: 'risk:untraceable', ko: '전화 없이 카톡·텔레그램만' });

  // ③ 돈을 먼저 보내게 하는 말
  const money = RISK_MONEY.filter(k => text.includes(k));
  if (money.length) flags.push({ tag: 'risk:prepay', ko: `선입금 유도 표현 (${money[0]})` });

  // ④ 조급하게 만드는 말 — 방송에서 반복 확인된 수법
  const urgent = RISK_URGENT.filter(k => text.includes(k));
  if (urgent.length) flags.push({ tag: 'risk:urgency', ko: `조급함 유도 (${urgent[0]})` });

  // ⑤ 너무 좋은 조건 — "5만원 생각했는데 2만원"이 첫 신호였다
  const toogood = RISK_TOOGOOD.filter(k => text.includes(k));
  if (toogood.length) flags.push({ tag: 'risk:toogood', ko: `과도한 보장 (${toogood[0]})` });

  // ⑥ 설명이 없다 — 실제로 운영하는 곳은 할 말이 있다
  if (String(description || '').trim().length < 10) {
    flags.push({ tag: 'risk:thin', ko: '소개가 거의 없음' });
  }

  // 0~100. 낮을수록 위험. 대시보드가 이미 confidence_score를 표시한다.
  const score = Math.max(0, 100 - flags.length * 18);
  return { flags, score, tags: flags.map(f => f.tag) };
}



async function sendMail({ to, subject, text, html }) {
  const pass = process.env.GMAIL_APP_PASS;
  if (!pass) { console.warn('[register-business] GMAIL_APP_PASS not set'); return; }
  const t = nodemailer.createTransport({ service: 'gmail', auth: { user: FROM_EMAIL, pass } });
  await t.sendMail({ from: `"HebronGuide" <${FROM_EMAIL}>`, to, subject, text, html });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    name,         // 업체명
    owner,        // 대표자
    phone,
    email,
    website,
    address,
    description,
    category,     // 업종
    city_slug,    // 도시 슬러그
  } = req.body || {};

  if (!name?.trim() || !city_slug?.trim()) {
    return res.status(400).json({ error: '업체명과 도시는 필수입니다.' });
  }

  // 금지 키워드 검사
  const fullText = [name, description, address].join(' ');
  const cultHit = CULT_KEYWORDS.find(kw => fullText.toLowerCase().includes(kw.toLowerCase()));
  if (cultHit) {
    return res.status(200).json({ status: 'rejected', message: '등재가 어렵습니다. 문의: hebronplatform@gmail.com' });
  }

  // 사기 위험 신호 — 세기만 하고 막지 않는다. 판단은 승인하는 사람이 한다.
  const risk = scanRisk({ name, owner, phone, email, website, address, description, category });

  // Supabase community_items 저장
  const key = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY;
  let insertedId = null;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/community_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        category:    'business',
        type:        'businesses',
        city_slug:   city_slug.trim(),
        name:        name.trim(),
        pastor:      owner || null,
        phone:       phone || null,
        email:       email || null,
        website:     website || null,
        contact:     email || phone || null,
        description: [
          category ? `업종: ${category}` : '',
          address  ? `주소: ${address}`  : '',
          description || '',
        ].filter(Boolean).join(' | ') || null,
        status:       'pending',
        tags:             risk.tags.length ? risk.tags : null,
        confidence_score: risk.score,
      }),
    });
    const data = await r.json();
    if (r.ok && Array.isArray(data)) insertedId = data[0]?.id;
  } catch (e) {
    console.error('[register-business] Supabase insert error:', e.message);
  }

  // 신청자 감사 이메일
  if (email) {
    await sendMail({
      to: email,
      subject: `[HebronGuide] ${name} 사업체 등록 신청이 접수되었습니다`,
      text: [
        `${owner || '대표님'}, 안녕하세요.`,
        '',
        `${name}의 HebronGuide 파트너 사업체 등록 신청이 정상적으로 접수되었습니다.`,
        '',
        '담당자가 1~2일 이내에 검토 후 등재 완료 안내를 드리겠습니다.',
        '',
        `접수 내용:`,
        `  업체명: ${name}`,
        `  업종: ${category || '—'}`,
        `  도시: ${city_slug}`,
        `  전화: ${phone || '—'}`,
        '',
        '감사합니다.',
        '── HebronGuide · hebronguide.com ──',
      ].join('\n'),
      html: `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:'Apple SD Gothic Neo',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f4f1ea;">
<tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#0a0e14 0%,#1a2035 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
  <div style="font-family:Georgia,serif;font-weight:700;font-size:1.5rem;color:#fff;">Hebron<span style="color:#C9A227;">Guide</span></div>
  <div style="font-size:.72rem;color:rgba(255,255,255,.45);margin-top:4px;">낯선 도시, 이미 누군가 기다렸습니다</div>
</td></tr>
<tr><td style="background:#fff;padding:32px;">
  <p style="font-size:1rem;color:#1a1a1a;font-weight:700;margin:0 0 16px;">${owner || '대표님'}, 안녕하세요.</p>
  <p style="font-size:.9rem;color:#444;line-height:1.85;margin:0 0 20px;">
    <strong>${name}</strong>의 HebronGuide 파트너 사업체 등록 신청이 정상적으로 접수되었습니다.<br><br>
    담당자가 <strong>1~2일 이내</strong>에 검토 후 등재 완료 안내를 드리겠습니다.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:12px;padding:20px 22px;margin-bottom:20px;">
    <tr><td><p style="font-size:.72rem;font-weight:800;color:#C9A227;letter-spacing:.1em;text-transform:uppercase;margin:0 0 10px;">접수 내용</p>
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding:3px 0;font-size:.84rem;color:#333;"><span style="color:#C9A227;margin-right:8px;">·</span>업체명: <strong>${name}</strong></td></tr>
        <tr><td style="padding:3px 0;font-size:.84rem;color:#333;"><span style="color:#C9A227;margin-right:8px;">·</span>업종: ${category || '—'}</td></tr>
        <tr><td style="padding:3px 0;font-size:.84rem;color:#333;"><span style="color:#C9A227;margin-right:8px;">·</span>도시: ${city_slug}</td></tr>
        <tr><td style="padding:3px 0;font-size:.84rem;color:#333;"><span style="color:#C9A227;margin-right:8px;">·</span>전화: ${phone || '—'}</td></tr>
      </table>
    </td></tr>
  </table>
  <p style="font-size:.84rem;color:#666;line-height:1.7;margin:0;">
    문의: <a href="mailto:hebronplatform@gmail.com" style="color:#C9A227;">hebronplatform@gmail.com</a>
  </p>
</td></tr>
<tr><td style="background:#0a0e14;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;">
  <p style="font-size:.73rem;color:rgba(255,255,255,.4);margin:0;">
    HebronGuide · <a href="https://hebronguide.com" style="color:#C9A227;text-decoration:none;">hebronguide.com</a>
  </p>
</td></tr>
</table></td></tr>
</table></body></html>`,
    });
  }

  // 관리자 알림
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `[HebronGuide] 사업체 등록 신청 — ${name} (${city_slug})`,
    text: [
      `[새 사업체 등록 신청]`,
      '',
      `업체명: ${name}`,
      `업종: ${category || '—'}`,
      `대표자: ${owner || '—'}`,
      `도시: ${city_slug}`,
      `전화: ${phone || '—'}`,
      `이메일: ${email || '—'}`,
      `홈페이지: ${website || '—'}`,
      `주소: ${address || '—'}`,
      `소개: ${description || '—'}`,
      '',
      `→ 관리자 대시보드에서 확인 후 승인해 주세요.`,
      `https://hebronguide.com/admin.html`,
      '',
      `DB ID: ${insertedId || '저장 실패'}`,
    ].join('\n'),
  });

  return res.status(200).json({
    status: 'pending',
    message: '신청이 접수되었습니다. 1~2일 내 이메일로 안내드립니다.',
    id: insertedId,
  });
}

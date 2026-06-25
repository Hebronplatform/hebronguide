/**
 * HebronGuide — 교회 등재 자동 처리 API
 *
 * 흐름:
 *   교회 폼 제출
 *     → AI 자동 검토
 *     → ✅ 정상  : Supabase 자동 게시 + 신청자 확인 이메일
 *     → ⚠️ 불확실 : 관리자 검토 요청 + 신청자 "1~2일 내 처리" 이메일
 *     → 🚫 이단   : 즉시 차단 + 관리자 알림
 */

import nodemailer from 'nodemailer';

const SUPABASE_URL   = "https://vextxqzggznulwpganwt.supabase.co";
const SUPABASE_TABLE = "content_items";
const ADMIN_EMAIL    = "hebronplatform@gmail.com";
const FROM_EMAIL     = "Hebronplatform@gmail.com";

// ── 이단·금지 목록 (즉시 차단) ──────────────────────
const CULT_KEYWORDS = [
  "신천지", "통일교", "JMS", "정명석", "하나님의교회",
  "여호와의증인", "몰몬교", "LDS", "구원파", "다락방",
  "지방교회", "이만희", "세계일보", "안상홍", "새일교회",
  "Shincheonji", "Unification Church", "Jehovah",
  "Church of Jesus Christ of Latter", "Mormon",
];

// ── 공인 교단 (자동 승인 강화) ───────────────────────
const APPROVED_DENOMS = [
  "SBC", "침례교", "Baptist",
  "PCA", "PCC", "PCK", "장로교", "Presbyterian",
  "UMC", "감리교", "Methodist",
  "AG", "순복음", "Assemblies of God",
  "성결교", "Holiness",
  "루터교", "Lutheran",
  "IHM", "가정교회", "House Church",
  "CRC", "EFC", "ECC",
  "Anglican", "성공회",
  "Nazarene", "나사렛",
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    churchName,    // 교회명 (한국어)
    churchNameEn,  // 교회명 (영어)
    denomination,  // 교단·소속
    pastor,        // 담당 목사
    phone,         // 전화
    email,         // 이메일
    website,       // 홈페이지
    kakao,         // 카카오채널
    address,       // 주소
    serviceTimes,  // 예배 시간
    description,   // 한 줄 소개
    city,          // 도시 슬러그 (seattle, dallas…)
  } = req.body || {};

  // ── 1. 필수 항목 확인 ──────────────────────────────
  if (!churchName?.trim() || !city?.trim()) {
    return res.status(400).json({
      status: "error",
      message: "교회명과 도시는 필수 항목입니다.",
    });
  }

  // ── 2. 이단 키워드 검사 (즉시 차단) ────────────────
  const fullText = [churchName, churchNameEn, denomination, description, website].join(" ");
  const cultHit = CULT_KEYWORDS.find(kw =>
    fullText.toLowerCase().includes(kw.toLowerCase())
  );

  if (cultHit) {
    // 관리자 알림만 (자동 거절)
    await notifyAdmin({
      level: "critical",
      churchName, denomination, city, phone, email,
      reason: `이단 키워드 감지: "${cultHit}"`,
    });
    return res.status(200).json({
      status: "critical",
      message: "등재가 어렵습니다. 문의: hebronplatform@gmail.com",
    });
  }

  // ── 3. AI 추가 검토 (선택) ───────────────────────
  let aiFlag = null;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-20240307",
          max_tokens: 150,
          system: [
            "You are HebronGuide's church listing reviewer.",
            "HebronGuide is a Korean immigrant community platform by an SBC/IHM church network.",
            "Check if this church submission seems legitimate and theologically sound.",
            "Flag ONLY if: (1) sounds cult-like despite no keyword match,",
            "(2) description is clearly spam/fake, (3) obviously not a church.",
            "Reply ONLY valid JSON: {\"ok\":true} or {\"ok\":false,\"note\":\"Korean reason\"}",
          ].join(" "),
          messages: [{
            role: "user",
            content: `교회명: ${churchName} | 교단: ${denomination || "미입력"} | 도시: ${city} | 소개: ${description || "없음"}`,
          }],
        }),
      });
      const aiData = await aiRes.json();
      const raw = aiData.content?.[0]?.text || "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        const j = JSON.parse(m[0]);
        if (!j.ok && j.note) aiFlag = j.note;
      }
    } catch (_) { /* AI 실패 무시 */ }
  }

  // ── 4. 교단 신뢰도 평가 ─────────────────────────
  const knownDenom = APPROVED_DENOMS.some(d =>
    (denomination || "").toLowerCase().includes(d.toLowerCase())
  );

  // ── 5. 최종 판단 ─────────────────────────────────
  const needsReview = aiFlag || (!denomination?.trim());
  // 교단 있고 AI OK → 자동 게시
  // 교단 없거나 AI 의심 → 관리자 확인 요청

  // ── 6. Supabase 자동 게시 (clean) ───────────────
  if (!needsReview) {
    const descKo = buildDesc({ pastor, address, serviceTimes, website, kakao, description });
    const item = {
      type: "churches",
      city_slug: city,
      emoji: "⛪",
      name: churchName,
      name_en: churchNameEn || churchName,
      desc: descKo,
      desc_en: buildDescEn({ pastor, address, serviceTimes, website, kakao, description }),
      tags: buildTags(denomination, city),
      active: true,
      order: 500,            // 중간 우선순위
      contact_phone: phone || null,
      contact_email: email || null,
      contact_kakao: kakao || null,
      contact_website: website || null,
      submitted_at: new Date().toISOString(),
    };

    let supabaseOk = false;
    const svcKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY;
    if (svcKey) {
      try {
        const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
          method: "POST",
          headers: {
            "apikey": svcKey,
            "Authorization": `Bearer ${svcKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify(item),
        });
        supabaseOk = sbRes.status < 300;
      } catch (_) { /* Supabase 실패 시 아래 이메일 폴백 */ }
    }

    if (!supabaseOk) {
      // Supabase 실패 → 관리자에게 수동 처리 요청
      await notifyAdmin({
        level: "fallback",
        churchName, denomination, city, phone, email, address, serviceTimes,
        website, kakao, pastor, description,
        reason: "Supabase 자동 게시 실패 — 수동 등록 필요",
      });
    }

    // ── 신청자 확인 이메일 (자동 게시 완료)
    if (email) {
      await sendEmail({
        to: email,
        subject: `[HebronGuide] ${churchName} 파트너 교회 등재가 완료되었습니다`,
        text: [
          `${pastor || "목사님"} 안녕하세요.`,
          "",
          `${churchName}이(가) HebronGuide ${city} 도시 가이드에 파트너 교회로 등재되었습니다.`,
          "",
          `도시 페이지에서 바로 확인하실 수 있습니다:`,
          `https://hebronguide.com/${city}/`,
          "",
          `등재 정보:`,
          `  교회명: ${churchName}`,
          `  담임목사: ${pastor || "—"}`,
          `  도시: ${city}`,
          `  전화: ${phone || "—"}`,
          `  예배시간: ${serviceTimes || "—"}`,
          "",
          `수정·문의: hebronplatform@gmail.com`,
          "",
          "── HebronGuide · hebronguide.com ──",
          "환대로 이 도시를 섬기는 모든 교회와 함께합니다.",
        ].join("\n"),
      });
    }

    return res.status(200).json({
      status: "published",
      message: supabaseOk
        ? `${churchName}이(가) 헤브론가이드에 자동 게시되었습니다.`
        : `${churchName} 정보가 접수되었습니다. 담당자가 곧 게시합니다.`,
    });
  }

  // ── 7. 불확실 → 관리자 검토 요청 + 신청자 대기 안내
  await notifyAdmin({
    level: "warning",
    churchName, denomination, city, phone, email, address, serviceTimes,
    website, kakao, pastor, description,
    reason: aiFlag || "교단 정보 없음 — 확인 후 게시 권장",
  });

  if (email) {
    await sendEmail({
      to: email,
      subject: `[HebronGuide] ${churchName} 파트너 신청이 접수되었습니다`,
      text: [
        `${pastor || "목사님"} 안녕하세요.`,
        "",
        `${churchName}의 HebronGuide 파트너 교회 신청이 정상적으로 접수되었습니다.`,
        "",
        `담당자가 1~2일 이내에 검토 후 등재 완료 안내를 드리겠습니다.`,
        "",
        `접수 정보:`,
        `  교회명: ${churchName}`,
        `  담임목사: ${pastor || "—"}`,
        `  도시: ${city}`,
        `  전화: ${phone || "—"}`,
        "",
        `문의: hebronplatform@gmail.com`,
        "",
        "── HebronGuide · hebronguide.com ──",
      ].join("\n"),
    });
  }

  return res.status(200).json({
    status: "pending",
    message: "접수되었습니다. 1~2일 내 이메일로 안내드립니다.",
  });
}

// ── 헬퍼: 이메일 발송 (nodemailer + Gmail SMTP) ──────
async function sendEmail({ to, subject, text }) {
  const gmailPass = process.env.GMAIL_APP_PASS;
  if (!gmailPass) {
    console.warn("[sendEmail] GMAIL_APP_PASS not set — skipped:", subject);
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: FROM_EMAIL, pass: gmailPass },
    });
    await transporter.sendMail({
      from: `"HebronGuide" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
    });
    console.log("[sendEmail] sent to", to);
  } catch (e) {
    console.error("[sendEmail] failed:", e.message);
  }
}

// ── 헬퍼: 관리자 알림 이메일 ─────────────────────────
async function notifyAdmin({ level, churchName, denomination, city,
  phone, email, address, serviceTimes, website, kakao, pastor, description, reason }) {

  const levelLabel = {
    critical: "이단 의심 — 즉시 확인",
    warning:  "검토 필요",
    fallback: "수동 게시 필요 (Supabase 오류)",
  }[level] || "알림";

  const body = [
    `[HebronGuide] 교회 등재 — ${levelLabel}`,
    "",
    `교회명:    ${churchName}`,
    `교단:      ${denomination || "미입력"}`,
    `도시:      ${city}`,
    `목사:      ${pastor || "—"}`,
    `전화:      ${phone || "—"}`,
    `이메일:    ${email || "—"}`,
    `주소:      ${address || "—"}`,
    `예배 시간:  ${serviceTimes || "—"}`,
    `홈페이지:   ${website || "—"}`,
    `카카오:    ${kakao || "—"}`,
    `소개:      ${description || "—"}`,
    "",
    `── 사유 ──`,
    reason,
    "",
    level === "warning"
      ? "→ 확인 후 수동 게시 또는 반려해 주세요."
      : level === "critical"
      ? "→ 이단 의심. 게시하지 마세요."
      : "→ Supabase 자동 게시 실패. 수동으로 등재해 주세요.",
    "",
    "── HebronGuide 자동 검토 시스템 ──",
  ].join("\n");

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[HebronGuide] 교회 등재 — ${levelLabel} — ${churchName}`,
    text: body,
  });
}

// ── 헬퍼: desc 포맷 ─────────────────────────────────
function buildDesc({ pastor, address, serviceTimes, website, kakao, description }) {
  const lines = ["✅ 게시됨"];
  if (pastor) lines.push(`👤 ${pastor} 목사`);
  if (address) lines.push(`📍 ${address}`);
  if (serviceTimes) lines.push(`⛪ ${serviceTimes}`);
  if (description) lines.push(description);
  if (website) lines.push(`🔗 ${website}`);
  if (kakao) lines.push(`💬 ${kakao}`);
  return lines.join("\n");
}

function buildDescEn({ pastor, address, serviceTimes, website, kakao, description }) {
  const lines = ["✅ Verified"];
  if (pastor) lines.push(`👤 Pastor ${pastor}`);
  if (address) lines.push(`📍 ${address}`);
  if (serviceTimes) lines.push(`⛪ ${serviceTimes}`);
  if (description) lines.push(description);
  if (website) lines.push(`🔗 ${website}`);
  if (kakao) lines.push(`💬 ${kakao}`);
  return lines.join("\n");
}

function buildTags(denomination, city) {
  const tags = [];
  if (denomination) tags.push(denomination);
  if (city) tags.push(city);
  return tags;
}

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
const SUPABASE_TABLE = "community_items";  // admin.html churches 탭이 조회하는 테이블
const ADMIN_EMAIL    = "hebronplatform@gmail.com";
const FROM_EMAIL     = "Hebronplatform@gmail.com";

// ── 이단·금지 목록 (즉시 차단) ──────────────────────
// 2026-06-28 업데이트: 신천지 위장 단체 3,400+건 보고 — 변형 명칭 추가
const CULT_KEYWORDS = [
  // 신천지 & 변형
  "신천지", "신천지예수교", "이만희", "만국성회", "만국성전", "시온산제단",
  "Shincheonji", "SCJ증인", "새이스라엘성전",
  // 통일교 & 변형
  "통일교", "세계평화통일가정연합", "문선명", "세계일보",
  "Unification Church", "Family Federation",
  // JMS
  "JMS", "정명석", "기독교복음선교회", "섭리교",
  // 구원파
  "구원파", "기독교복음침례회", "기쁜소식선교회",
  // 하나님의교회
  "하나님의교회", "안상홍", "안상홍증인회", "하나님의교회세계복음선교협회",
  "새일교회",
  // 여호와의증인 & 몰몬교
  "여호와의증인", "몰몬교", "LDS", "예수그리스도후기성도",
  "Church of Jesus Christ of Latter", "Jehovah", "Mormon",
  // 전능신교(동방번개)
  "전능신교", "동방번개교", "전능하신하나님교회",
  // 기타
  "지방교회", "다락방", "류광수",
];

// ── 도시 슬러그 정규화 ───────────────────────────────
function normalizeCitySlug(input) {
  if (!input) return input;
  const map = {
    '서울':'seoul','남양주':'seoul','의정부':'seoul','분당':'bundang',
    'la':'la','l.a.':'la','로스앤젤레스':'la','los angeles':'la','치노밸리':'la','chino valley':'la',
    'seattle':'seattle','시애틀':'seattle',
    'dallas':'dallas','달라스':'dallas','dfw':'dallas',
    'new york':'newyork','newyork':'newyork','nyc':'newyork','뉴욕':'newyork',
    'houston':'houston','휴스턴':'houston',
    'atlanta':'atlanta','애틀랜타':'atlanta',
    'miami':'miami','마이애미':'miami',
    'philadelphia':'philadelphia','필라델피아':'philadelphia',
    'boston':'boston','보스턴':'boston',
    'nashville':'nashville','내쉬빌':'nashville',
    'san francisco':'sf','sf':'sf','샌프란시스코':'sf',
    'kansas city':'kansascity','캔자스시티':'kansascity',
    'tampa':'tampa','탬파':'tampa',
    'fairfield':'fairfield','페어필드':'fairfield','vacaville':'fairfield',
    'waynesville':'waynesville','웨인즈빌':'waynesville',
    'chicago':'chicago','시카고':'chicago',
    'dc':'dc','washington':'dc','washington dc':'dc',
    'fairfax':'dc','페어팩스':'dc','페어펙스':'dc',
    'virginia':'dc','maryland':'dc','메릴랜드':'dc','워싱턴':'dc',
    'toronto':'toronto','토론토':'toronto',
    'vancouver':'vancouver','밴쿠버':'vancouver',
    'white rock':'vancouver','화이트락':'vancouver',
    'prince george':'princgeorge','prince george, bc':'princgeorge','프린스조지':'princgeorge',
    'bogota':'bogota','bogotá':'bogota','보고타':'bogota',
  };
  const key = input.trim().toLowerCase();
  return map[key] || key.replace(/[^a-z0-9]/g,'').replace('princegeorge','princgeorge') || input;
}

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

// ── Supabase community_items INSERT ──────────────────────────
async function saveToSupabase(itemData) {
  const svcKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY;
  if (!svcKey) {
    console.warn("[submit-church] SUPABASE_SERVICE_KEY not set — skipping DB insert");
    return false;
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
      method: "POST",
      headers: {
        "apikey": svcKey,
        "Authorization": `Bearer ${svcKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(itemData),
    });
    if (!r.ok) {
      const err = await r.text().catch(() => "");
      console.error("[submit-church] Supabase error", r.status, err);
    }
    return r.ok;
  } catch (e) {
    console.error("[submit-church] Supabase fetch error:", e.message);
    return false;
  }
}

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
          max_tokens: 200,
          system: [
            "You are HebronGuide's church screening system.",
            "HebronGuide is a Korean immigrant community platform by an SBC/IHM church network.",
            "CRITICAL: In 2026, 3,400+ disguised Shincheonji (신천지) organizations were identified.",
            "They disguise as: 독서모임(book clubs), 인문학강의(humanities lectures), 심리상담(counseling).",
            "Their pattern: diverse activities → funnel everyone to 성경 공부 → recruit to cult.",
            "They constantly rename when exposed and have NO denomination affiliation.",
            "Flag as NOT OK if: (1) cult-like despite no keyword match,",
            "(2) no denomination + unusual Bible study emphasis without clear church identity,",
            "(3) sounds like cultural/educational org, not a church,",
            "(4) description mentions 계시록 집중 or 특별성경공부 without denomination,",
            "(5) clearly spam or fake.",
            "Reply ONLY valid JSON: {\"ok\":true} or {\"ok\":false,\"note\":\"Korean reason (max 50 chars)\"}",
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
  // 2026-06-28: 신천지 위장 단체는 교단 소속이 없음 → 교단 없음 = 강화된 검토 필수
  const missingDenom = !denomination?.trim();
  const needsReview = aiFlag || missingDenom;
  // 교단 있고 AI OK → 자동 게시
  // 교단 없거나 AI 의심 → 관리자 확인 요청 (이단 위장 방지)

  // ── 6. Supabase 저장 (승인 여부와 무관하게 community_items에 저장) ──
  if (!needsReview) {
    const item = {
      category:     "church",
      type:         "churches",
      city_slug:    normalizeCitySlug(city) || city,
      emoji:        "⛪",
      name:         churchName,
      name_en:      churchNameEn || churchName,
      description:  buildDesc({ denomination, pastor, address, serviceTimes, website, kakao, description }),
      pastor:       pastor || null,
      phone:        phone || null,
      email:        email || null,
      website:      website || null,
      status:       "approved",
      submitted_at: new Date().toISOString(),
    };

    const supabaseOk = await saveToSupabase(item);

    if (!supabaseOk) {
      // Supabase 실패 → 관리자에게 수동 처리 요청
      await notifyAdmin({
        level: "fallback",
        churchName, denomination, city, phone, email, address, serviceTimes,
        website, kakao, pastor, description,
        reason: "Supabase 저장 실패(서비스키 미설정?) — 수동 등록 필요",
      });
    }

    // ── 파트너 환영 편지 (등재 완료)
    if (email) {
      await sendEmail({
        to: email,
        subject: `[HebronGuide] ${pastor || "목사님"}, 환대 운동에 함께해 주셔서 감사합니다`,
        text: partnerWelcomeLetter({ pastor, churchName, city, phone, serviceTimes, approved: true }),
      });
    }

    return res.status(200).json({
      status: "published",
      message: supabaseOk
        ? `${churchName}이(가) 헤브론가이드에 자동 게시되었습니다.`
        : `${churchName} 정보가 접수되었습니다. 담당자가 곧 게시합니다.`,
    });
  }

  // ── 7. 불확실 → Supabase pending 저장 + 관리자 검토 요청
  await saveToSupabase({
    category:     "church",
    type:         "churches",
    city_slug:    normalizeCitySlug(city) || city,
    emoji:        "⛪",
    name:         churchName,
    name_en:      churchNameEn || churchName,
    description:  buildDesc({ denomination, pastor, address, serviceTimes, website, kakao, description }),
    pastor:       pastor || null,
    phone:        phone || null,
    email:        email || null,
    website:      website || null,
    status:       "pending",
    submitted_at: new Date().toISOString(),
  });

  await notifyAdmin({
    level: "warning",
    churchName, denomination, city, phone, email, address, serviceTimes,
    website, kakao, pastor, description,
    reason: aiFlag || (missingDenom
      ? "교단 정보 없음 — 신천지 위장 단체는 교단 소속 없음. 반드시 확인 후 게시"
      : "AI 검토 필요"),
  });

  if (email) {
    await sendEmail({
      to: email,
      subject: `[HebronGuide] ${pastor || "목사님"}, 환대 운동에 함께해 주셔서 감사합니다`,
      text: partnerWelcomeLetter({ pastor, churchName, city, phone, serviceTimes, approved: false }),
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

// ── 헬퍼: 파트너 환영 편지 (한 통으로 모든 것을 전달) ──────────
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
    `${churchName}이(가) HebronGuide 파트너 교회로 등재 신청해 주셔서 진심으로 감사드립니다.`,
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
    "━━━ HebronGuide 파트너 교회 혜택 ━━━━━━━━━━━━━━━━",
    "",
    "· 도시 검색 이민자에게 교회를 가장 먼저 연결",
    "· 파트너 사업체와 환대 협력 채널 연결",
    "  (사업체는 새 이민자에게 교회를 소개하고, 교회는 생활 정보를 안내합니다)",
    "· 교회 정보 수정·업데이트 무료 지원",
    "· 도시별 파트너 교회 네트워크 참여",
    "",
    "정보 수정·문의: hebronplatform@gmail.com",
    "(이 이메일로 회신하시면 됩니다)",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "HebronGuide · hebronguide.com",
    "하나님 나라를 위한 환대의 디지털 첫 관문",
  ].filter(l => l !== null && l !== undefined).join("\n");
}

// ── 헬퍼: desc 포맷 (admin.html autoAddChurch가 파싱 가능한 구조) ─
function buildDesc({ denomination, pastor, address, serviceTimes, website, kakao, description }) {
  const lines = [];
  if (denomination) lines.push(`교단: ${denomination}`);
  if (pastor)       lines.push(`담임목사: ${pastor}`);
  if (address)      lines.push(`주소: ${address}`);
  if (serviceTimes) lines.push(`예배시간: ${serviceTimes}`);
  if (description)  lines.push(description);
  if (website && website !== '없음') lines.push(`웹사이트: ${website}`);
  if (kakao)        lines.push(`카카오: ${kakao}`);
  return lines.join("\n");
}

function buildTags(denomination, city) {
  const tags = [];
  if (denomination) tags.push(denomination);
  if (city) tags.push(city);
  return tags;
}

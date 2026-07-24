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

// admin@Hebron2026! (admin-action.js와 동일 해시)
const ADMIN_HASH = "614fea13745bbaa53de1c1c36b216c3cd5009df185b9f642089eb7ea76a69b90";

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { token, id, email, pastor, churchName, city, serviceTimes, phone, approved } = req.body || {};

  // ── 관리자 인증 ──
  if (!token || token !== ADMIN_HASH) {
    return res.status(401).json({ error: "인증 실패: 관리자 토큰 불일치" });
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

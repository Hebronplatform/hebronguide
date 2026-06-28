/**
 * HebronGuide — 음악 신청 API
 * POST /api/submit-music-request
 * body: { url, name, timePref, message }
 */

import nodemailer from 'nodemailer';

const SUPABASE_URL  = "https://vextxqzggznulwpganwt.supabase.co";
const ADMIN_EMAIL   = "hebronplatform@gmail.com";
const FROM_EMAIL    = "Hebronplatform@gmail.com";

function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { url, name, timePref, message } = req.body || {};

  if (!url?.trim()) return res.status(400).json({ error: "YouTube URL이 필요합니다" });

  const videoId = extractVideoId(url.trim());
  if (!videoId) return res.status(400).json({ error: "유효한 YouTube URL을 입력해주세요" });

  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_KEY) return res.status(500).json({ error: "서버 설정 오류" });

  // Supabase에 저장
  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/music_requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      youtube_url: url.trim(),
      video_id: videoId,
      requester_name: name?.trim() || "익명",
      time_pref: timePref || "언제나",
      message: message?.trim() || "",
      status: "pending",
    }),
  });

  if (!sbRes.ok) {
    const err = await sbRes.text();
    console.error("Supabase error:", err);
    return res.status(500).json({ error: "저장 실패" });
  }

  // 관리자 이메일 알림
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: FROM_EMAIL, pass: process.env.GMAIL_APP_PASS },
    });
    await transporter.sendMail({
      from: `"HebronGuide Music" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `[음악신청] ${name?.trim() || "익명"} — ${timePref || "언제나"}`,
      html: `
        <h3>새 음악 신청이 접수되었습니다</h3>
        <p><b>YouTube URL:</b> <a href="${url}">${url}</a></p>
        <p><b>Video ID:</b> ${videoId}</p>
        <p><b>신청자:</b> ${name?.trim() || "익명"}</p>
        <p><b>원하는 시간:</b> ${timePref || "언제나"}</p>
        <p><b>메모:</b> ${message?.trim() || "-"}</p>
        <hr>
        <p><a href="https://hebronguide.com/music-requests.html">관리자 페이지에서 승인/거절</a></p>
      `,
    });
  } catch (e) {
    console.error("Email error:", e);
  }

  return res.status(200).json({ ok: true });
}

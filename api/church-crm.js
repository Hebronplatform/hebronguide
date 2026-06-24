import nodemailer from 'nodemailer';

const SUPABASE_URL   = 'https://okhfjzofifmsgssgajts.supabase.co';
const FROM_EMAIL     = 'Hebronplatform@gmail.com';
const ADMIN_EMAIL    = 'hebronplatform@gmail.com';

function supa(path, opts = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(opts.headers || {}),
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  const pass = process.env.GMAIL_APP_PASS;
  if (!pass) throw new Error('GMAIL_APP_PASS not set');
  const t = nodemailer.createTransport({ service: 'gmail', auth: { user: FROM_EMAIL, pass } });
  await t.sendMail({ from: `"폴 김 목사 · HebronGuide" <${FROM_EMAIL}>`, to, subject, text, html });
}

// ── 초대 이메일 HTML 템플릿 ──────────────────────────────────
function buildInviteHtml({ churchName, pastorName, city, customMsg }) {
  const greeting = customMsg
    ? `<p style="font-size:.9rem;color:#444;line-height:1.85;margin:0 0 16px;white-space:pre-wrap;">${customMsg}</p>`
    : `<p style="font-size:.9rem;color:#444;line-height:1.85;margin:0 0 16px;">
        저는 <strong>HebronGuide</strong> 대표 폴 김 목사입니다.<br><br>
        <strong>${city || '해당 도시'}</strong>에 새로 도착하는 한인 이민자들을 위해<br>
        <strong style="color:#C9A227;">${churchName}</strong>이 첫 번째 얼굴이 되어 주시기를 부탁드립니다.
       </p>`;
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:'Apple SD Gothic Neo',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f4f1ea;">
<tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#0a0e14 0%,#1a2035 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
  <div style="font-family:Georgia,serif;font-weight:700;font-size:1.5rem;color:#fff;">Hebron<span style="color:#C9A227;">Guide</span></div>
  <div style="font-size:.72rem;color:rgba(255,255,255,.45);margin-top:4px;">낯선 도시, 이미 누군가 기다렸습니다</div>
</td></tr>
<tr><td style="background:#fff;padding:32px;">
  <p style="font-size:1rem;color:#1a1a1a;font-weight:700;margin:0 0 20px;">${pastorName} 목사님, 안녕하세요.</p>
  ${greeting}
  <div style="background:#fdf9f0;border-left:3px solid #C9A227;border-radius:0 10px 10px 0;padding:16px 20px;margin:20px 0;">
    <p style="font-size:.88rem;color:#333;font-style:italic;margin:0;line-height:1.8;">
      "낯선 도시, 이미 누군가 기다리고 있습니다."<br>그 누군가가 목사님의 교회가 되어 주시기를 바랍니다.
    </p>
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#f8f7f4;border-radius:12px;padding:20px 22px;">
    <tr><td><p style="font-size:.72rem;font-weight:800;color:#C9A227;letter-spacing:.1em;text-transform:uppercase;margin:0 0 12px;">파트너 교회 혜택</p>
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding:3px 0;font-size:.84rem;color:#333;"><span style="color:#C9A227;margin-right:8px;">·</span>교회 무료 등재</td></tr>
        <tr><td style="padding:3px 0;font-size:.84rem;color:#333;"><span style="color:#C9A227;margin-right:8px;">·</span>카카오 채널 소개</td></tr>
        <tr><td style="padding:3px 0;font-size:.84rem;color:#333;"><span style="color:#C9A227;margin-right:8px;">·</span>새 이민자 정착 연결</td></tr>
        <tr><td style="padding:3px 0;font-size:.84rem;color:#333;"><span style="color:#C9A227;margin-right:8px;">·</span>월례 파트너 Zoom 교류</td></tr>
      </table>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="48%" style="padding-right:6px;">
        <a href="https://hebronguide.com/ad-request.html" style="display:block;background:linear-gradient(135deg,#C9A227,#f0c040);color:#0a0e14;text-decoration:none;font-weight:900;font-size:.85rem;text-align:center;padding:13px;border-radius:10px;">교회 등재 신청 →</a>
      </td>
      <td width="4%"></td>
      <td width="48%" style="padding-left:6px;">
        <a href="https://pf.kakao.com/_dxdxlbX" style="display:block;background:#FEE500;color:#3C1E1E;text-decoration:none;font-weight:900;font-size:.85rem;text-align:center;padding:13px;border-radius:10px;">카카오 채널 구독</a>
      </td>
    </tr>
  </table>
</td></tr>
<tr><td style="background:#0a0e14;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;">
  <p style="font-size:.73rem;color:rgba(255,255,255,.4);margin:0;line-height:1.8;">
    폴 김 목사 · HebronGuide<br>
    <a href="mailto:hebronplatform@gmail.com" style="color:#C9A227;text-decoration:none;">hebronplatform@gmail.com</a>
    &nbsp;·&nbsp;
    <a href="https://hebronguide.com" style="color:#C9A227;text-decoration:none;">hebronguide.com</a>
  </p>
</td></tr>
</table></td></tr>
</table>
</body></html>`;
}

// ── 핸들러 ──────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  // ── GET: 목록 조회 ─────────────────────────────────────
  if (req.method === 'GET' && !action) {
    const r = await supa('church_partners?order=created_at.desc&select=*');
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  // ── POST: 교회 추가 ────────────────────────────────────
  if (req.method === 'POST' && action === 'add') {
    const { church_name, pastor_name, email, phone, kakao_id, city, status, notes } = req.body || {};
    if (!church_name?.trim() || !pastor_name?.trim()) {
      return res.status(400).json({ message: '교회명과 목사님 성함은 필수입니다.' });
    }
    const r = await supa('church_partners', {
      method: 'POST',
      body: JSON.stringify({
        church_name, pastor_name, email: email || null,
        phone: phone || null, kakao_id: kakao_id || null,
        city: city || null, status: status || 'invited',
        notes: notes || null,
        created_at: new Date().toISOString(),
        last_contact: null,
      }),
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : 400).json(data);
  }

  // ── PUT: 교회 수정 ────────────────────────────────────
  if (req.method === 'PUT' && action === 'update') {
    const { id, ...fields } = req.body || {};
    if (!id) return res.status(400).json({ message: 'id 필수' });
    const r = await supa(`church_partners?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : 400).json(data);
  }

  // ── DELETE: 교회 삭제 ────────────────────────────────
  if (req.method === 'DELETE' && action === 'delete') {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ message: 'id 필수' });
    const r = await supa(`church_partners?id=eq.${id}`, { method: 'DELETE' });
    return res.status(r.ok ? 200 : 400).json({ ok: r.ok });
  }

  // ── POST: 이메일 발송 (개별/전체) ────────────────────
  if (req.method === 'POST' && action === 'send-email') {
    const { ids, subject, customMsg, sendAll } = req.body || {};

    let churches = [];
    if (sendAll) {
      const r = await supa('church_partners?select=*&email=not.is.null');
      churches = await r.json();
    } else {
      const idList = (ids || []).join(',');
      const r = await supa(`church_partners?id=in.(${idList})&select=*`);
      churches = await r.json();
    }
    churches = churches.filter(c => c.email);

    if (!churches.length) return res.status(400).json({ message: '발송 대상 없음' });

    const results = [];
    for (const c of churches) {
      try {
        await sendMail({
          to: c.email,
          subject: subject || `[HebronGuide] ${c.church_name} — 파트너 교회 초대`,
          text: `${c.pastor_name} 목사님, 안녕하세요.\n\nHebronGuide 대표 폴 김 목사입니다.\n\nhebronguide.com/ad-request.html`,
          html: buildInviteHtml({ churchName: c.church_name, pastorName: c.pastor_name, city: c.city, customMsg }),
        });
        // last_contact 업데이트
        await supa(`church_partners?id=eq.${c.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ last_contact: new Date().toISOString() }),
        });
        results.push({ id: c.id, ok: true, email: c.email });
      } catch (e) {
        results.push({ id: c.id, ok: false, email: c.email, error: e.message });
      }
    }

    const ok = results.filter(r => r.ok).length;
    return res.status(200).json({ sent: ok, failed: results.length - ok, results });
  }

  return res.status(404).json({ error: 'Unknown action' });
}

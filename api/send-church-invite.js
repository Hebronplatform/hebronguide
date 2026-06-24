import nodemailer from 'nodemailer';

const FROM_EMAIL  = 'Hebronplatform@gmail.com';
const ADMIN_EMAIL = 'hebronplatform@gmail.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
    'HebronGuide는 전 세계 71개+ 도시에서',
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
}

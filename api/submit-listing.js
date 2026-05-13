/**
 * HebronGuide — 업소 등재 신청 API
 *
 * 흐름:
 *   성도 폼 제출 → AI 자동 검토 → { status, flags } 반환
 *   → 클라이언트가 mailto: 로 hebronplatform@gmail.com 에 리포트 전송
 *   → 목사 이메일 있으면 추천 요청 mailto: 별도 발송
 *
 * status 단계:
 *   clean    → 문제 없음 (자동 승인 대기)
 *   warning  → 확인 권장 (등재는 되나 김성수 목사 알림)
 *   error    → 필수 항목 누락 (재입력 요청)
 *   critical → 즉시 거절 (이단·금지 키워드)
 */

// 절대 등재 불가 키워드 (이단·사이비·다단계)
const CRITICAL_KEYWORDS = [
  '신천지', '통일교', 'JMS', '하나님의교회', '여호와의증인',
  '몰몬교', '구원파', '세계일보', '다단계', 'MLM',
  'Scientology', '사이언톨로지',
];

// 주의 키워드 (경고 플래그 — 자동 거절 아님)
const WARNING_KEYWORDS = [
  '최고', '1등', '유일한', '보장', '확실한 수익', '무조건',
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    memberName,   // 성도 이름
    churchName,   // 소속 교회
    pastorEmail,  // 목사님 이메일 (추천 요청용)
    phone,
    email,
    bizType,      // 업종
    bizName,      // 업소명
    address,
    website,
    description,  // 한 줄 소개
    city,
  } = req.body || {};

  const flags = [];

  /* ── 1. 필수 항목 검사 ── */
  if (!memberName?.trim())      flags.push({ code: 'MISSING_NAME',    level: 'error',   msg: '신청자 이름이 없습니다' });
  if (!bizName?.trim())         flags.push({ code: 'MISSING_BIZ',     level: 'error',   msg: '업소명이 없습니다' });
  if (!bizType?.trim())         flags.push({ code: 'MISSING_TYPE',    level: 'error',   msg: '업종을 선택하지 않았습니다' });
  if (!city?.trim())            flags.push({ code: 'MISSING_CITY',    level: 'error',   msg: '도시를 선택하지 않았습니다' });
  if (!phone?.trim() && !email?.trim())
    flags.push({ code: 'MISSING_CONTACT', level: 'error', msg: '전화번호 또는 이메일 중 하나는 필요합니다' });

  /* ── 2. 형식 검사 ── */
  if (phone && !/[\d]{7,}/.test(phone.replace(/[\s\-\(\)\+]/g, '')))
    flags.push({ code: 'INVALID_PHONE', level: 'warning', msg: '전화번호 형식을 확인해 주세요' });

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    flags.push({ code: 'INVALID_EMAIL', level: 'warning', msg: '이메일 형식을 확인해 주세요' });

  /* ── 3. 금지 키워드 (Critical) ── */
  const fullText = [bizName, description, churchName, address].join(' ');
  for (const kw of CRITICAL_KEYWORDS) {
    if (fullText.toLowerCase().includes(kw.toLowerCase())) {
      flags.push({ code: 'FORBIDDEN', level: 'critical', msg: `등재 불가 키워드 감지: "${kw}"` });
    }
  }

  /* ── 4. 주의 키워드 (Warning) ── */
  for (const kw of WARNING_KEYWORDS) {
    if (fullText.includes(kw)) {
      flags.push({ code: 'OVERSTATEMENT', level: 'warning', msg: `과장 표현 확인 필요: "${kw}"` });
    }
  }

  /* ── 5. AI 검토 (Claude Haiku — 빠르고 저렴) ── */
  const hasCritical = flags.some(f => f.level === 'critical');
  const hasError    = flags.some(f => f.level === 'error');
  let aiNote = null;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && !hasCritical && !hasError) {
    try {
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-20240307',
          max_tokens: 200,
          system: [
            'You are HebronGuide\'s listing reviewer.',
            'HebronGuide is a Korean immigrant community platform run by a Christian church (SBC, IHM house church network).',
            'Evaluate if this business listing is appropriate to show to Korean immigrants.',
            'Flag only genuine concerns: (1) non-community-serving business, (2) ethical red flags, (3) anti-Christian worldview.',
            'Do NOT flag for normal commercial activity.',
            'Reply ONLY with valid JSON: { "ok": true } or { "ok": false, "note": "one-line reason in Korean" }',
          ].join(' '),
          messages: [{
            role: 'user',
            content: `업소: ${bizName} | 업종: ${bizType} | 도시: ${city} | 소개: ${description || '없음'} | 교회: ${churchName || '미입력'}`,
          }],
        }),
      });
      const aiData = await aiRes.json();
      const raw = aiData.content?.[0]?.text || '';
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const aiJson = JSON.parse(match[0]);
        if (aiJson.ok === false && aiJson.note) {
          aiNote = aiJson.note;
          flags.push({ code: 'AI_FLAG', level: 'warning', msg: `AI 검토: ${aiJson.note}` });
        }
      }
    } catch (_) {
      // AI 실패 시 무시 — 나머지 검사 결과만 사용
    }
  }

  /* ── 6. 최종 상태 결정 ── */
  const status = hasCritical || flags.some(f => f.level === 'critical') ? 'critical'
    : hasError    || flags.some(f => f.level === 'error')               ? 'error'
    : flags.some(f => f.level === 'warning')                            ? 'warning'
    : 'clean';

  /* ── 7. 김성수 목사 이메일 본문 포맷 ── */
  const statusLabel = { clean: '✅ 문제 없음', warning: '⚠️ 확인 권장', error: '❌ 필수 누락', critical: '🚫 즉시 거절' }[status];
  const flagLines   = flags.length ? flags.map(f => `  [${f.level.toUpperCase()}] ${f.msg}`).join('\n') : '  없음';

  const reviewEmailBody = [
    `[HebronGuide] 업소 등재 신청 — ${statusLabel}`,
    '',
    `업소명:   ${bizName || '—'}`,
    `업종:     ${bizType || '—'}`,
    `도시:     ${city || '—'}`,
    `소속 교회: ${churchName || '—'}`,
    `성도:     ${memberName || '—'}`,
    `전화:     ${phone || '—'}`,
    `이메일:   ${email || '—'}`,
    `주소:     ${address || '—'}`,
    `웹사이트:  ${website || '—'}`,
    `소개:     ${description || '—'}`,
    '',
    `── AI 검토 결과 (${statusLabel}) ──`,
    flagLines,
    '',
    status === 'clean'
      ? '→ 자동 승인 대기 목록에 추가됩니다. 별도 조치 불필요.'
      : '→ 확인 후 수동 처리가 필요합니다.',
    '',
    '── HebronGuide 자동 검토 시스템 ──',
    'hebronguide.com',
  ].join('\n');

  /* ── 8. 목사 추천 요청 이메일 본문 ── */
  const endorseEmailBody = [
    `[HebronGuide] 성도 업소 등재 추천 요청`,
    '',
    `목사님 안녕하세요.`,
    `${churchName || '교회'} 성도 ${memberName || '성도'}님이`,
    `아래 업소를 HebronGuide에 등재 신청하셨습니다.`,
    '',
    `업소명: ${bizName || '—'}`,
    `업종:   ${bizType || '—'}`,
    `도시:   ${city || '—'}`,
    '',
    `추천하신다면 아래 내용으로 이메일을 보내 주세요:`,
    `받는 사람: hebronplatform@gmail.com`,
    `제목: [추천] ${bizName}`,
    `내용: 위 업소를 추천합니다.`,
    '',
    `추천이 없어도 등재는 됩니다만,`,
    `목사님 추천이 있으면 ⭐ 인증 배지가 표시됩니다.`,
    '',
    '── HebronGuide ── hebronguide.com',
  ].join('\n');

  return res.status(200).json({
    status,
    flags,
    aiNote,
    // 클라이언트가 mailto: 구성에 사용
    reviewEmail: {
      to:      'hebronplatform@gmail.com',
      subject: `[HebronGuide] 업소 등재 신청 — ${bizName || '?'} (${statusLabel})`,
      body:    reviewEmailBody,
    },
    endorseEmail: pastorEmail ? {
      to:      pastorEmail,
      subject: `[HebronGuide] 성도 업소 추천 요청 — ${bizName || '?'}`,
      body:    endorseEmailBody,
    } : null,
  });
};

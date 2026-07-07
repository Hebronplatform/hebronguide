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
          model: 'claude-haiku-4-5',
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

  /* ── 6.5 Tier A 신뢰도 점수 — 실존 확인(Google Places 등) API 키가 생기기 전까지
   *      "일관성·완전성·중복" 기준으로 자동게시 여부를 판단한다.
   *      실제 업소 존재 여부 확인은 아님 — 그건 Tier B(향후, API 키 필요)의 역할.
   */
  let confidenceScore = 0;
  let dupFound = false;
  const supaUrl  = process.env.SUPABASE_URL;
  const supaAnon = process.env.SUPABASE_ANON_KEY;

  if (status === 'clean' || status === 'warning') {
    confidenceScore = 60; // 필수 항목 + 형식 검사 통과 기본점

    if (supaUrl && supaAnon && bizName?.trim() && city?.trim()) {
      try {
        const dupRes = await fetch(
          `${supaUrl}/rest/v1/community_items?category=eq.business&city_slug=eq.${encodeURIComponent(city.trim())}` +
          `&name=ilike.${encodeURIComponent('%' + bizName.trim() + '%')}&select=id`,
          { headers: { apikey: supaAnon, Authorization: `Bearer ${supaAnon}` } }
        );
        const dupRows = await dupRes.json();
        dupFound = Array.isArray(dupRows) && dupRows.length > 0;
      } catch (_) { /* 중복 검사 실패 시 무시 — 수동 검토로 넘김 */ }
    }

    if (dupFound) {
      flags.push({ code: 'DUPLICATE', level: 'warning', msg: '비슷한 이름의 업소가 이미 등록되어 있습니다 — 중복 확인 필요' });
    } else {
      confidenceScore += 15; // 중복 없음
    }
    if (website?.trim()) confidenceScore += 10;   // 확인 가능한 출처 존재
    if (!aiNote)         confidenceScore += 15;   // AI 적절성 검토 통과
  }

  const AUTO_PUBLISH_THRESHOLD = 85;
  const autoApprove = confidenceScore >= AUTO_PUBLISH_THRESHOLD && !dupFound;

  /* ── 6.6 community_items 테이블에 실제 저장 — 이메일만 가던 흐름을 DB 큐로 연결 ──
   *      신뢰도 높으면 status='approved' 즉시 게시, 아니면 'pending'으로 관리자 큐에 노출
   */
  const finalDbStatus = status === 'critical' ? 'rejected' : (autoApprove ? 'approved' : 'pending');
  let insertedId = null;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (supaUrl && serviceKey && status !== 'critical') {
    try {
      const insertRes = await fetch(`${supaUrl}/rest/v1/community_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          category: 'business',
          city_slug: city,
          title: bizName,
          name: memberName,
          contact: phone || email,
          phone, email,
          description,
          website: website || '',
          status: finalDbStatus,
          confidence_score: confidenceScore,
          auto_approved: autoApprove,
        }),
      });
      const insertData = await insertRes.json();
      insertedId = Array.isArray(insertData) ? insertData[0]?.id ?? null : null;
    } catch (e) {
      console.error('submit-listing: community_items insert failed:', e.message);
      // DB 저장 실패해도 이메일 흐름은 그대로 진행 (아래 mailto 폴백)
    }
  }

  /* ── 7. 김성수 목사 이메일 본문 포맷 ── */
  const statusLabel = { clean: '✅ 문제 없음', warning: '⚠️ 확인 권장', error: '❌ 필수 누락', critical: '🚫 즉시 거절' }[status];
  const flagLines   = flags.length ? flags.map(f => `  [${f.level.toUpperCase()}] ${f.msg}`).join('\n') : '  없음';

  // ⭐ 배지 검증 체크리스트 — 목사 추천이 있을 때만 포함
  const verifySection = pastorEmail ? [
    '',
    '══ ⭐ 배지 승인 전 검증 체크리스트 ══',
    `목사 이메일: ${pastorEmail}`,
    '',
    '아래 3가지를 확인하신 후에만 ⭐ 배지를 부여해 주세요:',
    '',
    '  □ 1. 이 목사님이 HebronGuide 파트너 교회 목사인가?',
    '  □ 2. 이 업소가 해당 교회 성도의 업소인가?',
    '  □ 3. 교회-업소 관계가 실제로 확인 가능한가?',
    '',
    '✅ 3가지 모두 확인 → 코드에 endorsed: true 추가 (⭐ 배지 부여)',
    '❌ 하나라도 불확실 → 일반 등재 유지 (배지 없음)',
    '══════════════════════════════════════',
  ].join('\n') : '';

  const reviewEmailBody = [
    `[HebronGuide] 업소 등재 신청 — ${statusLabel}`,
    '',
    `업소명:    ${bizName || '—'}`,
    `업종:      ${bizType || '—'}`,
    `도시:      ${city || '—'}`,
    `소속 교회:  ${churchName || '미입력'}`,
    `신청자:    ${memberName || '—'}`,
    `전화:      ${phone || '—'}`,
    `이메일:    ${email || '—'}`,
    `주소:      ${address || '—'}`,
    `웹사이트:   ${website || '—'}`,
    `소개:      ${description || '—'}`,
    '',
    `── AI 검토 결과 (${statusLabel}) ──`,
    flagLines,
    verifySection,
    '',
    status === 'clean'
      ? '→ AI 검토 통과. 위 체크리스트 확인 후 처리해 주세요.'
      : '→ 플래그 항목 확인 후 수동 처리가 필요합니다.',
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
    confidenceScore,
    autoApprove,
    insertedId,
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

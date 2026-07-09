// api/submit-story.js
// 환대 이야기 제출 → AI Haiku 게이트 → Supabase(community_items) 저장 + 관리자 이메일
// 2층 병행: category=story_share(1층 가벼운 나눔) / story_studio(2층 큐레이션 5막)
// 패턴: submit-listing.js(AI 게이트·confidence·auto_approved) + submit-city-request.js(저장·이메일)
import nodemailer from 'nodemailer'

const SUPABASE_URL  = 'https://vextxqzggznulwpganwt.supabase.co'
// anon 키 (fallback) — 서비스 키 미설정 시. status=pending/approved 삽입 RLS 허용.
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZleHR4cXpnZ3pudWx3cGdhbnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MTUzOTIsImV4cCI6MjA5NDM5MTM5Mn0.XghaQZYtI-dq5mf8i-DPVCxtw_XBBjxGUnvaiwGQFWk'
const ADMIN_EMAIL   = 'hebronplatform@gmail.com'
const FROM_EMAIL    = 'Hebronplatform@gmail.com'

// 절대 게시 불가 (이단·사이비)
const CRITICAL_KEYWORDS = [
  '신천지', '통일교', 'JMS', '하나님의교회', '여호와의증인',
  '몰몬교', '구원파', '세계일보', 'Scientology', '사이언톨로지',
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { type, role, name, email, city, city_slug, content, title } = req.body || {}
    const tier = type === 'story_studio' ? 'story_studio' : 'story_share'
    const text = (content || '').trim()
    if (!text || text.length < 10) return res.status(400).json({ error: '이야기 내용을 조금 더 입력해 주세요' })
    if (!city && !city_slug)       return res.status(400).json({ error: '도시를 선택해 주세요' })

    // ── 1. 금지 키워드 (즉시 거절) ──
    const lower = text.toLowerCase()
    const hitCritical = CRITICAL_KEYWORDS.find(kw => lower.includes(kw.toLowerCase()))

    // ── 2. AI Haiku 게이트 (세계관·이단·부적절·스팸·환대톤) ──
    let aiOk = null, aiNote = null
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey && !hitCritical) {
      try {
        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5',
            max_tokens: 200,
            system: [
              "You are HebronGuide's story moderator.",
              'HebronGuide is a Korean immigrant community platform run by a Christian church, centered on hospitality (환대).',
              'Approve genuine settlement/hospitality/community stories generously — this is user-generated sharing.',
              'Only flag when there is a real problem: (1) hate/violence/sexual/abusive content, (2) spam/advertising/self-promotion, (3) cult content (신천지·통일교 등), (4) content actively hostile to a biblical Christian worldview, (5) clearly fake or nonsense.',
              'Ordinary personal stories, even non-religious ones, are fine.',
              'Reply ONLY with valid JSON: {"ok":true} or {"ok":false,"note":"one-line reason in Korean"}',
            ].join(' '),
            messages: [{ role: 'user', content: `도시: ${city || city_slug} | 역할: ${role || '미상'} | 이야기: ${text}` }],
          }),
        })
        const aiData = await aiRes.json()
        const raw = aiData.content?.[0]?.text || ''
        const m = raw.match(/\{[\s\S]*\}/)
        if (m) {
          const j = JSON.parse(m[0])
          aiOk = j.ok !== false
          if (j.ok === false) aiNote = j.note || '검토 필요'
        }
      } catch (_) { aiOk = null } // AI 실패 → 안전하게 검토 대기로
    }

    // ── 3. 상태 결정 ──
    let status, confidence, autoApproved
    if (hitCritical)          { status = 'rejected'; confidence = 0;  autoApproved = false; aiNote = `금지 키워드: ${hitCritical}` }
    else if (aiOk === true)   { status = 'approved'; confidence = 90; autoApproved = true  }  // 통과 → 자동 공개
    else if (aiOk === false)  { status = 'pending';  confidence = 55; autoApproved = false }  // 경계선 → admin 검토
    else                      { status = 'pending';  confidence = 50; autoApproved = false }  // AI 미가동 → 안전하게 검토 대기

    // 거절: 저장 없이 부드러운 안내
    if (status === 'rejected') {
      return res.status(200).json({ ok: false, rejected: true,
        message: '이 내용은 지금 게시하기 어렵습니다. 환대의 경험을 편하게 나눠주시면 감사하겠습니다.' })
    }

    // ── 4. Supabase 저장 (admin community_items 뷰가 confidence_score·auto_approved 표시) ──
    const writeKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY || SUPABASE_ANON
    const autoTitle = (title && title.trim()) || `[이야기] ${city || city_slug} — ${text.slice(0, 20)}${text.length > 20 ? '…' : ''}`
    let savedOk = false
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/community_items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: writeKey, Authorization: `Bearer ${writeKey}`, Prefer: 'return=minimal' },
        body: JSON.stringify({
          category:     tier,
          title:        autoTitle,
          name:         name || role || '익명',
          contact:      email || '',
          description:  text,
          city_slug:    city_slug || '',
          city:         city || '',
          status,
          confidence_score: confidence,
          auto_approved:    autoApproved,
          submitted_at: new Date().toISOString(),
        }),
      })
      savedOk = r.ok || r.status === 201 || r.status === 204
      if (!savedOk) console.warn('story save non-ok:', r.status, await r.text().catch(() => ''))
    } catch (e) { console.warn('story save failed:', e.message) }

    // ── 5. 관리자 이메일 알림 (검토 대기 건은 특히 중요) ──
    let emailOk = false, emailSkipped = false
    const gmailPass = process.env.GMAIL_APP_PASS
    if (gmailPass) {
      try {
        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: FROM_EMAIL, pass: gmailPass } })
        await transporter.sendMail({
          from:    `"HebronGuide 이야기" <${FROM_EMAIL}>`,
          to:      ADMIN_EMAIL,
          replyTo: email || FROM_EMAIL,
          subject: `[HebronGuide] 새 이야기 (${tier === 'story_studio' ? '스튜디오' : '환대나눔'}) — ${city || city_slug} [${status === 'approved' ? '자동게시' : '검토대기'}]`,
          text: [
            `새 이야기가 접수되었습니다. (${status === 'approved' ? 'AI 통과 · 자동 게시됨' : '검토 대기'})`,
            '─────────────────────────────────────',
            `유형: ${tier}`,
            `도시: ${city || city_slug}`,
            `역할: ${role || '-'}`,
            `이름: ${name || '익명'}`,
            `연락: ${email || '-'}`,
            `AI 검토: ${aiOk === true ? '통과' : aiOk === false ? '보류 — ' + (aiNote || '') : '미가동'} (score ${confidence})`,
            '─────────────────────────────────────',
            text,
            '─────────────────────────────────────',
            '관리: hebronguide.com/admin.html (이야기/커뮤니티)',
          ].join('\n'),
        })
        emailOk = true
      } catch (e) { console.error('story email failed:', e.message) }
    } else { emailSkipped = true }

    if (savedOk || emailOk || emailSkipped) {
      return res.status(200).json({
        ok: true, saved: savedOk, email: emailOk, status, auto: autoApproved,
        message: status === 'approved'
          ? '이야기가 공유되었습니다. 나눠주셔서 감사합니다! 🙏'
          : '이야기가 접수되었습니다. 확인 후 게시됩니다. 감사합니다! 🙏',
      })
    }
    return res.status(500).json({ error: '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.' })
  } catch (e) {
    console.error('submit-story error:', e)
    return res.status(500).json({ error: e.message })
  }
}

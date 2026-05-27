// api/admin-action.js — HebronGuide 관리자 액션 API
// Vercel Edge Function — 서비스 키로 RLS 우회, anon 키로는 불가능한 UPDATE/DELETE 처리
// 인증: SHA-256 비밀번호 해시 토큰 검증

export const config = { runtime: 'edge' }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

// 관리자 비밀번호 해시 (admin@Hebron2026!)
const ADMIN_HASH = '614fea13745bbaa53de1c1c36b216c3cd5009df185b9f642089eb7ea76a69b90'

// Supabase 프로젝트: 단일 프로젝트 (vextxqzggznulwpganwt)
const SB_URLS = {
  main:  'https://vextxqzggznulwpganwt.supabase.co',
  new:   'https://vextxqzggznulwpganwt.supabase.co',
}

// 테이블 → 모두 동일 프로젝트 사용
const TABLE_DB = {
  community_items:  'new',
  content_items:    'new',
  pastor_partners:  'new',
  stories:          'new',
  ai_query_logs:    'new',
  content_reviews:  'new',
  churches:         'new',
  restaurants:      'new',
  cafes:            'new',
}

async function sbFetch(table, method, id, body = null) {
  const db = TABLE_DB[table] || 'new'
  const url = `${SB_URLS[db]}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`

  // 단일 Supabase 프로젝트 — MAIN 또는 일반 키 중 설정된 것 사용
  const serviceKey = process.env.SUPABASE_SERVICE_KEY_MAIN
    || process.env.SUPABASE_SERVICE_KEY

  if (!serviceKey) {
    throw new Error('서비스 키 미설정: Vercel → Settings → Environment Variables → SUPABASE_SERVICE_KEY_MAIN 확인')
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Supabase 오류 (${res.status}): ${errText}`)
  }
  return true
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  try {
    const { action, id, table, status, token, church, business } = await req.json()

    // ── 토큰 인증 ────────────────────────────────────────
    if (!token || token !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: '인증 실패: 관리자 토큰 불일치' }), {
        status: 401, headers: CORS
      })
    }

    // ── 입력값 검증 ──────────────────────────────────────
    if (!['insert_church','insert_business','mark_notified'].includes(action) && (!id || !table)) {
      return new Response(JSON.stringify({ error: 'id, table 필수' }), {
        status: 400, headers: CORS
      })
    }

    // 허용 테이블 화이트리스트 (SQL 인젝션 방지) — 테이블 불필요 액션은 건너뜀
    const NO_TABLE_ACTIONS = ['insert_church', 'insert_business', 'mark_notified']
    const ALLOWED_TABLES = ['community_items','content_items','pastor_partners','stories','content_reviews','churches','restaurants','cafes']
    if (!NO_TABLE_ACTIONS.includes(action) && !ALLOWED_TABLES.includes(table)) {
      return new Response(JSON.stringify({ error: `허용되지 않는 테이블: ${table}` }), {
        status: 400, headers: CORS
      })
    }

    // ── 액션 처리 ────────────────────────────────────────
    switch (action) {
      case 'update_status':
        if (!['approved','rejected','pending'].includes(status)) {
          return new Response(JSON.stringify({ error: '잘못된 status 값' }), { status: 400, headers: CORS })
        }
        await sbFetch(table, 'PATCH', id, { status })
        return new Response(JSON.stringify({ ok: true, msg: `${status === 'approved' ? '승인' : '거절'} 완료` }), { headers: CORS })

      case 'delete':
        await sbFetch(table, 'DELETE', id)
        return new Response(JSON.stringify({ ok: true, msg: '삭제 완료' }), { headers: CORS })

      case 'mark_notified':
        await sbFetch('community_items', 'PATCH', id, { notified_at: new Date().toISOString() })
        return new Response(JSON.stringify({ ok: true, msg: '발송 기록 완료' }), { headers: CORS })

      case 'verify_partner':
        await sbFetch('pastor_partners', 'PATCH', id, { verified: true })
        return new Response(JSON.stringify({ ok: true, msg: '인증 완료' }), { headers: CORS })

      case 'feature_story':
        await sbFetch('stories', 'PATCH', id, { featured: true })
        return new Response(JSON.stringify({ ok: true, msg: '피처드 설정 완료' }), { headers: CORS })

      case 'insert_church': {
        if (!church || !church.name) {
          return new Response(JSON.stringify({ error: '교회 데이터 없음' }), { status: 400, headers: CORS })
        }
        const serviceKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY
        const insertRes = await fetch(`https://vextxqzggznulwpganwt.supabase.co/rest/v1/churches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            name:         church.name,
            name_en:      church.name_en || church.name,
            city_slug:    church.city_slug || '',
            description:  church.description || '',
            phone:        church.phone || '',
            email:        church.email || '',
            website:      church.website || '',
            denomination: church.denomination || '',
            service_time: church.service_time || '',
            hebron_partner: church.hebron_partner || false,
            hcmi:         church.hcmi || false,
            tier:         church.tier || 2,
            active:       true,
            source:       church.source || 'admin_approved',
            source_id:    church.source_id || null,
          }),
        })
        if (!insertRes.ok) {
          const errText = await insertRes.text()
          throw new Error(`교회 저장 실패 (${insertRes.status}): ${errText}`)
        }
        return new Response(JSON.stringify({ ok: true, msg: `${church.name} 등록 완료` }), { headers: CORS })
      }

      case 'insert_business': {
        // community_items 테이블에 category='business'로 저장 (restaurants 테이블 불필요)
        const biz = business
        if (!biz || !biz.name) {
          return new Response(JSON.stringify({ error: '사업체 데이터 없음' }), { status: 400, headers: CORS })
        }
        const svcKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY

        const bizInsertRes = await fetch(`https://vextxqzggznulwpganwt.supabase.co/rest/v1/community_items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': svcKey,
            'Authorization': `Bearer ${svcKey}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            title:       biz.name,
            name:        biz.name,
            category:    'business',
            type:        biz.type || '',
            city_slug:   biz.city_slug || '',
            city:        biz.city || '',
            description: biz.description || '',
            phone:       biz.phone || '',
            contact:     biz.email || '',
            url:         biz.website || '',
            status:      'approved',
          }),
        })
        if (!bizInsertRes.ok) {
          const errText = await bizInsertRes.text()
          throw new Error(`사업체 저장 실패 (${bizInsertRes.status}): ${errText}`)
        }
        return new Response(JSON.stringify({ ok: true, msg: `${biz.name} 사업체 등록 완료 (community_items)` }), { headers: CORS })
      }

      case 'insert_business_legacy': {
        // 레거시: restaurants/cafes 테이블 시도 (테이블 존재 시에만 작동)
        const biz = business
        if (!biz || !biz.name) {
          return new Response(JSON.stringify({ error: '사업체 데이터 없음' }), { status: 400, headers: CORS })
        }
        const svcKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY
        const bizTable = (biz.type || '').includes('카페') || (biz.type || '').includes('cafe')
          ? 'cafes' : 'restaurants'

        const bizInsertRes = await fetch(`https://vextxqzggznulwpganwt.supabase.co/rest/v1/${bizTable}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': svcKey,
            'Authorization': `Bearer ${svcKey}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            name:        biz.name,
            name_en:     biz.name_en || biz.name,
            city_slug:   biz.city_slug || '',
            description: biz.description || '',
            phone:       biz.phone || '',
            email:       biz.email || '',
            website:     biz.website || '',
            address:     biz.address || '',
            category:    biz.type || '',
            active:      true,
            source:      biz.source || 'admin_approved',
            source_id:   biz.source_id || null,
          }),
        })
        if (!bizInsertRes.ok) {
          const errText = await bizInsertRes.text()
          throw new Error(`사업체 저장 실패 (${bizInsertRes.status}): ${errText}`)
        }
        return new Response(JSON.stringify({ ok: true, msg: `${biz.name} 사업체 등록 완료 (${bizTable})` }), { headers: CORS })
      }

      default:
        return new Response(JSON.stringify({ error: `알 수 없는 액션: ${action}` }), {
          status: 400, headers: CORS
        })
    }

  } catch (e) {
    console.error('admin-action error:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: CORS
    })
  }
}

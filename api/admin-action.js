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

// Supabase 프로젝트 URL 매핑
// community_items, pastor_partners, stories, ai_query_logs → vextxqzggznulwpganwt
// churches, restaurants, cafes → okhfjzofifmsgssgajts
const SB_URLS = {
  main:  'https://okhfjzofifmsgssgajts.supabase.co',
  new:   'https://vextxqzggznulwpganwt.supabase.co',
}

// 테이블 → 어느 Supabase 프로젝트인지 매핑
const TABLE_DB = {
  community_items:  'new',
  content_items:    'new',
  pastor_partners:  'new',
  stories:          'new',
  ai_query_logs:    'new',
  churches:         'main',
  restaurants:      'main',
  cafes:            'main',
}

async function sbFetch(table, method, id, body = null) {
  const db = TABLE_DB[table] || 'new'
  const url = `${SB_URLS[db]}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`

  // 프로젝트별 서비스 키 선택
  const serviceKey = db === 'main'
    ? process.env.SUPABASE_SERVICE_KEY_MAIN
    : process.env.SUPABASE_SERVICE_KEY

  if (!serviceKey) {
    throw new Error(`서비스 키 미설정: SUPABASE_SERVICE_KEY${db === 'main' ? '_MAIN' : ''} (Vercel 환경변수 확인)`)
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
    const { action, id, table, status, token } = await req.json()

    // ── 토큰 인증 ────────────────────────────────────────
    if (!token || token !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: '인증 실패: 관리자 토큰 불일치' }), {
        status: 401, headers: CORS
      })
    }

    // ── 입력값 검증 ──────────────────────────────────────
    if (!id || !table) {
      return new Response(JSON.stringify({ error: 'id, table 필수' }), {
        status: 400, headers: CORS
      })
    }

    // 허용 테이블 화이트리스트 (SQL 인젝션 방지)
    const ALLOWED_TABLES = ['community_items','content_items','pastor_partners','stories','churches','restaurants','cafes']
    if (!ALLOWED_TABLES.includes(table)) {
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

      case 'verify_partner':
        await sbFetch('pastor_partners', 'PATCH', id, { verified: true })
        return new Response(JSON.stringify({ ok: true, msg: '인증 완료' }), { headers: CORS })

      case 'feature_story':
        await sbFetch('stories', 'PATCH', id, { featured: true })
        return new Response(JSON.stringify({ ok: true, msg: '피처드 설정 완료' }), { headers: CORS })

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

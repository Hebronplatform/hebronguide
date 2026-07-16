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

// ── 도시 슬러그 정규화 ─────────────────────────────────
function normalizeCitySlug(input) {
  if (!input) return '';
  const map = {
    '서울':'seoul','남양주':'seoul','의정부':'seoul','분당':'bundang',
    '부산':'busan','제주':'jeju',
    'la':'la','l.a.':'la','로스앤젤레스':'la','엘에이':'la',
    'los angeles':'la','치노밸리':'la','chino valley':'la','chino hills':'la','inland empire':'la',
    'seattle':'seattle','시애틀':'seattle',
    'dallas':'dallas','달라스':'dallas','다라스':'dallas','dfw':'dallas',
    'new york':'newyork','newyork':'newyork','nyc':'newyork','뉴욕':'newyork','뉴저지':'newyork',
    'houston':'houston','휴스턴':'houston',
    'atlanta':'atlanta','애틀랜타':'atlanta',
    'miami':'miami','마이애미':'miami',
    'philadelphia':'philadelphia','필라델피아':'philadelphia','philly':'philadelphia',
    'boston':'boston','보스턴':'boston',
    'nashville':'nashville','내쉬빌':'nashville',
    'san francisco':'sf','sf':'sf','샌프란시스코':'sf','bay area':'sf','베이에어리어':'sf',
    'kansas city':'kansascity','kansascity':'kansascity','캔자스시티':'kansascity',
    'tampa':'tampa','탬파':'tampa',
    'fairfield':'fairfield','페어필드':'fairfield','vacaville':'fairfield','fairfield/vacaville':'fairfield',
    'waynesville':'waynesville','웨인즈빌':'waynesville',
    'chicago':'chicago','시카고':'chicago',
    'phoenix':'phoenix','피닉스':'phoenix',
    'minneapolis':'minneapolis','미니애폴리스':'minneapolis',
    'denver':'denver','덴버':'denver',
    'san diego':'sandiego','sandiego':'sandiego','샌디에고':'sandiego',
    'dc':'dc','washington':'dc','washington dc':'dc',
    'fairfax':'dc','페어팩스':'dc','페어펙스':'dc',
    'virginia':'dc','va':'dc','northern virginia':'dc','노던버지니아':'dc','버지니아':'dc',
    'maryland':'dc','메릴랜드':'dc','워싱턴':'dc','워싱턴dc':'dc',
    'centreville':'dc','센터빌':'dc','bethesda':'dc','rockville':'dc',
    'toronto':'toronto','토론토':'toronto',
    'vancouver':'vancouver','밴쿠버':'vancouver',
    'white rock':'vancouver','화이트락':'vancouver','화이트 락':'vancouver',
    'calgary':'calgary','캘거리':'calgary',
    'edmonton':'edmonton','에드먼튼':'edmonton',
    'ottawa':'ottawa','오타와':'ottawa',
    'winnipeg':'winnipeg','위니펙':'winnipeg',
    'prince george':'princgeorge','prince george, bc':'princgeorge','프린스조지':'princgeorge',
    'bogota':'bogota','bogotá':'bogota','보고타':'bogota',
    'mexico city':'mexicocity','mexicocity':'mexicocity','멕시코시티':'mexicocity',
    'guadalajara':'guadalajara','과달라하라':'guadalajara',
    'monterrey':'monterrey','몬테레이':'monterrey',
    'tokyo':'tokyo','도쿄':'tokyo','osaka':'osaka','오사카':'osaka',
    'singapore':'singapore','싱가포르':'singapore',
    'bangkok':'bangkok','방콕':'bangkok',
    'dubai':'dubai','두바이':'dubai',
    'london':'london','런던':'london',
    'berlin':'berlin','베를린':'berlin',
    'frankfurt':'frankfurt','프랑크푸르트':'frankfurt',
    'paris':'paris','파리':'paris',
    'amsterdam':'amsterdam','암스테르담':'amsterdam',
    'sydney':'sydney','시드니':'sydney',
    'melbourne':'melbourne','멜버른':'melbourne',
    'brisbane':'brisbane','브리즈번':'brisbane',
    'auckland':'auckland','오클랜드':'auckland',
  };
  const key = input.trim().toLowerCase();
  return map[key] || key.replace(/[^a-z0-9]/g, '').replace('princegeorge', 'princgeorge') || input;
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
    const { action, id, table, status, token, church, business, city_slug, patch } = await req.json()

    // ── 토큰 인증 ────────────────────────────────────────
    if (!token || token !== ADMIN_HASH) {
      return new Response(JSON.stringify({ error: '인증 실패: 관리자 토큰 불일치' }), {
        status: 401, headers: CORS
      })
    }

    // ── 입력값 검증 ──────────────────────────────────────
    if (!['insert_church','insert_business','mark_notified','update_city_slug'].includes(action) && (!id || !table)) {
      return new Response(JSON.stringify({ error: 'id, table 필수' }), {
        status: 400, headers: CORS
      })
    }

    // 허용 테이블 화이트리스트 (SQL 인젝션 방지) — 테이블 불필요 액션은 건너뜀
    const NO_TABLE_ACTIONS = ['insert_church', 'insert_business', 'mark_notified', 'update_city_slug']
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

      case 'update_record': {
        // 등재 항목 직접 수정 — 테이블별 허용 필드만 PATCH (안전)
        const EDITABLE = {
          churches:        ['name','name_en','description','denomination','service_time','address','phone','email','website','tier','hebron_partner','hcmi','active','city_slug'],
          community_items: ['name','name_en','title','business_name','description','category','city_slug','city','address','phone','email','website','status','tags'],
          restaurants:     ['name','name_en','description','address','phone','email','website','city_slug','category'],
        }
        const allow = EDITABLE[table]
        if (!allow) return new Response(JSON.stringify({ error: `수정 불가 테이블: ${table}` }), { status: 400, headers: CORS })
        const clean = {}
        for (const k of Object.keys(patch || {})) if (allow.includes(k)) clean[k] = patch[k]
        // 타입 보정
        if ('tier' in clean) clean.tier = Number(clean.tier) || null
        for (const b of ['hebron_partner','hcmi','active']) if (b in clean) clean[b] = clean[b] === true || clean[b] === 'true'
        if (Object.keys(clean).length === 0) return new Response(JSON.stringify({ error: '수정할 필드가 없습니다' }), { status: 400, headers: CORS })
        await sbFetch(table, 'PATCH', id, clean)
        return new Response(JSON.stringify({ ok: true, msg: `수정 완료 (${Object.keys(clean).length}개 필드)`, fields: Object.keys(clean) }), { headers: CORS })
      }

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
        const svcKey = process.env.SUPABASE_SERVICE_KEY_MAIN || process.env.SUPABASE_SERVICE_KEY
        const SB = 'https://vextxqzggznulwpganwt.supabase.co'
        const sbHeaders = {
          'Content-Type': 'application/json',
          'apikey': svcKey,
          'Authorization': `Bearer ${svcKey}`,
          'Prefer': 'return=minimal',
        }

        const slug      = normalizeCitySlug(church.city_slug || church.city || '')
        const isPartner = church.hebron_partner || false
        const isHcmi    = church.hcmi || false
        const tier      = (isPartner || isHcmi) ? 1 : 2

        // ── 이메일 기준 중복 체크 ──────────────────────────
        let existingId  = null
        let existingRec = null
        const emailVal  = (church.email || '').trim()
        if (emailVal && emailVal !== '없음' && emailVal.includes('@')) {
          const chkRes = await fetch(
            `${SB}/rest/v1/churches?email=eq.${encodeURIComponent(emailVal)}&select=id,hebron_partner,tier&limit=1`,
            { headers: { apikey: svcKey, Authorization: `Bearer ${svcKey}` } }
          )
          if (chkRes.ok) {
            const rows = await chkRes.json()
            if (rows.length > 0) { existingId = rows[0].id; existingRec = rows[0] }
          }
        }

        if (existingId) {
          // ── 기존 교회 업데이트 (더 자세한 정보로 보강) ──
          const patch = { city_slug: slug }
          if (church.denomination)                              patch.denomination = church.denomination
          if (church.service_time)                              patch.service_time = church.service_time
          if (church.phone)                                     patch.phone        = church.phone
          if (church.website && church.website !== '없음')      patch.website      = church.website
          if (church.address)                                   patch.address      = church.address
          if (church.description)                               patch.description  = church.description
          if (isPartner && !existingRec.hebron_partner)         patch.hebron_partner = true
          if (isHcmi)                                           patch.hcmi         = true
          if ((isPartner || isHcmi) && (existingRec.tier || 2) > 1) patch.tier    = 1
          const upRes = await fetch(`${SB}/rest/v1/churches?id=eq.${existingId}`, {
            method: 'PATCH', headers: sbHeaders, body: JSON.stringify(patch),
          })
          if (!upRes.ok) throw new Error(`교회 업데이트 실패 (${upRes.status}): ${await upRes.text()}`)
          return new Response(JSON.stringify({ ok: true, msg: `${church.name} 기존 정보 업데이트`, updated: true }), { headers: CORS })
        }

        // ── 신규 교회 등록 ─────────────────────────────────
        const insRes = await fetch(`${SB}/rest/v1/churches`, {
          method: 'POST', headers: sbHeaders,
          body: JSON.stringify({
            name:           church.name,
            name_en:        church.name_en || church.name,
            city_slug:      slug,
            description:    church.description || '',
            phone:          church.phone || '',
            email:          emailVal,
            website:        (church.website && church.website !== '없음') ? church.website : '',
            address:        church.address || '',
            denomination:   church.denomination || '',
            service_time:   church.service_time || '',
            hebron_partner: isPartner,
            hcmi:           isHcmi,
            tier,
            active:         true,
            source:         church.source || 'admin_approved',
            source_id:      church.source_id || null,
          }),
        })
        if (!insRes.ok) throw new Error(`교회 저장 실패 (${insRes.status}): ${await insRes.text()}`)
        return new Response(JSON.stringify({ ok: true, msg: `${church.name} 등록 완료` }), { headers: CORS })
      }

      case 'update_city_slug': {
        if (!id) return new Response(JSON.stringify({ error: 'id 필수' }), { status: 400, headers: CORS })
        await sbFetch('community_items', 'PATCH', id, { city_slug: normalizeCitySlug(city_slug || '') || city_slug })
        return new Response(JSON.stringify({ ok: true, msg: 'city_slug 업데이트 완료' }), { headers: CORS })
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

// scripts/city-utils.mjs — City Engine v2 공용 유틸
// CLAUDE.md의 UN Geoscheme 표를 코드로 고정 — 멕시코→중남미, 두바이→중동 등 분류 실수를 원천 차단.

export const SUPABASE_URL = 'https://vextxqzggznulwpganwt.supabase.co';
// 공개(anon) 키 — hebronguide/utils/supabase/info.tsx와 동일 (role:anon, 공개 설계).
// 서비스 키는 절대 이 파일·레포에 두지 않는다 (Vercel env 전용).
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZleHR4cXpnZ3pudWx3cGdhbnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MTUzOTIsImV4cCI6MjA5NDM5MTM5Mn0.XghaQZYtI-dq5mf8i-DPVCxtw_XBBjxGUnvaiwGQFWk';

export function anonHeaders() {
  return { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' };
}

// ── slugify: 기존 도시 slug 규칙과 동일 (소문자 영숫자만) ──────────
export function slugify(nameEn) {
  return String(nameEn || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ── UN Geoscheme: 국가 → HebronGuide 섹션 (CLAUDE.md 표 정본) ──────
// "자주 헷갈리는 나라" 정답 하드코딩 포함.
const UN_SECTION = {
  // Northern America → 북미
  '미국': '북미', '캐나다': '북미',
  // Central America·Caribbean·South America → 중남미 (멕시코는 중미! 북미 아님)
  '멕시코': '중남미', '과테말라': '중남미', '코스타리카': '중남미', '파나마': '중남미',
  '쿠바': '중남미', '도미니카': '중남미',
  '브라질': '중남미', '아르헨티나': '중남미', '콜롬비아': '중남미', '페루': '중남미',
  '칠레': '중남미', '파라과이': '중남미', '볼리비아': '중남미', '우루과이': '중남미', '에콰도르': '중남미',
  // Europe → 유럽
  '영국': '유럽', '프랑스': '유럽', '독일': '유럽', '네덜란드': '유럽', '이탈리아': '유럽',
  '스페인': '유럽', '포르투갈': '유럽', '폴란드': '유럽', '체코': '유럽', '오스트리아': '유럽',
  '스위스': '유럽', '벨기에': '유럽', '스웨덴': '유럽', '노르웨이': '유럽', '덴마크': '유럽',
  '핀란드': '유럽', '헝가리': '유럽', '아일랜드': '유럽', '그리스': '유럽',
  // Western Asia → 중동 (두바이/UAE는 서아시아 = 중동)
  'UAE': '중동', '아랍에미리트': '중동', '이스라엘': '중동', '튀르키예': '중동', '터키': '중동',
  '카타르': '중동', '사우디아라비아': '중동', '쿠웨이트': '중동', '바레인': '중동', '오만': '중동', '요르단': '중동',
  // South-eastern Asia → 동남아시아 (싱가포르 포함)
  '싱가포르': '동남아시아', '태국': '동남아시아', '베트남': '동남아시아', '필리핀': '동남아시아',
  '말레이시아': '동남아시아', '인도네시아': '동남아시아', '캄보디아': '동남아시아', '라오스': '동남아시아', '미얀마': '동남아시아',
  // Eastern Asia → 일본/한국 각자 독립 섹션
  '일본': '일본', '한국': '한국', '대한민국': '한국',
  // Australia & NZ → 오세아니아
  '호주': '오세아니아', '뉴질랜드': '오세아니아',
};

export function unSection(country) {
  const s = UN_SECTION[String(country || '').trim()];
  if (!s) throw new Error(`unSection: '${country}' — UN Geoscheme 매핑에 없는 국가. CLAUDE.md 표 확인 후 city-utils.mjs UN_SECTION에 추가 필요 (추측 금지)`);
  return s;
}

// ── HEBRON_CITIES 배열의 섹션 주석 (HebronGuide.tsx 실제 문자열과 정확히 일치) ──
const SECTION_COMMENT = {
  '북미':      '// ── 북미 확장 ──',
  '중남미':    '// ── 중남미 (Central & South America — UN Geoscheme 기준) ──',
  '오세아니아': '// ── 오세아니아 ──',
  '유럽':      '// ── 유럽 ──',
  '중동':      '// ── 중동 ──',
  '동남아시아': '// ── 동남아시아 ──',
  '일본':      '// ── 일본 (신규) ──',
  '한국':      '// ── 한국 — 역이민·방문 동포 ──',
};
export function sectionComment(section) {
  const c = SECTION_COMMENT[section];
  if (!c) throw new Error(`sectionComment: '${section}' 섹션 주석 없음`);
  return c;
}

// ── build.sh REGION_MAP 값 (admin 필터 그룹 — 기존 값 체계 그대로 유지) ──
export function regionMapValue(section, country) {
  if (section === '북미') return country === '캐나다' ? '🇨🇦 캐나다' : '🇺🇸 미국';
  return {
    '중남미': '🌎 중남미', '유럽': '🇬🇧 유럽', '중동': '🌏 동남아·중동',
    '동남아시아': '🌏 동남아·중동', '오세아니아': '🇦🇺 오세아니아',
    '일본': '🇯🇵 일본', '한국': '🇰🇷 한국',
  }[section] || '기타';
}

// ── index.html #cityRegions 지역 블록의 region-label 한국어 텍스트 ──
export function indexRegionKo(section, country) {
  if (section === '북미') return country === '캐나다' ? '캐나다' : '미국';
  return {
    '중남미': '중남미', '오세아니아': '오세아니아',
    '유럽': '유럽·중동', '중동': '유럽·중동',
    '동남아시아': '동남아시아', '일본': '일본', '한국': '대한민국',
  }[section];
}

// ── 파이프라인 로그 (city_pipeline_logs — anon insert 허용, append-only) ──
export async function logStage(slug, stage, status, message, { simulate = false } = {}) {
  if (simulate) { console.log(`  [log/simulate] ${slug} ${stage} ${status}: ${message}`); return; }
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/city_pipeline_logs`, {
      method: 'POST',
      headers: { ...anonHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ slug, stage, status, message }),
    });
  } catch (e) { console.warn(`  [log] 기록 실패(무시): ${e.message}`); }
}

// ── 초안 조회 (anon read) ──
export async function fetchDraft(slug) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/city_drafts?slug=eq.${encodeURIComponent(slug)}&select=*`, { headers: anonHeaders() });
  if (!r.ok) throw new Error(`city_drafts 조회 실패 HTTP ${r.status} — supabase_setup_city_pipeline.sql 실행 여부 확인`);
  const rows = await r.json();
  return rows[0] || null;
}

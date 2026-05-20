/**
 * cityTemplate.ts — HebronGuide 도시 데이터 타입 정의 & 기본 템플릿
 * 새 도시 추가 시 이 파일의 CITY_TEMPLATE을 복사·수정하세요.
 *
 * 도시 추가 8-step 체크리스트 (HebronGuide.tsx):
 *  1. CitySlug 타입에 | "newcity" 추가
 *  2. CITY_HERO_SLIDES에 5장 Unsplash 슬라이드 추가
 *  3. CITY_CONFIGS에 CityConfig 객체 추가
 *  4. HEBRON_CITIES 배열 해당 섹션 끝에 추가
 *  5. DIASPORA_IDENTITY에 항목 추가
 *  6. TOP5 상수 3개 작성 (SETTLE, FOOD, EXPLORE)
 *  7. getCountryCode() 배열에 slug 추가
 *  8. TOP5 매핑 3곳(settle/food/explore)에 항목 추가
 *
 * 지역 분류: UN Geoscheme 표준 (CLAUDE.md 규정)
 * Unsplash 이미지: 반드시 풀 해시 형식 (photo-XXXXXXXXXX-XXXXXXXXXXXX)
 */

// ── 히어로 슬라이드 ──────────────────────────────────────────
export interface CityHeroSlide {
  /** Unsplash 풀 해시 URL (short URL 금지)
   *  ✅ https://images.unsplash.com/photo-1731450626260-0ca05713fdd7?w=1200&q=95
   *  ❌ https://unsplash.com/photos/8uL3goCiCRs (short URL → 파란 화면 버그) */
  url: string
  /** CSS background-position 값 (예: "center 40%") */
  pos: string
  /** 접근성 대체 텍스트 — 영어로, 구체적으로 */
  alt: string
}

// ── 도시 기본 설정 ───────────────────────────────────────────
export interface CityConfig {
  slug: string
  nameKo: string
  nameEn: string
  /** Tailwind hex — hero 이미지 로드 실패 시 그라디언트 폴백으로 사용 */
  color: string
  /** YouTube embed ID 또는 "" (없음) */
  heroVideo: string
  /** "9만+" 형식 (UN Geoscheme 기준 해당 국가 한인 이주자 수) */
  population: string
  /** UN Geoscheme 국가명 (예: "Korea", "United States", "Canada") */
  state: string
  taglineKo: string
  taglineEn: string
  taglineEs: string
}

// ── TOP5 아이템 ──────────────────────────────────────────────
export interface Top5Item {
  name: string
  nameEn?: string
  address?: string
  phone?: string
  website?: string
  desc: string
  descEn?: string
  /** 1=Tier1⭐ 추천, 2=검증됨✅, 3=참고용 */
  tier?: 1 | 2 | 3
  /** Tier1 별표 강조 여부 */
  star?: boolean
}

// ── 디아스포라 정체성 ────────────────────────────────────────
export interface DiasporaIdentity {
  flag: string
  ko: string
  en: string
  descKo: string
  descEn: string
  color: string
}

// ── HEBRON_CITIES 아이템 ─────────────────────────────────────
export interface HebronCity {
  emoji: string
  nameKo: string
  nameEn: string
  flag: string
  url: string
  status: 'live' | 'coming'
  color: string
}

// ── 새 도시 추가용 기본 템플릿 ───────────────────────────────
// 이 객체를 복사해서 도시별 값으로 채우세요.
export const CITY_TEMPLATE: CityConfig = {
  slug: 'newcity',
  nameKo: '도시명',
  nameEn: 'CityName',
  color: '#6B7280',
  heroVideo: '',
  population: '0만+',
  state: 'Country',
  taglineKo: '한국어 태그라인',
  taglineEn: 'English tagline.',
  taglineEs: 'Tagline en español.',
}

export const HERO_SLIDE_TEMPLATE: CityHeroSlide = {
  url: 'https://images.unsplash.com/photo-XXXXXXXXXX-XXXXXXXXXXXX?w=1200&q=95',
  pos: 'center 50%',
  alt: 'CityName landmark description',
}

export const TOP5_ITEM_TEMPLATE: Top5Item = {
  name: '기관명',
  nameEn: 'Institution Name',
  address: '주소',
  phone: '전화번호',
  website: 'https://example.com',
  desc: '한국어 설명',
  descEn: 'English description',
  tier: 2,
  star: false,
}

export const DIASPORA_TEMPLATE: DiasporaIdentity = {
  flag: '🇰🇷',
  ko: '한국 이주민',
  en: 'Korea Immigrant',
  descKo: '도시명에서 새 삶을 시작하며',
  descEn: 'Starting anew in CityName.',
  color: '#6B7280',
}

export const HEBRON_CITY_TEMPLATE: HebronCity = {
  emoji: '🏙️',
  nameKo: '도시명',
  nameEn: 'CityName',
  flag: '🇰🇷',
  url: '/newcity/',
  status: 'live',
  color: '#6B7280',
}

// ── 도시 색상 팔레트 (참고용) ────────────────────────────────
// 새 도시 추가 시 아직 사용 안 된 색상을 선택하세요.
export const CITY_COLORS = {
  // 미주 (파랑 계열)
  seattle: '#0EA5E9',
  dallas: '#F59E0B',
  sf: '#8B5CF6',
  newyork: '#EF4444',
  la: '#F97316',
  chicago: '#06B6D4',
  // 캐나다
  toronto: '#DC2626',
  vancouver: '#16A34A',
  // 한국
  seoul: '#E11D48',
  busan: '#0284C7',
  daejeon: '#7C3AED',
  // 일본
  tokyo: '#DB2777',
  osaka: '#EA580C',
  // 신규 추가 후보 색상
  available: [
    '#10B981', // emerald
    '#F59E0B', // amber
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F472B6', // pink-400
    '#78716C', // stone-500
    '#6366F1', // indigo-500
  ],
} as const

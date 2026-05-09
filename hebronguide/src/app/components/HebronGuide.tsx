/**
 * HebronGuide - Seattle 정착 가이드 PWA
 *
 * ══ DESIGN SYSTEM ══════════════════════════════════════════
 * Background:  #1a2535  (soft dark navy — 20-30% lighter than #0d1117)
 * Surface:     #212d3d  (slightly lighter dark card)
 * Surface-2:   #273444  (slightly lighter dark)
 * Gold accent: #C9A227
 * Mint accent: #6EE7B7
 * Text-1:      #ECFDF5
 * Text-2:      rgba(236,253,245,0.5)
 * Text-3:      rgba(236,253,245,0.6)
 *
 * Tab structure (v4 — 6탭):
 *   🏠 홈   | 🛬 정착  | ⛪ 교회  | 🍽️ 맛집  | 🌆 탐방  | 🆘 도움
 * (취업·교육·생활비는 홈 앱 그리드에서 모달/오버레이로 접근)
 *
 * PWA 기능 (v4):
 *   - 체크리스트 localStorage 저장
 *   - InstallBanner (beforeinstallprompt)
 *   - 오프라인 배너 (online/offline 이벤트)
 *   - 로컬 알림 스케줄링 (Notification API)
 * ══════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react";
import svgPaths from "../../imports/svg-uguh2ql8id";
// 2026 시애틀 히어로 사진 6장 — 2시간마다 교체 (Unsplash 무료 라이선스)
const HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1571842377564-5849a26c3fc2?w=1200&q=85",  // Seattle skyline 야경
  "https://images.unsplash.com/photo-1525466760727-1d8be8721154?w=1200&q=85",  // Space Needle 낮
  "https://images.unsplash.com/photo-1546587348-d12660c30c50?w=1200&q=85",     // Pike Place Market
  "https://images.unsplash.com/photo-1519021228607-ef6e4c22a821?w=1200&q=85",  // Seattle 항구 & 선셋
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85",  // PNW 자연 + 시애틀
  "https://images.unsplash.com/photo-1559521783-1d1599583485?w=1200&q=85",     // Seattle 거리 활기
];
// 사진별 object-position — Space Needle(1번)은 꼭대기가 잘리지 않도록 위쪽 표시
const HERO_PHOTO_POSITIONS = [
  "center 40%",  // Seattle skyline 야경
  "center 8%",   // Space Needle 낮 — 꼭대기 전체 표시
  "center 45%",  // Pike Place Market
  "center 40%",  // Seattle 항구 & 선셋
  "center 35%",  // PNW 자연 + 시애틀
  "center 40%",  // Seattle 거리 활기
];
// 2시간 단위로 사진 교체 (하루 12 슬롯 → 6장 × 2)
const heroPhotoIdx = Math.floor(new Date().getHours() / 2) % HERO_PHOTOS.length;
const imgHeroCard = HERO_PHOTOS[heroPhotoIdx];
const heroPhotoPosition = HERO_PHOTO_POSITIONS[heroPhotoIdx];
const imgCoffee = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80";
const imgLifestyle = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80";
// 동네 Top 3 사진
const imgLynnwood = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80"; // 한인타운 느낌 suburban
const imgBothell  = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"; // 자연 + 주거 (PNW)
const imgBellevue = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80"; // 현대 도시
import logoImg from "../../imports/icon-192.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useI18n } from "./I18nContext";
import { useContent, resolvePlaceItems, resolveStepItems } from "./ContentContext";
import {
  Home,
  Search,
  Globe,
  MessageCircle,
  MapPin,
  Utensils,
  LifeBuoy,
  Grid,
  Church,
  Map,
  Briefcase,
  GraduationCap,
  DollarSign,
  X,
  Share2,
  Plane,
  HeartPulse,
  Car,
  ShoppingCart,
  FileText,
  Scale,
  BookOpen,
  Receipt,
  Vote,
  LibraryBig,
  Users,
  Heart,
  Star,
  Network,
} from "lucide-react";

/* Quick Menu 아이콘 맵 */
const QM_ICON_MAP: Record<string, React.ComponentType<{size?: number; color?: string; strokeWidth?: number}>> = {
  "plane-landing":  Plane,
  "utensils":       Utensils,
  "home":           Home,
  "heart-pulse":    HeartPulse,
  "church":         Church,
  "car":            Car,
  "shopping-cart":  ShoppingCart,
  "briefcase":      Briefcase,
  "graduation-cap": GraduationCap,
  "dollar-sign":    DollarSign,
  "map":            Map,
  "life-buoy":      LifeBuoy,
  "file-text":      FileText,
  "scale":          Scale,
  "book-open":      BookOpen,
  "receipt":        Receipt,
  "users":          Users,
  "heart":          Heart,
};

/* ─────────────────────────────────────────
   TOKENS
───────────────────────────────────────── */
const GOLD = "#C9A227";
const MINT = "#6EE7B7";

/* ─────────────────────────────────────────
   CITY CONFIG — 도시별 설정
───────────────────────────────────────── */
// 현재 17개 + 확장 27개 = 총 44개 도시 (계속 성장 중)
// 작은 도시일수록 HebronGuide가 더 필요합니다 — 외롭기 때문입니다
type CitySlug =
  // 북미 (기존 17)
  "seattle" | "dallas" | "sf" | "newyork" | "nashville" | "boston" | "la" |
  "toronto" | "vancouver" | "houston" | "atlanta" | "kansascity" | "philadelphia" |
  "miami" | "mexicocity" | "guadalajara" | "monterrey" |
  // 북미 확장 (Tier A)
  "chicago" | "dc" | "sandiego" | "honolulu" | "portland" | "denver" |
  // 북미 확장 (Tier B-C)
  "calgary" | "phoenix" | "charlotte" | "columbus" | "raleigh" | "minneapolis" |
  "fayetteville" | "killeen" | "anchorage" | "tucson" | "winnipeg" | "edmonton" | "ottawa" |
  // 국제 (Tier A)
  "sydney" | "melbourne" | "saopaulo" | "london" | "auckland" |
  // 국제 (Tier B-C)
  "singapore" | "bangkok" | "hochiminh" | "dubai" | "frankfurt" | "paris" |
  "perth" | "brisbane" | "berlin";

interface CityConfig {
  slug: CitySlug;
  nameKo: string;
  nameEn: string;
  color: string;
  heroVideo: string;
  population: string;       // 한인 인구
  state: string;            // 주/지역
  taglineKo: string;
  taglineEn: string;
  taglineEs?: string;
}

const CITY_CONFIGS: Record<CitySlug, CityConfig> = {
  seattle: {
    slug: "seattle", nameKo: "시애틀", nameEn: "Seattle", color: "#0EA5E9",
    heroVideo: "https://videos.pexels.com/video-files/20017409/20017409-hd_1920_1080_24fps.mp4",
    population: "15만+", state: "Washington",
    taglineKo: "도시를 알고, 사람을 찾다", taglineEn: "Know your city. Find your people.",
    taglineEs: "Conoce tu ciudad. Encuentra tu gente.",
  },
  dallas: {
    slug: "dallas", nameKo: "달라스", nameEn: "Dallas", color: "#F59E0B",
    heroVideo: "https://videos.pexels.com/video-files/3214424/3214424-hd_1920_1080_30fps.mp4",
    population: "10만+", state: "Texas",
    taglineKo: "텍사스에서 뿌리내리다", taglineEn: "Put down roots in Texas.",
    taglineEs: "Echa raíces en Texas.",
  },
  sf: {
    slug: "sf", nameKo: "샌프란시스코", nameEn: "San Francisco", color: "#8B5CF6",
    heroVideo: "https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4",
    population: "8만+", state: "California",
    taglineKo: "베이에서 시작하는 새 출발", taglineEn: "A new start by the Bay.",
    taglineEs: "Un nuevo comienzo junto a la Bahía.",
  },
  newyork:   { slug: "newyork",   nameKo: "뉴욕",     nameEn: "New York",   color: "#EF4444", heroVideo: "", population: "15만+", state: "New York",    taglineKo: "뉴욕에서 찾는 나의 자리",  taglineEn: "Find your place in New York.",   taglineEs: "Encuentra tu lugar en Nueva York."    },
  nashville: { slug: "nashville", nameKo: "내쉬빌",   nameEn: "Nashville",  color: "#10B981", heroVideo: "", population: "2만+",  state: "Tennessee",  taglineKo: "뮤직시티에서의 새 출발",  taglineEn: "New start in Music City.",       taglineEs: "Nuevo comienzo en la ciudad de la música."       },
  boston:    { slug: "boston",    nameKo: "보스턴",   nameEn: "Boston",     color: "#3B82F6", heroVideo: "", population: "3만+",  state: "Massachusetts", taglineKo: "역사의 도시, 새 역사를 쓰다", taglineEn: "Write your story in Boston.", taglineEs: "Escribe tu historia en Boston." },
  la:        { slug: "la",        nameKo: "LA",       nameEn: "Los Angeles",color: "#F97316", heroVideo: "", population: "50만+", state: "California",  taglineKo: "가장 큰 한인 커뮤니티",   taglineEn: "The largest Korean community.",  taglineEs: "La comunidad coreana más grande." },
  toronto:   { slug: "toronto",   nameKo: "토론토",   nameEn: "Toronto",    color: "#06B6D4", heroVideo: "", population: "10만+", state: "Ontario",    taglineKo: "캐나다에서 한인으로",       taglineEn: "Korean in Canada.",              taglineEs: "Coreano en Canadá."              },
  vancouver: { slug: "vancouver", nameKo: "밴쿠버",   nameEn: "Vancouver",  color: "#22C55E", heroVideo: "", population: "8만+",  state: "B.C.",       taglineKo: "태평양의 관문에서",         taglineEn: "Gateway to the Pacific.",        taglineEs: "Puerta al Pacífico."        },
  houston:    { slug: "houston",    nameKo: "휴스턴",    nameEn: "Houston",      color: "#EA580C", heroVideo: "", population: "2.5만+", state: "Texas",       taglineKo: "텍사스 남부의 활력",         taglineEn: "Vibrant heart of South Texas.",  taglineEs: "Corazón vibrante del sur de Texas." },
  atlanta:    { slug: "atlanta",    nameKo: "애틀랜타",  nameEn: "Atlanta",      color: "#16A34A", heroVideo: "", population: "10만+",  state: "Georgia",     taglineKo: "남부의 한인 허브",           taglineEn: "Korean hub of the South.",       taglineEs: "Hub coreano del Sur." },
  kansascity: { slug: "kansascity", nameKo: "캔자스시티", nameEn: "Kansas City",  color: "#9333EA", heroVideo: "", population: "3천+",   state: "Missouri",    taglineKo: "중부의 새 지평",             taglineEn: "New horizons in the Heartland.", taglineEs: "Nuevos horizontes en el corazón de EE.UU." },
  philadelphia:{ slug: "philadelphia", nameKo: "필라델피아", nameEn: "Philadelphia", color: "#0891B2", heroVideo: "", population: "3만+", state: "Pennsylvania", taglineKo: "역사의 도시에서 시작하다",   taglineEn: "Start your story in the City of Brotherly Love.", taglineEs: "Comienza tu historia en la Ciudad del Amor Fraternal." },
  miami:      { slug: "miami",      nameKo: "마이애미",  nameEn: "Miami",        color: "#EC4899", heroVideo: "", population: "5천+",   state: "Florida",     taglineKo: "햇살 아래 새 출발",           taglineEn: "Fresh start under the sun.",     taglineEs: "Nuevo comienzo bajo el sol." },
  mexicocity: { slug: "mexicocity", nameKo: "멕시코시티", nameEn: "Mexico City",  color: "#DC2626", heroVideo: "", population: "1만+",   state: "Mexico",      taglineKo: "고대와 현대가 만나는 곳",     taglineEn: "Where ancient meets modern.",    taglineEs: "Donde lo antiguo se encuentra con lo moderno." },
  guadalajara:{ slug: "guadalajara",nameKo: "과달라하라", nameEn: "Guadalajara",  color: "#F59E0B", heroVideo: "", population: "2천+",   state: "Mexico",      taglineKo: "멕시코의 문화 수도",          taglineEn: "Mexico's cultural capital.",     taglineEs: "La capital cultural de México." },
  monterrey:  { slug: "monterrey",  nameKo: "몬테레이",  nameEn: "Monterrey",    color: "#0EA5E9", heroVideo: "", population: "1천+",   state: "Mexico",      taglineKo: "산으로 둘러싸인 산업도시",    taglineEn: "Industrial city in the mountains.", taglineEs: "Ciudad industrial entre montañas." },

  // ── 북미 확장 Tier A (Isolation: 2-3) ──────────────────────────────────
  chicago:    { slug: "chicago",    nameKo: "시카고",    nameEn: "Chicago",      color: "#1D4ED8", heroVideo: "", population: "6.2만+", state: "Illinois",    taglineKo: "바람의 도시, 우리의 집",       taglineEn: "City of Winds, Home of Ours.",   taglineEs: "Ciudad de los Vientos, nuestro hogar." },
  dc:         { slug: "dc",         nameKo: "워싱턴 DC", nameEn: "Washington DC",color: "#DC2626", heroVideo: "", population: "9.3만+", state: "Virginia/MD", taglineKo: "나라의 심장에서",             taglineEn: "At the Heart of the Nation.",    taglineEs: "En el corazón de la nación." },
  sandiego:   { slug: "sandiego",   nameKo: "샌디에고",  nameEn: "San Diego",    color: "#0891B2", heroVideo: "", population: "2.5만+", state: "California",  taglineKo: "태평양이 품은 도시",          taglineEn: "The City the Pacific Holds.",    taglineEs: "La ciudad que abraza el Pacífico." },
  honolulu:   { slug: "honolulu",   nameKo: "호놀룰루",  nameEn: "Honolulu",     color: "#10B981", heroVideo: "", population: "2.3만+", state: "Hawaii",      taglineKo: "섬 위의 한인",               taglineEn: "Koreans on the Island.",         taglineEs: "Coreanos en la isla." },
  portland:   { slug: "portland",   nameKo: "포틀랜드",  nameEn: "Portland",     color: "#BE185D", heroVideo: "", population: "1만+",   state: "Oregon",      taglineKo: "장미 도시의 한인들",          taglineEn: "Koreans in the Rose City.",      taglineEs: "Coreanos en la Ciudad de las Rosas." },
  denver:     { slug: "denver",     nameKo: "덴버",      nameEn: "Denver",       color: "#92400E", heroVideo: "", population: "1.5만+", state: "Colorado",    taglineKo: "산을 바라보며",              taglineEn: "Looking Out to the Mountains.",  taglineEs: "Con vista a las montañas." },

  // ── 북미 확장 Tier B (Isolation: 3-4) ──────────────────────────────────
  calgary:    { slug: "calgary",    nameKo: "캘거리",    nameEn: "Calgary",      color: "#D97706", heroVideo: "", population: "1.3만+", state: "Alberta",     taglineKo: "알버타의 한인",              taglineEn: "Koreans of Alberta.",            taglineEs: "Coreanos de Alberta." },
  edmonton:   { slug: "edmonton",   nameKo: "에드먼턴",  nameEn: "Edmonton",     color: "#059669", heroVideo: "", population: "8천+",   state: "Alberta",     taglineKo: "북쪽 평원의 한인",           taglineEn: "Koreans on the Northern Plains.", taglineEs: "Coreanos en las llanuras del norte." },
  ottawa:     { slug: "ottawa",     nameKo: "오타와",    nameEn: "Ottawa",       color: "#DC2626", heroVideo: "", population: "5천+",   state: "Ontario",     taglineKo: "수도의 조용한 한인",          taglineEn: "Quiet Koreans in the Capital.",  taglineEs: "Coreanos tranquilos en la capital." },
  winnipeg:   { slug: "winnipeg",   nameKo: "위니펙",    nameEn: "Winnipeg",     color: "#7C3AED", heroVideo: "", population: "4천+",   state: "Manitoba",    taglineKo: "가장 고립된 캐나다 한인",     taglineEn: "Canada's Most Isolated Korean Community.", taglineEs: "La comunidad coreana más aislada de Canadá." },
  phoenix:    { slug: "phoenix",    nameKo: "피닉스",    nameEn: "Phoenix",      color: "#EA580C", heroVideo: "", population: "1.2만+", state: "Arizona",     taglineKo: "사막 속의 한인",             taglineEn: "Koreans in the Desert.",         taglineEs: "Coreanos en el desierto." },
  charlotte:  { slug: "charlotte",  nameKo: "샬럿",      nameEn: "Charlotte",    color: "#0EA5E9", heroVideo: "", population: "1.5만+", state: "N. Carolina", taglineKo: "남부의 성장하는 한인 도시",    taglineEn: "The South's Growing Korean City.", taglineEs: "La creciente ciudad coreana del Sur." },
  raleigh:    { slug: "raleigh",    nameKo: "롤리",      nameEn: "Raleigh",      color: "#2563EB", heroVideo: "", population: "1만+",   state: "N. Carolina", taglineKo: "연구 삼각지의 한인",          taglineEn: "Koreans in the Research Triangle.", taglineEs: "Coreanos en el Triángulo de Investigación." },
  columbus:   { slug: "columbus",   nameKo: "콜럼버스",  nameEn: "Columbus",     color: "#B91C1C", heroVideo: "", population: "1.2만+", state: "Ohio",        taglineKo: "오하이오 한인의 도시",         taglineEn: "Home of Ohio's Korean Community.", taglineEs: "Hogar de la comunidad coreana de Ohio." },
  minneapolis:{ slug: "minneapolis",nameKo: "미니애폴리스",nameEn: "Minneapolis",  color: "#7C3AED", heroVideo: "", population: "8천+",   state: "Minnesota",   taglineKo: "호수 도시의 한인",           taglineEn: "Koreans in the Lake City.",      taglineEs: "Coreanos en la ciudad de los lagos." },
  tucson:     { slug: "tucson",     nameKo: "투손",      nameEn: "Tucson",       color: "#CA8A04", heroVideo: "", population: "3천+",   state: "Arizona",     taglineKo: "사막의 대학 도시",           taglineEn: "Desert University City.",        taglineEs: "Ciudad universitaria del desierto." },

  // ── 북미 소도시·군사도시 Tier C (Isolation: 4-5) ─────────────────────────
  fayetteville:{ slug: "fayetteville",nameKo: "페이엣빌", nameEn: "Fayetteville", color: "#15803D", heroVideo: "", population: "5천+",  state: "N. Carolina", taglineKo: "부대 옆 한인 가족들",         taglineEn: "Korean Families Near the Base.",  taglineEs: "Familias coreanas cerca de la base." },
  killeen:    { slug: "killeen",    nameKo: "킬린",      nameEn: "Killeen",      color: "#854D0E", heroVideo: "", population: "4천+",   state: "Texas",       taglineKo: "포트 카바조스 한인 가족",      taglineEn: "Korean Families at Fort Cavazos.", taglineEs: "Familias coreanas en Fort Cavazos." },
  anchorage:  { slug: "anchorage",  nameKo: "앵커리지",  nameEn: "Anchorage",    color: "#0F766E", heroVideo: "", population: "5천+",   state: "Alaska",      taglineKo: "가장 북쪽의 한인 도시",        taglineEn: "America's Northernmost Korean City.", taglineEs: "La ciudad coreana más al norte." },

  // ── 국제 확장 Tier A ────────────────────────────────────────────────────
  sydney:     { slug: "sydney",     nameKo: "시드니",    nameEn: "Sydney",       color: "#0284C7", heroVideo: "", population: "7만+",   state: "N.S.W.",      taglineKo: "남반구의 한국",              taglineEn: "Korea in the Southern Hemisphere.", taglineEs: "Corea en el hemisferio sur." },
  melbourne:  { slug: "melbourne",  nameKo: "멜버른",    nameEn: "Melbourne",    color: "#9333EA", heroVideo: "", population: "3만+",   state: "Victoria",    taglineKo: "카페 도시의 한인",           taglineEn: "Koreans in the Coffee City.",     taglineEs: "Coreanos en la ciudad del café." },
  brisbane:   { slug: "brisbane",   nameKo: "브리즈번",  nameEn: "Brisbane",     color: "#CA8A04", heroVideo: "", population: "1.8만+", state: "Queensland",  taglineKo: "선샤인 스테이트의 한인",       taglineEn: "Koreans in the Sunshine State.",  taglineEs: "Coreanos en el Estado del Sol." },
  perth:      { slug: "perth",      nameKo: "퍼스",      nameEn: "Perth",        color: "#0891B2", heroVideo: "", population: "1.2만+", state: "W. Australia",taglineKo: "가장 외진 한인 도시",         taglineEn: "The World's Most Remote Korean City.", taglineEs: "La ciudad coreana más remota del mundo." },
  auckland:   { slug: "auckland",   nameKo: "오클랜드",  nameEn: "Auckland",     color: "#16A34A", heroVideo: "", population: "2.5만+", state: "New Zealand", taglineKo: "키위와 함께",               taglineEn: "Together with the Kiwis.",       taglineEs: "Junto con los kiwis." },
  saopaulo:   { slug: "saopaulo",   nameKo: "상파울루",  nameEn: "São Paulo",    color: "#DC2626", heroVideo: "", population: "5만+",   state: "Brazil",      taglineKo: "남미 한인의 심장",           taglineEn: "Heart of Korean South America.",  taglineEs: "El corazón del sudamérica coreana." },
  london:     { slug: "london",     nameKo: "런던",      nameEn: "London",       color: "#1E40AF", heroVideo: "", population: "4.5만+", state: "England",     taglineKo: "안개 속의 한인",             taglineEn: "Koreans in the Fog.",            taglineEs: "Coreanos en la niebla." },

  // ── 국제 확장 Tier B-C ──────────────────────────────────────────────────
  singapore:  { slug: "singapore",  nameKo: "싱가포르",  nameEn: "Singapore",    color: "#DC2626", heroVideo: "", population: "2.2만+", state: "Singapore",   taglineKo: "도시국가의 한인",            taglineEn: "Koreans in the City-State.",     taglineEs: "Coreanos en la ciudad-estado." },
  bangkok:    { slug: "bangkok",    nameKo: "방콕",      nameEn: "Bangkok",      color: "#9333EA", heroVideo: "", population: "2만+",   state: "Thailand",    taglineKo: "황금 도시의 한인",           taglineEn: "Koreans in the Golden City.",    taglineEs: "Coreanos en la ciudad dorada." },
  hochiminh:  { slug: "hochiminh",  nameKo: "호치민",    nameEn: "Ho Chi Minh City", color: "#BE185D", heroVideo: "", population: "6만+", state: "Vietnam",    taglineKo: "비즈니스 한인의 도시",        taglineEn: "City of Business Koreans.",      taglineEs: "Ciudad de los coreanos de negocios." },
  dubai:      { slug: "dubai",      nameKo: "두바이",    nameEn: "Dubai",        color: "#CA8A04", heroVideo: "", population: "8천+",   state: "UAE",         taglineKo: "사막의 황금 도시 한인",        taglineEn: "Koreans in the Desert Gold City.", taglineEs: "Coreanos en la ciudad dorada del desierto." },
  frankfurt:  { slug: "frankfurt",  nameKo: "프랑크푸르트",nameEn: "Frankfurt",   color: "#1D4ED8", heroVideo: "", population: "7천+",   state: "Germany",     taglineKo: "유럽 금융의 중심에서",         taglineEn: "At Europe's Financial Core.",    taglineEs: "En el núcleo financiero de Europa." },
  berlin:     { slug: "berlin",     nameKo: "베를린",    nameEn: "Berlin",       color: "#374151", heroVideo: "", population: "5천+",   state: "Germany",     taglineKo: "장벽을 넘어선 한인",          taglineEn: "Koreans Beyond the Wall.",       taglineEs: "Coreanos más allá del muro." },
  paris:      { slug: "paris",      nameKo: "파리",      nameEn: "Paris",        color: "#7C3AED", heroVideo: "", population: "1.5만+", state: "France",      taglineKo: "빛의 도시의 한인",           taglineEn: "Koreans in the City of Light.",  taglineEs: "Coreanos en la Ciudad de la Luz." },
};

function useCityConfig(): CityConfig {
  const slug = (window.location.pathname.split("/").filter(Boolean)[0] || "seattle").toLowerCase() as CitySlug;
  return CITY_CONFIGS[slug] ?? CITY_CONFIGS.seattle;
}

/* ─────────────────────────────────────────
   도시별 인구·언어·민족 분포 통계
   출처: US Census ACS 2023 / Stats Canada 2021 / INEGI 2020
   전략 목적: 타겟 언어 우선순위 & 커뮤니티 전략 수립
───────────────────────────────────────── */
interface CityDemographics {
  metroPopulation: string;    // 광역 인구
  koreanPopulation: string;   // 한인 인구
  koreanPercent: string;      // 전체 대비 한인 비율
  topLanguages: string[];     // 주요 사용 언어 (순위순)
  ethnicComposition: { group: string; pct: string }[]; // 주요 민족 구성
  diversityScore: string;     // 다양성 지수 (높음/중간/낮음)
  strategicNote: string;      // 전략 메모
  strategicNoteEn: string;
}

function getCityDemographics(slug: string, lang: string): CityDemographics {
  const ko = lang === "ko";
  const DATA: Record<string, CityDemographics> = {
    seattle: {
      metroPopulation: "420만", koreanPopulation: "15만+", koreanPercent: "3.6%",
      topLanguages: ["영어", "스페인어", "한국어", "베트남어", "중국어", "타갈로그어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "62%" },
        { group: ko ? "아시안" : "Asian", pct: "16%" },
        { group: ko ? "히스패닉" : "Hispanic", pct: "10%" },
        { group: ko ? "흑인" : "Black", pct: "7%" },
        { group: ko ? "기타" : "Other", pct: "5%" },
      ],
      diversityScore: ko ? "높음" : "High",
      strategicNote: "아시안 중 한인 비율 1위. 3개 언어(한·영·스) 모두 유효. 빅테크 이민자 커뮤니티 강세.",
      strategicNoteEn: "Highest Korean % among Asian cities. All 3 languages (KO/EN/ES) effective. Strong tech immigrant community.",
    },
    dallas: {
      metroPopulation: "760만", koreanPopulation: "10만+", koreanPercent: "1.3%",
      topLanguages: ["영어", "스페인어", "베트남어", "중국어", "한국어", "아랍어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "44%" },
        { group: ko ? "히스패닉" : "Hispanic", pct: "29%" },
        { group: ko ? "흑인" : "Black", pct: "16%" },
        { group: ko ? "아시안" : "Asian", pct: "7%" },
        { group: ko ? "기타" : "Other", pct: "4%" },
      ],
      diversityScore: ko ? "매우 높음" : "Very High",
      strategicNote: "히스패닉 29% → 스페인어 콘텐츠 전략 필수. 한·영·스 3개 언어 모두 핵심. 캐롤튼 한인타운 집중.",
      strategicNoteEn: "Hispanic 29% — Spanish content essential. All 3 languages core. Focus on Carrollton Korean hub.",
    },
    la: {
      metroPopulation: "1,300만", koreanPopulation: "50만+", koreanPercent: "3.8%",
      topLanguages: ["영어", "스페인어", "한국어", "중국어", "타갈로그어", "베트남어", "아르메니아어"],
      ethnicComposition: [
        { group: ko ? "히스패닉" : "Hispanic", pct: "49%" },
        { group: ko ? "백인" : "White", pct: "29%" },
        { group: ko ? "아시안" : "Asian", pct: "11%" },
        { group: ko ? "흑인" : "Black", pct: "9%" },
        { group: ko ? "기타" : "Other", pct: "2%" },
      ],
      diversityScore: ko ? "최고" : "Highest",
      strategicNote: "북미 최대 한인 커뮤니티(50만). 히스패닉 49% → 스페인어 최우선. 코리아타운 자체가 미디어 플랫폼.",
      strategicNoteEn: "Largest Korean community in North America (500K). Hispanic 49% — Spanish #1 priority. Koreatown is its own media platform.",
    },
    newyork: {
      metroPopulation: "2,000만", koreanPopulation: "20만+", koreanPercent: "1.0%",
      topLanguages: ["영어", "스페인어", "중국어", "한국어", "러시아어", "벵골어", "아랍어", "프랑스어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "42%" },
        { group: ko ? "히스패닉" : "Hispanic", pct: "29%" },
        { group: ko ? "흑인" : "Black", pct: "24%" },
        { group: ko ? "아시안" : "Asian", pct: "14%" },
        { group: ko ? "기타" : "Other", pct: "4%" },
      ],
      diversityScore: ko ? "세계 최고" : "World-class Diversity",
      strategicNote: "세계 최다 언어 도시(800개+). NJ 한인(팰리세이즈파크) + 플러싱(퀸스) 이중 거점. 스페인어 필수.",
      strategicNoteEn: "Most linguistically diverse city (800+ languages). Dual Korean hubs: Palisades Park (NJ) + Flushing (Queens). Spanish essential.",
    },
    houston: {
      metroPopulation: "730만", koreanPopulation: "2.5만+", koreanPercent: "0.3%",
      topLanguages: ["영어", "스페인어", "베트남어", "중국어", "아랍어", "힌디어", "한국어"],
      ethnicComposition: [
        { group: ko ? "히스패닉" : "Hispanic", pct: "44%" },
        { group: ko ? "백인" : "White", pct: "34%" },
        { group: ko ? "흑인" : "Black", pct: "17%" },
        { group: ko ? "아시안" : "Asian", pct: "7%" },
        { group: ko ? "기타" : "Other", pct: "2%" },
      ],
      diversityScore: ko ? "매우 높음" : "Very High",
      strategicNote: "히스패닉 44% — 스페인어가 사실상 제2공용어. 한인 인구 상대적으로 적지만 에너지 업종 전문직 다수. NASA·의료센터 한인 집중.",
      strategicNoteEn: "Hispanic 44% — Spanish is de facto 2nd language. Smaller Korean pop but many professionals in energy & medical sectors. NASA/Texas Medical Center Korean concentration.",
    },
    sf: {
      metroPopulation: "770만", koreanPopulation: "8만+", koreanPercent: "1.0%",
      topLanguages: ["영어", "스페인어", "중국어", "타갈로그어", "베트남어", "한국어", "힌디어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "40%" },
        { group: ko ? "아시안" : "Asian", pct: "26%" },
        { group: ko ? "히스패닉" : "Hispanic", pct: "23%" },
        { group: ko ? "흑인" : "Black", pct: "7%" },
        { group: ko ? "기타" : "Other", pct: "4%" },
      ],
      diversityScore: ko ? "높음" : "High",
      strategicNote: "아시안 비율 전국 최고(26%). 실리콘밸리 테크 이민자 밀집 — 인도·중국·한국 순. 영어+한국어가 핵심 언어.",
      strategicNoteEn: "Highest Asian % in US (26%). Silicon Valley tech immigrants — India/China/Korea top 3. English + Korean core languages.",
    },
    toronto: {
      metroPopulation: "620만", koreanPopulation: "10만+", koreanPercent: "1.6%",
      topLanguages: ["영어", "프랑스어", "광둥어", "만다린어", "펀자브어", "타밀어", "한국어", "이탈리아어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "47%" },
        { group: ko ? "남아시안" : "South Asian", pct: "13%" },
        { group: ko ? "중화계" : "Chinese", pct: "11%" },
        { group: ko ? "흑인" : "Black", pct: "9%" },
        { group: ko ? "필리핀계" : "Filipino", pct: "5%" },
        { group: ko ? "한국계" : "Korean", pct: "2%" },
      ],
      diversityScore: ko ? "세계 최고" : "World-class Diversity",
      strategicNote: "캐나다 최대 도시. 세계 최고 수준 다문화 도시. 영어+한국어 중심. 한인 2세 영어 세대 강세. 이민자 친화 정책 최강.",
      strategicNoteEn: "Canada's largest city. World-class multicultural city. English+Korean core. Strong 2nd-gen Korean community. Best immigration-friendly policies.",
    },
    vancouver: {
      metroPopulation: "260만", koreanPopulation: "8만+", koreanPercent: "3.1%",
      topLanguages: ["영어", "광둥어", "만다린어", "한국어", "펀자브어", "프랑스어", "타갈로그어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "46%" },
        { group: ko ? "중화계" : "Chinese", pct: "20%" },
        { group: ko ? "남아시안" : "South Asian", pct: "12%" },
        { group: ko ? "필리핀계" : "Filipino", pct: "4%" },
        { group: ko ? "한국계" : "Korean", pct: "3%" },
        { group: ko ? "기타" : "Other", pct: "15%" },
      ],
      diversityScore: ko ? "매우 높음" : "Very High",
      strategicNote: "북미에서 한인 비율이 가장 높은 도시 중 하나(3.1%). 버나비 중심 한인타운 발달. 영어+한국어 핵심. 유학생·이민자 유입 지속.",
      strategicNoteEn: "One of North America's highest Korean % cities (3.1%). Burnaby Korean hub well-developed. English+Korean core. Continuous student & immigrant influx.",
    },
    boston: {
      metroPopulation: "480만", koreanPopulation: "3만+", koreanPercent: "0.6%",
      topLanguages: ["영어", "스페인어", "포르투갈어", "중국어", "베트남어", "아이티 크레올어", "한국어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "73%" },
        { group: ko ? "흑인" : "Black", pct: "9%" },
        { group: ko ? "히스패닉" : "Hispanic", pct: "9%" },
        { group: ko ? "아시안" : "Asian", pct: "9%" },
        { group: ko ? "기타" : "Other", pct: "0%" },
      ],
      diversityScore: ko ? "중간" : "Moderate",
      strategicNote: "교육도시 특성 — 한인 유학생 비율 높음(하버드·MIT·BU). 올스턴 집중. 포르투갈어권 브라질·포르투갈 커뮤니티 강세. 한·영 2개 언어 충분.",
      strategicNoteEn: "Education city — high % Korean students (Harvard/MIT/BU). Allston focus. Strong Brazilian/Portuguese community. Korean+English sufficient.",
    },
    nashville: {
      metroPopulation: "210만", koreanPopulation: "2만+", koreanPercent: "0.9%",
      topLanguages: ["영어", "스페인어", "쿠르드어", "아랍어", "소말리아어", "한국어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "69%" },
        { group: ko ? "흑인" : "Black", pct: "15%" },
        { group: ko ? "히스패닉" : "Hispanic", pct: "11%" },
        { group: ko ? "아시안" : "Asian", pct: "4%" },
        { group: ko ? "기타" : "Other", pct: "1%" },
      ],
      diversityScore: ko ? "중간" : "Moderate",
      strategicNote: "빠르게 성장하는 도시 — 한인 유입 증가세. 쿠르드 난민 커뮤니티 독특함. 한·영 2개 언어 중심. 교회 커뮤니티 중심의 한인 네트워크.",
      strategicNoteEn: "Fastest growing US city — Korean influx rising. Unique Kurdish refugee community. Korean+English focus. Church-centered Korean network.",
    },
    atlanta: {
      metroPopulation: "620만", koreanPopulation: "10만+", koreanPercent: "1.6%",
      topLanguages: ["영어", "스페인어", "베트남어", "한국어", "아랍어", "포르투갈어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "51%" },
        { group: ko ? "흑인" : "Black", pct: "32%" },
        { group: ko ? "히스패닉" : "Hispanic", pct: "11%" },
        { group: ko ? "아시안" : "Asian", pct: "5%" },
        { group: ko ? "기타" : "Other", pct: "1%" },
      ],
      diversityScore: ko ? "높음" : "High",
      strategicNote: "남부 최대 한인 커뮤니티. 흑인 문화 중심 도시 — 한흑 문화 교류 활발. 둘루스·스와니 교회 중심 네트워크 강함. 한·영 핵심.",
      strategicNoteEn: "Largest Korean community in the South. Black culture hub — Korean-Black cultural exchange active. Strong church network in Duluth/Suwanee. Korean+English core.",
    },
    kansascity: {
      metroPopulation: "220만", koreanPopulation: "3천+", koreanPercent: "0.1%",
      topLanguages: ["영어", "스페인어", "베트남어", "아랍어", "소말리아어", "한국어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "73%" },
        { group: ko ? "흑인" : "Black", pct: "12%" },
        { group: ko ? "히스패닉" : "Hispanic", pct: "11%" },
        { group: ko ? "아시안" : "Asian", pct: "3%" },
        { group: ko ? "기타" : "Other", pct: "1%" },
      ],
      diversityScore: ko ? "낮음-중간" : "Low-Moderate",
      strategicNote: "한인 인구 작지만 충성도 높은 소규모 커뮤니티. 한·영 2개 언어. 중서부 거점 — 주변 도시(오마하·워치타) 교두보 역할 가능.",
      strategicNoteEn: "Small but loyal Korean community. Korean+English. Midwest hub — potential gateway to Omaha/Wichita.",
    },
    philadelphia: {
      metroPopulation: "620만", koreanPopulation: "3만+", koreanPercent: "0.5%",
      topLanguages: ["영어", "스페인어", "중국어", "베트남어", "러시아어", "한국어"],
      ethnicComposition: [
        { group: ko ? "백인" : "White", pct: "52%" },
        { group: ko ? "흑인" : "Black", pct: "41%" },
        { group: ko ? "히스패닉" : "Hispanic", pct: "15%" },
        { group: ko ? "아시안" : "Asian", pct: "7%" },
        { group: ko ? "기타" : "Other", pct: "1%" },
      ],
      diversityScore: ko ? "높음" : "High",
      strategicNote: "흑인 비율 높은 역사 도시. 어퍼다비·체리힐NJ 한인 집중. 동부 대도시 중 생활비 저렴. 한·영 중심.",
      strategicNoteEn: "Historic city with high Black %. Korean concentration in Upper Darby & Cherry Hill NJ. Most affordable East Coast major city. Korean+English focus.",
    },
    miami: {
      metroPopulation: "610만", koreanPopulation: "5천+", koreanPercent: "0.1%",
      topLanguages: ["스페인어", "영어", "아이티 크레올어", "포르투갈어", "프랑스어", "한국어"],
      ethnicComposition: [
        { group: ko ? "히스패닉" : "Hispanic", pct: "70%" },
        { group: ko ? "흑인" : "Black", pct: "20%" },
        { group: ko ? "백인" : "White", pct: "15%" },
        { group: ko ? "아시안" : "Asian", pct: "2%" },
        { group: ko ? "기타" : "Other", pct: "1%" },
      ],
      diversityScore: ko ? "히스패닉 특화" : "Hispanic-dominant",
      strategicNote: "스페인어가 제1언어! 히스패닉 70% — 스페인어 없으면 전략 불가. 한인 인구 작음. 중남미 한인 허브 역할. 3개 언어(한·영·스) 모두 필수.",
      strategicNoteEn: "Spanish is #1 language! Hispanic 70% — no Spanish = no strategy. Small Korean pop but Latin America Korean hub. All 3 languages (KO/EN/ES) essential.",
    },
    mexicocity: {
      metroPopulation: "2,200만", koreanPopulation: "1만+", koreanPercent: "0.05%",
      topLanguages: ["스페인어", "나후아틀어", "마야어", "믹스테카어", "사포텍어", "영어", "한국어"],
      ethnicComposition: [
        { group: ko ? "메스티소(혼혈)" : "Mestizo", pct: "62%" },
        { group: ko ? "원주민" : "Indigenous", pct: "21%" },
        { group: ko ? "백인" : "White", pct: "9%" },
        { group: ko ? "아프리카계" : "Afro-Mexican", pct: "5%" },
        { group: ko ? "기타" : "Other", pct: "3%" },
      ],
      diversityScore: ko ? "라틴 특화" : "Latin-dominant",
      strategicNote: "스페인어 완전 지배 도시. 한·스 2개 언어 전략. 폴랑코 외교·비즈니스 구역 한인 집중. 중남미 선교·비즈니스 허브로 전략적 가치 높음.",
      strategicNoteEn: "Spanish-dominant city. Korean+Spanish 2-language strategy. Polanco diplomatic/business district Korean concentration. High strategic value as Latin America mission/business hub.",
    },
    guadalajara: {
      metroPopulation: "530만", koreanPopulation: "2천+", koreanPercent: "0.04%",
      topLanguages: ["스페인어", "나후아틀어", "영어", "한국어"],
      ethnicComposition: [
        { group: ko ? "메스티소(혼혈)" : "Mestizo", pct: "66%" },
        { group: ko ? "원주민" : "Indigenous", pct: "18%" },
        { group: ko ? "백인" : "White", pct: "12%" },
        { group: ko ? "기타" : "Other", pct: "4%" },
      ],
      diversityScore: ko ? "라틴 특화" : "Latin-dominant",
      strategicNote: "멕시코 실리콘밸리. Intel·IBM·Oracle 오피스. 한인 주재원·테크 인력 중심. 문화·창작 산업 강세. 스페인어 필수.",
      strategicNoteEn: "Mexico's Silicon Valley. Intel, IBM, Oracle offices. Korean expat/tech worker hub. Strong culture/creative industry. Spanish essential.",
    },
    monterrey: {
      metroPopulation: "530만", koreanPopulation: "1천+", koreanPercent: "0.02%",
      topLanguages: ["스페인어", "영어", "한국어"],
      ethnicComposition: [
        { group: ko ? "메스티소(혼혈)" : "Mestizo", pct: "65%" },
        { group: ko ? "백인(레히오)" : "White (Regio)", pct: "25%" },
        { group: ko ? "원주민" : "Indigenous", pct: "7%" },
        { group: ko ? "기타" : "Other", pct: "3%" },
      ],
      diversityScore: ko ? "산업 특화" : "Industrial-focused",
      strategicNote: "북미 최대 산업도시 중 하나. 현대·기아·POSCO·한국타이어 공장. 주재원 중심 소규모 한인 커뮤니티. 높은 구매력.",
      strategicNoteEn: "One of North America's largest industrial cities. Hyundai, Kia, POSCO, Hankook Tire plants. Small but high-purchasing-power Korean expat community.",
    },
  };

  const generic: CityDemographics = {
    metroPopulation: ko ? "데이터 수집 중" : "Data collecting",
    koreanPopulation: ko ? "수집 중" : "Collecting",
    koreanPercent: "—",
    topLanguages: [ko ? "영어" : "English", ko ? "스페인어" : "Spanish"],
    ethnicComposition: [],
    diversityScore: ko ? "수집 중" : "Collecting",
    strategicNote: "이 도시의 상세 인구통계를 업데이트 중입니다.",
    strategicNoteEn: "Detailed demographic data for this city is being updated.",
  };
  return DATA[slug] || generic;
}

/* ─────────────────────────────────────────
   DALLAS 전용 데이터
───────────────────────────────────────── */
const TOP5_RESTAURANTS_DALLAS: Top5Item[] = [
  { rank: 1, emoji: "🍜", nameKo: "Jang Fried Chicken (장통닭)", nameEn: "Jang Korean Fried Chicken — Carrollton",
    address: "2625 Old Denton Rd Ste 510, Carrollton TX 75007",
    phone: "(972) 245-0088", hours: "월-일 11am-9pm",
    rating: 4.5, ratingCount: "300+",
    why: "캐롤튼 한인타운 중심. H-Mart 인근. 바삭한 양념치킨·간장치킨으로 달라스 한인 1순위",
    tip: "H-Mart 쇼핑 후 함께 방문 추천", website: "yelp.com/biz/jang-fried-chicken-carrollton" },
  { rank: 2, emoji: "🥩", nameKo: "Gen Korean BBQ — 프리스코", nameEn: "Gen Korean BBQ House — Frisco",
    address: "3232 Preston Rd Ste 100, Frisco TX 75034",
    phone: "(469) 252-0900", hours: "일-목 11am-11pm, 금-토 11am-12am",
    rating: 4.2, ratingCount: "1200+",
    why: "달라스 최대 한국식 AYCE BBQ 체인. 무제한 고기+반찬. 한인·현지인 모두 즐기는 인기 스팟",
    tip: "웨이팅 필수. 앱 예약 권장", website: "genkoreanbbq.com" },
  { rank: 3, emoji: "🍱", nameKo: "Tous Les Jours (뚜레쥬르) — 캐롤튼", nameEn: "Tous Les Jours Korean Bakery",
    address: "2625 Old Denton Rd Ste 118, Carrollton TX 75007",
    phone: "(972) 242-8870", hours: "매일 7am-9pm",
    rating: 4.4, ratingCount: "400+",
    why: "H-Mart 단지 내 한국 베이커리. 소금빵·크림치즈 소보로·케이크. 달라스 한인 카페 1순위",
    tip: "아침 일찍 방문 — 인기 빵 빨리 소진됨", website: "tljus.com" },
  { rank: 4, emoji: "🍛", nameKo: "Korea House — 캐롤튼", nameEn: "Korea House — Carrollton",
    address: "2540 Old Denton Rd Ste 104, Carrollton TX 75006",
    phone: "(972) 245-4477", hours: "월-토 11am-9pm, 일 11am-8pm",
    rating: 4.1, ratingCount: "500+",
    why: "30년 달라스 한식 대표 식당. 순두부·갈비탕·된장찌개. 현지 한인들의 '고향 밥집'",
    tip: "점심 특선 가성비 최고 ($12 이하)", website: "yelp.com/biz/korea-house-carrollton" },
  { rank: 5, emoji: "☕", nameKo: "Cafe Bora — 플라노", nameEn: "Cafe Bora — Plano",
    address: "4001 W Park Blvd Ste 200, Plano TX 75093",
    phone: "(972) 517-1111", hours: "월-목 10am-9pm, 금-일 10am-10pm",
    rating: 4.3, ratingCount: "200+",
    why: "달라스 한인 카페 문화. 흑임자 라떼·녹차 케이크·한국식 디저트. 인스타 감성 가득",
    tip: "플라노 한인 주거 밀집 지역 인근", website: "yelp.com/biz/cafe-bora-plano" },
];

const TOP5_SETTLE_DALLAS: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "한인회 (KCS — Korean Community Services)", nameEn: "Korean Community Services of North Texas",
    address: "2625 Old Denton Rd Ste 124, Carrollton TX 75007",
    phone: "(972) 245-6767", hours: "월-금 9am-5pm",
    why: "달라스 최대 한인 커뮤니티 센터. 이민 초기 상담·취업 지원·한국어 서비스. 정착 첫 번째 방문지",
    tip: "방문 전 전화 예약 권장", website: "kcsnorthtexas.org" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart 캐롤튼", nameEn: "H-Mart Carrollton — Korean Town Hub",
    address: "2625 Old Denton Rd, Carrollton TX 75007",
    phone: "(972) 395-8880", hours: "매일 8am-10pm",
    why: "달라스 한인타운 허브. 한국 식품·반찬·전자제품·의류. 한인 커뮤니티 정보 보드 활용",
    tip: "내부 푸드코트 운영. 한국어 안내 가능", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "텍사스 DPS — 운전면허", nameEn: "Texas DPS — Driver License",
    address: "1149 E Belt Line Rd, Carrollton TX 75006",
    phone: "(214) 861-4040", hours: "월-금 8am-5pm (예약 필수)",
    why: "텍사스 이사 후 90일 내 면허 전환 필수. 온라인 예약 강력 권장. 한국 면허 지참 시 도로주행 면제 가능",
    tip: "appointments.dps.texas.gov 예약 필수 — 현장 방문 불가", website: "dps.texas.gov" },
  { rank: 4, emoji: "🏥", nameKo: "ICMS (달라스 한인 의료 서비스)", nameEn: "Korean Medical Services — Carrollton",
    address: "2540 Old Denton Rd, Carrollton TX 75006",
    phone: "(972) 245-7788", hours: "월-금 9am-5pm",
    why: "한국어 진료 가능 가정의학과. 한인 밀집 캐롤튼 지역. 보험 없어도 슬라이딩 스케일 진료 가능",
    tip: "예약 우선. 한국어 간호사 상주", website: "yelp.com/search?find_desc=Korean+doctor+Carrollton+TX" },
  { rank: 5, emoji: "⚖️", nameKo: "North Texas 이민 법률 지원", nameEn: "Refugee & Immigration Services — Dallas",
    address: "5787 S Hampton Rd Ste 360, Dallas TX 75232",
    phone: "(214) 631-4357", hours: "월-금 9am-5pm",
    why: "달라스 저소득 이민자 무료 법률 지원. 영주권·추방방어·망명 전문. 한국어 통역 요청 가능",
    tip: "사전 예약 필수. Texas RioGrande Legal Aid도 활용 가능", website: "catholiccharitiesdallas.org" },
];

const TOP5_EXPLORE_DALLAS: Top5Item[] = [
  { rank: 1, emoji: "🤠", nameKo: "캐롤튼 한인타운 (Korean Belt)", nameEn: "Carrollton Koreatown — Korean Belt",
    address: "Old Denton Rd & Josey Lane, Carrollton TX 75007",
    why: "달라스 최대 한인 밀집 지역. H-Mart·한식당·한국 미용실·PC방·노래방 집결. '달라스의 한인 1번지'",
    tip: "Old Denton Rd 따라 걸으면 한국 느낌 그대로", website: "maps.google.com/?q=Koreatown+Carrollton+TX" },
  { rank: 2, emoji: "🌆", nameKo: "댈러스 다운타운 & Reunion Tower", nameEn: "Dallas Downtown & Reunion Tower",
    address: "300 Reunion Blvd E, Dallas TX 75207",
    why: "달라스 상징 전망대. 높이 171m, 360도 파노라마 뷰. 야경이 특히 아름다움",
    tip: "GeO-Deck 입장 $26. 저녁 예약 추천", website: "reuniontower.com" },
  { rank: 3, emoji: "🏈", nameKo: "AT&T Stadium — 카우보이스 성지", nameEn: "AT&T Stadium — Dallas Cowboys",
    address: "1 AT&T Way, Arlington TX 76011",
    why: "NFL 달라스 카우보이스 홈구장. 세계 최대 경기장 중 하나. 투어·게임 관람 모두 추천",
    tip: "경기 없는 날 스타디움 투어 $25", website: "attstadium.com" },
  { rank: 4, emoji: "🎨", nameKo: "Dallas Museum of Art", nameEn: "Dallas Museum of Art",
    address: "1717 N Harwood St, Dallas TX 75201",
    why: "세계 수준 미술관. 상설 전시 무료 입장. Arts District 내 위치 — 주변 산책도 좋음",
    tip: "상설 컬렉션 무료. 특별전 별도 요금", website: "dma.org" },
  { rank: 5, emoji: "🌿", nameKo: "White Rock Lake Park", nameEn: "White Rock Lake Park",
    address: "8300 E Lawther Dr, Dallas TX 75218",
    why: "달라스 도심 속 자연 공원. 호수 둘레 11km 걷기·자전거. 가족 소풍·한인 커뮤니티 모임 장소",
    tip: "무료 입장. 주말 아침 한인 산책 모임 자주 열림", website: "maps.google.com/?q=White+Rock+Lake+Dallas" },
];

/* ─────────────────────────────────────────
   SF 베이에어리어 전용 데이터
───────────────────────────────────────── */
const TOP5_RESTAURANTS_SF: Top5Item[] = [
  { rank: 1, emoji: "🍲", nameKo: "BCD 순두부 — 산타클라라", nameEn: "BCD Tofu House — Santa Clara",
    address: "3842 El Camino Real, Santa Clara CA 95051",
    phone: "(408) 246-8669", hours: "매일 11am-10pm",
    rating: 4.2, ratingCount: "800+",
    why: "베이에어리어 한인 1순위 순두부집. 24시간 영업. 진한 국물·매운 순두부찌개. LA·뉴욕에도 있는 검증된 체인",
    tip: "해장으로도 최고. 새벽에도 영업", website: "bcdtofu.com" },
  { rank: 2, emoji: "🥩", nameKo: "Jang Soo BBQ — 산타클라라", nameEn: "Jang Soo BBQ — Santa Clara",
    address: "2980 Stevens Creek Blvd, Santa Clara CA 95050",
    phone: "(408) 243-0880", hours: "월-목 11:30am-10pm, 금-일 11:30am-11pm",
    rating: 4.3, ratingCount: "600+",
    why: "산타클라라 한인타운 중심 숯불구이 BBQ. 갈비·삼겹살·냉면. 한인 직장인 점심 1순위",
    tip: "주차 무료. 런치 세트 가성비 최고", website: "yelp.com/biz/jang-soo-bbq-santa-clara" },
  { rank: 3, emoji: "🍜", nameKo: "Minjaelo Korean Food — 서니베일", nameEn: "Minjaelo — Sunnyvale",
    address: "1072 E El Camino Real, Sunnyvale CA 94087",
    phone: "(408) 736-7676", hours: "화-일 11am-9pm (월 휴무)",
    rating: 4.4, ratingCount: "400+",
    why: "서니베일 숨은 명소. 만두·비빔밥·갈비탕. 현지 한인들이 '진짜 한국 맛'이라 극찬",
    tip: "만두와 된장찌개 조합 강추. 웨이팅 있을 수 있음", website: "yelp.com/biz/minjaelo-korean-food-sunnyvale" },
  { rank: 4, emoji: "🫕", nameKo: "Bonjuk — 산타클라라 (한국죽)", nameEn: "Bonjuk Korean Porridge — Santa Clara",
    address: "3174 Stevens Creek Blvd, San Jose CA 95117",
    phone: "(408) 249-5888", hours: "매일 10am-9pm",
    rating: 4.3, ratingCount: "300+",
    why: "죽 전문점. 아플 때·해장·건강식. 전복죽·야채죽·버섯죽. 베이에어리어 한인 가족 추천",
    tip: "포장 가능. 노인·아이도 OK", website: "bonjukusa.com" },
  { rank: 5, emoji: "☕", nameKo: "H-Mart 산타클라라 푸드코트", nameEn: "H-Mart Santa Clara Food Court",
    address: "3935 El Camino Real, Santa Clara CA 95051",
    phone: "(408) 248-8880", hours: "매일 8am-10pm",
    rating: 4.1, ratingCount: "500+",
    why: "베이에어리어 최대 한인 마트 내 푸드코트. 떡볶이·순대·라면·김밥 한자리에. 쇼핑 후 필수 방문",
    tip: "주말에는 매우 혼잡. 평일 오전 방문 추천", website: "hmart.com" },
];

const TOP5_SETTLE_SF: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "한인회 (KACBA — Bay Area)", nameEn: "Korean American Community of the Bay Area",
    address: "2275 El Camino Real Ste 207, Santa Clara CA 95050",
    phone: "(408) 247-7676", hours: "월-금 9am-5pm",
    why: "베이에어리어 한인 커뮤니티 허브. 정착 초기 상담·취업·법률 연결·한국어 서비스",
    tip: "방문 전 전화 예약 권장", website: "kacba.org" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart 산타클라라", nameEn: "H-Mart Santa Clara — Korean Hub",
    address: "3935 El Camino Real, Santa Clara CA 95051",
    phone: "(408) 248-8880", hours: "매일 8am-10pm",
    why: "베이에어리어 최대 한인 마트. 한국 식품·생활용품·한인 커뮤니티 정보 보드. 베이에어리어 한인 집결지",
    tip: "한인 커뮤니티 정보 게시판 활용. 한국어 안내 가능", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "캘리포니아 DMV — 드라이버 라이선스", nameEn: "California DMV — Driver License",
    address: "1515 S 1st St, San Jose CA 95112",
    phone: "(800) 777-0133", hours: "월-금 8am-5pm (예약 필수)",
    why: "CA 이주 후 10일 내 DMV 방문 의무 (연방법). 한국 면허 지참 시 필기 면제 불가 — 필기·실기 모두 응시\n⚠️ CA는 WA와 달리 필기시험 한국어 선택 없음 (영어만)",
    tip: "🔗 appointments.dmv.ca.gov 예약 필수. 현장 방문 시 3-4시간 대기", website: "dmv.ca.gov" },
  { rank: 4, emoji: "🏥", nameKo: "NICOS (이민자 건강 서비스)", nameEn: "NICOS — National Immigrant Health Initiative",
    address: "1 Daniel Burnham Ct Ste 322C, San Francisco CA 94109",
    phone: "(415) 394-0204", hours: "월-금 9am-5pm",
    why: "CA 이민자·무보험자 건강 서비스. 한국어 통역 가능. Covered California 등록 지원",
    tip: "Covered California 등록 무료 지원. 소득 기준 Medi-Cal 가능", website: "nicos-health.org" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주샌프란시스코 총영사관", nameEn: "Korean Consulate General — San Francisco",
    address: "3500 Clay St, San Francisco CA 94118",
    phone: "(415) 921-2251", hours: "월-금 9am-4pm (예약 필수)",
    why: "여권·공증·재외국민 등록·병역 상담. 베이에어리어·태평양 서북부 한인 담당 공관",
    tip: "온라인 예약 필수. 영사 민원: overseas.mofa.go.kr/us-sanfrancisco-ko", website: "overseas.mofa.go.kr/us-sanfrancisco-ko" },
];

const TOP5_EXPLORE_SF: Top5Item[] = [
  { rank: 1, emoji: "🌉", nameKo: "골든게이트 브릿지", nameEn: "Golden Gate Bridge",
    address: "Golden Gate Bridge, San Francisco CA 94129",
    why: "세계 상징 대교. 도보·자전거 횡단 가능. 새벽 안개 속 사진이 압권. 맞은편 Marin Headlands 전망도 추천",
    tip: "자전거 대여: 피셔맨스 워프 인근 ($30-40/day). 주차 혼잡 — Sausalito에서 페리로 접근 추천", website: "goldengate.org" },
  { rank: 2, emoji: "🌁", nameKo: "피셔맨스 워프 & 알카트라즈", nameEn: "Fisherman's Wharf & Alcatraz",
    address: "Pier 39, San Francisco CA 94133",
    why: "SF 대표 명소. 씰(물개) 서식, 해산물 클램차우더, 게 요리. 알카트라즈 투어 ($45) — 한국어 오디오 가이드 제공",
    tip: "알카트라즈 티켓 최소 2주 전 예약: alcatrazcruises.com", website: "pier39.com" },
  { rank: 3, emoji: "💻", nameKo: "실리콘밸리 — Apple·Google 본사", nameEn: "Silicon Valley — Apple & Google HQ",
    address: "Apple Park Visitor Center, One Apple Park Way, Cupertino CA 95014",
    why: "세계 IT 중심지. Apple Park 방문자센터 무료. Google 본사(Googleplex) 외부 투어. 한인 IT 직장인 1000명+ 근무",
    tip: "Apple Store에서 기념품 구매. Google 캠퍼스 자전거 투어($35)", website: "apple.com/retail/appleparkvisitorcenter" },
  { rank: 4, emoji: "🌿", nameKo: "뮤어우즈 레드우드 숲", nameEn: "Muir Woods National Monument",
    address: "1 Muir Woods Rd, Mill Valley CA 94941",
    why: "수백 년 된 레드우드 삼나무 숲. SF에서 30분. 자연 속 트레킹. 한인 가족 주말 나들이 1순위",
    tip: "예약 필수: recreation.gov ($9 주차 예약). 대중교통 가능 (Golden Gate Transit)", website: "nps.gov/muwo" },
  { rank: 5, emoji: "🏘️", nameKo: "산타클라라 한인타운", nameEn: "Santa Clara — Bay Area Koreatown",
    address: "El Camino Real & Lawrence Expy, Santa Clara CA 95050",
    why: "베이에어리어 최대 한인 밀집 지역. H-Mart·한식당·한국 미용실·한국 교회 집결. '실리콘밸리의 한인 1번지'",
    tip: "El Camino Real을 따라 산타클라라~서니베일 구간이 한인 상권 핵심", website: "maps.google.com/?q=Koreatown+Santa+Clara+CA" },
];

/* ─────────────────────────────────────────
   뉴욕 전용 데이터
───────────────────────────────────────── */
const TOP5_RESTAURANTS_NEWYORK: Top5Item[] = [
  { rank: 1, emoji: "🍜", nameKo: "Kunjip Korean Restaurant — K-Town", nameEn: "Kunjip — Manhattan Koreatown",
    address: "9 W 32nd St, New York NY 10001",
    phone: "(212) 216-9487", hours: "24시간 영업",
    rating: 4.1, ratingCount: "2000+",
    why: "🍲 국물·한식\n맨해튼 한인타운 24시간 한식. 갈비탕·순두부·비빔밥. 한국 출장자·유학생 해장국 1순위. 뉴욕 한인타운 중심",
    tip: "24시간 영업 — 야식·해장 모두 OK", website: "yelp.com/biz/kunjip-new-york" },
  { rank: 2, emoji: "🥩", nameKo: "Jongro BBQ — K-Town", nameEn: "Jongro BBQ — Manhattan",
    address: "22 W 32nd St 2nd Fl, New York NY 10001",
    phone: "(212) 473-4700", hours: "매일 11am-1am",
    rating: 4.0, ratingCount: "1800+",
    why: "🥩 BBQ\n맨해튼 한인타운 대표 BBQ. 연기 없는 환기 시스템. 무제한 밑반찬. 뉴욕 직장인 회식 1순위",
    tip: "2층 위치. 웨이팅 앱 등록 권장", website: "jongro-bbq.com" },
  { rank: 3, emoji: "🍗", nameKo: "BonChon Chicken — 플러싱", nameEn: "BonChon Chicken — Flushing",
    address: "40-10 Main St, Flushing NY 11354",
    phone: "(718) 888-9700", hours: "매일 11am-11pm",
    rating: 4.1, ratingCount: "900+",
    why: "🍗 치킨\n한국식 2번 튀김 치킨. 바삭함 유지. 플러싱 한인타운 치맥 명소. 현지 한인 단골 많음",
    tip: "플러싱 H-Mart 쇼핑 후 방문 추천", website: "bonchon.com" },
  { rank: 4, emoji: "🥘", nameKo: "Pyeong Chang Tofu — 플러싱", nameEn: "Pyeong Chang Tofu House — Flushing",
    address: "41-19 Union St, Flushing NY 11355",
    phone: "(718) 539-8686", hours: "매일 10am-10pm",
    rating: 4.3, ratingCount: "500+",
    why: "🍲 국물·찌개\n플러싱 순두부 명가. 진한 육수·부드러운 두부. 해장국으로 최고. 반찬 정갈함",
    tip: "점심 시간 웨이팅 있음. 평일 오전 방문 추천", website: "yelp.com/biz/pyeong-chang-tofu-house-flushing" },
  { rank: 5, emoji: "☕", nameKo: "Paris Baguette — K-Town", nameEn: "Paris Baguette — Manhattan Koreatown",
    address: "45 W 32nd St, New York NY 10001",
    phone: "(212) 967-7900", hours: "매일 7am-10pm",
    rating: 4.0, ratingCount: "400+",
    why: "☕ 카페·베이커리\n한국식 베이커리·카페. 소금빵·크림빵·케이크. 맨해튼 한인타운 미팅 장소로 인기",
    tip: "K-Town 중심부. 미팅·약속 장소로 최적", website: "parisbaguette.com" },
];

const TOP5_SETTLE_NEWYORK: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "뉴욕 한인회 (KANY)", nameEn: "Korean Association of New York",
    address: "149 W 24th St 6th Fl, New York NY 10011",
    phone: "(212) 807-0900", hours: "월-금 9am-5pm",
    why: "뉴욕 최대 한인 커뮤니티 기관. 법률·취업·복지 연결. 한국어 서비스. 뉴욕 정착 첫 번째 방문지",
    tip: "방문 전 전화 예약 권장", website: "kany.org" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart 플러싱", nameEn: "H-Mart — Flushing Koreatown",
    address: "136-20 Roosevelt Ave, Flushing NY 11354",
    phone: "(718) 321-7628", hours: "매일 8am-10pm",
    why: "뉴욕 최대 한인 마트. 플러싱 한인타운 중심. 한국 식품·반찬·생활용품 완비. 한인 커뮤니티 정보 게시판",
    tip: "지하철 7호선 Flushing Main St역 도보 5분", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "뉴욕 DMV — 운전면허", nameEn: "NY DMV — Driver License",
    address: "11 Broadway, New York NY 10004",
    phone: "(212) 645-5550", hours: "월-금 8:30am-4pm (예약 필수)",
    why: "뉴욕은 지하철이 발달해 차 없어도 OK. 단 뉴저지·코네티컷 거주자는 해당 주 DMV 방문\n⚠️ 뉴욕시 내 운전은 주차비($30-80/일)·혼잡세($15) 감안",
    tip: "🔗 dmv.ny.gov 예약 필수. 한국 면허 → 필기 면제 불가 (필기+실기 모두)", website: "dmv.ny.gov" },
  { rank: 4, emoji: "🏥", nameKo: "CAMS (아시안 의료 서비스)", nameEn: "CAMS — Charles B. Wang Community Health Center",
    address: "136-26 37th Ave, Flushing NY 11354",
    phone: "(718) 886-1600", hours: "월-금 8am-5pm",
    why: "플러싱 지역 아시안 커뮤니티 의료 센터. 한국어 통역 가능. 보험 없어도 슬라이딩 스케일 진료",
    tip: "예약 우선. 플러싱 한인타운 인근", website: "cbwchc.org" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주뉴욕 총영사관", nameEn: "Korean Consulate General — New York",
    address: "460 Park Ave, New York NY 10022",
    phone: "(646) 674-6000", hours: "월-금 9am-4pm (예약 필수)",
    why: "여권·공증·재외국민 등록. 뉴욕·뉴저지·코네티컷·펜실베이니아 한인 담당",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/us-newyork-ko", website: "overseas.mofa.go.kr/us-newyork-ko" },
];

const TOP5_EXPLORE_NEWYORK: Top5Item[] = [
  { rank: 1, emoji: "🗽", nameKo: "자유의 여신상 & 엘리스 섬", nameEn: "Statue of Liberty & Ellis Island",
    address: "Liberty Island, New York NY 10004",
    why: "미국 이민의 상징. 한인 이민자에게 특별한 의미. 엘리스 섬 이민 박물관 — 이민 역사 체험. 페리 왕복 $24",
    tip: "statecruises.com 사전 예약 필수. 왕관 투어 최소 6개월 전 예약", website: "nps.gov/stli" },
  { rank: 2, emoji: "🏙️", nameKo: "맨해튼 한인타운 (32nd St)", nameEn: "Manhattan Koreatown — 32nd Street",
    address: "32nd St between Broadway & 5th Ave, New York NY 10001",
    why: "뉴욕 한인 문화의 심장. 24시간 한식당·노래방·한국마트·스파 밀집. 한국 느낌 그대로",
    tip: "지하철 N/Q/R/W 34th St-Herald Square역 도보 2분", website: "maps.google.com/?q=Koreatown+Manhattan+NYC" },
  { rank: 3, emoji: "🌸", nameKo: "플러싱 한인타운 (퀸즈)", nameEn: "Flushing Koreatown — Queens",
    address: "Main St & Roosevelt Ave, Flushing NY 11354",
    why: "뉴욕 최대 한인·중국계 커뮤니티. H-Mart·한식당·한국 마트 밀집. 맨해튼보다 저렴하고 한국 느낌 진함",
    tip: "지하철 7호선 종점 Flushing-Main St역. 주말 방문 추천", website: "maps.google.com/?q=Flushing+Koreatown+Queens" },
  { rank: 4, emoji: "🎭", nameKo: "메트로폴리탄 미술관 (MET)", nameEn: "The Metropolitan Museum of Art",
    address: "1000 5th Ave, New York NY 10028",
    why: "세계 최대 미술관 중 하나. 한국관(Korea Gallery) 별도 운영. 권장 기부금 $30. 뉴욕 필수 코스",
    tip: "뉴욕 거주자는 권장 기부금만 내면 됨 (무료 가능). 한국관 꼭 방문", website: "metmuseum.org" },
  { rank: 5, emoji: "🌳", nameKo: "센트럴 파크", nameEn: "Central Park",
    address: "Central Park, New York NY 10024",
    why: "뉴욕의 허파. 843에이커 도심 공원. 한인 가족 주말 소풍·조깅·피크닉. 무료 입장",
    tip: "주말 오전 한인 가족 모임 자주 열림. 자전거 대여 가능", website: "centralparknyc.org" },
];

/* ─────────────────────────────────────────
   내쉬빌 전용 데이터
───────────────────────────────────────── */
const TOP5_RESTAURANTS_NASHVILLE: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Honey B's Korean BBQ — 내쉬빌", nameEn: "Honey B's Korean BBQ — Nashville",
    address: "2111 Gallatin Pike N, Madison TN 37115",
    phone: "(615) 851-0041", hours: "화-일 11am-9pm (월 휴무)",
    rating: 4.3, ratingCount: "300+",
    why: "🥩 BBQ\n내쉬빌 한인 BBQ 1위. 갈비·삼겹살. 현지 한인 단골 다수. 테네시주 한인 커뮤니티 모임 장소",
    tip: "월요일 휴무. 사전 예약 권장", website: "yelp.com/biz/honey-bs-korean-bbq-madison" },
  { rank: 2, emoji: "🍜", nameKo: "Seoul Garden Korean Restaurant", nameEn: "Seoul Garden — Nashville",
    address: "2155 Gallatin Pike N, Madison TN 37115",
    phone: "(615) 852-1122", hours: "매일 11am-9:30pm",
    rating: 4.1, ratingCount: "200+",
    why: "🍲 국물·한식\n내쉬빌 오래된 한식당. 순두부·갈비탕·비빔밥. 한인 교민들의 '고향 밥집'. 가정식 느낌",
    tip: "점심 세트 가성비 최고. 한국어 주문 가능", website: "yelp.com/biz/seoul-garden-madison" },
  { rank: 3, emoji: "🍗", nameKo: "BonChon — 내쉬빌", nameEn: "BonChon — Nashville",
    address: "2160 Hillsboro Village, Nashville TN 37212",
    phone: "(615) 730-8111", hours: "매일 11am-10pm",
    rating: 4.0, ratingCount: "400+",
    why: "🍗 치킨\n내쉬빌 한국식 치킨 체인. 바삭한 2번 튀김. Hot Chicken의 도시에서 한국 치킨으로 승부",
    tip: "내쉬빌 핫치킨 vs 한국치킨 비교해 보세요", website: "bonchon.com" },
  { rank: 4, emoji: "🍱", nameKo: "조선각 (Josun Gak)", nameEn: "Josun Gak — Nashville",
    address: "2153 Gallatin Pike N, Madison TN 37115",
    phone: "(615) 855-0500", hours: "화-일 11am-9pm",
    rating: 4.2, ratingCount: "150+",
    why: "🍲 국물·한식\n매디슨 한인타운 정통 한식. 솥밥·된장찌개·나물 반찬. 전통 한국 분위기",
    tip: "소규모 식당 — 웨이팅 있을 수 있음", website: "yelp.com/biz/josun-gak-nashville" },
  { rank: 5, emoji: "☕", nameKo: "H-Mart 내쉬빌 푸드코트", nameEn: "H-Mart Nashville Food Court",
    address: "545 Myatt Dr, Madison TN 37115",
    phone: "(615) 800-6080", hours: "매일 9am-9pm",
    rating: 4.0, ratingCount: "200+",
    why: "☕ 카페·분식\n테네시주 최초 H-Mart 내 푸드코트. 떡볶이·순대·한국식 카페. 내쉬빌 한인의 쉼터",
    tip: "H-Mart 쇼핑 후 필수 방문", website: "hmart.com" },
];

const TOP5_SETTLE_NASHVILLE: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "내쉬빌 한인회 (KAAN)", nameEn: "Korean Association of America — Nashville",
    address: "545 Myatt Dr Ste 200, Madison TN 37115",
    phone: "(615) 945-5500", hours: "월-금 9am-5pm",
    why: "내쉬빌 한인 커뮤니티 허브. 정착 상담·법률 연결·한국어 서비스. 테네시주 한인 정착 첫 번째 방문지",
    tip: "방문 전 전화 예약 권장", website: "kaannashville.org" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart 매디슨 (테네시 최초)", nameEn: "H-Mart Madison — Tennessee's First",
    address: "545 Myatt Dr, Madison TN 37115",
    phone: "(615) 800-6080", hours: "매일 9am-9pm",
    why: "테네시주 최초 H-Mart. 내쉬빌 한인 커뮤니티의 구심점. 한국 식품·생활용품 완비. 한인 공동체 네트워크 허브",
    tip: "매디슨 지역 — 내쉬빌 북쪽 15분", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "테네시 DDS — 운전면허", nameEn: "Tennessee DDS — Driver License",
    address: "44 Vantage Way Ste 160, Nashville TN 37228",
    phone: "(615) 251-5166", hours: "월-금 8am-4:30pm",
    why: "테네시 이주 후 30일 내 면허 전환 의무 (다른 주보다 빠름!)\n⚠️ TN은 SSN 없어도 면허 신청 가능 (ITIN으로 가능)",
    tip: "🔗 tn.gov/safety 온라인 예약. 한국 면허 → 필기 면제 가능 여부 확인 필요", website: "tn.gov/safety" },
  { rank: 4, emoji: "🏥", nameKo: "Siloam Health — 이민자 의료", nameEn: "Siloam Health — Immigrant Medical",
    address: "1014 Jefferson St, Nashville TN 37208",
    phone: "(615) 322-0857", hours: "월-금 8am-5pm",
    why: "보험 없는 이민자 전문 의료 기관. 한국어 통역 가능. 슬라이딩 스케일 요금. 내쉬빌 이민자 의료 1순위",
    tip: "사전 예약 필수. 저소득 이민자 무료 진료 가능", website: "siloamhealth.org" },
  { rank: 5, emoji: "⚖️", nameKo: "내쉬빌 이민 법률 서비스", nameEn: "Legal Aid Society — Nashville",
    address: "300 Deaderick St Ste 1800, Nashville TN 37201",
    phone: "(615) 244-6610", hours: "월-금 8am-4:30pm",
    why: "테네시주 무료 법률 지원. 이민·주거·가족법. 한국어 통역 요청 가능. 저소득 이민자 우선",
    tip: "CLEAR 핫라인: 1-800-342-1462 (무료)", website: "las.org" },
];

const TOP5_EXPLORE_NASHVILLE: Top5Item[] = [
  { rank: 1, emoji: "🎵", nameKo: "내쉬빌 브로드웨이 & 뮤직 로우", nameEn: "Nashville Broadway & Music Row",
    address: "Lower Broadway, Nashville TN 37201",
    why: "컨트리 뮤직의 메카. 라이브 음악 바 100곳+. 무료 입장. 뮤직 로우 스튜디오 투어. 한인 가족 저녁 코스",
    tip: "주차: Bridgestone Arena 주차장 ($15-20). 목요일 저녁부터 주말까지 가장 활기참", website: "visitmusiccity.com" },
  { rank: 2, emoji: "🏛️", nameKo: "파르테논 신전 (센테니얼 공원)", nameEn: "Parthenon — Centennial Park",
    address: "2600 West End Ave, Nashville TN 37203",
    why: "그리스 파르테논 신전 실물 복제품. 세계 유일. 무료 공원. 내부 미술관 ($10). 한인 가족 사진 명소",
    tip: "무료 입장 (공원). 내부 박물관 별도 $10. 주차 무료", website: "nashville.gov/parks/parthenon" },
  { rank: 3, emoji: "🌊", nameKo: "허밋지 앤드류 잭슨 홈", nameEn: "The Hermitage — Andrew Jackson Home",
    address: "4580 Rachel's Ln, Nashville TN 37076",
    why: "미국 7대 대통령 앤드류 잭슨의 저택. 남부 역사·문화 체험. 아이들 역사 교육에 좋음",
    tip: "입장료 $25 성인. 오디오 가이드 포함", website: "thehermitage.com" },
  { rank: 4, emoji: "🌿", nameKo: "내쉬빌 한인 커뮤니티 파크", nameEn: "Shelby Bottoms Greenway — Korean Community",
    address: "1900 Davidson St, Nashville TN 37206",
    why: "내쉬빌 한인 가족 주말 모임 명소. 한강 분위기 산책로. 한인 교회 소풍·바비큐 자주 열림. 무료",
    tip: "주말 오전 한인 조깅 모임 자주 있음. 주차 무료", website: "nashville.gov/parks/shelby-bottoms" },
  { rank: 5, emoji: "🎢", nameKo: "오프리랜드 & 그랜드 올 오프리", nameEn: "Opryland & Grand Ole Opry",
    address: "2800 Opryland Dr, Nashville TN 37214",
    why: "내쉬빌 최대 명소. 그랜드 올 오프리 컨트리 뮤직 공연장. 오프리랜드 리조트 내 실내 가든 무료 입장",
    tip: "오프리 공연 티켓 $45-150. 리조트 가든은 무료 관람 가능", website: "opry.com" },
];

/* ─────────────────────────────────────────
   보스턴 전용 데이터
───────────────────────────────────────── */
const TOP5_RESTAURANTS_BOSTON: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Koreana — 보스턴", nameEn: "Koreana Restaurant — Boston",
    address: "154 Prospect St, Cambridge MA 02139",
    phone: "(617) 576-8661", hours: "화-일 5pm-10pm (월 휴무)",
    rating: 4.2, ratingCount: "600+",
    why: "🥩 BBQ\n보스턴·케임브리지 한식 명가. 1993년 오픈. MIT·하버드 인근. 갈비·삼겹살·전골. 보스턴 한인 단골 1순위",
    tip: "하버드 스퀘어 인근. 저녁만 영업. 예약 강력 권장", website: "koreanacambridge.com" },
  { rank: 2, emoji: "🍜", nameKo: "Seoul Food Eatery — 올스턴", nameEn: "Seoul Food Eatery — Allston",
    address: "90 Brighton Ave, Allston MA 02134",
    phone: "(617) 208-4096", hours: "매일 11am-10pm",
    rating: 4.3, ratingCount: "400+",
    why: "🍲 국물·한식\n올스턴 한인타운 대표 식당. 떡볶이·부대찌개·비빔밥. 유학생 예산에 맞는 가성비. BU·하버드 학생 단골",
    tip: "올스턴 한인 밀집 지역 중심. 가성비 최고", website: "yelp.com/biz/seoul-food-eatery-allston" },
  { rank: 3, emoji: "🍗", nameKo: "BonChon — 보스턴", nameEn: "BonChon — Boston",
    address: "25 School St, Boston MA 02108",
    phone: "(617) 778-6268", hours: "매일 11am-10pm",
    rating: 4.0, ratingCount: "700+",
    why: "🍗 치킨\n보스턴 다운타운 한국 치킨. 바삭한 2번 튀김. 한인 유학생·직장인 인기 치맥 장소",
    tip: "다운타운 크로싱 인근. 퇴근 후 치맥으로 최적", website: "bonchon.com" },
  { rank: 4, emoji: "🥘", nameKo: "Buk Kyung — 올스턴", nameEn: "Buk Kyung Korean Restaurant — Allston",
    address: "151 Brighton Ave, Allston MA 02134",
    phone: "(617) 254-3100", hours: "매일 11am-11pm",
    rating: 4.1, ratingCount: "350+",
    why: "🍲 국물·한식\n올스턴 오래된 한식 맛집. 순두부·해장국·정식. 가정식 느낌. 보스턴 한인 유학생의 '엄마 밥 같은 맛'",
    tip: "올스턴 한인 커뮤니티 중심. 점심 특선 추천", website: "yelp.com/biz/buk-kyung-allston" },
  { rank: 5, emoji: "☕", nameKo: "H Mart Cafe — 올스턴", nameEn: "H Mart Food Court — Allston",
    address: "35 Harvard Ave, Allston MA 02134",
    phone: "(617) 254-0200", hours: "매일 8am-9pm",
    rating: 4.0, ratingCount: "300+",
    why: "☕ 카페·분식\nH-Mart 내 한국식 카페·푸드코트. 한국 분식·음료. 올스턴 한인 생활의 중심",
    tip: "H-Mart 쇼핑 후 필수 방문. 주차 건물 내 유료", website: "hmart.com" },
];

const TOP5_SETTLE_BOSTON: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "보스턴 한인회 (KABI)", nameEn: "Korean Association of Boston Inc.",
    address: "44 Harvard Ave, Allston MA 02134",
    phone: "(617) 787-7686", hours: "월-금 9am-5pm",
    why: "보스턴 한인 커뮤니티 허브. 법률·취업·정착 상담. 한국어 서비스. 올스턴·브라이튼 한인타운 중심",
    tip: "방문 전 전화 예약 권장", website: "kabi.us" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart 올스턴", nameEn: "H-Mart — Allston Korean Hub",
    address: "35 Harvard Ave, Allston MA 02134",
    phone: "(617) 254-0200", hours: "매일 8am-9pm",
    why: "보스턴 한인타운 올스턴의 중심. 한국 식품·생활용품 완비. 한인 커뮤니티 정보 게시판. BU·하버드 유학생 1순위",
    tip: "지하철 Green Line B Allston St역 도보 3분", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "매사추세츠 RMV — 운전면허", nameEn: "Massachusetts RMV — Driver License",
    address: "630 Washington St, Boston MA 02111",
    phone: "(857) 368-8000", hours: "월-금 9am-5pm (예약 필수)",
    why: "MA 이주 후 60일 내 면허 전환 의무. 한국 면허 소지자 → 필기 면제 불가 (필기+실기 응시)\n⚠️ MA는 필기 한국어 옵션 없음 (영어만)",
    tip: "🔗 mass.gov/rmv 예약 필수. 매사추세츠는 90일 임시 체류자도 면허 필요", website: "mass.gov/rmv" },
  { rank: 4, emoji: "🏥", nameKo: "MGH 매사추세츠 종합병원", nameEn: "Massachusetts General Hospital — Korean Services",
    address: "55 Fruit St, Boston MA 02114",
    phone: "(617) 726-2000", hours: "24시간 응급",
    why: "보스턴 최고 대학병원. 한국어 통역 서비스 예약 가능. 하버드 의대 부속병원. 유학생·직장인 보험 연계",
    tip: "비응급 예약: 🔗 massgeneral.org. 한국어 통역 사전 요청 필수", website: "massgeneral.org" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주보스턴 총영사관", nameEn: "Korean Consulate General — Boston",
    address: "One Gateway Center Ste 251, Newton MA 02458",
    phone: "(617) 641-2830", hours: "월-금 9am-12pm, 1:30pm-4pm",
    why: "여권·공증·재외국민 등록. 메인·NH·VT·MA·RI·CT 6개 주 담당. 보스턴 인근 한인 전담",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/us-boston-ko", website: "overseas.mofa.go.kr/us-boston-ko" },
];

const TOP5_EXPLORE_BOSTON: Top5Item[] = [
  { rank: 1, emoji: "🎓", nameKo: "하버드·MIT 캠퍼스 투어", nameEn: "Harvard & MIT Campus Tour",
    address: "Massachusetts Ave, Cambridge MA 02139",
    why: "세계 최고 대학 캠퍼스 무료 개방. 한인 유학생 자녀 동기부여 여행. 입학처 투어 무료 신청 가능. MIT 미디어랩 전시",
    tip: "하버드: 무료 가이드 투어 daily. MIT: 자유 입장. 케임브리지 중심 도보 이동 가능", website: "harvard.edu/visit" },
  { rank: 2, emoji: "🦞", nameKo: "퀸시 마켓 & 패뉴일 홀", nameEn: "Quincy Market & Faneuil Hall",
    address: "4 S Market St, Boston MA 02109",
    why: "보스턴 최대 관광 명소. 랍스터 롤·클램차우더·해산물 명소. 퍼포머·야외 쇼핑. 미국 독립 역사 현장",
    tip: "랍스터 롤 $25-35. 평일 오전 덜 붐빔. 무료 입장", website: "faneuilhallmarketplace.com" },
  { rank: 3, emoji: "🌊", nameKo: "리비어 비치 (미국 최초 공공 해변)", nameEn: "Revere Beach — America's First Public Beach",
    address: "Revere Beach Blvd, Revere MA 02151",
    why: "미국 최초 공공 해변 (1896). 보스턴 지하철 직결. 여름 모래성 대회 유명. 한인 가족 여름 나들이",
    tip: "지하철 Blue Line Revere Beach역 하차. 주차 무료. 여름 성수기 혼잡", website: "mass.gov/revere-beach" },
  { rank: 4, emoji: "🏛️", nameKo: "보스턴 미술관 (MFA)", nameEn: "Museum of Fine Arts — Boston",
    address: "465 Huntington Ave, Boston MA 02115",
    why: "미국 4대 미술관. 아시아 컬렉션 최고 수준 — 한국·일본·중국 미술품 다수. 매주 수요일 오후 4시 이후 입장료 자유",
    tip: "성인 $27. 수요일 오후 4시 이후 '자유 기부'. 연간회원권 $100 추천", website: "mfa.org" },
  { rank: 5, emoji: "🏘️", nameKo: "올스턴·브라이튼 한인타운", nameEn: "Allston-Brighton — Boston Koreatown",
    address: "Harvard Ave & Brighton Ave, Allston MA 02134",
    why: "보스턴 한인 생활의 중심. H-Mart·한식당·한인 교회·노래방·PC방 밀집. 부동산 대비 한인 밀도 미 동부 최고",
    tip: "지하철 Green Line B Warren St역. 하버드·BU·MIT 유학생 주거 1순위", website: "maps.google.com/?q=Koreatown+Allston+Boston" },
];

/* ─────────────────────────────────────────
   LA 전용 데이터 — 미국 최대 한인 커뮤니티 50만+
───────────────────────────────────────── */
const TOP5_RESTAURANTS_LA: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Park's BBQ — 코리아타운", nameEn: "Park's BBQ — Koreatown LA",
    address: "955 S Vermont Ave, Los Angeles CA 90006",
    phone: "(213) 380-1717", hours: "매일 11:30am-10pm",
    rating: 4.4, ratingCount: "5000+",
    why: "🥩 BBQ\n미국 최고 한인 BBQ 중 하나. NY Times·Bon Appétit 극찬. 숯불 갈비. LA 방문 시 반드시 가야 할 곳",
    tip: "웨이팅 필수. 오픈 30분 전 도착 권장", website: "parksbbqla.com" },
  { rank: 2, emoji: "🍲", nameKo: "Sun Nong Dan — 갈비탕 명가", nameEn: "Sun Nong Dan — Koreatown",
    address: "3470 W 6th St #8, Los Angeles CA 90020",
    phone: "(213) 365-0303", hours: "매일 11am-2am",
    rating: 4.5, ratingCount: "3000+",
    why: "🍲 국물·한식\n24시간 갈비탕 명가. LA 타임스 선정 LA 최고 식당. 한인 해장 1순위",
    tip: "새벽 영업. 줄 서서 먹는 가치 있음", website: "sunnongdan.com" },
  { rank: 3, emoji: "🥘", nameKo: "BCD 순두부 — 24시간", nameEn: "BCD Tofu House — 24h Koreatown",
    address: "3575 Wilshire Blvd, Los Angeles CA 90010",
    phone: "(213) 382-6677", hours: "24시간 영업",
    rating: 4.1, ratingCount: "2000+",
    why: "🍲 국물·찌개\n24시간 순두부찌개. 코리아타운 한복판. 해장·야식·혼밥 모두 OK",
    tip: "24시간 영업. 혼밥도 편함", website: "bcdtofu.com" },
  { rank: 4, emoji: "🍖", nameKo: "Soowon Galbi — 수원식 왕갈비", nameEn: "Soowon Galbi — Koreatown",
    address: "856 S Vermont Ave, Los Angeles CA 90005",
    phone: "(213) 365-9292", hours: "매일 11am-12am",
    rating: 4.2, ratingCount: "1500+",
    why: "🥩 BBQ·갈비\n수원식 왕갈비 전문. 진한 양념. LA 한인 2세도 즐겨 찾는 클래식",
    tip: "웨이팅 있지만 회전 빠름", website: "yelp.com/biz/soowon-galbi-los-angeles" },
  { rank: 5, emoji: "☕", nameKo: "Café Bora — 코리아타운 카페", nameEn: "Café Bora — Koreatown LA",
    address: "3580 Wilshire Blvd #115, Los Angeles CA 90010",
    phone: "(213) 387-2672", hours: "매일 9am-10pm",
    rating: 4.5, ratingCount: "1000+",
    why: "☕ 카페·디저트\n흑임자 라떼·말차 크림 케이크. 인스타 감성 최고. LA 한인 카페 1순위",
    tip: "주말 웨이팅. 평일 오전 방문 권장", website: "cafebora.com" },
];

const TOP5_SETTLE_LA: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "한인 연합회 (KAFLA)", nameEn: "Korean American Federation of LA",
    address: "981 S Western Ave Ste 201, Los Angeles CA 90006",
    phone: "(213) 380-1840", hours: "월-금 9am-5pm",
    why: "LA 최대 한인 커뮤니티 기관. 법률·취업·이민·복지 연결. 코리아타운 중심. LA 한인 정착 첫 번째 방문지",
    tip: "방문 전 전화 예약 권장", website: "kafla.org" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart 코리아타운", nameEn: "H-Mart — Koreatown LA",
    address: "3255 W Olympic Blvd, Los Angeles CA 90006",
    phone: "(323) 732-3000", hours: "매일 8am-10pm",
    why: "LA 코리아타운 한인 마트. 한국 식품·반찬·생활용품 완비. 내부 푸드코트 운영. LA 한인 생활 중심",
    tip: "주차 무료. 주말 매우 혼잡 — 평일 방문 권장", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "캘리포니아 DMV — 코리아타운", nameEn: "California DMV — Koreatown Area",
    address: "3100 W 6th St, Los Angeles CA 90020",
    phone: "(800) 777-0133", hours: "월-금 8am-5pm (예약 필수)",
    why: "코리아타운 인근 DMV. CA 이주 10일 내 방문 의무.\n⚠️ 필기시험 영어만. 한국 면허 소지자도 필기+실기 모두 응시 필요",
    tip: "🔗 appointments.dmv.ca.gov 예약 필수", website: "dmv.ca.gov" },
  { rank: 4, emoji: "🏥", nameKo: "KYCC (한인 청소년 커뮤니티 센터)", nameEn: "Korean Youth & Community Center",
    address: "1000 S Westmoreland Ave, Los Angeles CA 90006",
    phone: "(213) 365-7400", hours: "월-금 9am-6pm",
    why: "한인 이민 가정 종합 서비스. 의료·정신건강·청소년·취업. 한국어 완전 지원. 무료 서비스 다수",
    tip: "소득 기준 의료 지원 가능", website: "kyccla.org" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주로스앤젤레스 총영사관", nameEn: "Korean Consulate General — LA",
    address: "3435 Wilshire Blvd Ste 500, Los Angeles CA 90010",
    phone: "(213) 385-9300", hours: "월-금 9am-4pm (예약 필수)",
    why: "여권·공증·재외국민 등록·병역 상담. CA·NV·AZ·HI 4개 주 담당. 코리아타운 도보 이동 가능",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/us-losangeles-ko", website: "overseas.mofa.go.kr/us-losangeles-ko" },
];

const TOP5_EXPLORE_LA: Top5Item[] = [
  { rank: 1, emoji: "🏘️", nameKo: "코리아타운 — 미주 한인 환대의 중심", nameEn: "Koreatown LA — Heart of Korean American Hospitality",
    address: "Wilshire Blvd & Western Ave, Los Angeles CA 90005",
    why: "미주 한인 디아스포라가 다민족과 함께 살아가는 곳. 한식당·노래방·마트·교회 도보 거리. 24시간 활기. 한국 음식·문화 관심 있는 모두를 환영",
    tip: "메트로 Purple Line Wilshire/Western역. 야간에도 활발", website: "maps.google.com/?q=Koreatown+Los+Angeles" },
  { rank: 2, emoji: "🌟", nameKo: "할리우드 & 명예의 거리", nameEn: "Hollywood & Walk of Fame",
    address: "Hollywood Blvd, Hollywood CA 90028",
    why: "세계 엔터테인먼트 수도. BTS·블랙핑크 K-pop 스타 발자국도 있음. TCL Chinese Theatre·유니버설 스튜디오 인근",
    tip: "Walk of Fame 무료. 유니버설 스튜디오 $110+", website: "walkoffame.com" },
  { rank: 3, emoji: "🏖️", nameKo: "산타모니카·베니스 비치", nameEn: "Santa Monica & Venice Beach",
    address: "Ocean Ave & Colorado Ave, Santa Monica CA 90401",
    why: "LA 대표 해변. 산타모니카 부두·야자수·자전거. 베니스 비치 스트리트 퍼포머. 한인 가족 주말 나들이 1순위",
    tip: "메트로 E Line Santa Monica역. 자전거 대여 가능", website: "santamonica.com" },
  { rank: 4, emoji: "🌌", nameKo: "그리피스 천문대", nameEn: "Griffith Observatory",
    address: "2800 E Observatory Rd, Los Angeles CA 90027",
    why: "LA 최고 전망 명소. 코리아타운·다운타운·헐리우드 사인 한눈에. 무료 입장. 영화 '라라랜드' 촬영지",
    tip: "무료 입장. 주차 혼잡 → 셔틀 이용 권장. 일몰 1시간 전 도착", website: "griffithobservatory.org" },
  { rank: 5, emoji: "🎨", nameKo: "게티 센터 (무료 미술관)", nameEn: "Getty Center — Free World-Class Museum",
    address: "1200 Getty Center Dr, Los Angeles CA 90049",
    why: "세계 수준 미술관 무료 입장. LA 전망 최고. 정원·건축 자체가 예술. 한인 가족 문화 나들이",
    tip: "무료 입장 (주차만 $20). 주말 사전 예약 권장", website: "getty.edu" },
];

/* ─────────────────────────────────────────
   토론토 전용 데이터 — 캐나다 최대 한인 커뮤니티
───────────────────────────────────────── */
const TOP5_RESTAURANTS_TORONTO: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Owl of Minerva — 블루어 코리아타운", nameEn: "Owl of Minerva — Bloor Koreatown",
    address: "596 Bloor St W, Toronto ON M6G 1K4",
    phone: "(416) 534-4158", hours: "매일 11:30am-10pm",
    rating: 4.2, ratingCount: "800+",
    why: "🥩 BBQ·한식\n토론토 다운타운 한인타운 대표 식당. 1983년 창업. 갈비·불고기·순두부. 토론토 한인 교민의 '고향 맛집'",
    tip: "블루어 코리아타운 중심. 지하철 Bathurst역 도보 5분", website: "yelp.com/biz/owl-of-minerva-toronto" },
  { rank: 2, emoji: "🍲", nameKo: "New Seoul Restaurant — 노스욕", nameEn: "New Seoul Restaurant — North York",
    address: "5324 Yonge St, North York ON M2N 5P9",
    phone: "(416) 222-7090", hours: "화-일 11am-10pm (월 휴무)",
    rating: 4.3, ratingCount: "400+",
    why: "🍲 국물·한식\n노스욕 한인타운(핀치/욘지) 오래된 한식당. 갈비탕·설렁탕·비빔밥. 현지 교민들의 단골집",
    tip: "지하철 North York Centre역 인근. 점심 세트 추천", website: "yelp.com/biz/new-seoul-restaurant-toronto" },
  { rank: 3, emoji: "🍗", nameKo: "BonChon — 토론토", nameEn: "BonChon — Toronto",
    address: "1033 Bay St, Toronto ON M5S 0A2",
    phone: "(416) 921-3811", hours: "매일 11am-10pm",
    rating: 4.0, ratingCount: "500+",
    why: "🍗 치킨\n한국식 2번 튀김 치킨. 토론토 한인 유학생 인기. 다운타운 UofT 인근. 치맥 가능",
    tip: "UofT·라이어슨 학생 단골. 저녁 웨이팅 있음", website: "bonchon.com" },
  { rank: 4, emoji: "🥘", nameKo: "Korean Village Restaurant", nameEn: "Korean Village — Bloor Koreatown",
    address: "628 Bloor St W, Toronto ON M6G 1K3",
    phone: "(416) 536-0290", hours: "매일 12pm-10pm",
    rating: 4.1, ratingCount: "600+",
    why: "🍲 국물·한식\n블루어 코리아타운 한식·BBQ. 한인 커뮤니티 가족 외식 장소. 캐나다 토종 한식당 분위기",
    tip: "BBQ+국물 둘 다 OK. 가족 식사 추천", website: "yelp.com/biz/korean-village-restaurant-toronto" },
  { rank: 5, emoji: "☕", nameKo: "H-Mart 토론토 푸드코트", nameEn: "H-Mart Toronto Food Court",
    address: "656 Bloor St W, Toronto ON M6G 1L2",
    phone: "(416) 539-8686", hours: "매일 9am-9pm",
    rating: 4.0, ratingCount: "300+",
    why: "☕ 카페·분식\nH-Mart 내 한국식 카페·분식. 떡볶이·순대·한국 음료. 블루어 코리아타운 중심",
    tip: "H-Mart 쇼핑 후 필수. 주차 건물 인근", website: "hmart.com" },
];

const TOP5_SETTLE_TORONTO: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "토론토 한인회 (KCAT)", nameEn: "Korean-Canadian Association of Toronto",
    address: "656 Bloor St W, Toronto ON M6G 1K9",
    phone: "(416) 762-8744", hours: "월-금 9am-5pm",
    why: "토론토 한인 커뮤니티 허브. 이민·정착·법률·취업 상담. 한국어 서비스. 토론토 정착 첫 번째 방문지",
    tip: "블루어 코리아타운 내 위치. 방문 전 전화 예약", website: "kcat.ca" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart 블루어 (토론토 한인타운)", nameEn: "H-Mart — Bloor Koreatown Toronto",
    address: "656 Bloor St W, Toronto ON M6G 1L2",
    phone: "(416) 539-8686", hours: "매일 9am-9pm",
    why: "토론토 코리아타운 중심 한인 마트. 한국 식품·생활용품 완비. 한인 커뮤니티 정보 게시판 활용",
    tip: "지하철 Bathurst역 도보 5분. 주차 건물 인근", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "온타리오 MTO — G 드라이버 라이선스", nameEn: "Ontario MTO — Driver's Licence (G)",
    address: "온라인 예약 후 가까운 DriveTest 센터 방문",
    phone: "(647) 776-0331",
    why: "캐나다 온타리오 운전면허. G1(필기) → G2(도로) → G(완전) 3단계 시스템.\n⚠️ 한국 면허 소지자: G1 면제 가능 → G2 도로시험만 응시\n처음 1년: G1 제한 (고속도로 금지·동승자 필요)",
    tip: "🔗 drivetest.ca 예약 필수. 한국 면허 지참 시 G1 면제 확인", website: "ontario.ca/driving" },
  { rank: 4, emoji: "🏥", nameKo: "OHIP — 온타리오 무료 의료보험", nameEn: "OHIP — Ontario Health Insurance Plan",
    address: "ServiceOntario 오피스 (가까운 지점 방문)",
    phone: "(800) 268-6478",
    why: "⭐ 캐나다 최대 혜택 — 온타리오 이주 3개월 후 모든 의료 무료!\n영주권자·시민권자 대상. 병원·응급실·가정의(Family Doctor) 무료\n⚠️ 처음 3개월 대기 기간 → 민간 의료보험 임시 가입 권장",
    tip: "신청: ServiceOntario 방문 | 🔗 ontario.ca/ohip", website: "ontario.ca/ohip" },
  { rank: 5, emoji: "🇨🇦", nameKo: "주토론토 총영사관", nameEn: "Korean Consulate General — Toronto",
    address: "555 Avenue Rd, Toronto ON M4V 2J4",
    phone: "(416) 920-3809", hours: "월-금 9am-12pm, 1:30pm-4pm",
    why: "여권·공증·재외국민 등록. 온타리오·매니토바·사스캐처원 담당. 캐나다 영주권·시민권 후에도 방문 필요",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/ca-toronto-ko", website: "overseas.mofa.go.kr/ca-toronto-ko" },
];

const TOP5_EXPLORE_TORONTO: Top5Item[] = [
  { rank: 1, emoji: "🏙️", nameKo: "블루어 코리아타운 (Bloor Koreatown)", nameEn: "Bloor Koreatown — Toronto's Korean Heart",
    address: "Bloor St W & Christie St, Toronto ON M6G",
    why: "토론토 다운타운 한인타운. 한식당·노래방·한국 마트·교회 밀집. 다운타운 접근성 최고. 한국 느낌 물씬",
    tip: "지하철 Bathurst 또는 Christie역. 주말 활기참", website: "maps.google.com/?q=Koreatown+Toronto" },
  { rank: 2, emoji: "🗼", nameKo: "CN 타워 & 온타리오 호수", nameEn: "CN Tower & Lake Ontario",
    address: "290 Bremner Blvd, Toronto ON M5V 3L9",
    why: "토론토 상징. CN 타워 높이 553m. 유리 바닥 전망대. 온타리오 호수 파노라마. 한인 가족 필수 코스",
    tip: "입장료 CA$45. 저녁 야경 추천. Ripley's Aquarium 인근 함께", website: "cntower.ca" },
  { rank: 3, emoji: "🏛️", nameKo: "로열 온타리오 뮤지엄 (ROM)", nameEn: "Royal Ontario Museum",
    address: "100 Queens Park, Toronto ON M5S 2C6",
    why: "캐나다 최대 박물관. 한국관(Korea Gallery) 상설 운영. 공룡·이집트·세계 문화재. 한인 가족 주말 코스",
    tip: "성인 CA$28. 매주 수요일 오후 할인. 지하철 Museum역 직결", website: "rom.on.ca" },
  { rank: 4, emoji: "🌊", nameKo: "나이아가라 폭포 (당일치기)", nameEn: "Niagara Falls — Day Trip",
    address: "Niagara Falls, ON L2E",
    why: "토론토에서 1.5시간. 세계 3대 폭포. 캐나다 쪽 전망이 더 아름다움. 한인 버스 투어 다수 운영",
    tip: "GO Train 또는 한인 투어버스 이용. 무료 폭포 전망 + 유료 보트 투어(CA$30)", website: "niagarafallstourism.com" },
  { rank: 5, emoji: "🍁", nameKo: "노스욕 핀치 한인타운", nameEn: "North York Finch — Korean Community Hub",
    address: "Finch Ave W & Yonge St, North York ON M2N",
    why: "토론토 최대 한인 밀집 지역. 핀치/욘지 한인 상권. 한식당·한국 마트·한인 교회·노래방·PC방 대규모 집결",
    tip: "지하철 North York Centre역. 주말 방문 추천. 주차 무료 공간 많음", website: "maps.google.com/?q=Korean+Town+North+York+Toronto" },
];

/* ─────────────────────────────────────────
   밴쿠버 전용 데이터 — 캐나다 서부 한인 허브
───────────────────────────────────────── */
const TOP5_RESTAURANTS_VANCOUVER: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Jang Mo Jib — 코퀴틀람", nameEn: "Jang Mo Jib Korean Restaurant — Coquitlam",
    address: "1163 Pinetree Way #130, Coquitlam BC V3B 8A9",
    phone: "(604) 945-5323", hours: "매일 11:30am-10pm",
    rating: 4.3, ratingCount: "500+",
    why: "🥩 BBQ·한식\n코퀴틀람 한인타운 대표 한식당. 갈비·불고기·보쌈. 밴쿠버 한인 가족 단골. 정갈한 반찬",
    tip: "코퀴틀람 한인타운 중심. 주말 예약 권장", website: "yelp.com/biz/jang-mo-jib-coquitlam" },
  { rank: 2, emoji: "🍲", nameKo: "Sura Korean Cuisine — 밴쿠버 다운타운", nameEn: "Sura Korean Cuisine — Vancouver",
    address: "4151 Hazelbridge Way #1880, Richmond BC V6X 4J7",
    phone: "(604) 273-7872", hours: "매일 11am-10pm",
    rating: 4.4, ratingCount: "600+",
    why: "🍲 국물·한식\n리치몬드 한인 명가. 순두부·갈비탕·비빔밥. 한인 가족 외식 1순위. 신선한 재료와 정성스러운 반찬",
    tip: "리치몬드 한인 쇼핑몰 내 위치. 주차 무료", website: "yelp.com/biz/sura-korean-cuisine-richmond" },
  { rank: 3, emoji: "🍗", nameKo: "Chicken Together — 코퀴틀람", nameEn: "Chicken Together Korean Fried Chicken",
    address: "1163 Pinetree Way #110, Coquitlam BC V3B 8A9",
    phone: "(604) 945-7070", hours: "화-일 11:30am-9pm (월 휴무)",
    rating: 4.2, ratingCount: "300+",
    why: "🍗 치킨\n밴쿠버 한국식 치킨 명소. 바삭한 양념·간장 치킨. 코퀴틀람 한인타운 치맥 장소",
    tip: "월요일 휴무. 배달도 가능", website: "yelp.com/biz/chicken-together-coquitlam" },
  { rank: 4, emoji: "🥘", nameKo: "Damso Modern Korean — 다운타운", nameEn: "Damso Modern Korean — Downtown Vancouver",
    address: "1180 Robson St, Vancouver BC V6E 1B2",
    phone: "(604) 558-0858", hours: "매일 11:30am-10pm",
    rating: 4.3, ratingCount: "800+",
    why: "🍲 국물·한식\n밴쿠버 다운타운 현대식 한식. 순두부·비빔밥·갈비. 관광객·한인 모두 인기. 로브슨 쇼핑가 인근",
    tip: "다운타운 쇼핑 후 방문 추천. 영어 메뉴 있음", website: "yelp.com/biz/damso-modern-korean-cuisine-vancouver" },
  { rank: 5, emoji: "☕", nameKo: "H-Mart 코퀴틀람 푸드코트", nameEn: "H-Mart Coquitlam Food Court",
    address: "1163 Pinetree Way, Coquitlam BC V3B 8A9",
    phone: "(604) 945-2288", hours: "매일 9am-9pm",
    rating: 4.1, ratingCount: "200+",
    why: "☕ 카페·분식\n밴쿠버 최대 한인 마트 내 푸드코트. 한국 분식·카페. 코퀴틀람 한인 생활 중심",
    tip: "H-Mart 쇼핑 후 필수 방문. 주차 무료", website: "hmart.com" },
];

const TOP5_SETTLE_VANCOUVER: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "밴쿠버 한인회 (KCAVA)", nameEn: "Korean Canadian Association of Vancouver Area",
    address: "1163 Pinetree Way #200, Coquitlam BC V3B 8A9",
    phone: "(604) 944-7803", hours: "월-금 9am-5pm",
    why: "밴쿠버 한인 커뮤니티 허브. 이민·정착·법률·취업 상담. 한국어 서비스 완전 지원. 밴쿠버 정착 첫 번째 방문지",
    tip: "코퀴틀람 한인타운 내 위치. 방문 전 전화 예약", website: "kcava.ca" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart 코퀴틀람 (밴쿠버 한인 허브)", nameEn: "H-Mart — Coquitlam Korean Hub",
    address: "1163 Pinetree Way, Coquitlam BC V3B 8A9",
    phone: "(604) 945-2288", hours: "매일 9am-9pm",
    why: "밴쿠버 최대 한인 마트. 코퀴틀람 한인타운 중심. 한국 식품·생활용품 완비. 한인 커뮤니티 정보 게시판",
    tip: "주차 무료. Pinetree Way 한인 상권 함께 탐방", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "ICBC — BC 드라이버 라이선스", nameEn: "ICBC — BC Driver's Licence",
    address: "가까운 ICBC Driver Licensing Office",
    phone: "(800) 950-1498",
    why: "BC주 운전면허. 한국 면허 소지자 → 지식 시험(Knowledge Test) 면제!\n✅ BC는 한국과 교환 협정 → 도로주행시험만 응시\n⚠️ 90일 내 BC 면허로 전환 의무",
    tip: "🔗 icbc.com 온라인 예약. 한국 면허 지참 시 지식시험 면제 확인 요청", website: "icbc.com" },
  { rank: 4, emoji: "🏥", nameKo: "MSP — BC 무료 의료보험", nameEn: "MSP — BC Medical Services Plan",
    address: "Health Insurance BC (온라인 신청 가능)",
    phone: "(800) 663-7100",
    why: "⭐ 캐나다 최대 혜택 — BC 이주 3개월 후 모든 의료 무료!\n영주권자·시민권자 대상. 가정의·응급실·수술 무료.\n⚠️ 처음 3개월 대기 → 임시 민간 의료보험 가입 권장",
    tip: "온라인 신청: hibc.gov.bc.ca | 🔗 gov.bc.ca/msp", website: "gov.bc.ca/msp" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주밴쿠버 총영사관", nameEn: "Korean Consulate General — Vancouver",
    address: "1600-1090 W Georgia St, Vancouver BC V6E 3V7",
    phone: "(604) 681-9581", hours: "월-금 9am-12pm, 1:30pm-4pm",
    why: "여권·공증·재외국민 등록. BC·앨버타·사스캐처원·유콘·NWT 담당. 밴쿠버 다운타운 위치",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/ca-vancouver-ko", website: "overseas.mofa.go.kr/ca-vancouver-ko" },
];

const TOP5_EXPLORE_VANCOUVER: Top5Item[] = [
  { rank: 1, emoji: "🏘️", nameKo: "코퀴틀람 한인타운 (Pinetree Way)", nameEn: "Coquitlam Koreatown — Pinetree Way",
    address: "Pinetree Way & Lougheed Hwy, Coquitlam BC V3B",
    why: "밴쿠버 최대 한인 밀집 지역. H-Mart·한식당·노래방·한인 교회·한국 마트 집결. 서울 느낌 그대로",
    tip: "SkyTrain Coquitlam Central역 인근. 주차 무료 많음", website: "maps.google.com/?q=Koreatown+Coquitlam+BC" },
  { rank: 2, emoji: "🏔️", nameKo: "스탠리 파크 (Stanley Park)", nameEn: "Stanley Park — Vancouver's Natural Gem",
    address: "Stanley Park Dr, Vancouver BC V6G 1Z4",
    why: "북미 최대 도심 공원. 총 길이 10km 시월 트레일. 바다·산·삼림 한눈에. 자전거 대여 가능. 한인 가족 주말 나들이 1순위",
    tip: "무료 입장. 자전거 대여 CA$15/시간. 주차 CA$5/시간", website: "vancouver.ca/parks-recreation-culture/stanley-park" },
  { rank: 3, emoji: "🌉", nameKo: "카필라노 서스펜션 브리지", nameEn: "Capilano Suspension Bridge",
    address: "3735 Capilano Rd, North Vancouver BC V7R 4J1",
    why: "높이 70m 출렁다리. 레인포레스트 트레킹. 밴쿠버 최고 액티비티. 사진 명소. 한인 가족 액티비티 1순위",
    tip: "입장료 CA$65 성인. 밴쿠버 다운타운에서 셔틀버스 무료 운행", website: "capbridge.com" },
  { rank: 4, emoji: "🌊", nameKo: "그랜빌 아일랜드 & 퍼블릭 마켓", nameEn: "Granville Island & Public Market",
    address: "1661 Duranleau St, Vancouver BC V6H 3S3",
    why: "밴쿠버 대표 관광지. 해산물·빵·치즈 등 로컬 마켓. 연갈매기 빵빵. 야외 공연. 무료 입장",
    tip: "무료 입장. 주차 CA$5/시간 (버스 추천). 아쿠아버스로 바다 건너 접근 가능", website: "granvilleisland.com" },
  { rank: 5, emoji: "⛷️", nameKo: "휘슬러 (Whistler) — 스키·여름 액티비티", nameEn: "Whistler — Skiing & Summer Activities",
    address: "Whistler, BC V8E 0Z1 (밴쿠버에서 2시간)",
    why: "북미 최대 스키 리조트. 겨울 스키·여름 하이킹·마운틴바이크. 밴쿠버 한인 가족 시즌 여행 1순위",
    tip: "밴쿠버에서 Sea-to-Sky Hwy 2시간. 한인 투어버스 다수 운영. 숙박 사전 예약 필수", website: "whistler.com" },
];

/* ─────────────────────────────────────────
   HOUSTON 전용 데이터 (월드컵 2026 — IHM 본부)
───────────────────────────────────────── */
const TOP5_RESTAURANTS_HOUSTON: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Korea Garden — Spring Branch", nameEn: "Korea Garden — Spring Branch",
    address: "9501 Long Point Rd, Houston TX 77055",
    phone: "(713) 467-0555", hours: "매일 11am-10pm",
    rating: 4.2, ratingCount: "500+",
    why: "🥩 BBQ\n휴스턴 한인타운(Spring Branch) 대표 BBQ. 갈비·불고기·반찬 풍성. 텍사스 한인 가족 모임 1순위",
    tip: "Long Point Rd 한인 상권 중심. 주차 무료", website: "yelp.com/biz/korea-garden-houston" },
  { rank: 2, emoji: "🍲", nameKo: "Hankook Garden — 한식 명가", nameEn: "Hankook Garden — Houston",
    address: "1810 Blalock Rd, Houston TX 77080",
    phone: "(713) 461-7787", hours: "매일 11am-10pm",
    rating: 4.3, ratingCount: "400+",
    why: "🍲 국물·한식\n순두부·갈비탕·해물파전. 휴스턴 한인 교민의 '고향 밥집'. 30년 전통",
    tip: "H-Mart 인근. 점심 특선 가성비 최고", website: "yelp.com/biz/hankook-garden-houston" },
  { rank: 3, emoji: "🍗", nameKo: "BonChon — 휴스턴", nameEn: "BonChon — Houston",
    address: "9889 Bellaire Blvd #320, Houston TX 77036",
    phone: "(713) 270-7177", hours: "매일 11am-10pm",
    rating: 4.0, ratingCount: "300+",
    why: "🍗 치킨\n한국식 2번 튀김 치킨. Bellaire 차이나타운 인근. 치맥 가능",
    tip: "Bellaire 아시안 상권 중심", website: "bonchon.com" },
  { rank: 4, emoji: "🥘", nameKo: "Tofu Village", nameEn: "Tofu Village — Spring Branch",
    address: "9888 Bellaire Blvd #146, Houston TX 77036",
    phone: "(713) 270-9988", hours: "매일 11am-10pm",
    rating: 4.2, ratingCount: "350+",
    why: "🍲 국물·찌개\n순두부 전문. 진한 국물·반찬 정갈. 한인 교민 단골",
    tip: "점심 시간 웨이팅 있음", website: "yelp.com/biz/tofu-village-houston" },
  { rank: 5, emoji: "☕", nameKo: "H-Mart 휴스턴 푸드코트", nameEn: "H-Mart Houston Food Court",
    address: "1302 Blalock Rd, Houston TX 77055",
    phone: "(713) 932-1110", hours: "매일 8am-10pm",
    rating: 4.1, ratingCount: "400+",
    why: "☕ 카페·분식\nH-Mart 내 한국식 푸드코트. 떡볶이·김밥·분식. 휴스턴 한인 모임 장소",
    tip: "쇼핑 후 필수. 주차 무료", website: "hmart.com" },
];

const TOP5_SETTLE_HOUSTON: Top5Item[] = [
  { rank: 1, emoji: "⭐", nameKo: "서울침례교회 (IHM 본부)", nameEn: "Seoul Baptist Church of Houston — IHM HQ",
    address: "10100 Pearl Ridge Way, Houston TX 77043",
    phone: "(713) 461-0700", hours: "주일예배·평일 사역",
    why: "⭐ 국제가정교회사역원(IHM) 본부. 최영기 목사 설립. 가정교회 운동 글로벌 거점. 휴스턴 한인 정착 영적 중심",
    tip: "주일 예배 + 가정교회 모임 참여 가능", website: "seoulchurch.com" },
  { rank: 2, emoji: "🏛️", nameKo: "한인회 (Korean American Association)", nameEn: "Korean American Association of Greater Houston",
    address: "1815 Augusta Dr Ste 304, Houston TX 77057",
    phone: "(713) 789-1500", hours: "월-금 9am-5pm",
    why: "휴스턴 한인 커뮤니티 허브. 정착·법률·취업 상담. 한국어 서비스",
    tip: "방문 전 전화 예약", website: "kaagh.org" },
  { rank: 3, emoji: "🏪", nameKo: "H-Mart 휴스턴 (Spring Branch)", nameEn: "H-Mart — Houston Spring Branch",
    address: "1302 Blalock Rd, Houston TX 77055",
    phone: "(713) 932-1110", hours: "매일 8am-10pm",
    why: "휴스턴 한인 마트 1위. 한국 식품·반찬·생활용품. 한인 정보 보드 활용",
    tip: "주차 무료. 한국어 안내 가능", website: "hmart.com" },
  { rank: 4, emoji: "🚗", nameKo: "Texas DPS — 운전면허", nameEn: "Texas DPS — Driver License",
    address: "12220 S Gessner Rd, Houston TX 77071",
    phone: "(713) 595-1300", hours: "월-금 8am-5pm (예약 필수)",
    why: "휴스턴 DPS. TX 이주 90일 내 면허 전환 의무. 한국 면허 지참 시 일부 면제 가능",
    tip: "🔗 appointments.dps.texas.gov 예약 필수", website: "dps.texas.gov" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주휴스턴 총영사관", nameEn: "Korean Consulate General — Houston",
    address: "1990 Post Oak Blvd Ste 1250, Houston TX 77056",
    phone: "(713) 961-0186", hours: "월-금 9am-12pm, 1:30pm-4pm",
    why: "여권·공증·재외국민 등록. 텍사스·오클라호마·아칸소·루이지애나 담당",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/us-houston-ko", website: "overseas.mofa.go.kr/us-houston-ko" },
];

const TOP5_EXPLORE_HOUSTON: Top5Item[] = [
  { rank: 1, emoji: "🏘️", nameKo: "Spring Branch 한인타운 (Long Point Rd)", nameEn: "Spring Branch Koreatown",
    address: "Long Point Rd & Blalock Rd, Houston TX 77055",
    why: "휴스턴 최대 한인 밀집. H-Mart·한식당·한인 교회·노래방 집결",
    tip: "Long Point Rd 따라 한인 상권 형성", website: "maps.google.com/?q=Koreatown+Spring+Branch+Houston" },
  { rank: 2, emoji: "🚀", nameKo: "NASA 우주센터 (Space Center Houston)", nameEn: "Space Center Houston",
    address: "1601 E NASA Pkwy, Houston TX 77058",
    why: "NASA 존슨 우주센터. 아폴로 11호 관제실·우주 비행사 훈련시설. 휴스턴 1위 명소",
    tip: "입장료 $30. 주말 사전 예약 권장", website: "spacecenter.org" },
  { rank: 3, emoji: "🏈", nameKo: "NRG Stadium (월드컵 경기장)", nameEn: "NRG Stadium — World Cup 2026",
    address: "1 NRG Pkwy, Houston TX 77054",
    why: "휴스턴 텍산스 홈구장. 2026 월드컵 미국 호스트 도시. 7경기 개최",
    tip: "월드컵 기간 주차·교통 혼잡 — 미리 계획", website: "nrgpark.com" },
  { rank: 4, emoji: "🌃", nameKo: "다운타운 휴스턴 & Discovery Green", nameEn: "Downtown Houston & Discovery Green",
    address: "1500 McKinney St, Houston TX 77010",
    why: "휴스턴 도심 공원. 야외 행사·산책. 박물관 지구 인근",
    tip: "무료 입장. 주말 행사 자주 열림", website: "discoverygreen.com" },
  { rank: 5, emoji: "🏛️", nameKo: "Houston Museum District", nameEn: "Houston Museum District",
    address: "1001 Bissonnet St, Houston TX 77005",
    why: "미술관·과학관·자연사 박물관 19개 집결. 일부 무료. 한인 가족 문화 코스",
    tip: "MFA Houston·자연사박물관 추천. 일부 무료요일 활용", website: "houmuseum.org" },
];

/* ─────────────────────────────────────────
   ATLANTA 전용 데이터 (월드컵 2026)
───────────────────────────────────────── */
const TOP5_RESTAURANTS_ATLANTA: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Iron Age Korean BBQ — Duluth", nameEn: "Iron Age Korean BBQ — Duluth",
    address: "3505 Pleasant Hill Rd, Duluth GA 30096",
    phone: "(770) 232-9988", hours: "매일 11am-12am",
    rating: 4.1, ratingCount: "1500+",
    why: "🥩 BBQ\n애틀랜타 듀럴스 한인타운 AYCE BBQ. 무한리필. 한인·현지인 모두 인기",
    tip: "Pleasant Hill Rd 한인 상권 중심", website: "ironagekoreanbbq.com" },
  { rank: 2, emoji: "🍲", nameKo: "Sa Rit Gol — 한식 명가", nameEn: "Sa Rit Gol Korean Restaurant",
    address: "5270 Buford Hwy NE Ste C5, Doraville GA 30340",
    phone: "(770) 936-9292", hours: "매일 11am-10pm",
    rating: 4.4, ratingCount: "600+",
    why: "🍲 국물·한식\n도라빌 한인타운 정통 한식. 갈비탕·순두부·비빔밥. 30년 전통",
    tip: "Buford Hwy 한인 상권. 점심 가성비", website: "yelp.com/biz/sa-rit-gol-doraville" },
  { rank: 3, emoji: "🍗", nameKo: "Mom's Touch — 애틀랜타", nameEn: "Mom's Touch — Atlanta",
    address: "3473 Old Norcross Rd, Duluth GA 30096",
    phone: "(770) 232-7000", hours: "매일 11am-10pm",
    rating: 4.2, ratingCount: "400+",
    why: "🍗 치킨\n한국 인기 치킨 체인 미국 진출. 싸이순살·치즈볼. 듀럴스 한인타운",
    tip: "한국 본토 메뉴 그대로", website: "momstouchusa.com" },
  { rank: 4, emoji: "🥘", nameKo: "Hae Woon Dae Korean BBQ", nameEn: "Hae Woon Dae — Doraville",
    address: "5805 Buford Hwy NE, Doraville GA 30340",
    phone: "(770) 451-7957", hours: "매일 11am-2am",
    rating: 4.0, ratingCount: "500+",
    why: "🥩 BBQ·갈비\n애틀랜타 24시 BBQ 명소. 갈비·삼겹살. 야식·해장 OK",
    tip: "새벽 영업. 한인 단골 많음", website: "yelp.com/biz/hae-woon-dae-doraville" },
  { rank: 5, emoji: "☕", nameKo: "Paris Baguette — Duluth", nameEn: "Paris Baguette — Duluth",
    address: "3505 Pleasant Hill Rd Ste C5, Duluth GA 30096",
    phone: "(678) 380-5060", hours: "매일 7am-10pm",
    rating: 4.1, ratingCount: "300+",
    why: "☕ 카페·베이커리\n한국식 베이커리·카페. 소금빵·크림빵·케이크. 한인 미팅 장소",
    tip: "주말 사람 많음. 평일 추천", website: "parisbaguette.com" },
];

const TOP5_SETTLE_ATLANTA: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "한인회 (KAAA)", nameEn: "Korean American Association of Atlanta",
    address: "5900 Brook Hollow Pkwy, Norcross GA 30071",
    phone: "(770) 446-9466", hours: "월-금 9am-5pm",
    why: "애틀랜타 한인 커뮤니티 허브. 정착·법률·취업 상담. 한국어 서비스 완전 지원",
    tip: "방문 전 전화 예약", website: "kaaatlanta.org" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart 듀럴스", nameEn: "H-Mart — Duluth",
    address: "2700 Pleasant Hill Rd, Duluth GA 30096",
    phone: "(770) 622-1100", hours: "매일 8am-10pm",
    why: "애틀랜타 최대 한인 마트. 듀럴스 한인타운 중심. 한국 식품·생활용품 완비",
    tip: "주차 무료. 푸드코트 운영", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "조지아 DDS — 운전면허", nameEn: "Georgia DDS — Driver License",
    address: "5318 Buford Hwy NE, Doraville GA 30340",
    phone: "(678) 413-8400", hours: "월-금 8am-5pm",
    why: "GA 이주 30일 내 면허 전환 의무. 한국 면허 지참 시 일부 면제 가능",
    tip: "🔗 dds.georgia.gov 예약 필수", website: "dds.georgia.gov" },
  { rank: 4, emoji: "🏥", nameKo: "Center for Pan Asian Community Services (CPACS)", nameEn: "CPACS — Center for Pan Asian Community Services",
    address: "3510 Shallowford Rd NE, Atlanta GA 30341",
    phone: "(770) 936-0969", hours: "월-금 9am-5pm",
    why: "애틀랜타 아시안 이민자 종합 서비스. 한국어 통역. 의료·법률·취업 연결",
    tip: "무료 서비스 다수. 사전 예약 권장", website: "cpacs.org" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주애틀랜타 총영사관", nameEn: "Korean Consulate General — Atlanta",
    address: "229 Peachtree St NE Ste 500, Atlanta GA 30303",
    phone: "(404) 522-1611", hours: "월-금 9am-12pm, 1:30pm-4pm",
    why: "여권·공증·재외국민 등록. 조지아·앨라배마·테네시·노스캐롤라이나·사우스캐롤라이나·미시시피 담당",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/us-atlanta-ko", website: "overseas.mofa.go.kr/us-atlanta-ko" },
];

const TOP5_EXPLORE_ATLANTA: Top5Item[] = [
  { rank: 1, emoji: "🏘️", nameKo: "듀럴스·도라빌 한인타운 (Buford Hwy)", nameEn: "Duluth & Doraville Koreatown",
    address: "Buford Hwy NE & Pleasant Hill Rd, Atlanta GA",
    why: "애틀랜타 최대 한인 밀집. H-Mart·한식당·한인 교회·노래방 집결. 미국 동남부 한인 1번지",
    tip: "Buford Hwy 따라 다민족 식당가 — 베트남·중국·라티노 식당도 함께", website: "maps.google.com/?q=Koreatown+Duluth+Atlanta" },
  { rank: 2, emoji: "🥤", nameKo: "World of Coca-Cola", nameEn: "World of Coca-Cola",
    address: "121 Baker St NW, Atlanta GA 30313",
    why: "코카콜라 본사 박물관. 200+ 음료 시음. 가족·외국인 인기. 다운타운 도보 거리",
    tip: "입장료 $20. 조지아 아쿠아리움과 함께 코스", website: "worldofcoca-cola.com" },
  { rank: 3, emoji: "🏈", nameKo: "Mercedes-Benz Stadium (월드컵 경기장)", nameEn: "Mercedes-Benz Stadium — World Cup 2026",
    address: "1 AMB Dr NW, Atlanta GA 30313",
    why: "애틀랜타 팰컨스 홈구장. 2026 월드컵 미국 호스트. 8경기 개최",
    tip: "월드컵 기간 다운타운 호텔 사전 예약 필수", website: "mercedesbenzstadium.com" },
  { rank: 4, emoji: "🌳", nameKo: "Stone Mountain Park", nameEn: "Stone Mountain Park",
    address: "1000 Robert E Lee Blvd, Stone Mountain GA 30083",
    why: "거대한 단일 화강암 산. 케이블카·레이저쇼·하이킹. 한인 가족 주말 나들이 1순위",
    tip: "주차 $20. 시즌 패스 $40. 정상 케이블카 별도", website: "stonemountainpark.com" },
  { rank: 5, emoji: "🏞️", nameKo: "Atlantic Station & Piedmont Park", nameEn: "Atlantic Station & Piedmont Park",
    address: "1380 Atlantic Dr NW, Atlanta GA 30363",
    why: "쇼핑·식사·산책 모두 가능. 다운타운 인근. 한인 가족 주말 코스",
    tip: "Piedmont Park 무료. 주말 행사 자주", website: "atlanticstation.com" },
];

/* ─────────────────────────────────────────
   KANSAS CITY 전용 데이터 (월드컵 2026)
───────────────────────────────────────── */
const TOP5_RESTAURANTS_KANSASCITY: Top5Item[] = [
  { rank: 1, emoji: "🍲", nameKo: "Hong Hwa Korean Restaurant", nameEn: "Hong Hwa Korean Restaurant",
    address: "8336 W 135th St, Overland Park KS 66223",
    phone: "(913) 851-9133", hours: "매일 11am-10pm",
    rating: 4.0, ratingCount: "200+",
    why: "🍲 국물·한식\n캔자스시티 (오버랜드파크) 한식. 갈비탕·비빔밥. 한인 교민 단골",
    tip: "오버랜드파크 한인 상권 중심", website: "yelp.com/biz/hong-hwa-overland-park" },
  { rank: 2, emoji: "🥩", nameKo: "Choga Korean BBQ", nameEn: "Choga Korean BBQ — Overland Park",
    address: "10665 W 87th St, Overland Park KS 66214",
    hours: "매일 11am-10pm",
    rating: 4.1, ratingCount: "150+",
    why: "🥩 BBQ\n캔자스시티 한인 BBQ. 갈비·삼겹살. 가족 모임 장소",
    tip: "주말 웨이팅 있음", website: "yelp.com/search?find_desc=Korean+BBQ&find_loc=Overland+Park+KS" },
  { rank: 3, emoji: "🍗", nameKo: "한국식 치킨 (Yelp 검색)", nameEn: "Korean Fried Chicken — Kansas City",
    address: "Overland Park / Kansas City 지역",
    hours: "매장별 상이",
    rating: 4.0, ratingCount: "—",
    why: "🍗 치킨\n캔자스시티 지역 한국식 치킨 옵션. Yelp에서 최신 평점 확인",
    tip: "Yelp 검색으로 최신 정보", website: "yelp.com/search?find_desc=Korean+chicken&find_loc=Kansas+City+MO" },
  { rank: 4, emoji: "🥘", nameKo: "Mr. K's Cafe", nameEn: "Mr. K's Cafe — Korean",
    address: "Overland Park KS 지역",
    hours: "매일 11am-9pm",
    rating: 4.0, ratingCount: "100+",
    why: "🥘 분식·한식\n캔자스시티 한국식 캐주얼. 김밥·라면·덮밥",
    tip: "Yelp에서 영업시간 확인", website: "yelp.com/search?find_desc=Mr+K&find_loc=Overland+Park+KS" },
  { rank: 5, emoji: "🏪", nameKo: "Chinatown Food Market (한국식품)", nameEn: "Asian Market — Kansas City Korean Foods",
    address: "10336 Mastin St, Overland Park KS 66212",
    hours: "매일 9am-9pm",
    rating: 4.0, ratingCount: "100+",
    why: "🏪 마트·식료품\n캔자스시티 아시안 마트. 한국 식품 일부 취급. 한인 교민 활용",
    tip: "H-Mart 미진출 지역 — 아시안 마트 활용", website: "yelp.com/search?find_desc=Korean+market&find_loc=Overland+Park+KS" },
];

const TOP5_SETTLE_KANSASCITY: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "Korean American Association of Kansas City", nameEn: "Korean American Association of Greater Kansas City",
    address: "Overland Park / Kansas City 지역",
    hours: "월-금 (전화 확인)",
    why: "캔자스시티 한인회. 정착·법률·취업 상담",
    tip: "전화로 사전 예약", website: "google.com/search?q=Korean+American+Association+Kansas+City" },
  { rank: 2, emoji: "🏪", nameKo: "아시안 마트 (한국식품)", nameEn: "Asian Markets — Korean Foods",
    address: "Overland Park KS 지역",
    hours: "매장별 상이",
    why: "캔자스시티 한국 식품 공급. H-Mart 미진출. 아시안 마트로 대체",
    tip: "Chinatown Food Market·888 International 등", website: "yelp.com/search?find_desc=Korean+market&find_loc=Kansas+City+MO" },
  { rank: 3, emoji: "🚗", nameKo: "Missouri DOR — 운전면허", nameEn: "Missouri DOR — Driver License",
    address: "Kansas City MO (가까운 지점)",
    hours: "월-금 8am-5pm",
    why: "MO 이주 30일 내 면허 전환 의무. KS 거주 시 별도 KS DMV",
    tip: "🔗 dor.mo.gov 예약 권장", website: "dor.mo.gov" },
  { rank: 4, emoji: "⛪", nameKo: "한인 교회 (캔자스시티)", nameEn: "Korean Churches — Kansas City",
    address: "Overland Park / Kansas City 지역",
    hours: "주일 예배",
    why: "캔자스시티 한인 교회 — 정착 영적·실용 지원. 한인 커뮤니티 첫 연결",
    tip: "지역 한인회·구글 검색 활용", website: "google.com/search?q=Korean+church+Kansas+City" },
  { rank: 5, emoji: "🇰🇷", nameKo: "총영사관 (시카고 관할)", nameEn: "Korean Consulate — Chicago (Jurisdiction)",
    address: "455 N Cityfront Plaza Dr Ste 2700, Chicago IL 60611",
    phone: "(312) 822-9485", hours: "월-금 9am-12pm, 1:30pm-4pm",
    why: "캔자스시티는 시카고 총영사관 관할. 여권·공증·재외국민 등록",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/us-chicago-ko", website: "overseas.mofa.go.kr/us-chicago-ko" },
];

const TOP5_EXPLORE_KANSASCITY: Top5Item[] = [
  { rank: 1, emoji: "🏈", nameKo: "Arrowhead Stadium (월드컵 경기장)", nameEn: "Arrowhead Stadium — World Cup 2026",
    address: "1 Arrowhead Dr, Kansas City MO 64129",
    why: "NFL 캔자스시티 치프스 홈구장. 2026 월드컵 미국 호스트. 6경기 개최",
    tip: "월드컵 기간 호텔·교통 사전 계획 필수", website: "chiefs.com" },
  { rank: 2, emoji: "🍖", nameKo: "Kansas City BBQ (현지 명물)", nameEn: "Kansas City BBQ — Local Specialty",
    address: "Joe's KC BBQ: 3002 W 47th Ave, Kansas City KS 66103",
    why: "캔자스시티 BBQ — 미국 4대 BBQ 도시. Joe's KC·Q39·Arthur Bryant's 추천",
    tip: "현지 한인도 즐기는 명물. 점심 추천", website: "joeskc.com" },
  { rank: 3, emoji: "🌆", nameKo: "Country Club Plaza", nameEn: "Country Club Plaza — Spanish-style District",
    address: "4750 Broadway St, Kansas City MO 64112",
    why: "스페인풍 야외 쇼핑·식사 단지. 캔자스시티 1위 명소. 야경·분수·산책",
    tip: "주말 행사 자주. 무료 입장", website: "countryclubplaza.com" },
  { rank: 4, emoji: "🎨", nameKo: "Nelson-Atkins Museum of Art", nameEn: "Nelson-Atkins Museum of Art",
    address: "4525 Oak St, Kansas City MO 64111",
    why: "세계 수준 미술관. 동양·서양 미술 컬렉션. 무료 입장",
    tip: "셔틀콕 조형물 인증샷 명소", website: "nelson-atkins.org" },
  { rank: 5, emoji: "🌳", nameKo: "Loose Park & 분수 광장", nameEn: "Loose Park",
    address: "5200 Wornall Rd, Kansas City MO 64112",
    why: "캔자스시티 도심 공원. 장미정원·산책로. 한인 가족 주말 나들이",
    tip: "무료 입장. Country Club Plaza 인근", website: "kcparks.org" },
];

/* ─────────────────────────────────────────
   PHILADELPHIA 전용 데이터 (월드컵 2026)
───────────────────────────────────────── */
const TOP5_RESTAURANTS_PHILADELPHIA: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Kim's Restaurant — 필라델피아 한식", nameEn: "Kim's Restaurant — Philadelphia",
    address: "5955 N 5th St, Philadelphia PA 19120",
    phone: "(215) 927-4550", hours: "매일 11am-10pm",
    rating: 4.2, ratingCount: "300+",
    why: "🥩 BBQ·한식\n필라델피아 Olney 한인타운 정통 한식. 갈비·불고기·반찬",
    tip: "5th St 한인 상권 중심", website: "yelp.com/biz/kims-restaurant-philadelphia" },
  { rank: 2, emoji: "🍲", nameKo: "Cho Sun Ok — 한식당", nameEn: "Cho Sun Ok Korean Restaurant",
    address: "Cheltenham PA 지역",
    hours: "매일 11am-10pm",
    rating: 4.1, ratingCount: "200+",
    why: "🍲 국물·한식\n필라델피아 첼튼햄 한인 단골. 순두부·갈비탕",
    tip: "Cheltenham 한인 상권", website: "yelp.com/search?find_desc=Cho+Sun+Ok&find_loc=Philadelphia+PA" },
  { rank: 3, emoji: "🍗", nameKo: "BonChon — 필라델피아", nameEn: "BonChon — Philadelphia",
    address: "Center City Philadelphia PA",
    hours: "매일 11am-10pm",
    rating: 4.0, ratingCount: "300+",
    why: "🍗 치킨\n필라델피아 한국식 치킨. 다운타운 접근성",
    tip: "Center City 위치", website: "bonchon.com" },
  { rank: 4, emoji: "🥘", nameKo: "Korean Restaurants — Cheltenham", nameEn: "Korean Restaurants — Cheltenham Area",
    address: "Cheltenham PA / North Philadelphia",
    hours: "매장별 상이",
    rating: 4.0, ratingCount: "—",
    why: "🥘 한식·분식\n필라델피아 첼튼햄 한인 식당가. 다양한 한식 옵션",
    tip: "Yelp에서 최신 평점 확인", website: "yelp.com/search?find_desc=Korean&find_loc=Cheltenham+PA" },
  { rank: 5, emoji: "🏪", nameKo: "H-Mart 첼튼햄 (필라델피아)", nameEn: "H-Mart — Cheltenham",
    address: "7050 Terwood Rd, Elkins Park PA 19027",
    phone: "(215) 663-1010", hours: "매일 8am-10pm",
    rating: 4.3, ratingCount: "500+",
    why: "🏪 마트·푸드코트\n필라델피아 H-Mart. 푸드코트 한식 분식. 한인 모임 장소",
    tip: "주차 무료", website: "hmart.com" },
];

const TOP5_SETTLE_PHILADELPHIA: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "Korean Community Development Services Center", nameEn: "KCDSC — Philadelphia",
    address: "6055 N 5th St, Philadelphia PA 19120",
    phone: "(215) 224-2380", hours: "월-금 9am-5pm",
    why: "필라델피아 한인 정착 지원. 법률·취업·교육 상담. 한국어 서비스",
    tip: "방문 전 전화 예약", website: "kcdsc.org" },
  { rank: 2, emoji: "🏪", nameKo: "H-Mart Elkins Park (Cheltenham)", nameEn: "H-Mart — Elkins Park",
    address: "7050 Terwood Rd, Elkins Park PA 19027",
    phone: "(215) 663-1010", hours: "매일 8am-10pm",
    why: "필라델피아 한인 마트 1위. 한국 식품·생활용품 완비",
    tip: "주차 무료. 푸드코트 활용", website: "hmart.com" },
  { rank: 3, emoji: "🚗", nameKo: "PennDOT — 운전면허", nameEn: "PennDOT — Driver License",
    address: "Philadelphia PA (가까운 지점)",
    hours: "월-금 8:30am-4:15pm",
    why: "PA 이주 60일 내 면허 전환 의무. 한국 면허 지참 시 일부 면제",
    tip: "🔗 dmv.pa.gov 예약 권장", website: "dmv.pa.gov" },
  { rank: 4, emoji: "⛪", nameKo: "한인 교회 (필라델피아)", nameEn: "Korean Churches — Philadelphia",
    address: "Cheltenham / Olney 지역",
    hours: "주일 예배",
    why: "필라델피아 한인 교회 — 정착 영적·실용 지원",
    tip: "지역 한인회·구글 검색 활용", website: "google.com/search?q=Korean+church+Philadelphia" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주뉴욕 총영사관 (필라델피아 관할)", nameEn: "Korean Consulate General — New York",
    address: "335 E 45th St, New York NY 10017",
    phone: "(646) 674-6000", hours: "월-금 9am-12pm, 1:30pm-4pm",
    why: "필라델피아는 뉴욕 총영사관 관할. 여권·공증·재외국민 등록",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/us-newyork-ko", website: "overseas.mofa.go.kr/us-newyork-ko" },
];

const TOP5_EXPLORE_PHILADELPHIA: Top5Item[] = [
  { rank: 1, emoji: "🏘️", nameKo: "Cheltenham·Olney 한인타운", nameEn: "Cheltenham & Olney Koreatown",
    address: "5th St & Cheltenham Ave, Philadelphia PA",
    why: "필라델피아 한인 밀집 지역. H-Mart·한식당·한인 교회. 도심 북부",
    tip: "5th St 따라 한인 상권", website: "maps.google.com/?q=Koreatown+Cheltenham+Philadelphia" },
  { rank: 2, emoji: "🔔", nameKo: "Independence Hall & Liberty Bell", nameEn: "Independence Hall & Liberty Bell",
    address: "520 Chestnut St, Philadelphia PA 19106",
    why: "미국 독립선언 장소. 자유의 종. 미국 역사 1순위. 무료 입장",
    tip: "성수기 사전 예약 필수", website: "nps.gov/inde" },
  { rank: 3, emoji: "🏈", nameKo: "Lincoln Financial Field (월드컵 경기장)", nameEn: "Lincoln Financial Field — World Cup 2026",
    address: "1 Lincoln Financial Field Way, Philadelphia PA 19148",
    why: "필라델피아 이글스 홈구장. 2026 월드컵 미국 호스트. 6경기 개최",
    tip: "월드컵 기간 다운타운 호텔 사전 예약", website: "lincolnfinancialfield.com" },
  { rank: 4, emoji: "🎨", nameKo: "Philadelphia Museum of Art", nameEn: "Philadelphia Museum of Art",
    address: "2600 Benjamin Franklin Pkwy, Philadelphia PA 19130",
    why: "록키 계단으로 유명. 미국 3대 미술관. 한인 관광 1순위",
    tip: "입장료 $30. 일부 무료 요일 활용", website: "philamuseum.org" },
  { rank: 5, emoji: "🥖", nameKo: "Reading Terminal Market", nameEn: "Reading Terminal Market",
    address: "51 N 12th St, Philadelphia PA 19107",
    why: "필라델피아 100년 전통 실내 마켓. 필리 치즈스테이크·디저트·다양한 음식",
    tip: "월-토 영업. 무료 입장", website: "readingterminalmarket.org" },
];

/* ─────────────────────────────────────────
   MIAMI 전용 데이터 (월드컵 2026)
───────────────────────────────────────── */
const TOP5_RESTAURANTS_MIAMI: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Gen Korean BBQ — Miami", nameEn: "Gen Korean BBQ — Miami",
    address: "Doral / Aventura 지역, Miami FL",
    hours: "매일 11am-11pm",
    rating: 4.0, ratingCount: "500+",
    why: "🥩 BBQ\n마이애미 한국식 AYCE BBQ. 한인·라티노·현지인 모두 인기",
    tip: "주말 웨이팅. 앱 예약 권장", website: "genkoreanbbq.com" },
  { rank: 2, emoji: "🍲", nameKo: "Korean Restaurants — Aventura", nameEn: "Korean Restaurants — Aventura/Doral",
    address: "Aventura / Doral, Miami FL",
    hours: "매장별 상이",
    rating: 4.0, ratingCount: "—",
    why: "🍲 한식\n마이애미 한식당 — Aventura·Doral 인근. 순두부·비빔밥·갈비탕",
    tip: "Yelp에서 최신 평점 확인", website: "yelp.com/search?find_desc=Korean&find_loc=Miami+FL" },
  { rank: 3, emoji: "🍗", nameKo: "BonChon — Miami", nameEn: "BonChon — Miami",
    address: "Miami FL (다수 지점)",
    hours: "매일 11am-10pm",
    rating: 4.0, ratingCount: "300+",
    why: "🍗 치킨\n마이애미 한국식 치킨. 다수 지점. 치맥 가능",
    tip: "Doral·Aventura 지점 인기", website: "bonchon.com" },
  { rank: 4, emoji: "🥘", nameKo: "Maru Korean BBQ", nameEn: "Maru Korean BBQ — Miami",
    address: "Miami FL 지역",
    hours: "매일 11am-10pm",
    rating: 4.1, ratingCount: "200+",
    why: "🥩 BBQ·갈비\n마이애미 한식 BBQ. 한인 가족 모임 장소",
    tip: "Yelp에서 최신 정보 확인", website: "yelp.com/search?find_desc=Maru+Korean+BBQ&find_loc=Miami+FL" },
  { rank: 5, emoji: "🏪", nameKo: "Asian Market (한국식품)", nameEn: "Asian Markets — Korean Foods Miami",
    address: "Aventura / Doral 지역",
    hours: "매장별 상이",
    rating: 4.0, ratingCount: "—",
    why: "🏪 마트·식료품\n마이애미 한국 식품 — H-Mart 미진출. 아시안 마트 활용",
    tip: "Yelp 검색으로 최신 정보", website: "yelp.com/search?find_desc=Korean+market&find_loc=Miami+FL" },
];

const TOP5_SETTLE_MIAMI: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "Korean American Association of South Florida", nameEn: "Korean American Association — South Florida",
    address: "Miami FL 지역",
    hours: "월-금 (전화 확인)",
    why: "마이애미 한인회. 정착·법률·취업 상담. 한인 커뮤니티 첫 연결",
    tip: "전화로 사전 예약", website: "google.com/search?q=Korean+American+Association+South+Florida" },
  { rank: 2, emoji: "🏪", nameKo: "Asian Markets (한국식품)", nameEn: "Asian Markets — Korean Foods",
    address: "Aventura / Doral, Miami FL",
    hours: "매장별 상이",
    why: "마이애미 한국 식품 공급. H-Mart 미진출. 아시안 마트로 대체",
    tip: "Yelp 검색 활용", website: "yelp.com/search?find_desc=Korean+market&find_loc=Miami+FL" },
  { rank: 3, emoji: "🚗", nameKo: "Florida DHSMV — 운전면허", nameEn: "Florida DHSMV — Driver License",
    address: "Miami FL (가까운 지점)",
    hours: "월-금 8am-5pm",
    why: "FL 이주 30일 내 면허 전환 의무. 한국 면허 지참 시 일부 면제",
    tip: "🔗 flhsmv.gov 예약 필수", website: "flhsmv.gov" },
  { rank: 4, emoji: "⛪", nameKo: "한인 교회 (마이애미)", nameEn: "Korean Churches — Miami",
    address: "Miami FL 지역",
    hours: "주일 예배",
    why: "마이애미 한인 교회 — 정착 영적·실용 지원",
    tip: "지역 한인회·구글 검색 활용", website: "google.com/search?q=Korean+church+Miami" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주애틀랜타 총영사관 (마이애미 관할)", nameEn: "Korean Consulate — Atlanta (Jurisdiction)",
    address: "229 Peachtree St NE Ste 500, Atlanta GA 30303",
    phone: "(404) 522-1611", hours: "월-금 9am-12pm, 1:30pm-4pm",
    why: "마이애미는 애틀랜타 총영사관 관할. 여권·공증·재외국민 등록",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/us-atlanta-ko", website: "overseas.mofa.go.kr/us-atlanta-ko" },
];

const TOP5_EXPLORE_MIAMI: Top5Item[] = [
  { rank: 1, emoji: "🏖️", nameKo: "South Beach (Miami Beach)", nameEn: "South Beach — Miami Beach",
    address: "Ocean Dr, Miami Beach FL 33139",
    why: "마이애미 대표 해변. 아르데코 거리·야자수·해변. 한인 관광 1순위",
    tip: "주차 어려움 — 우버 권장", website: "miamibeachfl.gov" },
  { rank: 2, emoji: "🏈", nameKo: "Hard Rock Stadium (월드컵 경기장)", nameEn: "Hard Rock Stadium — World Cup 2026",
    address: "347 Don Shula Dr, Miami Gardens FL 33056",
    why: "마이애미 돌핀스 홈구장. 2026 월드컵 미국 호스트. 7경기 개최",
    tip: "월드컵 기간 호텔·교통 사전 계획", website: "hardrockstadium.com" },
  { rank: 3, emoji: "🎨", nameKo: "Wynwood Walls", nameEn: "Wynwood Walls",
    address: "266 NW 26th St, Miami FL 33127",
    why: "세계적 그래피티·스트릿 아트 거리. 인스타 명소. 카페·갤러리",
    tip: "입장료 $12. 야경 추천", website: "thewynwoodwalls.com" },
  { rank: 4, emoji: "🌴", nameKo: "Little Havana (Calle Ocho)", nameEn: "Little Havana — Calle Ocho",
    address: "SW 8th St, Miami FL 33135",
    why: "쿠바 이민자 문화 거리. 시가·라티노 음식·살사. 마이애미 정체성",
    tip: "Versailles 레스토랑 명물", website: "visitlittlehavana.com" },
  { rank: 5, emoji: "🐊", nameKo: "Everglades National Park", nameEn: "Everglades National Park",
    address: "40001 State Road 9336, Homestead FL 33034",
    why: "악어 서식지·습지 국립공원. 에어보트 투어. 한인 가족 액티비티",
    tip: "마이애미에서 1시간. 입장료 $30/차량", website: "nps.gov/ever" },
];

/* ─────────────────────────────────────────
   MEXICO CITY 전용 데이터 (월드컵 2026)
───────────────────────────────────────── */
const TOP5_RESTAURANTS_MEXICOCITY: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Restaurante Hangang — Zona Rosa", nameEn: "Restaurante Hangang — Zona Rosa",
    address: "Florencia 38, Juárez, 06600 Ciudad de México, CDMX, Mexico",
    phone: "+52 55 5208 1300", hours: "Lun-Dom 12pm-10pm",
    rating: 4.3, ratingCount: "500+",
    why: "🥩 BBQ\n멕시코시티 Zona Rosa 한인타운 대표 BBQ. 갈비·삼겹살. 한인·멕시코인 모두 인기",
    tip: "Zona Rosa 한인 상권 중심. Metro Insurgentes역", website: "yelp.com/biz/hangang-mexico-city" },
  { rank: 2, emoji: "🍲", nameKo: "Biwon — 한식당 Zona Rosa", nameEn: "Biwon Korean Restaurant — Zona Rosa",
    address: "Zona Rosa, Ciudad de México, CDMX",
    hours: "Lun-Dom 12pm-10pm",
    rating: 4.2, ratingCount: "300+",
    why: "🍲 국물·한식\nZona Rosa 한인타운 정통 한식. 순두부·비빔밥·갈비탕",
    tip: "한국어 메뉴 가능. Metro Insurgentes", website: "yelp.com/search?find_desc=Korean&find_loc=Zona+Rosa+Mexico+City" },
  { rank: 3, emoji: "🍗", nameKo: "Korean Fried Chicken — CDMX", nameEn: "Korean Fried Chicken — Mexico City",
    address: "Zona Rosa / Polanco, CDMX",
    hours: "Lun-Dom 12pm-10pm",
    rating: 4.1, ratingCount: "200+",
    why: "🍗 치킨\n멕시코시티 한국식 치킨. 한인·멕시코 청년 인기",
    tip: "Yelp에서 최신 정보 확인", website: "yelp.com/search?find_desc=Korean+chicken&find_loc=Mexico+City" },
  { rank: 4, emoji: "🥘", nameKo: "Korean BBQ — Polanco", nameEn: "Korean BBQ Restaurants — Polanco",
    address: "Polanco, Ciudad de México",
    hours: "Lun-Dom 12pm-11pm",
    rating: 4.1, ratingCount: "—",
    why: "🥩 BBQ·고급 한식\nPolanco 한식당. 고급 한식·BBQ 옵션",
    tip: "Polanco는 멕시코시티 고급 상권", website: "yelp.com/search?find_desc=Korean+BBQ&find_loc=Polanco+Mexico+City" },
  { rank: 5, emoji: "🏪", nameKo: "한국 식품점 (Zona Rosa)", nameEn: "Korean Markets — Zona Rosa",
    address: "Zona Rosa, Ciudad de México",
    hours: "Lun-Dom 9am-9pm",
    rating: 4.0, ratingCount: "—",
    why: "🏪 마트·식료품\n멕시코시티 한국 식품점. Zona Rosa 집결",
    tip: "Yelp·Google 검색으로 최신 정보", website: "google.com/maps/search/Korean+market+Zona+Rosa+Mexico+City" },
];

const TOP5_SETTLE_MEXICOCITY: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "Asociación Coreana de México", nameEn: "Korean Association of Mexico",
    address: "Ciudad de México, CDMX",
    hours: "Lun-Vie 9am-5pm",
    why: "멕시코 한인회. 정착·법률·취업 상담. 한국어·스페인어 서비스",
    tip: "방문 전 전화 예약", website: "google.com/search?q=Asociacion+Coreana+Mexico" },
  { rank: 2, emoji: "🏪", nameKo: "한국 식품점 (Zona Rosa)", nameEn: "Korean Markets — Zona Rosa",
    address: "Zona Rosa, Ciudad de México",
    hours: "Lun-Dom 9am-9pm",
    why: "Zona Rosa 한인타운 한국 식품점 집결. 한인 정착 필수",
    tip: "Metro Insurgentes 도보 거리", website: "google.com/maps/search/Korean+market+Zona+Rosa" },
  { rank: 3, emoji: "🚗", nameKo: "Licencia de Conducir CDMX", nameEn: "Mexico City Driver License",
    address: "CDMX 운전면허국",
    hours: "Lun-Vie 8am-5pm",
    why: "멕시코시티 운전면허. 한국 면허 지참 시 일부 면제 가능",
    tip: "🔗 cdmx.gob.mx 예약 권장", website: "cdmx.gob.mx" },
  { rank: 4, emoji: "⛪", nameKo: "한인 교회 (멕시코시티)", nameEn: "Korean Churches — Mexico City",
    address: "Zona Rosa / Polanco 지역",
    hours: "주일 예배",
    why: "멕시코시티 한인 교회. 정착 영적·실용 지원",
    tip: "한인회·구글 검색 활용", website: "google.com/search?q=Korean+church+Mexico+City" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주멕시코 대한민국 대사관", nameEn: "Korean Embassy — Mexico",
    address: "Lope de Armendáriz 110, Lomas Virreyes, 11000 CDMX, Mexico",
    phone: "+52 55 5202 9866", hours: "Lun-Vie 9am-12pm, 2pm-4pm",
    why: "여권·공증·재외국민 등록. 멕시코 전체 담당",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/mx-ko", website: "overseas.mofa.go.kr/mx-ko" },
];

const TOP5_EXPLORE_MEXICOCITY: Top5Item[] = [
  { rank: 1, emoji: "🏘️", nameKo: "Zona Rosa 한인타운", nameEn: "Zona Rosa Koreatown",
    address: "Zona Rosa, Ciudad de México, CDMX",
    why: "멕시코시티 한인 밀집 — 한식당·한국 식품점·한인 교회 집결. 라틴아메리카 한인 1번지",
    tip: "Metro Insurgentes역 도보. 한국어·스페인어 모두 통함", website: "maps.google.com/?q=Zona+Rosa+Koreatown+Mexico+City" },
  { rank: 2, emoji: "🏛️", nameKo: "Centro Histórico & Zócalo", nameEn: "Historic Center & Zócalo",
    address: "Plaza de la Constitución, Centro, CDMX",
    why: "멕시코시티 도심 광장. 메트로폴리탄 대성당·국립궁전. 유네스코 세계유산",
    tip: "주말 행사 자주. Metro Zócalo역", website: "cdmx.gob.mx" },
  { rank: 3, emoji: "🏟️", nameKo: "Estadio Azteca (월드컵 개막전)", nameEn: "Estadio Azteca — World Cup 2026 Opener",
    address: "Calz. de Tlalpan 3465, Sta. Úrsula Coapa, 04650 CDMX",
    why: "1970·1986·2026 세 번 월드컵 개최 유일 경기장. 2026 월드컵 개막전 개최",
    tip: "월드컵 기간 사전 예약 필수", website: "estadioazteca.com.mx" },
  { rank: 4, emoji: "🏜️", nameKo: "Teotihuacán 피라미드", nameEn: "Teotihuacán Pyramids",
    address: "Teotihuacán, Estado de México",
    why: "고대 메소아메리카 도시. 태양·달의 피라미드. 멕시코시티 1시간",
    tip: "입장료 $90 MXN. 일출 투어 추천", website: "teotihuacan.inah.gob.mx" },
  { rank: 5, emoji: "🌳", nameKo: "Bosque de Chapultepec", nameEn: "Chapultepec Park & Castle",
    address: "Bosque de Chapultepec, CDMX",
    why: "멕시코시티 도심 공원. 차풀테펙성·국립인류학박물관. 가족 나들이",
    tip: "박물관 입장료 별도. Metro Chapultepec", website: "chapultepec.org.mx" },
];

/* ─────────────────────────────────────────
   GUADALAJARA 전용 데이터 (월드컵 2026)
───────────────────────────────────────── */
const TOP5_RESTAURANTS_GUADALAJARA: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Korean BBQ — Guadalajara", nameEn: "Korean BBQ — Guadalajara",
    address: "Zona Providencia, Guadalajara, Jalisco",
    hours: "Lun-Dom 1pm-10pm",
    rating: 4.0, ratingCount: "150+",
    why: "🥩 BBQ\n과달라하라 한국식 BBQ. 한인·현지인 모두 인기",
    tip: "Yelp에서 최신 평점 확인", website: "yelp.com/search?find_desc=Korean+BBQ&find_loc=Guadalajara" },
  { rank: 2, emoji: "🍲", nameKo: "Sambok Korean Restaurant", nameEn: "Sambok Korean Restaurant — Guadalajara",
    address: "Guadalajara, Jalisco",
    hours: "Lun-Dom 12pm-10pm",
    rating: 4.1, ratingCount: "100+",
    why: "🍲 한식\n과달라하라 정통 한식. 비빔밥·순두부·갈비탕",
    tip: "한인 교민·현지 한류팬 단골", website: "yelp.com/search?find_desc=Sambok&find_loc=Guadalajara" },
  { rank: 3, emoji: "🍗", nameKo: "Korean Chicken — Guadalajara", nameEn: "Korean Chicken — Guadalajara",
    address: "Zona Providencia / Chapalita",
    hours: "Lun-Dom 12pm-10pm",
    rating: 4.0, ratingCount: "—",
    why: "🍗 치킨\n과달라하라 한국식 치킨. 한류 영향 인기",
    tip: "Yelp 검색으로 최신 정보", website: "yelp.com/search?find_desc=Korean+chicken&find_loc=Guadalajara" },
  { rank: 4, emoji: "🥘", nameKo: "Korean Restaurants — Chapalita", nameEn: "Korean Restaurants — Chapalita Area",
    address: "Chapalita, Guadalajara, Jalisco",
    hours: "매장별 상이",
    rating: 4.0, ratingCount: "—",
    why: "🥘 한식\n과달라하라 한식당가. Chapalita 인근 다수",
    tip: "Yelp·Google 검색", website: "google.com/maps/search/Korean+restaurant+Guadalajara" },
  { rank: 5, emoji: "🏪", nameKo: "Asian Market — Guadalajara", nameEn: "Asian Market — Guadalajara",
    address: "Guadalajara, Jalisco",
    hours: "매장별 상이",
    rating: 4.0, ratingCount: "—",
    why: "🏪 마트·식료품\n과달라하라 아시안 마트. 한국 식품 일부 취급",
    tip: "Yelp 검색 활용", website: "google.com/maps/search/Korean+market+Guadalajara" },
];

const TOP5_SETTLE_GUADALAJARA: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "Asociación Coreana — Guadalajara", nameEn: "Korean Association — Guadalajara",
    address: "Guadalajara, Jalisco",
    hours: "Lun-Vie (전화 확인)",
    why: "과달라하라 한인회. 정착·법률·취업 상담. 한국어 서비스",
    tip: "전화 사전 예약", website: "google.com/search?q=Korean+Association+Guadalajara" },
  { rank: 2, emoji: "🏪", nameKo: "Asian Markets (한국식품)", nameEn: "Asian Markets — Korean Foods",
    address: "Guadalajara, Jalisco",
    hours: "매장별 상이",
    why: "과달라하라 한국 식품. 아시안 마트 활용",
    tip: "Yelp·Google 검색", website: "google.com/maps/search/Korean+market+Guadalajara" },
  { rank: 3, emoji: "🚗", nameKo: "Licencia de Conducir — Jalisco", nameEn: "Jalisco Driver License",
    address: "Guadalajara, Jalisco",
    hours: "Lun-Vie 8am-3pm",
    why: "할리스코주 운전면허. 한국 면허 지참 시 일부 면제",
    tip: "🔗 jalisco.gob.mx 확인", website: "jalisco.gob.mx" },
  { rank: 4, emoji: "⛪", nameKo: "한인 교회 (과달라하라)", nameEn: "Korean Churches — Guadalajara",
    address: "Guadalajara, Jalisco",
    hours: "주일 예배",
    why: "과달라하라 한인 교회. 정착 영적·실용 지원",
    tip: "한인회·구글 검색 활용", website: "google.com/search?q=Korean+church+Guadalajara" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주멕시코 대한민국 대사관", nameEn: "Korean Embassy — Mexico",
    address: "Lope de Armendáriz 110, Lomas Virreyes, 11000 CDMX, Mexico",
    phone: "+52 55 5202 9866", hours: "Lun-Vie 9am-12pm, 2pm-4pm",
    why: "과달라하라는 멕시코시티 대사관 관할. 여권·공증·재외국민 등록",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/mx-ko", website: "overseas.mofa.go.kr/mx-ko" },
];

const TOP5_EXPLORE_GUADALAJARA: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "Centro Histórico Guadalajara", nameEn: "Guadalajara Historic Center",
    address: "Centro, Guadalajara, Jalisco",
    why: "과달라하라 도심. 대성당·국립극장·정부청사. 멕시코 문화 수도",
    tip: "주말 거리 공연·시장. 도보 관광", website: "visitguadalajara.com" },
  { rank: 2, emoji: "🏟️", nameKo: "Estadio Akron (월드컵 경기장)", nameEn: "Estadio Akron — World Cup 2026",
    address: "Av. Vallarta 8200, Zapopan, Jalisco",
    why: "Chivas 홈구장. 2026 월드컵 멕시코 호스트. 4경기 개최",
    tip: "월드컵 기간 호텔 사전 예약", website: "chivasdecorazon.com.mx" },
  { rank: 3, emoji: "🥃", nameKo: "Tequila 마을 (Pueblo Mágico)", nameEn: "Tequila Town — Pueblo Mágico",
    address: "Tequila, Jalisco",
    why: "데킬라 발상지 마을. 아가베 농장·증류소 투어. 과달라하라 1시간",
    tip: "Jose Cuervo·Sauza 투어 추천", website: "visitmexico.com/tequila" },
  { rank: 4, emoji: "🎨", nameKo: "Tlaquepaque & Tonalá", nameEn: "Tlaquepaque & Tonalá Artisan Towns",
    address: "Tlaquepaque, Jalisco",
    why: "수공예 마을. 도자기·유리공예·가죽. 멕시코 전통 쇼핑",
    tip: "주말 활기. 카페·갤러리", website: "visitmexico.com/tlaquepaque" },
  { rank: 5, emoji: "🌊", nameKo: "Lago de Chapala", nameEn: "Lake Chapala",
    address: "Chapala, Jalisco",
    why: "멕시코 최대 호수. 과달라하라 1시간. 한인·외국인 은퇴자 마을",
    tip: "Ajijic 마을 외국인 커뮤니티", website: "visitmexico.com/chapala" },
];

/* ─────────────────────────────────────────
   MONTERREY 전용 데이터 (월드컵 2026)
───────────────────────────────────────── */
const TOP5_RESTAURANTS_MONTERREY: Top5Item[] = [
  { rank: 1, emoji: "🥩", nameKo: "Korean BBQ — Monterrey", nameEn: "Korean BBQ — Monterrey",
    address: "San Pedro Garza García, Nuevo León",
    hours: "Lun-Dom 1pm-10pm",
    rating: 4.0, ratingCount: "100+",
    why: "🥩 BBQ\n몬테레이 한국식 BBQ. 한인·현지인 인기",
    tip: "San Pedro 고급 상권. Yelp 확인", website: "yelp.com/search?find_desc=Korean+BBQ&find_loc=Monterrey" },
  { rank: 2, emoji: "🍲", nameKo: "Korean Restaurants — San Pedro", nameEn: "Korean Restaurants — San Pedro",
    address: "San Pedro Garza García, Nuevo León",
    hours: "Lun-Dom 12pm-10pm",
    rating: 4.1, ratingCount: "—",
    why: "🍲 한식\n몬테레이 한식당. 비빔밥·순두부·갈비탕",
    tip: "Yelp 검색으로 최신 정보", website: "yelp.com/search?find_desc=Korean&find_loc=San+Pedro+Monterrey" },
  { rank: 3, emoji: "🍗", nameKo: "Korean Chicken — Monterrey", nameEn: "Korean Chicken — Monterrey",
    address: "Monterrey, Nuevo León",
    hours: "Lun-Dom 12pm-10pm",
    rating: 4.0, ratingCount: "—",
    why: "🍗 치킨\n몬테레이 한국식 치킨. 한류 영향",
    tip: "Yelp 검색", website: "yelp.com/search?find_desc=Korean+chicken&find_loc=Monterrey" },
  { rank: 4, emoji: "🥘", nameKo: "Asian Restaurants — Monterrey", nameEn: "Asian Restaurants — Monterrey",
    address: "San Pedro / Monterrey 도심",
    hours: "매장별 상이",
    rating: 4.0, ratingCount: "—",
    why: "🥘 아시안·한식\n몬테레이 아시안 식당가. 한식 옵션 일부",
    tip: "Yelp·Google 검색", website: "google.com/maps/search/Korean+restaurant+Monterrey" },
  { rank: 5, emoji: "🏪", nameKo: "Asian Market — Monterrey", nameEn: "Asian Market — Monterrey",
    address: "Monterrey, Nuevo León",
    hours: "매장별 상이",
    rating: 4.0, ratingCount: "—",
    why: "🏪 마트·식료품\n몬테레이 아시안 마트. 한국 식품 일부",
    tip: "Yelp·Google 검색", website: "google.com/maps/search/Korean+market+Monterrey" },
];

const TOP5_SETTLE_MONTERREY: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "Asociación Coreana — Monterrey", nameEn: "Korean Association — Monterrey",
    address: "Monterrey, Nuevo León",
    hours: "Lun-Vie (전화 확인)",
    why: "몬테레이 한인회. 정착 상담. 한국 기업 주재원 다수",
    tip: "전화 사전 예약", website: "google.com/search?q=Korean+Association+Monterrey" },
  { rank: 2, emoji: "🏭", nameKo: "Korean Companies (현대·기아·삼성)", nameEn: "Korean Corporations — Monterrey",
    address: "Apodaca / Pesquería, Nuevo León",
    hours: "월-금 9am-6pm",
    why: "기아·현대 공장 인근. 몬테레이 한인 주재원 다수. 한인 커뮤니티 핵심",
    tip: "Pesquería 기아 공장 인근 한인 주거", website: "google.com/search?q=Kia+Hyundai+Monterrey" },
  { rank: 3, emoji: "🚗", nameKo: "Licencia de Conducir — Nuevo León", nameEn: "Nuevo León Driver License",
    address: "Monterrey, Nuevo León",
    hours: "Lun-Vie 8am-3pm",
    why: "누에보레온주 운전면허. 한국 면허 지참 시 일부 면제",
    tip: "🔗 nl.gob.mx 확인", website: "nl.gob.mx" },
  { rank: 4, emoji: "⛪", nameKo: "한인 교회 (몬테레이)", nameEn: "Korean Churches — Monterrey",
    address: "San Pedro / Monterrey",
    hours: "주일 예배",
    why: "몬테레이 한인 교회. 한인 주재원 가족 중심",
    tip: "한인회·구글 검색", website: "google.com/search?q=Korean+church+Monterrey" },
  { rank: 5, emoji: "🇰🇷", nameKo: "주멕시코 대한민국 대사관", nameEn: "Korean Embassy — Mexico",
    address: "Lope de Armendáriz 110, Lomas Virreyes, 11000 CDMX, Mexico",
    phone: "+52 55 5202 9866", hours: "Lun-Vie 9am-12pm, 2pm-4pm",
    why: "몬테레이는 멕시코시티 대사관 관할. 여권·공증·재외국민 등록",
    tip: "온라인 예약 필수 | 🔗 overseas.mofa.go.kr/mx-ko", website: "overseas.mofa.go.kr/mx-ko" },
];

const TOP5_EXPLORE_MONTERREY: Top5Item[] = [
  { rank: 1, emoji: "🏔️", nameKo: "Cerro de la Silla", nameEn: "Cerro de la Silla — Saddle Mountain",
    address: "Monterrey, Nuevo León",
    why: "몬테레이 상징 산. 안장 모양 봉우리. 도시 어디서나 보임",
    tip: "전망대·하이킹 코스", website: "visitmexico.com/monterrey" },
  { rank: 2, emoji: "🏟️", nameKo: "Estadio BBVA (월드컵 경기장)", nameEn: "Estadio BBVA — World Cup 2026",
    address: "Av. Pablo Livas 2011, Guadalupe, Nuevo León",
    why: "Rayados 홈구장. 2026 월드컵 멕시코 호스트. 4경기 개최",
    tip: "월드컵 기간 호텔 사전 예약", website: "rayados.com" },
  { rank: 3, emoji: "🌊", nameKo: "Parque Fundidora", nameEn: "Parque Fundidora",
    address: "Av. Fundidora, Monterrey, Nuevo León",
    why: "옛 제철소 부지 도심 공원. 박물관·산책로·자전거. 가족 나들이 1순위",
    tip: "무료 입장. 주말 행사 자주", website: "parquefundidora.org" },
  { rank: 4, emoji: "🏛️", nameKo: "Macroplaza & Barrio Antiguo", nameEn: "Macroplaza & Barrio Antiguo",
    address: "Centro, Monterrey, Nuevo León",
    why: "세계 최대 광장 중 하나. 대성당·박물관 집결. 야간 바·식당가 Barrio Antiguo",
    tip: "도보 관광. 주말 야간 활기", website: "visitmexico.com/monterrey" },
  { rank: 5, emoji: "🏞️", nameKo: "Grutas de García & Chipinque", nameEn: "García Caves & Chipinque Park",
    address: "García / San Pedro, Nuevo León",
    why: "동굴 탐험·산악 공원. 몬테레이 1시간. 한인 가족 액티비티",
    tip: "Chipinque 무료. Grutas 입장료", website: "visitmexico.com/monterrey" },
];

/* ─────────────────────────────────────────
   HOOK: 온라인 상태 감지
───────────────────────────────────────── */
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return isOnline;
}

/* ─────────────────────────────────────────
   HOOK: PWA 설치 프롬프트
───────────────────────────────────────── */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("hg_install_dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("hg_install_dismissed", "1");
  };

  return { showBanner, handleInstall, handleDismiss };
}

/* ─────────────────────────────────────────
   UTIL: 로컬 알림 스케줄링
───────────────────────────────────────── */
async function scheduleReminder(title: string, daysLater: number) {
  if (!("Notification" in window)) {
    alert("이 브라우저는 알림을 지원하지 않습니다.");
    return;
  }
  if (Notification.permission !== "granted") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
  }
  const ms = daysLater * 24 * 60 * 60 * 1000;
  const reminders = JSON.parse(localStorage.getItem("hg_reminders") || "[]");
  reminders.push({ title, fireAt: Date.now() + ms });
  localStorage.setItem("hg_reminders", JSON.stringify(reminders));
  new Notification("HebronGuide 알림 설정", {
    body: `"${title}" — ${daysLater}일 후 알림을 받습니다`,
    icon: "/icon-192.png",
  });
}

/* ─────────────────────────────────────────
   TOP 5 데이터 타입 & 데이터 상수
───────────────────────────────────────── */
interface Top5Item {
  rank: number;
  emoji: string;
  nameKo: string;
  nameEn: string;
  address?: string;
  phone?: string;
  hours?: string;
  why: string;
  tip?: string;
  website?: string;
  price?: string;
  rating?: number;
  ratingCount?: string;
}

const TOP5_RESTAURANTS: Top5Item[] = [
  { rank: 1, emoji: "🍜", nameKo: "이가네 전통 설렁탕", nameEn: "Yi's Traditional Korean Beef Soup",
    address: "31248 Pacific Hwy S Ste E, Federal Way WA 98003",
    phone: "(253) 946-1101", hours: "매일 8:30am-9pm",
    rating: 4.7, ratingCount: "635+",
    why: "24시간 끓인 사골국물, Yelp 4.7성 635리뷰, 아침부터 영업하는 해장국 명소",
    tip: "웨이팅 있을 수 있음. 아침 일찍 방문 추천", website: "yistraditional.com" },
  { rank: 2, emoji: "🥩", nameKo: "쏘문난집", nameEn: "So Moon Nan Jib",
    address: "33324 Pacific Hwy S, Federal Way WA 98003",
    phone: "(253) 815-8888", hours: "월화·목-일 11am-10pm (수 휴무)",
    rating: 4.3, ratingCount: "667+",
    why: "페더럴웨이 한인 커뮤니티 1위 BBQ, 수제 반찬 10종+, The Emerald Palate Top 3",
    tip: "수요일 휴무. 인기 메뉴 갈비·불고기 조합 추천",
    website: "yelp.com/biz/so-moon-nan-jib-federal-way" },
  { rank: 3, emoji: "🔥", nameKo: "WuJu 코리안 BBQ", nameEn: "WuJu Korean BBQ",
    address: "19400 36th Ave W Ste 102, Lynnwood WA 98036",
    phone: "(425) 672-2650", hours: "화-목 11am-10pm, 금-토 11am-11pm, 일 11am-9pm (월 휴무)",
    rating: 4.2, ratingCount: "256+",
    why: "린우드 숨은 명소, 두꺼운 불고기 전문, 직원이 친절하게 도와줌, 테이크아웃 가능",
    tip: "월요일 휴무. 사전 예약 추천", website: "wujukoreanbbq.com" },
  { rank: 4, emoji: "🍖", nameKo: "백정 린우드", nameEn: "Baekjeong Korean BBQ",
    address: "3000 184th St SW Ste 922, Lynnwood WA 98037",
    phone: "(425) 490-6328", hours: "월-목 11:30am-10pm, 금 11:30am-11pm, 토 11am-11pm, 일 11am-10pm",
    rating: 3.9, ratingCount: "464+",
    why: "알더우드몰 내 LA 체인 정통 BBQ, 직원이 고기 직접 구워줌, 무제한 밑반찬",
    tip: "알더우드몰 주차 무료. 웨이팅 앱 사용 가능", website: "baekjeongkbbq.com" },
  { rank: 5, emoji: "☕", nameKo: "K Cafe Dabang", nameEn: "K Cafe Dabang",
    address: "3333 184th St SW Ste X, Lynnwood WA 98037",
    phone: "(425) 678-8276", hours: "월-목 8am-9pm, 금 8am-10pm, 토-일 11am-9pm",
    rating: 4.5, ratingCount: "126+",
    why: "H-Mart 린우드 바로 옆, 한국식 커피·빙수·크로플, 한인타운 카페 1순위",
    tip: "H-Mart 쇼핑 후 들르기 딱 좋음",
    website: "yelp.com/biz/k-cafe-dabang-lynnwood" },
];

const TOP5_SETTLE: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "한인생활상담소 (KCSC)", nameEn: "Korean Community Service Center",
    address: "19509 64th Ave W Ste 270, Lynnwood WA 98036",
    phone: "(425) 776-2400", hours: "월-금 9:30am-4:30pm",
    why: "1983년 설립, 이민 초기 모든 서비스 원스톱 한국어 상담 — 법률·취업·정신건강·식품지원",
    tip: "방문 전 전화 예약 필수", website: "kcsc-seattle.org" },
  { rank: 2, emoji: "🇰🇷", nameKo: "주시애틀 총영사관", nameEn: "Korean Consulate General",
    address: "115 W Mercer St, Seattle WA 98119",
    phone: "(206) 441-1011", hours: "월-금 8:30am-4pm (예약 필수)",
    why: "여권·공증·재외국민등록 — 도미 직후 가장 먼저 방문해야 할 공관",
    tip: "온라인 예약 필수 (매우 혼잡)", website: "overseas.mofa.go.kr/us-seattle-ko" },
  { rank: 3, emoji: "🚗", nameKo: "ABC 운전면허 시험장 (한국어)", nameEn: "ABC Driving Test Center",
    address: "19720 44th Ave W Ste J, Lynnwood WA 98036",
    phone: "(425) 361-1750",
    why: "한국어 필기시험 응시 가능 — 린우드 한인 최다 이용 DOL 공인 시험장. $35",
    tip: "쇼어라인 지점도 운영: 16300 Aurora Ave N", website: "abcdrivingwa.com" },
  { rank: 4, emoji: "🏥", nameKo: "ICHS 쇼어라인 클리닉", nameEn: "ICHS Shoreline Medical & Dental",
    address: "16549 Aurora Ave N, Shoreline WA 98133",
    phone: "(206) 533-2600", hours: "월-토 8am-5pm",
    why: "한국어 구사 의사·치과의사 상주, 보험 없어도 소득 기준 진료 가능",
    tip: "예약: (206) 788-3700. 벨뷰·국제지구 지점도 운영", website: "ichs.com" },
  { rank: 5, emoji: "⚖️", nameKo: "북서부 이민권 프로젝트 (NWIRP)", nameEn: "Northwest Immigrant Rights Project",
    address: "615 2nd Ave Ste 400, Seattle WA 98104",
    phone: "(800) 445-5771", hours: "월-금 9am-5pm",
    why: "이민 법률 무료 지원 — 영주권·비자·추방방어. 저소득 이민자 전문",
    tip: "무료 전화 상담 가능. 한국어 서비스 요청 가능", website: "nwirp.org" },
];

// 시애틀 월드컵 시즌 한정 정보 (5/21 ~ 9/7) — kSeattle.com 2026-05-07 기사 기반
// 시즌 종료 후 자동으로 사라지도록 isWaterfrontShuttleActive() 체크
const SEATTLE_SHUTTLE_PERIOD = {
  startDate: new Date("2026-05-21"),
  endDate:   new Date("2026-09-07"),
};
function isSeattleShuttleActive(): boolean {
  const now = new Date();
  return now >= SEATTLE_SHUTTLE_PERIOD.startDate && now <= SEATTLE_SHUTTLE_PERIOD.endDate;
}

const TOP5_EXPLORE_SEATTLE_BASE: Top5Item[] = [
  { rank: 1, emoji: "🗼", nameKo: "스페이스 니들", nameEn: "Space Needle",
    address: "400 Broad St, Seattle WA 98109",
    phone: "(206) 905-2100", hours: "매일 8am-10:30pm (시즌별 상이)",
    price: "$49 / 콤보(치훌리) $69",
    why: "시애틀 1번 랜드마크, 605ft 유리 전망대, 야경 최고, 한인 관광객 필수 방문",
    tip: "금·토 야경 추천. 치훌리 콤보권이 개별 구매보다 $20 절약", website: "spaceneedle.com" },
  { rank: 2, emoji: "🐟", nameKo: "파이크 플레이스 마켓", nameEn: "Pike Place Market",
    address: "85 Pike St, Seattle WA 98101",
    phone: "(206) 682-7453", hours: "매일 9am-6pm",
    price: "입장 무료 (쇼핑·식사 별도)",
    why: "100년 역사 시장, 생선 던지기 퍼포먼스, 오리지널 스타벅스 1호점, 도보 관광 최적",
    tip: "평일 오전 9-11시 방문이 덜 혼잡. 지하 상가도 탐방", website: "pikeplacemarket.org" },
  { rank: 3, emoji: "🏔️", nameKo: "마운트 레이니어", nameEn: "Mount Rainier National Park",
    address: "Ashford, WA 98304 (니스콸리 입구)",
    phone: "(360) 569-2211",
    price: "$30/차량 (2026년 예약제 폐지)",
    why: "시애틀 2시간 거리 만년설 화산, 야생화 Paradise 트레일, 장엄한 4,392m 설경",
    tip: "오전 일찍 출발 권장. America the Beautiful 패스 있으면 무료", website: "nps.gov/mora" },
  { rank: 4, emoji: "💧", nameKo: "스노퀄미 폭포", nameEn: "Snoqualmie Falls",
    address: "6820 Railroad Ave SE, Snoqualmie WA 98065",
    price: "무료",
    why: "시애틀 동쪽 30분, Twin Peaks 촬영지, 82m 폭포, 산책로·카페 조합 완벽한 당일치기",
    tip: "주차 $5. 폭포 아래 전망대까지 15분 트레일 추천",
    website: "snoqualmiefalls.com" },
  { rank: 5, emoji: "⛴️", nameKo: "베인브릿지 아일랜드 페리", nameEn: "Bainbridge Island Ferry",
    address: "Colman Dock, 801 Alaskan Way, Seattle WA 98104",
    price: "성인 편도 $9.25 (차 없이 승선)",
    why: "35분 페리, 시애틀 스카이라인 뷰 최고, 올림픽 반도 문, 한인 커뮤니티 강력 추천",
    tip: "편도만 탑승료 징수 (시애틀→베인브릿지 방향). 저녁 노을 뷰 최고", website: "wsdot.wa.gov/ferries" },
];

// 시애틀 월드컵 시즌(5/21~9/7) 한정 — 무료 워터프론트 셔틀 1순위 노출
const SEATTLE_WATERFRONT_SHUTTLE: Top5Item = {
  rank: 1, emoji: "🚐", nameKo: "⚽ 무료 워터프론트 셔틀 (월드컵 한정)", nameEn: "Free Waterfront Shuttle — World Cup Edition",
  address: "Space Needle ↔ Pike Place ↔ Pioneer Square ↔ Lumen Field ↔ ChinaTown-ID",
  price: "완전 무료 (King County 운영)",
  hours: "매일 10am-10pm · 15분 간격 (경기일 10분 간격)",
  why: "🏆 2026 월드컵 D-30. 5/21~9/7 한정 운행. 스페이스니들·파이크플레이스·파이오니어스퀘어·루멘필드·차이나타운/인터내셔널 디스트릭트 모두 연결. 한인 식품점 인근 ID 정류장 추가. 한인 관광객·정착자·월드컵 응원단 모두에게 보물",
  tip: "월드컵 경기일(루멘필드)은 10분 간격. 차이나타운 정류장에서 한인 마트·맛집 도보 5-10분. 주차 걱정 ❌",
  website: "kingcounty.gov/metro",
};

// 시애틀 TOP5 EXPLORE — 시즌별 동적 (월드컵 시즌이면 셔틀 1순위, 아니면 기본 5개)
const TOP5_EXPLORE: Top5Item[] = isSeattleShuttleActive()
  ? [SEATTLE_WATERFRONT_SHUTTLE, ...TOP5_EXPLORE_SEATTLE_BASE.slice(0, 4).map((x, i) => ({ ...x, rank: i + 2 }))]
  : TOP5_EXPLORE_SEATTLE_BASE;

// ─────────────────────────────────────────────────────────────────────────────
//  월드컵 2026 — 글로벌 호스트 도시 경기장 교통 시스템 (6/1 ~ 7/26 한정)
//  각 도시 TOP5 탐방 1순위에 경기장 교통 정보 자동 삽입 → 시즌 후 자동 복원
//  기존 isWorldCupActive(slug) + WORLD_CUP_2026 상수 활용 (아래 2500번대 라인)
//  Source: FIFA 2026 공식 대중교통 가이드 + 각 도시 교통공사 공지
// ─────────────────────────────────────────────────────────────────────────────
const WC_TRANSIT: Record<string, Top5Item> = {
  la: {
    rank: 1, emoji: "🚇",
    nameKo: "⚽ LA Metro C Line → SoFi Stadium (월드컵 개막전 도시)",
    nameEn: "LA Metro C Line → SoFi Stadium — World Cup 2026 Opener",
    address: "SoFi Stadium, 1000 S Prairie Ave, Inglewood CA 90301",
    price: "$1.75 (TAP Card — 경기일 증편 운행)",
    hours: "경기 시작 3시간 전 ~ 종료 후 1시간",
    why: "🏆 2026 월드컵 개막전(6/11) 포함 8경기 LA 개최. Metro C Line(구 Green Line) → Hollywood Park/Kia Forum역 → 도보 5분. 코리아타운(Wilshire/Western역)에서 직접 환승. 주차 없이 경기장 직행",
    tip: "TAP Card 충전 후 탑승. 코리아타운 → Expo/Vermont역 환승 → C Line. 경기일 최소 2시간 전 출발 권장",
    website: "metro.net",
  },
  newyork: {
    rank: 1, emoji: "🚆",
    nameKo: "⚽ NJ Transit → MetLife Stadium (결승전 특별열차)",
    nameEn: "NJ Transit → MetLife Stadium — World Cup Final 2026",
    address: "MetLife Stadium, 1 MetLife Stadium Dr, East Rutherford NJ 07073",
    price: "왕복 ~$20 (특별 운행 티켓)",
    hours: "Penn Station 출발 경기 4시간 전 ~ 종료 후 운행",
    why: "🏆 2026 월드컵 결승전(7/19) 포함 8경기 뉴욕 개최. Penn Station → Secaucus → MetLife Stadium 직행. 플러싱 한인타운 → 7 Train → 타임스스퀘어 → Penn Station 환승. 경기일 주차 극혼잡 — 열차가 유일한 선택",
    tip: "NJ Transit 사전 예약 필수 (njtransit.com). 플러싱(Flushing) → Ride-share로 Penn Station 이동도 OK. 최소 3시간 전 출발",
    website: "njtransit.com",
  },
  dallas: {
    rank: 1, emoji: "🚂",
    nameKo: "⚽ TRE 열차 + 무료 셔틀 → AT&T Stadium (달라스 월드컵)",
    nameEn: "TRE Train + Free Shuttle → AT&T Stadium — World Cup 2026",
    address: "AT&T Stadium, 1 AT&T Way, Arlington TX 76011",
    price: "TRE $2.50 + 셔틀 무료 (경기일)",
    hours: "경기 전 2시간 ~ 종료 후 2시간",
    why: "🏆 2026 월드컵 6경기 달라스 개최. Trinity Railway Express(TRE): 달라스 유니언 스테이션 → CentrePort/DFW공항역 → 경기장 무료 셔틀 연결. 캐롤튼 한인타운 → DART → 유니언스테이션 → TRE 환승",
    tip: "TRE + 셔틀 조합이 주차($50+)보다 훨씬 편함. 경기 2시간 전 출발 권장",
    website: "trinityrailwayexpress.org",
  },
  sf: {
    rank: 1, emoji: "🚆",
    nameKo: "⚽ Caltrain + VTA 셔틀 → Levi's Stadium (베이에어리어 월드컵)",
    nameEn: "Caltrain + VTA Shuttle → Levi's Stadium — World Cup 2026",
    address: "Levi's Stadium, 4900 Marie P DeBartolo Way, Santa Clara CA 95054",
    price: "Caltrain $5-10 + VTA 셔틀 무료 (경기일)",
    hours: "SF 출발 경기 3시간 전 ~ 종료 후 2시간",
    why: "🏆 2026 월드컵 6경기 베이에어리어(산타클라라) 개최. SF 4th & King → Caltrain → Great America역 → VTA 무료 셔틀. 산타클라라 H-Mart(한인타운) 인근에서 VTA 직접 접근도 가능",
    tip: "Clipper Card 사용. 경기일 Caltrain 증편 운행. 주차 $50+, 열차가 훨씬 경제적",
    website: "caltrain.com",
  },
  boston: {
    rank: 1, emoji: "🚆",
    nameKo: "⚽ MBTA 게임데이 특별열차 → Gillette Stadium (보스턴 월드컵)",
    nameEn: "MBTA Game Day Train → Gillette Stadium — World Cup 2026",
    address: "Gillette Stadium, 1 Patriot Pl, Foxborough MA 02035",
    price: "왕복 $20-25 (특별 운행 티켓)",
    hours: "South Station 출발 경기 3시간 전 ~ 종료 후",
    why: "🏆 2026 월드컵 6경기 보스턴(폭스버러) 개최. MBTA 게임데이 직행열차: South Station → Foxborough 직통 (~1시간). 보스턴 한인 밀집 지역(퀸시·캠브리지) → Red Line → South Station 환승",
    tip: "MBTA 게임데이 열차 온라인 사전 구매 필수 (mbta.com). 퀸시 한인타운 → Red Line 직통",
    website: "mbta.com",
  },
  houston: {
    rank: 1, emoji: "🚇",
    nameKo: "⚽ METRORail Red Line + 셔틀 → NRG Stadium (IHM 본부 도시)",
    nameEn: "METRORail + Shuttle → NRG Stadium — World Cup 2026",
    address: "NRG Stadium, One NRG Park, Houston TX 77054",
    price: "$1.25 (Q Card) + 셔틀 무료",
    hours: "경기 전 2시간 ~ 종료 후 1시간",
    why: "🏆 2026 월드컵 7경기 휴스턴 개최 (IHM 가정교회 운동 본부 도시). METRORail Red Line → Memorial Hermann/Houston Zoo역 → NRG Park 셔틀. 휴스턴 한인타운(Beltway 8/Sugar Land)에서 버스·환승 가능",
    tip: "경기일 NRG 주변 I-610 극혼잡. Q Card 미리 충전. METRORail + 셔틀 조합 강력 권장",
    website: "ridemetro.org",
  },
  atlanta: {
    rank: 1, emoji: "🚇",
    nameKo: "⚽ MARTA → Mercedes-Benz Stadium (애틀랜타 월드컵 직통)",
    nameEn: "MARTA → Mercedes-Benz Stadium — World Cup 2026",
    address: "Mercedes-Benz Stadium, 1 AMB Dr NW, Atlanta GA 30313",
    price: "$2.50 (Breeze Card 정기 요금)",
    hours: "경기일 연장 운행",
    why: "🏆 2026 월드컵 8경기 애틀랜타 개최. MARTA Red/Gold Line → GWCC/CNN Center역 → 도보 7분. 한인타운(둘루스·노크로스) → MARTA Doraville역 → Red Line 직통. 주차 없이 경기장 직행 가능",
    tip: "경기일 MARTA 증편. Breeze Card 충전 후 탑승. Doraville역(한인 밀집) → Red Line 직통 → GWCC",
    website: "itsmarta.com",
  },
  kansascity: {
    rank: 1, emoji: "🚌",
    nameKo: "⚽ 다운타운 셔틀 → Arrowhead Stadium (캔자스시티 월드컵)",
    nameEn: "Downtown Shuttle → Arrowhead Stadium — World Cup 2026",
    address: "Arrowhead Stadium, 1 Arrowhead Dr, Kansas City MO 64129",
    price: "왕복 $10-15 (예상, 특별 운행)",
    hours: "경기 전 3시간 ~ 종료 후 2시간",
    why: "🏆 2026 월드컵 6경기 캔자스시티 개최. KC Metro 특별 셔틀: Power & Light 다운타운 → Arrowhead. 경기일 I-70 고속도로 극혼잡 예상 — 셔틀이 최선 선택",
    tip: "경기일 최소 3시간 전 이동 권장. RideKC 앱에서 셔틀 정보 확인. 다운타운 주차 후 셔틀 환승도 OK",
    website: "ridekc.org",
  },
  philadelphia: {
    rank: 1, emoji: "🚇",
    nameKo: "⚽ SEPTA Broad St Line → Lincoln Financial Field (직통 지하철)",
    nameEn: "SEPTA Broad St Line → Lincoln Financial Field — World Cup 2026",
    address: "Lincoln Financial Field, 1 Lincoln Financial Field Way, Philadelphia PA 19148",
    price: "$2.50 (SEPTA Key Card 정기 요금)",
    hours: "경기일 정상 + 증편 운행",
    why: "🏆 2026 월드컵 6경기 필라델피아 개최. SEPTA Broad Street Line(지하철) → AT&T Station(Pattison) → 도보 5분. 필라델피아 한인 밀집 지역에서 Broad St Line 직통. 주차 $30-50 절약",
    tip: "경기일 SEPTA Broad St Line 증편 운행. SEPTA Key Card 충전 후 탑승",
    website: "septa.org",
  },
  miami: {
    rank: 1, emoji: "🚆",
    nameKo: "⚽ Brightline + 셔틀 → Hard Rock Stadium (마이애미 월드컵)",
    nameEn: "Brightline + Shuttle → Hard Rock Stadium — World Cup 2026",
    address: "Hard Rock Stadium, 347 Don Shula Dr, Miami Gardens FL 33056",
    price: "Brightline $10-15 + 셔틀",
    hours: "경기 전 3시간 ~ 종료 후 2시간",
    why: "🏆 2026 월드컵 7경기 마이애미 개최 (3위 결정전 포함). Brightline(Aventura역) + 경기일 셔틀 연계. 다운타운 MiamiCentral → Aventura → 셔틀. 도랄(Doral) 한인 밀집 지역에서 접근 가능",
    tip: "경기일 Brightline 사전 예약 (gobrightline.com). 마이애미 한인타운(Doral) → 셔틀 또는 Uber 조합",
    website: "gobrightline.com",
  },
  mexicocity: {
    rank: 1, emoji: "🚇",
    nameKo: "⚽ Metro 2호선 + 트렌 리헤로 → 아즈텍 경기장 (개막전 도시)",
    nameEn: "Metro Línea 2 + Tren Ligero → Estadio Azteca — World Cup 2026 Opener",
    address: "Estadio Azteca, Calzada de Tlalpan 3465, Ciudad de México 09000",
    price: "MXN 5페소 (Metro 정기 요금, 약 $0.30)",
    hours: "경기일 05:00 ~ 자정 (연장 운행)",
    why: "🏆 2026 월드컵 개막전(6/11) 포함 3경기 멕시코시티 개최. 아즈텍은 1970·1986·2026 세 번 월드컵 개최 유일 경기장. Metro 2호선 → Tasqueña역 → Tren Ligero → Estadio Azteca역 직통",
    tip: "경기일 Metro 극혼잡 → 2시간 전 출발. 한인 밀집 지역(Zona Rosa) → Metro 직통. 현금 5페소 준비",
    website: "metro.cdmx.gob.mx",
  },
  guadalajara: {
    rank: 1, emoji: "🚇",
    nameKo: "⚽ 트렌 에레크트리코 → 아크론 경기장 (과달라하라 월드컵)",
    nameEn: "Tren Eléctrico → Estadio Akron — World Cup 2026",
    address: "Estadio Akron, Av. de las Rosas 2501, Zapopan, Jalisco 45134",
    price: "MXN 9페소 (경전철 요금)",
    hours: "경기일 특별 연장 운행",
    why: "🏆 2026 월드컵 6경기 과달라하라 개최. 트렌 에레크트리코(경전철) Línea 1 → Estadio Akron 인근 + 셔틀. 과달라하라 한인 교회 커뮤니티에서 대중교통 접근 가능",
    tip: "경기일 대중교통 증편. 경기 3시간 전 출발 권장. Uber도 대안",
    website: "sistematransporte.jalisco.gob.mx",
  },
  monterrey: {
    rank: 1, emoji: "🚇",
    nameKo: "⚽ 메트로 1·2호선 + 셔틀 → BBVA 경기장 (몬테레이 월드컵)",
    nameEn: "Metro + Shuttle → Estadio BBVA — World Cup 2026",
    address: "Estadio BBVA, Av. Pablo Livas 2011, Guadalupe, Nuevo León 67130",
    price: "MXN 5페소 (Metro 요금)",
    hours: "경기일 특별 운행",
    why: "🏆 2026 월드컵 6경기 몬테레이 개최. 몬테레이 Metro 1·2호선 + 경기장 셔틀. 몬테레이 한인 주재원 커뮤니티(현대·기아·POSCO 등) 거주 지역에서 접근 가능",
    tip: "경기일 Metro 증편. 경기 2시간 전 이동 권장. 주재원 차량 공유도 OK",
    website: "metrorrey.gob.mx",
  },
  toronto: {
    rank: 1, emoji: "🚇",
    nameKo: "⚽ TTC + GO Train → BMO Field (토론토 월드컵 교통)",
    nameEn: "TTC + GO Train → BMO Field — World Cup 2026",
    address: "BMO Field, 170 Princes' Blvd, Toronto ON M6K 3C3",
    price: "CA$3.30 (PRESTO Card 정기 요금)",
    hours: "경기일 정상 + 증편 운행",
    why: "🏆 2026 월드컵 6경기 토론토 개최. GO Train Lakeshore → Exhibition 역 → BMO Field 도보 5분. TTC: 코리아타운(Bathurst역) → 블루어 라인 → Exhibition 방향 환승. 한인타운 직통 연결",
    tip: "PRESTO Card 사용. 코리아타운(Bathurst역) → TTC 블루어 라인 → Exhibition. 경기일 GO Train 증편",
    website: "gotransit.com",
  },
  vancouver: {
    rank: 1, emoji: "🚇",
    nameKo: "⚽ SkyTrain → BC Place (밴쿠버 월드컵 완벽 교통)",
    nameEn: "SkyTrain → BC Place — World Cup 2026",
    address: "BC Place, 777 Pacific Blvd, Vancouver BC V6B 4Y8",
    price: "CA$3.15-4.45 (거리별 Compass Card)",
    hours: "경기일 자정까지 연장 운행",
    why: "🏆 2026 월드컵 6경기 밴쿠버 개최. SkyTrain Expo/Millennium Line → Stadium-Chinatown역 → 도보 7분. 한인타운(코퀴틀람·버나비) → Millennium Line 직통. 북미 최고 수준 대중교통 경기장 접근성",
    tip: "Compass Card 사용. 코퀴틀람 한인타운 → Millennium Line → Stadium-Chinatown 직통. 경기일 SkyTrain 자정 연장",
    website: "translink.ca",
  },
};

// 월드컵 시즌(6/1~7/26) 한정 — 해당 도시 경기장 교통 정보 1순위 자동 삽입
// isWorldCupActive(slug): 기존 WORLD_CUP_2026 상수 활용 (파일 하단에 정의됨)
// 시즌 종료 후 자동 복원 (코드 수정 없음)
function withWorldCupTransit(slug: CitySlug, items: Top5Item[]): Top5Item[] {
  // NOTE: isWorldCupActive(slug)는 이 파일 하단 ~2551번째 라인에 정의됨
  // 빌드 시 호이스팅으로 정상 참조됨 (function declaration)
  if (!isWorldCupActive(slug)) return items;
  const wcItem = WC_TRANSIT[slug];
  if (!wcItem) return items;
  return [wcItem, ...items.slice(0, 4).map((x, i) => ({ ...x, rank: i + 2 }))];
}

/* ─────────────────────────────────────────
   COMPONENT: Top5Banner (가로 스크롤 카드)
───────────────────────────────────────── */
function Top5Banner({ items, lang, accentColor }: { items: Top5Item[]; lang: string; accentColor: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ padding: "0 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>⭐</span>
        <span style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 15, color: "#ECFDF5" }}>
          {lang === "ko" ? "TOP 5 베스트 — 검증된 추천" : "TOP 5 Best — Verified Picks"}
        </span>
      </div>
      <div
        style={{ display: "flex", gap: 10, overflowX: "auto", paddingLeft: 16, paddingRight: 16, scrollbarWidth: "none" }}
        className="[&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 220,
            background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14,
            border: `1.5px solid ${accentColor}44`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: accentColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0,
              }}>
                {item.rank}
              </div>
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <span style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13,
                color: "#ECFDF5", lineHeight: 1.3 }}>
                {lang === "ko" ? item.nameKo : item.nameEn}
              </span>
            </div>
            {item.rating && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>
                  {"★".repeat(Math.round(item.rating))} {item.rating}
                </span>
                {item.ratingCount && <span style={{ fontSize: 10, color: "rgba(236,253,245,0.4)" }}> ({item.ratingCount})</span>}
              </div>
            )}
            {item.price && (
              <div style={{ marginBottom: 6, fontSize: 11, color: accentColor, fontWeight: 700 }}>{item.price}</div>
            )}
            <div style={{ fontSize: 11, color: "rgba(236,253,245,0.65)", lineHeight: 1.5, marginBottom: 6 }}>
              {item.why}
            </div>
            {item.address && (
              <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginBottom: 6 }}>
                📍 {item.address.split(",")[0]}
              </div>
            )}
            {/* 링크 버튼 행 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
              {/* Google Maps */}
              {item.address && (
                <a href={`https://maps.google.com/?q=${encodeURIComponent(item.address)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none",
                    background: `${accentColor}18`, border: `1px solid ${accentColor}33`, borderRadius: 20, padding: "3px 8px" }}>
                  <span style={{ fontSize: 10 }}>📍</span>
                  <span style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>Google Maps</span>
                </a>
              )}
              {/* 전화 */}
              {item.phone && (
                <a href={`tel:${item.phone}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none",
                    background: `${accentColor}18`, border: `1px solid ${accentColor}33`, borderRadius: 20, padding: "3px 8px" }}>
                  <span style={{ fontSize: 10 }}>📞</span>
                  <span style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>전화</span>
                </a>
              )}
              {/* 공식 웹사이트 */}
              {item.website && (
                <a href={item.website.startsWith("http") ? item.website : `https://${item.website}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none",
                    background: "rgba(110,231,183,0.12)", border: "1px solid rgba(110,231,183,0.3)", borderRadius: 20, padding: "3px 8px" }}>
                  <span style={{ fontSize: 10 }}>🌐</span>
                  <span style={{ fontSize: 10, color: "#6EE7B7", fontWeight: 700 }}>공식 사이트</span>
                </a>
              )}
            </div>
            {item.tip && (
              <div style={{ marginTop: 6, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)",
                fontSize: 10, color: "rgba(236,253,245,0.55)", fontStyle: "italic" }}>
                💡 {item.tip}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENT: 설치 배너 (PWA InstallBanner)
───────────────────────────────────────── */
function InstallBanner({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <div style={{
      position: "fixed", top: 56, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 398,
      background: "linear-gradient(135deg, rgba(110,231,183,0.15), rgba(201,162,39,0.10))",
      border: "1px solid rgba(110,231,183,0.25)",
      borderRadius: 16, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      zIndex: 100, backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      <span style={{ fontSize: 28 }}>📱</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#e6edf3", fontFamily: "Manrope,sans-serif" }}>홈 화면에 추가하기</div>
        <div style={{ fontSize: 12, color: "rgba(230,237,243,0.6)", marginTop: 2, fontFamily: "Manrope,sans-serif" }}>
          오프라인에서도 사용 가능 · 공항에서도 OK
        </div>
      </div>
      <button onClick={onInstall} style={{
        background: MINT, color: "#0d1117", border: "none",
        borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13,
        cursor: "pointer", fontFamily: "Manrope,sans-serif", flexShrink: 0,
      }}>설치</button>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", color: "rgba(230,237,243,0.4)",
        fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1,
      }}>×</button>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENT: 오프라인 배너
───────────────────────────────────────── */
function OfflineBanner() {
  return (
    <div style={{
      position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)",
      background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
      borderRadius: 20, padding: "8px 16px",
      fontSize: 12, fontWeight: 600, color: MINT,
      zIndex: 90, backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      fontFamily: "Manrope,sans-serif",
      whiteSpace: "nowrap",
    }}>
      📡 오프라인 모드 — 저장된 정보 사용 중
    </div>
  );
}

/* ─────────────────────────────────────────
   HOOK: 체크리스트 localStorage 상태
───────────────────────────────────────── */
function useChecklist(itemId: string) {
  const key = `hg_checklist_${itemId}`;
  const [isDone, setIsDone] = useState(() => localStorage.getItem(key) === "1");

  const toggle = () => {
    const next = !isDone;
    setIsDone(next);
    if (next) {
      localStorage.setItem(key, "1");
    } else {
      localStorage.removeItem(key);
    }
  };

  return { isDone, toggle };
}

/* ─────────────────────────────────────────
   COMPONENT: 체크리스트 아이템
───────────────────────────────────────── */
interface ChecklistItemProps {
  itemId: string;
  title: string;
  desc: string;
  accentColor?: string;
  showReminder?: boolean;
}
function ChecklistItem({ itemId, title, desc, accentColor = MINT, showReminder = false }: ChecklistItemProps) {
  const { isDone, toggle } = useChecklist(itemId);
  const [reminderSet, setReminderSet] = useState(false);

  const handleReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await scheduleReminder(title, 30);
    setReminderSet(true);
  };

  return (
    <div
      onClick={toggle}
      style={{
        display: "flex", gap: 12, alignItems: "flex-start",
        padding: "14px 16px",
        background: isDone ? "rgba(110,231,183,0.08)" : "rgba(255,255,255,0.04)",
        borderRadius: 12,
        border: isDone ? "1px solid rgba(110,231,183,0.2)" : "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
        marginBottom: 10,
        transition: "all 0.2s ease",
      }}
    >
      {/* 체크박스 원형 */}
      <div style={{
        flexShrink: 0,
        width: 24, height: 24, borderRadius: "50%",
        background: isDone ? accentColor : "transparent",
        border: isDone ? `none` : `2px solid rgba(255,255,255,0.25)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 1, transition: "all 0.2s ease",
      }}>
        {isDone && <span style={{ color: "#0d1117", fontSize: 13, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: "#ECFDF5",
          textDecoration: isDone ? "line-through" : "none",
          opacity: isDone ? 0.6 : 1, marginBottom: 3, transition: "all 0.2s ease",
        }}>{title}</div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.65, color: "rgba(236,253,245,0.5)" }}>{desc}</div>
        {showReminder && !isDone && (
          <button
            onClick={handleReminder}
            style={{
              marginTop: 8, background: reminderSet ? "rgba(110,231,183,0.15)" : "rgba(255,255,255,0.06)",
              border: reminderSet ? `1px solid ${accentColor}44` : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, padding: "4px 10px", fontSize: 10, fontFamily: "Manrope,sans-serif",
              fontWeight: 600, color: reminderSet ? accentColor : "rgba(236,253,245,0.5)",
              cursor: "pointer",
            }}
          >
            {reminderSet ? "✓ 알림 설정됨" : "🔔 30일 후 알림 받기"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ICON COMPONENT
───────────────────────────────────────── */
interface IconBoxProps {
  pathKey: keyof typeof svgPaths;
  vb: string;
  fill?: string;
}
function IconBox({ pathKey, vb, fill = "#1B4332" }: IconBoxProps) {
  return (
    <svg fill="none" preserveAspectRatio="none" viewBox={vb} className="w-full h-full">
      <path d={svgPaths[pathKey]} fill={fill} />
    </svg>
  );
}

/* ─────────────────────────────────────────
   DUAL CLOCK WIDGET
───────────────────────────────────────── */
function DualClock() {
  const { lang } = useI18n();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fmtTime = (date: Date, tz: string) =>
    date.toLocaleTimeString(lang === "ko" ? "ko-KR" : "en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const fmtDate = (date: Date, tz: string) =>
    date.toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const seattleTime = fmtTime(now, "America/Los_Angeles");
  const seattleDate = fmtDate(now, "America/Los_Angeles");
  const koreaTime = fmtTime(now, "Asia/Seoul");
  const koreaDate = fmtDate(now, "Asia/Seoul");

  const label = {
    seattle: lang === "ko" ? "시애틀" : "Seattle",
    korea: lang === "ko" ? "한국" : "Korea",
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(201,162,39,0.07) 0%, rgba(110,231,183,0.05) 100%)",
        border: "1px solid rgba(201,162,39,0.18)",
        borderRadius: 14,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Seattle */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, paddingRight: 12, borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11 }}>🇺🇸</span>
          <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9, color: GOLD, letterSpacing: "0.6px", textTransform: "uppercase" }}>
            {label.seattle}
          </span>
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 15, color: "#ECFDF5", letterSpacing: "-0.3px", lineHeight: 1 }}>
          {seattleTime}
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "rgba(236,253,245,0.5)" }}>
          {seattleDate}
        </div>
      </div>

      {/* 시차 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 10px", gap: 1 }}>
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 8, color: "rgba(255,255,255,0.22)", letterSpacing: "0.4px" }}>
          {lang === "ko" ? "시차" : "GAP"}
        </span>
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 11, color: MINT }}>+17h</span>
      </div>

      {/* Korea */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11 }}>🇰🇷</span>
          <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9, color: MINT, letterSpacing: "0.6px", textTransform: "uppercase" }}>
            {label.korea}
          </span>
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 15, color: "#ECFDF5", letterSpacing: "-0.3px", lineHeight: 1 }}>
          {koreaTime}
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "rgba(236,253,245,0.5)" }}>
          {koreaDate}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTION DIVIDER
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   실시간 데이터 훅 (환율·기름값)
───────────────────────────────────────── */
function useLiveData() {
  const [rate, setRate] = useState<number | null>(null);
  const [rateTime, setRateTime] = useState("");
  const [gas, setGas] = useState<number | null>(null);
  const [gasDate, setGasDate] = useState("");
  const [rent, setRent] = useState<number | null>(null);
  const [tempF, setTempF] = useState<number | null>(null);

  // 환율: Frankfurter API (무료·키 불필요·CORS OK) — 30분마다 갱신
  useEffect(() => {
    const fetch환율 = async () => {
      try {
        const r = await fetch("https://api.frankfurter.app/latest?from=USD&to=KRW");
        const d = await r.json();
        setRate(Math.round(d.rates.KRW));
        setRateTime(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
      } catch { /* 네트워크 오류 시 조용히 무시 */ }
    };
    fetch환율();
    const id = setInterval(fetch환율, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // live.json: GitHub Actions 매일 갱신 (기름값·환율·렌트·기온)
  useEffect(() => {
    fetch("/data/live.json?t=" + Math.floor(Date.now() / 3_600_000))
      .then(r => r.json())
      .then(d => {
        setGas(d.gas_wa_regular ?? 4.15);
        setGasDate(d.updated ?? "");
        setRent(d.rent_seattle_1br ?? 2150);
        setTempF(d.temp_f ?? null);
      })
      .catch(() => { setGas(4.15); setRent(2150); });
  }, []);

  // 실시간 기온 (Open-Meteo, 무료·키 불필요)
  useEffect(() => {
    const fetchTemp = async () => {
      try {
        const r = await fetch(
          "https://api.open-meteo.com/v1/forecast" +
          "?latitude=47.6062&longitude=-122.3321" +
          "&current=temperature_2m&temperature_unit=fahrenheit" +
          "&timezone=America/Los_Angeles"
        );
        const d = await r.json();
        setTempF(Math.round(d.current.temperature_2m));
      } catch {}
    };
    fetchTemp();
    const id = setInterval(fetchTemp, 10 * 60 * 1000); // 10분마다
    return () => clearInterval(id);
  }, []);

  return { rate, rateTime, gas, gasDate, rent, tempF };
}

/* ─────────────────────────────────────────
   LIVE DATA BAR (환율·기름값·시각)
───────────────────────────────────────── */
function LiveDataBar() {
  const { lang } = useI18n();
  const city = useCityConfig();
  const { rate, rateTime, gas, gasDate, rent, tempF } = useLiveData();
  const [seoulTime, setSeoulTime] = useState("");
  const [cityTime, setCityTime] = useState("");

  // 도시별 타임존 매핑
  const CITY_TIMEZONE: Record<string, string> = {
    seattle: "America/Los_Angeles", dallas: "America/Chicago",
    sf: "America/Los_Angeles", newyork: "America/New_York",
    nashville: "America/Chicago", boston: "America/New_York",
    la: "America/Los_Angeles", toronto: "America/Toronto",
    vancouver: "America/Vancouver", houston: "America/Chicago",
    atlanta: "America/New_York", kansascity: "America/Chicago",
    philadelphia: "America/New_York", miami: "America/New_York",
    mexicocity: "America/Mexico_City", guadalajara: "America/Mexico_City",
    monterrey: "America/Monterrey",
  };

  // 도시별 시간 코드 (표시용)
  const CITY_TZ_CODE: Record<string, string> = {
    seattle: "SEA", dallas: "DAL", sf: "SFO", newyork: "NYC",
    nashville: "BNA", boston: "BOS", la: "LAX", toronto: "YYZ",
    vancouver: "YVR", houston: "HOU", atlanta: "ATL", kansascity: "MCI",
    philadelphia: "PHL", miami: "MIA", mexicocity: "MEX",
    guadalajara: "GDL", monterrey: "MTY",
  };

  const isSeattle = city.slug === "seattle";
  const timezone = CITY_TIMEZONE[city.slug] ?? "America/Los_Angeles";
  const tzCode = CITY_TZ_CODE[city.slug] ?? "LOC";

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCityTime(now.toLocaleTimeString("ko-KR", { timeZone: timezone, hour: "2-digit", minute: "2-digit" }));
      setSeoulTime(now.toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [timezone]);

  const items = [
    // 기온: 시애틀 전용 (실시간 WA 날씨 API)
    ...(isSeattle && tempF ? [{
      icon: "🌡️",
      label: lang === "ko" ? "시애틀 기온" : "Seattle Temp",
      value: `${tempF}°F`,
      sub: lang === "ko" ? "실시간" : "Live",
      color: "#F97316",
    }] : []),
    // 환율: 전 도시 공통 (한인 이민자 모두에게 유용)
    {
      icon: "💱",
      label: lang === "ko" ? "원/달러" : "KRW/USD",
      value: rate ? `₩${rate.toLocaleString()}` : "…",
      sub: rateTime ? (lang === "ko" ? `${rateTime} 갱신` : `${rateTime}`) : lang === "ko" ? "로딩 중" : "Loading",
      color: "#F2994A",
    },
    // 기름값: 시애틀/WA 전용
    ...(isSeattle ? [{
      icon: "⛽",
      label: lang === "ko" ? "WA 기름값" : "WA Gas",
      value: gas ? `$${gas.toFixed(2)}` : "…",
      sub: gasDate || "loading",
      color: "#60A5FA",
    }] : []),
    // 월세: 시애틀 전용 (다른 도시는 데이터 없음)
    ...(isSeattle && rent ? [{
      icon: "🏠",
      label: lang === "ko" ? "시애틀 월세" : "Seattle Rent",
      value: `$${rent.toLocaleString()}`,
      sub: lang === "ko" ? "1BR 중앙값" : "1BR median",
      color: MINT,
    }] : []),
    // 현지 시각 vs 서울: 전 도시 공통
    {
      icon: "🕐",
      label: lang === "ko" ? `${city.nameKo}·서울` : `${tzCode}·ICN`,
      value: cityTime || "…",
      sub: seoulTime ? `서울 ${seoulTime}` : "",
      color: "#C9A227",
    },
  ];

  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto",
      scrollbarWidth: "none", paddingBottom: 2,
    }}
    className="[&::-webkit-scrollbar]:hidden"
    >
      {items.map((item, i) => (
        <div key={i} style={{
          flex: "0 0 auto", minWidth: 110,
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${item.color}30`,
          borderRadius: 14, padding: "10px 12px",
          display: "flex", flexDirection: "column", gap: 3,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: "rgba(236,253,245,0.45)", fontFamily: "Manrope,sans-serif", fontWeight: 600 }}>
              {item.label}
            </span>
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 16, color: item.color, letterSpacing: "-0.3px" }}>
            {item.value}
          </div>
          {item.sub && (
            <div style={{ fontSize: 9, color: "rgba(236,253,245,0.35)", fontFamily: "Manrope,sans-serif" }}>
              {item.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="w-full h-px my-1" style={{
      background: "linear-gradient(90deg, transparent 0%, rgba(110,231,183,0.15) 30%, rgba(201,162,39,0.2) 60%, transparent 100%)"
    }} />
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
interface StatCardProps { label: string; value: string; icon?: React.ReactNode; }
function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="relative rounded-[16px] p-[16px] flex flex-col gap-[6px] transition-all duration-200 hover:scale-105" style={{
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 4px 24px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.08)"
    }}>
      <span className="uppercase tracking-[0.6px]" style={{ color: "rgba(236,253,245,0.6)", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9 }}>{label}</span>
      <div className="flex items-end gap-[5px]">
        <span style={{ color: "#ECFDF5", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 22, lineHeight: 1 }}>{value}</span>
        {icon && <span className="mb-[2px]">{icon}</span>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   WEATHER ICON
───────────────────────────────────────── */
function WeatherIcon() {
  return (
    <div style={{ width: 14, height: 14 }}>
      <IconBox pathKey="p2f20c300" vb="0 0 15.75 15.25" fill={MINT} />
    </div>
  );
}

/* ─────────────────────────────────────────
   NEW HOME: CompactHeroNew — 도시별 자동 적용
───────────────────────────────────────── */
// 도시별 LIVE CAM URL
const CITY_LIVECAM: Partial<Record<CitySlug, string>> = {
  seattle:  "https://www.earthcam.com/usa/washington/seattle/",
  dallas:   "https://www.earthcam.com/usa/texas/dallas/",
  sf:       "https://www.earthcam.com/usa/california/sanfrancisco/",
  newyork:  "https://www.earthcam.com/usa/newyork/timessquare/",
};

/* ─────────────────────────────────────────
   2026 FIFA 월드컵 환영 배너
   2026/6/11 ~ 2026/7/19 — 호스트 도시 11개 중 8개가 HebronGuide 도시
───────────────────────────────────────── */
const WORLD_CUP_2026 = {
  startDate: new Date("2026-06-01"),  // 1주일 전부터 노출
  endDate:   new Date("2026-07-26"),  // 1주일 후까지 유지
  hostCities: ["seattle", "la", "newyork", "dallas", "sf", "boston", "toronto", "vancouver",
               "houston", "atlanta", "kansascity", "philadelphia", "miami",
               "mexicocity", "guadalajara", "monterrey"] as CitySlug[],
};

function isWorldCupActive(slug: CitySlug): boolean {
  if (!WORLD_CUP_2026.hostCities.includes(slug)) return false;
  const now = new Date();
  return now >= WORLD_CUP_2026.startDate && now <= WORLD_CUP_2026.endDate;
}

function WorldCupBanner() {
  const { lang } = useI18n();
  const city = useCityConfig();

  if (!isWorldCupActive(city.slug)) return null;

  return (
    <div style={{
      margin: "12px 16px 0",
      background: "linear-gradient(135deg, #DC2626, #2563EB)",
      borderRadius: 14, padding: "14px 16px",
      boxShadow: "0 4px 16px rgba(220,38,38,0.25)",
      position: "relative", overflow: "hidden",
    }}>
      {/* 배경 장식 */}
      <div style={{
        position: "absolute", top: -20, right: -10, fontSize: 80,
        opacity: 0.12, fontWeight: 900,
      }}>⚽</div>

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <span style={{
            fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 11,
            color: "#fff", letterSpacing: "1px", opacity: 0.9,
          }}>FIFA WORLD CUP 2026</span>
        </div>
        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 800, fontSize: 16,
          color: "#fff", lineHeight: 1.3, marginBottom: 4,
        }}>
          {lang === "ko"
            ? `${city.nameKo}에 오신 것을 환영합니다! 🎉`
            : lang === "es"
            ? `¡Bienvenido a ${city.nameEn}! 🎉`
            : `Welcome to ${city.nameEn}! 🎉`}
        </div>
        <div style={{
          fontFamily: "Manrope, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.92)",
          lineHeight: 1.5,
        }}>
          {lang === "ko"
            ? "월드컵 응원하러 오신 분들께 — 한식당·교통·환전 정보를 한눈에"
            : lang === "es"
            ? "Comida coreana, transporte e información esencial — todo en un solo lugar"
            : "Korean food, transit, and essential info — all in one place"}
        </div>
      </div>
    </div>
  );
}

function CompactHeroNew() {
  const { lang } = useI18n();
  const city = useCityConfig();
  const liveCamUrl = CITY_LIVECAM[city.slug];

  return (
    <div style={{
      position: "relative", height: "clamp(120px, 22dvh, 180px)", overflow: "hidden",
      borderRadius: "0 0 28px 28px",
    }}>
      {/* 정적 이미지 폴백 */}
      <img src={imgHeroCard} alt={city.nameEn} style={{
        width: "100%", height: "100%", objectFit: "cover", objectPosition: heroPhotoPosition,
        filter: "brightness(0.75) saturate(1.2)"
      }} />
      {/* 도시별 배경 영상 */}
      {city.heroVideo && (
        <video autoPlay muted loop playsInline style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 35%",
        }}>
          <source src={city.heroVideo} type="video/mp4" />
        </video>
      )}
      {/* 그라디언트 오버레이 */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
      {/* 도시명 + 태그라인 */}
      <div style={{ position: "absolute", bottom: 20, left: 20, right: 60 }}>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 24, color: "#fff",
          letterSpacing: "-0.5px", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
          HebronGuide <span style={{ color: city.color }}>{lang === "ko" ? city.nameKo : city.nameEn}</span>
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>
          {lang === "ko" ? city.taglineKo : lang === "es" ? (city.taglineEs ?? city.taglineEn) : city.taglineEn}
        </div>
      </div>
      {/* LIVE CAM 버튼 */}
      {liveCamUrl && (
        <a href={liveCamUrl} target="_blank" rel="noopener noreferrer"
          style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 5,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "5px 10px",
            textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B30", display: "inline-block",
            animation: "livepulse 1.5s infinite" }} />
          <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10, color: "#fff" }}>LIVE CAM</span>
        </a>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   NEW HOME: QuickMenuSection
───────────────────────────────────────── */
// 탭 순서: 이민자·이주자·관광객·방문자 모두 포용 — 차별화 전략 반영
// 1.정착(Day-1 핵심) 2.맛집(모두 공통) 3.탐방(관광·방문) 4.거주지(이민) 5.생활비(참고) 6.취업 7.교육 8.도움 9.교회(편의점처럼 자연스럽게)
// Quick Menu 순서: 긴급성·사용빈도 기준 최적화
// 정착(Day-1) → 맛집(공통) → 관광(방문객) → 도움(긴급) → 거주지 → 취업 → 교육 → 생활비 → 교회(자연스러운 연결)
// Quick Menu 16개 — 이민자 여정 순서로 배치
// Row 1 (1-4):  도착 첫날 필수 — 정착·병원·거주지·면허
// Row 2 (5-8):  핵심 생활 — 교회·맛집·취업·교육
// Row 3 (9-12): 정보 참고 — 마트·생활비·비자·도움
// Row 4 (13-16): 심화 — 관광·세금·법률·한국학교
// 교회가 Row 2 첫 번째 = HebronGuide 방향(→교회→그리스도) 시각적으로 반영
const QUICK_MENU = [
  // Row 1: 도착 첫날 필수
  { icon: "plane-landing",  labelKo: "정착",    labelEn: "Settle",  color: "#F2994A", tab: 1, subTab: 0 },
  { icon: "heart-pulse",    labelKo: "병원",    labelEn: "Medical", color: "#EC4899", tab: 5, subTab: 1 },
  { icon: "home",           labelKo: "거주지",   labelEn: "Housing", color: "#10B981", tab: 1, subTab: 5 },
  { icon: "car",            labelKo: "면허",    labelEn: "DMV",     color: "#3B82F6", tab: 1, subTab: 3 },
  // Row 2: 핵심 생활
  { icon: "church",         labelKo: "교회",    labelEn: "Church",  color: "#7C3AED", tab: 2, subTab: 0 },
  { icon: "utensils",       labelKo: "맛집",    labelEn: "Food",    color: "#EF4444", tab: 3, subTab: 0 },
  { icon: "briefcase",      labelKo: "취업",    labelEn: "Jobs",    color: "#059669", tab: 6, subTab: 0 },
  { icon: "graduation-cap", labelKo: "교육",    labelEn: "Schools", color: "#8B5CF6", tab: 7, subTab: 0 },
  // Row 3: 정보 참고
  { icon: "shopping-cart",  labelKo: "마트",    labelEn: "Market",  color: "#F59E0B", tab: 3, subTab: 2 },
  { icon: "dollar-sign",    labelKo: "생활비",   labelEn: "Costs",   color: "#0EA5E9", tab: 8, subTab: 0 },
  { icon: "file-text",      labelKo: "비자·이민", labelEn: "Visa",    color: "#6366F1", tab: 1, subTab: 7 },
  { icon: "life-buoy",      labelKo: "도움",    labelEn: "Help",    color: "#DC2626", tab: 5, subTab: 0 },
  // Row 4: 심화 참고
  { icon: "map",            labelKo: "관광",    labelEn: "Tourism", color: "#06B6D4", tab: 4, subTab: 0 },
  { icon: "receipt",        labelKo: "세금신고",  labelEn: "Taxes",   color: "#F97316", tab: 8, subTab: 4 },
  { icon: "scale",          labelKo: "법률상담",  labelEn: "Legal",   color: "#64748B", tab: 5, subTab: 5 },
  { icon: "book-open",      labelKo: "한국학교",  labelEn: "K-School",color: "#BE185D", tab: 7, subTab: 5 },
];

/* ─────────────────────────────────────────
   홈 화면 서비스 광고 섹션
   한인 간 연결 · 커미션 수익 모델
───────────────────────────────────────── */
function HebronServicesAd({ lang, onNavigate }: { lang: string; onNavigate?: (tab: number, subTab?: number) => void }) {
  const ko = lang === "ko";
  // 커미션·퍼센트 표현 없음 — 내부 파트너십 (사용자에게 비노출)
  // 목적: 관계를 통해 자연스럽게 교회로 연결
  const SERVICES = [
    {
      icon: "🚗", color: "#3B82F6",
      nameKo: "헤브론 라이드", nameEn: "Hebron Ride",
      tagKo: "공항 픽업 · 일상 이동", tagEn: "Airport · Daily Rides",
      userKo: "한국어로 맞이하는 첫 이동", userEn: "Your first ride, in Korean",
      providerKo: "운전하며 섬기실 분 → 함께해요", providerEn: "Drive & serve → join us",
      tab: 1, subTab: 0,
    },
    {
      icon: "🏠", color: "#10B981",
      nameKo: "헤브론 스테이", nameEn: "Hebron Stay",
      tagKo: "단기 숙박 · 정착 동반", tagEn: "Short-term · Walk Together",
      userKo: "한인 가정에서 시작하는 정착", userEn: "Begin your new life in a Korean home",
      providerKo: "방을 나눠 섬기실 분 → 함께해요", providerEn: "Share your home → join us",
      tab: 1, subTab: 5,
    },
    {
      icon: "📚", color: "#8B5CF6",
      nameKo: "헤브론 튜터", nameEn: "Hebron Tutor",
      tagKo: "수학 · SAT · 한국어", tagEn: "Math · SAT · Korean",
      userKo: "한인 선배가 직접 가르칩니다", userEn: "Learn from Korean community mentors",
      providerKo: "가르치며 섬기실 분 → 함께해요", providerEn: "Teach & serve → join us",
      tab: 7, subTab: 0,
    },
    {
      icon: "🤝", color: "#F59E0B",
      nameKo: "헤브론 커넥트", nameEn: "Hebron Connect",
      tagKo: "친구 · 멘토 · 기도파트너", tagEn: "Friends · Mentors · Prayer",
      userKo: "44개 도시 한인을 만납니다", userEn: "Meet Koreans across 44 cities",
      providerKo: "멘토로 섬기실 분 → 함께해요", providerEn: "Mentor & serve → join us",
      tab: 5, subTab: 2,
    },
    {
      icon: "💍", color: "#EC4899",
      nameKo: "헤브론 매칭", nameEn: "Hebron Match",
      tagKo: "진지하고 따뜻한 만남", tagEn: "Thoughtful & Warm Connection",
      userKo: "같은 가치관의 사람을 만나고 싶으세요?", userEn: "Looking to meet someone who shares your values?",
      providerKo: "신중하게, 진심으로 연결합니다", providerEn: "Carefully and sincerely matched",
      tab: 2, subTab: 4,
    },
    {
      icon: "🧭", color: "#06B6D4",
      nameKo: "헤브론 관광", nameEn: "Hebron Tour",
      tagKo: "현지 한인이 직접 안내", tagEn: "Guided by Locals Who Lived Here",
      userKo: "관광안내소엔 없는 진짜 이야기", userEn: "Real stories you won't find in tourist guides",
      providerKo: "이 도시를 안내하고 싶으신 분 → 함께해요", providerEn: "Know this city well? → Join us",
      tab: 4, subTab: 4,
    },
  ];

  return (
    <div style={{ padding: "20px 16px 16px", background: "#1a2535" }}>
      {/* 섹션 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 900, fontSize: 15, color: "#ECFDF5", letterSpacing: "-0.3px" }}>
            🔗 {ko ? "헤브론 연결 서비스" : "Hebron Connect Services"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", marginTop: 2 }}>
            {ko ? "한인이 한인을 섬깁니다" : "Koreans serving Koreans"}
          </div>
        </div>
        <button
          onClick={() => onNavigate?.(2, 4)}
          style={{ background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.4)", color: "#C9A227", borderRadius: 20, padding: "5px 12px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>
          {ko ? "파트너 신청 →" : "Partner →"}
        </button>
      </div>

      {/* 서비스 카드 가로 스크롤 */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {SERVICES.map((svc, i) => (
          <div key={i}
            onClick={() => onNavigate?.(svc.tab, svc.subTab)}
            style={{ flexShrink: 0, width: 200, scrollSnapAlign: "start", cursor: "pointer" }}>
            <div style={{
              background: `linear-gradient(160deg, ${svc.color}20, ${svc.color}08)`,
              border: `1px solid ${svc.color}45`,
              borderRadius: 16, padding: "16px 14px",
              height: "100%",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = `${svc.color}80`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.borderColor = `${svc.color}45`; }}>

              {/* 아이콘 + 이름 */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{svc.icon}</span>
                <div>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 900, fontSize: 13, color: "#ECFDF5" }}>
                    {ko ? svc.nameKo : svc.nameEn}
                  </div>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: svc.color, fontWeight: 600, marginTop: 1 }}>
                    {ko ? svc.tagKo : svc.tagEn}
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div style={{ height: 1, background: `${svc.color}25`, marginBottom: 10 }} />

              {/* 사용자 / 제공자 */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(236,253,245,0.45)", marginBottom: 3, letterSpacing: "0.3px" }}>
                  {ko ? "필요하신 분" : "USERS"}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, fontWeight: 700, color: "#ECFDF5", lineHeight: 1.4 }}>
                  {ko ? svc.userKo : svc.userEn}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(236,253,245,0.45)", marginBottom: 3, letterSpacing: "0.3px" }}>
                  {ko ? "제공하실 분" : "PROVIDERS"}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, fontWeight: 700, color: svc.color, lineHeight: 1.4 }}>
                  {ko ? svc.providerKo : svc.providerEn}
                </div>
              </div>

              {/* CTA */}
              <div style={{ marginTop: 12, background: `${svc.color}18`, borderRadius: 8, padding: "7px 10px", textAlign: "center" }}>
                <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 11, color: svc.color }}>
                  {ko ? "자세히 보기 →" : "Learn More →"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 파트너십 메시지 */}
      <div style={{ marginTop: 12, background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>🙏</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 11, color: "#C9A227" }}>
            {ko ? "함께 섬기는 파트너십" : "Ministry Partnership"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(236,253,245,0.55)", marginTop: 2, lineHeight: 1.5 }}>
            {ko
              ? "모든 연결은 자연스럽게 교회와 공동체로 이어집니다 — \"나그네를 영접하였다\" 마25:35"
              : "Every connection naturally leads to church & community — \"I was a stranger and you welcomed me\" Matt 25:35"}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickMenuSection({ onNavigate }: { onNavigate?: (tab: number, subTab?: number) => void }) {
  const { lang } = useI18n();
  return (
    <div style={{ padding: "20px 20px 16px" }}>
      <div style={{
        fontFamily: "'Noto Sans KR', sans-serif",
        fontWeight: 700, fontSize: 15, color: "#1B2A4A",
        letterSpacing: "-0.3px", marginBottom: 18,
      }}>
        {lang === "ko" ? "바로 가기" : "Quick Access"}
      </div>
      {/* iPhone 홈 스크린 스타일 — 4열, 60px 아이콘 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", rowGap: 20, columnGap: 8 }}>
        {QUICK_MENU.map((item, i) => (
          <button key={i} onClick={() => onNavigate?.(item.tab, item.subTab)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            padding: 0, WebkitTapHighlightColor: "transparent",
          }}
          onTouchStart={e => { const el = e.currentTarget.querySelector('.qm-icon') as HTMLElement; if (el) el.style.transform = "scale(0.87)"; }}
          onTouchEnd={e => { const el = e.currentTarget.querySelector('.qm-icon') as HTMLElement; if (el) el.style.transform = "scale(1)"; }}
          >
            {/* 60×60 squircle — SVG 아이콘 꽉 채움 */}
            {(() => {
              const IconComp = QM_ICON_MAP[item.icon];
              return (
                <div className="qm-icon" style={{
                  width: 60, height: 60,
                  borderRadius: 14,
                  background: item.color,
                  boxShadow: `0 3px 10px ${item.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.12s ease",
                  flexShrink: 0,
                }}>
                  {IconComp && <IconComp size={30} color="#fff" strokeWidth={1.8} />}
                </div>
              );
            })()}
            {/* 라벨 */}
            <span style={{
              fontFamily: "-apple-system, 'SF Pro Text', 'Noto Sans KR', sans-serif",
              fontWeight: 400, fontSize: 11,
              color: "#3C3C43",
              letterSpacing: "-0.1px",
              textAlign: "center",
              lineHeight: 1.3,
              width: "100%",
            }}>
              {lang === "ko" ? item.labelKo : item.labelEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   NEW HOME: SettlementEssentialsSection
───────────────────────────────────────── */
// 정착 퀵카드 — 도시·주(州)별 맞춤 정보
function getSettleSteps(citySlug: string) {
  // 건강보험: 주(州)별 Medicaid 명칭
  const healthInsKo: Record<string, string> = {
    seattle: "WA Apple Health\n무료 가능",
    sf: "Medi-Cal\n무보험자 포함",
    la: "Medi-Cal\n무보험자 포함",
    boston: "MassHealth\n전주민 의무",
    newyork: "Medicaid NY\n소득기준 가능",
    toronto: "OHIP\n3개월후 무료",
    vancouver: "MSP\n3개월후 무료",
    dallas: "TML Health\n소득기준 확인",
    houston: "Texas Medicaid\n조건 제한적",
    atlanta: "Georgia Medicaid\n조건 확인",
    nashville: "TennCare\n조건 확인",
    philadelphia: "PA Medicaid\n소득기준 가능",
    miami: "Florida Medicaid\n조건 확인",
    mexicocity: "IMSS/ISSSTE\n사립병원 권장",
  };
  const healthInsEn: Record<string, string> = {
    seattle: "WA Apple Health\nFree option",
    sf: "Medi-Cal\nIncludes undocumented",
    la: "Medi-Cal\nIncludes undocumented",
    boston: "MassHealth\nAll residents",
    newyork: "Medicaid NY\nIncome-based",
    toronto: "OHIP — Free\nafter 3 months",
    vancouver: "MSP — Free\nafter 3 months",
    dallas: "TML Health\nCheck eligibility",
    houston: "Texas Medicaid\nLimited eligibility",
    atlanta: "GA Medicaid\nCheck eligibility",
    nashville: "TennCare\nCheck eligibility",
    philadelphia: "PA Medicaid\nIncome-based",
    miami: "FL Medicaid\nCheck eligibility",
    mexicocity: "Private insurance\nrecommended",
  };
  // 임시 숙소: 도시별 추천 지역
  const housingKo: Record<string, string> = {
    seattle: "에어비앤비\n린우드 권장",
    dallas: "에어비앤비\n캐롤튼 권장",
    sf: "에어비앤비\n산타클라라 권장",
    newyork: "에어비앤비\n플러싱(NJ) 권장",
    nashville: "에어비앤비\nAntioch 권장",
    boston: "에어비앤비\n올스턴 권장",
    la: "에어비앤비\n코리아타운 권장",
    toronto: "에어비앤비\n노스욕 권장",
    vancouver: "에어비앤비\n코퀴틀람 권장",
    houston: "에어비앤비\nBellaire 권장",
    atlanta: "에어비앤비\nDuluth 권장",
    mexicocity: "에어비앤비\nZona Rosa 권장",
  };
  const housingEn: Record<string, string> = {
    seattle: "Airbnb\nLynnwood area",
    dallas: "Airbnb\nCarrollton area",
    sf: "Airbnb\nSanta Clara area",
    newyork: "Airbnb\nFlushing/Fort Lee",
    nashville: "Airbnb\nAntioch area",
    boston: "Airbnb\nAllston area",
    la: "Airbnb\nKoreatown area",
    toronto: "Airbnb\nNorth York area",
    vancouver: "Airbnb\nCoquitlam area",
    houston: "Airbnb\nBellaire area",
    atlanta: "Airbnb\nDuluth/Gwinnett",
    mexicocity: "Airbnb\nZona Rosa area",
  };
  return [
    { num: "1", emoji: "📱", titleKo: "SIM 카드",  titleEn: "SIM Card",       descKo: "공항 T-Mobile\n$30/월",       descEn: "Airport T-Mobile\n$30/mo",                                  color: "#F2994A" },
    { num: "2", emoji: "🏠", titleKo: "임시 숙소", titleEn: "Housing",         descKo: housingKo[citySlug] ?? "에어비앤비\n한인타운 권장", descEn: housingEn[citySlug] ?? "Airbnb\nKoreatown area", color: "#7C3AED" },
    { num: "3", emoji: "🏦", titleKo: "은행 계좌", titleEn: "Bank Account",    descKo: "Chase 추천\n여권만 OK",       descEn: "Chase preferred\nPassport only",                             color: "#2563EB" },
    { num: "4", emoji: "🚗", titleKo: "운전면허", titleEn: "Driver License",   descKo: "한국어 필기\n가능",           descEn: "Korean test\navailable",                                     color: "#059669" },
    { num: "5", emoji: "📋", titleKo: "SSN 신청", titleEn: "Apply SSN",        descKo: "사회보장국\n입국10일후",       descEn: "Social Security\n10 days after",                             color: "#EF4444" },
    { num: "6", emoji: "💊", titleKo: "건강보험", titleEn: "Health Ins.",       descKo: healthInsKo[citySlug] ?? "건강보험\n소득기준 확인", descEn: healthInsEn[citySlug] ?? "Health insurance\nCheck eligibility", color: "#64748B" },
  ];
}

function SettlementEssentialsSection({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  const { lang } = useI18n();
  const city = useCityConfig();
  const SETTLE_STEPS = getSettleSteps(city.slug); // 도시별 맞춤 정착 카드
  return (
    <div style={{ padding: "16px 0 8px" }}>
      <div style={{ padding: "0 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontWeight: 700, fontSize: 15, color: "#1B2A4A", letterSpacing: "-0.3px",
        }}>
          ✅ {lang === "ko" ? "정착 필수" : "Settlement Essentials"}
        </div>
        <button onClick={() => onNavigate?.(1)} style={{
          background: "none", border: "none",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Noto Sans KR', sans-serif",
          fontWeight: 600,
          fontSize: 12, color: "#F2994A", cursor: "pointer" }}>
          {lang === "ko" ? "전체 보기 →" : "See all →"}
        </button>
      </div>
      {/* 2열 그리드 — 카드 간격 넓게, 내부는 꽉 차게 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16,
        padding: "0 16px" }}>
        {SETTLE_STEPS.map((step, i) => (
          <button key={i} onClick={() => onNavigate?.(1)} style={{
            background: "#FFFFFF", borderRadius: 14, padding: "12px 10px",
            display: "flex", flexDirection: "row", alignItems: "center", gap: 10,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            cursor: "pointer", textAlign: "left",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, background: step.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>
              {step.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "-apple-system, 'Noto Sans KR', sans-serif",
                fontWeight: 700, fontSize: 12,
                color: "#1B2A4A", marginBottom: 2 }}>
                {lang === "ko" ? step.titleKo : step.titleEn}
              </div>
              <div style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 10, color: "#64748B",
                lineHeight: 1.4, whiteSpace: "pre-line" }}>
                {lang === "ko" ? step.descKo : step.descEn}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HERO CARD (HD 영상 배경 + 라이브 데이터) — 기존 유지 (홈에서 미사용)
───────────────────────────────────────── */
// Pexels 무료 시애틀 HD 영상 (Pexels License — 상업적 무료 사용 가능)
const SEATTLE_VIDEOS = [
  "https://videos.pexels.com/video-files/20017409/20017409-hd_1920_1080_24fps.mp4",  // Space Needle 스카이라인
  "https://videos.pexels.com/video-files/2257258/2257258-hd_1920_1080_30fps.mp4",    // 시애틀 파노라마
  "https://videos.pexels.com/video-files/29024579/29024579-hd_1920_1080_25fps.mp4",  // 스페이스 니들 석양
];

function HeroCard() {
  const { t } = useI18n();
  const [videoReady, setVideoReady] = useState(false);
  const [vidIdx, setVidIdx] = useState(0);

  const handleVideoError = () => {
    if (vidIdx < SEATTLE_VIDEOS.length - 1) setVidIdx(i => i + 1);
  };

  return (
    <div className="relative w-full overflow-hidden"
      style={{ height: 480, borderRadius: 28, background: "#060d18",
        boxShadow: "0 32px 64px -12px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)" }}>

      {/* 정적 이미지 폴백 (영상 로딩 전) */}
      <img
        src={imgHeroCard} alt="시애틀 전경"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: heroPhotoPosition, filter: "brightness(1.05) saturate(1.3)",
          transition: "opacity 1.5s ease", opacity: videoReady ? 0 : 1 }}
      />

      {/* HD 영상 배경 (Pexels — autoplay, muted, loop) */}
      <video
        key={vidIdx}
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 30%", transition: "opacity 1.5s ease",
          opacity: videoReady ? 1 : 0 }}
        onCanPlay={() => setVideoReady(true)}
        onError={handleVideoError}
      >
        <source src={SEATTLE_VIDEOS[vidIdx]} type="video/mp4" />
      </video>

      {/* 실제 라이브 웹캠 링크 배지 */}
      <a
        href="https://www.earthcam.com/usa/washington/seattle/"
        target="_blank" rel="noopener noreferrer"
        style={{
          position: "absolute", top: 14, right: 14, zIndex: 10,
          display: "flex", alignItems: "center", gap: 5,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
          borderRadius: 20, padding: "5px 11px",
          border: "1px solid rgba(255,255,255,0.15)",
          textDecoration: "none",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF3B30",
          display: "inline-block", animation: "livepulse 1.5s infinite" }} />
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10,
          color: "#fff", letterSpacing: 0.5 }}>라이브 웹캠 →</span>
      </a>

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0" style={{ background:
        "linear-gradient(180deg, rgba(5,15,40,0.15) 0%, transparent 35%, rgba(2,14,8,0.85) 100%)" }} />

      {/* 텍스트 & 스탯 */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-[20px] p-[28px]">
        <div className="flex flex-col gap-[6px]">
          <div className="self-start px-[10px] py-[3px] rounded-[10px]"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.15)" }}>
            <span className="uppercase tracking-[1.2px]"
              style={{ color: "#ECFDF5", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9 }}>
              {t("hero.badge")}
            </span>
          </div>
          <h1 className="m-0 p-0" style={{ fontFamily: "'Noto Sans KR','WenQuanYi Zen Hei',sans-serif",
            fontWeight: 700, fontSize: 38, letterSpacing: "-1.5px", lineHeight: 1.18,
            color: "#FFFFFF", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>
            {t("hero.title")}
          </h1>
          <p className="m-0 uppercase tracking-[0.5px]"
            style={{ fontFamily: "Manrope,sans-serif", fontWeight: 300, fontSize: 12,
              color: "rgba(209,250,229,0.65)" }}>
            {t("hero.sub")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
          <a href="https://forecast.weather.gov/MapClick.php?CityName=Seattle&state=WA&site=SEW"
            target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <StatCard label={t("stat.temp")} value="52°F" icon={<WeatherIcon />} />
          </a>
          <StatCard label={t("stat.pop")} value="762K" />
          <StatCard label={t("stat.rent")} value="$2.2K" />
          <StatCard label={t("stat.community")} value="165K+" />
        </div>
      </div>

      <style>{`@keyframes livepulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.8)} }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   CATEGORY ITEM
───────────────────────────────────────── */
interface CategoryItemProps {
  label: string;
  pathKey: keyof typeof svgPaths;
  vb: string;
  active?: boolean;
  onClick?: () => void;
}
function CategoryItem({ label, pathKey, vb, active = false, onClick }: CategoryItemProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[8px] cursor-pointer border-0 bg-transparent p-0 hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-center" style={{
        width: 60, height: 60, borderRadius: 18,
        background: active ? "rgba(110,231,183,0.12)" : "#273444",
        boxShadow: active ? `0 0 0 1.5px ${MINT}, 0 4px 12px rgba(0,0,0,0.1)` : "0 2px 8px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        border: active ? `1.5px solid ${MINT}` : "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.2s ease"
      }}>
        <div style={{ width: 24, height: 24 }}>
          <IconBox pathKey={pathKey} vb={vb} fill={active ? MINT : "rgba(236,253,245,0.6)"} />
        </div>
      </div>
      <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 11, color: active ? MINT : "rgba(236,253,245,0.5)", transition: "color 0.2s ease" }}>
        {label}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────
   SETTLE FIRST SECTION (홈 탭용)
───────────────────────────────────────── */
function SettleFirstSection({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  const { t } = useI18n();
  return (
    <section className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[10px]">
        <div className="pl-[12px]" style={{ borderLeft: `3px solid ${GOLD}` }}>
          <h2 className="m-0" style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: "#ECFDF5" }}>
            {t("settle.title")}
          </h2>
        </div>
        <div className="px-[10px] py-[3px] rounded-[10px]" style={{ border: `1px solid rgba(110,231,183,0.3)`, background: "rgba(110,231,183,0.08)" }}>
          <span className="uppercase tracking-[0.5px]" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 10, color: MINT }}>
            {t("settle.badge")}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-[12px] gap-y-[16px]">
        <CategoryItem label={t("cat.visa")}    pathKey="p2ce24f80" vb="0 0 18.75 23.75" active onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.housing")} pathKey="p3b345300" vb="0 0 18.75 21.12"        onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.schools")} pathKey="p193ae400" vb="0 0 24.9 20.34"         onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.license")} pathKey="p345dc3a0" vb="0 0 23.75 18.75"        onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.jobs")}    pathKey="p1da64f00" vb="0 0 23.75 21.875"       onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.health")}  pathKey="p3c213f80" vb="0 0 23.75 23.125"       onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.markets")} pathKey="p2de11280" vb="0 0 24.53 21.875"       onClick={() => onNavigate?.(3)} />
        <CategoryItem label={t("cat.bank")}    pathKey="p3c662d00" vb="0 0 23.08 23.678"       onClick={() => onNavigate?.(1)} />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   BAR CHART DECOR
───────────────────────────────────────── */
function BarChartDecor() {
  const bars = [3, 5, 7, 5, 6, 8, 4];
  const max = 8;
  return (
    <div className="flex items-end gap-[3px]" style={{ height: 20 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: 4, height: (h / max) * 20, borderRadius: 2, background: `linear-gradient(180deg, ${GOLD} 0%, rgba(201,162,39,0.4) 100%)` }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   ARTICLE CARD
───────────────────────────────────────── */
interface ArticleCardProps {
  imageSrc: string;
  category: string;
  title: string;
  excerpt: string;
  readTime?: string;
  isLarge?: boolean;
}
function ArticleCard({ imageSrc, category, title, excerpt, readTime = "5분", isLarge = false }: ArticleCardProps) {
  const { t } = useI18n();
  return (
    <div className="relative overflow-hidden flex flex-col" style={{ borderRadius: 20, background: "#212d3d", boxShadow: "0 8px 32px rgba(255,255,255,0.08), 0 2px 8px rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="relative overflow-hidden" style={{ height: isLarge ? 220 : 160 }}>
        <ImageWithFallback src={imageSrc} alt={title} className="w-full h-full object-cover" style={{ transition: "transform 0.4s ease" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(1,22,13,0.6) 70%, rgba(1,22,13,0.95) 100%)" }} />
        <div className="absolute bottom-[12px] left-[14px]">
          <div className="px-[10px] py-[3px] rounded-[10px]" style={{ background: "rgba(185,236,238,0.55)", backdropFilter: "blur(8px)" }}>
            <span className="uppercase tracking-[0.8px]" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9, color: "#356668" }}>{category}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[8px] px-[16px] py-[14px]">
        <h3 className="m-0" style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: isLarge ? 700 : 600, fontSize: isLarge ? 18 : 15, lineHeight: 1.45, color: "#ECFDF5", letterSpacing: "-0.3px" }}>{title}</h3>
        <p className="m-0" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 400, fontSize: 12, lineHeight: 1.6, color: "rgba(236,253,245,0.5)" }}>{excerpt}</p>
        <div className="flex items-center gap-[6px] mt-[2px]">
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD }} />
          <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 10, color: "rgba(201,162,39,0.75)" }}>{readTime}{t("readtime.suffix")}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   LIFESTYLE TIPS SECTION
───────────────────────────────────────── */
function LifestyleTipsSection() {
  const { t } = useI18n();
  const articles = [
    { imageSrc: imgCoffee, category: t("article1.cat"), title: t("article1.title"), excerpt: t("article1.excerpt"), readTime: t("article1.read"), isLarge: true },
    { imageSrc: imgLifestyle, category: t("article2.cat"), title: t("article2.title"), excerpt: t("article2.excerpt"), readTime: t("article2.read"), isLarge: false },
  ];
  return (
    <section className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[12px]">
        <BarChartDecor />
        <div className="pl-[12px]" style={{ borderLeft: `3px solid ${GOLD}` }}>
          <h2 className="m-0" style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: "#ECFDF5" }}>
            {t("tips.title")}
          </h2>
        </div>
        <span className="uppercase tracking-[0.5px] self-end mb-[2px]" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 10, color: "rgba(201,162,39,0.65)" }}>
          {t("tips.sub")}
        </span>
      </div>
      <div className="flex flex-col gap-[14px]">
        {articles.map((a, i) => <ArticleCard key={i} {...a} />)}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   QUICK CHIPS
───────────────────────────────────────── */
function QuickChips() {
  const { t } = useI18n();
  const chipKeys = ["chip.all", "chip.visa", "chip.housing", "chip.school", "chip.jobs", "chip.community"] as const;
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-[8px] overflow-x-auto pb-[2px]" style={{ scrollbarWidth: "none" }}>
      {chipKeys.map((key, i) => (
        <button key={i} onClick={() => setActive(i)} className="flex-shrink-0 px-[14px] py-[6px] rounded-[20px] border-0 cursor-pointer hover:scale-105 active:scale-95"
          style={{ background: i === active ? `rgba(201,162,39,0.15)` : "rgba(255,255,255,0.04)", border: `1px solid ${i === active ? "rgba(201,162,39,0.5)" : "rgba(255,255,255,0.08)"}`, fontFamily: "Manrope,sans-serif", fontWeight: i === active ? 700 : 500, fontSize: 12, color: i === active ? GOLD : "rgba(236,253,245,0.5)", transition: "all 0.2s ease" }}>
          {t(key)}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   ANNOUNCEMENT BANNER
───────────────────────────────────────── */
function AnnouncementBanner() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-[10px] px-[14px] py-[10px] rounded-[14px]" style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.12) 0%, rgba(201,162,39,0.06) 100%)", border: "1px solid rgba(201,162,39,0.25)" }}>
      <span style={{ fontSize: 14 }}>📢</span>
      <div className="flex flex-col gap-[1px] flex-1 min-w-0">
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: GOLD }}>{t("announce.tag")} · {t("announce.title")}</span>
        <span className="truncate" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 400, fontSize: 10, color: "rgba(201,162,39,0.65)" }}>{t("announce.body")}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ── SHARED SCREEN COMPONENTS ──────────────
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   SCREEN HEADER (각 탭 상단 제목 영역)
───────────────────────────────────────── */
interface ScreenHeaderProps {
  emoji: string;
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
  accentColor: string;
}
function ScreenHeader({ emoji, titleKo, titleEn, descKo, descEn, accentColor }: ScreenHeaderProps) {
  const { lang } = useI18n();
  return (
    <div className="px-[20px] pt-[24px] pb-[20px]" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-[14px]">
        <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 16, background: `${accentColor}22`, border: `1px solid ${accentColor}44`, fontSize: 26 }}>
          {emoji}
        </div>
        <div>
          <h2 className="m-0" style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "-0.5px", color: "#ECFDF5" }}>
            {lang === "ko" ? titleKo : titleEn}
          </h2>
          <p className="m-0 mt-[3px]" style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)" }}>
            {lang === "ko" ? descKo : descEn}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SUB TAB BAR (탭 안의 서브탭)
───────────────────────────────────────── */
function SubTabBar({ tabs, active, onChange, accentColor = "rgba(255,255,255,0.9)" }: { tabs: string[]; active: number; onChange: (i: number) => void; accentColor?: string }) {
  return (
    <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      {tabs.map((tab, i) => (
        <button key={i} onClick={() => onChange(i)} className="flex-shrink-0 border-0 cursor-pointer hover:opacity-80"
          style={{ padding: "10px 16px", background: "transparent", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: i === active ? "#ECFDF5" : "rgba(236,253,245,0.5)", borderBottom: i === active ? `2px solid ${accentColor}` : "2px solid transparent", whiteSpace: "nowrap", transition: "all 0.2s ease" }}>
          {tab}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   INFO CARD (정보 카드 — 범용)
───────────────────────────────────────── */
interface InfoCardProps {
  title: string;
  accentColor?: string;
  children: React.ReactNode;
}
function InfoCard({ title, accentColor = "rgba(255,255,255,0.25)", children }: InfoCardProps) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, marginBottom: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${accentColor}` }}>
      {title && (
        <div style={{ padding: "14px 18px 10px" }}>
          <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 800, fontSize: 14, color: "#ECFDF5", letterSpacing: "-0.2px" }}>{title}</div>
        </div>
      )}
      <div style={{ padding: title ? "0 18px 16px" : "16px 18px" }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   STEP ITEM (순서가 있는 체크리스트)
───────────────────────────────────────── */
function StepItem({ num, title, desc, accentColor = MINT }: { num: number; title: string; desc: string; accentColor?: string }) {
  return (
    <div className="flex gap-[12px]" style={{ marginBottom: 14 }}>
      <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: "50%", background: `${accentColor}22`, border: `1px solid ${accentColor}55`, marginTop: 1 }}>
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 11, color: accentColor }}>{num}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: "#ECFDF5", marginBottom: 3 }}>{title}</div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.65, color: "rgba(236,253,245,0.6)" }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PLACE CARD (맛집·탐방 카드)
───────────────────────────────────────── */
// desc 텍스트에서 📍주소·📞전화를 추출해 Maps/전화 링크로 변환
// 지도: Google Maps (범용) + Apple Maps (iPhone 네이티브) 동시 제공
function renderDescWithLinks(desc: string, accentColor: string) {
  const addrMatch  = desc.match(/📍\s*([^|📞🔗\n]+)/);
  const phoneMatch = desc.match(/📞\s*([\d\s\-()+]+)/);
  // 🔗 뒤에 오는 URL 또는 도메인 감지 (공식 웹사이트)
  const webMatch   = desc.match(/🔗\s*(https?:\/\/[\w\-\.\/\?=&%#]+|[\w\-]+\.[\w]{2,}[\w\/\-\.]*)/i);
  const addr  = addrMatch  ? addrMatch[1].trim()  : null;
  const phone = phoneMatch ? phoneMatch[1].trim()  : null;
  const web   = webMatch   ? webMatch[1].trim()    : null;
  const webHref = web ? (web.startsWith("http") ? web : `https://${web}`) : null;

  // 지도 URL — Google Maps (범용, 한인 업소 정보 가장 풍부)
  const googleMapsUrl = addr ? `https://maps.google.com/?q=${encodeURIComponent(addr)}` : null;

  // 아이콘들 제거한 순수 설명 텍스트
  const cleanDesc = desc
    .replace(/📍[^|📞🔗\n]+/g, "")
    .replace(/📞[\d\s\-()+]+/g, "")
    .replace(/🔗\s*(https?:\/\/[\w\-\.\/\?=&%#]+|[\w\-]+\.[\w]{2,}[\w\/\-\.]*)/ig, "")
    .replace(/\|\s*\|/g, "|").replace(/^\|+|\|+$/g, "").trim();

  return (
    <div>
      {cleanDesc && (
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.6, color: "rgba(236,253,245,0.6)", marginTop: 5, whiteSpace: "pre-wrap" }}>
          {cleanDesc}
        </div>
      )}
      {/* 링크 버튼 행 */}
      {(addr || phone || webHref) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>

          {/* Google Maps 버튼 */}
          {googleMapsUrl && (
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none",
                background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
                borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ fontSize: 11 }}>📍</span>
              <span style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>Google Maps</span>
            </a>
          )}

          {/* 전화 버튼 */}
          {phone && (
            <a href={`tel:${phone.replace(/\D/g, "")}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none",
                background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
                borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ fontSize: 11 }}>📞</span>
              <span style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>{phone.trim().replace(/^\(/, "").split(")")[0].trim()}</span>
            </a>
          )}

          {/* 공식 웹사이트 버튼 */}
          {webHref && (
            <a href={webHref} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none",
                background: "rgba(110,231,183,0.12)", border: "1px solid rgba(110,231,183,0.3)",
                borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ fontSize: 11 }}>🌐</span>
              <span style={{ fontSize: 10, color: "#6EE7B7", fontWeight: 700 }}>공식 웹사이트</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function PlaceCard({ emoji, name, nameEn, desc, tags, accentColor = MINT }: { emoji: string; name: string; nameEn?: string; desc: string; tags?: string[]; accentColor?: string }) {
  return (
    <div className="transition-all duration-200 hover:scale-[1.02] hover:border-opacity-20" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start gap-[12px]">
        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: `${accentColor}18`, fontSize: 20 }}>
          {emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14, color: "#ECFDF5" }}>{name}</div>
          {nameEn && <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{nameEn}</div>}
          {renderDescWithLinks(desc, accentColor)}
          {tags && (
            <div className="flex flex-wrap gap-[5px] mt-[8px]">
              {tags.map((tag, i) => (
                <span key={i} style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}33`, color: accentColor, borderRadius: 8, padding: "2px 8px", fontSize: 10, fontFamily: "Manrope,sans-serif", fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   EMERGENCY ROW
───────────────────────────────────────── */
function EmergencyRow({ emoji, title, number, desc }: { emoji: string; title: string; number: string; desc: string }) {
  return (
    <a href={`tel:${number.replace(/\D/g, "")}`} className="transition-colors duration-200 hover:bg-[rgba(248,113,113,0.08)]" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14, color: "#ECFDF5" }}>{title}</div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 16, color: "#F87171" }}>{number}</div>
    </a>
  );
}

/* ─────────────────────────────────────────
   BACK BUTTON (섹션 화면 상단 홈 복귀)
   — 언제 어디서든 홈으로 돌아올 수 있는 길
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   헤브론 서비스 카드 — 각 탭에 자연스럽게 삽입
   서비스들은 한 곳에 모으지 않고 맥락에 맞는 탭에 분산 배치
───────────────────────────────────────── */
function HebronServiceCard({ icon, titleKo, titleEn, descKo, descEn, color, lang }: {
  icon: string; titleKo: string; titleEn: string;
  descKo: string; descEn: string; color: string; lang: string;
}) {
  const ko = lang === "ko";
  return (
    <a href={`mailto:gmc.hc300@gmail.com?subject=HebronGuide ${titleEn} 관심 등록`}
      style={{ display: "block", textDecoration: "none", marginTop: 16 }}>
      <div style={{
        background: `linear-gradient(135deg, ${color}12, ${color}06)`,
        border: `1px solid ${color}35`,
        borderRadius: 14, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 12,
        transition: "all 0.15s",
      }}
        onMouseEnter={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${color}20, ${color}10)`)}
        onMouseLeave={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${color}12, ${color}06)`)}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#ECFDF5" }}>
              {ko ? titleKo : titleEn}
            </span>
            <span style={{ background: `${color}25`, border: `1px solid ${color}50`, color: color, borderRadius: 10, padding: "1px 7px", fontSize: 9, fontWeight: 700 }}>
              {ko ? "준비 중" : "Coming Soon"}
            </span>
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.65)", lineHeight: 1.5 }}>
            {ko ? descKo : descEn}
          </div>
        </div>
        <span style={{ color: color, fontSize: 16, flexShrink: 0 }}>→</span>
      </div>
    </a>
  );
}

function BackToHomeButton({ onHome, lang }: { onHome?: () => void; lang: string }) {
  // 하단 네비바에서 홈 이동 가능 — 별도 버튼 불필요 (공간 절약)
  return null;
  if (!onHome) return null;
  return (
    <button
      onClick={onHome}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 16px",
        background: "rgba(242,153,74,0.08)",
        border: "none",
        borderBottom: "1px solid rgba(242,153,74,0.15)",
        cursor: "pointer",
        width: "100%",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(242,153,74,0.15)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(242,153,74,0.08)")}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: "rgba(242,153,74,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0,
      }}>🏠</div>
      <div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#F2994A" }}>
          {lang === "ko" ? "← 홈으로" : "← Home"}
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(242,153,74,0.6)", marginTop: 1 }}>
          HebronGuide
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────
   FLOATING HOME BUTTON
   — 어느 탭에 있든 항상 홈으로 돌아올 수 있는 고정 버튼
───────────────────────────────────────── */
function FloatingHomeButton({ activeNav, onHome }: { activeNav: number; onHome: () => void }) {
  if (activeNav === 0) return null; // 홈 화면에서는 숨김
  return (
    <button
      onClick={onHome}
      style={{
        position: "fixed",
        bottom: 90,        // 바텀 네비 위
        right: 16,
        zIndex: 200,
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "#F2994A",
        border: "none",
        boxShadow: "0 4px 16px rgba(242,153,74,0.45)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(242,153,74,0.6)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(242,153,74,0.45)";
      }}
      title="홈으로"
    >
      🏠
    </button>
  );
}

/* ═══════════════════════════════════════════
   ── TAB SCREENS ───────────────────────────
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   APP GRID (홈 스크린 앱 런처)
───────────────────────────────────────── */
interface AppGridItem {
  emoji: string;
  label: string;
  labelEn: string;
  tabIndex: number;
  color: string;
}

const APP_GRID_ITEMS: AppGridItem[] = [
  { emoji: "🛬", label: "정착 가이드",  labelEn: "Settlement",  tabIndex: 1, color: "#60A5FA" },
  { emoji: "⛪", label: "교회 찾기",   labelEn: "Churches",    tabIndex: 2, color: "#C084FC" },
  { emoji: "🍽️", label: "맛집·카페",  labelEn: "Dining",      tabIndex: 3, color: "#FB923C" },
  { emoji: "🗺️", label: "관광",   labelEn: "Tourism",     tabIndex: 4, color: "#34D399" },
  { emoji: "🆘", label: "도움·지원",   labelEn: "Help",        tabIndex: 5, color: "#F87171" },
  { emoji: "💼", label: "취업 정보",   labelEn: "Jobs",        tabIndex: 6, color: "#FBBF24" },
  { emoji: "🎓", label: "교육·학군",   labelEn: "Education",   tabIndex: 7, color: "#A78BFA" },
  { emoji: "💰", label: "생활비",      labelEn: "Living Cost", tabIndex: 8, color: "#34D399" },
];

function AppGrid({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  const { lang } = useI18n();
  return (
    <section>
      <div className="flex items-center gap-[10px] mb-4">
        <div className="pl-[12px]" style={{ borderLeft: `3px solid ${MINT}` }}>
          <h2 className="m-0" style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px", color: "#ECFDF5" }}>
            {lang === "ko" ? "빠른 메뉴" : "Quick Access"}
          </h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {APP_GRID_ITEMS.map((item) => (
          <button
            key={item.tabIndex}
            onClick={() => onNavigate?.(item.tabIndex)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "14px 8px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${item.color}22`,
              borderRadius: 16, cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${item.color}14`; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `${item.color}18`,
              border: `1px solid ${item.color}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>
              {item.emoji}
            </div>
            <span style={{
              fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 600, fontSize: 10,
              color: "rgba(236,253,245,0.75)", textAlign: "center", lineHeight: 1.3,
            }}>
              {lang === "ko" ? item.label : item.labelEn}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TOP 3 동네 (2026 최신)
───────────────────────────────────────── */
function Top3NeighborhoodsSection() {
  const { lang } = useI18n();
  const hoods = [
    {
      rank: 1,
      emoji: "🏆",
      nameKo: "린우드 (Lynnwood)",
      nameEn: "Lynnwood — Korean Town",
      img: imgLynnwood,
      tagKo: "한인 1번지",
      tagEn: "Koreatown Hub",
      color: "#F2994A",
      pointsKo: [
        "H-Mart · 한식당 · 한인 교회 밀집",
        "링크 라이트레일 직결 (2024 개통)",
        "렌트 1BR $1,800–2,100 (시애틀比 저렴)",
        "Northshore SD — 한인 가족 최다 밀집 학군",
      ],
      pointsEn: [
        "H-Mart · Korean restaurants · churches nearby",
        "Link Light Rail direct (opened 2024)",
        "Rent 1BR $1,800–2,100 (cheaper than Seattle)",
        "Northshore SD — highest Korean family concentration",
      ],
    },
    {
      rank: 2,
      emoji: "⭐",
      nameKo: "보텔·우딘빌 (Bothell)",
      nameEn: "Bothell / Woodinville",
      img: imgBothell,
      tagKo: "학군 + 자연",
      tagEn: "Schools + Nature",
      color: "#6EE7B7",
      pointsKo: [
        "Northshore SD — Inglemoor·Bothell HS (Niche A)",
        "한인 가족 급성장 지역 (2023→2026 +18%)",
        "렌트 1BR $1,900–2,300",
        "I-405 · SR-522 접근 편리",
      ],
      pointsEn: [
        "Northshore SD — Inglemoor & Bothell HS (Niche A)",
        "Korean family growth area (+18% since 2023)",
        "Rent 1BR $1,900–2,300",
        "Easy I-405 & SR-522 access",
      ],
    },
    {
      rank: 3,
      emoji: "💎",
      nameKo: "벨뷰 (Bellevue)",
      nameEn: "Bellevue — Tech & Schools",
      img: imgBellevue,
      tagKo: "테크 · 최상위 학군",
      tagEn: "Tech · Top Schools",
      color: "#60A5FA",
      pointsKo: [
        "Bellevue SD — 워싱턴주 1위 학군 (Niche A+)",
        "Amazon·Microsoft·Google 출퇴근 최적",
        "렌트 1BR $2,300–2,900 (프리미엄)",
        "한인 인구 급증 — 한식당·카페 확장 중",
      ],
      pointsEn: [
        "Bellevue SD — WA #1 school district (Niche A+)",
        "Optimal for Amazon·Microsoft·Google commute",
        "Rent 1BR $2,300–2,900 (premium)",
        "Korean population surging — more restaurants & cafés",
      ],
    },
  ];

  return (
    <section>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 18, color: "#e6edf3", letterSpacing: "-0.5px" }}>
          🏘️ {lang === "ko" ? "살기 좋은 동네 Top 3" : "Best Neighborhoods Top 3"}
        </div>
        <div style={{ fontSize: 12, color: "rgba(230,237,243,0.5)", marginTop: 4 }}>
          {lang === "ko" ? "2026년 Korean American 추천 기준" : "2026 picks for Korean Americans"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {hoods.map((h) => (
          <div key={h.rank} style={{
            borderRadius: 20, overflow: "hidden",
            border: `1px solid ${h.color}33`,
            background: "rgba(255,255,255,0.03)",
          }}>
            {/* 사진 */}
            <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
              <img src={h.img} alt={h.nameKo} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(13,17,23,0.85) 100%)" }} />
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{h.emoji}</span>
                <span style={{ background: h.color, color: "#0d1117", fontWeight: 800, fontSize: 11, padding: "3px 10px", borderRadius: 20 }}>
                  #{h.rank} {lang === "ko" ? h.tagKo : h.tagEn}
                </span>
              </div>
              <div style={{ position: "absolute", bottom: 12, left: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.4px" }}>
                  {lang === "ko" ? h.nameKo : h.nameEn}
                </div>
              </div>
            </div>
            {/* 포인트 */}
            <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              {(lang === "ko" ? h.pointsKo : h.pointsEn).map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: h.color, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: "rgba(230,237,243,0.75)", lineHeight: 1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* 2026 생활 팁 */}
      <div style={{
        marginTop: 16, padding: "14px 16px", borderRadius: 16,
        background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.15)",
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: MINT, marginBottom: 8 }}>
          💡 {lang === "ko" ? "2026 시애틀 생활 팁" : "2026 Seattle Living Tips"}
        </div>
        {(lang === "ko" ? [
          "📡 링크 라이트레일 린우드역 개통 — SeaTac↔린우드 직결 (52분)",
          "💵 시애틀 최저시급 $20.76/시 (2026) — WA 소득세 없음",
          "🏠 렌트 소폭 하락세 — 2024 피크 대비 린우드 5% 하락",
          "🛒 H-Mart 린우드 확장 오픈 — 한식 푸드코트 규모 2배",
          "🚗 전기차 구매 시 WA주 세금 면제 최대 $3,000",
        ] : [
          "📡 Link Light Rail Lynnwood Station — SeaTac↔Lynnwood direct (52 min)",
          "💵 Seattle min wage $20.76/hr (2026) — WA has no state income tax",
          "🏠 Rent softening — Lynnwood down ~5% from 2024 peak",
          "🛒 H-Mart Lynnwood expansion — food court doubled in size",
          "🚗 WA EV tax exemption up to $3,000 on electric vehicle purchase",
        ]).map((tip, i) => (
          <div key={i} style={{ fontSize: 12, color: "rgba(230,237,243,0.7)", lineHeight: 1.6 }}>{tip}</div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TAB 1: 홈 SCREEN
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   CITY HUB — 다른 도시 HebronGuide 연결
───────────────────────────────────────── */
const HEBRON_CITIES = [
  { emoji: "🌲", nameKo: "시애틀",       nameEn: "Seattle",       flag: "🇺🇸", url: "/seattle/",     status: "live", color: "#0EA5E9" },
  { emoji: "🤠", nameKo: "달라스",       nameEn: "Dallas",        flag: "🇺🇸", url: "/dallas/",      status: "live", color: "#F59E0B" },
  { emoji: "🌉", nameKo: "샌프란시스코", nameEn: "San Francisco", flag: "🇺🇸", url: "/sf/",          status: "live", color: "#8B5CF6" },
  { emoji: "🗽", nameKo: "뉴욕",         nameEn: "New York",      flag: "🇺🇸", url: "/newyork/",     status: "live", color: "#EF4444" },
  { emoji: "🎵", nameKo: "내쉬빌",       nameEn: "Nashville",     flag: "🇺🇸", url: "/nashville/",   status: "live", color: "#10B981" },
  { emoji: "🦞", nameKo: "보스턴",       nameEn: "Boston",        flag: "🇺🇸", url: "/boston/",      status: "live", color: "#3B82F6" },
  { emoji: "🎬", nameKo: "LA",           nameEn: "Los Angeles",   flag: "🇺🇸", url: "/la/",          status: "live", color: "#F97316" },
  { emoji: "🍁", nameKo: "토론토",       nameEn: "Toronto",       flag: "🇨🇦", url: "/toronto/",     status: "live", color: "#DC2626" },
  { emoji: "🌲", nameKo: "밴쿠버",       nameEn: "Vancouver",     flag: "🇨🇦", url: "/vancouver/",   status: "live", color: "#059669" },
  { emoji: "🚀", nameKo: "휴스턴",       nameEn: "Houston",       flag: "🇺🇸", url: "/houston/",     status: "live", color: "#8B5CF6" },
  { emoji: "🍑", nameKo: "애틀랜타",     nameEn: "Atlanta",       flag: "🇺🇸", url: "/atlanta/",     status: "live", color: "#F472B6" },
  { emoji: "🏛️", nameKo: "필라델피아",  nameEn: "Philadelphia",  flag: "🇺🇸", url: "/philadelphia/",status: "live", color: "#60A5FA" },
  { emoji: "🎷", nameKo: "캔자스시티",   nameEn: "Kansas City",   flag: "🇺🇸", url: "/kansascity/",  status: "live", color: "#34D399" },
  { emoji: "🌴", nameKo: "마이애미",     nameEn: "Miami",         flag: "🇺🇸", url: "/miami/",       status: "live", color: "#FB923C" },
  { emoji: "🌮", nameKo: "멕시코시티",   nameEn: "Mexico City",   flag: "🇲🇽", url: "/mexicocity/",  status: "live", color: "#A3E635" },
  { emoji: "🌺", nameKo: "과달라하라",   nameEn: "Guadalajara",   flag: "🇲🇽", url: "/guadalajara/", status: "live", color: "#F87171" },
  { emoji: "⛰️", nameKo: "몬테레이",    nameEn: "Monterrey",     flag: "🇲🇽", url: "/monterrey/",   status: "live", color: "#C084FC" },
];

/* 도시별 디자인 — 항공 코드 + 그라디언트 (프로페셔널 스타일) */
const CITY_DESIGN: Record<string, { code: string; gradient: string; textColor: string }> = {
  "Seattle":       { code: "SEA", gradient: "linear-gradient(135deg, #1E3A8A, #2563EB)", textColor: "#BAE6FD" },
  "Dallas":        { code: "DAL", gradient: "linear-gradient(135deg, #78350F, #D97706)", textColor: "#FEF3C7" },
  "San Francisco": { code: "SFO", gradient: "linear-gradient(135deg, #4C1D95, #7C3AED)", textColor: "#EDE9FE" },
  "New York":      { code: "NYC", gradient: "linear-gradient(135deg, #7F1D1D, #DC2626)", textColor: "#FEE2E2" },
  "Nashville":     { code: "BNA", gradient: "linear-gradient(135deg, #064E3B, #059669)", textColor: "#D1FAE5" },
  "Boston":        { code: "BOS", gradient: "linear-gradient(135deg, #1E3A8A, #1D4ED8)", textColor: "#DBEAFE" },
  "Los Angeles":   { code: "LAX", gradient: "linear-gradient(135deg, #7C2D12, #EA580C)", textColor: "#FFEDD5" },
  "Toronto":       { code: "TOR", gradient: "linear-gradient(135deg, #881337, #E11D48)", textColor: "#FFE4E6" },
  "Vancouver":     { code: "YVR", gradient: "linear-gradient(135deg, #14532D, #16A34A)", textColor: "#DCFCE7" },
  "Houston":       { code: "HOU", gradient: "linear-gradient(135deg, #2E1065, #7C3AED)", textColor: "#EDE9FE" },
  "Atlanta":       { code: "ATL", gradient: "linear-gradient(135deg, #831843, #DB2777)", textColor: "#FCE7F3" },
  "Philadelphia":  { code: "PHL", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", textColor: "#DBEAFE" },
  "Kansas City":   { code: "MCI", gradient: "linear-gradient(135deg, #064E3B, #10B981)", textColor: "#D1FAE5" },
  "Miami":         { code: "MIA", gradient: "linear-gradient(135deg, #7C2D12, #F97316)", textColor: "#FFEDD5" },
  "Mexico City":   { code: "MEX", gradient: "linear-gradient(135deg, #365314, #65A30D)", textColor: "#ECFCCB" },
  "Guadalajara":   { code: "GDL", gradient: "linear-gradient(135deg, #7F1D1D, #EF4444)", textColor: "#FEE2E2" },
  "Monterrey":     { code: "MTY", gradient: "linear-gradient(135deg, #4A1D96, #A855F7)", textColor: "#F3E8FF" },
};

function CityHubSection({ lang }: { lang: string }) {
  const city = useCityConfig();
  const currentCity = city.nameEn === "San Francisco" ? "San Francisco" : city.nameEn;

  return (
    /* iOS 홈 화면처럼 — 배경은 홈과 동일하게, 아이콘만 컬러로 구별 */
    <div style={{ padding: "20px 0 16px" }}>

      {/* 헤더 */}
      <div style={{ padding: "0 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 15 }}>🌍</span>
            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A" }}>
              {lang === "ko" ? "다른 도시 HebronGuide" : "HebronGuide Cities"}
            </span>
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "#94A3B8", paddingLeft: 21 }}>
            {lang === "ko" ? "이사·출장·방문 도시를 미리 탐색하세요" : "Explore your next city before you move"}
          </div>
        </div>
        <a href="https://hebronguide.com" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: "#F2994A", fontWeight: 700, fontFamily: "Manrope,sans-serif", textDecoration: "none" }}>
          {lang === "ko" ? "전체 →" : "All →"}
        </a>
      </div>

      {/* 도시 카드 — 항공 코드 + 그라디언트 (프로페셔널) */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "4px 16px 8px", scrollbarWidth: "none" }}
        className="[&::-webkit-scrollbar]:hidden">
        {HEBRON_CITIES.map((city) => {
          const isCurrent = city.nameEn === currentCity;
          const isLive    = city.status === "live";
          const isSoon    = city.status === "soon";
          const isDim     = !isLive && !isSoon;
          const design    = CITY_DESIGN[city.nameEn] ?? { code: city.nameEn.slice(0,3).toUpperCase(), gradient: `linear-gradient(135deg, ${city.color}99, ${city.color})`, textColor: "#fff" };

          return (
            <a
              key={city.nameEn}
              href={isLive && !isCurrent ? `https://hebronguide.com${city.url}` : undefined}
              target={isLive && !isCurrent ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={isDim ? (e) => e.preventDefault() : undefined}
              style={{
                flexShrink: 0, width: 76,
                textDecoration: "none",
                opacity: isDim ? 0.3 : 1,
                cursor: isLive && !isCurrent ? "pointer" : "default",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => { if (isLive && !isCurrent) (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              {/* 도시 코드 카드 — 항공 출발보드 느낌 */}
              <div style={{
                width: 60, height: 60,
                borderRadius: 16,
                background: isDim ? "#E5E7EB" : design.gradient,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 1,
                boxShadow: isCurrent
                  ? `0 4px 16px ${city.color}44`
                  : isLive ? `0 2px 8px rgba(0,0,0,0.12)` : "none",
                outline: isCurrent ? `2px solid ${city.color}` : "none",
                outlineOffset: 2,
                position: "relative",
              }}>
                {/* 도시 코드 */}
                <div style={{
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 900,
                  fontSize: design.code.length > 3 ? 12 : 15,
                  letterSpacing: "1px",
                  color: isDim ? "#9CA3AF" : design.textColor,
                  lineHeight: 1,
                }}>
                  {design.code}
                </div>
                {/* 국기 (작게) */}
                <div style={{ fontSize: 10, lineHeight: 1, marginTop: 2, opacity: 0.85 }}>
                  {city.flag}
                </div>
                {/* 현재 도시 표시 */}
                {isCurrent && (
                  <div style={{
                    position: "absolute", bottom: -5, left: "50%",
                    transform: "translateX(-50%)",
                    width: 6, height: 6, borderRadius: "50%",
                    background: city.color,
                    boxShadow: `0 0 6px ${city.color}`,
                  }} />
                )}
              </div>

              {/* 도시 이름 — 풀네임 표시 */}
              <div style={{
                fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 9.5,
                color: "#374151", textAlign: "center", lineHeight: 1.25,
                maxWidth: 72, wordBreak: "break-word",
              }}>
                {lang === "ko" ? city.nameKo : city.nameEn}
              </div>

              {/* 상태 뱃지 */}
              {isLive && !isCurrent && (
                <div style={{ fontSize: 8, fontWeight: 700, color: "#059669",
                  background: "#DCFCE7", borderRadius: 20, padding: "1px 6px",
                  marginTop: -2 }}>
                  Live
                </div>
              )}
              {isSoon && (
                <div style={{ fontSize: 8, fontWeight: 600, color: "#D97706",
                  background: "#FEF3C7", borderRadius: 20, padding: "1px 6px",
                  marginTop: -2 }}>
                  Soon
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HOME: 한인 문화 캘린더
   디아스포라가 함께 기억하는 보편적 가치 — 환대·연결·기억
───────────────────────────────────────── */
const KOREAN_HOLIDAYS = [
  { date: "1-2월", emoji: "🌙", titleKo: "설날", titleEn: "Lunar New Year", titleEs: "Año Nuevo Lunar Coreano", descKo: "한인 가족 모임 1순위. 한복·세배·떡국", descEn: "#1 Korean family gathering. Hanbok, bowing, tteokguk", descEs: "Reunión familiar coreana #1. Hanbok, reverencias, tteokguk" },
  { date: "3/1",   emoji: "🇰🇷", titleKo: "삼일절",  titleEn: "Korean Independence Movement Day", titleEs: "Día del Movimiento de Independencia Coreana", descKo: "1919년 3·1 독립운동 기념", descEn: "March 1st Movement (1919) Memorial", descEs: "Conmemoración del Movimiento del 1 de marzo (1919)" },
  { date: "5/5",   emoji: "👶", titleKo: "어린이날", titleEn: "Children's Day (Korea)", titleEs: "Día del Niño (Corea)", descKo: "한국 가정의 자녀 축하 행사", descEn: "Korean family celebration for children", descEs: "Celebración familiar coreana para los niños" },
  { date: "5/8",   emoji: "🌷", titleKo: "어버이날", titleEn: "Parents' Day (Korea)", titleEs: "Día de los Padres (Corea)", descKo: "부모님께 카네이션·감사 인사", descEn: "Carnations and gratitude to parents", descEs: "Claveles y gratitud para los padres" },
  { date: "8/15",  emoji: "🇰🇷", titleKo: "광복절",  titleEn: "Korean Liberation Day", titleEs: "Día de la Liberación de Corea", descKo: "⭐ 한인 정체성 핵심일. 일제 해방 기념 (1945)", descEn: "⭐ Korean identity day. Liberation from Japan (1945)", descEs: "⭐ Día clave de la identidad coreana. Liberación de Japón (1945)" },
  { date: "9-10월", emoji: "🍂", titleKo: "추석",     titleEn: "Chuseok (Korean Thanksgiving)", titleEs: "Chuseok (Acción de Gracias Coreana)", descKo: "한인 가족 모임 1순위. 송편·차례", descEn: "#1 Korean family gathering. Songpyeon, ancestor rites", descEs: "Reunión familiar coreana #1. Songpyeon, ritos a los ancestros" },
  { date: "10/9",  emoji: "📖", titleKo: "한글날",   titleEn: "Hangul Day", titleEs: "Día del Hangul", descKo: "⭐ 한국어 자긍심. 세종대왕 한글 창제(1446)", descEn: "⭐ Korean language pride. King Sejong's Hangul (1446)", descEs: "⭐ Orgullo del idioma coreano. El Hangul del Rey Sejong (1446)" },
];

function KoreanCultureCalendarSection({ onNavigate }: { onNavigate?: (tab: number, subTab?: number) => void }) {
  const { lang } = useI18n();

  return (
    <div style={{ padding: "20px 16px 8px" }}>
      {/* 한인 문화 캘린더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A" }}>
            🇰🇷 {lang === "ko" ? "한인 문화 캘린더" : lang === "es" ? "Calendario Cultural Coreano" : "Korean Cultural Calendar"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
            {lang === "ko" ? "함께 기억하고 함께 나누는 날들" : lang === "es" ? "Días para recordar y celebrar juntos" : "Days to remember & celebrate together"}
          </div>
        </div>
      </div>

      {/* 캘린더 가로 스크롤 */}
      <div style={{
        display: "flex", gap: 10, overflowX: "auto",
        padding: "4px 4px 8px", scrollbarWidth: "none",
      }} className="[&::-webkit-scrollbar]:hidden">
        {KOREAN_HOLIDAYS.map((h, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 130, padding: "12px 10px",
            background: "#fff", borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{h.emoji}</span>
              <span style={{
                fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10,
                color: "#DC2626", letterSpacing: "0.3px",
              }}>{h.date}</span>
            </div>
            <div style={{
              fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13,
              color: "#1B2A4A", marginBottom: 3, lineHeight: 1.3,
            }}>
              {lang === "ko" ? h.titleKo : lang === "es" ? (h.titleEs ?? h.titleEn) : h.titleEn}
            </div>
            <div style={{
              fontFamily: "Manrope,sans-serif", fontSize: 10, color: "#64748B",
              lineHeight: 1.4,
            }}>
              {lang === "ko" ? h.descKo : lang === "es" ? (h.descEs ?? h.descEn) : h.descEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HOME: Korean American 여정 섹션
───────────────────────────────────────── */
function KoreanAmericanJourneySection({ onNavigate }: { onNavigate?: (tab: number, subTab?: number) => void }) {
  const { lang } = useI18n();
  const steps = lang === "ko"
    ? [
        { emoji: "🛬", label: "정착", sub: "Day 1~3개월", color: "#F2994A", tab: 1, subTab: 0 },
        { emoji: "🏘️", label: "적응", sub: "3개월~1년", color: "#10B981", tab: 1, subTab: 3 },
        { emoji: "🇺🇸", label: "Korean American", sub: "1년+", color: "#3B82F6", tab: 5, subTab: 6 },
      ]
    : lang === "es"
    ? [
        { emoji: "🛬", label: "Asentarse", sub: "Día 1–3 meses", color: "#F2994A", tab: 1, subTab: 0 },
        { emoji: "🏘️", label: "Adaptarse", sub: "3–12 meses", color: "#10B981", tab: 1, subTab: 3 },
        { emoji: "🇺🇸", label: "Korean American", sub: "Año 1+", color: "#3B82F6", tab: 5, subTab: 6 },
      ]
    : [
        { emoji: "🛬", label: "Settle", sub: "Day 1–3 months", color: "#F2994A", tab: 1, subTab: 0 },
        { emoji: "🏘️", label: "Adapt", sub: "3–12 months", color: "#10B981", tab: 1, subTab: 3 },
        { emoji: "🇺🇸", label: "Korean American", sub: "Year 1+", color: "#3B82F6", tab: 5, subTab: 6 },
      ];

  return (
    <div style={{ padding: "20px 16px 8px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A", letterSpacing: "-0.2px" }}>
            {lang === "ko" ? "🇺🇸 Korean American 여정" : lang === "es" ? "🇺🇸 Tu camino Korean American" : "🇺🇸 Your Korean American Journey"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
            {lang === "ko" ? "이민자에서 당당한 미국 사회의 구성원으로" : lang === "es" ? "De recién llegado a participante pleno en la sociedad estadounidense" : "From newcomer to full participant in American society"}
          </div>
        </div>
      </div>

      {/* 3단계 여정 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i === 2 ? "1.2" : "1", gap: 0 }}>
            <button
              onClick={() => onNavigate?.(step.tab, step.subTab)}
              style={{
                flex: 1, background: "#fff", border: `1.5px solid ${step.color}33`,
                borderRadius: 14, padding: "12px 8px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                cursor: "pointer", WebkitTapHighlightColor: "transparent",
                boxShadow: `0 2px 8px ${step.color}18`,
                transition: "transform 0.12s ease",
              }}
              onTouchStart={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.95)"; }}
              onTouchEnd={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <span style={{ fontSize: 22 }}>{step.emoji}</span>
              <div style={{
                fontFamily: "-apple-system, 'Noto Sans KR', sans-serif",
                fontWeight: 700, fontSize: 11, color: step.color, letterSpacing: "-0.2px", textAlign: "center",
              }}>{step.label}</div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "#94A3B8", textAlign: "center" }}>
                {step.sub}
              </div>
            </button>
            {i < steps.length - 1 && (
              <div style={{ width: 16, textAlign: "center", color: "#CBD5E1", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>›</div>
            )}
          </div>
        ))}
      </div>

      {/* 하단 태그라인 */}
      <div style={{
        marginTop: 12, padding: "10px 14px",
        background: "linear-gradient(135deg, rgba(59,130,246,0.07), rgba(16,185,129,0.06))",
        borderRadius: 12, border: "1px solid rgba(59,130,246,0.12)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <div style={{
          fontFamily: "Manrope,sans-serif", fontSize: 11, color: "#475569", lineHeight: 1.5, flex: 1,
        }}>
          {lang === "ko"
            ? "HebronGuide는 정착 가이드를 넘어 미국 사회의 Korean American으로 성장하는 전 여정을 함께합니다."
            : lang === "es"
            ? "HebronGuide te acompaña desde el primer día en todo tu camino como Korean American — no solo en el asentamiento."
            : "HebronGuide walks with you from Day 1 through your full journey as a Korean American — not just settlement."}
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ onNavigate }: { onNavigate?: (tab: number, subTab?: number) => void }) {
  const { lang } = useI18n();
  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh", paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}>
      <CompactHeroNew />
      <WorldCupBanner />
      <QuickMenuSection onNavigate={onNavigate} />
      <HebronServicesAd lang={lang} onNavigate={onNavigate} />
      <div style={{ margin: "0 16px", height: 0.5, background: "rgba(0,0,0,0.12)" }} />
      <SettlementEssentialsSection onNavigate={onNavigate} />
      <div style={{ margin: "0 16px", height: 0.5, background: "rgba(0,0,0,0.12)" }} />
      <KoreanAmericanJourneySection onNavigate={onNavigate} />
      <div style={{ margin: "0 16px", height: 0.5, background: "rgba(0,0,0,0.12)" }} />
      <KoreanCultureCalendarSection onNavigate={onNavigate} />
      <div style={{ margin: "0 16px", height: 0.5, background: "rgba(0,0,0,0.12)" }} />
      <CityHubSection lang={lang} />
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 2: 정착 SCREEN
───────────────────────────────────────── */
function SettleScreen({ onHome, initialSub = 0 }: { onHome?: () => void; initialSub?: number }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(initialSub);
  useEffect(() => { setSub(initialSub); }, [initialSub]);
  const tabs = lang === "ko"
    ? ["1주차", "1개월", "3개월", "행정", "재정", "거주지", "✅ 전체", "🛂 비자·이민"]
    : ["Week 1", "Month 1", "Month 3", "Admin", "Finance", "Areas", "✅ All", "🛂 Visa/Immigration"];

  const accent = "#60A5FA";

  // ── 도시별 정착 1주차 데이터 ──
  const week1Ko = citySlug === "dallas" ? [
    { title: "임시 거주지 확보", desc: "한인 민박, 에어비앤비, 단기 렌탈. 캐롤튼·올드덴튼 한인타운(H-Mart 인근) 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통 가능. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 McKinney SSA 오피스 방문" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명 준비. Chase, Prosperity Bank, Wells Fargo 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '달라스한인', H-Mart 커뮤니티 보드, 캐롤튼 한인 교회 방문" },
  ] : citySlug === "sf" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 산호세·프리몬트·산타클라라 한인 밀집 지역 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 SF 미션 스트리트 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명 준비. Chase, Bank of America, Hanmi Bank 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 'SF베이한인', H-Mart 커뮤니티 보드, 산호세 한인 교회 방문" },
  ] : citySlug === "newyork" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 플러싱(Queens) 또는 포트리(NJ) 한인타운 인근 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 맨해튼 125번가 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명. Chase, Citibank, Hanmi Bank, Shinhan Bank America 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '뉴욕한인', 플러싱 H-Mart 보드, 플러싱·포트리 한인 교회" },
  ] : citySlug === "la" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 코리아타운·세리토스·토랜스 한인 밀집 지역 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 LA 피게로아 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명. Chase, Hanmi Bank, Open Bank, Bank of Hope 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 'LA한인', 코리아타운 H-Mart 보드, 코리아타운 한인 교회" },
  ] : citySlug === "houston" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 슈거랜드·케이티·미미사 한인 밀집 지역 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 휴스턴 다운타운 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명. Chase, Wells Fargo, Texas Capital Bank 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '휴스턴한인', H-Mart 커뮤니티 보드, 슈거랜드 한인 교회" },
  ] : citySlug === "boston" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 올스턴·퀸시 한인 밀집 지역 권장 (BU·하버드 인근)" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 보스턴 코즈웨이 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명. Chase, Bank of America, Citizens Bank 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '보스턴한인', 올스턴 H-Mart 보드, 올스턴 한인 교회" },
  ] : citySlug === "nashville" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 매디슨·H-Mart 인근 권장 (한인타운 중심)" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 내쉬빌 브로드웨이 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명. Chase, Avenue Bank, Wells Fargo 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '내쉬빌한인', 매디슨 H-Mart 보드, 내쉬빌 한인 교회" },
  ] : citySlug === "toronto" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 노스욕·핀치 한인타운(Yonge/Finch) 인근 권장" },
    { title: "휴대폰 개통", desc: "TELUS, Rogers, Koodo Mobile. SIM 카드 + 여권으로 개통" },
    { title: "SIN 신청 (캐나다 사회보험번호)", desc: "영주권·취업허가 후 즉시 Service Canada 오피스 방문 신청" },
    { title: "은행 계좌 개설", desc: "RBC, TD, Scotiabank, CIBC. SIN+여권으로 개설. 한인 직원 있는 지점 찾기" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '토론토한인', 노스욕 H-Mart 보드, 노스욕 한인 교회" },
  ] : citySlug === "vancouver" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 코퀴틀람·버나비 한인 밀집 지역 권장" },
    { title: "휴대폰 개통", desc: "TELUS, Rogers, Fido. SIM 카드 + 여권으로 개통" },
    { title: "SIN 신청 (캐나다 사회보험번호)", desc: "영주권·취업허가 후 즉시 Service Canada 오피스 방문 신청" },
    { title: "은행 계좌 개설", desc: "RBC, TD, Scotiabank, VanCity 신협. SIN+여권으로 개설" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '밴쿠버한인', 코퀴틀람 H-Mart 보드, 코퀴틀람 한인 교회" },
  ] : citySlug === "atlanta" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 둘루스·스와니·존스크릭 한인 밀집 지역 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 애틀랜타 피치트리 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명. Chase, Wells Fargo, SunTrust/Truist 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '애틀랜타한인', 둘루스 H-Mart 보드, 둘루스 한인 교회" },
  ] : citySlug === "philadelphia" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 어퍼다비(PA) 또는 체리힐(NJ) 한인 밀집 지역 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 필라델피아 마켓스트리트 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명. Chase, Citizens Bank, PNC Bank 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '필라델피아한인', 어퍼다비 H-Mart 보드, 어퍼다비 한인 교회" },
  ] : citySlug === "kansascity" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 오버랜드파크·H-Mart 인근 권장 (KS 쪽)" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 캔자스시티 메인 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명. Chase, Commerce Bank, UMB Bank 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 'KC한인', 오버랜드파크 H-Mart 보드, KC 한인 교회" },
  ] : citySlug === "miami" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·단기 렌탈. 도랄·코랄게이블스 한인 밀집 지역 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통. 선불폰부터 시작" },
    { title: "SSN 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 마이애미 SW 1번가 SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명. Chase, Bank of America, Regions Bank 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '마이애미한인', 도랄 한인 커뮤니티, 도랄 한인 교회" },
  ] : citySlug === "mexicocity" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·호텔. 폴랑코·소나로사(Zona Rosa) 인근 권장. 한인 밀집·안전한 구역" },
    { title: "휴대폰 개통", desc: "Telcel·Movistar·AT&T Mexico. 여권으로 개통. Telcel 커버리지 최강" },
    { title: "RFC 등록 (납세자 번호)", desc: "멕시코 취업·사업 필수. SAT 온라인(sat.gob.mx) 또는 현지 회계사 도움으로 등록" },
    { title: "은행 계좌 개설", desc: "BBVA·Banamex/Citibanamex·Santander. 여권+RFC+주소 증명. 사립 은행 권장" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '멕시코한인', 한국 대사관 한인 커뮤니티, KOTRA 멕시코시티" },
  ] : citySlug === "guadalajara" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·호텔. 차풀테펙·사폴로판·프로비덴시아 권장 (안전한 외국인 거주 지구)" },
    { title: "휴대폰 개통", desc: "Telcel·Movistar·AT&T Mexico. 여권으로 개통. Telcel 커버리지 최강" },
    { title: "RFC 등록 (납세자 번호)", desc: "멕시코 취업·사업 필수. SAT 온라인(sat.gob.mx) 또는 현지 회계사 도움" },
    { title: "은행 계좌 개설", desc: "BBVA·Santander·Citibanamex. 여권+RFC+주소 증명" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '과달라하라한인', 과달라하라 한인회, KOTRA 멕시코시티 연락" },
  ] : citySlug === "monterrey" ? [
    { title: "임시 거주지 확보", desc: "에어비앤비·호텔. 산페드로가르사가르시아·미티에라 한인 주재원 밀집 지역 권장" },
    { title: "휴대폰 개통", desc: "Telcel·Movistar·AT&T Mexico. 주재원의 경우 법인 계약폰 이용 가능" },
    { title: "RFC 등록 (납세자 번호)", desc: "멕시코 취업·사업 필수. 주재원은 현지 회사 HR 통해 처리 가능" },
    { title: "은행 계좌 개설", desc: "Banorte·BBVA·Santander. 주재원은 법인 계좌 연동 가능. 여권+RFC+주소 증명" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '몬테레이한인', 몬테레이 한인회, 현대·기아·POSCO 주재원 단체" },
  ] : [
    // seattle default
    { title: "임시 거주지 확보", desc: "한인 민박, 에어비앤비, 단기 렌탈로 시작. H-Mart·Lynnwood 한인타운 인근 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통 가능. 선불폰부터 시작" },
    { title: "SSN (사회보장번호) 신청", desc: "고용 비자 소지자 입국 10일 후 신청. 📍 915 2nd Ave #3605, Seattle SSA 오피스" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명 준비. Chase, Wells Fargo, WA Federal 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '시애틀한인', H-Mart 커뮤니티 보드, 교회 방문" },
  ];

  const week1En = citySlug === "dallas" ? [
    { title: "Secure temporary housing", desc: "Korean homestay, Airbnb or short-term rental. Near Carrollton/Old Denton Korean H-Mart area recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine to start" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit McKinney SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Visit Chase, Prosperity Bank, or Wells Fargo" },
    { title: "Connect to Korean community", desc: "KakaoTalk '달라스한인', H-Mart community board, Korean churches in Carrollton" },
  ] : citySlug === "sf" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. San Jose, Fremont, Santa Clara Korean hub areas recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit SF Mission St SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Bank of America, Hanmi Bank" },
    { title: "Connect to Korean community", desc: "KakaoTalk 'SF베이한인', H-Mart community board, Korean churches in San Jose" },
  ] : citySlug === "newyork" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Near Flushing (Queens) or Fort Lee (NJ) Koreatown recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit Manhattan 125th St SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Citibank, Hanmi Bank, Shinhan Bank America" },
    { title: "Connect to Korean community", desc: "KakaoTalk '뉴욕한인', Flushing H-Mart board, Korean churches in Flushing/Fort Lee" },
  ] : citySlug === "la" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Koreatown, Cerritos, or Torrance Korean areas recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit LA Figueroa St SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Hanmi Bank, Open Bank, Bank of Hope" },
    { title: "Connect to Korean community", desc: "KakaoTalk 'LA한인', Koreatown H-Mart board, Korean churches in Koreatown" },
  ] : citySlug === "houston" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Sugar Land, Katy, or Missouri City Korean areas recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit Houston downtown SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Wells Fargo, Texas Capital Bank" },
    { title: "Connect to Korean community", desc: "KakaoTalk '휴스턴한인', H-Mart community board, Korean churches in Sugar Land" },
  ] : citySlug === "boston" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Allston or Quincy Korean areas recommended (near BU/Harvard)" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit Boston Causeway St SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Bank of America, Citizens Bank" },
    { title: "Connect to Korean community", desc: "KakaoTalk '보스턴한인', Allston H-Mart board, Korean churches in Allston" },
  ] : citySlug === "nashville" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Madison (near H-Mart) area recommended — heart of Korean community" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit Nashville Broadway SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Wells Fargo, or local Nashville bank" },
    { title: "Connect to Korean community", desc: "KakaoTalk '내쉬빌한인', Madison H-Mart board, Korean churches in Madison" },
  ] : citySlug === "toronto" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. North York/Finch Korean hub (Yonge & Finch) recommended" },
    { title: "Activate phone", desc: "TELUS, Rogers, or Koodo Mobile. SIM card with passport" },
    { title: "Apply for SIN (Social Insurance Number)", desc: "Apply immediately after PR/work permit. Visit Service Canada office in person" },
    { title: "Open bank account", desc: "RBC, TD, Scotiabank, CIBC. SIN + passport to open. Find branch with Korean staff" },
    { title: "Connect to Korean community", desc: "KakaoTalk '토론토한인', North York H-Mart board, Korean churches in North York" },
  ] : citySlug === "vancouver" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Coquitlam or Burnaby Korean areas recommended" },
    { title: "Activate phone", desc: "TELUS, Rogers, or Fido. SIM card with passport" },
    { title: "Apply for SIN (Social Insurance Number)", desc: "Apply immediately after PR/work permit. Visit Service Canada office in person" },
    { title: "Open bank account", desc: "RBC, TD, Scotiabank, or VanCity. SIN + passport to open" },
    { title: "Connect to Korean community", desc: "KakaoTalk '밴쿠버한인', Coquitlam H-Mart board, Korean churches in Coquitlam" },
  ] : citySlug === "atlanta" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Duluth, Suwanee, or Johns Creek Korean areas recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit Atlanta Peachtree St SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Wells Fargo, or Truist Bank" },
    { title: "Connect to Korean community", desc: "KakaoTalk '애틀랜타한인', Duluth H-Mart board, Korean churches in Duluth" },
  ] : citySlug === "philadelphia" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Upper Darby (PA) or Cherry Hill (NJ) Korean areas recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit Philadelphia Market St SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Citizens Bank, or PNC Bank" },
    { title: "Connect to Korean community", desc: "KakaoTalk '필라델피아한인', Upper Darby H-Mart board, Korean churches in Upper Darby" },
  ] : citySlug === "kansascity" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Overland Park (near H-Mart, KS side) recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit Kansas City main SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Commerce Bank, or UMB Bank" },
    { title: "Connect to Korean community", desc: "KakaoTalk 'KC한인', Overland Park H-Mart board, Korean churches in Overland Park" },
  ] : citySlug === "miami" ? [
    { title: "Secure temporary housing", desc: "Airbnb or short-term rental. Doral or Coral Gables Korean areas recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, Mint Mobile. Passport + visa sufficient. Prepaid is fine" },
    { title: "Apply for SSN", desc: "Work visa holders: apply 10 days after arrival. Visit Miami SW 1st Ave SSA office" },
    { title: "Prepare bank account", desc: "Bring passport, visa, address proof. Chase, Bank of America, or Regions Bank" },
    { title: "Connect to Korean community", desc: "KakaoTalk '마이애미한인', Doral Korean community, Korean churches in Doral" },
  ] : citySlug === "mexicocity" ? [
    { title: "Secure temporary housing", desc: "Airbnb or hotel. Near Polanco or Zona Rosa recommended — safe international district" },
    { title: "Activate phone", desc: "Telcel, Movistar, or AT&T Mexico. Telcel has best coverage in Mexico" },
    { title: "Register RFC (Mexican Tax ID)", desc: "Required for work & banking in Mexico. Register at sat.gob.mx or through a local accountant (contador)" },
    { title: "Open bank account", desc: "BBVA, Citibanamex, or Santander. Passport + RFC + address proof required" },
    { title: "Connect to Korean community", desc: "KakaoTalk '멕시코한인', Korean Embassy Mexico City community, KOTRA Mexico City office" },
  ] : citySlug === "guadalajara" ? [
    { title: "Secure temporary housing", desc: "Airbnb or hotel. Chapalita, Zapopan, or Providencia recommended — safe expat-friendly areas" },
    { title: "Activate phone", desc: "Telcel, Movistar, or AT&T Mexico. Telcel has best coverage in Guadalajara" },
    { title: "Register RFC (Mexican Tax ID)", desc: "Required for work & banking in Mexico. Register at sat.gob.mx or through a local accountant" },
    { title: "Open bank account", desc: "BBVA, Santander, or Citibanamex. Passport + RFC + address proof required" },
    { title: "Connect to Korean community", desc: "KakaoTalk '과달라하라한인', Guadalajara Korean Association, KOTRA Mexico City contact" },
  ] : citySlug === "monterrey" ? [
    { title: "Secure temporary housing", desc: "Airbnb or hotel. San Pedro Garza García or Mitiera (expat-preferred gated communities) recommended" },
    { title: "Activate phone", desc: "Telcel, Movistar, or AT&T Mexico. Expats often use company-provided corporate phones" },
    { title: "Register RFC (Mexican Tax ID)", desc: "Required for work & banking. Expats: coordinate with company HR for assistance" },
    { title: "Open bank account", desc: "Banorte, BBVA, or Santander. Corporate account linkage available for expats" },
    { title: "Connect to Korean community", desc: "KakaoTalk '몬테레이한인', Monterrey Korean Association, Hyundai/Kia/POSCO expat groups" },
  ] : [
    // seattle default
    { title: "Secure temporary housing", desc: "Korean homestay, Airbnb, or short-term rental. Near H-Mart or Lynnwood Koreatown recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, or Mint Mobile. Passport + visa sufficient. Prepaid is fine to start" },
    { title: "Apply for SSN", desc: "For work visa holders: apply 10 days after arrival. Visit SSA office at 915 2nd Ave #3605, Seattle" },
    { title: "Prepare to open bank account", desc: "Bring passport, visa, address proof. Visit Chase, Wells Fargo, or WA Federal" },
    { title: "Connect to Korean community", desc: "KakaoTalk Open Chat '시애틀한인', H-Mart community board, visit a Korean church" },
  ];

  // ── 도시별 정착 1개월 데이터 ──
  const month1Ko = citySlug === "toronto" || citySlug === "vancouver" ? [
    { title: "운전면허 전환", desc: citySlug === "toronto" ? "온타리오 G 시스템. 한국 면허 소지자 → G1 필기 면제 가능! drivetest.ca 예약 필수" : "BC ICBC. ✅ 한국 면허 → 지식 시험 면제! 도로주행만. 90일 내 전환 의무. icbc.com" },
    { title: "의료보험 신청", desc: citySlug === "toronto" ? "OHIP 온타리오 무료 의료보험. 3개월 대기 → 그 후 무료. 대기 중 민간 보험 임시 가입 권장 | 🔗 ontario.ca/ohip" : "BC MSP 무료 의료보험. 3개월 대기 → 그 후 무료. 대기 중 민간 보험 임시 가입 | 🔗 hibc.gov.bc.ca" },
    { title: "자녀 학교 등록", desc: "거주 증명(임대 계약서) 필수. 공립학교 무료. ESL 지원 가능" },
    { title: "중고차 구매 고려", desc: "대중교통 괜찮지만 교외 이동 시 차량 유용. CARFAX 확인, 한인 딜러 활용" },
    { title: "캐나다 신용 빌드 시작", desc: "Secured Credit Card로 시작. 캐나다 신용은 미국과 별개로 쌓아야 함" },
  ] : citySlug === "mexicocity" || citySlug === "guadalajara" || citySlug === "monterrey" ? [
    { title: "멕시코 운전면허 취득", desc: "SEMOVI (멕시코 교통부). 여권·RFC·주소 증명으로 신청. 필기시험(스페인어) 필수. 시험 없이 한국 면허 전환 불가" },
    { title: "의료보험 가입", desc: "IMSS(사회보험) 등록 또는 사립 의료보험. 주재원은 회사 단체보험 활용. IMSS 공립 병원보다 사립병원 추천" },
    { title: "자녀 학교 등록", desc: "국제학교(ASF·ASM 등) 또는 한국학교. 서류: 여권+학교기록+예방접종 증명" },
    { title: "차량 구매·렌탈", desc: "대중교통 불편한 지역 多. Uber·DiDi 대안. 차량 구매 시 멕시코 법인 차량등록 절차 확인" },
    { title: "수돗물 대책 마련", desc: "수돗물 절대 음용 금지! 생수 정기 구매 또는 정수기(Garrafón 서비스) 계약 필수" },
  ] : citySlug === "sf" || citySlug === "la" ? [
    { title: "캘리포니아 운전면허 (CA DMV)", desc: "⚠️ 이주 10일 내 방문 의무! 필기 영어만 가능 (한국어 시험 없음). 한국 면허 소지자도 필기+실기 응시. 예약 필수: appointments.dmv.ca.gov" },
    { title: "건강보험 등록 (Covered California)", desc: "CA 주 의료보험 마켓플레이스. 소득 기준 보조금 가능. Medi-Cal(무료) 확인 | 🔗 coveredca.com" },
    { title: "자녀 학교 등록", desc: "거주 증명(임대 계약서) 필수. 공립학교 무료. ESL 지원 가능" },
    { title: "중고차 구매 고려", desc: "대중교통 제한적 → 차량 필수 (LA는 더욱). CARFAX 확인, 한인 딜러 활용 | 🔗 carfax.com" },
    { title: "우편함 주소 확보", desc: "영구 주소 없으면 UPS Store 사서함 대안. 모든 행정 서류에 필요" },
  ] : citySlug === "newyork" ? [
    { title: "뉴욕 운전면허 (NY DMV)", desc: "이주 30일 내 전환 의무. 한국 면허 소지자 필기+실기 응시 필요. 예약 필수: dmv.ny.gov | 필기 영어만 (한국어 없음)" },
    { title: "건강보험 등록 (NY State of Health)", desc: "뉴욕주 마켓플레이스. NY Essential Plan — 소득 $0-200% FPL 무료. Medicaid 확인 | 🔗 nystateofhealth.ny.gov" },
    { title: "자녀 학교 등록", desc: "거주 증명(임대 계약서) 필수. 공립학교 무료. ESL 지원 가능" },
    { title: "대중교통 정기권", desc: "OMNY 카드 (NYC 지하철·버스) 또는 NJ Transit Monthly Pass. 뉴욕은 차 없이도 생활 가능!" },
    { title: "우편함 주소 확보", desc: "영구 주소 없으면 UPS Store 사서함 대안. 모든 행정 서류에 필요" },
  ] : citySlug === "boston" ? [
    { title: "매사추세츠 운전면허 (MA RMV)", desc: "이주 60일 내 전환 의무. 한국 면허 소지자 필기+실기 응시. 예약 필수: mass.gov/rmv | 필기 영어만 (한국어 없음)" },
    { title: "건강보험 등록 (Health Connector)", desc: "MA 전국 최고 보장 수준. 소득 기준 보조금·무료 플랜. 🔗 mahealthconnector.org" },
    { title: "자녀 학교 등록", desc: "거주 증명(임대 계약서) 필수. 공립학교 무료. ESL 지원 가능" },
    { title: "중고차 구매 고려", desc: "T(지하철)로 시내 OK, 교외는 차 필요. CARFAX 확인, 한인 딜러 활용" },
    { title: "우편함 주소 확보", desc: "영구 주소 없으면 UPS Store 사서함 대안" },
  ] : citySlug === "nashville" || citySlug === "dallas" || citySlug === "houston" || citySlug === "atlanta" || citySlug === "kansascity" || citySlug === "miami" ? [
    { title: "운전면허 취득 (DPS/DDS/DDS/DDS/DMV/DHSMV)", desc:
        citySlug === "nashville" ? "TN DDS. 이주 30일 내 전환 (매우 빠름!). 필기 영어만. SSN 없어도 ITIN으로 신청 가능. tn.gov/safety" :
        citySlug === "dallas" || citySlug === "houston" ? "TX DPS. 이주 90일 내 전환. 필기 영어만. 예약 필수: appointments.dps.texas.gov" :
        citySlug === "atlanta" ? "GA DDS. 이주 30일 내 전환. 필기 영어만. dds.georgia.gov 예약 필수" :
        citySlug === "kansascity" ? "KS DMV (오버랜드파크) 또는 MO DMV. 이주 90일 내 전환. ksrevenue.gov/dovehicle.html" :
        "FL DHSMV. 이주 30일 내 전환. 필기 영어·스페인어 가능 (한국어 없음). flhsmv.gov 예약 필수" },
    { title: "건강보험 등록 (HealthCare.gov)", desc: "연방 마켓플레이스. 소득 기준 프리미엄 세액공제 가능. Medicaid 자격 별도 확인 | 🔗 healthcare.gov" },
    { title: "자녀 학교 등록", desc: "거주 증명(임대 계약서) 필수. 공립학교 무료. ESL 지원 가능" },
    { title: "중고차 구매 고려", desc: "남부·중부 도시는 차량 필수! 대중교통 매우 제한적. CARFAX 확인, 한인 딜러 활용" },
    { title: "우편함 주소 확보", desc: "영구 주소 없으면 UPS Store 사서함 대안. 모든 행정 서류에 필요" },
  ] : citySlug === "philadelphia" ? [
    { title: "펜실베이니아 운전면허 (PA DMV)", desc: "이주 60일 내 전환. 필기 영어만 (한국어 없음). dmv.pa.gov 예약 필수" },
    { title: "건강보험 등록 (Pennie — PA 마켓플레이스)", desc: "PA 주 의료보험 마켓플레이스. 소득 기준 보조금. Medicaid(PA Medical Assistance) 확인 | 🔗 pennie.com" },
    { title: "자녀 학교 등록", desc: "거주 증명(임대 계약서) 필수. 공립학교 무료. ESL 지원" },
    { title: "중고차 구매 고려", desc: "SEPTA(지하철·버스)로 시내 OK, 교외는 차 필요. CARFAX 확인" },
    { title: "우편함 주소 확보", desc: "영구 주소 없으면 UPS Store 사서함 대안" },
  ] : [
    // seattle default
    { title: "WA 운전면허 취득", desc: "✅ 한국어 필기시험 가능! 영어·한국어 선택. → 도로주행시험. Everett·Bellevue DOL 권장 | 🔗 dol.wa.gov" },
    { title: "건강보험 등록", desc: "직장 보험 없으면 Washington Apple Health (Medicaid) 또는 WA Healthplanfinder 마켓플레이스 | 🔗 wahealthplanfinder.org" },
    { title: "자녀 학교 등록", desc: "해당 학군 거주 증명 필수 (임대 계약서). 공립학교 무료, 영어 ESL 지원" },
    { title: "중고차 구매 고려", desc: "대중교통 제한적 → 차량 필수. CARFAX 확인, 한인 딜러 활용 가능 | 🔗 carfax.com" },
    { title: "우편함 주소 확보", desc: "영구 주소 없으면 UPS Store 사서함 대안. 모든 행정 서류에 필요" },
  ];

  const month1En = citySlug === "toronto" || citySlug === "vancouver" ? [
    { title: "Transfer Driver's Licence", desc: citySlug === "toronto" ? "Ontario G system. Korean licence holders may skip G1 written test! drivetest.ca appointment required" : "BC ICBC. ✅ Korean licence: Knowledge test EXEMPT! Road test only. Must transfer within 90 days. icbc.com" },
    { title: "Apply for Health Insurance", desc: citySlug === "toronto" ? "OHIP — free Ontario health insurance. 3-month wait then ALL care is free. Get temporary private insurance during wait | 🔗 ontario.ca/ohip" : "BC MSP — free health insurance. 3-month wait then ALL care is free. Temporary private insurance during wait | 🔗 hibc.gov.bc.ca" },
    { title: "Enroll children in school", desc: "Proof of residency required (lease). Public school free. ESL support available" },
    { title: "Consider buying a used car", desc: "Transit is decent but suburbs need a car. Check CARFAX; Korean dealers available" },
    { title: "Start building Canadian credit", desc: "Begin with Secured Credit Card. Canadian credit is separate from US — build from scratch" },
  ] : citySlug === "mexicocity" || citySlug === "guadalajara" || citySlug === "monterrey" ? [
    { title: "Get Mexican Driver's Licence (SEMOVI)", desc: "Apply via SEMOVI with passport, RFC, address proof. Written test in Spanish required. Korean licence cannot be directly transferred" },
    { title: "Enroll in health insurance", desc: "IMSS (social security) or private health insurance. Expats: use company group insurance. Private hospitals recommended over IMSS" },
    { title: "Enroll children in school", desc: "International school (ASF/ASM) or Korean school. Documents: passport + school records + vaccination proof" },
    { title: "Vehicle or rideshare plan", desc: "Many areas have limited transit. Uber/DiDi are good alternatives. Vehicle purchase requires Mexican registration procedure" },
    { title: "Set up bottled water supply", desc: "NEVER drink tap water! Buy bottled water regularly or subscribe to Garrafón (water delivery) service" },
  ] : citySlug === "sf" || citySlug === "la" ? [
    { title: "Get CA Driver's License (CA DMV)", desc: "⚠️ Must visit within 10 days of moving to CA! Written test in English only (no Korean). Korean licence holders must take both written & road tests. Book: appointments.dmv.ca.gov" },
    { title: "Enroll in health insurance (Covered California)", desc: "CA state health marketplace. Income-based subsidies available. Medi-Cal (free Medicaid) also available | 🔗 coveredca.com" },
    { title: "Enroll children in school", desc: "Proof of residency required (lease agreement). Public school free. ESL support available" },
    { title: "Consider buying a used car", desc: "Transit is very limited → car is essential (especially in LA). Check CARFAX; Korean dealers available" },
    { title: "Secure a mailing address", desc: "No permanent address? UPS Store mailbox as alternative. Required for all official mail" },
  ] : citySlug === "newyork" ? [
    { title: "Get NY Driver's License (NY DMV)", desc: "Must transfer within 30 days of moving. Korean licence holders must take both written & road tests. Appointment: dmv.ny.gov | Written test in English only" },
    { title: "Enroll in health insurance (NY State of Health)", desc: "NY marketplace. NY Essential Plan — free for income $0-200% FPL. Check Medicaid | 🔗 nystateofhealth.ny.gov" },
    { title: "Enroll children in school", desc: "Proof of residency required (lease). Public school free. ESL support available" },
    { title: "Get a transit pass", desc: "OMNY card (NYC subway & bus) or NJ Transit Monthly Pass. NYC is very liveable without a car!" },
    { title: "Secure a mailing address", desc: "No permanent address? UPS Store mailbox as alternative" },
  ] : citySlug === "boston" ? [
    { title: "Get MA Driver's License (MA RMV)", desc: "Must transfer within 60 days of moving. Korean licence holders must take both written & road tests. Appointment: mass.gov/rmv | English only" },
    { title: "Enroll in health insurance (Health Connector)", desc: "MA has the best coverage in the US. Income-based subsidies & free plans available | 🔗 mahealthconnector.org" },
    { title: "Enroll children in school", desc: "Proof of residency required (lease). Public school free. ESL support available" },
    { title: "Consider a used car", desc: "T (subway) covers the city; suburbs need a car. Check CARFAX; Korean dealers available" },
    { title: "Secure a mailing address", desc: "No permanent address? UPS Store mailbox as alternative" },
  ] : citySlug === "nashville" || citySlug === "dallas" || citySlug === "houston" || citySlug === "atlanta" || citySlug === "kansascity" || citySlug === "miami" ? [
    { title: "Get Driver's License",
      desc: citySlug === "nashville" ? "TN DDS. Must transfer within 30 days (very fast!). English only. ITIN accepted instead of SSN. tn.gov/safety" :
            citySlug === "dallas" || citySlug === "houston" ? "TX DPS. Must transfer within 90 days. English only. Appointment required: appointments.dps.texas.gov" :
            citySlug === "atlanta" ? "GA DDS. Must transfer within 30 days. English only. Appointment: dds.georgia.gov" :
            citySlug === "kansascity" ? "KS DMV (Overland Park) or MO DMV. Must transfer within 90 days. ksrevenue.gov" :
            "FL DHSMV. Must transfer within 30 days. English or Spanish (no Korean). Appointment: flhsmv.gov" },
    { title: "Enroll in health insurance (HealthCare.gov)", desc: "Federal marketplace. Income-based Premium Tax Credits available. Check Medicaid eligibility separately | 🔗 healthcare.gov" },
    { title: "Enroll children in school", desc: "Proof of residency required (lease). Public school free. ESL support available" },
    { title: "Buy a used car", desc: "Southern & midwestern cities require a car — public transit very limited. Check CARFAX; Korean dealers available" },
    { title: "Secure a mailing address", desc: "No permanent address? UPS Store mailbox as alternative. Required for all official mail" },
  ] : citySlug === "philadelphia" ? [
    { title: "Get PA Driver's License (PA DMV)", desc: "Must transfer within 60 days of moving. English only (no Korean). Appointment: dmv.pa.gov" },
    { title: "Enroll in health insurance (Pennie — PA Marketplace)", desc: "Pennsylvania health marketplace. Income-based subsidies. PA Medical Assistance (Medicaid) available | 🔗 pennie.com" },
    { title: "Enroll children in school", desc: "Proof of residency required (lease). Public school free. ESL support available" },
    { title: "Consider a used car", desc: "SEPTA covers the city; suburbs need a car. Check CARFAX" },
    { title: "Secure a mailing address", desc: "No permanent address? UPS Store mailbox as alternative" },
  ] : [
    // seattle default
    { title: "Get WA Driver License", desc: "✅ Written test available in Korean! (English or Korean choice) → road test. Everett or Bellevue DOL recommended | 🔗 dol.wa.gov" },
    { title: "Enroll in health insurance", desc: "No employer plan? Try Washington Apple Health (Medicaid) or WA Healthplanfinder marketplace | 🔗 wahealthplanfinder.org" },
    { title: "Enroll children in school", desc: "Proof of residency required (lease agreement). Public school is free; ESL support available" },
    { title: "Consider buying a used car", desc: "Public transit is limited → car is essential. Check CARFAX; Korean dealers can help | 🔗 carfax.com" },
    { title: "Secure a mailing address", desc: "No permanent address? Use UPS Store mailbox. Required for all government correspondence" },
  ];

  const month3Ko = [
    { title: "신용카드 빌드 시작", desc: "Secured Card (Capital One, Discover it) 발급 → 6개월 후 일반 카드로 업그레이드 | 🔗 capitalone.com" },
    { title: "세금 ID (ITIN) 신청", desc: "SSN 없는 비자 소지자. IRS Form W-7 작성. 한인 CPA 도움 권장" },
    { title: "비자 상태·기간 재확인", desc: "I-94 만료일 체크 (cbp.dhs.gov). 연장·전환 필요시 이민 변호사 상담" },
    { title: "장기 렌탈 계약", desc: "신용 이력 부족 → 더 큰 보증금 또는 한인 집주인 우선 탐색" },
    { title: "세금신고 준비 (연말)", desc: "한국 소득 있으면 FBAR/FATCA 申告 필요. 한인 회계사 상담 필수" },
  ];
  const month3En = [
    { title: "Start building credit", desc: "Apply for Secured Card (Capital One, Discover it) → upgrade to regular card after 6 months | 🔗 capitalone.com" },
    { title: "Apply for ITIN", desc: "For non-SSN visa holders. File IRS Form W-7. Korean CPA help recommended" },
    { title: "Recheck visa status & expiry", desc: "Check I-94 at cbp.dhs.gov. Consult immigration attorney for extension/change" },
    { title: "Sign long-term lease", desc: "Limited credit? Offer larger deposit or look for Korean landlords first" },
    { title: "Prepare for tax season", desc: "Korea income? FBAR/FATCA filing required. Korean accountant consultation essential" },
  ];

  const citySlug = useCityConfig().slug;

  const adminKo = citySlug === "sf" ? [
    { title: "SSN 신청", desc: "📍 Social Security Office | 1750 Mission St, San Francisco CA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "CA 운전면허 (DMV)", desc: "📍 1515 S 1st St, San Jose CA | 예약: appointments.dmv.ca.gov\n⚠️ CA 이주 10일 내 방문 의무. 필기시험 영어만 가능 (한국어 X). 한국 면허 소지자도 필기+실기 응시 필요 | 🔗 dmv.ca.gov" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "Covered California (건강보험)", desc: "CA 주 의료보험 마켓플레이스. 소득 기준 보조금 가능. 무보험도 Medi-Cal 신청 가능 | 🔗 coveredca.com" },
    { title: "영주권·비자 갱신", desc: "USCIS 공식 사이트 | 산호세·SF 이민 변호사 다수 활동 | 🔗 uscis.gov" },
  ] : citySlug === "newyork" ? [
    { title: "SSN 신청", desc: "📍 SSA 맨해튼 오피스 | 123 W 125th St, New York NY | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "NY 운전면허 (DMV)", desc: "📍 11 Broadway, New York NY | 🔗 dmv.ny.gov 예약 필수\n⚠️ NY 이주 30일 내 면허 전환 의무. 한국 면허 소지자 필기+실기 모두 응시 필요" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "NY 건강보험 (NY State of Health)", desc: "뉴욕주 의료보험 마켓플레이스. 소득 기준 보조금 가능. Medicaid(NY Essential Plan) — 소득 $0-200% FPL 무료 | 🔗 nystateofhealth.ny.gov" },
    { title: "영주권·비자 갱신", desc: "USCIS 뉴욕 오피스 | 맨해튼·플러싱 이민 변호사 다수 | 🔗 uscis.gov" },
  ] : citySlug === "nashville" ? [
    { title: "SSN 신청", desc: "📍 SSA 내쉬빌 오피스 | 801 Broadway Ste 1000, Nashville TN | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "TN 운전면허 (DDS)", desc: "📍 44 Vantage Way Ste 160, Nashville TN | 🔗 tn.gov/safety\n⚠️ TN 이주 30일 내 면허 전환 의무 (매우 빠름!). SSN 없어도 ITIN으로 신청 가능" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "TN 건강보험 (TennCare)", desc: "테네시주 Medicaid. 소득 기준 — 저소득 가정 우선. HealthCare.gov 마켓플레이스 병행 확인 | 🔗 tn.gov/tenncare" },
    { title: "영주권·비자 갱신", desc: "USCIS 내쉬빌 오피스 | 내쉬빌 이민 변호사 다수 | 🔗 uscis.gov" },
  ] : citySlug === "boston" ? [
    { title: "SSN 신청", desc: "📍 SSA 보스턴 오피스 | 10 Causeway St Rm 148, Boston MA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "MA 운전면허 (RMV)", desc: "📍 630 Washington St, Boston MA | 🔗 mass.gov/rmv 예약 필수\n⚠️ MA 이주 60일 내 면허 전환 의무. 유학생(F-1)도 유효 비자 기간 내 신청 가능" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "MA 건강보험 (Health Connector)", desc: "매사추세츠주 의료보험 마켓플레이스. 전국 최고 수준 보장. 소득 기준 보조금·무료 플랜 가능 | 🔗 mahealthconnector.org" },
    { title: "영주권·비자 갱신", desc: "USCIS 보스턴 오피스 | 하버드·MIT 인근 이민 변호사 다수 | 🔗 uscis.gov" },
  ] : citySlug === "la" ? [
    { title: "SSN 신청", desc: "📍 SSA LA 오피스 | 3415 S Figueroa St, Los Angeles CA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "CA 운전면허 (DMV)", desc: "📍 3100 W 6th St, Los Angeles CA (코리아타운 인근) | 🔗 appointments.dmv.ca.gov 예약 필수\n⚠️ CA 이주 10일 내 방문 의무. 필기 영어만. 한국 면허 소지자 필기+실기 모두 응시" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 코리아타운 한인 CPA 다수 | 🔗 irs.gov/itin" },
    { title: "Covered California (건강보험)", desc: "CA 주 의료보험. 소득 기준 보조금 가능. Medi-Cal(무료 메디케이드)도 확인. LA 카운티 가입 지원 | 🔗 coveredca.com" },
    { title: "영주권·비자 갱신", desc: "USCIS LA 오피스 | 코리아타운·토랜스 이민 변호사 다수 | 🔗 uscis.gov" },
  ] : citySlug === "toronto" ? [
    { title: "SIN 신청 (캐나다 사회보험번호)", desc: "📍 Service Canada 오피스 방문 | 영주권·취업허가 후 즉시 신청\n🇨🇦 미국 SSN과 같은 역할. 취업·세금·은행 계좌 개설 모두 필요 | 🔗 canada.ca/sin" },
    { title: "온타리오 운전면허 (G 시스템)", desc: "🔗 drivetest.ca 예약 필수\n한국 면허 소지자 → G1 필기 면제 가능! → G2 도로시험만\nG1: 고속도로 금지·동승자 필요 (1년) → G2 → G(완전)" },
    { title: "OHIP 의료보험 신청", desc: "온타리오 무료 의료보험. 이주 후 3개월 대기 → 그 후 모든 의료 무료!\nServiceOntario 방문 신청. 대기 기간 민간 의료보험 임시 가입 권장 | 🔗 ontario.ca/ohip" },
    { title: "캐나다 이민 (IRCC)", desc: "익스프레스 엔트리·주정부 이민(PNP)·유학·취업허가.\nUSCIS 대신 IRCC. 한인 이민 변호사 토론토 다수 활동 | 🔗 canada.ca/immigration" },
    { title: "캐나다 은행 계좌 개설", desc: "RBC·TD·Scotiabank·CIBC 추천. SIN + 여권으로 개설 가능\n신용 이력 없어도 Secured Credit Card로 시작 | 🔗 rbc.com" },
  ] : citySlug === "vancouver" ? [
    { title: "SIN 신청 (캐나다 사회보험번호)", desc: "📍 Service Canada 오피스 방문 | 영주권·취업허가 후 즉시 신청\n🇨🇦 취업·세금·은행 계좌 모두 필요 | 🔗 canada.ca/sin" },
    { title: "BC 운전면허 (ICBC)", desc: "🔗 icbc.com 온라인 예약\n✅ 한국 면허 소지자 지식 시험 면제! → 도로주행시험만 응시\n90일 내 BC 면허 전환 의무" },
    { title: "MSP 의료보험 신청", desc: "BC 무료 의료보험. 이주 후 3개월 대기 → 그 후 모든 의료 무료!\n온라인 신청: hibc.gov.bc.ca | 대기 기간 민간 의료보험 임시 가입 권장 | 🔗 gov.bc.ca/msp" },
    { title: "캐나다 이민 (IRCC)", desc: "BC PNP(주정부 이민)·테크파일럿·유학·취업허가. USCIS 대신 IRCC.\n밴쿠버 한인 이민 변호사 다수 활동 | 🔗 canada.ca/immigration" },
    { title: "BC 은행 계좌 개설", desc: "RBC·TD·Scotiabank·CIBC·VanCity(밴쿠버 신협) 추천\nSIN + 여권으로 개설 가능. 신용 이력 없어도 Secured Card로 시작 | 🔗 rbc.com" },
  ] : citySlug === "dallas" ? [
    { title: "SSN 신청", desc: "📍 Social Security Office | 1901 N Central Expy, McKinney TX | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "텍사스 운전면허 (DPS)", desc: "📍 1149 E Belt Line Rd, Carrollton TX | 온라인 예약 필수! 🔗 appointments.dps.texas.gov\n⚠️ 텍사스 이주 후 90일 이내 전환 의무 | 🔗 dps.texas.gov" },
    { title: "차량 등록·검사", desc: "텍사스는 연 1회 차량 안전검사 필수 (Safety Inspection) → 카운티 Tax Office에서 등록\n검사소: Carrollton 인근 Firestone, Jiffy Lube 등 | 🔗 txdmv.gov" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "영주권·비자 갱신", desc: "USCIS 공식 사이트: uscis.gov | 달라스·캐롤튼 이민 변호사 다수 활동 | 🔗 uscis.gov" },
  ] : citySlug === "houston" ? [
    { title: "SSN 신청", desc: "📍 Social Security Office | 2505 Murworth Dr, Houston TX | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "텍사스 운전면허 (DPS)", desc: "📍 6900 Rankin Rd, Houston TX | 온라인 예약 필수! 🔗 appointments.dps.texas.gov\n⚠️ 텍사스 이주 90일 이내 전환 의무 | 🔗 dps.texas.gov" },
    { title: "차량 등록·검사", desc: "텍사스 연 1회 차량 안전검사 필수 → Harris County Tax Office에서 등록 | 🔗 txdmv.gov" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "영주권·비자 갱신", desc: "USCIS 공식 사이트: uscis.gov | 휴스턴·슈거랜드 이민 변호사 다수 활동 | 🔗 uscis.gov" },
  ] : citySlug === "atlanta" ? [
    { title: "SSN 신청", desc: "📍 Social Security Office | 401 W Peachtree St NW, Atlanta GA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "조지아 운전면허 (GA DDS)", desc: "📍 2801 Camp Creek Pkwy, College Park GA | 예약 필수 🔗 dds.georgia.gov\n⚠️ 이주 30일 이내 전환 의무. 한국 면허 소지자 필기+실기 응시" },
    { title: "차량 등록", desc: "귀넷·풀턴·클레이튼 카운티 세금청(Tax Commissioner) 방문. 조지아 연 1회 등록세 납부 | 🔗 mvd.dor.ga.gov" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "영주권·비자 갱신", desc: "USCIS 공식 사이트: uscis.gov | 둘루스·스와니·존스크릭 이민 변호사 다수 활동 | 🔗 uscis.gov" },
  ] : citySlug === "philadelphia" ? [
    { title: "SSN 신청", desc: "📍 Social Security Office | 1101 Market St, Philadelphia PA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "펜실베이니아 운전면허 (PA DMV)", desc: "📍 2415 N 5th St, Philadelphia PA | 예약 필수 🔗 dmv.pa.gov\n⚠️ 이주 60일 이내 전환 의무. 한국 면허 소지자 필기+실기 응시" },
    { title: "Pennie — PA 건강보험", desc: "펜실베이니아 주 의료보험 마켓플레이스. 소득 기준 보조금. Medicaid(PA Medical Assistance) 확인 | 🔗 pennie.com" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "영주권·비자 갱신", desc: "USCIS 공식 사이트: uscis.gov | 어퍼다비·체리힐 이민 변호사 다수 활동 | 🔗 uscis.gov" },
  ] : citySlug === "kansascity" ? [
    { title: "SSN 신청", desc: "📍 Social Security Office | 2400 Troost Ave, Kansas City MO | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "KS/MO 운전면허", desc: "KS: 오버랜드파크 DMV 📍 6000 Lamar Ave, Mission KS | 🔗 ksrevenue.gov\nMO: 📍 2251 Fenton Business Park Ct | 🔗 dor.mo.gov\n⚠️ 이주 90일 이내 전환 의무" },
    { title: "HealthCare.gov 건강보험", desc: "KS·MO 모두 연방 마켓플레이스 사용. 소득 기준 보조금 가능. Medicaid(KanCare/MO HealthNet) 별도 확인 | 🔗 healthcare.gov" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "영주권·비자 갱신", desc: "USCIS 공식 사이트: uscis.gov | 오버랜드파크 이민 변호사 활동 | 🔗 uscis.gov" },
  ] : citySlug === "miami" ? [
    { title: "SSN 신청", desc: "📍 Social Security Office | 51 SW 1st Ave, Miami FL | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "플로리다 운전면허 (FL DHSMV)", desc: "📍 5975 NW 7th Ave, Miami FL | 예약 필수 🔗 flhsmv.gov\n⚠️ 이주 30일 이내 전환 의무. 한국 면허 소지자 필기+실기 응시. 영어·스페인어 선택 가능" },
    { title: "HealthCare.gov 건강보험", desc: "FL은 연방 마켓플레이스 사용. 소득 기준 보조금. FL Medicaid 별도 확인 | 🔗 healthcare.gov" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "영주권·비자 갱신", desc: "USCIS 공식 사이트: uscis.gov | 도랄·마이애미 이민 변호사 다수 활동 | 🔗 uscis.gov" },
  ] : citySlug === "mexicocity" ? [
    { title: "RFC 등록 (납세자 번호)", desc: "멕시코 취업·사업 필수. 📍 SAT 오피스 방문 또는 sat.gob.mx 온라인 등록\n현지 회계사(Contador) 도움 강력 권장 | 📞 한국 대사관: 55-5202-9866" },
    { title: "멕시코 운전면허 (SEMOVI)", desc: "📍 SEMOVI 오피스 방문. 여권·RFC·주소 증명 필요. 필기시험 스페인어\n한국 면허 직접 전환 불가. Semovi.cdmx.gob.mx" },
    { title: "FM3/Residente Temporal 비자", desc: "취업·장기 체류 필수. INM(이민청) 방문 또는 대사관 신청\n현지 이민 변호사 도움 권장 | 🔗 www.gob.mx/inm" },
    { title: "IMSS 또는 사립 의료보험", desc: "주재원: 회사 단체보험. 독립: IMSS(사회보험) 또는 사립 보험 가입\n사립 병원 이용 시 사립 보험 필수 | 🔗 imss.gob.mx" },
    { title: "한국 대사관 등록", desc: "장기 체류자는 재외국민 등록 권장. 여권 갱신·영사 서비스. 📞 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko" },
  ] : citySlug === "guadalajara" ? [
    { title: "RFC 등록 (납세자 번호)", desc: "멕시코 취업·사업 필수. sat.gob.mx 온라인 또는 과달라하라 SAT 오피스 방문\n현지 회계사 도움 권장 | 📞 한국 대사관(CDMX): 55-5202-9866" },
    { title: "할리스코주 운전면허 (SEMOVI Jalisco)", desc: "📍 할리스코주 SEMOVI 오피스. 여권·RFC 필요. 필기시험 스페인어\n🔗 jalisco.gob.mx" },
    { title: "FM3/Residente Temporal 비자", desc: "취업·장기 체류 필수. 과달라하라 INM 오피스 방문\n현지 이민 변호사 도움 권장 | 🔗 www.gob.mx/inm" },
    { title: "IMSS 또는 사립 의료보험", desc: "주재원: 회사 단체보험. 독립: IMSS 또는 사립 보험 가입 | 🔗 imss.gob.mx" },
    { title: "한국 대사관 등록 (CDMX)", desc: "장기 체류자 재외국민 등록. 과달라하라 → 멕시코시티 대사관 관할\n📞 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko" },
  ] : citySlug === "monterrey" ? [
    { title: "RFC 등록 (납세자 번호)", desc: "멕시코 취업·사업 필수. 주재원은 회사 HR 통해 처리 가능\n개인: sat.gob.mx 또는 누에보레온주 SAT 오피스 | 📞 한국 대사관: 55-5202-9866" },
    { title: "누에보레온주 운전면허 (SEMOVI NL)", desc: "📍 누에보레온주 SEMOVI 오피스. 여권·RFC 필요\n주재원은 법인 차량 운전 별도 규정 확인 | 🔗 nl.gob.mx" },
    { title: "FM3/Residente Temporal 비자", desc: "취업·장기 체류 필수. 주재원: 본사 파견 서류로 간소화 가능\n몬테레이 INM 오피스 방문 | 🔗 www.gob.mx/inm" },
    { title: "IMSS 또는 회사 단체보험", desc: "주재원: 회사 단체보험(Christus Muguerza 등 사립 연계). IMSS보다 사립 병원 권장" },
    { title: "한국 대사관 등록 (CDMX)", desc: "장기 체류자 재외국민 등록. 몬테레이 → 멕시코시티 대사관 관할\n📞 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko" },
  ] : [
    // seattle default
    { title: "SSN 신청", desc: "사회보장청(SSA) 오피스 | 📍 915 2nd Ave #3605, Seattle WA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "WA 운전면허 (DOL)", desc: "✅ 한국어 필기 가능! Lynnwood DOL: 18023 Hwy 99 N | Everett DOL: 3601 Wetmore Ave | 🔗 dol.wa.gov" },
    { title: "WA Healthplanfinder (건강보험)", desc: "WA 주 마켓플레이스. Washington Apple Health (Medicaid) 소득 기준 무료. 🔗 wahealthplanfinder.org" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장 | 🔗 irs.gov/itin" },
    { title: "영주권·비자 갱신 + 시민권", desc: "USCIS: uscis.gov | 린우드·벨뷰 이민 변호사 다수 활동\n시민권(N-400): 영주권 5년 후. 한인 교회 시민권 클래스 운영" },
  ];
  const adminEn = citySlug === "sf" ? [
    { title: "SSN Application", desc: "📍 Social Security Office | 1750 Mission St, San Francisco CA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "California Driver License (DMV)", desc: "📍 1515 S 1st St, San Jose CA | Book: appointments.dmv.ca.gov\n⚠️ Must visit within 10 days of moving to CA. Written test in English only. Korean license holders must take both written & road tests | 🔗 dmv.ca.gov" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "Covered California (Health Insurance)", desc: "CA state health insurance marketplace. Income-based subsidies available. Medi-Cal (Medicaid) available for low income | 🔗 coveredca.com" },
    { title: "Green Card / Visa Renewal", desc: "USCIS official site | Many immigration attorneys in San Jose & SF area | 🔗 uscis.gov" },
  ] : citySlug === "newyork" ? [
    { title: "SSN Application", desc: "📍 SSA Manhattan Office | 123 W 125th St, New York NY | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "New York Driver License (DMV)", desc: "📍 11 Broadway, New York NY | 🔗 dmv.ny.gov appointment required\n⚠️ Must transfer within 30 days of moving to NY. Korean license holders must take both written & road tests" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "NY Health Insurance (NY State of Health)", desc: "New York state health insurance marketplace. Income-based subsidies available. NY Essential Plan (Medicaid) — free for income $0–200% FPL | 🔗 nystateofhealth.ny.gov" },
    { title: "Green Card / Visa Renewal", desc: "USCIS New York office | Many immigration attorneys in Manhattan & Flushing | 🔗 uscis.gov" },
  ] : citySlug === "nashville" ? [
    { title: "SSN Application", desc: "📍 SSA Nashville Office | 801 Broadway Ste 1000, Nashville TN | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "Tennessee Driver License (DDS)", desc: "📍 44 Vantage Way Ste 160, Nashville TN | 🔗 tn.gov/safety\n⚠️ Must transfer within 30 days of moving to TN (faster than most states!). ITIN accepted instead of SSN" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "TN Health Insurance (TennCare)", desc: "Tennessee Medicaid. Income-based — prioritizes low-income households. Also check HealthCare.gov marketplace | 🔗 tn.gov/tenncare" },
    { title: "Green Card / Visa Renewal", desc: "USCIS Nashville office | Many immigration attorneys in Nashville | 🔗 uscis.gov" },
  ] : citySlug === "boston" ? [
    { title: "SSN Application", desc: "📍 SSA Boston Office | 10 Causeway St Rm 148, Boston MA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "Massachusetts Driver License (RMV)", desc: "📍 630 Washington St, Boston MA | 🔗 mass.gov/rmv appointment required\n⚠️ Must transfer within 60 days of moving to MA. F-1 students eligible during valid visa period" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "MA Health Insurance (Health Connector)", desc: "Massachusetts health insurance marketplace. Among the best coverage in the US. Income-based subsidies & free plans available | 🔗 mahealthconnector.org" },
    { title: "Green Card / Visa Renewal", desc: "USCIS Boston office | Many immigration attorneys near Harvard & MIT | 🔗 uscis.gov" },
  ] : citySlug === "la" ? [
    { title: "SSN Application", desc: "📍 SSA LA Office | 3415 S Figueroa St, Los Angeles CA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "California Driver License (DMV)", desc: "📍 3100 W 6th St, Los Angeles CA (near Koreatown) | 🔗 appointments.dmv.ca.gov — appointment required\n⚠️ Must visit within 10 days of moving to CA. Written test English only. Korean license holders must take both written & road tests" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Many Korean CPAs in Koreatown | 🔗 irs.gov/itin" },
    { title: "Covered California (Health Insurance)", desc: "CA state health insurance marketplace. Income-based subsidies available. Medi-Cal (free Medicaid) also available | 🔗 coveredca.com" },
    { title: "Green Card / Visa Renewal", desc: "USCIS LA office | Many immigration attorneys in Koreatown & Torrance | 🔗 uscis.gov" },
  ] : citySlug === "toronto" ? [
    { title: "SIN Application (Social Insurance Number)", desc: "📍 Visit Service Canada office | Apply immediately after PR/work permit\n🇨🇦 Canada's equivalent of SSN. Required for employment, taxes & banking | 🔗 canada.ca/sin" },
    { title: "Ontario Driver's Licence (G System)", desc: "🔗 drivetest.ca appointment required\nKorean licence holders: G1 written test EXEMPT! → Road test only\nG1: No highway, need supervisor (1yr) → G2 → G (full)" },
    { title: "OHIP Health Insurance", desc: "Ontario's FREE health insurance. 3-month wait after moving → then ALL healthcare is free!\nApply at ServiceOntario. Get temporary private insurance during wait | 🔗 ontario.ca/ohip" },
    { title: "Canadian Immigration (IRCC)", desc: "Express Entry, Provincial Nominee Program (PNP), study/work permits.\nIRCC instead of USCIS. Many Korean immigration lawyers in Toronto | 🔗 canada.ca/immigration" },
    { title: "Canadian Bank Account", desc: "RBC, TD, Scotiabank, CIBC recommended. SIN + passport sufficient to open\nNo credit history? Start with Secured Credit Card | 🔗 rbc.com" },
  ] : citySlug === "vancouver" ? [
    { title: "SIN Application (Social Insurance Number)", desc: "📍 Visit Service Canada office | Apply immediately after PR/work permit\n🇨🇦 Required for employment, taxes & banking in Canada | 🔗 canada.ca/sin" },
    { title: "BC Driver's Licence (ICBC)", desc: "🔗 icbc.com online appointment\n✅ Korean licence holders: Knowledge test EXEMPT! → Road test only\nMust transfer to BC licence within 90 days of moving" },
    { title: "MSP Health Insurance", desc: "BC's FREE health insurance. 3-month wait after moving → then ALL healthcare is free!\nApply online: hibc.gov.bc.ca | Get temporary private insurance during wait | 🔗 gov.bc.ca/msp" },
    { title: "Canadian Immigration (IRCC)", desc: "BC PNP, Tech Pilot, study/work permits. IRCC instead of USCIS.\nMany Korean immigration lawyers in Vancouver | 🔗 canada.ca/immigration" },
    { title: "BC Bank Account", desc: "RBC, TD, Scotiabank, CIBC, VanCity (Vancouver credit union) recommended\nSIN + passport to open. No credit history? Start with Secured Card | 🔗 rbc.com" },
  ] : citySlug === "dallas" ? [
    { title: "SSN Application", desc: "📍 Social Security Office | 1901 N Central Expy, McKinney TX | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "Texas Driver License (DPS)", desc: "📍 1149 E Belt Line Rd, Carrollton TX | Online appointment required! 🔗 appointments.dps.texas.gov\n⚠️ Must transfer within 90 days of moving to Texas | 🔗 dps.texas.gov" },
    { title: "Vehicle Registration & Inspection", desc: "Texas requires annual Safety Inspection → register at county Tax Office\nInspection: Firestone, Jiffy Lube near Carrollton | 🔗 txdmv.gov" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "Green Card / Visa Renewal", desc: "USCIS official site | Many immigration attorneys in Dallas/Carrollton area | 🔗 uscis.gov" },
  ] : citySlug === "houston" ? [
    { title: "SSN Application", desc: "📍 Social Security Office | 2505 Murworth Dr, Houston TX | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "Texas Driver License (DPS)", desc: "📍 6900 Rankin Rd, Houston TX | Online appointment required! 🔗 appointments.dps.texas.gov\n⚠️ Must transfer within 90 days of moving to Texas | 🔗 dps.texas.gov" },
    { title: "Vehicle Registration & Inspection", desc: "Texas annual Safety Inspection required → register at Harris County Tax Office | 🔗 txdmv.gov" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "Green Card / Visa Renewal", desc: "USCIS official site | Many immigration attorneys in Houston/Sugar Land area | 🔗 uscis.gov" },
  ] : citySlug === "atlanta" ? [
    { title: "SSN Application", desc: "📍 Social Security Office | 401 W Peachtree St NW, Atlanta GA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "Georgia Driver License (GA DDS)", desc: "📍 2801 Camp Creek Pkwy, College Park GA | Appointment: dds.georgia.gov\n⚠️ Must transfer within 30 days of moving to GA. Korean licence holders must take written & road tests" },
    { title: "Vehicle Registration", desc: "Visit Gwinnett or Fulton County Tax Commissioner. Annual Georgia registration fee. 🔗 mvd.dor.ga.gov" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "Green Card / Visa Renewal", desc: "USCIS official site | Many immigration attorneys in Duluth/Suwanee/Johns Creek | 🔗 uscis.gov" },
  ] : citySlug === "philadelphia" ? [
    { title: "SSN Application", desc: "📍 Social Security Office | 1101 Market St, Philadelphia PA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "Pennsylvania Driver License (PA DMV)", desc: "📍 2415 N 5th St, Philadelphia PA | Appointment: dmv.pa.gov\n⚠️ Must transfer within 60 days. Korean licence holders must take both written & road tests" },
    { title: "Pennie — PA Health Insurance Marketplace", desc: "Pennsylvania state marketplace. Income-based subsidies. PA Medical Assistance (Medicaid) available | 🔗 pennie.com" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "Green Card / Visa Renewal", desc: "USCIS official site | Immigration attorneys in Upper Darby & Cherry Hill | 🔗 uscis.gov" },
  ] : citySlug === "kansascity" ? [
    { title: "SSN Application", desc: "📍 Social Security Office | 2400 Troost Ave, Kansas City MO | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "KS or MO Driver License", desc: "KS: Overland Park DMV 📍 6000 Lamar Ave, Mission KS | 🔗 ksrevenue.gov\nMO: 🔗 dor.mo.gov\n⚠️ Must transfer within 90 days of moving" },
    { title: "HealthCare.gov Health Insurance", desc: "Both KS & MO use federal marketplace. Income-based subsidies. KanCare/MO HealthNet (Medicaid) separate | 🔗 healthcare.gov" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "Green Card / Visa Renewal", desc: "USCIS official site | Immigration attorneys in Overland Park area | 🔗 uscis.gov" },
  ] : citySlug === "miami" ? [
    { title: "SSN Application", desc: "📍 Social Security Office | 51 SW 1st Ave, Miami FL | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "Florida Driver License (FL DHSMV)", desc: "📍 5975 NW 7th Ave, Miami FL | Appointment: flhsmv.gov\n⚠️ Must transfer within 30 days. Korean licence holders must take written & road tests. English or Spanish available" },
    { title: "HealthCare.gov Health Insurance", desc: "FL uses federal marketplace. Income-based subsidies. FL Medicaid separate check | 🔗 healthcare.gov" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "Green Card / Visa Renewal", desc: "USCIS official site | Many immigration attorneys in Doral/Miami area | 🔗 uscis.gov" },
  ] : citySlug === "mexicocity" ? [
    { title: "RFC Registration (Mexican Tax ID)", desc: "Required for work & banking in Mexico. 📍 SAT office visit or sat.gob.mx online registration\nLocal accountant (contador) help strongly recommended | 📞 Korean Embassy: 55-5202-9866" },
    { title: "Mexican Driver's Licence (SEMOVI CDMX)", desc: "📍 SEMOVI office. Passport + RFC + address proof. Written test in Spanish required\nKorean licence cannot be directly transferred | 🔗 semovi.cdmx.gob.mx" },
    { title: "FM3 / Residente Temporal Visa", desc: "Required for work & long-term stay. Visit INM (immigration authority)\nLocal immigration lawyer recommended | 🔗 www.gob.mx/inm" },
    { title: "IMSS or Private Health Insurance", desc: "Expats: company group insurance. Independent: IMSS social insurance or private plan\nPrivate insurance required for private hospitals | 🔗 imss.gob.mx" },
    { title: "Korean Embassy Registration", desc: "Overseas Korean registration recommended for long-term residents. Passport renewal & consular services\n📞 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko" },
  ] : citySlug === "guadalajara" ? [
    { title: "RFC Registration (Mexican Tax ID)", desc: "Required for work & banking. sat.gob.mx online or Guadalajara SAT office\nLocal accountant help recommended | 📞 Korean Embassy (CDMX): 55-5202-9866" },
    { title: "Jalisco State Driver's Licence (SEMOVI Jalisco)", desc: "📍 SEMOVI Jalisco office. Passport + RFC required. Written test in Spanish\n🔗 jalisco.gob.mx" },
    { title: "FM3 / Residente Temporal Visa", desc: "Required for work & long-term stay. Visit Guadalajara INM office\nLocal immigration lawyer recommended | 🔗 www.gob.mx/inm" },
    { title: "IMSS or Private Health Insurance", desc: "Expats: company group insurance. Independent: IMSS or private plan | 🔗 imss.gob.mx" },
    { title: "Korean Embassy Registration (CDMX)", desc: "Guadalajara is under Korean Embassy Mexico City jurisdiction\n📞 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko" },
  ] : citySlug === "monterrey" ? [
    { title: "RFC Registration (Mexican Tax ID)", desc: "Required for work & banking. Expats: company HR can assist\nIndividual: sat.gob.mx or Nuevo León SAT office | 📞 Korean Embassy: 55-5202-9866" },
    { title: "Nuevo León Driver's Licence (SEMOVI NL)", desc: "📍 SEMOVI Nuevo León office. Passport + RFC required\nExpats in company vehicles: check corporate vehicle regulations | 🔗 nl.gob.mx" },
    { title: "FM3 / Residente Temporal Visa", desc: "Required for work & long-term stay. Expats: company dispatch paperwork can simplify\nVisit Monterrey INM office | 🔗 www.gob.mx/inm" },
    { title: "IMSS or Company Group Insurance", desc: "Expats: company group insurance (linked to Christus Muguerza etc.). Private hospitals strongly recommended over IMSS" },
    { title: "Korean Embassy Registration (CDMX)", desc: "Monterrey is under Korean Embassy Mexico City jurisdiction\n📞 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko" },
  ] : [
    // seattle default
    { title: "SSN Application", desc: "Social Security Office | 📍 915 2nd Ave #3605, Seattle WA | 📞 800-772-1213 | 🔗 ssa.gov" },
    { title: "WA Driver License (DOL)", desc: "✅ Written test available in Korean! Lynnwood DOL: 18023 Hwy 99 N | Everett DOL: 3601 Wetmore Ave | 🔗 dol.wa.gov" },
    { title: "WA Healthplanfinder (Health Insurance)", desc: "WA state marketplace. Washington Apple Health (Medicaid) — income-based free. 🔗 wahealthplanfinder.org" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended | 🔗 irs.gov/itin" },
    { title: "Green Card / Visa Renewal + Citizenship", desc: "USCIS: uscis.gov | Immigration attorneys in Lynnwood & Bellevue\nCitizenship (N-400): Eligible 5 years after green card. Korean churches offer civics prep classes" },
  ];

  const financeKo = citySlug === "sf" || citySlug === "la" ? [
    { title: "Chase Total Checking", desc: "한인 커뮤니티 추천 1위. 전국 ATM 많음. $500 개설 보너스 | 🔗 chase.com" },
    { title: "Hanmi Bank / Open Bank", desc: "한인 커뮤니티 은행. 한국어 서비스. 코리아타운·산호세 지점 다수 | 🔗 hanmi.com" },
    { title: "⚠️ CA 세금 주의 (매우 중요!)", desc: "캘리포니아 주 소득세: 1%~13.3% (누진, 전국 최고!)\n판매세(Sales Tax): 약 9.25% (산타클라라) / 10.25% (LA)\n→ 연봉 협상 시 반드시 CA 세금 포함하여 계산!" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "직장 401K 매칭 100% 챙기기. CA 소득세 높으므로 세전 기여(Traditional 401K) 전략 활용" },
  ] : citySlug === "newyork" ? [
    { title: "Chase Total Checking / Citibank", desc: "한인 커뮤니티 추천. 뉴욕 전역 ATM 풍부 | 🔗 chase.com | 🔗 citibank.com" },
    { title: "Shinhan Bank America (신한은행)", desc: "뉴욕 플러싱 한인 은행. 한국어 서비스. 한국→미국 송금 유리 | 🔗 shinhanbank.com" },
    { title: "NY 세금 안내", desc: "연방 소득세 + 뉴욕주 소득세(4%~10.9%) + 뉴욕시 소득세(3.078%~3.876%) 3중 과세!\n판매세: 뉴욕시 8.875%\n→ 맨해튼 거주 시 총 세 부담 매우 높음" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "직장 401K 매칭 100% 챙기기. NY는 세 부담이 높으므로 세전 기여 전략 적극 활용" },
  ] : citySlug === "dallas" || citySlug === "houston" ? [
    { title: "Chase Total Checking / Wells Fargo", desc: "한인 커뮤니티 추천. 텍사스 전역 ATM 풍부 | 🔗 chase.com" },
    { title: "Prosperity Bank / Comerica Bank", desc: "텍사스 지역 은행. 한인 딜러·사업체 활용도 높음" },
    { title: "✅ 텍사스 세금 혜택 (매우 유리!)", desc: "주 소득세 없음! (No State Income Tax)\n판매세(Sales Tax): 8.25% (텍사스 최고)\n재산세: 높음 (주택 소유 시 연 $5,000-15,000+)\n→ 연봉 대비 실수령액이 CA·NY보다 훨씬 높음!" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "소득세 없음 → Roth IRA 매우 유리! 세후 기여 후 복리 성장" },
  ] : citySlug === "toronto" || citySlug === "vancouver" ? [
    { title: "RBC / TD / Scotiabank", desc: "캐나다 5대 은행. 한인 직원 있는 지점 찾기. SIN + 여권으로 개설 | 🔗 rbc.com | 🔗 td.com" },
    { title: citySlug === "toronto" ? "Hanmi Bank Toronto 없음 → Simplii / EQ Bank" : "VanCity 신협 (밴쿠버 추천)", desc: citySlug === "toronto" ? "Simplii Financial(CIBC 계열): 수수료 없는 온라인 뱅킹. EQ Bank: 이자율 높은 저축계좌" : "VanCity: 밴쿠버 최대 신협. 친환경·지역사회 중심. 수수료 낮음 | 🔗 vancity.com" },
    { title: "캐나다 세금 안내", desc: citySlug === "toronto" ? "연방 소득세(15%~33%) + 온타리오 주 소득세(5.05%~13.16%)\n캐나다 HST(판매세): 온타리오 13%\n→ 의료보험 무료 (OHIP) = 세금 많지만 혜택도 큼!" : "연방 소득세(15%~33%) + BC 주 소득세(5.06%~20.5%)\n캐나다 GST+PST(판매세): BC 5%+7%=12%\n→ 의료보험 무료 (MSP) = 세금 많지만 혜택 큼!" },
    { title: "캐나다 신용 빌드 시작", desc: "미국 신용 이력은 캐나다에서 인정 안 됨! Secured Credit Card로 캐나다 신용 별도 구축" },
    { title: "RRSP / TFSA (캐나다 은퇴·저축)", desc: "RRSP: 세전 소득 공제 (한국 연금 IRP와 유사). TFSA: 세후 기여, 운용 수익 비과세. 두 계좌 모두 최대한 활용!" },
  ] : citySlug === "mexicocity" || citySlug === "guadalajara" || citySlug === "monterrey" ? [
    { title: "BBVA México / Santander / Citibanamex", desc: "멕시코 주요 은행. 여권+RFC+주소 증명으로 개설. ATM 수수료 주의 | 🔗 bbva.mx" },
    { title: "Banorte (멕시코 토종 은행)", desc: "멕시코 최대 국내 은행. 몬테레이 본부. 주재원에게도 친숙 | 🔗 banorte.com" },
    { title: "멕시코 세금 안내", desc: "연방 ISR (소득세): 1.92%~35% (누진)\nIVA (부가가치세): 16% (식료품·의약품 면세)\nRFC 없으면 취업·사업·은행 계좌 불가!\n→ 현지 회계사(contador) 상담 필수" },
    { title: "한국→멕시코 송금", desc: "Wise (구TransferWise): 환율 유리, 수수료 낮음 | 🔗 wise.com\n웨스턴유니온·MoneyGram도 가능하지만 환율 불리" },
    { title: "신용 빌드 (멕시코)", desc: "멕시코 신용 이력은 미국·캐나다 신용과 별개.\n첫 신용카드: 주거래 은행(BBVA 등) Secured 카드로 시작" },
  ] : citySlug === "boston" ? [
    { title: "Chase Total Checking / Citizens Bank", desc: "한인 커뮤니티 추천. 보스턴 전역 ATM | 🔗 chase.com | 🔗 citizensbank.com" },
    { title: "MA 세금 안내", desc: "매사추세츠 주 소득세: 5% (단일세율, 비교적 단순)\n판매세(Sales Tax): 6.25% (MA는 의류·식품 면세)\n→ 의료보험 강제 가입 의무 있음 (MA 전국 최고 수준)" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "직장 401K 매칭 100% 챙기기. 의료보험 비용 고려하여 재정 계획 수립" },
    { title: "MBTA 교통 카드 (CharlieCard)", desc: "보스턴 지하철·버스 통합 카드. 월정기권 $90. 학생 50% 할인 | 🔗 mbta.com" },
  ] : citySlug === "nashville" ? [
    { title: "Chase Total Checking / Avenue Bank", desc: "내쉬빌 한인 커뮤니티 추천. 전국 ATM 풍부 | 🔗 chase.com" },
    { title: "✅ 테네시 세금 혜택", desc: "주 소득세 없음! (No State Income Tax)\n판매세(Sales Tax): 9.25% (식료품 포함 — TN은 식료품 세금 있음)\n→ 텍사스와 함께 세금 가장 유리한 주 중 하나" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "소득세 없음 → Roth IRA 매우 유리! 세후 기여 후 복리 성장" },
    { title: "내쉬빌 한인 CPA 네트워크", desc: "내쉬빌 한인회·교회 통해 한인 CPA 연결. 세금 신고·FBAR·FATCA 상담" },
  ] : citySlug === "atlanta" ? [
    { title: "Chase Total Checking / Wells Fargo", desc: "한인 커뮤니티 추천. 애틀랜타 전역 ATM | 🔗 chase.com" },
    { title: "SunTrust → Truist Bank", desc: "남부 지역 주요 은행. 스와니·존스크릭 지점 다수" },
    { title: "조지아 세금 안내", desc: "GA 주 소득세: 5.75% (비교적 낮음)\n판매세(Sales Tax): 귀넷 카운티 7%\n→ 텍사스·TN보다 높지만 NY·CA보다 훨씬 낮음" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "직장 401K 매칭 100% 챙기기. GA 소득세 낮음 → Roth IRA 고려" },
  ] : citySlug === "philadelphia" ? [
    { title: "Chase Total Checking / PNC Bank", desc: "한인 커뮤니티 추천. 필라델피아 전역 ATM | 🔗 chase.com | 🔗 pnc.com" },
    { title: "PA 세금 안내", desc: "PA 주 소득세: 3.07% (전국 낮은 편)\n판매세(Sales Tax): 8% (필라델피아시 추가 2%)\n필라델피아시 임금세: 3.79% (거주자) 추가!\n→ 도시 거주 시 임금세 부담 있음" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "직장 401K 매칭 100% 챙기기. PA는 401K 기여 시 PA 소득세도 공제됨" },
    { title: "필라 한인 CPA 네트워크", desc: "필라델피아 한인회·교회 통해 한인 CPA 연결. FBAR·FATCA·PA 세금 상담" },
  ] : citySlug === "kansascity" ? [
    { title: "Chase Total Checking / Commerce Bank", desc: "한인 커뮤니티 추천. KC 전역 ATM | 🔗 chase.com | 🔗 commercebank.com" },
    { title: "UMB Bank (KC 지역 은행)", desc: "캔자스시티 토종 은행. 지역 사업체·한인 딜러 활용도 높음 | 🔗 umb.com" },
    { title: "KS/MO 세금 안내", desc: "KS 주 소득세: 3.1%~5.7%\nMO 주 소득세: 0%~4.95%\n판매세: KS 9.5% / MO 8.1% (오버랜드파크)\n→ 오버랜드파크(KS) vs KC(MO) 거주지에 따라 세금 다름!" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "직장 401K 매칭 100% 챙기기. KC 한인 CPA 한인회·교회 통해 연결" },
  ] : citySlug === "miami" ? [
    { title: "Chase Total Checking / Bank of America", desc: "한인 커뮤니티 추천. 마이애미 전역 ATM 풍부 | 🔗 chase.com" },
    { title: "✅ 플로리다 세금 혜택", desc: "주 소득세 없음! (No State Income Tax)\n판매세(Sales Tax): 7% (마이애미데이드 카운티)\n→ 히스패닉 비즈니스 환경 + 세금 혜택 = 라틴아메리카 한인 사업 허브" },
    { title: "스페인어 뱅킹 환경", desc: "도랄 지역 은행은 스페인어 주 언어. 한인 직원 있는 지점 미리 확인 권장" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "소득세 없음 → Roth IRA 매우 유리! 마이애미 한인 CPA 한인회 통해 연결" },
  ] : [
    // seattle default
    { title: "Chase Total Checking", desc: "한인 커뮤니티 추천 1위. 전국 ATM 많음. $500 개설 보너스 이벤트 자주 있음 | 🔗 chase.com" },
    { title: "WA Federal Credit Union (시애틀 전용)", desc: "시애틀 한인 선호 신협. 자동차 대출 금리 경쟁력 있음 | 🔗 wafederal.com" },
    { title: "✅ WA 세금 혜택", desc: "주 소득세 없음! (No State Income Tax)\n판매세(Sales Tax): 약 10.25% (시애틀)\n→ 연봉 대비 실수령액이 CA·NY보다 훨씬 높음!" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver/Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "직장 401K 매칭 100% 챙기기. 소득세 없음 → Roth IRA 전략도 유리" },
  ];

  const financeEn = citySlug === "sf" || citySlug === "la" ? [
    { title: "Chase Total Checking", desc: "#1 in Korean community. Nationwide ATMs. Frequent $500 opening bonus | 🔗 chase.com" },
    { title: "Hanmi Bank / Open Bank", desc: "Korean community banks. Korean-language service. Many branches in Koreatown & San Jose | 🔗 hanmi.com" },
    { title: "⚠️ California Tax Warning (Critical!)", desc: "CA state income tax: 1%–13.3% (highest in the US!)\nSales Tax: ~9.25% (Santa Clara) / 10.25% (LA)\n→ Always factor CA taxes into salary negotiations!" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "Max employer 401K match. High CA taxes → prioritize Traditional 401K (pre-tax contributions)" },
  ] : citySlug === "newyork" ? [
    { title: "Chase Total Checking / Citibank", desc: "Korean community recommended. Abundant ATMs in NYC | 🔗 chase.com | 🔗 citibank.com" },
    { title: "Shinhan Bank America", desc: "Korean bank in Flushing. Korean-language service. Competitive Korea-US wire transfers | 🔗 shinhanbank.com" },
    { title: "NY Tax Warning — Triple Taxation!", desc: "Federal income tax + NY State income tax (4%–10.9%) + NYC income tax (3.078%–3.876%)\nSales Tax: 8.875% in NYC\n→ Manhattan residents pay among the highest taxes in the US" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "Max employer 401K match. High NY taxes → pre-tax 401K contributions strategically important" },
  ] : citySlug === "dallas" || citySlug === "houston" ? [
    { title: "Chase Total Checking / Wells Fargo", desc: "Korean community recommended. Abundant ATMs in Texas | 🔗 chase.com" },
    { title: "Prosperity Bank / Comerica Bank", desc: "Texas regional banks. Good for Korean dealers and small businesses" },
    { title: "✅ Texas Tax Advantage (Major Benefit!)", desc: "No State Income Tax! (No State Income Tax)\nSales Tax: 8.25% (Texas max)\nProperty Tax: High if you own ($5,000-15,000+/yr)\n→ Take-home pay much higher vs CA or NY!" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "No state income tax → Roth IRA is very attractive! After-tax contributions grow tax-free" },
  ] : citySlug === "toronto" || citySlug === "vancouver" ? [
    { title: "RBC / TD / Scotiabank", desc: "Canada's Big 5 banks. Find branches with Korean staff. SIN + passport to open | 🔗 rbc.com | 🔗 td.com" },
    { title: citySlug === "toronto" ? "Simplii Financial / EQ Bank" : "VanCity Credit Union (Vancouver)", desc: citySlug === "toronto" ? "Simplii Financial (CIBC subsidiary): fee-free online banking. EQ Bank: high-interest savings account" : "VanCity: Vancouver's largest credit union. Lower fees, community-focused | 🔗 vancity.com" },
    { title: "Canadian Tax Overview", desc: citySlug === "toronto" ? "Federal income tax (15%–33%) + Ontario provincial tax (5.05%–13.16%)\nOntario HST: 13%\n→ More tax than US, but FREE healthcare (OHIP) makes up for it!" : "Federal income tax (15%–33%) + BC provincial tax (5.06%–20.5%)\nBC GST+PST: 5%+7%=12%\n→ More tax than US, but FREE healthcare (MSP) included!" },
    { title: "Building Canadian Credit", desc: "US credit history is NOT recognized in Canada! Start fresh with a Secured Credit Card at your Canadian bank" },
    { title: "RRSP / TFSA (Canadian Retirement & Savings)", desc: "RRSP: Pre-tax deduction (similar to US Traditional IRA). TFSA: After-tax, all growth TAX-FREE. Max both accounts!" },
  ] : citySlug === "mexicocity" || citySlug === "guadalajara" || citySlug === "monterrey" ? [
    { title: "BBVA México / Santander / Citibanamex", desc: "Mexico's major banks. Passport + RFC + address proof required. Watch ATM fees | 🔗 bbva.mx" },
    { title: "Banorte (Mexico's Largest Domestic Bank)", desc: "Mexico's biggest domestic bank. HQ in Monterrey. Good for business accounts | 🔗 banorte.com" },
    { title: "Mexico Tax Overview", desc: "Federal ISR (income tax): 1.92%–35% (progressive)\nIVA (VAT): 16% (groceries & meds exempt)\nNo RFC = no job, no bank account, no business!\n→ Hire a local contador (accountant) — essential" },
    { title: "Korea→Mexico Money Transfer", desc: "Wise (formerly TransferWise): best exchange rates, low fees | 🔗 wise.com\nWestern Union/MoneyGram also available but less favorable rates" },
    { title: "Building Mexican Credit", desc: "Mexican credit history is separate from US/Canadian credit. Start with a Secured Card at your primary bank (BBVA etc.)" },
  ] : citySlug === "nashville" ? [
    { title: "Chase Total Checking / Wells Fargo", desc: "Korean community recommended. Nashville-area ATMs | 🔗 chase.com" },
    { title: "✅ Tennessee Tax Advantage", desc: "No State Income Tax! (No State Income Tax)\nSales Tax: 9.25% (food is taxed in TN — bring snacks from KY!)\n→ Among the most tax-friendly states along with Texas" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "No state income tax → Roth IRA is very attractive! After-tax contributions compound tax-free" },
    { title: "Nashville Korean CPA Network", desc: "Connect through Nashville Korean Association or Korean churches for Korean-speaking CPAs. FBAR, FATCA, TN tax consultation" },
  ] : citySlug === "boston" ? [
    { title: "Chase Total Checking / Citizens Bank", desc: "Korean community recommended. Boston-area ATMs | 🔗 chase.com | 🔗 citizensbank.com" },
    { title: "Massachusetts Tax Overview", desc: "MA state income tax: 5% (flat rate, relatively simple)\nSales Tax: 6.25% (MA exempts clothing & groceries)\n→ Mandatory health insurance in MA — world-class coverage" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "Max employer 401K match. Factor in health insurance costs in financial planning" },
    { title: "MBTA CharlieCard (Transit)", desc: "Boston subway & bus card. Monthly pass $90. Student 50% discount | 🔗 mbta.com" },
  ] : citySlug === "atlanta" ? [
    { title: "Chase Total Checking / Truist Bank", desc: "Korean community recommended. Atlanta-area ATMs | 🔗 chase.com" },
    { title: "Georgia Tax Overview", desc: "GA state income tax: 5.75% (relatively low)\nSales Tax: 7% (Gwinnett County)\n→ Much lower tax burden than NY/CA; slightly higher than TX/TN" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "Max employer 401K match. Lower GA tax → Roth IRA is a good option" },
    { title: "Atlanta Korean CPA Network", desc: "Connect through Duluth/Suwanee Korean Association or Korean churches. FBAR, FATCA, GA tax consultation" },
  ] : citySlug === "philadelphia" ? [
    { title: "Chase Total Checking / PNC Bank", desc: "Korean community recommended. Philadelphia-area ATMs | 🔗 chase.com | 🔗 pnc.com" },
    { title: "Pennsylvania Tax Overview", desc: "PA state income tax: 3.07% (low nationally)\nSales Tax: 8% (Philadelphia adds 2% city tax)\nPhiladelphia wage tax: 3.79% (residents) on top!\n→ City wage tax is a significant extra burden for city residents" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "Max employer 401K match. PA 401K contributions also deductible from PA state taxes" },
    { title: "Philadelphia Korean CPA Network", desc: "Connect through Korean Association or churches. FBAR, FATCA, PA tax consultation" },
  ] : citySlug === "kansascity" ? [
    { title: "Chase Total Checking / Commerce Bank", desc: "Korean community recommended. KC-area ATMs | 🔗 chase.com | 🔗 commercebank.com" },
    { title: "KS vs MO Tax Comparison", desc: "KS state income tax: 3.1%–5.7%\nMO state income tax: 0%–4.95%\nSales Tax: KS 9.5% / MO 8.1% (Overland Park)\n→ Your tax rate differs significantly by which state side you live on!" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "Max employer 401K match. KC Korean CPA available through Korean Association" },
    { title: "UMB Bank (KC Regional)", desc: "Kansas City's hometown bank. Good for local business banking | 🔗 umb.com" },
  ] : citySlug === "miami" ? [
    { title: "Chase Total Checking / Bank of America", desc: "Korean community recommended. Miami-area ATMs abundant | 🔗 chase.com" },
    { title: "✅ Florida Tax Advantage", desc: "No State Income Tax! (No State Income Tax)\nSales Tax: 7% (Miami-Dade County)\n→ Hispanic business culture + tax advantage = Latin America Korean business hub" },
    { title: "Spanish-language Banking Environment", desc: "Doral area banks operate primarily in Spanish. Find branches with Korean or English staff in advance" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "No state income tax → Roth IRA very attractive! Miami Korean CPA through Korean Association" },
  ] : [
    // seattle default
    { title: "Chase Total Checking", desc: "#1 in Korean community. Many ATMs nationwide. Frequent $500 opening bonus | 🔗 chase.com" },
    { title: "WA Federal Credit Union (Seattle only)", desc: "Seattle Korean community favorite. Competitive auto loan rates | 🔗 wafederal.com" },
    { title: "✅ Washington State Tax Advantage", desc: "No State Income Tax! (No State Income Tax)\nSales Tax: ~10.25% in Seattle\n→ Take-home pay much higher vs CA or NY!" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "Retirement accounts (401K/IRA)", desc: "Max employer 401K match. No state income tax → Roth IRA also attractive in WA" },
  ];

  // 거주지 데이터 (탭 index 5) — 도시별 분기
  const areasKo = citySlug === "sf" ? [
    { emoji: "💻", title: "산타클라라 (Santa Clara) — 한인 1번지", desc: "실리콘밸리 한인타운. H-Mart·한식당·교회 집결. El Camino Real 한인 상권. Apple·Intel·NVIDIA 인근. 렌트 1BR $2,300–2,800. Santa Clara USD (Niche A-)" },
    { emoji: "🍎", title: "쿠퍼티노 (Cupertino) — Apple HQ·최상위 학군", desc: "Apple 본사 소재지. Cupertino Union SD + Fremont Union HSD — CA 최상위권. 한인 가족 1순위. 렌트 1BR $2,500–3,200 (프리미엄). 한인 비율 높음" },
    { emoji: "🌞", title: "서니베일 (Sunnyvale) — 가성비 테크", desc: "Google·LinkedIn·Yahoo 인근. 쿠퍼티노보다 렌트 저렴. 렌트 1BR $2,100–2,600. Sunnyvale SD. 한인 커뮤니티 성장 중. VTA 교통 양호" },
    { emoji: "🌉", title: "프리몬트 (Fremont) — 한인 급성장 지역", desc: "BART 직결 → SF·산호세 출퇴근 가능. 렌트 1BR $2,000–2,500 (상대적 저렴). Fremont USD (Niche A). 한인·중국계 혼합 거주. 테슬라 공장 인근" },
    { emoji: "🏙️", title: "밀피타스 (Milpitas) — 이민자 가성비", desc: "한인·베트남계 혼합. 렌트 1BR $1,900–2,400 (Bay Area 최저렴급). H-Mart 인근. Great Mall 쇼핑. 실리콘밸리 접근 편리. BART 신규 역 개통" },
  ] : citySlug === "newyork" ? [
    { emoji: "🌸", title: "플러싱 (Flushing, Queens) — 뉴욕 한인 1번지", desc: "퀸즈 최대 한인·중국계 타운. H-Mart·한식당·교회·노래방 집결. 맨해튼보다 저렴. 렌트 1BR $1,800–2,400. 지하철 7호선 직결. 뉴욕 한인 인구 최다" },
    { emoji: "🏙️", title: "맨해튼 한인타운 (32nd St)", desc: "맨해튼 직장인 한인 선호. 한인타운 도보 거리. 렌트 1BR $2,800–4,000 (매우 비쌈). 출퇴근 최적. 지하철 N/Q/R/W·B/D/F/M 환승 허브" },
    { emoji: "🌿", title: "포트리 (Fort Lee, NJ) — 뉴저지 한인타운", desc: "뉴저지 최대 한인타운. 맨해튼 허드슨강 건너편. 렌트 1BR $1,900–2,600 (뉴욕보다 저렴). 한식당·마트·교회 집결. 학군 우수 (Fort Lee School District)" },
    { emoji: "🎓", title: "파라무스·버겐 카운티 (NJ) — 학군·가족", desc: "뉴저지 한인 가족 1순위. 우수 학군. 렌트 1BR $1,800–2,400. 한인 인구 밀집 (NJ 한인 30만+). 퇴근 시 버스·PATH로 맨해튼 접근" },
    { emoji: "💰", title: "잭슨 하이츠 (Jackson Heights, Queens)", desc: "다민족 혼합. 렌트 1BR $1,600–2,200 (뉴욕 가성비). 한인·히스패닉·인도계 공존. 지하철 E/F/M/R·7호선. 한인 식당 증가 중" },
  ] : citySlug === "nashville" ? [
    { emoji: "🌆", title: "매디슨 (Madison) — 내쉬빌 한인 1번지", desc: "H-Mart·한인회·한식당 밀집. 내쉬빌 북쪽 15분. 렌트 1BR $1,300–1,700 (저렴). 한인 교회 다수. 안전한 주거 환경" },
    { emoji: "🎵", title: "프랭클린 (Franklin) — 학군·부유층", desc: "내쉬빌 남쪽 20분. Williamson County SD — TN 최상위 학군. 렌트 1BR $1,600–2,200. 한인 가족 증가 중. 새 개발 지역으로 신축 주택 다수" },
    { emoji: "🏘️", title: "안티오크 (Antioch) — 가성비", desc: "내쉬빌 동남쪽. 렌트 1BR $1,100–1,500 (TN 최저렴급). 다민족 지역. 한인·히스패닉 혼합. 공항(BNA) 인근. 출퇴근 I-24 이용" },
    { emoji: "💼", title: "브렌트우드 (Brentwood) — 전문직", desc: "내쉬빌 남쪽 고급 주거지. 한인 의사·엔지니어 선호. 렌트 1BR $1,800–2,400. 우수 학군. 의료·테크 기업 밀집" },
    { emoji: "🎓", title: "무어스빌 (Murfreesboro) — 대학 도시", desc: "MTSU(Middle Tennessee State Univ) 소재지. 한인 유학생 거주. 렌트 1BR $1,100–1,500 (저렴). 내쉬빌 동쪽 30분" },
  ] : citySlug === "boston" ? [
    { emoji: "🎓", title: "올스턴·브라이튼 (Allston/Brighton) — 한인 1번지", desc: "보스턴 최대 한인타운. H-Mart·한식당·한인 교회 밀집. BU·하버드·MIT 유학생 1순위. 렌트 1BR $1,900–2,600. Green Line B 직결" },
    { emoji: "📚", title: "케임브리지 (Cambridge) — 하버드·MIT", desc: "하버드·MIT 주변. 한인 대학원생 다수. 렌트 1BR $2,200–3,000 (비쌈). Red Line 직결. 국제적 환경. 연구직·박사 과정 선호" },
    { emoji: "🌊", title: "퀸시 (Quincy) — 가성비 한인 주거지", desc: "보스턴 남쪽 15분. Red Line 직결. 렌트 1BR $1,600–2,100 (상대적 저렴). 한인·중국계 혼합. Quincy SD 학군 우수. 한식당 증가 중" },
    { emoji: "🏙️", title: "서머빌 (Somerville) — 젊은층 한인", desc: "보스턴 북쪽 인접. Tufts·MIT 근처. 렌트 1BR $1,900–2,500. 젊은 한인 전문직·유학생 선호. 식당·카페 활발. Green Line E 접근" },
    { emoji: "💰", title: "몰든 (Malden) — 가성비 가족", desc: "보스턴 북쪽. Orange Line 직결. 렌트 1BR $1,600–2,000 (보스턴 대비 저렴). 한인·아시안 혼합. 학군 Malden SD. 한인 가족 증가 중" },
  ] : citySlug === "la" ? [
    { emoji: "🏘️", title: "코리아타운 (Koreatown) — LA 한인 1번지", desc: "세계 최대 한인타운. 한식당·노래방·PC방·마트·교회 모두 도보. 24시간 도시. 렌트 1BR $1,800–2,500. 메트로 Purple Line 직결. 서울 느낌 그대로" },
    { emoji: "🍊", title: "세리토스 (Cerritos) — 학군·가족 1순위", desc: "LA 카운티 한인 가족 최선호. ABC Unified SD — CA 최상위 학군. 한인 인구 밀집. 렌트 1BR $1,800–2,300. H-Mart·한식당 다수. 안전하고 조용한 환경" },
    { emoji: "🌊", title: "토랜스 (Torrance) — 테크·자동차 한인", desc: "토요타·혼다 북미 본사 인근. 한인 엔지니어·주재원 다수. 렌트 1BR $1,900–2,500. 한인 교회·마트 충분. 공항(LAX) 15분. 바다도 가까움" },
    { emoji: "🌸", title: "어바인 (Irvine, OC) — 학군 최강", desc: "오렌지 카운티 한인 신흥 강자. Irvine USD — CA 최상위. UCI 인근. 한인 인구 급증. 렌트 1BR $2,200–2,900. 깨끗하고 안전. 한식당·마트 증가 중" },
    { emoji: "💰", title: "가디나·하와이언 가든스 (Gardena) — 가성비", desc: "LA 남부. 렌트 1BR $1,500–2,000 (LA 대비 저렴). 한인·히스패닉·흑인 혼합. 한국 마트·교회 다수. 110·405 고속도로 인접. 코리아타운 30분" },
  ] : citySlug === "dallas" ? [
    { emoji: "🤠", title: "캐롤튼 (Carrollton) — 달라스 한인 1번지", desc: "달라스 최대 한인타운. H-Mart·한식당·한인 교회·노래방 밀집. Old Denton Rd·Belt Line 일대. 렌트 1BR $1,400–1,800 | 2BR $1,800–2,200. Carrollton-Farmers Branch ISD" },
    { emoji: "🎓", title: "플라노 (Plano) — 학군·전문직", desc: "플라노 독립 학군 (Plano ISD) — Texas 최상위급. 삼성·텍사스 인스트루먼트 본사 인근. 한인 IT·전문직 다수 거주. 렌트 1BR $1,600–2,100. 안전하고 정돈된 환경" },
    { emoji: "🏢", title: "리처드슨 (Richardson) — 테크 코리도어", desc: "AT&T·Ericsson·Samsung 반도체 본사 인근. 시티라인 개발로 급성장. UT Dallas 인접. 렌트 1BR $1,400–1,900. 한인 유학생·직장인 인기" },
    { emoji: "💰", title: "어빙 (Irving) — 가성비 DFW 공항", desc: "DFW 공항 바로 옆. 렌트 1BR $1,200–1,600 (저렴). 한인 커뮤니티 성장 중. Las Colinas 업무지구 인근. 출장·이동 잦은 분께 추천" },
    { emoji: "🌿", title: "맥키니·프리스코 (McKinney/Frisco) — 신흥 한인 주거지", desc: "DFW 북부 급성장 신도시. 좋은 학군 (Frisco ISD). 한인 가족 이주 증가. 신축 주택 다수. 렌트 1BR $1,500–2,000. 통근 30–45분" },
  ] : [
    { emoji: "🏘️", title: "린우드 (Lynnwood) — 한인 1번지", desc: "한인타운 중심. H-Mart·한식당·교회 밀집. 링크 라이트레일 직결 (2024 개통). 렌트 1BR $1,800–2,100 | 스튜디오 $1,300–1,600. Northshore SD (Niche A) — 한인 가족 최다 거주" },
    { emoji: "💼", title: "벨뷰 (Bellevue) — 테크·최상위 학군", desc: "Bellevue SD — WA 1위 (Niche A+). Amazon·MS·Google 출퇴근 최적. 렌트 1BR $2,300–2,900 (프리미엄). 한인 전문직·가족 선호" },
    { emoji: "🌲", title: "보텔·우딘빌 (Bothell) — 학군+자연", desc: "Northshore SD Niche A. 한인 가족 급성장 지역. 자연환경·조용한 주거. 렌트 1BR $1,900–2,300" },
    { emoji: "💰", title: "페더럴웨이 (Federal Way) — 가성비", desc: "렌트 1BR $1,500–2,000 (저렴). 한인 마트·교회 다수. I-5 접근 편리. 넓은 한인 커뮤니티" },
    { emoji: "🎓", title: "대학지구 (U-District) — 유학생", desc: "UW 인근. 한식당·카페 집중. 링크 라이트레일 최고 접근. 렌트 1BR $1,600–2,400. UW·Seattle U·Seattle Central 재학생 최다" },
  ];
  const areasEn = citySlug === "sf" ? [
    { emoji: "💻", title: "Santa Clara — Bay Area Korean Hub #1", desc: "Silicon Valley's Koreatown. H-Mart, Korean restaurants & churches on El Camino Real. Near Apple, Intel, NVIDIA. Rent 1BR $2,300–2,800. Santa Clara USD (Niche A-)" },
    { emoji: "🍎", title: "Cupertino — Apple HQ & Top Schools", desc: "Home of Apple HQ. Cupertino Union SD + Fremont Union HSD — among CA's best. #1 choice for Korean families. Rent 1BR $2,500–3,200 (premium). High Korean population" },
    { emoji: "🌞", title: "Sunnyvale — Affordable Tech Hub", desc: "Near Google, LinkedIn, Yahoo. More affordable than Cupertino. Rent 1BR $2,100–2,600. Sunnyvale SD. Growing Korean community. Good VTA transit" },
    { emoji: "🌉", title: "Fremont — Fast-Growing Korean Area", desc: "Direct BART to SF & San Jose. Rent 1BR $2,000–2,500 (relatively affordable). Fremont USD (Niche A). Mixed Korean & Chinese community. Near Tesla factory" },
    { emoji: "🏙️", title: "Milpitas — Immigrant Value Pick", desc: "Mixed Korean & Vietnamese community. Rent 1BR $1,900–2,400 (Bay Area's most affordable). Near H-Mart & Great Mall. New BART station. Easy Silicon Valley access" },
  ] : citySlug === "newyork" ? [
    { emoji: "🌸", title: "Flushing, Queens — NYC Korean Hub #1", desc: "Queens' largest Korean & Chinese town. H-Mart, Korean restaurants, churches & karaoke. More affordable than Manhattan. Rent 1BR $1,800–2,400. Direct subway line 7. Most Korean residents in NYC" },
    { emoji: "🏙️", title: "Manhattan Koreatown (32nd St)", desc: "Preferred by Manhattan-based Korean workers. Walking distance to Koreatown. Rent 1BR $2,800–4,000 (very expensive). Best commute. Subway N/Q/R/W · B/D/F/M transfer hub" },
    { emoji: "🌿", title: "Fort Lee, NJ — New Jersey Koreatown", desc: "NJ's largest Koreatown. Across Hudson River from Manhattan. Rent 1BR $1,900–2,600 (cheaper than NYC). Korean restaurants, grocery & churches. Excellent schools (Fort Lee School District)" },
    { emoji: "🎓", title: "Paramus & Bergen County, NJ — Schools & Families", desc: "NJ's #1 choice for Korean families. Top-ranked schools. Rent 1BR $1,800–2,400. Dense Korean population (NJ has 300K+ Koreans). Manhattan commute by bus or PATH" },
    { emoji: "💰", title: "Jackson Heights, Queens — Affordable Pick", desc: "Multi-ethnic neighborhood. Rent 1BR $1,600–2,200 (NYC's most affordable). Korean, Hispanic & Indian communities. Subway E/F/M/R + line 7. Growing Korean restaurant scene" },
  ] : citySlug === "nashville" ? [
    { emoji: "🌆", title: "Madison — Nashville Korean Hub #1", desc: "H-Mart, Korean association & restaurants clustered. 15 min north of Nashville. Rent 1BR $1,300–1,700 (affordable). Many Korean churches. Safe residential environment" },
    { emoji: "🎵", title: "Franklin — Schools & Upscale Living", desc: "20 min south of Nashville. Williamson County SD — TN's top-ranked schools. Rent 1BR $1,600–2,200. Growing Korean family population. New construction homes in developing area" },
    { emoji: "🏘️", title: "Antioch — Affordable Option", desc: "Southeast Nashville. Rent 1BR $1,100–1,500 (TN's most affordable). Multi-ethnic area. Korean & Hispanic mix. Near BNA airport. Commute via I-24" },
    { emoji: "💼", title: "Brentwood — Professionals", desc: "Upscale residential south of Nashville. Preferred by Korean doctors & engineers. Rent 1BR $1,800–2,400. Excellent schools. Dense medical & tech employers" },
    { emoji: "🎓", title: "Murfreesboro — College Town", desc: "Home of MTSU (Middle Tennessee State Univ). Korean student population. Rent 1BR $1,100–1,500 (affordable). 30 min east of Nashville" },
  ] : citySlug === "boston" ? [
    { emoji: "🎓", title: "Allston/Brighton — Boston Korean Hub #1", desc: "Boston's largest Koreatown. H-Mart, Korean restaurants & churches. #1 for BU/Harvard/MIT students. Rent 1BR $1,900–2,600. Green Line B direct access" },
    { emoji: "📚", title: "Cambridge — Harvard & MIT", desc: "Adjacent to Harvard & MIT. Many Korean grad students. Rent 1BR $2,200–3,000 (expensive). Red Line direct. International environment. Preferred by researchers & PhD students" },
    { emoji: "🌊", title: "Quincy — Affordable Korean Neighborhood", desc: "15 min south of Boston. Red Line direct. Rent 1BR $1,600–2,100 (relatively affordable). Korean & Chinese mix. Good Quincy SD schools. Growing Korean restaurant scene" },
    { emoji: "🏙️", title: "Somerville — Young Korean Professionals", desc: "Adjacent to Boston. Near Tufts & MIT. Rent 1BR $1,900–2,500. Preferred by young Korean professionals & students. Active dining & café scene. Green Line E access" },
    { emoji: "💰", title: "Malden — Affordable for Families", desc: "North of Boston. Orange Line direct. Rent 1BR $1,600–2,000 (affordable vs Boston). Korean & Asian mix. Malden SD schools. Growing Korean family population" },
  ] : citySlug === "la" ? [
    { emoji: "🏘️", title: "Koreatown — Heart of Korean American Hospitality", desc: "Korean American diaspora living alongside diverse communities. Korean restaurants, karaoke, grocery & churches walkable. 24-hour vibrant. Rent 1BR $1,800–2,500. Metro Purple Line. All welcome." },
    { emoji: "🍊", title: "Cerritos — Top Schools & Korean Families", desc: "#1 choice for Korean families in LA County. ABC Unified SD — among CA's best schools. Dense Korean population. Rent 1BR $1,800–2,300. Multiple H-Marts & Korean restaurants. Safe, quiet environment" },
    { emoji: "🌊", title: "Torrance — Tech & Auto Industry Koreans", desc: "Near Toyota & Honda North America HQ. Many Korean engineers & expats. Rent 1BR $1,900–2,500. Korean churches & grocery stores available. 15 min to LAX. Beach access nearby" },
    { emoji: "🌸", title: "Irvine (Orange County) — Best Schools", desc: "Rising Korean hub in OC. Irvine USD — top-ranked in CA. Near UCI. Surging Korean population. Rent 1BR $2,200–2,900. Clean, safe. Growing Korean restaurants & grocery scene" },
    { emoji: "💰", title: "Gardena — Affordable LA South", desc: "South LA. Rent 1BR $1,500–2,000 (affordable vs LA). Korean, Hispanic & African American mix. Multiple Korean churches & stores. Easy 110/405 freeway access. 30 min to Koreatown" },
  ] : citySlug === "toronto" ? [
    { emoji: "🏘️", title: "노스욕 핀치 (North York Finch) — 토론토 한인 1번지", desc: "욘지/핀치 한인 상권 최대. H-Mart·한식당·한인 교회·노래방 집결. 지하철 Yellow Line 직결. 렌트 1BR CA$2,000–2,600. 한인 인구 밀도 최고" },
    { emoji: "🏙️", title: "블루어 코리아타운 (Bloor Koreatown)", desc: "다운타운 한인타운. 한식당·한국 마트·교회 밀집. 지하철 Bathurst·Christie역. 렌트 1BR CA$2,200–3,000 (비쌈). UofT·라이어슨 유학생 선호" },
    { emoji: "🌿", title: "미시사가 (Mississauga) — 가성비 가족", desc: "토론토 서쪽. 렌트 1BR CA$1,700–2,200 (상대적 저렴). 한인 가족 증가 중. Peel District SD. 공항(YYZ) 인근. 자동차 필수 지역" },
    { emoji: "💼", title: "마캄 (Markham) — 테크·학군", desc: "토론토 동북쪽. 아시안 밀집 지역. York Region District SD 우수. 한인·중국계 혼합. 렌트 1BR CA$1,800–2,400. 테크 기업 밀집" },
    { emoji: "🎓", title: "스카버러 (Scarborough) — 가성비", desc: "토론토 동쪽. 렌트 1BR CA$1,600–2,100 (토론토 내 저렴). 한인·아시안·카리브 혼합. U of T Scarborough 캠퍼스 인근. 지하철 접근 가능" },
  ] : citySlug === "vancouver" ? [
    { emoji: "🍁", title: "코퀴틀람 (Coquitlam) — 밴쿠버 한인 1번지", desc: "밴쿠버 최대 한인 밀집. Pinetree Way 한인 상권. H-Mart·한식당·교회·노래방 집결. SkyTrain Evergreen Line 직결. 렌트 1BR CA$1,900–2,500" },
    { emoji: "🌊", title: "버나비 (Burnaby) — 학군·SFU", desc: "SFU(사이먼프레이저대) 소재지. 한인 유학생 다수. SkyTrain 직결 (밴쿠버 20분). 렌트 1BR CA$1,800–2,400. 메트로타운 쇼핑 인근" },
    { emoji: "🌸", title: "리치몬드 (Richmond) — 아시안 가성비", desc: "밴쿠버 남쪽. 아시안(중국·한국) 밀집. 렌트 1BR CA$1,800–2,300. YVR 공항 15분. Richmond SD 학군 우수. 한식당·한인 마트 다수" },
    { emoji: "🏔️", title: "노스밴쿠버 (North Vancouver) — 자연·고급", desc: "산+바다 자연환경 최고. 한인 가족 선호. 렌트 1BR CA$2,100–2,800 (비쌈). Capilano·Lynn Valley. 밴쿠버 다운타운 SeaBus 30분" },
    { emoji: "💰", title: "랭리·애버츠퍼드 (Langley/Abbotsford) — 가성비", desc: "밴쿠버 동쪽 외곽. 렌트 1BR CA$1,500–1,900 (저렴). 한인 가족 증가 중. 신축 주택 다수. 밴쿠버 출퇴근 1시간 (차 필수)" },
  ] : citySlug === "toronto" ? [
    { emoji: "🏘️", title: "North York Finch — Toronto Korean Hub #1", desc: "Largest Korean commercial strip at Yonge/Finch. H-Mart, Korean restaurants, churches & karaoke. TTC Yellow Line direct. Rent 1BR CA$2,000–2,600. Highest Korean density" },
    { emoji: "🏙️", title: "Bloor Koreatown — Downtown", desc: "Downtown Koreatown. Korean restaurants, grocery & churches. TTC Bathurst/Christie stations. Rent 1BR CA$2,200–3,000 (pricey). Popular with UofT/Ryerson students" },
    { emoji: "🌿", title: "Mississauga — Affordable for Families", desc: "West of Toronto. Rent 1BR CA$1,700–2,200 (more affordable). Growing Korean families. Peel District SD schools. Near YYZ airport. Car essential" },
    { emoji: "💼", title: "Markham — Tech & Top Schools", desc: "Northeast of Toronto. Dense Asian community. Good York Region SD schools. Korean & Chinese mix. Rent 1BR CA$1,800–2,400. Tech company hub" },
    { emoji: "🎓", title: "Scarborough — Affordable Toronto", desc: "East Toronto. Rent 1BR CA$1,600–2,100 (affordable within Toronto). Korean, Asian & Caribbean mix. Near U of T Scarborough campus. TTC accessible" },
  ] : citySlug === "vancouver" ? [
    { emoji: "🍁", title: "Coquitlam — Vancouver Korean Hub #1", desc: "Largest Korean concentration in Metro Vancouver. H-Mart, Korean restaurants & churches on Pinetree Way. SkyTrain Evergreen Line direct. Rent 1BR CA$1,900–2,500" },
    { emoji: "🌊", title: "Burnaby — Schools & SFU", desc: "Home of SFU (Simon Fraser University). Many Korean students. SkyTrain direct (20 min to Vancouver). Rent 1BR CA$1,800–2,400. Near Metropolis shopping" },
    { emoji: "🌸", title: "Richmond — Asian Value Pick", desc: "South of Vancouver. Dense Asian (Chinese & Korean) community. Rent 1BR CA$1,800–2,300. 15 min to YVR airport. Richmond SD schools. Growing Korean restaurant scene" },
    { emoji: "🏔️", title: "North Vancouver — Nature & Premium", desc: "Best nature setting: mountains + ocean. Preferred by Korean families. Rent 1BR CA$2,100–2,800 (expensive). SeaBus to downtown 30 min" },
    { emoji: "💰", title: "Langley/Abbotsford — Affordable Suburbs", desc: "East suburbs of Vancouver. Rent 1BR CA$1,500–1,900 (affordable). Growing Korean families. New construction. 1hr commute to Vancouver (car essential)" },
  ] : citySlug === "dallas" ? [
    { emoji: "🤠", title: "Carrollton — Dallas Korean Hub #1", desc: "DFW's largest Koreatown. H-Mart, Korean restaurants, churches & karaoke on Old Denton Rd/Belt Line. Rent 1BR $1,400–1,800 | 2BR $1,800–2,200. Carrollton-Farmers Branch ISD" },
    { emoji: "🎓", title: "Plano — Schools & Professionals", desc: "Plano ISD — top-ranked in Texas. Near Samsung & Texas Instruments HQ. Many Korean IT professionals. Rent 1BR $1,600–2,100. Safe, well-organized environment" },
    { emoji: "🏢", title: "Richardson — Tech Corridor", desc: "Near AT&T, Ericsson & Samsung Semiconductor. Fast-growing Cityline development. Adjacent to UT Dallas. Rent 1BR $1,400–1,900. Popular with Korean students & tech workers" },
    { emoji: "💰", title: "Irving — Affordable + DFW Airport", desc: "Right next to DFW Airport. Rent 1BR $1,200–1,600 (affordable). Growing Korean community. Near Las Colinas business district. Great for frequent travelers" },
    { emoji: "🌿", title: "McKinney/Frisco — New Korean Suburbs", desc: "Fast-growing new suburbs in north DFW. Excellent Frisco ISD schools. Increasing Korean family population. New construction homes. Rent 1BR $1,500–2,000. 30–45 min commute" },
  ] : [
    { emoji: "🏘️", title: "Lynnwood — Korean Hub #1", desc: "Heart of Koreatown. H-Mart, Korean restaurants & churches clustered. Link Light Rail direct (opened 2024). Rent 1BR $1,800–2,100 | Studio $1,300–1,600. Northshore SD (Niche A) — largest Korean family population" },
    { emoji: "💼", title: "Bellevue — Tech & Top Schools", desc: "Bellevue SD — WA #1 (Niche A+). Best commute for Amazon/MS/Google. Rent 1BR $2,300–2,900 (premium). Preferred by Korean professionals & families" },
    { emoji: "🌲", title: "Bothell — Schools + Nature", desc: "Northshore SD Niche A. Fast-growing Korean family area. Natural environment & quiet neighborhoods. Rent 1BR $1,900–2,300" },
    { emoji: "💰", title: "Federal Way — Affordable", desc: "Rent 1BR $1,500–2,000 (affordable). Many Korean grocery stores & churches. Good I-5 access. Large Korean community" },
    { emoji: "🎓", title: "U-District — Student Area", desc: "Near UW. Dense Korean restaurants & cafés. Best Link Light Rail access. Rent 1BR $1,600–2,400. Most UW & Seattle U students" },
  ];

  const serverKeys = ["settle_week1", "settle_month1", "settle_month3", "settle_admin", "settle_finance"];
  const serverData = sub < 5 ? serverContent[serverKeys[sub] as keyof typeof serverContent] : null;
  const items = serverData
    ? resolveStepItems(serverData, lang)
    : sub < 5
      ? (lang === "ko"
        ? [week1Ko, month1Ko, month3Ko, adminKo, financeKo][sub]
        : [week1En, month1En, month3En, adminEn, financeEn][sub])
      : [];

  const areaItems = lang === "ko" ? areasKo : areasEn;

  // 전체 체크리스트 데이터 (탭 index 6)
  const allPhases = lang === "ko"
    ? [
        { label: "🗓 1주차", prefix: "w1",  items: week1Ko  },
        { label: "📅 1개월", prefix: "m1",  items: month1Ko },
        { label: "🗒 3개월", prefix: "m3",  items: month3Ko },
        { label: "🏛 행정",  prefix: "adm", items: adminKo  },
        { label: "💰 재정",  prefix: "fin", items: financeKo },
      ]
    : [
        { label: "🗓 Week 1",  prefix: "w1",  items: week1En  },
        { label: "📅 Month 1", prefix: "m1",  items: month1En },
        { label: "🗒 Month 3", prefix: "m3",  items: month3En },
        { label: "🏛 Admin",   prefix: "adm", items: adminEn  },
        { label: "💰 Finance", prefix: "fin", items: financeEn },
      ];
  const totalItems = allPhases.reduce((s, p) => s + p.items.length, 0);

  // 프로그레스 계산
  const tabPrefix = ["w1", "m1", "m3", "adm", "fin", "area"][sub] ?? "w1";
  const doneCount = items.filter((_, i) => localStorage.getItem(`hg_checklist_${tabPrefix}_${i}`) === "1").length;
  const totalDone  = allPhases.reduce((s, p) =>
    s + p.items.filter((_, i) => localStorage.getItem(`hg_checklist_${p.prefix}_${i}`) === "1").length, 0);
  const [, forceUpdate] = useState(0);

  // 어드민 탭(index=3) 여부
  const isAdminTab = sub === 3;

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🛬" titleKo="정착 가이드" titleEn="Settlement Guide"
        descKo="정착부터 Korean American으로 — 단계별 완전 안내" descEn="From Day 1 to Korean American — your complete step-by-step guide"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5">
        {sub === 0 && (
          <Top5Banner items={
            useCityConfig().slug === "dallas"   ? TOP5_SETTLE_DALLAS :
            useCityConfig().slug === "sf"       ? TOP5_SETTLE_SF :
            useCityConfig().slug === "newyork"  ? TOP5_SETTLE_NEWYORK :
            useCityConfig().slug === "nashville"? TOP5_SETTLE_NASHVILLE :
            useCityConfig().slug === "boston"   ? TOP5_SETTLE_BOSTON :
            useCityConfig().slug === "la"        ? TOP5_SETTLE_LA :
            useCityConfig().slug === "toronto"   ? TOP5_SETTLE_TORONTO :
            useCityConfig().slug === "vancouver" ? TOP5_SETTLE_VANCOUVER :
            useCityConfig().slug === "houston"   ? TOP5_SETTLE_HOUSTON :
            useCityConfig().slug === "atlanta"   ? TOP5_SETTLE_ATLANTA :
            useCityConfig().slug === "kansascity"? TOP5_SETTLE_KANSASCITY :
            useCityConfig().slug === "philadelphia" ? TOP5_SETTLE_PHILADELPHIA :
            useCityConfig().slug === "miami"     ? TOP5_SETTLE_MIAMI :
            useCityConfig().slug === "mexicocity"? TOP5_SETTLE_MEXICOCITY :
            useCityConfig().slug === "guadalajara"? TOP5_SETTLE_GUADALAJARA :
            useCityConfig().slug === "monterrey" ? TOP5_SETTLE_MONTERREY :
            TOP5_SETTLE
          } lang={lang} accentColor="#F2994A" />
        )}
        <div className="px-4 md:px-6 lg:px-8">

        {/* ── 비자·이민 탭 (index 7) ── */}
        {sub === 7 && (
          <div>
            {[
              { emoji: "🛂", name: lang === "ko" ? "비자 종류 한눈에 보기" : "Visa Types Overview",
                desc: lang === "ko"
                  ? "✅ 주요 비자 유형:\n• F-1 (학생비자) — 대학/어학원 재학 중. OPT·CPT 취업 가능\n• J-1 (교환방문) — 인턴십·연구원·교환학생. DS-2019 필요\n• H-1B (전문직) — 매년 4월 추첨. 스폰서 고용주 필요. 연봉 $60K+\n• O-1 (특기자) — 뛰어난 능력 증명 필요. 추첨 없음\n• L-1 (주재원) — 다국적기업 전근. A(관리직)/B(전문직)\n• E-2 (투자자) — 투자금 $100K+ 권장. 한미조약 혜택\n• EB-3/EB-5 (영주권) — 취업이민/투자이민. 우선순위 날짜 확인 필수"
                  : "✅ Key visa types:\n• F-1 (Student) — enrolled in university/language school. OPT/CPT work authorized\n• J-1 (Exchange Visitor) — intern, researcher, exchange student. DS-2019 required\n• H-1B (Specialty Occupation) — lottery every April. Employer sponsor required\n• O-1 (Extraordinary Ability) — no lottery. Must prove exceptional talent\n• L-1 (Intracompany) — transfer within multinational. A (managers) / B (specialists)\n• E-2 (Treaty Investor) — ~$100K+ investment. Korea-US treaty benefit\n• EB-3/EB-5 (Green Card) — employment/investor immigration. Check priority dates",
                tags: lang === "ko" ? ["비자유형", "F-1", "H-1B"] : ["Visa Types", "F-1", "H-1B"] },
              { emoji: "📋", name: lang === "ko" ? "I-94 체류 기간 확인 (필수!)" : "Check I-94 Stay Duration (Critical!)",
                desc: lang === "ko"
                  ? "✅ 반드시 해야 할 일:\n1. cbp.dhs.gov/i94 접속\n2. 여권 정보 입력 → 현재 I-94 조회\n3. '입국 허가 만료일' 확인 (비자 만료일과 다를 수 있음!)\n4. D/S = Duration of Status (학생·교환방문 비자는 I-20/DS-2019 기간)\n\n⚠️ 비자 스티커 날짜 ≠ 체류 허용 기간. I-94 날짜가 실제 체류 기한!"
                  : "✅ Must do:\n1. Go to cbp.dhs.gov/i94\n2. Enter passport info → view current I-94\n3. Check 'Admitted Until Date' (different from visa expiry date!)\n4. D/S = Duration of Status (F-1/J-1 holders: see your I-20/DS-2019)\n\n⚠️ Visa stamp date ≠ allowed stay period. I-94 date is your real deadline!",
                tags: lang === "ko" ? ["I-94", "체류기간", "필수확인"] : ["I-94", "Stay Duration", "Critical"] },
              { emoji: "📅", name: lang === "ko" ? "비자 연장·전환 절차" : "Visa Extension & Change of Status",
                desc: lang === "ko"
                  ? "⚠️ 만료 최소 6개월 전 준비 시작!\n\n연장 (Extension of Stay):\n• USCIS Form I-539 (비취업비자) 또는 I-129 (취업비자)\n• 처리 기간: 3-12개월 (프리미엄 프로세싱: $2,805, 15영업일)\n• 만료 전 신청 시 '합법 체류 유지' (Maintenance of Status)\n\n전환 (Change of Status):\n• F-1 → H-1B: OPT 중 스폰서 확보 → 4월 추첨 → 10월 시작\n• B-1/B-2 → F-1: I-539 신청. 학교 입학 허가서 필요\n\n📞 USCIS 콜센터: 1-800-375-5283 (한국어 통역 요청 가능)"
                  : "⚠️ Start preparing at least 6 months before expiry!\n\nExtension of Stay:\n• USCIS Form I-539 (non-employment) or I-129 (employment)\n• Processing: 3-12 months (Premium: $2,805, 15 business days)\n• Filing before expiry maintains lawful stay\n\nChange of Status:\n• F-1 → H-1B: secure sponsor during OPT → April lottery → Oct start\n• B-1/B-2 → F-1: file I-539. School acceptance letter required\n\n📞 USCIS: 1-800-375-5283 (Korean interpreter available)",
                tags: lang === "ko" ? ["비자연장", "I-539", "USCIS"] : ["Extension", "I-539", "USCIS"] },
              { emoji: "🏠", name: lang === "ko" ? "영주권 (그린카드) 경로" : "Green Card Pathways",
                desc: lang === "ko"
                  ? "✅ 주요 영주권 취득 경로:\n\n취업이민 (EB):\n• EB-1A: 특기자 (자기청원 가능)\n• EB-1C: 다국적기업 관리자 (L-1A 후 전환)\n• EB-2 NIW: 국익면제 (자기청원, 연구·의료 분야 유리)\n• EB-3: 전문직/숙련직 (스폰서 필요, 대기 길 수 있음)\n• EB-5: 투자이민 (미국 내 $800K~$1.05M 투자)\n\n가족이민:\n• IR-1/CR-1: 미국 시민권자 배우자\n• F-2A: 영주권자 배우자·미성년 자녀 (대기 있음)\n\n💡 현재 우선순위 날짜: travel.state.gov → Visa Bulletin 확인"
                  : "✅ Main green card pathways:\n\nEmployment-Based:\n• EB-1A: Extraordinary ability (self-petition possible)\n• EB-1C: Multinational manager (L-1A → EB-1C)\n• EB-2 NIW: National Interest Waiver (self-petition, great for researchers)\n• EB-3: Professionals/skilled workers (sponsor required, wait times vary)\n• EB-5: Investor ($800K–$1.05M investment in the US)\n\nFamily-Based:\n• IR-1/CR-1: Spouse of US citizen\n• F-2A: Spouse/minor children of LPR (wait time applies)\n\n💡 Check current priority dates: travel.state.gov → Visa Bulletin",
                tags: lang === "ko" ? ["영주권", "EB", "그린카드"] : ["Green Card", "EB", "NIW"] },
              { emoji: "⚖️", name: lang === "ko" ? "무료 이민 법률 지원 (시애틀)" : "Free Immigration Legal Help (Seattle)",
                desc: lang === "ko"
                  ? "✅ 시애틀 무료/저비용 이민 법률 기관:\n\n• NWIRP (북서부 이민권 프로젝트): 📞 800-445-5771 | nwirp.org — 영주권·추방방어·DACA 무료\n• OneAmerica: 425-251-0900 | weareoneamerica.org — 시민권 지원·이민자 권익 옹호\n• PAIR Project: pairproject.org — 망명 신청자 무료 법률\n• NW Justice Project: 206-464-1519 — 저소득 이민자 무료 법률 (민사 한정)\n• KCSC (한인생활상담소): 425-776-2400 — 한국어 이민 초기 상담\n\n⚠️ 비전문가나 노타리오 (notario)에게 이민 서류 맡기지 마세요!"
                  : "✅ Free/low-cost immigration legal resources in Seattle:\n\n• NWIRP: 📞 800-445-5771 | nwirp.org — green card, deportation defense, DACA\n• OneAmerica: 425-251-0900 | weareoneamerica.org — citizenship, immigrant rights\n• PAIR Project: pairproject.org — free legal help for asylum seekers\n• NW Justice Project: 206-464-1519 — free civil legal aid for low-income\n• KCSC: 425-776-2400 — Korean-language immigration consultation\n\n⚠️ Never use unlicensed notarios for immigration documents!",
                tags: lang === "ko" ? ["무료법률", "NWIRP", "이민상담"] : ["Free Legal", "NWIRP", "Immigration"] },
              { emoji: "🇰🇷", name: lang === "ko" ? "주시애틀 총영사관 서비스" : "Korean Consulate General Seattle",
                desc: lang === "ko"
                  ? "✅ 검증됨 | 📍 115 W Mercer St, Seattle | 📞 (206) 441-1011\n영업시간: 월-금 8:30am-4pm (예약 필수)\n\n주요 서비스:\n• 여권 발급·갱신 (온라인 예약 필수)\n• 공증·영사 확인 (서류 제출 시 한국어 공증)\n• 재외국민 등록 (도미 직후 필수!)\n• 국적·병역 상담\n• 비자 관련 한국 본국 서류 안내\n\n🔗 overseas.mofa.go.kr/us-seattle-ko\n💡 민원24(mw.go.kr)로 한국 서류 온라인 발급 후 영사 확인 절차 단축 가능"
                  : "✅ Verified | 📍 115 W Mercer St, Seattle | 📞 (206) 441-1011\nHours: Mon-Fri 8:30am-4pm (appointment required)\n\nKey services:\n• Passport issuance & renewal (online appointment required)\n• Notarization & consular certification\n• Overseas Korean registration (do this right after arrival!)\n• Nationality & military service consultation\n• Korean document guidance for visa applications\n\n🔗 overseas.mofa.go.kr/us-seattle-ko",
                tags: lang === "ko" ? ["총영사관", "여권", "공증"] : ["Consulate", "Passport", "Notary"] },
            ].map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "#818CF8", marginBottom: 4 }}>🛂 {lang === "ko" ? "핵심 체크포인트" : "Key Checkpoints"}</div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
                {lang === "ko"
                  ? "• 도착 즉시: cbp.dhs.gov/i94 에서 I-94 확인\n• 재외국민 등록: 영사관 방문 (무료, 도착 3개월 내)\n• 비자 만료 6개월 전: 이민 변호사 상담 시작\n• USCIS 사건 조회: egov.uscis.gov (영수증 번호로 조회)"
                  : "• On arrival: check I-94 at cbp.dhs.gov/i94\n• Register as overseas Korean: visit consulate (free, within 3 months)\n• 6 months before visa expiry: consult immigration attorney\n• Track USCIS case: egov.uscis.gov (use receipt number)"}
              </div>
            </div>
          </div>
        )}

        {/* ── 전체 체크리스트 탭 (index 6) ── */}
        {sub === 6 ? (
          <div onClick={() => forceUpdate(n => n + 1)}>
            {/* 종합 진행률 */}
            <div style={{ background: "linear-gradient(135deg,rgba(96,165,250,0.12),rgba(110,231,183,0.08))", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#ECFDF5" }}>
                  {lang === "ko" ? "🏁 전체 정착 현황" : "🏁 Overall Settlement Progress"}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 16, color: accent }}>
                  {totalDone} / {totalItems}
                </div>
              </div>
              <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${totalItems > 0 ? (totalDone / totalItems) * 100 : 0}%`, background: `linear-gradient(90deg,${accent},#6EE7B7)`, borderRadius: 6, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: "rgba(236,253,245,0.5)" }}>
                {totalDone === totalItems && totalItems > 0
                  ? (lang === "ko" ? "🎉 모든 정착 단계 완료! 축하합니다!" : "🎉 All settlement steps complete! Congratulations!")
                  : (lang === "ko" ? `${Math.round((totalDone / totalItems) * 100)}% 완료 — 계속 진행하세요 💪` : `${Math.round((totalDone / totalItems) * 100)}% done — keep going 💪`)}
              </div>
              <button onClick={(e) => { e.stopPropagation(); if (window.confirm(lang === "ko" ? "모든 체크리스트를 초기화할까요?" : "Reset all checklist items?")) { allPhases.forEach(p => p.items.forEach((_, i) => localStorage.removeItem(`hg_checklist_${p.prefix}_${i}`))); forceUpdate(n => n + 1); } }}
                style={{ marginTop: 10, border: "none", background: "rgba(248,113,113,0.15)", borderRadius: 20, padding: "5px 14px", color: "#F87171", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                🔄 {lang === "ko" ? "전체 초기화" : "Reset All"}
              </button>
            </div>

            {/* 페이즈별 체크리스트 */}
            {allPhases.map((phase) => {
              const pDone = phase.items.filter((_, i) => localStorage.getItem(`hg_checklist_${phase.prefix}_${i}`) === "1").length;
              return (
                <div key={phase.prefix} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, padding: "0 2px" }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: accent }}>{phase.label}</div>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: pDone === phase.items.length ? "#6EE7B7" : "rgba(236,253,245,0.4)", fontWeight: 600 }}>
                      {pDone}/{phase.items.length} {pDone === phase.items.length ? "✓" : ""}
                    </div>
                  </div>
                  {phase.items.map((item, i) => (
                    <ChecklistItem key={`${phase.prefix}-${i}`} itemId={`${phase.prefix}_${i}`} title={item.title} desc={item.desc} accentColor={accent} showReminder={false} />
                  ))}
                </div>
              );
            })}
          </div>

        ) : sub === 5 ? (
        /* 거주지 탭 */
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: accent, marginBottom: 4 }}>
                🏘️ {lang === "ko" ? "시애틀 주요 거주지 가이드" : "Seattle Area Guide for Korean Residents"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", lineHeight: 1.5 }}>
                {lang === "ko" ? "가족·학군·예산에 맞는 동네 찾기" : "Find the right neighborhood for your family, school, and budget"}
              </div>
            </div>
            {areaItems.map((area, i) => (
              <div key={i} style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.18)", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{area.emoji}</span>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: "#ECFDF5" }}>{area.title}</div>
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.65)" }}>{area.desc}</div>
              </div>
            ))}
            <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 4 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 10 }}>💡 {lang === "ko" ? "렌트 찾기" : "Find Rentals"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <a href="https://open.kakao.com/o/search/%EC%8B%9C%EC%95%A0%ED%8B%80%ED%95%9C%EC%9D%B8" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                      {lang === "ko" ? "카카오오픈채팅 '시애틀한인'" : "KakaoTalk Open Chat '시애틀한인'"}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "룸메이트·렌탈 실시간 정보" : "Roommate & rental listings"}</div>
                  </div>
                  <span style={{ color: accent, fontSize: 14 }}>→</span>
                </a>
                <a href="https://www.wowseattle.com/" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <span style={{ fontSize: 16 }}>🏘️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>WowSeattle</div>
                    <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "한인 부동산·렌탈 정보" : "Korean real estate & rentals"}</div>
                  </div>
                  <span style={{ color: accent, fontSize: 14 }}>→</span>
                </a>
              </div>
            </div>
            {/* 거주지 탭 — 헤브론 스테이 서비스 카드 */}
            <HebronServiceCard
              icon="🏠" color="#10B981" lang={lang}
              titleKo="헤브론 스테이 — 한인 가정에서 시작하는 정착"
              titleEn="Hebron Stay — Begin Settlement in a Korean Home"
              descKo="정착 첫 1-3개월. 따뜻한 한인 가정에서 시작합니다. 방 + 정착 안내 + 자연스러운 이웃 소개."
              descEn="First 1-3 months with a warm Korean family. Room + settlement guidance + natural community introduction."
            />
          </>
        ) : (
          <>
            {/* 프로그레스 바 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(236,253,245,0.5)" }}>
                  {lang === "ko" ? "완료" : "Progress"}
                </span>
                <span style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, fontWeight: 700, color: accent }}>
                  {doneCount} / {items.length}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%`,
                  background: `linear-gradient(90deg, ${accent}, rgba(110,231,183,0.6))`,
                  borderRadius: 4,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            {/* 스토리라인 1번: Week1(sub 0) — 공항 도착 직후 라이드 카드 */}
            {sub === 0 && <HebronServiceCard
              icon="🚗" color="#3B82F6" lang={lang}
              titleKo="헤브론 라이드 — 공항에서 내리는 순간부터"
              titleEn="Hebron Ride — From the Moment You Land"
              descKo="짐 가득, 아이 손 잡고, 낯선 공항. 한국어로 따뜻하게 맞이하는 한인 드라이버가 기다립니다."
              descEn="Bags full, kids in hand, unfamiliar airport. A warm Korean-speaking driver is already waiting for you."
            />}

            {/* 체크리스트 아이템 */}
            <div onClick={() => forceUpdate(n => n + 1)}>
              {items.map((item, i) => (
                <ChecklistItem
                  key={`${sub}-${i}`}
                  itemId={`${tabPrefix}_${i}`}
                  title={item.title}
                  desc={item.desc}
                  accentColor={accent}
                  showReminder={isAdminTab}
                />
              ))}
            </div>

            {/* 팁 배너 */}
            <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 10 }}>💡 {lang === "ko" ? "한인 커뮤니티 연결" : "Korean Community"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <a href="https://open.kakao.com/o/search/%EC%8B%9C%EC%95%A0%ED%8B%80%ED%95%9C%EC%9D%B8" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                      {lang === "ko" ? "카카오오픈채팅 '시애틀한인'" : "KakaoTalk '시애틀한인'"}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "정착정보·중고거래·룸메이트" : "Settlement tips, used goods, roommates"}</div>
                  </div>
                  <span style={{ color: accent, fontSize: 14 }}>→</span>
                </a>
                <a href="https://cafe.naver.com/seattlekorean" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <span style={{ fontSize: 16 }}>🟢</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                      {lang === "ko" ? "네이버 카페 '시애틀한인생활'" : "Naver Café '시애틀한인생활'"}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "정착 경험담·질문·정보 공유" : "Settlement experiences & Q&A"}</div>
                  </div>
                  <span style={{ color: accent, fontSize: 14 }}>→</span>
                </a>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 3: 교회 SCREEN
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   도시별 한인 교회 데이터
   출처: 각 교회 공식 웹사이트 / 공개 정보 기준
   검증 상태: ✅ 공식 사이트 확인됨 | 🔍 추가 검증 필요
───────────────────────────────────────── */
function getCityChurches(slug: string, lang: string) {
  const ko = lang === "ko";
  type ChurchEntry = { emoji: string; tier?: number; name: string; nameEn?: string; desc: string; tags: string[] };
  const byCity: Record<string, ChurchEntry[]> = {
    seattle: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "시애틀지구촌교회 (Global Mission Church)" : "Global Mission Church of Greater Seattle",
        nameEn: ko ? "Global Mission Church of Greater Seattle" : "시애틀지구촌교회",
        desc: ko
          ? "✅ 검증됨 | SBC 소속 가정교회 사역. 폴 김 목사.\n📍 4900 168th St. SW., Lynnwood, WA 98037\n🏠 목장·삶공부·LIFE Worship 3축 운영\n✨ 이민자·유학생·새가족 환영\n🔗 www.ijiguchon.org"
          : "✅ Verified | SBC-affiliated House Church Ministry. Pastor Paul Kim.\n📍 4900 168th St. SW., Lynnwood, WA 98037\n🏠 Mokjang · Life Studies · LIFE Worship\n✨ Open to immigrants & newcomers\n🔗 www.ijiguchon.org",
        tags: ko ? ["가정교회", "SBC", "린우드"] : ["House Church", "SBC", "Lynnwood"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "시애틀중앙장로교회" : "Seattle Central Presbyterian Church",
        desc: ko
          ? "🔗 정통 장로교 | 세대별 예배 운영 (한국어·영어)\n📍 시애틀 북부 지역\n✨ 한인 이민자 공동체 중심 교회"
          : "🔗 Presbyterian | Korean & English generational services\n✨ Strong Korean immigrant community",
        tags: ko ? ["장로교", "시애틀"] : ["Presbyterian", "Seattle"],
      },
    ],
    dallas: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "달라스한인제일침례교회" : "Korean First Baptist Church of Dallas",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속 한인 교회. 가정교회 사역 활성화.\n📍 2319 Luna Rd, Carrollton, TX 75006\n✨ 새가족 정착 상담 · ESL 수업 운영\n🔗 kfbcd.org"
          : "✅ Verified | SBC-affiliated. Active house church ministry.\n📍 2319 Luna Rd, Carrollton, TX 75006\n✨ New family counseling · ESL classes\n🔗 kfbcd.org",
        tags: ko ? ["가정교회", "SBC", "캐롤튼"] : ["House Church", "SBC", "Carrollton"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "달라스새생명교회" : "Dallas New Life Church",
        desc: ko
          ? "🔗 한인 복음주의 교회 | 가정교회 목장 시스템\n📍 달라스 메트로 지역\n✨ 이민자·유학생 특화 공동체"
          : "🔗 Korean evangelical | House church system\n✨ Focused on immigrants & students",
        tags: ko ? ["복음주의", "달라스"] : ["Evangelical", "Dallas"],
      },
    ],
    la: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "LA새누리교회" : "LA Saenuri Church",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속. 가정교회 사역.\n📍 Koreatown, Los Angeles, CA\n✨ 한인 1·2세대 함께하는 다세대 교회\n🔗 saenurichurch.org"
          : "✅ Verified | SBC-affiliated. House church ministry.\n📍 Koreatown, Los Angeles, CA\n✨ Multi-generational Korean American church\n🔗 saenurichurch.org",
        tags: ko ? ["가정교회", "SBC", "코리아타운"] : ["House Church", "SBC", "Koreatown"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "나성영락교회" : "Youngnak Presbyterian Church of LA",
        desc: ko
          ? "🔗 LA 대표 한인 장로교회 | 1973년 설립\n📍 1721 W. Olympic Blvd., Los Angeles, CA\n✨ 한인 커뮤니티 중심 · ESL · 정착 지원\n🔗 youngnak.com"
          : "🔗 Landmark Korean Presbyterian church | Est. 1973\n📍 1721 W. Olympic Blvd., Los Angeles, CA\n✨ ESL · settlement support\n🔗 youngnak.com",
        tags: ko ? ["장로교", "올림픽", "LA"] : ["Presbyterian", "Olympic", "LA"],
      },
    ],
    newyork: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "뉴욕한인침례교회" : "Korean Baptist Church of New York",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속 한인 교회. 맨해튼·플러싱 성도.\n📍 퀸즈 플러싱 지역\n✨ 이민자·유학생 환영 · 정착 네트워크\n🔗 kbcny.org"
          : "✅ Verified | SBC-affiliated. Serving Manhattan & Flushing.\n📍 Flushing, Queens, NY\n✨ Immigrants & students welcome · settlement network\n🔗 kbcny.org",
        tags: ko ? ["침례교", "SBC", "플러싱"] : ["Baptist", "SBC", "Flushing"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "뉴욕영락교회" : "Young Nak Presbyterian of NY",
        desc: ko
          ? "🔗 뉴욕 한인 정통 장로교회 | 플러싱 커뮤니티 중심\n📍 Flushing, Queens, NY\n✨ 한인 이민자 역사와 함께한 교회"
          : "🔗 Historic Korean Presbyterian church | Flushing community hub\n✨ Rooted in Korean immigrant history",
        tags: ko ? ["장로교", "플러싱"] : ["Presbyterian", "Flushing"],
      },
    ],
    houston: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "서울침례교회 (IHM 본부)" : "Seoul Baptist Church of Houston — IHM HQ",
        desc: ko
          ? "✅ 검증됨 | 가정교회 사역 국제 본부. 미국 전역 가정교회 네트워크 허브.\n📍 Houston, TX\n🏠 목장·삶공부·Worship 3축 운영\n🔗 seoulchurch.com"
          : "✅ Verified | International House Church Ministry HQ. National network hub.\n📍 Houston, TX\n🏠 Mokjang · Life Studies · Worship\n🔗 seoulchurch.com",
        tags: ko ? ["가정교회", "IHM", "SBC", "휴스턴"] : ["House Church", "IHM", "SBC", "Houston"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "휴스턴한인침례교회" : "Korean Baptist Church of Houston",
        desc: ko
          ? "🔗 SBC 소속 | 한인 이민자 공동체 중심\n📍 Houston, TX\n✨ ESL · 정착 상담 · 직장인 네트워크"
          : "🔗 SBC-affiliated | Korean immigrant community\n✨ ESL · settlement counseling · professional network",
        tags: ko ? ["침례교", "SBC", "휴스턴"] : ["Baptist", "SBC", "Houston"],
      },
    ],
    sf: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "베이지역한인침례교회" : "Korean Baptist Church of the Bay Area",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속. 실리콘밸리 한인 이민자·테크워커 공동체.\n📍 San Jose / Fremont 지역\n✨ 테크 업계 한인 네트워크 특화"
          : "✅ Verified | SBC-affiliated. Silicon Valley Korean tech worker community.\n📍 San Jose / Fremont area\n✨ Strong tech industry Korean network",
        tags: ko ? ["침례교", "SBC", "산호세"] : ["Baptist", "SBC", "San Jose"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "실리콘밸리한인교회" : "Korean Church of Silicon Valley",
        desc: ko
          ? "🔗 복음주의 한인 교회 | 산호세·프리몬트 지역\n✨ IT 종사자·유학생·이민자 환영"
          : "🔗 Evangelical Korean church | San Jose · Fremont\n✨ IT professionals, students & immigrants welcome",
        tags: ko ? ["복음주의", "산호세", "프리몬트"] : ["Evangelical", "San Jose", "Fremont"],
      },
    ],
    toronto: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "토론토한인침례교회" : "Korean Baptist Church of Toronto",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 계열 캐나다 교회. 가정교회 사역.\n📍 North York, Toronto, ON\n✨ 이민자·유학생·새가족 환영\n🔗 kbct.ca"
          : "✅ Verified | SBC-affiliated Canadian church. House church ministry.\n📍 North York, Toronto, ON\n✨ Immigrants, students & newcomers welcome\n🔗 kbct.ca",
        tags: ko ? ["가정교회", "SBC", "노스요크"] : ["House Church", "SBC", "North York"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "토론토한인장로교회" : "Korean Presbyterian Church of Toronto",
        desc: ko
          ? "🔗 정통 장로교 | 토론토 한인 이민자 역사 함께\n📍 토론토 핀치애브뉴 한인타운\n✨ 한국어·영어 예배 · ESL 운영"
          : "🔗 Presbyterian | Historic Korean immigrant church\n📍 Toronto Koreatown (Finch Ave)\n✨ Korean & English services · ESL",
        tags: ko ? ["장로교", "핀치", "토론토"] : ["Presbyterian", "Finch", "Toronto"],
      },
    ],
    vancouver: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "밴쿠버한인침례교회" : "Korean Baptist Church of Vancouver",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 계열 캐나다 교회.\n📍 Burnaby, BC\n✨ 코퀴틀람·버나비 한인 공동체 중심\n🔗 kbcv.ca"
          : "✅ Verified | SBC-affiliated Canadian church.\n📍 Burnaby, BC\n✨ Coquitlam · Burnaby Korean community hub\n🔗 kbcv.ca",
        tags: ko ? ["침례교", "SBC", "버나비"] : ["Baptist", "SBC", "Burnaby"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "밴쿠버새생명교회" : "Vancouver New Life Church",
        desc: ko
          ? "🔗 복음주의 한인 교회 | 코퀴틀람·서리 지역\n✨ 이민자·유학생 특화 소그룹 운영"
          : "🔗 Evangelical Korean church | Coquitlam · Surrey\n✨ Small groups for immigrants & students",
        tags: ko ? ["복음주의", "코퀴틀람"] : ["Evangelical", "Coquitlam"],
      },
    ],
    atlanta: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "애틀랜타한인침례교회" : "Korean Baptist Church of Atlanta",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속. 둘루스·스와니 한인 공동체.\n📍 Duluth, GA\n✨ 이민자 정착 지원 · ESL · 소그룹 운영\n🔗 kbcatlanta.org"
          : "✅ Verified | SBC-affiliated. Duluth · Suwanee Korean community.\n📍 Duluth, GA\n✨ Settlement support · ESL · small groups\n🔗 kbcatlanta.org",
        tags: ko ? ["침례교", "SBC", "둘루스"] : ["Baptist", "SBC", "Duluth"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "조지아한인장로교회" : "Korean Presbyterian Church of Georgia",
        desc: ko
          ? "🔗 정통 장로교 | 스와니·존스크릭 지역\n✨ 한인 이민자·2세 청년 공동체"
          : "🔗 Presbyterian | Suwanee · Johns Creek area\n✨ 1st & 2nd gen Korean community",
        tags: ko ? ["장로교", "스와니"] : ["Presbyterian", "Suwanee"],
      },
    ],
    boston: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "보스턴한인침례교회" : "Korean Baptist Church of Boston",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속. 올스턴·캠브리지 한인 유학생·이민자.\n📍 Allston, MA\n✨ Harvard·MIT·BU 유학생 특화 소그룹"
          : "✅ Verified | SBC-affiliated. Harvard · MIT · BU students.\n📍 Allston, MA\n✨ University student-focused small groups",
        tags: ko ? ["침례교", "SBC", "올스턴"] : ["Baptist", "SBC", "Allston"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "뉴잉글랜드한인교회" : "Korean Church of New England",
        desc: ko
          ? "🔗 복음주의 | 보스턴 광역 한인 공동체\n✨ 의료계·학계 한인 전문직 네트워크"
          : "🔗 Evangelical | Greater Boston Korean community\n✨ Medical & academic professional network",
        tags: ko ? ["복음주의", "보스턴"] : ["Evangelical", "Boston"],
      },
    ],
    nashville: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "내쉬빌한인침례교회" : "Korean Baptist Church of Nashville",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속. 내쉬빌 한인 성장 공동체.\n📍 Madison / Brentwood, TN\n✨ 정착 지원 · ESL · H-Mart 인근 한인 네트워크"
          : "✅ Verified | SBC-affiliated. Growing Korean community in Nashville.\n📍 Madison / Brentwood, TN\n✨ Settlement support · ESL · H-Mart area network",
        tags: ko ? ["침례교", "SBC", "매디슨"] : ["Baptist", "SBC", "Madison"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "테네시한인장로교회" : "Korean Presbyterian Church of Tennessee",
        desc: ko
          ? "🔗 정통 장로교 | 내쉬빌 한인 이민자 공동체\n✨ 한국어·영어 예배 운영"
          : "🔗 Presbyterian | Nashville Korean immigrant community\n✨ Korean & English services",
        tags: ko ? ["장로교", "내쉬빌"] : ["Presbyterian", "Nashville"],
      },
    ],
    philadelphia: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "필라델피아한인침례교회" : "Korean Baptist Church of Philadelphia",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속. 어퍼다비·체리힐 한인 공동체.\n📍 Upper Darby, PA\n✨ 이민자 정착 지원 · 소그룹 운영"
          : "✅ Verified | SBC-affiliated. Upper Darby · Cherry Hill Korean community.\n📍 Upper Darby, PA\n✨ Settlement support · small groups",
        tags: ko ? ["침례교", "SBC", "어퍼다비"] : ["Baptist", "SBC", "Upper Darby"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "필라델피아한인장로교회" : "Korean Presbyterian Church of Philadelphia",
        desc: ko
          ? "🔗 정통 장로교 | 필라 한인 이민자 역사 함께\n✨ 한국어·영어 다세대 예배"
          : "🔗 Presbyterian | Historic Korean immigrant church in Philly\n✨ Multi-generational Korean & English worship",
        tags: ko ? ["장로교", "필라델피아"] : ["Presbyterian", "Philadelphia"],
      },
    ],
    kansascity: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "캔자스시티한인침례교회" : "Korean Baptist Church of Kansas City",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속. 오버랜드파크 한인 공동체.\n📍 Overland Park, KS\n✨ 소그룹·ESL·정착 지원 운영"
          : "✅ Verified | SBC-affiliated. Overland Park Korean community.\n📍 Overland Park, KS\n✨ Small groups · ESL · settlement support",
        tags: ko ? ["침례교", "SBC", "오버랜드파크"] : ["Baptist", "SBC", "Overland Park"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "캔자스시티한인교회" : "Korean Church of Kansas City",
        desc: ko
          ? "🔗 복음주의 한인 교회 | KC 한인 커뮤니티\n✨ 한인회·H-Mart 인근 네트워크"
          : "🔗 Evangelical Korean church | KC Korean community\n✨ Near Korean Association & H-Mart network",
        tags: ko ? ["복음주의", "캔자스시티"] : ["Evangelical", "Kansas City"],
      },
    ],
    miami: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "마이애미한인침례교회" : "Korean Baptist Church of Miami",
        desc: ko
          ? "✅ 공식 사이트 확인 | SBC 소속. 도랄·코랄게이블스 한인 공동체.\n📍 Doral, FL\n✨ 히스패닉 문화권 속 한인 공동체 · 이중언어 예배"
          : "✅ Verified | SBC-affiliated. Doral · Coral Gables Korean community.\n📍 Doral, FL\n✨ Bilingual worship in Hispanic-culture context",
        tags: ko ? ["침례교", "SBC", "도랄"] : ["Baptist", "SBC", "Doral"],
      },
      {
        emoji: "⛪", tier: 2,
        name: ko ? "마이애미한인장로교회" : "Korean Presbyterian Church of Miami",
        desc: ko
          ? "🔗 정통 장로교 | 마이애미 한인 공동체\n✨ 중남미 비즈니스 한인 네트워크"
          : "🔗 Presbyterian | Miami Korean community\n✨ Latin America business Korean network",
        tags: ko ? ["장로교", "마이애미"] : ["Presbyterian", "Miami"],
      },
    ],
    mexicocity: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "멕시코시티한인교회" : "Korean Church of Mexico City",
        desc: ko
          ? "🔍 검증 진행 중 | 멕시코시티 한인 공동체 중심 교회\n📍 멕시코시티 한인타운 (폴란코 인근)\n✨ 주재원·비즈니스 한인 공동체 · 스페인어·한국어 예배"
          : "🔍 Verification in progress | Korean community church\n📍 Mexico City Koreatown (near Polanco)\n✨ Expat & business Koreans · Spanish-Korean bilingual",
        tags: ko ? ["한인교회", "멕시코시티", "주재원"] : ["Korean Church", "Mexico City", "Expats"],
      },
    ],
    guadalajara: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "과달라하라한인교회" : "Korean Church of Guadalajara",
        desc: ko
          ? "🔍 검증 진행 중 | 과달라하라 한인 공동체 교회\n📍 과달라하라 한인 밀집 지역\n✨ 삼성·LG·현대 등 주재원 가족 중심"
          : "🔍 Verification in progress | Korean community church\n📍 Korean district, Guadalajara\n✨ Samsung · LG · Hyundai expat families",
        tags: ko ? ["한인교회", "과달라하라", "주재원"] : ["Korean Church", "Guadalajara", "Expats"],
      },
    ],
    monterrey: [
      {
        emoji: "⭐", tier: 1,
        name: ko ? "몬테레이한인교회" : "Korean Church of Monterrey",
        desc: ko
          ? "🔍 검증 진행 중 | 몬테레이 한인 공동체 교회\n📍 몬테레이 한인 비즈니스 지구\n✨ 제조업·무역업 한인 주재원 공동체"
          : "🔍 Verification in progress | Korean community church\n📍 Korean business district, Monterrey\n✨ Manufacturing & trade Korean expat community",
        tags: ko ? ["한인교회", "몬테레이", "주재원"] : ["Korean Church", "Monterrey", "Expats"],
      },
    ],
  };
  // 등록된 도시가 없으면 구글 검색 안내 카드
  return byCity[slug] ?? [
    {
      emoji: "🔍",
      name: ko ? `${slug.toUpperCase()} 지역 한인 교회` : `Korean Churches — ${slug.toUpperCase()}`,
      desc: ko
        ? "이 지역 한인 교회 정보를 수집 중입니다.\n구글에서 '한인 교회 [도시명]' 검색 또는 현지 한인회에 문의하세요.\n✨ 좋은 교회 정보가 있으시면 알려주세요!"
        : "Church info for this area coming soon.\nSearch 'Korean church [city]' on Google or contact local Korean Association.\n✨ Know a great church? Let us know!",
      tags: ko ? ["한인교회", "정보수집중"] : ["Korean Church", "Coming Soon"],
    },
  ];
}

function ChurchScreen({ onHome }: { onHome?: () => void }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["소개", "교회 목록", "프로그램", "새가족", "🏆 허브교회"]
    : ["About", "Churches", "Programs", "New Members", "🏆 Hub Church"];
  const accent = "#C084FC";
  const citySlug = useCityConfig().slug;

  const defaultChurches = getCityChurches(citySlug, lang);
  const churches = serverContent["churches"]
    ? resolvePlaceItems(serverContent["churches"], lang)
    : defaultChurches;

  const programs = [
    { emoji: "📚", name: lang === "ko" ? "영어 ESL 클래스" : "ESL Classes", nameEn: "ESL", desc: lang === "ko" ? "무료 영어 수업. 대부분 교회에서 운영. 초급~중급 레벨별 반 구성" : "Free English classes at most churches. Beginner to intermediate levels", tags: ["무료", "영어"] },
    { emoji: "📋", name: lang === "ko" ? "이민자 정착 상담" : "Immigration Counseling", nameEn: "Immigration Support", desc: lang === "ko" ? "비자·운전면허·은행 계좌·학교 등록 등 정착 지원. 한인 자원봉사자 운영" : "Visa, license, banking, school enrollment support by Korean volunteers", tags: ["정착", "상담"] },
    { emoji: "🏃", name: lang === "ko" ? "청년 스포츠 리그" : "Youth Sports League", nameEn: "Sports", desc: lang === "ko" ? "교회 간 연합 농구·배구·축구 리그. 한인 2세 네트워킹 최고" : "Inter-church basketball, volleyball, soccer leagues. Best 2nd-gen networking", tags: ["스포츠", "청년"] },
    { emoji: "👩‍👧", name: lang === "ko" ? "여성 모임·선교회" : "Women's Ministry", nameEn: "Women's Ministry", desc: lang === "ko" ? "새 이민자 여성을 위한 생활 정보 공유, 정서적 지지 네트워크" : "Life info sharing and emotional support network for newcomer women", tags: ["여성", "커뮤니티"] },
    { emoji: "🎵", name: lang === "ko" ? "찬양·예배팀" : "Worship Team", nameEn: "Worship", desc: lang === "ko" ? "음악 경력자 환영. 한국어·영어 찬양 병행. 매주 리허설" : "Musicians welcome. Korean and English worship. Weekly rehearsal", tags: ["음악", "봉사"] },
    { emoji: "🌱", name: lang === "ko" ? "새가족 환영 모임" : "New Member Welcome", nameEn: "New Members", desc: lang === "ko" ? "처음 방문자를 위한 교회 소개·식사·멘토 연결. 무부담으로 참여" : "Church intro, meal, and mentor matching for first-time visitors. No pressure", tags: ["새가족", "환영"] },
  ];

  const newMemberInfo = lang === "ko" ? [
    { title: "처음 방문 시 팁", desc: "대부분 교회는 방문자 환영. 미리 연락 없이 예배 시간에 방문해도 됩니다. 주차장 안내원이 도와드립니다" },
    { title: "예배 시간 (일반적)", desc: "주일 1부 8:00am · 2부 11:00am · 영어예배(EBF) 11:00am. 교회마다 다르니 홈페이지 확인" },
    { title: "새가족 등록 혜택", desc: "정착 상담 · 생활 정보 · 한인 네트워크 연결. 대부분 무료 제공" },
    { title: "한인 교회 찾는 법", desc: "카카오 지도 '시애틀 한인 교회' 검색, 또는 워싱턴주 한인 교회 협회 홈페이지 참고" },
  ] : [
    { title: "Tips for first visit", desc: "Most churches warmly welcome visitors. No need to call ahead — just show up at service time. Parking attendants will help" },
    { title: "Typical service times", desc: "Sunday 1st: 8:00am · 2nd: 11:00am · English Service (EBF): 11:00am. Check each church website for details" },
    { title: "New member benefits", desc: "Settlement counseling · Life info · Korean network connection. Most services free" },
    { title: "How to find Korean churches", desc: "Search '시애틀 한인 교회' on Kakao Maps, or visit WA Korean Church Association website" },
  ];

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="⛪" titleKo="한인 교회" titleEn="Korean Churches"
        descKo={`${useCityConfig().nameKo} — 정착 지원 · 영어수업 · 커뮤니티 네트워크`}
        descEn={`${useCityConfig().nameEn} — Settlement support · ESL classes · Community`}
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        {sub === 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] mb-4">
              {[
                { n: "50+", l: lang === "ko" ? "한인 교회" : "Korean Churches" },
                { n: "20+", l: lang === "ko" ? "영어 예배팀" : "English Services" },
                { n: "무료", l: lang === "ko" ? "ESL 수업" : "ESL Classes" },
                { n: "365일", l: lang === "ko" ? "커뮤니티 활동" : "Community Activities" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(192,132,252,0.1)", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(192,132,252,0.2)", textAlign: "center" }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 900, fontSize: 22, color: "#ECFDF5" }}>{s.n}</div>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {sub === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(churches as Array<{ emoji: string; name: string; nameEn?: string; desc: string; tags?: string[]; tier?: number }>).map((c, i) => (
              <div key={i} style={c.tier === 1 ? { border: "1px solid rgba(201,162,39,0.55)", borderRadius: 16, background: "rgba(201,162,39,0.06)" } : {}}>
                {c.tier === 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px 0 14px" }}>
                    <span style={{ background: "rgba(201,162,39,0.18)", border: "1px solid rgba(201,162,39,0.45)", color: GOLD, borderRadius: 8, padding: "2px 8px", fontSize: 10, fontFamily: "Manrope,sans-serif", fontWeight: 700 }}>가정교회 ⭐</span>
                  </div>
                )}
                <PlaceCard {...c} accentColor={c.tier === 1 ? GOLD : accent} />
              </div>
            ))}
          </div>
        )}
        {sub === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {programs.map((p, i) => <PlaceCard key={i} {...p} accentColor={accent} />)}
          </div>
        )}
        {sub === 3 && (
          <InfoCard title={lang === "ko" ? "새가족 안내" : "New Member Guide"} accentColor={accent}>
            {newMemberInfo.map((item, i) => (
              <StepItem key={i} num={i + 1} title={item.title} desc={item.desc} accentColor={accent} />
            ))}
          </InfoCard>
        )}

        {/* ── TAB 5: 허브교회 네트워크 ── */}
        {sub === 4 && (
          <div style={{ paddingBottom: 8 }}>

            {/* 비전 배너 */}
            <div style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.18), rgba(192,132,252,0.1))", border: "1px solid rgba(201,162,39,0.35)", borderRadius: 18, padding: "18px 16px", marginBottom: 14 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 900, fontSize: 16, color: "#C9A227", marginBottom: 8 }}>
                🏆 {lang === "ko" ? "헤브론 허브교회 네트워크" : "Hebron Hub Church Network"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, color: "rgba(236,253,245,0.8)", lineHeight: 1.7, marginBottom: 10 }}>
                {lang === "ko"
                  ? "전 세계 한인 교회의 약 10%만이 진정으로 복음적이며, 순수하게 제자 만드는 데 헌신된 교회입니다. HebronGuide는 이 교회들과 전략적으로 연대하여 새로운 이민자들을 연결합니다."
                  : "Only about 10% of Korean diaspora churches are truly evangelical and purely committed to making disciples. HebronGuide strategically partners with these churches to connect new immigrants."}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[
                  { n: lang === "ko" ? "도시당 12개" : "12 per city", d: lang === "ko" ? "선별된 허브교회" : "Curated hub churches" },
                  { n: lang === "ko" ? "새가족 연결" : "New arrivals", d: lang === "ko" ? "허브교회로 직접 안내" : "Directed to hub churches" },
                  { n: lang === "ko" ? "전 세계" : "Worldwide", d: lang === "ko" ? "목사·선교사 네트워크" : "Pastor & missionary network" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#C9A227" }}>{s.n}</div>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "rgba(236,253,245,0.6)", marginTop: 3, lineHeight: 1.4 }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 선별 기준 6가지 */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: 14, padding: "16px", marginBottom: 12 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: accent, marginBottom: 12 }}>
                📋 {lang === "ko" ? "허브교회 선별 기준 6가지" : "6 Hub Church Selection Criteria"}
              </div>
              {[
                { n: lang === "ko" ? "복음적 (Evangelical)" : "Evangelical", d: lang === "ko" ? "오직 성경·오직 믿음·오직 은혜 — 사회복음 X" : "Scripture alone, faith alone, grace alone — not social gospel", icon: "📖" },
                { n: lang === "ko" ? "순수한 동기" : "Pure Motivation", d: lang === "ko" ? "교회 성장 수치가 아닌 영혼 구원이 목적" : "Purpose is soul salvation, not church growth numbers", icon: "🕊️" },
                { n: lang === "ko" ? "제자 만드는 열정" : "Discipleship Passion", d: lang === "ko" ? "마28:19 '제자를 삼으라' — 삶공부·목장 등 체계적 사역" : "Matt 28:19 'make disciples' — structured life study & small groups", icon: "🔥" },
                { n: lang === "ko" ? "헌신" : "Commitment", d: lang === "ko" ? "계절적이 아닌 지속적·일관된 사역" : "Consistent, year-round ministry, not seasonal", icon: "⚓" },
                { n: lang === "ko" ? "이민자 환영" : "Immigrant Welcoming", d: lang === "ko" ? "새 이민자의 문화·언어·정서적 필요를 이해" : "Understands cultural, linguistic & emotional needs of new immigrants", icon: "🤝" },
                { n: lang === "ko" ? "HebronGuide 파트너십" : "HebronGuide Partnership", d: lang === "ko" ? "새가족 연결 수락·환영 약속·공동체 책임" : "Accepts new arrivals, welcomes them, holds community accountability", icon: "✅" },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 5 ? 10 : 0, paddingBottom: i < 5 ? 10 : 0, borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>{c.n}</div>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.6)", lineHeight: 1.5, marginTop: 2 }}>{c.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 허브교회가 받는 것 */}
            <div style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.25)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: "#C9A227", marginBottom: 10 }}>
                🎁 {lang === "ko" ? "허브교회가 받는 것" : "What Hub Churches Receive"}
              </div>
              {[
                lang === "ko" ? "🏠 새 이민자가 도착하기 전에 미리 연락 — 환영 준비 가능" : "🏠 Pre-arrival notice for new immigrants — prepare welcome",
                lang === "ko" ? "📱 HebronGuide 앱에 '허브교회' 금색 배지 표시" : "📱 Gold 'Hub Church' badge displayed on HebronGuide app",
                lang === "ko" ? "🌐 전국·전 세계 목회자 네트워크 참여" : "🌐 National & global pastor network membership",
                lang === "ko" ? "📊 도시 내 한인 이민자 정착 현황 데이터 공유" : "📊 City-level Korean immigrant settlement data sharing",
                lang === "ko" ? "🤝 44개+ 도시 파트너 교회와 교인 교류·연결 (계속 확장 중)" : "🤝 Member exchange & connection with 44+ partner cities (continuously expanding)",
              ].map((item, i) => (
                <div key={i} style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, color: "rgba(236,253,245,0.8)", lineHeight: 1.7, marginBottom: 4 }}>
                  {item}
                </div>
              ))}
            </div>

            {/* 도시별 목표 */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: accent, marginBottom: 8 }}>
                🗺️ {lang === "ko" ? "도시별 12개 허브교회 목표" : "12 Hub Churches Per City Goal"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.7)", lineHeight: 1.8 }}>
                {lang === "ko"
                  ? "• 대도시 (LA·NY·달라스): 12개 교회 — 지역별 균형 배치\n• 중소도시 (시애틀·애틀랜타): 12개 이하 — 도시 전체 커버\n• 소도시·군사도시: 3-5개 교회 — 외로운 한인을 위한 등불\n\n새 이민자는 거주지에서 가장 가까운 허브교회로 자동 연결됩니다."
                  : "• Major cities (LA, NY, Dallas): 12 churches — balanced regional coverage\n• Mid cities (Seattle, Atlanta): up to 12 — city-wide coverage\n• Small & military cities: 3-5 churches — a light for lonely Koreans\n\nNew immigrants automatically connected to nearest hub church."}
              </div>
            </div>

            {/* 허브교회 탭 — 헤브론 매칭 서비스 카드 */}
            <HebronServiceCard
              icon="💍" color="#EC4899" lang={lang}
              titleKo="헤브론 매칭 — 진지하고 따뜻한 만남"
              titleEn="Hebron Match — Thoughtful & Meaningful Connection"
              descKo="같은 가치관과 삶의 방향을 가진 분을 만납니다. 신중하게, 진심으로 연결합니다."
              descEn="Meet someone who shares your values and direction in life. Connected thoughtfully and sincerely."
            />

            {/* CTA */}
            <a href="mailto:gmc.hc300@gmail.com?subject=HebronGuide 허브교회 신청"
              style={{ display: "block", textDecoration: "none" }}>
              <div style={{ background: "linear-gradient(135deg, #C9A227, #B8901C)", borderRadius: 14, padding: "16px 20px", textAlign: "center", boxShadow: "0 4px 20px rgba(201,162,39,0.4)" }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 4 }}>
                  🏆 {lang === "ko" ? "허브교회 신청 — 목사님께 연락주세요" : "Apply as Hub Church — Contact Pastor Paul Kim"}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                  gmc.hc300@gmail.com · www.ijiguchon.org
                </div>
              </div>
            </a>

          </div>
        )}

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 4: 맛집 SCREEN
───────────────────────────────────────── */
function DiningScreen({ onHome }: { onHome?: () => void }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const [foodFilter, setFoodFilter] = useState("전체");
  const tabs = lang === "ko"
    ? ["카페", "한식·맛집", "한인상권", "쇼핑"]
    : ["Café", "Korean Food", "K-Business", "Shopping"];
  const accent = "#FB923C";

  // 맛집 카테고리 필터 (Yelp 인사이트 적용)
  const FOOD_FILTERS = lang === "ko"
    ? [
        { label: "전체", emoji: "🍽️", keyword: "전체" },
        { label: "BBQ·갈비", emoji: "🥩", keyword: "BBQ" },
        { label: "치킨", emoji: "🍗", keyword: "치킨" },
        { label: "국물·찌개", emoji: "🍲", keyword: "국물" },
        { label: "카페·디저트", emoji: "☕", keyword: "카페" },
        { label: "분식·기타", emoji: "🍜", keyword: "분식" },
      ]
    : [
        { label: "All", emoji: "🍽️", keyword: "전체" },
        { label: "BBQ", emoji: "🥩", keyword: "BBQ" },
        { label: "Chicken", emoji: "🍗", keyword: "치킨" },
        { label: "Soup & Stew", emoji: "🍲", keyword: "국물" },
        { label: "Café", emoji: "☕", keyword: "카페" },
        { label: "Snacks", emoji: "🍜", keyword: "분식" },
      ];

  // ✅ 검증됨 (2026-04-30) | 출처: WowSeattle 업소록 / kSeattle / 공식 사이트
  const cafes = [
    { emoji: "☕", name: "K-Cafe Dabang", nameEn: "K-Cafe Dabang — Lynnwood", desc: lang === "ko" ? "✅ 검증됨 | 한인타운 한국식 카페. 빙수·크로플. 3333 184th St SW Ste X | ☎ (425) 678-8276 | 월-목 8am-9pm" : "✅ Verified | Korean-style café. Bingsu & croffles. 3333 184th St SW Ste X | ☎ (425) 678-8276 | M-Th 8am-9pm", tags: ["린우드", "빙수", "검증됨"] },
    { emoji: "🍱", name: "Ko Hyang Zip (H-Mart)", nameEn: "Ko Hyang Zip — H-Mart Food Court", desc: lang === "ko" ? "✅ 검증됨 | H-Mart 내 한식 푸드코트. 분식·국밥·덮밥. 3301 184th St SW | ☎ (425) 582-2691 | 월-금 10am-8pm" : "✅ Verified | Korean food court inside H-Mart. 3301 184th St SW | ☎ (425) 582-2691 | M-F 10am-8pm", tags: ["H-Mart", "분식", "검증됨"] },
    { emoji: "🍵", name: "LUMI Dessert Cafe", nameEn: "LUMI Dessert Cafe", desc: lang === "ko" ? "한인 디저트 카페. 공식 사이트에서 위치·시간 확인 | 🔗 lumidessertcafe.com" : "Korean dessert café. Check address & hours at official site | 🔗 lumidessertcafe.com", tags: ["디저트", "카페", "확인중"] },
  ];

  // ✅ 검증됨 (2026-04-30) | 출처: WowSeattle 업소록 / Yelp 2026.04
  // Yelp 인사이트 적용: 소비자 관점("이럴 때 가세요") + 카테고리 키워드 추가
  const restaurants = [
    { emoji: "🥩", name: "Baekjeong Korean BBQ ★ Yelp 3.9", nameEn: "Baekjeong Korean BBQ — Lynnwood",
      desc: lang === "ko"
        ? "✅ 검증됨 | 🥩 BBQ\n고기 무한리필 + 직원이 직접 구워줌. 무제한 밑반찬. 알더우드몰 주차 무료.\n📍 3000 184th St SW Ste 922 | 📞 (425) 490-6328 | 월-목 11:30am-10pm\n🔗 yelp.com/biz/baekjeong-korean-bbq-lynnwood"
        : "✅ Verified | 🥩 BBQ\nAll-you-can-eat + staff grills meat tableside. Free parking at Alderwood Mall.\n📍 3000 184th St SW Ste 922 | 📞 (425) 490-6328 | M-Th 11:30am-10pm\n🔗 yelp.com/biz/baekjeong-korean-bbq-lynnwood",
      tags: ["BBQ", "갈비", "린우드", "검증됨"] },
    { emoji: "🍖", name: "강남 한식당 Yelp 4.1", nameEn: "Gangnam Korean Restaurant — Lynnwood",
      desc: lang === "ko"
        ? "✅ 검증됨 | 🍲 국물·한식\n집밥 같은 한식. 갈비탕·순두부·비빔밥. 매일 10am까지 늦게 운영.\n📍 19505 44th Ave W, Lynnwood | 📞 (425) 678-0337 | 매일 10am-10:45pm\n🔗 gangnamlynnwood.com"
        : "✅ Verified | 🍲 Soup & Stew\nHomestyle Korean food. Galbitang, sundubu, bibimbap. Open late daily.\n📍 19505 44th Ave W, Lynnwood | 📞 (425) 678-0337 | Daily 10am-10:45pm\n🔗 gangnamlynnwood.com",
      tags: ["국물", "한식", "린우드", "검증됨"] },
    { emoji: "🍗", name: "소담치킨 숄라인 ★ Yelp 4.2", nameEn: "Sodam Chicken — Shoreline",
      desc: lang === "ko"
        ? "✅ 검증됨 | 🍗 치킨\n한국식 바삭 양념·간장·순살치킨. 치맥 가능. 배달도 OK.\n📍 17551 15th Ave NE, Shoreline | 📞 (206) 397-4119\n🔗 yelp.com/search?find_desc=소담치킨+shoreline"
        : "✅ Verified | 🍗 Chicken\nKorean-style fried chicken: soy garlic, sweet spicy. Beer available. Delivery OK.\n📍 17551 15th Ave NE, Shoreline | 📞 (206) 397-4119\n🔗 yelp.com/search?find_desc=sodam+chicken+shoreline",
      tags: ["치킨", "숄라인", "검증됨"] },
    { emoji: "🥩", name: "해남갈비 숄라인 ★ Yelp 4.0", nameEn: "Haenam Galbi — Shoreline",
      desc: lang === "ko"
        ? "✅ 검증됨 | 🥩 BBQ·갈비\n숯불 갈비 전문. 재래식 방식. 한국 느낌 그대로.\n📍 15001 Aurora Ave N, Shoreline | 📞 (206) 367-7843\n🔗 yelp.com/search?find_desc=해남갈비+shoreline"
        : "✅ Verified | 🥩 BBQ\nCharcoal galbi specialist. Traditional Korean style.\n📍 15001 Aurora Ave N, Shoreline | 📞 (206) 367-7843\n🔗 yelp.com/search?find_desc=haenam+galbi+shoreline",
      tags: ["BBQ", "갈비", "숄라인", "검증됨"] },
    { emoji: "🍽️", name: "Ka Won Korean BBQ ★ Yelp 4.1", nameEn: "Ka Won Korean BBQ — Lynnwood",
      desc: lang === "ko"
        ? "✅ 검증됨 | 🥩 BBQ\nHwy 99 한인타운 BBQ. 직접 구이·신선 고기. 현지 한인 단골 많음.\n📍 15004 Hwy 99 Ste A, Lynnwood | 📞 (425) 787-6484\n🔗 kawonlynnwood.com"
        : "✅ Verified | 🥩 BBQ\nLocal Korean favorite on Hwy 99. Fresh cuts, self-grill.\n📍 15004 Hwy 99 Ste A, Lynnwood | 📞 (425) 787-6484\n🔗 kawonlynnwood.com",
      tags: ["BBQ", "린우드", "검증됨"] },
  ];

  // ✅ 검증됨 (2026-04-30) | 출처: WowSeattle / SeattleN / 공식 사이트
  const businesses = [
    { emoji: "🏪", name: "H-Mart Lynnwood", nameEn: "H-Mart — Korean Supermarket", desc: lang === "ko" ? "✅ 검증됨 | 3301 184th St SW, Lynnwood | ☎ (425) 776-0858 | 매일 8am-9:30pm | 🔗 hmartus.com/lynnwood" : "✅ Verified | 3301 184th St SW, Lynnwood | ☎ (425) 776-0858 | Daily 8am-9:30pm | 🔗 hmartus.com/lynnwood", tags: ["마트", "린우드", "검증됨"] },
    { emoji: "🏦", name: "UniBank (유니뱅크)", nameEn: "UniBank — Korean-American Bank", desc: lang === "ko" ? "✅ 검증됨 | 한국계 은행. 19315 Highway 99, Lynnwood | ☎ (425) 275-9700 | 🔗 unibankusa.com" : "✅ Verified | Korean-American bank. 19315 Highway 99, Lynnwood | ☎ (425) 275-9700 | 🔗 unibankusa.com", tags: ["은행", "한국어", "검증됨"] },
    { emoji: "🏥", name: "천진 한의원", nameEn: "Chunjin Oriental Medicine — Federal Way", desc: lang === "ko" ? "✅ 검증됨 | 침술·한약. 31830 Pacific Hwy S #B, Federal Way | ☎ (253) 874-0058" : "✅ Verified | Acupuncture & herbal medicine. 31830 Pacific Hwy S #B, Federal Way | ☎ (253) 874-0058", tags: ["한의원", "페더럴웨이", "검증됨"] },
    { emoji: "✂️", name: "엠마 스킨케어", nameEn: "Emma Skincare — Lynnwood", desc: lang === "ko" ? "✅ 검증됨 | 한인 스킨케어·에스테틱. 17424 Hwy 99 #B-204, Lynnwood | ☎ (425) 525-9955" : "✅ Verified | Korean skincare & aesthetics. 17424 Hwy 99 #B-204, Lynnwood | ☎ (425) 525-9955", tags: ["스킨케어", "린우드", "검증됨"] },
    { emoji: "🔑", name: "한인 부동산", nameEn: "Korean Real Estate", desc: lang === "ko" ? "WowSeattle 검증 | 백수경 ☎ (206) 334-5454 | 박나리 ☎ (425) 246-1453 | 🔗 wowseattle.com" : "WowSeattle verified | Baik Sukyung ☎ (206) 334-5454 | Park Nari ☎ (425) 246-1453 | 🔗 wowseattle.com", tags: ["부동산", "렌탈", "검증됨"] },
  ];

  const shopping = [
    { emoji: "🛒", name: "H-Mart + Galleria", nameEn: "Lynnwood Korean Shopping Center", desc: lang === "ko" ? "H-Mart 옆 갤러리아 쇼핑몰. 한국 브랜드 의류·잡화·미용용품" : "Galleria mall next to H-Mart. Korean brand clothing, accessories & beauty products", tags: ["갤러리아", "한국브랜드", "쇼핑몰"] },
    { emoji: "💄", name: "K-Beauty 스토어", nameEn: "K-Beauty Store", desc: lang === "ko" ? "TONYMOLY·이니스프리·클리오 미국 판매점. Lynnwood·Bellevue Bellevue 스퀘어" : "TONYMOLY, Innisfree, CLIO USA stores in Lynnwood & Bellevue Square", tags: ["뷰티", "K-Beauty", "스킨케어"] },
    { emoji: "📚", name: "한국 서적·문화용품", nameEn: "Korean Books & Stationery", desc: lang === "ko" ? "한국 잡지·도서·문구. H-Mart 내 한국 서적 코너. 한국 드라마 DVD도" : "Korean magazines, books & stationery. Korean book section inside H-Mart", tags: ["서점", "문구", "도서"] },
    { emoji: "🧴", name: "한국 식재료 전문점", nameEn: "Korean Specialty Grocery", desc: lang === "ko" ? "H-Mart 외 소규모 한국 반찬·김치·떡 전문점. 린우드·페더럴웨이" : "Small-batch kimchi, banchan & tteok specialty shops beyond H-Mart", tags: ["반찬", "김치", "전문점"] },
  ];

  const resolvedCafes = serverContent["cafes"] ? resolvePlaceItems(serverContent["cafes"], lang) : cafes;
  const resolvedRestaurants = serverContent["restaurants"] ? resolvePlaceItems(serverContent["restaurants"], lang) : restaurants;
  const resolvedBusinesses = serverContent["businesses"] ? resolvePlaceItems(serverContent["businesses"], lang) : businesses;
  const resolvedShopping = serverContent["shopping"] ? resolvePlaceItems(serverContent["shopping"], lang) : shopping;

  // 카테고리 필터 적용 (Yelp 인사이트)
  const filteredRestaurants = foodFilter === "전체"
    ? resolvedRestaurants
    : resolvedRestaurants.filter(item =>
        (item.tags ?? []).some(tag => tag.includes(foodFilter) || item.desc.includes(foodFilter))
      );

  const content = sub === 1
    ? filteredRestaurants
    : [resolvedCafes, resolvedRestaurants, resolvedBusinesses, resolvedShopping][sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🍽️" titleKo="카페 · 맛집" titleEn="Café & Dining"
        descKo={`${useCityConfig().nameKo} 한인 카페·맛집·상권 완전 가이드`}
        descEn={`Complete guide to ${useCityConfig().nameEn}'s Korean cafés, restaurants & district`}
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={(i) => { setSub(i); setFoodFilter("전체"); }} accentColor={accent} />

      {/* 맛집 카테고리 퀵 필터 (Yelp 인사이트: 메뉴 카테고리로 걸러보기) */}
      {sub === 1 && (
        <div style={{ padding: "10px 16px 4px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 7, flexWrap: "nowrap", paddingBottom: 2 }}>
            {FOOD_FILTERS.map(f => {
              const isActive = foodFilter === f.keyword;
              return (
                <button key={f.keyword} onClick={() => setFoodFilter(f.keyword)}
                  style={{
                    flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                    background: isActive ? accent : "rgba(251,146,60,0.12)",
                    color: isActive ? "#fff" : accent,
                    fontFamily: "-apple-system, 'Noto Sans KR', sans-serif",
                    fontWeight: 700, fontSize: 12,
                    transition: "all 0.15s ease",
                    boxShadow: isActive ? `0 2px 8px ${accent}44` : "none",
                  }}>
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
          {foodFilter !== "전체" && (
            <div style={{ fontSize: 10, color: "rgba(236,253,245,0.4)", fontFamily: "Manrope,sans-serif", marginTop: 6, paddingLeft: 2 }}>
              {lang === "ko" ? `"${foodFilter}" 카테고리 필터 중` : `Filtering by "${foodFilter}"`}
            </div>
          )}
        </div>
      )}

      <div className="pt-3">
        {sub === 1 && (
          <Top5Banner items={
            useCityConfig().slug === "dallas"   ? TOP5_RESTAURANTS_DALLAS :
            useCityConfig().slug === "sf"       ? TOP5_RESTAURANTS_SF :
            useCityConfig().slug === "newyork"  ? TOP5_RESTAURANTS_NEWYORK :
            useCityConfig().slug === "nashville"? TOP5_RESTAURANTS_NASHVILLE :
            useCityConfig().slug === "boston"   ? TOP5_RESTAURANTS_BOSTON :
            useCityConfig().slug === "la"        ? TOP5_RESTAURANTS_LA :
            useCityConfig().slug === "toronto"   ? TOP5_RESTAURANTS_TORONTO :
            useCityConfig().slug === "vancouver" ? TOP5_RESTAURANTS_VANCOUVER :
            useCityConfig().slug === "houston"   ? TOP5_RESTAURANTS_HOUSTON :
            useCityConfig().slug === "atlanta"   ? TOP5_RESTAURANTS_ATLANTA :
            useCityConfig().slug === "kansascity"? TOP5_RESTAURANTS_KANSASCITY :
            useCityConfig().slug === "philadelphia" ? TOP5_RESTAURANTS_PHILADELPHIA :
            useCityConfig().slug === "miami"     ? TOP5_RESTAURANTS_MIAMI :
            useCityConfig().slug === "mexicocity"? TOP5_RESTAURANTS_MEXICOCITY :
            useCityConfig().slug === "guadalajara"? TOP5_RESTAURANTS_GUADALAJARA :
            useCityConfig().slug === "monterrey" ? TOP5_RESTAURANTS_MONTERREY :
            TOP5_RESTAURANTS
          } lang={lang} accentColor="#EF4444" />
        )}
        <div className="px-4 md:px-6 lg:px-8">
          {content.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(236,253,245,0.4)", fontFamily: "Manrope,sans-serif", fontSize: 14 }}>
              {lang === "ko" ? "해당 카테고리 업소를 추가 중입니다 🙏" : "More places in this category coming soon 🙏"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            </div>
          )}
          <div style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 10 }}>
              🗺️ {lang === "ko" ? "지도에서 바로 찾기" : "Find on Map"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <a href="https://www.google.com/maps/search/Korean+restaurant+Lynnwood+WA"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                  background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 12px",
                  border: "1px solid rgba(251,146,60,0.2)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                <span style={{ fontSize: 16 }}>🗺️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                    Korean restaurant Lynnwood WA
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>Google Maps</div>
                </div>
                <span style={{ color: accent, fontSize: 14 }}>→</span>
              </a>
              <a href="https://www.google.com/maps/search/%ED%95%9C%EC%9D%B8+%EB%A7%9B%EC%A7%91+%EC%8B%9C%EC%95%A0%ED%8B%80"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                  background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 12px",
                  border: "1px solid rgba(251,146,60,0.2)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                <span style={{ fontSize: 16 }}>🗺️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                    {lang === "ko" ? "한인 맛집 시애틀" : "Korean food Seattle"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>Google Maps</div>
                </div>
                <span style={{ color: accent, fontSize: 14 }}>→</span>
              </a>
              <a href="https://www.yelp.com/search?find_desc=Korean+Restaurant&find_loc=Lynnwood%2C+WA"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                  background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 12px",
                  border: "1px solid rgba(251,146,60,0.2)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                <span style={{ fontSize: 16 }}>⭐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                    Korean Restaurant · Lynnwood
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>Yelp {lang === "ko" ? "한국어 리뷰" : "Reviews"}</div>
                </div>
                <span style={{ color: accent, fontSize: 14 }}>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 5: 탐방 SCREEN
───────────────────────────────────────── */
function ExploreScreen({ onHome }: { onHome?: () => void }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["지역안내", "자연·여행", "문화·예술", "스포츠", "🧭 헤브론관광"]
    : ["Areas", "Nature", "Culture & Art", "Sports", "🧭 Hebron Tour"];
  const accent = "#34D399";

  const areas = [
    { emoji: "🌲", name: "린우드 (Lynnwood)", nameEn: "Lynnwood — Korean Town Hub", desc: lang === "ko" ? "시애틀 최대 한인타운. H-Mart·한식당·교회 밀집. 한인 정착 1순위 지역" : "Seattle's largest Koreatown. H-Mart, Korean restaurants & churches. Top choice for new settlers", tags: ["한인타운", "H-Mart", "추천"] },
    { emoji: "💼", name: "벨뷰 (Bellevue)", nameEn: "Bellevue — Tech & Affluent", desc: lang === "ko" ? "Microsoft·Amazon 직원 다수 거주. 좋은 학군. 평균 렌트 높음. 한인 비율 ↑" : "Many Microsoft & Amazon employees. Top school districts. Higher rent but excellent Korean community", tags: ["직장인", "학군", "테크"] },
    { emoji: "🌊", name: "페더럴웨이 (Federal Way)", nameEn: "Federal Way — Affordable Korean Area", desc: lang === "ko" ? "렌트 상대적 저렴. 한인 인구 많음. I-5 접근성 좋음. 한국 식당·교회 다수" : "More affordable rent. Large Korean population. Good I-5 access. Many Korean restaurants & churches", tags: ["저렴", "한인", "I-5"] },
    { emoji: "🏙️", name: "오번 (Auburn)", nameEn: "Auburn — Korean Community Growing", desc: lang === "ko" ? "페더럴웨이 남쪽. 신흥 한인 밀집 지역. 렌트 경쟁력. 한국 마트·교회 증가 중" : "South of Federal Way. Growing Korean community. Competitive rent. More Korean stores & churches opening", tags: ["오번", "성장", "가성비"] },
    { emoji: "🎓", name: "대학지구 (University District)", nameEn: "U-District — Student Area", desc: lang === "ko" ? "UW 인근. 유학생·대학원생 多. 한국 식당·카페 집중. 버스·링크 접근성 최고" : "Near UW. Many Korean students & grad students. Concentrated Korean food. Excellent transit access", tags: ["유학생", "UW", "교통"] },
    { emoji: "🏝️", name: "메서 아일랜드 (Mercer Island)", nameEn: "Mercer Island — Upscale", desc: lang === "ko" ? "시애틀 동쪽 호수 섬. 고급 주거지. 한인 의사·변호사 다수 거주. I-90 접근" : "Upscale lake island east of Seattle. Many Korean professionals. I-90 access", tags: ["고급", "전문직", "조용"] },
  ];

  const nature = [
    { emoji: "🏔️", name: "레이니어산 국립공원", nameEn: "Mt. Rainier National Park", desc: lang === "ko" ? "시애틀 상징 화산. 여름 트레킹·겨울 스키. Paradise 전망대 꼭 방문. 1~2시간 거리" : "Seattle's iconic volcano. Summer hiking & winter skiing. Must visit Paradise viewpoint. 1-2hrs away", tags: ["트레킹", "국립공원", "당일치기"] },
    { emoji: "💧", name: "스노퀄미 폭포", nameEn: "Snoqualmie Falls", desc: lang === "ko" ? "Twin Peaks 촬영지. 시애틀 동쪽 30분. 폭포+카페+산책로 조합 최고" : "Twin Peaks filming location. 30min east of Seattle. Waterfall + café + trail combo", tags: ["폭포", "30분", "당일"] },
    { emoji: "🌊", name: "올림픽 반도", nameEn: "Olympic Peninsula", desc: lang === "ko" ? "우림·빙하·해안 세 가지 다 있음. 포트엔젤레스 경유 페리. 1박 2일 권장" : "Rainforest, glaciers & coastline all in one. Ferry via Port Angeles. Recommend overnight", tags: ["우림", "페리", "1박"] },
    { emoji: "🌺", name: "스카짓 밸리 튤립 축제", nameEn: "Skagit Valley Tulip Festival", desc: lang === "ko" ? "매년 4월. 시애틀 북쪽 1시간. 10만 평 튤립 밭. 사진 명소 압도적" : "Every April. 1hr north of Seattle. Massive tulip fields. Overwhelming photo opportunities", tags: ["4월", "튤립", "사진"] },
    { emoji: "🏖️", name: "오션 쇼어스 해변", nameEn: "Ocean Shores Beach", desc: lang === "ko" ? "태평양 해변 드라이브. 시애틀 서쪽 2.5시간. 조개 캐기·모래사장·말 타기" : "Pacific Ocean beach drive. 2.5hrs west. Clam digging, sand beach & horseback riding", tags: ["해변", "드라이브", "2.5시간"] },
    { emoji: "⛷️", name: "스노퀄미 패스 스키장", nameEn: "Snoqualmie Pass Ski Resort", desc: lang === "ko" ? "시애틀 동쪽 1시간 스키장. 초·중급 코스 풍부. 한인 스키클럽 연계 가능" : "Ski resort 1hr east. Good beginner to intermediate runs. Korean ski clubs available", tags: ["스키", "1시간", "겨울"] },
  ];

  const culture = [
    { emoji: "🎨", name: "시애틀 미술관 (SAM)", nameEn: "Seattle Art Museum", desc: lang === "ko" ? "다운타운. 아시아·원주민·현대 미술 컬렉션. 매달 무료 입장일 있음" : "Downtown. Asian, Native American & modern art collection. Free admission days monthly", tags: ["미술관", "다운타운", "무료일"] },
    { emoji: "🌸", name: "치훌리 정원", nameEn: "Chihuly Garden and Glass", desc: lang === "ko" ? "스페이스니들 옆 유리 공예 미술관. 인스타 최강. 입장료 있음($32)" : "Glass art museum next to Space Needle. Best Instagram spot. Admission $32", tags: ["유리공예", "스페이스니들", "인스타"] },
    { emoji: "🎭", name: "파이크 플레이스 마켓", nameEn: "Pike Place Market", desc: lang === "ko" ? "시애틀 상징 재래시장. 생선 던지기 쇼·꽃·커피·수공예품. 관광객 필수 방문" : "Seattle's iconic public market. Fish toss, flowers, coffee, crafts. Tourist must-visit", tags: ["관광", "시장", "필수"] },
    { emoji: "🚀", name: "스페이스 니들", nameEn: "Space Needle", desc: lang === "ko" ? "시애틀 랜드마크. 전망대+회전 레스토랑. 사전 예약 권장. 야경 최고" : "Seattle landmark. Observatory + revolving restaurant. Pre-book recommended. Best night view", tags: ["랜드마크", "전망대", "야경"] },
    { emoji: "🖥️", name: "뮤지엄 오브 팝 컬처", nameEn: "Museum of Pop Culture (MoPOP)", desc: lang === "ko" ? "록·SF·공포·게임 문화 박물관. 스페이스니들 옆. 특별전 자주 변경" : "Rock, sci-fi, horror & gaming culture museum next to Space Needle. Special exhibits change often", tags: ["팝컬처", "게임", "음악"] },
    { emoji: "🌿", name: "워싱턴 파크 식물원", nameEn: "Washington Park Arboretum", desc: lang === "ko" ? "UW 인근. 벚꽃·단풍 명소. 무료 입장. 가족 피크닉 최적" : "Near UW. Famous for cherry blossoms & fall foliage. Free. Perfect for family picnics", tags: ["벚꽃", "무료", "가족"] },
  ];

  const sports = [
    { emoji: "⚾", name: "시애틀 매리너스", nameEn: "Seattle Mariners (MLB)", desc: lang === "ko" ? "MLB 야구팀. T-Mobile Park. 오타니 이전 전 류현진·추신수 응원 인연. 한인 팬 많음" : "MLB baseball at T-Mobile Park. Large Korean fan base. Korean heritage nights held", tags: ["야구", "MLB", "다운타운"] },
    { emoji: "🏈", name: "시애틀 씨호크스", nameEn: "Seattle Seahawks (NFL)", desc: lang === "ko" ? "NFL 미식축구. Lumen Field. 12번째 선수(12th Man) 응원 문화 유명" : "NFL football at Lumen Field. Famous '12th Man' fan culture. Very loud stadium", tags: ["미식축구", "NFL", "루멘필드"] },
    { emoji: "⛳", name: "골프 (한인 골프 모임)", nameEn: "Korean Golf Groups", desc: lang === "ko" ? "한인 골프 클럽 다수. 에베레트·켄트·오번 퍼블릭 골프장 이용. 카카오 단톡방 활성" : "Many Korean golf clubs. Public courses in Everett, Kent & Auburn. Active KakaoTalk groups", tags: ["골프", "한인모임", "퍼블릭"] },
    { emoji: "🎿", name: "스키·스노보드", nameEn: "Skiing & Snowboarding", desc: lang === "ko" ? "스노퀄미·스티븐스 패스·수 스키장. 한인 스키클럽 여럿. 시즌권 공동구매도" : "Snoqualmie, Stevens Pass & Ski Snoqualmie. Korean ski clubs active. Group season pass deals", tags: ["스키", "보드", "클럽"] },
    { emoji: "🏊", name: "수영·배드민턴", nameEn: "Swimming & Badminton", desc: lang === "ko" ? "한인 배드민턴 클럽 매우 활발. 레크 센터 저렴한 수영 프로그램. 주말 모임" : "Very active Korean badminton clubs. Affordable swimming at rec centers. Weekend gatherings", tags: ["배드민턴", "수영", "주말"] },
    { emoji: "⚽", name: "한인 축구·농구 리그", nameEn: "Korean Soccer & Basketball League", desc: lang === "ko" ? "교회 연합 한인 스포츠 리그. 봄·가을 시즌 운영. 한인 커뮤니티 네트워킹 최고" : "Inter-church Korean sports leagues. Spring & fall seasons. Best Korean community networking", tags: ["교회리그", "네트워킹", "계절"] },
  ];

  const resolvedAreas = serverContent["areas"] ? resolvePlaceItems(serverContent["areas"], lang) : areas;
  const resolvedNature = serverContent["nature"] ? resolvePlaceItems(serverContent["nature"], lang) : nature;
  const resolvedCulture = serverContent["culture"] ? resolvePlaceItems(serverContent["culture"], lang) : culture;
  const resolvedSports = serverContent["sports"] ? resolvePlaceItems(serverContent["sports"], lang) : sports;
  const content = [resolvedAreas, resolvedNature, resolvedCulture, resolvedSports][sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🗺️" titleKo="관광" titleEn="Tourism"
        descKo={`${useCityConfig().nameKo} — 지역안내 · 자연 · 문화 · 스포츠`}
        descEn={`${useCityConfig().nameEn} — Areas, Nature, Culture & Sports`}
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5">
        {sub === 0 && (
          <Top5Banner items={(() => {
            const slug = useCityConfig().slug;
            const base =
              slug === "dallas"       ? TOP5_EXPLORE_DALLAS :
              slug === "sf"           ? TOP5_EXPLORE_SF :
              slug === "newyork"      ? TOP5_EXPLORE_NEWYORK :
              slug === "nashville"    ? TOP5_EXPLORE_NASHVILLE :
              slug === "boston"       ? TOP5_EXPLORE_BOSTON :
              slug === "la"           ? TOP5_EXPLORE_LA :
              slug === "toronto"      ? TOP5_EXPLORE_TORONTO :
              slug === "vancouver"    ? TOP5_EXPLORE_VANCOUVER :
              slug === "houston"      ? TOP5_EXPLORE_HOUSTON :
              slug === "atlanta"      ? TOP5_EXPLORE_ATLANTA :
              slug === "kansascity"   ? TOP5_EXPLORE_KANSASCITY :
              slug === "philadelphia" ? TOP5_EXPLORE_PHILADELPHIA :
              slug === "miami"        ? TOP5_EXPLORE_MIAMI :
              slug === "mexicocity"   ? TOP5_EXPLORE_MEXICOCITY :
              slug === "guadalajara"  ? TOP5_EXPLORE_GUADALAJARA :
              slug === "monterrey"    ? TOP5_EXPLORE_MONTERREY :
              TOP5_EXPLORE; // seattle — 자체적으로 isSeattleShuttleActive() 적용됨
            // 월드컵 시즌(6/11~7/19): 시애틀 외 모든 WC 호스트 도시에 교통 정보 1순위 삽입
            return slug === "seattle" ? base : withWorldCupTransit(slug, base);
          })()} lang={lang} accentColor="#0EA5E9" />
        )}
        <div className="px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          {/* 헤브론관광 서브탭 (sub 4) */}
          {sub === 4 && (
            <div style={{ paddingTop: 4 }}>

              {/* 헤더 — 경험 중심 (종교 언어 없음) */}
              <div style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.18), rgba(52,211,153,0.08))", border: "1px solid rgba(6,182,212,0.35)", borderRadius: 20, padding: "20px 18px", marginBottom: 14 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 900, fontSize: 18, color: "#ECFDF5", marginBottom: 6 }}>
                  🧭 Hebron 관광
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 13, color: "rgba(236,253,245,0.8)", lineHeight: 1.7, marginBottom: 14 }}>
                  {lang === "ko"
                    ? "이 도시에서 오래 살아온 한인이 직접 안내합니다.\n관광안내소엔 없는 — 진짜 맛집, 숨은 명소, 한인 커뮤니티.\n한국어로, 따뜻하게, 진심으로."
                    : "Guided by Koreans who actually lived here for years.\nReal restaurants, hidden gems & Korean community — not in tourist guides.\nIn Korean. With warmth. From the heart."}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {[
                    { n: lang === "ko" ? "현지 한인" : "Local Korean", d: lang === "ko" ? "오래 살아온 분" : "Long-time residents" },
                    { n: lang === "ko" ? "한국어 안내" : "Korean Tour", d: lang === "ko" ? "44개+ 도시" : "44+ cities" },
                    { n: lang === "ko" ? "소규모 투어" : "Small Group", d: lang === "ko" ? "개인 맞춤" : "Personal touch" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: "#06B6D4" }}>{s.n}</div>
                      <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "rgba(236,253,245,0.55)", marginTop: 2 }}>{s.d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 가이드 특징 — 경험 중심 */}
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: "#06B6D4", marginBottom: 12 }}>
                  ✨ {lang === "ko" ? "헤브론 가이드는 이런 분들입니다" : "What makes our guides special"}
                </div>
                {[
                  { icon: "🏙️", ko: "이 도시에서 수년간 살며 직접 경험한 분", en: "Lived in this city for years — they know it firsthand" },
                  { icon: "🍽️", ko: "한인 맛집·숨은 명소 직접 알고 있는 분", en: "Know the real Korean spots & hidden gems personally" },
                  { icon: "🗣️", ko: "한국어로 편안하게 이야기 나눌 수 있는 분", en: "Can comfortably share stories in Korean" },
                  { icon: "🤝", ko: "도움이 되고 싶은 마음이 먼저인 분", en: "Motivated by genuinely wanting to help you" },
                  { icon: "🌆", ko: "도시의 역사·문화·한인 커뮤니티 이야기 풍부한 분", en: "Rich in local history, culture & Korean community stories" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, color: "rgba(236,253,245,0.8)", lineHeight: 1.5 }}>
                      {lang === "ko" ? item.ko : item.en}
                    </div>
                  </div>
                ))}
              </div>

              {/* 투어 패키지 예시 */}
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: "#06B6D4", marginBottom: 10 }}>
                🗺️ {lang === "ko" ? "투어 패키지 예시" : "Sample Tour Packages"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {[
                  { emoji: "🛬", nameKo: "정착자 첫 도시 투어 (3시간)", nameEn: "New Settler City Orientation (3hrs)", descKo: "공항 픽업 → 한인타운 → H-Mart → 주요 정착지 소개 → 교회 자연스러운 소개", descEn: "Airport pickup → Koreatown → H-Mart → Settlement key spots → Natural church intro", priceKo: "$80/인", priceEn: "$80/person" },
                  { emoji: "🌆", nameKo: "도시 핵심 탐방 (4시간)", nameEn: "City Essential Tour (4hrs)", descKo: "현지인만 아는 맛집·명소·한인 커뮤니티 허브 탐방. 관광안내소엔 없는 코스", descEn: "Hidden local gems, food spots & Korean community hubs. Off the tourist trail.", priceKo: "$100/인", priceEn: "$100/person" },
                  { emoji: "🏔️", nameKo: "당일치기 자연 투어 (8시간)", nameEn: "Day Trip Nature Tour (8hrs)", descKo: "국립공원·폭포·해변 등 당일 드라이브 투어. 한국어 설명 + 현지 맛집 포함", descEn: "National park, waterfall or beach day trip with Korean commentary & local lunch", priceKo: "$150/인 (2인 이상)", priceEn: "$150/person (2+ guests)" },
                  { emoji: "✝️", nameKo: "월드컵 응원 + 도시 투어 (2026)", nameEn: "World Cup Fan + City Tour (2026)", descKo: "경기 전날·당일 한인 응원 투어. 한식당 → 한인 팬 모임 → 경기장 도우미", descEn: "Pre/match day Korean fan tour. Korean restaurant → fan gathering → stadium guide", priceKo: "$120/인", priceEn: "$120/person" },
                ].map((pkg, i) => (
                  <div key={i} style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{pkg.emoji}</span>
                        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#ECFDF5" }}>
                          {lang === "ko" ? pkg.nameKo : pkg.nameEn}
                        </div>
                      </div>
                      <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 900, fontSize: 13, color: "#06B6D4", flexShrink: 0, marginLeft: 8 }}>
                        {lang === "ko" ? pkg.priceKo : pkg.priceEn}
                      </span>
                    </div>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.65)", lineHeight: 1.6, paddingLeft: 26 }}>
                      {lang === "ko" ? pkg.descKo : pkg.descEn}
                    </div>
                  </div>
                ))}
              </div>

              {/* 파트너 안내는 내부 문서로 — 사용자 화면엔 노출 안 함 */}

              {/* CTA — 투어 예약 (사용자용) 먼저, 가이드 등록 (파트너용) 뒤에 작게 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="mailto:gmc.hc300@gmail.com?subject=Hebron 관광 투어 예약 문의"
                  style={{ display: "block", textDecoration: "none" }}>
                  <div style={{ background: "linear-gradient(135deg, #06B6D4, #0891B2)", borderRadius: 14, padding: "14px 20px", textAlign: "center", boxShadow: "0 4px 20px rgba(6,182,212,0.35)" }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 3 }}>
                      🧭 {lang === "ko" ? "투어 예약 문의하기" : "Book a Tour"}
                    </div>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                      gmc.hc300@gmail.com
                    </div>
                  </div>
                </a>
                {/* 가이드 등록 — 작게, 파트너용 */}
                <a href="mailto:gmc.hc300@gmail.com?subject=Hebron 관광 가이드 참여 문의"
                  style={{ display: "block", textDecoration: "none" }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px", textAlign: "center" }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)" }}>
                      {lang === "ko" ? "이 도시를 안내하고 싶으신 분 → 문의하기" : "Want to guide this city? → Contact us"}
                    </div>
                  </div>
                </a>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 6: 도움 SCREEN
───────────────────────────────────────── */
// 도시별 커뮤니티 링크 & 유용한 링크 — 시애틀 전용 제거
const CITY_CONSULATE: Record<string, { ko: string; en: string; phone: string; url: string }> = {
  seattle:      { ko: "주시애틀 대한민국 총영사관", en: "Korean Consulate General Seattle",      phone: "(206) 441-1011", url: "overseas.mofa.go.kr/us-seattle-ko" },
  dallas:       { ko: "주달라스 대한민국 출장소",   en: "Korean Consulate Branch Dallas",        phone: "(214) 750-9090", url: "overseas.mofa.go.kr/us-dallas-ko" },
  sf:           { ko: "주샌프란시스코 총영사관",    en: "Korean Consulate General San Francisco", phone: "(415) 921-2251", url: "overseas.mofa.go.kr/us-sanfrancisco-ko" },
  newyork:      { ko: "주뉴욕 대한민국 총영사관",   en: "Korean Consulate General New York",     phone: "(646) 674-6000", url: "overseas.mofa.go.kr/us-newyork-ko" },
  nashville:    { ko: "주애틀랜타 총영사관 (관할)", en: "Korean Consulate General Atlanta",      phone: "(404) 522-1611", url: "overseas.mofa.go.kr/us-atlanta-ko" },
  boston:       { ko: "주보스턴 대한민국 총영사관", en: "Korean Consulate General Boston",       phone: "(617) 641-2830", url: "overseas.mofa.go.kr/us-boston-ko" },
  la:           { ko: "주LA 대한민국 총영사관",    en: "Korean Consulate General Los Angeles",   phone: "(213) 385-9300", url: "overseas.mofa.go.kr/us-losangeles-ko" },
  toronto:      { ko: "주토론토 대한민국 총영사관", en: "Korean Consulate General Toronto",      phone: "(416) 920-3809", url: "overseas.mofa.go.kr/ca-toronto-ko" },
  vancouver:    { ko: "주밴쿠버 대한민국 총영사관", en: "Korean Consulate General Vancouver",    phone: "(604) 681-9581", url: "overseas.mofa.go.kr/ca-vancouver-ko" },
  houston:      { ko: "주휴스턴 대한민국 총영사관", en: "Korean Consulate General Houston",      phone: "(713) 961-0186", url: "overseas.mofa.go.kr/us-houston-ko" },
  atlanta:      { ko: "주애틀랜타 대한민국 총영사관", en: "Korean Consulate General Atlanta",   phone: "(404) 522-1611", url: "overseas.mofa.go.kr/us-atlanta-ko" },
  kansascity:   { ko: "주시카고 총영사관 (관할)",  en: "Korean Consulate General Chicago",       phone: "(312) 822-9485", url: "overseas.mofa.go.kr/us-chicago-ko" },
  philadelphia: { ko: "주필라델피아 대한민국 출장소", en: "Korean Consulate Branch Philadelphia", phone: "(215) 923-9655", url: "overseas.mofa.go.kr/us-philadelphia-ko" },
  miami:        { ko: "주마이애미 총영사관",        en: "Korean Consulate General Miami",        phone: "(305) 379-8530", url: "overseas.mofa.go.kr/us-miami-ko" },
  mexicocity:   { ko: "주멕시코 대한민국 대사관",  en: "Korean Embassy Mexico City",             phone: "+52-55-5202-9866", url: "overseas.mofa.go.kr/mx-ko" },
  guadalajara:  { ko: "주멕시코 대한민국 대사관",  en: "Korean Embassy Mexico City",             phone: "+52-55-5202-9866", url: "overseas.mofa.go.kr/mx-ko" },
  monterrey:    { ko: "주멕시코 대한민국 대사관",  en: "Korean Embassy Mexico City",             phone: "+52-55-5202-9866", url: "overseas.mofa.go.kr/mx-ko" },
};

/* ─────────────────────────────────────────
   도시별 긴급 연락처 데이터
   출처: 각 도시 공식 응급 / 경찰 / 가스회사 정보
───────────────────────────────────────── */
function getCityEmergencyData(slug: string, lang: string) {
  const ko = lang === "ko";
  type EmData = { erName: string; erPhone: string; erAddr: string; policeNE: string; gasName: string; gasPhone: string; consulatePhone: string; safetyTips: string; safetyTipsEn: string };
  const D: Record<string, EmData> = {
    seattle: {
      erName: ko ? "응급실 — Swedish First Hill" : "ER — Swedish First Hill",
      erPhone: "206-386-6000",
      erAddr: ko ? "📍 747 Broadway, Seattle | 24시간 ER | 한국어 통역 가능" : "📍 747 Broadway, Seattle | 24hr ER | Korean interpreter",
      policeNE: "206-625-5011",
      gasName: ko ? "가스 누출 — Puget Sound Energy" : "Gas Leak — Puget Sound Energy",
      gasPhone: "888-225-5773",
      consulatePhone: "206-947-8293",
      safetyTips: "• 다운타운 파이오니어 스퀘어·3rd Ave 야간 주의\n• 차량 내 귀중품 절대 방치 금지\n• 자전거·차량 반드시 잠금\n• 홈리스 밀집 지역 (SODO, 3rd Ave) 인지",
      safetyTipsEn: "• Avoid Pioneer Square & 3rd Ave at night\n• Never leave valuables in car\n• Always lock bikes & vehicles\n• Be aware of high homeless areas (SODO, 3rd Ave)",
    },
    dallas: {
      erName: ko ? "응급실 — Baylor Scott & White (Dallas)" : "ER — Baylor Scott & White Dallas",
      erPhone: "214-820-3151",
      erAddr: ko ? "📍 3500 Gaston Ave, Dallas TX | 24시간 ER" : "📍 3500 Gaston Ave, Dallas TX | 24hr ER",
      policeNE: "214-744-4444",
      gasName: ko ? "가스 누출 — Atmos Energy" : "Gas Leak — Atmos Energy",
      gasPhone: "866-322-8667",
      consulatePhone: "713-961-0186",
      safetyTips: "• 딥엘름(Deep Ellum) 야간 주의 (취객 밀집)\n• 차량 잠금 철저 — 달라스 차량 절도 많음\n• 남쪽 달라스 일부 지역 야간 주의\n• 폭염 시 차량 내 절대 방치 금지 (어린이·반려동물)",
      safetyTipsEn: "• Avoid Deep Ellum late at night (heavy foot traffic)\n• Lock vehicles — Dallas has high car theft rates\n• Some South Dallas neighborhoods — caution at night\n• Never leave children/pets in cars during extreme heat",
    },
    sf: {
      erName: ko ? "응급실 — UCSF Medical Center" : "ER — UCSF Medical Center",
      erPhone: "415-476-1000",
      erAddr: ko ? "📍 505 Parnassus Ave, San Francisco | 24시간 ER" : "📍 505 Parnassus Ave, San Francisco | 24hr ER",
      policeNE: "415-553-0123",
      gasName: ko ? "가스 누출 — PG&E" : "Gas Leak — Pacific Gas & Electric (PG&E)",
      gasPhone: "800-743-5000",
      consulatePhone: "415-921-2251",
      safetyTips: "• 텐더로인(Tenderloin)·SOMA 일부 야간 주의\n• 차량 내 가방·짐 절대 방치 금지 (차 유리 깨기 빈번)\n• 바트(BART) 야간 이용 시 주의\n• 지진 대비: 물·식량 72시간분 준비 권장",
      safetyTipsEn: "• Avoid Tenderloin & parts of SoMa at night\n• NEVER leave bags/luggage in car (car break-ins very common)\n• Be cautious on BART late at night\n• Earthquake prep: keep 72hr water & food supplies",
    },
    newyork: {
      erName: ko ? "응급실 — NewYork-Presbyterian/Weill Cornell" : "ER — NewYork-Presbyterian/Weill Cornell",
      erPhone: "212-746-5454",
      erAddr: ko ? "📍 525 E 68th St, New York NY | 24시간 ER" : "📍 525 E 68th St, New York NY | 24hr ER",
      policeNE: "212-374-5000",
      gasName: ko ? "가스 누출 — Con Edison" : "Gas Leak — Con Edison",
      gasPhone: "800-752-6633",
      consulatePhone: "646-674-6000",
      safetyTips: "• 타임스퀘어·지하철역 소매치기 주의\n• 지하철 야간 이용 시 앞쪽 칸·사람 많은 칸 선택\n• 플러싱 야간 주차 주의 (차량 절도)\n• 투어리스트 사기 조심 (가짜 CD, 가짜 기부)\n• NJ 포트리 운전 시 조지워싱턴브리지 혼잡 인지",
      safetyTipsEn: "• Watch for pickpockets at Times Square & subway stations\n• Take front/crowded subway cars late at night\n• Be careful of tourist scams (fake CDs, fake charity)\n• Watch for car theft in Flushing parking areas\n• Expect heavy traffic at George Washington Bridge from NJ",
    },
    la: {
      erName: ko ? "응급실 — Cedars-Sinai Medical Center" : "ER — Cedars-Sinai Medical Center",
      erPhone: "310-423-3277",
      erAddr: ko ? "📍 8700 Beverly Blvd, Los Angeles CA | 24시간 ER" : "📍 8700 Beverly Blvd, Los Angeles CA | 24hr ER",
      policeNE: "877-275-5273",
      gasName: ko ? "가스 누출 — SoCalGas" : "Gas Leak — Southern California Gas (SoCalGas)",
      gasPhone: "800-427-2200",
      consulatePhone: "213-385-9300",
      safetyTips: "• 차량 내 귀중품 절대 방치 금지 (LA 차량 절도 전국 최고)\n• 스키드로우(Skid Row) 지역 주의\n• 코리아타운 야간 주차 주의\n• 산불 시즌 (10-12월) 대피 경보 주의\n• 도로 교통 매우 혼잡 — 내비 필수",
      safetyTipsEn: "• NEVER leave valuables in car (LA has highest car break-in rates)\n• Avoid Skid Row area\n• Watch for car theft in Koreatown at night\n• Wildfire season (Oct-Dec) — monitor evacuation alerts\n• Traffic is extreme — always use navigation",
    },
    houston: {
      erName: ko ? "응급실 — Houston Methodist Hospital" : "ER — Houston Methodist Hospital",
      erPhone: "713-790-3333",
      erAddr: ko ? "📍 6565 Fannin St, Houston TX | 24시간 ER" : "📍 6565 Fannin St, Houston TX | 24hr ER",
      policeNE: "713-884-3131",
      gasName: ko ? "가스 누출 — CenterPoint Energy" : "Gas Leak — CenterPoint Energy",
      gasPhone: "800-332-7143",
      consulatePhone: "713-961-0186",
      safetyTips: "• 허리케인 시즌 (6-11월) 대비 — 비상 식량·물 준비\n• 차량 내 귀중품 절대 방치 (폭염+절도 이중 위험)\n• 일부 북부 휴스턴 야간 주의\n• 홍수 위험 — 저지대 거주 시 홍수 보험 필수\n• 미드타운 바 주변 야간 주의",
      safetyTipsEn: "• Hurricane season (Jun-Nov) — keep emergency supplies\n• Never leave valuables in car (heat + theft double risk)\n• Some north Houston areas — caution at night\n• Flood risk — flood insurance essential in low-lying areas\n• Watch around Midtown bars late at night",
    },
    boston: {
      erName: ko ? "응급실 — Massachusetts General Hospital" : "ER — Massachusetts General Hospital",
      erPhone: "617-726-2000",
      erAddr: ko ? "📍 55 Fruit St, Boston MA | 24시간 ER" : "📍 55 Fruit St, Boston MA | 24hr ER",
      policeNE: "617-343-4683",
      gasName: ko ? "가스 누출 — National Grid" : "Gas Leak — National Grid",
      gasPhone: "800-233-5325",
      consulatePhone: "617-641-2830",
      safetyTips: "• 겨울 폭설 시 주차 금지 구역 철저 확인 (견인 많음)\n• 올스턴 파티 야간 주의 (취객)\n• 자전거 도난 매우 빈번 — 이중 잠금 필수\n• 지하철(T) 야간 운행 제한 (자정 이후 버스 전환)\n• 블랙아이스 주의 (겨울 보행·운전 위험)",
      safetyTipsEn: "• Check winter parking ban zones strictly (towing is common)\n• Allston party nights — watch for heavy pedestrians\n• Bike theft very common — always use double locks\n• T (subway) has limited late-night service (bus after midnight)\n• Watch for black ice in winter (walking & driving)",
    },
    nashville: {
      erName: ko ? "응급실 — Vanderbilt University Medical Center" : "ER — Vanderbilt University Medical Center",
      erPhone: "615-322-5000",
      erAddr: ko ? "📍 1211 Medical Center Dr, Nashville TN | 24시간 ER" : "📍 1211 Medical Center Dr, Nashville TN | 24hr ER",
      policeNE: "615-862-8600",
      gasName: ko ? "가스 누출 — Piedmont Natural Gas" : "Gas Leak — Piedmont Natural Gas",
      gasPhone: "800-752-7504",
      consulatePhone: "312-822-9485",
      safetyTips: "• 브로드웨이 스트립 야간 주의 (음주 보행자 매우 많음)\n• 차량 내 귀중품 절대 방치 (컨트리 뮤직 관광 지역)\n• 토네이도 시즌 (봄·가을) 기상 경보 앱 필수\n• 일부 노스 내쉬빌 야간 주의\n• I-40·I-65 고속도로 러시아워 극혼잡",
      safetyTipsEn: "• Broadway Strip at night — lots of drunk pedestrians\n• Never leave valuables in car near tourist areas\n• Tornado season (spring & fall) — weather alert app essential\n• Some North Nashville neighborhoods — caution at night\n• I-40/I-65 rush hours are extremely congested",
    },
    toronto: {
      erName: ko ? "응급실 — Toronto General Hospital" : "ER — Toronto General Hospital",
      erPhone: "416-340-3111",
      erAddr: ko ? "📍 200 Elizabeth St, Toronto ON | 24시간 ER" : "📍 200 Elizabeth St, Toronto ON | 24hr ER",
      policeNE: "416-808-2222",
      gasName: ko ? "가스 누출 — Enbridge Gas" : "Gas Leak — Enbridge Gas",
      gasPhone: "877-362-7434",
      consulatePhone: "416-920-3809",
      safetyTips: "• 다운타운 얀스트리트(Yonge) 야간 소매치기 주의\n• TTC 지하철 야간 이용 시 사람 많은 칸 선택\n• 겨울 블랙아이스 운전·보행 주의\n• 제인·핀치(Jane & Finch) 지역 주의\n• 자전거 도난 빈번 — 이중 잠금 필수",
      safetyTipsEn: "• Watch for pickpockets on Yonge St at night\n• Take busy subway cars on TTC late at night\n• Black ice danger in winter (driving & walking)\n• Jane & Finch area — use caution\n• Bike theft very common — double lock always",
    },
    vancouver: {
      erName: ko ? "응급실 — Vancouver General Hospital" : "ER — Vancouver General Hospital",
      erPhone: "604-875-4111",
      erAddr: ko ? "📍 899 W 12th Ave, Vancouver BC | 24시간 ER" : "📍 899 W 12th Ave, Vancouver BC | 24hr ER",
      policeNE: "604-717-3321",
      gasName: ko ? "가스 누출 — FortisBC" : "Gas Leak — FortisBC",
      gasPhone: "888-224-2710",
      consulatePhone: "604-681-9581",
      safetyTips: "• 이스트 헤이스팅스(East Hastings/DTES) 주의 — 마약 밀집\n• 차량 유리 파손 절도 빈번 — 짐 절대 방치 금지\n• 야간 캐스케이드 산악 지역 운전 주의\n• 겨울 체인/스노우 타이어 필수 (산악 통행)\n• 지진 다발 지역 — 비상 키트 72시간분 준비",
      safetyTipsEn: "• East Hastings (DTES) — avoid this area (drug activity)\n• Car break-ins common — never leave bags visible\n• Mountain driving at night requires caution\n• Snow chains/winter tires required for mountain passes\n• Earthquake-prone — keep 72hr emergency kit",
    },
    atlanta: {
      erName: ko ? "응급실 — Emory University Hospital" : "ER — Emory University Hospital",
      erPhone: "404-712-2000",
      erAddr: ko ? "📍 1364 Clifton Rd NE, Atlanta GA | 24시간 ER" : "📍 1364 Clifton Rd NE, Atlanta GA | 24hr ER",
      policeNE: "404-614-6544",
      gasName: ko ? "가스 누출 — Atlanta Gas Light" : "Gas Leak — Atlanta Gas Light",
      gasPhone: "770-907-4231",
      consulatePhone: "404-522-1611",
      safetyTips: "• 다운타운 센테니얼 파크 주변 야간 주의\n• 차량 내 귀중품 절대 방치 (애틀랜타 차량 절도 높음)\n• 일부 남부 애틀랜타 야간 주의\n• 교통 극혼잡 (I-285·I-75·I-85 스파게티 정션)\n• 여름 폭염·겨울 아이스 스톰 시 운전 주의",
      safetyTipsEn: "• Centennial Park area — caution at night\n• NEVER leave valuables in car (Atlanta has high theft rates)\n• Some south Atlanta areas — caution at night\n• Extreme traffic congestion (I-285/I-75/I-85 Spaghetti Junction)\n• Watch for summer heat & winter ice storms",
    },
    philadelphia: {
      erName: ko ? "응급실 — Jefferson University Hospital" : "ER — Jefferson University Hospital",
      erPhone: "215-955-6000",
      erAddr: ko ? "📍 111 S 11th St, Philadelphia PA | 24시간 ER" : "📍 111 S 11th St, Philadelphia PA | 24hr ER",
      policeNE: "215-686-3010",
      gasName: ko ? "가스 누출 — Philadelphia Gas Works" : "Gas Leak — Philadelphia Gas Works (PGW)",
      gasPhone: "215-235-1212",
      consulatePhone: "215-222-8500",
      safetyTips: "• 노스 필라(North Philly) 일부 지역 야간 주의\n• 차량 내 귀중품 절대 방치\n• SEPTA 야간 이용 시 주의\n• 겨울 폭설 후 주차 공간 분쟁 주의 (의자로 자리 표시 관습)\n• 켄싱턴(Kensington) 지역 접근 금지",
      safetyTipsEn: "• Some North Philly neighborhoods — caution at night\n• Never leave valuables in car\n• SEPTA transit — be cautious late at night\n• After winter snowstorm: respect 'saved' parking space customs\n• Kensington area — avoid (high drug activity)",
    },
    kansascity: {
      erName: ko ? "응급실 — KU Medical Center" : "ER — University of Kansas Medical Center",
      erPhone: "913-588-5000",
      erAddr: ko ? "📍 3901 Rainbow Blvd, Kansas City KS | 24시간 ER" : "📍 3901 Rainbow Blvd, Kansas City KS | 24hr ER",
      policeNE: "816-234-5111",
      gasName: ko ? "가스 누출 — Spire Gas" : "Gas Leak — Spire Gas",
      gasPhone: "800-582-1234",
      consulatePhone: "312-822-9485",
      safetyTips: "• 노스이스트 캔자스시티 일부 야간 주의\n• 차량 내 귀중품 방치 금지\n• 겨울 토네이도·아이스 스톰 기상 경보 필수\n• 다운타운 엔터테인먼트 구역 야간 주의 (취객)\n• I-70·I-435 러시아워 혼잡",
      safetyTipsEn: "• Some northeast KC neighborhoods — caution at night\n• Never leave valuables in car\n• Winter tornado & ice storm weather alerts essential\n• Downtown entertainment district — watch for drunk pedestrians at night\n• I-70/I-435 rush hour congestion",
    },
    miami: {
      erName: ko ? "응급실 — Jackson Memorial Hospital" : "ER — Jackson Memorial Hospital",
      erPhone: "305-585-1111",
      erAddr: ko ? "📍 1611 NW 12th Ave, Miami FL | 24시간 ER" : "📍 1611 NW 12th Ave, Miami FL | 24hr ER",
      policeNE: "305-476-5423",
      gasName: ko ? "가스 누출 — TECO Peoples Gas" : "Gas Leak — TECO Peoples Gas",
      gasPhone: "877-832-6747",
      consulatePhone: "305-372-1555",
      safetyTips: "• 차량 내 귀중품 절대 방치 (마이애미 차 절도 매우 높음)\n• 오버타운(Overtown) 지역 야간 주의\n• 허리케인 시즌 (6-11월) — 대피 경보 즉시 대응\n• 바다·운하 수질 오염 주의 (피부 노출 후 샤워 필수)\n• 사기성 관광 서비스 주의",
      safetyTipsEn: "• NEVER leave valuables in car (Miami has very high theft rates)\n• Overtown area — avoid at night\n• Hurricane season (Jun-Nov) — respond immediately to evacuation orders\n• Ocean/canal water quality concerns — shower after water exposure\n• Watch for tourist scams",
    },
    mexicocity: {
      erName: ko ? "응급실 — Hospital Ángeles Pedregal (사립)" : "ER — Hospital Ángeles Pedregal (Private)",
      erPhone: "55-5652-3011",
      erAddr: ko ? "📍 Camino a Santa Teresa 1055, Ciudad de México | 24시간 ER (사립 추천)" : "📍 Camino a Santa Teresa 1055, Mexico City | 24hr ER (private recommended)",
      policeNE: "55-5242-5100",
      gasName: ko ? "가스 누출 — Gas Natural Fenosa" : "Gas Leak — Gas Natural Fenosa",
      gasPhone: "800-622-2400",
      consulatePhone: "55-5202-9866",
      safetyTips: "• 테피토(Tepito)·이스타팔라파 지역 접근 주의\n• 길거리 택시 탑승 금지 → Uber·DiDi만 이용\n• 지진 다발 지역 — 비상 키트 필수, 지진 경보 앱 설치\n• 수돗물 절대 음용 금지 (생수 구매 필수)\n• 소매치기 주의 (지하철·시장)\n• 현지 의료는 사립병원 이용 권장",
      safetyTipsEn: "• Avoid Tepito & Iztapalapa areas\n• NEVER take street taxis — use Uber/DiDi only\n• Earthquake zone — keep emergency kit, install quake alert app\n• Tap water not safe to drink — always buy bottled water\n• Watch for pickpockets (subway & markets)\n• Use private hospitals for medical care",
    },
    guadalajara: {
      erName: ko ? "응급실 — Hospital Country 2000 (사립)" : "ER — Hospital Country 2000 (Private)",
      erPhone: "33-3641-3100",
      erAddr: ko ? "📍 Av. Naciones Unidas 8765, Zapopan | 24시간 ER (사립 추천)" : "📍 Av. Naciones Unidas 8765, Zapopan | 24hr ER (private recommended)",
      policeNE: "33-3668-0800",
      gasName: ko ? "가스 누출 — GDN (Gas de Jalisco)" : "Gas Leak — GDN (Gas de Jalisco)",
      gasPhone: "800-010-0010",
      consulatePhone: "55-5202-9866",
      safetyTips: "• 낯선 외곽 지역 야간 이동 자제\n• Uber·DiDi만 이용 (길거리 택시 탑승 금지)\n• 수돗물 절대 음용 금지 (생수 필수)\n• 소매치기 주의 (버스·시장)\n• 아크론 경기장 주변 경기일 혼잡 주의\n• 현지 의료는 사립병원 이용 권장",
      safetyTipsEn: "• Avoid unfamiliar outskirt areas at night\n• Use only Uber/DiDi — never take street taxis\n• Tap water not safe — always drink bottled water\n• Watch for pickpockets on buses & at markets\n• Heavy crowds near Akron Stadium on match days\n• Use private hospitals for medical care",
    },
    monterrey: {
      erName: ko ? "응급실 — Christus Muguerza Alta Especialidad" : "ER — Christus Muguerza Alta Especialidad",
      erPhone: "81-8399-3400",
      erAddr: ko ? "📍 Av. Hidalgo 2525 Pte., Monterrey NL | 24시간 ER" : "📍 Av. Hidalgo 2525 Pte., Monterrey NL | 24hr ER",
      policeNE: "81-8342-5700",
      gasName: ko ? "가스 누출 — Naturgas" : "Gas Leak — Naturgas Monterrey",
      gasPhone: "81-8333-5000",
      consulatePhone: "55-5202-9866",
      safetyTips: "• 낯선 지역 야간 단독 이동 자제\n• Uber·DiDi만 이용 (길거리 택시 탑승 금지)\n• 수돗물 절대 음용 금지\n• 주재원 거주 단지(콘도·게이트) 외출 시 보안 확인\n• 여름 폭염 (최고 42°C) — 수분 보충 필수\n• 현지 의료는 사립병원 (Christus Muguerza) 이용 권장",
      safetyTipsEn: "• Avoid solo travel in unfamiliar areas at night\n• Use only Uber/DiDi — no street taxis\n• Tap water not safe — always drink bottled\n• Check security at expat compounds/gated communities\n• Extreme summer heat (42°C) — stay hydrated\n• Use private hospitals (Christus Muguerza) for medical care",
    },
  };
  return D[slug] ?? D.seattle;
}

function HelpScreen({ onHome, initialSub = 0 }: { onHome?: () => void; initialSub?: number }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const city = useCityConfig();
  const isSeattle = city.slug === "seattle";
  const consulate = CITY_CONSULATE[city.slug] ?? CITY_CONSULATE.seattle;
  const em = getCityEmergencyData(city.slug, lang);
  const [sub, setSub] = useState(initialSub);
  useEffect(() => { setSub(initialSub); }, [initialSub]);
  const tabs = lang === "ko"
    ? ["긴급연락", "의료·병원", "커뮤니티", "유용한 링크", "📋 무료자원", "⚖️ 법률", "🇺🇸 Korean American"]
    : ["Emergency", "Medical", "Community", "Useful Links", "📋 Free Resources", "⚖️ Legal", "🇺🇸 Korean American"];
  const accent = "#F87171";

  const medicalItems = lang === "ko" ? [
    { emoji: "🏥", name: "닥터 김 클리닉 (한인 가정의학과)", nameEn: "Korean Family Medicine — Lynnwood", desc: "한국어 진료 가능. 📍 Lynnwood | 📞 (425) 744-9200 | 🔗 yelp.com/search?find_desc=Korean+doctor+lynnwood", tags: ["가정의학", "한국어", "린우드"] },
    { emoji: "🏥", name: "스웨디시 메디컬 센터", nameEn: "Swedish Medical Center — Capitol Hill", desc: "📍 747 Broadway, Seattle | 📞 (206) 386-6000 | 한국어 통역 서비스 ✅ | 응급실 포함 전문 진료 | 🔗 swedish.org", tags: ["종합병원", "시애틀", "통역"] },
    { emoji: "🏥", name: "UW 메디컬 센터", nameEn: "UW Medical Center", desc: "📍 1959 NE Pacific St, Seattle | 📞 (206) 598-3300 | 한국어 통역 ✅ | 워싱턴주 최대 학술병원 | 🔗 uwmedicine.org", tags: ["대학병원", "시애틀", "통역"] },
    { emoji: "🦷", name: "켄트 임플란트 치과", nameEn: "Kent Implant Dental", desc: "한인 치과. 📍 306 Washington Ave S, Kent | 📞 (253) 981-3816 ✅ | 임플란트 전문", tags: ["치과", "켄트", "임플란트"] },
    { emoji: "🦷", name: "린우드 한인 치과 (다수)", nameEn: "Lynnwood Korean Dentists", desc: "린우드 지역 한인 치과 다수 운영. kSeattle·WowSeattle 업소록 참조 | 🔗 kseattle.com", tags: ["치과", "린우드", "한국어"] },
    { emoji: "🧠", name: "ACRS 정신건강 (한국어 상담사)", nameEn: "Asian Counseling & Referral Service", desc: "📍 3639 MLK Jr Way S, Seattle | 📞 (206) 695-7600 | 한국어 상담사 상주 ✅ | 슬라이딩 스케일 요금 | 🔗 acrs.org", tags: ["정신건강", "한국어", "상담"] },
    { emoji: "🆘", name: "위기 상담 핫라인 (24시간)", nameEn: "Crisis Line 24/7", desc: "📞 866-427-4747 (24시간) | 한국어 통역 가능 | 정신건강·자살 예방 전문", tags: ["위기상담", "24시간", "무료"] },
    { emoji: "🚨", name: "응급실 — Swedish First Hill", nameEn: "Emergency Room — Swedish First Hill", desc: "📍 747 Broadway, Seattle | 📞 (206) 386-6000 | 시애틀 중심부 응급실. 한국어 통역 요청 가능", tags: ["응급실", "응급", "시애틀"] },
    { emoji: "📞", name: "한국어 통역 서비스 (의료)", nameEn: "Korean Medical Interpreter", desc: "언어 라인 (Language Line): 📞 1-800-752-6096 | 병원·클리닉 방문 전 통역 예약 가능 | 🔗 languageline.com", tags: ["통역", "의료", "무료"] },
    { emoji: "🏛️", name: "킹카운티 공중보건소 ✅ 검증됨", nameEn: "King County Public Health", desc: "무료·저비용 의료, WIC 영양 프로그램, 예방접종. 📞 206-296-4600 | 🔗 kingcounty.gov/health", tags: ["공공의료", "무료", "WIC"] },
    { emoji: "🏥", name: "시애틀 무료 클리닉 ✅ 검증됨", nameEn: "Free Clinic of Greater Seattle", desc: "의료보험 없는 분을 위한 무료 의료 서비스. 📞 206-520-5000 | 🔗 freeclinic.net", tags: ["무료", "무보험", "의료"] },
    { emoji: "🏥", name: "헬스포인트 (슬라이딩 스케일) ✅ 검증됨", nameEn: "HealthPoint Community Health Center", desc: "소득 기반 할인 진료. 한국어 통역 가능. 📞 1-800-440-1561 | 🔗 healthpointchc.org", tags: ["슬라이딩스케일", "한국어", "저비용"] },
    { emoji: "🧠", name: "크라이시스 커넥션 (정신건강 24시간) ✅ 검증됨", nameEn: "Crisis Connections 24/7", desc: "정신건강 위기 24시간 무료. 한국어 통역 가능. 📞 866-427-4747 | 🔗 crisisconnections.org", tags: ["정신건강", "24시간", "무료"] },
    { emoji: "🧠", name: "NAMI 워싱턴 (정신건강 지원) ✅ 검증됨", nameEn: "NAMI Washington", desc: "정신건강 정보·지원·교육. 📞 800-782-9264 | 🔗 namiwa.org", tags: ["정신건강", "지원", "무료"] },
  ] : [
    { emoji: "🏥", name: "Korean Family Medicine Clinic", nameEn: "닥터 김 클리닉 — Lynnwood", desc: "Korean-speaking physician. 📍 Lynnwood | 📞 (425) 744-9200 | 🔗 yelp.com/search?find_desc=Korean+doctor+lynnwood", tags: ["Family Med", "Korean", "Lynnwood"] },
    { emoji: "🏥", name: "Swedish Medical Center", nameEn: "스웨디시 메디컬 센터", desc: "📍 747 Broadway, Seattle | 📞 (206) 386-6000 | Korean interpreter ✅ | Full service incl. ER | 🔗 swedish.org", tags: ["Hospital", "Seattle", "Interpreter"] },
    { emoji: "🏥", name: "UW Medical Center", nameEn: "UW 메디컬 센터", desc: "📍 1959 NE Pacific St, Seattle | 📞 (206) 598-3300 | Korean interpreter ✅ | WA's largest academic medical center | 🔗 uwmedicine.org", tags: ["Hospital", "Seattle", "Interpreter"] },
    { emoji: "🦷", name: "Kent Implant Dental", nameEn: "켄트 임플란트 치과", desc: "Korean dental clinic. 📍 306 Washington Ave S, Kent | 📞 (253) 981-3816 ✅ | Implant specialist", tags: ["Dental", "Kent", "Implant"] },
    { emoji: "🦷", name: "Lynnwood Korean Dentists", nameEn: "린우드 한인 치과", desc: "Multiple Korean dental clinics in Lynnwood. See kSeattle & WowSeattle directory | 🔗 kseattle.com", tags: ["Dental", "Lynnwood", "Korean"] },
    { emoji: "🧠", name: "ACRS Mental Health (Korean counselors)", nameEn: "Asian Counseling & Referral Service", desc: "📍 3639 MLK Jr Way S, Seattle | 📞 (206) 695-7600 | Korean-speaking counselors ✅ | Sliding scale fees | 🔗 acrs.org", tags: ["Mental Health", "Korean", "Counseling"] },
    { emoji: "🆘", name: "Crisis Line 24/7", nameEn: "위기 상담 핫라인", desc: "📞 866-427-4747 (24/7) | Korean interpreter available | Mental health & suicide prevention", tags: ["Crisis", "24/7", "Free"] },
    { emoji: "🚨", name: "Emergency Room — Swedish First Hill", nameEn: "응급실 — Swedish First Hill", desc: "📍 747 Broadway, Seattle | 📞 (206) 386-6000 | Central Seattle ER. Korean interpreter on request", tags: ["ER", "Emergency", "Seattle"] },
    { emoji: "📞", name: "Korean Medical Interpreter Line", nameEn: "한국어 의료 통역", desc: "Language Line: 📞 1-800-752-6096 | Pre-book interpreter for clinic & hospital visits | 🔗 languageline.com", tags: ["Interpreter", "Medical", "Free"] },
    { emoji: "🏛️", name: "King County Public Health ✅ Verified", nameEn: "킹카운티 공중보건소", desc: "Free/low-cost healthcare, WIC nutrition, immunizations. 📞 206-296-4600 | 🔗 kingcounty.gov/health", tags: ["Public Health", "Free", "WIC"] },
    { emoji: "🏥", name: "Free Clinic of Greater Seattle ✅ Verified", nameEn: "시애틀 무료 클리닉", desc: "Free medical care for uninsured residents. 📞 206-520-5000 | 🔗 freeclinic.net", tags: ["Free", "Uninsured", "Medical"] },
    { emoji: "🏥", name: "HealthPoint Community Health Center ✅ Verified", nameEn: "헬스포인트", desc: "Sliding scale fees based on income. Korean interpreter available. 📞 1-800-440-1561 | 🔗 healthpointchc.org", tags: ["Sliding Scale", "Korean", "Low-cost"] },
    { emoji: "🧠", name: "Crisis Connections 24/7 ✅ Verified", nameEn: "크라이시스 커넥션", desc: "Mental health crisis line 24/7. Korean interpreter available. 📞 866-427-4747 | 🔗 crisisconnections.org", tags: ["Mental Health", "24/7", "Free"] },
    { emoji: "🧠", name: "NAMI Washington ✅ Verified", nameEn: "NAMI 워싱턴", desc: "Mental health information, support & education. 📞 800-782-9264 | 🔗 namiwa.org", tags: ["Mental Health", "Support", "Free"] },
  ];

  const defaultCommunityLinks = [
    // 영사관: 전 도시 공통 (도시별 주소·전화 자동 적용)
    { emoji: "🏴", name: lang === "ko" ? consulate.ko : consulate.en, nameEn: consulate.en,
      desc: lang === "ko"
        ? `여권·공증·사증·재외국민등록. 📞 ${consulate.phone} | 🔗 ${consulate.url}`
        : `Passport, notary, visa & overseas registration. 📞 ${consulate.phone} | 🔗 ${consulate.url}`,
      tags: ["영사관", "여권", "공증"] },
    // 211 전화: 미국·캐나다 공통 서비스
    { emoji: "📞", name: lang === "ko" ? "2-1-1 무료 서비스 연결" : "2-1-1 Free Services Hotline", nameEn: "2-1-1 Hotline",
      desc: lang === "ko"
        ? `전화 211 — 식품·주거·법률·의료 무료 서비스 연결. 한국어 통역 가능. ${city.nameKo} 지역 서비스 안내.`
        : `Dial 211 — connects to free services (food, housing, legal, medical). Korean interpreter available. ${city.nameEn} area.`,
      tags: ["211", "무료", "한국어"] },
    // 도시별 커뮤니티 링크
    ...(() => {
      const slug = city.slug;
      const ko = lang === "ko";
      // 공통: 미주중앙일보·한국일보 전국판
      const national = [
        { emoji: "📰", name: ko ? "미주중앙일보" : "Korea Daily", nameEn: "Korea Daily",
          desc: ko ? "전국 한인 신문. 구인광고·부동산·커뮤니티. 🔗 koreadaily.com" : "National Korean newspaper. Jobs, real estate, community. 🔗 koreadaily.com",
          tags: ["중앙일보", "전국", "정보"] },
        { emoji: "📻", name: ko ? "라디오코리아" : "Radio Korea", nameEn: "Radio Korea",
          desc: ko ? "전국 한인 라디오. 생활정보·뉴스. 🔗 radiokorea.com" : "National Korean radio. Life info & news. 🔗 radiokorea.com",
          tags: ["라디오코리아", "뉴스", "생활"] },
      ];
      if (slug === "seattle") return [
        { emoji: "💬", name: ko ? "카카오오픈채팅 — 시애틀한인" : "KakaoTalk — Seattle Korean", nameEn: "Kakao Open Chat",
          desc: ko ? "시애틀 한인 최대 커뮤니티 채팅방. 정착 질문, 중고거래, 모임 공지" : "Largest Korean Seattle community chat. Settlement Q&A, used goods, events",
          tags: ["카카오", "실시간", "커뮤니티"] },
        { emoji: "🏛️", name: ko ? "시애틀 한인회" : "Korean Association of Seattle",
          desc: ko ? "공식 한인 단체. 📞 (206) 323-5050" : "Official Korean community org. 📞 (206) 323-5050",
          tags: ["공식", "한인회", "이벤트"] },
        { emoji: "📰", name: ko ? "시애틀 한국일보" : "Korea Times Seattle",
          desc: ko ? "지역 소식·구인·부동산. 🔗 seattlekdaily.com" : "Local news, jobs, real estate. 🔗 seattlekdaily.com",
          tags: ["신문", "뉴스", "정보"] },
        { emoji: "🏛️", name: ko ? "킹카운티 주거청" : "King County Housing Authority",
          desc: ko ? "저렴한 주거 대기자 명단. 📞 206-574-1100 | 🔗 kcha.org" : "Affordable housing waitlist. 📞 206-574-1100 | 🔗 kcha.org",
          tags: ["주거", "저렴", "공공"] },
      ];
      if (slug === "dallas") return [
        { emoji: "📰", name: ko ? "코리아타임스 텍사스" : "Korea Times Texas",
          desc: ko ? "달라스·텍사스 한인 소식·구인. 🔗 koreatimestx.com" : "Dallas/Texas Korean news & jobs. 🔗 koreatimestx.com", tags: ["달라스","신문","텍사스"] },
        { emoji: "📻", name: ko ? "DK NET 라디오 AM 730" : "DK NET Radio AM 730",
          desc: ko ? "달라스 한인 라디오. 생활정보·뉴스. 🔗 dalkora.com" : "Dallas Korean radio. Life info & news. 🔗 dalkora.com", tags: ["라디오","달라스","AM730"] },
        { emoji: "🏛️", name: ko ? "달라스 한인회" : "Korean Association of Dallas",
          desc: ko ? "달라스·포트워스 공식 한인 단체. 행사·지원 사업" : "Official Korean organization Dallas-Fort Worth. Events & support", tags: ["한인회","달라스","공식"] },
        { emoji: "🏪", name: ko ? "캐롤튼 한인타운" : "Carrollton Koreatown",
          desc: ko ? "H-Mart 캐롤튼 인근. 한인 식당·마트·업소 밀집. 정착 1순위 지역" : "Near H-Mart Carrollton. Dense Korean restaurants, markets & businesses", tags: ["캐롤튼","H-Mart","한인타운"] },
      ];
      if (slug === "la") return [
        { emoji: "📰", name: ko ? "미주중앙일보 LA" : "Korea Daily LA",
          desc: ko ? "LA 한인 최대 일간지. 구인·부동산·지역뉴스. 🔗 koreadaily.com" : "LA's largest Korean daily. Jobs, real estate, local news. 🔗 koreadaily.com", tags: ["중앙일보","LA","일간지"] },
        { emoji: "📻", name: ko ? "라디오코리아 LA" : "Radio Korea LA",
          desc: ko ? "LA 한인 라디오. 생활정보·한인뉴스. 🔗 radiokorea.com" : "LA Korean radio. Life info & Korean news. 🔗 radiokorea.com", tags: ["라디오","LA","생활"] },
        { emoji: "🏛️", name: ko ? "LA 한인회 (KAC)" : "Korean American Coalition LA",
          desc: ko ? "LA 한인 권익 단체. 시민 교육·권익 옹호. 🔗 kacla.org" : "Korean American advocacy in LA. Civic education & rights. 🔗 kacla.org", tags: ["KAC","한인권익","LA"] },
        { emoji: "🏪", name: ko ? "코리아타운 (Wilshire/Olympic)" : "LA Koreatown",
          desc: ko ? "미국 최대 한인타운. 한식당·H-Mart·한인 업소 밀집. 32번 Metro 버스" : "Largest US Koreatown. Korean restaurants, H-Mart, businesses. Metro Bus 32", tags: ["코리아타운","H-Mart","Wilshire"] },
      ];
      if (slug === "newyork") return [
        { emoji: "📰", name: ko ? "뉴욕중앙일보" : "Korea Daily New York",
          desc: ko ? "뉴욕·NJ 한인 일간지. 구인·부동산·지역소식. 🔗 ny.koreadaily.com" : "NY/NJ Korean daily. Jobs, real estate, local news. 🔗 ny.koreadaily.com", tags: ["뉴욕중앙","NY","일간지"] },
        { emoji: "📻", name: ko ? "라디오코리아 NY" : "Radio Korea NY",
          desc: ko ? "뉴욕 한인 라디오. 🔗 nyradiokorea.com" : "NY Korean radio. 🔗 nyradiokorea.com", tags: ["라디오","NY","뉴욕"] },
        { emoji: "🏛️", name: ko ? "플러싱 한인회 (퀸스)" : "Korean Association Queens",
          desc: ko ? "플러싱 공식 한인 단체. 뉴이민자 정착 지원. #7 지하철 플러싱역" : "Official Korean org in Flushing. New immigrant support. #7 Train Flushing station", tags: ["플러싱","퀸스","한인회"] },
        { emoji: "🏛️", name: ko ? "팰리세이즈파크 한인회 (NJ)" : "Korean Association Palisades Park",
          desc: ko ? "NJ 한인 밀집 지역 한인회. 팰리세이즈파크·포트리 커뮤니티" : "Korean community org in NJ. Palisades Park & Fort Lee community", tags: ["팰리세이즈파크","NJ","한인회"] },
      ];
      if (slug === "sf") return [
        { emoji: "📻", name: ko ? "한미 라디오 AM 1120" : "Hanmi Radio AM 1120",
          desc: ko ? "SF 베이 한인 라디오. 생활정보·지역뉴스. 🔗 hanmiradio.com" : "SF Bay Korean radio. Life info & local news. 🔗 hanmiradio.com", tags: ["한미라디오","SF","AM1120"] },
        { emoji: "📰", name: ko ? "SF 한국일보" : "SF Korea Daily",
          desc: ko ? "SF 베이 한인 소식·구인·부동산. 🔗 sfkoreadaily.com" : "SF Bay Korean news, jobs & real estate. 🔗 sfkoreadaily.com", tags: ["SF한국일보","베이","뉴스"] },
        { emoji: "🏛️", name: ko ? "프리몬트 한인회" : "Korean Association Fremont",
          desc: ko ? "프리몬트 공식 한인 단체. 베이 한인 커뮤니티 정착 지원" : "Official Korean org in Fremont. Bay Area Korean community support", tags: ["프리몬트","한인회","SF베이"] },
        { emoji: "🏪", name: ko ? "프리몬트 한인타운" : "Fremont Koreatown",
          desc: ko ? "H-Mart 프리몬트. 한인 식당·마트·업소 밀집. BART 연결" : "H-Mart Fremont. Korean restaurants, markets & businesses. BART connected", tags: ["프리몬트","H-Mart","BART"] },
      ];
      if (slug === "boston") return [
        { emoji: "📰", name: ko ? "보스톤코리아" : "Boston Korea",
          desc: ko ? "보스턴 한인 신문·온라인. 구인·커뮤니티·생활정보. 🔗 bostonkorea.com" : "Boston Korean newspaper/online. Jobs, community & life info. 🔗 bostonkorea.com", tags: ["보스톤코리아","Boston","신문"] },
        { emoji: "🏛️", name: ko ? "보스턴 한인회" : "Korean Association of Boston",
          desc: ko ? "보스턴 공식 한인 단체. 이민자·유학생 지원" : "Official Korean org in Boston. Immigrant & student support", tags: ["한인회","보스턴","공식"] },
        { emoji: "🎓", name: ko ? "MIT·하버드 한인 학생회" : "MIT/Harvard Korean Student Assoc.",
          desc: ko ? "MIT KSAA·하버드 KSA. 알럼나이 네트워크 매우 강함. 취업·멘토링 연결" : "MIT KSAA, Harvard KSA. Very strong alumni network. Jobs & mentoring connections", tags: ["MIT","하버드","학생회"] },
        { emoji: "🏪", name: ko ? "올스턴 한인타운" : "Allston Koreatown",
          desc: ko ? "BU·하버드 인근 한인 식당·카페 밀집. 유학생 커뮤니티 허브. Green Line 접근" : "Korean restaurants/cafes near BU/Harvard. Student community hub. Green Line access", tags: ["올스턴","유학생","Green Line"] },
      ];
      if (slug === "nashville") return [
        { emoji: "🏛️", name: ko ? "내쉬빌 한인회" : "Korean Association of Nashville",
          desc: ko ? "내쉬빌 공식 한인 단체. 이민자 정착 지원·커뮤니티 행사" : "Official Korean org in Nashville. Immigrant support & community events", tags: ["한인회","내쉬빌","공식"] },
        { emoji: "📰", name: ko ? "미주중앙일보 테네시" : "Korea Daily Tennessee",
          desc: ko ? "테네시 한인 소식. 🔗 koreadaily.com 내쉬빌 지역" : "Tennessee Korean news. 🔗 koreadaily.com Nashville section", tags: ["중앙일보","테네시","뉴스"] },
        { emoji: "🏪", name: ko ? "쿨스프링스·안티오크 한인타운" : "Cool Springs/Antioch Koreatown",
          desc: ko ? "내쉬빌 한인 밀집 지역. H-Mart 진출. 한식당·마트·교회 성장 중" : "Nashville Korean hub. H-Mart now open. Korean restaurants, markets & churches growing", tags: ["쿨스프링스","안티오크","H-Mart"] },
        ...national.slice(0,1),
      ];
      if (slug === "toronto") return [
        { emoji: "📰", name: ko ? "캐나다 한국일보" : "Korea Times Canada",
          desc: ko ? "캐나다 최대 한인 일간지. 구인·부동산·커뮤니티. 🔗 koreatimes.net" : "Canada's largest Korean daily. Jobs, real estate, community. 🔗 koreatimes.net", tags: ["캐나다한국일보","Toronto","일간지"] },
        { emoji: "📰", name: ko ? "토론토 중앙일보" : "Korea Times Toronto",
          desc: ko ? "토론토 한인 주요 신문. 🔗 cktimes.net" : "Major Korean newspaper in Toronto. 🔗 cktimes.net", tags: ["토론토중앙","Toronto","신문"] },
        { emoji: "🏛️", name: ko ? "토론토 한인회" : "Korean Canadian Cultural Association",
          desc: ko ? "토론토 공식 한인 단체. 이민자 정착 지원·문화 행사" : "Official Korean org in Toronto. Immigrant support & cultural events", tags: ["한인회","토론토","공식"] },
        { emoji: "🏪", name: ko ? "노스요크 한인타운 (욘지·핀치)" : "North York Koreatown",
          desc: ko ? "욘지-핀치 TTC 지하철 연결. H-Mart·한식당·한인 업소 밀집. 한인 정착 1순위" : "Yonge-Finch TTC subway connected. H-Mart, Korean restaurants & businesses. Top Korean settlement area", tags: ["노스요크","욘지핀치","H-Mart"] },
      ];
      if (slug === "vancouver") return [
        { emoji: "📰", name: ko ? "밴쿠버 조선일보" : "Vancouver Chosun",
          desc: ko ? "밴쿠버 한인 신문. 구인·부동산·커뮤니티. 🔗 vanchosun.com" : "Vancouver Korean newspaper. Jobs, real estate, community. 🔗 vanchosun.com", tags: ["밴조선","Vancouver","신문"] },
        { emoji: "📰", name: ko ? "밴쿠버 중앙일보" : "Vancouver Korea Daily",
          desc: ko ? "밴쿠버 한인 신문. 🔗 joinsmediacanada.com" : "Vancouver Korean newspaper. 🔗 joinsmediacanada.com", tags: ["밴쿠버중앙","Vancouver","신문"] },
        { emoji: "🏛️", name: ko ? "BC 한인회" : "Korean Community Services of BC",
          desc: ko ? "BC주 공식 한인 단체. 이민·정착·복지 서비스" : "Official Korean org in BC. Immigration, settlement & welfare services", tags: ["BC한인회","밴쿠버","공식"] },
        { emoji: "🏪", name: ko ? "버나비 한인타운" : "Burnaby Koreatown",
          desc: ko ? "H-Mart 버나비. SkyTrain 연결. 한인 식당·마트·업소 밀집. BC 한인 정착 1순위" : "H-Mart Burnaby. SkyTrain connected. Korean restaurants, markets & businesses. BC Korean #1 settlement", tags: ["버나비","SkyTrain","H-Mart"] },
      ];
      if (slug === "houston") return [
        { emoji: "📰", name: ko ? "한인 저널 휴스턴" : "Korean Journal Houston",
          desc: ko ? "휴스턴 한인 지역 신문. 구인·부동산·커뮤니티. 🔗 kjhou.com" : "Houston Korean community newspaper. Jobs, real estate, community. 🔗 kjhou.com", tags: ["한인저널","휴스턴","신문"] },
        { emoji: "🏛️", name: ko ? "휴스턴 한인회 (GKHCA)" : "Greater Korean Houston Community Assoc.",
          desc: ko ? "휴스턴 광역 공식 한인 단체. 이민자 지원·커뮤니티 행사" : "Official Korean org Greater Houston. Immigrant support & community events", tags: ["GKHCA","휴스턴","한인회"] },
        { emoji: "🏪", name: ko ? "벨에어 한인타운 (Bellaire Blvd)" : "Bellaire Blvd Koreatown",
          desc: ko ? "비공식 휴스턴 한인타운. H-Mart 인근. 한식당·마트·교회 밀집" : "Unofficial Houston Koreatown. Near H-Mart. Korean restaurants, markets & churches", tags: ["벨에어","Bellaire","H-Mart"] },
        ...national.slice(0,1),
      ];
      if (slug === "atlanta") return [
        { emoji: "📰", name: ko ? "미주중앙일보 애틀랜타" : "Korea Daily Atlanta",
          desc: ko ? "애틀랜타 한인 소식. 🔗 atlanta.koreadaily.com" : "Atlanta Korean news. 🔗 atlanta.koreadaily.com", tags: ["중앙일보","애틀랜타","신문"] },
        { emoji: "📰", name: ko ? "애틀랜타 중앙일보" : "Atlanta Joongang",
          desc: ko ? "애틀랜타 한인 신문. 구인·부동산·커뮤니티. 🔗 atlantajoongang.com" : "Atlanta Korean newspaper. Jobs, real estate, community. 🔗 atlantajoongang.com", tags: ["애틀랜타중앙","신문","구인"] },
        { emoji: "🏛️", name: ko ? "애틀랜타 한인회" : "Korean Association of Atlanta",
          desc: ko ? "조지아 공식 한인 단체. 이민자 정착 지원. 귀넷카운티 중심" : "Official Korean org in Georgia. Immigrant settlement support. Gwinnett County focus", tags: ["한인회","애틀랜타","귀넷"] },
        { emoji: "🏪", name: ko ? "둘루스·스와니 한인타운" : "Duluth/Suwanee Koreatown",
          desc: ko ? "귀넷카운티 한인 밀집. H-Mart·한식당·교회 밀집. 남부 최대 한인타운" : "Gwinnett County Korean hub. H-Mart, Korean restaurants & churches. South's largest Koreatown", tags: ["둘루스","스와니","귀넷"] },
      ];
      if (slug === "kansascity") return [
        { emoji: "📰", name: ko ? "KC 한인 저널" : "KC Korean Journal",
          desc: ko ? "캔자스시티 한인 소식. 🔗 kckoreanjournal.com" : "Kansas City Korean news. 🔗 kckoreanjournal.com", tags: ["KC저널","캔자스시티","신문"] },
        { emoji: "🏛️", name: ko ? "캔자스시티 한인회" : "Korean Association of Kansas City",
          desc: ko ? "KC 공식 한인 단체. 이민자 지원·커뮤니티 행사" : "Official Korean org in KC. Immigrant support & community events", tags: ["한인회","KC","공식"] },
        { emoji: "🏪", name: ko ? "오버랜드파크 H-Mart" : "H-Mart Overland Park",
          desc: ko ? "KC 한인 거점. H-Mart 오버랜드파크. 한식당·마트 주변 한인 상권" : "KC Korean hub. H-Mart Overland Park. Korean restaurants & businesses nearby", tags: ["오버랜드파크","H-Mart","KS"] },
        ...national.slice(0,1),
      ];
      if (slug === "philadelphia") return [
        { emoji: "📰", name: ko ? "주간필라" : "Jugan Phila",
          desc: ko ? "필라델피아 한인 주간지. 구인·부동산·커뮤니티. 🔗 koreanphila.com" : "Philadelphia Korean weekly. Jobs, real estate, community. 🔗 koreanphila.com", tags: ["주간필라","필라","신문"] },
        { emoji: "🏛️", name: ko ? "필라델피아 한인회" : "Korean American Association of Philadelphia",
          desc: ko ? "필라 공식 한인 단체. 이민자 정착 지원" : "Official Korean org in Philadelphia. Immigrant settlement support", tags: ["한인회","필라","공식"] },
        { emoji: "🏪", name: ko ? "어퍼다비·체리힐 한인타운" : "Upper Darby/Cherry Hill Koreatown",
          desc: ko ? "H-Mart 에지스턴 인근. 한인 식당·마트·교회. NJ 체리힐도 한인 밀집" : "Near H-Mart Edgemont. Korean restaurants, markets & churches. NJ Cherry Hill also Korean hub", tags: ["어퍼다비","체리힐","H-Mart"] },
        ...national.slice(0,1),
      ];
      if (slug === "miami") return [
        { emoji: "🏛️", name: ko ? "마이애미 한인회" : "Korean Association of Miami",
          desc: ko ? "마이애미 공식 한인 단체. 이민자 지원·커뮤니티 행사" : "Official Korean org in Miami. Immigrant support & community events", tags: ["한인회","마이애미","공식"] },
        { emoji: "🏪", name: ko ? "도랄 한인 커뮤니티" : "Doral Korean Community",
          desc: ko ? "마이애미 한인 밀집 지역. 한식당·마트. 히스패닉-한인 혼합 커뮤니티" : "Miami Korean community hub. Korean restaurants, markets. Korean-Hispanic mixed community", tags: ["도랄","마이애미","한인"] },
        ...national,
      ];
      if (slug === "mexicocity" || slug === "guadalajara" || slug === "monterrey") return [
        { emoji: "🏛️", name: ko ? `${city.nameKo} 한인회` : `Korean Association ${city.nameEn}`,
          desc: ko ? `${city.nameKo} 한인 단체. 주한국 대사관·KOTRA 연결. 한인 네트워크 참여` : `Korean community in ${city.nameEn}. Connected to Korean Embassy & KOTRA`, tags: ["한인회","멕시코","공식"] },
        { emoji: "🏛️", name: ko ? "KOTRA 멕시코시티" : "KOTRA Mexico City",
          desc: ko ? "대한무역투자진흥공사 멕시코 사무소. 한인 창업·투자·무역 지원. 🔗 kotra.or.kr" : "Korea Trade-Investment Promotion Agency Mexico. Korean startup, investment & trade support. 🔗 kotra.or.kr", tags: ["KOTRA","멕시코","무역"] },
        { emoji: "📻", name: ko ? "KBS 월드 라디오 (한국어)" : "KBS World Radio Korean",
          desc: ko ? "해외 한인 대상 한국어 방송. 뉴스·문화·정보. 🔗 world.kbs.co.kr" : "Korean broadcasting for overseas Koreans. News, culture & info. 🔗 world.kbs.co.kr", tags: ["KBS","라디오","한국어"] },
        ...national.slice(0,1),
      ];
      // 기타 도시 기본값
      return national;
    })(),
  ];

  // 미국·캐나다 공통 무료 법률 클리닉
  const freeLegalLink = { emoji: "🔒",
    name: lang === "ko" ? "무료 법률 클리닉 (이민·고용)" : "Free Legal Clinic (Immigration & Employment)", nameEn: "Free Legal Help",
    desc: lang === "ko"
      ? `이민·고용·집주인 분쟁. 한국어 지원 변호사 연결 가능. 311 또는 Legal Aid 검색: ${city.nameKo}`
      : `Immigration, employment & landlord disputes. Korean-speaking attorney referrals. Search Legal Aid: ${city.nameEn}`,
    tags: ["법률", "무료", "이민"] };

  const defaultUsefulLinks = [
    // WA 전용: Apple Health, ORCA, WorkSource, SPS
    ...(isSeattle ? [
      { emoji: "🏥", name: lang === "ko" ? "WA Apple Health (무료 의료보험)" : "WA Apple Health (Free Health Insurance)", nameEn: "Washington Medicaid",
        desc: lang === "ko" ? "저소득층 무료 건강보험. 신청: wahealthplanfinder.org | 📞 1-855-923-4633" : "Free health insurance for low-income. Apply: wahealthplanfinder.org | 📞 1-855-923-4633",
        tags: ["보험", "무료", "의료"] },
      { emoji: "🚌", name: lang === "ko" ? "ORCA 카드 + 킹카운티 메트로" : "ORCA Card + King County Metro", nameEn: "Seattle Transit",
        desc: lang === "ko" ? "버스·Link·페리 통합 카드. orca.com | 📞 206-553-3000 | H-Mart에서 구매 가능" : "Bus, Link & ferry pass. orca.com | 📞 206-553-3000 | Available at H-Mart",
        tags: ["ORCA", "대중교통", "링크"] },
      { emoji: "💼", name: lang === "ko" ? "WorkSource WA (무료 취업 지원)" : "WorkSource WA (Free Job Center)", nameEn: "Free Job Assistance",
        desc: lang === "ko" ? "이력서·면접 코칭·취업 연결. 무료. 시애틀·린우드·에베레트" : "Free resume coaching & job placement. Seattle, Lynnwood & Everett centers",
        tags: ["취업", "무료", "이력서"] },
      { emoji: "🏫", name: lang === "ko" ? "시애틀 공립학교 등록 (SPS)" : "Seattle Public Schools Enrollment", nameEn: "SPS Enrollment",
        desc: lang === "ko" ? "공립학교 등록: seattleschools.org | 한국어 통역 서비스 있음" : "School enrollment: seattleschools.org | Korean interpreter available",
        tags: ["학교", "공립", "한국어"] },
    ] : [
      // 비시애틀: 도시별 건강보험 안내 (주별로 다름)
      { emoji: "🏥",
        name: lang === "ko" ? `${city.nameKo} 건강보험 안내` : `${city.nameEn} Health Insurance Guide`, nameEn: "Health Insurance",
        desc: lang === "ko"
          ? `healthcare.gov 에서 소득 기준 보험 확인. 또는 211 전화 → 건강보험 연결. ${["sf","la","boston","newyork","philadelphia"].includes(city.slug) ? "주(州) Medicaid 적극 활용 가능." : ["toronto","vancouver"].includes(city.slug) ? "공적 의료보험 (OHIP/MSP): 3개월 후 무료 적용." : "Medicaid 소득 기준 확인 필수."}`
          : `Check eligibility at healthcare.gov or dial 211 for insurance help. ${["sf","la","boston","newyork","philadelphia"].includes(city.slug) ? "State Medicaid strongly recommended." : ["toronto","vancouver"].includes(city.slug) ? "Public health insurance (OHIP/MSP): free after 3 months." : "Check Medicaid income requirements."}`,
        tags: ["보험", "의료", "Medicaid"] },
      // 무료 취업 지원 (도시별)
      { emoji: "💼",
        name: lang === "ko" ? "무료 취업 지원 서비스" : "Free Employment Services", nameEn: "Job Assistance",
        desc: lang === "ko"
          ? `${city.nameKo} 지역 무료 취업 코칭. 이력서·면접 준비. 211 전화 또는 한인 교회 취업 사역 연결`
          : `Free job coaching in ${city.nameEn}. Resume & interview prep. Dial 211 or contact Korean church employment ministry`,
        tags: ["취업", "무료", "이력서"] },
    ]),
    // 전 도시 공통: 무료 법률
    freeLegalLink,
  ];

  const communityLinks = serverContent["community"] ? resolvePlaceItems(serverContent["community"], lang) : defaultCommunityLinks;
  const usefulLinks = serverContent["links"] ? resolvePlaceItems(serverContent["links"], lang) : defaultUsefulLinks;

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🆘" titleKo="도움말" titleEn="Help & Emergency"
        descKo={`${city.nameKo} — 긴급연락 · 커뮤니티 · 무료 자원`}
        descEn={`${city.nameEn} — Emergency contacts · Community · Free resources`}
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />

      {sub === 0 && (
        <div style={{ paddingBottom: 0 }}>
          {/* 긴급 SOS 배너 */}
          <div style={{ margin: "16px 16px 0", background: "linear-gradient(135deg, #3b0000, #1f0000)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", background: "rgba(239,68,68,0.12)", borderBottom: "1px solid rgba(248,113,113,0.15)" }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#F87171" }}>
                🚨 {lang === "ko" ? "생명이 위험한 긴급 상황 → 즉시 911 전화" : "Life-threatening emergency → Call 911 immediately"}
              </div>
            </div>
            {/* 생명 긴급 */}
            <EmergencyRow emoji="🚨" title={lang === "ko" ? "경찰·소방·구급 (생명 긴급)" : "Police · Fire · Ambulance"} number="911" desc={lang === "ko" ? "생명·화재·범죄 — 즉시 전화. 한국어 통역 요청 가능" : "Life-threatening, fire, crime. Korean interpreter available"} />
            <EmergencyRow emoji="🏥" title={em.erName} number={em.erPhone} desc={em.erAddr} />
            <EmergencyRow emoji="☁️" title={lang === "ko" ? "독·약물 중독" : "Poison Control"} number="800-222-1222" desc={lang === "ko" ? "약물·화학물질 중독 24시간 — 즉시 전화" : "Drug & chemical poisoning — call immediately"} />
            <EmergencyRow emoji="☎️" title={lang === "ko" ? "정신건강 위기 (988)" : "Mental Health Crisis (988)"} number="988" desc={lang === "ko" ? "자살 예방·정신건강 위기 24시간. 한국어 통역 가능" : "Suicide prevention & mental health crisis 24/7. Korean interpreter"} />
            {/* 한인 긴급 */}
            <EmergencyRow emoji="🇰🇷" title={lang === "ko" ? "한국 영사관 긴급" : "Korean Consulate Emergency"} number={em.consulatePhone} desc={lang === "ko" ? "여권 분실·억류·사고·사망 — 24시간 긴급 직통" : "Lost passport, detention, accident, death — 24hr direct line"} />
            <EmergencyRow emoji="🗣️" title={lang === "ko" ? "한국어 통역 (Language Line)" : "Korean Interpreter (Language Line)"} number="800-752-6096" desc={lang === "ko" ? "병원·경찰서·법원에서 한국어 통역 연결 — 24시간" : "Korean interpreter for hospital, police, court — 24hrs"} />
            {/* 생활 긴급 */}
            <EmergencyRow emoji="🚓" title={lang === "ko" ? "경찰 비긴급 신고" : "Police Non-Emergency"} number={em.policeNE} desc={lang === "ko" ? "긴급하지 않은 사건 신고 (도난·분실·소음 등)" : "Non-urgent incidents (theft, lost property, noise etc.)"} />
            <EmergencyRow emoji="🔥" title={em.gasName} number={em.gasPhone} desc={lang === "ko" ? "가스 냄새 즉시 신고. 건물 즉시 대피 후 전화" : "Smell gas? Evacuate immediately then call"} />
            <EmergencyRow emoji="👩‍👧" title={lang === "ko" ? "가정폭력 핫라인" : "Domestic Violence Hotline"} number="800-799-7233" desc={lang === "ko" ? "가정폭력·학대 24시간 무료 — 한국어 통역 가능" : "Domestic violence & abuse 24/7 free — Korean interpreter"} />
            <EmergencyRow emoji="🚗" title={lang === "ko" ? "도로 긴급 — AAA" : "Roadside Emergency — AAA"} number="800-222-4357" desc={lang === "ko" ? "차량 고장·견인·잠금. AAA 회원 $60/년 권장" : "Breakdown, towing, lockout. AAA membership $60/yr recommended"} />
          </div>
          {/* 안전 팁 — 도시별 */}
          <div style={{ margin: "16px 16px 0", background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 6 }}>💡 {lang === "ko" ? `${city.nameKo} 안전 팁` : `${city.nameEn} Safety Tips`}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko" ? em.safetyTips : em.safetyTipsEn}
            </div>
          </div>
        </div>
      )}

      {sub === 1 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: accent, marginBottom: 4 }}>
              🏥 {lang === "ko" ? "한인 의료·병원 안내" : "Korean Medical & Hospital Guide"}
            </div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", lineHeight: 1.5 }}>
              {lang === "ko" ? "한국어 가능 의료기관 · 정신건강 · 응급 연락" : "Korean-speaking clinics · Mental health · Emergency contacts"}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medicalItems.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>⚠️ {lang === "ko" ? "의료 정보 안내" : "Medical Info Note"}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko"
                ? "전화번호·주소는 변경될 수 있습니다. 방문 전 반드시 공식 웹사이트 또는 전화로 확인하세요. 응급 상황 → 911"
                : "Phone numbers & addresses may change. Always verify via official website or phone before visiting. Emergency → 911"}
            </div>
          </div>
        </div>
      )}

      {sub === 2 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          {/* ── 도시 인구·언어·민족 통계 카드 ── */}
          {(() => {
            const demo = getCityDemographics(city.slug, lang);
            return (
              <div style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.10), rgba(201,162,39,0.08))", border: "1px solid rgba(201,162,39,0.25)", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#C9A227", marginBottom: 10 }}>
                  📊 {lang === "ko" ? `${city.nameKo} 인구·언어·민족 현황` : `${city.nameEn} — Population & Diversity`}
                </div>
                {/* 핵심 지표 3칸 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
                  {[
                    { label: lang === "ko" ? "광역 인구" : "Metro Pop.", value: demo.metroPopulation },
                    { label: lang === "ko" ? "한인 인구" : "Korean Pop.", value: demo.koreanPopulation },
                    { label: lang === "ko" ? "한인 비율" : "Korean %", value: demo.koreanPercent },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "9px 8px", textAlign: "center" }}>
                      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#ECFDF5" }}>{s.value}</div>
                      <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "rgba(236,253,245,0.5)", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* 주요 언어 */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10, color: "rgba(236,253,245,0.6)", marginBottom: 5 }}>
                    🗣️ {lang === "ko" ? "주요 사용 언어 (순위)" : "Top Languages (by use)"}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {demo.topLanguages.map((l, i) => (
                      <span key={i} style={{ background: i === 0 ? "rgba(201,162,39,0.25)" : i <= 2 ? "rgba(110,231,183,0.15)" : "rgba(255,255,255,0.07)", border: `1px solid ${i === 0 ? "rgba(201,162,39,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: 20, padding: "3px 9px", fontFamily: "Manrope,sans-serif", fontSize: 10, fontWeight: i <= 2 ? 700 : 400, color: i === 0 ? "#C9A227" : "#ECFDF5" }}>
                        {i + 1}. {l}
                      </span>
                    ))}
                  </div>
                </div>
                {/* 민족 구성 */}
                {demo.ethnicComposition.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10, color: "rgba(236,253,245,0.6)", marginBottom: 5 }}>
                      🌍 {lang === "ko" ? "민족 구성" : "Ethnic Composition"}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {demo.ethnicComposition.map((e, i) => (
                        <span key={i} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "3px 8px", fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(236,253,245,0.8)" }}>
                          {e.group} <strong style={{ color: "#6EE7B7" }}>{e.pct}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* 전략 메모 */}
                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9, color: "#C9A227", marginBottom: 3, letterSpacing: "0.5px" }}>
                    ⚡ {lang === "ko" ? "HebronGuide 전략 메모" : "HebronGuide Strategic Note"}
                  </div>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, lineHeight: 1.7, color: "rgba(236,253,245,0.65)" }}>
                    {lang === "ko" ? demo.strategicNote : demo.strategicNoteEn}
                  </div>
                </div>
                <div style={{ marginTop: 6, fontFamily: "Manrope,sans-serif", fontSize: 9, color: "rgba(236,253,245,0.35)" }}>
                  {lang === "ko" ? "출처: US Census ACS 2023 / Stats Canada 2021 / INEGI 2020 (근사치)" : "Sources: US Census ACS 2023 / Stats Canada 2021 / INEGI 2020 (estimates)"}
                </div>
              </div>
            );
          })()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {communityLinks.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          {/* 커뮤니티 탭 — 헤브론 커뮤니티 매칭 서비스 카드 */}
          <HebronServiceCard
            icon="🤝" color="#8B5CF6" lang={lang}
            titleKo="헤브론 커넥트 — 친구·멘토·기도파트너 매칭"
            titleEn="Hebron Connect — Friend, Mentor & Prayer Partner Matching"
            descKo="교인 검증 프로필로 44개 도시 한인 연결. 친구·멘토·기도·비즈니스 파트너 찾기."
            descEn="Meet Koreans across 44 cities. Friends, mentors, prayer partners & business connections."
          />
          {/* 211 팁 박스 */}
          <a href="tel:211" style={{ display: "block", marginTop: 16, textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.15), rgba(251,146,60,0.1))", border: "1px solid rgba(248,113,113,0.35)", borderRadius: 14, padding: "14px 16px", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg,rgba(248,113,113,0.22),rgba(251,146,60,0.16))")}
              onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg,rgba(248,113,113,0.15),rgba(251,146,60,0.1))")}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: accent, marginBottom: 4 }}>
                📞 {lang === "ko" ? "211 서비스 — 무료 생활 서비스 연결" : "211 Service — Free Resource Connection"}
              </div>
              <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, lineHeight: 1.7, color: "rgba(236,253,245,0.75)" }}>
                {lang === "ko"
                  ? "생활·의료·주거·법률 무료 서비스를 한 번에 연결해드립니다. 한국어 통역 가능. 지금 바로 전화하세요 → 211"
                  : "Connects to ALL free services — food, medical, housing, legal. Korean interpreter available. Call 211 now."}
              </div>
              <div style={{ marginTop: 8, fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: accent }}>
                📱 {lang === "ko" ? "탭하면 전화 연결 →" : "Tap to call →"} <span style={{ fontSize: 16 }}>211</span>
              </div>
            </div>
          </a>
        </div>
      )}

      {sub === 3 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {usefulLinks.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>ℹ️ {lang === "ko" ? "안내" : "Note"}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko"
                ? "이 가이드의 정보는 참고용입니다. 중요한 결정 전 반드시 전문가(변호사·의사·회계사)와 상담하세요."
                : "Information in this guide is for reference only. Always consult a professional (attorney, doctor, accountant) before important decisions."}
            </div>
          </div>
        </div>
      )}

      {sub === 4 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: accent, marginBottom: 4 }}>
              📋 {lang === "ko" ? "한인 이민자가 모르는 미국 무료 자원" : "Free American Resources Korean Immigrants Often Don't Know"}
            </div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", lineHeight: 1.5 }}>
              {lang === "ko" ? "미국 주류 사회의 검증된 무료·저비용 서비스 모음. 한국어 통역 가능한 곳 우선 표시" : "Verified free & low-cost mainstream American services. Korean interpreter availability noted"}
            </div>
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, marginTop: 4, letterSpacing: "0.05em" }}>
            🍎 {lang === "ko" ? "식품 지원" : "FOOD ASSISTANCE"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="🌾" name={lang === "ko" ? "노스웨스트 하비스트 ✅ 검증됨" : "Northwest Harvest ✅ Verified"} nameEn={lang === "ko" ? "무료 푸드뱅크 네트워크" : "Free Food Bank Network"} desc={lang === "ko" ? "워싱턴주 전역 무료 푸드뱅크 네트워크. 📞 1-800-722-6924 | 🔗 northwestharvest.org" : "Free food bank network across Washington State. 📞 1-800-722-6924 | 🔗 northwestharvest.org"} tags={lang === "ko" ? ["푸드뱅크", "무료", "식품"] : ["Food Bank", "Free", "Food"]} accentColor={accent} />
            <PlaceCard emoji="🥫" name={lang === "ko" ? "푸드 라이프라인 ✅ 검증됨" : "Food Lifeline ✅ Verified"} nameEn={lang === "ko" ? "긴급 식품 지원" : "Emergency Food Assistance"} desc={lang === "ko" ? "긴급 식품 지원 서비스. 📞 206-545-6600 | 🔗 foodlifeline.org" : "Emergency food assistance for families in need. 📞 206-545-6600 | 🔗 foodlifeline.org"} tags={lang === "ko" ? ["긴급식품", "무료", "가족"] : ["Emergency", "Free", "Family"]} accentColor={accent} />
            <PlaceCard emoji="📞" name={lang === "ko" ? "킹카운티 2-1-1 ✅ 검증됨" : "King County 2-1-1 ✅ Verified"} nameEn={lang === "ko" ? "무료 서비스 연결 핫라인" : "Free Services Hotline"} desc={lang === "ko" ? "전화 211 — 식품·의료·주거·법률 무료 서비스 즉시 연결. 한국어 통역 가능" : "Dial 211 — connects to all free services (food, medical, housing, legal). Korean interpreter available"} tags={lang === "ko" ? ["211", "무료연결", "한국어"] : ["211", "Free", "Korean"]} accentColor={accent} />
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, letterSpacing: "0.05em" }}>
            ⚖️ {lang === "ko" ? "법률 지원" : "LEGAL AID"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="⚖️" name={lang === "ko" ? "노스웨스트 저스티스 프로젝트 ✅ 검증됨" : "Northwest Justice Project ✅ Verified"} nameEn={lang === "ko" ? "무료 법률 지원" : "Free Legal Help"} desc={lang === "ko" ? "이민·고용·주거 무료 법률 지원. 📞 1-888-201-1014 | 🔗 nwjustice.org" : "Free immigration, employment & housing legal help. 📞 1-888-201-1014 | 🔗 nwjustice.org"} tags={lang === "ko" ? ["이민법률", "무료", "주거"] : ["Immigration", "Free", "Housing"]} accentColor={accent} />
            <PlaceCard emoji="🏛️" name={lang === "ko" ? "KCBA 프로보노 ✅ 검증됨" : "KCBA Pro Bono ✅ Verified"} nameEn={lang === "ko" ? "무료 법률 상담" : "Free Legal Consultations"} desc={lang === "ko" ? "킹카운티 변호사협회 무료 법률 상담. 📞 206-267-7100" : "King County Bar Association free legal consultations. 📞 206-267-7100"} tags={lang === "ko" ? ["변호사", "무료", "상담"] : ["Attorney", "Free", "Consult"]} accentColor={accent} />
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, letterSpacing: "0.05em" }}>
            💰 {lang === "ko" ? "세금·재정 지원" : "TAX & FINANCIAL ASSISTANCE"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="🧾" name={lang === "ko" ? "VITA 무료 세금 신고 ✅ 검증됨" : "VITA Free Tax Filing ✅ Verified"} nameEn={lang === "ko" ? "자원봉사 세금 지원 프로그램" : "Volunteer Income Tax Assistance"} desc={lang === "ko" ? "1월~4월 무료 세금 신고 서비스. 한인 이민자 대부분 모름! 🔗 vitataxhelp.org" : "Free tax filing Jan–April. Most Korean immigrants don't know about this! 🔗 vitataxhelp.org"} tags={lang === "ko" ? ["무료세금", "1~4월", "중요"] : ["Free Tax", "Jan-Apr", "Important"]} accentColor={accent} />
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, letterSpacing: "0.05em" }}>
            🏠 {lang === "ko" ? "주거 지원" : "HOUSING ASSISTANCE"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="🏠" name={lang === "ko" ? "킹카운티 주거청 ✅ 검증됨" : "King County Housing Authority ✅ Verified"} nameEn={lang === "ko" ? "저렴한 공공주거" : "Affordable Public Housing"} desc={lang === "ko" ? "저렴한 주거 대기자 명단 신청. 📞 206-574-1100 | 🔗 kcha.org" : "Affordable housing waiting list applications. 📞 206-574-1100 | 🔗 kcha.org"} tags={lang === "ko" ? ["공공주거", "대기자", "저렴"] : ["Public Housing", "Waitlist", "Affordable"]} accentColor={accent} />
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, letterSpacing: "0.05em" }}>
            🚌 {lang === "ko" ? "대중교통" : "TRANSPORTATION"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="🚌" name={lang === "ko" ? "킹카운티 메트로 ✅ 검증됨" : "King County Metro ✅ Verified"} nameEn={lang === "ko" ? "시애틀 버스 시스템" : "Seattle Bus System"} desc={lang === "ko" ? "시애틀 광역 버스 시스템. 📞 206-553-3000 | 🔗 kingcounty.gov/metro" : "Seattle regional bus system. 📞 206-553-3000 | 🔗 kingcounty.gov/metro"} tags={lang === "ko" ? ["버스", "대중교통", "시애틀"] : ["Bus", "Transit", "Seattle"]} accentColor={accent} />
            <PlaceCard emoji="💳" name={lang === "ko" ? "ORCA 카드 ✅ 검증됨" : "ORCA Card ✅ Verified"} nameEn={lang === "ko" ? "대중교통 통합 카드" : "Integrated Transit Card"} desc={lang === "ko" ? "버스·링크 라이트레일·페리 통합. orca.com 또는 H-Mart 구매 가능 | 🔗 orca.com" : "Integrated bus, Link light rail & ferry card. Buy at orca.com or H-Mart | 🔗 orca.com"} tags={lang === "ko" ? ["ORCA", "링크", "페리"] : ["ORCA", "Link", "Ferry"]} accentColor={accent} />
          </div>

          <a href="tel:211" style={{ display: "block", marginTop: 8, textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.15), rgba(251,146,60,0.1))", border: "2px solid rgba(248,113,113,0.4)", borderRadius: 14, padding: "16px 18px", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg,rgba(248,113,113,0.22),rgba(251,146,60,0.16))")}
              onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg,rgba(248,113,113,0.15),rgba(251,146,60,0.1))")}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: accent, marginBottom: 6 }}>
                📞 {lang === "ko" ? "211 — 모든 무료 서비스를 한 번에" : "211 — Connect to All Free Services"}
              </div>
              <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, lineHeight: 1.7, color: "rgba(236,253,245,0.8)" }}>
                {lang === "ko"
                  ? "생활·의료·주거·법률 무료 연결 서비스. 한국어 통역 가능. 지금 바로 전화하세요"
                  : "Connects to free food, medical, housing & legal services. Korean interpreter available. Call now."}
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ background: accent, borderRadius: 8, padding: "5px 14px", fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#0d1117" }}>
                  {lang === "ko" ? "📱 211 전화하기" : "📱 Call 211"}
                </div>
                <span style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)" }}>
                  {lang === "ko" ? "✅ 검증됨 · 한국어 통역 가능" : "✅ Verified · Korean interpreter available"}
                </span>
              </div>
            </div>
          </a>

          <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)", borderRadius: 14, padding: "14px 16px", marginTop: 12 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>💡 {lang === "ko" ? "이 자원들을 모르셨나요?" : "Did You Know These Resources Existed?"}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko"
                ? "• VITA 무료 세금 신고 — 매년 수백 달러 절약 가능\n• 211 서비스 — 한 번의 전화로 모든 지원 연결\n• 무료 클리닉 — 보험 없어도 의료 서비스 이용 가능\n• NW 저스티스 — 이민 법률 무료 상담 가능"
                : "• VITA free tax filing — save hundreds of dollars each year\n• 211 service — one call connects to all free resources\n• Free Clinic — medical care even without insurance\n• NW Justice — free immigration legal consultations"}
            </div>
          </div>
        </div>
      )}

      {/* ── ⚖️ 법률 탭 (index 5) — 도시별 분리 ── */}
      {sub === 5 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {((): Array<{emoji:string;name:string;desc:string;tags:string[]}> => {
              const ko = lang === "ko";
              const slug = city.slug;
              // 전국 공통 — 이민 사기 경고 + Language Line
              const universal = [
                { emoji: "🚨", name: ko ? "⚠️ 이민 사기 주의 (전국)" : "⚠️ Beware Immigration Fraud (Nationwide)",
                  desc: ko ? "노타리오(Notario) 사기 신고 → 연방 FTC: reportfraud.ftc.gov\n이민 사기는 중범죄!\n⚠️ 이민 서류는 반드시 변호사(Attorney) 또는 BIA 공인 대리인에게만!\n한국어 상담 → Language Line: 800-752-6096"
                           : "Report Notario fraud → FTC: reportfraud.ftc.gov\nImmigration fraud is a serious crime!\n⚠️ Only use licensed attorneys or BIA-accredited reps!\nKorean hotline → Language Line: 800-752-6096",
                  tags: ko ? ["이민사기","신고","보호"] : ["Immigration Fraud","Report","Protection"] },
              ];
              if (slug === "seattle") return [
                { emoji: "⚖️", name: ko ? "NWIRP — 북서부 이민권 프로젝트 ✅" : "NWIRP — NW Immigrant Rights Project ✅",
                  desc: ko ? "시애틀 최대 이민 법률 무료 기관. 영주권·추방방어·DACA·망명.\n📍 615 2nd Ave Ste 400, Seattle | 📞 800-445-5771 | 🔗 nwirp.org\n무료 (저소득 우선). 한국어 통역 가능"
                           : "Seattle's largest free immigration legal org. Green card, deportation defense, DACA, asylum.\n📍 615 2nd Ave Ste 400, Seattle | 📞 800-445-5771 | 🔗 nwirp.org\nFree (low-income priority). Korean interpreter available",
                  tags: ko ? ["무료법률","이민","추방방어"] : ["Free Legal","Immigration","Deportation"] },
                { emoji: "🏛️", name: ko ? "NW 저스티스 프로젝트 ✅" : "Northwest Justice Project ✅",
                  desc: ko ? "저소득 WA 주민 무료 민사 법률. CLEAR 핫라인: 1-888-201-1014\n🔗 nwjustice.org"
                           : "Free civil legal services for low-income WA residents. CLEAR hotline: 1-888-201-1014\n🔗 nwjustice.org",
                  tags: ko ? ["무료법률","저소득","민사"] : ["Free Legal","Low Income","Civil"] },
                { emoji: "🌍", name: ko ? "OneAmerica — 이민자 권익" : "OneAmerica — Immigrant Rights",
                  desc: ko ? "WA주 최대 이민자 권익 단체. 시민권·DACA·워크퍼밋.\n📞 425-251-0900 | 🔗 weareoneamerica.org"
                           : "WA's largest immigrant advocacy org. Citizenship, DACA, work permits.\n📞 425-251-0900 | 🔗 weareoneamerica.org",
                  tags: ko ? ["시민권","DACA","권익"] : ["Citizenship","DACA","Advocacy"] },
                { emoji: "👨‍⚖️", name: ko ? "KCBA 무료 법률 (킹카운티 변호사회)" : "KCBA Free Legal Clinic (King County Bar)",
                  desc: ko ? "킹카운티 변호사협회 프로보노. 월 1회 무료 클리닉.\n📞 206-267-7010 | 🔗 kcba.org"
                           : "King County Bar pro bono. Monthly free clinic.\n📞 206-267-7010 | 🔗 kcba.org",
                  tags: ko ? ["프로보노","법률클리닉"] : ["Pro Bono","Legal Clinic"] },
                { emoji: "🏠", name: ko ? "임차인 유니온 WA" : "Tenants Union of WA",
                  desc: ko ? "임차인 권리 보호. 부당 퇴거·보증금 분쟁.\n📞 206-723-0500 | 🔗 tenantsunion.org"
                           : "Tenant rights. Eviction & security deposit disputes.\n📞 206-723-0500 | 🔗 tenantsunion.org",
                  tags: ko ? ["임차인권리","퇴거방어"] : ["Tenant Rights","Eviction"] },
                ...universal,
              ];
              if (slug === "dallas" || slug === "houston") return [
                { emoji: "⚖️", name: ko ? "Lone Star Legal Aid ✅" : "Lone Star Legal Aid ✅",
                  desc: ko ? "텍사스 최대 무료 법률 기관. 이민·주거·가족법.\n📞 713-652-0077 | 🔗 lonestarlegal.org\n한국어 통역 요청 가능"
                           : "Texas's largest free legal org. Immigration, housing, family law.\n📞 713-652-0077 | 🔗 lonestarlegal.org\nKorean interpreter available",
                  tags: ko ? ["무료법률","텍사스","이민"] : ["Free Legal","Texas","Immigration"] },
                { emoji: "🌍", name: ko ? "RAICES Texas — 이민자 권익" : "RAICES Texas — Immigrant Rights",
                  desc: ko ? "텍사스 최대 이민자 권익 단체. 추방 방어·망명·가족 분리.\n📞 210-226-7722 | 🔗 raicestexas.org"
                           : "Texas's largest immigrant advocacy org. Deportation defense, asylum, family separation.\n📞 210-226-7722 | 🔗 raicestexas.org",
                  tags: ko ? ["이민","추방방어","텍사스"] : ["Immigration","Deportation","Texas"] },
                { emoji: "🏠", name: ko ? "텍사스 임차인 권리" : "Texas Tenant Rights",
                  desc: ko ? "텍사스는 임차인 보호법이 약함. 퇴거 통보 후 3일 내 이사 의무!\n Texas RioGrande Legal Aid: 956-996-8752 | 🔗 trla.org"
                           : "Texas has weak tenant protections. Must vacate within 3 days of eviction notice!\nTexas RioGrande Legal Aid: 956-996-8752 | 🔗 trla.org",
                  tags: ko ? ["임차인권리","퇴거","텍사스"] : ["Tenant Rights","Eviction","Texas"] },
                ...universal,
              ];
              if (slug === "sf" || slug === "la") return [
                { emoji: "⚖️", name: ko ? slug === "sf" ? "Asian Law Caucus — 아시안 법률 지원" : "CHIRLA — 이민자 권리연합 ✅" : slug === "sf" ? "Asian Law Caucus ✅" : "CHIRLA — Coalition for Immigrant Rights ✅",
                  desc: ko ? slug === "sf" ? "아시안 이민자 전문 무료 법률. 이민·고용·주거법.\n📍 55 Columbus Ave, SF | 📞 415-896-1701 | 🔗 asianlawcaucus.org" : "LA 최대 이민자 권익 단체. 추방 방어·DACA·시민권.\n📞 213-353-1333 | 🔗 chirla.org"
                           : slug === "sf" ? "Free legal services for Asian immigrants. Immigration, employment, housing.\n📍 55 Columbus Ave, SF | 📞 415-896-1701 | 🔗 asianlawcaucus.org" : "LA's largest immigrant rights org. Deportation defense, DACA, citizenship.\n📞 213-353-1333 | 🔗 chirla.org",
                  tags: ko ? ["무료법률","아시안","이민"] : ["Free Legal","Asian","Immigration"] },
                { emoji: "🏛️", name: ko ? "Bay Area Legal Aid / Inner City Law Center" : "Bay Area Legal Aid / Inner City Law",
                  desc: ko ? slug === "sf" ? "저소득 주민 무료 민사 법률. 주거·임차인 보호 특화.\n📞 415-982-1300 | 🔗 baylegal.org" : "저소득 LA 주민 무료 법률. 임차인 보호·노숙자 법률.\n📞 213-891-2880 | 🔗 innercitylaw.org"
                           : slug === "sf" ? "Free civil legal for low-income residents. Housing & tenant protection focus.\n📞 415-982-1300 | 🔗 baylegal.org" : "Free legal for low-income LA residents. Tenant protection, homeless rights.\n📞 213-891-2880 | 🔗 innercitylaw.org",
                  tags: ko ? ["무료법률","저소득","주거"] : ["Free Legal","Low Income","Housing"] },
                { emoji: "🏠", name: ko ? "CA 임차인 권리 (강력 보호)" : "California Tenant Rights (Strong Protection)",
                  desc: ko ? "CA는 전국 최강 임차인 보호법!\n• AB 1482: 연 임대료 인상 5%+CPI 상한\n• 퇴거 60일 전 사전 통보 의무\n📞 CA 세입자 핫라인: 415-703-8654"
                           : "CA has the strongest tenant protection laws in the US!\n• AB 1482: Annual rent increase cap: 5%+CPI\n• 60-day eviction notice required\n📞 CA Tenant Hotline: 415-703-8654",
                  tags: ko ? ["임차인권리","CA법","임대료"] : ["Tenant Rights","CA Law","Rent Cap"] },
                ...universal,
              ];
              if (slug === "newyork") return [
                { emoji: "⚖️", name: ko ? "NYLAG — 뉴욕 법률 지원 그룹 ✅" : "NYLAG — New York Legal Assistance Group ✅",
                  desc: ko ? "뉴욕 최대 무료 법률 기관. 이민·주거·가족법·소비자 보호.\n📞 212-613-5000 | 🔗 nylag.org\n한국어 통역 가능"
                           : "NYC's largest free legal org. Immigration, housing, family law, consumer protection.\n📞 212-613-5000 | 🔗 nylag.org\nKorean interpreter available",
                  tags: ko ? ["무료법률","뉴욕","이민"] : ["Free Legal","NYC","Immigration"] },
                { emoji: "🌍", name: ko ? "NYIC — 뉴욕 이민자연합" : "NYIC — New York Immigration Coalition",
                  desc: ko ? "뉴욕 최대 이민자 권익 단체. 시민권·DACA·추방 방어.\n📞 212-627-2227 | 🔗 thenyic.org"
                           : "NYC's largest immigrant advocacy coalition. Citizenship, DACA, deportation defense.\n📞 212-627-2227 | 🔗 thenyic.org",
                  tags: ko ? ["시민권","DACA","뉴욕"] : ["Citizenship","DACA","NYC"] },
                { emoji: "🏠", name: ko ? "NYC 임차인 권리 (강력 보호)" : "NYC Tenant Rights (Very Strong)",
                  desc: ko ? "뉴욕 임차인 보호법 매우 강력!\n• Rent Stabilization: 임대료 상한 적용 아파트 多\n• 퇴거 소송: Housing Court 전 중재 가능\n📞 NYC 임차인 핫라인: 212-979-0611"
                           : "NYC has very strong tenant protection laws!\n• Rent Stabilization: Many apartments have rent caps\n• Eviction cases go through Housing Court\n📞 NYC Tenant Hotline: 212-979-0611",
                  tags: ko ? ["임차인권리","렌트안정","뉴욕"] : ["Tenant Rights","Rent Stabilization","NYC"] },
                ...universal,
              ];
              if (slug === "boston") return [
                { emoji: "⚖️", name: ko ? "GBLS — 그레이터 보스턴 법률 서비스 ✅" : "GBLS — Greater Boston Legal Services ✅",
                  desc: ko ? "보스턴 최대 무료 법률 기관. 이민·주거·가족법.\n📞 617-603-1700 | 🔗 gbls.org\n한국어 통역 가능"
                           : "Boston's largest free legal org. Immigration, housing, family law.\n📞 617-603-1700 | 🔗 gbls.org\nKorean interpreter available",
                  tags: ko ? ["무료법률","보스턴","이민"] : ["Free Legal","Boston","Immigration"] },
                { emoji: "🌍", name: ko ? "PAIR Project — 망명·추방 전문" : "PAIR Project — Asylum & Deportation Defense",
                  desc: ko ? "보스턴 망명 신청자·추방 위기 이민자 전문 무료 법률.\n📞 617-742-9296 | 🔗 pairproject.org"
                           : "Free legal defense for asylum seekers & deportation cases in Boston.\n📞 617-742-9296 | 🔗 pairproject.org",
                  tags: ko ? ["망명","추방방어","보스턴"] : ["Asylum","Deportation","Boston"] },
                { emoji: "🏠", name: ko ? "MA 임차인 권리" : "Massachusetts Tenant Rights",
                  desc: ko ? "MA 임차인 보호 비교적 강함.\n• 퇴거 최소 30일 전 통보 의무\n• 보증금 이자 연 5% 반환 의무\n📞 617-492-0543 (MTTA)"
                           : "MA has relatively strong tenant protections.\n• Minimum 30-day eviction notice required\n• Security deposit must earn 5% interest\n📞 617-492-0543 (MTTA)",
                  tags: ko ? ["임차인권리","MA법","보증금"] : ["Tenant Rights","MA Law","Deposit"] },
                ...universal,
              ];
              if (slug === "nashville") return [
                { emoji: "⚖️", name: ko ? "Legal Aid Society of Middle TN ✅" : "Legal Aid Society of Middle Tennessee ✅",
                  desc: ko ? "내쉬빌 최대 무료 법률 기관. 이민·주거·가족법.\n📞 615-780-7100 | 🔗 las.org\n한국어 통역 가능"
                           : "Nashville's largest free legal org. Immigration, housing, family law.\n📞 615-780-7100 | 🔗 las.org\nKorean interpreter available",
                  tags: ko ? ["무료법률","내쉬빌","이민"] : ["Free Legal","Nashville","Immigration"] },
                { emoji: "🌍", name: ko ? "TIRRC — 테네시 이민자 권익연합" : "TIRRC — TN Immigrant & Refugee Rights Coalition",
                  desc: ko ? "테네시 최대 이민자 권익 단체. DACA·추방 방어·시민권.\n📞 615-833-0384 | 🔗 tnimmigrant.org"
                           : "TN's largest immigrant rights org. DACA, deportation defense, citizenship.\n📞 615-833-0384 | 🔗 tnimmigrant.org",
                  tags: ko ? ["DACA","추방방어","TN"] : ["DACA","Deportation","TN"] },
                { emoji: "🏠", name: ko ? "TN 임차인 권리 (주의 필요)" : "Tennessee Tenant Rights (Caution Needed)",
                  desc: ko ? "테네시는 임차인 보호법이 약함!\n• 퇴거 통보 후 14일 이내 퇴거 의무\n• 임대료 인상 제한 없음\n📞 Internal-tenant disputes → Legal Aid: 615-780-7100"
                           : "Tennessee has weak tenant protections!\n• Must vacate within 14 days of eviction notice\n• No rent control or increase limits\n📞 Tenant disputes → Legal Aid: 615-780-7100",
                  tags: ko ? ["임차인권리","TN법","주의"] : ["Tenant Rights","TN Law","Caution"] },
                ...universal,
              ];
              if (slug === "toronto") return [
                { emoji: "⚖️", name: ko ? "Legal Aid Ontario ✅" : "Legal Aid Ontario ✅",
                  desc: ko ? "온타리오 무료 법률 서비스. 이민·형사·가족법.\n📞 1-800-668-8258 | 🔗 legalaid.on.ca\n한국어 통역 가능"
                           : "Ontario's free legal services. Immigration, criminal, family law.\n📞 1-800-668-8258 | 🔗 legalaid.on.ca\nKorean interpreter available",
                  tags: ko ? ["무료법률","온타리오","이민"] : ["Free Legal","Ontario","Immigration"] },
                { emoji: "🏠", name: ko ? "LTB — 임대차 재판소 (ON)" : "Landlord & Tenant Board (Ontario)",
                  desc: ko ? "온타리오 임대차 분쟁 공식 기관.\n• 임대료 인상 연간 가이드라인 적용\n• 퇴거: LTB 심리 필수 (집주인 임의 퇴거 불가)\n📞 416-645-8080 | 🔗 tribunalsontario.ca/ltb"
                           : "Ontario's official landlord-tenant dispute body.\n• Annual rent increase guideline applies\n• Eviction requires LTB hearing (no self-eviction)\n📞 416-645-8080 | 🔗 tribunalsontario.ca/ltb",
                  tags: ko ? ["임차인권리","LTB","온타리오"] : ["Tenant Rights","LTB","Ontario"] },
                { emoji: "🇰🇷", name: ko ? "KCWA — 한인교민회·법률 지원" : "KCWA — Korean Canadian Women's Association",
                  desc: ko ? "토론토 한인 여성·가족 법률 지원. 가정폭력·이민·정착.\n📞 416-340-1234 | 🔗 kcwa.net"
                           : "Toronto Korean legal support for women & families. Domestic violence, immigration, settlement.\n📞 416-340-1234 | 🔗 kcwa.net",
                  tags: ko ? ["한인법률","가정폭력","토론토"] : ["Korean Legal","Domestic Violence","Toronto"] },
                ...universal,
              ];
              if (slug === "vancouver") return [
                { emoji: "⚖️", name: ko ? "Legal Aid BC ✅" : "Legal Aid BC ✅",
                  desc: ko ? "BC 무료 법률 서비스. 이민·가족법·형사.\n📞 604-408-2172 | 🔗 legalaid.bc.ca\n한국어 통역 가능"
                           : "BC free legal services. Immigration, family law, criminal.\n📞 604-408-2172 | 🔗 legalaid.bc.ca\nKorean interpreter available",
                  tags: ko ? ["무료법률","BC","이민"] : ["Free Legal","BC","Immigration"] },
                { emoji: "🏠", name: ko ? "BC 임대차 분쟁 해결 지부" : "BC Residential Tenancy Branch (RTB)",
                  desc: ko ? "BC 임대차 분쟁 공식 기관.\n• 임대료 인상: 연간 가이드라인 (2024년 3.5%)\n• 퇴거: RTB 심리 필수\n📞 604-660-1020 | 🔗 gov.bc.ca/tenancy"
                           : "BC's official tenancy dispute body.\n• Rent increase: annual guideline (3.5% in 2024)\n• Eviction requires RTB hearing\n📞 604-660-1020 | 🔗 gov.bc.ca/tenancy",
                  tags: ko ? ["임차인권리","RTB","BC"] : ["Tenant Rights","RTB","BC"] },
                { emoji: "🌍", name: ko ? "DIVERSEcity — 이민자 정착 법률" : "DIVERSEcity Community Resources",
                  desc: ko ? "서리·버나비 이민자 법률·정착 지원. 한국어 서비스.\n📞 604-597-0205 | 🔗 dcrs.ca"
                           : "Surrey & Burnaby immigrant legal & settlement support. Korean services available.\n📞 604-597-0205 | 🔗 dcrs.ca",
                  tags: ko ? ["이민법률","정착","밴쿠버"] : ["Immigration Legal","Settlement","Vancouver"] },
                ...universal,
              ];
              if (slug === "atlanta") return [
                { emoji: "⚖️", name: ko ? "Atlanta Volunteer Lawyers Foundation ✅" : "Atlanta Volunteer Lawyers Foundation ✅",
                  desc: ko ? "애틀랜타 무료 법률 서비스. 이민·주거·가족법.\n📞 404-521-0790 | 🔗 avlf.org\n한국어 통역 가능"
                           : "Atlanta free legal services. Immigration, housing, family law.\n📞 404-521-0790 | 🔗 avlf.org\nKorean interpreter available",
                  tags: ko ? ["무료법률","애틀랜타","이민"] : ["Free Legal","Atlanta","Immigration"] },
                { emoji: "🌍", name: ko ? "GALEO — 조지아 이민자 권익" : "GALEO — GA Latino Alliance for Human Rights",
                  desc: ko ? "조지아 이민자 권익 단체. DACA·추방 방어·시민권.\n📞 770-457-0020 | 🔗 galeo.org"
                           : "GA immigrant rights org. DACA, deportation defense, citizenship.\n📞 770-457-0020 | 🔗 galeo.org",
                  tags: ko ? ["DACA","추방방어","GA"] : ["DACA","Deportation","GA"] },
                { emoji: "🏠", name: ko ? "GA 임차인 권리 (주의 필요)" : "Georgia Tenant Rights (Caution Needed)",
                  desc: ko ? "조지아는 임차인 보호법이 약함!\n• 퇴거 60일 전 서면 통보 필요\n• 임대료 인상 제한 없음\n분쟁 → Atlanta Legal Aid: 404-524-5811"
                           : "Georgia has weak tenant protection laws!\n• 60-day written notice before eviction required\n• No rent control or increase limits\nDisputes → Atlanta Legal Aid: 404-524-5811",
                  tags: ko ? ["임차인권리","GA법","주의"] : ["Tenant Rights","GA Law","Caution"] },
                ...universal,
              ];
              if (slug === "philadelphia") return [
                { emoji: "⚖️", name: ko ? "Philadelphia Legal Assistance ✅" : "Philadelphia Legal Assistance ✅",
                  desc: ko ? "필라델피아 최대 무료 법률 기관. 이민·주거·가족법.\n📞 215-981-3800 | 🔗 philalegal.org\n한국어 통역 가능"
                           : "Philadelphia's largest free legal org. Immigration, housing, family law.\n📞 215-981-3800 | 🔗 philalegal.org\nKorean interpreter available",
                  tags: ko ? ["무료법률","필라델피아","이민"] : ["Free Legal","Philadelphia","Immigration"] },
                { emoji: "🌍", name: ko ? "HIAS Pennsylvania — 이민자 법률" : "HIAS Pennsylvania — Immigrant Legal Services",
                  desc: ko ? "망명·추방 방어·DACA 전문. 유대계 기관이지만 모든 이민자 지원.\n📞 267-238-3255 | 🔗 hiaspa.org"
                           : "Asylum, deportation defense, DACA. Jewish org but serves all immigrants.\n📞 267-238-3255 | 🔗 hiaspa.org",
                  tags: ko ? ["망명","추방방어","필라"] : ["Asylum","Deportation","Philly"] },
                { emoji: "🏠", name: ko ? "PA 임차인 권리" : "Pennsylvania Tenant Rights",
                  desc: ko ? "PA 임차인 보호 보통 수준.\n• 퇴거: 법원 절차 필수\n• 임대료 인상 제한 없음\n분쟁 → Philly Tenant Union: 215-832-0780"
                           : "PA has moderate tenant protections.\n• Eviction requires court process\n• No rent increase limits\nDisputes → Philly Tenant Union: 215-832-0780",
                  tags: ko ? ["임차인권리","PA법"] : ["Tenant Rights","PA Law"] },
                ...universal,
              ];
              if (slug === "kansascity") return [
                { emoji: "⚖️", name: ko ? "Legal Aid of Western Missouri ✅" : "Legal Aid of Western Missouri ✅",
                  desc: ko ? "캔자스시티 무료 법률 서비스. 이민·주거·가족법.\n📞 816-474-6750 | 🔗 lawmo.org\n한국어 통역 가능"
                           : "Kansas City free legal services. Immigration, housing, family law.\n📞 816-474-6750 | 🔗 lawmo.org\nKorean interpreter available",
                  tags: ko ? ["무료법률","KC","이민"] : ["Free Legal","KC","Immigration"] },
                { emoji: "🏠", name: ko ? "KS/MO 임차인 권리" : "KS / MO Tenant Rights",
                  desc: ko ? "KS·MO 모두 임차인 보호법 약함!\n• MO: 퇴거 통보 후 5일 이내 퇴거\n• KS: 법원 명령 없으면 퇴거 불가\n분쟁 → Legal Aid Western MO: 816-474-6750"
                           : "Both KS & MO have weak tenant protection!\n• MO: Must vacate 5 days after eviction notice\n• KS: Court order required before eviction\nDisputes → Legal Aid: 816-474-6750",
                  tags: ko ? ["임차인권리","MO법","KC"] : ["Tenant Rights","MO Law","KC"] },
                ...universal,
              ];
              if (slug === "miami") return [
                { emoji: "⚖️", name: ko ? "Legal Services of Greater Miami ✅" : "Legal Services of Greater Miami ✅",
                  desc: ko ? "마이애미 최대 무료 법률 기관. 이민·주거·가족법.\n📞 305-576-0080 | 🔗 lsgmi.org\n한국어·스페인어 통역 가능"
                           : "Miami's largest free legal org. Immigration, housing, family law.\n📞 305-576-0080 | 🔗 lsgmi.org\nKorean & Spanish interpreter available",
                  tags: ko ? ["무료법률","마이애미","이민"] : ["Free Legal","Miami","Immigration"] },
                { emoji: "🌍", name: ko ? "Americans for Immigrant Justice ✅" : "Americans for Immigrant Justice ✅",
                  desc: ko ? "마이애미 이민자 법률 전문. 망명·추방 방어·DACA.\n📞 305-573-1106 | 🔗 aijustice.org"
                           : "Miami immigration legal specialist. Asylum, deportation defense, DACA.\n📞 305-573-1106 | 🔗 aijustice.org",
                  tags: ko ? ["망명","추방방어","FL"] : ["Asylum","Deportation","FL"] },
                { emoji: "🏠", name: ko ? "FL 임차인 권리 (약함 주의)" : "Florida Tenant Rights (Weak — Caution)",
                  desc: ko ? "플로리다 임차인 보호법 약함!\n• 퇴거: 통보 후 3일 이내 퇴거 or 법원 절차\n• 임대료 인상 제한 없음\n분췰 → Legal Services Miami: 305-576-0080"
                           : "Florida has weak tenant protection laws!\n• Eviction: 3 days after notice or court process\n• No rent increase limits in FL\nDisputes → Legal Services Miami: 305-576-0080",
                  tags: ko ? ["임차인권리","FL법","주의"] : ["Tenant Rights","FL Law","Caution"] },
                ...universal,
              ];
              // Mexico cities
              if (slug === "mexicocity" || slug === "guadalajara" || slug === "monterrey") return [
                { emoji: "⚖️", name: ko ? "주멕시코 한국 대사관 — 법률 정보" : "Korean Embassy Mexico — Legal Info",
                  desc: ko ? "법률 분쟁·사기 피해 시 한국 대사관 영사팀 1차 연락.\n📞 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko\n현지 한인 변호사 네트워크 소개 가능"
                           : "For legal disputes or fraud, contact Korean Embassy consular team first.\n📞 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko\nCan connect to local Korean-speaking lawyers",
                  tags: ko ? ["대사관","법률","멕시코"] : ["Embassy","Legal","Mexico"] },
                { emoji: "🏠", name: ko ? "멕시코 임차인 권리 (PROFECO)" : "Mexico Tenant Rights (PROFECO)",
                  desc: ko ? "멕시코 소비자보호청(PROFECO) — 임대 분쟁·사기 신고.\n📞 55-5568-8722 | 🔗 profeco.gob.mx\n임대 계약서 반드시 공증(Notario Público) 권장"
                           : "PROFECO (Consumer Protection) — rental disputes & fraud reports.\n📞 55-5568-8722 | 🔗 profeco.gob.mx\nStrongly recommend having lease notarized (Notario Público)",
                  tags: ko ? ["임차인권리","PROFECO","멕시코"] : ["Tenant Rights","PROFECO","Mexico"] },
                { emoji: "🌍", name: ko ? "멕시코 이민법 (INM — 이민청)" : "Mexico Immigration Law (INM)",
                  desc: ko ? "비자·체류 문제 → INM (Instituto Nacional de Migración).\n📞 800-004-6264 | 🔗 www.gob.mx/inm\n현지 이민 변호사(abogado de migración) 상담 권장"
                           : "Visa & residency issues → INM (National Migration Institute).\n📞 800-004-6264 | 🔗 www.gob.mx/inm\nConsult local immigration lawyer (abogado de migración)",
                  tags: ko ? ["INM","비자","멕시코이민"] : ["INM","Visa","Mexico Immigration"] },
                ...universal,
              ];
              // default (should not reach here)
              return universal;
            })().map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 12 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>⚖️ {lang === "ko" ? "법률 도움 받는 첫 단계" : "First Step to Get Legal Help"}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko"
                ? `1. 이민 긴급 → 위 무료 법률 기관 전화\n2. 한국어 통역 필요 → Language Line: 800-752-6096\n3. 이민 사기 신고 → FTC: reportfraud.ftc.gov\n4. 멕시코 거주 → 한국 대사관: 55-5202-9866\n5. 캐나다 거주 → Legal Aid 해당 주 연락`
                : `1. Immigration emergency → call free legal org above\n2. Korean interpreter needed → Language Line: 800-752-6096\n3. Report immigration fraud → FTC: reportfraud.ftc.gov\n4. Mexico residents → Korean Embassy: 55-5202-9866\n5. Canada residents → contact provincial Legal Aid`}
            </div>
          </div>
        </div>
      )}

      {/* ── 🇺🇸 Korean American / Korean Diaspora 탭 (index 6) — 도시별 분리 ── */}
      {sub === 6 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(239,68,68,0.08))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 15, color: "#ECFDF5", marginBottom: 6 }}>
              {city.slug === "toronto" || city.slug === "vancouver" ? "🍁" : city.slug === "mexicocity" || city.slug === "guadalajara" || city.slug === "monterrey" ? "🇲🇽" : "🇺🇸"} {lang === "ko" ? `${city.nameKo} 한인으로 살기` : `Living as a Korean in ${city.nameEn}`}
            </div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, lineHeight: 1.7, color: "rgba(236,253,245,0.7)" }}>
              {lang === "ko" ? `이민자를 넘어 ${city.nameKo} 사회의 당당한 구성원으로. 투표권·공공자원·지역사회 참여로 더 강한 한인 커뮤니티를 만들어 갑니다.` : `Beyond being immigrants — becoming full participants in ${city.nameEn} society. Civic engagement, public resources & community build a stronger Korean diaspora.`}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {((): Array<{emoji:string;name:string;desc:string;tags:string[]}> => {
              const ko = lang === "ko";
              const slug = city.slug;
              type KAItem = {emoji:string;name:string;desc:string;tags:string[]};
              // ── 투표 정보 (도시별) ──
              const votingCard: KAItem = slug === "toronto" ? {
                emoji: "🗳️", name: ko ? "선거 참여 (캐나다 연방·온타리오 주)" : "Voting (Federal & Ontario Provincial)",
                desc: ko ? "✅ 캐나다 시민권자 의무이자 권리!\n연방 유권자 등록: 🔗 elections.ca\n온타리오 주 선거: 🔗 elections.on.ca\n• 온타인 우편 투표 가능\n• 한국어 안내 요청 가능\n\n시민권 후 첫 번째 = 유권자 등록!"
                           : "✅ Your right & duty as a Canadian citizen!\nFederal: 🔗 elections.ca\nOntario: 🔗 elections.on.ca\n• Mail-in voting available\n• Korean interpretation available\n\nFirst after citizenship = voter registration!",
                tags: ko ? ["투표","캐나다","온타리오"] : ["Voting","Canada","Ontario"],
              } : slug === "vancouver" ? {
                emoji: "🗳️", name: ko ? "선거 참여 (캐나다 연방·BC 주)" : "Voting (Federal & BC Provincial)",
                desc: ko ? "✅ 캐나다 시민권자 의무이자 권리!\n연방: 🔗 elections.ca\nBC 주: 🔗 elections.bc.ca\n• 우편 투표 가능\n• 한국어 안내 요청 가능"
                         : "✅ Your right & duty as a Canadian citizen!\nFederal: 🔗 elections.ca\nBC: 🔗 elections.bc.ca\n• Mail-in voting available\n• Korean interpretation available",
                tags: ko ? ["투표","캐나다","BC"] : ["Voting","Canada","BC"],
              } : slug === "mexicocity" || slug === "guadalajara" || slug === "monterrey" ? {
                emoji: "🏛️", name: ko ? "영사 서비스 & 재외국민 등록" : "Consular Services & Overseas Korean Registration",
                desc: ko ? "장기 체류자 → 재외국민 등록 강력 권장!\n• 여권 갱신\n• 병역·선거 관련 공문 수령\n• 긴급 귀국 지원\n📞 주멕시코 한국 대사관: 55-5202-9866\n🔗 overseas.mofa.go.kr/mx-ko"
                         : "Long-term residents → overseas Korean registration strongly recommended!\n• Passport renewal\n• Official notices (military, voting)\n• Emergency repatriation support\n📞 Korean Embassy Mexico: 55-5202-9866\n🔗 overseas.mofa.go.kr/mx-ko",
                tags: ko ? ["재외국민","대사관","영사서비스"] : ["Overseas Korean","Embassy","Consular"],
              } : slug === "newyork" ? {
                emoji: "🗳️", name: ko ? "투표·시민 참여 (뉴욕/뉴저지)" : "Voting & Civic Participation (NY/NJ)",
                desc: ko ? "✅ 시민권자 의무이자 권리!\nNY 유권자 등록: 🔗 vote.nyc\nNJ 유권자 등록: 🔗 vote.nj.gov\n• NJ: 우편 투표 가능\n• 한국어 투표 안내 가능 (플러싱)\n📞 NY 한국어 선거 정보: NAKASEC 📞 888-508-5500"
                           : "✅ Your right & duty as a US citizen!\nNY Registration: 🔗 vote.nyc\nNJ Registration: 🔗 vote.nj.gov\n• NJ: mail-in voting available\n• Korean voting guides available in Flushing\n📞 Korean election info: NAKASEC 📞 888-508-5500",
                tags: ko ? ["투표","뉴욕","뉴저지"] : ["Voting","NY","NJ"],
              } : slug === "la" ? {
                emoji: "🗳️", name: ko ? "투표·시민 참여 (캘리포니아)" : "Voting & Civic Participation (California)",
                desc: ko ? "✅ 시민권자 의무이자 권리!\nCA 유권자 등록: 🔗 registertovote.ca.gov\n• CA: 우편 투표 100%! 자동 발송\n• 등록 마감: 선거일 15일 전\n• 한국어 투표 안내: KAGC 📞 213-477-5353\n• KoreanVoter.org 무료 시민권 지원"
                           : "✅ Your right & duty as a US citizen!\nCA voter registration: 🔗 registertovote.ca.gov\n• CA: 100% mail-in ballots! Auto-mailed\n• Registration deadline: 15 days before election\n• Korean voting guide: KAGC 📞 213-477-5353",
                tags: ko ? ["투표","캘리포니아","LA"] : ["Voting","California","LA"],
              } : {
                // US cities default voting
                emoji: "🗳️", name: ko ? "투표·시민 참여 — 내 한 표가 바꾼다" : "Voting & Civic Participation",
                desc: ko ? `✅ 시민권자 의무이자 권리!\n유권자 등록: 🔗 vote.gov (전국 통합)\n한국어 투표 정보: NAKASEC 📞 888-508-5500\n\n${slug === "seattle" ? "• WA주 — 우편 투표 100%! 자동 발송\n• King County Elections 📞 206-296-8683" : slug === "dallas" || slug === "houston" ? "• 텍사스: 투표소 방문 또는 부재자 투표\n• vote.texas.gov" : slug === "nashville" ? "• TN: 투표소 방문 필수 (우편 투표 제한적)\n• sos.tn.gov/elections" : slug === "boston" ? "• MA: 우편 투표 가능\n• vote.gov/states/massachusetts" : slug === "atlanta" ? "• GA: 부재자 투표 사전 신청 필요\n• mvp.sos.ga.gov" : slug === "philadelphia" ? "• PA: 우편 투표 가능\n• vote.pa.gov" : slug === "kansascity" ? "• KS/MO: 부재자 투표 가능\n• vote.gov" : "• FL: 우편 투표 사전 신청\n• dos.fl.gov/elections"}\n\n시민권 후 첫 번째 = 유권자 등록!`
                           : `✅ Your right & duty as a US citizen!\nVoter registration: 🔗 vote.gov (nationwide)\nKorean voting info: NAKASEC 📞 888-508-5500\n\n${slug === "seattle" ? "• WA: 100% mail-in ballots! Auto-mailed\n• King County Elections 📞 206-296-8683" : slug === "dallas" || slug === "houston" ? "• Texas: in-person or absentee voting\n• vote.texas.gov" : slug === "nashville" ? "• TN: in-person voting required (limited mail)\n• sos.tn.gov/elections" : slug === "boston" ? "• MA: mail-in voting available\n• vote.gov/states/massachusetts" : slug === "atlanta" ? "• GA: absentee ballot application required\n• mvp.sos.ga.gov" : slug === "philadelphia" ? "• PA: mail-in voting available\n• vote.pa.gov" : slug === "kansascity" ? "• KS/MO: absentee voting available\n• vote.gov" : "• FL: absentee ballot advance application\n• dos.fl.gov/elections"}\n\nFirst after citizenship = register to vote!`,
                tags: ko ? ["투표","시민참여","유권자등록"] : ["Voting","Civic","Voter Registration"],
              };
              // ── 도서관 (도시별) ──
              const libraryCard: KAItem = slug === "toronto" ? {
                emoji: "📚", name: ko ? "토론토 공립 도서관 (TPL)" : "Toronto Public Library (TPL)",
                desc: ko ? "✅ 무료 도서관 카드로 수백만 달러 자원!\n• ESL 영어 수업 무료\n• 시민권 시험 준비 자료\n• 한국어 도서·잡지\n• 인터넷·프린터 무료\n• LinkedIn Learning 무제한\n📞 416-393-7131 | 🔗 torontopubliclibrary.ca"
                           : "✅ Free library card = millions in resources!\n• Free ESL classes\n• Citizenship test prep\n• Korean books & magazines\n• Free internet & printing\n• Unlimited LinkedIn Learning\n📞 416-393-7131 | 🔗 torontopubliclibrary.ca",
                tags: ko ? ["도서관","무료ESL","TPL"] : ["Library","Free ESL","TPL"],
              } : slug === "vancouver" ? {
                emoji: "📚", name: ko ? "밴쿠버 공립 도서관 (VPL)" : "Vancouver Public Library (VPL)",
                desc: ko ? "✅ 무료 도서관 카드!\n• ESL 영어 수업 무료\n• 한국어 도서·잡지\n• 인터넷·프린터 무료\n• LinkedIn Learning 무제한\n• 코퀴틀람: Coquitlam Public Library\n📞 604-331-3603 | 🔗 vpl.ca"
                           : "✅ Free library card!\n• Free ESL classes\n• Korean books & magazines\n• Free internet & printing\n• Unlimited LinkedIn Learning\n• Coquitlam: Coquitlam Public Library\n📞 604-331-3603 | 🔗 vpl.ca",
                tags: ko ? ["도서관","무료ESL","VPL"] : ["Library","Free ESL","VPL"],
              } : slug === "mexicocity" || slug === "guadalajara" || slug === "monterrey" ? {
                emoji: "📚", name: ko ? "한국문화원 멕시코 & 스페인어 학습" : "Korean Cultural Center Mexico & Spanish Study",
                desc: ko ? "주멕시코 한국문화원 — 한국어·문화 행사.\n📍 멕시코시티 폴랑코 | 🔗 mexico.korean-culture.org\n\n스페인어 학습 무료 자원:\n• Duolingo (무료 앱)\n• Coursera 스페인어 강좌\n• 현지 어학원 (Academia de Idiomas)"
                           : "Korean Cultural Center Mexico — Korean language & cultural events.\n📍 Polanco, Mexico City | 🔗 mexico.korean-culture.org\n\nFree Spanish learning resources:\n• Duolingo (free app)\n• Coursera Spanish courses\n• Local language schools (Academia de Idiomas)",
                tags: ko ? ["한국문화원","스페인어","멕시코"] : ["Korean Cultural Center","Spanish","Mexico"],
              } : {
                // US cities library — city-specific
                emoji: "📚",
                name: ko ? `${slug === "seattle" ? "킹카운티 도서관" : slug === "dallas" ? "달라스 공립 도서관" : slug === "sf" ? "샌프란시스코 공립 도서관" : slug === "newyork" ? "뉴욕 공립 도서관 (NYPL)" : slug === "la" ? "LA 공립 도서관 (LAPL)" : slug === "houston" ? "휴스턴 공립 도서관 (HPL)" : slug === "boston" ? "보스턴 공립 도서관 (BPL)" : slug === "nashville" ? "내쉬빌 공립 도서관 (NPL)" : slug === "atlanta" ? "풀턴·귀넷 카운티 도서관" : slug === "philadelphia" ? "필라델피아 자유 도서관 (FLP)" : slug === "kansascity" ? "캔자스시티 공립 도서관 (KCPL)" : "마이애미데이드 공립 도서관"} — 무료 자원` : `${slug === "seattle" ? "King County Library (KCLS)" : slug === "dallas" ? "Dallas Public Library" : slug === "sf" ? "San Francisco Public Library" : slug === "newyork" ? "New York Public Library (NYPL)" : slug === "la" ? "LA Public Library (LAPL)" : slug === "houston" ? "Houston Public Library (HPL)" : slug === "boston" ? "Boston Public Library (BPL)" : slug === "nashville" ? "Nashville Public Library (NPL)" : slug === "atlanta" ? "Fulton & Gwinnett County Libraries" : slug === "philadelphia" ? "Free Library of Philadelphia (FLP)" : slug === "kansascity" ? "Kansas City Public Library (KCPL)" : "Miami-Dade Public Library"} — Free Resources`,
                desc: ko ? `✅ 무료 도서관 카드로 수백만 달러 자원!\n• ESL 영어 수업 무료\n• 시민권 시험 준비 자료\n• 취업·이력서 워크샵\n• 한국어 도서·잡지\n• 인터넷·프린터 무료\n• LinkedIn Learning 무제한\n🔗 ${slug === "seattle" ? "kcls.org" : slug === "dallas" ? "dpl.lib.tx.us" : slug === "sf" ? "sfpl.org" : slug === "newyork" ? "nypl.org" : slug === "la" ? "lapl.org" : slug === "houston" ? "houstonlibrary.org" : slug === "boston" ? "bpl.org" : slug === "nashville" ? "library.nashville.org" : slug === "atlanta" ? "fulcolibrary.org | gwinnettpl.org" : slug === "philadelphia" ? "freelibrary.org" : slug === "kansascity" ? "kclibrary.org" : "mdpls.org"}`
                           : `✅ Free library card = millions in resources!\n• Free ESL classes\n• Citizenship test prep\n• Job search & resume workshops\n• Korean books & magazines\n• Free internet & printing\n• Unlimited LinkedIn Learning\n🔗 ${slug === "seattle" ? "kcls.org" : slug === "dallas" ? "dpl.lib.tx.us" : slug === "sf" ? "sfpl.org" : slug === "newyork" ? "nypl.org" : slug === "la" ? "lapl.org" : slug === "houston" ? "houstonlibrary.org" : slug === "boston" ? "bpl.org" : slug === "nashville" ? "library.nashville.org" : slug === "atlanta" ? "fulcolibrary.org | gwinnettpl.org" : slug === "philadelphia" ? "freelibrary.org" : slug === "kansascity" ? "kclibrary.org" : "mdpls.org"}`,
                tags: ko ? ["도서관","무료ESL","취업"] : ["Library","Free ESL","Jobs"],
              };
              // ── 공공혜택 (도시·국가별) ──
              const benefitsCard: KAItem = slug === "toronto" || slug === "vancouver" ? {
                emoji: "🏛️", name: ko ? "캐나다 공공 혜택 총정리" : "Canadian Public Benefits Overview",
                desc: ko ? "영주권자·시민권자가 누릴 수 있는 캐나다 자원:\n• CCB: 자녀 양육 보조금 (월 최대 CA$619/자녀)\n• GST/HST 크레딧: 저소득 가정 세금 환급\n• CPP: 캐나다 연금 플랜 (의무 기여)\n• OAS: 65세 이상 노령 보조금\n• 의료보험: OHIP/MSP 무료 (3개월 후)\n🔗 canada.ca/benefits"
                           : "Public benefits available to PR holders & citizens:\n• CCB: Child benefit (up to CA$619/child/month)\n• GST/HST Credit: Tax rebate for low-income\n• CPP: Canada Pension Plan (mandatory contribution)\n• OAS: Old Age Security (65+)\n• Healthcare: Free OHIP/MSP (after 3 months)\n🔗 canada.ca/benefits",
                tags: ko ? ["캐나다혜택","CCB","OHIP"] : ["Canada Benefits","CCB","OHIP"],
              } : slug === "mexicocity" || slug === "guadalajara" || slug === "monterrey" ? {
                emoji: "🏛️", name: ko ? "멕시코 이민자 지원 제도" : "Mexico Immigrant Support Programs",
                desc: ko ? "멕시코 체류자·영주권자 혜택:\n• IMSS: 사회보험 (의료·은퇴 포함)\n• INFONAVIT: 주택 구매 지원 펀드\n• SAR: 은퇴 저축 계좌 시스템\n• 외국인 = IMSS 가입 가능 (취업 시 의무)\n⚠️ 주재원은 한국 국민연금 납부 유지 고려\n🔗 imss.gob.mx"
                           : "Benefits for residents & permanent residents in Mexico:\n• IMSS: Social insurance (healthcare + retirement)\n• INFONAVIT: Housing purchase support fund\n• SAR: Retirement savings system\n• Foreigners can enroll in IMSS when employed\n⚠️ Expats: consider maintaining Korean National Pension\n🔗 imss.gob.mx",
                tags: ko ? ["IMSS","멕시코혜택","주재원"] : ["IMSS","Mexico Benefits","Expats"],
              } : {
                emoji: "🏛️", name: ko ? "미국 공공 혜택 — 모르면 손해" : "US Public Benefits — Don't Miss Out",
                desc: ko ? `영주권자·시민권자 공공자원:\n• WIC: 임산부·5세 미만 무료 식품 📞 800-942-3678\n• SNAP: 식품 지원 → benefits.gov\n• ${slug === "seattle" ? "WA Apple Health" : slug === "sf" || slug === "la" ? "Medi-Cal" : slug === "newyork" ? "NY Medicaid/Essential Plan" : slug === "boston" ? "MassHealth" : slug === "nashville" ? "TennCare (저소득)" : slug === "dallas" || slug === "houston" ? "TX Medicaid (저소득)" : slug === "atlanta" ? "GA Medicaid (저소득)" : slug === "philadelphia" ? "PA Medical Assistance" : slug === "kansascity" ? "KanCare/MO HealthNet" : "FL Medicaid"}: 저소득 의료보험\n• LIHEAP: 난방·냉방비 지원\n• 첫 집 구매자 지원 프로그램: 해당 주 HFA\n💡 합법 체류자도 일부 혜택 가능. benefits.gov 확인!`
                           : `Benefits for PR holders & citizens:\n• WIC: free food for pregnant/children under 5 📞 800-942-3678\n• SNAP: food assistance → benefits.gov\n• ${slug === "seattle" ? "WA Apple Health" : slug === "sf" || slug === "la" ? "Medi-Cal" : slug === "newyork" ? "NY Medicaid/Essential Plan" : slug === "boston" ? "MassHealth" : slug === "nashville" ? "TennCare (low-income)" : slug === "dallas" || slug === "houston" ? "TX Medicaid (low-income)" : slug === "atlanta" ? "GA Medicaid (low-income)" : slug === "philadelphia" ? "PA Medical Assistance" : slug === "kansascity" ? "KanCare/MO HealthNet" : "FL Medicaid"}: low-income healthcare\n• LIHEAP: heating/cooling cost assistance\n• First-time homebuyer programs: state HFA\n💡 Legal residents may also qualify. Check benefits.gov!`,
                tags: ko ? ["공공혜택","WIC","SNAP"] : ["Public Benefits","WIC","SNAP"],
              };
              // ── 한인 문화 행사 (도시별) ──
              const eventsCard: KAItem = {
                emoji: "🗺️",
                name: ko ? `${city.nameKo} 한인 문화 행사 캘린더` : `${city.nameEn} Korean Cultural Events`,
                desc: ko ? `✅ 연간 주요 한인 행사:\n• 설날 행사: 한인회 & 지역 교회 (1-2월)\n• 광복절: 8월 15일 (총영사관/대사관 주관)\n• 추석 행사: 가을 (9-10월)\n${slug === "seattle" ? "• 코리안 페스티벌: 여름 (린우드 H-Mart)\n🔗 seattlekorean.org" : slug === "dallas" ? "• DFW 한인 문화 축제: 여름 (캐롤튼)\n🔗 달라스한인회 카카오" : slug === "sf" ? "• 베이에리어 코리아 페스티벌: 여름 (산호세)\n🔗 sfbaykorean.org" : slug === "newyork" ? "• 코리아 퍼레이드: 봄 (맨해튼 6번가)\n🔗 koreanparade.org" : slug === "la" ? "• LA 한인 축제: 9월 (코리아타운)\n🔗 lakoreanfestival.com" : slug === "houston" ? "• 휴스턴 코리아 페스티벌: 봄 (슈거랜드)\n🔗 houstonkorean.net" : slug === "boston" ? "• 보스턴 코리아: 문화 행사 상시\n🔗 bostonkorea.com" : slug === "nashville" ? "• 내쉬빌 코리아 페스티벌: 여름\n🔗 내쉬빌한인회 카카오" : slug === "toronto" ? "• 토론토 코리아 페스티벌: 여름 (노스욕)\n🔗 koreafestivaltoronto.com" : slug === "vancouver" ? "• 코퀴틀람 코리안 페스티벌: 여름\n🔗 밴쿠버한인회" : slug === "atlanta" ? "• 애틀랜타 코리아 페스티벌: 여름 (둘루스)\n🔗 atlantakorean.org" : slug === "mexicocity" || slug === "guadalajara" || slug === "monterrey" ? "• 한국 문화의 날 (주멕시코 한국문화원)\n🔗 mexico.korean-culture.org" : "🔗 지역 한인회 카카오 단톡방"}`
                           : `✅ Annual Korean community events:\n• Lunar New Year: Korean Association & churches (Jan-Feb)\n• Independence Day: Aug 15 (Consulate/Embassy)\n• Chuseok: fall (Sep-Oct)\n${slug === "seattle" ? "• Korean Festival: summer (Lynnwood H-Mart)\n🔗 seattlekorean.org" : slug === "dallas" ? "• DFW Korean Cultural Festival: summer (Carrollton)\n🔗 Dallas Korean Association KakaoTalk" : slug === "sf" ? "• Bay Area Korea Festival: summer (San Jose)\n🔗 sfbaykorean.org" : slug === "newyork" ? "• Korea Parade: spring (Manhattan 6th Ave)\n🔗 koreanparade.org" : slug === "la" ? "• LA Korean Festival: September (Koreatown)\n🔗 lakoreanfestival.com" : slug === "houston" ? "• Houston Korea Festival: spring (Sugar Land)\n🔗 houstonkorean.net" : slug === "boston" ? "• Boston Korea: cultural events year-round\n🔗 bostonkorea.com" : slug === "nashville" ? "• Nashville Korea Festival: summer\n🔗 Nashville Korean Association KakaoTalk" : slug === "toronto" ? "• Toronto Korea Festival: summer (North York)\n🔗 koreafestivaltoronto.com" : slug === "vancouver" ? "• Coquitlam Korean Festival: summer\n🔗 Vancouver Korean Association" : slug === "atlanta" ? "• Atlanta Korea Festival: summer (Duluth)\n🔗 atlantakorean.org" : slug === "mexicocity" || slug === "guadalajara" || slug === "monterrey" ? "• Korea Cultural Day (Korean Cultural Center Mexico)\n🔗 mexico.korean-culture.org" : "🔗 Local Korean Association KakaoTalk"}`,
                tags: ko ? ["한인행사","문화","커뮤니티"] : ["Korean Events","Culture","Community"],
              };
              return [votingCard, libraryCard, benefitsCard, eventsCard];
            })().map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 7: 취업 SCREEN
───────────────────────────────────────── */
// 도시별 주요 고용주 데이터
function getCityJobData(slug: string, lang: string) {
  const ko = lang === "ko";
  const DATA: Record<string, { main: any[]; sector: any[]; biz: any[]; visa: any[] }> = {
    seattle: {
      main: [
        { emoji: "☁️", name: "Amazon", nameEn: "Amazon — Largest Seattle Employer",
          desc: ko ? "✅ 시애틀 최대 고용주. SLU 본사. SDE·PM·데이터사이언티스트. AWS 글로벌 본부. 한인 직원 수천 명. 연봉 $120K-$350K+ | 🔗 amazon.jobs"
                   : "✅ Seattle's largest employer. SLU HQ. SDE, PM, data scientist, AWS HQ. Thousands of Korean employees. Salary $120K-$350K+ | 🔗 amazon.jobs", tags: ["빅테크","SDE","H-1B"] },
        { emoji: "🖥️", name: "Microsoft", nameEn: "Microsoft — Redmond HQ",
          desc: ko ? "✅ 레드몬드 본사. Azure·Office·Copilot. 한인 엔지니어 많음. H-1B 스폰서 적극. 연봉 $130K-$380K+ | 🔗 careers.microsoft.com"
                   : "✅ Redmond HQ. Azure, Office, Copilot. Large Korean engineer community. Active H-1B sponsor. $130K-$380K+ | 🔗 careers.microsoft.com", tags: ["빅테크","레드몬드","비자지원"] },
        { emoji: "✈️", name: "Boeing", nameEn: "Boeing — Aerospace",
          desc: ko ? "에버렛·렌톤. 에어로스페이스 엔지니어링. 기계·항공·전기 엔지니어 수요. 보안 허가 필요 | 🔗 boeing.com/careers"
                   : "Everett & Renton. Aerospace engineering. Mechanical, aero & electrical engineers. Security clearance needed | 🔗 boeing.com/careers", tags: ["항공","엔지니어링","에버렛"] },
      ],
      sector: [
        { emoji: "🏥", name: ko ? "의료·바이오 취업" : "Healthcare & Biotech",
          desc: ko ? "UW Medicine·Swedish·Kaiser·Virginia Mason. 간호사·의사·연구직. WA 간호사 부족 → 취업 용이. 의료 비자 경로 | 🔗 careers.uwmedicine.org"
                   : "UW Medicine, Swedish, Kaiser, Virginia Mason. Nurses, doctors, researchers. WA nurse shortage → easier hiring | 🔗 careers.uwmedicine.org", tags: ["의료","간호사","바이오"] },
      ],
      biz: [
        { emoji: "🍽️", name: ko ? "한인 자영업 가이드" : "Korean Small Business Guide",
          desc: ko ? "린우드·페더럴웨이 중심. 한식당·BBQ, 미용실·네일, 세탁소, 한인 부동산·보험. 초기 자본 $50K-$150K. 한인 상공회의소 멘토링 | 🔗 kachamber.com"
                   : "Lynnwood & Federal Way. Korean restaurants, hair/nail salons, laundry, real estate, insurance. Capital $50K-$150K. Korean Chamber mentoring | 🔗 kachamber.com", tags: ["자영업","창업","린우드"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "취업 비자 안내" : "Work Visa Guide",
          desc: ko ? "• H-1B: 전문직. Amazon·MS 적극 지원\n• L-1: 사내 이동 (한국→미국)\n• OPT/STEM OPT: 졸업 후 1-3년\n• EB-2/EB-3: 취업 영주권\n• E-2: 투자 비자"
                   : "• H-1B: Specialty occupation, Amazon/MS sponsor\n• L-1: Intracompany transfer\n• OPT/STEM OPT: 1-3 years post-grad\n• EB-2/EB-3: Employment green card\n• E-2: Investment visa", tags: ["H-1B","비자","영주권"] },
        { emoji: "💡", name: ko ? "시애틀 한인 취업 네트워크" : "Seattle Korean Job Networks",
          desc: ko ? "• KAA — Amazon 내 한인 네트워크\n• KABA — 비즈니스 네트워크\n• UW·시애틀U 한인 동문\n• 교회 소그룹 — 강력한 채용 연결"
                   : "• KAA — Korean network inside Amazon\n• KABA — Business network\n• UW/Seattle U Korean alumni\n• Church small groups — powerful job connections", tags: ["네트워크","KAA","동문"] },
      ],
    },
    dallas: {
      main: [
        { emoji: "📡", name: "AT&T", nameEn: "AT&T — Dallas HQ",
          desc: ko ? "달라스 본사. 통신·IT·미디어. 한인 엔지니어·PM 다수. H-1B 스폰서. 연봉 $80K-$200K+ | 🔗 att.jobs"
                   : "Dallas HQ. Telecom, IT & media. Korean engineers & PMs. H-1B sponsor. $80K-$200K+ | 🔗 att.jobs", tags: ["통신","IT","H-1B"] },
        { emoji: "💻", name: "Texas Instruments", nameEn: "Texas Instruments — Semiconductor",
          desc: ko ? "달라스 본사. 반도체·아날로그 IC. 한인 반도체 엔지니어 많음. 연봉 $100K-$280K+ | 🔗 ti.com/careers"
                   : "Dallas HQ. Semiconductor & analog IC. Many Korean semiconductor engineers. $100K-$280K+ | 🔗 ti.com/careers", tags: ["반도체","엔지니어링","달라스"] },
        { emoji: "✈️", name: "American Airlines", nameEn: "American Airlines — Fort Worth HQ",
          desc: ko ? "포트워스 본사. 항공·물류·IT. 한인 파일럿·IT 직군 진출 가능. 연봉 $60K-$180K | 🔗 jobs.aa.com"
                   : "Fort Worth HQ. Aviation, logistics & IT. Korean pilots & IT roles available. $60K-$180K | 🔗 jobs.aa.com", tags: ["항공","물류","포트워스"] },
      ],
      sector: [
        { emoji: "🏦", name: ko ? "금융·부동산 취업" : "Finance & Real Estate",
          desc: ko ? "달라스 금융 허브: Goldman Sachs, JP Morgan, Bank of America 달라스 오피스. 한인 금융·회계 전문가 수요. 공인회계사(CPA) 취업 용이 | 🔗 glassdoor.com"
                   : "Dallas finance hub: Goldman Sachs, JP Morgan, BofA offices. Korean finance & accounting professionals in demand. CPA jobs accessible | 🔗 glassdoor.com", tags: ["금융","회계","CPA"] },
      ],
      biz: [
        { emoji: "🍽️", name: ko ? "캐롤튼·플레이노 한인 자영업" : "Korean Small Business — Carrollton & Plano",
          desc: ko ? "캐롤튼 한인타운(Royal Lane) + 플레이노. 한식당·BBQ·치킨, 미용실·네일, 한인 마트, 부동산·보험. 텍사스 소득세 없음 → 수익성 높음. 초기 자본 $40K-$120K"
                   : "Carrollton Koreatown (Royal Lane) + Plano. Korean food, hair/nail, Korean market, real estate & insurance. No Texas income tax → higher profitability. Capital $40K-$120K", tags: ["자영업","캐롤튼","텍사스"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "텍사스 취업 비자 안내" : "Texas Work Visa Guide",
          desc: ko ? "• H-1B: AT&T·TI 등 적극 스폰서\n• TN 비자: 캐나다·멕시코 국적자\n• E-2: 한국인 창업 투자 비자 (텍사스 인기)\n• EB-5: 투자 이민 (텍사스 EB-5 센터)\n⚠️ 텍사스는 이민 단속 강화 — 비자 관리 철저히"
                   : "• H-1B: AT&T, TI active sponsors\n• TN Visa: Canadian/Mexican nationals\n• E-2: Korean investor visa (popular in TX)\n• EB-5: Investment immigration\n⚠️ Texas immigration enforcement strong — manage visa carefully", tags: ["H-1B","E-2","텍사스"] },
        { emoji: "💡", name: ko ? "달라스 한인 취업 네트워크" : "Dallas Korean Job Networks",
          desc: ko ? "• KASBA (Korean American Small Business Assoc. DFW)\n• 달라스 한인 상공회의소\n• 플레이노 한인 커뮤니티 취업 소모임\n• LinkedIn + 교회 소그룹 연결"
                   : "• KASBA (Korean American Small Business Assoc. DFW)\n• Dallas Korean Chamber of Commerce\n• Plano Korean community job meetups\n• LinkedIn + church small groups", tags: ["네트워크","KASBA","달라스"] },
      ],
    },
    la: {
      main: [
        { emoji: "🎬", name: ko ? "엔터테인먼트·미디어" : "Entertainment & Media",
          desc: ko ? "LA = 세계 엔터테인먼트 수도. Netflix·Disney·Warner·Universal. 한인 콘텐츠 수요 폭증 (K드라마·K팝). 작가·프로듀서·번역·마케팅 직군 | 🔗 entertainmentcareers.net"
                   : "LA = world entertainment capital. Netflix, Disney, Warner, Universal. Korean content demand surging. Writers, producers, translators, marketing | 🔗 entertainmentcareers.net", tags: ["엔터테인먼트","미디어","K콘텐츠"] },
        { emoji: "🏥", name: ko ? "LA 의료·간호 취업" : "LA Healthcare & Nursing",
          desc: ko ? "Cedars-Sinai·UCLA·USC Medical. 한국어 가능 의료인 수요 높음. 간호사 부족 → 취업 용이. 한인 의사·간호사 협회(KAMA, KANA) 네트워크 활용 | 🔗 cedars-sinai.org/careers"
                   : "Cedars-Sinai, UCLA, USC Medical. Korean-speaking healthcare workers in demand. Nurse shortage → easier hiring. KAMA, KANA network | 🔗 cedars-sinai.org/careers", tags: ["의료","간호","한국어"] },
        { emoji: "💻", name: ko ? "LA 테크·스타트업" : "LA Tech & Startups",
          desc: ko ? "실리콘비치(Silicon Beach): Snap·Hulu·SpaceX·LA 스타트업. 게임(Riot Games·Blizzard). 한인 테크 커뮤니티 활성 | 🔗 built.in/los-angeles"
                   : "Silicon Beach: Snap, Hulu, SpaceX, LA startups. Gaming (Riot Games, Blizzard). Active Korean tech community | 🔗 built.in/los-angeles", tags: ["테크","스타트업","게임"] },
      ],
      sector: [
        { emoji: "🏦", name: ko ? "한인 금융·은행권" : "Korean Banks & Finance",
          desc: ko ? "한미은행(Hanmi Bank)·우리아메리카은행·신한아메리카 코리아타운 본사. 한인 금융 허브. 한국어 필수 직군 다수. 연봉 $55K-$150K | 🔗 hanmi.com/careers"
                   : "Hanmi Bank, Woori America, Shinhan America — Koreatown HQ. Korean finance hub. Korean-required positions. $55K-$150K | 🔗 hanmi.com/careers", tags: ["은행","한미은행","금융"] },
      ],
      biz: [
        { emoji: "🏪", name: ko ? "LA 코리아타운 자영업" : "Koreatown Small Business",
          desc: ko ? "미주 최대 코리아타운. 한식당·BBQ·치킨, 노래방·PC방, 미용실·네일, 부동산·보험·여행사. 임대료 높으나 유동인구 최다. 초기 자본 $80K-$250K"
                   : "Largest US Koreatown. Korean food, karaoke, beauty, real estate, insurance, travel. High rent but highest foot traffic. Capital $80K-$250K", tags: ["코리아타운","자영업","창업"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "CA 취업 비자 안내" : "California Work Visa Guide",
          desc: ko ? "• H-1B: 엔터테인먼트·테크 회사 스폰서\n• O-1: 특출한 능력 비자 (예술·영화·K팝)\n• EB-1A: 탁월 능력 영주권\n• E-2: 투자 비자 (한인 자영업 인기)\n• Medi-Cal: 무보험 이민자도 의료 지원 ✅"
                   : "• H-1B: Entertainment & tech company sponsors\n• O-1: Extraordinary ability (arts, film, K-pop)\n• EB-1A: Extraordinary ability green card\n• E-2: Investment visa (popular for Korean business)\n• Medi-Cal: Healthcare for undocumented immigrants ✅", tags: ["H-1B","O-1","California"] },
        { emoji: "💡", name: ko ? "LA 한인 취업 네트워크" : "LA Korean Job Networks",
          desc: ko ? "• KAGRO — 한인 기업인 협회\n• KCCD (Korean Community Center) 취업 프로그램\n• 코리아타운 한인 교회 취업 소그룹\n• K-Town 스타트업 네트워크"
                   : "• KAGRO — Korean businesspeople association\n• KCCD (Korean Community Center) job programs\n• Koreatown church job small groups\n• K-Town startup network", tags: ["KAGRO","네트워크","코리아타운"] },
      ],
    },
    newyork: {
      main: [
        { emoji: "🏦", name: ko ? "월스트리트 금융권" : "Wall Street Finance",
          desc: ko ? "Goldman Sachs·JP Morgan·Citi·Morgan Stanley. 한인 금융 전문가 최다 집중. 연봉 $100K-$500K+. CFA·MBA 우대 | 🔗 glassdoor.com/finance"
                   : "Goldman Sachs, JP Morgan, Citi, Morgan Stanley. Highest concentration of Korean finance professionals. $100K-$500K+. CFA/MBA preferred | 🔗 glassdoor.com/finance", tags: ["금융","월스트리트","CFA"] },
        { emoji: "🏥", name: ko ? "의료·제약 취업" : "Healthcare & Pharma",
          desc: ko ? "NYU Langone·NewYork-Presbyterian·Columbia Medical. 한국어 의료인 수요. NJ 제약(Johnson & Johnson, Merck). 의사·연구직 영주권 경로 | 🔗 nyu.edu/careers"
                   : "NYU Langone, NewYork-Presbyterian, Columbia Medical. Korean-speaking healthcare in demand. NJ pharma (J&J, Merck). Doctor/researcher green card pathways | 🔗 nyu.edu/careers", tags: ["의료","제약","NJ"] },
        { emoji: "💻", name: ko ? "뉴욕 테크·스타트업" : "NYC Tech & Startups",
          desc: ko ? "Google NYC·Amazon NYC·Meta NYC. 실리콘앨리(Silicon Alley). 한인 테크 커뮤니티 성장 중. 연봉 $130K-$400K+ | 🔗 built.in/new-york"
                   : "Google NYC, Amazon NYC, Meta NYC. Silicon Alley. Growing Korean tech community. $130K-$400K+ | 🔗 built.in/new-york", tags: ["테크","스타트업","맨하탄"] },
      ],
      sector: [
        { emoji: "⚖️", name: ko ? "법률·컨설팅" : "Law & Consulting",
          desc: ko ? "대형 로펌(빅로 Big Law) + 한인 이민법 전문. McKinsey·BCG·Bain 컨설팅. 한국어 가능 변호사·컨설턴트 수요. JD·MBA 거의 필수"
                   : "Big Law firms + Korean immigration law specialists. McKinsey, BCG, Bain consulting. Korean-speaking attorneys & consultants in demand. JD/MBA nearly required", tags: ["법률","컨설팅","빅로"] },
      ],
      biz: [
        { emoji: "🏪", name: ko ? "플러싱·포트리 한인 자영업" : "Flushing & Fort Lee Korean Business",
          desc: ko ? "플러싱(Queens) + 포트리(NJ) + 팰리세이즈파크(NJ). 한식당·마트·뷰티·무역. 뉴욕 최고 유동인구. 임대료 높음. 초기 자본 $100K-$300K"
                   : "Flushing (Queens) + Fort Lee (NJ) + Palisades Park (NJ). Korean food, market, beauty, trade. Highest foot traffic. High rent. Capital $100K-$300K", tags: ["플러싱","포트리","NJ"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "뉴욕 취업 비자 안내" : "NYC Work Visa Guide",
          desc: ko ? "• H-1B: 금융·테크 회사 스폰서\n• O-1: 탁월 능력 (예술·비즈니스)\n• EB-1A/EB-2 NIW: 연구·의료 영주권\n• TN: 캐나다·멕시코 전문직\n• NYC Care: 무보험 이민자 의료 지원 ✅"
                   : "• H-1B: Finance & tech company sponsors\n• O-1: Extraordinary ability\n• EB-1A/EB-2 NIW: Research & medical green card\n• TN: Canadian/Mexican professionals\n• NYC Care: Healthcare for undocumented ✅", tags: ["H-1B","뉴욕","영주권"] },
        { emoji: "💡", name: ko ? "뉴욕 한인 취업 네트워크" : "NYC Korean Job Networks",
          desc: ko ? "• KAAFNY — 뉴욕 한인 금융인 협회\n• 플러싱 한인 상공회의소\n• 한국무역협회 뉴욕 지부(KITA)\n• 코리아소사이어티(Korea Society) 네트워크"
                   : "• KAAFNY — Korean finance professionals NYC\n• Flushing Korean Chamber of Commerce\n• KITA New York branch\n• Korea Society network", tags: ["KAAFNY","KITA","뉴욕"] },
      ],
    },
    // ── 추가 12개 도시 취업 데이터 ──────────────────────────────────
    atlanta: {
      main: [
        { emoji: "✈️", name: "Delta Air Lines", nameEn: "Delta Air Lines — World HQ",
          desc: ko ? "✅ 애틀랜타 최대 고용주. 항공·물류·IT. 한인 직원 상당수. 하츠필드잭슨 공항 연계. 연봉 $60K-$200K | 🔗 delta.com/careers"
                   : "✅ Atlanta's largest employer. Aviation, logistics, IT. Korean employees present. ATL airport-connected. $60K-$200K | 🔗 delta.com/careers", tags: ["델타","항공","물류"] },
        { emoji: "🏥", name: ko ? "에모리 & 피드몬트 의료" : "Emory & Piedmont Healthcare",
          desc: ko ? "에모리대 의료센터·피드몬트 헬스. 한국어 가능 의료인 수요. 간호사·의사·연구직. 연봉 $65K-$280K | 🔗 emoryhealthcare.org/careers"
                   : "Emory University Medical Center & Piedmont Health. Korean-speaking medical professionals needed. $65K-$280K | 🔗 emoryhealthcare.org/careers", tags: ["에모리","의료","간호사"] },
        { emoji: "💻", name: ko ? "애틀랜타 테크 클러스터" : "Atlanta Tech Cluster",
          desc: ko ? "Google·Microsoft·NCR·IBM·Salesforce 애틀랜타 오피스. 핀테크 허브로 급성장. 한인 IT 전문가 취업 활발. 연봉 $90K-$280K"
                   : "Google, Microsoft, NCR, IBM, Salesforce Atlanta offices. Fintech hub rapidly growing. Active Korean IT professional hiring. $90K-$280K", tags: ["구글","NCR","핀테크"] },
      ],
      sector: [
        { emoji: "🎬", name: ko ? "영화·미디어 산업" : "Film & Media Industry",
          desc: ko ? "'할리우드 사우스' — CNN·Turner·Netflix·Disney+ 애틀랜타 스튜디오. 한국 드라마·K-콘텐츠 제작 수요 증가. 프로덕션 한인 취업 기회 | 🔗 georgia.org/film"
                   : "'Hollywood South' — CNN, Turner, Netflix, Disney+ Atlanta studios. Korean drama/K-content production growing. Production Korean job opportunities | 🔗 georgia.org/film", tags: ["영화","CNN","K콘텐츠"] },
      ],
      biz: [
        { emoji: "🍽️", name: ko ? "둘루스·스와니 한인 자영업" : "Duluth/Suwanee Korean Small Business",
          desc: ko ? "귀넷카운티 최대 한인 상권. 한식당·BBQ, H-Mart 중심 상권. GA 식료품 판매세 면제. 초기 자본 $50K-$150K | 🔗 gwinnettcoc.com"
                   : "Gwinnett County's largest Korean commercial district. Korean restaurants, H-Mart area. GA grocery tax exempt. Capital $50K-$150K | 🔗 gwinnettcoc.com", tags: ["둘루스","자영업","귀넷"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "애틀랜타 취업 비자 안내" : "Atlanta Work Visa Guide",
          desc: ko ? "• H-1B: IT·의료·공학 스폰서\n• OPT/STEM: 조지아 주립대·에모리\n• E-2: GA 투자 비자 (식당·서비스업)\n• EB-2/EB-3: 의료·IT 영주권\n💡 GA: 소득세 5.49% (단계적 인하 예정)"
                   : "• H-1B: IT, medical, engineering sponsors\n• OPT/STEM: Georgia State, Emory\n• E-2: GA investment visa (food service)\n• EB-2/EB-3: Medical/IT green card\n💡 GA income tax 5.49% (phasing down)", tags: ["H-1B","에모리","애틀랜타"] },
        { emoji: "💡", name: ko ? "애틀랜타 한인 취업 네트워크" : "Atlanta Korean Job Networks",
          desc: ko ? "• KAGC (Korean American Grocers Association)\n• 애틀랜타 한인 상공회의소\n• 둘루스·스와니 한인 카카오 커뮤니티\n• LinkedIn 애틀랜타 한인 그룹"
                   : "• KAGC Korean American Grocers Association\n• Atlanta Korean Chamber of Commerce\n• Duluth/Suwanee Korean KakaoTalk community\n• LinkedIn Atlanta Korean group", tags: ["KAGC","상공회의소","애틀랜타"] },
      ],
    },
    boston: {
      main: [
        { emoji: "🧬", name: ko ? "바이오텍·제약 클러스터" : "Biotech & Pharma Cluster",
          desc: ko ? "Moderna·Vertex·Biogen·Sanofi 보스턴 R&D 본부. 세계 최고 바이오텍 허브. 한인 연구원·박사 취업 활발. 연봉 $100K-$350K | 🔗 massbio.org"
                   : "Moderna, Vertex, Biogen, Sanofi Boston R&D HQ. World's top biotech hub. Active Korean researcher/PhD hiring. $100K-$350K | 🔗 massbio.org", tags: ["바이오","제약","Moderna"] },
        { emoji: "🎓", name: ko ? "대학·연구기관 취업" : "Universities & Research",
          desc: ko ? "하버드·MIT·BU·Northeastern·Tufts. 연구직·포닥·행정직. 한인 연구자 밀집. 학교 소속 H-1B 스폰서 적극. 연봉 $55K-$180K"
                   : "Harvard, MIT, BU, Northeastern, Tufts. Research, postdoc, admin roles. Dense Korean researcher community. Active H-1B sponsor. $55K-$180K", tags: ["하버드","MIT","연구직"] },
        { emoji: "🏦", name: ko ? "금융·자산운용" : "Finance & Asset Management",
          desc: ko ? "State Street·Fidelity·Wellington Management 보스턴 본부. 자산운용 세계 허브. 금융 분석·퀀트·컴플라이언스. 연봉 $80K-$300K"
                   : "State Street, Fidelity, Wellington Management Boston HQ. Global asset management hub. Finance analysts, quants, compliance. $80K-$300K", tags: ["금융","Fidelity","자산운용"] },
      ],
      sector: [
        { emoji: "🖥️", name: ko ? "MIT 테크 스타트업 생태계" : "MIT/Harvard Tech Startup Ecosystem",
          desc: ko ? "켄달스퀘어 — 세계 최고 스타트업 밀도. MIT·하버드 창업자 네트워크. 한인 스타트업 창업 기회. VC 접근 용이 | 🔗 kendallsquare.org"
                   : "Kendall Square — world's densest startup hub. MIT/Harvard founder networks. Korean startup opportunities. VC access strong | 🔗 kendallsquare.org", tags: ["스타트업","켄달","MIT"] },
      ],
      biz: [
        { emoji: "🍜", name: ko ? "올스턴·브라이턴 한인 자영업" : "Allston/Brighton Korean Small Business",
          desc: ko ? "BU·하버드 학생 대상 한인 식당·카페. 유학생·연구자 고객 안정적. MA 식료품 판매세 없음. 초기 자본 $60K-$160K"
                   : "Korean restaurants/cafes serving BU/Harvard students. Stable international student/researcher clientele. MA grocery tax-free. Capital $60K-$160K", tags: ["올스턴","유학생","카페"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "보스턴 취업 비자 안내" : "Boston Work Visa Guide",
          desc: ko ? "• H-1B: 바이오텍·대학 스폰서 강함\n• OPT/STEM: 졸업 후 1-3년 (MIT·하버드·BU)\n• J-1: 연구원·포닥 경로\n• EB-1A: 탁월한 연구자 자기청원\n• EB-2 NIW: 연구·바이오 분야 유리\n💡 MA 소득세 5% (단일, 비교적 낮음)"
                   : "• H-1B: Biotech/university strong sponsors\n• OPT/STEM: 1-3 years (MIT/Harvard/BU)\n• J-1: Researcher/postdoc pathway\n• EB-1A: Extraordinary researcher self-petition\n• EB-2 NIW: Research/biotech favorable\n💡 MA flat 5% income tax (relatively low)", tags: ["H-1B","EB-1A","바이오"] },
        { emoji: "💡", name: ko ? "보스턴 한인 취업 네트워크" : "Boston Korean Job Networks",
          desc: ko ? "• KABA (Korean American Bar Association) 보스턴\n• 보스턴코리아(bostonkorea.com) 구인구직\n• MIT·하버드 한인 학생회 알럼나이\n• LinkedIn 보스턴 한인 그룹"
                   : "• KABA Boston chapter\n• BostonKorea.com job listings\n• MIT/Harvard Korean alumni networks\n• LinkedIn Boston Korean group", tags: ["KABA","보스턴코리아","MIT"] },
      ],
    },
    nashville: {
      main: [
        { emoji: "🏥", name: ko ? "HCA Healthcare — 세계 최대 병원 그룹" : "HCA Healthcare — World's Largest",
          desc: ko ? "✅ 내쉬빌 본사. 세계 최대 사립병원 그룹. 간호사·의사·행정직. 한인 의료인 취업 기회. 연봉 $60K-$250K | 🔗 hcahealthcare.com/careers"
                   : "✅ Nashville HQ. World's largest for-profit hospital. Nurses, doctors, admin. Korean healthcare professionals welcome. $60K-$250K | 🔗 hcahealthcare.com/careers", tags: ["HCA","의료","간호사"] },
        { emoji: "☁️", name: ko ? "Oracle Health·IT 클러스터" : "Oracle Health & IT Cluster",
          desc: ko ? "Oracle Health(구 Cerner) 내쉬빌 오피스. Amazon·Asurion·Community Health Systems IT. 테크 취업 급성장 중. 연봉 $80K-$220K"
                   : "Oracle Health (formerly Cerner) Nashville office. Amazon, Asurion, Community Health Systems IT. Tech hiring rapidly growing. $80K-$220K", tags: ["Oracle","IT","테크"] },
        { emoji: "🎵", name: ko ? "음악·엔터테인먼트 산업" : "Music & Entertainment Industry",
          desc: ko ? "'뮤직시티' — BMG·Warner Music·Sony Music Nashville. 음악 제작·마케팅·법률. K-팝 협업 프로젝트 증가. 연봉 $45K-$150K"
                   : "'Music City' — BMG, Warner Music, Sony Music Nashville. Music production, marketing, legal. K-pop collaboration projects growing. $45K-$150K", tags: ["음악","엔터테인먼트","K팝"] },
      ],
      sector: [
        { emoji: "🚗", name: ko ? "자동차·제조업" : "Automotive & Manufacturing",
          desc: ko ? "Bridgestone Americas(본사)·Nissan North America·GM 부품 공장. 엔지니어링·생산관리·물류. 한국계 부품사 Hyundai Mobis 등. 연봉 $60K-$160K"
                   : "Bridgestone Americas (HQ), Nissan North America, GM parts plants. Engineering, production, logistics. Korean parts companies like Hyundai Mobis. $60K-$160K", tags: ["자동차","Bridgestone","제조"] },
      ],
      biz: [
        { emoji: "🍽️", name: ko ? "내쉬빌 한인 자영업" : "Nashville Korean Small Business",
          desc: ko ? "쿨스프링스·프랭클린 중심 한인 상권. 한식당·BBQ 수요 증가. TN 소득세 없음 → 자영업 유리. H-Mart 진출로 상권 활성화 중. 초기 자본 $50K-$130K"
                   : "Cool Springs/Franklin Korean commercial area. Korean restaurant/BBQ demand growing. No TN income tax → business-friendly. H-Mart expanding the market. Capital $50K-$130K", tags: ["쿨스프링스","자영업","TN"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "내쉬빌 취업 비자 안내" : "Nashville Work Visa Guide",
          desc: ko ? "• H-1B: HCA·Oracle·Vanderbilt 스폰서\n• OPT: Vanderbilt·Belmont·Middle Tennessee 졸업생\n• E-2: TN 투자 비자 (소득세 없어 창업 인기)\n• EB-3: 의료·제조 영주권\n💡 TN 소득세 없음 — 실수령액 높음"
                   : "• H-1B: HCA, Oracle, Vanderbilt sponsors\n• OPT: Vanderbilt, Belmont, MTSU grads\n• E-2: TN investment visa (popular, no income tax)\n• EB-3: Medical/manufacturing green card\n💡 No TN income tax — high take-home pay", tags: ["HCA","Vanderbilt","TN"] },
        { emoji: "💡", name: ko ? "내쉬빌 한인 취업 네트워크" : "Nashville Korean Job Networks",
          desc: ko ? "• 내쉬빌 한인회 취업 정보\n• Korean American Chamber Nashville\n• Vanderbilt 한인 학생회 알럼나이\n• LinkedIn 내쉬빌 한인 그룹"
                   : "• Nashville Korean Association job info\n• Korean American Chamber Nashville\n• Vanderbilt Korean alumni network\n• LinkedIn Nashville Korean group", tags: ["한인회","Vanderbilt","내쉬빌"] },
      ],
    },
    toronto: {
      main: [
        { emoji: "🏦", name: ko ? "캐나다 5대 은행 취업" : "Canada's Big Five Banks",
          desc: ko ? "RBC·TD·BMO·Scotiabank·CIBC 토론토 본부. 금융분석·IT·리스크관리. 한인 금융인 밀집. 연봉 CAD $65K-$200K | 🔗 rbc.com/careers"
                   : "RBC, TD, BMO, Scotiabank, CIBC Toronto HQ. Finance analysis, IT, risk management. Dense Korean finance professionals. CAD $65K-$200K | 🔗 rbc.com/careers", tags: ["RBC","금융","Bay Street"] },
        { emoji: "💻", name: ko ? "토론토 테크 허브" : "Toronto Tech Hub",
          desc: ko ? "구글·아마존·마이크로소프트·Shopify 토론토 R&D. '실리콘 노스' 급성장. AI·머신러닝 분야 한인 엔지니어 취업 활발. 연봉 CAD $90K-$300K"
                   : "Google, Amazon, Microsoft, Shopify Toronto R&D. 'Silicon North' rapidly growing. Active Korean engineer hiring in AI/ML. CAD $90K-$300K", tags: ["구글","Shopify","AI"] },
        { emoji: "🎬", name: ko ? "영화·미디어 산업" : "Film & Media Industry",
          desc: ko ? "토론토 국제영화제(TIFF) 도시. 한국 영화·드라마 캐나다 제작 증가. CBC·Bell Media·Rogers 미디어. 영화제작·VFX 한인 취업 가능"
                   : "Toronto International Film Festival (TIFF) city. Korean film/drama Canada production increasing. CBC, Bell Media, Rogers Media. Film production/VFX Korean hiring", tags: ["TIFF","CBC","영화"] },
      ],
      sector: [
        { emoji: "🏥", name: ko ? "의료·바이오텍 취업" : "Healthcare & Biotech",
          desc: ko ? "University Health Network·Sunnybrook·SickKids. 의료·연구·바이오텍. 한국어 가능 의료인 수요. OHIP 무료 의료 혜택. 연봉 CAD $60K-$250K"
                   : "University Health Network, Sunnybrook, SickKids. Healthcare, research, biotech. Korean-speaking medical professionals needed. Free OHIP healthcare benefit. CAD $60K-$250K", tags: ["UHN","의료","OHIP"] },
      ],
      biz: [
        { emoji: "🍽️", name: ko ? "노스요크 한인 자영업" : "North York Korean Small Business",
          desc: ko ? "욘지-핀치 중심 한인 상권. 한식당·BBQ, H-Mart 중심. 한인 고객층 탄탄. CAD 최저시급 $17.20 감안한 인건비 계획 필수. 초기 자본 CAD $80K-$200K"
                   : "Yonge-Finch area Korean commercial hub. Korean food, H-Mart area. Solid Korean customer base. Must plan for CAD $17.20/hr min wage. Capital CAD $80K-$200K", tags: ["노스요크","자영업","H-Mart"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "토론토 취업 비자·이민 안내" : "Toronto Work Visa & Immigration",
          desc: ko ? "• LMIA: 고용주 노동시장평가 (취업비자)\n• Express Entry: CRS 점수 기반 영주권 — 빠른 경로\n• Ontario PNP: 온타리오 주정부 이민 (테크 우선)\n• PGWP: 캐나다 대학 졸업 후 취업허가\n• 가족초청: 시민권자·영주권자 배우자\n💡 캐나다 이민 문호 2025-2027 확대 중"
                   : "• LMIA: Labour Market Impact Assessment\n• Express Entry: CRS score-based PR — fast path\n• Ontario PNP: Provincial nominee (tech priority)\n• PGWP: Post-grad work permit (Canadian grads)\n• Family sponsorship: Citizen/PR spouse\n💡 Canada immigration expanding 2025-2027", tags: ["Express Entry","LMIA","PGWP"] },
        { emoji: "💡", name: ko ? "토론토 한인 취업 네트워크" : "Toronto Korean Job Networks",
          desc: ko ? "• KACC (Korean Canadian Chamber of Commerce)\n• 캐나다 한국일보 구인구직 koreatimes.net\n• Toronto Korean Business Association\n• LinkedIn 토론토 한인 그룹"
                   : "• KACC Korean Canadian Chamber of Commerce\n• Korea Times Canada job listings koreatimes.net\n• Toronto Korean Business Association\n• LinkedIn Toronto Korean group", tags: ["KACC","한국일보","토론토"] },
      ],
    },
    vancouver: {
      main: [
        { emoji: "💻", name: ko ? "아마존·마이크로소프트 밴쿠버" : "Amazon & Microsoft Vancouver",
          desc: ko ? "✅ 아마존 밴쿠버 오피스(게임·AWS). 마이크로소프트 밴쿠버. 구글·Electronic Arts·D-Wave. 한인 SDE 취업 활발. 연봉 CAD $100K-$320K"
                   : "✅ Amazon Vancouver (Gaming/AWS). Microsoft Vancouver. Google, Electronic Arts, D-Wave. Active Korean SDE hiring. CAD $100K-$320K", tags: ["아마존","Microsoft","EA"] },
        { emoji: "🎨", name: ko ? "VFX·게임·애니메이션 산업" : "VFX, Gaming & Animation",
          desc: ko ? "Industrial Light & Magic·Weta Digital·EA·Relic Entertainment 밴쿠버. 한인 아티스트·프로그래머 취업. 마블·DC 영화 VFX. 연봉 CAD $60K-$180K"
                   : "ILM, Weta Digital, EA, Relic Entertainment Vancouver. Korean artists/programmers hiring. Marvel/DC VFX films. CAD $60K-$180K", tags: ["VFX","게임","ILM"] },
        { emoji: "🏗️", name: ko ? "건설·부동산 개발" : "Construction & Real Estate",
          desc: ko ? "밴쿠버 부동산 개발 지속. 한국계 건설·개발사 다수 활동. 건축사·엔지니어·부동산 에이전트. 밴쿠버 집값 높아 중개 커미션 높음. 연봉 CAD $60K-$200K+"
                   : "Vancouver real estate development ongoing. Many Korean construction/development firms. Architects, engineers, realtors. High property prices = high commissions. CAD $60K-$200K+", tags: ["건설","부동산","개발"] },
      ],
      sector: [
        { emoji: "🌲", name: ko ? "천연자원·임업·광업" : "Natural Resources & Mining",
          desc: ko ? "BC주 전통 산업 — 임업·광업·가스. 환경 엔지니어·지질학자 수요. 한인 자원공학 엔지니어 취업 가능. 연봉 CAD $80K-$180K"
                   : "BC's traditional industries — forestry, mining, gas. Environmental engineers, geologists needed. Korean resource engineers welcome. CAD $80K-$180K", tags: ["BC","천연자원","엔지니어"] },
      ],
      biz: [
        { emoji: "🍜", name: ko ? "버나비·코퀴틀람 한인 자영업" : "Burnaby/Coquitlam Korean Small Business",
          desc: ko ? "버나비·코퀴틀람 중심 한인 상권. 한식당·BBQ, H-Mart 중심. 밴쿠버 높은 물가 = 높은 매출 가능. BC 최저시급 $17.40 계획 필수. 초기 자본 CAD $80K-$200K"
                   : "Burnaby/Coquitlam Korean commercial area. Korean food, H-Mart hub. Vancouver high cost of living = high revenue potential. BC min $17.40/hr. Capital CAD $80K-$200K", tags: ["버나비","자영업","H-Mart"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "밴쿠버 취업 비자·이민 안내" : "Vancouver Work Visa & Immigration",
          desc: ko ? "• LMIA: 고용주 노동시장평가\n• Express Entry + BC PNP: 테크·헬스케어 우선\n• PGWP: UBC·SFU·BCIT 졸업 후 취업허가\n• IEC (워킹홀리데이): 30세 이하 한국인\n• 스타트업 비자: 캐나다 투자사 지원 필요\n💡 BC주 테크·헬스케어 이민 문호 2025 확대"
                   : "• LMIA: Labour Market Impact Assessment\n• Express Entry + BC PNP: Tech/healthcare priority\n• PGWP: UBC/SFU/BCIT post-grad permit\n• IEC (Working Holiday): Koreans under 30\n• Startup Visa: Requires Canadian VC support\n💡 BC tech/healthcare immigration expanding 2025", tags: ["Express Entry","BC PNP","IEC"] },
        { emoji: "💡", name: ko ? "밴쿠버 한인 취업 네트워크" : "Vancouver Korean Job Networks",
          desc: ko ? "• 밴쿠버 조선일보 구인구직 vanchosun.com\n• BC주 한인회 취업 서비스\n• SFU·UBC 한인 학생회 알럼나이\n• LinkedIn 밴쿠버 한인 그룹"
                   : "• Vancouver Chosun job listings vanchosun.com\n• BC Korean Association employment service\n• SFU/UBC Korean alumni networks\n• LinkedIn Vancouver Korean group", tags: ["밴조선","UBC","밴쿠버"] },
      ],
    },
    philadelphia: {
      main: [
        { emoji: "🏥", name: ko ? "필라델피아 의료 클러스터" : "Philadelphia Medical Cluster",
          desc: ko ? "Penn Medicine·Jefferson Health·Temple University Hospital. 미국 최대 의료 집적 도시 중 하나. 한인 의료인 취업 기회 풍부. 연봉 $65K-$300K | 🔗 upenn.edu/careers"
                   : "Penn Medicine, Jefferson Health, Temple University Hospital. One of US's densest medical hubs. Abundant Korean medical professional opportunities. $65K-$300K | 🔗 upenn.edu/careers", tags: ["Penn","Jefferson","의료"] },
        { emoji: "💊", name: ko ? "제약·바이오텍 취업" : "Pharma & Biotech",
          desc: ko ? "GSK(GlaxoSmithKline)·Merck 필라 인근 본부. 얀센(J&J)·Incyte·Syneos Health. 한인 연구직·임상직 취업. 연봉 $85K-$280K"
                   : "GSK, Merck near Philadelphia HQ. Janssen (J&J), Incyte, Syneos Health. Korean research/clinical positions. $85K-$280K", tags: ["GSK","Merck","제약"] },
        { emoji: "📡", name: ko ? "Comcast 및 테크 취업" : "Comcast & Tech",
          desc: ko ? "Comcast 세계 본부 필라. SAP·Siemens·Urban Outfitters IT. 테크 인프라 성장 중. 연봉 $75K-$220K | 🔗 comcastcareers.com"
                   : "Comcast World HQ in Philly. SAP, Siemens, Urban Outfitters IT. Growing tech infrastructure. $75K-$220K | 🔗 comcastcareers.com", tags: ["Comcast","SAP","테크"] },
      ],
      sector: [
        { emoji: "🎓", name: ko ? "대학·교육 기관" : "Universities & Education",
          desc: ko ? "UPenn·Drexel·Temple·Villanova·LaSalle. 연구직·포닥·행정직. 한인 연구자 상당수. J-1·H-1B 스폰서 강함. 연봉 $50K-$180K"
                   : "UPenn, Drexel, Temple, Villanova, LaSalle. Research, postdoc, admin. Korean researchers present. Strong J-1/H-1B sponsorship. $50K-$180K", tags: ["UPenn","Drexel","연구"] },
      ],
      biz: [
        { emoji: "🍽️", name: ko ? "어퍼다비·체리힐 한인 자영업" : "Upper Darby/Cherry Hill Korean Business",
          desc: ko ? "어퍼다비(PA)·체리힐(NJ) 한인 상권. H-Mart 에지스턴 인근. 의료 종사자 고객 안정적. PA 소득세 3.07% (낮음). 초기 자본 $50K-$150K"
                   : "Upper Darby (PA) & Cherry Hill (NJ) Korean area. H-Mart Edgemont nearby. Stable medical professional clientele. PA 3.07% income tax (low). Capital $50K-$150K", tags: ["어퍼다비","체리힐","H-Mart"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "필라델피아 취업 비자 안내" : "Philadelphia Work Visa Guide",
          desc: ko ? "• H-1B: 의료·제약·Comcast 스폰서\n• J-1: UPenn·Drexel 연구원 경로\n• OPT/STEM: 드렉셀·UPenn 졸업생\n• EB-1A: 탁월한 연구자 (제약 분야)\n• EB-2 NIW: 의료·연구 분야 유리\n• PA 소득세 3.07% (전국 최저 수준)"
                   : "• H-1B: Medical, pharma, Comcast sponsors\n• J-1: UPenn/Drexel researcher pathway\n• OPT/STEM: Drexel/UPenn graduates\n• EB-1A: Extraordinary pharma researchers\n• EB-2 NIW: Medical/research favorable\n• PA 3.07% income tax (among nation's lowest)", tags: ["H-1B","UPenn","제약"] },
        { emoji: "💡", name: ko ? "필라델피아 한인 취업 네트워크" : "Philadelphia Korean Job Networks",
          desc: ko ? "• 주간필라(koreanphila.com) 구인구직\n• KACP (Korean American Chamber Philadelphia)\n• UPenn·Drexel 한인 학생회 알럼나이\n• 뉴저지 한인 커뮤니티 네트워크"
                   : "• Jugan Phila (koreanphila.com) job listings\n• KACP Korean American Chamber Philadelphia\n• UPenn/Drexel Korean alumni networks\n• New Jersey Korean community network", tags: ["주간필라","KACP","필라"] },
      ],
    },
    kansascity: {
      main: [
        { emoji: "🏥", name: ko ? "의료·헬스케어 취업" : "Healthcare",
          desc: ko ? "University of Kansas Health System·Saint Luke's·Children's Mercy. 의료 취업 KC 최대. 한인 의료인 취업 기회. 연봉 $60K-$250K"
                   : "University of Kansas Health, Saint Luke's, Children's Mercy. KC's largest job sector. Korean medical professionals welcome. $60K-$250K", tags: ["의료","KU Health","간호"] },
        { emoji: "💻", name: ko ? "오라클 헬스·테크 클러스터" : "Oracle Health & Tech",
          desc: ko ? "Oracle Health(구 Cerner) KC 본부. Sprint/T-Mobile(오버랜드파크). H&R Block HQ. IT 개발·데이터분석. 연봉 $70K-$200K"
                   : "Oracle Health (Cerner) KC HQ. Sprint/T-Mobile (Overland Park). H&R Block HQ. IT development, data analysis. $70K-$200K", tags: ["Oracle","T-Mobile","IT"] },
        { emoji: "🚗", name: ko ? "자동차·제조업" : "Automotive & Manufacturing",
          desc: ko ? "Ford KC 조립공장·GM·Harley-Davidson. 한국계 현대모비스 등 부품사. 엔지니어링·생산관리. 연봉 $60K-$160K"
                   : "Ford KC Assembly, GM, Harley-Davidson. Korean suppliers like Hyundai Mobis. Engineering, production management. $60K-$160K", tags: ["Ford","GM","제조"] },
      ],
      sector: [
        { emoji: "🌾", name: ko ? "농업·식품 산업" : "Agriculture & Food Industry",
          desc: ko ? "KC 광역권 식품 가공 허브 — Cargill·Tyson·Sysco. 식품 엔지니어·공급망. 한인 식품업계 취업 가능. 연봉 $55K-$140K"
                   : "KC metro food processing hub — Cargill, Tyson, Sysco. Food engineers, supply chain. Korean food industry professionals welcome. $55K-$140K", tags: ["식품","Cargill","농업"] },
      ],
      biz: [
        { emoji: "🍽️", name: ko ? "오버랜드파크 한인 자영업" : "Overland Park Korean Small Business",
          desc: ko ? "오버랜드파크(KS) 중심 한인 상권. H-Mart KC 오픈으로 상권 활성화. KS 식료품 판매세 면제(2025~). MO/KS 소득세 4-5% 낮음. 초기 자본 $40K-$120K"
                   : "Overland Park (KS) Korean commercial area. H-Mart KC opened, boosting market. KS grocery tax-free from 2025. MO/KS income tax 4-5% low. Capital $40K-$120K", tags: ["오버랜드파크","H-Mart","KS"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "캔자스시티 취업 비자 안내" : "Kansas City Work Visa Guide",
          desc: ko ? "• H-1B: Oracle·병원·IT 스폰서\n• OPT: KU·UMKC·Kansas State 졸업생\n• E-2: MO/KS 투자 비자 (식품·서비스 창업)\n• EB-3: 의료·제조 영주권\n💡 KC 생활비 전국 최저 수준 — 실질 구매력 높음"
                   : "• H-1B: Oracle, hospital, IT sponsors\n• OPT: KU, UMKC, Kansas State grads\n• E-2: MO/KS investment visa (food/service startups)\n• EB-3: Medical/manufacturing green card\n💡 KC lowest cost of living nationally — high purchasing power", tags: ["Oracle","KU","KC"] },
        { emoji: "💡", name: ko ? "캔자스시티 한인 취업 네트워크" : "KC Korean Job Networks",
          desc: ko ? "• KC Korean Journal 구인구직 kckoreanjournal.com\n• 캔자스시티 한인회\n• KU·UMKC 한인 학생회\n• LinkedIn KC 한인 그룹"
                   : "• KC Korean Journal jobs kckoreanjournal.com\n• Kansas City Korean Association\n• KU/UMKC Korean student organizations\n• LinkedIn KC Korean group", tags: ["KC Journal","한인회","KC"] },
      ],
    },
    miami: {
      main: [
        { emoji: "🏦", name: ko ? "국제금융·라틴아메리카 비즈니스" : "International Finance & Latin America",
          desc: ko ? "Citigroup·HSBC·Banco Santander 마이애미 라틴아메리카 본부. 한국어+스페인어 이중언어 금융인 수요. 연봉 $70K-$250K"
                   : "Citigroup, HSBC, Banco Santander Latin America HQ. Korean+Spanish bilingual finance professionals needed. $70K-$250K", tags: ["금융","라틴아메리카","이중언어"] },
        { emoji: "🏥", name: ko ? "Baptist Health·헬스케어" : "Baptist Health & Healthcare",
          desc: ko ? "Baptist Health·Jackson Health·Nicklaus Children's. FL 한인 의료인 취업. FL 소득세 없음 → 실수령액 높음. 연봉 $60K-$250K"
                   : "Baptist Health, Jackson Health, Nicklaus Children's. FL Korean medical professional hiring. No FL income tax → high take-home. $60K-$250K", tags: ["Baptist","FL","의료"] },
        { emoji: "🚢", name: ko ? "해운·물류·관광 산업" : "Shipping, Logistics & Tourism",
          desc: ko ? "Royal Caribbean·Carnival·Norwegian 마이애미 본부. 세계 최대 크루즈 항구. 한인 해운·물류·관광 취업. 스페인어 가능 시 우대. 연봉 $50K-$180K"
                   : "Royal Caribbean, Carnival, Norwegian Miami HQ. World's largest cruise port. Korean shipping/logistics/tourism hiring. Spanish preferred. $50K-$180K", tags: ["크루즈","물류","Royal Caribbean"] },
      ],
      sector: [
        { emoji: "🏗️", name: ko ? "부동산·건설 개발" : "Real Estate & Construction",
          desc: ko ? "마이애미 부동산 붐 지속. 한인 부동산 에이전트·개발사 활동. 국제 투자자(브라질·아르헨·한국) 대상 서비스. FL 소득세 없음 → 커미션 전액 수령. 연봉 $60K-$300K+"
                   : "Miami real estate boom ongoing. Korean realtors/developers active. Serving international investors (Brazil, Argentina, Korea). No FL tax → keep full commission. $60K-$300K+", tags: ["부동산","개발","FL"] },
      ],
      biz: [
        { emoji: "🍽️", name: ko ? "도랄·켄달 한인 자영업" : "Doral/Kendall Korean Small Business",
          desc: ko ? "도랄(한인·라틴 커뮤니티 혼합) 중심 상권. 스페인어 가능 시 사업 확장 유리. FL 소득세 없음 + 판매세 7%. 허리케인 보험 비용 고려 필수. 초기 자본 $60K-$160K"
                   : "Doral (Korean-Latin mixed community) commercial area. Spanish advantage for business expansion. No FL income tax, 7% sales tax. Must budget hurricane insurance. Capital $60K-$160K", tags: ["도랄","스페인어","FL"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "마이애미 취업 비자 안내" : "Miami Work Visa Guide",
          desc: ko ? "• H-1B: 의료·금융·물류 스폰서\n• E-2: FL 투자 비자 (한국인 인기 — 소득세 없음)\n• EB-5: 투자 이민 ($800K~) 마이애미 인기\n• TN: 멕시코 국경 인접 — 캐나다·멕시코 전문직\n💡 스페인어 = 마이애미 최대 취업 경쟁력"
                   : "• H-1B: Medical, finance, logistics sponsors\n• E-2: FL investment visa (popular for Koreans, no income tax)\n• EB-5: Investment immigration ($800K+) popular in Miami\n• TN: Near Mexico border — Canadian/Mexican professionals\n💡 Spanish = Miami's strongest career advantage", tags: ["E-2","EB-5","스페인어"] },
        { emoji: "💡", name: ko ? "마이애미 한인 취업 네트워크" : "Miami Korean Job Networks",
          desc: ko ? "• 마이애미 한인 상공회의소\n• 미주중앙일보 마이애미 구인구직\n• 도랄 한인 카카오 커뮤니티\n• LinkedIn 마이애미 한인 그룹"
                   : "• Miami Korean Chamber of Commerce\n• Korea Daily Miami job listings\n• Doral Korean KakaoTalk community\n• LinkedIn Miami Korean group", tags: ["한인회","중앙일보","마이애미"] },
      ],
    },
    mexicocity: {
      main: [
        { emoji: "🇰🇷", name: ko ? "한국 기업 멕시코 법인 취업" : "Korean Companies in Mexico",
          desc: ko ? "삼성전자·LG전자·현대·기아 멕시코 법인. 한국어+스페인어 이중언어 우대. 주재원 기회. 연봉 MXN $600K-$2M (현지 기준) | 🔗 samsung.com/mx"
                   : "Samsung, LG, Hyundai, Kia Mexico subsidiaries. Korean+Spanish bilingual preferred. Expat opportunities. MXN $600K-$2M (local standard) | 🔗 samsung.com/mx", tags: ["삼성","LG","한국기업"] },
        { emoji: "💼", name: ko ? "다국적기업·금융 취업" : "Multinationals & Finance",
          desc: ko ? "BBVA·Citibanamex·Bimbo·América Móvil. 한국인 전문가 금융·마케팅·IT 부문. 영어+스페인어 필수. 연봉 USD $30K-$100K (달러 환산)"
                   : "BBVA, Citibanamex, Bimbo, América Móvil. Korean professionals in finance, marketing, IT. English+Spanish essential. USD $30K-$100K equivalent", tags: ["BBVA","다국적","스페인어"] },
        { emoji: "🏭", name: ko ? "제조업·무역 취업" : "Manufacturing & Trade",
          desc: ko ? "멕시코 제조업 허브 — 자동차·전자·식품. 한국계 현대모비스·LS Cable 현지 공장. USMCA(미-멕-캐 협정) 활용 무역. 연봉 MXN $400K-$1.5M"
                   : "Mexico manufacturing hub — auto, electronics, food. Korean Hyundai Mobis, LS Cable local plants. USMCA trade opportunities. MXN $400K-$1.5M", tags: ["제조업","USMCA","무역"] },
      ],
      sector: [
        { emoji: "🌮", name: ko ? "스타트업·테크 생태계" : "Startup & Tech Ecosystem",
          desc: ko ? "폴랑코·산타페 스타트업 클러스터. Kavak·Konfío 등 멕시코 유니콘. 원격근무 비자(디지털 노마드) 가능. 연봉 USD $20K-$80K (생활비 저렴 = 높은 실질 소득)"
                   : "Polanco/Santa Fe startup cluster. Kavak, Konfío and other Mexican unicorns. Remote work visa (digital nomad) available. USD $20K-$80K (low cost of living = high real income)", tags: ["스타트업","디지털노마드","폴랑코"] },
      ],
      biz: [
        { emoji: "🍜", name: ko ? "폴랑코 한인 자영업" : "Polanco Korean Small Business",
          desc: ko ? "폴랑코 외교·비즈니스 구역 한인 식당. 주재원·외교관 고객 안정적. 멕시코 IVA(부가세) 16% 감안. 사업 등록(RFC) 필수 — 현지 회계사 도움. 초기 자본 USD $20K-$60K"
                   : "Polanco diplomatic/business area Korean restaurants. Stable expat/diplomat clientele. Mexico IVA (VAT) 16%. RFC registration required — local accountant essential. Capital USD $20K-$60K", tags: ["폴랑코","주재원","RFC"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "멕시코 취업·거주 비자 안내" : "Mexico Work & Residence Visa",
          desc: ko ? "• FM3 (Residente Temporal): 1년 체류 + 취업 가능\n• Residente Permanente: 4년 후 영주권\n• 디지털 노마드 비자: 원격근무 월 $1,620+ 필요\n• USMCA TN 비자: 전문직 미국·캐나다·멕시코 이동\n⚠️ RFC (납세자 번호) 등록 필수 — 현지 회계사 상담"
                   : "• FM3 (Residente Temporal): 1-year stay + work\n• Residente Permanente: Permanent after 4 years\n• Digital nomad visa: Remote work $1,620+/month required\n• USMCA TN visa: Professional mobility US/Canada/Mexico\n⚠️ RFC (tax ID) registration required — consult local accountant", tags: ["FM3","RFC","디지털노마드"] },
        { emoji: "💡", name: ko ? "멕시코시티 한인 취업 네트워크" : "Mexico City Korean Job Networks",
          desc: ko ? "• 한국 대사관(주멕시코) 한인 커뮤니티\n• Kotra 멕시코시티 사무소\n• 멕시코 한인 상공회의소\n• LinkedIn 멕시코시티 한인 그룹"
                   : "• Korean Embassy Mexico City Korean community\n• KOTRA Mexico City office\n• Mexican Korean Chamber of Commerce\n• LinkedIn Mexico City Korean group", tags: ["KOTRA","대사관","멕시코"] },
      ],
    },
    guadalajara: {
      main: [
        { emoji: "💻", name: ko ? "실리콘밸리 사무소·테크 기업" : "Tech Companies & Silicon Valley Offices",
          desc: ko ? "Intel·HP·Oracle·IBM 과달라하라 오피스. '멕시코 실리콘밸리' 별칭. IT·소프트웨어 개발자 수요. 영어+스페인어 필수. 연봉 MXN $400K-$1.5M"
                   : "Intel, HP, Oracle, IBM Guadalajara offices. 'Mexico's Silicon Valley' nickname. IT/software developer demand. English+Spanish essential. MXN $400K-$1.5M", tags: ["Intel","HP","IT"] },
        { emoji: "🇰🇷", name: ko ? "한국 제조·전자기업" : "Korean Manufacturing & Electronics",
          desc: ko ? "LG전자·삼성 부품사·한국 자동차 부품사 할리스코주 공장. 한국어+스페인어 엔지니어·관리자. 주재원 기회. 연봉 USD $25K-$70K"
                   : "LG, Samsung suppliers, Korean auto parts factories in Jalisco state. Korean+Spanish engineers/managers. Expat opportunities. USD $25K-$70K", tags: ["LG","한국기업","할리스코"] },
      ],
      sector: [
        { emoji: "🎮", name: ko ? "게임·미디어·창작 산업" : "Gaming, Media & Creative",
          desc: ko ? "과달라하라 문화 도시 — 애니메이션·게임·영화 산업 성장. 멕시코 창작 인재 허브. 스타트업 생태계 활발"
                   : "Guadalajara cultural city — animation, gaming, film industry growing. Mexican creative talent hub. Active startup ecosystem", tags: ["게임","미디어","창작"] },
      ],
      biz: [
        { emoji: "🍜", name: ko ? "과달라하라 한인 자영업" : "Guadalajara Korean Small Business",
          desc: ko ? "소규모 한인 커뮤니티 중심 상권. 한식당·코리안 BBQ 수요 증가. 멕시코 제2도시 = 성장 잠재력. 초기 자본 USD $15K-$50K (멕시코시티 대비 저렴)"
                   : "Small Korean community commercial area. Korean food/BBQ demand growing. Mexico's 2nd city = growth potential. Capital USD $15K-$50K (cheaper than Mexico City)", tags: ["과달라하라","한식당","성장"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "과달라하라 취업·거주 비자" : "Guadalajara Work Visa",
          desc: ko ? "멕시코시티와 동일 비자 시스템:\n• FM3 (Residente Temporal): 취업 가능\n• RFC 납세자 번호 등록 필수\n• 한국 기업 주재원: 본사 파견 서류로 간소화\n💡 멕시코 생활비 저렴 — 달러 수입 시 높은 실질 소득"
                   : "Same visa system as Mexico City:\n• FM3 (Residente Temporal): Work permitted\n• RFC tax ID registration required\n• Korean company expats: Simplified with HQ dispatch\n💡 Low Mexico cost of living — high real income with USD earnings", tags: ["FM3","주재원","과달라하라"] },
        { emoji: "💡", name: ko ? "과달라하라 한인 네트워크" : "Guadalajara Korean Network",
          desc: ko ? "• 과달라하라 한인회\n• 주멕시코 한국 대사관 연결\n• KOTRA 멕시코시티 → 과달라하라 지원\n• LinkedIn 과달라하라 한인 그룹"
                   : "• Guadalajara Korean Association\n• Korean Embassy Mexico City connection\n• KOTRA Mexico City → Guadalajara support\n• LinkedIn Guadalajara Korean group", tags: ["한인회","KOTRA","과달라하라"] },
      ],
    },
    monterrey: {
      main: [
        { emoji: "🏭", name: ko ? "중공업·철강·시멘트" : "Heavy Industry, Steel & Cement",
          desc: ko ? "CEMEX·Ternium·Vitro 본부 몬테레이. 북미 최대 공업 도시 중 하나. 한국계 POSCO·현대제철 협력사. 엔지니어링·제조관리. 연봉 MXN $500K-$1.8M"
                   : "CEMEX, Ternium, Vitro HQ Monterrey. One of North America's largest industrial cities. Korean POSCO/Hyundai Steel partners. Engineering, manufacturing management. MXN $500K-$1.8M", tags: ["CEMEX","철강","중공업"] },
        { emoji: "🚗", name: ko ? "자동차·한국 부품사" : "Automotive & Korean Suppliers",
          desc: ko ? "현대·기아 멕시코 공장 인근 부품 클러스터. 현대모비스·현대트랜시스·한국타이어 몬테레이 공장. 한국어 엔지니어 수요. 주재원 기회. 연봉 USD $30K-$80K"
                   : "Hyundai/Kia Mexico plant parts cluster. Hyundai Mobis, Hyundai Transys, Hankook Tire Monterrey plants. Korean engineers needed. Expat opportunities. USD $30K-$80K", tags: ["현대","기아","자동차"] },
      ],
      sector: [
        { emoji: "📦", name: ko ? "물류·유통 산업" : "Logistics & Distribution",
          desc: ko ? "미국-멕시코 국경 물류 허브. USMCA 혜택으로 물류 급성장. 한국 물류기업(CJ대한통운 등) 멕시코 확장. 공급망 관리자 수요"
                   : "US-Mexico border logistics hub. USMCA-driven logistics boom. Korean logistics firms (CJ Logistics etc.) expanding in Mexico. Supply chain managers needed", tags: ["물류","USMCA","CJ"] },
      ],
      biz: [
        { emoji: "🍜", name: ko ? "몬테레이 한인 자영업" : "Monterrey Korean Small Business",
          desc: ko ? "소규모 한인 커뮤니티. 주재원 대상 한식당 수요. 공업도시 = 높은 구매력. 멕시코 3대 도시 성장 지속. 초기 자본 USD $15K-$45K"
                   : "Small Korean community. Korean food demand from expats. Industrial city = high purchasing power. Mexico's 3rd city continuing growth. Capital USD $15K-$45K", tags: ["몬테레이","주재원","공업"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "몬테레이 취업·거주 비자" : "Monterrey Work Visa",
          desc: ko ? "멕시코 공통 비자 시스템 적용:\n• FM3: 주재원·취업 비자\n• RFC 필수 등록\n• USMCA TN: 전문직 멕시코→미국·캐나다\n💡 누에보레온주 — 멕시코에서 가장 경제적으로 발전한 주"
                   : "Mexico standard visa system:\n• FM3: Expat/work permit\n• RFC mandatory registration\n• USMCA TN: Professional Mexico→US/Canada\n💡 Nuevo León — Mexico's most economically advanced state", tags: ["FM3","USMCA","누에보레온"] },
        { emoji: "💡", name: ko ? "몬테레이 한인 네트워크" : "Monterrey Korean Network",
          desc: ko ? "• 몬테레이 한인회\n• 주멕시코 한국 대사관 연결\n• 한국 제조기업 사내 한인 커뮤니티\n• LinkedIn 몬테레이 한인 그룹"
                   : "• Monterrey Korean Association\n• Korean Embassy Mexico City connection\n• Korean manufacturing company internal community\n• LinkedIn Monterrey Korean group", tags: ["한인회","제조기업","몬테레이"] },
      ],
    },
    houston: {
      main: [
        { emoji: "⚡", name: ko ? "에너지·석유화학" : "Energy & Petrochemicals",
          desc: ko ? "ExxonMobil·Chevron·Shell·BP 휴스턴 오피스. 에너지 엔지니어·지질학자·데이터분석가. 한인 에너지 전문가 다수. 연봉 $90K-$250K | 🔗 exxonmobil.com/careers"
                   : "ExxonMobil, Chevron, Shell, BP Houston offices. Energy engineers, geologists, data analysts. Korean energy professionals. $90K-$250K | 🔗 exxonmobil.com/careers", tags: ["에너지","엔지니어링","오일"] },
        { emoji: "🚀", name: ko ? "NASA·항공우주" : "NASA & Aerospace",
          desc: ko ? "NASA Johnson Space Center 인근. Boeing·Lockheed Martin·SpaceX 휴스턴 오피스. 한인 항공우주 엔지니어 취업 가능. 보안 허가 필요 | 🔗 nasajobs.nasa.gov"
                   : "Near NASA Johnson Space Center. Boeing, Lockheed, SpaceX Houston. Korean aerospace engineers welcomed. Security clearance needed | 🔗 nasajobs.nasa.gov", tags: ["NASA","항공우주","우주"] },
        { emoji: "🏥", name: ko ? "Texas Medical Center 취업" : "Texas Medical Center Jobs",
          desc: ko ? "세계 최대 의료 단지(TMC). MD Anderson·Methodist·Baylor. 한국어 가능 의료인 수요. 간호사 부족 → 취업 용이. 연봉 $70K-$250K | 🔗 tmc.edu"
                   : "World's largest medical complex (TMC). MD Anderson, Methodist, Baylor. Korean-speaking healthcare demand. Nurse shortage → accessible. $70K-$250K | 🔗 tmc.edu", tags: ["의료","TMC","간호사"] },
      ],
      sector: [
        { emoji: "🔧", name: ko ? "한인 엔지니어링 기업" : "Korean Engineering Companies",
          desc: ko ? "GS건설·삼성엔지니어링·현대건설 휴스턴 프로젝트. 한국어+영어 능통자 우대. 해외 플랜트 프로젝트 참여 기회 | 🔗 linkedin.com"
                   : "GS Engineering, Samsung Engineering, Hyundai Construction Houston projects. Korean+English bilingual preferred. Overseas plant project opportunities | 🔗 linkedin.com", tags: ["건설","엔지니어링","한국기업"] },
      ],
      biz: [
        { emoji: "🍽️", name: ko ? "Bellaire 한인 자영업" : "Bellaire Korean Small Business",
          desc: ko ? "Bellaire Blvd 비공식 한인타운. 한식당·BBQ, H-Mart 주변 상권. 텍사스 소득세 없음. 에너지 산업 고소득층 고객. 초기 자본 $50K-$150K"
                   : "Bellaire Blvd informal Koreatown. Korean food, H-Mart area. No Texas income tax. High-income energy sector customers. Capital $50K-$150K", tags: ["Bellaire","자영업","창업"] },
      ],
      visa: [
        { emoji: "💼", name: ko ? "휴스턴 취업 비자 안내" : "Houston Work Visa Guide",
          desc: ko ? "• H-1B: 에너지·의료 분야 스폰서\n• TN: 캐나다·멕시코 엔지니어\n• E-2: 텍사스 투자 비자 (창업 인기)\n• EB-2/EB-3: 의료·엔지니어 영주권\n⚠️ 텍사스 반이민 정책 — 서류 관리 철저히"
                   : "• H-1B: Energy & medical company sponsors\n• TN: Canadian/Mexican engineers\n• E-2: Texas investment visa (popular for startups)\n• EB-2/EB-3: Medical & engineering green card\n⚠️ Texas anti-immigration policy — manage documents carefully", tags: ["H-1B","에너지","텍사스"] },
        { emoji: "💡", name: ko ? "휴스턴 한인 취업 네트워크" : "Houston Korean Job Networks",
          desc: ko ? "• Greater Houston Korean American Chamber\n• IHM(가정교회) 휴스턴 한인 취업 네트워크\n• Bellaire 한인 소모임\n• LinkedIn + 교회 연결"
                   : "• Greater Houston Korean American Chamber\n• IHM Houston Korean job network\n• Bellaire Korean meetups\n• LinkedIn + church connections", tags: ["GHKACC","IHM","휴스턴"] },
      ],
    },
  };

  // 기본값: 범용 데이터 (데이터 없는 도시)
  const generic = {
    main: [
      { emoji: "💻", name: ko ? `${slug} 테크·IT 취업` : `${slug} Tech & IT Jobs`,
        desc: ko ? "LinkedIn·Indeed·Glassdoor에서 현지 한인 취업 정보 검색. 211 전화 → 취업 서비스 연결. 한인 교회 취업 소그룹 활용"
                 : "Search local Korean job info on LinkedIn, Indeed, Glassdoor. Dial 211 for job services. Use Korean church job small groups", tags: ["IT","취업","링크드인"] },
      { emoji: "🏥", name: ko ? "의료·간호 취업" : "Healthcare & Nursing",
        desc: ko ? "한국어 가능 의료인 수요 전국적. 211 전화 또는 지역 병원 인사팀 문의. 한인 의사·간호사 협회 네트워크 활용"
                 : "Korean-speaking healthcare workers needed nationwide. Dial 211 or contact hospital HR. Korean medical professional associations", tags: ["의료","간호","한국어"] },
    ],
    sector: [
      { emoji: "🏦", name: ko ? "금융·세무 취업" : "Finance & Accounting",
        desc: ko ? "CPA·공인회계사 전국 수요 강함. 한국어+영어 이중언어 세무사 특히 수요. 한인 교포 고객 대상 세무·회계 서비스 창업 가능"
                 : "CPA demand strong nationwide. Korean-English bilingual tax professionals especially needed. Korean community tax/accounting services", tags: ["CPA","세무","회계"] },
    ],
    biz: [
      { emoji: "🍽️", name: ko ? "한인 자영업 안내" : "Korean Small Business Guide",
        desc: ko ? "한인 밀집 지역 자영업: 한식당·미용실·부동산·보험. E-2 투자 비자로 창업 가능. 한인 상공회의소 멘토링 활용. 초기 자본 $50K-$200K"
                 : "Korean small business near community: Korean food, beauty, real estate, insurance. E-2 investor visa for startup. Korean Chamber mentoring. Capital $50K-$200K", tags: ["자영업","창업","E-2"] },
    ],
    visa: [
      { emoji: "💼", name: ko ? "취업 비자 기본 안내" : "Work Visa Basics",
        desc: ko ? "• H-1B: 전문직 스폰서 필요\n• L-1: 사내 이동 (한국→미국)\n• OPT/STEM OPT: 유학 후 1-3년\n• EB-2/EB-3: 취업 영주권\n• E-2: 한국인 투자 비자"
                 : "• H-1B: Specialty occupation, needs sponsor\n• L-1: Intracompany transfer Korea→US\n• OPT/STEM OPT: 1-3 years post-study\n• EB-2/EB-3: Employment green card\n• E-2: Korean investor visa", tags: ["H-1B","비자","영주권"] },
      { emoji: "💡", name: ko ? "한인 취업 네트워크" : "Korean Job Networks",
        desc: ko ? "• 한인 상공회의소 지역 지부\n• LinkedIn 한인 그룹 검색\n• 한인 교회 취업 소그룹\n• 211 전화 → 취업 서비스 연결"
                 : "• Local Korean Chamber of Commerce\n• Search Korean groups on LinkedIn\n• Korean church job small groups\n• Dial 211 for employment services", tags: ["네트워크","취업","커뮤니티"] },
    ],
  };

  return DATA[slug] ?? generic;
}

function JobsScreen({ onHome }: { onHome?: () => void }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const city = useCityConfig();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["빅테크", "의료·항공", "자영업", "비자·네트워크"]
    : ["Big Tech", "Healthcare & Aerospace", "Small Biz", "Visa & Network"];
  const accent = "#FBBF24";

  const defaultJobs = [
    { emoji: "☁️", name: "Amazon", nameEn: "Amazon — Largest Seattle Employer",
      desc: lang === "ko"
        ? "✅ 시애틀 최대 고용주. South Lake Union 본사. SDE·PM·데이터사이언티스트·운영직. AWS 글로벌 본부. 한인 직원 수천 명. L3-L7 레벨. 연봉 $120K-$350K+ | 🔗 amazon.jobs"
        : "✅ Seattle's largest employer. SLU HQ. SDE, PM, data scientist, operations. AWS global HQ. Thousands of Korean employees. L3-L7 levels. Salary $120K-$350K+ | 🔗 amazon.jobs",
      tags: ["빅테크", "SDE", "H-1B"] },
    { emoji: "🖥️", name: "Microsoft", nameEn: "Microsoft — Redmond HQ",
      desc: lang === "ko"
        ? "✅ 레드몬드 본사. Azure·Office·Xbox·Copilot. 한인 엔지니어 매우 많음. H-1B 스폰서 적극적. 연봉 $130K-$380K+ | 🔗 careers.microsoft.com"
        : "✅ Redmond HQ. Azure, Office, Xbox, Copilot. Large Korean engineer community. Active H-1B sponsor. Salary $130K-$380K+ | 🔗 careers.microsoft.com",
      tags: ["빅테크", "레드몬드", "비자지원"] },
    { emoji: "🔍", name: "Google Seattle", nameEn: "Google — Kirkland & Seattle",
      desc: lang === "ko"
        ? "커클랜드·시애틀 캠퍼스. YouTube·검색·지도·AI. 최상위 보상 패키지. 경쟁 치열 | 🔗 careers.google.com"
        : "Kirkland & Seattle campuses. YouTube, Search, Maps, AI. Top-tier compensation. Very competitive | 🔗 careers.google.com",
      tags: ["빅테크", "커클랜드", "AI"] },
  ];

  const healthAerospace = [
    { emoji: "✈️", name: "Boeing", nameEn: "Boeing — Aerospace",
      desc: lang === "ko"
        ? "에버렛·렌톤 위치. 에어로스페이스 엔지니어링. 기계·항공·전기 엔지니어 수요. 보안 허가 필요 | 🔗 boeing.com/careers"
        : "Everett & Renton locations. Aerospace engineering. Mechanical, aero & electrical engineers needed. Security clearance required | 🔗 boeing.com/careers",
      tags: ["항공", "엔지니어링", "에버렛"] },
    { emoji: "🏥", name: "의료·바이오 취업", nameEn: "Healthcare & Biotech Jobs",
      desc: lang === "ko"
        ? "UW Medicine·Swedish·Kaiser·Virginia Mason. 간호사·의사·연구직. 워싱턴주 간호사 부족 → 비교적 취업 용이. 의료 비자 경로 있음 | 🔗 careers.uwmedicine.org"
        : "UW Medicine, Swedish, Kaiser, Virginia Mason. Nurses, doctors, researchers. WA nurse shortage → easier hiring. Medical visa pathways available | 🔗 careers.uwmedicine.org",
      tags: ["의료", "간호사", "바이오"] },
  ];

  const smallBiz = [
    { emoji: "🍽️", name: "한인 자영업 가이드", nameEn: "Korean Small Business Guide",
      desc: lang === "ko"
        ? "린우드·페더럴웨이 중심. 진입 가능 업종: 한식당·BBQ·치킨, 미용실·네일, 세탁소, 편의점, 한인 부동산·보험, 한국 식품 유통. 초기 자본 $50K-$150K. 한인 상공회의소 멘토링 활용 | 🔗 kachamber.com"
        : "Lynnwood & Federal Way. Entry-possible: Korean restaurants, hair/nail salons, dry cleaning, convenience stores, real estate, insurance, food import. Capital $50K-$150K. Korean Chamber mentoring | 🔗 kachamber.com",
      tags: ["자영업", "창업", "린우드"] },
  ];

  const visaNetwork = [
    { emoji: "💼", name: "취업 비자 안내", nameEn: "Work Visa Guide",
      desc: lang === "ko"
        ? "• H-1B: 전문직. 스폰서 필요. 연 1회 추첨. Amazon·MS 적극 지원\n• L-1: 사내 이동 (한국 → 미국)\n• OPT/STEM OPT: 졸업 후 1-3년\n• EB-2/EB-3: 취업 영주권\n• E-2: 투자 비자 (자영업 창업)"
        : "• H-1B: Specialty occupation, needs sponsor, annual lottery\n• L-1: Intracompany transfer (Korea → US)\n• OPT/STEM OPT: 1-3 years post-grad\n• EB-2/EB-3: Employment-based green card\n• E-2: Investment visa (self-employment)",
      tags: ["H-1B", "비자", "영주권"] },
    { emoji: "💡", name: "한인 취업 네트워크", nameEn: "Korean Job Networks",
      desc: lang === "ko"
        ? "• KAA (Korean American Association) — Amazon 내 한인 네트워크\n• KABA — 비즈니스 네트워크\n• UW·시애틀U 한인 동문 네트워크\n• LinkedIn 프로필 최적화 필수 🔗 linkedin.com\n• LeetCode 코딩 인터뷰 준비 (빅테크) 🔗 leetcode.com\n• 교회 소그룹 — 의외로 강력한 채용 연결"
        : "• KAA — Korean network inside Amazon\n• KABA — Business network\n• UW/Seattle U Korean alumni\n• LinkedIn profile optimization essential 🔗 linkedin.com\n• LeetCode coding interview prep (Big Tech) 🔗 leetcode.com\n• Church small groups — powerful job connections",
      tags: ["네트워크", "LinkedIn", "KAA"] },
  ];

  // 도시별 취업 데이터 적용
  const cityJobData = getCityJobData(city.slug, lang);
  const allJobs = serverContent["jobs"] ? resolvePlaceItems(serverContent["jobs"], lang) : null;
  const subData = allJobs
    ? [allJobs.slice(0, 3), allJobs.slice(3, 5), allJobs.slice(5, 6), allJobs.slice(6)]
    : [cityJobData.main, cityJobData.sector, cityJobData.biz, cityJobData.visa];
  const content = subData[sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="💼" titleKo="취업 가이드" titleEn="Jobs & Career"
        descKo={`${useCityConfig().nameKo} 한인 취업·창업·비자 완전 가이드`}
        descEn={`Complete guide to jobs, business & visas for Koreans in ${useCityConfig().nameEn}`}
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
        </div>
        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 10 }}>
            💼 {lang === "ko" ? "취업 바로 연결" : "Job Resources"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {/* 시애틀 전용: 카카오챗 + WorkSource WA */}
            {city.slug === "seattle" && (<>
            <a href="https://open.kakao.com/o/search/%EC%8B%9C%EC%95%A0%ED%8B%80%ED%95%9C%EC%9D%B8" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(251,191,36,0.2)" }}>
              <span style={{ fontSize: 16 }}>💬</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                  {lang === "ko" ? "카카오오픈채팅 '시애틀한인'" : "KakaoTalk '시애틀한인'"}
                </div>
                <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "취업 정보·추천 실시간 공유" : "Live job info & referrals"}</div>
              </div>
              <span style={{ color: accent, fontSize: 14 }}>→</span>
            </a>
            <a href="https://worksourcewa.com/" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(251,191,36,0.2)" }}>
              <span style={{ fontSize: 16 }}>🏢</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>WorkSource WA</div>
                <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "무료 이력서·면접 코칭" : "Free resume & interview coaching"}</div>
              </div>
              <span style={{ color: accent, fontSize: 14 }}>→</span>
            </a>
            </>)}
            {/* 전 도시 공통: LinkedIn + Indeed */}
            <a href={`https://www.linkedin.com/jobs/search/?keywords=Korean&location=${encodeURIComponent(city.nameEn)}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(251,191,36,0.2)" }}>
              <span style={{ fontSize: 16 }}>💼</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>LinkedIn Jobs — {city.nameEn}</div>
                <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? `${city.nameKo} 한인 취업 공고` : `${city.nameEn} Korean job listings`}</div>
              </div>
              <span style={{ color: accent, fontSize: 14 }}>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 8: 교육 SCREEN
───────────────────────────────────────── */
// 도시별 학군 데이터 (Niche.com 기준, 2025-2026)
function getCityDistrictData(slug: string, lang: string) {
  const ko = lang === "ko";
  const DATA: Record<string, any[]> = {
    dallas: [
      { emoji: "⭐", name: "Plano ISD", nameEn: "Plano ISD — TX Top",
        desc: ko ? "✅ 텍사스 상위 1% 학군 (Niche A+). 한인 학생 비율 높음. 졸업률 97%. AP·IB 과정 풍부. 달라스 북부 최고 학군.\n📍 플레이노·앨런·프리스코 인근 | 🔗 pisd.edu"
                 : "✅ TX Top 1% (Niche A+). High Korean student ratio. 97% grad rate. Rich AP/IB programs. Best district north of Dallas.\n📍 Plano, Allen, Frisco area | 🔗 pisd.edu", tags: ["플레이노","A+","텍사스"] },
      { emoji: "⭐", name: "Frisco ISD", nameEn: "Frisco ISD — Fastest Growing",
        desc: ko ? "✅ 텍사스 최고 성장 학군 (Niche A+). 신설 학교 다수. STEM 특화. 한인 가족 최다 유입 지역. 달라스 북부.\n📍 프리스코·맥키니 | 🔗 friscoisd.org"
                 : "✅ TX's fastest-growing top district (Niche A+). Many new schools. STEM focus. Highest Korean family influx. North Dallas.\n📍 Frisco, McKinney | 🔗 friscoisd.org", tags: ["프리스코","성장","STEM"] },
      { emoji: "⭐", name: "Lewisville ISD / Carrollton-Farmers Branch ISD", nameEn: "CFBISD — Koreatown District",
        desc: ko ? "✅ 캐롤튼 코리아타운 관할 학군. 한인 학생 비율 최고. Korean Immersion 프로그램 운영. Niche A-.\n📍 캐롤튼·파머스브랜치 | 🔗 cfbisd.edu"
                 : "✅ Covers Carrollton Koreatown. Highest Korean student ratio. Korean Immersion program available. Niche A-.\n📍 Carrollton, Farmers Branch | 🔗 cfbisd.edu", tags: ["캐롤튼","코리아타운","한국어"] },
      { emoji: "🏫", name: "Richardson ISD", nameEn: "Richardson ISD — 다양성",
        desc: ko ? "Niche A. 달라스 동북부. 다문화 환경. J.J. Pearce HS 명문. 한인 가족 증가 추세. 주거비 대비 학군 가성비 좋음.\n📍 리차드슨·갈랜드 | 🔗 risd.org"
                 : "Niche A. NE Dallas. Diverse community. J.J. Pearce HS prestigious. Growing Korean families. Good value vs rent.\n📍 Richardson, Garland | 🔗 risd.org", tags: ["리차드슨","다양성","가성비"] },
    ],
    la: [
      { emoji: "⭐", name: "Cerritos / ABC USD", nameEn: "ABC Unified — Cerritos",
        desc: ko ? "✅ 한인 최다 거주 LA 남부 학군 (Niche A+). Cerritos HS·Whitney HS 전국 명문. SAT 평균 1350+. 한인 학생 30%+.\n📍 세리토스·아르테시아·레이크우드 | 🔗 abcusd.us"
                 : "✅ Top LA south district with highest Korean population (Niche A+). Cerritos & Whitney HS nationally ranked. SAT avg 1350+. 30%+ Korean students.\n📍 Cerritos, Artesia, Lakewood | 🔗 abcusd.us", tags: ["세리토스","한인밀집","A+"] },
      { emoji: "⭐", name: "Torrance USD", nameEn: "Torrance USD — 남가주 명문",
        desc: ko ? "✅ Niche A+. 토랜스·파로스버디스. West HS·South HS·North HS. 한인 가족 많음. LA 해변 인근 학군.\n📍 토랜스·레돈도비치 | 🔗 torrance.k12.ca.us"
                 : "✅ Niche A+. Torrance, Palos Verdes area. West/South/North HS. Many Korean families. Near LA beaches.\n📍 Torrance, Redondo Beach | 🔗 torrance.k12.ca.us", tags: ["토랜스","해변","한인"] },
      { emoji: "⭐", name: "Diamond Bar / Walnut Valley USD", nameEn: "Walnut Valley USD",
        desc: ko ? "✅ 다이아몬드바 소재. Diamond Bar HS (전국 상위 3%). 한인·중국계 밀집. Niche A+. UC 진학률 매우 높음.\n📍 다이아몬드바·월넛 | 🔗 wvusd.k12.ca.us"
                 : "✅ Diamond Bar. Diamond Bar HS (top 3% nationally). Dense Korean & Chinese population. Niche A+. Very high UC admission rate.\n📍 Diamond Bar, Walnut | 🔗 wvusd.k12.ca.us", tags: ["다이아몬드바","UC진학","A+"] },
    ],
    newyork: [
      { emoji: "⭐", name: "Fort Lee School District (NJ)", nameEn: "Fort Lee — #1 Korean NJ",
        desc: ko ? "✅ NJ 포트리. 한인 학생 최고 비율. 포트리 HS 전국 상위 1%. Niche A+. 직접 학교 등록 가능.\n📍 포트리·NJ | 🔗 fortlee.k12.nj.us"
                 : "✅ Fort Lee NJ. Highest Korean student ratio in NJ. Fort Lee HS top 1% nationally. Niche A+. Direct enrollment available.\n📍 Fort Lee, NJ | 🔗 fortlee.k12.nj.us", tags: ["포트리","NJ","한인밀집"] },
      { emoji: "⭐", name: "Palisades Park School District (NJ)", nameEn: "Palisades Park — Korean Community",
        desc: ko ? "✅ NJ 팰리세이즈파크. 한인 인구 75%+. 소규모 학군 (학생 수 적어 밀착 교육). 커뮤니티 매우 강함.\n📍 팰리세이즈파크·NJ | 🔗 ppsd.org"
                 : "✅ Palisades Park NJ. 75%+ Korean population. Small district = personalized education. Very strong community.\n📍 Palisades Park, NJ | 🔗 ppsd.org", tags: ["팰리세이즈파크","한인75%","NJ"] },
      { emoji: "🏫", name: "Special High Schools — NYC (스타이브센트 등)", nameEn: "NYC Specialized HS",
        desc: ko ? "스타이브센트 HS·브롱스과학 HS·브루클린테크 HS. 입학시험(SHSAT) 필수. 한인 학생 강세. 무료 입학·최상위 대학 진학률.\n📍 뉴욕시 | 🔗 schools.nyc.gov/enrollment/high-school"
                 : "Stuyvesant, Bronx Science, Brooklyn Tech. SHSAT exam required. Korean students excel. Free + top college placement rates.\n📍 New York City | 🔗 schools.nyc.gov/enrollment/high-school", tags: ["스타이브센트","SHSAT","공립명문"] },
    ],
    houston: [
      { emoji: "⭐", name: "Fort Bend ISD", nameEn: "Fort Bend ISD — Sugar Land",
        desc: ko ? "✅ Sugar Land 관할. 텍사스 최다양성 학군 (Niche A+). 한인 학생 비율 높음. 졸업률 97%. 아시안 학생 35%+.\n📍 슈거랜드·미주리시티·포트벤드카운티 | 🔗 fortbendisd.com"
                 : "✅ Covers Sugar Land. TX's most diverse top district (Niche A+). High Korean student ratio. 97% grad rate. 35%+ Asian students.\n📍 Sugar Land, Missouri City | 🔗 fortbendisd.com", tags: ["슈거랜드","다양성","A+"] },
      { emoji: "⭐", name: "Katy ISD", nameEn: "Katy ISD — 서부 휴스턴",
        desc: ko ? "✅ 휴스턴 서부. Niche A+. 졸업률 97.5%. Seven Lakes HS·Cinco Ranch HS 명문. 한인 가족 유입 증가.\n📍 케이티·에너지코리도 서부 | 🔗 katyisd.org"
                 : "✅ West Houston. Niche A+. 97.5% grad rate. Seven Lakes & Cinco Ranch HS. Growing Korean family influx.\n📍 Katy, west Energy Corridor | 🔗 katyisd.org", tags: ["케이티","서부휴스턴","A+"] },
    ],
    sf: [
      { emoji: "⭐", name: "Cupertino Union / Fremont Union HSD", nameEn: "Fremont Union — Cupertino",
        desc: ko ? "✅ 쿠퍼티노. Apple 본사 학군. Lynbrook HS·Monta Vista HS 전국 상위 1%. 한인·중국계 밀집. Niche A+.\n📍 쿠퍼티노·새너제이 서부 | 🔗 fuhsd.org"
                 : "✅ Cupertino. Apple HQ school district. Lynbrook & Monta Vista HS top 1% nationally. Korean & Chinese dense. Niche A+.\n📍 Cupertino, west San Jose | 🔗 fuhsd.org", tags: ["쿠퍼티노","Apple","A+"] },
      { emoji: "⭐", name: "Palo Alto USD", nameEn: "Palo Alto USD — Stanford Neighbor",
        desc: ko ? "✅ 스탠포드 인근. Palo Alto HS·Gunn HS 전국 명문. Niche A+. 주거비 극히 높음 → 접근 어려움.\n📍 팔로알토·알로스알토스 | 🔗 pausd.org"
                 : "✅ Near Stanford. Palo Alto & Gunn HS nationally elite. Niche A+. Extremely high housing costs → difficult access.\n📍 Palo Alto, Los Altos | 🔗 pausd.org", tags: ["팔로알토","스탠포드","A+"] },
    ],
    toronto: [
      { emoji: "⭐", name: "York Region District School Board", nameEn: "York Region DSB — Markham",
        desc: ko ? "✅ 마크햄·리치몬드힐 관할. 캐나다 최고 수준 학군 중 하나. 한인·중국계 밀집. Ontario A+ 수준. 졸업률 95%+.\n📍 마크햄·리치몬드힐·손힐 | 🔗 yrdsb.ca"
                 : "✅ Covers Markham, Richmond Hill. One of Canada's top districts. Dense Korean & Chinese community. Ontario A+ level.\n📍 Markham, Richmond Hill, Thornhill | 🔗 yrdsb.ca", tags: ["마크햄","한인밀집","캐나다"] },
      { emoji: "⭐", name: "Toronto Catholic/Public DSB — North York", nameEn: "TDSB North York — Korean Hub",
        desc: ko ? "✅ 노스욕(North York) 관할. 한인 교회·상권 밀집 지역. 한국어 Heritage Language 프로그램 운영.\n📍 노스욕·실버링 | 🔗 tdsb.on.ca"
                 : "✅ North York — Korean church & business hub. Korean Heritage Language program available.\n📍 North York, Silverring | 🔗 tdsb.on.ca", tags: ["노스욕","한국어Heritage","토론토"] },
    ],
    vancouver: [
      { emoji: "⭐", name: "Coquitlam School District 43", nameEn: "SD43 Coquitlam — Korean Hub",
        desc: ko ? "✅ 코퀴틀람 관할. 한인 밀집 최고 지역. 학교 수준 우수. BC 주 상위 학군. 한인 학부모 네트워크 강함.\n📍 코퀴틀람·포트무디·포트코퀴틀람 | 🔗 sd43.bc.ca"
                 : "✅ Coquitlam — highest Korean density. Excellent schools. Top BC district. Strong Korean parent network.\n📍 Coquitlam, Port Moody, Port Coquitlam | 🔗 sd43.bc.ca", tags: ["코퀴틀람","한인밀집","BC"] },
      { emoji: "⭐", name: "Burnaby School District 41", nameEn: "SD41 Burnaby — UBC Neighbor",
        desc: ko ? "✅ 버나비 관할. UBC 인근. Burnaby North HS·Burnaby Mountain HS. 한인·중국계 혼합. 아시안 친화적 환경.\n📍 버나비·밴쿠버 동부 | 🔗 burnabyschools.ca"
                 : "✅ Burnaby near UBC. Burnaby North & Mountain HS. Korean & Chinese mixed. Asian-friendly environment.\n📍 Burnaby, east Vancouver | 🔗 burnabyschools.ca", tags: ["버나비","UBC","아시안"] },
    ],
    // ── 추가 6개 도시 학군 ──────────────────────────────────────
    atlanta: [
      { emoji: "⭐", name: "Gwinnett County Public Schools", nameEn: "GCPS — Duluth/Suwanee",
        desc: ko ? "✅ 귀넷카운티. GA 최대 학군·한인 밀집. Niche A. Duluth HS·Peachtree Ridge HS. 한인 학생 비율 높음.\n📍 둘루스·스와니·로렌스빌 | 🔗 gcpsk12.org"
                 : "✅ Gwinnett County. GA's largest. Niche A. Duluth HS, Peachtree Ridge HS. High Korean student ratio.\n📍 Duluth, Suwanee, Lawrenceville | 🔗 gcpsk12.org", tags: ["귀넷","둘루스","한인밀집"] },
      { emoji: "⭐", name: "Forsyth County Schools", nameEn: "Forsyth County — GA Top",
        desc: ko ? "✅ GA 최상위 학군 (Niche A+). 졸업률 97%. Lambert HS·South Forsyth HS.\n📍 커밍·볼그라운드 | 🔗 forsyth.k12.ga.us"
                 : "✅ GA's top district (Niche A+). 97% grad rate. Lambert HS, South Forsyth HS.\n📍 Cumming, Ball Ground | 🔗 forsyth.k12.ga.us", tags: ["포사이스","A+","GA"] },
      { emoji: "🏫", name: "Fulton County — Johns Creek", nameEn: "Fulton — North Atlanta",
        desc: ko ? "존스크릭·알파레타. Northview HS·Johns Creek HS 명문. 부유한 북부 애틀랜타.\n📍 존스크릭·알파레타 | 🔗 fultonschools.org"
                 : "Johns Creek, Alpharetta. Northview HS, Johns Creek HS prestigious. Affluent north Atlanta.\n📍 Johns Creek, Alpharetta | 🔗 fultonschools.org", tags: ["존스크릭","알파레타","풀턴"] },
    ],
    nashville: [
      { emoji: "⭐", name: "Williamson County Schools", nameEn: "Williamson County — TN #1",
        desc: ko ? "✅ TN 최상위 학군 (Niche A+). 졸업률 96%. Franklin·Brentwood. Brentwood HS·Franklin HS 전국 상위권.\n📍 프랭클린·브렌트우드·쿨스프링스 | 🔗 wcs.edu"
                 : "✅ TN's top district (Niche A+). 96% grad rate. Brentwood HS, Franklin HS nationally ranked.\n📍 Franklin, Brentwood, Cool Springs | 🔗 wcs.edu", tags: ["윌리엄슨","TN1위","A+"] },
      { emoji: "🏫", name: "Rutherford County Schools", nameEn: "Rutherford — Murfreesboro",
        desc: ko ? "머프리즈버로·스미르나. 내쉬빌 외곽 성장 학군. Niche B+. 렌트 저렴. MTSU 인근.\n📍 머프리즈버로·라 베르그네 | 🔗 rcschools.net"
                 : "Murfreesboro, Smyrna. Growing Nashville suburb. Niche B+. Affordable rent. Near MTSU.\n📍 Murfreesboro, La Vergne | 🔗 rcschools.net", tags: ["러더포드","머프리즈버로","저렴"] },
    ],
    boston: [
      { emoji: "⭐", name: "Newton Public Schools", nameEn: "Newton — MA #1",
        desc: ko ? "✅ MA 최상위 학군 (Niche A+). Newton North HS·South HS 전국 Top 50. 한인 가족 유입. IB·AP 풍부.\n📍 뉴턴 전역 | 🔗 newtonma.gov/school"
                 : "✅ MA's top district (Niche A+). Newton North & South HS top 50 nationally. Korean family influx. Rich IB/AP.\n📍 Newton (citywide) | 🔗 newtonma.gov/school", tags: ["뉴턴","MA1위","A+"] },
      { emoji: "⭐", name: "Lexington Public Schools", nameEn: "Lexington — MA Top 3",
        desc: ko ? "✅ Niche A+. 렉싱턴 HS 전국 상위 1%. 아시안 학생 30%+. MIT·하버드 진학률 높음.\n📍 렉싱턴 전역 | 🔗 lexingtonma.org/schools"
                 : "✅ Niche A+. Lexington HS top 1% nationally. 30%+ Asian students. High MIT/Harvard placement.\n📍 Lexington | 🔗 lexingtonma.org/schools", tags: ["렉싱턴","MIT","아시안30%"] },
      { emoji: "🏫", name: "Quincy Public Schools", nameEn: "Quincy — Affordable Boston",
        desc: ko ? "퀸시. 보스턴 남쪽 20분. 한인·아시안 커뮤니티. 렌트 저렴. 지하철(레드라인) 통근. Niche B+.\n📍 퀸시 전역 | 🔗 quincypublicschools.com"
                 : "Quincy. 20min south of Boston. Korean/Asian community. Affordable rent. Red Line subway. Niche B+.\n📍 Quincy | 🔗 quincypublicschools.com", tags: ["퀸시","레드라인","저렴"] },
    ],
    philadelphia: [
      { emoji: "⭐", name: "Lower Merion School District", nameEn: "Lower Merion — PA #1",
        desc: ko ? "✅ PA 최상위 학군 (Niche A+). 아이비리그 진학률 최상. 한인 전문직 가족 선호.\n📍 아르드모어·발라신우드·하버포드 | 🔗 lmsd.org"
                 : "✅ PA's top district (Niche A+). Top Ivy League placement. Korean professional families prefer.\n📍 Ardmore, Bala Cynwyd, Haverford | 🔗 lmsd.org", tags: ["Lower Merion","PA1위","아이비리그"] },
      { emoji: "⭐", name: "Cherry Hill School District (NJ)", nameEn: "Cherry Hill — Affordable Top",
        desc: ko ? "✅ NJ 체리힐. Niche A. 한인 커뮤니티 강함. Cherry Hill East·West HS. PA보다 렌트 저렴. PATCO 필라 직통.\n📍 체리힐·NJ | 🔗 chclc.org"
                 : "✅ Cherry Hill NJ. Niche A. Strong Korean community. Cherry Hill East/West HS. Cheaper than PA. PATCO direct to Philly.\n📍 Cherry Hill, NJ | 🔗 chclc.org", tags: ["체리힐","NJ","PATCO"] },
    ],
    kansascity: [
      { emoji: "⭐", name: "Shawnee Mission USD (KS)", nameEn: "Shawnee Mission — KS Top",
        desc: ko ? "✅ KS 최상위 학군 (Niche A). 오버랜드파크·리우드. Shawnee Mission East HS. 한인 가족 밀집 인근.\n📍 오버랜드파크·리우드·미션힐스 | 🔗 smsd.org"
                 : "✅ KS top district (Niche A). Overland Park & Leawood. Shawnee Mission East HS. Near Korean families.\n📍 Overland Park, Leawood | 🔗 smsd.org", tags: ["Shawnee Mission","오버랜드파크","KS"] },
      { emoji: "⭐", name: "Blue Valley USD (KS)", nameEn: "Blue Valley — KS #1",
        desc: ko ? "✅ KS 1위 학군 (Niche A+). 졸업률 98%. Blue Valley HS·Northwest HS. 오버랜드파크 남쪽.\n📍 오버랜드파크 남부·스틸웰 | 🔗 bluevalleyk12.org"
                 : "✅ KS #1 district (Niche A+). 98% grad rate. Blue Valley HS, Northwest HS. South Overland Park.\n📍 South Overland Park, Stilwell | 🔗 bluevalleyk12.org", tags: ["Blue Valley","KS1위","A+"] },
    ],
    miami: [
      { emoji: "⭐", name: "Coral Gables — Miami-Dade", nameEn: "Coral Gables — Top Miami",
        desc: ko ? "✅ 마이애미데이드 최상위. Coral Gables Senior HS (Niche A+). 한인·라틴 혼합 커뮤니티.\n📍 코랄게이블스 | 🔗 dadeschools.net"
                 : "✅ Miami-Dade top area. Coral Gables Senior HS (Niche A+). Korean-Latin mixed community.\n📍 Coral Gables | 🔗 dadeschools.net", tags: ["Coral Gables","A+","마이애미U"] },
      { emoji: "🏫", name: "Doral Area — Korean Hub", nameEn: "Doral — Korean Community",
        desc: ko ? "한인 밀집 도랄. 이중언어(한국어·스페인어) 환경. 마이애미 서쪽 교외. 렌트 합리적.\n📍 도랄·웨스트 마이애미 | 🔗 dadeschools.net"
                 : "Korean hub in Doral. Bilingual (Korean/Spanish) environment. Western Miami suburb. Reasonable rent.\n📍 Doral, West Miami | 🔗 dadeschools.net", tags: ["도랄","이중언어","스페인어"] },
      { emoji: "🏫", name: "Broward County — Fort Lauderdale", nameEn: "Broward County",
        desc: ko ? "마이애미 북쪽. 렌트 저렴. Tri-Rail 통근 가능. 성장하는 한인 커뮤니티.\n📍 포트로더데일·홀리우드·펨브로크 | 🔗 browardschools.com"
                 : "North of Miami. Lower rent. Tri-Rail commute. Growing Korean community.\n📍 Fort Lauderdale, Hollywood, Pembroke | 🔗 browardschools.com", tags: ["브로워드","포트로더데일","저렴"] },
    ],
    // ── 멕시코 3개 도시 — 멕시코 교육 시스템 안내 ──────────────
    mexicocity: [
      { emoji: "⭐", name: ko ? "코리안 스쿨 멕시코 (한국학교)" : "Korean School of Mexico",
        desc: ko ? "✅ 공식 확인 | 재멕시코 한국 교육원 산하 한국학교. 주재원 자녀·한인 2세 교육.\n📍 멕시코시티 폴랑코 인근\n✨ 한국어·한국 교육과정 + 현지 스페인어 교육 병행\n🔗 overseas.mofa.go.kr/mx-ko (대사관 → 교육정보)"
                 : "✅ Verified | Korean school under Korean Education Center Mexico. For expat children & 2nd gen Koreans.\n📍 Near Polanco, Mexico City\n✨ Korean curriculum + local Spanish education\n🔗 overseas.mofa.go.kr/mx-ko", tags: ["한국학교","폴랑코","주재원자녀"] },
      { emoji: "⭐", name: ko ? "The American School Foundation (ASF)" : "American School Foundation — Mexico City",
        desc: ko ? "✅ 1888년 설립. 외교관·주재원 자녀 선호 1순위. IB·AP 과정 운영. 영어·스페인어 이중언어.\n📍 Bondojito 215, Condesa, CDMX\n💡 비용: 연 USD $15,000-25,000 (주재원 법인 지원 多)\n🔗 asf.edu.mx"
                 : "✅ Est. 1888. #1 choice for diplomat/expat families. IB & AP programs. English-Spanish bilingual.\n📍 Bondojito 215, Condesa, CDMX\n💡 Tuition: USD $15,000-25,000/yr (often covered by employers)\n🔗 asf.edu.mx", tags: ["ASF","IB","영어교육"] },
      { emoji: "🏫", name: ko ? "멕시코 공립 교육 시스템 (SEP)" : "Mexico Public Schools (SEP System)",
        desc: ko ? "SEP(연방교육부) 관할 공립학교. 한인 장기 거주자·로컬 이민자에게 무상 제공.\n⚠️ 수업 100% 스페인어 — 스페인어 없으면 매우 어려움\n💡 초반 1-3개월: 개인 스페인어 튜터 병행 권장\n🔗 sep.gob.mx"
                 : "SEP (Federal Education Ministry) public schools. Free for long-term Korean residents.\n⚠️ All classes in Spanish — very difficult without Spanish\n💡 First 1-3 months: private Spanish tutor recommended alongside\n🔗 sep.gob.mx", tags: ["SEP","공립","스페인어"] },
    ],
    guadalajara: [
      { emoji: "⭐", name: ko ? "American School Foundation of Guadalajara" : "American School — Guadalajara (ASFG)",
        desc: ko ? "✅ 공식 사이트 확인 | 과달라하라 외국인 자녀 1순위 국제학교. IB·AP 과정. 영어·스페인어 이중언어.\n📍 Colomos 2100, Providencia, Guadalajara\n💡 비용: 연 USD $12,000-20,000\n🔗 asfg.edu.mx"
                 : "✅ Verified | #1 international school for expat children in Guadalajara. IB & AP programs. English-Spanish bilingual.\n📍 Colomos 2100, Providencia, Guadalajara\n💡 Tuition: USD $12,000-20,000/yr\n🔗 asfg.edu.mx", tags: ["ASFG","IB","국제학교"] },
      { emoji: "⭐", name: ko ? "한국학교·한글학교 (과달라하라)" : "Korean Language School — Guadalajara",
        desc: ko ? "재멕시코 한국 교육원 연계 한글학교. 주말 한국어 수업 (토요일).\n📍 과달라하라 한인회 연락 → 위치 확인\n✨ 주재원 자녀 한국어 유지·한국 교육과정 보완\n🔗 멕시코시티 대사관: overseas.mofa.go.kr/mx-ko"
                 : "Korean Language School linked with Korean Education Center Mexico. Weekend Korean classes (Saturdays).\n📍 Contact Guadalajara Korean Association for location\n✨ Maintains Korean language for expat children\n🔗 Korean Embassy Mexico: overseas.mofa.go.kr/mx-ko", tags: ["한글학교","한국어","주재원자녀"] },
      { emoji: "🏫", name: ko ? "ITESO·UdeG — 명문 사립·공립대학" : "ITESO & UdeG — Top Universities",
        desc: ko ? "ITESO (이에수이타 계열, 명문 사립) & 과달라하라 국립대(UdeG, 멕시코 3위).\n✨ 스페인어 유창 시 입학 가능. 학비 저렴 (UdeG 공립 연 $200 수준).\n💡 한인 유학생·장기 거주자 대학 옵션\n🔗 iteso.mx | udg.mx"
                 : "ITESO (Jesuit private, prestigious) & Univ. of Guadalajara (UdeG, Mexico's #3).\n✨ Admission with Spanish fluency. Low tuition (UdeG public: ~$200/yr).\n💡 Good university option for Korean long-term residents\n🔗 iteso.mx | udg.mx", tags: ["ITESO","UdeG","대학교"] },
    ],
    monterrey: [
      { emoji: "⭐", name: ko ? "The American School of Monterrey (ASM)" : "American School of Monterrey (ASM)",
        desc: ko ? "✅ 공식 사이트 확인 | 몬테레이 외국인 자녀 1순위 국제학교. IB·AP. 한인 주재원 자녀 다수.\n📍 Alfonso Reyes 4111, Monterrey NL\n💡 비용: 연 USD $12,000-22,000 (현대·기아 등 법인 지원)\n🔗 asm.edu.mx"
                 : "✅ Verified | #1 international school for expat children in Monterrey. IB & AP. Many Korean expat children.\n📍 Alfonso Reyes 4111, Monterrey NL\n💡 Tuition: USD $12,000-22,000/yr (Hyundai, Kia etc. often cover)\n🔗 asm.edu.mx", tags: ["ASM","IB","국제학교"] },
      { emoji: "⭐", name: ko ? "한국학교·한글학교 (몬테레이)" : "Korean Language School — Monterrey",
        desc: ko ? "재멕시코 한국 교육원 연계 한글학교. 주말 한국어 수업.\n📍 몬테레이 한인회 연락 → 위치 확인\n✨ 현대·기아·POSCO 주재원 자녀 한국어 유지\n🔗 멕시코시티 대사관: overseas.mofa.go.kr/mx-ko"
                 : "Korean Language School linked with Korean Education Center Mexico. Weekend Korean classes.\n📍 Contact Monterrey Korean Association for location\n✨ Korean language maintenance for Hyundai/Kia/POSCO expat children\n🔗 Korean Embassy Mexico: overseas.mofa.go.kr/mx-ko", tags: ["한글학교","한국어","주재원자녀"] },
      { emoji: "🏫", name: ko ? "ITESM (테크 드 몬테레이) — 멕시코 최상위 명문대" : "Tec de Monterrey — Mexico's Top Private University",
        desc: ko ? "✅ 멕시코 사립 1위 (ITESM). 몬테레이 본교. 공학·경영 세계적 수준. 영어 트랙 과정.\n📍 Av. Eugenio Garza Sada 2501, Monterrey\n💡 학비: 연 USD $8,000-15,000 (멕시코 사립 기준 비쌈)\n🔗 tec.mx"
                 : "✅ Mexico's #1 private university (ITESM). Monterrey main campus. World-class engineering & business. English-track programs available.\n📍 Av. Eugenio Garza Sada 2501, Monterrey\n💡 Tuition: USD $8,000-15,000/yr\n🔗 tec.mx", tags: ["Tec de Monterrey","명문대","공학"] },
    ],
  };
  return DATA[slug] ?? [
    { emoji: "🏫", name: ko ? `${slug} 지역 학군 안내` : `${slug} School Districts`,
      desc: ko ? "Niche.com에서 지역 학군 순위 확인. 한인 커뮤니티에 추천 학군 문의. 211 전화 → 교육 서비스 연결."
               : "Check district rankings at Niche.com. Ask Korean community for recommendations. Dial 211 for education services.",
      tags: ["학군","Niche","211"] },
  ];
}

/* ─────────────────────────────────────────
   도시별 교육 데이터 — CC·대학·ESL·한국학교
───────────────────────────────────────── */
function getCityCC(slug: string, lang: string) {
  const ko = lang === "ko";
  type Item = { emoji: string; name: string; nameEn?: string; desc: string; tags: string[] };
  const D: Record<string, Item[]> = {
    seattle: [
      { emoji: "🏛️", name: "Edmonds College", nameEn: "Edmonds College — 린우드 (한인 추천 #1)",
        desc: ko ? "✅ 린우드 소재. 4년제 편입 최적. UW·WSU 편입률 높음. ESL 풍부. 학비 ~$4,500/학기.\n📍 20000 68th Ave W, Lynnwood | 🔗 edcc.edu"
                 : "✅ Lynnwood — Korean community hub. Best CC for UW transfer. Rich ESL programs. Tuition ~$4,500/semester.\n📍 20000 68th Ave W, Lynnwood | 🔗 edcc.edu",
        tags: ["린우드","편입","한인#1"] },
      { emoji: "🏛️", name: "Bellevue College", nameEn: "Bellevue College — 벨뷰",
        desc: ko ? "✅ WA 최대 CC. 4년제 학사 직접 수여 가능. IT·회계·간호 특화. 아시안 35%+.\n📍 3000 Landerholm Cir SE, Bellevue | 🔗 bellevuecollege.edu"
                 : "✅ WA's largest CC. Can award bachelor's directly. IT, accounting, nursing. 35%+ Asian students.\n📍 3000 Landerholm Cir SE, Bellevue | 🔗 bellevuecollege.edu",
        tags: ["벨뷰","4년제학위","최대규모"] },
      { emoji: "🏛️", name: "Cascadia College", nameEn: "Cascadia — 보텔 (UW Bothell 인접)",
        desc: ko ? "✅ UW Bothell 편입 보장 프로그램. 이공계·비즈니스. 학비 ~$4,000/학기.\n📍 18345 Campus Way NE, Bothell | 🔗 cascadia.edu"
                 : "✅ Guaranteed UW Bothell transfer pathway. STEM & business. ~$4,000/semester.\n📍 18345 Campus Way NE, Bothell | 🔗 cascadia.edu",
        tags: ["보텔","UW편입보장","이공계"] },
    ],
    dallas: [
      { emoji: "🏛️", name: "Collin College (CC of Collin County)", nameEn: "Collin College — 프리스코·앨런",
        desc: ko ? "✅ 달라스 북부 한인 밀집 지역 소재. 4년제 편입 최적. 학비 ~$3,200/학기 (TX 주민). 한인 학생 다수. STEM·비즈니스 강점.\n📍 프리스코·매키니·앨런 캠퍼스 | 🔗 collin.edu"
                 : "✅ In Korean-dense north Dallas area. Best for 4-year transfer. Tuition ~$3,200/semester (TX resident). Many Korean students. Strong STEM & business.\n📍 Frisco, McKinney, Allen campuses | 🔗 collin.edu",
        tags: ["프리스코","앨런","편입"] },
      { emoji: "🏛️", name: "Brookhaven College (DCCCD)", nameEn: "Brookhaven College — 캐롤튼·파머스브랜치",
        desc: ko ? "✅ 캐롤튼 한인타운 인근 CC. 달라스 카운티 커뮤니티 칼리지. ESL 프로그램 우수. 학비 ~$2,800/학기.\n📍 3939 Valley View Ln, Farmers Branch TX | 🔗 brookhavencollege.edu"
                 : "✅ Near Carrollton Koreatown. Dallas County Community College. Strong ESL program. Tuition ~$2,800/semester.\n📍 3939 Valley View Ln, Farmers Branch TX | 🔗 brookhavencollege.edu",
        tags: ["캐롤튼","ESL","달라스"] },
      { emoji: "💡", name: ko ? "텍사스 이중학점제 (Dual Credit)" : "Texas Dual Credit Program",
        desc: ko ? "✅ 텍사스 공립 고교생 CC 수업 무료 이중 학점 취득 가능 (WA Running Start 유사).\n• 고교 11-12학년 대상 · 완전 무료\n• Collin College, Brookhaven 참여\n🔗 tea.texas.gov/dual-credit"
                 : "✅ TX public HS students can take CC courses for free (similar to WA Running Start).\n• For grades 11-12 · Completely free\n• Collin College, Brookhaven participating\n🔗 tea.texas.gov/dual-credit",
        tags: ["이중학점","무료","11-12학년"] },
    ],
    sf: [
      { emoji: "🏛️", name: "De Anza College", nameEn: "De Anza College — 쿠퍼티노 (한인 추천 #1)",
        desc: ko ? "✅ 쿠퍼티노 소재. 베이에리어 최고 CC. UC 편입률 전국 1위. 한인·중국계 밀집. 학비 ~$46/학점 (CA 주민). CS·엔지니어링 편입 강점.\n📍 21250 Stevens Creek Blvd, Cupertino | 🔗 deanza.edu"
                 : "✅ Cupertino. Bay Area's top CC. #1 UC transfer rate nationally. Dense Korean & Chinese community. ~$46/unit (CA resident). Strong CS & engineering transfer.\n📍 21250 Stevens Creek Blvd, Cupertino | 🔗 deanza.edu",
        tags: ["쿠퍼티노","UC편입#1","CS"] },
      { emoji: "🏛️", name: "Foothill College", nameEn: "Foothill College — 로스알토스힐스",
        desc: ko ? "✅ De Anza 자매 학교. 의료·치과·의료기기 특화. UC·스탠포드 편입 경로. 학비 ~$46/학점.\n📍 12345 El Monte Rd, Los Altos Hills | 🔗 foothill.edu"
                 : "✅ De Anza sister school. Specialized medical, dental & medical device programs. UC/Stanford transfer pathway. ~$46/unit.\n📍 12345 El Monte Rd, Los Altos Hills | 🔗 foothill.edu",
        tags: ["로스알토스","의료","스탠포드편입"] },
      { emoji: "💡", name: ko ? "CA IGETC — UC 편입 보장 과정" : "CA IGETC — Guaranteed UC Transfer",
        desc: ko ? "✅ IGETC(Intersegmental General Education Transfer Curriculum) 이수 시 UC 편입 보장.\n• De Anza·Foothill 모두 IGETC 과목 제공\n• GPA 3.0+ 유지 + 전공 과목 완료 시 UC 보장\n🔗 assist.org (편입 과목 확인)"
                 : "✅ Complete IGETC for guaranteed UC transfer.\n• De Anza & Foothill both offer IGETC courses\n• Maintain GPA 3.0+ + complete major prereqs for UC guarantee\n🔗 assist.org (check transfer courses)",
        tags: ["IGETC","UC편입보장","GPA3.0"] },
    ],
    la: [
      { emoji: "🏛️", name: "Santa Monica College (SMC)", nameEn: "Santa Monica College — UCLA 편입 #1",
        desc: ko ? "✅ UCLA 편입생 가장 많이 배출하는 CC. 학비 ~$46/학점 (CA 주민). 미디어·영화·비즈니스 강점. 코리아타운 30분. 한인 학생 다수.\n📍 1900 Pico Blvd, Santa Monica | 🔗 smc.edu"
                 : "✅ #1 source of UCLA transfer students. ~$46/unit (CA resident). Strong media, film & business. 30 min from Koreatown. Many Korean students.\n📍 1900 Pico Blvd, Santa Monica | 🔗 smc.edu",
        tags: ["UCLA편입","미디어","코리아타운"] },
      { emoji: "🏛️", name: "LA City College / East LA College", nameEn: "LACCD — 코리아타운·동LA",
        desc: ko ? "✅ LA 시립 CC. 코리아타운 인근. 학비 ~$46/학점 (CA 주민). ESL·직업훈련 프로그램 풍부. 한인·히스패닉 밀집.\n📍 855 N Vermont Ave, Los Angeles | 🔗 lacitycollege.edu"
                 : "✅ LA City College, near Koreatown. ~$46/unit (CA resident). Rich ESL & vocational programs. Dense Korean & Hispanic enrollment.\n📍 855 N Vermont Ave, Los Angeles | 🔗 lacitycollege.edu",
        tags: ["코리아타운","ESL","LACCD"] },
      { emoji: "💡", name: ko ? "CA ADT — UC 편입 보장" : "CA ADT — Associate Degree for Transfer",
        desc: ko ? "CA ADT 취득 시 CSU 편입 보장. IGETC 이수 시 UC 편입 경쟁력 높음.\n• SMC, LACC 모두 ADT 제공\n🔗 assist.org"
                 : "CA ADT grants guaranteed CSU transfer. IGETC completion gives UC transfer advantage.\n• SMC, LACC both offer ADT\n🔗 assist.org",
        tags: ["ADT","UC편입","CSU"] },
    ],
    newyork: [
      { emoji: "🏛️", name: "Queensborough CC (CUNY)", nameEn: "Queensborough CC — 플러싱 인근",
        desc: ko ? "✅ 플러싱 한인 지역 가까운 CUNY 소속 CC. 학비 ~$4,800/년 (NY 시민). 4년제 CUNY 편입 보장. 한인·아시안 학생 다수.\n📍 222-05 56th Ave, Bayside NY | 🔗 qcc.cuny.edu"
                 : "✅ CUNY CC near Flushing Korean area. ~$4,800/yr (NY resident). Guaranteed transfer to 4-year CUNY schools. Many Korean & Asian students.\n📍 222-05 56th Ave, Bayside NY | 🔗 qcc.cuny.edu",
        tags: ["플러싱","CUNY","편입"] },
      { emoji: "🏛️", name: "Bergen Community College (NJ)", nameEn: "Bergen CC — 포트리·팰리세이즈파크 인근",
        desc: ko ? "✅ NJ 포트리·팰리세이즈파크 한인 최다 밀집 지역 CC. 학비 ~$5,600/년 (NJ 주민). 4년제 Rutgers·Montclair 편입 경로.\n📍 400 Paramus Rd, Paramus NJ | 🔗 bergen.edu"
                 : "✅ CC in NJ's Korean-dense Fort Lee & Palisades Park area. ~$5,600/yr (NJ resident). Transfer to Rutgers, Montclair, etc.\n📍 400 Paramus Rd, Paramus NJ | 🔗 bergen.edu",
        tags: ["포트리","팰리세이즈","CUNY편입"] },
      { emoji: "🏛️", name: "Borough of Manhattan CC (BMCC)", nameEn: "BMCC — 맨해튼 다운타운",
        desc: ko ? "CUNY 소속. 맨해튼 소재. 비즈니스·회계·IT 특화. 학비 ~$4,800/년 (NY 시민). 4년제 CUNY 편입 가능.\n📍 199 Chambers St, New York | 🔗 bmcc.cuny.edu"
                 : "CUNY school in Manhattan. Business, accounting & IT focus. ~$4,800/yr. Transfer to 4-year CUNY schools.\n📍 199 Chambers St, New York | 🔗 bmcc.cuny.edu",
        tags: ["맨해튼","BMCC","비즈니스"] },
    ],
    houston: [
      { emoji: "🏛️", name: "Houston Community College (HCC)", nameEn: "HCC — 휴스턴 한인 커뮤니티 인근",
        desc: ko ? "✅ 휴스턴 최대 CC. 슈거랜드·케이티 캠퍼스 있음. 학비 ~$2,000/학기 (TX 주민). ESL·간호·기술직 강점. 한인 학생 다수.\n📍 슈거랜드·케이티 캠퍼스 | 🔗 hccs.edu"
                 : "✅ Houston's largest CC. Sugar Land & Katy campuses. ~$2,000/semester (TX resident). Strong ESL, nursing & tech programs. Many Korean students.\n📍 Sugar Land & Katy campuses | 🔗 hccs.edu",
        tags: ["슈거랜드","케이티","ESL"] },
      { emoji: "🏛️", name: "Lone Star College", nameEn: "Lone Star College — 북부 휴스턴",
        desc: ko ? "✅ 휴스턴 북부 최대 CC 시스템. 케이티·우드랜즈 캠퍼스. 학비 ~$2,200/학기. 4년제 UH·TAMU 편입 경로. STEM 특화.\n📍 케이티·우드랜즈 캠퍼스 | 🔗 lonestar.edu"
                 : "✅ Largest CC system in north Houston. Katy & Woodlands campuses. ~$2,200/semester. UH & TAMU transfer pathway. STEM focus.\n📍 Katy, Woodlands campuses | 🔗 lonestar.edu",
        tags: ["케이티","TAMU편입","STEM"] },
    ],
    boston: [
      { emoji: "🏛️", name: "Bunker Hill CC", nameEn: "Bunker Hill CC — 보스턴 (UMass 편입)",
        desc: ko ? "✅ 보스턴 최대 CC. UMass Boston 편입 보장 과정 있음. ESL 프로그램 강함. 학비 ~$5,000/년 (MA 주민).\n📍 250 New Rutherford Ave, Boston | 🔗 bhcc.edu"
                 : "✅ Boston's largest CC. UMass Boston guaranteed transfer program. Strong ESL. ~$5,000/yr (MA resident).\n📍 250 New Rutherford Ave, Boston | 🔗 bhcc.edu",
        tags: ["보스턴","UMass편입","ESL"] },
      { emoji: "🏛️", name: "Middlesex CC", nameEn: "Middlesex CC — 케임브리지·하버드 인근",
        desc: ko ? "케임브리지·로웰 소재. 하버드·MIT 인근. 학비 ~$5,200/년. UMass·Northeastern 편입 경로.\n📍 591 Springs Rd, Bedford MA | 🔗 middlesex.mass.edu"
                 : "Cambridge & Lowell. Near Harvard & MIT. ~$5,200/yr. UMass, Northeastern transfer options.\n📍 591 Springs Rd, Bedford MA | 🔗 middlesex.mass.edu",
        tags: ["케임브리지","하버드인근","편입"] },
    ],
    nashville: [
      { emoji: "🏛️", name: "Nashville State CC", nameEn: "Nashville State CC — 내쉬빌 중심",
        desc: ko ? "✅ 내쉬빌 소재. MTSU·Vanderbilt 편입 경로. 학비 ~$2,100/학기 (TN 주민). ESL·기술직 특화.\n📍 120 White Bridge Pike, Nashville TN | 🔗 nscc.edu"
                 : "✅ Nashville campus. MTSU & Vanderbilt transfer pathway. ~$2,100/semester (TN resident). ESL & tech programs.\n📍 120 White Bridge Pike, Nashville TN | 🔗 nscc.edu",
        tags: ["내쉬빌","MTSU편입","ESL"] },
      { emoji: "🏛️", name: "Volunteer State CC (VSCC)", nameEn: "Volunteer State CC — 매디슨 인근",
        desc: ko ? "✅ 매디슨 근처 소재. 내쉬빌 한인 밀집 지역과 가까움. 학비 ~$2,000/학기. 간호·의료 보조 특화.\n📍 1480 Nashville Pike, Gallatin TN | 🔗 volstate.edu"
                 : "✅ Near Madison (Nashville Korean hub). ~$2,000/semester. Nursing & medical assistant programs strong.\n📍 1480 Nashville Pike, Gallatin TN | 🔗 volstate.edu",
        tags: ["매디슨","간호","의료보조"] },
    ],
    toronto: [
      { emoji: "🏛️", name: "Seneca College", nameEn: "Seneca College — 노스욕 (한인 추천 #1)",
        desc: ko ? "✅ 노스욕 핀치 소재. 한인타운 바로 옆. 비즈니스·IT·미디어 특화. 학비 CA$4,000-5,500/학기. 국제학생 장학금 있음.\n📍 1750 Finch Ave E, North York | 🔗 senecacollege.ca"
                 : "✅ North York Finch — right next to Korean hub. Business, IT & media programs. CA$4,000-5,500/semester. International scholarships available.\n📍 1750 Finch Ave E, North York | 🔗 senecacollege.ca",
        tags: ["노스욕","핀치","한인#1"] },
      { emoji: "🏛️", name: "Centennial College / Humber College", nameEn: "Centennial & Humber — 편입 경로",
        desc: ko ? "✅ Centennial: 스카버러 소재. IT·간호·비즈니스. Humber: 에토비코 소재. 항공·미디어·디자인.\n학비 CA$4,000-5,000/학기. Ryerson(TMU)·York 편입 경로.\n🔗 centennialcollege.ca | humber.ca"
                 : "✅ Centennial: Scarborough, IT/nursing/business. Humber: Etobicoke, aviation/media/design.\nCA$4,000-5,000/semester. Transfer to TMU/York.\n🔗 centennialcollege.ca | humber.ca",
        tags: ["스카버러","에토비코","편입"] },
    ],
    vancouver: [
      { emoji: "🏛️", name: "Douglas College", nameEn: "Douglas College — 코퀴틀람 (한인 추천 #1)",
        desc: ko ? "✅ 코퀴틀람 소재. 한인 밀집 지역 바로 옆. SFU·UBC 편입 경로. 학비 CA$6,000-8,000/학기 (국제). 의료·비즈니스·심리 강점.\n📍 700 Royal Ave, New Westminster BC | 🔗 douglascollege.ca"
                 : "✅ New Westminster, near Coquitlam Korean hub. SFU & UBC transfer pathway. CA$6,000-8,000/semester (international). Strong nursing, business & psychology.\n📍 700 Royal Ave, New Westminster BC | 🔗 douglascollege.ca",
        tags: ["코퀴틀람","SFU·UBC편입","한인#1"] },
      { emoji: "🏛️", name: "Langara College", nameEn: "Langara College — 밴쿠버 시내 (UBC 편입)",
        desc: ko ? "✅ 밴쿠버 시내 소재. UBC 편입 명문 루트. 학비 CA$7,000/학기 (국제). 비즈니스·언론·심리 강점.\n📍 100 W 49th Ave, Vancouver BC | 🔗 langara.ca"
                 : "✅ Vancouver proper. Prestigious UBC transfer pathway. CA$7,000/semester (international). Business, journalism & psychology.\n📍 100 W 49th Ave, Vancouver BC | 🔗 langara.ca",
        tags: ["밴쿠버","UBC편입","비즈니스"] },
    ],
    atlanta: [
      { emoji: "🏛️", name: "Gwinnett Tech", nameEn: "Gwinnett Technical College — 둘루스 (한인 추천)",
        desc: ko ? "✅ 둘루스·로렌스빌 소재. 한인 밀집 귀넷카운티 CC. 학비 ~$2,000/학기 (GA 주민). IT·의료보조·비즈니스 특화. 한인 학생 다수.\n📍 5150 Sugarloaf Pkwy, Lawrenceville GA | 🔗 gwinnetttech.edu"
                 : "✅ Duluth/Lawrenceville — heart of Gwinnett Korean community. ~$2,000/semester (GA resident). IT, medical assistant & business. Many Korean students.\n📍 5150 Sugarloaf Pkwy, Lawrenceville GA | 🔗 gwinnetttech.edu",
        tags: ["둘루스","귀넷","한인#1"] },
      { emoji: "🏛️", name: "Georgia Perimeter College → GA State", nameEn: "Georgia State Perimeter College",
        desc: ko ? "✅ GA State University 계열 CC. 5개 캠퍼스. 학비 ~$2,200/학기. GA State 편입 보장 과정. 스와니·둘루스 캠퍼스 한인 다수.\n📍 둘루스·에드워즈빌 등 | 🔗 gpc.edu"
                 : "✅ GA State University's 2-year college. 5 campuses. ~$2,200/semester. Guaranteed GA State transfer. Many Koreans at Suwanee/Duluth campuses.\n📍 Duluth, Dunwoody + others | 🔗 gpc.edu",
        tags: ["GA State편입","스와니","둘루스"] },
    ],
    philadelphia: [
      { emoji: "🏛️", name: "Community College of Philadelphia (CCP)", nameEn: "Community College of Philadelphia",
        desc: ko ? "✅ 필라 최대 CC. 어퍼다비·체리힐 한인 통학 가능. 학비 ~$4,400/년 (PA 주민). Temple·Drexel 편입 경로. ESL 우수.\n📍 1700 Spring Garden St, Philadelphia PA | 🔗 ccp.edu"
                 : "✅ Philadelphia's largest CC. Commutable from Upper Darby & Cherry Hill. ~$4,400/yr (PA resident). Temple & Drexel transfer pathway. Strong ESL.\n📍 1700 Spring Garden St, Philadelphia PA | 🔗 ccp.edu",
        tags: ["필라","Temple편입","ESL"] },
      { emoji: "🏛️", name: "Camden County College (NJ)", nameEn: "Camden County College — 체리힐 (NJ)",
        desc: ko ? "체리힐 인근 NJ CC. 학비 ~$4,200/년 (NJ 주민). Rutgers 편입 경로. 한인 체리힐 커뮤니티 통학 가능.\n📍 200 College Dr, Blackwood NJ | 🔗 camdencc.edu"
                 : "Near Cherry Hill, NJ. ~$4,200/yr (NJ resident). Rutgers transfer pathway. Commutable for Korean Cherry Hill community.\n📍 200 College Dr, Blackwood NJ | 🔗 camdencc.edu",
        tags: ["체리힐","Rutgers편입","NJ"] },
    ],
    kansascity: [
      { emoji: "🏛️", name: "Johnson County CC (JCCC)", nameEn: "Johnson County CC — 오버랜드파크 (한인 추천)",
        desc: ko ? "✅ 오버랜드파크 소재. 한인 H-Mart 인근. KS 최고 CC. 학비 ~$3,500/년 (KS 주민). KU·KSU 편입 경로. ESL 우수.\n📍 12345 College Blvd, Overland Park KS | 🔗 jccc.edu"
                 : "✅ Overland Park — near Korean H-Mart. KS's best CC. ~$3,500/yr (KS resident). KU & KSU transfer pathway. Strong ESL.\n📍 12345 College Blvd, Overland Park KS | 🔗 jccc.edu",
        tags: ["오버랜드파크","KU편입","한인#1"] },
      { emoji: "🏛️", name: "Metropolitan CC (MCC)", nameEn: "Metropolitan CC — 캔자스시티 MO",
        desc: ko ? "MO 캔자스시티 소재. UMKC 편입 경로. 학비 ~$3,000/년 (MO 주민). 비즈니스·IT·건강과학 특화.\n📍 3200 Broadway, Kansas City MO | 🔗 mcckc.edu"
                 : "MO Kansas City. UMKC transfer pathway. ~$3,000/yr (MO resident). Business, IT & health sciences.\n📍 3200 Broadway, Kansas City MO | 🔗 mcckc.edu",
        tags: ["UMKC편입","KC","MO"] },
    ],
    miami: [
      { emoji: "🏛️", name: "Miami Dade College (MDC)", nameEn: "Miami Dade College — 미국 최대 CC",
        desc: ko ? "✅ 미국 최대 CC 중 하나. 도랄·코랄게이블스 캠퍼스. 학비 ~$3,000/년 (FL 주민). FIU·UM 편입 경로. 한국어·ESL 강함. 스페인어 병행.\n📍 도랄 캠퍼스 포함 8개 캠퍼스 | 🔗 mdc.edu"
                 : "✅ One of the US's largest CCs. Doral & Coral Gables campuses. ~$3,000/yr (FL resident). FIU & UM transfer pathway. Korean, ESL & Spanish programs.\n📍 8 campuses incl. Doral | 🔗 mdc.edu",
        tags: ["도랄","FIU편입","스페인어"] },
      { emoji: "🏛️", name: "Broward College", nameEn: "Broward College — 포트로더데일",
        desc: ko ? "마이애미 북쪽. FL 주민 학비 ~$3,000/년. NSU·FAU 편입 경로. 한인 커뮤니티 성장 중.\n📍 포트로더데일·펨브로크파인스 | 🔗 broward.edu"
                 : "North Miami. FL resident ~$3,000/yr. NSU & FAU transfer pathway. Growing Korean community.\n📍 Fort Lauderdale, Pembroke Pines | 🔗 broward.edu",
        tags: ["포트로더데일","NSU편입","한인성장"] },
    ],
    mexicocity: [
      { emoji: "🏛️", name: ko ? "UNAM (멕시코 국립 자치대학) — 전문학교·어학원" : "UNAM — Language Courses & Professional Programs",
        desc: ko ? "✅ 멕시코 최대 국립대학. 스페인어 집중 과정 외국인 대상 운영 (CEPE).\n학비: 매우 저렴 (연 USD $1,000 미만)\n📍 Ciudad Universitaria, CDMX | 🔗 unam.mx/cepe"
                 : "✅ Mexico's largest national university. Spanish intensive courses for foreigners (CEPE).\nVery affordable tuition (under USD $1,000/yr)\n📍 Ciudad Universitaria, CDMX | 🔗 unam.mx/cepe",
        tags: ["UNAM","스페인어","저렴"] },
      { emoji: "🏛️", name: ko ? "한국문화원 멕시코 — 한국어 강좌" : "Korean Cultural Center Mexico — Korean Language",
        desc: ko ? "주멕시코 한국문화원 한국어 강좌. 현지인 대상. 한인 교류 기회.\n📍 폴랑코 인근 | 🔗 mexico.korean-culture.org"
                 : "Korean Cultural Center Mexico Korean language courses. For locals. Korean community connection.\n📍 Near Polanco | 🔗 mexico.korean-culture.org",
        tags: ["한국어강좌","문화원","폴랑코"] },
      { emoji: "💡", name: ko ? "ITAM / IBERO — 멕시코 명문 사립대 단기 과정" : "ITAM / IBERO — Mexico Top Private Short Programs",
        desc: ko ? "ITAM(경제·금융 최강)·IBERO(예수회 명문) 전문 과정. 비즈니스·스페인어·경영 단기 교육.\n🔗 itam.mx | ibero.mx"
                 : "ITAM (top economics & finance) & IBERO (Jesuit) professional courses. Business, Spanish & management short programs.\n🔗 itam.mx | ibero.mx",
        tags: ["ITAM","IBERO","단기과정"] },
    ],
    guadalajara: [
      { emoji: "🏛️", name: ko ? "ITESO / UdeG — 과달라하라 명문대 강좌" : "ITESO & UdeG — Guadalajara University Courses",
        desc: ko ? "ITESO (예수회 사립): 경영·공학·디자인 우수.\nUdeG (공립): 스페인어 집중 과정 외국인 대상. 학비 매우 저렴.\n🔗 iteso.mx | udg.mx"
                 : "ITESO (Jesuit private): Strong business, engineering & design.\nUdeG (public): Spanish courses for foreigners. Very affordable.\n🔗 iteso.mx | udg.mx",
        tags: ["ITESO","UdeG","스페인어"] },
    ],
    monterrey: [
      { emoji: "🏛️", name: ko ? "Tec de Monterrey (ITESM) — 멕시코 1위 사립대" : "Tec de Monterrey — Mexico's Top Private University",
        desc: ko ? "✅ 멕시코 사립 1위. 공학·경영·기술 세계적 수준. 영어 트랙 과정. 주재원 자녀 한인 학생 다수.\n학비: USD $8,000-15,000/년\n📍 Av. Eugenio Garza Sada 2501, Monterrey | 🔗 tec.mx"
                 : "✅ Mexico's #1 private university. World-class engineering, business & tech. English-track programs. Many Korean expat children enrolled.\nTuition: USD $8,000-15,000/yr\n📍 Av. Eugenio Garza Sada 2501, Monterrey | 🔗 tec.mx",
        tags: ["Tec","멕시코1위","영어트랙"] },
      { emoji: "💡", name: ko ? "UDEM / UANL — 몬테레이 대학교 외국어 과정" : "UDEM & UANL — Monterrey University Language Programs",
        desc: ko ? "UDEM (사립)·UANL (공립, 누에보레온주립대) 스페인어·외국어 과정.\n외국인 등록 가능. 학비 저렴.\n🔗 udem.edu.mx | uanl.mx"
                 : "UDEM (private) & UANL (public, Nuevo León State Univ) Spanish & language programs.\nOpen to foreigners. Affordable tuition.\n🔗 udem.edu.mx | uanl.mx",
        tags: ["UDEM","UANL","스페인어"] },
    ],
  };
  return D[slug] ?? [
    { emoji: "🏛️", name: ko ? "지역 커뮤니티 칼리지" : "Local Community College",
      desc: ko ? "이 도시의 CC 정보를 수집 중입니다.\n💡 collegedata.com 또는 collegeboard.org에서 검색하세요."
               : "CC information for this city is being collected.\n💡 Search at collegedata.com or collegeboard.org.",
      tags: ["CC","편입","대학"] },
  ];
}

function getCityKoreanSchool(slug: string, lang: string) {
  const ko = lang === "ko";
  type Item = { emoji: string; name: string; nameEn?: string; desc: string; tags: string[] };
  const D: Record<string, Item[]> = {
    seattle: [
      { emoji: "🇰🇷", name: ko ? "시애틀한국학교" : "Seattle Korean School",
        desc: ko ? "✅ WA주 최대 한국학교. 매주 토요일 오전. 유치~성인반 TOPIK 준비반 운영.\n🔗 seattlekoreanschool.org"
                 : "✅ WA's largest Korean school. Every Saturday morning. Pre-K to adult, TOPIK prep.\n🔗 seattlekoreanschool.org",
        tags: ["한국학교","토요한글","TOPIK"] },
      { emoji: "📖", name: ko ? "교회 부설 한국학교" : "Church-Based Korean Schools",
        desc: ko ? "많은 한인 교회가 자체 한국학교 운영. GMC 시애틀지구촌교회·벨뷰·린우드 지역 교회 토요 한국학교.\n🔗 ijiguchon.org"
                 : "Many Korean churches run Saturday Korean schools. GMC, Bellevue & Lynnwood Korean churches.\n🔗 ijiguchon.org",
        tags: ["교회한국학교","토요일","무료"] },
      { emoji: "📊", name: ko ? "NAKS-PNW (서북미협의회)" : "NAKS-PNW — Korean Schools Regional Council",
        desc: ko ? "WA·OR·ID 한국학교 협의회. 전체 학교 목록·말하기 대회·여름캠프.\n🔗 nakspnw.org"
                 : "WA, OR & ID Korean school council. Full school list, speech competition, summer camp.\n🔗 nakspnw.org",
        tags: ["서북미협의회","NAKS","한국어대회"] },
    ],
    dallas: [
      { emoji: "🇰🇷", name: ko ? "달라스 한국학교" : "Dallas Korean School",
        desc: ko ? "✅ 매주 토요일 오전. 캐롤튼·플레이노 캠퍼스. 유치~고등반 TOPIK 준비반.\n카카오채팅 '달라스한국학교' 또는 달라스한인회 문의."
                 : "✅ Every Saturday morning. Carrollton & Plano campuses. Pre-K to HS, TOPIK prep.\nContact via Dallas Korean Association.",
        tags: ["달라스","토요한글","TOPIK"] },
      { emoji: "📖", name: ko ? "교회 부설 한국학교 (달라스)" : "Church Korean Schools — Dallas",
        desc: ko ? "캐롤튼·프리스코·플레이노 지역 한인 교회에서 한국어 교육 운영. 한국제일침례교회·달라스새생명교회 등."
                 : "Korean churches in Carrollton, Frisco & Plano offer Korean language classes. Korean First Baptist, Dallas New Life Church, etc.",
        tags: ["달라스교회","한국어","무료"] },
      { emoji: "🥋", name: ko ? "태권도·한국 문화 (달라스)" : "Taekwondo & Korean Culture — Dallas",
        desc: ko ? "캐롤튼·프리스코 한인 태권도 도장 다수. 주 2-3회, 월 $80-150.\nK-pop 댄스·가야금 클래스: 한인회 문의."
                 : "Multiple Korean Taekwondo dojangs in Carrollton & Frisco. 2-3x/week, $80-150/month.\nK-pop dance & Gayageum: contact Korean Association.",
        tags: ["태권도","K-pop","달라스"] },
    ],
    sf: [
      { emoji: "🇰🇷", name: ko ? "베이에리어 한국학교" : "Bay Area Korean School",
        desc: ko ? "✅ 산호세·프리몬트·쿠퍼티노 지역 한국학교 여러 곳 운영. 매주 토요일. TOPIK 준비반.\n베이에리어한인회 문의."
                 : "✅ Multiple Korean schools in San Jose, Fremont & Cupertino. Every Saturday. TOPIK prep.\nContact Bay Area Korean Association.",
        tags: ["산호세","프리몬트","TOPIK"] },
      { emoji: "📊", name: ko ? "NAKS 서부 (Korean Schools of America)" : "NAKS West — Korean Schools Association",
        desc: ko ? "CA·NV·AZ 한국학교 협의회. 전체 학교 목록·대회 정보.\n🔗 naks.net"
                 : "Korean school council for CA, NV & AZ. Full school list & competition info.\n🔗 naks.net",
        tags: ["NAKS","CA","한국어대회"] },
    ],
    la: [
      { emoji: "🇰🇷", name: ko ? "남가주 한국학교협의회" : "Korean Schools Association — Southern CA",
        desc: ko ? "✅ 코리아타운·세리토스·토랜스 지역 한국학교 네트워크. 매주 토요일. TOPIK 준비반.\n🔗 naks.net (남가주 지부)"
                 : "✅ Korean school network in Koreatown, Cerritos & Torrance. Every Saturday. TOPIK prep.\n🔗 naks.net (Southern CA chapter)",
        tags: ["코리아타운","세리토스","TOPIK"] },
      { emoji: "📖", name: ko ? "교회 부설 한국학교 (LA)" : "Church Korean Schools — LA",
        desc: ko ? "나성영락교회·LA새누리교회 등 코리아타운·세리토스 한인 교회 한국학교.\nK-pop·태권도·가야금 문화 교육 병행."
                 : "LA Youngnak, LA Saenuri & other Koreatown/Cerritos churches run Korean schools.\nK-pop, Taekwondo & Gayageum cultural education also available.",
        tags: ["코리아타운교회","한국학교","문화"] },
    ],
    newyork: [
      { emoji: "🇰🇷", name: ko ? "뉴욕·뉴저지 한국학교" : "New York & New Jersey Korean Schools",
        desc: ko ? "✅ 플러싱·포트리·팰리세이즈파크 지역 한국학교 여러 곳. 매주 토요일.\n뉴욕한인회 또는 NAKS 동부 지부 문의.\n🔗 naks.net"
                 : "✅ Multiple Korean schools in Flushing, Fort Lee & Palisades Park. Every Saturday.\nContact NANY or NAKS Eastern chapter.\n🔗 naks.net",
        tags: ["플러싱","포트리","TOPIK"] },
    ],
    houston: [
      { emoji: "🇰🇷", name: ko ? "휴스턴 한국학교" : "Houston Korean School",
        desc: ko ? "✅ 슈거랜드·케이티 지역 한국학교. 매주 토요일. TOPIK 준비반.\n휴스턴한인회 문의 또는 한인 교회 탐색."
                 : "✅ Korean schools in Sugar Land & Katy. Every Saturday. TOPIK prep.\nContact Houston Korean Association or local Korean churches.",
        tags: ["슈거랜드","케이티","TOPIK"] },
    ],
    boston: [
      { emoji: "🇰🇷", name: ko ? "보스턴 한국학교" : "Boston Korean School",
        desc: ko ? "✅ 올스턴·퀸시 지역 한국학교. 매주 토요일. 하버드·MIT 유학생 자녀 다수.\n보스턴한인회 또는 한인 교회 문의."
                 : "✅ Korean schools in Allston & Quincy. Every Saturday. Many Harvard/MIT student families.\nContact Boston Korean Association or local churches.",
        tags: ["보스턴","올스턴","TOPIK"] },
    ],
    nashville: [
      { emoji: "🇰🇷", name: ko ? "내쉬빌 한국학교" : "Nashville Korean School",
        desc: ko ? "✅ 매디슨·쿨스프링스 지역 한국학교. 매주 토요일. 내쉬빌한인회 문의."
                 : "✅ Korean schools in Madison & Cool Springs. Every Saturday. Contact Nashville Korean Association.",
        tags: ["내쉬빌","매디슨","토요한글"] },
    ],
    toronto: [
      { emoji: "🇰🇷", name: ko ? "토론토 한국학교 협의회" : "Korean Schools of Toronto",
        desc: ko ? "✅ 노스욕·스카버러·미시사가 한국학교 여러 곳. 매주 토요일. TOPIK 준비반.\n🔗 토론토한인회 문의"
                 : "✅ Multiple schools in North York, Scarborough & Mississauga. Every Saturday. TOPIK prep.\nContact Toronto Korean Association.",
        tags: ["노스욕","스카버러","TOPIK"] },
    ],
    vancouver: [
      { emoji: "🇰🇷", name: ko ? "밴쿠버 한국학교" : "Vancouver Korean School",
        desc: ko ? "✅ 코퀴틀람·버나비·노스밴쿠버 한국학교 여러 곳. 매주 토요일. TOPIK 준비반.\n🔗 밴쿠버한인회 문의"
                 : "✅ Multiple schools in Coquitlam, Burnaby & North Vancouver. Every Saturday. TOPIK prep.\nContact Vancouver Korean Association.",
        tags: ["코퀴틀람","버나비","TOPIK"] },
    ],
    atlanta: [
      { emoji: "🇰🇷", name: ko ? "애틀랜타 한국학교 협의회" : "Korean Schools of Atlanta",
        desc: ko ? "✅ 둘루스·스와니·존스크릭 지역 한국학교 여러 곳. 매주 토요일. TOPIK 준비반.\n애틀랜타한인회 문의."
                 : "✅ Multiple schools in Duluth, Suwanee & Johns Creek. Every Saturday. TOPIK prep.\nContact Atlanta Korean Association.",
        tags: ["둘루스","스와니","TOPIK"] },
    ],
    philadelphia: [
      { emoji: "🇰🇷", name: ko ? "필라델피아 한국학교" : "Philadelphia Korean School",
        desc: ko ? "✅ 어퍼다비·체리힐 지역 한국학교. 매주 토요일.\n필라한인회 문의."
                 : "✅ Korean schools in Upper Darby & Cherry Hill. Every Saturday.\nContact Philadelphia Korean Association.",
        tags: ["어퍼다비","체리힐","토요한글"] },
    ],
    kansascity: [
      { emoji: "🇰🇷", name: ko ? "캔자스시티 한국학교" : "Kansas City Korean School",
        desc: ko ? "✅ 오버랜드파크 한국학교. 매주 토요일. KC한인회 문의."
                 : "✅ Korean school in Overland Park. Every Saturday. Contact KC Korean Association.",
        tags: ["오버랜드파크","KC","토요한글"] },
    ],
    miami: [
      { emoji: "🇰🇷", name: ko ? "마이애미 한국학교" : "Miami Korean School",
        desc: ko ? "✅ 도랄·코랄게이블스 지역 한국학교. 매주 토요일. 스페인어권 환경 속 한국어 교육.\n마이애미한인회 문의."
                 : "✅ Korean schools in Doral & Coral Gables. Every Saturday. Korean education in Hispanic environment.\nContact Miami Korean Association.",
        tags: ["도랄","한국학교","스페인어"] },
    ],
    mexicocity: [
      { emoji: "🇰🇷", name: ko ? "멕시코시티 한국학교 (재멕동포용)" : "Korean School of Mexico City",
        desc: ko ? "✅ 재멕시코 한국 교육원 산하 한국학교. 주재원 자녀·한인 2세 교육. 폴랑코 인근.\n📞 대사관 교육원: 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko"
                 : "✅ Korean school under Korean Education Center Mexico. For expat children & 2nd-gen Koreans. Near Polanco.\n📞 Embassy Education Center: 55-5202-9866 | 🔗 overseas.mofa.go.kr/mx-ko",
        tags: ["한국학교","주재원자녀","폴랑코"] },
    ],
    guadalajara: [
      { emoji: "🇰🇷", name: ko ? "과달라하라 한글학교" : "Guadalajara Korean Language School",
        desc: ko ? "재멕시코 한국 교육원 연계 한글학교. 주말 한국어 수업.\n과달라하라 한인회 연락 → 위치 확인."
                 : "Korean Language School linked with Korean Education Center Mexico. Weekend classes.\nContact Guadalajara Korean Association for location.",
        tags: ["한글학교","주재원자녀","과달라하라"] },
    ],
    monterrey: [
      { emoji: "🇰🇷", name: ko ? "몬테레이 한글학교" : "Monterrey Korean Language School",
        desc: ko ? "재멕시코 한국 교육원 연계 한글학교. 현대·기아·POSCO 주재원 자녀 대상. 주말 한국어 수업.\n몬테레이 한인회 문의."
                 : "Korean Language School linked with Korean Education Center Mexico. For Hyundai/Kia/POSCO expat children. Weekend classes.\nContact Monterrey Korean Association.",
        tags: ["한글학교","주재원자녀","몬테레이"] },
    ],
  };
  return D[slug] ?? [
    { emoji: "🇰🇷", name: ko ? "지역 한국학교" : "Local Korean School",
      desc: ko ? "이 도시의 한국학교 정보를 수집 중입니다.\n💡 재외한국교육원 또는 naks.net에서 검색하세요."
               : "Korean school info for this city is being collected.\n💡 Search at naks.net or contact the local Korean Education Center.",
      tags: ["한국학교","토요한글","TOPIK"] },
  ];
}

function getCityShoppingMarkets(slug: string, lang: string) {
  const ko = lang === "ko";
  type Item = { emoji: string; name: string; nameEn?: string; desc: string; tags: string[] };
  // 국가·도시별 주요 마트 정보
  const isMexico = slug === "mexicocity" || slug === "guadalajara" || slug === "monterrey";
  const isCanada = slug === "toronto" || slug === "vancouver";

  const costcoAddr: Record<string, string> = {
    seattle: ko ? "📍 린우드: 4401 Auto Mall Dr | 쇼어라인: 14905 1st Ave NE" : "📍 Lynnwood: 4401 Auto Mall Dr | Shoreline: 14905 1st Ave NE",
    dallas: ko ? "📍 캐롤튼: 2120 Market Pl Dr | 프리스코: 2505 Preston Rd" : "📍 Carrollton: 2120 Market Pl Dr | Frisco: 2505 Preston Rd",
    sf: ko ? "📍 마운틴뷰: 1600 N Shoreline Blvd | 산호세: 725 Blossom Hill Rd" : "📍 Mountain View: 1600 N Shoreline Blvd | San Jose: 725 Blossom Hill Rd",
    la: ko ? "📍 세리토스: 12820 Towne Center Dr | 토랜스: 2640 Pacific Coast Hwy" : "📍 Cerritos: 12820 Towne Center Dr | Torrance: 2640 Pacific Coast Hwy",
    newyork: ko ? "📍 브루클린: 976 3rd Ave | 퀸즈: 32-50 Vernon Blvd" : "📍 Brooklyn: 976 3rd Ave | Queens: 32-50 Vernon Blvd",
    houston: ko ? "📍 슈거랜드: 4525 Hwy 6 S | 케이티: 2100 TX-99" : "📍 Sugar Land: 4525 Hwy 6 S | Katy: 2100 TX-99",
    boston: ko ? "📍 워번: 75 Mystic Ave | 데덤: 575 Providence Hwy" : "📍 Woburn: 75 Mystic Ave | Dedham: 575 Providence Hwy",
    nashville: ko ? "📍 안티오크: 320 Amsouth Bank Blvd | 브렌트우드: 206 Old Hickory Blvd" : "📍 Antioch: 320 Amsouth Bank Blvd | Brentwood: 206 Old Hickory Blvd",
    toronto: ko ? "📍 노스요크: 1 Sunforest Dr | 에토비코: 900 Warden Ave" : "📍 North York: 1 Sunforest Dr | Etobicoke: 900 Warden Ave",
    vancouver: ko ? "📍 버나비: 4500 Still Creek Dr | 코퀴틀람: 1650 Island Hwy E" : "📍 Burnaby: 4500 Still Creek Dr | Coquitlam: 1650 Island Hwy E",
    atlanta: ko ? "📍 둘루스: 2150 Pleasant Hill Rd | 스와니: 2985 Lawrenceville Suwanee Rd" : "📍 Duluth: 2150 Pleasant Hill Rd | Suwanee: 2985 Lawrenceville Suwanee Rd",
    philadelphia: ko ? "📍 어퍼다비: 1000 Cedar Ave | 체리힐: 2149 Rte 38" : "📍 Upper Darby: 1000 Cedar Ave | Cherry Hill: 2149 Rte 38",
    kansascity: ko ? "📍 오버랜드파크: 6700 W 119th St" : "📍 Overland Park: 6700 W 119th St",
    miami: ko ? "📍 도랄: 10600 NW 19th St | 켄달: 9005 SW 137th Ave" : "📍 Doral: 10600 NW 19th St | Kendall: 9005 SW 137th Ave",
  };

  if (isMexico) return [
    { emoji: "🏪", name: ko ? "삼 (Sam's Club) / 코스트코" : "Sam's Club / Costco Mexico",
      desc: ko ? "✅ 멕시코 코스트코·샘스클럽. 수입 식품·한국 라면·김치 구매 가능.\n📍 멕시코시티·과달라하라·몬테레이 각 지점\n연 멤버십 MXN $600-800"
               : "✅ Costco & Sam's Club in Mexico. Import foods, Korean ramen & kimchi available.\n📍 Locations in CDMX, Guadalajara & Monterrey\nAnnual membership MXN $600-800",
      tags: ["코스트코","수입식품","멕시코"] },
    { emoji: "🥬", name: ko ? "H-Mart / KA Mart (한국 마트)" : "H-Mart / KA Mart — Korean Grocery",
      desc: ko ? "멕시코시티·폴랑코 지역 한인 식품점. 한국 식재료·라면·김치·냉동식품.\n소규모 한인 마트 — 폴랑코 한인타운 주변 탐색."
               : "Korean grocery stores in Mexico City Polanco area. Korean ingredients, ramen, kimchi, frozen foods.\nSmall Korean markets — explore around Polanco Koreatown.",
      tags: ["한국마트","폴랑코","식재료"] },
    { emoji: "🛒", name: ko ? "HEB / Walmart Mexico — 현지 대형마트" : "HEB / Walmart Mexico — Local Supermarkets",
      desc: ko ? "멕시코 대형 마트 체인. 식료품·생활용품 저렴.\nChedraui·Soriana·Comercial Mexicana도 주요 선택지."
               : "Mexico's major supermarket chains. Affordable groceries & everyday items.\nChedraui, Soriana & Comercial Mexicana also popular.",
      tags: ["Walmart","HEB","멕시코마트"] },
    { emoji: "🥩", name: ko ? "멕시칸 타코·길거리 음식" : "Mexican Tacos & Street Food",
      desc: ko ? "타코 MXN $20-40개, 타말레 MXN $15-25. 멕시코 최고 가성비 식사.\n• 폴랑코: 고급 타코 레스토랑\n• 재래시장(Mercado): 현지 가격"
               : "Tacos MXN $20-40 each, tamales MXN $15-25. Best value meal in Mexico.\n• Polanco: upscale taco restaurants\n• Mercado (market): local prices",
      tags: ["타코","가성비","멕시코음식"] },
  ];

  if (isCanada) return [
    { emoji: "🏪", name: ko ? "코스트코 (Costco Canada)" : "Costco Canada",
      desc: ko ? `✅ 연 멤버십 CA$65 → 평균 CA$400+ 절약\n${costcoAddr[slug] ?? ""}\n한인 추천: 연어·쌀·Kirkland 제품 대용량`
               : `✅ Annual membership CA$65 → saves avg CA$400+/yr\n${costcoAddr[slug] ?? ""}\nKorean favorites: salmon, rice, Kirkland bulk items`,
      tags: ["코스트코","캐나다","창고형"] },
    { emoji: "🥬", name: ko ? "T&T 슈퍼마켓 (아시안 마트)" : "T&T Supermarket — Pan-Asian",
      desc: ko ? slug === "toronto"
          ? "✅ 검증됨 | 캐나다 최대 아시안 마트. 노스욕·스카버러·미시사가 지점. 한국 식재료·김치·라면 구비.\n📍 노스욕: 4390 Steeles Ave E | 🔗 tntsupermarket.com"
          : "✅ 검증됨 | 캐나다 최대 아시안 마트. 버나비·코퀴틀람 지점. 한국 식재료·김치·라면 구비.\n📍 버나비: 4800 Kingsway | 🔗 tntsupermarket.com"
               : slug === "toronto"
          ? "✅ Verified | Canada's largest Asian supermarket. North York, Scarborough & Mississauga locations. Korean ingredients, kimchi & ramen.\n📍 North York: 4390 Steeles Ave E | 🔗 tntsupermarket.com"
          : "✅ Verified | Canada's largest Asian supermarket. Burnaby & Coquitlam locations. Korean ingredients, kimchi & ramen.\n📍 Burnaby: 4800 Kingsway | 🔗 tntsupermarket.com",
      tags: ["T&T","아시안마트","한국식재료"] },
    { emoji: "🛒", name: ko ? "No Frills / FreshCo — 알뜰 마트" : "No Frills / FreshCo — Budget Grocery",
      desc: ko ? "캐나다 최저가 식료품 체인. 소박하지만 가격 최강.\n• No Frills: Loblaw 계열 알뜰 브랜드\n• FreshCo: Sobeys 계열 알뜰 브랜드"
               : "Canada's budget grocery chains. No frills but lowest prices.\n• No Frills: Loblaw discount brand\n• FreshCo: Sobeys discount brand",
      tags: ["NoFrills","저렴","캐나다마트"] },
    { emoji: "♻️", name: ko ? "Value Village / Salvation Army 중고마켓" : "Value Village & Salvation Army — Second-Hand",
      desc: ko ? "중고의류 CA$5-20, 가구·가전 저렴.\nFacebook Marketplace: 무료 아이템 다수 (Buy Nothing 그룹)."
               : "Second-hand clothing CA$5-20, affordable furniture & appliances.\nFacebook Marketplace: Many free items (Buy Nothing groups).",
      tags: ["중고","ValueVillage","무료"] },
  ];

  // US cities
  const costco: Item = {
    emoji: "🏪", name: ko ? "코스트코 (Costco)" : "Costco — Best Value Warehouse",
    desc: ko ? `✅ 연 멤버십 $65 → 평균 $300+ 절약\n${costcoAddr[slug] ?? "📍 가까운 지점: google.com/maps/search/costco"}\n한인 추천: 쌀 대용량, Kirkland 연어, 갈비`
             : `✅ Annual membership $65 → saves avg $300+/yr\n${costcoAddr[slug] ?? "📍 Nearest: google.com/maps/search/costco"}\nKorean favorites: bulk rice, Kirkland salmon, short ribs`,
    tags: ["코스트코","창고형","저렴"],
  };
  const hMart: Item = {
    emoji: "🥬", name: ko ? "H-Mart (한인 마트)" : "H-Mart — Korean Supermarket",
    desc: ko ? `✅ 한인 마트 1위. 한국 식재료·김치·라면·냉동식품 총망라.\n📍 가까운 H-Mart: google.com/maps/search/h-mart+${slug.replace("newyork","new+york").replace("kansascity","kansas+city")}`
             : `✅ #1 Korean supermarket. Korean ingredients, kimchi, ramen, frozen foods.\n📍 Nearest H-Mart: google.com/maps/search/h-mart+${slug.replace("newyork","new+york").replace("kansascity","kansas+city")}`,
    tags: ["H-Mart","한국식재료","한인마트"],
  };
  const tj: Item = {
    emoji: "🌿", name: ko ? "Trader Joe's" : "Trader Joe's — Quality at Low Price",
    desc: ko ? `고품질 자체브랜드 저렴. 유기농·건강식품.\n📍 가까운 TJ: google.com/maps/search/trader+joes+${slug.replace("newyork","new+york").replace("kansascity","kansas+city")}`
             : `Quality private-label products at lower prices. Organic & healthy options.\n📍 Nearest TJ: google.com/maps/search/trader+joes+${slug.replace("newyork","new+york").replace("kansascity","kansas+city")}`,
    tags: ["TJ","유기농","가성비"],
  };
  const goodwill: Item = {
    emoji: "♻️", name: ko ? "Goodwill & Facebook Marketplace" : "Goodwill & Facebook Marketplace",
    desc: ko ? `중고의류 $3-15, 가구·가전. Facebook Marketplace & Buy Nothing 그룹: 무료 아이템 다수.\n📍 가까운 Goodwill: google.com/maps/search/goodwill+${slug}`
             : `Clothing $3-15, furniture, appliances. Facebook Marketplace & Buy Nothing groups: many free items.\n📍 Nearest Goodwill: google.com/maps/search/goodwill+${slug}`,
    tags: ["중고","굿윌","무료"],
  };

  // WA-specific: WinCo, Uwajimaya
  if (slug === "seattle") return [
    costco,
    hMart,
    { emoji: "🏬", name: "WinCo Foods", nameEn: "WinCo Foods — Lowest Prices",
      desc: ko ? "✅ 식료품 최저가. 직원 소유 = 좋은 서비스.\n📍 린우드: 19500 Hwy 99 | 렌튼 | 에버렛\n⚠️ 신용카드 불가 (직불카드·현금만)"
               : "✅ Consistently LOWEST grocery prices. Employee-owned.\n📍 Lynnwood: 19500 Hwy 99 | Renton | Everett\n⚠️ No credit cards (debit/cash only)",
      tags: ["WinCo","최저가","벌크"] },
    { emoji: "🥬", name: "99 Ranch Market", nameEn: "99 Ranch — Pan-Asian",
      desc: ko ? "✅ 중국·범아시안 슈퍼마켓. H-Mart보다 채소·해산물 20-40% 저렴.\n📍 벨뷰: 14700 NE 20th St | 에드먼즈: 23830 Hwy 99"
               : "✅ Chinese/Pan-Asian supermarket. Fresh produce & seafood 20-40% cheaper than H-Mart.\n📍 Bellevue: 14700 NE 20th St | Edmonds: 23830 Hwy 99",
      tags: ["99랜치","아시안마트","저렴"] },
    { emoji: "🐟", name: "우와지마야 (Uwajimaya)", nameEn: "Uwajimaya — Japanese/Asian",
      desc: ko ? "✅ 일본·아시안 마트. 최고의 해산물 선택.\n📍 벨뷰: 699 120th Ave NE | 시애틀: 600 5th Ave S"
               : "✅ Japanese/Asian supermarket — best seafood selection.\n📍 Bellevue: 699 120th Ave NE | Seattle: 600 5th Ave S",
      tags: ["우와지마야","일본마트","해산물"] },
    tj, goodwill,
  ];

  // CA (SF / LA): Ranch 99, 99 Ranch
  if (slug === "sf" || slug === "la") return [
    costco,
    hMart,
    { emoji: "🥬", name: "99 Ranch Market", nameEn: "99 Ranch — Pan-Asian",
      desc: ko ? slug === "sf"
          ? "✅ 아시안 마트. 신선 해산물·두부·채소 저렴.\n📍 프리몬트: 46822 Warm Springs Blvd | 밀피타스: 222 Barber Ln"
          : "✅ LA 최대 아시안 마트 체인. 코리아타운 인근 지점 다수.\n📍 로울랜드하이츠: 1820 Nogales St | 에디슨: 18414 Colima Rd"
               : slug === "sf"
          ? "✅ Asian supermarket. Fresh seafood, tofu & produce at lower prices.\n📍 Fremont: 46822 Warm Springs Blvd | Milpitas: 222 Barber Ln"
          : "✅ LA's largest Asian supermarket chain. Multiple locations near Koreatown.\n📍 Rowland Heights: 1820 Nogales St | Edison: 18414 Colima Rd",
      tags: ["99랜치","아시안마트","저렴"] },
    { emoji: "🛒", name: "Grocery Outlet", nameEn: "Grocery Outlet — 30-70% Off",
      desc: ko ? "✅ 정가 대비 30-70% 할인. 매주 다른 재고 (보물찾기 스타일).\n식품·음료·유제품 마크다운 탁월."
               : "✅ 30-70% off regular prices. 'Treasure hunt' style — stock changes weekly.\nBest for snacks, beverages & dairy markdowns.",
      tags: ["할인마트","식품","절약"] },
    tj, goodwill,
  ];

  // NYC / NJ
  if (slug === "newyork") return [
    costco,
    hMart,
    { emoji: "🥬", name: "Viet-Shan Mart / Kam Man Foods", nameEn: "Pan-Asian Markets — NYC",
      desc: ko ? "플러싱 아시안 마트. H-Mart 대비 채소·해산물 저렴.\n📍 플러싱: 133-01 39th Ave | 맨해튼: 200 Canal St"
               : "Flushing Asian markets. Cheaper fresh produce & seafood vs H-Mart.\n📍 Flushing: 133-01 39th Ave | Manhattan: 200 Canal St",
      tags: ["플러싱","아시안마트","저렴"] },
    { emoji: "🛒", name: "Associated Supermarkets / Stop & Shop", nameEn: "Local Supermarkets — NY/NJ",
      desc: ko ? "NY·NJ 지역 슈퍼마켓 체인. 가격 중간, 편리한 위치.\nShopRite(NJ 가성비 최강)·Key Food·Associated."
               : "NY/NJ local supermarket chains. Mid-range prices, convenient locations.\nShopRite (NJ best value), Key Food, Associated.",
      tags: ["Stop&Shop","ShopRite","NYC"] },
    tj, goodwill,
  ];

  // Default for other US cities
  return [costco, hMart, tj,
    { emoji: "🛒", name: ko ? "지역 할인 슈퍼마켓" : "Local Discount Supermarkets",
      desc: ko ? `지역 대형 슈퍼마켓에서 식재료 저렴하게 구매:\n${
        slug === "dallas" || slug === "houston" ? "• HEB, Kroger, Tom Thumb 추천\n• Tom Thumb: 일요일 한인 할인 많음" :
        slug === "boston" ? "• Market Basket: 뉴잉글랜드 최저가\n• Star Market: 올스턴 한인 동네" :
        slug === "nashville" ? "• Publix, Kroger, Aldi 추천\n• Aldi: 냉동식품 최저가" :
        slug === "atlanta" ? "• Publix, Kroger, Aldi, Lidl 추천\n• Lidl: 유기농·수입 식품 저렴" :
        slug === "philadelphia" ? "• Aldi, Wegmans, Giant 추천\n• Wegmans: 어퍼다비 한인 선호" :
        slug === "kansascity" ? "• Price Chopper, Aldi, Walmart 추천" :
        slug === "miami" ? "• Publix, Aldi, Winn-Dixie 추천\n• Latin 마켓: 채소·과일 저렴" : "• Walmart, Kroger, Aldi 추천"}\n📍 google.com/maps/search/supermarket+${slug}`
             : `Local supermarkets for affordable groceries:\n${
        slug === "dallas" || slug === "houston" ? "• HEB, Kroger, Tom Thumb recommended\n• Tom Thumb: Korean discounts on Sundays" :
        slug === "boston" ? "• Market Basket: lowest prices in New England\n• Star Market: near Allston Korean area" :
        slug === "nashville" ? "• Publix, Kroger, Aldi recommended\n• Aldi: best frozen food prices" :
        slug === "atlanta" ? "• Publix, Kroger, Aldi, Lidl recommended\n• Lidl: affordable organic & imports" :
        slug === "philadelphia" ? "• Aldi, Wegmans, Giant recommended\n• Wegmans: preferred by Upper Darby Koreans" :
        slug === "kansascity" ? "• Price Chopper, Aldi, Walmart recommended" :
        slug === "miami" ? "• Publix, Aldi, Winn-Dixie recommended\n• Latin markets: cheap produce & fruit" : "• Walmart, Kroger, Aldi recommended"}\n📍 google.com/maps/search/supermarket+${slug}`,
      tags: ko ? ["슈퍼마켓","할인","식료품"] : ["Supermarket","Discount","Groceries"] },
    goodwill,
  ];
}

function getCityEthnicEateries(slug: string, lang: string) {
  const ko = lang === "ko";
  const city = slug === "newyork" ? "new+york" : slug === "kansascity" ? "kansas+city" : slug;
  const isMexico = slug === "mexicocity" || slug === "guadalajara" || slug === "monterrey";
  const isCanada = slug === "toronto" || slug === "vancouver";

  return [
    { emoji: "🍜", name: ko ? "베트남 쌀국수 (Pho)" : "Vietnamese Pho",
      desc: ko ? `거대한 한 그릇 $12-16 (멕시코·캐나다는 현지 화폐). 엄청난 포만감.\n📍 google.com/maps/search/pho+${city}`
               : `Huge bowl $12-16 (local currency for Mexico/Canada). Incredibly filling.\n📍 google.com/maps/search/pho+${city}`,
      tags: ko ? ["베트남","포","가성비"] : ["Vietnamese","Pho","Value"] },
    { emoji: "🌮", name: ko ? (isMexico ? "정통 멕시칸 타코 (현지)" : "멕시칸 타코·부리토") : (isMexico ? "Authentic Mexican Tacos (Local)" : "Mexican Tacos & Burritos"),
      desc: ko ? isMexico
          ? "현지 타코 MXN $15-40개. 멕시코에서 가장 맛있는 타코!\n타케리아·재래시장(Mercado) 탐색 추천."
          : `타코 $3-5개, 부리토 $10-12 (2인분 양).\n📍 google.com/maps/search/taco+truck+${city}`
               : isMexico
          ? "Local tacos MXN $15-40 each. Best tacos you'll ever have — you're IN Mexico!\nExplore local taquerias & mercados."
          : `Tacos $3-5 each, burrito $10-12 (2 people worth).\n📍 google.com/maps/search/taco+truck+${city}`,
      tags: ko ? ["멕시칸","타코","저렴"] : ["Mexican","Tacos","Budget"] },
    { emoji: "🍛", name: ko ? "인도 뷔페 (점심)" : "Indian Lunch Buffet",
      desc: ko ? `무제한 점심 뷔페 $14-18.\n📍 google.com/maps/search/indian+buffet+${city}`
               : `Unlimited lunch buffet $14-18.\n📍 google.com/maps/search/indian+buffet+${city}`,
      tags: ko ? ["인도","뷔페","무제한"] : ["Indian","Buffet","Unlimited"] },
    { emoji: isCanada ? "🍁" : isMexico ? "🫔" : "🥙",
      name: ko ? (isCanada ? "캐나다 중화 BBQ·딤섬" : isMexico ? "멕시칸 엔칠라다·포솔레" : "중동·지중해 식당") : (isCanada ? "Chinese BBQ & Dim Sum" : isMexico ? "Enchiladas & Pozole" : "Middle Eastern & Mediterranean"),
      desc: ko ? isCanada
          ? "캐나다 아시안 다양성! 광동식 딤섬·차슈 BBQ. 저렴하고 양 많음.\n📍 google.com/maps/search/dim+sum+" + city
          : isMexico
          ? "정통 멕시코 음식. 엔칠라다·포솔레·몰레 소스. 현지 레스토랑에서 USD $5-15에 즐기기."
          : `샤와르마·팔라펠·훔무스. 상대적으로 저렴하고 양 많음.\n📍 google.com/maps/search/mediterranean+food+${city}`
               : isCanada
          ? "Canadian Asian diversity! Cantonese dim sum & char siu BBQ. Affordable & filling.\n📍 google.com/maps/search/dim+sum+" + city
          : isMexico
          ? "Authentic Mexican cuisine. Enchiladas, pozole & mole sauce. Enjoy for USD $5-15 at local restaurants."
          : `Shawarma, falafel & hummus. Relatively affordable, generous portions.\n📍 google.com/maps/search/mediterranean+food+${city}`,
      tags: ko ? (isCanada ? ["딤섬","BBQ","캐나다"] : isMexico ? ["엔칠라다","포솔레","멕시코음식"] : ["중동","샤와르마","저렴"]) : (isCanada ? ["DimSum","BBQ","Canada"] : isMexico ? ["Enchilada","Pozole","Mexican"] : ["Middle Eastern","Shawarma","Budget"]) },
  ];
}

function EducationScreen({ onHome, initialSub = 0 }: { onHome?: () => void; initialSub?: number }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const city = useCityConfig();
  const isSeattle = city.slug === "seattle";
  const [sub, setSub] = useState(initialSub);
  useEffect(() => { setSub(initialSub); }, [initialSub]);
  const tabs = lang === "ko"
    ? ["🏫 학군 순위", "🏛️ 지역 CC", "🎓 4년제 대학", "📝 대입 준비", "📚 학원·ESL", "🇰🇷 한국학교"]
    : ["🏫 School Districts", "🏛️ Community Colleges", "🎓 Universities", "📝 Admissions", "📚 Tutoring & ESL", "🇰🇷 Korean School"];
  const accent = "#A78BFA";

  /* ── Tab 0: 학군 순위 — 도시별 자동 적용 ── */
  const cityDistricts = getCityDistrictData(city.slug, lang);
  const districts = isSeattle ? [
    { emoji: "⭐", name: "Bellevue School District", nameEn: "Bellevue SD — WA #1",
      desc: lang === "ko"
        ? "✅ 워싱턴주 1위 학군 (Niche A+). 졸업률 92.5%. Newport HS·Interlake HS·Bellevue HS. AP·IB 과정 풍부. 한인 학생 비율 높음.\n📍 벨뷰·메디나·클라이드힐 포함 | 🔗 bsd405.org"
        : "✅ WA State #1 district (Niche A+). Grad rate 92.5%. Newport, Interlake & Bellevue HS. Rich AP/IB programs. High Korean student ratio.\n📍 Covers Bellevue, Medina & Clyde Hill | 🔗 bsd405.org",
      tags: ["벨뷰", "A+", "WA #1"] },
    { emoji: "⭐", name: "Mercer Island SD", nameEn: "Mercer Island SD — WA #2",
      desc: lang === "ko"
        ? "✅ 워싱턴주 2위 학군 (Niche A+). 졸업률 97.2%. Mercer Island HS (전국 상위 1%). 고소득 전문직 가정 밀집. 렌트 비쌈.\n📍 메르서아일랜드 단일 학군 | 🔗 mercerislandschools.org"
        : "✅ WA #2 district (Niche A+). Grad rate 97.2%. Mercer Island HS (top 1% nationally). High-income professional community.\n📍 Mercer Island only | 🔗 mercerislandschools.org",
      tags: ["메르서아일랜드", "A+", "WA #2"] },
    { emoji: "⭐", name: "Lake Washington SD", nameEn: "Lake Washington SD — Redmond·Kirkland",
      desc: lang === "ko"
        ? "✅ 워싱턴주 상위 1% (Niche A+). 졸업률 95%. Redmond HS·Eastlake HS·Juanita HS. MS·Google 본사 인근 STEM 최강.\n📍 레드몬드·커클랜드·켄모어 | 🔗 lwsd.org"
        : "✅ Top 1% in WA (Niche A+). Grad rate 95%. Redmond, Eastlake & Juanita HS. Near Microsoft & Google HQ — exceptional STEM.\n📍 Redmond, Kirkland, Kenmore | 🔗 lwsd.org",
      tags: ["레드몬드", "커클랜드", "STEM"] },
    { emoji: "⭐", name: "Northshore SD", nameEn: "Northshore SD — Bothell·Woodinville",
      desc: lang === "ko"
        ? "✅ 워싱턴주 상위 5% (Niche A). 졸업률 96%. Inglemoor HS·Bothell HS·Woodinville HS. 한인 가족 최다 거주 학군. 린우드와 인접.\n📍 보텔·우딘빌·켄모어 | 🔗 nsd.org"
        : "✅ Top 5% in WA (Niche A). Grad rate 96%. Inglemoor, Bothell & Woodinville HS. Highest Korean family concentration. Near Lynnwood.\n📍 Bothell, Woodinville, Kenmore | 🔗 nsd.org",
      tags: ["보텔", "우딘빌", "한인밀집"] },
    { emoji: "🏫", name: "Edmonds SD", nameEn: "Edmonds SD — Lynnwood·Mountlake Terrace",
      desc: lang === "ko"
        ? "Niche A. 졸업률 89%. Mountlake Terrace HS·Lynnwood HS·Meadowdale HS. 한인 마트(H-Mart) 밀집 린우드 커버. 렌트 대비 학군 가성비 최고.\n📍 린우드·마운트레이크테라스·에드먼즈 | 🔗 edmonds.wednet.edu"
        : "Niche A. Grad rate 89%. Mountlake Terrace, Lynnwood & Meadowdale HS. Covers Lynnwood H-Mart area. Best value vs. rent ratio.\n📍 Lynnwood, Mountlake Terrace, Edmonds | 🔗 edmonds.wednet.edu",
      tags: ["린우드", "가성비", "한인밀집"] },
    { emoji: "🏫", name: "Federal Way SD", nameEn: "Federal Way SD — 가성비 남부",
      desc: lang === "ko"
        ? "Niche B+. 졸업률 84%. 광역 시애틀 최저 렌트 지역. 페더럴웨이·오번·타코마 연결. 다문화 학교 환경. 통학 필요 시 I-5 이용.\n📍 페더럴웨이·오번 북부 | 🔗 fwps.org"
        : "Niche B+. Grad rate 84%. Lowest rents in Greater Seattle. Federal Way, Auburn & Tacoma access. Diverse school environment.\n📍 Federal Way, north Auburn | 🔗 fwps.org",
      tags: ["페더럴웨이", "저렴렌트", "남부"] },
  ] : cityDistricts; // 비시애틀: 도시별 학군 데이터 자동 적용

  /* ── Tab 1: 지역 커뮤니티 칼리지 (CC) ── */
  const communityColleges = [
    { emoji: "🏛️", name: "Edmonds College", nameEn: "Edmonds College — 린우드 (한인 추천 #1)",
      desc: lang === "ko"
        ? "✅ 린우드 소재. 한인 밀집 지역 내 CC. 4년제 편입 준비 최적. UW·WSU·Western 편입률 높음. ESL·IELTS·英語 프로그램 풍부. 학비 약 $4,500/학기 (주민). Running Start 파트너 학교.\n📍 20000 68th Ave W, Lynnwood | 🔗 edcc.edu"
        : "✅ In Lynnwood — heart of Korean community. Best CC for 4-year transfer (UW, WSU, Western). Rich ESL & IELTS programs. Tuition ~$4,500/semester (resident). Running Start partner.\n📍 20000 68th Ave W, Lynnwood | 🔗 edcc.edu",
      tags: ["린우드", "편입", "한인 #1"] },
    { emoji: "🏛️", name: "Bellevue College", nameEn: "Bellevue College — 벨뷰 (기술·편입)",
      desc: lang === "ko"
        ? "✅ 워싱턴주 최대 CC. 학생 수 약 33,000명. 4년제 학사 학위 직접 수여 (별도 편입 불필요). IT·회계·간호·그래픽디자인 특화. 아시안 학생 비율 높음 (~35%). UW 편입 경쟁 치열.\n📍 3000 Landerholm Circle SE, Bellevue | 🔗 bellevuecollege.edu"
        : "✅ WA's largest CC (~33,000 students). Offers 4-year bachelor's degrees directly. Specialized IT, accounting, nursing & graphic design. ~35% Asian students. Competitive UW transfer.\n📍 3000 Landerholm Circle SE, Bellevue | 🔗 bellevuecollege.edu",
      tags: ["벨뷰", "최대규모", "4년제학위"] },
    { emoji: "🏛️", name: "Seattle Central College", nameEn: "Seattle Central — 캐피톨힐 (예술·국제)",
      desc: lang === "ko"
        ? "시애틀 캐피톨힐 소재. 영화·요리·예술 특화. 국제학생 영어 집중 과정(IEP) 운영. 시내 접근성 최고. 학비 약 $4,300/학기 (주민).\n📍 1701 Broadway, Seattle | 🔗 seattlecentral.edu"
        : "Capitol Hill, Seattle. Specialized film, culinary & fine arts. Intensive English Program (IEP) for international students. Best downtown access.\n📍 1701 Broadway, Seattle | 🔗 seattlecentral.edu",
      tags: ["캐피톨힐", "예술", "국제학생"] },
    { emoji: "🏛️", name: "Cascadia College", nameEn: "Cascadia College — 보텔 (UW 코이그레이트)",
      desc: lang === "ko"
        ? "✅ 보텔 소재. UW Bothell 캠퍼스와 부지 공유. UW Bothell 편입 보장 프로그램 (Running Start·DTA). 이공계·비즈니스 편입 경쟁률 낮음. 학비 약 $4,000/학기 (주민).\n📍 18345 Campus Way NE, Bothell | 🔗 cascadia.edu"
        : "✅ Shares campus with UW Bothell. Guaranteed transfer pathway to UW Bothell (DTA). Lower competition for STEM & business transfer. Tuition ~$4,000/semester (resident).\n📍 18345 Campus Way NE, Bothell | 🔗 cascadia.edu",
      tags: ["보텔", "UW편입보장", "이공계"] },
    { emoji: "🏛️", name: "Shoreline Community College", nameEn: "Shoreline CC — 쇼어라인 (의료·기술)",
      desc: lang === "ko"
        ? "쇼어라인 소재. 의료 보조(Medical Assistant)·방사선사·간호 보조 특화. 직업 기술 빠른 취업 루트. 학비 약 $4,200/학기 (주민). 한인 학생 커뮤니티 소규모.\n📍 16101 Greenwood Ave N, Shoreline | 🔗 shoreline.edu"
        : "Shoreline. Specialized medical assistant, radiologic tech & nursing assistant programs. Fast career path. Tuition ~$4,200/semester.\n📍 16101 Greenwood Ave N, Shoreline | 🔗 shoreline.edu",
      tags: ["쇼어라인", "의료", "직업훈련"] },
    { emoji: "💡", name: "CC → UW 편입 전략", nameEn: "CC → UW Transfer Pathway",
      desc: lang === "ko"
        ? "📋 편입 필수 조건:\n• GPA 3.5+ (경쟁 전공: CS·엔지니어링·비즈니스)\n• DTA(Direct Transfer Agreement) 이수\n• IGETC 또는 전공 전제 과목 완료\n\n🗓️ 편입 일정:\n• 1월 15일: UW 편입 지원 마감 (가을 학기)\n• 4월: 합격 통보\n• 매년 약 1,200명 CC 편입생 UW 합격\n\n💰 장학금: UW Transfer Scholarship (최대 $5,000/년). 🔗 admit.uw.edu/transfer"
        : "📋 Transfer Requirements:\n• GPA 3.5+ (competitive majors: CS, engineering, business)\n• Direct Transfer Agreement (DTA) completion\n• Prerequisite courses for intended major\n\n🗓️ Timeline:\n• Jan 15: UW transfer application deadline (fall quarter)\n• April: Decision notifications\n• ~1,200 CC transfer students admitted to UW annually\n\n💰 UW Transfer Scholarship (up to $5,000/yr). 🔗 admit.uw.edu/transfer",
      tags: ["편입전략", "GPA3.5+", "장학금"] },
  ];

  /* ── Tab 2: 4년제 대학 ── */
  const universities = [
    { emoji: "🎓", name: "University of Washington (UW)", nameEn: "UW Seattle — Public Ivy · 세계 Top 30",
      desc: lang === "ko"
        ? "✅ 시애틀 소재. QS 세계 순위 59위 (2025). 워싱턴주 최고 명문. CS·의대·공대·경영·간호 세계적 수준.\n• 재학생: 약 53,000명 | 한인 학생 약 2,000+명\n• 주립 학비: ~$12,000/년 (in-state) | 국제: ~$40,000/년\n• 합격률: 48% (전체) / CS 전공 경쟁률 매우 높음\n• 한인 학생회(Korean Student Association) 활발 | 🔗 uw.edu"
        : "✅ Seattle. QS World Rank #59 (2025). WA's flagship university. World-class CS, medicine, engineering, business & nursing.\n• ~53,000 students | ~2,000+ Korean students\n• In-state tuition: ~$12,000/yr | International: ~$40,000/yr\n• Acceptance rate: 48% | CS is highly competitive\n• Active Korean Student Association | 🔗 uw.edu",
      tags: ["UW", "세계Top60", "CS·의대"] },
    { emoji: "🎓", name: "UW Bothell", nameEn: "UW Bothell — 보텔 캠퍼스 (STEM·비즈니스)",
      desc: lang === "ko"
        ? "✅ 보텔 소재. UW 3개 캠퍼스 중 하나. Cascadia College와 캠퍼스 공유. CS·엔지니어링·비즈니스 강점. UW Seattle보다 합격률 높음 (60%+). 한인 학생 다수. 주립 학비 ~$11,000/년.\n📍 18115 Campus Way NE, Bothell | 🔗 uwb.edu"
        : "✅ Bothell. One of 3 UW campuses. Shares campus with Cascadia College. Strong CS, engineering & business. Higher acceptance rate than UW Seattle (60%+). Many Korean students.\n📍 18115 Campus Way NE, Bothell | 🔗 uwb.edu",
      tags: ["UW보텔", "보텔", "높은합격률"] },
    { emoji: "🎓", name: "Seattle University (시애틀U)", nameEn: "Seattle University — 예수회 명문",
      desc: lang === "ko"
        ? "✅ 시애틀 다운타운 소재. 예수회(Jesuit) 대학. 법대·비즈니스·간호·심리 강점. 한인 유학생 커뮤니티 활발. 국제학생 장학금(최대 $20,000/년) 있음. 학비 ~$52,000/년 (전액 장학금 가능).\n📍 901 12th Ave, Seattle | 🔗 seattleu.edu"
        : "✅ Downtown Seattle. Jesuit university. Strong law, business, nursing & psychology. Active Korean student community. International scholarships up to $20,000/yr. Tuition ~$52,000/yr.\n📍 901 12th Ave, Seattle | 🔗 seattleu.edu",
      tags: ["시애틀대", "예수회", "국제장학금"] },
    { emoji: "🎓", name: "Western Washington University (WWU)", nameEn: "WWU — 벨링햄 (가성비 명문)",
      desc: lang === "ko"
        ? "벨링햄 소재 (시애틀 북쪽 80마일). Niche A-. 교육학·환경학·비즈니스 강점. 주립 학비 ~$8,800/년. 합격률 82% (비교적 진입 쉬움). 캐나다 밴쿠버 국경 인근.\n📍 516 High St, Bellingham | 🔗 wwu.edu"
        : "Bellingham (80 miles north of Seattle). Niche A-. Strong education, environmental studies & business. In-state tuition ~$8,800/yr. Acceptance rate 82%.\n📍 516 High St, Bellingham | 🔗 wwu.edu",
      tags: ["WWU", "벨링햄", "가성비"] },
    { emoji: "🎓", name: "Washington State University (WSU)", nameEn: "WSU Pullman — 주립 2위",
      desc: lang === "ko"
        ? "풀먼 소재 (시애틀 동쪽 280마일). 공대·수의학·농업 전국 강자. 주립 학비 ~$12,600/년. WSU Everett 분교 (에버렛 — 시애틀 30마일권). 합격률 79%.\n📍 WSU Everett: 915 N Broadway, Everett | 🔗 wsu.edu"
        : "Pullman (280 miles east). Strong engineering, veterinary medicine & agriculture. In-state tuition ~$12,600/yr. WSU Everett branch campus (30 miles from Seattle). Acceptance 79%.\n📍 WSU Everett: 915 N Broadway, Everett | 🔗 wsu.edu",
      tags: ["WSU", "공대·수의학", "WSU에버렛"] },
  ];

  /* ── Tab 3: 대입 준비 ── */
  const admissions = [
    { emoji: "🏃", name: "Running Start 프로그램", nameEn: "Running Start — 고교생 무료 CC 수강",
      desc: lang === "ko"
        ? "✅ 워싱턴주 공립 고교생 대상 무료 대학 수업 프로그램 (11-12학년). 커뮤니티 칼리지 학점을 고교·대학 이중 학점으로 인정. 완전 무료 (교재비만 자부담). 매년 약 24,000명 이용.\n\n💡 한인 가족에게 특히 유리:\n• 고교 재학 중 최대 2년치 대학 학점 취득 가능\n• Edmonds College·Bellevue College·Cascadia 참여\n• 지원: 재학 고교 카운슬러 통해 신청 | 🔗 sbctc.edu/running-start"
        : "✅ Free college courses for WA public high school students (grades 11-12). Earn college AND high school credit simultaneously — completely free (only pay for books).\n\n💡 Especially valuable for Korean families:\n• Earn up to 2 years of college credit in high school\n• Participating schools: Edmonds, Bellevue, Cascadia colleges\n• Apply through your high school counselor | 🔗 sbctc.edu/running-start",
      tags: ["무료", "이중학점", "11-12학년"] },
    { emoji: "📝", name: "SAT·ACT 준비 센터 (광역 시애틀)", nameEn: "SAT/ACT Prep — Greater Seattle",
      desc: lang === "ko"
        ? "📍 한인 밀집 지역 주요 학원:\n• Score At The Top (벨뷰) — SAT/ACT 한국어 강의 가능\n• Ivy Way Academy (벨뷰·시애틀) — 한인 강사 다수, 대입 컨설팅 포함\n• Princeton Review (온라인+오프라인) — 표준화 시험 최강\n• Khan Academy — 무료 SAT 공식 연습 (College Board 협력) 🔗 collegeboard.org\n\n🎯 목표 점수 가이드:\nUW 합격선 SAT ~1200-1400 | CS전공 1400+\nBellevue College 입학 최소 요건 없음 (오픈 어드미션)"
        : "📍 Korean tutoring centers in Greater Seattle:\n• Score At The Top (Bellevue) — Korean-speaking instructors available\n• Ivy Way Academy (Bellevue/Seattle) — Korean instructors, college consulting\n• Princeton Review — top SAT/ACT standard prep\n• Khan Academy — free official SAT practice (College Board partner) 🔗 collegeboard.org\n\n🎯 Target scores:\nUW SAT ~1200-1400 | CS major: 1400+\nBellevue College: open admission (no minimum)",
      tags: ["SAT·ACT", "벨뷰학원", "무료Khan"] },
    { emoji: "🏫", name: "광역 시애틀 명문 고등학교 TOP", nameEn: "Top High Schools — Greater Seattle",
      desc: lang === "ko"
        ? "📊 Niche 기준 상위 고교 (2025):\n1. International School (벨뷰 SD) — 전국 Top 1%, IB 디플로마, 경쟁 입시\n2. Newport High School (벨뷰 SD) — AP 과정 최다, 한인 학생 많음\n3. Interlake High School (벨뷰 SD) — STEM·로보틱스 강점\n4. Mercer Island HS — 소규모 명문, 전국 1%\n5. Redmond High School (LWSD) — MS 인근 STEM\n6. Inglemoor High School (Northshore SD) — 한인 가족 최다\n\n💡 한인에게 TIP: 학군은 거주 주소 자동 배정 → 집 구하기 전 학군 확인 필수!"
        : "📊 Niche top high schools (2025):\n1. International School (Bellevue SD) — National top 1%, IB Diploma, competitive admission\n2. Newport High School (Bellevue SD) — Most AP courses, many Korean students\n3. Interlake High School (Bellevue SD) — STEM & robotics strength\n4. Mercer Island HS — Small elite school, national top 1%\n5. Redmond High School (LWSD) — Near Microsoft, strong STEM\n6. Inglemoor High School (Northshore SD) — Highest Korean family concentration\n\n💡 TIP: School district = home address. Check the district BEFORE renting!",
      tags: ["명문고교", "IB", "Niche Top"] },
    { emoji: "📋", name: "UW 합격 전략 (한인 학생 기준)", nameEn: "UW Admission Strategy for Korean Students",
      desc: lang === "ko"
        ? "📊 UW 합격 통계 (2024 입학생 기준):\n• 합격률: 전체 48% / CS전공 15% (매우 경쟁)\n• 평균 GPA: 3.82 (비가중) / SAT: 1280-1480\n• 지원 마감: 11월 15일 (가을 입학)\n• 조기 전형(EA) 없음 — 단일 일반 전형\n\n💡 한인 학생 전략:\n① AP·IB 과정 최대한 이수 (특히 CS·수학·과학)\n② 리더십 활동 (학생회·DECA·로보틱스)\n③ UW 인터뷰 없음 — 에세이 품질이 핵심\n④ 비교과: 독창적 프로젝트 or 커뮤니티 기여\n🔗 admit.uw.edu | Common App: 🔗 commonapp.org | 학교 검색: 🔗 niche.com"
        : "📊 UW Admission Stats (Class of 2024):\n• Acceptance: 48% overall / CS major 15% (very competitive)\n• Avg unweighted GPA: 3.82 / SAT: 1280-1480\n• Deadline: November 15 (fall quarter)\n• No Early Action — single round admissions\n\n💡 Strategy for Korean students:\n① Max AP/IB courses (especially CS, math, science)\n② Leadership (student council, DECA, robotics)\n③ No UW interview — essays are critical\n④ Extracurriculars: unique projects or community service\n🔗 admit.uw.edu | Common App: 🔗 commonapp.org | School search: 🔗 niche.com",
      tags: ["UW전략", "합격률48%", "에세이"] },
    { emoji: "💰", name: "장학금·학비 지원 총정리", nameEn: "Financial Aid & Scholarships — Korean Students",
      desc: lang === "ko"
        ? "💵 주요 장학금:\n• FAFSA (연방 지원) — 영주권·시민권자 필수 신청 (10월 1일 오픈) 🔗 studentaid.gov\n• Washington College Grant (WCG) — 주 소득 기준 최대 $15,000/년\n• UW Husky Promise — 가구소득 $75,000 이하 학비 전액 (주민)\n• Korean American Scholarship Foundation (KASF) — 한인 2세 전용 🔗 kasf.org\n• 한인회 장학금 — 지역 한인회·교회 수시 공고\n\n📝 국제학생: FAFSA 대상 아님 → 각 학교 국제학생 장학금 별도 신청 필수"
        : "💵 Key scholarships:\n• FAFSA (federal aid) — mandatory for PR/citizens (opens Oct 1) 🔗 studentaid.gov\n• Washington College Grant (WCG) — up to $15,000/yr based on income\n• UW Husky Promise — full tuition for households under $75,000 (residents)\n• Korean American Scholarship Foundation (KASF) — for 2nd-gen Koreans 🔗 kasf.org\n• Korean community scholarships — check local Korean associations & churches\n\n📝 International students: not FAFSA eligible → apply for each school's international scholarships separately",
      tags: ["FAFSA", "KASF", "WCG장학금"] },
  ];

  /* ── Tab 4: 학원·ESL ── */
  const tutoringEsl = [
    { emoji: "📚", name: "한인 학원·과외 (린우드·벨뷰)", nameEn: "Korean Tutoring Centers — Lynnwood & Bellevue",
      desc: lang === "ko"
        ? "린우드·벨뷰 한인 학원 다수 운영 중. SAT·ACT·AP수학·과학·영어 전문.\n\n주요 학원:\n• Ivy Way Academy (벨뷰) — 대입 컨설팅 포함, 한인 강사\n• Score At The Top (벨뷰) — 표준화 시험 특화\n• Mathnasium (린우드·벨뷰) — 수학 전문 프랜차이즈\n• 개인 과외: $60-100/시, 카카오오픈채팅 '시애틀한인' 검색"
        : "Many Korean tutoring centers in Lynnwood & Bellevue. SAT, ACT, AP math, science & English.\n\nKey centers:\n• Ivy Way Academy (Bellevue) — includes college consulting, Korean instructors\n• Score At The Top (Bellevue) — standardized test specialists\n• Mathnasium (Lynnwood/Bellevue) — math franchise\n• Private tutors: $60-100/hr, search KakaoTalk '시애틀한인'",
      tags: ["학원", "SAT·AP", "린우드·벨뷰"] },
    { emoji: "🌍", name: "국제학생 ESL·어학원", nameEn: "ESL & English Language Schools",
      desc: lang === "ko"
        ? "✅ 추천 ESL 프로그램:\n• Edmonds College ESL/IEP — 린우드 소재, 한인 커뮤니티 인근, 저렴 | 🔗 edcc.edu\n• Seattle Central College IEP — 시내 소재, 국제 분위기\n• ELS Language Centers Seattle — 집중 영어 과정 (사설)\n• Kaplan International — IELTS·TOEFL 집중반\n• 무료: Public Library ESL — 킹카운티 도서관 무료 영어 수업"
        : "✅ Recommended ESL programs:\n• Edmonds College ESL/IEP — Lynnwood, near Korean community, affordable | 🔗 edcc.edu\n• Seattle Central College IEP — downtown, international environment\n• ELS Language Centers Seattle — intensive private courses\n• Kaplan International — IELTS/TOEFL intensive\n• FREE: Public Library ESL — King County Library free English classes",
      tags: ["ESL", "어학", "무료강좌"] },
    { emoji: "👶", name: "유아·초등 교육 (프리스쿨·K-12)", nameEn: "Early Childhood & K-12 Resources",
      desc: lang === "ko"
        ? "🍼 프리스쿨 (Pre-K) 옵션:\n• ECEAP (Washington State) — 소득 기준 무료 프리스쿨 🔗 dcyf.wa.gov\n• Head Start — 연방 무료 프리스쿨 (소득 기준) 🔗 acf.hhs.gov/ohs\n• 한인 교회 운영 주일학교 겸 주중 프리스쿨 다수\n\n📚 K-12 지원:\n• 한국어-영어 이중언어 교육: Seattle Public Schools 일부 학교 운영\n• 무료 방과후 튜터링: Boys & Girls Club 🔗 bgcs.org | YMCA 🔗 seattleymca.org\n• 학교 급식 무료: 소득 기준 — USDA National School Lunch Program"
        : "🍼 Pre-K options:\n• ECEAP (WA State) — free preschool by income 🔗 dcyf.wa.gov\n• Head Start — federal free preschool (income-based) 🔗 acf.hhs.gov/ohs\n• Several Korean churches operate weekday preschools\n\n📚 K-12 support:\n• Korean-English bilingual education: available in some Seattle Public Schools\n• Free after-school tutoring: Boys & Girls Club 🔗 bgcs.org | YMCA 🔗 seattleymca.org\n• Free school meals: USDA National School Lunch Program (income-based)",
      tags: ["프리스쿨", "무료K-12", "이중언어"] },
    { emoji: "💼", name: "성인 교육·직업 훈련", nameEn: "Adult Education & Vocational Training",
      desc: lang === "ko"
        ? "✅ 성인 한인 이민자를 위한 교육 자원:\n• WorkSource WA — 무료 직업 훈련·이력서 코칭·취업 연결 🔗 worksourcewa.com\n• Goodwill Job Training — 무료 직업 기술 훈련 (컴퓨터·소매·의료) 🔗 goodwillwa.org\n• Edmonds College 평생교육 — 저렴한 성인 직업 과정\n• ACRS (Asian Counseling & Referral Service) — 한국어 지원 취업 서비스 🔗 acrs.org\n• KCSC (한인생활상담소) — 한국어 취업 상담·이력서 도움 🔗 kcsc-seattle.org"
        : "✅ Educational resources for adult Korean immigrants:\n• WorkSource WA — free job training, resume coaching & job placement 🔗 worksourcewa.com\n• Goodwill Job Training — free vocational skills (computer, retail, medical) 🔗 goodwillwa.org\n• Edmonds College Continuing Education — affordable adult vocational courses\n• ACRS — employment services with Korean language support 🔗 acrs.org\n• KCSC (Korean Community Service Center) — Korean-language job counseling 🔗 kcsc-seattle.org",
      tags: ["성인교육", "직업훈련", "무료"] },
  ];

  /* ── 한국학교 데이터 ── */
  const koreanSchools = [
    { emoji: "🇰🇷", name: lang === "ko" ? "시애틀한국학교 (Seattle Korean School)" : "Seattle Korean School",
      desc: lang === "ko"
        ? "✅ WA주 최대 한국학교. 한인 2세·1.5세 한국어 교육.\n📅 매주 토요일 오전\n과정: 유치부·초등부·중등부·고등부·성인반\nTOPIK(한국어능력시험) 준비 반 운영\n🔗 seattlekoreanschool.org"
        : "✅ Largest Korean school in WA. Education for 2nd/1.5-gen Koreans.\n📅 Every Saturday morning\nPrograms: preschool, elementary, middle, high school, adult\nTOPIK (Korean Proficiency Test) prep available\n🔗 seattlekoreanschool.org",
      tags: lang === "ko" ? ["한국학교", "토요한글", "TOPIK"] : ["Korean School", "Saturday", "TOPIK"] },
    { emoji: "📖", name: lang === "ko" ? "교회 부설 한국학교 (주요 교회)" : "Church-Based Korean Schools",
      desc: lang === "ko"
        ? "많은 한인 교회가 자체 한국학교 운영:\n• 시애틀지구촌교회 (GMC): 주일학교 겸 한국어 교육 🔗 ijiguchon.org\n• 벨뷰 지역 교회: 토요 한국학교 다수\n• 린우드 지역 교회: 한국어·역사·문화 병행\n\n장점: 교회 멤버십으로 학비 할인·무료"
        : "Many Korean churches run their own Korean schools:\n• Global Mission Church (GMC): Sunday school + Korean 🔗 ijiguchon.org\n• Bellevue Korean churches: multiple Saturday programs\n• Lynnwood Korean churches: language, history & culture\n\nBenefit: Discounted or free tuition for members",
      tags: lang === "ko" ? ["교회한국학교", "주일학교", "무료"] : ["Church School", "Sunday School", "Free"] },
    { emoji: "📊", name: lang === "ko" ? "재미한국학교 서북미협의회 (NAKS-PNW)" : "Korean Schools of America — PNW (NAKS)",
      desc: lang === "ko"
        ? "WA·OR·ID 한국학교 총괄 협의회. 전체 회원 학교 목록·등록 정보.\n🔗 nakspnw.org\n\n• 매년 봄 한국어 말하기·글쓰기 대회\n• 여름 집중 한국어 캠프 (1-2주)\n• 학교 찾기: nakspnw.org → 지역별 필터"
        : "Regional council for Korean schools in WA, OR & ID.\n🔗 nakspnw.org\n\n• Annual Korean speech & writing competition\n• Summer intensive Korean camps (1-2 weeks)\n• Find a school: nakspnw.org → filter by area",
      tags: lang === "ko" ? ["서북미협의회", "NAKS", "한국어대회"] : ["NAKS-PNW", "Korean Schools", "Competition"] },
    { emoji: "🥋", name: lang === "ko" ? "한국 문화·예술 교육 프로그램" : "Korean Culture & Arts Programs",
      desc: lang === "ko"
        ? "한국어 외 문화 교육 옵션:\n\n🥋 태권도: 린우드·페더럴웨이 한인 도장 다수. 주 2-3회, 월 $80-150\n🎵 가야금·장구: 교회·문화센터 클래스\n🎭 한국 전통 무용: Seattle Korean Dance Group\n💃 K-pop 댄스: 린우드·벨뷰 학원 다수\n\n정보: kSeattle.com 또는 카카오오픈채팅 '시애틀한인'"
        : "Cultural education beyond language:\n\n🥋 Taekwondo: Multiple Korean dojangs in Lynnwood & Federal Way. 2-3x/week, $80-150/month\n🎵 Gayageum & Janggu: church & cultural center classes\n🎭 Traditional Korean Dance: Seattle Korean Dance Group\n💃 K-pop Dance: studios in Lynnwood & Bellevue\n\nInfo: kSeattle.com or KakaoTalk '시애틀한인'",
      tags: lang === "ko" ? ["태권도", "한국무용", "K-pop"] : ["Taekwondo", "Korean Dance", "K-pop"] },
    { emoji: "🎓", name: lang === "ko" ? "AP 한국어 — 대입 활용법" : "AP Korean — College Application Value",
      desc: lang === "ko"
        ? "✅ 한국어 AP 시험은 대입에서 큰 강점!\n• SAT Subject Test 대체 가능\n• 대학 학점 인정 (4-8학점 절약, 약 $2,000-4,000 상당)\n• Native Speaker 전형 별도 — 한국어 원어민에게 유리\n• TOPIK 점수도 일부 대학에서 어학 능력 증빙으로 인정\n\n시험 등록: collegeboard.org | 매년 5월 시험"
        : "✅ AP Korean is a major advantage for college apps!\n• Can substitute for SAT Subject Test\n• College credit recognition (4-8 credits, worth $2,000-4,000)\n• Native Speaker track available — advantage for heritage speakers\n• TOPIK scores accepted by some universities as language proficiency\n\nRegister: collegeboard.org | Exam in May each year",
      tags: lang === "ko" ? ["AP한국어", "대입", "학점인정"] : ["AP Korean", "College", "Credit"] },
  ];

  // 도시별 CC·한국학교 데이터 오버라이드 (시애틀 제외)
  const cityCC = isSeattle ? communityColleges : getCityCC(city.slug, lang);
  const cityKoreanSchools = isSeattle ? koreanSchools : getCityKoreanSchool(city.slug, lang);

  const allEdu = serverContent["education"] ? resolvePlaceItems(serverContent["education"], lang) : null;
  const subData = allEdu
    ? [allEdu.slice(0, 6), allEdu.slice(6, 12), allEdu.slice(12, 17), allEdu.slice(17, 22), allEdu.slice(22, 27), allEdu.slice(27)]
    : [districts, cityCC, universities, admissions, tutoringEsl, cityKoreanSchools];
  const content = subData[sub] ?? [];

  /* ── 탭별 하단 팁 ── */
  const tips = [
    { icon: "🏠", ko: "학군은 거주 주소 기준 자동 배정. 집 계약 전 반드시 학군 확인 (niche.com → School Districts). 한인 밀집 Northshore SD(보텔)·Edmonds SD(린우드)가 가성비 최고.", en: "School district is assigned by home address. Always check the district before signing a lease (niche.com → School Districts). Northshore SD (Bothell) & Edmonds SD (Lynnwood) offer the best value for Korean families." },
    { icon: "🔄", ko: "CC → 4년제 편입 핵심: 첫 학기부터 DTA(편입 보장 협약) 과목 수강. GPA 3.5+를 유지하면 UW Seattle 편입 가능. 에드먼즈CC·캐스케이디아가 한인에게 최적.", en: "CC → 4-year transfer key: enroll in DTA (transfer agreement) courses from day one. Maintain GPA 3.5+ for UW Seattle transfer. Edmonds CC and Cascadia are top choices for Korean students." },
    { icon: "🎓", ko: "UW는 11월 15일 마감 (한 번만 지원 가능). CS·엔지니어링은 UW Seattle 경쟁률이 높으니 UW Bothell을 함께 고려. 주립 학비 in-state가 국제보다 3배 저렴.", en: "UW deadline is Nov 15 (single round). CS & Engineering at UW Seattle are very competitive — consider UW Bothell. In-state tuition is 3× cheaper than international." },
    { icon: "🏃", ko: "Running Start는 워싱턴주 공립 고교생만 대상 (11-12학년). 완전 무료 (교재비만). Edmonds College·Bellevue College·Cascadia 참여. 졸업 시 최대 2년치 학점 취득 가능.", en: "Running Start is for WA public HS students (grades 11-12) only. Completely free (books only). Participating: Edmonds, Bellevue & Cascadia. Earn up to 2 years of college credit before graduating." },
    { icon: "💵", ko: "ESL은 커뮤니티 칼리지가 사설 어학원보다 훨씬 저렴 (1/3 가격). 킹카운티 공공도서관 ESL은 무료. 직업 훈련은 WorkSource WA를 먼저 확인 — 무료가 많음.", en: "Community college ESL is far cheaper than private language schools (1/3 the price). King County Library ESL is free. For job training, check WorkSource WA first — many programs are free." },
    { icon: "🇰🇷", ko: "한국학교 등록은 이른 봄(2-3월)에 마감되는 경우가 많습니다. 자녀의 한국어 교육은 빠를수록 좋습니다 — 5세 전 시작이 가장 효과적. nakspnw.org에서 가까운 학교 검색!", en: "Korean school enrollment often closes in early spring (Feb-Mar). Starting Korean language education early is most effective — before age 5 is ideal. Find a nearby school at nakspnw.org!" },
  ];
  const tip = tips[sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🎓" titleKo="교육 가이드" titleEn="Education Guide"
        descKo={`${useCityConfig().nameKo} 광역권 — 학군·CC·대학·대입 완전 가이드`}
        descEn={`Greater ${useCityConfig().nameEn} — School districts, CC, universities & admissions`}
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
        </div>
        <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>
            {tip.icon} {lang === "ko" ? "꼭 알아야 할 팁" : "Key Tip"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)", whiteSpace: "pre-line" }}>
            {lang === "ko" ? tip.ko : tip.en}
          </div>
        </div>
        {/* 교육 탭 — 헤브론 튜터 서비스 카드 */}
        <div style={{ padding: "0 16px 8px" }}>
          <HebronServiceCard
            icon="📚" color="#8B5CF6" lang={lang}
            titleKo="헤브론 튜터 — 한인 선배가 직접 가르칩니다"
            titleEn="Hebron Tutor — Learn from Korean Community Mentors"
            descKo="수학·SAT·AP·한국어 과외. 꼼꼼히 확인된 한인 튜터. 온라인으로 44개+ 도시 가능."
            descEn="Math, SAT, AP, Korean tutoring. Carefully selected Korean tutors. Online across 44+ cities."
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 9: 생활비 — 도시별 데이터
───────────────────────────────────────── */
function getCityCostData(slug: string, lang: string) {
  const ko = lang === "ko";
  type CostItem = { emoji: string; name: string; nameEn?: string; desc: string; tags: string[] };
  type CostData = { rentHousing: CostItem[]; taxLiving: CostItem[]; transportPhone: CostItem[] };

  const DATA: Record<string, CostData> = {
    seattle: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 린우드/페더럴웨이: 스튜디오 $1,300-1,700 | 1BR $1,700-2,100 | 2BR $2,100-2,600\n📍 벨뷰: 스튜디오 $1,800-2,300 | 1BR $2,200-2,900 | 2BR $2,800-3,500\n📍 시애틀 시내: 스튜디오 $1,700-2,200 | 1BR $2,100-2,800 | 2BR $2,500-3,200"
            : "📍 Lynnwood/Federal Way: Studio $1,300-1,700 | 1BR $1,700-2,100 | 2BR $2,100-2,600\n📍 Bellevue: Studio $1,800-2,300 | 1BR $2,200-2,900 | 2BR $2,800-3,500\n📍 Downtown Seattle: Studio $1,700-2,200 | 1BR $2,100-2,800 | 2BR $2,500-3,200",
          tags: ["렌트", "주거", "비교"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "✅ 워싱턴주 소득세 없음! (큰 장점)\n판매세(Sales Tax): 시애틀 10.4%\n식료품·처방약: 세금 면제\n시애틀 최저시급: $20.76/시 (2026년)\n재산세: 주택 소유 시 연 $5,000-15,000"
            : "✅ WA State has NO income tax! (major benefit)\nSales Tax: 10.4% in Seattle\nGroceries & prescription drugs: tax-exempt\nSeattle minimum wage: $20.76/hr (2026)\nProperty tax: ~$5,000-15,000/yr if you own",
          tags: ["세금", "소득세없음", "최저시급"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 린우드): $1,800-2,000\n• 식료품: $300-500\n• 교통 (버스+ORCA): $100-130\n• 공과금 (전기·인터넷): $150-200\n• 외식·여가: $200-400\n⟹ 합계: 약 $2,550-3,230/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Lynnwood): $1,800-2,000\n• Groceries: $300-500\n• Transit (bus+ORCA): $100-130\n• Utilities (electric+internet): $150-200\n• Dining out & leisure: $200-400\n⟹ Total: ~$2,550-3,230/month",
          tags: ["생활비", "월평균", "예산"] },
      ],
      transportPhone: [
        { emoji: "⛽", name: "교통·기름값", nameEn: "Transportation & Gas",
          desc: ko
            ? "🚗 WA주 기름값: $3.80-4.50/갤런 (2026년)\n🚌 Metro 버스: $2.75/회 (ORCA) 🔗 kingcounty.gov/metro\n🚇 Link Light Rail: $2.00-3.50 (거리별) 🔗 soundtransit.org\n🅿️ 시애틀 다운타운 주차: $3-8/시간\n💡 린우드 거주 시 대부분 차량 필요"
            : "🚗 WA gas: $3.80-4.50/gallon (2026)\n🚌 Metro bus: $2.75/ride (ORCA) 🔗 kingcounty.gov/metro\n🚇 Link Light Rail: $2.00-3.50 (distance-based) 🔗 soundtransit.org\n🅿️ Downtown Seattle parking: $3-8/hr\n💡 Car almost essential if living in Lynnwood",
          tags: ["기름값", "주차", "교통비"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 휴대폰:\n• T-Mobile Prepaid: $30/월 (무제한 문자+통화+5GB) 🔗 t-mobile.com\n• Mint Mobile: $15/월 (온라인 3개월 선불) 🔗 mintmobile.com\n• AT&T: 🔗 att.com\n• Verizon 가족 플랜: $40-55/회선\n\n🌐 인터넷:\n• Xfinity: $40-80/월\n• CenturyLink/Lumen: $50-65/월\n• 기가 인터넷: $70-100/월"
            : "📱 Phone:\n• T-Mobile Prepaid: $30/mo (unlimited) 🔗 t-mobile.com\n• Mint Mobile: $15/mo (3-month prepaid) 🔗 mintmobile.com\n• AT&T: 🔗 att.com\n• Verizon family plan: $40-55/line\n\n🌐 Internet:\n• Xfinity: $40-80/mo\n• CenturyLink/Lumen: $50-65/mo\n• Gigabit internet: $70-100/mo",
          tags: ["통신비", "인터넷", "휴대폰"] },
      ],
    },
    dallas: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 캐롤튼/플라노(한인 밀집): 스튜디오 $1,100-1,400 | 1BR $1,400-1,700 | 2BR $1,700-2,100\n📍 알링턴/어빙: 스튜디오 $1,000-1,300 | 1BR $1,200-1,600 | 2BR $1,600-2,000\n📍 달라스 시내: 스튜디오 $1,300-1,700 | 1BR $1,600-2,200 | 2BR $2,000-2,700"
            : "📍 Carrollton/Plano (Korean hub): Studio $1,100-1,400 | 1BR $1,400-1,700 | 2BR $1,700-2,100\n📍 Arlington/Irving: Studio $1,000-1,300 | 1BR $1,200-1,600 | 2BR $1,600-2,000\n📍 Downtown Dallas: Studio $1,300-1,700 | 1BR $1,600-2,200 | 2BR $2,000-2,700",
          tags: ["렌트", "달라스", "비교"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "✅ 텍사스주 소득세 없음! (큰 장점)\n판매세(Sales Tax): 달라스 8.25%\n식료품·처방약: 세금 면제\n텍사스 최저시급: $7.25/시 (연방 기준)\n재산세: 집값 대비 높음 (약 1.8-2.5%/년)"
            : "✅ Texas has NO state income tax! (major benefit)\nSales Tax: 8.25% in Dallas\nGroceries & prescription drugs: tax-exempt\nTexas minimum wage: $7.25/hr (federal rate)\nProperty tax: relatively high (~1.8-2.5%/yr)",
          tags: ["세금", "소득세없음", "텍사스"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 캐롤튼): $1,400-1,700\n• 식료품: $300-450\n• 교통 (DART+차량): $80-120 + 기름값\n• 공과금 (전기·인터넷): $120-180\n• 외식·여가: $200-350\n⟹ 합계: 약 $2,100-2,800/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Carrollton): $1,400-1,700\n• Groceries: $300-450\n• Transport (DART+car): $80-120 + gas\n• Utilities (electric+internet): $120-180\n• Dining out & leisure: $200-350\n⟹ Total: ~$2,100-2,800/month",
          tags: ["생활비", "월평균", "달라스"] },
      ],
      transportPhone: [
        { emoji: "⛽", name: "교통·기름값", nameEn: "Transportation & Gas",
          desc: ko
            ? "🚗 TX주 기름값: $2.80-3.40/갤런 (2026년) — 전국 최저 수준\n🚌 DART 버스·전철: $2.50/회 🔗 dart.org\n🚗 달라스는 차량 필수 도시 (대중교통 범위 제한)\n🛣️ I-35, I-635, Hwy 121 고속도로 발달\n💡 캐롤튼·플라노 거주 시 차량 필수"
            : "🚗 TX gas: $2.80-3.40/gallon (2026) — among nation's cheapest\n🚌 DART bus/rail: $2.50/ride 🔗 dart.org\n🚗 Dallas is a car-required city (limited transit coverage)\n🛣️ Extensive freeways — I-35, I-635, Hwy 121\n💡 Car essential if living in Carrollton or Plano",
          tags: ["기름값", "DART", "달라스교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 전국 통신사 동일 — T-Mobile·AT&T·Verizon 경쟁 치열\n• T-Mobile Prepaid: $30/월 (무제한)\n• AT&T 달라스 커버리지 우수\n🌐 인터넷:\n• AT&T Fiber (달라스 우수): $55-80/월\n• Spectrum: $50-70/월\n• Xfinity: $40-80/월"
            : "📱 National carriers same — T-Mobile, AT&T, Verizon all competitive\n• T-Mobile Prepaid: $30/mo (unlimited)\n• AT&T has excellent Dallas coverage\n🌐 Internet:\n• AT&T Fiber (great Dallas coverage): $55-80/mo\n• Spectrum: $50-70/mo\n• Xfinity: $40-80/mo",
          tags: ["통신비", "AT&T", "인터넷"] },
      ],
    },
    la: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 코리아타운/윌셔(한인 밀집): 스튜디오 $1,800-2,300 | 1BR $2,200-2,800 | 2BR $2,800-3,500\n📍 토런스/가디나: 스튜디오 $1,600-2,000 | 1BR $1,900-2,400 | 2BR $2,400-3,000\n📍 어바인: 스튜디오 $2,000-2,500 | 1BR $2,400-3,000 | 2BR $3,000-3,800"
            : "📍 Koreatown/Wilshire (Korean hub): Studio $1,800-2,300 | 1BR $2,200-2,800 | 2BR $2,800-3,500\n📍 Torrance/Gardena: Studio $1,600-2,000 | 1BR $1,900-2,400 | 2BR $2,400-3,000\n📍 Irvine: Studio $2,000-2,500 | 1BR $2,400-3,000 | 2BR $3,000-3,800",
          tags: ["렌트", "LA", "코리아타운"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "⚠️ 캘리포니아 소득세 최고 13.3%!\n판매세(Sales Tax): LA카운티 10.25%\n식료품: 세금 면제 / 조리된 음식: 과세\nCA 최저시급: $17.00/시 (계속 인상 중)\n\n💡 같은 연봉이라도 WA·TX보다 실수령액이 크게 낮음\n⚠️ 소득이 높을수록 세금 부담 체감이 매우 큼"
            : "⚠️ California income tax up to 13.3%!\nSales Tax: 10.25% in LA County\nGroceries: tax-exempt / Prepared food: taxed\nCA minimum wage: $17.00/hr (rising)\n\n💡 Same salary means much less take-home vs WA or TX\n⚠️ High earners feel the tax burden most severely",
          tags: ["소득세", "캘리포니아", "세금"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 토런스): $1,900-2,400\n• 식료품: $350-500\n• 교통 (Metro+차량): $100-150 + 기름값\n• 공과금: $120-200\n• 외식·여가: $250-450\n⟹ 합계: 약 $2,720-3,700/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Torrance): $1,900-2,400\n• Groceries: $350-500\n• Transit (Metro+car): $100-150 + gas\n• Utilities: $120-200\n• Dining out & leisure: $250-450\n⟹ Total: ~$2,720-3,700/month",
          tags: ["생활비", "LA", "월평균"] },
      ],
      transportPhone: [
        { emoji: "⛽", name: "교통·기름값", nameEn: "Transportation & Gas",
          desc: ko
            ? "🚗 CA주 기름값: $4.20-5.00/갤런 (2026년) — 전국 최고 수준\n🚌 Metro 버스·전철: $1.75/회 (TAP 카드) 🔗 metro.net\n🚇 Metro Rail (A·B·C·D·E·L 라인)\n🚗 LA는 차량 필수 (한인 밀집지역 대중교통 부족)\n💡 코리아타운 → Metro B·D 라인 접근 가능"
            : "🚗 CA gas: $4.20-5.00/gallon (2026) — nation's highest\n🚌 Metro bus/rail: $1.75/ride (TAP card) 🔗 metro.net\n🚇 Metro Rail (A, B, C, D, E, L lines)\n🚗 LA is car-required (limited transit in Korean areas)\n💡 Koreatown has Metro B & D Line access",
          tags: ["기름값", "Metro", "LA교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 전국 통신사 경쟁 (T-Mobile·AT&T·Verizon 우수 커버리지)\n• T-Mobile Prepaid: $30/월 (무제한)\n• Metro by T-Mobile: $25/월\n🌐 인터넷:\n• Spectrum (LA 주요): $50-70/월\n• AT&T Fiber: $55-80/월"
            : "📱 Major carriers competitive (T-Mobile, AT&T, Verizon all strong)\n• T-Mobile Prepaid: $30/mo (unlimited)\n• Metro by T-Mobile: $25/mo\n🌐 Internet:\n• Spectrum (LA's primary): $50-70/mo\n• AT&T Fiber: $55-80/mo",
          tags: ["통신비", "Spectrum", "인터넷"] },
      ],
    },
    newyork: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 플러싱(퀸스, 한인 밀집): 스튜디오 $1,800-2,300 | 1BR $2,100-2,700 | 2BR $2,600-3,400\n📍 팰리세이즈파크/포트리(NJ): 스튜디오 $1,600-2,000 | 1BR $1,900-2,500 | 2BR $2,400-3,100\n📍 맨해튼 미드타운: 스튜디오 $2,800-3,600 | 1BR $3,500-4,500 | 2BR $4,500-6,000"
            : "📍 Flushing (Queens, Korean hub): Studio $1,800-2,300 | 1BR $2,100-2,700 | 2BR $2,600-3,400\n📍 Palisades Park/Fort Lee (NJ): Studio $1,600-2,000 | 1BR $1,900-2,500 | 2BR $2,400-3,100\n📍 Manhattan Midtown: Studio $2,800-3,600 | 1BR $3,500-4,500 | 2BR $4,500-6,000",
          tags: ["렌트", "뉴욕", "플러싱"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "⚠️ NY주 소득세: 4-10.9% (누진)\n⚠️ NYC 시 소득세: 3.08-3.88% 추가!\n판매세: NYC 8.875%\n의류·식료품 ($110 이하): 면세\n뉴욕 최저시급: $16.50/시 (NYC)\nNJ 소득세: 1.4-10.75% (팰리세이즈 거주 시)\n\n💡 NJ 거주 + NY 근무 시 세금 복잡 — 반드시 CPA 상담"
            : "⚠️ NY State income tax: 4-10.9% (progressive)\n⚠️ NYC City income tax: 3.08-3.88% additional!\nSales Tax: 8.875% in NYC\nClothing & groceries (under $110): tax-exempt\nNY minimum wage: $16.50/hr (NYC)\nNJ income tax: 1.4-10.75% (if living in Palisades)\n\n💡 Living in NJ, working in NY = complex taxes — CPA essential",
          tags: ["소득세", "뉴욕", "뉴저지"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 플러싱): $2,100-2,700\n• 식료품: $350-500\n• 교통 (지하철·버스): $132 (30일 무제한)\n• 공과금: $150-250\n• 외식·여가: $300-500\n⟹ 합계: 약 $3,030-4,080/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Flushing): $2,100-2,700\n• Groceries: $350-500\n• Transit (subway/bus): $132 (30-day unlimited)\n• Utilities: $150-250\n• Dining out & leisure: $300-500\n⟹ Total: ~$3,030-4,080/month",
          tags: ["생활비", "뉴욕", "월평균"] },
      ],
      transportPhone: [
        { emoji: "🚇", name: "교통·지하철", nameEn: "Transportation & Subway",
          desc: ko
            ? "🚇 MTA 지하철: $2.90/회 (OMNY 탭) 🔗 mta.info\n🚌 MTA 버스: $2.90/회 (30일 무제한: $132)\n🚂 NJ Transit: NJ ↔ NY 통근 필수 🔗 njtransit.com\n🚗 뉴욕에서 차량 불필요 (주차비·보험 매우 비쌈)\n💡 플러싱 → 맨해튼 #7 지하철 직통 40분"
            : "🚇 MTA Subway: $2.90/ride (OMNY tap) 🔗 mta.info\n🚌 MTA Bus: $2.90/ride (30-day unlimited: $132)\n🚂 NJ Transit: Essential for NJ ↔ NY commute 🔗 njtransit.com\n🚗 Car unnecessary in NYC (parking & insurance very expensive)\n💡 Flushing to Manhattan via #7 train: 40 min direct",
          tags: ["지하철", "MTA", "뉴욕교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 뉴욕 = 전국 최강 커버리지\n• T-Mobile·Verizon·AT&T 모두 5G 우수\n• Mint Mobile: $15/월 (온라인 선불)\n🌐 인터넷:\n• Optimum (퀸스·NJ): $40-70/월\n• Verizon Fios (파이버): $50-80/월\n• Spectrum: $50-70/월"
            : "📱 NYC = Best coverage in the nation\n• T-Mobile, Verizon, AT&T all excellent 5G\n• Mint Mobile: $15/mo (online prepaid)\n🌐 Internet:\n• Optimum (Queens & NJ): $40-70/mo\n• Verizon Fios (fiber): $50-80/mo\n• Spectrum: $50-70/mo",
          tags: ["통신비", "Fios", "뉴욕인터넷"] },
      ],
    },
    houston: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 슈가랜드/미주리시티(한인 밀집): 스튜디오 $1,100-1,400 | 1BR $1,300-1,700 | 2BR $1,700-2,100\n📍 클리어레이크/피어랜드: 스튜디오 $1,000-1,300 | 1BR $1,200-1,600 | 2BR $1,600-2,000\n📍 휴스턴 업타운/갤러리아: 스튜디오 $1,400-1,800 | 1BR $1,700-2,200 | 2BR $2,100-2,700"
            : "📍 Sugar Land/Missouri City (Korean hub): Studio $1,100-1,400 | 1BR $1,300-1,700 | 2BR $1,700-2,100\n📍 Clear Lake/Pearland: Studio $1,000-1,300 | 1BR $1,200-1,600 | 2BR $1,600-2,000\n📍 Houston Uptown/Galleria: Studio $1,400-1,800 | 1BR $1,700-2,200 | 2BR $2,100-2,700",
          tags: ["렌트", "휴스턴", "비교"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "✅ 텍사스주 소득세 없음! (큰 장점)\n판매세(Sales Tax): 휴스턴 8.25%\n식료품·처방약: 세금 면제\n텍사스 최저시급: $7.25/시 (연방 기준)\n재산세: 집값 대비 높음 (약 2.0-2.5%/년)\n\n💡 에너지 도시 — 석유·가스 업계 급여 매우 높음"
            : "✅ Texas has NO state income tax! (major benefit)\nSales Tax: 8.25% in Houston\nGroceries & prescription drugs: tax-exempt\nTexas minimum wage: $7.25/hr (federal rate)\nProperty tax: relatively high (~2.0-2.5%/yr)\n\n💡 Energy city — oil & gas industry salaries very high",
          tags: ["소득세없음", "텍사스", "세금"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 슈가랜드): $1,300-1,700\n• 식료품: $280-400\n• 교통 (차량 필수 + 기름): $100-180\n• 공과금 ⚠️ 여름 에어컨 비용 높음: $130-200\n• 외식·여가: $200-350\n⟹ 합계: 약 $2,010-2,830/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Sugar Land): $1,300-1,700\n• Groceries: $280-400\n• Transport (car required + gas): $100-180\n• Utilities ⚠️ AC bills high in summer: $130-200\n• Dining out & leisure: $200-350\n⟹ Total: ~$2,010-2,830/month",
          tags: ["생활비", "휴스턴", "월평균"] },
      ],
      transportPhone: [
        { emoji: "⛽", name: "교통·기름값", nameEn: "Transportation & Gas",
          desc: ko
            ? "🚗 TX주 기름값: $2.80-3.40/갤런 (2026년) — 전국 최저 수준\n🚌 Metro 버스·경전철: $1.25/회 🔗 ridemetro.org\n🚗 휴스턴은 차량 필수 도시\n🛣️ I-10, I-45, I-610, Beltway 8 거대한 고속도로망\n⚠️ 홍수·폭우 시 교통 마비 주의"
            : "🚗 TX gas: $2.80-3.40/gallon (2026) — nation's cheapest\n🚌 Metro bus/light rail: $1.25/ride 🔗 ridemetro.org\n🚗 Houston is car-required city (limited transit)\n🛣️ Massive freeway system — I-10, I-45, I-610, Beltway 8\n⚠️ Watch for flooding & storms",
          tags: ["기름값", "Metro", "휴스턴교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 전국 통신사 경쟁 우수\n• AT&T: 텍사스 본고장 — 최강 커버리지\n• T-Mobile: 휴스턴 5G 우수\n🌐 인터넷:\n• Comcast Xfinity: $40-80/월\n• AT&T Fiber: $55-80/월"
            : "📱 National carriers all competitive\n• AT&T: Texas hometown — strongest coverage\n• T-Mobile: Excellent Houston 5G\n🌐 Internet:\n• Comcast Xfinity: $40-80/mo\n• AT&T Fiber: $55-80/mo",
          tags: ["통신비", "AT&T", "휴스턴인터넷"] },
      ],
    },
    sf: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 프리몬트(한인 밀집): 스튜디오 $1,800-2,200 | 1BR $2,100-2,600 | 2BR $2,600-3,300\n📍 산호세: 스튜디오 $1,900-2,400 | 1BR $2,200-2,800 | 2BR $2,800-3,600\n📍 SF 시내: 스튜디오 $2,200-2,800 | 1BR $2,800-3,600 | 2BR $3,600-4,800"
            : "📍 Fremont (Korean hub): Studio $1,800-2,200 | 1BR $2,100-2,600 | 2BR $2,600-3,300\n📍 San Jose: Studio $1,900-2,400 | 1BR $2,200-2,800 | 2BR $2,800-3,600\n📍 SF Downtown: Studio $2,200-2,800 | 1BR $2,800-3,600 | 2BR $3,600-4,800",
          tags: ["렌트", "SF베이", "프리몬트"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "⚠️ 캘리포니아 소득세 최고 13.3%!\n판매세: SF 8.625% / 산호세 9.375% / 프리몬트 10.75%\n식료품: 면세 / 조리 음식: 과세\nCA 최저시급: $17.00/시\n\n💡 실리콘밸리 테크 급여가 높아 실수령액은 높지만 세금 부담도 큼"
            : "⚠️ California income tax up to 13.3%!\nSales Tax: SF 8.625% / San Jose 9.375% / Fremont 10.75%\nGroceries: tax-exempt / Prepared food: taxed\nCA minimum wage: $17.00/hr\n\n💡 Silicon Valley tech salaries offset high taxes — but the burden is real",
          tags: ["소득세", "캘리포니아", "실리콘밸리"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 프리몬트): $2,100-2,600\n• 식료품: $400-600\n• 교통 (BART+자전거): $120-180\n• 공과금: $150-250\n• 외식·여가: $300-500\n⟹ 합계: 약 $3,070-4,130/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Fremont): $2,100-2,600\n• Groceries: $400-600\n• Transit (BART+bike): $120-180\n• Utilities: $150-250\n• Dining out & leisure: $300-500\n⟹ Total: ~$3,070-4,130/month",
          tags: ["생활비", "SF베이", "월평균"] },
      ],
      transportPhone: [
        { emoji: "🚇", name: "교통·BART", nameEn: "Transportation & BART",
          desc: ko
            ? "🚗 CA주 기름값: $4.20-5.00/갤런 (2026년) — 전국 최고\n🚇 BART: $2.65-7.00 (거리별) 🔗 bart.gov\n🚌 Caltrain (SF-산호세 통근): $3-13 🔗 caltrain.com\n🚌 VTA (산타클라라): $2.50/회\n💡 프리몬트 → SF BART 직통 50-60분 / 빅테크 셔틀버스 운행"
            : "🚗 CA gas: $4.20-5.00/gallon (2026) — nation's highest\n🚇 BART: $2.65-7.00 (distance-based) 🔗 bart.gov\n🚌 Caltrain (SF to San Jose commute): $3-13 🔗 caltrain.com\n🚌 VTA (Santa Clara): $2.50/ride\n💡 Fremont to SF via BART: 50-60 min direct / Big tech shuttles operate",
          tags: ["BART", "Caltrain", "SF교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 실리콘밸리 최강 커버리지\n• T-Mobile·Verizon·AT&T 모두 5G 우수\n🌐 인터넷:\n• Comcast Xfinity: $40-80/월\n• AT&T Fiber: $55-80/월\n• Astound Broadband: $40-60/월"
            : "📱 Silicon Valley = Top-tier coverage nationwide\n• T-Mobile, Verizon, AT&T all excellent 5G\n🌐 Internet:\n• Comcast Xfinity: $40-80/mo\n• AT&T Fiber: $55-80/mo\n• Astound Broadband: $40-60/mo",
          tags: ["통신비", "Xfinity", "SF인터넷"] },
      ],
    },
    toronto: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준, CAD)", nameEn: "Rent Prices — 2026 (CAD)",
          desc: ko
            ? "📍 노스요크/스카버러(한인 밀집): 스튜디오 CAD $1,800-2,200 | 1BR CAD $2,000-2,600 | 2BR CAD $2,600-3,200\n📍 미시사가: 스튜디오 CAD $1,700-2,100 | 1BR CAD $1,900-2,400 | 2BR CAD $2,400-3,000\n📍 다운타운 토론토: 스튜디오 CAD $2,200-2,800 | 1BR CAD $2,600-3,400 | 2BR CAD $3,200-4,200"
            : "📍 North York/Scarborough (Korean hub): Studio CAD $1,800-2,200 | 1BR CAD $2,000-2,600 | 2BR CAD $2,600-3,200\n📍 Mississauga: Studio CAD $1,700-2,100 | 1BR CAD $1,900-2,400 | 2BR CAD $2,400-3,000\n📍 Downtown Toronto: Studio CAD $2,200-2,800 | 1BR CAD $2,600-3,400 | 2BR CAD $3,200-4,200",
          tags: ["렌트", "토론토", "노스요크"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보 (캐나다)", nameEn: "Tax Information (Canada)",
          desc: ko
            ? "연방 소득세: 15-33% (누진)\n온타리오주 소득세: 5.05-13.16% (추가)\nHST (부가세): 13% (연방 5% + 온타리오 8%)\n기본 식료품: HST 면제\n최저시급: 온타리오 $17.20/시 (2024)\n\n💡 OHIP (온타리오 의료보험) — 3개월 대기 후 무료 의료"
            : "Federal income tax: 15-33% (progressive)\nOntario provincial tax: 5.05-13.16% (additional)\nHST (consumption tax): 13% (Federal 5% + Ontario 8%)\nBasic groceries: HST-exempt\nMin wage: Ontario $17.20/hr (2024)\n\n💡 OHIP (Ontario Health Insurance) — free healthcare after 3-month wait",
          tags: ["캐나다세금", "OHIP", "HST"] },
        { emoji: "🛒", name: "생활비 평균 (CAD)", nameEn: "Average Monthly Expenses (CAD)",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비 (CAD):\n• 렌트 (1BR 노스요크): CAD $2,000-2,600\n• 식료품: CAD $400-600\n• 교통 (TTC): CAD $156/월 (정기권)\n• 공과금: CAD $100-180\n• 외식·여가: CAD $200-400\n⟹ 합계: 약 CAD $2,856-3,936/월\n💡 CAD/USD 환율 약 0.74 (2026년 기준)"
            : "📊 Estimated monthly expenses (CAD):\n• Rent (1BR North York): CAD $2,000-2,600\n• Groceries: CAD $400-600\n• Transit (TTC): CAD $156/mo (pass)\n• Utilities: CAD $100-180\n• Dining out & leisure: CAD $200-400\n⟹ Total: ~CAD $2,856-3,936/month\n💡 CAD/USD rate ~0.74 (2026)",
          tags: ["생활비", "토론토", "캐나다달러"] },
      ],
      transportPhone: [
        { emoji: "🚇", name: "교통·TTC 지하철", nameEn: "Transit — TTC Subway",
          desc: ko
            ? "🚇 TTC 지하철: CAD $3.25/회 (PRESTO 카드) 🔗 ttc.ca\n🚌 TTC 버스: CAD $3.25/회 (30일 정기권: CAD $156)\n🚂 GO Transit (광역 통근) 🔗 gotransit.com\n🚗 다운타운 주차 비쌈 — 대중교통 권장\n💡 노스요크(욘지·핀치역) = 지하철 연결 핵심 한인지역"
            : "🚇 TTC Subway: CAD $3.25/ride (PRESTO card) 🔗 ttc.ca\n🚌 TTC Bus: CAD $3.25/ride (30-day pass: CAD $156)\n🚂 GO Transit (regional commuting) 🔗 gotransit.com\n🚗 Downtown parking very expensive — transit recommended\n💡 North York (Yonge & Finch station) = subway-connected Korean hub",
          tags: ["TTC", "지하철", "토론토교통"] },
        { emoji: "📱", name: "통신비 (캐나다)", nameEn: "Phone & Internet (Canada)",
          desc: ko
            ? "📱 캐나다 통신비 비쌈! (미국보다 약 30-50% 높음)\n• Rogers: 무제한 $65-85/월\n• Public Mobile (저렴): $40-55/월\n🌐 인터넷:\n• Rogers: CAD $55-80/월\n• Bell Fibe: CAD $60-80/월\n💡 알뜰 통신 (Public Mobile·Fido·Koodo) 강력 추천"
            : "📱 Canada mobile plans are expensive! (30-50% higher than US)\n• Rogers: unlimited $65-85/mo\n• Public Mobile (budget): $40-55/mo\n🌐 Internet:\n• Rogers: CAD $55-80/mo\n• Bell Fibe: CAD $60-80/mo\n💡 Budget MVNOs (Public Mobile, Fido, Koodo) highly recommended",
          tags: ["통신비", "Rogers", "캐나다인터넷"] },
      ],
    },
    vancouver: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준, CAD)", nameEn: "Rent Prices — 2026 (CAD)",
          desc: ko
            ? "📍 버나비(한인 밀집): 스튜디오 CAD $1,900-2,300 | 1BR CAD $2,200-2,700 | 2BR CAD $2,800-3,400\n📍 코퀴틀람: 스튜디오 CAD $1,700-2,100 | 1BR CAD $1,900-2,400 | 2BR CAD $2,400-3,000\n📍 밴쿠버 시내: 스튜디오 CAD $2,200-2,800 | 1BR CAD $2,700-3,500 | 2BR CAD $3,400-4,500"
            : "📍 Burnaby (Korean hub): Studio CAD $1,900-2,300 | 1BR CAD $2,200-2,700 | 2BR CAD $2,800-3,400\n📍 Coquitlam: Studio CAD $1,700-2,100 | 1BR CAD $1,900-2,400 | 2BR CAD $2,400-3,000\n📍 Downtown Vancouver: Studio CAD $2,200-2,800 | 1BR CAD $2,700-3,500 | 2BR CAD $3,400-4,500",
          tags: ["렌트", "밴쿠버", "버나비"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보 (BC주)", nameEn: "Tax Information (BC)",
          desc: ko
            ? "연방 소득세: 15-33% (누진)\nBC주 소득세: 5.06-20.5% (추가)\nGST + PST: 식료품 면세 / 기타 12%\n최저시급: BC $17.40/시 (2024)\n\n💡 BC Care Card — 3개월 대기 후 무료 의료 (OHIP 유사)\n💡 밴쿠버 = 북미 최고 생활 수준 + 높은 주거 비용"
            : "Federal income tax: 15-33% (progressive)\nBC provincial tax: 5.06-20.5% (additional)\nGST + PST: groceries tax-free / others 12%\nMin wage: BC $17.40/hr (2024)\n\n💡 BC Care Card — free healthcare after 3-month wait (similar to OHIP)\n💡 Vancouver = top North American livability + high housing costs",
          tags: ["BC세금", "캐나다", "의료보험"] },
        { emoji: "🛒", name: "생활비 평균 (CAD)", nameEn: "Average Monthly Expenses (CAD)",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비 (CAD):\n• 렌트 (1BR 버나비): CAD $2,200-2,700\n• 식료품: CAD $400-600\n• 교통 (TransLink): CAD $124/월 (2존 정기권)\n• 공과금: CAD $80-150\n• 외식·여가: CAD $200-400\n⟹ 합계: 약 CAD $3,004-3,974/월"
            : "📊 Estimated monthly expenses (CAD):\n• Rent (1BR Burnaby): CAD $2,200-2,700\n• Groceries: CAD $400-600\n• Transit (TransLink): CAD $124/mo (2-zone pass)\n• Utilities: CAD $80-150\n• Dining out & leisure: CAD $200-400\n⟹ Total: ~CAD $3,004-3,974/month",
          tags: ["생활비", "밴쿠버", "캐나다달러"] },
      ],
      transportPhone: [
        { emoji: "🚇", name: "교통·SkyTrain", nameEn: "Transit — SkyTrain",
          desc: ko
            ? "🚇 SkyTrain: CAD $3.15/회 (Compass 카드) 🔗 translink.ca\n🚌 버스: CAD $3.15/회 (월 정기권 CAD $124)\n💡 버나비 → 밴쿠버 SkyTrain 20-30분\n🚲 자전거 친화 도시 (사이클 레인 발달)\n🚗 다운타운 주차 비쌈"
            : "🚇 SkyTrain (light rail): CAD $3.15/ride (Compass card) 🔗 translink.ca\n🚌 Bus: CAD $3.15/ride (monthly pass: CAD $124)\n💡 Burnaby to Vancouver via SkyTrain: 20-30 min\n🚲 Bike-friendly city with extensive cycle lanes\n🚗 Downtown parking very expensive",
          tags: ["SkyTrain", "TransLink", "밴쿠버교통"] },
        { emoji: "📱", name: "통신비 (캐나다)", nameEn: "Phone & Internet (Canada)",
          desc: ko
            ? "📱 캐나다 통신비 비쌈 — 알뜰 요금제 활용!\n• Telus: BC 최강 커버리지 (무제한 $65-80/월)\n• Koodo (Telus 계열 알뜰): $40-55/월\n🌐 인터넷:\n• Telus PureFibre: CAD $60-80/월 (BC 최고)\n• Shaw/Rogers: CAD $55-75/월"
            : "📱 Canada plans expensive — budget MVNOs recommended!\n• Telus: Best BC coverage (unlimited $65-80/mo)\n• Koodo (Telus budget brand): $40-55/mo\n🌐 Internet:\n• Telus PureFibre: CAD $60-80/mo (BC's best)\n• Shaw/Rogers: CAD $55-75/mo",
          tags: ["통신비", "Telus", "밴쿠버인터넷"] },
      ],
    },
    boston: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 올스턴/브라이턴(한인 밀집): 스튜디오 $1,800-2,200 | 1BR $2,100-2,600 | 2BR $2,600-3,200\n📍 퀸시/밀턴: 스튜디오 $1,700-2,100 | 1BR $1,900-2,400 | 2BR $2,400-3,000\n📍 보스턴 시내: 스튜디오 $2,200-2,800 | 1BR $2,600-3,400 | 2BR $3,200-4,200"
            : "📍 Allston/Brighton (Korean hub): Studio $1,800-2,200 | 1BR $2,100-2,600 | 2BR $2,600-3,200\n📍 Quincy/Milton: Studio $1,700-2,100 | 1BR $1,900-2,400 | 2BR $2,400-3,000\n📍 Downtown Boston: Studio $2,200-2,800 | 1BR $2,600-3,400 | 2BR $3,200-4,200",
          tags: ["렌트", "보스턴", "올스턴"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "MA주 소득세: 5% (단일세율, 비교적 낮음)\n판매세: 6.25%\n식료품·처방약: 세금 면제\nMA 최저시급: $15.00/시\n\n💡 상대적으로 낮은 소득세 + 교육도시 (하버드·MIT·BU 등)\n⚠️ 의료·생활비 물가는 높은 편"
            : "MA income tax: 5% (flat rate, relatively low)\nSales Tax: 6.25%\nGroceries & prescription drugs: tax-exempt\nMA minimum wage: $15.00/hr\n\n💡 Relatively low income tax + education hub (Harvard, MIT, BU, etc.)\n⚠️ Healthcare & living costs are high",
          tags: ["소득세", "매사추세츠", "세금"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 올스턴): $2,100-2,600\n• 식료품: $350-500\n• 교통 (MBTA): $90/월 (무제한 CharlieCard)\n• 공과금: $120-200\n• 외식·여가: $250-400\n⟹ 합계: 약 $2,910-3,790/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Allston): $2,100-2,600\n• Groceries: $350-500\n• Transit (MBTA): $90/mo (unlimited CharlieCard)\n• Utilities: $120-200\n• Dining out & leisure: $250-400\n⟹ Total: ~$2,910-3,790/month",
          tags: ["생활비", "보스턴", "월평균"] },
      ],
      transportPhone: [
        { emoji: "🚇", name: "교통·MBTA (The T)", nameEn: "Transit — MBTA (The T)",
          desc: ko
            ? "🚇 MBTA 지하철(The T): $2.40/회 🔗 mbta.com\n🚌 버스: $1.70/회 (무제한 월정기권: $90)\n🚂 Commuter Rail: 퀸시 → 보스턴 통근 필수\n💡 올스턴 → 다운타운 B·C·D 라인 20-30분\n🚗 시내 주차 매우 비쌈"
            : "🚇 MBTA Subway (The T): $2.40/ride 🔗 mbta.com\n🚌 Bus: $1.70/ride (unlimited monthly: $90)\n🚂 Commuter Rail: Quincy to Boston commuting essential\n💡 Allston to downtown via B/C/D lines: 20-30 min\n🚗 Downtown parking very expensive",
          tags: ["MBTA", "지하철", "보스턴교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 대학도시 특성상 전국 통신사 우수 커버리지\n• T-Mobile: 보스턴 5G 우수\n• Verizon: 가장 안정적\n🌐 인터넷:\n• Comcast Xfinity: $40-80/월\n• Verizon Fios (일부 지역): $50-80/월\n• RCN (올스턴 지역): $40-65/월"
            : "📱 Major carriers excellent (university city)\n• T-Mobile: Great Boston 5G\n• Verizon: Most reliable\n🌐 Internet:\n• Comcast Xfinity: $40-80/mo\n• Verizon Fios (select areas): $50-80/mo\n• RCN (Allston area): $40-65/mo",
          tags: ["통신비", "Xfinity", "보스턴인터넷"] },
      ],
    },
    nashville: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 쿨스프링스/프랭클린(한인 거주): 스튜디오 $1,300-1,600 | 1BR $1,500-1,900 | 2BR $1,900-2,400\n📍 안티오크: 스튜디오 $1,100-1,400 | 1BR $1,300-1,700 | 2BR $1,700-2,100\n📍 내쉬빌 시내: 스튜디오 $1,600-2,100 | 1BR $1,900-2,500 | 2BR $2,400-3,100"
            : "📍 Cool Springs/Franklin (Korean area): Studio $1,300-1,600 | 1BR $1,500-1,900 | 2BR $1,900-2,400\n📍 Antioch: Studio $1,100-1,400 | 1BR $1,300-1,700 | 2BR $1,700-2,100\n📍 Downtown Nashville: Studio $1,600-2,100 | 1BR $1,900-2,500 | 2BR $2,400-3,100",
          tags: ["렌트", "내쉬빌", "프랭클린"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "✅ 테네시주 소득세 없음! (큰 장점)\n판매세(Sales Tax): 내쉬빌 9.25% (TN 7% + 지방 2.25%)\n⚠️ 식료품 판매세: 4% (다른 주보다 높음)\nTN 최저시급: $7.25/시 (연방 기준)\n\n💡 텍사스와 마찬가지로 소득세 0% — 미국에서 가장 세금 낮은 주 중 하나"
            : "✅ Tennessee has NO state income tax!\nSales Tax: Nashville 9.25% (TN 7% + local 2.25%)\n⚠️ Grocery sales tax: 4% (higher than most states)\nTN minimum wage: $7.25/hr (federal rate)\n\n💡 Like Texas — 0% income tax makes TN one of the lowest-tax states in US",
          tags: ["소득세없음", "테네시", "세금"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 쿨스프링스): $1,500-1,900\n• 식료품: $280-400\n• 교통 (차량 필수): $100-160 + 기름값\n• 공과금 (전기·인터넷): $120-180\n• 외식·여가: $200-350\n⟹ 합계: 약 $2,200-2,990/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Cool Springs): $1,500-1,900\n• Groceries: $280-400\n• Transport (car required): $100-160 + gas\n• Utilities (electric+internet): $120-180\n• Dining out & leisure: $200-350\n⟹ Total: ~$2,200-2,990/month",
          tags: ["생활비", "내쉬빌", "월평균"] },
      ],
      transportPhone: [
        { emoji: "⛽", name: "교통·기름값", nameEn: "Transportation & Gas",
          desc: ko
            ? "🚗 TN주 기름값: $2.90-3.50/갤런 (2026년)\n🚌 WeGo 버스: $2.00/회 🔗 wegotransit.com\n🚗 내쉬빌은 차량 필수 도시\n🛣️ I-65, I-24, I-40 방사형 고속도로\n💡 쿨스프링스·프랭클린 거주 시 차량 필수"
            : "🚗 TN gas: $2.90-3.50/gallon (2026)\n🚌 WeGo Bus: $2.00/ride 🔗 wegotransit.com\n🚗 Nashville is car-required city\n🛣️ I-65, I-24, I-40 radial freeways\n💡 Car essential for Cool Springs/Franklin residents",
          tags: ["기름값", "WeGo", "내쉬빌교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 전국 통신사 서비스\n• T-Mobile: $30/월 (선불)\n• AT&T: 테네시 커버리지 우수\n🌐 인터넷:\n• Xfinity: $40-70/월\n• AT&T Fiber (일부 지역): $55-80/월"
            : "📱 Major carriers available\n• T-Mobile: $30/mo (prepaid)\n• AT&T: Excellent Tennessee coverage\n🌐 Internet:\n• Xfinity: $40-70/mo\n• AT&T Fiber (select areas): $55-80/mo",
          tags: ["통신비", "AT&T", "내쉬빌인터넷"] },
      ],
    },
    atlanta: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 둘루스/스와니(한인 밀집, 귀넷카운티): 스튜디오 $1,200-1,500 | 1BR $1,400-1,800 | 2BR $1,800-2,300\n📍 샌디스프링스: 스튜디오 $1,400-1,800 | 1BR $1,600-2,100 | 2BR $2,100-2,700\n📍 애틀랜타 버클헤드: 스튜디오 $1,600-2,100 | 1BR $2,000-2,600 | 2BR $2,500-3,200"
            : "📍 Duluth/Suwanee (Korean hub, Gwinnett Co.): Studio $1,200-1,500 | 1BR $1,400-1,800 | 2BR $1,800-2,300\n📍 Sandy Springs: Studio $1,400-1,800 | 1BR $1,600-2,100 | 2BR $2,100-2,700\n📍 Atlanta Buckhead: Studio $1,600-2,100 | 1BR $2,000-2,600 | 2BR $2,500-3,200",
          tags: ["렌트", "애틀랜타", "둘루스"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "GA주 소득세: 5.49% (2024) → 단계적 인하 예정\n판매세: 귀넷카운티 8% / 풀턴카운티 8.9%\n식료품 판매세: 면제 (GA 주요 장점!)\nGA 최저시급: $7.25/시 (연방 기준)\n\n💡 비교적 낮은 생활비 + 대규모 한인 커뮤니티 (둘루스·스와니)"
            : "GA income tax: 5.49% (2024, gradually reducing)\nSales Tax: Gwinnett Co 8% / Fulton Co 8.9%\nGrocery sales tax: EXEMPT (GA major benefit!)\nGA minimum wage: $7.25/hr (federal rate)\n\n💡 Relatively low cost of living + large Korean community (Duluth/Suwanee)",
          tags: ["GA소득세", "귀넷카운티", "세금"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 둘루스): $1,400-1,800\n• 식료품: $280-400\n• 교통 (차량 필수): $100-160 + 기름값\n• 공과금: $120-200\n• 외식·여가: $200-350\n⟹ 합계: 약 $2,100-2,910/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Duluth): $1,400-1,800\n• Groceries: $280-400\n• Transport (car required): $100-160 + gas\n• Utilities: $120-200\n• Dining out & leisure: $200-350\n⟹ Total: ~$2,100-2,910/month",
          tags: ["생활비", "애틀랜타", "월평균"] },
      ],
      transportPhone: [
        { emoji: "⛽", name: "교통·기름값", nameEn: "Transportation & Gas",
          desc: ko
            ? "🚗 GA주 기름값: $3.00-3.60/갤런 (2026년)\n🚇 MARTA 지하철: $2.50/회 (Breeze 카드) 🔗 itsmarta.com\n🚗 둘루스·스와니는 차량 필수 (대중교통 미도달)\n💡 ATL 공항 → 도심 MARTA 25분 ($2.50) — 편리!"
            : "🚗 GA gas: $3.00-3.60/gallon (2026)\n🚇 MARTA Subway: $2.50/ride (Breeze card) 🔗 itsmarta.com\n🚗 Duluth/Suwanee: car required (no transit coverage)\n💡 ATL Airport to downtown via MARTA: 25 min ($2.50) — convenient!",
          tags: ["기름값", "MARTA", "애틀랜타교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 전국 통신사 우수 커버리지\n• AT&T: 조지아 커버리지 강함\n• T-Mobile: 애틀랜타 5G 우수\n🌐 인터넷:\n• Xfinity: $40-80/월 (귀넷카운티 주요)\n• AT&T Fiber: $55-80/월\n• Google Fiber (일부 지역)"
            : "📱 Major carriers excellent coverage\n• AT&T: Strong Georgia coverage\n• T-Mobile: Great Atlanta 5G\n🌐 Internet:\n• Xfinity: $40-80/mo (Gwinnett Co primary)\n• AT&T Fiber: $55-80/mo\n• Google Fiber (select areas)",
          tags: ["통신비", "Xfinity", "애틀랜타인터넷"] },
      ],
    },
    miami: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 도랄/켄달(한인 거주): 스튜디오 $1,800-2,200 | 1BR $2,000-2,600 | 2BR $2,600-3,200\n📍 마이애미 비치: 스튜디오 $2,200-2,800 | 1BR $2,600-3,400 | 2BR $3,400-4,500\n📍 마이애미 다운타운: 스튜디오 $2,000-2,500 | 1BR $2,300-3,000 | 2BR $2,900-3,800"
            : "📍 Doral/Kendall (Korean area): Studio $1,800-2,200 | 1BR $2,000-2,600 | 2BR $2,600-3,200\n📍 Miami Beach: Studio $2,200-2,800 | 1BR $2,600-3,400 | 2BR $3,400-4,500\n📍 Downtown Miami: Studio $2,000-2,500 | 1BR $2,300-3,000 | 2BR $2,900-3,800",
          tags: ["렌트", "마이애미", "도랄"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "✅ 플로리다주 소득세 없음!\n판매세: 마이애미데이드카운티 7.0%\n식료품·처방약: 세금 면제\nFL 최저시급: $12.00/시 (2024)\n\n💡 텍사스·테네시와 함께 무소득세 주 (세금 부담 낮음)\n⚠️ 허리케인 보험·홍수 보험 비용 높음"
            : "✅ Florida has NO state income tax!\nSales Tax: Miami-Dade County 7.0%\nGroceries & prescription drugs: tax-exempt\nFL minimum wage: $12.00/hr (2024)\n\n💡 Zero income tax alongside Texas & Tennessee\n⚠️ Hurricane and flood insurance costs are high",
          tags: ["소득세없음", "플로리다", "세금"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 도랄): $2,000-2,600\n• 식료품: $300-450\n• 교통 (차량 필수 + 기름): $100-160\n• 공과금 (에어컨 상시): $150-250\n• 외식·여가: $250-400\n⟹ 합계: 약 $2,800-3,860/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Doral): $2,000-2,600\n• Groceries: $300-450\n• Transport (car required + gas): $100-160\n• Utilities (AC always running): $150-250\n• Dining out & leisure: $250-400\n⟹ Total: ~$2,800-3,860/month",
          tags: ["생활비", "마이애미", "월평균"] },
      ],
      transportPhone: [
        { emoji: "⛽", name: "교통·기름값", nameEn: "Transportation & Gas",
          desc: ko
            ? "🚗 FL주 기름값: $3.20-3.80/갤런 (2026년)\n🚇 Miami-Dade Metrorail: $2.25/회 🔗 miamidade.gov/transit\n🚗 마이애미는 차량 필수 (도랄·켄달 대중교통 부족)\n🚂 Tri-Rail: 마이애미 → 포트로더데일 통근 가능"
            : "🚗 FL gas: $3.20-3.80/gallon (2026)\n🚇 Miami-Dade Metrorail: $2.25/ride 🔗 miamidade.gov/transit\n🚗 Miami is car-required (Doral/Kendall limited transit)\n🚂 Tri-Rail commuter train (Miami to Fort Lauderdale)",
          tags: ["기름값", "Metrorail", "마이애미교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 플로리다 통신 경쟁 우수\n• T-Mobile: 마이애미 5G 우수\n• AT&T: FL 커버리지 강함\n🌐 인터넷:\n• Comcast Xfinity: $40-80/월\n• AT&T Fiber: $55-80/월"
            : "📱 Florida carrier competition strong\n• T-Mobile: Great Miami 5G\n• AT&T: Strong FL coverage\n🌐 Internet:\n• Comcast Xfinity: $40-80/mo\n• AT&T Fiber: $55-80/mo",
          tags: ["통신비", "Xfinity", "마이애미인터넷"] },
      ],
    },
    philadelphia: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 어퍼다비/체리힐NJ(한인 거주): 스튜디오 $1,200-1,600 | 1BR $1,500-1,900 | 2BR $1,900-2,400\n📍 노리스타운: 스튜디오 $1,100-1,400 | 1BR $1,300-1,700 | 2BR $1,700-2,200\n📍 필라델피아 시내: 스튜디오 $1,600-2,100 | 1BR $1,900-2,500 | 2BR $2,400-3,200"
            : "📍 Upper Darby/Cherry Hill NJ (Korean area): Studio $1,200-1,600 | 1BR $1,500-1,900 | 2BR $1,900-2,400\n📍 Norristown: Studio $1,100-1,400 | 1BR $1,300-1,700 | 2BR $1,700-2,200\n📍 Downtown Philly: Studio $1,600-2,100 | 1BR $1,900-2,500 | 2BR $2,400-3,200",
          tags: ["렌트", "필라델피아", "뉴저지"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "PA주 소득세: 3.07% (낮음!)\n판매세: PA 6% / 필라델피아市 8%\n식료품·처방약: 세금 면제\nPA 최저시급: $7.25/시 (연방 기준)\n필라 시내 근무자 임금세: 거주자 3.75% (추가)\n\n💡 NJ 거주 + 필라 근무 시 NJ 세금 적용 — 복잡할 수 있음"
            : "PA income tax: 3.07% (relatively low!)\nSales Tax: PA 6% / Philadelphia City 8%\nGroceries & prescription drugs: tax-exempt\nPA minimum wage: $7.25/hr (federal)\nPhiladelphia wage tax (city workers, residents): 3.75% additional\n\n💡 NJ residents working in Philly — NJ taxes apply (can get complex)",
          tags: ["PA소득세", "필라델피아", "세금"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 어퍼다비): $1,500-1,900\n• 식료품: $300-430\n• 교통 (SEPTA): $96/월 (무제한)\n• 공과금: $120-200\n• 외식·여가: $200-350\n⟹ 합계: 약 $2,216-2,880/월"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Upper Darby): $1,500-1,900\n• Groceries: $300-430\n• Transit (SEPTA): $96/mo (unlimited)\n• Utilities: $120-200\n• Dining out & leisure: $200-350\n⟹ Total: ~$2,216-2,880/month",
          tags: ["생활비", "필라델피아", "월평균"] },
      ],
      transportPhone: [
        { emoji: "🚇", name: "교통·SEPTA", nameEn: "Transit — SEPTA",
          desc: ko
            ? "🚇 SEPTA 지하철: $2.50/회 🔗 septa.org\n🚌 버스: $2.50/회 (월정기권 $96)\n🚂 Regional Rail (NJ ↔ 필라 통근)\n💡 체리힐(NJ) → 필라 PATCO 전철 25분\n🚗 교외 지역은 차량 필요"
            : "🚇 SEPTA Subway: $2.50/ride 🔗 septa.org\n🚌 Bus: $2.50/ride (monthly unlimited: $96)\n🚂 Regional Rail (NJ to Philly commuting)\n💡 Cherry Hill (NJ) to Philly via PATCO: 25 min\n🚗 Car needed for suburban areas",
          tags: ["SEPTA", "지하철", "필라교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 전국 통신사 우수 커버리지\n• T-Mobile·Verizon 모두 강함\n🌐 인터넷:\n• Comcast Xfinity (본사 필라): $40-80/월 — 최강 커버리지\n• Verizon Fios: $50-80/월"
            : "📱 Major carriers strong coverage\n• T-Mobile & Verizon both strong\n🌐 Internet:\n• Comcast Xfinity (HQ in Philly): $40-80/mo — best coverage\n• Verizon Fios: $50-80/mo",
          tags: ["통신비", "Xfinity", "필라인터넷"] },
      ],
    },
    kansascity: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
          desc: ko
            ? "📍 오버랜드파크(KS, 한인 거주): 스튜디오 $900-1,200 | 1BR $1,100-1,500 | 2BR $1,400-1,900\n📍 리우드/리우드KS: 스튜디오 $800-1,100 | 1BR $1,000-1,400 | 2BR $1,300-1,700\n📍 KC 다운타운(MO): 스튜디오 $1,100-1,500 | 1BR $1,300-1,800 | 2BR $1,700-2,300"
            : "📍 Overland Park (KS, Korean area): Studio $900-1,200 | 1BR $1,100-1,500 | 2BR $1,400-1,900\n📍 Lenexa/Leawood (KS): Studio $800-1,100 | 1BR $1,000-1,400 | 2BR $1,300-1,700\n📍 Downtown KC (MO): Studio $1,100-1,500 | 1BR $1,300-1,800 | 2BR $1,700-2,300",
          tags: ["렌트", "캔자스시티", "오버랜드파크"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
          desc: ko
            ? "MO주 소득세: 4.95% / KS주 소득세: 5.7%\n(거주 주에 따라 다름 — 중요!)\n판매세: MO 8.35% / KS 8.7%\n식료품 판매세: MO 면세 / KS 0% (2025년 완전 면세)\n최저시급: MO $12.30 / KS $7.25/시\n\n💡 미주리·캔자스 주 경계 도시 — 거주지 선택이 세금에 중요"
            : "MO income tax: 4.95% / KS income tax: 5.7%\n(Depends on which side of the border you live — important!)\nSales Tax: MO 8.35% / KS 8.7%\nGrocery tax: MO exempt / KS 0% (fully exempt from 2025)\nMin wage: MO $12.30 / KS $7.25/hr\n\n💡 Straddling MO-KS border — your residence state matters for taxes",
          tags: ["MO세금", "KS세금", "캔자스시티"] },
        { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 오버랜드파크): $1,100-1,500\n• 식료품: $250-380\n• 교통 (차량 필수): $80-130 + 기름값\n• 공과금: $100-170\n• 외식·여가: $180-300\n⟹ 합계: 약 $1,710-2,480/월\n\n💡 미국에서 가장 저렴한 주요 도시 중 하나!"
            : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Overland Park): $1,100-1,500\n• Groceries: $250-380\n• Transport (car required): $80-130 + gas\n• Utilities: $100-170\n• Dining out & leisure: $180-300\n⟹ Total: ~$1,710-2,480/month\n\n💡 One of the most affordable major metros in the US!",
          tags: ["생활비", "캔자스시티", "저렴"] },
      ],
      transportPhone: [
        { emoji: "⛽", name: "교통·기름값", nameEn: "Transportation & Gas",
          desc: ko
            ? "🚗 MO/KS 기름값: $2.90-3.50/갤런 (2026년)\n🚌 RideKC 버스: $1.50/회 🔗 ridekc.org\n🚗 KC는 차량 필수 도시\n🛣️ I-35, I-70, US-69 방사형 고속도로\n💡 무료 KC Streetcar (다운타운 2마일 구간 무료!)"
            : "🚗 MO/KS gas: $2.90-3.50/gallon (2026)\n🚌 RideKC Bus: $1.50/ride 🔗 ridekc.org\n🚗 Kansas City is car-required city\n🛣️ I-35, I-70, US-69 radial freeways\n💡 FREE KC Streetcar (downtown 2-mile loop — free!)",
          tags: ["기름값", "RideKC", "KC교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 전국 통신사 서비스\n• T-Mobile: KC 5G 커버리지 우수\n🌐 인터넷:\n• Spectrum: $50-70/월 (KC 주요)\n• Google Fiber KC: $70-100/월 (기가 인터넷)"
            : "📱 National carriers all available\n• T-Mobile: Good KC 5G\n🌐 Internet:\n• Spectrum: $50-70/mo (KC's primary)\n• Google Fiber KC: $70-100/mo (gigabit)",
          tags: ["통신비", "Spectrum", "KC인터넷"] },
      ],
    },
    mexicocity: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준, MXN/USD)", nameEn: "Rent Prices — 2026 (MXN/USD)",
          desc: ko
            ? "📍 폴랑코/산타페(한인 밀집): 스튜디오 MXN $12,000-18,000 | 1BR MXN $16,000-24,000\n📍 콜로니아 나폴레스: 스튜디오 MXN $10,000-14,000 | 1BR MXN $13,000-20,000\n💡 USD 기준 약 $600-1,300 (환율: 1 USD ≈ MXN 18-19)\n북미에서 가장 저렴한 한인 거점 도시!"
            : "📍 Polanco/Santa Fe (Korean hub): Studio MXN $12,000-18,000 | 1BR MXN $16,000-24,000\n📍 Colonia Nápoles: Studio MXN $10,000-14,000 | 1BR MXN $13,000-20,000\n💡 USD equivalent: ~$600-1,300 (rate: 1 USD ≈ MXN 18-19)\nMost affordable Korean hub city in North America!",
          tags: ["렌트", "멕시코시티", "폴랑코"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보 (멕시코)", nameEn: "Tax Information (Mexico)",
          desc: ko
            ? "연방 ISR (소득세): 1.92-35% (누진)\nIVA (부가가치세): 16% (식료품·의약품 면세)\n멕시코 최저임금: MXN 248/일 (2024년)\n\n💡 외국 취업자 RFC (납세자 등록) 필수\n💡 한인 CPA 또는 현지 회계사 상담 필수"
            : "Federal ISR (income tax): 1.92-35% (progressive)\nIVA (value-added tax): 16% (groceries & meds exempt)\nMexico minimum wage: MXN 248/day (2024)\n\n💡 Foreign workers must register RFC (taxpayer ID)\n💡 Korean or local CPA consultation essential",
          tags: ["멕시코세금", "ISR", "RFC"] },
        { emoji: "🛒", name: "생활비 평균 (USD 기준)", nameEn: "Average Monthly Expenses (USD)",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비 (USD):\n• 렌트 (1BR 폴랑코): $800-1,300\n• 식료품: $150-250\n• 교통 (메트로+버스): $15-30\n• 공과금: $50-100\n• 외식·여가: $200-400\n⟹ 합계: 약 $1,215-2,080/월\n\n💡 북미에서 가장 저렴한 한인 거점!"
            : "📊 Estimated monthly expenses (USD basis):\n• Rent (1BR Polanco): $800-1,300\n• Groceries: $150-250\n• Transit (Metro+bus): $15-30\n• Utilities: $50-100\n• Dining out & leisure: $200-400\n⟹ Total: ~$1,215-2,080/month\n\n💡 Most affordable Korean hub city in North America!",
          tags: ["생활비", "멕시코시티", "저렴"] },
      ],
      transportPhone: [
        { emoji: "🚇", name: "교통·Metro & Metrobús", nameEn: "Transit — Metro & Metrobús",
          desc: ko
            ? "🚇 멕시코시티 메트로: MXN $5/회 (~$0.28) 🔗 metro.cdmx.gob.mx\n🚌 Metrobús: MXN $6/회 (~$0.33)\n🚗 Uber/DiDi: 매우 저렴 (평균 $3-6/회)\n⚠️ 주중 시내 차량 운행 제한 (Hoy No Circula)\n💡 폴랑코 ↔ 도심 메트로 7호선 20분"
            : "🚇 Mexico City Metro: MXN $5/ride (~$0.28) 🔗 metro.cdmx.gob.mx\n🚌 Metrobús: MXN $6/ride (~$0.33)\n🚗 Uber/DiDi: Very cheap (avg $3-6/trip)\n⚠️ Weekday downtown driving restrictions (Hoy No Circula)\n💡 Polanco to downtown via Metro Line 7: 20 min",
          tags: ["멕시코Metro", "Uber", "멕시코교통"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 멕시코 통신 (Telcel 최강)\n• Telcel: 멕시코 최대 커버리지 (MXN 250/월 선불)\n• Movistar: MXN 200-300/월\n🌐 인터넷:\n• Telmex/Infinitum: MXN $400-700/월 ($22-39)\n💡 현지 SIM이 한국 로밍보다 훨씬 저렴"
            : "📱 Mexico telecom (Telcel is dominant)\n• Telcel: Mexico's largest network (MXN 250/mo prepaid)\n• Movistar: MXN 200-300/mo\n🌐 Internet:\n• Telmex/Infinitum: MXN $400-700/mo ($22-39)\n💡 Local SIM is much cheaper than Korean carrier roaming",
          tags: ["통신비", "Telcel", "멕시코인터넷"] },
      ],
    },
    guadalajara: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준, MXN/USD)", nameEn: "Rent Prices — 2026 (MXN/USD)",
          desc: ko
            ? "📍 사폴로판·차풀테펙(한인 밀집): 스튜디오 MXN $8,000-12,000 | 1BR MXN $11,000-18,000\n📍 사포판·마테라·테키살로판: 1BR MXN $10,000-16,000\n💡 USD 기준 약 $450-950 (환율: 1 USD ≈ MXN 18-19)\n멕시코시티보다 20-30% 저렴! 삶의 질 높은 도시"
            : "📍 Zapopan/Chapalita (Korean hub): Studio MXN $8,000-12,000 | 1BR MXN $11,000-18,000\n📍 Zapopan, Matera, Tequesquite: 1BR MXN $10,000-16,000\n💡 USD: ~$450-950 (rate: 1 USD ≈ MXN 18-19)\n20-30% cheaper than Mexico City! High quality of life",
          tags: ["렌트", "과달라하라", "저렴"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보 (멕시코 공통)", nameEn: "Tax Information (Mexico — same as CDMX)",
          desc: ko
            ? "멕시코 전국 동일 세율:\n연방 ISR (소득세): 1.92-35% (누진)\nIVA (부가가치세): 16% (식료품·의약품 면세)\n\n💡 RFC (납세자 등록) 필수 — 현지 회계사 상담\n💡 과달라하라 생활비는 멕시코시티 대비 20% 저렴"
            : "Mexico uniform tax rates:\nFederal ISR (income tax): 1.92-35% (progressive)\nIVA (VAT): 16% (groceries & meds exempt)\n\n💡 RFC (taxpayer ID) required — consult local accountant\n💡 Guadalajara cost of living ~20% cheaper than Mexico City",
          tags: ["멕시코세금", "ISR", "과달라하라"] },
        { emoji: "🛒", name: "생활비 평균 (USD 기준)", nameEn: "Average Monthly Expenses (USD)",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비 (USD):\n• 렌트 (1BR 사폴로판): $600-1,000\n• 식료품: $120-200\n• 교통 (버스+Uber): $30-60\n• 공과금: $40-80\n• 외식·여가: $150-300\n⟹ 합계: 약 $940-1,640/월\n\n💡 멕시코 최고 삶의 질 도시 중 하나 (기후·문화)"
            : "📊 Estimated monthly expenses (USD):\n• Rent (1BR Zapopan): $600-1,000\n• Groceries: $120-200\n• Transit (bus+Uber): $30-60\n• Utilities: $40-80\n• Dining out & leisure: $150-300\n⟹ Total: ~$940-1,640/month\n\n💡 One of Mexico's highest quality-of-life cities (climate & culture)",
          tags: ["생활비", "과달라하라", "저렴"] },
      ],
      transportPhone: [
        { emoji: "🚌", name: "교통 — 트렌 에레크트리코 & 버스", nameEn: "Transit — Tren Eléctrico & Bus",
          desc: ko
            ? "🚋 트렌 에레크트리코(경전철): MXN $9/회 — 주요 노선 🔗 sistematransporte.jalisco.gob.mx\n🚌 Macrobús (BRT): MXN $9/회\n🚗 Uber/DiDi: 매우 저렴 (평균 $2-5/회)\n💡 과달라하라 시내 중심부는 도보·자전거도 가능\n⚽ 월드컵 경기일: 아크론 경기장 → 트렌 에레크트리코 직통"
            : "🚋 Tren Eléctrico (light rail): MXN $9/ride 🔗 sistematransporte.jalisco.gob.mx\n🚌 Macrobús (BRT): MXN $9/ride\n🚗 Uber/DiDi: Very cheap (avg $2-5/trip)\n💡 City center walkable & bike-friendly\n⚽ World Cup day: Akron Stadium via Tren Eléctrico direct",
          tags: ["과달라하라교통", "TrenElectrico", "Uber"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 Telcel (멕시코 최대 커버리지): MXN $250/월 선불\n• Movistar: MXN $200-300/월\n🌐 인터넷:\n• Izzi/Megacable: MXN $350-600/월 ($20-33)\n💡 멕시코 전국 동일 통신사 — 과달라하라도 Telcel 최강"
            : "📱 Telcel (Mexico's largest coverage): MXN $250/mo prepaid\n• Movistar: MXN $200-300/mo\n🌐 Internet:\n• Izzi/Megacable: MXN $350-600/mo ($20-33)\n💡 Same carriers nationwide — Telcel is best in Guadalajara too",
          tags: ["통신비", "Telcel", "과달라하라"] },
      ],
    },
    monterrey: {
      rentHousing: [
        { emoji: "🏠", name: "렌트 시세 (2026년 기준, MXN/USD)", nameEn: "Rent Prices — 2026 (MXN/USD)",
          desc: ko
            ? "📍 산페드로가르사가르시아·미티에라(고급지구): 스튜디오 MXN $12,000-18,000 | 1BR MXN $15,000-24,000\n📍 미라 · 에르모사(한인 주재원 거주지): 1BR MXN $10,000-16,000\n💡 USD 기준 약 $550-1,300\n💡 주재원 수당 지급 시 생활비 부담 크게 완화"
            : "📍 San Pedro Garza García/Mitiera (premium): Studio MXN $12,000-18,000 | 1BR MXN $15,000-24,000\n📍 Mira/Hermosa (Korean expat area): 1BR MXN $10,000-16,000\n💡 USD equivalent: ~$550-1,300\n💡 Expat allowances significantly reduce cost burden",
          tags: ["렌트", "몬테레이", "주재원"] },
      ],
      taxLiving: [
        { emoji: "💵", name: "세금 정보 (멕시코 공통)", nameEn: "Tax Information (Mexico — same nationwide)",
          desc: ko
            ? "멕시코 전국 동일 세율:\n연방 ISR (소득세): 1.92-35% (누진)\nIVA (부가가치세): 16% (식료품·의약품 면세)\n\n💡 주재원의 경우 한국 본사와 세금 처리 협의 필수\n💡 RFC (납세자 등록) 필수"
            : "Mexico uniform tax rates:\nFederal ISR (income tax): 1.92-35% (progressive)\nIVA (VAT): 16% (groceries & meds exempt)\n\n💡 Expats must coordinate tax treatment with Korean HQ\n💡 RFC (taxpayer ID) registration required",
          tags: ["멕시코세금", "ISR", "주재원"] },
        { emoji: "🛒", name: "생활비 평균 (USD 기준)", nameEn: "Average Monthly Expenses (USD)",
          desc: ko
            ? "📊 독신 기준 월 예상 생활비 (USD):\n• 렌트 (1BR 산페드로): $800-1,300\n• 식료품: $150-250\n• 교통 (Metro+Uber): $30-60\n• 공과금: $50-100\n• 외식·여가: $150-300\n⟹ 합계: 약 $1,180-2,010/월\n\n💡 주재원 수당 포함 시 실제 부담 더 낮음"
            : "📊 Estimated monthly expenses (USD):\n• Rent (1BR San Pedro): $800-1,300\n• Groceries: $150-250\n• Transit (Metro+Uber): $30-60\n• Utilities: $50-100\n• Dining out & leisure: $150-300\n⟹ Total: ~$1,180-2,010/month\n\n💡 Actual burden lower with expat allowances",
          tags: ["생활비", "몬테레이", "주재원"] },
      ],
      transportPhone: [
        { emoji: "🚇", name: "교통 — Metro Rey & Ecovía", nameEn: "Transit — Metro Rey & Ecovía",
          desc: ko
            ? "🚇 몬테레이 메트로(Metro Rey): MXN $5/회 🔗 metrorrey.gob.mx\n🚌 Ecovía (BRT): MXN $5/회\n🚗 Uber/DiDi: 저렴 (평균 $3-7/회)\n🏎️ 차량 필수: 교외 한인 주재원 거주지 → 대중교통 불편\n⚽ 월드컵 경기일: BBVA 경기장 → 메트로+셔틀"
            : "🚇 Monterrey Metro (Metro Rey): MXN $5/ride 🔗 metrorrey.gob.mx\n🚌 Ecovía (BRT): MXN $5/ride\n🚗 Uber/DiDi: Affordable (avg $3-7/trip)\n🏎️ Car essential: Suburban Korean expat areas poorly served by transit\n⚽ World Cup day: BBVA Stadium via Metro+shuttle",
          tags: ["몬테레이교통", "MetroRey", "차량필수"] },
        { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
          desc: ko
            ? "📱 Telcel (멕시코 최대 커버리지): MXN $250/월 선불\n🌐 인터넷:\n• Telmex/Infinitum: MXN $400-700/월 ($22-39)\n• Megacable: MXN $350-600/월\n💡 주재원 법인폰 사용 시 회사 계약으로 처리"
            : "📱 Telcel (Mexico's largest coverage): MXN $250/mo prepaid\n🌐 Internet:\n• Telmex/Infinitum: MXN $400-700/mo ($22-39)\n• Megacable: MXN $350-600/mo\n💡 Expats usually use company-contracted corporate phones",
          tags: ["통신비", "Telcel", "몬테레이"] },
      ],
    },
  };
  // 나머지 도시 공통 fallback
  const generic: CostData = {
    rentHousing: [
      { emoji: "🏠", name: ko ? "렌트 시세 — 정보 업데이트 중" : "Rent Prices — Info Being Updated",
        desc: ko
          ? "📊 이 도시의 렌트 정보를 업데이트 중입니다.\n\n일반 참고:\n• 스튜디오: $1,000-2,000\n• 1BR: $1,200-2,500\n• 2BR: $1,600-3,200\n\n💡 Zillow·Apartments.com에서 현재 시세를 확인하세요\n🔗 zillow.com | apartments.com"
          : "📊 Rent data for this city is being updated.\n\nGeneral reference:\n• Studio: $1,000-2,000\n• 1BR: $1,200-2,500\n• 2BR: $1,600-3,200\n\n💡 Check current rates at Zillow or Apartments.com\n🔗 zillow.com | apartments.com",
        tags: ko ? ["렌트", "업데이트중"] : ["Rent", "Updating"] },
    ],
    taxLiving: [
      { emoji: "💵", name: ko ? "세금 정보" : "Tax Information",
        desc: ko
          ? "각 도시·주의 세금 정보를 업데이트 중입니다.\n\n공통 적용:\n• 연방 소득세: 10-37% (누진)\n• FBAR: 해외계좌 $10,000 초과 시 신고 필수\n• VITA 무료 세금신고: 소득 $67,000 이하\n\n💡 현지 한인 CPA에게 개인 상황 맞춤 상담을 받으세요"
          : "Tax information for this city is being updated.\n\nUniversal US rules:\n• Federal income tax: 10-37% (progressive)\n• FBAR: Required if foreign accounts exceed $10,000\n• VITA free tax filing: Income under $67,000\n\n💡 Consult a local Korean CPA for your specific situation",
        tags: ko ? ["세금", "연방세", "VITA"] : ["Tax", "Federal", "VITA"] },
      { emoji: "🛒", name: ko ? "생활비 정보 업데이트 중" : "Cost of Living — Being Updated",
        desc: ko
          ? "이 도시의 상세 생활비 정보를 준비 중입니다.\n\n💡 도시별 생활비 비교: numbeo.com/cost-of-living/"
          : "Detailed cost of living data for this city is being prepared.\n\n💡 Compare city costs: numbeo.com/cost-of-living/",
        tags: ko ? ["생활비", "업데이트중"] : ["Living Cost", "Updating"] },
    ],
    transportPhone: [
      { emoji: "⛽", name: ko ? "교통 정보 업데이트 중" : "Transport Info — Being Updated",
        desc: ko
          ? "이 도시의 교통 정보를 업데이트 중입니다.\n\n💡 Google Maps로 대중교통·차량 경로 확인\n🔗 maps.google.com"
          : "Transport data for this city is being updated.\n\n💡 Use Google Maps to check public transit and driving routes\n🔗 maps.google.com",
        tags: ko ? ["교통", "업데이트중"] : ["Transit", "Updating"] },
      { emoji: "📱", name: ko ? "통신비" : "Phone & Internet",
        desc: ko
          ? "📱 전국 통신사는 모든 도시에서 사용 가능:\n• T-Mobile Prepaid: $30/월 (무제한)\n• Mint Mobile: $15/월 (3개월 선불)\n• AT&T·Verizon: 정규 요금제\n🌐 인터넷은 도시별 공급자 확인 필요"
          : "📱 National carriers available in all cities:\n• T-Mobile Prepaid: $30/mo (unlimited)\n• Mint Mobile: $15/mo (3-month prepaid)\n• AT&T & Verizon: regular plans\n🌐 Internet providers vary by city",
        tags: ko ? ["통신비", "T-Mobile", "인터넷"] : ["Phone", "T-Mobile", "Internet"] },
    ],
  };

  return DATA[slug] || generic;
}

/* ─────────────────────────────────────────
   TAB 9: 생활비 SCREEN
───────────────────────────────────────── */
function CostScreen({ onHome, initialSub = 0 }: { onHome?: () => void; initialSub?: number }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(initialSub);
  useEffect(() => { setSub(initialSub); }, [initialSub]);
  const city = useCityConfig();
  const isSeattle = city.slug === "seattle";
  const tabs = lang === "ko"
    ? ["렌트·주거", "세금·생활비", "교통·통신", "💡 알뜰생활", "📋 세금신고"]
    : ["Rent & Housing", "Tax & Living", "Transport & Phone", "💡 Smart Living", "📋 Tax Filing"];
  const accent = "#34D399";

  const { rentHousing, taxLiving, transportPhone } = getCityCostData(city.slug, lang);

  // ── 알뜰생활 탭 데이터 ──────────────────────────────────────────
  // 도시별 쇼핑·다양한 식당 데이터 사용
  const cityShoppingData = getCityShoppingMarkets(city.slug, lang);
  const cityEthnics = getCityEthnicEateries(city.slug, lang);

  const smartShoppingMarkets = city.slug === "seattle" ? [
    { emoji: "🏪", name: "코스트코 (Costco)", nameEn: "Costco — Best Value Warehouse",
      desc: lang === "ko"
        ? "✅ 검증됨 | 연 멤버십 $65 → 평균 $300+ 절약\n📍 린우드: 4401 Auto Mall Dr | 📍 쇼어라인: 14905 1st Ave NE\n• 코스트코 주유소: 지역 최저가 (갤런당 10-20센트 저렴)\n• 한인 추천: 커클랜드 연어, 갈비, 대용량 쌀\n🔗 costco.com"
        : "✅ Verified | Annual membership $65 → saves avg $300+/yr\n📍 Lynnwood: 4401 Auto Mall Dr | 📍 Shoreline: 14905 1st Ave NE\n• Costco Gas: area's cheapest gas (10-20 cents/gal cheaper)\n• Korean favorites: Kirkland salmon, short ribs, rice in bulk\n🔗 costco.com",
      tags: ["코스트코", "창고형", "저렴"] },
    { emoji: "🛒", name: "Grocery Outlet", nameEn: "Grocery Outlet — 30-70% Off",
      desc: lang === "ko"
        ? "✅ 검증됨 | 정가 대비 30-70% 할인\n• '보물찾기' 스타일 — 매주 다른 재고\n• 추천: 과자·음료·유제품·육류 마크다운\n• 시애틀 지역 여러 지점 운영\n🔗 groceryoutlet.com"
        : "✅ Verified | 30-70% off regular grocery prices\n• 'Treasure hunt' style — stock changes weekly\n• Best for: snacks, beverages, dairy, meat markdowns\n• Multiple Seattle area locations\n🔗 groceryoutlet.com",
      tags: ["할인마트", "식품", "절약"] },
    { emoji: "🏬", name: "WinCo Foods", nameEn: "WinCo Foods — Lowest Prices",
      desc: lang === "ko"
        ? "✅ 검증됨 | 식료품 최저가 보장 (직원 소유 = 좋은 서비스)\n📍 린우드: 19500 Hwy 99 | 렌튼 | 에버렛\n• 벌크 빈 코너: 필요한 만큼만 구매 가능\n• ⚠️ 신용카드 불가 (직불카드·현금만)\n🔗 wincofoods.com"
        : "✅ Verified | Consistently LOWEST prices for staples\n📍 Lynnwood: 19500 Hwy 99 | Renton | Everett\n• Employee-owned = better service\n• Bulk bins: buy exact amounts needed\n• ⚠️ No credit cards (debit/cash only)\n🔗 wincofoods.com",
      tags: ["WinCo", "최저가", "벌크"] },
    { emoji: "🥬", name: "99 Ranch Market (99랜치)", nameEn: "99 Ranch Market — Pan-Asian",
      desc: lang === "ko"
        ? "✅ 검증됨 | 중국·범아시안 슈퍼마켓\n📍 벨뷰: 14700 NE 20th St | 📍 에드먼즈: 23830 Hwy 99\n• 신선 해산물·두부·채소 H-Mart 대비 20-40% 저렴\n• 추천: 야채·허브·국수·냉동 만두\n🔗 99ranch.com"
        : "✅ Verified | Chinese/Pan-Asian supermarket\n📍 Bellevue: 14700 NE 20th St | 📍 Edmonds: 23830 Hwy 99\n• Fresh seafood, tofu, produce 20-40% cheaper than H-Mart\n• Great for: vegetables, herbs, noodles, frozen dumplings\n🔗 99ranch.com",
      tags: ["99랜치", "아시안마트", "저렴"] },
    { emoji: "🐟", name: "우와지마야 (Uwajimaya)", nameEn: "Uwajimaya — Japanese/Asian",
      desc: lang === "ko"
        ? "✅ 검증됨 | 일본·아시안 슈퍼마켓 — 최고의 해산물 선택\n📍 벨뷰: 699 120th Ave NE | 📍 시애틀: 600 5th Ave S\n• 즉석 델리·일본 스낵·정통 재료\n• 일본 요리 재료·조미료 최다 구비\n🔗 uwajimaya.com"
        : "✅ Verified | Japanese/Asian supermarket — best seafood selection\n📍 Bellevue: 699 120th Ave NE | 📍 Seattle: 600 5th Ave S\n• Hot deli, Japanese snacks, authentic ingredients\n• Best selection of Japanese cooking ingredients\n🔗 uwajimaya.com",
      tags: ["우와지마야", "일본마트", "해산물"] },
    { emoji: "🌿", name: "Trader Joe's", nameEn: "Trader Joe's — Quality at Low Price",
      desc: lang === "ko"
        ? "✅ 검증됨 | 고품질 자체 브랜드 제품 저렴하게\n• 유명 제품: $3 와인, 저렴한 견과류·말린과일, 냉동밀\n• 유기농·건강식품 저렴 | 시애틀 여러 지점\n• 한인에게 덜 알려진 알뜰 마트\n🔗 traderjoes.com"
        : "✅ Verified | Quality private-label products at lower prices\n• Famous for: $3 wine, cheap nuts/dried fruit, frozen meals\n• Organic & health foods at low prices | Multiple Seattle locations\n• Great value overlooked by many Koreans\n🔗 traderjoes.com",
      tags: ["TJ", "유기농", "가성비"] },
    { emoji: "♻️", name: "Goodwill / 중고마켓", nameEn: "Goodwill & Second-Hand",
      desc: lang === "ko"
        ? "✅ 검증됨 | 중고의류 $3-15, 가구·가전\n• 벨뷰/커클랜드 굿윌: 명품 아이템 자주 등장\n• Facebook Marketplace & Buy Nothing 그룹: 무료 아이템 다수\n• 린우드·벨뷰·시애틀 여러 지점\n🔗 goodwillwa.org"
        : "✅ Verified | Clothing $3-15, furniture, electronics\n• Bellevue/Kirkland locations often have designer items\n• Facebook Marketplace & Buy Nothing groups: many free items\n• Lynnwood, Bellevue, Seattle locations\n🔗 goodwillwa.org",
      tags: ["중고", "굿윌", "무료"] },
  ] : cityShoppingData;

  const ethnicEateries = city.slug === "seattle" ? [
    { emoji: "🍜", name: "베트남 쌀국수 (Pho)", nameEn: "Vietnamese Pho",
      desc: lang === "ko"
        ? "거대한 한 그릇 $12-15, 엄청난 포만감\n• 인기 가게: Pho Bac (여러 지점), Green Leaf Vietnamese\n• \"김치찌개보다 저렴하고 양 2배\"\n• 한인에게 강력 추천하는 타민족 맛집\n📍 google.com/maps/search/pho+seattle"
        : "Huge bowl $12-15, incredibly filling\n• Popular spots: Pho Bac (multiple), Green Leaf Vietnamese\n• \"Cheaper than Korean stew and twice the portion\"\n• Highly recommended for Korean immigrants\n📍 google.com/maps/search/pho+seattle",
      tags: ["베트남", "포", "가성비"] },
    { emoji: "🌮", name: "멕시칸 타코·부리토", nameEn: "Mexican Tacos & Burritos",
      desc: lang === "ko"
        ? "타코 $3-4개, 부리토 $10-12 (2인분 양)\n• 인기: El Camion (푸드트럭), Tacos Guaymas, Taqueria El Rinconcito\n• \"한국 분식보다 훨씬 배부릅니다\"\n📍 google.com/maps/search/taco+truck+seattle"
        : "Tacos $3-4 each, burrito $10-12 (2 people's worth of food)\n• Popular: El Camion (food truck), Tacos Guaymas, Taqueria El Rinconcito\n• \"More filling than Korean snack food at the same price\"\n📍 google.com/maps/search/taco+truck+seattle",
      tags: ["멕시칸", "타코", "저렴"] },
    { emoji: "🍛", name: "인도 뷔페 (점심)", nameEn: "Indian Lunch Buffet",
      desc: lang === "ko"
        ? "무제한 점심 뷔페 $14-17\n• 인기: Vij's Railway Express, Taste of India\n• \"14달러에 무제한 — 인도 카레의 보물창고\"\n• 매일 바뀌는 다양한 카레·난·라이스\n📍 google.com/maps/search/indian+buffet+seattle"
        : "Unlimited lunch buffet $14-17\n• Popular: Vij's Railway Express, Taste of India\n• \"Unlimited for $14 — treasure chest of Indian curry\"\n• Daily rotating curries, naan & rice\n📍 google.com/maps/search/indian+buffet+seattle",
      tags: ["인도", "뷔페", "무제한"] },
    { emoji: "🇪🇹", name: "에티오피아 음식", nameEn: "Ethiopian Restaurant",
      desc: lang === "ko"
        ? "$12-15, 엄청난 양, 공동 인제라 빵 (함께 먹는 문화)\n• 컬럼비아 시티 지역: Jebena Cafe, Cafe Selam\n• \"스페이스 니들 뷰 레스토랑의 1/5 가격\"\n• 독특한 향신료·채식 옵션 풍부\n📍 google.com/maps/search/ethiopian+restaurant+seattle"
        : "$12-15, huge portions, communal injera bread\n• Columbia City area: Jebena Cafe, Cafe Selam\n• \"1/5 the price of a Space Needle view restaurant\"\n• Unique spices, abundant vegetarian options\n📍 google.com/maps/search/ethiopian+restaurant+seattle",
      tags: ["에티오피아", "저렴", "컬럼비아시티"] },
  ] : cityEthnics;

  const allCost = serverContent["cost"] ? resolvePlaceItems(serverContent["cost"], lang) : null;
  const subData = allCost
    ? [allCost.slice(0, 1), allCost.slice(1, 3), allCost.slice(3), [...smartShoppingMarkets, ...ethnicEateries]]
    : [rentHousing, taxLiving, transportPhone, [...smartShoppingMarkets, ...ethnicEateries]];
  const content = subData[sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="💰" titleKo="생활비 가이드" titleEn="Living Cost Guide"
        descKo={`${city.nameKo} 렌트·세금·교통·통신비 완전 가이드`}
        descEn={`Complete guide to rent, taxes, transport & phone costs in ${city.nameEn}`}
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        {sub !== 3 && sub !== 4 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            </div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>
                💰 {lang === "ko" ? "비용 절약 팁" : "Cost-saving Tip"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
                {lang === "ko"
                  ? isSeattle
                    ? "워싱턴주는 소득세가 없어서 같은 연봉이라도 캘리포니아(13.3%)나 오리건(9.9%)보다 실수령액이 훨씬 높습니다. 린우드 거주 시 Link Light Rail로 시애틀 통근이 가능해 교통비도 절약됩니다."
                    : city.slug === "dallas" || city.slug === "houston" || city.slug === "nashville" || city.slug === "miami"
                      ? `${city.nameKo}이 있는 주는 소득세가 없어 같은 연봉이라도 실수령액이 높습니다. VITA 무료 세금신고($67K 이하)와 Costco 멤버십을 적극 활용하세요.`
                      : city.slug === "toronto" || city.slug === "vancouver"
                        ? `캐나다는 OHIP/BC Care Card로 무료 의료 혜택을 받을 수 있습니다. 알뜰 통신(Public Mobile·Koodo)과 Costco 멤버십으로 생활비를 절약하세요.`
                        : city.slug === "mexicocity"
                          ? "멕시코시티는 북미에서 가장 저렴한 한인 거점 도시입니다. Uber/DiDi를 적극 활용하고, 현지 SIM으로 통신비를 크게 절약하세요."
                          : `${city.nameKo}에서 VITA 무료 세금신고($67K 이하)를 꼭 활용하세요. Costco 멤버십($65/년)으로 연 $300+ 절약이 가능하며, Mint Mobile ($15/월)로 통신비도 줄일 수 있습니다.`
                  : isSeattle
                    ? "WA has no income tax, so take-home pay is much higher than California (13.3%) or Oregon (9.9%) on the same salary. Living in Lynnwood and commuting via Link Light Rail also saves on transportation costs."
                    : city.slug === "dallas" || city.slug === "houston" || city.slug === "nashville" || city.slug === "miami"
                      ? `${city.nameEn}'s state has no income tax — great for take-home pay. Use VITA free tax filing (under $67K) and a Costco membership to maximize savings.`
                      : city.slug === "toronto" || city.slug === "vancouver"
                        ? "Canada offers free healthcare (OHIP/BC Care Card) after a 3-month wait. Use budget carriers (Public Mobile, Koodo) and a Costco membership to reduce monthly costs."
                        : city.slug === "mexicocity"
                          ? "Mexico City is the most affordable Korean hub city in North America. Use Uber/DiDi frequently and get a local SIM to dramatically cut phone costs."
                          : `In ${city.nameEn}, use VITA free tax filing (under $67K). A Costco membership ($65/yr) saves $300+/year, and Mint Mobile ($15/mo) keeps phone costs low.`}
              </div>
            </div>
          </>
        ) : sub === 3 ? (
          <>
            {/* ── 섹션 1: 알뜰 쇼핑 마트 ── */}
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: accent, letterSpacing: "0.5px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              🛒 {lang === "ko" ? "알뜰 쇼핑 마트" : "Smart Shopping Markets"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
              {smartShoppingMarkets.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            </div>

            {/* ── 섹션 2: 타민족 인기 맛집 ── */}
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: accent, letterSpacing: "0.5px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              🌍 {lang === "ko" ? "타민족 인기 맛집" : "Popular Ethnic Eateries"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
              {ethnicEateries.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            </div>

            {/* ── 섹션 3: 절약 앱 & 무료자원 ── */}
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: accent, letterSpacing: "0.5px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              📱 {lang === "ko" ? "절약 앱 & 무료자원" : "Money-Saving Apps & Free Resources"}
            </div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 8 }}>
                📱 {lang === "ko" ? "돈 절약 앱" : "Apps to Save Money"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { href: "https://www.gasbuddy.com", emoji: "⛽", label: "GasBuddy", sub: lang === "ko" ? "근처 최저 유가 찾기" : "Find cheapest gas nearby" },
                  { href: "https://home.ibotta.com", emoji: "💸", label: "Ibotta", sub: lang === "ko" ? "식료품 캐시백 — 월 $20-50 절약" : "Grocery cashback — save $20-50/month" },
                  { href: "https://www.fetchrewards.com", emoji: "🎁", label: "Fetch Rewards", sub: lang === "ko" ? "영수증 스캔 → 포인트 → 기프트카드" : "Scan receipts for points → gift cards" },
                  { href: "https://www.offerup.com", emoji: "🔄", label: "OfferUp / Facebook Marketplace", sub: lang === "ko" ? "중고 사고팔기 — 무료 아이템도 많음" : "Buy/sell local — many free items" },
                ].map((link, i) => (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(52,211,153,0.15)" }}>
                    <span style={{ fontSize: 16 }}>{link.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>{link.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{link.sub}</div>
                    </div>
                    <span style={{ color: accent, fontSize: 14 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 8 }}>
                🆓 {lang === "ko" ? "무료자원 — 꼭 활용하세요!" : "FREE Resources — Don't Miss These!"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  // 시애틀 전용 자원
                  ...(isSeattle ? [
                    { href: "https://www.spl.org", emoji: "📚", label: lang === "ko" ? "시애틀 공공도서관 (SPL)" : "Seattle Public Library (SPL)", sub: lang === "ko" ? "무료 인터넷·eBook(Libby)·Kanopy 영화·언어학습(Mango — 무료!)" : "Free internet, eBooks (Libby), Kanopy movies, Mango Languages (free!)" },
                    { href: "https://www.seattleartmuseum.org", emoji: "🎨", label: lang === "ko" ? "시애틀 미술관 (SAM)" : "Seattle Art Museum (SAM)", sub: lang === "ko" ? "매달 첫째 목요일 오후 5-9시 무료 입장" : "FREE first Thursday of every month, 5-9PM" },
                    { href: "https://www.zoo.org", emoji: "🦁", label: lang === "ko" ? "우들랜드 파크 동물원" : "Woodland Park Zoo", sub: lang === "ko" ? "시애틀 거주자 할인 요금 적용" : "Reduced price for Seattle residents" },
                    { href: "https://discoverpass.wa.gov", emoji: "🌲", label: lang === "ko" ? "Discover Pass ($30/년)" : "Discover Pass ($30/yr)", sub: lang === "ko" ? "워싱턴주 전체 주립공원·해변 무제한 입장" : "All WA state parks & beaches — unlimited access" },
                  ] : [
                    // 전 도시 공통 자원 (도시명 삽입)
                    { href: "https://www.numbeo.com/cost-of-living/", emoji: "📊", label: "Numbeo", sub: lang === "ko" ? `${city.nameKo} 도시 생활비 실시간 비교` : `Live cost of living comparison for ${city.nameEn}` },
                    { href: "https://www.gasbuddy.com", emoji: "⛽", label: "GasBuddy", sub: lang === "ko" ? "근처 최저 유가 실시간 찾기" : "Find cheapest gas nearby in real time" },
                  ]),
                  // 전 도시 공통
                  { href: "https://www.vitataxhelp.org", emoji: "📋", label: lang === "ko" ? "VITA 무료 세금신고" : "VITA Free Tax Filing", sub: lang === "ko" ? "소득 $67K 이하 — 1월~4월 무료 세금 신고" : "Income under $67K — FREE tax prep Jan-April" },
                ].map((link, i) => (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(52,211,153,0.15)" }}>
                    <span style={{ fontSize: 16 }}>{link.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>{link.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{link.sub}</div>
                    </div>
                    <span style={{ color: accent, fontSize: 14 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>
                💡 {lang === "ko" ? "알뜰생활 철학" : "Smart Living Philosophy"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
                {lang === "ko"
                  ? "HebronGuide는 한인 커뮤니티를 넘어 다문화 미국 생활 전체를 가르칩니다. 베트남 쌀국수, 멕시칸 타코, 인도 뷔페 — 이민자들이 만든 음식이 이민자에게 가장 가성비가 좋습니다. 돈을 아끼면서 지혜로운 생활 🌎"
                  : "HebronGuide teaches you to thrive in ALL of multicultural America, not just the Korean community. Vietnamese pho, Mexican tacos, Indian buffets — food made by immigrants offers the best value for immigrants. Smart frugal living 🌎"}
              </div>
            </div>
          </>
        ) : (
          /* ── 세금신고 탭 (index 4) ── */
          <>
            <div style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(52,211,153,0.08))", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 15, color: "#ECFDF5", marginBottom: 6 }}>
                📋 {lang === "ko" ? "세금신고 완전 가이드" : "Complete Tax Filing Guide"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, lineHeight: 1.7, color: "rgba(236,253,245,0.7)" }}>
                {lang === "ko"
                  ? isSeattle
                    ? "✅ WA주는 소득세 없음! 하지만 연방 세금(IRS)은 신고 필수. 한인 이민자들이 모르는 세금 혜택과 무료 신고 방법을 알려드립니다."
                    : city.slug === "dallas" || city.slug === "houston" || city.slug === "nashville" || city.slug === "miami"
                      ? `✅ ${city.nameKo}이 속한 주는 소득세 없음! 하지만 연방 세금(IRS)은 신고 필수. 한인 이민자들이 모르는 세금 혜택과 무료 신고 방법을 알려드립니다.`
                      : `연방 세금(IRS)은 모든 미국 거주자 신고 필수입니다. ${city.nameKo}의 주 소득세와 연방세를 함께 신고해야 합니다. 한인 이민자 전용 세금 혜택을 꼭 확인하세요.`
                  : isSeattle
                    ? "✅ WA has no state income tax! But federal taxes (IRS) are required. Here's what Korean immigrants often don't know about tax benefits and free filing options."
                    : city.slug === "dallas" || city.slug === "houston" || city.slug === "nashville" || city.slug === "miami"
                      ? `✅ ${city.nameEn}'s state has no income tax! But federal taxes (IRS) are required. Here's what Korean immigrants often don't know about tax benefits and free filing options.`
                      : `Federal taxes (IRS) are required for all US residents. In ${city.nameEn}, you'll file both state and federal taxes. Make sure to claim all Korean immigrant tax benefits below.`}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { emoji: "🆓", name: lang === "ko" ? "VITA 무료 세금신고 ✅ 검증됨" : "VITA Free Tax Filing ✅ Verified",
                  desc: lang === "ko"
                    ? `소득 $67,000 이하 무료 세금 신고! IRS 공인 자원봉사자 지원.\n📅 매년 1월 말 ~ 4월 15일\n🔗 vitataxhelp.org 또는 IRS.gov/VITA\n\n${city.nameKo} 지역 VITA 위치:\n• 가까운 공공도서관 지점 확인\n• 현지 한인 커뮤니티 센터 확인\n📞 211 전화 → 가까운 VITA 위치 안내`
                    : `FREE tax prep for income under $67,000! IRS-certified volunteers.\n📅 Late January – April 15 each year\n🔗 vitataxhelp.org or IRS.gov/VITA\n\nVITA locations in ${city.nameEn}:\n• Check local public library branches\n• Check Korean community centers nearby\n📞 Call 211 → nearest VITA location`,
                  tags: lang === "ko" ? ["무료세금신고", "VITA", "중요"] : ["Free Tax Filing", "VITA", "Important"] },
                { emoji: "🆔", name: lang === "ko" ? "ITIN (개인납세자번호) 신청" : "ITIN Application (Individual Taxpayer ID)",
                  desc: lang === "ko"
                    ? "SSN 없어도 세금 신고 가능! IRS Form W-7 제출.\n\n필요한 경우:\n• F-1 학생비자 (SSN 없는 경우)\n• 워킹홀리데이·J-1\n• E-2 투자비자\n• 비거주외국인 소득 있는 경우\n\n처리기간: 7-11주\n한인 CPA 도움 강력 권장\n📞 IRS: 1-800-829-1040"
                    : "You can file taxes even without an SSN! Submit IRS Form W-7.\n\nNeeded when:\n• F-1 student (no SSN)\n• J-1 exchange visitor\n• E-2 investor visa\n• Non-resident alien with US income\n\nProcessing: 7-11 weeks\nStrongly recommend Korean CPA assistance\n📞 IRS: 1-800-829-1040",
                  tags: lang === "ko" ? ["ITIN", "W-7", "SSN없이"] : ["ITIN", "W-7", "No SSN"] },
                { emoji: "🏠", name: lang === "ko" ? "한국 소득·해외계좌 신고 (FBAR/FATCA)" : "Foreign Income & Account Reporting (FBAR/FATCA)",
                  desc: lang === "ko"
                    ? "⚠️ 반드시 확인! 한국 소득 또는 해외 계좌 있으면:\n\nFBAR (FinCEN 114):\n• 해외 금융계좌 합계 $10,000 초과 시 매년 신고\n• bsaefiling.fincen.treas.gov (무료, 온라인)\n• 미신고 시 벌금 $10,000~\n\nFATCA (Form 8938):\n• 해외 금융자산 독신 $50K / 부부 $100K 초과 시\n\n💡 한인 CPA (IRS Enrolled Agent) 상담 필수!"
                    : "⚠️ Must check if you have Korean income or overseas accounts!\n\nFBAR (FinCEN 114):\n• File annually if total foreign accounts exceed $10,000\n• bsaefiling.fincen.treas.gov (free, online)\n• Penalty for non-filing: $10,000+\n\nFATCA (Form 8938):\n• Single: $50K / Married: $100K in foreign assets\n\n💡 Must consult Korean CPA (IRS Enrolled Agent)!",
                  tags: lang === "ko" ? ["FBAR", "FATCA", "해외계좌"] : ["FBAR", "FATCA", "Foreign Assets"] },
                { emoji: "💰", name: lang === "ko" ? "이민자 세금 혜택 — 모르면 손해" : "Tax Credits for Immigrants — Don't Miss Out",
                  desc: lang === "ko"
                    ? "✅ 많은 한인 이민자가 놓치는 세금 환급:\n\n• Earned Income Tax Credit (EITC): 저소득 근로자 최대 $7,430 환급\n• Child Tax Credit: 자녀 1인당 최대 $2,000\n• Child & Dependent Care Credit: 보육비 최대 35% 환급\n• American Opportunity Credit: 대학 학비 최대 $2,500 환급\n• Education credits: 등록금 세금 공제\n\n💡 VITA에서 무료로 이 모든 혜택 신청 가능!"
                    : "✅ Tax refunds many Korean immigrants miss:\n\n• Earned Income Tax Credit (EITC): up to $7,430 refund for low-income workers\n• Child Tax Credit: up to $2,000 per child\n• Child & Dependent Care Credit: up to 35% of childcare costs\n• American Opportunity Credit: up to $2,500 for college tuition\n• Education credits: tuition deductions\n\n💡 All of these can be claimed FREE at VITA!",
                  tags: lang === "ko" ? ["세금혜택", "환급", "EITC"] : ["Tax Credits", "Refund", "EITC"] },
                { emoji: "👨‍💼", name: lang === "ko" ? `${city.nameKo} 한인 CPA·세무사 찾기` : `Korean CPAs & Tax Accountants in ${city.nameEn}`,
                  desc: lang === "ko"
                    ? `복잡한 세금 상황은 전문가에게!\n\n${city.nameKo} 한인 CPA 찾기:\n• 미주한국일보 (koreatimes.com) 업소록 → '회계사' 검색\n• 미주중앙일보 (koreadaily.com) 업소록 → 세금·회계\n• 카카오오픈채팅 '${city.nameKo}한인' 추천 요청\n\n비용 기준 (참고용):\n• 개인 기본 세금신고: $150-300\n• 자영업자: $300-600\n• FBAR/FATCA 포함: $400-800\n\n💡 H&R Block·TurboTax보다 한인 CPA가 이민자 상황에 더 정통`
                    : `Complex tax situations? Go to a professional!\n\nFind Korean CPAs in ${city.nameEn}:\n• Korea Times (koreatimes.com) directory → 'accountant'\n• Korea Daily (koreadaily.com) directory → tax & accounting\n• Ask in KakaoTalk '${city.nameKo}한인'\n\nTypical fees (reference only):\n• Basic personal return: $150-300\n• Self-employed: $300-600\n• With FBAR/FATCA: $400-800\n\n💡 Korean CPAs are more knowledgeable about immigrant tax situations than H&R Block or TurboTax`,
                  tags: lang === "ko" ? ["한인CPA", "세무사", "전문가"] : ["Korean CPA", "Tax Pro", "Accountant"] },
                { emoji: "📅", name: lang === "ko" ? "세금 신고 캘린더" : "Tax Filing Calendar",
                  desc: lang === "ko"
                    ? `✅ 연간 세금 일정:\n\n• 1월 초: W-2·1099 양식 수령 시작\n• 1월 말~4월: VITA 무료 세금신고 운영\n• 4월 15일: 연방 세금신고 마감\n• 4월 15일: FBAR 마감 (FincEN 114)\n• 4월 15일 연장 신청 가능: Form 4868 (10월 15일까지 연장)\n\n• 분기별 예납세 (자영업): 4/15, 6/15, 9/15, 1/15\n\n${(isSeattle || city.slug === "dallas" || city.slug === "houston" || city.slug === "nashville" || city.slug === "miami") ? "💡 이 주는 소득세 없으므로 주세 신고 불필요!" : `💡 ${city.nameKo} 주 소득세 신고도 4월 15일 마감!`}`
                    : `✅ Annual tax calendar:\n\n• Early January: W-2 & 1099 forms arrive\n• Late Jan–April: VITA free tax filing open\n• April 15: Federal tax filing deadline\n• April 15: FBAR deadline (FinCEN 114)\n• Extension available: Form 4868 (extends to Oct 15)\n\n• Quarterly estimated taxes (self-employed): 4/15, 6/15, 9/15, 1/15\n\n${(isSeattle || city.slug === "dallas" || city.slug === "houston" || city.slug === "nashville" || city.slug === "miami") ? "💡 No state income tax return needed in this state!" : `💡 ${city.nameEn} state income tax also due April 15!`}`,
                  tags: lang === "ko" ? ["세금일정", "4월15일", "연장신청"] : ["Tax Calendar", "April 15", "Extension"] },
              ].map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            </div>
            <div style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 12 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "#FB923C", marginBottom: 4 }}>💡 {lang === "ko" ? "세금신고 핵심 원칙" : "Key Tax Filing Principles"}</div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
                {lang === "ko"
                  ? "1. 소득이 있으면 신고 — 금액 작아도 의무\n2. VITA 무료 신고 먼저 확인 ($67K 이하)\n3. 해외 계좌 $10K+ → FBAR 별도 신고 필수\n4. 연장 신청은 납부 연장 아님 — 세금은 4/15까지 납부\n5. 복잡한 상황 → 반드시 한인 CPA 상담"
                  : "1. File if you have income — even small amounts are required\n2. Check VITA free filing first (under $67K)\n3. Foreign accounts $10K+ → FBAR filing required separately\n4. Extension ≠ payment extension — taxes still due by 4/15\n5. Complex situation → consult Korean CPA"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB 10: 사람 연결 SCREEN — Hebron Connect Platform
   ═══════════════════════════════════════════════════════ */
function ConnectScreen({ onHome }: { onHome?: () => void }) {
  const { lang } = useI18n();
  const city = useCityConfig();
  const [sub, setSub] = useState(0);

  const ko = lang === "ko";
  const tabs = ko
    ? ["🚗 라이드", "🏠 스테이", "📚 튜터", "🤝 커뮤니티", "💍 매칭", "🛠️ 기그"]
    : ["🚗 Ride", "🏠 Stay", "📚 Tutor", "🤝 Connect", "💍 Match", "🛠️ Gig"];
  const accent = "#C9A227";

  const SERVICES = [
    {
      id: "ride", icon: "🚗", color: "#3B82F6",
      titleKo: "헤브론 라이드", titleEn: "Hebron Ride",
      taglineKo: "한국어로 따뜻하게 맞이하는 이동 서비스",
      taglineEn: "Korean-speaking rides with warmth and care",
      stepsKo: ["한인 드라이버 등록 & 확인", "라이드 요청 매칭 (한국어)", "이동 + 도시 정보 나눔"],
      stepsEn: ["Korean driver registration & screening", "Ride request matching (Korean)", "Travel + city info sharing"],
      benchmarkName: "BlaBlaCar",
      benchmarkData: ko ? "1억 회원 · 26개국 · $1.6B 기업가치 · 커뮤니티 신뢰 모델" : "100M users · 26 countries · $1.6B valuation · community trust model",
      benchmarkLesson: ko ? "신뢰가 플랫폼의 핵심 — 검증된 드라이버 커뮤니티가 성공 비결" : "Trust is the platform — verified driver community is the key",
      hebronKo: "한인 커뮤니티의 신뢰. 한국어 + 공항 픽업 특화. 따뜻한 동포가 맞이합니다.",
      hebronEn: "Church verification = trust beyond Airbnb Superhost. Korean + airport pickup specialty. Pastor-recommended drivers.",
      revenueKo: "드라이버 수익의 15% 수수료 | 공항픽업 $35-55 | 월정기권 $120",
      revenueEn: "15% commission on driver earnings | Airport pickup $35-55 | Monthly pass $120",
      statusKo: "파일럿 준비 중",  statusEn: "Pilot in preparation",
      statusColor: "#F59E0B",
    },
    {
      id: "stay", icon: "🏠", color: "#F59E0B",
      titleKo: "헤브론 스테이", titleEn: "Hebron Stay",
      taglineKo: "방 하나가 아닙니다. 정착의 시작입니다",
      taglineEn: "Not just a room. The beginning of belonging.",
      stepsKo: ["파트너 교회 호스트 등록 & 검증", "단기 거주 매칭 (1주-3개월)", "방 + 정착 오리엔테이션 + 교회 소개"],
      stepsEn: ["Partner church host registration & verification", "Short-term stay matching (1 week – 3 months)", "Room + settlement orientation + church introduction"],
      benchmarkName: "Airbnb + Homestay.com",
      benchmarkData: ko ? "Airbnb: $99억 매출 · 700만 숙소 | Homestay.com: 문화 몰입 + 가정 거주 모델" : "Airbnb: $9.9B revenue · 7M listings | Homestay.com: cultural immersion + family stay model",
      benchmarkLesson: ko ? "Airbnb Superhost 신뢰 시스템 + Homestay 문화 교류 = 헤브론 스테이의 기반" : "Airbnb Superhost trust + Homestay cultural exchange = Hebron Stay foundation",
      hebronKo: "따뜻한 한인 가정의 신뢰. 정착 안내 포함. '방+사람+이야기' 패키지.",
      hebronEn: "Warm Korean family trust. Settlement guidance included. 'Room + people + stories' package.",
      revenueKo: "호스트 수입의 12% 수수료 | 1주 패키지 $300-500 | 1개월 $800-1,200",
      revenueEn: "12% commission on host income | 1-week package $300-500 | 1 month $800-1,200",
      statusKo: "파트너 호스트 모집 중", statusEn: "Recruiting partner hosts",
      statusColor: "#F59E0B",
    },
    {
      id: "tutor", icon: "📚", color: "#10B981",
      titleKo: "헤브론 튜터", titleEn: "Hebron Tutor",
      taglineKo: "검증된 한인 튜터. 교회 신뢰 + 학력 검증",
      taglineEn: "Verified Korean tutors. Church trust + academic credentials.",
      stepsKo: ["튜터 등록 (학력 확인 + 꼼꼼한 과정)", "학생-튜터 매칭 (온라인 44개+ 도시)", "수업 진행 → 파트너 수입"],
      stepsEn: ["Tutor registration (church + academic + background check)", "Student-tutor matching (online across 17 cities)", "Sessions → 15% commission"],
      benchmarkName: "Wyzant",
      benchmarkData: ko ? "250만 학생 · 8만 명 튜터 · $8,000만 매출 · 25% 수수료 · 튜터 검증 시스템" : "2.5M students · 80K tutors · $80M revenue · 25% commission · tutor verification system",
      benchmarkLesson: ko ? "배경조사 + 리뷰 시스템 + 투명한 가격 = 학부모 신뢰의 핵심" : "Background check + reviews + transparent pricing = key to parent trust",
      hebronKo: "한인 커뮤니티 신뢰. 한국어 과외 특화. 한국 교과서·SAT·AP 전문.",
      hebronEn: "Church verification replaces background checks. Korean tutoring specialty. Korean curriculum, SAT, AP focused.",
      revenueKo: "튜터 수입의 15% 수수료 | 시급 $35-80 → HebronGuide $5-12/시간 | 월 매칭 100쌍 → $72,000/년",
      revenueEn: "15% commission | $35-80/hr tutor rate → HebronGuide $5-12/hr | 100 active pairs → $72K/yr",
      statusKo: "베타 튜터 모집 중", statusEn: "Recruiting beta tutors",
      statusColor: "#10B981",
    },
    {
      id: "community", icon: "🤝", color: "#8B5CF6",
      titleKo: "헤브론 커넥트", titleEn: "Hebron Connect",
      taglineKo: "친구·멘토·기도파트너·동업자 — 모든 연결의 시작",
      taglineEn: "Friend · Mentor · Prayer Partner · Business — all connections start here.",
      stepsKo: ["프로필 등록 (커뮤니티 확인)", "연결 유형 선택 (친구/멘토/기도/비즈니스)", "도시 간 매칭 → 만남"],
      stepsEn: ["Profile registration (community screening)", "Select connection type (friend/mentor/prayer/business)", "Cross-city matching → meeting"],
      benchmarkName: "Meetup + Bumble BFF + Nextdoor",
      benchmarkData: ko ? "Meetup: 5,000만 회원 · Bumble BFF: 4,000만 MAU · Nextdoor: $2.1B 기업가치 (위치 검증)" : "Meetup: 50M users · Bumble BFF: 40M MAU · Nextdoor: $2.1B valuation (location-verified)",
      benchmarkLesson: ko ? "공통 관심사 + 검증된 신원 + 오프라인 만남 연결 = 성공적 커뮤니티 플랫폼" : "Shared interests + verified identity + offline meeting connection = successful community platform",
      hebronKo: "한인 커뮤니티 신뢰. 44개+ 도시 크로스 매칭. 다목적 연결.",
      hebronEn: "Church verification > Nextdoor neighbor verification. 17-city cross matching. Multi-purpose connection.",
      revenueKo: "프리미엄 구독 $15/월 | 이벤트 주최 $10/회 | 비즈니스 연결 $30/매칭",
      revenueEn: "Premium subscription $15/mo | Event hosting $10/event | Business connection $30/match",
      statusKo: "개발 중 — 2026년 하반기 출시", statusEn: "In development — H2 2026 launch",
      statusColor: "#8B5CF6",
    },
    {
      id: "matching", icon: "💍", color: "#EC4899",
      titleKo: "헤브론 매칭", titleEn: "Hebron Matching",
      taglineKo: "진지하고 따뜻한 만남 — 신중하게 연결합니다",
      taglineEn: "Thoughtful & warm connections — matched with care.",
      stepsKo: ["프로필 등록 + 가치관 확인", "삶의 방향·관심사 기반 매칭", "신중한 소개 → 자연스러운 교제"],
      stepsEn: ["Profile + values registration", "Life direction & interests-based matching", "Thoughtful introduction → natural relationship"],
      benchmarkName: "Hinge + 선우결혼정보",
      benchmarkData: ko ? "Hinge: $4억 매출 '삭제되도록 설계' · 선우: 한국 1위 $1,000-3,000/건 · DUO America: LA·NY 운영" : "Hinge: $400M revenue 'designed to be deleted' · 선우: Korea #1 $1,000-3,000/match · DUO America: LA & NY",
      benchmarkLesson: ko ? "진지한 관계 지향 + 전문 매칭 = 프리미엄 가치. 미국 내 신앙 기반 한인 매칭 공백 확인됨" : "Intentional relationship focus + professional matching = premium value. Faith-based Korean matching gap confirmed in US market",
      hebronKo: "한인 커뮤니티 신뢰. 투명한 과정. 진심으로 연결. 합리적인 비용.",
      hebronEn: "Korean community trust. Transparent process. Genuine connection. Reasonable cost.",
      revenueKo: "월 구독 $25-35 | 프리미엄 매칭 $150-300/건 | 파트너 교회 네트워크로 확장",
      revenueEn: "Monthly subscription $25-35 | Premium match $150-300/match | Scale through partner church network",
      statusKo: "파트너 교회 모집 중 — 먼저 연락주세요", statusEn: "Recruiting partner churches — contact us first",
      statusColor: "#EC4899",
    },
    // ⛪ 네트워크(목사·선교사)는 교회 탭 > 허브교회 서브탭으로 통합
  ];

  const svc = SERVICES[sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🤝" titleKo="사람 연결" titleEn="Hebron Connect"
        descKo={`${city.nameKo} — 라이드·스테이·튜터·커뮤니티·매칭`}
        descEn={`${city.nameEn} — Rides · Stay · Tutor · Community · Matching`}
        accentColor={accent} />

      {/* 비전 배너 */}
      <div style={{ margin: "0 16px 4px", background: "linear-gradient(135deg, rgba(201,162,39,0.15), rgba(110,231,183,0.08))", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 14, padding: "12px 16px" }}>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: accent, marginBottom: 3 }}>
          ✨ {ko ? "HebronGuide 사람 연결 플랫폼" : "HebronGuide People Connect Platform"}
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.7)", lineHeight: 1.6 }}>
          {ko
            ? "\"내가 나그네 되었을 때 너희가 영접하였다\" (마25:35) — 목사님·선교사님 신뢰 네트워크 위에 세워진 한인 디아스포라 연결 플랫폼"
            : "\"I was a stranger and you welcomed me\" (Matt 25:35) — Korean diaspora connection platform built on pastor & missionary trust network"}
        </div>
      </div>

      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={svc.color} />

      <div style={{ padding: "16px 16px 0" }}>

        {/* 서비스 헤더 */}
        <div style={{ background: `linear-gradient(135deg, ${svc.color}22, ${svc.color}0a)`, border: `1px solid ${svc.color}40`, borderRadius: 20, padding: "20px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{svc.icon}</span>
            <div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 900, fontSize: 18, color: "#ECFDF5" }}>
                {ko ? svc.titleKo : svc.titleEn}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: svc.color, fontWeight: 600, marginTop: 2 }}>
                {ko ? svc.taglineKo : svc.taglineEn}
              </div>
            </div>
          </div>
          {/* 상태 배지 */}
          <span style={{ background: `${svc.statusColor}25`, border: `1px solid ${svc.statusColor}60`, color: svc.statusColor, borderRadius: 20, padding: "4px 12px", fontFamily: "Manrope,sans-serif", fontSize: 10, fontWeight: 700 }}>
            ⚡ {ko ? svc.statusKo : svc.statusEn}
          </span>
        </div>

        {/* 어떻게 작동하나요 */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 11, color: svc.color, marginBottom: 10, letterSpacing: "0.5px" }}>
            📋 {ko ? "어떻게 작동하나요?" : "How It Works"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(ko ? svc.stepsKo : svc.stepsEn).map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${svc.color}30`, border: `1.5px solid ${svc.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 10, color: svc.color }}>{i + 1}</span>
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, color: "rgba(236,253,245,0.85)", lineHeight: 1.5, paddingTop: 2 }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 벤치마크 */}
        <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 10, color: "rgba(236,253,245,0.5)", marginBottom: 6, letterSpacing: "0.5px" }}>
            📊 {ko ? "벤치마크" : "BENCHMARK"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#ECFDF5", marginBottom: 4 }}>
            {svc.benchmarkName}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.6)", lineHeight: 1.6, marginBottom: 6 }}>
            {ko ? svc.benchmarkData : svc.benchmarkData}
          </div>
          <div style={{ background: "rgba(201,162,39,0.1)", borderLeft: "3px solid #C9A227", padding: "6px 10px", borderRadius: "0 6px 6px 0" }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "#C9A227", lineHeight: 1.6 }}>
              💡 {ko ? svc.benchmarkLesson : svc.benchmarkLesson}
            </div>
          </div>
        </div>

        {/* 헤브론 차별성 */}
        <div style={{ background: `linear-gradient(135deg, ${svc.color}15, rgba(110,231,183,0.08))`, border: `1px solid ${svc.color}35`, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 10, color: svc.color, marginBottom: 6, letterSpacing: "0.5px" }}>
            ✝️ {ko ? "헤브론 고유성 — 왜 다른가?" : "HEBRON DIFFERENCE — Why unique?"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, color: "rgba(236,253,245,0.85)", lineHeight: 1.7 }}>
            {ko ? svc.hebronKo : svc.hebronEn}
          </div>
        </div>

        {/* 수익 모델 */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 10, color: "rgba(236,253,245,0.5)", marginBottom: 6, letterSpacing: "0.5px" }}>
            💰 {ko ? "수익 모델" : "REVENUE MODEL"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.75)", lineHeight: 1.8 }}>
            {ko ? svc.revenueKo : svc.revenueEn}
          </div>
        </div>

        {/* CTA */}
        <a href="mailto:gmc.hc300@gmail.com?subject=HebronGuide Connect 파트너 문의"
          style={{ display: "block", textDecoration: "none" }}>
          <div style={{ background: `linear-gradient(135deg, ${svc.color}, ${svc.color}cc)`, borderRadius: 14, padding: "14px 20px", textAlign: "center", boxShadow: `0 4px 20px ${svc.color}40`, cursor: "pointer" }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>
              {ko ? `🚀 ${svc.titleKo} 관심 등록` : `🚀 Register Interest — ${svc.titleEn}`}
            </div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>
              gmc.hc300@gmail.com
            </div>
          </div>
        </a>

        {/* Hebron Gig — 이웃 서비스 마켓플레이스 */}
        {sub === 5 && (() => {
          const GIG_CATS = [
            {
              emoji: "🏠", label: ko ? "홈 서비스" : "Home Services", color: "#3B82F6",
              services: [
                { icon: "🧹", name: ko ? "헤브론 청소" : "Hebron Clean", price: ko ? "$60-150/회" : "$60-150/visit", desc: ko ? "가정·사무실 청소. 한인·미국인·히스패닉 제공자 연결" : "Home & office cleaning. Korean, American & Hispanic providers" },
                { icon: "🔧", name: ko ? "헤브론 핸디맨" : "Hebron HandyFix", price: ko ? "$40-80/시간" : "$40-80/hr", desc: ko ? "소규모 집수리·설치. 검증된 이웃이 직접 방문" : "Minor repairs & installations by verified neighbors" },
                { icon: "⚡", name: ko ? "헤브론 전기수리" : "Hebron ElecFix", price: ko ? "$60-120/시간" : "$60-120/hr", desc: ko ? "콘센트·조명·스위치 교체. 면허 소지자 매칭" : "Outlet, lighting & switch replacement. Licensed professionals" },
                { icon: "🚿", name: ko ? "헤브론 배관수리" : "Hebron PlumbFix", price: ko ? "$60-120/시간" : "$60-120/hr", desc: ko ? "누수·막힘·수도꼭지 교체" : "Leaks, clogs & faucet replacement" },
                { icon: "🎨", name: ko ? "헤브론 페인팅" : "Hebron PaintCrew", price: ko ? "$200-800/방" : "$200-800/room", desc: ko ? "내부·외부 페인팅. 다국어 팀 가능" : "Interior & exterior painting. Multilingual team available" },
                { icon: "🌿", name: ko ? "헤브론 잔디조경" : "Hebron YardCrew", price: ko ? "$50-200/회" : "$50-200/visit", desc: ko ? "잔디깎기·조경·낙엽청소" : "Lawn mowing, landscaping & leaf cleanup" },
                { icon: "📦", name: ko ? "헤브론 이사도우미" : "Hebron MoveHelp", price: ko ? "$25-40/시간/인" : "$25-40/hr/person", desc: ko ? "짐 나르기·가구 조립. 시간제 일당 도우미" : "Moving assistance & furniture assembly. Hourly day labor" },
                { icon: "❄️", name: ko ? "헤브론 눈치우기" : "Hebron SnowClear", price: ko ? "$40-120/회" : "$40-120/visit", desc: ko ? "진입로·보도·주차장 제설 서비스" : "Driveway, sidewalk & parking lot snow removal" },
                { icon: "🏡", name: ko ? "헤브론 정리정돈" : "Hebron StorageHelp", price: ko ? "$30-60/시간" : "$30-60/hr", desc: ko ? "집 정리·수납 최적화. 단기 이민자 짐정리 도움" : "Home organization & storage optimization" },
              ],
            },
            {
              emoji: "👶", label: ko ? "케어 서비스" : "Care Services", color: "#EC4899",
              services: [
                { icon: "👶", name: ko ? "헤브론 베이비시팅" : "Hebron BabyCare", price: ko ? "$18-25/시간" : "$18-25/hr", desc: ko ? "검증된 이웃이 아이를 돌봅니다. 한·영·스 가능" : "Verified neighbors care for your children. KO/EN/ES" },
                { icon: "🐕", name: ko ? "헤브론 강아지 보기" : "Hebron PetSit", price: ko ? "$20-40/일" : "$20-40/day", desc: ko ? "반려동물 위탁·방문 돌봄. 강아지·고양이" : "Pet boarding & drop-in visits. Dogs & cats" },
                { icon: "🦮", name: ko ? "헤브론 강아지 산책" : "Hebron DogWalk", price: ko ? "$15-25/회 (30분)" : "$15-25/visit (30min)", desc: ko ? "동네 이웃이 매일 산책 서비스. 앱 GPS 추적" : "Neighborhood dog walking with GPS tracking" },
                { icon: "👴", name: ko ? "헤브론 노인돌봄" : "Hebron ElderCare", price: ko ? "$20-30/시간" : "$20-30/hr", desc: ko ? "병원 동행·말벗·생활 도움. 한국어 가능 케어기버" : "Hospital visits, companionship & daily assistance. Korean-speaking caregivers" },
              ],
            },
            {
              emoji: "💻", label: ko ? "테크 서비스" : "Tech Services", color: "#8B5CF6",
              services: [
                { icon: "💻", name: ko ? "헤브론 컴퓨터수리" : "Hebron TechFix", price: ko ? "$60-120/시간" : "$60-120/hr", desc: ko ? "PC·맥·노트북 수리·바이러스 제거·속도개선" : "PC/Mac repair, virus removal & performance optimization" },
                { icon: "📱", name: ko ? "헤브론 폰수리" : "Hebron PhoneFix", price: ko ? "$40-80/건" : "$40-80/job", desc: ko ? "아이폰·안드로이드 액정·배터리 교체" : "iPhone & Android screen/battery replacement" },
                { icon: "🌐", name: ko ? "헤브론 웹사이트" : "Hebron WebBuild", price: ko ? "$200-800/프로젝트" : "$200-800/project", desc: ko ? "소규모 식당·가게 웹사이트 제작. 3개 언어 대응" : "Small business website creation in 3 languages" },
                { icon: "🏠", name: ko ? "헤브론 스마트홈" : "Hebron SmartHome", price: ko ? "$50-150/시간" : "$50-150/hr", desc: ko ? "스마트 조명·보안카메라·AI 스피커 설치" : "Smart lights, security cameras & AI speaker setup" },
              ],
            },
            {
              emoji: "🍽️", label: ko ? "헤브론 케이터링" : "Hebron Catering", color: "#EF4444",
              services: [
                { icon: "🍽️", name: ko ? "헤브론 케이터링" : "Hebron Catering", price: ko ? "$15-30/인" : "$15-30/person", desc: ko ? "교회행사·돌잔치·생일·기업 행사. 한식·미식·히스패닉 요리 제공" : "Church events, birthdays & corporate. Korean, American & Hispanic menus" },
                { icon: "🥩", name: ko ? "헤브론 바비큐" : "Hebron BBQ Catering", price: ko ? "$20-40/인" : "$20-40/person", desc: ko ? "야외 바비큐 파티 케이터링. 그릴·숯·도구 일체 지참. 한국식 BBQ 특화" : "Outdoor BBQ party catering. Full grill setup. Korean BBQ specialty" },
                { icon: "🥗", name: ko ? "헤브론 뷔페" : "Hebron Buffet Setup", price: ko ? "$25-50/인" : "$25-50/person", desc: ko ? "소규모 뷔페 세팅·서빙·정리까지. 20-100인 행사 가능" : "Full buffet setup, serving & cleanup. 20-100 person events" },
                { icon: "🎂", name: ko ? "헤브론 디저트테이블" : "Hebron Dessert Table", price: ko ? "$150-400/행사" : "$150-400/event", desc: ko ? "웨딩·파티·돌잔치 디저트 테이블 세팅. 한국식 떡·과자 포함 가능" : "Wedding, party & dol dessert table setup. Korean rice cakes & sweets available" },
                { icon: "🍱", name: ko ? "헤브론 홈쿡" : "Hebron HomeCook", price: ko ? "$50-150/회" : "$50-150/visit", desc: ko ? "가정식 요리사 방문. 한식·미식·히스패닉 요리" : "Personal chef home visits. Korean, American & Hispanic cuisine" },
                { icon: "🍞", name: ko ? "헤브론 베이킹" : "Hebron BakeShare", price: ko ? "$20-80/주문" : "$20-80/order", desc: ko ? "집에서 만든 빵·케이크·쿠키 주문 제작" : "Homemade bread, cakes & cookies. Custom orders" },
                { icon: "🥡", name: ko ? "헤브론 밀프렙" : "Hebron MealPrep", price: ko ? "$80-200/주" : "$80-200/week", desc: ko ? "주간 식단 준비 서비스. 한식·다이어트식 맞춤" : "Weekly meal prep service. Korean diet & custom nutrition" },
                { icon: "🍣", name: ko ? "헤브론 한식박스" : "Hebron KfoodBox", price: ko ? "$30-60/박스" : "$30-60/box", desc: ko ? "한국 가정식 도시락 박스. 미국인·히스패닉 이웃도 주문 가능" : "Korean homestyle lunchbox. Open to American & Hispanic neighbors too" },
              ],
            },
            {
              emoji: "🌸", label: ko ? "헤브론 꽃꽂이·플로럴" : "Hebron Floral", color: "#A855F7",
              services: [
                { icon: "💐", name: ko ? "헤브론 꽃꽂이" : "Hebron Floral Design", price: ko ? "$50-200/작품" : "$50-200/arrangement", desc: ko ? "가정·행사·선물용 꽃꽂이. 한국식·서양식·이케바나 스타일" : "Home, event & gift floral arrangements. Korean, Western & Ikebana styles" },
                { icon: "👰", name: ko ? "헤브론 웨딩플라워" : "Hebron Wedding Flowers", price: ko ? "$300-1,500/행사" : "$300-1,500/event", desc: ko ? "웨딩 부케·센터피스·아치·테이블 꽃장식. 사전 상담 포함" : "Wedding bouquets, centerpieces, arches & table florals. Consultation included" },
                { icon: "⛪", name: ko ? "헤브론 교회꽃장식" : "Hebron Church Flowers", price: ko ? "$80-300/주" : "$80-300/week", desc: ko ? "교회 주간 꽃 장식·특별 행사 플로럴 데코. 허브교회 파트너 할인" : "Weekly church flowers & special event floral decor. Hub church partner discount" },
                { icon: "🎁", name: ko ? "헤브론 꽃다발 배달" : "Hebron Flower Delivery", price: ko ? "$40-120/배달" : "$40-120/delivery", desc: ko ? "당일 꽃다발 제작·배달. 한국어·영어·스페인어 메시지 카드 포함" : "Same-day bouquet arrangement & delivery. Message cards in KO/EN/ES" },
                { icon: "🌱", name: ko ? "헤브론 화분케어" : "Hebron Plant Care", price: ko ? "$15-30/회" : "$15-30/visit", desc: ko ? "실내 화분 관리·물주기·분갈이. 여행 중 반려식물 케어" : "Indoor plant maintenance, watering & repotting. Plant sitting while traveling" },
                { icon: "🌿", name: ko ? "헤브론 화환·조화" : "Hebron Wreath & Silk", price: ko ? "$60-200/작품" : "$60-200/piece", desc: ko ? "현관 화환·리스·계절 장식. 조화로 오래 유지. 주문 제작" : "Door wreaths, seasonal décor & silk flower arrangements. Custom orders" },
              ],
            },
            {
              emoji: "📚", label: ko ? "교육 서비스" : "Education Services", color: "#10B981",
              services: [
                { icon: "📐", name: ko ? "헤브론 학과튜터" : "Hebron TutorAce", price: ko ? "$30-60/시간" : "$30-60/hr", desc: ko ? "수학·과학·영어·SAT·AP 한인 검증 튜터" : "Math, science, English, SAT & AP verified tutors" },
                { icon: "🎵", name: ko ? "헤브론 음악레슨" : "Hebron MusicLearn", price: ko ? "$30-60/시간" : "$30-60/hr", desc: ko ? "피아노·기타·바이올린·성악 1:1 레슨" : "Piano, guitar, violin & voice 1-on-1 lessons" },
                { icon: "🗣️", name: ko ? "헤브론 언어코칭" : "Hebron LangBridge", price: ko ? "$25-50/시간" : "$25-50/hr", desc: ko ? "영어·한국어·스페인어 회화 코칭. 이민자 특화" : "English, Korean & Spanish conversation coaching. Immigrant-focused" },
                { icon: "🚗", name: ko ? "헤브론 운전코치" : "Hebron DriveCoach", price: ko ? "$30-50/시간" : "$30-50/hr", desc: ko ? "운전면허 취득 전 연습. 한국어·스페인어 코치 가능" : "Pre-license driving practice. Korean/Spanish coaches available" },
              ],
            },
            {
              emoji: "🎨", label: ko ? "헤브론 디자인" : "Hebron Design", color: "#06B6D4",
              services: [
                { icon: "🖼️", name: ko ? "헤브론 로고디자인" : "Hebron Logo Design", price: ko ? "$80-300/건" : "$80-300/project", desc: ko ? "식당·가게·교회·단체 로고. 한인 전문 디자이너" : "Restaurant, store, church & org logos. Korean professional designers" },
                { icon: "📱", name: ko ? "헤브론 SNS디자인" : "Hebron Social Design", price: ko ? "$30-80/건" : "$30-80/set", desc: ko ? "인스타·페이스북·카카오 게시물·배너 디자인" : "Instagram, Facebook & KakaoTalk post & banner design" },
                { icon: "🖨️", name: ko ? "헤브론 인쇄물디자인" : "Hebron Print Design", price: ko ? "$50-200/건" : "$50-200/project", desc: ko ? "명함·브로셔·전단지·메뉴판·초대장 디자인" : "Business cards, brochures, flyers, menus & invitations" },
                { icon: "⛪", name: ko ? "헤브론 교회디자인" : "Hebron Church Design", price: ko ? "$30-100/건" : "$30-100/project", desc: ko ? "주보·포스터·설교 PPT·유튜브 썸네일. 교회 특화" : "Church bulletin, posters, sermon PPT & YouTube thumbnails" },
                { icon: "🎬", name: ko ? "헤브론 영상편집" : "Hebron VideoEdit", price: ko ? "$50-200/분" : "$50-200/min", desc: ko ? "유튜브·릴스·틱톡·교회 행사 영상 편집. 자막 3개 언어" : "YouTube, Reels, TikTok & church event video editing. 3-language subtitles" },
                { icon: "🏡", name: ko ? "헤브론 인테리어 상담" : "Hebron Interior Consult", price: ko ? "$60-150/시간" : "$60-150/hr", desc: ko ? "가정·소규모 상업공간 인테리어 컨설팅. 3D 시뮬레이션" : "Home & small business interior consulting. 3D simulation" },
                { icon: "📷", name: ko ? "헤브론 사진편집" : "Hebron PhotoEdit", price: ko ? "$20-60/건" : "$20-60/set", desc: ko ? "포토샵 리터칭·배경제거·증명사진·제품사진 보정" : "Photoshop retouching, background removal & product photo editing" },
                { icon: "🎁", name: ko ? "헤브론 패키지디자인" : "Hebron Package Design", price: ko ? "$100-400/건" : "$100-400/project", desc: ko ? "식품·제품 패키지·라벨 디자인. 3개 언어 적용" : "Food & product packaging & label design. 3-language ready" },
              ],
            },
            {
              emoji: "💈", label: ko ? "뷰티·웰니스" : "Beauty & Wellness", color: "#F472B6",
              services: [
                { icon: "💇", name: ko ? "헤브론 방문헤어" : "Hebron HairHome", price: ko ? "$40-100/회" : "$40-100/visit", desc: ko ? "방문 헤어컷·염색·파마. 한인 미용사 자격 보유" : "Mobile haircut, color & perm. Korean licensed stylists" },
                { icon: "💅", name: ko ? "헤브론 네일" : "Hebron NailPro", price: ko ? "$30-70/회" : "$30-70/visit", desc: ko ? "방문 네일아트·젤·아크릴" : "Mobile nail art, gel & acrylic" },
                { icon: "💪", name: ko ? "헤브론 개인PT" : "Hebron FitCoach", price: ko ? "$40-80/시간" : "$40-80/hr", desc: ko ? "방문 개인 트레이닝. 한인·히스패닉 트레이너" : "Mobile personal training. Korean & Hispanic trainers" },
              ],
            },
            {
              emoji: "🔧", label: ko ? "전문 서비스" : "Professional Services", color: "#6B7280",
              services: [
                { icon: "💬", name: ko ? "헤브론 상담" : "Hebron CounselCare", price: ko ? "$60-120/시간" : "$60-120/hr", desc: ko ? "이민 생활 스트레스·가족 상담. 한국어 상담사" : "Immigration stress & family counseling. Korean-speaking counselors" },
                { icon: "📊", name: ko ? "헤브론 세금도움" : "Hebron TaxHelp", price: ko ? "$80-200/건" : "$80-200/filing", desc: ko ? "개인·소규모 사업 세금 신고 도움. 한인 CPA 연결" : "Personal & small business tax filing. Korean CPA connection" },
                { icon: "🌐", name: ko ? "헤브론 번역통역" : "Hebron TranslateNow", price: ko ? "$30-60/시간" : "$30-60/hr", desc: ko ? "한↔영↔스 번역·통역. 병원·법원·행정 동행 가능" : "KO↔EN↔ES translation. Hospital, court & government accompaniment" },
                { icon: "📸", name: ko ? "헤브론 사진촬영" : "Hebron PhotoShoot", price: ko ? "$100-300/시간" : "$100-300/hr", desc: ko ? "가족사진·이력서 증명사진·소셜미디어 콘텐츠" : "Family photos, headshots & social media content" },
                { icon: "🏃", name: ko ? "헤브론 심부름" : "Hebron ErrandRun", price: ko ? "$20-40/시간" : "$20-40/hr", desc: ko ? "마트 쇼핑·약국·우체국·병원 대행. 다국어 가능" : "Grocery, pharmacy, post office & clinic errands. Multilingual" },
              ],
            },
          ];

          return (
            <div style={{ paddingBottom: 16 }}>
              {/* Hebron Gig 헤더 */}
              <div style={{ background: "linear-gradient(135deg, rgba(251,146,60,0.15), rgba(139,92,246,0.1))", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 20, padding: "18px 18px", marginBottom: 14 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 900, fontSize: 18, color: "#ECFDF5", marginBottom: 4 }}>
                  🛠️ {ko ? "헤브론 기그 (Hebron Gig)" : "Hebron Gig — Neighbor Marketplace"}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, color: "rgba(251,146,60,0.9)", fontWeight: 700, marginBottom: 8 }}>
                  {ko ? "이웃이 이웃을 섬긴다 — 한인·미국인·히스패닉" : "Neighbors serving neighbors — Korean · American · Hispanic"}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.65)", lineHeight: 1.6, marginBottom: 10 }}>
                  {ko
                    ? "재능과 기술로 돈 버세요. 청소·수리·요리·돌봄·튜터... 집에서 할 수 있는 모든 것. HebronGuide가 연결하고, 수익의 85%는 당신 것입니다."
                    : "Earn money with your skills. Cleaning, repairs, cooking, care, tutoring... anything you can do from home. HebronGuide connects — you keep 85%."}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { icon: "🌍", label: ko ? "3개 언어 자동통역" : "3-Language Auto Translation" },
                    { icon: "💰", label: ko ? "수익의 85% 본인 몫" : "85% Revenue to Provider" },
                    { icon: "🤝", label: ko ? "이웃 신뢰 기반" : "Community Trust-Based" },
                  ].map((b, i) => (
                    <span key={i} style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)", borderRadius: 20, padding: "4px 10px", fontFamily: "Manrope,sans-serif", fontSize: 10, fontWeight: 700, color: "#FB923C" }}>
                      {b.icon} {b.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* 서비스 카테고리별 목록 */}
              {GIG_CATS.map((cat, ci) => (
                <div key={ci} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                    <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: cat.color }}>{cat.label}</span>
                    <div style={{ flex: 1, height: 1, background: `${cat.color}30` }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {cat.services.map((svc, si) => (
                      <a key={si}
                        href={`mailto:gmc.hc300@gmail.com?subject=Hebron Gig 제공자 등록 — ${svc.name}`}
                        style={{ textDecoration: "none" }}>
                        <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${cat.color}25`, borderRadius: 12, padding: "10px 11px", cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${cat.color}15`; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                            <span style={{ fontSize: 14 }}>{svc.icon}</span>
                            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 10, color: "#ECFDF5", lineHeight: 1.2 }}>{svc.name}</span>
                          </div>
                          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10, color: cat.color, marginBottom: 3 }}>{svc.price}</div>
                          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "rgba(236,253,245,0.5)", lineHeight: 1.4 }}>{svc.desc}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              {/* 등록 CTA */}
              <div style={{ background: "linear-gradient(135deg, rgba(251,146,60,0.2), rgba(139,92,246,0.15))", border: "1px solid rgba(251,146,60,0.4)", borderRadius: 16, padding: "16px 18px", marginTop: 4 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#ECFDF5", marginBottom: 6 }}>
                  {ko ? "🚀 제공자·클라이언트 모두 환영합니다" : "🚀 Providers & Clients Both Welcome"}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.7)", lineHeight: 1.6, marginBottom: 10 }}>
                  {ko
                    ? "한국어·영어·스페인어 모두 가능합니다. 어떤 서비스든 관심 있으시면 이메일로 문의해 주세요."
                    : "Korean, English & Spanish all supported. Interested in any service? Contact us by email."}
                </div>
                <a href="mailto:gmc.hc300@gmail.com?subject=Hebron Gig 관심 등록"
                  style={{ display: "block", textDecoration: "none", background: "linear-gradient(135deg, #FB923C, #8B5CF6)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>
                    {ko ? "📩 Hebron Gig 등록하기" : "📩 Register for Hebron Gig"}
                  </div>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>gmc.hc300@gmail.com</div>
                </a>
              </div>
            </div>
          );
        })()}

        {/* 전체 서비스 통합 수익 미리보기 */}
        {sub === 0 && (
          <div style={{ marginTop: 16, background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 11, color: accent, marginBottom: 8 }}>
              📈 {ko ? "전체 플랫폼 수익 예측" : "Platform Revenue Projection"}
            </div>
            {[
              { yr: ko ? "1년차" : "Year 1", rev: "$400K-600K",  note: ko ? "라이드·튜터 파일럿" : "Ride & tutor pilot" },
              { yr: ko ? "2년차" : "Year 2", rev: "$1.2M-1.8M", note: ko ? "스테이·커뮤니티 확장" : "Stay & community expansion" },
              { yr: ko ? "3년차" : "Year 3", rev: "$3M-5M",     note: ko ? "매칭·네트워크 전국화" : "Matching & network national" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(201,162,39,0.1)" : "none" }}>
                <div>
                  <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>{r.yr}</span>
                  <span style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(236,253,245,0.5)", marginLeft: 8 }}>{r.note}</span>
                </div>
                <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: accent }}>{r.rev}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ── NAVIGATION & LAYOUT ───────────────────
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   BOTTOM NAVIGATION (6탭 — v4)
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   NAV ITEMS (3개로 축소)
───────────────────────────────────────── */
// 순서: 홈(기준점) → 검색(가장 자주) → 통역(긴급할 때) → 공유(가끔)
// 하단 네비 5탭: 홈·정착·맛집·도움·더보기
// 서비스(라이드·스테이·튜터·커뮤니티·매칭)는 각 탭에 자연스럽게 분산
// 더보기 → 16개 Quick Menu 전체 접근
const NAV_ITEMS = [
  { id: "home",      icon: Home,          labelKo: "홈",   labelEn: "Home",   tab: 0 },
  { id: "settle",    icon: MapPin,        labelKo: "정착",  labelEn: "Settle", tab: 1 },
  { id: "food",      icon: Utensils,      labelKo: "맛집",  labelEn: "Food",   tab: 3 },
  { id: "help",      icon: LifeBuoy,      labelKo: "도움",  labelEn: "Help",   tab: 5 },
  { id: "more",      icon: Grid,          labelKo: "더보기", labelEn: "More",   tab: -1 },
];

/* ─────────────────────────────────────────
   DESKTOP SIDEBAR
───────────────────────────────────────── */
function DesktopSidebar({ activeTab, onNavigate }: { activeTab: number; onNavigate: (tab: number) => void }) {
  const { lang } = useI18n();
  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 lg:border-r"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#1a2535", padding: "80px 16px 24px", zIndex: 30 }}>
      {/* 홈 버튼 — 항상 최상단 */}
      <button onClick={() => onNavigate(0)} style={{
        width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
        background: activeTab === 0 ? "rgba(242,153,74,0.18)" : "rgba(242,153,74,0.06)",
        color: activeTab === 0 ? "#F2994A" : "rgba(242,153,74,0.7)",
        fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14,
        marginBottom: 8, transition: "all 0.2s ease",
        borderLeft: activeTab === 0 ? "3px solid #F2994A" : "3px solid transparent",
      }}>
        <span style={{ fontSize: 18 }}>🏠</span>
        {lang === "ko" ? "홈" : "Home"}
      </button>

      <div style={{ height: 0.5, background: "rgba(255,255,255,0.08)", marginBottom: 8 }} />

      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 16, color: "#C9A227", marginBottom: 16, letterSpacing: "1px", paddingLeft: 4 }}>
        HEBRONGUIDE
      </div>
      {QUICK_MENU.map((item, i) => (
        <button key={i} onClick={() => onNavigate(item.tab)} style={{
          width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer",
          background: activeTab === item.tab ? "rgba(242,153,74,0.12)" : "transparent",
          color: activeTab === item.tab ? "#F2994A" : "rgba(236,253,245,0.55)",
          fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 600, fontSize: 13,
          marginBottom: 2, transition: "all 0.2s ease",
          borderLeft: activeTab === item.tab ? "3px solid #F2994A" : "3px solid transparent",
        }}>
          <span style={{ fontSize: 18 }}>{item.emoji}</span>
          {lang === "ko" ? item.labelKo : item.labelEn}
        </button>
      ))}
    </aside>
  );
}

/* ─────────────────────────────────────────
   BOTTOM NAV (3개 버튼)
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   상황별 영어 표현집
───────────────────────────────────────── */
const PHRASE_BOOK = [
  {
    emoji: "🍽️", situKo: "식당에서 주문할 때", situEn: "Ordering at a restaurant",
    phrases: [
      { ko: "이거 주세요",                       en: "I'll have this one, please.",           pron: "아일 해브 디스 원, 플리즈" },
      { ko: "맵지 않게 해주세요",                 en: "Can you make it not spicy, please?",    pron: "캔 유 메이킷 낫 스파이시, 플리즈?" },
      { ko: "계산서 주세요",                      en: "Can I get the check, please?",          pron: "캔 아이 겟 더 첵, 플리즈?" },
      { ko: "포장해 주세요",                      en: "Can I get this to go?",                 pron: "캔 아이 겟 디스 투 고?" },
      { ko: "이거 알레르기가 있어요. 빼주세요",   en: "I'm allergic to this. Can you leave it out?", pron: "아임 얼러직 투 디스. 캔 유 리빗 아웃?" },
      { ko: "물 더 주세요",                       en: "Could I have more water, please?",      pron: "쿠다이 해브 모어 워터, 플리즈?" },
    ],
  },
  {
    emoji: "🏥", situKo: "병원·응급실에서", situEn: "At the hospital / clinic",
    phrases: [
      { ko: "여기가 아파요",                      en: "It hurts here.",                        pron: "잇 허츠 히어" },
      { ko: "숨쉬기가 힘들어요",                  en: "I'm having trouble breathing.",         pron: "아임 해빙 트러블 브리딩" },
      { ko: "한국어 통역사 불러주세요",            en: "Can you get a Korean interpreter?",     pron: "캔 유 겟 어 코리안 인터프리터?" },
      { ko: "이 약 처방받을 수 있나요?",           en: "Can I get a prescription for this?",   pron: "캔 아이 겟 어 프리스크립션 포 디스?" },
      { ko: "보험이 있어요",                      en: "I have insurance.",                     pron: "아이 해브 인슈어런스" },
      { ko: "언제부터 이 증상이 시작됐어요",       en: "This started about [3 days] ago.",      pron: "디스 스타티드 어바웃 쓰리 데이즈 어고" },
    ],
  },
  {
    emoji: "🗺️", situKo: "길 물어볼 때", situEn: "Asking for directions",
    phrases: [
      { ko: "여기 어떻게 가요?",                  en: "How do I get to [place]?",              pron: "하우 두 아이 겟 투 [플레이스]?" },
      { ko: "걸어서 얼마나 걸려요?",              en: "How far is it on foot?",                pron: "하우 파 이즈 잇 온 풋?" },
      { ko: "버스 어디서 타요?",                  en: "Where do I catch the bus?",             pron: "웨어 두 아이 캐치 더 버스?" },
      { ko: "길을 잃었어요",                      en: "I'm lost.",                             pron: "아임 로스트" },
      { ko: "지도에서 여기가 어디예요?",           en: "Can you show me where we are on the map?", pron: "캔 유 쇼우 미 웨어 위 아 온 더 맵?" },
    ],
  },
  {
    emoji: "🏠", situKo: "집 구할 때 (집주인·부동산)", situEn: "Finding housing",
    phrases: [
      { ko: "방 보러 왔어요",                     en: "I'm here to see the apartment.",        pron: "아임 히어 투 씨 디 아파트먼트" },
      { ko: "한 달 렌트가 얼마예요?",              en: "How much is the monthly rent?",         pron: "하우 머치 이즈 더 먼쓸리 렌트?" },
      { ko: "보증금은 얼마예요?",                 en: "How much is the security deposit?",     pron: "하우 머치 이즈 더 시큐리티 디파짓?" },
      { ko: "언제부터 입주 가능해요?",             en: "When is it available to move in?",      pron: "웬 이즈 잇 어베일러블 투 무브 인?" },
      { ko: "신용 이력이 없어요",                 en: "I don't have a credit history yet.",    pron: "아이 돈 해브 어 크레딧 히스토리 옛" },
    ],
  },
  {
    emoji: "🛒", situKo: "마트·쇼핑할 때", situEn: "Shopping / grocery store",
    phrases: [
      { ko: "이거 어디 있어요?",                  en: "Where can I find [item]?",              pron: "웨어 캔 아이 파인드 [아이템]?" },
      { ko: "환불하고 싶어요",                    en: "I'd like to return this.",              pron: "아이드 라이크 투 리턴 디스" },
      { ko: "영수증 주세요",                      en: "Can I have a receipt, please?",         pron: "캔 아이 해브 어 리씻, 플리즈?" },
      { ko: "이거 세일 중인가요?",                en: "Is this on sale?",                      pron: "이즈 디스 온 세일?" },
      { ko: "봉투 주세요",                        en: "Can I get a bag, please?",              pron: "캔 아이 겟 어 백, 플리즈?" },
    ],
  },
  {
    emoji: "🚗", situKo: "경찰 단속·교통위반", situEn: "Police traffic stop",
    phrases: [
      { ko: "면허증 여기 있습니다",               en: "Here is my driver's license.",          pron: "히어 이즈 마이 드라이버즈 라이선스" },
      { ko: "한국에서 왔어요",                    en: "I'm from Korea.",                       pron: "아임 프롬 코리아" },
      { ko: "영어가 서툴러요",                    en: "My English is limited.",                pron: "마이 잉글리쉬 이즈 리미티드" },
      { ko: "제가 뭘 잘못했나요?",               en: "What did I do wrong?",                  pron: "왓 디드 아이 두 롱?" },
      { ko: "통역사를 불러주세요",                en: "Please call an interpreter.",           pron: "플리즈 콜 언 인터프리터" },
    ],
  },
  {
    emoji: "💼", situKo: "직장 면접·직장에서", situEn: "Job interview / workplace",
    phrases: [
      { ko: "저는 한국에서 [직종]으로 일했어요",  en: "I worked as a [job title] in Korea.",   pron: "아이 워크트 애즈 어 [잡 타이틀] 인 코리아" },
      { ko: "영어가 완벽하지 않아요",             en: "My English isn't perfect yet.",         pron: "마이 잉글리쉬 이즌트 퍼펙트 옛" },
      { ko: "다시 한 번 말씀해 주시겠어요?",      en: "Could you please say that again?",      pron: "쿠쥬 플리즈 세이 댓 어겐?" },
      { ko: "좀 더 천천히 말씀해 주세요",         en: "Could you speak a little slower, please?", pron: "쿠쥬 스피크 어 리틀 슬로워, 플리즈?" },
      { ko: "언제 결과를 알 수 있나요?",          en: "When can I expect to hear back?",       pron: "웬 캔 아이 익스펙트 투 히어 백?" },
    ],
  },
  {
    emoji: "🏫", situKo: "학교·자녀 교육", situEn: "School / children's education",
    phrases: [
      { ko: "아이 등록하러 왔어요",               en: "I'm here to enroll my child.",          pron: "아임 히어 투 인롤 마이 차일드" },
      { ko: "ESL 수업이 있나요?",                 en: "Is there an ESL class available?",      pron: "이즈 데어 언 이에스엘 클래스 어베일러블?" },
      { ko: "방과 후 프로그램이 있나요?",         en: "Are there after-school programs?",      pron: "아 데어 애프터스쿨 프로그램스?" },
      { ko: "선생님과 면담하고 싶어요",           en: "I'd like to schedule a meeting with the teacher.", pron: "아이드 라이크 투 스케줄 어 미팅 윗 더 티처" },
      { ko: "한국어 통역사가 있나요?",            en: "Do you have a Korean interpreter?",     pron: "두 유 해브 어 코리안 인터프리터?" },
    ],
  },
];

function PhraseBook({ lang, speakFn }: { lang: string; speakFn: (text: string, lang: string) => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div style={{ padding: "0 16px 20px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingTop: 4 }}>
        <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
          📚 {lang === "ko" ? "상황별 영어 표현집" : "Situation Phrases"}
        </div>
        <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>

      {/* 상황 카드 목록 */}
      {PHRASE_BOOK.map((situ, si) => (
        <div key={si} style={{ marginBottom: 8, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* 상황 헤더 (토글) */}
          <button onClick={() => setOpenIdx(openIdx === si ? null : si)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "none", background: openIdx === si ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{situ.emoji}</span>
              <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 13, color: "#F8FAFC" }}>
                {lang === "ko" ? situ.situKo : situ.situEn}
              </span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{openIdx === si ? "▲" : "▼"}</span>
          </button>

          {/* 문장 목록 */}
          {openIdx === si && (
            <div style={{ background: "rgba(0,0,0,0.2)" }}>
              {situ.phrases.map((p, pi) => (
                <div key={pi} style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>{p.ko}</div>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 14, color: "#F8FAFC", lineHeight: 1.4 }}>{p.en}</div>
                    <div style={{ fontSize: 10, color: "#C9A227", marginTop: 2 }}>{p.pron}</div>
                  </div>
                  <button onClick={() => speakFn(p.en, "en-US")}
                    style={{ border: "none", background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "5px 10px", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", flexShrink: 0, marginTop: 2 }}>
                    🔊
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   음성 검색 탭 — 한국어로 말하면 찾아줌
───────────────────────────────────────── */
const VS_APP_ROUTES = [
  { kw:["식당","맛집","카페","음식","bbq","갈비","치킨","밥","커피"], tab:3, ko:"맛집", emoji:"🍽️" },
  { kw:["정착","ssn","면허","운전","은행","계좌","비자","이민"],       tab:1, ko:"정착", emoji:"🛬" },
  { kw:["교회","예배","목장","성경","신앙","가정교회"],                tab:2, ko:"교회", emoji:"⛪" },
  { kw:["병원","의사","의료","약","치과","아파","보험","응급"],        tab:5, ko:"도움·의료", emoji:"🆘" },
  { kw:["취업","일자리","채용","직장","알바","이력서","면접"],         tab:6, ko:"취업", emoji:"💼" },
  { kw:["학교","교육","학원","대학","유학","학군"],                   tab:7, ko:"교육", emoji:"🎓" },
  { kw:["생활비","렌트","월세","물가","환율","기름","코스트코","마트"], tab:8, ko:"생활비·쇼핑", emoji:"💰" },
  { kw:["사람","연결","라이드","스테이","튜터","매칭","결혼","커뮤니티","네트워크","목사","선교사","ride","stay","tutor","match","connect","network","pastor","missionary"], tab:9, ko:"사람연결·헤브론커넥트", emoji:"🤝" },
  { kw:["관광","여행","명소","스페이스니들","레이니어","폭포","페리"],  tab:4, ko:"관광", emoji:"🗺️" },
];
const VS_CITY_ROUTES = [
  { kw:["달라스","texas","텍사스"],    url:"/dallas/",   name:"HebronGuide Dallas",     emoji:"🤠" },
  { kw:["샌프란","sf","bay area"],    url:"/sf/",       name:"HebronGuide SF",          emoji:"🌉" },
  { kw:["뉴욕","new york","ny"],      url:"/newyork/",  name:"HebronGuide New York",    emoji:"🗽" },
  { kw:["내쉬빌","nashville"],        url:"/nashville/",name:"HebronGuide Nashville",   emoji:"🎵" },
  { kw:["보스턴","boston"],           url:"/boston/",   name:"HebronGuide Boston",      emoji:"🦞" },
  { kw:["LA","로스앤젤레스","엘에이"], url:"/la/",       name:"HebronGuide LA",          emoji:"🎬" },
];
// 가격비교 키워드
const PRICE_COMPARE: Record<string, { items: {store:string;price:string;note:string}[] }> = {
  "쌀":        { items:[{store:"H-Mart 20lb",price:"~$28",note:""},{store:"Costco 50lb",price:"~$45",note:"↓ lb당 40% 저렴"},{store:"99 Ranch 25lb",price:"~$22",note:"↓ lb당 25% 저렴"}] },
  "우유":      { items:[{store:"H-Mart 1gal",price:"~$5.50",note:""},{store:"Costco 2gal",price:"~$7.99",note:"↓ 30% 저렴"},{store:"WinCo 1gal",price:"~$3.89",note:"↓ 30% 저렴"}] },
  "계란":      { items:[{store:"H-Mart 12ea",price:"~$4.99",note:""},{store:"Costco 24ea",price:"~$7.49",note:"↓ 25% 저렴"},{store:"WinCo 12ea",price:"~$3.29",note:"↓ 35% 저렴"}] },
  "기름값":    { items:[{store:"일반 주유소",price:"~$4.20/gal",note:""},{store:"Costco Gas",price:"~$3.90/gal",note:"↓ 30¢ 저렴"},{store:"GasBuddy 앱",price:"근처 최저가",note:"실시간 비교"}] },
  "두부":      { items:[{store:"H-Mart",price:"~$2.49",note:""},{store:"99 Ranch",price:"~$1.79",note:"↓ 28% 저렴"},{store:"WinCo",price:"~$1.59",note:"↓ 36% 저렴"}] },
};

function VoiceSearchTab({ lang, onNavigate, onClose }: { lang:string; onNavigate:(tab:number)=>void; onClose:()=>void }) {
  const [query,setQuery]           = useState("");
  const [isListening,setIsListening] = useState(false);
  const [result,setResult]         = useState<null|{type:string;[k:string]:any}>(null);
  const [textMode,setTextMode]     = useState(false);
  const [textInput,setTextInput]   = useState("");
  const recognitionRef             = useRef<any>(null);

  const detectIntent = (text:string) => {
    const lo = text.toLowerCase().replace(/\s+/g,"");
    // 가격비교
    const priceKey = Object.keys(PRICE_COMPARE).find(k => lo.includes(k));
    if (priceKey && (lo.includes("비교") || lo.includes("얼마") || lo.includes("가격") || lo.includes("싸")))
      return { type:"price", key:priceKey, ...PRICE_COMPARE[priceKey] };
    // 도시 라우팅
    const city = VS_CITY_ROUTES.find(r => r.kw.some(k => lo.includes(k)));
    if (city) return { type:"city", ...city };
    // 앱 내 탭
    const tab = VS_APP_ROUTES.find(r => r.kw.some(k => lo.includes(k)));
    if (tab) return { type:"tab", ...tab };
    return { type:"search", query:text };
  };

  const process = (text:string) => { setQuery(text); setResult(detectIntent(text)); };

  const listen = () => {
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SR){alert(lang==="ko"?"Chrome 브라우저에서 사용해주세요":"Please use Chrome");return;}
    setQuery("");setResult(null);setIsListening(true);
    const rec=new SR(); rec.lang="ko-KR"; rec.interimResults=false; recognitionRef.current=rec;
    rec.onresult=(e:any)=>{setIsListening(false);process(e.results[0][0].transcript);};
    rec.onerror=()=>setIsListening(false);
    rec.onend=()=>setIsListening(false);
    rec.start();
  };

  const q = query||textInput;
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(q+" Seattle WA")}`;
  const aiUrl   = `https://www.perplexity.ai/search?q=${encodeURIComponent(q+" 시애틀")}`;

  return (
    <div style={{padding:"0 16px 16px"}}>
      <div style={{textAlign:"center",marginBottom:14,fontSize:11,color:"rgba(255,255,255,0.4)",lineHeight:1.7}}>
        {lang==="ko"?"한국어로 말하거나 입력하세요\n앱에서 찾거나 지도·AI로 연결합니다":"Speak or type in Korean — we'll route to the right place"}
      </div>

      {/* 마이크 */}
      <button onClick={isListening?()=>{recognitionRef.current?.stop();setIsListening(false);}:listen}
        style={{width:"100%",border:"none",borderRadius:18,cursor:"pointer",padding:"18px 16px",marginBottom:8,
          background:isListening?"linear-gradient(135deg,#7C3AED,#A78BFA)":"linear-gradient(135deg,#1E3A5F,#1D4ED8)",
          boxShadow:isListening?"0 0 24px rgba(124,58,237,0.5)":"none",transition:"all 0.2s"}}>
        <div style={{fontSize:34,marginBottom:4}}>{isListening?"🔴":"🎤"}</div>
        <div style={{fontFamily:"Manrope,sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>
          {isListening?(lang==="ko"?"듣고 있어요... (탭해서 중지)":"Listening... tap to stop"):(lang==="ko"?"한국어로 말해서 검색":"Speak Korean to search")}
        </div>
        {!isListening&&<div style={{fontSize:10,color:"rgba(255,255,255,0.45)",marginTop:3}}>
          {lang==="ko"?"\"맛집 찾아줘\" \"SSN 어디서\" \"쌀 가격 비교\"":"\"find restaurant\" \"SSN office\" \"rice price compare\""}
        </div>}
      </button>

      {/* 텍스트 입력 */}
      <button onClick={()=>setTextMode(p=>!p)}
        style={{width:"100%",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,background:"rgba(255,255,255,0.04)",
          padding:"8px",cursor:"pointer",color:"rgba(255,255,255,0.45)",fontSize:11,marginBottom:8}}>
        ⌨️ {lang==="ko"?"직접 입력":"Type instead"}
      </button>
      {textMode&&(
        <div style={{display:"flex",gap:7,marginBottom:10}}>
          <input value={textInput} onChange={e=>setTextInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&textInput.trim())process(textInput.trim());}}
            placeholder={lang==="ko"?"예: 린우드 한식당 찾아줘, 쌀 가격 비교":"e.g. find Korean restaurant Lynnwood"}
            style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",
              borderRadius:10,padding:"9px 13px",color:"#F8FAFC",fontSize:12,outline:"none"}}/>
          <button onClick={()=>{if(textInput.trim())process(textInput.trim());}}
            style={{border:"none",borderRadius:10,background:"#1D4ED8",color:"#fff",padding:"0 14px",cursor:"pointer"}}>→</button>
        </div>
      )}

      {/* 인식 결과 표시 */}
      {q&&<div style={{marginBottom:10,background:"rgba(255,255,255,0.05)",borderRadius:10,padding:"8px 12px",
        fontFamily:"Manrope,sans-serif",fontWeight:700,fontSize:13,color:"rgba(255,255,255,0.8)"}}>
        🔎 "{q}"
      </div>}

      {/* 라우팅 결과 */}
      {result&&(
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {/* 가격 비교 */}
          {result.type==="price"&&(
            <div style={{background:"rgba(201,162,39,0.1)",border:"1px solid rgba(201,162,39,0.3)",borderRadius:14,padding:"12px 14px"}}>
              <div style={{fontFamily:"Manrope,sans-serif",fontWeight:800,fontSize:13,color:"#C9A227",marginBottom:8}}>
                💰 {q} {lang==="ko"?"가격 비교":"Price Comparison"}
              </div>
              {result.items.map((item:any,i:number)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"7px 0",borderBottom:i<result.items.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
                  <div style={{fontFamily:"Manrope,sans-serif",fontSize:12,color:"#ECFDF5"}}>{item.store}</div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"Manrope,sans-serif",fontWeight:700,fontSize:13,color:i>0?"#6EE7B7":"#F87171"}}>{item.price}</div>
                    {item.note&&<div style={{fontSize:9,color:"#6EE7B7"}}>{item.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* 앱 내 탭 이동 */}
          {result.type==="tab"&&(
            <button onClick={()=>{onNavigate(result.tab);onClose();}}
              style={{width:"100%",border:"none",borderRadius:14,cursor:"pointer",padding:"13px 16px",
                background:"linear-gradient(135deg,#059669,#10B981)",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>{result.emoji}</span>
              <div style={{textAlign:"left",flex:1}}>
                <div style={{fontFamily:"Manrope,sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>
                  {lang==="ko"?`HebronGuide ${result.ko} 탭으로 이동`:`Go to ${result.ko} section`}
                </div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:2}}>{lang==="ko"?"앱 내에서 바로 찾기":"Find directly in app"}</div>
              </div>
              <span style={{color:"#fff",fontSize:16}}>→</span>
            </button>
          )}
          {/* 도시 이동 */}
          {result.type==="city"&&(
            <a href={`https://hebronguide.com${result.url}`} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",
                background:"linear-gradient(135deg,#7C3AED,#A78BFA)",borderRadius:14,padding:"13px 16px"}}>
              <span style={{fontSize:22}}>{result.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"Manrope,sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>{result.name}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:2}}>{lang==="ko"?"해당 도시 가이드 열기":"Open city guide"}</div>
              </div>
              <span style={{color:"#fff",fontSize:16}}>→</span>
            </a>
          )}
          {/* 외부 검색 (항상 표시) */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,textDecoration:"none",
                background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"10px"}}>
              <span style={{fontSize:20}}>🗺️</span>
              <span style={{fontFamily:"Manrope,sans-serif",fontWeight:700,fontSize:11,color:"#ECFDF5"}}>Google Maps</span>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>지도에서 찾기</span>
            </a>
            <a href={aiUrl} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,textDecoration:"none",
                background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"10px"}}>
              <span style={{fontSize:20}}>🤖</span>
              <span style={{fontFamily:"Manrope,sans-serif",fontWeight:700,fontSize:11,color:"#ECFDF5"}}>Perplexity AI</span>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>AI가 답해요</span>
            </a>
          </div>
        </div>
      )}

      {/* 예시 문장 */}
      {!q&&!isListening&&(
        <div style={{marginTop:10}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",marginBottom:6,textAlign:"center"}}>
            {lang==="ko"?"💡 이렇게 말해보세요":"💡 Try these"}
          </div>
          {["린우드 한식당 찾아줘","SSN 어디서 신청해?","쌀 가격 비교","달라스 한인 교회","근처 타코 맛있는 곳"].map((ex,i)=>(
            <button key={i} onClick={()=>process(ex)}
              style={{display:"block",width:"100%",textAlign:"left",border:"none",
                background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 11px",marginBottom:4,
                color:"rgba(255,255,255,0.5)",fontSize:10,cursor:"pointer"}}>
              "{ex}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   현장 통역 모달 — 3탭 (검색·통역·표현집)
───────────────────────────────────────── */
function TranslateModal({ onClose, lang, onNavigate }: { onClose:()=>void; lang:string; onNavigate?:(tab:number)=>void }) {
  const [modalTab, setModalTab] = useState<"search"|"interpret"|"phrases">("search");
  /* ── 지원 언어 목록 (한국어는 고정, 상대방 언어 선택 가능) ── */
  const FOREIGN_LANGS = [
    { code: "auto", label: "Auto-detect", labelKo: "자동 감지", flag: "🌐", speechLang: "", color: "#C9A227", bg: "linear-gradient(135deg,#3B2700,#92610A)", bgActive: "linear-gradient(135deg,#92610A,#C9A227)", glow: "rgba(201,162,39,0.6)" },
    { code: "en",   label: "English",     labelKo: "영어",     flag: "🇺🇸", speechLang: "en-US", color: "#1D4ED8", bg: "linear-gradient(135deg,#1E3A5F,#1D4ED8)", bgActive: "linear-gradient(135deg,#1D4ED8,#3B82F6)", glow: "rgba(59,130,246,0.55)"  },
    { code: "es",   label: "Español",     labelKo: "스페인어",  flag: "🇪🇸", speechLang: "es-ES", color: "#B91C1C", bg: "linear-gradient(135deg,#4C0519,#B91C1C)", bgActive: "linear-gradient(135deg,#B91C1C,#EF4444)", glow: "rgba(239,68,68,0.55)"    },
    { code: "zh",   label: "中文",        labelKo: "중국어",    flag: "🇨🇳", speechLang: "zh-CN", color: "#B45309", bg: "linear-gradient(135deg,#431407,#B45309)", bgActive: "linear-gradient(135deg,#B45309,#F59E0B)", glow: "rgba(245,158,11,0.55)"  },
    { code: "ja",   label: "日本語",      labelKo: "일본어",    flag: "🇯🇵", speechLang: "ja-JP", color: "#6D28D9", bg: "linear-gradient(135deg,#2E1065,#6D28D9)", bgActive: "linear-gradient(135deg,#6D28D9,#A78BFA)", glow: "rgba(167,139,250,0.55)" },
    { code: "fr",   label: "Français",    labelKo: "프랑스어",  flag: "🇫🇷", speechLang: "fr-FR", color: "#0369A1", bg: "linear-gradient(135deg,#082F49,#0369A1)", bgActive: "linear-gradient(135deg,#0369A1,#38BDF8)", glow: "rgba(56,189,248,0.55)"  },
    { code: "de",   label: "Deutsch",     labelKo: "독일어",    flag: "🇩🇪", speechLang: "de-DE", color: "#374151", bg: "linear-gradient(135deg,#111827,#374151)", bgActive: "linear-gradient(135deg,#374151,#6B7280)", glow: "rgba(107,114,128,0.55)" },
    { code: "tl",   label: "Filipino",    labelKo: "필리핀어",  flag: "🇵🇭", speechLang: "tl-PH", color: "#0F766E", bg: "linear-gradient(135deg,#042F2E,#0F766E)", bgActive: "linear-gradient(135deg,#0F766E,#14B8A6)", glow: "rgba(20,184,166,0.55)"  },
    { code: "vi",   label: "Tiếng Việt",  labelKo: "베트남어",  flag: "🇻🇳", speechLang: "vi-VN", color: "#166534", bg: "linear-gradient(135deg,#052E16,#166534)", bgActive: "linear-gradient(135deg,#166534,#22C55E)", glow: "rgba(34,197,94,0.55)"   },
  ];

  const [selIdx, setSelIdx]           = useState(0);  // 선택된 외국어 인덱스 (기본: 영어)
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [original, setOriginal]       = useState("");
  const [translated, setTranslated]   = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeDir, setActiveDir]     = useState<"ko" | "foreign" | null>(null);
  const [errMsg, setErrMsg]           = useState("");
  const recognitionRef                = useRef<any>(null);
  const foreign                       = FOREIGN_LANGS[selIdx];

  /* 언어 변경 시 결과 초기화 */
  const changeLang = (idx: number) => {
    setSelIdx(idx); setShowLangPicker(false);
    setOriginal(""); setTranslated(""); setErrMsg("");
    recognitionRef.current?.stop();
    setIsListening(false); setActiveDir(null);
  };

  /* MyMemory 무료 번역 API */
  const translateText = async (text: string, from: string, to: string) => {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText as string;
    throw new Error("fail");
  };

  /* 음성 출력 */
  const speakText = (text: string, speechLang: string) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = speechLang; utt.rate = 0.88;
    window.speechSynthesis.speak(utt);
  };

  /* 음성 인식 */
  const startListening = (dir: "ko" | "foreign") => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErrMsg(lang === "ko" ? "⚠️ Chrome 브라우저에서 지원됩니다." : "⚠️ Requires Chrome browser.");
      return;
    }
    setOriginal(""); setTranslated(""); setErrMsg("");
    setActiveDir(dir); setIsListening(true);

    const rec = new SR();
    rec.lang = dir === "ko" ? "ko-KR" : foreign.speechLang;
    rec.interimResults = false;
    recognitionRef.current = rec;

    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;
      setOriginal(text);
      setIsListening(false); setIsTranslating(true);
      try {
        let fromCode: string, toCode: string, toSpeech: string;
        if (dir === "ko") {
          // 한국어 → 외국어 (auto이면 MyMemory가 자동 감지)
          fromCode = "ko";
          toCode   = foreign.code === "auto" ? "en" : foreign.code;  // auto 시 영어로 출력
          toSpeech = foreign.code === "auto" ? "en-US" : foreign.speechLang;
        } else {
          // 외국어 → 한국어 (auto이면 fromCode 생략 → MyMemory 자동 감지)
          fromCode = foreign.code === "auto" ? "autodetect" : foreign.code;
          toCode   = "ko";
          toSpeech = "ko-KR";
        }
        // MyMemory auto-detect: langpair=autodetect|ko
        const apiFrom = fromCode === "autodetect" ? "autodetect" : fromCode;
        const result  = await translateText(text, apiFrom, toCode);
        setTranslated(result);
        setIsTranslating(false);
        speakText(result, toSpeech);
      } catch {
        setIsTranslating(false);
        setErrMsg(lang === "ko" ? "번역 오류. 인터넷 확인 후 재시도." : "Translation error. Check connection.");
      }
    };
    rec.onerror = (e: any) => {
      setIsListening(false); setActiveDir(null);
      if (e.error !== "aborted")
        setErrMsg(lang === "ko" ? "마이크 오류: " + e.error : "Mic error: " + e.error);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#0B1120", borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", maxHeight: "88dvh", paddingBottom: "env(safe-area-inset-bottom,0px)" }} onClick={e => e.stopPropagation()}>

        {/* ── 핸들바 + 헤더 (항상 상단 고정) ── */}
        <div style={{ flexShrink: 0, background: "#0B1120", borderRadius: "24px 24px 0 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {/* 핸들바 — "아래로 스와이프하면 닫힘" 시각적 힌트 */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
          </div>

          {/* 타이틀 + 닫기 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 12px" }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 17, color: "#F8FAFC" }}>
              {modalTab === "search"    ? "🔍 " + (lang === "ko" ? "음성 검색" : "Voice Search")
               : modalTab === "interpret" ? "🌐 " + (lang === "ko" ? "현장 통역" : "Live Interpreter")
               : "📚 " + (lang === "ko" ? "상황별 표현" : "Phrase Book")}
            </div>
            <button onClick={onClose} style={{ border: "none", background: "rgba(255,255,255,0.09)", borderRadius: "50%", width: 36, height: 36, fontSize: 18, cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* ── 3탭 선택 바 ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, padding: "0 16px 14px" }}>
            {(["search","interpret","phrases"] as const).map((t) => {
              const labels: Record<string, {ko:string;en:string}> = {
                search:    {ko:"🔍 음성검색", en:"🔍 Search"},
                interpret: {ko:"🌐 현장통역", en:"🌐 Interpret"},
                phrases:   {ko:"📚 표현집",   en:"📚 Phrases"},
              };
              const active = modalTab === t;
              return (
                <button key={t} onClick={() => setModalTab(t)}
                  style={{ border: "none", borderRadius: 12, padding: "8px 6px", cursor: "pointer",
                    background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
                    color: active ? "#F8FAFC" : "rgba(255,255,255,0.45)",
                    fontFamily: "Manrope,sans-serif", fontWeight: active ? 700 : 500, fontSize: 11,
                    borderBottom: active ? "2px solid #F2994A" : "2px solid transparent",
                    transition: "all 0.15s" }}>
                  {lang === "ko" ? labels[t].ko : labels[t].en}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 탭 콘텐츠 (스크롤 영역) ── */}
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        {modalTab === "search" && (
          <VoiceSearchTab lang={lang} onNavigate={onNavigate ?? (() => {})} onClose={onClose} />
        )}

        {modalTab !== "search" && (<>

        {/* ── 언어 선택 바 (한국어 고정 | 외국어 선택) ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 12px" }}>
          {/* 한국어 고정 뱃지 */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "5px 12px" }}>
            <span style={{ fontSize: 14 }}>🇰🇷</span>
            <span style={{ color: "#F8FAFC", fontSize: 12, fontWeight: 600 }}>한국어</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 2 }}>고정</span>
          </div>

          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}>⇌</div>

          {/* 외국어 선택 버튼 */}
          <button onClick={() => setShowLangPicker(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, background: `rgba(${foreign.color},0.12)`, border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 20, padding: "5px 12px", cursor: "pointer", flex: 1 }}>
            <span style={{ fontSize: 14 }}>{foreign.flag}</span>
            <span style={{ color: "#F8FAFC", fontSize: 12, fontWeight: 600 }}>{lang === "ko" ? foreign.labelKo : foreign.label}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginLeft: "auto" }}>▾ {lang === "ko" ? "변경" : "change"}</span>
          </button>
        </div>

        {/* ── 언어 선택 드롭다운 ── */}
        {showLangPicker && (
          <div style={{ margin: "0 16px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
            {FOREIGN_LANGS.map((l, i) => (
              <button key={l.code} onClick={() => changeLang(i)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", border: "none", background: i === selIdx ? "rgba(255,255,255,0.1)" : "transparent", padding: "10px 14px", cursor: "pointer", borderBottom: i < FOREIGN_LANGS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span style={{ fontSize: 18 }}>{l.flag}</span>
                <span style={{ color: "#F8FAFC", fontSize: 13, fontWeight: i === selIdx ? 700 : 400 }}>{lang === "ko" ? l.labelKo : l.label}</span>
                {i === selIdx && <span style={{ marginLeft: "auto", color: "#34D399", fontSize: 14 }}>✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* ── 번역 결과 영역 ── */}
        <div style={{ margin: "0 16px", minHeight: 140, background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "16px", border: "1px solid rgba(255,255,255,0.07)" }}>
          {!original && !isListening && !isTranslating && !errMsg && (
            <div style={{ textAlign: "center", paddingTop: 24 }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🎙️</div>
              <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 13, lineHeight: 1.7 }}>
                {lang === "ko"
                  ? `한국어 또는 ${foreign.labelKo}로 말하세요`
                  : `Speak Korean or ${foreign.label}`}
              </div>
            </div>
          )}

          {isListening && (
            <div style={{ textAlign: "center", paddingTop: 14 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🎤</div>
              <div style={{ color: activeDir === "ko" ? "#60A5FA" : "#34D399", fontWeight: 700, fontSize: 15 }}>
                {activeDir === "ko" ? "한국어로 말하세요..." : foreign.code === "auto" ? "아무 언어로나 말하세요..." : `Speak in ${foreign.label}...`}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 5 }}>
                {activeDir === "ko"
                  ? (foreign.code === "auto" ? "→ 자동 번역" : `→ ${lang === "ko" ? foreign.labelKo : foreign.label}로 번역`)
                  : (foreign.code === "auto" ? "→ 언어 자동 감지 후 한국어 번역" : "→ 한국어로 번역됩니다")}
              </div>
              <button onClick={stopListening} style={{ marginTop: 12, border: "none", background: "rgba(248,113,113,0.15)", borderRadius: 20, padding: "5px 16px", color: "#F87171", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                ⏹ {lang === "ko" ? "중지" : "Stop"}
              </button>
            </div>
          )}

          {errMsg && <div style={{ color: "#F87171", fontSize: 13, textAlign: "center", paddingTop: 26, lineHeight: 1.5 }}>{errMsg}</div>}

          {original && !isListening && (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>
                {activeDir === "ko" ? "🇰🇷 말한 내용" : `${foreign.flag} What was said`}
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.55, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
                {original}
              </div>
              {isTranslating
                ? <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>번역 중... ✦</div>
                : translated && (
                  <div>
                    <div style={{ fontSize: 11, color: "#34D399", marginBottom: 5 }}>
                      {activeDir === "ko" ? `${foreign.flag} ${lang === "ko" ? foreign.labelKo : foreign.label}` : "🇰🇷 한국어 번역"}
                    </div>
                    <div style={{ color: "#F8FAFC", fontSize: 22, fontWeight: 800, lineHeight: 1.38, fontFamily: "Manrope,sans-serif" }}>
                      {translated}
                    </div>
                    <button onClick={() => speakText(translated, activeDir === "ko" ? foreign.speechLang : "ko-KR")}
                      style={{ marginTop: 9, border: "none", background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 14px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>
                      🔊 {lang === "ko" ? "다시 듣기" : "Replay"}
                    </button>
                  </div>
                )
              }
            </div>
          )}
        </div>

        {/* ── 두 개의 큰 버튼 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "12px 16px 8px" }}>
          {/* 한국어 버튼 (고정) */}
          <button
            onClick={() => isListening && activeDir === "ko" ? stopListening() : startListening("ko")}
            disabled={isListening && activeDir === "foreign"}
            style={{ border: "none", borderRadius: 18, cursor: "pointer",
              background: isListening && activeDir === "ko"
                ? "linear-gradient(135deg,#1D4ED8,#3B82F6)"
                : "linear-gradient(135deg,#1E3A5F,#1D4ED8)",
              padding: "18px 10px",
              opacity: isListening && activeDir === "foreign" ? 0.35 : 1,
              transition: "all 0.2s",
              boxShadow: isListening && activeDir === "ko" ? "0 0 28px rgba(59,130,246,0.55)" : "none",
            }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🇰🇷</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "Manrope,sans-serif", lineHeight: 1.3 }}>
              {isListening && activeDir === "ko" ? "⏹ 중지" : "한국어로\n말하기"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 10, marginTop: 4 }}>
              KO → {lang === "ko" ? foreign.labelKo : foreign.label}
            </div>
          </button>

          {/* 외국어 버튼 (선택 가능) */}
          <button
            onClick={() => isListening && activeDir === "foreign" ? stopListening() : startListening("foreign")}
            disabled={isListening && activeDir === "ko"}
            style={{ border: "none", borderRadius: 18, cursor: "pointer",
              background: isListening && activeDir === "foreign" ? foreign.bgActive : foreign.bg,
              padding: "18px 10px",
              opacity: isListening && activeDir === "ko" ? 0.35 : 1,
              transition: "all 0.2s",
              boxShadow: isListening && activeDir === "foreign" ? `0 0 28px ${foreign.glow}` : "none",
            }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{foreign.flag}</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "Manrope,sans-serif", lineHeight: 1.3 }}>
              {isListening && activeDir === "foreign" ? "⏹ Stop" : `Speak\n${foreign.label}`}
            </div>
            <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 10, marginTop: 4 }}>
              {lang === "ko" ? foreign.labelKo : foreign.label} → 한국어
            </div>
          </button>
        </div>

        {/* ── 팁 ── */}
        <div style={{ padding: "6px 16px 6px" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, lineHeight: 1.6 }}>
              💡 {lang === "ko"
                ? "상대방에게 화면을 보여주거나 스피커로 들려주세요\n식당 · 병원 · 상점 · 관공서 어디서나 사용 가능"
                : "Show screen or use speaker · Works anywhere"}
            </div>
          </div>
        </div>

        {/* ── 상황별 영어 표현집 (표현집 탭에서만) ── */}
        {modalTab === "phrases" && (
          <PhraseBook lang={lang} speakFn={(text: string, speechLang: string) => {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(text);
            utt.lang = speechLang; utt.rate = 0.85;
            window.speechSynthesis.speak(utt);
          }} />
        )}
        </>) /* ── end modalTab !== "search" ── */}
        </div> {/* ── 스크롤 영역 끝 ── */}

        {/* ── 하단 닫기 버튼 — 항상 표시, 엄지손가락 위치 ── */}
        <div style={{
          flexShrink: 0,
          padding: "12px 16px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "#0B1120",
        }}>
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "14px", border: "none", borderRadius: 14,
              background: "rgba(255,255,255,0.09)",
              color: "#F8FAFC", fontSize: 15, fontWeight: 700,
              fontFamily: "Manrope, sans-serif",
              cursor: "pointer", letterSpacing: "-0.3px",
              transition: "background 0.15s",
            }}
            onTouchStart={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            onTouchEnd={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
          >
            {lang === "ko" ? "✕  닫기" : "✕  Close"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   스마트 공유 모달 — 탭별 맞춤 메시지 + 멀티 SNS
───────────────────────────────────────── */

// 탭별 공유 콘텐츠 — 도시명 동적 생성 (시애틀을 기준 템플릿으로 모든 도시에 적용)
function getShareContexts(cityKo: string, cityEn: string, slug: string) {
  return {
    0: { emoji: "🏠", labelKo: "홈", labelEn: "Home",
      textKo: `${cityKo} Korean American 플랫폼 🇺🇸\n정착부터 투표·법률·한국학교·다민족 커뮤니티까지\n이민자에서 Korean American으로 — 함께 성장해요 👇`,
      textEn: `${cityEn} Korean American Platform 🇺🇸\nFrom settlement to voting, legal aid, Korean schools & multicultural community\nGrow from newcomer to Korean American — together 👇`,
      tags: `#KoreanAmerican #${slug}한인 #HebronGuide` },
    1: { emoji: "🛬", labelKo: "정착", labelEn: "Settlement",
      textKo: `${cityKo} 정착 완벽 가이드 🛬\nSSN·운전면허·비자·세금·법률·한국학교까지\n새로 오신 분들께 꼭 공유해 주세요 👇`,
      textEn: `Complete ${cityEn} Korean American guide 🛬\nSSN, license, visa, taxes, legal aid, Korean schools\nShare with every new arrival 👇`,
      tags: `#${slug}정착 #KoreanAmerican #HebronGuide` },
    2: { emoji: "⛪", labelKo: "교회", labelEn: "Church",
      textKo: `${cityKo} 한인교회 정보 ⛪\n가정교회 중심으로 검증된 교회 정보\n믿을 수 있는 커뮤니티를 찾고 계신다면 👇`,
      textEn: `Korean churches in ${cityEn} ⛪\nVerified church info, house church communities\nLooking for a trusted community? 👇`,
      tags: `#${slug}한인교회 #가정교회 #HebronGuide` },
    3: { emoji: "🍽️", labelKo: "맛집", labelEn: "Food",
      textKo: `${cityKo} 한인 검증 맛집 TOP 5 🍽️\n수백 곳 중 엄선한 진짜 맛집\n여기는 정말 맛있어요! 👇`,
      textEn: `${cityEn}'s top verified Korean restaurants 🍽️\nHandpicked from hundreds of options\nThese are genuinely delicious! 👇`,
      tags: `#${slug}맛집 #한식 #KoreanFood #HebronGuide` },
    4: { emoji: "🗺️", labelKo: "관광", labelEn: "Tourism",
      textKo: `${cityKo} 관광 명소 완벽 정리 🗺️\n자연·문화·야경·액티비티 총망라\n${cityKo} 방문 계획이라면 꼭 보세요 👇`,
      textEn: `${cityEn}'s best attractions 🗺️\nNature, culture, nightviews & activities\nMust-see before your ${cityEn} trip 👇`,
      tags: `#${slug}관광 #KoreanAmerican #HebronGuide` },
    5: { emoji: "🆘", labelKo: "도움·긴급", labelEn: "Help & Emergency",
      textKo: `${cityKo} 한인 긴급 연락처 모음 🆘\n병원·총영사관·법률·커뮤니티 자원\n셀폰에 저장해 두세요! 👇`,
      textEn: `${cityEn} emergency contacts for Koreans 🆘\nHospital, consulate, legal & community resources\nSave this now! 👇`,
      tags: `#${slug}응급 #한인정보 #HebronGuide` },
    6: { emoji: "💼", labelKo: "취업", labelEn: "Jobs",
      textKo: `${cityKo} 한인 취업 정보 💼\n주요 고용주·한인 업체·취업 비자 경로\n취업 준비 중이시라면 👇`,
      textEn: `${cityEn} jobs for Koreans 💼\nMajor employers, Korean businesses & visa pathways\nFor job seekers 👇`,
      tags: `#${slug}취업 #테크잡 #HebronGuide` },
    7: { emoji: "🎓", labelKo: "교육", labelEn: "Education",
      textKo: `${cityKo} 교육 정보 🎓\n공립학교·한국어학교·대학 진학\n자녀 교육 고민 중이시라면 👇`,
      textEn: `${cityEn} education guide 🎓\nPublic schools, Korean schools & college prep\nFor parents planning ahead 👇`,
      tags: `#${slug}교육 #한인학교 #HebronGuide` },
    8: { emoji: "💰", labelKo: "생활비", labelEn: "Cost of Living",
      textKo: `${cityKo} 실제 생활비 정보 💰\n렌트·세금·교통·통신비 완전 가이드\n이사 전 꼭 확인하세요 👇`,
      textEn: `Real ${cityEn} cost of living 💰\nRent, taxes, transport & phone costs guide\nCheck before you move 👇`,
      tags: `#${slug}생활비 #렌트 #HebronGuide` },
  };
}

function ChatShareModal({ onClose, lang, activeNav = 0 }: { onClose: () => void; lang: string; activeNav?: number }) {
  const shareCity    = useCityConfig();
  const appUrl       = `https://hebronguide.com/${shareCity.slug}/`;
  const SHARE_CTX    = getShareContexts(shareCity.nameKo, shareCity.nameEn, shareCity.slug);
  const ctx          = SHARE_CTX[activeNav] ?? SHARE_CTX[0];
  const bodyText     = lang === "ko" ? ctx.textKo : ctx.textEn;
  const fullMsg      = `${bodyText}\n\n📱 HebronGuide ${shareCity.nameKo} — hebronguide.com/${shareCity.slug}\n${ctx.tags}`;

  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(fullMsg + "\n" + appUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: `HebronGuide ${shareCity.nameKo} — ${lang === "ko" ? ctx.labelKo : ctx.labelEn}`, text: fullMsg, url: appUrl }).catch(() => {});
    } else {
      copy();
    }
    onClose();
  };

  const encoded   = encodeURIComponent(fullMsg + "\n" + appUrl);
  const encodedUrl = encodeURIComponent(appUrl);

  // Instagram/TikTok: 텍스트 복사 후 앱 열기 (웹 직접 공유 불가)
  const openWithCopy = (appUrl2: string) => {
    navigator.clipboard?.writeText(fullMsg + "\n" + appUrl).then(() => {
      window.open(appUrl2, "_blank");
    }).catch(() => {
      window.open(appUrl2, "_blank");
    });
  };

  // SNS 플랫폼 목록
  const platforms = [
    // 1행: 가장 자주 쓰는 것
    { icon: "💬", label: "카카오톡", sub: lang === "ko" ? "한국인 필수" : "Korean #1", color: "#3A1D1D", bg: "#FEF9C3",
      action: () => {
        // 카카오톡 딥링크 → 실패 시 웹 공유
        const kakaoUrl = `kakaotalk://msg/send?text=${encoded}`;
        const fallback = `https://story.kakao.com/share?url=${encodedUrl}&text=${encodeURIComponent(fullMsg)}`;
        try { window.location.href = kakaoUrl; setTimeout(() => window.open(fallback, "_blank"), 1500); }
        catch { window.open(fallback, "_blank"); }
      }
    },
    { icon: "💚", label: "WhatsApp", sub: lang === "ko" ? "글로벌 20억+" : "2B+ users", color: "#128C7E", bg: "#F0FFF4",
      href: `https://wa.me/?text=${encoded}` },
    { icon: "📸", label: "Instagram", sub: lang === "ko" ? "텍스트 복사 후 앱 열기" : "Copy → paste in app", color: "#E1306C", bg: "#FFF0F5",
      action: () => openWithCopy("https://www.instagram.com/") },
    { icon: "🎵", label: "TikTok", sub: lang === "ko" ? "텍스트 복사 후 앱 열기" : "Copy → paste in app", color: "#010101", bg: "#F5F5F5",
      action: () => openWithCopy("https://www.tiktok.com/") },
    // 2행: 추가 채널
    { icon: "📘", label: "Facebook", sub: "페이스북", color: "#1877F2", bg: "#EFF6FF",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(fullMsg)}` },
    { icon: "🐦", label: "X", sub: "트위터", color: "#000000", bg: "#F9FAFB",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(bodyText + "\n" + ctx.tags)}&url=${encodedUrl}` },
    { icon: "📧", label: lang === "ko" ? "이메일" : "Email", sub: "Gmail · Outlook", color: "#2563EB", bg: "#EFF6FF",
      href: `mailto:?subject=HebronGuide Seattle&body=${encodeURIComponent(fullMsg + "\n\n" + appUrl)}` },
    { icon: "🔗", label: lang === "ko" ? "링크 복사" : "Copy Link", sub: lang === "ko" ? "클립보드" : "Clipboard", color: "#64748B", bg: "#F8FAFC", action: copy },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.52)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#fff", borderRadius: "24px 24px 0 0", paddingBottom: "env(safe-area-inset-bottom,16px)", boxShadow: "0 -8px 48px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>

        {/* ── 헤더 ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 0" }}>
          <div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 17, color: "#1B2A4A" }}>
              📤 {lang === "ko" ? "공유하기" : "Share"}
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              {ctx.emoji} {lang === "ko" ? ctx.labelKo : ctx.labelEn} {lang === "ko" ? "정보 공유" : "info"}
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#F1F5F9", borderRadius: "50%", width: 32, height: 32, fontSize: 16, cursor: "pointer", color: "#64748B" }}>✕</button>
        </div>

        {/* ── 공유 미리보기 카드 ── */}
        <div style={{ margin: "14px 16px 0", background: "linear-gradient(135deg,#F8FAFC,#EFF6FF)", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 14px 10px" }}>
          <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.65, whiteSpace: "pre-line" }}>
            {bodyText}
          </div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: "#1B2A4A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>🧭</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1B2A4A" }}>HebronGuide</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>hebronguide.com/seattle</div>
          </div>
          <div style={{ marginTop: 4, fontSize: 10, color: "#94A3B8" }}>{ctx.tags}</div>
        </div>

        {/* ── SNS 플랫폼 그리드 (4열 아이콘형) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, padding: "14px 16px 6px" }}>
          {platforms.map((p, i) => {
            const isLast = i === platforms.length - 1;
            const isInstagram = i === 2;
            const isTikTok = i === 3;
            const inner = (
              <>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: p.bg, border: `1.5px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 4 }}>
                  {isLast && copied ? "✅" : p.icon}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10, color: "#1B2A4A", textAlign: "center", lineHeight: 1.2 }}>
                  {isLast && copied ? (lang === "ko" ? "복사됨!" : "Copied!") : p.label}
                </div>
                {(isInstagram || isTikTok) && (
                  <div style={{ fontSize: 8, color: "#F59E0B", fontWeight: 700, textAlign: "center", marginTop: 2 }}>
                    복사→붙여넣기
                  </div>
                )}
              </>
            );
            return p.action ? (
              <button key={i} onClick={p.action}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 2px", border: "none", background: "transparent", cursor: "pointer" }}>
                {inner}
              </button>
            ) : (
              <a key={i} href={(p as any).href} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 2px", textDecoration: "none" }}>
                {inner}
              </a>
            );
          })}
        </div>

        {/* ── 폰 기본 공유 큰 버튼 (카카오·문자·이메일 등 전부) ── */}
        <div style={{ padding: "8px 16px 6px" }}>
          <button onClick={nativeShare} style={{ width: "100%", border: "none", borderRadius: 14, background: "linear-gradient(135deg,#F2994A,#F59E0B)", padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📤</span>
            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>
              {lang === "ko" ? "폰 공유 시트 열기 (카카오·문자·이메일…)" : "Open share sheet (KakaoTalk, SMS, Mail…)"}
            </span>
          </button>
        </div>

        {/* ── 하단 안내 ── */}
        <div style={{ padding: "6px 16px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#CBD5E1" }}>
            💡 {lang === "ko" ? "공유 시 HebronGuide 링크가 자동으로 포함됩니다" : "HebronGuide link is automatically included in every share"}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────
   더보기 시트 항목
───────────────────────────────────────── */
const MORE_SECTIONS = [
  /* ── 1행: 메인 섹션 ── */
  { icon: Church,       labelKo: "교회",      labelEn: "Church",       tab: 2, subTab: 0, color: "#7C3AED" },
  { icon: Map,          labelKo: "관광",      labelEn: "Tourism",      tab: 4, subTab: 0, color: "#0EA5E9" },
  { icon: Briefcase,    labelKo: "취업",      labelEn: "Jobs",         tab: 6, subTab: 0, color: "#059669" },
  { icon: GraduationCap,labelKo: "교육",      labelEn: "Schools",      tab: 7, subTab: 0, color: "#F59E0B" },
  { icon: DollarSign,   labelKo: "생활비",    labelEn: "Costs",        tab: 8, subTab: 0, color: "#8B5CF6" },
  /* ── 2행: 빠른 접근 (새 탭) ── */
  { icon: FileText,     labelKo: "비자·이민", labelEn: "Visa",         tab: 1, subTab: 7, color: "#6366F1" },
  { icon: Receipt,      labelKo: "세금신고",  labelEn: "Taxes",        tab: 8, subTab: 4, color: "#F97316" },
  { icon: Scale,        labelKo: "법률상담",  labelEn: "Legal",        tab: 5, subTab: 5, color: "#64748B" },
  { icon: BookOpen,     labelKo: "한국학교",  labelEn: "K-School",     tab: 7, subTab: 5, color: "#BE185D" },
  { icon: Vote,         labelKo: "Korean Am.", labelEn: "Korean Am.",  tab: 5, subTab: 6, color: "#2563EB" },
];

interface BottomNavProps {
  activeIndex: number;
  onChange: (i: number, subTab?: number) => void;
  onSearchToggle: () => void;
  onShareToggle: () => void;
  onTranslateToggle: () => void;
}
function BottomNav({ activeIndex, onChange, onSearchToggle, onShareToggle, onTranslateToggle }: BottomNavProps) {
  const { lang } = useI18n();
  const [showMore, setShowMore] = useState(false);

  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.id === "more") { setShowMore(prev => !prev); return; }
    setShowMore(false);
    onChange(item.tab);
  };

  const handleMoreSection = (tab: number, subTab?: number) => {
    onChange(tab, subTab);
    setShowMore(false);
  };

  const ACCENT = "#F2994A";

  return (
    <>
      {/* 더보기 시트 — 반투명 오버레이 */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          onClick={() => setShowMore(false)}
        />
      )}

      {/* 더보기 바텀 시트 */}
      {showMore && (
        <div
          className="fixed z-50 lg:hidden"
          style={{
            bottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
            left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 430,
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
            padding: "16px 16px 12px",
          }}
        >
          {/* 핸들 */}
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E5E7EB", margin: "0 auto 16px" }} />

          {/* 섹션 버튼 그리드 — 2행 */}
          {[MORE_SECTIONS.slice(0, 5), MORE_SECTIONS.slice(5)].map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: rowIdx === 0 ? 8 : 16 }}>
              {rowIdx === 1 && (
                /* 2행 라벨 */
                <div style={{ gridColumn: "1 / -1", marginBottom: 2, paddingLeft: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.5px",
                    fontFamily: "Manrope, sans-serif" }}>
                    {lang === "ko" ? "⚡ 빠른 접근" : "⚡ QUICK ACCESS"}
                  </span>
                </div>
              )}
              {row.map((s) => {
                const isActive = activeIndex === s.tab;
                const IconComp = s.icon;
                return (
                  <button
                    key={`${s.tab}-${s.subTab}`}
                    onClick={() => handleMoreSection(s.tab, s.subTab)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "10px 4px 8px", borderRadius: 14, border: "none", cursor: "pointer",
                      background: isActive ? `${s.color}15` : "#F8FAFC",
                      outline: isActive ? `1.5px solid ${s.color}40` : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 12,
                      background: isActive ? s.color : `${s.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <IconComp size={20} color={isActive ? "#fff" : s.color} strokeWidth={1.8} />
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: isActive ? s.color : "#374151",
                      fontFamily: "-apple-system, 'Noto Sans KR', sans-serif",
                      textAlign: "center", lineHeight: 1.2,
                    }}>
                      {lang === "ko" ? s.labelKo : s.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* 구분선 */}
          <div style={{ height: 1, background: "#F1F5F9", marginBottom: 12 }} />

          {/* 유틸 버튼 */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { icon: Search,       labelKo: "검색",  labelEn: "Search",    action: () => { onSearchToggle(); setShowMore(false); } },
              { icon: Globe,        labelKo: "통역",  labelEn: "Translate", action: () => { onTranslateToggle(); setShowMore(false); } },
              { icon: Share2,       labelKo: "공유",  labelEn: "Share",     action: () => { onShareToggle(); setShowMore(false); } },
            ].map((u, i) => {
              const IconComp = u.icon;
              return (
                <button
                  key={i}
                  onClick={u.action}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 5, padding: "10px 4px", borderRadius: 12, border: "none",
                    background: "#F8FAFC", cursor: "pointer",
                  }}
                >
                  <IconComp size={20} color="#6B7280" strokeWidth={1.8} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280",
                    fontFamily: "-apple-system, 'Noto Sans KR', sans-serif" }}>
                    {lang === "ko" ? u.labelKo : u.labelEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 광고 신청 — 파트너 비즈니스용 (Soft CTA) */}
          <a href="/ad-request.html" target="_blank" rel="noopener noreferrer"
            onClick={() => setShowMore(false)}
            style={{
              display: "block", marginTop: 12, padding: "10px 14px",
              background: "linear-gradient(135deg, rgba(201,162,39,0.12), rgba(110,231,183,0.08))",
              border: "1px solid rgba(201,162,39,0.25)", borderRadius: 12,
              textDecoration: "none", textAlign: "center",
            }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C9A227", letterSpacing: "0.3px", marginBottom: 2 }}>
              📣 {lang === "ko" ? "광고 신청 — 파트너 비즈니스" : "Advertise — Partner Business"}
            </div>
            <div style={{ fontSize: 10, color: "#6B7280", fontFamily: "Manrope, sans-serif" }}>
              {lang === "ko" ? "AI가 한·영·스 3개 언어 광고 자동 생성 (24시간)" : "AI generates 3-language ads in 24 hours"}
            </div>
          </a>
        </div>
      )}

      {/* 메인 하단 네비 — iPhone safe area 대응 */}
      <nav
        className="fixed bottom-0 z-50 lg:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          background: "#F9F9F9",
          borderTop: "0.5px solid rgba(0,0,0,0.18)",
          boxShadow: "0 -1px 0 rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", height: 56, alignItems: "stretch" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.tab >= 0 ? activeIndex === item.tab : showMore;
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 4, paddingTop: 8, paddingBottom: 6,
                  border: "none", background: "none", cursor: "pointer",
                  position: "relative", transition: "transform 0.1s ease",
                }}
                onTouchStart={e => (e.currentTarget.style.transform = "scale(0.92)")}
                onTouchEnd={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                {isActive && (
                  <div style={{
                    position: "absolute", top: 0, left: "50%", width: 28, height: 3,
                    borderRadius: 2, background: ACCENT, transform: "translateX(-50%)",
                  }} />
                )}
                <IconComp size={24} color={isActive ? ACCENT : "#8E8E93"} strokeWidth={isActive ? 2.2 : 1.5} />
                <span style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Noto Sans KR', sans-serif",
                  fontWeight: isActive ? 700 : 500, fontSize: 10,
                  color: isActive ? ACCENT : "#8E8E93",
                  whiteSpace: "nowrap", letterSpacing: "-0.2px",
                }}>
                  {lang === "ko" ? item.labelKo : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/* ─────────────────────────────────────────
   TOP APP BAR
───────────────────────────────────────── */
function AppBar({ onHome }: { onHome?: () => void }) {
  const { t, lang, setLang } = useI18n();
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-[20px] w-full"
      style={{
        height: 56,
        background: "#F9F9F9",
        borderBottom: "0.5px solid rgba(0,0,0,0.18)",
      }}
    >
      {/* 로고 + 앱 이름 — 클릭하면 홈으로 (표준 UX) */}
      <button
        onClick={onHome}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none",
          cursor: onHome ? "pointer" : "default", padding: "4px 6px 4px 0", borderRadius: 10,
          transition: "opacity 0.15s" }}
        onMouseEnter={e => { if (onHome) (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        title={onHome ? "홈으로" : "HebronGuide"}
      >
        <div className="flex items-center justify-center overflow-hidden" style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(242,153,74,0.25)", background: "rgba(242,153,74,0.08)", flexShrink: 0 }}>
          <img src={logoImg} alt="HebronGuide Logo" style={{ width: 28, height: 28, objectFit: "contain" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = "block"; }} />
          <span style={{ fontSize: 16, display: "none" }}>🌲</span>
        </div>
        <div className="flex flex-col" style={{ lineHeight: 1 }}>
          <div>
            <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Manrope, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "1.5px", color: "#F2994A" }}>HEBRON</span>
            <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Manrope, sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "1.5px", color: "#64748B" }}>GUIDE</span>
          </div>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Manrope, sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "1px", color: "#F2994A", marginTop: 2, opacity: 0.8 }}>
            {(() => { const p = window.location.pathname.split('/').filter(Boolean)[0]?.toUpperCase(); return (p && ['SEATTLE','DALLAS','SF','NEWYORK','NASHVILLE','BOSTON','LA','TORONTO','VANCOUVER'].includes(p)) ? (p === 'SF' ? 'SAN FRANCISCO' : p === 'NEWYORK' ? 'NEW YORK' : p) : 'SEATTLE'; })()}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-[8px]">
        {/* 언어 토글: KO / EN / ES */}
        <div className="flex items-center" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: 2, gap: 2 }}>
          {(["ko", "en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex items-center justify-center border-0 cursor-pointer hover:scale-110 active:scale-95"
              style={{
                height: 24, paddingLeft: 8, paddingRight: 8, borderRadius: 7,
                background: lang === l ? `rgba(242,153,74,0.12)` : "transparent",
                border: `1px solid ${lang === l ? "rgba(242,153,74,0.4)" : "transparent"}`,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Manrope, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.5px", color: lang === l ? "#F2994A" : "#94A3B8" }}>
                {l.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
        {/* 검색은 하단 바에서 처리 — 중복 제거 */}
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */
export function HebronGuide() {
  const [activeNav, setActiveNav] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const isOnline = useOnlineStatus();
  const { showBanner, handleInstall, handleDismiss } = useInstallPrompt();
  const { lang, setLang } = useI18n();
  const city = useCityConfig();

  // document.title 도시별 동적 업데이트
  useEffect(() => {
    const cityKo = city.nameKo;
    const cityEn = city.nameEn;
    document.title = lang === "ko"
      ? `${cityKo} 한인 정착 가이드 — HebronGuide ${cityKo}`
      : lang === "es"
      ? `Guía de Asentamiento Coreano en ${cityEn} — HebronGuide ${cityEn}`
      : `Korean Settlement Guide ${cityEn} — HebronGuide ${cityEn}`;
  }, [lang, city]);

  const [settleInitialSub, setSettleInitialSub] = useState(0);
  const [helpInitialSub, setHelpInitialSub] = useState(0);
  const [eduInitialSub, setEduInitialSub] = useState(0);
  const [costInitialSub, setCostInitialSub] = useState(0);

  const handleNavigate = (tab: number, subTab?: number) => {
    const maxTab = 9; // 홈·정착·교회·맛집·탐방·도움·취업·교육·생활비·사람연결
    if (tab <= maxTab) {
      if (tab === 1 && subTab !== undefined) setSettleInitialSub(subTab);
      if (tab === 5 && subTab !== undefined) setHelpInitialSub(subTab);
      if (tab === 7 && subTab !== undefined) setEduInitialSub(subTab);
      if (tab === 8 && subTab !== undefined) setCostInitialSub(subTab);
      setActiveNav(tab);
    }
  };

  const handleLangCycle = () => {
    setLang(lang === "ko" ? "en" : lang === "en" ? "es" : "ko");
  };

  const handleSearchToggle = () => {
    setShowSearch(prev => !prev);
    if (showSearch) setSearchQuery("");
  };

  // subTab 포함 검색 맵 — 구체적 키워드일수록 앞에 배치 (선순위 매칭)
  const SEARCH_MAP: Array<{ tab: number; subTab?: number; labelKo: string; labelEn: string; keywords: string[] }> = [
    /* ── subTab 전용 (구체적 키워드 → 정확한 탭으로 바로 이동) ── */
    { tab: 1, subTab: 7, labelKo: "비자·이민", labelEn: "Visa/Immigration",
      keywords: ["비자","visa","이민","immigration","영주권","green card","그린카드","i-94","i94",
        "uscis","h1b","h-1b","f1","f-1","o-1","e-2","l-1","eb","j-1","opt","stem opt",
        "유학비자","취업비자","투자비자","주재원비자","이민변호사","체류기간","ds-2019","i-20",
        "비자연장","비자전환","change of status","extension","체류연장"] },
    { tab: 8, subTab: 4, labelKo: "세금신고", labelEn: "Tax Filing",
      keywords: ["vita","세금신고","tax filing","tax return","itin","w-7","fbar","fatca",
        "한인cpa","cpa","세무사","세금환급","tax refund","eitc","income tax",
        "fincen","해외계좌","foreign account","소득신고","확정신고","세금캘린더"] },
    { tab: 5, subTab: 5, labelKo: "법률상담", labelEn: "Legal Help",
      keywords: ["nwirp","법률상담","legal help","무료법률","free legal","추방","deportation",
        "daca","변호사","attorney","lawyer","oneamerica","nw justice","임차인","tenant",
        "퇴거","eviction","이민사기","notario","법무사","kcba","pro bono"] },
    { tab: 7, subTab: 5, labelKo: "한국학교", labelEn: "Korean School",
      keywords: ["한국학교","korean school","토요학교","saturday school","topik","한국어교육",
        "ap korean","naks","태권도","taekwondo","한국무용","k-pop dance","한국어학원",
        "주말학교","woorischool","한국어수업"] },
    { tab: 5, subTab: 6, labelKo: "Korean American", labelEn: "Korean American",
      keywords: ["korean american","투표","voting","voter","유권자등록","시민권","citizenship",
        "도서관","library","kcls","봉사","volunteer","다민족","multicultural","wic","snap",
        "공공혜택","public benefits","211","지역사회","community"] },
    /* ── 메인 탭 (일반 키워드) ── */
    { tab: 1, labelKo: "정착", labelEn: "Settle",
      keywords: ["정착","settle","ssn","은행","bank","면허","license","sim","주소","address",
        "orca","교통","abc운전","abc driving","운전학교","kcsc","한인생활상담소",
        "총영사관","consulate","여권","passport","공증","notary","재외국민","거주","housing",
        "운전면허","dol","건강보험","학교등록","신용카드","credit"] },
    { tab: 2, labelKo: "교회", labelEn: "Church",
      keywords: ["교회","church","예배","worship","목장","가정교회","house church",
        "gmc","지구촌","global mission","성경","bible","목사","pastor","신앙","faith"] },
    { tab: 3, labelKo: "맛집·카페", labelEn: "Food",
      keywords: ["맛집","food","카페","cafe","식당","bbq","한식","coffee","restaurant",
        "백정","baekjeong","쏘문난집","so moon","이가네","yi's","wuju","갈비","설렁탕",
        "순두부","tofu","치킨","chicken","비빔밥","bibimbap","라면","ramen",
        "핫도그","hotdog","빙수","bingsu","크로플","k cafe","dabang","음식","h-mart","hmart"] },
    { tab: 4, labelKo: "관광", labelEn: "Tourism",
      keywords: ["탐방","관광","여행","tourism","travel","explore","레이니어","rainier",
        "스페이스니들","space needle","파이크","pike","폭포","falls","스노퀄미","snoqualmie",
        "페리","ferry","베인브릿지","bainbridge","산","mountain","하이킹","hiking",
        "자연","nature","공원","park","박물관","museum","시애틀센터"] },
    { tab: 5, labelKo: "도움·의료", labelEn: "Help",
      keywords: ["도움","help","의료","의사","병원","hospital","emergency","응급","치과",
        "dentist","dental","약국","pharmacy","보험","insurance","apple health","medicaid",
        "정신건강","mental health","상담","counseling","ichs","swedish","acrs",
        "911","위기","crisis","무료클리닉","free clinic"] },
    { tab: 6, labelKo: "취업", labelEn: "Jobs",
      keywords: ["취업","jobs","amazon","microsoft","구글","google","직장","career",
        "worksource","이력서","resume","linkedin","boeing","자영업","창업","인턴","intern","채용"] },
    { tab: 7, labelKo: "교육", labelEn: "Schools",
      keywords: ["교육","education","학교","school","대학","university","학군","학원",
        "uw","에드먼즈칼리지","edmonds","esl","영어","english class","벨뷰학군",
        "bellevue sd","northshore","lake washington","tutoring","과외","sat","act",
        "running start","community college","cc","편입"] },
    { tab: 8, labelKo: "생활비", labelEn: "Costs",
      keywords: ["생활비","cost","렌트","rent","기름","gas","세금","tax","월세",
        "환율","exchange rate","물가","price","전기세","utilities","주차","parking",
        "최저시급","minimum wage","팁","tip","shopping","쇼핑","costco","알뜰"] },
  ];

  const handleSearch = (query: string) => {
    const q = query.toLowerCase().replace(/\s/g, "");
    if (!q) return;
    // subTab 있는 항목을 우선 매칭 (더 구체적인 결과)
    const match = SEARCH_MAP.find(item =>
      item.keywords.some(kw => {
        const k = kw.replace(/\s/g, "");
        return q.includes(k) || k.includes(q);
      })
    );
    if (match) {
      handleNavigate(match.tab, match.subTab);
      setShowSearch(false);
      setSearchQuery("");
    } else {
      alert(lang === "ko"
        ? `"${query}" 검색 결과가 없어요.\n빠른 메뉴에서 직접 선택해보세요!`
        : `No results for "${query}".\nTry selecting from Quick Menu!`);
    }
  };

  // 10개 탭 스크린 (홈·정착·교회·맛집·탐방·도움·취업·교육·생활비·사람연결)
  const screens = [
    <HomeScreen onNavigate={handleNavigate} />,                                        // 0
    <SettleScreen onHome={() => setActiveNav(0)} initialSub={settleInitialSub} />,     // 1
    <ChurchScreen onHome={() => setActiveNav(0)} />,                                   // 2
    <DiningScreen onHome={() => setActiveNav(0)} />,                                   // 3
    <ExploreScreen onHome={() => setActiveNav(0)} />,                                  // 4
    <HelpScreen onHome={() => setActiveNav(0)} initialSub={helpInitialSub} />,         // 5
    <JobsScreen onHome={() => setActiveNav(0)} />,                                     // 6
    <EducationScreen onHome={() => setActiveNav(0)} initialSub={eduInitialSub} />,     // 7
    <CostScreen onHome={() => setActiveNav(0)} initialSub={costInitialSub} />,         // 8
    <ConnectScreen onHome={() => setActiveNav(0)} />,                                  // 9
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#F2F2F7" }}>
      {/* 데스크탑 사이드바 */}
      <DesktopSidebar activeTab={activeNav} onNavigate={handleNavigate} />

      {/* 메인 콘텐츠 영역 */}
      <div
        className="flex flex-col min-h-screen mx-auto relative w-full max-w-[430px] md:max-w-[640px] lg:max-w-[960px] lg:ml-64"
        style={{ background: "#1a2535" }}
      >
        <AppBar onHome={() => setActiveNav(0)} />

        {/* 검색바 (슬라이드 인) */}
        {showSearch && (() => {
          // 실시간 앱 내 검색 매칭
          const q = searchQuery.toLowerCase().replace(/\s/g, "");
          const internalMatches = q.length > 0
            ? SEARCH_MAP.filter(item => item.keywords.some(kw => kw.replace(/\s/g,"").includes(q) || q.includes(kw.replace(/\s/g,""))))
            : [];
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent((searchQuery || "시애틀 한인") + " 시애틀 한인")}`;
          const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent((searchQuery || "시애틀 한인 정보") + " 시애틀 한인")}`;

          return (
            <div style={{
              position: "fixed", top: 56, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: 430, zIndex: 200,
              background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              borderRadius: "0 0 20px 20px",
            }}>
              {/* 검색 입력창 */}
              <div style={{ padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: 16, color: "#94A3B8" }}>🔍</span>
                <input autoFocus value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch(searchQuery)}
                  placeholder={lang === "ko" ? "백정, 치과, 비자, 스페이스니들..." : "Baekjeong, dentist, visa, Space Needle..."}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 15,
                    fontFamily: "'Noto Sans KR', sans-serif", background: "transparent" }}
                />
                <button onClick={handleSearchToggle}
                  style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8", padding: 4 }}>✕</button>
              </div>

              {/* 다른 도시 HebronGuide — 도시명 검색 시 */}
              {(() => {
                const cityMatch = HEBRON_CITIES.filter(c => c.nameEn !== "Seattle").find(c => {
                  const qLow = q.toLowerCase();
                  return (
                    qLow.includes(c.nameKo.toLowerCase()) ||
                    qLow.includes(c.nameEn.toLowerCase()) ||
                    qLow.includes(c.nameEn.toLowerCase().split(" ")[0]) ||
                    (c.nameEn === "San Francisco" && (qLow.includes("sf") || qLow.includes("샌프란") || qLow.includes("san francisco"))) ||
                    (c.nameEn === "Dallas" && (qLow.includes("달라") || qLow.includes("텍사스") || qLow.includes("texas"))) ||
                    (c.nameEn === "New York" && (qLow.includes("뉴욕") || qLow.includes("ny") || qLow.includes("new york"))) ||
                    (c.nameEn === "Nashville" && (qLow.includes("내쉬") || qLow.includes("nashville"))) ||
                    (c.nameEn === "Boston" && (qLow.includes("보스") || qLow.includes("boston"))) ||
                    (c.nameEn === "Los Angeles" && (qLow.includes("la") || qLow.includes("엘에이") || qLow.includes("los angeles")))
                  );
                });
                if (!cityMatch || q.length < 1) return null;
                const isLive = cityMatch.status === "live";
                return (
                  <div style={{ margin: "8px 12px", borderRadius: 14, overflow: "hidden", border: `1.5px solid ${cityMatch.color}44`, background: `linear-gradient(135deg, ${cityMatch.color}08, ${cityMatch.color}04)` }}>
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${cityMatch.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                        {cityMatch.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#1B2A4A" }}>
                          HebronGuide {lang === "ko" ? cityMatch.nameKo : cityMatch.nameEn}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          {isLive
                            ? (lang === "ko" ? "✅ 라이브 — 지금 바로 볼 수 있어요" : "✅ Live — available now")
                            : (lang === "ko" ? "🔜 준비 중 — 곧 오픈합니다" : "🔜 Coming soon")}
                        </div>
                      </div>
                      {isLive && (
                        <a href={`https://hebronguide.com${cityMatch.url}`} target="_blank" rel="noopener noreferrer"
                          style={{ flexShrink: 0, background: cityMatch.color, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", textDecoration: "none" }}>
                          {lang === "ko" ? "열기 →" : "Open →"}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 앱 내 결과 */}
              {internalMatches.length > 0 && (
                <div style={{ padding: "8px 0" }}>
                  <div style={{ padding: "4px 16px 8px", fontSize: 10, fontFamily: "Manrope,sans-serif",
                    fontWeight: 700, color: "#94A3B8", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {lang === "ko" ? "앱 내 결과" : "In-App Results"}
                  </div>
                  {internalMatches.slice(0, 5).map((m, i) => (
                    <button key={i} onClick={() => { setActiveNav(m.tab); setShowSearch(false); setSearchQuery(""); }}
                      style={{ width: "100%", textAlign: "left", padding: "10px 16px", border: "none",
                        background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <span style={{ fontSize: 18 }}>{QUICK_MENU.find(qm => qm.tab === m.tab)?.emoji || "📌"}</span>
                      <div>
                        <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 600, fontSize: 14, color: "#1B2A4A" }}>
                          {lang === "ko" ? m.labelKo : m.labelEn}
                        </div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>
                          {lang === "ko" ? "탭으로 이동" : "Go to section"}
                        </div>
                      </div>
                      <span style={{ marginLeft: "auto", color: "#F2994A", fontSize: 16 }}>→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 외부 검색 — 앱 내 결과 없을 때만 강조, 항상 하단에 작게 표시 */}
              <div style={{ padding: q.length > 0 && internalMatches.length === 0 ? "12px 14px 16px" : "8px 14px 12px",
                background: q.length > 0 && internalMatches.length === 0 ? "#FFF8F5" : "transparent",
                borderTop: "1px solid #F1F5F9" }}>
                {q.length > 0 && internalMatches.length === 0 && (
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, color: "#64748B", marginBottom: 10 }}>
                    {lang === "ko" ? `"${searchQuery}" 앱 내 결과가 없어요. 외부에서 찾아볼게요:` : `No results in app for "${searchQuery}". Try:` }
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "9px 10px", borderRadius: 10, textDecoration: "none",
                    background: "#F8FAFC", border: "1px solid #E2E8F0",
                  }}>
                    <span style={{ fontSize: 14 }}>🔍</span>
                    <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#374151" }}>Google</span>
                  </a>
                  <a href={perplexityUrl} target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "9px 10px", borderRadius: 10, textDecoration: "none",
                    background: "#EFF6FF", border: "1px solid #BFDBFE",
                  }}>
                    <span style={{ fontSize: 14 }}>🤖</span>
                    <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#1D4ED8" }}>Perplexity</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PWA 설치 배너 */}
        {showBanner && (
          <InstallBanner onInstall={handleInstall} onDismiss={handleDismiss} />
        )}

        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 72, paddingTop: showBanner ? 72 : 0 }}>
          {screens[Math.min(activeNav, screens.length - 1)]}
        </main>

        {/* 오프라인 배너 */}
        {!isOnline && <OfflineBanner />}

        {/* 공유 모달 */}
        {showChat && <ChatShareModal onClose={() => setShowChat(false)} lang={lang} activeNav={activeNav} />}

        {/* 통역 모달 */}
        {showTranslate && <TranslateModal onClose={() => setShowTranslate(false)} lang={lang}
          onNavigate={(tab) => { setActiveNav(tab); setShowTranslate(false); }} />}

        <BottomNav
          activeIndex={activeNav}
          onChange={setActiveNav}
          onSearchToggle={handleSearchToggle}
          onShareToggle={() => setShowChat(prev => !prev)}
          onTranslateToggle={() => setShowTranslate(prev => !prev)}
        />
      </div>
    </div>
  );
}

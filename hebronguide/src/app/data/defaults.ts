/**
 * defaults.ts — HebronGuide Seattle Default Content Data
 * 마지막 검증: 2026-04-30 | 시애틀지구촌교회 새가족부
 * Used as fallback when server has no data, and as initial data for admin "Initialize" feature.
 */
import type { PlaceItem, StepItem } from "../components/ContentContext";

function pid() { return Math.random().toString(36).slice(2, 10); }

// ─── 교회 ────────────────────────────────────────────────
export const DEFAULT_CHURCHES: PlaceItem[] = [
  { id: pid(), emoji: "⛪", name: "시애틀 연합감리교회", nameEn: "Seattle Korean UMC", desc: "1965년 설립. 시애틀 한인 최초·최대 교회. 다운타운·벨뷰 등 다수 캠퍼스. 새 이민자 정착 상담 프로그램 운영", descEn: "Est. 1965. Oldest & largest Korean church in Seattle. Multiple campuses. Newcomer settlement counseling available", tags: ["감리교", "다운타운", "다세대"], active: true, order: 0 },
  { id: pid(), emoji: "⛪", name: "에베소장로교회", nameEn: "Ephesus Korean Presbyterian", desc: "Lynnwood 한인타운 중심. 청년·가족 중심 활발한 공동체. 한국어·영어 예배. 무료 ESL 수업 운영", descEn: "Heart of Lynnwood Koreatown. Vibrant youth & family community. Free ESL classes offered", tags: ["장로교", "린우드", "청년"], active: true, order: 1 },
  { id: pid(), emoji: "⛪", name: "시애틀 한인침례교회", nameEn: "Seattle Korean Baptist", desc: "Kirkland 소재. 영어권 2세 예배(EBF) 활발. 이민자 정착 지원 프로그램 운영. 한국어 통역 지원", descEn: "Located in Kirkland. Active English worship (EBF). Immigration support programs. Korean interpretation available", tags: ["침례교", "커클랜드", "2세"], active: true, order: 2 },
  { id: pid(), emoji: "⛪", name: "은혜와진리교회", nameEn: "Grace & Truth Church", desc: "Bellevue 소재 청년·유학생 중심 교회. 영어 친화적 환경. 새가족 멘토 연결 프로그램", descEn: "Bellevue. Youth & international student focused. English-friendly. New member mentor program", tags: ["벨뷰", "유학생", "청년"], active: true, order: 3 },
  { id: pid(), emoji: "⛪", name: "연어교회 (Salmon Church)", nameEn: "Salmon Church Seattle", desc: "이민 2·3세 + 유학생 대상 영어 한인 교회. 현대적 예배 스타일. Federal Way 소재", descEn: "English-language Korean church for 2nd-3rd gen & international students. Modern worship. Federal Way", tags: ["영어예배", "2세", "현대"], active: true, order: 4 },
  { id: pid(), emoji: "⛪", name: "시애틀 순복음교회", nameEn: "Seattle Full Gospel Church", desc: "Lynnwood. 새 이민자 생활 상담 운영. 한국어 가능 정착 봉사자 연결 가능", descEn: "Lynnwood. Newcomer life counseling. Can connect with Korean-speaking settlement volunteers", tags: ["순복음", "린우드", "새이민자"], active: true, order: 5 },
];

// ─── 카페 (검증일: 2026-04-30) ───────────────────────────
export const DEFAULT_CAFES: PlaceItem[] = [
  {
    id: pid(), emoji: "☕", name: "K-Cafe Dabang", nameEn: "K-Cafe Dabang — Lynnwood",
    desc: "✅ 검증됨 | 한인타운 한국식 카페. 빙수·크로플·라떼. 📍 3333 184th St SW Ste X, Lynnwood WA 98037 | 📞 (425) 678-8276 | 월-목 8am-9pm, 금 8am-10pm, 토-일 11am-9pm | 🔗 kcafedabang.com",
    descEn: "✅ Verified | Korean-style café. Bingsu, croffles & lattes. 📍 3333 184th St SW Ste X, Lynnwood WA 98037 | 📞 (425) 678-8276 | M-Th 8am-9pm, F 8am-10pm, Sa-Su 11am-9pm | 🔗 kcafedabang.com",
    tags: ["린우드", "빙수", "한국감성"], active: true, order: 0
  },
  {
    id: pid(), emoji: "☕", name: "Ko Hyang Zip 푸드코트", nameEn: "Ko Hyang Zip — H-Mart Food Court",
    desc: "✅ 검증됨 | H-Mart 내 한식 푸드코트. 분식·국밥·덮밥. 📍 3301 184th St SW, Lynnwood WA 98037 | 📞 (425) 582-2691 | 월-금 10am-8pm, 토 10am~",
    descEn: "✅ Verified | Korean food court inside H-Mart. Korean snacks, soups & rice bowls. 📍 3301 184th St SW, Lynnwood WA 98037 | 📞 (425) 582-2691 | M-F 10am-8pm, Sa 10am~",
    tags: ["H-Mart", "분식", "저렴"], active: true, order: 1
  },
  {
    id: pid(), emoji: "🍵", name: "LUMI Dessert Cafe", nameEn: "LUMI Dessert Cafe",
    desc: "한인 디저트 카페. 공식 웹사이트: lumidessertcafe.com | 주소·시간 직접 확인 권장 | 🔗 lumidessertcafe.com",
    descEn: "Korean dessert café. Check official website for address & hours | 🔗 lumidessertcafe.com",
    tags: ["디저트", "카페", "확인중"], active: true, order: 2
  },
  {
    id: pid(), emoji: "☕", name: "시애틀 스페셜티 카페",
    nameEn: "Seattle Specialty Coffee",
    desc: "시애틀은 커피 도시. Starbucks Reserve Roastery (📍 1124 Pike St), Caffe Vita, Victrola 등 스페셜티 카페 다수. 한인 카페 추가 정보 업데이트 예정",
    descEn: "Seattle is a coffee city. Starbucks Reserve Roastery (📍 1124 Pike St), Caffe Vita, Victrola & more. Korean café listings being updated",
    tags: ["스페셜티", "시애틀", "확인중"], active: true, order: 3
  },
];

// ─── 맛집 (검증일: 2026-04-30) ──────────────────────────
export const DEFAULT_RESTAURANTS: PlaceItem[] = [
  {
    id: pid(), emoji: "🥩", name: "Baekjeong Korean BBQ", nameEn: "Baekjeong Korean BBQ — Lynnwood",
    desc: "✅ 검증됨 | 린우드 한인 BBQ 명소. 알더우드몰 내. 📍 3000 184th St SW, Ste 922, Lynnwood WA 98037 | 📞 (425) 490-6328 | 월-목 11:30am-10pm, 금 11:30am-11pm, 토 11am-11pm, 일 11am-10pm | 🔗 baekjeongusa.com",
    descEn: "✅ Verified | Top Korean BBQ in Lynnwood. Inside Alderwood Mall. 📍 3000 184th St SW, Ste 922, Lynnwood WA 98037 | 📞 (425) 490-6328 | M-Th 11:30am-10pm, F 11:30am-11pm, Sa 11am-11pm, Su 11am-10pm | 🔗 baekjeongusa.com",
    tags: ["갈비", "린우드", "BBQ"], active: true, order: 0
  },
  {
    id: pid(), emoji: "🍖", name: "Gangnam Korean Restaurant", nameEn: "Gangnam Korean Restaurant — Lynnwood",
    desc: "✅ 검증됨 | 한인타운 한식 전문. 국밥·두부찌개·비빔밥·파전. 📍 19505 44th Ave W, Lynnwood WA 98036 | 📞 (425) 678-0337 | 매일 10am-10:45pm | 🔗 gangnamlynnwood.com",
    descEn: "✅ Verified | Korean food specialist in Koreatown. Soup, tofu stew, bibimbap & pajeon. 📍 19505 44th Ave W, Lynnwood WA 98036 | 📞 (425) 678-0337 | Daily 10am-10:45pm | 🔗 gangnamlynnwood.com",
    tags: ["한식", "린우드", "국밥"], active: true, order: 1
  },
  {
    id: pid(), emoji: "🍱", name: "Ko Hyang Zip (H-Mart 푸드코트)", nameEn: "Ko Hyang Zip — H-Mart Food Court",
    desc: "✅ 검증됨 | H-Mart 내 한식 푸드코트. 분식·덮밥·간편식. 📍 3301 184th St SW, Lynnwood WA 98037 | 📞 (425) 582-2691 | 월-금 10am-8pm, 토 10am~",
    descEn: "✅ Verified | Korean food court inside H-Mart. Korean snacks, rice bowls & light meals. 📍 3301 184th St SW, Lynnwood WA 98037 | 📞 (425) 582-2691 | M-F 10am-8pm, Sa 10am~",
    tags: ["H-Mart", "분식", "저렴"], active: true, order: 2
  },
  {
    id: pid(), emoji: "🍗", name: "소담치킨 숄라인",
    nameEn: "Sodam Chicken — Shoreline",
    desc: "✅ 검증됨 | 출처: WowSeattle 업소록 | 한인 치킨 전문. 📍 17551 15th Ave NE, Shoreline WA 98155 | 📞 (206) 397-4119",
    descEn: "✅ Verified | Source: WowSeattle directory | Korean fried chicken. 📍 17551 15th Ave NE, Shoreline WA 98155 | 📞 (206) 397-4119",
    tags: ["치킨", "숄라인", "한식"], active: true, order: 3
  },
  {
    id: pid(), emoji: "🥩", name: "해남갈비 숄라인",
    nameEn: "Haenam Galbi — Shoreline",
    desc: "✅ 검증됨 | 출처: WowSeattle 업소록 | 한인 갈비 전문. 📍 15001 Aurora Ave N, Shoreline WA 98133 | 📞 (206) 367-7843",
    descEn: "✅ Verified | Source: WowSeattle directory | Korean galbi specialist. 📍 15001 Aurora Ave N, Shoreline WA 98133 | 📞 (206) 367-7843",
    tags: ["갈비", "숄라인", "한식"], active: true, order: 4
  },
  {
    id: pid(), emoji: "🍽️", name: "Ka Won Korean BBQ", nameEn: "Ka Won Korean BBQ — Lynnwood",
    desc: "✅ 주소 검증됨 | 📍 15004 Hwy 99, Ste A, Lynnwood WA 98087 | 📞 (425) 787-6484 | 공식 웹사이트: kawonlynnwood.com | 🔗 kawonlynnwood.com",
    descEn: "✅ Address verified | 📍 15004 Hwy 99, Ste A, Lynnwood WA 98087 | 📞 (425) 787-6484 | 🔗 kawonlynnwood.com",
    tags: ["BBQ", "린우드", "갈비"], active: true, order: 4
  },
];

// ─── 비즈니스·생활 (검증일: 2026-04-30) ─────────────────
// 출처: WowSeattle 업소록, kSeattle 업소록, SeattleN, 공식 웹사이트
export const DEFAULT_BUSINESSES: PlaceItem[] = [
  {
    id: pid(), emoji: "🏪", name: "H-Mart Lynnwood",
    nameEn: "H-Mart — Korean Supermarket",
    desc: "✅ 검증됨 | 출처: hmartus.com | 시애틀 최대 한인 슈퍼마켓. 📍 3301 184th St SW, Lynnwood WA 98037 | 📞 (425) 776-0858 | 매일 8am-9:30pm | 한식 푸드코트 포함 | 🔗 hmartus.com/lynnwood",
    descEn: "✅ Verified | Source: hmartus.com | Largest Korean supermarket. 📍 3301 184th St SW, Lynnwood WA 98037 | 📞 (425) 776-0858 | Daily 8am-9:30pm | Korean food court included | 🔗 hmartus.com/lynnwood",
    tags: ["마트", "린우드", "식재료"], active: true, order: 0
  },
  {
    id: pid(), emoji: "🏦", name: "UniBank (유니뱅크)",
    nameEn: "UniBank — Korean-American Bank",
    desc: "✅ 검증됨 | 출처: SeattleN 광고·unibankusa.com | 한국계 은행. Lynnwood 지점: 📍 19315 Highway 99, Lynnwood WA 98036 | 📞 (425) 275-9700 | 🔗 unibankusa.com",
    descEn: "✅ Verified | Source: SeattleN ad & unibankusa.com | Korean-American bank. Lynnwood: 📍 19315 Highway 99, Lynnwood WA 98036 | 📞 (425) 275-9700 | 🔗 unibankusa.com",
    tags: ["은행", "한국어", "린우드"], active: true, order: 1
  },
  {
    id: pid(), emoji: "🏥", name: "천진 한의원",
    nameEn: "Chunjin Oriental Medicine — Federal Way",
    desc: "✅ 검증됨 | 출처: WowSeattle 업소록 | 침술·한약 전문. 📍 31830 Pacific Hwy S #B, Federal Way WA 98003 | 📞 (253) 874-0058",
    descEn: "✅ Verified | Source: WowSeattle directory | Acupuncture & herbal medicine. 📍 31830 Pacific Hwy S #B, Federal Way WA 98003 | 📞 (253) 874-0058",
    tags: ["한의원", "페더럴웨이", "침술"], active: true, order: 2
  },
  {
    id: pid(), emoji: "🦷", name: "켄트 임플란트 구강외과",
    nameEn: "Kent Implant Oral Surgery",
    desc: "✅ 검증됨 | 출처: WowSeattle 업소록 | 임플란트 전문 구강외과. 📍 306 Washington Ave S, Kent WA 98032 | 📞 (253) 981-3816",
    descEn: "✅ Verified | Source: WowSeattle directory | Implant specialist. 📍 306 Washington Ave S, Kent WA 98032 | 📞 (253) 981-3816",
    tags: ["치과", "임플란트", "켄트"], active: true, order: 3
  },
  {
    id: pid(), emoji: "🦷", name: "김찬배 치과",
    nameEn: "Kim Chanbae Dental",
    desc: "출처: kSeattle 업소록 광고 확인 | 상세 주소·전화 직접 확인 권장 | 🔗 kseattle.com/업소록",
    descEn: "Source: kSeattle directory ad confirmed | Please verify address & phone directly | 🔗 kseattle.com",
    tags: ["치과", "한국어", "확인중"], active: true, order: 4
  },
  {
    id: pid(), emoji: "✂️", name: "엠마 스킨케어",
    nameEn: "Emma Skincare — Lynnwood",
    desc: "✅ 검증됨 | 출처: WowSeattle 업소록 | 한인 스킨케어·에스테틱. 📍 17424 Hwy 99 #B-204, Lynnwood WA 98037 | 📞 (425) 525-9955",
    descEn: "✅ Verified | Source: WowSeattle directory | Korean skincare & aesthetics. 📍 17424 Hwy 99 #B-204, Lynnwood WA 98037 | 📞 (425) 525-9955",
    tags: ["스킨케어", "린우드", "미용"], active: true, order: 5
  },
  {
    id: pid(), emoji: "🛡️", name: "조선용 보험",
    nameEn: "Jo Seonyong Insurance — Lynnwood",
    desc: "✅ 검증됨 | 출처: WowSeattle 업소록 | 한인 보험 전문. 📍 4713 168th St SW #103, Lynnwood WA 98037 | 📞 (425) 951-9210",
    descEn: "✅ Verified | Source: WowSeattle directory | Korean insurance specialist. 📍 4713 168th St SW #103, Lynnwood WA 98037 | 📞 (425) 951-9210",
    tags: ["보험", "린우드", "한국어"], active: true, order: 6
  },
  {
    id: pid(), emoji: "⚖️", name: "이민 법무사·변호사",
    nameEn: "Immigration Attorney",
    desc: "비자·영주권·시민권 전문. Lynnwood 한인타운 내 다수. 첫 상담 무료인 곳 있음. 개별 업체 정보: kseattle.com 업소록 | wowseattle.com 참조",
    descEn: "Visa, green card & citizenship specialists. Multiple in Lynnwood Koreatown. Some offer free first consult. Individual listings: kseattle.com | wowseattle.com",
    tags: ["이민", "변호사", "비자"], active: true, order: 7
  },
  {
    id: pid(), emoji: "🔑", name: "한인 부동산",
    nameEn: "Korean Real Estate",
    desc: "WowSeattle 검증 | 백수경 (Skyline): 📞 (206) 334-5454 | 박나리 (WeLakeside): 📞 (425) 246-1453 | 📍 800 Bellevue Way NE #500, Bellevue | 기타: wowseattle.com/businesses 참조",
    descEn: "WowSeattle verified | Baik Sukyung (Skyline): 📞 (206) 334-5454 | Park Nari (WeLakeside): 📞 (425) 246-1453 | 📍 800 Bellevue Way NE #500, Bellevue | More: wowseattle.com/businesses",
    tags: ["부동산", "렌탈", "한국어"], active: true, order: 8
  },
];

// ─── 쇼핑 ────────────────────────────────────────────────
export const DEFAULT_SHOPPING: PlaceItem[] = [
  { id: pid(), emoji: "🛒", name: "H-Mart + 갤러리아", nameEn: "H-Mart + Galleria — Lynnwood", desc: "H-Mart 옆 갤러리아 쇼핑몰. 한국 브랜드 의류·잡화·미용용품. 한인 마켓 원스톱", descEn: "Galleria mall next to H-Mart. Korean brand clothing, accessories & beauty. One-stop Korean market", tags: ["갤러리아", "한국브랜드", "쇼핑몰"], active: true, order: 0 },
  { id: pid(), emoji: "💄", name: "K-Beauty 스토어", nameEn: "K-Beauty Store", desc: "TONYMOLY·이니스프리·클리오 미국 판매점. Lynnwood·Bellevue Square 소재", descEn: "TONYMOLY, Innisfree, CLIO USA stores. Lynnwood & Bellevue Square locations", tags: ["뷰티", "K-Beauty", "스킨케어"], active: true, order: 1 },
  { id: pid(), emoji: "📚", name: "한국 서적·문화용품", nameEn: "Korean Books & Stationery", desc: "한국 잡지·도서·문구. H-Mart 내 한국 서적 코너. 한국 도서 주문 가능", descEn: "Korean magazines, books & stationery. Korean book section inside H-Mart. Special orders available", tags: ["서점", "문구", "도서"], active: true, order: 2 },
  { id: pid(), emoji: "🧴", name: "한국 반찬·김치 전문점", nameEn: "Korean Banchan & Kimchi Shop", desc: "H-Mart 외 소규모 반찬·김치·떡 전문점. 린우드·페더럴웨이 소재. 당일 제조 신선", descEn: "Small-batch kimchi, banchan & tteok specialty shops beyond H-Mart. Fresh daily. Lynnwood & Federal Way", tags: ["반찬", "김치", "신선"], active: true, order: 3 },
];

// ─── 거주 지역 ────────────────────────────────────────────
export const DEFAULT_AREAS: PlaceItem[] = [
  { id: pid(), emoji: "🌲", name: "린우드 (Lynnwood)", nameEn: "Lynnwood — Korean Town Hub", desc: "시애틀 최대 한인타운. H-Mart·한식당·교회·한인 병원 밀집. 한인 정착 1순위 지역. 렌트 $1,800-2,500/월", descEn: "Seattle's largest Koreatown. H-Mart, Korean restaurants, churches & clinics. Top choice. Rent $1,800-2,500/mo", tags: ["한인타운", "H-Mart", "추천"], active: true, order: 0 },
  { id: pid(), emoji: "💼", name: "벨뷰 (Bellevue)", nameEn: "Bellevue — Tech & Affluent", desc: "Microsoft·Amazon 직원 다수 거주. 우수한 학군 (Bellevue SD). 렌트 $2,500-4,000/월. 한인 인구 증가 중", descEn: "Many Microsoft & Amazon employees. Top schools (Bellevue SD). Rent $2,500-4,000/mo. Growing Korean community", tags: ["직장인", "학군", "테크"], active: true, order: 1 },
  { id: pid(), emoji: "🌊", name: "페더럴웨이 (Federal Way)", nameEn: "Federal Way — Affordable Korean Area", desc: "렌트 상대적 저렴 $1,500-2,200/월. 한인 인구 많음. I-5 접근성 좋음. H-Mart·한식당·교회 다수", descEn: "More affordable rent $1,500-2,200/mo. Large Korean population. Good I-5 access. Many Korean amenities", tags: ["저렴", "한인", "I-5"], active: true, order: 2 },
  { id: pid(), emoji: "🏙️", name: "오번 (Auburn)", nameEn: "Auburn — Korean Community Growing", desc: "페더럴웨이 남쪽. 신흥 한인 밀집 지역. 렌트 $1,400-2,000/월. 한국 마트·교회 증가 중", descEn: "South of Federal Way. Growing Korean community. Rent $1,400-2,000/mo. More Korean stores & churches", tags: ["오번", "성장", "가성비"], active: true, order: 3 },
  { id: pid(), emoji: "🎓", name: "대학지구 (University District)", nameEn: "U-District — Student Area", desc: "UW 인근. 유학생·대학원생 多. 한국 식당·카페 집중. 링크 라이트레일 접근 최고. 렌트 $1,600-2,400/월", descEn: "Near UW. Many Korean students & grad students. Link light rail access. Rent $1,600-2,400/mo", tags: ["유학생", "UW", "교통"], active: true, order: 4 },
  { id: pid(), emoji: "🏝️", name: "커클랜드 (Kirkland)", nameEn: "Kirkland — Lakeside Living", desc: "워싱턴 호수변. 가족 친화적. 한인 교회 다수. 구글 오피스 인근. 렌트 $2,200-3,200/월", descEn: "Lakeside living. Family-friendly. Multiple Korean churches. Near Google office. Rent $2,200-3,200/mo", tags: ["커클랜드", "가족", "호수"], active: true, order: 5 },
];

// ─── 자연·여행 ────────────────────────────────────────────
export const DEFAULT_NATURE: PlaceItem[] = [
  { id: pid(), emoji: "🏔️", name: "레이니어산 국립공원", nameEn: "Mt. Rainier National Park", desc: "시애틀 상징 화산. 여름 트레킹·겨울 스키. Paradise 전망대 꼭 방문. 차로 1.5-2시간. 입장료 $30/차", descEn: "Seattle's iconic volcano. Summer hiking & winter skiing. Must visit Paradise viewpoint. 1.5-2hrs drive. $30/car", tags: ["트레킹", "국립공원", "당일치기"], active: true, order: 0 },
  { id: pid(), emoji: "💧", name: "스노퀄미 폭포", nameEn: "Snoqualmie Falls", desc: "Twin Peaks 촬영지. 시애틀 동쪽 30분. 폭포+카페+산책로 조합 최고. 무료 입장", descEn: "Twin Peaks filming location. 30min east of Seattle. Waterfall + café + trail combo. Free admission", tags: ["폭포", "30분", "무료"], active: true, order: 1 },
  { id: pid(), emoji: "🌊", name: "올림픽 반도", nameEn: "Olympic Peninsula", desc: "우림·빙하·해안 세 가지 다 있음. 포트엔젤레스 경유 페리. 1박 2일 권장. 국립공원 패스 사용 가능", descEn: "Rainforest, glaciers & coastline. Ferry via Port Angeles. Recommend overnight. National Park Pass accepted", tags: ["우림", "페리", "1박"], active: true, order: 2 },
  { id: pid(), emoji: "🌺", name: "스카짓 밸리 튤립 축제", nameEn: "Skagit Valley Tulip Festival", desc: "매년 4월. 시애틀 북쪽 1시간. 10만 평 튤립 밭. 사진 명소. 주차 $10-15", descEn: "Every April. 1hr north of Seattle. Massive tulip fields. Photo opportunities. Parking $10-15", tags: ["4월", "튤립", "사진"], active: true, order: 3 },
  { id: pid(), emoji: "⛷️", name: "스노퀄미 패스 스키장", nameEn: "Snoqualmie Pass Ski Resort", desc: "시애틀 동쪽 1시간 스키장. 초·중급 코스 풍부. 한인 스키클럽 연계 가능. 시즌권 $500-700", descEn: "1hr east. Good beginner-intermediate runs. Korean ski clubs available. Season pass $500-700", tags: ["스키", "1시간", "겨울"], active: true, order: 4 },
];

// ─── 문화·관광 ────────────────────────────────────────────
export const DEFAULT_CULTURE: PlaceItem[] = [
  { id: pid(), emoji: "🎨", name: "시애틀 미술관 (SAM)", nameEn: "Seattle Art Museum (SAM)", desc: "다운타운. 아시아·원주민·현대 미술. 매월 첫째 목요일 무료. 입장료 $24.95", descEn: "Downtown. Asian, Native American & modern art. Free first Thursday monthly. Admission $24.95", tags: ["미술관", "다운타운", "무료일"], active: true, order: 0 },
  { id: pid(), emoji: "🎭", name: "파이크 플레이스 마켓", nameEn: "Pike Place Market", desc: "시애틀 상징 재래시장. 생선 던지기 쇼·꽃·신선 해산물. 오전 방문 권장. 지하 1937 상점도 볼거리", descEn: "Seattle's iconic public market. Fish toss, flowers, fresh seafood. Visit in the morning. Underground shops too", tags: ["관광", "시장", "필수"], active: true, order: 1 },
  { id: pid(), emoji: "🚀", name: "스페이스 니들", nameEn: "Space Needle", desc: "시애틀 랜드마크. 유리 전망대+회전 레스토랑. 사전 예약 권장. 입장료 $37. 야경 최고", descEn: "Seattle landmark. Glass observatory + revolving restaurant. Pre-book recommended. Admission $37. Best night view", tags: ["랜드마크", "전망대", "야경"], active: true, order: 2 },
  { id: pid(), emoji: "🌸", name: "치훌리 정원", nameEn: "Chihuly Garden and Glass", desc: "스페이스니들 옆 유리 공예 미술관. 인스타 최강. 입장료 $32. 스페이스니들 콤보 $60", descEn: "Glass art museum next to Space Needle. Instagram top spot. Admission $32. Combo with Space Needle $60", tags: ["유리공예", "인스타", "스페이스니들"], active: true, order: 3 },
  { id: pid(), emoji: "🌿", name: "워싱턴 파크 식물원", nameEn: "Washington Park Arboretum", desc: "UW 인근. 벚꽃(4월)·단풍(10-11월) 명소. 무료 입장. 가족 피크닉 최적. 주차 무료", descEn: "Near UW. Cherry blossoms (April) & fall foliage (Oct-Nov). Free. Perfect for family picnics. Free parking", tags: ["벚꽃", "무료", "가족"], active: true, order: 4 },
];

// ─── 스포츠 ────────────────────────────────────────────────
export const DEFAULT_SPORTS: PlaceItem[] = [
  { id: pid(), emoji: "⚾", name: "시애틀 매리너스", nameEn: "Seattle Mariners (MLB)", desc: "MLB 야구팀. T-Mobile Park 다운타운. 한인 팬 많음. 외야석 $20부터. Korean Heritage Night 있음", descEn: "MLB baseball at T-Mobile Park downtown. Large Korean fan base. Outfield $20+. Korean Heritage Night held", tags: ["야구", "MLB", "다운타운"], active: true, order: 0 },
  { id: pid(), emoji: "🏈", name: "시애틀 씨호크스", nameEn: "Seattle Seahawks (NFL)", desc: "NFL 미식축구. Lumen Field. 12번째 선수(12th Man) 응원 문화 유명. 티켓 $80부터", descEn: "NFL football at Lumen Field. Famous '12th Man' fan culture. Tickets from $80", tags: ["미식축구", "NFL", "루멘필드"], active: true, order: 1 },
  { id: pid(), emoji: "⛳", name: "한인 골프 모임", nameEn: "Korean Golf Groups", desc: "한인 골프 클럽 다수 활동. 에베레트·켄트 퍼블릭 골프장 이용. 그린피 $35-60. 카카오 단톡방 활성", descEn: "Many Korean golf clubs. Public courses in Everett & Kent. Green fee $35-60. Active KakaoTalk groups", tags: ["골프", "한인모임", "퍼블릭"], active: true, order: 2 },
  { id: pid(), emoji: "🏸", name: "한인 배드민턴 클럽", nameEn: "Korean Badminton Club", desc: "린우드·페더럴웨이·커클랜드 레크 센터. 주말 아침 모임. 회비 $20/월. 초보 환영", descEn: "Lynnwood, Federal Way & Kirkland rec centers. Weekend morning. $20/month membership. Beginners welcome", tags: ["배드민턴", "주말", "운동"], active: true, order: 3 },
  { id: pid(), emoji: "⚽", name: "한인 축구·농구 리그", nameEn: "Korean Soccer & Basketball League", desc: "커뮤니티 연합 한인 스포츠 리그. 봄·가을 시즌. 한인 커뮤니티 네트워킹 최고. 참가비 $50/시즌", descEn: "Korean community sports leagues. Spring & fall seasons. Best community networking. $50/season", tags: ["축구", "네트워킹", "계절"], active: true, order: 4 },
];

// ─── 커뮤니티 (검증일: 2026-04-30) ───────────────────────
export const DEFAULT_COMMUNITY: PlaceItem[] = [
  {
    id: pid(), emoji: "💬", name: "카카오오픈채팅 — 시애틀한인",
    nameEn: "KakaoTalk Open Chat — 시애틀한인",
    desc: "시애틀 한인 최대 커뮤니티 채팅방. 정착 질문·중고거래·구인 실시간 소통. 카카오 앱 → 오픈채팅 → '시애틀한인' 검색",
    descEn: "Largest Korean Seattle community chat. Settlement Q&A, used goods, job postings. KakaoTalk app → Open Chat → search '시애틀한인'",
    tags: ["카카오", "실시간", "커뮤니티"], active: true, order: 0
  },
  {
    id: pid(), emoji: "🏛️", name: "광역시애틀한인회",
    nameEn: "Greater Seattle Korean Association",
    desc: "✅ 검증됨 | 1967년 설립. 공식 한인 단체. 📍 14001 57th Ave S #100, Seattle WA 98168 | 📞 (425) 286-8768 | 🔗 seattle-ka.org",
    descEn: "✅ Verified | Est. 1967. Official Korean community org. 📍 14001 57th Ave S #100, Seattle WA 98168 | 📞 (425) 286-8768 | 🔗 seattle-ka.org",
    tags: ["공식", "한인회", "이벤트"], active: true, order: 1
  },
  {
    id: pid(), emoji: "🏴", name: "주 시애틀 대한민국 총영사관",
    nameEn: "Korean Consulate General — Seattle",
    desc: "✅ 검증됨 | 📍 115 W Mercer St, Seattle WA 98119 | 📞 (206) 441-1011 | 월-금 8:30am-4:30pm | 여권 전용 📞 (206) 947-8293 | 🔗 mofa.go.kr/us-seattle-en",
    descEn: "✅ Verified | 📍 115 W Mercer St, Seattle WA 98119 | 📞 (206) 441-1011 | M-F 8:30am-4:30pm | Passport: 📞 (206) 947-8293 | 🔗 mofa.go.kr/us-seattle-en",
    tags: ["영사관", "여권", "공증"], active: true, order: 2
  },
  {
    id: pid(), emoji: "📰", name: "미주 한국일보 시애틀판",
    nameEn: "Korea Times Seattle",
    desc: "시애틀 한인 지역 소식·구인광고·부동산·커뮤니티 정보 | 🔗 koreatimes.com",
    descEn: "Seattle Korean community news, job listings, real estate & community info | 🔗 koreatimes.com",
    tags: ["신문", "뉴스", "구인"], active: true, order: 3
  },
  {
    id: pid(), emoji: "👩‍💻", name: "네이버 카페 — 시애틀한인생활",
    nameEn: "Naver Café — Seattle Korean Life",
    desc: "정착 경험담·질문·정보 공유. 네이버 검색: '시애틀한인생활' | 🔗 cafe.naver.com 검색",
    descEn: "Settlement experiences, Q&A & info sharing. Search Naver: '시애틀한인생활' | 🔗 Search cafe.naver.com",
    tags: ["네이버", "정보", "경험담"], active: true, order: 4
  },
];

// ─── 링크·자원 (검증일: 2026-04-30 / 공식 사이트 기준) ──
export const DEFAULT_LINKS: PlaceItem[] = [
  {
    id: pid(), emoji: "🏥", name: "WA Apple Health (무료 의료보험)",
    nameEn: "WA Apple Health — Free Health Insurance",
    desc: "✅ 공식 사이트 | 저소득층 무료 건강보험 (Medicaid). 신청 후 1-2주 내 카드 수령 | 📞 1-855-923-4633 | 한국어 통역 가능 | 🔗 wahealthplanfinder.org",
    descEn: "✅ Official site | Free health insurance for low-income (Medicaid). Card arrives 1-2 weeks after approval | 📞 1-855-923-4633 | Korean interpreter available | 🔗 wahealthplanfinder.org",
    tags: ["보험", "무료", "의료"], active: true, order: 0
  },
  {
    id: pid(), emoji: "🚌", name: "ORCA 카드 (대중교통 통합 카드)",
    nameEn: "ORCA Card — All-in-One Transit Pass",
    desc: "✅ 검증됨 | 버스·링크·페리 통합 카드. 카드 발급비 $3.00. 온라인·Link역 자판기·H-Mart 서비스 데스크에서 구매. 2026년부터 신용카드 직접 탭 가능 | 🔗 myorca.com",
    descEn: "✅ Verified | Bus, Link & ferry all-in-one card. Card fee $3.00. Buy online, at Link station vending machines, or H-Mart service desk. Credit card tap-to-pay available from 2026 | 🔗 myorca.com",
    tags: ["대중교통", "버스", "링크"], active: true, order: 1
  },
  {
    id: pid(), emoji: "💼", name: "WorkSource 에버렛 (취업 지원)",
    nameEn: "WorkSource Everett — Free Job Center",
    desc: "✅ 검증됨 | 린우드 지점 폐점 → 에버렛 이전. 📍 728 134th St SW, Ste 102, Everett WA 98204 | 📞 (425) 258-6300 | 월-화-수-금 8am-5pm, 목 9am-5pm | 이력서·면접 코칭 무료 | 🔗 worksourcewa.com",
    descEn: "✅ Verified | Lynnwood location closed → moved to Everett. 📍 728 134th St SW, Ste 102, Everett WA 98204 | 📞 (425) 258-6300 | M-Tu-W-F 8am-5pm, Th 9am-5pm | Free resume & interview coaching | 🔗 worksourcewa.com",
    tags: ["취업", "무료", "이력서"], active: true, order: 2
  },
  {
    id: pid(), emoji: "🤝", name: "한인생활상담소 (KCSC)",
    nameEn: "Korean Community Service Center — KCSC",
    desc: "✅ 검증됨 | 정착·생활 상담 전문. 📍 22727 Hwy 99 Ste 212, Edmonds WA 98026 | 📞 (425) 776-2400 | 월-금 9:30am-4:30pm | 전화 예약 후 방문 | 🔗 kcsc-seattle.org",
    descEn: "✅ Verified | Settlement & life counseling specialists. 📍 22727 Hwy 99 Ste 212, Edmonds WA 98026 | 📞 (425) 776-2400 | M-F 9:30am-4:30pm | Call to schedule appointment | 🔗 kcsc-seattle.org",
    tags: ["상담", "정착", "한국어"], active: true, order: 3
  },
  {
    id: pid(), emoji: "🏫", name: "공립학교 등록",
    nameEn: "Public School Enrollment",
    desc: "✅ 공식 사이트 | 시애틀: 🔗 seattleschools.org | 에드먼즈(린우드): 🔗 edmonds.wednet.edu | 벨뷰: 🔗 bsd405.org | 한국어 통역 요청 가능",
    descEn: "✅ Official sites | Seattle: 🔗 seattleschools.org | Edmonds (Lynnwood): 🔗 edmonds.wednet.edu | Bellevue: 🔗 bsd405.org | Korean interpretation available on request",
    tags: ["학교", "공립", "무료"], active: true, order: 3
  },
  {
    id: pid(), emoji: "⚖️", name: "무료 법률 지원 (KCBA)",
    nameEn: "Free Legal Aid — KCBA",
    desc: "✅ 검증됨 | 📍 1200 Fifth Ave, Ste 700, Seattle WA 98101 | 📞 (206) 267-7100 | 이민·고용·집주인 분쟁 무료 상담. 한국어 가능 변호사 연결 | 🔗 kcba.org/For-the-Public/Free-Legal-Assistance",
    descEn: "✅ Verified | 📍 1200 Fifth Ave, Ste 700, Seattle WA 98101 | 📞 (206) 267-7100 | Free immigration, employment & landlord dispute consultations. Korean-speaking attorneys available | 🔗 kcba.org/For-the-Public/Free-Legal-Assistance",
    tags: ["법률", "무료", "이민"], active: true, order: 5
  },
  {
    id: pid(), emoji: "🌐", name: "WA DSHS (복지·식품지원)",
    nameEn: "WA DSHS — Benefits & Food Assistance",
    desc: "✅ 공식 사이트 | SNAP(식품지원)·현금보조·주거지원 | 📞 1-877-501-2233 | 한국어 통역 가능 | 🔗 dshs.wa.gov",
    descEn: "✅ Official site | SNAP (food stamps), cash assistance & housing support | 📞 1-877-501-2233 | Korean available | 🔗 dshs.wa.gov",
    tags: ["복지", "식품", "지원"], active: true, order: 5
  },
  {
    id: pid(), emoji: "📞", name: "King County 2-1-1 (생활 서비스 연결)",
    nameEn: "King County 2-1-1 — Community Resource Line",
    desc: "✅ 공식 서비스 | 💡 한인사회에 덜 알려진 자원 | 무료 전화 한 통으로 주거·식품·의료·취업 등 지역 서비스 연결. 한국어 통역 가능 | 📞 211 (무료) | 🔗 uwkc.org/211",
    descEn: "✅ Official service | 💡 Under-known in Korean community | One free call connects you to housing, food, medical & job services in King County. Korean interpreter available | 📞 211 (free) | 🔗 uwkc.org/211",
    tags: ["무료", "211", "생활지원"], active: true, order: 6
  },
  {
    id: pid(), emoji: "💰", name: "VITA 무료 세금 신고",
    nameEn: "VITA — Free Tax Preparation",
    desc: "✅ 공식 프로그램 | 💡 한인사회에 덜 알려진 자원 | IRS 공인 무료 세금신고 서비스. 매년 1월-4월. 소득 $67,000 이하 대상. 한국어 가능 자원봉사자 있는 센터 별도 문의 | 🔗 irs.gov/vita",
    descEn: "✅ Official IRS program | 💡 Under-known in Korean community | Free tax preparation by IRS-certified volunteers. Jan-April annually. Income under $67,000. Ask for Korean-speaking volunteer | 🔗 irs.gov/vita",
    tags: ["세금", "무료", "IRS"], active: true, order: 7
  },
  {
    id: pid(), emoji: "🏠", name: "Northwest Justice Project (무료 법률)",
    nameEn: "Northwest Justice Project — Free Legal Aid",
    desc: "✅ 공식 사이트 | 💡 한인사회에 덜 알려진 자원 | 저소득층 무료 법률 서비스. 주거·이민·가정법·소비자 보호. 한국어 통역 가능 | 📞 1-888-201-1014 | 🔗 nwjustice.org",
    descEn: "✅ Official site | 💡 Under-known in Korean community | Free legal services for low-income. Housing, immigration, family law & consumer protection. Korean interpreter | 📞 1-888-201-1014 | 🔗 nwjustice.org",
    tags: ["법률", "무료", "주거"], active: true, order: 8
  },
];

// ═══════════════════════════════════════════════════════════
// 정착 가이드 — 단계별 체크리스트
// ═══════════════════════════════════════════════════════════

// ─── Day 0-3: 공항 도착 직후 ──────────────────────────────
export const DEFAULT_SETTLE_DAY1: StepItem[] = [
  {
    id: pid(),
    title: "공항 → 숙소 이동",
    titleEn: "Airport → Accommodation",
    desc: "SeaTac 공항 도착. Link Light Rail: $3.25, 다운타운 35분. Lyft/Uber 추천 ($35-55). 한인 픽업 서비스: 카카오오픈채팅 '시애틀한인' 문의",
    descEn: "SeaTac Airport arrival. Link Light Rail: $3.25, 35min to downtown. Lyft/Uber recommended ($35-55). Korean pickup service: Ask in KakaoTalk '시애틀한인'",
    active: true, order: 0
  },
  {
    id: pid(),
    title: "SIM 카드 개통",
    titleEn: "Activate SIM Card",
    desc: "공항 3층 T-Mobile 매장 (7am-10pm). 추천: T-Mobile Prepaid $30/월 (무제한 문자+통화+5GB 데이터). 장기: Mint Mobile $15/월 (3개월 선불). 여권만으로 개통 가능",
    descEn: "T-Mobile store on Level 3 (7am-10pm). Recommended: T-Mobile Prepaid $30/mo (unlimited text+call+5GB). Long-term: Mint Mobile $15/mo (3-month prepaid). Passport only required",
    active: true, order: 1
  },
  {
    id: pid(),
    title: "임시 숙소 체크인",
    titleEn: "Check into temporary housing",
    desc: "한인 민박 추천 (카카오 '시애틀한인' 검색). Airbnb Lynnwood/Federal Way 한인 호스트 선호. 단기 가구포함 렌탈: Furnished Finder 사이트. 1주~1개월 $800-1,500",
    descEn: "Korean homestay recommended (search KakaoTalk '시애틀한인'). Prefer Korean hosts on Airbnb in Lynnwood/Federal Way. Short-term furnished rental: Furnished Finder. 1wk-1mo $800-1,500",
    active: true, order: 2
  },
  {
    id: pid(),
    title: "H-Mart 첫 장보기",
    titleEn: "First grocery run at H-Mart",
    desc: "4501 198th St SW, Lynnwood (9am-9pm). 밥·반찬·라면·간식 등 기본 장보기. 조리도구·침구류도 판매. 예산 $50-100. 한국어 직원 있음",
    descEn: "4501 198th St SW, Lynnwood (9am-9pm). Stock up on rice, banchan, ramen & snacks. Cookware & bedding also available. Budget $50-100. Korean-speaking staff available",
    active: true, order: 3
  },
  {
    id: pid(),
    title: "카카오 커뮤니티 합류",
    titleEn: "Join Korean community chat",
    desc: "카카오오픈채팅 '시애틀한인' 검색 → 입장. 정착 질문, 중고물품, 급구·구인 실시간 소통. 첫 질문 올려도 환영받는 분위기",
    descEn: "Search KakaoTalk Open Chat '시애틀한인' → join. Settlement Q&A, used items, job listings in real time. First-time questions are always welcome",
    active: true, order: 4
  },
];

// ─── 1주차 정착 필수 ──────────────────────────────────────
export const DEFAULT_SETTLE_WEEK1: StepItem[] = [
  {
    id: pid(),
    title: "임시 거주지 확보",
    titleEn: "Secure temporary housing",
    desc: "한인 민박·에어비앤비·단기 렌탈. H-Mart·Lynnwood 한인타운 인근 권장. 예산 $800-1,500/주. Furnished Finder 앱도 유용",
    descEn: "Korean homestay, Airbnb, or short-term rental. Near H-Mart or Lynnwood Koreatown recommended. Budget $800-1,500/wk. Furnished Finder app also useful",
    active: true, order: 0
  },
  {
    id: pid(),
    title: "휴대폰 개통",
    titleEn: "Activate phone/SIM",
    desc: "T-Mobile $30/월 선불 (추천). Mint Mobile $15/월 (온라인 구매). AT&T $25/월. 여권+비자로 개통 가능. 주민등록번호 불필요",
    descEn: "T-Mobile $30/mo prepaid (recommended). Mint Mobile $15/mo (online). AT&T $25/mo. Passport + visa sufficient. No SSN required",
    active: true, order: 1
  },
  {
    id: pid(),
    title: "은행 계좌 개설",
    titleEn: "Open bank account",
    desc: "Chase: 여권+주소증명. Wells Fargo: 여권+비자. Bank of America: 여권+비자. 계좌 개설 보너스 $200-500 이벤트 수시 확인. 체크카드 즉시 발급. 한국어 직원: Bellevue·Lynnwood 지점 일부",
    descEn: "Chase: passport+address proof. Wells Fargo: passport+visa. Bank of America: passport+visa. Check for $200-500 opening bonus offers. Debit card issued same day. Korean staff at select Bellevue & Lynnwood branches",
    active: true, order: 2
  },
  {
    id: pid(),
    title: "SSN 신청 (해당자)",
    titleEn: "Apply for SSN (if eligible)",
    desc: "취업비자 소지자: 입국 10일 후 신청 가능. SSA 오피스 📍 2201 6th Ave, Seattle | 📞 800-772-1213 | 월-금 9am-4pm. 여권+I-94+비자 지참. 소요 3-4주",
    descEn: "Work visa holders: eligible 10 days after arrival. SSA Office 📍 2201 6th Ave, Seattle | 📞 800-772-1213 | M-F 9am-4pm. Bring passport+I-94+visa. Takes 3-4 weeks",
    active: true, order: 3
  },
  {
    id: pid(),
    title: "한인 커뮤니티 연결",
    titleEn: "Connect to Korean community",
    desc: "① 카카오오픈채팅 '시애틀한인' ② H-Mart 커뮤니티 게시판 ③ 한인 교회 주일 방문 ④ 네이버카페 '시애틀한인생활' 가입",
    descEn: "① KakaoTalk '시애틀한인' ② H-Mart community board ③ Visit a Korean church Sunday ④ Join Naver Café '시애틀한인생활'",
    active: true, order: 4
  },
];

// ─── 첫달 적응 단계 ──────────────────────────────────────
export const DEFAULT_SETTLE_MONTH1: StepItem[] = [
  {
    id: pid(),
    title: "WA 운전면허 취득",
    titleEn: "Get WA Driver License",
    desc: "필기시험 한국어 선택 가능. 문제 35개 중 28개 이상 정답. DOL 추천: Everett (3601 Wetmore Ave) — 대기 짧음. 도로주행 별도 예약. 총 소요 $75. 시험 문제 WA DOL 앱에서 연습",
    descEn: "Written test available in Korean. 28/35 questions to pass. Recommended DOL: Everett (3601 Wetmore Ave) — shorter wait. Road test booked separately. Total fee $75. Practice on WA DOL app",
    active: true, order: 0
  },
  {
    id: pid(),
    title: "건강보험 등록",
    titleEn: "Enroll in health insurance",
    desc: "직장 보험 없으면: ① WA Apple Health (수입 낮으면 무료 Medicaid) ② WA Healthplanfinder 마켓플레이스 (보조금 가능). wahealthplanfinder.org | 📞 1-855-923-4633 | 한국어 통역 가능",
    descEn: "No employer plan? ① WA Apple Health (free Medicaid if low income) ② WA Healthplanfinder marketplace (subsidies available). wahealthplanfinder.org | 📞 1-855-923-4633 | Korean interpreter",
    active: true, order: 1
  },
  {
    id: pid(),
    title: "자녀 학교 등록",
    titleEn: "Enroll children in school",
    desc: "거주지 학군 공립학교 무료. 임대계약서(Lease) 필수. ESL 지원 있음. Lynnwood → 에드먼즈 교육구. Bellevue → 벨뷰 교육구(상위권). seattleschools.org | 📞 (206) 252-0010",
    descEn: "Free public school at your district. Lease agreement required. ESL support available. Lynnwood → Edmonds SD. Bellevue → Bellevue SD (top-rated). seattleschools.org | 📞 (206) 252-0010",
    active: true, order: 2
  },
  {
    id: pid(),
    title: "중고차 구매",
    titleEn: "Purchase a used car",
    desc: "WA는 대중교통 제한적 → 차량 거의 필수. 예산: $5,000-12,000 (한인 딜러 추천). CARFAX 필수 확인. 한인 카카오그룹 '시애틀차량거래' 중고차 매물 있음. 보험: Progressive 첫달 $80-120",
    descEn: "Public transit is limited in WA → car is almost essential. Budget: $5,000-12,000 (Korean dealers recommended). Always check CARFAX. KakaoTalk '시애틀차량거래' has used car listings. Insurance: Progressive $80-120 first month",
    active: true, order: 3
  },
  {
    id: pid(),
    title: "장기 렌탈 계약",
    titleEn: "Sign long-term lease",
    desc: "신용 이력 부족 시: ① 한인 집주인 우선 탐색 ② 보증금 2-3개월치 제안 ③ 직장 오퍼레터 첨부. 평균 렌트: 1BR $1,600-2,200 (Lynnwood/Federal Way 기준). Zillow·Apartments.com 활용",
    descEn: "Limited credit? ① Look for Korean landlords first ② Offer 2-3 months deposit ③ Attach job offer letter. Avg rent: 1BR $1,600-2,200 (Lynnwood/Federal Way). Use Zillow or Apartments.com",
    active: true, order: 4
  },
];

// ─── 3개월 이후 정착 완성 ────────────────────────────────
export const DEFAULT_SETTLE_MONTH3: StepItem[] = [
  {
    id: pid(),
    title: "신용카드 빌드 시작",
    titleEn: "Start building credit",
    desc: "Secured Card: Capital One Platinum ($200 보증금), Discover it Secured. 6-12개월 후 일반 카드로 자동 업그레이드. 매월 전액 납부 필수. 목표: 1년 후 Chase Freedom / 2년 후 Sapphire",
    descEn: "Secured Card: Capital One Platinum ($200 deposit), Discover it Secured. Auto-upgrade to regular card in 6-12 months. Pay in full monthly. Goal: Chase Freedom (1yr) / Sapphire (2yr)",
    active: true, order: 0
  },
  {
    id: pid(),
    title: "세금 ID (ITIN) 신청",
    titleEn: "Apply for ITIN",
    desc: "SSN 없는 비자 소지자. IRS Form W-7 작성. 한인 CPA 통해 신청 권장 ($150-300). 소요 7-11주. 은행 계좌·세금신고에 필요",
    descEn: "For non-SSN visa holders. File IRS Form W-7. Korean CPA recommended ($150-300). Takes 7-11 weeks. Required for bank accounts & tax filing",
    active: true, order: 1
  },
  {
    id: pid(),
    title: "비자 상태·기간 재확인",
    titleEn: "Recheck visa status & expiry",
    desc: "I-94 만료일 확인: cbp.dhs.gov/i94. 연장·전환 필요시 이민 변호사 상담 필수 (최소 만료 3개월 전). Lynnwood 한인 이민 법무사 다수 활동",
    descEn: "Check I-94 at cbp.dhs.gov/i94. Consult immigration attorney for extension/change — at least 3 months before expiry. Korean immigration attorneys active in Lynnwood",
    active: true, order: 2
  },
  {
    id: pid(),
    title: "401K · 은퇴 계좌 설정",
    titleEn: "Set up 401K & retirement account",
    desc: "직장 제공 401K → 고용주 매칭 100% 활용 필수 (공짜 돈). Roth IRA: 연간 $7,000 한도. 영주권·시민권 취득 후 장기 투자 권장",
    descEn: "Employer 401K → max the employer match (free money). Roth IRA: $7,000/year limit. Recommended for long-term after green card/citizenship",
    active: true, order: 3
  },
  {
    id: pid(),
    title: "세금신고 준비",
    titleEn: "Prepare for tax filing",
    desc: "WA주 소득세 없음 (장점!). 연방세는 4월 15일까지 신고. 한국 소득·계좌 있으면 FBAR·FATCA 별도 신고 필수. 한인 CPA 상담 권장 ($200-400)",
    descEn: "WA has no state income tax (benefit!). Federal tax due April 15. Korean income/accounts require FBAR & FATCA filing. Korean CPA consultation recommended ($200-400)",
    active: true, order: 4
  },
];

// ─── 행정·서류 (검증일: 2026-04-30) ─────────────────────
export const DEFAULT_SETTLE_ADMIN: StepItem[] = [
  {
    id: pid(),
    title: "SSN 신청 (사회보장청)",
    titleEn: "SSN — Social Security Administration",
    desc: "✅ 주소 검증됨 | 📍 915 2nd Ave, Ste 901, Seattle WA 98174 | 📞 (866) 494-3135 | 월·화·목·금 9am-4pm, 수 9am-12pm | 지참: 여권+I-94+비자+주소증명 | 소요 3-4주 | 🔗 ssa.gov/locator",
    descEn: "✅ Address verified | 📍 915 2nd Ave, Ste 901, Seattle WA 98174 | 📞 (866) 494-3135 | M·Tu·Th·F 9am-4pm, W 9am-12pm | Bring: passport+I-94+visa+address proof | Takes 3-4 weeks | 🔗 ssa.gov/locator",
    active: true, order: 0
  },
  {
    id: pid(),
    title: "WA 운전면허 (DOL)",
    titleEn: "WA Driver License — DOL",
    desc: "✅ 주소 검증됨 | Lynnwood: 📍 18023 Hwy 99 N Suite E | 📞 (425) 672-3406 | 화-수-금 8:30am-5pm, 목 9:30am-5pm, 토 8:30am-2:30pm, 월 휴무 | 지참: 여권+비자+I-94+주소증명 2개 | 필기 한국어 선택 가능 | 🔗 dol.wa.gov",
    descEn: "✅ Address verified | Lynnwood: 📍 18023 Hwy 99 N Suite E | 📞 (425) 672-3406 | Tu-W-F 8:30am-5pm, Th 9:30am-5pm, Sa 8:30am-2:30pm, Mon closed | Bring: passport+visa+I-94+2 address proofs | Written test available in Korean | 🔗 dol.wa.gov",
    active: true, order: 1
  },
  {
    id: pid(),
    title: "총영사관 서비스",
    titleEn: "Korean Consulate General — Seattle",
    desc: "✅ 주소 검증됨 | 📍 115 W Mercer St, Seattle WA 98119 | 📞 (206) 441-1011 | 월-금 8:30am-4:30pm | 여권 전용 📞 (206) 947-8293 | 여권발급·갱신·공증·병역·선거 | 🔗 mofa.go.kr/us-seattle-en",
    descEn: "✅ Address verified | 📍 115 W Mercer St, Seattle WA 98119 | 📞 (206) 441-1011 | M-F 8:30am-4:30pm | Passport hotline: 📞 (206) 947-8293 | Passport, notary, military & election services | 🔗 mofa.go.kr/us-seattle-en",
    active: true, order: 2
  },
  {
    id: pid(),
    title: "I-94 확인·출력",
    titleEn: "Check & Print I-94",
    desc: "✅ 공식 사이트 | 입국기록·만료일·비자 카테고리 확인 필수 | 🔗 cbp.dhs.gov/i94 | 오류 발견 시: CBP Deferred Inspection 📍 17801 International Blvd, SeaTac",
    descEn: "✅ Official site | Must verify arrival record, expiry date & visa category | 🔗 cbp.dhs.gov/i94 | If errors: CBP Deferred Inspection 📍 17801 International Blvd, SeaTac",
    active: true, order: 3
  },
  {
    id: pid(),
    title: "영주권·비자 갱신 (USCIS)",
    titleEn: "Green Card / Visa Renewal — USCIS",
    desc: "✅ 공식 사이트 | I-485(영주권) · I-539(비자연장) · I-765(취업허가) | 만료 6개월 전 시작 권장 | 🔗 uscis.gov | 한국어 지원 이민 변호사: Lynnwood 지역 다수 (정보 확인 중)",
    descEn: "✅ Official site | I-485(green card) · I-539(visa extension) · I-765(work permit) | Start 6 months before expiry | 🔗 uscis.gov | Korean-speaking immigration attorneys: many in Lynnwood (details being verified)",
    active: true, order: 4
  },
  {
    id: pid(),
    title: "시민권 신청 (N-400)",
    titleEn: "Citizenship Application — N-400",
    desc: "✅ 공식 사이트 | 영주권 취득 후 5년 (배우자 3년) | 접수비 $760 | 영어·시민권 시험 무료 준비: 🔗 uscis.gov/citizenship/find-study-materials-and-resources | 🔗 uscis.gov/n-400",
    descEn: "✅ Official site | 5 years after green card (3 for spouse) | Filing fee $760 | Free study materials: 🔗 uscis.gov/citizenship/find-study-materials-and-resources | 🔗 uscis.gov/n-400",
    active: true, order: 5
  },
];

// ─── 금융·재정 ────────────────────────────────────────────
export const DEFAULT_SETTLE_FINANCE: StepItem[] = [
  {
    id: pid(),
    title: "한국어 가능 은행",
    titleEn: "Korean-Friendly Banks in Seattle",
    desc: "⚠️ 한미은행 WA 지점 재확인 중 (벨뷰 2026년 4월 폐점). 대안: Chase (한국어 직원 있는 지점 콜센터 문의) | Wells Fargo | Bank of America. 여권+I-94+주소증명으로 개설 가능 | 🔗 chase.com | 🔗 wellsfargo.com",
    descEn: "⚠️ Hanmi Bank WA re-verifying (Bellevue closed Apr 2026). Alternatives: Chase (call for Korean-speaking branch) | Wells Fargo | Bank of America. Open with passport+I-94+address proof | 🔗 chase.com | 🔗 wellsfargo.com",
    active: true, order: 0
  },
  {
    id: pid(),
    title: "Chase Total Checking",
    titleEn: "Chase Total Checking",
    desc: "한인 커뮤니티 추천 1위. 전국 ATM·지점 많음. $500 개설 보너스 이벤트 자주 있음. 지참: 여권+I-94+주소증명. 벨뷰·린우드 지점에 한국어 직원 있음",
    descEn: "#1 in Korean community. Many ATMs & branches nationwide. Frequent $500 opening bonus. Bring: passport+I-94+address proof. Korean-speaking staff at Bellevue & Lynnwood branches",
    active: true, order: 1
  },
  {
    id: pid(),
    title: "WA Federal Credit Union",
    titleEn: "WA Federal Credit Union",
    desc: "시애틀 한인 선호 신협. 자동차 대출 금리 경쟁력 있음. 모기지도 경쟁력 있음. 주소: 多 지점 있음",
    descEn: "Korean community favorite credit union. Competitive auto loan rates. Good mortgage rates too. Multiple branch locations",
    active: true, order: 2
  },
  {
    id: pid(),
    title: "신용카드 빌드 순서",
    titleEn: "Credit building roadmap",
    desc: "① Secured Card (Capital One Platinum) → ② 1년 후 Chase Freedom Unlimited → ③ 2년 후 Chase Sapphire Preferred. 매월 전액 납부, 사용률 30% 이하 유지",
    descEn: "① Secured Card (Capital One Platinum) → ② Chase Freedom Unlimited (1yr) → ③ Chase Sapphire Preferred (2yr). Pay in full monthly, keep utilization below 30%",
    active: true, order: 3
  },
  {
    id: pid(),
    title: "WA 세금 특이사항",
    titleEn: "WA State Tax Highlights",
    desc: "주 소득세 없음 (장점!). 판매세(Sales Tax) 10.2% (시애틀). 식료품·처방약 세금 면제. 재산세는 주택 소유 시 연 $5,000-15,000 수준",
    descEn: "No state income tax (major benefit!). Sales Tax 10.2% in Seattle. Groceries & prescription drugs tax-exempt. Property tax ~$5,000-15,000/yr if you own a home",
    active: true, order: 4
  },
  {
    id: pid(),
    title: "한국→미국 송금 팁",
    titleEn: "Korea → US wire transfer tips",
    desc: "추천: Wise (구 TransferWise) — 은행 대비 수수료 60-80% 절약. 하나은행·신한은행 해외이체 (수수료 $20-30). $10,000 이상 이체 시 FinCEN 보고 의무 없음 (받는 쪽). 단, 연간 합산 $10K 초과 시 세무사 상담",
    descEn: "Recommended: Wise (formerly TransferWise) — 60-80% lower fees than banks. Hana/Shinhan Bank international transfer ($20-30 fee). No FinCEN report needed for the recipient. Consult tax advisor if annual total exceeds $10K",
    active: true, order: 5
  },
];

// ─── 의료·보험 ────────────────────────────────────────────
export const DEFAULT_MEDICAL: PlaceItem[] = [
  {
    id: pid(), emoji: "🏥", name: "스웨디시 메디컬 센터 (Swedish Medical)", nameEn: "Swedish Medical Center", desc: "시애틀 최대 종합병원. 응급실 24시간. 한국어 통역 서비스 있음. 📍 747 Broadway, Seattle | 📞 (206) 386-6000", descEn: "Seattle's largest hospital. ER 24hrs. Korean interpreter available. 📍 747 Broadway, Seattle | 📞 (206) 386-6000", tags: ["종합병원", "응급실", "한국어통역"], active: true, order: 0
  },
  {
    id: pid(), emoji: "🏥", name: "UW 메디컬 센터", nameEn: "UW Medical Center", desc: "워싱턴대학교 병원. 전문의 진료 수준 높음. 한국어 통역 가능. 📍 1959 NE Pacific St, Seattle | 📞 (206) 598-3300", descEn: "University of Washington hospital. High-level specialist care. Korean interpreter available. 📍 1959 NE Pacific St, Seattle | 📞 (206) 598-3300", tags: ["대학병원", "전문의", "한국어통역"], active: true, order: 1
  },
  {
    id: pid(), emoji: "👨‍⚕️", name: "한인 가정의학과 클리닉", nameEn: "Korean Family Medicine Clinic", desc: "한국어 가능 가정의학과. Lynnwood 소재. 보험·비보험 가능. 초진 예약 가능. 📞 (425) 744-9200", descEn: "Korean-speaking family medicine. Lynnwood. Insurance & self-pay. New patient appointments available. 📞 (425) 744-9200", tags: ["가정의학", "한국어", "초진"], active: true, order: 2
  },
  {
    id: pid(), emoji: "🦷", name: "한인 치과 (린우드)", nameEn: "Korean Dental — Lynnwood", desc: "한국어 가능 치과. X-ray 포함 초진 $80-120. 보험 없어도 저렴하게 진료 가능. 예약 후 방문. 린우드·벨뷰·페더럴웨이 지점", descEn: "Korean-speaking dentist. New patient w/X-ray $80-120. Affordable without insurance. By appointment. Lynnwood, Bellevue & Federal Way", tags: ["치과", "한국어", "초진"], active: true, order: 3
  },
  {
    id: pid(), emoji: "🧠", name: "정신건강 상담 — ACRS", nameEn: "Mental Health — ACRS", desc: "✅ 검증됨 | 이민 스트레스·우울·불안. 한국어 가능 상담사. 📍 3639 MLK Jr Way S, Seattle WA 98144 | 📞 (206) 695-7600 | 월-금 9am-4pm | 소득 기준 슬라이딩 요금 | 🔗 acrs.org", descEn: "✅ Verified | Immigration stress, depression & anxiety. Korean-speaking counselors. 📍 3639 MLK Jr Way S, Seattle WA 98144 | 📞 (206) 695-7600 | M-F 9am-4pm | Sliding scale fees | 🔗 acrs.org", tags: ["정신건강", "한국어", "상담"], active: true, order: 4
  },
  {
    id: pid(), emoji: "💊", name: "WA Apple Health (Medicaid)", nameEn: "WA Apple Health — Free Medical Insurance", desc: "저소득 무료 의료보험. 대부분 한인 새 이민자 해당. wahealthplanfinder.org | 📞 1-855-923-4633 | 한국어 통역 가능. 신청 후 1-2주 내 카드 수령", descEn: "Free health insurance for low-income. Most new Korean immigrants qualify. wahealthplanfinder.org | 📞 1-855-923-4633 | Korean interpreter. Card received 1-2 weeks after approval", tags: ["무료보험", "Medicaid", "한국어"], active: true, order: 5
  },
];

// ─── 공항·교통 (검증일: 2026-04-30) ──────────────────────
export const DEFAULT_TRANSPORT: PlaceItem[] = [
  {
    id: pid(), emoji: "✈️", name: "SeaTac 공항 기본 정보", nameEn: "Seattle-Tacoma International Airport",
    desc: "공항코드: SEA. 다운타운 시애틀 남쪽 약 20km. 입국심사 → 수하물 → 세관 통과 후 1층으로 이동. Link Light Rail역은 무료 셔틀로 연결 (Sky Bridge 이용)",
    descEn: "Airport code: SEA. ~20km south of downtown Seattle. After customs, take free shuttle (Sky Bridge) to Link Light Rail station on Level 1",
    tags: ["SeaTac", "공항", "입국"], active: true, order: 0
  },
  {
    id: pid(), emoji: "🚇", name: "Link Light Rail (링크)", nameEn: "Link Light Rail — SeaTac ↔ Downtown",
    desc: "✅ 검증됨 | 공항↔다운타운(Westlake) 38분. 요금 $3.00. 18세 이하 무료. ORCA 카드 또는 자판기 현금. 4am-1am 운행. 린우드역(한인타운) 직결 | 출처: soundtransit.org",
    descEn: "✅ Verified | Airport↔Downtown (Westlake) 38min. Fare $3.00. Under 18 free. ORCA card or cash vending machine. 4am-1am. Direct to Lynnwood Station (Koreatown) | Source: soundtransit.org",
    tags: ["링크", "지하철", "공항"], active: true, order: 1
  },
  {
    id: pid(), emoji: "🚗", name: "Lyft / Uber", nameEn: "Rideshare — Lyft / Uber",
    desc: "공항→린우드(한인타운): 약 25분. 공항→다운타운: 약 20분. 공항 1층 'Rideshare' 픽업 존. 요금은 시간대·교통상황에 따라 변동. 앱 미리 설치 권장",
    descEn: "Airport→Lynnwood (Koreatown): ~25min. Airport→Downtown: ~20min. Level 1 'Rideshare' pickup zone. Fares vary by time & traffic. Install app in advance",
    tags: ["Lyft", "Uber", "공항"], active: true, order: 2
  },
  {
    id: pid(), emoji: "🚌", name: "King County Metro 버스", nameEn: "King County Metro Bus",
    desc: "✅ 공식 사이트 | 시내 버스 네트워크. ORCA 카드로 환승 무료. 신용카드 탭-투-페이 2026년부터 지원 | 🔗 kingcounty.gov/metro",
    descEn: "✅ Official site | City bus network. Free transfer with ORCA card. Credit card tap-to-pay supported from 2026 | 🔗 kingcounty.gov/metro",
    tags: ["버스", "Metro", "대중교통"], active: true, order: 3
  },
  {
    id: pid(), emoji: "🚢", name: "워싱턴주 페리 (WSF)", nameEn: "Washington State Ferries",
    desc: "✅ 요금 검증됨 | 시애틀↔벤브릿지: 성인 편도 $9.25, 청소년(6-18) $4.60. 출발: Coleman Dock (다운타운 워터프론트). 차량 동반 시 요금 별도 | 🔗 wsdot.wa.gov/ferries",
    descEn: "✅ Fare verified | Seattle↔Bainbridge: Adult one-way $9.25, Youth(6-18) $4.60. Departs Coleman Dock (downtown waterfront). Vehicle fee extra | 🔗 wsdot.wa.gov/ferries",
    tags: ["페리", "올림픽반도", "벤브릿지"], active: true, order: 4
  },
];

// ═══════════════════════════════════════════════════════════
// ALL_DEFAULTS 레지스트리
// ═══════════════════════════════════════════════════════════
export const ALL_DEFAULTS: Record<string, any[]> = {
  churches:       DEFAULT_CHURCHES,
  cafes:          DEFAULT_CAFES,
  restaurants:    DEFAULT_RESTAURANTS,
  businesses:     DEFAULT_BUSINESSES,
  shopping:       DEFAULT_SHOPPING,
  areas:          DEFAULT_AREAS,
  nature:         DEFAULT_NATURE,
  culture:        DEFAULT_CULTURE,
  sports:         DEFAULT_SPORTS,
  community:      DEFAULT_COMMUNITY,
  links:          DEFAULT_LINKS,
  medical:        DEFAULT_MEDICAL,
  transport:      DEFAULT_TRANSPORT,
  settle_day1:    DEFAULT_SETTLE_DAY1,
  settle_week1:   DEFAULT_SETTLE_WEEK1,
  settle_month1:  DEFAULT_SETTLE_MONTH1,
  settle_month3:  DEFAULT_SETTLE_MONTH3,
  settle_admin:   DEFAULT_SETTLE_ADMIN,
  settle_finance: DEFAULT_SETTLE_FINANCE,
};

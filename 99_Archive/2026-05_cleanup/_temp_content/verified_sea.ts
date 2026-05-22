// ═══ VERIFIED SE ASIA (from Korean media directories) ═══
// 출처: yellowsing.com.sg (싱가포르 한인업소록 No.1) · hanasia.com (태국 교민사이트) ·
//       chaovietnam.co.kr / gmvn.kr (베트남 교민 매체) + Tripadvisor/Yelp 교차 검증
// 검증일: 2026-05-14

interface Top5Item {
  rank: number;
  emoji: string;
  nameKo: string;
  nameEn: string;
  address?: string;
  phone?: string;
  hours?: string;
  rating?: number;
  ratingCount?: string;
  why: string;
  tip?: string;
  website?: string;
}

// ─── SINGAPORE ───────────────────────────────────────────────────────────────
// 출처: yellowsing.com.sg 한인업소록 (239개 등재 한식당 중 검증된 5개)

export const TOP5_FOOD_SINGAPORE: Top5Item[] = [
  {
    rank: 1,
    emoji: "🔥",
    nameKo: "창 코리안 참숯 바비큐",
    nameEn: "Chang Korean Charcoal BBQ",
    address: "71 Loewen Road #01-01, Singapore 248847",
    phone: "+65 6473-9005",
    hours: "월-목 12:00-15:00 / 18:00-22:00 | 금-토 12:00-15:00 / 18:00-22:30 | 일 12:00-15:00 / 18:00-22:00",
    rating: 4.5,
    ratingCount: "500+",
    why: "뎀시힐 열대우림 속 참숯 바비큐 전문점. 프라이빗 다이닝룸과 현대적 공간이 조화를 이루며, 싱가포르 한인 커뮤니티에서 가장 오래 사랑받는 프리미엄 한식당 중 하나입니다. 퀄리티 있는 고기 선택지와 세심한 직원 서비스로 유명합니다.",
    tip: "예약 필수. 뎀시힐 공원 산책 후 저녁 방문을 추천합니다.",
    website: "changbbq.com.sg",
  },
  {
    rank: 2,
    emoji: "🥘",
    nameKo: "빅마마 코리안 레스토랑 (티옹바루)",
    nameEn: "Bigmama Korean Restaurant (Tiong Bahru)",
    address: "2 Kim Tian Road, Singapore 169244",
    phone: "+65 6270-7704",
    hours: "화-일 11:30-15:00 / 17:30-23:00 | 월 휴무",
    rating: 4.3,
    ratingCount: "300+",
    why: "티옹바루 한인 밀집 지역의 대표 한식당으로, 가정식 백반부터 찌개·구이까지 풀 메뉴를 제공합니다. 싱가포르 한인업소록 yellowsing.com.sg에 등재된 신뢰 업소로, 현지 교민들이 꾸준히 찾는 맛집입니다.",
    tip: "런치 도시락 세트가 합리적입니다. 주말 저녁은 미리 전화 예약하세요.",
    website: "bigmama.sg",
  },
  {
    rank: 3,
    emoji: "🍗",
    nameKo: "안동찜닭 (래플스시티)",
    nameEn: "Andong Zzimdak (Raffles City)",
    address: "#B1-44F Raffles City Shopping Centre, 252 North Bridge Road, Singapore 179103",
    phone: "+65 6533-3951",
    hours: "매일 11:30-22:00",
    rating: 4.2,
    ratingCount: "200+",
    why: "싱가포르 최초 안동찜닭 전문점으로 경상북도 안동 본고장의 레시피를 그대로 재현합니다. 쫄깃한 당면과 부드러운 닭고기가 어우러진 매콤달콤한 찜닭은 한인 관광객과 교민 모두에게 인기입니다. 시청역(City Hall) 도보 거리로 접근성이 탁월합니다.",
    tip: "래플스시티 지하 1층에 위치. 현금·카드 모두 가능하며, 대(大) 사이즈는 3-4인 적당합니다.",
    website: "facebook.com/AndongZzimdak",
  },
  {
    rank: 4,
    emoji: "🏠",
    nameKo: "코리아 하우스",
    nameEn: "Korea House",
    address: "87 Killiney Road, Singapore 239533",
    phone: "+65 6734-3010",
    hours: "월-토 11:30-15:30 / 17:30-22:30 | 일 휴무",
    rating: 4.4,
    ratingCount: "150+",
    why: "킬리니 로드 한인 상권의 정통 한식 레스토랑. 오랜 역사를 가진 교민 단골집으로, 제대로 된 한국 가정식과 계절 반찬이 준비됩니다. 교민 사회에서 입소문으로 유지되어온 신뢰 업소입니다.",
    tip: "브레이크 타임(15:30-17:30) 확인 필수. 일요일은 문을 닫습니다.",
    website: "instagram.com/koreahouse_singapore",
  },
  {
    rank: 5,
    emoji: "🥂",
    nameKo: "안주 (탄종파가)",
    nameEn: "ANJU",
    address: "62 Tras Street, Singapore 079001",
    phone: "+65 6612-1172",
    hours: "화-토 18:00-22:30 | 월·일 휴무",
    rating: 4.5,
    ratingCount: "100+",
    why: "탄종파가 코리안 디스트릭트의 모던 한식 다이닝. 전통 한식을 현대적으로 재해석한 창작 메뉴와 큐레이팅된 한국 막걸리·소주 페어링이 특징입니다. 현지 미식가와 교민 모두에게 각광받는 저녁 전용 레스토랑입니다.",
    tip: "저녁만 운영(18시 오픈). 예약 필수이며 두세 번은 가봐야 메뉴를 다 즐길 수 있습니다.",
    website: "anjusingapore.com",
  },
];

// ─── BANGKOK ─────────────────────────────────────────────────────────────────
// 출처: hanasia.com 태국 교민사이트 업체디렉토리 + kyominthai.com 황페이지 교차 검증
// 수쿰윗 한인 상권(BTS 나나·아속) 중심 검증 업소

export const TOP5_FOOD_BANGKOK: Top5Item[] = [
  {
    rank: 1,
    emoji: "🥩",
    nameKo: "경복궁 코리안 레스토랑",
    nameEn: "Kyung Bok Kung Korean Restaurant",
    address: "Soi Sukhumvit 13, 2nd Floor Sukhumvit Suite, Sukhumvit Road, Khlong Toei Nuea, Watthana, Bangkok 10110",
    phone: "+66 2 651-3266",
    hours: "매일 11:00-22:00",
    rating: 4.7,
    ratingCount: "21",
    why: "방콕 수쿰윗 13에 위치한 정통 한식 레스토랑으로, 한국에서 식사하는 느낌이 든다는 평가가 줄을 잇습니다. 태국 교민 사이트 hanasia.com 업체디렉토리에 등재된 검증 업소로, 신선하고 맛있는 한식 메뉴 선택지가 풍부합니다. BTS 나나역 도보권에 위치해 교민과 관광객 모두 편리하게 이용합니다.",
    tip: "BTS 나나(Nana)·아속(Asok) 역에서 도보 가능. 채식 메뉴도 일부 제공합니다.",
    website: "facebook.com/KyungBokKungSukhumvit",
  },
  {
    rank: 2,
    emoji: "🍖",
    nameKo: "소공동 코리안 바비큐",
    nameEn: "So Gong Don (Sogongdon) Korean BBQ",
    address: "2nd Floor, Allez Mall, Hyatt Regency Bangkok Sukhumvit, 1 Sukhumvit Rd, Khlong Toei Nuea, Watthana, Bangkok 10110",
    phone: "+66 92 249-7360",
    hours: "매일 11:00-23:00",
    rating: 4.4,
    ratingCount: "50+",
    why: "한국인 셰프 정 씨가 직접 운영하는 프리미엄 참숯 바비큐 전문점. 360시간 이상 건식숙성(드라이에이징)한 돼지 삼겹살과 완도산 구이 김이 시그니처입니다. BTS 나나역 3번 출구 스카이워크 직통 연결 하얏트 리젠시 내 위치로 접근성이 최고입니다.",
    tip: "BTS 나나역 3번 출구에서 스카이워크로 바로 연결. 하얏트 리젠시 호텔 주차 4시간 무료.",
    website: "sogongdon-th.com",
  },
  {
    rank: 3,
    emoji: "🥋",
    nameKo: "두레 코리안 레스토랑",
    nameEn: "Doorae Korean Restaurant",
    address: "212/15 Soi Sukhumvit 12, 1st Floor, Sukhumvit Plaza, Sukhumvit Road, Khlong Toei District, Bangkok",
    phone: "+66 2 653-3815",
    hours: "매일 10:00-21:00",
    rating: 4.0,
    ratingCount: "71",
    why: "방콕 코리아타운 수쿰윗 플라자 1층의 대표 한식 바비큐 레스토랑. 직원이 고기를 직접 구워주는 풀서비스와 넉넉한 밑반찬이 강점입니다. 1998년부터 운영된 방콕 교민 사회의 터줏대감으로, hanasia.com 업체디렉토리에 등재된 장기 운영 업소입니다.",
    tip: "수쿰윗 12-14 사이 수쿰윗 플라자 내 위치. BTS 아속역 도보 5분. 카드 결제 시 3% 수수료 있음.",
    website: "facebook.com/Doorae-Korean-Restaurant-สุขุมวิท-12",
  },
  {
    rank: 4,
    emoji: "🍻",
    nameKo: "본가 타이랜드 (수쿰윗 39)",
    nameEn: "Bornga Thailand",
    address: "39 Boulevard Tower, 2nd Floor, Soi Sukhumvit 39, Khlong Tan Nuea, Watthana, Bangkok 10110",
    phone: "+66 2 160-0095",
    hours: "런치 11:30-15:00 | 디너 17:30-22:00",
    rating: 4.0,
    ratingCount: "7",
    why: "서울 마포 냉삼 골목에서 출발한 유명 브랜드 '본가'의 방콕 공식 매장. 한국식 참숯 바비큐와 넉넉한 반찬, 친절하게 고기를 구워주는 직원이 특징입니다. 방콕 수쿰윗 39 부유층 주거 지역에 위치하여 쾌적하고 여유로운 분위기입니다.",
    tip: "수쿰윗 39 블루바드 타워 2층. BTS 프롬퐁역에서 그랩(Grab) 이용 추천.",
    website: "bornga_thailand (Instagram)",
  },
  {
    rank: 5,
    emoji: "🍜",
    nameKo: "유천 코리안 레스토랑",
    nameEn: "Youchun Korean Restaurant",
    address: "25/1 Sukhumvit Soi 5, Sukhumvit Road, Watthana, Bangkok 10110",
    phone: "+66 2 655-5344",
    hours: "런치·디너 영업 (사전 확인 권장)",
    rating: 4.3,
    ratingCount: "23",
    why: "방콕 교민 사회에서 '소고기뷔페와 냉면'으로 오래 알려진 전통 한식당. 그레이스 호텔 앞 수쿰윗 5번가 위치로, BTS 나나역에서 도보 5분이내에 위치합니다. 8가지 이상의 밑반찬과 두 종류의 국이 함께 나오는 푸짐한 상차림이 강점입니다.",
    tip: "BTS 나나역 하차 후 수쿰윗 소이 5로 300-500m. 그레이스 호텔 건물 앞 위치.",
    website: "facebook.com/youchunbkk",
  },
];

// ─── HO CHI MINH CITY ────────────────────────────────────────────────────────
// 출처: chaovietnam.co.kr (씬짜오베트남, 2002년 창간 25년 교민 매체) +
//       gmvn.kr (굿모닝베트남 업소정보) + Tripadvisor 교차 검증
// 1군·7군 푸미흥 한인 밀집 지역 검증 업소

export const TOP5_FOOD_HO_CHI_MINH: Top5Item[] = [
  {
    rank: 1,
    emoji: "🏯",
    nameKo: "경복궁 코리안 레스토랑",
    nameEn: "Kyung Bok Gung Korean Restaurant",
    address: "52 Hai Ba Trung, Ben Nghe Ward, District 1, Ho Chi Minh City, Vietnam",
    phone: "+84 8 6682-7249",
    hours: "월-토 10:30-22:00 | 일 휴무",
    rating: 4.5,
    ratingCount: "26",
    why: "하이바쯩 거리 1군에 위치한 정통 한식 고급 레스토랑. 여러 층으로 나뉜 프라이빗 룸에서 한국식 풀코스를 즐길 수 있으며, 21가지 소코스 반찬 상차림이 명물입니다. 호치민 교민 커뮤니티 chaovietnam.co.kr에서 검증된 업소로, 비즈니스 접대와 가족 모임에 적합합니다.",
    tip: "예약 필수. 프라이빗룸 별도 예약 가능. 주차 가능.",
    website: "kbgung.com",
  },
  {
    rank: 2,
    emoji: "🥓",
    nameKo: "맛찬들 BBQ (타오디엔)",
    nameEn: "Matchandeul BBQ Thao Dien",
    address: "93 Vo Nguyen Giap, Thao Dien, Thu Duc City, Ho Chi Minh City 70000, Vietnam",
    phone: "+84 28 7309-6464",
    hours: "매일 11:30-23:00",
    rating: 4.6,
    ratingCount: "5",
    why: "한국인 오너가 직접 운영하는 숙성 삼겹살 전문점으로, 호치민 한인 커뮤니티에서 '가장 맛있는 한식 바비큐'로 손꼽힙니다. 타오디엔 강변 메인 도로 위치로 넓고 쾌적한 공간이며, 1군·7군에도 지점이 있어 호치민 어디서든 접근 가능합니다. 식사 후 아이스크림 서비스로 유명합니다.",
    tip: "타오디엔점 외 1군 쩐탓퉁(Ton That Tung)지점도 운영 중. 주말 예약 강력 권장.",
    website: "facebook.com/matchandeulQ7",
  },
  {
    rank: 3,
    emoji: "🥩",
    nameKo: "강남 비비큐",
    nameEn: "Gangnam BBQ",
    address: "R2-48 Phan Khiem Ich, Hung Gia 2, Tan Phong Ward, District 7, Ho Chi Minh City 700000, Vietnam",
    phone: "+84 8 5410-7218",
    hours: "매일 영업 (사전 확인 권장)",
    rating: 4.5,
    ratingCount: "19",
    why: "호치민 코리아타운 7군 푸미흥의 인기 한국 바비큐 레스토랑. 친절하고 빠른 서비스와 프라이빗 룸으로 소규모 모임·가족 식사에 최적입니다. 호치민 교민 매체 gmvn.kr 업소정보에 등재된 검증 업소로, 7군 한인 밀집 지역의 랜드마크 식당입니다.",
    tip: "7군 팬키엠이흐(Phan Khiem Ich) 거리 한인 식당 밀집 골목에 위치. 구이와 훠궈 모두 주문 가능.",
    website: "gangnam-bbq.wheree.com",
  },
  {
    rank: 4,
    emoji: "🍲",
    nameKo: "한강 코리안 레스토랑",
    nameEn: "Hangang Korean Restaurant",
    address: "96B Nam Ky Khoi Nghia, District 1, Ho Chi Minh City 70000, Vietnam",
    phone: "+84 8 3822-6172",
    hours: "매일 11:00-21:30",
    rating: 4.1,
    ratingCount: "18",
    why: "1군 도심에 위치한 가정식 한식당으로 '한국인이 가득한 곳이 진짜 맛집'이라는 말을 입증하는 곳입니다. 한국인 오너가 직접 담근 김치와 신선한 재료의 찌개류가 강점이며, 실제 한국 교민들이 단골로 찾는 진짜 한식 맛집입니다. chaovietnam.co.kr 교민 추천 업소입니다.",
    tip: "2층에 위치. 거리에서 계단으로 올라가야 합니다. 한국 정통 가정식을 원할 때 최적입니다.",
    website: "facebook.com/Hangang-Korean-restaurant-145124002202951",
  },
  {
    rank: 5,
    emoji: "🍺",
    nameKo: "월남집 사이공하우스",
    nameEn: "Saigon House (월남집)",
    address: "74-76 Phan Khiem Ich, Tan Phong, District 7, Ho Chi Minh City, Vietnam",
    phone: "+84 98 565-1533",
    hours: "매일 런치·디너 영업",
    rating: 4.3,
    ratingCount: "100+",
    why: "7군 푸미흥 한인 밀집 골목에 위치한 소주 안주 전문 한식 레스토랑. 찐 돼지고기 김치, 양념 돼지갈비, 참숯구이 등 술안주에 특화된 메뉴가 강점이며, 낮에도 소주를 즐기는 교민 문화의 중심 공간입니다. gmvn.kr 업소 정보와 chaovietnam.co.kr 교민 추천을 동시에 받은 업소입니다.",
    tip: "강남BBQ 골목과 같은 팬키엠이흐 거리에 위치. 소주와 함께 안주 위주로 즐기는 교민식 저녁 문화 체험에 좋습니다.",
    website: "facebook.com/WNJ.SaigonHouse",
  },
];

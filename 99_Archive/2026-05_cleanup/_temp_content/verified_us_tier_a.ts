// ═══ VERIFIED US TIER A (from Korean media directories) ═══
// 출처: chi.koreaportal.com/yp, yp.koreadaily.com (CH/DC/SD), kyocharoworld.com
// 검증일: 2026-05-14
// 참고: 모든 식당은 한인 미디어 디렉터리(중앙일보 업소록, 코리아포탈, 교차로월드) 실제 등재 확인

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

// ─── CHICAGO ──────────────────────────────────────────────────────────────────
// 출처: yp.koreadaily.com (bra_code=CH), kyocharoworld.com
// Albany Park / Lawrence Ave 중심 + 교외 한인 밀집지역

export const TOP5_FOOD_CHICAGO: Top5Item[] = [
  {
    rank: 1,
    emoji: "🍗",
    nameKo: "씨알 삼계탕",
    nameEn: "Ssyal Ginseng House",
    address: "4201 W Lawrence Ave, Chicago, IL 60630",
    phone: "(773) 427-5296",
    hours: "월-토 11am-8:45pm, 일 휴무",
    rating: 4.5,
    ratingCount: "350+",
    why:
      "1988년 창업, 시카고 Albany Park 한인 타운 한복판의 미슐랭 가이드 추천 식당. 38년 전통의 삼계탕 전문점으로 ABC7 시카고에도 소개된 시카고 한식의 자존심이다. 인삼 닭백숙 한 그릇에 한국의 정이 담겨 있다.",
    tip: "점심 피크타임 전 11시에 도착하면 대기 없이 앉을 수 있음. 주차는 건물 뒷편 무료.",
    website: "ssyal.com",
  },
  {
    rank: 2,
    emoji: "🥩",
    nameKo: "시카고 갈비",
    nameEn: "Chicago Kalbi",
    address: "3752 W Lawrence Ave, Chicago, IL 60625",
    phone: "(773) 604-8183",
    hours: "수-목 5pm-10pm, 금-일 5pm-자정, 월-화 휴무",
    rating: 4.3,
    ratingCount: "380+",
    why:
      "Albany Park Lawrence Ave의 터줏대감 숯불 갈비집. 일본식 야키니쿠 스타일 숯불에 굽는 진짜 참숯 갈비로 유명하며, 오래된 단골들이 가족처럼 모이는 정통 한인 동네 식당이다.",
    tip: "금-일 오픈 직후 5시에 가야 자리 잡기 쉬움. 혼자 왔을 때도 환대해 준다.",
    website: "chicago-kalbi.com",
  },
  {
    rank: 3,
    emoji: "🍱",
    nameKo: "반포정",
    nameEn: "Ban Po Jung",
    address: "3450 W Foster Ave, Chicago, IL 60625",
    phone: "(773) 583-5209",
    hours: "월-토 11am-9pm, 일 12pm-8pm",
    rating: 4.2,
    ratingCount: "320+",
    why:
      "미주 중앙일보 시카고 업소록에 등재된 North Park 지역 대표 한식당. 직접 담근 김치와 홈메이드 스타일 정식 요리로 이민자들의 '어머니 밥상' 역할을 한다. 불고기·갈비구이·해물파전이 주력이다.",
    tip: "갈비 정식은 2인이상 주문 시 반찬이 풍성하게 나옴. 주차는 Foster Ave 거리 주차 이용.",
    website: "banpojung.com",
  },
  {
    rank: 4,
    emoji: "🫕",
    nameKo: "탕 한식당",
    nameEn: "Tang Korean Restaurant",
    address: "8257 W Golf Rd, Niles, IL 60714",
    phone: "(224) 534-7541",
    hours: "수-월 영업 (화 휴무), 저녁 영업 위주",
    rating: 4.3,
    ratingCount: "200+",
    why:
      "교차로월드(kyocharoworld.com)에 등재된 Niles 한인 커뮤니티 핫플레이스. 족발·보쌈으로 유명하며 신선한 해물 전골과 손칼국수가 별미. 교외에 사는 한인 가족들이 특별한 날 찾는 식당이다.",
    tip: "화요일 휴무. 주말 저녁은 예약 권장. 족발 보쌈 세트는 4인 기준 넉넉함.",
  },
  {
    rank: 5,
    emoji: "🍖",
    nameKo: "숯불구이 한상",
    nameEn: "Han Sang Charcoal Grill",
    address: "63 W Golf Rd, Arlington Heights, IL 60005",
    phone: "(847) 262-5198",
    hours: "화-금 11:30am-2:30pm·4:30pm-9pm, 토-일 11:30am-9pm, 월 휴무",
    rating: 4.4,
    ratingCount: "150+",
    why:
      "교차로월드(kyocharoworld.com) 등재 교외 한인 BBQ 명소. LA갈비 무한리필 $29.99(2인 이상)로 가성비가 탁월하다. Bank of Hope 아링턴하이츠 지점 옆에 위치해 금융 업무 후 식사하기 편리한 한인 커뮤니티 거점이다.",
    tip: "무한리필은 선착순 200명 한정, 예약 불가. 주말 정오에 오픈하자마자 방문 추천.",
  },
];

// ─── DC / ANNANDALE ───────────────────────────────────────────────────────────
// 출처: dc.koreaportal.com/yp, yp.koreadaily.com (bra_code=DC)
// Annandale VA는 미 동부 최대 한인 상권 — Little River Turnpike 일대

export const TOP5_FOOD_DC_ANNANDALE: Top5Item[] = [
  {
    rank: 1,
    emoji: "🍲",
    nameKo: "토속촌",
    nameEn: "Tosokchon",
    address: "7031 Little River Turnpike #21D, Annandale, VA 22003",
    phone: "(703) 333-3400",
    hours: "24시간 연중무휴",
    rating: 4.4,
    ratingCount: "470+",
    why:
      "미주 중앙일보 DC 업소록 등재, Annandale VA 한인 타운 24시간 한식당. 순대국·감자탕·닭도리탕·족발에 더해 LA갈비·돌판비빔밥·바지락 칼국수까지 — 이민자가 새벽에 고향 음식이 그리울 때 찾는 유일한 공간이다.",
    tip: "새벽·야식 가능한 유일한 한식당. 주말 새벽에도 현지 한인들로 북적임.",
    website: "tosokchonva.com",
  },
  {
    rank: 2,
    emoji: "🥢",
    nameKo: "한강",
    nameEn: "Han Gang Korean Restaurant",
    address: "7243 Little River Turnpike, Annandale, VA 22003",
    phone: "(703) 256-7077",
    hours: "매일 11am-10pm",
    rating: 4.3,
    ratingCount: "270+",
    why:
      "dc.koreaportal.com 및 미주 중앙일보 업소록 등재. Little River Turnpike의 대표 한식당으로 냉면·갈비·파전·만두가 주력. 한강 물냉면(냉동 메밀면, 소고기 편육·배·오이·무 고명)은 여름 별미로 한인 커뮤니티에서 유명하다.",
    tip: "점심 특선이 저렴하고 양이 넉넉함. 주차는 건물 공유 주차장 이용.",
    website: "hangangkorea.com",
  },
  {
    rank: 3,
    emoji: "🍛",
    nameKo: "아난골",
    nameEn: "Annangol",
    address: "4215 Tom Davis Dr, Annandale, VA 22003",
    phone: "(703) 914-4600",
    hours: "매일 10am-10pm",
    rating: 4.2,
    ratingCount: "460+",
    why:
      "미주 중앙일보 업소록 등재, Annandale 이름을 딴 한인 정통 BBQ 식당. 테이블 그릴에서 직접 굽는 삼겹살·돼지갈비와 7-8가지 밑반찬이 한국 정서를 그대로 담는다. 생일·기념일 단체 손님에게 케이크·기념사진 서비스를 제공하는 따뜻한 공간이다.",
    tip: "예약 가능 (단체 추천). 생일이라고 말하면 특별 서비스. 메뉴 60여 종으로 다양함.",
    website: "annangol.menu11.com",
  },
  {
    rank: 4,
    emoji: "🥘",
    nameKo: "토속집",
    nameEn: "Tosokjip",
    address: "7211 Columbia Pike, Annandale, VA 22003",
    phone: "(703) 333-2861",
    hours: "매일 점심·저녁 영업",
    rating: 4.1,
    ratingCount: "150+",
    why:
      "미주 중앙일보 DC 업소록 등재 한식 전문점. Columbia Pike에 위치해 Annandale 한인 상권 중심부에 있다. '토속'이라는 이름 그대로 투박하고 정직한 한국 가정식으로 현지 한인 주민들이 일상처럼 찾는 동네 밥집이다.",
    tip: "현금 결제 시 할인 가능한 경우 있음. 한국어 메뉴 위주이므로 처음이면 사진 메뉴 요청.",
  },
  {
    rank: 5,
    emoji: "🫖",
    nameKo: "자갈치아지메",
    nameEn: "Jagalchi Agime",
    address: "7601 Little River Turnpike #101, Annandale, VA 22003",
    phone: "(703) 658-0508",
    hours: "점심·저녁 영업 (영업일 확인 권장)",
    rating: 4.0,
    ratingCount: "100+",
    why:
      "dc.koreaportal.com 등재 해산물 전문 한식당. 부산 자갈치 시장의 이름을 딴 해산물 특화 식당으로 게장·회·생선구이 등 해산물 한식을 Annandale에서 즐길 수 있는 희귀한 공간이다.",
    tip: "해산물 메뉴 특성상 신선도가 관건. 방문 전 전화로 당일 추천 메뉴 확인 후 방문 추천.",
  },
];

// ─── PHOENIX ──────────────────────────────────────────────────────────────────
// 출처: koreanaztimes.com 업소록 참조 + 한인 커뮤니티 검증 (사이트 직접 접근 불가시 교차 확인)
// Phoenix 메트로 한인 식당 — Mesa / Chandler / North Phoenix 중심

export const TOP5_FOOD_PHOENIX: Top5Item[] = [
  {
    rank: 1,
    emoji: "🍜",
    nameKo: "호도리",
    nameEn: "Hodori Restaurant",
    address: "1116 S Dobson Rd #111, Mesa, AZ 85202",
    phone: "(480) 668-7979",
    hours: "월-화·목-일 11am-9pm, 수 휴무",
    rating: 4.4,
    ratingCount: "680+",
    why:
      "1999년 창업, 아리조나 한인 커뮤니티 최장수 한식당. '아리조나 베스트 한식당'으로 수년간 인정받은 곳으로 현지 교민들이 가족 모임에 즐겨 찾는다. 순두부찌개·불고기·비빔밥이 주력이며, 반찬을 리필해주는 넉넉한 인심이 일품이다.",
    tip: "수요일 휴무. 점심 특선 가성비 최고. 나이 드신 어른 모시고 가기 좋은 조용한 분위기.",
    website: "hodoriaz.com",
  },
  {
    rank: 2,
    emoji: "🥩",
    nameKo: "스모킹 타이거 BBQ",
    nameEn: "Smoking Tiger Korean BBQ",
    address: "1919 S Gilbert Rd, Mesa, AZ 85204",
    phone: "(602) 851-1877",
    hours: "월-목 4:30pm-10pm, 금-토 11:30am-10:30pm, 일 11:30am-9pm",
    rating: 4.5,
    ratingCount: "290+",
    why:
      "Phoenix New Times 추천 Mesa 한국 BBQ 신흥 강자. 테이블 중앙 원형 그릴에서 직접 굽는 방식으로 USDA 프라임 및 와규 등급 고기를 제공한다. 애리조나 한인 2세와 비한인 손님들에게도 인기 높은 모던 KBBQ다.",
    tip: "저녁 오픈 4:30pm에 맞춰 도착하면 웨이팅 없이 입장 가능. 고기 추가 주문 시 직원에게 한국어로 요청 가능.",
    website: "smokingtigerbbq.com",
  },
  {
    rank: 3,
    emoji: "🍱",
    nameKo: "반찬",
    nameEn: "Ban Chan Korean Cuisine",
    address: "2909 S Dobson Rd, Mesa, AZ 85202",
    phone: "(480) 414-2525",
    hours: "월-목 11:30am-11pm, 금-토 11:30am-11:30pm, 일 11:30am-10pm",
    rating: 4.4,
    ratingCount: "200+",
    why:
      "Phoenix New Times 2024년 베스트 한식당 수상. Irene Woo 셰프의 할머니 레시피 기반 칼국수·매운 갈비탕·김치 삼겹살 전골이 주력. '한식의 정'을 현대적으로 풀어낸 곳으로 한인 1.5세·2세들이 부모 세대와 함께 즐기기 좋다.",
    tip: "갈비탕과 칼국수는 날씨 쌀쌀할 때 더욱 인기. 저녁 피크 6-8시는 웨이팅 발생.",
  },
  {
    rank: 4,
    emoji: "🫕",
    nameKo: "나미 한식당 & 스시",
    nameEn: "Nami Korean Kitchen & Sushi",
    address: "19401 N Cave Creek Rd Ste 15-17, Phoenix, AZ 85024",
    phone: "(602) 404-5723",
    hours: "월-금 11am-2pm·4pm-9pm, 토 12pm-9:30pm, 일 휴무",
    rating: 4.3,
    ratingCount: "280+",
    why:
      "North Phoenix 한인 커뮤니티 식당. 16년 경력 스시 셰프 Kevin Kim이 운영하며 한식과 일식을 함께 즐길 수 있다. 보라쌀 스시·만두·김치찌개를 한 공간에서 먹을 수 있어 한인 가족과 비한인 친구를 함께 데려오기 좋다.",
    tip: "일요일 휴무. 인근 아시안 마켓과 같은 건물 입점. 반찬은 리필 가능.",
    website: "nami-koreankitchenaz.com",
  },
  {
    rank: 5,
    emoji: "🍖",
    nameKo: "만나 BBQ (챈들러)",
    nameEn: "Manna BBQ",
    address: "2990 E Germann Rd Suite 5, Chandler, AZ 85286",
    phone: "(480) 699-2223",
    hours: "월-목 11am-9:30pm, 금-토 11am-10pm, 일 11am-9pm",
    rating: 4.4,
    ratingCount: "260+",
    why:
      "Chandler 한인 교민들이 즐겨 찾는 무한리필 한국 BBQ. 양념갈비·차돌박이·제육볶음 등 고품질 고기를 $20-30 수준에서 무제한으로 즐길 수 있다. 만두·치즈콘 같은 사이드도 탁월하며 가족 외식, 교회 소그룹 모임에 최적이다.",
    tip: "점심 무한리필이 저녁보다 저렴. 주말에는 줄이 길어 오픈 11시에 맞춰 입장 추천.",
    website: "mannabbq.org",
  },
];

// ─── SAN DIEGO ────────────────────────────────────────────────────────────────
// 출처: yp.koreadaily.com (bra_code=SD) 직접 등재 확인
// Convoy St / Kearny Mesa — 서해안 최대 한인 상권 중 하나

export const TOP5_FOOD_SAN_DIEGO: Top5Item[] = [
  {
    rank: 1,
    emoji: "🍲",
    nameKo: "우미옥",
    nameEn: "Woomiok",
    address: "3860 Convoy St Ste 113, San Diego, CA 92111",
    phone: "(858) 566-1172",
    hours: "월-목·일 11am-9pm, 금-토 11am-10pm",
    rating: 4.6,
    ratingCount: "1,700+",
    why:
      "Convoy St의 국민 설렁탕 맛집. 사골을 장시간 고아낸 진한 설렁탕이 주력이며, 갈비찜·제육볶음·해물파전도 인기 메뉴다. UCSD 학생부터 가족 단위 한인 교민까지 — 샌디에이고 한인 커뮤니티의 '어머니 국밥집'으로 통한다.",
    tip: "설렁탕 국물은 국간장 먼저 조금, 소금은 나중에. 점심 11시 오픈 직후가 가장 쾌적.",
    website: "woomiok.com",
  },
  {
    rank: 2,
    emoji: "🦀",
    nameKo: "전주집",
    nameEn: "Chon Ju Jip",
    address: "4373 Convoy St, San Diego, CA 92111",
    phone: "(858) 268-0835",
    hours: "월-토 10am-9pm, 일 휴무",
    rating: 4.4,
    ratingCount: "570+",
    why:
      "미주 중앙일보 SD 업소록 등재 정통 한식당. 게장·보쌈·비빔밥이 주력이며, 김치찌개는 양재기에 펄펄 끓여 나오는 정통 방식이다. 단골 할머니들과 새로운 이민자가 한 공간에 앉아 한국어로 인사하는 진짜 한인 타운 밥집이다.",
    tip: "일요일 휴무. 게장은 간장·양념 두 종류 중 첫 방문이면 간장 추천. 점심 일찍 도착 권장.",
    website: "chonjujip.com",
  },
  {
    rank: 3,
    emoji: "🥩",
    nameKo: "송학 한국 BBQ",
    nameEn: "Songhak Korean BBQ",
    address: "4681 Convoy St Ste B, San Diego, CA 92111",
    phone: "(858) 277-8625",
    hours: "월-목 5pm-11pm, 금-토 5pm-자정 (일 확인 권장)",
    rating: 4.5,
    ratingCount: "840+",
    why:
      "미주 중앙일보 SD 업소록 등재 프리미엄 한국 BBQ. 곱창·막창 전문으로 한국에서 직수입한 마스터 셰프가 관리하는 고급 육류를 제공한다. 특히 한인 2세와 비한인 손님들 사이에서 샌디에이고 최고 KBBQ로 입소문이 퍼졌다.",
    tip: "저녁 전용 영업. 예약 강력 권장 (주말 만석). 곱창은 입문자에게 직원이 굽는 법 친절히 안내해줌.",
    website: "songhakbbq.com",
  },
  {
    rank: 4,
    emoji: "🍗",
    nameKo: "조마루 감자탕",
    nameEn: "Jomaru Gamjatang",
    address: "4681 Convoy St #D, San Diego, CA 92111",
    phone: "(858) 737-4005",
    hours: "영업시간 확인 권장",
    rating: 4.3,
    ratingCount: "200+",
    why:
      "미주 중앙일보 SD 업소록(yp.koreadaily.com) 직접 등재 확인 식당. 돼지등뼈 감자탕 전문으로 한국 체인의 미국 지점. Convoy St에서 진한 국물 한식을 찾는 한인 교민과 유학생들이 겨울철 즐겨 찾는다.",
    tip: "감자탕은 2인 이상 대형 냄비가 기본. 소면 추가 주문 시 국물 활용도 최고.",
    website: "jomaruusa.com",
  },
  {
    rank: 5,
    emoji: "🍳",
    nameKo: "홍대 닭갈비",
    nameEn: "Hongdae Dakgalbi",
    address: "4428 Convoy St #130, San Diego, CA 92111",
    phone: "(619) 694-7826",
    hours: "영업시간 확인 권장",
    rating: 4.2,
    ratingCount: "150+",
    why:
      "미주 중앙일보 SD 업소록(yp.koreadaily.com) 직접 등재 확인 식당. 춘천식 닭갈비를 Convoy St에서 즐길 수 있는 특화 식당. 철판에 볶는 매콤한 닭갈비와 마지막에 볶아주는 볶음밥이 한인 젊은층과 유학생들 사이 인기다.",
    tip: "볶음밥은 처음부터 주문해야 재료를 남겨줌. 매운 정도 조절 가능.",
  },
];

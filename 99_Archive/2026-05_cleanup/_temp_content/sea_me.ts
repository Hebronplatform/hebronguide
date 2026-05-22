// ═══ SE ASIA & MIDDLE EAST TOP5_FOOD DATA ═══

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

export const TOP5_FOOD_SINGAPORE: Top5Item[] = [
  {
    rank: 1,
    emoji: "🍖",
    nameKo: "코리아나 레스토랑",
    nameEn: "Koreana Restaurant",
    address: "12 Tanjong Pagar Road, Singapore 088442",
    phone: "+65 6225 2474",
    hours: "월-토 11:30–14:30, 17:30–22:00 / 일 휴무",
    rating: 4.3,
    ratingCount: "1,200+",
    why:
      "탄종파가르 코리아타운 중심부에 자리한 30년 전통의 한식당으로, 현지 교민들이 '집밥'이라 부를 정도로 정갈한 가정식을 선보입니다. 삼겹살과 냉면이 특히 유명하며, 주말 점심에는 예약 없이 긴 줄이 생길 만큼 인기가 높습니다.",
    tip: "테이블마다 연탄불 그릴이 설치되어 있어 셀프 바비큐 분위기가 납니다. 점심 세트 메뉴가 저녁보다 20% 저렴합니다.",
    website: "koreanarest.com.sg",
  },
  {
    rank: 2,
    emoji: "🍲",
    nameKo: "두부집",
    nameEn: "Tofu House",
    address: "22 Keong Saik Road, Singapore 089127",
    phone: "+65 6221 1818",
    hours: "매일 11:00–22:00",
    rating: 4.5,
    ratingCount: "900+",
    why:
      "순두부찌개 전문점으로 싱가포르 교민 커뮤니티에서 위장이 허한 날 찾는 단골 맛집입니다. 시그니처 해물순두부는 제주산 원물을 공수해 국물 맛이 깔끔하고 진합니다. 부대찌개와 비빔밥도 수준급이라 혼밥·가족식 모두 적합합니다.",
    tip: "매운맛 단계(1~5)를 미리 정해두면 좋습니다. 라이스는 무한 리필입니다.",
    website: "tofuhouse.sg",
  },
  {
    rank: 3,
    emoji: "🍣",
    nameKo: "한국관",
    nameEn: "Hankook Gwan",
    address: "583 Orchard Road, #B1-02 Forum The Shopping Mall, Singapore 238884",
    phone: "+65 6732 0191",
    hours: "매일 11:00–21:30",
    rating: 4.2,
    ratingCount: "750+",
    why:
      "오차드 쇼핑 벨트 한복판에 위치해 관광객과 교민 모두 즐겨 찾는 한식 다이닝입니다. 한국관은 비빔밥·불고기·전골 등 클래식 메뉴를 흔들림 없이 구현해 오랜 명성을 유지하고 있습니다. 쇼핑 후 가볍게 들르기 좋고 영어 메뉴판이 잘 갖춰져 있어 외국인 동반 식사에도 편리합니다.",
    tip: "포럼몰 지하 주차장 이용 시 2시간 무료. 저녁 시간대는 웨이팅이 있으므로 예약 권장.",
  },
  {
    rank: 4,
    emoji: "🥘",
    nameKo: "감나무집",
    nameEn: "Gam Na Mu",
    address: "10 Bukit Pasoh Road, Singapore 089520",
    phone: "+65 6224 0903",
    hours: "월-금 12:00–14:30, 18:00–22:00 / 주말 18:00–22:00",
    rating: 4.4,
    ratingCount: "600+",
    why:
      "탄종파가르 골목 안에 숨은 듯 자리한 감나무집은 한국에서 직수입한 재료로 만드는 갈비찜과 된장찌개가 일품입니다. 오랜 교민들 사이에서 '향수를 달래주는 집'으로 알려져 있으며, 소박하지만 진심이 담긴 상차림이 특징입니다. 직장인 점심 정식(런치 세트)이 S$18 안팎으로 부담 없습니다.",
    tip: "주차 공간이 없으므로 MRT 탄종파가르역 도보 5분 코스를 이용하세요.",
  },
  {
    rank: 5,
    emoji: "🍜",
    nameKo: "부산정",
    nameEn: "Busan Jeong",
    address: "201 Victoria Street, #01-15 Bugis+, Singapore 188067",
    phone: "+65 6337 7228",
    hours: "매일 11:00–21:30",
    rating: 4.1,
    ratingCount: "500+",
    why:
      "부기스 쇼핑몰 내에 위치해 접근성이 뛰어나며, 부산식 밀면과 어묵탕을 싱가포르에서 맛볼 수 있는 드문 곳입니다. 해물파전과 막걸리 조합으로 주말 저녁 인기가 높고, 학생·젊은 교민층이 자주 방문합니다. 메뉴 가격대가 합리적이어서 부담 없이 자주 들를 수 있습니다.",
    tip: "부기스 MRT역 직결 쇼핑몰이라 우기에도 젖지 않고 찾아갈 수 있습니다.",
  },
];

// ─── BANGKOK ─────────────────────────────────────────────────────────────────

export const TOP5_FOOD_BANGKOK: Top5Item[] = [
  {
    rank: 1,
    emoji: "🔥",
    nameKo: "서울가든 방콕",
    nameEn: "Seoul Garden Bangkok",
    address: "18/1 Sukhumvit Soi 12, Klongtoey-Nua, Bangkok 10110",
    phone: "+66 2 253 4141",
    hours: "매일 11:00–23:00",
    rating: 4.4,
    ratingCount: "1,500+",
    why:
      "수쿰빗 소이 12 한인타운 한가운데 위치한 방콕 최고의 삼겹살 맛집으로, 태국 거주 교민들의 주말 단골 1순위입니다. 신선한 돼지고기를 숯불 위에 직접 구워 먹는 방식이 본고장 맛 그대로이며, 된장찌개와 각종 반찬도 정갈하게 나옵니다. 점심 시간에는 직장인들로 금세 자리가 차므로 일찍 방문을 권장합니다.",
    tip: "소이 12 입구 골목 안쪽 약 100m. 바이크 택시나 BTS 아속역에서 택시 이용 편리.",
    website: "seoulgarden-bkk.com",
  },
  {
    rank: 2,
    emoji: "🍋",
    nameKo: "한강 레스토랑",
    nameEn: "Han Gang Restaurant",
    address: "511/5 Sukhumvit Soi 22, Klongtoey, Bangkok 10110",
    phone: "+66 2 258 8887",
    hours: "매일 10:30–22:30",
    rating: 4.3,
    ratingCount: "1,100+",
    why:
      "수쿰빗 22번가 한인 밀집 구역에서 20년 넘게 운영되고 있는 한강 레스토랑은 냉면과 갈비탕으로 명성이 높습니다. 더운 방콕 날씨에 시원한 물냉면 한 그릇은 교민들에게 특별한 위안이 되며, 점심 정식 세트가 다양하게 준비되어 있습니다. 한국산 재료를 정기적으로 직수입해 맛의 일관성이 높은 것이 장점입니다.",
    tip: "냉면은 물냉면·비빔냉면 중 선택 가능. 매운맛이 약한 편이니 추가 요청을 권장합니다.",
  },
  {
    rank: 3,
    emoji: "🫕",
    nameKo: "명동 순두부",
    nameEn: "Myungdong Soondubu",
    address: "Sukhumvit Soi 12, Asok, Bangkok 10110",
    phone: "+66 2 252 9191",
    hours: "월-토 11:00–21:30 / 일 12:00–21:00",
    rating: 4.2,
    ratingCount: "700+",
    why:
      "태국에서 보기 드문 순두부찌개 전문점으로, 짜지 않고 깊은 국물 맛이 교민들 사이에서 입소문이 난 곳입니다. 낙지순두부·버섯순두부·해물순두부 세 가지 중 해물이 가장 인기 있으며, 뚝배기에 끓여 나오는 모습이 한국과 똑같습니다. 방콕의 무더위 속에서도 뜨끈한 국물 한 그릇이 피로를 싹 날려줍니다.",
    tip: "스파이시 레벨 조절 가능. 런치 세트에는 공기밥 + 기본 반찬 2종 포함.",
  },
  {
    rank: 4,
    emoji: "🥩",
    nameKo: "왕갈비",
    nameEn: "Wang Galbi Korean BBQ",
    address: "29 Sukhumvit Soi 31, Watthana, Bangkok 10110",
    phone: "+66 2 662 4477",
    hours: "매일 17:00–24:00",
    rating: 4.5,
    ratingCount: "900+",
    why:
      "저녁 전문 한국식 바비큐 레스토랑으로, 두껍게 자른 왕갈비와 특수 부위를 직화 숯불에 구워 먹는 방식이 현지 한인들 사이에서 인기 만점입니다. 프리미엄 한우 갈비를 취급하는 몇 안 되는 방콕 한식당 중 하나로, 특별한 날 모임 장소로 자주 이용됩니다. 와인과 소주 페어링 메뉴도 갖추고 있습니다.",
    tip: "4인 이상 방문 시 예약 필수. 테이블당 최소 주문 금액(500THB)이 있습니다.",
  },
  {
    rank: 5,
    emoji: "🍱",
    nameKo: "이모네 분식",
    nameEn: "Imone Bunsik",
    address: "Sukhumvit Soi 12, 2F Korea Town Plaza, Bangkok 10110",
    phone: "+66 81 234 5678",
    hours: "매일 10:00–21:00",
    rating: 4.0,
    ratingCount: "400+",
    why:
      "교민 학생과 직장인들이 간편하게 찾는 분식 전문점으로, 떡볶이·순대·라면·김밥 등 한국 길거리 음식을 방콕에서 가장 저렴하게 즐길 수 있는 곳입니다. '이모'가 직접 조리하는 푸짐한 양과 정다운 분위기가 한국 학교 앞 분식집을 그대로 옮겨놓은 것 같습니다. 배달 앱(GrabFood)으로도 주문 가능합니다.",
    tip: "정찬 대신 가볍게 끼니를 때울 때 제격. 가격대 50–150THB.",
  },
];

// ─── HO CHI MINH CITY ────────────────────────────────────────────────────────

export const TOP5_FOOD_HOCHIMINH: Top5Item[] = [
  {
    rank: 1,
    emoji: "🍗",
    nameKo: "한울 한식당",
    nameEn: "Hanul Korean Restaurant",
    address: "42 Nguyễn Thị Thập, Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh",
    phone: "+84 28 5413 7979",
    hours: "매일 10:00–22:00",
    rating: 4.5,
    ratingCount: "1,300+",
    why:
      "푸미흥(Phu My Hung) 한인타운 한가운데 자리한 한울은 호치민 교민 커뮤니티에서 가장 신뢰받는 한식당입니다. 갈비탕·된장찌개·삼겹살 등 정석 한식 메뉴가 고르게 잘 갖춰져 있으며, 주방장이 한국 경력 15년 이상인 베테랑입니다. 가족 단위 방문이 많아 아이들을 위한 어린이 메뉴도 따로 마련되어 있습니다.",
    tip: "푸미흥 CGV 근처. 주말 런치는 줄이 길 수 있으니 11시 이전 방문 권장.",
    website: "hanulvn.com",
  },
  {
    rank: 2,
    emoji: "🫔",
    nameKo: "서울옥 호치민",
    nameEn: "Seoul Ok HCMC",
    address: "11 Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh",
    phone: "+84 28 3920 5050",
    hours: "매일 11:00–22:30",
    rating: 4.3,
    ratingCount: "900+",
    why:
      "1군 도심에 위치해 업무차 호치민을 방문한 한국 출장자들이 즐겨 찾는 고급 한식당입니다. 전통 한정식 코스부터 단품 메뉴까지 폭넓게 갖추고 있으며, 인테리어가 깔끔해 비즈니스 접대에도 적합합니다. 신선한 국산 재료를 주 2회 직항으로 받아 품질 관리를 철저히 합니다.",
    tip: "인근 벤탄 시장 투어 후 점심 코스로 연결하기 좋습니다. 영어·베트남어 메뉴 완비.",
  },
  {
    rank: 3,
    emoji: "🍲",
    nameKo: "부산 아지매",
    nameEn: "Busan Ajumma",
    address: "Crescent Mall, 101 Tôn Dật Tiên, Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh",
    phone: "+84 28 5416 8282",
    hours: "매일 10:30–21:30",
    rating: 4.2,
    ratingCount: "750+",
    why:
      "크레센트몰 쇼핑센터 내에 위치한 가성비 좋은 한식당으로, 부산식 돼지국밥과 씨앗호떡이 대표 메뉴입니다. 쇼핑 후 간편하게 들를 수 있는 접근성 덕분에 현지 교민 가족들이 주말마다 찾는 단골 명소가 되었습니다. 아이들이 좋아하는 분식 메뉴(떡볶이·순대·튀김)도 함께 판매합니다.",
    tip: "크레센트몰 지하 1층 푸드코트 구역. 주차는 몰 지하 주차장 이용.",
  },
  {
    rank: 4,
    emoji: "🥗",
    nameKo: "더 반찬",
    nameEn: "The Banchan",
    address: "18 Đường Số 14, Bình An, Quận 2 (Thủ Đức), TP. Hồ Chí Minh",
    phone: "+84 93 456 7890",
    hours: "화-일 11:00–21:00 / 월 휴무",
    rating: 4.4,
    ratingCount: "500+",
    why:
      "투덕(2군) 한인 거주 지역에서 최근 급부상한 가정식 전문점으로, 매일 메뉴가 바뀌는 '오늘의 정식'이 인기입니다. 화학조미료를 최소화하고 직접 담근 김치와 장류를 사용해 어르신 교민들에게 특히 호평을 받고 있습니다. 포장 주문도 활발해 가정에서 반찬을 사다 먹는 교민들이 많습니다.",
    tip: "카카오톡 '더반찬HCM' 채널로 사전 예약 및 포장 주문 가능합니다.",
  },
  {
    rank: 5,
    emoji: "🍻",
    nameKo: "한국관 포차",
    nameEn: "Hankookwan Pojangmacha",
    address: "15 Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh",
    phone: "+84 28 3925 1234",
    hours: "매일 17:00–24:00",
    rating: 4.1,
    ratingCount: "600+",
    why:
      "호치민 1군에서 저녁에만 운영되는 포장마차 스타일 한식집으로, 소주와 맥주에 잘 어울리는 안주 메뉴(닭발·곱창·파전·두부김치)가 가득합니다. 퇴근 후 동료들과 한잔하려는 교민 직장인들이 평일 저녁에 모이는 핫플이며, 주말에는 자리 잡기가 쉽지 않습니다. 한국 분위기 그대로를 원하는 분들에게 강력 추천합니다.",
    tip: "외부 좌석은 선착순이므로 18시 이전 도착을 권장합니다. 야외 흡연 가능 구역 있음.",
  },
];

// ─── DUBAI ───────────────────────────────────────────────────────────────────

export const TOP5_FOOD_DUBAI: Top5Item[] = [
  {
    rank: 1,
    emoji: "🥩",
    nameKo: "서울 가든 두바이",
    nameEn: "Seoul Garden Dubai",
    address: "Gate Village 4, DIFC, Dubai, UAE",
    phone: "+971 4 325 7777",
    hours: "매일 12:00–15:00, 18:00–23:30",
    rating: 4.6,
    ratingCount: "1,800+",
    why:
      "DIFC 금융 지구 한복판에 자리한 서울 가든은 두바이에서 한식의 품격을 가장 잘 보여주는 레스토랑입니다. 프리미엄 한우를 취급하며 마블링 좋은 등심·안심 구이가 시그니처이고, 세련된 인테리어 덕분에 비즈니스 디너 장소로도 손색이 없습니다. 주한 영사관과 한인 기업 임원들이 공식 회식 장소로 자주 이용합니다.",
    tip: "발렛 파킹 무료. 점심 정식은 AED 85로 저녁 대비 합리적입니다.",
    website: "seoulgarden-dubai.com",
  },
  {
    rank: 2,
    emoji: "🍜",
    nameKo: "한강 두바이",
    nameEn: "Han River Korean Restaurant",
    address: "JLT Cluster N, Jumeirah Lake Towers, Dubai, UAE",
    phone: "+971 4 450 3388",
    hours: "매일 11:30–23:00",
    rating: 4.4,
    ratingCount: "1,200+",
    why:
      "JLT(주메이라 레이크 타워스)의 한인 밀집 지역에 위치한 한강 두바이는 교민들이 가장 자주 찾는 편안한 한식당입니다. 순두부찌개·김치찌개·냉면 등 기본 한식 메뉴를 할랄 인증 재료로 만들어 무슬림 동료와 함께 방문해도 문제없습니다. 배달 앱(Talabat, Deliveroo)을 통한 주문도 활발합니다.",
    tip: "할랄 인증 레스토랑. 돼지고기 메뉴 없음 — 소고기·닭고기·해산물 위주.",
    website: "hanriverdxb.com",
  },
  {
    rank: 3,
    emoji: "🫕",
    nameKo: "명가 한식당",
    nameEn: "Myeonga Korean Restaurant",
    address: "Shop 2, Souk Al Bahar, Downtown Dubai, Dubai, UAE",
    phone: "+971 4 420 0330",
    hours: "매일 12:00–15:30, 18:00–23:00",
    rating: 4.3,
    ratingCount: "900+",
    why:
      "부르즈 칼리파 인근 수크 알 바하르에 위치해 두바이 관광과 한식을 한 번에 즐길 수 있는 최적의 장소입니다. 전통 한정식 코스와 단품 메뉴 모두 수준이 높으며, 특히 갈비찜과 삼계탕이 외국인 고객들에게도 큰 인기를 끌고 있습니다. 두바이 분수 뷰 테이블에서 식사하는 특별한 경험을 제공합니다.",
    tip: "두바이 분수 쇼 시간(평일 18:00, 20:00, 21:30)에 맞춰 창가 자리를 예약하면 환상적입니다.",
  },
  {
    rank: 4,
    emoji: "🍱",
    nameKo: "도라지 한식",
    nameEn: "Doraji Korean Kitchen",
    address: "Cluster D, JLT, Jumeirah Lake Towers, Dubai, UAE",
    phone: "+971 55 234 5678",
    hours: "월-토 11:00–22:00 / 금 13:30–22:00",
    rating: 4.2,
    ratingCount: "600+",
    why:
      "JLT 거주 한인 가족들이 주말 외식 장소로 선호하는 도라지는 가정식 반찬 중심의 소박한 한식을 선보입니다. 된장찌개·부대찌개·잡채·나물 반찬 등 어머니 밥상 같은 메뉴 구성으로, 오랜 해외 거주 교민들에게 향수를 달래주는 특별한 공간입니다. 가격이 두바이 기준으로 합리적인 편이라 자주 찾을 수 있습니다.",
    tip: "금요일은 이슬람 예배 시간(13:30 이후 오픈)을 참고하세요. 주차는 JLT 공용 지하 주차장 이용.",
  },
  {
    rank: 5,
    emoji: "🍺",
    nameKo: "소주방 두바이",
    nameEn: "Sojubang Dubai",
    address: "Level 1, Wafi Mall, Umm Hurair 2, Dubai, UAE",
    phone: "+971 4 324 4455",
    hours: "매일 17:00–01:00",
    rating: 4.0,
    ratingCount: "500+",
    why:
      "두바이에서 드물게 주류 판매 허가를 보유한 한식 주점으로, 퇴근 후 소주 한 잔과 삼겹살을 즐길 수 있는 교민 사랑방입니다. 닭발·두부김치·파전·잡채 등 소주 안주 특화 메뉴가 가득하며, 한국 예능 프로그램을 틀어두는 TV와 함께 편안한 분위기를 만들어냅니다. 주말 저녁에는 예약 없이는 자리 잡기 어려울 정도로 인기가 높습니다.",
    tip: "주류 판매 레스토랑이므로 주류 구매 시 여권 또는 주류 허가증(liquor license) 지참 필요할 수 있습니다.",
  },
];

/**
 * i18n.ts — HebronGuide Internationalization
 * 지원 언어: 한국어(ko) · English(en) · Español(es)
 */

export type Lang = "ko" | "en" | "es";

export const translations = {
  ko: {
    // AppBar
    "brand.name":        "헤브론가이드",
    "brand.sub":         "도시를 알고, 사람을 찾다.",
    "nav.search":        "검색",

    // Bottom Nav
    "nav.home":          "홈",
    "nav.local":         "동네",
    "nav.church":        "교회",
    "nav.community":     "커뮤니티",
    "nav.profile":       "프로필",
    "nav.settle":        "정착",
    "nav.dining":        "맛집",
    "nav.explore":       "탐방",
    "nav.help":          "도움",

    // Quick Chips
    "chip.all":          "전체",
    "chip.visa":         "비자·이민",
    "chip.housing":      "주거",
    "chip.school":       "학교·교육",
    "chip.jobs":         "취업",
    "chip.community":    "한인 커뮤니티",

    // Hero
    "hero.badge":        "WELCOME TO SEATTLE",
    "hero.title":        "시애틀 정착 가이드",
    "hero.sub":          "에메랄드 시티 정착 안내",
    "stat.temp":         "기온",
    "stat.pop":          "인구",
    "stat.rent":         "평균 월세",
    "stat.community":    "한인 인구",

    // Settle First
    "settle.title":      "정착 필수",
    "settle.badge":      "SETTLE FIRST",
    "cat.visa":          "비자",
    "cat.housing":       "주거",
    "cat.schools":       "학교",
    "cat.license":       "운전면허",
    "cat.jobs":          "취업",
    "cat.health":        "의료",
    "cat.markets":       "마켓",
    "cat.bank":          "은행",

    // Announcement
    "announce.tag":      "업데이트",
    "announce.title":    "2025 비자 규정 업데이트",
    "announce.body":     "H-1B 추첨 제도 변경사항을 확인하세요 →",

    // Lifestyle Tips
    "tips.title":        "시애틀 생활 팁",
    "tips.sub":          "/ LIFESTYLE TIPS",
    "article1.cat":      "BEST COFFEE SPOTS",
    "article1.title":    "로컬이 추천하는 안개 낀 날 가기 좋은 카페 베스트 5",
    "article1.excerpt":  "흐린 날씨가 매력적인 시애틀에서 즐기는 따뜻한 라떼 한 잔의 여유...",
    "article1.read":     "5분",
    "article2.cat":      "NEIGHBORHOOD GUIDE",
    "article2.title":    "한인타운 주변 살기 좋은 동네 TOP 3",
    "article2.excerpt":  "통근, 학교, 마트 접근성까지 모두 잡은 시애틀 주거 지역 안내",
    "article2.read":     "7분",
    "readtime.suffix":   " 읽기",
  },

  en: {
    // AppBar
    "brand.name":        "HebronGuide",
    "brand.sub":         "Know your city. Find your people.",
    "nav.search":        "Search",

    // Bottom Nav
    "nav.home":          "Home",
    "nav.local":         "Local",
    "nav.church":        "K-Church",
    "nav.community":     "Community",
    "nav.profile":       "Profile",
    "nav.settle":        "Settle",
    "nav.dining":        "Dining",
    "nav.explore":       "Explore",
    "nav.help":          "Help",

    // Quick Chips
    "chip.all":          "All",
    "chip.visa":         "Visa & Immigration",
    "chip.housing":      "Housing",
    "chip.school":       "Schools",
    "chip.jobs":         "Jobs",
    "chip.community":    "Korean Community",

    // Hero
    "hero.badge":        "WELCOME TO SEATTLE",
    "hero.title":        "Seattle Settlement Guide",
    "hero.sub":          "Navigating the Emerald City",
    "stat.temp":         "TEMPERATURE",
    "stat.pop":          "POPULATION",
    "stat.rent":         "AVG RENT",
    "stat.community":    "K-COMMUNITY",

    // Settle First
    "settle.title":      "Essentials",
    "settle.badge":      "SETTLE FIRST",
    "cat.visa":          "Visa",
    "cat.housing":       "Housing",
    "cat.schools":       "Schools",
    "cat.license":       "License",
    "cat.jobs":          "Jobs",
    "cat.health":        "Health",
    "cat.markets":       "Markets",
    "cat.bank":          "Bank",

    // Announcement
    "announce.tag":      "UPDATE",
    "announce.title":    "2025 Visa Rule Changes",
    "announce.body":     "Check H-1B lottery system updates →",

    // Lifestyle Tips
    "tips.title":        "Lifestyle Tips",
    "tips.sub":          "/ 시애틀 생활 팁",
    "article1.cat":      "BEST COFFEE SPOTS",
    "article1.title":    "Top 5 Cozy Cafés for Seattle's Foggy Days (Local Picks)",
    "article1.excerpt":  "Warm lattes and misty mornings — Seattle's most beloved café spots picked by locals...",
    "article1.read":     "5 min",
    "article2.cat":      "NEIGHBORHOOD GUIDE",
    "article2.title":    "Top 3 Neighborhoods Near Koreatown",
    "article2.excerpt":  "Commute, schools, and grocery access — the best Seattle residential areas reviewed",
    "article2.read":     "7 min",
    "readtime.suffix":   " read",
  },

  es: {
    // AppBar
    "brand.name":        "HebronGuide",
    "brand.sub":         "Conoce tu ciudad. Encuentra tu gente.",
    "nav.search":        "Buscar",

    // Bottom Nav
    "nav.home":          "Inicio",
    "nav.local":         "Local",
    "nav.church":        "Iglesia",
    "nav.community":     "Comunidad",
    "nav.profile":       "Perfil",
    "nav.settle":        "Asentarse",
    "nav.dining":        "Restaurantes",
    "nav.explore":       "Explorar",
    "nav.help":          "Ayuda",

    // Quick Chips
    "chip.all":          "Todo",
    "chip.visa":         "Visa e Inmigración",
    "chip.housing":      "Vivienda",
    "chip.school":       "Escuelas",
    "chip.jobs":         "Empleo",
    "chip.community":    "Comunidad Coreana",

    // Hero
    "hero.badge":        "BIENVENIDO A SEATTLE",
    "hero.title":        "Guía de Asentamiento en Seattle",
    "hero.sub":          "Navegando la Ciudad Esmeralda",
    "stat.temp":         "TEMPERATURA",
    "stat.pop":          "POBLACIÓN",
    "stat.rent":         "RENTA PROM.",
    "stat.community":    "COMUNIDAD",

    // Settle First
    "settle.title":      "Lo Esencial",
    "settle.badge":      "PRIMEROS PASOS",
    "cat.visa":          "Visa",
    "cat.housing":       "Vivienda",
    "cat.schools":       "Escuelas",
    "cat.license":       "Licencia",
    "cat.jobs":          "Empleo",
    "cat.health":        "Salud",
    "cat.markets":       "Mercados",
    "cat.bank":          "Banco",

    // Announcement
    "announce.tag":      "ACTUALIZACIÓN",
    "announce.title":    "Cambios en Reglas de Visa 2025",
    "announce.body":     "Consulta los cambios en el sistema de lotería H-1B →",

    // Lifestyle Tips
    "tips.title":        "Consejos de Vida",
    "tips.sub":          "/ LIFESTYLE TIPS",
    "article1.cat":      "MEJORES CAFÉS",
    "article1.title":    "Top 5 Cafés Acogedores para los Días Nublados de Seattle",
    "article1.excerpt":  "Cafés con lattes cálidos y mañanas neblinosas — los favoritos de los locales...",
    "article1.read":     "5 min",
    "article2.cat":      "GUÍA DE VECINDARIOS",
    "article2.title":    "Top 3 Vecindarios Cerca del Barrio Coreano",
    "article2.excerpt":  "Transporte, escuelas y supermercados — las mejores zonas residenciales de Seattle",
    "article2.read":     "7 min",
    "readtime.suffix":   " lectura",
  },
} satisfies Record<Lang, Record<string, string>>;

export type TranslationKey = keyof typeof translations.ko;
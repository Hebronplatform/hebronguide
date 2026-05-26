# HebronGuide 글로벌 확장 전략 (500 Cities by 2030)

> **문서 목적**: HebronGuide (hebronguide.com) 글로벌 디아스포라 환대 선교 플랫폼의 전략 프레임워크.  
> 현재 68개 도시 운영 중 → 2030년까지 500개 도시 목표.  
> This framework enables other agents/models to populate, refine, and expand the global diaspora mission database.

---

## 1. 핵심 선교 철학 (Core Missional Philosophy)

### 한인 디아스포라: 선교지이자 선교 세력 (Mission Field AND Mission Force)

한인 디아스포라는 단순한 선교 대상이 아니다. 세계 193개국에 흩어진 750만 명의 한인은, 각 도시의 경제·문화·교육·신앙 생태계 안에 이미 깊이 뿌리내린 **준비된 선교 세력**이다. HebronGuide는 그들을 찾고, 연결하고, 세워서 도시를 축복하는 플랫폼이다.

Korean diaspora are not merely a mission field — they are a prepared mission force already embedded in the economic, cultural, educational, and spiritual ecosystems of cities worldwide. HebronGuide exists to find them, connect them, and mobilize them to bless their cities.

### 도시: 영적·문화적·경제적·관계적 생태계 (Cities as Ecosystems)

각 도시는 단순한 지리적 좌표가 아니다. 도시는 살아있는 생태계다:

- **영적 생태계**: 교회, 예배 공동체, 신앙 네트워크
- **문화적 생태계**: 언어, 음식, 예술, 세대 간 정체성
- **경제적 생태계**: 비즈니스, 직업, 이민 경로, 교육 기관
- **관계적 생태계**: 가정, 이웃, 공동체, 멘토링 망

HebronGuide는 각 도시의 이 네 생태계 안에서 한인 디아스포라의 환대 역량을 지도에 올린다.

### 환대: 제1의 선교 자세 (Hospitality as Primary Missional Posture)

히브리어 **헤브론(Hebron)**은 "연합·연결·교제"를 뜻한다. 창세기 13:14-18에서 아브라함이 헤브론에 제단을 쌓은 것처럼, HebronGuide는 각 도시에 환대의 제단을 세운다. 환대는 프로그램이 아니라 정체성이다.

> "나그네를 대접하기를 잊지 말라 이로써 부지중에 천사들을 대접한 이들이 있었느니라." — 히브리서 13:2

Hospitality is not a program — it is an identity. Every Korean home, campus ministry, workplace, and church is a potential Hebron altar where strangers become family.

### HebronGuide의 역할: 지도·권한 부여·동원 (Map, Empower, Mobilize)

1. **MAP**: 전 세계 한인 환대 자원을 가시화한다 (교회, 가정, 캠퍼스, 직장)
2. **EMPOWER**: 환대 제공자를 훈련하고 연결하고 인증한다
3. **MOBILIZE**: 새로 오는 이민자·유학생·여행자·VIP를 준비된 환대 공동체로 연결한다

이 세 역할이 하나의 여정을 만든다: VIP(방문자) → 연결 → 공동체 → 신앙 → 섬김 → 목자

---

## 2. Tier 분류 체계 (Tier Classification System)

### 분류 기준 (Classification Logic)

```
IF est_korean_population >= 50,000 OR economic_influence_score >= 5:
    → TIER 1 (글로벌 거점)
ELSE IF est_korean_population >= 10,000:
    → TIER 2 (지역 중심)
ELSE IF est_korean_population >= 3,000:
    → TIER 3 (전략 성장)
ELSE:
    → TIER 4 (개척 선교)
```

### Tier 정의 (Tier Definitions)

| Tier | 명칭 | 목표 도시 수 | 한인 인구 기준 | 설명 |
|------|------|------------|--------------|------|
| **T1** | 글로벌 거점 | ~50개 | 5만+ 또는 글로벌 영향력 | 대규모 한인 커뮤니티, 다국적 비즈니스 허브, 전략적 선교 거점 |
| **T2** | 지역 중심 | ~150개 | 1만~5만 | 안정적 한인 교회 기반, 지역 내 디아스포라 중심 도시 |
| **T3** | 전략 성장 | ~200개 | 3천~1만 | 성장하는 한인 커뮤니티, 대학·직장 중심 이민 증가 |
| **T4** | 개척 선교 | ~100개 | 3천 미만 | 소규모 한인 공동체, 비한인권 선교 거점, 개척 필요 도시 |

**총계**: 500개 도시

### 보조 점수 체계 (Supplementary Scoring System)

각 도시는 다음 5개 항목에서 1–5점으로 평가된다:

| 항목 | 설명 | 가중치 |
|------|------|--------|
| `diaspora_significance_score` | 한인 디아스포라의 역사적·커뮤니티적 중요도 | 높음 |
| `hospitality_potential_score` | 환대 인프라 구축 가능성 | 높음 |
| `economic_influence_score` | 글로벌 경제 영향력 (세계 금융·무역 중심지 여부) | 중간 |
| `migration_hub_score` | 이민·유학 유입 허브 여부 | 중간 |
| `airport_hub` | 국제 항공 허브 여부 (boolean) | 참고용 |

---

## 3. 마스터 데이터베이스 스키마 (Master Database Schema)

### 필드 정의 (Field Definitions)

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `continent` | string | 대륙 | "North America" |
| `country` | string | 국가명 (영문) | "United States" |
| `iso_country_code` | string | ISO 3166-1 alpha-2 | "US" |
| `city` | string | 도시명 (영문) | "Los Angeles" |
| `metro_name` | string | 광역 도시권 명칭 | "Greater Los Angeles" |
| `tier` | integer (1–4) | HebronGuide Tier | 1 |
| `metro_population` | integer | 광역권 총인구 (Est.) | 13000000 |
| `est_korean_population` | integer | 추정 한인 인구 (Est.) | 250000 |
| `est_korean_ratio` | float | 추정 한인 비율 (Est.) | 0.019 |
| `diaspora_significance_score` | integer (1–5) | 디아스포라 중요도 | 5 |
| `hospitality_potential_score` | integer (1–5) | 환대 잠재력 | 5 |
| `economic_influence_score` | integer (1–5) | 경제적 영향력 | 4 |
| `migration_hub_score` | integer (1–5) | 이민·유학 허브 | 5 |
| `airport_hub` | boolean | 국제 항공 허브 | true |
| `universities_presence` | boolean | 대학교 존재 여부 | true |
| `local_church_presence` | boolean | 한인 교회 존재 여부 | true |
| `notes_missional` | string | 선교적 메모 | "Koreatown; largest Korean diaspora city outside Korea" |
| `data_confidence_level` | string ("high"/"medium"/"low") | 데이터 신뢰도 | "high" |
| `data_sources` | string | 데이터 출처 | "US Census 2020, KFCOC" |
| `last_updated` | string (YYYY-MM-DD) | 최종 업데이트 | "2026-05-25" |

---

## 4. 환대 선교 전략 요소 (Hospitality Mission Strategy Elements)

### 5대 환대 유형 (Five Forms of Diaspora Hospitality)

| # | 유형 | 설명 | 주요 제공자 |
|---|------|------|------------|
| 1 | **Korean Home Hospitality** (가정 환대) | 한인 가정에서 식사·숙박·멘토링을 제공. 가장 깊은 환대. | 한인 가정, 장로·집사 가정 |
| 2 | **Campus Hospitality** (캠퍼스 환대) | 대학 캠퍼스 내 유학생·이민 청년 환영. 정착 지원 포함. | 캠퍼스 미니스트리, 학생 모임 |
| 3 | **Workplace Hospitality** (직장 환대) | 직장 내 한인 네트워크 통해 신규 이민자·취업자 연결 | 한인 비즈니스 오너, 전문직 네트워크 |
| 4 | **Church-based Hospitality** (교회 환대) | 한인 교회 영어부·청년부 중심. 예배 후 환대, 정착 프로그램 | 한인 교회, EM(영어 미니스트리) |
| 5 | **Digital Hospitality** (디지털 환대) | 온라인 연결, HebronGuide 앱, SNS 커뮤니티, 원격 멘토링 | HebronGuide 플랫폼, 온라인 공동체 |

### Tier별 환대 전략 적용 (Tier Application Matrix)

| 환대 유형 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|----------|--------|--------|--------|--------|
| Home Hospitality | ✅ | ✅ | ✅ | ✅ |
| Campus Hospitality | ✅ (강조) | ✅ | ✅ | — |
| Workplace Hospitality | ✅ (강조) | — | — | — |
| Church-based Hospitality | ✅ | ✅ | — | ✅ |
| Digital Hospitality | ✅ (강조) | ✅ | ✅ | ✅ |

**Tier 1**: 5가지 전부 (Digital + Workplace + Campus 특별 강조)  
**Tier 2**: Home + Church + Campus  
**Tier 3**: Home + Campus + Digital  
**Tier 4**: Home + Church (개척 집중)

---

## 5. 전략 도시 100+ 목록 (Strategic City List 100+)

> 모든 인구 수치는 추정치(Est.)입니다. 출처: UN Migration Data, 외교부 재외동포 현황, 각국 통계청 자료 등.

### 북미 (North America) — 약 25개 도시

| # | Country | City | Tier | Est. Korean Pop. | Hospitality Score | Notes |
|---|---------|------|------|-----------------|-------------------|-------|
| 1 | USA | Los Angeles | T1 | 250,000 Est. | 5 | Koreatown; 최대 한인 디아스포라 도시 |
| 2 | USA | New York | T1 | 150,000 Est. | 5 | Flushing Koreatown; 금융·문화 허브 |
| 3 | USA | Chicago | T1 | 80,000 Est. | 4 | 중서부 한인 중심지 |
| 4 | USA | Seattle | T1 | 75,000 Est. | 5 | HebronGuide 본거지; 테크·항공 허브 |
| 5 | USA | Washington D.C. | T1 | 100,000 Est. | 5 | 정치·외교·한인 밀집 |
| 6 | USA | Atlanta | T1 | 70,000 Est. | 4 | 남동부 한인 허브 |
| 7 | USA | Dallas | T1 | 60,000 Est. | 4 | 텍사스 한인 중심 |
| 8 | USA | San Francisco | T1 | 55,000 Est. | 4 | 실리콘밸리 한인 테크 집중 |
| 9 | USA | Houston | T1 | 50,000 Est. | 4 | 에너지 산업 한인 네트워크 |
| 10 | USA | Boston | T2 | 35,000 Est. | 4 | 대학·연구 중심; 유학생 밀집 |
| 11 | USA | Philadelphia | T2 | 25,000 Est. | 3 | 동부 교육 허브 |
| 12 | USA | Minneapolis | T2 | 15,000 Est. | 3 | 중서부 성장 커뮤니티 |
| 13 | USA | Portland | T2 | 20,000 Est. | 4 | 태평양 연안 한인 공동체 |
| 14 | USA | San Diego | T2 | 30,000 Est. | 4 | 군인 가족·대학 한인 |
| 15 | USA | Honolulu | T2 | 25,000 Est. | 4 | 최초 한인 이민 역사 도시 |
| 16 | USA | Denver | T3 | 8,000 Est. | 3 | 내륙 성장 도시 |
| 17 | USA | Phoenix | T3 | 10,000 Est. | 3 | 서남부 한인 성장 지역 |
| 18 | USA | Las Vegas | T3 | 12,000 Est. | 3 | 서비스업 한인 집중 |
| 19 | Canada | Toronto | T1 | 150,000 Est. | 5 | 캐나다 최대 한인 도시 |
| 20 | Canada | Vancouver | T1 | 90,000 Est. | 5 | 한인 유학생·이민 1위 |
| 21 | Canada | Calgary | T2 | 20,000 Est. | 3 | 캐나다 에너지 도시 |
| 22 | Canada | Edmonton | T2 | 12,000 Est. | 3 | 캐나다 북부 한인 공동체 |
| 23 | Canada | Ottawa | T2 | 10,000 Est. | 3 | 연방 정부 소재지 |
| 24 | Mexico | Mexico City | T3 | 4,000 Est. | 3 | 중남미 최대 한인 커뮤니티 |
| 25 | Mexico | Monterrey | T3 | 3,500 Est. | 3 | 한국 제조업 투자 거점 |

### 아시아·태평양 (Asia-Pacific) — 약 30개 도시

| # | Country | City | Tier | Est. Korean Pop. | Hospitality Score | Notes |
|---|---------|------|------|-----------------|-------------------|-------|
| 26 | China | Beijing | T1 | 100,000 Est. | 3 | 외교·비즈니스 한인 허브 |
| 27 | China | Shanghai | T1 | 150,000 Est. | 4 | 최대 중국 내 한인 도시 |
| 28 | China | Shenzhen | T2 | 40,000 Est. | 3 | 테크·제조 한인 집중 |
| 29 | China | Guangzhou | T2 | 30,000 Est. | 3 | 한국 무역 거점 |
| 30 | China | Qingdao | T2 | 50,000 Est. | 4 | 산동 한인 특구; 역사적 연결 |
| 31 | Japan | Tokyo | T1 | 200,000 Est. | 4 | 최대 재일 한인 도시; 복음 선교 중요 |
| 32 | Japan | Osaka | T1 | 100,000 Est. | 4 | 재일 한인 역사 중심; 코리아타운 |
| 33 | Japan | Nagoya | T2 | 20,000 Est. | 3 | 제조업 한인 네트워크 |
| 34 | Japan | Fukuoka | T2 | 15,000 Est. | 4 | 한국과 지리적 가장 가까운 일본 도시 |
| 35 | Japan | Sapporo | T3 | 5,000 Est. | 3 | 북해도 유학·관광 한인 |
| 36 | Australia | Sydney | T1 | 80,000 Est. | 5 | 호주 최대 한인 도시; 유학·이민 1위 |
| 37 | Australia | Melbourne | T1 | 60,000 Est. | 5 | 한인 교육·의료 집중 |
| 38 | Australia | Brisbane | T2 | 20,000 Est. | 4 | 성장하는 한인 커뮤니티 |
| 39 | Australia | Perth | T2 | 12,000 Est. | 3 | 서호주 한인 공동체 |
| 40 | New Zealand | Auckland | T2 | 30,000 Est. | 5 | 뉴질랜드 한인 최대 집중 |
| 41 | New Zealand | Wellington | T3 | 5,000 Est. | 3 | 뉴질랜드 수도; 소규모 한인 |
| 42 | Singapore | Singapore | T1 | 20,000 Est. | 5 | 동남아 비즈니스·금융 허브 |
| 43 | Philippines | Manila | T2 | 35,000 Est. | 4 | 한인 유학·선교 허브; 어학연수 중심 |
| 44 | Philippines | Cebu | T2 | 15,000 Est. | 4 | 한인 어학원·은퇴 이민 |
| 45 | Thailand | Bangkok | T2 | 25,000 Est. | 4 | 동남아 한인 관광·비즈니스 중심 |
| 46 | Vietnam | Ho Chi Minh City | T2 | 40,000 Est. | 4 | 한국 제조업·투자 1위 도시 |
| 47 | Vietnam | Hanoi | T2 | 20,000 Est. | 3 | 베트남 정치·외교 중심 |
| 48 | Indonesia | Jakarta | T2 | 20,000 Est. | 3 | 동남아 최대 경제 도시 |
| 49 | Malaysia | Kuala Lumpur | T2 | 12,000 Est. | 3 | 한인 비즈니스·관광 허브 |
| 50 | India | New Delhi | T3 | 5,000 Est. | 3 | 한인 외교·비즈니스 집중 |
| 51 | India | Bangalore | T3 | 4,000 Est. | 3 | 인도 IT·삼성 거점 |
| 52 | India | Chennai | T3 | 4,000 Est. | 3 | 한국 자동차·제조업 집중 |
| 53 | Kazakhstan | Almaty | T2 | 30,000 Est. | 4 | 고려인(Koryo-saram) 중심지; 역사적 선교지 |
| 54 | Kazakhstan | Astana | T3 | 10,000 Est. | 3 | 카자흐스탄 수도; 고려인 공동체 |
| 55 | Uzbekistan | Tashkent | T2 | 50,000 Est. | 4 | 최대 고려인 밀집 도시 |

### 유럽 (Europe) — 약 20개 도시

| # | Country | City | Tier | Est. Korean Pop. | Hospitality Score | Notes |
|---|---------|------|------|-----------------|-------------------|-------|
| 56 | UK | London | T1 | 60,000 Est. | 5 | 유럽 최대 한인 도시; 금융·교육 허브 |
| 57 | UK | Manchester | T3 | 5,000 Est. | 3 | 영국 북부 대학 도시 |
| 58 | Germany | Frankfurt | T2 | 15,000 Est. | 4 | 유럽 금융 허브; 한인 비즈니스 집중 |
| 59 | Germany | Berlin | T2 | 10,000 Est. | 4 | 간호사·광부 한인 이민 역사 |
| 60 | Germany | Munich | T2 | 8,000 Est. | 3 | 한인 공학·자동차 산업 |
| 61 | Germany | Hamburg | T2 | 7,000 Est. | 3 | 한국 무역·항만 연결 |
| 62 | France | Paris | T2 | 20,000 Est. | 4 | 유럽 한인 문화 중심 |
| 63 | Netherlands | Amsterdam | T2 | 10,000 Est. | 4 | 유럽 물류·비즈니스 허브 |
| 64 | Sweden | Stockholm | T3 | 5,000 Est. | 3 | 북유럽 한인 공동체 |
| 65 | Norway | Oslo | T3 | 4,000 Est. | 3 | 노르웨이 한인 이민자 |
| 66 | Denmark | Copenhagen | T3 | 3,500 Est. | 3 | 북유럽 소규모 한인 |
| 67 | Switzerland | Zurich | T3 | 4,000 Est. | 3 | 국제기구·금융 한인 |
| 68 | Austria | Vienna | T3 | 3,500 Est. | 3 | 동유럽 게이트웨이 |
| 69 | Spain | Madrid | T3 | 8,000 Est. | 3 | 스페인 한인 비즈니스 |
| 70 | Spain | Barcelona | T3 | 5,000 Est. | 3 | 한인 유학·관광 허브 |
| 71 | Italy | Rome | T3 | 5,000 Est. | 3 | 이탈리아 한인 공동체 |
| 72 | Italy | Milan | T3 | 4,000 Est. | 3 | 한국 패션·무역 연결 |
| 73 | Poland | Warsaw | T3 | 4,000 Est. | 3 | 동유럽 한인 성장 도시 |
| 74 | Russia | Moscow | T2 | 15,000 Est. | 2 | 한인 비즈니스; 선교 복잡성 높음 |
| 75 | Russia | Vladivostok | T3 | 8,000 Est. | 3 | 극동 러시아; 한국 근접 도시 |

### 중동·아프리카 (Middle East and Africa) — 약 15개 도시

| # | Country | City | Tier | Est. Korean Pop. | Hospitality Score | Notes |
|---|---------|------|------|-----------------|-------------------|-------|
| 76 | UAE | Dubai | T1 | 30,000 Est. | 5 | 중동 한인 비즈니스·선교 허브 |
| 77 | UAE | Abu Dhabi | T2 | 10,000 Est. | 4 | 한국 건설·에너지 투자 중심 |
| 78 | Saudi Arabia | Riyadh | T2 | 12,000 Est. | 2 | 한국 건설 인력 집중; 선교 제한 환경 |
| 79 | Israel | Tel Aviv | T3 | 3,000 Est. | 4 | 성지 순례·한인 선교사 거점 |
| 80 | Jordan | Amman | T4 | 1,500 Est. | 3 | 난민·선교 거점; 전략적 개척지 |
| 81 | South Africa | Johannesburg | T2 | 15,000 Est. | 4 | 아프리카 최대 한인 도시; 사업·선교 |
| 82 | South Africa | Cape Town | T3 | 5,000 Est. | 3 | 한인 관광·선교 거점 |
| 83 | Kenya | Nairobi | T3 | 3,000 Est. | 4 | 동아프리카 한인 선교 허브 |
| 84 | Ethiopia | Addis Ababa | T4 | 800 Est. | 4 | 한인 NGO·선교사 집중; 전략 개척지 |
| 85 | Nigeria | Lagos | T4 | 1,000 Est. | 3 | 서아프리카 성장 경제 |
| 86 | Ghana | Accra | T4 | 500 Est. | 4 | 서아프리카 한인 선교 거점 |
| 87 | Egypt | Cairo | T4 | 1,000 Est. | 3 | 북아프리카 관문 도시 |
| 88 | Morocco | Casablanca | T4 | 500 Est. | 3 | 북아프리카 비즈니스 허브 |
| 89 | Tanzania | Dar es Salaam | T4 | 400 Est. | 3 | 동아프리카 개척 선교 |
| 90 | Uganda | Kampala | T4 | 300 Est. | 4 | 한인 선교사 집중 지역 |

### 중남미 (Latin America) — 약 15개 도시

| # | Country | City | Tier | Est. Korean Pop. | Hospitality Score | Notes |
|---|---------|------|------|-----------------|-------------------|-------|
| 91 | Brazil | São Paulo | T1 | 60,000 Est. | 5 | 남미 최대 한인 도시; 코리아타운 |
| 92 | Brazil | Rio de Janeiro | T3 | 5,000 Est. | 3 | 한인 관광·비즈니스 |
| 93 | Argentina | Buenos Aires | T2 | 45,000 Est. | 4 | 남미 2위 한인 도시 |
| 94 | Chile | Santiago | T2 | 15,000 Est. | 4 | 칠레 한인 비즈니스 허브 |
| 95 | Peru | Lima | T2 | 12,000 Est. | 4 | 페루 한인 공동체; 선교 거점 |
| 96 | Colombia | Bogotá | T3 | 5,000 Est. | 3 | 콜롬비아 한인 성장 |
| 97 | Venezuela | Caracas | T3 | 4,000 Est. | 2 | 경제 불안정; 한인 이주 증가 |
| 98 | Ecuador | Quito | T3 | 3,500 Est. | 3 | 에콰도르 한인 커뮤니티 |
| 99 | Bolivia | Santa Cruz | T4 | 1,500 Est. | 3 | 남미 한인 선교 개척지 |
| 100 | Paraguay | Asunción | T3 | 5,000 Est. | 3 | 남미 한인 농업·이민 역사 |
| 101 | Uruguay | Montevideo | T3 | 3,000 Est. | 3 | 우루과이 한인 소규모 공동체 |
| 102 | Guatemala | Guatemala City | T4 | 1,000 Est. | 4 | 중미 한인 선교 거점 |
| 103 | Panama | Panama City | T4 | 800 Est. | 3 | 중미 비즈니스 허브 |
| 104 | Costa Rica | San José | T4 | 1,200 Est. | 4 | 중미 친한 국가 |
| 105 | Dominican Republic | Santo Domingo | T4 | 2,000 Est. | 3 | 카리브해 한인 공동체 |

### 추가 전략 도시 (Additional Strategic Cities)

| # | Country | City | Tier | Est. Korean Pop. | Hospitality Score | Notes |
|---|---------|------|------|-----------------|-------------------|-------|
| 106 | Cambodia | Phnom Penh | T3 | 4,000 Est. | 4 | 한인 NGO·봉제 산업 |
| 107 | Myanmar | Yangon | T3 | 3,000 Est. | 3 | 한인 제조업·선교 |
| 108 | Bangladesh | Dhaka | T3 | 3,500 Est. | 3 | 한국 봉제·수출 산업 |
| 109 | Pakistan | Karachi | T4 | 500 Est. | 2 | 전략 개척; 선교 복잡 환경 |
| 110 | Nepal | Kathmandu | T4 | 1,000 Est. | 4 | 한인 NGO·등산 선교 |

---

## 6. JSON 예시 (JSON Schema Example)

아래는 마스터 스키마에 따른 완전한 도시 데이터 예시입니다:

```json
{
  "continent": "North America",
  "country": "United States",
  "iso_country_code": "US",
  "city": "Los Angeles",
  "metro_name": "Greater Los Angeles",
  "tier": 1,
  "metro_population": 13200000,
  "est_korean_population": 250000,
  "est_korean_ratio": 0.019,
  "diaspora_significance_score": 5,
  "hospitality_potential_score": 5,
  "economic_influence_score": 4,
  "migration_hub_score": 5,
  "airport_hub": true,
  "universities_presence": true,
  "local_church_presence": true,
  "notes_missional": "Home to Koreatown — the largest Korean diaspora community outside Korea. Strategic gateway for Korean immigrants from Central/South America. Strong church infrastructure. Key city for Phase 1 HebronGuide launch.",
  "data_confidence_level": "high",
  "data_sources": "US Census Bureau 2020, Korean American Coalition, KFCOC",
  "last_updated": "2026-05-25"
}
```

---

## 7. 2030 로드맵 (2030 Roadmap)

### 단계별 목표 (Phase Targets)

| 연도 | 목표 도시 수 | 누적 도시 수 | 핵심 지역 | 주요 이정표 |
|------|------------|------------|----------|-----------|
| **2025** | 68 | 68 | 북미·동아시아 중심 | 현재 운영 중 (Current) |
| **2026** | +32 | **100** | 북미 완성 + 호주·유럽 확장 | Tier 1 전체 완성, 파트너 교회 50개 |
| **2027** | +100 | **200** | 동남아·남미 진입 | Tier 2 주요 도시 완성, 환대 제공자 500명 |
| **2028** | +100 | **300** | 중동·아프리카 개척 시작 | Tier 3 핵심 도시 진입, 지역 코디네이터 체계 구축 |
| **2029** | +100 | **400** | 중앙아시아·동유럽 확장 | 고려인 특별 프로그램 런칭, Tier 4 파일럿 |
| **2030** | +100 | **500** | 글로벌 500개 도시 완성 | 전 대륙 커버리지, 디지털 환대 플랫폼 완전 운영 |

### 지역별 2030 목표 배분

| 대륙 | 목표 도시 수 | 현재 비율 | 비고 |
|------|------------|----------|------|
| 북미 | 80 | 가장 성숙 | 미국·캐나다·멕시코 |
| 아시아·태평양 | 150 | 최대 성장 | 동남아 집중 확장 |
| 유럽 | 80 | 안정 성장 | 서유럽·동유럽 |
| 중동·아프리카 | 60 | 개척 중심 | 선교 복잡 환경 포함 |
| 중남미 | 80 | 급성장 예상 | 브라질·아르헨티나 기반 |
| 기타 | 50 | 전략 개척 | 중앙아시아·남아시아 |

### 핵심 성공 지표 (Key Success Metrics)

- **환대 제공자 수**: 2026년 200명 → 2030년 5,000명
- **연결된 한인 교회**: 2026년 50개 → 2030년 1,000개
- **플랫폼 이용자**: 2026년 10,000명 → 2030년 500,000명
- **VIP → 공동체 연결 건수**: 연 1,000건 (2026) → 연 50,000건 (2030)
- **도시 데이터 신뢰도**: 2030년까지 전체의 80% "high" 수준 달성

---

## 8. 데이터 거버넌스 및 에이전트 활용 지침

### 데이터 품질 원칙 (Data Quality Principles)

1. **추정 표시**: 독립 검증 전 모든 인구 수치는 "Est." 표기 필수
2. **출처 명시**: 각 도시 데이터에 `data_sources` 필드 기입 필수
3. **정기 업데이트**: 연 1회 이상 `last_updated` 갱신
4. **신뢰도 등급**: `high` (공식 통계 기반) / `medium` (복수 추정 교차) / `low` (단일 출처 또는 오래된 자료)

### 에이전트·모델 활용 지침 (Agent/Model Usage Guidelines)

이 프레임워크는 다른 AI 에이전트 또는 모델이 다음 작업을 수행할 수 있도록 설계되었습니다:

- **데이터 채우기**: 위 스키마에 따라 신규 도시 JSON 레코드 생성
- **Tier 재분류**: 인구 데이터 업데이트 시 자동 재분류 논리 적용
- **선교 메모 작성**: 각 도시의 `notes_missional` 필드를 현지 리서치로 보강
- **환대 매칭**: 도시 프로필 기반으로 최적 환대 전략 유형 추천
- **격차 분석**: 현재 운영 도시 vs 목표 도시 간 갭 분석 및 우선순위 산정

> **This framework enables other agents/models to populate, refine, and expand the global diaspora mission database.**

---

## 부록: 참고 데이터 출처 (Reference Data Sources)

| 출처 | 설명 | URL |
|------|------|-----|
| 외교부 재외동포현황 | 공식 재외동포 통계 (격년 발간) | mofa.go.kr |
| UN International Migrant Stock | 국가별 이민자 인구 통계 | un.org/en/development/desa/population |
| Korean American Coalition (KAC) | 미국 한인 통계 | kacusa.org |
| KFCOC (Korean Federation of Churches) | 재미 한인 교회 현황 | — |
| World Korean Business Convention | 글로벌 한인 비즈니스 네트워크 | — |
| Koryo-saram Research | 중앙아시아 고려인 현황 | — |

---

*최종 업데이트: 2026-05-25 | HebronGuide Strategic Planning Team*  
*문서 버전: v1.0 | 다음 검토: 2027-01-01*

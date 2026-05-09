# HebronGuide 글로벌 이벤트 활용 플레이북
**Event-Driven Expansion Playbook**  
**작성일: 2026-05-08 | 폴 김 목사 비전**  
**핵심: 세계적 행사의 흐름을 타고 HebronGuide 확산을 가속**

---

## 🎯 전략의 본질

```
세계적 행사 = 도시에 사람·관심·미디어가 폭발적으로 모이는 순간
            ↓
이 순간 HebronGuide가 그 도시에 준비되어 있으면
관심도·검색량·다운로드가 자연 폭증
            ↓
영구 사용자로 전환할 결정적 기회
```

**원칙**: 행사를 만들 수는 없지만, **행사의 흐름을 타고** 사역을 확산할 수는 있다.

---

## 🏆 2026 FIFA 월드컵 — 즉각 행동 (긴급!)

### 2026 월드컵 핵심 정보

| 항목 | 내용 |
|---|---|
| **개최 기간** | 2026년 6월 11일 ~ 7월 19일 (39일) |
| **공동 개최** | 미국 11도시 + 캐나다 2도시 + 멕시코 3도시 |
| **참가국 수** | 48개국 (역대 최대) |
| **예상 관중** | 550만+ 현장 + 50억+ 시청 |
| **한국 참가** | 본선 진출 시 한국 응원단 대거 이동 |

### 2026 월드컵 호스트 도시 vs HebronGuide 현황

#### ⭐ 이미 LIVE인 호스트 도시 (8개 — 즉시 활용!)

| 호스트 도시 | HebronGuide 상태 | 즉시 행동 |
|---|---|---|
| 🇺🇸 시애틀 | ✅ LIVE | 월드컵 전용 콘텐츠 추가 |
| 🇺🇸 LA | ✅ LIVE | 월드컵 전용 콘텐츠 추가 |
| 🇺🇸 뉴욕/뉴저지 | ✅ LIVE | 월드컵 전용 콘텐츠 추가 |
| 🇺🇸 댈러스 | ✅ LIVE | 월드컵 전용 콘텐츠 추가 |
| 🇺🇸 SF 베이 | ✅ LIVE | 월드컵 전용 콘텐츠 추가 |
| 🇺🇸 보스턴 (Foxborough) | ✅ LIVE | 월드컵 전용 콘텐츠 추가 |
| 🇨🇦 토론토 | ✅ LIVE | 월드컵 전용 콘텐츠 추가 |
| 🇨🇦 밴쿠버 | ✅ LIVE | 월드컵 전용 콘텐츠 추가 |

#### 🆕 우선 진출 호스트 도시 (3개 — 한 달 내 베타)

| 호스트 도시 | 한인 인구 | 가정교회 | 우선순위 |
|---|---|---|---|
| 🇺🇸 **휴스턴** | 4만 | ⭐ IHM 본부! | 1순위 |
| 🇺🇸 **애틀랜타** | 10만 | 탐색 필요 | 2순위 |
| 🇺🇸 **마이애미** | 1만 | 탐색 필요 | 3순위 (소규모) |

#### ⏳ 후속 진출 (3개 — 7월 후 검토)

- 캔자스시티 (한인 작음, 우선순위 낮음)
- 필라델피아 (한인 5만)
- 멕시코 3개 도시 (한인 1.5만, Phase 3)

---

## 🚀 월드컵 즉시 행동 계획 (4주 안)

### Week 1 (5/8-5/15): 콘텐츠 준비

#### 모든 LIVE 호스트 도시 공통

```typescript
// 각 도시 앱에 추가:
1. 월드컵 환영 배너 (홈 화면 상단)
   "🏆 월드컵 2026 환영합니다 / Welcome World Cup Visitors"
   
2. "⚽ 월드컵 가이드" 섹션 (탐방 탭 또는 별도)
   - 경기장 위치·교통
   - 한국 경기 일정 (한국 본선 진출 시)
   - 경기장 주변 한식당·한인 마트
   - 응원 모임 정보

3. "처음 오신 분께" 단축 가이드
   - 공항에서 시내 이동
   - SIM 카드·Uber·Public Transit
   - 환전·신용카드 사용
   - 응급 연락처
```

#### 한국 응원단 전용 콘텐츠

```
- 한국 경기 응원 모임 장소 (각 호스트 도시)
- 한국식 응원 펍 / 한식당 (단체 관람 가능)
- 한인 교회의 한국 응원 행사 (있다면)
- 한국어 가능한 의료·법률 응급 연락처
```

### Week 2 (5/15-5/22): 이벤트 전용 콘텐츠 코드 추가

```typescript
// HebronGuide.tsx에 추가
const isWorldCupCity = ["seattle","la","newyork","dallas","sf","boston","toronto","vancouver"]
  .includes(useCityConfig().slug);

const isWorldCupPeriod = () => {
  const now = new Date();
  return now >= new Date("2026-06-01") && now <= new Date("2026-07-31");
};

// 홈 화면 조건부 렌더링:
{isWorldCupCity && isWorldCupPeriod() && <WorldCupBanner />}
```

### Week 3 (5/22-5/29): 휴스턴·애틀랜타 베타 진출

- 휴스턴 IHM 본부(서울침례교회) 공식 연락
- 애틀랜타 가정교회·KAFLA 연락
- TOP5_RESTAURANTS_HOUSTON / TOP5_RESTAURANTS_ATLANTA 작성

### Week 4 (5/29-6/5): 출시 + 마케팅

- 월드컵 콘텐츠 정식 출시
- 각 파트너 교회에 "월드컵 환영 캠페인" 안내 자료 전달
- 한인 미디어(미주 한국일보, 라디오코리아, 한국 KBS America) 보도자료
- 시애틀지구촌교회 광복절 캠페인과 연계 준비

---

## 🌍 글로벌 이벤트 캘린더 (장기)

### Tier 1: 즉시 활용 (1년 내)

| 행사 | 시기 | HebronGuide 적용 |
|---|---|---|
| **🏆 FIFA 월드컵** | 2026 6/11~7/19 | ⭐ 즉시 (8개 호스트 도시 이미 있음) |
| **🇰🇷 광복절** | 2026 8/15 | 모든 도시 캠페인 (이미 캘린더에 있음) |
| **🍂 추석** | 2026 9~10월 | 한인 가족 모임 정보 강화 |
| **📖 한글날** | 2026 10/9 | 한국학교 홍보 + Korean American 정체성 |

### Tier 2: 주요 글로벌 이벤트 (2-3년)

| 행사 | 시기 | 도시 | 우선순위 |
|---|---|---|---|
| **🏂 동계올림픽** | 2026 2월 | 밀라노·코르티나 (이태리) | Phase 3 |
| **🏆 BTS 컴백 투어** | 2025-2026 | 글로벌 (별도 추적) | Phase 2 |
| **🎬 칸 영화제** | 매년 5월 | 칸 (한국 영화 인기) | 모니터링 |
| **🎵 K-Con LA** | 매년 8월 | LA | 매년 캠페인 |
| **🏆 LA 올림픽** | 2028 7~8월 | LA | ⭐ 최대 기회 |

### Tier 3: 한국 특화 이벤트

| 행사 | 의미 | HebronGuide 적용 |
|---|---|---|
| **K-Pop 데이** | 2027~ | K-pop 도시 캠페인 |
| **재외동포의 날** | 매년 10월 5일 | 디아스포라 자긍심 |
| **한국 문화의 날** | 도시별 | 다민족 환대 |

---

## 📐 이벤트 활용 6단계 표준 절차

모든 글로벌 이벤트에 동일하게 적용:

### Step 1. 발견 (Discovery)
- 6-12개월 전 이벤트 정보 수집
- 호스트 도시·기간·예상 규모 확인
- HebronGuide 도시와의 매핑

### Step 2. 영적 인프라 점검 (Spiritual Infrastructure)
- 호스트 도시에 복음적 교회 존재?
- 가정교회(IHM) 우선 탐색
- 파트너 가능 여부 확인

### Step 3. 콘텐츠 준비 (Content Prep)
- 이벤트 전용 환영 배너
- 처음 방문자 단축 가이드
- 한국 관련 특별 콘텐츠 (한국 응원단 등)
- 다국어 옵션 (영어 강화)

### Step 4. 코드 적용 (Code Integration)
- 조건부 렌더링 (이벤트 기간만 노출)
- 도시별 분기 (호스트 도시만)
- 이벤트 종료 후 자동 제거

### Step 5. 마케팅 캠페인 (Outreach)
- 파트너 교회에 자료 전달
- 한인 미디어 보도자료
- SNS 캠페인 (시기 맞춰)
- 광복절·추석 등 주요 일자와 연계

### Step 6. 사용자 전환 (Conversion)
- 이벤트로 유입된 1회성 방문자를 영구 사용자로
- "정착 가이드 다운로드" CTA
- 이메일·뉴스레터 가입 유도
- 월드컵 후에도 가치 제공

---

## ⚖️ 이벤트 활용의 윤리 (마10:16 기준)

### 🐍 지혜로운 활용 ✅
- 시기적으로 맞는 콘텐츠 제공
- 방문자에게 진정 유용한 정보
- 효과적인 채널 (한인 미디어·교회) 활용
- 광복절·추석 등 한국 정체성 자연 연결

### 🕊️ 순결한 동기 ✅
- 이벤트 인기를 사용자 데이터 수집에 악용 ❌
- 광고를 큐레이션처럼 위장 ❌
- 교회를 단순 마케팅 도구로 ❌
- 진정성 있는 환대 ✅

### 황금률 자문
> *"내가 처음 외국에 와서 월드컵 보러 갔다면, 어떤 환영을 받고 싶었을까?"*  
> → 그것을 우리가 제공한다.

---

## 🚨 위반 금지 (이벤트 특화)

```
❌ 월드컵 로고·BTS 사진 등 무단 사용 (저작권 위반)
❌ "FIFA 공식 파트너" 등 거짓 표시
❌ 이벤트 끝나도 콘텐츠 안 지움 (혼란 유발)
❌ 호스트 도시 아닌데 호스트인 척 ❌
❌ 한국 팀 광팬 척 (실제 정보 제공 안 함)
❌ 이벤트 핑계로 광고 도배
```

---

## 💡 즉각 실행 — 이번 주 (5/8-5/15)

### Day 1-2: 콘텐츠 준비
```
□ 8개 호스트 도시별 월드컵 정보 수집
   - 경기장 위치
   - 한국 경기 일정 (조 추첨 결과 반영)
   - 경기장 주변 한식당
□ "처음 오신 분께" 콘텐츠 초안
□ 환영 배너 디자인 시안
```

### Day 3-4: 코드 작업
```
□ WorldCupBanner 컴포넌트 작성
□ isWorldCupCity / isWorldCupPeriod 헬퍼 추가
□ 홈 화면 조건부 렌더링
□ 탐방 탭 "⚽ 월드컵 가이드" 추가
```

### Day 5-7: 휴스턴·애틀랜타 베타
```
□ 휴스턴 IHM 본부 연락 (서울침례교회)
□ 애틀랜타 가정교회 검색
□ TOP5_RESTAURANTS_HOUSTON 데이터 작성
□ TOP5_SETTLE_HOUSTON 데이터 작성
□ /houston/, /atlanta/ 베타 출시
```

---

## 📊 KPI (월드컵 기간)

| 지표 | 목표 | 측정 방법 |
|---|---|---|
| 호스트 도시 페이지 방문자 | +50% (전월 대비) | Vercel Analytics |
| 월드컵 콘텐츠 조회수 | 5,000+ (전체 합계) | 페이지뷰 |
| 신규 도시 (휴스턴·애틀랜타) MAU | 100+ each | Analytics |
| 한인 미디어 노출 | 3건+ | 보도자료 추적 |
| 파트너 교회 추가 | 2개 (휴스턴·애틀랜타) | CRM |

---

## 🎯 향후 글로벌 이벤트 대응 플레이북

### 2028 LA 올림픽 — 4년 전 시작!

```
2024-2025: LA 콘텐츠 강화 (이미 완료 ✅)
2026-2027: 올림픽 전용 콘텐츠 기획
2028 7-8월: 정식 캠페인 출시
```

### BTS 월드 투어 (지속)

```
HYBE 공식 발표 모니터링
6개월 전: 도시 콘텐츠 준비
3개월 전: 파트너 교회 연락
콘서트 전후 1개월: 캠페인
```

### 매년 반복 행사

```
- 1-2월: 설날 캠페인 (모든 도시)
- 5월: 칸 영화제 (한국 영화 시 노출)
- 8/15: 광복절 (디아스포라 정체성 강화)
- 8월: K-Con LA (LA 콘텐츠 보강)
- 10월: 추석 (가족 모임 정보)
- 10/9: 한글날 (한국학교 홍보)
- 10/5: 재외동포의 날
```

---

## 🚌 도시별 월드컵 무료 교통 (수집 중)

월드컵 호스트 도시는 보통 무료 셔틀·확장 교통편을 제공합니다.  
HebronGuide는 이를 적극 활용해 사용자에게 환대 정보 제공.

### 시애틀 (Lumen Field)
- **King County 무료 워터프론트 셔틀** (5/21 ~ 9/7)
- 노선: Space Needle ↔ Pike Place ↔ Pioneer Square ↔ Lumen Field ↔ ChinaTown-ID
- 운행: 10am-10pm, 15분 간격 (경기일 10분)
- 출처: [kSeattle.com 2026-05-07](https://www.kseattle.com/뉴스/시애틀-워싱턴-뉴스/?uid=935053)
- ✅ 시애틀 TOP5_EXPLORE 1순위로 적용 완료

### 다른 호스트 도시 (수집 필요)
- LA (SoFi Stadium): TBD
- 뉴욕/뉴저지 (MetLife): TBD
- 댈러스 (AT&T Stadium): TBD
- 보스턴 (Gillette/Foxborough): TBD
- SF 베이 (Levi's): TBD
- 휴스턴 (NRG): TBD
- 애틀랜타 (Mercedes-Benz): TBD
- 캔자스시티 (Arrowhead): TBD
- 필라델피아 (Lincoln Financial): TBD
- 마이애미 (Hard Rock): TBD
- 토론토 (BMO Field): TBD
- 밴쿠버 (BC Place): TBD
- 멕시코시티 (Estadio Azteca): TBD
- 과달라하라 (Estadio Akron): TBD
- 몬테레이 (Estadio BBVA): TBD

→ 각 도시 한인 미디어·교통 당국 정보 수집 후 추가

---

## 📰 도시별 한인 미디어 참조 소스 & 취재 원칙

> 🔍 **조사**: 웹 검색 에이전트 심층 평가 완료 (2026-05-08)  
> 📌 **퍼플렉시티 AI 활용**: 아래 ✅/⚠️ 매체를 검색 소스로 지정 → 기사 취합·요약 → HebronGuide 표현으로 재작성

---

### ⚖️ 미디어 품질 평가 4대 기준

| 기준 | 설명 | 배점 |
|---|---|---|
| **① 독자 취재** | 자체 기자가 현장 취재·원본 기사 생산 (타 매체 복사 ❌) | 40점 |
| **② 발행 지속성** | 5년+ 꾸준한 발행 (비정기·단명 제외) | 25점 |
| **③ 편집 독립성** | 광고주·특정 단체로부터 독립된 편집 판단 | 20점 |
| **④ 공신력** | 공식 기관 등록·ISSN·언론계 수상·타 언론 인용 | 15점 |

```
✅ 정론지급  (70점+): 자체 편집국 + 10년+ + 공신력 확인
⚠️ 지역 신뢰 (45-69점): 원본 취재 시도 + 5년+ + 소규모 운영
❌ 제외      (44점-): 포털·생활정보·타 매체 복사·운영 불명확
```

---

### 🌐 전국 플랫폼 — 모든 도시 공통 1차 참조

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| **미주중앙일보** | koreadaily.com | ✅ | 1974년 창간, 최전성기 22만 부, **9개 지역판 네트워크**, 미주 최대 |
| **미주한국일보** | koreatimes.com | ✅ | 1969년 LA 창간(미주 최초 한국어 신문), 14개 지국, LA타임스 협력 이력 |
| **Radio Korea** | radiokorea.com | ✅ | 1989년 창간, AM 1540 50kW, 2001년 종합 미디어 그룹화, 자체 뉴스 제작 |
| **BIGKinds** | bigkinds.or.kr | ✅ | 한국언론진흥재단 운영, 100개+ 언론사 협약, 공공 미디어 아카이브 |

#### 📰 미주중앙일보 9개 지역판 전체 URL (2026-05-08 확인)

> URL 패턴: `koreadaily.com/index_[코드]` — 한국 중앙일보(joongang.co.kr) 100% 자회사

| 지역판 | URL | HebronGuide 도시 |
|---|---|---|
| **LA중앙일보** | koreadaily.com/index_LA | ✅ LA |
| **뉴욕중앙일보** | koreadaily.com/index_NY | ✅ 뉴욕/NJ |
| **애틀랜타중앙일보** | koreadaily.com/index_AT | ✅ 애틀랜타 |
| **밴쿠버중앙일보** | koreadaily.com/index_VA | ✅ 밴쿠버 |
| **토론토중앙일보** | koreadaily.com/index_TO | ✅ 토론토 |
| 시카고중앙일보 | koreadaily.com/index_CH | — (HebronGuide 미포함) |
| 워싱턴중앙일보 | koreadaily.com/index_DC | — (HebronGuide 미포함) |
| 샌디에고중앙일보 | koreadaily.com/index_SD | — (HebronGuide 미포함) |
| 한국중앙일보 | joongang.co.kr | — (한국 본사) |

> ℹ️ HebronGuide 도시 중 **LA·뉴욕·애틀랜타·밴쿠버·토론토** 5개 도시에 독립 편집국 운영  
> SF·보스턴·달라스·휴스턴·필라·마이애미 등은 전국판(koreadaily.com) 활용

---

### 🏙️ 시애틀 (Seattle, WA)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| 시애틀 한국일보 | seattlekdaily.com | ⚠️ | 편집부·사진공모전 운영 확인, 지역 취재 시도. 창간 연도·기자 수 공식 정보 미확인 |
| 시애틀 N | seattlen.com | ⚠️ | 2013년 창간, 2021년 리뉴얼. 자체 뉴스 섹션 운영하나 포털 성격 혼재 |
| ~~WOW Seattle~~ | ~~wowseattle.com~~ | ❌ | 부동산·업소록 포털, 뉴스는 타 매체 링크 집합. 자체 취재 기자 없음 |
| ~~kSeattle~~ | ~~kseattle.com~~ | ❌ | 구인·업소록·게시판 위주 생활정보 포털. 편집국 없음 |

---

### 🤠 달라스 (Dallas, TX)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| Korea Times Texas | koreatimestx.com | ⚠️ | "바른 언론의 이정표" 표방, 자체 기자(이메일 확인), 텍사스 정치·경제 원본 취재 |
| DK NET 달라스 라디오 | dalkora.com | ⚠️ | AM 730 KKDA, DK 미디어그룹 산하, 뉴스·시사 자체 제작. 지역 대표 방송 |
| ~~News Korea Texas~~ | ~~newskoreatexas.com~~ | ❌ | 실체·편집국·창간 이력 불명확. koreadaily 계열과 혼재 의심 |

---

### 💻 SF 베이에어리어 (San Francisco Bay Area, CA)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| 한미 라디오 AM 1120 | hanmiradio.com | ✅ | 1990년 창간, 북가주 최초·유일 한인 방송국, 35년+ 역사, 24시간 생방송 |
| SF Korea Daily | sfkoreadaily.com | ⚠️ | 독립 전자신문, 자체 에디토리얼 섹션 일부 확인. 편집 독립 여부 불완전 |
| ~~미주중앙일보 SF~~ | ~~sf.koreadaily.com~~ | — | 2018년 SF 지국 폐쇄 후 LA 본사 콘텐츠 리디렉션. `koreadaily.com` 사용 |
| ~~SFKorean.com~~ | ~~sfkorean.com~~ | ❌ | 구인/구직·부동산 포털. 편집 기능 없음 |

---

### 🗽 뉴욕 / 뉴저지 (New York / New Jersey)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| 뉴욕중앙일보 | koreadaily.com/index_NY | ✅ | 미주중앙일보 NY 직영 편집국. 동부 최대 한인 일간지 중 하나 |
| Radio Korea NY | nyradiokorea.com | ✅ | 1997년 AM 930 개국, FM 87.7 전환, 24시간 자체 뉴스·시사 제작. 25만 청취권 |
| AM 1660 K-Radio | am1660.com | ⚠️ | 2015년~ NY·NJ·CT 광역 방송. 자체 편집국 구조 미확인이나 지역 정보 제공 |
| ~~byeon.com~~ | ~~byeon.com~~ | ❌ | **직접 실사(2026-05-08): 저널리즘 기준 미달 — 28/100점** |

> ℹ️ MetLife Stadium(월드컵 결승전 7/19) 뉴저지 소재 → NJ 정보는 **NJ.com + WNYC** 활용

#### ⚠️ byeon.com 직접 실사 평가 결과 (2026-05-08)

5개 기사 직접 분석 — **등급 ⚠️ → ❌ 하향 조정**

| 평가 항목 | 실사 결과 |
|---|---|
| Byline | 전 기사 "K-POP TIMES" 단일 표기 — 기자 이름 없음 |
| 원본 취재 비율 | **약 5%** — 대부분 보도자료 전달·공지·요약 집합 |
| 편집국 | 공개 정보 없음. 연락처 = 개인 Gmail |
| ISSN | 2025년 7월 취득 — **품질 보증 아님** (모든 정기간행물 신청 가능한 식별번호) |
| 창간 역사 | 불명확. ISSN 기준 최소 2025년 이후 |
| 콘텐츠 구성 | 공모전·공지 40% + 보도자료 재가공 30% + K-pop 15% + 뉴스 요약 10% + 원본 5% |
| 품질 점수 | **28 / 100점** (정론지 기준 70점, 신뢰 기준 45점 모두 미달) |

```
✅ 제한적 활용 가능: NY·NJ 한인회·상공회의소 공식 행사·공지 일정 파악
❌ 저널리즘 참조 불가: 사실 기반 뉴스·정책·검증 정보로 사용 금지
```

---

### 🎵 내쉬빌 (Nashville, TN)

> ⚠️ **내쉬빌 전용 한인 언론 없음.** 취재는 전국 플랫폼(koreadaily.com·koreatimes.com) + 내쉬빌 한인회 공식 경로 활용.

---

### 🦞 보스턴 (Boston, MA)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| 보스톤코리아 | bostonkorea.com | ✅ | 2005년 창간, NBC 뉴스 보도("Boston's last Korean-language newspaper"), 직원 5명 자체 편집. 뉴잉글랜드 유일 한인지 |

---

### 🌴 LA (Los Angeles, CA)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| 미주중앙일보 | koreadaily.com | ✅ | (전국 플랫폼 참조) |
| 미주한국일보 | koreatimes.com | ✅ | (전국 플랫폼 참조) |
| Radio Korea | radiokorea.com | ✅ | (전국 플랫폼 참조) |
| 코리아타운데일리 | koreatowndaily.com | ⚠️ | Sports Seoul USA 산하, 로컬 뉴스 + 한국 연예 혼합. 자체 취재 일부 확인 |

---

### 🍁 토론토 (Toronto, ON — Canada)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| 캐나다 한국일보 | koreatimes.net | ✅ | 1971년 창간, 캐나다 최대 한인 일간지, 토론토 총영사관 공식 등록 언론 |
| 토론토 중앙일보 | cktimes.net | ✅ | 중앙일보 캐나다 법인, 일간 발행, 토론토 총영사관 공식 등록 언론 |
| Global Korean Post | globalkorean.ca | ⚠️ | 연방·온타리오주 정부 현장 취재 최초 한인 미디어. 자체 취재 의지 확인 |
| 토론토 교차로 KCR News | kcrnews.com | ⚠️ | 1997년~, 생활정보 기반이나 로컬 뉴스 병행. Canada KCR News Corp. 법인 운영 |
| 캐나다코리안뉴스 | cknnews.net | ⚠️ | 독립 온라인 언론, "정확·신속" 표방. 규모 소형, 자체 취재 부분 확인 |

---

### 🌲 밴쿠버 (Vancouver, BC — Canada)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| 밴쿠버 조선일보 | vanchosun.com | ✅ | **1986년 창간, 40년+ 역사**, 서부 캐나다 최대 한인 신문. 자체 편집국·YouTube 운영 |
| 밴쿠버 중앙일보 | joinsmediacanada.com | ✅ | 조인스미디어 캐나다 법인, 일간 발행, Issuu 정기 발행본 확인 |
| Canada Express | canadaexpress.com | ⚠️ | Postmedia(캐나다 최대 미디어)와 한국어 재인쇄 협약. 자체 취재보다 현지화 번역 위주 |

---

### 🛢️ 휴스턴 (Houston, TX)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| Korean Journal Houston | kjhou.com | ✅ | **1982년 창간, 44년 역사**, 텍사스 한인 대표 주간지. 휴스턴·오스틴·샌안토니오 배포. 자체 편집국 |
| ~~KOAM Journal~~ | ~~koamjournal.com~~ | ❌ | 창간·편집국 독립 여부 미확인. 운영 실태 불명확 |
| ~~교차로 휴스턴~~ | ~~kyocharohouston.com~~ | ❌ | 교차로 계열 생활정보지. 업소록·부동산 포털, 자체 취재 없음 |

---

### 🍑 애틀랜타 (Atlanta, GA)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| 미주중앙일보 애틀랜타 | koreadaily.com/index_AT | ✅ | 미주중앙일보 9개 지역판 중 하나. 지역 자체 편집국·취재 기자 보유 |
| 애틀랜타 중앙일보 | atlantajoongang.com | ✅ | 한국 중앙일보 계열 애틀랜타판, 주 6회 발행, 동남부 자체 취재 기자 보유 |
| K News Atlanta | knewsatlanta.com | ⚠️ | "신속·정확·간결·심층" 표방, 자체 취재 의지 확인. 동남부 6개 주 커버. 규모 소형 |
| Atlanta Chosun Today | atlantachosuntoday.com | ⚠️ | 조선일보 브랜드 활용 지역 매체, 지역 한인 뉴스 제공 확인. 편집 규모 불명확 |

---

### 🏈 캔자스시티 (Kansas City, MO)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| KC Korean Journal | kckoreanjournal.com | ⚠️ | 2010년~, **15년+ 지속**, 월간, 영한 이중 언어, 14개+ 지역 배포망 보유 |

> ℹ️ 소규모 도시 특성상 전국 플랫폼(koreadaily.com) 보완 활용 필수

---

### 🔔 필라델피아 (Philadelphia, PA)

| 매체 | URL | 등급 | 근거 |
|---|---|---|---|
| 주간필라 | koreanphila.com | ✅ | **1999년 창간, 25년+ 역사**, 필라델피아 유일 한인 신문, 2만 부 배포, 자체 취재 |
| 한국일보 필라델피아 | koreatimesphila.com | ⚠️ | 미주한국일보 필라델피아 지국형, 지역 자체 취재 확인. 독립 편집국 규모 미확인 |
| ~~필라인~~ | ~~philain.com~~ | ❌ | PA·NJ·DE 생활정보 포털. 편집·취재 기능 없음 |

---

### 🌊 마이애미 (Miami, FL)

> ⚠️ **마이애미 전용 한인 언론 없음.** 전국 플랫폼 + 플로리다 한인회(floridakorean.org) 공식 경로 활용.

---

### 🌮 멕시코 3개 도시 (Mexico City / Guadalajara / Monterrey)

> ⚠️ **확인된 활성 한인 언론 없음.** 멕시코시티 Hanin Sinmun(한인신문, 1990년대~) 존재하나 URL 미확인.  
> 취재 경로: 주멕시코 대한민국 대사관 / 한인 총영사관 / 주재원 기업(현대·기아·POSCO) 커뮤니티 직접 접촉 권장.

---

### 🇺🇸 도시별 영문 로컬 미디어 — 품질 평가 완료 (2026-05-08)

> 🔍 조사: AllSides · Ad Fontes Media · Pulitzer.org · Wikipedia 교차 확인  
> **전제**: 모든 영문 미디어도 아래 "성경적 세계관 분별 원칙" 필터를 먼저 통과한 후 사용

---

#### 품질 기준 (한인 미디어와 동일)

```
✅ 정론지급: 자체 취재 기자단 + 10년+ + 퓰리처 또는 공신력 있는 수상
            공영 NPR/PBS 계열 포함 (비당파·공익 취재 원칙)
⚠️ 지역 신뢰: 원본 취재 + 5년+ + 소규모 독립/비영리 언론
❌ 제외:     와이어 서비스 집합 | 클릭베이트 | 극단 편향 | 운영 불명확
```

---

#### 🏙️ 시애틀 (Seattle, WA)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| The Seattle Times | seattletimes.com | ✅ | 중도 | 1891년·퓰리처 10회·시애틀 정통 일간지 |
| KUOW 94.9 FM | kuow.org | ✅ | 좌중도 | 1952년·NPR 계열·무료·SPJ 수상 20회+ |
| Cascade PBS / Crosscut | crosscut.com | ✅ | 중도진보 | 2007년·비영리·무료·심층 지역 보도 |
| The Stranger | thestranger.com | ⚠️ | 진보 | 1991년·대안 주간지·무료·문화·정치 |

---

#### 🤠 달라스 (Dallas, TX)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| The Dallas Morning News | dallasnews.com | ✅ | 중도 | 1885년·퓰리처 10회·**2026년 수상** |
| Fort Worth Star-Telegram | star-telegram.com | ✅ | 중도보수 | 1906년·퓰리처 이력·DFW 서부 커버 |
| KERA 90.1 FM | keranews.org | ✅ | 중도 | 1949년·NPR 계열·무료·텍사스 이민 보도 |
| Fort Worth Report | fortworthreport.org | ⚠️ | 비당파 | 2021년·무료·독립 비영리 |

---

#### 💻 SF 베이에어리어 (San Francisco Bay Area, CA)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| San Francisco Chronicle | sfchronicle.com | ✅ | 진보 | 1865년·퓰리처 다수·**2026년 수상** |
| KQED 88.5 FM | kqed.org | ✅ | 중도진보 | 1954년·NPR/PBS·무료 |
| SF Standard | sfstandard.com | ⚠️ | 중도 | 2022년·신생 독립·무료 |

> ⚠️ SF Chronicle 정치 성향 진보 강함 → **사실 정보만 추출, 사설·칼럼 주의**

---

#### 🗽 뉴욕 / 뉴저지 (New York / New Jersey)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| WNYC 93.9 FM | wnyc.org | ✅ | 중도진보 | 1924년·NPR·무료·피바디 수상·NY/NJ 커버 |
| NJ.com / The Star-Ledger | nj.com | ✅ | 중도진보 | 1832년·퓰리처 이력·NJ 한인 밀집 지역 커버 |
| New York Times | nytimes.com | ✅ | 중도진보 | 1851년·퓰리처 135회+ *(유료·성향 주의)* |
| New Jersey Monitor | newjerseymonitor.com | ⚠️ | 비당파 | 2021년·무료·독립 비영리 |
| Gothamist | gothamist.com | ⚠️ | 진보 | 2003년·무료·WNYC 계열·뉴욕 생활 |

> ℹ️ NJ.com은 팰리세이즈파크 등 NJ 한인 밀집 지역 커버. MetLife Stadium(결승전) 정보 1차 참조

---

#### 🎵 내쉬빌 (Nashville, TN)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| The Tennessean | tennessean.com | ✅ | 중도 | 1907년·퓰리처 이력·TN 주 대표 |
| WPLN 90.3 FM | wpln.org | ✅ | 중도 | NPR 계열·무료·TN 이민 이슈 강점 |
| Nashville Banner | nashvillebanner.com | ⚠️ | 비당파 | 2024년 재창간·무료·Tennessee 4th Estate Award |

---

#### 🦞 보스턴 (Boston, MA)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| WBUR 90.9 FM | wbur.org | ✅ | 중도진보 | 1950년·NPR·무료·피바디 수상 |
| The Boston Globe | bostonglobe.com | ✅ | 진보 | 1872년·퓰리처 25회+ *(유료·성향 주의)* |
| Boston.com | boston.com | ✅ | 중도진보 | Globe 계열·무료 기사 다수 |

> ⚠️ Boston Globe 진보 성향 강함 → **교통·생활·행사 정보 위주 활용, 사설 제외**

---

#### 🌴 LA (Los Angeles, CA)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| LAist / KPCC 89.3 FM | laist.com | ✅ | 중도 | 1925년·NPR/공영·무료·이민 정책 강점 |
| KCRW 89.9 FM | kcrw.com | ✅ | 중도진보 | 1945년·NPR·무료 |
| Los Angeles Times | latimes.com | ✅ | 중도진보 | 1881년·퓰리처 44회 *(유료·성향 주의)* |

> ✅ **LAist는 무료+이민 정책 심층 보도** → LA 1순위 참조

---

#### 🍁 토론토 (Toronto, ON — Canada)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| CBC Toronto | cbc.ca/toronto | ✅ | 중도 | 1936년·국가 공영·무료·캐나다 이민청 정책 |
| The Globe and Mail | theglobeandmail.com | ✅ | 중도 | 1844년·AllSides Center·캐나다 기자상 다수 |
| Toronto Star | thestar.com | ✅ | 중도진보 | 1892년·캐나다 기자상·생활 정보 풍부 |

> ✅ **CBC는 무료+이민 정책 가장 포괄적** → 토론토 1순위

---

#### 🌲 밴쿠버 (Vancouver, BC — Canada)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| CBC Vancouver | cbc.ca/bc | ✅ | 중도 | 1936년·국가 공영·무료 |
| The Tyee | thetyee.ca | ✅ | 중도진보 | 2003년·무료·NNA 결선·Webster Award·이민 정책 강점 |
| Vancouver Sun | vancouversun.com | ✅ | 중도보수 | 1912년·NNA 수상·BC 주류 일간지 |
| Daily Hive | dailyhive.com | ⚠️ | 중도 | 2008년·무료·밴쿠버 생활·이벤트 정보 |

---

#### 🛢️ 휴스턴 (Houston, TX)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| Houston Chronicle | houstonchronicle.com | ✅ | 중도 | 1901년·퓰리처 2015·2022년·이민자 도시 생활 정보 |
| Houston Public Media KUHF | houstonpublicmedia.org | ✅ | 중도 | 1950년·NPR/PBS·무료·텍사스 이민 보도 |

> ⚠️ Houston Landing(비영리) 2025년 5월 폐업 → **목록에서 제외**

---

#### 🍑 애틀랜타 (Atlanta, GA)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| WABE 90.1 FM | wabe.org | ✅ | 중도 | 1948년·NPR/PBS·무료·Atlanta Press Club 수상 |
| Atlanta Journal-Constitution | ajc.com | ✅ | 중도진보 | 1868년·퓰리처 다수·**2026년 디지털 전용 전환** |

> ℹ️ AJC 2026년부터 프린트 종료, 디지털 전용 운영

---

#### 🏈 캔자스시티 (Kansas City, MO)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| KCUR 89.3 FM | kcur.org | ✅ | 중도 | 1957년·NPR·무료·Midwest Newsroom 이민 보도 |
| The Kansas City Star | kansascity.com | ✅ | 중도진보 | 1880년·퓰리처 8회 *(2026년 언론 독립성 논란 주시)* |

---

#### 🔔 필라델피아 (Philadelphia, PA)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| WHYY 90.9 FM | whyy.org | ✅ | 중도 | 1954년·NPR/PBS·무료 |
| The Philadelphia Inquirer | inquirer.com | ✅ | 중도진보 | 1829년·미국 3번째 역사·퓰리처 20회+ |
| Billy Penn at WHYY | billypenn.com | ⚠️ | 중도 | 2014년·WHYY 계열·무료 |

---

#### 🌊 마이애미 (Miami, FL)

| 매체 | URL | 등급 | 성향 | 핵심 |
|---|---|---|---|---|
| WLRN 91.3 FM | wlrn.org | ✅ | 중도 | NPR/PBS·무료·**IRE 최우수상 + 퓰리처 finalist 2026** |
| Miami Herald | miamiherald.com | ✅ | 중도진보 | 1903년·퓰리처 24회·남미 이민 보도 탁월 |

---

#### 🌮 멕시코 3개 도시 (Mexico — 영어 미디어)

| 매체 | URL | 도시 | 등급 | 핵심 |
|---|---|---|---|---|
| Mexico News Daily | mexiconewsdaily.com | 전국 | ✅ | 2014년·광고 없음·100만+ 독자·expat 1순위 영어 매체 |
| The Guadalajara Reporter | theguadalajarareporter.net | 과달라하라 | ⚠️ | 1963년·영어 주간지·유일한 과달라하라 전용 영어 매체 |
| Mexico Today (Reforma 계열) | mexicotoday.com | 전국 | ⚠️ | El Norte·Reforma 스페인어 모기업 신뢰도 높음 |

> ℹ️ 멕시코 3개 도시 영어 미디어 극히 제한적. **Mexico News Daily가 사실상 유일한 정론급 영어 매체**

---

#### 📌 영문 미디어 활용 핵심 원칙

```
1. NPR/PBS 공영 계열 우선 — 비당파·무료·공익 취재 원칙
   (KUOW·KERA·KQED·WNYC·WBUR·LAist·CBC·WABE·KCUR·WHYY·WLRN)

2. 일간지 퓰리처 수상 매체 — 사실 정보 신뢰도 높음
   단, 진보 성향 매체(Globe·NYT·LA Times)는 사설·칼럼 제외, 사실 정보만 추출

3. 성경적 세계관 필터 필수 — 아래 전제 적용
   좌우 어느 진영 매체도 세계관 필터 없이 사용 금지

4. 무료 기사 우선 — 유료 매체는 무료 기사 한도 내 활용
   Seattle Times·Boston Globe·NY Times → 월 무료 한도 내 사용
```

---

### 🔑 전제 — 성경적 세계관 분별이 먼저다

> 📖 **정본**: [`docs/CORE_VISION.md`](CORE_VISION.md) — "성경적 세계관 미디어 분별 원칙"

아래 취재·인용 원칙을 적용하기 **전에**, 모든 기사는 먼저 성경적 세계관 필터를 통과해야 한다:

```
사실(Fact)만 추출 → 세계관(Worldview)은 필터링
좌파·우파 이념 언어 제거 → 이민자 환대 관점으로 재작성
한국 미디어의 진보 편향 인식 + 미국 미디어의 좌·우 편향 인식
어느 진영도 성경적 분별의 대안이 될 수 없다
```

---

### ⚖️ 미디어 취재 & 인용 3원칙 (Claude Code 자동 적용)

#### 원칙 1 — 단일 기사 인용 시: 출처 명시 필수
```
규칙: 1개 기사 내용을 직접 반영할 때는 반드시 출처 표기
형식: // 출처: seattlekdaily.com (2026-MM-DD)
예시: 시애틀 한국일보 2026-05-07 보도 기반
금지: 기사 내용 그대로 복사 (저작권 위반)
허용: 핵심 사실(날짜·장소·주최) 추출 후 HebronGuide 표현으로 재작성
```

#### 원칙 2 — 여러 기사 취합 시: 응용 작성 (출처 불필요)
```
규칙: 3개 이상 매체 기사를 종합·분석한 경우 → 취재 응용으로 처리
형식: // 취재 응용: seattlekdaily.com · seattlen.com · wowseattle.com 등
예시: 여러 한인 미디어 취재 종합 → HebronGuide 독자적 표현 작성
핵심: 사실(fact)은 유지, 표현은 완전히 새로 작성
```

#### 원칙 3 — 검증 후 게시
```
1. 기사 내용 → 공식 출처(King County·City.gov·경기장 공식) 교차 확인
2. 검증된 사실만 HebronGuide 코드에 반영
3. 미검증 항목은 주석으로 보류: // TODO: 공식 확인 필요
4. 시즌 한정 정보는 isSeasonActive() 헬퍼로 자동 노출/숨김
```

---

### 🔄 취재 → 코드 적용 워크플로우

```
폴 김 목사가 기사 공유
    ↓
Claude: 퍼플렉시티 AI로 관련 한인 미디어 3개+ 취합
    ↓
사실 추출 (날짜·장소·가격·주최·출처)
    ↓
공식 사이트 교차 검증 (kingcounty.gov, city 공식 등)
    ↓
HebronGuide 표현으로 완전히 재작성
    ↓
시즌 함수 or 상시 데이터 결정
    ↓
코드 반영 + 출처/응용 주석 기록 + 커밋
```

### 자동 게시 시스템 (Phase 2)
```
한인 미디어 RSS 피드 모니터링 →
관련 키워드(월드컵·셔틀·교통·한인 행사) 자동 감지 →
폴 김 목사 슬랙 알림 →
검수 후 도시별 콘텐츠 자동 추가
```

---

## 📝 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-05-08 (v1) | 초안 — 2026 월드컵 즉각 활용 + 글로벌 이벤트 6단계 표준 |
| 2026-05-08 (v2) | 시애틀 무료 워터프론트 셔틀 적용 (kSeattle.com 출처) + 한인 미디어 활용 원칙 추가 |
| 2026-05-08 (v3) | 15개 월드컵 호스트 도시 경기장 교통 시스템 전면 적용 — WC_TRANSIT 자동 삽입 (6/1~7/26 한정) |
| 2026-05-08 (v4) | 한인 미디어 참조 소스 6개 공식 등록 + 취재·인용 3원칙 정립 |
| 2026-05-08 (v5) | byeon.com (NJ) 추가 — 도시별 미디어 구조로 재편 |
| 2026-05-08 (v6) | 17개 도시 전체 한인 미디어 전수 조사 완료 |
| 2026-05-08 (v7) | 미디어 품질 4대 기준 수립 + 등급 평가 적용 — ❌ 9개 포털·카피 매체 제거 |
| 2026-05-08 (v8) | 성경적 세계관 분별 원칙 전제 추가 |
| 2026-05-08 (v9) | 17개 도시 영문 로컬 미디어 품질 평가 완료 |
| 2026-05-08 (v10) | byeon.com 직접 실사 — ⚠️→❌ 하향. 저널리즘 기준 미달(28/100점) |
| **2026-05-08 (v11)** | **미주중앙일보 9개 지역판 전체 URL 확인 — koreadaily.com/index_[코드] 패턴** |
| | LA·NY·ATL·CHI·DC·SD·밴쿠버·토론토 + 한국중앙일보(joongang.co.kr 외부 링크) |
| | 5개 기사 분석: 전 기사 기자명 없음, 원본 취재 5%, 보도자료 전달 위주 |
| | AllSides·Ad Fontes·Pulitzer.org 교차 확인. 퓰리처 수상 일간지 + 공영 NPR 계열 위주 |
| | 제거: wowseattle, kseattle, newskoreatexas, sfkorean, tnkn.fun, |
| | koamjournal, kyocharohouston, philain, dailyinsight.co.kr |
| | LA→Metro C Line, NY→NJ Transit, Dallas→TRE, SF→Caltrain, Boston→MBTA, |
| | Houston→METRORail, Atlanta→MARTA, KC→셔틀, Philly→SEPTA, Miami→Brightline, |
| | Mexico City→Metro+Tren Ligero, Guadalajara→경전철, Monterrey→Metro, |
| | Toronto→GO Train, Vancouver→SkyTrain / 시즌 후 자동 복원 |

---

## 📚 관련 문서

- [`CORE_VISION.md`](CORE_VISION.md) — WHY (황금률·지혜·순결)
- [`EXPANSION_STRATEGY.md`](EXPANSION_STRATEGY.md) — WHERE (BTS 도시·교회 연결)
- [`EVENT_PLAYBOOK.md`](EVENT_PLAYBOOK.md) — **WHEN (이벤트 타이밍 + 6단계 표준)** ⭐ 이 문서
- [`EXECUTION_GUIDELINES.md`](EXECUTION_GUIDELINES.md) — HOW (8영역 일상 실행)

---

## 🌟 핵심 메시지

> **"세계가 한 도시에 주목하는 그 순간,  
> 우리는 이미 그 도시에서 환대를 준비하고 있다."**

월드컵 한 달 안에 8개 도시에서 이것을 증명할 수 있습니다.

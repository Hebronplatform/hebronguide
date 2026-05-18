# HebronGuide 프로젝트 규칙 (CLAUDE.md)

Claude Code가 이 프로젝트에서 작업할 때 반드시 따르는 규칙입니다.

> **이 문서는 빠른 참조용 요약입니다. 상세 내용은 `docs/` 폴더 참조.**  
> 시작점: [`docs/README.md`](docs/README.md)

---

## 📖 모든 규칙 위의 원칙 — 성경대로 (절대 기초)

> **"핵심 가치는 성경대로야.**  
> **성경이 그렇다고 하면 그런 줄 알고,**  
> **아니라고 하면 아닌 줄 알고,**  
> **하라고 하면 하고,**  
> **하지 말라고 하면 하지 않고."**  
> — 폴 김 목사 (2026-05-18)

이 원칙이 모든 규칙, 모든 판단, 모든 코드의 **최종 심급**입니다.  
어떤 트렌드·압력·편의보다 **성경이 먼저**입니다.

📖 상세: [`docs/CORE_VISION.md`](docs/CORE_VISION.md) — "성경대로" 섹션

---

## ⚠️ 작업 원칙 — 생각 먼저, 행동 나중 (절대 원칙)

> **"차라리 생각을 좀 하고 그 다음에 액션을 취하고, 같은 일을 반복하지 않게 해줘."**  
> — 폴 김 목사 (2026-05-14)

### 모든 작업 전 반드시 확인

```
1. 이 방법이 실제로 작동하는가? (검증 후 진행)
2. 더 간단한 방법이 있는가? (최선을 먼저 찾기)
3. 이 방법으로 실패하면 대안은? (미리 준비)
4. 같은 실수를 전에 한 적 있는가? (반복 금지)
```

### 금지 행동

- ❌ "될 것 같다"는 느낌으로 코딩 시작
- ❌ 검증 없이 사용자에게 "됩니다"라고 말하기
- ❌ 실패 후 비슷한 방법으로 재시도 (근본 원인 먼저 파악)
- ❌ 같은 작업을 3번 이상 반복

### 올바른 순서

```
문제 파악 → 원인 분석 → 최선의 방법 1개 선택 → 실행 → 완료
```

---

## 🌍 도시 지역 분류 원칙 — UN Geoscheme 국제 표준 (절대 원칙)

> **"국제적인 기준이 있으면 그대로 따랐으면 해."**  
> — 폴 김 목사 (2026-05-16)

### 기준: UN Statistics Division Geoscheme (공식 국제 표준)

새 도시를 추가할 때 **반드시** 아래 UN 기준으로 섹션을 결정한다.

| UN 분류 | 포함 국가 | HebronGuide 섹션 |
|---|---|---|
| **Northern America (북미)** | 미국 🇺🇸, 캐나다 🇨🇦 | `// ── 북미 ──` |
| **Central America (중미)** | **멕시코** 🇲🇽, 과테말라, 코스타리카 등 | `// ── 중남미 ──` |
| **Caribbean (카리브해)** | 쿠바, 도미니카 등 | `// ── 중남미 ──` |
| **South America (남미)** | 브라질 🇧🇷, 아르헨티나, 콜롬비아 등 | `// ── 중남미 ──` |
| **Northern Europe** | 영국 🇬🇧, 북유럽 | `// ── 유럽 ──` |
| **Western Europe** | 독일 🇩🇪, 프랑스 🇫🇷, 네덜란드 등 | `// ── 유럽 ──` |
| **Southern Europe** | 이탈리아, 스페인, 포르투갈 등 | `// ── 유럽 ──` |
| **Western Asia (서아시아)** | UAE 🇦🇪, 이스라엘, 튀르키예 등 | `// ── 중동 ──` |
| **South-eastern Asia (동남아)** | 싱가포르 🇸🇬, 태국 🇹🇭, 베트남 🇻🇳 등 | `// ── 동남아시아 ──` |
| **Eastern Asia (동아시아)** | 일본 🇯🇵, 중국 🇨🇳, 한국 🇰🇷 | `// ── 일본 ──` / `// ── 한국 ──` |
| **Australia & NZ (오세아니아)** | 호주 🇦🇺, 뉴질랜드 🇳🇿 | `// ── 오세아니아 ──` |

### 자주 헷갈리는 나라 — 정답 명시

```
멕시코     → 중미 (Central America) → 중남미 섹션 ✅  (북미 ❌)
브라질     → 남미 (South America)   → 중남미 섹션 ✅
두바이/UAE → 서아시아 (Western Asia) → 중동 섹션 ✅
싱가포르   → 동남아시아            → 동남아시아 섹션 ✅
일본/한국  → 동아시아              → 각자 독립 섹션 ✅
호주/뉴질랜드 → 오세아니아         → 오세아니아 섹션 ✅
```

### Claude Code 자동 체크리스트 (도시 추가 시 필수)

```
1. 해당 국가의 UN Geoscheme 분류 확인
2. 위 표에서 HebronGuide 섹션 결정
3. HEBRON_CITIES 배열에서 해당 섹션 주석 아래에 삽입
4. 섹션 주석에 "(UN Geoscheme 기준)" 명시 유지
```

> 참고: https://unstats.un.org/unsd/methodology/m49/

---

## 🇰🇷 한국어 조사 원칙 — 동적 문자열 자동 처리 (절대 원칙)

> **"한국말은 어와 아가 달라. 말 한 마디에 마음을 상하게 하고 닫히게 할 수 있어."**  
> — 폴 김 목사 (2026-05-14)

### 금지 패턴

```typescript
// ❌ 하드코딩 조사 — 변수 값에 따라 틀릴 수 있음
`${city.nameKo}로 성장하기`   // "워싱턴 DC로" → "뉴욕으로" 가 맞음
`${identity.ko}이 됩니다`      // 값에 따라 "이/가" 달라짐
```

### 필수 패턴 — HebronGuide.tsx의 헬퍼 함수 사용

```typescript
// ✅ 조사 헬퍼 자동 처리
`${x}${roJosa(x)} 성장하기`      // "로" vs "으로"
`${x}${iGaJosa(x)} 됩니다`       // "이" vs "가"
`${x}${eulReulJosa(x)} 만듭니다` // "을" vs "를"
`${x}${eunNeunJosa(x)} 최고`     // "은" vs "는"
`${x}${waGwaJosa(x)} 함께`       // "과" vs "와"
```

### 판별 규칙 (Claude Code 자동 적용)

| 상황 | 받침 없음 / 받침 ㄹ | 그 외 받침 |
|---|---|---|
| 방향·수단 | 로 | **으로** |
| 주격 | 가 | **이** |
| 목적격 | 를 | **을** |
| 보조사 | 는 | **은** |
| 접속 | 와 | **과** |

> 단순 복합명사(산책**로**, 경**로**, 종**로**)는 조사가 아니므로 헬퍼 불필요

---

## 🚦 UX 철칙 — 3단계 이하 강제 원칙

> **"뭐든지 단계를 3단계 이상으로 가지 않도록."** — 폴 김 목사 (2026-05-14)

### 자동 적용 규칙

모든 사용자 흐름(등록·신청·연결·검색)은 **최대 3단계**를 넘으면 안 된다.

```
✅ 허용:  1단계 → 2단계 → 3단계 (완료)
❌ 금지:  1 → 2 → 3 → 4단계 이상
```

### Claude Code 자동 체크리스트

새 UI 흐름·페이지·폼 작성 시 반드시 확인:

| 체크 | 기준 |
|---|---|
| ☐ 단계 수 | 사용자 액션이 3개 이하인가? |
| ☐ 필수 필드 | 절대 필요한 것만 (교회명·도시·연락처 = 3개 MAX) |
| ☐ 버튼 수 | 한 화면에 CTA 버튼 1~2개 이하 |
| ☐ 설명 | 단계 설명은 한 줄 이하 |

### 위반 감지 시 자동 수정

- 4단계 이상 흐름 발견 → 단계 통합 또는 생략
- 필드 5개 이상 폼 → 필수 3개 + 나머지 선택(접기)
- 긴 설명 문장 → 핵심 키워드만 남기고 삭제

---

## 🌿 HebronGuide 사명 — 신앙 생태계의 첫 관문

> **"도시 가이드로 출발하지만, 단계적으로 도시와 도시, 사람과 사람,  
> 사람과 교회, 즉 그리스도께 자연스럽게 이끄는  
> 신앙 생태계의 첫 관문으로서 분명한 위치를 갖는다."**  
> — 폴 김 목사 (2026-05-08)

```
도시 가이드 → 도시 연결 → 사람 연결 → 교회 → 그리스도
  (정착 정보)   (17개 도시)  (커뮤니티)  (소개)  (자연스럽게)
```

**모든 콘텐츠 선별의 최종 질문**:  
*"이것이 누군가를 그리스도께 한 걸음 더 자연스럽게 안내하는가?"*

📖 **정본**: [`docs/CORE_VISION.md`](docs/CORE_VISION.md) — "신앙 생태계의 첫 관문" 섹션

---

## ⭐ 최상위 비전 — 황금률 + 지혜·순결

📖 **정본**: [`docs/CORE_VISION.md`](docs/CORE_VISION.md)

### 🌿 섬김의 정신 — Servant Leadership (DNA)

> *"인자가 온 것은 섬김을 받으려 함이 아니라 도리어 섬기려 하고"*  
> — 마가복음 10:45

> *"너희 중에 크고자 하는 자는 너희를 섬기는 자가 되어야 하리라"*  
> — 마가복음 10:43

**인생의 목적은 섬김에 있습니다. 예수님은 섬기러 오셨습니다. 섬기는 사람이 리더입니다.**

```
이민자에게  → 정보·환대로 섬긴다
교회에게    → 신뢰 연결로 섬긴다
지역사회에게 → 자연스러운 빛으로 섬긴다
```

섬김은 전략이 아니라 **정체성**입니다.  
권력이 아닌 섬김 / 소유가 아닌 나눔 / 강요가 아닌 환대.

📖 **정본**: [`docs/CORE_VISION.md`](docs/CORE_VISION.md) — "섬김의 리더십" 섹션

---

### WHY (마음 중심) — 황금률

> *"무엇이든지 남에게 대접을 받고자 하는 대로 너희도 남을 대접하라."*  
> — 마태복음 7:12

매 결정 자문: **"내가 사용자라면 이걸 받고 싶을까?"**

### HOW (실행 원리) — 지혜·순결

> *"뱀처럼 지혜롭고 비둘기처럼 순결하라."* — 마태복음 10:16

🐍 지혜 = 효과적 실행 / 🕊️ 순결 = 순수한 동기

### WHAT (결과) — 세 기둥

① 문화 상품 제작 / ② 글로벌 커뮤니티 / ③ 그리스도의 빛

### 의사결정 7질문 (매 작업 전 통과)

```
∞. 이것이 하나님의 영광을 위한 것인가? ← 모든 것의 기초 (고전10:31)
   "먹든지 마시든지 무엇을 하든지 다 하나님의 영광을 위하여 하라"
   우리는 왕의 자녀로서 기쁨으로 섬깁니다.

   🌿 섬기러 왔는가? ← 섬김의 정신 (막10:45)
     인생의 목적은 섬김. 예수님은 섬기러 오셨다. 섬기는 사람이 리더.
     이 코드·콘텐츠·관계가 누군가를 섬기고 있는가?

   ★ 황금율을 모든 것에 적용한다 ← 운영 원칙 (마7:12)
     코드·콘텐츠·서비스·수익·관계 — 예외 없이 황금율

   ★ 모든 신뢰와 믿음의 관계는 개인과 공동체를 살립니다(마25:35) ← 목적
     강요 없음. 환대가 먼저. 신뢰와 믿음의 관계가 따라옴.

0. 내가 사용자라면 이걸 받고 싶을까? ← 황금률 실천 (마7:12)
1. 시장·문화·인간 본성을 정확히 이해한 결정인가?  (지혜)
2. 효과적으로 목적을 달성하는가?                  (지혜)
3. 사람을 수단으로 쓰지 않는가?                   (순결)
4. 사용자에게 정직하고 투명한가?                  (순결)
5. 그리스도의 환대를 자연스럽게 보여주는가?         (통합)

→ ∞번이 NO이면 시작도 하지 않습니다
→ 나머지 6가지 모두 YES일 때만 진행 / 0번 NO면 ❌
```

### Hard Rules (절대 금지)

❌ 직접 전도 / 성경 도배 / 검증 안 된 정보 / 데이터 판매 / 광고 위장 / 민족주의 / 일요일 상업 활동 / 교회·LLC 자금 혼용 / 이단 등재 / AI 추측 데이터 / **신청·문서 검증·신원 조회 미통과 제공자 연결**

### 선교 신학 함정 (분기별 자가점검)

🚨 **종교 기업 변질** — 효율성이 신학 잠식 / 송영 상실 / 자기 영광 추구  
🚨 **식민주의 함정** — 한국 우월주의 / 민족 정복 마인드 / 명백한 운명식 사고  
🚨 **두 극단** — 세상과 분리(고립) ❌ / 세상에 동화(타협) ❌

✅ **올바른 자리** — 세상 한 복판에서 명확한 정체성 + 친밀한 환대 = 송영(Doxology)

📖 **상세 실행 규칙**: [`docs/EXECUTION_GUIDELINES.md`](docs/EXECUTION_GUIDELINES.md)

---

## 💡 인사이트 즉시 적용 + 자동 위생 원칙

> **"탁월한 인사이트는 놓치지 않고 항상 문서화하고 바로 적용할 것."**  
> **"반복되는 것은 잘 조정하여 보기 좋고 이해 타당하게 깔끔하게 자동 정리할 것."**  
> — 폴 김 목사 (2026-05-08)

📖 **상세**: [`docs/DOC_HYGIENE.md`](docs/DOC_HYGIENE.md)

### 자동 위생 5단계 (모든 인사이트 추가 시 자동 실행)

```
[1단계: 추가] 새 내용을 적절한 정본 문서에 추가
[2단계: 감지] 기존 문서와 중복·유사 검색 (grep)
[3단계: 통합] 중복 발견 시 정본 1곳만 + 다른 곳은 링크
[4단계: 정렬] 시각 품질 점검 (테이블·아이콘·계층)
[5단계: 동기화] README·CLAUDE.md 인덱스·변경 이력 갱신
```

### 정본 문서 (각 원칙은 단 1곳에서만 권위 있음)

| 원칙 | 정본 |
|---|---|
| 황금률·지혜·순결·3기둥 + **성경적 세계관 미디어 분별** | `CORE_VISION.md` |
| 4가지 선교·송영 | `MISSIONAL_THEOLOGY.md` |
| 9질문·8영역·Hard Rules | `EXECUTION_GUIDELINES.md` |
| Chick-fil-A 7원칙 | `OPERATING_PRINCIPLES.md` |
| 알리니파이 목표 | `GOAL_SYSTEM.md` |
| 도시 확장 | `EXPANSION_STRATEGY.md` |
| **도시별 안전·생활 시스템 평가** | `CITY_SAFETY_REPORT.md` |
| 이벤트 (월드컵 등) + **한인 미디어 취재 원칙** | `EVENT_PLAYBOOK.md` |
| **전 세계 언론 정치 성향 분석표** (70개+) | `MEDIA_BIAS_CHART.md` |
| **성경적 기독교 세계관 언론 분석표** | `CHRISTIAN_MEDIA_CHART.md` |
| 포스터·QR·다국어 | `POSTER_QR_STRATEGY.md` |
| AI 직원 6명 | `AI_WORKFORCE_STRATEGY.md` |
| Yelp UX·맛집 | `DINING_GUIDE.md` |
| LLC | `LEGAL_ENTITY.md` + `LLC_SETUP_WORKFLOW.md` |
| 수익 | `REVENUE_STRATEGY.md` |
| 도시별 영혼 점검 | `_hebron_codex/02_guide/CITY_THEOLOGY_MATRIX.md` |
| **27개 도시 한인 미디어 디렉터리** | `docs/KOREAN_MEDIA_DIRECTORY.md` |
| 문서 위생 자체 | `DOC_HYGIENE.md` |
| **파트너 철학·서약·수익나눔 원칙** | `HEBRON_PARTNER_CODEX.md` |
| 4차 줌 네트워크 전략·스크립트 | `PASTOR_NETWORK_PLAYBOOK.md` |
| 6개 서비스 사업계획 + **헤브론 패스 검증 게이트** | `PEOPLE_CONNECT_BIZPLAN.md` |

### 폴 김 목사가 새 인사이트 공유 시 Claude Code 자동 실행

```
✅ 문서화 (정본 문서 + 변경 이력)
✅ 코드 적용 (즉시 반영)
✅ 중복 자동 정리 (grep으로 유사 검색)
✅ 시각 품질 유지 (테이블·아이콘·계층)
✅ 인덱스 동기화 (README·CLAUDE.md)
✅ Git 커밋·푸시
```

### 누적 인사이트 문서

| 파일 | 핵심 |
|---|---|
| [`CORE_VISION.md`](docs/CORE_VISION.md) | 황금률 + 지혜·순결 + 3기둥 (영혼) |
| [`MISSIONAL_THEOLOGY.md`](docs/MISSIONAL_THEOLOGY.md) | **선교 신학**: 4가지 견해 통합 + 송영 자세 + 종교기업 함정 경고 |
| [`EXECUTION_GUIDELINES.md`](docs/EXECUTION_GUIDELINES.md) | 8영역 실행 규칙 (몸) |
| [`GOAL_SYSTEM.md`](docs/GOAL_SYSTEM.md) | Alignify (From X → To Y) |
| [`DINING_GUIDE.md`](docs/DINING_GUIDE.md) | Yelp UX (소비자 관점·필터) |
| [`DIASPORA_STRATEGY.md`](docs/DIASPORA_STRATEGY.md) | BTS·디아스포라 콘텐츠 전략 |
| [`EXPANSION_STRATEGY.md`](docs/EXPANSION_STRATEGY.md) | **확산 전략**: BTS 도시 흐름 + 복음적·제자 만드는 교회 |
| [`EVENT_PLAYBOOK.md`](docs/EVENT_PLAYBOOK.md) | **이벤트 플레이북**: 월드컵·올림픽 등 글로벌 행사 활용 6단계 |
| [`POSTER_QR_STRATEGY.md`](docs/POSTER_QR_STRATEGY.md) | **포스터·QR·3개 언어**: 셀폰에 HebronGuide 즉시 설치 |
| [`AI_WORKFORCE_STRATEGY.md`](docs/AI_WORKFORCE_STRATEGY.md) | **AI 파트너 직원**: 1인 기업의 무한 확장 (Ad/Marketing/Curator/Support/Analytics/QA AI) |
| [`OPERATING_PRINCIPLES.md`](docs/OPERATING_PRINCIPLES.md) | Chick-fil-A 7원칙 |
| [`CORE_VALUES.md`](docs/CORE_VALUES.md) | 정보 섬김 3축 (콘텐츠) |
| [`LEGAL_ENTITY.md`](docs/LEGAL_ENTITY.md) | LLC vs 비영리 |
| [`LLC_SETUP_WORKFLOW.md`](docs/LLC_SETUP_WORKFLOW.md) | LLC 신청 단계 |
| [`REVENUE_STRATEGY.md`](docs/REVENUE_STRATEGY.md) | 수익 단계별 로드맵 |

---

## 🎯 2026 연간 목표 (Alignify)

📖 [`docs/GOAL_SYSTEM.md`](docs/GOAL_SYSTEM.md)

| # | 목표 | 기한 |
|---|---|---|
| 1 | **도시**: 3 → 8 | Dec 31 |
| 2 | **MAU**: ~220 → 1,000 | Dec 31 |
| 3 | **수익**: $200 → $500/월 | Dec 31 |

작업 우선순위: 이 3가지 중 하나라도 지원하면 **고우선**

---

## 🏙️ 다도시 운영 — 시애틀 표준 + 도시 고유성

📖 [`docs/EXECUTION_GUIDELINES.md`](docs/EXECUTION_GUIDELINES.md) 영역 3

```
시애틀 = 마스터 템플릿 (구조·UI 통일)
각 도시 = 고유성 보존 (데이터·시스템 차별화)
```

### 시애틀 표준 (모든 도시 동일)
9탭 구조 / 16개 Quick Menu / ScreenHeader / Korean American 비전 / 검증 체계 / 카테고리 필터

### 도시 고유성 (반드시 보존)
TOP5 맛집·정착·탐방 / 거주지 / 면허 시스템 / 세금 / 이민 / 건강보험 / 태그라인

---

## 📐 데이터 검증 시스템

📖 [`docs/EXECUTION_GUIDELINES.md`](docs/EXECUTION_GUIDELINES.md) 영역 2

### 표시 체계
| 표시 | 의미 |
|---|---|
| `✅ 검증됨` | 공식 사이트·직접 확인 |
| `🔗 웹사이트` | 사용자가 직접 확인 가능 |
| `★ Yelp 4.2` | Yelp 검증 별점 |
| (표시 없음) | 미검증 → 공개 보류 |

### 5단계 절차
```
1. AI 검색 → 1차 수집
2. 전화·주소 대조 확인
3. ✅ 검증 후 입력
4. 날짜 기록 (verified_at)
5. annual_update.py 연 1회 점검
```

---

## ⛪ 한인 교회 등재 4-Tier

📖 [`docs/EXECUTION_GUIDELINES.md`](docs/EXECUTION_GUIDELINES.md) 영역 7

```
Tier 1 ⭐ 신약교회 DNA (영혼구원→제자·소그룹·환대 3기준) — 최우선
           ※ IHM 인증 여부 ❌  → 사명 DNA 여부 ✅  (2026-05-18 폴 김 목사 정정)
Tier 2 ✅ SBC·정통 보수
Tier 3 ✅ 기타 정통 교단
Tier 4 🔍 독립·무소속 (사역팀 검토)
🚫 등재 X — 신천지·통일교·JMS·하나님의교회·여호와의증인·몰몬교
```

---

## 🐔 운영 원칙 — Chick-fil-A 7원칙

📖 [`docs/OPERATING_PRINCIPLES.md`](docs/OPERATING_PRINCIPLES.md)

```
1. 일요일 안식 — 배포·상업 SNS 없음
2. 한 가지 탁월 — 한인 정착만, 범용 기능 ❌
3. My Pleasure — 따뜻한 섬기는 어조
4. 간접 증거 — 직접 전도 ❌
5. 선발 기준 — 검증된 것만
6. 장기 관점 — 단기 수익 < 장기 신뢰
7. 지역 투자 — 기본 기능 영구 무료
```

---

## ⚖️ 구조적 분리 원칙 (교회 ↔ HebronGuide)

```
Hebron Platform LLC ≠ 시애틀지구촌교회
재정 완전 분리 (계좌·인력·자원)
영적 파트너십만 유지

수익 활동 3원칙:
1. 섬김이 먼저, 수익은 결과
2. 투명한 관계
3. 담임목사 인지·동의 (서면 1년·연간 갱신)
```

📖 [`docs/REVENUE_STRATEGY.md`](docs/REVENUE_STRATEGY.md)

---

## 🌐 프로젝트 개요

- **사이트**: hebronguide.com (Vercel 배포)
- **메인 앱**: `hebronguide/` (시애틀, React + Supabase)
- **타 도시**: `dallas/`, `sf/`, `newyork/`, `nashville/`, `boston/`, `la/`, `toronto/`, `vancouver/` (시애틀 모델 복제)
- **확장 로드맵**: 2026 (8개) → 2027 (20개) → 2028+ (글로벌)

### 파일 구조 (핵심만)

```
01_HebronGuide/
├── CLAUDE.md           ← 이 파일 (Claude Code 컨텍스트)
├── docs/               ← 모든 운영 문서 (README.md 인덱스)
├── hebronguide/        ← 시애틀 메인 React 앱
│   ├── src/app/components/HebronGuide.tsx  ← 핵심
│   ├── dist/           ← 빌드 결과 (git 포함)
│   └── vite.config.ts  ← base: '/seattle/'
├── build.sh            ← Vercel 배포 (dist → public/{city}/)
├── vercel.json         ← SPA 라우팅
└── 99_Archive/         ← 옛 버전 보존
```

---

## 🔍 GSC (Google Search Console) 운영

```
hebronguide.com 도메인 1번 등록 완료
→ /seattle/, /dallas/ 등 모든 서브패스 자동 포함
→ 새 도시 추가 시 GSC 재등록 불필요 ✅

새 도시 추가 시:
1. sitemap.xml 업데이트 (필수)
2. GSC sitemap 재제출 (선택, 빠른 인덱싱)
3. URL Inspection (즉시 인덱싱)
```

---

## ⚡ 성능 — 병렬 처리 원칙

**모든 I/O 작업은 기본적으로 병렬:**
- Python: `concurrent.futures.ThreadPoolExecutor` (workers=20)
- JavaScript: `Promise.all()` / `Promise.allSettled()`
- Claude Agent: 독립적 조사는 한 메시지에 여러 Agent 동시 실행

순차 처리는 의존성이 있을 때만.

---

## 📖 성경적 세계관 미디어 분별 원칙

> **정본**: [`docs/CORE_VISION.md`](docs/CORE_VISION.md) — "성경적 세계관 미디어 분별 원칙" 섹션  
> — 폴 김 목사 지시 (2026-05-08)

```
HebronGuide는 정치적 좌파도 우파도 아니다.
성경의 진리가 유일한 기준. 어떤 인간 이념도 그 자리를 대신할 수 없다.
세속 미디어에서 사실(fact)은 취하되, 세계관(worldview)은 성경으로 걸러낸다.
```

### Claude Code 자동 적용 (미디어 기사 사용 시 매번)

| 단계 | 원칙 |
|---|---|
| ① | **FACT ONLY** — 날짜·장소·가격·행사명만 추출. 기자의 평가·해석 제거 |
| ② | **6항목 체크** — 인간존엄·생명·가정·이민자환대·정직·정의 체크리스트 통과 |
| ③ | **환대 재작성** — "나그네를 영접하였다" (마 25:35) 관점으로 재작성 |
| ④ | **정치 중립** — 좌·우 정치 언어 제거. 특정 정당 도구 절대 금지 |
| ⑤ | **의심 시 보류** — 충돌 불확실 → 제외 후 목사님 확인 |

### 절대 반영 금지

```
❌ 성경적 가정 해체 가치관  ❌ 생명을 선택으로 환원
❌ 이민자를 위협으로 프레임  ❌ 특정 정당 지지·비판
❌ 반기독교적 종교 다원주의  ❌ 사실 근거 없는 갈등 조장
```

### 한국·미국 미디어 편향 인식

```
한국 진보 계열 → 계층 갈등·젠더 이데올로기·탈기독교 담론 강함
한국 보수 계열 → 민족주의·이민자 위협 프레임 가능
미국 진보 계열 → 포스트모던 가치관·성 이데올로기
미국 보수 계열 → 이민자 위협 프레임·정치화된 기독교

→ 어느 진영도 성경적 분별의 대안이 될 수 없다
```

---

## 📰 도시별 한인 미디어 참조 소스

> **정본(전체 목록)**: [`docs/EVENT_PLAYBOOK.md`](docs/EVENT_PLAYBOOK.md) — "도시별 한인 미디어 참조 소스" 섹션  
> 🔍 웹 검색 에이전트로 실제 확인된 매체만 등재 (2026-05-08 기준)

### 품질 등급 기준
```
✅ 정론지급: 자체 편집국 + 10년+ + 공신력 확인 (독자 취재 40점 기준)
⚠️ 지역 신뢰: 원본 취재 시도 + 5년+ + 소규모 운영
❌ 제외: 포털·생활정보·타 매체 복사·운영 불명확 → 목록에서 삭제
```

### 도시별 정론지·신뢰 미디어 (✅/⚠️만 포함)

| 도시 | 매체 | URL | 등급 |
|---|---|---|---|
| **전국** | 미주중앙일보 (9개 지역판) | koreadaily.com | ✅ |
| **전국** | 미주한국일보 (9개 지역판 + 영어판) | koreatimes.com | ✅ |
| **전국** | Radio Korea | radiokorea.com | ✅ |
| **전국** | BIGKinds | bigkinds.or.kr | ✅ |
| 시애틀 | 시애틀 한국일보 | seattlekdaily.com | ⚠️ |
| 시애틀 | 시애틀 N | seattlen.com | ⚠️ |
| 달라스 | Korea Times Texas | koreatimestx.com | ⚠️ |
| 달라스 | DK NET 라디오 AM 730 | dalkora.com | ⚠️ |
| SF 베이 | 한미 라디오 AM 1120 | hanmiradio.com | ✅ |
| SF 베이 | SF Korea Daily | sfkoreadaily.com | ⚠️ |
| 뉴욕/NJ | 뉴욕중앙일보 | ny.koreadaily.com | ✅ |
| 뉴욕/NJ | Radio Korea NY | nyradiokorea.com | ✅ |
| 뉴욕/NJ | ~~byeon.com~~ | ~~byeon.com~~ | ❌ 실사 미달 |
| 보스턴 | 보스톤코리아 | bostonkorea.com | ✅ |
| LA | (전국 플랫폼 참조) | — | — |
| 토론토 | 캐나다 한국일보 | koreatimes.net | ✅ |
| 토론토 | 토론토 중앙일보 | cktimes.net | ✅ |
| 밴쿠버 | 밴쿠버 조선일보 | vanchosun.com | ✅ |
| 밴쿠버 | 밴쿠버 중앙일보 | joinsmediacanada.com | ✅ |
| 휴스턴 | Korean Journal Houston | kjhou.com | ✅ |
| 애틀랜타 | 미주중앙일보 ATL | atlanta.koreadaily.com | ✅ |
| 애틀랜타 | 애틀랜타 중앙일보 | atlantajoongang.com | ✅ |
| 캔자스시티 | KC Korean Journal | kckoreanjournal.com | ⚠️ |
| 필라델피아 | 주간필라 | koreanphila.com | ✅ |
| 내쉬빌·마이애미·멕시코 | 전국 플랫폼 + 한인회 경로 | — | — |

> 📖 **상세 평가 근거 & 전체 목록**: [`docs/EVENT_PLAYBOOK.md`](docs/EVENT_PLAYBOOK.md)

### 🌐 글로벌 와이어 서비스 — 팩트 삼각 검증 체계

> 블로그 "Chloe Choi" 11개 추천 분석 결과 (2026-05-08)

```
한국: 연합뉴스 (en.yna.co.kr)   ← 한국발 이슈
미국: AP        (apnews.com)    ← 미국 이민·생활·정책
국제: Reuters   (reuters.com)   ← 글로벌 경제·국제 정세

→ 3개 교차 확인 = HebronGuide 최강 팩트 검증 체계
```

| 매체 | URL | 등급 | 특징 |
|---|---|---|---|
| **AP** | apnews.com | ✅ | 1846년·비영리·미국 50개 주 지국·무료·퓰리처 50회+ |
| **Reuters** | reuters.com | ✅ | 1851년·국제 최강·경제·금융 특화·무료 |
| **BBC** | bbc.com | ⚠️ | 뉴스 섹션만·오피니언 주의 |
| **FT** | ft.com | ⚠️ | 창업·투자 한인 전용·페이월 있음 |
| ~~Guardian~~ | — | ❌ | 좌편향·반기독교 오피니언 빈번 |
| ~~Democracy Now~~ | — | ❌ | 극좌·MBFC Mixed·세계관 충돌 최고 |

---

### 🇰🇷 한국 전통 언론사 미주 진출 매체

| 매체 | URL | 등급 | 비고 |
|---|---|---|---|
| **연합뉴스** | en.yna.co.kr | ✅ | 국가기간통신사. DC·NY·LA 등 6개 도시 특파원. **팩트 신뢰도 최상** |
| **KBS America** | kbswa.com (시애틀) / kbsworldi.com | ✅ | **시애틀·LA·ATL·CHI 4개 도시 지국**. 시애틀 전용 kbswa.com (세금·법률·소상공인) |
| **SBS International** | lalasbs.com | ✅ | **이민 정책 특화** + K타운 성공노트 + 이브닝뉴스 YouTube(무료, 평일 매일) |
| **미주조선일보** | chosundaily.com | ⚠️ | 1920년 조선일보 계열. LA 편집국. 보수 성향 → 사실 정보만 |
| MBC America | mbc-america.com | ⚠️ | LA 기반. 미주 뉴스 제작. 진보 성향 → 사실 정보만 |
| ~~세계일보~~ | — | 🚫 | **통일교(이단) 계열. 인용·취재·연계 전면 금지** |

> 미주 서비스 없음: 동아일보·한겨레·경향신문·서울신문·문화일보·국민일보

---

### 🇺🇸 영문 로컬 미디어 — 도시별 1순위 (무료·공영 우선)

| 도시 | 1순위 (무료·공영) | 보완 (유료·일간지) |
|---|---|---|
| 시애틀 | KUOW kuow.org ✅ | Seattle Times seattletimes.com ✅ |
| 달라스 | KERA keranews.org ✅ | Dallas Morning News dallasnews.com ✅ |
| SF 베이 | KQED kqed.org ✅ | SF Chronicle sfchronicle.com ✅ |
| 뉴욕/NJ | WNYC wnyc.org ✅ | NJ.com nj.com ✅ |
| 내쉬빌 | WPLN wpln.org ✅ | The Tennessean tennessean.com ✅ |
| 보스턴 | WBUR wbur.org ✅ | Boston.com boston.com ✅ |
| LA | LAist laist.com ✅ | LA Times latimes.com ✅ |
| 토론토 | CBC cbc.ca/toronto ✅ | Globe and Mail theglobeandmail.com ✅ |
| 밴쿠버 | CBC cbc.ca/bc ✅ | The Tyee thetyee.ca ✅ |
| 휴스턴 | Houston Public Media houstonpublicmedia.org ✅ | Houston Chronicle houstonchronicle.com ✅ |
| 애틀랜타 | WABE wabe.org ✅ | AJC ajc.com ✅ |
| 캔자스시티 | KCUR kcur.org ✅ | KC Star kansascity.com ✅ |
| 필라델피아 | WHYY whyy.org ✅ | Philadelphia Inquirer inquirer.com ✅ |
| 마이애미 | WLRN wlrn.org ✅ | Miami Herald miamiherald.com ✅ |
| 멕시코 3개 도시 | Mexico News Daily mexiconewsdaily.com ✅ | — |

> **NPR/PBS 공영 계열 우선** — 비당파·무료·공익 취재 원칙  
> **진보 성향 일간지** (NYT·Globe·LA Times 등) → 사설·칼럼 제외, **사실 정보만 추출**  
> 📖 상세: [`docs/EVENT_PLAYBOOK.md`](docs/EVENT_PLAYBOOK.md)

---

### 취재·인용 3원칙 (Claude Code 자동 준수)

```
① 단일 기사 직접 인용 → 출처 명시 필수 (날짜 포함)
   예: // 출처: seattlekdaily.com (2026-MM-DD)

② 3개+ 기사 취합·응용 → 출처 불필요, 응용 작성
   예: // 취재 응용: seattlekdaily.com · seattlen.com · wowseattle.com

③ 항상 공식 출처 교차 확인 후 코드 반영
   예: King County.gov, 시 공식 사이트 등
```

> **퍼플렉시티 AI 활용 권장** — 여러 한인 미디어를 한 번에 취합·요약하여 HebronGuide 표현으로 재작성

📖 **상세 워크플로우**: [`docs/EVENT_PLAYBOOK.md`](docs/EVENT_PLAYBOOK.md)

---

## 🛡 보안 코드 위생

### 절대 금지
- 코드에 비밀번호·API 키·토큰 하드코딩
- 연도가 박힌 식별자 무기한 사용
- `.env`·`secrets/`·`*.key` 파일 git commit
- AI 도구에 비밀번호 평문 전송

### 반드시 할 것
- 모든 비밀은 `.env` / Supabase secrets / Vercel env vars 사용
- AI 도구 사용 시 `.cursorignore` + Privacy Mode
- 관리자 비밀번호 90일마다 회전

---

## 🎬 대중문화 콘텐츠 참조 소스

> 이민자·한인 커뮤니티가 관심을 갖는 대중문화 트렌드를 파악할 때 활용  
> **전제**: IMDb 평점 높다고 HebronGuide 추천 아님 — 성경적 세계관 필터 필수

### IMDb (Internet Movie Database)

| 항목 | 내용 |
|---|---|
| URL | imdb.com |
| 운영 | Amazon 자회사 (1990년~, 콜 니덤 창립) |
| 규모 | 2,590만 작품 + 1,480만 인물 데이터베이스 (2025년 기준) |
| 신뢰도 | 전 세계 40번째 방문 사이트. 등록 사용자 평점 시스템 |
| 한국 콘텐츠 | `imdb.com/search/title/?country_of_origin=KR` — K-드라마·K-영화 필터 |

### HebronGuide 활용 시나리오

```
✅ 활용 가능한 경우:
  - 도시별 "탐방" 섹션에 한국 영화관·문화 이벤트 추가 시 대중적 관심도 확인
  - K-드라마·K-영화가 미주 한인 커뮤니티에서 화제일 때 트렌드 파악
  - 도시별 한국 영화제·상영회 등 문화 행사 소개 시 작품 정보 참조
  - 한국 문화(음식·장소·행사)를 대중문화와 연결할 때 (예: 촬영지 관광)

⚠️ 반드시 성경적 세계관 필터 적용:
  - IMDb 평점 높은 작품 ≠ HebronGuide 추천 콘텐츠
  - 성(性)·폭력·반기독교적 내용 포함 시 → 언급 금지
  - K-드라마도 내용 확인 후 "가족·정착 적합성" 기준으로 선별
  - 단순 인기 지표로만 활용 (문화 관심도 파악), 가치 판단 기준 아님
```

### 함께 활용할 문화 참조 소스

| 소스 | URL | 특징 |
|---|---|---|
| IMDb | imdb.com | 영화·드라마·TV 평점 및 인기 순위 |
| Rotten Tomatoes | rottentomatoes.com | 비평가 + 관객 점수 이중 체계 |
| BillBoard Korea | billboard.com/charts/k-pop-hot-100 | K-pop 인기 순위 |
| Netflix 한국 콘텐츠 | netflix.com | 스트리밍 인기 콘텐츠 현황 |

---

## 🎨 디자인 규칙

- **테마**: 다크 (`#0d1117` 배경)
- **포인트**: 금색 `#C9A227`, 민트 `#6EE7B7`
- **검증 링크 형식**:
```html
<div style="display:flex;flex-wrap:wrap;gap:8px;">
  <a href="URL" target="_blank" rel="noopener" 
     style="color:#6EE7B7;font-weight:700;">🔗 라벨</a>
</div>
```

---

## 🔄 Git 커밋 규칙

- 커밋 후 반드시 `git push origin main`
- prefix 사용: `feat/fix/perf/chore/docs`
- 한국어/영어 모두 OK

---

## 📖 변경 이력 자동 기록

수정·업데이트·오류 수정 시 아래 형식으로 기록:

```
### YYYY-MM-DD | [도시 또는 영역] 제목
- **무엇을**: 변경 내용 요약
- **왜**: 변경 이유
- **교훈**: 타 지역·향후 적용 시 참고
```

📖 상세 변경 이력은 [`docs/CHANGELOG.md`](docs/CHANGELOG.md) (생성 예정)에 이전.

---

## 🎯 Hebron 정신 (정체성)

> *"내가 나그네 되었을 때 너희가 영접하였다"* (마태복음 25:35)
>
> Hebron(헤브론) = 히브리어 "연합·교제·동반자" (חֶבְרוֹן)  
> 아브라함이 거류민으로 살며 하나님과 동행한 땅.

HebronGuide = 이민자들이 새 땅에서 하나님과 동행하도록 돕는 디지털 환대.

📖 상세: [`docs/CORE_VISION.md`](docs/CORE_VISION.md) "Hebron 정신 3중 의미" 섹션

---

## 🌟 운영 5대 원칙 (요약)

1. **정착자의 눈** — 그 도시에 살아본 한인이 쓴다
2. **도착 첫날부터** — 공항에서 나온 그 순간부터 쓸 수 있어야
3. **교회가 신뢰 앵커** — 광고로 살 수 없는 신뢰
4. **투명성이 권위** — 누가·언제·어떻게 확인했는지 항상 명시
5. **현지인과 함께** — 한인 가이드가 영어권 현지인도 찾는 플랫폼

---

*마지막 업데이트: 2026-05-08*  
*상세는 모두 `docs/` 폴더 참조*

# 세 사이트 AI 노출 — 실측과 적용

**정립: 2026-08-11 | HebronGuide.com · NanuriWeb.com · ijiguchon.org**

> **원리**: [`AI_EXPOSURE_TUNNEL.md`](AI_EXPOSURE_TUNNEL.md)
> **"이미 구매 의사가 있는 사람의 첫 행동인 검색에 걸리는 것이 중요하다."** — 폴 김 목사

---

## 왜 검색이 광고보다 싼가

```
광고 · 콘텐츠 대량생산  →  의도 없는 사람에게 밀어넣기   →  비싸고 안 걸린다
검색 · AI 질의          →  이미 절실한 사람이 스스로 온다 →  싸고 잘 걸린다
```

**우리 사용자는 의도가 극도로 강합니다.**
"다음 달에 시애틀로 이사 간다" — 이건 *언젠가 살까* 가 아니라 **반드시 풀어야 하는 일**입니다.

> ⚠️ [`NICHE_STRATEGY.md`](NICHE_STRATEGY.md)의 "SEO 집행 ❌"과 충돌하지 않습니다.
> 거기서 막은 것은 **없는 것을 만들어 밀어넣는 일**입니다.
> **있는 사실이 안 보이는 것을 고치는 일**은 다릅니다.

---

## 실측 — 2026-08-11 실제 검색 결과

### 검색어 ①  "시애틀 한인 교회 정착 가이드"

| 결과 10건 | |
|---|---|
| 케이시애틀 게시판 | 3건 |
| 코리아포탈 업소록 | 2건 |
| KCMUSA · usdongsan | 2건 |
| 개별 교회 홈페이지 | 3건 |
| **HebronGuide** | **0건** |
| **시애틀지구촌교회** | **0건** |

### 검색어 ②  "시애틀 가정교회 목장 한인교회" ★

**AI가 직접 이렇게 답했습니다:**

> *"'가정교회 목장'이라는 특정 명칭의 교회에 대한 구체적인 정보는 찾을 수 없었습니다."*

> ### 이것이 오늘 찾은 가장 큰 발견입니다
>
> 시애틀지구촌교회는 **목장(Mokjang)이 공식 사명**입니다.
> *"Save souls and make disciples through Hospitality, Worship,
> **Mokjang (House Church)**, and Life Bible Study"*
>
> 그런데 그 검색어에 **아무도 없습니다.**
> 경쟁자에게 진 것이 아니라 **자리가 비어 있습니다.**

---

## ① HebronGuide.com — 적용 완료

### 문제

목장 페이지(`gathering.html`)를 만들어 놓고

| | |
|---|---|
| 제목·설명에 "목장"·"가정교회" | **없었다** |
| `sitemap.xml` 등록 | **안 됨** (색인 대상이 아니었음) |
| 구조화 데이터 | **없음** |
| canonical | 없음 |

**목장 페이지인데 목장이라고 말하지 않고 있었습니다.**

### 고친 것 (2026-08-11)

```
제목    이번 주, 식탁의 자리 — HebronGuide 시애틀
     →  시애틀 한인 가정교회 목장 모임 — 이번 주 식탁의 자리 | HebronGuide

설명    시애틀·린우드 한인 가정교회 목장(Mokjang, House Church) 모임 안내.
        이번 주 요일·시간·동네를 그대로 알려드립니다.
        처음 오시는 분도, 교인이 아니어도 괜찮습니다. 무료.

+ canonical · og:url · og:type
+ JSON-LD Event (inLanguage ko/en · isAccessibleForFree · Place · Organizer)
+ sitemap.xml 등록 (weekly, priority 0.8)
```

> **없는 말을 지어낸 것이 아닙니다.** 그 페이지는 실제로 목장 모임 페이지입니다.

### 남은 것

- 도시 페이지 본문 68자 (React SPA) — AI 크롤러는 JS를 대개 실행하지 않는다
- 교회 959개가 JSON-LD에 없음 — **460개 도시 오류를 고친 뒤에**

---

## ② ijiguchon.org — 시애틀지구촌교회 (제가 못 고칩니다)

**교회 홈페이지는 별도 관리라 담당자께 전달해야 합니다.**

### 지금 상태 (2026-08-11 확인)

| | |
|---|---|
| 영문명 | Global Mission Church of Greater Seattle ✓ |
| 주소 | 4900 168th St SW, Lynnwood, WA 98037 ✓ |
| 전화 | 425-350-0191 ✓ |
| **예배 시간** | 홈페이지에 **없음** ← 가장 큰 구멍 |
| 담임목사 성함 | 홈페이지에 **없음** |
| 교단 | 홈페이지에 **없음** |

**새로 온 사람이 "언제 가면 되나"를 홈페이지에서 알 수 없습니다.**

### 해야 할 것 — 순서대로

**1. 예배 시간을 첫 화면에 (가장 급함)**

```
주일예배  오전 00:00 · 오후 00:00
목장모임  금요일 저녁 (동네별)
```

**2. 페이지 제목을 뾰족하게**

```
지금:  HOME
바꾸면: 시애틀 한인교회 | 가정교회 목장 | Global Mission Church of Greater Seattle
```

**3. 「목장(가정교회)」 전용 페이지 하나**

지금 아무도 없는 자리입니다. 담을 것:
- 목장이 무엇인지 (처음 듣는 사람 기준)
- 언제·어디서 모이는지
- **처음 오는 사람이 뭘 걱정하는지에 대한 답** — [gathering.html](../gathering.html) 「처음 오시는 분께」 참고

**4. 구조화 데이터 (JSON-LD) — 복사해서 `<head>`에 넣으면 됩니다**

```json
{
  "@context": "https://schema.org",
  "@type": "Church",
  "name": "시애틀지구촌교회",
  "alternateName": ["Global Mission Church of Greater Seattle", "GMC Seattle"],
  "url": "https://www.ijiguchon.org",
  "telephone": "+1-425-350-0191",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4900 168th St SW",
    "addressLocality": "Lynnwood",
    "addressRegion": "WA",
    "postalCode": "98037",
    "addressCountry": "US"
  },
  "inLanguage": ["ko", "en"],
  "description": "환대(Hospitality)·예배·목장(Mokjang, House Church)·생명의삶으로 영혼을 구원하고 제자 삼는 시애틀·린우드 지역 한인 침례교회."
}
```

> ⚠️ **예배 시간이 확정되면 `openingHoursSpecification` 을 반드시 추가하세요.**
> AI가 "언제 예배하나"에 답할 수 있는 유일한 근거입니다.

**5. HebronGuide와 서로 링크**

```
ijiguchon.org  →  "시애틀 정착 안내" 링크
HebronGuide    →  교회 정확 정보 (2026-08-11 교정 완료)
```

두 엔티티가 서로를 가리키면 AI가 **관계**로 인식합니다. 함께 답에 나옵니다.

---

## ③ NanuriWeb.com — 제가 못 고칩니다 (별도 repo)

> repo 분리 원칙: [`INTEGRATION_CONTRACT.md`](INTEGRATION_CONTRACT.md)

### 같은 원칙을 적용합니다

| # | 무엇을 |
|---|---|
| 1 | **엔티티 이름 세트 고정** — `NanuriWeb(나누리웹, nanuriweb.com)` 항상 함께 |
| 2 | **제목을 뾰족하게** — 무엇을 만드는지, 누구를 위해, 어디서 |
| 3 | **JSON-LD `Organization` + `Service`** |
| 4 | **`llms.txt`** — 한 화면 분량이면 충분. 무엇을 하는 곳인지, 누구를 위한 곳인지 |
| 5 | **한/영 병기** — 영어 설명 문장을 실제로 넣는다 |
| 6 | HebronGuide와 상호 링크 |

### 답하고 싶은 질문을 먼저 적는다

```
"한인 교회 홈페이지 제작 어디서 해?"
"한인회 홈페이지 만들어 주는 곳"
"Korean church website design US"
```

**그 질문에 답할 수 있는 것만 씁니다.**

---

## 세 사이트 공통 — 지킬 다섯

| # | 원칙 | |
|---|---|---|
| 1 | **이름을 세트로 고정** | `HebronGuide(헤브론가이드)` · `시애틀지구촌교회(Global Mission Church of Greater Seattle)` · `NanuriWeb(나누리웹)` |
| 2 | **없는 것을 뾰족하게 쓰지 않는다** | 업소 3개면 "믿을 만한 가게"라 쓰지 않는다 |
| 3 | **답할 질문을 먼저 적는다** | 답 못 하는 질문은 노리지 않는다 |
| 4 | **서로를 가리킨다** | 세 엔티티가 하나의 맥락이 된다 |
| 5 | **한/영 둘 다 실제 문장으로** | 선언(hreflang)만으로는 안 된다 |

---

## 우선순위 — 정직하게

| 순서 | 무엇을 | 왜 |
|---|---|---|
| 1 | **ijiguchon.org 예배 시간** | 지금 아무 데도 없다. 못 찾아간다 |
| 2 | 시트에 목장 모임 채우기 | 터널 ④가 비어 있다 |
| 3 | ijiguchon.org 목장 페이지 | 아무도 없는 자리 |
| 4 | CKSBCA 460개 교정 | 그 뒤에야 교회 목록 등기 가능 |
| 5 | NanuriWeb | 위가 돌아간 뒤 |

> **1·2번이 안 된 채로 3~5번을 하면, 사람을 불러놓고 빈 방을 보여주게 됩니다.**

---

*정립: 2026-08-11*
*관련: [`AI_EXPOSURE_TUNNEL.md`](AI_EXPOSURE_TUNNEL.md) · [`AEO_ENTITY_MAPPING.md`](AEO_ENTITY_MAPPING.md) · [`NICHE_STRATEGY.md`](NICHE_STRATEGY.md) · [`INTEGRATION_CONTRACT.md`](INTEGRATION_CONTRACT.md)*

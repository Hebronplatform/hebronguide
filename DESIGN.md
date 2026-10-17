# HebronGuide 디자인 시스템 · DESIGN.md

> **버전**: 2026-10-17 v1.0 (최초 정립)
> **상위 정본**: `01_Coding/HEBRON_DESIGN_SYSTEM.md` (Hebron Master Design System)
> **이 문서의 역할**: HebronGuide 전용 — 지금 라이브 중인 페이지 (map · lounge · seattle-plus · about · arrive · voices 등) 패턴을 공식화·확장 기준 제공
> **대표님 지시 반영**: "디자인·칼라 유닉함 유지" + "가장 한국적인 것이 가장 세계적" + "디자인 스타일 8가지" (문서 이미지 접근 불가, 업계 통용 분류로 참고)

---

## 1 · 디자인 원칙 (Core Principles)

HebronGuide 디자인은 다음 **네 가지 축**을 지킵니다:

1. **환대 신학** — "내가 나그네 되었을 때에 너희가 영접하였다" (마 25:35). 모든 디자인 결정이 **"환대의 식탁"** 서사로 수렴.
2. **동서양 다리** — 가장 한국적인 톤(Pretendard·명조 성구·여백) + 가장 열린 미국적 플랫폼 UX(토스식 마이크로카피·당근마켓 하이퍼로컬·Nextdoor 동네).
3. **큐레이터·네트워크 허브** — 혼자 담지 않음. 외부 사이트·공식 조직을 품는 **플랫폼 포지셔닝**.
4. **접근성·단순함** — WCAG AA 수준. 과도한 애니메이션·과시적 그래픽 지양. "식탁은 복잡하면 앉기 어렵다".

---

## 2 · 디자인 토큰 (Design Tokens)

### 2.1 색상 (Color)

| 토큰 | HEX | 용도 |
|---|---|---|
| `--bg` | `#0d1117` | 메인 배경 — 깊은 밤의 식탁 |
| `--bg2` | `#161b26` | 카드·섹션 배경 |
| `--bg3` | `#1F2733` | 네비·필터 chip 배경 |
| `--bg4` | `#2A3341` | 보조 입력 영역 |
| `--line` | `rgba(255,255,255,.1)` | 경계선 기본 |
| `--line2` | `rgba(255,255,255,.18)` | 강조 경계선 |
| `--text` | `#ECFDF5` | 본문 (높은 명도·녹빛 톤) |
| `--muted` | `rgba(236,253,245,.62)` | 보조 설명 |
| `--muted2` | `rgba(236,253,245,.4)` | 메타·날짜·출처 |
| **`--accent`** | **`#C9A227`** | **Hebron 등불 금색** (CTA·강조) |
| **`--accent2`** | **`#F5C76E`** | **밝은 금색** (호버·헤드라인 강조) |
| `--accent3` | `#A47A1B` | 어두운 금색 (경계·구분) |
| `--mint` | `#6EE7B7` | 성공·링크·안내 보조 |
| `--rose` | `#FDA4AF` | 경고·주의 |
| `--sky` | `#60A5FA` | 정보·중립 태그 |
| `--ember` | `#FFB300` | 환대의 등불 (특수) |

**금지 색상**:
- 순백(#FFFFFF)·순흑(#000000) — 식탁의 따뜻함이 사라짐
- 네온 핑크·형광 — Hebron 톤과 어긋남
- 자극적 빨강(#FF0000) 등 — 경고에도 var(--rose) 사용

### 2.2 타이포그래피 (Typography)

| 역할 | 폰트 | 사용처 |
|---|---|---|
| **본문·UI** | **Pretendard Variable** (한) + 시스템 fallback | 모든 일반 텍스트 |
| **보조 한글** | Noto Sans KR (300·400·500·700) | Pretendard 로드 실패 시 |
| **성구·시편·경구** | **Noto Serif KR** (400·500·700) | 성경 구절·전통 서사 (CLAUDE.md 지침: 명조는 교회명·성경 구절에만) |
| **영문·숫자·코드** | Geist / Geist Mono (옵션) | 메타 데이터·숫자 라벨 |

**금지**: 개별 페이지에서 임의 폰트 추가 (Google Fonts 외 독자 폰트 금지).

### 2.3 둥근 모서리 (Radius)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius` | `16px` | 카드·입력·버튼 기본 |
| `--radius-lg` | `24px` | 큰 섹션·히어로 블록 |
| (chip) | `99px` | 필터 chip·CTA 버튼 (완전 둥근) |

### 2.4 간격 (Spacing)

표준 간격 체계 (`em`·`rem` 혼용 OK, 하지만 섹션 간은 `rem`):
- 섹션 간: `30px` ~ `60px`
- 카드 안: `20px` ~ `26px`
- 요소 간: `6px` · `10px` · `14px` · `20px` · `30px` 중

### 2.5 그림자 (Shadow)

| 용도 | CSS |
|---|---|
| 카드 호버 | `box-shadow:0 10px 30px rgba(0,0,0,.3);` |
| 등불·강조 | `box-shadow:0 0 10px var(--accent), 0 0 20px rgba(201,162,39,.6);` |
| CTA 그림자 | `box-shadow:0 6px 20px rgba(201,162,39,.35);` |

---

## 3 · 컴포넌트 패턴 (Component Patterns)

### 3.1 Hero 섹션
```
[.lamp (호흡 애니메이션 금빛 원)]
<h1> 서사 제목 — 두 줄 </h1>
<p.verse.serif> 환대 성구 </p>
<p.cite> 성경 출처 (새번역) </p>
<p.lead> 리드 (3~4줄) </p>
[.quick 또는 CTA 버튼 2-3개]
```

**필수 요소**:
- **lamp** — `width:50px; height:50px;` 금빛 radial-gradient + `breathe` 애니메이션
- **환대 성구** — 명조체 (Noto Serif KR) · `--accent2` 색
- **CTA** — 1차 CTA는 금색 background, 2차는 ghost 스타일

### 3.2 카드 (Card)
```css
background: var(--bg2);
border: 1px solid var(--line);
border-radius: var(--radius);
padding: 22px 22px 20px;
transition: all .2s ease;
```
**호버**: `border-color:rgba(201,162,39,.3); transform:translateY(-2px); box-shadow:0 10px 30px rgba(0,0,0,.3);`

**카드 안 구조**:
1. 상단: 태그 chip (카테고리)
2. h3 제목 + 영문 서브텍스트
3. 메타 (지역·국가 — 민트색)
4. 설명 scope (muted2)
5. `.when` 또는 핵심 본문
6. CTA (`a.visit` 또는 `a.ghost`)

### 3.3 필터 chip
```css
background: var(--bg3);
border: 1px solid var(--line);
border-radius: 99px;
padding: 6px 14px;
font-size: .82rem;
```
**선택 상태** (`.on`): `background:var(--accent); color:#0d1117; font-weight:500;`

### 3.4 플로팅 라운지 바 / 네비
```css
position: sticky; top: 0; z-index: 20;
background: rgba(13,17,23,.92);
backdrop-filter: blur(12px);
```

### 3.5 등불 애니메이션 (Hebron 시그니처)
```css
@keyframes breathe {
  0%,100% { opacity: 1; transform: scale(1); }
  50% { opacity: .6; transform: scale(1.1); }
}
.lamp {
  background: radial-gradient(circle, #F5C76E 0%, #C9A227 50%, transparent 72%);
  box-shadow: 0 0 40px rgba(201,162,39,.55);
  animation: breathe 3.2s ease-in-out infinite;
}
```
**더 작은 변형** (map.html 핀):
```css
@keyframes lampBreathe {
  0%,100% { opacity: .9; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}
```

### 3.6 섹션 번호 (seattle-plus 패턴)
```html
<span class="no">01</span>  <!-- 명조체·금색·letter-spacing:5px -->
<h2>섹션 제목</h2>
<p>섹션 리드</p>
```

### 3.7 체크리스트 (당근마켓식)
- 원형 checkbox (border-radius:50%)
- 체크 시 `--accent` 배경 + 흰 체크마크
- 완료 항목은 `.done` (opacity:.5 + text-decoration:line-through)
- 하단 progress bar (금색 gradient)
- localStorage 저장 (per-device)

### 3.8 테이블 (비교)
- 다크 bg + muted 선
- `caption` 하단 — 데이터 출처·날짜 명시 (verifyNote 패턴)
- 태그 chip: `.gold` `.mint` `.sky` `.rose` 4종 (가치 평가 색)

---

## 4 · 디자인 스타일 8가지 — PDF 실제 분류 기반 (2026-10-17)

> **출처**: 대표님 공유 PDF "디자인 스타일 8가지" (`C:\Users\ijigu\OneDrive\03_AI사업_Founder\디자인 스타일 8가지.pdf`)
> **상위 통찰**: PDF 예시들은 모두 **베이지·웜 뉴트럴 라이트 모드** (Lume·moodly·Mindly 앱) — Hebron 다크 테마와 반대 톤이나, **스타일 분류 지식**은 Hebron에 선별 적용 가능.
> **Hebron 적용 원칙**: 다크 테마 + 금빛 등불 + 환대 신학 유지 ← 그 위에 흡수.

### 4.1 글래스모피즘 (GLASSMORPHISM) ✓ **부분 채택**
- PDF 설명: 투명한 유리감이 주는 부드럽고 감각적인 느낌 · 반투명 유리 · 부드러운 블러 · 세련·현대적
- Hebron 적용: **네비·플로팅 바에 `backdrop-filter:blur(12px) + rgba(13,17,23,.9)`** — lounge/seattle-plus 네비 이미 적용. 과하지 않게.

### 4.2 타이포그래피 중심 (TYPOGRAPHIC) ✓ **주 채택**
- PDF 설명: 타이포가 주도하는 강렬·실험적 · 간결 레이아웃 · 메시지 전달력 · 브랜드/포트폴리오 적합
- Hebron 적용: **메인 채택**. **명조 성구 + 큰 Hero 제목 + 섹션 번호 letter-spacing** — 이미 모든 신규 페이지에 흡수. 성경 구절을 Noto Serif KR로 격상한 것이 이 스타일의 Hebron 번역.

### 4.3 뉴모피즘 (NEUMORPHISM / 소프트 UI) ✗ **배제**
- PDF 설명: 부드럽고 입체적인 그림자와 빛 · 차분한 컬러톤 · 편안한 사용자 경험
- Hebron 적용: **배제**. 다크 테마와 부딪히고(이중 그림자가 안 보임) · 접근성(명도비) 떨어짐.
- 대안: Hebron은 "입체감"을 **등불 glow와 호버 translateY**로 대체.

### 4.4 이미지 히어로 (IMAGE HERO / 비주얼 중심 UI) ✓ **흡수**
- PDF 설명: 사진과 여백으로 이야기 · 강한 첫인상·몰입감 · 브랜드 아이덴티티 표현 · 감성적 분위기
- Hebron 적용: **흡수**. map.html의 지구본·arrive.html의 분위기 사진·city 가이드의 Kerry Park 등. 단, **다크 오버레이**로 Hebron 톤 유지.

### 4.5 컬러 블로킹 / 미니멀 UI (COLOR BLOCKING) ✓ **주 채택**
- PDF 설명: 여백과 색으로 완성 · 감각적 컬러 조합 · 간결 레이아웃 · 시각적 집중도
- Hebron 적용: **메인 채택**. Hebron의 "**다크 bg + 금색 포인트 + 민트/스카이 보조**" = Hebron 번역의 컬러 블로킹. 미니멀 기조.

### 4.6 라인 UI (LINE BASED / 선 중심 UI) ✓ **흡수**
- PDF 설명: 여백과 선으로 미니멀 구조 · 깔끔·정돈 · 직관적 흐름 · 콘텐츠 집중
- Hebron 적용: **흡수**. `--line` `--line2` 1px 얇은 테두리 · 섹션 구분선 · 카드 테두리. 과하지 않게.

### 4.7 (PDF 번호 미확인) · *저가 확인 필요*
- PDF 레이아웃상 02·07 번호가 명확히 보이지 않음. 대표님께서 확인해 알려주시면 섹션 보완.
- 추정 후보: **다크 모드 / 그라데이션 UI / 핀터레스트식 Masonry / 모션 비주얼** 중 하나.

### 4.8 마이크로 인터랙션 (MICRO INTERACTION / 동적 UI) ✓ **주 채택**
- PDF 설명: 작지만 확실한 반응 · 피드백 제공 · 직관적·즐거운 사용 경험 · 브랜드 아이덴티티 강화
- Hebron 적용: **메인 채택**. `breathe`·`lampBreathe` 등불 애니메이션 · 체크리스트 progress bar · 카드 호버 translateY · chip 선택 상태 전환. **"작지만 확실한" 환대의 응답**이 Hebron 톤.

---

**결론 — Hebron 디자인 스타일 조합 (PDF 기반 재정립)**:
```
주 채택 (3개): 타이포그래피 중심 + 컬러 블로킹(미니멀) + 마이크로 인터랙션
흡수 (3개):   글래스모피즘(부분) + 이미지 히어로 + 라인 UI
배제 (1개):   뉴모피즘
미확인 (1개): PDF 번호 02·07 — 대표님 확인 필요
```

**Hebron만의 상위 조합** = "**다크 테마 + 금빛 등불의 Minimal Editorial Typographic UI (글래스모피즘 하이라이트·마이크로 인터랙션 레이어)**"
→ 라이트 모드 미니멀 트렌드와 완전히 **다른 유닉한 자리**. 다른 플랫폼이 쉽게 모방하지 못함.

> **PDF 서문 핵심**: _"AI한테 분명 예쁘게 해달라고 했는데 어딘가 촌스럽고 다 비슷비슷함. AI가 멍청하기 보단 내가 원하는 스타일을 구체적으로 지시 못하는 게 큼."_
> → Hebron은 **스타일을 명확히 선언**함으로써 "비슷비슷함"에서 탈출. 이 DESIGN.md가 그 선언문.

---

## 5 · Hebron 독보적 디자인 방향 (대표님 지시 — 2026-10-17)

> **대표님 지적**: "지금까지 Hebron 디자인은 클로드 디자인인 것 같고... 너무 많은 사람들이 따라 하고 있어서 독보적이고 유닉한 특성을 살리기 위해서는 창의적인 변화가 있어야 해."
> **분석**: 맞음. 지금 "다크 bg + 금색 포인트 + 미니멀 + 명조 성구" 조합은 Anthropic·Linear·Vercel·수많은 테크 플랫폼이 공유하는 **표준 다크 미니멀 레시피**. Hebron만의 자리 X.
> **방향**: 서양 테크 플랫폼이 아닌 **"한국 전통 미학 + 디아스포라 서사"**에서 출발하는 독보적 조합으로 전환.

### 5.1 전환할 6가지 요소

| 요소 | AS-IS (Claude식) | TO-BE (Hebron 독보) |
|---|---|---|
| **색상** | 다크 #0d1117 + 금색 #C9A227 | **먹색** 바탕 + **단청 5색 보조** (주·녹·청·황·백) 또는 **한지색 라이트** + 쪽빛 포인트 |
| **등불** | 추상 금색 원 (breathe) | **등롱**(한지·대나무 격자) 모티프 — 좌우 흔들림 애니메이션 |
| **레이아웃** | 서양 CSS Grid | **창호 격자** (井 字 패턴) · **보자기 겹침** (레이어 overlap) |
| **타이포** | Pretendard 주·명조 성구만 | **명조를 Hero·섹션 제목까지** 확장 · **한글 세로쓰기** 요소 (상단 띠) |
| **아이콘** | 서양식 line icons (lucide 톤) | **한국 전통 선 아이콘** (구름·물결·꽃·태극 모티프) |
| **애니메이션** | breathe (크기 변화) | **등롱 흔들림** · **한지 리플** · **물결 번짐** · **먹 번짐** (ink spread) |

### 5.2 독보적 색상 팔레트 (단청 조합 제안)

전통 단청 5색을 Hebron 다크 테마에 재해석:

| 토큰 | 전통 이름 | HEX | 역할 |
|---|---|---|---|
| `--ink` | 먹색 (墨) | `#1A1613` | 메인 배경 (지금 #0d1117 교체) |
| `--hanji` | 한지색 (韓紙) | `#F5EBD6` | 라이트 모드 bg (옵션) |
| `--dancheong-red` | 단청 주 (丹) | `#C8372D` | 강조·CTA (지금 금색 보완/대체) |
| `--dancheong-cyan` | 단청 청 (靑) | `#2B6CB0` | 정보·링크 |
| `--dancheong-green` | 단청 녹 (綠) | `#3F7A5E` | 성공·안내 |
| `--dancheong-yellow` | 단청 황 (黃) | `#D4A017` | 등롱·강조 (지금 금색을 더 황토 쪽으로) |
| `--dancheong-white` | 단청 백 (白) | `#F0E8D6` | 하이라이트·텍스트 |
| `--ink-mist` | 먹 안개 | `#2C2521` | 보조 bg (카드) |

**선택 — 두 가지 방향 중 결정 필요**:
- **방향 A**: 다크 유지하되 **먹색 + 단청 황** 중심 (지금에서 가장 작은 변화·여전히 다크)
- **방향 B**: **한지색 라이트 모드** + **쪽빛·먹** 포인트 (완전히 다른 방향·동양 전통미 강조)

### 5.3 등롱 모티프 (등불 교체)

**지금**: 추상 금색 원 + breathe 애니메이션 — 플랫폼 공통
**교체**: SVG **등롱**(六角 또는 八角 한지 등롱) + **좌우 흔들림(sway) 애니메이션**

```html
<svg class="deungrong" viewBox="0 0 80 100">
  <!-- 등롱 윤곽: 육각 한지 상자 -->
  <path d="M20 20 L60 20 L72 40 L72 70 L60 90 L20 90 L8 70 L8 40 Z"
        fill="url(#hanji-glow)" stroke="var(--dancheong-yellow)" stroke-width="1.5"/>
  <!-- 격자 (창살) -->
  <path d="M8 40 L72 40 M8 70 L72 70 M40 20 L40 90" stroke="var(--dancheong-yellow)" stroke-width="1" opacity=".4"/>
  <!-- 매듭 -->
  <circle cx="40" cy="12" r="3" fill="var(--dancheong-red)"/>
  <defs>
    <radialGradient id="hanji-glow"><stop offset="0%" stop-color="#FFE8A3"/><stop offset="100%" stop-color="#D4A017" stop-opacity=".3"/></radialGradient>
  </defs>
</svg>
```
```css
@keyframes sway {
  0%,100% { transform: rotate(-3deg); }
  50%     { transform: rotate(3deg); }
}
.deungrong { animation: sway 4s ease-in-out infinite; transform-origin: top center; }
```

### 5.4 창호 격자 레이아웃

카드 그리드를 **창호 패턴**(井 자)으로 재해석. 테두리에 **한국 창살 격자 SVG border**:

```css
.card-chango {
  background: var(--ink-mist);
  border: 1px solid var(--dancheong-yellow);
  border-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><!-- 창살 패턴 --></svg>") 1 stretch;
  position: relative;
}
.card-chango::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 49%, var(--dancheong-yellow)/.1 50%, transparent 51%),
              linear-gradient(0deg, transparent 49%, var(--dancheong-yellow)/.1 50%, transparent 51%);
  pointer-events: none;
}
```

### 5.5 명조 과감 확장

**지금**: Noto Serif KR는 성구에만
**변화**: Hero 제목·섹션 번호에도 명조. **한문 세로쓰기**로 상단 띠 장식:

```css
.vertical-ko {
  writing-mode: vertical-rl;
  font-family: 'Noto Serif KR', serif;
  color: var(--dancheong-red);
  letter-spacing: 4px;
}
```
예: 페이지 좌측에 세로로 "환대 호스피탈리티" 띠. 전통 책 느낌.

### 5.6 아이콘 재디자인 (한국 전통 선)

| 지금 | Hebron 독보 |
|---|---|
| 화살표 → | 붓획 ↗ (ink stroke) |
| 지도 핀 | 등롱 아이콘 |
| 체크 ✓ | 매듭(결·結) 아이콘 |
| 집 🏠 | 기와 지붕 선화 |
| 음악 ♪ | 가야금 줄 |

### 5.7 애니메이션 재디자인

| 지금 | Hebron 독보 |
|---|---|
| `breathe` (scale 1→1.1) | `sway` (등롱 좌우 흔들림 ±3도) |
| 호버 translateY | **먹 번짐** (ink-spread: radial-gradient 확장) |
| chip 선택 | **보자기 덮기** (레이어 overlap transition) |
| 로딩 spinner | **한지 리플** (물결 ripple) |

### 5.8 영감 참조 (한국적 디자인·전시·브랜드)

- **국립중앙박물관 디자인** — 전통미 + 현대 UX
- **아모레퍼시픽 사옥 그래픽** — 한지·먹 톤
- **DDP (동대문 디자인 플라자)** — 포스터·아이덴티티
- **배민 글꼴 (한나체·주아체)** — 한국적 디지털 타이포 성공 사례
- **춘원재단·간송미술관** 아카이브 톤

### 5.9 실행 단계 — 큰 리팩토링이므로 신중히

**Step 1 (지금 승인)**: 방향 A(다크 유지+단청) vs 방향 B(한지 라이트+쪽빛) 중 선택
**Step 2**: 샘플 페이지 하나(예: `/unique.html` 또는 `/lounge.html` 리뉴얼)에 독보 디자인 **파일럿 적용**
**Step 3**: 피드백 받고 조정
**Step 4**: 모든 페이지로 확장
**Step 5**: DESIGN.md 섹션 2·3 (토큰·컴포넌트) 전면 갱신

> **중요**: 지금 작성된 섹션 2·3 토큰·컴포넌트는 **AS-IS** 기록. 독보 디자인 승인되면 전면 재작성.

---

## 6 · 마이크로카피 지침 (대표님 "토스식" 요구 반영)

### 5.1 길이
- CTA 버튼: 2~5단어 ("바로가기 →", "식탁 열기 →")
- 섹션 리드: 1~2문장
- 설명: 꼭 필요한 만큼만

### 5.2 톤
- **"가볍게"·"3분이면 끝나요"** — 토스 UX
- **"혼자가 아닙니다"·"가장 가까운 식탁"** — Hebron 신학
- **"이럴 때 들러보세요"·"방금 도착하셨나요?"** — 사용자 상태 중심

### 5.3 금지
- "클릭하세요" (너무 명령형) → "열어보기", "들러보기"
- 광고 톤 ("최고의", "No.1") — 신뢰 깨짐
- 영어 복붙 ("Learn More") — "자세히 보기"로 번역
- 이모지 (CLAUDE.md 지침)

---

## 6 · 접근성 (Accessibility)

- **최소 명도**: WCAG AA 수준 (`--text #ECFDF5` on `--bg #0d1117` 명도비 15.3:1 — AAA)
- **포커스 표시**: 모든 interactive에 `:focus` 가시화 (금색 outline 2px)
- **최소 폰트**: 12px 이상 (CLAUDE.md 지침)
- **터치 타겟**: 최소 44x44px (iOS·Android 가이드)
- **키보드 네비게이션**: 탭 순서 자연스럽게 (논리적 DOM 순서)
- **스크린리더**: alt text 모든 이미지에·`aria-label` 아이콘 버튼에
- **`prefers-reduced-motion`**: 애니메이션(breathe·spin) 감지해 중지

---

## 7 · 지금 라이브 중인 페이지 vs 이 지침 Compliance

| 페이지 | 상태 | 비고 |
|---|---|---|
| `/arrive.html` | ✓ 준수 | 네 원칙의 인식 — 기본 톤 |
| `/map.html` | ✓ 준수 | 지구본 + 등불 핀 — 시그니처 애니메이션 |
| `/lounge.html` | ✓ 준수 (최신) | JSON 레지스트리 + 한/영 토글 |
| `/seattle-plus.html` | ✓ 준수 | 섹션 번호·체크리스트·테이블 비교 — 가장 완성도 높음 |
| `/about.html` | ✓ 준수 (기존) | 창립 이야기 섹션 |
| `/voices.html` | ✓ 준수 (기존) | 환대의 목소리들 |
| `/ad-request.html` | ✓ 준수 | 광고 신청 폼 |
| `/{city}/` React SPA | 부분 준수 | shadcn·Tailwind 혼용 — 전환 필요 (후속 작업) |

---

## 8 · 신규 페이지 체크리스트

새 HTML 페이지를 만들 때:

- [ ] 다크 bg (`#0d1117`) + 금색(`#C9A227`) 포인트
- [ ] Pretendard Variable + Noto Serif KR (성구에만 명조)
- [ ] Hero에 lamp 애니메이션 + 환대 성구 + 리드
- [ ] 섹션 번호 (`.no` 명조 letter-spacing:5px)
- [ ] CTA는 금색 bg + ghost 보조
- [ ] 모바일 반응형 (720px breakpoint)
- [ ] 상단 네비 (sticky + backdrop-filter)
- [ ] 하단 footnav (/·지도·라운지·관련 페이지)
- [ ] 접근성 (focus 가시화·터치 타겟·명도비 AA)
- [ ] 이모지 없음 — SVG 아이콘만
- [ ] `prefers-reduced-motion` 애니메이션 중지

---

## 9 · 디자인 생성 참고 사이트 (대표님 공유)

- http://styles.refero.design
- http://designmd.me
- http://open-design.ai
- http://designmd.supply
- http://getdesign.md

→ **역할**: 미래 Hebron 전용 디자인 시스템 생성 도구와 연계. 지금은 **이 DESIGN.md가 수동 정본**.

---

## 10 · 변경 이력 (Changelog)

- **2026-10-17 v1.0** — 최초 정립 (map·lounge·seattle-plus 공통 패턴 정립)
- (앞으로) 변경 사항은 여기에 기록

---

## 큐레이터 선언

> HebronGuide 디자인은 **가장 한국적인 톤**(여백·명조 성구·금빛 등불)과
> **가장 열린 미국적 플랫폼 UX**(토스식 마이크로카피·당근마켓 하이퍼로컬·Nextdoor 동네)를
> 함께 담아, **동서양을 잇는 다리**가 됩니다.
>
> 디자인은 식탁의 색이고, 카피는 식탁의 말이며, 애니메이션은 식탁의 등불입니다.
> 모든 것이 **"혼자가 아닙니다"** 한 문장에 수렴합니다.

*2026-10-17 · 김성수 대표님 비전을 토대로 Claude Opus 4.7 정립*

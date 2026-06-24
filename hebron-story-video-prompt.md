# 환대의 여정 — 홍보 영상 제작 가이드

HebronGuide 스토리 영상 두 가지 버전:

1. **즉시 사용 가능** — `hebron-story.html` (HTML/CSS 애니메이션, 60~75초). 브라우저에서 바로 재생되고, 화면 녹화하면 MP4가 됩니다.
2. **시네마틱 실사 버전** — 아래 프롬프트를 Veo / Sora / Kling / Runway / Pika 등에 넣어 생성.

> **핵심 메시지:** 환대는 교회 입구가 아니라 — 공항에서, 거리의 일상에서, 직장과 가게에서 시작된다.
> **색 연출:** 차가운 블루(외로움) → 따뜻한 골드(연결·환대). 한 사람의 표정이 무표정 → 미소로.

---

## A. HTML 영상을 MP4로 만들기 (가장 빠름)

1. `hebron-story.html`을 브라우저로 열고 `F`(전체화면) → 자동 재생
2. 화면 녹화: **Windows** `Win + Alt + R` (Xbox Game Bar) · **Mac** `Cmd+Shift+5` · 또는 OBS
3. 60~75초 녹화 → MP4 저장
4. 음악을 입히려면 무료 음원(아래 D 참고)을 영상 편집기(클로바, CapCut, 곰믹스)에서 합성

---

## B. AI 영상 생성 프롬프트 (장면별 — 8~10초씩 생성 후 이어붙이기)

각 장면을 개별 생성한 뒤 편집기에서 연결하세요. 공통 스타일을 매 프롬프트 앞에 붙입니다.

**[공통 스타일 — 매번 앞에 붙이기]**
> Cinematic, photorealistic, shallow depth of field, 24fps film look, soft natural light. An East Asian (Korean) immigrant in their 30s, modest clothing, carrying one suitcase. Emotional arc from cold blue tones (loneliness) to warm golden tones (belonging). No on-screen text. Subtle, hopeful.

| # | 장면 (한글 캡션) | AI 영상 프롬프트 (영문) | 색/감정 |
|---|---|---|---|
| 1 | 낯선 도시에 막 도착 | Wide shot, an immigrant exits an airport arrivals gate at dusk, pulling a suitcase, looking around uncertainly at an unfamiliar foreign city. Cold blue color grade. | 차가움 |
| 2 | 공항에서 작은 친절 | A stranger holds the door / points the way for the lost newcomer, a brief warm gesture. Medium shot, hint of warm light entering the cold frame. | 차가움+살짝 |
| 3 | 식당에서 말을 건네는 주인 | Inside a cozy small Korean restaurant, the owner leans over the newcomer's table, speaking kindly, gesturing reassurance. Warm pools of light, rest of frame still cool. | 전환 시작 |
| 4 | 냅킨에 적어준 주소 | Close-up macro: a hand writes "HebronGuide.com" on a paper napkin and slides it across the table. | 중립 |
| 5 | 호텔 방, 외로운 밤 | A lonely hotel room at night, the immigrant lies on the bed staring at the ceiling, city lights through the window. Deep cold blue, melancholic. | 가장 차가움 |
| 6 | 폰으로 검색 → 미소 | Close-up of the person's face lit by a phone screen; they type a web address, scroll a helpful guide, and a gentle smile slowly appears. Color grade warms on the smile. | 따뜻해짐 |
| 7 | 정착 몽타주 | Quick warm montage: holding a new driver's license, signing papers, a phone call answered with relief, settling into a small apartment. Golden hour light. | 따뜻함 |
| 8 | 다시 만나 차 한 잔 | Two people (the newcomer and the restaurant person) meet again at a café, laughing over coffee, genuine connection. Warm, intimate. | 따뜻함 |
| 9 | 공동체로 인도됨 | The newcomer is warmly welcomed into a small, diverse faith community gathering in a bright room; people embrace and smile. Golden, hopeful. | 가장 따뜻 |
| 10 | 메시지 + CTA | Slow push-in on an open doorway with warm light spilling out. (편집기에서 자막 추가) | 골드 |

**엔딩 자막 (편집기에서 삽입):**
> 환대는 교회 입구가 아니라 — 공항에서, 거리에서, 가게에서 시작됩니다.
> **HebronGuide.com** · 처음 도착한 그 날부터, 환대가 기다립니다.

---

## C. 나레이션 (선택 — 한국어 보이스오버)

> (잔잔하게) "낯선 도시에 처음 도착한 날, 우리는 모두 나그네였습니다.
> 그날, 누군가의 작은 환대가 — 공항에서, 식당에서, 길에서 —
> 한 사람의 인생을 바꿉니다.
> 환대는 교회 문 앞이 아니라, 일상에서 시작됩니다.
> HebronGuide. 처음 도착한 그 날부터, 환대가 기다립니다."

---

## D. 음악 (무료/저작권 안전)

- YouTube 오디오 보관함 (Cinematic / Hopeful / Ambient piano)
- Pixabay Music, Bensound — "warm piano", "emotional uplifting"
- 톤: 잔잔한 피아노로 시작 → 6번 장면(미소)부터 현악기 더해지며 따뜻하게 고조

---

## E. 어디에 어떻게 넣을까

### 발표 (이미 적용됨)
- **HTML 덱**: 슬라이드 3 "환대의 여정"에 재생 버튼 → `hebron-story.html` 새 창 자동 재생
- 위치 이유: 감사 인사 직후, 개인 이야기 직전 — **감정의 문을 여는 훅**

### PPTX에 MP4 넣기
1. MP4 준비 (위 A 또는 B)
2. PowerPoint에서 슬라이드 3 선택 → **삽입 → 비디오 → 이 디바이스**
3. 비디오 선택 → 재생 탭 → **시작: 자동 실행**, **전체 화면 재생** 체크
4. (현재 PPTX 슬라이드 3은 영상 자리 표시 슬라이드 — 여기에 MP4를 얹으면 됩니다)

### 웹사이트 홍보
- `hebronguide.com` 첫 화면 또는 `/church-guide`에 임베드
- SNS(유튜브 Shorts·인스타 릴스): 9:16 세로 버전으로 6·8·9번 장면 중심 30초 컷

---

*관련: `presentation-hospitality.html` · `presentation-script.md` · `hebron-story.html`*
*메시지 정본: `docs/MISSIONAL_THEOLOGY.md` (선교적 교회 개척 — 스테처 5역설)*

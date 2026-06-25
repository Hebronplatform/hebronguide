# 환대의 여정 — Gemini(Veo) 영상 만들기 (복사해서 바로 붙이기)

> **메시지(양방향):** 성도와 교회가 HebronGuide에 *등록*해 환대를 준비하고,
> 비신자가 HebronGuide로 *연결*되어 → 교회로 인도된다.
> 환대는 교회 입구가 아니라 공항·거리·가게에서 시작된다.
>
> 순서: CLIP 0a·0b (성도·교회 등록 = 준비) → CLIP 1~8 (비신자 도착→환대→정착→교회).

---

## 1. 어디에 넣나 (셋 중 하나)

| 도구 | 주소 | 추천 상황 |
|---|---|---|
| **Gemini 앱** | gemini.google.com (또는 모바일 Gemini 앱) | 가장 간단 — 프롬프트 붙이고 "영상/Video" 선택 |
| **Google Flow** ⭐ | labs.google/flow | 8초 클립 여러 개를 한 타임라인에서 이어붙이기·장면 확장 |
| **Vertex AI / Gemini API** | cloud.google.com | 개발자 자동 생성 |

- **유료**: Veo는 Google AI Pro 또는 Ultra 구독에서 사용 (요금제·국가별 제공 여부 확인).
- **클립 길이**: Veo는 한 번에 약 8초 생성 → 아래 8개를 각각 만들고 편집기에서 연결.
- **언어**: 프롬프트는 **영어**가 가장 잘 나옵니다. 화면 자막/내레이션 한글은 영상 생성 후 **편집기에서 얹으세요** (AI가 글자를 정확히 못 씀).

---

## 2. 사용법 (3단계)

1. 아래 **클립 1~8**의 영어 프롬프트를 하나씩 복사 → Gemini/Flow에 붙여넣기 → 생성
2. 마음에 드는 컷이 나올 때까지 재생성 (씨앗 캐릭터 묘사가 같아 인물이 비슷하게 유지됨)
3. 8개 클립을 편집기(CapCut·곰믹스·Premiere)에서 순서대로 연결 + 한글 자막 + 음악

---

## 3. 클립별 프롬프트 (각 ~8초 · 영어 그대로 복사)

> 각 프롬프트에 인물·톤 묘사가 반복되어 있습니다(클립 간 일관성 유지를 위해 그대로 두세요).

### CLIP 0a — 성도가 가게를 등록 (준비하는 쪽 · 따뜻)
```
Cinematic, photorealistic, 24fps, warm light. A Korean small-business owner in their 40s stands behind the counter of their cozy shop or restaurant, smiling gently while registering their business on a website using a smartphone. A welcoming, hopeful mood. Warm golden tones. No on-screen text.
```

### CLIP 0b — 교회가 문을 엽니다 (등록 · 환영)
```
Cinematic, photorealistic, 24fps, warm light. A friendly Korean pastor in their 50s stands at the open doors of a small church, smiling warmly and holding a phone, as if registering the church to welcome newcomers. Soft golden light spills from the doorway. Hopeful, inviting. No on-screen text.
```

### CLIP 1 — 공항 도착 (차가운 톤)
```
Cinematic, photorealistic, 24fps film look, shallow depth of field. A Korean immigrant man in his 30s, modest clothes, pulling one suitcase, walks out of an airport arrivals gate into an unfamiliar foreign city at dusk. He looks around uncertainly, a little lost and lonely. Cold blue color grade, soft ambient airport light. Slow handheld push-in. No on-screen text.
```

### CLIP 2 — 공항에서 작은 친절
```
Cinematic, photorealistic, 24fps. The same Korean immigrant man in his 30s with a suitcase looks confused in an airport hall. A friendly local stranger gently points him the way and holds a door open, a small warm gesture. A hint of warm golden light enters the still-cool frame. Medium shot, natural light. No on-screen text.
```

### CLIP 3 — 식당에서 말을 건네는 주인
```
Cinematic, photorealistic, 24fps. Inside a cozy small Korean restaurant. The same immigrant man in his 30s eats alone at a table. The kind restaurant owner leans over, speaking warmly and reassuringly to him. Warm pools of light on their faces, the rest of the room slightly cool. Intimate, hopeful mood. No on-screen text.
```

### CLIP 4 — 냅킨에 적어준 주소 (클로즈업)
```
Cinematic macro close-up, photorealistic, 24fps. A hand writes a web address on a paper napkin with a pen, then slides the napkin across a wooden restaurant table toward the viewer. Warm soft light, shallow focus on the napkin. No legible text needed.
```

### CLIP 5 — 호텔 방, 외로운 밤 (가장 차가움)
```
Cinematic, photorealistic, 24fps. A lonely hotel room at night. The same Korean immigrant man in his 30s lies on the bed, staring at the ceiling, worried. City lights glow through the window. Deep cold blue, melancholic, very quiet. Slow static shot. No on-screen text.
```

### CLIP 6 — 폰으로 검색 → 미소 (따뜻해지기 시작)
```
Cinematic close-up, photorealistic, 24fps. The same man's face lit softly by a phone screen in the dark hotel room. He types a web address and scrolls a helpful city guide app. A gentle, relieved smile slowly appears on his face. The color grade gradually warms from cold blue to soft gold as he smiles. No on-screen text.
```

### CLIP 7 — 정착 몽타주 (따뜻함)
```
Cinematic warm montage, photorealistic, 24fps, golden hour light. The same Korean man in his 30s: holding a new driver's license and smiling, shaking hands warmly, answering a phone call with relief, settling into a small bright apartment. Quick uplifting cuts, hopeful and warm. No on-screen text.
```

### CLIP 8 — 다시 만나 차 한 잔 → 공동체로 (가장 따뜻)
```
Cinematic, photorealistic, 24fps, warm golden light. The same Korean man meets the kind restaurant owner again at a cozy cafe, both laughing genuinely over coffee. Then a wider warm shot: he is welcomed into a small, diverse, joyful faith community gathering in a bright room, people smiling and embracing. Hopeful, heartfelt, golden tones. No on-screen text.
```

---

## 4. 마지막에 얹을 한글 자막 (편집기에서)

엔딩 컷(클립 8 끝 또는 따뜻한 문이 열린 장면)에 텍스트로:

> **환대는 교회 입구가 아니라 —**
> **공항에서, 거리에서, 가게에서 시작됩니다.**
>
> **HebronGuide.com**
> 처음 도착한 그 날부터, 환대가 기다립니다.

---

## 5. (선택) 내레이션 — 잔잔한 한국어 보이스오버

> "낯선 도시에 처음 도착한 날, 우리는 모두 나그네였습니다.
> 그날, 누군가의 작은 환대가 — 공항에서, 식당에서, 길에서 — 한 사람의 인생을 바꿉니다.
> 환대는 교회 문 앞이 아니라, 일상에서 시작됩니다.
> HebronGuide. 처음 도착한 그 날부터, 환대가 기다립니다."

---

## 6. 음악 (무료·저작권 안전)
- YouTube 오디오 보관함 / Pixabay Music / Bensound — "warm piano", "emotional hopeful"
- 톤: 잔잔한 피아노로 시작 → 클립 6(미소)부터 현악기 더해 따뜻하게 고조

---

## 7. 완성한 MP4를 어디에 넣나
- **PPTX**: 슬라이드 3(환대의 여정) → 삽입 → 비디오 → 이 디바이스 → 재생 탭 "자동 실행"
- **HTML 덱**: 슬라이드 3 재생 버튼이 현재 `hebron-story.html`(애니메이션)을 엽니다. MP4로 바꾸려면 말씀 주세요 — 영상 임베드로 교체해 드립니다.
- **웹사이트/SNS**: hebronguide.com 첫 화면, 유튜브 Shorts·릴스(9:16 세로 컷)

---

*빠른 대안: 영상 생성이 번거로우면 `hebron-story.html`을 전체화면으로 재생 → 화면 녹화(Win+Alt+R)하면 즉시 MP4가 됩니다.*
*관련: `hebron-story.html` · `hebron-story-video-prompt.md` · `presentation-hospitality.html`*

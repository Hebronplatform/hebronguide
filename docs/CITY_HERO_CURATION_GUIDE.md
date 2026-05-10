# 도시별 Hero 사진·영상 큐레이션 가이드

**작성일: 2026-05-10 (새벽) | 다음 세션 작업 안내**

> *"네 눈을 들어 너 있는 곳에서 동서남북을 바라보라"* — 창세기 13:14  
> 각 도시의 진짜 모습이 그 도시의 환대다.

---

## 🎯 왜 이 작업이 중요한가

[`CORE_VISION.md`](CORE_VISION.md)의 **4기둥** 중 두 가지를 직접 강화:

- ✅ **① 보여주는 전도** — 그 도시의 진짜 첫 인상
- ✅ **④ 연대 생태계** — 17개 도시 평등하게 빛남 (시애틀 우월주의 ❌)

현재 (2026-05-10 새벽 1차 fix 후) — 14개 도시는 도시 색 그라디언트 + 이니셜 워터마크로 깨끗한 폴백. **거짓 표상은 제거됨.** 이제 각 도시의 진짜 영혼을 사진/영상으로 입히는 작업.

---

## 📂 현재 상태 (2026-05-10 push 완료)

| 도시 | 현재 표시 | 상태 |
|---|---|---|
| **시애틀** | Unsplash 6장 (2시간 교체) + LIVE CAM | ✅ 정상 |
| **달라스** | Pexels 영상 + LIVE CAM | ✅ 정상 |
| **SF** | Pexels 영상 + LIVE CAM | ✅ 정상 |
| **나머지 14개** | 도시 색 그라디언트 + 이니셜 워터마크 (예: NYC, LAX, BOS) | ⚠️ 큐레이션 대기 |

**14개 도시:**
- 미국: 뉴욕(newyork), LA(la), 휴스턴(houston), 애틀랜타(atlanta), 보스턴(boston), 필라델피아(philadelphia), 마이애미(miami), 내쉬빌(nashville), 캔자스시티(kansascity)
- 캐나다: 토론토(toronto), 밴쿠버(vancouver)
- 멕시코: 멕시코시티(mexicocity), 과달라하라(guadalajara), 몬테레이(monterrey)

---

## 🛠️ 큐레이션 옵션 비교

### 옵션 A — Pexels 영상 (시애틀·달라스·SF 모델)
**적합 도시**: 모든 도시 (생동감 최대)

**장점**: 일관성 ✅, 생동감 ✅, hot-link 안전 ✅  
**단점**: 데이터 무거움, 자동재생 모바일 환경 일부 막힘

**작업 패턴** (`HebronGuide.tsx` line 160-193 `CITY_CONFIG`):
```ts
newyork: {
  ...,
  heroVideo: "https://videos.pexels.com/video-files/{ID}/{ID}-hd_1920_1080_30fps.mp4",
}
```

**Pexels 검색 키워드 (영문)**:
- 뉴욕 → "new york skyline night", "manhattan aerial", "times square"
- LA → "los angeles night", "santa monica pier", "downtown la"
- 휴스턴 → "houston skyline", "houston downtown"
- 애틀랜타 → "atlanta skyline", "centennial park"
- 보스턴 → "boston harbor", "boston skyline"
- 필라델피아 → "philadelphia skyline", "liberty bell"
- 마이애미 → "miami beach", "south beach miami"
- 내쉬빌 → "nashville music", "nashville downtown"
- 캔자스시티 → "kansas city skyline"
- 토론토 → "toronto cn tower", "toronto skyline"
- 밴쿠버 → "vancouver mountains", "vancouver harbor"
- 멕시코시티 → "mexico city zocalo", "mexico city aerial"
- 과달라하라 → "guadalajara cathedral"
- 몬테레이 → "monterrey mexico mountains"

### 옵션 B — Unsplash 사진 4-5장 (시애틀 6장 모델)
**적합 도시**: 영상 못 찾는 도시 / 영상 무거운 환경 우려

**장점**: 가벼움 ✅, 시애틀 6장 패턴 재사용 ✅, 다양성 ✅  
**단점**: 영상보다 정적

**Unsplash hot-link URL 패턴**:
```
https://images.unsplash.com/photo-{ID}?w=1200&q=85
```

### 옵션 C — 하이브리드 (가장 추천)
- 영상 찾기 쉬운 대도시 → 영상 (뉴욕, LA, 토론토, 마이애미)
- 영상 어려운 도시 → 사진 4-5장 (캔자스시티, 과달라하라, 몬테레이)

---

## 📋 작업 흐름 (다음 세션)

### Step 1 — 도시별 미디어 큐레이션 (1.5시간)
김PD님 + Claude 함께:
1. Pexels.com / Unsplash.com 검색 (위 키워드)
2. **검증 기준 ([CLAUDE.md](../CLAUDE.md) Hard Rule)**:
   - ✅ 무료 라이선스 (Pexels/Unsplash 둘 다 자유 사용)
   - ✅ 정말 그 도시 사진인지 (이미지 메타·캡션 확인)
   - ✅ 환대에 적합한 분위기 (밤·낮·자연·사람)
   - ❌ 부정적 이미지 (홈리스·사고·정치 시위) ❌
3. URL을 김PD님이 한국어로 검토 → 확정

### Step 2 — `HebronGuide.tsx` CITY_CONFIG 갱신
영상이면 `heroVideo: "..."` 추가, 사진이면 도시별 사진 배열 시스템 추가.

### Step 3 — `CompactHeroNew` 사진 배열 지원 추가
도시별 사진 배열이 있을 때 시간대별 교체 로직.

### Step 4 — 빌드 + push
`pnpm build` → commit → push origin main.

---

## 🛡️ Hard Rules — 큐레이션 시 절대 금지

```
❌ 검증 안 된 도시 사진 (정말 그 도시인지 확인 안 함)
❌ 유료 라이선스 이미지를 무료처럼 사용
❌ 사람 얼굴 노출 (개인정보 보호)
❌ 부정적·자극적 이미지 (사고·시위·홈리스)
❌ 종교 시설 우상화 (특정 교회만 부각)
❌ 한국 우월주의 표상 (예: 미국 도시에 한국 국기 강조)
```

→ 4기둥 중 **② 정직 + ③ 거룩함**과 직결.

---

## 💡 영혼 점검 (작업 전 자문)

```
□ Q0 — 내가 그 도시의 한인 이민자라면, 이 사진을 보고 "내 도시구나" 느낄까?
□ Q4 — 이 사진이 그 도시의 진짜 모습인가? (정직)
□ Q5 — 이 첫 인상이 환대인가? (그 도시의 영혼)
□ Q7 — 한국 우월주의 표상 ❌ — 그 도시 본연의 모습?
□ Q9 — 송영을 향하는가? — 자랑이 아닌 환대?
```

---

## 📝 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-05-10 | 1차 fix — 14개 도시 거짓 표상 제거, 도시 색 그라디언트 폴백 |
| (다음 세션) | 도시별 사진/영상 큐레이션 시작 |

---

> 🌿 **다음 세션 시작 시 — 김PD님과 함께 도시별로 검토하며 큐레이션.**
> 자동화 ❌ — 환대는 사람의 마음과 눈으로 검증되는 것이기에.

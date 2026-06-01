# HebronGuide 도시 수 위치 등록부
> 도시 추가 시 이 파일의 모든 위치를 한 번에 업데이트할 것
> 현재 도시 수: **69개** (2026-05-29 기준)
> 다음 업데이트 예정: 70개 (인랜드 엠파이어 추가 시)

---

## 업데이트 방법

도시 수가 바뀔 때마다 아래 명령어 실행 (OLD를 이전 숫자, NEW를 새 숫자로 교체):

```
grep -rn "OLD개\|OLD+" --include="*.html" --include="*.tsx" hebronguide/ | grep -v node_modules | grep -v 99_Archive
```

---

## 도시 수가 하드코딩된 모든 위치

### 📁 hebronguide/public/ (HTML 파일)

| 파일 | 줄 | 내용 |
|------|-----|------|
| `ad-request.html` | ~232 | `<div class="stat-num">69</div>` |
| `ad-request.html` | ~7 | meta description "69개 도시" |
| `about.html` | ~179 | `<span id="cityCountTable">69</span>` |
| `about.html` | ~206 | `const HEBRON_CITY_COUNT = 69` |
| `biz-join.html` | ~9,80 | "69개 도시" (2곳) |
| `church-guide.html` | ~7,11,267,268,733 | "69개+ 도시" (여러 곳) |
| `church-join.html` | ~9 | "69개 도시" |
| `church-partner.html` | ~257,520 | "69개+ 도시" |
| `city-request.html` | ~315 | "69개 도시" |
| `hebron-partner-mobilize.html` | ~519,520 | "69개+ 도시" |
| `ksbc-partner.html` | ~221,224 | "69개+ 도시" |
| `ops-dashboard.html` | ~125 | "69개 도시" |
| `partner-church.html` | ~357 | "69개 도시" |
| `story-submit.html` | ~7,9,153,158 | "69개+ 도시" |
| `philosophy.html` | ~268 | "69개 도시" |
| `story-dallas-01.html` | ~332,333,365 | "69개+ 도시" |
| `story-london-01.html` | ~391 | "69개+ 도시" |
| `story-seattle-01.html` | ~383 | "69개+ 도시" |
| `story-toronto-01.html` | ~381 | "69개+ 도시" |
| `admin.html` | ~1319 | "69개 도시" |

### 📁 hebronguide/src/ (TypeScript/React)

| 파일 | 내용 |
|------|------|
| `HebronGuide.tsx` | "69개 도시" (여러 곳) |

### 📁 docs/ (문서)

| 파일 | 내용 |
|------|------|
| `CITY_EXPANSION_PLAN.md` | 도시 확장 계획 |
| `MARKETING_STRATEGY.md` | "69개 도시" 언급 |

---

## 도시 추가 체크리스트

새 도시를 추가할 때마다:

- [ ] `HebronGuide.tsx` — CitySlug 타입, CITY_CONFIGS, HEBRON_CITIES
- [ ] `build.sh` — CITY_KO, CITY_EN, REGION_MAP, 루프 3곳
- [ ] `vercel.json` — 라우팅 규칙 2줄 추가
- [ ] **이 파일의 모든 위치** — 숫자 +1 업데이트
- [ ] `CITY_COUNT_REGISTRY.md` — 현재 도시 수 업데이트

---

*마지막 업데이트: 2026-05-29 | 69개 도시*

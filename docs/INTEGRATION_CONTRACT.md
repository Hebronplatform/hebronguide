# HebronGuide ↔ NanuriWeb 연계 계약

**Integration Contract — 공개 인터페이스 정본**
작성: 2026-07-03 | 최종 수정: 2026-07-03

> **핵심 원칙: repo는 분리, 인터페이스는 공유(loose coupling).**
> NanuriWeb·HebronGuide는 각각 독립 git repo이자 별도 도메인 배포다. 폴더를 합치지 않는다.
> 연계는 아래 "공개 엔드포인트(계약)"로만 이뤄진다 → 두 팔 분리([[project_revenue_two_arm]]) 유지.
> 정본 배경: [`KOREAN_ASSOCIATION_NETWORK.md`](KOREAN_ASSOCIATION_NETWORK.md), [`REVENUE_STRATEGY.md`](REVENUE_STRATEGY.md)

---

## 왜 분리 유지인가 (합치지 않는 이유)

| 이유 | 설명 |
|---|---|
| repo 중첩 지옥 | HebronGuide 안에 NanuriWeb repo를 넣으면 서브모듈/배포 꼬임 |
| build.sh 충돌 | HebronGuide `build.sh`는 `rm -rf public` 후 도시 페이지 전체 재배포 |
| 두 도메인 = 두 배포 | hebronguide.com / nanuriweb.com — 한 repo에서 두 도메인은 모노레포 리스크 |
| 두 팔 분리 | NanuriWeb=상업 팔(LLC) / HebronGuide=사명 팔 — 별도 배포가 법인·재정·브랜드 분리 지킴 |

> 연계는 폴더 합치기가 아니라 **안정적 공개 계약**으로 한다. 아래 엔드포인트가 그 계약이다.

---

## HebronGuide가 노출하는 공개 엔드포인트 (NanuriWeb가 소비)

### ① 도시 수 — `hebronguide.com/city-count.js` ⭐
- **자동 생성**: `build.sh`가 매 배포마다 실제 도시 수로 생성 (수동 수정 금지)
- **동작**: `window.HG_CITY_COUNT` 설정 + `.hg-city-count`(숫자)·`.hg-city-count-plus`(숫자+) 요소 자동 갱신
- **CORS 불필요**: `<script>`로 로드 (크로스 도메인 안전)
- **사용법 (NanuriWeb 등 외부 사이트):**
  ```html
  <!-- </body> 위 -->
  <script src="https://hebronguide.com/city-count.js"></script>

  <!-- 숫자 표시 요소 -->
  HebronGuide <span class="hg-city-count">72</span>개 도시
  <span class="hg-city-count-plus">72+</span>   <!-- "75+" 로 자동 -->
  ```
  → HebronGuide에 도시 추가 시 NanuriWeb 숫자도 자동 갱신 (다음 방문/새로고침)

### ② 도시 목록 — `hebronguide.com/cities.json`
- **자동 생성**: `build.sh`. 배열 `[{slug,nameKo,nameEn,region}, ...]`
- **주의**: 정적 파일이라 기본 CORS 없음 → 크로스 도메인 `fetch`는 막힐 수 있음. 도시 **수**만 필요하면 ①(city-count.js) 사용. 목록 전체가 필요하면 CORS 헤더 추가 검토(`vercel.json`).

### ③ 도시 페이지 · 신청 폼 (딥링크)
- 도시 페이지: `hebronguide.com/{slug}/` (예: `/federalway/`)
- 도시 신청: `hebronguide.com/city-request.html`
- 사업체·광고 신청: `hebronguide.com/ad-request.html`
- 교회 신청: `hebronguide.com/partner-church.html`
- → NanuriWeb·한인회 사이트에서 이 URL로 링크 (양방향 연결)

---

## NanuriWeb → HebronGuide 방향 (역방향)

- 한인회/사업체 사이트 하단 "글로벌 네트워크"에 `HebronGuide 방문하기` 배너
- (향후) HebronGuide SSO — 회원 인증 연동 Phase 2
- 상세: [`KOREAN_ASSOCIATION_NETWORK.md`](KOREAN_ASSOCIATION_NETWORK.md)

---

## 변경 규칙 (계약이므로)

1. 위 엔드포인트의 **경로·데이터 형식·클래스명**은 계약이다. 바꾸면 NanuriWeb가 깨질 수 있으니 **양쪽 확인 후** 변경.
2. `city-count.js`·`cities.json`은 **자동 생성** — 손으로 고치지 말 것. 도시 추가는 [새 도시 추가 체크리스트](../CLAUDE.md)를 따르면 자동 반영.
3. 새 공개 엔드포인트를 만들면 이 문서에 추가한다.

---

*최종 수정: 2026-07-03*

# City Engine v2 — 도시 확장 파이프라인 런북

> 2026-07-11 구축. Copilot v1(범용 TS+Postgres+CMS 설계)을 HebronGuide 실제 스택으로 재설계.
> 목적: 78 → 500 도시 확장에서 반복 노동(6개 파일 수작업)을 자동화하되,
> **검증·승인·배포라는 사람의 판단은 의도적으로 자동화하지 않는다.**

## 구성 요소

| 파일 | 역할 |
|---|---|
| `supabase_setup_city_pipeline.sql` | `city_drafts`(초안)·`city_pipeline_logs`(로그) 테이블 + RLS. **목사님이 SQL Editor에서 1회 실행** |
| `api/city-draft.js` | AI 초안 생성(action:draft) + 검증 기록(action:verify). 관리자 비번 해시 게이트. **발행 기능 없음** |
| `hebronguide/public/admin-city-drafts.html` | 검증 게이트 UI — 항목·출처 대조 후 "검증 완료"(검증자 실명 기록) |
| `scripts/city-utils.mjs` | UN Geoscheme 분류 코드화(멕시코→중남미 등 실수 차단)·slugify·로그 |
| `scripts/scaffold-city.mjs` | **핵심 자동화** — verified 초안으로 6개 파일 멱등 편집. `--dry` 기본 |
| `scripts/city-pipeline.mjs` | 오케스트레이터(draft/status/scaffold/test). 사람 게이트에서 정지 |

## 운영 순서 (도시 1개 추가)

```
0) 최초 1회: Supabase SQL Editor에서 supabase_setup_city_pipeline.sql 실행
   (Vercel env: SUPABASE_SERVICE_KEY_MAIN·ANTHROPIC_API_KEY — 이미 설정됨)

1) 초안:  hebronguide.com/admin-city-drafts.html → "새 도시 초안 요청"
          (또는 HG_ADMIN_TOKEN=비번 node scripts/city-pipeline.mjs draft --nameKo .. --nameEn .. --country ..)

2) 검증:  [사람 게이트] 그 도시에 살아본 한인이 admin-city-drafts.html에서
          [검증필요]·출처를 공식 자료와 대조 → 검증자 이름 입력 → "검증 완료"

3) 스캐폴딩: node scripts/scaffold-city.mjs <slug> --dry     ← diff 확인
             node scripts/scaffold-city.mjs <slug> --apply   ← 6개 파일 수정 + 빌드 검증
             (lat/lng이 초안에 없으면 --lat --lng 로 제공 — 추측 금지)

4) 배포:  [사람 게이트] 목사님 확인 → git add/commit/push (일요일 제외)
          → Vercel 자동 빌드 → 도시 수·cities.json·지도 핀 자동 반영

테스트: node scripts/city-pipeline.mjs test   (roadmap 1번 도시 전 구간 시뮬레이션, 쓰기 없음)
상태:   node scripts/city-pipeline.mjs status <slug>
```

## 스캐폴딩이 자동 편집하는 6곳 (CLAUDE.md 새 도시 체크리스트)

1. `HebronGuide.tsx` — `type CitySlug` + `CITY_CONFIGS` + `HEBRON_CITIES`(UN 섹션 주석 아래, status:"live")
2. `build.sh` — `CITY_KO`/`CITY_EN`/`REGION_MAP`/`CITY_GEO` + 배포 루프 2곳
3. `index.html` — `#cityRegions` 지역 블록에 `.city-pill` (이모지 금지 원칙 준수)
4. `sitemap.xml` — url 엔트리
5. `roadmap.json` — 예정 도시였으면 제거(라이브 승격)
6. 도시 수 표기 — 손대지 않음(`update-city-count.js`가 빌드 시 자동)

수동으로 남는 것(선택·도시 고유성): `CITY_HERO_SLIDES`(hero 사진 5~6장 — 검수 원칙별도),
교회·TOP5·한인회 앵커 데이터. 이는 "정착자의 눈" 원칙상 사람이 채운다.

## 가드레일 자체 점검 (Stage 9 — 2026-07-11 확인)

- [x] AI 출력이 verified_at 없이 라이브로 갈 경로 없음 — 초안은 city_drafts에만 저장, 사이트는 HEBRON_CITIES만 읽음. scaffold --apply는 status='verified' 강제
- [x] 자동 git push/배포 경로 없음 — scaffold·pipeline 모두 push 미수행, 사람 게이트 문구로 정지
- [x] 파일 수정 스크립트 --dry 기본 + 멱등(존재 시 건너뜀) — 시뮬레이션으로 검증(11건 편집, 파일 변경 0)
- [x] 새 스택 미도입 — Supabase REST + api/*.js + scripts/*.mjs만 사용 (pg·CMS·TS 서비스 없음)
- [x] HEBRON_CITIES = 라이브 도시 SSOT 유지 (city_drafts는 초안일 뿐)
- [x] 서비스 키는 Vercel env에만 — 스크립트·페이지는 anon 키만 사용

## 연계된 기존 자동화 (Stage 8 — 새로 만들지 않음)

- 도시 수 통일: `scripts/update-city-count.js` (build.sh가 배포마다 자동 실행)
- 파트너 승인 승격: 신청 폼 → 마커 → admin 승인 → 협력교회/협력사업체 카드 (2026-07-10 완성)
- DB 수동 변경: `api/db-migrate.js` 선언형 러너 (SQL 복붙 대체)
- 연 1회 정착 데이터 재검증: 매년 2월 스케줄 루틴 (docs/SETTLEMENT_VERIFICATION.md diff)

## 정직 고지 — 의도적으로 자동화하지 않은 3곳

1. Supabase SQL 최초 1회 실행 (테이블 생성 권한)
2. **도시 데이터 검증** — 그 도시에 살아본 한인의 몫. "투명성이 권위" 원칙의 심장
3. **최종 배포 승인** — 목사님의 몫 (일요일 안식 포함)

이 3곳이 HebronGuide의 신뢰를 지키는 지점이므로 자동화 대상이 아니다.

## 참고 — 구축 중 발견 사항

- build.sh의 `REGION_MAP=(`은 `declare -A` 없이 선언되어 있어 bash에서 연관배열로 동작하지
  않을 가능성이 있음(cities.json의 region 값 확인 필요). 스캐폴딩은 기존 형식을 그대로 따르며,
  수정 여부는 별도 검토.

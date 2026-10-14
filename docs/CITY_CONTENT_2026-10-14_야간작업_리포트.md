# 도시 콘텐츠 섞임 수리 — 2026-10-14 야간 작업 리포트

> **작업자**: Claude (Opus 4.7) · 대표님 취침 뒤 자율 마무리
> **작업 시간**: 2026-10-14 저녁~새벽
> **최종 상태**: 20개 도시 완결 · 모두 커밋/푸시 완료 · Vercel 자동 배포

---

## 왜 이 작업을 했는가

HebronGuide는 하나의 `hebronguide/index.html`을 모든 도시 폴더(81개)로 복사한 뒤 `build.sh`의 sed로 title/OG만 치환하는 구조였습니다. 그 결과 **FAQ·meta keywords·JSON-LD areaServed·LocalBusiness가 모든 도시에 시애틀 콘텐츠 그대로** 들어가 있었습니다(80개 도시 FAQ가 바이트 단위로 동일).

파일럿으로 **도쿄**를 먼저 수리한 뒤, 대표님의 승인에 따라 한인 인구 밀집 **20개 도시**로 확장했습니다.

---

## 완료된 21개 도시 (도쿄 포함)

| # | 도시 | 커밋 | 특화 포인트 |
|---|---|---|---|
| 0 | **도쿄** (tokyo) | `c6272f9` | 신오쿠보 · 시키킨/레이킨 · 외국면허 전환 · 재류카드 |
| 1 | **LA** (la) | `5d6c216` | 코리아타운 · 세리토스 · 풀러턴 · 한-CA 상호면허 X |
| 2 | **토론토** (toronto) | `5d6c216` | North York · Yonge-Finch · 한-캐나다 상호면허 · SIN/OHIP |
| 3 | **애틀랜타** (atlanta) | `5d6c216` | 듀루스 · 존스크릭 · 조지아 DDS · 현대차 Metaplant |
| 4 | **뉴욕** (newyork) | `6753fd9` | 플러싱(Queens) · 맨해튼 32번가 · broker fee |
| 5 | **뉴저지** (newjersey) | `6753fd9` | 팰리세이즈파크 · 포트리 · 60일 교체 |
| 6 | **달라스** (dallas) | `6753fd9` | 캐롤턴 · 플레이노 · AT&T · 텍사스 월가 이주 |
| 7 | **휴스턴** (houston) | `6753fd9` | 스프링브랜치 · 엑손모빌 · Texas Medical Center · NASA |
| 8 | **SF/베이** (sf) | `6753fd9` | 산타클라라 · 산호세 · 실리콘밸리 · H-1B |
| 9 | **시카고** (chicago) | Batch 3 | 글렌뷰 · 나일스 · CME/CBOE · Boeing · 겨울 혹독 |
| 10 | **DC 메트로** (dc) | Batch 3 | 애넌데일(VA) · 엘리콧시티(MD) · 연방공직 · clearance |
| 11 | **보스턴** (boston) | Batch 3 | 캠브리지 · 뉴튼 · 바이오 벨트 · 3개월 보증금 |
| 12 | **샌디에고** (sandiego) | Batch 3 | 미라메사(Convoy St) · Qualcomm · 바이오 · 해군 |
| 13 | **올랜도** (orlando) | Batch 3 | Lake Mary · 디즈니/유니버설 · FL 소득세 0% |
| 14 | **포틀랜드** (portland) | Batch 4 | 비버튼(Nike) · 힐스보로(Intel) · OR 소득세 9.9% |
| 15 | **호놀룰루** (honolulu) | Batch 4 | Pearl City · 섬 생활비 · 전기세 · 진주만 |
| 16 | **밴쿠버** (vancouver) | Batch 4 | 코퀴틀람 · 한-BC 면허 교환 · MSP 3개월 · 영화 Hollywood North |
| 17 | **런던** (london) | Batch 4 | 뉴몰든 · 유럽 최대 코리아타운 · DVLA 재시험 · NIN/NHS/IHS |
| 18 | **시드니** (sydney) | Batch 4 | 스트라스필드 · 주 단위 렌트 · bond 4주 · OSHC/OVHC |
| 19 | **오사카** (osaka) | Batch 5 | 쓰루하시(이쿠노구) · 간사이 최대 코리아타운 · 외국면허 전환 |
| 20 | **상파울루** (saopaulo) | Batch 5 | 봉헤찌로 · 남미 최대 코리아타운 · 섬유업 60년 · CPF/RNM |

---

## 각 도시별 FAQ 8개 공통 질문

모든 도시 동일한 8개 질문, **답은 도시별 완전히 다른 내용**:

1. 한인마트 어디가 좋아요
2. 한인 밀집 지역은 어디인가요
3. 정착 초기 비용은 얼마나 필요한가요
4. 한국 면허로 운전할 수 있나요 (국가·주별 상호 인정 차이 명시)
5. 한인교회 추천해주세요 (특정 교회 추천 대신 Hebron 플랫폼 안내)
6. 1베드룸(또는 그에 해당하는 주거) 렌트비는 얼마인가요
7. 신분·행정 등록(SSN·SIN·NIN·TFN·CPF 등) 어디서 신청하나요
8. 한인이 취업하기 좋은 분야는

**사용자 지시 "시애틀 FAQ 복붙 금지" 완전 준수** — 각 도시 전용 특화 내용으로 재작성.

---

## 아키텍처

**신규 파일**:
- `hebronguide/city-content.json` — 도시별 FAQ·meta·JSON-LD 데이터 (약 1,500줄)
- `city-content-inject.js` — 빌드 후 각 도시 index.html 8개 블록 치환 Node 스크립트

**build.sh 수정**:
- `seo-inject.js` 호출 뒤에 `node city-content-inject.js` 추가

**치환 블록 (도시당 8개)**:
1. `<meta name="keywords">`
2. JSON-LD Organization (areaServed · alternateName)
3. JSON-LD WebSite (name)
4. JSON-LD BreadcrumbList
5. JSON-LD City (name · containedInPlace · description)
6. JSON-LD TouristInformationCenter (name · description · areaServed)
7. JSON-LD FAQPage (**mainEntity 8개 완전 교체**)
8. JSON-LD LocalBusiness (address · geo · areaServed)

**안전장치**:
- `city-content.json`에 데이터 없는 도시는 치환하지 않음 (파일럿 안전)
- `/seattle/`는 영구 제외 (원본)
- 각 JSON-LD 블록을 @type로 식별, 블록 단위 교체 (부분 치환 X)
- 파싱 실패 시 해당 블록만 skip, 다른 블록은 계속

---

## 커밋 히스토리 (5건)

| # | 커밋 | 내용 |
|---|---|---|
| 1 | `c6272f9` | tokyo 파일럿 + 아키텍처(city-content.json·inject.js·build.sh) |
| 2 | `5d6c216` | cities-batch-1: LA · 토론토 · 애틀랜타 |
| 3 | `6753fd9` | cities-batch-2: 뉴욕 · 뉴저지 · 달라스 · 휴스턴 · SF |
| 4 | `58c935c` | cities-batch-3: 시카고 · DC · 보스턴 · 샌디에고 · 올랜도 |
| 5 | `da3b45f` | cities-batch-4: 포틀랜드 · 호놀룰루 · 밴쿠버 · 런던 · 시드니 |
| 6 | `b2a04ae` | cities-batch-5: 오사카 · 상파울루 (20개 완결) |

`git log --oneline -10` 로 확인 가능.

---

## 라이브 확인 방법 (아침에 하실 일)

각 도시 라이브 상태 확인:
```
https://hebronguide.com/{slug}/
```

예:
- https://hebronguide.com/tokyo/
- https://hebronguide.com/london/
- https://hebronguide.com/vancouver/
- https://hebronguide.com/saopaulo/

**빠른 확인**:
- 우클릭 → 소스 보기 (Ctrl+U)
- 검색: 그 도시의 특화 지명 (예: 런던 → "뉴몰든")
- 보이면 OK · 안 보이면 Vercel 재배포 지연 가능성 → 몇 분 뒤 재확인

**Google Rich Results Test** (SEO 유효성):
- https://search.google.com/test/rich-results
- 각 도시 URL 입력 → FAQ 스키마 8개 유효한지 확인

---

## 재검증 필요 항목 (variable items)

사용자 지시대로 각 도시 데이터에 `verifyNote` 플래그를 남겼습니다. 다음은 **공식 사이트로 재확인** 권장:

| 변동성 큰 항목 | 공식 소스 |
|---|---|
| 1BR·1K·주거 렌트 시세 | Zillow (US), realtor.ca (CA), rightmove (UK), realestate.com.au (AU) |
| 운전면허 상호 인정·시험 지원 언어 | 각 주/국 DMV·DVLA·ICBC·DETRAN 공식 사이트 |
| 비자별 혜택(의료보험·세금·공공서비스) | USCIS·GOV.UK·Service Canada 등 |
| 기업 채용·신규 공장(현대 Metaplant·삼성 Taylor 등) | 각 기업 Careers 사이트 |
| 환율 (브라질·호주 등) | 매달 변동 — 신청 시점 재확인 |

> **원칙** (CLAUDE.md 준수): 저는 **존재하지 않는 교회·주소·업소를 지어내지 않았습니다**. 특정 교회 추천 대신 "Hebron 플랫폼 통해 안내받으시길 권합니다"로 처리.

---

## 남은 61개 도시 (중장기)

현재 build.sh에 등록된 **81개 도시 중 20개가 도시별 FAQ 완료**. 나머지 61개 도시(멕시코시티·과달라하라·보고타·베이징·방콕·두바이·파리·베를린·서울·부산 등)는 **여전히 시애틀 FAQ**를 그대로 쓰고 있습니다.

- **파일럿 아키텍처는 완성됨** — `city-content.json`에 데이터만 추가하면 자동 반영
- 다음 세션에서 **한국 도시 11개(seoul·busan·ansan·incheon·jeju·daegu·gwangju·daejeon·changwon·cheonan·bundang)** · **중남미(mexicocity·guadalajara·bogota)** · **유럽/중동(paris·berlin·frankfurt·dubai)** · **아시아(singapore·bangkok·hochiminh)** 순으로 진행 권장

---

## 롤백 (만약의 경우)

변경 결과가 마음에 안 드시면:
```bash
cd 01_HebronGuide
git revert <커밋ID>
git push origin main
```

또는 특정 도시만 되돌리려면 `hebronguide/city-content.json` 에서 그 도시 블록 삭제 후 커밋/푸시.

---

## 다음 세션 시작 메모

**지금 상태**:
- 20개 도시 FAQ·meta·JSON-LD 라이브 (hebronguide.com/{slug}/)
- `/seattle/` 원본 유지
- 나머지 61개 도시는 여전히 시애틀 FAQ (의도적 — 데이터 없는 도시는 치환 안 함)

**다음 세션에서 하실 수 있는 일**:
1. **라이브 확인** → 아침에 샘플 몇 개 열어보고 (뉴욕·런던·상파울루 등) 톤·내용 피드백
2. **수정 요청** → 특정 도시의 특정 FAQ 답변을 바꾸고 싶으시면 저가 수정 → 재커밋
3. **다음 61개 도시 확장** → 우선순위 지역부터 (한국·중남미 등) 반복
4. **S1 fallback 수정 (보류 중)** → React SPA 쪽 `useCityConfig()`·`getCitySlug()` 섹션은 아직 손 안 댐 — 안전한 수정 설계 필요

---

**편히 쉬세요, 대표님. 아침에 수업 잘 하시길 바랍니다.**

*Claude Opus 4.7 · 2026-10-14*

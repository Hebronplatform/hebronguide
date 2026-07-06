# 정착 데이터 검증 시스템 (System C) — 정기 재검증 → 차이 리포트 → 승인 반영

> **목적**: 정착 탭의 변동성 데이터(세율·은행·부동산 포털 등)가 시간이 지나며 조용히 낡는 것을 방지.
> **원칙**: 자동 스크래핑→즉시 노출 ❌ (CLAUDE.md "검증 안 된 정보·AI 추측 데이터 금지" 위반).
> 대신 **사람 승인 루프** — 에이전트가 재검증·드리프트 감지·리포트만, 반영은 목사님 승인 후.

## 동작 루프 (4단계)
```
① 예약 에이전트가 정기(분기/연) 실행
② 이 문서의 매니페스트 각 항목을 공식 출처로 웹 재검증
③ 바뀐 것만 "차이 리포트"로 정리 (값 변경·URL 사망·출처 이전)
④ 목사님 승인 → 소스(TSX)/CMS 수정 + verified_at 갱신 + commit
```

## 재검증 에이전트 프롬프트 (매 실행 시 수행)
```
너는 HebronGuide 정착 데이터 검증관이다. docs/SETTLEMENT_VERIFICATION.md의 매니페스트를 읽고:
1. 각 항목의 "현재 값"을 "공식 출처"로 웹 재검증한다 (추측 금지, 공식/1차 출처만).
2. 다음만 리포트한다: (a) 값이 바뀐 항목 (b) URL 404/리다이렉트 (c) 은행·포털 개명·폐쇄.
3. 바뀐 게 없으면 "드리프트 없음"만. 있으면 표로: 항목 | 기존값 | 새값 | 출처 | 권장조치.
4. 코드는 절대 수정하지 않는다. 리포트만 목사님께 제출.
일요일에는 실행하지 않는다 (안식 원칙).
```

---

## 매니페스트 — 부동산 포털 (주택 탭 `getRealtyPortals` @9644)
검증일 2026-07-06. 출처: 각국 SimilarWeb/Semrush 트래픽 순위 + 공식 사이트.

| 국가 | 포털 (URL) | 주장 | 재검증 포인트 |
|---|---|---|---|
| US | zillow.com·redfin.com·realtor.com·loopnet.com·apartments.com | 미국 1위군 | URL 생존 |
| CA | realtor.ca·rentals.ca·kijiji.ca | 1위 MLS | — |
| AU | realestate.com.au·domain.com.au | REA 1위 | — |
| NZ | trademe.co.nz/a/property·realestate.co.nz | 1위 | — |
| JP | suumo.jp·homes.co.jp | SUUMO 1위 | — |
| KR | zigbang.com·dabangapp.com·land.naver.com | 직방 1위 | — |
| MX | inmuebles24.com·vivanuncios.com.mx | 1위 | — |
| UK | rightmove.co.uk·zoopla.co.uk·spareroom.co.uk | Rightmove 1위 | — |
| DE | immobilienscout24.de·immowelt.de·wg-gesucht.de | ImmoScout 1위 | — |
| FR | seloger.com·leboncoin.fr·bienici.com | SeLoger 1위 | — |
| AE | bayut.com·propertyfinder.ae·dubizzle.com | 최대군 | — |
| SG | propertyguru.com.sg·99.co | 최대 | — |
| TH | ddproperty.com·fazwaz.com | 대표 | — |
| VN | batdongsan.com.vn·nhatot.com | 1위 | — |
| BR | zapimoveis.com.br·quintoandar.com.br·vivareal.com.br | 1위 | — |
| CO | metrocuadrado.com·fincaraiz.com.co | 1위 | — |

## 매니페스트 — 재정 세율·은행 (재정 탭)
검증일 2026-07-06. **세율은 매년 변동** → 연 1회 필수 재검증 항목.

### 🇨🇦 캐나다 (`getCanadaFinance`) — 주별
| 주(도시) | 소득세(연방15~33%+주) | 판매세 | 지역은행 | 출처 |
|---|---|---|---|---|
| AB (calgary·edmonton) | 8~15% 누진 | ✅PST없음·GST5%만 | ATB Financial | taxtips.ca/ab, alberta.ca |
| MB (winnipeg) | 10.8~17.4% | GST5+RST7=12% | Simplii/EQ | taxtips.ca/mb, gov.mb.ca |
| ON (ottawa=토론토) | 5.05~13.16% | HST13% | Simplii/EQ | taxtips.ca/on |
| BC (princgeorge=밴쿠버) | 5.06~20.5% | GST5+PST7=12% | VanCity | taxtips.ca/bc |

### 🇺🇸 미국·🇲🇽 멕시코 (financeKo/En 기존 검증분)
US 주별(WA·CA·NY·TX·TN·GA·PA·KS·MO·FL·MA 등) + MX(ISR 1.92~35%·IVA 16%·RFC) — 기존 커밋에서 검증됨. 세율 연 1회 재검증.

## 매니페스트 — 미검증 대기 (재정 나머지 11개국)
🇯🇵 🇰🇷 🇦🇺 🇬🇧 🇩🇪 🇫🇷 🇸🇬 🇹🇭 🇻🇳 🇦🇪 🇧🇷 🇨🇴 🇳🇿 — 배치 진행하며 각 국가 은행·세금 웹검증 후 위 표에 추가.

---
*생성 2026-07-06 · 정본: 이 문서 · 관련 [[project-settlement-audit]]*

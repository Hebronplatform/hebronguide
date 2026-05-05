# HebronGuide 도시 생성 마스터 시스템
**통합 설계 문서 — City Generation + SEO City Guide**  
버전: 2.0 | 제정: 2026-05-05

---

## 트리거 명령

```
"Generate HebronGuide for [City Name]"
```

이 명령 하나로 Claude Code가 5계층 구조 + 완전 SEO 최적화 도시 가이드를 자동 생성·배포한다.

---

## INPUT 변수

```yaml
city_name: "Dallas"
region: "Texas, USA"
country: "United States"
korean_population_level: "High"   # High / Medium / Low
target_keywords:
  - "Dallas Korean community"
  - "Dallas living guide"
  - "달라스 한인 정착"
  - "Dallas newcomer Korean"
related_cities: ["Fort Worth", "Arlington", "Plano", "Carrollton"]
```

---

## 5계층 정보 아키텍처

```
┌─────────────────────────────────────────────────────┐
│ Layer A: 미국 사회 시스템 (전국 공통)                │
│ 행정·의료·교육·법·교통·세금·주거·취업·이민           │
├─────────────────────────────────────────────────────┤
│ Layer B: 도시 시스템 (도시별 생성)                   │
│ 개요·산업·주거시장·교통·치안·생활비·Korea연결성       │
├─────────────────────────────────────────────────────┤
│ Layer C: 한인 커뮤니티 시스템 (도시별)               │
│ 한인구·밀집지·교회·마켓·단체·한인 비즈니스            │
├─────────────────────────────────────────────────────┤
│ Layer D: 타민족 커뮤니티 시스템 (도시별)              │
│ 중국·히스패닉·인도·필리핀·베트남 등                  │
├─────────────────────────────────────────────────────┤
│ Layer E: 지혜로운 생활 전략 (도시별)                 │
│ 생존가이드·30일플랜·가족/유학생/직장인 맞춤전략       │
└─────────────────────────────────────────────────────┘
```

---

## URL 구조 (도시별 자동 생성)

```
/{city}/                     ← 메인 허브 (H1 랜딩)
/{city}/living               ← 생활 필수 정보
/{city}/housing              ← 거주지·렌트
/{city}/transportation       ← 교통·DMV
/{city}/korean-community     ← 한인 커뮤니티 허브
/{city}/korean-grocery       ← 한인 마트·장보기
/{city}/korean-church        ← 한인 교회
/{city}/jobs                 ← 취업·산업
/{city}/checklist            ← 뉴커머 체크리스트
/{city}/compare              ← 주변 도시 비교
```

---

## 페이지 구조 (H1 → H9)

### H1: `{city_name} Guide (2026) — 정착, 생활, 한인 정보 총정리`

#### Section 1: 도시 한눈에 보기 (City Overview)
- 도시 요약 (인구·면적·설립·성격)
- 기후·환경 특징
- 한인 커뮤니티 규모 (korean_population_level 기반)
- 시애틀·전국 대비 생활비 지수
- 한국인에게 이 도시가 특별한 이유

#### Section 2: 추천 거주 지역 (Neighborhoods)
- Top 3 한인 선호 지역 (안전도·교통·렌트)
- 학군 평가 (Niche 기준)
- 가성비 지역 vs 프리미엄 지역
- 한인 밀집 지역 지도 링크

#### Section 3: 생활 필수 정보 (Daily Life Essentials)
- 쇼핑 (Costco·H-Mart·Asian Markets)
- 은행 (한인 추천 은행)
- 통신사 (T-Mobile·AT&T·Mint Mobile)
- 유틸리티 (전기·가스·인터넷)
- 병원·클리닉 (한국어 가능)
- 차량 구매·보험

#### Section 4: 한인 커뮤니티 (Korean Community)
- 한인 마트 위치·정보
- 검증된 한식당 Top 5
- 한인교회 (Tier 시스템)
- 한인 비즈니스·서비스
- Korea Connectivity Score

#### Section 5: 뉴커머 체크리스트 (Newcomer Checklist)
- 첫 1주일 (SIM·임시거주·SSN·은행)
- 첫 1개월 (면허·보험·학교등록·차량)
- 첫 3개월 (신용카드·취업·커뮤니티·교회)

#### Section 6: 교통 & DMV
- 운전면허 취득 절차 (한국어 시험 가능 여부)
- 대중교통 시스템
- 차량 등록

#### Section 7: 취업 & 교육 (Jobs & Education)
- 주요 산업·고용주 Top 10
- 한인이 취업하기 유리한 분야
- 커뮤니티 칼리지·대학
- ESL·평생교육 프로그램
- 취업 팁 (LinkedIn·WorkSource 활용)

#### Section 8: 관광 & 로컬 추천 (Local Life)
- 현지인 추천 스팟
- 자연·공원 (무료)
- 가족 코스
- 한인 커뮤니티 이벤트

#### Section 9: 도시 간 비교 & 주변 도시
- `{city_name}에서 가까운 도시: {related_cities}`
- 각 도시 내부 링크 연결
- 도시 간 비교 표 (렌트·생활비·한인 규모)

#### Section 10: 타민족 커뮤니티 (Other Communities)
- 도시 주요 민족 커뮤니티 (비중 순)
- 한인이 활용할 수 있는 타민족 자원

#### Section 11: 지혜로운 생활 전략 (Wise Living)
- 한인에게 유리한 점 vs 주의할 점
- 30일 정착 플랜
- 대상별 맞춤 전략 (가족·유학생·직장인·시니어)

---

## SEO 요건

### Keyword Clusters (자동 생성)
```
기본 클러스터:
  {city} Korean community
  {city} living guide 2026
  {city} newcomer guide
  달라스 한인 정착 (Korean)
  {city} Korean grocery store
  {city} Korean church
  {city} housing guide
  {city} jobs for Koreans
  {city} transportation guide

Long-tail 키워드:
  "{city} 한인 이민자 정착 가이드"
  "{city} 처음 이사 할 때"
  "{city} 한인 추천 동네"
  "{city} 코리아타운 위치"
```

### On-Page SEO
- H1에 도시명 + 연도 + 핵심 키워드 포함
- 각 섹션 H2/H3에 키워드 자연스럽게 삽입
- 모든 섹션에 도시명 최소 1회 포함
- 내부 링크: 관련 도시 상호 링크
- Alt text: 모든 이미지에 `{city} Korean community` 포함

### Meta Tags
```html
<title>{city} 한인 정착 가이드 (2026) | HebronGuide {city}</title>
<meta name="description" content="{city} 한인 이민자·유학생·이주자를 위한 
정착 완전 가이드. 맛집·교회·거주지·취업·생활비 정보. HebronGuide {city}">
<meta name="keywords" content="{city} 한인, {city} Korean community, 
달라스 정착, {city} living guide">
<link rel="canonical" href="https://hebronguide.com/{city}/">
```

---

## Schema.org JSON-LD (필수 생성)

### 1. City Schema
```json
{
  "@context": "https://schema.org",
  "@type": "City",
  "name": "{city_name}",
  "containedInPlace": {
    "@type": "State",
    "name": "{region}"
  },
  "url": "https://hebronguide.com/{city}/",
  "description": "{city_name} 한인 정착 가이드 — 미국 생활 내비게이션"
}
```

### 2. TouristInformationCenter Schema
```json
{
  "@context": "https://schema.org",
  "@type": "TouristInformationCenter",
  "name": "HebronGuide {city_name}",
  "url": "https://hebronguide.com/{city}/",
  "description": "{city_name} Korean settlement guide for immigrants",
  "availableLanguage": ["Korean", "English"],
  "areaServed": "{city_name}, {region}"
}
```

### 3. FAQPage Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{city_name} 한인마트 어디가 좋아요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{city_name} 한인마트 추천..."
      }
    }
  ]
}
```

### 4. LocalBusiness (Korean Community)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "HebronGuide {city_name} Korean Community",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "{city_name}",
    "addressRegion": "{region}"
  }
}
```

---

## FAQ 섹션 (6-10개 필수)

각 도시별로 자동 생성:
1. "{city} 한인마트 어디가 좋아요?"
2. "{city} 정착 초기 비용은 얼마나 필요한가요?"
3. "{city}에서 차를 사려면 어떻게 해야 하나요?"
4. "{city} 한인교회 추천해주세요"
5. "{city} 렌트비는 어느 정도인가요?"
6. "{city} 한인 밀집 지역은 어디인가요?"
7. "{city}에서 한국어 운전면허 시험을 볼 수 있나요?"
8. "{city}의 한인 커뮤니티 규모는?"
9. "{city} 뉴커머가 첫 달에 해야 할 것은?"
10. "{city}에서 한인이 취업하기 좋은 분야는?"

---

## 생성 워크플로우

```
Step 1: Agent 병렬 리서치
  A. 도시 기본 데이터 (인구·산업·주거)
  B. 한인 커뮤니티 데이터 (마트·교회·단체)
  C. 타민족 커뮤니티 데이터
  D. 와이즈 리빙 전략 수립

Step 2: 데이터 검증 (주소·전화·웹사이트)

Step 3: React 앱 도시 데이터 업데이트
  - TOP5 배열 (맛집·정착·관광)
  - 각 Screen 데이터
  - CITY_META 업데이트

Step 4: SEO 최적화
  - index.html meta 태그 (도시별)
  - Schema.org JSON-LD 삽입
  - sitemap.xml 업데이트

Step 5: 배포
  - git push → Vercel 자동 배포
  - GSC URL Inspection 요청
```

---

## 품질 체크리스트 (모든 도시 공통)

- [ ] H1에 도시명 + 연도 포함
- [ ] Schema.org 4종 JSON-LD 생성
- [ ] FAQ 6개 이상 (한국어/영어)
- [ ] 내부 링크 (관련 도시 연결)
- [ ] sitemap.xml 업데이트
- [ ] 모든 주소 Google Maps 링크
- [ ] 모든 전화번호 tel: 링크
- [ ] ✅ 검증됨 배지 (검증 항목만)
- [ ] 한국어·영어 이중언어 완성
- [ ] Korea Connectivity Score 계산

---

## 도시별 Korea Connectivity Score

```
항목별 점수 (최대 100):
  직항 노선 (30점): 인천 직항 시간·빈도
  한국 기업 (20점): 삼성·현대·LG 지사
  한국 유학생 (15점): 주요 대학 한인 수
  한국 관광객 (15점): 연간 방한 한국인
  산업 교류 (20점): 무역·투자·협력 규모
```

---

*이 문서는 새 도시 생성 시 Claude Code가 따르는 표준 프레임워크다.*  
*업데이트: 두 프롬프트(City Generation System + SEO City Guide) 통합 버전 2.0*

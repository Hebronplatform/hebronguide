# HebronGuide 새 세션 시작 프롬프트
> 이 파일을 새 Claude Code 창에 붙여넣기하면 바로 이어서 작업 가능

---

## 📋 붙여넣기용 프롬프트

```
안녕하세요. HebronGuide 프로젝트를 이어서 진행합니다.

## 프로젝트 개요
- 서비스: HebronGuide (hebronguide.com) — 전 세계 한인 이민자 정착 가이드 PWA
- 운영사: Hebron Platform LLC (대표: 김성수 / Sung Soo Kim)
- 연락처: hebronplatform@gmail.com
- GitHub: https://github.com/Hebronplatform/hebronguide
- 배포: Vercel 자동 배포 (main push → 즉시 라이브)

## 파일 경로
- 프로젝트 루트: C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\
- 메인 앱: hebronguide\src\app\components\HebronGuide.tsx (약 20,000줄)
- 빌드 스크립트: build.sh
- 배포 설정: vercel.json
- 루트 랜딩 페이지: index.html (build.sh가 public/index.html로 복사)
- 프로젝트 규칙: CLAUDE.md (반드시 읽고 시작)

## 현재 상태 (2026-05-17 기준)
- 총 도시 수: 64개 (앱 + 랜딩 페이지 모두 64 표시)
- 최신 commit: 2041241 (창원·천안/아산 추가)

### 추가된 도시 목록
- 🇺🇸 미국 (40개): seattle, dallas, sf, newyork, nashville, boston, la, houston, atlanta, kansascity, philadelphia, miami, orangecounty, chicago, dc, sandiego, honolulu, portland, denver, phoenix, charlotte, raleigh, columbus, minneapolis, tucson, fayetteville, killeen, louisville, anchorage
- 🇨🇦 캐나다 (6개): toronto, vancouver, calgary, edmonton, ottawa, winnipeg
- 🌎 중남미 (4개): mexicocity, guadalajara, monterrey, saopaulo
- 🇦🇺 오세아니아 (5개): sydney, melbourne, brisbane, perth, auckland
- 🇬🇧🇩🇪🇫🇷 유럽 (4개): london, frankfurt, berlin, paris
- 🇦🇪 중동 (1개): dubai
- 🇸🇬🇹🇭🇻🇳 동남아 (3개): singapore, bangkok, hochiminh
- 🇯🇵 일본 (2개): tokyo, osaka
- 🇰🇷 한국 (10개): seoul, busan, ansan, incheon, jeju, daegu, gwangju, daejeon, changwon, cheonan

### 이번 세션에서 완료한 것
1. ✅ 창원(changwon) 추가 — 🌸 진해 벚꽃, 경남 외국인 9만명
   - TOP5 settle·food·explore 각 5개 항목 포함
2. ✅ 천안·아산(cheonan) 추가 — 🏛️ 독립기념관, 충남 외국인 8만명
   - TOP5 settle·food·explore 각 5개 항목 포함
3. ✅ index.html 카운터 62→64, 한국 섹션 pill 2개 추가

## 남은 작업
1. 한국 8개 도시(안산·인천·제주·대구·광주·대전·창원·천안) 히어로 사진 iPad 육안 확인 필요
   - 맞지 않으면 교체 요청 (창원·천안 사진은 이번에 새로 추가됨)
2. 기타 UX 개선 사항

## 핵심 원칙 (CLAUDE.md 요약)
- 생각 먼저, 행동 나중 — 같은 실수 반복 금지
- 3단계 이하 UX 원칙
- 한국어 조사 자동화: 항상 roJosa()/iGaJosa() 등 헬퍼 함수 사용
- 도시 분류: UN Geoscheme 국제 표준 (멕시코=중미, 브라질=남미)
- 배포 흐름: 빌드 → git add → git commit → git push origin main → Vercel 자동 배포

## 빌드/배포 방법
cd C:\Users\ijigu\OneDrive\01_Coding\00_HebronAPP_FE\01_HebronGuide\hebronguide
npm run build
cd ..
git add hebronguide/dist/ [수정된파일]
git commit -m "feat/fix/chore: 설명"
git push origin main

## 새 도시 추가 시 체크리스트
1. HebronGuide.tsx: CitySlug 타입 추가
2. HebronGuide.tsx: CITY_HERO_SLIDES (Unsplash 200 OK 검증 필수)
3. HebronGuide.tsx: CITY_CONFIGS
4. HebronGuide.tsx: HEBRON_CITIES 목록 (UN 섹션 기준)
5. HebronGuide.tsx: DIASPORA_IDENTITY
6. HebronGuide.tsx: TOP5 데이터 (settle, food, explore)
7. HebronGuide.tsx: getCountryCode() 함수
8. HebronGuide.tsx: TOP5 매핑 3곳
9. build.sh: CITY_KO, CITY_EN, for 루프
10. vercel.json: 라우팅 2줄
11. index.html (루트): 도시 목록 + 카운터 업데이트
12. build 후 push

## Supabase 정보
- URL: https://vextxqzggznulwpganwt.supabase.co
- 교회 신청 → community_items 테이블 자동 저장 (status: 'published')
- 이메일: Resend API (RESEND_API_KEY 환경변수)
- 관리자: hebronplatform@gmail.com
```

---

> 이 파일은 `_NEW_SESSION_PROMPT.md` (프로젝트 루트)에 저장됨
> 세션 종료 시 내용을 최신 상태로 업데이트할 것

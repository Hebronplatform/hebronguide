# HebronGuide — Claude Code 인수인계 프롬프트

> **사용법**: 이 파일 전체를 복사 → Claude Code 첫 메시지에 붙여넣기 → Enter
> **작성일**: 2026-04-30
> **상황**: Cursor + Cowork 작업을 Claude Code로 이전, 빠른 시애틀 출시(5월 31일) 우선

---

## 📋 Claude Code에게 — 다음 텍스트 그대로 붙여넣기

```
안녕! 나는 폴 김(시애틀지구촌교회 / MBTS Ph.D. 3년차)이고,
HebronGuide라는 한인 디아스포라 도시 가이드 PWA를 개발 중이다.

오늘(2026-04-30) Cowork(Claude.ai 데스크톱)과 Cursor에서
긴 세션을 진행한 뒤, 빠른 출시를 위해 너(Claude Code)로 작업을
이전한다. 아래 컨텍스트를 모두 읽고 이해해줘.

## 1. 프로젝트 개요
- 사이트: hebronguide.com (Vercel 배포)
- 메인 도시: 시애틀 (hebronguide/ React 앱)
- 다른 도시: dallas, la, sf, toronto, vancouver, nashville, newyork (단일 파일 PWA)
- 비전: 700만 재외 한인을 위한 도시별 정착 가이드 + 미래 슈퍼앱
- 출시 목표: 2026-05-31 시애틀 v0.1 라이브

## 2. 필수 읽을 파일 (이 순서로)

@CLAUDE.md
@Docx/HebronGuide_FE_CodeReview_Report.docx
@Docx/HebronGuide_A안_마이그레이션_체크리스트.docx
@Docx/HebronGuide_Master_Blueprint_v2.1.docx
@Docx/HebronGuide_City_Expansion_Prompt.md
@hebronguide/docs/ADMIN_PASSWORD_ROTATION.md

## 3. 오늘까지 완료된 작업 (이미 커밋되었거나 적용됨)

### Cowork에서 완료
- robots.txt 갱신 (18개 크롤러 명시 허용)
- sitemap.xml 신규 생성 (9개 URL + hreflang)
- llms.txt 신규 생성 (AI 검색 전용)
- 루트 index.html → 8개 도시 허브 페이지로 변환
- hebronguide/index.html → 시애틀 SEO 메타 + Schema.org JSON-LD
- CLAUDE.md 갱신 (React 구조 + 변경 이력 + 보안 섹션)
- hebronguide/.cursorignore 생성 (민감 파일 차단)
- hebronguide/docs/ADMIN_PASSWORD_ROTATION.md 작성
- Docx/prototypes/ 4개 시각 프로토타입 (Apple·Linear·Stripe·Seattle Inside)
- Master Blueprint v1.0, v2.0, v2.1 docx (전략 문서)
- City Expansion Prompt.md (도시 30분 확장 시스템)

### Cursor에서 완료
- src/app/components/AdminPage.tsx 보안 패치
  - line 729: "hebron2025" 평문 노출 제거 + 한국어 메시지 교체
  - line 799 부근: SECURITY 주석 추가
  - 파일 변경: +5 / -3 (Accept된 상태인지 git status로 확인 필요)

## 4. 폴님이 직접 해야 할 일 (Claude Code가 도울 수 없음)

- [ ] Cursor에서 마지막 변경사항 Accept 확인 (Review 화면)
- [ ] git commit + git push (Critical-1 보안 패치 배포)
- [ ] hebronguide.com/admin 접속해서 관리자 비밀번호 회전
  - hebron2025 로그인 → Change Password → 강한 새 비밀번호
  - 절차: hebronguide/docs/ADMIN_PASSWORD_ROTATION.md 참조
- [ ] Google Search Console에 사이트 등록 (5월 1주차)
- [ ] Naver Search Advisor 등록 (5월 1주차)

## 5. 다음 즉시 진행할 작업 (Claude Code가 도울 것)

### Step #3 — A안 base path 마이그레이션 (오늘·내일)
목표: hebronguide.com/seattle/ URL이 정상 작동하게

수정 파일 3개:
1. hebronguide/vite.config.ts
   - defineConfig 최상위에 `base: '/seattle/'` 추가
   - VitePWA manifest의 start_url, scope를 '/seattle/'로
   - icons[].src와 shortcuts[].url 모두 '/seattle/' prefix

2. hebronguide/src/app/routes.tsx
   - createBrowserRouter 두 번째 인자에 `{ basename: '/seattle' }` 추가

3. hebronguide/vercel.json
   - /seattle/(.*) → /seattle/index.html rewrite 추가
   - 깨진 /seattle → /seattle/index.html 라인 정합성 복구
   - 다른 도시 rewrite도 동일 패턴 적용

검증: pnpm dev → http://localhost:5173/seattle/ 접근 확인

### Step #4 — 시애틀 24섹션 데이터 시드 (5월 1-3주차)
목표: 빈 섹션 채우기, 사용자가 실제로 도움 받게

우선순위 8개 섹션 (도착 1주차 + 첫달):
- 공항·교통 (SeaTac 정보)
- 임시 숙소 (Airbnb·한인민박)
- SIM·인터넷 (T-Mobile·Mint)
- 은행 계좌 (BOA·Chase 한인 지점)
- 장기 주거 (한인 부동산)
- 운전면허 (워싱턴주 DOL)
- 의료·보험 (한인 병원 15곳)
- 비자·서류 (SSN·I-94)

데이터 출처:
- hebronguide/src/app/data/defaults.ts (기존 데이터)
- 시애틀지구촌교회 새가족부 (실제 검증)

### Step #5 — 라이브 배포 (5월 4주차)
- 시애틀지구촌교회 주보에 한 줄 공지
- Google·Naver 검색엔진 등록
- 50-100명 베타 사용자 인터뷰 시작

## 6. 중요 제약 사항 (절대 어기지 말 것)

### 보안 (.ai-rules)
- .env, secrets/, *.config.js 등 민감 파일 절대 읽기/수정/제안 금지
- 비밀번호·API 키 평문 출력 금지
- vite.config.ts, vercel.json 같은 config 수정은 폴님 명시적 승인 후만

### 사역적 톤
- 종교색을 표면에 드러내지 말 것 (성경 구절·교회 강조 X)
- 푸터에만 작게 "Operated by Global Mission Church Seattle"
- 5대 원칙 준수: 정착자의 눈 · 도착 첫날부터 · 현지가 검증한다 · 투명성이 권위 · 현지인과 함께

### 다국어 정책
- 영어가 기본 (`<html lang="en">`)
- 한국어가 보조
- 스페인어 옵션
- 한인 + 다민족 이민자 모두 환대

### 디자인
- 라이트 모드 기본 (시스템 다크여도 밝게 시작)
- 라이트/다크/Auto 토글 지원
- 스타일: Apple HIG 영감 (절제·여백·타이포그래피)
- 컴퍼스 로고 (네이비 + 골드 N + 흰색 S/E/W) 항상 사용

## 7. 작업 방식 (폴님이 익숙한 흐름)

- 한 번에 한 단계만 진행
- 각 변경 전에 무엇을 할지 한국어로 설명
- 변경 후 diff 보여주고 폴님 승인 대기
- 막힐 때 "막혔다" 솔직 보고 (지어내지 말 것)
- 모든 진행 상황을 한국어로 보고
- 폴님 시간 부담 (박사논문·주일 설교) 항상 고려

## 8. 첫 작업 요청

위 컨텍스트를 모두 이해했으면, 다음 순서로 진행해줘:

1. git status로 현재 상태 확인 (Cursor가 변경한 게 commit됐는지)
2. Step #3-1: hebronguide/vite.config.ts에 base: '/seattle/' 추가
3. 변경 전후 diff 보여주고 내 승인 대기
4. 승인 후 적용

준비됐으면 "준비 완료, git status 확인 시작합니다" 하고 시작해줘.
```

---

## 💡 사용 팁

### 폴님 워크플로우
1. 위 ``` ``` 블록 안의 텍스트 **전체 복사**
2. Claude Code 새 세션 시작
3. 첫 메시지에 **그대로 붙여넣기** → Enter
4. Claude Code가 모든 컨텍스트 이해하고 작업 시작

### 매 새 세션마다 사용
- Claude Code 세션은 길어지면 컨텍스트 부담
- **매주 월요일 새 세션 시작 시** 이 프롬프트 다시 사용 권장
- 진행 상황은 CLAUDE.md 변경 이력에 자동 누적되니 자연 인수인계

### Cowork(Claude.ai)에서 추가 도움 필요할 때
- 새 docx, 시각 프로토타입, 전략 문서 → Cowork
- 빠른 코드 작업, git, 배포 → Claude Code
- 두 도구 병행이 자연스러워질 때까지 **Claude Code 90% + Cowork 10%** 권장

---

## 📊 오늘 세션 산출물 인덱스 (참고)

폴님 폴더에 저장된 모든 자산:

### Docx (전략·계획 문서)
- HebronGuide_FE_CodeReview_Report.docx
- HebronGuide_A안_마이그레이션_체크리스트.docx
- HebronGuide_검색발견성_마스터플랜.docx
- HebronGuide_Master_Blueprint.docx (v1.0)
- HebronGuide_Master_Blueprint_v2.docx (Super-Platform Edition)
- HebronGuide_Master_Blueprint_v2.1.docx (Funding Revision)
- HebronGuide_City_Expansion_Prompt.md
- HANDOVER_TO_CLAUDE_CODE.md (이 파일)

### prototypes (시각 시안)
- 00_compare.html (3개 스타일 비교)
- 01_apple_style.html (Apple 스타일 Hub) ⭐ 채택
- 02_linear_style.html (Linear 변형)
- 03_stripe_style.html (Stripe 변형)
- 04_seattle_inside.html (24섹션 시애틀 대시보드)

### 코드·설정 (실제 적용됨)
- 루트 index.html (도시 허브 페이지)
- 루트 robots.txt (AI 크롤러 허용)
- 루트 sitemap.xml
- 루트 llms.txt
- hebronguide/index.html (시애틀 SEO 메타)
- hebronguide/.cursorignore
- hebronguide/docs/ADMIN_PASSWORD_ROTATION.md
- CLAUDE.md (갱신: 보안 섹션 + 변경 이력)
- src/app/components/AdminPage.tsx (Cursor가 보안 패치, commit 필요)

---

## 🌱 폴님께 마지막 한 마디

오늘 정말 많이 하셨습니다. 코드 리뷰 → 전략 청사진 v1·v2·v2.1 → 시각 프로토타입 4개 → 보안 패치 → 도시 확장 시스템 → 후원 모델 정립까지.

이 모든 게 **하루 만에** 정리되었어요. 5월 한 달이면 시애틀 v0.1 라이브 충분합니다.

Claude Code로 옮기시는 결정도 사역가의 지혜입니다. **익숙함이 곧 생산성**, 5월 31일 시애틀 출시 → 데이터 보고 → 다음 결정. 단순한 흐름.

박사논문도 잘 진행되시길, 시애틀지구촌교회 사역도 평안하시길. HebronGuide가 700만 한인 디아스포라에게 *"Know your city. Find your people."* 이 되기를 기도합니다. 🙏

— 2026-04-30, Cowork에서 폴님께

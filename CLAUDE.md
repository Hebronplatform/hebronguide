# HebronGuide 프로젝트 규칙 (CLAUDE.md)

Claude Code가 이 프로젝트에서 작업할 때 반드시 따르는 규칙입니다.

---

## ⚡ 성능 — 병렬 처리 원칙

**모든 I/O 작업은 기본적으로 병렬 처리한다.**

### 코드 작성 시
- URL 점검, API 호출, 파일 읽기 등 독립적인 작업은 반드시 병렬로 처리
- Python: `concurrent.futures.ThreadPoolExecutor` 사용 (기본 workers=20)
- JavaScript: `Promise.all()` 또는 `Promise.allSettled()` 사용
- 순차 처리(for loop + sleep)는 의존성이 있는 경우에만 허용

```python
# ✅ 항상 이렇게
from concurrent.futures import ThreadPoolExecutor, as_completed
with ThreadPoolExecutor(max_workers=20) as executor:
    futures = {executor.submit(check_url, url): url for url in urls}
    for future in as_completed(futures):
        result = future.result()

# ❌ 절대 이렇게 하지 않음
for url in urls:
    result = check_url(url)
    time.sleep(0.3)
```

### 타 지역 데이터 조사 시
- 달라스, LA, 뉴욕 등 여러 도시 데이터를 동시에 수집할 때 병렬 처리 필수
- 각 도시별 API/크롤링 요청을 동시에 실행
- 결과는 완료 순서대로 수집, 최종 병합

### Claude Agent 사용 시
- 독립적인 조사 작업은 단일 메시지에 여러 Agent를 동시에 실행
- 순서 의존성이 없으면 절대 순차 실행하지 않음

---

## 🌐 프로젝트 개요

- **사이트**: hebronguide.com (GitHub Pages)
- **주요 파일**: `seattle/index.html` (단일 파일 PWA)
- **배포**: `git push origin main` → GitHub Pages 자동 배포
- **대상**: 시애틀 한인 커뮤니티

## 📁 파일 구조

```
/
├── seattle/
│   ├── index.html      # 메인 PWA (모든 콘텐츠)
│   ├── manifest.json   # PWA 매니페스트
│   ├── sw.js           # 서비스 워커
│   ├── icon-192.png    # 앱 아이콘 (나침반)
│   └── icon-512.png    # 앱 아이콘 (나침반)
├── scripts/
│   └── annual_update.py  # 연간 자동 업데이트 스크립트
└── .github/
    └── workflows/
        └── annual-update.yml  # GitHub Actions (매년 1/1 자동 실행)
```

## 🎨 디자인 규칙

- **테마**: 다크 (#0d1117 배경)
- **포인트 컬러**: 금색 #C9A227, 민트 #6EE7B7
- **링크 div 형식**:
```html
<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);display:flex;flex-wrap:wrap;gap:8px;">
  <a href="URL" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;color:#6EE7B7;font-weight:700;">🔗 라벨</a>
</div>
```

## 📊 데이터 정확성 원칙

- 분명한 지역 데이터는 철저한 현지 조사 기준, 기록 당시 현시가를 기준으로 작성
- 인구 통계: 재외동포청 기준 사용 (U.S. Census는 과소 집계됨)
- 모든 업소 정보에는 반드시 공식 웹사이트 링크 포함
- 링크 없이 텍스트 URL만 있는 항목은 발견 즉시 수정

## 🔄 Git 커밋 규칙

- 커밋 후 반드시 `git push origin main`까지 완료
- 커밋 메시지는 한국어 또는 영어 prefix (feat/fix/perf/chore) 사용

---

## 📖 CLAUDE.md 자동 기록 규칙

**이 프로젝트에서 수정·업데이트·오류 수정이 발생할 때마다 아래 "변경 이력 및 교훈" 섹션에 자동으로 기록한다.**

### 기록 형식
```
### YYYY-MM-DD | [도시] 제목
- **무엇을**: 변경 내용 요약
- **왜**: 변경 이유 또는 발생한 문제
- **교훈**: 타 지역 적용 시 참고할 점 (반면교사)
```

### 기록 기준
- 기능 추가 / 버그 수정 / 데이터 수정 / 성능 개선 → 모두 기록
- 사소한 오타 수정은 생략 가능
- 실수로 인한 수정은 반드시 "교훈" 포함

---

## 📚 변경 이력 및 교훈 (타 지역 반면교사)

### 2026-04-19 | [시애틀] 한인 인구 통계 오류 수정
- **무엇을**: 히어로 섹션 인구 수치 `5만+` → `15만+` 수정
- **왜**: 최초 입력값이 U.S. Census(시민권자·영주권자만 집계) 기준으로 실제보다 3배 과소 집계됨
- **교훈**: 한인 인구는 반드시 **재외동포청** 기준 사용. U.S. Census는 자가신고 시민권자만 포함하므로 유학생·취업비자·주재원 등 제외됨 → 실제 커뮤니티 규모의 50~60%만 반영

### 2026-04-19 | [시애틀] 링크 없는 업소 정보 12건 수정
- **무엇을**: biz-service, biz-finance, food-buffet 섹션에서 텍스트 URL만 있고 클릭 가능한 링크가 없는 항목 12개 수정
- **왜**: 초기 데이터 입력 시 링크 div 형식 누락
- **교훈**: 타 지역 데이터 입력 시 모든 업소에 링크 div 포함 여부를 입력과 동시에 검수. 나중에 일괄 수정하면 공수가 배로 든다

### 2026-04-19 | [시애틀] manifest.json 아이콘 경로 오류
- **무엇을**: PWA 아이콘 경로 `../icon-192.png` → `./icon-192.png` 수정
- **왜**: manifest.json이 `seattle/` 폴더 안에 있는데 상위 폴더(`../`)를 참조해서 PWA 설치 시 아이콘이 표시되지 않음
- **교훈**: manifest.json의 아이콘 경로는 manifest 파일 위치 기준 상대경로. 배포 전 반드시 PWA 설치 테스트로 아이콘 표시 확인

### 2026-04-19 | [시애틀] 연간 자동 업데이트 스크립트 — 순차→병렬 처리 수정
- **무엇을**: URL 점검 코드를 순차(for loop) → 병렬(ThreadPoolExecutor 20 workers)로 변경
- **왜**: 300+개 URL × 12초 타임아웃 = 최대 60분 소요. 배포 전 URL 수를 미리 계산하지 않아 GitHub Actions 실행 후에야 문제 파악
- **교훈**: URL 점검·API 호출 코드 작성 시 **항상 병렬 처리를 기본**으로. 순차 처리는 의존성이 있는 경우만 허용. 데이터 규모(링크 수)를 먼저 계산 후 처리 방식 결정

### 2026-04-19 | [시애틀] 날씨 위젯 — 실시간 시애틀·한국 시계 추가
- **무엇을**: 정적 텍스트 "시애틀 현재" → 실시간 날짜·시간 (시애틀 + 한국 동시 표시, 매초 업데이트)
- **왜**: 사용자가 정확한 현지 시각을 원함
- **교훈**: 타 지역 가이드에도 날씨 위젯에 현지 시각 + 한국 시각 동시 표시 적용. `America/Los_Angeles` → 해당 도시 타임존으로 교체

### 2026-04-19 | [시애틀] 날씨 데이터 10분 자동 갱신 추가
- **무엇을**: 날씨 API 호출을 페이지 로드 1회 → 10분마다 자동 갱신
- **왜**: 페이지를 오래 열어두면 날씨 정보가 오래된 상태로 유지됨
- **교훈**: 실시간성이 중요한 데이터(날씨·환율 등)는 처음부터 주기적 갱신 로직 포함할 것

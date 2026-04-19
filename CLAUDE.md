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

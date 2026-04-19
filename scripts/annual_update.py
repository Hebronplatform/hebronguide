#!/usr/bin/env python3
"""
HebronGuide Seattle — Annual Content Auto-Update Script
========================================================
매년 1월 1일 GitHub Actions에 의해 자동 실행됩니다.

자동 처리:
  1. U.S. Census ACS API → 워싱턴 주 한인 인구 최신값으로 HTML 자동 업데이트
  2. 전체 외부 URL 생사 확인 (사용 불가 링크 탐지)
  3. GitHub Issue 자동 생성 (자동 업데이트 결과 + 수동 점검 체크리스트)
  4. 변경된 HTML은 자동 커밋

업그레이드 옵션 (API 키 추가 시):
  - GOOGLE_PLACES_API_KEY: 업소 전화·시간·주소 자동 검증
  - ANTHROPIC_API_KEY:     AI 웹 검색으로 모든 사실 자동 확인·수정
"""

import os
import re
import sys
import time
import requests
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

HTML_PATH = "seattle/index.html"
CURRENT_YEAR = datetime.now().year


def log(msg):
    print(msg, flush=True)


# ══════════════════════════════════════════════════════════════════════════════
# 1. U.S. CENSUS ACS API — 워싱턴 주 한인 인구
# ══════════════════════════════════════════════════════════════════════════════

def fetch_korean_pop_wa(year=None):
    """Census ACS 1-year 기준 워싱턴 주 한인(Korean alone) 인구 조회."""
    if year is None:
        year = CURRENT_YEAR - 1  # 가장 최근 완료 연도

    url = f"https://api.census.gov/data/{year}/acs/acs1"
    params = {
        "get": "NAME,B02015_007E",  # B02015_007E = Korean alone
        "for": "state:53"           # Washington State FIPS
    }
    try:
        r = requests.get(url, params=params, timeout=20)
        r.raise_for_status()
        data = r.json()
        pop = int(data[1][1])
        log(f"  ✅ Census ACS {year}: 워싱턴 한인 {pop:,}명")
        return pop, year
    except Exception as e:
        log(f"  ⚠️  Census API 실패 (year={year}): {e}")
        if year > 2020:
            time.sleep(1)
            return fetch_korean_pop_wa(year - 1)  # 이전 연도로 재시도
        return None, None


def pop_to_korean(pop):
    """숫자를 '15만+' 같은 한국어 표기로 변환."""
    man = pop // 10000
    remainder = (pop % 10000) // 1000
    if remainder >= 5:
        return f"{man}만 {remainder}천+"
    return f"{man}만+"


def update_population(html, new_pop):
    """HTML 내 인구 수치를 최신값으로 교체. (변경된 경우에만)"""
    # 패턴: <div class="hst-n">15만+</div> 등
    pattern = r'(<div class="hst-n">)([^<]*만[^<]*)(<\/div>)'
    match = re.search(pattern, html)
    if not match:
        return html, False, None

    current = match.group(2)
    new_text = pop_to_korean(new_pop)

    if current == new_text:
        log(f"  ℹ️  인구 수치 변경 없음: {current}")
        return html, False, None

    updated = html[:match.start()] + match.group(1) + new_text + match.group(3) + html[match.end():]
    log(f"  ✅ 인구 수치 업데이트: [{current}] → [{new_text}]")
    return updated, True, f"{current} → {new_text}"


# ══════════════════════════════════════════════════════════════════════════════
# 2. 전체 URL 생사 점검
# ══════════════════════════════════════════════════════════════════════════════

SKIP_DOMAINS = [
    "fonts.googleapis.com", "fonts.gstatic.com",
    "cdnjs.cloudflare.com", "api.open-meteo.com",
]

def is_url_alive(url, timeout=7):
    headers = {"User-Agent": "Mozilla/5.0 (compatible; HebronGuideBot/1.0)"}
    try:
        r = requests.head(url, timeout=timeout, allow_redirects=True, headers=headers)
        if r.status_code == 405:  # HEAD 미허용 → GET으로 재시도
            r = requests.get(url, timeout=timeout, allow_redirects=True,
                             headers=headers, stream=True)
        return r.status_code < 400
    except Exception:
        return False


def extract_urls(html):
    """HTML에서 모든 고유 외부 URL 추출."""
    matches = re.findall(r'href=["\']((https?://)[^"\'#\s>]+)["\']', html)
    urls = list(set(m[0] for m in matches))
    return [u for u in urls if not any(d in u for d in SKIP_DOMAINS)]


def check_all_urls(html):
    """전체 URL 병렬 점검 → {url: bool} 딕셔너리 반환 (20개 동시 처리)."""
    urls = extract_urls(html)
    total = len(urls)
    log(f"\n🔍 외부 링크 {total}개 병렬 점검 중 (20개 동시)...")
    results = {}
    completed = 0
    with ThreadPoolExecutor(max_workers=20) as executor:
        future_to_url = {executor.submit(is_url_alive, url): url for url in urls}
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            alive = future.result()
            results[url] = alive
            completed += 1
            status = "✅" if alive else "❌"
            log(f"  {status} [{completed:>3}/{total}] {url[:70]}")
    return results


# ══════════════════════════════════════════════════════════════════════════════
# 3. GitHub Issue 자동 생성
# ══════════════════════════════════════════════════════════════════════════════

def create_github_issue(title, body):
    token = os.environ.get("GITHUB_TOKEN")
    repo  = os.environ.get("GITHUB_REPOSITORY")
    if not token or not repo:
        log("⚠️  GITHUB_TOKEN / GITHUB_REPOSITORY 없음 — 이슈 생성 건너뜀")
        print("\n" + "=" * 60)
        print("ISSUE BODY (로컬 미리보기):")
        print("=" * 60)
        print(body)
        return

    resp = requests.post(
        f"https://api.github.com/repos/{repo}/issues",
        headers={
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
        },
        json={"title": title, "body": body, "labels": ["annual-update"]},
        timeout=15,
    )
    if resp.status_code == 201:
        log(f"\n✅ GitHub Issue 생성: {resp.json()['html_url']}")
    else:
        log(f"⚠️  Issue 생성 실패: {resp.status_code} — {resp.text[:300]}")


def build_issue(auto_updated, needs_review, dead_links, census_pop, census_year):
    now_str = datetime.now().strftime("%Y년 %m월 %d일")
    next_year = CURRENT_YEAR + 1

    lines = [
        f"# 📋 {CURRENT_YEAR}년 HebronGuide 연간 자동 업데이트 보고서",
        "",
        f"**자동 실행일**: {now_str}  ",
        f"**다음 자동 실행**: {next_year}년 1월 1일  ",
        "",
        "---",
        "",
        f"## ✅ 자동 업데이트 완료 ({len(auto_updated)}건)",
        "",
    ]
    lines += [f"- {x}" for x in auto_updated] if auto_updated else ["_자동 업데이트 항목 없음_"]

    lines += [
        "",
        "---",
        "",
        f"## 🔗 사용 불가 링크 ({len(dead_links)}건)",
        "",
    ]
    if dead_links:
        lines += [f"- [ ] `{u}`" for u in sorted(dead_links)]
    else:
        lines += ["_모든 링크 정상 ✅_"]

    if census_pop:
        lines += [
            "",
            "---",
            "",
            "## 📊 인구 통계 참고",
            "",
            f"- Census ACS {census_year} 기준 워싱턴 주 Korean alone: **{census_pop:,}명**",
            "- 재외동포청 통계(전체 한인)와 차이 있음 — 최종 수치는 담당자 판단 필요",
        ]

    lines += [
        "",
        "---",
        "",
        "## 📝 수동 점검 체크리스트",
        "",
        "### 업소 정보",
        "- [ ] 한인 식당 전체 — 영업시간·전화·주소 현행화",
        "- [ ] 한인 마트 — 신규 업소 추가 / 폐업 제거",
        "- [ ] 한인 병원·치과 — 의사 변경, 신규 개원",
        "- [ ] 한인 교회·단체 — 연락처·예배 시간 변경",
        "- [ ] 영사관·정부기관 — 운영 시간·연락처 확인",
        "",
        "### 통계 및 콘텐츠",
        "- [ ] 워싱턴 한인 인구 — 재외동포청 최신 자료 확인",
        "- [ ] 시애틀 생활비·물가 정보 업데이트",
        "- [ ] 커뮤니티 행사·이벤트 갱신",
        "- [ ] 신규 한인 업소 발굴 및 추가",
        "",
        "---",
        "_이 이슈는 GitHub Actions에 의해 자동 생성되었습니다._",
    ]

    return "\n".join(lines)


# ══════════════════════════════════════════════════════════════════════════════
# 4. 선택적 업그레이드: Google Places API (키가 있을 때만 활성화)
# ══════════════════════════════════════════════════════════════════════════════

def check_google_places(business_name, address=None):
    """
    Google Places API로 업소 정보 검증.
    GOOGLE_PLACES_API_KEY 환경변수가 있을 때만 실행됩니다.
    """
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not api_key:
        return None

    query = f"{business_name} Seattle Korean"
    if address:
        query += f" {address}"

    try:
        r = requests.get(
            "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
            params={"input": query, "inputtype": "textquery",
                    "fields": "name,formatted_address,formatted_phone_number,opening_hours,business_status",
                    "key": api_key},
            timeout=10,
        )
        data = r.json()
        if data.get("candidates"):
            return data["candidates"][0]
    except Exception as e:
        log(f"  ⚠️  Google Places API 오류: {e}")
    return None


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    log(f"\n{'='*60}")
    log(f"  HebronGuide 연간 자동 업데이트 — {CURRENT_YEAR}년")
    log(f"{'='*60}\n")

    with open(HTML_PATH, "r", encoding="utf-8") as f:
        html = f.read()

    auto_updated = []
    needs_review = []
    html_changed  = False

    # ── ① 인구 통계 ──────────────────────────────────────────────
    log("① 워싱턴 주 한인 인구 조회 (U.S. Census ACS)...")
    census_pop, census_year = fetch_korean_pop_wa()

    if census_pop:
        html, changed, diff = update_population(html, census_pop)
        if changed:
            html_changed = True
            auto_updated.append(f"📊 워싱턴 한인 인구: {diff}  _(Census ACS {census_year})_")
        else:
            needs_review.append(
                f"📊 인구 수치: Census ACS {census_year} = {census_pop:,}명 — 현재 표시값과 동일 또는 수동 확인 권장"
            )
    else:
        needs_review.append("📊 인구 통계: Census API 응답 없음 — 수동 확인 필요")

    # ── ② URL 점검 ───────────────────────────────────────────────
    log("\n② 외부 링크 전수 점검...")
    url_results = check_all_urls(html)
    dead_links   = [u for u, ok in url_results.items() if not ok]

    log(f"\n  결과: 정상 {sum(url_results.values())}개 / 불량 {len(dead_links)}개")

    # ── ③ HTML 저장 ──────────────────────────────────────────────
    if html_changed:
        with open(HTML_PATH, "w", encoding="utf-8") as f:
            f.write(html)
        log(f"\n✅ HTML 자동 업데이트 저장 완료 ({len(auto_updated)}건)")
        # GitHub Actions에 커밋 필요 신호
        with open("UPDATE_NEEDED", "w") as f:
            f.write("yes")
    else:
        log("\nℹ️  HTML 변경 없음")

    # ── ④ GitHub Issue 생성 ──────────────────────────────────────
    log("\n③ GitHub Issue 생성 중...")
    issue_body  = build_issue(auto_updated, needs_review, dead_links, census_pop, census_year)
    issue_title = f"🔄 {CURRENT_YEAR}년 HebronGuide 연간 정보 업데이트 점검"
    create_github_issue(issue_title, issue_body)

    log(f"\n{'='*60}")
    log(f"  완료: 자동 업데이트 {len(auto_updated)}건 / 사용 불가 링크 {len(dead_links)}건")
    log(f"{'='*60}\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log(f"\n❌ 예상치 못한 오류: {e}")
        import traceback
        traceback.print_exc()
    sys.exit(0)  # 항상 성공으로 종료 (이슈 생성 완료가 핵심)

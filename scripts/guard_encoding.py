# -*- coding: utf-8 -*-
"""
HebronGuide 한글 인코딩 손상 가드 (git pre-commit에서 실행).

목적: UTF-8 한글이 CP949 등으로 잘못 재저장되어 모지바케/?? 로 깨진 파일이
      커밋·배포되는 것을 차단한다. (2026-06-22 1e0f843 사고 재발 방지)

판정: 스테이징된 .ts/.tsx/.html 파일에서
  1) 알려진 모지바케 조각(異쒕컻 臾대즺 ?쒖븷 ?щ씨 등)이 보이면          → 차단
  2) HebronGuide.tsx 인데 '시애틀'이 사라졌거나 '?' 폭증(>20000)이면      → 차단
통과 시 exit 0, 차단 시 안내 출력 후 exit 1.
"""
import subprocess, sys

MOJIBAKE = ["異쒕컻", "臾대즺", "?쒖븷", "?щ씨", "?щ씮", "?쒓린", "?щ┝"]

def staged_files():
    out = subprocess.run(["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
                         capture_output=True, text=True, encoding="utf-8")
    return [f for f in out.stdout.splitlines()
            if f.endswith((".ts", ".tsx", ".html"))]

def staged_content(path):
    r = subprocess.run(["git", "show", f":{path}"], capture_output=True)
    return r.stdout.decode("utf-8", "replace")

def main():
    problems = []
    for f in staged_files():
        s = staged_content(f)
        hits = [m for m in MOJIBAKE if m in s]
        if hits:
            problems.append(f"  {f}: 모지바케 감지 {hits[:3]}")
        if f.endswith("HebronGuide.tsx"):
            if "시애틀" not in s:
                problems.append(f"  {f}: 정상 한글 '시애틀' 사라짐 (손상 의심)")
            q = s.count("?")
            if q > 20000:
                problems.append(f"  {f}: literal '?' {q}개 (이모지/한글이 ?로 변환된 손상)")
    if problems:
        sys.stderr.write(
            "\n=== ❌ 커밋 차단: 한글 인코딩 손상 감지 ===\n"
            + "\n".join(problems)
            + "\n\n원인: UTF-8 파일을 CP949 등으로 잘못 저장한 편집.\n"
              "복구: git show efaa167:<파일> 로 정상본 복원 후 재커밋.\n"
              "상세: memory/reference_hebronguide_encoding_corruption.md\n"
              "(오탐이라고 확신하면 git commit --no-verify 로 우회 — 권장하지 않음)\n")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())

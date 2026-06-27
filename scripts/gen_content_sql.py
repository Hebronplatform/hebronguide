# -*- coding: utf-8 -*-
"""
HebronGuide 콘텐츠 → Supabase SQL 자동 생성기 (재사용 시스템)

목적: 검증된 콘텐츠(JSON)를 community_items INSERT SQL로 변환.
      Apify 수집/웹 검증 → JSON 작성 → 이 스크립트 → SQL → Supabase 대시보드 붙여넣기.

사용법:
    python scripts/gen_content_sql.py <input.json> [output.sql]

입력 JSON 형식:
{
  "type": "support",                # community_items.type (support/nature/restaurants/churches ...)
  "replace": true,                  # true면 해당 (city_slug,type) 기존 행 DELETE 후 INSERT
  "items": [
    {
      "city_slug": "seattle",
      "emoji": "⚖️",
      "name": "기관 한글명",          # 필수
      "name_en": "Org English Name",
      "title": "선택(없으면 name 사용)",
      "description": "한국어 설명",
      "description_en": "English desc",
      "phone": "(206) 000-0000",
      "website": "example.org",
      "tags": ["법률", "무료"],
      "order": 10
    }
  ]
}

판정/안전:
  - 모든 문자열은 작은따옴표 이스케이프 처리.
  - status는 항상 'approved' (앱이 status=approved만 조회).
  - tags는 jsonb로 직렬화.
  - 컬럼 추가 가드(Step 0) 자동 포함 → 컬럼 없어도 안전.
"""
import sys, json

COLS = ["city_slug","type","emoji","title","name","name_en",
        "description","description_en","phone","website","tags","status","order"]

def q(v):
    """SQL 문자열 리터럴 (None → NULL)."""
    if v is None or v == "":
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"

def qjson(v):
    if not v:
        return "NULL"
    return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"

STEP0 = """-- ── Step 0: 컬럼 가드 (없으면 추가, 있으면 무시) ─────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='type') THEN ALTER TABLE community_items ADD COLUMN type text; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='emoji') THEN ALTER TABLE community_items ADD COLUMN emoji text; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='name_en') THEN ALTER TABLE community_items ADD COLUMN name_en text; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='description_en') THEN ALTER TABLE community_items ADD COLUMN description_en text; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='tags') THEN ALTER TABLE community_items ADD COLUMN tags jsonb; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_items' AND column_name='order') THEN ALTER TABLE community_items ADD COLUMN "order" int DEFAULT 500; END IF;
END $$;
"""

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    inp = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else inp.rsplit(".",1)[0] + ".sql"
    spec = json.load(open(inp, encoding="utf-8"))
    typ = spec["type"]
    items = spec["items"]
    replace = spec.get("replace", True)

    parts = [
        "-- ============================================================",
        f"-- HebronGuide 콘텐츠 INSERT — type='{typ}' ({len(items)}건)",
        "-- 생성: scripts/gen_content_sql.py | 검증된 데이터만 등재",
        "-- 사용: Supabase 대시보드 → SQL Editor → 전체 복사·실행",
        "-- ============================================================",
        STEP0,
    ]

    cities = sorted({it["city_slug"] for it in items})
    if replace:
        parts.append("-- ── Step 1: 기존 동일 (city,type) 정리 ──")
        for c in cities:
            parts.append(f"DELETE FROM community_items WHERE type={q(typ)} AND city_slug={q(c)};")
        parts.append("")

    parts.append("-- ── Step 2: INSERT ──")
    collist = ", ".join(f'"{c}"' if c=="order" else c for c in COLS)
    rows = []
    for it in items:
        vals = [
            q(it["city_slug"]), q(typ), q(it.get("emoji")),
            q(it.get("title") or it.get("name")), q(it.get("name")), q(it.get("name_en")),
            q(it.get("description")), q(it.get("description_en")),
            q(it.get("phone")), q(it.get("website")),
            qjson(it.get("tags")), q("approved"), str(it.get("order", 500)),
        ]
        rows.append("  (" + ", ".join(vals) + ")")
    parts.append(f"INSERT INTO community_items ({collist}) VALUES")
    parts.append(",\n".join(rows) + ";")
    parts.append("")
    parts.append("-- 확인: SELECT city_slug, COUNT(*) FROM community_items "
                 f"WHERE type={q(typ)} GROUP BY city_slug;")

    sql = "\n".join(parts)
    open(out, "w", encoding="utf-8").write(sql)
    print(f"OK → {out}  ({len(items)} rows, cities={cities})")

if __name__ == "__main__":
    main()

#!/bin/bash
# ─────────────────────────────────────────────────
#  update-city-count.sh
#  도시 수 일괄 업데이트 스크립트
#  사용법: bash update-city-count.sh 71 72
# ─────────────────────────────────────────────────

OLD=$1
NEW=$2

if [ -z "$OLD" ] || [ -z "$NEW" ]; then
  echo "사용법: bash update-city-count.sh [이전 수] [새로운 수]"
  echo "예시:   bash update-city-count.sh 71 72"
  exit 1
fi

echo "🔄 도시 수 업데이트: ${OLD} → ${NEW}"
echo ""

# 업데이트 대상 파일 목록
FILES=(
  "index.html"
  "hebronguide/public/ad-request.html"
  "hebronguide/dist/ad-request.html"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # 변경 전 개수 확인
    COUNT=$(grep -c "${OLD}개\|${OLD}+\|>${OLD}<\|\"${OLD}\"" "$FILE" 2>/dev/null || echo 0)

    # 모든 패턴 치환
    sed -i "s/${OLD}개+/${NEW}개+/g" "$FILE"
    sed -i "s/${OLD}개 도시/${NEW}개 도시/g" "$FILE"
    sed -i "s/${OLD}+ Cities/${NEW}+ Cities/g" "$FILE"
    sed -i "s/From ${OLD} Cities/From ${NEW} Cities/g" "$FILE"
    sed -i "s/${OLD}개+ 도시/${NEW}개+ 도시/g" "$FILE"
    sed -i "s/전 세계 ${OLD}개/${NEW}개/g" "$FILE"
    # road-num 숫자 단독 (비전 섹션)
    sed -i "s|<div class=\"road-num\">${OLD}<span|<div class=\"road-num\">${NEW}<span|g" "$FILE"
    # stat-n 숫자
    sed -i "s|<div class=\"stat-n\">${OLD}<sup|<div class=\"stat-n\">${NEW}<sup|g" "$FILE"
    # 전체 개수 (개+ 없는 것)
    sed -i "s|전 세계 ${OLD}개+|전 세계 ${NEW}개+|g" "$FILE"
    sed -i "s|${OLD}개+ 도시|${NEW}개+ 도시|g" "$FILE"

    echo "  ✅ $FILE 업데이트 완료"
  else
    echo "  ⚠️  $FILE 파일 없음 (스킵)"
  fi
done

echo ""
echo "📋 변경 위치 확인 (index.html):"
grep -n "${NEW}개\|${NEW}+" "index.html" | grep -v "rgba\|font\|margin\|padding" || echo "  (없음)"

echo ""
echo "✅ 완료! git push 전 index.html 확인해주세요."

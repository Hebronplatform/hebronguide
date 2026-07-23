/**
 * HebronGuide 전역 설정 — 단일 진실 공급원 (Single Source of Truth)
 *
 * ⚠️ 도시를 추가했으면 이 파일만 수정하세요.
 * 나머지 HTML 페이지는 이 값을 자동으로 읽어옵니다.
 *
 * 수정 후: node scripts/update-city-count.js 실행 → git push
 */
window.HG = window.HG || {};
window.HG.CITY_COUNT = 78;   // ← 도시 추가 시 이 숫자만 바꾸세요

// 페이지 로드 후 .hg-city-count 요소 전체를 자동 업데이트
document.addEventListener('DOMContentLoaded', function () {
  var n = window.HG.CITY_COUNT;
  document.querySelectorAll('.hg-city-count').forEach(function (el) {
    el.textContent = n;
  });
  document.querySelectorAll('.hg-city-count-plus').forEach(function (el) {
    el.textContent = n + '+';
  });
});

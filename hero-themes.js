/* hero-themes.js — 첫 화면 문 옆에 서는 '이 달의 도시'
 *
 * 원칙 (CLAUDE.md "hero 슬라이드 원칙"과 같은 기준)
 *   · 랜드마크는 실제로 그 도시에 있는 것만. 거짓 표상 금지.
 *   · 146px 안에서 알아볼 수 있는 실루엣만. 못 알아보면 넣지 않는다.
 *   · 승인(approved:true)된 도시만 화면에 뜬다. 초안은 미리보기에서만 보인다.
 *   · 문 너머 하늘은 계속 차가운 계열 — 따뜻한 호박빛 히어로와의 대비가 이야기의 뼈대다.
 *
 * 좌표계: viewBox "0 0 460 250", 땅 선 y=216, 도시 영역 x 270~416
 * 새 도시 추가 → /hero-theme-preview.html 에서 눈으로 확인 → 승인 후 approved:true
 */
(function (global) {
  'use strict';

  var THEMES = {
    seattle: {
      ko: '시애틀', en: 'Seattle', approved: true,
      why: '헤브론이 시작된 도시',
      ink: '#0f7a5a',                                   // 도시 선 — 상록수 초록
      far: '#3f86b5',                                   // 먼 배경 — 설산 청회색
      sky: ['#7ec8ef', '#c2e7fa', '#f6fcff'],           // 맑은 하늘
      art:
        '<path d="M278 216 L308 166 L338 216" stroke="{far}" stroke-opacity=".42" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M297 185 L302 179 L307 184 L312 178 L319 185" stroke="{far}" stroke-opacity=".62" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M338 216 V174 H350 V216" stroke="{ink}" stroke-opacity=".75" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M354 216 V158 H364 V216" stroke="{ink}" stroke-opacity=".75" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M368 216 V182 H378 V216" stroke="{ink}" stroke-opacity=".75" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M342 186 h4 M342 197 h4 M357 170 h3 M357 182 h3 M357 194 h3 M371 194 h4 M371 204 h4" stroke="{ink}" stroke-opacity=".58" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="M398 216 V172" stroke="{ink}" stroke-opacity=".85" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M391 216 Q398 192 405 216" stroke="{ink}" stroke-opacity=".5" stroke-width="1.5"/>' +
        '<ellipse cx="398" cy="169" rx="11" ry="3.8" stroke="{ink}" stroke-opacity=".85" stroke-width="2"/>' +
        '<path d="M398 164 V150" stroke="{ink}" stroke-opacity=".85" stroke-width="1.6" stroke-linecap="round"/>',
      marks: ['레이니어 산', '스페이스 니들'],
    },

    newyork: {
      ko: '뉴욕', en: 'New York', approved: true,
      why: '북미 한인이 가장 많이 도착하는 관문',
      ink: '#4054a8',                                   // 도시 선 — 심야의 인디고
      far: '#2f8f7a',                                   // 자유의 여신상 — 청동 녹청
      sky: ['#8ea4e8', '#cfd9f7', '#f6f4ff'],           // 새벽 보랏빛 하늘
      art:
        // 자유의 여신상 — 받침대·옷자락·왕관·횃불
        '<path d="M276 216 V198 H292 V216" stroke="{far}" stroke-opacity=".7" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M280 198 L283 174 L288 174 L292 198" stroke="{far}" stroke-opacity=".85" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<circle cx="285" cy="169" r="3.6" stroke="{far}" stroke-opacity=".85" stroke-width="1.7"/>' +
        '<path d="M281.5 166.5 L280.5 162 M285 165.4 L285 160.5 M288.5 166.5 L289.5 162" stroke="{far}" stroke-opacity=".8" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M288 176 L294 162" stroke="{far}" stroke-opacity=".85" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="M291.5 162 L294 155 L296.5 162 Z" stroke="{far}" stroke-opacity=".9" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M282 178 L276.5 182" stroke="{far}" stroke-opacity=".8" stroke-width="1.7" stroke-linecap="round"/>' +
        // 엠파이어 스테이트 — 계단식 + 첨탑
        '<path d="M306 216 V182 H310 V170 H316 V182 H320 V216" stroke="{ink}" stroke-opacity=".78" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M313 170 V152" stroke="{ink}" stroke-opacity=".78" stroke-width="1.6" stroke-linecap="round"/>' +
        // 크라이슬러 — 부채꼴 왕관 + 첨탑
        '<path d="M330 216 V180 H346 V216" stroke="{ink}" stroke-opacity=".78" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M331 180 L338 162 L345 180" stroke="{ink}" stroke-opacity=".78" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M334.5 172 h7 M336 167 h4" stroke="{ink}" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/>' +
        '<path d="M338 162 V148" stroke="{ink}" stroke-opacity=".78" stroke-width="1.6" stroke-linecap="round"/>' +
        // 블록 두 동
        '<path d="M356 216 V188 H368 V216" stroke="{ink}" stroke-opacity=".68" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M374 216 V176 H386 V216" stroke="{ink}" stroke-opacity=".68" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M360 196 h4 M360 206 h4 M378 186 h4 M378 197 h4 M378 207 h4" stroke="{ink}" stroke-opacity=".5" stroke-width="1.7" stroke-linecap="round"/>',
      marks: ['자유의 여신상', '엠파이어 스테이트', '크라이슬러'],
    },

    toronto: {
      ko: '토론토', en: 'Toronto', approved: true,
      why: '캐나다 한인 사회의 중심',
      ink: '#c0392b',                                   // 도시 선 — 단풍 붉은빛
      far: '#8a6d3b',                                   // 먼 배경 — 가을 갈색
      sky: ['#6fd0c8', '#bdf0ea', '#f2fffd'],           // 청록빛 호수 하늘
      art:
        // 블록 두 동 (왼쪽)
        '<path d="M280 216 V184 H291 V216" stroke="{ink}" stroke-opacity=".68" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M296 216 V194 H306 V216" stroke="{ink}" stroke-opacity=".68" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M284 194 h3 M284 205 h3 M300 204 h3" stroke="{ink}" stroke-opacity=".5" stroke-width="1.7" stroke-linecap="round"/>' +
        // CN 타워 — 좁아지는 몸통 + 전망 포드 + 안테나
        '<path d="M328 216 L332 174 L338 174 L342 216" stroke="{ink}" stroke-opacity=".85" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M326 174 L344 174 L341 165 L329 165 Z" stroke="{ink}" stroke-opacity=".85" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<ellipse cx="335" cy="157" rx="4" ry="2.4" stroke="{ink}" stroke-opacity=".8" stroke-width="1.5"/>' +
        '<path d="M335 154.5 V140" stroke="{ink}" stroke-opacity=".85" stroke-width="1.6" stroke-linecap="round"/>' +
        // 로저스 센터 — 개폐식 돔
        '<path d="M350 216 V204 Q362 190 374 204 V216" stroke="{far}" stroke-opacity=".7" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M353.5 199 Q362 193 370.5 199" stroke="{far}" stroke-opacity=".45" stroke-width="1.3"/>' +
        // 오른쪽 타워
        '<path d="M384 216 V180 H396 V216" stroke="{ink}" stroke-opacity=".68" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<path d="M388 190 h4 M388 201 h4" stroke="{ink}" stroke-opacity=".5" stroke-width="1.7" stroke-linecap="round"/>',
      marks: ['CN 타워', '로저스 센터'],
    },
  };

  // 월(1~12) → 도시. 등재되지 않은 달은 시애틀.
  var SCHEDULE = { 8: 'seattle', 9: 'newyork', 10: 'toronto' };

  function pick(month) {
    var slug = SCHEDULE[month] || 'seattle';
    var t = THEMES[slug];
    return (t && t.approved) ? slug : 'seattle';   // 승인 안 된 건 절대 안 뜬다
  }

  function paint(svg, slug) {
    var t = THEMES[slug];
    if (!svg || !t) return null;

    var city = svg.querySelector('.heb-city');
    if (city) city.innerHTML = t.art.replace(/\{ink\}/g, t.ink).replace(/\{far\}/g, t.far);

    var stops = svg.querySelectorAll('#hebSky stop');
    if (stops.length === 3) {
      for (var i = 0; i < 3; i++) stops[i].setAttribute('stop-color', t.sky[i]);
    }
    return t;
  }

  global.HebronHeroThemes = { THEMES: THEMES, SCHEDULE: SCHEDULE, pick: pick, paint: paint };
})(window);

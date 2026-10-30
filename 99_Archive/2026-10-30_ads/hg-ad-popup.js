/* HebronGuide 광고 홍보 팝업 — 모든 공개 랜딩에 공통 삽입
   (c) Hebron Platform LLC · 2026-10-22
   - 10초 뒤 또는 50% 스크롤 시 등장 (먼저 오는 것)
   - 하단 우측 슬라이드업 토스트 (모바일은 하단 전체)
   - 분광 호박 톤 · 라이트/다크 자동 적응
   - X 닫기 → localStorage 7일 저장
   - 특정 랜딩에서는 자동 비활성 (ad-request·arrive·donate 등) */

(function(){
  'use strict';

  // 1. 비활성 자리 — 광고 자기 자신·도착·후원·관리자
  var SKIP_PATHS = [
    '/ad-request.html',
    '/arrive.html',
    '/donate.html',
    '/admin.html',
    '/admin-churches.html',
    '/admin-community.html',
    '/admin-city-drafts.html',
    '/pastor-dashboard.html'
  ];
  var p = location.pathname;
  if (SKIP_PATHS.indexOf(p) >= 0) return;
  if (p.indexOf('/admin') === 0) return;

  // 2. "7일 안 보기" 체크
  var KEY = 'hg-adpopup-dismissed';
  try {
    var saved = Number(localStorage.getItem(KEY) || 0);
    if (saved && (Date.now() - saved) < 7 * 24 * 60 * 60 * 1000) return;
  } catch(e){}

  // 3. CSS — self-contained
  var css = ''
    + '.hg-ap{position:fixed;right:20px;bottom:20px;z-index:9998;max-width:360px;width:calc(100vw - 40px);'
    + 'background:var(--hg-ap-bg,#161b26);color:var(--hg-ap-text,#ECFDF5);'
    + 'border:1px solid var(--hg-ap-line,rgba(217,160,84,.35));border-radius:16px;'
    + 'box-shadow:0 20px 60px rgba(0,0,0,.4);padding:20px 20px 18px;'
    + 'font-family:"Pretendard Variable","Noto Sans KR",-apple-system,sans-serif;'
    + 'opacity:0;transform:translateY(20px);transition:all .4s cubic-bezier(.4,.2,.2,1);'
    + 'line-height:1.65;word-break:keep-all;}'
    + '.hg-ap.on{opacity:1;transform:translateY(0);}'
    + '.hg-ap.light{--hg-ap-bg:#F2EDE0;--hg-ap-text:#2A2520;--hg-ap-line:rgba(42,37,32,.2);}'
    + '.hg-ap-close{position:absolute;top:10px;right:10px;width:28px;height:28px;border:0;'
    + 'background:transparent;color:var(--hg-ap-text);opacity:.55;cursor:pointer;'
    + 'border-radius:50%;display:flex;align-items:center;justify-content:center;}'
    + '.hg-ap-close:hover{opacity:1;background:rgba(255,255,255,.08);}'
    + '.hg-ap.light .hg-ap-close:hover{background:rgba(42,37,32,.08);}'
    + '.hg-ap-tag{display:inline-block;font-size:.7rem;letter-spacing:2.5px;color:#D9A054;'
    + 'padding:3px 10px;border:1px solid rgba(217,160,84,.4);border-radius:99px;margin-bottom:12px;}'
    + '.hg-ap-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;}'
    + '.hg-ap-lamp{width:34px;height:34px;flex:0 0 auto;border-radius:50%;'
    + 'background:radial-gradient(circle,#F4B59A 0%,#D9A054 55%,transparent 72%);'
    + 'box-shadow:0 0 20px rgba(217,160,84,.5);animation:hgApLamp 3.2s ease-in-out infinite;}'
    + '@keyframes hgApLamp{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(1.1);}}'
    + '.hg-ap h3{font-size:1rem;font-weight:500;margin:0 0 4px;letter-spacing:-.2px;}'
    + '.hg-ap p{font-size:.86rem;margin:0 0 14px;color:var(--hg-ap-text);opacity:.75;line-height:1.6;}'
    + '.hg-ap p b{color:#D9A054;opacity:1;font-weight:600;}'
    + '.hg-ap-btns{display:flex;gap:8px;flex-wrap:wrap;}'
    + '.hg-ap-btns a{flex:1;min-width:120px;text-decoration:none;padding:9px 12px;'
    + 'border-radius:99px;text-align:center;font-size:.84rem;font-weight:500;letter-spacing:.2px;'
    + 'transition:all .2s;}'
    + '.hg-ap-btns .pri{background:#D9A054;color:#0d1117;}'
    + '.hg-ap-btns .pri:hover{background:#F4B59A;}'
    + '.hg-ap-btns .sec{background:transparent;color:var(--hg-ap-text);'
    + 'border:1px solid var(--hg-ap-line);}'
    + '.hg-ap-btns .sec:hover{border-color:#D9A054;color:#D9A054;}'
    + '.hg-ap-foot{margin-top:10px;font-size:.72rem;color:var(--hg-ap-text);opacity:.45;text-align:center;}'
    + '@media(max-width:640px){.hg-ap{right:10px;left:10px;bottom:12px;max-width:none;padding:18px 18px 16px;}}';

  // 4. HTML
  var html = ''
    + '<button class="hg-ap-close" aria-label="닫기">'
    + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">'
    + '<path d="M6 6l12 12M18 6L6 18"/></svg></button>'
    + '<div class="hg-ap-head"><div class="hg-ap-lamp"></div>'
    + '<div><span class="hg-ap-tag">HEBRON ADS</span>'
    + '<h3>이 자리에 작은 등불 하나</h3></div></div>'
    + '<p>가게·사역·행사를 한인에게 알리시겠어요? '
    + '<b>커피 한 잔과 비스켓 값 월 $9.99</b>로 한 달. '
    + '교회·공식 조직은 <b>등재 무료</b>입니다.</p>'
    + '<div class="hg-ap-btns">'
    + '<a href="/ad-request.html?type=ad&utm_source=popup" class="pri">광고 신청 →</a>'
    + '<a href="/ad-request.html?type=list&utm_source=popup" class="sec">등재는 무료 →</a>'
    + '</div>'
    + '<div class="hg-ap-foot">닫으시면 7일 동안 다시 보이지 않습니다</div>';

  // 5. DOM 삽입 + 라이트/다크 감지
  function inject(){
    if (document.getElementById('hgAdPopup')) return;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var pop = document.createElement('div');
    pop.id = 'hgAdPopup';
    pop.className = 'hg-ap';
    pop.setAttribute('role', 'complementary');
    pop.setAttribute('aria-label', 'HebronGuide 광고 안내');
    pop.innerHTML = html;

    // 라이트/다크 감지 — data-mode="night" 또는 다크 bg
    var html_el = document.documentElement;
    var mode = html_el.getAttribute('data-mode');
    var bg = getComputedStyle(document.body).backgroundColor;
    var isLight = (mode !== 'night') && isLightBg(bg);
    if (isLight) pop.classList.add('light');

    document.body.appendChild(pop);
    requestAnimationFrame(function(){ pop.classList.add('on'); });

    pop.querySelector('.hg-ap-close').addEventListener('click', function(){
      pop.classList.remove('on');
      try { localStorage.setItem(KEY, String(Date.now())); } catch(e){}
      setTimeout(function(){ pop.remove(); }, 400);
    });
  }

  function isLightBg(bg){
    var m = /rgba?\(([^)]+)\)/.exec(bg || '');
    if (!m) return false;
    var p = m[1].split(',').map(function(x){ return parseFloat(x.trim()); });
    var lum = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
    return lum > 180;
  }

  // 6. 등장 트리거 — 10초 뒤 OR 50% 스크롤 (먼저 오는 것)
  var triggered = false;
  function trigger(){
    if (triggered) return;
    triggered = true;
    inject();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armTriggers);
  } else {
    armTriggers();
  }

  function armTriggers(){
    setTimeout(trigger, 10000);
    window.addEventListener('scroll', function onScroll(){
      var h = document.documentElement;
      var scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight;
      if (scrolled > 0.5) {
        window.removeEventListener('scroll', onScroll);
        trigger();
      }
    }, { passive: true });
  }
})();

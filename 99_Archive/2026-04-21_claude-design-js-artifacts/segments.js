// HebronGuide — Segment Landing variants (EN-first, bilingual)
// Three approaches to "For Whom" landing:
//  A · Global SaaS   — EN default, KR toggle, segmented product page
//  B · Bilingual Editorial — EN/KR side-by-side, magazine feel
//  C · Split Immersion — first-screen language select, then deep dive

// ─────────────────────────────────────────────────────────────
// Shared: language switcher component
// EN fixed left · multilingual dropdown right (한국어 first)
// ─────────────────────────────────────────────────────────────
function LangSwitch({ lang, setLang, tone = 'light' }) {
  const [open, setOpen] = React.useState(false);
  const langs = [
    { code: 'ko', label: '한국어', en: 'Korean' },
    { code: 'zh', label: '中文', en: 'Chinese' },
    { code: 'es', label: 'Español', en: 'Spanish' },
    { code: 'vi', label: 'Tiếng Việt', en: 'Vietnamese' },
    { code: 'ja', label: '日本語', en: 'Japanese' },
  ];
  const current = langs.find(l => l.code === lang) || langs[0];
  const isEN = lang === 'en';
  const C = tone === 'dark' ? { bg:'rgba(255,255,255,0.08)', text:'#fff', muted:'rgba(255,255,255,0.6)', line:'rgba(255,255,255,0.15)', panel:'#1a1a1a', hover:'rgba(255,255,255,0.12)' }
                            : { bg:'rgba(0,0,0,0.04)', text:'#1a1a1a', muted:'#6a6a6a', line:'#e8e5df', panel:'#ffffff', hover:'rgba(0,0,0,0.05)' };

  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'Inter, -apple-system, sans-serif', fontSize:13 }}>
      <button onClick={() => setLang('en')}
        style={{ padding:'6px 12px', background: isEN ? C.text : 'transparent', color: isEN ? C.panel : C.text, border:'none', borderRadius:6, fontWeight:600, cursor:'pointer', letterSpacing:0.3 }}>
        EN
      </button>
      <span style={{ color: C.line, fontSize:14 }}>·</span>
      <div style={{ position:'relative' }}>
        <button onClick={() => setOpen(o=>!o)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px 6px 12px', background: !isEN ? C.text : 'transparent', color: !isEN ? C.panel : C.text, border:'none', borderRadius:6, fontWeight:600, cursor:'pointer' }}>
          <span>{current.label}</span>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 3.5L4.5 6.5L7.5 3.5"/></svg>
        </button>
        {open && (
          <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background: C.panel, borderRadius:10, boxShadow:'0 10px 40px rgba(0,0,0,0.15)', border:`1px solid ${C.line}`, minWidth:210, zIndex:20, overflow:'hidden' }}>
            <div style={{ padding:'10px 14px 6px', fontSize:10.5, letterSpacing:1.5, color: C.muted, textTransform:'uppercase', fontWeight:600 }}>Multilingual</div>
            {langs.map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', padding:'9px 14px', border:'none', background: lang===l.code?C.hover:'transparent', color:C.text, fontSize:13.5, cursor:'pointer', textAlign:'left' }}>
                <span style={{ fontWeight: lang===l.code?600:400 }}>{l.label}</span>
                <span style={{ fontSize:11, color: C.muted }}>{l.en}</span>
              </button>
            ))}
            <div style={{ borderTop:`1px solid ${C.line}`, padding:'10px 14px', fontSize:12, color: C.muted, cursor:'pointer' }}>
              + Request your language
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Bilingual text helper: returns { en, ko }
const T = {
  seattle: { en:'Seattle', ko:'시애틀' },
  dallas:  { en:'Dallas',  ko:'댈러스' },
  sf:      { en:'SF Bay',  ko:'샌프란시스코' },
  nyc:     { en:'New York', ko:'뉴욕' },
  nash:    { en:'Nashville', ko:'내슈빌' },
};

// ─────────────────────────────────────────────────────────────
// VARIANT A — Global SaaS
// EN default, crisp, product-page feel. 3 segment cards.
// Inspired by the way Linear/Notion handle segment landings.
// ─────────────────────────────────────────────────────────────
function SegmentGlobalSaaS() {
  const [lang, setLang] = React.useState('en');
  const [seg, setSeg] = React.useState('newcomer');
  const [city, setCity] = React.useState('seattle');

  const t = (en, ko) => lang === 'en' ? en : ko;

  const segments = [
    {
      id:'newcomer',
      icon: '○',
      en:{ k:'Newcomer', sub:'For those putting down roots', desc:'Immigration, long-term relocation, starting a life.' },
      ko:{ k:'정착자',   sub:'뿌리내리는 분들을 위해',     desc:'이민 · 장기 이주 · 삶을 새로 시작하는 여정.' },
      stats: [
        { en:'42-step settlement checklist', ko:'42단계 정착 체크리스트' },
        { en:'SSN, housing, license, taxes', ko:'SSN · 주거 · 면허 · 세금' },
        { en:'School zoning · healthcare', ko:'학군 · 의료' },
      ],
    },
    {
      id:'traveler',
      icon:'△',
      en:{ k:'Traveler', sub:'For those passing through', desc:'Tourism, short visits, business trips.' },
      ko:{ k:'여행자',   sub:'잠시 머무는 분들을 위해',   desc:'관광 · 단기 방문 · 출장.' },
      stats: [
        { en:'7-day & 14-day itineraries',  ko:'7일 · 14일 추천 일정' },
        { en:'Korean-friendly restaurants', ko:'한식당 · 추천 먹거리' },
        { en:'Transit, SIM, essentials',    ko:'교통 · 유심 · 필수품' },
      ],
    },
    {
      id:'returner',
      icon:'◇',
      en:{ k:'Returner', sub:'For those coming back', desc:'Re-immigration, visiting family, rooted but distant.' },
      ko:{ k:'재방문자', sub:'돌아오는 분들을 위해',    desc:'역이민 · 가족 방문 · 뿌리 있는 여정.' },
      stats: [
        { en:'Re-entry paperwork',          ko:'재입국 서류' },
        { en:'Reconnect with community',    ko:'커뮤니티 재연결' },
        { en:'Housing after years abroad',  ko:'장기 해외 후 주거' },
      ],
    },
  ];

  const cities = [
    { id:'seattle', ...T.seattle, live:true,  langs:'KR · 中文 · ES · VI' },
    { id:'dallas',  ...T.dallas,  live:false, langs:'KR · ES · 中文 · VI', eta:'Q1 2026' },
    { id:'sf',      ...T.sf,      live:false, langs:'KR · 中文 · ES · HI', eta:'Q2 2026' },
    { id:'nyc',     ...T.nyc,     live:false, langs:'KR · ES · 中文 · RU', eta:'Q3 2026' },
    { id:'nash',    ...T.nash,    live:false, langs:'KR · ES · AR',        eta:'Q4 2026' },
  ];

  const current = segments.find(s => s.id === seg);
  const segData = lang === 'en' ? current.en : current.ko;

  return (
    <div style={sgStyles.root}>
      {/* Nav */}
      <header style={sgStyles.nav}>
        <div style={sgStyles.navInner}>
          <div style={sgStyles.brand}>
            <div style={sgStyles.brandMark}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 18V6l7-3 7 3v12M8 18v-6h6v6" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:'#0f172a', letterSpacing:-0.3 }}>HebronGuide</div>
              <div style={{ fontSize:10.5, color:'#64748b', marginTop:-1, letterSpacing:0.3 }}>Arriving well, wherever you go.</div>
            </div>
          </div>
          <nav style={sgStyles.navLinks}>
            <a style={sgStyles.navLink}>{t('Guides','가이드')}</a>
            <a style={sgStyles.navLink}>{t('Cities','도시')}</a>
            <a style={sgStyles.navLink}>{t('Community','커뮤니티')}</a>
            <a style={sgStyles.navLink}>{t('About','소개')}</a>
          </nav>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <LangSwitch lang={lang} setLang={setLang} tone="light" />
            <button style={sgStyles.primary}>{t('Start free','무료 시작')}</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={sgStyles.hero}>
        <div style={sgStyles.heroInner}>
          <div style={sgStyles.eyebrow}>
            <span style={{ width:6, height:6, borderRadius:3, background:'#10b981', display:'inline-block' }} />
            {t('Seattle live · 4 cities in progress','시애틀 운영 중 · 4개 도시 준비 중')}
          </div>
          <h1 style={sgStyles.h1}>
            {lang==='en' ? (
              <>The guide that meets<br/>you where you are.</>
            ) : (
              <>있는 그 자리에서<br/>당신을 만나는 가이드.</>
            )}
          </h1>
          <p style={sgStyles.dek}>
            {t(
              'Settling in, passing through, or coming home — HebronGuide gives you the people, places, and paperwork you actually need, in the language you think in.',
              '정착이든, 여행이든, 귀향이든 — HebronGuide는 당신이 실제로 필요한 사람 · 장소 · 서류를, 당신이 생각하는 언어로 전해드립니다.'
            )}
          </p>

          {/* Segment tabs */}
          <div style={sgStyles.segTabs}>
            {segments.map(s => (
              <button key={s.id} onClick={() => setSeg(s.id)}
                style={{ ...sgStyles.segTab, ...(seg===s.id ? sgStyles.segTabActive : {}) }}>
                <span style={{ fontSize:18, marginRight:10, opacity:0.7 }}>{s.icon}</span>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{lang==='en'?s.en.k:s.ko.k}</div>
                  <div style={{ fontSize:11.5, color: seg===s.id?'rgba(255,255,255,0.7)':'#64748b', marginTop:2 }}>{lang==='en'?s.en.sub:s.ko.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Segment detail panel */}
          <div style={sgStyles.segPanel}>
            <div style={{ flex:'1 1 300px' }}>
              <div style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#64748b', fontWeight:600, fontFamily:'JetBrains Mono, monospace' }}>
                {t('What you get','포함되는 것')}
              </div>
              <ul style={{ margin:'16px 0 0', padding:0, listStyle:'none' }}>
                {current.stats.map((s, i) => (
                  <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderBottom:i<current.stats.length-1?'1px solid #e2e8f0':'none' }}>
                    <span style={{ color:'#0f172a', fontSize:13, marginTop:2 }}>✓</span>
                    <span style={{ fontSize:14.5, color:'#334155', lineHeight:1.5 }}>{t(s.en, s.ko)}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display:'flex', gap:10, marginTop:24 }}>
                <button style={sgStyles.primary}>{t('Explore →','살펴보기 →')}</button>
                <button style={sgStyles.ghost}>{t('See a sample','샘플 보기')}</button>
              </div>
            </div>
            <div style={sgStyles.previewCard}>
              <div style={{ fontSize:10.5, letterSpacing:1.5, color:'#94a3b8', textTransform:'uppercase', fontFamily:'JetBrains Mono, monospace' }}>
                {t('Live preview','실시간 미리보기')} · {segData.k}
              </div>
              <div style={{ marginTop:16 }}>
                {[
                  { t: t('Apply for SSN','SSN 신청'), s: t('Day 7–14','7–14일차'), done:true },
                  { t: t('Sign lease','임대 계약'),    s: t('Week 2–4','2–4주차'),  done:true },
                  { t: t('WA driver license','WA 운전면허'), s: t('Week 3–6','3–6주차'), done:false },
                  { t: t('Register for healthcare','건강보험 가입'), s: t('Month 2','2개월차'), done:false },
                  { t: t('Enroll children in school','자녀 학교 등록'), s: t('As needed','필요시'), done:false },
                ].map((x,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:i<4?'1px solid #f1f5f9':'none' }}>
                    <div style={{ width:16, height:16, borderRadius:3, border:`1.5px solid ${x.done?'#0f172a':'#cbd5e1'}`, background: x.done?'#0f172a':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {x.done && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7L8 1.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13.5, color:'#0f172a', fontWeight:500, textDecoration: x.done?'line-through':'none', opacity: x.done?0.6:1 }}>{x.t}</div>
                      <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{x.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities row */}
      <section style={sgStyles.cities}>
        <div style={sgStyles.citiesInner}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:22 }}>
            <div>
              <div style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#64748b', fontWeight:600, fontFamily:'JetBrains Mono, monospace' }}>
                {t('Cities','도시')}
              </div>
              <h2 style={{ fontSize:28, fontWeight:600, letterSpacing:-0.5, margin:'6px 0 0', color:'#0f172a' }}>
                {t('One city today. Many, soon.','오늘은 한 도시. 곧, 많은 도시.')}
              </h2>
            </div>
            <a style={{ fontSize:13, color:'#0f172a', cursor:'pointer', fontWeight:500 }}>{t('View roadmap →','로드맵 보기 →')}</a>
          </div>
          <div style={sgStyles.cityGrid}>
            {cities.map(c => (
              <div key={c.id} onClick={() => c.live && setCity(c.id)}
                style={{ ...sgStyles.cityCard, ...(city===c.id && c.live ? sgStyles.cityCardActive : {}), opacity: c.live?1:0.7, cursor: c.live?'pointer':'default' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ fontSize:17, fontWeight:600, color:'#0f172a', letterSpacing:-0.3 }}>
                    {lang==='en' ? c.en : c.ko}
                  </div>
                  {c.live ? (
                    <span style={{ fontSize:10, padding:'2px 6px', background:'#0f172a', color:'#fff', borderRadius:3, fontWeight:600, letterSpacing:0.5 }}>LIVE</span>
                  ) : (
                    <span style={{ fontSize:10, padding:'2px 6px', background:'#f1f5f9', color:'#64748b', borderRadius:3, fontWeight:600, letterSpacing:0.5 }}>{c.eta}</span>
                  )}
                </div>
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:12, fontFamily:'JetBrains Mono, monospace', letterSpacing:0.3 }}>EN · {c.langs}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy band — subtle, non-religious surface */}
      <section style={sgStyles.band}>
        <div style={sgStyles.bandInner}>
          <div style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#94a3b8', fontWeight:600, fontFamily:'JetBrains Mono, monospace' }}>
            {t('Why we exist','왜 만드는가')}
          </div>
          <div style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:32, lineHeight:1.3, color:'#f8fafc', marginTop:18, letterSpacing:-0.5, maxWidth:760, textWrap:'balance' }}>
            {t(
              '“When you arrive somewhere new, someone should already be waiting with the map, the bread, and the right phone number.”',
              '"낯선 곳에 도착할 때, 이미 누군가 지도와 빵과 맞는 전화번호를 들고 기다리고 있어야 합니다."'
            )}
          </div>
          <div style={{ fontSize:13, color:'#94a3b8', marginTop:22, fontStyle:'italic' }}>
            — HebronGuide team
          </div>
        </div>
      </section>

      <footer style={sgStyles.footer}>
        <div style={sgStyles.footerInner}>
          <div style={{ fontSize:13, color:'#64748b' }}>© 2026 HebronGuide · {t('Made by neighbors, for newcomers.','먼저 온 이웃이, 새로 오는 이들을 위해.')}</div>
          <div style={{ display:'flex', gap:24, fontSize:13, color:'#64748b' }}>
            <span>{t('Contribute','기여하기')}</span>
            <span>{t('Privacy','개인정보')}</span>
            <span>{t('Contact','문의')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const sgStyles = {
  root: { fontFamily:'Inter, "Noto Sans KR", -apple-system, sans-serif', background:'#ffffff', color:'#0f172a', minHeight:'100%' },
  nav: { borderBottom:'1px solid #f1f5f9', background:'rgba(255,255,255,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:10 },
  navInner: { maxWidth:1200, margin:'0 auto', padding:'14px 40px', display:'flex', alignItems:'center', gap:32 },
  brand: { display:'flex', alignItems:'center', gap:10 },
  brandMark: { width:36, height:36, borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center' },
  navLinks: { display:'flex', gap:24, flex:1 },
  navLink: { fontSize:13.5, color:'#475569', cursor:'pointer', fontWeight:500 },
  primary: { padding:'8px 16px', background:'#0f172a', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' },
  ghost: { padding:'8px 16px', background:'transparent', color:'#0f172a', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer' },
  hero: { padding:'80px 40px 60px' },
  heroInner: { maxWidth:1200, margin:'0 auto' },
  eyebrow: { display:'inline-flex', alignItems:'center', gap:8, padding:'6px 12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:20, fontSize:12, color:'#475569', fontWeight:500, marginBottom:28 },
  h1: { fontFamily:'Fraunces, Georgia, serif', fontSize:62, fontWeight:400, lineHeight:1.05, letterSpacing:-1.5, margin:0, textWrap:'balance', color:'#0f172a' },
  dek: { fontSize:18, lineHeight:1.6, color:'#475569', marginTop:22, maxWidth:640 },
  segTabs: { display:'flex', gap:10, marginTop:44, flexWrap:'wrap' },
  segTab: { flex:'1 1 220px', display:'flex', alignItems:'center', padding:'16px 18px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, cursor:'pointer', color:'#0f172a', fontFamily:'inherit', transition:'all .15s' },
  segTabActive: { background:'#0f172a', borderColor:'#0f172a', color:'#fff' },
  segPanel: { display:'flex', gap:32, marginTop:24, padding:32, background:'#f8fafc', borderRadius:14, border:'1px solid #f1f5f9', flexWrap:'wrap' },
  previewCard: { flex:'1 1 380px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:22 },
  cities: { padding:'80px 40px', borderTop:'1px solid #f1f5f9' },
  citiesInner: { maxWidth:1200, margin:'0 auto' },
  cityGrid: { display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:12 },
  cityCard: { padding:'18px 18px 22px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, transition:'all .15s' },
  cityCardActive: { background:'#0f172a', borderColor:'#0f172a' },
  band: { background:'#0f172a', padding:'80px 40px' },
  bandInner: { maxWidth:1200, margin:'0 auto' },
  footer: { borderTop:'1px solid #f1f5f9', padding:'32px 40px' },
  footerInner: { maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:20 },
};

window.SegmentGlobalSaaS = SegmentGlobalSaaS;
window.LangSwitch = LangSwitch;

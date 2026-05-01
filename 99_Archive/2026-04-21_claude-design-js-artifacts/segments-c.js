// HebronGuide — Segment Landing · Variant C
// Split Immersion — first-screen language-first landing, then deep immersive segment pick.
// Visual: bold, confident, uses a center-stage approach.
// A user *first* picks their language, then picks their journey, then sees a hyper-localized preview.

function SegmentSplitImmersion() {
  const [lang, setLang] = React.useState('en');
  const [step, setStep] = React.useState(0); // 0=language gate, 1=segment pick, 2=preview
  const [seg, setSeg] = React.useState(null);
  const [city, setCity] = React.useState('seattle');

  const t = (en, ko) => lang === 'en' ? en : ko;

  // Language-gate: shown on load. Large, confident, ONE decision.
  const langOptions = [
    { code:'en', label:'English',  sub:'Global default' },
    { code:'ko', label:'한국어',    sub:'Korean' },
    { code:'zh', label:'中文',      sub:'Chinese' },
    { code:'es', label:'Español',  sub:'Spanish' },
    { code:'vi', label:'Tiếng Việt', sub:'Vietnamese' },
    { code:'ja', label:'日本語',    sub:'Japanese' },
  ];

  const segments = [
    {
      id:'newcomer',
      num:'01',
      accent:'#c2503a',
      en:{ verb:'Settle', k:'I am moving here.', sub:'Immigration · Long-term relocation', body:'A guided, 180-day settlement experience. The right paperwork at the right week, the right school for your zip code, the community that already speaks your language.', samples:['Apply for SSN in week 1','Pick a neighborhood in week 2','Get driver license in month 1','Enroll in healthcare in month 2'] },
      ko:{ verb:'정착', k:'여기 이주해요.', sub:'이민 · 장기 정착', body:'180일 가이드 정착 여정. 주마다 맞는 서류, 우편번호별 맞는 학교, 이미 당신의 언어를 쓰는 커뮤니티까지.', samples:['1주차 SSN 신청','2주차 동네 결정','1개월 내 운전면허','2개월 내 의료보험'] },
    },
    {
      id:'traveler',
      num:'02',
      accent:'#2d6a4f',
      en:{ verb:'Visit', k:'I am just visiting.', sub:'Tourism · Short trips · Business', body:'A curated, day-by-day itinerary. The best neighborhood walk, the coffee that locals line up for, the one detour you will thank us for, the transit pass that is worth it.', samples:['Day 1: Pike Place + ferry','Day 2: Capitol Hill walk','Day 3: Bainbridge escape','Essentials: SIM, transit, USD'] },
      ko:{ verb:'방문', k:'잠시 들러요.', sub:'관광 · 단기 여행 · 출장', body:'엄선된 일별 일정. 현지인이 걷는 동네길, 현지인이 줄 서는 커피, 당신이 고마워할 한 번의 우회, 가치 있는 교통 패스.', samples:['1일차: Pike Place + 페리','2일차: Capitol Hill 산책','3일차: Bainbridge','필수: 유심·교통·USD'] },
    },
    {
      id:'returner',
      num:'03',
      accent:'#8b5cf6',
      en:{ verb:'Return', k:'I am coming back.', sub:'Re-immigration · Family · Roots', body:'A gentle re-entry. What has changed in your absence, what has stayed, which paperwork lapses, which relationships take repair, what to bring from the other side.', samples:['Re-entry paperwork','Update tax residency','Find old neighborhoods','Reconnect with church/community'] },
      ko:{ verb:'귀향', k:'다시 돌아와요.', sub:'역이민 · 가족 · 뿌리', body:'부드러운 재입국. 부재 동안 변한 것, 남은 것, 만료된 서류, 회복이 필요한 관계, 그쪽에서 가져올 것.', samples:['재입국 서류','세금 거주지 변경','옛 동네 찾기','교회·커뮤니티 재연결'] },
    },
  ];

  // ═════ Step 0: Language gate ═════
  if (step === 0) {
    return (
      <div style={siStyles.gateRoot}>
        <div style={siStyles.gateBg}>
          <svg width="100%" height="100%" viewBox="0 0 1280 900" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="gateGrad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#2a3545" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#0a0f18" stopOpacity="1"/>
              </radialGradient>
            </defs>
            <rect width="1280" height="900" fill="url(#gateGrad)"/>
            {[...Array(60)].map((_, i) => {
              const x = (i * 97) % 1280;
              const y = (i * 53) % 900;
              const r = 0.8 + (i % 4) * 0.4;
              return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.1 + (i%3)*0.15}/>;
            })}
          </svg>
        </div>

        <div style={siStyles.gateContent}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:52, color:'#fff', letterSpacing:-1.2, fontWeight:400 }}>
              Hebron<span style={{ fontStyle:'italic', fontWeight:300 }}>Guide</span>
            </div>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'rgba(255,255,255,0.6)', letterSpacing:2.5, textTransform:'uppercase', marginTop:14 }}>
              Arrive well, wherever you go.
            </div>
          </div>

          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:14, color:'rgba(255,255,255,0.7)', letterSpacing:0.5 }}>
              Pick a language. <span style={{ color:'rgba(255,255,255,0.4)' }}>· 언어를 선택하세요 · Elige un idioma · 选择语言</span>
            </div>
          </div>

          <div style={siStyles.langGrid}>
            {langOptions.map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); setStep(1); }}
                style={siStyles.langCard}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                <div style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:30, color:'#fff', fontWeight:400, letterSpacing:-0.5 }}>{l.label}</div>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10.5, color:'rgba(255,255,255,0.5)', letterSpacing:1.5, textTransform:'uppercase', marginTop:6 }}>{l.sub}</div>
              </button>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:40 }}>
            <button style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', fontFamily:'Inter, sans-serif', letterSpacing:0.3 }}>
              + Request another language
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═════ Step 1: Segment pick ═════
  if (step === 1) {
    return (
      <div style={siStyles.segRoot}>
        {/* Top bar */}
        <header style={siStyles.segHeader}>
          <div style={siStyles.segHeaderInner}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontFamily:'Fraunces, serif', fontSize:22, color:'#fff', letterSpacing:-0.3 }}>
                Hebron<span style={{ fontStyle:'italic', fontWeight:300 }}>Guide</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <button onClick={() => setStep(0)} style={siStyles.headerGhost}>← {t('Change language','언어 변경')}</button>
              <LangSwitch lang={lang} setLang={setLang} tone="dark" />
            </div>
          </div>
        </header>

        <section style={siStyles.segHero}>
          <div style={{ textAlign:'center', maxWidth:780, margin:'0 auto', padding:'40px 40px 60px' }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:3, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', marginBottom:28 }}>
              Step 1 of 2 · {t('Pick your journey','여정을 선택하세요')}
            </div>
            <h1 style={{ fontFamily:'Fraunces, serif', fontSize:72, color:'#fff', fontWeight:400, letterSpacing:-1.8, lineHeight:1.05, margin:0, textWrap:'balance' }}>
              {t('Why are you coming?','어떻게 오세요?')}
            </h1>
            <p style={{ fontSize:17, color:'rgba(255,255,255,0.65)', marginTop:20, lineHeight:1.6 }}>
              {t('Three different journeys. Three different guides. Pick the one that fits.','세 가지 다른 여정. 세 가지 다른 가이드. 당신에게 맞는 것을 고르세요.')}
            </p>
          </div>
        </section>

        <section style={siStyles.segCards}>
          {segments.map((s, i) => {
            const data = lang==='en' ? s.en : s.ko;
            return (
              <button key={s.id} onClick={() => { setSeg(s.id); setStep(2); }}
                style={{ ...siStyles.segCard, '--accent': s.accent }}
                onMouseEnter={e => { e.currentTarget.style.background = s.accent; e.currentTarget.style.transform='translateY(-6px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform='translateY(0)'; }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13, letterSpacing:2, color:'rgba(255,255,255,0.5)' }}>{s.num}</div>
                  <div style={{ fontSize:20, color:'rgba(255,255,255,0.5)' }}>→</div>
                </div>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2, color: s.accent, textTransform:'uppercase', marginTop:40, fontWeight:600 }}>
                  {data.verb}
                </div>
                <div style={{ fontFamily:'Fraunces, serif', fontSize:38, color:'#fff', fontWeight:400, letterSpacing:-0.8, marginTop:10, lineHeight:1.1, textWrap:'balance' }}>
                  {data.k}
                </div>
                <div style={{ fontFamily:'Inter, sans-serif', fontSize:12.5, color:'rgba(255,255,255,0.5)', letterSpacing:0.5, marginTop:14, textTransform:'uppercase' }}>
                  {data.sub}
                </div>
                <div style={{ flex:1 }}/>
                <div style={{ fontSize:14.5, color:'rgba(255,255,255,0.75)', marginTop:36, lineHeight:1.6, maxHeight:120, overflow:'hidden' }}>
                  {data.body}
                </div>
              </button>
            );
          })}
        </section>

        <div style={{ textAlign:'center', padding:'60px 40px 100px' }}>
          <div style={{ fontFamily:'"Noto Serif KR", Fraunces, serif', fontSize:18, color:'rgba(255,255,255,0.4)', fontStyle:'italic', maxWidth:560, margin:'0 auto', lineHeight:1.5 }}>
            {t('“A city becomes home when someone is already there, waiting.”','"누군가 이미 기다리고 있을 때, 도시는 집이 됩니다."')}
          </div>
        </div>
      </div>
    );
  }

  // ═════ Step 2: Preview ═════
  const chosen = segments.find(s => s.id === seg);
  const cData = lang==='en' ? chosen.en : chosen.ko;
  return (
    <div style={{ ...siStyles.segRoot }}>
      <header style={siStyles.segHeader}>
        <div style={siStyles.segHeaderInner}>
          <div style={{ fontFamily:'Fraunces, serif', fontSize:22, color:'#fff', letterSpacing:-0.3 }}>
            Hebron<span style={{ fontStyle:'italic', fontWeight:300 }}>Guide</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <button onClick={() => setStep(1)} style={siStyles.headerGhost}>← {t('Back','뒤로')}</button>
            <LangSwitch lang={lang} setLang={setLang} tone="dark" />
          </div>
        </div>
      </header>

      <section style={{ padding:'60px 40px 80px', maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:30 }}>
          <div style={{ padding:'6px 14px', background: chosen.accent, color:'#fff', fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:1.5, fontWeight:700, borderRadius:4 }}>
            {cData.verb.toUpperCase()}
          </div>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2, color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>
            Seattle · {cData.sub}
          </div>
        </div>
        <h1 style={{ fontFamily:'Fraunces, serif', fontSize:64, color:'#fff', fontWeight:400, letterSpacing:-1.4, lineHeight:1.08, margin:0, maxWidth:900 }}>
          {cData.k}
        </h1>
        <p style={{ fontSize:18, color:'rgba(255,255,255,0.7)', lineHeight:1.6, marginTop:24, maxWidth:680 }}>
          {cData.body}
        </p>

        <div style={{ marginTop:60, display:'grid', gridTemplateColumns:'1fr 1fr', gap:28 }}>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:28 }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', marginBottom:18 }}>
              {t('What is inside','안에 들어있는 것')}
            </div>
            {cData.samples.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:i<3?'1px solid rgba(255,255,255,0.06)':'none' }}>
                <div style={{ width:28, height:28, borderRadius:14, background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono, monospace', fontSize:11, color: chosen.accent, fontWeight:700 }}>
                  {String(i+1).padStart(2,'0')}
                </div>
                <div style={{ fontSize:15, color:'rgba(255,255,255,0.9)' }}>{s}</div>
              </div>
            ))}
          </div>

          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:28 }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', marginBottom:18 }}>
              {t('Your city','당신의 도시')}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { id:'seattle', en:'Seattle', ko:'시애틀', live:true },
                { id:'dallas',  en:'Dallas',  ko:'댈러스', live:false, eta:'Q1 2026' },
                { id:'sf',      en:'SF Bay',  ko:'샌프란시스코', live:false, eta:'Q2 2026' },
                { id:'nyc',     en:'New York',ko:'뉴욕', live:false, eta:'Q3 2026' },
                { id:'nash',    en:'Nashville',ko:'내슈빌', live:false, eta:'Q4 2026' },
              ].map(c => (
                <button key={c.id} onClick={() => c.live && setCity(c.id)}
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background: city===c.id && c.live ? 'rgba(255,255,255,0.1)' : 'transparent', border:'1px solid ' + (city===c.id && c.live ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.06)'), borderRadius:8, color:'#fff', cursor: c.live?'pointer':'default', fontFamily:'inherit', opacity: c.live?1:0.5 }}>
                  <span style={{ fontSize:14, fontWeight:500 }}>{lang==='en'?c.en:c.ko}</span>
                  {c.live
                    ? <span style={{ fontSize:10, color: chosen.accent, letterSpacing:0.5, fontWeight:600 }}>● LIVE</span>
                    : <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:0.5 }}>{c.eta}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop:60, textAlign:'center' }}>
          <button style={{ padding:'18px 40px', background:'#fff', color:'#0a0f18', border:'none', borderRadius:40, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', letterSpacing:0.2 }}>
            {t('Start my journey →','내 여정 시작하기 →')}
          </button>
          <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.4)', marginTop:14 }}>
            {t('Free · No credit card · Exit anytime','무료 · 카드 불필요 · 언제든 나가기')}
          </div>
        </div>
      </section>
    </div>
  );
}

const siStyles = {
  // Language gate
  gateRoot: { position:'relative', width:'100%', height:'100%', minHeight:900, background:'#0a0f18', overflow:'hidden', fontFamily:'Inter, "Noto Sans KR", sans-serif' },
  gateBg: { position:'absolute', inset:0, zIndex:0 },
  gateContent: { position:'relative', zIndex:1, padding:'90px 40px', maxWidth:860, margin:'0 auto' },
  langGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 },
  langCard: { padding:'28px 24px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all .2s' },

  // Segment pick
  segRoot: { background:'#0a0f18', color:'#fff', minHeight:'100%', fontFamily:'Inter, "Noto Sans KR", sans-serif' },
  segHeader: { borderBottom:'1px solid rgba(255,255,255,0.06)' },
  segHeaderInner: { maxWidth:1200, margin:'0 auto', padding:'18px 40px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  headerGhost: { background:'transparent', color:'rgba(255,255,255,0.6)', border:'none', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:500 },
  segHero: { borderBottom:'1px solid rgba(255,255,255,0.06)' },
  segCards: { maxWidth:1200, margin:'0 auto', padding:'0 40px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:20 },
  segCard: { display:'flex', flexDirection:'column', minHeight:380, padding:'30px 28px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:18, cursor:'pointer', color:'#fff', fontFamily:'inherit', textAlign:'left', transition:'all .25s cubic-bezier(.2,.7,.3,1)' },
};

window.SegmentSplitImmersion = SegmentSplitImmersion;

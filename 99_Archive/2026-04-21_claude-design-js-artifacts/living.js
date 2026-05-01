// HebronGuide — Living Landing v1 · Seattle · April 21, 2026
// "A guide that breathes with the world."
//
// Three layers:
//   1. Ambient — today's weather, exchange rate, SSN wait, cherry blossom status
//   2. Community — what's happening this week, fresh neighbor notes
//   3. AI Concierge — window.claude.complete conversational panel
//
// Visual atmosphere tuned to April-in-Seattle: overcast→clearing light,
// cherry-blossom accents (#f2c9d3, #e8a5b7), rain drizzle, cool mossy greens.

function LivingLanding() {
  const [lang, setLang] = React.useState('en');
  const [segment, setSegment] = React.useState('newcomer'); // newcomer | traveler | returner
  const [weather, setWeather] = React.useState('drizzle'); // drizzle | clear | overcast
  const [query, setQuery] = React.useState('');
  const [aiMessages, setAiMessages] = React.useState([]);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [now, setNow] = React.useState(new Date('2026-04-21T09:42:00-07:00'));
  const [checklistState, setChecklistState] = React.useState({});

  const t = (en, ko) => lang === 'en' ? en : ko;

  // Tick the live clock every 30s for realism (mocked to April 21 2026)
  React.useEffect(() => {
    const id = setInterval(() => {
      setNow(n => new Date(n.getTime() + 30000));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // ═════ Ambient data · mocked but realistic for today ═════
  const today = {
    date: now,
    weather: {
      drizzle:  { icon:'drizzle',  label_en:'Light drizzle, 54°F',    label_ko:'가는 비 · 12°C', mood_en:'Cool, wet, Seattle-classic', mood_ko:'시원하고 촉촉한, 시애틀다운 하루' },
      overcast: { icon:'overcast', label_en:'Overcast, 56°F',          label_ko:'흐림 · 13°C',   mood_en:'Soft gray, low-light',       mood_ko:'부드러운 회색빛, 차분한 조도' },
      clear:    { icon:'clear',    label_en:'Clearing to sun, 62°F',  label_ko:'맑게 갬 · 17°C', mood_en:'Rare spring sun — go outside', mood_ko:'드문 봄볕 — 지금 나가세요' },
    }[weather],
    fx:   { pair:'KRW/USD', rate:1342, delta:+2.1, deltaLabel_en:'+2.1% vs 30d ago', deltaLabel_ko:'30일 전 대비 +2.1%' },
    rent: { area:'Queen Anne', median:2840, delta:-1.2, deltaLabel_en:'-1.2% vs last month', deltaLabel_ko:'전월 대비 -1.2%' },
    ssn:  { wait:11, normal:7, status_en:'11 days · above normal',      status_ko:'11일 · 평소보다 김' },
    consular: { wait:8, status_en:'8 days', status_ko:'8일' },
    bloom: { stage:'peak', park:'UW Quad', ends:'Apr 26',
             status_en:'Cherry blossoms at peak · ends ~Apr 26',
             status_ko:'벚꽃 만개 · ~4월 26일까지' },
    flight: { route:'ICN → SEA', low:847, trend:'falling',
              status_en:'avg $847 · trending down into June',
              status_ko:'평균 $847 · 6월까지 하락세' },
  };

  // ═════ Segment-aware "today's opening" ═════
  const todaysOpening = {
    newcomer: {
      en: ['If your flight lands this week', 'Three things that matter right now'],
      ko: ['이번 주 도착 예정이라면', '지금 바로 챙겨야 할 세 가지'],
      items: [
        { en:'SSN appointments are running 11 days — book before landing.', ko:'SSN 예약 대기 11일 — 도착 전 예약 필수.' },
        { en:'Queen Anne rents softened 1.2% — leverage for negotiation.', ko:'Queen Anne 월세 1.2% 하락 — 협상 여지 있음.' },
        { en:'KRW/USD at 1,342: time winning transfers from Korean accounts.', ko:'환율 1,342원: 한국 계좌 송금 타이밍 유리.' },
      ],
    },
    traveler: {
      en: ['This week in Seattle', 'What you would regret missing'],
      ko: ['이번 주 시애틀', '놓치면 후회할 것들'],
      items: [
        { en:'Cherry blossoms peak at UW Quad — ends ~Apr 26.', ko:'UW Quad 벚꽃 만개 — 4월 26일경 종료.' },
        { en:'Rain pattern: mornings wet, afternoons clearing. Plan accordingly.', ko:'날씨: 오전 비, 오후 갬. 일정 조정 필요.' },
        { en:'Ferry-walk day: Bainbridge → Pike Place (4–5 hours, ~$9 RT).', ko:'페리 산책: Bainbridge → Pike Place (4–5시간, 왕복 $9).' },
      ],
    },
    returner: {
      en: ['What has changed while you were away', 'April 2026 edition'],
      ko: ['당신이 없는 동안 바뀐 것', '2026년 4월판'],
      items: [
        { en:'Consular wait dropped to 8 days — do paperwork now.', ko:'영사관 대기 8일 — 서류는 지금.' },
        { en:'FX at 1,342 favors bringing USD into KRW, not vice versa.', ko:'환율 1,342원: USD→KRW 유리, 반대는 불리.' },
        { en:'Capitol Hill has two new Korean spots since last fall.', ko:'Capitol Hill에 지난 가을 이후 한식당 2곳 신규.' },
      ],
    },
  };
  const opening = todaysOpening[segment];

  // ═════ Community pulse (mock) ═════
  const community = [
    {
      kind: 'arrival', t_min: 47,
      en: { name:'Min-jun K.', msg:'Landed at SEA 2h ago. SSN booked via my consulate — worked.' },
      ko: { name:'김민준',     msg:'2시간 전 SEA 도착. 영사관 통해 SSN 예약 — 됐어요.' },
    },
    {
      kind: 'tip', t_min: 122,
      en: { name:'Sarah L.',  msg:'FYI Fremont farmers market moved to Wednesday evenings this month.' },
      ko: { name:'이사라',     msg:'Fremont 파머스 마켓이 이번 달부터 수요일 저녁으로 옮겨졌어요.' },
    },
    {
      kind: 'update', t_min: 210,
      en: { name:'James P.', msg:'WA driver license wait is back to walk-in in Renton. 40 min today.' },
      ko: { name:'박제임스',   msg:'Renton 운전면허 walk-in 가능해졌어요. 오늘 40분 걸렸어요.' },
    },
    {
      kind: 'question', t_min: 300,
      en: { name:'Hae-won J.', msg:'Anyone know a 유치원 on Bellevue side with spring openings?' },
      ko: { name:'정해원',     msg:'Bellevue 쪽 봄학기 자리 있는 유치원 아시는 분?' },
    },
  ];

  // ═════ AI Concierge ═════
  const suggestedPrompts = {
    newcomer: {
      en: ['I land in Seattle in 3 weeks with my spouse and 7yr old. Where do I start?', 'What paperwork must I start before arriving?', 'Best neighborhoods with Korean grocery + good schools?'],
      ko: ['3주 뒤 배우자·7살 딸과 시애틀 이주 예정. 뭐부터 해야 해요?', '도착 전에 시작해야 할 서류?', '한인마트 가깝고 학군 좋은 동네?'],
    },
    traveler: {
      en: ['I have 3 days in Seattle next week. Rainy-day plan?', 'Best Korean food near Pike Place?', 'Day trip that is not touristy?'],
      ko: ['다음 주 시애틀 3일. 비 오는 날 일정?', 'Pike Place 근처 한식당?', '관광객 덜한 당일치기?'],
    },
    returner: {
      en: ['Been gone 6 years. What changed in Korean community?', 'How do I update tax residency back to US?', 'My old church is gone. Recommendations?'],
      ko: ['6년 만의 귀향. 한인 커뮤니티 뭐가 바뀌었나요?', '세금 거주지 미국으로 돌리는 법?', '옛 교회가 없어졌어요. 추천?'],
    },
  };

  async function askAI(prompt) {
    if (!prompt.trim() || aiLoading) return;
    const userMsg = { role:'user', text: prompt };
    setAiMessages(m => [...m, userMsg]);
    setQuery('');
    setAiLoading(true);
    try {
      const context = `You are HebronGuide, a warm, practical companion for people arriving in Seattle.
Today is April 21, 2026. Current conditions in Seattle:
- Weather: ${today.weather.label_en}. ${today.weather.mood_en}.
- KRW/USD exchange rate: ${today.fx.rate} (${today.fx.deltaLabel_en})
- Queen Anne median rent: $${today.rent.median} (${today.rent.deltaLabel_en})
- SSN appointment wait: ${today.ssn.wait} days (normally ${today.ssn.normal})
- Cherry blossoms: ${today.bloom.status_en}
- ICN→SEA flights: ${today.flight.status_en}

User segment: ${segment} (newcomer = moving here long-term; traveler = short visit; returner = coming back after time away).

Reply in ${lang === 'ko' ? 'Korean' : 'English'}. Be specific, warm, and USE today's real conditions in your answer. Keep to ~120 words. End with one concrete next step.`;

      const reply = await window.claude.complete({
        messages: [
          { role:'user', content: context + '\n\nUser question: ' + prompt },
        ],
      });
      setAiMessages(m => [...m, { role:'assistant', text: reply }]);
    } catch (e) {
      setAiMessages(m => [...m, { role:'assistant', text: (lang==='en'
        ? 'Sorry, I could not reach the network just now. Try again in a moment.'
        : '죄송해요, 지금 네트워크에 연결되지 않네요. 잠시 후 다시 시도해 주세요.') }]);
    } finally {
      setAiLoading(false);
    }
  }

  // ═════ Mood-driven colors ═════
  const moods = {
    drizzle:  { sky:'#b8c4ce', haze:'#cfd7dc', blossom:'#f0c4d0', ink:'#1c1f24', warm:'#e8a5b7', moss:'#5a7a6a' },
    overcast: { sky:'#c8ceca', haze:'#d9dcd4', blossom:'#f2cad4', ink:'#1c1f24', warm:'#e8a5b7', moss:'#6a8a76' },
    clear:    { sky:'#bad4d8', haze:'#e8e1cf', blossom:'#f5cdd6', ink:'#1c1f24', warm:'#d98858', moss:'#7a9a7e' },
  };
  const mood = moods[weather];

  const dateFmt = lang==='en'
    ? now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric', timeZone:'America/Los_Angeles' })
    : `2026년 4월 21일 ${['일','월','화','수','목','금','토'][now.getDay()]}요일`;
  const timeFmt = now.toLocaleTimeString(lang==='en'?'en-US':'ko-KR', { hour:'2-digit', minute:'2-digit', timeZone:'America/Los_Angeles' });

  return (
    <div style={{ ...llStyles.root, background: `linear-gradient(180deg, ${mood.haze} 0%, #f6f3ea 35%, #fbf8f1 100%)` }}>
      <BlossomLayer mood={mood} weather={weather} />
      {weather === 'drizzle' && <DrizzleLayer />}

      {/* Fake browser-address strip · shows URL hierarchy hebronguide.com / seattle */}
      <div style={llStyles.addressStrip}>
        <div style={llStyles.addressInner}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:8, height:8, borderRadius:4, background:'#10b981', display:'inline-block', boxShadow:'0 0 0 0 #10b981', animation:'ll-pulse 2s infinite' }}/>
            <span style={{ color:'#8a8a7e', letterSpacing:1 }}>LIVE</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:2, flex:1, justifyContent:'center' }}>
            <span style={{ color:'#8a8a7e' }}>hebronguide.com</span>
            <span style={{ color:'#c8c8be', margin:'0 2px' }}>/</span>
            <span style={{ color: mood.ink, fontWeight:600, background:'rgba(255,255,255,0.7)', padding:'2px 8px', borderRadius:4 }}>seattle</span>
            <span style={{ color:'#c8c8be', margin:'0 2px' }}>/</span>
            <span style={{ color:'#8a8a7e' }}>{segment}</span>
          </div>
          <div style={{ color:'#8a8a7e', letterSpacing:1 }}>
            {lang==='en' ? 'EN' : lang==='ko' ? '한국어' : lang.toUpperCase()} · PT {timeFmt}
          </div>
        </div>
      </div>

      {/* Top bar */}
      <header style={llStyles.nav}>
        <div style={llStyles.navInner}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={llStyles.brandMark}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 18V6l7-3 7 3v12M8 18v-6h6v6" stroke={mood.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
              <div style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:20, color: mood.ink, letterSpacing:-0.3, fontWeight:500 }}>
                Hebron<span style={{ fontStyle:'italic', fontWeight:300 }}>Guide</span>
              </div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:12, color:'#8a8a7e', fontWeight:500 }}>/</div>
              <div style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:18, color: mood.ink, fontStyle:'italic', fontWeight:400, letterSpacing:-0.2 }}>
                {t('Seattle','시애틀')}
              </div>
            </div>
          </div>
          <nav style={{ display:'flex', gap:22, flex:1, justifyContent:'center' }}>
            {[
              { k:'today',    en:'Today',    ko:'오늘',     path:'/seattle/today' },
              { k:'guides',   en:'Guides',   ko:'가이드',   path:'/seattle/guides' },
              { k:'community',en:'Community',ko:'커뮤니티', path:'/seattle/community' },
              { k:'ask',      en:'Concierge',ko:'컨시어지', path:'/seattle/ask' },
            ].map(n => (
              <a key={n.k} title={`hebronguide.com${n.path}`}
                style={{ fontSize:13, color: mood.ink, opacity:0.75, cursor:'pointer', fontWeight:500 }}>
                {lang==='en' ? n.en : n.ko}
              </a>
            ))}
            <div style={{ height:16, width:1, background:'rgba(0,0,0,0.12)', alignSelf:'center' }}/>
            <a title="hebronguide.com · all cities"
              style={{ fontSize:12, color:'#6a6a5e', opacity:0.8, cursor:'pointer', fontWeight:500, fontFamily:'JetBrains Mono, monospace', letterSpacing:0.5 }}>
              ← {t('Other cities','다른 도시')}
            </a>
          </nav>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <WeatherTabs weather={weather} setWeather={setWeather} t={t} />
            <LangSwitch lang={lang} setLang={setLang} tone="light" />
          </div>
        </div>
      </header>

      {/* Hero · Date + living greeting */}
      <section style={llStyles.hero}>
        <div style={llStyles.heroInner}>
          <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:14, flexWrap:'wrap' }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11.5, letterSpacing:2.5, color:'#6a6a5e', textTransform:'uppercase' }}>
              · Live · {timeFmt} PT
            </div>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11.5, letterSpacing:1.5, color:'#6a6a5e' }}>
              {dateFmt}
            </div>
          </div>
          <h1 style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:68, fontWeight:400, lineHeight:1.04, letterSpacing:-1.6, margin:0, color: mood.ink, maxWidth:880, textWrap:'balance' }}>
            {lang==='en' ? (
              <>A guide that breathes<br/>with the city today.</>
            ) : (
              <>오늘의 도시와 함께<br/>숨쉬는 가이드.</>
            )}
          </h1>
          <p style={{ fontSize:18, lineHeight:1.6, color:'#3a3a32', marginTop:22, maxWidth:620, fontFamily:'"Noto Sans KR", Inter, sans-serif' }}>
            {t(
              `Not a PDF. Not frozen. HebronGuide reads Seattle in real time — weather, rents, paperwork queues, cherry blossoms — and tells you what it means for you right now.`,
              `PDF가 아니에요. 멈춰있지도 않아요. HebronGuide는 시애틀을 실시간으로 읽어요 — 날씨, 월세, 서류 대기, 벚꽃까지 — 그리고 지금 당신에게 무엇을 의미하는지 알려드려요.`
            )}
          </p>
        </div>
      </section>

      {/* ═════ LAYER 1 · Today Panel ═════ */}
      <section style={llStyles.section}>
        <div style={llStyles.sectionInner}>
          <LayerLabel n="01" en="AMBIENT · Today in Seattle" ko="주변 · 오늘의 시애틀" lang={lang} mood={mood}/>
          <div style={llStyles.todayGrid}>
            <TodayCard kind="weather"  mood={mood} lang={lang} data={today} />
            <TodayCard kind="fx"       mood={mood} lang={lang} data={today} />
            <TodayCard kind="ssn"      mood={mood} lang={lang} data={today} />
            <TodayCard kind="rent"     mood={mood} lang={lang} data={today} />
            <TodayCard kind="bloom"    mood={mood} lang={lang} data={today} />
            <TodayCard kind="flight"   mood={mood} lang={lang} data={today} />
          </div>
        </div>
      </section>

      {/* ═════ Segment selector + Today's opening ═════ */}
      <section style={llStyles.section}>
        <div style={llStyles.sectionInner}>
          <LayerLabel n="02" en="FOR YOU · Today's opening" ko="당신을 위해 · 오늘의 시작" lang={lang} mood={mood}/>
          <SegmentChooser segment={segment} setSegment={setSegment} lang={lang} mood={mood}/>
          <div style={{ ...llStyles.panel, background:'rgba(255,255,255,0.72)', marginTop:28 }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2, color: mood.warm, textTransform:'uppercase', fontWeight:600 }}>
              {lang==='en' ? opening.en[0] : opening.ko[0]}
            </div>
            <div style={{ fontFamily:'Fraunces, serif', fontSize:36, color: mood.ink, marginTop:10, letterSpacing:-0.6, lineHeight:1.15, textWrap:'balance' }}>
              {lang==='en' ? opening.en[1] : opening.ko[1]}
            </div>
            <div style={{ marginTop:26, display:'grid', gap:2 }}>
              {opening.items.map((it, i) => {
                const checked = !!checklistState[`${segment}-${i}`];
                return (
                  <label key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 0', borderBottom: i<opening.items.length-1?`1px solid rgba(0,0,0,0.08)`:'none', cursor:'pointer' }}>
                    <div onClick={() => setChecklistState(s => ({ ...s, [`${segment}-${i}`]: !checked }))}
                      style={{ width:20, height:20, borderRadius:4, border:`1.5px solid ${checked?mood.ink:'#aaa'}`, background: checked?mood.ink:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                      {checked && <svg width="11" height="11" viewBox="0 0 11 11"><path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{ fontFamily:'"Noto Sans KR", Inter, sans-serif', fontSize:16, lineHeight:1.55, color: checked?'#8a8a7e':mood.ink, textDecoration: checked?'line-through':'none' }}>
                      {lang==='en' ? it.en : it.ko}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═════ LAYER 2 · Community pulse ═════ */}
      <section style={llStyles.section}>
        <div style={llStyles.sectionInner}>
          <LayerLabel n="03" en="COMMUNITY · This week" ko="커뮤니티 · 이번 주" lang={lang} mood={mood}/>
          <div style={llStyles.communityGrid}>
            {community.map((c, i) => (
              <div key={i} style={{ ...llStyles.panel, background:'rgba(255,255,255,0.72)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ ...llStyles.kindDot, background: c.kind==='arrival'?mood.warm:c.kind==='tip'?mood.moss:c.kind==='update'?'#d4a84a':'#8a8aa0' }}/>
                    <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10.5, letterSpacing:1.5, color:'#6a6a5e', textTransform:'uppercase', fontWeight:600 }}>
                      {c.kind === 'arrival' ? t('Arrival','도착') : c.kind==='tip' ? t('Tip','팁') : c.kind==='update' ? t('Update','업데이트') : t('Question','질문')}
                    </span>
                  </div>
                  <span style={{ fontSize:11.5, color:'#8a8a7e', fontFamily:'JetBrains Mono, monospace' }}>
                    {c.t_min < 60 ? `${c.t_min}m` : `${Math.floor(c.t_min/60)}h`} {t('ago','전')}
                  </span>
                </div>
                <div style={{ fontSize:15.5, lineHeight:1.55, color: mood.ink, fontFamily:'"Noto Sans KR", Inter, sans-serif' }}>
                  {lang==='en' ? c.en.msg : c.ko.msg}
                </div>
                <div style={{ fontSize:12.5, color:'#6a6a5e', marginTop:12, fontStyle:'italic' }}>
                  — {lang==='en' ? c.en.name : c.ko.name}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:22, textAlign:'center' }}>
            <button style={{ ...llStyles.ghostBtn, color: mood.ink, borderColor:'rgba(0,0,0,0.2)' }}>
              {t('+ Share what you know today','+ 오늘 아는 것을 나누기')}
            </button>
          </div>
        </div>
      </section>

      {/* ═════ LAYER 3 · AI Concierge ═════ */}
      <section style={{ ...llStyles.section, paddingBottom:120 }}>
        <div style={llStyles.sectionInner}>
          <LayerLabel n="04" en="CONCIERGE · Ask Hebron" ko="컨시어지 · Hebron에게 묻기" lang={lang} mood={mood}/>
          <div style={{ background:'#1c1f24', color:'#fff', borderRadius:20, padding:36, boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
              <div style={{ width:36, height:36, borderRadius:18, background: mood.warm, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Fraunces, serif', fontStyle:'italic', fontSize:18, color:'#1c1f24', fontWeight:500 }}>H</div>
              <div>
                <div style={{ fontFamily:'Fraunces, serif', fontSize:18, letterSpacing:-0.2 }}>
                  {t('I know today. Ask me anything about Seattle.','오늘을 알고 있어요. 시애틀에 대해 뭐든 물어보세요.')}
                </div>
                <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.5)', marginTop:3, fontFamily:'JetBrains Mono, monospace', letterSpacing:1 }}>
                  {t('Informed by ambient data + community updates · live','실시간 주변 데이터 + 커뮤니티 업데이트 기반')}
                </div>
              </div>
            </div>

            {aiMessages.length > 0 && (
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:22, marginBottom:18, maxHeight:360, overflowY:'auto', display:'flex', flexDirection:'column', gap:16 }}>
                {aiMessages.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.role==='user' ? 'flex-end' : 'flex-start', maxWidth:'85%' }}>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:1.5, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:6 }}>
                      {m.role === 'user' ? t('You','당신') : 'Hebron'}
                    </div>
                    <div style={{ fontSize:15, lineHeight:1.65, color:'rgba(255,255,255,0.92)', whiteSpace:'pre-wrap', background: m.role==='user' ? 'rgba(255,255,255,0.08)' : 'transparent', padding: m.role==='user'?'12px 16px':0, borderRadius: m.role==='user'?10:0, fontFamily:'"Noto Sans KR", Inter, sans-serif' }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                    <Dot delay={0}/><Dot delay={150}/><Dot delay={300}/>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={e => { e.preventDefault(); askAI(query); }}
              style={{ display:'flex', gap:10, background:'rgba(255,255,255,0.06)', borderRadius:12, padding:6, border:'1px solid rgba(255,255,255,0.1)' }}>
              <input value={query} onChange={e=>setQuery(e.target.value)}
                placeholder={t('e.g. I land in 3 weeks with my family — where do I start?','예: 가족과 3주 뒤 이주 — 뭐부터 할까요?')}
                style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'#fff', fontSize:15, padding:'12px 14px', fontFamily:'"Noto Sans KR", Inter, sans-serif' }}/>
              <button type="submit" disabled={aiLoading || !query.trim()}
                style={{ padding:'12px 22px', background: mood.warm, color:'#1c1f24', border:'none', borderRadius:8, fontWeight:600, fontSize:13.5, cursor: aiLoading?'default':'pointer', fontFamily:'inherit', opacity: (aiLoading || !query.trim())?0.5:1 }}>
                {aiLoading ? '...' : (lang==='en'?'Ask →':'묻기 →')}
              </button>
            </form>

            <div style={{ marginTop:18, display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', letterSpacing:1, fontFamily:'JetBrains Mono, monospace', textTransform:'uppercase', alignSelf:'center' }}>
                {t('Try:','질문 예시:')}
              </span>
              {(lang==='en' ? suggestedPrompts[segment].en : suggestedPrompts[segment].ko).map((p, i) => (
                <button key={i} onClick={() => askAI(p)} disabled={aiLoading}
                  style={{ padding:'7px 13px', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, fontSize:12, cursor: aiLoading?'default':'pointer', fontFamily:'"Noto Sans KR", Inter, sans-serif', transition:'all .12s' }}
                  onMouseEnter={e=>{if(!aiLoading){e.currentTarget.style.background='rgba(255,255,255,0.12)';e.currentTarget.style.color='#fff';}}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='rgba(255,255,255,0.8)';}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid rgba(0,0,0,0.08)', padding:'40px 48px 32px', background:'rgba(255,255,255,0.5)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:40, flexWrap:'wrap', paddingBottom:28, borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
            <div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10.5, letterSpacing:2, color:'#8a8a7e', textTransform:'uppercase', fontWeight:600, marginBottom:10 }}>
                {t('Other cities','다른 도시')}
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {[
                  { slug:'seattle',  en:'Seattle',   ko:'시애틀',       live:true  },
                  { slug:'dallas',   en:'Dallas',    ko:'댓러스',       live:false, eta:'Q1 2026' },
                  { slug:'sf',       en:'SF Bay',    ko:'샌프란시스코', live:false, eta:'Q2 2026' },
                  { slug:'nyc',      en:'New York',  ko:'뉴욕',         live:false, eta:'Q3 2026' },
                  { slug:'nashville',en:'Nashville', ko:'내슈빌',       live:false, eta:'Q4 2026' },
                ].map(c => (
                  <div key={c.slug} style={{ padding:'8px 14px', background: c.live ? mood.ink : 'rgba(255,255,255,0.5)', color: c.live ? '#fff' : '#6a6a5e', borderRadius:8, border: c.live ? `1px solid ${mood.ink}` : '1px solid rgba(0,0,0,0.08)', cursor: c.live?'default':'pointer', opacity: c.live?1:0.75 }}>
                    <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10.5, letterSpacing:0.5, opacity:0.7, marginBottom:2 }}>
                      hebronguide.com/{c.slug}
                    </div>
                    <div style={{ fontFamily:'Fraunces, serif', fontSize:15, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
                      <span>{lang==='en'?c.en:c.ko}</span>
                      {c.live
                        ? <span style={{ fontSize:9, padding:'1px 5px', background:'#10b981', color:'#fff', borderRadius:2, letterSpacing:0.5 }}>LIVE</span>
                        : <span style={{ fontSize:9.5, fontFamily:'JetBrains Mono, monospace', color:'#8a8a7e', letterSpacing:0.5 }}>{c.eta}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10.5, letterSpacing:2, color:'#8a8a7e', textTransform:'uppercase', fontWeight:600, marginBottom:10 }}>
                hebronguide.com
              </div>
              <div style={{ fontFamily:'Fraunces, serif', fontSize:18, color: mood.ink, fontStyle:'italic', maxWidth:320, lineHeight:1.4 }}>
                {t('One global promise. Many local homes.','하나의 글로벌 약속. 여러 지역의 집.')}
              </div>
            </div>
          </div>
          <div style={{ paddingTop:22, display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#8a8a7e', letterSpacing:0.8, flexWrap:'wrap', gap:20 }}>
            <div>HEBRONGUIDE.COM/SEATTLE · LIVING EDITION · APR 21 2026</div>
            <div>{t('Updated continuously by ambient signals + 24 neighbors.','실시간 주변 신호 + 24명의 이웃이 함께 갱신 중.')}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════ Subcomponents ═══════

function LayerLabel({ n, en, ko, lang, mood }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
      <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2.5, color:'#8a8a7e', fontWeight:600 }}>{n}</div>
      <div style={{ height:1, background:'rgba(0,0,0,0.12)', width:40 }}/>
      <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2.5, color: mood.ink, textTransform:'uppercase', fontWeight:600 }}>
        {lang==='en' ? en : ko}
      </div>
    </div>
  );
}

function WeatherTabs({ weather, setWeather, t }) {
  const opts = [
    { k:'drizzle',  icon:'☂', label_en:'Drizzle',  label_ko:'비' },
    { k:'overcast', icon:'☁', label_en:'Overcast', label_ko:'흐림' },
    { k:'clear',    icon:'☀', label_en:'Clear',    label_ko:'맑음' },
  ];
  return (
    <div style={{ display:'flex', background:'rgba(255,255,255,0.5)', borderRadius:20, padding:3, gap:2, border:'1px solid rgba(0,0,0,0.08)' }}>
      {opts.map(o => (
        <button key={o.k} onClick={() => setWeather(o.k)}
          title={t(o.label_en, o.label_ko)}
          style={{ padding:'5px 10px', background: weather===o.k ? '#1c1f24' : 'transparent', color: weather===o.k?'#fff':'#1c1f24', border:'none', borderRadius:16, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
          {o.icon}
        </button>
      ))}
    </div>
  );
}

function SegmentChooser({ segment, setSegment, lang, mood }) {
  const opts = [
    { id:'newcomer', en:'Newcomer', ko:'정착자', glyph:'○', en_sub:'Moving here', ko_sub:'이주하는 중' },
    { id:'traveler', en:'Traveler', ko:'여행자', glyph:'△', en_sub:'Passing through', ko_sub:'잠시 들르는 중' },
    { id:'returner', en:'Returner', ko:'재방문자', glyph:'◇', en_sub:'Coming back', ko_sub:'돌아오는 중' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
      {opts.map(o => {
        const active = segment === o.id;
        return (
          <button key={o.id} onClick={() => setSegment(o.id)}
            style={{ padding:'22px 24px', background: active ? mood.ink : 'rgba(255,255,255,0.55)', color: active ? '#fff' : mood.ink, border:`1px solid ${active?mood.ink:'rgba(0,0,0,0.1)'}`, borderRadius:14, cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all .15s' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:26, opacity:0.55 }}>{o.glyph}</div>
              <div>
                <div style={{ fontFamily:'Fraunces, serif', fontSize:21, fontWeight:500, letterSpacing:-0.3 }}>{lang==='en'?o.en:o.ko}</div>
                <div style={{ fontSize:12, opacity:0.7, marginTop:2, fontFamily:'JetBrains Mono, monospace', letterSpacing:0.5 }}>{lang==='en'?o.en_sub:o.ko_sub}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TodayCard({ kind, mood, lang, data }) {
  const configs = {
    weather: {
      label_en:'WEATHER', label_ko:'날씨',
      primary: lang==='en'?data.weather.label_en:data.weather.label_ko,
      sub:     lang==='en'?data.weather.mood_en:data.weather.mood_ko,
      accent: mood.sky,
      sparkline: data.weather.icon,
    },
    fx: {
      label_en:'EXCHANGE', label_ko:'환율',
      primary: `₩${data.fx.rate.toLocaleString()} / $1`,
      sub: lang==='en'?data.fx.deltaLabel_en:data.fx.deltaLabel_ko,
      delta: data.fx.delta,
      accent: mood.warm,
    },
    ssn: {
      label_en:'SSN QUEUE', label_ko:'SSN 대기',
      primary: `${data.ssn.wait} ${lang==='en'?'days':'일'}`,
      sub: lang==='en'?data.ssn.status_en:data.ssn.status_ko,
      accent: '#d4a84a',
      warn: data.ssn.wait > data.ssn.normal,
    },
    rent: {
      label_en:'RENT · QUEEN ANNE', label_ko:'월세 · QUEEN ANNE',
      primary: `$${data.rent.median.toLocaleString()}`,
      sub: lang==='en'?data.rent.deltaLabel_en:data.rent.deltaLabel_ko,
      delta: data.rent.delta,
      accent: mood.moss,
    },
    bloom: {
      label_en:'CHERRY BLOSSOMS', label_ko:'벚꽃',
      primary: lang==='en'?'Peak · UW Quad':'만개 · UW Quad',
      sub: lang==='en'?data.bloom.status_en:data.bloom.status_ko,
      accent: mood.blossom,
      pulse: true,
    },
    flight: {
      label_en:'FLIGHT · ICN→SEA', label_ko:'항공 · ICN→SEA',
      primary: `$${data.flight.low}`,
      sub: lang==='en'?data.flight.status_en:data.flight.status_ko,
      accent: mood.sky,
    },
  };
  const c = configs[kind];
  const isDelta = typeof c.delta === 'number';
  return (
    <div style={{ ...llStyles.panel, background:'rgba(255,255,255,0.72)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, width:4, height:'100%', background: c.accent }}/>
      {c.pulse && <span style={{ position:'absolute', top:18, right:18, width:8, height:8, borderRadius:4, background:c.accent, boxShadow:`0 0 0 0 ${c.accent}`, animation:'ll-pulse 2s infinite' }}/>}
      <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, letterSpacing:2, color:'#6a6a5e', fontWeight:600 }}>
        {lang==='en' ? c.label_en : c.label_ko}
      </div>
      <div style={{ fontFamily:'Fraunces, serif', fontSize:28, fontWeight:500, color: mood.ink, marginTop:10, letterSpacing:-0.5, lineHeight:1.15 }}>
        {c.primary}
        {isDelta && (
          <span style={{ fontSize:14, color: c.delta > 0 ? mood.warm : mood.moss, marginLeft:8, fontWeight:400 }}>
            {c.delta > 0 ? '↑' : '↓'}
          </span>
        )}
      </div>
      <div style={{ fontSize:12.5, color:'#5a5a52', marginTop:8, lineHeight:1.5, fontFamily:'"Noto Sans KR", Inter, sans-serif' }}>
        {c.sub}
      </div>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <span style={{ display:'inline-block', width:6, height:6, borderRadius:3, background:'rgba(255,255,255,0.5)', animation: `ll-dot 1s ${delay}ms infinite` }}/>
  );
}

// ═════ Atmospheric layers ═════

function BlossomLayer({ mood, weather }) {
  const petals = React.useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: (i * 53 + 7) % 100,
      delay: (i * 1.3) % 8,
      dur: 12 + (i % 5) * 2,
      size: 7 + (i % 3) * 3,
      drift: (i % 2 === 0 ? 1 : -1) * (40 + (i % 3) * 20),
    }));
  }, []);
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
      {petals.map(p => (
        <svg key={p.id} width={p.size} height={p.size} viewBox="0 0 10 10"
          style={{ position:'absolute', top:-20, left:`${p.left}%`, animation: `ll-fall ${p.dur}s ${p.delay}s linear infinite`, ['--drift']: `${p.drift}px` }}>
          <path d="M5 0C5.5 2 6.5 3 8.5 4C6.5 5 5.5 7 5 9C4.5 7 3.5 5 1.5 4C3.5 3 4.5 2 5 0Z" fill={mood.blossom} opacity="0.9"/>
        </svg>
      ))}
    </div>
  );
}

function DrizzleLayer() {
  const drops = React.useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    left: (i * 37 + 3) % 100,
    delay: (i * 0.13) % 2,
    dur: 0.8 + (i % 4) * 0.2,
    opacity: 0.15 + (i % 3) * 0.1,
  })), []);
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
      {drops.map((d, i) => (
        <div key={i} style={{
          position:'absolute', top:-20, left:`${d.left}%`, width:1, height:18,
          background:`linear-gradient(180deg, transparent, rgba(150,170,180,${d.opacity}) 60%, rgba(150,170,180,${d.opacity*1.5}))`,
          animation: `ll-rain ${d.dur}s ${d.delay}s linear infinite`,
        }}/>
      ))}
    </div>
  );
}

const llStyles = {
  root: { position:'relative', minHeight:'100%', overflow:'hidden', fontFamily:'Inter, "Noto Sans KR", sans-serif' },
  addressStrip: { position:'relative', zIndex:3, background:'rgba(255,255,255,0.6)', borderBottom:'1px solid rgba(0,0,0,0.05)', backdropFilter:'blur(12px)' },
  addressInner: { maxWidth:1200, margin:'0 auto', padding:'7px 48px', display:'flex', alignItems:'center', gap:20, fontFamily:'JetBrains Mono, monospace', fontSize:11 },
  nav: { position:'relative', zIndex:2, borderBottom:'1px solid rgba(0,0,0,0.06)', background:'rgba(255,255,255,0.4)', backdropFilter:'blur(12px)' },
  navInner: { maxWidth:1200, margin:'0 auto', padding:'16px 48px', display:'flex', alignItems:'center', gap:24 },
  brandMark: { width:36, height:36, borderRadius:8, background:'rgba(255,255,255,0.6)', border:'1px solid rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'center' },
  hero: { position:'relative', zIndex:1, padding:'70px 48px 20px' },
  heroInner: { maxWidth:1200, margin:'0 auto' },
  section: { position:'relative', zIndex:1, padding:'60px 48px' },
  sectionInner: { maxWidth:1200, margin:'0 auto' },
  todayGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 },
  communityGrid: { display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:14 },
  panel: { padding:'22px 24px', borderRadius:14, border:'1px solid rgba(0,0,0,0.06)' },
  kindDot: { width:8, height:8, borderRadius:4, display:'inline-block' },
  ghostBtn: { padding:'10px 20px', background:'transparent', border:'1px solid', borderRadius:20, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' },
};

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('ll-kf')) {
  const s = document.createElement('style');
  s.id = 'll-kf';
  s.textContent = `
    @keyframes ll-fall {
      0%   { transform: translate(0, -20px) rotate(0deg); opacity: 0; }
      10%  { opacity: 0.9; }
      100% { transform: translate(var(--drift, 60px), 2600px) rotate(360deg); opacity: 0; }
    }
    @keyframes ll-rain {
      0%   { transform: translateY(-20px); opacity: 0; }
      10%  { opacity: 1; }
      100% { transform: translateY(2600px); opacity: 0; }
    }
    @keyframes ll-pulse {
      0%,100% { box-shadow: 0 0 0 0 currentColor; opacity:1; }
      50%     { box-shadow: 0 0 0 8px transparent; opacity:0.6; }
    }
    @keyframes ll-dot {
      0%,100% { opacity: 0.3; transform: translateY(0); }
      50%     { opacity: 1;   transform: translateY(-3px); }
    }
  `;
  document.head.appendChild(s);
}

window.LivingLanding = LivingLanding;

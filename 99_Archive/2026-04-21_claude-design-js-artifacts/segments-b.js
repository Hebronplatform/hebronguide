// HebronGuide — Segment Landing · Variant B
// Bilingual Editorial — EN and KR rendered side-by-side, magazine feel.
// Inspired by Monocle, NYT Korean bilingual layouts, and L'Officiel.
// Language toggle changes WHICH language is "primary" (larger) but both remain visible.

function SegmentBilingualEditorial() {
  const [primary, setPrimary] = React.useState('en'); // en | ko | zh | es | vi | ja
  const [hover, setHover] = React.useState(null);

  // Helper: primary text large, secondary text small below
  const Bi = ({ en, ko, primarySize = 42, secondarySize = 16, color = '#1a1815', mutedColor = '#8a8275', style = {} }) => {
    const isEnPrimary = primary === 'en';
    const p = isEnPrimary ? en : ko;
    const s = isEnPrimary ? ko : en;
    const pFont = isEnPrimary ? 'Fraunces, Georgia, serif' : '"Noto Serif KR", "Nanum Myeongjo", serif';
    const sFont = isEnPrimary ? '"Noto Sans KR", sans-serif' : 'Inter, sans-serif';
    return (
      <div style={style}>
        <div style={{ fontFamily: pFont, fontSize: primarySize, lineHeight:1.1, letterSpacing:-0.8, color, fontWeight:400, textWrap:'balance' }}>{p}</div>
        <div style={{ fontFamily: sFont, fontSize: secondarySize, lineHeight:1.4, color: mutedColor, marginTop: 10, fontWeight:400 }}>{s}</div>
      </div>
    );
  };

  const segments = [
    {
      id:'newcomer',
      num:'I',
      en:{ title:'The one who stays.', sub:'Immigration · Relocation · Long roots.', body:'For people arriving with suitcases that will not be unpacked for a long time. SSN, housing, license, schools, taxes — everything the first 180 days ask of you.' },
      ko:{ title:'머무는 이.', sub:'이민 · 이주 · 깊은 뿌리.', body:'오래 풀지 않을 짐을 들고 도착한 분들. SSN · 주거 · 면허 · 학교 · 세금 — 첫 180일이 당신에게 묻는 모든 것.' },
    },
    {
      id:'traveler',
      num:'II',
      en:{ title:'The one who passes.', sub:'Tourism · Short visits · Business trips.', body:'For people whose stay has an end date printed on a plane ticket. Markets, meals, trails, the 72 hours you will remember for ten years.' },
      ko:{ title:'지나가는 이.', sub:'관광 · 단기 방문 · 출장.', body:'머무는 끝이 비행기표에 적힌 분들. 시장과 식사, 산책길, 10년을 기억하게 할 72시간.' },
    },
    {
      id:'returner',
      num:'III',
      en:{ title:'The one who returns.', sub:'Re-immigration · Family · Rooted but distant.', body:'For people with a door that was always yours, even when you were not there. Paperwork after absence, reconnections, the particular grief of coming back.' },
      ko:{ title:'돌아오는 이.', sub:'역이민 · 가족 · 뿌리 있는 거리.', body:'없을 때도 당신의 것이었던 문을 가진 분들. 오랜 부재 후의 서류, 다시 맺는 관계, 귀향이 가진 특유의 슬픔.' },
    },
  ];

  return (
    <div style={beStyles.root}>
      {/* Masthead — large editorial nameplate */}
      <header style={beStyles.masthead}>
        <div style={beStyles.mastheadInner}>
          <div style={beStyles.mastheadTop}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2.5, color:'#8a8275', textTransform:'uppercase' }}>
              Vol. 01 · No. 001 · Seattle Edition
            </div>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2.5, color:'#8a8275', textTransform:'uppercase' }}>
              Established · 2026
            </div>
          </div>
          <div style={beStyles.nameplate}>
            <div style={{ fontFamily:'Fraunces, Georgia, serif', fontSize:86, fontWeight:400, letterSpacing:-2.5, lineHeight:1, color:'#1a1815' }}>Hebron<span style={{ fontStyle:'italic', fontWeight:300 }}>Guide</span></div>
            <div style={{ fontFamily:'"Noto Serif KR", "Nanum Myeongjo", serif', fontSize:22, color:'#8a8275', marginTop:12, letterSpacing:-0.3 }}>헤브론가이드 · 이주자를 위한 정착 저널</div>
          </div>
          <div style={beStyles.mastheadBot}>
            <nav style={{ display:'flex', gap:28, fontFamily:'Inter, sans-serif', fontSize:13, color:'#4a4640', fontWeight:500 }}>
              <a>Guides · 가이드</a>
              <a>Cities · 도시</a>
              <a>Letters · 편지</a>
              <a>Contributors · 기여자</a>
            </nav>
            <LangSwitch lang={primary} setLang={setPrimary} tone="light" />
          </div>
        </div>
      </header>

      {/* Hero — huge bilingual statement */}
      <section style={beStyles.hero}>
        <div style={beStyles.heroGrid}>
          <div style={{ gridColumn:'1 / -1', borderBottom:'1px solid #2d2925', paddingBottom:30, marginBottom:40 }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2.5, color:'#c2503a', textTransform:'uppercase', marginBottom:24 }}>
              The Cover Essay · 표지 에세이
            </div>
            <Bi
              en="Arriving well, wherever you go."
              ko="어디로 가든, 잘 도착하도록."
              primarySize={86}
              secondarySize={28}
              color="#1a1815"
              mutedColor="#6a6258"
            />
          </div>

          <div style={{ gridColumn:'1 / span 7' }}>
            <Bi
              en="Every migration is a translation. Of language, yes — but also of weather, bread, sounds at 4am, the shape of a highway sign, the specific silence of a new neighborhood."
              ko="모든 이주는 번역입니다. 언어뿐 아니라, 날씨와 빵과 새벽 4시의 소리와 고속도로 표지판의 모양과, 새로운 동네가 가진 특유의 고요함을."
              primarySize={24}
              secondarySize={15}
              color="#2d2925"
              mutedColor="#8a8275"
            />
          </div>

          <div style={{ gridColumn:'9 / -1', borderLeft:'1px solid #d8d3c9', paddingLeft:32 }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2, color:'#8a8275', textTransform:'uppercase', marginBottom:14 }}>In this issue · 이번 호</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { en:'Three ways to arrive', ko:'도착하는 세 가지 방식', pg:'p.004' },
                { en:'Seattle, by neighborhood', ko:'시애틀, 동네별로', pg:'p.018' },
                { en:'Letters from early readers', ko:'먼저 온 이의 편지', pg:'p.042' },
              ].map((x,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', paddingBottom:12, borderBottom:i<2?'1px dashed #d8d3c9':'none' }}>
                  <div>
                    <div style={{ fontFamily:'Fraunces, serif', fontSize:17, color:'#1a1815', lineHeight:1.3 }}>{x.en}</div>
                    <div style={{ fontFamily:'"Noto Serif KR", serif', fontSize:13, color:'#8a8275', marginTop:2 }}>{x.ko}</div>
                  </div>
                  <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10.5, color:'#c2503a', letterSpacing:0.8 }}>{x.pg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Three segments — three columns, each a mini-essay */}
      <section style={beStyles.segments}>
        <div style={beStyles.segmentsInner}>
          <div style={{ textAlign:'center', paddingBottom:50, marginBottom:60, borderBottom:'1px solid #e8e3d9' }}>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:3, color:'#8a8275', textTransform:'uppercase', marginBottom:18 }}>Three Movements · 세 움직임</div>
            <Bi
              en="There are three ways to come to a new city."
              ko="새로운 도시에 오는 방식은 세 가지."
              primarySize={46}
              secondarySize={20}
              style={{ textAlign:'center' }}
            />
          </div>

          <div style={beStyles.threeCol}>
            {segments.map((s, i) => (
              <article key={s.id} onMouseEnter={()=>setHover(s.id)} onMouseLeave={()=>setHover(null)}
                style={{ ...beStyles.segCol, borderRight: i<2 ? '1px solid #e8e3d9' : 'none', background: hover===s.id ? '#faf6ec' : 'transparent' }}>
                <div style={{ fontFamily:'Fraunces, serif', fontSize:96, fontWeight:300, color:'#c2503a', lineHeight:1, fontStyle:'italic', marginBottom:24 }}>
                  {s.num}
                </div>
                <Bi
                  en={s.en.title}
                  ko={s.ko.title}
                  primarySize={34}
                  secondarySize={15}
                  style={{ marginBottom:20 }}
                />
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10.5, letterSpacing:1.5, color:'#c2503a', textTransform:'uppercase', marginBottom:18, lineHeight:1.6 }}>
                  {primary==='en' ? s.en.sub : s.ko.sub}
                  <div style={{ color:'#8a8275', marginTop:3, letterSpacing:1.2 }}>
                    {primary==='en' ? s.ko.sub : s.en.sub}
                  </div>
                </div>
                <div style={{ fontFamily: primary==='en'?'Fraunces, serif':'"Noto Serif KR", serif', fontSize: primary==='en'?17:16, lineHeight:1.6, color:'#2d2925' }}>
                  {primary==='en' ? s.en.body : s.ko.body}
                </div>
                <div style={{ fontFamily: primary==='en'?'"Noto Sans KR", sans-serif':'Inter, sans-serif', fontSize: 13, lineHeight:1.6, color:'#8a8275', marginTop:14 }}>
                  {primary==='en' ? s.ko.body : s.en.body}
                </div>
                <div style={{ marginTop:28, display:'flex', alignItems:'center', gap:8, fontFamily:'Inter, sans-serif', fontSize:13, fontWeight:600, color:'#1a1815', cursor:'pointer' }}>
                  <span>{primary==='en' ? 'Read the chapter' : '챕터 읽기'}</span>
                  <span>→</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cities strip — editorial treatment */}
      <section style={beStyles.citiesStrip}>
        <div style={beStyles.citiesStripInner}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:40 }}>
            <div>
              <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, letterSpacing:2.5, color:'#8a8275', textTransform:'uppercase' }}>Coming Editions · 다음 호</div>
              <div style={{ fontFamily:'Fraunces, serif', fontSize:38, fontWeight:400, letterSpacing:-0.8, color:'#1a1815', marginTop:6 }}>
                {primary==='en' ? 'Five cities, one philosophy.' : '다섯 도시, 하나의 철학.'}
              </div>
            </div>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#8a8275', letterSpacing:1 }}>↓ 01 / 05</div>
          </div>
          <div style={beStyles.cityRow}>
            {[
              { en:'Seattle',  ko:'시애틀',       no:'No. 001', live:true,  langs:['EN','한국어','中文','ES','VI'] },
              { en:'Dallas',   ko:'댈러스',       no:'No. 002', live:false, langs:['EN','한국어','ES','中文','VI'], eta:'Q1 2026' },
              { en:'SF Bay',   ko:'샌프란시스코', no:'No. 003', live:false, langs:['EN','한국어','中文','ES','HI'], eta:'Q2 2026' },
              { en:'New York', ko:'뉴욕',         no:'No. 004', live:false, langs:['EN','한국어','ES','中文','RU'], eta:'Q3 2026' },
              { en:'Nashville',ko:'내슈빌',       no:'No. 005', live:false, langs:['EN','한국어','ES','AR'],       eta:'Q4 2026' },
            ].map((c, i) => (
              <div key={i} style={beStyles.cityEntry}>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10.5, letterSpacing:1.5, color:'#c2503a', marginBottom:10 }}>{c.no}</div>
                <div style={{ fontFamily:'Fraunces, serif', fontSize:26, letterSpacing:-0.5, color:'#1a1815', fontWeight:400 }}>{primary==='en'?c.en:c.ko}</div>
                <div style={{ fontFamily:'"Noto Serif KR", serif', fontSize:14, color:'#8a8275', marginTop:2 }}>{primary==='en'?c.ko:c.en}</div>
                <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10, color:'#8a8275', letterSpacing:1, marginTop:20, lineHeight:1.6 }}>
                  {c.langs.join(' · ')}
                </div>
                <div style={{ marginTop:14, fontFamily:'Inter, sans-serif', fontSize:11, fontWeight:600, letterSpacing:0.5 }}>
                  {c.live
                    ? <span style={{ color:'#1a1815' }}>● {primary==='en'?'LIVE NOW':'운영 중'}</span>
                    : <span style={{ color:'#8a8275' }}>○ {c.eta}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Colophon */}
      <footer style={beStyles.colophon}>
        <div style={beStyles.colophonInner}>
          <div>
            <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:10.5, letterSpacing:2, color:'#8a8275', textTransform:'uppercase', marginBottom:14 }}>Colophon · 판권</div>
            <div style={{ fontFamily:'Fraunces, serif', fontSize:20, color:'#1a1815', lineHeight:1.4, maxWidth:520 }}>
              {primary==='en'
                ? 'A settlement journal written by those who arrived first, for those arriving next.'
                : '먼저 도착한 이들이, 다음에 도착할 이들을 위해 쓰는 정착 저널.'}
            </div>
          </div>
          <div style={{ fontFamily:'JetBrains Mono, monospace', fontSize:11, color:'#8a8275', letterSpacing:1.2, textAlign:'right', lineHeight:1.8 }}>
            HEBRONGUIDE · 2026<br/>
            SEATTLE · DALLAS · SF · NYC · NASHVILLE<br/>
            24 CONTRIBUTORS · 5 LANGUAGES
          </div>
        </div>
      </footer>
    </div>
  );
}

const beStyles = {
  root: { background:'#faf6ec', color:'#1a1815', minHeight:'100%', fontFamily:'Inter, sans-serif' },
  masthead: { borderBottom:'2px solid #1a1815', background:'#faf6ec' },
  mastheadInner: { maxWidth:1200, margin:'0 auto', padding:'20px 40px 24px' },
  mastheadTop: { display:'flex', justifyContent:'space-between', paddingBottom:18, borderBottom:'1px solid #e8e3d9' },
  nameplate: { padding:'40px 0 30px', textAlign:'center' },
  mastheadBot: { display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:18, borderTop:'1px solid #e8e3d9' },
  hero: { padding:'80px 40px', borderBottom:'1px solid #e8e3d9' },
  heroGrid: { maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap:24 },
  segments: { padding:'100px 0' },
  segmentsInner: { maxWidth:1200, margin:'0 auto', padding:'0 40px' },
  threeCol: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)' },
  segCol: { padding:'10px 36px 10px 36px', transition:'background .2s' },
  citiesStrip: { padding:'100px 40px', borderTop:'1px solid #e8e3d9', background:'#f3eddf' },
  citiesStripInner: { maxWidth:1200, margin:'0 auto' },
  cityRow: { display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:0 },
  cityEntry: { padding:'24px 20px', borderLeft:'1px solid #e8e3d9', cursor:'pointer' },
  colophon: { padding:'60px 40px', borderTop:'2px solid #1a1815' },
  colophonInner: { maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:40, flexWrap:'wrap' },
};

window.SegmentBilingualEditorial = SegmentBilingualEditorial;

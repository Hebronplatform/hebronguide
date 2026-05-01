// Variant B — Warm Companion
// Friendly companion for newcomers. Warm terracotta + cream. Soft, approachable.

function WarmVariant() {
  const [mood, setMood] = React.useState(null);
  const moods = [
    { id: 'arriving', emoji: '✈', label: '곧 도착해요', days: 'D-14 ~ D-0' },
    { id: 'settling', emoji: '📦', label: '정착 중', days: '1~3개월차' },
    { id: 'living', emoji: '🏡', label: '생활 중', days: '3개월+' },
  ];

  return (
    <div style={warmStyles.root}>
      {/* Paper grain */}
      <div style={warmStyles.grain} />

      {/* Top bar */}
      <header style={warmStyles.header}>
        <div style={warmStyles.headerInner}>
          <div style={warmStyles.brand}>
            <div style={warmStyles.brandMark}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M5 21V7l8-4 8 4v14M9 21v-7h8v7" stroke="#5c3a1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#5c3a1f', letterSpacing: -0.3 }}>HebronGuide</div>
              <div style={{ fontSize: 11, color: '#a07c5a', marginTop: -1 }}>시애틀 정착의 동반자</div>
            </div>
          </div>
          <nav style={warmStyles.nav}>
            <a style={warmStyles.navLink}>여정</a>
            <a style={warmStyles.navLink}>가이드</a>
            <a style={warmStyles.navLink}>동네</a>
            <a style={warmStyles.navLink}>이웃</a>
          </nav>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button style={warmStyles.ghostBtn}>로그인</button>
            <button style={warmStyles.primaryBtn}>여정 시작</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={warmStyles.hero}>
        <div style={warmStyles.heroInner}>
          <div style={warmStyles.badge}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#c2503a', display: 'inline-block' }} />
            지금 시애틀에 2,430명이 정착 중
          </div>
          <h1 style={warmStyles.h1}>
            시애틀은 처음이라,<br/>
            <span style={warmStyles.h1Accent}>혼자가 아니면 좋겠어요.</span>
          </h1>
          <p style={warmStyles.dek}>
            비행기 표를 끊은 순간부터 첫 감사절까지 —<br/>
            먼저 정착한 한인들이 쓴 실전 가이드와 체크리스트,<br/>
            그리고 옆동네 이웃들이 함께합니다.
          </p>

          {/* Mood picker */}
          <div style={warmStyles.moodCard}>
            <div style={warmStyles.moodLabel}>지금 어떤 단계에 계세요?</div>
            <div style={warmStyles.moodRow}>
              {moods.map(m => (
                <button key={m.id} onClick={() => setMood(m.id)}
                  style={{ ...warmStyles.moodBtn, ...(mood === m.id ? warmStyles.moodBtnActive : {}) }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{m.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#5c3a1f' }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: '#a07c5a', marginTop: 2 }}>{m.days}</div>
                </button>
              ))}
            </div>
            {mood && (
              <div style={warmStyles.moodResult}>
                <div style={{ fontSize: 14, color: '#5c3a1f', lineHeight: 1.5 }}>
                  ✓ <b>{moods.find(m => m.id === mood).label}</b>에 맞는 우선순위 12가지를 준비했어요.
                </div>
                <button style={warmStyles.primaryBtn}>내 여정 보기 →</button>
              </div>
            )}
          </div>
        </div>

        {/* Decorative rain */}
        <div style={warmStyles.rainCol}>
          <svg width="100%" height="100%" viewBox="0 0 200 400" preserveAspectRatio="none">
            {[...Array(40)].map((_, i) => {
              const x = (i * 37) % 200;
              const y = (i * 23) % 400;
              return <line key={i} x1={x} y1={y} x2={x - 3} y2={y + 14} stroke="#c2503a" strokeWidth="1" opacity={0.15 + (i % 3) * 0.1} strokeLinecap="round"/>
            })}
          </svg>
        </div>
      </section>

      {/* Journey steps */}
      <section style={warmStyles.journey}>
        <div style={warmStyles.journeyInner}>
          <div style={warmStyles.eyebrow}>정착 여정 · 6단계</div>
          <h2 style={warmStyles.h2}>처음부터 끝까지, 함께 걸어요</h2>
          <div style={warmStyles.stepsRow}>
            {[
              { n: '01', t: '비행 전 준비', d: '서류·송금·예방접종', color: '#e8dcc8' },
              { n: '02', t: '도착 첫 주', d: 'SSN·숙소·교통', color: '#ecc9a8' },
              { n: '03', t: '집 찾기', d: '동네·렌트·가구', color: '#e8b088' },
              { n: '04', t: '기반 세우기', d: '면허·은행·통신', color: '#d89a6e' },
              { n: '05', t: '일상 만들기', d: '병원·학교·교회', color: '#c48659' },
              { n: '06', t: '뿌리내리기', d: '세금·영주권·커뮤니티', color: '#a6704a' },
            ].map((s, i) => (
              <div key={i} style={{ ...warmStyles.stepCard, background: s.color }}>
                <div style={warmStyles.stepNum}>{s.n}</div>
                <div style={warmStyles.stepTitle}>{s.t}</div>
                <div style={warmStyles.stepDesc}>{s.d}</div>
                <div style={warmStyles.stepArrow}>→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhood */}
      <section style={warmStyles.neighborhood}>
        <div style={warmStyles.neighborhoodInner}>
          <div>
            <div style={warmStyles.eyebrow}>동네 살펴보기</div>
            <h2 style={warmStyles.h2}>어디서 살지, 고민이라면</h2>
            <p style={{ fontSize: 16, color: '#8a6a4a', lineHeight: 1.6, marginTop: 14, maxWidth: 520 }}>
              Bellevue의 한인타운, Issaquah의 학군, Lynnwood의 렌트 —<br/>
              12개 동네를 직접 살아본 이웃이 알려드려요.
            </p>
          </div>
          <div style={warmStyles.hoodGrid}>
            {[
              { n: 'Bellevue', kr: '벨뷰', r: '★★★★★', note: '한인 밀집 · 학군 최고', rent: '$2,800' },
              { n: 'Lynnwood', kr: '린우드', r: '★★★★☆', note: '한인마트 · 합리적', rent: '$2,100' },
              { n: 'Issaquah', kr: '이사콰', r: '★★★★★', note: '자연 · 조용함', rent: '$2,600' },
              { n: 'Federal Way', kr: '페더럴웨이', r: '★★★☆☆', note: '저렴 · 통근 길어', rent: '$1,800' },
            ].map((h, i) => (
              <div key={i} style={warmStyles.hoodCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#5c3a1f' }}>{h.kr}</div>
                    <div style={{ fontSize: 12, color: '#a07c5a', marginTop: 1 }}>{h.n}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#c2503a' }}>{h.r}</div>
                </div>
                <div style={{ fontSize: 13, color: '#6a4a2a', marginTop: 14, lineHeight: 1.5 }}>{h.note}</div>
                <div style={{ borderTop: '1px dashed #d4bfa3', marginTop: 14, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#8a6a4a' }}>1BR 중간값</span>
                  <span style={{ color: '#5c3a1f', fontWeight: 700 }}>{h.rent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Letter card */}
      <section style={warmStyles.letter}>
        <div style={warmStyles.letterCard}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#a07c5a', textTransform: 'uppercase', marginBottom: 24 }}>이웃의 편지 · Vol.34</div>
          <div style={{ fontSize: 22, lineHeight: 1.6, color: '#5c3a1f', fontWeight: 500 }}>
            "3년 전 이맘때, 저도 정확히 같은 자리에 있었어요.<br/>
            SSN 줄 서고, 아이 학교 찾고, 김치 담글 배추 찾느라 헤맸죠.<br/>
            당신은 조금 덜 헤매면 좋겠어서, 씁니다."
          </div>
          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: '#d89a6e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>지</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#5c3a1f' }}>지수 · Redmond 거주 3년차</div>
              <div style={{ fontSize: 12, color: '#a07c5a' }}>기여자 · 가이드 12편 작성</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={warmStyles.footer}>
        <div style={{ fontSize: 14, color: '#a07c5a' }}>HebronGuide · 시애틀 정착의 동반자 · 먼저 온 이웃이 쓰는 가이드</div>
      </footer>
    </div>
  );
}

const warmStyles = {
  root: { fontFamily: '"Noto Sans KR", -apple-system, sans-serif', background: '#fbf3e8', color: '#5c3a1f', minHeight: '100%', position: 'relative', overflow: 'hidden' },
  grain: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(92,58,31,0.04) 1px, transparent 1px)', backgroundSize: '4px 4px', pointerEvents: 'none', zIndex: 0 },
  header: { padding: '20px 40px', position: 'relative', zIndex: 2 },
  headerInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 40 },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandMark: { width: 42, height: 42, borderRadius: 21, background: '#f5e3ca', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nav: { display: 'flex', gap: 28, flex: 1, marginLeft: 20 },
  navLink: { fontSize: 14, color: '#6a4a2a', fontWeight: 500, cursor: 'pointer' },
  ghostBtn: { padding: '9px 16px', background: 'transparent', color: '#5c3a1f', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  primaryBtn: { padding: '10px 18px', background: '#c2503a', color: '#fbf3e8', border: 'none', borderRadius: 28, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 0 rgba(92,58,31,0.15)' },
  hero: { maxWidth: 1200, margin: '0 auto', padding: '60px 40px 80px', display: 'flex', gap: 40, alignItems: 'flex-start', position: 'relative', zIndex: 2 },
  heroInner: { flex: 1 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#f5e3ca', borderRadius: 20, fontSize: 12, color: '#6a4a2a', marginBottom: 28 },
  h1: { fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.8, margin: 0, textWrap: 'balance' },
  h1Accent: { color: '#c2503a', fontStyle: 'italic', fontWeight: 500, fontFamily: 'Fraunces, Georgia, serif' },
  dek: { fontSize: 17, lineHeight: 1.7, color: '#8a6a4a', marginTop: 24 },
  moodCard: { background: '#fff', borderRadius: 20, padding: 28, marginTop: 40, boxShadow: '0 1px 0 #f0dfc3, 0 10px 30px rgba(92,58,31,0.06)', border: '1px solid #f0dfc3' },
  moodLabel: { fontSize: 14, color: '#6a4a2a', fontWeight: 600, marginBottom: 14 },
  moodRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  moodBtn: { padding: '18px 12px', background: '#fbf3e8', border: '2px solid transparent', borderRadius: 14, cursor: 'pointer', textAlign: 'center', transition: 'all .15s' },
  moodBtnActive: { background: '#fff', border: '2px solid #c2503a', boxShadow: '0 4px 16px rgba(194,80,58,0.15)' },
  moodResult: { marginTop: 18, padding: 16, background: '#fbf3e8', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  rainCol: { width: 140, alignSelf: 'stretch', opacity: 0.7 },
  journey: { background: '#f5e3ca', padding: '80px 40px', position: 'relative', zIndex: 2 },
  journeyInner: { maxWidth: 1200, margin: '0 auto' },
  eyebrow: { fontSize: 11, letterSpacing: 2, color: '#c2503a', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 },
  h2: { fontSize: 40, fontWeight: 800, letterSpacing: -1, margin: 0, color: '#5c3a1f' },
  stepsRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginTop: 40 },
  stepCard: { padding: '24px 18px', borderRadius: 16, position: 'relative', minHeight: 180, display: 'flex', flexDirection: 'column', cursor: 'pointer' },
  stepNum: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(92,58,31,0.6)', letterSpacing: 1 },
  stepTitle: { fontSize: 16, fontWeight: 700, color: '#5c3a1f', marginTop: 'auto', letterSpacing: -0.3 },
  stepDesc: { fontSize: 12, color: 'rgba(92,58,31,0.7)', marginTop: 4 },
  stepArrow: { position: 'absolute', top: 20, right: 18, fontSize: 18, color: 'rgba(92,58,31,0.4)' },
  neighborhood: { padding: '80px 40px', position: 'relative', zIndex: 2 },
  neighborhoodInner: { maxWidth: 1200, margin: '0 auto' },
  hoodGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 40 },
  hoodCard: { background: '#fff', borderRadius: 16, padding: 22, border: '1px solid #f0dfc3', cursor: 'pointer', transition: 'transform .15s' },
  letter: { padding: '20px 40px 80px', position: 'relative', zIndex: 2 },
  letterCard: { maxWidth: 780, margin: '0 auto', background: '#fff', borderRadius: 20, padding: '48px 56px', border: '1px solid #f0dfc3', transform: 'rotate(-0.3deg)', boxShadow: '0 10px 40px rgba(92,58,31,0.08)' },
  footer: { textAlign: 'center', padding: '40px 20px', borderTop: '1px solid #f0dfc3', position: 'relative', zIndex: 2 },
};

window.WarmVariant = WarmVariant;

// Variant A — Editorial Guide
// Minimal, long-form reading. Serif editorial feel. Cool neutrals + Puget Sound blue.

function EditorialVariant() {
  const [tab, setTab] = React.useState('housing');
  const [savedItems, setSavedItems] = React.useState(new Set(['dol-guide']));

  const toggleSave = (id) => {
    setSavedItems(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const categories = [
    { id: 'housing', ko: '주거', en: 'Housing' },
    { id: 'license', ko: '운전면허', en: 'Driver License' },
    { id: 'banking', ko: '은행·세금', en: 'Banking & Tax' },
    { id: 'health', ko: '의료', en: 'Healthcare' },
    { id: 'school', ko: '학교·육아', en: 'Schools' },
    { id: 'community', ko: '커뮤니티', en: 'Community' },
  ];

  const featured = {
    housing: {
      kicker: 'CHAPTER 01 · 주거',
      title: '비가 많이 오는 도시에서,\n집을 고르는 법',
      dek: '시애틀의 첫 집은 단지 잠자는 곳이 아닙니다. 통근, 학군, 습도까지 — 한 번의 결정이 1년을 좌우합니다.',
      readTime: '12분',
      updated: '3일 전 업데이트',
    },
  };

  const articles = [
    { id: 'dol-guide', cat: '운전면허', title: 'WA 운전면허 취득, 단계별 완벽 가이드', author: 'Eliana K.', time: '8분', tag: '필수' },
    { id: 'rent', cat: '주거', title: '렌트 계약 전, 반드시 확인할 7가지', author: 'Joon P.', time: '6분', tag: '인기' },
    { id: 'ssn', cat: '은행·세금', title: 'SSN 없이 은행 계좌 여는 법', author: 'Hana L.', time: '5분', tag: '' },
    { id: 'insurance', cat: '의료', title: '건강보험 Apple Health vs 사보험', author: 'Dr. Min', time: '10분', tag: '업데이트' },
    { id: 'school', cat: '학교', title: '시애틀 공립학교 배정 시스템', author: 'Sora C.', time: '7분', tag: '' },
    { id: 'church', cat: '커뮤니티', title: '한인 교회·모임 지도', author: 'HebronGuide', time: '4분', tag: '' },
  ];

  return (
    <div style={edStyles.root}>
      {/* Top nav */}
      <header style={edStyles.header}>
        <div style={edStyles.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={edStyles.mark}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 18V4l8 5 8-5v14" stroke="#1a2a3a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="1.6" fill="#3a6b8a"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 500, letterSpacing: -0.3, color: '#1a2a3a' }}>
                HebronGuide
              </div>
              <div style={{ fontSize: 10.5, letterSpacing: 1.2, color: '#6a7888', textTransform: 'uppercase', marginTop: -2 }}>
                시애틀 정착 저널
              </div>
            </div>
          </div>
          <nav style={edStyles.nav}>
            <a style={edStyles.navLink}>가이드</a>
            <a style={edStyles.navLink}>체크리스트</a>
            <a style={edStyles.navLink}>지도</a>
            <a style={edStyles.navLink}>커뮤니티</a>
            <a style={edStyles.navLink}>FAQ</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={edStyles.searchBtn}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5L13 13"/>
              </svg>
              <span>검색</span>
              <kbd style={edStyles.kbd}>⌘K</kbd>
            </button>
            <button style={edStyles.loginBtn}>로그인</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={edStyles.hero}>
        <div style={edStyles.heroInner}>
          <div style={{ flex: '1 1 560px' }}>
            <div style={edStyles.kicker}>{featured.housing.kicker}</div>
            <h1 style={edStyles.h1}>{featured.housing.title}</h1>
            <p style={edStyles.dek}>{featured.housing.dek}</p>
            <div style={edStyles.meta}>
              <span>읽기 {featured.housing.readTime}</span>
              <span style={edStyles.dot}>·</span>
              <span>{featured.housing.updated}</span>
              <span style={edStyles.dot}>·</span>
              <span>검증: Seattle WA 거주 10년차 3명</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button style={edStyles.primaryBtn}>가이드 읽기 →</button>
              <button style={edStyles.ghostBtn}>나중에 저장</button>
            </div>
          </div>
          <div style={edStyles.heroArt}>
            <div style={edStyles.heroArtInner}>
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, rgba(58,107,138,0.08) 0 2px, transparent 2px 14px)' }} />
              <div style={{ position: 'absolute', left: 28, top: 28, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10.5, color: '#3a6b8a', letterSpacing: 0.8 }}>
                FIG. 01 — AREA MAP / SEATTLE
              </div>
              {/* simple topo */}
              <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 400 300" preserveAspectRatio="none">
                <path d="M0 180 Q 80 140 160 170 T 320 150 T 420 180" fill="none" stroke="#3a6b8a" strokeWidth="1.1" opacity="0.45"/>
                <path d="M0 200 Q 80 165 160 190 T 320 175 T 420 200" fill="none" stroke="#3a6b8a" strokeWidth="1.1" opacity="0.35"/>
                <path d="M0 225 Q 80 195 160 215 T 320 200 T 420 225" fill="none" stroke="#3a6b8a" strokeWidth="1.1" opacity="0.25"/>
                <circle cx="160" cy="175" r="4" fill="#c2503a"/>
                <text x="170" y="170" fontSize="9" fill="#1a2a3a" fontFamily="JetBrains Mono, monospace">Ballard</text>
                <circle cx="240" cy="155" r="4" fill="#c2503a"/>
                <text x="250" y="150" fontSize="9" fill="#1a2a3a" fontFamily="JetBrains Mono, monospace">Capitol Hill</text>
                <circle cx="200" cy="195" r="4" fill="#c2503a"/>
                <text x="210" y="208" fontSize="9" fill="#1a2a3a" fontFamily="JetBrains Mono, monospace">Downtown</text>
              </svg>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10, color: '#6a7888', marginTop: 10, letterSpacing: 0.4 }}>
              ▲ 동네별 렌트 중간값, 통근시간, 학군 점수 비교 →
            </div>
          </div>
        </div>
      </section>

      {/* Category rail */}
      <section style={edStyles.catRail}>
        <div style={edStyles.catInner}>
          <div style={edStyles.catLabel}>챕터</div>
          <div style={edStyles.catList}>
            {categories.map(c => (
              <button key={c.id} onClick={() => setTab(c.id)}
                style={{ ...edStyles.catChip, ...(tab === c.id ? edStyles.catChipActive : {}) }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500 }}>{c.ko}</span>
                <span style={edStyles.catEn}>{c.en}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section style={edStyles.articles}>
        <div style={edStyles.articlesInner}>
          <div style={edStyles.sectionHead}>
            <div>
              <h2 style={edStyles.h2}>최근 업데이트된 가이드</h2>
              <p style={edStyles.sectionDek}>시애틀 한인 기여자 24명이 작성하고 상호 검증합니다.</p>
            </div>
            <a style={edStyles.seeAll}>전체 보기 →</a>
          </div>
          <div style={edStyles.grid}>
            {articles.map((a, i) => (
              <article key={a.id} style={{ ...edStyles.card, ...(i === 0 ? edStyles.cardWide : {}) }}>
                <div style={edStyles.cardTop}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={edStyles.cardCat}>{a.cat}</span>
                    {a.tag && <span style={{ ...edStyles.cardTag, ...(a.tag === '필수' ? { background: '#c2503a', color: '#fff' } : {}) }}>{a.tag}</span>}
                  </div>
                  <button onClick={() => toggleSave(a.id)} style={edStyles.saveBtn}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill={savedItems.has(a.id) ? '#c2503a' : 'none'} stroke={savedItems.has(a.id) ? '#c2503a' : '#6a7888'} strokeWidth="1.5">
                      <path d="M3 2h8v11l-4-2.5L3 13V2z"/>
                    </svg>
                  </button>
                </div>
                <h3 style={{ ...edStyles.cardTitle, ...(i === 0 ? { fontSize: 24 } : {}) }}>{a.title}</h3>
                <div style={edStyles.cardFoot}>
                  <span>{a.author}</span>
                  <span style={edStyles.dot}>·</span>
                  <span>{a.time}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist CTA */}
      <section style={edStyles.checklistSec}>
        <div style={edStyles.checklistInner}>
          <div style={{ flex: 1 }}>
            <div style={{ ...edStyles.kicker, color: '#d9c0a3' }}>개인 체크리스트</div>
            <h2 style={{ ...edStyles.h2, color: '#faf7f2', marginTop: 12 }}>도착 D-30일부터,<br/>정착 완료까지 한 눈에.</h2>
            <p style={{ color: 'rgba(250,247,242,0.75)', fontSize: 16, lineHeight: 1.6, maxWidth: 460, marginTop: 14 }}>
              SSN 신청 · 렌트 계약 · 운전면허 · 인터넷 · 공과금 · 병원 등록 — 42개 항목을 순서대로 안내합니다.
            </p>
            <button style={{ ...edStyles.primaryBtn, background: '#faf7f2', color: '#1a2a3a', marginTop: 22 }}>내 체크리스트 만들기 →</button>
          </div>
          <div style={edStyles.checklistCard}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6a7888', letterSpacing: 1 }}>MY CHECKLIST · 68%</div>
            <div style={{ height: 6, background: '#e8e3dc', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', background: '#c2503a' }} />
            </div>
            {[
              { t: 'SSN 카드 수령', done: true },
              { t: '아파트 계약 · 보증금 납부', done: true },
              { t: 'WA 운전면허 · 지식시험', done: true },
              { t: '병원 PCP 등록', done: false },
              { t: '자녀 학교 등록 서류', done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 4 ? '1px solid #ece7df' : 'none' }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, border: '1.5px solid ' + (item.done ? '#c2503a' : '#c9c1b3'), background: item.done ? '#c2503a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.done && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7L8 1.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                </div>
                <span style={{ fontSize: 14, color: item.done ? '#9aa0a8' : '#1a2a3a', textDecoration: item.done ? 'line-through' : 'none' }}>{item.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={edStyles.footer}>
        <div style={edStyles.footerInner}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: '#1a2a3a' }}>HebronGuide</div>
          <div style={{ fontSize: 13, color: '#6a7888' }}>시애틀 한인 정착 저널 · 24명의 기여자가 함께 씁니다 · © 2026</div>
        </div>
      </footer>
    </div>
  );
}

const edStyles = {
  root: { fontFamily: '"Noto Sans KR", -apple-system, sans-serif', background: '#faf7f2', color: '#1a2a3a', minHeight: '100%' },
  header: { borderBottom: '1px solid #ece7df', background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 },
  headerInner: { maxWidth: 1200, margin: '0 auto', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 40 },
  mark: { width: 34, height: 34, borderRadius: 2, background: '#faf7f2', border: '1.5px solid #1a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nav: { display: 'flex', gap: 28, flex: 1 },
  navLink: { fontSize: 14, color: '#3a4a5a', cursor: 'pointer', fontWeight: 500 },
  searchBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #ece7df', borderRadius: 2, background: '#faf7f2', fontSize: 13, color: '#6a7888', cursor: 'pointer' },
  kbd: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '2px 5px', background: '#ece7df', borderRadius: 2, color: '#6a7888' },
  loginBtn: { padding: '8px 16px', background: '#1a2a3a', color: '#faf7f2', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  hero: { padding: '80px 40px 60px' },
  heroInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' },
  kicker: { fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 11, letterSpacing: 2, color: '#c2503a', textTransform: 'uppercase', marginBottom: 20 },
  h1: { fontFamily: 'Fraunces, Georgia, serif', fontSize: 56, fontWeight: 400, lineHeight: 1.05, letterSpacing: -1.2, margin: 0, color: '#1a2a3a', whiteSpace: 'pre-line', textWrap: 'balance' },
  dek: { fontSize: 18, lineHeight: 1.6, color: '#3a4a5a', marginTop: 24, maxWidth: 520 },
  meta: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#6a7888', marginTop: 22 },
  dot: { color: '#c9c1b3' },
  primaryBtn: { padding: '14px 24px', background: '#1a2a3a', color: '#faf7f2', border: 'none', borderRadius: 2, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  ghostBtn: { padding: '14px 24px', background: 'transparent', color: '#1a2a3a', border: '1px solid #1a2a3a', borderRadius: 2, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  heroArt: { flex: '1 1 400px', minWidth: 400 },
  heroArtInner: { position: 'relative', height: 320, background: '#f3efe7', border: '1px solid #ece7df', overflow: 'hidden' },
  catRail: { borderTop: '1px solid #ece7df', borderBottom: '1px solid #ece7df', background: '#f3efe7' },
  catInner: { maxWidth: 1200, margin: '0 auto', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 20 },
  catLabel: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 2, color: '#6a7888', textTransform: 'uppercase' },
  catList: { display: 'flex', gap: 8, flex: 1, overflow: 'hidden' },
  catChip: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'transparent', border: '1px solid transparent', borderRadius: 2, cursor: 'pointer', fontSize: 14, color: '#3a4a5a', transition: 'all .15s' },
  catChipActive: { background: '#faf7f2', border: '1px solid #1a2a3a', color: '#1a2a3a' },
  catEn: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9aa0a8', letterSpacing: 0.5 },
  articles: { padding: '80px 40px' },
  articlesInner: { maxWidth: 1200, margin: '0 auto' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 },
  h2: { fontFamily: 'Fraunces, Georgia, serif', fontSize: 38, fontWeight: 400, letterSpacing: -0.8, margin: 0, lineHeight: 1.15 },
  sectionDek: { fontSize: 15, color: '#6a7888', marginTop: 10 },
  seeAll: { fontSize: 14, color: '#c2503a', cursor: 'pointer', fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#ece7df', border: '1px solid #ece7df' },
  card: { background: '#faf7f2', padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20, cursor: 'pointer', transition: 'background .15s', minHeight: 210 },
  cardWide: { gridColumn: 'span 2', background: '#f3efe7', minHeight: 260 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardCat: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, letterSpacing: 1.2, color: '#6a7888', textTransform: 'uppercase' },
  cardTag: { fontSize: 10.5, padding: '3px 8px', background: '#ece7df', color: '#3a4a5a', borderRadius: 2, fontWeight: 500, letterSpacing: 0.4 },
  saveBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 },
  cardTitle: { fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.3, margin: 0, flex: 1, color: '#1a2a3a' },
  cardFoot: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#6a7888' },
  checklistSec: { background: '#1a2a3a', padding: '80px 40px' },
  checklistInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' },
  checklistCard: { flex: '1 1 380px', minWidth: 360, background: '#faf7f2', padding: 28, borderRadius: 2 },
  footer: { borderTop: '1px solid #ece7df', padding: '32px 40px' },
  footerInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
};

window.EditorialVariant = EditorialVariant;

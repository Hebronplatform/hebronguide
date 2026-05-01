// Variant C — Modern Utility
// Dashboard-style. Search-first, checklist progress, data-forward.
// Dark UI option with clean neutrals + a single accent.

function UtilityVariant() {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [dark, setDark] = React.useState(false);

  const c = dark ? utilPalette.dark : utilPalette.light;

  const categories = [
    { id: 'all', label: '전체', count: 142 },
    { id: 'housing', label: '주거', count: 28 },
    { id: 'docs', label: '서류·신분', count: 34 },
    { id: 'car', label: '차·면허', count: 19 },
    { id: 'health', label: '의료', count: 16 },
    { id: 'kids', label: '학교·육아', count: 22 },
    { id: 'money', label: '금융·세금', count: 23 },
  ];

  const quickActions = [
    { icon: '⬡', label: 'SSN 예약', desc: 'ssa.gov 바로가기', hot: true },
    { icon: '⬢', label: 'DOL 예약', desc: '면허시험 슬롯 확인', hot: false },
    { icon: '◈', label: '렌트 계산기', desc: '월급 기준 적정 렌트', hot: false },
    { icon: '◉', label: '학교 조회', desc: '주소→배정학교 검색', hot: false },
  ];

  const results = [
    { cat: '서류', title: 'SSN 신청, 도착 후 며칠 뒤가 최적인가?', answer: '도착 후 10일 이후 방문 권장', updated: '2일 전', votes: 340 },
    { cat: '주거', title: '월세 계약서에서 반드시 협상할 조항 5가지', answer: 'pet deposit, late fee, renewal terms...', updated: '1주 전', votes: 218 },
    { cat: '차', title: 'Costco에서 차 구입 시 주의할 점', answer: 'Auto program 견적 + 딜러 가격 비교', updated: '3일 전', votes: 156 },
    { cat: '의료', title: 'ER 비용 청구서, 받았을 때 해야 할 것', answer: '청구서 항목 확인 → itemized bill 요청 → negotiation', updated: '5일 전', votes: 412 },
  ];

  return (
    <div style={{ ...utilStyles.root, background: c.bg, color: c.text }}>
      {/* Sidebar */}
      <aside style={{ ...utilStyles.sidebar, background: c.panel, borderRight: `1px solid ${c.line}` }}>
        <div style={utilStyles.brand}>
          <div style={{ ...utilStyles.brandMark, background: c.accent }}>HG</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, letterSpacing: -0.2 }}>HebronGuide</div>
            <div style={{ fontSize: 11, color: c.muted, marginTop: -1 }}>Seattle · v2.4</div>
          </div>
        </div>

        <div style={utilStyles.sideSection}>
          <div style={{ ...utilStyles.sideLabel, color: c.muted }}>탐색</div>
          {[
            { icon: '◐', label: '대시보드', active: true },
            { icon: '◌', label: '가이드 전체' },
            { icon: '◎', label: '내 체크리스트' },
            { icon: '◍', label: '지도 뷰' },
            { icon: '◉', label: '커뮤니티 Q&A' },
          ].map((item, i) => (
            <button key={i} style={{ ...utilStyles.sideItem, ...(item.active ? { background: c.accent, color: dark ? '#0a0a0b' : '#fff' } : { color: c.text }) }}>
              <span style={{ width: 16, fontSize: 13 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={utilStyles.sideSection}>
          <div style={{ ...utilStyles.sideLabel, color: c.muted }}>내 여정</div>
          <div style={{ padding: '12px 14px', background: c.panelDeep, borderRadius: 8, border: `1px solid ${c.line}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: c.muted, letterSpacing: 1, textTransform: 'uppercase' }}>진행률</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: c.text, fontVariantNumeric: 'tabular-nums' }}>68<span style={{ fontSize: 12, color: c.muted }}>%</span></span>
            </div>
            <div style={{ height: 4, background: c.line, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', background: c.accent }} />
            </div>
            <div style={{ fontSize: 11, color: c.muted, marginTop: 8 }}>다음: 병원 PCP 등록</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: 14, borderTop: `1px solid ${c.line}` }}>
          <button onClick={() => setDark(!dark)} style={{ ...utilStyles.sideItem, width: '100%', color: c.text }}>
            <span style={{ width: 16, fontSize: 13 }}>{dark ? '☀' : '☾'}</span>
            <span>{dark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={utilStyles.main}>
        {/* Top bar */}
        <div style={{ ...utilStyles.topbar, borderBottom: `1px solid ${c.line}` }}>
          <div style={{ fontSize: 12, color: c.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: c.text }}>대시보드</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ ...utilStyles.iconBtn, color: c.text, borderColor: c.line }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1v3M7 10v3M1 7h3M10 7h3M2.5 2.5l2 2M9.5 9.5l2 2M2.5 11.5l2-2M9.5 4.5l2-2"/></svg>
            </button>
            <button style={{ ...utilStyles.iconBtn, color: c.text, borderColor: c.line }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5A4 4 0 1 0 3 5v3l-1 2h10l-1-2V5zM5 12a2 2 0 0 0 4 0"/></svg>
              <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, background: c.accent }} />
            </button>
            <div style={{ width: 30, height: 30, borderRadius: 15, background: c.accent, color: dark ? '#0a0a0b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>김</div>
          </div>
        </div>

        <div style={utilStyles.content}>
          {/* Greeting */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: c.muted, letterSpacing: 0.5, fontFamily: 'JetBrains Mono, monospace' }}>SEATTLE · 52°F · 이슬비</div>
            <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.8, margin: '6px 0 0', color: c.text }}>
              안녕하세요, 김정착님.
            </h1>
            <p style={{ fontSize: 15, color: c.muted, margin: '8px 0 0' }}>
              정착 72일차 · 오늘 할 일 <span style={{ color: c.accent, fontWeight: 600 }}>3개</span> · 이번주 가이드 업데이트 <span style={{ color: c.text, fontWeight: 600 }}>8개</span>
            </p>
          </div>

          {/* Search */}
          <div style={{ ...utilStyles.searchBox, background: c.panel, border: `1px solid ${c.line}` }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={c.muted} strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l4 4"/></svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="SSN, 렌트, 면허시험, 학교 배정... 무엇이든"
              style={{ ...utilStyles.searchInput, color: c.text }} />
            <kbd style={{ ...utilStyles.kbd, background: c.panelDeep, color: c.muted, border: `1px solid ${c.line}` }}>/</kbd>
          </div>

          {/* Quick actions */}
          <div style={utilStyles.quickGrid}>
            {quickActions.map((q, i) => (
              <button key={i} style={{ ...utilStyles.quickCard, background: c.panel, border: `1px solid ${c.line}`, color: c.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: c.panelDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: c.accent }}>{q.icon}</div>
                  {q.hot && <span style={{ fontSize: 10, padding: '2px 6px', background: c.accent, color: dark ? '#0a0a0b' : '#fff', borderRadius: 3, fontWeight: 600, letterSpacing: 0.3 }}>NEW</span>}
                </div>
                <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: c.text }}>{q.label}</div>
                <div style={{ fontSize: 12, color: c.muted, marginTop: 3 }}>{q.desc}</div>
              </button>
            ))}
          </div>

          {/* Filter + results */}
          <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.text, margin: 0, letterSpacing: -0.2 }}>답변이 필요한 질문들</h2>
              <div style={{ fontSize: 12, color: c.muted }}>정렬: 도움됨 순 ↓</div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setFilter(cat.id)}
                  style={{ ...utilStyles.filterChip, ...(filter === cat.id ? { background: c.text, color: c.bg, borderColor: c.text } : { color: c.text, borderColor: c.line, background: 'transparent' }) }}>
                  {cat.label}
                  <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 6, fontVariantNumeric: 'tabular-nums' }}>{cat.count}</span>
                </button>
              ))}
            </div>

            <div style={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, overflow: 'hidden' }}>
              {results.map((r, i) => (
                <div key={i} style={{ padding: '18px 20px', borderBottom: i < results.length - 1 ? `1px solid ${c.line}` : 'none', display: 'flex', gap: 18, alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ flex: '0 0 60px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: c.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>{r.votes}</div>
                    <div style={{ fontSize: 10, color: c.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>도움됨</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: c.accent, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.5 }}>{r.cat.toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: c.muted }}>· {r.updated}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: c.text, letterSpacing: -0.1 }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: c.muted, marginTop: 4 }}>{r.answer}</div>
                  </div>
                  <div style={{ color: c.muted }}>→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const utilPalette = {
  light: { bg: '#fafaf9', panel: '#ffffff', panelDeep: '#f5f4f2', text: '#15171a', muted: '#8a8f96', line: '#eceae5', accent: '#2d6a4f' },
  dark:  { bg: '#0b0c0e', panel: '#131519', panelDeep: '#0f1114', text: '#f0efed', muted: '#8a8f96', line: '#22252b', accent: '#5ec08f' },
};

const utilStyles = {
  root: { fontFamily: '"Inter", "Noto Sans KR", -apple-system, sans-serif', minHeight: '100%', display: 'flex' },
  sidebar: { width: 240, flex: '0 0 240px', display: 'flex', flexDirection: 'column', padding: 18 },
  brand: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 18px' },
  brandMark: { width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: 0.5 },
  sideSection: { marginBottom: 20 },
  sideLabel: { fontSize: 10.5, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, padding: '0 8px', fontWeight: 600 },
  sideItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: 'none', background: 'transparent', borderRadius: 7, width: '100%', textAlign: 'left', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: { padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { position: 'relative', width: 32, height: 32, borderRadius: 7, border: '1px solid', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  content: { padding: '32px', flex: 1, maxWidth: 1100 },
  searchBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 10, marginBottom: 24 },
  searchInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, fontFamily: 'inherit' },
  kbd: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '3px 7px', borderRadius: 4 },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  quickCard: { padding: 18, borderRadius: 10, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'transform .1s' },
  filterChip: { padding: '6px 12px', borderRadius: 18, border: '1px solid', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s' },
};

window.UtilityVariant = UtilityVariant;

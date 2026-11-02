// 2026-11-02 보관 — 부르는 곳이 0곳이던 화면 조각 14개 (설계도 ⑦-1).
// 되살리려면 이 파일에서 함수를 HebronGuide.tsx로 다시 옮긴다.

// ===== buildNewMemberHref (원래 HebronGuide.tsx 57-96행) =====
/**
 * 새가족 신청 URL 빌더 — HebronGuide → HebronWorship 브리지.
 *
 * 기본: 정적 `/new-member.html` (mailto 방식, 현재 라이브)
 * Worship 배포 후: `VITE_WORSHIP_BRIDGE_URL` env 설정 시 그쪽으로 라우팅.
 *   예) VITE_WORSHIP_BRIDGE_URL=https://worship.hebronguide.com/new-members/register
 *
 * 경로의 첫 segment(seattle/dallas 등)를 city로 자동 전달.
 */
function buildNewMemberHref(opts: {
  churchName: string
  churchEmail?: string
  churchWebsite?: string
  churchId?: string
  lang: string
}) {
  const env = (import.meta as any).env ?? {}
  const worshipUrl: string | undefined = env.VITE_WORSHIP_BRIDGE_URL
  const city = typeof location !== "undefined"
    ? (location.pathname.split("/").filter(Boolean)[0] || "")
    : ""

  if (worshipUrl) {
    const u = new URL(worshipUrl)
    if (opts.churchId)   u.searchParams.set("church_id", opts.churchId)
    u.searchParams.set("church", opts.churchName)
    u.searchParams.set("lang",   opts.lang)
    if (city) u.searchParams.set("city", city)
    return u.toString()
  }

  // Fallback: 기존 정적 mailto 폼
  const params = new URLSearchParams({
    church:  opts.churchName,
    email:   opts.churchEmail ?? "",
    website: opts.churchWebsite ?? "",
    lang:    opts.lang,
  })
  return `/new-member.html?${params.toString()}`
}

// ===== HebronServicesAd (원래 HebronGuide.tsx 9582-9746행) =====
function HebronServicesAd({ lang, onNavigate }: { lang: string; onNavigate?: (tab: number, subTab?: number) => void }) {
  const ko = lang === "ko";
  // 커미션·퍼센트 표현 없음 — 내부 파트너십 (사용자에게 비노출)
  // 목적: 관계를 통해 자연스럽게 교회로 연결
  const SERVICES = [
    {
      icon: "🚗", color: "#3B82F6",
      nameKo: "헤브론 라이드", nameEn: "Hebron Ride",
      tagKo: "공항 픽업 · 일상 이동", tagEn: "Airport · Daily Rides",
      userKo: "한국어로 맞이하는 첫 이동", userEn: "Your first ride, in Korean",
      providerKo: "운전하며 섬기실 분 → 함께해요", providerEn: "Drive & serve → join us",
      tab: 1, subTab: 0,
    },
    {
      icon: "🏠", color: "#10B981",
      nameKo: "헤브론 스테이", nameEn: "Hebron Stay",
      tagKo: "단기 숙박 · 정착 동반", tagEn: "Short-term · Walk Together",
      userKo: "한인 가정에서 시작하는 정착", userEn: "Begin your new life in a Korean home",
      providerKo: "방을 나눠 섬기실 분 → 함께해요", providerEn: "Share your home → join us",
      tab: 1, subTab: 5,
    },
    {
      icon: "📚", color: "#8B5CF6",
      nameKo: "헤브론 튜터", nameEn: "Hebron Tutor",
      tagKo: "수학 · SAT · 한국어", tagEn: "Math · SAT · Korean",
      userKo: "한인 선배가 직접 가르칩니다", userEn: "Learn from Korean community mentors",
      providerKo: "가르치며 섬기실 분 → 함께해요", providerEn: "Teach & serve → join us",
      tab: 7, subTab: 0,
    },
    {
      icon: "🤝", color: "#F59E0B",
      nameKo: "헤브론 커넥트", nameEn: "Hebron Connect",
      tagKo: "친구 · 멘토 · 동행 파트너", tagEn: "Friends · Mentors · Partners",
      userKo: "81개 도시 한인을 만납니다", userEn: "Meet Koreans across 81 cities",
      providerKo: "멘토로 섬기실 분 → 함께해요", providerEn: "Mentor & serve → join us",
      tab: 5, subTab: 2,
    },
    {
      icon: "💍", color: "#EC4899",
      nameKo: "헤브론 매칭", nameEn: "Hebron Match",
      tagKo: "진지하고 따뜻한 만남", tagEn: "Thoughtful & Warm Connection",
      userKo: "같은 가치관의 사람을 만나고 싶으세요?", userEn: "Looking to meet someone who shares your values?",
      providerKo: "신중하게, 진심으로 연결합니다", providerEn: "Carefully and sincerely matched",
      tab: 2, subTab: 4,
    },
    {
      icon: "🧭", color: "#06B6D4",
      nameKo: "헤브론 관광", nameEn: "Hebron Tour",
      tagKo: "현지 한인이 직접 안내", tagEn: "Guided by Locals Who Lived Here",
      userKo: "관광안내소엔 없는 진짜 이야기", userEn: "Real stories you won't find in tourist guides",
      providerKo: "이 도시를 안내하고 싶으신 분 → 함께해요", providerEn: "Know this city well? → Join us",
      tab: 4, subTab: 4,
    },
    {
      icon: "🏘️", color: "#2563EB",
      nameKo: "헤브론 홈", nameEn: "Hebron Home",
      tagKo: "부동산 · 렌트 · 정착 패키지", tagEn: "Realty · Rentals · Settlement",
      userKo: "검증된 한인 라이선스 에이전트로 안내", userEn: "Korean-friendly licensed realtor matching",
      providerKo: "에이전트·브로커 → 함께해요", providerEn: "Licensed agent & broker → join us",
      tab: 1, subTab: 5,
    },
  ];

  return (
    <div style={{ padding: "20px 16px 16px", background: "var(--color-surface)" }}>
      {/* 섹션 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 15, color: "var(--color-text-primary)", letterSpacing: "-0.3px" }}>
            🔗 {ko ? "헤브론 연결 서비스" : "Hebron Connect Services"}
          </div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, color: "var(--color-text-primary)", marginTop: 2 }}>
            {ko ? "사람이 사람을 돕습니다. 필요한 곳에 먼저 손을 내미는 것입니다." : "People helping people — reaching out to those who need it first."}
          </div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10, color: "var(--color-success)", marginTop: 6, fontWeight: 700, letterSpacing: "-0.1px" }}>
            🛡️ {ko
              ? "신청 → 문서 확인 → 신원조회 후 연결 — 확인된 제공자만 매칭됩니다"
              : "Apply → Document Check → Background Check → Connect — verified providers only"}
          </div>
        </div>
        <button
          onClick={() => { window.open('/ad-request.html', '_blank'); }}
          style={{ background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.4)", color: "#8A6A12", borderRadius: 20, padding: "5px 12px", fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
          {ko ? "서비스 올리기 →" : "List Service →"}
        </button>
      </div>

      {/* 서비스 카드 가로 스크롤 */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {SERVICES.map((svc, i) => (
          <div key={i}
            onClick={() => onNavigate?.(svc.tab, svc.subTab)}
            style={{ flexShrink: 0, width: 200, scrollSnapAlign: "start", cursor: "pointer" }}>
            <div style={{
              background: `linear-gradient(160deg, ${svc.color}20, ${svc.color}08)`,
              border: `1px solid ${svc.color}45`,
              borderRadius: 16, padding: "16px 14px",
              height: "100%",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = `${svc.color}80`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.borderColor = `${svc.color}45`; }}>

              {/* 아이콘 + 이름 */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{svc.icon}</span>
                <div>
                  <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 13, color: "var(--color-text-primary)" }}>
                    {ko ? svc.nameKo : svc.nameEn}
                  </div>
                  <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10, color: svc.color, fontWeight: 600, marginTop: 1 }}>
                    {ko ? svc.tagKo : svc.tagEn}
                  </div>
                </div>
              </div>

              {/* 구분선 */}
              <div style={{ height: 1, background: `${svc.color}25`, marginBottom: 10 }} />

              {/* 사용자 / 제공자 */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10, color: "var(--color-text-muted)", marginBottom: 3, letterSpacing: "0.3px" }}>
                  {ko ? "필요하신 분" : "USERS"}
                </div>
                <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.4 }}>
                  {ko ? svc.userKo : svc.userEn}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10, color: "var(--color-text-muted)", marginBottom: 3, letterSpacing: "0.3px" }}>
                  {ko ? "제공하실 분" : "PROVIDERS"}
                </div>
                <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, fontWeight: 700, color: svc.color, lineHeight: 1.4 }}>
                  {ko ? svc.providerKo : svc.providerEn}
                </div>
              </div>

              {/* CTA */}
              <div style={{ marginTop: 12, background: `${svc.color}18`, borderRadius: 8, padding: "7px 10px", textAlign: "center" }}>
                <span style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 11, color: svc.color }}>
                  {ko ? "자세히 보기 →" : "Learn More →"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 파트너십 메시지 */}
      <div style={{ marginTop: 12, background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <Handshake size={14} strokeWidth={2} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 11, color: "#8A6A12" }}>
            {ko ? "모두가 행복한 파트너십" : "A Partnership Where Everyone Wins"}
          </div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10, color: "var(--color-text-primary)", marginTop: 2, lineHeight: 1.5 }}>
            {ko
              ? "신뢰와 진정성으로 개인과 커뮤니티가 함께 성장합니다."
              : "Trust and authenticity help individuals and communities grow together."}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== CityEventsSection (원래 HebronGuide.tsx 11026-11188행) =====
function CityEventsSection({ lang }: { lang: string }) {
  const ko = lang === "ko";
  const city = useCityConfig();
  const events = getCityEvents(city.slug);
  const [selected, setSelected] = useState<CityEventItem | null>(null);
  if (!events.length) return null;

  const typeColor: Record<string, string> = {
    sports: "#F97316", festival: "#8B5CF6", holiday: "#EF4444",
    culture: "#06B6D4", church: "#10B981", alert: "#F59E0B",
  };
  const typeLabel: Record<string, { ko: string; en: string }> = {
    sports:  { ko:"스포츠",   en:"Sports"   },
    festival:{ ko:"축제",     en:"Festival" },
    holiday: { ko:"공휴일",   en:"Holiday"  },
    culture: { ko:"문화",     en:"Culture"  },
    church:  { ko:"교회",     en:"Church"   },
    alert:   { ko:"알림",     en:"Alert"    },
  };

  return (
    <>
    <div style={{ margin: "8px 16px 0" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div style={{ fontFamily:"Geist,Pretendard Variable,sans-serif", fontWeight:800, fontSize:12, color:"rgba(0,0,0,0.5)", letterSpacing:"0.06em", textTransform:"uppercase" }}>
          📅 {ko ? `${city.nameKo} 주요 이벤트` : `${city.nameEn} Upcoming Events`}
        </div>
        <div style={{ fontFamily:"Geist,Pretendard Variable,sans-serif", fontSize:10, color:"rgba(0,0,0,0.35)" }}>
          {ko ? "탭해서 상세 보기" : "Tap for details"}
        </div>
      </div>
      {/* 가로 스크롤 이벤트 카드 */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
        {events.map((ev, i) => (
          <div key={i}
            onClick={() => setSelected(ev)}
            style={{
              flexShrink:0, background:"#fff",
              borderRadius:12, padding:"8px 12px",
              boxShadow:"0 1px 6px rgba(0,0,0,0.07)",
              borderLeft:`3px solid ${typeColor[ev.type] || "#94A3B8"}`,
              maxWidth:200, minWidth:150,
              cursor:"pointer",
              transition:"transform 0.12s, box-shadow 0.12s",
              WebkitTapHighlightColor:"transparent",
            }}
            onTouchStart={e => (e.currentTarget.style.transform = "scale(0.97)")}
            onTouchEnd={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontFamily:"Geist,Pretendard Variable,sans-serif", fontSize:11.5, fontWeight:700, color:"#1B2A4A", lineHeight:1.4 }}>
              <EmojiIcon emoji={ev.emoji} size={15} /> {ko ? ev.ko : ev.en}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
              <div style={{ fontFamily:"Geist,Pretendard Variable,sans-serif", fontSize:9.5, color:"rgba(0,0,0,0.38)" }}>{ev.date}</div>
              {(ev.url || ev.address) && (
                <div style={{ fontFamily:"Geist,Pretendard Variable,sans-serif", fontSize:9, background:`${typeColor[ev.type]}22`, color:typeColor[ev.type], borderRadius:4, padding:"1px 5px", fontWeight:700 }}>
                  {ko ? "상세 →" : "Info →"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ── 이벤트 상세 모달 ── */}
    {selected && (
      <div
        onClick={() => setSelected(null)}
        style={{
          position:"fixed", inset:0, zIndex:500,
          background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"flex-end", justifyContent:"center",
          padding:"0 0 calc(env(safe-area-inset-bottom,0px) + 16px)",
          animation:"fadeIn 0.18s ease",
        }}>
        <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp2{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background:"#fff", borderRadius:"20px 20px 16px 16px",
            width:"100%", maxWidth:480, padding:"20px 20px 24px",
            boxShadow:"0 -4px 40px rgba(0,0,0,0.18)",
            animation:"slideUp2 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
          {/* 핸들 바 */}
          <div style={{ width:36, height:4, background:"#E2E8F0", borderRadius:2, margin:"0 auto 16px" }} />

          {/* 이벤트 타입 배지 */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ background:`${typeColor[selected.type]}18`, color:typeColor[selected.type], borderRadius:8, padding:"3px 10px", fontFamily:"Geist,Pretendard Variable,sans-serif", fontWeight:800, fontSize:11 }}>
              {(typeLabel[selected.type]?.[ko ? "ko" : "en"]) ?? selected.type}
            </span>
            <span style={{ fontFamily:"Geist,Pretendard Variable,sans-serif", fontSize:11, color:"rgba(0,0,0,0.4)" }}>{selected.date}</span>
          </div>

          {/* 이벤트 제목 */}
          <div style={{ fontFamily:"Geist,Pretendard Variable,sans-serif", fontWeight:800, fontSize:15, color:"#1B2A4A", lineHeight:1.5, marginBottom:10 }}>
            <EmojiIcon emoji={selected.emoji} size={16} /> {ko ? selected.ko : selected.en}
          </div>

          {/* 장소 */}
          {selected.address && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:14, flexShrink:0 }}>📍</span>
              <div style={{ fontFamily:"Geist,Pretendard Variable,sans-serif", fontSize:12, color:"rgba(0,0,0,0.6)", lineHeight:1.5 }}>
                {selected.address}
              </div>
            </div>
          )}

          {/* 버튼 행 */}
          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            {selected.url && (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex:1, textDecoration:"none" }}>
                <div style={{
                  background: typeColor[selected.type] || "#1B2A4A",
                  borderRadius:12, padding:"12px 0",
                  fontFamily:"Geist,Pretendard Variable,sans-serif", fontWeight:800, fontSize:13,
                  color:"#fff", textAlign:"center",
                }}>
                  🔗 {ko ? "공식 사이트 바로가기" : "Official Website"}
                </div>
              </a>
            )}
            {selected.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: selected.url ? "0 0 auto" : 1, textDecoration:"none" }}>
                <div style={{
                  background:"#F1F5F9", borderRadius:12, padding:"12px 16px",
                  fontFamily:"Geist,Pretendard Variable,sans-serif", fontWeight:700, fontSize:13,
                  color:"#1B2A4A", textAlign:"center", whiteSpace:"nowrap",
                }}>
                  🗺️ {ko ? "지도" : "Map"}
                </div>
              </a>
            )}
            {!selected.url && !selected.address && (
              <div style={{ flex:1, background:"#F1F5F9", borderRadius:12, padding:"12px 0", fontFamily:"Geist,Pretendard Variable,sans-serif", fontSize:12, color:"rgba(0,0,0,0.4)", textAlign:"center" }}>
                {ko ? "상세 정보 업데이트 예정" : "Details coming soon"}
              </div>
            )}
          </div>

          {/* 닫기 */}
          <button
            onClick={() => setSelected(null)}
            style={{ width:"100%", marginTop:10, background:"transparent", border:"none", fontFamily:"Geist,Pretendard Variable,sans-serif", fontSize:13, color:"rgba(0,0,0,0.4)", cursor:"pointer", padding:"6px 0" }}>
            {ko ? "닫기" : "Close"}
          </button>
        </div>
      </div>
    )}
    </>
  );
}

// ===== DailyQuoteSection (원래 HebronGuide.tsx 11190-11251행) =====
function DailyQuoteSection({ lang }: { lang: string }) {
  const ko = lang === "ko";
  // 날짜 기반 로테이션 — 매일 다른 구절, 하루 종일 동일
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  const today = new Date();
  const dateStr = ko
    ? `${today.getMonth() + 1}월 ${today.getDate()}일`
    : `${today.toLocaleString("en", { month: "short" })} ${today.getDate()}`;

  return (
    <div style={{ margin: "12px 16px 0" }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        borderLeft: `4px solid ${quote.type === "scripture" ? "#6EE7B7" : quote.type === "service" ? "#C9A227" : "#94A3B8"}`,
      }}>
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 15 }}>
              {quote.type === "scripture" ? "✦" : quote.type === "service" ? "🌿" : "💡"}
            </span>
            <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 12, color: "#1B2A4A" }}>
              {ko ? "오늘의 한 줄" : "Today's Word"}
            </div>
          </div>
          <div style={{ fontSize: 10, fontFamily: "Geist,Pretendard Variable,sans-serif", color: "#CBD5E1" }}>
            {dateStr}
          </div>
        </div>

        {/* 구절 */}
        <div style={{
          fontFamily: "'Pretendard Variable', -apple-system, Georgia, serif",
          fontSize: 15,
          fontWeight: 600,
          color: "#1B2A4A",
          lineHeight: 1.75,
          letterSpacing: "-0.2px",
          marginBottom: 10,
        }}>
          {ko ? quote.ko : quote.en}
        </div>

        {/* 출처 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 18, height: 1,
            background: quote.type === "scripture" ? "#6EE7B7" : quote.type === "service" ? "#C9A227" : "#CBD5E1",
          }} />
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600 }}>
            {ko ? quote.source : quote.sourceEn}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== CommunityPulseSection (원래 HebronGuide.tsx 11257-11349행) =====
function CommunityPulseSection({ lang }: { lang: string }) {
  const ko = lang === "ko";
  const city = useCityConfig();
  const cityKo = city.nameKo || "이 도시";
  const cityEn = city.nameEn || "this city";

  const ALL_PULSE = useMemo(() => [
    { emoji: "⛪", ko: `${cityKo} 한인 교회 정보가 업데이트됐어요`, en: `Korean church info updated in ${cityEn}`, time: ko ? "방금" : "just now" },
    { emoji: "🍽️", ko: `${cityKo} 한식당 TOP 10 새로 큐레이션됐어요`, en: `Korean restaurant TOP 10 curated in ${cityEn}`, time: ko ? "2분 전" : "2m ago" },
    { emoji: "🏠", ko: `${cityKo} 정착 필수 정보가 업데이트됐어요`, en: `Settlement essentials updated for ${cityEn}`, time: ko ? "5분 전" : "5m ago" },
    { emoji: "🌏", ko: `81개 도시 한인 커뮤니티가 함께하고 있어요`, en: `81 cities. One Korean community worldwide`, time: ko ? "8분 전" : "8m ago" },
    { emoji: "✈️", ko: `공항 도착 체크리스트 — 지금 바로 시작해보세요`, en: `Airport arrival checklist — start right now`, time: ko ? "11분 전" : "11m ago" },
    { emoji: "🗺️", ko: `${cityKo} 탐방 명소 TOP 10 확인해보세요`, en: `Top 10 places to explore in ${cityEn}`, time: ko ? "15분 전" : "15m ago" },
    { emoji: "💊", ko: `건강보험 가입 방법 — ${cityKo} 기준으로 정리됐어요`, en: `Health insurance guide updated for ${cityEn}`, time: ko ? "22분 전" : "22m ago" },
    { emoji: "🚗", ko: `${cityKo} 운전면허 전환 절차가 업데이트됐어요`, en: `Driver license transfer guide updated in ${cityEn}`, time: ko ? "31분 전" : "31m ago" },
    { emoji: "💼", ko: `취업·이민 정착 정보 최신화됐어요`, en: `Job & immigration info refreshed`, time: ko ? "40분 전" : "40m ago" },
    { emoji: "🏫", ko: `자녀 학교·한국학교 정보 확인해보세요`, en: `Korean school & education info available`, time: ko ? "52분 전" : "52m ago" },
    { emoji: "📱", ko: `HebronGuide 앱을 홈 화면에 추가해보세요`, en: `Add HebronGuide to your home screen`, time: ko ? "1시간 전" : "1h ago" },
    { emoji: "⭐", ko: `가정교회 네트워크 — 전 세계 연결됩니다`, en: `House church network — connected worldwide`, time: ko ? "1시간 전" : "1h ago" },
    { emoji: "🌸", ko: `이 도시를 먼저 살아본 한인이 검증한 정보예요`, en: `Verified by Koreans who lived here first`, time: ko ? "2시간 전" : "2h ago" },
    { emoji: "🤝", ko: `새 도시에 도착한 누군가를 위해 정보가 쌓이고 있어요`, en: `Building info for the next person who arrives`, time: ko ? "2시간 전" : "2h ago" },
    { emoji: "🎯", ko: `정착 첫날부터 현지인처럼 — HebronGuide`, en: `Live like a local from Day One — HebronGuide`, time: ko ? "3시간 전" : "3h ago" },
    { emoji: "🏙️", ko: `달라스·휴스턴·애틀랜타 정보가 업데이트됐어요`, en: `Dallas, Houston, Atlanta info refreshed`, time: ko ? "3시간 전" : "3h ago" },
    { emoji: "🇰🇷", ko: `서울·부산·분당 역이민 정보도 확인해보세요`, en: `Seoul, Busan, Bundang re-migration info ready`, time: ko ? "4시간 전" : "4h ago" },
    { emoji: "🌐", ko: `81개 도시 — 오늘도 누군가 새로 이주하고 있어요`, en: `81 cities — someone is moving today, too`, time: ko ? "5시간 전" : "5h ago" },
    { emoji: "💛", ko: `이 가이드가 도움이 됐나요? 주변에 공유해주세요`, en: `Did this help? Share with someone who needs it`, time: ko ? "5시간 전" : "5h ago" },
    { emoji: "🙏", ko: `낯선 땅에서 외롭지 않게 — 헤브론이 함께합니다`, en: `You're not alone in a new land — Hebron is here`, time: ko ? "6시간 전" : "6h ago" },
    // ── G2G — 세대에서 세대로 (은근히, 자연스럽게)
    { emoji: "🌱", ko: `지금 당신이 걷는 이 길이 자녀들의 지도가 됩니다`, en: `The path you walk today becomes the map for your children`, time: ko ? "오늘" : "today" },
    { emoji: "🌳", ko: `${cityKo}에 뿌린 뿌리가 다음 세대의 이야기가 됩니다`, en: `The roots you plant in ${cityEn} become the next generation's story`, time: ko ? "오늘" : "today" },
    { emoji: "💫", ko: `1세의 정착이 2세의 정체성이 됩니다 — 세대에서 세대로`, en: `First generation's settlement becomes second generation's identity`, time: ko ? "오늘" : "today" },
    { emoji: "👨‍👩‍👧‍👦", ko: `부모가 선택한 이 도시가 자녀의 고향이 됩니다`, en: `The city you chose for your family becomes your children's home`, time: ko ? "오늘" : "today" },
  ], [cityKo, cityEn, ko]);

  const storedItems = useMemo(() => {
    try {
      const all = safeStorage.getJSON("hg_community_v2", []);
      return all.slice(0, 4).map((i: any) => ({
        emoji: i.emoji || "🌱",
        ko: `${i.citySlug || cityKo}에 ${i.name} 정보가 올라왔어요`,
        en: `${i.name} added in ${i.citySlug || cityEn}`,
        time: ko ? "방금" : "just now",
      }));
    } catch { return []; }
  }, [cityKo, cityEn, ko]);

  const fullFeed = [...storedItems, ...ALL_PULSE];
  const [offset, setOffset] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setOffset(prev => (prev + 1) % fullFeed.length);
        setFade(true);
      }, 280);
    }, 5000);
    return () => clearInterval(id);
  }, [fullFeed.length]);

  const visible = [0, 1, 2].map(n => fullFeed[(offset + n) % fullFeed.length]);

  // pulse 변수 제거 — visible 직접 사용

  return (
    <div style={{ margin: "12px 16px 0", background: "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6EE7B7", animation: "pulse 2s infinite" }} />
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 13, color: "#1B2A4A" }}>
            {ko ? "지금 이 순간" : "Right now"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--color-text-muted)", fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
          {ko ? "자동 업데이트" : "Live"}
          <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#6EE7B7", animation: "pulse 1.5s infinite" }} />
        </div>
      </div>
      <div style={{ transition: `opacity ${fade ? "0.3s" : "0.1s"} ease`, opacity: fade ? 1 : 0 }}>
        {visible.map((p, i) => (
          <div key={`${offset}-${i}`} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: i < 2 ? 9 : 0, marginBottom: i < 2 ? 9 : 0, borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
            <EmojiIcon emoji={p.emoji} size={14} />
            <div style={{ flex: 1, fontFamily: "Geist,Pretendard Variable,-apple-system,sans-serif", fontSize: 12, color: "#475569", lineHeight: 1.4 }}>
              {ko ? p.ko : p.en}
            </div>
            <span style={{ fontSize: 10, color: "var(--color-text-muted)", flexShrink: 0 }}>{p.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== HeroCard (원래 HebronGuide.tsx 11430-11524행) =====
function HeroCard() {
  const { t } = useI18n();
  const [videoReady, setVideoReady] = useState(false);
  const [vidIdx, setVidIdx] = useState(0);

  const handleVideoError = () => {
    if (vidIdx < SEATTLE_VIDEOS.length - 1) setVidIdx(i => i + 1);
  };

  return (
    <div className="relative w-full overflow-hidden"
      style={{ height: 480, borderRadius: 28, background: "#060d18",
        boxShadow: "0 32px 64px -12px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)" }}>

      {/* 정적 이미지 폴백 (영상 로딩 전) */}
      <img
        src={imgHeroCard} alt="시애틀 전경"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: heroPhotoPosition, filter: "brightness(1.05) saturate(1.3)",
          transition: "opacity 1.5s ease", opacity: videoReady ? 0 : 1 }}
      />

      {/* HD 영상 배경 (Pexels — autoplay, muted, loop) */}
      <video
        key={vidIdx}
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center 30%", transition: "opacity 1.5s ease",
          opacity: videoReady ? 1 : 0 }}
        onCanPlay={() => setVideoReady(true)}
        onError={handleVideoError}
      >
        <source src={SEATTLE_VIDEOS[vidIdx]} type="video/mp4" />
      </video>

      {/* 실제 라이브 웹캠 링크 배지 */}
      <a
        href="https://www.earthcam.com/usa/washington/seattle/"
        target="_blank" rel="noopener noreferrer"
        style={{
          position: "absolute", top: 14, right: 14, zIndex: 10,
          display: "flex", alignItems: "center", gap: 5,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)",
          borderRadius: 20, padding: "5px 11px",
          border: "1px solid rgba(255,255,255,0.15)",
          textDecoration: "none",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF3B30",
          display: "inline-block", animation: "livepulse 1.5s infinite" }} />
        <span style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 700, fontSize: 10,
          color: "#fff", letterSpacing: 0.5 }}>라이브 웹캠 →</span>
      </a>

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0" style={{ background:
        "linear-gradient(180deg, rgba(5,15,40,0.15) 0%, transparent 35%, rgba(2,14,8,0.85) 100%)" }} />

      {/* 텍스트 & 스탯 */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-[20px] p-[28px]">
        <div className="flex flex-col gap-[6px]">
          <div className="self-start px-[10px] py-[3px] rounded-[10px]"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.15)" }}>
            <span className="uppercase tracking-[1.2px]"
              style={{ color: "#ECFDF5", fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 700, fontSize: 9 }}>
              {t("hero.badge")}
            </span>
          </div>
          <h1 className="m-0 p-0" style={{ fontFamily: "'Pretendard Variable','WenQuanYi Zen Hei',sans-serif",
            fontWeight: 700, fontSize: 38, letterSpacing: "-1.5px", lineHeight: 1.18,
            color: "#FFFFFF", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>
            {t("hero.title")}
          </h1>
          <p className="m-0 uppercase tracking-[0.5px]"
            style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 300, fontSize: 12,
              color: "rgba(209,250,229,0.65)" }}>
            {t("hero.sub")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
          <a href="https://forecast.weather.gov/MapClick.php?CityName=Seattle&state=WA&site=SEW"
            target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <StatCard label={t("stat.temp")} value="52°F" icon={<WeatherIcon />} />
          </a>
          <StatCard label={t("stat.pop")} value="762K" />
          <StatCard label={t("stat.rent")} value="$2.2K" />
          <StatCard label={t("stat.community")} value="165K+" />
        </div>
      </div>

      <style>{`@keyframes livepulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.8)} }`}</style>
    </div>
  );
}

// ===== SettleFirstSection (원래 HebronGuide.tsx 11560-11588행) =====
function SettleFirstSection({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  const { t } = useI18n();
  return (
    <section className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[10px]">
        <div className="pl-[12px]" style={{ borderLeft: `3px solid ${GOLD}` }}>
          <h2 className="m-0" style={{ fontFamily: "'Pretendard Variable', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: "var(--color-text-primary)" }}>
            {t("settle.title")}
          </h2>
        </div>
        <div className="px-[10px] py-[3px] rounded-[10px]" style={{ border: `1px solid rgba(110,231,183,0.3)`, background: "rgba(110,231,183,0.08)" }}>
          <span className="uppercase tracking-[0.5px]" style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 600, fontSize: 10, color: MINT }}>
            {t("settle.badge")}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-[12px] gap-y-[16px]">
        <CategoryItem label={t("cat.visa")}    pathKey="p2ce24f80" vb="0 0 18.75 23.75" active onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.housing")} pathKey="p3b345300" vb="0 0 18.75 21.12"        onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.schools")} pathKey="p193ae400" vb="0 0 24.9 20.34"         onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.license")} pathKey="p345dc3a0" vb="0 0 23.75 18.75"        onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.jobs")}    pathKey="p1da64f00" vb="0 0 23.75 21.875"       onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.health")}  pathKey="p3c213f80" vb="0 0 23.75 23.125"       onClick={() => onNavigate?.(1)} />
        <CategoryItem label={t("cat.markets")} pathKey="p2de11280" vb="0 0 24.53 21.875"       onClick={() => onNavigate?.(3)} />
        <CategoryItem label={t("cat.bank")}    pathKey="p3c662d00" vb="0 0 23.08 23.678"       onClick={() => onNavigate?.(1)} />
      </div>
    </section>
  );
}

// ===== LifestyleTipsSection (원래 HebronGuide.tsx 11644-11668행) =====
function LifestyleTipsSection() {
  const { t } = useI18n();
  const articles = [
    { imageSrc: imgCoffee, category: t("article1.cat"), title: t("article1.title"), excerpt: t("article1.excerpt"), readTime: t("article1.read"), isLarge: true },
    { imageSrc: imgLifestyle, category: t("article2.cat"), title: t("article2.title"), excerpt: t("article2.excerpt"), readTime: t("article2.read"), isLarge: false },
  ];
  return (
    <section className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[12px]">
        <BarChartDecor />
        <div className="pl-[12px]" style={{ borderLeft: `3px solid ${GOLD}` }}>
          <h2 className="m-0" style={{ fontFamily: "'Pretendard Variable', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: "var(--color-text-primary)" }}>
            {t("tips.title")}
          </h2>
        </div>
        <span className="uppercase tracking-[0.5px] self-end mb-[2px]" style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 600, fontSize: 10, color: "rgba(201,162,39,0.65)" }}>
          {t("tips.sub")}
        </span>
      </div>
      <div className="flex flex-col gap-[14px]">
        {articles.map((a, i) => <ArticleCard key={i} {...a} />)}
      </div>
    </section>
  );
}

// ===== KoreanCultureCalendarSection (원래 HebronGuide.tsx 12856-12909행) =====
function KoreanCultureCalendarSection({ onNavigate }: { onNavigate?: (tab: number, subTab?: number) => void }) {
  const { lang } = useI18n();

  return (
    <div style={{ padding: "20px 16px 8px" }}>
      {/* 한인 문화 캘린더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A" }}>
            🇰🇷 {lang === "ko" ? "한인 문화 캘린더" : lang === "es" ? "Calendario Cultural Coreano" : "Korean Cultural Calendar"}
          </div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
            {lang === "ko" ? "함께 기억하고 함께 나누는 날들" : lang === "es" ? "Días para recordar y celebrar juntos" : "Days to remember & celebrate together"}
          </div>
        </div>
      </div>

      {/* 캘린더 가로 스크롤 */}
      <div style={{
        display: "flex", gap: 10, overflowX: "auto",
        padding: "4px 4px 8px", scrollbarWidth: "none",
      }} className="[&::-webkit-scrollbar]:hidden">
        {KOREAN_HOLIDAYS.map((h, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 130, padding: "12px 10px",
            background: "#fff", borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <EmojiIcon emoji={h.emoji} size={16} />
              <span style={{
                fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 700, fontSize: 10,
                color: "#DC2626", letterSpacing: "0.3px",
              }}>{h.date}</span>
            </div>
            <div style={{
              fontFamily: "'Pretendard Variable',sans-serif", fontWeight: 700, fontSize: 13,
              color: "#1B2A4A", marginBottom: 3, lineHeight: 1.3,
            }}>
              {lang === "ko" ? h.titleKo : lang === "es" ? (h.titleEs ?? h.titleEn) : h.titleEn}
            </div>
            <div style={{
              fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10, color: "#64748B",
              lineHeight: 1.4,
            }}>
              {lang === "ko" ? h.descKo : lang === "es" ? (h.descEs ?? h.descEn) : h.descEn}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== KoreanAmericanJourneySection (원래 HebronGuide.tsx 13044-13129행) =====
function KoreanAmericanJourneySection({ onNavigate }: { onNavigate?: (tab: number, subTab?: number) => void }) {
  const { lang } = useI18n();
  const city = useCityConfig();
  const ko = lang === "ko";

  // 현재 도시의 현지 정체성 — 미등록 도시는 글로벌 기본값
  const identity = DIASPORA_IDENTITY[city.slug] ?? {
    flag: "🌍", ko: "현지 한인", en: "Korean Diaspora",
    descKo: "새로운 땅에서 당당하게 뿌리내리기",
    descEn: "Building roots and community in your new home",
    color: "#0EA5E9",
  };

  const steps = [
    { emoji: "🛬", labelKo: "정착",   labelEn: "Settle", sub: ko ? "Day 1~3개월" : "Day 1–3 months", color: "#F2994A", tab: 1, subTab: 0 },
    { emoji: "🏘️", labelKo: "적응",   labelEn: "Adapt",  sub: ko ? "3개월~1년"   : "3–12 months",     color: "#10B981", tab: 1, subTab: 3 },
    { emoji: identity.flag, labelKo: identity.ko, labelEn: identity.en, sub: ko ? "1년+" : "Year 1+", color: identity.color, tab: 5, subTab: 6 },
  ];

  const titleKo = `${identity.flag} ${identity.ko} 여정`;
  const titleEn = `${identity.flag} Your ${identity.en} Journey`;

  return (
    <div style={{ padding: "20px 16px 8px" }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A", letterSpacing: "-0.2px" }}>
          {ko ? titleKo : titleEn}
        </div>
        <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>
          {ko ? identity.descKo : identity.descEn}
        </div>
      </div>

      {/* 3단계 여정 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i === 2 ? "1.2" : "1" }}>
            <button
              onClick={() => onNavigate?.(step.tab, step.subTab)}
              style={{
                flex: 1, background: "#fff", border: `1.5px solid ${step.color}33`,
                borderRadius: 14, padding: "12px 8px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                cursor: "pointer", WebkitTapHighlightColor: "transparent",
                boxShadow: `0 2px 8px ${step.color}18`,
                transition: "transform 0.12s ease",
              }}
              onTouchStart={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.95)"; }}
              onTouchEnd={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <EmojiIcon emoji={step.emoji} size={19} />
              <div style={{
                fontFamily: "Geist,Pretendard Variable,-apple-system,sans-serif",
                fontWeight: 700, fontSize: 11, color: step.color, letterSpacing: "-0.2px", textAlign: "center",
              }}>
                {ko ? step.labelKo : step.labelEn}
              </div>
              <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 9, color: "var(--color-text-muted)", textAlign: "center" }}>
                {step.sub}
              </div>
            </button>
            {i < steps.length - 1 && (
              <div style={{ width: 16, textAlign: "center", color: "#CBD5E1", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>›</div>
            )}
          </div>
        ))}
      </div>

      {/* 하단 태그라인 */}
      <div style={{
        marginTop: 12, padding: "10px 14px",
        background: `linear-gradient(135deg, ${identity.color}0d, rgba(16,185,129,0.06))`,
        borderRadius: 12, border: `1px solid ${identity.color}1a`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Lightbulb size={14} strokeWidth={2} />
        <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, color: "#475569", lineHeight: 1.5, flex: 1 }}>
          {ko
            ? `HebronGuide는 정착 가이드를 넘어 ${city.nameKo}에서 ${identity.ko}${roJosa(identity.ko)} 성장하는 전 여정을 함께합니다.`
            : `HebronGuide walks with you from Day 1 through your full journey as ${identity.en} in ${city.nameEn} — not just settlement.`}
        </div>
      </div>
    </div>
  );
}

// ===== GlobalAdBanner (원래 HebronGuide.tsx 13137-13159행) =====
// 글로벌 광고 배너 — 모든 페이지 상단 고정 슬롯 ($300+)
function GlobalAdBanner({ lang }: { lang: string }) {
  const ko = lang === "ko";
  // 광고 없을 때 → 자사 광고 문의 CTA 표시
  return (
    <a href="/ad-request.html" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        margin: "8px 16px 0",
        background: "linear-gradient(90deg, rgba(201,162,39,0.08), rgba(201,162,39,0.04))",
        border: "1px dashed rgba(201,162,39,0.3)",
        borderRadius: 10, padding: "9px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, color: "rgba(201,162,39,0.7)" }}>
          🌐 {ko ? "글로벌 광고 슬롯 — 전 도시 최상단 노출" : "Global Ad Slot — Shown across all cities"}
        </div>
        <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10, color: "rgba(201,162,39,0.5)", fontWeight: 700 }}>
          {ko ? "광고 문의 →" : "Advertise →"}
        </div>
      </div>
    </a>
  );
}

// ===== AmericasAdSection (원래 HebronGuide.tsx 13161-13193행) =====
// 미주 광고 섹션 — 홈 내 별도 카드 슬롯 ($150+)
function AmericasAdSection({ lang }: { lang: string }) {
  const ko = lang === "ko";
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 13, color: "#60A5FA" }}>
          🌎 {ko ? "미주 추천" : "Americas Picks"}
        </div>
        <a href="/ad-request.html" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10, color: "rgba(96,165,250,0.6)", textDecoration: "none", fontWeight: 700 }}>
          {ko ? "광고 문의" : "Advertise"}
        </a>
      </div>
      {/* 광고 없을 때 — 플레이스홀더 슬롯 */}
      <div style={{
        background: "rgba(96,165,250,0.06)", border: "1px dashed rgba(96,165,250,0.25)",
        borderRadius: 12, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(96, 165, 250, 0.12)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Globe size={17} strokeWidth={2} /></div>
        <div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 12, color: "rgba(96,165,250,0.7)", fontWeight: 700, marginBottom: 2 }}>
            {ko ? "미주 추천 광고 슬롯" : "Americas Ad Slot"}
          </div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10, color: "rgba(96,165,250,0.5)", lineHeight: 1.5 }}>
            {ko ? "전 도시 미주 추천 섹션 · 한인 디아스포라 전체 도달" : "Shown in Americas section across all cities"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== CityNewsSection (원래 HebronGuide.tsx 13730-13778행) =====
function CityNewsSection({ lang }: { lang: string }) {
  const ko = lang === "ko";
  const { content: serverContent } = useContent();
  const items = serverContent["citynews"]
    ? resolvePlaceItems(serverContent["citynews"] as any, lang).slice(0, 3)
    : [];
  if (items.length === 0) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#ECFDF5", fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
          {ko ? "이 도시 소식" : "City News"}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(201,162,39,0.9)", background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 6, padding: "1px 6px", fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
          {ko ? "광고·소식" : "Sponsored"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it: any) => {
          const website = (it.tags || []).find?.((t: string) => /^https?:\/\//.test(t)) || it.website;
          const inner = (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 13px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 12,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.2 }}>{it.emoji || "📣"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#ECFDF5", fontFamily: "Geist,Pretendard Variable,sans-serif", marginBottom: 2 }}>
                  {it.name}
                </div>
                <div style={{ fontSize: 11, color: "rgba(236,253,245,0.6)", fontFamily: "Geist,Pretendard Variable,sans-serif", lineHeight: 1.5, whiteSpace: "pre-wrap" as const }}>
                  {it.desc}
                </div>
              </div>
              {website && (
                <span style={{ fontSize: 15, color: "rgba(201,162,39,0.8)", flexShrink: 0 }}>›</span>
              )}
            </div>
          );
          return website
            ? <a key={it.id} href={website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>{inner}</a>
            : <div key={it.id}>{inner}</div>;
        })}
      </div>
    </div>
  );
}

// ===== FoundingPartnerBanner (원래 HebronGuide.tsx 13973-13994행) =====
function FoundingPartnerBanner({ lang, onNavigate }: { lang: string; onNavigate?: (tab: number, subTab?: number) => void }) {
  return (
    <a href="/founding-partner.html" style={{ textDecoration: "none", display: "block" }}>
      <div style={{ margin: "12px 16px 0", background: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "1.5px solid #F59E0B", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: "0 2px 12px rgba(245,158,11,0.18)" }}>
        <span style={{ flexShrink: 0 }}><Sparkles size={19} strokeWidth={2} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 12.5, color: "#78350F", lineHeight: 1.3, marginBottom: 3 }}>
            {lang === "ko" ? "⛪ 교회 정보를 HebronGuide에 올려 주세요" : "⛪ Add your church to HebronGuide"}
          </div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 10.5, color: "#92400E", lineHeight: 1.6 }}>
            {lang === "ko"
              ? "이민자·이주자가 찾는 커뮤니티 가이드 — 지금 바로 동행해 주세요"
              : "The community guide for immigrants & movers — join us today"}
          </div>
        </div>
        <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 11, color: "#78350F", background: "rgba(245,158,11,0.2)", borderRadius: 8, padding: "4px 10px", flexShrink: 0 }}>
          {lang === "ko" ? "신청 →" : "Apply →"}
        </div>
      </div>
    </a>
  );
}

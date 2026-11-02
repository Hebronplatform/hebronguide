// 2026-11-02 보관 — 새 홈·사람 탭으로 쓰지 않게 된 조각 12개 (설계도 ⑦-7).
// 되살리려면 이 파일에서 함수를 HebronGuide.tsx로 다시 옮긴다.

// ===== useInstallPrompt (원래 HebronGuide.tsx 7968-8012행) =====
function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const dismissed = safeStorage.get("hg_install_dismissed");
    if (dismissed) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    if (standalone) return; // 이미 설치됨

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (ios) {
      setIsIOS(true);
      setShowBanner(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) return; // iOS는 버튼 클릭 없음 — 안내만
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    safeStorage.set("hg_install_dismissed", "1")
  };

  return { showBanner, handleInstall, handleDismiss, isIOS };
}

// ===== InstallBanner (원래 HebronGuide.tsx 8602-8644행) =====
function InstallBanner({ onInstall, onDismiss, isIOS }: { onInstall: () => void; onDismiss: () => void; isIOS: boolean }) {
  return (
    <div style={{
      position: "fixed", top: 56, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 398,
      background: "linear-gradient(135deg, rgba(110,231,183,0.15), rgba(201,162,39,0.10))",
      border: "1px solid rgba(110,231,183,0.25)",
      borderRadius: 16, padding: "14px 16px",
      display: "flex", alignItems: "flex-start", gap: 12,
      zIndex: 100, backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      <span style={{ marginTop: 2 }}><Smartphone size={22} strokeWidth={2} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#e6edf3", fontFamily: "Geist,Pretendard Variable,sans-serif", marginBottom: 3 }}>
          HebronGuide 앱으로 추가하기
        </div>
        {isIOS ? (
          <div style={{ fontSize: 12, color: "rgba(230,237,243,0.75)", fontFamily: "Geist,Pretendard Variable,sans-serif", lineHeight: 1.7 }}>
            Safari 하단 <strong style={{ color: MINT }}>공유 버튼 ⬆️</strong> →<br/>
            <strong style={{ color: MINT }}>"홈 화면에 추가"</strong> 탭 → 추가
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "rgba(230,237,243,0.6)", fontFamily: "Geist,Pretendard Variable,sans-serif", lineHeight: 1.6 }}>
            한 번 탭으로 앱 설치 · 오프라인 OK · 공항에서도 사용 가능
          </div>
        )}
      </div>
      {!isIOS && (
        <button onClick={onInstall} style={{
          background: MINT, color: "#0d1117", border: "none",
          borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13,
          cursor: "pointer", fontFamily: "Geist,Pretendard Variable,sans-serif", flexShrink: 0, marginTop: 2,
        }}>추가</button>
      )}
      <button onClick={onDismiss} style={{
        background: "none", border: "none", color: "rgba(230,237,243,0.4)",
        fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1, flexShrink: 0,
      }}>×</button>
    </div>
  );
}

// ===== useLiveData (원래 HebronGuide.tsx 8871-8928행) =====
function useLiveData() {
  const [rate, setRate] = useState<number | null>(null);
  const [rateTime, setRateTime] = useState("");
  const [gas, setGas] = useState<number | null>(null);
  const [gasDate, setGasDate] = useState("");
  const [rent, setRent] = useState<number | null>(null);
  const [tempF, setTempF] = useState<number | null>(null);

  // 환율: Frankfurter API (무료·키 불필요·CORS OK) — 30분마다 갱신
  useEffect(() => {
    const fetch환율 = async () => {
      try {
        const r = await fetch("https://api.frankfurter.app/latest?from=USD&to=KRW");
        const d = await r.json();
        setRate(Math.round(d.rates.KRW));
        setRateTime(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
      } catch { /* 네트워크 오류 시 조용히 무시 */ }
    };
    fetch환율();
    const id = setInterval(fetch환율, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // live.json: GitHub Actions 매주 화요일 갱신 (WA 기름값 — EIA 주간 자료). 환율·기온은 아래에서 직접 읽는다
  useEffect(() => {
    // 파일은 /seattle/data/live.json 에 있다(build.sh). 예전 "/data/live.json"은 404라 늘 4.15 기본값이 떴다 (2026-11-02)
    fetch(import.meta.env.BASE_URL + "data/live.json?t=" + Math.floor(Date.now() / 3_600_000))
      .then(r => r.json())
      .then(d => {
        setGas(d.gas_wa_regular ?? 4.15);
        setGasDate(d.updated ?? "");
        setRent(d.rent_seattle_1br ?? 2150);
        setTempF(d.temp_f ?? null);
      })
      .catch(() => { setGas(4.15); setRent(2150); });
  }, []);

  // 실시간 기온 (Open-Meteo, 무료·키 불필요)
  useEffect(() => {
    const fetchTemp = async () => {
      try {
        const r = await fetch(
          "https://api.open-meteo.com/v1/forecast" +
          "?latitude=47.6062&longitude=-122.3321" +
          "&current=temperature_2m&temperature_unit=fahrenheit" +
          "&timezone=America/Los_Angeles"
        );
        const d = await r.json();
        setTempF(Math.round(d.current.temperature_2m));
      } catch {}
    };
    fetchTemp();
    const id = setInterval(fetchTemp, 10 * 60 * 1000); // 10분마다
    return () => clearInterval(id);
  }, []);

  return { rate, rateTime, gas, gasDate, rent, tempF };
}

// ===== LiveDataBar (원래 HebronGuide.tsx 8933-9055행) =====
function LiveDataBar() {
  const { lang } = useI18n();
  const city = useCityConfig();
  const { rate, rateTime, gas, gasDate, rent, tempF } = useLiveData();
  const [seoulTime, setSeoulTime] = useState("");
  const [cityTime, setCityTime] = useState("");

  // 도시별 타임존 매핑
  const CITY_TIMEZONE: Record<string, string> = {
    seattle: "America/Los_Angeles", dallas: "America/Chicago",
    sf: "America/Los_Angeles", newyork: "America/New_York",
    nashville: "America/Chicago", boston: "America/New_York",
    la: "America/Los_Angeles", toronto: "America/Toronto",
    vancouver: "America/Vancouver", houston: "America/Chicago",
    atlanta: "America/New_York", kansascity: "America/Chicago",
    philadelphia: "America/New_York", miami: "America/New_York",
    mexicocity: "America/Mexico_City", guadalajara: "America/Mexico_City",
    monterrey: "America/Monterrey",
    memphis: "America/Chicago", huntsville: "America/Chicago",
  };

  // 도시별 시간 코드 (표시용)
  const CITY_TZ_CODE: Record<string, string> = {
    seattle: "SEA", dallas: "DAL", sf: "SFO", newyork: "NYC",
    nashville: "BNA", boston: "BOS", la: "LAX", toronto: "YYZ",
    vancouver: "YVR", houston: "HOU", atlanta: "ATL", kansascity: "MCI",
    philadelphia: "PHL", miami: "MIA", mexicocity: "MEX",
    guadalajara: "GDL", monterrey: "MTY",
    memphis: "MEM", huntsville: "HSV",
  };

  const isSeattle = city.slug === "seattle";
  const timezone = CITY_TIMEZONE[city.slug] ?? "America/Los_Angeles";
  const tzCode = CITY_TZ_CODE[city.slug] ?? "LOC";

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCityTime(now.toLocaleTimeString("ko-KR", { timeZone: timezone, hour: "2-digit", minute: "2-digit" }));
      setSeoulTime(now.toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [timezone]);

  const items = [
    // 기온: 시애틀 전용 (실시간 WA 날씨 API)
    ...(isSeattle && tempF ? [{
      icon: "🌡️",
      label: lang === "ko" ? "시애틀 기온" : "Seattle Temp",
      value: `${tempF}°F`,
      sub: lang === "ko" ? "실시간" : "Live",
      color: "#F97316",
    }] : []),
    // 환율: 전 도시 공통 (한인 이민자 모두에게 유용)
    {
      icon: "💱",
      label: lang === "ko" ? "원/달러" : "KRW/USD",
      value: rate ? `₩${rate.toLocaleString()}` : "…",
      sub: rateTime ? (lang === "ko" ? `${rateTime} 갱신` : `${rateTime}`) : lang === "ko" ? "로딩 중" : "Loading",
      color: "#F2994A",
    },
    // 기름값: 시애틀/WA 전용
    ...(isSeattle ? [{
      icon: "⛽",
      label: lang === "ko" ? "WA 기름값" : "WA Gas",
      value: gas ? `$${gas.toFixed(2)}` : "…",
      sub: gasDate || "loading",
      color: "#2563EB",
    }] : []),
    // 월세: 시애틀 전용 (다른 도시는 데이터 없음)
    ...(isSeattle && rent ? [{
      icon: "🏠",
      label: lang === "ko" ? "시애틀 월세" : "Seattle Rent",
      value: `$${rent.toLocaleString()}`,
      sub: lang === "ko" ? "1BR 중앙값" : "1BR median",
      color: MINT,
    }] : []),
    // 현지 시각 vs 서울: 전 도시 공통
    {
      icon: "🕐",
      label: lang === "ko" ? `${city.nameKo}·서울` : `${tzCode}·ICN`,
      value: cityTime || "…",
      sub: seoulTime ? `서울 ${seoulTime}` : "",
      color: "#8A6A12",
    },
  ];

  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto",
      scrollbarWidth: "none", paddingBottom: 2,
    }}
    className="[&::-webkit-scrollbar]:hidden"
    >
      {items.map((item, i) => (
        <div key={i} style={{
          flex: "0 0 auto", minWidth: 110,
          background: "rgba(27,42,74,0.04)",
          border: `1px solid ${item.color}30`,
          borderRadius: 14, padding: "10px 12px",
          display: "flex", flexDirection: "column", gap: 3,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 600 }}>
              {item.label}
            </span>
          </div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 16, color: item.color, letterSpacing: "-0.3px" }}>
            {item.value}
          </div>
          {item.sub && (
            <div style={{ fontSize: 9, color: "var(--color-text-muted)", fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
              {item.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ===== CompactHeroNew (원래 HebronGuide.tsx 9182-9433행) =====
function CompactHeroNew({ onSearch }: { onSearch?: () => void }) {
  const { lang } = useI18n();
  const city = useCityConfig();
  // liveCamUrl removed — LIVE CAM 버튼 제거됨

  const slides = (CITY_HERO_SLIDES[city.slug] ?? null)?.slice(0, 1) ?? null;   // 홈 단순화 3단계: 슬라이드 1장(자동 회전·닷 제거)

  // 오전(0-11) → 0번부터, 오후(12-23) → 절반부터 시작
  const initIdx = 0; // 항상 첫 슬라이드(낮 사진)부터 시작
  const [slideIdx, setSlideIdx] = useState(initIdx);

  // 3초마다 다음 슬라이드
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => setSlideIdx(i => (i + 1) % slides.length), 3000);
    return () => clearInterval(timer);
  }, [slides]);

  // 슬라이드 없는 도시: 기존 영상 폴백
  const heroVideosLen = city.heroVideos?.length ?? 0;
  const videoSlot = heroVideosLen > 0
    ? Math.floor(new Date().getHours() / Math.max(1, Math.floor(24 / heroVideosLen))) % heroVideosLen
    : 0;
  const activeHeroVideo = slides ? null
    : heroVideosLen > 0 ? city.heroVideos![videoSlot]
    : (city.heroVideo || null);

  const hasMedia = !!(slides || activeHeroVideo);

  return (
    <div style={{
      position: "relative",
      height: "clamp(192px, 30dvh, 256px)",
      overflow: "hidden",
      borderRadius: "0 0 28px 28px",
      backgroundColor: city.color || "#1B4F72",
    }}>
      {/* ── 솔리드 도시 색상 보장 레이어 (이미지 실패시 반드시 보임) */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundColor: city.color || "#1B4F72",
      }} />

      {/* ── 애니메이션 키프레임: Ken Burns Infinite + 파티클 + 스캔라인 */}
      <style>{`
        @keyframes kbIn  {
          0%   { transform: scale(1.0)  translate(0%,     0%);   }
          50%  { transform: scale(1.12) translate(-1.8%, -1.2%); }
          100% { transform: scale(1.0)  translate(0%,     0%);   }
        }
        @keyframes kbOut {
          0%   { transform: scale(1.0)  translate(0%,    0%);   }
          50%  { transform: scale(1.12) translate(1.8%,  -1.2%); }
          100% { transform: scale(1.0)  translate(0%,   0%);   }
        }
        @keyframes heroParticle {
          0%   { transform: translate(0, 0)   scale(1);   opacity: 0;   }
          15%  { opacity: 0.9; }
          85%  { opacity: 0.3; }
          100% { transform: translate(var(--ptx), var(--pty)) scale(0.4); opacity: 0; }
        }
        @keyframes heroScan {
          0%   { top: -3px; opacity: 0.6; }
          100% { top: 110%;  opacity: 0;   }
        }
      `}</style>

      {/* ── 사진 슬라이드: Ken Burns 무한 반복 */}
      {slides && slides.map((slide, i) => {
        const isActive = i === slideIdx;
        return (
          <img
            key={i}
            src={slide.url}
            alt=""
            aria-hidden="true"
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = "none";
            }}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: slide.pos,
              filter: "brightness(1.42) saturate(1.68) contrast(1.08)",
              opacity: isActive ? 1 : 0,
              transition: "opacity 0.8s ease",
              animation: `${i % 2 === 0 ? "kbIn" : "kbOut"} 10s ease-in-out infinite`,
              animationDelay: `${-i * 2.5}s`,
              zIndex: isActive ? 1 : 0,
              color: "transparent",
              fontSize: 0,
              textIndent: "-9999px",
            }}
          />
        );
      })}

      {/* ── 영상 폴백 (사진 슬라이드 없는 도시) */}
      {activeHeroVideo && (
        <video key={activeHeroVideo} autoPlay muted loop playsInline
          onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 35%",
          }}>
          <source src={activeHeroVideo} type="video/mp4" />
        </video>
      )}

      {/* ── 사진/영상 없는 도시: 이니셜 워터마크 */}
      {!hasMedia && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end",
          paddingRight: 24, fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800,
          fontSize: 96, color: "rgba(255,255,255,0.1)", letterSpacing: "-4px",
          userSelect: "none", pointerEvents: "none",
        }}>
          {city.nameEn.slice(0, 3).toUpperCase()}
        </div>
      )}

      {/* ── 그라디언트 오버레이 */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 38%, rgba(0,0,0,0.42) 100%)",
      }} />

      {/* ── 스캔라인 (도시 색상) */}
      {slides && (
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2, zIndex: 3,
          background: `linear-gradient(90deg, transparent 0%, ${city.color || "#6EE7B7"}99 40%, ${city.color || "#6EE7B7"}cc 50%, ${city.color || "#6EE7B7"}99 60%, transparent 100%)`,
          animation: "heroScan 5s linear infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* ── 파티클 (사진 슬라이드가 있는 도시만) */}
      {slides && ([
        { left:"12%",  delay:"0s",    size:5, tx:"-18px", ty:"-65px", color: city.color || "#6EE7B7" },
        { left:"27%",  delay:"0.8s",  size:3, tx:"12px",  ty:"-80px", color:"rgba(255,255,255,0.9)"  },
        { left:"45%",  delay:"1.6s",  size:4, tx:"-8px",  ty:"-55px", color:"#C9A227"               },
        { left:"63%",  delay:"2.4s",  size:3, tx:"20px",  ty:"-72px", color: city.color || "#6EE7B7" },
        { left:"78%",  delay:"3.2s",  size:5, tx:"-14px", ty:"-60px", color:"rgba(255,255,255,0.8)"  },
        { left:"88%",  delay:"0.4s",  size:3, tx:"8px",   ty:"-48px", color:"#C9A227"               },
      ] as const).map((p, i) => (
        <div key={`pt-${i}`} style={{
          position: "absolute",
          bottom: 38,
          left: p.left,
          width: p.size,
          height: p.size,
          borderRadius: "50%",
          background: p.color,
          zIndex: 4,
          pointerEvents: "none",
          ["--ptx" as any]: p.tx,
          ["--pty" as any]: p.ty,
          animation: `heroParticle 3.2s ${p.delay} ease-out infinite`,
        }} />
      ))}

      {/* ── 도시명 + 태그라인 (검색창 위로 올림) */}
      <div style={{ position: "absolute", bottom: 70, left: 18, right: 72, zIndex: 3 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(0,0,0,0.28)", backdropFilter: "blur(10px) saturate(1.4)",
          WebkitBackdropFilter: "blur(10px) saturate(1.4)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 99, padding: "3px 10px", marginBottom: 8,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6EE7B7", display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 700, fontSize: 10, color: "rgba(255,255,255,0.92)", letterSpacing: "0.05em" }}>
            {lang === "ko" ? "✦ 81개 도시의 이야기" : "✦ 81 Cities"}
          </span>
        </div>
        <div style={{
          fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 21, color: "#fff",
          letterSpacing: "-0.5px", textShadow: "0 2px 20px rgba(0,0,0,0.65)", lineHeight: 1.15,
        }}>
          <span style={{ color: city.color }}>{lang === "ko" ? city.nameKo : city.nameEn}</span>
          {" "}
          <span style={{ fontWeight: 400, fontSize: 15, opacity: 0.9 }}>
            {lang === "ko" ? "정착 가이드" : lang === "es" ? "Guía de Asentamiento" : "Settlement Guide"}
          </span>
        </div>
        <div style={{
          fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 400, fontSize: 12.5,
          color: "rgba(255,255,255,0.82)", marginTop: 5,
          textShadow: "0 1px 8px rgba(0,0,0,0.5)",
        }}>
          {lang === "ko" ? city.taglineKo : lang === "es" ? (city.taglineEs ?? city.taglineEn) : city.taglineEn}
        </div>
      </div>

      {/* ── #1 뱃지 (우상단) */}
      <a href="https://hebronguide.com/#cities" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        <div style={{
          position: "absolute", top: 12, right: 14, zIndex: 10,
          background: "rgba(0,0,0,0.38)", backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(201,162,39,0.45)",
          borderRadius: 99, padding: "4px 10px",
          display: "flex", alignItems: "center", gap: 4,
          cursor: "pointer",
        }}>
          <span style={{ color: "#C9A227", fontWeight: 800, lineHeight: 1 }}><Sparkles size={9} strokeWidth={2} /></span>
          <span style={{ fontSize: 11, fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800,
            color: "rgba(255,255,255,0.97)", letterSpacing: "0.04em" }}>
            {lang === "ko" ? "글로벌 환대 플랫폼" : "Global Hospitality Platform"}
          </span>
        </div>
      </a>

      {/* ── 슬라이드 닷 인디케이터 */}
      {slides && slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 10, right: 14, zIndex: 4, display: "flex", gap: 5, alignItems: "center" }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)} style={{
              width: i === slideIdx ? 22 : 5, height: 5,
              borderRadius: 99, border: "none", padding: 0, cursor: "pointer",
              background: i === slideIdx ? "#fff" : "rgba(255,255,255,0.32)",
              transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: i === slideIdx ? "0 1px 6px rgba(0,0,0,0.35)" : "none",
            }} />
          ))}
        </div>
      )}

      {/* ── 히어로 내 검색창 (크게) — 한 입구 */}
      {onSearch && (
        <button onClick={onSearch} aria-label={lang === "ko" ? "검색" : "Search"} style={{
          position: "absolute", bottom: 12, left: 14, right: 14, zIndex: 6,
          display: "flex", alignItems: "center", gap: 11,
          background: "rgba(255,255,255,0.97)", border: "1px solid rgba(255,255,255,0.7)",
          borderRadius: 15, padding: "15px 16px", cursor: "pointer",
          boxShadow: "0 10px 26px rgba(0,0,0,0.3)", WebkitTapHighlightColor: "transparent",
        }}>
          <Search size={20} strokeWidth={2.2} color="#6b7280" />
          <span style={{ fontFamily: "'Pretendard Variable',sans-serif", fontSize: 15, fontWeight: 600, color: "#6b7280" }}>
            {lang === "ko" ? "교회 · 병원 · 은행 · 집 찾기" : "Search church, clinic, bank, home…"}
          </span>
        </button>
      )}

      {/* LIVE CAM 제거됨 */}
    </div>
  );
}

// ===== AppGrid (원래 HebronGuide.tsx 11728-11774행) =====
function AppGrid({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  const { lang } = useI18n();
  return (
    <section>
      <div className="flex items-center gap-[10px] mb-4">
        <div className="pl-[12px]" style={{ borderLeft: `3px solid ${MINT}` }}>
          <h2 className="m-0" style={{ fontFamily: "'Pretendard Variable', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px", color: "#ECFDF5" }}>
            {lang === "ko" ? "빠른 메뉴" : "Quick Access"}
          </h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {APP_GRID_ITEMS.map((item) => (
          <button
            key={item.tabIndex}
            onClick={() => onNavigate?.(item.tabIndex)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "14px 8px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${item.color}22`,
              borderRadius: 16, cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${item.color}14`; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `${item.color}18`,
              border: `1px solid ${item.color}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <item.icon size={22} color={item.color} strokeWidth={1.8} />
            </div>
            <span style={{
              fontFamily: "'Pretendard Variable',sans-serif", fontWeight: 600, fontSize: 10,
              color: "rgba(236,253,245,0.75)", textAlign: "center", lineHeight: 1.3,
            }}>
              {lang === "ko" ? item.label : item.labelEn}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ===== HebronFlywheelBar (원래 HebronGuide.tsx 13027-13059행) =====
function HebronFlywheelBar({ lang }: { lang: string }) {
  // 도시 수 자동 계산 — 도시 추가 시 자동 반영 (수동 수정 불필요)
  const LIVE_CITY_COUNT = HEBRON_CITIES.length;
  // 이모지 대신 SVG — 이미 있는 QM_ICON_MAP 을 쓴다 (목사님 지시 2026-09-19)
  const stats = [
    { icon: "map",    value: String(LIVE_CITY_COUNT), label: lang === "ko" ? "개 도시" : "Cities" },
    { icon: "users",  value: "4", label: lang === "ko" ? "기관 파트너" : "Partners" },
    { icon: "book-open", value: "2", label: lang === "ko" ? "개 언어" : "Languages" },
  ];
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none", padding: "0 6px" }}
        className="[&::-webkit-scrollbar]:hidden">
        {stats.map((s, i) => (
          <div key={i} style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
            padding: "6px 14px",
            borderRight: i < stats.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
          }}>
            {(() => {
              const StatIcon = QM_ICON_MAP[s.icon];
              return StatIcon ? <StatIcon size={14} color="#8E8E93" strokeWidth={2} /> : null;
            })()}
            <div>
              <span style={{ fontFamily: "Geist,Pretendard Variable,-apple-system,sans-serif", fontWeight: 800, fontSize: 14, color: "#1C1C1E", letterSpacing: "-0.3px" }}>{s.value}</span>
              <span style={{ fontFamily: "Geist,Pretendard Variable,-apple-system,sans-serif", fontSize: 11, color: "#8E8E93", marginLeft: 3 }}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== NeedsBoardCard (원래 HebronGuide.tsx 29697-29794행) =====
function NeedsBoardCard({ citySlug, lang }: { citySlug: string; lang: string }) {
  const ko = lang === "ko";
  const [open, setOpen] = useState(false);
  const [needType, setNeedType] = useState("");
  const [desc, setDesc] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);

  const NEED_TYPES = ko
    ? ["주거", "취업", "법률", "의료", "관계·외로움", "긴급", "기타"]
    : ["Housing", "Job", "Legal", "Medical", "Connection", "Urgent", "Other"];

  const canSubmit = !!needType && !!desc.trim() && !!contact.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    postToServer({ category: "need", citySlug, name: needType, contact: contact.trim(), desc: desc.trim() });
    setSent(true);
    setNeedType(""); setDesc(""); setContact("");
    setTimeout(() => { setSent(false); setOpen(false); }, 3000);
  };

  if (sent) return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "20px 16px", marginBottom: 12, textAlign: "center" }}>
      <div style={{ marginBottom: 8 }}><CircleCheck size={24} strokeWidth={2} /></div>
      <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A", marginBottom: 4 }}>
        {ko ? "필요가 전달되었습니다" : "Your need has been sent"}
      </div>
      <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
        {ko ? "운영팀이 확인 후 연결해 드립니다" : "Our team will review and connect you soon"}
      </div>
    </div>
  );

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "16px", marginBottom: 12 }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: "#EF4444",
          boxShadow: "0 4px 12px #EF444455",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <LifeBuoy size={24} color="#fff" strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A", marginBottom: 3 }}>
            {ko ? "지금 도움이 필요하신가요?" : "Need help right now?"}
          </div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
            {ko ? "필요를 올리면 운영팀이 직접 연결해 드립니다" : "Post your need — our team will personally connect you"}
          </div>
        </div>
        <span style={{ color: "#6EE7B7", fontSize: 18, fontWeight: 700, flexShrink: 0, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>›</span>
      </div>

      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {NEED_TYPES.map(t => (
              <button key={t} onClick={() => setNeedType(t)}
                style={{
                  padding: "6px 12px", borderRadius: 20, fontSize: 11, fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 700,
                  border: needType === t ? "1px solid #6EE7B7" : "1px solid rgba(0,0,0,0.1)",
                  background: needType === t ? "rgba(110,231,183,0.12)" : "#fff",
                  color: needType === t ? "#0F9D6F" : "#475569",
                  cursor: "pointer",
                }}>{t}</button>
            ))}
          </div>
          <textarea
            value={desc} onChange={e => setDesc(e.target.value)}
            placeholder={ko ? "어떤 도움이 필요하신지 적어주세요" : "Describe what you need"}
            rows={3}
            style={{ width: "100%", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", resize: "none", marginBottom: 8, boxSizing: "border-box" as const, color: "#1B2A4A" }}
          />
          <input
            value={contact} onChange={e => setContact(e.target.value)}
            placeholder={ko ? "연락처 (전화 또는 이메일)" : "Contact (phone or email)"}
            style={{ width: "100%", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 10, boxSizing: "border-box" as const, color: "#1B2A4A" }}
          />
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
              background: canSubmit ? "#6EE7B7" : "rgba(0,0,0,0.06)",
              color: canSubmit ? "#0a3a28" : "rgba(0,0,0,0.3)",
              fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 13,
              cursor: canSubmit ? "pointer" : "default",
            }}>
            {ko ? "필요 보내기 →" : "Send Need →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ===== ServiceInterestCard (원래 HebronGuide.tsx 29800-29877행) =====
function ServiceInterestCard({ icon, color, category, nameKo, nameEn, descKo, descEn, citySlug, lang }: {
  icon: string; color: string; category: string;
  nameKo: string; nameEn: string; descKo: string; descEn: string;
  citySlug: string; lang: string;
}) {
  const ko = lang === "ko";
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const Icon = QM_ICON_MAP[icon];
  const canSubmit = !!contact.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    postToServer({ category, citySlug, name: nameKo, contact: contact.trim(), desc: note.trim() });
    setSent(true);
    setContact(""); setNote("");
    setTimeout(() => { setSent(false); setOpen(false); }, 3000);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "16px", marginBottom: 12 }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: color, boxShadow: `0 4px 12px ${color}55`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {Icon && <Icon size={24} color="#fff" strokeWidth={1.8} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A", marginBottom: 3 }}>
            {ko ? nameKo : nameEn}
          </div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 11, color: "#475569", lineHeight: 1.5 }}>
            {ko ? descKo : descEn}
          </div>
        </div>
        <span style={{ color, fontSize: 18, fontWeight: 700, flexShrink: 0, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}>›</span>
      </div>

      {sent ? (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.06)", textAlign: "center" }}>
          <div style={{ marginBottom: 4 }}><CircleCheck size={19} strokeWidth={2} /></div>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 700, fontSize: 13, color: "#1B2A4A" }}>
            {ko ? "관심 등록 완료! 준비되면 연락드립니다" : "Registered! We'll reach out when ready"}
          </div>
        </div>
      ) : open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <input
            value={contact} onChange={e => setContact(e.target.value)}
            placeholder={ko ? "연락처 (전화 또는 이메일)" : "Contact (phone or email)"}
            style={{ width: "100%", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 8, boxSizing: "border-box" as const, color: "#1B2A4A" }}
          />
          <input
            value={note} onChange={e => setNote(e.target.value)}
            placeholder={ko ? "한마디 (선택, 예: 평일 오전 선호)" : "Note (optional)"}
            style={{ width: "100%", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 10, boxSizing: "border-box" as const, color: "#1B2A4A" }}
          />
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
              background: canSubmit ? color : "rgba(0,0,0,0.06)",
              color: canSubmit ? "#fff" : "rgba(0,0,0,0.3)",
              fontFamily: "Geist,Pretendard Variable,sans-serif", fontWeight: 800, fontSize: 13,
              cursor: canSubmit ? "pointer" : "default",
            }}>
            {ko ? "관심 등록 →" : "Register Interest →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ===== ConnectScreen (원래 HebronGuide.tsx 29882-29913행) =====
function ConnectScreen({ onHome }: { onHome?: () => void }) {
  const { lang } = useI18n();
  const ko = lang === "ko";
  const city = useCityConfig();

  return (
    <div style={{ paddingBottom: 96, background: "#F2F2F7", minHeight: "100vh" }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🤝" titleKo="사람 연결" titleEn="People Connect"
        descKo={`${city.nameKo} — 한인 커뮤니티 연결 서비스`}
        descEn={`${city.nameEn} — Korean community connection services`}
        accentColor="#10B981" light />
      <div style={{ padding: "16px" }}>
        <NeedsBoardCard citySlug={city.slug} lang={lang} />
        {[
          { icon: "car",       color: "#3B82F6", category: "interest_ride",  nameKo: "헤브론 라이드", nameEn: "Hebron Ride", descKo: "공항 픽업·일상 이동 — 한국어로 맞이하는 첫 이동", descEn: "Airport pickup & daily rides — your first ride in Korean" },
          { icon: "home",      color: "#F59E0B", category: "interest_stay",  nameKo: "헤브론 스테이", nameEn: "Hebron Stay", descKo: "단기 숙박·정착 동반 — 한인 가정에서 시작하는 정착", descEn: "Short-term stay & settlement support" },
          { icon: "book-open", color: "#8B5CF6", category: "interest_tutor", nameKo: "헤브론 튜터", nameEn: "Hebron Tutor", descKo: "수학·SAT·한국어 — 한인 선배가 직접 가르칩니다", descEn: "Math, SAT & Korean — learn from Korean mentors" },
          { icon: "heart",     color: "#EC4899", category: "interest_match", nameKo: "헤브론 매칭", nameEn: "Hebron Match", descKo: "진지하고 따뜻한 만남 — 같은 가치관의 사람을 찾습니다", descEn: "Thoughtful connections with shared values" },
          { icon: "map",       color: "#10B981", category: "interest_tour",  nameKo: "헤브론 관광", nameEn: "Hebron Tour", descKo: "현지 한인 가이드와 함께하는 진짜 도시 탐방", descEn: "Real city exploration with local Korean guides" },
        ].map((svc, i) => (
          <ServiceInterestCard key={i} {...svc} citySlug={city.slug} lang={lang} />
        ))}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "16px", textAlign: "center" }}>
          <div style={{ fontFamily: "Geist,Pretendard Variable,sans-serif", fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>
            {ko ? "더 많은 서비스가 곧 추가됩니다" : "More services coming soon"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== UpdateBanner (원래 HebronGuide.tsx 30566-30599행) =====
function UpdateBanner() {
  const { lang } = useI18n();
  const [visible, setVisible] = useState(() => {
    return safeStorage.get(BANNER_ID) !== "dismissed";
  });
  if (!visible) return null;
  const dismiss = () => {
    safeStorage.set(BANNER_ID, "dismissed");
    setVisible(false);
  };
  return (
    <div style={{
      background: "linear-gradient(90deg,#1a3a2a,#1e4a2e)",
      borderBottom: "1px solid rgba(134,239,172,0.2)",
      padding: "9px 16px 9px 14px",
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 13, color: "#86EFAC", lineHeight: 1.4,
    }}>
      <span style={{ flex: 1 }}>
        {lang === "en" ? BANNER_MSG.en : BANNER_MSG.ko}
        {BANNER_KAKAOTALK && (
          <a href={BANNER_KAKAOTALK} target="_blank" rel="noopener noreferrer"
            style={{ marginLeft: 8, color: "#FDE047", textDecoration: "underline", fontSize: 12 }}>
            {lang === "en" ? "Subscribe KakaoTalk →" : "카카오채널 구독 →"}
          </a>
        )}
      </span>
      <button onClick={dismiss}
        style={{ background: "none", border: "none", color: "#86EFAC", fontSize: 18,
          cursor: "pointer", padding: "0 2px", lineHeight: 1, flexShrink: 0, opacity: 0.7 }}
        aria-label="닫기">×</button>
    </div>
  );
}

// ===== AppInstallBanner (원래 HebronGuide.tsx 30607-30747행) =====
function AppInstallBanner() {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { lang } = useI18n();
  const ko = lang === "ko";

  useEffect(() => {
    if (safeStorage.get("hg_install_dismissed")) return;
    // 이미 설치된 경우 숨김
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Android/Desktop: beforeinstallprompt 이벤트
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler as any);

    // iOS: Safari + standalone 아닌 경우
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    if (isIOS && isSafari) setShow(true);

    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") { setShow(false); setDeferredPrompt(null); }
    } else {
      setShowModal(true);
    }
  };

  const dismiss = () => {
    setShow(false);
    safeStorage.set("hg_install_dismissed", "1");
  };

  if (!show) return null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <>
      {/* 슬림 배너 */}
      <div style={{
        background: "linear-gradient(90deg,#1a1a2e,#16213e)",
        borderBottom: "1px solid rgba(242,153,74,0.3)",
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px", zIndex: 200,
      }}>
        <EmojiIcon emoji={"📲"} size={18} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#F2994A", fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
            {ko ? "앱으로 설치하면 더 편합니다!" : "Install as an app for quick access!"}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
            {ko ? "컴퓨터·아이폰·안드로이드 모두 가능" : "Works on iPhone, Android & Computer"}
          </div>
        </div>
        <button onClick={handleInstall} style={{
          background: "#F2994A", color: "#fff", border: "none",
          borderRadius: 8, padding: "5px 12px", fontWeight: 700,
          fontSize: 11, cursor: "pointer", fontFamily: "Geist,Pretendard Variable,sans-serif", flexShrink: 0,
        }}>
          {ko ? "설치하기" : "Install"}
        </button>
        <button onClick={dismiss} style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.4)",
          fontSize: 16, cursor: "pointer", padding: "0 4px", flexShrink: 0,
        }}>×</button>
      </div>

      {/* 설치 방법 모달 */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#1a1a2e", borderRadius: "24px 24px 0 0",
            padding: "24px 20px 36px", width: "100%", maxWidth: 480,
            border: "1px solid rgba(242,153,74,0.3)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <EmojiIcon emoji={"📲"} size={25} />
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "Geist,Pretendard Variable,sans-serif", marginTop: 6 }}>
                {ko ? "HebronGuide 앱 설치" : "Install HebronGuide App"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4, fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
                {ko ? "홈 화면에 추가하면 앱처럼 빠르게 실행됩니다" : "Add to home screen to launch like a native app"}
              </div>
            </div>

            {/* iPhone/iPad */}
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F2994A", marginBottom: 8, fontFamily: "Geist,Pretendard Variable,sans-serif" }}><EmojiIcon emoji={"🍎"} size={13} /> iPhone / iPad</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
                1. Safari로 hebronguide.com 접속<br/>
                2. 하단 <strong style={{color:"#F2994A"}}>공유 버튼(□↑)</strong> 탭<br/>
                3. <strong style={{color:"#F2994A"}}>"홈 화면에 추가"</strong> 선택 → 추가
              </div>
            </div>

            {/* Android */}
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F2994A", marginBottom: 8, fontFamily: "Geist,Pretendard Variable,sans-serif" }}><EmojiIcon emoji={"🤖"} size={13} /> Android</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
                1. Chrome으로 hebronguide.com 접속<br/>
                2. 우측 상단 <strong style={{color:"#F2994A"}}>메뉴(⋮)</strong> 탭<br/>
                3. <strong style={{color:"#F2994A"}}>"홈 화면에 추가"</strong> → 설치
              </div>
            </div>

            {/* PC */}
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F2994A", marginBottom: 8, fontFamily: "Geist,Pretendard Variable,sans-serif" }}><EmojiIcon emoji={"💻"} size={13} /> 컴퓨터 (Chrome / Edge)</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.8, fontFamily: "Geist,Pretendard Variable,sans-serif" }}>
                1. 주소창 오른쪽 <strong style={{color:"#F2994A"}}>⊕ 설치 아이콘</strong> 클릭<br/>
                2. <strong style={{color:"#F2994A"}}>"설치"</strong> 클릭 → 바탕화면에 앱 생성
              </div>
            </div>

            <button onClick={() => setShowModal(false)} style={{
              width: "100%", background: "#F2994A", color: "#fff", border: "none",
              borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "Geist,Pretendard Variable,sans-serif",
            }}>
              {ko ? "확인했습니다" : "Got it!"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

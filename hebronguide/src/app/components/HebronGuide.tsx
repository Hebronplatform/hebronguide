/**
 * HebronGuide - Seattle 정착 가이드 PWA
 *
 * ══ DESIGN SYSTEM ══════════════════════════════════════════
 * Background:  #1a2535  (soft dark navy — 20-30% lighter than #0d1117)
 * Surface:     #212d3d  (slightly lighter dark card)
 * Surface-2:   #273444  (slightly lighter dark)
 * Gold accent: #C9A227
 * Mint accent: #6EE7B7
 * Text-1:      #ECFDF5
 * Text-2:      rgba(236,253,245,0.5)
 * Text-3:      rgba(236,253,245,0.6)
 *
 * Tab structure (v3):
 *   🏠 홈   | 🛬 정착  | ⛪ 교회  | 🍽️ 맛집  | 🌆 탐방  | 💼 취업  | 🎓 교육  | 💰 생활비  | 🆘 도움
 * ══════════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import svgPaths from "../../imports/svg-uguh2ql8id";
const imgHeroCard = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Seattle_Kerry_Park_Skyline.jpg/1280px-Seattle_Kerry_Park_Skyline.jpg";
const imgCoffee = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80";
const imgLifestyle = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80";
import logoImg from "../../imports/icon-192.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useI18n } from "./I18nContext";
import { useContent, resolvePlaceItems, resolveStepItems } from "./ContentContext";
import {
  Church,
  Home,
  Compass,
  UtensilsCrossed,
  Map,
  LifeBuoy,
  Briefcase,
  GraduationCap,
  DollarSign,
} from "lucide-react";

/* ─────────────────────────────────────────
   TOKENS
───────────────────────────────────────── */
const GOLD = "#C9A227";
const MINT = "#6EE7B7";

/* ─────────────────────────────────────────
   ICON COMPONENT
───────────────────────────────────────── */
interface IconBoxProps {
  pathKey: keyof typeof svgPaths;
  vb: string;
  fill?: string;
}
function IconBox({ pathKey, vb, fill = "#1B4332" }: IconBoxProps) {
  return (
    <svg fill="none" preserveAspectRatio="none" viewBox={vb} className="w-full h-full">
      <path d={svgPaths[pathKey]} fill={fill} />
    </svg>
  );
}

/* ─────────────────────────────────────────
   DUAL CLOCK WIDGET
───────────────────────────────────────── */
function DualClock() {
  const { lang } = useI18n();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fmtTime = (date: Date, tz: string) =>
    date.toLocaleTimeString(lang === "ko" ? "ko-KR" : "en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const fmtDate = (date: Date, tz: string) =>
    date.toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const seattleTime = fmtTime(now, "America/Los_Angeles");
  const seattleDate = fmtDate(now, "America/Los_Angeles");
  const koreaTime = fmtTime(now, "Asia/Seoul");
  const koreaDate = fmtDate(now, "Asia/Seoul");

  const label = {
    seattle: lang === "ko" ? "시애틀" : "Seattle",
    korea: lang === "ko" ? "한국" : "Korea",
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(201,162,39,0.07) 0%, rgba(110,231,183,0.05) 100%)",
        border: "1px solid rgba(201,162,39,0.18)",
        borderRadius: 14,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* Seattle */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, paddingRight: 12, borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11 }}>🇺🇸</span>
          <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9, color: GOLD, letterSpacing: "0.6px", textTransform: "uppercase" }}>
            {label.seattle}
          </span>
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 15, color: "#ECFDF5", letterSpacing: "-0.3px", lineHeight: 1 }}>
          {seattleTime}
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "rgba(236,253,245,0.5)" }}>
          {seattleDate}
        </div>
      </div>

      {/* 시차 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 10px", gap: 1 }}>
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 8, color: "rgba(255,255,255,0.22)", letterSpacing: "0.4px" }}>
          {lang === "ko" ? "시차" : "GAP"}
        </span>
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 11, color: MINT }}>+17h</span>
      </div>

      {/* Korea */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 11 }}>🇰🇷</span>
          <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9, color: MINT, letterSpacing: "0.6px", textTransform: "uppercase" }}>
            {label.korea}
          </span>
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 15, color: "#ECFDF5", letterSpacing: "-0.3px", lineHeight: 1 }}>
          {koreaTime}
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "rgba(236,253,245,0.5)" }}>
          {koreaDate}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTION DIVIDER
───────────────────────────────────────── */
function SectionDivider() {
  return (
    <div className="w-full h-px my-1" style={{
      background: "linear-gradient(90deg, transparent 0%, rgba(110,231,183,0.15) 30%, rgba(201,162,39,0.2) 60%, transparent 100%)"
    }} />
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
interface StatCardProps { label: string; value: string; icon?: React.ReactNode; }
function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="relative rounded-[16px] p-[16px] flex flex-col gap-[6px] transition-all duration-200 hover:scale-105" style={{
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 4px 24px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.08)"
    }}>
      <span className="uppercase tracking-[0.6px]" style={{ color: "rgba(236,253,245,0.6)", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9 }}>{label}</span>
      <div className="flex items-end gap-[5px]">
        <span style={{ color: "#ECFDF5", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 22, lineHeight: 1 }}>{value}</span>
        {icon && <span className="mb-[2px]">{icon}</span>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   WEATHER ICON
───────────────────────────────────────── */
function WeatherIcon() {
  return (
    <div style={{ width: 14, height: 14 }}>
      <IconBox pathKey="p2f20c300" vb="0 0 15.75 15.25" fill={MINT} />
    </div>
  );
}

/* ─────────────────────────────────────────
   HERO CARD
───────────────────────────────────────── */
function HeroCard() {
  const { t } = useI18n();
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 480, borderRadius: 28, boxShadow: "0 32px 64px -12px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)" }}>
      <img src={imgHeroCard} alt="시애틀 전경" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 40%", filter: "brightness(1.2) saturate(1.6) hue-rotate(-30deg)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,50,140,0.12) 0%, rgba(1,30,20,0.04) 45%, rgba(1,22,13,0.80) 100%)" }} />
      <div className="absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(180deg, rgba(10,60,180,0.22) 0%, transparent 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-[20px] p-[28px]">
        <div className="flex flex-col gap-[6px]">
          <div className="self-start px-[10px] py-[3px] rounded-[10px]" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span className="uppercase tracking-[1.2px]" style={{ color: "#ECFDF5", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9 }}>{t("hero.badge")}</span>
          </div>
          <h1 className="m-0 p-0" style={{ fontFamily: "'Noto Sans KR', 'WenQuanYi Zen Hei', sans-serif", fontWeight: 700, fontSize: 38, letterSpacing: "-1.5px", lineHeight: 1.18, color: "#FFFFFF", textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
            {t("hero.title")}
          </h1>
          <p className="m-0 uppercase tracking-[0.5px]" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 300, fontSize: 12, color: "rgba(209,250,229,0.65)", letterSpacing: "0.4px" }}>
            {t("hero.sub")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
          <a href="https://forecast.weather.gov/MapClick.php?CityName=Seattle&state=WA&site=SEW" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <StatCard label={t("stat.temp")} value="58°F" icon={<WeatherIcon />} />
          </a>
          <StatCard label={t("stat.pop")} value="737K" />
          <StatCard label={t("stat.rent")} value="$2.4K" />
          <StatCard label={t("stat.community")} value="165K+" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CATEGORY ITEM
───────────────────────────────────────── */
interface CategoryItemProps {
  label: string;
  pathKey: keyof typeof svgPaths;
  vb: string;
  active?: boolean;
  onClick?: () => void;
}
function CategoryItem({ label, pathKey, vb, active = false, onClick }: CategoryItemProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[8px] cursor-pointer border-0 bg-transparent p-0 hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-center" style={{
        width: 60, height: 60, borderRadius: 18,
        background: active ? "rgba(110,231,183,0.12)" : "#273444",
        boxShadow: active ? `0 0 0 1.5px ${MINT}, 0 4px 12px rgba(0,0,0,0.1)` : "0 2px 8px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        border: active ? `1.5px solid ${MINT}` : "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.2s ease"
      }}>
        <div style={{ width: 24, height: 24 }}>
          <IconBox pathKey={pathKey} vb={vb} fill={active ? MINT : "rgba(236,253,245,0.6)"} />
        </div>
      </div>
      <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 11, color: active ? MINT : "rgba(236,253,245,0.5)", transition: "color 0.2s ease" }}>
        {label}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────
   SETTLE FIRST SECTION (홈 탭용)
───────────────────────────────────────── */
function SettleFirstSection({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  const { t } = useI18n();
  return (
    <section className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-[10px]">
        <div className="pl-[12px]" style={{ borderLeft: `3px solid ${GOLD}` }}>
          <h2 className="m-0" style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: "#ECFDF5" }}>
            {t("settle.title")}
          </h2>
        </div>
        <div className="px-[10px] py-[3px] rounded-[10px]" style={{ border: `1px solid rgba(110,231,183,0.3)`, background: "rgba(110,231,183,0.08)" }}>
          <span className="uppercase tracking-[0.5px]" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 10, color: MINT }}>
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

/* ─────────────────────────────────────────
   BAR CHART DECOR
───────────────────────────────────────── */
function BarChartDecor() {
  const bars = [3, 5, 7, 5, 6, 8, 4];
  const max = 8;
  return (
    <div className="flex items-end gap-[3px]" style={{ height: 20 }}>
      {bars.map((h, i) => (
        <div key={i} style={{ width: 4, height: (h / max) * 20, borderRadius: 2, background: `linear-gradient(180deg, ${GOLD} 0%, rgba(201,162,39,0.4) 100%)` }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   ARTICLE CARD
───────────────────────────────────────── */
interface ArticleCardProps {
  imageSrc: string;
  category: string;
  title: string;
  excerpt: string;
  readTime?: string;
  isLarge?: boolean;
}
function ArticleCard({ imageSrc, category, title, excerpt, readTime = "5분", isLarge = false }: ArticleCardProps) {
  const { t } = useI18n();
  return (
    <div className="relative overflow-hidden flex flex-col" style={{ borderRadius: 20, background: "#212d3d", boxShadow: "0 8px 32px rgba(255,255,255,0.08), 0 2px 8px rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="relative overflow-hidden" style={{ height: isLarge ? 220 : 160 }}>
        <ImageWithFallback src={imageSrc} alt={title} className="w-full h-full object-cover" style={{ transition: "transform 0.4s ease" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(1,22,13,0.6) 70%, rgba(1,22,13,0.95) 100%)" }} />
        <div className="absolute bottom-[12px] left-[14px]">
          <div className="px-[10px] py-[3px] rounded-[10px]" style={{ background: "rgba(185,236,238,0.55)", backdropFilter: "blur(8px)" }}>
            <span className="uppercase tracking-[0.8px]" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9, color: "#356668" }}>{category}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-[8px] px-[16px] py-[14px]">
        <h3 className="m-0" style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: isLarge ? 700 : 600, fontSize: isLarge ? 18 : 15, lineHeight: 1.45, color: "#ECFDF5", letterSpacing: "-0.3px" }}>{title}</h3>
        <p className="m-0" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 400, fontSize: 12, lineHeight: 1.6, color: "rgba(236,253,245,0.5)" }}>{excerpt}</p>
        <div className="flex items-center gap-[6px] mt-[2px]">
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD }} />
          <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 10, color: "rgba(201,162,39,0.75)" }}>{readTime}{t("readtime.suffix")}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   LIFESTYLE TIPS SECTION
───────────────────────────────────────── */
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
          <h2 className="m-0" style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.5px", color: "#ECFDF5" }}>
            {t("tips.title")}
          </h2>
        </div>
        <span className="uppercase tracking-[0.5px] self-end mb-[2px]" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 10, color: "rgba(201,162,39,0.65)" }}>
          {t("tips.sub")}
        </span>
      </div>
      <div className="flex flex-col gap-[14px]">
        {articles.map((a, i) => <ArticleCard key={i} {...a} />)}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   QUICK CHIPS
───────────────────────────────────────── */
function QuickChips() {
  const { t } = useI18n();
  const chipKeys = ["chip.all", "chip.visa", "chip.housing", "chip.school", "chip.jobs", "chip.community"] as const;
  const [active, setActive] = useState(0);
  return (
    <div className="flex gap-[8px] overflow-x-auto pb-[2px]" style={{ scrollbarWidth: "none" }}>
      {chipKeys.map((key, i) => (
        <button key={i} onClick={() => setActive(i)} className="flex-shrink-0 px-[14px] py-[6px] rounded-[20px] border-0 cursor-pointer hover:scale-105 active:scale-95"
          style={{ background: i === active ? `rgba(201,162,39,0.15)` : "rgba(255,255,255,0.04)", border: `1px solid ${i === active ? "rgba(201,162,39,0.5)" : "rgba(255,255,255,0.08)"}`, fontFamily: "Manrope,sans-serif", fontWeight: i === active ? 700 : 500, fontSize: 12, color: i === active ? GOLD : "rgba(236,253,245,0.5)", transition: "all 0.2s ease" }}>
          {t(key)}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   ANNOUNCEMENT BANNER
───────────────────────────────────────── */
function AnnouncementBanner() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-[10px] px-[14px] py-[10px] rounded-[14px]" style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.12) 0%, rgba(201,162,39,0.06) 100%)", border: "1px solid rgba(201,162,39,0.25)" }}>
      <span style={{ fontSize: 14 }}>📢</span>
      <div className="flex flex-col gap-[1px] flex-1 min-w-0">
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: GOLD }}>{t("announce.tag")} · {t("announce.title")}</span>
        <span className="truncate" style={{ fontFamily: "Manrope,sans-serif", fontWeight: 400, fontSize: 10, color: "rgba(201,162,39,0.65)" }}>{t("announce.body")}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ── SHARED SCREEN COMPONENTS ──────────────
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   SCREEN HEADER (각 탭 상단 제목 영역)
───────────────────────────────────────── */
interface ScreenHeaderProps {
  emoji: string;
  titleKo: string;
  titleEn: string;
  descKo: string;
  descEn: string;
  accentColor: string;
}
function ScreenHeader({ emoji, titleKo, titleEn, descKo, descEn, accentColor }: ScreenHeaderProps) {
  const { lang } = useI18n();
  return (
    <div className="px-[20px] pt-[24px] pb-[20px]" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-[14px]">
        <div className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 16, background: `${accentColor}22`, border: `1px solid ${accentColor}44`, fontSize: 26 }}>
          {emoji}
        </div>
        <div>
          <h2 className="m-0" style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "-0.5px", color: "#ECFDF5" }}>
            {lang === "ko" ? titleKo : titleEn}
          </h2>
          <p className="m-0 mt-[3px]" style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)" }}>
            {lang === "ko" ? descKo : descEn}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SUB TAB BAR (탭 안의 서브탭)
───────────────────────────────────────── */
function SubTabBar({ tabs, active, onChange, accentColor = "rgba(255,255,255,0.9)" }: { tabs: string[]; active: number; onChange: (i: number) => void; accentColor?: string }) {
  return (
    <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      {tabs.map((tab, i) => (
        <button key={i} onClick={() => onChange(i)} className="flex-shrink-0 border-0 cursor-pointer hover:opacity-80"
          style={{ padding: "10px 16px", background: "transparent", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: i === active ? "#ECFDF5" : "rgba(236,253,245,0.5)", borderBottom: i === active ? `2px solid ${accentColor}` : "2px solid transparent", whiteSpace: "nowrap", transition: "all 0.2s ease" }}>
          {tab}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   INFO CARD (정보 카드 — 범용)
───────────────────────────────────────── */
interface InfoCardProps {
  title: string;
  accentColor?: string;
  children: React.ReactNode;
}
function InfoCard({ title, accentColor = "rgba(255,255,255,0.25)", children }: InfoCardProps) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, marginBottom: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${accentColor}` }}>
      {title && (
        <div style={{ padding: "14px 18px 10px" }}>
          <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 800, fontSize: 14, color: "#ECFDF5", letterSpacing: "-0.2px" }}>{title}</div>
        </div>
      )}
      <div style={{ padding: title ? "0 18px 16px" : "16px 18px" }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   STEP ITEM (순서가 있는 체크리스트)
───────────────────────────────────────── */
function StepItem({ num, title, desc, accentColor = MINT }: { num: number; title: string; desc: string; accentColor?: string }) {
  return (
    <div className="flex gap-[12px]" style={{ marginBottom: 14 }}>
      <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: "50%", background: `${accentColor}22`, border: `1px solid ${accentColor}55`, marginTop: 1 }}>
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 11, color: accentColor }}>{num}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: "#ECFDF5", marginBottom: 3 }}>{title}</div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.65, color: "rgba(236,253,245,0.6)" }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PLACE CARD (맛집·탐방 카드)
───────────────────────────────────────── */
function PlaceCard({ emoji, name, nameEn, desc, tags, accentColor = MINT }: { emoji: string; name: string; nameEn?: string; desc: string; tags?: string[]; accentColor?: string }) {
  return (
    <div className="transition-all duration-200 hover:scale-[1.02] hover:border-opacity-20" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-start gap-[12px]">
        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 13, background: `${accentColor}18`, fontSize: 20 }}>
          {emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14, color: "#ECFDF5" }}>{name}</div>
          {nameEn && <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{nameEn}</div>}
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.6, color: "rgba(236,253,245,0.6)", marginTop: 5 }}>{desc}</div>
          {tags && (
            <div className="flex flex-wrap gap-[5px] mt-[8px]">
              {tags.map((tag, i) => (
                <span key={i} style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}33`, color: accentColor, borderRadius: 8, padding: "2px 8px", fontSize: 10, fontFamily: "Manrope,sans-serif", fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   EMERGENCY ROW
───────────────────────────────────────── */
function EmergencyRow({ emoji, title, number, desc }: { emoji: string; title: string; number: string; desc: string }) {
  return (
    <a href={`tel:${number.replace(/\D/g, "")}`} className="transition-colors duration-200 hover:bg-[rgba(248,113,113,0.08)]" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}>
      <div style={{ width: 42, height: 42, borderRadius: 13, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 14, color: "#ECFDF5" }}>{title}</div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 16, color: "#F87171" }}>{number}</div>
    </a>
  );
}

/* ═══════════════════════════════════════════
   ── TAB SCREENS ───────────────────────────
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   TAB 1: 홈 SCREEN
───────────────────────────────────────── */
function HomeScreen({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  return (
    <div className="flex flex-col gap-[28px] md:gap-[36px] px-[16px] md:px-[24px] lg:px-[32px] pt-[20px]" style={{ paddingBottom: 96 }}>
      <HeroCard />
      <SectionDivider />
      <QuickChips />
      <SectionDivider />
      <SettleFirstSection onNavigate={onNavigate} />
      <SectionDivider />
      <AnnouncementBanner />
      <SectionDivider />
      <LifestyleTipsSection />
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 2: 정착 SCREEN
───────────────────────────────────────── */
function SettleScreen() {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["1주차", "1개월", "3개월", "행정", "재정"]
    : ["Week 1", "Month 1", "Month 3", "Admin", "Finance"];

  const accent = "#60A5FA";

  const week1Ko = [
    { title: "임시 거주지 확보", desc: "한인 민박, 에어비앤비, 단기 렌탈로 시작. H-Mart·Lynnwood 한인타운 인근 권장" },
    { title: "휴대폰 개통", desc: "T-Mobile, AT&T, Mint Mobile. 여권+비자로 개통 가능. 선불폰부터 시작" },
    { title: "SSN (사회보장번호) 신청", desc: "고용 비자 소지자 입국 10일 후 신청. SSA 오피스 방문 (시애틀 다운타운)" },
    { title: "은행 계좌 개설 준비", desc: "여권·비자·주소 증명 준비. Chase, Wells Fargo, WA Federal 방문" },
    { title: "한인 커뮤니티 연결", desc: "카카오오픈채팅 '시애틀한인', H-Mart 커뮤니티 보드, 교회 방문" },
  ];
  const week1En = [
    { title: "Secure temporary housing", desc: "Korean homestay, Airbnb, or short-term rental. Near H-Mart or Lynnwood Koreatown recommended" },
    { title: "Activate phone", desc: "T-Mobile, AT&T, or Mint Mobile. Passport + visa sufficient. Prepaid is fine to start" },
    { title: "Apply for SSN", desc: "For work visa holders: apply 10 days after arrival. Visit SSA office in Downtown Seattle" },
    { title: "Prepare to open bank account", desc: "Bring passport, visa, address proof. Visit Chase, Wells Fargo, or WA Federal" },
    { title: "Connect to Korean community", desc: "KakaoTalk Open Chat '시애틀한인', H-Mart community board, visit a Korean church" },
  ];

  const month1Ko = [
    { title: "WA 운전면허 취득", desc: "필기시험(영어/한국어 선택) → 도로주행시험. Everett·Bellevue DOL 권장 (대기 적음)" },
    { title: "건강보험 등록", desc: "직장 보험 없으면 Washington Apple Health (Medicaid) 또는 WA Healthplanfinder 마켓플레이스" },
    { title: "자녀 학교 등록", desc: "해당 학군 거주 증명 필수 (임대 계약서). 공립학교 무료, 영어 ESL 지원" },
    { title: "중고차 구매 고려", desc: "대중교통 제한적 → 차량 필수. CARFAX 확인, 한인 딜러 활용 가능" },
    { title: "우편함 주소 확보", desc: "영구 주소 없으면 UPS Store 사서함 대안. 모든 행정 서류에 필요" },
  ];
  const month1En = [
    { title: "Get WA Driver License", desc: "Written test (English or Korean) → road test. Everett or Bellevue DOL recommended (shorter wait)" },
    { title: "Enroll in health insurance", desc: "No employer plan? Try Washington Apple Health (Medicaid) or WA Healthplanfinder marketplace" },
    { title: "Enroll children in school", desc: "Proof of residency required (lease agreement). Public school is free; ESL support available" },
    { title: "Consider buying a used car", desc: "Public transit is limited → car is essential. Check CARFAX; Korean dealers can help" },
    { title: "Secure a mailing address", desc: "No permanent address? Use UPS Store mailbox. Required for all government correspondence" },
  ];

  const month3Ko = [
    { title: "신용카드 빌드 시작", desc: "Secured Card (Capital One, Discover it) 발급 → 6개월 후 일반 카드로 업그레이드" },
    { title: "세금 ID (ITIN) 신청", desc: "SSN 없는 비자 소지자. IRS Form W-7 작성. 한인 CPA 도움 권장" },
    { title: "비자 상태·기간 재확인", desc: "I-94 만료일 체크 (cbp.dhs.gov). 연장·전환 필요시 이민 변호사 상담" },
    { title: "장기 렌탈 계약", desc: "신용 이력 부족 → 더 큰 보증금 또는 한인 집주인 우선 탐색" },
    { title: "세금신고 준비 (연말)", desc: "한국 소득 있으면 FBAR/FATCA 申告 필요. 한인 회계사 상담 필수" },
  ];
  const month3En = [
    { title: "Start building credit", desc: "Apply for Secured Card (Capital One, Discover it) → upgrade to regular card after 6 months" },
    { title: "Apply for ITIN", desc: "For non-SSN visa holders. File IRS Form W-7. Korean CPA help recommended" },
    { title: "Recheck visa status & expiry", desc: "Check I-94 at cbp.dhs.gov. Consult immigration attorney for extension/change" },
    { title: "Sign long-term lease", desc: "Limited credit? Offer larger deposit or look for Korean landlords first" },
    { title: "Prepare for tax season", desc: "Korea income? FBAR/FATCA filing required. Korean accountant consultation essential" },
  ];

  const adminKo = [
    { title: "SSN 신청", desc: "사회보장청(SSA) 오피스 | 2201 6th Ave, Seattle | 전화: 800-772-1213" },
    { title: "WA 운전면허 (DOL)", desc: "Lynnwood DOL: 18918 33rd Ave W | Everett DOL: 3601 Wetmore Ave" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장" },
    { title: "영주권·비자 갱신", desc: "USCIS 공식 사이트: uscis.gov | Lynnwood 이민 변호사 다수 활동" },
    { title: "시민권 신청 (N-400)", desc: "영주권 5년 후 신청 가능 | 영어·시민권 시험 준비 클래스 교회에서 운영" },
  ];
  const adminEn = [
    { title: "SSN Application", desc: "Social Security Office | 2201 6th Ave, Seattle | Phone: 800-772-1213" },
    { title: "WA Driver License (DOL)", desc: "Lynnwood DOL: 18918 33rd Ave W | Everett DOL: 3601 Wetmore Ave" },
    { title: "ITIN Application", desc: "Tax ID for non-SSN holders | IRS Form W-7 | Korean CPA assistance recommended" },
    { title: "Green Card / Visa Renewal", desc: "USCIS official site: uscis.gov | Many immigration attorneys active in Lynnwood" },
    { title: "Citizenship (N-400)", desc: "Eligible 5 years after green card | English & civics prep classes at Korean churches" },
  ];

  const financeKo = [
    { title: "Chase Total Checking", desc: "한인 커뮤니티 추천 1위. 전국 ATM 많음. $500 개설 보너스 이벤트 자주 있음" },
    { title: "WA Federal Credit Union", desc: "시애틀 한인 선호 신협. 자동차 대출 금리 경쟁력 있음" },
    { title: "신용카드 빌드 순서", desc: "Secured → 1년 후 Quicksilver / Freedom → 2년 후 Chase Sapphire 목표" },
    { title: "WA 세금 특이사항", desc: "주 소득세 없음 (No State Income Tax). 판매세(Sales Tax) 약 10.2% (시애틀)" },
    { title: "은퇴 계좌 (401K/IRA)", desc: "직장 401K 매칭 100% 챙기기. Roth IRA는 영주권·시민권 이후 장기 투자" },
  ];
  const financeEn = [
    { title: "Chase Total Checking", desc: "#1 in Korean community. Many ATMs nationwide. Frequent $500 opening bonus offers" },
    { title: "WA Federal Credit Union", desc: "Korean community favorite. Competitive auto loan rates" },
    { title: "Credit building order", desc: "Secured → Quicksilver/Freedom (1yr) → Chase Sapphire (2yr target)" },
    { title: "WA tax highlights", desc: "No State Income Tax. Sales Tax ~10.2% in Seattle" },
    { title: "Retirement accounts (401K/IRA)", desc: "Max employer 401K match. Roth IRA best started after green card/citizenship" },
  ];

  const serverKeys = ["settle_week1", "settle_month1", "settle_month3", "settle_admin", "settle_finance"];
  const serverData = serverContent[serverKeys[sub] as keyof typeof serverContent];
  const items = serverData
    ? resolveStepItems(serverData, lang)
    : (lang === "ko"
      ? [week1Ko, month1Ko, month3Ko, adminKo, financeKo][sub]
      : [week1En, month1En, month3En, adminEn, financeEn][sub]);

  return (
    <div style={{ paddingBottom: 96 }}>
      <ScreenHeader emoji="🛬" titleKo="정착 가이드" titleEn="Settlement Guide"
        descKo="이민·이주자를 위한 단계별 정착 안내" descEn="Step-by-step guide for immigrants & newcomers"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <InfoCard title="" accentColor={accent}>
          {items.map((item, i) => (
            <StepItem key={i} num={i + 1} title={item.title} desc={item.desc} accentColor={accent} />
          ))}
        </InfoCard>
        {/* 팁 배너 */}
        <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>💡 {lang === "ko" ? "한인 커뮤니티 팁" : "Korean Community Tip"}</div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
            {lang === "ko"
              ? "카카오오픈채팅 '시애틀한인' 검색 — 실시간 정착 정보, 중고물품 거래, 룸메이트 구하기 등 활발하게 운영 중"
              : "Search KakaoTalk Open Chat '시애틀한인' — active community for real-time settlement tips, used goods, and roommate search"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 3: 교회 SCREEN
───────────────────────────────────────── */
function ChurchScreen() {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["소개", "교회 목록", "프로그램", "새가족"]
    : ["About", "Churches", "Programs", "New Members"];
  const accent = "#C084FC";

  const defaultChurches = [
    { emoji: "⛪", name: "시애틀 연합감리교회", nameEn: "Seattle Korean UMC", desc: lang === "ko" ? "1965년 설립. 시애틀 한인 최초·최대 교회. 다운타운·벨뷰 등 다수 캠퍼스" : "Est. 1965. Oldest & largest Korean church in Seattle. Multiple campuses", tags: ["감리교", "다운타운", "다세대"] },
    { emoji: "⛪", name: "에베소장로교회", nameEn: "Ephesus Korean Presbyterian", desc: lang === "ko" ? "Lynnwood 한인타운 중심. 청년·가족 중심 활발한 공동체. 한국어·영어 예배" : "Heart of Lynnwood Koreatown. Vibrant youth & family community", tags: ["장로교", "린우드", "청년"] },
    { emoji: "⛪", name: "시애틀 한인침례교회", nameEn: "Seattle Korean Baptist", desc: lang === "ko" ? "Kirkland 소재. 영어권 2세 예배(EBF) 활발. 이민자 정착 지원 프로그램 운영" : "Located in Kirkland. Active English worship (EBF). Immigration support programs", tags: ["침례교", "커클랜드", "2세"] },
    { emoji: "⛪", name: "시애틀 순복음교회", nameEn: "Seattle Full Gospel Church", desc: lang === "ko" ? "Lynnwood. 치유 사역·중보기도 중심. 새 이민자 생활 상담 사역" : "Lynnwood. Healing & intercessory prayer ministry. Newcomer life counseling", tags: ["순복음", "린우드", "새이민자"] },
    { emoji: "⛪", name: "은혜와진리교회", nameEn: "Grace & Truth Church", desc: lang === "ko" ? "Bellevue 소재 청년·유학생 중심 교회. 영어 친화적 환경" : "Bellevue. Youth & international student focused. English-friendly environment", tags: ["벨뷰", "유학생", "청년"] },
    { emoji: "⛪", name: "연어교회 (Salmon Church)", nameEn: "Salmon Church Seattle", desc: lang === "ko" ? "이민 2·3세 + 유학생 대상 영어 한인 교회. 현대적 예배 스타일" : "English-language Korean church for 2nd-3rd gen & international students", tags: ["영어예배", "2세", "현대"] },
  ];
  const churches = serverContent["churches"]
    ? resolvePlaceItems(serverContent["churches"], lang)
    : defaultChurches;

  const programs = [
    { emoji: "📚", name: lang === "ko" ? "영어 ESL 클래스" : "ESL Classes", nameEn: "ESL", desc: lang === "ko" ? "무료 영어 수업. 대부분 교회에서 운영. 초급~중급 레벨별 반 구성" : "Free English classes at most churches. Beginner to intermediate levels", tags: ["무료", "영어"] },
    { emoji: "📋", name: lang === "ko" ? "이민자 정착 상담" : "Immigration Counseling", nameEn: "Immigration Support", desc: lang === "ko" ? "비자·운전면허·은행 계좌·학교 등록 등 정착 지원. 한인 자원봉사자 운영" : "Visa, license, banking, school enrollment support by Korean volunteers", tags: ["정착", "상담"] },
    { emoji: "🏃", name: lang === "ko" ? "청년 스포츠 리그" : "Youth Sports League", nameEn: "Sports", desc: lang === "ko" ? "교회 간 연합 농구·배구·축구 리그. 한인 2세 네트워킹 최고" : "Inter-church basketball, volleyball, soccer leagues. Best 2nd-gen networking", tags: ["스포츠", "청년"] },
    { emoji: "👩‍👧", name: lang === "ko" ? "여성 모임·선교회" : "Women's Ministry", nameEn: "Women's Ministry", desc: lang === "ko" ? "새 이민자 여성을 위한 생활 정보 공유, 정서적 지지 네트워크" : "Life info sharing and emotional support network for newcomer women", tags: ["여성", "커뮤니티"] },
    { emoji: "🎵", name: lang === "ko" ? "찬양·예배팀" : "Worship Team", nameEn: "Worship", desc: lang === "ko" ? "음악 경력자 환영. 한국어·영어 찬양 병행. 매주 리허설" : "Musicians welcome. Korean and English worship. Weekly rehearsal", tags: ["음악", "봉사"] },
    { emoji: "🌱", name: lang === "ko" ? "새가족 환영 모임" : "New Member Welcome", nameEn: "New Members", desc: lang === "ko" ? "처음 방문자를 위한 교회 소개·식사·멘토 연결. 무부담으로 참여" : "Church intro, meal, and mentor matching for first-time visitors. No pressure", tags: ["새가족", "환영"] },
  ];

  const newMemberInfo = lang === "ko" ? [
    { title: "처음 방문 시 팁", desc: "대부분 교회는 방문자 환영. 미리 연락 없이 예배 시간에 방문해도 됩니다. 주차장 안내원이 도와드립니다" },
    { title: "예배 시간 (일반적)", desc: "주일 1부 8:00am · 2부 11:00am · 영어예배(EBF) 11:00am. 교회마다 다르니 홈페이지 확인" },
    { title: "새가족 등록 혜택", desc: "정착 상담 · 생활 정보 · 한인 네트워크 연결. 대부분 무료 제공" },
    { title: "한인 교회 찾는 법", desc: "카카오 지도 '시애틀 한인 교회' 검색, 또는 워싱턴주 한인 교회 협회 홈페이지 참고" },
  ] : [
    { title: "Tips for first visit", desc: "Most churches warmly welcome visitors. No need to call ahead — just show up at service time. Parking attendants will help" },
    { title: "Typical service times", desc: "Sunday 1st: 8:00am · 2nd: 11:00am · English Service (EBF): 11:00am. Check each church website for details" },
    { title: "New member benefits", desc: "Settlement counseling · Life info · Korean network connection. Most services free" },
    { title: "How to find Korean churches", desc: "Search '시애틀 한인 교회' on Kakao Maps, or visit WA Korean Church Association website" },
  ];

  return (
    <div style={{ paddingBottom: 96 }}>
      <ScreenHeader emoji="⛪" titleKo="한인 교회" titleEn="Korean Churches"
        descKo="정착 지원 · 영어수업 · 커뮤니티 네트워크" descEn="Settlement support · ESL classes · Community network"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        {sub === 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] mb-4">
              {[
                { n: "50+", l: lang === "ko" ? "한인 교회" : "Korean Churches" },
                { n: "20+", l: lang === "ko" ? "영어 예배팀" : "English Services" },
                { n: "무료", l: lang === "ko" ? "ESL 수업" : "ESL Classes" },
                { n: "365일", l: lang === "ko" ? "커뮤니티 활동" : "Community Activities" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(192,132,252,0.1)", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(192,132,252,0.2)", textAlign: "center" }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 900, fontSize: 22, color: "#ECFDF5" }}>{s.n}</div>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {sub === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {churches.map((c, i) => <PlaceCard key={i} {...c} accentColor={accent} />)}
          </div>
        )}
        {sub === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {programs.map((p, i) => <PlaceCard key={i} {...p} accentColor={accent} />)}
          </div>
        )}
        {sub === 3 && (
          <InfoCard title={lang === "ko" ? "새가족 안내" : "New Member Guide"} accentColor={accent}>
            {newMemberInfo.map((item, i) => (
              <StepItem key={i} num={i + 1} title={item.title} desc={item.desc} accentColor={accent} />
            ))}
          </InfoCard>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 4: 맛집 SCREEN
───────────────────────────────────────── */
function DiningScreen() {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["카페", "한식·맛집", "한인상권", "쇼핑"]
    : ["Café", "Korean Food", "K-Business", "Shopping"];
  const accent = "#FB923C";

  // ✅ 검증됨 (2026-04-30) | 출처: WowSeattle 업소록 / kSeattle / 공식 사이트
  const cafes = [
    { emoji: "☕", name: "K-Cafe Dabang", nameEn: "K-Cafe Dabang — Lynnwood", desc: lang === "ko" ? "✅ 검증됨 | 한인타운 한국식 카페. 빙수·크로플. 3333 184th St SW Ste X | ☎ (425) 678-8276 | 월-목 8am-9pm" : "✅ Verified | Korean-style café. Bingsu & croffles. 3333 184th St SW Ste X | ☎ (425) 678-8276 | M-Th 8am-9pm", tags: ["린우드", "빙수", "검증됨"] },
    { emoji: "🍱", name: "Ko Hyang Zip (H-Mart)", nameEn: "Ko Hyang Zip — H-Mart Food Court", desc: lang === "ko" ? "✅ 검증됨 | H-Mart 내 한식 푸드코트. 분식·국밥·덮밥. 3301 184th St SW | ☎ (425) 582-2691 | 월-금 10am-8pm" : "✅ Verified | Korean food court inside H-Mart. 3301 184th St SW | ☎ (425) 582-2691 | M-F 10am-8pm", tags: ["H-Mart", "분식", "검증됨"] },
    { emoji: "🍵", name: "LUMI Dessert Cafe", nameEn: "LUMI Dessert Cafe", desc: lang === "ko" ? "한인 디저트 카페. 공식 사이트에서 위치·시간 확인 | 🔗 lumidessertcafe.com" : "Korean dessert café. Check address & hours at official site | 🔗 lumidessertcafe.com", tags: ["디저트", "카페", "확인중"] },
  ];

  // ✅ 검증됨 (2026-04-30) | 출처: WowSeattle 업소록 / Yelp 2026.04
  const restaurants = [
    { emoji: "🥩", name: "Baekjeong Korean BBQ", nameEn: "Baekjeong Korean BBQ — Lynnwood", desc: lang === "ko" ? "✅ 검증됨 | 알더우드몰 내 한인 BBQ. 3000 184th St SW Ste 922 | ☎ (425) 490-6328 | 월-목 11:30am-10pm" : "✅ Verified | Korean BBQ in Alderwood Mall. 3000 184th St SW Ste 922 | ☎ (425) 490-6328 | M-Th 11:30am-10pm", tags: ["갈비", "린우드", "검증됨"] },
    { emoji: "🍖", name: "Gangnam Korean Restaurant", nameEn: "Gangnam Korean Restaurant — Lynnwood", desc: lang === "ko" ? "✅ 검증됨 | 한식 전문. 19505 44th Ave W | ☎ (425) 678-0337 | 매일 10am-10:45pm | 🔗 gangnamlynnwood.com" : "✅ Verified | Korean food specialist. 19505 44th Ave W | ☎ (425) 678-0337 | Daily 10am-10:45pm | 🔗 gangnamlynnwood.com", tags: ["한식", "린우드", "검증됨"] },
    { emoji: "🍗", name: "소담치킨 숄라인", nameEn: "Sodam Chicken — Shoreline", desc: lang === "ko" ? "✅ 검증됨 | 한인 치킨 전문점. 17551 15th Ave NE, Shoreline | ☎ (206) 397-4119" : "✅ Verified | Korean fried chicken. 17551 15th Ave NE, Shoreline | ☎ (206) 397-4119", tags: ["치킨", "숄라인", "검증됨"] },
    { emoji: "🥩", name: "해남갈비 숄라인", nameEn: "Haenam Galbi — Shoreline", desc: lang === "ko" ? "✅ 검증됨 | 한인 갈비 전문. 15001 Aurora Ave N, Shoreline | ☎ (206) 367-7843" : "✅ Verified | Korean galbi specialist. 15001 Aurora Ave N, Shoreline | ☎ (206) 367-7843", tags: ["갈비", "숄라인", "검증됨"] },
    { emoji: "🍽️", name: "Ka Won Korean BBQ", nameEn: "Ka Won Korean BBQ — Lynnwood", desc: lang === "ko" ? "✅ 검증됨 | 15004 Hwy 99 Ste A, Lynnwood | ☎ (425) 787-6484 | 🔗 kawonlynnwood.com" : "✅ Verified | 15004 Hwy 99 Ste A, Lynnwood | ☎ (425) 787-6484 | 🔗 kawonlynnwood.com", tags: ["BBQ", "린우드", "검증됨"] },
  ];

  // ✅ 검증됨 (2026-04-30) | 출처: WowSeattle / SeattleN / 공식 사이트
  const businesses = [
    { emoji: "🏪", name: "H-Mart Lynnwood", nameEn: "H-Mart — Korean Supermarket", desc: lang === "ko" ? "✅ 검증됨 | 3301 184th St SW, Lynnwood | ☎ (425) 776-0858 | 매일 8am-9:30pm | 🔗 hmartus.com/lynnwood" : "✅ Verified | 3301 184th St SW, Lynnwood | ☎ (425) 776-0858 | Daily 8am-9:30pm | 🔗 hmartus.com/lynnwood", tags: ["마트", "린우드", "검증됨"] },
    { emoji: "🏦", name: "UniBank (유니뱅크)", nameEn: "UniBank — Korean-American Bank", desc: lang === "ko" ? "✅ 검증됨 | 한국계 은행. 19315 Highway 99, Lynnwood | ☎ (425) 275-9700 | 🔗 unibankusa.com" : "✅ Verified | Korean-American bank. 19315 Highway 99, Lynnwood | ☎ (425) 275-9700 | 🔗 unibankusa.com", tags: ["은행", "한국어", "검증됨"] },
    { emoji: "🏥", name: "천진 한의원", nameEn: "Chunjin Oriental Medicine — Federal Way", desc: lang === "ko" ? "✅ 검증됨 | 침술·한약. 31830 Pacific Hwy S #B, Federal Way | ☎ (253) 874-0058" : "✅ Verified | Acupuncture & herbal medicine. 31830 Pacific Hwy S #B, Federal Way | ☎ (253) 874-0058", tags: ["한의원", "페더럴웨이", "검증됨"] },
    { emoji: "✂️", name: "엠마 스킨케어", nameEn: "Emma Skincare — Lynnwood", desc: lang === "ko" ? "✅ 검증됨 | 한인 스킨케어·에스테틱. 17424 Hwy 99 #B-204, Lynnwood | ☎ (425) 525-9955" : "✅ Verified | Korean skincare & aesthetics. 17424 Hwy 99 #B-204, Lynnwood | ☎ (425) 525-9955", tags: ["스킨케어", "린우드", "검증됨"] },
    { emoji: "🔑", name: "한인 부동산", nameEn: "Korean Real Estate", desc: lang === "ko" ? "WowSeattle 검증 | 백수경 ☎ (206) 334-5454 | 박나리 ☎ (425) 246-1453 | 🔗 wowseattle.com" : "WowSeattle verified | Baik Sukyung ☎ (206) 334-5454 | Park Nari ☎ (425) 246-1453 | 🔗 wowseattle.com", tags: ["부동산", "렌탈", "검증됨"] },
  ];

  const shopping = [
    { emoji: "🛒", name: "H-Mart + Galleria", nameEn: "Lynnwood Korean Shopping Center", desc: lang === "ko" ? "H-Mart 옆 갤러리아 쇼핑몰. 한국 브랜드 의류·잡화·미용용품" : "Galleria mall next to H-Mart. Korean brand clothing, accessories & beauty products", tags: ["갤러리아", "한국브랜드", "쇼핑몰"] },
    { emoji: "💄", name: "K-Beauty 스토어", nameEn: "K-Beauty Store", desc: lang === "ko" ? "TONYMOLY·이니스프리·클리오 미국 판매점. Lynnwood·Bellevue Bellevue 스퀘어" : "TONYMOLY, Innisfree, CLIO USA stores in Lynnwood & Bellevue Square", tags: ["뷰티", "K-Beauty", "스킨케어"] },
    { emoji: "📚", name: "한국 서적·문화용품", nameEn: "Korean Books & Stationery", desc: lang === "ko" ? "한국 잡지·도서·문구. H-Mart 내 한국 서적 코너. 한국 드라마 DVD도" : "Korean magazines, books & stationery. Korean book section inside H-Mart", tags: ["서점", "문구", "도서"] },
    { emoji: "🧴", name: "한국 식재료 전문점", nameEn: "Korean Specialty Grocery", desc: lang === "ko" ? "H-Mart 외 소규모 한국 반찬·김치·떡 전문점. 린우드·페더럴웨이" : "Small-batch kimchi, banchan & tteok specialty shops beyond H-Mart", tags: ["반찬", "김치", "전문점"] },
  ];

  const resolvedCafes = serverContent["cafes"] ? resolvePlaceItems(serverContent["cafes"], lang) : cafes;
  const resolvedRestaurants = serverContent["restaurants"] ? resolvePlaceItems(serverContent["restaurants"], lang) : restaurants;
  const resolvedBusinesses = serverContent["businesses"] ? resolvePlaceItems(serverContent["businesses"], lang) : businesses;
  const resolvedShopping = serverContent["shopping"] ? resolvePlaceItems(serverContent["shopping"], lang) : shopping;
  const content = [resolvedCafes, resolvedRestaurants, resolvedBusinesses, resolvedShopping][sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <ScreenHeader emoji="🍽️" titleKo="카페 · 맛집" titleEn="Café & Dining"
        descKo="시애틀 한인 카페·맛집·상권 완전 가이드" descEn="Complete guide to Seattle's Korean cafés, restaurants & business district"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
        </div>
        <div style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>🗺️ {lang === "ko" ? "위치 찾기" : "Find Locations"}</div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
            {lang === "ko"
              ? "Google Maps에서 'Korean restaurant Lynnwood WA' 또는 '한인 맛집 시애틀' 검색. Yelp 한국어 리뷰도 활용하세요."
              : "Search 'Korean restaurant Lynnwood WA' on Google Maps or check Yelp for Korean reviews."}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 5: 탐방 SCREEN
───────────────────────────────────────── */
function ExploreScreen() {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["지역안내", "자연·여행", "문화·예술", "스포츠"]
    : ["Areas", "Nature", "Culture & Art", "Sports"];
  const accent = "#34D399";

  const areas = [
    { emoji: "🌲", name: "린우드 (Lynnwood)", nameEn: "Lynnwood — Korean Town Hub", desc: lang === "ko" ? "시애틀 최대 한인타운. H-Mart·한식당·교회 밀집. 한인 정착 1순위 지역" : "Seattle's largest Koreatown. H-Mart, Korean restaurants & churches. Top choice for new settlers", tags: ["한인타운", "H-Mart", "추천"] },
    { emoji: "💼", name: "벨뷰 (Bellevue)", nameEn: "Bellevue — Tech & Affluent", desc: lang === "ko" ? "Microsoft·Amazon 직원 다수 거주. 좋은 학군. 평균 렌트 높음. 한인 비율 ↑" : "Many Microsoft & Amazon employees. Top school districts. Higher rent but excellent Korean community", tags: ["직장인", "학군", "테크"] },
    { emoji: "🌊", name: "페더럴웨이 (Federal Way)", nameEn: "Federal Way — Affordable Korean Area", desc: lang === "ko" ? "렌트 상대적 저렴. 한인 인구 많음. I-5 접근성 좋음. 한국 식당·교회 다수" : "More affordable rent. Large Korean population. Good I-5 access. Many Korean restaurants & churches", tags: ["저렴", "한인", "I-5"] },
    { emoji: "🏙️", name: "오번 (Auburn)", nameEn: "Auburn — Korean Community Growing", desc: lang === "ko" ? "페더럴웨이 남쪽. 신흥 한인 밀집 지역. 렌트 경쟁력. 한국 마트·교회 증가 중" : "South of Federal Way. Growing Korean community. Competitive rent. More Korean stores & churches opening", tags: ["오번", "성장", "가성비"] },
    { emoji: "🎓", name: "대학지구 (University District)", nameEn: "U-District — Student Area", desc: lang === "ko" ? "UW 인근. 유학생·대학원생 多. 한국 식당·카페 집중. 버스·링크 접근성 최고" : "Near UW. Many Korean students & grad students. Concentrated Korean food. Excellent transit access", tags: ["유학생", "UW", "교통"] },
    { emoji: "🏝️", name: "메서 아일랜드 (Mercer Island)", nameEn: "Mercer Island — Upscale", desc: lang === "ko" ? "시애틀 동쪽 호수 섬. 고급 주거지. 한인 의사·변호사 다수 거주. I-90 접근" : "Upscale lake island east of Seattle. Many Korean professionals. I-90 access", tags: ["고급", "전문직", "조용"] },
  ];

  const nature = [
    { emoji: "🏔️", name: "레이니어산 국립공원", nameEn: "Mt. Rainier National Park", desc: lang === "ko" ? "시애틀 상징 화산. 여름 트레킹·겨울 스키. Paradise 전망대 꼭 방문. 1~2시간 거리" : "Seattle's iconic volcano. Summer hiking & winter skiing. Must visit Paradise viewpoint. 1-2hrs away", tags: ["트레킹", "국립공원", "당일치기"] },
    { emoji: "💧", name: "스노퀄미 폭포", nameEn: "Snoqualmie Falls", desc: lang === "ko" ? "Twin Peaks 촬영지. 시애틀 동쪽 30분. 폭포+카페+산책로 조합 최고" : "Twin Peaks filming location. 30min east of Seattle. Waterfall + café + trail combo", tags: ["폭포", "30분", "당일"] },
    { emoji: "🌊", name: "올림픽 반도", nameEn: "Olympic Peninsula", desc: lang === "ko" ? "우림·빙하·해안 세 가지 다 있음. 포트엔젤레스 경유 페리. 1박 2일 권장" : "Rainforest, glaciers & coastline all in one. Ferry via Port Angeles. Recommend overnight", tags: ["우림", "페리", "1박"] },
    { emoji: "🌺", name: "스카짓 밸리 튤립 축제", nameEn: "Skagit Valley Tulip Festival", desc: lang === "ko" ? "매년 4월. 시애틀 북쪽 1시간. 10만 평 튤립 밭. 사진 명소 압도적" : "Every April. 1hr north of Seattle. Massive tulip fields. Overwhelming photo opportunities", tags: ["4월", "튤립", "사진"] },
    { emoji: "🏖️", name: "오션 쇼어스 해변", nameEn: "Ocean Shores Beach", desc: lang === "ko" ? "태평양 해변 드라이브. 시애틀 서쪽 2.5시간. 조개 캐기·모래사장·말 타기" : "Pacific Ocean beach drive. 2.5hrs west. Clam digging, sand beach & horseback riding", tags: ["해변", "드라이브", "2.5시간"] },
    { emoji: "⛷️", name: "스노퀄미 패스 스키장", nameEn: "Snoqualmie Pass Ski Resort", desc: lang === "ko" ? "시애틀 동쪽 1시간 스키장. 초·중급 코스 풍부. 한인 스키클럽 연계 가능" : "Ski resort 1hr east. Good beginner to intermediate runs. Korean ski clubs available", tags: ["스키", "1시간", "겨울"] },
  ];

  const culture = [
    { emoji: "🎨", name: "시애틀 미술관 (SAM)", nameEn: "Seattle Art Museum", desc: lang === "ko" ? "다운타운. 아시아·원주민·현대 미술 컬렉션. 매달 무료 입장일 있음" : "Downtown. Asian, Native American & modern art collection. Free admission days monthly", tags: ["미술관", "다운타운", "무료일"] },
    { emoji: "🌸", name: "치훌리 정원", nameEn: "Chihuly Garden and Glass", desc: lang === "ko" ? "스페이스니들 옆 유리 공예 미술관. 인스타 최강. 입장료 있음($32)" : "Glass art museum next to Space Needle. Best Instagram spot. Admission $32", tags: ["유리공예", "스페이스니들", "인스타"] },
    { emoji: "🎭", name: "파이크 플레이스 마켓", nameEn: "Pike Place Market", desc: lang === "ko" ? "시애틀 상징 재래시장. 생선 던지기 쇼·꽃·커피·수공예품. 관광객 필수 방문" : "Seattle's iconic public market. Fish toss, flowers, coffee, crafts. Tourist must-visit", tags: ["관광", "시장", "필수"] },
    { emoji: "🚀", name: "스페이스 니들", nameEn: "Space Needle", desc: lang === "ko" ? "시애틀 랜드마크. 전망대+회전 레스토랑. 사전 예약 권장. 야경 최고" : "Seattle landmark. Observatory + revolving restaurant. Pre-book recommended. Best night view", tags: ["랜드마크", "전망대", "야경"] },
    { emoji: "🖥️", name: "뮤지엄 오브 팝 컬처", nameEn: "Museum of Pop Culture (MoPOP)", desc: lang === "ko" ? "록·SF·공포·게임 문화 박물관. 스페이스니들 옆. 특별전 자주 변경" : "Rock, sci-fi, horror & gaming culture museum next to Space Needle. Special exhibits change often", tags: ["팝컬처", "게임", "음악"] },
    { emoji: "🌿", name: "워싱턴 파크 식물원", nameEn: "Washington Park Arboretum", desc: lang === "ko" ? "UW 인근. 벚꽃·단풍 명소. 무료 입장. 가족 피크닉 최적" : "Near UW. Famous for cherry blossoms & fall foliage. Free. Perfect for family picnics", tags: ["벚꽃", "무료", "가족"] },
  ];

  const sports = [
    { emoji: "⚾", name: "시애틀 매리너스", nameEn: "Seattle Mariners (MLB)", desc: lang === "ko" ? "MLB 야구팀. T-Mobile Park. 오타니 이전 전 류현진·추신수 응원 인연. 한인 팬 많음" : "MLB baseball at T-Mobile Park. Large Korean fan base. Korean heritage nights held", tags: ["야구", "MLB", "다운타운"] },
    { emoji: "🏈", name: "시애틀 씨호크스", nameEn: "Seattle Seahawks (NFL)", desc: lang === "ko" ? "NFL 미식축구. Lumen Field. 12번째 선수(12th Man) 응원 문화 유명" : "NFL football at Lumen Field. Famous '12th Man' fan culture. Very loud stadium", tags: ["미식축구", "NFL", "루멘필드"] },
    { emoji: "⛳", name: "골프 (한인 골프 모임)", nameEn: "Korean Golf Groups", desc: lang === "ko" ? "한인 골프 클럽 다수. 에베레트·켄트·오번 퍼블릭 골프장 이용. 카카오 단톡방 활성" : "Many Korean golf clubs. Public courses in Everett, Kent & Auburn. Active KakaoTalk groups", tags: ["골프", "한인모임", "퍼블릭"] },
    { emoji: "🎿", name: "스키·스노보드", nameEn: "Skiing & Snowboarding", desc: lang === "ko" ? "스노퀄미·스티븐스 패스·수 스키장. 한인 스키클럽 여럿. 시즌권 공동구매도" : "Snoqualmie, Stevens Pass & Ski Snoqualmie. Korean ski clubs active. Group season pass deals", tags: ["스키", "보드", "클럽"] },
    { emoji: "🏊", name: "수영·배드민턴", nameEn: "Swimming & Badminton", desc: lang === "ko" ? "한인 배드민턴 클럽 매우 활발. 레크 센터 저렴한 수영 프로그램. 주말 모임" : "Very active Korean badminton clubs. Affordable swimming at rec centers. Weekend gatherings", tags: ["배드민턴", "수영", "주말"] },
    { emoji: "⚽", name: "한인 축구·농구 리그", nameEn: "Korean Soccer & Basketball League", desc: lang === "ko" ? "교회 연합 한인 스포츠 리그. 봄·가을 시즌 운영. 한인 커뮤니티 네트워킹 최고" : "Inter-church Korean sports leagues. Spring & fall seasons. Best Korean community networking", tags: ["교회리그", "네트워킹", "계절"] },
  ];

  const resolvedAreas = serverContent["areas"] ? resolvePlaceItems(serverContent["areas"], lang) : areas;
  const resolvedNature = serverContent["nature"] ? resolvePlaceItems(serverContent["nature"], lang) : nature;
  const resolvedCulture = serverContent["culture"] ? resolvePlaceItems(serverContent["culture"], lang) : culture;
  const resolvedSports = serverContent["sports"] ? resolvePlaceItems(serverContent["sports"], lang) : sports;
  const content = [resolvedAreas, resolvedNature, resolvedCulture, resolvedSports][sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <ScreenHeader emoji="🌆" titleKo="탐방" titleEn="Explore Seattle"
        descKo="지역안내 · 자연 · 문화 · 스포츠" descEn="Areas · Nature · Culture · Sports"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 6: 도움 SCREEN
───────────────────────────────────────── */
function HelpScreen() {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["긴급연락", "커뮤니티", "유용한 링크"]
    : ["Emergency", "Community", "Useful Links"];
  const accent = "#F87171";

  const defaultCommunityLinks = [
    { emoji: "💬", name: lang === "ko" ? "카카오오픈채팅 — 시애틀한인" : "KakaoTalk — 시애틀한인", nameEn: "Kakao Open Chat", desc: lang === "ko" ? "시애틀 한인 최대 커뮤니티 채팅방. 정착 질문, 중고거래, 모임 공지" : "Largest Korean Seattle community chat. Settlement Q&A, used goods, event announcements", tags: ["카카오", "실시간", "커뮤니티"] },
    { emoji: "🏛️", name: lang === "ko" ? "시애틀 한인회" : "Korean Association of Seattle", nameEn: "Korean Association", desc: lang === "ko" ? "공식 한인 단체. 각종 행사·지원 사업 운영. 전화: (206) 323-5050" : "Official Korean community organization. Events & support programs. Tel: (206) 323-5050", tags: ["공식", "한인회", "이벤트"] },
    { emoji: "🏴", name: lang === "ko" ? "주 시애틀 대한민국 총영사관" : "Korean Consulate General Seattle", nameEn: "Korean Consulate", desc: lang === "ko" ? "여권·공증·사증. 주소: 2033 6th Ave #1125, Seattle. 전화: (206) 441-1011" : "Passport, notary & visa services. 2033 6th Ave #1125, Seattle. Tel: (206) 441-1011", tags: ["영사관", "여권", "공증"] },
    { emoji: "📰", name: lang === "ko" ? "미주 한국일보 시애틀판" : "Korea Times Seattle", nameEn: "Korean Newspaper", desc: lang === "ko" ? "시애틀 한인 지역 소식·구인광고·부동산·커뮤니티 정보" : "Seattle Korean community news, job listings, real estate & community information", tags: ["신문", "뉴스", "정보"] },
    { emoji: "👩‍💻", name: lang === "ko" ? "네이버 카페 — 시애틀한인생활" : "Naver Café — Seattle Korean Life", nameEn: "Naver Café", desc: lang === "ko" ? "정착 경험담·질문·정보 공유. 검색: 네이버 '시애틀한인생활'" : "Settlement experiences, Q&A & info sharing. Search: Naver '시애틀한인생활'", tags: ["네이버", "정보", "경험담"] },
  ];

  const defaultUsefulLinks = [
    { emoji: "🏥", name: lang === "ko" ? "WA Apple Health (무료 의료보험)" : "WA Apple Health (Free Health Insurance)", nameEn: "Washington Medicaid", desc: lang === "ko" ? "저소득층 무료 건강보험. 신청: wahealthplanfinder.org | 전화: 1-855-923-4633" : "Free health insurance for low-income. Apply: wahealthplanfinder.org | Tel: 1-855-923-4633", tags: ["보험", "무료", "의료"] },
    { emoji: "🚌", name: lang === "ko" ? "ORCA 카드 (대중교통 통합 카드)" : "ORCA Card (Transit Card)", nameEn: "Public Transit Pass", desc: lang === "ko" ? "버스·링크 라이트레일·페리 통합 카드. orca.com 또는 H-Mart에서 구매" : "Integrated card for bus, Link light rail & ferry. Get at orca.com or H-Mart customer service", tags: ["대중교통", "버스", "링크"] },
    { emoji: "💼", name: lang === "ko" ? "WorkSource WA (무료 취업 지원)" : "WorkSource WA (Free Job Center)", nameEn: "Free Job Assistance", desc: lang === "ko" ? "이력서·면접 코칭·취업 연결. 무료. 시애틀·린우드·에베레트 센터 운영" : "Resume, interview coaching & job placement. Free. Seattle, Lynnwood & Everett centers", tags: ["취업", "무료", "이력서"] },
    { emoji: "🏫", name: lang === "ko" ? "시애틀 공립학교 등록 (SPS)" : "Seattle Public Schools Enrollment", nameEn: "SPS Enrollment", desc: lang === "ko" ? "공립학교 등록 안내. seattleschools.org | 한국어 지원 통역 서비스 있음" : "Public school enrollment guide. seattleschools.org | Korean language interpreter available", tags: ["학교", "공립", "한국어"] },
    { emoji: "🔒", name: lang === "ko" ? "법률 지원 (무료 법률 클리닉)" : "Free Legal Clinic", nameEn: "Free Legal Help", desc: lang === "ko" ? "이민·고용·집주인 분쟁. KCBA 법률 봉사. 한국어 지원 변호사 연결 가능" : "Immigration, employment & landlord disputes. KCBA legal aid. Korean-speaking attorney referrals", tags: ["법률", "무료", "이민"] },
  ];

  const communityLinks = serverContent["community"] ? resolvePlaceItems(serverContent["community"], lang) : defaultCommunityLinks;
  const usefulLinks = serverContent["links"] ? resolvePlaceItems(serverContent["links"], lang) : defaultUsefulLinks;

  return (
    <div style={{ paddingBottom: 96 }}>
      <ScreenHeader emoji="🆘" titleKo="도움말" titleEn="Help & Emergency"
        descKo="긴급연락 · 커뮤니티 · 유용한 정보" descEn="Emergency contacts · Community · Useful resources"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />

      {sub === 0 && (
        <div style={{ paddingBottom: 0 }}>
          {/* 긴급 SOS 배너 */}
          <div style={{ margin: "16px 16px 0", background: "linear-gradient(135deg, #3b0000, #1f0000)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", background: "rgba(239,68,68,0.12)", borderBottom: "1px solid rgba(248,113,113,0.15)" }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#F87171" }}>
                🚨 {lang === "ko" ? "생명이 위험한 긴급 상황 → 즉시 911 전화" : "Life-threatening emergency → Call 911 immediately"}
              </div>
            </div>
            <EmergencyRow emoji="🚨" title={lang === "ko" ? "경찰·소방·구급 (긴급)" : "Police · Fire · Ambulance (Emergency)"} number="911" desc={lang === "ko" ? "생명·화재·범죄 — 즉시 전화. 한국어 통역 요청 가능" : "Life-threatening, fire, crime — call immediately. Korean interpreter available"} />
            <EmergencyRow emoji="🚓" title={lang === "ko" ? "경찰 비긴급 신고" : "Police Non-Emergency"} number="206-625-5011" desc={lang === "ko" ? "긴급하지 않은 사건 신고 (도난·분실 등)" : "Non-urgent incidents (theft, lost property etc.)"} />
            <EmergencyRow emoji="☎️" title={lang === "ko" ? "위기 상담 핫라인" : "Crisis Hotline"} number="988" desc={lang === "ko" ? "정신건강·자살 예방 24시간. 한국어 통역 가능" : "Mental health & suicide prevention 24/7. Korean interpreter available"} />
            <EmergencyRow emoji="🏛️" title={lang === "ko" ? "한국 총영사관 긴급" : "Korean Consulate Emergency"} number="206-441-1011" desc={lang === "ko" ? "여권 분실·억류·사고. 근무시간 외 긴급 연락" : "Lost passport, detention, accident. After-hours emergency line"} />
            <EmergencyRow emoji="🚗" title={lang === "ko" ? "도로 긴급 (AAA)" : "Roadside Emergency (AAA)"} number="800-222-4357" desc={lang === "ko" ? "차량 고장·견인. AAA 회원권 권장 ($60/년)" : "Vehicle breakdown & towing. AAA membership recommended ($60/yr)"} />
            <EmergencyRow emoji="☁️" title={lang === "ko" ? "독 조절 센터" : "Poison Control Center"} number="800-222-1222" desc={lang === "ko" ? "약물·화학물질 중독 24시간 상담" : "Drug & chemical poisoning 24/7 consultation"} />
          </div>
          {/* 안전 팁 */}
          <div style={{ margin: "16px 16px 0", background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 6 }}>💡 {lang === "ko" ? "시애틀 안전 팁" : "Seattle Safety Tips"}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko"
                ? "• 다운타운 파이오니어 스퀘어·3rd Ave 야간 주의\n• 차량 내 귀중품 절대 방치 금지\n• 자전거·차량 반드시 잠금\n• 홈리스 밀집 지역 (SODO, 3rd Ave) 인지"
                : "• Avoid Pioneer Square & 3rd Ave downtown at night\n• Never leave valuables visible in car\n• Always lock bikes & vehicles\n• Be aware of high homeless population areas (SODO, 3rd Ave)"}
            </div>
          </div>
        </div>
      )}

      {sub === 1 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {communityLinks.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
        </div>
      )}

      {sub === 2 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {usefulLinks.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>ℹ️ {lang === "ko" ? "안내" : "Note"}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko"
                ? "이 가이드의 정보는 참고용입니다. 중요한 결정 전 반드시 전문가(변호사·의사·회계사)와 상담하세요."
                : "Information in this guide is for reference only. Always consult a professional (attorney, doctor, accountant) before important decisions."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 7: 취업 SCREEN
───────────────────────────────────────── */
function JobsScreen() {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["빅테크", "의료·항공", "자영업", "비자·네트워크"]
    : ["Big Tech", "Healthcare & Aerospace", "Small Biz", "Visa & Network"];
  const accent = "#FBBF24";

  const defaultJobs = [
    { emoji: "☁️", name: "Amazon", nameEn: "Amazon — Largest Seattle Employer",
      desc: lang === "ko"
        ? "✅ 시애틀 최대 고용주. South Lake Union 본사. SDE·PM·데이터사이언티스트·운영직. AWS 글로벌 본부. 한인 직원 수천 명. L3-L7 레벨. 연봉 $120K-$350K+ | 🔗 amazon.jobs"
        : "✅ Seattle's largest employer. SLU HQ. SDE, PM, data scientist, operations. AWS global HQ. Thousands of Korean employees. L3-L7 levels. Salary $120K-$350K+ | 🔗 amazon.jobs",
      tags: ["빅테크", "SDE", "H-1B"] },
    { emoji: "🖥️", name: "Microsoft", nameEn: "Microsoft — Redmond HQ",
      desc: lang === "ko"
        ? "✅ 레드몬드 본사. Azure·Office·Xbox·Copilot. 한인 엔지니어 매우 많음. H-1B 스폰서 적극적. 연봉 $130K-$380K+ | 🔗 careers.microsoft.com"
        : "✅ Redmond HQ. Azure, Office, Xbox, Copilot. Large Korean engineer community. Active H-1B sponsor. Salary $130K-$380K+ | 🔗 careers.microsoft.com",
      tags: ["빅테크", "레드몬드", "비자지원"] },
    { emoji: "🔍", name: "Google Seattle", nameEn: "Google — Kirkland & Seattle",
      desc: lang === "ko"
        ? "커클랜드·시애틀 캠퍼스. YouTube·검색·지도·AI. 최상위 보상 패키지. 경쟁 치열 | 🔗 careers.google.com"
        : "Kirkland & Seattle campuses. YouTube, Search, Maps, AI. Top-tier compensation. Very competitive | 🔗 careers.google.com",
      tags: ["빅테크", "커클랜드", "AI"] },
  ];

  const healthAerospace = [
    { emoji: "✈️", name: "Boeing", nameEn: "Boeing — Aerospace",
      desc: lang === "ko"
        ? "에버렛·렌톤 위치. 에어로스페이스 엔지니어링. 기계·항공·전기 엔지니어 수요. 보안 허가 필요 | 🔗 boeing.com/careers"
        : "Everett & Renton locations. Aerospace engineering. Mechanical, aero & electrical engineers needed. Security clearance required | 🔗 boeing.com/careers",
      tags: ["항공", "엔지니어링", "에버렛"] },
    { emoji: "🏥", name: "의료·바이오 취업", nameEn: "Healthcare & Biotech Jobs",
      desc: lang === "ko"
        ? "UW Medicine·Swedish·Kaiser·Virginia Mason. 간호사·의사·연구직. 워싱턴주 간호사 부족 → 비교적 취업 용이. 의료 비자 경로 있음 | 🔗 careers.uwmedicine.org"
        : "UW Medicine, Swedish, Kaiser, Virginia Mason. Nurses, doctors, researchers. WA nurse shortage → easier hiring. Medical visa pathways available | 🔗 careers.uwmedicine.org",
      tags: ["의료", "간호사", "바이오"] },
  ];

  const smallBiz = [
    { emoji: "🍽️", name: "한인 자영업 가이드", nameEn: "Korean Small Business Guide",
      desc: lang === "ko"
        ? "린우드·페더럴웨이 중심. 진입 가능 업종: 한식당·BBQ·치킨, 미용실·네일, 세탁소, 편의점, 한인 부동산·보험, 한국 식품 유통. 초기 자본 $50K-$150K. 한인 상공회의소 멘토링 활용"
        : "Lynnwood & Federal Way. Entry-possible: Korean restaurants, hair/nail salons, dry cleaning, convenience stores, real estate, insurance, food import. Capital $50K-$150K. Korean Chamber mentoring",
      tags: ["자영업", "창업", "린우드"] },
  ];

  const visaNetwork = [
    { emoji: "💼", name: "취업 비자 안내", nameEn: "Work Visa Guide",
      desc: lang === "ko"
        ? "• H-1B: 전문직. 스폰서 필요. 연 1회 추첨. Amazon·MS 적극 지원\n• L-1: 사내 이동 (한국 → 미국)\n• OPT/STEM OPT: 졸업 후 1-3년\n• EB-2/EB-3: 취업 영주권\n• E-2: 투자 비자 (자영업 창업)"
        : "• H-1B: Specialty occupation, needs sponsor, annual lottery\n• L-1: Intracompany transfer (Korea → US)\n• OPT/STEM OPT: 1-3 years post-grad\n• EB-2/EB-3: Employment-based green card\n• E-2: Investment visa (self-employment)",
      tags: ["H-1B", "비자", "영주권"] },
    { emoji: "💡", name: "한인 취업 네트워크", nameEn: "Korean Job Networks",
      desc: lang === "ko"
        ? "• KAA (Korean American Association) — Amazon 내 한인 네트워크\n• KABA — 비즈니스 네트워크\n• UW·시애틀U 한인 동문 네트워크\n• LinkedIn 프로필 최적화 필수\n• LeetCode 코딩 인터뷰 준비 (빅테크)\n• 교회 소그룹 — 의외로 강력한 채용 연결"
        : "• KAA — Korean network inside Amazon\n• KABA — Business network\n• UW/Seattle U Korean alumni\n• LinkedIn profile optimization essential\n• LeetCode coding interview prep (Big Tech)\n• Church small groups — powerful job connections",
      tags: ["네트워크", "LinkedIn", "KAA"] },
  ];

  const allJobs = serverContent["jobs"] ? resolvePlaceItems(serverContent["jobs"], lang) : null;
  const subData = allJobs
    ? [allJobs.slice(0, 3), allJobs.slice(3, 5), allJobs.slice(5, 6), allJobs.slice(6)]
    : [defaultJobs, healthAerospace, smallBiz, visaNetwork];
  const content = subData[sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <ScreenHeader emoji="💼" titleKo="취업 가이드" titleEn="Jobs & Career"
        descKo="시애틀 한인 취업·창업·비자 완전 가이드" descEn="Complete guide to jobs, business & visas for Koreans in Seattle"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
        </div>
        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>
            💼 {lang === "ko" ? "취업 팁" : "Job Tip"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
            {lang === "ko"
              ? "카카오오픈채팅 '시애틀한인'에서 취업 정보·추천 공유 활발. WorkSource WA 무료 이력서·면접 코칭도 활용하세요."
              : "KakaoTalk '시애틀한인' has active job info & referral sharing. Also use WorkSource WA for free resume & interview coaching."}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 8: 교육 SCREEN
───────────────────────────────────────── */
function EducationScreen() {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["학군 순위", "대학교", "학원·ESL"]
    : ["School Districts", "Universities", "Tutoring & ESL"];
  const accent = "#A78BFA";

  const districts = [
    { emoji: "⭐", name: "Bellevue School District", nameEn: "Bellevue SD — WA #1",
      desc: lang === "ko"
        ? "✅ 워싱턴주 1위 학군 (Niche A+). 졸업률 92.5%. Newport HS·Interlake HS·Bellevue HS. AP·IB 과정 풍부. 한인 학생 비율 높음 | 🔗 bsd405.org"
        : "✅ WA State #1 district (Niche A+). Graduation 92.5%. Newport, Interlake & Bellevue HS. Rich AP/IB programs. High Korean student population | 🔗 bsd405.org",
      tags: ["벨뷰", "A+", "상위학군"] },
    { emoji: "⭐", name: "Mercer Island SD", nameEn: "Mercer Island SD — WA #2",
      desc: lang === "ko"
        ? "✅ 워싱턴주 2위 학군 (Niche A+). 졸업률 97.2%. Mercer Island HS (전국 상위 1%). 고소득 전문직 가정 밀집 | 🔗 mercerislandschools.org"
        : "✅ WA #2 district (Niche A+). Graduation 97.2%. Mercer Island HS (top 1% nationally). High-income professional families | 🔗 mercerislandschools.org",
      tags: ["메르서아일랜드", "A+", "최상위"] },
    { emoji: "⭐", name: "Lake Washington SD", nameEn: "Lake Washington SD — Redmond·Kirkland",
      desc: lang === "ko"
        ? "✅ 워싱턴주 상위 1% (Niche A+). 졸업률 95%. Redmond HS·Eastlake HS. MS 본사 인근. STEM 최강 | 🔗 lwsd.org"
        : "✅ Top 1% in WA (Niche A+). Graduation 95%. Near Microsoft HQ. Exceptional STEM programs | 🔗 lwsd.org",
      tags: ["레드몬드", "커클랜드", "STEM"] },
    { emoji: "⭐", name: "Northshore SD", nameEn: "Northshore SD — Bothell·Woodinville",
      desc: lang === "ko"
        ? "✅ 워싱턴주 상위 5% (Niche A). 졸업률 96%. Inglemoor HS·Bothell HS. 한인 가족 최다 거주 학군 | 🔗 nsd.org"
        : "✅ Top 5% in WA (Niche A). Graduation 96%. Inglemoor & Bothell HS. Highest Korean family concentration | 🔗 nsd.org",
      tags: ["보텔", "우딘빌", "한인밀집"] },
  ];

  const universities = [
    { emoji: "🎓", name: "University of Washington (UW)", nameEn: "UW — Public Ivy",
      desc: lang === "ko"
        ? "✅ 시애틀 소재. 워싱턴주 최고 대학. CS·의대·공대 세계적 수준. 한인 유학생·교수 다수. 주립 학비 $12,000/년 (in-state) | 🔗 uw.edu"
        : "✅ Seattle. WA's top university. World-class CS, med & engineering. Many Korean students & faculty. In-state tuition $12,000/yr | 🔗 uw.edu",
      tags: ["UW", "주립대", "CS"] },
    { emoji: "🎓", name: "Seattle University (시애틀U)", nameEn: "Seattle University",
      desc: lang === "ko"
        ? "다운타운 소재. 예수회 대학. 법대·비즈니스·간호. 한인 유학생 커뮤니티 활발. 국제학생 장학금 있음 | 🔗 seattleu.edu"
        : "Downtown. Jesuit university. Law, business & nursing. Active Korean student community. International scholarships available | 🔗 seattleu.edu",
      tags: ["시애틀대", "법대", "다운타운"] },
  ];

  const tutoringEsl = [
    { emoji: "📚", name: "한인 학원·과외", nameEn: "Korean Tutoring & Hagwon",
      desc: lang === "ko"
        ? "린우드·벨뷰 한인 학원 다수. SAT·ACT·수학·과학 전문. 한국어 가능 개인 과외 $60-100/시. 카카오오픈채팅 '시애틀한인' → 과외 찾기"
        : "Many Korean tutoring centers in Lynnwood & Bellevue. SAT, ACT, math & science. Korean-speaking tutors $60-100/hr. KakaoTalk '시애틀한인' for tutor listings",
      tags: ["학원", "SAT", "과외"] },
    { emoji: "🌍", name: "국제학생 ESL·어학원", nameEn: "ESL & Language Schools",
      desc: lang === "ko"
        ? "✅ ELS Language Centers (시애틀). Kaplan International. 커뮤니티 칼리지 ESL 무료·저렴. Edmonds College ESL 추천 (린우드 인근) | 🔗 edcc.edu"
        : "✅ ELS Language Centers (Seattle). Kaplan International. Community college ESL free/low-cost. Edmonds College ESL recommended (near Lynnwood) | 🔗 edcc.edu",
      tags: ["ESL", "어학", "유학생"] },
  ];

  const allEdu = serverContent["education"] ? resolvePlaceItems(serverContent["education"], lang) : null;
  const subData = allEdu
    ? [allEdu.slice(0, 4), allEdu.slice(4, 6), allEdu.slice(6)]
    : [districts, universities, tutoringEsl];
  const content = subData[sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <ScreenHeader emoji="🎓" titleKo="교육 가이드" titleEn="Education Guide"
        descKo="시애틀 학군·대학·학원 완전 가이드" descEn="Complete guide to school districts, universities & tutoring in Seattle"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
        </div>
        <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>
            🎓 {lang === "ko" ? "학군 선택 팁" : "School District Tip"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
            {lang === "ko"
              ? "학군은 거주 주소 기준으로 자동 배정됩니다. 집 구하기 전 반드시 학군을 먼저 확인하세요. Niche.com에서 학교별 상세 순위 확인 가능합니다."
              : "School district is automatically assigned by home address. Always check the school district before renting. See detailed school rankings at Niche.com."}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 9: 생활비 SCREEN
───────────────────────────────────────── */
function CostScreen() {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["렌트·주거", "세금·생활비", "교통·통신"]
    : ["Rent & Housing", "Tax & Living", "Transport & Phone"];
  const accent = "#34D399";

  const rentHousing = [
    { emoji: "🏠", name: "렌트 시세 (2026년 기준)", nameEn: "Rent Prices — 2026",
      desc: lang === "ko"
        ? "📍 린우드/페더럴웨이: 스튜디오 $1,300-1,700 | 1BR $1,700-2,100 | 2BR $2,100-2,600\n📍 벨뷰: 스튜디오 $1,800-2,300 | 1BR $2,200-2,900 | 2BR $2,800-3,500\n📍 시애틀 시내: 스튜디오 $1,700-2,200 | 1BR $2,100-2,800 | 2BR $2,500-3,200"
        : "📍 Lynnwood/Federal Way: Studio $1,300-1,700 | 1BR $1,700-2,100 | 2BR $2,100-2,600\n📍 Bellevue: Studio $1,800-2,300 | 1BR $2,200-2,900 | 2BR $2,800-3,500\n📍 Downtown Seattle: Studio $1,700-2,200 | 1BR $2,100-2,800 | 2BR $2,500-3,200",
      tags: ["렌트", "주거", "비교"] },
  ];

  const taxLiving = [
    { emoji: "💵", name: "세금 정보", nameEn: "Tax Information",
      desc: lang === "ko"
        ? "✅ 워싱턴주 소득세 없음! (큰 장점)\n판매세(Sales Tax): 시애틀 10.4%\n식료품·처방약: 세금 면제\n시애틀 최저시급: $20.76/시 (2026년)\n재산세: 주택 소유 시 연 $5,000-15,000"
        : "✅ WA State has NO income tax! (major benefit)\nSales Tax: 10.4% in Seattle\nGroceries & prescription drugs: tax-exempt\nSeattle minimum wage: $20.76/hr (2026)\nProperty tax: ~$5,000-15,000/yr if you own",
      tags: ["세금", "소득세없음", "최저시급"] },
    { emoji: "🛒", name: "생활비 평균", nameEn: "Average Monthly Expenses",
      desc: lang === "ko"
        ? "📊 독신 기준 월 예상 생활비:\n• 렌트 (1BR 린우드): $1,800-2,000\n• 식료품: $300-500\n• 교통 (버스+ORCA): $100-130\n• 공과금 (전기·인터넷): $150-200\n• 외식·여가: $200-400\n⟹ 합계: 약 $2,550-3,230/월"
        : "📊 Estimated monthly expenses (single person):\n• Rent (1BR Lynnwood): $1,800-2,000\n• Groceries: $300-500\n• Transit (bus+ORCA): $100-130\n• Utilities (electric+internet): $150-200\n• Dining out & leisure: $200-400\n⟹ Total: ~$2,550-3,230/month",
      tags: ["생활비", "월평균", "예산"] },
  ];

  const transportPhone = [
    { emoji: "⛽", name: "교통·기름값", nameEn: "Transportation & Gas",
      desc: lang === "ko"
        ? "🚗 WA주 기름값: $3.80-4.50/갤런 (2026년)\n🚌 Metro 버스: $2.75/회 (ORCA)\n🚇 Link Light Rail: $2.00-3.50 (거리별)\n🅿️ 시애틀 다운타운 주차: $3-8/시간\n💡 린우드 거주 시 대부분 차량 필요"
        : "🚗 WA gas: $3.80-4.50/gallon (2026)\n🚌 Metro bus: $2.75/ride (ORCA)\n🚇 Link Light Rail: $2.00-3.50 (distance-based)\n🅿️ Downtown Seattle parking: $3-8/hr\n💡 Car almost essential if living in Lynnwood",
      tags: ["기름값", "주차", "교통비"] },
    { emoji: "📱", name: "통신비", nameEn: "Phone & Internet",
      desc: lang === "ko"
        ? "📱 휴대폰:\n• T-Mobile Prepaid: $30/월 (무제한 문자+통화+5GB)\n• Mint Mobile: $15/월 (온라인 3개월 선불)\n• Verizon 가족 플랜: $40-55/회선\n\n🌐 인터넷:\n• Xfinity: $40-80/월\n• CenturyLink/Lumen: $50-65/월\n• 기가 인터넷: $70-100/월"
        : "📱 Phone:\n• T-Mobile Prepaid: $30/mo (unlimited)\n• Mint Mobile: $15/mo (3-month prepaid)\n• Verizon family plan: $40-55/line\n\n🌐 Internet:\n• Xfinity: $40-80/mo\n• CenturyLink/Lumen: $50-65/mo\n• Gigabit internet: $70-100/mo",
      tags: ["통신비", "인터넷", "휴대폰"] },
  ];

  const allCost = serverContent["cost"] ? resolvePlaceItems(serverContent["cost"], lang) : null;
  const subData = allCost
    ? [allCost.slice(0, 1), allCost.slice(1, 3), allCost.slice(3)]
    : [rentHousing, taxLiving, transportPhone];
  const content = subData[sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <ScreenHeader emoji="💰" titleKo="생활비 가이드" titleEn="Living Cost Guide"
        descKo="렌트·세금·교통·통신비 완전 가이드" descEn="Complete guide to rent, taxes, transport & phone costs in Seattle"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
        </div>
        <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>
            💰 {lang === "ko" ? "비용 절약 팁" : "Cost-saving Tip"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
            {lang === "ko"
              ? "워싱턴주는 소득세가 없어서 같은 연봉이라도 캘리포니아(13.3%)나 오리건(9.9%)보다 실수령액이 훨씬 높습니다. 린우드 거주 시 Link Light Rail로 시애틀 통근이 가능해 교통비도 절약됩니다."
              : "WA has no income tax, so take-home pay is much higher than California (13.3%) or Oregon (9.9%) on the same salary. Living in Lynnwood and commuting via Link Light Rail also saves on transportation costs."}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ── NAVIGATION & LAYOUT ───────────────────
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   BOTTOM NAVIGATION (9탭)
───────────────────────────────────────── */
const NAV_ITEMS: Array<{
  labelKey: "nav.home" | "nav.settle" | "nav.church" | "nav.dining" | "nav.explore" | "nav.help" | "nav.jobs" | "nav.education" | "nav.cost";
  LucideIcon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}> = [
  { labelKey: "nav.home",      LucideIcon: Home },
  { labelKey: "nav.settle",    LucideIcon: Compass },
  { labelKey: "nav.church",    LucideIcon: Church },
  { labelKey: "nav.dining",    LucideIcon: UtensilsCrossed },
  { labelKey: "nav.explore",   LucideIcon: Map },
  { labelKey: "nav.jobs",      LucideIcon: Briefcase },
  { labelKey: "nav.education", LucideIcon: GraduationCap },
  { labelKey: "nav.cost",      LucideIcon: DollarSign },
  { labelKey: "nav.help",      LucideIcon: LifeBuoy },
];

interface BottomNavProps {
  activeIndex: number;
  onChange: (i: number) => void;
}
function BottomNav({ activeIndex, onChange }: BottomNavProps) {
  const { t } = useI18n();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] md:max-w-[768px] lg:max-w-[1200px]"
      style={{
        height: 76,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(26,37,53,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* 가로 스크롤 컨테이너 */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          height: "100%",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          paddingLeft: 4,
          paddingRight: 4,
        }}
        className="[&::-webkit-scrollbar]:hidden"
      >
        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              style={{
                flexShrink: 0,
                width: 72,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                paddingTop: 8,
                paddingBottom: 6,
                border: "none",
                background: "none",
                cursor: "pointer",
                position: "relative",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    width: 24,
                    height: 2.5,
                    borderRadius: 2,
                    background: MINT,
                    transform: "translateX(-50%)",
                  }}
                />
              )}
              <item.LucideIcon
                size={24}
                color={isActive ? MINT : "rgba(110,231,183,0.4)"}
                strokeWidth={isActive ? 2.2 : 1.5}
              />
              <span style={{
                fontFamily: "Manrope,sans-serif",
                fontWeight: isActive ? 700 : 500,
                fontSize: 10,
                color: isActive ? MINT : "rgba(110,231,183,0.4)",
                whiteSpace: "nowrap",
                letterSpacing: "-0.2px",
              }}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────
   TOP APP BAR
───────────────────────────────────────── */
function AppBar() {
  const { t, lang, setLang } = useI18n();
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-[20px] w-full max-w-[430px] md:max-w-[768px] lg:max-w-[1200px]"
      style={{
        height: 56,
        background: "rgba(26,37,53,0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-[10px]">
        <div className="flex items-center justify-center overflow-hidden" style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(110,231,183,0.25)", background: "rgba(110,231,183,0.1)", flexShrink: 0 }}>
          <img src={logoImg} alt="HebronGuide Logo" style={{ width: 28, height: 28, objectFit: "contain" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = "block"; }} />
          <span style={{ fontSize: 16, display: "none" }}>🌲</span>
        </div>
        <div className="flex flex-col" style={{ lineHeight: 1 }}>
          <div>
            <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "1.5px", color: GOLD }}>HEBRON</span>
            <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "1.5px", color: "rgba(236,253,245,0.6)" }}>GUIDE</span>
          </div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "0.5px", color: MINT, marginTop: 2 }}>
            {t("brand.sub")}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-[8px]">
        {/* 언어 토글: KO / EN / ES */}
        <div className="flex items-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 2, gap: 2 }}>
          {(["en", "ko", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex items-center justify-center border-0 cursor-pointer hover:scale-110 active:scale-95"
              style={{
                height: 24, paddingLeft: 8, paddingRight: 8, borderRadius: 7,
                background: lang === l ? `rgba(201,162,39,0.18)` : "transparent",
                border: `1px solid ${lang === l ? "rgba(201,162,39,0.45)" : "transparent"}`,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.5px", color: lang === l ? GOLD : "rgba(236,253,245,0.5)" }}>
                {l.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
        <button
          className="flex items-center justify-center border-0 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200"
          style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.2)" }}
        >
          <div style={{ width: 17, height: 17 }}>
            <IconBox pathKey="p10cae140" vb="0 0 17.19 17.19" fill={MINT} />
          </div>
        </button>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */
export function HebronGuide() {
  const [activeNav, setActiveNav] = useState(0);

  const screens = [
    <HomeScreen onNavigate={setActiveNav} />,
    <SettleScreen />,
    <ChurchScreen />,
    <DiningScreen />,
    <ExploreScreen />,
    <JobsScreen />,
    <EducationScreen />,
    <CostScreen />,
    <HelpScreen />,
  ];

  return (
    <div
      className="flex flex-col min-h-screen mx-auto relative max-w-[430px] md:max-w-[768px] lg:max-w-[1200px]"
      style={{ background: "#1a2535" }}
    >
      <AppBar />
      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 72 }}>
        {screens[activeNav]}
      </main>
      <BottomNav activeIndex={activeNav} onChange={setActiveNav} />
    </div>
  );
}

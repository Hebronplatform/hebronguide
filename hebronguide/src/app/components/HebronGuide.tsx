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
 * Tab structure (v4 — 6탭):
 *   🏠 홈   | 🛬 정착  | ⛪ 교회  | 🍽️ 맛집  | 🌆 탐방  | 🆘 도움
 * (취업·교육·생활비는 홈 앱 그리드에서 모달/오버레이로 접근)
 *
 * PWA 기능 (v4):
 *   - 체크리스트 localStorage 저장
 *   - InstallBanner (beforeinstallprompt)
 *   - 오프라인 배너 (online/offline 이벤트)
 *   - 로컬 알림 스케줄링 (Notification API)
 * ══════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react";
import svgPaths from "../../imports/svg-uguh2ql8id";
// 2026 시애틀 히어로 사진 6장 — 2시간마다 교체 (Unsplash 무료 라이선스)
const HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1571842377564-5849a26c3fc2?w=1200&q=85",  // Seattle skyline 야경
  "https://images.unsplash.com/photo-1525466760727-1d8be8721154?w=1200&q=85",  // Space Needle 낮
  "https://images.unsplash.com/photo-1546587348-d12660c30c50?w=1200&q=85",     // Pike Place Market
  "https://images.unsplash.com/photo-1519021228607-ef6e4c22a821?w=1200&q=85",  // Seattle 항구 & 선셋
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85",  // PNW 자연 + 시애틀
  "https://images.unsplash.com/photo-1559521783-1d1599583485?w=1200&q=85",     // Seattle 거리 활기
];
// 2시간 단위로 사진 교체 (하루 12 슬롯 → 6장 × 2)
const heroPhotoIdx = Math.floor(new Date().getHours() / 2) % HERO_PHOTOS.length;
const imgHeroCard = HERO_PHOTOS[heroPhotoIdx];
const imgCoffee = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80";
const imgLifestyle = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80";
// 동네 Top 3 사진
const imgLynnwood = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80"; // 한인타운 느낌 suburban
const imgBothell  = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"; // 자연 + 주거 (PNW)
const imgBellevue = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80"; // 현대 도시
import logoImg from "../../imports/icon-192.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useI18n } from "./I18nContext";
import { useContent, resolvePlaceItems, resolveStepItems } from "./ContentContext";
import {
  Home,
  Search,
  Globe,
  MessageCircle,
  MapPin,
  Utensils,
  LifeBuoy,
  Grid,
  Church,
  Map,
  Briefcase,
  GraduationCap,
  DollarSign,
  X,
  Share2,
  Plane,
  HeartPulse,
  Car,
  ShoppingCart,
  FileText,
  Scale,
  BookOpen,
  Receipt,
  Vote,
  LibraryBig,
} from "lucide-react";

/* Quick Menu 아이콘 맵 */
const QM_ICON_MAP: Record<string, React.ComponentType<{size?: number; color?: string; strokeWidth?: number}>> = {
  "plane-landing":  Plane,
  "utensils":       Utensils,
  "home":           Home,
  "heart-pulse":    HeartPulse,
  "church":         Church,
  "car":            Car,
  "shopping-cart":  ShoppingCart,
  "briefcase":      Briefcase,
  "graduation-cap": GraduationCap,
  "dollar-sign":    DollarSign,
  "map":            Map,
  "life-buoy":      LifeBuoy,
  "file-text":      FileText,
  "scale":          Scale,
  "book-open":      BookOpen,
  "receipt":        Receipt,
};

/* ─────────────────────────────────────────
   TOKENS
───────────────────────────────────────── */
const GOLD = "#C9A227";
const MINT = "#6EE7B7";

/* ─────────────────────────────────────────
   HOOK: 온라인 상태 감지
───────────────────────────────────────── */
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return isOnline;
}

/* ─────────────────────────────────────────
   HOOK: PWA 설치 프롬프트
───────────────────────────────────────── */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("hg_install_dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
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
    localStorage.setItem("hg_install_dismissed", "1");
  };

  return { showBanner, handleInstall, handleDismiss };
}

/* ─────────────────────────────────────────
   UTIL: 로컬 알림 스케줄링
───────────────────────────────────────── */
async function scheduleReminder(title: string, daysLater: number) {
  if (!("Notification" in window)) {
    alert("이 브라우저는 알림을 지원하지 않습니다.");
    return;
  }
  if (Notification.permission !== "granted") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
  }
  const ms = daysLater * 24 * 60 * 60 * 1000;
  const reminders = JSON.parse(localStorage.getItem("hg_reminders") || "[]");
  reminders.push({ title, fireAt: Date.now() + ms });
  localStorage.setItem("hg_reminders", JSON.stringify(reminders));
  new Notification("HebronGuide 알림 설정", {
    body: `"${title}" — ${daysLater}일 후 알림을 받습니다`,
    icon: "/icon-192.png",
  });
}

/* ─────────────────────────────────────────
   TOP 5 데이터 타입 & 데이터 상수
───────────────────────────────────────── */
interface Top5Item {
  rank: number;
  emoji: string;
  nameKo: string;
  nameEn: string;
  address?: string;
  phone?: string;
  hours?: string;
  why: string;
  tip?: string;
  website?: string;
  price?: string;
  rating?: number;
  ratingCount?: string;
}

const TOP5_RESTAURANTS: Top5Item[] = [
  { rank: 1, emoji: "🍜", nameKo: "이가네 전통 설렁탕", nameEn: "Yi's Traditional Korean Beef Soup",
    address: "31248 Pacific Hwy S Ste E, Federal Way WA 98003",
    phone: "(253) 946-1101", hours: "매일 8:30am-9pm",
    rating: 4.7, ratingCount: "635+",
    why: "24시간 끓인 사골국물, Yelp 4.7성 635리뷰, 아침부터 영업하는 해장국 명소",
    tip: "웨이팅 있을 수 있음. 아침 일찍 방문 추천", website: "yistraditional.com" },
  { rank: 2, emoji: "🥩", nameKo: "쏘문난집", nameEn: "So Moon Nan Jib",
    address: "33324 Pacific Hwy S, Federal Way WA 98003",
    phone: "(253) 815-8888", hours: "월화·목-일 11am-10pm (수 휴무)",
    rating: 4.3, ratingCount: "667+",
    why: "페더럴웨이 한인 커뮤니티 1위 BBQ, 수제 반찬 10종+, The Emerald Palate Top 3",
    tip: "수요일 휴무. 인기 메뉴 갈비·불고기 조합 추천",
    website: "yelp.com/biz/so-moon-nan-jib-federal-way" },
  { rank: 3, emoji: "🔥", nameKo: "WuJu 코리안 BBQ", nameEn: "WuJu Korean BBQ",
    address: "19400 36th Ave W Ste 102, Lynnwood WA 98036",
    phone: "(425) 672-2650", hours: "화-목 11am-10pm, 금-토 11am-11pm, 일 11am-9pm (월 휴무)",
    rating: 4.2, ratingCount: "256+",
    why: "린우드 숨은 명소, 두꺼운 불고기 전문, 직원이 친절하게 도와줌, 테이크아웃 가능",
    tip: "월요일 휴무. 사전 예약 추천", website: "wujukoreanbbq.com" },
  { rank: 4, emoji: "🍖", nameKo: "백정 린우드", nameEn: "Baekjeong Korean BBQ",
    address: "3000 184th St SW Ste 922, Lynnwood WA 98037",
    phone: "(425) 490-6328", hours: "월-목 11:30am-10pm, 금 11:30am-11pm, 토 11am-11pm, 일 11am-10pm",
    rating: 3.9, ratingCount: "464+",
    why: "알더우드몰 내 LA 체인 정통 BBQ, 직원이 고기 직접 구워줌, 무제한 밑반찬",
    tip: "알더우드몰 주차 무료. 웨이팅 앱 사용 가능", website: "baekjeongkbbq.com" },
  { rank: 5, emoji: "☕", nameKo: "K Cafe Dabang", nameEn: "K Cafe Dabang",
    address: "3333 184th St SW Ste X, Lynnwood WA 98037",
    phone: "(425) 678-8276", hours: "월-목 8am-9pm, 금 8am-10pm, 토-일 11am-9pm",
    rating: 4.5, ratingCount: "126+",
    why: "H-Mart 린우드 바로 옆, 한국식 커피·빙수·크로플, 한인타운 카페 1순위",
    tip: "H-Mart 쇼핑 후 들르기 딱 좋음",
    website: "yelp.com/biz/k-cafe-dabang-lynnwood" },
];

const TOP5_SETTLE: Top5Item[] = [
  { rank: 1, emoji: "🏛️", nameKo: "한인생활상담소 (KCSC)", nameEn: "Korean Community Service Center",
    address: "19509 64th Ave W Ste 270, Lynnwood WA 98036",
    phone: "(425) 776-2400", hours: "월-금 9:30am-4:30pm",
    why: "1983년 설립, 이민 초기 모든 서비스 원스톱 한국어 상담 — 법률·취업·정신건강·식품지원",
    tip: "방문 전 전화 예약 필수", website: "kcsc-seattle.org" },
  { rank: 2, emoji: "🇰🇷", nameKo: "주시애틀 총영사관", nameEn: "Korean Consulate General",
    address: "115 W Mercer St, Seattle WA 98119",
    phone: "(206) 441-1011", hours: "월-금 8:30am-4pm (예약 필수)",
    why: "여권·공증·재외국민등록 — 도미 직후 가장 먼저 방문해야 할 공관",
    tip: "온라인 예약 필수 (매우 혼잡)", website: "overseas.mofa.go.kr/us-seattle-ko" },
  { rank: 3, emoji: "🚗", nameKo: "ABC 운전면허 시험장 (한국어)", nameEn: "ABC Driving Test Center",
    address: "19720 44th Ave W Ste J, Lynnwood WA 98036",
    phone: "(425) 361-1750",
    why: "한국어 필기시험 응시 가능 — 린우드 한인 최다 이용 DOL 공인 시험장. $35",
    tip: "쇼어라인 지점도 운영: 16300 Aurora Ave N", website: "abcdrivingwa.com" },
  { rank: 4, emoji: "🏥", nameKo: "ICHS 쇼어라인 클리닉", nameEn: "ICHS Shoreline Medical & Dental",
    address: "16549 Aurora Ave N, Shoreline WA 98133",
    phone: "(206) 533-2600", hours: "월-토 8am-5pm",
    why: "한국어 구사 의사·치과의사 상주, 보험 없어도 소득 기준 진료 가능",
    tip: "예약: (206) 788-3700. 벨뷰·국제지구 지점도 운영", website: "ichs.com" },
  { rank: 5, emoji: "⚖️", nameKo: "북서부 이민권 프로젝트 (NWIRP)", nameEn: "Northwest Immigrant Rights Project",
    address: "615 2nd Ave Ste 400, Seattle WA 98104",
    phone: "(800) 445-5771", hours: "월-금 9am-5pm",
    why: "이민 법률 무료 지원 — 영주권·비자·추방방어. 저소득 이민자 전문",
    tip: "무료 전화 상담 가능. 한국어 서비스 요청 가능", website: "nwirp.org" },
];

const TOP5_EXPLORE: Top5Item[] = [
  { rank: 1, emoji: "🗼", nameKo: "스페이스 니들", nameEn: "Space Needle",
    address: "400 Broad St, Seattle WA 98109",
    phone: "(206) 905-2100", hours: "매일 8am-10:30pm (시즌별 상이)",
    price: "$49 / 콤보(치훌리) $69",
    why: "시애틀 1번 랜드마크, 605ft 유리 전망대, 야경 최고, 한인 관광객 필수 방문",
    tip: "금·토 야경 추천. 치훌리 콤보권이 개별 구매보다 $20 절약", website: "spaceneedle.com" },
  { rank: 2, emoji: "🐟", nameKo: "파이크 플레이스 마켓", nameEn: "Pike Place Market",
    address: "85 Pike St, Seattle WA 98101",
    phone: "(206) 682-7453", hours: "매일 9am-6pm",
    price: "입장 무료 (쇼핑·식사 별도)",
    why: "100년 역사 시장, 생선 던지기 퍼포먼스, 오리지널 스타벅스 1호점, 도보 관광 최적",
    tip: "평일 오전 9-11시 방문이 덜 혼잡. 지하 상가도 탐방", website: "pikeplacemarket.org" },
  { rank: 3, emoji: "🏔️", nameKo: "마운트 레이니어", nameEn: "Mount Rainier National Park",
    address: "Ashford, WA 98304 (니스콸리 입구)",
    phone: "(360) 569-2211",
    price: "$30/차량 (2026년 예약제 폐지)",
    why: "시애틀 2시간 거리 만년설 화산, 야생화 Paradise 트레일, 장엄한 4,392m 설경",
    tip: "오전 일찍 출발 권장. America the Beautiful 패스 있으면 무료", website: "nps.gov/mora" },
  { rank: 4, emoji: "💧", nameKo: "스노퀄미 폭포", nameEn: "Snoqualmie Falls",
    address: "6820 Railroad Ave SE, Snoqualmie WA 98065",
    price: "무료",
    why: "시애틀 동쪽 30분, Twin Peaks 촬영지, 82m 폭포, 산책로·카페 조합 완벽한 당일치기",
    tip: "주차 $5. 폭포 아래 전망대까지 15분 트레일 추천",
    website: "snoqualmiefalls.com" },
  { rank: 5, emoji: "⛴️", nameKo: "베인브릿지 아일랜드 페리", nameEn: "Bainbridge Island Ferry",
    address: "Colman Dock, 801 Alaskan Way, Seattle WA 98104",
    price: "성인 편도 $9.25 (차 없이 승선)",
    why: "35분 페리, 시애틀 스카이라인 뷰 최고, 올림픽 반도 문, 한인 커뮤니티 강력 추천",
    tip: "편도만 탑승료 징수 (시애틀→베인브릿지 방향). 저녁 노을 뷰 최고", website: "wsdot.wa.gov/ferries" },
];

/* ─────────────────────────────────────────
   COMPONENT: Top5Banner (가로 스크롤 카드)
───────────────────────────────────────── */
function Top5Banner({ items, lang, accentColor }: { items: Top5Item[]; lang: string; accentColor: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ padding: "0 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 16 }}>⭐</span>
        <span style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 15, color: "#ECFDF5" }}>
          {lang === "ko" ? "TOP 5 베스트 — 검증된 추천" : "TOP 5 Best — Verified Picks"}
        </span>
      </div>
      <div
        style={{ display: "flex", gap: 10, overflowX: "auto", paddingLeft: 16, paddingRight: 16, scrollbarWidth: "none" }}
        className="[&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 220,
            background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14,
            border: `1.5px solid ${accentColor}44`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: accentColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#fff", flexShrink: 0,
              }}>
                {item.rank}
              </div>
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <span style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13,
                color: "#ECFDF5", lineHeight: 1.3 }}>
                {lang === "ko" ? item.nameKo : item.nameEn}
              </span>
            </div>
            {item.rating && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>
                  {"★".repeat(Math.round(item.rating))} {item.rating}
                </span>
                {item.ratingCount && <span style={{ fontSize: 10, color: "rgba(236,253,245,0.4)" }}> ({item.ratingCount})</span>}
              </div>
            )}
            {item.price && (
              <div style={{ marginBottom: 6, fontSize: 11, color: accentColor, fontWeight: 700 }}>{item.price}</div>
            )}
            <div style={{ fontSize: 11, color: "rgba(236,253,245,0.65)", lineHeight: 1.5, marginBottom: 6 }}>
              {item.why}
            </div>
            {item.address && (
              <a href={`https://maps.google.com/?q=${encodeURIComponent(item.address)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none", marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>📍</span>
                <span style={{ fontSize: 10, color: accentColor, fontWeight: 600, textDecoration: "underline" }}>
                  {item.address.split(",")[0]}
                </span>
                <span style={{ fontSize: 9, color: "rgba(236,253,245,0.4)" }}>→ 지도</span>
              </a>
            )}
            {/* 링크 버튼 행 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
              {item.phone && (
                <a href={`tel:${item.phone}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none",
                    background: `${accentColor}18`, border: `1px solid ${accentColor}33`, borderRadius: 20, padding: "3px 8px" }}>
                  <span style={{ fontSize: 10 }}>📞</span>
                  <span style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>전화</span>
                </a>
              )}
              {item.website && (
                <a href={item.website.startsWith("http") ? item.website : `https://${item.website}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 3, textDecoration: "none",
                    background: "rgba(110,231,183,0.12)", border: "1px solid rgba(110,231,183,0.3)", borderRadius: 20, padding: "3px 8px" }}>
                  <span style={{ fontSize: 10 }}>🌐</span>
                  <span style={{ fontSize: 10, color: "#6EE7B7", fontWeight: 700 }}>공식 사이트</span>
                </a>
              )}
            </div>
            {item.tip && (
              <div style={{ marginTop: 6, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)",
                fontSize: 10, color: "rgba(236,253,245,0.55)", fontStyle: "italic" }}>
                💡 {item.tip}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENT: 설치 배너 (PWA InstallBanner)
───────────────────────────────────────── */
function InstallBanner({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <div style={{
      position: "fixed", top: 56, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 398,
      background: "linear-gradient(135deg, rgba(110,231,183,0.15), rgba(201,162,39,0.10))",
      border: "1px solid rgba(110,231,183,0.25)",
      borderRadius: 16, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      zIndex: 100, backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      <span style={{ fontSize: 28 }}>📱</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#e6edf3", fontFamily: "Manrope,sans-serif" }}>홈 화면에 추가하기</div>
        <div style={{ fontSize: 12, color: "rgba(230,237,243,0.6)", marginTop: 2, fontFamily: "Manrope,sans-serif" }}>
          오프라인에서도 사용 가능 · 공항에서도 OK
        </div>
      </div>
      <button onClick={onInstall} style={{
        background: MINT, color: "#0d1117", border: "none",
        borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13,
        cursor: "pointer", fontFamily: "Manrope,sans-serif", flexShrink: 0,
      }}>설치</button>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", color: "rgba(230,237,243,0.4)",
        fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1,
      }}>×</button>
    </div>
  );
}

/* ─────────────────────────────────────────
   COMPONENT: 오프라인 배너
───────────────────────────────────────── */
function OfflineBanner() {
  return (
    <div style={{
      position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)",
      background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
      borderRadius: 20, padding: "8px 16px",
      fontSize: 12, fontWeight: 600, color: MINT,
      zIndex: 90, backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      fontFamily: "Manrope,sans-serif",
      whiteSpace: "nowrap",
    }}>
      📡 오프라인 모드 — 저장된 정보 사용 중
    </div>
  );
}

/* ─────────────────────────────────────────
   HOOK: 체크리스트 localStorage 상태
───────────────────────────────────────── */
function useChecklist(itemId: string) {
  const key = `hg_checklist_${itemId}`;
  const [isDone, setIsDone] = useState(() => localStorage.getItem(key) === "1");

  const toggle = () => {
    const next = !isDone;
    setIsDone(next);
    if (next) {
      localStorage.setItem(key, "1");
    } else {
      localStorage.removeItem(key);
    }
  };

  return { isDone, toggle };
}

/* ─────────────────────────────────────────
   COMPONENT: 체크리스트 아이템
───────────────────────────────────────── */
interface ChecklistItemProps {
  itemId: string;
  title: string;
  desc: string;
  accentColor?: string;
  showReminder?: boolean;
}
function ChecklistItem({ itemId, title, desc, accentColor = MINT, showReminder = false }: ChecklistItemProps) {
  const { isDone, toggle } = useChecklist(itemId);
  const [reminderSet, setReminderSet] = useState(false);

  const handleReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await scheduleReminder(title, 30);
    setReminderSet(true);
  };

  return (
    <div
      onClick={toggle}
      style={{
        display: "flex", gap: 12, alignItems: "flex-start",
        padding: "14px 16px",
        background: isDone ? "rgba(110,231,183,0.08)" : "rgba(255,255,255,0.04)",
        borderRadius: 12,
        border: isDone ? "1px solid rgba(110,231,183,0.2)" : "1px solid rgba(255,255,255,0.06)",
        cursor: "pointer",
        marginBottom: 10,
        transition: "all 0.2s ease",
      }}
    >
      {/* 체크박스 원형 */}
      <div style={{
        flexShrink: 0,
        width: 24, height: 24, borderRadius: "50%",
        background: isDone ? accentColor : "transparent",
        border: isDone ? `none` : `2px solid rgba(255,255,255,0.25)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 1, transition: "all 0.2s ease",
      }}>
        {isDone && <span style={{ color: "#0d1117", fontSize: 13, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: "#ECFDF5",
          textDecoration: isDone ? "line-through" : "none",
          opacity: isDone ? 0.6 : 1, marginBottom: 3, transition: "all 0.2s ease",
        }}>{title}</div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.65, color: "rgba(236,253,245,0.5)" }}>{desc}</div>
        {showReminder && !isDone && (
          <button
            onClick={handleReminder}
            style={{
              marginTop: 8, background: reminderSet ? "rgba(110,231,183,0.15)" : "rgba(255,255,255,0.06)",
              border: reminderSet ? `1px solid ${accentColor}44` : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, padding: "4px 10px", fontSize: 10, fontFamily: "Manrope,sans-serif",
              fontWeight: 600, color: reminderSet ? accentColor : "rgba(236,253,245,0.5)",
              cursor: "pointer",
            }}
          >
            {reminderSet ? "✓ 알림 설정됨" : "🔔 30일 후 알림 받기"}
          </button>
        )}
      </div>
    </div>
  );
}

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
/* ─────────────────────────────────────────
   실시간 데이터 훅 (환율·기름값)
───────────────────────────────────────── */
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

  // live.json: GitHub Actions 매일 갱신 (기름값·환율·렌트·기온)
  useEffect(() => {
    fetch("/data/live.json?t=" + Math.floor(Date.now() / 3_600_000))
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

/* ─────────────────────────────────────────
   LIVE DATA BAR (환율·기름값·시각)
───────────────────────────────────────── */
function LiveDataBar() {
  const { lang } = useI18n();
  const { rate, rateTime, gas, gasDate, rent, tempF } = useLiveData();
  const [seoulTime, setSeoulTime] = useState("");
  const [seattleTime, setSeattleTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setSeattleTime(now.toLocaleTimeString("ko-KR", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit" }));
      setSeoulTime(now.toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  const items = [
    {
      icon: "🌡️",
      label: lang === "ko" ? "시애틀 기온" : "Seattle Temp",
      value: tempF ? `${tempF}°F` : "…",
      sub: lang === "ko" ? "실시간" : "Live",
      color: "#F97316",
    },
    {
      icon: "💱",
      label: lang === "ko" ? "원/달러" : "KRW/USD",
      value: rate ? `₩${rate.toLocaleString()}` : "…",
      sub: rateTime ? (lang === "ko" ? `${rateTime} 갱신` : `${rateTime}`) : lang === "ko" ? "로딩 중" : "Loading",
      color: "#F2994A",
    },
    {
      icon: "⛽",
      label: lang === "ko" ? "WA 기름값" : "WA Gas",
      value: gas ? `$${gas.toFixed(2)}` : "…",
      sub: gasDate ? (lang === "ko" ? `${gasDate}` : `${gasDate}`) : "loading",
      color: "#60A5FA",
    },
    {
      icon: "🏠",
      label: lang === "ko" ? "시애틀 월세" : "Seattle Rent",
      value: rent ? `$${rent.toLocaleString()}` : "…",
      sub: lang === "ko" ? "1BR 중앙값" : "1BR median",
      color: MINT,
    },
    {
      icon: "🕐",
      label: lang === "ko" ? "시애틀·서울" : "SEA·ICN",
      value: seattleTime || "…",
      sub: seoulTime ? `서울 ${seoulTime}` : "",
      color: "#C9A227",
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
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${item.color}30`,
          borderRadius: 14, padding: "10px 12px",
          display: "flex", flexDirection: "column", gap: 3,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: "rgba(236,253,245,0.45)", fontFamily: "Manrope,sans-serif", fontWeight: 600 }}>
              {item.label}
            </span>
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 16, color: item.color, letterSpacing: "-0.3px" }}>
            {item.value}
          </div>
          {item.sub && (
            <div style={{ fontSize: 9, color: "rgba(236,253,245,0.35)", fontFamily: "Manrope,sans-serif" }}>
              {item.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

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
   NEW HOME: CompactHeroNew
───────────────────────────────────────── */
function CompactHeroNew() {
  const { lang } = useI18n();
  return (
    <div style={{
      position: "relative", height: "clamp(120px, 22dvh, 180px)", overflow: "hidden",
      borderRadius: "0 0 28px 28px",
    }}>
      <img src={imgHeroCard} alt="Seattle" style={{
        width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%",
        filter: "brightness(0.75) saturate(1.2)"
      }} />
      <video autoPlay muted loop playsInline style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", objectPosition: "center 35%",
      }}>
        <source src="https://videos.pexels.com/video-files/20017409/20017409-hd_1920_1080_24fps.mp4" type="video/mp4" />
      </video>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
      <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 24, color: "#fff",
          letterSpacing: "-0.5px", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
          HebronGuide <span style={{ color: "#F2994A" }}>Seattle</span>
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>
          {lang === "ko" ? "도시를 알고, 사람을 찾다" : "Know your city. Find your people."}
        </div>
      </div>
      <a href="https://www.earthcam.com/usa/washington/seattle/" target="_blank" rel="noopener noreferrer"
        style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 5,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "5px 10px",
          textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B30", display: "inline-block",
          animation: "livepulse 1.5s infinite" }} />
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10, color: "#fff" }}>LIVE CAM</span>
      </a>
    </div>
  );
}

/* ─────────────────────────────────────────
   NEW HOME: QuickMenuSection
───────────────────────────────────────── */
// 탭 순서: 이민자·이주자·관광객·방문자 모두 포용 — 차별화 전략 반영
// 1.정착(Day-1 핵심) 2.맛집(모두 공통) 3.탐방(관광·방문) 4.거주지(이민) 5.생활비(참고) 6.취업 7.교육 8.도움 9.교회(편의점처럼 자연스럽게)
// Quick Menu 순서: 긴급성·사용빈도 기준 최적화
// 정착(Day-1) → 맛집(공통) → 관광(방문객) → 도움(긴급) → 거주지 → 취업 → 교육 → 생활비 → 교회(자연스러운 연결)
const QUICK_MENU = [
  { icon: "plane-landing",  labelKo: "정착",   labelEn: "Settle",  color: "#F2994A", tab: 1, subTab: 0 },
  { icon: "utensils",       labelKo: "맛집",   labelEn: "Food",    color: "#EF4444", tab: 3, subTab: 0 },
  { icon: "home",           labelKo: "거주지",  labelEn: "Areas",   color: "#10B981", tab: 1, subTab: 5 },
  { icon: "heart-pulse",    labelKo: "병원",   labelEn: "Medical", color: "#EC4899", tab: 5, subTab: 1 },
  { icon: "church",         labelKo: "교회",   labelEn: "Church",  color: "#7C3AED", tab: 2, subTab: 0 },
  { icon: "car",            labelKo: "면허",   labelEn: "DMV",     color: "#3B82F6", tab: 1, subTab: 3 },
  { icon: "shopping-cart",  labelKo: "마트",   labelEn: "Market",  color: "#F59E0B", tab: 3, subTab: 2 },
  { icon: "briefcase",      labelKo: "취업",   labelEn: "Jobs",    color: "#059669", tab: 6, subTab: 0 },
  { icon: "graduation-cap", labelKo: "교육",   labelEn: "Schools", color: "#8B5CF6", tab: 7, subTab: 0 },
  { icon: "dollar-sign",    labelKo: "생활비",  labelEn: "Costs",   color: "#0EA5E9", tab: 8, subTab: 0 },
  { icon: "map",            labelKo: "관광",   labelEn: "Tourism", color: "#06B6D4", tab: 4, subTab: 0 },
  { icon: "life-buoy",      labelKo: "도움",   labelEn: "Help",    color: "#DC2626", tab: 5, subTab: 0 },
  { icon: "file-text",      labelKo: "비자·이민", labelEn: "Visa",    color: "#6366F1", tab: 1, subTab: 7 },
  { icon: "receipt",        labelKo: "세금신고", labelEn: "Taxes",   color: "#F97316", tab: 8, subTab: 4 },
  { icon: "scale",          labelKo: "법률상담", labelEn: "Legal",   color: "#64748B", tab: 5, subTab: 5 },
  { icon: "book-open",      labelKo: "한국학교", labelEn: "K-School",color: "#BE185D", tab: 7, subTab: 5 },
];

function QuickMenuSection({ onNavigate }: { onNavigate?: (tab: number, subTab?: number) => void }) {
  const { lang } = useI18n();
  return (
    <div style={{ padding: "20px 20px 16px" }}>
      <div style={{
        fontFamily: "'Noto Sans KR', sans-serif",
        fontWeight: 700, fontSize: 15, color: "#1B2A4A",
        letterSpacing: "-0.3px", marginBottom: 18,
      }}>
        {lang === "ko" ? "바로 가기" : "Quick Access"}
      </div>
      {/* iPhone 홈 스크린 스타일 — 4열, 60px 아이콘 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", rowGap: 20, columnGap: 8 }}>
        {QUICK_MENU.map((item, i) => (
          <button key={i} onClick={() => onNavigate?.(item.tab, item.subTab)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            padding: 0, WebkitTapHighlightColor: "transparent",
          }}
          onTouchStart={e => { const el = e.currentTarget.querySelector('.qm-icon') as HTMLElement; if (el) el.style.transform = "scale(0.87)"; }}
          onTouchEnd={e => { const el = e.currentTarget.querySelector('.qm-icon') as HTMLElement; if (el) el.style.transform = "scale(1)"; }}
          >
            {/* 60×60 squircle — SVG 아이콘 꽉 채움 */}
            {(() => {
              const IconComp = QM_ICON_MAP[item.icon];
              return (
                <div className="qm-icon" style={{
                  width: 60, height: 60,
                  borderRadius: 14,
                  background: item.color,
                  boxShadow: `0 3px 10px ${item.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.12s ease",
                  flexShrink: 0,
                }}>
                  {IconComp && <IconComp size={30} color="#fff" strokeWidth={1.8} />}
                </div>
              );
            })()}
            {/* 라벨 */}
            <span style={{
              fontFamily: "-apple-system, 'SF Pro Text', 'Noto Sans KR', sans-serif",
              fontWeight: 400, fontSize: 11,
              color: "#3C3C43",
              letterSpacing: "-0.1px",
              textAlign: "center",
              lineHeight: 1.3,
              width: "100%",
            }}>
              {lang === "ko" ? item.labelKo : item.labelEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   NEW HOME: SettlementEssentialsSection
───────────────────────────────────────── */
const SETTLE_STEPS = [
  { num: "1", emoji: "📱", titleKo: "SIM 카드",    titleEn: "SIM Card",      descKo: "공항 T-Mobile\n$30/월",       descEn: "Airport T-Mobile\n$30/mo",      color: "#F2994A" },
  { num: "2", emoji: "🏠", titleKo: "임시 숙소",    titleEn: "Housing",       descKo: "에어비앤비\n린우드 권장",        descEn: "Airbnb\nLynnwood area",         color: "#7C3AED" },
  { num: "3", emoji: "🏦", titleKo: "은행 계좌",    titleEn: "Bank Account",  descKo: "Chase 추천\n여권만 OK",        descEn: "Chase preferred\nPassport only", color: "#2563EB" },
  { num: "4", emoji: "🚗", titleKo: "운전면허",     titleEn: "Driver License", descKo: "한국어 필기\n가능",            descEn: "Korean test\navailable",         color: "#059669" },
  { num: "5", emoji: "📋", titleKo: "SSN 신청",    titleEn: "Apply SSN",     descKo: "915 2nd Ave\n입국10일후",      descEn: "915 2nd Ave\n10 days after",    color: "#EF4444" },
  { num: "6", emoji: "💊", titleKo: "건강보험",     titleEn: "Health Ins.",   descKo: "WA Apple Health\n무료 가능",   descEn: "WA Apple Health\nFree option",  color: "#64748B" },
];

function SettlementEssentialsSection({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  const { lang } = useI18n();
  return (
    <div style={{ padding: "16px 0 8px" }}>
      <div style={{ padding: "0 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontWeight: 700, fontSize: 15, color: "#1B2A4A", letterSpacing: "-0.3px",
        }}>
          ✅ {lang === "ko" ? "정착 필수" : "Settlement Essentials"}
        </div>
        <button onClick={() => onNavigate?.(1)} style={{
          background: "none", border: "none",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Noto Sans KR', sans-serif",
          fontWeight: 600,
          fontSize: 12, color: "#F2994A", cursor: "pointer" }}>
          {lang === "ko" ? "전체 보기 →" : "See all →"}
        </button>
      </div>
      {/* 2열 그리드 — 카드 간격 넓게, 내부는 꽉 차게 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16,
        padding: "0 16px" }}>
        {SETTLE_STEPS.map((step, i) => (
          <button key={i} onClick={() => onNavigate?.(1)} style={{
            background: "#FFFFFF", borderRadius: 14, padding: "12px 10px",
            display: "flex", flexDirection: "row", alignItems: "center", gap: 10,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            cursor: "pointer", textAlign: "left",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, background: step.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>
              {step.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "-apple-system, 'Noto Sans KR', sans-serif",
                fontWeight: 700, fontSize: 12,
                color: "#1B2A4A", marginBottom: 2 }}>
                {lang === "ko" ? step.titleKo : step.titleEn}
              </div>
              <div style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: 10, color: "#64748B",
                lineHeight: 1.4, whiteSpace: "pre-line" }}>
                {lang === "ko" ? step.descKo : step.descEn}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HERO CARD (HD 영상 배경 + 라이브 데이터) — 기존 유지 (홈에서 미사용)
───────────────────────────────────────── */
// Pexels 무료 시애틀 HD 영상 (Pexels License — 상업적 무료 사용 가능)
const SEATTLE_VIDEOS = [
  "https://videos.pexels.com/video-files/20017409/20017409-hd_1920_1080_24fps.mp4",  // Space Needle 스카이라인
  "https://videos.pexels.com/video-files/2257258/2257258-hd_1920_1080_30fps.mp4",    // 시애틀 파노라마
  "https://videos.pexels.com/video-files/29024579/29024579-hd_1920_1080_25fps.mp4",  // 스페이스 니들 석양
];

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
        style={{ objectPosition: "center 40%", filter: "brightness(1.05) saturate(1.3)",
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
        <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10,
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
              style={{ color: "#ECFDF5", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 9 }}>
              {t("hero.badge")}
            </span>
          </div>
          <h1 className="m-0 p-0" style={{ fontFamily: "'Noto Sans KR','WenQuanYi Zen Hei',sans-serif",
            fontWeight: 700, fontSize: 38, letterSpacing: "-1.5px", lineHeight: 1.18,
            color: "#FFFFFF", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}>
            {t("hero.title")}
          </h1>
          <p className="m-0 uppercase tracking-[0.5px]"
            style={{ fontFamily: "Manrope,sans-serif", fontWeight: 300, fontSize: 12,
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
// desc 텍스트에서 📍주소·📞전화를 추출해 Maps/전화 링크로 변환
function renderDescWithLinks(desc: string, accentColor: string) {
  const addrMatch  = desc.match(/📍\s*([^|📞🔗\n]+)/);
  const phoneMatch = desc.match(/📞\s*([\d\s\-()+]+)/);
  // 🔗 뒤에 오는 URL 또는 도메인 감지 (공식 웹사이트)
  const webMatch   = desc.match(/🔗\s*(https?:\/\/[\w\-\.\/\?=&%#]+|[\w\-]+\.[\w]{2,}[\w\/\-\.]*)/i);
  const addr  = addrMatch  ? addrMatch[1].trim()  : null;
  const phone = phoneMatch ? phoneMatch[1].trim()  : null;
  const web   = webMatch   ? webMatch[1].trim()    : null;
  const webHref = web ? (web.startsWith("http") ? web : `https://${web}`) : null;
  // 아이콘들 제거한 순수 설명 텍스트
  const cleanDesc = desc
    .replace(/📍[^|📞🔗\n]+/g, "")
    .replace(/📞[\d\s\-()+]+/g, "")
    .replace(/🔗\s*(https?:\/\/[\w\-\.\/\?=&%#]+|[\w\-]+\.[\w]{2,}[\w\/\-\.]*)/ig, "")
    .replace(/\|\s*\|/g, "|").replace(/^\|+|\|+$/g, "").trim();
  return (
    <div>
      {cleanDesc && (
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.6, color: "rgba(236,253,245,0.6)", marginTop: 5, whiteSpace: "pre-wrap" }}>
          {cleanDesc}
        </div>
      )}
      {/* 링크 버튼 행 */}
      {(addr || phone || webHref) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {addr && (
            <a href={`https://maps.google.com/?q=${encodeURIComponent(addr)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none",
                background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
                borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ fontSize: 11 }}>📍</span>
              <span style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>지도</span>
            </a>
          )}
          {phone && (
            <a href={`tel:${phone.replace(/\D/g, "")}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none",
                background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
                borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ fontSize: 11 }}>📞</span>
              <span style={{ fontSize: 10, color: accentColor, fontWeight: 700 }}>{phone.trim().replace(/^\(/, "").split(")")[0].trim()}</span>
            </a>
          )}
          {webHref && (
            <a href={webHref} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none",
                background: "rgba(110,231,183,0.12)", border: "1px solid rgba(110,231,183,0.3)",
                borderRadius: 20, padding: "3px 10px" }}>
              <span style={{ fontSize: 11 }}>🌐</span>
              <span style={{ fontSize: 10, color: "#6EE7B7", fontWeight: 700 }}>공식 웹사이트</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

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
          {renderDescWithLinks(desc, accentColor)}
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

/* ─────────────────────────────────────────
   BACK BUTTON (섹션 화면 상단 홈 복귀)
   — 언제 어디서든 홈으로 돌아올 수 있는 길
───────────────────────────────────────── */
function BackToHomeButton({ onHome, lang }: { onHome?: () => void; lang: string }) {
  // 하단 네비바에서 홈 이동 가능 — 별도 버튼 불필요 (공간 절약)
  return null;
  if (!onHome) return null;
  return (
    <button
      onClick={onHome}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 16px",
        background: "rgba(242,153,74,0.08)",
        border: "none",
        borderBottom: "1px solid rgba(242,153,74,0.15)",
        cursor: "pointer",
        width: "100%",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(242,153,74,0.15)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(242,153,74,0.08)")}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: "rgba(242,153,74,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0,
      }}>🏠</div>
      <div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#F2994A" }}>
          {lang === "ko" ? "← 홈으로" : "← Home"}
        </div>
        <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 10, color: "rgba(242,153,74,0.6)", marginTop: 1 }}>
          HebronGuide
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────
   FLOATING HOME BUTTON
   — 어느 탭에 있든 항상 홈으로 돌아올 수 있는 고정 버튼
───────────────────────────────────────── */
function FloatingHomeButton({ activeNav, onHome }: { activeNav: number; onHome: () => void }) {
  if (activeNav === 0) return null; // 홈 화면에서는 숨김
  return (
    <button
      onClick={onHome}
      style={{
        position: "fixed",
        bottom: 90,        // 바텀 네비 위
        right: 16,
        zIndex: 200,
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "#F2994A",
        border: "none",
        boxShadow: "0 4px 16px rgba(242,153,74,0.45)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(242,153,74,0.6)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(242,153,74,0.45)";
      }}
      title="홈으로"
    >
      🏠
    </button>
  );
}

/* ═══════════════════════════════════════════
   ── TAB SCREENS ───────────────────────────
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   APP GRID (홈 스크린 앱 런처)
───────────────────────────────────────── */
interface AppGridItem {
  emoji: string;
  label: string;
  labelEn: string;
  tabIndex: number;
  color: string;
}

const APP_GRID_ITEMS: AppGridItem[] = [
  { emoji: "🛬", label: "정착 가이드",  labelEn: "Settlement",  tabIndex: 1, color: "#60A5FA" },
  { emoji: "⛪", label: "교회 찾기",   labelEn: "Churches",    tabIndex: 2, color: "#C084FC" },
  { emoji: "🍽️", label: "맛집·카페",  labelEn: "Dining",      tabIndex: 3, color: "#FB923C" },
  { emoji: "🗺️", label: "관광",   labelEn: "Tourism",     tabIndex: 4, color: "#34D399" },
  { emoji: "🆘", label: "도움·지원",   labelEn: "Help",        tabIndex: 5, color: "#F87171" },
  { emoji: "💼", label: "취업 정보",   labelEn: "Jobs",        tabIndex: 6, color: "#FBBF24" },
  { emoji: "🎓", label: "교육·학군",   labelEn: "Education",   tabIndex: 7, color: "#A78BFA" },
  { emoji: "💰", label: "생활비",      labelEn: "Living Cost", tabIndex: 8, color: "#34D399" },
];

function AppGrid({ onNavigate }: { onNavigate?: (tab: number) => void }) {
  const { lang } = useI18n();
  return (
    <section>
      <div className="flex items-center gap-[10px] mb-4">
        <div className="pl-[12px]" style={{ borderLeft: `3px solid ${MINT}` }}>
          <h2 className="m-0" style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px", color: "#ECFDF5" }}>
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
              fontSize: 20,
            }}>
              {item.emoji}
            </div>
            <span style={{
              fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 600, fontSize: 10,
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

/* ─────────────────────────────────────────
   TOP 3 동네 (2026 최신)
───────────────────────────────────────── */
function Top3NeighborhoodsSection() {
  const { lang } = useI18n();
  const hoods = [
    {
      rank: 1,
      emoji: "🏆",
      nameKo: "린우드 (Lynnwood)",
      nameEn: "Lynnwood — Korean Town",
      img: imgLynnwood,
      tagKo: "한인 1번지",
      tagEn: "Koreatown Hub",
      color: "#F2994A",
      pointsKo: [
        "H-Mart · 한식당 · 한인 교회 밀집",
        "링크 라이트레일 직결 (2024 개통)",
        "렌트 1BR $1,800–2,100 (시애틀比 저렴)",
        "Northshore SD — 한인 가족 최다 밀집 학군",
      ],
      pointsEn: [
        "H-Mart · Korean restaurants · churches nearby",
        "Link Light Rail direct (opened 2024)",
        "Rent 1BR $1,800–2,100 (cheaper than Seattle)",
        "Northshore SD — highest Korean family concentration",
      ],
    },
    {
      rank: 2,
      emoji: "⭐",
      nameKo: "보텔·우딘빌 (Bothell)",
      nameEn: "Bothell / Woodinville",
      img: imgBothell,
      tagKo: "학군 + 자연",
      tagEn: "Schools + Nature",
      color: "#6EE7B7",
      pointsKo: [
        "Northshore SD — Inglemoor·Bothell HS (Niche A)",
        "한인 가족 급성장 지역 (2023→2026 +18%)",
        "렌트 1BR $1,900–2,300",
        "I-405 · SR-522 접근 편리",
      ],
      pointsEn: [
        "Northshore SD — Inglemoor & Bothell HS (Niche A)",
        "Korean family growth area (+18% since 2023)",
        "Rent 1BR $1,900–2,300",
        "Easy I-405 & SR-522 access",
      ],
    },
    {
      rank: 3,
      emoji: "💎",
      nameKo: "벨뷰 (Bellevue)",
      nameEn: "Bellevue — Tech & Schools",
      img: imgBellevue,
      tagKo: "테크 · 최상위 학군",
      tagEn: "Tech · Top Schools",
      color: "#60A5FA",
      pointsKo: [
        "Bellevue SD — 워싱턴주 1위 학군 (Niche A+)",
        "Amazon·Microsoft·Google 출퇴근 최적",
        "렌트 1BR $2,300–2,900 (프리미엄)",
        "한인 인구 급증 — 한식당·카페 확장 중",
      ],
      pointsEn: [
        "Bellevue SD — WA #1 school district (Niche A+)",
        "Optimal for Amazon·Microsoft·Google commute",
        "Rent 1BR $2,300–2,900 (premium)",
        "Korean population surging — more restaurants & cafés",
      ],
    },
  ];

  return (
    <section>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 18, color: "#e6edf3", letterSpacing: "-0.5px" }}>
          🏘️ {lang === "ko" ? "살기 좋은 동네 Top 3" : "Best Neighborhoods Top 3"}
        </div>
        <div style={{ fontSize: 12, color: "rgba(230,237,243,0.5)", marginTop: 4 }}>
          {lang === "ko" ? "2026년 Korean American 추천 기준" : "2026 picks for Korean Americans"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {hoods.map((h) => (
          <div key={h.rank} style={{
            borderRadius: 20, overflow: "hidden",
            border: `1px solid ${h.color}33`,
            background: "rgba(255,255,255,0.03)",
          }}>
            {/* 사진 */}
            <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
              <img src={h.img} alt={h.nameKo} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(13,17,23,0.85) 100%)" }} />
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{h.emoji}</span>
                <span style={{ background: h.color, color: "#0d1117", fontWeight: 800, fontSize: 11, padding: "3px 10px", borderRadius: 20 }}>
                  #{h.rank} {lang === "ko" ? h.tagKo : h.tagEn}
                </span>
              </div>
              <div style={{ position: "absolute", bottom: 12, left: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.4px" }}>
                  {lang === "ko" ? h.nameKo : h.nameEn}
                </div>
              </div>
            </div>
            {/* 포인트 */}
            <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              {(lang === "ko" ? h.pointsKo : h.pointsEn).map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: h.color, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: "rgba(230,237,243,0.75)", lineHeight: 1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* 2026 생활 팁 */}
      <div style={{
        marginTop: 16, padding: "14px 16px", borderRadius: 16,
        background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.15)",
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: MINT, marginBottom: 8 }}>
          💡 {lang === "ko" ? "2026 시애틀 생활 팁" : "2026 Seattle Living Tips"}
        </div>
        {(lang === "ko" ? [
          "📡 링크 라이트레일 린우드역 개통 — SeaTac↔린우드 직결 (52분)",
          "💵 시애틀 최저시급 $20.76/시 (2026) — WA 소득세 없음",
          "🏠 렌트 소폭 하락세 — 2024 피크 대비 린우드 5% 하락",
          "🛒 H-Mart 린우드 확장 오픈 — 한식 푸드코트 규모 2배",
          "🚗 전기차 구매 시 WA주 세금 면제 최대 $3,000",
        ] : [
          "📡 Link Light Rail Lynnwood Station — SeaTac↔Lynnwood direct (52 min)",
          "💵 Seattle min wage $20.76/hr (2026) — WA has no state income tax",
          "🏠 Rent softening — Lynnwood down ~5% from 2024 peak",
          "🛒 H-Mart Lynnwood expansion — food court doubled in size",
          "🚗 WA EV tax exemption up to $3,000 on electric vehicle purchase",
        ]).map((tip, i) => (
          <div key={i} style={{ fontSize: 12, color: "rgba(230,237,243,0.7)", lineHeight: 1.6 }}>{tip}</div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TAB 1: 홈 SCREEN
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   CITY HUB — 다른 도시 HebronGuide 연결
───────────────────────────────────────── */
const HEBRON_CITIES = [
  { emoji: "🌲", nameKo: "시애틀",      nameEn: "Seattle",       flag: "🇺🇸", url: "/seattle/",    status: "live",    color: "#0EA5E9" },
  { emoji: "🤠", nameKo: "달라스",      nameEn: "Dallas",        flag: "🇺🇸", url: "/dallas/",     status: "live",    color: "#F59E0B" },
  { emoji: "🌉", nameKo: "샌프란시스코", nameEn: "San Francisco", flag: "🇺🇸", url: "/sf/",         status: "live",    color: "#8B5CF6" },
  { emoji: "🗽", nameKo: "뉴욕",        nameEn: "New York",      flag: "🇺🇸", url: "/newyork/",    status: "soon",    color: "#EF4444" },
  { emoji: "🎵", nameKo: "내쉬빌",      nameEn: "Nashville",     flag: "🇺🇸", url: "/nashville/",  status: "soon",    color: "#10B981" },
  { emoji: "🦞", nameKo: "보스턴",      nameEn: "Boston",        flag: "🇺🇸", url: "/boston/",     status: "soon",    color: "#3B82F6" },
  { emoji: "🎬", nameKo: "LA",          nameEn: "Los Angeles",   flag: "🇺🇸", url: "/la/",         status: "coming",  color: "#F97316" },
  { emoji: "🍁", nameKo: "토론토",      nameEn: "Toronto",       flag: "🇨🇦", url: "/toronto/",    status: "coming",  color: "#DC2626" },
  { emoji: "🌲", nameKo: "밴쿠버",      nameEn: "Vancouver",     flag: "🇨🇦", url: "/vancouver/",  status: "coming",  color: "#059669" },
  { emoji: "🏙️", nameKo: "시카고",     nameEn: "Chicago",       flag: "🇺🇸", url: "/chicago/",    status: "coming",  color: "#6B7280" },
];

/* 도시별 디자인 — 항공 코드 + 그라디언트 (프로페셔널 스타일) */
const CITY_DESIGN: Record<string, { code: string; gradient: string; textColor: string }> = {
  "Seattle":       { code: "SEA", gradient: "linear-gradient(135deg, #1E3A8A, #2563EB)", textColor: "#BAE6FD" },
  "Dallas":        { code: "DAL", gradient: "linear-gradient(135deg, #78350F, #D97706)", textColor: "#FEF3C7" },
  "San Francisco": { code: "SFO", gradient: "linear-gradient(135deg, #4C1D95, #7C3AED)", textColor: "#EDE9FE" },
  "New York":      { code: "NYC", gradient: "linear-gradient(135deg, #7F1D1D, #DC2626)", textColor: "#FEE2E2" },
  "Nashville":     { code: "BNA", gradient: "linear-gradient(135deg, #064E3B, #059669)", textColor: "#D1FAE5" },
  "Boston":        { code: "BOS", gradient: "linear-gradient(135deg, #1E3A8A, #1D4ED8)", textColor: "#DBEAFE" },
  "Los Angeles":   { code: "LAX", gradient: "linear-gradient(135deg, #7C2D12, #EA580C)", textColor: "#FFEDD5" },
  "Toronto":       { code: "TOR", gradient: "linear-gradient(135deg, #881337, #E11D48)", textColor: "#FFE4E6" },
  "Vancouver":     { code: "YVR", gradient: "linear-gradient(135deg, #14532D, #16A34A)", textColor: "#DCFCE7" },
  "Chicago":       { code: "CHI", gradient: "linear-gradient(135deg, #1E293B, #475569)", textColor: "#E2E8F0" },
};

function CityHubSection({ lang }: { lang: string }) {
  const currentCity = "Seattle";

  return (
    /* iOS 홈 화면처럼 — 배경은 홈과 동일하게, 아이콘만 컬러로 구별 */
    <div style={{ padding: "20px 0 16px" }}>

      {/* 헤더 */}
      <div style={{ padding: "0 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 15 }}>🌍</span>
            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A" }}>
              {lang === "ko" ? "다른 도시 HebronGuide" : "HebronGuide Cities"}
            </span>
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "#94A3B8", paddingLeft: 21 }}>
            {lang === "ko" ? "이사·출장·방문 도시를 미리 탐색하세요" : "Explore your next city before you move"}
          </div>
        </div>
        <a href="https://hebronguide.com" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 11, color: "#F2994A", fontWeight: 700, fontFamily: "Manrope,sans-serif", textDecoration: "none" }}>
          {lang === "ko" ? "전체 →" : "All →"}
        </a>
      </div>

      {/* 도시 카드 — 항공 코드 + 그라디언트 (프로페셔널) */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "4px 16px 8px", scrollbarWidth: "none" }}
        className="[&::-webkit-scrollbar]:hidden">
        {HEBRON_CITIES.map((city) => {
          const isCurrent = city.nameEn === currentCity;
          const isLive    = city.status === "live";
          const isSoon    = city.status === "soon";
          const isDim     = !isLive && !isSoon;
          const design    = CITY_DESIGN[city.nameEn] ?? { code: city.nameEn.slice(0,3).toUpperCase(), gradient: `linear-gradient(135deg, ${city.color}99, ${city.color})`, textColor: "#fff" };

          return (
            <a
              key={city.nameEn}
              href={isLive && !isCurrent ? `https://hebronguide.com${city.url}` : undefined}
              target={isLive && !isCurrent ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={isDim ? (e) => e.preventDefault() : undefined}
              style={{
                flexShrink: 0, width: 76,
                textDecoration: "none",
                opacity: isDim ? 0.3 : 1,
                cursor: isLive && !isCurrent ? "pointer" : "default",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => { if (isLive && !isCurrent) (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              {/* 도시 코드 카드 — 항공 출발보드 느낌 */}
              <div style={{
                width: 60, height: 60,
                borderRadius: 16,
                background: isDim ? "#E5E7EB" : design.gradient,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 1,
                boxShadow: isCurrent
                  ? `0 4px 16px ${city.color}44`
                  : isLive ? `0 2px 8px rgba(0,0,0,0.12)` : "none",
                outline: isCurrent ? `2px solid ${city.color}` : "none",
                outlineOffset: 2,
                position: "relative",
              }}>
                {/* 도시 코드 */}
                <div style={{
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 900,
                  fontSize: design.code.length > 3 ? 12 : 15,
                  letterSpacing: "1px",
                  color: isDim ? "#9CA3AF" : design.textColor,
                  lineHeight: 1,
                }}>
                  {design.code}
                </div>
                {/* 국기 (작게) */}
                <div style={{ fontSize: 10, lineHeight: 1, marginTop: 2, opacity: 0.85 }}>
                  {city.flag}
                </div>
                {/* 현재 도시 표시 */}
                {isCurrent && (
                  <div style={{
                    position: "absolute", bottom: -5, left: "50%",
                    transform: "translateX(-50%)",
                    width: 6, height: 6, borderRadius: "50%",
                    background: city.color,
                    boxShadow: `0 0 6px ${city.color}`,
                  }} />
                )}
              </div>

              {/* 도시 이름 — 풀네임 표시 */}
              <div style={{
                fontFamily: "Manrope,sans-serif", fontWeight: 600, fontSize: 9.5,
                color: "#374151", textAlign: "center", lineHeight: 1.25,
                maxWidth: 72, wordBreak: "break-word",
              }}>
                {lang === "ko" ? city.nameKo : city.nameEn}
              </div>

              {/* 상태 뱃지 */}
              {isLive && !isCurrent && (
                <div style={{ fontSize: 8, fontWeight: 700, color: "#059669",
                  background: "#DCFCE7", borderRadius: 20, padding: "1px 6px",
                  marginTop: -2 }}>
                  Live
                </div>
              )}
              {isSoon && (
                <div style={{ fontSize: 8, fontWeight: 600, color: "#D97706",
                  background: "#FEF3C7", borderRadius: 20, padding: "1px 6px",
                  marginTop: -2 }}>
                  Soon
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HOME: Korean American 여정 섹션
───────────────────────────────────────── */
function KoreanAmericanJourneySection({ onNavigate }: { onNavigate?: (tab: number, subTab?: number) => void }) {
  const { lang } = useI18n();
  const steps = lang === "ko"
    ? [
        { emoji: "🛬", label: "정착", sub: "Day 1~3개월", color: "#F2994A", tab: 1, subTab: 0 },
        { emoji: "🏘️", label: "적응", sub: "3개월~1년", color: "#10B981", tab: 1, subTab: 3 },
        { emoji: "🇺🇸", label: "Korean American", sub: "1년+", color: "#3B82F6", tab: 5, subTab: 6 },
      ]
    : [
        { emoji: "🛬", label: "Settle", sub: "Day 1–3 months", color: "#F2994A", tab: 1, subTab: 0 },
        { emoji: "🏘️", label: "Adapt", sub: "3–12 months", color: "#10B981", tab: 1, subTab: 3 },
        { emoji: "🇺🇸", label: "Korean American", sub: "Year 1+", color: "#3B82F6", tab: 5, subTab: 6 },
      ];

  return (
    <div style={{ padding: "20px 16px 8px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#1B2A4A", letterSpacing: "-0.2px" }}>
            {lang === "ko" ? "🇺🇸 Korean American 여정" : "🇺🇸 Your Korean American Journey"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
            {lang === "ko" ? "이민자에서 당당한 미국 사회의 구성원으로" : "From newcomer to full participant in American society"}
          </div>
        </div>
      </div>

      {/* 3단계 여정 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i === 2 ? "1.2" : "1", gap: 0 }}>
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
              <span style={{ fontSize: 22 }}>{step.emoji}</span>
              <div style={{
                fontFamily: "-apple-system, 'Noto Sans KR', sans-serif",
                fontWeight: 700, fontSize: 11, color: step.color, letterSpacing: "-0.2px", textAlign: "center",
              }}>{step.label}</div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 9, color: "#94A3B8", textAlign: "center" }}>
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
        background: "linear-gradient(135deg, rgba(59,130,246,0.07), rgba(16,185,129,0.06))",
        borderRadius: 12, border: "1px solid rgba(59,130,246,0.12)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <div style={{
          fontFamily: "Manrope,sans-serif", fontSize: 11, color: "#475569", lineHeight: 1.5, flex: 1,
        }}>
          {lang === "ko"
            ? "HebronGuide는 정착 가이드를 넘어 미국 사회의 Korean American으로 성장하는 전 여정을 함께합니다."
            : "HebronGuide walks with you from Day 1 through your full journey as a Korean American — not just settlement."}
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ onNavigate }: { onNavigate?: (tab: number, subTab?: number) => void }) {
  const { lang } = useI18n();
  return (
    <div style={{ background: "#F2F2F7", minHeight: "100vh", paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))" }}>
      <CompactHeroNew />
      <QuickMenuSection onNavigate={onNavigate} />
      <div style={{ margin: "0 16px", height: 0.5, background: "rgba(0,0,0,0.12)" }} />
      <SettlementEssentialsSection onNavigate={onNavigate} />
      <div style={{ margin: "0 16px", height: 0.5, background: "rgba(0,0,0,0.12)" }} />
      <KoreanAmericanJourneySection onNavigate={onNavigate} />
      <div style={{ margin: "0 16px", height: 0.5, background: "rgba(0,0,0,0.12)" }} />
      <CityHubSection lang={lang} />
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 2: 정착 SCREEN
───────────────────────────────────────── */
function SettleScreen({ onHome, initialSub = 0 }: { onHome?: () => void; initialSub?: number }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(initialSub);
  useEffect(() => { setSub(initialSub); }, [initialSub]);
  const tabs = lang === "ko"
    ? ["1주차", "1개월", "3개월", "행정", "재정", "거주지", "✅ 전체", "🛂 비자·이민"]
    : ["Week 1", "Month 1", "Month 3", "Admin", "Finance", "Areas", "✅ All", "🛂 Visa/Immigration"];

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
    { title: "SSN 신청", desc: "사회보장청(SSA) 오피스 | 915 2nd Ave #3605, Seattle | 전화: 800-772-1213" },
    { title: "WA 운전면허 (DOL)", desc: "Lynnwood DOL: 18023 Hwy 99 N | Everett DOL: 3601 Wetmore Ave" },
    { title: "ITIN 신청", desc: "세금 신고용 개인 번호 | IRS Form W-7 | 한인 CPA 통해 신청 권장" },
    { title: "영주권·비자 갱신", desc: "USCIS 공식 사이트: uscis.gov | Lynnwood 이민 변호사 다수 활동" },
    { title: "시민권 신청 (N-400)", desc: "영주권 5년 후 신청 가능 | 영어·시민권 시험 준비 클래스 교회에서 운영" },
  ];
  const adminEn = [
    { title: "SSN Application", desc: "Social Security Office | 915 2nd Ave #3605, Seattle | Phone: 800-772-1213" },
    { title: "WA Driver License (DOL)", desc: "Lynnwood DOL: 18023 Hwy 99 N | Everett DOL: 3601 Wetmore Ave" },
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

  // 거주지 데이터 (탭 index 5)
  const areasKo = [
    { emoji: "🏘️", title: "린우드 (Lynnwood) — 한인 1번지", desc: "한인타운 중심. H-Mart·한식당·교회 밀집. 링크 라이트레일 직결 (2024 개통). 렌트 1BR $1,800–2,100 | 스튜디오 $1,300–1,600. Northshore SD (Niche A) — 한인 가족 최다 거주" },
    { emoji: "💼", title: "벨뷰 (Bellevue) — 테크·최상위 학군", desc: "Bellevue SD — WA 1위 (Niche A+). Amazon·MS·Google 출퇴근 최적. 렌트 1BR $2,300–2,900 (프리미엄). 한인 전문직·가족 선호" },
    { emoji: "🌲", title: "보텔·우딘빌 (Bothell) — 학군+자연", desc: "Northshore SD Niche A. 한인 가족 급성장 지역. 자연환경·조용한 주거. 렌트 1BR $1,900–2,300" },
    { emoji: "💰", title: "페더럴웨이 (Federal Way) — 가성비", desc: "렌트 1BR $1,500–2,000 (저렴). 한인 마트·교회 다수. I-5 접근 편리. 넓은 한인 커뮤니티" },
    { emoji: "🎓", title: "대학지구 (U-District) — 유학생", desc: "UW 인근. 한식당·카페 집중. 링크 라이트레일 최고 접근. 렌트 1BR $1,600–2,400. UW·Seattle U·Seattle Central 재학생 최다" },
  ];
  const areasEn = [
    { emoji: "🏘️", title: "Lynnwood — Korean Hub #1", desc: "Heart of Koreatown. H-Mart, Korean restaurants & churches clustered. Link Light Rail direct (opened 2024). Rent 1BR $1,800–2,100 | Studio $1,300–1,600. Northshore SD (Niche A) — largest Korean family population" },
    { emoji: "💼", title: "Bellevue — Tech & Top Schools", desc: "Bellevue SD — WA #1 (Niche A+). Best commute for Amazon/MS/Google. Rent 1BR $2,300–2,900 (premium). Preferred by Korean professionals & families" },
    { emoji: "🌲", title: "Bothell — Schools + Nature", desc: "Northshore SD Niche A. Fast-growing Korean family area. Natural environment & quiet neighborhoods. Rent 1BR $1,900–2,300" },
    { emoji: "💰", title: "Federal Way — Affordable", desc: "Rent 1BR $1,500–2,000 (affordable). Many Korean grocery stores & churches. Good I-5 access. Large Korean community" },
    { emoji: "🎓", title: "U-District — Student Area", desc: "Near UW. Dense Korean restaurants & cafés. Best Link Light Rail access. Rent 1BR $1,600–2,400. Most UW & Seattle U students" },
  ];

  const serverKeys = ["settle_week1", "settle_month1", "settle_month3", "settle_admin", "settle_finance"];
  const serverData = sub < 5 ? serverContent[serverKeys[sub] as keyof typeof serverContent] : null;
  const items = serverData
    ? resolveStepItems(serverData, lang)
    : sub < 5
      ? (lang === "ko"
        ? [week1Ko, month1Ko, month3Ko, adminKo, financeKo][sub]
        : [week1En, month1En, month3En, adminEn, financeEn][sub])
      : [];

  const areaItems = lang === "ko" ? areasKo : areasEn;

  // 전체 체크리스트 데이터 (탭 index 6)
  const allPhases = lang === "ko"
    ? [
        { label: "🗓 1주차", prefix: "w1",  items: week1Ko  },
        { label: "📅 1개월", prefix: "m1",  items: month1Ko },
        { label: "🗒 3개월", prefix: "m3",  items: month3Ko },
        { label: "🏛 행정",  prefix: "adm", items: adminKo  },
        { label: "💰 재정",  prefix: "fin", items: financeKo },
      ]
    : [
        { label: "🗓 Week 1",  prefix: "w1",  items: week1En  },
        { label: "📅 Month 1", prefix: "m1",  items: month1En },
        { label: "🗒 Month 3", prefix: "m3",  items: month3En },
        { label: "🏛 Admin",   prefix: "adm", items: adminEn  },
        { label: "💰 Finance", prefix: "fin", items: financeEn },
      ];
  const totalItems = allPhases.reduce((s, p) => s + p.items.length, 0);

  // 프로그레스 계산
  const tabPrefix = ["w1", "m1", "m3", "adm", "fin", "area"][sub] ?? "w1";
  const doneCount = items.filter((_, i) => localStorage.getItem(`hg_checklist_${tabPrefix}_${i}`) === "1").length;
  const totalDone  = allPhases.reduce((s, p) =>
    s + p.items.filter((_, i) => localStorage.getItem(`hg_checklist_${p.prefix}_${i}`) === "1").length, 0);
  const [, forceUpdate] = useState(0);

  // 어드민 탭(index=3) 여부
  const isAdminTab = sub === 3;

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🛬" titleKo="정착 가이드" titleEn="Settlement Guide"
        descKo="정착부터 Korean American으로 — 단계별 완전 안내" descEn="From Day 1 to Korean American — your complete step-by-step guide"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5">
        {sub === 0 && (
          <Top5Banner items={TOP5_SETTLE} lang={lang} accentColor="#F2994A" />
        )}
        <div className="px-4 md:px-6 lg:px-8">

        {/* ── 비자·이민 탭 (index 7) ── */}
        {sub === 7 && (
          <div>
            {[
              { emoji: "🛂", name: lang === "ko" ? "비자 종류 한눈에 보기" : "Visa Types Overview",
                desc: lang === "ko"
                  ? "✅ 주요 비자 유형:\n• F-1 (학생비자) — 대학/어학원 재학 중. OPT·CPT 취업 가능\n• J-1 (교환방문) — 인턴십·연구원·교환학생. DS-2019 필요\n• H-1B (전문직) — 매년 4월 추첨. 스폰서 고용주 필요. 연봉 $60K+\n• O-1 (특기자) — 뛰어난 능력 증명 필요. 추첨 없음\n• L-1 (주재원) — 다국적기업 전근. A(관리직)/B(전문직)\n• E-2 (투자자) — 투자금 $100K+ 권장. 한미조약 혜택\n• EB-3/EB-5 (영주권) — 취업이민/투자이민. 우선순위 날짜 확인 필수"
                  : "✅ Key visa types:\n• F-1 (Student) — enrolled in university/language school. OPT/CPT work authorized\n• J-1 (Exchange Visitor) — intern, researcher, exchange student. DS-2019 required\n• H-1B (Specialty Occupation) — lottery every April. Employer sponsor required\n• O-1 (Extraordinary Ability) — no lottery. Must prove exceptional talent\n• L-1 (Intracompany) — transfer within multinational. A (managers) / B (specialists)\n• E-2 (Treaty Investor) — ~$100K+ investment. Korea-US treaty benefit\n• EB-3/EB-5 (Green Card) — employment/investor immigration. Check priority dates",
                tags: lang === "ko" ? ["비자유형", "F-1", "H-1B"] : ["Visa Types", "F-1", "H-1B"] },
              { emoji: "📋", name: lang === "ko" ? "I-94 체류 기간 확인 (필수!)" : "Check I-94 Stay Duration (Critical!)",
                desc: lang === "ko"
                  ? "✅ 반드시 해야 할 일:\n1. cbp.dhs.gov/i94 접속\n2. 여권 정보 입력 → 현재 I-94 조회\n3. '입국 허가 만료일' 확인 (비자 만료일과 다를 수 있음!)\n4. D/S = Duration of Status (학생·교환방문 비자는 I-20/DS-2019 기간)\n\n⚠️ 비자 스티커 날짜 ≠ 체류 허용 기간. I-94 날짜가 실제 체류 기한!"
                  : "✅ Must do:\n1. Go to cbp.dhs.gov/i94\n2. Enter passport info → view current I-94\n3. Check 'Admitted Until Date' (different from visa expiry date!)\n4. D/S = Duration of Status (F-1/J-1 holders: see your I-20/DS-2019)\n\n⚠️ Visa stamp date ≠ allowed stay period. I-94 date is your real deadline!",
                tags: lang === "ko" ? ["I-94", "체류기간", "필수확인"] : ["I-94", "Stay Duration", "Critical"] },
              { emoji: "📅", name: lang === "ko" ? "비자 연장·전환 절차" : "Visa Extension & Change of Status",
                desc: lang === "ko"
                  ? "⚠️ 만료 최소 6개월 전 준비 시작!\n\n연장 (Extension of Stay):\n• USCIS Form I-539 (비취업비자) 또는 I-129 (취업비자)\n• 처리 기간: 3-12개월 (프리미엄 프로세싱: $2,805, 15영업일)\n• 만료 전 신청 시 '합법 체류 유지' (Maintenance of Status)\n\n전환 (Change of Status):\n• F-1 → H-1B: OPT 중 스폰서 확보 → 4월 추첨 → 10월 시작\n• B-1/B-2 → F-1: I-539 신청. 학교 입학 허가서 필요\n\n📞 USCIS 콜센터: 1-800-375-5283 (한국어 통역 요청 가능)"
                  : "⚠️ Start preparing at least 6 months before expiry!\n\nExtension of Stay:\n• USCIS Form I-539 (non-employment) or I-129 (employment)\n• Processing: 3-12 months (Premium: $2,805, 15 business days)\n• Filing before expiry maintains lawful stay\n\nChange of Status:\n• F-1 → H-1B: secure sponsor during OPT → April lottery → Oct start\n• B-1/B-2 → F-1: file I-539. School acceptance letter required\n\n📞 USCIS: 1-800-375-5283 (Korean interpreter available)",
                tags: lang === "ko" ? ["비자연장", "I-539", "USCIS"] : ["Extension", "I-539", "USCIS"] },
              { emoji: "🏠", name: lang === "ko" ? "영주권 (그린카드) 경로" : "Green Card Pathways",
                desc: lang === "ko"
                  ? "✅ 주요 영주권 취득 경로:\n\n취업이민 (EB):\n• EB-1A: 특기자 (자기청원 가능)\n• EB-1C: 다국적기업 관리자 (L-1A 후 전환)\n• EB-2 NIW: 국익면제 (자기청원, 연구·의료 분야 유리)\n• EB-3: 전문직/숙련직 (스폰서 필요, 대기 길 수 있음)\n• EB-5: 투자이민 (미국 내 $800K~$1.05M 투자)\n\n가족이민:\n• IR-1/CR-1: 미국 시민권자 배우자\n• F-2A: 영주권자 배우자·미성년 자녀 (대기 있음)\n\n💡 현재 우선순위 날짜: travel.state.gov → Visa Bulletin 확인"
                  : "✅ Main green card pathways:\n\nEmployment-Based:\n• EB-1A: Extraordinary ability (self-petition possible)\n• EB-1C: Multinational manager (L-1A → EB-1C)\n• EB-2 NIW: National Interest Waiver (self-petition, great for researchers)\n• EB-3: Professionals/skilled workers (sponsor required, wait times vary)\n• EB-5: Investor ($800K–$1.05M investment in the US)\n\nFamily-Based:\n• IR-1/CR-1: Spouse of US citizen\n• F-2A: Spouse/minor children of LPR (wait time applies)\n\n💡 Check current priority dates: travel.state.gov → Visa Bulletin",
                tags: lang === "ko" ? ["영주권", "EB", "그린카드"] : ["Green Card", "EB", "NIW"] },
              { emoji: "⚖️", name: lang === "ko" ? "무료 이민 법률 지원 (시애틀)" : "Free Immigration Legal Help (Seattle)",
                desc: lang === "ko"
                  ? "✅ 시애틀 무료/저비용 이민 법률 기관:\n\n• NWIRP (북서부 이민권 프로젝트): 📞 800-445-5771 | nwirp.org — 영주권·추방방어·DACA 무료\n• OneAmerica: 425-251-0900 | weareoneamerica.org — 시민권 지원·이민자 권익 옹호\n• PAIR Project: pairproject.org — 망명 신청자 무료 법률\n• NW Justice Project: 206-464-1519 — 저소득 이민자 무료 법률 (민사 한정)\n• KCSC (한인생활상담소): 425-776-2400 — 한국어 이민 초기 상담\n\n⚠️ 비전문가나 노타리오 (notario)에게 이민 서류 맡기지 마세요!"
                  : "✅ Free/low-cost immigration legal resources in Seattle:\n\n• NWIRP: 📞 800-445-5771 | nwirp.org — green card, deportation defense, DACA\n• OneAmerica: 425-251-0900 | weareoneamerica.org — citizenship, immigrant rights\n• PAIR Project: pairproject.org — free legal help for asylum seekers\n• NW Justice Project: 206-464-1519 — free civil legal aid for low-income\n• KCSC: 425-776-2400 — Korean-language immigration consultation\n\n⚠️ Never use unlicensed notarios for immigration documents!",
                tags: lang === "ko" ? ["무료법률", "NWIRP", "이민상담"] : ["Free Legal", "NWIRP", "Immigration"] },
              { emoji: "🇰🇷", name: lang === "ko" ? "주시애틀 총영사관 서비스" : "Korean Consulate General Seattle",
                desc: lang === "ko"
                  ? "✅ 검증됨 | 📍 115 W Mercer St, Seattle | 📞 (206) 441-1011\n영업시간: 월-금 8:30am-4pm (예약 필수)\n\n주요 서비스:\n• 여권 발급·갱신 (온라인 예약 필수)\n• 공증·영사 확인 (서류 제출 시 한국어 공증)\n• 재외국민 등록 (도미 직후 필수!)\n• 국적·병역 상담\n• 비자 관련 한국 본국 서류 안내\n\n🔗 overseas.mofa.go.kr/us-seattle-ko\n💡 민원24(mw.go.kr)로 한국 서류 온라인 발급 후 영사 확인 절차 단축 가능"
                  : "✅ Verified | 📍 115 W Mercer St, Seattle | 📞 (206) 441-1011\nHours: Mon-Fri 8:30am-4pm (appointment required)\n\nKey services:\n• Passport issuance & renewal (online appointment required)\n• Notarization & consular certification\n• Overseas Korean registration (do this right after arrival!)\n• Nationality & military service consultation\n• Korean document guidance for visa applications\n\n🔗 overseas.mofa.go.kr/us-seattle-ko",
                tags: lang === "ko" ? ["총영사관", "여권", "공증"] : ["Consulate", "Passport", "Notary"] },
            ].map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "#818CF8", marginBottom: 4 }}>🛂 {lang === "ko" ? "핵심 체크포인트" : "Key Checkpoints"}</div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
                {lang === "ko"
                  ? "• 도착 즉시: cbp.dhs.gov/i94 에서 I-94 확인\n• 재외국민 등록: 영사관 방문 (무료, 도착 3개월 내)\n• 비자 만료 6개월 전: 이민 변호사 상담 시작\n• USCIS 사건 조회: egov.uscis.gov (영수증 번호로 조회)"
                  : "• On arrival: check I-94 at cbp.dhs.gov/i94\n• Register as overseas Korean: visit consulate (free, within 3 months)\n• 6 months before visa expiry: consult immigration attorney\n• Track USCIS case: egov.uscis.gov (use receipt number)"}
              </div>
            </div>
          </div>
        )}

        {/* ── 전체 체크리스트 탭 (index 6) ── */}
        {sub === 6 ? (
          <div onClick={() => forceUpdate(n => n + 1)}>
            {/* 종합 진행률 */}
            <div style={{ background: "linear-gradient(135deg,rgba(96,165,250,0.12),rgba(110,231,183,0.08))", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: "#ECFDF5" }}>
                  {lang === "ko" ? "🏁 전체 정착 현황" : "🏁 Overall Settlement Progress"}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 16, color: accent }}>
                  {totalDone} / {totalItems}
                </div>
              </div>
              <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${totalItems > 0 ? (totalDone / totalItems) * 100 : 0}%`, background: `linear-gradient(90deg,${accent},#6EE7B7)`, borderRadius: 6, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: "rgba(236,253,245,0.5)" }}>
                {totalDone === totalItems && totalItems > 0
                  ? (lang === "ko" ? "🎉 모든 정착 단계 완료! 축하합니다!" : "🎉 All settlement steps complete! Congratulations!")
                  : (lang === "ko" ? `${Math.round((totalDone / totalItems) * 100)}% 완료 — 계속 진행하세요 💪` : `${Math.round((totalDone / totalItems) * 100)}% done — keep going 💪`)}
              </div>
              <button onClick={(e) => { e.stopPropagation(); if (window.confirm(lang === "ko" ? "모든 체크리스트를 초기화할까요?" : "Reset all checklist items?")) { allPhases.forEach(p => p.items.forEach((_, i) => localStorage.removeItem(`hg_checklist_${p.prefix}_${i}`))); forceUpdate(n => n + 1); } }}
                style={{ marginTop: 10, border: "none", background: "rgba(248,113,113,0.15)", borderRadius: 20, padding: "5px 14px", color: "#F87171", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                🔄 {lang === "ko" ? "전체 초기화" : "Reset All"}
              </button>
            </div>

            {/* 페이즈별 체크리스트 */}
            {allPhases.map((phase) => {
              const pDone = phase.items.filter((_, i) => localStorage.getItem(`hg_checklist_${phase.prefix}_${i}`) === "1").length;
              return (
                <div key={phase.prefix} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, padding: "0 2px" }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: accent }}>{phase.label}</div>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: pDone === phase.items.length ? "#6EE7B7" : "rgba(236,253,245,0.4)", fontWeight: 600 }}>
                      {pDone}/{phase.items.length} {pDone === phase.items.length ? "✓" : ""}
                    </div>
                  </div>
                  {phase.items.map((item, i) => (
                    <ChecklistItem key={`${phase.prefix}-${i}`} itemId={`${phase.prefix}_${i}`} title={item.title} desc={item.desc} accentColor={accent} showReminder={false} />
                  ))}
                </div>
              );
            })}
          </div>

        ) : sub === 5 ? (
        /* 거주지 탭 */
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: accent, marginBottom: 4 }}>
                🏘️ {lang === "ko" ? "시애틀 주요 거주지 가이드" : "Seattle Area Guide for Korean Residents"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", lineHeight: 1.5 }}>
                {lang === "ko" ? "가족·학군·예산에 맞는 동네 찾기" : "Find the right neighborhood for your family, school, and budget"}
              </div>
            </div>
            {areaItems.map((area, i) => (
              <div key={i} style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.18)", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{area.emoji}</span>
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: "#ECFDF5" }}>{area.title}</div>
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.65)" }}>{area.desc}</div>
              </div>
            ))}
            <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 4 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 10 }}>💡 {lang === "ko" ? "렌트 찾기" : "Find Rentals"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <a href="https://open.kakao.com/o/search/%EC%8B%9C%EC%95%A0%ED%8B%80%ED%95%9C%EC%9D%B8" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                      {lang === "ko" ? "카카오오픈채팅 '시애틀한인'" : "KakaoTalk Open Chat '시애틀한인'"}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "룸메이트·렌탈 실시간 정보" : "Roommate & rental listings"}</div>
                  </div>
                  <span style={{ color: accent, fontSize: 14 }}>→</span>
                </a>
                <a href="https://www.wowseattle.com/" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <span style={{ fontSize: 16 }}>🏘️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>WowSeattle</div>
                    <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "한인 부동산·렌탈 정보" : "Korean real estate & rentals"}</div>
                  </div>
                  <span style={{ color: accent, fontSize: 14 }}>→</span>
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 프로그레스 바 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(236,253,245,0.5)" }}>
                  {lang === "ko" ? "완료" : "Progress"}
                </span>
                <span style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, fontWeight: 700, color: accent }}>
                  {doneCount} / {items.length}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%`,
                  background: `linear-gradient(90deg, ${accent}, rgba(110,231,183,0.6))`,
                  borderRadius: 4,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>

            {/* 체크리스트 아이템 */}
            <div onClick={() => forceUpdate(n => n + 1)}>
              {items.map((item, i) => (
                <ChecklistItem
                  key={`${sub}-${i}`}
                  itemId={`${tabPrefix}_${i}`}
                  title={item.title}
                  desc={item.desc}
                  accentColor={accent}
                  showReminder={isAdminTab}
                />
              ))}
            </div>

            {/* 팁 배너 */}
            <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 10 }}>💡 {lang === "ko" ? "한인 커뮤니티 연결" : "Korean Community"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <a href="https://open.kakao.com/o/search/%EC%8B%9C%EC%95%A0%ED%8B%80%ED%95%9C%EC%9D%B8" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                      {lang === "ko" ? "카카오오픈채팅 '시애틀한인'" : "KakaoTalk '시애틀한인'"}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "정착정보·중고거래·룸메이트" : "Settlement tips, used goods, roommates"}</div>
                  </div>
                  <span style={{ color: accent, fontSize: 14 }}>→</span>
                </a>
                <a href="https://cafe.naver.com/seattlekorean" target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <span style={{ fontSize: 16 }}>🟢</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                      {lang === "ko" ? "네이버 카페 '시애틀한인생활'" : "Naver Café '시애틀한인생활'"}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "정착 경험담·질문·정보 공유" : "Settlement experiences & Q&A"}</div>
                  </div>
                  <span style={{ color: accent, fontSize: 14 }}>→</span>
                </a>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 3: 교회 SCREEN
───────────────────────────────────────── */
function ChurchScreen({ onHome }: { onHome?: () => void }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(0);
  const tabs = lang === "ko"
    ? ["소개", "교회 목록", "프로그램", "새가족"]
    : ["About", "Churches", "Programs", "New Members"];
  const accent = "#C084FC";

  // 교회 목록 — 시애틀지구촌교회 (Global Mission Church) 검증 완료
  // 다른 교회는 검증 후 순차적으로 추가 예정
  const defaultChurches = lang === "ko" ? [
    {
      emoji: "⭐", tier: 1,
      name: "시애틀지구촌교회 (Global Mission Church)",
      nameEn: "Global Mission Church of Greater Seattle",
      desc: "✅ 검증됨 | SBC 소속 가정교회 사역 교회. 폴 김 목사.\n\n" +
        "📍 Lynnwood, WA\n" +
        "📞 새가족 문의 환영\n\n" +
        "🏠 가정교회 3축 운영:\n" +
        "  • 목장 (Mokjang) — 소그룹 공동체\n" +
        "  • 삶공부 (Life Studies) — 제자훈련\n" +
        "  • LIFE Worship — 주일 예배\n\n" +
        "✨ 이민자·유학생·새가족 환영\n" +
        "🔗 국제가정교회사역원(IHM) 인증",
      tags: ["가정교회", "SBC", "린우드"],
    },
  ] : [
    {
      emoji: "⭐", tier: 1,
      name: "Global Mission Church of Greater Seattle",
      nameEn: "시애틀지구촌교회",
      desc: "✅ Verified | SBC-affiliated House Church Ministry. Pastor Paul Kim.\n\n" +
        "📍 Lynnwood, WA\n" +
        "📞 New families welcome — contact us\n\n" +
        "🏠 Three pillars of House Church:\n" +
        "  • Mokjang — Small group community\n" +
        "  • Life Studies — Discipleship training\n" +
        "  • LIFE Worship — Sunday service\n\n" +
        "✨ Open to immigrants, international students & newcomers\n" +
        "🔗 IHM (Intl House Church Ministry) certified",
      tags: ["House Church", "SBC", "Lynnwood"],
    },
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
      <BackToHomeButton onHome={onHome} lang={lang} />
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
            {(churches as Array<{ emoji: string; name: string; nameEn?: string; desc: string; tags?: string[]; tier?: number }>).map((c, i) => (
              <div key={i} style={c.tier === 1 ? { border: "1px solid rgba(201,162,39,0.55)", borderRadius: 16, background: "rgba(201,162,39,0.06)" } : {}}>
                {c.tier === 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px 0 14px" }}>
                    <span style={{ background: "rgba(201,162,39,0.18)", border: "1px solid rgba(201,162,39,0.45)", color: GOLD, borderRadius: 8, padding: "2px 8px", fontSize: 10, fontFamily: "Manrope,sans-serif", fontWeight: 700 }}>가정교회 ⭐</span>
                  </div>
                )}
                <PlaceCard {...c} accentColor={c.tier === 1 ? GOLD : accent} />
              </div>
            ))}
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
function DiningScreen({ onHome }: { onHome?: () => void }) {
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
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🍽️" titleKo="카페 · 맛집" titleEn="Café & Dining"
        descKo="시애틀 한인 카페·맛집·상권 완전 가이드" descEn="Complete guide to Seattle's Korean cafés, restaurants & business district"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5">
        {sub === 1 && (
          <Top5Banner items={TOP5_RESTAURANTS} lang={lang} accentColor="#EF4444" />
        )}
        <div className="px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          <div style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 10 }}>
              🗺️ {lang === "ko" ? "지도에서 바로 찾기" : "Find on Map"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <a href="https://www.google.com/maps/search/Korean+restaurant+Lynnwood+WA"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                  background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 12px",
                  border: "1px solid rgba(251,146,60,0.2)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                <span style={{ fontSize: 16 }}>🗺️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                    Korean restaurant Lynnwood WA
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>Google Maps</div>
                </div>
                <span style={{ color: accent, fontSize: 14 }}>→</span>
              </a>
              <a href="https://www.google.com/maps/search/%ED%95%9C%EC%9D%B8+%EB%A7%9B%EC%A7%91+%EC%8B%9C%EC%95%A0%ED%8B%80"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                  background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 12px",
                  border: "1px solid rgba(251,146,60,0.2)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                <span style={{ fontSize: 16 }}>🗺️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                    {lang === "ko" ? "한인 맛집 시애틀" : "Korean food Seattle"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>Google Maps</div>
                </div>
                <span style={{ color: accent, fontSize: 14 }}>→</span>
              </a>
              <a href="https://www.yelp.com/search?find_desc=Korean+Restaurant&find_loc=Lynnwood%2C+WA"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                  background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 12px",
                  border: "1px solid rgba(251,146,60,0.2)", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                <span style={{ fontSize: 16 }}>⭐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                    Korean Restaurant · Lynnwood
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>Yelp {lang === "ko" ? "한국어 리뷰" : "Reviews"}</div>
                </div>
                <span style={{ color: accent, fontSize: 14 }}>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 5: 탐방 SCREEN
───────────────────────────────────────── */
function ExploreScreen({ onHome }: { onHome?: () => void }) {
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
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🗺️" titleKo="관광" titleEn="Tourism"
        descKo="지역안내 · 자연 · 문화 · 스포츠" descEn="Areas · Nature · Culture · Sports"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5">
        {sub === 0 && (
          <Top5Banner items={TOP5_EXPLORE} lang={lang} accentColor="#0EA5E9" />
        )}
        <div className="px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 6: 도움 SCREEN
───────────────────────────────────────── */
function HelpScreen({ onHome, initialSub = 0 }: { onHome?: () => void; initialSub?: number }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(initialSub);
  useEffect(() => { setSub(initialSub); }, [initialSub]);
  const tabs = lang === "ko"
    ? ["긴급연락", "의료·병원", "커뮤니티", "유용한 링크", "📋 무료자원", "⚖️ 법률", "🇺🇸 Korean American"]
    : ["Emergency", "Medical", "Community", "Useful Links", "📋 Free Resources", "⚖️ Legal", "🇺🇸 Korean American"];
  const accent = "#F87171";

  const medicalItems = lang === "ko" ? [
    { emoji: "🏥", name: "닥터 김 클리닉 (한인 가정의학과)", nameEn: "Korean Family Medicine — Lynnwood", desc: "한국어 진료 가능. 📍 Lynnwood | 📞 (425) 744-9200", tags: ["가정의학", "한국어", "린우드"] },
    { emoji: "🏥", name: "스웨디시 메디컬 센터", nameEn: "Swedish Medical Center — Capitol Hill", desc: "📍 747 Broadway, Seattle | 📞 (206) 386-6000 | 한국어 통역 서비스 ✅ | 응급실 포함 전문 진료", tags: ["종합병원", "시애틀", "통역"] },
    { emoji: "🏥", name: "UW 메디컬 센터", nameEn: "UW Medical Center", desc: "📍 1959 NE Pacific St, Seattle | 📞 (206) 598-3300 | 한국어 통역 ✅ | 워싱턴주 최대 학술병원", tags: ["대학병원", "시애틀", "통역"] },
    { emoji: "🦷", name: "켄트 임플란트 치과", nameEn: "Kent Implant Dental", desc: "한인 치과. 📍 306 Washington Ave S, Kent | 📞 (253) 981-3816 ✅ | 임플란트 전문", tags: ["치과", "켄트", "임플란트"] },
    { emoji: "🦷", name: "린우드 한인 치과 (다수)", nameEn: "Lynnwood Korean Dentists", desc: "린우드 지역 한인 치과 다수 운영. kSeattle·WowSeattle 업소록 참조 | 🔗 kseattle.com", tags: ["치과", "린우드", "한국어"] },
    { emoji: "🧠", name: "ACRS 정신건강 (한국어 상담사)", nameEn: "Asian Counseling & Referral Service", desc: "📍 3639 MLK Jr Way S, Seattle | 📞 (206) 695-7600 | 한국어 상담사 상주 ✅ | 슬라이딩 스케일 요금", tags: ["정신건강", "한국어", "상담"] },
    { emoji: "🆘", name: "위기 상담 핫라인 (24시간)", nameEn: "Crisis Line 24/7", desc: "📞 866-427-4747 (24시간) | 한국어 통역 가능 | 정신건강·자살 예방 전문", tags: ["위기상담", "24시간", "무료"] },
    { emoji: "🚨", name: "응급실 — Swedish First Hill", nameEn: "Emergency Room — Swedish First Hill", desc: "📍 747 Broadway, Seattle | 📞 (206) 386-6000 | 시애틀 중심부 응급실. 한국어 통역 요청 가능", tags: ["응급실", "응급", "시애틀"] },
    { emoji: "📞", name: "한국어 통역 서비스 (의료)", nameEn: "Korean Medical Interpreter", desc: "언어 라인 (Language Line): 📞 1-800-752-6096 | 병원·클리닉 방문 전 통역 예약 가능", tags: ["통역", "의료", "무료"] },
    { emoji: "🏛️", name: "킹카운티 공중보건소 ✅ 검증됨", nameEn: "King County Public Health", desc: "무료·저비용 의료, WIC 영양 프로그램, 예방접종. 📞 206-296-4600 | 🔗 kingcounty.gov/health", tags: ["공공의료", "무료", "WIC"] },
    { emoji: "🏥", name: "시애틀 무료 클리닉 ✅ 검증됨", nameEn: "Free Clinic of Greater Seattle", desc: "의료보험 없는 분을 위한 무료 의료 서비스. 📞 206-520-5000 | 🔗 freeclinic.net", tags: ["무료", "무보험", "의료"] },
    { emoji: "🏥", name: "헬스포인트 (슬라이딩 스케일) ✅ 검증됨", nameEn: "HealthPoint Community Health Center", desc: "소득 기반 할인 진료. 한국어 통역 가능. 📞 1-800-440-1561 | 🔗 healthpointchc.org", tags: ["슬라이딩스케일", "한국어", "저비용"] },
    { emoji: "🧠", name: "크라이시스 커넥션 (정신건강 24시간) ✅ 검증됨", nameEn: "Crisis Connections 24/7", desc: "정신건강 위기 24시간 무료. 한국어 통역 가능. 📞 866-427-4747 | 🔗 crisisconnections.org", tags: ["정신건강", "24시간", "무료"] },
    { emoji: "🧠", name: "NAMI 워싱턴 (정신건강 지원) ✅ 검증됨", nameEn: "NAMI Washington", desc: "정신건강 정보·지원·교육. 📞 800-782-9264 | 🔗 namiwa.org", tags: ["정신건강", "지원", "무료"] },
  ] : [
    { emoji: "🏥", name: "Korean Family Medicine Clinic", nameEn: "닥터 김 클리닉 — Lynnwood", desc: "Korean-speaking physician. 📍 Lynnwood | 📞 (425) 744-9200", tags: ["Family Med", "Korean", "Lynnwood"] },
    { emoji: "🏥", name: "Swedish Medical Center", nameEn: "스웨디시 메디컬 센터", desc: "📍 747 Broadway, Seattle | 📞 (206) 386-6000 | Korean interpreter ✅ | Full service incl. ER", tags: ["Hospital", "Seattle", "Interpreter"] },
    { emoji: "🏥", name: "UW Medical Center", nameEn: "UW 메디컬 센터", desc: "📍 1959 NE Pacific St, Seattle | 📞 (206) 598-3300 | Korean interpreter ✅ | WA's largest academic medical center", tags: ["Hospital", "Seattle", "Interpreter"] },
    { emoji: "🦷", name: "Kent Implant Dental", nameEn: "켄트 임플란트 치과", desc: "Korean dental clinic. 📍 306 Washington Ave S, Kent | 📞 (253) 981-3816 ✅ | Implant specialist", tags: ["Dental", "Kent", "Implant"] },
    { emoji: "🦷", name: "Lynnwood Korean Dentists", nameEn: "린우드 한인 치과", desc: "Multiple Korean dental clinics in Lynnwood. See kSeattle & WowSeattle directory | 🔗 kseattle.com", tags: ["Dental", "Lynnwood", "Korean"] },
    { emoji: "🧠", name: "ACRS Mental Health (Korean counselors)", nameEn: "Asian Counseling & Referral Service", desc: "📍 3639 MLK Jr Way S, Seattle | 📞 (206) 695-7600 | Korean-speaking counselors ✅ | Sliding scale fees", tags: ["Mental Health", "Korean", "Counseling"] },
    { emoji: "🆘", name: "Crisis Line 24/7", nameEn: "위기 상담 핫라인", desc: "📞 866-427-4747 (24/7) | Korean interpreter available | Mental health & suicide prevention", tags: ["Crisis", "24/7", "Free"] },
    { emoji: "🚨", name: "Emergency Room — Swedish First Hill", nameEn: "응급실 — Swedish First Hill", desc: "📍 747 Broadway, Seattle | 📞 (206) 386-6000 | Central Seattle ER. Korean interpreter on request", tags: ["ER", "Emergency", "Seattle"] },
    { emoji: "📞", name: "Korean Medical Interpreter Line", nameEn: "한국어 의료 통역", desc: "Language Line: 📞 1-800-752-6096 | Pre-book interpreter for clinic & hospital visits", tags: ["Interpreter", "Medical", "Free"] },
    { emoji: "🏛️", name: "King County Public Health ✅ Verified", nameEn: "킹카운티 공중보건소", desc: "Free/low-cost healthcare, WIC nutrition, immunizations. 📞 206-296-4600 | 🔗 kingcounty.gov/health", tags: ["Public Health", "Free", "WIC"] },
    { emoji: "🏥", name: "Free Clinic of Greater Seattle ✅ Verified", nameEn: "시애틀 무료 클리닉", desc: "Free medical care for uninsured residents. 📞 206-520-5000 | 🔗 freeclinic.net", tags: ["Free", "Uninsured", "Medical"] },
    { emoji: "🏥", name: "HealthPoint Community Health Center ✅ Verified", nameEn: "헬스포인트", desc: "Sliding scale fees based on income. Korean interpreter available. 📞 1-800-440-1561 | 🔗 healthpointchc.org", tags: ["Sliding Scale", "Korean", "Low-cost"] },
    { emoji: "🧠", name: "Crisis Connections 24/7 ✅ Verified", nameEn: "크라이시스 커넥션", desc: "Mental health crisis line 24/7. Korean interpreter available. 📞 866-427-4747 | 🔗 crisisconnections.org", tags: ["Mental Health", "24/7", "Free"] },
    { emoji: "🧠", name: "NAMI Washington ✅ Verified", nameEn: "NAMI 워싱턴", desc: "Mental health information, support & education. 📞 800-782-9264 | 🔗 namiwa.org", tags: ["Mental Health", "Support", "Free"] },
  ];

  const defaultCommunityLinks = [
    { emoji: "💬", name: lang === "ko" ? "카카오오픈채팅 — 시애틀한인" : "KakaoTalk — 시애틀한인", nameEn: "Kakao Open Chat", desc: lang === "ko" ? "시애틀 한인 최대 커뮤니티 채팅방. 정착 질문, 중고거래, 모임 공지" : "Largest Korean Seattle community chat. Settlement Q&A, used goods, event announcements", tags: ["카카오", "실시간", "커뮤니티"] },
    { emoji: "🏛️", name: lang === "ko" ? "시애틀 한인회" : "Korean Association of Seattle", nameEn: "Korean Association", desc: lang === "ko" ? "공식 한인 단체. 각종 행사·지원 사업 운영. 전화: (206) 323-5050" : "Official Korean community organization. Events & support programs. Tel: (206) 323-5050", tags: ["공식", "한인회", "이벤트"] },
    { emoji: "🏴", name: lang === "ko" ? "주 시애틀 대한민국 총영사관" : "Korean Consulate General Seattle", nameEn: "Korean Consulate", desc: lang === "ko" ? "여권·공증·사증. 📍 115 W Mercer St, Seattle | 📞 (206) 441-1011 | 🔗 overseas.mofa.go.kr/us-seattle-ko" : "Passport, notary & visa services. 📍 115 W Mercer St, Seattle | 📞 (206) 441-1011 | 🔗 overseas.mofa.go.kr/us-seattle-ko", tags: ["영사관", "여권", "공증"] },
    { emoji: "📰", name: lang === "ko" ? "미주 한국일보 시애틀판" : "Korea Times Seattle", nameEn: "Korean Newspaper", desc: lang === "ko" ? "시애틀 한인 지역 소식·구인광고·부동산·커뮤니티 정보" : "Seattle Korean community news, job listings, real estate & community information", tags: ["신문", "뉴스", "정보"] },
    { emoji: "👩‍💻", name: lang === "ko" ? "네이버 카페 — 시애틀한인생활" : "Naver Café — Seattle Korean Life", nameEn: "Naver Café", desc: lang === "ko" ? "정착 경험담·질문·정보 공유. 검색: 네이버 '시애틀한인생활'" : "Settlement experiences, Q&A & info sharing. Search: Naver '시애틀한인생활'", tags: ["네이버", "정보", "경험담"] },
    { emoji: "📞", name: lang === "ko" ? "킹카운티 2-1-1 ✅ 검증됨" : "King County 2-1-1 ✅ Verified", nameEn: "2-1-1 Free Services Hotline", desc: lang === "ko" ? "전화 211 — 식품·주거·법률·의료 무료 서비스 연결. 한국어 통역 가능. 지금 바로 전화하세요!" : "Dial 211 — connects to ALL free services (food, housing, legal, medical). Korean interpreter available.", tags: ["211", "무료연결", "한국어"] },
    { emoji: "🏛️", name: lang === "ko" ? "킹카운티 주거청 ✅ 검증됨" : "King County Housing Authority ✅ Verified", nameEn: "KCHA Affordable Housing", desc: lang === "ko" ? "저렴한 주거 대기자 명단. 📞 206-574-1100 | 🔗 kcha.org" : "Affordable housing waiting list. 📞 206-574-1100 | 🔗 kcha.org", tags: ["주거", "저렴", "공공"] },
  ];

  const defaultUsefulLinks = [
    { emoji: "🏥", name: lang === "ko" ? "WA Apple Health (무료 의료보험)" : "WA Apple Health (Free Health Insurance)", nameEn: "Washington Medicaid", desc: lang === "ko" ? "저소득층 무료 건강보험. 신청: wahealthplanfinder.org | 전화: 1-855-923-4633" : "Free health insurance for low-income. Apply: wahealthplanfinder.org | Tel: 1-855-923-4633", tags: ["보험", "무료", "의료"] },
    { emoji: "🚌", name: lang === "ko" ? "ORCA 카드 (대중교통 통합 카드)" : "ORCA Card (Transit Card)", nameEn: "Public Transit Pass", desc: lang === "ko" ? "버스·링크 라이트레일·페리 통합 카드. orca.com 또는 H-Mart에서 구매" : "Integrated card for bus, Link light rail & ferry. Get at orca.com or H-Mart customer service", tags: ["대중교통", "버스", "링크"] },
    { emoji: "💼", name: lang === "ko" ? "WorkSource WA (무료 취업 지원)" : "WorkSource WA (Free Job Center)", nameEn: "Free Job Assistance", desc: lang === "ko" ? "이력서·면접 코칭·취업 연결. 무료. 시애틀·린우드·에베레트 센터 운영" : "Resume, interview coaching & job placement. Free. Seattle, Lynnwood & Everett centers", tags: ["취업", "무료", "이력서"] },
    { emoji: "🏫", name: lang === "ko" ? "시애틀 공립학교 등록 (SPS)" : "Seattle Public Schools Enrollment", nameEn: "SPS Enrollment", desc: lang === "ko" ? "공립학교 등록 안내. seattleschools.org | 한국어 지원 통역 서비스 있음" : "Public school enrollment guide. seattleschools.org | Korean language interpreter available", tags: ["학교", "공립", "한국어"] },
    { emoji: "🔒", name: lang === "ko" ? "법률 지원 (무료 법률 클리닉)" : "Free Legal Clinic", nameEn: "Free Legal Help", desc: lang === "ko" ? "이민·고용·집주인 분쟁. KCBA 법률 봉사. 한국어 지원 변호사 연결 가능" : "Immigration, employment & landlord disputes. KCBA legal aid. Korean-speaking attorney referrals", tags: ["법률", "무료", "이민"] },
    { emoji: "🚌", name: lang === "ko" ? "킹카운티 메트로 버스 ✅ 검증됨" : "King County Metro Bus ✅ Verified", nameEn: "King County Metro", desc: lang === "ko" ? "시애틀 버스 시스템. 📞 206-553-3000 | 🔗 kingcounty.gov/metro" : "Seattle's bus system. 📞 206-553-3000 | 🔗 kingcounty.gov/metro", tags: ["버스", "대중교통", "시애틀"] },
    { emoji: "💳", name: lang === "ko" ? "ORCA 카드 (대중교통 통합) ✅ 검증됨" : "ORCA Card (Integrated Transit) ✅ Verified", nameEn: "ORCA Transit Card", desc: lang === "ko" ? "버스·링크·페리·소더 통합 교통카드. 🔗 orca.com | H-Mart 고객서비스에서도 구매 가능" : "Integrated card for bus, Link, ferry & Sounder. 🔗 orca.com | Also available at H-Mart customer service", tags: ["ORCA", "교통카드", "링크"] },
  ];

  const communityLinks = serverContent["community"] ? resolvePlaceItems(serverContent["community"], lang) : defaultCommunityLinks;
  const usefulLinks = serverContent["links"] ? resolvePlaceItems(serverContent["links"], lang) : defaultUsefulLinks;

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
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
            {/* 생명 긴급 */}
            <EmergencyRow emoji="🚨" title={lang === "ko" ? "경찰·소방·구급 (생명 긴급)" : "Police · Fire · Ambulance"} number="911" desc={lang === "ko" ? "생명·화재·범죄 — 즉시 전화. 한국어 통역 요청 가능" : "Life-threatening, fire, crime. Korean interpreter available"} />
            <EmergencyRow emoji="🏥" title={lang === "ko" ? "응급실 — Swedish First Hill" : "ER — Swedish First Hill"} number="206-386-6000" desc={lang === "ko" ? "📍 747 Broadway, Seattle | 24시간 응급실 | 한국어 통역 가능" : "📍 747 Broadway, Seattle | 24hr ER | Korean interpreter available"} />
            <EmergencyRow emoji="☁️" title={lang === "ko" ? "독·약물 중독 (독 조절)" : "Poison Control"} number="800-222-1222" desc={lang === "ko" ? "약물·화학물질 중독 24시간 — 즉시 전화" : "Drug & chemical poisoning — call immediately"} />
            <EmergencyRow emoji="☎️" title={lang === "ko" ? "정신건강 위기 (988)" : "Mental Health Crisis (988)"} number="988" desc={lang === "ko" ? "자살 예방·정신건강 위기 24시간. 한국어 통역 가능" : "Suicide prevention & mental health crisis 24/7. Korean interpreter"} />
            {/* 한인 긴급 */}
            <EmergencyRow emoji="🇰🇷" title={lang === "ko" ? "한국 총영사관 긴급" : "Korean Consulate Emergency"} number="206-947-8293" desc={lang === "ko" ? "여권 분실·억류·사고·사망 — 24시간 긴급 직통" : "Lost passport, detention, accident, death — 24hr direct line"} />
            <EmergencyRow emoji="🗣️" title={lang === "ko" ? "한국어 통역 (Language Line)" : "Korean Interpreter (Language Line)"} number="800-752-6096" desc={lang === "ko" ? "병원·경찰서·법원에서 한국어 통역 연결 — 24시간" : "Korean interpreter for hospital, police, court — 24hrs"} />
            {/* 생활 긴급 */}
            <EmergencyRow emoji="🚓" title={lang === "ko" ? "경찰 비긴급 신고" : "Police Non-Emergency"} number="206-625-5011" desc={lang === "ko" ? "긴급하지 않은 사건 신고 (도난·분실·소음 등)" : "Non-urgent incidents (theft, lost property, noise etc.)"} />
            <EmergencyRow emoji="🔥" title={lang === "ko" ? "가스 누출 — Puget Sound Energy" : "Gas Leak — Puget Sound Energy"} number="888-225-5773" desc={lang === "ko" ? "가스 냄새 즉시 신고. 건물 즉시 대피 후 전화" : "Smell gas? Evacuate immediately then call"} />
            <EmergencyRow emoji="👩‍👧" title={lang === "ko" ? "가정폭력 핫라인" : "Domestic Violence Hotline"} number="800-799-7233" desc={lang === "ko" ? "가정폭력·학대 24시간 무료 — 한국어 통역 가능" : "Domestic violence & abuse 24/7 free — Korean interpreter"} />
            <EmergencyRow emoji="🚗" title={lang === "ko" ? "도로 긴급 — AAA" : "Roadside Emergency — AAA"} number="800-222-4357" desc={lang === "ko" ? "차량 고장·견인·잠금. AAA 회원 $60/년 권장" : "Breakdown, towing, lockout. AAA membership $60/yr recommended"} />
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
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: accent, marginBottom: 4 }}>
              🏥 {lang === "ko" ? "한인 의료·병원 안내" : "Korean Medical & Hospital Guide"}
            </div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", lineHeight: 1.5 }}>
              {lang === "ko" ? "한국어 가능 의료기관 · 정신건강 · 응급 연락" : "Korean-speaking clinics · Mental health · Emergency contacts"}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medicalItems.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>⚠️ {lang === "ko" ? "의료 정보 안내" : "Medical Info Note"}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko"
                ? "전화번호·주소는 변경될 수 있습니다. 방문 전 반드시 공식 웹사이트 또는 전화로 확인하세요. 응급 상황 → 911"
                : "Phone numbers & addresses may change. Always verify via official website or phone before visiting. Emergency → 911"}
            </div>
          </div>
        </div>
      )}

      {sub === 2 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {communityLinks.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          {/* 211 팁 박스 */}
          <a href="tel:211" style={{ display: "block", marginTop: 16, textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.15), rgba(251,146,60,0.1))", border: "1px solid rgba(248,113,113,0.35)", borderRadius: 14, padding: "14px 16px", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg,rgba(248,113,113,0.22),rgba(251,146,60,0.16))")}
              onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg,rgba(248,113,113,0.15),rgba(251,146,60,0.1))")}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: accent, marginBottom: 4 }}>
                📞 {lang === "ko" ? "211 서비스 — 무료 생활 서비스 연결" : "211 Service — Free Resource Connection"}
              </div>
              <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, lineHeight: 1.7, color: "rgba(236,253,245,0.75)" }}>
                {lang === "ko"
                  ? "생활·의료·주거·법률 무료 서비스를 한 번에 연결해드립니다. 한국어 통역 가능. 지금 바로 전화하세요 → 211"
                  : "Connects to ALL free services — food, medical, housing, legal. Korean interpreter available. Call 211 now."}
              </div>
              <div style={{ marginTop: 8, fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: accent }}>
                📱 {lang === "ko" ? "탭하면 전화 연결 →" : "Tap to call →"} <span style={{ fontSize: 16 }}>211</span>
              </div>
            </div>
          </a>
        </div>
      )}

      {sub === 3 && (
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

      {sub === 4 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 700, fontSize: 13, color: accent, marginBottom: 4 }}>
              📋 {lang === "ko" ? "한인 이민자가 모르는 미국 무료 자원" : "Free American Resources Korean Immigrants Often Don't Know"}
            </div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)", lineHeight: 1.5 }}>
              {lang === "ko" ? "미국 주류 사회의 검증된 무료·저비용 서비스 모음. 한국어 통역 가능한 곳 우선 표시" : "Verified free & low-cost mainstream American services. Korean interpreter availability noted"}
            </div>
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, marginTop: 4, letterSpacing: "0.05em" }}>
            🍎 {lang === "ko" ? "식품 지원" : "FOOD ASSISTANCE"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="🌾" name={lang === "ko" ? "노스웨스트 하비스트 ✅ 검증됨" : "Northwest Harvest ✅ Verified"} nameEn={lang === "ko" ? "무료 푸드뱅크 네트워크" : "Free Food Bank Network"} desc={lang === "ko" ? "워싱턴주 전역 무료 푸드뱅크 네트워크. 📞 1-800-722-6924 | 🔗 northwestharvest.org" : "Free food bank network across Washington State. 📞 1-800-722-6924 | 🔗 northwestharvest.org"} tags={lang === "ko" ? ["푸드뱅크", "무료", "식품"] : ["Food Bank", "Free", "Food"]} accentColor={accent} />
            <PlaceCard emoji="🥫" name={lang === "ko" ? "푸드 라이프라인 ✅ 검증됨" : "Food Lifeline ✅ Verified"} nameEn={lang === "ko" ? "긴급 식품 지원" : "Emergency Food Assistance"} desc={lang === "ko" ? "긴급 식품 지원 서비스. 📞 206-545-6600 | 🔗 foodlifeline.org" : "Emergency food assistance for families in need. 📞 206-545-6600 | 🔗 foodlifeline.org"} tags={lang === "ko" ? ["긴급식품", "무료", "가족"] : ["Emergency", "Free", "Family"]} accentColor={accent} />
            <PlaceCard emoji="📞" name={lang === "ko" ? "킹카운티 2-1-1 ✅ 검증됨" : "King County 2-1-1 ✅ Verified"} nameEn={lang === "ko" ? "무료 서비스 연결 핫라인" : "Free Services Hotline"} desc={lang === "ko" ? "전화 211 — 식품·의료·주거·법률 무료 서비스 즉시 연결. 한국어 통역 가능" : "Dial 211 — connects to all free services (food, medical, housing, legal). Korean interpreter available"} tags={lang === "ko" ? ["211", "무료연결", "한국어"] : ["211", "Free", "Korean"]} accentColor={accent} />
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, letterSpacing: "0.05em" }}>
            ⚖️ {lang === "ko" ? "법률 지원" : "LEGAL AID"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="⚖️" name={lang === "ko" ? "노스웨스트 저스티스 프로젝트 ✅ 검증됨" : "Northwest Justice Project ✅ Verified"} nameEn={lang === "ko" ? "무료 법률 지원" : "Free Legal Help"} desc={lang === "ko" ? "이민·고용·주거 무료 법률 지원. 📞 1-888-201-1014 | 🔗 nwjustice.org" : "Free immigration, employment & housing legal help. 📞 1-888-201-1014 | 🔗 nwjustice.org"} tags={lang === "ko" ? ["이민법률", "무료", "주거"] : ["Immigration", "Free", "Housing"]} accentColor={accent} />
            <PlaceCard emoji="🏛️" name={lang === "ko" ? "KCBA 프로보노 ✅ 검증됨" : "KCBA Pro Bono ✅ Verified"} nameEn={lang === "ko" ? "무료 법률 상담" : "Free Legal Consultations"} desc={lang === "ko" ? "킹카운티 변호사협회 무료 법률 상담. 📞 206-267-7100" : "King County Bar Association free legal consultations. 📞 206-267-7100"} tags={lang === "ko" ? ["변호사", "무료", "상담"] : ["Attorney", "Free", "Consult"]} accentColor={accent} />
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, letterSpacing: "0.05em" }}>
            💰 {lang === "ko" ? "세금·재정 지원" : "TAX & FINANCIAL ASSISTANCE"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="🧾" name={lang === "ko" ? "VITA 무료 세금 신고 ✅ 검증됨" : "VITA Free Tax Filing ✅ Verified"} nameEn={lang === "ko" ? "자원봉사 세금 지원 프로그램" : "Volunteer Income Tax Assistance"} desc={lang === "ko" ? "1월~4월 무료 세금 신고 서비스. 한인 이민자 대부분 모름! 🔗 vitataxhelp.org" : "Free tax filing Jan–April. Most Korean immigrants don't know about this! 🔗 vitataxhelp.org"} tags={lang === "ko" ? ["무료세금", "1~4월", "중요"] : ["Free Tax", "Jan-Apr", "Important"]} accentColor={accent} />
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, letterSpacing: "0.05em" }}>
            🏠 {lang === "ko" ? "주거 지원" : "HOUSING ASSISTANCE"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="🏠" name={lang === "ko" ? "킹카운티 주거청 ✅ 검증됨" : "King County Housing Authority ✅ Verified"} nameEn={lang === "ko" ? "저렴한 공공주거" : "Affordable Public Housing"} desc={lang === "ko" ? "저렴한 주거 대기자 명단 신청. 📞 206-574-1100 | 🔗 kcha.org" : "Affordable housing waiting list applications. 📞 206-574-1100 | 🔗 kcha.org"} tags={lang === "ko" ? ["공공주거", "대기자", "저렴"] : ["Public Housing", "Waitlist", "Affordable"]} accentColor={accent} />
          </div>

          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "rgba(236,253,245,0.45)", marginBottom: 8, letterSpacing: "0.05em" }}>
            🚌 {lang === "ko" ? "대중교통" : "TRANSPORTATION"}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
            <PlaceCard emoji="🚌" name={lang === "ko" ? "킹카운티 메트로 ✅ 검증됨" : "King County Metro ✅ Verified"} nameEn={lang === "ko" ? "시애틀 버스 시스템" : "Seattle Bus System"} desc={lang === "ko" ? "시애틀 광역 버스 시스템. 📞 206-553-3000 | 🔗 kingcounty.gov/metro" : "Seattle regional bus system. 📞 206-553-3000 | 🔗 kingcounty.gov/metro"} tags={lang === "ko" ? ["버스", "대중교통", "시애틀"] : ["Bus", "Transit", "Seattle"]} accentColor={accent} />
            <PlaceCard emoji="💳" name={lang === "ko" ? "ORCA 카드 ✅ 검증됨" : "ORCA Card ✅ Verified"} nameEn={lang === "ko" ? "대중교통 통합 카드" : "Integrated Transit Card"} desc={lang === "ko" ? "버스·링크 라이트레일·페리 통합. orca.com 또는 H-Mart 구매 가능 | 🔗 orca.com" : "Integrated bus, Link light rail & ferry card. Buy at orca.com or H-Mart | 🔗 orca.com"} tags={lang === "ko" ? ["ORCA", "링크", "페리"] : ["ORCA", "Link", "Ferry"]} accentColor={accent} />
          </div>

          <a href="tel:211" style={{ display: "block", marginTop: 8, textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.15), rgba(251,146,60,0.1))", border: "2px solid rgba(248,113,113,0.4)", borderRadius: 14, padding: "16px 18px", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg,rgba(248,113,113,0.22),rgba(251,146,60,0.16))")}
              onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg,rgba(248,113,113,0.15),rgba(251,146,60,0.1))")}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14, color: accent, marginBottom: 6 }}>
                📞 {lang === "ko" ? "211 — 모든 무료 서비스를 한 번에" : "211 — Connect to All Free Services"}
              </div>
              <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, lineHeight: 1.7, color: "rgba(236,253,245,0.8)" }}>
                {lang === "ko"
                  ? "생활·의료·주거·법률 무료 연결 서비스. 한국어 통역 가능. 지금 바로 전화하세요"
                  : "Connects to free food, medical, housing & legal services. Korean interpreter available. Call now."}
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ background: accent, borderRadius: 8, padding: "5px 14px", fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#0d1117" }}>
                  {lang === "ko" ? "📱 211 전화하기" : "📱 Call 211"}
                </div>
                <span style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, color: "rgba(236,253,245,0.5)" }}>
                  {lang === "ko" ? "✅ 검증됨 · 한국어 통역 가능" : "✅ Verified · Korean interpreter available"}
                </span>
              </div>
            </div>
          </a>

          <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.18)", borderRadius: 14, padding: "14px 16px", marginTop: 12 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>💡 {lang === "ko" ? "이 자원들을 모르셨나요?" : "Did You Know These Resources Existed?"}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko"
                ? "• VITA 무료 세금 신고 — 매년 수백 달러 절약 가능\n• 211 서비스 — 한 번의 전화로 모든 지원 연결\n• 무료 클리닉 — 보험 없어도 의료 서비스 이용 가능\n• NW 저스티스 — 이민 법률 무료 상담 가능"
                : "• VITA free tax filing — save hundreds of dollars each year\n• 211 service — one call connects to all free resources\n• Free Clinic — medical care even without insurance\n• NW Justice — free immigration legal consultations"}
            </div>
          </div>
        </div>
      )}

      {/* ── ⚖️ 법률 탭 (index 5) ── */}
      {sub === 5 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { emoji: "⚖️", name: lang === "ko" ? "NWIRP — 북서부 이민권 프로젝트 ✅" : "NWIRP — NW Immigrant Rights Project ✅",
                desc: lang === "ko"
                  ? "시애틀 최대 이민 법률 무료 기관. 영주권·추방방어·DACA·망명 전문.\n📍 615 2nd Ave Ste 400, Seattle | 📞 800-445-5771 | 🔗 nwirp.org\n무료 법률 (저소득 이민자 우선). 한국어 통역 요청 가능"
                  : "Seattle's largest free immigration legal org. Green card, deportation defense, DACA, asylum.\n📍 615 2nd Ave Ste 400, Seattle | 📞 800-445-5771 | 🔗 nwirp.org\nFree legal services (low-income priority). Korean interpreter available",
                tags: lang === "ko" ? ["무료법률", "이민", "추방방어"] : ["Free Legal", "Immigration", "Deportation"] },
              { emoji: "🏛️", name: lang === "ko" ? "NW 저스티스 프로젝트 ✅" : "Northwest Justice Project ✅",
                desc: lang === "ko"
                  ? "저소득 WA 주민 무료 민사 법률. 이민·주거·가족법 포함.\n📞 206-464-1519 | 🔗 nwjustice.org\nCLEAR 핫라인: 1-888-201-1014 (한국어 포함 다국어)"
                  : "Free civil legal services for low-income WA residents. Immigration, housing, family law.\n📞 206-464-1519 | 🔗 nwjustice.org\nCLEAR hotline: 1-888-201-1014 (multilingual incl. Korean)",
                tags: lang === "ko" ? ["무료법률", "저소득", "민사"] : ["Free Legal", "Low Income", "Civil"] },
              { emoji: "🌍", name: lang === "ko" ? "OneAmerica — 이민자 권익 ✅" : "OneAmerica — Immigrant Rights ✅",
                desc: lang === "ko"
                  ? "WA주 최대 이민자 권익 단체. 시민권 신청 지원·DACA·워크퍼밋.\n📞 425-251-0900 | 🔗 weareoneamerica.org\n시민권 클래스 무료 운영"
                  : "WA's largest immigrant advocacy org. Citizenship, DACA, work permits.\n📞 425-251-0900 | 🔗 weareoneamerica.org\nFree Citizenship Classes",
                tags: lang === "ko" ? ["시민권", "DACA", "권익옹호"] : ["Citizenship", "DACA", "Advocacy"] },
              { emoji: "👨‍⚖️", name: lang === "ko" ? "KCBA 무료 법률 상담 (킹카운티 변호사회)" : "KCBA Free Legal Clinic (King County Bar)",
                desc: lang === "ko"
                  ? "킹카운티 변호사협회 프로보노. 월 1회 무료 법률 클리닉.\n📞 206-267-7010 | 🔗 kcba.org/For-the-Public\n이민·고용·주거·가족법 상담. 사전 예약 필수"
                  : "King County Bar Association pro bono. Monthly free legal clinic.\n📞 206-267-7010 | 🔗 kcba.org/For-the-Public\nImmigration, employment, housing, family law. Appointment required",
                tags: lang === "ko" ? ["프로보노", "법률클리닉", "변호사"] : ["Pro Bono", "Legal Clinic", "Attorney"] },
              { emoji: "🏠", name: lang === "ko" ? "임차인 유니온 (Tenants Union WA)" : "Tenants Union of WA — Renter Rights",
                desc: lang === "ko"
                  ? "임차인 권리 보호. 부당 퇴거·보증금·임대료 분쟁 대응.\n📞 206-723-0500 | 🔗 tenantsunion.org\n워크샵·법률 상담 제공"
                  : "Tenant rights protection. Eviction, security deposit, rent increase disputes.\n📞 206-723-0500 | 🔗 tenantsunion.org\nWorkshops & legal consultation available",
                tags: lang === "ko" ? ["임차인권리", "퇴거방어", "보증금"] : ["Tenant Rights", "Eviction", "Deposit"] },
              { emoji: "🚨", name: lang === "ko" ? "이민 사기 신고 — WA 법무장관실" : "Report Immigration Fraud — WA AG",
                desc: lang === "ko"
                  ? "노타리오(Notario) 사기 신고. 이민 사기는 중범죄.\n📞 1-800-551-4636 | 🔗 atg.wa.gov\n한국어 통역 가능.\n\n⚠️ 이민 서류는 변호사(Attorney) 또는 BIA 공인 대리인에게만!"
                  : "Report notario fraud. Immigration fraud is a serious crime.\n📞 1-800-551-4636 | 🔗 atg.wa.gov\nKorean interpreter available.\n\n⚠️ Only use licensed attorneys or BIA-accredited reps for immigration docs!",
                tags: lang === "ko" ? ["이민사기", "신고", "보호"] : ["Immigration Fraud", "Report", "Protection"] },
            ].map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
          <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 12 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>⚖️ {lang === "ko" ? "긴급 법률 도움 받는 법" : "How to Get Emergency Legal Help"}</div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
              {lang === "ko"
                ? "1. 이민 긴급 → NWIRP: 800-445-5771\n2. 민사 법률 → NW Justice CLEAR: 1-888-201-1014\n3. 시민권 → OneAmerica: 425-251-0900\n4. 임차인 분쟁 → Tenants Union: 206-723-0500\n5. 한국어 상담 → KCSC: 425-776-2400"
                : "1. Immigration emergency → NWIRP: 800-445-5771\n2. Civil legal → NW Justice CLEAR: 1-888-201-1014\n3. Citizenship → OneAmerica: 425-251-0900\n4. Tenant dispute → Tenants Union: 206-723-0500\n5. Korean-language → KCSC: 425-776-2400"}
            </div>
          </div>
        </div>
      )}

      {/* ── 🇺🇸 Korean American 탭 (index 6) ── */}
      {sub === 6 && (
        <div className="pt-5 px-4 md:px-6 lg:px-8">
          <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(239,68,68,0.08))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 15, color: "#ECFDF5", marginBottom: 6 }}>
              🇺🇸 {lang === "ko" ? "Korean American으로 살기" : "Living as Korean American"}
            </div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, lineHeight: 1.7, color: "rgba(236,253,245,0.7)" }}>
              {lang === "ko"
                ? "이민자를 넘어 미국 사회의 당당한 구성원으로. 투표권·공공자원·지역사회 참여로 더 강한 커뮤니티를 만들어 갑니다."
                : "Beyond being immigrants — becoming full participants in American society. Voting, public resources & community engagement build a stronger Korean American community."}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { emoji: "🗳️", name: lang === "ko" ? "투표·시민 참여 — 내 한 표가 바꾼다" : "Voting & Civic Participation",
                desc: lang === "ko"
                  ? "✅ 시민권자 의무이자 권리!\n유권자 등록: 🔗 myvote.wa.gov\n• WA주 — 우편 투표 100%! 선거 전 자동 발송\n• 등록 마감: 선거일 8일 전\n• 한국어 안내: King County Elections 📞 206-296-8683\n\n시민권 후 첫 번째 할 일 = 유권자 등록!"
                  : "✅ Your right AND responsibility as a citizen!\nVoter registration: 🔗 myvote.wa.gov\n• WA State — 100% mail-in ballots!\n• Registration deadline: 8 days before election\n• Korean language info: King County Elections 📞 206-296-8683\n\nFirst thing after citizenship = register to vote!",
                tags: lang === "ko" ? ["투표", "시민참여", "유권자등록"] : ["Voting", "Civic", "Voter Registration"] },
              { emoji: "📚", name: lang === "ko" ? "킹카운티 도서관 — 무료 자원의 보고" : "King County Library — Free Resource Hub",
                desc: lang === "ko"
                  ? "✅ 도서관 카드 하나로 수백만 달러 가치!\n무료 서비스:\n• ESL 영어 수업 무료\n• 시민권 시험 준비 자료\n• 취업·이력서 워크샵\n• 한국어 도서·잡지·DVD\n• 인터넷·프린터 무료\n• LinkedIn Learning 무제한\n📞 425-462-9600 | 🔗 kcls.org"
                  : "✅ One library card = millions in free resources!\nFree services:\n• ESL English classes\n• Citizenship test prep\n• Job search & resume workshops\n• Korean books, magazines & DVDs\n• Free internet & printing\n• Unlimited LinkedIn Learning\n📞 425-462-9600 | 🔗 kcls.org",
                tags: lang === "ko" ? ["도서관", "무료ESL", "LinkedIn Learning"] : ["Library", "Free ESL", "LinkedIn"] },
              { emoji: "🌍", name: lang === "ko" ? "다민족 커뮤니티 연결" : "Multicultural Community Connections",
                desc: lang === "ko"
                  ? "Korean American으로서 다양한 커뮤니티와 연결!\n• 중국계: Asia Pacific Cultural Center\n• 히스패닉: El Centro de la Raza (206) 957-4610\n• 필리핀계: Filipino Community of Seattle (206) 722-9372\n• 인도계: India Association of Western WA\n\n다민족 커뮤니티 연결 = 더 넓은 취업 네트워크 + 다양한 문화 경험"
                  : "Connect across communities as Korean Americans!\n• Chinese-American: Asia Pacific Cultural Center\n• Hispanic: El Centro de la Raza (206) 957-4610\n• Filipino: Filipino Community of Seattle (206) 722-9372\n• Indian: India Association of Western WA\n\nCross-community = broader job network + richer cultural life",
                tags: lang === "ko" ? ["다민족", "커뮤니티", "교류"] : ["Multicultural", "Community", "Connection"] },
              { emoji: "🤝", name: lang === "ko" ? "지역사회 봉사·참여" : "Community Service & Volunteering",
                desc: lang === "ko"
                  ? "✅ 봉사는 커리어·네트워크·영주권에도 도움!\n• United Way of King County: unitedwaykc.org\n• Food Lifeline: foodlifeline.org — 식품 은행 봉사\n• Habitat for Humanity: habitatskc.org\n• KCSC (한인생활상담소): 봉사자 상시 모집\n\n봉사 시간 기록: volunteerheroes.org"
                  : "✅ Volunteering helps career, networking & green card!\n• United Way of King County: unitedwaykc.org\n• Food Lifeline: foodlifeline.org — food bank\n• Habitat for Humanity: habitatskc.org\n• KCSC: always recruiting Korean-speaking volunteers\n\nLog volunteer hours: volunteerheroes.org",
                tags: lang === "ko" ? ["봉사", "커리어", "영주권"] : ["Volunteer", "Career", "Green Card"] },
              { emoji: "🏛️", name: lang === "ko" ? "미국 공공 혜택 — 모르면 손해" : "US Public Benefits — Don't Miss Out",
                desc: lang === "ko"
                  ? "영주권자·시민권자가 누릴 수 있는 공공자원:\n• WIC: 임산부·5세 미만 자녀 무료 식품 📞 206-296-4600\n• SNAP: 식품 지원 → dshs.wa.gov/benefits\n• WA Apple Health: 저소득 의료보험 무료\n• LIHEAP: 겨울 난방비 지원\n• WSHFC: 첫 집 구매자 지원 프로그램\n\n💡 합법 체류자도 일부 혜택 가능. dshs.wa.gov 확인!"
                  : "Public benefits for green card holders & citizens:\n• WIC: free food for pregnant women & children under 5. 📞 206-296-4600\n• SNAP: food assistance → dshs.wa.gov/benefits\n• WA Apple Health: free health insurance (low-income)\n• LIHEAP: winter heating assistance\n• WSHFC: first-time homebuyer programs\n\n💡 Legal residents may qualify. Check dshs.wa.gov!",
                tags: lang === "ko" ? ["공공혜택", "WIC", "SNAP"] : ["Public Benefits", "WIC", "SNAP"] },
              { emoji: "🗺️", name: lang === "ko" ? "시애틀 한인 문화 행사 캘린더" : "Seattle Korean Cultural Events",
                desc: lang === "ko"
                  ? "✅ 연간 주요 한인 행사:\n• 설날 행사: 한인회 & 지역 교회 (1-2월)\n• 한국 문화의 날: 봄 (벨뷰·시애틀)\n• 코리안 페스티벌: 여름 (린우드 H-Mart)\n• 추석 행사: 가을 (9-10월)\n• 광복절: 8월 15일 (총영사관 주관)\n\n최신 정보: seattlekorean.org | KakaoTalk '시애틀한인'"
                  : "✅ Annual Korean community events:\n• Lunar New Year: Korean Association & churches (Jan-Feb)\n• Korean Culture Day: spring (Bellevue & Seattle)\n• Korean Festival: summer (Lynnwood H-Mart)\n• Chuseok Celebration: fall (Sep-Oct)\n• Independence Day: Aug 15 (Consulate General)\n\nStay updated: seattlekorean.org | KakaoTalk '시애틀한인'",
                tags: lang === "ko" ? ["한인행사", "문화", "커뮤니티"] : ["Korean Events", "Culture", "Community"] },
            ].map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 7: 취업 SCREEN
───────────────────────────────────────── */
function JobsScreen({ onHome }: { onHome?: () => void }) {
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
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="💼" titleKo="취업 가이드" titleEn="Jobs & Career"
        descKo="시애틀 한인 취업·창업·비자 완전 가이드" descEn="Complete guide to jobs, business & visas for Koreans in Seattle"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
        </div>
        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 10 }}>
            💼 {lang === "ko" ? "취업 바로 연결" : "Job Resources"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <a href="https://open.kakao.com/o/search/%EC%8B%9C%EC%95%A0%ED%8B%80%ED%95%9C%EC%9D%B8" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(251,191,36,0.2)" }}>
              <span style={{ fontSize: 16 }}>💬</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>
                  {lang === "ko" ? "카카오오픈채팅 '시애틀한인'" : "KakaoTalk '시애틀한인'"}
                </div>
                <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "취업 정보·추천 실시간 공유" : "Live job info & referrals"}</div>
              </div>
              <span style={{ color: accent, fontSize: 14 }}>→</span>
            </a>
            <a href="https://worksourcewa.com/" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(251,191,36,0.2)" }}>
              <span style={{ fontSize: 16 }}>🏢</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>WorkSource WA</div>
                <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "무료 이력서·면접 코칭" : "Free resume & interview coaching"}</div>
              </div>
              <span style={{ color: accent, fontSize: 14 }}>→</span>
            </a>
            <a href="https://www.linkedin.com/jobs/search/?keywords=Korean&location=Seattle%2C+WA" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(251,191,36,0.2)" }}>
              <span style={{ fontSize: 16 }}>💼</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>LinkedIn Jobs — Seattle</div>
                <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{lang === "ko" ? "시애틀 한인 취업 공고" : "Seattle Korean job listings"}</div>
              </div>
              <span style={{ color: accent, fontSize: 14 }}>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 8: 교육 SCREEN
───────────────────────────────────────── */
function EducationScreen({ onHome, initialSub = 0 }: { onHome?: () => void; initialSub?: number }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(initialSub);
  useEffect(() => { setSub(initialSub); }, [initialSub]);
  const tabs = lang === "ko"
    ? ["🏫 학군 순위", "🏛️ 지역 CC", "🎓 4년제 대학", "📝 대입 준비", "📚 학원·ESL", "🇰🇷 한국학교"]
    : ["🏫 School Districts", "🏛️ Community Colleges", "🎓 Universities", "📝 Admissions", "📚 Tutoring & ESL", "🇰🇷 Korean School"];
  const accent = "#A78BFA";

  /* ── Tab 0: 학군 순위 (30마일 광역권) ── */
  const districts = [
    { emoji: "⭐", name: "Bellevue School District", nameEn: "Bellevue SD — WA #1",
      desc: lang === "ko"
        ? "✅ 워싱턴주 1위 학군 (Niche A+). 졸업률 92.5%. Newport HS·Interlake HS·Bellevue HS. AP·IB 과정 풍부. 한인 학생 비율 높음.\n📍 벨뷰·메디나·클라이드힐 포함 | 🔗 bsd405.org"
        : "✅ WA State #1 district (Niche A+). Grad rate 92.5%. Newport, Interlake & Bellevue HS. Rich AP/IB programs. High Korean student ratio.\n📍 Covers Bellevue, Medina & Clyde Hill | 🔗 bsd405.org",
      tags: ["벨뷰", "A+", "WA #1"] },
    { emoji: "⭐", name: "Mercer Island SD", nameEn: "Mercer Island SD — WA #2",
      desc: lang === "ko"
        ? "✅ 워싱턴주 2위 학군 (Niche A+). 졸업률 97.2%. Mercer Island HS (전국 상위 1%). 고소득 전문직 가정 밀집. 렌트 비쌈.\n📍 메르서아일랜드 단일 학군 | 🔗 mercerislandschools.org"
        : "✅ WA #2 district (Niche A+). Grad rate 97.2%. Mercer Island HS (top 1% nationally). High-income professional community.\n📍 Mercer Island only | 🔗 mercerislandschools.org",
      tags: ["메르서아일랜드", "A+", "WA #2"] },
    { emoji: "⭐", name: "Lake Washington SD", nameEn: "Lake Washington SD — Redmond·Kirkland",
      desc: lang === "ko"
        ? "✅ 워싱턴주 상위 1% (Niche A+). 졸업률 95%. Redmond HS·Eastlake HS·Juanita HS. MS·Google 본사 인근 STEM 최강.\n📍 레드몬드·커클랜드·켄모어 | 🔗 lwsd.org"
        : "✅ Top 1% in WA (Niche A+). Grad rate 95%. Redmond, Eastlake & Juanita HS. Near Microsoft & Google HQ — exceptional STEM.\n📍 Redmond, Kirkland, Kenmore | 🔗 lwsd.org",
      tags: ["레드몬드", "커클랜드", "STEM"] },
    { emoji: "⭐", name: "Northshore SD", nameEn: "Northshore SD — Bothell·Woodinville",
      desc: lang === "ko"
        ? "✅ 워싱턴주 상위 5% (Niche A). 졸업률 96%. Inglemoor HS·Bothell HS·Woodinville HS. 한인 가족 최다 거주 학군. 린우드와 인접.\n📍 보텔·우딘빌·켄모어 | 🔗 nsd.org"
        : "✅ Top 5% in WA (Niche A). Grad rate 96%. Inglemoor, Bothell & Woodinville HS. Highest Korean family concentration. Near Lynnwood.\n📍 Bothell, Woodinville, Kenmore | 🔗 nsd.org",
      tags: ["보텔", "우딘빌", "한인밀집"] },
    { emoji: "🏫", name: "Edmonds SD", nameEn: "Edmonds SD — Lynnwood·Mountlake Terrace",
      desc: lang === "ko"
        ? "Niche A. 졸업률 89%. Mountlake Terrace HS·Lynnwood HS·Meadowdale HS. 한인 마트(H-Mart) 밀집 린우드 커버. 렌트 대비 학군 가성비 최고.\n📍 린우드·마운트레이크테라스·에드먼즈 | 🔗 edmonds.wednet.edu"
        : "Niche A. Grad rate 89%. Mountlake Terrace, Lynnwood & Meadowdale HS. Covers Lynnwood H-Mart area. Best value vs. rent ratio.\n📍 Lynnwood, Mountlake Terrace, Edmonds | 🔗 edmonds.wednet.edu",
      tags: ["린우드", "가성비", "한인밀집"] },
    { emoji: "🏫", name: "Federal Way SD", nameEn: "Federal Way SD — 가성비 남부",
      desc: lang === "ko"
        ? "Niche B+. 졸업률 84%. 광역 시애틀 최저 렌트 지역. 페더럴웨이·오번·타코마 연결. 다문화 학교 환경. 통학 필요 시 I-5 이용.\n📍 페더럴웨이·오번 북부 | 🔗 fwps.org"
        : "Niche B+. Grad rate 84%. Lowest rents in Greater Seattle. Federal Way, Auburn & Tacoma access. Diverse school environment.\n📍 Federal Way, north Auburn | 🔗 fwps.org",
      tags: ["페더럴웨이", "저렴렌트", "남부"] },
  ];

  /* ── Tab 1: 지역 커뮤니티 칼리지 (CC) ── */
  const communityColleges = [
    { emoji: "🏛️", name: "Edmonds College", nameEn: "Edmonds College — 린우드 (한인 추천 #1)",
      desc: lang === "ko"
        ? "✅ 린우드 소재. 한인 밀집 지역 내 CC. 4년제 편입 준비 최적. UW·WSU·Western 편입률 높음. ESL·IELTS·英語 프로그램 풍부. 학비 약 $4,500/학기 (주민). Running Start 파트너 학교.\n📍 20000 68th Ave W, Lynnwood | 🔗 edcc.edu"
        : "✅ In Lynnwood — heart of Korean community. Best CC for 4-year transfer (UW, WSU, Western). Rich ESL & IELTS programs. Tuition ~$4,500/semester (resident). Running Start partner.\n📍 20000 68th Ave W, Lynnwood | 🔗 edcc.edu",
      tags: ["린우드", "편입", "한인 #1"] },
    { emoji: "🏛️", name: "Bellevue College", nameEn: "Bellevue College — 벨뷰 (기술·편입)",
      desc: lang === "ko"
        ? "✅ 워싱턴주 최대 CC. 학생 수 약 33,000명. 4년제 학사 학위 직접 수여 (별도 편입 불필요). IT·회계·간호·그래픽디자인 특화. 아시안 학생 비율 높음 (~35%). UW 편입 경쟁 치열.\n📍 3000 Landerholm Circle SE, Bellevue | 🔗 bellevuecollege.edu"
        : "✅ WA's largest CC (~33,000 students). Offers 4-year bachelor's degrees directly. Specialized IT, accounting, nursing & graphic design. ~35% Asian students. Competitive UW transfer.\n📍 3000 Landerholm Circle SE, Bellevue | 🔗 bellevuecollege.edu",
      tags: ["벨뷰", "최대규모", "4년제학위"] },
    { emoji: "🏛️", name: "Seattle Central College", nameEn: "Seattle Central — 캐피톨힐 (예술·국제)",
      desc: lang === "ko"
        ? "시애틀 캐피톨힐 소재. 영화·요리·예술 특화. 국제학생 영어 집중 과정(IEP) 운영. 시내 접근성 최고. 학비 약 $4,300/학기 (주민).\n📍 1701 Broadway, Seattle | 🔗 seattlecentral.edu"
        : "Capitol Hill, Seattle. Specialized film, culinary & fine arts. Intensive English Program (IEP) for international students. Best downtown access.\n📍 1701 Broadway, Seattle | 🔗 seattlecentral.edu",
      tags: ["캐피톨힐", "예술", "국제학생"] },
    { emoji: "🏛️", name: "Cascadia College", nameEn: "Cascadia College — 보텔 (UW 코이그레이트)",
      desc: lang === "ko"
        ? "✅ 보텔 소재. UW Bothell 캠퍼스와 부지 공유. UW Bothell 편입 보장 프로그램 (Running Start·DTA). 이공계·비즈니스 편입 경쟁률 낮음. 학비 약 $4,000/학기 (주민).\n📍 18345 Campus Way NE, Bothell | 🔗 cascadia.edu"
        : "✅ Shares campus with UW Bothell. Guaranteed transfer pathway to UW Bothell (DTA). Lower competition for STEM & business transfer. Tuition ~$4,000/semester (resident).\n📍 18345 Campus Way NE, Bothell | 🔗 cascadia.edu",
      tags: ["보텔", "UW편입보장", "이공계"] },
    { emoji: "🏛️", name: "Shoreline Community College", nameEn: "Shoreline CC — 쇼어라인 (의료·기술)",
      desc: lang === "ko"
        ? "쇼어라인 소재. 의료 보조(Medical Assistant)·방사선사·간호 보조 특화. 직업 기술 빠른 취업 루트. 학비 약 $4,200/학기 (주민). 한인 학생 커뮤니티 소규모.\n📍 16101 Greenwood Ave N, Shoreline | 🔗 shoreline.edu"
        : "Shoreline. Specialized medical assistant, radiologic tech & nursing assistant programs. Fast career path. Tuition ~$4,200/semester.\n📍 16101 Greenwood Ave N, Shoreline | 🔗 shoreline.edu",
      tags: ["쇼어라인", "의료", "직업훈련"] },
    { emoji: "💡", name: "CC → UW 편입 전략", nameEn: "CC → UW Transfer Pathway",
      desc: lang === "ko"
        ? "📋 편입 필수 조건:\n• GPA 3.5+ (경쟁 전공: CS·엔지니어링·비즈니스)\n• DTA(Direct Transfer Agreement) 이수\n• IGETC 또는 전공 전제 과목 완료\n\n🗓️ 편입 일정:\n• 1월 15일: UW 편입 지원 마감 (가을 학기)\n• 4월: 합격 통보\n• 매년 약 1,200명 CC 편입생 UW 합격\n\n💰 장학금: UW Transfer Scholarship (최대 $5,000/년). 🔗 admit.uw.edu/transfer"
        : "📋 Transfer Requirements:\n• GPA 3.5+ (competitive majors: CS, engineering, business)\n• Direct Transfer Agreement (DTA) completion\n• Prerequisite courses for intended major\n\n🗓️ Timeline:\n• Jan 15: UW transfer application deadline (fall quarter)\n• April: Decision notifications\n• ~1,200 CC transfer students admitted to UW annually\n\n💰 UW Transfer Scholarship (up to $5,000/yr). 🔗 admit.uw.edu/transfer",
      tags: ["편입전략", "GPA3.5+", "장학금"] },
  ];

  /* ── Tab 2: 4년제 대학 ── */
  const universities = [
    { emoji: "🎓", name: "University of Washington (UW)", nameEn: "UW Seattle — Public Ivy · 세계 Top 30",
      desc: lang === "ko"
        ? "✅ 시애틀 소재. QS 세계 순위 59위 (2025). 워싱턴주 최고 명문. CS·의대·공대·경영·간호 세계적 수준.\n• 재학생: 약 53,000명 | 한인 학생 약 2,000+명\n• 주립 학비: ~$12,000/년 (in-state) | 국제: ~$40,000/년\n• 합격률: 48% (전체) / CS 전공 경쟁률 매우 높음\n• 한인 학생회(Korean Student Association) 활발 | 🔗 uw.edu"
        : "✅ Seattle. QS World Rank #59 (2025). WA's flagship university. World-class CS, medicine, engineering, business & nursing.\n• ~53,000 students | ~2,000+ Korean students\n• In-state tuition: ~$12,000/yr | International: ~$40,000/yr\n• Acceptance rate: 48% | CS is highly competitive\n• Active Korean Student Association | 🔗 uw.edu",
      tags: ["UW", "세계Top60", "CS·의대"] },
    { emoji: "🎓", name: "UW Bothell", nameEn: "UW Bothell — 보텔 캠퍼스 (STEM·비즈니스)",
      desc: lang === "ko"
        ? "✅ 보텔 소재. UW 3개 캠퍼스 중 하나. Cascadia College와 캠퍼스 공유. CS·엔지니어링·비즈니스 강점. UW Seattle보다 합격률 높음 (60%+). 한인 학생 다수. 주립 학비 ~$11,000/년.\n📍 18115 Campus Way NE, Bothell | 🔗 uwb.edu"
        : "✅ Bothell. One of 3 UW campuses. Shares campus with Cascadia College. Strong CS, engineering & business. Higher acceptance rate than UW Seattle (60%+). Many Korean students.\n📍 18115 Campus Way NE, Bothell | 🔗 uwb.edu",
      tags: ["UW보텔", "보텔", "높은합격률"] },
    { emoji: "🎓", name: "Seattle University (시애틀U)", nameEn: "Seattle University — 예수회 명문",
      desc: lang === "ko"
        ? "✅ 시애틀 다운타운 소재. 예수회(Jesuit) 대학. 법대·비즈니스·간호·심리 강점. 한인 유학생 커뮤니티 활발. 국제학생 장학금(최대 $20,000/년) 있음. 학비 ~$52,000/년 (전액 장학금 가능).\n📍 901 12th Ave, Seattle | 🔗 seattleu.edu"
        : "✅ Downtown Seattle. Jesuit university. Strong law, business, nursing & psychology. Active Korean student community. International scholarships up to $20,000/yr. Tuition ~$52,000/yr.\n📍 901 12th Ave, Seattle | 🔗 seattleu.edu",
      tags: ["시애틀대", "예수회", "국제장학금"] },
    { emoji: "🎓", name: "Western Washington University (WWU)", nameEn: "WWU — 벨링햄 (가성비 명문)",
      desc: lang === "ko"
        ? "벨링햄 소재 (시애틀 북쪽 80마일). Niche A-. 교육학·환경학·비즈니스 강점. 주립 학비 ~$8,800/년. 합격률 82% (비교적 진입 쉬움). 캐나다 밴쿠버 국경 인근.\n📍 516 High St, Bellingham | 🔗 wwu.edu"
        : "Bellingham (80 miles north of Seattle). Niche A-. Strong education, environmental studies & business. In-state tuition ~$8,800/yr. Acceptance rate 82%.\n📍 516 High St, Bellingham | 🔗 wwu.edu",
      tags: ["WWU", "벨링햄", "가성비"] },
    { emoji: "🎓", name: "Washington State University (WSU)", nameEn: "WSU Pullman — 주립 2위",
      desc: lang === "ko"
        ? "풀먼 소재 (시애틀 동쪽 280마일). 공대·수의학·농업 전국 강자. 주립 학비 ~$12,600/년. WSU Everett 분교 (에버렛 — 시애틀 30마일권). 합격률 79%.\n📍 WSU Everett: 915 N Broadway, Everett | 🔗 wsu.edu"
        : "Pullman (280 miles east). Strong engineering, veterinary medicine & agriculture. In-state tuition ~$12,600/yr. WSU Everett branch campus (30 miles from Seattle). Acceptance 79%.\n📍 WSU Everett: 915 N Broadway, Everett | 🔗 wsu.edu",
      tags: ["WSU", "공대·수의학", "WSU에버렛"] },
  ];

  /* ── Tab 3: 대입 준비 ── */
  const admissions = [
    { emoji: "🏃", name: "Running Start 프로그램", nameEn: "Running Start — 고교생 무료 CC 수강",
      desc: lang === "ko"
        ? "✅ 워싱턴주 공립 고교생 대상 무료 대학 수업 프로그램 (11-12학년). 커뮤니티 칼리지 학점을 고교·대학 이중 학점으로 인정. 완전 무료 (교재비만 자부담). 매년 약 24,000명 이용.\n\n💡 한인 가족에게 특히 유리:\n• 고교 재학 중 최대 2년치 대학 학점 취득 가능\n• Edmonds College·Bellevue College·Cascadia 참여\n• 지원: 재학 고교 카운슬러 통해 신청 | 🔗 sbctc.edu/running-start"
        : "✅ Free college courses for WA public high school students (grades 11-12). Earn college AND high school credit simultaneously — completely free (only pay for books).\n\n💡 Especially valuable for Korean families:\n• Earn up to 2 years of college credit in high school\n• Participating schools: Edmonds, Bellevue, Cascadia colleges\n• Apply through your high school counselor | 🔗 sbctc.edu/running-start",
      tags: ["무료", "이중학점", "11-12학년"] },
    { emoji: "📝", name: "SAT·ACT 준비 센터 (광역 시애틀)", nameEn: "SAT/ACT Prep — Greater Seattle",
      desc: lang === "ko"
        ? "📍 한인 밀집 지역 주요 학원:\n• Score At The Top (벨뷰) — SAT/ACT 한국어 강의 가능\n• Ivy Way Academy (벨뷰·시애틀) — 한인 강사 다수, 대입 컨설팅 포함\n• Princeton Review (온라인+오프라인) — 표준화 시험 최강\n• Khan Academy — 무료 SAT 공식 연습 (College Board 협력)\n\n🎯 목표 점수 가이드:\nUW 합격선 SAT ~1200-1400 | CS전공 1400+\nBellevue College 입학 최소 요건 없음 (오픈 어드미션)"
        : "📍 Korean tutoring centers in Greater Seattle:\n• Score At The Top (Bellevue) — Korean-speaking instructors available\n• Ivy Way Academy (Bellevue/Seattle) — Korean instructors, college consulting\n• Princeton Review — top SAT/ACT standard prep\n• Khan Academy — free official SAT practice (College Board partner)\n\n🎯 Target scores:\nUW SAT ~1200-1400 | CS major: 1400+\nBellevue College: open admission (no minimum)",
      tags: ["SAT·ACT", "벨뷰학원", "무료Khan"] },
    { emoji: "🏫", name: "광역 시애틀 명문 고등학교 TOP", nameEn: "Top High Schools — Greater Seattle",
      desc: lang === "ko"
        ? "📊 Niche 기준 상위 고교 (2025):\n1. International School (벨뷰 SD) — 전국 Top 1%, IB 디플로마, 경쟁 입시\n2. Newport High School (벨뷰 SD) — AP 과정 최다, 한인 학생 많음\n3. Interlake High School (벨뷰 SD) — STEM·로보틱스 강점\n4. Mercer Island HS — 소규모 명문, 전국 1%\n5. Redmond High School (LWSD) — MS 인근 STEM\n6. Inglemoor High School (Northshore SD) — 한인 가족 최다\n\n💡 한인에게 TIP: 학군은 거주 주소 자동 배정 → 집 구하기 전 학군 확인 필수!"
        : "📊 Niche top high schools (2025):\n1. International School (Bellevue SD) — National top 1%, IB Diploma, competitive admission\n2. Newport High School (Bellevue SD) — Most AP courses, many Korean students\n3. Interlake High School (Bellevue SD) — STEM & robotics strength\n4. Mercer Island HS — Small elite school, national top 1%\n5. Redmond High School (LWSD) — Near Microsoft, strong STEM\n6. Inglemoor High School (Northshore SD) — Highest Korean family concentration\n\n💡 TIP: School district = home address. Check the district BEFORE renting!",
      tags: ["명문고교", "IB", "Niche Top"] },
    { emoji: "📋", name: "UW 합격 전략 (한인 학생 기준)", nameEn: "UW Admission Strategy for Korean Students",
      desc: lang === "ko"
        ? "📊 UW 합격 통계 (2024 입학생 기준):\n• 합격률: 전체 48% / CS전공 15% (매우 경쟁)\n• 평균 GPA: 3.82 (비가중) / SAT: 1280-1480\n• 지원 마감: 11월 15일 (가을 입학)\n• 조기 전형(EA) 없음 — 단일 일반 전형\n\n💡 한인 학생 전략:\n① AP·IB 과정 최대한 이수 (특히 CS·수학·과학)\n② 리더십 활동 (학생회·DECA·로보틱스)\n③ UW 인터뷰 없음 — 에세이 품질이 핵심\n④ 비교과: 독창적 프로젝트 or 커뮤니티 기여\n🔗 admit.uw.edu"
        : "📊 UW Admission Stats (Class of 2024):\n• Acceptance: 48% overall / CS major 15% (very competitive)\n• Avg unweighted GPA: 3.82 / SAT: 1280-1480\n• Deadline: November 15 (fall quarter)\n• No Early Action — single round admissions\n\n💡 Strategy for Korean students:\n① Max AP/IB courses (especially CS, math, science)\n② Leadership (student council, DECA, robotics)\n③ No UW interview — essays are critical\n④ Extracurriculars: unique projects or community service\n🔗 admit.uw.edu",
      tags: ["UW전략", "합격률48%", "에세이"] },
    { emoji: "💰", name: "장학금·학비 지원 총정리", nameEn: "Financial Aid & Scholarships — Korean Students",
      desc: lang === "ko"
        ? "💵 주요 장학금:\n• FAFSA (연방 지원) — 영주권·시민권자 필수 신청 (10월 1일 오픈)\n• Washington College Grant (WCG) — 주 소득 기준 최대 $15,000/년\n• UW Husky Promise — 가구소득 $75,000 이하 학비 전액 (주민)\n• Korean American Scholarship Foundation (KASF) — 한인 2세 전용 🔗 kasf.org\n• 한인회 장학금 — 지역 한인회·교회 수시 공고\n\n📝 국제학생: FAFSA 대상 아님 → 각 학교 국제학생 장학금 별도 신청 필수"
        : "💵 Key scholarships:\n• FAFSA (federal aid) — mandatory for PR/citizens (opens Oct 1)\n• Washington College Grant (WCG) — up to $15,000/yr based on income\n• UW Husky Promise — full tuition for households under $75,000 (residents)\n• Korean American Scholarship Foundation (KASF) — for 2nd-gen Koreans 🔗 kasf.org\n• Korean community scholarships — check local Korean associations & churches\n\n📝 International students: not FAFSA eligible → apply for each school's international scholarships separately",
      tags: ["FAFSA", "KASF", "WCG장학금"] },
  ];

  /* ── Tab 4: 학원·ESL ── */
  const tutoringEsl = [
    { emoji: "📚", name: "한인 학원·과외 (린우드·벨뷰)", nameEn: "Korean Tutoring Centers — Lynnwood & Bellevue",
      desc: lang === "ko"
        ? "린우드·벨뷰 한인 학원 다수 운영 중. SAT·ACT·AP수학·과학·영어 전문.\n\n주요 학원:\n• Ivy Way Academy (벨뷰) — 대입 컨설팅 포함, 한인 강사\n• Score At The Top (벨뷰) — 표준화 시험 특화\n• Mathnasium (린우드·벨뷰) — 수학 전문 프랜차이즈\n• 개인 과외: $60-100/시, 카카오오픈채팅 '시애틀한인' 검색"
        : "Many Korean tutoring centers in Lynnwood & Bellevue. SAT, ACT, AP math, science & English.\n\nKey centers:\n• Ivy Way Academy (Bellevue) — includes college consulting, Korean instructors\n• Score At The Top (Bellevue) — standardized test specialists\n• Mathnasium (Lynnwood/Bellevue) — math franchise\n• Private tutors: $60-100/hr, search KakaoTalk '시애틀한인'",
      tags: ["학원", "SAT·AP", "린우드·벨뷰"] },
    { emoji: "🌍", name: "국제학생 ESL·어학원", nameEn: "ESL & English Language Schools",
      desc: lang === "ko"
        ? "✅ 추천 ESL 프로그램:\n• Edmonds College ESL/IEP — 린우드 소재, 한인 커뮤니티 인근, 저렴 | 🔗 edcc.edu\n• Seattle Central College IEP — 시내 소재, 국제 분위기\n• ELS Language Centers Seattle — 집중 영어 과정 (사설)\n• Kaplan International — IELTS·TOEFL 집중반\n• 무료: Public Library ESL — 킹카운티 도서관 무료 영어 수업"
        : "✅ Recommended ESL programs:\n• Edmonds College ESL/IEP — Lynnwood, near Korean community, affordable | 🔗 edcc.edu\n• Seattle Central College IEP — downtown, international environment\n• ELS Language Centers Seattle — intensive private courses\n• Kaplan International — IELTS/TOEFL intensive\n• FREE: Public Library ESL — King County Library free English classes",
      tags: ["ESL", "어학", "무료강좌"] },
    { emoji: "👶", name: "유아·초등 교육 (프리스쿨·K-12)", nameEn: "Early Childhood & K-12 Resources",
      desc: lang === "ko"
        ? "🍼 프리스쿨 (Pre-K) 옵션:\n• ECEAP (Washington State) — 소득 기준 무료 프리스쿨 🔗 dcyf.wa.gov\n• Head Start — 연방 무료 프리스쿨 (소득 기준)\n• 한인 교회 운영 주일학교 겸 주중 프리스쿨 다수\n\n📚 K-12 지원:\n• 한국어-영어 이중언어 교육: Seattle Public Schools 일부 학교 운영\n• 무료 방과후 튜터링: Boys & Girls Club, YMCA after-school\n• 학교 급식 무료: 소득 기준 — USDA National School Lunch Program"
        : "🍼 Pre-K options:\n• ECEAP (WA State) — free preschool by income 🔗 dcyf.wa.gov\n• Head Start — federal free preschool (income-based)\n• Several Korean churches operate weekday preschools\n\n📚 K-12 support:\n• Korean-English bilingual education: available in some Seattle Public Schools\n• Free after-school tutoring: Boys & Girls Club, YMCA\n• Free school meals: USDA National School Lunch Program (income-based)",
      tags: ["프리스쿨", "무료K-12", "이중언어"] },
    { emoji: "💼", name: "성인 교육·직업 훈련", nameEn: "Adult Education & Vocational Training",
      desc: lang === "ko"
        ? "✅ 성인 한인 이민자를 위한 교육 자원:\n• WorkSource WA — 무료 직업 훈련·이력서 코칭·취업 연결 🔗 worksourcewa.com\n• Goodwill Job Training — 무료 직업 기술 훈련 (컴퓨터·소매·의료)\n• Edmonds College 평생교육 — 저렴한 성인 직업 과정\n• ACRS (Asian Counseling & Referral Service) — 한국어 지원 취업 서비스\n• KCSC (한인생활상담소) — 한국어 취업 상담·이력서 도움 🔗 kcsc.org"
        : "✅ Educational resources for adult Korean immigrants:\n• WorkSource WA — free job training, resume coaching & job placement 🔗 worksourcewa.com\n• Goodwill Job Training — free vocational skills (computer, retail, medical)\n• Edmonds College Continuing Education — affordable adult vocational courses\n• ACRS — employment services with Korean language support\n• KCSC (Korean Community Service Center) — Korean-language job counseling 🔗 kcsc.org",
      tags: ["성인교육", "직업훈련", "무료"] },
  ];

  /* ── 한국학교 데이터 ── */
  const koreanSchools = [
    { emoji: "🇰🇷", name: lang === "ko" ? "시애틀한국학교 (Seattle Korean School)" : "Seattle Korean School",
      desc: lang === "ko"
        ? "✅ WA주 최대 한국학교. 한인 2세·1.5세 한국어 교육.\n📅 매주 토요일 오전\n과정: 유치부·초등부·중등부·고등부·성인반\nTOPIK(한국어능력시험) 준비 반 운영\n🔗 seattlekoreanschool.org"
        : "✅ Largest Korean school in WA. Education for 2nd/1.5-gen Koreans.\n📅 Every Saturday morning\nPrograms: preschool, elementary, middle, high school, adult\nTOPIK (Korean Proficiency Test) prep available\n🔗 seattlekoreanschool.org",
      tags: lang === "ko" ? ["한국학교", "토요한글", "TOPIK"] : ["Korean School", "Saturday", "TOPIK"] },
    { emoji: "📖", name: lang === "ko" ? "교회 부설 한국학교 (주요 교회)" : "Church-Based Korean Schools",
      desc: lang === "ko"
        ? "많은 한인 교회가 자체 한국학교 운영:\n• 시애틀지구촌교회 (GMC): 주일학교 겸 한국어 교육\n• 벨뷰 지역 교회: 토요 한국학교 다수\n• 린우드 지역 교회: 한국어·역사·문화 병행\n\n장점: 교회 멤버십으로 학비 할인·무료"
        : "Many Korean churches run their own Korean schools:\n• Global Mission Church (GMC): Sunday school + Korean\n• Bellevue Korean churches: multiple Saturday programs\n• Lynnwood Korean churches: language, history & culture\n\nBenefit: Discounted or free tuition for members",
      tags: lang === "ko" ? ["교회한국학교", "주일학교", "무료"] : ["Church School", "Sunday School", "Free"] },
    { emoji: "📊", name: lang === "ko" ? "재미한국학교 서북미협의회 (NAKS-PNW)" : "Korean Schools of America — PNW (NAKS)",
      desc: lang === "ko"
        ? "WA·OR·ID 한국학교 총괄 협의회. 전체 회원 학교 목록·등록 정보.\n🔗 nakspnw.org\n\n• 매년 봄 한국어 말하기·글쓰기 대회\n• 여름 집중 한국어 캠프 (1-2주)\n• 학교 찾기: nakspnw.org → 지역별 필터"
        : "Regional council for Korean schools in WA, OR & ID.\n🔗 nakspnw.org\n\n• Annual Korean speech & writing competition\n• Summer intensive Korean camps (1-2 weeks)\n• Find a school: nakspnw.org → filter by area",
      tags: lang === "ko" ? ["서북미협의회", "NAKS", "한국어대회"] : ["NAKS-PNW", "Korean Schools", "Competition"] },
    { emoji: "🥋", name: lang === "ko" ? "한국 문화·예술 교육 프로그램" : "Korean Culture & Arts Programs",
      desc: lang === "ko"
        ? "한국어 외 문화 교육 옵션:\n\n🥋 태권도: 린우드·페더럴웨이 한인 도장 다수. 주 2-3회, 월 $80-150\n🎵 가야금·장구: 교회·문화센터 클래스\n🎭 한국 전통 무용: Seattle Korean Dance Group\n💃 K-pop 댄스: 린우드·벨뷰 학원 다수\n\n정보: kSeattle.com 또는 카카오오픈채팅 '시애틀한인'"
        : "Cultural education beyond language:\n\n🥋 Taekwondo: Multiple Korean dojangs in Lynnwood & Federal Way. 2-3x/week, $80-150/month\n🎵 Gayageum & Janggu: church & cultural center classes\n🎭 Traditional Korean Dance: Seattle Korean Dance Group\n💃 K-pop Dance: studios in Lynnwood & Bellevue\n\nInfo: kSeattle.com or KakaoTalk '시애틀한인'",
      tags: lang === "ko" ? ["태권도", "한국무용", "K-pop"] : ["Taekwondo", "Korean Dance", "K-pop"] },
    { emoji: "🎓", name: lang === "ko" ? "AP 한국어 — 대입 활용법" : "AP Korean — College Application Value",
      desc: lang === "ko"
        ? "✅ 한국어 AP 시험은 대입에서 큰 강점!\n• SAT Subject Test 대체 가능\n• 대학 학점 인정 (4-8학점 절약, 약 $2,000-4,000 상당)\n• Native Speaker 전형 별도 — 한국어 원어민에게 유리\n• TOPIK 점수도 일부 대학에서 어학 능력 증빙으로 인정\n\n시험 등록: collegeboard.org | 매년 5월 시험"
        : "✅ AP Korean is a major advantage for college apps!\n• Can substitute for SAT Subject Test\n• College credit recognition (4-8 credits, worth $2,000-4,000)\n• Native Speaker track available — advantage for heritage speakers\n• TOPIK scores accepted by some universities as language proficiency\n\nRegister: collegeboard.org | Exam in May each year",
      tags: lang === "ko" ? ["AP한국어", "대입", "학점인정"] : ["AP Korean", "College", "Credit"] },
  ];

  const allEdu = serverContent["education"] ? resolvePlaceItems(serverContent["education"], lang) : null;
  const subData = allEdu
    ? [allEdu.slice(0, 6), allEdu.slice(6, 12), allEdu.slice(12, 17), allEdu.slice(17, 22), allEdu.slice(22, 27), allEdu.slice(27)]
    : [districts, communityColleges, universities, admissions, tutoringEsl, koreanSchools];
  const content = subData[sub] ?? [];

  /* ── 탭별 하단 팁 ── */
  const tips = [
    { icon: "🏠", ko: "학군은 거주 주소 기준 자동 배정. 집 계약 전 반드시 학군 확인 (niche.com → School Districts). 한인 밀집 Northshore SD(보텔)·Edmonds SD(린우드)가 가성비 최고.", en: "School district is assigned by home address. Always check the district before signing a lease (niche.com → School Districts). Northshore SD (Bothell) & Edmonds SD (Lynnwood) offer the best value for Korean families." },
    { icon: "🔄", ko: "CC → 4년제 편입 핵심: 첫 학기부터 DTA(편입 보장 협약) 과목 수강. GPA 3.5+를 유지하면 UW Seattle 편입 가능. 에드먼즈CC·캐스케이디아가 한인에게 최적.", en: "CC → 4-year transfer key: enroll in DTA (transfer agreement) courses from day one. Maintain GPA 3.5+ for UW Seattle transfer. Edmonds CC and Cascadia are top choices for Korean students." },
    { icon: "🎓", ko: "UW는 11월 15일 마감 (한 번만 지원 가능). CS·엔지니어링은 UW Seattle 경쟁률이 높으니 UW Bothell을 함께 고려. 주립 학비 in-state가 국제보다 3배 저렴.", en: "UW deadline is Nov 15 (single round). CS & Engineering at UW Seattle are very competitive — consider UW Bothell. In-state tuition is 3× cheaper than international." },
    { icon: "🏃", ko: "Running Start는 워싱턴주 공립 고교생만 대상 (11-12학년). 완전 무료 (교재비만). Edmonds College·Bellevue College·Cascadia 참여. 졸업 시 최대 2년치 학점 취득 가능.", en: "Running Start is for WA public HS students (grades 11-12) only. Completely free (books only). Participating: Edmonds, Bellevue & Cascadia. Earn up to 2 years of college credit before graduating." },
    { icon: "💵", ko: "ESL은 커뮤니티 칼리지가 사설 어학원보다 훨씬 저렴 (1/3 가격). 킹카운티 공공도서관 ESL은 무료. 직업 훈련은 WorkSource WA를 먼저 확인 — 무료가 많음.", en: "Community college ESL is far cheaper than private language schools (1/3 the price). King County Library ESL is free. For job training, check WorkSource WA first — many programs are free." },
    { icon: "🇰🇷", ko: "한국학교 등록은 이른 봄(2-3월)에 마감되는 경우가 많습니다. 자녀의 한국어 교육은 빠를수록 좋습니다 — 5세 전 시작이 가장 효과적. nakspnw.org에서 가까운 학교 검색!", en: "Korean school enrollment often closes in early spring (Feb-Mar). Starting Korean language education early is most effective — before age 5 is ideal. Find a nearby school at nakspnw.org!" },
  ];
  const tip = tips[sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="🎓" titleKo="교육 가이드" titleEn="Education Guide"
        descKo="광역 시애틀 30마일권 — 학군·CC·대학·대입 완전 가이드" descEn="Greater Seattle 30-mile radius — School districts, CC, universities & admissions"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
        </div>
        <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
          <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>
            {tip.icon} {lang === "ko" ? "꼭 알아야 할 팁" : "Key Tip"}
          </div>
          <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)", whiteSpace: "pre-line" }}>
            {lang === "ko" ? tip.ko : tip.en}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TAB 9: 생활비 SCREEN
───────────────────────────────────────── */
function CostScreen({ onHome, initialSub = 0 }: { onHome?: () => void; initialSub?: number }) {
  const { lang } = useI18n();
  const { content: serverContent } = useContent();
  const [sub, setSub] = useState(initialSub);
  useEffect(() => { setSub(initialSub); }, [initialSub]);
  const tabs = lang === "ko"
    ? ["렌트·주거", "세금·생활비", "교통·통신", "💡 알뜰생활", "📋 세금신고"]
    : ["Rent & Housing", "Tax & Living", "Transport & Phone", "💡 Smart Living", "📋 Tax Filing"];
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

  // ── 알뜰생활 탭 데이터 ──────────────────────────────────────────
  const smartShoppingMarkets = [
    { emoji: "🏪", name: "코스트코 (Costco)", nameEn: "Costco — Best Value Warehouse",
      desc: lang === "ko"
        ? "✅ 검증됨 | 연 멤버십 $65 → 평균 $300+ 절약\n📍 린우드: 4401 Auto Mall Dr | 📍 쇼어라인: 14905 1st Ave NE\n• 코스트코 주유소: 지역 최저가 (갤런당 10-20센트 저렴)\n• 한인 추천: 커클랜드 연어, 갈비, 대용량 쌀\n🔗 costco.com"
        : "✅ Verified | Annual membership $65 → saves avg $300+/yr\n📍 Lynnwood: 4401 Auto Mall Dr | 📍 Shoreline: 14905 1st Ave NE\n• Costco Gas: area's cheapest gas (10-20 cents/gal cheaper)\n• Korean favorites: Kirkland salmon, short ribs, rice in bulk\n🔗 costco.com",
      tags: ["코스트코", "창고형", "저렴"] },
    { emoji: "🛒", name: "Grocery Outlet", nameEn: "Grocery Outlet — 30-70% Off",
      desc: lang === "ko"
        ? "✅ 검증됨 | 정가 대비 30-70% 할인\n• '보물찾기' 스타일 — 매주 다른 재고\n• 추천: 과자·음료·유제품·육류 마크다운\n• 시애틀 지역 여러 지점 운영\n🔗 groceryoutlet.com"
        : "✅ Verified | 30-70% off regular grocery prices\n• 'Treasure hunt' style — stock changes weekly\n• Best for: snacks, beverages, dairy, meat markdowns\n• Multiple Seattle area locations\n🔗 groceryoutlet.com",
      tags: ["할인마트", "식품", "절약"] },
    { emoji: "🏬", name: "WinCo Foods", nameEn: "WinCo Foods — Lowest Prices",
      desc: lang === "ko"
        ? "✅ 검증됨 | 식료품 최저가 보장 (직원 소유 = 좋은 서비스)\n📍 린우드: 19500 Hwy 99 | 렌튼 | 에버렛\n• 벌크 빈 코너: 필요한 만큼만 구매 가능\n• ⚠️ 신용카드 불가 (직불카드·현금만)\n🔗 wincofoods.com"
        : "✅ Verified | Consistently LOWEST prices for staples\n📍 Lynnwood: 19500 Hwy 99 | Renton | Everett\n• Employee-owned = better service\n• Bulk bins: buy exact amounts needed\n• ⚠️ No credit cards (debit/cash only)\n🔗 wincofoods.com",
      tags: ["WinCo", "최저가", "벌크"] },
    { emoji: "🥬", name: "99 Ranch Market (99랜치)", nameEn: "99 Ranch Market — Pan-Asian",
      desc: lang === "ko"
        ? "✅ 검증됨 | 중국·범아시안 슈퍼마켓\n📍 벨뷰: 14700 NE 20th St | 📍 에드먼즈: 23830 Hwy 99\n• 신선 해산물·두부·채소 H-Mart 대비 20-40% 저렴\n• 추천: 야채·허브·국수·냉동 만두\n🔗 99ranch.com"
        : "✅ Verified | Chinese/Pan-Asian supermarket\n📍 Bellevue: 14700 NE 20th St | 📍 Edmonds: 23830 Hwy 99\n• Fresh seafood, tofu, produce 20-40% cheaper than H-Mart\n• Great for: vegetables, herbs, noodles, frozen dumplings\n🔗 99ranch.com",
      tags: ["99랜치", "아시안마트", "저렴"] },
    { emoji: "🐟", name: "우와지마야 (Uwajimaya)", nameEn: "Uwajimaya — Japanese/Asian",
      desc: lang === "ko"
        ? "✅ 검증됨 | 일본·아시안 슈퍼마켓 — 최고의 해산물 선택\n📍 벨뷰: 699 120th Ave NE | 📍 시애틀: 600 5th Ave S\n• 즉석 델리·일본 스낵·정통 재료\n• 일본 요리 재료·조미료 최다 구비\n🔗 uwajimaya.com"
        : "✅ Verified | Japanese/Asian supermarket — best seafood selection\n📍 Bellevue: 699 120th Ave NE | 📍 Seattle: 600 5th Ave S\n• Hot deli, Japanese snacks, authentic ingredients\n• Best selection of Japanese cooking ingredients\n🔗 uwajimaya.com",
      tags: ["우와지마야", "일본마트", "해산물"] },
    { emoji: "🌿", name: "Trader Joe's", nameEn: "Trader Joe's — Quality at Low Price",
      desc: lang === "ko"
        ? "✅ 검증됨 | 고품질 자체 브랜드 제품 저렴하게\n• 유명 제품: $3 와인, 저렴한 견과류·말린과일, 냉동밀\n• 유기농·건강식품 저렴 | 시애틀 여러 지점\n• 한인에게 덜 알려진 알뜰 마트\n🔗 traderjoes.com"
        : "✅ Verified | Quality private-label products at lower prices\n• Famous for: $3 wine, cheap nuts/dried fruit, frozen meals\n• Organic & health foods at low prices | Multiple Seattle locations\n• Great value overlooked by many Koreans\n🔗 traderjoes.com",
      tags: ["TJ", "유기농", "가성비"] },
    { emoji: "♻️", name: "Goodwill / 중고마켓", nameEn: "Goodwill & Second-Hand",
      desc: lang === "ko"
        ? "✅ 검증됨 | 중고의류 $3-15, 가구·가전\n• 벨뷰/커클랜드 굿윌: 명품 아이템 자주 등장\n• Facebook Marketplace & Buy Nothing 그룹: 무료 아이템 다수\n• 린우드·벨뷰·시애틀 여러 지점\n🔗 goodwillwa.org"
        : "✅ Verified | Clothing $3-15, furniture, electronics\n• Bellevue/Kirkland locations often have designer items\n• Facebook Marketplace & Buy Nothing groups: many free items\n• Lynnwood, Bellevue, Seattle locations\n🔗 goodwillwa.org",
      tags: ["중고", "굿윌", "무료"] },
  ];

  const ethnicEateries = [
    { emoji: "🍜", name: "베트남 쌀국수 (Pho)", nameEn: "Vietnamese Pho",
      desc: lang === "ko"
        ? "거대한 한 그릇 $12-15, 엄청난 포만감\n• 인기 가게: Pho Bac (여러 지점), Green Leaf Vietnamese\n• \"김치찌개보다 저렴하고 양 2배\"\n• 한인에게 강력 추천하는 타민족 맛집\n📍 google.com/maps/search/pho+seattle"
        : "Huge bowl $12-15, incredibly filling\n• Popular spots: Pho Bac (multiple), Green Leaf Vietnamese\n• \"Cheaper than Korean stew and twice the portion\"\n• Highly recommended for Korean immigrants\n📍 google.com/maps/search/pho+seattle",
      tags: ["베트남", "포", "가성비"] },
    { emoji: "🌮", name: "멕시칸 타코·부리토", nameEn: "Mexican Tacos & Burritos",
      desc: lang === "ko"
        ? "타코 $3-4개, 부리토 $10-12 (2인분 양)\n• 인기: El Camion (푸드트럭), Tacos Guaymas, Taqueria El Rinconcito\n• \"한국 분식보다 훨씬 배부릅니다\"\n📍 google.com/maps/search/taco+truck+seattle"
        : "Tacos $3-4 each, burrito $10-12 (2 people's worth of food)\n• Popular: El Camion (food truck), Tacos Guaymas, Taqueria El Rinconcito\n• \"More filling than Korean snack food at the same price\"\n📍 google.com/maps/search/taco+truck+seattle",
      tags: ["멕시칸", "타코", "저렴"] },
    { emoji: "🍛", name: "인도 뷔페 (점심)", nameEn: "Indian Lunch Buffet",
      desc: lang === "ko"
        ? "무제한 점심 뷔페 $14-17\n• 인기: Vij's Railway Express, Taste of India\n• \"14달러에 무제한 — 인도 카레의 보물창고\"\n• 매일 바뀌는 다양한 카레·난·라이스\n📍 google.com/maps/search/indian+buffet+seattle"
        : "Unlimited lunch buffet $14-17\n• Popular: Vij's Railway Express, Taste of India\n• \"Unlimited for $14 — treasure chest of Indian curry\"\n• Daily rotating curries, naan & rice\n📍 google.com/maps/search/indian+buffet+seattle",
      tags: ["인도", "뷔페", "무제한"] },
    { emoji: "🇪🇹", name: "에티오피아 음식", nameEn: "Ethiopian Restaurant",
      desc: lang === "ko"
        ? "$12-15, 엄청난 양, 공동 인제라 빵 (함께 먹는 문화)\n• 컬럼비아 시티 지역: Jebena Cafe, Cafe Selam\n• \"스페이스 니들 뷰 레스토랑의 1/5 가격\"\n• 독특한 향신료·채식 옵션 풍부\n📍 google.com/maps/search/ethiopian+restaurant+seattle"
        : "$12-15, huge portions, communal injera bread\n• Columbia City area: Jebena Cafe, Cafe Selam\n• \"1/5 the price of a Space Needle view restaurant\"\n• Unique spices, abundant vegetarian options\n📍 google.com/maps/search/ethiopian+restaurant+seattle",
      tags: ["에티오피아", "저렴", "컬럼비아시티"] },
  ];

  const allCost = serverContent["cost"] ? resolvePlaceItems(serverContent["cost"], lang) : null;
  const subData = allCost
    ? [allCost.slice(0, 1), allCost.slice(1, 3), allCost.slice(3), [...smartShoppingMarkets, ...ethnicEateries]]
    : [rentHousing, taxLiving, transportPhone, [...smartShoppingMarkets, ...ethnicEateries]];
  const content = subData[sub];

  return (
    <div style={{ paddingBottom: 96 }}>
      <BackToHomeButton onHome={onHome} lang={lang} />
      <ScreenHeader emoji="💰" titleKo="생활비 가이드" titleEn="Living Cost Guide"
        descKo="렌트·세금·교통·통신비 완전 가이드" descEn="Complete guide to rent, taxes, transport & phone costs in Seattle"
        accentColor={accent} />
      <SubTabBar tabs={tabs} active={sub} onChange={setSub} accentColor={accent} />
      <div className="pt-5 px-4 md:px-6 lg:px-8">
        {sub !== 3 && sub !== 4 ? (
          <>
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
          </>
        ) : sub === 3 ? (
          <>
            {/* ── 섹션 1: 알뜰 쇼핑 마트 ── */}
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: accent, letterSpacing: "0.5px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              🛒 {lang === "ko" ? "알뜰 쇼핑 마트" : "Smart Shopping Markets"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
              {smartShoppingMarkets.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            </div>

            {/* ── 섹션 2: 타민족 인기 맛집 ── */}
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: accent, letterSpacing: "0.5px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              🌍 {lang === "ko" ? "타민족 인기 맛집" : "Popular Ethnic Eateries"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 20 }}>
              {ethnicEateries.map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            </div>

            {/* ── 섹션 3: 절약 앱 & 무료자원 ── */}
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 12, color: accent, letterSpacing: "0.5px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              📱 {lang === "ko" ? "절약 앱 & 무료자원" : "Money-Saving Apps & Free Resources"}
            </div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 8 }}>
                📱 {lang === "ko" ? "돈 절약 앱" : "Apps to Save Money"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { href: "https://www.gasbuddy.com", emoji: "⛽", label: "GasBuddy", sub: lang === "ko" ? "근처 최저 유가 찾기" : "Find cheapest gas nearby" },
                  { href: "https://home.ibotta.com", emoji: "💸", label: "Ibotta", sub: lang === "ko" ? "식료품 캐시백 — 월 $20-50 절약" : "Grocery cashback — save $20-50/month" },
                  { href: "https://www.fetchrewards.com", emoji: "🎁", label: "Fetch Rewards", sub: lang === "ko" ? "영수증 스캔 → 포인트 → 기프트카드" : "Scan receipts for points → gift cards" },
                  { href: "https://www.offerup.com", emoji: "🔄", label: "OfferUp / Facebook Marketplace", sub: lang === "ko" ? "중고 사고팔기 — 무료 아이템도 많음" : "Buy/sell local — many free items" },
                ].map((link, i) => (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(52,211,153,0.15)" }}>
                    <span style={{ fontSize: 16 }}>{link.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>{link.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{link.sub}</div>
                    </div>
                    <span style={{ color: accent, fontSize: 14 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 8 }}>
                🆓 {lang === "ko" ? "무료자원 — 꼭 활용하세요!" : "FREE Resources — Don't Miss These!"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { href: "https://www.spl.org", emoji: "📚", label: lang === "ko" ? "시애틀 공공도서관 (SPL)" : "Seattle Public Library (SPL)", sub: lang === "ko" ? "무료 인터넷·eBook(Libby)·Kanopy 영화·언어학습(Mango — 무료!)" : "Free internet, eBooks (Libby), Kanopy movies, Mango Languages (free!)" },
                  { href: "https://www.seattleartmuseum.org", emoji: "🎨", label: lang === "ko" ? "시애틀 미술관 (SAM)" : "Seattle Art Museum (SAM)", sub: lang === "ko" ? "매달 첫째 목요일 오후 5-9시 무료 입장" : "FREE first Thursday of every month, 5-9PM" },
                  { href: "https://www.zoo.org", emoji: "🦁", label: lang === "ko" ? "우들랜드 파크 동물원" : "Woodland Park Zoo", sub: lang === "ko" ? "시애틀 거주자 할인 요금 적용" : "Reduced price for Seattle residents" },
                  { href: "https://discoverpass.wa.gov", emoji: "🌲", label: lang === "ko" ? "Discover Pass ($30/년)" : "Discover Pass ($30/yr)", sub: lang === "ko" ? "워싱턴주 전체 주립공원·해변 무제한 입장" : "All WA state parks & beaches — unlimited access" },
                  { href: "https://www.vitataxhelp.org", emoji: "📋", label: lang === "ko" ? "VITA 무료 세금신고" : "VITA Free Tax Filing", sub: lang === "ko" ? "소득 $60K 이하 — 1월~4월 무료 세금 신고 (vitataxhelp.org)" : "Income under $60K — FREE tax prep Jan-April (vitataxhelp.org)" },
                ].map((link, i) => (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(52,211,153,0.15)" }}>
                    <span style={{ fontSize: 16 }}>{link.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#ECFDF5" }}>{link.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(236,253,245,0.5)", marginTop: 1 }}>{link.sub}</div>
                    </div>
                    <span style={{ color: accent, fontSize: 14 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 8 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: accent, marginBottom: 4 }}>
                💡 {lang === "ko" ? "알뜰생활 철학" : "Smart Living Philosophy"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.7, color: "rgba(236,253,245,0.6)" }}>
                {lang === "ko"
                  ? "HebronGuide는 한인 커뮤니티를 넘어 다문화 미국 생활 전체를 가르칩니다. 베트남 쌀국수, 멕시칸 타코, 인도 뷔페 — 이민자들이 만든 음식이 이민자에게 가장 가성비가 좋습니다. 돈을 아끼면서 지혜로운 생활 🌎"
                  : "HebronGuide teaches you to thrive in ALL of multicultural America, not just the Korean community. Vietnamese pho, Mexican tacos, Indian buffets — food made by immigrants offers the best value for immigrants. Smart frugal living 🌎"}
              </div>
            </div>
          </>
        ) : (
          /* ── 세금신고 탭 (index 4) ── */
          <>
            <div style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(52,211,153,0.08))", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 16, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 15, color: "#ECFDF5", marginBottom: 6 }}>
                📋 {lang === "ko" ? "세금신고 완전 가이드" : "Complete Tax Filing Guide"}
              </div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 12, lineHeight: 1.7, color: "rgba(236,253,245,0.7)" }}>
                {lang === "ko"
                  ? "✅ WA주는 소득세 없음! 하지만 연방 세금(IRS)은 신고 필수. 한인 이민자들이 모르는 세금 혜택과 무료 신고 방법을 알려드립니다."
                  : "✅ WA has no state income tax! But federal taxes (IRS) are required. Here's what Korean immigrants often don't know about tax benefits and free filing options."}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { emoji: "🆓", name: lang === "ko" ? "VITA 무료 세금신고 ✅ 검증됨" : "VITA Free Tax Filing ✅ Verified",
                  desc: lang === "ko"
                    ? "소득 $67,000 이하 무료 세금 신고! IRS 공인 자원봉사자 지원.\n📅 매년 1월 말 ~ 4월 15일\n🔗 vitataxhelp.org 또는 IRS.gov/VITA\n\n시애틀 지역 VITA 위치:\n• 킹카운티 도서관 여러 지점\n• KCSC (한인생활상담소) 확인\n📞 211 전화 → 가까운 VITA 위치 안내"
                    : "FREE tax prep for income under $67,000! IRS-certified volunteers.\n📅 Late January – April 15 each year\n🔗 vitataxhelp.org or IRS.gov/VITA\n\nVITA locations in Seattle area:\n• Multiple King County Library branches\n• Check KCSC (Korean Community Service Center)\n📞 Call 211 → nearest VITA location",
                  tags: lang === "ko" ? ["무료세금신고", "VITA", "중요"] : ["Free Tax Filing", "VITA", "Important"] },
                { emoji: "🆔", name: lang === "ko" ? "ITIN (개인납세자번호) 신청" : "ITIN Application (Individual Taxpayer ID)",
                  desc: lang === "ko"
                    ? "SSN 없어도 세금 신고 가능! IRS Form W-7 제출.\n\n필요한 경우:\n• F-1 학생비자 (SSN 없는 경우)\n• 워킹홀리데이·J-1\n• E-2 투자비자\n• 비거주외국인 소득 있는 경우\n\n처리기간: 7-11주\n한인 CPA 도움 강력 권장\n📞 IRS: 1-800-829-1040"
                    : "You can file taxes even without an SSN! Submit IRS Form W-7.\n\nNeeded when:\n• F-1 student (no SSN)\n• J-1 exchange visitor\n• E-2 investor visa\n• Non-resident alien with US income\n\nProcessing: 7-11 weeks\nStrongly recommend Korean CPA assistance\n📞 IRS: 1-800-829-1040",
                  tags: lang === "ko" ? ["ITIN", "W-7", "SSN없이"] : ["ITIN", "W-7", "No SSN"] },
                { emoji: "🏠", name: lang === "ko" ? "한국 소득·해외계좌 신고 (FBAR/FATCA)" : "Foreign Income & Account Reporting (FBAR/FATCA)",
                  desc: lang === "ko"
                    ? "⚠️ 반드시 확인! 한국 소득 또는 해외 계좌 있으면:\n\nFBAR (FinCEN 114):\n• 해외 금융계좌 합계 $10,000 초과 시 매년 신고\n• bsaefiling.fincen.treas.gov (무료, 온라인)\n• 미신고 시 벌금 $10,000~\n\nFATCA (Form 8938):\n• 해외 금융자산 독신 $50K / 부부 $100K 초과 시\n\n💡 한인 CPA (IRS Enrolled Agent) 상담 필수!"
                    : "⚠️ Must check if you have Korean income or overseas accounts!\n\nFBAR (FinCEN 114):\n• File annually if total foreign accounts exceed $10,000\n• bsaefiling.fincen.treas.gov (free, online)\n• Penalty for non-filing: $10,000+\n\nFATCA (Form 8938):\n• Single: $50K / Married: $100K in foreign assets\n\n💡 Must consult Korean CPA (IRS Enrolled Agent)!",
                  tags: lang === "ko" ? ["FBAR", "FATCA", "해외계좌"] : ["FBAR", "FATCA", "Foreign Assets"] },
                { emoji: "💰", name: lang === "ko" ? "이민자 세금 혜택 — 모르면 손해" : "Tax Credits for Immigrants — Don't Miss Out",
                  desc: lang === "ko"
                    ? "✅ 많은 한인 이민자가 놓치는 세금 환급:\n\n• Earned Income Tax Credit (EITC): 저소득 근로자 최대 $7,430 환급\n• Child Tax Credit: 자녀 1인당 최대 $2,000\n• Child & Dependent Care Credit: 보육비 최대 35% 환급\n• American Opportunity Credit: 대학 학비 최대 $2,500 환급\n• Education credits: 등록금 세금 공제\n\n💡 VITA에서 무료로 이 모든 혜택 신청 가능!"
                    : "✅ Tax refunds many Korean immigrants miss:\n\n• Earned Income Tax Credit (EITC): up to $7,430 refund for low-income workers\n• Child Tax Credit: up to $2,000 per child\n• Child & Dependent Care Credit: up to 35% of childcare costs\n• American Opportunity Credit: up to $2,500 for college tuition\n• Education credits: tuition deductions\n\n💡 All of these can be claimed FREE at VITA!",
                  tags: lang === "ko" ? ["세금혜택", "환급", "EITC"] : ["Tax Credits", "Refund", "EITC"] },
                { emoji: "👨‍💼", name: lang === "ko" ? "시애틀 한인 CPA·세무사 추천" : "Korean CPAs & Tax Accountants in Seattle",
                  desc: lang === "ko"
                    ? "복잡한 세금 상황은 전문가에게!\n\n한인 CPA 찾기:\n• kSeattle.com 업소록 → '회계사' 검색\n• WowSeattle 업소록 → 회계·세금 카테고리\n• 카카오오픈채팅 '시애틀한인' 추천 요청\n\n비용 기준 (참고용):\n• 개인 기본 세금신고: $150-300\n• 자영업자: $300-600\n• FBAR/FATCA 포함: $400-800\n\n💡 H&R Block·TurboTax보다 한인 CPA가 이민자 상황에 더 정통"
                    : "Complex tax situations? Go to a professional!\n\nFind Korean CPAs:\n• kSeattle.com directory → search 'accountant'\n• WowSeattle directory → accounting & tax category\n• Ask in KakaoTalk '시애틀한인'\n\nTypical fees (reference only):\n• Basic personal return: $150-300\n• Self-employed: $300-600\n• With FBAR/FATCA: $400-800\n\n💡 Korean CPAs are more knowledgeable about immigrant tax situations than H&R Block or TurboTax",
                  tags: lang === "ko" ? ["한인CPA", "세무사", "전문가"] : ["Korean CPA", "Tax Pro", "Accountant"] },
                { emoji: "📅", name: lang === "ko" ? "세금 신고 캘린더" : "Tax Filing Calendar",
                  desc: lang === "ko"
                    ? "✅ 연간 세금 일정:\n\n• 1월 초: W-2·1099 양식 수령 시작\n• 1월 말~4월: VITA 무료 세금신고 운영\n• 4월 15일: 연방 세금신고 마감\n• 4월 15일: FBAR 마감 (FincEN 114)\n• 4월 15일 연장 신청 가능: Form 4868 (10월 15일까지 연장)\n\n• 분기별 예납세 (자영업): 4/15, 6/15, 9/15, 1/15\n\n💡 WA주 소득세 없으므로 주세 신고 불필요!"
                    : "✅ Annual tax calendar:\n\n• Early January: W-2 & 1099 forms arrive\n• Late Jan–April: VITA free tax filing open\n• April 15: Federal tax filing deadline\n• April 15: FBAR deadline (FinCEN 114)\n• Extension available: Form 4868 (extends to Oct 15)\n\n• Quarterly estimated taxes (self-employed): 4/15, 6/15, 9/15, 1/15\n\n💡 No WA state income tax return needed!",
                  tags: lang === "ko" ? ["세금일정", "4월15일", "연장신청"] : ["Tax Calendar", "April 15", "Extension"] },
              ].map((item, i) => <PlaceCard key={i} {...item} accentColor={accent} />)}
            </div>
            <div style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 14, padding: "14px 16px", marginTop: 12 }}>
              <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11, color: "#FB923C", marginBottom: 4 }}>💡 {lang === "ko" ? "세금신고 핵심 원칙" : "Key Tax Filing Principles"}</div>
              <div style={{ fontFamily: "Manrope,sans-serif", fontSize: 11, lineHeight: 1.8, color: "rgba(236,253,245,0.6)" }}>
                {lang === "ko"
                  ? "1. 소득이 있으면 신고 — 금액 작아도 의무\n2. VITA 무료 신고 먼저 확인 ($67K 이하)\n3. 해외 계좌 $10K+ → FBAR 별도 신고 필수\n4. 연장 신청은 납부 연장 아님 — 세금은 4/15까지 납부\n5. 복잡한 상황 → 반드시 한인 CPA 상담"
                  : "1. File if you have income — even small amounts are required\n2. Check VITA free filing first (under $67K)\n3. Foreign accounts $10K+ → FBAR filing required separately\n4. Extension ≠ payment extension — taxes still due by 4/15\n5. Complex situation → consult Korean CPA"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ── NAVIGATION & LAYOUT ───────────────────
   ═══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   BOTTOM NAVIGATION (6탭 — v4)
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   NAV ITEMS (3개로 축소)
───────────────────────────────────────── */
// 순서: 홈(기준점) → 검색(가장 자주) → 통역(긴급할 때) → 공유(가끔)
const NAV_ITEMS = [
  { id: "home",      icon: Home,          labelKo: "홈",   labelEn: "Home",   tab: 0 },
  { id: "settle",    icon: MapPin,        labelKo: "정착",  labelEn: "Settle", tab: 1 },
  { id: "food",      icon: Utensils,      labelKo: "맛집",  labelEn: "Food",   tab: 3 },
  { id: "help",      icon: LifeBuoy,      labelKo: "도움",  labelEn: "Help",   tab: 5 },
  { id: "more",      icon: Grid,          labelKo: "더보기", labelEn: "More",   tab: -1 },
];

/* ─────────────────────────────────────────
   DESKTOP SIDEBAR
───────────────────────────────────────── */
function DesktopSidebar({ activeTab, onNavigate }: { activeTab: number; onNavigate: (tab: number) => void }) {
  const { lang } = useI18n();
  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-64 lg:border-r"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "#1a2535", padding: "80px 16px 24px", zIndex: 30 }}>
      {/* 홈 버튼 — 항상 최상단 */}
      <button onClick={() => onNavigate(0)} style={{
        width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
        background: activeTab === 0 ? "rgba(242,153,74,0.18)" : "rgba(242,153,74,0.06)",
        color: activeTab === 0 ? "#F2994A" : "rgba(242,153,74,0.7)",
        fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 14,
        marginBottom: 8, transition: "all 0.2s ease",
        borderLeft: activeTab === 0 ? "3px solid #F2994A" : "3px solid transparent",
      }}>
        <span style={{ fontSize: 18 }}>🏠</span>
        {lang === "ko" ? "홈" : "Home"}
      </button>

      <div style={{ height: 0.5, background: "rgba(255,255,255,0.08)", marginBottom: 8 }} />

      <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 16, color: "#C9A227", marginBottom: 16, letterSpacing: "1px", paddingLeft: 4 }}>
        HEBRONGUIDE
      </div>
      {QUICK_MENU.map((item, i) => (
        <button key={i} onClick={() => onNavigate(item.tab)} style={{
          width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer",
          background: activeTab === item.tab ? "rgba(242,153,74,0.12)" : "transparent",
          color: activeTab === item.tab ? "#F2994A" : "rgba(236,253,245,0.55)",
          fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 600, fontSize: 13,
          marginBottom: 2, transition: "all 0.2s ease",
          borderLeft: activeTab === item.tab ? "3px solid #F2994A" : "3px solid transparent",
        }}>
          <span style={{ fontSize: 18 }}>{item.emoji}</span>
          {lang === "ko" ? item.labelKo : item.labelEn}
        </button>
      ))}
    </aside>
  );
}

/* ─────────────────────────────────────────
   BOTTOM NAV (3개 버튼)
───────────────────────────────────────── */
/* ─────────────────────────────────────────
   상황별 영어 표현집
───────────────────────────────────────── */
const PHRASE_BOOK = [
  {
    emoji: "🍽️", situKo: "식당에서 주문할 때", situEn: "Ordering at a restaurant",
    phrases: [
      { ko: "이거 주세요",                       en: "I'll have this one, please.",           pron: "아일 해브 디스 원, 플리즈" },
      { ko: "맵지 않게 해주세요",                 en: "Can you make it not spicy, please?",    pron: "캔 유 메이킷 낫 스파이시, 플리즈?" },
      { ko: "계산서 주세요",                      en: "Can I get the check, please?",          pron: "캔 아이 겟 더 첵, 플리즈?" },
      { ko: "포장해 주세요",                      en: "Can I get this to go?",                 pron: "캔 아이 겟 디스 투 고?" },
      { ko: "이거 알레르기가 있어요. 빼주세요",   en: "I'm allergic to this. Can you leave it out?", pron: "아임 얼러직 투 디스. 캔 유 리빗 아웃?" },
      { ko: "물 더 주세요",                       en: "Could I have more water, please?",      pron: "쿠다이 해브 모어 워터, 플리즈?" },
    ],
  },
  {
    emoji: "🏥", situKo: "병원·응급실에서", situEn: "At the hospital / clinic",
    phrases: [
      { ko: "여기가 아파요",                      en: "It hurts here.",                        pron: "잇 허츠 히어" },
      { ko: "숨쉬기가 힘들어요",                  en: "I'm having trouble breathing.",         pron: "아임 해빙 트러블 브리딩" },
      { ko: "한국어 통역사 불러주세요",            en: "Can you get a Korean interpreter?",     pron: "캔 유 겟 어 코리안 인터프리터?" },
      { ko: "이 약 처방받을 수 있나요?",           en: "Can I get a prescription for this?",   pron: "캔 아이 겟 어 프리스크립션 포 디스?" },
      { ko: "보험이 있어요",                      en: "I have insurance.",                     pron: "아이 해브 인슈어런스" },
      { ko: "언제부터 이 증상이 시작됐어요",       en: "This started about [3 days] ago.",      pron: "디스 스타티드 어바웃 쓰리 데이즈 어고" },
    ],
  },
  {
    emoji: "🗺️", situKo: "길 물어볼 때", situEn: "Asking for directions",
    phrases: [
      { ko: "여기 어떻게 가요?",                  en: "How do I get to [place]?",              pron: "하우 두 아이 겟 투 [플레이스]?" },
      { ko: "걸어서 얼마나 걸려요?",              en: "How far is it on foot?",                pron: "하우 파 이즈 잇 온 풋?" },
      { ko: "버스 어디서 타요?",                  en: "Where do I catch the bus?",             pron: "웨어 두 아이 캐치 더 버스?" },
      { ko: "길을 잃었어요",                      en: "I'm lost.",                             pron: "아임 로스트" },
      { ko: "지도에서 여기가 어디예요?",           en: "Can you show me where we are on the map?", pron: "캔 유 쇼우 미 웨어 위 아 온 더 맵?" },
    ],
  },
  {
    emoji: "🏠", situKo: "집 구할 때 (집주인·부동산)", situEn: "Finding housing",
    phrases: [
      { ko: "방 보러 왔어요",                     en: "I'm here to see the apartment.",        pron: "아임 히어 투 씨 디 아파트먼트" },
      { ko: "한 달 렌트가 얼마예요?",              en: "How much is the monthly rent?",         pron: "하우 머치 이즈 더 먼쓸리 렌트?" },
      { ko: "보증금은 얼마예요?",                 en: "How much is the security deposit?",     pron: "하우 머치 이즈 더 시큐리티 디파짓?" },
      { ko: "언제부터 입주 가능해요?",             en: "When is it available to move in?",      pron: "웬 이즈 잇 어베일러블 투 무브 인?" },
      { ko: "신용 이력이 없어요",                 en: "I don't have a credit history yet.",    pron: "아이 돈 해브 어 크레딧 히스토리 옛" },
    ],
  },
  {
    emoji: "🛒", situKo: "마트·쇼핑할 때", situEn: "Shopping / grocery store",
    phrases: [
      { ko: "이거 어디 있어요?",                  en: "Where can I find [item]?",              pron: "웨어 캔 아이 파인드 [아이템]?" },
      { ko: "환불하고 싶어요",                    en: "I'd like to return this.",              pron: "아이드 라이크 투 리턴 디스" },
      { ko: "영수증 주세요",                      en: "Can I have a receipt, please?",         pron: "캔 아이 해브 어 리씻, 플리즈?" },
      { ko: "이거 세일 중인가요?",                en: "Is this on sale?",                      pron: "이즈 디스 온 세일?" },
      { ko: "봉투 주세요",                        en: "Can I get a bag, please?",              pron: "캔 아이 겟 어 백, 플리즈?" },
    ],
  },
  {
    emoji: "🚗", situKo: "경찰 단속·교통위반", situEn: "Police traffic stop",
    phrases: [
      { ko: "면허증 여기 있습니다",               en: "Here is my driver's license.",          pron: "히어 이즈 마이 드라이버즈 라이선스" },
      { ko: "한국에서 왔어요",                    en: "I'm from Korea.",                       pron: "아임 프롬 코리아" },
      { ko: "영어가 서툴러요",                    en: "My English is limited.",                pron: "마이 잉글리쉬 이즈 리미티드" },
      { ko: "제가 뭘 잘못했나요?",               en: "What did I do wrong?",                  pron: "왓 디드 아이 두 롱?" },
      { ko: "통역사를 불러주세요",                en: "Please call an interpreter.",           pron: "플리즈 콜 언 인터프리터" },
    ],
  },
  {
    emoji: "💼", situKo: "직장 면접·직장에서", situEn: "Job interview / workplace",
    phrases: [
      { ko: "저는 한국에서 [직종]으로 일했어요",  en: "I worked as a [job title] in Korea.",   pron: "아이 워크트 애즈 어 [잡 타이틀] 인 코리아" },
      { ko: "영어가 완벽하지 않아요",             en: "My English isn't perfect yet.",         pron: "마이 잉글리쉬 이즌트 퍼펙트 옛" },
      { ko: "다시 한 번 말씀해 주시겠어요?",      en: "Could you please say that again?",      pron: "쿠쥬 플리즈 세이 댓 어겐?" },
      { ko: "좀 더 천천히 말씀해 주세요",         en: "Could you speak a little slower, please?", pron: "쿠쥬 스피크 어 리틀 슬로워, 플리즈?" },
      { ko: "언제 결과를 알 수 있나요?",          en: "When can I expect to hear back?",       pron: "웬 캔 아이 익스펙트 투 히어 백?" },
    ],
  },
  {
    emoji: "🏫", situKo: "학교·자녀 교육", situEn: "School / children's education",
    phrases: [
      { ko: "아이 등록하러 왔어요",               en: "I'm here to enroll my child.",          pron: "아임 히어 투 인롤 마이 차일드" },
      { ko: "ESL 수업이 있나요?",                 en: "Is there an ESL class available?",      pron: "이즈 데어 언 이에스엘 클래스 어베일러블?" },
      { ko: "방과 후 프로그램이 있나요?",         en: "Are there after-school programs?",      pron: "아 데어 애프터스쿨 프로그램스?" },
      { ko: "선생님과 면담하고 싶어요",           en: "I'd like to schedule a meeting with the teacher.", pron: "아이드 라이크 투 스케줄 어 미팅 윗 더 티처" },
      { ko: "한국어 통역사가 있나요?",            en: "Do you have a Korean interpreter?",     pron: "두 유 해브 어 코리안 인터프리터?" },
    ],
  },
];

function PhraseBook({ lang, speakFn }: { lang: string; speakFn: (text: string, lang: string) => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div style={{ padding: "0 16px 20px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingTop: 4 }}>
        <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.08)" }} />
        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
          📚 {lang === "ko" ? "상황별 영어 표현집" : "Situation Phrases"}
        </div>
        <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>

      {/* 상황 카드 목록 */}
      {PHRASE_BOOK.map((situ, si) => (
        <div key={si} style={{ marginBottom: 8, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* 상황 헤더 (토글) */}
          <button onClick={() => setOpenIdx(openIdx === si ? null : si)}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "none", background: openIdx === si ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{situ.emoji}</span>
              <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 13, color: "#F8FAFC" }}>
                {lang === "ko" ? situ.situKo : situ.situEn}
              </span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{openIdx === si ? "▲" : "▼"}</span>
          </button>

          {/* 문장 목록 */}
          {openIdx === si && (
            <div style={{ background: "rgba(0,0,0,0.2)" }}>
              {situ.phrases.map((p, pi) => (
                <div key={pi} style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>{p.ko}</div>
                    <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 14, color: "#F8FAFC", lineHeight: 1.4 }}>{p.en}</div>
                    <div style={{ fontSize: 10, color: "#C9A227", marginTop: 2 }}>{p.pron}</div>
                  </div>
                  <button onClick={() => speakFn(p.en, "en-US")}
                    style={{ border: "none", background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "5px 10px", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", flexShrink: 0, marginTop: 2 }}>
                    🔊
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   음성 검색 탭 — 한국어로 말하면 찾아줌
───────────────────────────────────────── */
const VS_APP_ROUTES = [
  { kw:["식당","맛집","카페","음식","bbq","갈비","치킨","밥","커피"], tab:3, ko:"맛집", emoji:"🍽️" },
  { kw:["정착","ssn","면허","운전","은행","계좌","비자","이민"],       tab:1, ko:"정착", emoji:"🛬" },
  { kw:["교회","예배","목장","성경","신앙","가정교회"],                tab:2, ko:"교회", emoji:"⛪" },
  { kw:["병원","의사","의료","약","치과","아파","보험","응급"],        tab:5, ko:"도움·의료", emoji:"🆘" },
  { kw:["취업","일자리","채용","직장","알바","이력서","면접"],         tab:6, ko:"취업", emoji:"💼" },
  { kw:["학교","교육","학원","대학","유학","학군"],                   tab:7, ko:"교육", emoji:"🎓" },
  { kw:["생활비","렌트","월세","물가","환율","기름","코스트코","마트"], tab:8, ko:"생활비·쇼핑", emoji:"💰" },
  { kw:["관광","여행","명소","스페이스니들","레이니어","폭포","페리"],  tab:4, ko:"관광", emoji:"🗺️" },
];
const VS_CITY_ROUTES = [
  { kw:["달라스","texas","텍사스"],    url:"/dallas/",   name:"HebronGuide Dallas",     emoji:"🤠" },
  { kw:["샌프란","sf","bay area"],    url:"/sf/",       name:"HebronGuide SF",          emoji:"🌉" },
  { kw:["뉴욕","new york","ny"],      url:"/newyork/",  name:"HebronGuide New York",    emoji:"🗽" },
  { kw:["내쉬빌","nashville"],        url:"/nashville/",name:"HebronGuide Nashville",   emoji:"🎵" },
  { kw:["보스턴","boston"],           url:"/boston/",   name:"HebronGuide Boston",      emoji:"🦞" },
  { kw:["LA","로스앤젤레스","엘에이"], url:"/la/",       name:"HebronGuide LA",          emoji:"🎬" },
];
// 가격비교 키워드
const PRICE_COMPARE: Record<string, { items: {store:string;price:string;note:string}[] }> = {
  "쌀":        { items:[{store:"H-Mart 20lb",price:"~$28",note:""},{store:"Costco 50lb",price:"~$45",note:"↓ lb당 40% 저렴"},{store:"99 Ranch 25lb",price:"~$22",note:"↓ lb당 25% 저렴"}] },
  "우유":      { items:[{store:"H-Mart 1gal",price:"~$5.50",note:""},{store:"Costco 2gal",price:"~$7.99",note:"↓ 30% 저렴"},{store:"WinCo 1gal",price:"~$3.89",note:"↓ 30% 저렴"}] },
  "계란":      { items:[{store:"H-Mart 12ea",price:"~$4.99",note:""},{store:"Costco 24ea",price:"~$7.49",note:"↓ 25% 저렴"},{store:"WinCo 12ea",price:"~$3.29",note:"↓ 35% 저렴"}] },
  "기름값":    { items:[{store:"일반 주유소",price:"~$4.20/gal",note:""},{store:"Costco Gas",price:"~$3.90/gal",note:"↓ 30¢ 저렴"},{store:"GasBuddy 앱",price:"근처 최저가",note:"실시간 비교"}] },
  "두부":      { items:[{store:"H-Mart",price:"~$2.49",note:""},{store:"99 Ranch",price:"~$1.79",note:"↓ 28% 저렴"},{store:"WinCo",price:"~$1.59",note:"↓ 36% 저렴"}] },
};

function VoiceSearchTab({ lang, onNavigate, onClose }: { lang:string; onNavigate:(tab:number)=>void; onClose:()=>void }) {
  const [query,setQuery]           = useState("");
  const [isListening,setIsListening] = useState(false);
  const [result,setResult]         = useState<null|{type:string;[k:string]:any}>(null);
  const [textMode,setTextMode]     = useState(false);
  const [textInput,setTextInput]   = useState("");
  const recognitionRef             = useRef<any>(null);

  const detectIntent = (text:string) => {
    const lo = text.toLowerCase().replace(/\s+/g,"");
    // 가격비교
    const priceKey = Object.keys(PRICE_COMPARE).find(k => lo.includes(k));
    if (priceKey && (lo.includes("비교") || lo.includes("얼마") || lo.includes("가격") || lo.includes("싸")))
      return { type:"price", key:priceKey, ...PRICE_COMPARE[priceKey] };
    // 도시 라우팅
    const city = VS_CITY_ROUTES.find(r => r.kw.some(k => lo.includes(k)));
    if (city) return { type:"city", ...city };
    // 앱 내 탭
    const tab = VS_APP_ROUTES.find(r => r.kw.some(k => lo.includes(k)));
    if (tab) return { type:"tab", ...tab };
    return { type:"search", query:text };
  };

  const process = (text:string) => { setQuery(text); setResult(detectIntent(text)); };

  const listen = () => {
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SR){alert(lang==="ko"?"Chrome 브라우저에서 사용해주세요":"Please use Chrome");return;}
    setQuery("");setResult(null);setIsListening(true);
    const rec=new SR(); rec.lang="ko-KR"; rec.interimResults=false; recognitionRef.current=rec;
    rec.onresult=(e:any)=>{setIsListening(false);process(e.results[0][0].transcript);};
    rec.onerror=()=>setIsListening(false);
    rec.onend=()=>setIsListening(false);
    rec.start();
  };

  const q = query||textInput;
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(q+" Seattle WA")}`;
  const aiUrl   = `https://www.perplexity.ai/search?q=${encodeURIComponent(q+" 시애틀")}`;

  return (
    <div style={{padding:"0 16px 16px"}}>
      <div style={{textAlign:"center",marginBottom:14,fontSize:11,color:"rgba(255,255,255,0.4)",lineHeight:1.7}}>
        {lang==="ko"?"한국어로 말하거나 입력하세요\n앱에서 찾거나 지도·AI로 연결합니다":"Speak or type in Korean — we'll route to the right place"}
      </div>

      {/* 마이크 */}
      <button onClick={isListening?()=>{recognitionRef.current?.stop();setIsListening(false);}:listen}
        style={{width:"100%",border:"none",borderRadius:18,cursor:"pointer",padding:"18px 16px",marginBottom:8,
          background:isListening?"linear-gradient(135deg,#7C3AED,#A78BFA)":"linear-gradient(135deg,#1E3A5F,#1D4ED8)",
          boxShadow:isListening?"0 0 24px rgba(124,58,237,0.5)":"none",transition:"all 0.2s"}}>
        <div style={{fontSize:34,marginBottom:4}}>{isListening?"🔴":"🎤"}</div>
        <div style={{fontFamily:"Manrope,sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>
          {isListening?(lang==="ko"?"듣고 있어요... (탭해서 중지)":"Listening... tap to stop"):(lang==="ko"?"한국어로 말해서 검색":"Speak Korean to search")}
        </div>
        {!isListening&&<div style={{fontSize:10,color:"rgba(255,255,255,0.45)",marginTop:3}}>
          {lang==="ko"?"\"맛집 찾아줘\" \"SSN 어디서\" \"쌀 가격 비교\"":"\"find restaurant\" \"SSN office\" \"rice price compare\""}
        </div>}
      </button>

      {/* 텍스트 입력 */}
      <button onClick={()=>setTextMode(p=>!p)}
        style={{width:"100%",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,background:"rgba(255,255,255,0.04)",
          padding:"8px",cursor:"pointer",color:"rgba(255,255,255,0.45)",fontSize:11,marginBottom:8}}>
        ⌨️ {lang==="ko"?"직접 입력":"Type instead"}
      </button>
      {textMode&&(
        <div style={{display:"flex",gap:7,marginBottom:10}}>
          <input value={textInput} onChange={e=>setTextInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&textInput.trim())process(textInput.trim());}}
            placeholder={lang==="ko"?"예: 린우드 한식당 찾아줘, 쌀 가격 비교":"e.g. find Korean restaurant Lynnwood"}
            style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",
              borderRadius:10,padding:"9px 13px",color:"#F8FAFC",fontSize:12,outline:"none"}}/>
          <button onClick={()=>{if(textInput.trim())process(textInput.trim());}}
            style={{border:"none",borderRadius:10,background:"#1D4ED8",color:"#fff",padding:"0 14px",cursor:"pointer"}}>→</button>
        </div>
      )}

      {/* 인식 결과 표시 */}
      {q&&<div style={{marginBottom:10,background:"rgba(255,255,255,0.05)",borderRadius:10,padding:"8px 12px",
        fontFamily:"Manrope,sans-serif",fontWeight:700,fontSize:13,color:"rgba(255,255,255,0.8)"}}>
        🔎 "{q}"
      </div>}

      {/* 라우팅 결과 */}
      {result&&(
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {/* 가격 비교 */}
          {result.type==="price"&&(
            <div style={{background:"rgba(201,162,39,0.1)",border:"1px solid rgba(201,162,39,0.3)",borderRadius:14,padding:"12px 14px"}}>
              <div style={{fontFamily:"Manrope,sans-serif",fontWeight:800,fontSize:13,color:"#C9A227",marginBottom:8}}>
                💰 {q} {lang==="ko"?"가격 비교":"Price Comparison"}
              </div>
              {result.items.map((item:any,i:number)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"7px 0",borderBottom:i<result.items.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
                  <div style={{fontFamily:"Manrope,sans-serif",fontSize:12,color:"#ECFDF5"}}>{item.store}</div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"Manrope,sans-serif",fontWeight:700,fontSize:13,color:i>0?"#6EE7B7":"#F87171"}}>{item.price}</div>
                    {item.note&&<div style={{fontSize:9,color:"#6EE7B7"}}>{item.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* 앱 내 탭 이동 */}
          {result.type==="tab"&&(
            <button onClick={()=>{onNavigate(result.tab);onClose();}}
              style={{width:"100%",border:"none",borderRadius:14,cursor:"pointer",padding:"13px 16px",
                background:"linear-gradient(135deg,#059669,#10B981)",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>{result.emoji}</span>
              <div style={{textAlign:"left",flex:1}}>
                <div style={{fontFamily:"Manrope,sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>
                  {lang==="ko"?`HebronGuide ${result.ko} 탭으로 이동`:`Go to ${result.ko} section`}
                </div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:2}}>{lang==="ko"?"앱 내에서 바로 찾기":"Find directly in app"}</div>
              </div>
              <span style={{color:"#fff",fontSize:16}}>→</span>
            </button>
          )}
          {/* 도시 이동 */}
          {result.type==="city"&&(
            <a href={`https://hebronguide.com${result.url}`} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",
                background:"linear-gradient(135deg,#7C3AED,#A78BFA)",borderRadius:14,padding:"13px 16px"}}>
              <span style={{fontSize:22}}>{result.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"Manrope,sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>{result.name}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:2}}>{lang==="ko"?"해당 도시 가이드 열기":"Open city guide"}</div>
              </div>
              <span style={{color:"#fff",fontSize:16}}>→</span>
            </a>
          )}
          {/* 외부 검색 (항상 표시) */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,textDecoration:"none",
                background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"10px"}}>
              <span style={{fontSize:20}}>🗺️</span>
              <span style={{fontFamily:"Manrope,sans-serif",fontWeight:700,fontSize:11,color:"#ECFDF5"}}>Google Maps</span>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>지도에서 찾기</span>
            </a>
            <a href={aiUrl} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,textDecoration:"none",
                background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"10px"}}>
              <span style={{fontSize:20}}>🤖</span>
              <span style={{fontFamily:"Manrope,sans-serif",fontWeight:700,fontSize:11,color:"#ECFDF5"}}>Perplexity AI</span>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>AI가 답해요</span>
            </a>
          </div>
        </div>
      )}

      {/* 예시 문장 */}
      {!q&&!isListening&&(
        <div style={{marginTop:10}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",marginBottom:6,textAlign:"center"}}>
            {lang==="ko"?"💡 이렇게 말해보세요":"💡 Try these"}
          </div>
          {["린우드 한식당 찾아줘","SSN 어디서 신청해?","쌀 가격 비교","달라스 한인 교회","근처 타코 맛있는 곳"].map((ex,i)=>(
            <button key={i} onClick={()=>process(ex)}
              style={{display:"block",width:"100%",textAlign:"left",border:"none",
                background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 11px",marginBottom:4,
                color:"rgba(255,255,255,0.5)",fontSize:10,cursor:"pointer"}}>
              "{ex}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   현장 통역 모달 — 3탭 (검색·통역·표현집)
───────────────────────────────────────── */
function TranslateModal({ onClose, lang, onNavigate }: { onClose:()=>void; lang:string; onNavigate?:(tab:number)=>void }) {
  const [modalTab, setModalTab] = useState<"search"|"interpret"|"phrases">("search");
  /* ── 지원 언어 목록 (한국어는 고정, 상대방 언어 선택 가능) ── */
  const FOREIGN_LANGS = [
    { code: "auto", label: "Auto-detect", labelKo: "자동 감지", flag: "🌐", speechLang: "", color: "#C9A227", bg: "linear-gradient(135deg,#3B2700,#92610A)", bgActive: "linear-gradient(135deg,#92610A,#C9A227)", glow: "rgba(201,162,39,0.6)" },
    { code: "en",   label: "English",     labelKo: "영어",     flag: "🇺🇸", speechLang: "en-US", color: "#1D4ED8", bg: "linear-gradient(135deg,#1E3A5F,#1D4ED8)", bgActive: "linear-gradient(135deg,#1D4ED8,#3B82F6)", glow: "rgba(59,130,246,0.55)"  },
    { code: "es",   label: "Español",     labelKo: "스페인어",  flag: "🇪🇸", speechLang: "es-ES", color: "#B91C1C", bg: "linear-gradient(135deg,#4C0519,#B91C1C)", bgActive: "linear-gradient(135deg,#B91C1C,#EF4444)", glow: "rgba(239,68,68,0.55)"    },
    { code: "zh",   label: "中文",        labelKo: "중국어",    flag: "🇨🇳", speechLang: "zh-CN", color: "#B45309", bg: "linear-gradient(135deg,#431407,#B45309)", bgActive: "linear-gradient(135deg,#B45309,#F59E0B)", glow: "rgba(245,158,11,0.55)"  },
    { code: "ja",   label: "日本語",      labelKo: "일본어",    flag: "🇯🇵", speechLang: "ja-JP", color: "#6D28D9", bg: "linear-gradient(135deg,#2E1065,#6D28D9)", bgActive: "linear-gradient(135deg,#6D28D9,#A78BFA)", glow: "rgba(167,139,250,0.55)" },
    { code: "fr",   label: "Français",    labelKo: "프랑스어",  flag: "🇫🇷", speechLang: "fr-FR", color: "#0369A1", bg: "linear-gradient(135deg,#082F49,#0369A1)", bgActive: "linear-gradient(135deg,#0369A1,#38BDF8)", glow: "rgba(56,189,248,0.55)"  },
    { code: "de",   label: "Deutsch",     labelKo: "독일어",    flag: "🇩🇪", speechLang: "de-DE", color: "#374151", bg: "linear-gradient(135deg,#111827,#374151)", bgActive: "linear-gradient(135deg,#374151,#6B7280)", glow: "rgba(107,114,128,0.55)" },
    { code: "tl",   label: "Filipino",    labelKo: "필리핀어",  flag: "🇵🇭", speechLang: "tl-PH", color: "#0F766E", bg: "linear-gradient(135deg,#042F2E,#0F766E)", bgActive: "linear-gradient(135deg,#0F766E,#14B8A6)", glow: "rgba(20,184,166,0.55)"  },
    { code: "vi",   label: "Tiếng Việt",  labelKo: "베트남어",  flag: "🇻🇳", speechLang: "vi-VN", color: "#166534", bg: "linear-gradient(135deg,#052E16,#166534)", bgActive: "linear-gradient(135deg,#166534,#22C55E)", glow: "rgba(34,197,94,0.55)"   },
  ];

  const [selIdx, setSelIdx]           = useState(0);  // 선택된 외국어 인덱스 (기본: 영어)
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [original, setOriginal]       = useState("");
  const [translated, setTranslated]   = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeDir, setActiveDir]     = useState<"ko" | "foreign" | null>(null);
  const [errMsg, setErrMsg]           = useState("");
  const recognitionRef                = useRef<any>(null);
  const foreign                       = FOREIGN_LANGS[selIdx];

  /* 언어 변경 시 결과 초기화 */
  const changeLang = (idx: number) => {
    setSelIdx(idx); setShowLangPicker(false);
    setOriginal(""); setTranslated(""); setErrMsg("");
    recognitionRef.current?.stop();
    setIsListening(false); setActiveDir(null);
  };

  /* MyMemory 무료 번역 API */
  const translateText = async (text: string, from: string, to: string) => {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText as string;
    throw new Error("fail");
  };

  /* 음성 출력 */
  const speakText = (text: string, speechLang: string) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = speechLang; utt.rate = 0.88;
    window.speechSynthesis.speak(utt);
  };

  /* 음성 인식 */
  const startListening = (dir: "ko" | "foreign") => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErrMsg(lang === "ko" ? "⚠️ Chrome 브라우저에서 지원됩니다." : "⚠️ Requires Chrome browser.");
      return;
    }
    setOriginal(""); setTranslated(""); setErrMsg("");
    setActiveDir(dir); setIsListening(true);

    const rec = new SR();
    rec.lang = dir === "ko" ? "ko-KR" : foreign.speechLang;
    rec.interimResults = false;
    recognitionRef.current = rec;

    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;
      setOriginal(text);
      setIsListening(false); setIsTranslating(true);
      try {
        let fromCode: string, toCode: string, toSpeech: string;
        if (dir === "ko") {
          // 한국어 → 외국어 (auto이면 MyMemory가 자동 감지)
          fromCode = "ko";
          toCode   = foreign.code === "auto" ? "en" : foreign.code;  // auto 시 영어로 출력
          toSpeech = foreign.code === "auto" ? "en-US" : foreign.speechLang;
        } else {
          // 외국어 → 한국어 (auto이면 fromCode 생략 → MyMemory 자동 감지)
          fromCode = foreign.code === "auto" ? "autodetect" : foreign.code;
          toCode   = "ko";
          toSpeech = "ko-KR";
        }
        // MyMemory auto-detect: langpair=autodetect|ko
        const apiFrom = fromCode === "autodetect" ? "autodetect" : fromCode;
        const result  = await translateText(text, apiFrom, toCode);
        setTranslated(result);
        setIsTranslating(false);
        speakText(result, toSpeech);
      } catch {
        setIsTranslating(false);
        setErrMsg(lang === "ko" ? "번역 오류. 인터넷 확인 후 재시도." : "Translation error. Check connection.");
      }
    };
    rec.onerror = (e: any) => {
      setIsListening(false); setActiveDir(null);
      if (e.error !== "aborted")
        setErrMsg(lang === "ko" ? "마이크 오류: " + e.error : "Mic error: " + e.error);
    };
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#0B1120", borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", maxHeight: "88dvh", paddingBottom: "env(safe-area-inset-bottom,0px)" }} onClick={e => e.stopPropagation()}>

        {/* ── 핸들바 + 헤더 (항상 상단 고정) ── */}
        <div style={{ flexShrink: 0, background: "#0B1120", borderRadius: "24px 24px 0 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {/* 핸들바 — "아래로 스와이프하면 닫힘" 시각적 힌트 */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
          </div>

          {/* 타이틀 + 닫기 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 12px" }}>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 17, color: "#F8FAFC" }}>
              {modalTab === "search"    ? "🔍 " + (lang === "ko" ? "음성 검색" : "Voice Search")
               : modalTab === "interpret" ? "🌐 " + (lang === "ko" ? "현장 통역" : "Live Interpreter")
               : "📚 " + (lang === "ko" ? "상황별 표현" : "Phrase Book")}
            </div>
            <button onClick={onClose} style={{ border: "none", background: "rgba(255,255,255,0.09)", borderRadius: "50%", width: 36, height: 36, fontSize: 18, cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* ── 3탭 선택 바 ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, padding: "0 16px 14px" }}>
            {(["search","interpret","phrases"] as const).map((t) => {
              const labels: Record<string, {ko:string;en:string}> = {
                search:    {ko:"🔍 음성검색", en:"🔍 Search"},
                interpret: {ko:"🌐 현장통역", en:"🌐 Interpret"},
                phrases:   {ko:"📚 표현집",   en:"📚 Phrases"},
              };
              const active = modalTab === t;
              return (
                <button key={t} onClick={() => setModalTab(t)}
                  style={{ border: "none", borderRadius: 12, padding: "8px 6px", cursor: "pointer",
                    background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
                    color: active ? "#F8FAFC" : "rgba(255,255,255,0.45)",
                    fontFamily: "Manrope,sans-serif", fontWeight: active ? 700 : 500, fontSize: 11,
                    borderBottom: active ? "2px solid #F2994A" : "2px solid transparent",
                    transition: "all 0.15s" }}>
                  {lang === "ko" ? labels[t].ko : labels[t].en}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 탭 콘텐츠 (스크롤 영역) ── */}
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        {modalTab === "search" && (
          <VoiceSearchTab lang={lang} onNavigate={onNavigate ?? (() => {})} onClose={onClose} />
        )}

        {modalTab !== "search" && (<>

        {/* ── 언어 선택 바 (한국어 고정 | 외국어 선택) ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 12px" }}>
          {/* 한국어 고정 뱃지 */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "5px 12px" }}>
            <span style={{ fontSize: 14 }}>🇰🇷</span>
            <span style={{ color: "#F8FAFC", fontSize: 12, fontWeight: 600 }}>한국어</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginLeft: 2 }}>고정</span>
          </div>

          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}>⇌</div>

          {/* 외국어 선택 버튼 */}
          <button onClick={() => setShowLangPicker(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, background: `rgba(${foreign.color},0.12)`, border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 20, padding: "5px 12px", cursor: "pointer", flex: 1 }}>
            <span style={{ fontSize: 14 }}>{foreign.flag}</span>
            <span style={{ color: "#F8FAFC", fontSize: 12, fontWeight: 600 }}>{lang === "ko" ? foreign.labelKo : foreign.label}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginLeft: "auto" }}>▾ {lang === "ko" ? "변경" : "change"}</span>
          </button>
        </div>

        {/* ── 언어 선택 드롭다운 ── */}
        {showLangPicker && (
          <div style={{ margin: "0 16px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
            {FOREIGN_LANGS.map((l, i) => (
              <button key={l.code} onClick={() => changeLang(i)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", border: "none", background: i === selIdx ? "rgba(255,255,255,0.1)" : "transparent", padding: "10px 14px", cursor: "pointer", borderBottom: i < FOREIGN_LANGS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span style={{ fontSize: 18 }}>{l.flag}</span>
                <span style={{ color: "#F8FAFC", fontSize: 13, fontWeight: i === selIdx ? 700 : 400 }}>{lang === "ko" ? l.labelKo : l.label}</span>
                {i === selIdx && <span style={{ marginLeft: "auto", color: "#34D399", fontSize: 14 }}>✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* ── 번역 결과 영역 ── */}
        <div style={{ margin: "0 16px", minHeight: 140, background: "rgba(255,255,255,0.04)", borderRadius: 18, padding: "16px", border: "1px solid rgba(255,255,255,0.07)" }}>
          {!original && !isListening && !isTranslating && !errMsg && (
            <div style={{ textAlign: "center", paddingTop: 24 }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>🎙️</div>
              <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 13, lineHeight: 1.7 }}>
                {lang === "ko"
                  ? `한국어 또는 ${foreign.labelKo}로 말하세요`
                  : `Speak Korean or ${foreign.label}`}
              </div>
            </div>
          )}

          {isListening && (
            <div style={{ textAlign: "center", paddingTop: 14 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🎤</div>
              <div style={{ color: activeDir === "ko" ? "#60A5FA" : "#34D399", fontWeight: 700, fontSize: 15 }}>
                {activeDir === "ko" ? "한국어로 말하세요..." : foreign.code === "auto" ? "아무 언어로나 말하세요..." : `Speak in ${foreign.label}...`}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 5 }}>
                {activeDir === "ko"
                  ? (foreign.code === "auto" ? "→ 자동 번역" : `→ ${lang === "ko" ? foreign.labelKo : foreign.label}로 번역`)
                  : (foreign.code === "auto" ? "→ 언어 자동 감지 후 한국어 번역" : "→ 한국어로 번역됩니다")}
              </div>
              <button onClick={stopListening} style={{ marginTop: 12, border: "none", background: "rgba(248,113,113,0.15)", borderRadius: 20, padding: "5px 16px", color: "#F87171", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                ⏹ {lang === "ko" ? "중지" : "Stop"}
              </button>
            </div>
          )}

          {errMsg && <div style={{ color: "#F87171", fontSize: 13, textAlign: "center", paddingTop: 26, lineHeight: 1.5 }}>{errMsg}</div>}

          {original && !isListening && (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>
                {activeDir === "ko" ? "🇰🇷 말한 내용" : `${foreign.flag} What was said`}
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.55, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
                {original}
              </div>
              {isTranslating
                ? <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>번역 중... ✦</div>
                : translated && (
                  <div>
                    <div style={{ fontSize: 11, color: "#34D399", marginBottom: 5 }}>
                      {activeDir === "ko" ? `${foreign.flag} ${lang === "ko" ? foreign.labelKo : foreign.label}` : "🇰🇷 한국어 번역"}
                    </div>
                    <div style={{ color: "#F8FAFC", fontSize: 22, fontWeight: 800, lineHeight: 1.38, fontFamily: "Manrope,sans-serif" }}>
                      {translated}
                    </div>
                    <button onClick={() => speakText(translated, activeDir === "ko" ? foreign.speechLang : "ko-KR")}
                      style={{ marginTop: 9, border: "none", background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 14px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>
                      🔊 {lang === "ko" ? "다시 듣기" : "Replay"}
                    </button>
                  </div>
                )
              }
            </div>
          )}
        </div>

        {/* ── 두 개의 큰 버튼 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "12px 16px 8px" }}>
          {/* 한국어 버튼 (고정) */}
          <button
            onClick={() => isListening && activeDir === "ko" ? stopListening() : startListening("ko")}
            disabled={isListening && activeDir === "foreign"}
            style={{ border: "none", borderRadius: 18, cursor: "pointer",
              background: isListening && activeDir === "ko"
                ? "linear-gradient(135deg,#1D4ED8,#3B82F6)"
                : "linear-gradient(135deg,#1E3A5F,#1D4ED8)",
              padding: "18px 10px",
              opacity: isListening && activeDir === "foreign" ? 0.35 : 1,
              transition: "all 0.2s",
              boxShadow: isListening && activeDir === "ko" ? "0 0 28px rgba(59,130,246,0.55)" : "none",
            }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🇰🇷</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "Manrope,sans-serif", lineHeight: 1.3 }}>
              {isListening && activeDir === "ko" ? "⏹ 중지" : "한국어로\n말하기"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 10, marginTop: 4 }}>
              KO → {lang === "ko" ? foreign.labelKo : foreign.label}
            </div>
          </button>

          {/* 외국어 버튼 (선택 가능) */}
          <button
            onClick={() => isListening && activeDir === "foreign" ? stopListening() : startListening("foreign")}
            disabled={isListening && activeDir === "ko"}
            style={{ border: "none", borderRadius: 18, cursor: "pointer",
              background: isListening && activeDir === "foreign" ? foreign.bgActive : foreign.bg,
              padding: "18px 10px",
              opacity: isListening && activeDir === "ko" ? 0.35 : 1,
              transition: "all 0.2s",
              boxShadow: isListening && activeDir === "foreign" ? `0 0 28px ${foreign.glow}` : "none",
            }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{foreign.flag}</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "Manrope,sans-serif", lineHeight: 1.3 }}>
              {isListening && activeDir === "foreign" ? "⏹ Stop" : `Speak\n${foreign.label}`}
            </div>
            <div style={{ color: "rgba(255,255,255,0.42)", fontSize: 10, marginTop: 4 }}>
              {lang === "ko" ? foreign.labelKo : foreign.label} → 한국어
            </div>
          </button>
        </div>

        {/* ── 팁 ── */}
        <div style={{ padding: "6px 16px 6px" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, lineHeight: 1.6 }}>
              💡 {lang === "ko"
                ? "상대방에게 화면을 보여주거나 스피커로 들려주세요\n식당 · 병원 · 상점 · 관공서 어디서나 사용 가능"
                : "Show screen or use speaker · Works anywhere"}
            </div>
          </div>
        </div>

        {/* ── 상황별 영어 표현집 (표현집 탭에서만) ── */}
        {modalTab === "phrases" && (
          <PhraseBook lang={lang} speakFn={(text: string, speechLang: string) => {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(text);
            utt.lang = speechLang; utt.rate = 0.85;
            window.speechSynthesis.speak(utt);
          }} />
        )}
        </>) /* ── end modalTab !== "search" ── */}
        </div> {/* ── 스크롤 영역 끝 ── */}

        {/* ── 하단 닫기 버튼 — 항상 표시, 엄지손가락 위치 ── */}
        <div style={{
          flexShrink: 0,
          padding: "12px 16px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "#0B1120",
        }}>
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "14px", border: "none", borderRadius: 14,
              background: "rgba(255,255,255,0.09)",
              color: "#F8FAFC", fontSize: 15, fontWeight: 700,
              fontFamily: "Manrope, sans-serif",
              cursor: "pointer", letterSpacing: "-0.3px",
              transition: "background 0.15s",
            }}
            onTouchStart={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            onTouchEnd={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
          >
            {lang === "ko" ? "✕  닫기" : "✕  Close"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   스마트 공유 모달 — 탭별 맞춤 메시지 + 멀티 SNS
───────────────────────────────────────── */

// 탭별 공유 콘텐츠 정의
const SHARE_CONTEXTS: Record<number, { emoji: string; labelKo: string; labelEn: string; textKo: string; textEn: string; tags: string }> = {
  0: { emoji: "🏠", labelKo: "홈", labelEn: "Home",
    textKo: "시애틀 Korean American 플랫폼 🇺🇸\n정착부터 투표·법률·한국학교·다민족 커뮤니티까지\n이민자에서 Korean American으로 — 함께 성장해요 👇",
    textEn: "Seattle Korean American Platform 🇺🇸\nFrom settlement to voting, legal aid, Korean schools & multicultural community\nGrow from newcomer to Korean American — together 👇",
    tags: "#KoreanAmerican #시애틀한인 #HebronGuide" },
  1: { emoji: "🛬", labelKo: "정착", labelEn: "Settlement",
    textKo: "시애틀 정착 완벽 가이드 🛬\nSSN·운전면허·비자·세금·법률·한국학교까지\n새로 오신 분들께 꼭 공유해 주세요 👇",
    textEn: "Complete Seattle Korean American guide 🛬\nSSN, license, visa, taxes, legal aid, Korean schools\nShare with every new arrival 👇",
    tags: "#시애틀정착 #KoreanAmerican #HebronGuide" },
  2: { emoji: "⛪", labelKo: "교회", labelEn: "Church",
    textKo: "시애틀 한인교회 정보 ⛪\n가정교회 중심으로 검증된 교회 정보\n믿을 수 있는 커뮤니티를 찾고 계신다면 👇",
    textEn: "Korean churches in Seattle ⛪\nVerified church info, house church communities\nLooking for a trusted community? 👇",
    tags: "#시애틀한인교회 #가정교회 #HebronGuide" },
  3: { emoji: "🍽️", labelKo: "맛집", labelEn: "Food",
    textKo: "시애틀 한인 검증 맛집 TOP 5 🍽️\n150개 이상 중 엄선한 진짜 맛집\n여기는 정말 맛있어요! 👇",
    textEn: "Seattle's top verified Korean restaurants 🍽️\nHandpicked from 150+ options\nThese are genuinely delicious! 👇",
    tags: "#시애틀맛집 #한식 #KoreanFood #HebronGuide" },
  4: { emoji: "🗺️", labelKo: "관광", labelEn: "Tourism",
    textKo: "시애틀 관광 명소 완벽 정리 🗺️\n자연·문화·야경·액티비티 총망라\n시애틀 방문 계획이라면 꼭 보세요 👇",
    textEn: "Seattle's best attractions 🗺️\nNature, culture, nightviews & activities\nMust-see before your Seattle trip 👇",
    tags: "#시애틀관광 #Seattle #여행 #HebronGuide" },
  5: { emoji: "🆘", labelKo: "도움·긴급", labelEn: "Help & Emergency",
    textKo: "시애틀 한인 긴급 연락처 모음 🆘\n병원·총영사관·법률·가스누출 등\n셀폰에 저장해 두세요! 👇",
    textEn: "Seattle emergency contacts for Koreans 🆘\nHospital, consulate, legal, utilities & more\nSave this now! 👇",
    tags: "#시애틀응급 #한인정보 #HebronGuide" },
  6: { emoji: "💼", labelKo: "취업", labelEn: "Jobs",
    textKo: "시애틀 취업 정보 💼\n아마존·마이크로소프트·보잉·한인 업체\n취업 비자 경로까지 정리됐어요 👇",
    textEn: "Seattle jobs for Koreans 💼\nAmazon, Microsoft, Boeing & Korean businesses\nVisa pathways included 👇",
    tags: "#시애틀취업 #테크잡 #HebronGuide" },
  7: { emoji: "🎓", labelKo: "교육", labelEn: "Education",
    textKo: "시애틀 교육 정보 🎓\n공립학교·한국어학교·SAT·대학 진학\n자녀 교육 고민 중이시라면 👇",
    textEn: "Seattle education guide 🎓\nPublic schools, Korean schools, SAT & college\nFor parents planning ahead 👇",
    tags: "#시애틀교육 #한인학교 #HebronGuide" },
  8: { emoji: "💰", labelKo: "생활비", labelEn: "Cost of Living",
    textKo: "시애틀 실제 생활비 정보 💰\n렌트·기름값·환율·교통비 실시간 업데이트\n이사 전 꼭 확인하세요 👇",
    textEn: "Real Seattle cost of living 💰\nRent, gas, exchange rate & transit — updated daily\nCheck before you move 👇",
    tags: "#시애틀생활비 #렌트 #HebronGuide" },
};

function ChatShareModal({ onClose, lang, activeNav = 0 }: { onClose: () => void; lang: string; activeNav?: number }) {
  const appUrl   = "https://hebronguide.com/seattle/";
  const ctx      = SHARE_CONTEXTS[activeNav] ?? SHARE_CONTEXTS[0];
  const bodyText = lang === "ko" ? ctx.textKo : ctx.textEn;
  const fullMsg  = `${bodyText}\n\n📱 HebronGuide — hebronguide.com/seattle\n${ctx.tags}`;

  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(fullMsg + "\n" + appUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: `HebronGuide Seattle — ${lang === "ko" ? ctx.labelKo : ctx.labelEn}`, text: fullMsg, url: appUrl }).catch(() => {});
    } else {
      copy();
    }
    onClose();
  };

  const encoded   = encodeURIComponent(fullMsg + "\n" + appUrl);
  const encodedUrl = encodeURIComponent(appUrl);

  // Instagram/TikTok: 텍스트 복사 후 앱 열기 (웹 직접 공유 불가)
  const openWithCopy = (appUrl2: string) => {
    navigator.clipboard?.writeText(fullMsg + "\n" + appUrl).then(() => {
      window.open(appUrl2, "_blank");
    }).catch(() => {
      window.open(appUrl2, "_blank");
    });
  };

  // SNS 플랫폼 목록
  const platforms = [
    // 1행: 가장 자주 쓰는 것
    { icon: "💬", label: "카카오톡", sub: lang === "ko" ? "한국인 필수" : "Korean #1", color: "#3A1D1D", bg: "#FEF9C3",
      action: () => {
        // 카카오톡 딥링크 → 실패 시 웹 공유
        const kakaoUrl = `kakaotalk://msg/send?text=${encoded}`;
        const fallback = `https://story.kakao.com/share?url=${encodedUrl}&text=${encodeURIComponent(fullMsg)}`;
        try { window.location.href = kakaoUrl; setTimeout(() => window.open(fallback, "_blank"), 1500); }
        catch { window.open(fallback, "_blank"); }
      }
    },
    { icon: "💚", label: "WhatsApp", sub: lang === "ko" ? "글로벌 20억+" : "2B+ users", color: "#128C7E", bg: "#F0FFF4",
      href: `https://wa.me/?text=${encoded}` },
    { icon: "📸", label: "Instagram", sub: lang === "ko" ? "텍스트 복사 후 앱 열기" : "Copy → paste in app", color: "#E1306C", bg: "#FFF0F5",
      action: () => openWithCopy("https://www.instagram.com/") },
    { icon: "🎵", label: "TikTok", sub: lang === "ko" ? "텍스트 복사 후 앱 열기" : "Copy → paste in app", color: "#010101", bg: "#F5F5F5",
      action: () => openWithCopy("https://www.tiktok.com/") },
    // 2행: 추가 채널
    { icon: "📘", label: "Facebook", sub: "페이스북", color: "#1877F2", bg: "#EFF6FF",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(fullMsg)}` },
    { icon: "🐦", label: "X", sub: "트위터", color: "#000000", bg: "#F9FAFB",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(bodyText + "\n" + ctx.tags)}&url=${encodedUrl}` },
    { icon: "📧", label: lang === "ko" ? "이메일" : "Email", sub: "Gmail · Outlook", color: "#2563EB", bg: "#EFF6FF",
      href: `mailto:?subject=HebronGuide Seattle&body=${encodeURIComponent(fullMsg + "\n\n" + appUrl)}` },
    { icon: "🔗", label: lang === "ko" ? "링크 복사" : "Copy Link", sub: lang === "ko" ? "클립보드" : "Clipboard", color: "#64748B", bg: "#F8FAFC", action: copy },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.52)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", background: "#fff", borderRadius: "24px 24px 0 0", paddingBottom: "env(safe-area-inset-bottom,16px)", boxShadow: "0 -8px 48px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>

        {/* ── 헤더 ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 0" }}>
          <div>
            <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 17, color: "#1B2A4A" }}>
              📤 {lang === "ko" ? "공유하기" : "Share"}
            </div>
            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              {ctx.emoji} {lang === "ko" ? ctx.labelKo : ctx.labelEn} {lang === "ko" ? "정보 공유" : "info"}
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#F1F5F9", borderRadius: "50%", width: 32, height: 32, fontSize: 16, cursor: "pointer", color: "#64748B" }}>✕</button>
        </div>

        {/* ── 공유 미리보기 카드 ── */}
        <div style={{ margin: "14px 16px 0", background: "linear-gradient(135deg,#F8FAFC,#EFF6FF)", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 14px 10px" }}>
          <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.65, whiteSpace: "pre-line" }}>
            {bodyText}
          </div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: "#1B2A4A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>🧭</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1B2A4A" }}>HebronGuide</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>hebronguide.com/seattle</div>
          </div>
          <div style={{ marginTop: 4, fontSize: 10, color: "#94A3B8" }}>{ctx.tags}</div>
        </div>

        {/* ── SNS 플랫폼 그리드 (4열 아이콘형) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, padding: "14px 16px 6px" }}>
          {platforms.map((p, i) => {
            const isLast = i === platforms.length - 1;
            const isInstagram = i === 2;
            const isTikTok = i === 3;
            const inner = (
              <>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: p.bg, border: `1.5px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 4 }}>
                  {isLast && copied ? "✅" : p.icon}
                </div>
                <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 10, color: "#1B2A4A", textAlign: "center", lineHeight: 1.2 }}>
                  {isLast && copied ? (lang === "ko" ? "복사됨!" : "Copied!") : p.label}
                </div>
                {(isInstagram || isTikTok) && (
                  <div style={{ fontSize: 8, color: "#F59E0B", fontWeight: 700, textAlign: "center", marginTop: 2 }}>
                    복사→붙여넣기
                  </div>
                )}
              </>
            );
            return p.action ? (
              <button key={i} onClick={p.action}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 2px", border: "none", background: "transparent", cursor: "pointer" }}>
                {inner}
              </button>
            ) : (
              <a key={i} href={(p as any).href} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 2px", textDecoration: "none" }}>
                {inner}
              </a>
            );
          })}
        </div>

        {/* ── 폰 기본 공유 큰 버튼 (카카오·문자·이메일 등 전부) ── */}
        <div style={{ padding: "8px 16px 6px" }}>
          <button onClick={nativeShare} style={{ width: "100%", border: "none", borderRadius: 14, background: "linear-gradient(135deg,#F2994A,#F59E0B)", padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📤</span>
            <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#fff" }}>
              {lang === "ko" ? "폰 공유 시트 열기 (카카오·문자·이메일…)" : "Open share sheet (KakaoTalk, SMS, Mail…)"}
            </span>
          </button>
        </div>

        {/* ── 하단 안내 ── */}
        <div style={{ padding: "6px 16px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#CBD5E1" }}>
            💡 {lang === "ko" ? "공유 시 HebronGuide 링크가 자동으로 포함됩니다" : "HebronGuide link is automatically included in every share"}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────
   더보기 시트 항목
───────────────────────────────────────── */
const MORE_SECTIONS = [
  { icon: Church,       labelKo: "교회",   labelEn: "Church",  tab: 2,  color: "#7C3AED" },
  { icon: Map,          labelKo: "관광",   labelEn: "Tourism", tab: 4,  color: "#0EA5E9" },
  { icon: Briefcase,    labelKo: "취업",   labelEn: "Jobs",    tab: 6,  color: "#059669" },
  { icon: GraduationCap,labelKo: "교육",   labelEn: "Schools", tab: 7,  color: "#F59E0B" },
  { icon: DollarSign,   labelKo: "생활비", labelEn: "Costs",   tab: 8,  color: "#8B5CF6" },
];

interface BottomNavProps {
  activeIndex: number;
  onChange: (i: number) => void;
  onSearchToggle: () => void;
  onShareToggle: () => void;
  onTranslateToggle: () => void;
}
function BottomNav({ activeIndex, onChange, onSearchToggle, onShareToggle, onTranslateToggle }: BottomNavProps) {
  const { lang } = useI18n();
  const [showMore, setShowMore] = useState(false);

  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.id === "more") { setShowMore(prev => !prev); return; }
    setShowMore(false);
    onChange(item.tab);
  };

  const handleMoreSection = (tab: number) => {
    onChange(tab);
    setShowMore(false);
  };

  const ACCENT = "#F2994A";

  return (
    <>
      {/* 더보기 시트 — 반투명 오버레이 */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          onClick={() => setShowMore(false)}
        />
      )}

      {/* 더보기 바텀 시트 */}
      {showMore && (
        <div
          className="fixed z-50 lg:hidden"
          style={{
            bottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
            left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 430,
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
            padding: "16px 16px 12px",
          }}
        >
          {/* 핸들 */}
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E5E7EB", margin: "0 auto 16px" }} />

          {/* 섹션 버튼 그리드 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
            {MORE_SECTIONS.map((s) => {
              const isActive = activeIndex === s.tab;
              const IconComp = s.icon;
              return (
                <button
                  key={s.tab}
                  onClick={() => handleMoreSection(s.tab)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "10px 4px 8px", borderRadius: 14, border: "none", cursor: "pointer",
                    background: isActive ? `${s.color}15` : "#F8FAFC",
                    outline: isActive ? `1.5px solid ${s.color}40` : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: isActive ? s.color : `${s.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <IconComp size={20} color={isActive ? "#fff" : s.color} strokeWidth={1.8} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: isActive ? s.color : "#374151",
                    fontFamily: "-apple-system, 'Noto Sans KR', sans-serif",
                  }}>
                    {lang === "ko" ? s.labelKo : s.labelEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: "#F1F5F9", marginBottom: 12 }} />

          {/* 유틸 버튼 */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { icon: Search,       labelKo: "검색",  labelEn: "Search",    action: () => { onSearchToggle(); setShowMore(false); } },
              { icon: Globe,        labelKo: "통역",  labelEn: "Translate", action: () => { onTranslateToggle(); setShowMore(false); } },
              { icon: Share2,       labelKo: "공유",  labelEn: "Share",     action: () => { onShareToggle(); setShowMore(false); } },
            ].map((u, i) => {
              const IconComp = u.icon;
              return (
                <button
                  key={i}
                  onClick={u.action}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 5, padding: "10px 4px", borderRadius: 12, border: "none",
                    background: "#F8FAFC", cursor: "pointer",
                  }}
                >
                  <IconComp size={20} color="#6B7280" strokeWidth={1.8} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#6B7280",
                    fontFamily: "-apple-system, 'Noto Sans KR', sans-serif" }}>
                    {lang === "ko" ? u.labelKo : u.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 메인 하단 네비 — iPhone safe area 대응 */}
      <nav
        className="fixed bottom-0 z-50 lg:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          background: "#F9F9F9",
          borderTop: "0.5px solid rgba(0,0,0,0.18)",
          boxShadow: "0 -1px 0 rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", height: 56, alignItems: "stretch" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.tab >= 0 ? activeIndex === item.tab : showMore;
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 4, paddingTop: 8, paddingBottom: 6,
                  border: "none", background: "none", cursor: "pointer",
                  position: "relative", transition: "transform 0.1s ease",
                }}
                onTouchStart={e => (e.currentTarget.style.transform = "scale(0.92)")}
                onTouchEnd={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                {isActive && (
                  <div style={{
                    position: "absolute", top: 0, left: "50%", width: 28, height: 3,
                    borderRadius: 2, background: ACCENT, transform: "translateX(-50%)",
                  }} />
                )}
                <IconComp size={24} color={isActive ? ACCENT : "#8E8E93"} strokeWidth={isActive ? 2.2 : 1.5} />
                <span style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Noto Sans KR', sans-serif",
                  fontWeight: isActive ? 700 : 500, fontSize: 10,
                  color: isActive ? ACCENT : "#8E8E93",
                  whiteSpace: "nowrap", letterSpacing: "-0.2px",
                }}>
                  {lang === "ko" ? item.labelKo : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/* ─────────────────────────────────────────
   TOP APP BAR
───────────────────────────────────────── */
function AppBar({ onHome }: { onHome?: () => void }) {
  const { t, lang, setLang } = useI18n();
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-[20px] w-full"
      style={{
        height: 56,
        background: "#F9F9F9",
        borderBottom: "0.5px solid rgba(0,0,0,0.18)",
      }}
    >
      {/* 로고 + 앱 이름 — 클릭하면 홈으로 (표준 UX) */}
      <button
        onClick={onHome}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none",
          cursor: onHome ? "pointer" : "default", padding: "4px 6px 4px 0", borderRadius: 10,
          transition: "opacity 0.15s" }}
        onMouseEnter={e => { if (onHome) (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        title={onHome ? "홈으로" : "HebronGuide"}
      >
        <div className="flex items-center justify-center overflow-hidden" style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(242,153,74,0.25)", background: "rgba(242,153,74,0.08)", flexShrink: 0 }}>
          <img src={logoImg} alt="HebronGuide Logo" style={{ width: 28, height: 28, objectFit: "contain" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = "block"; }} />
          <span style={{ fontSize: 16, display: "none" }}>🌲</span>
        </div>
        <div className="flex flex-col" style={{ lineHeight: 1 }}>
          <div>
            <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Manrope, sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "1.5px", color: "#F2994A" }}>HEBRON</span>
            <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Manrope, sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "1.5px", color: "#64748B" }}>GUIDE</span>
          </div>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Manrope, sans-serif", fontWeight: 600, fontSize: 9, letterSpacing: "1px", color: "#F2994A", marginTop: 2, opacity: 0.8 }}>
            {(() => { const p = window.location.pathname.split('/').filter(Boolean)[0]?.toUpperCase(); return (p && ['SEATTLE','DALLAS','SF','NEWYORK','NASHVILLE','BOSTON','LA','TORONTO','VANCOUVER'].includes(p)) ? (p === 'SF' ? 'SAN FRANCISCO' : p === 'NEWYORK' ? 'NEW YORK' : p) : 'SEATTLE'; })()}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-[8px]">
        {/* 언어 토글: KO / EN / ES */}
        <div className="flex items-center" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: 2, gap: 2 }}>
          {(["ko", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="flex items-center justify-center border-0 cursor-pointer hover:scale-110 active:scale-95"
              style={{
                height: 24, paddingLeft: 8, paddingRight: 8, borderRadius: 7,
                background: lang === l ? `rgba(242,153,74,0.12)` : "transparent",
                border: `1px solid ${lang === l ? "rgba(242,153,74,0.4)" : "transparent"}`,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Manrope, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.5px", color: lang === l ? "#F2994A" : "#94A3B8" }}>
                {l.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
        {/* 검색은 하단 바에서 처리 — 중복 제거 */}
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */
export function HebronGuide() {
  const [activeNav, setActiveNav] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const isOnline = useOnlineStatus();
  const { showBanner, handleInstall, handleDismiss } = useInstallPrompt();
  const { lang, setLang } = useI18n();

  const [settleInitialSub, setSettleInitialSub] = useState(0);
  const [helpInitialSub, setHelpInitialSub] = useState(0);
  const [eduInitialSub, setEduInitialSub] = useState(0);
  const [costInitialSub, setCostInitialSub] = useState(0);

  const handleNavigate = (tab: number, subTab?: number) => {
    const maxTab = 8; // 홈·정착·교회·맛집·탐방·도움·취업·교육·생활비
    if (tab <= maxTab) {
      if (tab === 1 && subTab !== undefined) setSettleInitialSub(subTab);
      if (tab === 5 && subTab !== undefined) setHelpInitialSub(subTab);
      if (tab === 7 && subTab !== undefined) setEduInitialSub(subTab);
      if (tab === 8 && subTab !== undefined) setCostInitialSub(subTab);
      setActiveNav(tab);
    }
  };

  const handleLangCycle = () => {
    setLang(lang === "ko" ? "en" : "ko");
  };

  const handleSearchToggle = () => {
    setShowSearch(prev => !prev);
    if (showSearch) setSearchQuery("");
  };

  const SEARCH_MAP = [
    { tab: 1, labelKo: "정착", labelEn: "Settle",
      keywords: ["정착","settle","ssn","은행","bank","면허","license","sim","비자","visa",
        "i-94","i94","uscis","이민","immigration","주소","address","orca","교통",
        "abc운전","abc driving","운전학교","kcsc","한인생활상담소","총영사관","consulate",
        "여권","passport","공증","notary","재외국민","체류","거주","housing"] },
    { tab: 2, labelKo: "교회", labelEn: "Church",
      keywords: ["교회","church","예배","worship","목장","가정교회","house church",
        "gmc","지구촌","global mission","성경","bible","목사","pastor","신앙","faith"] },
    { tab: 3, labelKo: "맛집·카페", labelEn: "Food",
      keywords: ["맛집","food","카페","cafe","식당","bbq","한식","coffee","restaurant",
        "백정","baekjeong","쏘문난집","so moon","이가네","yi's","wuju","갈비","설렁탕",
        "순두부","tofu","치킨","chicken","비빔밥","bibimbap","라면","ramen",
        "핫도그","hotdog","빙수","bingsu","크로플","k cafe","dabang","카카오","음식"] },
    { tab: 4, labelKo: "관광", labelEn: "Tourism",
      keywords: ["탐방","관광","여행","tourism","travel","explore","레이니어","rainier","스페이스니들","space needle",
        "파이크","pike","여행","travel","tourist","tourism","폭포","falls","스노퀄미",
        "snoqualmie","페리","ferry","베인브릿지","bainbridge","산","mountain","하이킹",
        "hiking","자연","nature","공원","park","박물관","museum","시애틀센터"] },
    { tab: 5, labelKo: "도움·의료", labelEn: "Help",
      keywords: ["도움","help","의료","의사","병원","hospital","법률","legal","emergency",
        "응급","치과","dentist","dental","치과의사","약국","pharmacy","보험","insurance",
        "apple health","medicaid","정신건강","mental health","상담","counseling",
        "ichs","swedish","acrs","nwirp","법무사","변호사","attorney","lawyer",
        "911","위기","crisis","프라임덴탈","prime dental","커클랜드치과"] },
    { tab: 6, labelKo: "취업", labelEn: "Jobs",
      keywords: ["취업","jobs","amazon","microsoft","구글","google","h1b","h-1b",
        "직장","career","worksource","이력서","resume","linkedin","opt","stem opt",
        "boeing","자영업","창업","비자취업","스타트업","인턴","intern","채용"] },
    { tab: 7, labelKo: "교육", labelEn: "Schools",
      keywords: ["교육","education","학교","school","대학","university","학군","학원",
        "uw","에드먼즈칼리지","edmonds","esl","영어","english class","벨뷰학군",
        "bellevue sd","northshore","lake washington","tutoring","과외","sat","act"] },
    { tab: 8, labelKo: "생활비", labelEn: "Costs",
      keywords: ["생활비","cost","렌트","rent","기름","gas","세금","tax","월세",
        "환율","exchange rate","물가","price","전기세","utilities","주차","parking",
        "최저시급","minimum wage","팁","tip","shopping","쇼핑"] },
  ];

  const handleSearch = (query: string) => {
    const q = query.toLowerCase().replace(/\s/g, "");
    const match = SEARCH_MAP.find(item =>
      item.keywords.some(kw => q.includes(kw.replace(/\s/g, "")) || kw.replace(/\s/g, "").includes(q))
    );
    if (match) {
      setActiveNav(match.tab);
      setShowSearch(false);
      setSearchQuery("");
    } else {
      // 결과 없을 때 피드백
      alert(lang === "ko"
        ? `"${query}" 검색 결과가 없어요.\n빠른 메뉴에서 직접 선택해보세요!`
        : `No results for "${query}".\nTry selecting from Quick Menu!`);
    }
  };

  // 9개 탭 스크린 (홈·정착·교회·맛집·탐방·도움·취업·교육·생활비)
  const screens = [
    <HomeScreen onNavigate={handleNavigate} />,                                        // 0
    <SettleScreen onHome={() => setActiveNav(0)} initialSub={settleInitialSub} />,     // 1
    <ChurchScreen onHome={() => setActiveNav(0)} />,                                   // 2
    <DiningScreen onHome={() => setActiveNav(0)} />,                                   // 3
    <ExploreScreen onHome={() => setActiveNav(0)} />,                                  // 4
    <HelpScreen onHome={() => setActiveNav(0)} initialSub={helpInitialSub} />,         // 5
    <JobsScreen onHome={() => setActiveNav(0)} />,                                     // 6
    <EducationScreen onHome={() => setActiveNav(0)} initialSub={eduInitialSub} />,     // 7
    <CostScreen onHome={() => setActiveNav(0)} initialSub={costInitialSub} />,         // 8
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "#F2F2F7" }}>
      {/* 데스크탑 사이드바 */}
      <DesktopSidebar activeTab={activeNav} onNavigate={handleNavigate} />

      {/* 메인 콘텐츠 영역 */}
      <div
        className="flex flex-col min-h-screen mx-auto relative w-full max-w-[430px] md:max-w-[640px] lg:max-w-[960px] lg:ml-64"
        style={{ background: "#1a2535" }}
      >
        <AppBar onHome={() => setActiveNav(0)} />

        {/* 검색바 (슬라이드 인) */}
        {showSearch && (() => {
          // 실시간 앱 내 검색 매칭
          const q = searchQuery.toLowerCase().replace(/\s/g, "");
          const internalMatches = q.length > 0
            ? SEARCH_MAP.filter(item => item.keywords.some(kw => kw.replace(/\s/g,"").includes(q) || q.includes(kw.replace(/\s/g,""))))
            : [];
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent((searchQuery || "시애틀 한인") + " 시애틀 한인")}`;
          const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent((searchQuery || "시애틀 한인 정보") + " 시애틀 한인")}`;

          return (
            <div style={{
              position: "fixed", top: 56, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: 430, zIndex: 200,
              background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              borderRadius: "0 0 20px 20px",
            }}>
              {/* 검색 입력창 */}
              <div style={{ padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: 16, color: "#94A3B8" }}>🔍</span>
                <input autoFocus value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch(searchQuery)}
                  placeholder={lang === "ko" ? "백정, 치과, 비자, 스페이스니들..." : "Baekjeong, dentist, visa, Space Needle..."}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 15,
                    fontFamily: "'Noto Sans KR', sans-serif", background: "transparent" }}
                />
                <button onClick={handleSearchToggle}
                  style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#94A3B8", padding: 4 }}>✕</button>
              </div>

              {/* 다른 도시 HebronGuide — 도시명 검색 시 */}
              {(() => {
                const cityMatch = HEBRON_CITIES.filter(c => c.nameEn !== "Seattle").find(c => {
                  const qLow = q.toLowerCase();
                  return (
                    qLow.includes(c.nameKo.toLowerCase()) ||
                    qLow.includes(c.nameEn.toLowerCase()) ||
                    qLow.includes(c.nameEn.toLowerCase().split(" ")[0]) ||
                    (c.nameEn === "San Francisco" && (qLow.includes("sf") || qLow.includes("샌프란") || qLow.includes("san francisco"))) ||
                    (c.nameEn === "Dallas" && (qLow.includes("달라") || qLow.includes("텍사스") || qLow.includes("texas"))) ||
                    (c.nameEn === "New York" && (qLow.includes("뉴욕") || qLow.includes("ny") || qLow.includes("new york"))) ||
                    (c.nameEn === "Nashville" && (qLow.includes("내쉬") || qLow.includes("nashville"))) ||
                    (c.nameEn === "Boston" && (qLow.includes("보스") || qLow.includes("boston"))) ||
                    (c.nameEn === "Los Angeles" && (qLow.includes("la") || qLow.includes("엘에이") || qLow.includes("los angeles")))
                  );
                });
                if (!cityMatch || q.length < 1) return null;
                const isLive = cityMatch.status === "live";
                return (
                  <div style={{ margin: "8px 12px", borderRadius: 14, overflow: "hidden", border: `1.5px solid ${cityMatch.color}44`, background: `linear-gradient(135deg, ${cityMatch.color}08, ${cityMatch.color}04)` }}>
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${cityMatch.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                        {cityMatch.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13, color: "#1B2A4A" }}>
                          HebronGuide {lang === "ko" ? cityMatch.nameKo : cityMatch.nameEn}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          {isLive
                            ? (lang === "ko" ? "✅ 라이브 — 지금 바로 볼 수 있어요" : "✅ Live — available now")
                            : (lang === "ko" ? "🔜 준비 중 — 곧 오픈합니다" : "🔜 Coming soon")}
                        </div>
                      </div>
                      {isLive && (
                        <a href={`https://hebronguide.com${cityMatch.url}`} target="_blank" rel="noopener noreferrer"
                          style={{ flexShrink: 0, background: cityMatch.color, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", textDecoration: "none" }}>
                          {lang === "ko" ? "열기 →" : "Open →"}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 앱 내 결과 */}
              {internalMatches.length > 0 && (
                <div style={{ padding: "8px 0" }}>
                  <div style={{ padding: "4px 16px 8px", fontSize: 10, fontFamily: "Manrope,sans-serif",
                    fontWeight: 700, color: "#94A3B8", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {lang === "ko" ? "앱 내 결과" : "In-App Results"}
                  </div>
                  {internalMatches.slice(0, 5).map((m, i) => (
                    <button key={i} onClick={() => { setActiveNav(m.tab); setShowSearch(false); setSearchQuery(""); }}
                      style={{ width: "100%", textAlign: "left", padding: "10px 16px", border: "none",
                        background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <span style={{ fontSize: 18 }}>{QUICK_MENU.find(qm => qm.tab === m.tab)?.emoji || "📌"}</span>
                      <div>
                        <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 600, fontSize: 14, color: "#1B2A4A" }}>
                          {lang === "ko" ? m.labelKo : m.labelEn}
                        </div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>
                          {lang === "ko" ? "탭으로 이동" : "Go to section"}
                        </div>
                      </div>
                      <span style={{ marginLeft: "auto", color: "#F2994A", fontSize: 16 }}>→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 외부 검색 — 앱 내 결과 없을 때만 강조, 항상 하단에 작게 표시 */}
              <div style={{ padding: q.length > 0 && internalMatches.length === 0 ? "12px 14px 16px" : "8px 14px 12px",
                background: q.length > 0 && internalMatches.length === 0 ? "#FFF8F5" : "transparent",
                borderTop: "1px solid #F1F5F9" }}>
                {q.length > 0 && internalMatches.length === 0 && (
                  <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 13, color: "#64748B", marginBottom: 10 }}>
                    {lang === "ko" ? `"${searchQuery}" 앱 내 결과가 없어요. 외부에서 찾아볼게요:` : `No results in app for "${searchQuery}". Try:` }
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "9px 10px", borderRadius: 10, textDecoration: "none",
                    background: "#F8FAFC", border: "1px solid #E2E8F0",
                  }}>
                    <span style={{ fontSize: 14 }}>🔍</span>
                    <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#374151" }}>Google</span>
                  </a>
                  <a href={perplexityUrl} target="_blank" rel="noopener noreferrer" style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "9px 10px", borderRadius: 10, textDecoration: "none",
                    background: "#EFF6FF", border: "1px solid #BFDBFE",
                  }}>
                    <span style={{ fontSize: 14 }}>🤖</span>
                    <span style={{ fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 12, color: "#1D4ED8" }}>Perplexity</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PWA 설치 배너 */}
        {showBanner && (
          <InstallBanner onInstall={handleInstall} onDismiss={handleDismiss} />
        )}

        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 72, paddingTop: showBanner ? 72 : 0 }}>
          {screens[Math.min(activeNav, screens.length - 1)]}
        </main>

        {/* 오프라인 배너 */}
        {!isOnline && <OfflineBanner />}

        {/* 공유 모달 */}
        {showChat && <ChatShareModal onClose={() => setShowChat(false)} lang={lang} activeNav={activeNav} />}

        {/* 통역 모달 */}
        {showTranslate && <TranslateModal onClose={() => setShowTranslate(false)} lang={lang}
          onNavigate={(tab) => { setActiveNav(tab); setShowTranslate(false); }} />}

        <BottomNav
          activeIndex={activeNav}
          onChange={setActiveNav}
          onSearchToggle={handleSearchToggle}
          onShareToggle={() => setShowChat(prev => !prev)}
          onTranslateToggle={() => setShowTranslate(prev => !prev)}
        />
      </div>
    </div>
  );
}

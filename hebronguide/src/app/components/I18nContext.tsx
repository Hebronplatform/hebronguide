/**
 * I18nContext.tsx — Language context provider
 * 지원 언어: ko · en · es
 */
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { translations, type Lang, type TranslationKey } from "./i18n";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// 랜딩(index.html)과 같은 키를 쓴다. 한 곳에서 고르면 다른 곳도 따라간다.
const LANG_KEY = "hg_lang";
const LEGACY_KEY = "hebron-lang";   // 예전에 쓰던 키 — 이미 저장된 분들을 위해 같이 읽는다

// 우선 두 언어만 쓴다 (목사님 지시 2026-09-19).
function detectInitialLang(): Lang {
  // 1. 사용자가 직접 고른 것이 있으면 그게 먼저다
  try {
    const saved = localStorage.getItem(LANG_KEY) || localStorage.getItem(LEGACY_KEY);
    if (saved === "ko" || saved === "en") return saved;
  } catch (_) { /* 시크릿 창 등에서 막힐 수 있다 */ }

  // 2. 없으면 윈도우·브라우저 언어를 따른다. 한국어면 한국어, 아니면 영어.
  try {
    const prefs = (navigator.languages && navigator.languages.length)
      ? navigator.languages : [navigator.language];
    for (const p of prefs) {
      if (String(p || "").toLowerCase().startsWith("ko")) return "ko";
    }
  } catch (_) { /* 무시 */ }

  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem(LANG_KEY, l);
      localStorage.setItem(LEGACY_KEY, l);   // 예전 키도 같이 맞춰 둔다
    } catch (_) {}
  }, []);

  // 첫 화면에서도 html lang 을 맞춘다 (화면 낭독기와 검색엔진이 이 값을 읽는다)
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key] ?? translations["en"][key] ?? key,
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
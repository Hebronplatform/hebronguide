/**
 * I18nContext.tsx — Language context provider
 * 지원 언어: ko · en · es
 */
import { createContext, useContext, useState, useCallback } from "react";
import { translations, type Lang, type TranslationKey } from "./i18n";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLang(): Lang {
  const pref = navigator.language.toLowerCase();
  if (pref.startsWith("ko")) return "ko";
  if (pref.startsWith("es")) return "es";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    localStorage.setItem("hebron-lang", l);
  }, []);

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
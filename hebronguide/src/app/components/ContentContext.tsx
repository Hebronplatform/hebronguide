/**
 * ContentContext.tsx
 * Loads all dynamic content from the Supabase server on mount.
 * Components use useContent() and fall back to hardcoded defaults if data is null.
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-21f2cd69`;

export const CONTENT_TYPES = [
  "churches",
  "cafes", "restaurants", "businesses", "shopping",
  "areas", "nature", "culture", "sports",
  "community", "links",
  "settle_week1", "settle_month1", "settle_month3", "settle_admin", "settle_finance",
] as const;

export type ContentType = typeof CONTENT_TYPES[number];

export interface PlaceItem {
  id: string;
  emoji: string;
  name: string;
  nameEn?: string;
  desc: string;
  descEn?: string;
  tags?: string[];
  active: boolean;
  order: number;
}

export interface StepItem {
  id: string;
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
  active: boolean;
  order: number;
}

interface ContentContextType {
  content: Partial<Record<ContentType, any[]>>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType>({
  content: {},
  loading: false,
  refresh: async () => {},
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Partial<Record<ContentType, any[]>>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        CONTENT_TYPES.map(type =>
          fetch(`${BASE_URL}/content/${type}`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          })
            .then(r => r.ok ? r.json() : null)
            .then(data => [type, Array.isArray(data) ? data : null] as const)
            .catch(() => [type, null] as const)
        )
      );
      const map: Partial<Record<ContentType, any[]>> = {};
      results.forEach(([type, data]) => {
        if (data) map[type] = data;
      });
      setContent(map);
    } catch (e) {
      console.log("ContentContext load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <ContentContext.Provider value={{ content, loading, refresh: load }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  return useContext(ContentContext);
}

/** Resolve a PlaceItem's desc based on current language */
export function resolvePlaceItems(items: PlaceItem[], lang: string): PlaceItem[] {
  return items
    .filter(i => i.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(i => ({
      ...i,
      desc: lang === "ko" ? i.desc : (i.descEn || i.desc),
      name: i.name,
    }));
}

/** Resolve a StepItem's title/desc based on current language */
export function resolveStepItems(items: StepItem[], lang: string): { title: string; desc: string }[] {
  return items
    .filter(i => i.active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(i => ({
      title: lang === "ko" ? i.title : (i.titleEn || i.title),
      desc: lang === "ko" ? i.desc : (i.descEn || i.desc),
    }));
}

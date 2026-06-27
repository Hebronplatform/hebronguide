/**
 * ContentContext.tsx
 * Supabase REST API 직접 연결 (Edge Function 제거)
 * - churches → churches 테이블 (city_slug + active=true)
 * - businesses/cafes/restaurants 등 → community_items (city_slug + type + status=approved)
 * - 도시 슬러그: URL 경로에서 자동 추출 (/seattle/ → 'seattle')
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SUPABASE_REST = `https://${projectId}.supabase.co/rest/v1`;

export const CONTENT_TYPES = [
  "churches",
  "cafes", "restaurants", "businesses", "shopping",
  "areas", "nature", "culture", "sports",
  "community", "links",
  "settle_week1", "settle_month1", "settle_month3", "settle_admin", "settle_finance",
  "support",
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

function getCitySlug(): string {
  // /seattle/ → 'seattle', /dallas/index.html → 'dallas'
  const parts = window.location.pathname.replace(/\/index\.html$/, '').split('/').filter(Boolean);
  return parts[0] || 'seattle';
}

function sbHeaders() {
  return {
    apikey: publicAnonKey,
    Authorization: `Bearer ${publicAnonKey}`,
  };
}

async function fetchChurches(citySlug: string): Promise<PlaceItem[]> {
  try {
    const url = `${SUPABASE_REST}/churches?city_slug=eq.${citySlug}&active=eq.true&order=tier.asc,name.asc&limit=100`;
    const res = await fetch(url, { headers: sbHeaders() });
    if (!res.ok) return [];
    const rows: any[] = await res.json();
    return rows.map(r => ({
      id: String(r.id),
      emoji: '⛪',
      name: r.name || '',
      nameEn: r.name_en || r.name || '',
      desc: [
        r.denomination ? `[${r.denomination}]` : '',
        r.description || '',
        r.phone ? `☎ ${r.phone}` : '',
        r.website ? `🔗 ${r.website}` : '',
      ].filter(Boolean).join(' '),
      descEn: r.description || '',
      tags: [r.denomination, r.city_slug].filter(Boolean),
      active: r.active ?? true,
      order: r.tier ?? 2,
    }));
  } catch {
    return [];
  }
}

async function fetchCommunityItems(citySlug: string, type: string): Promise<PlaceItem[]> {
  try {
    const url = `${SUPABASE_REST}/community_items?city_slug=eq.${encodeURIComponent(citySlug)}&type=eq.${encodeURIComponent(type)}&status=eq.approved&order=created_at.asc&limit=100`;
    const res = await fetch(url, { headers: sbHeaders() });
    if (!res.ok) return [];
    const rows: any[] = await res.json();
    return rows.map(r => ({
      id: String(r.id),
      emoji: r.emoji || '🏪',
      name: r.name || r.title || '',
      nameEn: r.name_en || r.name || r.title || '',
      desc: r.description || r.desc || '',
      descEn: r.description_en || r.desc_en || r.description || '',
      tags: Array.isArray(r.tags) ? r.tags : [],
      active: r.status === 'approved',
      order: r.order ?? 500,
    }));
  } catch {
    return [];
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Partial<Record<ContentType, any[]>>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const citySlug = getCitySlug();
      const map: Partial<Record<ContentType, any[]>> = {};

      // churches: 별도 테이블 + community_items(type='churches') 합치기
      const [churches, communityChurches] = await Promise.all([
        fetchChurches(citySlug),
        fetchCommunityItems(citySlug, 'churches'),
      ]);
      const allChurches = [...churches, ...communityChurches];
      if (allChurches.length > 0) map['churches'] = allChurches;

      // community_items 기반 타입들
      const communityTypes: ContentType[] = [
        'businesses', 'cafes', 'restaurants', 'shopping',
        'areas', 'nature', 'culture', 'sports', 'community', 'links',
        'settle_week1', 'settle_month1', 'settle_month3', 'settle_admin', 'settle_finance',
        'support',
      ];

      const results = await Promise.all(
        communityTypes.map(type =>
          fetchCommunityItems(citySlug, type).then(data => [type, data] as const)
        )
      );
      results.forEach(([type, data]) => {
        if (data.length > 0) map[type] = data;
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

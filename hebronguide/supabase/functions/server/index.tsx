import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const PREFIX = "/make-server-21f2cd69";
const DEFAULT_PASSWORD = "hebron2025";

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// Health check
app.get(`${PREFIX}/health`, (c) => c.json({ status: "ok" }));

// ── 커뮤니티 제출 수집 (공개 — 누구나 POST 가능) ─────────────
app.post(`${PREFIX}/community/submit`, async (c) => {
  try {
    const item = await c.req.json();
    const key = "community:submissions";
    const raw = await kv.get(key);
    const items: any[] = raw ? JSON.parse(raw as string) : [];
    items.unshift({
      id:         crypto.randomUUID(),
      created_at: new Date().toISOString(),
      category:   item.category  ?? "",
      city_slug:  item.city      ?? "",
      name:       item.name      ?? "",
      contact:    item.contact   ?? "",
      description:item.desc      ?? "",
      website:    item.website   ?? "",
    });
    await kv.set(key, JSON.stringify(items));
    return c.json({ success: true, total: items.length });
  } catch (e) {
    console.log("community/submit error:", e);
    return c.json({ error: String(e) }, 500);
  }
});

// ── 커뮤니티 전체 조회 (관리자 전용) ─────────────────────────
app.get(`${PREFIX}/community/all`, async (c) => {
  if (!await verifyAdmin(c.req.header("Authorization"))) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const raw = await kv.get("community:submissions");
    const items = raw ? JSON.parse(raw as string) : [];
    return c.json({ total: items.length, items });
  } catch (e) {
    return c.json({ error: String(e) }, 500);
  }
});

// ── 커뮤니티 CSV 다운로드 (관리자 전용) ──────────────────────
app.get(`${PREFIX}/community/csv`, async (c) => {
  if (!await verifyAdmin(c.req.header("Authorization"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const raw = await kv.get("community:submissions");
    const items: any[] = raw ? JSON.parse(raw as string) : [];
    const BOM = "﻿"; // Excel 한글 깨짐 방지
    const header = ["날짜", "카테고리", "도시", "이름", "연락처", "소개", "웹사이트"];
    const rows = items.map(i => [
      i.created_at?.slice(0, 19) ?? "",
      i.category   ?? "",
      i.city_slug  ?? "",
      i.name       ?? "",
      i.contact    ?? "",
      i.description?? "",
      i.website    ?? "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = BOM + [header.join(","), ...rows].join("\r\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hebronguide-community-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});

// Verify admin password helper
async function verifyAdmin(authHeader: string | undefined): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const password = authHeader.slice(7);
  try {
    const stored = await kv.get("admin:password");
    const expected = stored ?? DEFAULT_PASSWORD;
    return password === expected;
  } catch (e) {
    console.log("verifyAdmin error:", e);
    return false;
  }
}

// ── PUBLIC ROUTES ──────────────────────────────────────────

// Get content by type (public)
app.get(`${PREFIX}/content/:type`, async (c) => {
  const type = c.req.param("type");
  try {
    const data = await kv.get(`content:${type}`);
    if (!data) return c.json(null);
    return c.json(JSON.parse(data as string));
  } catch (e) {
    console.log(`Error getting content:${type}:`, e);
    return c.json(null);
  }
});

// ── ADMIN ROUTES ───────────────────────────────────────────

// Verify admin password
app.post(`${PREFIX}/admin/verify`, async (c) => {
  const ok = await verifyAdmin(c.req.header("Authorization"));
  return c.json({ success: ok });
});

// Change admin password
app.put(`${PREFIX}/admin/password`, async (c) => {
  if (!await verifyAdmin(c.req.header("Authorization"))) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const { newPassword } = await c.req.json();
    if (!newPassword || newPassword.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }
    await kv.set("admin:password", newPassword);
    return c.json({ success: true });
  } catch (e) {
    console.log("Error changing password:", e);
    return c.json({ error: `Failed to change password: ${e}` }, 500);
  }
});

// Save entire content array for a type
app.put(`${PREFIX}/admin/content/:type`, async (c) => {
  if (!await verifyAdmin(c.req.header("Authorization"))) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const type = c.req.param("type");
  try {
    const items = await c.req.json();
    if (!Array.isArray(items)) {
      return c.json({ error: "Items must be an array" }, 400);
    }
    await kv.set(`content:${type}`, JSON.stringify(items));
    return c.json({ success: true, count: items.length });
  } catch (e) {
    console.log(`Error saving content:${type}:`, e);
    return c.json({ error: `Failed to save: ${e}` }, 500);
  }
});

// Reset content to default (delete from KV — app falls back to hardcoded)
app.delete(`${PREFIX}/admin/content/:type`, async (c) => {
  if (!await verifyAdmin(c.req.header("Authorization"))) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const type = c.req.param("type");
  try {
    await kv.del(`content:${type}`);
    return c.json({ success: true });
  } catch (e) {
    console.log(`Error deleting content:${type}:`, e);
    return c.json({ error: `Failed to reset: ${e}` }, 500);
  }
});

Deno.serve(app.fetch);

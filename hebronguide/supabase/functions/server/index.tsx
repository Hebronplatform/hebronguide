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

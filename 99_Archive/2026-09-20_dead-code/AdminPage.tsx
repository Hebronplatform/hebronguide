/**
 * AdminPage.tsx — HebronGuide Content Management Dashboard
 * Route: /admin (hidden from public)
 * 인증: 환경변수 또는 Supabase secrets 참조 (코드에 비밀번호 하드코딩 금지)
 */
import { useState, useEffect, useCallback } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ALL_DEFAULTS } from "../data/defaults";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-21f2cd69`;
const GOLD = "#C9A227";
const MINT = "#6EE7B7";

// ── Types ──────────────────────────────────────────────────
interface PlaceItem {
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
interface StepItem {
  id: string;
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
  active: boolean;
  order: number;
}
type AnyItem = PlaceItem | StepItem;

// ── Content sections config ────────────────────────────────
const SECTIONS = [
  { key: "churches",      label: "⛪ 교회",          type: "place",  group: "Church" },
  { key: "cafes",         label: "☕ 카페",           type: "place",  group: "Dining" },
  { key: "restaurants",   label: "🍽️ 한식·맛집",     type: "place",  group: "Dining" },
  { key: "businesses",    label: "🏪 한인상권",       type: "place",  group: "Dining" },
  { key: "shopping",      label: "🛍️ 쇼핑",          type: "place",  group: "Dining" },
  { key: "areas",         label: "🗺️ 지역안내",      type: "place",  group: "Explore" },
  { key: "nature",        label: "🌲 자연·여행",     type: "place",  group: "Explore" },
  { key: "culture",       label: "🎨 문화·예술",     type: "place",  group: "Explore" },
  { key: "sports",        label: "⚽ 스포츠",        type: "place",  group: "Explore" },
  { key: "community",     label: "💬 커뮤니티",      type: "place",  group: "Help" },
  { key: "links",         label: "🔗 유용한 링크",   type: "place",  group: "Help" },
  { key: "settle_week1",  label: "📅 1주차 정착",    type: "step",   group: "Settle" },
  { key: "settle_month1", label: "📅 1개월 정착",    type: "step",   group: "Settle" },
  { key: "settle_month3", label: "📅 3개월 정착",    type: "step",   group: "Settle" },
  { key: "settle_admin",  label: "📋 행정 안내",     type: "step",   group: "Settle" },
  { key: "settle_finance",label: "💰 재정 안내",     type: "step",   group: "Settle" },
] as const;

type SectionKey = typeof SECTIONS[number]["key"];

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// ── API helpers ────────────────────────────────────────────
async function apiVerify(password: string): Promise<boolean> {
  const r = await fetch(`${BASE_URL}/admin/verify`, {
    method: "POST",
    headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" },
  });
  const d = await r.json();
  return d.success === true;
}

async function apiGetContent(type: string, password: string): Promise<any[] | null> {
  const r = await fetch(`${BASE_URL}/content/${type}`, {
    headers: { Authorization: `Bearer ${publicAnonKey}` },
  });
  if (!r.ok) return null;
  const d = await r.json();
  return Array.isArray(d) ? d : null;
}

async function apiSaveContent(type: string, items: any[], password: string): Promise<{ success: boolean; error?: string }> {
  const r = await fetch(`${BASE_URL}/admin/content/${type}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${password}`, "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  return r.json();
}

async function apiResetContent(type: string, password: string): Promise<{ success: boolean }> {
  const r = await fetch(`${BASE_URL}/admin/content/${type}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${password}` },
  });
  return r.json();
}

async function apiChangePassword(oldPw: string, newPw: string): Promise<{ success: boolean; error?: string }> {
  const r = await fetch(`${BASE_URL}/admin/password`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${oldPw}`, "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword: newPw }),
  });
  return r.json();
}

// ── Sub-components ─────────────────────────────────────────

function Btn({ children, onClick, variant = "primary", small = false, disabled = false }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "danger" | "ghost" | "gold";
  small?: boolean;
  disabled?: boolean;
}) {
  const bg = {
    primary: "rgba(110,231,183,0.15)",
    danger: "rgba(239,68,68,0.15)",
    ghost: "rgba(255,255,255,0.06)",
    gold: "rgba(201,162,39,0.15)",
  }[variant];
  const border = {
    primary: "rgba(110,231,183,0.4)",
    danger: "rgba(239,68,68,0.4)",
    ghost: "rgba(255,255,255,0.12)",
    gold: "rgba(201,162,39,0.4)",
  }[variant];
  const color = {
    primary: MINT,
    danger: "#F87171",
    ghost: "rgba(236,253,245,0.7)",
    gold: GOLD,
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "rgba(255,255,255,0.04)" : bg,
        border: `1px solid ${disabled ? "rgba(255,255,255,0.08)" : border}`,
        color: disabled ? "rgba(255,255,255,0.3)" : color,
        borderRadius: 8,
        padding: small ? "4px 12px" : "8px 16px",
        fontSize: small ? 11 : 12,
        fontFamily: "Manrope,sans-serif",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: type === "success" ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
      color: "#fff", borderRadius: 12, padding: "12px 20px",
      fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 13,
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      animation: "slideIn 0.3s ease",
    }}>
      {type === "success" ? "✅" : "❌"} {msg}
    </div>
  );
}

// ── Item Edit Modal ────────────────────────────────────────
function ItemModal({
  item,
  sectionType,
  onSave,
  onClose,
}: {
  item: AnyItem | null;
  sectionType: "place" | "step";
  onSave: (item: AnyItem) => void;
  onClose: () => void;
}) {
  const isNew = !item?.id;
  const [form, setForm] = useState<any>(
    item || (sectionType === "place"
      ? { id: genId(), emoji: "⭐", name: "", nameEn: "", desc: "", descEn: "", tags: "", active: true, order: 99 }
      : { id: genId(), title: "", titleEn: "", desc: "", descEn: "", active: true, order: 99 })
  );

  const set = (k: string, v: any) => setForm((prev: any) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (sectionType === "place") {
      const tags = typeof form.tags === "string"
        ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : form.tags || [];
      onSave({ ...form, tags });
    } else {
      onSave(form);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "#ECFDF5",
    fontSize: 13,
    fontFamily: "Manrope,sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "Manrope,sans-serif",
    fontWeight: 700,
    fontSize: 11,
    color: "rgba(110,231,183,0.8)",
    marginBottom: 5,
    display: "block",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#1c2128", borderRadius: 20, padding: 28,
        width: "100%", maxWidth: 540,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 18, color: "#ECFDF5" }}>
            {isNew ? "➕ Add Item" : "✏️ Edit Item"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(236,253,245,0.5)", fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sectionType === "place" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Emoji</label>
                  <input style={inputStyle} value={form.emoji || ""} onChange={e => set("emoji", e.target.value)} placeholder="⛪" />
                </div>
                <div>
                  <label style={labelStyle}>Name (한국어)</label>
                  <input style={inputStyle} value={form.name || ""} onChange={e => set("name", e.target.value)} placeholder="교회 이름" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Name (English)</label>
                <input style={inputStyle} value={form.nameEn || ""} onChange={e => set("nameEn", e.target.value)} placeholder="Church Name in English" />
              </div>
              <div>
                <label style={labelStyle}>Description (한국어)</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties}
                  value={form.desc || ""} onChange={e => set("desc", e.target.value)} placeholder="한국어 설명..." />
              </div>
              <div>
                <label style={labelStyle}>Description (English)</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties}
                  value={form.descEn || ""} onChange={e => set("descEn", e.target.value)} placeholder="English description..." />
              </div>
              <div>
                <label style={labelStyle}>Tags (comma-separated)</label>
                <input style={inputStyle}
                  value={typeof form.tags === "string" ? form.tags : (form.tags || []).join(", ")}
                  onChange={e => set("tags", e.target.value)}
                  placeholder="예: 린우드, 청년, 장로교" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={labelStyle}>Title (한국어)</label>
                <input style={inputStyle} value={form.title || ""} onChange={e => set("title", e.target.value)} placeholder="항목 제목" />
              </div>
              <div>
                <label style={labelStyle}>Title (English)</label>
                <input style={inputStyle} value={form.titleEn || ""} onChange={e => set("titleEn", e.target.value)} placeholder="Item title in English" />
              </div>
              <div>
                <label style={labelStyle}>Description (한국어)</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties}
                  value={form.desc || ""} onChange={e => set("desc", e.target.value)} placeholder="한국어 설명..." />
              </div>
              <div>
                <label style={labelStyle}>Description (English)</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" } as React.CSSProperties}
                  value={form.descEn || ""} onChange={e => set("descEn", e.target.value)} placeholder="English description..." />
              </div>
            </>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ ...labelStyle, margin: 0 }}>Visible in App</label>
            <button
              onClick={() => set("active", !form.active)}
              style={{
                background: form.active ? "rgba(110,231,183,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${form.active ? "rgba(110,231,183,0.4)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 20, padding: "4px 16px", cursor: "pointer",
                fontFamily: "Manrope,sans-serif", fontWeight: 700, fontSize: 11,
                color: form.active ? MINT : "rgba(236,253,245,0.4)",
              }}
            >
              {form.active ? "✓ VISIBLE" : "HIDDEN"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave}>
            {isNew ? "Add Item" : "Save Changes"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── Change Password Modal ──────────────────────────────────
function ChangePasswordModal({ password, onClose, onChanged }: {
  password: string;
  onClose: () => void;
  onChanged: (newPw: string) => void;
}) {
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (newPw.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPw !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    const res = await apiChangePassword(password, newPw);
    setLoading(false);
    if (res.success) { onChanged(newPw); }
    else { setError(res.error || "Failed to change password"); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, padding: "9px 12px", color: "#ECFDF5", fontSize: 13,
    fontFamily: "Manrope,sans-serif", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#1c2128", borderRadius: 20, padding: 28, width: "100%", maxWidth: 400, border: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 style={{ margin: "0 0 20px", fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 18, color: "#ECFDF5" }}>🔐 Change Password</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" style={inputStyle} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min 6 chars)" />
          <input type="password" style={inputStyle} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" />
          {error && <div style={{ color: "#F87171", fontSize: 12, fontFamily: "Manrope,sans-serif" }}>{error}</div>}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="gold" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Change Password"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ───────────────────────────────────
function Dashboard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const [selectedKey, setSelectedKey] = useState<SectionKey>("churches");
  const [items, setItems] = useState<AnyItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<AnyItem | null | "new">(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(password);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const section = SECTIONS.find(s => s.key === selectedKey)!;
  const isUsingDefaults = items === null;

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadItems = useCallback(async (key: SectionKey) => {
    setLoading(true);
    const data = await apiGetContent(key, currentPassword);
    setItems(data);
    setLoading(false);
  }, [currentPassword]);

  useEffect(() => { loadItems(selectedKey); }, [selectedKey, loadItems]);

  const currentItems = items ?? (ALL_DEFAULTS[selectedKey] || []);

  const handleSave = async (newItems: AnyItem[]) => {
    setSaving(true);
    const res = await apiSaveContent(selectedKey, newItems, currentPassword);
    setSaving(false);
    if (res.success) {
      setItems(newItems);
      showToast("Saved successfully!");
    } else {
      showToast(res.error || "Failed to save", "error");
    }
  };

  const handleInitialize = async () => {
    const defaults = ALL_DEFAULTS[selectedKey] || [];
    setSaving(true);
    const res = await apiSaveContent(selectedKey, defaults, currentPassword);
    setSaving(false);
    if (res.success) {
      setItems(defaults);
      showToast("Initialized with default data!");
    } else {
      showToast("Failed to initialize", "error");
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset to app defaults? This will delete your customizations.")) return;
    setSaving(true);
    await apiResetContent(selectedKey, currentPassword);
    setSaving(false);
    setItems(null);
    showToast("Reset to app defaults");
  };

  const handleAddItem = (newItem: AnyItem) => {
    const updated = [...currentItems, { ...newItem, id: genId(), order: currentItems.length }];
    setEditingItem(null);
    handleSave(updated);
  };

  const handleEditItem = (updatedItem: AnyItem) => {
    const updated = currentItems.map((i: AnyItem) => i.id === updatedItem.id ? updatedItem : i);
    setEditingItem(null);
    handleSave(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm("Delete this item?")) return;
    const updated = currentItems.filter((i: AnyItem) => i.id !== id);
    handleSave(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = currentItems.map((i: AnyItem) =>
      i.id === id ? { ...i, active: !(i as any).active } : i
    );
    handleSave(updated);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...currentItems];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    handleSave(arr.map((i, o) => ({ ...i, order: o })));
  };

  const handleMoveDown = (idx: number) => {
    if (idx === currentItems.length - 1) return;
    const arr = [...currentItems];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    handleSave(arr.map((i, o) => ({ ...i, order: o })));
  };

  const groups = [...new Set(SECTIONS.map(s => s.group))];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117", fontFamily: "Manrope,sans-serif" }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 240 : 0,
        minWidth: sidebarOpen ? 240 : 0,
        background: "#161b22",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        overflowY: "auto",
        overflowX: "hidden",
        transition: "all 0.25s ease",
        flexShrink: 0,
      }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1.5px", color: GOLD }}>HEBRONGUIDE</div>
          <div style={{ fontSize: 9, color: "rgba(110,231,183,0.5)", marginTop: 2, letterSpacing: "0.5px" }}>CONTENT MANAGER</div>
        </div>
        {groups.map(group => (
          <div key={group} style={{ padding: "12px 0 4px" }}>
            <div style={{ padding: "0 16px 6px", fontSize: 9, fontWeight: 800, letterSpacing: "1.5px", color: "rgba(236,253,245,0.3)", textTransform: "uppercase" }}>{group}</div>
            {SECTIONS.filter(s => s.group === group).map(s => (
              <button
                key={s.key}
                onClick={() => setSelectedKey(s.key)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "9px 16px", border: "none", cursor: "pointer",
                  background: selectedKey === s.key ? "rgba(110,231,183,0.1)" : "transparent",
                  borderLeft: `2px solid ${selectedKey === s.key ? MINT : "transparent"}`,
                  color: selectedKey === s.key ? MINT : "rgba(236,253,245,0.6)",
                  fontSize: 12, fontFamily: "Manrope,sans-serif", fontWeight: selectedKey === s.key ? 700 : 500,
                  transition: "all 0.15s ease",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", height: 60,
          background: "rgba(22,27,34,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(236,253,245,0.5)", fontSize: 18, padding: 4 }}
            >☰</button>
            <span style={{ fontWeight: 800, fontSize: 14, color: "#ECFDF5" }}>{section.label}</span>
            {isUsingDefaults && (
              <span style={{ fontSize: 10, background: "rgba(201,162,39,0.15)", color: GOLD, border: "1px solid rgba(201,162,39,0.3)", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>
                APP DEFAULTS
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Btn small variant="ghost" onClick={() => setShowChangePw(true)}>🔐 Password</Btn>
            <Btn small variant="ghost" onClick={() => window.open("/", "_blank")}>👁️ View App</Btn>
            <Btn small variant="danger" onClick={onLogout}>Logout</Btn>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {/* Status Banner */}
          {isUsingDefaults && (
            <div style={{
              background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.25)",
              borderRadius: 14, padding: "14px 18px", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 12, color: GOLD, marginBottom: 3 }}>📌 Using App Default Data</div>
                <div style={{ fontSize: 11, color: "rgba(201,162,39,0.7)", lineHeight: 1.6 }}>
                  This section hasn't been customized yet. Click "Initialize" to load the default data into the database, then you can edit it.
                </div>
              </div>
              <Btn variant="gold" onClick={handleInitialize} disabled={saving}>
                {saving ? "Loading..." : "⚡ Initialize"}
              </Btn>
            </div>
          )}

          {/* Action Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "rgba(236,253,245,0.5)" }}>
              {loading ? "Loading..." : `${currentItems.filter((i: any) => i.active !== false).length} visible / ${currentItems.length} total`}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {!isUsingDefaults && (
                <Btn small variant="ghost" onClick={handleReset} disabled={saving}>↩ Reset to Defaults</Btn>
              )}
              <Btn small variant="primary" onClick={() => setEditingItem("new")} disabled={saving}>
                + Add Item
              </Btn>
            </div>
          </div>

          {/* Items List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(236,253,245,0.4)", fontSize: 14 }}>Loading...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentItems.map((item: AnyItem, idx: number) => {
                const isPlace = section.type === "place";
                const pItem = item as PlaceItem;
                const sItem = item as StepItem;
                const isActive = (item as any).active !== false;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: isActive ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                      borderLeft: `3px solid ${isActive ? MINT : "rgba(255,255,255,0.12)"}`,
                      borderRadius: 12, padding: "14px 16px",
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      {/* Reorder buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0, marginTop: 2 }}>
                        <button onClick={() => handleMoveUp(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(236,253,245,0.3)", fontSize: 12, padding: "1px 4px" }}>▲</button>
                        <button onClick={() => handleMoveDown(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(236,253,245,0.3)", fontSize: 12, padding: "1px 4px" }}>▼</button>
                      </div>

                      {/* Item Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          {isPlace && <span style={{ fontSize: 20 }}>{pItem.emoji}</span>}
                          <span style={{ fontWeight: 800, fontSize: 14, color: "#ECFDF5" }}>
                            {isPlace ? pItem.name : `${idx + 1}. ${sItem.title}`}
                          </span>
                          {isPlace && pItem.nameEn && (
                            <span style={{ fontSize: 11, color: "rgba(236,253,245,0.4)" }}>{pItem.nameEn}</span>
                          )}
                          {!isPlace && sItem.titleEn && (
                            <span style={{ fontSize: 11, color: "rgba(236,253,245,0.4)" }}>{sItem.titleEn}</span>
                          )}
                          {!isActive && (
                            <span style={{ fontSize: 9, background: "rgba(239,68,68,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, padding: "1px 6px", fontWeight: 800 }}>HIDDEN</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(236,253,245,0.55)", lineHeight: 1.5, marginBottom: 6 }}>
                          {isPlace ? pItem.desc : sItem.desc}
                        </div>
                        {isPlace && pItem.tags && pItem.tags.length > 0 && (
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {pItem.tags.map((tag, ti) => (
                              <span key={ti} style={{
                                fontSize: 10, background: "rgba(110,231,183,0.1)",
                                border: "1px solid rgba(110,231,183,0.2)",
                                color: MINT, borderRadius: 6, padding: "1px 8px", fontWeight: 600,
                              }}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                        <button
                          onClick={() => handleToggleActive(item.id)}
                          title={isActive ? "Hide" : "Show"}
                          style={{
                            background: isActive ? "rgba(110,231,183,0.1)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${isActive ? "rgba(110,231,183,0.3)" : "rgba(255,255,255,0.1)"}`,
                            borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                            fontSize: 11, fontFamily: "Manrope,sans-serif", fontWeight: 700,
                            color: isActive ? MINT : "rgba(236,253,245,0.4)",
                          }}
                        >
                          {isActive ? "👁" : "🙈"}
                        </button>
                        <Btn small variant="ghost" onClick={() => setEditingItem(item)}>Edit</Btn>
                        <Btn small variant="danger" onClick={() => handleDeleteItem(item.id)}>Delete</Btn>
                      </div>
                    </div>
                  </div>
                );
              })}

              {currentItems.length === 0 && !isUsingDefaults && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(236,253,245,0.3)", fontSize: 14 }}>
                  No items yet. Click "+ Add Item" to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem !== null && (
        <ItemModal
          item={editingItem === "new" ? null : editingItem}
          sectionType={section.type as "place" | "step"}
          onSave={editingItem === "new" ? handleAddItem : handleEditItem}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Change Password Modal */}
      {showChangePw && (
        <ChangePasswordModal
          password={currentPassword}
          onClose={() => setShowChangePw(false)}
          onChanged={(newPw) => {
            setCurrentPassword(newPw);
            setShowChangePw(false);
            showToast("Password changed! Remember your new password.");
          }}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}

// ── Login Screen ───────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!password) { setError("Please enter the admin password"); return; }
    setLoading(true);
    setError("");
    try {
      const ok = await apiVerify(password);
      if (ok) { onLogin(password); }
      // SECURITY: 비밀번호 평문 노출 제거 (2026-04-30)
      else { setError("비밀번호가 일치하지 않습니다. 관리자에게 문의하세요."); }
    } catch {
      setError("Server connection failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d1117",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Manrope,sans-serif", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 380,
        background: "#161b22", borderRadius: 24, padding: "40px 32px",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: "0 auto 16px",
            background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>🛡️</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#ECFDF5", letterSpacing: "-0.5px" }}>Admin Login</div>
          <div style={{ fontSize: 11, color: "rgba(110,231,183,0.5)", marginTop: 4 }}>HebronGuide Content Manager</div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Admin password"
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, padding: "12px 16px", color: "#ECFDF5",
              fontSize: 14, fontFamily: "Manrope,sans-serif", outline: "none", width: "100%",
              boxSizing: "border-box",
            }}
            autoFocus
          />
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#F87171" }}>
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: loading ? "rgba(201,162,39,0.1)" : "rgba(201,162,39,0.2)",
              border: "1px solid rgba(201,162,39,0.4)",
              borderRadius: 10, padding: "12px 24px",
              color: GOLD, fontFamily: "Manrope,sans-serif", fontWeight: 800, fontSize: 13,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease", letterSpacing: "0.5px",
            }}
          >
            {loading ? "Verifying..." : "🔐 Enter Admin Panel"}
          </button>
        </div>

        <div style={{ marginTop: 24, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(236,253,245,0.4)", letterSpacing: "0.5px", marginBottom: 4 }}>⚠️ ADMIN ONLY</div>
          {/* // SECURITY: 비밀번호 평문 노출 제거 (2026-04-30) */}
          <div style={{ fontSize: 10, color: "rgba(236,253,245,0.3)", lineHeight: 1.6 }}>
            Authorized administrators only / 관리자 전용
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────
export function AdminPage() {
  const [password, setPassword] = useState<string | null>(() => sessionStorage.getItem("admin_pw"));

  const handleLogin = (pw: string) => {
    sessionStorage.setItem("admin_pw", pw);
    setPassword(pw);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_pw");
    setPassword(null);
  };

  if (!password) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard password={password} onLogout={handleLogout} />;
}

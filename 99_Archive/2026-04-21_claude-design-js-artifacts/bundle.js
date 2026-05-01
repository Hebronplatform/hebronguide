// === design-canvas.js ===

// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = [
    '.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}',
    '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}',
    '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}',
    '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}',
    '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
    '.dc-card{transition:box-shadow .15s,transform .15s}',
    '.dc-card *{scrollbar-width:none}',
    '.dc-card *::-webkit-scrollbar{display:none}',
    '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}',
    '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}',
    '.dc-grip:hover{background:rgba(0,0,0,.08)}',
    '.dc-grip:active{cursor:grabbing}',
    '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}',
    '.dc-labeltext:hover{background:rgba(0,0,0,.05)}',
    '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;',
    '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;',
    '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}',
    '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}',
    '[data-dc-slot]:hover .dc-expand{opacity:1}',
  ].join('\n');
  document.head.appendChild(s);
}

const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';

function DesignCanvas({ children, minScale, maxScale, style }) {
  const [state, setState] = React.useState({ sections: {}, focus: null });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);

  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE)
      .then((r) => (r.ok ? r.json() : null))
      .then((saved) => {
        if (off || !saved || !saved.sections) return;
        skipNextWrite.current = true;
        setState((s) => ({ ...s, sections: saved.sections }));
      })
      .catch(() => {})
      .finally(() => { didRead.current = true; if (!off) setReady(true); });
    const t = setTimeout(() => { if (!off) setReady(true); }, 150);
    return () => { off = true; clearTimeout(t); };
  }, []);

  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({ sections: state.sections })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {};     // slotId -> { sectionId, artboard }
  const sectionMeta = {};  // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, (sec) => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, (ab) => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = { sectionId: sid, artboard: ab };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter((k) => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter((k) => !kept.includes(k))],
    };
  });

  const api = React.useMemo(() => ({
    state,
    section: (id) => state.sections[id] || {},
    patchSection: (id, p) => setState((s) => ({
      ...s,
      sections: { ...s.sections, [id]: { ...s.sections[id], ...(typeof p === 'function' ? p(s.sections[id] || {}) : p) } },
    })),
    setFocus: (slotId) => setState((s) => ({ ...s, focus: slotId })),
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') api.setFocus(null); };
    const onPd = (e) => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);

  return (
    <DCCtx.Provider value={api}>
      <DCViewport minScale={minScale} maxScale={maxScale} style={style}>{ready && children}</DCViewport>
      {state.focus && registry[state.focus] && (
        <DCFocusOverlay entry={registry[state.focus]} sectionMeta={sectionMeta} sectionOrder={sectionOrder} />
      )}
    </DCCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({ children, minScale = 0.1, maxScale = 8, style = {} }) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({ x: 0, y: 0, scale: 1 });

  const apply = React.useCallback(() => {
    const { x, y, scale } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;

    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = (e) =>
      e.deltaMode !== 0 ||
      (e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40);

    const onWheel = (e) => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = (e) => { e.preventDefault(); isGesturing = true; gsBase = tf.current.scale; };
    const onGestureChange = (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, (gsBase * e.scale) / tf.current.scale);
    };
    const onGestureEnd = (e) => { e.preventDefault(); isGesturing = false; };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = (e) => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || (e.button === 0 && onBg))) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('gesturestart', onGestureStart, { passive: false });
    vp.addEventListener('gesturechange', onGestureChange, { passive: false });
    vp.addEventListener('gestureend', onGestureEnd, { passive: false });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);

  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return (
    <div
      ref={vpRef}
      className="design-canvas"
      style={{
        height: '100vh', width: '100vw',
        background: DC.bg,
        overflow: 'hidden',
        overscrollBehavior: 'none',
        touchAction: 'none',
        position: 'relative',
        fontFamily: DC.font,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div
        ref={worldRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          transformOrigin: '0 0',
          willChange: 'transform',
          width: 'max-content', minWidth: '100%',
          minHeight: '100%',
          padding: '60px 0 80px',
        }}
      >
        <div style={{ position: 'absolute', inset: -6000, backgroundImage: gridSvg, backgroundSize: '120px 120px', pointerEvents: 'none', zIndex: -1 }} />
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({ id, title, subtitle, children, gap = 48 }) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter((c) => c && c.type === DCArtboard);
  const rest = all.filter((c) => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map((a) => a.props.id ?? a.props.label);
  const sec = (ctx && sid && ctx.section(sid)) || {};

  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter((k) => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter((k) => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);

  const byId = Object.fromEntries(artboards.map((a) => [a.props.id ?? a.props.label, a]));

  return (
    <div data-dc-section={sid} style={{ marginBottom: 80, position: 'relative' }}>
      <div style={{ padding: '0 60px 56px' }}>
        <DCEditable tag="div" value={sec.title ?? title}
          onChange={(v) => ctx && sid && ctx.patchSection(sid, { title: v })}
          style={{ fontSize: 28, fontWeight: 600, color: DC.title, letterSpacing: -0.4, marginBottom: 6, display: 'inline-block' }} />
        {subtitle && <div style={{ fontSize: 16, color: DC.subtitle }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', gap, padding: '0 60px', alignItems: 'flex-start', width: 'max-content' }}>
        {order.map((k) => (
          <DCArtboardFrame key={k} sectionId={sid} artboard={byId[k]} order={order}
            label={(sec.labels || {})[k] ?? byId[k].props.label}
            onRename={(v) => ctx && ctx.patchSection(sid, (x) => ({ labels: { ...x.labels, [k]: v } }))}
            onReorder={(next) => ctx && ctx.patchSection(sid, { order: next })}
            onFocus={() => ctx && ctx.setFocus(`${sid}/${k}`)} />
        ))}
      </div>
      {rest}
    </div>
  );
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() { return null; }

function DCArtboardFrame({ sectionId, artboard, label, order, onRename, onReorder, onFocus }) {
  const { id: rawId, label: rawLabel, width = 260, height = 480, children, style = {} } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map((el) => ({ el, id: el.dataset.dcSlot, x: el.getBoundingClientRect().left }));
    const slotXs = homes.map((h) => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');

    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };

    const move = (ev) => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0, best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) { best = d; nearest = i; }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter((k) => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };

    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) { h.el.style.transition = 'none'; h.el.style.transform = ''; }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  return (
    <div ref={ref} data-dc-slot={id} style={{ position: 'relative', flexShrink: 0 }}>
      <div className="dc-labelrow" style={{ position: 'absolute', bottom: '100%', left: -4, marginBottom: 4, color: DC.label }}>
        <div className="dc-grip" onPointerDown={onGripDown} title="Drag to reorder">
          <svg width="9" height="13" viewBox="0 0 9 13" fill="currentColor"><circle cx="2" cy="2" r="1.1"/><circle cx="7" cy="2" r="1.1"/><circle cx="2" cy="6.5" r="1.1"/><circle cx="7" cy="6.5" r="1.1"/><circle cx="2" cy="11" r="1.1"/><circle cx="7" cy="11" r="1.1"/></svg>
        </div>
        <div className="dc-labeltext" onClick={onFocus} title="Click to focus">
          <DCEditable value={label} onChange={onRename} onClick={(e) => e.stopPropagation()}
            style={{ fontSize: 15, fontWeight: 500, color: DC.label, lineHeight: 1 }} />
        </div>
      </div>
      <button className="dc-expand" onClick={onFocus} onPointerDown={(e) => e.stopPropagation()} title="Focus">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"/></svg>
      </button>
      <div className="dc-card"
        style={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)', overflow: 'hidden', width, height, background: '#fff', ...style }}>
        {children || <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 13, fontFamily: DC.font }}>{id}</div>}
      </div>
    </div>
  );
}

// Inline rename — commits on blur or Enter.
function DCEditable({ value, onChange, style, tag = 'span', onClick }) {
  const T = tag;
  return (
    <T className="dc-editable" contentEditable suppressContentEditableWarning
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => onChange && onChange(e.currentTarget.textContent)}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
      style={style}>{value}</T>
  );
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({ entry, sectionMeta, sectionOrder }) {
  const ctx = React.useContext(DCCtx);
  const { sectionId, artboard } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);

  const go = (d) => { const n = peers[(idx + d + peers.length) % peers.length]; if (n) ctx.setFocus(`${sectionId}/${n}`); };
  const goSection = (d) => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };

  React.useEffect(() => {
    const k = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); goSection(-1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); goSection(1); }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });

  const { width = 260, height = 480, children } = artboard.props;
  const [vp, setVp] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  React.useEffect(() => { const r = () => setVp({ w: window.innerWidth, h: window.innerHeight }); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));

  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({ dir, onClick }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ position: 'absolute', top: '50%', [dir]: 28, transform: 'translateY(-50%)',
        border: 'none', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.9)',
        width: 44, height: 44, borderRadius: 22, fontSize: 18, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.08)')}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d={dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'} /></svg>
    </button>
  );

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(
    <div onClick={() => ctx.setFocus(null)}
      onWheel={(e) => e.preventDefault()}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(24,20,16,.6)', backdropFilter: 'blur(14px)',
        fontFamily: DC.font, color: '#fff' }}>

      {/* top bar: section dropdown (left) · close (right) */}
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 72, display: 'flex', alignItems: 'flex-start', padding: '16px 20px 0', gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDd((o) => !o)}
            style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', padding: '6px 8px',
              borderRadius: 6, textAlign: 'left', fontFamily: 'inherit' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>{meta.title}</span>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ opacity: .7 }}><path d="M2 4l3.5 3.5L9 4"/></svg>
            </span>
            {meta.subtitle && <span style={{ display: 'block', fontSize: 13, opacity: .6, fontWeight: 400, marginTop: 2 }}>{meta.subtitle}</span>}
          </button>
          {ddOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#2a251f', borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,.4)', padding: 4, minWidth: 200, zIndex: 10 }}>
              {sectionOrder.map((sid) => (
                <button key={sid} onClick={() => { setDd(false); const f = sectionMeta[sid].slotIds[0]; if (f) ctx.setFocus(`${sid}/${f}`); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent', color: '#fff',
                    padding: '8px 12px', borderRadius: 5, fontSize: 14, fontWeight: sid === sectionId ? 600 : 400, fontFamily: 'inherit' }}>
                  {sectionMeta[sid].title}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => ctx.setFocus(null)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,.7)', width: 32, height: 32,
            borderRadius: 16, fontSize: 20, cursor: 'pointer', lineHeight: 1, transition: 'background .12s' }}>×</button>
      </div>

      {/* card centered, label + index below — only the card itself stops
          propagation so any backdrop click (including the margins around
          the card) exits focus */}
      <div
        style={{ position: 'absolute', top: 64, bottom: 56, left: 100, right: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: width * scale, height: height * scale, position: 'relative' }}>
          <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#fff', borderRadius: 2, overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,.4)' }}>
            {children || <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb' }}>{aid}</div>}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ fontSize: 14, fontWeight: 500, opacity: .85, textAlign: 'center' }}>
          {(sec.labels || {})[aid] ?? artboard.props.label}
          <span style={{ opacity: .5, marginLeft: 10, fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {peers.length}</span>
        </div>
      </div>

      <Arrow dir="left" onClick={() => go(-1)} />
      <Arrow dir="right" onClick={() => go(1)} />

      {/* dots */}
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {peers.map((p, i) => (
          <button key={p} onClick={() => ctx.setFocus(`${sectionId}/${p}`)}
            style={{ border: 'none', padding: 0, cursor: 'pointer', width: 6, height: 6, borderRadius: 3,
              background: i === idx ? '#fff' : 'rgba(255,255,255,.3)' }} />
        ))}
      </div>
    </div>,
    document.body,
  );
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({ children, top, left, right, bottom, rotate = -2, width = 180 }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom, width,
      background: DC.postitBg, padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14, lineHeight: 1.4, color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5,
    }}>{children}</div>
  );
}

Object.assign(window, { DesignCanvas, DCSection, DCArtboard, DCPostIt });


// === editorial.js ===
// Variant A — Editorial Guide
// Minimal, long-form reading. Serif editorial feel. Cool neutrals + Puget Sound blue.

function EditorialVariant() {
  const [tab, setTab] = React.useState('housing');
  const [savedItems, setSavedItems] = React.useState(new Set(['dol-guide']));

  const toggleSave = (id) => {
    setSavedItems(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const categories = [
    { id: 'housing', ko: '주거', en: 'Housing' },
    { id: 'license', ko: '운전면허', en: 'Driver License' },
    { id: 'banking', ko: '은행·세금', en: 'Banking & Tax' },
    { id: 'health', ko: '의료', en: 'Healthcare' },
    { id: 'school', ko: '학교·육아', en: 'Schools' },
    { id: 'community', ko: '커뮤니티', en: 'Community' },
  ];

  const featured = {
    housing: {
      kicker: 'CHAPTER 01 · 주거',
      title: '비가 많이 오는 도시에서,\n집을 고르는 법',
      dek: '시애틀의 첫 집은 단지 잠자는 곳이 아닙니다. 통근, 학군, 습도까지 — 한 번의 결정이 1년을 좌우합니다.',
      readTime: '12분',
      updated: '3일 전 업데이트',
    },
  };

  const articles = [
    { id: 'dol-guide', cat: '운전면허', title: 'WA 운전면허 취득, 단계별 완벽 가이드', author: 'Eliana K.', time: '8분', tag: '필수' },
    { id: 'rent', cat: '주거', title: '렌트 계약 전, 반드시 확인할 7가지', author: 'Joon P.', time: '6분', tag: '인기' },
    { id: 'ssn', cat: '은행·세금', title: 'SSN 없이 은행 계좌 여는 법', author: 'Hana L.', time: '5분', tag: '' },
    { id: 'insurance', cat: '의료', title: '건강보험 Apple Health vs 사보험', author: 'Dr. Min', time: '10분', tag: '업데이트' },
    { id: 'school', cat: '학교', title: '시애틀 공립학교 배정 시스템', author: 'Sora C.', time: '7분', tag: '' },
    { id: 'church', cat: '커뮤니티', title: '한인 교회·모임 지도', author: 'HebronGuide', time: '4분', tag: '' },
  ];

  return (
    <div style={edStyles.root}>
      {/* Top nav */}
      <header style={edStyles.header}>
        <div style={edStyles.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={edStyles.mark}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M3 18V4l8 5 8-5v14" stroke="#1a2a3a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="1.6" fill="#3a6b8a"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 500, letterSpacing: -0.3, color: '#1a2a3a' }}>
                HebronGuide
              </div>
              <div style={{ fontSize: 10.5, letterSpacing: 1.2, color: '#6a7888', textTransform: 'uppercase', marginTop: -2 }}>
                시애틀 정착 저널
              </div>
            </div>
          </div>
          <nav style={edStyles.nav}>
            <a style={edStyles.navLink}>가이드</a>
            <a style={edStyles.navLink}>체크리스트</a>
            <a style={edStyles.navLink}>지도</a>
            <a style={edStyles.navLink}>커뮤니티</a>
            <a style={edStyles.navLink}>FAQ</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={edStyles.searchBtn}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5L13 13"/>
              </svg>
              <span>검색</span>
              <kbd style={edStyles.kbd}>⌘K</kbd>
            </button>
            <button style={edStyles.loginBtn}>로그인</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={edStyles.hero}>
        <div style={edStyles.heroInner}>
          <div style={{ flex: '1 1 560px' }}>
            <div style={edStyles.kicker}>{featured.housing.kicker}</div>
            <h1 style={edStyles.h1}>{featured.housing.title}</h1>
            <p style={edStyles.dek}>{featured.housing.dek}</p>
            <div style={edStyles.meta}>
              <span>읽기 {featured.housing.readTime}</span>
              <span style={edStyles.dot}>·</span>
              <span>{featured.housing.updated}</span>
              <span style={edStyles.dot}>·</span>
              <span>검증: Seattle WA 거주 10년차 3명</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button style={edStyles.primaryBtn}>가이드 읽기 →</button>
              <button style={edStyles.ghostBtn}>나중에 저장</button>
            </div>
          </div>
          <div style={edStyles.heroArt}>
            <div style={edStyles.heroArtInner}>
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, rgba(58,107,138,0.08) 0 2px, transparent 2px 14px)' }} />
              <div style={{ position: 'absolute', left: 28, top: 28, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10.5, color: '#3a6b8a', letterSpacing: 0.8 }}>
                FIG. 01 — AREA MAP / SEATTLE
              </div>
              {/* simple topo */}
              <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 400 300" preserveAspectRatio="none">
                <path d="M0 180 Q 80 140 160 170 T 320 150 T 420 180" fill="none" stroke="#3a6b8a" strokeWidth="1.1" opacity="0.45"/>
                <path d="M0 200 Q 80 165 160 190 T 320 175 T 420 200" fill="none" stroke="#3a6b8a" strokeWidth="1.1" opacity="0.35"/>
                <path d="M0 225 Q 80 195 160 215 T 320 200 T 420 225" fill="none" stroke="#3a6b8a" strokeWidth="1.1" opacity="0.25"/>
                <circle cx="160" cy="175" r="4" fill="#c2503a"/>
                <text x="170" y="170" fontSize="9" fill="#1a2a3a" fontFamily="JetBrains Mono, monospace">Ballard</text>
                <circle cx="240" cy="155" r="4" fill="#c2503a"/>
                <text x="250" y="150" fontSize="9" fill="#1a2a3a" fontFamily="JetBrains Mono, monospace">Capitol Hill</text>
                <circle cx="200" cy="195" r="4" fill="#c2503a"/>
                <text x="210" y="208" fontSize="9" fill="#1a2a3a" fontFamily="JetBrains Mono, monospace">Downtown</text>
              </svg>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 10, color: '#6a7888', marginTop: 10, letterSpacing: 0.4 }}>
              ▲ 동네별 렌트 중간값, 통근시간, 학군 점수 비교 →
            </div>
          </div>
        </div>
      </section>

      {/* Category rail */}
      <section style={edStyles.catRail}>
        <div style={edStyles.catInner}>
          <div style={edStyles.catLabel}>챕터</div>
          <div style={edStyles.catList}>
            {categories.map(c => (
              <button key={c.id} onClick={() => setTab(c.id)}
                style={{ ...edStyles.catChip, ...(tab === c.id ? edStyles.catChipActive : {}) }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500 }}>{c.ko}</span>
                <span style={edStyles.catEn}>{c.en}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section style={edStyles.articles}>
        <div style={edStyles.articlesInner}>
          <div style={edStyles.sectionHead}>
            <div>
              <h2 style={edStyles.h2}>최근 업데이트된 가이드</h2>
              <p style={edStyles.sectionDek}>시애틀 한인 기여자 24명이 작성하고 상호 검증합니다.</p>
            </div>
            <a style={edStyles.seeAll}>전체 보기 →</a>
          </div>
          <div style={edStyles.grid}>
            {articles.map((a, i) => (
              <article key={a.id} style={{ ...edStyles.card, ...(i === 0 ? edStyles.cardWide : {}) }}>
                <div style={edStyles.cardTop}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={edStyles.cardCat}>{a.cat}</span>
                    {a.tag && <span style={{ ...edStyles.cardTag, ...(a.tag === '필수' ? { background: '#c2503a', color: '#fff' } : {}) }}>{a.tag}</span>}
                  </div>
                  <button onClick={() => toggleSave(a.id)} style={edStyles.saveBtn}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill={savedItems.has(a.id) ? '#c2503a' : 'none'} stroke={savedItems.has(a.id) ? '#c2503a' : '#6a7888'} strokeWidth="1.5">
                      <path d="M3 2h8v11l-4-2.5L3 13V2z"/>
                    </svg>
                  </button>
                </div>
                <h3 style={{ ...edStyles.cardTitle, ...(i === 0 ? { fontSize: 24 } : {}) }}>{a.title}</h3>
                <div style={edStyles.cardFoot}>
                  <span>{a.author}</span>
                  <span style={edStyles.dot}>·</span>
                  <span>{a.time}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist CTA */}
      <section style={edStyles.checklistSec}>
        <div style={edStyles.checklistInner}>
          <div style={{ flex: 1 }}>
            <div style={{ ...edStyles.kicker, color: '#d9c0a3' }}>개인 체크리스트</div>
            <h2 style={{ ...edStyles.h2, color: '#faf7f2', marginTop: 12 }}>도착 D-30일부터,<br/>정착 완료까지 한 눈에.</h2>
            <p style={{ color: 'rgba(250,247,242,0.75)', fontSize: 16, lineHeight: 1.6, maxWidth: 460, marginTop: 14 }}>
              SSN 신청 · 렌트 계약 · 운전면허 · 인터넷 · 공과금 · 병원 등록 — 42개 항목을 순서대로 안내합니다.
            </p>
            <button style={{ ...edStyles.primaryBtn, background: '#faf7f2', color: '#1a2a3a', marginTop: 22 }}>내 체크리스트 만들기 →</button>
          </div>
          <div style={edStyles.checklistCard}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#6a7888', letterSpacing: 1 }}>MY CHECKLIST · 68%</div>
            <div style={{ height: 6, background: '#e8e3dc', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', background: '#c2503a' }} />
            </div>
            {[
              { t: 'SSN 카드 수령', done: true },
              { t: '아파트 계약 · 보증금 납부', done: true },
              { t: 'WA 운전면허 · 지식시험', done: true },
              { t: '병원 PCP 등록', done: false },
              { t: '자녀 학교 등록 서류', done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 4 ? '1px solid #ece7df' : 'none' }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, border: '1.5px solid ' + (item.done ? '#c2503a' : '#c9c1b3'), background: item.done ? '#c2503a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.done && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7L8 1.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                </div>
                <span style={{ fontSize: 14, color: item.done ? '#9aa0a8' : '#1a2a3a', textDecoration: item.done ? 'line-through' : 'none' }}>{item.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={edStyles.footer}>
        <div style={edStyles.footerInner}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: '#1a2a3a' }}>HebronGuide</div>
          <div style={{ fontSize: 13, color: '#6a7888' }}>시애틀 한인 정착 저널 · 24명의 기여자가 함께 씁니다 · © 2026</div>
        </div>
      </footer>
    </div>
  );
}

const edStyles = {
  root: { fontFamily: '"Noto Sans KR", -apple-system, sans-serif', background: '#faf7f2', color: '#1a2a3a', minHeight: '100%' },
  header: { borderBottom: '1px solid #ece7df', background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 },
  headerInner: { maxWidth: 1200, margin: '0 auto', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 40 },
  mark: { width: 34, height: 34, borderRadius: 2, background: '#faf7f2', border: '1.5px solid #1a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nav: { display: 'flex', gap: 28, flex: 1 },
  navLink: { fontSize: 14, color: '#3a4a5a', cursor: 'pointer', fontWeight: 500 },
  searchBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #ece7df', borderRadius: 2, background: '#faf7f2', fontSize: 13, color: '#6a7888', cursor: 'pointer' },
  kbd: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '2px 5px', background: '#ece7df', borderRadius: 2, color: '#6a7888' },
  loginBtn: { padding: '8px 16px', background: '#1a2a3a', color: '#faf7f2', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  hero: { padding: '80px 40px 60px' },
  heroInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' },
  kicker: { fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontSize: 11, letterSpacing: 2, color: '#c2503a', textTransform: 'uppercase', marginBottom: 20 },
  h1: { fontFamily: 'Fraunces, Georgia, serif', fontSize: 56, fontWeight: 400, lineHeight: 1.05, letterSpacing: -1.2, margin: 0, color: '#1a2a3a', whiteSpace: 'pre-line', textWrap: 'balance' },
  dek: { fontSize: 18, lineHeight: 1.6, color: '#3a4a5a', marginTop: 24, maxWidth: 520 },
  meta: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#6a7888', marginTop: 22 },
  dot: { color: '#c9c1b3' },
  primaryBtn: { padding: '14px 24px', background: '#1a2a3a', color: '#faf7f2', border: 'none', borderRadius: 2, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  ghostBtn: { padding: '14px 24px', background: 'transparent', color: '#1a2a3a', border: '1px solid #1a2a3a', borderRadius: 2, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  heroArt: { flex: '1 1 400px', minWidth: 400 },
  heroArtInner: { position: 'relative', height: 320, background: '#f3efe7', border: '1px solid #ece7df', overflow: 'hidden' },
  catRail: { borderTop: '1px solid #ece7df', borderBottom: '1px solid #ece7df', background: '#f3efe7' },
  catInner: { maxWidth: 1200, margin: '0 auto', padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 20 },
  catLabel: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 2, color: '#6a7888', textTransform: 'uppercase' },
  catList: { display: 'flex', gap: 8, flex: 1, overflow: 'hidden' },
  catChip: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'transparent', border: '1px solid transparent', borderRadius: 2, cursor: 'pointer', fontSize: 14, color: '#3a4a5a', transition: 'all .15s' },
  catChipActive: { background: '#faf7f2', border: '1px solid #1a2a3a', color: '#1a2a3a' },
  catEn: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9aa0a8', letterSpacing: 0.5 },
  articles: { padding: '80px 40px' },
  articlesInner: { maxWidth: 1200, margin: '0 auto' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 },
  h2: { fontFamily: 'Fraunces, Georgia, serif', fontSize: 38, fontWeight: 400, letterSpacing: -0.8, margin: 0, lineHeight: 1.15 },
  sectionDek: { fontSize: 15, color: '#6a7888', marginTop: 10 },
  seeAll: { fontSize: 14, color: '#c2503a', cursor: 'pointer', fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#ece7df', border: '1px solid #ece7df' },
  card: { background: '#faf7f2', padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20, cursor: 'pointer', transition: 'background .15s', minHeight: 210 },
  cardWide: { gridColumn: 'span 2', background: '#f3efe7', minHeight: 260 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardCat: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, letterSpacing: 1.2, color: '#6a7888', textTransform: 'uppercase' },
  cardTag: { fontSize: 10.5, padding: '3px 8px', background: '#ece7df', color: '#3a4a5a', borderRadius: 2, fontWeight: 500, letterSpacing: 0.4 },
  saveBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 },
  cardTitle: { fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.3, margin: 0, flex: 1, color: '#1a2a3a' },
  cardFoot: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#6a7888' },
  checklistSec: { background: '#1a2a3a', padding: '80px 40px' },
  checklistInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' },
  checklistCard: { flex: '1 1 380px', minWidth: 360, background: '#faf7f2', padding: 28, borderRadius: 2 },
  footer: { borderTop: '1px solid #ece7df', padding: '32px 40px' },
  footerInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
};

window.EditorialVariant = EditorialVariant;

// === warm.js ===
// Variant B — Warm Companion
// Friendly companion for newcomers. Warm terracotta + cream. Soft, approachable.

function WarmVariant() {
  const [mood, setMood] = React.useState(null);
  const moods = [
    { id: 'arriving', emoji: '✈', label: '곧 도착해요', days: 'D-14 ~ D-0' },
    { id: 'settling', emoji: '📦', label: '정착 중', days: '1~3개월차' },
    { id: 'living', emoji: '🏡', label: '생활 중', days: '3개월+' },
  ];

  return (
    <div style={warmStyles.root}>
      {/* Paper grain */}
      <div style={warmStyles.grain} />

      {/* Top bar */}
      <header style={warmStyles.header}>
        <div style={warmStyles.headerInner}>
          <div style={warmStyles.brand}>
            <div style={warmStyles.brandMark}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M5 21V7l8-4 8 4v14M9 21v-7h8v7" stroke="#5c3a1f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#5c3a1f', letterSpacing: -0.3 }}>HebronGuide</div>
              <div style={{ fontSize: 11, color: '#a07c5a', marginTop: -1 }}>시애틀 정착의 동반자</div>
            </div>
          </div>
          <nav style={warmStyles.nav}>
            <a style={warmStyles.navLink}>여정</a>
            <a style={warmStyles.navLink}>가이드</a>
            <a style={warmStyles.navLink}>동네</a>
            <a style={warmStyles.navLink}>이웃</a>
          </nav>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button style={warmStyles.ghostBtn}>로그인</button>
            <button style={warmStyles.primaryBtn}>여정 시작</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={warmStyles.hero}>
        <div style={warmStyles.heroInner}>
          <div style={warmStyles.badge}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: '#c2503a', display: 'inline-block' }} />
            지금 시애틀에 2,430명이 정착 중
          </div>
          <h1 style={warmStyles.h1}>
            시애틀은 처음이라,<br/>
            <span style={warmStyles.h1Accent}>혼자가 아니면 좋겠어요.</span>
          </h1>
          <p style={warmStyles.dek}>
            비행기 표를 끊은 순간부터 첫 감사절까지 —<br/>
            먼저 정착한 한인들이 쓴 실전 가이드와 체크리스트,<br/>
            그리고 옆동네 이웃들이 함께합니다.
          </p>

          {/* Mood picker */}
          <div style={warmStyles.moodCard}>
            <div style={warmStyles.moodLabel}>지금 어떤 단계에 계세요?</div>
            <div style={warmStyles.moodRow}>
              {moods.map(m => (
                <button key={m.id} onClick={() => setMood(m.id)}
                  style={{ ...warmStyles.moodBtn, ...(mood === m.id ? warmStyles.moodBtnActive : {}) }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{m.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#5c3a1f' }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: '#a07c5a', marginTop: 2 }}>{m.days}</div>
                </button>
              ))}
            </div>
            {mood && (
              <div style={warmStyles.moodResult}>
                <div style={{ fontSize: 14, color: '#5c3a1f', lineHeight: 1.5 }}>
                  ✓ <b>{moods.find(m => m.id === mood).label}</b>에 맞는 우선순위 12가지를 준비했어요.
                </div>
                <button style={warmStyles.primaryBtn}>내 여정 보기 →</button>
              </div>
            )}
          </div>
        </div>

        {/* Decorative rain */}
        <div style={warmStyles.rainCol}>
          <svg width="100%" height="100%" viewBox="0 0 200 400" preserveAspectRatio="none">
            {[...Array(40)].map((_, i) => {
              const x = (i * 37) % 200;
              const y = (i * 23) % 400;
              return <line key={i} x1={x} y1={y} x2={x - 3} y2={y + 14} stroke="#c2503a" strokeWidth="1" opacity={0.15 + (i % 3) * 0.1} strokeLinecap="round"/>
            })}
          </svg>
        </div>
      </section>

      {/* Journey steps */}
      <section style={warmStyles.journey}>
        <div style={warmStyles.journeyInner}>
          <div style={warmStyles.eyebrow}>정착 여정 · 6단계</div>
          <h2 style={warmStyles.h2}>처음부터 끝까지, 함께 걸어요</h2>
          <div style={warmStyles.stepsRow}>
            {[
              { n: '01', t: '비행 전 준비', d: '서류·송금·예방접종', color: '#e8dcc8' },
              { n: '02', t: '도착 첫 주', d: 'SSN·숙소·교통', color: '#ecc9a8' },
              { n: '03', t: '집 찾기', d: '동네·렌트·가구', color: '#e8b088' },
              { n: '04', t: '기반 세우기', d: '면허·은행·통신', color: '#d89a6e' },
              { n: '05', t: '일상 만들기', d: '병원·학교·교회', color: '#c48659' },
              { n: '06', t: '뿌리내리기', d: '세금·영주권·커뮤니티', color: '#a6704a' },
            ].map((s, i) => (
              <div key={i} style={{ ...warmStyles.stepCard, background: s.color }}>
                <div style={warmStyles.stepNum}>{s.n}</div>
                <div style={warmStyles.stepTitle}>{s.t}</div>
                <div style={warmStyles.stepDesc}>{s.d}</div>
                <div style={warmStyles.stepArrow}>→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhood */}
      <section style={warmStyles.neighborhood}>
        <div style={warmStyles.neighborhoodInner}>
          <div>
            <div style={warmStyles.eyebrow}>동네 살펴보기</div>
            <h2 style={warmStyles.h2}>어디서 살지, 고민이라면</h2>
            <p style={{ fontSize: 16, color: '#8a6a4a', lineHeight: 1.6, marginTop: 14, maxWidth: 520 }}>
              Bellevue의 한인타운, Issaquah의 학군, Lynnwood의 렌트 —<br/>
              12개 동네를 직접 살아본 이웃이 알려드려요.
            </p>
          </div>
          <div style={warmStyles.hoodGrid}>
            {[
              { n: 'Bellevue', kr: '벨뷰', r: '★★★★★', note: '한인 밀집 · 학군 최고', rent: '$2,800' },
              { n: 'Lynnwood', kr: '린우드', r: '★★★★☆', note: '한인마트 · 합리적', rent: '$2,100' },
              { n: 'Issaquah', kr: '이사콰', r: '★★★★★', note: '자연 · 조용함', rent: '$2,600' },
              { n: 'Federal Way', kr: '페더럴웨이', r: '★★★☆☆', note: '저렴 · 통근 길어', rent: '$1,800' },
            ].map((h, i) => (
              <div key={i} style={warmStyles.hoodCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#5c3a1f' }}>{h.kr}</div>
                    <div style={{ fontSize: 12, color: '#a07c5a', marginTop: 1 }}>{h.n}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#c2503a' }}>{h.r}</div>
                </div>
                <div style={{ fontSize: 13, color: '#6a4a2a', marginTop: 14, lineHeight: 1.5 }}>{h.note}</div>
                <div style={{ borderTop: '1px dashed #d4bfa3', marginTop: 14, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#8a6a4a' }}>1BR 중간값</span>
                  <span style={{ color: '#5c3a1f', fontWeight: 700 }}>{h.rent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Letter card */}
      <section style={warmStyles.letter}>
        <div style={warmStyles.letterCard}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#a07c5a', textTransform: 'uppercase', marginBottom: 24 }}>이웃의 편지 · Vol.34</div>
          <div style={{ fontSize: 22, lineHeight: 1.6, color: '#5c3a1f', fontWeight: 500 }}>
            "3년 전 이맘때, 저도 정확히 같은 자리에 있었어요.<br/>
            SSN 줄 서고, 아이 학교 찾고, 김치 담글 배추 찾느라 헤맸죠.<br/>
            당신은 조금 덜 헤매면 좋겠어서, 씁니다."
          </div>
          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: '#d89a6e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>지</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#5c3a1f' }}>지수 · Redmond 거주 3년차</div>
              <div style={{ fontSize: 12, color: '#a07c5a' }}>기여자 · 가이드 12편 작성</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={warmStyles.footer}>
        <div style={{ fontSize: 14, color: '#a07c5a' }}>HebronGuide · 시애틀 정착의 동반자 · 먼저 온 이웃이 쓰는 가이드</div>
      </footer>
    </div>
  );
}

const warmStyles = {
  root: { fontFamily: '"Noto Sans KR", -apple-system, sans-serif', background: '#fbf3e8', color: '#5c3a1f', minHeight: '100%', position: 'relative', overflow: 'hidden' },
  grain: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(92,58,31,0.04) 1px, transparent 1px)', backgroundSize: '4px 4px', pointerEvents: 'none', zIndex: 0 },
  header: { padding: '20px 40px', position: 'relative', zIndex: 2 },
  headerInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 40 },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandMark: { width: 42, height: 42, borderRadius: 21, background: '#f5e3ca', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nav: { display: 'flex', gap: 28, flex: 1, marginLeft: 20 },
  navLink: { fontSize: 14, color: '#6a4a2a', fontWeight: 500, cursor: 'pointer' },
  ghostBtn: { padding: '9px 16px', background: 'transparent', color: '#5c3a1f', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  primaryBtn: { padding: '10px 18px', background: '#c2503a', color: '#fbf3e8', border: 'none', borderRadius: 28, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 0 rgba(92,58,31,0.15)' },
  hero: { maxWidth: 1200, margin: '0 auto', padding: '60px 40px 80px', display: 'flex', gap: 40, alignItems: 'flex-start', position: 'relative', zIndex: 2 },
  heroInner: { flex: 1 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#f5e3ca', borderRadius: 20, fontSize: 12, color: '#6a4a2a', marginBottom: 28 },
  h1: { fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.8, margin: 0, textWrap: 'balance' },
  h1Accent: { color: '#c2503a', fontStyle: 'italic', fontWeight: 500, fontFamily: 'Fraunces, Georgia, serif' },
  dek: { fontSize: 17, lineHeight: 1.7, color: '#8a6a4a', marginTop: 24 },
  moodCard: { background: '#fff', borderRadius: 20, padding: 28, marginTop: 40, boxShadow: '0 1px 0 #f0dfc3, 0 10px 30px rgba(92,58,31,0.06)', border: '1px solid #f0dfc3' },
  moodLabel: { fontSize: 14, color: '#6a4a2a', fontWeight: 600, marginBottom: 14 },
  moodRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  moodBtn: { padding: '18px 12px', background: '#fbf3e8', border: '2px solid transparent', borderRadius: 14, cursor: 'pointer', textAlign: 'center', transition: 'all .15s' },
  moodBtnActive: { background: '#fff', border: '2px solid #c2503a', boxShadow: '0 4px 16px rgba(194,80,58,0.15)' },
  moodResult: { marginTop: 18, padding: 16, background: '#fbf3e8', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  rainCol: { width: 140, alignSelf: 'stretch', opacity: 0.7 },
  journey: { background: '#f5e3ca', padding: '80px 40px', position: 'relative', zIndex: 2 },
  journeyInner: { maxWidth: 1200, margin: '0 auto' },
  eyebrow: { fontSize: 11, letterSpacing: 2, color: '#c2503a', textTransform: 'uppercase', fontWeight: 700, marginBottom: 14 },
  h2: { fontSize: 40, fontWeight: 800, letterSpacing: -1, margin: 0, color: '#5c3a1f' },
  stepsRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginTop: 40 },
  stepCard: { padding: '24px 18px', borderRadius: 16, position: 'relative', minHeight: 180, display: 'flex', flexDirection: 'column', cursor: 'pointer' },
  stepNum: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(92,58,31,0.6)', letterSpacing: 1 },
  stepTitle: { fontSize: 16, fontWeight: 700, color: '#5c3a1f', marginTop: 'auto', letterSpacing: -0.3 },
  stepDesc: { fontSize: 12, color: 'rgba(92,58,31,0.7)', marginTop: 4 },
  stepArrow: { position: 'absolute', top: 20, right: 18, fontSize: 18, color: 'rgba(92,58,31,0.4)' },
  neighborhood: { padding: '80px 40px', position: 'relative', zIndex: 2 },
  neighborhoodInner: { maxWidth: 1200, margin: '0 auto' },
  hoodGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 40 },
  hoodCard: { background: '#fff', borderRadius: 16, padding: 22, border: '1px solid #f0dfc3', cursor: 'pointer', transition: 'transform .15s' },
  letter: { padding: '20px 40px 80px', position: 'relative', zIndex: 2 },
  letterCard: { maxWidth: 780, margin: '0 auto', background: '#fff', borderRadius: 20, padding: '48px 56px', border: '1px solid #f0dfc3', transform: 'rotate(-0.3deg)', boxShadow: '0 10px 40px rgba(92,58,31,0.08)' },
  footer: { textAlign: 'center', padding: '40px 20px', borderTop: '1px solid #f0dfc3', position: 'relative', zIndex: 2 },
};

window.WarmVariant = WarmVariant;

// === utility.js ===
// Variant C — Modern Utility
// Dashboard-style. Search-first, checklist progress, data-forward.
// Dark UI option with clean neutrals + a single accent.

function UtilityVariant() {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [dark, setDark] = React.useState(false);

  const c = dark ? utilPalette.dark : utilPalette.light;

  const categories = [
    { id: 'all', label: '전체', count: 142 },
    { id: 'housing', label: '주거', count: 28 },
    { id: 'docs', label: '서류·신분', count: 34 },
    { id: 'car', label: '차·면허', count: 19 },
    { id: 'health', label: '의료', count: 16 },
    { id: 'kids', label: '학교·육아', count: 22 },
    { id: 'money', label: '금융·세금', count: 23 },
  ];

  const quickActions = [
    { icon: '⬡', label: 'SSN 예약', desc: 'ssa.gov 바로가기', hot: true },
    { icon: '⬢', label: 'DOL 예약', desc: '면허시험 슬롯 확인', hot: false },
    { icon: '◈', label: '렌트 계산기', desc: '월급 기준 적정 렌트', hot: false },
    { icon: '◉', label: '학교 조회', desc: '주소→배정학교 검색', hot: false },
  ];

  const results = [
    { cat: '서류', title: 'SSN 신청, 도착 후 며칠 뒤가 최적인가?', answer: '도착 후 10일 이후 방문 권장', updated: '2일 전', votes: 340 },
    { cat: '주거', title: '월세 계약서에서 반드시 협상할 조항 5가지', answer: 'pet deposit, late fee, renewal terms...', updated: '1주 전', votes: 218 },
    { cat: '차', title: 'Costco에서 차 구입 시 주의할 점', answer: 'Auto program 견적 + 딜러 가격 비교', updated: '3일 전', votes: 156 },
    { cat: '의료', title: 'ER 비용 청구서, 받았을 때 해야 할 것', answer: '청구서 항목 확인 → itemized bill 요청 → negotiation', updated: '5일 전', votes: 412 },
  ];

  return (
    <div style={{ ...utilStyles.root, background: c.bg, color: c.text }}>
      {/* Sidebar */}
      <aside style={{ ...utilStyles.sidebar, background: c.panel, borderRight: `1px solid ${c.line}` }}>
        <div style={utilStyles.brand}>
          <div style={{ ...utilStyles.brandMark, background: c.accent }}>HG</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: c.text, letterSpacing: -0.2 }}>HebronGuide</div>
            <div style={{ fontSize: 11, color: c.muted, marginTop: -1 }}>Seattle · v2.4</div>
          </div>
        </div>

        <div style={utilStyles.sideSection}>
          <div style={{ ...utilStyles.sideLabel, color: c.muted }}>탐색</div>
          {[
            { icon: '◐', label: '대시보드', active: true },
            { icon: '◌', label: '가이드 전체' },
            { icon: '◎', label: '내 체크리스트' },
            { icon: '◍', label: '지도 뷰' },
            { icon: '◉', label: '커뮤니티 Q&A' },
          ].map((item, i) => (
            <button key={i} style={{ ...utilStyles.sideItem, ...(item.active ? { background: c.accent, color: dark ? '#0a0a0b' : '#fff' } : { color: c.text }) }}>
              <span style={{ width: 16, fontSize: 13 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={utilStyles.sideSection}>
          <div style={{ ...utilStyles.sideLabel, color: c.muted }}>내 여정</div>
          <div style={{ padding: '12px 14px', background: c.panelDeep, borderRadius: 8, border: `1px solid ${c.line}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: c.muted, letterSpacing: 1, textTransform: 'uppercase' }}>진행률</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: c.text, fontVariantNumeric: 'tabular-nums' }}>68<span style={{ fontSize: 12, color: c.muted }}>%</span></span>
            </div>
            <div style={{ height: 4, background: c.line, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', background: c.accent }} />
            </div>
            <div style={{ fontSize: 11, color: c.muted, marginTop: 8 }}>다음: 병원 PCP 등록</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', padding: 14, borderTop: `1px solid ${c.line}` }}>
          <button onClick={() => setDark(!dark)} style={{ ...utilStyles.sideItem, width: '100%', color: c.text }}>
            <span style={{ width: 16, fontSize: 13 }}>{dark ? '☀' : '☾'}</span>
            <span>{dark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={utilStyles.main}>
        {/* Top bar */}
        <div style={{ ...utilStyles.topbar, borderBottom: `1px solid ${c.line}` }}>
          <div style={{ fontSize: 12, color: c.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: c.text }}>대시보드</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ ...utilStyles.iconBtn, color: c.text, borderColor: c.line }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1v3M7 10v3M1 7h3M10 7h3M2.5 2.5l2 2M9.5 9.5l2 2M2.5 11.5l2-2M9.5 4.5l2-2"/></svg>
            </button>
            <button style={{ ...utilStyles.iconBtn, color: c.text, borderColor: c.line }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5A4 4 0 1 0 3 5v3l-1 2h10l-1-2V5zM5 12a2 2 0 0 0 4 0"/></svg>
              <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, background: c.accent }} />
            </button>
            <div style={{ width: 30, height: 30, borderRadius: 15, background: c.accent, color: dark ? '#0a0a0b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>김</div>
          </div>
        </div>

        <div style={utilStyles.content}>
          {/* Greeting */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: c.muted, letterSpacing: 0.5, fontFamily: 'JetBrains Mono, monospace' }}>SEATTLE · 52°F · 이슬비</div>
            <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.8, margin: '6px 0 0', color: c.text }}>
              안녕하세요, 김정착님.
            </h1>
            <p style={{ fontSize: 15, color: c.muted, margin: '8px 0 0' }}>
              정착 72일차 · 오늘 할 일 <span style={{ color: c.accent, fontWeight: 600 }}>3개</span> · 이번주 가이드 업데이트 <span style={{ color: c.text, fontWeight: 600 }}>8개</span>
            </p>
          </div>

          {/* Search */}
          <div style={{ ...utilStyles.searchBox, background: c.panel, border: `1px solid ${c.line}` }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={c.muted} strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l4 4"/></svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="SSN, 렌트, 면허시험, 학교 배정... 무엇이든"
              style={{ ...utilStyles.searchInput, color: c.text }} />
            <kbd style={{ ...utilStyles.kbd, background: c.panelDeep, color: c.muted, border: `1px solid ${c.line}` }}>/</kbd>
          </div>

          {/* Quick actions */}
          <div style={utilStyles.quickGrid}>
            {quickActions.map((q, i) => (
              <button key={i} style={{ ...utilStyles.quickCard, background: c.panel, border: `1px solid ${c.line}`, color: c.text }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: c.panelDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: c.accent }}>{q.icon}</div>
                  {q.hot && <span style={{ fontSize: 10, padding: '2px 6px', background: c.accent, color: dark ? '#0a0a0b' : '#fff', borderRadius: 3, fontWeight: 600, letterSpacing: 0.3 }}>NEW</span>}
                </div>
                <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: c.text }}>{q.label}</div>
                <div style={{ fontSize: 12, color: c.muted, marginTop: 3 }}>{q.desc}</div>
              </button>
            ))}
          </div>

          {/* Filter + results */}
          <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: c.text, margin: 0, letterSpacing: -0.2 }}>답변이 필요한 질문들</h2>
              <div style={{ fontSize: 12, color: c.muted }}>정렬: 도움됨 순 ↓</div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setFilter(cat.id)}
                  style={{ ...utilStyles.filterChip, ...(filter === cat.id ? { background: c.text, color: c.bg, borderColor: c.text } : { color: c.text, borderColor: c.line, background: 'transparent' }) }}>
                  {cat.label}
                  <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 6, fontVariantNumeric: 'tabular-nums' }}>{cat.count}</span>
                </button>
              ))}
            </div>

            <div style={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, overflow: 'hidden' }}>
              {results.map((r, i) => (
                <div key={i} style={{ padding: '18px 20px', borderBottom: i < results.length - 1 ? `1px solid ${c.line}` : 'none', display: 'flex', gap: 18, alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ flex: '0 0 60px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: c.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>{r.votes}</div>
                    <div style={{ fontSize: 10, color: c.muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>도움됨</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: c.accent, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.5 }}>{r.cat.toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: c.muted }}>· {r.updated}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: c.text, letterSpacing: -0.1 }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: c.muted, marginTop: 4 }}>{r.answer}</div>
                  </div>
                  <div style={{ color: c.muted }}>→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const utilPalette = {
  light: { bg: '#fafaf9', panel: '#ffffff', panelDeep: '#f5f4f2', text: '#15171a', muted: '#8a8f96', line: '#eceae5', accent: '#2d6a4f' },
  dark:  { bg: '#0b0c0e', panel: '#131519', panelDeep: '#0f1114', text: '#f0efed', muted: '#8a8f96', line: '#22252b', accent: '#5ec08f' },
};

const utilStyles = {
  root: { fontFamily: '"Inter", "Noto Sans KR", -apple-system, sans-serif', minHeight: '100%', display: 'flex' },
  sidebar: { width: 240, flex: '0 0 240px', display: 'flex', flexDirection: 'column', padding: 18 },
  brand: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 18px' },
  brandMark: { width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: 0.5 },
  sideSection: { marginBottom: 20 },
  sideLabel: { fontSize: 10.5, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, padding: '0 8px', fontWeight: 600 },
  sideItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: 'none', background: 'transparent', borderRadius: 7, width: '100%', textAlign: 'left', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: { padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { position: 'relative', width: 32, height: 32, borderRadius: 7, border: '1px solid', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  content: { padding: '32px', flex: 1, maxWidth: 1100 },
  searchBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 10, marginBottom: 24 },
  searchInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, fontFamily: 'inherit' },
  kbd: { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '3px 7px', borderRadius: 4 },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  quickCard: { padding: 18, borderRadius: 10, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'transform .1s' },
  filterChip: { padding: '6px 12px', borderRadius: 18, border: '1px solid', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s' },
};

window.UtilityVariant = UtilityVariant;


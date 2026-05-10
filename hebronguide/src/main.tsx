import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

/* ─────────────────────────────────────────
   PWA 자동 업데이트 시스템
   환대 패턴 D-2 (자기 속도 존중) + 강요 없는 부드러운 알림
   📖 _hebron_codex/00_ecosystem/HOSPITALITY_PATTERNS.md Layer 4 F-3
───────────────────────────────────────── */

// Safari 감지 (호환성 분기에만 사용)
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function usePWAAutoUpdate() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    // 새 SW가 컨트롤을 가져가면 → 즉시 새로고침
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    const initSW = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;

        // 이미 대기 중인 SW → 모든 브라우저에서 사용자에게 배너 표시
        // (자동 reload는 사용자 흐름을 끊음 — 환대 패턴 D-2 자기 속도 존중)
        if (reg.waiting) setUpdateReady(true);

        // 새 SW 설치 감지
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });

        // 1분마다 업데이트 확인
        const checkInterval = setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 1000);

        return () => clearInterval(checkInterval);
      } catch (_) {}
    };

    initSW();

    // 탭 포커스 시 업데이트 확인
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration()
          .then(reg => reg?.update())
          .catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
    };
  }, []);

  return {
    updateReady,
    activateUpdate: async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      // Safari fallback — controllerchange 불안정
      setTimeout(() => window.location.reload(), isSafari ? 500 : 300);
    },
    dismiss: () => setUpdateReady(false),
  };
}

/* ─── 업데이트 알림 배너 — 환대 어조, 사용자 자기 속도 ─── */
function UpdateBanner() {
  const { updateReady, activateUpdate, dismiss } = usePWAAutoUpdate();
  const [busy, setBusy] = useState(false);

  if (!updateReady) return null;

  const onApply = async () => {
    setBusy(true);
    await activateUpdate();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'rgba(26,37,53,0.97)',
        border: '1px solid rgba(110,231,183,0.35)',
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
        minWidth: 280,
        maxWidth: 'min(calc(100vw - 32px), 380px)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>🌿</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: 12, color: '#ECFDF5' }}>
          새로운 정보가 도착했어요
        </div>
        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 10, color: 'rgba(236,253,245,0.6)', marginTop: 2, lineHeight: 1.4 }}>
          잠시만 새로 고치면 최신 안내를 보실 수 있어요
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="나중에"
        style={{
          background: 'transparent',
          border: 'none',
          padding: '6px 8px',
          fontFamily: 'Manrope,sans-serif',
          fontSize: 11,
          color: 'rgba(236,253,245,0.45)',
          cursor: 'pointer',
        }}
      >
        나중에
      </button>
      <button
        onClick={onApply}
        disabled={busy}
        style={{
          background: 'linear-gradient(135deg, #6EE7B7, rgba(110,231,183,0.85))',
          border: 'none',
          borderRadius: 10,
          padding: '7px 13px',
          fontFamily: 'Manrope,sans-serif',
          fontWeight: 800,
          fontSize: 11,
          color: '#0b1326',
          cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.6 : 1,
          whiteSpace: 'nowrap',
          transition: 'opacity 0.15s',
        }}
      >
        {busy ? '적용 중...' : '지금 적용'}
      </button>
    </div>
  );
}

/* ─── 수동 리프레시 헬퍼 (더보기 시트에서 호출) ─── */
// HebronGuide.tsx의 더보기 시트 "🔄 최신 정보" 버튼이 사용
;(window as any).__hebronRefreshNow = async () => {
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update().catch(() => {});
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (_) {}
  setTimeout(() => window.location.reload(), 300);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <UpdateBanner />
  </React.StrictMode>
)

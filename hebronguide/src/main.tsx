import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

/* ─────────────────────────────────────────
   PWA 자동 업데이트 시스템
   새 버전 배포 → SW 자동 감지 → 페이지 자동 새로고침
   사용자 개입 없이 항상 최신 버전 보장
───────────────────────────────────────── */
function usePWAAutoUpdate() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    // 새 SW가 컨트롤을 가져가면 → 자동 새로고침
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // SW 등록 + 업데이트 감지
    const initSW = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;

        // 이미 대기 중인 SW가 있으면 즉시 알림
        if (reg.waiting) {
          setUpdateReady(true);
        }

        // 새 SW 설치 감지
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 새 버전 설치됨 → SKIP_WAITING 자동 전송 → controllerchange → reload
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        // 주기적으로 업데이트 확인 (앱 사용 중에도 새 배포 감지)
        const checkInterval = setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 1000); // 1분마다 확인

        return () => clearInterval(checkInterval);
      } catch (_) {}
    };

    initSW();

    // 탭 포커스 시 업데이트 확인 (브라우저 전환 후 돌아왔을 때)
    const onFocus = () => {
      navigator.serviceWorker.getRegistration()
        .then(reg => reg?.update())
        .catch(() => {});
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return { updateReady };
}

/* ─── 업데이트 알림 배너 (fallback용) ─── */
function UpdateBanner() {
  const { updateReady } = usePWAAutoUpdate();

  if (!updateReady) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, background: '#1a2535', border: '1px solid rgba(242,153,74,0.5)',
      borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center',
      gap: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', minWidth: 280, maxWidth: 360,
    }}>
      <span style={{ fontSize: 18 }}>🔄</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: 12, color: '#ECFDF5' }}>
          새 버전이 있습니다
        </div>
        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 10, color: 'rgba(236,253,245,0.6)', marginTop: 2 }}>
          버그 수정 및 개선사항 포함
        </div>
      </div>
      <button
        onClick={async () => {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg?.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          else window.location.reload();
        }}
        style={{
          background: '#F2994A', border: 'none', borderRadius: 8, padding: '6px 12px',
          fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: 11, color: '#fff', cursor: 'pointer',
        }}>
        업데이트
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <UpdateBanner />
  </React.StrictMode>
)
// cache-bust: 1778369513

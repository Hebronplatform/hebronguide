import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

/* ─────────────────────────────────────────
   PWA 자동 업데이트 시스템
   Chrome + Safari + Firefox 모두 대응
   배포 후 1분 이내 모든 사용자 자동 업데이트
───────────────────────────────────────── */

// Safari 감지
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

    const activateWaitingSW = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg?.waiting) return;

        // Safari는 postMessage 후 즉시 reload 필요
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });

        if (isSafari) {
          // Safari: controllerchange 이벤트 불안정 → 0.5초 후 강제 reload
          setTimeout(() => {
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          }, 500);
        }
      } catch (_) {}
    };

    const initSW = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;

        // 이미 대기 중인 SW → 즉시 활성화
        if (reg.waiting) {
          if (isSafari) {
            // Safari: 사용자에게 배너 표시 (자동 reload 대신)
            setUpdateReady(true);
          } else {
            // Chrome/Firefox: 자동 활성화
            activateWaitingSW();
          }
        }

        // 새 SW 설치 감지
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (isSafari) {
                setUpdateReady(true);
              } else {
                activateWaitingSW();
              }
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

    // 탭 포커스 시 업데이트 확인 (사파리 탭 전환 포함)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.getRegistration()
          .then(reg => reg?.update())
          .catch(() => {});
      }
    };

    // visibilitychange: Safari에서 focus보다 더 신뢰성 높음
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
    };
  }, []);

  return { updateReady, activateUpdate: async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    setTimeout(() => window.location.reload(), 300);
  }};
}

/* ─── 업데이트 배너 (주로 Safari용) ─── */
function UpdateBanner() {
  const { updateReady, activateUpdate } = usePWAAutoUpdate();

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
          {isSafari ? '탭을 닫고 다시 열거나 업데이트를 누르세요' : '잠시 후 자동으로 업데이트됩니다'}
        </div>
      </div>
      <button onClick={activateUpdate} style={{
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

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

/* ── PWA 업데이트 배너 ── */
function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // 새 SW가 대기 중인지 주기적으로 확인
    const checkUpdate = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) setShow(true);
      } catch (_) {}
    };

    // SW 업데이트 감지
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // 새 SW가 컨트롤을 가져갔을 때 자동 새로고침
      window.location.reload();
    });

    checkUpdate();
    const timer = setInterval(checkUpdate, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!show) return null;

  const handleUpdate = async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShow(false);
  };

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
          새 버전 업데이트 가능
        </div>
        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 10, color: 'rgba(236,253,245,0.6)', marginTop: 2 }}>
          버그 수정 및 개선사항 포함
        </div>
      </div>
      <button
        onClick={handleUpdate}
        style={{ background: '#F2994A', border: 'none', borderRadius: 8, padding: '6px 12px',
          fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: 11, color: '#fff', cursor: 'pointer' }}>
        업데이트
      </button>
      <button
        onClick={() => setShow(false)}
        style={{ background: 'transparent', border: 'none', color: 'rgba(236,253,245,0.4)', cursor: 'pointer', fontSize: 14, padding: '4px' }}>
        ✕
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

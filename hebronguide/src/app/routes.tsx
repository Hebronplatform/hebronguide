import { createBrowserRouter } from "react-router";
import { I18nProvider } from "./components/I18nContext";
import { ContentProvider } from "./components/ContentContext";
import { HebronGuide } from "./components/HebronGuide";
import { Roadmap } from "./components/Roadmap";

function MainApp() {
  return (
    <I18nProvider>
      <ContentProvider>
        <div
          style={{
            minHeight: "100vh",
            background: "#f0f0ee",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <HebronGuide />
        </div>
      </ContentProvider>
    </I18nProvider>
  );
}

// 현재 URL의 첫 경로 세그먼트로 basename 동적 설정
// 54개 도시 전체 지원 — 리스트 체크 없이 URL 세그먼트 직접 사용
function detectBasename(): string {
  if (typeof window === "undefined") return "/seattle";
  const firstSegment = window.location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return firstSegment ? `/${firstSegment}` : "/seattle";
}

export const router = createBrowserRouter([
  { path: "/", Component: MainApp },
  // /admin 은 2026-09-20 내렸다. 화면은 열렸지만 부르던 서버 기능
  // (make-server-21f2cd69)이 배포된 적이 없어 아무것도 되지 않았다.
  // 관리자 화면의 정본은 /admin.html 이다.
  { path: "/admin", Component: () => { window.location.replace("/admin.html"); return null } },
  { path: "/roadmap", Component: Roadmap },
  { path: "*", Component: MainApp },
], { basename: detectBasename() });
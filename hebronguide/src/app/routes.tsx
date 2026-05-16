import { createBrowserRouter } from "react-router";
import { I18nProvider } from "./components/I18nContext";
import { ContentProvider } from "./components/ContentContext";
import { HebronGuide } from "./components/HebronGuide";
import { AdminPage } from "./components/AdminPage";
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
  { path: "/admin", Component: AdminPage },
  { path: "/roadmap", Component: Roadmap },
  { path: "*", Component: MainApp },
], { basename: detectBasename() });
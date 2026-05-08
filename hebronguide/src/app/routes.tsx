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
// /seattle/, /dallas/, /sf/ 등 17개 도시 모두 지원
const SUPPORTED_CITIES = [
  "seattle", "dallas", "sf", "newyork", "nashville", "boston",
  "la", "toronto", "vancouver", "houston", "atlanta", "kansascity",
  "philadelphia", "miami", "mexicocity", "guadalajara", "monterrey"
];

function detectBasename(): string {
  if (typeof window === "undefined") return "/seattle";
  const firstSegment = window.location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return firstSegment && SUPPORTED_CITIES.includes(firstSegment) ? `/${firstSegment}` : "/seattle";
}

export const router = createBrowserRouter([
  { path: "/", Component: MainApp },
  { path: "/admin", Component: AdminPage },
  { path: "/roadmap", Component: Roadmap },
  { path: "*", Component: MainApp },
], { basename: detectBasename() });
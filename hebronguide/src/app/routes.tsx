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

export const router = createBrowserRouter([
  { path: "/", Component: MainApp },
  { path: "/admin", Component: AdminPage },
  { path: "/roadmap", Component: Roadmap },
  { path: "*", Component: MainApp },
], { basename: '/seattle' });
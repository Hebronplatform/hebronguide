/**
 * App.tsx — HebronGuide PWA entry point (with routing)
 */
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return <RouterProvider router={router} />;
}

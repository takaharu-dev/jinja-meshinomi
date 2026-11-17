// 共通CSSは各ページのCSSより先に読み込む（ページ側で上書きできるように）
import "./styles/global.css";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "./router";
import { SavedProvider } from "./saved";

// ビルド時に書き出したページでは、window.__staticRouterHydrationData（取得済みのデータ）を
// createBrowserRouter が読み込むので、API を呼び直さずにそのまま表示を引き継ぐ
const router = createBrowserRouter(routes);

const app = (
  <StrictMode>
    <SavedProvider>
      <RouterProvider router={router} />
    </SavedProvider>
  </StrictMode>
);

const container = document.getElementById("root")!;
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  // 書き出していないページ（保存リストなど）は今までどおりブラウザで描画する
  createRoot(container).render(app);
}

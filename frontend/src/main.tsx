// 共通CSSは各ページのCSSより先に読み込む（ページ側で上書きできるように）
import "./styles/global.css";
import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { routes } from "./router";
import { SavedProvider } from "./saved";
import { acceptPrerenderedData, STALE_ATTR, type PrerenderedWindow } from "./hydration";

const container = document.getElementById("root")!;

// ビルド時に書き出したページでは、window.__staticRouterHydrationData（取得済みのデータ）を
// createBrowserRouter が読み込むので、API を呼び直さずにそのまま表示を引き継ぐ。
// ただし書き出したときと URL が違う（/shrines?worry=career など）ならデータを捨てて、ブラウザで描画し直す。
// router を作る前に判定する（作るときにデータを読むため）
const prerendered = container.hasChildNodes() && acceptPrerenderedData(window as PrerenderedWindow, location);
const router = createBrowserRouter(routes);

const app = (
  <StrictMode>
    <SavedProvider>
      <RouterProvider router={router} />
    </SavedProvider>
  </StrictMode>
);

if (prerendered) {
  hydrateRoot(container, app);
} else {
  // 書き出していないページ（保存リストなど）や URL が違うページは、ブラウザで描画する（書き出した中身は置き換わる）。
  // URL が違うときは head のスクリプトが本文を隠しているので、描画し終えてから（flushSync）表示に戻す。
  // 先に戻すと、描画までの間に書き出した中身（違うページのデータ）が一瞬見える
  const root = createRoot(container);
  flushSync(() => root.render(app));
  document.documentElement.removeAttribute(STALE_ATTR);
}

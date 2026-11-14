// 共通CSSは各ページのCSSより先に読み込む（ページ側で上書きできるように）
import "./styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import { SavedProvider } from "./saved";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SavedProvider>
      <RouterProvider router={router} />
    </SavedProvider>
  </StrictMode>,
);

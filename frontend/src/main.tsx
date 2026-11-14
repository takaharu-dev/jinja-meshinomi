// 共通CSSは各ページのCSSより先に読み込む（ページ側で上書きできるように）
import "./styles/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { SavedProvider } from "./saved";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SavedProvider>
        <App />
      </SavedProvider>
    </BrowserRouter>
  </StrictMode>,
);

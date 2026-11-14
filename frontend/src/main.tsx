import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { SavedProvider } from "./saved";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SavedProvider>
        <App />
      </SavedProvider>
    </BrowserRouter>
  </StrictMode>,
);

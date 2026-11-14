import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // 開発中は /api を Go サーバーへ転送
    proxy: { "/api": "http://localhost:8080" },
  },
});

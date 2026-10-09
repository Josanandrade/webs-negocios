/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// En desarrollo, /api se reenvía a la API local (sin CORS). En producción la web es
// estática y llama a VITE_API_URL.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { "/api": "http://127.0.0.1:8000" } },
  test: { globals: true, environment: "jsdom", exclude: ["e2e/**", "node_modules/**"], setupFiles: ["./src/test-setup.ts"], css: false },
});

import { readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";

// Las notas de assets (README_ASSETS.md) viven en public/ para el equipo, pero
// nunca deben publicarse: se eliminan de dist tras el build.
function stripInternalDocs(): Plugin {
  return {
    name: "strip-internal-docs",
    apply: "build",
    closeBundle() {
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir)) {
          const path = join(dir, entry);
          if (statSync(path).isDirectory()) walk(path);
          else if (entry.toLowerCase().endsWith(".md")) rmSync(path);
        }
      };
      walk("dist");
    },
  };
}

export default defineConfig({
  plugins: [stripInternalDocs()],
  build: { target: "es2022", cssMinify: true, assetsInlineLimit: 0 },
});

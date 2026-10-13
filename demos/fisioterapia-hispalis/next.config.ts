import type { NextConfig } from "next";

// STATIC_EXPORT=1 genera una versión 100 % estática en `out/` (útil para
// previsualizarla en cualquier hosting estático privado). Sin ella, la app se
// sirve con `next start` (Railway, como el resto de demos del repositorio).
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  ...(staticExport
    ? { output: "export" as const, images: { unoptimized: true } }
    : {
        // Demo privada: ningún buscador debe indexarla aunque alguien
        // comparta el enlace (además del <meta robots> y de robots.txt).
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
            },
          ];
        },
      }),
};

export default nextConfig;

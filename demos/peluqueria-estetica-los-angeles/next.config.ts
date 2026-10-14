import type { NextConfig } from "next";

// Demo comercial privada: nunca debe indexarse ni parecer el sitio oficial.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      // Las notas de assets (README_ASSETS.md) viven en public/ por convención
      // del repo, pero son internas: nunca se sirven.
      beforeFiles: [{ source: "/:path*.md", destination: "/_interno-no-publico" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;

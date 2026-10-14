import type { NextConfig } from "next";

// Web estática: se exporta a `out/` y se sirve como ficheros planos.
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;

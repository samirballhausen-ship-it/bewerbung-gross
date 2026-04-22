import type { NextConfig } from "next";

// GitHub Pages Project-Pages setzen basePath via ENV. Bei Custom Domain
// (CNAME-File im public/-Ordner) leer lassen — dann lebt die Seite an /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true, // GitHub Pages = kein Image-Server
    formats: ["image/avif", "image/webp"],
  },
  trailingSlash: true, // GitHub Pages mag /route/index.html
};

export default nextConfig;

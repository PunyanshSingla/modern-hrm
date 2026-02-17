import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "pdf-parse", "pdfjs-dist"],
};

export default nextConfig;

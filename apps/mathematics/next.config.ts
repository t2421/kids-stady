import type { NextConfig } from "next";

/*
 * GitHub Pages のサブパス (https://<user>.github.io/kids-stady/apps/mathematics/) で
 * 配信するため、CI では NEXT_PUBLIC_BASE_PATH を注入して静的書き出しする。
 * ローカル開発 (next dev) では basePath なしで動く。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

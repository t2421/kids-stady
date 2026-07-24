import path from "node:path";
import type { NextConfig } from "next";

/*
 * GitHub Pages のサブパス (https://<user>.github.io/kids-stady/apps/mathematics/) で
 * 配信するため、CI では NEXT_PUBLIC_BASE_PATH を注入して静的書き出しする。
 * ローカル開発 (next dev) では basePath なしで動く。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  /* shared/ (リポジトリ共通コード) を import できるよう、ワークスペースルートを明示。
     CI ではルートに lockfile が無く、既定だと apps/mathematics がルート扱いになるため必須 */
  turbopack: { root: path.join(__dirname, "../..") },
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

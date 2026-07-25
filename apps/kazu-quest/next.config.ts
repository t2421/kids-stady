import path from "node:path";
import type { NextConfig } from "next";

/*
 * GitHub Pages のサブパス (https://<user>.github.io/kids-stady/apps/kazu-quest/) で
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
  /* shared/ (リポジトリ共通コード) を import できるよう、ワークスペースルートを明示。
     既定だと ~/ の別ロックファイルを拾って誤検出するため、必ず指定する */
  turbopack: { root: path.join(__dirname, "../..") },
};

export default nextConfig;

import { defineConfig } from "@playwright/test";

/*
 * E2E は本番静的ビルド (next build → out/) を配信して実行する。
 * dev サーバー (Turbopack) はコンパイルジャンクで入力タイミングが乱れ、
 * グリッド移動のスモークがフレークするため使わない。
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3012",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npm run build && python3 -m http.server 3012 --directory out",
    url: "http://localhost:3012/",
    reuseExistingServer: false,
    timeout: 300_000,
  },
});

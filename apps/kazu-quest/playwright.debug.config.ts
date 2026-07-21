import { defineConfig } from "@playwright/test";

/* デバッグ用: 既存の out/ をそのまま配信 (ビルドしない・サーバー再利用) */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3012",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "python3 -m http.server 3012 --directory out",
    url: "http://localhost:3012/",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});

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
  /* Phaser ページは重く、並列実行すると RAF/入力タイミングがフレークする */
  workers: 1,
  use: {
    baseURL: "http://localhost:3012",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npm run build && python3 -m http.server 3012 --directory out",
    url: "http://localhost:3012/",
    /*
     * ローカルでは既存サーバーを再利用できるようにする (標準パターン)。
     * 並行ビルドとの競合で next build の型検査が数分止まることがあり、
     * 「先に build → 手動 serve → テスト」で回避できる。CI は常にフルビルド。
     */
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});

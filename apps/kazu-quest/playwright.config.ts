import { defineConfig, devices } from "@playwright/test";

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
    /* 失敗時のみ trace を残す (CI では artifact としてアップロードする) */
    trace: "retain-on-failure",
  },
  projects: [
    /* 既定: これまで通りのデスクトップ Chromium (touch.spec.ts だけ除外) */
    { name: "default", testIgnore: /touch\.spec\.ts/ },
    /*
     * iPad エミュレーション (KQ-06): タッチ操作だけで一連の流れが通ることを検証する。
     * - 横向きデバイス記述子を使う (縦持ちは OrientationGuard がゲームを隠す)
     * - browserName は chromium に固定: Field のタップ移動は「指を触れている間」
     *   pointerHeld を読むので、touchStart→touchEnd を指と同じ ~90ms 空けて
     *   送る必要があり、それには CDP (Input.dispatchTouchEvent) が要る
     */
    {
      name: "ipad",
      use: {
        ...devices["iPad (gen 7) landscape"],
        browserName: "chromium",
        hasTouch: true,
        isMobile: true,
      },
      /* keypad.spec はテンキーの boundingBox ≥72px を iPad でも検証する (KQ-12)。default でも走る */
      testMatch: /(touch|keypad)\.spec\.ts/,
    },
  ],
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

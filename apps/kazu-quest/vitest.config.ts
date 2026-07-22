import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    /* 500問プロパティテストは高負荷時に数秒かかる (既定5sだとフレークする) */
    testTimeout: 30_000,
  },
});

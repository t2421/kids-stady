import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  /* tsconfig の "@/*" (./src/*) を .tsx コンポーネントテストからも解決できるようにする */
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    /* 500問プロパティテストは高負荷時に数秒かかる (既定5sだとフレークする) */
    testTimeout: 30_000,
  },
});

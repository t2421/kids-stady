import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /* プロパティテスト (各スキル300問生成) はマシン負荷時に5秒を超えることがある */
    testTimeout: 30000,
  },
});

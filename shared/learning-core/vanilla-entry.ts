/*
 * 静的アプリ向けIIFEバンドルのエントリ。
 * `npm run gen:learning` (apps/mathematics) が shared/js/learning.js に出力する。
 * グローバルAPI: window.KidsLearning
 */

import {
  loadLearning,
  recentDaily,
  recordLearning,
  removeLearning,
  skillReports,
  weakSkills,
} from "./learning";

declare const globalThis: { KidsLearning?: unknown } & Record<string, unknown>;

globalThis.KidsLearning = {
  /* 既存API (keisan-shooter 互換) */
  load: (profileId: string) => loadLearning(profileId),
  record: (
    profileId: string,
    app: string,
    skillId: string,
    correct: boolean,
    elapsedMs: number,
  ) => recordLearning(profileId, app, skillId, correct, elapsedMs),
  remove: (profileId: string) => removeLearning(profileId),
  /* 分析ヘルパ (静的アプリでも成績表示を作れるように公開) */
  skillReports,
  weakSkills,
  recentDaily,
};

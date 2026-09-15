/*
 * 単元の習熟状態 (save.mastery) を共有学習ログ (shared/learning-core/learning.ts)
 * の任意フィールド mastery へ書き込む (学びの設計 LP-11b (3))。
 *
 * - キーは "kq_" 接頭辞 (src/game/battle/mathRequest.ts の recordLearning と同じ規約 —
 *   docs/save-data.md §4/§4.1、mathematics の g1_* 等と衝突させないため)
 * - 書き込みは save.mastery を丸ごとスナップショットとして置換する (差分マージではない)。
 *   kazu-quest だけがこのフィールドの書き手なので、これで十分かつ単純
 * - 呼び出し元は src/game/session.ts の autosave() (セーブ全体を書き出す
 *   タイミングと揃えることで、専用の呼び出し忘れを防ぐ — LP-11b の設計判断)
 */

import { writeMastery, type MasteryState as LearningMasteryState } from "./learning";
import type { SaveData } from "./save";

const SHARED_LOG_PREFIX = "kq_";

/* 純関数: save.mastery → 共有ログ向けのスナップショット (テストしやすいよう分離) */
export function masterySnapshotForLearningLog(
  save: SaveData,
): Record<string, LearningMasteryState> {
  const out: Record<string, LearningMasteryState> = {};
  for (const [skillId, entry] of Object.entries(save.mastery)) {
    out[SHARED_LOG_PREFIX + skillId] = entry.state;
  }
  return out;
}

/* 副作用あり: 実際に localStorage 側の共有ログへ書く */
export function writeMasterySnapshot(profileId: string, save: SaveData): void {
  writeMastery(profileId, masterySnapshotForLearningLog(save));
}

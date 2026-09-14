/*
 * 間隔復習 (おさらい) の対象選択とかけら集計 (学びの設計 LP-11)。純関数のみ。
 * dueReviews/onReviewResult (src/lib/mastery.ts) の上に薄く乗る:
 *   - reviewSelection: 期日の来た単元のうち、レッスンが実装済み (hasLesson) な
 *     ものだけを最大3件選ぶ (ReviewScreen は LessonScreen と同じ generate() を
 *     使って出題するので、レッスンが無い単元には出しようがない)
 *   - masteredShardCount: かけら報酬 (§3.6/§4.3) のゲートに使う集計
 */

import { dueReviews } from "./mastery";
import { hasLesson } from "../content/lessons/index";
import type { SaveData } from "./save";

export const REVIEW_SKILLS_MAX = 3;

/* ほこら/まなびやの「おさらい」で出す単元 (期日が早い順、最大3件、レッスン実装済みのみ) */
export function reviewSelection(save: SaveData): string[] {
  return dueReviews(save)
    .filter((skillId) => hasLesson(skillId))
    .slice(0, REVIEW_SKILLS_MAX);
}

/* mastered 状態の単元数。かけら (数晶のかけら) の付与判定に使う */
export function masteredShardCount(save: SaveData): number {
  return Object.values(save.mastery).filter((entry) => entry.state === "mastered").length;
}

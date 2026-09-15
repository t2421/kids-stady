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

/* 数晶が完成する かけらの必要数 (計画 §4.2/§4.3: 章の任意単元マスターで集まる) */
export const CHAPTER_CRYSTAL_SHARDS_REQUIRED = 6;
/* 数晶が完成した章の呪文にかかる威力ボーナス倍率 (計画・ロードマップの想定値 +20%) */
export const CHAPTER_CRYSTAL_POWER_MULTIPLIER = 1.2;

/*
 * 指定した章の「数晶」が完成しているか (LP-11/LP-20): その章の かけら
 * (inventory.items.kakera_<chapter>) を 6 つ集めた。任意単元 (中核以外) の
 * マスターで かけらが 1 つずつ増える (ReviewScreen.tsx) ので、この判定は
 * 純粋に かけらの所持数だけを見る — mastery の内訳は問わない。
 */
export function hasChapterCrystal(save: SaveData, chapter: number): boolean {
  const count = save.inventory.items[`kakera_${chapter}`] ?? 0;
  return count >= CHAPTER_CRYSTAL_SHARDS_REQUIRED;
}

/*
 * 章の数晶が完成していれば その章の呪文の power に掛ける倍率 (未完成なら 1 = 無補正)。
 * 呪文は章と厳密には紐付いていない (SpellDef に chapter フィールドが無い) ため、
 * 呼び出し側は「いま戦っている場所の章」または save.chapter.current を渡す
 * (バトルでの実際の配線は src/game/scenes/BattleScene.ts、章の判定は
 * chapterForMap 優先・取れなければ save.chapter.current — 通常 6つ集め切るのは
 * その章が current になっている間かそれ以降なので妥当な近似としている)。
 */
export function chapterCrystalMultiplier(save: SaveData, chapter: number): number {
  return hasChapterCrystal(save, chapter) ? CHAPTER_CRYSTAL_POWER_MULTIPLIER : 1;
}

/*
 * ネガリアの色戻し演出 (LP-22) の段。学年を問わず 全単元のマスター数で決まる
 * (冥王ゼロムは「数をなくす」存在なので、どの学年の単元をマスターしても
 * ネガリアに色が戻る、という演出意図)。しきい値は 0 / 8 / 16 / 24
 */
export function negariaStageFor(masteredCount: number): 0 | 1 | 2 | 3 {
  if (masteredCount >= 24) return 3;
  if (masteredCount >= 16) return 2;
  if (masteredCount >= 8) return 1;
  return 0;
}

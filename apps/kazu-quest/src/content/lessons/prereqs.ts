/*
 * 前提グラフ (LP-10, docs/kazu-quest-learning-plan.md §3.4)。
 *
 * LessonDef.prerequisites は LP-12〜17 (波4) が単元ごとに埋めるまで大半が空のまま
 * なので、readiness (前提チェック) の仕組みそのものはここの既定表で動く。
 * LessonDef が明示的に prerequisites を持てば、そちらを優先する
 * (prerequisitesFor)。学年 = 物語の順序であって、学習の順序は常にこのグラフが決める
 * (学校で習っていない単元でも、前提さえ「できる」なら先取りできる — §0 の方針)。
 */

import { getLesson } from "./index";
import { masteryOf } from "../../lib/mastery";
import type { MasteryState, SaveData } from "../../lib/save";

/* 計画 §3.4 の前提グラフの表を、そのままデータにしたもの。無いキーは [] 扱い */
const DEFAULT_PREREQUISITES: Record<string, string[]> = {
  g1_add_carry: ["g1_add_nc"],
  g1_sub_borrow: ["g1_sub_nc"],
  g2_add_column: ["g1_add_carry"],
  g2_sub_column: ["g1_sub_borrow"],
  g2_kuku: ["g1_add_nc"],
  g3_div: ["g2_kuku"],
  g3_div_remainder: ["g2_kuku"],
  g3_mul_column: ["g2_kuku"],
  g3_decimal: ["g2_add_column"],
  g4_div_2digit: ["g3_div_remainder"],
  g4_fraction_same: ["g3_fraction"],
  g4_decimal: ["g3_decimal"],
  g5_fraction_diff: ["g4_fraction_same", "g5_multiple"],
  g5_percent: ["g5_decimal_muldiv"],
  g6_fraction_muldiv: ["g5_fraction_diff"],
  g6_speed: ["g5_unit_rate"],
  g6_ratio: ["g5_percent"],
};

/* LessonDef.prerequisites が無い/空の単元向けの既定の前提。無いキーは [] */
export function defaultPrerequisites(skillId: string): string[] {
  return DEFAULT_PREREQUISITES[skillId] ?? [];
}

/*
 * ある単元の前提を1本にまとめる。LessonDef 自身が prerequisites を持てば
 * それを使い (波4以降、単元ごとに作者が明示したものを優先する)、無い/空なら
 * 既定表 (defaultPrerequisites) にフォールバックする。
 */
export function prerequisitesFor(skillId: string): string[] {
  const own = getLesson(skillId)?.prerequisites;
  if (own && own.length > 0) return own;
  return defaultPrerequisites(skillId);
}

/* 習熟状態の順序 (mastery.ts / runner.ts と同じ並び: none < practicing < can < mastered) */
const MASTERY_RANK: Record<MasteryState, number> = {
  none: 0,
  practicing: 1,
  can: 2,
  mastered: 3,
};

/*
 * readiness (前提チェック) が必要な前提単元だけを返す純関数。
 * 「できる」(can) 未満の前提だけが対象 — can/mastered ならすでに省略してよい。
 * handleOpenLesson (lessonFlow.ts) と ReadinessScreen.tsx の両方から使う、
 * EventBus に依存しないロジックの本体 (Vitest で直接検証できるようにここへ抽出)。
 */
export function readinessRequired(save: SaveData, skillId: string): string[] {
  return prerequisitesFor(skillId).filter(
    (pre) => MASTERY_RANK[masteryOf(save, pre).state] < MASTERY_RANK.can,
  );
}

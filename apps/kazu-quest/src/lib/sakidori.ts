/*
 * さきどりの ごほうび (純関数。tests/sakidori.test.ts)。
 *
 * がっこうの学年より上の単元を「できる」に したとき、1単元に つき 1回だけ:
 *   - ゴールド (学年が上ほど おおい)
 *   - さきどりの ほし ★ (数は goals.ts の aheadStars — 保存せず mastery から数える)
 *   - お祝いの 画面 (SakidoriCelebration.tsx)
 * 学びの経験値 (learningExp.ts) は 単元の学年で もらえるので、先の学年を まなぶほど
 * 強くなり、先の章の たたかいにも ついていける (さきどりで 物語を すすめる 前提)。
 */

import type { SaveData } from "./save";
import { SKILLS } from "./curriculum";
import { goalsView, isAheadSkill, isCan } from "./goals";

export const SAKIDORI_GOLD_PER_GRADE = 40;

export function sakidoriFlag(skillId: string): string {
  return `ahead.${skillId}`;
}

export interface SakidoriReward {
  skillId: string;
  label: string;
  grade: number;
  gold: number;
  /* もらったあとの ★ の数 */
  stars: number;
  /* つぎの さきどりの めあて (無ければ null) */
  nextLabel: string | null;
  /* この合格で あたらしく おぼえた 呪文の名前 (LessonScreen が 足す) */
  spellNames?: string[];
}

/*
 * 単元を「できる」に した直後に呼ぶ。さきどりで、まだ ごほうびを もらっていなければ
 * ゴールドと フラグを 付けた セーブと ごほうびの中身を返す。そうでなければ null
 */
export function applySakidoriReward(
  save: SaveData,
  skillId: string,
): { save: SaveData; reward: SakidoriReward } | null {
  if (!isAheadSkill(save, skillId) || !isCan(save, skillId)) return null;
  if (save.flags[sakidoriFlag(skillId)]) return null;
  const info = SKILLS.find((s) => s.id === skillId);
  if (!info) return null;
  const gold = SAKIDORI_GOLD_PER_GRADE * info.grade;
  const next: SaveData = {
    ...save,
    flags: { ...save.flags, [sakidoriFlag(skillId)]: true },
    inventory: { ...save.inventory, gold: save.inventory.gold + gold },
  };
  const view = goalsView(next);
  const nextUnit =
    [...view.current.units, ...(view.ahead?.units ?? [])].find(
      (u) => u.ahead && u.state !== "can" && u.state !== "mastered",
    ) ?? null;
  return {
    save: next,
    reward: {
      skillId,
      label: info.label,
      grade: info.grade,
      gold,
      stars: view.aheadStars,
      nextLabel: nextUnit?.label ?? null,
    },
  };
}

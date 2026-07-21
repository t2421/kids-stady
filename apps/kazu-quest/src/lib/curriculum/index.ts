/*
 * カリキュラムの入口。generate(skillId, rng) で問題を1問作る。
 * 小2〜小6のスキルはラベルのみ登録 (章の実装時にジェネレータを追加する)。
 */

import type { Problem, Rng, SkillInfo } from "./types";
import { mulberry32 } from "./types";
import { GRADE1_GENERATORS, GRADE1_LABELS } from "./grade1";
import type { SkillStat } from "../save";

const FUTURE_SKILLS: SkillInfo[] = [
  { id: "g2_kuku", grade: 2, label: "九九", implemented: false },
  { id: "g2_add_column", grade: 2, label: "たしざんの ひっさん", implemented: false },
  { id: "g2_sub_column", grade: 2, label: "ひきざんの ひっさん", implemented: false },
  { id: "g2_length", grade: 2, label: "ながさ (cm/mm)", implemented: false },
  { id: "g2_volume", grade: 2, label: "かさ (L/dL/mL)", implemented: false },
  { id: "g2_time", grade: 2, label: "とけいと じかん", implemented: false },
  { id: "g3_div", grade: 3, label: "わり算", implemented: false },
  { id: "g3_div_remainder", grade: 3, label: "あまりのある わり算", implemented: false },
  { id: "g3_mul_column", grade: 3, label: "かけ算の ひっ算", implemented: false },
  { id: "g4_decimal", grade: 4, label: "小数の 計算", implemented: false },
  { id: "g4_fraction_same", grade: 4, label: "同分母の 分数", implemented: false },
  { id: "g4_angle", grade: 4, label: "角度", implemented: false },
  { id: "g5_percent", grade: 5, label: "割合と 百分率", implemented: false },
  { id: "g5_fraction_diff", grade: 5, label: "異分母の 分数", implemented: false },
  { id: "g6_fraction_muldiv", grade: 6, label: "分数の かけ算わり算", implemented: false },
  { id: "g6_speed", grade: 6, label: "速さ", implemented: false },
  { id: "g6_ratio", grade: 6, label: "比", implemented: false },
];

export const SKILLS: SkillInfo[] = [
  ...Object.keys(GRADE1_GENERATORS).map((id) => ({
    id,
    grade: 1,
    label: GRADE1_LABELS[id],
    implemented: true,
  })),
  ...FUTURE_SKILLS,
];

const GENERATORS: Record<string, (rng: Rng) => Problem> = {
  ...GRADE1_GENERATORS,
};

export function isImplemented(skillId: string): boolean {
  return skillId in GENERATORS;
}

export function generate(skillId: string, rng?: Rng): Problem {
  const gen = GENERATORS[skillId];
  if (!gen) {
    throw new Error(`curriculum: unknown or unimplemented skill "${skillId}"`);
  }
  return gen(rng ?? mulberry32((Math.random() * 2 ** 32) >>> 0));
}

/*
 * 出題スキルの選択。正答率が低い / 遅いスキルを重み付けで多く出す
 * (マスマティクス設計 Part 3 の pickSkill と同型)。
 */
export function pickSkill(
  skillIds: string[],
  skillStats: Record<string, SkillStat>,
  rng?: Rng,
): string {
  const usable = skillIds.filter(isImplemented);
  if (usable.length === 0) {
    throw new Error("curriculum: no implemented skills to pick from");
  }
  const r = rng ?? Math.random;

  const weights = usable.map((id) => {
    const stat = skillStats[id];
    const total = stat ? stat.c + stat.w : 0;
    if (total === 0) return 2; /* 未出題は多め */
    const accuracy = stat!.c / total;
    const avgMs =
      stat!.recentMs.length > 0
        ? stat!.recentMs.reduce((s, n) => s + n, 0) / stat!.recentMs.length
        : 0;
    /* 正答率が低いほど重く (1〜3)、平均10秒超えならさらに+0.5 */
    return 1 + (1 - accuracy) * 2 + (avgMs > 10000 ? 0.5 : 0);
  });

  const sum = weights.reduce((s, w) => s + w, 0);
  let roll = r() * sum;
  for (let i = 0; i < usable.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return usable[i];
  }
  return usable[usable.length - 1];
}

export type { Problem, Rng, SkillInfo, Hint, CherryHint } from "./types";
export { mulberry32 } from "./types";

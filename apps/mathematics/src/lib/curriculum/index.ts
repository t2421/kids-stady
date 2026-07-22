/*
 * カリキュラムのエントリポイント。
 * スキルIDから問題を生成し、苦手なスキルを重み付けで多く出題する。
 */

import type { SkillStat } from "../save";
import { GRADE1_SKILLS } from "./grade1";
import { GRADE2_SKILLS } from "./grade2";
import { GRADE3_SKILLS } from "./grade3";
import { GRADE4_SKILLS } from "./grade4";
import { GRADE5_SKILLS } from "./grade5";
import { GRADE6_SKILLS } from "./grade6";
import type { Problem, SkillDef } from "./types";

export type { CherryHint, Op, Problem, SkillDef } from "./types";

const ALL_SKILLS: SkillDef[] = [
  ...GRADE1_SKILLS,
  ...GRADE2_SKILLS,
  ...GRADE3_SKILLS,
  ...GRADE4_SKILLS,
  ...GRADE5_SKILLS,
  ...GRADE6_SKILLS,
];

const SKILL_MAP = new Map(ALL_SKILLS.map((s) => [s.id, s]));

export function getSkill(skillId: string): SkillDef | null {
  return SKILL_MAP.get(skillId) ?? null;
}

export function generate(skillId: string): Problem {
  const skill = SKILL_MAP.get(skillId);
  if (!skill) throw new Error(`unknown skill: ${skillId}`);
  return skill.generate();
}

/*
 * 出題スキルの選択。正答率が低いスキルほど出やすい重み付き抽選。
 * weight = 1 + 3 * (誤答率のベイズ推定)。データが無いスキルは中立 (1.5倍程度)。
 */
export function pickSkill(
  skillIds: string[],
  skillStats: Record<string, SkillStat> = {},
): string {
  const usable = skillIds.filter((id) => SKILL_MAP.has(id));
  if (usable.length === 0) throw new Error("no usable skills");
  const weights = usable.map((id) => {
    const stat = skillStats[id];
    const c = stat?.c ?? 0;
    const w = stat?.w ?? 0;
    const wrongRate = (w + 1) / (c + w + 2);
    return 1 + 3 * wrongRate;
  });
  const total = weights.reduce((s, x) => s + x, 0);
  let r = Math.random() * total;
  for (let i = 0; i < usable.length; i++) {
    r -= weights[i];
    if (r <= 0) return usable[i];
  }
  return usable[usable.length - 1];
}

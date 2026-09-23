/*
 * カリキュラムの入口。generate(skillId, rng, opts?) で問題を1問作る。
 * 小1〜小6の全学年を実装済み (章1〜6に対応)。
 *
 * 出題の段階 (LP-02, docs/kazu-quest-levels.md): opts.level (1|2|3) を
 * 各ジェネレータへそのまま渡す。省略時は各ジェネレータ側の既定 (= 2、従来の
 * 出題) が使われる。小1〜小3の20単元は level ごとに値域が変わる。
 * 小4〜小6は level 引数を受け取らないジェネレータのままでもよい
 * (第2引数を無視するだけなので型上も呼び出し上も問題ない — LP-02b で対応)。
 */

import type { Problem, Rng, SkillInfo } from "./types";
import { mulberry32 } from "./types";
import { GRADE1_GENERATORS, GRADE1_LABELS } from "./grade1";
import { GRADE2_GENERATORS, GRADE2_LABELS } from "./grade2";
import { GRADE3_GENERATORS, GRADE3_LABELS } from "./grade3";
import { GRADE4_GENERATORS, GRADE4_LABELS } from "./grade4";
import { GRADE5_GENERATORS, GRADE5_LABELS } from "./grade5";
import { GRADE6_GENERATORS, GRADE6_LABELS } from "./grade6";
import type { SkillStat } from "../save";
import { maskAnswerInHints } from "./hints";

export type SkillLevel = 1 | 2 | 3;

export interface GenerateOptions {
  /* 出題の段階。省略時は各ジェネレータの既定 (= 2、従来の出題) */
  level?: SkillLevel;
}

type Generator = (rng: Rng, level?: SkillLevel) => Problem;

/* 学年ごとの (ジェネレータ, ラベル) 束。学年を足すときはここに1行 */
const BY_GRADE: {
  grade: number;
  generators: Record<string, Generator>;
  labels: Record<string, string>;
}[] = [
  { grade: 1, generators: GRADE1_GENERATORS, labels: GRADE1_LABELS },
  { grade: 2, generators: GRADE2_GENERATORS, labels: GRADE2_LABELS },
  { grade: 3, generators: GRADE3_GENERATORS, labels: GRADE3_LABELS },
  { grade: 4, generators: GRADE4_GENERATORS, labels: GRADE4_LABELS },
  { grade: 5, generators: GRADE5_GENERATORS, labels: GRADE5_LABELS },
  { grade: 6, generators: GRADE6_GENERATORS, labels: GRADE6_LABELS },
];

export const SKILLS: SkillInfo[] = BY_GRADE.flatMap(({ grade, generators, labels }) =>
  Object.keys(generators).map((id) => ({
    id,
    grade,
    label: labels[id],
    implemented: true,
  })),
);

const GENERATORS: Record<string, Generator> = Object.assign(
  {},
  ...BY_GRADE.map((g) => g.generators),
);

export function isImplemented(skillId: string): boolean {
  return skillId in GENERATORS;
}

export function generate(skillId: string, rng?: Rng, opts?: GenerateOptions): Problem {
  const gen = GENERATORS[skillId];
  if (!gen) {
    throw new Error(`curriculum: unknown or unimplemented skill "${skillId}"`);
  }
  const problem = gen(rng ?? mulberry32((Math.random() * 2 ** 32) >>> 0), opts?.level);
  /* ヒントは「答えのすぐ手前まで」— 答えそのものは どの単元でも かくす (hints.ts) */
  return { ...problem, hints: maskAnswerInHints(problem.hints, problem.answer, problem.text) };
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

export type {
  Problem,
  Rng,
  SkillInfo,
  Hint,
  CherryHint,
  CountIcon,
  CountVisual,
} from "./types";
export { mulberry32 } from "./types";

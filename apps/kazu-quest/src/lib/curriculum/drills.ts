/*
 * おだいクエスト (ドリル依頼)。まなびやの「おだいの けいじばん」から
 * その学年の単元を選んで10問に挑戦し、正解数に応じてゴールドを稼ぐ。
 * むずかしい単元 (★が多い)・上の学年ほど 1問あたりの報酬が高い。
 */

import type { ChapterDef } from "../../content/types";
import { SKILLS } from "./index";
import { chapterQuestionGrades } from "./gradePool";

export interface DrillQuest {
  skillId: string;
  label: string;
  grade: number;
  stars: 1 | 2 | 3;
  questions: number;
  goldPerCorrect: number;
  perfectBonus: number;
}

export const DRILL_QUESTIONS = 10;

/* 単元ごとの手ごわさ。学年内での相対的な難しさを ★1〜3 で表す */
const STARS: Record<string, 1 | 2 | 3> = {
  g1_count: 1,
  g1_compare: 1,
  g1_add_nc: 1,
  g1_sub_nc: 2,
  g1_add_carry: 2,
  g1_sub_borrow: 3,
  g2_kuku: 2,
  g2_add_column: 2,
  g2_sub_column: 3,
  g2_length: 2,
  g2_volume: 2,
  g2_time: 3,
  g3_div: 1,
  g3_circle: 1,
  g3_weight: 2,
  g3_big_number: 2,
  g3_mul_column: 2,
  g3_decimal: 2,
  g3_div_remainder: 3,
  g3_fraction: 3,
  g4_area: 1,
  g4_graph: 1,
  g4_angle: 2,
  g4_big_number: 2,
  g4_round: 2,
  g4_decimal: 3,
  g4_fraction_same: 3,
  g4_div_2digit: 3,
  g5_area: 1,
  g5_volume: 1,
  g5_average: 2,
  g5_multiple: 2,
  g5_unit_rate: 2,
  g5_percent: 3,
  g5_decimal_muldiv: 3,
  g5_fraction_diff: 3,
  g6_scale: 1,
  g6_ratio: 2,
  g6_letter_expr: 2,
  g6_proportion: 2,
  g6_combination: 3,
  g6_speed: 3,
  g6_circle_area: 3,
  g6_fraction_muldiv: 3,
};

export function goldPerCorrect(grade: number, stars: number): number {
  return stars + (grade - 1) * 2;
}

/* その学年の おだい一覧 (やさしい順)。実装済みスキルのみ */
export function questsForGrade(grade: number): DrillQuest[] {
  return SKILLS.filter(
    (s) => s.implemented && s.grade === grade && STARS[s.id] !== undefined,
  )
    .map((s) => {
      const stars = STARS[s.id];
      const perCorrect = goldPerCorrect(s.grade, stars);
      return {
        skillId: s.id,
        label: s.label,
        grade: s.grade,
        stars,
        questions: DRILL_QUESTIONS,
        goldPerCorrect: perCorrect,
        perfectBonus: perCorrect * 5,
      };
    })
    .sort((a, b) => a.stars - b.stars || a.skillId.localeCompare(b.skillId));
}

/*
 * 複数学年の おだい一覧。学年順 → 学年内はやさしい順。
 * 同じ学年が重複しても一覧は1回だけ (questionGrades の重複を吸収)
 */
export function questsForGrades(grades: number[]): DrillQuest[] {
  return [...new Set(grades)]
    .sort((a, b) => a - b)
    .flatMap((grade) => questsForGrade(grade));
}

/* 章の出題プール (questionGrades、省略時 [grade]) に基づく おだい一覧 */
export function questsForChapter(chapter: ChapterDef): DrillQuest[] {
  return questsForGrades(chapterQuestionGrades(chapter));
}

export function getDrillQuest(skillId: string): DrillQuest | undefined {
  const grade = SKILLS.find((s) => s.id === skillId)?.grade;
  if (grade === undefined) return undefined;
  return questsForGrade(grade).find((q) => q.skillId === skillId);
}

/* 報酬: 正解数 × 単価 + 全問正解ボーナス */
export function drillReward(
  quest: Pick<DrillQuest, "questions" | "goldPerCorrect" | "perfectBonus">,
  correct: number,
): { gold: number; perfect: boolean } {
  const perfect = correct >= quest.questions;
  return {
    gold: correct * quest.goldPerCorrect + (perfect ? quest.perfectBonus : 0),
    perfect,
  };
}

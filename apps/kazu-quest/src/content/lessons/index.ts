/*
 * レッスンの登録表 + 参照整合性バリデーション。
 * 章データ (src/content/chapters/) と同じ形: 中身は空でよいので、まず契約を固定する。
 * LP-12〜17 (波4) がここに単元ごとの LessonDef を足していく。
 */

import type { LessonDef, LessonPage } from "./types";
import { FIGURE_KINDS, MISTAKE_PATTERNS } from "./types";
import { registerLessonLookup } from "./prereqs";
import { SKILLS } from "../../lib/curriculum";
import { G1_COUNT } from "./grade1/g1_count";
import { G1_COMPARE } from "./grade1/g1_compare";
import { G1_ADD_NC } from "./grade1/g1_add_nc";
import { G1_SUB_NC } from "./grade1/g1_sub_nc";
import { G1_ADD_CARRY } from "./grade1/g1_add_carry";
import { G1_SUB_BORROW } from "./grade1/g1_sub_borrow";
import { G2_KUKU } from "./grade2/g2_kuku";
import { G2_ADD_COLUMN } from "./grade2/g2_add_column";
import { G2_SUB_COLUMN } from "./grade2/g2_sub_column";
import { G2_LENGTH } from "./grade2/g2_length";
import { G2_VOLUME } from "./grade2/g2_volume";
import { G2_TIME } from "./grade2/g2_time";
import { G3_DIV } from "./grade3/g3_div";
import { G3_DIV_REMAINDER } from "./grade3/g3_div_remainder";
import { G3_MUL_COLUMN } from "./grade3/g3_mul_column";
import { G3_BIG_NUMBER } from "./grade3/g3_big_number";
import { G3_DECIMAL } from "./grade3/g3_decimal";
import { G3_FRACTION } from "./grade3/g3_fraction";
import { G3_WEIGHT } from "./grade3/g3_weight";
import { G3_CIRCLE } from "./grade3/g3_circle";
import { G4_ANGLE } from "./grade4/g4_angle";
import { G4_AREA } from "./grade4/g4_area";
import { G4_BIG_NUMBER } from "./grade4/g4_big_number";
import { G4_DECIMAL } from "./grade4/g4_decimal";
import { G4_DIV_2DIGIT } from "./grade4/g4_div_2digit";
import { G4_FRACTION_SAME } from "./grade4/g4_fraction_same";
import { G4_GRAPH } from "./grade4/g4_graph";
import { G4_ROUND } from "./grade4/g4_round";
import { G5_AREA } from "./grade5/g5_area";
import { G5_AVERAGE } from "./grade5/g5_average";
import { G5_DECIMAL_MULDIV } from "./grade5/g5_decimal_muldiv";
import { G5_FRACTION_DIFF } from "./grade5/g5_fraction_diff";
import { G5_MULTIPLE } from "./grade5/g5_multiple";
import { G5_PERCENT } from "./grade5/g5_percent";
import { G5_UNIT_RATE } from "./grade5/g5_unit_rate";
import { G5_VOLUME } from "./grade5/g5_volume";
import { G6_CIRCLE_AREA } from "./grade6/g6_circle_area";
import { G6_COMBINATION } from "./grade6/g6_combination";
import { G6_FRACTION_MULDIV } from "./grade6/g6_fraction_muldiv";
import { G6_LETTER_EXPR } from "./grade6/g6_letter_expr";
import { G6_PROPORTION } from "./grade6/g6_proportion";
import { G6_RATIO } from "./grade6/g6_ratio";
import { G6_SCALE } from "./grade6/g6_scale";
import { G6_SPEED } from "./grade6/g6_speed";

/* LP-12〜17 (波4) がここに単元ごとの LessonDef を足していく。LP-08 の先行分は1件だけ */
export const LESSONS: Record<string, LessonDef> = {
  /* LP-12: 小1 全6単元 */
  g1_count: G1_COUNT,
  g1_compare: G1_COMPARE,
  g1_add_nc: G1_ADD_NC,
  g1_sub_nc: G1_SUB_NC,
  g1_add_carry: G1_ADD_CARRY,
  g1_sub_borrow: G1_SUB_BORROW,
  /* LP-13: 小2 全6単元 */
  g2_kuku: G2_KUKU,
  g2_add_column: G2_ADD_COLUMN,
  g2_sub_column: G2_SUB_COLUMN,
  g2_length: G2_LENGTH,
  g2_volume: G2_VOLUME,
  g2_time: G2_TIME,
  /* LP-14: 小3 全8単元 */
  g3_div: G3_DIV,
  g3_div_remainder: G3_DIV_REMAINDER,
  g3_mul_column: G3_MUL_COLUMN,
  g3_big_number: G3_BIG_NUMBER,
  g3_decimal: G3_DECIMAL,
  g3_fraction: G3_FRACTION,
  g3_weight: G3_WEIGHT,
  g3_circle: G3_CIRCLE,
  /* LP-15: 小4 全8単元 */
  g4_angle: G4_ANGLE,
  g4_area: G4_AREA,
  g4_big_number: G4_BIG_NUMBER,
  g4_decimal: G4_DECIMAL,
  g4_div_2digit: G4_DIV_2DIGIT,
  g4_fraction_same: G4_FRACTION_SAME,
  g4_graph: G4_GRAPH,
  g4_round: G4_ROUND,
  /* LP-16: 小5 全8単元 */
  g5_area: G5_AREA,
  g5_average: G5_AVERAGE,
  g5_decimal_muldiv: G5_DECIMAL_MULDIV,
  g5_fraction_diff: G5_FRACTION_DIFF,
  g5_multiple: G5_MULTIPLE,
  g5_percent: G5_PERCENT,
  g5_unit_rate: G5_UNIT_RATE,
  g5_volume: G5_VOLUME,
  /* LP-17: 小6 全8単元 */
  g6_circle_area: G6_CIRCLE_AREA,
  g6_combination: G6_COMBINATION,
  g6_fraction_muldiv: G6_FRACTION_MULDIV,
  g6_letter_expr: G6_LETTER_EXPR,
  g6_proportion: G6_PROPORTION,
  g6_ratio: G6_RATIO,
  g6_scale: G6_SCALE,
  g6_speed: G6_SPEED,
};

export function getLesson(skillId: string): LessonDef | undefined {
  return LESSONS[skillId];
}

export function hasLesson(skillId: string): boolean {
  return skillId in LESSONS;
}

/*
 * prereqs.ts の prerequisitesFor が「LessonDef 自身の prerequisites」を
 * 参照できるように、遅延で getLesson を登録する (循環import回避。
 * prereqs.ts 側のコメント参照)。ここで初めて prereqs.ts を import するのは
 * 安全 — このファイルの評価はここまで完了しており、LESSONS/getLesson は
 * すでに確定しているので TDZ の心配が無い。
 */
registerLessonLookup(getLesson);

/* concept/workedExample.steps/altExplain の各ページの図が §1.1 の集合に収まっているか */
function checkFigureKinds(pages: readonly LessonPage[], where: string): string | null {
  for (const page of pages) {
    if (!page.figure) continue;
    if (!(FIGURE_KINDS as readonly string[]).includes(page.figure.kind)) {
      return `${where} の figure.kind "${page.figure.kind}" が未知`;
    }
  }
  return null;
}

/*
 * 1件のレッスンの内部整合性を検査する。参照整合性 (prerequisites/skillId) は
 * 呼び出し側が渡す allSkillIds (curriculum に実在する skillId の集合) を使う。
 * 複数レッスンにまたがる検査 (重複登録) は validateAllLessons が受け持つ。
 */
export function validateLesson(
  lesson: LessonDef,
  allSkillIds: ReadonlySet<string>,
): string | null {
  if (!allSkillIds.has(lesson.skillId)) {
    return `skillId "${lesson.skillId}" は curriculum に未登録`;
  }
  for (const pre of lesson.prerequisites) {
    if (!allSkillIds.has(pre)) {
      return `"${lesson.skillId}" の prerequisite "${pre}" は curriculum に未登録`;
    }
  }

  const figureError =
    checkFigureKinds(lesson.concept, `"${lesson.skillId}" concept`) ??
    checkFigureKinds(lesson.workedExample.steps, `"${lesson.skillId}" workedExample.steps`) ??
    checkFigureKinds(lesson.altExplain, `"${lesson.skillId}" altExplain`);
  if (figureError) return figureError;

  const worked = lesson.workedExample.problem;
  if (!(worked.choices as readonly string[]).includes(worked.answer)) {
    return `"${lesson.skillId}" workedExample.problem.answer "${worked.answer}" が choices にない`;
  }
  for (const [i, f] of lesson.faded.entries()) {
    if (!(f.problem.choices as readonly string[]).includes(f.problem.answer)) {
      return `"${lesson.skillId}" faded[${i}].problem.answer "${f.problem.answer}" が choices にない`;
    }
  }

  const levels = lesson.levels.map((l) => l.level);
  if (levels.length !== 3 || levels[0] !== 1 || levels[1] !== 2 || levels[2] !== 3) {
    return `"${lesson.skillId}" levels は [1,2,3] の順で3件必要 (実際: ${JSON.stringify(levels)})`;
  }

  for (const [i, m] of lesson.mistakes.entries()) {
    if (!(MISTAKE_PATTERNS as readonly string[]).includes(m.pattern)) {
      return `"${lesson.skillId}" mistakes[${i}].pattern "${m.pattern}" が未知`;
    }
  }

  return null;
}

/* LESSONS 全体の検査。空リスト = 全件OK */
export function validateAllLessons(): string[] {
  const skillIds = new Set(SKILLS.map((s) => s.id));
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const [key, lesson] of Object.entries(LESSONS)) {
    if (key !== lesson.skillId) {
      errors.push(`LESSONS["${key}"].skillId "${lesson.skillId}" が登録キーと不一致`);
    }
    if (seen.has(lesson.skillId)) {
      errors.push(`skillId "${lesson.skillId}" が重複登録されている`);
    }
    seen.add(lesson.skillId);
    const err = validateLesson(lesson, skillIds);
    if (err) errors.push(err);
  }
  return errors;
}

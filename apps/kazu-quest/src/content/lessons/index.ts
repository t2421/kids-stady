/*
 * レッスンの登録表 + 参照整合性バリデーション。
 * 章データ (src/content/chapters/) と同じ形: 中身は空でよいので、まず契約を固定する。
 * LP-12〜17 (波4) がここに単元ごとの LessonDef を足していく。
 */

import type { LessonDef, LessonPage } from "./types";
import { FIGURE_KINDS, MISTAKE_PATTERNS } from "./types";
import { SKILLS } from "../../lib/curriculum";

export const LESSONS: Record<string, LessonDef> = {};

export function getLesson(skillId: string): LessonDef | undefined {
  return LESSONS[skillId];
}

export function hasLesson(skillId: string): boolean {
  return skillId in LESSONS;
}

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

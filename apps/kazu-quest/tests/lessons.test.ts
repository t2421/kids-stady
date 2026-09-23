/*
 * レッスン (学びの設計) のバリデーション検査。
 * LESSONS はまだ空 (中身は LP-12〜17)。ここでは以下を担保する:
 *  1. validateAllLessons() が空のレジストリに対して緑 (= [])
 *  2. validateLesson() 自体が「壊れたレッスン」を正しく落とし、「正しいレッスン」を通す
 */

import { describe, expect, it } from "vitest";
import { LESSONS, validateAllLessons, validateLesson } from "../src/content/lessons/index";
import type { FigureSpec, LessonDef } from "../src/content/lessons/types";
import { SKILLS } from "../src/lib/curriculum";
import type { Problem } from "../src/lib/curriculum/types";
import { MEMBERS } from "../src/lib/battle/members";

const skillIds = new Set(SKILLS.map((s) => s.id));

function dummyProblem(answer: string, wrong: [string, string]): Problem {
  return {
    skillId: "g1_add_nc",
    text: "1 + 2 = ?",
    a: 1,
    b: 2,
    op: "+",
    answer,
    choices: [answer, wrong[0], wrong[1]],
    hint: null,
    explain: ["1 に 2 を たすと 3"],
    hints: ["じゅんばんに かんがえてみよう", "1 に 2 を たすと どうなるかな", "1 + 2 を けいさんすると…"],
  };
}

/* §1.1 の契約を満たす、まなびや用のダミー1件 (g1_add_nc)。LESSONS には入れない */
function validG1AddNc(): LessonDef {
  return {
    skillId: "g1_add_nc",
    title: "たしざん (くりあがりなし)",
    prerequisites: [],
    story: { pages: ["まちの こまりごとが おきた"] },
    concept: [
      { text: "10までの かずを たしてみよう", figure: { kind: "tenFrame", count: 3 } },
      { text: "1つずつ かぞえてみよう" },
    ],
    workedExample: {
      problem: dummyProblem("3", ["2", "4"]),
      steps: [
        { text: "1と2を あわせる", figure: { kind: "cherry", total: 3, split: [1, 2] } },
        { text: "こたえは 3" },
      ],
    },
    faded: [
      { problem: dummyProblem("3", ["2", "4"]), blanks: 1 },
      { problem: dummyProblem("3", ["2", "4"]), blanks: 1 },
    ],
    levels: [
      { level: 1, label: "9までの たしざん" },
      { level: 2, label: "8・7までの たしざん" },
      { level: 3, label: "ぜんぶ" },
    ],
    altExplain: [{ text: "べつの せつめい: ブロックで かぞえよう" }],
    mistakes: [{ pattern: "offByOne", feedback: "1つ おおいか すくないよ" }],
  };
}

describe("validateAllLessons", () => {
  it("passes with an empty LESSONS registry", () => {
    expect(validateAllLessons()).toEqual([]);
  });
});

describe("validateLesson", () => {
  it("accepts a well-formed lesson", () => {
    expect(validateLesson(validG1AddNc(), skillIds)).toBeNull();
  });

  it("rejects an unknown figure.kind", () => {
    const bogusFigure = { kind: "bogus", count: 1 } as unknown as FigureSpec;
    const broken: LessonDef = {
      ...validG1AddNc(),
      concept: [{ text: "こわれた図", figure: bogusFigure }],
    };
    const error = validateLesson(broken, skillIds);
    expect(error).not.toBeNull();
    expect(error).toMatch(/figure\.kind/);
  });

  it("rejects an unknown figure.kind inside workedExample.steps", () => {
    const bogusFigure = { kind: "notAKind" } as unknown as FigureSpec;
    const broken: LessonDef = {
      ...validG1AddNc(),
      workedExample: {
        ...validG1AddNc().workedExample,
        steps: [{ text: "こわれた図", figure: bogusFigure }],
      },
    };
    expect(validateLesson(broken, skillIds)).toMatch(/figure\.kind/);
  });

  it("rejects an unregistered skillId", () => {
    const broken: LessonDef = { ...validG1AddNc(), skillId: "not_a_real_skill" };
    expect(validateLesson(broken, skillIds)).toMatch(/curriculum に未登録/);
  });

  it("rejects an unregistered prerequisite", () => {
    const broken: LessonDef = { ...validG1AddNc(), prerequisites: ["not_a_real_skill"] };
    expect(validateLesson(broken, skillIds)).toMatch(/prerequisite/);
  });

  it("rejects a workedExample answer not present in its choices", () => {
    const broken: LessonDef = {
      ...validG1AddNc(),
      workedExample: {
        ...validG1AddNc().workedExample,
        problem: { ...dummyProblem("3", ["2", "4"]), answer: "99" },
      },
    };
    expect(validateLesson(broken, skillIds)).toMatch(/choices にない/);
  });

  it("rejects a faded answer not present in its choices", () => {
    const broken: LessonDef = {
      ...validG1AddNc(),
      faded: [{ problem: { ...dummyProblem("3", ["2", "4"]), answer: "99" }, blanks: 1 }],
    };
    expect(validateLesson(broken, skillIds)).toMatch(/choices にない/);
  });

  it("rejects levels that are not exactly 1,2,3 in order", () => {
    const broken: LessonDef = {
      ...validG1AddNc(),
      levels: [
        { level: 1, label: "a" },
        { level: 1, label: "b" },
        { level: 3, label: "c" },
      ],
    };
    expect(validateLesson(broken, skillIds)).toMatch(/levels/);
  });

  it("rejects an unknown mistake pattern", () => {
    const broken: LessonDef = {
      ...validG1AddNc(),
      mistakes: [{ pattern: "notAPattern" as never, feedback: "x" }],
    };
    expect(validateLesson(broken, skillIds)).toMatch(/mistakes/);
  });
});

/*
 * companionLines (LP-19: なかまが教える場面) の memberId が実在の
 * パーティメンバーであることを、全44単元 (LESSONS) について検査する。
 * 正典は src/lib/battle/members.ts の MEMBERS (hero/tasuku/kakeru/little)
 */
describe("LESSONS companionLines", () => {
  const memberIds = new Set(Object.keys(MEMBERS));

  it("既知の memberId が1件は存在する (テストの自己検査)", () => {
    expect(memberIds.size).toBeGreaterThan(0);
  });

  it("すべての LessonDef の companionLines のキーが 実在の memberId である", () => {
    const offenders: string[] = [];
    for (const [skillId, lesson] of Object.entries(LESSONS)) {
      for (const memberId of Object.keys(lesson.companionLines ?? {})) {
        if (!memberIds.has(memberId)) {
          offenders.push(`${skillId}: companionLines["${memberId}"] は 未知の memberId`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("companionLines の値は空文字ではない", () => {
    const offenders: string[] = [];
    for (const [skillId, lesson] of Object.entries(LESSONS)) {
      for (const [memberId, line] of Object.entries(lesson.companionLines ?? {})) {
        if (!line.trim()) offenders.push(`${skillId}: companionLines["${memberId}"] が からっぽ`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("波5で追加した3単元 (g2_add_column/g3_mul_column/g4_decimal) がそれぞれの担当なかまの一言を持つ", () => {
    expect(LESSONS.g2_add_column.companionLines?.tasuku).toBeTruthy();
    expect(LESSONS.g3_mul_column.companionLines?.kakeru).toBeTruthy();
    expect(LESSONS.g4_decimal.companionLines?.little).toBeTruthy();
  });
});

/*
 * workedExample.problem は generate(skill, mulberry32(seed)) の出力だが、
 * steps の文は手書き。ジェネレータの乱数の使い方が変わると 問題だけ
 * 入れかわって 説明と食いちがう — 説明のどこかに こたえが出ていることで検出する
 */
describe("worked examples stay in sync with their generated problem", () => {
  for (const lesson of Object.values(LESSONS)) {
    it(lesson.skillId, () => {
      const { problem, steps } = lesson.workedExample;
      const said = steps.map((s) => `${s.text} ${JSON.stringify(s.figure ?? "")}`).join(" ");
      expect(said, `${lesson.skillId}: "${problem.text}" のこたえ ${problem.answer} が説明に無い`).toContain(
        problem.answer,
      );
    });
  }
});

/*
 * さくらんぼ図は「total は split の2つに わけられる」を見せる図。
 * g1_add_carry で「4を 3と 1に わけよう」に total: 11 の図が付き、
 * 「11 は 3 と 1 に わけられるよ」と まちがった式を 見せていた (実機で発覚)
 */
describe("cherry figures always split their total exactly", () => {
  it("total === split[0] + split[1] on every lesson page", () => {
    for (const lesson of Object.values(LESSONS)) {
      const pages = [
        ...lesson.concept,
        ...lesson.workedExample.steps,
        ...lesson.altExplain,
      ];
      for (const page of pages) {
        const f = page.figure;
        if (f?.kind !== "cherry") continue;
        expect(f.split[0] + f.split[1], `${lesson.skillId}: "${page.text}"`).toBe(f.total);
      }
    }
  });
});

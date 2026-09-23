/*
 * 問題の図 (figureForProblem)。
 * いちばん大事なのは「図がこたえを 先に見せない」ことと、
 * 「図の数字が 問題文の数字と 食いちがわない」こと
 * (a/b は単元ごとに意味が違う — g3_decimal の a=2 は 0.2 の ×10 表現)。
 */

import { describe, expect, it } from "vitest";
import { SKILLS, generate } from "../src/lib/curriculum";
import { mulberry32 } from "../src/lib/curriculum/types";
import { figureForProblem } from "../src/lib/curriculum/figures";
import { FIGURE_KINDS } from "../src/content/lessons/types";

const LEVELS = [1, 2, 3] as const;
const SEEDS = 60;

/* 図に出る数字をすべて集める (問題文と 食いちがっていないか 見るため) */
function numbersIn(spec: NonNullable<ReturnType<typeof figureForProblem>>): number[] {
  switch (spec.kind) {
    case "columnCalc":
      return [spec.a, spec.b];
    case "protractor":
      return [spec.angle];
    case "areaGrid":
      return [spec.w, spec.h];
    case "clock":
      return [spec.hour];
    case "array":
      return [spec.rows, spec.cols];
    case "placeValue":
      return [Number(spec.value)];
    case "fractionBar":
      return spec.second
        ? [spec.filled, spec.parts, spec.second.filled, spec.second.parts]
        : [spec.filled, spec.parts];
    default:
      return [];
  }
}

describe("figureForProblem", () => {
  it("only produces known figure kinds", () => {
    const kinds = new Set(FIGURE_KINDS);
    for (const skill of SKILLS) {
      for (const level of LEVELS) {
        for (let seed = 0; seed < SEEDS; seed++) {
          const spec = figureForProblem(generate(skill.id, mulberry32(seed), { level }));
          if (spec) expect(kinds.has(spec.kind), `${skill.id}: ${spec.kind}`).toBe(true);
        }
      }
    }
  });

  /* ひっ算の図は revealSteps: 0 — こたえのけたを見せてはいけない */
  it("never reveals a column-calc result", () => {
    for (const skill of SKILLS) {
      for (const level of LEVELS) {
        for (let seed = 0; seed < SEEDS; seed++) {
          const spec = figureForProblem(generate(skill.id, mulberry32(seed), { level }));
          if (spec?.kind === "columnCalc") {
            expect(spec.revealSteps, `${skill.id} の ひっ算が こたえを見せている`).toBe(0);
          }
        }
      }
    }
  });

  /* 分度器は 目もりの読みを出さない / 帯グラフ (%の数字が出る) は使わない */
  it("never reveals a protractor reading and never uses percentBar", () => {
    for (const skill of SKILLS) {
      for (const level of LEVELS) {
        for (let seed = 0; seed < SEEDS; seed++) {
          const spec = figureForProblem(generate(skill.id, mulberry32(seed), { level }));
          if (spec?.kind === "protractor") {
            expect(spec.showReading, `${skill.id} の分度器が よみを見せている`).toBeFalsy();
            /* 0〜180° の半円にしか のらない */
            expect(spec.angle).toBeGreaterThanOrEqual(0);
            expect(spec.angle).toBeLessThanOrEqual(180);
          }
          expect(spec?.kind, `${skill.id}`).not.toBe("percentBar");
        }
      }
    }
  });

  /* 図に出る数は 問題文にも出ている数であること (a/b の取りちがえ検出) */
  it("only shows numbers that appear in the problem text", () => {
    for (const skill of SKILLS) {
      for (const level of LEVELS) {
        for (let seed = 0; seed < SEEDS; seed++) {
          const problem = generate(skill.id, mulberry32(seed), { level });
          const spec = figureForProblem(problem);
          if (!spec) continue;
          for (const n of numbersIn(spec)) {
            expect(
              problem.text.includes(String(n)),
              `${skill.id} の図の ${n} が 問題文 "${problem.text}" に無い`,
            ).toBe(true);
          }
        }
      }
    }
  });

  /* 10のかたまりは 0〜10 しか描けない — こえた数を わたすと 黙って まちがう */
  it("keeps ten frames within 0..10", () => {
    for (const skill of SKILLS) {
      for (const level of LEVELS) {
        for (let seed = 0; seed < SEEDS; seed++) {
          const spec = figureForProblem(generate(skill.id, mulberry32(seed), { level }));
          if (spec?.kind !== "tenFrame") continue;
          expect(spec.count, `${skill.id}`).toBeLessThanOrEqual(10);
          expect(spec.count, `${skill.id}`).toBeGreaterThanOrEqual(0);
          if (spec.second !== undefined) {
            expect(spec.second, `${skill.id}`).toBeLessThanOrEqual(10);
            expect(spec.second, `${skill.id}`).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  /* 面積図のマス目は描画コストが w×h なので 上限を守る */
  it("keeps area grids small enough to draw during a battle", () => {
    for (const skill of SKILLS) {
      for (const level of LEVELS) {
        for (let seed = 0; seed < SEEDS; seed++) {
          const spec = figureForProblem(generate(skill.id, mulberry32(seed), { level }));
          if (spec?.kind !== "areaGrid") continue;
          expect(spec.w * spec.h, `${skill.id} の面積図が大きすぎる`).toBeLessThanOrEqual(144);
        }
      }
    }
  });

  /*
   * 主な計算単元には 図が出ること。1つの単元が複数の形の問題を出すもの
   * (g2_time / g4_angle) は その形が出たときに 図が付けば合格なので、
   * いくつかの seed のうち 1つでも その kind が出ることを見る
   */
  it("covers the calculation units kids meet first", () => {
    const kindsOf = (skillId: string) =>
      new Set(
        Array.from({ length: SEEDS }, (_, seed) =>
          figureForProblem(generate(skillId, mulberry32(seed)))?.kind ?? "none",
        ),
      );
    const expected: [string, string][] = [
      ["g1_add_nc", "tenFrame"],
      ["g1_compare", "numberLine"],
      ["g2_kuku", "array"],
      ["g2_add_column", "columnCalc"],
      ["g2_time", "clock"],
      ["g3_div", "columnCalc"],
      ["g3_mul_column", "columnCalc"],
      ["g4_round", "placeValue"],
      ["g4_angle", "protractor"],
      ["g5_area", "areaGrid"],
      ["g6_letter_expr", "letterBox"],
      ["g3_fraction", "fractionBar"],
      ["g4_fraction_same", "fractionBar"],
      ["g5_fraction_diff", "fractionBar"],
    ];
    for (const [skillId, kind] of expected) {
      expect([...kindsOf(skillId)], `${skillId} に ${kind} の図が出ない`).toContain(kind);
    }
  });

  /*
   * 1問1問に かならず図が付くわけではない単元 (形が3種あるなど) でも、
   * 図が付く形と付かない形が まざっているだけで こわれてはいない
   */
  it("leaves the variants that a figure cannot express without one", () => {
    const kinds = (skillId: string) =>
      Array.from({ length: SEEDS }, (_, seed) =>
        figureForProblem(generate(skillId, mulberry32(seed)))?.kind ?? "none",
      );
    /* 一まわり 360° / 三角形の内角 は 半円の分度器に のらない */
    expect(kinds("g4_angle")).toContain("none");
    /* 「なんじかんは なんぷん?」は とけいで表せない */
    expect(kinds("g2_time")).toContain("none");
  });

  /* 図が決まらない単元 (小数・分数・文章題) は だまって図なしにする */
  it("returns null for units whose numbers are not the ones in the text", () => {
    for (const skillId of ["g3_decimal", "g4_decimal", "g5_percent", "g6_fraction_muldiv"]) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(figureForProblem(generate(skillId, mulberry32(seed))), skillId).toBeNull();
      }
    }
  });

  /* 分数バーは 問題文の分数を そのまま描く (塗りは 分母を こえない) */
  it("draws fraction bars that match the fractions written in the text", () => {
    for (const skillId of ["g3_fraction", "g4_fraction_same", "g5_fraction_diff"]) {
      for (const level of LEVELS) {
        for (let seed = 0; seed < SEEDS; seed++) {
          const p = generate(skillId, mulberry32(seed), { level });
          const spec = figureForProblem(p);
          if (spec?.kind !== "fractionBar") continue;
          expect(spec.filled).toBeLessThanOrEqual(spec.parts);
          if (spec.second) {
            expect(spec.second.filled).toBeLessThanOrEqual(spec.second.parts);
            expect(p.text).toContain(`${spec.filled}/${spec.parts}`);
            expect(p.text).toContain(`${spec.second.filled}/${spec.second.parts}`);
          }
        }
      }
    }
  });

  /* ジェネレータが持たせた figure が最優先 */
  it("prefers the generator's own figure", () => {
    const problem = generate("g2_kuku", mulberry32(1));
    const forced = { ...problem, figure: { kind: "kukuTable" as const, highlightRow: 3 } };
    expect(figureForProblem(forced)).toEqual({ kind: "kukuTable", highlightRow: 3 });
  });
});

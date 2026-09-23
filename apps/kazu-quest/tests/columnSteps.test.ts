/*
 * ひっ算の くらいごとの説明。以前は 2けた決め打ちで、Lv3 (3けた) では
 * 「十のくらい: 12 + 83 + 1 = 96」のような説明になっていた。
 */

import { describe, expect, it } from "vitest";
import { columnAddSteps, columnMulSteps, columnSubSteps } from "../src/lib/curriculum/columnSteps";
import { generate } from "../src/lib/curriculum";
import { mulberry32 } from "../src/lib/curriculum/types";

describe("columnAddSteps", () => {
  it("walks every place for 3-digit numbers", () => {
    expect(columnAddSteps(129, 831)).toEqual([
      "一のくらい: 9 + 1 = 10 → 0 を かいて 1 くり上げる",
      "十のくらい: 2 + 3 + 1 = 6",
      "百のくらい: 1 + 8 = 9",
      "こたえは 960",
    ]);
  });

  it("carries out of the top place into a new place", () => {
    expect(columnAddSteps(58, 67)).toEqual([
      "一のくらい: 8 + 7 = 15 → 5 を かいて 1 くり上げる",
      "十のくらい: 5 + 6 + 1 = 12 → 2 を かいて 百のくらいに 1",
      "こたえは 125",
    ]);
  });
});

describe("columnSubSteps", () => {
  it("borrows through a zero", () => {
    expect(columnSubSteps(402, 157)).toEqual([
      "一のくらい: 2 から 7 は ひけない → 十のくらいから 1 かりて 12 - 7 = 5",
      "十のくらい: 0 は かせないので 百のくらいから かりて 10、1 かして 9。9 - 5 = 4",
      "百のくらい: 4 は 1 かしたので 3。3 - 1 = 2",
      "こたえは 245",
    ]);
  });

  it("does not write a leading zero place", () => {
    expect(columnSubSteps(105, 97).at(-1)).toBe("こたえは 8");
    expect(columnSubSteps(105, 97).some((l) => l.startsWith("百のくらい"))).toBe(false);
  });
});

describe("columnMulSteps", () => {
  it("uses one digit per place (partial products)", () => {
    expect(columnMulSteps(235, 9)).toEqual([
      "一のくらい: 5 × 9 = 45",
      "十のくらい: 3 × 9 = 27 (270)",
      "百のくらい: 2 × 9 = 18 (1800)",
      "45 + 270 + 1800 = 2115",
    ]);
  });
});

/* 生成される説明の「〜のくらい: x …」の x は いつも 1けた */
describe("column explanations only ever talk about single digits", () => {
  for (const skillId of ["g2_add_column", "g2_sub_column", "g3_mul_column"]) {
    it(skillId, () => {
      for (const level of [1, 2, 3] as const) {
        for (let seed = 0; seed < 300; seed++) {
          const p = generate(skillId, mulberry32(seed), { level });
          for (const line of p.explain) {
            const m = /のくらい: (?:.*?。)?(\d+)/.exec(line);
            if (m) expect(Number(m[1]), `${p.text}: ${line}`).toBeLessThan(10);
          }
          expect(p.explain.at(-1)).toContain(p.answer);
        }
      }
    });
  }
});

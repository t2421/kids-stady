/*
 * ヒントは「答えのすぐ手前まで」(LP-03)。答えそのものは かくす。
 * 以前は genericHints が explain を まるごと つないでいて、レッスンの穴埋め
 * (hints[2] を出しっぱなしにする画面) で こたえが 画面に出ていた。
 */

import { describe, expect, it } from "vitest";
import { SKILLS, generate } from "../src/lib/curriculum";
import { mulberry32 } from "../src/lib/curriculum/types";
import { maskAnswerInHints } from "../src/lib/curriculum/hints";

describe("maskAnswerInHints", () => {
  it("hides '= answer' in every stage", () => {
    const [, h1] = maskAnswerInHints(["a", "1じ + 3じかん = 4じ", "c"], "4", "1じから 3じかん たつと なんじ?");
    expect(h1).toBe("1じ + 3じかん = ?じ");
  });

  it("hides the concluding number in the last stage", () => {
    const [, , h2] = maskAnswerInHints(["a", "b", "0.01が 20こ くらいを そろえて 0.2"], "0.2", "0.05 + 0.15 = ?");
    expect(h2).toBe("0.01が 20こ くらいを そろえて ?");
  });

  it("does not touch numbers inside a formula before the masked answer", () => {
    const [, , h2] = maskAnswerInHints(["a", "b", "半けい = 直けい ÷ 2 4 ÷ 2 = 2cm"], "2", "直けい 4cm の 円の 半けいは なんcm?");
    expect(h2).toBe("半けい = 直けい ÷ 2 4 ÷ 2 = ?cm");
  });

  it("hides an answer that is restated after the masked step", () => {
    const [, , h2] = maskAnswerInHints(
      ["a", "b", "7 × 2 = 14 まで いける 18 - 14 = 4 18 ÷ 7 = 2 あまり 4"],
      "4",
      "18 ÷ 7 の あまりは いくつ?",
    );
    expect(h2).toBe("7 × 2 = 14 まで いける 18 - 14 = ? 18 ÷ 7 = 2 あまり ?");
  });

  it("leaves hints alone when the answer is one of the problem's own numbers", () => {
    const hints: [string, string, string] = ["a", "7 と 5 では", "7 の ほうが 大きい"];
    expect(maskAnswerInHints(hints, "7", "7 と 5\nおおきいのは どっち?")).toEqual(hints);
  });

  it("does not mask digits that merely contain the answer", () => {
    const [, h1] = maskAnswerInHints(["a", "12 + 3 = 15", "c"], "5", "12 + 3 = ?");
    expect(h1).toBe("12 + 3 = 15");
  });
});

/*
 * 全単元で、最後のヒントが「= こたえ」で終わっていないこと
 * (答えを言いきっていない)。わり算の「7 × 2 = 14 だから…」のような
 * 直前の一歩は 残してよい
 */
describe("generated hints never end by stating the answer", () => {
  for (const skill of SKILLS) {
    it(skill.id, () => {
      for (const level of [1, 2, 3] as const) {
        for (let seed = 0; seed < 120; seed++) {
          const p = generate(skill.id, mulberry32(seed), { level });
          const esc = p.answer.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
          if (new RegExp(`(?<![\\d./])${esc}(?![\\d./])`).test(p.text)) continue;
          for (const h of p.hints) {
            expect(h, `${skill.id} Lv${level}: ${p.text}`).not.toMatch(
              new RegExp(`=\\s*${esc}(?![\\d./])`),
            );
          }
        }
      }
    });
  }
});

/* 手書きの レッスン問題 (generate を通らない) も 登録時に かくす */
import { LESSONS } from "../src/content/lessons";
describe("lesson problems never state the answer in their hints", () => {
  for (const lesson of Object.values(LESSONS)) {
    it(lesson.skillId, () => {
      const problems = [lesson.workedExample.problem, ...lesson.faded.map((f) => f.problem)];
      for (const p of problems) {
        const esc = p.answer.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
        if (new RegExp(`(?<![\\d./])${esc}(?![\\d./])`).test(p.text)) continue;
        for (const h of p.hints) {
          expect(h, `${lesson.skillId}: ${p.text}`).not.toMatch(new RegExp(`=\\s*${esc}(?![\\d./])`));
        }
      }
    });
  }
});

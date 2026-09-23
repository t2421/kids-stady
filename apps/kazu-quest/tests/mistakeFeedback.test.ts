/*
 * まちがえたときの一言。レッスンごとに書いた mistakes[].feedback が
 * どこにも出ていなかったので、「レッスンの一言 → 共通の一言」の順に引く。
 */

import { describe, expect, it } from "vitest";
import { genericMistakeFeedback, mistakeFeedbackFor } from "../src/lib/mistakeFeedback";
import { generate } from "../src/lib/curriculum";
import { mulberry32 } from "../src/lib/curriculum/types";
import { LESSONS } from "../src/content/lessons";

describe("mistakeFeedbackFor", () => {
  const p = { ...generate("g2_add_column", mulberry32(1)), a: 38, b: 25, answer: "63", choiceTags: undefined };

  it("returns null for a correct answer or a timeout", () => {
    expect(mistakeFeedbackFor(p, "63")).toBeNull();
    expect(mistakeFeedbackFor(p, null)).toBeNull();
  });

  it("prefers the lesson's own sentence for the diagnosed pattern", () => {
    const lesson = { mistakes: [{ pattern: "forgotCarry" as const, feedback: "10の たばを ひとつ うえに はこぼう" }] };
    expect(mistakeFeedbackFor(p, "53", lesson)).toBe("10の たばを ひとつ うえに はこぼう");
  });

  it("falls back to the shared sentence when the lesson has none for that pattern", () => {
    expect(mistakeFeedbackFor(p, "64", { mistakes: [] })).toBe(genericMistakeFeedback("offByOne"));
  });

  it("uses the real lesson by default", () => {
    const tailored = LESSONS.g2_add_column.mistakes.find((m) => m.pattern === "forgotCarry")?.feedback;
    if (tailored) expect(mistakeFeedbackFor(p, "53")).toBe(tailored);
  });
});

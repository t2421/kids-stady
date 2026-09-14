/* テンキー入力の答え合わせ (KQ-12): 表記ゆれの正規化と入力方式の決定 */

import { describe, expect, it } from "vitest";
import {
  answerNeedsKey,
  isAnswerCorrect,
  normalizeAnswer,
  toHalfWidth,
} from "../src/lib/curriculum/answer";
import { SKILLS, generate, mulberry32 } from "../src/lib/curriculum";
import { inputModeFor, skillGrade } from "../src/lib/inputMode";

describe("normalizeAnswer", () => {
  it.each([
    /* 整数 */
    ["12", "12", "12"],
    [" 12 ", "12", "12"],
    ["0", "0", "0"],
    /* 先頭 0 */
    ["007", "7", "7"],
    ["000", "0", "0"],
    ["00.5", "0.5", "0.5"],
    /* 全角 */
    ["１２", "12", "12"],
    ["１２．５", "12.5", "12.5"],
    ["３／４", "3/4", "3/4"],
    ["１ ２", "12", "12"],
    /* 小数 */
    ["0.6", "0.6", "0.6"],
    [".6", "0.6", "0.6"],
    ["0.60", "0.6", "0.6"],
    ["2.0", "2", "2"],
    ["2.", "2", "2"],
    /* 分数 (約分はしない・表記で比べる) */
    ["3/4", "3/4", "3/4"],
    ["03/04", "3/4", "3/4"],
    ["2/4", "1/2", "2/4"],
    /* 単位つき: expected に単位がなければ数値部分だけにする */
    ["12cm", "12", "12"],
    ["12.5 cm²", "12.5", "12.5"],
    ["3こ", "3", "3"],
    ["1000g", "1000", "1000"],
    /* 空・読めない入力 */
    ["", "5", ""],
    ["   ", "5", ""],
    ["abc", "5", ""],
    ["1/", "1/2", ""],
    ["/2", "1/2", ""],
    ["1.2.3", "1.2", ""],
  ])("normalizeAnswer(%j, %j) → %j", (input, expected, want) => {
    expect(normalizeAnswer(input, expected)).toBe(want);
  });

  it("expected 側に単位があるときは入力の単位を落とさない", () => {
    expect(normalizeAnswer("12cm", "12cm")).toBe("");
    expect(normalizeAnswer("12", "12cm")).toBe("12");
  });
});

describe("isAnswerCorrect", () => {
  it.each([
    ["12", "12", true],
    ["１２", "12", true],
    ["012", "12", true],
    ["12cm", "12", true],
    ["0.6", "0.6", true],
    ["0.60", "0.6", true],
    [".6", "0.6", true],
    ["3/4", "3/4", true],
    ["３／４", "3/4", true],
    ["13", "12", false],
    ["", "12", false],
    ["  ", "12", false],
    /* 表記が違えば不正解 (分数問題は分数で、小数問題は小数で) */
    ["0.5", "1/2", false],
    ["1/2", "0.5", false],
    ["2/4", "1/2", false],
    ["0.75", "3/4", false],
  ])("isAnswerCorrect(%j, %j) → %s", (input, expected, want) => {
    expect(isAnswerCorrect(input, expected)).toBe(want);
  });

  it("全学年の生成問題で、answer をそのまま打てば必ず正解になる", () => {
    for (const skill of SKILLS) {
      const rng = mulberry32(7);
      for (let i = 0; i < 100; i++) {
        const p = generate(skill.id, rng);
        expect(isAnswerCorrect(p.answer, p.answer), `${skill.id}: ${p.answer}`).toBe(true);
        /* 全角で打っても正解 */
        const wide = p.answer.replace(/[0-9]/g, (d) =>
          String.fromCharCode(d.charCodeAt(0) - 48 + "０".charCodeAt(0)),
        );
        expect(isAnswerCorrect(wide, p.answer), `${skill.id}: ${wide}`).toBe(true);
        /* 間違った選択肢は不正解 */
        for (const c of p.choices) {
          if (c !== p.answer) expect(isAnswerCorrect(c, p.answer)).toBe(false);
        }
      }
    }
  });
});

describe("toHalfWidth / answerNeedsKey", () => {
  it("全角の数字と記号だけ半角にする", () => {
    expect(toHalfWidth("１２．５／３　−")).toBe("12.5/3 -");
    expect(toHalfWidth("cm")).toBe("cm");
  });

  it("答えに含まれる記号だけキーが必要", () => {
    expect(answerNeedsKey("12", ".")).toBe(false);
    expect(answerNeedsKey("0.6", ".")).toBe(true);
    expect(answerNeedsKey("3/4", "/")).toBe(true);
    expect(answerNeedsKey("3/4", ".")).toBe(false);
  });
});

describe("inputModeFor", () => {
  it("戦闘は学年に関わらず3択", () => {
    expect(inputModeFor("battle", "g1_add_nc")).toBe("choices");
    expect(inputModeFor("battle", "g3_div")).toBe("choices");
    expect(inputModeFor("battle", "g6_ratio")).toBe("choices");
  });

  it("小1〜2 は3択、小3以降はテンキー (test / drill / practice / field)", () => {
    for (const context of ["test", "drill", "practice", "field"]) {
      expect(inputModeFor(context, "g1_add_nc")).toBe("choices");
      expect(inputModeFor(context, "g2_kuku")).toBe("choices");
      expect(inputModeFor(context, "g3_div")).toBe("keypad");
      expect(inputModeFor(context, "g4_decimal")).toBe("keypad");
    }
  });

  it("学年が引けない skillId は3択に倒す", () => {
    expect(skillGrade("nope")).toBeNull();
    expect(inputModeFor("test", "nope")).toBe("choices");
  });

  it("実装済みスキルの学年と一致する", () => {
    for (const s of SKILLS) {
      expect(inputModeFor("test", s.id)).toBe(s.grade >= 3 ? "keypad" : "choices");
    }
  });
});

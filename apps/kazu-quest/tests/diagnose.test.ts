/* 誤答診断 (LP-03): choiceTags があればそれを、無ければ数値差分のヒューリスティックで推定する */

import { describe, expect, it } from "vitest";
import { SKILLS, generate, mulberry32 } from "../src/lib/curriculum";
import { diagnose } from "../src/lib/curriculum/diagnose";

describe("diagnose", () => {
  it("正解を選ぶと null", () => {
    const p = generate("g1_add_nc", mulberry32(1));
    expect(diagnose(p, p.answer)).toBeNull();
  });

  it("choiceTags がある問題は、その choice のタグをそのまま返す", () => {
    const rng = mulberry32(2);
    for (let i = 0; i < 200; i++) {
      const p = generate("g1_add_carry", rng);
      if (!p.choiceTags) continue;
      for (const choice of p.choices) {
        if (choice === p.answer) continue;
        const idx = p.choices.indexOf(choice);
        expect(diagnose(p, choice)).toBe(p.choiceTags[idx]);
      }
    }
  });

  it("±1 のテンキー入力は offByOne", () => {
    const p = generate("g3_mul_column", mulberry32(3));
    const answer = Number(p.answer);
    expect(diagnose(p, String(answer + 1))).toBe("offByOne");
    expect(diagnose(p, String(answer - 1))).toBe("offByOne");
  });

  /*
   * くり上がり・くり下がりの わすれは 向きが逆 (以前は 符号だけで決めていて、
   * ひき算で 17 を選んだ子に「くりあがりを わすれていないかな?」と出ていた)
   *   38 + 25 = 63 → くり上がりを わすれると 53 (−10)
   *   42 − 17 = 25 → くり下がりを わすれると 35 (+10)
   */
  it("±10 は 式の向きで forgotCarry / forgotBorrow を見分ける", () => {
    const add = { ...generate("g2_add_column", mulberry32(1)), a: 38, b: 25, op: "+" as const, answer: "63", choiceTags: undefined };
    expect(diagnose(add, "53")).toBe("forgotCarry");
    expect(diagnose(add, "73")).toBe("other");

    const sub = { ...generate("g2_sub_column", mulberry32(1)), a: 42, b: 17, op: "-" as const, answer: "25", choiceTags: undefined };
    expect(diagnose(sub, "35")).toBe("forgotBorrow");
    expect(diagnose(sub, "15")).toBe("other");

    const mul = { ...generate("g3_mul_column", mulberry32(3)), a: 23, b: 4, op: "×" as const, answer: "92", choiceTags: undefined };
    expect(diagnose(mul, "82")).toBe("forgotCarry");
  });

  /* 3択の choiceTags も 同じ向きで付く (たし算の +10 が forgotCarry に ならない) */
  it("choice tags follow the same direction for add and sub", () => {
    for (let seed = 0; seed < 300; seed++) {
      for (const skillId of ["g1_add_carry", "g2_add_column", "g1_sub_borrow", "g2_sub_column"]) {
        const p = generate(skillId, mulberry32(seed));
        if (!p.choiceTags) continue;
        const answer = Number(p.answer);
        p.choices.forEach((c, i) => {
          const diff = Number(c) - answer;
          if (p.choiceTags![i] === "forgotCarry") expect(p.op, `${p.text} ${c}`).toBe("+");
          if (p.choiceTags![i] === "forgotCarry") expect(diff).toBe(-10);
          if (p.choiceTags![i] === "forgotBorrow") expect(p.op, `${p.text} ${c}`).toBe("-");
          if (p.choiceTags![i] === "forgotBorrow") expect(diff).toBe(10);
        });
      }
    }
  });

  it("分母をたしてしまう誤り (addedDenominators) を分数の分子和から推定する", () => {
    const p = generate("g3_fraction", mulberry32(11));
    if (p.op === "+" && p.a !== null && p.b !== null) {
      const wrong = `${p.a + p.b}/99`;
      expect(diagnose(p, wrong)).toBe("addedDenominators");
    }
  });

  it("読めない・想定外の入力でも例外を投げず other を返す", () => {
    const p = generate("g1_add_nc", mulberry32(4));
    expect(diagnose(p, "??")).toBe("other");
    expect(diagnose(p, "")).toBe("other");
    expect(diagnose(p, "abc/def")).toBe("other");
  });

  it("正解以外の全 choice で null にならない (全単元)", () => {
    for (const skill of SKILLS) {
      const rng = mulberry32(9);
      for (let i = 0; i < 20; i++) {
        const p = generate(skill.id, rng);
        for (const choice of p.choices) {
          if (choice === p.answer) continue;
          expect(diagnose(p, choice)).not.toBeNull();
        }
      }
    }
  });
});

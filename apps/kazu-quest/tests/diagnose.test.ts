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

  it("±1 のテンキー入力は offByOne、±10 は forgotCarry/forgotBorrow", () => {
    const p = generate("g3_mul_column", mulberry32(3));
    const answer = Number(p.answer);
    expect(diagnose(p, String(answer + 1))).toBe("offByOne");
    expect(diagnose(p, String(answer - 1))).toBe("offByOne");
    expect(diagnose(p, String(answer + 10))).toBe("forgotCarry");
    expect(diagnose(p, String(answer - 10))).toBe("forgotBorrow");
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

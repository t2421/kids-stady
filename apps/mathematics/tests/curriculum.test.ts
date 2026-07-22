import { describe, expect, it } from "vitest";
import { generate, pickSkill } from "../src/lib/curriculum";
import { GRADE1_SKILLS } from "../src/lib/curriculum/grade1";

const N = 500;

describe("curriculum: 全スキル共通の性質 (各500問)", () => {
  for (const skill of GRADE1_SKILLS) {
    it(`${skill.id}: 正解が選択肢に含まれ、3択がユニーク`, () => {
      for (let i = 0; i < N; i++) {
        const p = generate(skill.id);
        expect(p.skillId).toBe(skill.id);
        expect(p.choices).toHaveLength(3);
        expect(p.choices).toContain(p.answer);
        expect(new Set(p.choices).size).toBe(3);
        expect(p.explain.length).toBeGreaterThan(0);
        expect(p.text.length).toBeGreaterThan(0);
      }
    });
  }
});

describe("curriculum: スキル別の値域", () => {
  it("g1_count: 3〜9", () => {
    for (let i = 0; i < N; i++) {
      const n = Number(generate("g1_count").answer);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(9);
    }
  });

  it("g1_compare: 常に異なる2数で、大きい方が正解", () => {
    for (let i = 0; i < N; i++) {
      const p = generate("g1_compare");
      const [a, b] = p.choices;
      expect(a).not.toBe(b);
      expect(p.choices[2]).toBe("おなじ");
      expect(Number(p.answer)).toBe(Math.max(Number(a), Number(b)));
    }
  });

  it("g1_add_nc: 和が10以下でくりあがりなし", () => {
    for (let i = 0; i < N; i++) {
      const p = generate("g1_add_nc");
      expect(p.a! + p.b!).toBeLessThanOrEqual(10);
      expect(Number(p.answer)).toBe(p.a! + p.b!);
      expect(p.hint?.type).toBe("text"); // かんがえかたヒントが付く (さくらんぼは carry のみ)
    }
  });

  it("g1_add_carry: 1けた同士・和が11以上・さくらんぼが正しい", () => {
    for (let i = 0; i < N; i++) {
      const p = generate("g1_add_carry");
      expect(p.a).toBeLessThanOrEqual(9);
      expect(p.b).toBeLessThanOrEqual(9);
      expect(p.a! + p.b!).toBeGreaterThanOrEqual(11);
      expect(Number(p.answer)).toBe(p.a! + p.b!);
      expect(p.hint!.type).toBe("cherry");
      const s = (p.hint as { type: "cherry"; split: { first: number; second: number } }).split;
      expect(p.a! + s.first).toBe(10);
      expect(s.first + s.second).toBe(p.b);
      expect(s.first).toBeGreaterThan(0);
      expect(s.second).toBeGreaterThan(0);
    }
  });

  it("g1_sub_nc: 10以下から引く・くりさがりなし", () => {
    for (let i = 0; i < N; i++) {
      const p = generate("g1_sub_nc");
      expect(p.a).toBeLessThanOrEqual(10);
      expect(p.b).toBeLessThan(p.a!);
      expect(Number(p.answer)).toBe(p.a! - p.b!);
    }
  });

  it("g1_sub_borrow: 11〜18からくりさがり必須・さくらんぼが正しい", () => {
    for (let i = 0; i < N; i++) {
      const p = generate("g1_sub_borrow");
      expect(p.a).toBeGreaterThanOrEqual(11);
      expect(p.a).toBeLessThanOrEqual(18);
      expect(p.b! > p.a! % 10).toBe(true); // くりさがりが必要
      expect(Number(p.answer)).toBe(p.a! - p.b!);
      expect(p.hint!.type).toBe("cherry");
      const s = (p.hint as { type: "cherry"; split: { first: number; second: number } }).split;
      expect(p.a! - s.first).toBe(10);
      expect(s.first + s.second).toBe(p.b);
      expect(s.second).toBeGreaterThan(0);
    }
  });
});

describe("curriculum: 小1追加スキルの固有制約", () => {
  it("g1_ten_pack: 10といくつ (答えは 11-19 または 1-9)", () => {
    for (let i = 0; i < N; i++) {
      const p = generate("g1_ten_pack");
      const ans = Number(p.answer);
      if (p.text.startsWith("10と")) {
        expect(ans).toBeGreaterThanOrEqual(11);
        expect(ans).toBeLessThanOrEqual(19);
      } else {
        expect(p.text).toMatch(/^1[1-9]は 10と いくつ\?$/);
        expect(ans).toBeGreaterThanOrEqual(1);
        expect(ans).toBeLessThanOrEqual(9);
        expect(Number(p.text[1])).toBe(ans); // 「1n は…」の n が答え
      }
    }
  });

  it("g1_three: 左から順に計算して一致し、途中結果も 0-10", () => {
    for (let i = 0; i < N; i++) {
      const p = generate("g1_three");
      const m = p.text.match(/^(\d) ([+-]) (\d) ([+-]) (\d) = \?$/);
      expect(m).not.toBeNull();
      const [, a, op1, b, op2, c] = m!;
      const mid = op1 === "+" ? Number(a) + Number(b) : Number(a) - Number(b);
      expect(mid).toBeGreaterThanOrEqual(0);
      expect(mid).toBeLessThanOrEqual(10);
      const result = op2 === "+" ? mid + Number(c) : mid - Number(c);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number(p.answer)).toBe(result);
    }
  });

  it("g1_seq: 表示中の2数と答えが連続3数を成す (1-20)", () => {
    for (let i = 0; i < N; i++) {
      const p = generate("g1_seq");
      const tokens = p.text.split("\n")[0].split(/\s+/);
      expect(tokens).toHaveLength(3);
      const filled = tokens.map((t) => (t === "□" ? Number(p.answer) : Number(t)));
      expect(filled[1]).toBe(filled[0] + 1);
      expect(filled[2]).toBe(filled[1] + 1);
      expect(filled[0]).toBeGreaterThanOrEqual(1);
      expect(filled[2]).toBeLessThanOrEqual(20);
    }
  });
});

describe("curriculum: pickSkill", () => {
  it("苦手なスキルが多く選ばれる", () => {
    const ids = ["g1_add_nc", "g1_sub_borrow"];
    const stats = {
      g1_add_nc: { c: 20, w: 0, recentMs: [] }, // 得意
      g1_sub_borrow: { c: 2, w: 10, recentMs: [] }, // 苦手
    };
    let weak = 0;
    for (let i = 0; i < 2000; i++) {
      if (pickSkill(ids, stats) === "g1_sub_borrow") weak++;
    }
    expect(weak).toBeGreaterThan(1000); // 苦手側が過半数
  });

  it("未知のスキルIDは除外し、全部未知ならthrow", () => {
    expect(pickSkill(["nope", "g1_count"])).toBe("g1_count");
    expect(() => pickSkill(["nope"])).toThrow();
  });
});

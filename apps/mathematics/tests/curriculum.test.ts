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
      expect(p.hint).toBeNull();
    }
  });

  it("g1_add_carry: 1けた同士・和が11以上・さくらんぼが正しい", () => {
    for (let i = 0; i < N; i++) {
      const p = generate("g1_add_carry");
      expect(p.a).toBeLessThanOrEqual(9);
      expect(p.b).toBeLessThanOrEqual(9);
      expect(p.a! + p.b!).toBeGreaterThanOrEqual(11);
      expect(Number(p.answer)).toBe(p.a! + p.b!);
      const s = p.hint!.split;
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
      const s = p.hint!.split;
      expect(p.a! - s.first).toBe(10);
      expect(s.first + s.second).toBe(p.b);
      expect(s.second).toBeGreaterThan(0);
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

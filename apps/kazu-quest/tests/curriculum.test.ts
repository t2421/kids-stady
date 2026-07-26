import { describe, expect, it } from "vitest";
import {
  SKILLS,
  generate,
  isImplemented,
  mulberry32,
  pickSkill,
} from "../src/lib/curriculum";

const RUNS = 500;

const implementedByGrade = (grade: number) =>
  SKILLS.filter((s) => s.implemented && s.grade === grade).map((s) => s.id);

/* 全学年共通の整形チェック (答えの値域は学年別テストで確認する) */
function expectWellFormed(skillId: string, maxAnswer: number) {
  const rng = mulberry32(42);
  for (let i = 0; i < RUNS; i++) {
    const p = generate(skillId, rng);
    expect(p.skillId).toBe(skillId);

    /* 3択: 重複なし・正解を含む */
    expect(new Set(p.choices).size).toBe(3);
    expect(p.choices).toContain(p.answer);

    const n = Number(p.answer);
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThanOrEqual(maxAnswer);

    /* 選択肢も非負整数 */
    for (const c of p.choices) {
      const cn = Number(c);
      expect(Number.isInteger(cn)).toBe(true);
      expect(cn).toBeGreaterThanOrEqual(0);
    }

    expect(p.explain.length).toBeGreaterThan(0);
    expect(p.text.length).toBeGreaterThan(0);
  }
}

describe("curriculum property tests (grade 1)", () => {
  for (const skillId of implementedByGrade(1)) {
    it(`${skillId}: ${RUNS} problems are well-formed`, () => {
      /* 小1: 答えは 0〜20 */
      expectWellFormed(skillId, 20);
    });
  }

  it("g1_count: visual matches the answer (no emoji in text)", () => {
    const rng = mulberry32(11);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g1_count", rng);
      expect(p.visual).toBeDefined();
      expect(p.visual!.count).toBe(Number(p.answer));
      /* 絵文字を含まない (自前アイコンで描画するため) */
      expect(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(p.text)).toBe(false);
    }
  });

  it("g1_add_nc: sums stay <= 9", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g1_add_nc", rng);
      expect(p.a! + p.b!).toBeLessThanOrEqual(9);
    }
  });

  it("g1_add_carry: always carries (sum >= 11) and has a cherry hint", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g1_add_carry", rng);
      expect(p.a! + p.b!).toBeGreaterThanOrEqual(11);
      expect(p.hint?.type).toBe("cherry");
      /* さくらんぼ分解の整合: a + first = 10, first + second = b */
      expect(p.a! + p.hint!.split.first).toBe(10);
      expect(p.hint!.split.first + p.hint!.split.second).toBe(p.b!);
    }
  });

  it("g1_sub_borrow: always borrows and answer >= 1", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g1_sub_borrow", rng);
      expect(p.b!).toBeGreaterThan(p.a! % 10);
      expect(Number(p.answer)).toBeGreaterThanOrEqual(1);
    }
  });

  it("g1_sub_nc: never borrows", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g1_sub_nc", rng);
      expect(p.b!).toBeLessThan(p.a!);
      expect(Number(p.answer)).toBeGreaterThanOrEqual(1);
    }
  });

  it("same seed reproduces the same problems", () => {
    const a = generate("g1_add_carry", mulberry32(123));
    const b = generate("g1_add_carry", mulberry32(123));
    expect(a).toEqual(b);
  });
});

describe("curriculum property tests (grade 2)", () => {
  for (const skillId of implementedByGrade(2)) {
    it(`${skillId}: ${RUNS} problems are well-formed`, () => {
      /* 小2: 九九≤81・2桁ひっ算≤178・換算≤180 の範囲内 */
      expectWellFormed(skillId, 200);
    });
  }

  it("g2_kuku: answers are products within the times table", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g2_kuku", rng);
      expect(p.a).toBeGreaterThanOrEqual(1);
      expect(p.a).toBeLessThanOrEqual(9);
      expect(p.b).toBeGreaterThanOrEqual(1);
      expect(p.b).toBeLessThanOrEqual(9);
      expect(Number(p.answer)).toBe(p.a! * p.b!);
    }
  });

  it("g2_add_column: two-digit operands and correct sums", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g2_add_column", rng);
      expect(p.a).toBeGreaterThanOrEqual(10);
      expect(p.b).toBeGreaterThanOrEqual(10);
      expect(Number(p.answer)).toBe(p.a! + p.b!);
    }
  });

  it("g2_sub_column: positive differences", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g2_sub_column", rng);
      expect(Number(p.answer)).toBe(p.a! - p.b!);
      expect(Number(p.answer)).toBeGreaterThanOrEqual(1);
    }
  });

  it("g2_length / g2_volume: conversions are ×10 based", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < RUNS; i++) {
      const len = generate("g2_length", rng);
      expect(Number(len.answer)).toBe(len.a! * 10 + (len.b ?? 0));
      const vol = generate("g2_volume", rng);
      expect(Number(vol.answer)).toBe(vol.a! * 10 + (vol.b ?? 0));
    }
  });

  it("g2_time: answers stay in sensible clock ranges", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g2_time", rng);
      const n = Number(p.answer);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(180);
    }
  });
});

describe("skill registry", () => {
  it("future skills are registered but not implemented", () => {
    expect(isImplemented("g3_div")).toBe(false);
    expect(() => generate("g3_div")).toThrow();
    expect(SKILLS.some((s) => s.id === "g6_speed")).toBe(true);
  });
});

describe("pickSkill", () => {
  it("only returns implemented skills", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 100; i++) {
      const id = pickSkill(["g1_add_nc", "g3_div"], {}, rng);
      expect(id).toBe("g1_add_nc");
    }
  });

  it("weights weak skills higher", () => {
    const rng = mulberry32(1);
    const stats = {
      g1_add_nc: { c: 20, w: 0, recentMs: [2000] }, /* 得意 */
      g1_sub_borrow: { c: 2, w: 18, recentMs: [12000] }, /* 苦手 */
    };
    let weak = 0;
    const total = 2000;
    for (let i = 0; i < total; i++) {
      if (pickSkill(["g1_add_nc", "g1_sub_borrow"], stats, rng) === "g1_sub_borrow") {
        weak++;
      }
    }
    /* 苦手スキルが有意に多く選ばれる (重み ~3.5 vs ~1) */
    expect(weak / total).toBeGreaterThan(0.6);
  });

  it("throws when nothing is implemented", () => {
    expect(() => pickSkill(["g3_div"], {})).toThrow();
  });
});

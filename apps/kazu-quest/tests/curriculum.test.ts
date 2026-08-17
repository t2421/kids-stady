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

/*
 * 選択肢の値。小3以降は "3/4" (分数) や "1.5" (小数) が混ざるため、
 * 文字列の重複だけでなく「値としての重複」も見る
 * — 2/4 と 1/2 が並ぶと、正しい答えを選んでも不正解にされてしまう。
 */
function valueOf(choice: string): number {
  const fraction = /^(-?\d+)\/(\d+)$/.exec(choice);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  return Number(choice);
}

/* 全学年共通の整形チェック */
function expectWellFormed(skillId: string) {
  const rng = mulberry32(42);
  for (let i = 0; i < RUNS; i++) {
    const p = generate(skillId, rng);
    expect(p.skillId).toBe(skillId);

    /* 3択: 文字列としても値としても重複なし・正解を含む */
    expect(new Set(p.choices).size).toBe(3);
    expect(p.choices).toContain(p.answer);
    const values = p.choices.map(valueOf);
    for (const v of values) expect(Number.isFinite(v), `値にならない選択肢: ${p.choices}`).toBe(true);
    expect(new Set(values).size, `同じ値の選択肢が並んだ: ${p.choices}`).toBe(3);

    /* 答えは 0 いじょう (マイナスは 小6までの範囲では 出さない) */
    expect(valueOf(p.answer)).toBeGreaterThanOrEqual(0);
    for (const v of values) expect(v).toBeGreaterThanOrEqual(0);

    expect(p.explain.length).toBeGreaterThan(0);
    expect(p.text.length).toBeGreaterThan(0);
  }
}

/* 小1・小2は答えが非負整数で、学年ごとの上限内におさまる */
function expectIntegerAnswers(skillId: string, maxAnswer: number) {
  const rng = mulberry32(43);
  for (let i = 0; i < RUNS; i++) {
    const p = generate(skillId, rng);
    const n = Number(p.answer);
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeLessThanOrEqual(maxAnswer);
    for (const c of p.choices) expect(Number.isInteger(Number(c))).toBe(true);
  }
}

describe("curriculum property tests (grade 1)", () => {
  for (const skillId of implementedByGrade(1)) {
    it(`${skillId}: ${RUNS} problems are well-formed`, () => {
      expectWellFormed(skillId);
      /* 小1: 答えは 0〜20 */
      expectIntegerAnswers(skillId, 20);
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
      expectWellFormed(skillId);
      /* 小2: 九九≤81・2桁ひっ算≤178・換算≤180 の範囲内 */
      expectIntegerAnswers(skillId, 200);
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

describe.each([3, 4, 5, 6])("curriculum property tests (grade %i)", (grade) => {
  for (const skillId of implementedByGrade(grade)) {
    it(`${skillId}: ${RUNS} problems are well-formed`, () => {
      expectWellFormed(skillId);
    });
  }

  it(`grade ${grade} has 8 units`, () => {
    expect(implementedByGrade(grade).length).toBe(8);
  });
});

describe("grade 3 invariants", () => {
  it("g3_div: divides exactly", () => {
    const rng = mulberry32(3);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g3_div", rng);
      expect(p.a! / p.b!).toBe(Number(p.answer));
    }
  });

  it("g3_div_remainder: remainder is below the divisor and non-zero", () => {
    const rng = mulberry32(3);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g3_div_remainder", rng);
      expect(Number(p.answer)).toBe(p.a! % p.b!);
      expect(Number(p.answer)).toBeGreaterThan(0);
      expect(Number(p.answer)).toBeLessThan(p.b!);
    }
  });

  it("g3_fraction / g3_decimal: answers are proper fraction or one-decimal strings", () => {
    const rng = mulberry32(3);
    for (let i = 0; i < RUNS; i++) {
      expect(generate("g3_fraction", rng).answer).toMatch(/^\d+(\/\d+)?$/);
      expect(generate("g3_decimal", rng).answer).toMatch(/^\d+(\.\d)?$/);
    }
  });
});

describe("grade 4 invariants", () => {
  it("g4_round: rounds to the stated place", () => {
    const rng = mulberry32(4);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g4_round", rng);
      expect(Number(p.answer) % p.b!).toBe(0);
      expect(Math.abs(Number(p.answer) - p.a!)).toBeLessThanOrEqual(p.b! / 2);
    }
  });

  it("g4_angle: angles stay inside a full turn", () => {
    const rng = mulberry32(4);
    for (let i = 0; i < RUNS; i++) {
      const n = Number(generate("g4_angle", rng).answer);
      expect(n).toBeGreaterThan(0);
      expect(n).toBeLessThan(360);
    }
  });
});

describe("grade 5 invariants", () => {
  it("g5_multiple: lcm/gcd answers divide or are divided by both operands", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g5_multiple", rng);
      const n = Number(p.answer);
      const isLcm = n % p.a! === 0 && n % p.b! === 0;
      const isGcd = p.a! % n === 0 && p.b! % n === 0;
      expect(isLcm || isGcd).toBe(true);
    }
  });

  it("g5_average: the average is a whole number of the listed values", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g5_average", rng);
      const values = p.text.split("\n")[0].split(" の ")[0].split(" , ").map(Number);
      const sum = values.reduce((s, v) => s + v, 0);
      expect(sum / values.length).toBe(Number(p.answer));
      for (const v of values) expect(v).toBeGreaterThan(0);
    }
  });
});

describe("grade 6 invariants", () => {
  it("g6_speed: distance = speed × time in every phrasing", () => {
    const rng = mulberry32(6);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g6_speed", rng);
      expect(Number(p.answer)).toBeGreaterThan(0);
    }
  });

  it("g6_circle_area: uses 3.14 and two decimals at most", () => {
    const rng = mulberry32(6);
    for (let i = 0; i < RUNS; i++) {
      const p = generate("g6_circle_area", rng);
      expect(p.answer).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(p.text).toContain("3.14");
    }
  });
});

describe("skill registry", () => {
  it("every grade from 1 to 6 is implemented", () => {
    for (let grade = 1; grade <= 6; grade++) {
      expect(implementedByGrade(grade).length).toBeGreaterThan(0);
    }
    expect(isImplemented("g3_div")).toBe(true);
    expect(SKILLS.every((s) => s.implemented && s.label)).toBe(true);
  });

  it("unknown skills still throw", () => {
    expect(isImplemented("g9_nonsense")).toBe(false);
    expect(() => generate("g9_nonsense")).toThrow();
  });
});

describe("pickSkill", () => {
  it("only returns implemented skills", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 100; i++) {
      const id = pickSkill(["g1_add_nc", "g9_nonsense"], {}, rng);
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
    expect(() => pickSkill(["g9_nonsense"], {})).toThrow();
  });
});

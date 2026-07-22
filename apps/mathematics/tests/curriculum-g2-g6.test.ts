import { describe, expect, it } from "vitest";
import { generate, getSkill } from "../src/lib/curriculum";
import { GRADE2_SKILLS } from "../src/lib/curriculum/grade2";
import { GRADE3_SKILLS } from "../src/lib/curriculum/grade3";
import { GRADE4_SKILLS } from "../src/lib/curriculum/grade4";
import { GRADE5_SKILLS } from "../src/lib/curriculum/grade5";
import { GRADE6_SKILLS } from "../src/lib/curriculum/grade6";
import type { Problem } from "../src/lib/curriculum/types";

const N = 300;
const SKILLS = [
  ...GRADE2_SKILLS,
  ...GRADE3_SKILLS,
  ...GRADE4_SKILLS,
  ...GRADE5_SKILLS,
  ...GRADE6_SKILLS,
];

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function fractionValue(value: string): number {
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(\d+)\/(\d+)$/);
  expect(match, `${value} は整数または分数`).not.toBeNull();
  return Number(match![1]) / Number(match![2]);
}

function expectReducedFraction(value: string): void {
  if (/^\d+$/.test(value)) return;
  const match = value.match(/^(\d+)\/(\d+)$/);
  expect(match, `${value} は既約分数`).not.toBeNull();
  const numerator = Number(match![1]);
  const denominator = Number(match![2]);
  expect(denominator).toBeGreaterThan(1);
  expect(gcd(numerator, denominator)).toBe(1);
}

function expectCanonicalFractions(value: string): void {
  for (const match of value.matchAll(/(\d+)\/(\d+)/g)) {
    expect(Number(match[2])).toBeGreaterThan(1);
    expect(gcd(Number(match[1]), Number(match[2]))).toBe(1);
  }
}

function decimalPlaces(value: string): number {
  return value.includes(".") ? value.split(".")[1].length : 0;
}

function hasCarry(a: number, b: number): boolean {
  while (a > 0 || b > 0) {
    if ((a % 10) + (b % 10) >= 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function hasBorrow(a: number, b: number): boolean {
  while (a > 0 || b > 0) {
    if (a % 10 < b % 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function matchText(p: Problem, pattern: RegExp): RegExpMatchArray {
  const match = p.text.match(pattern);
  expect(match, `${p.skillId}: ${p.text}`).not.toBeNull();
  return match!;
}

function validateGrade2(p: Problem): void {
  switch (p.skillId) {
    case "g2_add2": {
      const m = matchText(p, /^(\d+) \+ (\d+) = \?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(a).toBeGreaterThanOrEqual(10);
      expect(a).toBeLessThanOrEqual(89);
      expect(b).toBeGreaterThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(89);
      expect(a + b).toBeLessThan(100);
      expect(Number(p.answer)).toBe(a + b);
      return;
    }
    case "g2_sub2": {
      const m = matchText(p, /^(\d+) - (\d+) = \?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(a).toBeGreaterThanOrEqual(20);
      expect(a).toBeLessThanOrEqual(99);
      expect(b).toBeGreaterThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(89);
      expect(a).toBeGreaterThan(b);
      expect(Number(p.answer)).toBe(a - b);
      return;
    }
    case "g2_kuku": {
      const m = matchText(p, /^(\d) × (\d) = \?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(9);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(9);
      expect(Number(p.answer)).toBe(a * b);
      return;
    }
    case "g2_kuku_hole": {
      const m = matchText(p, /^(\d) × □ = (\d+)$/);
      const [a, product] = [Number(m[1]), Number(m[2])];
      const answer = Number(p.answer);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(9);
      expect(answer).toBeGreaterThanOrEqual(2);
      expect(answer).toBeLessThanOrEqual(9);
      expect(a * answer).toBe(product);
      return;
    }
    case "g2_kazu": {
      let m = p.text.match(/^10が (\d)こで\?$/);
      if (m) {
        const n = Number(m[1]);
        expect(n).toBeGreaterThanOrEqual(2);
        expect(n).toBeLessThanOrEqual(9);
        expect(Number(p.answer)).toBe(n * 10);
        return;
      }
      m = matchText(p, /^100が (\d)こと 10が (\d)こで\?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(9);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(9);
      expect(Number(p.answer)).toBe(a * 100 + b * 10);
      return;
    }
    case "g2_time": {
      if (p.text === "1じかん = なんぷん?") {
        expect(p.answer).toBe("60ぷん");
        return;
      }
      const m = matchText(p, /^(\d+)じ(30ぷん)?の 30ぷんあとは\?$/);
      const hour = Number(m[1]);
      expect(hour).toBeGreaterThanOrEqual(1);
      expect(hour).toBeLessThanOrEqual(12);
      const nextHour = hour === 12 ? 1 : hour + 1;
      expect(p.answer).toBe(m[2] ? `${nextHour}じ` : `${hour}じ30ぷん`);
      expect(p.answer).toMatch(/^\d+じ(?:30ぷん)?$/);
      return;
    }
    case "g2_length": {
      if (p.text === "1cm = なんmm?") {
        expect(p.answer).toBe("10mm");
      } else {
        const m = matchText(p, /^(\d)cm (\d)mm = なんmm\?$/);
        const [a, b] = [Number(m[1]), Number(m[2])];
        expect(a).toBeGreaterThanOrEqual(1);
        expect(a).toBeLessThanOrEqual(9);
        expect(b).toBeGreaterThanOrEqual(1);
        expect(b).toBeLessThanOrEqual(9);
        expect(p.answer).toBe(`${a * 10 + b}mm`);
      }
      expect(p.answer).toMatch(/^\d+mm$/);
      expect(p.choices.every((choice) => /^\d+mm$/.test(choice))).toBe(true);
      return;
    }
  }
  throw new Error(`未検証のスキル: ${p.skillId}`);
}

function validateGrade3(p: Problem): void {
  switch (p.skillId) {
    case "g3_div": {
      const m = matchText(p, /^(\d+) ÷ (\d) = \?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(9);
      expect(Number(p.answer)).toBeGreaterThanOrEqual(2);
      expect(Number(p.answer)).toBeLessThanOrEqual(9);
      expect(a).toBe(b * Number(p.answer));
      return;
    }
    case "g3_div_amari": {
      const m = matchText(p, /^(\d+) ÷ (\d) = \?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      const answer = p.answer.match(/^(\d+)あまり(\d+)$/);
      expect(answer).not.toBeNull();
      const [q, r] = [Number(answer![1]), Number(answer![2])];
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(9);
      expect(q).toBeGreaterThanOrEqual(2);
      expect(q).toBeLessThanOrEqual(9);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThan(b);
      expect(a).toBe(b * q + r);
      expect(p.choices.every((choice) => /^\d+あまり\d+$/.test(choice))).toBe(true);
      return;
    }
    case "g3_add3": {
      const m = matchText(p, /^(\d+) ([+-]) (\d+) = \?$/);
      const [a, op, b] = [Number(m[1]), m[2], Number(m[3])];
      expect(a).toBeGreaterThanOrEqual(100);
      expect(a).toBeLessThanOrEqual(899);
      expect(b).toBeGreaterThanOrEqual(100);
      expect(b).toBeLessThanOrEqual(899);
      if (op === "+") {
        expect(a + b).toBeLessThan(1000);
        expect(hasCarry(a, b)).toBe(true);
        expect(Number(p.answer)).toBe(a + b);
      } else {
        expect(a).toBeGreaterThan(b);
        expect(hasBorrow(a, b)).toBe(true);
        expect(Number(p.answer)).toBe(a - b);
      }
      return;
    }
    case "g3_mult2x1": {
      const m = matchText(p, /^(\d+) × (\d) = \?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(a).toBeGreaterThanOrEqual(11);
      expect(a).toBeLessThanOrEqual(49);
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(9);
      expect(Number(p.answer)).toBe(a * b);
      return;
    }
    case "g3_shosu": {
      const m = matchText(p, /^(\d\.\d) ([+-]) (\d\.\d) = \?$/);
      const [a, op, b] = [Number(m[1]), m[2], Number(m[3])];
      const result = op === "+" ? a + b : a - b;
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(2);
      expect(Number(p.answer)).toBeCloseTo(result, 10);
      expect(decimalPlaces(p.answer)).toBeLessThanOrEqual(1);
      return;
    }
    case "g3_bunsu": {
      const m = matchText(p, /^(\d+)\/(\d) ([+-]) (\d+)\/\2 = \?$/);
      const [a, denominator, op, b] = [Number(m[1]), Number(m[2]), m[3], Number(m[4])];
      const result = (op === "+" ? a + b : a - b) / denominator;
      expect(denominator).toBeGreaterThanOrEqual(2);
      expect(denominator).toBeLessThanOrEqual(9);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
      expect(fractionValue(p.answer)).toBe(result);
      expectReducedFraction(p.answer);
      return;
    }
    case "g3_tani": {
      if (p.text === "1km = なんm?") expect(p.answer).toBe("1000m");
      else if (p.text === "1kg = なんg?") expect(p.answer).toBe("1000g");
      else {
        const m = matchText(p, /^(\d)km (\d+)m = なんm\?$/);
        expect(Number(m[1])).toBeGreaterThanOrEqual(1);
        expect(Number(m[1])).toBeLessThanOrEqual(9);
        expect(Number(m[2])).toBeGreaterThanOrEqual(1);
        expect(Number(m[2])).toBeLessThanOrEqual(999);
        expect(p.answer).toBe(`${Number(m[1]) * 1000 + Number(m[2])}m`);
      }
      expect(p.answer).toMatch(/^\d+[mg]$/);
      expect(p.choices.every((choice) => /^\d+[mg]$/.test(choice))).toBe(true);
      return;
    }
  }
  throw new Error(`未検証のスキル: ${p.skillId}`);
}

function validateGrade4(p: Problem): void {
  switch (p.skillId) {
    case "g4_div2": {
      const m = matchText(p, /^(\d+) ÷ (\d+) = \?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      const q = Number(p.answer);
      expect(a).toBe(b * q);
      if (b < 10) {
        expect(a).toBeGreaterThanOrEqual(10);
        expect(a).toBeLessThanOrEqual(999);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(q).toBeGreaterThanOrEqual(10);
      } else {
        expect(q).toBeGreaterThanOrEqual(2);
        expect(q).toBeLessThanOrEqual(9);
      }
      return;
    }
    case "g4_gaisu": {
      const m = matchText(p, /^(\d+)を ししゃごにゅうで (百|千)のくらいまで$/);
      const n = Number(m[1]);
      const unit = m[2] === "百" ? 100 : 1000;
      expect(n).toBeGreaterThanOrEqual(1000);
      expect(n).toBeLessThanOrEqual(9999);
      expect(Number(p.answer)).toBe(Math.round(n / unit) * unit);
      return;
    }
    case "g4_shosu_mul": {
      const m = matchText(p, /^(\d+\.\d) ([×÷]) (\d) = \?$/);
      const [a, op, b] = [Number(m[1]), m[2], Number(m[3])];
      expect(a).toBeGreaterThanOrEqual(0.2);
      expect(a).toBeLessThanOrEqual(9.9);
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(9);
      expect(Number(p.answer)).toBeCloseTo(op === "×" ? a * b : a / b, 10);
      expect(decimalPlaces(p.answer)).toBeGreaterThanOrEqual(1);
      expect(decimalPlaces(p.answer)).toBeLessThanOrEqual(2);
      return;
    }
    case "g4_kimari": {
      let m = p.text.match(/^\((\d) \+ (\d)\) × (\d) = \?$/);
      if (m) {
        expect(Number(p.answer)).toBe((Number(m[1]) + Number(m[2])) * Number(m[3]));
      } else {
        m = matchText(p, /^(\d) \+ (\d) × (\d) = \?$/);
        expect(Number(p.answer)).toBe(Number(m[1]) + Number(m[2]) * Number(m[3]));
      }
      for (const value of [m[1], m[2], m[3]].map(Number)) {
        expect(value).toBeGreaterThanOrEqual(2);
        expect(value).toBeLessThanOrEqual(9);
      }
      return;
    }
    case "g4_bunsu": {
      let m = p.text.match(/^(\d) と (\d)\/(\d) は かぶんすうで\?$/);
      if (m) {
        const [whole, numerator, denominator] = [Number(m[1]), Number(m[2]), Number(m[3])];
        expect(whole).toBeGreaterThanOrEqual(1);
        expect(whole).toBeLessThanOrEqual(3);
        expect(numerator).toBeGreaterThan(0);
        expect(numerator).toBeLessThan(denominator);
        expect(gcd(numerator, denominator)).toBe(1);
        expect(p.answer).toBe(`${whole * denominator + numerator}/${denominator}`);
        expectReducedFraction(p.answer);
      } else {
        m = matchText(p, /^(\d+)\/(\d)を たいぶんすうにすると\?$/);
        const [numerator, denominator] = [Number(m[1]), Number(m[2])];
        const answer = p.answer.match(/^(\d)と(\d)\/(\d)$/);
        expect(answer).not.toBeNull();
        expect(p.answer).toBe(`${Math.floor(numerator / denominator)}と${numerator % denominator}/${denominator}`);
        expect(gcd(Number(answer![2]), Number(answer![3]))).toBe(1);
      }
      return;
    }
    case "g4_menseki": {
      const m = matchText(p, /^たて (\d+)cm、よこ (\d+)cmの 長方形の めんせきは なんcm²\?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(12);
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(12);
      expect(p.answer).toBe(`${a * b}cm²`);
      expect(p.choices.every((choice) => /^\d+cm²$/.test(choice))).toBe(true);
      return;
    }
  }
  throw new Error(`未検証のスキル: ${p.skillId}`);
}

function validateGrade5(p: Problem): void {
  switch (p.skillId) {
    case "g5_shosu_mul": {
      const m = matchText(p, /^(\d+\.\d) × (\d\.\d) = \?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(b).toBeGreaterThanOrEqual(0.1);
      expect(b).toBeLessThanOrEqual(0.9);
      expect(a).toBeGreaterThanOrEqual(0.1);
      expect(a).toBeLessThanOrEqual(9.9);
      expect(Number(p.answer)).toBeCloseTo(a * b, 10);
      expect(decimalPlaces(p.answer)).toBeLessThanOrEqual(2);
      return;
    }
    case "g5_shosu_div": {
      const m = matchText(p, /^(\d+\.\d{1,2}) ÷ (\d\.\d) = \?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(b).toBeGreaterThanOrEqual(0.1);
      expect(b).toBeLessThanOrEqual(0.9);
      expect(Number(p.answer)).toBeCloseTo(a / b, 10);
      expect(decimalPlaces(p.answer)).toBeLessThanOrEqual(1);
      return;
    }
    case "g5_bunsu_add": {
      const m = matchText(p, /^(\d+)\/(\d) ([+-]) (\d+)\/(\d) = \?$/);
      const [a, ad, op, b, bd] = [Number(m[1]), Number(m[2]), m[3], Number(m[4]), Number(m[5])];
      expect(ad).toBeGreaterThanOrEqual(2);
      expect(ad).toBeLessThanOrEqual(6);
      expect(bd).toBeGreaterThanOrEqual(2);
      expect(bd).toBeLessThanOrEqual(6);
      expect(ad).not.toBe(bd);
      const expected = a / ad + (op === "+" ? b / bd : -b / bd);
      expect(expected).toBeGreaterThan(0);
      expect(fractionValue(p.answer)).toBeCloseTo(expected, 10);
      expectReducedFraction(p.answer);
      return;
    }
    case "g5_yakubun": {
      const m = matchText(p, /^(\d+)\/(\d+)を やくぶんすると\?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(b).toBeLessThanOrEqual(20);
      expect(gcd(a, b)).toBeGreaterThan(1);
      expect(fractionValue(p.answer)).toBeCloseTo(a / b, 10);
      expectReducedFraction(p.answer);
      return;
    }
    case "g5_baisu": {
      const m = matchText(p, /^(\d+)と (\d+)の (さいしょうこうばいすう|さいだいこうやくすう)は\?$/);
      const [a, b] = [Number(m[1]), Number(m[2])];
      expect(a).toBeLessThanOrEqual(12);
      expect(b).toBeLessThanOrEqual(12);
      const expected = m[3] === "さいしょうこうばいすう" ? (a * b) / gcd(a, b) : gcd(a, b);
      expect(Number(p.answer)).toBe(expected);
      return;
    }
    case "g5_wariai": {
      let m = p.text.match(/^(\d+)人の (\d+)%は なん人\?$/);
      if (m) {
        const expected = (Number(m[1]) * Number(m[2])) / 100;
        expect(Number.isInteger(expected)).toBe(true);
        expect(Number(p.answer)).toBe(expected);
        return;
      }
      m = p.text.match(/^0\.(\d) = なん%\?$/);
      if (m) {
        expect(p.answer).toBe(`${Number(m[1]) * 10}%`);
        expect(p.choices.every((choice) => /^\d+%$/.test(choice))).toBe(true);
        return;
      }
      m = matchText(p, /^(\d+)% = 小数で\?$/);
      expect(Number(p.answer)).toBe(Number(m[1]) / 100);
      return;
    }
    case "g5_heikin": {
      const m = matchText(p, /^(\d+)、(\d+)、(\d+)の へいきんは\?$/);
      const values = [Number(m[1]), Number(m[2]), Number(m[3])];
      expect(values.every((value) => value >= 10 && value <= 90)).toBe(true);
      const average = values.reduce((sum, value) => sum + value, 0) / 3;
      expect(Number.isInteger(average)).toBe(true);
      expect(Number(p.answer)).toBe(average);
      return;
    }
  }
  throw new Error(`未検証のスキル: ${p.skillId}`);
}

function validateGrade6(p: Problem): void {
  switch (p.skillId) {
    case "g6_bunsu_mul":
    case "g6_bunsu_div": {
      const op = p.skillId === "g6_bunsu_mul" ? "×" : "÷";
      const m = matchText(p, new RegExp(`^(\\d)/(\\d) ${op} (\\d)/(\\d) = \\?$`));
      const [a, ad, b, bd] = [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])];
      expect([a, ad, b, bd].every((value) => value >= 1 && value <= 9)).toBe(true);
      const expected = p.skillId === "g6_bunsu_mul" ? (a * b) / (ad * bd) : (a * bd) / (ad * b);
      expect(fractionValue(p.answer)).toBeCloseTo(expected, 10);
      expectReducedFraction(p.answer);
      return;
    }
    case "g6_moji": {
      let m = p.text.match(/^x × (\d+) = (\d+) のとき x は\?$/);
      if (m) {
        expect(Number(p.answer) * Number(m[1])).toBe(Number(m[2]));
      } else {
        m = matchText(p, /^x \+ (\d+) = (\d+) のとき x は\?$/);
        expect(Number(p.answer) + Number(m[1])).toBe(Number(m[2]));
      }
      expect(Number.isInteger(Number(p.answer))).toBe(true);
      return;
    }
    case "g6_hi": {
      let m = p.text.match(/^(\d+):(\d+) = (\d+):□$/);
      if (m) {
        const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
        expect(c % a).toBe(0);
        expect(Number(p.answer)).toBe(b * (c / a));
      } else {
        m = matchText(p, /^(\d+):(\d+)の 比のあたいは\?$/);
        expect(fractionValue(p.answer)).toBeCloseTo(Number(m[1]) / Number(m[2]), 10);
        expectReducedFraction(p.answer);
      }
      return;
    }
    case "g6_hayasa": {
      let m = p.text.match(/^(\d+)kmを (\d+)時間で すすむと 時速は\?$/);
      if (m) {
        expect(Number(m[1]) % Number(m[2])).toBe(0);
        expect(Number(p.answer)).toBe(Number(m[1]) / Number(m[2]));
      } else {
        m = matchText(p, /^時速 (\d+)kmで (\d+)時間 すすむと きょりは\?$/);
        expect(Number(p.answer)).toBe(Number(m[1]) * Number(m[2]));
      }
      return;
    }
    case "g6_en": {
      let m = p.text.match(/^はんけい (\d+)cmの 円の めんせきは\?$/);
      if (m) {
        expect(Number(p.answer)).toBeCloseTo(3.14 * Number(m[1]) ** 2, 10);
      } else {
        m = matchText(p, /^直径 (\d+)cmの 円しゅうは\?$/);
        expect(Number(p.answer)).toBeCloseTo(3.14 * Number(m[1]), 10);
      }
      return;
    }
  }
  throw new Error(`未検証のスキル: ${p.skillId}`);
}

const validators: Record<number, (problem: Problem) => void> = {
  2: validateGrade2,
  3: validateGrade3,
  4: validateGrade4,
  5: validateGrade5,
  6: validateGrade6,
};

describe("小2〜小6カリキュラム: 共通条件と値域 (各スキル300問)", () => {
  for (const skill of SKILLS) {
    it(`${skill.id}: 仕様を満たす`, () => {
      expect(getSkill(skill.id)?.grade).toBe(skill.grade);
      for (let i = 0; i < N; i++) {
        const p = generate(skill.id);
        expect(p.skillId).toBe(skill.id);
        expect(p.text.trim().length).toBeGreaterThan(0);
        expect(p.explain.length).toBeGreaterThanOrEqual(2);
        expect(p.explain.length).toBeLessThanOrEqual(4);
        expect(p.explain.every((line) => line.trim().length > 0)).toBe(true);
        expect(p.choices).toHaveLength(3);
        expect(new Set(p.choices).size).toBe(3);
        expect(p.choices).toContain(p.answer);
        for (const choice of p.choices) expectCanonicalFractions(choice);
        expect(p.hint).not.toBeNull();
        expect(p.hint?.type).toBe("text");
        if (p.hint?.type === "text") {
          expect(p.hint.lines.length).toBeGreaterThanOrEqual(1);
          expect(p.hint.lines.length).toBeLessThanOrEqual(2);
          expect(p.hint.lines.every((line) => line.trim().length > 0)).toBe(true);
          for (const line of p.hint.lines) expect(line).not.toContain(p.answer);
        }
        validators[skill.grade](p);
      }
    });
  }
});

describe("確率分岐の両側を生成する", () => {
  it("g2_add2 は、くり上がりあり・なしを生成する", () => {
    const seen = new Set<boolean>();
    for (let i = 0; i < N; i++) {
      const m = generate("g2_add2").text.match(/^(\d+) \+ (\d+)/)!;
      seen.add(hasCarry(Number(m[1]), Number(m[2])));
    }
    expect(seen).toEqual(new Set([true, false]));
  });

  it("g2_sub2 は、くり下がりあり・なしを生成する", () => {
    const seen = new Set<boolean>();
    for (let i = 0; i < N; i++) {
      const m = generate("g2_sub2").text.match(/^(\d+) - (\d+)/)!;
      seen.add(hasBorrow(Number(m[1]), Number(m[2])));
    }
    expect(seen).toEqual(new Set([true, false]));
  });
});

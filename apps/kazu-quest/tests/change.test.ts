import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/lib/curriculum";
import {
  SHOP_CHANGE_SKILL_ID,
  cashback,
  changeChallenge,
  changeProblem,
  paidCandidates,
} from "../src/lib/shop/change";

const RUNS = 300;

describe("cashback", () => {
  it("代金の 10% を切り捨てで返す", () => {
    expect(cashback(30)).toBe(3);
    expect(cashback(140)).toBe(14);
    expect(cashback(99)).toBe(9);
    expect(cashback(280)).toBe(28);
  });

  it("10G 未満でも 最低 1G は もどる (正解して 0G は寂しい)", () => {
    expect(cashback(8)).toBe(1);
    expect(cashback(1)).toBe(1);
  });

  it("0 以下・不正な値は 0", () => {
    expect(cashback(0)).toBe(0);
    expect(cashback(-5)).toBe(0);
    expect(cashback(Number.NaN)).toBe(0);
  });
});

describe("paidCandidates", () => {
  it("桁に合わせた キリのいい額 (10/50/100 系) を出す", () => {
    expect(paidCandidates(8, 1000)).toEqual([10, 50, 100]);
    expect(paidCandidates(30, 1000)).toEqual([40, 50, 100]);
    expect(paidCandidates(120, 10_000)).toEqual([200, 500, 1000]);
    expect(paidCandidates(850, 10_000)).toEqual([900, 1000]);
  });

  it("ちょうどの額でも 1 段上げる (おつり > 0)", () => {
    expect(paidCandidates(10, 1000)).toEqual([20, 50, 100]);
    expect(paidCandidates(100, 10_000)).toEqual([200, 500, 1000]);
  });

  it("もちがねを超える候補は除く", () => {
    expect(paidCandidates(8, 60)).toEqual([10, 50]);
    expect(paidCandidates(8, 9)).toEqual([]);
  });
});

describe("changeChallenge", () => {
  it("paid ≥ price、answer が choices に含まれ、choices は重複しない", () => {
    const rng = mulberry32(7);
    const cases = [
      [8, 1000],
      [30, 100],
      [140, 500],
      [280, 300],
      [999, 5000],
    ] as const;
    for (const [price, gold] of cases) {
      for (let i = 0; i < RUNS; i++) {
        const c = changeChallenge(price, gold, rng);
        expect(c.paid).toBeGreaterThanOrEqual(price);
        expect(c.paid).toBeLessThanOrEqual(gold);
        expect(c.change).toBe(c.paid - price);
        expect(c.answer).toBe(String(c.change));
        expect(c.choices).toContain(c.answer);
        expect(new Set(c.choices).size).toBe(3);
        expect(c.text).toBe(`${c.paid - c.change}Gの しなものを ${c.paid}Gで はらった。おつりは いくら?`);
      }
    }
  });

  it("キリのいい額を出せないときは もちがね全額で はらう", () => {
    const c = changeChallenge(8, 9, mulberry32(1));
    expect(c.paid).toBe(9);
    expect(c.change).toBe(1);
  });

  it("もちがね == 代金 なら おつり 0 (呼び出し側が出題を見送る)", () => {
    const c = changeChallenge(8, 8, mulberry32(1));
    expect(c.paid).toBe(8);
    expect(c.change).toBe(0);
  });

  it("同じ seed なら 同じ問題 (再現可能)", () => {
    const a = changeChallenge(120, 10_000, mulberry32(123));
    const b = changeChallenge(120, 10_000, mulberry32(123));
    expect(a).toEqual(b);
    const c = changeChallenge(120, 10_000, mulberry32(124));
    expect([a.paid, ...a.choices]).not.toEqual([c.paid, ...c.choices]);
  });
});

describe("changeProblem", () => {
  it("出題パネル用の Problem にする (ひき算の図と解説つき)", () => {
    const p = changeProblem(changeChallenge(30, 100, mulberry32(3)));
    expect(p.skillId).toBe(SHOP_CHANGE_SKILL_ID);
    expect(p.op).toBe("-");
    expect(p.a! - p.b!).toBe(Number(p.answer));
    expect(p.b).toBe(30);
    expect(p.choices).toContain(p.answer);
    expect(p.explain.length).toBeGreaterThan(0);
  });
});

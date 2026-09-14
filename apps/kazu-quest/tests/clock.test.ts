import { afterEach, describe, expect, it } from "vitest";
import { advanceClock, now, resetClock } from "../src/lib/clock";

afterEach(() => {
  resetClock();
});

describe("clock", () => {
  it("オフセットが 0 のときは Date.now() とほぼ同じ", () => {
    const before = Date.now();
    const value = now();
    const after = Date.now();
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(after);
  });

  it("advanceClock で指定した ms だけ未来にずれる", () => {
    const base = now();
    advanceClock(1000);
    expect(now() - base).toBeGreaterThanOrEqual(1000);
  });

  it("advanceClock は積み上がる (複数回呼べる)", () => {
    const base = now();
    advanceClock(500);
    advanceClock(500);
    expect(now() - base).toBeGreaterThanOrEqual(1000);
  });

  it("負の値を渡すと時計を戻せる", () => {
    advanceClock(10_000);
    const advanced = now();
    advanceClock(-10_000);
    expect(now()).toBeLessThan(advanced);
  });

  it("resetClock でオフセットが 0 に戻る", () => {
    advanceClock(999_999);
    resetClock();
    const before = Date.now();
    const value = now();
    const after = Date.now();
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(after);
  });
});

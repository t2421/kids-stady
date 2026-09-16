import { describe, expect, it } from "vitest";
import { buildPulseWave, getPulseWave, type PeriodicWaveFactory } from "../src/game/audio/pulseWave";

/*
 * AU-06: パルス波の PeriodicWave 近似生成とキャッシュ。
 * 本物の AudioContext.createPeriodicWave は Node に無いので、最小限の
 * duck-typed スタブ (PeriodicWaveFactory) で純ロジックとして検証する。
 */

function fakeFactory() {
  let calls = 0;
  const factory: PeriodicWaveFactory<{ real: Float32Array; imag: Float32Array }> = {
    createPeriodicWave(real, imag) {
      calls += 1;
      return { real, imag };
    },
  };
  return { factory, calls: () => calls };
}

describe("buildPulseWave", () => {
  it("produces a real/imag pair of length harmonics+1 with a zero DC term", () => {
    const { factory } = fakeFactory();
    const wave = buildPulseWave(factory, 0.5, 8);
    expect(wave.real).toHaveLength(9);
    expect(wave.imag).toHaveLength(9);
    expect(wave.real.every((v) => v === 0)).toBe(true);
    expect(wave.imag[0]).toBe(0);
  });

  it("a 50% duty cycle cancels even harmonics (classic square-wave shape)", () => {
    const { factory } = fakeFactory();
    const wave = buildPulseWave(factory, 0.5, 8);
    for (let n = 2; n <= 8; n += 2) {
      expect(wave.imag[n]).toBeCloseTo(0, 6);
    }
    for (let n = 1; n <= 8; n += 2) {
      expect(Math.abs(wave.imag[n])).toBeGreaterThan(0);
    }
  });

  it("a non-50% duty cycle leaves even harmonics non-zero (this is what makes pulse widths sound different)", () => {
    const { factory } = fakeFactory();
    const wave = buildPulseWave(factory, 0.25, 8);
    expect(Math.abs(wave.imag[2])).toBeGreaterThan(0);
  });

  it("defaults to 24 harmonics when none is given", () => {
    const { factory } = fakeFactory();
    const wave = buildPulseWave(factory, 0.25);
    expect(wave.real).toHaveLength(25);
  });
});

describe("getPulseWave caching", () => {
  it("returns the same wave object for the same (context, duty) pair without recomputing", () => {
    const { factory, calls } = fakeFactory();
    const a = getPulseWave(factory, 0.25);
    const b = getPulseWave(factory, 0.25);
    expect(a).toBe(b);
    expect(calls()).toBe(1);
  });

  it("computes a separate wave per duty cycle on the same context", () => {
    const { factory, calls } = fakeFactory();
    const a = getPulseWave(factory, 0.125);
    const b = getPulseWave(factory, 0.5);
    expect(a).not.toBe(b);
    expect(calls()).toBe(2);
  });

  it("keeps separate caches per context (no cross-context leakage)", () => {
    const one = fakeFactory();
    const two = fakeFactory();
    const a = getPulseWave(one.factory, 0.25);
    const b = getPulseWave(two.factory, 0.25);
    expect(a).not.toBe(b);
    expect(one.calls()).toBe(1);
    expect(two.calls()).toBe(1);
  });
});

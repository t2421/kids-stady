import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorageStub } from "./localStorageStub";
import { SFX_NAMES, SFX_TABLE, type SfxName } from "../src/game/audio/sfxTable";
import { isSoundEnabled, playSfx, setSoundEnabled } from "../src/game/audio/sfx";
import { getSave, startSession } from "../src/game/session";

/*
 * KQ-20 効果音: 名前→パラメータ表の網羅と、Node (AudioContext 無し) で
 * 何を呼んでも例外が出ないこと。実際の発音は iOS 実機の手動確認項目。
 */

const EXPECTED_NAMES: SfxName[] = [
  "cursor",
  "confirm",
  "cancel",
  "hit",
  "critical",
  "miss",
  "spellCast",
  "spellFizzle",
  "heal",
  "correct",
  "wrong",
  "levelUp",
  "treasure",
  "door",
  "save",
  "encounter",
  "victory",
  "defeat",
];

beforeEach(() => {
  installLocalStorageStub();
  startSession(null);
});

describe("SFX_TABLE", () => {
  it("has a spec for every SfxName and nothing else", () => {
    expect([...SFX_NAMES].sort()).toEqual([...EXPECTED_NAMES].sort());
  });

  it("every voice has sane wave / steps / duration / gain", () => {
    for (const name of SFX_NAMES) {
      const spec = SFX_TABLE[name];
      expect(spec.voices.length, name).toBeGreaterThan(0);
      for (const voice of spec.voices) {
        expect(["square", "triangle", "noise"], name).toContain(voice.wave);
        expect(voice.steps.length, name).toBeGreaterThan(0);
        expect(voice.duration, name).toBeGreaterThan(0);
        expect(voice.duration, name).toBeLessThanOrEqual(2);
        expect(voice.gain, name).toBeGreaterThan(0);
        expect(voice.gain, name).toBeLessThanOrEqual(1);
        expect(voice.delay ?? 0, name).toBeGreaterThanOrEqual(0);
        let lastAt = -1;
        for (const step of voice.steps) {
          expect(step.freq, name).toBeGreaterThan(0);
          expect(step.at, name).toBeGreaterThanOrEqual(0);
          /* 周波数の段は時間順で、音の長さの中に収まる */
          expect(step.at, name).toBeGreaterThan(lastAt);
          expect(step.at, name).toBeLessThan(voice.duration);
          lastAt = step.at;
        }
      }
    }
  });
});

describe("playSfx", () => {
  it("does not throw without an AudioContext (Node)", () => {
    expect(typeof globalThis.AudioContext).toBe("undefined");
    for (const name of SFX_NAMES) {
      expect(() => playSfx(name)).not.toThrow();
    }
  });

  it("does not throw for an unknown name", () => {
    expect(() => playSfx("bogus" as SfxName)).not.toThrow();
    expect(() => playSfx(undefined as unknown as SfxName)).not.toThrow();
  });

  it("does not throw when sound is off either", () => {
    setSoundEnabled(false);
    expect(() => playSfx("hit")).not.toThrow();
  });
});

describe("sound setting", () => {
  it("defaults to on and round-trips through the save", () => {
    expect(isSoundEnabled()).toBe(true);
    expect(getSave().settings.sound).toBe(true);
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
    expect(getSave().settings.sound).toBe(false);
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it("does not mutate the previous save object", () => {
    const before = getSave();
    setSoundEnabled(false);
    expect(before.settings.sound).toBe(true);
    expect(getSave()).not.toBe(before);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorageStub } from "./localStorageStub";
import { SFX_NAMES, SFX_TABLE, type SfxName } from "../src/game/audio/sfxTable";
import {
  getMasterBus,
  getVolume,
  isSoundEnabled,
  playSfx,
  setSoundEnabled,
  setVolume,
} from "../src/game/audio/sfx";
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
  "pageTurn",
  "lessonOpen",
  "hintReveal",
  "practiceLevelUp",
  "testStart",
  "testPass",
  "testFail",
  "mastered",
  "shard",
  "crystal",
  "gateOpen",
  "companion",
  "teacherGreet",
  "colorReturn",
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
        /* AU-09: pulse は指定されていれば 3 つのデューティ比のいずれかで、square のみで使う */
        if (voice.pulse !== undefined) {
          expect([0.125, 0.25, 0.5], name).toContain(voice.pulse);
          expect(voice.wave, name).toBe("square");
        }
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

/* AU-01: マスターバス・音量 (0..3)。Node (AudioContext 無し) では never throw、getMasterBus は null */
describe("volume setting and master bus (AU-01)", () => {
  it("defaults to 2 and round-trips through the save, independent of sound", () => {
    expect(getVolume()).toBe(2);
    setVolume(0);
    expect(getVolume()).toBe(0);
    expect(getSave().settings.sound).toBe(true);
    setVolume(3);
    expect(getVolume()).toBe(3);
    expect(getSave().settings.volume).toBe(3);
  });

  it("does not throw when set/read without an AudioContext (Node)", () => {
    for (const v of [0, 1, 2, 3] as const) {
      expect(() => setVolume(v)).not.toThrow();
    }
    expect(() => getVolume()).not.toThrow();
  });

  it("getMasterBus is null without an AudioContext (Node) and never throws", () => {
    expect(typeof globalThis.AudioContext).toBe("undefined");
    expect(() => getMasterBus()).not.toThrow();
    expect(getMasterBus()).toBeNull();
  });
});

/* AU-01: 既存18種の gain を ×1.6 (相対バランスは保つ、1 を超えたらキャップ) */
describe("SFX_TABLE gain (AU-01)", () => {
  it("no voice gain exceeds 1 (cap after ×1.6)", () => {
    for (const name of SFX_NAMES) {
      for (const voice of SFX_TABLE[name].voices) {
        expect(voice.gain, name).toBeLessThanOrEqual(1);
      }
    }
  });

  it("spot-checks pre-existing voices were raised ×1.6 from their KQ-20 baseline", () => {
    expect(SFX_TABLE.cursor.voices[0].gain).toBeCloseTo(0.09 * 1.6, 5);
    expect(SFX_TABLE.confirm.voices[0].gain).toBeCloseTo(0.11 * 1.6, 5);
    expect(SFX_TABLE.victory.voices[0].gain).toBeCloseTo(0.13 * 1.6, 5);
    expect(SFX_TABLE.victory.voices[1].gain).toBeCloseTo(0.12 * 1.6, 5);
  });
});

/* AU-09: パルス幅による音色の作り込み。値域と、5つの「大きな報酬」が互いに聞き分けられることを守る */
describe("SFX_TABLE pulse timbre (AU-09)", () => {
  const REWARD_NAMES: SfxName[] = ["crystal", "victory", "testPass", "mastered", "levelUp"];

  it("crystal remains the longest sound in the whole table (biggest reward, AU-02 design intent)", () => {
    const durationOf = (name: SfxName): number =>
      Math.max(...SFX_TABLE[name].voices.map((v) => v.duration));
    const crystalDuration = durationOf("crystal");
    for (const name of SFX_NAMES) {
      if (name === "crystal") continue;
      expect(crystalDuration, name).toBeGreaterThanOrEqual(durationOf(name));
    }
  });

  it("crystal is still built from 3 simultaneous voices (a sustained chord)", () => {
    expect(SFX_TABLE.crystal.voices.length).toBe(3);
  });

  it("the 5 big-reward sounds each have a distinct duration/pulse signature", () => {
    const signatures = REWARD_NAMES.map((name) => {
      const spec = SFX_TABLE[name];
      const maxDuration = Math.max(...spec.voices.map((v) => v.duration));
      const pulseSignature = spec.voices.map((v) => v.pulse ?? "default").join(",");
      return `${name}:${maxDuration}:${pulseSignature}`;
    });
    expect(new Set(signatures).size).toBe(REWARD_NAMES.length);
  });

  it("mastered uses the narrowest pulse in the table for its shimmer, distinct from crystal/victory/levelUp", () => {
    const masteredPulse = SFX_TABLE.mastered.voices.find((v) => v.wave === "square")?.pulse;
    expect(masteredPulse).toBe(0.125);
    for (const name of ["crystal", "victory", "levelUp"] as SfxName[]) {
      for (const voice of SFX_TABLE[name].voices) {
        if (voice.wave === "square") expect(voice.pulse, name).not.toBe(0.125);
      }
    }
  });

  it("sharp/urgent sounds (hit, critical, encounter, wrong) lean on the narrowest pulse", () => {
    for (const name of ["hit", "critical", "encounter", "wrong"] as SfxName[]) {
      const squareVoice = SFX_TABLE[name].voices.find((v) => v.wave === "square");
      expect(squareVoice?.pulse, name).toBe(0.125);
    }
  });

  it("soft/positive sounds (correct, hintReveal, companion) stay unset (default 50% duty, unchanged tone)", () => {
    for (const name of ["correct", "hintReveal", "companion"] as SfxName[]) {
      const squareVoice = SFX_TABLE[name].voices.find((v) => v.wave === "square");
      expect(squareVoice?.pulse, name).toBeUndefined();
    }
  });
});

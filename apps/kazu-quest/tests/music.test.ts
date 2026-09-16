import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorageStub } from "./localStorageStub";
import {
  compileSong,
  DEFAULT_STEPS_PER_BAR,
  MAX_BARS,
  MIN_BARS,
  noteToFreq,
  parseVoice,
  validateSong,
  type SongDef,
} from "../src/lib/music/notation";
import { SONG_IDS, SONGS, songForTheme, THEME_SONGS } from "../src/content/music";
import { listMaps } from "../src/content/maps";
import { baseBgm, currentBgm, overlayBgm, playBgm, popBgm, pushBgm, stopBgm } from "../src/game/audio/bgm";
import { startSession } from "../src/game/session";

/*
 * KQ-21 BGM: 曲データの文法・小節長、テーマ→曲の対応の網羅、
 * Node (AudioContext 無し) で bgm を呼んでも例外が出ないこと。
 */

const bar = (s: string) => s;
const eightBars = (pattern: string) => Array(8).fill(pattern).join(" | ");

function songWith(overrides: Partial<SongDef>): SongDef {
  return {
    title: "test",
    tempo: 120,
    lead: eightBars("c4 - e4 - g4 ~ - -"),
    /* AU-06: harmony が必須になったので既定値を用意 (lead の3度上) */
    harmony: eightBars("e4 - g4 - c5 ~ - -"),
    bass: eightBars("c3 - - - g2 - - -"),
    ...overrides,
  };
}

describe("noteToFreq", () => {
  it("tunes a4 = 440 and handles sharps / flats / octaves", () => {
    expect(noteToFreq("a4")).toBeCloseTo(440, 6);
    expect(noteToFreq("a5")).toBeCloseTo(880, 6);
    expect(noteToFreq("c4")).toBeCloseTo(261.63, 1);
    expect(noteToFreq("f#4")).toBeCloseTo(369.99, 1);
    expect(noteToFreq("bb3")).toBeCloseTo(noteToFreq("a#3")!, 6);
  });

  it("rejects things that are not note names", () => {
    for (const bad of ["h4", "c", "c9", "C4", "-", "~", "x", ""]) {
      expect(noteToFreq(bad), bad).toBeNull();
    }
  });
});

describe("parseVoice", () => {
  it("turns steps into beats (8 steps per bar = half a beat each)", () => {
    const { events, bars } = parseVoice(bar("c4 - e4 ~ - - g4 -"));
    expect(bars).toBe(1);
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ startBeat: 0, durBeats: 0.5 });
    expect(events[1]).toMatchObject({ startBeat: 1, durBeats: 1 });
    expect(events[2]).toMatchObject({ startBeat: 3, durBeats: 0.5 });
    expect(events[0].freq).toBeCloseTo(noteToFreq("c4")!, 6);
  });

  it("ties can span a bar line and a trailing bar separator is allowed", () => {
    const { events, bars } = parseVoice("c4 ~ ~ ~ ~ ~ ~ ~ | ~ ~ ~ ~ - - - - |");
    expect(bars).toBe(2);
    expect(events).toHaveLength(1);
    expect(events[0].durBeats).toBe(6);
  });

  it("respects stepsPerBar and drum symbols", () => {
    const { events } = parseVoice("x - o -", { stepsPerBar: 4, symbols: { x: 7000, o: 320 } });
    expect(events.map((e) => e.freq)).toEqual([7000, 320]);
    expect(events[1].startBeat).toBe(2);
    expect(DEFAULT_STEPS_PER_BAR).toBe(8);
  });

  it("reports the bar number for the wrong number of steps", () => {
    expect(() => parseVoice("c4 - - - - - - - | c4 - -")).toThrow(/bar 2 has 3 steps/);
  });

  it("rejects unknown tokens and a tie with nothing before it", () => {
    expect(() => parseVoice("c4 - q4 - - - - -")).toThrow(/unknown token "q4"/);
    expect(() => parseVoice("~ - - - - - - -")).toThrow(/tie/);
    expect(() => parseVoice("c4 - - - - - - -", { symbols: { x: 1 } })).toThrow(/unknown token/);
  });
});

describe("compileSong / validateSong", () => {
  it("merges voices in time order and reports loop length", () => {
    const song = compileSong(songWith({ drum: eightBars("x - x - x - x -") }));
    expect(song.bars).toBe(8);
    expect(song.loopBeats).toBe(32);
    for (let i = 1; i < song.events.length; i++) {
      expect(song.events[i].startBeat).toBeGreaterThanOrEqual(song.events[i - 1].startBeat);
    }
    /* AU-06: harmony は常に必須の第3声として含まれる */
    expect(new Set(song.events.map((e) => e.voice))).toEqual(new Set(["lead", "harmony", "bass", "drum"]));
  });

  it("rejects voices with different bar counts", () => {
    const msg = validateSong(songWith({ bass: Array(7).fill("c3 - - - - - - -").join(" | ") }));
    expect(msg).toMatch(/bass has 7 bars but lead has 8/);
  });

  it("rejects too few or too many bars", () => {
    const short = Array(MIN_BARS - 1).fill("c4 - - - - - - -").join(" | ");
    expect(validateSong(songWith({ lead: short, harmony: short, bass: short }))).toMatch(/bars/);
    const long = Array(MAX_BARS + 1).fill("c4 - - - - - - -").join(" | ");
    expect(validateSong(songWith({ lead: long, harmony: long, bass: long }))).toMatch(/bars/);
  });

  it("rejects tempos outside the playable range", () => {
    expect(validateSong(songWith({ tempo: 30 }))).toMatch(/tempo/);
    expect(validateSong(songWith({ tempo: 400 }))).toMatch(/tempo/);
    expect(validateSong(songWith({ tempo: Number.NaN }))).toMatch(/tempo/);
  });

  it("prefixes voice errors with the voice name", () => {
    expect(validateSong(songWith({ lead: eightBars("c4 zz - - - - - -") }))).toMatch(/^lead: bar 1/);
  });
});

describe("SONGS", () => {
  it("has exactly the 9 songs (7 roadmap + AU-03 lesson/test)", () => {
    expect([...SONG_IDS].sort()).toEqual(
      ["battle", "boss", "dungeon", "ending", "field", "lesson", "test", "title", "town"].sort(),
    );
    expect(Object.keys(SONGS).sort()).toEqual([...SONG_IDS].sort());
  });

  it.each(SONG_IDS)("%s validates and is 8-32 bars", (id) => {
    expect(validateSong(SONGS[id])).toBeNull();
    const song = compileSong(SONGS[id]);
    expect(song.bars).toBeGreaterThanOrEqual(MIN_BARS);
    expect(song.bars).toBeLessThanOrEqual(MAX_BARS);
    expect(song.events.filter((e) => e.voice === "lead").length).toBeGreaterThan(0);
    /* AU-06: harmony は必須の第3声。lead と同じ小節数で必ず鳴る */
    expect(song.events.filter((e) => e.voice === "harmony").length).toBeGreaterThan(0);
    expect(song.events.filter((e) => e.voice === "bass").length).toBeGreaterThan(0);
    expect(SONGS[id].title.length).toBeGreaterThan(0);
  });

  /* AU-06: harmony が lead/bass と同じ小節数であること (別々に確認しておく) */
  it.each(SONG_IDS)("%s: harmony has the same bar count as lead", (id) => {
    const { stepsPerBar, lead, harmony } = SONGS[id];
    const leadBars = parseVoice(lead, { stepsPerBar }).bars;
    const harmonyBars = parseVoice(harmony, { stepsPerBar }).bars;
    expect(harmonyBars).toBe(leadBars);
  });
});

/* AU-06: harmony が必須の第3声であること。3和音 (lead/harmony/bass) を常に強制する */
describe("harmony is a required 3rd voice (AU-06)", () => {
  it("compileSong/validateSong reject a SongDef missing harmony, even bypassing the TS type", () => {
    const full = songWith({});
    const { harmony: _harmony, ...withoutHarmony } = full;
    const bad = withoutHarmony as unknown as SongDef;
    expect(() => compileSong(bad)).toThrow(/harmony is required/);
    expect(validateSong(bad)).toMatch(/harmony is required/);
  });

  it("rejects an empty-string harmony", () => {
    expect(validateSong(songWith({ harmony: "" }))).toMatch(/harmony is required/);
  });

  it("validates harmony with the same grammar and cross-voice bar rule as lead", () => {
    expect(validateSong(songWith({ harmony: eightBars("c4 zz - - - - - -") }))).toMatch(
      /^harmony: bar 1/,
    );
    const sevenBars = Array(7).fill("c4 - - - - - - -").join(" | ");
    expect(validateSong(songWith({ harmony: sevenBars }))).toMatch(/harmony has 7 bars but lead has 8/);
  });
});

/* AU-06: MAX_BARS が 16 → 32 に広がったこと */
describe("MAX_BARS extended to 32 (AU-06)", () => {
  it("MAX_BARS is 32", () => {
    expect(MAX_BARS).toBe(32);
  });

  it.each([24, 32])("accepts a %d-bar song", (bars) => {
    const pattern = Array(bars).fill("c4 - - - - - - -").join(" | ");
    expect(validateSong(songWith({ lead: pattern, harmony: pattern, bass: pattern }))).toBeNull();
  });

  it("rejects a 33-bar song", () => {
    const tooLong = Array(33).fill("c4 - - - - - - -").join(" | ");
    expect(validateSong(songWith({ lead: tooLong, harmony: tooLong, bass: tooLong }))).toMatch(/bars/);
  });
});

/* AU-06: style (pulse/vibrato/echo) の値域。実際の合成は AudioContext が要るので
   bgm.ts/pulseWave.ts の役割 — ここでは compileSong が値を検証し、CompiledSong に
   そのまま通すことだけを確認する */
describe("style: pulse/vibrato/echo (AU-06)", () => {
  it("style is optional — omitting it is backward compatible", () => {
    expect(validateSong(songWith({}))).toBeNull();
    expect(compileSong(songWith({})).style).toBeUndefined();
  });

  it("accepts valid pulse/vibrato/echo values and threads them through to CompiledSong.style", () => {
    const style = { pulse: 0.25 as const, vibrato: 20, echo: 0.4 };
    const compiled = compileSong(songWith({ style }));
    expect(compiled.style).toEqual(style);
  });

  it.each([0.125, 0.25, 0.5] as const)("accepts pulse duty cycle %s", (pulse) => {
    expect(validateSong(songWith({ style: { pulse } }))).toBeNull();
  });

  it("rejects a pulse duty cycle outside the allowed 3 values", () => {
    expect(validateSong(songWith({ style: { pulse: 0.3 as never } }))).toMatch(/pulse/);
  });

  it("rejects negative or non-finite vibrato", () => {
    expect(validateSong(songWith({ style: { vibrato: -1 } }))).toMatch(/vibrato/);
    expect(validateSong(songWith({ style: { vibrato: Number.NaN } }))).toMatch(/vibrato/);
  });

  it("rejects echo outside 0-1", () => {
    expect(validateSong(songWith({ style: { echo: 1.5 } }))).toMatch(/echo/);
    expect(validateSong(songWith({ style: { echo: -0.1 } }))).toMatch(/echo/);
  });

  it("accepts echo at the boundaries 0 and 1", () => {
    expect(validateSong(songWith({ style: { echo: 0 } }))).toBeNull();
    expect(validateSong(songWith({ style: { echo: 1 } }))).toBeNull();
  });
});

/* AU-06: arp は任意の第4声。曲の stepsPerBar をそのまま使う設計 (notation.ts のコメント参照) */
describe("arp: optional 4th voice (AU-06)", () => {
  it("compiles fine without arp (backward compatible)", () => {
    const song = compileSong(songWith({}));
    expect(song.events.some((e) => e.voice === "arp")).toBe(false);
  });

  it("compiles an arp voice using the song's stepsPerBar and tags its events", () => {
    const song = compileSong(songWith({ arp: eightBars("c5 - e5 - g5 - c6 -") }));
    const arpEvents = song.events.filter((e) => e.voice === "arp");
    expect(arpEvents.length).toBeGreaterThan(0);
  });

  it("rejects an arp voice with a mismatched bar count", () => {
    const sevenBars = Array(7).fill("c4 - - - - - - -").join(" | ");
    expect(validateSong(songWith({ arp: sevenBars }))).toMatch(/arp has 7 bars but lead has 8/);
  });
});

/* AU-06: Node (AudioContext 無し) では pulse/vibrato/echo の実合成コード (bgm.ts の
   scheduleTone/attachStyle) はそもそも tick() の `if (!ctx) return` で実行されない
   (§2.7 のとおり Node に AudioContext は無い)。ここでは「style を持つ曲を要求しても
   playBgm/pushBgm/stopBgm が Node で例外を出さない」ことを、実際に compileSong が
   通る (＝ getCompiled が例外を握りつぶす必要がない) 曲データで確認する。
   パルス波の生成自体 (pulseWave.ts) は tests/pulseWave.test.ts で AudioContext 無しに
   直接テストする */
describe("bgm never throws for a style-bearing song, even without AudioContext (AU-06)", () => {
  beforeEach(() => {
    installLocalStorageStub();
    startSession(null);
    stopBgm(0);
  });

  it("compileSong accepts a full style block without throwing (prerequisite for bgm.ts's getCompiled cache)", () => {
    expect(() => compileSong(songWith({ style: { pulse: 0.5, vibrato: 15, echo: 0.5 } }))).not.toThrow();
  });

  it("playBgm/pushBgm/popBgm/stopBgm never throw regardless of style, since no real song id changes shape", () => {
    expect(() => {
      playBgm("title");
      pushBgm("lesson");
      popBgm();
      stopBgm();
    }).not.toThrow();
  });
});

/* AU-03: 「まなびや」(lesson) と「テスト」(test) の 2 曲。§2.4 のテンポ帯を守る */
describe("lesson / test songs (AU-03)", () => {
  it("lesson is calm and in the 96-108 BPM range", () => {
    expect(SONGS.lesson.tempo).toBeGreaterThanOrEqual(96);
    expect(SONGS.lesson.tempo).toBeLessThanOrEqual(108);
  });

  it("test has a light-tension, driving tempo in the 132-144 BPM range", () => {
    expect(SONGS.test.tempo).toBeGreaterThanOrEqual(132);
    expect(SONGS.test.tempo).toBeLessThanOrEqual(144);
  });

  it("test's bass drives with 8th notes (more events than lesson's sparser bass)", () => {
    const testSong = compileSong(SONGS.test);
    const lessonSong = compileSong(SONGS.lesson);
    const testBassEvents = testSong.events.filter((e) => e.voice === "bass").length;
    const lessonBassEvents = lessonSong.events.filter((e) => e.voice === "bass").length;
    expect(testBassEvents).toBeGreaterThan(lessonBassEvents);
  });
});

describe("songForTheme", () => {
  it("every map theme in the content is listed in THEME_SONGS", () => {
    const themes = new Set(listMaps().map((m) => m.theme));
    for (const theme of themes) {
      expect(THEME_SONGS, `theme "${theme}"`).toHaveProperty(theme);
    }
  });

  it("every map resolves to an existing song", () => {
    for (const map of listMaps()) {
      const id = songForTheme(map.theme, map.encounterTableId === null);
      expect(SONGS, `${map.id} (${map.theme})`).toHaveProperty(id);
    }
  });

  it("towns/interiors play town, wild areas play field, caves always play dungeon", () => {
    expect(songForTheme("grass", true)).toBe("town");
    expect(songForTheme("interior", true)).toBe("town");
    expect(songForTheme("grass", false)).toBe("field");
    expect(songForTheme("desert", false)).toBe("field");
    expect(songForTheme("snow", false)).toBe("field");
    expect(songForTheme("forest", false)).toBe("field");
    expect(songForTheme("cave", true)).toBe("dungeon");
    expect(songForTheme("cave", false)).toBe("dungeon");
    /* 未知のテーマでも落ちない */
    expect(songForTheme("moon", false)).toBe("field");
  });
});

describe("bgm (no AudioContext)", () => {
  beforeEach(() => {
    installLocalStorageStub();
    startSession(null);
    stopBgm(0);
  });

  it("playBgm / stopBgm never throw and track the requested song", () => {
    expect(currentBgm()).toBeNull();
    playBgm("title");
    expect(currentBgm()).toBe("title");
    playBgm("title");
    expect(currentBgm()).toBe("title");
    playBgm("battle");
    expect(currentBgm()).toBe("battle");
    stopBgm();
    expect(currentBgm()).toBeNull();
  });

  it("ignores unknown song ids", () => {
    playBgm("nope" as never);
    expect(currentBgm()).toBeNull();
  });
});

/* AU-03: base / overlay の 2 段。Node (AudioContext 無し) でも push/pop/stop が throw しないこと */
describe("bgm base/overlay (no AudioContext)", () => {
  beforeEach(() => {
    installLocalStorageStub();
    startSession(null);
    stopBgm(0);
  });

  it("pushBgm sets the overlay; current() reports it; popBgm reverts to base", () => {
    playBgm("town");
    expect(currentBgm()).toBe("town");
    pushBgm("lesson");
    expect(currentBgm()).toBe("lesson");
    popBgm();
    expect(currentBgm()).toBe("town");
  });

  it("base()/overlay() expose the raw per-layer ids independently of current()", () => {
    playBgm("field");
    expect(baseBgm()).toBe("field");
    expect(overlayBgm()).toBeNull();
    pushBgm("test");
    expect(baseBgm()).toBe("field");
    expect(overlayBgm()).toBe("test");
    popBgm();
    expect(baseBgm()).toBe("field");
    expect(overlayBgm()).toBeNull();
  });

  it("pushing a second overlay replaces the first (never nests)", () => {
    playBgm("town");
    pushBgm("lesson");
    pushBgm("test");
    expect(currentBgm()).toBe("test");
    expect(overlayBgm()).toBe("test");
    popBgm();
    expect(currentBgm()).toBe("town");
    expect(overlayBgm()).toBeNull();
  });

  it("pushBgm works even without a base; popBgm returns to null", () => {
    expect(currentBgm()).toBeNull();
    pushBgm("lesson");
    expect(currentBgm()).toBe("lesson");
    popBgm();
    expect(currentBgm()).toBeNull();
  });

  it("stopBgm clears both base and overlay", () => {
    playBgm("field");
    pushBgm("test");
    stopBgm();
    expect(currentBgm()).toBeNull();
    expect(baseBgm()).toBeNull();
    expect(overlayBgm()).toBeNull();
  });

  it("never throws for unknown ids, popping with nothing pushed, or repeated pop", () => {
    expect(() => pushBgm("nope" as never)).not.toThrow();
    expect(() => popBgm()).not.toThrow();
    expect(() => popBgm()).not.toThrow();
    expect(currentBgm()).toBeNull();
  });
});

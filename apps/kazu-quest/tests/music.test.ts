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
import { currentBgm, playBgm, stopBgm } from "../src/game/audio/bgm";
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
    expect(new Set(song.events.map((e) => e.voice))).toEqual(new Set(["lead", "bass", "drum"]));
  });

  it("rejects voices with different bar counts", () => {
    const msg = validateSong(songWith({ bass: Array(7).fill("c3 - - - - - - -").join(" | ") }));
    expect(msg).toMatch(/bass has 7 bars but lead has 8/);
  });

  it("rejects too few or too many bars", () => {
    const short = Array(MIN_BARS - 1).fill("c4 - - - - - - -").join(" | ");
    expect(validateSong(songWith({ lead: short, bass: short }))).toMatch(/bars/);
    const long = Array(MAX_BARS + 1).fill("c4 - - - - - - -").join(" | ");
    expect(validateSong(songWith({ lead: long, bass: long }))).toMatch(/bars/);
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
  it("has exactly the 7 songs of the roadmap", () => {
    expect([...SONG_IDS].sort()).toEqual(
      ["battle", "boss", "dungeon", "ending", "field", "title", "town"].sort(),
    );
    expect(Object.keys(SONGS).sort()).toEqual([...SONG_IDS].sort());
  });

  it.each(SONG_IDS)("%s validates and is 8-16 bars", (id) => {
    expect(validateSong(SONGS[id])).toBeNull();
    const song = compileSong(SONGS[id]);
    expect(song.bars).toBeGreaterThanOrEqual(MIN_BARS);
    expect(song.bars).toBeLessThanOrEqual(MAX_BARS);
    expect(song.events.filter((e) => e.voice === "lead").length).toBeGreaterThan(0);
    expect(song.events.filter((e) => e.voice === "bass").length).toBeGreaterThan(0);
    expect(SONGS[id].title.length).toBeGreaterThan(0);
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

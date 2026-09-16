/*
 * BGM 曲データ (KQ-21)。すべてオリジナル曲 (既存ゲームの旋律は模倣しない)。
 * 記法は src/lib/music/notation.ts: `|` で小節、1 小節 8 ステップ (8分音符)、
 * `-` 休符、`~` タイ。ドラムは x = ハイハット / o = キック。
 * 各曲 8〜32 小節をループ。テスト (tests/music.test.ts) が文法と小節長を守る。
 *
 * AU-06 (2026-09-16): `harmony` (第2声) が必須になったので全曲に追加した。
 * ここでの harmony は「lead を 3 度下でハモらせる (同じリズム・同じ休符/タイの
 * 位置)」という単純な書き方で、常に 3 声 (lead/harmony/bass) が同時に鳴って
 * 三和音として聞こえることを目的にした最小限の実装。曲ごとの本格的な和声
 * (属和音への交代・不協和での演出など) は AU-07 (町6曲) / AU-08 (この6曲の
 * 作り込み) の仕事 — ここでは意図的に触っていない。
 */

import type { SongDef } from "../lib/music/notation";

export type SongId =
  | "title"
  | "town"
  | "field"
  | "dungeon"
  | "battle"
  | "boss"
  | "ending"
  | "lesson"
  | "test";

export const SONG_IDS: readonly SongId[] = [
  "title",
  "town",
  "field",
  "dungeon",
  "battle",
  "boss",
  "ending",
  "lesson",
  "test",
];

export const SONGS: Record<SongId, SongDef> = {
  /* 夜明けの誓い — ハ長調、ゆったりしたファンファーレ風 (8 小節) */
  title: {
    title: "よあけの ちかい",
    tempo: 96,
    lead: [
      "c5 ~ e5 ~ g5 ~ ~ e5",
      "a5 ~ g5 ~ e5 ~ ~ ~",
      "f5 ~ a5 ~ c6 ~ ~ a5",
      "g5 ~ ~ ~ ~ ~ - -",
      "e5 ~ g5 ~ c6 ~ ~ b5",
      "a5 ~ f5 ~ d5 ~ ~ ~",
      "e5 ~ g5 ~ f5 ~ d5 ~",
      "c5 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    /* AU-06: lead を 3 度下でハモる (同じリズム) */
    harmony: [
      "a4 ~ c5 ~ e5 ~ ~ c5",
      "f5 ~ e5 ~ c5 ~ ~ ~",
      "d5 ~ f5 ~ a5 ~ ~ f5",
      "e5 ~ ~ ~ ~ ~ - -",
      "c5 ~ e5 ~ a5 ~ ~ g5",
      "f5 ~ d5 ~ b4 ~ ~ ~",
      "c5 ~ e5 ~ d5 ~ b4 ~",
      "a4 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    bass: [
      "c3 - - - g3 - - -",
      "a3 - - - e3 - - -",
      "f3 - - - c3 - - -",
      "g3 - - - g2 - - -",
      "c3 - - - g3 - - -",
      "f3 - - - d3 - - -",
      "c3 - - - g3 - - -",
      "c3 ~ ~ ~ ~ ~ ~ ~",
    ].join(" | "),
  },

  /* ひだまりの町 — ヘ長調、はねるリズム (8 小節) */
  town: {
    title: "ひだまりの まち",
    tempo: 112,
    lead: [
      "f5 - a5 - c6 ~ a5 -",
      "g5 - bb5 - g5 ~ - -",
      "e5 - g5 - c6 ~ g5 -",
      "f5 ~ ~ ~ - - c5 -",
      "d5 - f5 - a5 ~ f5 -",
      "bb4 - d5 - f5 ~ - -",
      "g5 - e5 - c5 - d5 -",
      "f5 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    /* AU-06: lead を 3 度下でハモる (同じリズム) */
    harmony: [
      "d5 - f5 - a5 ~ f5 -",
      "e5 - g5 - e5 ~ - -",
      "c5 - e5 - a5 ~ e5 -",
      "d5 ~ ~ ~ - - a4 -",
      "b4 - d5 - f5 ~ d5 -",
      "g4 - b4 - d5 ~ - -",
      "e5 - c5 - a4 - b4 -",
      "d5 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    bass: [
      "f3 - c3 - f3 - c3 -",
      "g3 - d3 - g3 - bb3 -",
      "c3 - g3 - c3 - e3 -",
      "f3 - c3 - f3 - a3 -",
      "d3 - a3 - d3 - f3 -",
      "bb2 - f3 - bb2 - d3 -",
      "c3 - g3 - c3 - g3 -",
      "f3 - c3 - f3 - - -",
    ].join(" | "),
    drum: [
      "x - x - x - x -",
      "x - x - x - x -",
      "x - x - x - x -",
      "x - x - x - x x",
      "x - x - x - x -",
      "x - x - x - x -",
      "x - x - x - x -",
      "x - x - x - - -",
    ].join(" | "),
  },

  /* かぜの草原 — ニ短調→ヘ長調、前へ進む感じ (16 小節) */
  field: {
    title: "かぜの そうげん",
    tempo: 126,
    lead: [
      "d5 - f5 - a5 ~ g5 f5",
      "e5 ~ c5 ~ e5 ~ - -",
      "d5 - f5 - a5 ~ c6 ~",
      "a5 ~ ~ ~ - - a4 c5",
      "d5 - f5 - a5 ~ g5 f5",
      "g5 ~ e5 ~ c5 ~ - -",
      "bb4 - d5 - f5 - e5 -",
      "d5 ~ ~ ~ ~ ~ - -",
      "f5 - a5 - c6 ~ a5 -",
      "bb5 ~ a5 ~ g5 ~ f5 -",
      "e5 - g5 - bb5 ~ g5 -",
      "a5 ~ ~ ~ - - f5 g5",
      "a5 - g5 - f5 - e5 -",
      "d5 ~ f5 ~ a5 ~ - -",
      "g5 - f5 - e5 - c#5 -",
      "d5 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    /* AU-06: lead を 3 度下でハモる (同じリズム) */
    harmony: [
      "b4 - d5 - f5 ~ e5 d5",
      "c5 ~ a4 ~ c5 ~ - -",
      "b4 - d5 - f5 ~ a5 ~",
      "f5 ~ ~ ~ - - f4 a4",
      "b4 - d5 - f5 ~ e5 d5",
      "e5 ~ c5 ~ a4 ~ - -",
      "g4 - b4 - d5 - c5 -",
      "b4 ~ ~ ~ ~ ~ - -",
      "d5 - f5 - a5 ~ f5 -",
      "g5 ~ f5 ~ e5 ~ d5 -",
      "c5 - e5 - g5 ~ e5 -",
      "f5 ~ ~ ~ - - d5 e5",
      "f5 - e5 - d5 - c5 -",
      "b4 ~ d5 ~ f5 ~ - -",
      "e5 - d5 - c5 - a4 -",
      "b4 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    bass: [
      "d3 - d3 - a3 - d3 -",
      "c3 - c3 - g3 - c3 -",
      "d3 - d3 - a3 - d3 -",
      "a2 - a2 - e3 - a2 -",
      "d3 - d3 - a3 - d3 -",
      "c3 - c3 - g3 - c3 -",
      "bb2 - bb2 - f3 - bb2 -",
      "d3 - a2 - d3 - a2 -",
      "f3 - f3 - c3 - f3 -",
      "bb2 - bb2 - f3 - bb2 -",
      "c3 - c3 - g3 - c3 -",
      "f3 - f3 - c3 - f3 -",
      "d3 - d3 - a3 - d3 -",
      "bb2 - bb2 - f3 - bb2 -",
      "a2 - a2 - e3 - a2 -",
      "d3 - a2 - d3 - - -",
    ].join(" | "),
    drum: [
      "o - x - o - x x",
      "o - x - o - x -",
      "o - x - o - x x",
      "o - x - o - x -",
      "o - x - o - x x",
      "o - x - o - x -",
      "o - x - o - x x",
      "o - x - o - - -",
      "o - x - o - x x",
      "o - x - o - x -",
      "o - x - o - x x",
      "o - x - o - x -",
      "o - x - o - x x",
      "o - x - o - x -",
      "o - x - o - x x",
      "o - x - o - - -",
    ].join(" | "),
  },

  /* しずむ洞くつ — ホ短調、低くまばら (8 小節) */
  dungeon: {
    title: "しずむ ほらあな",
    tempo: 84,
    lead: [
      "e4 ~ ~ g4 ~ ~ f#4 ~",
      "e4 ~ ~ ~ - - - -",
      "b4 ~ ~ a4 ~ ~ g4 ~",
      "f#4 ~ ~ ~ - - - -",
      "e4 ~ ~ g4 ~ ~ bb4 ~",
      "b4 ~ ~ ~ - - - -",
      "c5 ~ b4 ~ g4 ~ f#4 ~",
      "e4 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    /* AU-06: lead を 3 度下でハモる (同じリズム)。暗い雰囲気を保つため低め */
    harmony: [
      "c4 ~ ~ e4 ~ ~ d4 ~",
      "c4 ~ ~ ~ - - - -",
      "g4 ~ ~ f#4 ~ ~ e4 ~",
      "d4 ~ ~ ~ - - - -",
      "c4 ~ ~ e4 ~ ~ g4 ~",
      "g4 ~ ~ ~ - - - -",
      "a4 ~ g4 ~ e4 ~ d4 ~",
      "c4 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    bass: [
      "e2 ~ ~ ~ b2 ~ ~ ~",
      "e2 ~ ~ ~ d3 ~ ~ ~",
      "c3 ~ ~ ~ g2 ~ ~ ~",
      "b2 ~ ~ ~ f#2 ~ ~ ~",
      "e2 ~ ~ ~ g2 ~ ~ ~",
      "c3 ~ ~ ~ b2 ~ ~ ~",
      "a2 ~ ~ ~ b2 ~ ~ ~",
      "e2 ~ ~ ~ ~ ~ ~ ~",
    ].join(" | "),
    drum: [
      "o - - - - - x -",
      "o - - - - - - -",
      "o - - - - - x -",
      "o - - - - - - -",
      "o - - - - - x -",
      "o - - - - - - -",
      "o - - - - - x -",
      "o - - - - - - -",
    ].join(" | "),
  },

  /* たたかいの太鼓 — イ短調、疾走 (8 小節) */
  battle: {
    title: "たたかいの たいこ",
    tempo: 160,
    lead: [
      "a4 a4 c5 a4 e5 - d5 c5",
      "b4 b4 d5 b4 e5 - - -",
      "a4 a4 c5 a4 e5 - g5 e5",
      "f5 e5 d5 c5 b4 ~ - -",
      "c5 c5 e5 c5 g5 - f5 e5",
      "d5 d5 f5 d5 a5 - - -",
      "g5 f5 e5 d5 c5 b4 a4 g#4",
      "a4 ~ ~ - e5 - a4 -",
    ].join(" | "),
    /* AU-06: lead を 3 度下でハモる (同じリズム) */
    harmony: [
      "f4 f4 a4 f4 c5 - b4 a4",
      "g4 g4 b4 g4 c5 - - -",
      "f4 f4 a4 f4 c5 - e5 c5",
      "d5 c5 b4 a4 g4 ~ - -",
      "a4 a4 c5 a4 e5 - d5 c5",
      "b4 b4 d5 b4 f5 - - -",
      "e5 d5 c5 b4 a4 g4 f4 e4",
      "f4 ~ ~ - c5 - f4 -",
    ].join(" | "),
    bass: [
      "a2 a3 a2 a3 a2 a3 a2 a3",
      "g2 g3 g2 g3 g2 g3 g2 g3",
      "a2 a3 a2 a3 a2 a3 a2 a3",
      "f2 f3 f2 f3 e2 e3 e2 e3",
      "c3 c4 c3 c4 c3 c4 c3 c4",
      "d3 d4 d3 d4 d3 d4 d3 d4",
      "f2 f3 f2 f3 e2 e3 e2 e3",
      "a2 a3 a2 a3 e2 e3 e2 e3",
    ].join(" | "),
    drum: [
      "o x x x o x x x",
      "o x x x o x o x",
      "o x x x o x x x",
      "o x x x o x o o",
      "o x x x o x x x",
      "o x x x o x o x",
      "o x x x o x x x",
      "o x o x o o o o",
    ].join(" | "),
  },

  /* まおうの影 — ハ短調、三全音でにらみ合う (8 小節) */
  boss: {
    title: "まおうの かげ",
    tempo: 168,
    lead: [
      "c5 c5 - c5 eb5 - f#5 -",
      "g5 ~ f#5 f5 eb5 - c5 -",
      "c5 c5 - c5 eb5 - f#5 -",
      "ab5 ~ g5 ~ f5 eb5 d5 -",
      "eb5 eb5 - g5 bb5 - ab5 g5",
      "f5 f5 - ab5 c6 - bb5 ab5",
      "g5 - f#5 - g5 - ab5 -",
      "g5 ~ ~ ~ - b4 - -",
    ].join(" | "),
    /* AU-06: lead を 3 度下でハモる (同じリズム)。三全音の緊張感を保つ */
    harmony: [
      "a4 a4 - a4 c5 - d5 -",
      "e5 ~ d5 d5 c5 - a4 -",
      "a4 a4 - a4 c5 - d5 -",
      "f5 ~ e5 ~ d5 c5 b4 -",
      "c5 c5 - e5 g5 - f5 e5",
      "d5 d5 - f5 a5 - g5 f5",
      "e5 - d5 - e5 - f5 -",
      "e5 ~ ~ ~ - g4 - -",
    ].join(" | "),
    bass: [
      "c2 c2 c3 c2 c2 c2 c3 c2",
      "c2 c2 c3 c2 f#2 f#2 g2 g2",
      "c2 c2 c3 c2 c2 c2 c3 c2",
      "ab2 ab2 ab2 ab2 g2 g2 g2 g2",
      "eb2 eb2 eb3 eb2 eb2 eb2 eb3 eb2",
      "f2 f2 f3 f2 f2 f2 f3 f2",
      "g2 g2 g2 g2 ab2 ab2 ab2 ab2",
      "g2 g2 g2 g2 g2 - - -",
    ].join(" | "),
    drum: [
      "o o x - o - x x",
      "o o x - o - x x",
      "o o x - o - x x",
      "o o x - o o o o",
      "o o x - o - x x",
      "o o x - o - x x",
      "o o x - o - x x",
      "o o x - o - - -",
    ].join(" | "),
  },

  /* かえりみち — ト長調、あたたかく (16 小節)。KQ-22 のエンディングで使う */
  ending: {
    title: "かえりみち",
    tempo: 88,
    lead: [
      "g4 - b4 - d5 ~ ~ b4",
      "c5 ~ b4 ~ a4 ~ ~ ~",
      "g4 - b4 - d5 ~ ~ e5",
      "d5 ~ ~ ~ - - d5 e5",
      "f#5 ~ e5 ~ d5 ~ b4 ~",
      "c5 ~ d5 ~ e5 ~ ~ ~",
      "d5 ~ c5 ~ b4 ~ a4 ~",
      "g4 ~ ~ ~ ~ ~ - -",
      "b4 - d5 - g5 ~ ~ f#5",
      "e5 ~ d5 ~ b4 ~ ~ ~",
      "c5 - e5 - a5 ~ ~ g5",
      "f#5 ~ ~ ~ - - d5 e5",
      "f#5 - g5 - a5 ~ g5 ~",
      "f#5 ~ e5 ~ d5 ~ ~ ~",
      "c5 ~ b4 ~ a4 ~ f#4 ~",
      "g4 ~ ~ ~ ~ ~ ~ ~",
    ].join(" | "),
    /* AU-06: lead を 3 度下でハモる (同じリズム) */
    harmony: [
      "e4 - g4 - b4 ~ ~ g4",
      "a4 ~ g4 ~ f4 ~ ~ ~",
      "e4 - g4 - b4 ~ ~ c5",
      "b4 ~ ~ ~ - - b4 c5",
      "d5 ~ c5 ~ b4 ~ g4 ~",
      "a4 ~ b4 ~ c5 ~ ~ ~",
      "b4 ~ a4 ~ g4 ~ f4 ~",
      "e4 ~ ~ ~ ~ ~ - -",
      "g4 - b4 - e5 ~ ~ d5",
      "c5 ~ b4 ~ g4 ~ ~ ~",
      "a4 - c5 - f5 ~ ~ e5",
      "d5 ~ ~ ~ - - b4 c5",
      "d5 - e5 - f5 ~ e5 ~",
      "d5 ~ c5 ~ b4 ~ ~ ~",
      "a4 ~ g4 ~ f4 ~ d4 ~",
      "e4 ~ ~ ~ ~ ~ ~ ~",
    ].join(" | "),
    bass: [
      "g2 - - - d3 - - -",
      "a2 - - - e3 - - -",
      "g2 - - - d3 - - -",
      "d3 - - - a2 - - -",
      "b2 - - - f#3 - - -",
      "c3 - - - g3 - - -",
      "d3 - - - a2 - - -",
      "g2 - - - d3 - - -",
      "g2 - - - d3 - - -",
      "e3 - - - b2 - - -",
      "c3 - - - g3 - - -",
      "d3 - - - a2 - - -",
      "d3 - - - a2 - - -",
      "b2 - - - f#3 - - -",
      "c3 - - - d3 - - -",
      "g2 ~ ~ ~ ~ ~ ~ ~",
    ].join(" | "),
  },

  /* まなびやの ひかり — AU-03: レッスン中の overlay 曲。ト長調、96-108 BPM の落ち着いた曲。
     ドラムなし (title と同じく静かな場面向け)。8 小節ループ */
  lesson: {
    title: "まなびやの ひかり",
    tempo: 100,
    lead: [
      "g4 - b4 - d5 ~ - -",
      "c5 - b4 - a4 ~ - -",
      "g4 - b4 - d5 ~ e5 -",
      "d5 ~ ~ ~ - - c5 -",
      "b4 - d5 - g5 ~ - -",
      "f#5 ~ e5 ~ d5 ~ - -",
      "c5 - b4 - a4 - g4 -",
      "g4 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    /* AU-06: lead を 3 度下でハモる (同じリズム)。落ち着いた曲なので控えめに */
    harmony: [
      "e4 - g4 - b4 ~ - -",
      "a4 - g4 - f4 ~ - -",
      "e4 - g4 - b4 ~ c5 -",
      "b4 ~ ~ ~ - - a4 -",
      "g4 - b4 - e5 ~ - -",
      "d5 ~ c5 ~ b4 ~ - -",
      "a4 - g4 - f4 - e4 -",
      "e4 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    bass: [
      "g2 - - - d3 - - -",
      "c3 - - - g2 - - -",
      "g2 - - - d3 - - -",
      "d3 - - - a2 - - -",
      "e2 - - - b2 - - -",
      "c3 - - - g2 - - -",
      "d3 - - - a2 - - -",
      "g2 ~ ~ ~ ~ ~ ~ ~",
    ].join(" | "),
  },

  /* たしかめの とき — AU-03: テスト中の overlay 曲。ホ短調 (ト長調の平行調)、
     132-144 BPM、ベースが 8 分刻みで走る「軽い緊張」。boss (168 BPM・ハ短調) の
     怖さは出さない。8 小節ループ */
  test: {
    title: "たしかめの とき",
    tempo: 138,
    lead: [
      "e5 - g5 - b5 - a5 -",
      "g5 - f#5 - e5 - - -",
      "e5 - g5 - b5 - d6 -",
      "b5 ~ ~ ~ - - a5 g5",
      "a5 - b5 - c6 - b5 -",
      "a5 - g5 - f#5 - - -",
      "g5 - a5 - b5 - c6 -",
      "b5 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    /* AU-06: lead を 3 度下でハモる (同じリズム)。軽い緊張感を保つ */
    harmony: [
      "c5 - e5 - g5 - f5 -",
      "e5 - d5 - c5 - - -",
      "c5 - e5 - g5 - b5 -",
      "g5 ~ ~ ~ - - f5 e5",
      "f5 - g5 - a5 - g5 -",
      "f5 - e5 - d5 - - -",
      "e5 - f5 - g5 - a5 -",
      "g5 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    bass: [
      "e3 e3 e3 e3 e3 e3 e3 e3",
      "d3 d3 d3 d3 d3 d3 d3 d3",
      "e3 e3 e3 e3 e3 e3 e3 e3",
      "b2 b2 b2 b2 b2 b2 b2 b2",
      "c3 c3 c3 c3 c3 c3 c3 c3",
      "b2 b2 b2 b2 b2 b2 b2 b2",
      "e3 e3 e3 e3 e3 e3 e3 e3",
      "b2 b2 b2 b2 b2 b2 b2 b2",
    ].join(" | "),
    drum: [
      "o x x x o x x x",
      "o x x x o x o x",
      "o x x x o x x x",
      "o x x x o x o o",
      "o x x x o x x x",
      "o x x x o x o x",
      "o x x x o x x x",
      "o x o x o x o x",
    ].join(" | "),
  },
};

/*
 * MapDef.theme → 曲。テーマ値は src/content/chapters と dev/maps に現れるものを
 * すべて列挙する (tests/music.test.ts が全マップを走査して未知のテーマを検出する)。
 * 洞くつ系は戦闘の有無にかかわらずダンジョン曲、それ以外は
 * encounterTableId === null (町・屋内) なら町、あれば旅の曲。
 */
export const THEME_SONGS: Record<string, { town: SongId; wild: SongId }> = {
  grass: { town: "town", wild: "field" },
  forest: { town: "town", wild: "field" },
  desert: { town: "town", wild: "field" },
  snow: { town: "town", wild: "field" },
  interior: { town: "town", wild: "field" },
  cave: { town: "dungeon", wild: "dungeon" },
};

export function songForTheme(theme: string, isTown: boolean): SongId {
  const entry = THEME_SONGS[theme] ?? THEME_SONGS.grass;
  return isTown ? entry.town : entry.wild;
}

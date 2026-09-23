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
import { chapterForMap } from "./chapters";
import { TOWN_SONG_IDS, TOWN_SONGS, type TownSongId } from "./musicTowns";
import type { MapDef } from "./types";

export type SongId =
  | "title"
  | "town"
  | "field"
  | "dungeon"
  | "battle"
  | "boss"
  | "ending"
  | "lesson"
  | "test"
  | TownSongId;

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
  ...TOWN_SONG_IDS,
];

/* AU-07: 章の町6曲 (town1〜town6) は src/content/musicTowns.ts に分離してある
   (AU-08 が同時に書き込む既存6曲の本体とファイルを分けるため)。ここでは
   additive に merge するだけ — 既存9曲の中身はこの const の宣言行以外、無変更 */
const BASE_SONGS: Record<Exclude<SongId, TownSongId>, SongDef> = {
  /* 夜明けの誓い — ハ長調、ゆったりしたファンファーレ風。
   * AU-08: 8→16 小節に拡張 (最初の2小節=旋律の核はそのまま)。B 区間 (9-16) で
   * 音域を上げて発展させ、終止は核の結句 (旧8小節目) で締める。
   * 進行: I-vi-IV-V-I-ii-V7-I (A) → V-vi-IV-I-ii-V7-vi-I (B、G から再出発する変化球)。
   * harmony は「3度下でなぞる」のをやめ、各小節の和音の構成音 (3度・5度、G7 は
   * 7th の f も) を低いオクターブで長く伸ばすパッド (lead とは別リズムで動く第2声)
   * にした。style は付けない — ファンファーレの澄んだ音を保つ判断 (AU-08 の裁量) */
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
      "g5 ~ b5 ~ d6 ~ ~ b5",
      "a5 ~ c6 ~ e5 ~ ~ ~",
      "f5 ~ a5 ~ c6 ~ ~ a5",
      "c6 ~ ~ ~ ~ ~ g5 e5",
      "d5 ~ f5 ~ a5 ~ ~ f5",
      "g5 ~ f5 ~ d5 ~ b4 ~",
      "a4 ~ c5 ~ e5 ~ f5 ~",
      "c5 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    /* AU-08: 各小節の和音構成音 (3度+5度、G7 は7th) をパッドとして伸ばす。
       lead が動く8分音符主体なのに対し harmony はほぼ半小節保持 — 別リズムの第2声 */
    harmony: [
      "e4 ~ ~ ~ g4 ~ ~ ~",
      "c4 ~ ~ ~ e4 ~ ~ ~",
      "a3 ~ ~ ~ c4 ~ ~ ~",
      "b3 ~ ~ ~ d4 ~ - -",
      "e4 ~ ~ ~ g4 ~ ~ b4",
      "f3 ~ ~ ~ a3 ~ ~ ~",
      "b3 ~ ~ ~ d4 ~ f4 ~",
      "c4 ~ ~ ~ ~ ~ - -",
      "d4 ~ ~ ~ g4 ~ ~ ~",
      "c4 ~ ~ ~ e4 ~ ~ ~",
      "a3 ~ ~ ~ c4 ~ ~ ~",
      "e4 ~ ~ ~ ~ ~ g4 e4",
      "f3 ~ ~ ~ a3 ~ ~ ~",
      "b3 ~ ~ ~ d4 ~ f4 ~",
      "c4 ~ ~ ~ e4 ~ f4 ~",
      "c4 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    bass: [
      "c3 - - - g3 - - -",
      "a3 - - - e3 - - -",
      "f3 - - - c3 - - -",
      "g3 - - - g2 - - -",
      "c3 - - - g3 - - -",
      "d3 - - - a3 - - -",
      "g2 - - - g3 - - -",
      "c3 ~ ~ ~ ~ ~ ~ ~",
      "g3 - - - d3 - - -",
      "a3 - - - e3 - - -",
      "f3 - - - c3 - - -",
      "c3 - - - g3 - - -",
      "d3 - - - a3 - - -",
      "g2 - - - g3 - - -",
      "a3 - - - e3 - - -",
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

  /* かぜの草原 — ニ短調 (自然短音階)、前へ進む感じ。AU-08: 小節数は変えず (既に16)、
   * 進行は元のまま (i-bVII-i-v-i-bVII-bVI-i-III-bVI-V7/III-III-i-bVI-v-i、bass は
   * 既にこの根音を刻んでいたので不変) harmony だけを「3度下でなぞる」から各小節の
   * 和音構成音 (3度+5度) を保持するパッドに書き直した。style.vibrato はごく浅く
   * — 「かぜ」の草原にそよぐ風の揺らぎを表す軽いピッチのゆれ (AU-08 の裁量) */
  field: {
    title: "かぜの そうげん",
    tempo: 126,
    style: { vibrato: 8 },
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
    /* AU-08: 「3度下でなぞる」を廃し、各小節の和音構成音 (3度+5度) を低いオクターブで
       伸ばすパッドに書き直した (i=Dm, bVII=C, v=A, bVI=Bb, III=F, V7/III=C7)。
       lead の忙しい8分音符列とは別リズムで動く独立した第2声になる */
    harmony: [
      "f4 ~ ~ ~ a4 ~ ~ ~",
      "e4 ~ ~ ~ g4 ~ ~ ~",
      "f4 ~ ~ ~ a4 ~ ~ ~",
      "c#4 ~ ~ ~ e4 ~ ~ ~",
      "f4 ~ ~ ~ a4 ~ ~ ~",
      "e4 ~ ~ ~ g4 ~ ~ ~",
      "d4 ~ ~ ~ f4 ~ ~ ~",
      "f4 ~ ~ ~ a4 ~ - -",
      "a3 ~ ~ ~ c4 ~ ~ ~",
      "d4 ~ ~ ~ f4 ~ ~ ~",
      "e4 ~ ~ ~ bb3 ~ ~ ~",
      "a3 ~ ~ ~ c4 ~ ~ ~",
      "f4 ~ ~ ~ a4 ~ ~ ~",
      "d4 ~ ~ ~ f4 ~ ~ ~",
      "c#4 ~ ~ ~ e4 ~ ~ ~",
      "f4 ~ ~ ~ a4 ~ - -",
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

  /* しずむ洞くつ — ホ短調、低くまばら。AU-08: 8→16 小節に拡張 (最初の2小節は核のまま)。
   * bass の根音から読める実際の進行は i-i7-bVI-v-i-bVI(→v)-iv(→v)-i (自然短音階の
   * 陰りを保つため v は長三和音にせず Bm のまま)。B 区間 (9-16) は bVI-bIII-iv-i-bVII-
   * iv-v-i で一段暗く沈み、15小節目で元の7小節目 (下降フレーズ) を Bm 上で再現してから
   * 締める。harmony は各和音の構成音を低いオクターブのパッドにし、style.echo で
   * 「しずんだ」洞くつの反響を付けた */
  dungeon: {
    title: "しずむ ほらあな",
    tempo: 84,
    style: { echo: 0.3 },
    lead: [
      "e4 ~ ~ g4 ~ ~ f#4 ~",
      "e4 ~ ~ ~ - - - -",
      "b4 ~ ~ a4 ~ ~ g4 ~",
      "f#4 ~ ~ ~ - - - -",
      "e4 ~ ~ g4 ~ ~ bb4 ~",
      "b4 ~ ~ ~ - - - -",
      "c5 ~ b4 ~ g4 ~ f#4 ~",
      "e4 ~ ~ ~ ~ ~ - -",
      "c5 ~ ~ e5 ~ ~ g4 ~",
      "g4 ~ ~ ~ - - - -",
      "a4 ~ ~ c5 ~ ~ e5 ~",
      "e4 ~ ~ ~ - - - -",
      "d4 ~ ~ f#4 ~ ~ a4 ~",
      "a4 ~ ~ ~ - - - -",
      "c5 ~ b4 ~ g4 ~ f#4 ~",
      "e4 ~ ~ ~ ~ ~ - -",
    ].join(" | "),
    /* AU-08: 各小節の和音構成音 (3度+5度) のパッド。伸ばすリズムは lead と揃えず
       独立して動く第2声にした */
    harmony: [
      "b3 ~ ~ ~ g3 ~ ~ ~",
      "g3 ~ ~ ~ - - - -",
      "e4 ~ ~ ~ c4 ~ ~ ~",
      "d3 ~ ~ ~ - - - -",
      "g3 ~ ~ ~ ~ ~ b3 ~",
      "d4 ~ ~ ~ - - - -",
      "e4 ~ c4 ~ ~ ~ a3 ~",
      "b3 ~ ~ ~ - - - -",
      "e3 ~ ~ ~ g3 ~ ~ ~",
      "b3 ~ ~ ~ - - - -",
      "c4 ~ ~ ~ e4 ~ ~ ~",
      "g3 ~ ~ ~ - - - -",
      "f#3 ~ ~ ~ a3 ~ ~ ~",
      "c4 ~ ~ ~ - - - -",
      "g3 ~ f#3 ~ e3 ~ d3 ~",
      "b3 ~ ~ ~ - - - -",
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
      "c3 ~ ~ ~ g2 ~ ~ ~",
      "g2 ~ ~ ~ d3 ~ ~ ~",
      "a2 ~ ~ ~ e3 ~ ~ ~",
      "e2 ~ ~ ~ b2 ~ ~ ~",
      "d3 ~ ~ ~ a2 ~ ~ ~",
      "a2 ~ ~ ~ e3 ~ ~ ~",
      "b2 ~ ~ ~ f#3 ~ ~ ~",
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
      "o - - - - - x -",
      "o - - - - - - -",
      "o - - - - - x -",
      "o - - - - - - -",
      "o - - - - - x -",
      "o - - - - - - -",
      "o - - - o - x -",
      "o - - - - - - -",
    ].join(" | "),
  },

  /* たたかいの太鼓 — イ短調、疾走。AU-08: 8→16 小節に拡張 (最初の2小節は核のまま)。
   * bass の根音から読める進行 i-bVII-i-bVI/V-III-iv-bVI/V-i/V (harmonic minor の
   * 導音 g# で V=E に色付け) はそのまま保つ。B区間 (9-14) で音域を上げて畳みかけ、
   * 15-16 小節目は旧7-8小節目 (下降フレーズ→終止) をそのまま再現してループを
   * 締める。harmony は「3度下でなぞる」を廃し、忙しい lead の下で低いオクターブの
   * パッドとして動く。style.pulse は 0.125 (細いパルス幅) — boss の 0.25 より
   * さらに薄く尖った音にして、両者の疾走感を音色で書き分ける判断 (AU-08 の裁量) */
  battle: {
    title: "たたかいの たいこ",
    tempo: 160,
    style: { pulse: 0.125 },
    lead: [
      "a4 a4 c5 a4 e5 - d5 c5",
      "b4 b4 d5 b4 e5 - - -",
      "a4 a4 c5 a4 e5 - g5 e5",
      "f5 e5 d5 c5 b4 ~ - -",
      "c5 c5 e5 c5 g5 - f5 e5",
      "d5 d5 f5 d5 a5 - - -",
      "g5 f5 e5 d5 c5 b4 a4 g#4",
      "a4 ~ ~ - e5 - a4 -",
      "f5 f5 a5 f5 c6 - bb5 a5",
      "e5 e5 g#5 e5 b5 - a5 g#5",
      "a5 a5 c6 a5 e6 - d6 c6",
      "g5 g5 bb5 g5 d6 - - -",
      "d5 d5 f5 d5 a5 - g5 f5",
      "e5 e5 g#5 e5 b5 - - -",
      "g5 f5 e5 d5 c5 b4 a4 g#4",
      "a4 ~ ~ - e5 - a4 -",
    ].join(" | "),
    /* AU-08: 各小節の和音構成音 (3度+5度) を低いオクターブのパッドにした */
    harmony: [
      "c4 ~ ~ ~ e4 ~ ~ ~",
      "g3 ~ ~ ~ b3 ~ ~ ~",
      "c4 ~ ~ ~ e4 ~ ~ ~",
      "a3 ~ ~ ~ g#3 ~ ~ ~",
      "e4 ~ ~ ~ g4 ~ ~ ~",
      "f3 ~ ~ ~ a3 ~ ~ ~",
      "a3 ~ ~ ~ g#3 ~ ~ ~",
      "c4 ~ ~ - g#3 - c4 -",
      "a3 ~ ~ ~ c4 ~ ~ ~",
      "g#3 ~ ~ ~ b3 ~ ~ ~",
      "c4 ~ ~ ~ e4 ~ ~ ~",
      "b3 ~ ~ ~ d4 ~ ~ ~",
      "f3 ~ ~ ~ a3 ~ ~ ~",
      "g#3 ~ ~ ~ b3 ~ ~ ~",
      "a3 ~ ~ ~ g#3 ~ ~ ~",
      "c4 ~ ~ - g#3 - c4 -",
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
      "f2 f3 f2 f3 f2 f3 f2 f3",
      "e2 e3 e2 e3 e2 e3 e2 e3",
      "a2 a3 a2 a3 a2 a3 a2 a3",
      "g2 g3 g2 g3 g2 g3 g2 g3",
      "d2 d3 d2 d3 d2 d3 d2 d3",
      "e2 e3 e2 e3 e2 e3 e2 e3",
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
      "o x x x o x x x",
      "o x x x o x o x",
      "o o x x o x x x",
      "o x x x o x o x",
      "o x x x o x x x",
      "o x x x o x o x",
      "o x x x o x x x",
      "o x o x o o o o",
    ].join(" | "),
  },

  /* まおうの影 — ハ短調、三全音でにらみ合う。AU-08: 8→16 小節に拡張 (最初の2小節は核の
   * まま)。bass の根音から読める進行 i-i(→V, 三全音代理)-i-bVI/V-III-iv7-V/bVI-V は
   * そのまま保つ (元から属和音の裏コードを使う本格的な進行だった)。B区間 (9-14) は
   * bVI-i(callback)-i-iv7(callback)-V(callback) で旧2/1/6/7小節を再訪し、15小節目で
   * 半音階の下降 (三全音の緊張を強調) を経て16小節目 (旧8小節目) の終止に戻る。
   * harmony は各和音の構成音のパッド。style.pulse: 0.25 (鋭い音色) + 軽い vibrato で
   * 緊張感を足した */
  boss: {
    title: "まおうの かげ",
    tempo: 168,
    style: { pulse: 0.25, vibrato: 12 },
    lead: [
      "c5 c5 - c5 eb5 - f#5 -",
      "g5 ~ f#5 f5 eb5 - c5 -",
      "c5 c5 - c5 eb5 - f#5 -",
      "ab5 ~ g5 ~ f5 eb5 d5 -",
      "eb5 eb5 - g5 bb5 - ab5 g5",
      "f5 f5 - ab5 c6 - bb5 ab5",
      "g5 - f#5 - g5 - ab5 -",
      "g5 ~ ~ ~ - b4 - -",
      "ab5 ab5 - ab5 c6 - db6 -",
      "g5 ~ f#5 f5 eb5 - c5 -",
      "c5 c5 - c5 eb5 - f#5 -",
      "g5 ~ ~ ~ - eb5 - -",
      "f5 f5 - ab5 c6 - bb5 ab5",
      "g5 - f#5 - g5 - ab5 -",
      "d6 - c#6 - c6 - b5 -",
      "g5 ~ ~ ~ - b4 - -",
    ].join(" | "),
    /* AU-08: 各小節の和音構成音のパッド (Cm=eb+g, G=b+d, Ab=c+eb, Fm7=ab+c, C7=e+bb 等)。
       15小節目は lead の半音階下降にあわせてハモりも半音で追走し、三全音の緊張を強める */
    harmony: [
      "eb4 ~ ~ ~ g3 ~ ~ ~",
      "eb4 ~ ~ ~ d4 ~ b3 ~",
      "eb4 ~ ~ ~ g3 ~ ~ ~",
      "c4 ~ ~ ~ b3 ~ ~ ~",
      "g3 ~ ~ ~ bb3 ~ ~ ~",
      "ab3 ~ ~ ~ c4 ~ ~ ~",
      "b3 ~ ~ ~ c4 ~ ~ ~",
      "b3 ~ ~ ~ - d4 - -",
      "c4 ~ ~ ~ eb4 ~ ~ ~",
      "eb4 ~ ~ ~ d4 ~ b3 ~",
      "eb4 ~ ~ ~ g3 ~ ~ ~",
      "g3 ~ ~ ~ b3 ~ ~ ~",
      "ab3 ~ ~ ~ c4 ~ ~ ~",
      "b3 ~ ~ ~ c4 ~ ~ ~",
      "f#3 ~ f3 ~ e3 ~ eb3 ~",
      "b3 ~ ~ ~ - d4 - -",
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
      "ab2 ab2 ab2 ab2 ab2 ab2 ab2 ab2",
      "c2 c2 c3 c2 f#2 f#2 g2 g2",
      "c2 c2 c3 c2 c2 c2 c3 c2",
      "c2 c2 c2 c2 g2 g2 g2 g2",
      "f2 f2 f3 f2 f2 f2 f3 f2",
      "g2 g2 g2 g2 ab2 ab2 ab2 ab2",
      "d2 d2 c#2 c#2 c2 c2 b2 b2",
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
      "o o x - o - x x",
      "o o x - o - x x",
      "o o x - o - x x",
      "o o x - o o o o",
      "o o x - o - x x",
      "o o x - o - x x",
      "o o o o o o o o",
      "o o x - o - - -",
    ].join(" | "),
  },

  /* かえりみち — ト長調、あたたかく (16 小節)。KQ-22 のエンディングで使う。
   * AU-08: 小節数・lead・bass は不変 (bass の根音から読める I-ii-I-V-iii-IV-V-I-I-vi-
   * IV-V-V-iii-IV/V-I はすでに良い進行だったので保つ)。harmony を「3度下でなぞる」
   * から各小節の和音構成音のパッドに書き直し、style.echo で「かえりみち」の
   * あたたかく余韻の残るエンディングらしい空間を付けた (feedback は engine 側で
   * ≤0.35 に上限されるので 0.3 は控えめ) */
  ending: {
    title: "かえりみち",
    tempo: 88,
    style: { echo: 0.3 },
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
    /* AU-08: 各小節の和音構成音 (3度+5度) を伸ばすパッドに書き直した
       (I=G, ii=Am, V=D, iii=Bm, IV=C, vi=Em)。lead の旋律とは別リズムで長く保持し、
       あたたかく寄り添う第2声にした */
    harmony: [
      "b3 ~ ~ ~ d4 ~ ~ ~",
      "c4 ~ ~ ~ e4 ~ ~ ~",
      "b3 ~ ~ ~ d4 ~ ~ ~",
      "f#3 ~ ~ ~ - - a3 b3",
      "d4 ~ ~ ~ f#3 ~ ~ ~",
      "e4 ~ ~ ~ g4 ~ ~ ~",
      "f#3 ~ ~ ~ a3 ~ ~ ~",
      "b3 ~ ~ ~ ~ ~ - -",
      "d4 ~ ~ ~ g4 ~ ~ ~",
      "g3 ~ ~ ~ b3 ~ ~ ~",
      "e4 ~ ~ ~ g4 ~ ~ ~",
      "f#3 ~ ~ ~ - - a3 b3",
      "a3 ~ ~ ~ f#3 ~ ~ ~",
      "d4 ~ ~ ~ f#3 ~ ~ ~",
      "e4 ~ ~ ~ f#3 ~ ~ ~",
      "d4 ~ ~ ~ ~ ~ ~ ~",
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

/* AU-07: 既存9曲 + 町6曲 (musicTowns.ts) を additive に merge する */
export const SONGS: Record<SongId, SongDef> = { ...BASE_SONGS, ...TOWN_SONGS };

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

/*
 * AU-07: 章の町を専用曲 (town<grade>) で鳴らす。
 * 「町かどうか」は 従来の テーマ別の割り当て (songForTheme) が "town" を返すか で決める。
 * エンカウントの無いマップ = 町 とすると、ボス部屋 (ピラミッドの玄室・九九の塔の上など、
 * 洞くつテーマで エンカウント無し) まで 町の曲に なってしまうため (12マップ。実際に発生)。
 * 章が取れないマップ (dev/maps 等) や 章7 のように町の曲が無い章は 従来どおり
 */
export function songForMap(map: MapDef): SongId {
  const base = songForTheme(map.theme, map.encounterTableId === null);
  if (base !== "town") return base;
  const chapter = chapterForMap(map.id);
  if (!chapter) return base;
  const id = `town${chapter.grade}` as SongId;
  return Object.prototype.hasOwnProperty.call(SONGS, id) ? id : base;
}

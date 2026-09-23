/*
 * 効果音の定義表 (純データ — WebAudio には触らない)。
 * ファミコン風の 3 音色: square (矩形波・メロディ/効果), triangle (三角波・ベース/回復),
 * noise (LFSR ノイズ・打撃/ドア)。1 つの効果音は複数ボイスの重ね合わせ。
 * 再生は sfx.ts が担う。tests/sfx.test.ts が全名前の網羅と値域を検証する。
 */

export type SfxName =
  | "cursor"
  | "confirm"
  | "cancel"
  | "hit"
  | "critical"
  | "miss"
  | "spellCast"
  | "spellFizzle"
  | "heal"
  | "correct"
  | "wrong"
  | "levelUp"
  | "treasure"
  | "door"
  | "save"
  | "encounter"
  | "victory"
  | "defeat"
  | "pageTurn"
  | "lessonOpen"
  | "hintReveal"
  | "practiceLevelUp"
  | "testStart"
  | "testPass"
  | "testFail"
  | "mastered"
  | "shard"
  | "crystal"
  | "gateOpen"
  | "companion"
  | "teacherGreet"
  | "colorReturn";

export type SfxWave = "square" | "triangle" | "noise";

/* 周波数エンベロープの 1 段: 開始から at 秒後に freq Hz へ (階段状 = チップチューンの
   アルペジオ)。noise では freq をローパスフィルタのカットオフとして使う */
export interface SfxStep {
  at: number;
  freq: number;
}

export interface SfxVoice {
  wave: SfxWave;
  steps: SfxStep[];
  /* 秒。最後は指数減衰で消える */
  duration: number;
  /* 0..1 の音量 */
  gain: number;
  /* 開始オフセット (秒)。重ねるボイスの時間差用 */
  delay?: number;
  /* true なら段ごとに一瞬音を切る (ファンファーレの音符の区切り) */
  gate?: boolean;
  /* AU-09: パルス幅 (デューティ比)。wave === "square" のときだけ効く — bgm.ts の
     SongDef.style.pulse と同じ値域だが、こちらはボイスごとに個別に選べる。
     未指定 (= 従来どおりの矩形波、デューティ比 50% 相当) は音を一切変えない */
  pulse?: 0.125 | 0.25 | 0.5;
}

export interface SfxSpec {
  voices: SfxVoice[];
}

/* 等間隔の音符列を steps に変換するヘルパー (表の可読性のため) */
function seq(freqs: number[], interval: number): SfxStep[] {
  return freqs.map((freq, i) => ({ at: i * interval, freq }));
}

export const SFX_TABLE: Record<SfxName, SfxSpec> = {
  /* カーソル移動: 高い短いピッ (AU-01: gain ×1.6。AU-09: UI系はパルス0.25で薄く軽いブリップに統一) */
  cursor: {
    voices: [{ wave: "square", steps: [{ at: 0, freq: 1568 }], duration: 0.045, gain: 0.144, pulse: 0.25 }],
  },
  /* 決定: ピッ↗ (AU-01: gain ×1.6。AU-09: cursor/cancel と同じUI系パルス) */
  confirm: {
    voices: [{ wave: "square", steps: seq([1046, 1568], 0.04), duration: 0.1, gain: 0.176, pulse: 0.25 }],
  },
  /* もどる: ピッ↘ (AU-01: gain ×1.6。AU-09: cursor/confirm と同じUI系パルス) */
  cancel: {
    voices: [{ wave: "square", steps: seq([784, 523], 0.05), duration: 0.1, gain: 0.144, pulse: 0.25 }],
  },
  /* 打撃: ノイズの「ザッ」+ 低い矩形波の芯 (AU-01: gain ×1.6。AU-09: 芯を細いパルスで鋭く) */
  hit: {
    voices: [
      { wave: "noise", steps: seq([1800, 400], 0.05), duration: 0.14, gain: 0.352 },
      { wave: "square", steps: seq([220, 110], 0.03), duration: 0.1, gain: 0.224, pulse: 0.125 },
    ],
  },
  /* かいしん: 打撃を太く長く + 落下する矩形波 (AU-01: gain ×1.6。AU-09: hit よりさらに鋭いパルス) */
  critical: {
    voices: [
      { wave: "noise", steps: seq([3200, 600], 0.06), duration: 0.24, gain: 0.448 },
      { wave: "square", steps: seq([330, 165, 82], 0.04), duration: 0.22, gain: 0.288, pulse: 0.125 },
    ],
  },
  /* ミス: 空振りの「ヒュッ」 (AU-01: gain ×1.6。AU-09: 薄く軽いパルスで「かすった」感) */
  miss: {
    voices: [
      { wave: "square", steps: seq([660, 440, 330], 0.06), duration: 0.2, gain: 0.112, pulse: 0.25 },
      { wave: "noise", steps: seq([1200, 300], 0.15), duration: 0.18, gain: 0.112 },
    ],
  },
  /* 呪文成功: 上昇アルペジオ + きらめき (AU-01: gain ×1.6。AU-09: 魔法らしい明るいパルス) */
  spellCast: {
    voices: [
      {
        wave: "square",
        steps: seq([523, 659, 784, 1046, 1318], 0.05),
        duration: 0.34,
        gain: 0.192,
        pulse: 0.25,
      },
      { wave: "triangle", steps: seq([1046, 1318, 1568], 0.1), duration: 0.34, gain: 0.16, delay: 0.05 },
    ],
  },
  /* 呪文不発: しぼむ下降 (AU-01: gain ×1.6。AU-09: 薄いパルスでしぼむ質感を強調) */
  spellFizzle: {
    voices: [
      { wave: "square", steps: seq([880, 830, 784, 740], 0.08), duration: 0.38, gain: 0.16, pulse: 0.25 },
    ],
  },
  /* 回復: 三角波のやさしい上昇 (AU-01: gain ×1.6) */
  heal: {
    voices: [
      { wave: "triangle", steps: seq([659, 784, 988, 1318], 0.08), duration: 0.46, gain: 0.32, gate: true },
    ],
  },
  /* 正解: ピンポン (AU-01: gain ×1.6) */
  correct: {
    voices: [{ wave: "square", steps: seq([1046, 1318], 0.09), duration: 0.24, gain: 0.192, gate: true }],
  },
  /* 不正解: ブッブー (矩形波 + 三角波の低音) (AU-01: gain ×1.6。AU-09: 最も細いパルスで責める「ブー」を鋭く) */
  wrong: {
    voices: [
      { wave: "square", steps: seq([196, 185], 0.15), duration: 0.34, gain: 0.176, gate: true, pulse: 0.125 },
      { wave: "triangle", steps: seq([98, 92], 0.15), duration: 0.34, gain: 0.192, gate: true },
    ],
  },
  /* レベルアップ: 駆け上がるファンファーレ (AU-01: gain ×1.6。AU-09: 大きな報酬系はデフォルトの太いパルスのまま — 5種の聞き分けは音程・長さ・声部構成で担保する) */
  levelUp: {
    voices: [
      { wave: "square", steps: seq([523, 659, 784, 1046, 1318, 1568], 0.09), duration: 0.72, gain: 0.208, gate: true },
      { wave: "triangle", steps: seq([262, 330, 392, 523, 659, 784], 0.09), duration: 0.72, gain: 0.192 },
    ],
  },
  /* 宝箱: チャラ〜ン (AU-01: gain ×1.6。AU-09: shard より太めのパルスで満ちた響きに) */
  treasure: {
    voices: [
      {
        wave: "square",
        steps: seq([784, 988, 1175, 1568], 0.07),
        duration: 0.44,
        gain: 0.208,
        gate: true,
        pulse: 0.25,
      },
      { wave: "triangle", steps: [{ at: 0, freq: 784 }], duration: 0.3, gain: 0.16, delay: 0.21 },
    ],
  },
  /* 扉・マップ移動: きしみ + 低い足音 (AU-01: gain ×1.6。AU-09: 足音は太いパルスのまま (デフォルト) で低く鈍い質感を保つ) */
  door: {
    voices: [
      { wave: "noise", steps: seq([500, 200], 0.08), duration: 0.16, gain: 0.192 },
      { wave: "square", steps: seq([196, 147], 0.05), duration: 0.12, gain: 0.112 },
    ],
  },
  /* きろく: ピロリロリン (AU-01: gain ×1.6。AU-09: UI系と同じ明るいパルス) */
  save: {
    voices: [
      {
        wave: "square",
        steps: seq([1046, 1318, 1568, 2093], 0.1),
        duration: 0.56,
        gain: 0.176,
        gate: true,
        pulse: 0.25,
      },
    ],
  },
  /* エンカウント: 緊張のトリル + ノイズ (AU-01: gain ×1.6。AU-09: 最も細いパルスでトリルを刺すように鋭く) */
  encounter: {
    voices: [
      { wave: "square", steps: seq([880, 415, 880, 415], 0.05), duration: 0.26, gain: 0.224, pulse: 0.125 },
      { wave: "noise", steps: seq([2000, 300], 0.2), duration: 0.26, gain: 0.144 },
    ],
  },
  /* 勝利: ファンファーレ (タタタ タ〜ン) + ベース (AU-01: gain ×1.6。AU-09: デフォルトの太いパルスで王道ファンファーレの厚みを保つ) */
  victory: {
    voices: [
      { wave: "square", steps: seq([523, 523, 523, 659, 784], 0.11), duration: 0.95, gain: 0.208, gate: true },
      { wave: "triangle", steps: seq([262, 262, 262, 330, 392], 0.11), duration: 0.95, gain: 0.192 },
    ],
  },
  /* 全滅: ゆっくり沈む (AU-01: gain ×1.6。AU-09: 沈んでいく質感を薄いパルスで表現) */
  defeat: {
    voices: [
      { wave: "triangle", steps: seq([392, 370, 349, 330], 0.2), duration: 0.95, gain: 0.256 },
      { wave: "square", steps: seq([196, 185, 175, 165], 0.2), duration: 0.95, gain: 0.112, pulse: 0.25 },
    ],
  },

  /* AU-02: 学びの設計 (レッスン/テスト/おさらい) 用の効果音 14 種。以下、既存 18 種は変更しない */

  /* つぎへ (レッスン): 紙めくりの短いノイズ + 高い矩形波 1 音。cursor より柔らかく暖かい */
  pageTurn: {
    voices: [
      { wave: "noise", steps: seq([2200, 700], 0.02), duration: 0.05, gain: 0.11 },
      { wave: "square", steps: [{ at: 0, freq: 1200 }], duration: 0.05, gain: 0.1, delay: 0.02 },
    ],
  },
  /* レッスン画面が開く: 上昇3音の優しいチャイム。confirm より長くやわらかい */
  lessonOpen: {
    voices: [{ wave: "triangle", steps: seq([659, 880, 1174], 0.09), duration: 0.32, gain: 0.14 }],
  },
  /* れんしゅうのヒントが1段深くなる: ピコッ + 短い下降。責めない (wrong と別物) */
  hintReveal: {
    voices: [
      {
        wave: "square",
        steps: [
          { at: 0, freq: 900 },
          { at: 0.04, freq: 1300 },
          { at: 0.09, freq: 1000 },
        ],
        duration: 0.16,
        gain: 0.12,
      },
    ],
  },
  /* れんしゅう Lv1→2→3: 短い2音のファンファーレ。levelUp より短く軽い (AU-09: 明るいパルスで軽さを強調) */
  practiceLevelUp: {
    voices: [
      {
        wave: "square",
        steps: seq([784, 1046], 0.08),
        duration: 0.24,
        gain: 0.15,
        gate: true,
        pulse: 0.25,
      },
      { wave: "triangle", steps: seq([392, 523], 0.08), duration: 0.24, gain: 0.12 },
    ],
  },
  /* テスト開始: 低いドン + 短いトリル。encounter より穏やか (AU-09: encounter (0.125) より広いパルスで穏やかさを保つ) */
  testStart: {
    voices: [
      { wave: "triangle", steps: [{ at: 0, freq: 110 }], duration: 0.18, gain: 0.16 },
      {
        wave: "square",
        steps: seq([440, 330], 0.07),
        duration: 0.2,
        gain: 0.1,
        delay: 0.05,
        pulse: 0.25,
      },
    ],
  },
  /* テスト合格 (→ できる): victory と別の5音ファンファーレ + ベース。0.9〜1.2秒、victory より高い音域で単調に駆け上がる
     (AU-09: victory (デフォルトの太いパルス) と区別できる明るく薄いパルスの駆け上がりに) */
  testPass: {
    voices: [
      {
        wave: "square",
        steps: seq([659, 784, 988, 1175, 1568], 0.09),
        duration: 1.0,
        gain: 0.16,
        gate: true,
        pulse: 0.25,
      },
      { wave: "triangle", steps: seq([330, 330, 392, 392, 494], 0.18), duration: 1.0, gain: 0.13 },
    ],
  },
  /* テスト不合格 (→ べつの説明へ): 2音のゆっくり下降 (三角波)。defeat より短く明るめで励ます
     (AU-09: 三角波のみの声部構成なので pulse は対象外 — 元々やわらかい音色のまま) */
  testFail: {
    voices: [{ wave: "triangle", steps: seq([440, 349], 0.15), duration: 0.4, gain: 0.15 }],
  },
  /* おさらいで マスター に到達: きらめくアルペジオ。levelUp より高い音域・短い長さで区別できる
     (AU-09: 32種中もっとも細いパルスで「きらめき」を最大化し、他の報酬系と明確に区別) */
  mastered: {
    voices: [
      {
        wave: "square",
        steps: seq([1046, 1318, 1568, 2093], 0.06),
        duration: 0.32,
        gain: 0.14,
        gate: true,
        pulse: 0.125,
      },
      { wave: "triangle", steps: seq([1568, 2093, 2637], 0.06), duration: 0.32, gain: 0.11, delay: 0.03 },
    ],
  },
  /* かけらを1個入手: treasure より短い「キラッ」1〜2音 (AU-09: treasure (0.25) より細いパルスで一段小さい輝きに) */
  shard: {
    voices: [
      { wave: "square", steps: seq([1568, 2093], 0.05), duration: 0.14, gain: 0.14, gate: true, pulse: 0.125 },
    ],
  },
  /* かけら6個 → 数晶完成: 和音の持続 (3声同時) + 上昇。本計画で最も豪華、≤2秒
     (AU-09: 太いパルス (デフォルト) のまま — mastered の細い輝きと対照的に、和音全体の厚みで豪華さを出す。
     32種中もっとも長い duration (1.8秒) を保ち、報酬系のなかでも別格であることを維持) */
  crystal: {
    voices: [
      { wave: "triangle", steps: seq([523, 659, 784], 0.5), duration: 1.8, gain: 0.14 },
      { wave: "triangle", steps: seq([659, 784, 988], 0.5), duration: 1.8, gain: 0.12 },
      { wave: "square", steps: seq([784, 988, 1175, 1568], 0.4), duration: 1.8, gain: 0.11, gate: true },
    ],
  },
  /* 章ゲートの番人が消える: 低いゴロゴロ (ノイズ低域) → 上昇する矩形波。door より大きく晴れやか (AU-09: 明るいパルスで開放感を出す) */
  gateOpen: {
    voices: [
      { wave: "noise", steps: seq([300, 150], 0.15), duration: 0.3, gain: 0.15 },
      {
        wave: "square",
        steps: seq([220, 330, 440], 0.1),
        duration: 0.35,
        gain: 0.13,
        delay: 0.15,
        gate: true,
        pulse: 0.25,
      },
    ],
  },
  /* なかまが口を挟むページ: 短い2音の「ピポッ」(声の代わり)。cursor/confirm より遊び心のある旋律 */
  companion: {
    voices: [{ wave: "square", steps: seq([880, 660], 0.06), duration: 0.16, gain: 0.11, gate: true }],
  },
  /* 先生メニューが開く: 木琴風の3音 */
  teacherGreet: {
    voices: [{ wave: "triangle", steps: seq([659, 880, 1046], 0.08), duration: 0.3, gain: 0.14, gate: true }],
  },
  /* ネガリアの色戻し段階が上がる: ゆっくり開く和音 (三角波3声)、1.5秒、暖かい。heal (単一の旋律線) と違い和音が段々重なる */
  colorReturn: {
    voices: [
      { wave: "triangle", steps: [{ at: 0, freq: 392 }], duration: 1.5, gain: 0.14 },
      { wave: "triangle", steps: [{ at: 0, freq: 494 }], duration: 1.5, gain: 0.12, delay: 0.15 },
      { wave: "triangle", steps: [{ at: 0, freq: 588 }], duration: 1.5, gain: 0.11, delay: 0.3 },
    ],
  },
};

export const SFX_NAMES = Object.keys(SFX_TABLE) as SfxName[];

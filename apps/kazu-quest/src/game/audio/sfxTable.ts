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
  | "defeat";

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
}

export interface SfxSpec {
  voices: SfxVoice[];
}

/* 等間隔の音符列を steps に変換するヘルパー (表の可読性のため) */
function seq(freqs: number[], interval: number): SfxStep[] {
  return freqs.map((freq, i) => ({ at: i * interval, freq }));
}

export const SFX_TABLE: Record<SfxName, SfxSpec> = {
  /* カーソル移動: 高い短いピッ */
  cursor: {
    voices: [{ wave: "square", steps: [{ at: 0, freq: 1568 }], duration: 0.045, gain: 0.09 }],
  },
  /* 決定: ピッ↗ */
  confirm: {
    voices: [{ wave: "square", steps: seq([1046, 1568], 0.04), duration: 0.1, gain: 0.11 }],
  },
  /* もどる: ピッ↘ */
  cancel: {
    voices: [{ wave: "square", steps: seq([784, 523], 0.05), duration: 0.1, gain: 0.09 }],
  },
  /* 打撃: ノイズの「ザッ」+ 低い矩形波の芯 */
  hit: {
    voices: [
      { wave: "noise", steps: seq([1800, 400], 0.05), duration: 0.14, gain: 0.22 },
      { wave: "square", steps: seq([220, 110], 0.03), duration: 0.1, gain: 0.14 },
    ],
  },
  /* かいしん: 打撃を太く長く + 落下する矩形波 */
  critical: {
    voices: [
      { wave: "noise", steps: seq([3200, 600], 0.06), duration: 0.24, gain: 0.28 },
      { wave: "square", steps: seq([330, 165, 82], 0.04), duration: 0.22, gain: 0.18 },
    ],
  },
  /* ミス: 空振りの「ヒュッ」 */
  miss: {
    voices: [
      { wave: "square", steps: seq([660, 440, 330], 0.06), duration: 0.2, gain: 0.07 },
      { wave: "noise", steps: seq([1200, 300], 0.15), duration: 0.18, gain: 0.07 },
    ],
  },
  /* 呪文成功: 上昇アルペジオ + きらめき */
  spellCast: {
    voices: [
      { wave: "square", steps: seq([523, 659, 784, 1046, 1318], 0.05), duration: 0.34, gain: 0.12 },
      { wave: "triangle", steps: seq([1046, 1318, 1568], 0.1), duration: 0.34, gain: 0.1, delay: 0.05 },
    ],
  },
  /* 呪文不発: しぼむ下降 */
  spellFizzle: {
    voices: [{ wave: "square", steps: seq([880, 830, 784, 740], 0.08), duration: 0.38, gain: 0.1 }],
  },
  /* 回復: 三角波のやさしい上昇 */
  heal: {
    voices: [
      { wave: "triangle", steps: seq([659, 784, 988, 1318], 0.08), duration: 0.46, gain: 0.2, gate: true },
    ],
  },
  /* 正解: ピンポン */
  correct: {
    voices: [{ wave: "square", steps: seq([1046, 1318], 0.09), duration: 0.24, gain: 0.12, gate: true }],
  },
  /* 不正解: ブッブー (矩形波 + 三角波の低音) */
  wrong: {
    voices: [
      { wave: "square", steps: seq([196, 185], 0.15), duration: 0.34, gain: 0.11, gate: true },
      { wave: "triangle", steps: seq([98, 92], 0.15), duration: 0.34, gain: 0.12, gate: true },
    ],
  },
  /* レベルアップ: 駆け上がるファンファーレ */
  levelUp: {
    voices: [
      { wave: "square", steps: seq([523, 659, 784, 1046, 1318, 1568], 0.09), duration: 0.72, gain: 0.13, gate: true },
      { wave: "triangle", steps: seq([262, 330, 392, 523, 659, 784], 0.09), duration: 0.72, gain: 0.12 },
    ],
  },
  /* 宝箱: チャラ〜ン */
  treasure: {
    voices: [
      { wave: "square", steps: seq([784, 988, 1175, 1568], 0.07), duration: 0.44, gain: 0.13, gate: true },
      { wave: "triangle", steps: [{ at: 0, freq: 784 }], duration: 0.3, gain: 0.1, delay: 0.21 },
    ],
  },
  /* 扉・マップ移動: きしみ + 低い足音 */
  door: {
    voices: [
      { wave: "noise", steps: seq([500, 200], 0.08), duration: 0.16, gain: 0.12 },
      { wave: "square", steps: seq([196, 147], 0.05), duration: 0.12, gain: 0.07 },
    ],
  },
  /* きろく: ピロリロリン */
  save: {
    voices: [{ wave: "square", steps: seq([1046, 1318, 1568, 2093], 0.1), duration: 0.56, gain: 0.11, gate: true }],
  },
  /* エンカウント: 緊張のトリル + ノイズ */
  encounter: {
    voices: [
      { wave: "square", steps: seq([880, 415, 880, 415], 0.05), duration: 0.26, gain: 0.14 },
      { wave: "noise", steps: seq([2000, 300], 0.2), duration: 0.26, gain: 0.09 },
    ],
  },
  /* 勝利: ファンファーレ (タタタ タ〜ン) + ベース */
  victory: {
    voices: [
      { wave: "square", steps: seq([523, 523, 523, 659, 784], 0.11), duration: 0.95, gain: 0.13, gate: true },
      { wave: "triangle", steps: seq([262, 262, 262, 330, 392], 0.11), duration: 0.95, gain: 0.12 },
    ],
  },
  /* 全滅: ゆっくり沈む */
  defeat: {
    voices: [
      { wave: "triangle", steps: seq([392, 370, 349, 330], 0.2), duration: 0.95, gain: 0.16 },
      { wave: "square", steps: seq([196, 185, 175, 165], 0.2), duration: 0.95, gain: 0.07 },
    ],
  },
};

export const SFX_NAMES = Object.keys(SFX_TABLE) as SfxName[];

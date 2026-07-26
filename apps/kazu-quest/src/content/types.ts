/*
 * データ駆動コンテンツのスキーマ (docs/kazu-quest-design-plan.md B5)。
 * 章の追加 = これらの型に合うデータを src/content/chapters/chN/ に足すだけ。
 * 参照整合性は tests/content.test.ts のバリデーションで守る。
 */

import type { Dir, EquipSlot } from "../lib/save";

/* ---------- マップ ---------- */

export interface TileSpec {
  /* ドット絵テクスチャ名 (art/tiles.ts のキー) */
  art: string;
  /*
   * 見た目のゆらぎ候補。指定すると座標ハッシュで決定的に1つ選ぶ
   * (広い草原などの単調な繰り返しを崩す)。同じ art を複数入れて重み付けする。
   */
  variants?: string[];
  walkable: boolean;
  /* true ならこのタイルでエンカウント判定 (草むら・洞くつ床など) */
  encounter?: boolean;
}

export type FlagValue = number | boolean;

export interface FlagCond {
  flag: string;
  op: "set" | "unset" | ">=";
  value?: number;
}

export type EventCommand =
  | { type: "message"; pages: string[] }
  | { type: "setFlag"; flag: string; value?: FlagValue }
  | { type: "giveItem"; itemId: string; count?: number }
  | { type: "giveGold"; amount: number }
  | { type: "learnSpell"; memberId: string; spellId: string }
  | { type: "joinParty"; memberId: string; level?: number }
  | { type: "advanceChapter"; chapter: number }
  | { type: "transfer"; mapId: string; spawn: string }
  | { type: "battle"; monsterIds: string[]; boss?: boolean; winFlag?: string }
  | { type: "openShop"; shopId: string }
  | { type: "healInn"; price: number }
  | { type: "openSpellTest"; spellId: string }
  | { type: "savePoint" }
  | { type: "choice"; prompt: string; yes: EventCommand[]; no: EventCommand[] }
  /* 算数クイズの扉 (九九の塔など)。正解/不正解で分岐する。時間無制限 */
  | {
      type: "quiz";
      skillId: string;
      onCorrect: EventCommand[];
      onWrong: EventCommand[];
    };

export interface DialogEntry {
  /* 先頭から評価し、最初に条件が成立した entry を表示する。if 省略 = 常に成立 */
  if?: FlagCond;
  pages: string[];
  then?: EventCommand[];
}

export interface NpcDef {
  id: string;
  x: number;
  y: number;
  /* ドット絵テクスチャ名 (art/actors.ts のキー) */
  art: string;
  movement: "static" | "wander";
  /* 条件が成立したら消える (橋の番人など)。省略 = 常に表示 */
  hideIf?: FlagCond;
  dialog: DialogEntry[];
}

/* マップ上の座標トリガ (踏む / 調べる) */
export interface MapEvent {
  id: string;
  x: number;
  y: number;
  trigger: "step" | "inspect";
  /* 実行済みフラグが立っていたら発火しない (宝箱など)。省略 = 毎回発火 */
  onceFlag?: string;
  /* 見た目を持つイベント (宝箱など)。tiles の art 名。onceFlag 済みなら消える */
  art?: string;
  commands: EventCommand[];
}

export interface SpawnPoint {
  x: number;
  y: number;
  facing: Dir;
}

export interface MapDef {
  id: string;
  name: string;
  /* タイルパレットのテーマ (章ごとの色調差し替え用。まず "grass" | "cave" 等) */
  theme: string;
  legend: Record<string, TileSpec>;
  /* 1文字 = 1タイル。全行同長 (テストで検証) */
  grid: string[];
  /* null = エンカウントなし (町・屋内) */
  encounterTableId: string | null;
  npcs: NpcDef[];
  events: MapEvent[];
  spawns: Record<string, SpawnPoint>;
}

/* ---------- 戦闘 ---------- */

export type MonsterActionKind = "attack" | "strongAttack" | "heal";

export interface MonsterDef {
  id: string;
  name: string;
  art: string;
  hp: number;
  atk: number;
  def: number;
  agi: number;
  exp: number;
  gold: number;
  actions: { kind: MonsterActionKind; weight: number }[];
}

export interface EncounterTable {
  id: string;
  /* 出現までの歩数を [min, max] の乱数で決める (最低歩数保証) */
  stepRange: [number, number];
  groups: { monsterIds: string[]; weight: number }[];
}

/* ---------- 呪文・特技 ---------- */

export interface SpellDef {
  id: string;
  name: string;
  kind: "attack" | "heal" | "buff" | "debuff";
  mpCost: number;
  /* attack: 与ダメージ基準値 / heal: 回復基準値 (buff/debuff は未使用で 0) */
  power: number;
  /* allEnemies=敵全体 / party=味方全体 (九九=全体攻撃 など単元と効果を対応させる) */
  target: "enemy" | "ally" | "allEnemies" | "party";
  /* 連撃回数 (ダンダンづき)。省略 = 1回。2以上は毎撃ランダムな敵に当たる */
  hits?: number;
  /* buff/debuff の中身。省略時: buff=みをまもる(guard), debuff=こうげきダウン(atkDown) */
  effect?: "guard" | "agiUp" | "atkDown";
  /* curriculum への唯一の接続点。戦闘発動時の出題プール */
  skillIds: string[];
  battleTimeLimitMs: number;
  learnTest: { skillIds: string[]; questions: number; passCount: number };
  description: string;
}

/* ---------- アイテム・店 ---------- */

export interface ItemDef {
  id: string;
  name: string;
  kind: "heal" | "key" | "equip";
  /* heal 系の回復量 */
  power?: number;
  /* kind === "equip" のとき必須: 装備部位と能力補正 */
  slot?: EquipSlot;
  atk?: number;
  def?: number;
  price: number;
  description: string;
}

export interface ShopDef {
  id: string;
  name: string;
  itemIds: string[];
}

/* ---------- 章 ---------- */

export interface ChapterDef {
  id: number;
  grade: number;
  title: string;
  implemented: boolean;
  startMap: string;
  startSpawn: string;
  maps: MapDef[];
  encounterTables: EncounterTable[];
  spellIds: string[];
  /* 通常攻撃の発動時に出題する基礎スキル (易しめ・短い制限時間) */
  attackSkillIds: string[];
  /* フラグレジストリ: flagId → 説明 (参照整合性テストとドキュメントを兼ねる) */
  flags: Record<string, string>;
  clearFlag: string;
}

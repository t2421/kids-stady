/*
 * KQ-07 バランス検証のシナリオ表 (tests/balance.test.ts と
 * scripts/balance-report.ts で共有)。数値は「章クリア想定パーティ」の仮定:
 *   - メンバー: その時点で加入している全員 (tasuku=章2, kakeru=章3, little=章4)
 *   - 想定Lv: 章1は設計 (Lv7)、以降は仲間の加入Lv (6/13/20) を章頭の目安にして
 *     章末 = 次章頭 − 1 になるよう補間。中ボスは章末 − 2
 *   - 呪文: 勇者は章1〜Nの spellIds 全部、仲間は initialSpells のみ (エンジン仕様)
 *   - 装備: その章の店で買える部位ごとの最強 (全員分そろえた想定)
 */

import type { MonsterDef } from "../src/content/types";
import { getMonster } from "../src/content/monsters";
import type { SimMemberSpec } from "../src/lib/battle/simulate";
import {
  bestShopEquipment,
  companionSpells,
  heroSpellsThrough,
} from "../src/lib/battle/simulate";

export interface BalanceScenario {
  chapter: number;
  /* レポート表示用 (ボス名) */
  label: string;
  /* 連戦は配列の順に戦う (HP/MP 持ち越し) */
  bossIds: string[];
  /* 章クリア想定Lv */
  level: number;
  members: SimMemberSpec[];
  /* 章頭の想定Lv (加入Lv / 前章クリア+1)。必須戦闘だけで想定Lvに届くかの概算に使う */
  startLevel: number;
  /*
   * 破綻が判明している検証項目。理由を書くと balance.test.ts で該当 assert だけ
   * skip され、レポートの「要調整」に載る (数値は直さない — 調整は別タスク)。
   *   tooHard: 想定Lv で勝率 < 70%  /  tooEasy: 想定Lv−3 で勝率 > 95%
   */
  flags?: { tooHard?: string; tooEasy?: string };
}

/* 想定Lv ± この幅で3点測る */
export const LEVEL_OFFSETS = [-3, 0, 3] as const;

/* 勝率の合格ライン */
export const MIN_WIN_RATE_AT_LEVEL = 0.7;
export const MAX_WIN_RATE_BELOW_LEVEL = 0.95;

const MEMBER_JOIN_CHAPTER: Record<string, number> = {
  hero: 1,
  tasuku: 2,
  kakeru: 3,
  little: 4,
};

/* 店がある最後の章。終章 (7) には町がないので 章6の装備で挑む想定 */
const LAST_SHOP_CHAPTER = 6;

/* 章 N 時点のメンバー構成 (呪文・装備込み) */
export function partyForChapter(chapter: number): SimMemberSpec[] {
  const equipment = bestShopEquipment(Math.min(chapter, LAST_SHOP_CHAPTER));
  return Object.entries(MEMBER_JOIN_CHAPTER)
    .filter(([, joinAt]) => joinAt <= chapter)
    .map(([memberId]) => ({
      memberId,
      spellIds: memberId === "hero" ? heroSpellsThrough(chapter) : companionSpells(memberId),
      equipment,
    }));
}

/* 終章 (7) は本編クリア (Lv40) 後の裏ダンジョン。らせん4層ぶんの雑魚で +5 の想定 (KQ-30b) */
const CLEAR_LEVEL: Record<number, number> = { 1: 7, 2: 12, 3: 19, 4: 26, 5: 33, 6: 40, 7: 45 };
/* 章頭Lv: 章1は初期値、章2〜4は仲間の加入Lv、章5〜7は前章クリア +1 */
const START_LEVEL: Record<number, number> = { 1: 1, 2: 6, 3: 13, 4: 20, 5: 27, 6: 34, 7: 41 };
const MID_BOSS_OFFSET = 2;

/* 2026-09-14 (KQ-07) の初回測定では章1〜6 のボスが想定Lv−3 でも勝率 100% だったため、
   KQ-08 で該当ボスの HP/atk を引き上げた (def は据え置き: 子どもにダメージ数字が見えるように)。
   現在 flags は空。再び破綻したら該当シナリオに理由を書いて skip する */

function scenario(
  chapter: number,
  bossIds: string[],
  kind: "mid" | "final",
  flags?: BalanceScenario["flags"],
): BalanceScenario {
  const level = CLEAR_LEVEL[chapter] - (kind === "mid" ? MID_BOSS_OFFSET : 0);
  const label = bossIds.map((id) => getMonster(id)?.name ?? id).join(" → ");
  return {
    chapter,
    label,
    bossIds,
    level,
    startLevel: START_LEVEL[chapter],
    members: partyForChapter(chapter),
    flags,
  };
}

export const BALANCE_SCENARIOS: BalanceScenario[] = [
  scenario(1, ["dekaInkugumo"], "mid"),
  scenario(1, ["eraser"], "final"),
  scenario(2, ["blotta"], "final"),
  scenario(3, ["wakemaeGolem"], "mid"),
  scenario(3, ["amarida"], "final"),
  scenario(4, ["kooriGolem"], "mid"),
  scenario(4, ["decimaron"], "final"),
  scenario(5, ["kumoNoBanjin"], "mid"),
  scenario(5, ["shinkaiNoNushi"], "mid"),
  scenario(5, ["minados"], "final"),
  scenario(6, ["maboroshiHero"], "mid"),
  scenario(6, ["zerom", "zeromTrue"], "final"),
  scenario(7, ["mugenia"], "final"),
];

export function scenarioMonsters(s: BalanceScenario): MonsterDef[][] {
  return s.bossIds.map((id) => {
    const monster = getMonster(id);
    if (!monster) throw new Error(`balance scenario: unknown monster ${id}`);
    return [monster];
  });
}

export function partyLabel(s: BalanceScenario): string {
  return s.members.map((m) => m.memberId).join("+");
}

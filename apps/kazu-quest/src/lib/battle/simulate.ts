/*
 * ボス戦バランス・シミュレータ (純ロジック、KQ-07)。
 * battle.ts の状態機械に単純AIのコマンドを流し込み、N回の自動戦闘で
 * 勝率と平均ラウンド数を出す。エンジン (battle.ts) は一切変えない。
 *
 * 単純AI:
 *   - 味方の誰かが HP 50% 未満 → そのラウンドで最初に回復呪文を使える
 *     メンバーが、いちばん HP の低い味方を回復 (1ラウンド1回まで)
 *   - それ以外 → 使える (MPが足りる) 攻撃呪文のうち期待ダメージ最大のもの
 *   - 攻撃呪文を持たない/MP切れ → 通常攻撃
 *   - 算数プロンプトは正答率 correctRate (既定 0.8) で当たり外れを抽選
 *
 * Vitest (tests/balance.test.ts) と scripts/balance-report.ts の両方から使う。
 */

import type { ItemDef, MonsterDef, SpellDef } from "../../content/types";
import { getSpell } from "../../content/spells";
import { ITEMS, SHOPS } from "../../content/items";
import { CHAPTERS } from "../../content/chapters";
import type { Equipment, EquipSlot, PartyMember } from "../save";
import { EQUIP_SLOTS } from "../save";
import type { Rng } from "../curriculum/types";
import { mulberry32 } from "../curriculum/types";
import type { BattleState, Combatant, PlayerCommand } from "./battle";
import { applyVictory, createBattle, submitRound } from "./battle";
import { expForLevel } from "./stats";
import { MEMBERS, memberStats } from "./members";

/* ---------- パーティ定義 ---------- */

export interface SimMemberSpec {
  memberId: string;
  spellIds: string[];
  equipment: Equipment;
}

export interface SimOptions {
  runs: number;
  seed: number;
  /* 算数プロンプトの正答率 */
  correctRate: number;
  /* かいしん率 (保守的に 0) */
  criticalRate: number;
  /* これを超えたら決着つかずとして負け扱い (無限ループ防止) */
  maxRounds: number;
}

export const DEFAULT_SIM_OPTIONS: SimOptions = {
  runs: 200,
  seed: 20260914,
  correctRate: 0.8,
  criticalRate: 0,
  maxRounds: 60,
};

export type SpellLookup = (id: string) => SpellDef | undefined;

/* 全回復した状態の PartyMember を組み立てる (ボス直前に宿で休んだ想定) */
export function buildParty(specs: SimMemberSpec[], level: number): PartyMember[] {
  return specs.map((spec) => {
    const stats = memberStats(spec.memberId, level);
    return {
      memberId: spec.memberId,
      level,
      exp: expForLevel(level),
      hp: stats.maxHp,
      mp: stats.maxMp,
      learnedSpells: [...spec.spellIds],
      equipment: { ...spec.equipment },
    };
  });
}

/* 勇者が章 N クリア時点で覚えうる呪文 = 章1〜N の spellIds 全部 (呪文テストは勇者だけが受ける) */
export function heroSpellsThrough(chapter: number): string[] {
  return CHAPTERS.filter((c) => c.id <= chapter).flatMap((c) => c.spellIds);
}

/* 仲間は加入時の initialSpells しか持たない (エンジン仕様: 呪文テストの習得は勇者のみ) */
export function companionSpells(memberId: string): string[] {
  return [...(MEMBERS[memberId]?.initialSpells ?? [])];
}

function equipScore(item: ItemDef): number {
  return (item.atk ?? 0) + (item.def ?? 0);
}

function chapterShopItems(chapter: number): ItemDef[] {
  return Object.values(SHOPS)
    .filter((shop) => shop.id.startsWith(`ch${chapter}-`))
    .flatMap((shop) => shop.itemIds)
    .map((id) => ITEMS[id])
    .filter((item): item is ItemDef => !!item && item.kind === "equip");
}

/* その章の店で買える装備のうち、部位ごとに atk+def 最大のもの */
export function bestShopEquipment(chapter: number): Equipment {
  const items = chapterShopItems(chapter);
  const pick = (slot: EquipSlot): string | undefined =>
    items
      .filter((item) => item.slot === slot)
      .reduce<ItemDef | undefined>(
        (best, item) => (!best || equipScore(item) > equipScore(best) ? item : best),
        undefined,
      )?.id;
  return EQUIP_SLOTS.reduce<Equipment>((acc, slot) => {
    const id = pick(slot);
    return id ? { ...acc, [slot]: id } : acc;
  }, {});
}

/* ---------- 単純AI ---------- */

function livingEnemies(state: BattleState): Combatant[] {
  return state.enemies.filter((e) => e.hp > 0);
}

function livingMembers(state: BattleState): Combatant[] {
  return state.members.filter((m) => m.hp > 0);
}

function knownSpells(
  party: PartyMember[],
  memberId: string,
  lookup: SpellLookup,
): SpellDef[] {
  const member = party.find((m) => m.memberId === memberId);
  return (member?.learnedSpells ?? [])
    .map((id) => lookup(id))
    .filter((s): s is SpellDef => !!s);
}

function affordable(actor: Combatant, spells: SpellDef[]): SpellDef[] {
  return spells.filter((s) => s.mpCost <= actor.mp);
}

/* 攻撃呪文の期待ダメージ (全体攻撃は1体あたり 80% × 敵数、連撃は hits 倍) */
export function expectedAttackDamage(spell: SpellDef, enemyCount: number): number {
  if (spell.kind !== "attack") return 0;
  if (spell.target === "allEnemies") return spell.power * 0.8 * enemyCount;
  return spell.power * Math.max(1, spell.hits ?? 1);
}

function expectedHeal(spell: SpellDef, woundedCount: number): number {
  if (spell.kind !== "heal") return 0;
  return spell.target === "party" ? spell.power * woundedCount : spell.power;
}

function bestBy<T>(items: T[], score: (item: T) => number): T | undefined {
  return items.reduce<T | undefined>(
    (best, item) => (score(item) > 0 && (!best || score(item) > score(best)) ? item : best),
    undefined,
  );
}

function woundedMembers(state: BattleState): Combatant[] {
  return livingMembers(state).filter((m) => m.hp < m.maxHp / 2);
}

function lowestHp(members: Combatant[]): Combatant {
  return members.reduce((low, m) => (m.hp / m.maxHp < low.hp / low.maxHp ? m : low));
}

function rollOutcome(rng: Rng, opts: SimOptions): { correct: boolean; critical: boolean } {
  const correct = rng() < opts.correctRate;
  const critical = correct && rng() < opts.criticalRate;
  return { correct, critical };
}

interface RoundPlan {
  commands: PlayerCommand[];
  healed: boolean;
}

function planMember(
  plan: RoundPlan,
  actor: Combatant,
  state: BattleState,
  spells: SpellDef[],
  rng: Rng,
  opts: SimOptions,
): RoundPlan {
  const usable = affordable(actor, spells);
  const wounded = woundedMembers(state);
  const enemies = livingEnemies(state);
  const outcome = rollOutcome(rng, opts);

  const heal = plan.healed
    ? undefined
    : bestBy(usable, (s) => expectedHeal(s, wounded.length));
  if (wounded.length > 0 && heal) {
    const target = lowestHp(wounded);
    const cmd: PlayerCommand = { kind: "spell", memberId: actor.id, spell: heal, targetId: target.id, outcome };
    return { commands: [...plan.commands, cmd], healed: true };
  }

  const targetId = enemies[0]?.id ?? "";
  const attack = bestBy(usable, (s) => expectedAttackDamage(s, enemies.length));
  const cmd: PlayerCommand = attack
    ? { kind: "spell", memberId: actor.id, spell: attack, targetId, outcome }
    : { kind: "attack", memberId: actor.id, targetId, outcome };
  return { ...plan, commands: [...plan.commands, cmd] };
}

/* 1ラウンド分のコマンドを組む (生存メンバー順に判断) */
export function planRound(
  state: BattleState,
  party: PartyMember[],
  opts: SimOptions,
  rng: Rng,
  lookup: SpellLookup = getSpell,
): PlayerCommand[] {
  const plan = livingMembers(state).reduce<RoundPlan>(
    (acc, actor) => planMember(acc, actor, state, knownSpells(party, actor.id, lookup), rng, opts),
    { commands: [], healed: false },
  );
  return plan.commands;
}

/* ---------- 1戦闘・連戦 ---------- */

export interface FightResult {
  won: boolean;
  rounds: number;
  /* 勝利後のパーティ (HP/MP 持ち越し、レベルアップ時は全回復) — 連戦用 */
  party: PartyMember[];
}

export function fightBoss(
  party: PartyMember[],
  monsters: MonsterDef[],
  opts: SimOptions,
  rng: Rng,
  lookup: SpellLookup = getSpell,
): FightResult {
  let state = createBattle(party, monsters, true);
  let rounds = 0;
  while (state.phase === "command" && rounds < opts.maxRounds) {
    state = submitRound(state, planRound(state, party, opts, rng, lookup), rng).state;
    rounds += 1;
  }
  if (state.phase !== "won") return { won: false, rounds, party };
  const exp = monsters.reduce((s, m) => s + m.exp, 0);
  const gold = monsters.reduce((s, m) => s + m.gold, 0);
  return { won: true, rounds, party: applyVictory(party, state, exp, gold).party };
}

/* 連戦 (ゼロム → ゼロム真の姿 など)。途中で負けたらそこで終了 */
export function fightSequence(
  party: PartyMember[],
  groups: MonsterDef[][],
  opts: SimOptions,
  rng: Rng,
  lookup: SpellLookup = getSpell,
): FightResult {
  return groups.reduce<FightResult>(
    (acc, monsters) => {
      if (!acc.won) return acc;
      const result = fightBoss(acc.party, monsters, opts, rng, lookup);
      return { ...result, rounds: acc.rounds + result.rounds };
    },
    { won: true, rounds: 0, party },
  );
}

/* ---------- 集計 ---------- */

export interface SimSummary {
  runs: number;
  wins: number;
  winRate: number;
  avgRounds: number;
}

export function simulate(
  party: PartyMember[],
  groups: MonsterDef[][],
  options: Partial<SimOptions> = {},
  lookup: SpellLookup = getSpell,
): SimSummary {
  const opts = { ...DEFAULT_SIM_OPTIONS, ...options };
  const rng = mulberry32(opts.seed);
  const results = Array.from({ length: opts.runs }, () =>
    fightSequence(party, groups, opts, rng, lookup),
  );
  const wins = results.filter((r) => r.won).length;
  const totalRounds = results.reduce((s, r) => s + r.rounds, 0);
  return {
    runs: opts.runs,
    wins,
    winRate: opts.runs === 0 ? 0 : wins / opts.runs,
    avgRounds: opts.runs === 0 ? 0 : totalRounds / opts.runs,
  };
}

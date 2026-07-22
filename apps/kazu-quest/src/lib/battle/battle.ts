/*
 * ターン制バトルの純状態機械。シーンから独立して Vitest でテストできる。
 * 1ラウンド分のコマンドを submitRound に渡すと、行動順に解決した
 * BattleEvent の列と新しい状態が返る。シーンはイベントを順に演出するだけ。
 *
 * 呪文の算数プロンプトは戦闘外 (React) で先に解決し、結果を
 * SpellCommand.outcome として渡す (M7)。
 */

import type { MonsterDef, SpellDef } from "../../content/types";
import type { PartyMember } from "../save";
import type { Rng } from "../curriculum/types";
import { heroStats, levelForExp } from "./stats";

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  agi: number;
  defending: boolean;
}

export interface EnemyCombatant extends Combatant {
  monsterId: string;
  exp: number;
  gold: number;
  actions: MonsterDef["actions"];
}

export interface BattleState {
  members: Combatant[];
  enemies: EnemyCombatant[];
  round: number;
  boss: boolean;
  phase: "command" | "won" | "lost" | "fled";
}

export type PlayerCommand =
  | {
      kind: "attack";
      memberId: string;
      targetId: string;
      /* 算数プロンプトの結果。不正解/タイムアウト = 攻撃を外す。省略 = 命中 */
      outcome?: { correct: boolean; critical: boolean };
    }
  | {
      kind: "spell";
      memberId: string;
      spell: SpellDef;
      targetId: string;
      /* 算数プロンプトの結果 (M7 で接続)。省略 = 成功・かいしんなし */
      outcome?: { correct: boolean; critical: boolean };
    }
  | { kind: "defend"; memberId: string }
  | { kind: "item"; memberId: string; itemId: string; heal: number }
  | { kind: "flee"; memberId: string };

export type BattleEvent =
  | { type: "message"; text: string }
  | { type: "attack"; actorName: string; targetId: string; damage: number; killed: boolean; onParty: boolean }
  | {
      type: "spellSuccess";
      actorName: string;
      spellName: string;
      critical: boolean;
      /* 演出時にMP表示を増分更新するための消費後MP */
      mpLeft: number;
    }
  | { type: "spellFizzle"; actorName: string; spellName: string }
  | { type: "heal"; targetId: string; amount: number; onParty: boolean }
  | { type: "fled" }
  | { type: "fleeFailed" }
  | { type: "victory"; exp: number; gold: number }
  | { type: "defeat" };

export interface RoundResult {
  state: BattleState;
  events: BattleEvent[];
}

export function makeMemberCombatant(member: PartyMember): Combatant {
  const stats = heroStats(member.level);
  return {
    id: member.memberId,
    name: member.memberId === "hero" ? "ゆうしゃ" : member.memberId,
    hp: Math.min(member.hp, stats.maxHp),
    maxHp: stats.maxHp,
    mp: Math.min(member.mp, stats.maxMp),
    maxMp: stats.maxMp,
    atk: stats.atk,
    def: stats.def,
    agi: stats.agi,
    defending: false,
  };
}

export function createBattle(
  party: PartyMember[],
  monsters: MonsterDef[],
  boss: boolean,
): BattleState {
  return {
    members: party.map(makeMemberCombatant),
    enemies: monsters.map((m, i) => ({
      id: `${m.id}-${i}`,
      monsterId: m.id,
      name: monsters.filter((x) => x.id === m.id).length > 1 ? `${m.name}${String.fromCharCode(65 + i)}` : m.name,
      hp: m.hp,
      maxHp: m.hp,
      mp: 0,
      maxMp: 0,
      atk: m.atk,
      def: m.def,
      agi: m.agi,
      defending: false,
      exp: m.exp,
      gold: m.gold,
      actions: m.actions,
    })),
    round: 1,
    boss,
    phase: "command",
  };
}

/* DQ風ダメージ: atk/2 - def/4 ± 25% 乱数、最低1 */
export function physicalDamage(atk: number, def: number, rng: Rng, defending: boolean): number {
  const base = atk / 2 - def / 4;
  const varied = base * (0.75 + rng() * 0.5);
  const withGuard = defending ? varied / 2 : varied;
  return Math.max(1, Math.round(withGuard));
}

/* 呪文ダメージ/回復: power ± 20%、かいしんで 1.5倍 */
export function spellAmount(power: number, critical: boolean, rng: Rng): number {
  const varied = power * (0.8 + rng() * 0.4);
  return Math.max(1, Math.round(varied * (critical ? 1.5 : 1)));
}

function livingEnemies(state: BattleState): EnemyCombatant[] {
  return state.enemies.filter((e) => e.hp > 0);
}

function livingMembers(state: BattleState): Combatant[] {
  return state.members.filter((m) => m.hp > 0);
}

function pickWeighted<T extends { weight: number }>(items: T[], rng: Rng): T {
  const sum = items.reduce((s, a) => s + a.weight, 0);
  let roll = rng() * sum;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

interface QueuedAction {
  agi: number;
  actor: { side: "party" | "enemy"; id: string };
  command?: PlayerCommand;
}

export function submitRound(
  state: BattleState,
  commands: PlayerCommand[],
  rng: Rng,
): RoundResult {
  /* イミュータブル: 全コンバタントをコピーして作業する */
  const next: BattleState = {
    ...state,
    members: state.members.map((m) => ({ ...m, defending: false })),
    enemies: state.enemies.map((e) => ({ ...e })),
    round: state.round + 1,
  };
  const events: BattleEvent[] = [];

  const findMember = (id: string) => next.members.find((m) => m.id === id);
  const findEnemy = (id: string) => next.enemies.find((e) => e.id === id);

  /* にげる は最速で判定 (雑魚戦は必ず成功 — 子供向け設計) */
  const flee = commands.find((c) => c.kind === "flee");
  if (flee) {
    if (!next.boss) {
      events.push({ type: "message", text: "うまく にげきれた!" });
      events.push({ type: "fled" });
      return { state: { ...next, phase: "fled" }, events };
    }
    events.push({ type: "fleeFailed" });
    events.push({ type: "message", text: "しかし まわりこまれてしまった!" });
  }

  /* 行動キュー: プレイヤーコマンド + 敵AI を agi 順 (±20% ゆらぎ) */
  const queue: QueuedAction[] = [];
  for (const cmd of commands) {
    if (cmd.kind === "flee") continue;
    const member = findMember(cmd.memberId);
    if (!member) continue;
    if (cmd.kind === "defend") {
      member.defending = true;
      events.push({ type: "message", text: `${member.name}は みをまもっている` });
      continue;
    }
    queue.push({
      agi: member.agi * (0.8 + rng() * 0.4),
      actor: { side: "party", id: member.id },
      command: cmd,
    });
  }
  for (const enemy of livingEnemies(next)) {
    queue.push({
      agi: enemy.agi * (0.8 + rng() * 0.4),
      actor: { side: "enemy", id: enemy.id },
    });
  }
  queue.sort((a, b) => b.agi - a.agi);

  for (const turn of queue) {
    if (next.phase !== "command") break;

    if (turn.actor.side === "party") {
      const actor = findMember(turn.actor.id);
      if (!actor || actor.hp <= 0) continue;
      const cmd = turn.command!;

      if (cmd.kind === "attack") {
        const outcome = cmd.outcome ?? { correct: true, critical: false };
        events.push({ type: "message", text: `${actor.name}の こうげき!` });
        if (!outcome.correct) {
          /* 不正解/タイムアウト → 攻撃を外す (設計変更 2026-07-22: 通常攻撃も出題) */
          events.push({ type: "message", text: "しかし はずれて しまった!" });
          continue;
        }
        let target = findEnemy(cmd.targetId);
        if (!target || target.hp <= 0) target = livingEnemies(next)[0];
        if (!target) continue;
        let damage = physicalDamage(actor.atk, target.def, rng, false);
        if (outcome.critical) {
          damage = Math.max(1, Math.round(damage * 1.5));
          events.push({ type: "message", text: "かいしんの いちげき!" });
        }
        target.hp = Math.max(0, target.hp - damage);
        const killed = target.hp === 0;
        events.push({ type: "attack", actorName: actor.name, targetId: target.id, damage, killed, onParty: false });
        if (killed) {
          events.push({ type: "message", text: `${target.name}を やっつけた!` });
        }
      } else if (cmd.kind === "spell") {
        const outcome = cmd.outcome ?? { correct: true, critical: false };
        if (!outcome.correct) {
          /* 不正解/タイムアウト → 不発。MPは消費しない (設計 A3) */
          events.push({ type: "spellFizzle", actorName: actor.name, spellName: cmd.spell.name });
          events.push({ type: "message", text: "じゅもんが みだれた!" });
          continue;
        }
        if (actor.mp < cmd.spell.mpCost) {
          events.push({ type: "message", text: "MPが たりない!" });
          continue;
        }
        actor.mp -= cmd.spell.mpCost;
        events.push({
          type: "spellSuccess",
          actorName: actor.name,
          spellName: cmd.spell.name,
          critical: outcome.critical,
          mpLeft: actor.mp,
        });
        const amount = spellAmount(cmd.spell.power, outcome.critical, rng);
        if (cmd.spell.kind === "attack") {
          let target = findEnemy(cmd.targetId);
          if (!target || target.hp <= 0) target = livingEnemies(next)[0];
          if (!target) continue;
          target.hp = Math.max(0, target.hp - amount);
          const killed = target.hp === 0;
          events.push({ type: "attack", actorName: actor.name, targetId: target.id, damage: amount, killed, onParty: false });
          if (killed) {
            events.push({ type: "message", text: `${target.name}を やっつけた!` });
          }
        } else if (cmd.spell.kind === "heal") {
          const target = findMember(cmd.targetId) ?? actor;
          const healed = Math.min(target.maxHp - target.hp, amount);
          target.hp += healed;
          events.push({ type: "heal", targetId: target.id, amount: healed, onParty: true });
        } else if (cmd.spell.kind === "buff") {
          const target = findMember(cmd.targetId) ?? actor;
          target.defending = true;
          events.push({
            type: "message",
            text: `${target.name}は まもりの ちからに つつまれた!`,
          });
        }
      } else if (cmd.kind === "item") {
        const healed = Math.min(actor.maxHp - actor.hp, cmd.heal);
        actor.hp += healed;
        events.push({ type: "message", text: `${actor.name}は やくそうを つかった!` });
        events.push({ type: "heal", targetId: actor.id, amount: healed, onParty: true });
      }
    } else {
      const enemy = findEnemy(turn.actor.id);
      if (!enemy || enemy.hp <= 0) continue;
      const targets = livingMembers(next);
      if (targets.length === 0) break;
      const action = pickWeighted(enemy.actions, rng);
      const target = targets[Math.floor(rng() * targets.length)];

      if (action.kind === "heal") {
        const wounded = livingEnemies(next).filter((e) => e.hp < e.maxHp);
        const ally = wounded[0] ?? enemy;
        const amount = Math.min(ally.maxHp - ally.hp, Math.round(ally.maxHp * 0.3));
        ally.hp += amount;
        events.push({ type: "message", text: `${enemy.name}は きずを なおした!` });
        events.push({ type: "heal", targetId: ally.id, amount, onParty: false });
      } else {
        const atk = action.kind === "strongAttack" ? enemy.atk * 1.5 : enemy.atk;
        const damage = physicalDamage(atk, target.def, rng, target.defending);
        target.hp = Math.max(0, target.hp - damage);
        events.push({
          type: "message",
          text: action.kind === "strongAttack" ? `${enemy.name}の つよい こうげき!` : `${enemy.name}の こうげき!`,
        });
        events.push({ type: "attack", actorName: enemy.name, targetId: target.id, damage, killed: target.hp === 0, onParty: true });
      }
    }

    /* 勝敗判定 */
    if (livingEnemies(next).length === 0) {
      const exp = next.enemies.reduce((s, e) => s + e.exp, 0);
      const gold = next.enemies.reduce((s, e) => s + e.gold, 0);
      events.push({ type: "message", text: "モンスターを やっつけた!" });
      events.push({ type: "victory", exp, gold });
      return { state: { ...next, phase: "won" }, events };
    }
    if (livingMembers(next).length === 0) {
      events.push({ type: "message", text: "めのまえが まっくらに なった…" });
      events.push({ type: "defeat" });
      return { state: { ...next, phase: "lost" }, events };
    }
  }

  return { state: next, events };
}

export interface VictoryOutcome {
  party: PartyMember[];
  gold: number;
  levelUps: { memberId: string; from: number; to: number }[];
}

/* 勝利結果をセーブのパーティへ適用。レベルアップで全回復 (子供向け) */
export function applyVictory(
  party: PartyMember[],
  battle: BattleState,
  exp: number,
  gold: number,
): VictoryOutcome {
  const levelUps: VictoryOutcome["levelUps"] = [];
  const updated = party.map((member) => {
    const combatant = battle.members.find((c) => c.id === member.memberId);
    const newExp = member.exp + exp;
    const newLevel = levelForExp(newExp);
    const stats = heroStats(newLevel);
    if (newLevel > member.level) {
      levelUps.push({ memberId: member.memberId, from: member.level, to: newLevel });
      return {
        ...member,
        exp: newExp,
        level: newLevel,
        hp: stats.maxHp,
        mp: stats.maxMp,
      };
    }
    return {
      ...member,
      exp: newExp,
      hp: Math.min(combatant?.hp ?? member.hp, stats.maxHp),
      mp: Math.min(combatant?.mp ?? member.mp, stats.maxMp),
    };
  });
  return { party: updated, gold, levelUps };
}

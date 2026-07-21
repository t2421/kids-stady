/*
 * EventCommand 列を逐次消化する純ロジックのインタプリタ。
 * シーンから独立しており、Vitest で完全にテストできる。
 *
 * 使い方 (FieldScene 側):
 *   let st = startRun(commands, save);
 *   loop: step(st) → effect を演出 (メッセージ表示・戦闘起動など)
 *         → 結果を input に入れて再度 step(st, input)
 *         → done になるまで繰り返す
 * setFlag / giveItem / giveGold などのデータ操作は step 内で即時 save に
 * 適用され、UI が必要なコマンドだけが effect として外に出る。
 */

import type { EventCommand, FlagCond } from "../../content/types";
import type { SaveData } from "../save";

export type RunnerEffect =
  | { kind: "message"; pages: string[] }
  | { kind: "battle"; monsterIds: string[]; boss: boolean; winFlag?: string }
  | { kind: "transfer"; mapId: string; spawn: string }
  | { kind: "openShop"; shopId: string }
  | { kind: "healInn"; price: number }
  | { kind: "openSpellTest"; spellId: string }
  | { kind: "savePoint" }
  | { kind: "choice"; prompt: string };

export interface RunnerInput {
  choice?: "yes" | "no";
}

interface Frame {
  commands: readonly EventCommand[];
  index: number;
}

export interface RunnerState {
  stack: Frame[];
  save: SaveData;
  /* 直前に返した effect (choice の分岐解決に使う) */
  pending: EventCommand | null;
}

export function evalCond(
  cond: FlagCond | undefined,
  flags: SaveData["flags"],
): boolean {
  if (!cond) return true;
  const value = flags[cond.flag];
  switch (cond.op) {
    case "set":
      return value === true || (typeof value === "number" && value !== 0);
    case "unset":
      return value === undefined || value === false || value === 0;
    case ">=":
      return typeof value === "number" && value >= (cond.value ?? 0);
  }
}

export function startRun(
  commands: readonly EventCommand[],
  save: SaveData,
): RunnerState {
  return { stack: [{ commands, index: 0 }], save, pending: null };
}

export interface StepResult {
  state: RunnerState;
  effect: RunnerEffect | null;
  done: boolean;
}

function applyData(save: SaveData, cmd: EventCommand): SaveData {
  switch (cmd.type) {
    case "setFlag":
      return {
        ...save,
        flags: { ...save.flags, [cmd.flag]: cmd.value ?? true },
      };
    case "giveItem": {
      const count = cmd.count ?? 1;
      const prev = save.inventory.items[cmd.itemId] ?? 0;
      return {
        ...save,
        inventory: {
          ...save.inventory,
          items: { ...save.inventory.items, [cmd.itemId]: prev + count },
        },
      };
    }
    case "giveGold":
      return {
        ...save,
        inventory: { ...save.inventory, gold: save.inventory.gold + cmd.amount },
      };
    default:
      return save;
  }
}

const DATA_COMMANDS = new Set(["setFlag", "giveItem", "giveGold"]);

export function step(state: RunnerState, input?: RunnerInput): StepResult {
  let { stack, save, pending } = state;
  stack = stack.map((f) => ({ ...f }));

  /* choice の解決: 選ばれた側の枝をスタックに積む */
  if (pending?.type === "choice" && input?.choice) {
    const branch = input.choice === "yes" ? pending.yes : pending.no;
    stack.push({ commands: branch, index: 0 });
    pending = null;
  }

  for (;;) {
    const frame = stack[stack.length - 1];
    if (!frame) {
      return { state: { stack, save, pending: null }, effect: null, done: true };
    }
    if (frame.index >= frame.commands.length) {
      stack.pop();
      continue;
    }
    const cmd = frame.commands[frame.index];
    frame.index += 1;

    if (DATA_COMMANDS.has(cmd.type)) {
      save = applyData(save, cmd);
      continue;
    }

    /* UI が必要なコマンド → effect として返す */
    switch (cmd.type) {
      case "message":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "message", pages: cmd.pages },
          done: false,
        };
      case "choice":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "choice", prompt: cmd.prompt },
          done: false,
        };
      case "battle":
        return {
          state: { stack, save, pending: cmd },
          effect: {
            kind: "battle",
            monsterIds: cmd.monsterIds,
            boss: cmd.boss ?? false,
            winFlag: cmd.winFlag,
          },
          done: false,
        };
      case "transfer":
        /* transfer 後の後続コマンドは意味を持たないため打ち切る */
        return {
          state: { stack: [], save, pending: null },
          effect: { kind: "transfer", mapId: cmd.mapId, spawn: cmd.spawn },
          done: false,
        };
      case "openShop":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "openShop", shopId: cmd.shopId },
          done: false,
        };
      case "healInn":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "healInn", price: cmd.price },
          done: false,
        };
      case "openSpellTest":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "openSpellTest", spellId: cmd.spellId },
          done: false,
        };
      case "savePoint":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "savePoint" },
          done: false,
        };
    }
  }
}

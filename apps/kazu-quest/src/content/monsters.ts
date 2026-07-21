/*
 * モンスター定義 (章横断)。数値の初期バランスは
 * docs/kazu-quest-design-plan.md A7 に準拠。
 */

import type { MonsterDef } from "./types";

export const MONSTERS: Record<string, MonsterDef> = {
  keshigomun: {
    id: "keshigomun",
    name: "ケシゴムン",
    art: "keshigomun",
    hp: 8,
    atk: 5,
    def: 1,
    agi: 2,
    exp: 2,
    gold: 1,
    actions: [{ kind: "attack", weight: 1 }],
  },
  inkugumo: {
    id: "inkugumo",
    name: "インクぐも",
    art: "inkugumo",
    hp: 12,
    atk: 6,
    def: 2,
    agi: 3,
    exp: 3,
    gold: 2,
    actions: [
      { kind: "attack", weight: 3 },
      { kind: "strongAttack", weight: 1 },
    ],
  },
  kazunezumi: {
    id: "kazunezumi",
    name: "かずぬすみネズミ",
    art: "kazunezumi",
    hp: 10,
    atk: 6,
    def: 1,
    agi: 6,
    exp: 3,
    gold: 3,
    actions: [{ kind: "attack", weight: 1 }],
  },
};

export function getMonster(id: string): MonsterDef | undefined {
  return MONSTERS[id];
}

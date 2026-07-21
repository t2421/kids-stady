/*
 * コンテンツバリデーション — 章データ量産の安全網。
 * マップ・NPC・イベント・参照 (mapId/spawn/art/itemId) の整合性を全数検査する。
 * 新しい章を追加したら src/content/maps.ts に登録するだけでここの検査対象になる。
 */

import { describe, expect, it } from "vitest";
import type { EventCommand, MapDef } from "../src/content/types";
import { listMaps, hasMap, getMapDef } from "../src/content/maps";
import { TILE_ART } from "../src/content/art/tiles";
import { ACTOR_ART } from "../src/content/art/actors";
import { MONSTER_ART } from "../src/content/art/monsters";
import { ITEMS } from "../src/content/items";
import { MONSTERS } from "../src/content/monsters";
import { ENCOUNTER_TABLES } from "../src/content/encounters";
import { SPELLS } from "../src/content/spells";
import { SKILLS } from "../src/lib/curriculum";

const maps = listMaps();

describe("spells", () => {
  const skillIds = new Set(SKILLS.map((s) => s.id));
  it("every spell references registered skills and has a sane learn test", () => {
    for (const spell of Object.values(SPELLS)) {
      expect(spell.skillIds.length).toBeGreaterThan(0);
      for (const id of [...spell.skillIds, ...spell.learnTest.skillIds]) {
        expect(skillIds.has(id), `呪文 "${spell.id}" の skill "${id}"`).toBe(true);
      }
      expect(spell.learnTest.passCount).toBeLessThanOrEqual(spell.learnTest.questions);
      expect(spell.mpCost).toBeGreaterThan(0);
      expect(spell.battleTimeLimitMs).toBeGreaterThan(0);
    }
  });
});

describe("monsters & encounter tables", () => {
  it("every monster has valid art and positive stats", () => {
    for (const monster of Object.values(MONSTERS)) {
      expect(MONSTER_ART[monster.art], `モンスター "${monster.id}" の art`).toBeDefined();
      expect(monster.hp).toBeGreaterThan(0);
      expect(monster.atk).toBeGreaterThan(0);
      expect(monster.exp).toBeGreaterThanOrEqual(0);
      expect(monster.actions.length).toBeGreaterThan(0);
    }
  });

  it("encounter tables reference existing monsters with sane step ranges", () => {
    for (const table of Object.values(ENCOUNTER_TABLES)) {
      expect(table.stepRange[0]).toBeGreaterThan(0);
      expect(table.stepRange[1]).toBeGreaterThanOrEqual(table.stepRange[0]);
      expect(table.groups.length).toBeGreaterThan(0);
      for (const group of table.groups) {
        expect(group.monsterIds.length).toBeGreaterThan(0);
        for (const id of group.monsterIds) {
          expect(MONSTERS[id], `テーブル "${table.id}" のモンスター "${id}"`).toBeDefined();
        }
      }
    }
  });
});

function collectCommands(map: MapDef): EventCommand[] {
  const out: EventCommand[] = [];
  const walk = (commands: readonly EventCommand[]) => {
    for (const cmd of commands) {
      out.push(cmd);
      if (cmd.type === "choice") {
        walk(cmd.yes);
        walk(cmd.no);
      }
    }
  };
  for (const ev of map.events) walk(ev.commands);
  for (const npc of map.npcs) {
    for (const entry of npc.dialog) walk(entry.then ?? []);
  }
  return out;
}

function inBounds(map: MapDef, x: number, y: number): boolean {
  return y >= 0 && y < map.grid.length && x >= 0 && x < map.grid[0].length;
}

function isWalkableTile(map: MapDef, x: number, y: number): boolean {
  const spec = map.legend[map.grid[y][x]];
  return !!spec?.walkable;
}

describe.each(maps.map((m) => [m.id, m] as const))("map %s", (_id, map) => {
  it("grid rows are uniform and non-empty", () => {
    expect(map.grid.length).toBeGreaterThan(0);
    const width = map.grid[0].length;
    expect(width).toBeGreaterThan(0);
    for (const row of map.grid) {
      expect(row.length, "行の長さが不揃い").toBe(width);
    }
  });

  it("every grid character is in the legend", () => {
    for (const row of map.grid) {
      for (const ch of row) {
        expect(map.legend[ch], `legend にない文字 "${ch}"`).toBeDefined();
      }
    }
  });

  it("legend art references exist", () => {
    for (const [ch, spec] of Object.entries(map.legend)) {
      expect(TILE_ART[spec.art], `文字 "${ch}" の art "${spec.art}"`).toBeDefined();
    }
  });

  it("spawns are in bounds and walkable", () => {
    expect(Object.keys(map.spawns).length).toBeGreaterThan(0);
    for (const [name, s] of Object.entries(map.spawns)) {
      expect(inBounds(map, s.x, s.y), `spawn "${name}" が盤外`).toBe(true);
      expect(isWalkableTile(map, s.x, s.y), `spawn "${name}" が通行不能タイル`).toBe(
        true,
      );
    }
  });

  it("npcs are in bounds, on walkable tiles, with valid art and dialog", () => {
    for (const npc of map.npcs) {
      expect(inBounds(map, npc.x, npc.y), `NPC "${npc.id}" が盤外`).toBe(true);
      expect(
        isWalkableTile(map, npc.x, npc.y),
        `NPC "${npc.id}" が通行不能タイル`,
      ).toBe(true);
      expect(ACTOR_ART[npc.art], `NPC "${npc.id}" の art`).toBeDefined();
      expect(npc.dialog.length, `NPC "${npc.id}" に dialog がない`).toBeGreaterThan(0);
      /* if なしの entry が最後にないと、条件を満たさないとき無言になる */
      const last = npc.dialog[npc.dialog.length - 1];
      expect(last.if, `NPC "${npc.id}" の最後の dialog に if がある (無言の危険)`).toBeUndefined();
    }
  });

  it("events are in bounds with valid art, and step events sit on walkable tiles", () => {
    const ids = new Set<string>();
    for (const ev of map.events) {
      expect(ids.has(ev.id), `イベント id 重複 "${ev.id}"`).toBe(false);
      ids.add(ev.id);
      expect(inBounds(map, ev.x, ev.y), `イベント "${ev.id}" が盤外`).toBe(true);
      if (ev.art) {
        expect(TILE_ART[ev.art], `イベント "${ev.id}" の art`).toBeDefined();
        expect(
          ev.onceFlag,
          `art つきイベント "${ev.id}" には onceFlag が必要 (開けた宝箱が戻る)`,
        ).toBeDefined();
      }
      if (ev.trigger === "step") {
        expect(
          isWalkableTile(map, ev.x, ev.y),
          `step イベント "${ev.id}" が通行不能タイル (踏めない)`,
        ).toBe(true);
      }
    }
  });

  it("encounter table reference exists", () => {
    if (map.encounterTableId !== null) {
      expect(
        ENCOUNTER_TABLES[map.encounterTableId],
        `エンカウントテーブル "${map.encounterTableId}"`,
      ).toBeDefined();
    }
  });

  it("transfer targets and item references exist", () => {
    for (const cmd of collectCommands(map)) {
      if (cmd.type === "battle") {
        for (const id of cmd.monsterIds) {
          expect(MONSTERS[id], `モンスター "${id}"`).toBeDefined();
        }
      }
      if (cmd.type === "learnSpell") {
        expect(SPELLS[cmd.spellId], `呪文 "${cmd.spellId}"`).toBeDefined();
      }
      if (cmd.type === "transfer") {
        expect(hasMap(cmd.mapId), `transfer 先マップ "${cmd.mapId}"`).toBe(true);
        const target = getMapDef(cmd.mapId);
        expect(
          target.spawns[cmd.spawn],
          `transfer 先 spawn "${cmd.mapId}/${cmd.spawn}"`,
        ).toBeDefined();
      }
      if (cmd.type === "giveItem") {
        expect(ITEMS[cmd.itemId], `アイテム "${cmd.itemId}"`).toBeDefined();
      }
      if (cmd.type === "healInn") {
        expect(cmd.price).toBeGreaterThanOrEqual(0);
      }
      if (cmd.type === "giveGold") {
        expect(Number.isInteger(cmd.amount)).toBe(true);
      }
    }
  });
});

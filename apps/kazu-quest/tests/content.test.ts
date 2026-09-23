/*
 * コンテンツバリデーション — 章データ量産の安全網。
 * マップ・NPC・イベント・参照 (mapId/spawn/art/itemId) の整合性を全数検査する。
 * 新しい章を追加したら src/content/maps.ts に登録するだけでここの検査対象になる。
 */

import { describe, expect, it } from "vitest";
import type { EventCommand, FlagCond, HideCond, MapDef } from "../src/content/types";
import { listMaps, hasMap, getMapDef } from "../src/content/maps";
import { TILE_ART } from "../src/content/art/tiles";
import { ACTOR_ART } from "../src/content/art/actors";
import { MONSTER_ART } from "../src/content/art/monsters";
import { ITEMS, SHOPS } from "../src/content/items";
import { MONSTERS } from "../src/content/monsters";
import { ENCOUNTER_TABLES } from "../src/content/encounters";
import { SPELLS } from "../src/content/spells";
import { SKILLS } from "../src/lib/curriculum";
import { MEMBERS } from "../src/lib/battle/members";
import { CHAPTERS } from "../src/content/chapters";
import { REVIEW_MEDAL_ITEM_ID } from "../src/lib/curriculum/review";
import { ENDING_CHECKPOINT } from "../src/lib/ending";

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

describe("items & shops", () => {
  it("equip items declare a slot and at least one bonus", () => {
    for (const item of Object.values(ITEMS)) {
      if (item.kind !== "equip") continue;
      expect(item.slot, `装備 "${item.id}" の slot`).toBeDefined();
      expect(
        (item.atk ?? 0) + (item.def ?? 0),
        `装備 "${item.id}" に補正がない`,
      ).toBeGreaterThan(0);
      expect(item.price).toBeGreaterThan(0);
    }
  });

  it("shops reference existing items", () => {
    for (const shop of Object.values(SHOPS)) {
      expect(shop.itemIds.length).toBeGreaterThan(0);
      for (const id of shop.itemIds) {
        expect(ITEMS[id], `店 "${shop.id}" の item "${id}"`).toBeDefined();
      }
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

/* 入れ子 (choice / quiz) も含めてコマンドを平坦化する */
function flattenCommands(commands: readonly EventCommand[]): EventCommand[] {
  const out: EventCommand[] = [];
  const walk = (cmds: readonly EventCommand[]) => {
    for (const cmd of cmds) {
      out.push(cmd);
      if (cmd.type === "choice") {
        walk(cmd.yes);
        walk(cmd.no);
      }
      if (cmd.type === "quiz") {
        walk(cmd.onCorrect);
        walk(cmd.onWrong);
      }
      if (cmd.type === "exchange") {
        walk(cmd.onDone ?? []);
        walk(cmd.onShort ?? []);
      }
    }
  };
  walk(commands);
  return out;
}

function collectCommands(map: MapDef): EventCommand[] {
  const out: EventCommand[] = [];
  for (const ev of map.events) out.push(...flattenCommands(ev.commands));
  for (const npc of map.npcs) {
    for (const entry of npc.dialog) out.push(...flattenCommands(entry.then ?? []));
  }
  return out;
}

/*
 * openTeacherMenu (LP-18) の entries が持つ spellIds を1列に展開する。
 * 旧 openSpellTest 1コマンド=1呪文だったのに対し、こちらは1コマンドに
 * 複数単元・複数呪文がぶら下がる (章2 の g2_add_column のように1単元に
 * 複数呪文が対応することもある) ので、まとめて数える
 */
function teacherMenuSpellIds(cmd: EventCommand): string[] {
  if (cmd.type !== "openTeacherMenu") return [];
  return cmd.entries.flatMap((entry) => entry.spellIds ?? []);
}

function inBounds(map: MapDef, x: number, y: number): boolean {
  return y >= 0 && y < map.grid.length && x >= 0 && x < map.grid[0].length;
}

function isWalkableTile(map: MapDef, x: number, y: number): boolean {
  const spec = map.legend[map.grid[y][x]];
  return !!spec?.walkable;
}

/*
 * hideIf は単一条件 / 配列 (AND, LP-20) / { any: [...] } (OR) の入れ子 —
 * 参照チェック用に、構造を無視して葉の FlagCond だけ平坦に集める
 */
function flattenHideCond(cond: HideCond): FlagCond[] {
  if (Array.isArray(cond)) return cond.flatMap(flattenHideCond);
  if ("any" in cond) return cond.any.flatMap(flattenHideCond);
  return [cond];
}

function hideIfConds(npc: { hideIf?: HideCond }): FlagCond[] {
  return npc.hideIf ? flattenHideCond(npc.hideIf) : [];
}

/*
 * フラグ到達可能性: 条件 (dialog if / npc hideIf) が参照するフラグは、
 * どこかの setFlag / onceFlag / battle winFlag / 習得テスト合格
 * (learned.<spellId> — effectHandlers の規約) で必ず set できること。
 * 単一タイル橋の番人 (hideIf) のタイポは新規セーブ全員を詰ませるため、
 * この検査で1文字タイポを検出する。
 */
describe("flag reachability", () => {
  it("every referenced condition flag is settable somewhere", () => {
    const settable = new Set<string>();
    const referenced = new Map<string, string>();
    for (const map of maps) {
      for (const cmd of collectCommands(map)) {
        if (cmd.type === "setFlag") settable.add(cmd.flag);
        if (cmd.type === "battle" && cmd.winFlag) settable.add(cmd.winFlag);
        if (cmd.type === "openSpellTest") settable.add(`learned.${cmd.spellId}`);
        for (const spellId of teacherMenuSpellIds(cmd)) settable.add(`learned.${spellId}`);
      }
      for (const ev of map.events) {
        if (ev.onceFlag) settable.add(ev.onceFlag);
      }
      for (const npc of map.npcs) {
        for (const cond of hideIfConds(npc)) {
          if ("flag" in cond) {
            referenced.set(cond.flag, `${map.id}/npc:${npc.id}`);
          }
        }
        for (const entry of npc.dialog) {
          if (entry.if && "flag" in entry.if) {
            referenced.set(entry.if.flag, `${map.id}/npc:${npc.id}`);
          }
        }
      }
    }
    for (const [flag, where] of referenced) {
      expect(
        settable.has(flag),
        `フラグ "${flag}" (${where}) は参照されるが どこでも set されない`,
      ).toBe(true);
    }
  });

  /* skill 条件版 FlagCond (LP-01/LP-04): skillId は実在し、state は4値のいずれか */
  it("every skill condition references a real skillId with a valid state", () => {
    const skillIds = new Set(SKILLS.map((s) => s.id));
    const validStates = new Set(["none", "practicing", "can", "mastered"]);
    const skillConds: { cond: Extract<FlagCond, { skill: string }>; where: string }[] = [];
    for (const map of maps) {
      for (const npc of map.npcs) {
        for (const cond of hideIfConds(npc)) {
          if ("skill" in cond) {
            skillConds.push({ cond, where: `${map.id}/npc:${npc.id} hideIf` });
          }
        }
        for (const entry of npc.dialog) {
          if (entry.if && "skill" in entry.if) {
            skillConds.push({ cond: entry.if, where: `${map.id}/npc:${npc.id} dialog.if` });
          }
        }
      }
    }
    for (const { cond, where } of skillConds) {
      expect(skillIds.has(cond.skill), `${where} の skill "${cond.skill}"`).toBe(true);
      expect(validStates.has(cond.state), `${where} の state "${cond.state}"`).toBe(true);
    }
  });
});

/*
 * 章のつながり: 第1章のスタート地点から transfer をたどって
 * すべての章のマップに行けること。章をまたぐ導線 (船・ゼロのあな) が
 * 切れていると、そこから先の章が まるごと到達不能になるため
 * 「マップは登録済みだが 誰も行けない」事故をここで検出する。
 */
describe("chapter progression", () => {
  it("every chapter map is reachable from chapter 1 by following transfers", () => {
    const byId = new Map(maps.map((m) => [m.id, m]));
    const seen = new Set<string>([CHAPTERS[0].startMap]);
    const queue = [CHAPTERS[0].startMap];
    while (queue.length > 0) {
      const map = byId.get(queue.shift()!);
      if (!map) continue;
      for (const cmd of collectCommands(map)) {
        if (cmd.type !== "transfer" || seen.has(cmd.mapId)) continue;
        seen.add(cmd.mapId);
        queue.push(cmd.mapId);
      }
    }
    for (const chapter of CHAPTERS) {
      for (const map of chapter.maps) {
        expect(
          seen.has(map.id),
          `第${chapter.id}章の "${map.id}" へ行く transfer がどこにもない`,
        ).toBe(true);
      }
    }
  });

  it("every chapter clear flag is settable somewhere", () => {
    const settable = new Set<string>();
    for (const map of maps) {
      for (const cmd of collectCommands(map)) {
        if (cmd.type === "setFlag") settable.add(cmd.flag);
        if (cmd.type === "battle" && cmd.winFlag) settable.add(cmd.winFlag);
      }
      for (const ev of map.events) {
        if (ev.onceFlag) settable.add(ev.onceFlag);
      }
    }
    for (const chapter of CHAPTERS) {
      expect(
        settable.has(chapter.clearFlag),
        `第${chapter.id}章の clearFlag "${chapter.clearFlag}" を立てる場所がない`,
      ).toBe(true);
    }
  });

  it("every chapter has a ふくしゅうのほこら (openReviewQuest)", () => {
    for (const chapter of CHAPTERS) {
      const has = chapter.maps.some((map) =>
        collectCommands(map).some((cmd) => cmd.type === "openReviewQuest"),
      );
      expect(has, `第${chapter.id}章に openReviewQuest を持つ ほこらがない`).toBe(true);
    }
  });

  it("choice nesting never exceeds the depth limit (4)", () => {
    const MAX_DEPTH = 4;
    const depth = (cmds: readonly EventCommand[]): number =>
      Math.max(
        0,
        ...cmds.map((cmd) =>
          cmd.type === "choice"
            ? 1 + Math.max(depth(cmd.yes), depth(cmd.no))
            : cmd.type === "quiz"
              ? Math.max(depth(cmd.onCorrect), depth(cmd.onWrong))
              : cmd.type === "exchange"
                ? Math.max(depth(cmd.onDone ?? []), depth(cmd.onShort ?? []))
                : 0,
        ),
      );
    for (const map of maps) {
      for (const npc of map.npcs) {
        for (const entry of npc.dialog) {
          expect(
            depth(entry.then ?? []),
            `"${map.id}" の NPC "${npc.id}" の choice が深すぎる`,
          ).toBeLessThanOrEqual(MAX_DEPTH);
        }
      }
      for (const ev of map.events) {
        expect(depth(ev.commands), `"${map.id}" の event "${ev.id}"`).toBeLessThanOrEqual(
          MAX_DEPTH,
        );
      }
    }
  });

  it("questionGrades, when set, are integer grades 1..6 with implemented skills", () => {
    const implementedGrades = new Set(
      SKILLS.filter((s) => s.implemented).map((s) => s.grade),
    );
    for (const chapter of CHAPTERS) {
      if (chapter.questionGrades === undefined) continue;
      expect(
        chapter.questionGrades.length,
        `第${chapter.id}章の questionGrades が空`,
      ).toBeGreaterThan(0);
      for (const grade of chapter.questionGrades) {
        expect(Number.isInteger(grade), `第${chapter.id}章の questionGrades "${grade}"`).toBe(true);
        expect(grade, `第${chapter.id}章の questionGrades "${grade}"`).toBeGreaterThanOrEqual(1);
        expect(grade, `第${chapter.id}章の questionGrades "${grade}"`).toBeLessThanOrEqual(6);
        expect(
          implementedGrades.has(grade),
          `第${chapter.id}章の questionGrades ${grade} に実装済みスキルがない`,
        ).toBe(true);
      }
    }
  });

  it("every chapter spell is learnable at some まなびや", () => {
    const testable = new Set<string>();
    for (const map of maps) {
      for (const cmd of collectCommands(map)) {
        if (cmd.type === "openSpellTest") testable.add(cmd.spellId);
        if (cmd.type === "learnSpell") testable.add(cmd.spellId);
        for (const spellId of teacherMenuSpellIds(cmd)) testable.add(spellId);
      }
    }
    /* 加入時に最初から覚えている呪文はテスト不要 */
    for (const member of Object.values(MEMBERS)) {
      for (const id of member.initialSpells) testable.add(id);
    }
    for (const chapter of CHAPTERS) {
      for (const spellId of chapter.spellIds) {
        expect(
          testable.has(spellId),
          `第${chapter.id}章の呪文 "${spellId}" を覚える手段がない`,
        ).toBe(true);
      }
    }
  });
});

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
      for (const v of spec.variants ?? []) {
        expect(TILE_ART[v], `文字 "${ch}" の variant "${v}"`).toBeDefined();
      }
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
        /*
         * 報酬 (giveItem/giveGold/learnSpell) を配る art つきイベントは
         * onceFlag 必須 (開けた宝箱が戻ると無限取得になる)。
         * けいじばんのような常設の置き物は onceFlag なしでよい。
         */
        const givesLoot = flattenCommands(ev.commands).some(
          (c) =>
            c.type === "giveItem" ||
            c.type === "giveGold" ||
            c.type === "learnSpell",
        );
        if (givesLoot) {
          expect(
            ev.onceFlag,
            `報酬つき art イベント "${ev.id}" には onceFlag が必要 (開けた宝箱が戻る)`,
          ).toBeDefined();
        }
      }
      if (ev.trigger === "step") {
        expect(
          isWalkableTile(map, ev.x, ev.y),
          `step イベント "${ev.id}" が通行不能タイル (踏めない)`,
        ).toBe(true);
      }
    }
  });

  /*
   * KQ-23: boss:true の battle を持つマップには「すいしょうレベル看板」(levelSign) が
   * ちょうど1つ。inspect で、通行可能タイルに置く (踏めない壁の中だと調べられない)。
   * ボスのいないマップに看板があるのは配置ミス。
   */
  it("boss maps have exactly one levelSign (inspect, walkable, Lv 1..60)", () => {
    const hasBoss = collectCommands(map).some((c) => c.type === "battle" && c.boss === true);
    const signs = map.events.filter((ev) =>
      ev.commands.some((c) => c.type === "levelSign"),
    );
    expect(signs.length, `"${map.id}" の levelSign は ボスマップに1つだけ`).toBe(hasBoss ? 1 : 0);
    for (const ev of signs) {
      expect(ev.trigger, `levelSign "${ev.id}" は inspect`).toBe("inspect");
      expect(ev.art, `levelSign "${ev.id}" は 見える art が必要`).toBeDefined();
      expect(
        isWalkableTile(map, ev.x, ev.y),
        `levelSign "${ev.id}" が通行不能タイル (調べられない)`,
      ).toBe(true);
      const onOther =
        map.npcs.some((n) => n.x === ev.x && n.y === ev.y) ||
        map.events.some((o) => o.id !== ev.id && o.x === ev.x && o.y === ev.y) ||
        Object.values(map.spawns).some((s) => s.x === ev.x && s.y === ev.y);
      expect(onOther, `levelSign "${ev.id}" が NPC/イベント/spawn と重なる`).toBe(false);
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
      if (cmd.type === "learnSpell" || cmd.type === "openSpellTest") {
        expect(SPELLS[cmd.spellId], `呪文 "${cmd.spellId}"`).toBeDefined();
      }
      /* クイズ扉のスキルはタイポすると全プレイヤーの扉が壊れる */
      if (cmd.type === "quiz") {
        expect(
          SKILLS.some((s) => s.id === cmd.skillId && s.implemented),
          `quiz の skill "${cmd.skillId}" が未実装/未登録`,
        ).toBe(true);
      }
      /* まなびやの先生 (openLesson) のスキルも同様にタイポ検出する */
      if (cmd.type === "openLesson") {
        expect(
          SKILLS.some((s) => s.id === cmd.skillId && s.implemented),
          `openLesson の skill "${cmd.skillId}" が未実装/未登録`,
        ).toBe(true);
      }
      /* まなびやの先生メニュー (openTeacherMenu, LP-18) の skillId/spellIds も同様 */
      if (cmd.type === "openTeacherMenu") {
        for (const entry of cmd.entries) {
          expect(
            SKILLS.some((s) => s.id === entry.skillId && s.implemented),
            `openTeacherMenu の skill "${entry.skillId}" が未実装/未登録`,
          ).toBe(true);
          for (const spellId of entry.spellIds ?? []) {
            expect(SPELLS[spellId], `openTeacherMenu の呪文 "${spellId}"`).toBeDefined();
          }
        }
      }
      /* memberId タイポは勇者ステータスに静かにフォールバックしてしまう */
      if (cmd.type === "joinParty" || cmd.type === "learnSpell") {
        expect(MEMBERS[cmd.memberId], `メンバー "${cmd.memberId}"`).toBeDefined();
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
      /* 交換所 (KQ-31): 消費側・受取側の両方が実在し、個数は 1 以上の整数 */
      if (cmd.type === "exchange") {
        expect(ITEMS[cmd.itemId], `exchange の消費アイテム "${cmd.itemId}"`).toBeDefined();
        expect(ITEMS[cmd.give.itemId], `exchange の受取アイテム "${cmd.give.itemId}"`).toBeDefined();
        expect(Number.isInteger(cmd.count) && cmd.count >= 1, `exchange の count "${cmd.count}"`).toBe(true);
        expect(
          Number.isInteger(cmd.give.count ?? 1) && (cmd.give.count ?? 1) >= 1,
          `exchange の give.count "${cmd.give.count}"`,
        ).toBe(true);
      }
      /* ふくしゅうのほこら の ほうび (ひらめきメダル) は items に登録されていること */
      if (cmd.type === "openReviewQuest") {
        expect(ITEMS[REVIEW_MEDAL_ITEM_ID], `アイテム "${REVIEW_MEDAL_ITEM_ID}"`).toBeDefined();
        expect(ITEMS[REVIEW_MEDAL_ITEM_ID].kind).toBe("key");
      }
      if (cmd.type === "healInn") {
        expect(cmd.price).toBeGreaterThanOrEqual(0);
      }
      if (cmd.type === "levelSign") {
        expect(Number.isInteger(cmd.level), `levelSign の level は整数`).toBe(true);
        expect(cmd.level).toBeGreaterThanOrEqual(1);
        expect(cmd.level).toBeLessThanOrEqual(60);
      }
      if (cmd.type === "giveGold") {
        expect(Number.isInteger(cmd.amount)).toBe(true);
      }
    }
  });
});

/*
 * エンディング (KQ-22): { type: "ending" } は本編で ちょうど1回、本編の最終章 (第6章) の
 * ボスイベントの中にあり、同じコマンド列で その章の clearFlag を立てた あとに来ること。
 * (ending はランを打ち切るので、後ろに置いた setFlag は UI 越しには見えなくなる)
 * 終章 (第7章「ムゲンのらせん」KQ-30b) はクリア後の裏ダンジョンなので ending を持たない。
 */
describe("ending command", () => {
  const MAIN_STORY_FINAL_CHAPTER = 6;
  const finalChapter = CHAPTERS.find((c) => c.id === MAIN_STORY_FINAL_CHAPTER)!;

  function commandLists(map: MapDef): EventCommand[][] {
    return [
      ...map.events.map((ev) => flattenCommands(ev.commands)),
      ...map.npcs.flatMap((npc) => npc.dialog.map((d) => flattenCommands(d.then ?? []))),
    ];
  }

  it("appears exactly once, in the main story's final chapter, after its clearFlag is set", () => {
    expect(finalChapter).toBeDefined();
    const hits: { chapterId: number; list: EventCommand[] }[] = [];
    for (const chapter of CHAPTERS) {
      for (const map of chapter.maps) {
        for (const list of commandLists(map)) {
          if (list.some((c) => c.type === "ending")) hits.push({ chapterId: chapter.id, list });
        }
      }
    }
    expect(hits, "ending は本編に ちょうど1つ").toHaveLength(1);
    const { chapterId, list } = hits[0];
    expect(chapterId).toBe(finalChapter.id);
    const endingAt = list.findIndex((c) => c.type === "ending");
    const clearAt = list.findIndex(
      (c) => c.type === "setFlag" && c.flag === finalChapter.clearFlag,
    );
    expect(clearAt, `clearFlag "${finalChapter.clearFlag}" を ending の前で立てる`).toBeGreaterThanOrEqual(0);
    expect(clearAt).toBeLessThan(endingAt);
  });

  it("the ending checkpoint map and spawn exist", () => {
    expect(hasMap(ENDING_CHECKPOINT.mapId)).toBe(true);
    expect(getMapDef(ENDING_CHECKPOINT.mapId).spawns[ENDING_CHECKPOINT.spawn]).toBeDefined();
  });
});

/*
 * 番人に閉じこめられないこと。
 *
 * 番人NPC (hideIf) は「表示中はそのタイルを通れない」ので、ダンジョンの
 * 入口が 行き止まりの奥にあると、番人が出ている状態でそのダンジョンから
 * 出てきた勇者は 番人とダンジョンの間に閉じこめられる (ch3 ピラミッドで実際に発生)。
 *
 * 不変条件: 番人を全員「表示中」とみなして spawn から歩いたとき、
 * 他の spawn に 1つも行けない袋小路になるなら、その袋小路の中に
 * 「番人を消せるフラグ」を立てるイベントが必ずあること
 * (= ダンジョンに入り直せば 必ず出られる)。
 */
describe("gate guards never trap the hero", () => {
  /* 番人を消せる flag 条件をすべて集める (skill 条件は歩いて解除できないので対象外) */
  function openFlagsOf(npc: { hideIf?: HideCond }): Set<string> {
    return new Set(
      hideIfConds(npc)
        .filter((c): c is Extract<FlagCond, { flag: string }> => "flag" in c)
        .filter((c) => c.op === "set")
        .map((c) => c.flag),
    );
  }

  for (const map of listMaps()) {
    const spawnNames = Object.keys(map.spawns);
    if (spawnNames.length < 2) continue;

    for (const name of spawnNames) {
      it(`${map.id} / spawn "${name}"`, () => {
        const start = map.spawns[name];
        const key = (x: number, y: number) => `${x},${y}`;
        const region = new Set([key(start.x, start.y)]);
        const guards = new Map<string, (typeof map.npcs)[number]>();
        const queue: [number, number][] = [[start.x, start.y]];
        while (queue.length > 0) {
          const [x, y] = queue.shift()!;
          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ]) {
            const nx = x + dx;
            const ny = y + dy;
            if (region.has(key(nx, ny))) continue;
            if (!inBounds(map, nx, ny) || !isWalkableTile(map, nx, ny)) continue;
            region.add(key(nx, ny));
            const npc = map.npcs.find((n) => n.x === nx && n.y === ny);
            /* NPC・置き物のタイルは「立てない」が、その先へは進めない */
            if (npc) {
              if (npc.hideIf) guards.set(npc.id, npc);
              continue;
            }
            if (map.events.some((e) => e.art && e.x === nx && e.y === ny)) continue;
            queue.push([nx, ny]);
          }
        }

        const reachesAnotherSpawn = spawnNames.some(
          (other) =>
            other !== name && region.has(key(map.spawns[other].x, map.spawns[other].y)),
        );
        if (reachesAnotherSpawn) return;

        /* 袋小路 — 中に 番人を消せるフラグを立てるイベントがあるか */
        const openable = new Set<string>();
        for (const g of guards.values()) for (const f of openFlagsOf(g)) openable.add(f);
        const settableHere = new Set<string>();
        for (const ev of map.events) {
          if (!region.has(key(ev.x, ev.y))) continue;
          for (const cmd of flattenCommands(ev.commands)) {
            if (cmd.type === "setFlag") settableHere.add(cmd.flag);
          }
        }
        const escape = [...settableHere].filter((f) => openable.has(f));
        expect(
          escape.length,
          `spawn "${name}" は番人 [${[...guards.keys()].join(",")}] の奥の袋小路で、` +
            `中から番人を消す手段がない (閉じこめ)`,
        ).toBeGreaterThan(0);
      });
    }
  }
});

/*
 * 章1 は 小1 の章。小1 で習う漢字 (80字) 以外は ルビ《》を付ける
 * (船・海・壱・塔・博士 が ルビなしで出ていた)
 */
describe("chapter 1 text is readable for first graders", () => {
  const G1_KANJI = new Set([
    ..."一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六",
  ]);
  const SKIP_KEYS = new Set(["id", "art", "mapId", "spawn", "flag", "skillId", "itemId", "spellId", "memberId", "legend", "grid", "encounterTableId", "theme", "onceFlag", "shopId", "kind", "type"]);
  const withoutRuby = (s: string) => s.replace(/｜?[^｜《》]*?《[^》]*》/g, "");

  it("uses only grade-1 kanji unless ruby is given", () => {
    const offenders: string[] = [];
    const walk = (v: unknown): void => {
      if (typeof v === "string") {
        const hard = [...withoutRuby(v)].filter((c) => /\p{Script=Han}/u.test(c) && !G1_KANJI.has(c));
        if (hard.length > 0) offenders.push(`${hard.join("")}: ${v}`);
      } else if (Array.isArray(v)) {
        v.forEach(walk);
      } else if (v && typeof v === "object") {
        for (const [key, x] of Object.entries(v)) if (!SKIP_KEYS.has(key)) walk(x);
      }
    };
    const chapter1 = CHAPTERS.find((c) => c.id === 1)!;
    walk(chapter1.maps);
    expect(offenders).toEqual([]);
  });
});

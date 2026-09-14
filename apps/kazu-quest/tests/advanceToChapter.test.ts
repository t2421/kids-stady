import { describe, expect, it } from "vitest";
import { defaultSave } from "../src/lib/save";
import { CHAPTERS, getChapter } from "../src/content/chapters";
import {
  advanceSaveToChapter,
  chapterStart,
  collectChapterJoins,
} from "../src/lib/debug/advanceToChapter";

describe("collectChapterJoins", () => {
  it("章2でタスク・章3でカケル・章4でリトルが加入する (コンテンツと一致)", () => {
    expect(collectChapterJoins(getChapter(2)!)).toEqual([{ memberId: "tasuku", level: 6 }]);
    expect(collectChapterJoins(getChapter(3)!)).toEqual([{ memberId: "kakeru", level: 13 }]);
    expect(collectChapterJoins(getChapter(4)!)).toEqual([{ memberId: "little", level: 20 }]);
    expect(collectChapterJoins(getChapter(1)!)).toEqual([]);
  });
});

describe("advanceSaveToChapter", () => {
  it("章1は開始地点に置くだけでフラグ・パーティは変えない", () => {
    const save = advanceSaveToChapter(defaultSave(), 1);
    expect(save.chapter).toEqual({ current: 1, cleared: [] });
    expect(save.flags).toEqual({});
    expect(save.party.map((m) => m.memberId)).toEqual(["hero"]);
    expect(save.location.mapId).toBe("ch1-hajimari");
  });

  it("章3: 章1・2をクリア済みにし、タスクが加入し、開始地点に立つ", () => {
    const save = advanceSaveToChapter(defaultSave(), 3);
    expect(save.chapter).toEqual({ current: 3, cleared: [1, 2] });
    expect(save.flags["c1.clear"]).toBe(true);
    expect(save.flags["c2.clear"]).toBe(true);
    expect(save.flags["c3.clear"]).toBeUndefined();
    expect(save.party.map((m) => m.memberId)).toEqual(["hero", "tasuku"]);
    expect(save.party[1].level).toBe(6);
    expect(save.party[1].learnedSpells).toEqual(["tashiria"]);
    expect(save.location.mapId).toBe("ch3-wakeera");
    expect(save.checkpoint).toEqual({ mapId: "ch3-wakeera", spawn: "entrance" });
    /* スポーン座標が実際の spawns から引かれている */
    const spawn = getChapter(3)!.maps.find((m) => m.id === "ch3-wakeera")!.spawns.entrance;
    expect(save.location.x).toBe(spawn.x);
    expect(save.location.y).toBe(spawn.y);
  });

  it("章5: 3人の仲間が加入し、勇者は加入者の最高レベル以上", () => {
    const save = advanceSaveToChapter(defaultSave(), 5);
    expect(save.chapter).toEqual({ current: 5, cleared: [1, 2, 3, 4] });
    expect(save.party.map((m) => `${m.memberId}:${m.level}`)).toEqual([
      "hero:20",
      "tasuku:6",
      "kakeru:13",
      "little:20",
    ]);
    expect(save.party[0].hp).toBeGreaterThan(defaultSave().party[0].hp);
    for (const c of [1, 2, 3, 4]) expect(save.flags[`c${c}.clear`]).toBe(true);
  });

  it("元の save を変更しない (不変更新)", () => {
    const original = defaultSave();
    advanceSaveToChapter(original, 6);
    expect(original.chapter).toEqual({ current: 1, cleared: [] });
    expect(original.party).toHaveLength(1);
    expect(original.flags).toEqual({});
  });

  it("既に進んだセーブに対しては後退させず、仲間も二重加入しない", () => {
    const far = advanceSaveToChapter({ ...defaultSave(), chapter: { current: 6, cleared: [1, 2, 3, 4, 5] } }, 3);
    expect(far.chapter.current).toBe(6);
    expect(far.chapter.cleared).toEqual([1, 2, 3, 4, 5]);
    const twice = advanceSaveToChapter(advanceSaveToChapter(defaultSave(), 4), 4);
    expect(twice.party.map((m) => m.memberId)).toEqual(["hero", "tasuku", "kakeru"]);
  });

  it("全章の開始地点が存在するマップ・スポーンを指す", () => {
    for (const c of CHAPTERS) {
      const start = chapterStart(c.id);
      const map = c.maps.find((m) => m.id === start.mapId);
      expect(map, `章${c.id} startMap`).toBeDefined();
      expect(map!.spawns[start.spawn], `章${c.id} startSpawn`).toBeDefined();
    }
  });

  it("存在しない章は例外", () => {
    expect(() => advanceSaveToChapter(defaultSave(), 0)).toThrow();
    expect(() => advanceSaveToChapter(defaultSave(), 99)).toThrow();
  });
});

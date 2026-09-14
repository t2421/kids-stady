import { describe, expect, it } from "vitest";
import { CHAPTERS, chapterForMap, getChapter } from "../src/content/chapters";

/*
 * chapterForMap (KQ-30b): 終章「ムゲンのらせん」は chapter.current を 6 のまま入るので、
 * 戦闘の通常攻撃プール (attackSkillIds) は「いるマップの章」から引く。
 */
describe("chapterForMap", () => {
  it("maps every registered map back to its own chapter", () => {
    for (const chapter of CHAPTERS) {
      for (const map of chapter.maps) {
        expect(chapterForMap(map.id)?.id, map.id).toBe(chapter.id);
      }
    }
  });

  it("resolves the spiral floors to chapter 7 even though the save stays on chapter 6", () => {
    expect(chapterForMap("ch7-spiral-1")?.id).toBe(7);
    expect(chapterForMap("ch7-spiral-5")?.attackSkillIds).toEqual(
      getChapter(7)!.attackSkillIds,
    );
    expect(chapterForMap("ch6-hoshioki-shrine")?.id).toBe(6);
  });

  it("returns undefined for dev maps and unknown ids", () => {
    expect(chapterForMap("dev-village")).toBeUndefined();
    expect(chapterForMap("no-such-map")).toBeUndefined();
  });
});

describe("chapter 7 (ムゲンのらせん) registration", () => {
  const ch7 = getChapter(7);

  it("is implemented, has no towns, and mixes attack skills from grades 1..6", () => {
    expect(ch7).toBeDefined();
    expect(ch7!.implemented).toBe(true);
    expect(ch7!.startMap).toBe("ch7-spiral-1");
    expect(ch7!.maps.map((m) => m.id)).toEqual([
      "ch7-spiral-1",
      "ch7-spiral-2",
      "ch7-spiral-3",
      "ch7-spiral-4",
      "ch7-spiral-5",
    ]);
    const grades = ch7!.attackSkillIds.map((id) => Number(id[1]));
    expect(grades).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("no map in the game advances the save to chapter 7 (it is entered from hoshioki's shrine)", () => {
    const advances = CHAPTERS.flatMap((c) => c.maps).some((map) =>
      [
        ...map.events.flatMap((ev) => ev.commands),
        ...map.npcs.flatMap((npc) => npc.dialog.flatMap((d) => d.then ?? [])),
      ].some((cmd) => cmd.type === "advanceChapter" && cmd.chapter === 7),
    );
    expect(advances).toBe(false);
  });
});

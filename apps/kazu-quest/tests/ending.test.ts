import { describe, expect, it } from "vitest";
import { getMapDef } from "../src/content/maps";
import {
  ENDING_CHECKPOINT,
  FINAL_CHAPTER,
  buildEndingSummary,
  countLearnedSpells,
  markGameCleared,
} from "../src/lib/ending";
import { defaultSave, type SaveData } from "../src/lib/save";

function playedSave(): SaveData {
  const base = defaultSave();
  return {
    ...base,
    chapter: { current: 6, cleared: [1, 2, 3, 4, 5] },
    party: [
      { ...base.party[0], learnedSpells: ["hikidama", "hikidaman"] },
      { ...base.party[0], memberId: "mage", learnedSpells: ["kuku"] },
    ],
    location: { mapId: "ch6-zerom-throne", x: 6, y: 3, facing: "up" },
    checkpoint: { mapId: "ch6-zerom-1", spawn: "entrance" },
    totalCorrect: 120,
    totalWrong: 30,
    playtimeMs: 2 * 3_600_000 + 5 * 60_000,
  };
}

describe("markGameCleared", () => {
  it("cleared に最終章を積み、再開位置を ホシオキの ほこら に移す", () => {
    const save = playedSave();
    const cleared = markGameCleared(save);
    expect(cleared.chapter.cleared).toEqual([1, 2, 3, 4, 5, FINAL_CHAPTER]);
    expect(cleared.checkpoint).toEqual(ENDING_CHECKPOINT);
    const point = getMapDef(ENDING_CHECKPOINT.mapId).spawns[ENDING_CHECKPOINT.spawn];
    expect(cleared.location).toEqual({
      mapId: ENDING_CHECKPOINT.mapId,
      x: point.x,
      y: point.y,
      facing: point.facing,
    });
  });

  it("元の save は変更しない (不変更新)", () => {
    const save = playedSave();
    markGameCleared(save);
    expect(save.chapter.cleared).toEqual([1, 2, 3, 4, 5]);
    expect(save.location.mapId).toBe("ch6-zerom-throne");
  });

  it("2回目のクリアで cleared を重複させない", () => {
    const twice = markGameCleared(markGameCleared(playedSave()));
    expect(twice.chapter.cleared.filter((n) => n === FINAL_CHAPTER)).toHaveLength(1);
  });

  it("chapter.current は保持する", () => {
    expect(markGameCleared(playedSave()).chapter.current).toBe(6);
  });
});

describe("buildEndingSummary", () => {
  it("4行: といた もんだい / せいかい / じゅもん / じかん", () => {
    const rows = buildEndingSummary(playedSave());
    expect(rows.map((r) => r.label)).toEqual([
      "といた もんだい",
      "せいかいした かず",
      "おぼえた じゅもん",
      "あそんだ じかん",
    ]);
    expect(rows[0].value).toBe("150 もん");
    expect(rows[1].value).toBe("120 かい");
    expect(rows[2].value).toBe("3 こ");
    expect(rows[3].value).toBe("2じかん 5ふん");
  });

  it("新規セーブでも 0 で成立する", () => {
    const rows = buildEndingSummary(defaultSave());
    expect(rows[0].value).toBe("0 もん");
    expect(rows[2].value).toBe("0 こ");
    expect(rows[3].value).toBe("0ふん");
  });

  it("countLearnedSpells はパーティ全員の のべ数", () => {
    expect(countLearnedSpells(playedSave())).toBe(3);
  });
});

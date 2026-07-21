import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorageStub } from "./localStorageStub";
import {
  HISTORY_CAP,
  RECENT_MS_CAP,
  addHistory,
  defaultSave,
  loadSave,
  normalizeSave,
  persistSave,
  recordAnswer,
  saveKey,
} from "../src/lib/save";

beforeEach(() => {
  installLocalStorageStub();
});

describe("normalizeSave", () => {
  it("returns defaults for garbage", () => {
    expect(normalizeSave(null)).toEqual(defaultSave());
    expect(normalizeSave("x")).toEqual(defaultSave());
    expect(normalizeSave(42)).toEqual(defaultSave());
  });

  it("keeps valid data intact (round-trip)", () => {
    const d = defaultSave();
    const touched = {
      ...d,
      flags: { "c1.metKing": true, "c1.torches": 3 },
      inventory: { gold: 120, items: { yakusou: 2 } },
    };
    expect(normalizeSave(JSON.parse(JSON.stringify(touched)))).toEqual(touched);
  });

  it("repairs broken fields with defaults", () => {
    const n = normalizeSave({
      version: 99,
      chapter: { current: -5, cleared: "no" },
      party: [],
      location: { mapId: "", x: "a", facing: "sideways" },
      inventory: { gold: -10, items: { sword: -1, herb: 2.7 } },
      flags: { ok: true, bad: { nested: 1 }, n: 5 },
      skillStats: { g1_add_nc: { c: "x", w: 2, recentMs: [1, "b", 3] } },
      history: [{ kind: "weird", correct: -1 }],
    });
    const d = defaultSave();
    expect(n.chapter.current).toBe(1);
    expect(n.chapter.cleared).toEqual([]);
    expect(n.party).toEqual(d.party);
    expect(n.location).toEqual(d.location);
    expect(n.inventory).toEqual({ gold: 0, items: { herb: 2 } });
    expect(n.flags).toEqual({ ok: true, n: 5 });
    expect(n.skillStats.g1_add_nc).toEqual({ c: 0, w: 2, recentMs: [1, 3] });
    expect(n.history).toEqual([
      { ts: 0, kind: "battle", chapter: 1, correct: 0, wrong: 0, avgAnswerMs: 0 },
    ]);
  });

  it("drops party members without memberId but keeps valid ones", () => {
    const n = normalizeSave({
      party: [
        { level: 3 },
        { memberId: "hero", level: 4, exp: 30, hp: 20, mp: 5, learnedSpells: ["hikidama"] },
      ],
    });
    expect(n.party).toEqual([
      { memberId: "hero", level: 4, exp: 30, hp: 20, mp: 5, learnedSpells: ["hikidama"] },
    ]);
  });
});

describe("load / persist", () => {
  it("missing key yields defaults", () => {
    expect(loadSave("p1")).toEqual(defaultSave());
  });

  it("persists under the contract key and round-trips", () => {
    const data = recordAnswer(defaultSave(), "g1_add_nc", true, 4200);
    persistSave("p1", data);
    expect(saveKey("p1")).toBe("kidsStudy.kazuQuest.profileData.p1");
    const loaded = loadSave("p1");
    expect(loaded.skillStats.g1_add_nc).toEqual({ c: 1, w: 0, recentMs: [4200] });
    expect(loaded.updatedAt).toBeGreaterThan(0);
  });
});

describe("recordAnswer", () => {
  it("accumulates counters immutably", () => {
    const base = defaultSave();
    const a = recordAnswer(base, "g1_add_nc", true, 3000);
    const b = recordAnswer(a, "g1_add_nc", false, 9000);
    expect(base.skillStats).toEqual({});
    expect(b.totalCorrect).toBe(1);
    expect(b.totalWrong).toBe(1);
    expect(b.skillStats.g1_add_nc).toEqual({ c: 1, w: 1, recentMs: [3000, 9000] });
  });

  it("caps recentMs", () => {
    let data = defaultSave();
    for (let i = 0; i < RECENT_MS_CAP + 5; i++) {
      data = recordAnswer(data, "g1_count", true, i);
    }
    expect(data.skillStats.g1_count.recentMs).toHaveLength(RECENT_MS_CAP);
    expect(data.skillStats.g1_count.recentMs[0]).toBe(5);
  });
});

describe("addHistory", () => {
  it("caps history", () => {
    let data = defaultSave();
    for (let i = 0; i < HISTORY_CAP + 10; i++) {
      data = addHistory(data, {
        ts: i,
        kind: "battle",
        chapter: 1,
        correct: 1,
        wrong: 0,
        avgAnswerMs: 100,
      });
    }
    expect(data.history).toHaveLength(HISTORY_CAP);
    expect(data.history[0].ts).toBe(10);
  });
});

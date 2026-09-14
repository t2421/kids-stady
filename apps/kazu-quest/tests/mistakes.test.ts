import { describe, expect, it } from "vitest";
import { defaultSave, normalizeSave } from "../src/lib/save";
import {
  MISTAKES_CAP,
  normalizeMistakes,
  recordMistake,
  type MistakeEntry,
} from "../src/lib/mistakes";

const entry = (n: number, over: Partial<MistakeEntry> = {}): MistakeEntry => ({
  ts: n,
  skillId: "g1_add_10",
  text: `${n} + 1 = ?`,
  answer: String(n + 1),
  chosen: String(n + 2),
  explain: [`${n} に 1 を たすと ${n + 1}`],
  ...over,
});

describe("recordMistake", () => {
  it("新しいものを先頭に積み、元のセーブは変えない", () => {
    const before = recordMistake(defaultSave(), entry(1));
    const after = recordMistake(before, entry(2));
    expect(after.mistakes.map((m) => m.ts)).toEqual([2, 1]);
    expect(before.mistakes.map((m) => m.ts)).toEqual([1]);
    expect(after).not.toBe(before);
    expect(after.mistakes).not.toBe(before.mistakes);
  });

  it("cap を超えたら いちばん古いものから落とす", () => {
    let save = defaultSave();
    for (let i = 1; i <= MISTAKES_CAP + 5; i++) save = recordMistake(save, entry(i));
    expect(save.mistakes).toHaveLength(MISTAKES_CAP);
    expect(save.mistakes[0].ts).toBe(MISTAKES_CAP + 5);
    expect(save.mistakes[MISTAKES_CAP - 1].ts).toBe(6);
  });
});

describe("normalizeMistakes", () => {
  it("配列でなければ空", () => {
    expect(normalizeMistakes(undefined)).toEqual([]);
    expect(normalizeMistakes(null)).toEqual([]);
    expect(normalizeMistakes("junk")).toEqual([]);
    expect(normalizeMistakes({ ts: 1 })).toEqual([]);
  });

  it("壊れた行は捨て、欠けた項目は既定値で埋める", () => {
    const rows = normalizeMistakes([
      entry(1),
      { skillId: "g1_add_10", text: "1 + 1", answer: "2" },
      { skillId: "", text: "x", answer: "1" },
      { skillId: "g1_add_10", text: 3, answer: "2" },
      { skillId: "g1_add_10", text: "a", answer: "b", ts: Number.NaN, chosen: 5, explain: ["ok", 7] },
      42,
      null,
    ]);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual(entry(1));
    expect(rows[1]).toEqual({
      ts: 0,
      skillId: "g1_add_10",
      text: "1 + 1",
      answer: "2",
      chosen: "",
      explain: [],
    });
    expect(rows[2]).toMatchObject({ ts: 0, chosen: "", explain: ["ok"] });
  });

  it("cap を超える保存データは先頭 (新しい順) だけ残す", () => {
    const many = Array.from({ length: MISTAKES_CAP + 3 }, (_, i) => entry(100 - i));
    const rows = normalizeMistakes(many);
    expect(rows).toHaveLength(MISTAKES_CAP);
    expect(rows[0].ts).toBe(100);
  });
});

describe("normalizeSave × mistakes", () => {
  it("mistakes が無い旧セーブは空配列で復元される", () => {
    const raw = { ...defaultSave() } as Record<string, unknown>;
    delete raw.mistakes;
    expect(normalizeSave(raw).mistakes).toEqual([]);
    expect(normalizeSave({ ...defaultSave(), mistakes: "garbage" }).mistakes).toEqual([]);
  });

  it("正常な mistakes は保持される", () => {
    const save = recordMistake(defaultSave(), entry(9));
    expect(normalizeSave(JSON.parse(JSON.stringify(save))).mistakes).toEqual(save.mistakes);
  });
});

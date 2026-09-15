/*
 * src/lib/masteryMapData.ts / src/lib/masteryColors.ts (LP-11b (1)) の純ロジック。
 * MasteryMap.tsx 自体 (React コンポーネント) は e2e/masteryMap.spec.ts で検証し、
 * ここではセルの色分け・学年ごとの内訳という抽出したロジックだけを見る。
 */
import { describe, expect, it } from "vitest";
import { buildMasteryMapRows } from "../src/lib/masteryMapData";
import { MASTERY_COLORS, masteryCellColor, masteryCellLabel } from "../src/lib/masteryColors";
import { defaultSave, type SaveData } from "../src/lib/save";

function withMastery(entries: Record<string, SaveData["mastery"][string]["state"]>): SaveData {
  const save = defaultSave();
  const mastery: SaveData["mastery"] = {};
  for (const [skillId, state] of Object.entries(entries)) {
    mastery[skillId] = { state, reviewDue: null, streak: 0, passedAt: null };
  }
  return { ...save, mastery };
}

describe("masteryCellColor / masteryCellLabel", () => {
  it("4状態それぞれ別の色を返す (mastered は金 = UI_COLORS.yellow)", () => {
    const colors = new Set(
      (["none", "practicing", "can", "mastered"] as const).map((s) => masteryCellColor(s)),
    );
    expect(colors.size).toBe(4);
    expect(masteryCellColor("mastered")).toBe(MASTERY_COLORS.mastered);
    expect(masteryCellColor("mastered")).toBe("#ffd93d");
  });

  it("ラベルは日本語の短い状態名", () => {
    expect(masteryCellLabel("none")).toBe("みならい");
    expect(masteryCellLabel("mastered")).toBe("マスター");
  });
});

describe("buildMasteryMapRows", () => {
  it("学年1〜6、合計44単元 (小1:6 小2:6 小3:8 小4:8 小5:8 小6:8) を返す", () => {
    const rows = buildMasteryMapRows(defaultSave());
    expect(rows).toHaveLength(6);
    expect(rows.map((r) => r.grade)).toEqual([1, 2, 3, 4, 5, 6]);
    const counts = rows.map((r) => r.cells.length);
    expect(counts).toEqual([6, 6, 8, 8, 8, 8]);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(44);
  });

  it("未登録の単元は none 扱い", () => {
    const rows = buildMasteryMapRows(defaultSave());
    const allNone = rows.every((r) => r.cells.every((c) => c.state === "none"));
    expect(allNone).toBe(true);
  });

  it("mastery に登録済みの単元はその状態が反映される", () => {
    const save = withMastery({ g1_add_nc: "mastered", g1_sub_nc: "practicing" });
    const rows = buildMasteryMapRows(save);
    const g1 = rows.find((r) => r.grade === 1)!;
    expect(g1.cells.find((c) => c.skillId === "g1_add_nc")?.state).toBe("mastered");
    expect(g1.cells.find((c) => c.skillId === "g1_sub_nc")?.state).toBe("practicing");
    /* 他学年には影響しない */
    const g2 = rows.find((r) => r.grade === 2)!;
    expect(g2.cells.every((c) => c.state === "none")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { SKILLS } from "../src/lib/curriculum";
import {
  defaultPrerequisites,
  prerequisitesFor,
  readinessRequired,
  registerLessonLookup,
} from "../src/content/lessons/prereqs";
import { defaultSave } from "../src/lib/save";
import type { SaveData } from "../src/lib/save";
import type { LessonDef } from "../src/content/lessons/types";

/*
 * 前提グラフ (LP-10, §3.4) のバリデーションと readiness ゲートの純関数テスト。
 * prereqs.ts は EventBus/Phaser に依存しないので、そのまま Vitest で検証できる
 * (lessonFlow.test.ts の EventBus モックは不要 — このファイルでは使わない)。
 */

const ALL_SKILL_IDS = new Set(SKILLS.map((s) => s.id));

describe("defaultPrerequisites / prerequisitesFor: グラフの健全性", () => {
  it("既定表が参照する skillId はすべて curriculum に実在する", () => {
    for (const skill of SKILLS) {
      for (const pre of defaultPrerequisites(skill.id)) {
        expect(ALL_SKILL_IDS.has(pre)).toBe(true);
      }
    }
  });

  it("既定表は DAG (循環が無い) — 全 SKILLS を起点に DFS で検出する", () => {
    const visiting = new Set<string>();
    const done = new Set<string>();

    function dfs(skillId: string, path: string[]): void {
      if (done.has(skillId)) return;
      if (visiting.has(skillId)) {
        throw new Error(`前提グラフに循環がある: ${[...path, skillId].join(" -> ")}`);
      }
      visiting.add(skillId);
      for (const pre of prerequisitesFor(skillId)) {
        dfs(pre, [...path, skillId]);
      }
      visiting.delete(skillId);
      done.add(skillId);
    }

    for (const skill of SKILLS) {
      expect(() => dfs(skill.id, [])).not.toThrow();
    }
  });

  it("既定表 (§3.4) の主な行を確認する", () => {
    expect(defaultPrerequisites("g1_add_carry")).toEqual(["g1_add_nc"]);
    expect(defaultPrerequisites("g2_kuku")).toEqual(["g1_add_nc"]);
    expect(defaultPrerequisites("g5_fraction_diff")).toEqual(["g4_fraction_same", "g5_multiple"]);
    expect(defaultPrerequisites("g6_ratio")).toEqual(["g5_percent"]);
    /* 表に無いものは [] */
    expect(defaultPrerequisites("g1_count")).toEqual([]);
  });

  it("LessonDef が prerequisites を持たない単元 (未登録含む) は既定表にフォールバックする", () => {
    /* g1_add_carry には LessonDef がまだ無い (LP-12 以降) が、既定表だけで動く */
    expect(prerequisitesFor("g1_add_carry")).toEqual(["g1_add_nc"]);
  });

  it("prerequisitesFor は LessonDef 自身の prerequisites を既定表より優先する", () => {
    /*
     * index.ts は自分のモジュール評価の最後で registerLessonLookup(getLesson) を
     * 呼ぶ (循環import回避、prereqs.ts 冒頭のコメント参照)。ここでは index.ts を
     * 経由せず、その差し込み口を直接使って LessonDef 優先の挙動だけを検証する。
     */
    registerLessonLookup((skillId) =>
      skillId === "g6_ratio"
        ? ({ skillId: "g6_ratio", prerequisites: ["g1_add_nc"] } as LessonDef)
        : undefined,
    );
    try {
      /* 既定表なら g6_ratio ← g5_percent のはずだが、LessonDef 自身の指定が優先される */
      expect(prerequisitesFor("g6_ratio")).toEqual(["g1_add_nc"]);
    } finally {
      /* 他のテストに影響しないよう、必ず未登録状態に戻す */
      registerLessonLookup(() => undefined);
    }
  });
});

describe("readinessRequired: 前提のうち can 未満だけを返す", () => {
  function withMastery(save: SaveData, entries: Record<string, "none" | "practicing" | "can" | "mastered">): SaveData {
    let next = save;
    for (const [skillId, state] of Object.entries(entries)) {
      next = {
        ...next,
        mastery: {
          ...next.mastery,
          [skillId]: { state, reviewDue: null, streak: 0, passedAt: null },
        },
      };
    }
    return next;
  }

  it("前提が無い単元は常に []", () => {
    expect(readinessRequired(defaultSave(), "g1_add_nc")).toEqual([]);
  });

  it("前提の mastery が none (未着手) なら不足として返す", () => {
    const save = defaultSave();
    expect(readinessRequired(save, "g1_add_carry")).toEqual(["g1_add_nc"]);
  });

  it("前提の mastery が can 以上なら不足に含まれない", () => {
    const save = withMastery(defaultSave(), { g1_add_nc: "can" });
    expect(readinessRequired(save, "g1_add_carry")).toEqual([]);
  });

  it("mastered も can 以上として扱う (省略される)", () => {
    const save = withMastery(defaultSave(), { g1_add_nc: "mastered" });
    expect(readinessRequired(save, "g1_add_carry")).toEqual([]);
  });

  it("practicing はまだ can 未満なので不足に残る", () => {
    const save = withMastery(defaultSave(), { g1_add_nc: "practicing" });
    expect(readinessRequired(save, "g1_add_carry")).toEqual(["g1_add_nc"]);
  });

  it("複数前提のうち can 済みだけを除外する", () => {
    const save = withMastery(defaultSave(), {
      g4_fraction_same: "can",
      g5_multiple: "practicing",
    });
    expect(readinessRequired(save, "g5_fraction_diff")).toEqual(["g5_multiple"]);
  });
});

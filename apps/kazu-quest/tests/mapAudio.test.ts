import { describe, expect, it } from "vitest";
import { didNegariaStageIncrease, npcsToHide } from "../src/game/field/MapView";
import type { SaveData } from "../src/lib/save";

/*
 * AU-04: MapView.ts の音判定 (どのタイミングで gateOpen / colorReturn を鳴らすか) を
 * 純関数に切り出した npcsToHide / didNegariaStageIncrease のテスト。
 * MapView.ts は型のみ "phaser" を参照する (Scene/Phaser は type-only import) ので
 * Node からそのまま import しても phaser の実体は読み込まれない — vi.mock は不要。
 */

describe("npcsToHide", () => {
  const flags: SaveData["flags"] = { "learned.spellA": true, other: false };

  it("hideIf が無い NPC は対象にならない", () => {
    const npcs = [{ id: "villager" }];
    const result = npcsToHide(npcs, new Set(["villager"]), flags, undefined);
    expect(result).toEqual([]);
  });

  it("hideIf を満たしても、いま表示中でなければ対象にならない (二重計上防止)", () => {
    const npcs = [{ id: "guard", hideIf: { flag: "learned.spellA", op: "set" as const } }];
    /* visibleIds に guard が含まれない = 既に消えている想定 */
    const result = npcsToHide(npcs, new Set([]), flags, undefined);
    expect(result).toEqual([]);
  });

  it("表示中で hideIf を満たす NPC だけを返す", () => {
    const npcs = [
      { id: "guard", hideIf: { flag: "learned.spellA", op: "set" as const } },
      { id: "shopkeeper", hideIf: { flag: "other", op: "set" as const } },
      { id: "villager" },
    ];
    const result = npcsToHide(
      npcs,
      new Set(["guard", "shopkeeper", "villager"]),
      flags,
      undefined,
    );
    expect(result).toEqual(["guard"]);
  });

  it("hideIf が配列 (AND) のときは全条件が揃って初めて消える対象になる (章1 中核3単元の番人と同じ形)", () => {
    const npcs = [
      {
        id: "bridge-guard",
        hideIf: [
          { skill: "g1_count", state: "can" as const },
          { skill: "g1_add_carry", state: "can" as const },
          { skill: "g1_sub_borrow", state: "can" as const },
        ],
      },
    ];
    const visibleIds = new Set(["bridge-guard"]);

    /* 2つだけ can: まだ消えない */
    const partialMastery = {
      g1_count: { state: "can" },
      g1_add_carry: { state: "can" },
    };
    expect(npcsToHide(npcs, visibleIds, {}, partialMastery)).toEqual([]);

    /* 3つとも can: 消える対象になる */
    const fullMastery = {
      g1_count: { state: "can" },
      g1_add_carry: { state: "can" },
      g1_sub_borrow: { state: "can" },
    };
    expect(npcsToHide(npcs, visibleIds, {}, fullMastery)).toEqual(["bridge-guard"]);
  });

  it("複数の NPC が同時に消える回は、消える id を全部まとめて返す (呼び出し側が gateOpen を1回だけ鳴らす根拠)", () => {
    const npcs = [
      { id: "a", hideIf: { flag: "f", op: "set" as const } },
      { id: "b", hideIf: { flag: "f", op: "set" as const } },
    ];
    const result = npcsToHide(npcs, new Set(["a", "b"]), { f: true }, undefined);
    expect(result.sort()).toEqual(["a", "b"]);
  });
});

describe("didNegariaStageIncrease", () => {
  it("段が上がったときだけ true", () => {
    expect(didNegariaStageIncrease(0, 1)).toBe(true);
    expect(didNegariaStageIncrease(1, 3)).toBe(true);
  });

  it("段が変わらない/下がるときは false", () => {
    expect(didNegariaStageIncrease(1, 1)).toBe(false);
    expect(didNegariaStageIncrease(2, 1)).toBe(false);
    expect(didNegariaStageIncrease(0, 0)).toBe(false);
  });
});

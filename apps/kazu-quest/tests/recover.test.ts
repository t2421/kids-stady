import { describe, expect, it } from "vitest";
import {
  applyFieldHeal,
  applyHealItem,
  canCastFieldHeal,
  fieldHealTargets,
  healAmount,
} from "../src/lib/field/recover";
import { defaultSave, type SaveData } from "../src/lib/save";
import { getSpell } from "../src/content/spells";
import { memberStats } from "../src/lib/battle/members";

/* rng を 0.5 に固定すると spellAmount は power そのまま (0.8 + 0.5*0.4 = 1.0) */
const midRng = () => 0.5;

function saveWith(over: Partial<SaveData>): SaveData {
  return { ...defaultSave(), ...over };
}

function heroWith(hp: number, mp: number, spells: string[] = ["tashiria"]) {
  const base = defaultSave().party[0];
  return { ...base, hp, mp, learnedSpells: spells };
}

describe("fieldHealTargets", () => {
  it("HP が maxHp 未満の なかまだけ返す", () => {
    const save = saveWith({
      party: [heroWith(5, 8), { ...heroWith(25, 8), memberId: "tasuku", hp: 20 }],
    });
    /* タスク Lv1 maxHp = 16 + 4 = 20 → 満タン */
    expect(fieldHealTargets(save).map((t) => t.memberId)).toEqual(["hero"]);
    expect(fieldHealTargets(save)[0]).toEqual({
      memberId: "hero",
      name: "ゆうしゃ",
      hp: 5,
      maxHp: 25,
    });
  });

  it("全員満タンなら空", () => {
    expect(fieldHealTargets(defaultSave())).toEqual([]);
  });
});

describe("canCastFieldHeal", () => {
  it("おぼえていない / 回復以外 / MP不足 を区別する", () => {
    const save = saveWith({ party: [heroWith(5, 1, ["tashiria", "hikidama"])] });
    expect(canCastFieldHeal(save, "hero", "tashirian")).toEqual({
      ok: false,
      reason: "notLearned",
    });
    expect(canCastFieldHeal(save, "hero", "hikidama")).toEqual({
      ok: false,
      reason: "notHeal",
    });
    expect(canCastFieldHeal(save, "hero", "tashiria")).toEqual({ ok: false, reason: "noMp" });
    expect(canCastFieldHeal(saveWith({ party: [heroWith(5, 2)] }), "hero", "tashiria")).toEqual({
      ok: true,
    });
  });

  it("いない なかま は notLearned", () => {
    expect(canCastFieldHeal(defaultSave(), "tasuku", "tashiria")).toEqual({
      ok: false,
      reason: "notLearned",
    });
  });
});

describe("healAmount", () => {
  it("戦闘の spellAmount と同じ式 (power ±20%、かいしん無し)", () => {
    const spell = getSpell("tashiria")!;
    expect(healAmount(spell, midRng)).toBe(10);
    expect(healAmount(spell, () => 0)).toBe(8);
    expect(healAmount(spell, () => 0.999)).toBe(12);
  });
});

describe("applyFieldHeal", () => {
  it("MP を消費して HP を回復し、元の save は変えない", () => {
    const before = saveWith({ party: [heroWith(5, 8)] });
    const { save, healed } = applyFieldHeal(before, "hero", "tashiria", "hero", midRng);
    expect(healed).toEqual([{ memberId: "hero", amount: 10 }]);
    expect(save.party[0].hp).toBe(15);
    expect(save.party[0].mp).toBe(6);
    expect(before.party[0].hp).toBe(5);
    expect(before.party[0].mp).toBe(8);
    expect(save).not.toBe(before);
  });

  it("maxHp で頭打ち (回復量は実際に増えたぶん)", () => {
    const before = saveWith({ party: [heroWith(22, 8)] });
    const { save, healed } = applyFieldHeal(before, "hero", "tashiria", "hero", midRng);
    expect(save.party[0].hp).toBe(25);
    expect(healed).toEqual([{ memberId: "hero", amount: 3 }]);
  });

  it("target: party の呪文は全員に掛かり、使い手だけ MP が減る", () => {
    const tasukuMax = memberStats("tasuku", 1);
    const before = saveWith({
      party: [
        heroWith(5, 8, ["tashiriada"]),
        { ...heroWith(3, tasukuMax.maxMp, []), memberId: "tasuku" },
      ],
    });
    const { save, healed } = applyFieldHeal(before, "hero", "tashiriada", null, midRng);
    expect(healed).toEqual([
      { memberId: "hero", amount: 14 },
      { memberId: "tasuku", amount: 14 },
    ]);
    expect(save.party[0].mp).toBe(8 - 5);
    expect(save.party[1].mp).toBe(tasukuMax.maxMp);
  });

  it("おぼえていない呪文・MP不足では何も変えない", () => {
    const notLearned = saveWith({ party: [heroWith(5, 8, [])] });
    expect(applyFieldHeal(notLearned, "hero", "tashiria", "hero", midRng)).toEqual({
      save: notLearned,
      healed: [],
    });
    const noMp = saveWith({ party: [heroWith(5, 1)] });
    expect(applyFieldHeal(noMp, "hero", "tashiria", "hero", midRng).save).toBe(noMp);
  });

  it("他の なかま を対象にできる", () => {
    const before = saveWith({
      party: [heroWith(25, 8), { ...heroWith(3, 5, []), memberId: "tasuku" }],
    });
    const { save, healed } = applyFieldHeal(before, "hero", "tashiria", "tasuku", midRng);
    expect(healed).toEqual([{ memberId: "tasuku", amount: 10 }]);
    expect(save.party[1].hp).toBe(13);
    expect(save.party[0].hp).toBe(25);
  });
});

describe("applyHealItem", () => {
  it("個数を 1 減らし、HP を power ぶん回復する (不変更新)", () => {
    const before = saveWith({
      party: [heroWith(5, 8)],
      inventory: { gold: 0, items: { yakusou: 2 } },
    });
    const { save, healed } = applyHealItem(before, "yakusou", "hero");
    expect(healed).toEqual([{ memberId: "hero", amount: 20 }]);
    expect(save.party[0].hp).toBe(25);
    expect(save.inventory.items).toEqual({ yakusou: 1 });
    expect(before.inventory.items).toEqual({ yakusou: 2 });
    expect(before.party[0].hp).toBe(5);
  });

  it("最後の 1 個を使うとキーごと消える", () => {
    const before = saveWith({
      party: [heroWith(5, 8)],
      inventory: { gold: 0, items: { yakusou: 1, anshinNoSuzu: 1 } },
    });
    const { save } = applyHealItem(before, "yakusou", "hero");
    expect(save.inventory.items).toEqual({ anshinNoSuzu: 1 });
    expect("yakusou" in save.inventory.items).toBe(false);
  });

  it("回復アイテム以外・持っていない・いない なかま では何も変えない", () => {
    const key = saveWith({
      party: [heroWith(5, 8)],
      inventory: { gold: 0, items: { anshinNoSuzu: 1 } },
    });
    expect(applyHealItem(key, "anshinNoSuzu", "hero")).toEqual({ save: key, healed: [] });
    expect(applyHealItem(key, "yakusou", "hero").save).toBe(key);
    const owned = saveWith({
      party: [heroWith(5, 8)],
      inventory: { gold: 0, items: { yakusou: 1 } },
    });
    expect(applyHealItem(owned, "yakusou", "nobody").save).toBe(owned);
  });

  it("maxHp で頭打ち", () => {
    const before = saveWith({
      party: [heroWith(20, 8)],
      inventory: { gold: 0, items: { yakusou: 1 } },
    });
    const { save, healed } = applyHealItem(before, "yakusou", "hero");
    expect(save.party[0].hp).toBe(25);
    expect(healed).toEqual([{ memberId: "hero", amount: 5 }]);
  });
});

import { describe, expect, it } from "vitest";
import type { MonsterDef, SpellDef } from "../src/content/types";
import type { PartyMember } from "../src/lib/save";
import {
  applyVictory,
  createBattle,
  physicalDamage,
  spellAmount,
  submitRound,
} from "../src/lib/battle/battle";
import { expForLevel, heroStats, levelForExp } from "../src/lib/battle/stats";
import { mulberry32 } from "../src/lib/curriculum/types";

const HERO: PartyMember = {
  memberId: "hero",
  level: 3,
  exp: expForLevel(3),
  hp: 999,
  mp: 999,
  learnedSpells: ["hikidama"],
};

const KESHIGOMUN: MonsterDef = {
  id: "keshigomun",
  name: "ケシゴムン",
  art: "keshigomun",
  hp: 8,
  atk: 5,
  def: 2,
  agi: 2,
  exp: 2,
  gold: 1,
  actions: [{ kind: "attack", weight: 1 }],
};

const HIKIDAMA: SpellDef = {
  id: "hikidama",
  name: "ヒキダマ",
  kind: "attack",
  mpCost: 2,
  power: 10,
  target: "enemy",
  skillIds: ["g1_sub_nc"],
  battleTimeLimitMs: 15000,
  learnTest: { skillIds: ["g1_sub_nc"], questions: 10, passCount: 8 },
  description: "",
};

describe("stats", () => {
  it("level curve is monotonic", () => {
    for (let l = 1; l < 20; l++) {
      expect(expForLevel(l + 1)).toBeGreaterThan(expForLevel(l));
    }
  });
  it("levelForExp inverts expForLevel", () => {
    expect(levelForExp(0)).toBe(1);
    expect(levelForExp(expForLevel(5))).toBe(5);
    expect(levelForExp(expForLevel(5) - 1)).toBe(4);
  });
  it("hero stats grow", () => {
    expect(heroStats(1).maxHp).toBe(25);
    expect(heroStats(1).maxMp).toBe(8);
    expect(heroStats(7).maxHp).toBeGreaterThan(heroStats(1).maxHp);
  });
});

describe("damage formulas", () => {
  it("physical damage is at least 1 and reduced by defending", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 200; i++) {
      const d = physicalDamage(2, 50, rng, false);
      expect(d).toBeGreaterThanOrEqual(1);
    }
    /* ぼうぎょで半減 (同一乱数比較) */
    const a = physicalDamage(20, 4, mulberry32(7), false);
    const b = physicalDamage(20, 4, mulberry32(7), true);
    expect(b).toBeLessThan(a);
  });

  it("critical spell is stronger (same rng)", () => {
    const a = spellAmount(10, false, mulberry32(3));
    const b = spellAmount(10, true, mulberry32(3));
    expect(b).toBeGreaterThan(a);
    expect(b).toBeLessThanOrEqual(Math.ceil(a * 1.5) + 1);
  });
});

describe("battle rounds", () => {
  it("attack kills a weak enemy and wins with exp/gold", () => {
    const state = createBattle([{ ...HERO, level: 5 }], [{ ...KESHIGOMUN, hp: 3 }], false);
    const { state: s2, events } = submitRound(
      state,
      [{ kind: "attack", memberId: "hero", targetId: state.enemies[0].id }],
      mulberry32(1),
    );
    expect(s2.phase).toBe("won");
    const victory = events.find((e) => e.type === "victory");
    expect(victory).toEqual({ type: "victory", exp: 2, gold: 1 });
  });

  it("missed attack (wrong answer) does no damage", () => {
    const state = createBattle([HERO], [{ ...KESHIGOMUN, hp: 50 }], false);
    const { state: s2, events } = submitRound(
      state,
      [
        {
          kind: "attack",
          memberId: "hero",
          targetId: state.enemies[0].id,
          outcome: { correct: false, critical: false },
        },
      ],
      mulberry32(1),
    );
    expect(s2.enemies[0].hp).toBe(50);
    expect(events.some((e) => e.type === "message" && e.text.includes("はずれて"))).toBe(true);
  });

  it("critical attack (fast answer) deals more than normal (same rng)", () => {
    const base = createBattle([HERO], [{ ...KESHIGOMUN, hp: 500, def: 0 }], false);
    const normal = submitRound(
      base,
      [{ kind: "attack", memberId: "hero", targetId: base.enemies[0].id, outcome: { correct: true, critical: false } }],
      mulberry32(9),
    );
    const crit = submitRound(
      base,
      [{ kind: "attack", memberId: "hero", targetId: base.enemies[0].id, outcome: { correct: true, critical: true } }],
      mulberry32(9),
    );
    const dmg = (r: typeof normal) =>
      500 - r.state.enemies[0].hp;
    expect(dmg(crit)).toBeGreaterThan(dmg(normal));
  });

  it("fizzled spell consumes no MP and does no damage", () => {
    const state = createBattle([HERO], [{ ...KESHIGOMUN, hp: 50 }], false);
    const mpBefore = state.members[0].mp;
    const { state: s2, events } = submitRound(
      state,
      [
        {
          kind: "spell",
          memberId: "hero",
          spell: HIKIDAMA,
          targetId: state.enemies[0].id,
          outcome: { correct: false, critical: false },
        },
      ],
      mulberry32(1),
    );
    expect(s2.members[0].mp).toBe(mpBefore);
    expect(events.some((e) => e.type === "spellFizzle")).toBe(true);
    /* 敵からの反撃はあるが、こちらの呪文ダメージは無い */
    expect(
      events.filter((e) => e.type === "attack" && !e.onParty).length,
    ).toBe(0);
  });

  it("successful spell consumes MP and damages", () => {
    const state = createBattle([HERO], [{ ...KESHIGOMUN, hp: 50 }], false);
    const { state: s2, events } = submitRound(
      state,
      [
        {
          kind: "spell",
          memberId: "hero",
          spell: HIKIDAMA,
          targetId: state.enemies[0].id,
          outcome: { correct: true, critical: true },
        },
      ],
      mulberry32(1),
    );
    expect(s2.members[0].mp).toBeLessThan(state.members[0].mp);
    expect(events.some((e) => e.type === "spellSuccess" && e.critical)).toBe(true);
    expect(s2.enemies[0].hp).toBeLessThan(50);
  });

  it("flee always succeeds against non-boss", () => {
    const state = createBattle([HERO], [KESHIGOMUN, KESHIGOMUN], false);
    const { state: s2, events } = submitRound(
      state,
      [{ kind: "flee", memberId: "hero" }],
      mulberry32(1),
    );
    expect(s2.phase).toBe("fled");
    expect(events.some((e) => e.type === "fled")).toBe(true);
  });

  it("flee fails against boss and battle continues", () => {
    const state = createBattle([HERO], [{ ...KESHIGOMUN, hp: 100 }], true);
    const { state: s2, events } = submitRound(
      state,
      [{ kind: "flee", memberId: "hero" }],
      mulberry32(1),
    );
    expect(s2.phase).toBe("command");
    expect(events.some((e) => e.type === "fleeFailed")).toBe(true);
  });

  it("party loses when hp reaches 0", () => {
    const weak: PartyMember = { ...HERO, level: 1, hp: 1, mp: 0 };
    const brute: MonsterDef = { ...KESHIGOMUN, hp: 100, atk: 50, agi: 99 };
    let state = createBattle([weak], [brute], false);
    /* 敵が先手で殴ってくる */
    const { state: s2, events } = submitRound(
      state,
      [{ kind: "defend", memberId: "hero" }],
      mulberry32(1),
    );
    expect(s2.phase).toBe("lost");
    expect(events.some((e) => e.type === "defeat")).toBe(true);
  });

  it("does not mutate the input state", () => {
    const state = createBattle([HERO], [KESHIGOMUN], false);
    const hpBefore = state.enemies[0].hp;
    submitRound(
      state,
      [{ kind: "attack", memberId: "hero", targetId: state.enemies[0].id }],
      mulberry32(1),
    );
    expect(state.enemies[0].hp).toBe(hpBefore);
    expect(state.phase).toBe("command");
  });
});

describe("applyVictory", () => {
  it("levels up with full heal and records the level-up", () => {
    const member: PartyMember = {
      memberId: "hero",
      level: 1,
      exp: 0,
      hp: 3,
      mp: 0,
      learnedSpells: [],
    };
    const battle = createBattle([member], [KESHIGOMUN], false);
    const bigExp = expForLevel(3);
    const result = applyVictory([member], battle, bigExp, 10);
    expect(result.party[0].level).toBe(3);
    expect(result.party[0].hp).toBe(heroStats(3).maxHp);
    expect(result.levelUps).toEqual([{ memberId: "hero", from: 1, to: 3 }]);
    expect(result.gold).toBe(10);
  });

  it("keeps battle-end hp when no level up", () => {
    const member: PartyMember = {
      memberId: "hero",
      level: 5,
      exp: expForLevel(5),
      hp: heroStats(5).maxHp,
      mp: heroStats(5).maxMp,
      learnedSpells: [],
    };
    const battle = createBattle([member], [KESHIGOMUN], false);
    battle.members[0].hp = 10; /* 戦闘でダメージを受けた状態 */
    const result = applyVictory([member], battle, 1, 0);
    expect(result.party[0].hp).toBe(10);
    expect(result.levelUps).toHaveLength(0);
  });
});

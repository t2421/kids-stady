import { describe, expect, it } from "vitest";
import type { MonsterDef, SpellDef } from "../src/content/types";
import { createBattle } from "../src/lib/battle/battle";
import {
  DEFAULT_SIM_OPTIONS,
  bestShopEquipment,
  buildParty,
  companionSpells,
  expectedAttackDamage,
  fightSequence,
  heroSpellsThrough,
  planRound,
  simulate,
} from "../src/lib/battle/simulate";
import { mulberry32 } from "../src/lib/curriculum/types";

const ATTACK: SpellDef = {
  id: "atk",
  name: "こうげき呪文",
  kind: "attack",
  mpCost: 2,
  power: 10,
  target: "enemy",
  skillIds: [],
  battleTimeLimitMs: 1,
  learnTest: { skillIds: [], questions: 1, passCount: 1 },
  description: "",
};

const BIG_ATTACK: SpellDef = { ...ATTACK, id: "big", name: "つよい呪文", mpCost: 4, power: 30 };
const HEAL: SpellDef = { ...ATTACK, id: "heal", name: "かいふく", kind: "heal", target: "ally" };

const LOOKUP = (id: string) => ({ atk: ATTACK, big: BIG_ATTACK, heal: HEAL })[id];

const DUMMY: MonsterDef = {
  id: "dummy",
  name: "ダミー",
  art: "keshigomun",
  hp: 30,
  atk: 6,
  def: 2,
  agi: 1,
  exp: 5,
  gold: 1,
  actions: [{ kind: "attack", weight: 1 }],
};

const OPTS = { ...DEFAULT_SIM_OPTIONS, correctRate: 1 };

describe("buildParty", () => {
  it("全回復した PartyMember を組み立てる", () => {
    const [hero] = buildParty([{ memberId: "hero", spellIds: ["atk"], equipment: {} }], 5);
    expect(hero.level).toBe(5);
    expect(hero.hp).toBe(45);
    expect(hero.mp).toBe(16);
    expect(hero.learnedSpells).toEqual(["atk"]);
  });
});

describe("planRound", () => {
  it("味方が HP 50% 未満なら回復呪文を優先し、1ラウンド1回にとどめる", () => {
    const party = buildParty(
      [
        { memberId: "hero", spellIds: ["heal", "big"], equipment: {} },
        { memberId: "tasuku", spellIds: ["heal"], equipment: {} },
      ],
      5,
    );
    const state = createBattle(party, [DUMMY], true);
    const hurt = { ...state, members: state.members.map((m, i) => (i === 0 ? { ...m, hp: 5 } : m)) };
    const cmds = planRound(hurt, party, OPTS, mulberry32(1), LOOKUP);
    expect(cmds[0]).toMatchObject({ kind: "spell", spell: { id: "heal" }, targetId: "hero" });
    /* タスクは回復呪文しか持たず、回復枠は勇者が使ったので通常攻撃に落ちる */
    expect(cmds[1].kind).toBe("attack");
    expect(cmds.filter((c) => c.kind === "spell" && c.spell.id === "heal")).toHaveLength(1);
  });

  it("MPが足りる中で期待ダメージ最大の攻撃呪文を選ぶ", () => {
    const party = buildParty([{ memberId: "hero", spellIds: ["atk", "big"], equipment: {} }], 5);
    const state = createBattle(party, [DUMMY], true);
    const [cmd] = planRound(state, party, OPTS, mulberry32(1), LOOKUP);
    expect(cmd).toMatchObject({ kind: "spell", spell: { id: "big" } });
  });

  it("MP切れなら通常攻撃に落とす", () => {
    const party = buildParty([{ memberId: "hero", spellIds: ["big"], equipment: {} }], 5);
    const state = createBattle(party, [DUMMY], true);
    const dry = { ...state, members: state.members.map((m) => ({ ...m, mp: 1 })) };
    const [cmd] = planRound(dry, party, OPTS, mulberry32(1), LOOKUP);
    expect(cmd.kind).toBe("attack");
  });
});

describe("expectedAttackDamage", () => {
  it("全体攻撃は 80% × 敵数、連撃は hits 倍", () => {
    expect(expectedAttackDamage({ ...ATTACK, target: "allEnemies" }, 3)).toBe(24);
    expect(expectedAttackDamage({ ...ATTACK, hits: 3 }, 1)).toBe(30);
    expect(expectedAttackDamage(HEAL, 1)).toBe(0);
  });
});

describe("fightSequence / simulate", () => {
  it("連戦は勝ったときだけ次へ進み、ラウンド数を合算する", () => {
    const party = buildParty([{ memberId: "hero", spellIds: ["big"], equipment: {} }], 10);
    const result = fightSequence(party, [[DUMMY], [DUMMY]], OPTS, mulberry32(7), LOOKUP);
    expect(result.won).toBe(true);
    expect(result.rounds).toBeGreaterThanOrEqual(2);
  });

  it("同じ seed なら同じ結果 (再現性)", () => {
    const party = buildParty([{ memberId: "hero", spellIds: ["atk"], equipment: {} }], 3);
    const foe = { ...DUMMY, hp: 45, atk: 12 };
    const a = simulate(party, [[foe]], { runs: 50, seed: 3 }, LOOKUP);
    const b = simulate(party, [[foe]], { runs: 50, seed: 3 }, LOOKUP);
    expect(a).toEqual(b);
    expect(a.winRate).toBeGreaterThan(0);
    expect(a.winRate).toBeLessThan(1);
  });

  it("到底かなわない相手には勝率 0 で、maxRounds を超えずに終わる", () => {
    const party = buildParty([{ memberId: "hero", spellIds: [], equipment: {} }], 1);
    const wall = { ...DUMMY, hp: 100000, def: 9999, atk: 1 };
    const result = simulate(party, [[wall]], { runs: 3, maxRounds: 5 }, LOOKUP);
    expect(result.winRate).toBe(0);
    expect(result.avgRounds).toBe(5);
  });
});

describe("シナリオ組み立てヘルパ", () => {
  it("勇者の呪文は章1〜Nの累積、仲間は initialSpells のみ", () => {
    expect(heroSpellsThrough(1)).toContain("hikidama");
    expect(heroSpellsThrough(2)).toEqual(expect.arrayContaining(["hikidama", "kukudama"]));
    expect(heroSpellsThrough(1)).not.toContain("kukudama");
    expect(companionSpells("tasuku")).toEqual(["tashiria"]);
  });

  it("章の店売り最強装備を部位ごとに選ぶ", () => {
    expect(bestShopEquipment(1)).toEqual({
      weapon: "douNoTsurugi",
      armor: "kawaNoYoroi",
      shield: "kawaNoTate",
    });
    expect(bestShopEquipment(6)).toEqual({
      weapon: "pitagoraNoKen",
      armor: "pitagoraNoYoroi",
      shield: "suushouNoTate",
    });
  });
});

import { describe, expect, it } from "vitest";
import type { EventCommand } from "../src/content/types";
import { defaultSave, type SaveData } from "../src/lib/save";
import { evalCond, levelSignPages, startRun, step } from "../src/lib/events/runner";

describe("evalCond", () => {
  const flags = { done: true, count: 3, zero: 0, off: false };
  it("set", () => {
    expect(evalCond({ flag: "done", op: "set" }, flags)).toBe(true);
    expect(evalCond({ flag: "count", op: "set" }, flags)).toBe(true);
    expect(evalCond({ flag: "zero", op: "set" }, flags)).toBe(false);
    expect(evalCond({ flag: "off", op: "set" }, flags)).toBe(false);
    expect(evalCond({ flag: "missing", op: "set" }, flags)).toBe(false);
  });
  it("unset", () => {
    expect(evalCond({ flag: "missing", op: "unset" }, flags)).toBe(true);
    expect(evalCond({ flag: "off", op: "unset" }, flags)).toBe(true);
    expect(evalCond({ flag: "done", op: "unset" }, flags)).toBe(false);
  });
  it(">=", () => {
    expect(evalCond({ flag: "count", op: ">=", value: 3 }, flags)).toBe(true);
    expect(evalCond({ flag: "count", op: ">=", value: 4 }, flags)).toBe(false);
    expect(evalCond({ flag: "done", op: ">=", value: 1 }, flags)).toBe(false);
  });
  it("undefined cond is always true", () => {
    expect(evalCond(undefined, flags)).toBe(true);
  });

  describe("skill condition (LP-01/LP-04)", () => {
    const mastery = {
      g1_add_nc: { state: "can" },
      g1_add_carry: { state: "mastered" },
      g2_kuku: { state: "practicing" },
    };

    it("passes when actual state equals the required state", () => {
      expect(evalCond({ skill: "g1_add_nc", state: "can" }, flags, mastery)).toBe(true);
      expect(evalCond({ skill: "g1_add_carry", state: "mastered" }, flags, mastery)).toBe(true);
      expect(evalCond({ skill: "g2_kuku", state: "practicing" }, flags, mastery)).toBe(true);
    });

    it("passes when actual state is higher (>= semantics)", () => {
      expect(evalCond({ skill: "g1_add_nc", state: "practicing" }, flags, mastery)).toBe(true);
      expect(evalCond({ skill: "g1_add_carry", state: "can" }, flags, mastery)).toBe(true);
      expect(evalCond({ skill: "g1_add_carry", state: "none" }, flags, mastery)).toBe(true);
    });

    it("fails when actual state is lower than required", () => {
      expect(evalCond({ skill: "g2_kuku", state: "can" }, flags, mastery)).toBe(false);
      expect(evalCond({ skill: "g2_kuku", state: "mastered" }, flags, mastery)).toBe(false);
      expect(evalCond({ skill: "g1_add_nc", state: "mastered" }, flags, mastery)).toBe(false);
    });

    it("treats a skill missing from mastery as none", () => {
      expect(evalCond({ skill: "g3_div", state: "none" }, flags, mastery)).toBe(true);
      expect(evalCond({ skill: "g3_div", state: "practicing" }, flags, mastery)).toBe(false);
    });

    it("treats an omitted mastery argument entirely as none for every skill", () => {
      expect(evalCond({ skill: "g1_add_nc", state: "none" }, flags)).toBe(true);
      expect(evalCond({ skill: "g1_add_nc", state: "practicing" }, flags)).toBe(false);
    });

    it("orders none < practicing < can < mastered end to end", () => {
      const order = ["none", "practicing", "can", "mastered"] as const;
      for (let i = 0; i < order.length; i++) {
        for (let j = 0; j < order.length; j++) {
          const m = { skill: { state: order[i] } };
          expect(evalCond({ skill: "skill", state: order[j] }, flags, m)).toBe(i >= j);
        }
      }
    });
  });
});

describe("event runner", () => {
  it("applies data commands silently and stops at UI commands", () => {
    const commands: EventCommand[] = [
      { type: "setFlag", flag: "c1.met" },
      { type: "giveGold", amount: 50 },
      { type: "giveItem", itemId: "yakusou", count: 2 },
      { type: "message", pages: ["こんにちは!", "げんきかい?"] },
      { type: "setFlag", flag: "c1.talked", value: 2 },
    ];
    let st = startRun(commands, defaultSave());
    const r1 = step(st);
    expect(r1.effect).toEqual({
      kind: "message",
      pages: ["こんにちは!", "げんきかい?"],
    });
    expect(r1.state.save.flags["c1.met"]).toBe(true);
    expect(r1.state.save.inventory.gold).toBe(50);
    expect(r1.state.save.inventory.items.yakusou).toBe(2);
    expect(r1.done).toBe(false);

    const r2 = step(r1.state);
    expect(r2.done).toBe(true);
    expect(r2.state.save.flags["c1.talked"]).toBe(2);
  });

  it("learnSpell adds once and is idempotent", () => {
    const commands: EventCommand[] = [
      { type: "learnSpell", memberId: "hero", spellId: "hikidama" },
      { type: "learnSpell", memberId: "hero", spellId: "hikidama" },
      { type: "learnSpell", memberId: "ghost", spellId: "tashiria" },
    ];
    const r = step(startRun(commands, defaultSave()));
    expect(r.done).toBe(true);
    expect(r.state.save.party[0].learnedSpells).toEqual(["hikidama"]);
  });

  it("joinParty appends a member with initial spells (idempotent)", () => {
    const commands: EventCommand[] = [
      { type: "joinParty", memberId: "tasuku", level: 3 },
      { type: "joinParty", memberId: "tasuku", level: 5 },
    ];
    const r = step(startRun(commands, defaultSave()));
    expect(r.done).toBe(true);
    expect(r.state.save.party).toHaveLength(2);
    const tasuku = r.state.save.party[1];
    expect(tasuku.memberId).toBe("tasuku");
    expect(tasuku.level).toBe(3);
    expect(tasuku.learnedSpells).toContain("tashiria");
    /* 勇者は先頭のまま (E2E/表示の前提) */
    expect(r.state.save.party[0].memberId).toBe("hero");
  });

  it("advanceChapter raises current and records cleared", () => {
    const commands: EventCommand[] = [{ type: "advanceChapter", chapter: 2 }];
    const r = step(startRun(commands, defaultSave()));
    expect(r.state.save.chapter.current).toBe(2);
    expect(r.state.save.chapter.cleared).toContain(1);
    /* すでに章3なら下げない */
    const r2 = step(
      startRun(commands, {
        ...defaultSave(),
        chapter: { current: 3, cleared: [1, 2] },
      }),
    );
    expect(r2.state.save.chapter.current).toBe(3);
  });

  it("giveItem accumulates", () => {
    const commands: EventCommand[] = [
      { type: "giveItem", itemId: "yakusou" },
      { type: "giveItem", itemId: "yakusou", count: 3 },
    ];
    const r = step(startRun(commands, defaultSave()));
    expect(r.done).toBe(true);
    expect(r.state.save.inventory.items.yakusou).toBe(4);
  });

  it("choice branches yes/no", () => {
    const commands: EventCommand[] = [
      {
        type: "choice",
        prompt: "やすんでいく?",
        yes: [
          { type: "setFlag", flag: "rested" },
          { type: "message", pages: ["ぐっすり ねむった!"] },
        ],
        no: [{ type: "message", pages: ["また きてね"] }],
      },
      { type: "setFlag", flag: "after" },
    ];
    let r = step(startRun(commands, defaultSave()));
    expect(r.effect?.kind).toBe("choice");

    /* yes 側 */
    r = step(r.state, { choice: "yes" });
    expect(r.effect).toEqual({ kind: "message", pages: ["ぐっすり ねむった!"] });
    expect(r.state.save.flags.rested).toBe(true);
    r = step(r.state);
    expect(r.done).toBe(true);
    expect(r.state.save.flags.after).toBe(true);
  });

  it("choice no-branch runs then continues after", () => {
    const commands: EventCommand[] = [
      {
        type: "choice",
        prompt: "かう?",
        yes: [{ type: "giveGold", amount: -10 }],
        no: [],
      },
      { type: "message", pages: ["おわり"] },
    ];
    let r = step(startRun(commands, defaultSave()));
    r = step(r.state, { choice: "no" });
    expect(r.effect).toEqual({ kind: "message", pages: ["おわり"] });
  });

  it("battle effect carries monsterIds and winFlag", () => {
    const commands: EventCommand[] = [
      { type: "battle", monsterIds: ["keshigomun"], boss: true, winFlag: "c1.boss" },
    ];
    const r = step(startRun(commands, defaultSave()));
    expect(r.effect).toEqual({
      kind: "battle",
      monsterIds: ["keshigomun"],
      boss: true,
      winFlag: "c1.boss",
    });
  });

  it("openDrillBoard surfaces as a UI effect then continues", () => {
    const commands: EventCommand[] = [
      { type: "openDrillBoard" },
      { type: "setFlag", flag: "after" },
    ];
    let r = step(startRun(commands, defaultSave()));
    expect(r.effect).toEqual({ kind: "openDrillBoard" });
    r = step(r.state);
    expect(r.done).toBe(true);
    expect(r.state.save.flags.after).toBe(true);
  });

  it("openReviewQuest surfaces as a UI effect then continues", () => {
    const commands: EventCommand[] = [
      { type: "openReviewQuest" },
      { type: "setFlag", flag: "after" },
    ];
    let r = step(startRun(commands, defaultSave()));
    expect(r.effect).toEqual({ kind: "openReviewQuest" });
    r = step(r.state);
    expect(r.done).toBe(true);
    expect(r.state.save.flags.after).toBe(true);
  });

  it("openLesson/openReview/openPreview surface as UI effects then continue", () => {
    const commands: EventCommand[] = [
      { type: "openLesson", skillId: "g1_add_nc" },
      { type: "openReview" },
      { type: "openPreview" },
      { type: "setFlag", flag: "after" },
    ];
    let r = step(startRun(commands, defaultSave()));
    expect(r.effect).toEqual({ kind: "openLesson", skillId: "g1_add_nc" });
    r = step(r.state);
    expect(r.effect).toEqual({ kind: "openReview" });
    r = step(r.state);
    expect(r.effect).toEqual({ kind: "openPreview" });
    r = step(r.state);
    expect(r.done).toBe(true);
    expect(r.state.save.flags.after).toBe(true);
  });

  /* LP-19: なかまが教える場面が使う openLesson の entry/skipReadiness が effect まで往復する */
  it("openLesson passes entry and skipReadiness through to the effect (LP-19)", () => {
    const commands: EventCommand[] = [
      {
        type: "openLesson",
        skillId: "g2_add_column",
        entry: "concept",
        skipReadiness: true,
      },
      { type: "setFlag", flag: "after" },
    ];
    let r = step(startRun(commands, defaultSave()));
    expect(r.effect).toEqual({
      kind: "openLesson",
      skillId: "g2_add_column",
      entry: "concept",
      skipReadiness: true,
    });
    r = step(r.state);
    expect(r.done).toBe(true);
    expect(r.state.save.flags.after).toBe(true);
  });

  it("openTeacherMenu surfaces the entries as a UI effect then continues (LP-18)", () => {
    const entries = [
      { skillId: "g1_add_nc", label: "たしざん" },
      { skillId: "g1_sub_nc", label: "ひきざん", spellIds: ["hikidama"] },
    ];
    const commands: EventCommand[] = [
      { type: "openTeacherMenu", entries },
      { type: "setFlag", flag: "after" },
    ];
    let r = step(startRun(commands, defaultSave()));
    expect(r.effect).toEqual({ kind: "openTeacherMenu", entries });
    r = step(r.state);
    expect(r.done).toBe(true);
    expect(r.state.save.flags.after).toBe(true);
  });

  it("transfer aborts remaining commands", () => {
    const commands: EventCommand[] = [
      { type: "transfer", mapId: "dev-field", spawn: "from-village" },
      { type: "setFlag", flag: "never" },
    ];
    let r = step(startRun(commands, defaultSave()));
    expect(r.effect?.kind).toBe("transfer");
    r = step(r.state);
    expect(r.done).toBe(true);
    expect(r.state.save.flags.never).toBeUndefined();
  });

  it("does not mutate the input save (immutability)", () => {
    const base = defaultSave();
    const commands: EventCommand[] = [{ type: "giveGold", amount: 100 }];
    step(startRun(commands, base));
    expect(base.inventory.gold).toBe(0);
  });
});

describe("exchange (メダル交換所)", () => {
  const withMedals = (n: number): SaveData => {
    const base = defaultSave();
    return {
      ...base,
      inventory: { ...base.inventory, items: { ...base.inventory.items, hiramekiMedal: n } },
    };
  };
  const trade: EventCommand = {
    type: "exchange",
    itemId: "hiramekiMedal",
    count: 3,
    give: { itemId: "kawaNoYoroi" },
    onDone: [{ type: "message", pages: ["こうかん せいりつ!"] }],
    onShort: [{ type: "message", pages: ["メダルが たりないよ。"] }],
  };

  it("enough: removes count, gives the item, runs onDone", () => {
    let r = step(startRun([trade, { type: "setFlag", flag: "after" }], withMedals(5)));
    expect(r.effect).toEqual({ kind: "message", pages: ["こうかん せいりつ!"] });
    expect(r.state.save.inventory.items.hiramekiMedal).toBe(2);
    expect(r.state.save.inventory.items.kawaNoYoroi).toBe(1);
    r = step(r.state);
    expect(r.done).toBe(true);
    expect(r.state.save.flags.after).toBe(true);
  });

  it("not enough: nothing changes, runs onShort", () => {
    const r = step(startRun([trade], withMedals(2)));
    expect(r.effect).toEqual({ kind: "message", pages: ["メダルが たりないよ。"] });
    expect(r.state.save.inventory.items.hiramekiMedal).toBe(2);
    expect(r.state.save.inventory.items.kawaNoYoroi).toBeUndefined();
  });

  it("exact: spends everything and drops the emptied key", () => {
    const r = step(startRun([trade], withMedals(3)));
    expect(r.effect?.kind).toBe("message");
    expect("hiramekiMedal" in r.state.save.inventory.items).toBe(false);
    expect(r.state.save.inventory.items.kawaNoYoroi).toBe(1);
  });

  it("give.count stacks onto an existing stock; missing branches just continue", () => {
    const base = withMedals(4);
    const withArmor: SaveData = {
      ...base,
      inventory: { ...base.inventory, items: { ...base.inventory.items, kawaNoYoroi: 2 } },
    };
    const r = step(
      startRun(
        [
          { type: "exchange", itemId: "hiramekiMedal", count: 1, give: { itemId: "kawaNoYoroi", count: 2 } },
          { type: "exchange", itemId: "hiramekiMedal", count: 99, give: { itemId: "yakusou" } },
          { type: "setFlag", flag: "after" },
        ],
        withArmor,
      ),
    );
    expect(r.done).toBe(true);
    expect(r.state.save.inventory.items.kawaNoYoroi).toBe(4);
    expect(r.state.save.inventory.items.hiramekiMedal).toBe(3);
    expect(r.state.save.inventory.items.yakusou).toBeUndefined();
    expect(r.state.save.flags.after).toBe(true);
  });

  it("does not mutate the input save", () => {
    const base = withMedals(3);
    step(startRun([trade], base));
    expect(base.inventory.items.hiramekiMedal).toBe(3);
    expect(base.inventory.items.kawaNoYoroi).toBeUndefined();
  });
});

describe("levelSign (ボス前の すいしょうレベル看板)", () => {
  const withHeroLevel = (level: number) => {
    const base = defaultSave();
    return {
      ...base,
      party: base.party.map((m) => (m.memberId === "hero" ? { ...m, level } : m)),
    };
  };

  it("below the recommended level: 3 pages ending with the まなびや nudge", () => {
    const commands: EventCommand[] = [
      { type: "levelSign", level: 10 },
      { type: "setFlag", flag: "after" },
    ];
    let r = step(startRun(commands, withHeroLevel(4)));
    expect(r.effect).toEqual({
      kind: "message",
      pages: [
        "たてふだ: 『この さきは つよい てき。すいしょう Lv 10』",
        "いまの ゆうしゃは Lv 4。",
        "まず まなびやか おだいで きたえよう!",
      ],
    });
    expect(r.done).toBe(false);
    r = step(r.state);
    expect(r.done).toBe(true);
    expect(r.state.save.flags.after).toBe(true);
  });

  it("at or above the recommended level: ready message", () => {
    const r = step(startRun([{ type: "levelSign", level: 10 }], withHeroLevel(10)));
    expect(r.effect?.kind).toBe("message");
    if (r.effect?.kind !== "message") throw new Error("unreachable");
    expect(r.effect.pages[1]).toBe("いまの ゆうしゃは Lv 10。");
    expect(r.effect.pages[2]).toBe("じゅんびは ばっちりだ!");
    const above = levelSignPages(10, withHeroLevel(12));
    expect(above[2]).toBe("じゅんびは ばっちりだ!");
  });

  it("does not touch the save", () => {
    const base = withHeroLevel(3);
    const r = step(startRun([{ type: "levelSign", level: 10 }], base));
    expect(r.state.save).toEqual(base);
  });
});

describe("ending (本編クリア)", () => {
  it("ending effect を返し、ランを終了する", () => {
    const commands: EventCommand[] = [
      { type: "message", pages: ["おしまい"] },
      { type: "setFlag", flag: "c6.clear" },
      { type: "ending" },
      { type: "message", pages: ["ここは表示されない"] },
    ];
    const r1 = step(startRun(commands, defaultSave()));
    expect(r1.effect).toEqual({ kind: "message", pages: ["おしまい"] });
    const r2 = step(r1.state);
    expect(r2.effect).toEqual({ kind: "ending" });
    expect(r2.done).toBe(false);
    expect(r2.state.save.flags["c6.clear"]).toBe(true);
    /* 後続の UI コマンドは打ち切られる */
    const r3 = step(r2.state);
    expect(r3.done).toBe(true);
    expect(r3.effect).toBeNull();
  });

  it("ending の後ろに残るデータ操作 (onceFlag の setFlag など) は適用する", () => {
    const commands: EventCommand[] = [
      { type: "ending" },
      { type: "message", pages: ["表示されない"] },
      { type: "setFlag", flag: "c6.bossDefeated" },
      { type: "giveGold", amount: 10 },
    ];
    const r = step(startRun(commands, defaultSave()));
    expect(r.effect).toEqual({ kind: "ending" });
    expect(r.state.save.flags["c6.bossDefeated"]).toBe(true);
    expect(r.state.save.inventory.gold).toBe(10);
    expect(r.state.stack).toEqual([]);
  });

  it("choice の枝の中の ending でも外側フレームのデータ操作を拾う", () => {
    const commands: EventCommand[] = [
      {
        type: "choice",
        prompt: "おわる?",
        yes: [{ type: "ending" }],
        no: [],
      },
      { type: "setFlag", flag: "outer" },
    ];
    const r1 = step(startRun(commands, defaultSave()));
    expect(r1.effect?.kind).toBe("choice");
    const r2 = step(r1.state, { choice: "yes" });
    expect(r2.effect).toEqual({ kind: "ending" });
    expect(r2.state.save.flags.outer).toBe(true);
  });
});

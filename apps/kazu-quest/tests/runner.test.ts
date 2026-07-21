import { describe, expect, it } from "vitest";
import type { EventCommand } from "../src/content/types";
import { defaultSave } from "../src/lib/save";
import { evalCond, startRun, step } from "../src/lib/events/runner";

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

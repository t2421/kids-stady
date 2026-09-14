import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorageStub } from "./localStorageStub";
import { defaultSave, loadSave } from "../src/lib/save";
import { addPlaytime, clampPlaytimeDelta, PLAYTIME_MAX_DELTA_MS } from "../src/lib/playtime";
import { autosave, getSave, startSession, tickPlaytime } from "../src/game/session";

beforeEach(() => {
  installLocalStorageStub();
  startSession("p1");
});

describe("clampPlaytimeDelta", () => {
  it("通常のフレーム delta はそのまま", () => {
    expect(clampPlaytimeDelta(16.7)).toBe(16.7);
    expect(clampPlaytimeDelta(PLAYTIME_MAX_DELTA_MS)).toBe(PLAYTIME_MAX_DELTA_MS);
  });

  it("タブ復帰などの巨大 delta は上限で頭打ち", () => {
    expect(clampPlaytimeDelta(45_000)).toBe(PLAYTIME_MAX_DELTA_MS);
  });

  it("負数 / NaN / Infinity は 0", () => {
    expect(clampPlaytimeDelta(-100)).toBe(0);
    expect(clampPlaytimeDelta(Number.NaN)).toBe(0);
    expect(clampPlaytimeDelta(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("addPlaytime", () => {
  it("不変更新で加算する", () => {
    const before = { ...defaultSave(), playtimeMs: 500 };
    const after = addPlaytime(before, 16);
    expect(after.playtimeMs).toBe(516);
    expect(before.playtimeMs).toBe(500);
    expect(after).not.toBe(before);
  });

  it("delta 0 のときは同じオブジェクトを返す", () => {
    const before = defaultSave();
    expect(addPlaytime(before, 0)).toBe(before);
  });
});

describe("tickPlaytime", () => {
  it("フレームごとに playtimeMs が積み上がる", () => {
    expect(getSave().playtimeMs).toBe(0);
    for (let i = 0; i < 60; i++) tickPlaytime(16);
    expect(getSave().playtimeMs).toBe(960);
  });

  it("巨大 delta は 1 フレームあたり上限までしか増えない", () => {
    tickPlaytime(120_000);
    expect(getSave().playtimeMs).toBe(PLAYTIME_MAX_DELTA_MS);
  });

  it("autosave で localStorage に書かれ、再読込しても残る", () => {
    tickPlaytime(700);
    tickPlaytime(300);
    autosave();
    expect(loadSave("p1").playtimeMs).toBe(1000);
  });
});

/* document を差し替えるので、guard が一度だけ登録される性質上 最後に置く */
describe("tickPlaytime while the tab is hidden", () => {
  it("document.hidden の間は加算せず、復帰したら再開する", () => {
    const listeners: Array<() => void> = [];
    const fakeDocument = {
      hidden: true,
      addEventListener: (_type: string, cb: () => void) => {
        listeners.push(cb);
      },
    };
    Object.defineProperty(globalThis, "document", {
      value: fakeDocument,
      configurable: true,
    });
    try {
      tickPlaytime(500);
      expect(getSave().playtimeMs).toBe(0);
      expect(listeners).toHaveLength(1);

      fakeDocument.hidden = false;
      listeners.forEach((cb) => cb());
      tickPlaytime(500);
      expect(getSave().playtimeMs).toBe(500);

      fakeDocument.hidden = true;
      listeners.forEach((cb) => cb());
      tickPlaytime(500);
      expect(getSave().playtimeMs).toBe(500);
    } finally {
      delete (globalThis as { document?: unknown }).document;
    }
  });
});

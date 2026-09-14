import { describe, expect, it, vi } from "vitest";
import type { UiScene } from "../src/game/scenes/UiScene";

/*
 * lessonFlow.ts / spellTestFlow.ts の分岐テスト (LP-08〜09)。どちらも
 * "../EventBus" 経由で Phaser の Events.EventEmitter を使うが、`phaser`
 * パッケージは読み込み時にブラウザ判定で `window` を触るため、vitest の既定
 * (node) 環境では `import { Events } from "phaser"` の時点で落ちる (jsdom 等は
 * 入れていない — docs/kazu-quest-learning-tasks.md の方針どおり最小依存を保つ)。
 * ここでは "../src/game/EventBus" を軽量な自前 pub/sub にモックし、
 * 両ファイルのロジックだけを Phaser 抜きで検証する。
 */
vi.mock("../src/game/EventBus", () => {
  const listeners = new Map<string, Set<(payload: unknown) => void>>();
  const EventBus = {
    on(event: string, cb: (payload: unknown) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(cb);
    },
    off(event: string, cb: (payload: unknown) => void) {
      listeners.get(event)?.delete(cb);
    },
    emit(event: string, payload?: unknown) {
      for (const cb of listeners.get(event) ?? []) cb(payload);
    },
  };
  return { EventBus };
});

const { EventBus } = await import("../src/game/EventBus");
const { handleOpenLesson, handleOpenPreview, handleOpenReview } = await import(
  "../src/game/field/lessonFlow"
);
const { handleSpellTest, PRACTICE_BEFORE_TEST_PROMPT } = await import(
  "../src/game/field/spellTestFlow"
);
const { getSave, updateSave } = await import("../src/game/session");
const { defaultSave } = await import("../src/lib/save");

function mockUi(): UiScene {
  return {
    showMessage: vi.fn((_pages: string[], onDone: () => void) => onDone()),
  } as unknown as UiScene;
}

/* showChoice も持つ版 (従来の とっくん/テスト 分岐の検証用) */
function mockUiWithChoice(): UiScene {
  return {
    showMessage: vi.fn((_pages: string[], onDone: () => void) => onDone()),
    showChoice: vi.fn((_prompt: string, _onChoice: (yes: boolean) => void) => {}),
  } as unknown as UiScene;
}

describe("handleOpenLesson", () => {
  it("レッスンが未登録の単元は じゅんびちゅう メッセージで advance する", () => {
    const ui = mockUi();
    const advance = vi.fn();
    handleOpenLesson(ui, "g6_speed", advance);
    expect(ui.showMessage).toHaveBeenCalledWith(
      ["じゅんびちゅう…"],
      expect.any(Function),
    );
    expect(advance).toHaveBeenCalledTimes(1);
  });

  it("レッスンが登録済みの単元は open-lesson を発火し、lesson-finished で advance する", () => {
    const ui = mockUi();
    const advance = vi.fn();
    const onOpen = vi.fn();
    EventBus.on("open-lesson", onOpen);

    handleOpenLesson(ui, "g1_add_nc", advance);

    expect(ui.showMessage).not.toHaveBeenCalled();
    expect(onOpen).toHaveBeenCalledWith({ skillId: "g1_add_nc", entry: "story" });
    expect(advance).not.toHaveBeenCalled();

    EventBus.emit("lesson-finished", {
      skillId: "g1_add_nc",
      outcome: "passed",
      correct: 2,
      total: 2,
    });
    expect(advance).toHaveBeenCalledTimes(1);

    EventBus.off("open-lesson", onOpen);
  });

  it("別 skillId の lesson-finished では advance しない", () => {
    const ui = mockUi();
    const advance = vi.fn();
    handleOpenLesson(ui, "g1_add_nc", advance);

    EventBus.emit("lesson-finished", {
      skillId: "g1_sub_nc",
      outcome: "passed",
      correct: 1,
      total: 1,
    });
    expect(advance).not.toHaveBeenCalled();

    EventBus.emit("lesson-finished", {
      skillId: "g1_add_nc",
      outcome: "passed",
      correct: 2,
      total: 2,
    });
    expect(advance).toHaveBeenCalledTimes(1);
  });
});

describe("handleSpellTest (LP-09: レッスンがある単元への委譲)", () => {
  it("学習テスト対象単元にレッスンがある呪文 (tashiria → g1_add_nc) は従来のとっくん/テストを使わず open-lesson に委譲する", () => {
    updateSave(() => defaultSave());
    const ui = mockUiWithChoice();
    const advance = vi.fn();
    const onOpenLesson = vi.fn();
    EventBus.on("open-lesson", onOpenLesson);

    handleSpellTest(ui, "tashiria", advance);

    /* 従来の「とっくんしてから テストする?」は出さず、open-lesson を発火する */
    expect(ui.showChoice).not.toHaveBeenCalled();
    expect(onOpenLesson).toHaveBeenCalledWith({ skillId: "g1_add_nc", entry: "story" });
    expect(advance).not.toHaveBeenCalled();

    EventBus.off("open-lesson", onOpenLesson);
  });

  it("レッスンの lesson-finished {outcome:\"passed\"} を合格として扱い、learnSpell + advance する", () => {
    updateSave(() => defaultSave());
    const ui = mockUiWithChoice();
    const advance = vi.fn();

    handleSpellTest(ui, "tashiria", advance);
    expect(getSave().party[0].learnedSpells).not.toContain("tashiria");

    EventBus.emit("lesson-finished", {
      skillId: "g1_add_nc",
      outcome: "passed",
      correct: 8,
      total: 10,
    });

    expect(getSave().party[0].learnedSpells).toContain("tashiria");
    expect(getSave().flags["learned.tashiria"]).toBe(true);
    expect(ui.showMessage).toHaveBeenCalled();
    expect(advance).toHaveBeenCalledTimes(1);
  });

  it("別 skillId の lesson-finished では反応しない", () => {
    updateSave(() => defaultSave());
    const ui = mockUiWithChoice();
    const advance = vi.fn();

    handleSpellTest(ui, "tashiria", advance);
    EventBus.emit("lesson-finished", {
      skillId: "g1_sub_nc",
      outcome: "passed",
      correct: 8,
      total: 10,
    });

    expect(getSave().party[0].learnedSpells).not.toContain("tashiria");
    expect(advance).not.toHaveBeenCalled();
  });

  it("レッスンが無い単元の呪文 (hikidama → g1_sub_nc) は従来どおり とっくん/テストの確認を出す", () => {
    updateSave(() => defaultSave());
    const ui = mockUiWithChoice();
    const advance = vi.fn();
    const onOpenLesson = vi.fn();
    EventBus.on("open-lesson", onOpenLesson);

    handleSpellTest(ui, "hikidama", advance);

    expect(onOpenLesson).not.toHaveBeenCalled();
    expect(ui.showChoice).toHaveBeenCalledWith(
      PRACTICE_BEFORE_TEST_PROMPT,
      expect.any(Function),
    );

    EventBus.off("open-lesson", onOpenLesson);
  });

  it("すでに習得済みの呪文はレッスン/テストどちらも開かず advance する", () => {
    const base = defaultSave();
    updateSave(() => ({
      ...base,
      party: base.party.map((m, i) =>
        i === 0 ? { ...m, learnedSpells: ["tashiria"] } : m,
      ),
    }));
    const ui = mockUiWithChoice();
    const advance = vi.fn();
    const onOpenLesson = vi.fn();
    EventBus.on("open-lesson", onOpenLesson);

    handleSpellTest(ui, "tashiria", advance);

    expect(onOpenLesson).not.toHaveBeenCalled();
    expect(ui.showChoice).not.toHaveBeenCalled();
    expect(ui.showMessage).toHaveBeenCalledWith(
      ["その じゅもんは もう おぼえているよ!"],
      expect.any(Function),
    );
    expect(advance).toHaveBeenCalledTimes(1);

    EventBus.off("open-lesson", onOpenLesson);
  });
});

describe("handleOpenReview / handleOpenPreview", () => {
  it("どちらも じゅんびちゅう メッセージで advance する (LP-11 まで暫定)", () => {
    const ui = mockUi();
    const advance = vi.fn();
    handleOpenReview(ui, advance);
    expect(ui.showMessage).toHaveBeenCalledWith(
      ["じゅんびちゅう…"],
      expect.any(Function),
    );
    expect(advance).toHaveBeenCalledTimes(1);

    const ui2 = mockUi();
    const advance2 = vi.fn();
    handleOpenPreview(ui2, advance2);
    expect(ui2.showMessage).toHaveBeenCalledWith(
      ["じゅんびちゅう…"],
      expect.any(Function),
    );
    expect(advance2).toHaveBeenCalledTimes(1);
  });
});

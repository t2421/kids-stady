import { describe, expect, it, vi } from "vitest";
import type { UiScene } from "../src/game/scenes/UiScene";

/*
 * lessonFlow.ts の分岐テスト (LP-08)。lessonFlow.ts は "../EventBus" 経由で
 * Phaser の Events.EventEmitter を使うが、`phaser` パッケージは読み込み時に
 * ブラウザ判定で `window` を触るため、vitest の既定 (node) 環境では
 * `import { Events } from "phaser"` の時点で落ちる (jsdom 等は入れていない —
 * docs/kazu-quest-learning-tasks.md の方針どおり最小依存を保つ)。
 * ここでは "../src/game/EventBus" を軽量な自前 pub/sub にモックし、
 * lessonFlow.ts のロジックだけを Phaser 抜きで検証する。
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

function mockUi(): UiScene {
  return {
    showMessage: vi.fn((_pages: string[], onDone: () => void) => onDone()),
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

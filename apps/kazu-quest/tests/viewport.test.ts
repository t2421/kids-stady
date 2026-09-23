import { describe, expect, it } from "vitest";
import { gameHeightForViewport, MAX_GAME_HEIGHT, MIN_GAME_HEIGHT } from "../src/game/viewport";

describe("gameHeightForViewport", () => {
  it("fills a 4:3 iPad instead of letterboxing a 16:9 canvas", () => {
    expect(gameHeightForViewport(1080, 810)).toBe(720);
    expect(gameHeightForViewport(1024, 768)).toBe(720);
  });

  it("keeps 540 on 16:9 and wider screens", () => {
    expect(gameHeightForViewport(1280, 720)).toBe(540);
    expect(gameHeightForViewport(2560, 1080)).toBe(MIN_GAME_HEIGHT);
  });

  it("is clamped, even, and safe on odd input", () => {
    expect(gameHeightForViewport(1180, 820)).toBe(668);
    expect(gameHeightForViewport(400, 900)).toBe(MAX_GAME_HEIGHT);
    expect(gameHeightForViewport(0, 0)).toBe(MIN_GAME_HEIGHT);
    expect(gameHeightForViewport(1181, 820) % 2).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { tapStepFor } from "../src/game/field/tapStep";

describe("tapStepFor", () => {
  it("returns the direction of an adjacent tile", () => {
    expect(tapStepFor(5, 5, 5, 4)).toBe("up");
    expect(tapStepFor(5, 5, 5, 6)).toBe("down");
    expect(tapStepFor(5, 5, 4, 5)).toBe("left");
    expect(tapStepFor(5, 5, 6, 5)).toBe("right");
  });

  it("returns the direction of a distant tile on the same axis", () => {
    expect(tapStepFor(5, 5, 5, 0)).toBe("up");
    expect(tapStepFor(5, 5, 12, 5)).toBe("right");
  });

  it("prefers the larger axis on diagonal taps", () => {
    expect(tapStepFor(5, 5, 8, 6)).toBe("right");
    expect(tapStepFor(5, 5, 2, 4)).toBe("left");
    expect(tapStepFor(5, 5, 6, 9)).toBe("down");
    expect(tapStepFor(5, 5, 4, 1)).toBe("up");
  });

  it("falls back to the vertical axis on an exact diagonal", () => {
    expect(tapStepFor(5, 5, 6, 6)).toBe("down");
    expect(tapStepFor(5, 5, 4, 4)).toBe("up");
  });

  it("returns null for the hero's own tile", () => {
    expect(tapStepFor(5, 5, 5, 5)).toBeNull();
    expect(tapStepFor(0, 0, 0, 0)).toBeNull();
  });
});

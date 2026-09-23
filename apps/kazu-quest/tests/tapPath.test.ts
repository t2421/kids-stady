/*
 * タップした場所まで歩く道。以前は タップ1回 = 1歩だけ で、遠くの村人を
 * タップしても 1歩しか 動かなかった (iPad の UX 監査で発覚)。
 */

import { describe, expect, it } from "vitest";
import { findTapPath } from "../src/game/field/tapPath";

/* # = 壁, N = 村人 (歩けない), . = 歩ける */
function grid(rows: string[]) {
  return (x: number, y: number) => rows[y]?.[x] === ".";
}

describe("findTapPath", () => {
  it("walks straight to an open tile", () => {
    const walk = grid(["......"]);
    expect(findTapPath({ x: 0, y: 0 }, { x: 4, y: 0 }, walk)?.steps).toEqual([
      "right",
      "right",
      "right",
      "right",
    ]);
  });

  it("goes around walls on the shortest route", () => {
    const walk = grid([
      ".#...",
      ".#.#.",
      "...#.",
    ]);
    const path = findTapPath({ x: 0, y: 0 }, { x: 2, y: 0 }, walk)!;
    expect(path.steps).toEqual(["down", "down", "right", "right", "up", "up"]);
    expect(path.faceAtEnd).toBeNull();
  });

  it("stops next to a villager and faces them", () => {
    const walk = grid([
      "......",
      "....N.",
    ]);
    const path = findTapPath({ x: 0, y: 1 }, { x: 4, y: 1 }, walk)!;
    expect(path.steps).toEqual(["right", "right", "right"]);
    expect(path.faceAtEnd).toBe("right");
  });

  it("returns null for the hero's own tile, unreachable or too-far targets", () => {
    const walk = grid(["..#.."]);
    expect(findTapPath({ x: 0, y: 0 }, { x: 0, y: 0 }, walk)).toBeNull();
    expect(findTapPath({ x: 0, y: 0 }, { x: 4, y: 0 }, walk)).toBeNull();
    const long = grid(["." .repeat(60)]);
    expect(findTapPath({ x: 0, y: 0 }, { x: 59, y: 0 }, long, 40)).toBeNull();
  });
});

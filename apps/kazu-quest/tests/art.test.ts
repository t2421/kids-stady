import { describe, expect, it } from "vitest";
import type { PixelArt } from "../src/content/art/format";
import { ACTOR_ART } from "../src/content/art/actors";
import { TILE_ART, TILE_SIZE } from "../src/content/art/tiles";
import { artSize } from "../src/content/art/format";

function validateArt(name: string, art: PixelArt, expected: number) {
  const width = art.rows[0]?.length ?? 0;
  for (const row of art.rows) {
    expect(row.length, `${name}: 行の長さが不揃い`).toBe(width);
    for (const ch of row) {
      if (ch === ".") continue;
      expect(
        art.palette[ch],
        `${name}: パレットにない文字 "${ch}"`,
      ).toBeDefined();
    }
  }
  const { w, h } = artSize(art);
  expect(w, `${name}: 幅が ${expected}px でない`).toBe(expected);
  expect(h, `${name}: 高さが ${expected}px でない`).toBe(expected);
  for (const color of Object.values(art.palette)) {
    expect(color, `${name}: 色は #rrggbb`).toMatch(/^#[0-9a-f]{6}$/i);
  }
}

describe("tile art", () => {
  for (const [name, art] of Object.entries(TILE_ART)) {
    it(`tile-${name} is a valid ${TILE_SIZE}x${TILE_SIZE} sprite`, () => {
      validateArt(name, art, TILE_SIZE);
    });
  }
});

describe("actor art", () => {
  for (const [name, art] of Object.entries(ACTOR_ART)) {
    it(`actor-${name} is a valid 16x16 sprite`, () => {
      validateArt(name, art, 16);
    });
  }
});

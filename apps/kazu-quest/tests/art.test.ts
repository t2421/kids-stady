import { describe, expect, it } from "vitest";
import type { PixelArt } from "../src/content/art/format";
import { ACTOR_ART } from "../src/content/art/actors";
import { MONSTER_ART } from "../src/content/art/monsters";
import { EFFECT_ART } from "../src/content/art/effects";
import {
  isNegariaStagedArt,
  negariaStageArtKey,
  TILE_ART,
  TILE_SIZE,
} from "../src/content/art/tiles";
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

describe("monster art", () => {
  for (const [name, art] of Object.entries(MONSTER_ART)) {
    it(`monster-${name} is a valid 16x16 sprite`, () => {
      validateArt(name, art, 16);
    });
  }
});

describe("negariaStageArtKey (LP-22: ネガリアの色戻し)", () => {
  const NEGARIA_ARTS = [
    "negaGround",
    "negaGround2",
    "negaPath",
    "negaSea",
    "negaTree",
    "locNegaVillage",
    "locNegaTown",
    "locSpeedHall",
    "locEnTemple",
    "locPitagora",
  ];
  const BRIGHT_TARGET: Record<string, string> = {
    negaGround: "grass",
    negaGround2: "grass2",
    negaPath: "path",
    negaSea: "water",
    negaTree: "tree",
    locNegaVillage: "locVillage",
    locNegaTown: "locCastle",
    locSpeedHall: "locTower",
    locEnTemple: "locSeaTemple",
    locPitagora: "locRuins",
  };

  it("対象タイルを正しく識別する", () => {
    for (const art of NEGARIA_ARTS) expect(isNegariaStagedArt(art)).toBe(true);
    /* ゼロム城 (まだ倒していない敵の城) と 通常タイルは対象外 */
    expect(isNegariaStagedArt("locZeromCastle")).toBe(false);
    expect(isNegariaStagedArt("grass")).toBe(false);
    expect(isNegariaStagedArt("darkWall")).toBe(false);
  });

  it("stage0 は もとの art名 のまま (いちばん くらい状態)", () => {
    for (const art of NEGARIA_ARTS) expect(negariaStageArtKey(art, 0)).toBe(art);
  });

  it("stage1〜3 は `<art>@<stage>` のテクスチャキーになり、TILE_ART に存在する", () => {
    for (const art of NEGARIA_ARTS) {
      for (const stage of [1, 2, 3] as const) {
        const key = negariaStageArtKey(art, stage);
        expect(key).toBe(`${art}@${stage}`);
        expect(TILE_ART[key], `${key} が TILE_ART に無い`).toBeDefined();
      }
    }
  });

  it("stage3 の色は対応する 上の世界タイルと完全に一致する (色が戻りきる)", () => {
    for (const art of NEGARIA_ARTS) {
      const brightKey = BRIGHT_TARGET[art];
      const stage3 = TILE_ART[negariaStageArtKey(art, 3)];
      const bright = TILE_ART[brightKey];
      for (const ch of Object.keys(TILE_ART[art].palette)) {
        if (!(ch in bright.palette)) continue;
        expect(stage3.palette[ch], `${art}[${ch}] @stage3`).toBe(bright.palette[ch]);
      }
    }
  });

  it("対象外の art名 は stage を渡しても変化しない", () => {
    expect(negariaStageArtKey("grass", 3)).toBe("grass");
    expect(negariaStageArtKey("locZeromCastle", 3)).toBe("locZeromCastle");
  });
});

describe("effect art", () => {
  for (const [name, frames] of Object.entries(EFFECT_ART)) {
    it(`fx-${name} has valid 16x16 frames`, () => {
      expect(frames.length).toBeGreaterThan(0);
      frames.forEach((art, i) => validateArt(`${name}#${i}`, art, 16));
    });
  }
});

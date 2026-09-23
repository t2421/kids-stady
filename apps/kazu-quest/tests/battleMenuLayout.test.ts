/*
 * 戦闘コマンドの ならべ方。以前は 1列で 5つめより下が 画面外に はみ出し、
 * タッチでは じゅもん・どうぐ から もどれなかった。
 */

import { describe, expect, it } from "vitest";
import {
  BATTLE_MENU_CELLS,
  BATTLE_MENU_LAYOUT,
  battleMenuCell,
  menuPage,
  pageCount,
} from "../src/game/battle/battleMenuLayout";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const COMMANDS = ["たたかう", "じゅもん", "どうぐ", "ぼうぎょ", "にげる"];

describe("battleMenuCell", () => {
  it("fits every cell inside the battle window and left of the status column", () => {
    for (let i = 0; i < BATTLE_MENU_CELLS; i++) {
      const c = battleMenuCell(i);
      expect(c.x).toBeGreaterThanOrEqual(40);
      expect(c.x + BATTLE_MENU_LAYOUT.cellW).toBeLessThanOrEqual(GAME_WIDTH - 250);
      expect(c.y + BATTLE_MENU_LAYOUT.cellH).toBeLessThanOrEqual(GAME_HEIGHT - 17);
    }
  });

  /* iPad 横 (1080px 幅 → 1.125倍) で マスの高さが 50px 以上 */
  it("keeps cells finger-sized on an iPad", () => {
    expect(BATTLE_MENU_LAYOUT.cellH * (1080 / GAME_WIDTH)).toBeGreaterThanOrEqual(50);
    expect(BATTLE_MENU_LAYOUT.cellW * (1080 / GAME_WIDTH)).toBeGreaterThanOrEqual(200);
  });
});

describe("menuPage", () => {
  it("shows the five root commands on one page without navigation", () => {
    const cells = menuPage(COMMANDS, 0, false);
    expect(cells.map((c) => c.label)).toEqual(COMMANDS);
    expect(cells.every((c) => c.kind === "item")).toBe(true);
  });

  it("always offers もどる in a sub-menu, even when it is empty", () => {
    expect(menuPage([], 0, true)).toEqual([{ kind: "back", label: "もどる" }]);
    const small = menuPage(["a", "b"], 0, true);
    expect(small.at(-1)?.kind).toBe("back");
  });

  it("pages long spell lists so every spell is reachable", () => {
    const spells = Array.from({ length: 11 }, (_, i) => `spell${i}`);
    const pages = pageCount(spells.length, true);
    const seen = new Set<number>();
    for (let p = 0; p < pages; p++) {
      const cells = menuPage(spells, p, true);
      expect(cells.length).toBeLessThanOrEqual(BATTLE_MENU_CELLS);
      expect(cells.some((c) => c.kind === "next")).toBe(true);
      expect(cells.at(-1)?.kind).toBe("back");
      for (const c of cells) if (c.kind === "item") seen.add(c.index);
    }
    expect([...seen].sort((a, b) => a - b)).toEqual(spells.map((_, i) => i));
    /* ページは まわる (最後の つぎへ で 1ページめ) */
    expect(menuPage(spells, pages, true)).toEqual(menuPage(spells, 0, true));
  });
});

describe("battle menu on a taller (4:3) canvas", () => {
  it("stays inside the window at every supported game height", () => {
    for (const h of [540, 600, 720]) {
      for (let i = 0; i < BATTLE_MENU_CELLS; i++) {
        const c = battleMenuCell(i, h);
        expect(c.y + BATTLE_MENU_LAYOUT.cellH, `h=${h} cell ${i}`).toBeLessThanOrEqual(h - 17);
        expect(c.y, `h=${h} cell ${i}`).toBeGreaterThanOrEqual(h - 148 + 30);
      }
    }
  });
});

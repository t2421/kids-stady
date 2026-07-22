/*
 * マップの見た目 (タイル・NPC・宝箱スプライト) の構築と更新。
 * FieldScene から描画責務を分離したビュー。当たり判定に使う
 * 「いま表示されているか」(hasNpc / hasEventSprite) もここが持つ。
 */

import type { Scene } from "phaser";
import type Phaser from "phaser";
import type { MapDef } from "../../content/types";
import type { SaveData } from "../../lib/save";
import { TILE_SIZE } from "../../content/art/tiles";
import { evalCond } from "../../lib/events/runner";
import { actorTextureKey, tileTextureKey } from "../textures";

export function tileCenter(x: number, y: number): [number, number] {
  return [x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2];
}

export class MapView {
  private npcSprites = new Map<string, Phaser.GameObjects.Image>();
  private eventSprites = new Map<string, Phaser.GameObjects.Image>();

  constructor(
    private readonly scene: Scene,
    private readonly map: MapDef,
  ) {}

  build(flags: SaveData["flags"]): void {
    /*
     * タイルごとに静的 Image を置く。
     * DynamicTexture への一括焼き込みも試したが、Phaser 4.2 では draw() が
     * 描画されなかった (M4スパイクの結論)。マップは最大でも数千タイルなので
     * 静的 Image で十分。性能が問題になったらチャンク化を検討する。
     */
    this.map.grid.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const spec = this.map.legend[ch];
        if (!spec) return;
        this.scene.add
          .image(...tileCenter(x, y), tileTextureKey(spec.art))
          .setDepth(0);
      });
    });

    for (const npc of this.map.npcs) {
      if (npc.hideIf && evalCond(npc.hideIf, flags)) continue;
      const sprite = this.scene.add
        .image(...tileCenter(npc.x, npc.y), actorTextureKey(npc.art))
        .setDepth(5);
      this.npcSprites.set(npc.id, sprite);
    }

    for (const ev of this.map.events) {
      if (!ev.art) continue;
      if (ev.onceFlag && evalCond({ flag: ev.onceFlag, op: "set" }, flags)) {
        continue;
      }
      const sprite = this.scene.add
        .image(...tileCenter(ev.x, ev.y), tileTextureKey(ev.art))
        .setDepth(4);
      this.eventSprites.set(ev.id, sprite);
    }
  }

  /* フラグ変化を反映: 開いた宝箱・条件を満たした hideIf NPC を消す */
  refresh(flags: SaveData["flags"]): void {
    for (const ev of this.map.events) {
      const sprite = this.eventSprites.get(ev.id);
      if (!sprite) continue;
      if (ev.onceFlag && evalCond({ flag: ev.onceFlag, op: "set" }, flags)) {
        sprite.destroy();
        this.eventSprites.delete(ev.id);
      }
    }
    for (const npc of this.map.npcs) {
      if (!npc.hideIf) continue;
      const sprite = this.npcSprites.get(npc.id);
      if (sprite && evalCond(npc.hideIf, flags)) {
        sprite.destroy();
        this.npcSprites.delete(npc.id);
      }
    }
  }

  hasNpc(id: string): boolean {
    return this.npcSprites.has(id);
  }

  hasEventSprite(id: string): boolean {
    return this.eventSprites.has(id);
  }
}

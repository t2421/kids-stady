/*
 * マップの見た目 (タイル・NPC・宝箱スプライト) の構築と更新。
 * FieldScene から描画責務を分離したビュー。当たり判定に使う
 * 「いま表示されているか」(hasNpc / hasEventSprite) もここが持つ。
 */

import type { Scene } from "phaser";
import type Phaser from "phaser";
import type { MapDef, TileSpec } from "../../content/types";
import type { SaveData } from "../../lib/save";
import { TILE_SIZE } from "../../content/art/tiles";
import { TILE_ANIMATIONS } from "../../content/art/tileAnims";
import { evalCond } from "../../lib/events/runner";
import { actorTextureKey, tileTextureKey } from "../textures";

/* タイルアニメの切替間隔 (2コマをのんびり往復) */
const TILE_ANIM_MS = 620;
/* キャラの足元影の見た目 */
const SHADOW_COLOR = 0x10141c;
const SHADOW_ALPHA = 0.28;

export function tileCenter(x: number, y: number): [number, number] {
  return [x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2];
}

/*
 * variants 指定タイルの見た目を座標から決定的に選ぶ。
 * 乱数だと再訪のたびに景色が変わるので、必ず (x, y) だけから決める。
 */
export function pickTileArt(spec: TileSpec, x: number, y: number): string {
  const pool = spec.variants;
  if (!pool || pool.length === 0) return spec.art;
  const hash = (x * 7919 + y * 104729 + ((x * 31 + y * 7) % 13)) % pool.length;
  return pool[hash];
}

/* キャラの足元に落とす楕円の影 (接地感を出す)。プレイヤーとNPCで共用 */
export function addFootShadow(
  scene: Scene,
  x: number,
  y: number,
): Phaser.GameObjects.Ellipse {
  return scene.add
    .ellipse(x, y + 6, 10, 4, SHADOW_COLOR, SHADOW_ALPHA)
    .setDepth(3);
}

export class MapView {
  private npcSprites = new Map<string, Phaser.GameObjects.Image>();
  private npcShadows = new Map<string, Phaser.GameObjects.Ellipse>();
  private eventSprites = new Map<string, Phaser.GameObjects.Image>();
  /* アニメーションするタイル: 2コマのテクスチャキーを持つ */
  private animTiles: { img: Phaser.GameObjects.Image; frames: [string, string] }[] =
    [];
  private animFrame = 0;

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
        const art = pickTileArt(spec, x, y);
        const img = this.scene.add
          .image(...tileCenter(x, y), tileTextureKey(art))
          .setDepth(0);
        const animArt = TILE_ANIMATIONS[art];
        if (animArt) {
          this.animTiles.push({
            img,
            frames: [tileTextureKey(art), tileTextureKey(animArt)],
          });
        }
      });
    });
    this.startTileAnimations();

    for (const npc of this.map.npcs) {
      if (npc.hideIf && evalCond(npc.hideIf, flags)) continue;
      const [px, py] = tileCenter(npc.x, npc.y);
      this.npcShadows.set(npc.id, addFootShadow(this.scene, px, py));
      const sprite = this.scene.add
        .image(px, py, actorTextureKey(npc.art))
        .setDepth(5);
      /* 呼吸のようなゆったりしたボブ。位相は座標からずらして揃い踏みを防ぐ */
      this.scene.tweens.add({
        targets: sprite,
        y: py - 1,
        duration: 1150,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: (npc.x * 137 + npc.y * 71) % 900,
      });
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

  /* 2コマのタイルアニメを一括で切り替えるタイマー (シーンと共に破棄される) */
  private startTileAnimations(): void {
    if (this.animTiles.length === 0) return;
    this.scene.time.addEvent({
      delay: TILE_ANIM_MS,
      loop: true,
      callback: () => {
        this.animFrame = this.animFrame === 0 ? 1 : 0;
        for (const { img, frames } of this.animTiles) {
          img.setTexture(frames[this.animFrame]);
        }
      },
    });
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
        this.scene.tweens.killTweensOf(sprite);
        sprite.destroy();
        this.npcSprites.delete(npc.id);
        this.npcShadows.get(npc.id)?.destroy();
        this.npcShadows.delete(npc.id);
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

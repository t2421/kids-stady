/*
 * ドット絵定義 (src/content/art/) から Phaser テクスチャを一括生成する。
 * BootScene から1回だけ呼ぶ。画像アセットは使わない (リポジトリ方針)。
 */

import type { Scene } from "phaser";
import type { PixelArt } from "../content/art/format";
import { artSize } from "../content/art/format";
import { TILE_ART } from "../content/art/tiles";
import { ACTOR_ART } from "../content/art/actors";
import { MONSTER_ART } from "../content/art/monsters";

function generatePixelArt(scene: Scene, key: string, art: PixelArt): void {
  if (scene.textures.exists(key)) return;
  const scale = art.scale ?? 1;
  const { w, h } = artSize(art);
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  art.rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      const color = art.palette[ch];
      if (!color) return;
      g.fillStyle(parseInt(color.slice(1), 16), 1);
      g.fillRect(x * scale, y * scale, scale, scale);
    });
  });
  g.generateTexture(key, w, h);
  g.destroy();
}

export function tileTextureKey(artName: string): string {
  return "tile-" + artName;
}

export function actorTextureKey(artName: string): string {
  return "actor-" + artName;
}

export function monsterTextureKey(artName: string): string {
  return "monster-" + artName;
}

export function generateAllTextures(scene: Scene): void {
  for (const [name, art] of Object.entries(TILE_ART)) {
    generatePixelArt(scene, tileTextureKey(name), art);
  }
  for (const [name, art] of Object.entries(ACTOR_ART)) {
    generatePixelArt(scene, actorTextureKey(name), art);
  }
  for (const [name, art] of Object.entries(MONSTER_ART)) {
    generatePixelArt(scene, monsterTextureKey(name), art);
  }
}

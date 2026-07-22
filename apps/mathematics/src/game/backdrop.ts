import type Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./main";

/*
 * Void の宇宙背景 (星雲+星2層+回る地球) をシーンに敷く共通ヘルパー。
 * 返した layers を update で scrollBackdrop に渡すとパララックスする。
 */
export function addVoidBackdrop(
  scene: Phaser.Scene,
  opts: { planet?: boolean } = {},
): Phaser.GameObjects.TileSprite[] {
  const layers = [
    scene.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "bg-void"),
  ];
  if (opts.planet !== false) {
    const planet = scene.add.sprite(GAME_WIDTH * 0.82, 120, "planet-earth").setScale(1.5);
    planet.play("planet-spin");
  }
  layers.push(
    scene.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "bg-stars1"),
    scene.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "bg-stars2"),
  );
  for (const layer of layers) layer.setTileScale(1.5);
  return layers;
}

export function scrollBackdrop(layers: Phaser.GameObjects.TileSprite[], dt: number, speed = 1): void {
  const speeds = [6, 16, 34];
  layers.forEach((layer, i) => {
    layer.tilePositionX += (speeds[i] ?? 10) * speed * dt;
  });
}

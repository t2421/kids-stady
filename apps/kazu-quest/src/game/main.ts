import Phaser, { AUTO, Game, Scale } from "phaser";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";

/* 論理解像度。全シーンはこの座標系で描き、Scale.FIT で画面に合わせる */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

/*
 * 物理エンジンは使わない (グリッド移動は tween + 自前 walkable 判定)。
 * ドット絵をにじませないため pixelArt を有効化する。
 */
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#000000",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene],
};

export function startGame(parent: string): Phaser.Game {
  return new Game({ ...config, parent });
}

import Phaser, { AUTO, Game, Scale } from "phaser";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";

/* 論理解像度。全シーンはこの座標系で描き、Scale.FIT で画面に合わせる */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#0b1e3a",
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scene: [BootScene, TitleScene],
};

export function startGame(parent: string): Phaser.Game {
  return new Game({ ...config, parent });
}

import Phaser, { AUTO, Game, Scale } from "phaser";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { FieldScene } from "./scenes/FieldScene";

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
  /* 開発時のみ: ウィンドウが遮蔽されていても RAF 停止でゲームが凍らないよう
     setTimeout 駆動 + スムージング無効にする (ブラウザ自動操作で外部から
     loop.step() を注入して検証するため。本番は RAF + スムージング)。 */
  ...(process.env.NODE_ENV === "development"
    ? { fps: { forceSetTimeOut: true, smoothStep: false } }
    : {}),
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, FieldScene],
};

export function startGame(parent: string): Phaser.Game {
  return new Game({ ...config, parent });
}

import Phaser, { AUTO, Game, Scale } from "phaser";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { FieldScene } from "./scenes/FieldScene";
import { UiScene } from "./scenes/UiScene";
import { BattleScene } from "./scenes/BattleScene";
import { EndingScene } from "./scenes/EndingScene";

/*
 * 論理解像度。全シーンはこの座標系で描き、Scale.FIT で画面に合わせる。
 *
 * 幅は 960 固定、高さは 起動したときの 画面の縦横比に合わせて 540 (16:9) 〜 720 (4:3)。
 * 以前は 540 固定で、4:3 の iPad では 上下に 画面の 37% ぶんの 黒い帯が出て、
 * タイルも 戦闘の文字も そのぶん 小さかった (UX 監査)。全シーンの配置は
 * GAME_HEIGHT からの相対 (下から 148px など) なので、高さが変わっても くずれない。
 * 起動後の 回転・リサイズは Scale.FIT の 帯で 吸収する (作りなおさない)。
 */
export { GAME_WIDTH, MIN_GAME_HEIGHT, MAX_GAME_HEIGHT, gameHeightForViewport } from "./viewport";
import { GAME_WIDTH, MIN_GAME_HEIGHT, gameHeightForViewport } from "./viewport";

export const GAME_HEIGHT =
  typeof window === "undefined"
    ? MIN_GAME_HEIGHT
    : gameHeightForViewport(window.innerWidth, window.innerHeight);

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
  scene: [BootScene, TitleScene, FieldScene, UiScene, BattleScene, EndingScene],
};

export function startGame(parent: string): Phaser.Game {
  return new Game({ ...config, parent });
}

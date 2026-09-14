/*
 * タイトル画面が表示中かどうか (React の TitleMenu が参照する)。
 * TitleScene の create / shutdown で更新する。React 側から Phaser のシーン
 * インスタンスを直接触らずに済ませるための、EventBus と対になる最小の状態。
 */

let titleActive = false;

export function setTitleActive(active: boolean): void {
  titleActive = active;
}

export function isTitleActive(): boolean {
  return titleActive;
}

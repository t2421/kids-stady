/*
 * 実行中セッションの状態 (選択中プロフィール)。
 * React と Phaser の両方から import できる唯一の共有データ置き場。
 * イベントのやり取りは EventBus、データの参照はここ、と役割を分ける。
 */

let activeProfileId: string | null = null;

export function setActiveProfileId(id: string | null): void {
  activeProfileId = id;
}

export function getActiveProfileId(): string | null {
  return activeProfileId;
}

"use client";

import { useLayoutEffect } from "react";
import { startGame } from "@/game/main";
import type Phaser from "phaser";

/*
 * React と Phaser の橋渡し。ゲーム本体は #game-container 内の canvas に描画され、
 * React 側のオーバーレイ UI とは EventBus 経由でのみやり取りする。
 *
 * ゲームはモジュールレベルのシングルトンとして一度だけ生成する。
 * React 19 dev の StrictMode は effect を「実行→クリーンアップ→再実行」するため、
 * クリーンアップで destroy すると canvas が二重生成され (destroy はフレーム処理で
 * 非同期のため)、入力が死んだ2つ目のインスタンスが残る事故が起きる。
 * ページの生存期間中ゲームは1つなので、破棄はページ破棄に任せる。
 */
let game: Phaser.Game | null = null;

export function PhaserGame() {
  useLayoutEffect(() => {
    if (game === null) {
      game = startGame("game-container");
      /* E2E・デバッグ用フック (Playwright スモークでも使う) */
      (window as unknown as Record<string, unknown>).__KAZUQUEST_GAME__ = game;
    }
  }, []);

  return <div id="game-container" />;
}

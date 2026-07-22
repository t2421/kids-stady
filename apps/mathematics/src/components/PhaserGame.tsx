"use client";

import { useLayoutEffect } from "react";
import { startGame } from "@/game/main";
import { initAudio } from "@/game/sfx";
import type Phaser from "phaser";

/*
 * React と Phaser の橋渡し (公式 phaserjs/template-nextjs のパターン)。
 * ゲーム本体は #game-container 内の canvas に描画され、
 * React 側のオーバーレイ UI とは EventBus 経由でのみやり取りする。
 *
 * ライフサイクル:
 * - React StrictMode (dev) は mount→unmount→mount するため、アンマウント時は
 *   即破棄せず「キャンセル可能な遅延破棄」を予約する。直後に再マウントが来たら
 *   予約を取り消して既存インスタンスを再利用 (ブート前の destroy は宙に浮くため)
 * - 本物のアンマウント (ページ遷移) では予約が発火して destroy(true) される
 * - 再利用時、古いコンテナごと canvas がDOMから外れていたら付け直す
 */

type GameWindow = Window & {
  __mathGame?: Phaser.Game | null;
  __mathGameDestroyTimer?: number;
};

export function PhaserGame() {
  useLayoutEffect(() => {
    const w = window as GameWindow;

    /* 直前のアンマウントで予約された破棄をキャンセル (StrictModeの再マウント) */
    if (w.__mathGameDestroyTimer !== undefined) {
      window.clearTimeout(w.__mathGameDestroyTimer);
      w.__mathGameDestroyTimer = undefined;
    }

    if (!w.__mathGame) {
      w.__mathGame = startGame("game-container");
    } else {
      /* 再利用: canvas が現在のコンテナに居なければ付け直す */
      const container = document.getElementById("game-container");
      const canvas = w.__mathGame.canvas;
      if (container && canvas && canvas.parentElement !== container) {
        container.appendChild(canvas);
      }
    }

    /* 最初のユーザー操作で効果音を有効化 (autoplay 制限対策) */
    const unlock = () => initAudio();
    window.addEventListener("pointerdown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      /* 本物のアンマウントなら発火し、StrictModeなら次のマウントで取り消される */
      w.__mathGameDestroyTimer = window.setTimeout(() => {
        w.__mathGameDestroyTimer = undefined;
        try {
          w.__mathGame?.destroy(true);
        } catch {
          /* noop */
        }
        w.__mathGame = null;
      }, 80);
    };
  }, []);

  return <div id="game-container" />;
}

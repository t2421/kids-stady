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
 * 注意: React StrictMode (dev) は mount→unmount→mount を行うため、
 * 素朴に作ると Phaser ゲームが2個生成される。さらに、ブート完了前の
 * game.destroy() は処理されず宙に浮く。そこで
 * - インスタンスは window 上のシングルトンとして管理し (HMR越しにも生き残る)
 * - 破棄は必ずブート完了を待ってから行う
 */

type GameWindow = Window & { __mathGame?: Phaser.Game | null };

export function PhaserGame() {
  useLayoutEffect(() => {
    const w = window as GameWindow;
    /* シングルトン: StrictMode の2回目マウントでは既存インスタンスを再利用する。
       ゲームコードの変更はフルリロードで反映する運用 (HMRの部分適用はしない) */
    if (!w.__mathGame) {
      w.__mathGame = startGame("game-container");
    }

    /* 最初のユーザー操作で効果音を有効化 (autoplay 制限対策) */
    const unlock = () => initAudio();
    window.addEventListener("pointerdown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      /* StrictMode の偽アンマウント直後に再マウントが来るため、ゲームは破棄しない。
         EventBus.removeAllListeners() もしない — シーンが登録したリスナーまで
         消えてしまう (問題パネルが開かなくなる)。リスナーは各自が外す設計 */
    };
  }, []);

  return <div id="game-container" />;
}

"use client";

import { useLayoutEffect, useRef } from "react";
import { EventBus } from "@/game/EventBus";
import { startGame } from "@/game/main";
import type Phaser from "phaser";

/*
 * React と Phaser の橋渡し (公式 phaserjs/template-nextjs のパターン)。
 * ゲーム本体は #game-container 内の canvas に描画され、
 * React 側のオーバーレイ UI とは EventBus 経由でのみやり取りする。
 */
export function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (gameRef.current === null) {
      gameRef.current = startGame("game-container");
    }
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      EventBus.removeAllListeners();
    };
  }, []);

  return <div id="game-container" />;
}

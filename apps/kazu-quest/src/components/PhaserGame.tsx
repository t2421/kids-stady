"use client";

import { useLayoutEffect } from "react";
import { startGame } from "@/game/main";
import { getSave, updateSave } from "@/game/session";
import { expForLevel, heroStats } from "@/lib/battle/stats";
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
      (window as unknown as Record<string, unknown>).__KAZUQUEST_DEBUG__ = {
        getSave,
        teleport: (x: number, y: number, facing: string) => {
          const field = game?.scene.getScene("Field") as unknown as
            | { debugTeleport?: (x: number, y: number, facing: string) => void }
            | null;
          field?.debugTeleport?.(x, y, facing);
        },
        learnSpell: (spellId: string) => {
          updateSave((s) => ({
            ...s,
            flags: { ...s.flags, [`learned.${spellId}`]: true },
            party: s.party.map((m) =>
              m.memberId === "hero" && !m.learnedSpells.includes(spellId)
                ? { ...m, learnedSpells: [...m.learnedSpells, spellId] }
                : m,
            ),
          }));
        },
        grantLevel: (level: number) => {
          const stats = heroStats(level);
          updateSave((s) => ({
            ...s,
            party: s.party.map((m) =>
              m.memberId === "hero"
                ? {
                    ...m,
                    level,
                    exp: expForLevel(level),
                    hp: stats.maxHp,
                    mp: stats.maxMp,
                  }
                : m,
            ),
          }));
        },
        warp: (mapId: string, spawn: string) => {
          const field = game?.scene.getScene("Field") as unknown as
            | { debugWarp?: (mapId: string, spawn: string) => void }
            | null;
          field?.debugWarp?.(mapId, spawn);
        },
      };
    }
  }, []);

  return <div id="game-container" />;
}

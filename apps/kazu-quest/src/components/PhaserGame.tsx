"use client";

import { useLayoutEffect } from "react";
import { startGame } from "@/game/main";
import { autosave, getSave, updateSave } from "@/game/session";
import { advanceSaveToChapter, chapterStart } from "@/lib/debug/advanceToChapter";
import { expForLevel } from "@/lib/battle/stats";
import { memberStats } from "@/lib/battle/members";
import { installSfxUnlock } from "@/game/audio/sfx";
import { currentAnswer } from "@/components/currentProblem";
import { advanceClock as advanceClockOffset, now } from "@/lib/clock";
import { REVIEW_INTERVALS_MS } from "@/lib/mastery";
import type { MasteryState } from "@/lib/save";
import { EventBus } from "@/game/EventBus";
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
    /* 効果音: 最初のタップ/キーで AudioContext を起こす (iOS 制約)。何度呼んでも 1 回だけ登録 */
    installSfxUnlock();
    if (game === null) {
      game = startGame("game-container");
      /* E2E・デバッグ用フック (Playwright スモークでも使う) */
      (window as unknown as Record<string, unknown>).__KAZUQUEST_GAME__ = game;
      /* 性能監査 (KQ-40): FpsMeter と Playwright の計測スクリプトが読む。dev/prod 共通で無害 */
      (window as unknown as Record<string, unknown>).__KAZUQUEST_PERF__ = {
        fps: () => Math.round(game?.loop.actualFps ?? 0),
        sprites: () => {
          const field = game?.scene.getScene("Field") as unknown as
            | { debugSpriteCount?: () => number }
            | null;
          return field?.debugSpriteCount?.() ?? 0;
        },
      };
      (window as unknown as Record<string, unknown>).__KAZUQUEST_DEBUG__ = {
        getSave,
        /* 出題中の正解 (E2E がテンキーで打つ用。DOM には出さない — KQ-12) */
        currentAnswer,
        teleport: (x: number, y: number, facing: string) => {
          const field = game?.scene.getScene("Field") as unknown as
            | { debugTeleport?: (x: number, y: number, facing: string) => void }
            | null;
          field?.debugTeleport?.(x, y, facing);
        },
        setFlag: (flag: string, value: number | boolean = true) => {
          updateSave((s) => ({ ...s, flags: { ...s.flags, [flag]: value } }));
        },
        /* E2E (学びの設計): 間隔復習の期日到来を待たずに時計を進める */
        advanceClock: (ms: number) => {
          advanceClockOffset(ms);
        },
        /* E2E: 単元の習熟状態を直接書く (学びの設計まわりのテスト用) */
        setMastery: (skillId: string, state: MasteryState) => {
          updateSave((s) => ({
            ...s,
            mastery: {
              ...s.mastery,
              [skillId]: {
                state,
                reviewDue: state === "can" || state === "mastered" ? now() + REVIEW_INTERVALS_MS[0] : null,
                streak: 0,
                passedAt: state !== "none" ? now() : null,
              },
            },
          }));
          autosave();
        },
        /*
         * TEMPORARY (LP-08 E2E 用): マップにまだ「まなびやの先生」の導線が無いので、
         * open-lesson を直接叩いて LessonScreen を開く。LP-09/LP-10 以降で
         * フィールドの openLesson effect (handleOpenLesson) が正式な入口になり次第、
         * このフックは削除してよい
         */
        openLesson: (skillId: string) => {
          EventBus.emit("open-lesson", { skillId, entry: "story" });
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
        /* E2E/デバッグ: パーティ全員を level にして HP/MP を満タンにする
           (勇者だけ上げると仲間が1撃で倒れ、終盤ボスの検証にならない) */
        grantLevel: (level: number) => {
          updateSave((s) => ({
            ...s,
            party: s.party.map((m) => {
              const stats = memberStats(m.memberId, level);
              return {
                ...m,
                level,
                exp: expForLevel(level),
                hp: stats.maxHp,
                mp: stats.maxMp,
              };
            }),
          }));
        },
        /* E2E (fieldHeal.spec): HP/MP を直接書く。0〜最大値に丸める */
        setHp: (memberId: string, hp: number) => {
          updateSave((s) => ({
            ...s,
            party: s.party.map((m) =>
              m.memberId === memberId
                ? { ...m, hp: Math.max(0, Math.min(memberStats(m.memberId, m.level).maxHp, hp)) }
                : m,
            ),
          }));
        },
        setMp: (memberId: string, mp: number) => {
          updateSave((s) => ({
            ...s,
            party: s.party.map((m) =>
              m.memberId === memberId
                ? { ...m, mp: Math.max(0, Math.min(memberStats(m.memberId, m.level).maxMp, mp)) }
                : m,
            ),
          }));
        },
        /* アイテムを直接足す (KQ-31 メダル交換所の E2E 用)。runner の giveItem と同じ意味論 */
        giveItem: (itemId: string, count = 1) => {
          updateSave((s) => ({
            ...s,
            inventory: {
              ...s.inventory,
              items: { ...s.inventory.items, [itemId]: (s.inventory.items[itemId] ?? 0) + count },
            },
          }));
        },
        grantGold: (amount: number) => {
          updateSave((s) => ({
            ...s,
            inventory: { ...s.inventory, gold: s.inventory.gold + amount },
          }));
        },
        warp: (mapId: string, spawn: string) => {
          const field = game?.scene.getScene("Field") as unknown as
            | { debugWarp?: (mapId: string, spawn: string) => void }
            | null;
          field?.debugWarp?.(mapId, spawn);
        },
        /* 章 n の開始状態までセーブを進めて開始地点へワープする。着地先を返す (E2E seedChapter 用) */
        advanceToChapter: (chapter: number) => {
          updateSave((s) => advanceSaveToChapter(s, chapter));
          autosave();
          const target = chapterStart(chapter);
          const field = game?.scene.getScene("Field") as unknown as
            | { debugWarp?: (mapId: string, spawn: string) => void }
            | null;
          field?.debugWarp?.(target.mapId, target.spawn);
          return target;
        },
      };
    }
  }, []);

  return <div id="game-container" />;
}

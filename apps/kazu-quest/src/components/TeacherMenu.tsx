"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { EventBus } from "@/game/EventBus";
import { playSfx } from "@/game/audio/sfx";
import { getLesson } from "@/content/lessons/index";
import { masteryOf } from "@/lib/mastery";
import { learnSpell } from "@/lib/learnSpell";
import { getSave, updateSave, autosave } from "@/game/session";
import { dqWindow, actionButton, UI_COLORS } from "@/components/uiTheme";

/*
 * まなびやの先生メニュー (学びの設計 LP-18)。EventBus "open-teacher-menu"
 * {entries} で開く。旧 spellTestMenu() の入れ子 choice (呪文名を1つずつ
 * はい/いいえで聞く) をやめ、PreviewMenu.tsx と同じ一覧タップ型に置き換える —
 * 呪文名でなく単元名で並べる (中核単元にはバッジを付ける)。
 *
 * タップで "open-lesson" {skillId, entry:"story"} を直接発火する
 * (LessonScreen.tsx が既に listen している形と同じ — handleOpenLesson の
 * readiness ゲートは経由しない。先生の前で選ぶ単元は前提を気にせず即開く)。
 * entry.spellIds があれば (=その単元が旧・呪文の学習テスト対象だった場合)、
 * レッスン合格 ("lesson-finished" {outcome:"passed"}) を見て呪文を全部
 * 習得させる — これをしないと橋の番人 (learned.<spellId> フラグ) や党の呪文が
 * 一切もらえなくなってしまうため、旧 spellTestFlow.delegateToLesson が
 * していた「習得」だけをここに引き継ぐ。
 *
 * 閉じるときは必ず "teacher-menu-closed" を出す (項目タップで即レッスンへ
 * 渡るときも)。handleOpenTeacherMenu はこれを待って advance() する。
 */

/* 4色: 未着手/とっくん中/できる/マスター (mastery.ts の4状態にそのまま対応) */
const MASTERY_COLORS: Record<string, string> = {
  none: "#6b7686",
  practicing: UI_COLORS.mp,
  can: UI_COLORS.hp,
  mastered: UI_COLORS.yellow,
};

const MASTERY_LABELS: Record<string, string> = {
  none: "みならい",
  practicing: "とっくん中",
  can: "できる",
  mastered: "マスター",
};

export interface TeacherMenuEntry {
  skillId: string;
  label: string;
  spellIds?: string[];
}

interface OpenTeacherMenuPayload {
  entries: TeacherMenuEntry[];
}

interface LessonFinishedPayload {
  skillId: string;
  outcome: "passed" | "failed" | "aborted";
  correct: number;
  total: number;
}

export function TeacherMenu() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<TeacherMenuEntry[]>([]);

  useEffect(() => {
    const onOpen = (payload: OpenTeacherMenuPayload) => {
      setEntries(payload.entries);
      setOpen(true);
      playSfx("teacherGreet");
    };
    EventBus.on("open-teacher-menu", onOpen);
    return () => {
      EventBus.off("open-teacher-menu", onOpen);
    };
  }, []);

  const close = () => {
    setOpen(false);
    playSfx("cancel");
    EventBus.emit("teacher-menu-closed");
  };

  const grantSpellsOnPass = (skillId: string, spellIds: string[]) => {
    const onFinished = (result: LessonFinishedPayload) => {
      if (result.skillId !== skillId) return;
      EventBus.off("lesson-finished", onFinished);
      if (result.outcome !== "passed") return;
      const learned = getSave().party.flatMap((m) => m.learnedSpells);
      const toLearn = spellIds.filter((id) => !learned.includes(id));
      if (toLearn.length === 0) return;
      updateSave((s) => toLearn.reduce((acc, id) => learnSpell(acc, id), s));
      autosave();
    };
    EventBus.on("lesson-finished", onFinished);
  };

  const choose = (entry: TeacherMenuEntry) => {
    setOpen(false);
    playSfx("confirm");
    if (entry.spellIds && entry.spellIds.length > 0) {
      grantSpellsOnPass(entry.skillId, entry.spellIds);
    }
    EventBus.emit("open-lesson", { skillId: entry.skillId, entry: "story" });
    EventBus.emit("teacher-menu-closed");
  };

  if (!open) return null;

  const swallow = (e: SyntheticEvent) => e.stopPropagation();
  const save = getSave();

  return (
    <div
      data-testid="teacher-menu"
      onClick={swallow}
      onPointerDown={swallow}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 8, 20, 0.7)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="まなびや"
        style={dqWindow({
          width: "min(94vw, 560px)",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 14,
          padding: "20px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        })}
      >
        <div
          style={{
            fontFamily: "var(--kids-font)",
            fontWeight: 700,
            fontSize: "clamp(20px, 2.8vw, 26px)",
            color: UI_COLORS.yellow,
            textAlign: "center",
          }}
        >
          まなびや
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map((entry) => {
            const state = masteryOf(save, entry.skillId).state;
            const color = MASTERY_COLORS[state] ?? MASTERY_COLORS.none;
            const isCore = getLesson(entry.skillId)?.coreOfChapter === true;
            return (
              <button
                key={entry.skillId}
                type="button"
                data-testid="teacher-menu-item"
                data-skill={entry.skillId}
                onClick={() => choose(entry)}
                style={{
                  minHeight: 58,
                  padding: "8px 18px",
                  textAlign: "left",
                  fontFamily: "var(--kids-font)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#ffffff",
                  background: "rgba(255,255,255,0.08)",
                  border: `3px solid ${color}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isCore && (
                    <span
                      data-testid="teacher-menu-core-badge"
                      aria-label="中核単元"
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: UI_COLORS.yellow,
                        border: "2px solid #ffffff",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {entry.label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {MASTERY_LABELS[state] ?? MASTERY_LABELS.none}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          data-testid="teacher-menu-close"
          onClick={close}
          style={{
            ...actionButton("#2d5a3d"),
            alignSelf: "flex-end",
            minHeight: 56,
            minWidth: 160,
            fontSize: 20,
          }}
        >
          とじる
        </button>
      </div>
    </div>
  );
}

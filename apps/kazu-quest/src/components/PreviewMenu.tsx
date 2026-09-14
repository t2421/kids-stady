"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { EventBus } from "@/game/EventBus";
import { SKILLS } from "@/lib/curriculum";
import { hasLesson } from "@/content/lessons/index";
import { prerequisitesFor } from "@/content/lessons/prereqs";
import { masteryOf } from "@/lib/mastery";
import { getSave } from "@/game/session";
import { dqWindow, actionButton, optionButton, UI_COLORS } from "@/components/uiTheme";

/*
 * ほこらの「さきどり」(学びの設計 LP-11 §4.3)。EventBus "open-preview" (payload
 * なし) で開く。前提を満たす未受講単元 (mastery が none) の一覧をタップで選び、
 * "open-lesson" {skillId, entry:"story"} を直接発火する (readiness チェックは
 * ここで前提充足を確認済みなので handleOpenLesson を経由しない)。
 *
 * 閉じるときは必ず "preview-closed" を出す (項目タップで即レッスンへ渡るときも)。
 * handleOpenPreview はこれを待って advance() する。
 *
 * 前提グラフは src/content/lessons/prereqs.ts (LP-10) の prerequisitesFor を使う
 */

const MASTERY_ORDER: Record<string, number> = {
  none: 0,
  practicing: 1,
  can: 2,
  mastered: 3,
};

function isEligible(skillId: string): boolean {
  if (!hasLesson(skillId)) return false;
  const save = getSave();
  if (masteryOf(save, skillId).state !== "none") return false;
  return prerequisitesFor(skillId).every(
    (pre) => MASTERY_ORDER[masteryOf(save, pre).state] >= MASTERY_ORDER.can,
  );
}

function eligibleSkillIds(): string[] {
  return SKILLS.filter((s) => isEligible(s.id)).map((s) => s.id);
}

export function PreviewMenu() {
  const [open, setOpen] = useState(false);
  const [skillIds, setSkillIds] = useState<string[]>([]);

  useEffect(() => {
    const onOpen = () => {
      setSkillIds(eligibleSkillIds());
      setOpen(true);
    };
    EventBus.on("open-preview", onOpen);
    return () => {
      EventBus.off("open-preview", onOpen);
    };
  }, []);

  const close = () => {
    setOpen(false);
    EventBus.emit("preview-closed");
  };

  const choose = (skillId: string) => {
    setOpen(false);
    EventBus.emit("open-lesson", { skillId, entry: "story" });
    EventBus.emit("preview-closed");
  };

  if (!open) return null;

  const swallow = (e: SyntheticEvent) => e.stopPropagation();

  return (
    <div
      data-testid="preview-menu"
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
        aria-label="さきどり"
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
          さきどり
        </div>

        {skillIds.length === 0 ? (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--kids-font)",
              fontWeight: 700,
              fontSize: "clamp(16px, 2.2vw, 20px)",
              color: "#ffffff",
              lineHeight: 1.6,
            }}
          >
            いまは まなべる たんげんが ないよ。すこし すすめてから もどってきてね。
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {skillIds.map((skillId) => (
              <button
                key={skillId}
                type="button"
                data-testid="preview-menu-item"
                data-skill={skillId}
                onClick={() => choose(skillId)}
                style={{ ...optionButton(false), minHeight: 58 }}
              >
                {SKILLS.find((s) => s.id === skillId)?.label ?? skillId}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          data-testid="preview-close"
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

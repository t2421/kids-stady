"use client";

import { useEffect, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { getSave } from "@/game/session";
import { goalsView, type ChapterGoal, type GoalUnit, type GoalsView } from "@/lib/goals";
import { SKILLS } from "@/lib/curriculum";
import { actionButton, dqWindow, UI_COLORS } from "@/components/uiTheme";
/* Phaser 非依存の音モジュールなので React から直接 import してよい (sfx.ts 冒頭参照) */
import { playSfx } from "@/game/audio/sfx";

/*
 * めあて パネル。"open-goals" で開き、"goals-closed" {skillId | null} で閉じる
 * (lessonFlow.handleOpenGoals が えらばれた単元の レッスンへ つなぐ — 前提チェックつき)。
 *
 *   いまの めあて : この章の とびらを ひらく 3単元
 *   さきどり     : その先の章の 3単元 (学年より上なら ★ が もらえる)
 *
 * まだ前提が そろっていない単元は「まず ○○」ボタンで 前提の単元へ まっすぐ案内する。
 * iPad タッチ第一: ボタンは 64px 以上、カードは 指で押しやすい 大きさ。
 */

const STATE_LABEL: Record<GoalUnit["state"], string> = {
  none: "まだ",
  practicing: "れんしゅうちゅう",
  can: "できる",
  mastered: "マスター",
};

const font: React.CSSProperties = { fontFamily: "var(--kids-font)", color: "#ffffff" };

function labelOf(skillId: string): string {
  return SKILLS.find((s) => s.id === skillId)?.label ?? skillId;
}

function UnitCard({ unit, onPick }: { unit: GoalUnit; onPick: (skillId: string) => void }) {
  const done = unit.state === "can" || unit.state === "mastered";
  const target = unit.ready ? unit.skillId : unit.needsFirst;
  return (
    <div
      data-testid="goal-unit"
      data-skill={unit.skillId}
      data-state={unit.state}
      style={{
        flex: "1 1 240px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "14px 14px 16px",
        borderRadius: 14,
        border: `3px solid ${done ? "var(--kids-good)" : UI_COLORS.accent}`,
        background: done ? "rgba(62, 196, 109, 0.14)" : "rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ ...font, fontSize: 14, color: UI_COLORS.textSub }}>{unit.grade}ねんせい</span>
        {unit.ahead && (
          <span
            data-testid="goal-ahead-badge"
            style={{ ...font, fontSize: 14, fontWeight: 700, color: UI_COLORS.yellow }}
          >
            ★ さきどり
          </span>
        )}
        <span style={{ ...font, fontSize: 14, marginLeft: "auto", color: done ? "var(--kids-good)" : UI_COLORS.textSub }}>
          {STATE_LABEL[unit.state]}
        </span>
      </div>
      <span style={{ ...font, fontSize: "clamp(18px, 2.4vw, 22px)", fontWeight: 700 }}>{unit.label}</span>
      {done ? (
        <span style={{ ...font, fontSize: 18, fontWeight: 700, color: "var(--kids-good)" }}>できた! ✓</span>
      ) : (
        <button
          data-testid="goal-learn"
          data-skill={target ?? ""}
          disabled={!target}
          style={{ ...actionButton(unit.ready ? "#2f6b3a" : "#1a4a72"), minHeight: 64, width: "100%" }}
          onClick={() => target && onPick(target)}
        >
          {unit.ready ? "まなぶ" : `まず「${labelOf(target ?? "")}」から`}
        </button>
      )}
    </div>
  );
}

function GoalSection({
  goal,
  heading,
  sub,
  onPick,
  testId,
}: {
  goal: ChapterGoal;
  heading: string;
  sub: string;
  onPick: (skillId: string) => void;
  testId: string;
}) {
  return (
    <section data-testid={testId} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h2 style={{ ...font, margin: 0, fontSize: "clamp(19px, 2.6vw, 24px)", color: UI_COLORS.yellow }}>
        {heading}
      </h2>
      <p style={{ ...font, margin: 0, fontSize: 16, color: UI_COLORS.textSub }}>{sub}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {goal.units.map((u) => (
          <UnitCard key={u.skillId} unit={u} onPick={onPick} />
        ))}
      </div>
    </section>
  );
}

export function GoalsPanel() {
  const [view, setView] = useState<GoalsView | null>(null);

  useEffect(() => {
    const onOpen = () => {
      setView(goalsView(getSave()));
      playSfx("confirm");
    };
    EventBus.on("open-goals", onOpen);
    return () => {
      EventBus.off("open-goals", onOpen);
    };
  }, []);

  if (!view) return null;

  const close = (skillId: string | null) => {
    setView(null);
    playSfx(skillId ? "confirm" : "cancel");
    EventBus.emit("goals-closed", { skillId });
  };

  const { current, ahead } = view;
  return (
    <div
      data-testid="goals-panel"
      onClick={() => close(null)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 8, 20, 0.6)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={dqWindow({
          width: "min(94vw, 920px)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "18px 22px 20px",
          borderRadius: 14,
        })}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{ ...font, fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700 }}>★ めあて</span>
          <span
            data-testid="goals-stars"
            style={{ ...font, marginLeft: "auto", fontSize: 20, fontWeight: 700, color: UI_COLORS.yellow }}
          >
            さきどりの ほし ★ {view.aheadStars}
          </span>
        </div>

        <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 22 }}>
          <GoalSection
            testId="goals-current"
            goal={current}
            heading={
              current.done
                ? `${current.gateTitle}への みちは ひらいているよ!`
                : `${current.gateTitle}を ひらこう`
            }
            sub={
              current.done
                ? "ぼうけんを すすめよう。さきどりで もっと つよく なれるよ。"
                : "この 3つが「できる」に なると とびらが ひらくよ。"
            }
            onPick={(id) => close(id)}
          />
          {ahead && (
            <GoalSection
              testId="goals-ahead"
              goal={ahead}
              heading={
                ahead.units.some((u) => u.ahead)
                  ? `さきどり ちょうせん — つぎは ${ahead.place}`
                  : `つぎの ぼうけんの じゅんび — つぎは ${ahead.place}`
              }
              sub={
                ahead.units.some((u) => u.ahead)
                  ? `${ahead.gateTitle}の とびらは この 3つで ひらくよ。がくねんより さきの さんすうで ★ が もらえるよ!`
                  : `${ahead.gateTitle}の とびらは この 3つで ひらくよ。さきに まなんで おこう!`
              }
              onPick={(id) => close(id)}
            />
          )}
        </div>

        <button
          data-testid="goals-close"
          style={{ ...actionButton("#8a2f1c"), alignSelf: "flex-end", minWidth: 170, flexShrink: 0 }}
          onClick={() => close(null)}
        >
          とじる
        </button>
      </div>
    </div>
  );
}

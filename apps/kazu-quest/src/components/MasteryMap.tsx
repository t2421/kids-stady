"use client";

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import { EventBus } from "@/game/EventBus";
import { getSave } from "@/game/session";
import { hasLesson } from "@/content/lessons/index";
import { buildMasteryMapRows, type MasteryMapRow } from "@/lib/masteryMapData";
import { masteryCellColor, masteryCellLabel, MASTERY_COLORS, MASTERY_LABELS } from "@/lib/masteryColors";
import type { MasteryState } from "@/lib/save";
import { actionButton, dqWindow, UI_COLORS } from "@/components/uiTheme";

/*
 * 単元マップ (学びの設計 LP-11b (1))。学年 (1〜6) × 単元 (最大8) の
 * グリッドで、全44単元の習熟状態を4色で表示する。
 * せいせきタブ (StatsScreen.tsx の StatsBody) のボタンから EventBus
 * "show-mastery-map" で開く。単独オーバーレイなので、StatsScreen (単独版) からでも
 * StatusPanelOverlay の せいせきタブからでも同じ入口で開ける。
 *
 * セルタップ (任意機能): hasLesson な単元だけ、そのままレッスンを開く
 * ("open-lesson" {skillId, entry:"story"} — PreviewMenu.tsx / TeacherMenu.tsx と
 * 同じ契約)。閉じるときは必ず "mastery-map-closed" を出す。
 */

const font: React.CSSProperties = {
  fontFamily: "var(--kids-font)",
  fontWeight: 700,
  color: "#ffffff",
};

const MASTERY_ORDER: readonly MasteryState[] = ["none", "practicing", "can", "mastered"];

function Legend() {
  return (
    <div
      data-testid="mastery-map-legend"
      style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", justifyContent: "center" }}
    >
      {MASTERY_ORDER.map((state) => (
        <div key={state} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            aria-hidden="true"
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: MASTERY_COLORS[state],
              border: "2px solid rgba(255,255,255,0.6)",
              display: "inline-block",
            }}
          />
          <span style={{ ...font, fontSize: 14, color: UI_COLORS.textSub }}>{MASTERY_LABELS[state]}</span>
        </div>
      ))}
    </div>
  );
}

function GradeRow({ row, onCellTap }: { row: MasteryMapRow; onCellTap: (skillId: string) => void }) {
  return (
    <div data-testid="mastery-map-row" data-grade={row.grade} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ ...font, fontSize: "clamp(15px, 2vw, 18px)", color: UI_COLORS.yellow }}>
        {row.grade}ねんせい
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 8,
        }}
      >
        {row.cells.map((cell) => {
          const color = masteryCellColor(cell.state);
          const tappable = hasLesson(cell.skillId);
          const cellStyle: React.CSSProperties = {
            ...font,
            fontSize: 13,
            minHeight: 52,
            padding: "6px 8px",
            borderRadius: 8,
            border: `3px solid ${color}`,
            background: cell.state === "mastered" ? "rgba(255,217,61,0.18)" : "rgba(255,255,255,0.06)",
            color: "#ffffff",
            textAlign: "left",
            cursor: tappable ? "pointer" : "default",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
          };
          const content = (
            <>
              <span>{cell.label}</span>
              <span style={{ fontSize: 11, color }}>{masteryCellLabel(cell.state)}</span>
            </>
          );
          return tappable ? (
            <button
              key={cell.skillId}
              type="button"
              data-testid="mastery-cell"
              data-skill={cell.skillId}
              data-state={cell.state}
              onClick={() => onCellTap(cell.skillId)}
              style={cellStyle}
            >
              {content}
            </button>
          ) : (
            <div key={cell.skillId} data-testid="mastery-cell" data-skill={cell.skillId} data-state={cell.state} style={cellStyle}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MasteryMap() {
  const [rows, setRows] = useState<MasteryMapRow[] | null>(null);
  const openRef = useRef(false);
  openRef.current = rows !== null;
  const openedAtRef = useRef(0);

  const close = useCallback(() => {
    if (!openRef.current) return;
    setRows(null);
    EventBus.emit("mastery-map-closed");
  }, []);

  useEffect(() => {
    const onShow = () => {
      openedAtRef.current = performance.now();
      setRows(buildMasteryMapRows(getSave()));
    };
    EventBus.on("show-mastery-map", onShow);
    return () => {
      EventBus.off("show-mastery-map", onShow);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!openRef.current) return;
      if (e.timeStamp <= openedAtRef.current) return;
      const key = e.key.toLowerCase();
      if (["x", "escape"].includes(key)) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const onCellTap = useCallback((skillId: string) => {
    setRows(null);
    EventBus.emit("open-lesson", { skillId, entry: "story" });
    EventBus.emit("mastery-map-closed");
  }, []);

  if (!rows) return null;

  const swallow = (e: SyntheticEvent) => e.stopPropagation();

  return (
    <div
      data-testid="mastery-map"
      onClick={swallow}
      onPointerDown={swallow}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 47,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 8, 20, 0.7)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="たんげんマップ"
        style={dqWindow({
          width: "min(94vw, 960px)",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 14,
          padding: "18px 22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        })}
      >
        <div style={{ ...font, fontSize: "clamp(22px, 3vw, 28px)", color: UI_COLORS.yellow, textAlign: "center" }}>
          たんげんマップ
        </div>
        <Legend />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {rows.map((row) => (
            <GradeRow key={row.grade} row={row} onCellTap={onCellTap} />
          ))}
        </div>
        <div style={{ display: "flex" }}>
          <button
            data-testid="mastery-map-close"
            style={{ ...actionButton("#8a2f1c"), marginLeft: "auto", minWidth: 170, minHeight: 60 }}
            onClick={close}
          >
            とじる
          </button>
        </div>
      </div>
    </div>
  );
}

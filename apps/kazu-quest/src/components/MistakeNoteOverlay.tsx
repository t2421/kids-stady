"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { MistakeEntry } from "@/lib/mistakes";
import { actionButton, dqWindow, UI_COLORS } from "@/components/uiTheme";

/*
 * 戦闘後の「まちがいノート」(設計 A6)。BattleScene が勝利演出のあと
 * "show-mistake-note" { entries, requestId } を emit し、こちらは 1 問ずつ
 * 問題文 / きみのこたえ / せいかい / かいせつ を見せる。「とじる」で
 * "mistake-note-done" { requestId } を返し、BattleScene がフィールドへ戻す。
 * iPad メイン: 全操作タップ完結 (ボタン ≥56px・文字 ≥20px)。背景タップでは閉じない。
 * キー (Z/Enter/Space=つぎへ, X/Escape=とじる) は補助。
 */

export interface MistakeNoteRequest {
  requestId: string;
  entries: MistakeEntry[];
}

const WRONG_COLOR = "#ff9c9c";

const label: React.CSSProperties = {
  fontFamily: "var(--kids-font)",
  fontSize: "clamp(16px, 2.2vw, 20px)",
  fontWeight: 700,
  color: UI_COLORS.textSub,
};

const value: React.CSSProperties = {
  fontFamily: "var(--kids-font)",
  fontSize: "clamp(22px, 3.2vw, 30px)",
  fontWeight: 700,
  color: "#ffffff",
  whiteSpace: "pre-wrap",
  lineHeight: 1.5,
};

export function MistakeNoteOverlay() {
  const [request, setRequest] = useState<MistakeNoteRequest | null>(null);
  const [index, setIndex] = useState(0);
  const requestRef = useRef<MistakeNoteRequest | null>(null);
  const indexRef = useRef(0);
  /* 開く前に発火した同一キーイベントで誤操作しないためのガード */
  const openedAtRef = useRef(0);
  requestRef.current = request;
  indexRef.current = index;

  const close = useCallback(() => {
    const req = requestRef.current;
    if (!req) return;
    setRequest(null);
    EventBus.emit("mistake-note-done", { requestId: req.requestId });
  }, []);

  const next = useCallback(() => {
    const req = requestRef.current;
    if (!req) return;
    if (indexRef.current + 1 < req.entries.length) {
      setIndex(indexRef.current + 1);
      return;
    }
    close();
  }, [close]);

  useEffect(() => {
    const onShow = (r: MistakeNoteRequest) => {
      if (r.entries.length === 0) {
        EventBus.emit("mistake-note-done", { requestId: r.requestId });
        return;
      }
      openedAtRef.current = performance.now();
      setRequest(r);
      setIndex(0);
    };
    EventBus.on("show-mistake-note", onShow);
    return () => {
      EventBus.off("show-mistake-note", onShow);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (!requestRef.current) return;
      if (e.timeStamp <= openedAtRef.current) return;
      const key = e.key.toLowerCase();
      if (key === "z" || key === "enter" || key === " ") next();
      else if (key === "x" || key === "escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, close]);

  if (!request) return null;
  const entry = request.entries[Math.min(index, request.entries.length - 1)];
  const isLast = index + 1 >= request.entries.length;

  return (
    <div
      data-testid="mistake-note"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 8, 20, 0.7)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={dqWindow({
          width: "min(94vw, 760px)",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 14,
          padding: "20px 26px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        })}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span
            style={{
              ...value,
              fontSize: "clamp(22px, 3vw, 28px)",
              color: UI_COLORS.yellow,
            }}
          >
            まちがいノート
          </span>
          <span data-testid="mistake-note-counter" style={label}>
            {index + 1} / {request.entries.length}
          </span>
        </div>

        <div
          style={{
            border: `2px solid ${UI_COLORS.accent}`,
            borderRadius: 12,
            padding: "14px 20px 16px",
          }}
        >
          <div style={label}>もんだい</div>
          <div data-testid="mistake-note-text" style={{ ...value, fontSize: "clamp(26px, 3.8vw, 36px)" }}>
            {entry.text}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 36px", marginTop: 14 }}>
            <div>
              <div style={label}>きみの こたえ</div>
              <div style={{ ...value, color: WRONG_COLOR }}>
                {entry.chosen === "" ? "じかんぎれ" : entry.chosen}
              </div>
            </div>
            <div>
              <div style={label}>せいかい</div>
              <div data-testid="mistake-note-answer" style={{ ...value, color: UI_COLORS.yellow }}>
                {entry.answer}
              </div>
            </div>
          </div>
        </div>

        {entry.explain.length > 0 && (
          <div style={{ padding: "0 6px" }}>
            <div style={label}>かいせつ</div>
            <ol
              style={{
                margin: "6px 0 0",
                paddingLeft: 30,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {entry.explain.map((line, i) => (
                <li key={i} style={{ ...value, fontSize: "clamp(20px, 2.6vw, 24px)" }}>
                  {line}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            data-testid="mistake-note-close"
            style={{ ...actionButton("#8a2f1c"), minWidth: 170, fontSize: 20 }}
            onClick={close}
          >
            とじる
          </button>
          {!isLast && (
            <button
              data-testid="mistake-note-next"
              style={{ ...actionButton("#2f6b3a"), minWidth: 200, fontSize: 20 }}
              onClick={next}
            >
              つぎへ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

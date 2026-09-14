"use client";

import { useState } from "react";
import type { MistakeRow } from "@/game/field/statusSections";
import { UI_COLORS } from "@/components/uiTheme";

/*
 * ステータスパネル「ノート」タブの本文。直近の間違い (新しい順) を
 * 1行1問で並べ、行をタップすると かいせつ が開く (もう一度タップで閉じる)。
 * 行は ≥56px のタップ対象。文字は ≥18px。
 */

const WRONG_COLOR = "#ff9c9c";

const font: React.CSSProperties = {
  fontFamily: "var(--kids-font)",
  fontWeight: 700,
  color: "#ffffff",
};

export function MistakeNoteList({ rows }: { rows: MistakeRow[] }) {
  const [open, setOpen] = useState<number | null>(null);

  if (rows.length === 0) {
    return (
      <div
        style={{
          ...font,
          fontSize: "clamp(16px, 2.3vw, 21px)",
          textAlign: "center",
          marginTop: 40,
        }}
      >
        まちがえた もんだいは まだ ないよ。
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 4px" }}>
      {rows.map((row, i) => {
        const expanded = open === i;
        return (
          <button
            key={`${row.ts}-${i}`}
            data-testid="mistake-note-row"
            aria-expanded={expanded}
            onClick={() => setOpen(expanded ? null : i)}
            style={{
              ...font,
              minHeight: 56,
              textAlign: "left",
              padding: "10px 16px",
              borderRadius: 12,
              border: `2px solid ${expanded ? "#ffffff" : "rgba(255,255,255,0.3)"}`,
              background: expanded ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
              cursor: "pointer",
              color: "#ffffff",
            }}
          >
            <div style={{ fontSize: 15, color: UI_COLORS.textSub, marginBottom: 2 }}>
              {row.skill}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                gap: "4px 22px",
                fontSize: "clamp(18px, 2.5vw, 23px)",
              }}
            >
              <span style={{ flex: "1 1 240px", whiteSpace: "pre-wrap" }}>{row.text}</span>
              <span>
                <span style={{ color: WRONG_COLOR }}>
                  {row.chosen === "" ? "じかんぎれ" : row.chosen}
                </span>
                <span style={{ color: UI_COLORS.textSub, margin: "0 8px" }}>→</span>
                <span style={{ color: UI_COLORS.yellow }}>{row.answer}</span>
              </span>
            </div>
            {expanded && (
              <ol
                data-testid="mistake-note-explain"
                style={{
                  margin: "10px 0 2px",
                  paddingLeft: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  fontSize: "clamp(17px, 2.3vw, 21px)",
                  fontWeight: 500,
                }}
              >
                {row.explain.length === 0 ? (
                  <li style={{ listStyle: "none", marginLeft: -28 }}>かいせつは ないよ。</li>
                ) : (
                  row.explain.map((line, j) => <li key={j}>{line}</li>)
                )}
              </ol>
            )}
          </button>
        );
      })}
    </div>
  );
}

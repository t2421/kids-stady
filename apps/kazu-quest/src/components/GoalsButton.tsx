"use client";

import { useEffect, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { getSave } from "@/game/session";
import { goalsView } from "@/lib/goals";

/*
 * 常設の「★ めあて」ボタン (左上。右上は メニュー)。フィールドに いる間だけ出す。
 * いまの とびらに まだ「できる」でない単元が あるあいだは 小さな「!」を付けて
 * 「つぎに すること」が あると わかるようにする (はじめての子の 道しるべ)。
 */
export function GoalsButton() {
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const show = () => {
      setVisible(true);
      setPending(!goalsView(getSave()).current.done);
    };
    const hide = () => setVisible(false);
    EventBus.on("field-ready", show);
    EventBus.on("field-gone", hide);
    /* レッスンで 単元が できるように なったら「!」を 見なおす */
    EventBus.on("lesson-finished", show);
    return () => {
      EventBus.off("field-ready", show);
      EventBus.off("field-gone", hide);
      EventBus.off("lesson-finished", show);
    };
  }, []);

  if (!visible) return null;
  return (
    <button
      data-testid="goals-button"
      onClick={() => EventBus.emit("goals-button-pressed")}
      style={{
        position: "fixed",
        top: 14,
        left: 16,
        zIndex: 30,
        minWidth: 150,
        minHeight: 56,
        fontFamily: "var(--kids-font)",
        fontSize: 21,
        fontWeight: 700,
        color: "#1a2f55",
        background: "#ffd84a",
        border: "3px solid #ffffff",
        borderRadius: 12,
        cursor: "pointer",
      }}
    >
      ★ めあて
      {pending && (
        <span
          data-testid="goals-pending"
          aria-label="まだ できていない めあてが あるよ"
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 28,
            height: 28,
            borderRadius: 14,
            background: "#d9463b",
            color: "#ffffff",
            fontSize: 18,
            lineHeight: "28px",
            border: "2px solid #ffffff",
          }}
        >
          !
        </span>
      )}
    </button>
  );
}

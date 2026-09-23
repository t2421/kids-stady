"use client";

import { useEffect, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { autosave, getSave, updateSave } from "@/game/session";
import { UI_COLORS } from "@/components/uiTheme";

/*
 * はじめての ぼうけんの 道しるべ (UX 監査: 「はじめから」で いきなり フィールドに
 * 立たされ、目的も 動かし方も 書いていなかった)。
 *
 * ★ めあて ボタンの下に ふきだしを 2つ出す:
 *   - いきたい ところを タップすると あるくよ
 *   - ★ めあて で つぎに すること が わかるよ
 * 画面を ふさがない (pointer-events: none) ので あそびを じゃましない。
 * 1つの セーブで 1回だけ (flag tutorial.intro)。遊びはじめ (10分未満) のときだけ。
 */

export const INTRO_FLAG = "tutorial.intro";
const SHOW_MS = 12_000;
const EARLY_PLAY_MS = 10 * 60_000;

const bubble: React.CSSProperties = {
  fontFamily: "var(--kids-font)",
  fontSize: "clamp(16px, 2.2vw, 20px)",
  fontWeight: 700,
  color: UI_COLORS.navy,
  background: "#fff6c8",
  border: `3px solid ${UI_COLORS.yellow}`,
  borderRadius: 14,
  padding: "10px 14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
};

export function FirstRunTips() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onField = () => {
      const save = getSave();
      if (save.flags[INTRO_FLAG] || save.playtimeMs >= EARLY_PLAY_MS) return;
      updateSave((s) => ({ ...s, flags: { ...s.flags, [INTRO_FLAG]: true } }));
      autosave();
      setVisible(true);
      timer = setTimeout(() => setVisible(false), SHOW_MS);
    };
    const hide = () => setVisible(false);
    EventBus.on("field-ready", onField);
    EventBus.on("field-gone", hide);
    EventBus.on("goals-button-pressed", hide);
    return () => {
      if (timer !== null) clearTimeout(timer);
      EventBus.off("field-ready", onField);
      EventBus.off("field-gone", hide);
      EventBus.off("goals-button-pressed", hide);
    };
  }, []);

  if (!visible) return null;
  return (
    <div
      data-testid="first-run-tips"
      role="status"
      style={{
        position: "fixed",
        top: 84,
        left: 16,
        zIndex: 29,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: "min(80vw, 360px)",
        pointerEvents: "none",
      }}
    >
      <div style={bubble}>▲ ★ めあて を おすと、つぎに すること が わかるよ</div>
      <div style={bubble}>いきたい ところを タップすると、そこまで あるくよ</div>
    </div>
  );
}

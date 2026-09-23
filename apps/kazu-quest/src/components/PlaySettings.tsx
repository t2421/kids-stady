"use client";

import { useState } from "react";
import { autosave, getSave, updateSave } from "@/game/session";
import type { AnswerTimeMode } from "@/lib/save";
import { ANSWER_TIME_LABELS, defaultAnswerTimeFor } from "@/lib/answerTime";
import { pillButton, UI_COLORS } from "@/components/uiTheme";
/* Phaser 非依存の音モジュールなので React から直接 import してよい (sfx.ts 冒頭参照) */
import { playSfx } from "@/game/audio/sfx";

/*
 * ステータス画面の せってい (おと の下): 「こたえる じかん」と「がくねん」。
 * がくねんは さきどり (学年より上の単元) の判定と おすすめの 既定値にだけ使い、
 * 進めるところは しばらない。えらびなおすと こたえる じかん も おすすめに合わせる。
 */

const TIME_MODES: AnswerTimeMode[] = ["normal", "slow", "off"];
const GRADES = [1, 2, 3, 4, 5, 6];

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--kids-font)",
  fontSize: 15,
  color: UI_COLORS.textSub,
};

export function PlaySettings() {
  const [answerTime, setAnswerTime] = useState<AnswerTimeMode>(() => getSave().settings.answerTime);
  const [grade, setGrade] = useState<number | null>(() => getSave().settings.schoolGrade);

  const save = (patch: Partial<{ answerTime: AnswerTimeMode; schoolGrade: number | null }>) => {
    updateSave((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    autosave();
    playSfx("confirm");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
      <span style={labelStyle}>たたかいで こたえる じかん</span>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {TIME_MODES.map((mode) => (
          <button
            key={mode}
            data-testid="answer-time"
            data-mode={mode}
            aria-pressed={answerTime === mode}
            style={{ ...pillButton(answerTime === mode), flex: "1 1 96px", minHeight: 56 }}
            onClick={() => {
              setAnswerTime(mode);
              save({ answerTime: mode });
            }}
          >
            {ANSWER_TIME_LABELS[mode]}
          </button>
        ))}
      </div>

      <span style={labelStyle}>がっこうの がくねん (さきどりの めやすに つかうよ)</span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {GRADES.map((g) => (
          <button
            key={g}
            data-testid="school-grade"
            data-grade={String(g)}
            aria-pressed={grade === g}
            style={{ ...pillButton(grade === g), flex: "1 1 64px", minHeight: 56 }}
            onClick={() => {
              const nextTime = defaultAnswerTimeFor(g);
              setGrade(g);
              setAnswerTime(nextTime);
              save({ schoolGrade: g, answerTime: nextTime });
            }}
          >
            {g}ねん
          </button>
        ))}
      </div>
    </div>
  );
}

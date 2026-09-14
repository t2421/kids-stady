"use client";

import { useEffect, useState } from "react";
import { answerNeedsKey } from "@/lib/curriculum/answer";
import { UI_COLORS } from "@/components/uiTheme";

/*
 * テンキー (KQ-12): 小3以降の習得テスト・おだい・とっくんで答えを自分で打つ。
 * 4列×4段 + 表示欄。全キー ≥72px (iPad タッチ第一)、iPad 横持ちのパネルに収まる高さ (≤420px)。
 *   7 8 9 けす
 *   4 5 6 .
 *   1 2 3 /
 *   0 0 こたえる こたえる
 * 「.」「/」は答えに含まれないときは無効化 (迷子防止)。「けす」は1文字消す。
 * キーボード (数字 / . / / / Backspace / Enter) は補助。
 */

export const KEYPAD_MAX_LENGTH = 8;
const KEY_SIZE = 72;
const GAP = 8;

const DIGIT_ROWS: string[][] = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
];

export function appendKey(value: string, key: string): string {
  if (value.length >= KEYPAD_MAX_LENGTH) return value;
  /* 記号は1回だけ・先頭以外 (".5" は許すので "." だけ先頭可) */
  if (key === "/" && (value === "" || value.includes("/") || value.endsWith("."))) return value;
  if (key === "." && (value.includes(".") || value.includes("/"))) return value;
  return value + key;
}

export function Keypad({
  expected,
  disabled,
  tone,
  onSubmit,
}: {
  expected: string;
  disabled: boolean;
  /* 回答後の表示欄の色 */
  tone: "correct" | "wrong" | null;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const canDot = answerNeedsKey(expected, ".");
  const canSlash = answerNeedsKey(expected, "/");
  const canSubmit = !disabled && value !== "";

  const press = (key: string) => {
    if (disabled) return;
    setValue((v) => appendKey(v, key));
  };
  const erase = () => {
    if (disabled) return;
    setValue((v) => v.slice(0, -1));
  };
  const submit = () => {
    if (!canSubmit) return;
    onSubmit(value);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return;
      if (/^[0-9]$/.test(e.key) || e.key === "." || e.key === "/") {
        if (e.key === "." && !canDot) return;
        if (e.key === "/" && !canSlash) return;
        press(e.key);
      } else if (e.key === "Backspace") {
        erase();
      } else if (e.key === "Enter" && value !== "") {
        e.preventDefault();
        onSubmit(value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, canDot, canSlash, value, onSubmit]);

  const displayBorder =
    tone === "correct"
      ? "3px solid var(--kids-good)"
      : tone === "wrong"
        ? "3px solid var(--kids-bad)"
        : `3px solid ${UI_COLORS.accent}`;

  return (
    <div
      data-testid="keypad"
      style={{ display: "flex", flexDirection: "column", gap: GAP, maxHeight: 420 }}
    >
      <div
        data-testid="keypad-display"
        aria-live="polite"
        style={{
          minHeight: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          border: displayBorder,
          background: "rgba(255,255,255,0.08)",
          fontFamily: "var(--kids-font)",
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: 2,
          color: value === "" ? UI_COLORS.textSub : "#ffffff",
        }}
      >
        {value === "" ? "こたえを うってね" : value}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: KEY_SIZE,
          gap: GAP,
        }}
      >
        {DIGIT_ROWS[0].map((k) => keyButton(k, () => press(k), disabled))}
        {keyButton("けす", erase, disabled, { testId: "keypad-clear", small: true })}
        {DIGIT_ROWS[1].map((k) => keyButton(k, () => press(k), disabled))}
        {keyButton(".", () => press("."), disabled || !canDot)}
        {DIGIT_ROWS[2].map((k) => keyButton(k, () => press(k), disabled))}
        {keyButton("/", () => press("/"), disabled || !canSlash)}
        {keyButton("0", () => press("0"), disabled, { span: 2 })}
        {keyButton("こたえる", submit, !canSubmit, {
          testId: "keypad-submit",
          span: 2,
          small: true,
          accent: true,
        })}
      </div>
    </div>
  );
}

function keyButton(
  label: string,
  onTap: () => void,
  disabled: boolean,
  opts: { testId?: string; span?: number; small?: boolean; accent?: boolean } = {},
) {
  const isKey = opts.testId === undefined;
  return (
    <button
      key={label}
      type="button"
      data-testid={opts.testId ?? "keypad-key"}
      data-key={isKey ? label : undefined}
      onClick={onTap}
      disabled={disabled}
      style={{
        gridColumn: opts.span ? `span ${opts.span}` : undefined,
        minHeight: KEY_SIZE,
        minWidth: KEY_SIZE,
        fontFamily: "var(--kids-font)",
        fontSize: opts.small ? 22 : 30,
        fontWeight: 700,
        borderRadius: 16,
        border: opts.accent ? "3px solid #ffffff" : "3px solid rgba(255,255,255,0.25)",
        background: opts.accent ? UI_COLORS.navy : "rgba(255,255,255,0.08)",
        color: "#ffffff",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

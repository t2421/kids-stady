"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { autosave, getProfileId, startSession, updateSave } from "@/game/session";
import { defaultAnswerTimeFor } from "@/lib/answerTime";
import { isTitleActive } from "@/game/titleState";
import { defaultSave, hasSave, persistSave } from "@/lib/save";
import { actionButton, dqWindow, UI_COLORS } from "@/components/uiTheme";

/*
 * タイトルメニュー (KQ-22): つづきから / はじめから / せいせき。
 * プロフィール確定 ("profile-ready") か タイトル再表示 ("title-ready") で出て、
 * "title-start" を emit すると TitleScene が冒険を始める。
 * 「はじめから」はセーブがあるとき 2段階確認 (プロフィール削除と同じ作法)。
 * せいせき は StatsScreen ("show-stats") に任せる。キー操作は補助 (Enter = 既定の選択)。
 */

/*
 * grade: はじめから のとき「いま なんねんせい?」を1回だけ きく (ひみつ も えらべる)。
 * 学年は さきどり (学年より上の単元 — lib/goals.ts) の判定と、こたえる じかん の
 * おすすめにだけ使い、進めるところは しばらない
 */
type Step = "menu" | "confirm" | "grade";

const menuButton = (primary: boolean): React.CSSProperties => ({
  ...actionButton(primary ? UI_COLORS.navy : "rgba(255,255,255,0.08)"),
  minHeight: 64,
  width: "100%",
  fontSize: "clamp(20px, 2.6vw, 26px)",
  color: primary ? UI_COLORS.yellow : "#ffffff",
  border: primary ? `3px solid ${UI_COLORS.yellow}` : "3px solid rgba(255,255,255,0.55)",
});

export function TitleMenu() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [canContinue, setCanContinue] = useState(false);
  const [step, setStep] = useState<Step>("menu");
  const [statsOpen, setStatsOpen] = useState(false);
  const openedAtRef = useRef(0);
  const stateRef = useRef({ profileId, canContinue, step, statsOpen });
  stateRef.current = { profileId, canContinue, step, statsOpen };

  /* タイトルが表示中 かつ プロフィール確定済み のときだけ出す */
  const refresh = useCallback(() => {
    const id = getProfileId();
    if (id === null || !isTitleActive()) {
      setProfileId(null);
      return;
    }
    setProfileId(id);
    setCanContinue(hasSave(id));
    setStep("menu");
    openedAtRef.current = performance.now();
  }, []);

  useEffect(() => {
    refresh();
    const onStatsShow = () => setStatsOpen(true);
    const onStatsClosed = () => setStatsOpen(false);
    EventBus.on("title-ready", refresh);
    EventBus.on("profile-ready", refresh);
    EventBus.on("show-stats", onStatsShow);
    EventBus.on("stats-closed", onStatsClosed);
    return () => {
      EventBus.off("title-ready", refresh);
      EventBus.off("profile-ready", refresh);
      EventBus.off("show-stats", onStatsShow);
      EventBus.off("stats-closed", onStatsClosed);
    };
  }, [refresh]);

  const start = useCallback(() => {
    setProfileId(null);
    EventBus.emit("title-start");
  }, []);

  const onNewGame = useCallback(() => {
    if (stateRef.current.canContinue) {
      setStep("confirm");
      return;
    }
    setStep("grade");
  }, []);

  const onConfirmYes = useCallback(() => {
    const id = stateRef.current.profileId;
    if (id) {
      persistSave(id, defaultSave());
      /* セッションの save も書き出した既定値に差し替える */
      startSession(id);
    }
    setStep("grade");
  }, []);

  /* 学年を きいてから 冒険へ。null = ひみつ */
  const onPickGrade = useCallback(
    (grade: number | null) => {
      updateSave((s) => ({
        ...s,
        settings: { ...s.settings, schoolGrade: grade, answerTime: defaultAnswerTimeFor(grade) },
      }));
      autosave();
      start();
    },
    [start],
  );

  const onConfirmNo = useCallback(() => setStep("menu"), []);

  /* キー操作は補助: Enter/Space = 既定の選択、Esc = 確認をやめる */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (s.profileId === null || s.statsOpen) return;
      /* メニューを開く前に発火したキーで即決定しない (他オーバーレイと同じガード) */
      if (e.timeStamp <= openedAtRef.current) return;
      const key = e.key;
      if (s.step === "confirm") {
        if (key === "Escape") onConfirmNo();
        return;
      }
      if (s.step === "grade") return;
      if (key === "Enter" || key === " ") {
        e.preventDefault();
        if (s.canContinue) start();
        else onNewGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onConfirmNo, onNewGame, start]);

  if (profileId === null) return null;

  /* パネル内のタップはゲーム (canvas) へ伝えない */
  const swallow = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      data-testid="title-menu"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "5vh",
        pointerEvents: "none",
        fontFamily: "var(--kids-font)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          step === "confirm"
            ? "はじめから の かくにん"
            : step === "grade"
              ? "いま なんねんせい?"
              : "タイトルメニュー"
        }
        onClick={swallow}
        onPointerDown={swallow}
        style={dqWindow({
          pointerEvents: "auto",
          width: "min(92vw, 460px)",
          padding: "18px 22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        })}
      >
        {step === "menu" ? (
          <>
            {canContinue && (
              <button data-testid="title-continue" style={menuButton(true)} onClick={start}>
                つづきから
              </button>
            )}
            <button
              data-testid="title-newgame"
              style={menuButton(!canContinue)}
              onClick={onNewGame}
            >
              はじめから
            </button>
            <button
              data-testid="title-stats"
              style={menuButton(false)}
              onClick={() => EventBus.emit("show-stats")}
            >
              せいせき
            </button>
          </>
        ) : step === "grade" ? (
          <>
            <div
              style={{
                fontSize: "clamp(18px, 2.4vw, 22px)",
                fontWeight: 700,
                lineHeight: 1.5,
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              いま なんねんせい?
              <br />
              <span style={{ fontSize: 16, color: UI_COLORS.textSub }}>
                うえの がくねんの さんすうも まなべるよ
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <button
                  key={g}
                  data-testid="title-grade"
                  data-grade={String(g)}
                  style={{ ...menuButton(false), minHeight: 64 }}
                  onClick={() => onPickGrade(g)}
                >
                  {g}ねん
                </button>
              ))}
            </div>
            <button
              data-testid="title-grade-skip"
              style={menuButton(false)}
              onClick={() => onPickGrade(null)}
            >
              ひみつ
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "clamp(18px, 2.4vw, 22px)",
                fontWeight: 700,
                lineHeight: 1.5,
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              ほんとうに さいしょから?
              <br />
              <span style={{ color: "#ffb0b0" }}>いままでの きろくは きえます</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                data-testid="title-confirm-no"
                style={{ ...menuButton(true), flex: 1 }}
                onClick={onConfirmNo}
              >
                やめる
              </button>
              <button
                data-testid="title-confirm-yes"
                style={{
                  ...menuButton(false),
                  flex: 1,
                  background: "rgba(255,80,80,0.3)",
                  color: "#ffb0b0",
                }}
                onClick={onConfirmYes}
              >
                はい、けす
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

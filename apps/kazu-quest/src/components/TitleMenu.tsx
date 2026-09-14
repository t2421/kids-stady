"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { getProfileId, startSession } from "@/game/session";
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

type Step = "menu" | "confirm";

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
    start();
  }, [start]);

  const onConfirmYes = useCallback(() => {
    const id = stateRef.current.profileId;
    if (id) {
      persistSave(id, defaultSave());
      /* セッションの save も書き出した既定値に差し替える */
      startSession(id);
    }
    start();
  }, [start]);

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
        aria-label={step === "confirm" ? "はじめから の かくにん" : "タイトルメニュー"}
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

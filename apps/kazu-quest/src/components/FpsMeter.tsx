"use client";

import { useEffect, useState } from "react";

/*
 * FPS 表示 (KQ-40 性能監査)。URL に ?debug=1 があるときだけ左上に小さく出す。
 * dev / prod どちらでも動く (実機 iPad で GitHub Pages の URL に付けて読むため)。
 * 値は Phaser の game.loop.actualFps を 4 回/秒で丸めて表示するだけで、
 * ゲームの状態には一切触れない。Phaser 本体は PhaserGame.tsx が
 * window.__KAZUQUEST_GAME__ に置いたものを読む。
 */

const SAMPLE_INTERVAL_MS = 250;

interface GameLike {
  loop?: { actualFps?: number };
}

function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "1";
}

function readFps(): number | null {
  if (typeof window === "undefined") return null;
  const game = (window as unknown as { __KAZUQUEST_GAME__?: GameLike })
    .__KAZUQUEST_GAME__;
  const fps = game?.loop?.actualFps;
  return typeof fps === "number" ? Math.round(fps) : null;
}

const meterStyle: React.CSSProperties = {
  position: "fixed",
  top: 4,
  left: 4,
  zIndex: 90 /* OrientationGuard (70) より上: 計測中も常に読めるようにする */,
  padding: "2px 6px",
  fontFamily: "ui-monospace, Menlo, monospace",
  fontSize: 12,
  lineHeight: 1.4,
  color: "#d8f5a2",
  background: "rgba(0, 0, 0, 0.6)",
  borderRadius: 3,
  pointerEvents: "none",
  userSelect: "none",
};

export function FpsMeter() {
  const [enabled, setEnabled] = useState(false);
  const [fps, setFps] = useState<number | null>(null);

  useEffect(() => {
    if (!isDebugEnabled()) return;
    setEnabled(true);
    const timer = window.setInterval(() => setFps(readFps()), SAMPLE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  if (!enabled) return null;
  return (
    <div data-testid="fps-meter" style={meterStyle} aria-live="off">
      {fps === null ? "fps --" : `fps ${fps}`}
    </div>
  );
}

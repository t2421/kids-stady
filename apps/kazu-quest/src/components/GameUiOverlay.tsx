"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { dqWindow, optionButton } from "@/components/uiTheme";

/*
 * DQ風の会話UI (メッセージ / はい・いいえ / 選択リスト / マップ名トースト)。
 * Canvas の手動レイアウトは崩れやすいため DOM で描画する (設計変更 2026-07-27)。
 * UiScene が "ui-message" 等を emit し、完了を "ui-*-done" で返す契約。
 * キー操作 (Z/Enter/Space=すすむ, ↑↓=えらぶ, X=もどる) は補助で、
 * iPad ではすべてタップで完結する。
 */

const TYPE_MS = 28; /* 1文字あたりの表示間隔 */

type UiRequest =
  | { kind: "message"; id: number; pages: string[] }
  | { kind: "choice"; id: number; prompt: string }
  | { kind: "list"; id: number; prompt: string; options: string[] };

const windowStyle: React.CSSProperties = dqWindow({
  position: "fixed",
  left: "50%",
  bottom: 20,
  transform: "translateX(-50%)",
  width: "min(94vw, 900px)",
  minHeight: 140,
  padding: "20px 26px 24px",
  fontSize: "clamp(18px, 2.8vw, 25px)",
  lineHeight: 1.55,
  whiteSpace: "pre-wrap",
});

export function GameUiOverlay() {
  const [request, setRequest] = useState<UiRequest | null>(null);
  const [shownChars, setShownChars] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [selected, setSelected] = useState(0);
  const [mapName, setMapName] = useState<string | null>(null);
  const requestRef = useRef<UiRequest | null>(null);
  /* リクエストが開く前に発火した同一キーイベントが (リスナー間の
     マイクロタスクで再レンダーが挟まり) 届いて誤operateするのを防ぐ */
  const openedAtRef = useRef(0);
  const pageIndexRef = useRef(0);
  const shownRef = useRef(0);
  const selectedRef = useRef(0);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  requestRef.current = request;
  pageIndexRef.current = pageIndex;
  shownRef.current = shownChars;
  selectedRef.current = selected;

  const stopTyping = () => {
    if (typeTimer.current) clearInterval(typeTimer.current);
    typeTimer.current = null;
  };

  const startPage = useCallback((text: string) => {
    stopTyping();
    setShownChars(0);
    typeTimer.current = setInterval(() => {
      setShownChars((n) => {
        if (n + 1 >= text.length) stopTyping();
        return n + 1;
      });
    }, TYPE_MS);
  }, []);

  /* すすむ (タップ / Z キー)。ページ送り → 最終ページで完了イベント */
  const advance = useCallback(() => {
    const req = requestRef.current;
    if (!req) return;
    if (req.kind === "message") {
      const text = req.pages[pageIndexRef.current] ?? "";
      if (shownRef.current < text.length) {
        /* 表示途中なら全文即時表示 (連打でもページを飛ばさない) */
        stopTyping();
        setShownChars(text.length);
        return;
      }
      if (pageIndexRef.current + 1 < req.pages.length) {
        const next = pageIndexRef.current + 1;
        setPageIndex(next);
        startPage(req.pages[next]);
        return;
      }
      setRequest(null);
      EventBus.emit("ui-message-done", { id: req.id });
      return;
    }
    if (req.kind === "choice") {
      setRequest(null);
      EventBus.emit("ui-choice-done", { id: req.id, yes: selectedRef.current === 0 });
      return;
    }
    setRequest(null);
    EventBus.emit("ui-list-done", { id: req.id, index: selectedRef.current });
  }, [startPage]);

  const cancel = useCallback(() => {
    const req = requestRef.current;
    if (!req || req.kind !== "list") return;
    setRequest(null);
    EventBus.emit("ui-list-done", { id: req.id, index: null });
  }, []);

  useEffect(() => {
    const onMessage = (r: { id: number; pages: string[] }) => {
      openedAtRef.current = performance.now();
      setRequest({ kind: "message", id: r.id, pages: r.pages });
      setPageIndex(0);
      startPage(r.pages[0] ?? "");
    };
    const onChoice = (r: { id: number; prompt: string }) => {
      openedAtRef.current = performance.now();
      stopTyping();
      setRequest({ kind: "choice", id: r.id, prompt: r.prompt });
      setSelected(0);
    };
    const onList = (r: { id: number; prompt: string; options: string[] }) => {
      openedAtRef.current = performance.now();
      stopTyping();
      setRequest({ kind: "list", id: r.id, prompt: r.prompt, options: r.options });
      setSelected(0);
    };
    const onMapName = (r: { name: string }) => setMapName(r.name);
    EventBus.on("ui-message", onMessage);
    EventBus.on("ui-choice", onChoice);
    EventBus.on("ui-list", onList);
    EventBus.on("ui-map-name", onMapName);
    return () => {
      EventBus.off("ui-message", onMessage);
      EventBus.off("ui-choice", onChoice);
      EventBus.off("ui-list", onList);
      EventBus.off("ui-map-name", onMapName);
      stopTyping();
    };
  }, [startPage]);

  /* マップ名トーストは 1.8 秒で消える */
  useEffect(() => {
    if (mapName === null) return;
    const t = setTimeout(() => setMapName(null), 1800);
    return () => clearTimeout(t);
  }, [mapName]);

  /* キーボードは補助操作 (メインはタップ) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const req = requestRef.current;
      if (!req) return;
      /* リクエストが開く前に発火したイベントは対象外 */
      if (e.timeStamp <= openedAtRef.current) return;
      const key = e.key.toLowerCase();
      if (key === "z" || key === "enter" || key === " ") {
        advance();
      } else if (key === "x" || key === "escape") {
        cancel();
      } else if (key === "arrowup" || key === "arrowdown") {
        const delta = key === "arrowup" ? -1 : 1;
        const len =
          req.kind === "choice" ? 2 : req.kind === "list" ? req.options.length : 0;
        if (len > 0) setSelected((s) => (s + delta + len) % len);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, cancel]);

  const renderOption = (
    label: string,
    isSelected: boolean,
    onTap: () => void,
    key: number,
  ) => (
    <button
      key={key}
      data-testid="ui-option"
      onClick={onTap}
      style={optionButton(isSelected)}
    >
      {isSelected ? "▶ " : ""}
      {label}
    </button>
  );

  return (
    <>
      {mapName !== null && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 35,
            background: "rgba(0,0,0,0.65)",
            color: "#ffffff",
            fontFamily: "var(--kids-font)",
            fontSize: 24,
            fontWeight: 700,
            padding: "8px 22px",
            borderRadius: 10,
            pointerEvents: "none",
          }}
        >
          {mapName}
        </div>
      )}

      {request && (
        <div
          data-testid="ui-backdrop"
          onClick={request.kind === "message" ? advance : undefined}
          style={{ position: "fixed", inset: 0, zIndex: 40 }}
        >
          {/* 選択リスト: ウィンドウの上に浮かべる */}
          {request.kind === "list" && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={dqWindow({
                position: "fixed",
                right: "max(3vw, calc(50% - 450px))",
                bottom: 180,
                width: "min(88vw, 530px)",
                maxHeight: "58vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 14,
                borderRadius: 12,
              })}
            >
              {request.options.map((label, i) =>
                renderOption(
                  label,
                  i === selected,
                  () => {
                    setRequest(null);
                    EventBus.emit("ui-list-done", { id: request.id, index: i });
                  },
                  i,
                ),
              )}
            </div>
          )}

          <div style={windowStyle} onClick={(e) => {
            if (request.kind !== "message") e.stopPropagation();
          }}>
            {request.kind === "message" && (
              <>
                <span data-testid="ui-message-text">
                  {(request.pages[pageIndex] ?? "").slice(0, shownChars)}
                </span>
                {shownChars >= (request.pages[pageIndex] ?? "").length && (
                  <span
                    style={{
                      position: "absolute",
                      right: 22,
                      bottom: 10,
                      animation: "kq-blink 0.9s infinite",
                    }}
                  >
                    ▼
                  </span>
                )}
              </>
            )}
            {request.kind !== "message" && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                }}
              >
                <span style={{ flex: "1 1 320px" }}>{request.prompt}</span>
                {request.kind === "choice" && (
                  <div style={{ display: "flex", gap: 12 }}>
                    {renderOption("はい", selected === 0, () => {
                      setRequest(null);
                      EventBus.emit("ui-choice-done", { id: request.id, yes: true });
                    }, 0)}
                    {renderOption("いいえ", selected === 1, () => {
                      setRequest(null);
                      EventBus.emit("ui-choice-done", { id: request.id, yes: false });
                    }, 1)}
                  </div>
                )}
              </div>
            )}
          </div>
          <style>{`@keyframes kq-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.15; } }`}</style>
        </div>
      )}
    </>
  );
}

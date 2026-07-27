"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { StatusData } from "@/game/field/statusSections";
import { actionButton, dqWindow, pillButton, UI_COLORS } from "@/components/uiTheme";

/*
 * ステータスパネル (メニュー)。タブ (つよさ・そうび・じゅもん・もちもの) と
 * なかま切替で1画面1トピックにする。DOM 描画なので折り返し・はみ出しは
 * CSS に任せる (設計変更 2026-07-27)。iPad メイン: 全操作タップ完結、
 * ボタンは指向けサイズ、パネル内の誤タップでは閉じない。
 */

const TABS = ["つよさ", "そうび", "じゅもん", "もちもの"] as const;

const pill = (selected: boolean): React.CSSProperties => ({
  ...pillButton(selected),
  flex: "1 1 0",
});

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div
      style={{
        height: 14,
        borderRadius: 7,
        background: "#2a2a34",
        overflow: "hidden",
        marginTop: 6,
      }}
    >
      <div
        style={{
          width: `${ratio * 100}%`,
          height: "100%",
          borderRadius: 7,
          background: color,
        }}
      />
    </div>
  );
}

export function StatusPanelOverlay() {
  const [state, setState] = useState<{ id: number; data: StatusData } | null>(null);
  const [tab, setTab] = useState(0);
  const [member, setMember] = useState(0);
  const stateRef = useRef<typeof state>(null);
  stateRef.current = state;
  /* パネルを開いた瞬間の時刻。開く前に発火した同一キーイベントが
     (リスナー間のマイクロタスクで再レンダーが挟まり) ここへ届いて
     即closeしてしまうのを防ぐ */
  const openedAtRef = useRef(0);

  const close = useCallback(() => {
    const current = stateRef.current;
    if (!current) return;
    setState(null);
    EventBus.emit("ui-status-closed", { id: current.id });
  }, []);

  useEffect(() => {
    const onOpen = (r: { id: number; data: StatusData }) => {
      openedAtRef.current = performance.now();
      setState(r);
      setTab(0);
      setMember(0);
    };
    EventBus.on("ui-status", onOpen);
    return () => {
      EventBus.off("ui-status", onOpen);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (!stateRef.current) return;
      /* パネルが開く前に発火したイベントは対象外 */
      if (e.timeStamp <= openedAtRef.current) return;
      const key = e.key.toLowerCase();
      if (["z", "enter", " ", "x", "escape"].includes(key)) close();
      if (key === "arrowleft") setTab((t) => (t + TABS.length - 1) % TABS.length);
      if (key === "arrowright") setTab((t) => (t + 1) % TABS.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  if (!state) return null;
  const { data } = state;
  const m = data.members[Math.min(member, data.members.length - 1)];

  const lineFont: React.CSSProperties = {
    fontFamily: "var(--kids-font)",
    fontSize: "clamp(16px, 2.3vw, 21px)",
    color: "#ffffff",
  };

  return (
    <div
      data-testid="status-panel"
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 8, 20, 0.55)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={dqWindow({
          width: "min(94vw, 920px)",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 14,
          padding: "18px 22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        })}
      >
        {/* タブ + ゴールド */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {TABS.map((label, i) => (
            <button key={label} style={pill(i === tab)} onClick={() => setTab(i)}>
              {label}
            </button>
          ))}
          <span
            style={{
              marginLeft: 8,
              fontFamily: "var(--kids-font)",
              fontSize: "clamp(18px, 2.4vw, 24px)",
              fontWeight: 700,
              color: UI_COLORS.yellow,
              whiteSpace: "nowrap",
            }}
          >
            {data.gold} G
          </span>
        </div>

        {/* なかま切替 (もちもの はパーティ共有なので出さない) */}
        {tab !== 3 && data.members.length > 1 && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {data.members.map((mm, i) => (
              <button
                key={mm.name}
                data-testid="status-member"
                style={{ ...pill(i === member), flex: "0 1 220px" }}
                onClick={() => setMember(i)}
              >
                {mm.name}
              </button>
            ))}
          </div>
        )}

        {/* 本文 */}
        <div style={{ minHeight: 230 }}>
          {(tab === 0 || tab === 1) && (
            <div
              style={{
                margin: "0 auto",
                maxWidth: 620,
                border: `2px solid ${UI_COLORS.accent}`,
                borderRadius: 12,
                padding: "16px 22px 18px",
              }}
            >
              <div
                style={{
                  ...lineFont,
                  fontSize: "clamp(20px, 2.8vw, 26px)",
                  fontWeight: 700,
                  color: UI_COLORS.yellow,
                  marginBottom: 12,
                }}
              >
                {m.name}　Lv {m.level}
              </div>
              {tab === 0 ? (
                <>
                  <div style={lineFont}>
                    HP {m.hp}/{m.maxHp}
                    <Bar value={m.hp} max={m.maxHp} color={UI_COLORS.hp} />
                  </div>
                  <div style={{ ...lineFont, marginTop: 12 }}>
                    MP {m.mp}/{m.maxMp}
                    <Bar value={m.mp} max={m.maxMp} color={UI_COLORS.mp} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px 28px",
                      marginTop: 16,
                    }}
                  >
                    <span style={lineFont}>こうげき {m.atk}</span>
                    <span style={lineFont}>しゅび {m.def}</span>
                    <span style={lineFont}>すばやさ {m.agi}</span>
                  </div>
                  <div style={{ ...lineFont, fontSize: 15, color: UI_COLORS.textSub, marginTop: 14 }}>
                    つぎのレベルまで あと {m.nextNeed}
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {m.equipment.map((eq) => (
                    <span key={eq.label} style={lineFont}>
                      {eq.label}: {eq.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {(tab === 2 || tab === 3) && (
            <div style={{ padding: "4px 10px" }}>
              {(tab === 2 ? m.spells : data.items).length === 0 ? (
                <div style={{ ...lineFont, textAlign: "center", marginTop: 40 }}>
                  {tab === 2
                    ? "まだ おぼえていない。まなびやで テストに ちょうせん しよう!"
                    : "なにも もっていない。"}
                </div>
              ) : (
                <div
                  style={{
                    columnCount: 2,
                    columnGap: 40,
                  }}
                >
                  {(tab === 2 ? m.spells : data.items).map((line) => (
                    <div key={line} style={{ ...lineFont, padding: "7px 0" }}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 下段の操作 */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={actionButton("#1a4a72")}
            onClick={() => {
              close();
              EventBus.emit("request-profile-gate");
            }}
          >
            ちがう ひとが あそぶ
          </button>
          <button
            style={actionButton("#2f6b3a")}
            onClick={() => {
              close();
              EventBus.emit("request-equip-menu");
            }}
          >
            そうびを かえる
          </button>
          <button
            data-testid="status-close"
            style={{ ...actionButton("#8a2f1c"), marginLeft: "auto", minWidth: 170 }}
            onClick={close}
          >
            とじる
          </button>
        </div>
      </div>
    </div>
  );
}

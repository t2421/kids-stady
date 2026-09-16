"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { buildStatusData, type StatusData } from "@/game/field/statusSections";
import { getProfileId, getSave } from "@/game/session";
import { loadLearning } from "@/lib/learning";
import { buildStats } from "@/lib/stats";
import { actionButton, dqWindow, pillButton, UI_COLORS } from "@/components/uiTheme";
import { MistakeNoteList } from "@/components/MistakeNoteList";
import { StatsBody } from "@/components/StatsScreen";
import { FieldHealControls } from "@/components/FieldHealControls";
/* Phaser 非依存の音モジュールなので React から直接 import してよい (sfx.ts 冒頭参照) */
import { getVolume, isSoundEnabled, playSfx, setSoundEnabled, setVolume } from "@/game/audio/sfx";

/*
 * ステータスパネル (メニュー)。タブ (つよさ・そうび・じゅもん・もちもの・ノート・せいせき) と
 * なかま切替で1画面1トピックにする。DOM 描画なので折り返し・はみ出しは
 * CSS に任せる (設計変更 2026-07-27)。iPad メイン: 全操作タップ完結、
 * ボタンは指向けサイズ、パネル内の誤タップでは閉じない。
 * じゅもん/もちもの タブはフィールド回復 (FieldHealControls) を含む。回復呪文の
 * 出題中 (pending) は とじる・キー操作・背景タップを封じ、パネルが消えて
 * math-result の受け手がいなくなる事故を防ぐ。
 */

/* 音量 4 択 (AU-01 §2.2)。level 0 は setSoundEnabled(false) と同義、1〜3 は setVolume と対 */
const VOLUME_STEPS: { level: 0 | 1 | 2 | 3; label: string }[] = [
  { level: 0, label: "オフ" },
  { level: 1, label: "ちいさい" },
  { level: 2, label: "ふつう" },
  { level: 3, label: "おおきい" },
];

const TABS = ["つよさ", "そうび", "じゅもん", "もちもの", "ノート", "せいせき"] as const;
/* パーティ共有のタブ (なかま切替を出さない) */
const SHARED_TABS: readonly number[] = [3, 4, 5];
/* せいせき (KQ-14): タブを開いたときに buildStats で集計する */
const STATS_TAB = 5;

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
  const [sound, setSound] = useState(true);
  const [volume, setVolumeState] = useState<0 | 1 | 2 | 3>(2);
  /* 回復呪文の算数プロンプトが開いている間 true (とじる を封じる) */
  const [pending, setPending] = useState(false);
  const stateRef = useRef<typeof state>(null);
  stateRef.current = state;
  const pendingRef = useRef(false);
  pendingRef.current = pending;
  /* パネルを開いた瞬間の時刻。開く前に発火した同一キーイベントが
     (リスナー間のマイクロタスクで再レンダーが挟まり) ここへ届いて
     即closeしてしまうのを防ぐ */
  const openedAtRef = useRef(0);

  const close = useCallback(() => {
    const current = stateRef.current;
    if (!current || pendingRef.current) return;
    setState(null);
    EventBus.emit("ui-status-closed", { id: current.id });
  }, []);

  /* 回復・まちがいノート追加などでセーブが変わったら、同じ id のまま表示データを組み直す */
  const refresh = useCallback(() => {
    setState((s) => {
      if (!s) return s;
      const data = buildStatusData(getSave());
      return data ? { ...s, data } : s;
    });
  }, []);

  useEffect(() => {
    const onOpen = (r: { id: number; data: StatusData }) => {
      openedAtRef.current = performance.now();
      setState(r);
      setTab(0);
      setMember(0);
      setPending(false);
      setSound(isSoundEnabled());
      setVolumeState(getVolume());
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
      /* 出題中は MathPromptPanel / Keypad がキーを受ける。ここで閉じたり切り替えたりしない */
      if (pendingRef.current) return;
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

  /* せいせき の集計はタブを開いたときだけ (パネルを開き直せば再計算) */
  const stats = useMemo(() => {
    if (!state || tab !== STATS_TAB) return null;
    const profileId = getProfileId();
    return buildStats(getSave(), profileId ? loadLearning(profileId) : null);
  }, [state, tab]);

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
            <button
              key={label}
              data-testid="status-tab"
              style={pill(i === tab)}
              onClick={() => setTab(i)}
            >
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

        {/* なかま切替 (もちもの・ノート はパーティ共有なので出さない) */}
        {!SHARED_TABS.includes(tab) && data.members.length > 1 && (
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
                  <div
                    data-testid="status-playtime"
                    style={{ ...lineFont, fontSize: 15, color: UI_COLORS.textSub, marginTop: 6 }}
                  >
                    あそんだ じかん: {data.playtime}
                  </div>
                  {/* 設定: おと (音量 4 択 — AU-01 §2.2)。sound-toggle は E2E 互換のため
                      挙動そのまま残す (押すたびにオン/オフを反転するだけの独立ボタン) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ ...lineFont, fontSize: 15, color: UI_COLORS.textSub }}>おと</span>
                      <button
                        data-testid="sound-toggle"
                        aria-pressed={sound}
                        style={{ ...pillButton(sound), minHeight: 56, minWidth: 120 }}
                        onClick={() => {
                          const next = !sound;
                          setSoundEnabled(next);
                          setSound(next);
                          if (next) playSfx("confirm");
                        }}
                      >
                        {sound ? "おと: オン" : "おと: オフ"}
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {VOLUME_STEPS.map((step) => {
                        const active = step.level === 0 ? !sound : sound && volume === step.level;
                        return (
                          <button
                            key={step.level}
                            data-testid="volume-step"
                            data-level={String(step.level)}
                            aria-pressed={active}
                            style={{
                              ...pillButton(active),
                              flex: "1 1 96px",
                              minHeight: 56,
                              minWidth: 96,
                            }}
                            onClick={() => {
                              if (step.level === 0) {
                                setSoundEnabled(false);
                                setSound(false);
                              } else {
                                setSoundEnabled(true);
                                setSound(true);
                                setVolume(step.level);
                                setVolumeState(step.level);
                              }
                              /* 押した瞬間に試聴 (§2.2)。オフでも recentSfx には記録される */
                              playSfx("confirm");
                            }}
                          >
                            {step.label}
                          </button>
                        );
                      })}
                    </div>
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
            <FieldHealControls
              data={data}
              member={m}
              mode={tab === 2 ? "spells" : "items"}
              onChanged={refresh}
              onPendingChange={setPending}
            />
          )}

          {tab === 4 && <MistakeNoteList rows={data.mistakes} />}

          {tab === STATS_TAB && stats && <StatsBody data={stats} />}
        </div>

        {/* 下段の操作 (回復呪文の出題中は隠す — どれも閉じる操作なので) */}
        {!pending && (
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
        )}
      </div>
    </div>
  );
}

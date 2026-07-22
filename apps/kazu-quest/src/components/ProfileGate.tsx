"use client";

import { useCallback, useEffect, useState } from "react";
import { EventBus } from "@/game/EventBus";
import {
  AVATARS,
  createProfile,
  deleteProfile,
  getActiveId,
  listProfiles,
  setActiveId,
  type Profile,
} from "@/lib/profiles";
import { deleteSave } from "@/lib/save";
import { startSession } from "@/game/session";
import { getDebugBoot } from "@/game/debugBoot";

/*
 * プレイヤー選択ゲート (全アプリ共有のプロフィール契約 docs/save-data.md)。
 * 起動時にタイトルの上へ表示し、選択/新規作成するまでゲーム操作をブロックする。
 * ゲーム中の切替 (EventBus "request-profile-gate") ではページを再読込して
 * 新しいプレイヤーのセーブでやり直す。
 * アバター絵文字はアプリ横断の共有アイデンティティなのでそのまま表示する。
 */

type Mode = "select" | "create";

const panelStyle: React.CSSProperties = {
  width: "min(92vw, 520px)",
  borderRadius: 20,
  border: "3px solid var(--kids-panel-border)",
  background: "var(--kids-panel-bg)",
  padding: "24px 26px 28px",
  boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
  color: "#ffffff",
};

export function ProfileGate() {
  const [visible, setVisible] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [mode, setMode] = useState<Mode>("select");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const list = listProfiles();
    setProfiles(list);
    setMode(list.length === 0 ? "create" : "select");
  }, []);

  /* 初回表示 (client のみ)。?map= デバッグ起動時はスキップ */
  useEffect(() => {
    if (!getDebugBoot().map) {
      refresh();
      setVisible(true);
    }
    const onRequest = () => {
      refresh();
      setSwitching(true);
      setVisible(true);
    };
    EventBus.on("request-profile-gate", onRequest);
    return () => {
      EventBus.off("request-profile-gate", onRequest);
    };
  }, [refresh]);

  const finish = useCallback(
    (id: string) => {
      setActiveId(id);
      if (switching) {
        /* ゲーム中の切替はリロードして新プレイヤーのセーブで開始する */
        window.location.reload();
        return;
      }
      startSession(id);
      setVisible(false);
      EventBus.emit("profile-ready", { id });
    },
    [switching],
  );

  const onCreate = () => {
    const id = createProfile(name.trim() || "ゆうしゃ", avatar);
    finish(id);
  };

  const onDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    deleteProfile(id, deleteSave);
    setConfirmDeleteId(null);
    refresh();
  };

  if (!visible) return null;

  return (
    <div
      data-testid="profile-gate"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 10, 24, 0.8)",
        zIndex: 60,
        fontFamily: "var(--kids-font)",
      }}
    >
      <div style={panelStyle}>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>
          {mode === "select" ? "だれが あそぶ?" : "あたらしい プレイヤー"}
        </div>

        {mode === "select" && (
          <>
            <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
              {profiles.map((p) => (
                <div key={p.id} style={{ display: "flex", gap: 8 }}>
                  <button
                    data-testid="profile-select"
                    onClick={() => finish(p.id)}
                    style={{
                      flex: 1,
                      minHeight: 64,
                      fontSize: 24,
                      fontWeight: 700,
                      fontFamily: "var(--kids-font)",
                      borderRadius: 14,
                      border:
                        p.id === getActiveId()
                          ? "3px solid var(--kids-accent)"
                          : "3px solid rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "0 18px",
                    }}
                  >
                    <span style={{ fontSize: 30 }}>{p.avatar}</span>
                    <span>{p.name}</span>
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    title="このプレイヤーをけす"
                    style={{
                      minWidth: 64,
                      borderRadius: 14,
                      border: "3px solid rgba(255,255,255,0.2)",
                      background:
                        confirmDeleteId === p.id
                          ? "rgba(255,80,80,0.35)"
                          : "rgba(255,255,255,0.05)",
                      color: confirmDeleteId === p.id ? "#ffb0b0" : "#8899bb",
                      fontFamily: "var(--kids-font)",
                      fontSize: confirmDeleteId === p.id ? 12 : 20,
                      cursor: "pointer",
                    }}
                  >
                    {confirmDeleteId === p.id ? "ほんとに?" : "✕"}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setName("");
                setAvatar(AVATARS[0]);
                setMode("create");
              }}
              style={{
                width: "100%",
                minHeight: 56,
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "var(--kids-font)",
                borderRadius: 14,
                border: "3px dashed rgba(255,255,255,0.35)",
                background: "transparent",
                color: "var(--kids-text-soft)",
                cursor: "pointer",
              }}
            >
              ＋ あたらしく つくる
            </button>
          </>
        )}

        {mode === "create" && (
          <>
            <input
              data-testid="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="なまえ (ゆうしゃ)"
              maxLength={8}
              style={{
                width: "100%",
                minHeight: 56,
                fontSize: 24,
                fontFamily: "var(--kids-font)",
                borderRadius: 12,
                border: "3px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                padding: "0 16px",
                marginBottom: 14,
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  style={{
                    minHeight: 56,
                    fontSize: 28,
                    borderRadius: 12,
                    border:
                      a === avatar
                        ? "3px solid var(--kids-accent)"
                        : "3px solid rgba(255,255,255,0.15)",
                    background:
                      a === avatar ? "rgba(255,217,61,0.15)" : "rgba(255,255,255,0.05)",
                    cursor: "pointer",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {profiles.length > 0 && (
                <button
                  onClick={() => setMode("select")}
                  style={{
                    flex: 1,
                    minHeight: 60,
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "var(--kids-font)",
                    borderRadius: 14,
                    border: "3px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  もどる
                </button>
              )}
              <button
                data-testid="profile-start"
                onClick={onCreate}
                style={{
                  flex: 2,
                  minHeight: 60,
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "var(--kids-font)",
                  borderRadius: 14,
                  border: "3px solid var(--kids-accent)",
                  background: "rgba(255,217,61,0.2)",
                  color: "#ffd93d",
                  cursor: "pointer",
                }}
              >
                この プレイヤーで はじめる!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

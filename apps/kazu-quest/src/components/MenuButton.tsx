"use client";

import { useEffect, useState } from "react";
import { EventBus } from "@/game/EventBus";

/*
 * 常設メニューボタン (フィールドでいつでもステータスを開ける)。
 * ダイアログ・パネル表示中は各オーバーレイの背面レイヤーに隠れるので
 * 誤タップの心配はない。Field シーンの間だけ表示する。
 */

export function MenuButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    const hide = () => setVisible(false);
    EventBus.on("field-ready", show);
    EventBus.on("field-gone", hide);
    return () => {
      EventBus.off("field-ready", show);
      EventBus.off("field-gone", hide);
    };
  }, []);

  if (!visible) return null;
  return (
    <button
      data-testid="menu-button"
      onClick={() => EventBus.emit("menu-button-pressed")}
      style={{
        position: "fixed",
        top: 14,
        right: 16,
        zIndex: 30,
        minWidth: 150,
        minHeight: 56,
        fontFamily: "var(--kids-font)",
        fontSize: 21,
        fontWeight: 700,
        color: "#ffffff",
        background: "rgba(26, 47, 85, 0.95)",
        border: "3px solid #ffffff",
        borderRadius: 12,
        cursor: "pointer",
      }}
    >
      メニュー
    </button>
  );
}

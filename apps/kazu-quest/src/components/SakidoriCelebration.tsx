"use client";

import { useEffect, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { SakidoriReward } from "@/lib/sakidori";
import { actionButton, dqWindow, UI_COLORS } from "@/components/uiTheme";
/* Phaser 非依存の音モジュールなので React から直接 import してよい (sfx.ts 冒頭参照) */
import { playSfx } from "@/game/audio/sfx";

/*
 * さきどり せいこう! のお祝い (lib/sakidori.ts)。がっこうの学年より上の単元を
 * はじめて「できる」に したとき LessonScreen から "sakidori-celebrate" が来る。
 * 学年の数だけ ★ を ならべて「○ねんせいの さんすうが できた」を 目に見える形にし、
 * つぎの さきどりの めあても 1つ 見せて「もっと さきへ」の気持ちに つなぐ。
 */

const TWINKLE_CSS = `
@keyframes kq-star-pop {
  0% { transform: scale(0.2) rotate(-30deg); opacity: 0; }
  60% { transform: scale(1.25) rotate(8deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.kq-sakidori-star { display: inline-block; animation: kq-star-pop 0.6s ease-out both; }
@media (prefers-reduced-motion: reduce) { .kq-sakidori-star { animation: none; } }
`;

const font: React.CSSProperties = { fontFamily: "var(--kids-font)", color: "#ffffff" };

export function SakidoriCelebration() {
  const [reward, setReward] = useState<SakidoriReward | null>(null);

  useEffect(() => {
    const onCelebrate = (r: SakidoriReward) => {
      setReward(r);
      playSfx("mastered");
    };
    EventBus.on("sakidori-celebrate", onCelebrate);
    return () => {
      EventBus.off("sakidori-celebrate", onCelebrate);
    };
  }, []);

  if (!reward) return null;
  const close = () => {
    setReward(null);
    playSfx("confirm");
  };

  return (
    <div
      data-testid="sakidori-celebration"
      role="dialog"
      aria-label="さきどり せいこう"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 55,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 8, 20, 0.7)",
      }}
    >
      <style>{TWINKLE_CSS}</style>
      <div
        style={dqWindow({
          width: "min(92vw, 560px)",
          padding: "26px 26px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          textAlign: "center",
          borderRadius: 16,
        })}
      >
        <div aria-hidden="true" style={{ fontSize: 40, color: UI_COLORS.yellow, letterSpacing: 6 }}>
          {Array.from({ length: reward.grade }, (_, i) => (
            <span key={i} className="kq-sakidori-star" style={{ animationDelay: `${i * 0.12}s` }}>
              ★
            </span>
          ))}
        </div>
        <p style={{ ...font, margin: 0, fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 700, color: UI_COLORS.yellow }}>
          さきどり せいこう!
        </p>
        <p style={{ ...font, margin: 0, fontSize: "clamp(18px, 2.6vw, 22px)", lineHeight: 1.6 }}>
          {reward.grade}ねんせいの「{reward.label}」が
          <br />
          できるように なった!
        </p>
        <p style={{ ...font, margin: 0, fontSize: 19, color: UI_COLORS.textSub }}>
          {reward.gold}G もらった! さきどりの ほし ★ {reward.stars}
        </p>
        {reward.spellNames && reward.spellNames.length > 0 && (
          <p data-testid="sakidori-spells" style={{ ...font, margin: 0, fontSize: 20, fontWeight: 700, color: "#9fe3ff" }}>
            あたらしい じゅもん「{reward.spellNames.join("」「")}」を おぼえた!
          </p>
        )}
        {reward.nextLabel && (
          <p data-testid="sakidori-next" style={{ ...font, margin: 0, fontSize: 17, color: UI_COLORS.textSub }}>
            つぎの さきどり: 「{reward.nextLabel}」 (★ めあて から まなべるよ)
          </p>
        )}
        <button
          data-testid="sakidori-close"
          style={{ ...actionButton("#2f6b3a"), minWidth: 200, minHeight: 64, marginTop: 6 }}
          onClick={close}
        >
          やったね!
        </button>
      </div>
    </div>
  );
}

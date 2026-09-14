"use client";

import { useEffect, useState } from "react";
import { dqWindow, UI_COLORS } from "@/components/uiTheme";

/*
 * 縦持ち警告オーバーレイ (KQ-24)。
 * iPad を縦に持ったとき「よこむきに してね」を DQ風の枠で全画面表示し、
 * 横に戻すと消える。判定は matchMedia("(orientation: portrait)") の change と
 * window の resize の両方で行う (iPadOS の Safari は片方しか発火しないことがある)。
 * Phaser のゲームループは止めない: DOM で上から覆うだけで、ゲームは動き続ける。
 * 縦持ちレイアウトそのものには対応しない (スコープ外)。
 */

const PORTRAIT_QUERY = "(orientation: portrait)";

/* SSR では window が無いので false。実際の判定は effect 内で行う */
function isPortraitNow(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(PORTRAIT_QUERY).matches;
}

export function useIsPortrait(): boolean {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(PORTRAIT_QUERY);
    const update = () => setPortrait(isPortraitNow());
    update();
    media.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return portrait;
}

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 70 /* ProfileGate (60) / QuizBanner (60) より上 */,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "rgba(4, 8, 16, 0.96)",
};

const windowStyle: React.CSSProperties = dqWindow({
  width: "min(92vw, 560px)",
  padding: "34px 28px 36px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 22,
  textAlign: "center",
});

const titleStyle: React.CSSProperties = {
  fontSize: "clamp(24px, 4.2vw, 34px)",
  fontWeight: 700,
  lineHeight: 1.4,
  color: UI_COLORS.yellow,
};

const subStyle: React.CSSProperties = {
  fontSize: "clamp(16px, 2.6vw, 21px)",
  lineHeight: 1.6,
  color: UI_COLORS.textSub,
};

/* 縦のタブレットが横に回る自前SVG (絵文字不使用)。
   SVG の transform-origin を中央に置き、CSS アニメで 0°→-90° を往復させる */
const ROTATE_CSS = `
@keyframes kq-orientation-turn {
  0%, 20% { transform: rotate(0deg); }
  55%, 80% { transform: rotate(-90deg); }
  100% { transform: rotate(0deg); }
}
.kq-orientation-tablet {
  transform-origin: 50% 50%;
  animation: kq-orientation-turn 3.2s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .kq-orientation-tablet { animation: none; transform: rotate(-90deg); }
}
`;

function RotatingTabletIcon() {
  return (
    <svg
      width="168"
      height="168"
      viewBox="0 0 168 168"
      role="img"
      aria-label="タブレットを よこむきに まわす"
    >
      {/* 回転方向をしめす円弧の矢印 */}
      <path
        d="M 30 84 A 54 54 0 0 1 84 30"
        fill="none"
        stroke={UI_COLORS.accent}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="10 9"
      />
      <polygon points="76,18 96,30 76,42" fill={UI_COLORS.accent} />
      <path
        d="M 138 84 A 54 54 0 0 1 84 138"
        fill="none"
        stroke={UI_COLORS.accent}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="10 9"
      />
      <polygon points="92,126 72,138 92,150" fill={UI_COLORS.accent} />

      {/* タブレット本体 (縦) */}
      <g className="kq-orientation-tablet">
        <rect
          x="55"
          y="38"
          width="58"
          height="92"
          rx="8"
          fill={UI_COLORS.navy}
          stroke="#ffffff"
          strokeWidth="4"
        />
        {/* 画面 */}
        <rect x="63" y="50" width="42" height="64" rx="3" fill="#0b1e3a" />
        {/* 画面の中の勇者っぽいドット (2x2 のブロック) */}
        <rect x="80" y="74" width="8" height="8" fill={UI_COLORS.yellow} />
        <rect x="80" y="82" width="8" height="8" fill="#ffffff" />
        {/* ホームボタン */}
        <circle cx="84" cy="122" r="3.5" fill="#ffffff" />
      </g>
    </svg>
  );
}

export function OrientationGuard() {
  const portrait = useIsPortrait();
  if (!portrait) return null;

  return (
    <div
      data-testid="orientation-guard"
      role="dialog"
      aria-live="polite"
      aria-label="iPad を よこむきに してね"
      style={backdropStyle}
    >
      <style>{ROTATE_CSS}</style>
      <div style={windowStyle}>
        <RotatingTabletIcon />
        <p style={titleStyle}>iPad を よこむきに してね</p>
        <p style={subStyle}>
          カズクエは よこながの がめんで あそぶよ。
          <br />
          よこに むけると そのまま つづきから あそべるよ。
        </p>
      </div>
    </div>
  );
}

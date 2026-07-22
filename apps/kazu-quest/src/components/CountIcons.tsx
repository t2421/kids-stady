"use client";

import type { ReactElement } from "react";
import type { CountIcon } from "@/lib/curriculum";

/*
 * かぞえ問題用の自前アイコン (SVG)。デバイス既定の絵文字は使わない —
 * 端末によって見た目が変わり、レトロな世界観からも浮くため。
 */

const ICONS: Record<CountIcon, ReactElement> = {
  apple: (
    <g>
      <circle cx="12" cy="14" r="8" fill="#d94040" stroke="#7a1f1f" strokeWidth="1.5" />
      <circle cx="9.5" cy="11.5" r="2.2" fill="#f28080" />
      <rect x="11" y="3.5" width="2" height="4" rx="1" fill="#7a4a26" />
      <path d="M13 6 C16 3.5, 19 4.5, 19.5 7 C17 8, 14 7.5, 13 6 Z" fill="#4fa35a" />
    </g>
  ),
  acorn: (
    <g>
      <ellipse cx="12" cy="15" rx="6.5" ry="7" fill="#b57736" stroke="#5c351e" strokeWidth="1.5" />
      <path d="M4.5 10 Q12 5 19.5 10 L18.5 12 Q12 8.5 5.5 12 Z" fill="#7a4a26" stroke="#5c351e" strokeWidth="1" />
      <rect x="11" y="3" width="2" height="4" rx="1" fill="#5c351e" />
      <circle cx="10" cy="14" r="1.6" fill="#dc9b4d" />
    </g>
  ),
  star: (
    <path
      d="M12 2.5 L14.8 8.8 L21.5 9.5 L16.5 14 L18 20.8 L12 17.2 L6 20.8 L7.5 14 L2.5 9.5 L9.2 8.8 Z"
      fill="#f2c84b"
      stroke="#a97420"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  fish: (
    <g>
      <ellipse cx="10.5" cy="12" rx="7.5" ry="5" fill="#3f8dd9" stroke="#194d8c" strokeWidth="1.5" />
      <path d="M17 12 L22 7.5 L22 16.5 Z" fill="#2f7bc2" stroke="#194d8c" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="7" cy="10.8" r="1.3" fill="#0e2440" />
      <path d="M8 15.5 Q10.5 17 13 15.5" stroke="#194d8c" strokeWidth="1" fill="none" />
    </g>
  ),
  flower: (
    <g>
      <circle cx="12" cy="6.5" r="3.4" fill="#f2a5c0" stroke="#b85e85" strokeWidth="1.2" />
      <circle cx="6.5" cy="10.5" r="3.4" fill="#f2a5c0" stroke="#b85e85" strokeWidth="1.2" />
      <circle cx="17.5" cy="10.5" r="3.4" fill="#f2a5c0" stroke="#b85e85" strokeWidth="1.2" />
      <circle cx="8.5" cy="16.5" r="3.4" fill="#f2a5c0" stroke="#b85e85" strokeWidth="1.2" />
      <circle cx="15.5" cy="16.5" r="3.4" fill="#f2a5c0" stroke="#b85e85" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="3.2" fill="#f2c84b" stroke="#a97420" strokeWidth="1.2" />
    </g>
  ),
  candy: (
    <g>
      <path d="M4 8 L8 12 L4 16 L3 12 Z" fill="#e8604f" stroke="#8a2f1c" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M20 8 L16 12 L20 16 L21 12 Z" fill="#e8604f" stroke="#8a2f1c" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="5.5" fill="#f28a7a" stroke="#8a2f1c" strokeWidth="1.5" />
      <path d="M9 9.5 Q12 12 15 14.5 M9.5 14 Q12 12 14.5 9.8" stroke="#ffffff" strokeWidth="1.4" fill="none" />
    </g>
  ),
};

export function CountIconSvg({ icon, size = 34 }: { icon: CountIcon; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[icon]}
    </svg>
  );
}

/* n 個ならべて表示 (5個ごとに区切って数えやすく) */
export function CountRow({ icon, count }: { icon: CountIcon; count: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        justifyContent: "center",
        alignItems: "center",
        margin: "4px 0 12px",
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{ marginRight: (i + 1) % 5 === 0 && i + 1 < count ? 18 : 0, lineHeight: 0 }}
        >
          <CountIconSvg icon={icon} />
        </span>
      ))}
    </div>
  );
}

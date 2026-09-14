"use client";

import { UI_COLORS } from "@/components/uiTheme";
import {
  ACCURACY_GOOD,
  ACCURACY_WEAK,
  accuracyLabel,
  type DailyStat,
  type GradeStat,
} from "@/lib/stats";

/*
 * せいせき画面の絵 (全部 自前 SVG — デバイス絵文字は使わない)。
 * 数晶 (章クリアの点灯)、学年ごとの帯グラフ、14日の れんしゅう 棒グラフ。
 * 色は uiTheme のトークンから組み合わせる。
 */

/* 章ごとの数晶の色 (1〜6章) */
const ORB_COLORS = ["#e8503a", "#3d8fe0", "#ffd93d", "#a86be0", "#3ec46d", "#7fe8ff"];
const ORB_UNLIT = "#1c2230";
const BAR_WEAK = "#e8734a";

const font: React.CSSProperties = {
  fontFamily: "var(--kids-font)",
  fontWeight: 700,
  color: "#ffffff",
};

/* 数晶 1個: 五角形のカットに面の線を入れた宝石。点灯時は色 + 発光 */
export function Orb({ index, lit }: { index: number; lit: boolean }) {
  const color = ORB_COLORS[index % ORB_COLORS.length];
  return (
    <div
      data-testid="stats-orb"
      data-lit={lit ? "1" : "0"}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
    >
      <svg
        viewBox="0 0 40 46"
        width={56}
        height={64}
        aria-hidden="true"
        style={{ filter: lit ? `drop-shadow(0 0 8px ${color})` : "none" }}
      >
        <polygon
          points="20,2 37,15 32,42 8,42 3,15"
          fill={lit ? color : ORB_UNLIT}
          stroke={lit ? "#ffffff" : "rgba(255,255,255,0.3)"}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* 面の線 */}
        <g stroke={lit ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.12)"} strokeWidth={1.2} fill="none">
          <polyline points="3,15 20,21 37,15" />
          <polyline points="20,21 20,42" />
          <polyline points="8,42 20,21 32,42" />
        </g>
        {lit && <polygon points="20,4 27,12 20,14 13,12" fill="rgba(255,255,255,0.55)" />}
      </svg>
      <span style={{ ...font, fontSize: 15, color: lit ? UI_COLORS.yellow : UI_COLORS.textSub }}>
        {index + 1}しょう
      </span>
    </div>
  );
}

function barColor(stat: GradeStat): string {
  if (stat.correct + stat.wrong === 0) return "rgba(255,255,255,0.18)";
  if (stat.accuracy >= ACCURACY_GOOD) return UI_COLORS.hp;
  if (stat.accuracy < ACCURACY_WEAK) return BAR_WEAK;
  return UI_COLORS.yellow;
}

/* 学年 1行: 「1ねんせい」 帯 「86%  とくい」 */
export function GradeBar({ stat }: { stat: GradeStat }) {
  const attempted = stat.correct + stat.wrong > 0;
  const label = accuracyLabel(stat);
  return (
    <div
      data-testid="stats-grade-bar"
      data-grade={stat.grade}
      style={{ display: "grid", gridTemplateColumns: "88px 1fr 150px", alignItems: "center", gap: 10, minHeight: 34 }}
    >
      <span style={{ ...font, fontSize: "clamp(15px, 2vw, 19px)" }}>{stat.label}</span>
      <svg
        viewBox="0 0 100 14"
        preserveAspectRatio="none"
        width="100%"
        height={16}
        aria-hidden="true"
        style={{ display: "block" }}
      >
        <rect x={0} y={0} width={100} height={14} rx={3} fill="#2a2a34" />
        {attempted && (
          <rect x={0} y={0} width={Math.max(2, stat.accuracy)} height={14} rx={3} fill={barColor(stat)} />
        )}
      </svg>
      <span style={{ ...font, fontSize: "clamp(14px, 1.9vw, 18px)", whiteSpace: "nowrap" }}>
        {attempted ? (
          <>
            <span style={{ display: "inline-block", minWidth: 46 }}>{stat.accuracy}%</span>
            <span style={{ color: barColor(stat) }}>{label}</span>
          </>
        ) : (
          <span style={{ color: UI_COLORS.textSub }}>{label}</span>
        )}
      </span>
    </div>
  );
}

const DAY_W = 22;
const DAY_GAP = 8;
const CHART_H = 96;
const BASE_Y = 72;
const BAR_MAX_H = 56;

function shortDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/* 14日の れんしゅう: 日別の正解数 (最後の棒が きょう) */
export function DailyChart({ daily }: { daily: DailyStat[] }) {
  const width = daily.length * (DAY_W + DAY_GAP) - DAY_GAP + 8;
  const max = Math.max(1, ...daily.map((d) => d.correct));
  const labelAt = new Set([0, Math.floor(daily.length / 2), daily.length - 1]);
  return (
    <svg
      data-testid="stats-daily-chart"
      viewBox={`0 0 ${width} ${CHART_H}`}
      width="100%"
      role="img"
      aria-label="14にちの れんしゅう"
      style={{ display: "block", maxWidth: 560, fontFamily: "var(--kids-font)", fontWeight: 700 }}
    >
      <line x1={0} y1={BASE_Y + 0.5} x2={width} y2={BASE_Y + 0.5} stroke="rgba(255,255,255,0.35)" />
      {daily.map((d, i) => {
        const x = 4 + i * (DAY_W + DAY_GAP);
        const h = d.correct > 0 ? Math.max(4, Math.round((d.correct / max) * BAR_MAX_H)) : 0;
        const today = i === daily.length - 1;
        return (
          <g key={d.date}>
            <rect x={x} y={BASE_Y - 2} width={DAY_W} height={2} fill="rgba(255,255,255,0.12)" />
            {h > 0 && (
              <rect x={x} y={BASE_Y - h} width={DAY_W} height={h} rx={2} fill={today ? UI_COLORS.yellow : UI_COLORS.accent} />
            )}
            {d.correct > 0 && (
              <text x={x + DAY_W / 2} y={BASE_Y - h - 4} fontSize={11} fill="#ffffff" textAnchor="middle">
                {d.correct}
              </text>
            )}
            {labelAt.has(i) && (
              <text
                x={x + DAY_W / 2}
                y={BASE_Y + 16}
                fontSize={10}
                fill={today ? UI_COLORS.yellow : UI_COLORS.textSub}
                textAnchor="middle"
              >
                {today ? "きょう" : shortDate(d.date)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

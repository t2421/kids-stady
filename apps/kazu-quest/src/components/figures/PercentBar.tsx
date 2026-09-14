import { useId } from "react";
import { UI_COLORS } from "@/components/uiTheme";
import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * わりあいの帯グラフ (百分率)。
 * 「もとにする量」(base) を常に 100% の帯で示し、part の割合を帯の中に色で示す。
 *
 * part > base (100% 超え) のときの扱い:
 *   帯そのものは 100% で描き切り、こえた分は帯の右外に斜線パターンで延長して見せる。
 *   延長の長さは見やすさのため最大 100px (帯の 1/5 相当) までクランプし、
 *   実際の割合は上の数字ラベル (%表示) で正しい値を出す。
 */

export interface PercentBarProps {
  base: number;
  part: number;
  label?: string;
}

const MARKERS = [0, 25, 50, 75, 100];
const BAR_X = 20;
const BAR_Y = 70;
const BAR_W = 500;
const BAR_H = 56;
const OVERFLOW_MAX_PX = 100;

export function PercentBar({ base, part, label }: PercentBarProps) {
  const patternId = useId();
  const ratio = base > 0 ? part / base : 0;
  const clamped = Math.max(0, Math.min(1, ratio));
  const overflowRatio = Math.max(0, ratio - 1);
  const shadedW = clamped * BAR_W;
  const overflowW = Math.min(overflowRatio, 1) * OVERFLOW_MAX_PX;
  const pctText = `${Math.round(ratio * 100)}%`;

  return (
    <div data-testid="lesson-figure" data-kind="percentBar" style={figureWrapperStyle()}>
      <svg viewBox="0 0 640 170" style={svgStyle()} role="img" aria-label={`${pctText} のわりあい`}>
        <defs>
          <pattern id={patternId} width={8} height={8} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width={8} height={8} fill={UI_COLORS.navy} />
            <line x1={0} y1={0} x2={0} y2={8} stroke={FIGURE_COLORS.secondary} strokeWidth={3} />
          </pattern>
        </defs>

        {/* 100% の帯 (もとにする量) */}
        <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H} rx={8} fill="none" stroke={FIGURE_COLORS.stroke} strokeWidth={3} />
        {/* しめる分 (part) */}
        <rect x={BAR_X} y={BAR_Y} width={shadedW} height={BAR_H} rx={8} fill={FIGURE_COLORS.secondary} opacity={0.85} />
        {overflowW > 0 && (
          <rect x={BAR_X + BAR_W} y={BAR_Y} width={overflowW} height={BAR_H} fill={`url(#${patternId})`} data-overflow="true" />
        )}

        {/* 0/25/50/75/100% の目盛り */}
        {MARKERS.map((m) => {
          const x = BAR_X + (m / 100) * BAR_W;
          return (
            <g key={m}>
              <line x1={x} y1={BAR_Y - 8} x2={x} y2={BAR_Y + BAR_H + 8} stroke={FIGURE_COLORS.muted} strokeWidth={2} />
              <text x={x} y={BAR_Y + BAR_H + 28} fontSize={16} fill={FIGURE_COLORS.muted} textAnchor="middle" fontFamily="var(--kids-font)">
                {m}%
              </text>
            </g>
          );
        })}

        {/* 実際の割合 */}
        <text
          x={BAR_X + Math.min(shadedW, BAR_W)}
          y={BAR_Y - 16}
          fontSize={26}
          fontWeight={700}
          fill={FIGURE_COLORS.text}
          textAnchor="end"
          fontFamily="var(--kids-font)"
          data-percent-value={pctText}
        >
          {pctText}
        </text>
        {label && (
          <text x={BAR_X} y={BAR_Y - 16} fontSize={18} fill={FIGURE_COLORS.primary} textAnchor="start" fontFamily="var(--kids-font)">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

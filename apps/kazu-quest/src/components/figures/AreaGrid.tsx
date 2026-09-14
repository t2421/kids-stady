import type { ReactNode } from "react";
import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * 面積図 — w×h の単位マスのグリッド。
 * shape="rect" (既定): グリッド全体を塗る (長方形の面積)
 * shape="triangle": 対角線を引き、左下の三角形を塗る (三角形の面積 = 長方形の半分)
 * shape="parallelogram": 上辺を右に (w/3 いない) ずらした平行四辺形を塗る
 */

export interface AreaGridProps {
  w: number;
  h: number;
  unit?: string;
  shape?: "rect" | "triangle" | "parallelogram";
}

const MAX_GRID_W = 440;
const MAX_GRID_H = 320;
const ORIGIN_X = 30;
const ORIGIN_Y = 16;

export function AreaGrid({ w, h, unit, shape = "rect" }: AreaGridProps) {
  const cellSize = Math.max(
    14,
    Math.min(48, Math.floor(MAX_GRID_W / Math.max(w, 1)), Math.floor(MAX_GRID_H / Math.max(h, 1))),
  );
  const gridW = w * cellSize;
  const gridH = h * cellSize;
  const viewWidth = ORIGIN_X * 2 + gridW;
  const viewHeight = ORIGIN_Y + gridH + 40;

  const vLines = Array.from({ length: w + 1 }, (_, i) => i);
  const hLines = Array.from({ length: h + 1 }, (_, i) => i);

  let shadedShape: ReactNode = null;
  let extraLine: ReactNode = null;

  if (shape === "rect") {
    shadedShape = (
      <rect
        data-testid="areagrid-shaded-rect"
        x={ORIGIN_X}
        y={ORIGIN_Y}
        width={gridW}
        height={gridH}
        fill={FIGURE_COLORS.primary}
        fillOpacity={0.32}
      />
    );
  } else if (shape === "triangle") {
    const p1 = `${ORIGIN_X},${ORIGIN_Y}`;
    const p2 = `${ORIGIN_X},${ORIGIN_Y + gridH}`;
    const p3 = `${ORIGIN_X + gridW},${ORIGIN_Y + gridH}`;
    shadedShape = (
      <path
        data-testid="areagrid-shaded-shape"
        d={`M ${p1} L ${p2} L ${p3} Z`}
        fill={FIGURE_COLORS.primary}
        fillOpacity={0.4}
      />
    );
    extraLine = (
      <line
        x1={ORIGIN_X}
        y1={ORIGIN_Y}
        x2={ORIGIN_X + gridW}
        y2={ORIGIN_Y + gridH}
        stroke={FIGURE_COLORS.secondary}
        strokeWidth={3}
      />
    );
  } else {
    const offsetUnits = w >= 3 ? Math.max(1, Math.floor(w / 3)) : 0;
    const offsetPx = offsetUnits * cellSize;
    const p1 = `${ORIGIN_X + offsetPx},${ORIGIN_Y}`;
    const p2 = `${ORIGIN_X + gridW},${ORIGIN_Y}`;
    const p3 = `${ORIGIN_X + gridW - offsetPx},${ORIGIN_Y + gridH}`;
    const p4 = `${ORIGIN_X},${ORIGIN_Y + gridH}`;
    shadedShape = (
      <path
        data-testid="areagrid-shaded-shape"
        d={`M ${p1} L ${p2} L ${p3} L ${p4} Z`}
        fill={FIGURE_COLORS.primary}
        fillOpacity={0.4}
      />
    );
  }

  return (
    <div data-testid="lesson-figure" data-kind="areaGrid" style={figureWrapperStyle()}>
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        style={svgStyle()}
        role="img"
        aria-label={`たて ${h}, よこ ${w} の面積図`}
      >
        {shadedShape}
        {vLines.map((i) => (
          <line
            key={`v${i}`}
            x1={ORIGIN_X + i * cellSize}
            y1={ORIGIN_Y}
            x2={ORIGIN_X + i * cellSize}
            y2={ORIGIN_Y + gridH}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={1}
          />
        ))}
        {hLines.map((j) => (
          <line
            key={`h${j}`}
            x1={ORIGIN_X}
            y1={ORIGIN_Y + j * cellSize}
            x2={ORIGIN_X + gridW}
            y2={ORIGIN_Y + j * cellSize}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={1}
          />
        ))}
        <rect
          x={ORIGIN_X}
          y={ORIGIN_Y}
          width={gridW}
          height={gridH}
          fill="none"
          stroke={FIGURE_COLORS.stroke}
          strokeWidth={2}
        />
        {extraLine}
        {unit && (
          <text
            x={ORIGIN_X + cellSize / 2}
            y={ORIGIN_Y + gridH + 22}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={FIGURE_COLORS.muted}
          >
            {`1${unit}`}
          </text>
        )}
      </svg>
    </div>
  );
}

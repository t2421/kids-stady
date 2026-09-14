import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * 10のかたまり (ten frame)。2x5 の枠を count だけ主色で塗る。
 * second が与えられたら、もう1つの 2x5 枠を別の色で塗る (たし算の2つの数を見せる)。
 */

export interface TenFrameProps {
  count: number;
  second?: number;
}

const CELL = 52;
const GAP = 6;
const COLS = 5;
const ROWS = 2;
const PAD = 12;
const FRAME_GAP = 34;
const FRAME_W = COLS * CELL + (COLS - 1) * GAP;
const FRAME_H = ROWS * CELL + (ROWS - 1) * GAP;

function clampCount(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(10, Math.round(n));
}

function Frame({ x, filled, color }: { x: number; filled: number; color: string }) {
  const cells = [];
  for (let i = 0; i < COLS * ROWS; i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const cx = x + col * (CELL + GAP);
    const cy = row * (CELL + GAP);
    const isFilled = i < filled;
    cells.push(
      <rect
        key={i}
        x={cx}
        y={cy}
        width={CELL}
        height={CELL}
        rx={8}
        fill={isFilled ? color : "rgba(255,255,255,0.06)"}
        stroke={FIGURE_COLORS.stroke}
        strokeWidth={3}
      />,
    );
  }
  return <>{cells}</>;
}

export function TenFrame({ count, second }: TenFrameProps) {
  const primaryFilled = clampCount(count);
  const hasSecond = typeof second === "number";
  const secondFilled = hasSecond ? clampCount(second as number) : 0;
  const width = hasSecond ? FRAME_W * 2 + FRAME_GAP + PAD * 2 : FRAME_W + PAD * 2;
  const height = FRAME_H + PAD * 2;

  return (
    <div data-testid="lesson-figure" data-kind="tenFrame" style={figureWrapperStyle()}>
      <svg viewBox={`0 0 ${width} ${height}`} style={svgStyle()} role="img" aria-label={`10のかたまり ${count}`}>
        <g transform={`translate(${PAD}, ${PAD})`}>
          <Frame x={0} filled={primaryFilled} color={FIGURE_COLORS.primary} />
          {hasSecond ? (
            <Frame x={FRAME_W + FRAME_GAP} filled={secondFilled} color={FIGURE_COLORS.secondary} />
          ) : null}
        </g>
      </svg>
    </div>
  );
}

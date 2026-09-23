import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * かけ算・わり算の アレイ図。rows x cols の点を groupBy に沿って
 * すきまで視覚的にグループ化する。remainder があれば、あまりの点を
 * 別枠に離して描く (わり算の あまり)。
 */

export interface ArrayGridProps {
  rows: number;
  cols: number;
  groupBy?: "row" | "col";
  remainder?: number;
}

const DOT_R = 9;
/*
 * TIGHT_GAP / GROUP_GAP は「点の中心から中心まで」の間かくなので、
 * 直径 (DOT_R * 2) より必ず大きくする — 小さいと点どうしが重なって
 * 数えられない図になる。DOT_R から導いて 関係が崩れないようにする
 */
const TIGHT_GAP = DOT_R * 2 + 6;
const GROUP_GAP = DOT_R * 2 + 20;
const PAD = 16;

export function ArrayGrid({ rows, cols, groupBy = "row", remainder }: ArrayGridProps) {
  const safeRows = Math.max(0, Math.round(rows));
  const safeCols = Math.max(0, Math.round(cols));
  const colStep = groupBy === "col" ? GROUP_GAP : TIGHT_GAP;
  const rowStep = groupBy === "row" ? GROUP_GAP : TIGHT_GAP;

  const gridW = safeCols > 0 ? (safeCols - 1) * colStep : 0;
  const gridH = safeRows > 0 ? (safeRows - 1) * rowStep : 0;

  const remCount = remainder && remainder > 0 ? Math.round(remainder) : 0;
  const remColW = remCount > 0 ? DOT_R * 2 + 8 : 0;
  const remGapToGrid = remCount > 0 ? 40 : 0;

  const width = PAD * 2 + gridW + DOT_R * 2 + remGapToGrid + remColW;
  const height = PAD * 2 + Math.max(gridH + DOT_R * 2, remCount * (DOT_R * 2 + 8));

  const dots = [];
  for (let r = 0; r < safeRows; r++) {
    for (let c = 0; c < safeCols; c++) {
      dots.push(
        <circle
          key={`${r}-${c}`}
          data-testid="array-dot"
          cx={PAD + DOT_R + c * colStep}
          cy={PAD + DOT_R + r * rowStep}
          r={DOT_R}
          fill={FIGURE_COLORS.primary}
          stroke={FIGURE_COLORS.stroke}
          strokeWidth={2}
        />,
      );
    }
  }

  const remDots = [];
  const remX = PAD + gridW + DOT_R * 2 + remGapToGrid;
  for (let i = 0; i < remCount; i++) {
    remDots.push(
      <circle
        key={`rem-${i}`}
        data-testid="array-remainder-dot"
        cx={remX}
        cy={PAD + DOT_R + i * (DOT_R * 2 + 8)}
        r={DOT_R}
        fill={FIGURE_COLORS.secondary}
        stroke={FIGURE_COLORS.stroke}
        strokeWidth={2}
        strokeDasharray="2 2"
      />,
    );
  }

  return (
    <div data-testid="lesson-figure" data-kind="array" style={figureWrapperStyle()}>
      <svg viewBox={`0 0 ${Math.max(width, 40)} ${Math.max(height, 40)}`} style={svgStyle()} role="img" aria-label={`${safeRows} かける ${safeCols} のアレイ`}>
        {dots}
        {remCount > 0 ? (
          <line
            x1={remX - remGapToGrid / 2}
            y1={PAD}
            x2={remX - remGapToGrid / 2}
            y2={height - PAD}
            stroke={FIGURE_COLORS.muted}
            strokeDasharray="4 4"
            strokeWidth={2}
          />
        ) : null}
        {remDots}
      </svg>
    </div>
  );
}

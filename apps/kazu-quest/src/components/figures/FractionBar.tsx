import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * 分数バー図 — 横棒を parts 等分し、filled 個を塗る。
 * second があれば下にもう1本描く。2本の総幅 (totalWidth) をそろえ、
 * 1本あたりのセグメント幅は totalWidth/parts にすることで、分母が違っても
 * 「同じ長さの棒を何等分したか」が正しく見える (通分の比較・たし算の下ごしらえ)。
 */

export interface FractionBarProps {
  parts: number;
  filled: number;
  second?: { parts: number; filled: number };
}

const TOTAL_WIDTH = 480;
const BAR_HEIGHT = 52;
const PADDING = 20;
const GAP = 30;

function Bar({ parts, filled, y }: { parts: number; filled: number; y: number }) {
  const segmentWidth = TOTAL_WIDTH / Math.max(parts, 1);
  return (
    <g data-testid="fractionbar-group">
      {Array.from({ length: parts }, (_, i) => {
        const isFilled = i < filled;
        return (
          <rect
            key={i}
            x={PADDING + i * segmentWidth}
            y={y}
            width={segmentWidth}
            height={BAR_HEIGHT}
            fill={isFilled ? FIGURE_COLORS.highlight : FIGURE_COLORS.empty}
            stroke={FIGURE_COLORS.stroke}
            strokeWidth={2}
          />
        );
      })}
    </g>
  );
}

export function FractionBar({ parts, filled, second }: FractionBarProps) {
  const viewHeight = second ? BAR_HEIGHT * 2 + GAP + PADDING * 2 : BAR_HEIGHT + PADDING * 2;
  const viewWidth = TOTAL_WIDTH + PADDING * 2;

  return (
    <div data-testid="lesson-figure" data-kind="fractionBar" style={figureWrapperStyle()}>
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        style={svgStyle()}
        role="img"
        aria-label={`${parts} ぶんの ${filled}${second ? ` と ${second.parts} ぶんの ${second.filled}` : ""}`}
      >
        <Bar parts={parts} filled={filled} y={PADDING} />
        {second && <Bar parts={second.parts} filled={second.filled} y={PADDING + BAR_HEIGHT + GAP} />}
      </svg>
    </div>
  );
}

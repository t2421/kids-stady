import { UI_COLORS } from "@/components/uiTheme";
import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * テープ図 — segments を横につなげて長さの比を見せる。
 * 速さ・比・単位量あたり ("みちのり" / "はやさ" / "じかん" など) の問題で使う。
 * total があれば全体を囲む角かっこ風の折れ線を上に描く。
 */

export interface TapeDiagramProps {
  segments: { label: string; length: number }[];
  total?: string;
}

const TAPE_X = 20;
const TAPE_W = 600;
const TAPE_H = 50;

function computeOffsets(widths: number[], start: number): number[] {
  return widths.reduce<number[]>((acc, w, i) => [...acc, i === 0 ? start : acc[i - 1] + widths[i - 1]], []);
}

export function TapeDiagram({ segments, total }: TapeDiagramProps) {
  const colors = [FIGURE_COLORS.secondary, UI_COLORS.mp, FIGURE_COLORS.highlight, FIGURE_COLORS.primary];
  const sum = segments.reduce((s, seg) => s + Math.max(0, seg.length), 0) || 1;
  const widths = segments.map((seg) => (Math.max(0, seg.length) / sum) * TAPE_W);
  const offsets = computeOffsets(widths, TAPE_X);

  const hasBracket = Boolean(total);
  const tapeY = hasBracket ? 100 : 70;
  const viewH = hasBracket ? 190 : 150;

  return (
    <div data-testid="lesson-figure" data-kind="tapeDiagram" style={figureWrapperStyle()}>
      <svg viewBox={`0 0 640 ${viewH}`} style={svgStyle()} role="img" aria-label="テープ図">
        {hasBracket && (
          <g stroke={FIGURE_COLORS.muted} strokeWidth={2} fill="none">
            <path
              d={`M${TAPE_X} ${tapeY - 14} L${TAPE_X} ${tapeY - 22} L${TAPE_X + TAPE_W} ${tapeY - 22} L${TAPE_X + TAPE_W} ${tapeY - 14}`}
            />
            <text x={TAPE_X + TAPE_W / 2} y={tapeY - 28} fontSize={18} fill={FIGURE_COLORS.muted} textAnchor="middle" fontFamily="var(--kids-font)">
              {total}
            </text>
          </g>
        )}
        {segments.map((seg, i) => {
          const w = widths[i];
          const x = offsets[i];
          const fill = colors[i % colors.length];
          const canFitLabel = w >= 48;
          return (
            <g key={i} data-tape-segment="true">
              <rect x={x} y={tapeY} width={w} height={TAPE_H} fill={fill} opacity={0.85} stroke={FIGURE_COLORS.stroke} strokeWidth={2} />
              {canFitLabel ? (
                <text x={x + w / 2} y={tapeY + TAPE_H / 2 + 6} fontSize={16} fontWeight={700} fill="#0f1f3d" textAnchor="middle" fontFamily="var(--kids-font)">
                  {seg.label}
                </text>
              ) : (
                <text x={x + w / 2} y={tapeY + TAPE_H + 20} fontSize={14} fill={FIGURE_COLORS.text} textAnchor="middle" fontFamily="var(--kids-font)">
                  {seg.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

import { UI_COLORS } from "@/components/uiTheme";
import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * かさ (dL) を表すめもり付きの計量カップ。capacityDl に応じて目盛りの間隔を決め、
 * filledDl 分だけ下から水色で満たす (capacity を超える filledDl は満杯にクランプ)。
 */

export interface MeasureCupProps {
  capacityDl: number;
  filledDl: number;
}

const CUP_X = 90;
const CUP_W = 120;
const CUP_TOP = 30;
const CUP_BOTTOM = 340;

function tickInterval(capacity: number): number {
  if (capacity <= 10) return 1;
  if (capacity <= 20) return 2;
  if (capacity <= 50) return 5;
  return 10;
}

export function MeasureCup({ capacityDl, filledDl }: MeasureCupProps) {
  const capacity = Math.max(1, capacityDl);
  const height = CUP_BOTTOM - CUP_TOP;
  const filled = Math.max(0, Math.min(filledDl, capacity));
  const fillH = (filled / capacity) * height;
  const interval = tickInterval(capacity);
  const ticks: number[] = [];
  for (let v = interval; v < capacity; v += interval) ticks.push(v);

  return (
    <div data-testid="lesson-figure" data-kind="measureCup" style={figureWrapperStyle()}>
      <svg viewBox="0 0 300 400" style={svgStyle()} role="img" aria-label={`${filled} / ${capacity} dL`}>
        {/* みずのりょう (下から filledDl 分だけ) */}
        <rect x={CUP_X} y={CUP_BOTTOM - fillH} width={CUP_W} height={fillH} fill={UI_COLORS.mp} opacity={0.8} data-fill-height={fillH.toFixed(2)} />
        {/* めもり */}
        {ticks.map((v) => {
          const y = CUP_BOTTOM - (v / capacity) * height;
          return (
            <g key={v}>
              <line x1={CUP_X} y1={y} x2={CUP_X + CUP_W} y2={y} stroke={FIGURE_COLORS.muted} strokeWidth={1.5} />
              <text x={CUP_X - 8} y={y + 5} fontSize={13} fill={FIGURE_COLORS.muted} textAnchor="end" fontFamily="var(--kids-font)">
                {v}
              </text>
            </g>
          );
        })}
        {/* 容器のわく */}
        <path
          d={`M${CUP_X} ${CUP_TOP} L${CUP_X} ${CUP_BOTTOM} Q${CUP_X} ${CUP_BOTTOM + 12} ${CUP_X + 14} ${CUP_BOTTOM + 12} L${CUP_X + CUP_W - 14} ${CUP_BOTTOM + 12} Q${CUP_X + CUP_W} ${CUP_BOTTOM + 12} ${CUP_X + CUP_W} ${CUP_BOTTOM} L${CUP_X + CUP_W} ${CUP_TOP}`}
          fill="none"
          stroke={FIGURE_COLORS.stroke}
          strokeWidth={4}
        />
        <text x={150} y={CUP_TOP - 8} fontSize={13} fill={FIGURE_COLORS.muted} textAnchor="middle" fontFamily="var(--kids-font)">
          {capacity}dL
        </text>
        <text x={150} y={380} fontSize={22} fontWeight={700} fill={FIGURE_COLORS.text} textAnchor="middle" fontFamily="var(--kids-font)">
          {filled}/{capacity} dL
        </text>
      </svg>
    </div>
  );
}

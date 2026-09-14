import { FIGURE_COLORS, FIGURE_FONT, figureWrapperStyle, svgStyle } from "./shared";

/*
 * 数直線。from〜to を step 刻みで目盛る (省略時は範囲から見やすい間隔を自動で決める)。
 * ラベルは詰まりすぎないよう間引く (最大 12 個ほど)。marks は目立つ点、
 * highlight は区間を色付きの帯で示す。
 */

export interface NumberLineProps {
  from: number;
  to: number;
  step?: number;
  marks?: number[];
  highlight?: [number, number];
}

const WIDTH = 600;
const HEIGHT = 120;
const PAD_X = 36;
const BASELINE_Y = 60;
const MAX_LABELS = 12;

/* 見やすい目盛り間隔 (1, 2, 5 の桁違い) を範囲から決める */
function niceStep(range: number): number {
  const safeRange = Math.abs(range) || 1;
  const raw = safeRange / 10;
  const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow10;
  let niceNorm = 1;
  if (norm > 5) niceNorm = 10;
  else if (norm > 2) niceNorm = 5;
  else if (norm > 1) niceNorm = 2;
  return niceNorm * pow10;
}

function decimalsOf(step: number): number {
  const s = String(step);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}

function roundTo(value: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

export function NumberLine({ from, to, step, marks, highlight }: NumberLineProps) {
  const span = to - from || 1;
  const usedStep = step && step > 0 ? step : niceStep(span);
  const decimals = decimalsOf(usedStep);
  const x = (v: number) => PAD_X + ((v - from) / span) * (WIDTH - PAD_X * 2);

  const ticks: number[] = [];
  const guardMax = Math.abs(span / usedStep) + 2;
  for (let i = 0, v = from; i <= guardMax && (span >= 0 ? v <= to + usedStep / 1e6 : v >= to - usedStep / 1e6); i++, v = from + i * usedStep) {
    ticks.push(roundTo(v, decimals));
  }
  const labelEvery = Math.max(1, Math.ceil(ticks.length / MAX_LABELS));

  const markList = marks ?? [];
  const highlightSpan = highlight;

  return (
    <div data-testid="lesson-figure" data-kind="numberLine" style={figureWrapperStyle()}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={svgStyle()} role="img" aria-label={`数直線 ${from} から ${to}`}>
        {highlightSpan ? (
          <g>
            <line
              x1={x(highlightSpan[0])}
              y1={BASELINE_Y - 14}
              x2={x(highlightSpan[1])}
              y2={BASELINE_Y - 14}
              data-testid="numberline-highlight"
              stroke={FIGURE_COLORS.highlight}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <line x1={x(highlightSpan[0])} y1={BASELINE_Y - 20} x2={x(highlightSpan[0])} y2={BASELINE_Y - 8} stroke={FIGURE_COLORS.highlight} strokeWidth={4} />
            <line x1={x(highlightSpan[1])} y1={BASELINE_Y - 20} x2={x(highlightSpan[1])} y2={BASELINE_Y - 8} stroke={FIGURE_COLORS.highlight} strokeWidth={4} />
          </g>
        ) : null}

        <line x1={PAD_X} y1={BASELINE_Y} x2={WIDTH - PAD_X} y2={BASELINE_Y} stroke={FIGURE_COLORS.stroke} strokeWidth={4} strokeLinecap="round" />

        {ticks.map((v, i) => {
          const showLabel = i % labelEvery === 0 || i === ticks.length - 1;
          const tx = x(v);
          return (
            <g key={i}>
              <line x1={tx} y1={BASELINE_Y - 10} x2={tx} y2={BASELINE_Y + 10} stroke={FIGURE_COLORS.stroke} strokeWidth={2} />
              {showLabel ? (
                <text x={tx} y={BASELINE_Y + 32} fontFamily={FIGURE_FONT} fontSize={16} fontWeight={700} fill={FIGURE_COLORS.text} textAnchor="middle">
                  {v}
                </text>
              ) : null}
            </g>
          );
        })}

        {markList.map((v, i) => (
          <g key={`mark-${i}`} data-testid="numberline-mark" data-value={v}>
            <circle cx={x(v)} cy={BASELINE_Y} r={8} fill={FIGURE_COLORS.secondary} stroke={FIGURE_COLORS.stroke} strokeWidth={2} />
            <text x={x(v)} y={BASELINE_Y - 20} fontFamily={FIGURE_FONT} fontSize={16} fontWeight={900} fill={FIGURE_COLORS.secondary} textAnchor="middle">
              {v}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

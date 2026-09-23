import { FIGURE_COLORS, FIGURE_FONT, figureWrapperStyle, svgStyle } from "./shared";

/*
 * ぼうグラフ (小4「グラフ」)。bars を よこに ならべ、目もり線と ぼうの上の数を 出す。
 * 以前 g4_graph の問題は 数の「ひょう」を 文章で 書くだけで、グラフの単元なのに
 * グラフが 一度も 出てこなかった。目もりは 最大値から 見やすい間かく (1,2,5,10…) で決める。
 */

export interface BarChartProps {
  bars: { label: string; value: number }[];
  unit?: string;
}

const W = 520;
const H = 300;
const LEFT = 56;
const RIGHT = 20;
const TOP = 30;
const BOTTOM = 44;

/* 目もりの間かく: 目もりが 10本以下に なる いちばん細かい 1・2・5 × 10のべき */
export function barChartStep(max: number): number {
  const safe = Math.max(1, max);
  for (const base of [1, 2, 5, 10, 20, 50, 100, 200, 500]) {
    if (safe / base <= 10) return base;
  }
  return 1000;
}

export function BarChart({ bars, unit = "" }: BarChartProps) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const step = barChartStep(max);
  const top = Math.ceil(max / step) * step;
  const plotW = W - LEFT - RIGHT;
  const plotH = H - TOP - BOTTOM;
  const y = (v: number) => TOP + plotH - (v / top) * plotH;
  const slot = plotW / Math.max(1, bars.length);
  const barW = Math.min(90, slot * 0.55);
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);

  return (
    <div data-testid="lesson-figure" data-kind="barChart" style={figureWrapperStyle()}>
      <svg viewBox={`0 0 ${W} ${H}`} style={svgStyle()} role="img" aria-label={`ぼうグラフ ${bars.map((b) => `${b.label} ${b.value}${unit}`).join("、")}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={LEFT} y1={y(t)} x2={W - RIGHT} y2={y(t)} stroke={FIGURE_COLORS.muted} strokeWidth={t === 0 ? 3 : 1} opacity={t === 0 ? 1 : 0.5} />
            <text x={LEFT - 8} y={y(t) + 6} textAnchor="end" fontFamily={FIGURE_FONT} fontSize={16} fill={FIGURE_COLORS.muted}>
              {t}
            </text>
          </g>
        ))}
        {bars.map((b, i) => {
          const cx = LEFT + slot * i + slot / 2;
          return (
            <g key={b.label} data-testid="barchart-bar" data-value={b.value}>
              <rect x={cx - barW / 2} y={y(b.value)} width={barW} height={Math.max(0, y(0) - y(b.value))} rx={4} fill={FIGURE_COLORS.primary} stroke={FIGURE_COLORS.stroke} strokeWidth={2} />
              <text x={cx} y={y(b.value) - 8} textAnchor="middle" fontFamily={FIGURE_FONT} fontSize={20} fontWeight={800} fill={FIGURE_COLORS.text}>
                {b.value}
                {unit}
              </text>
              <text x={cx} y={H - 14} textAnchor="middle" fontFamily={FIGURE_FONT} fontSize={20} fontWeight={700} fill={FIGURE_COLORS.text}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

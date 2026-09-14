import { UI_COLORS } from "@/components/uiTheme";
import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * じゅんじょ・組み合わせを表す木の図。levels[0] が根、levels[1] がその枝 ...
 * 最大 4 段 (仕様)。個々のノードに親子の対応は持たないので、
 * 各段の人数を上の段の人数でできるだけ均等に割って親子関係を作る
 * (簡易法: 深い段がぜんたいの幅を決め、親ノードは自分の子の真上に中央ぞろえ)。
 */

export interface TreeDiagramProps {
  levels: string[][];
}

interface TreeLayout {
  totalUnits: number;
  positions: number[][];
  edges: { pLvl: number; pIdx: number; cLvl: number; cIdx: number }[];
}

function computeTreeLayout(levels: string[][]): TreeLayout {
  const n = levels.length;
  const spans: number[][] = new Array(n);
  const childRanges: [number, number][][] = new Array(n);
  spans[n - 1] = levels[n - 1].map(() => 1);
  childRanges[n - 1] = levels[n - 1].map(() => [0, 0]);

  for (let lvl = n - 2; lvl >= 0; lvl--) {
    const parentCount = levels[lvl].length || 1;
    const childCount = levels[lvl + 1].length;
    const base = Math.floor(childCount / parentCount);
    const extra = childCount % parentCount;
    const pSpans: number[] = [];
    const pRanges: [number, number][] = [];
    let ci = 0;
    for (let p = 0; p < parentCount; p++) {
      const numChildren = base + (p < extra ? 1 : 0);
      const start = ci;
      let sum = 0;
      for (let k = 0; k < numChildren; k++) {
        sum += spans[lvl + 1][ci] ?? 1;
        ci += 1;
      }
      pRanges.push([start, ci]);
      pSpans.push(sum || 1);
    }
    spans[lvl] = pSpans;
    childRanges[lvl] = pRanges;
  }

  const positions: number[][] = spans.map((lvlSpans) => {
    let cursor = 0;
    return lvlSpans.map((span) => {
      const center = cursor + span / 2;
      cursor += span;
      return center;
    });
  });

  const edges: TreeLayout["edges"] = [];
  for (let lvl = 0; lvl < n - 1; lvl++) {
    for (let p = 0; p < levels[lvl].length; p++) {
      const [start, end] = childRanges[lvl][p];
      for (let c = start; c < end; c++) {
        edges.push({ pLvl: lvl, pIdx: p, cLvl: lvl + 1, cIdx: c });
      }
    }
  }

  const totalUnits = spans[0].reduce((a, b) => a + b, 0) || 1;
  return { totalUnits, positions, edges };
}

const NODE_W = 90;
const NODE_H = 40;
const LEVEL_H = 80;
const PAD_TOP = 30;

export function TreeDiagram({ levels }: TreeDiagramProps) {
  const safeLevels = levels.length > 0 ? levels.slice(0, 4) : [[]];
  const layout = computeTreeLayout(safeLevels);
  const unitW = Math.max(NODE_W + 20, 640 / layout.totalUnits);
  const width = Math.max(640, layout.totalUnits * unitW);
  const height = PAD_TOP + safeLevels.length * LEVEL_H;

  const xOf = (lvl: number, idx: number) => layout.positions[lvl][idx] * unitW;
  const yOf = (lvl: number) => PAD_TOP + lvl * LEVEL_H;

  return (
    <div data-testid="lesson-figure" data-kind="treeDiagram" style={figureWrapperStyle()}>
      <svg viewBox={`0 0 ${width} ${height}`} style={svgStyle()} role="img" aria-label="木の図">
        <g stroke={FIGURE_COLORS.muted} strokeWidth={2} fill="none">
          {layout.edges.map((e, i) => (
            <line
              key={i}
              x1={xOf(e.pLvl, e.pIdx)}
              y1={yOf(e.pLvl) + NODE_H / 2}
              x2={xOf(e.cLvl, e.cIdx)}
              y2={yOf(e.cLvl) - NODE_H / 2}
            />
          ))}
        </g>
        {safeLevels.map((level, lvl) =>
          level.map((text, idx) => {
            const cx = xOf(lvl, idx);
            const cy = yOf(lvl);
            return (
              <g key={`${lvl}-${idx}`} data-tree-node="true">
                <rect
                  x={cx - NODE_W / 2}
                  y={cy - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={10}
                  fill={UI_COLORS.navy}
                  stroke={FIGURE_COLORS.stroke}
                  strokeWidth={2}
                />
                <text x={cx} y={cy + 6} fontSize={16} fontWeight={700} fill={FIGURE_COLORS.text} textAnchor="middle" fontFamily="var(--kids-font)">
                  {text}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}

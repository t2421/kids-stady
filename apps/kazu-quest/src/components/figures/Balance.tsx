import { UI_COLORS } from "@/components/uiTheme";
import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * てんびん (シーソー) 図。left/right の重さの合計を比べ、
 * 重いほうに最大 15° まで傾ける (等しければ水平)。
 * 各皿には label 付きの四角ブロックを積み、幅を重さに応じて変える。
 */

export interface BalanceProps {
  left: { label: string; weight: number }[];
  right: { label: string; weight: number }[];
}

const PIVOT = { x: 320, y: 190 };
const HALF_BEAM = 220;
const MAX_TILT_DEG = 15;

function rotatePoint(dx: number, dy: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: PIVOT.x + dx * cos - dy * sin, y: PIVOT.y + dx * sin + dy * cos };
}

function sumWeight(items: { weight: number }[]): number {
  return items.reduce((s, it) => s + Math.max(0, it.weight), 0);
}

interface Block {
  label: string;
  width: number;
  y: number;
}

function stackBlocks(items: { label: string; weight: number }[], maxWeight: number, trayY: number): Block[] {
  return items.reduce<Block[]>((acc, it) => {
    const width = 44 + (Math.max(0, it.weight) / maxWeight) * 76;
    const prevTop = acc.length ? acc[acc.length - 1].y : trayY - 8;
    return [...acc, { label: it.label, width, y: prevTop - 30 }];
  }, []);
}

export function Balance({ left, right }: BalanceProps) {
  const leftSum = sumWeight(left);
  const rightSum = sumWeight(right);
  const totalSum = leftSum + rightSum;
  const rawAngle = totalSum > 0 ? ((leftSum - rightSum) / totalSum) * MAX_TILT_DEG : 0;
  const rotation = -rawAngle;

  const leftEnd = rotatePoint(-HALF_BEAM, 0, rotation);
  const rightEnd = rotatePoint(HALF_BEAM, 0, rotation);
  const maxWeight = Math.max(1, ...left.map((i) => i.weight), ...right.map((i) => i.weight));

  function renderPan(items: { label: string; weight: number }[], end: { x: number; y: number }, side: string) {
    const trayY = end.y + 26;
    const trayW = 150;
    const blocks = stackBlocks(items, maxWeight, trayY);
    return (
      <g key={side} data-balance-pan={side}>
        <line x1={end.x} y1={end.y} x2={end.x} y2={trayY} stroke={FIGURE_COLORS.muted} strokeWidth={3} />
        <rect x={end.x - trayW / 2} y={trayY} width={trayW} height={10} rx={4} fill={UI_COLORS.navy} stroke={FIGURE_COLORS.stroke} strokeWidth={2} />
        {blocks.map((b, i) => (
          <g key={i}>
            <rect x={end.x - b.width / 2} y={b.y} width={b.width} height={26} rx={5} fill={FIGURE_COLORS.primary} stroke={FIGURE_COLORS.stroke} strokeWidth={2} />
            <text x={end.x} y={b.y + 18} fontSize={14} fontWeight={700} fill={UI_COLORS.navy} textAnchor="middle" fontFamily="var(--kids-font)">
              {b.label}
            </text>
          </g>
        ))}
      </g>
    );
  }

  const tilt = rotation > 0.01 ? "right" : rotation < -0.01 ? "left" : "level";

  return (
    <div data-testid="lesson-figure" data-kind="balance" data-tilt={tilt} style={figureWrapperStyle()}>
      <svg viewBox="0 0 640 320" style={svgStyle()} role="img" aria-label="てんびん図">
        {/* 支点 */}
        <path d={`M${PIVOT.x - 30} 260 L${PIVOT.x} ${PIVOT.y} L${PIVOT.x + 30} 260 Z`} fill={UI_COLORS.navy} stroke={FIGURE_COLORS.stroke} strokeWidth={3} />
        {/* うで */}
        <line x1={leftEnd.x} y1={leftEnd.y} x2={rightEnd.x} y2={rightEnd.y} stroke={FIGURE_COLORS.stroke} strokeWidth={5} />
        <circle cx={PIVOT.x} cy={PIVOT.y} r={6} fill={FIGURE_COLORS.secondary} />
        {renderPan(left, leftEnd, "left")}
        {renderPan(right, rightEnd, "right")}
      </svg>
    </div>
  );
}

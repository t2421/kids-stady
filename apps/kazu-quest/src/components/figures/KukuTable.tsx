import { FIGURE_COLORS, FIGURE_FONT, figureWrapperStyle, svgStyle } from "./shared";

/*
 * 九九表 (1〜9 x 1〜9)。highlightRow / highlightCol が与えられたら
 * その行・列全体を薄く、交点セルをはっきり強調する。
 */

export interface KukuTableProps {
  highlightRow?: number;
  highlightCol?: number;
}

const N = 9;
const CELL = 40;
const HEADER = 40;
const SIZE = HEADER + N * CELL;

export function KukuTable({ highlightRow, highlightCol }: KukuTableProps) {
  const cells = [];
  for (let r = 1; r <= N; r++) {
    for (let c = 1; c <= N; c++) {
      const isRowHi = highlightRow === r;
      const isColHi = highlightCol === c;
      const isCross = isRowHi && isColHi;
      const fill = isCross
        ? FIGURE_COLORS.secondary
        : isRowHi || isColHi
          ? "rgba(138,165,213,0.35)"
          : "rgba(255,255,255,0.04)";
      cells.push(
        <g key={`${r}-${c}`}>
          <rect
            data-testid={isCross ? "kuku-cross-cell" : undefined}
            x={HEADER + (c - 1) * CELL}
            y={HEADER + (r - 1) * CELL}
            width={CELL}
            height={CELL}
            fill={fill}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1}
          />
          <text
            x={HEADER + (c - 1) * CELL + CELL / 2}
            y={HEADER + (r - 1) * CELL + CELL / 2 + 5}
            textAnchor="middle"
            fontFamily={FIGURE_FONT}
            fontSize={14}
            fontWeight={isCross ? 900 : 600}
            fill={isCross ? "#1a2f55" : FIGURE_COLORS.text}
          >
            {r * c}
          </text>
        </g>,
      );
    }
  }

  const rowHeaders = [];
  const colHeaders = [];
  for (let i = 1; i <= N; i++) {
    rowHeaders.push(
      <text
        key={`rh-${i}`}
        x={HEADER / 2}
        y={HEADER + (i - 1) * CELL + CELL / 2 + 5}
        textAnchor="middle"
        fontFamily={FIGURE_FONT}
        fontSize={15}
        fontWeight={800}
        fill={highlightRow === i ? FIGURE_COLORS.secondary : FIGURE_COLORS.muted}
      >
        {i}
      </text>,
    );
    colHeaders.push(
      <text
        key={`ch-${i}`}
        x={HEADER + (i - 1) * CELL + CELL / 2}
        y={HEADER / 2 + 5}
        textAnchor="middle"
        fontFamily={FIGURE_FONT}
        fontSize={15}
        fontWeight={800}
        fill={highlightCol === i ? FIGURE_COLORS.secondary : FIGURE_COLORS.muted}
      >
        {i}
      </text>,
    );
  }

  return (
    <div data-testid="lesson-figure" data-kind="kukuTable" style={figureWrapperStyle()}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={svgStyle()} role="img" aria-label="九九表">
        <rect x={0} y={0} width={HEADER} height={HEADER} fill="transparent" />
        {rowHeaders}
        {colHeaders}
        {cells}
      </svg>
    </div>
  );
}

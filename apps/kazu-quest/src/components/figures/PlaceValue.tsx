import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * 位取り表 (place value table) — value ("3.25" / "12000000") の各けたを
 * 1列ずつ見出し付きで表示する。整数部は 一/十/百/千/万/十万/百万/千万/億/兆/京 と
 * 4けたごとに単位を繰り返す。小数部は "." のあとに 小数第一位/第二位/… と数える。
 *
 * highlightDigit のかぞえかた (このコンポーネントの決めごと):
 *   value の左から数字だけを 0, 1, 2, … と数える。"." はけた数に入れない
 *   (=「非カウント文字」として飛ばす)。例: "3.25" は 3→0, 2→1, 5→2。
 *   highlightDigit=1 なら小数第一位の "2" が光る。
 */

export interface PlaceValueProps {
  value: string;
  highlightDigit?: number;
}

const SUB_LABELS = ["", "十", "百", "千"];
const GROUP_UNITS = ["", "万", "億", "兆", "京"];
const DECIMAL_KANJI = ["一", "二", "三", "四", "五"];

function integerPlaceLabel(posFromRight: number): string {
  if (posFromRight === 0) return "一";
  const group = Math.floor(posFromRight / 4);
  const sub = SUB_LABELS[posFromRight % 4];
  return sub + (GROUP_UNITS[group] ?? `10^${group * 4}`);
}

function decimalPlaceLabel(posFromDecimal: number): string {
  const kanji = DECIMAL_KANJI[posFromDecimal] ?? String(posFromDecimal + 1);
  return `小数第${kanji}位`;
}

interface Column {
  char: string;
  label: string;
  digitIndex: number | null;
}

function buildColumns(value: string): Column[] {
  const dotIndex = value.indexOf(".");
  const intLen = dotIndex === -1 ? value.length : dotIndex;
  const columns: Column[] = [];
  let digitIndex = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === ".") {
      columns.push({ char: ".", label: "", digitIndex: null });
      continue;
    }
    const isInt = i < intLen;
    const label = isInt ? integerPlaceLabel(intLen - 1 - i) : decimalPlaceLabel(i - intLen - 1);
    columns.push({ char: ch, label, digitIndex });
    digitIndex++;
  }
  return columns;
}

const COL_WIDTH = 56;
const DOT_WIDTH = 20;
const LABEL_H = 46;
const DIGIT_H = 64;
const PADDING = 12;

export function PlaceValue({ value, highlightDigit }: PlaceValueProps) {
  const columns = buildColumns(value);
  const widths = columns.map((c) => (c.char === "." ? DOT_WIDTH : COL_WIDTH));
  const totalWidth = widths.reduce((a, b) => a + b, 0) + PADDING * 2;
  const totalHeight = LABEL_H + DIGIT_H + PADDING * 2;

  let x = PADDING;
  const cells = columns.map((col, i) => {
    const w = widths[i];
    const cellX = x;
    x += w;
    const highlighted = col.digitIndex !== null && col.digitIndex === highlightDigit;
    return { ...col, x: cellX, w, highlighted };
  });

  return (
    <div data-testid="lesson-figure" data-kind="placeValue" style={figureWrapperStyle()}>
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        style={svgStyle()}
        role="img"
        aria-label={`位取り表 ${value}`}
      >
        {cells.map((cell, i) => (
          <g key={i}>
            {cell.label && (
              <text
                x={cell.x + cell.w / 2}
                y={PADDING + 14}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill={cell.highlighted ? FIGURE_COLORS.secondary : FIGURE_COLORS.muted}
              >
                {cell.label}
              </text>
            )}
            <rect
              x={cell.x}
              y={PADDING + LABEL_H}
              width={cell.w}
              height={DIGIT_H}
              fill={cell.highlighted ? "rgba(255,217,61,0.22)" : FIGURE_COLORS.empty}
              stroke={cell.highlighted ? FIGURE_COLORS.secondary : FIGURE_COLORS.stroke}
              strokeWidth={cell.highlighted ? 4 : 2}
            />
            <text
              data-testid={cell.highlighted ? "placevalue-highlight" : undefined}
              x={cell.x + cell.w / 2}
              y={PADDING + LABEL_H + DIGIT_H / 2 + 12}
              textAnchor="middle"
              fontSize={cell.char === "." ? 32 : 30}
              fontWeight={900}
              fill={cell.highlighted ? FIGURE_COLORS.secondary : FIGURE_COLORS.text}
            >
              {cell.char}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

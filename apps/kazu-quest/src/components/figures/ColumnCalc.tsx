import { FIGURE_COLORS, FIGURE_FONT, figureWrapperStyle, svgStyle } from "./shared";
import { computeAddSub, computeLongDivision } from "./columnCalcMath";

/*
 * ひっ算 (column calculation)。+/-/× は 位取りで右そろえした縦書き、
 * ÷ は筆算 (長除法) の レイアウト (たてる→かける→ひく→おろす)。
 * revealSteps: +/- は「右から何列ぶん結果を見せるか」(省略時は全部)。
 * ÷ は 4段ずつ (立てる・かける・ひく・おろす) の段階公開 (省略時は最後まで)。
 */

export interface ColumnCalcProps {
  op: "+" | "-" | "×" | "÷";
  a: number;
  b: number;
  showCarry?: boolean;
  revealSteps?: number;
}

const COL_W = 42;
const ROW_H = 46;

export function ColumnCalc(props: ColumnCalcProps) {
  return (
    <div data-testid="lesson-figure" data-kind="columnCalc" style={figureWrapperStyle()}>
      {props.op === "÷" ? (
        <LongDivisionFigure a={props.a} b={props.b} revealSteps={props.revealSteps} />
      ) : (
        <AddSubMulFigure
          op={props.op}
          a={props.a}
          b={props.b}
          showCarry={props.showCarry}
          revealSteps={props.revealSteps}
        />
      )}
    </div>
  );
}

interface AddSubMulProps {
  op: "+" | "-" | "×";
  a: number;
  b: number;
  showCarry?: boolean;
  revealSteps?: number;
}

function AddSubMulFigure({ op, a, b, showCarry, revealSteps }: AddSubMulProps) {
  const r = computeAddSub(op, a, b);
  const revealed = Math.max(0, Math.min(r.width, revealSteps ?? r.width));
  const showCarryRow = Boolean(showCarry) && op !== "×";

  const opCol = 1;
  const totalCols = r.width + opCol;
  const carryRowH = showCarryRow ? 24 : 0;
  const width = totalCols * COL_W + 20;
  const height = carryRowH + ROW_H * 3 + 16;

  const colX = (j: number) => 10 + (j + opCol) * COL_W;
  const topY = carryRowH + ROW_H * 0.68;
  const opY = carryRowH + ROW_H * 1.68;
  const lineY = carryRowH + ROW_H * 1.9;
  const resultY = carryRowH + ROW_H * 2.68;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={svgStyle()} role="img" aria-label={`ひっ算 ${a} ${op} ${b}`}>
      <text x={10 + COL_W / 2} y={opY} textAnchor="middle" fontFamily={FIGURE_FONT} fontSize={22} fontWeight={900} fill={FIGURE_COLORS.secondary}>
        {op}
      </text>

      {r.aDigits.map((d, j) => (
        <text key={`a-${j}`} x={colX(j) + COL_W / 2} y={topY} textAnchor="middle" fontFamily={FIGURE_FONT} fontSize={26} fontWeight={800} fill={FIGURE_COLORS.text}>
          {d.trim()}
        </text>
      ))}
      {r.bDigits.map((d, j) => (
        <text key={`b-${j}`} x={colX(j) + COL_W / 2} y={opY} textAnchor="middle" fontFamily={FIGURE_FONT} fontSize={26} fontWeight={800} fill={FIGURE_COLORS.text}>
          {d.trim()}
        </text>
      ))}

      <line x1={10} y1={lineY} x2={width - 10} y2={lineY} stroke={FIGURE_COLORS.stroke} strokeWidth={3} />

      {r.resultDigits.map((d, j) => {
        const isRevealed = r.width - j <= revealed;
        return (
          <text
            key={`res-${j}`}
            data-testid="columncalc-result-digit"
            data-revealed={isRevealed}
            x={colX(j) + COL_W / 2}
            y={resultY}
            textAnchor="middle"
            fontFamily={FIGURE_FONT}
            fontSize={26}
            fontWeight={900}
            fill={isRevealed ? FIGURE_COLORS.primary : FIGURE_COLORS.muted}
          >
            {isRevealed ? d.trim() : "?"}
          </text>
        );
      })}

      {showCarryRow && op === "+"
        ? r.carries.map((c, j) => {
            if (c !== 1 || j === 0) return null;
            const sourceRevealed = r.width - j <= revealed;
            if (!sourceRevealed) return null;
            return (
              <text
                key={`carry-${j}`}
                data-testid="columncalc-carry"
                x={colX(j - 1) + COL_W / 2}
                y={14}
                textAnchor="middle"
                fontFamily={FIGURE_FONT}
                fontSize={15}
                fontWeight={900}
                fill={FIGURE_COLORS.secondary}
              >
                1
              </text>
            );
          })
        : null}

      {showCarryRow && op === "-"
        ? r.borrows.map((borrowed, j) => {
            if (!borrowed || j === 0) return null;
            const sourceRevealed = r.width - j <= revealed;
            if (!sourceRevealed) return null;
            return (
              <text
                key={`borrow-${j}`}
                data-testid="columncalc-borrow"
                x={colX(j - 1) + COL_W / 2}
                y={14}
                textAnchor="middle"
                fontFamily={FIGURE_FONT}
                fontSize={13}
                fontWeight={900}
                fill={FIGURE_COLORS.highlight}
              >
                -1
              </text>
            );
          })
        : null}
    </svg>
  );
}

function LongDivisionFigure({ a, b, revealSteps }: { a: number; b: number; revealSteps?: number }) {
  const { steps } = computeLongDivision(a, b);
  const width = Math.max(1, String(Math.abs(Math.round(a))).length);
  const revealCount = revealSteps === undefined ? Infinity : Math.max(0, revealSteps);

  const divisorColW = 56;
  const colX = (j: number) => divisorColW + j * COL_W;
  const quotientY = 26;
  const bracketTopY = 40;
  const dividendY = 40 + ROW_H * 0.68;

  /* 段 i の公開レベル: 0=非表示 1=立てる 2=かける 3=ひく (おろすは次の段に進むだけ) */
  const revealLevel = (i: number) => Math.max(0, Math.min(4, revealCount - i * 4));

  const rows: { y: number; text: string; endCol: number }[] = [];
  steps.forEach((step, i) => {
    const level = revealLevel(i);
    if (step.quotientDigit !== "" && step.product !== null && level >= 2) {
      rows.push({ y: 0, text: String(step.product), endCol: i });
    }
    if (step.quotientDigit !== "" && level >= 3) {
      rows.push({ y: 0, text: step.remainderStr, endCol: i });
    }
  });
  rows.forEach((row, idx) => {
    row.y = dividendY + ROW_H * (idx + 1) * 0.85;
  });

  const height = dividendY + ROW_H * (rows.length + 1) * 0.85 + 16;
  const svgWidth = divisorColW + width * COL_W + 20;

  return (
    <svg viewBox={`0 0 ${svgWidth} ${Math.max(height, 120)}`} style={svgStyle()} role="img" aria-label={`ひっ算 ${a} わる ${b}`}>
      <text x={divisorColW / 2 - 4} y={dividendY} textAnchor="middle" fontFamily={FIGURE_FONT} fontSize={24} fontWeight={800} fill={FIGURE_COLORS.text}>
        {b}
      </text>
      <line x1={divisorColW - 6} y1={bracketTopY - 22} x2={divisorColW - 6} y2={dividendY + 14} stroke={FIGURE_COLORS.stroke} strokeWidth={3} />
      <line x1={divisorColW - 6} y1={bracketTopY - 22} x2={svgWidth - 8} y2={bracketTopY - 22} stroke={FIGURE_COLORS.stroke} strokeWidth={3} />

      {steps.map((step, i) => {
        const canPlace = revealLevel(i) >= 1;
        return step.quotientDigit && canPlace ? (
          <text
            key={`q-${i}`}
            data-testid="columncalc-quotient-digit"
            x={colX(i) + COL_W / 2}
            y={quotientY}
            textAnchor="middle"
            fontFamily={FIGURE_FONT}
            fontSize={24}
            fontWeight={900}
            fill={FIGURE_COLORS.primary}
          >
            {step.quotientDigit}
          </text>
        ) : null;
      })}

      {String(Math.abs(Math.round(a)))
        .split("")
        .map((d, j) => (
          <text key={`d-${j}`} x={colX(j) + COL_W / 2} y={dividendY} textAnchor="middle" fontFamily={FIGURE_FONT} fontSize={24} fontWeight={800} fill={FIGURE_COLORS.text}>
            {d}
          </text>
        ))}

      {rows.map((row, idx) => (
        <text
          key={`r-${idx}`}
          data-testid="columncalc-div-row"
          x={colX(row.endCol) + COL_W / 2}
          y={row.y}
          textAnchor="middle"
          fontFamily={FIGURE_FONT}
          fontSize={22}
          fontWeight={700}
          fill={FIGURE_COLORS.secondary}
        >
          {row.text}
        </text>
      ))}
    </svg>
  );
}

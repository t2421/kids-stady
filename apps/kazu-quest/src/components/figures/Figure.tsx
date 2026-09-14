import type { CSSProperties } from "react";
import type { FigureSpec } from "@/content/lessons/types";
import { UI_COLORS } from "@/components/uiTheme";
import { TenFrame } from "./TenFrame";
import { NumberLine } from "./NumberLine";
import { CherryFigure } from "./CherryFigure";
import { ColumnCalc } from "./ColumnCalc";
import { ArrayGrid } from "./ArrayGrid";
import { KukuTable } from "./KukuTable";
import { FractionBar } from "./FractionBar";
import { PlaceValue } from "./PlaceValue";
import { AreaGrid } from "./AreaGrid";
import { Protractor } from "./Protractor";
import { Clock } from "./Clock";
import { PercentBar } from "./PercentBar";
import { TapeDiagram } from "./TapeDiagram";
import { TreeDiagram } from "./TreeDiagram";
import { LetterBox } from "./LetterBox";
import { Balance } from "./Balance";
import { MeasureCup } from "./MeasureCup";
import { figureWrapperStyle } from "./shared";

/*
 * レッスンの図 (視覚モデル) の入口。spec.kind で実装ずみの部品に振り分ける。
 * まだ実装していない kind は「じゅんびちゅう」のプレースホルダを描く
 * (LP-06/LP-07 が到着し次第、このファイルに case を追記していく)。
 * どの分岐でもルート要素は data-testid="lesson-figure" / data-kind を持つ。
 */

const placeholderStyle: CSSProperties = {
  ...figureWrapperStyle(),
  minHeight: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "18px 16px",
  borderRadius: 12,
  border: `2px dashed ${UI_COLORS.textSub}`,
  color: UI_COLORS.textSub,
  fontFamily: "var(--kids-font)",
  fontSize: 16,
  fontWeight: 700,
  textAlign: "center",
};

export function Figure({ spec }: { spec: FigureSpec }) {
  switch (spec.kind) {
    case "tenFrame":
      return <TenFrame count={spec.count} second={spec.second} />;
    case "numberLine":
      return (
        <NumberLine
          from={spec.from}
          to={spec.to}
          step={spec.step}
          marks={spec.marks}
          highlight={spec.highlight}
        />
      );
    case "cherry":
      return <CherryFigure total={spec.total} split={spec.split} />;
    case "columnCalc":
      return (
        <ColumnCalc
          op={spec.op}
          a={spec.a}
          b={spec.b}
          showCarry={spec.showCarry}
          revealSteps={spec.revealSteps}
        />
      );
    case "array":
      return (
        <ArrayGrid
          rows={spec.rows}
          cols={spec.cols}
          groupBy={spec.groupBy}
          remainder={spec.remainder}
        />
      );
    case "kukuTable":
      return <KukuTable highlightRow={spec.highlightRow} highlightCol={spec.highlightCol} />;
    case "fractionBar":
      return <FractionBar parts={spec.parts} filled={spec.filled} second={spec.second} />;
    case "placeValue":
      return <PlaceValue value={spec.value} highlightDigit={spec.highlightDigit} />;
    case "areaGrid":
      return <AreaGrid w={spec.w} h={spec.h} unit={spec.unit} shape={spec.shape} />;
    case "protractor":
      return <Protractor angle={spec.angle} showReading={spec.showReading} />;
    case "clock":
      return <Clock hour={spec.hour} minute={spec.minute} second={spec.second} />;
    case "percentBar":
      return <PercentBar base={spec.base} part={spec.part} label={spec.label} />;
    case "tapeDiagram":
      return <TapeDiagram segments={spec.segments} total={spec.total} />;
    case "treeDiagram":
      return <TreeDiagram levels={spec.levels} />;
    case "letterBox":
      return <LetterBox expr={spec.expr} value={spec.value} />;
    case "balance":
      return <Balance left={spec.left} right={spec.right} />;
    case "measureCup":
      return <MeasureCup capacityDl={spec.capacityDl} filledDl={spec.filledDl} />;
    default: {
      /* すべての kind を実装ずみでも、将来 FigureSpec に kind が増えたときの安全網として残す */
      const unknownSpec = spec as { kind: string };
      return (
        <div data-testid="lesson-figure" data-kind={unknownSpec.kind} style={placeholderStyle}>
          (ず) じゅんびちゅう
        </div>
      );
    }
  }
}

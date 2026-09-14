import { CherryDiagram } from "@/components/CherryDiagram";
import { figureWrapperStyle } from "./shared";

/*
 * さくらんぼ図。既存の CherryDiagram (mathematics から独立移植済み) を
 * FigureSpec の { total, split: [a, b] } から { top, split: {first, second} } へ
 * 詰め替えて包むだけの薄いラッパ。CherryDiagram 自体は変更しない。
 */

export interface CherryFigureProps {
  total: number;
  split: [number, number];
}

export function CherryFigure({ total, split }: CherryFigureProps) {
  return (
    <div data-testid="lesson-figure" data-kind="cherry" style={figureWrapperStyle()}>
      <CherryDiagram top={total} split={{ first: split[0], second: split[1] }} />
    </div>
  );
}

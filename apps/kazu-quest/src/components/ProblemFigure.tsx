"use client";

import type { Problem } from "@/lib/curriculum";
import { figureForProblem } from "@/lib/curriculum/figures";
import { Figure } from "@/components/figures/Figure";

/*
 * 問題の図 (視覚モデル)。文章だけだと読みとりで つまずく問題を
 * 図でも見せる。図の中身は lib/curriculum/figures.ts が決める
 * (こたえは見せない — ひっ算の答えのけたは "?" のまま)。
 * 図が無い問題では何も描かない。
 *
 * 大きさは 幅と「高さ」の両方で おさえる。幅だけだと 9×9 の アレイ図が
 * 縦に 600px 近くなり、こたえの ボタンが 画面の下に 押し出されていた
 * (E2E で発覚)。SVG は viewBox の比を たもったまま 箱に おさまる。
 */
const FIT_CSS = `
.kq-problem-figure svg {
  width: 100% !important;
  height: auto !important;
  max-height: var(--kq-figure-max-h) !important;
}
`;

export function ProblemFigure({
  problem,
  maxWidth = 440,
  maxHeight = 180,
}: {
  problem: Problem;
  maxWidth?: number;
  maxHeight?: number;
}) {
  const spec = figureForProblem(problem);
  if (!spec) return null;
  return (
    <div
      className="kq-problem-figure"
      data-testid="problem-figure"
      data-kind={spec.kind}
      style={
        {
          width: "100%",
          maxWidth,
          margin: "0 auto 14px",
          display: "block",
          "--kq-figure-max-h": `${maxHeight}px`,
        } as React.CSSProperties
      }
    >
      <style>{FIT_CSS}</style>
      <Figure spec={spec} />
    </div>
  );
}

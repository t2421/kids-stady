/*
 * 図 (視覚モデル) の描画テスト。react-dom/server の renderToStaticMarkup で
 * SSR し、エラーなく data-testid="lesson-figure" / data-kind を持つ文字列が
 * 得られることを確認する (このリポジトリに .tsx のコンポーネントテストは
 * まだ無いため、追加の依存を増やさずに済む renderToStaticMarkup を採用)。
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Figure } from "../src/components/figures/Figure";
import type { FigureSpec } from "../src/content/lessons/types";

function render(spec: FigureSpec): string {
  return renderToStaticMarkup(<Figure spec={spec} />);
}

describe("Figure dispatcher", () => {
  it("tenFrame: renders lesson-figure with data-kind and both frames when second is given", () => {
    const html = render({ kind: "tenFrame", count: 4, second: 3 });
    expect(html).toContain('data-testid="lesson-figure"');
    expect(html).toContain('data-kind="tenFrame"');
    expect(html).toContain("<svg");
  });

  it("numberLine: marks render marked points", () => {
    const html = render({ kind: "numberLine", from: 0, to: 10, marks: [3, 7] });
    expect(html).toContain('data-kind="numberLine"');
    expect(html.match(/data-testid="numberline-mark"/g)?.length).toBe(2);
  });

  it("numberLine: highlight renders a highlighted span", () => {
    const html = render({ kind: "numberLine", from: 0, to: 20, highlight: [4, 9] });
    expect(html).toContain('data-testid="numberline-highlight"');
  });

  it("numberLine: does not throw and thins labels for a wide range", () => {
    expect(() => render({ kind: "numberLine", from: 0, to: 1000 })).not.toThrow();
  });

  it("cherry: wraps CherryDiagram with total/split mapped to top/split", () => {
    const html = render({ kind: "cherry", total: 8, split: [5, 3] });
    expect(html).toContain('data-kind="cherry"');
    expect(html).toContain('data-testid="cherry-diagram"');
    expect(html).toContain(">8<");
    expect(html).toContain(">5<");
    expect(html).toContain(">3<");
  });

  it("columnCalc +: reveals only the requested columns from the right", () => {
    const html = render({ kind: "columnCalc", op: "+", a: 48, b: 27, revealSteps: 1 });
    expect(html).toContain('data-kind="columnCalc"');
    const revealed = html.match(/data-revealed="true"/g)?.length ?? 0;
    const hidden = html.match(/data-revealed="false"/g)?.length ?? 0;
    expect(revealed).toBe(1);
    expect(hidden).toBeGreaterThanOrEqual(1);
  });

  it("columnCalc +: showCarry draws a carry mark where a carry occurs", () => {
    const html = render({ kind: "columnCalc", op: "+", a: 48, b: 27, showCarry: true });
    expect(html).toContain('data-testid="columncalc-carry"');
  });

  it("columnCalc -: showCarry draws a borrow mark where a borrow occurs", () => {
    const html = render({ kind: "columnCalc", op: "-", a: 42, b: 27, showCarry: true });
    expect(html).toContain('data-testid="columncalc-borrow"');
  });

  it("columnCalc ÷: revealSteps gates the long-division reveal stages", () => {
    const setupOnly = render({ kind: "columnCalc", op: "÷", a: 84, b: 4, revealSteps: 0 });
    expect(setupOnly).not.toContain('data-testid="columncalc-quotient-digit"');

    const firstDigitPlaced = render({ kind: "columnCalc", op: "÷", a: 84, b: 4, revealSteps: 1 });
    expect(firstDigitPlaced).toContain('data-testid="columncalc-quotient-digit"');
    expect(firstDigitPlaced).not.toContain('data-testid="columncalc-div-row"');

    const full = render({ kind: "columnCalc", op: "÷", a: 84, b: 4 });
    expect(full).toContain('data-testid="columncalc-div-row"');
  });

  it("columnCalc ×: does not throw and renders result digits", () => {
    expect(() => render({ kind: "columnCalc", op: "×", a: 12, b: 3 })).not.toThrow();
  });

  it("array: groups by row/col and draws remainder dots off to the side", () => {
    const html = render({ kind: "array", rows: 3, cols: 4, groupBy: "row", remainder: 2 });
    expect(html).toContain('data-kind="array"');
    expect(html.match(/data-testid="array-dot"/g)?.length).toBe(12);
    expect(html.match(/data-testid="array-remainder-dot"/g)?.length).toBe(2);
  });

  it("array: no remainder means no remainder dots", () => {
    const html = render({ kind: "array", rows: 2, cols: 5 });
    expect(html).not.toContain('data-testid="array-remainder-dot"');
  });

  it("kukuTable: highlights the intersection cell", () => {
    const html = render({ kind: "kukuTable", highlightRow: 7, highlightCol: 8 });
    expect(html).toContain('data-kind="kukuTable"');
    expect(html).toContain('data-testid="kuku-cross-cell"');
    expect(html).toContain(">56<");
  });

  it("kukuTable: renders without highlight props", () => {
    expect(() => render({ kind: "kukuTable" })).not.toThrow();
  });

  it("unknown kind: renders the placeholder without throwing", () => {
    /* すべての FigureSpec.kind が実装ずみになっても、将来 kind が増えたときの
       デフォルト分岐 (プレースホルダ) を確認できるよう、型を偽装した未知の kind で検証する */
    const bogusSpec = { kind: "bogusKind" } as unknown as FigureSpec;
    const html = render(bogusSpec);
    expect(html).toContain('data-testid="lesson-figure"');
    expect(html).toContain('data-kind="bogusKind"');
    expect(html).toContain("じゅんびちゅう");
  });

  it("percentBar: shaded width is proportional to part/base", () => {
    const half = render({ kind: "percentBar", base: 200, part: 100 });
    expect(half).toContain('data-kind="percentBar"');
    expect(half).toContain('data-percent-value="50%"');
    const full = render({ kind: "percentBar", base: 200, part: 200 });
    expect(full).toContain('data-percent-value="100%"');
  });

  it("percentBar: part > base overflows visually but reports the true percentage", () => {
    const html = render({ kind: "percentBar", base: 200, part: 260 });
    expect(html).toContain('data-percent-value="130%"');
    expect(html).toContain('data-overflow="true"');
  });

  it("tapeDiagram: renders one segment per entry and an optional total bracket", () => {
    const html = render({
      kind: "tapeDiagram",
      segments: [
        { label: "みちのり", length: 3 },
        { label: "はやさ", length: 5 },
      ],
      total: "ぜんぶ",
    });
    expect(html).toContain('data-kind="tapeDiagram"');
    expect(html.match(/data-tape-segment="true"/g)?.length).toBe(2);
    expect(html).toContain(">ぜんぶ<");
  });

  it("tapeDiagram: renders without a total (no bracket needed)", () => {
    const html = render({ kind: "tapeDiagram", segments: [{ label: "a", length: 1 }] });
    expect(html.match(/data-tape-segment="true"/g)?.length).toBe(1);
  });

  it("treeDiagram: node count matches levels.flat().length", () => {
    const levels = [["A"], ["B", "C"], ["D", "E", "F", "G"]];
    const html = render({ kind: "treeDiagram", levels });
    expect(html).toContain('data-kind="treeDiagram"');
    expect(html.match(/data-tree-node="true"/g)?.length).toBe(levels.flat().length);
  });

  it("treeDiagram: caps at 4 levels without throwing", () => {
    const levels = [["1"], ["2", "3"], ["4", "5", "6"], ["7", "8"], ["9", "10"]];
    expect(() => render({ kind: "treeDiagram", levels })).not.toThrow();
  });

  it("letterBox: highlights the □ token and shows the solved value", () => {
    const unsolved = render({ kind: "letterBox", expr: "□ + 3 = 8" });
    expect(unsolved).toContain('data-kind="letterBox"');
    expect(unsolved).toContain('data-solved="false"');
    expect(unsolved.match(/data-letterbox-var="true"/g)?.length).toBe(1);

    const solved = render({ kind: "letterBox", expr: "□ + 3 = 8", value: 5 });
    expect(solved).toContain('data-solved="true"');
    expect(solved).toContain("= 5<");
  });

  it("letterBox: highlights a single-letter variable token (not multi-char tokens)", () => {
    const html = render({ kind: "letterBox", expr: "x × 4 = 20" });
    expect(html.match(/data-letterbox-var="true"/g)?.length).toBe(1);
  });

  it("balance: tilt direction differs for left-heavy vs right-heavy inputs", () => {
    const leftHeavy = render({
      kind: "balance",
      left: [{ label: "a", weight: 10 }],
      right: [{ label: "b", weight: 2 }],
    });
    expect(leftHeavy).toContain('data-tilt="left"');

    const rightHeavy = render({
      kind: "balance",
      left: [{ label: "a", weight: 2 }],
      right: [{ label: "b", weight: 10 }],
    });
    expect(rightHeavy).toContain('data-tilt="right"');
  });

  it("balance: equal weights render level", () => {
    const html = render({
      kind: "balance",
      left: [{ label: "a", weight: 5 }],
      right: [{ label: "b", weight: 5 }],
    });
    expect(html).toContain('data-tilt="level"');
  });

  it("measureCup: fill height scales with filledDl", () => {
    const low = render({ kind: "measureCup", capacityDl: 10, filledDl: 2 });
    const high = render({ kind: "measureCup", capacityDl: 10, filledDl: 8 });
    const readHeight = (html: string) => Number(html.match(/data-fill-height="([\d.]+)"/)?.[1]);
    expect(readHeight(high)).toBeGreaterThan(readHeight(low));
  });

  it("measureCup: filledDl beyond capacity clamps to a full cup", () => {
    const overfilled = render({ kind: "measureCup", capacityDl: 10, filledDl: 25 });
    const full = render({ kind: "measureCup", capacityDl: 10, filledDl: 10 });
    const readHeight = (html: string) => Number(html.match(/data-fill-height="([\d.]+)"/)?.[1]);
    expect(readHeight(overfilled)).toBeCloseTo(readHeight(full), 5);
  });

  it("fractionBar: renders one bar group by default", () => {
    const html = render({ kind: "fractionBar", parts: 4, filled: 3 });
    expect(html).toContain('data-kind="fractionBar"');
    expect(html.match(/data-testid="fractionbar-group"/g)?.length).toBe(1);
  });

  it("fractionBar: second renders two bar groups", () => {
    const html = render({
      kind: "fractionBar",
      parts: 4,
      filled: 1,
      second: { parts: 3, filled: 2 },
    });
    expect(html.match(/data-testid="fractionbar-group"/g)?.length).toBe(2);
  });

  it("placeValue: highlights the digit at highlightDigit, counting left to right and skipping '.'", () => {
    /* "3.25" の highlightDigit=1 は小数第一位の "2" (0="3", 1="2", 2="5")。*/
    const html = render({ kind: "placeValue", value: "3.25", highlightDigit: 1 });
    expect(html).toContain('data-kind="placeValue"');
    expect(html).toMatch(/data-testid="placevalue-highlight"[^>]*>2</);
  });

  it("placeValue: highlightDigit=0 highlights the leftmost digit of a large integer", () => {
    const html = render({ kind: "placeValue", value: "12000000", highlightDigit: 0 });
    expect(html).toMatch(/data-testid="placevalue-highlight"[^>]*>1</);
  });

  it("areaGrid: triangle renders a distinct shaded path element", () => {
    const html = render({ kind: "areaGrid", w: 4, h: 3, shape: "triangle" });
    expect(html).toContain('data-kind="areaGrid"');
    expect(html).toContain('data-testid="areagrid-shaded-shape"');
    expect(html).toContain("<path");
  });

  it("areaGrid: parallelogram renders a distinct shaded path element", () => {
    const html = render({ kind: "areaGrid", w: 6, h: 3, shape: "parallelogram" });
    expect(html).toContain('data-testid="areagrid-shaded-shape"');
    expect(html).toContain("<path");
  });

  it("areaGrid: rect (default) shades a plain rect, not a path", () => {
    const html = render({ kind: "areaGrid", w: 4, h: 3 });
    expect(html).toContain('data-testid="areagrid-shaded-rect"');
    expect(html).not.toContain('data-testid="areagrid-shaded-shape"');
  });

  it("protractor: the ray's rotation transform reflects angle", () => {
    /* 光線は <g transform="rotate(...)"> でくるんだ <line data-testid="protractor-ray">。
       このコンポーネントでは rotate は光線にしか使わないので、出現位置だけで特定できる */
    const html = render({ kind: "protractor", angle: 60 });
    expect(html).toContain('data-kind="protractor"');
    const match = html.match(/transform="rotate\((-?[\d.]+) /);
    expect(match).not.toBeNull();
    expect(Number(match?.[1])).toBeCloseTo(-60, 5);
  });

  it("protractor: showReading highlights the reading at the given angle", () => {
    const html = render({ kind: "protractor", angle: 90, showReading: true });
    expect(html).toContain('data-testid="protractor-reading-highlight"');
  });

  it("clock: hour and minute hands differ in length", () => {
    /* y1/y2 は回転前の座標 (実際の向きは transform="rotate(...)" が別途つける)。
       同じ中心 (y1) からの距離 = 針の長さなので y1-y2 で比べる */
    const html = render({ kind: "clock", hour: 3, minute: 30 });
    expect(html).toContain('data-kind="clock"');
    const handLength = (testid: string) => {
      const tag = html.match(new RegExp(`<line data-testid="${testid}"[^>]*>`))?.[0] ?? "";
      const y1 = Number(tag.match(/y1="(-?[\d.]+)"/)?.[1]);
      const y2 = Number(tag.match(/y2="(-?[\d.]+)"/)?.[1]);
      return Math.abs(y1 - y2);
    };
    const hourLen = handLength("clock-hour-hand");
    const minuteLen = handLength("clock-minute-hand");
    expect(hourLen).toBeGreaterThan(0);
    expect(minuteLen).toBeGreaterThan(0);
    expect(hourLen).toBeLessThan(minuteLen);
  });

  it("clock: second renders a ghost clock alongside the main one", () => {
    const html = render({ kind: "clock", hour: 3, minute: 45, second: { hour: 4, minute: 20 } });
    expect(html.match(/data-testid="clock-hour-hand"/g)?.length).toBe(2);
    expect(html.match(/data-testid="clock-minute-hand"/g)?.length).toBe(2);
  });
});

import { UI_COLORS } from "@/components/uiTheme";
import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * □ や x を使った式 ("□ + 3 = 8" / "x × 4 = 20") を大きな文字で見せる。
 * □・アルファベット1文字のトークンだけ、目立つ枠 (□は角丸四角、文字は丸) で囲む。
 * value があれば「といた状態」として枠を塗りつぶし、下に "= value" を添える。
 */

export interface LetterBoxProps {
  expr: string;
  value?: number;
}

const FONT_SIZE = 44;
const CHAR_W = FONT_SIZE * 0.62;
const GAP = FONT_SIZE * 0.55;
const VAR_BOX = FONT_SIZE * 1.35;
const TOP_Y = 40;

function isVarToken(t: string): boolean {
  return t === "□" || /^[A-Za-zＡ-Ｚａ-ｚ]$/.test(t);
}

interface PlacedToken {
  text: string;
  width: number;
  cx: number;
  isVar: boolean;
}

function layoutTokens(tokens: string[], startX: number): PlacedToken[] {
  return tokens.reduce<PlacedToken[]>((acc, t, i) => {
    const isVar = isVarToken(t);
    const width = isVar ? VAR_BOX : Math.max(CHAR_W, t.length * CHAR_W);
    const prevEdge = acc.length ? acc[acc.length - 1].cx + acc[acc.length - 1].width / 2 + GAP : startX;
    const cx = prevEdge + width / 2;
    return [...acc, { text: t, width, cx, isVar }];
  }, []);
}

export function LetterBox({ expr, value }: LetterBoxProps) {
  const tokens = expr.trim().split(/\s+/).filter(Boolean);
  const rawWidths = tokens.map((t) => (isVarToken(t) ? VAR_BOX : Math.max(CHAR_W, t.length * CHAR_W)));
  const totalW = rawWidths.reduce((a, w) => a + w, 0) + GAP * Math.max(0, tokens.length - 1);
  const width = Math.max(640, totalW + 80);
  const startX = (width - totalW) / 2;
  const placed = layoutTokens(tokens, startX);
  const solved = value !== undefined;
  const height = solved ? 150 : 110;

  return (
    <div data-testid="lesson-figure" data-kind="letterBox" data-solved={solved ? "true" : "false"} style={figureWrapperStyle()}>
      <svg viewBox={`0 0 ${width} ${height}`} style={svgStyle()} role="img" aria-label={expr}>
        {placed.map((p, i) =>
          p.isVar ? (
            <g key={i} data-letterbox-var="true">
              <rect
                x={p.cx - VAR_BOX / 2}
                y={TOP_Y}
                width={VAR_BOX}
                height={VAR_BOX}
                rx={p.text === "□" ? 8 : VAR_BOX / 2}
                fill={solved ? FIGURE_COLORS.secondary : "none"}
                stroke={FIGURE_COLORS.secondary}
                strokeWidth={4}
              />
              <text
                x={p.cx}
                y={TOP_Y + VAR_BOX / 2 + FONT_SIZE * 0.32}
                fontSize={FONT_SIZE}
                fontWeight={900}
                fill={solved ? UI_COLORS.navy : FIGURE_COLORS.secondary}
                textAnchor="middle"
                fontFamily="var(--kids-font)"
              >
                {p.text}
              </text>
            </g>
          ) : (
            <text
              key={i}
              x={p.cx}
              y={TOP_Y + VAR_BOX / 2 + FONT_SIZE * 0.32}
              fontSize={FONT_SIZE}
              fontWeight={700}
              fill={FIGURE_COLORS.text}
              textAnchor="middle"
              fontFamily="var(--kids-font)"
            >
              {p.text}
            </text>
          ),
        )}
        {solved && (
          <text x={width / 2} y={height - 16} fontSize={22} fontWeight={700} fill={FIGURE_COLORS.primary} textAnchor="middle" fontFamily="var(--kids-font)">
            = {value}
          </text>
        )}
      </svg>
    </div>
  );
}

import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * 分度器 — 0〜180°の半円。10°ごとに目盛り、30°ごとに内側・外側 両方の数字を打つ
 * (内側は 0→180 が左から右、外側は 180→0 が左から右 = 実物の分度器と同じ二重目盛り)。
 * angle は「右向き0°から反時計回りにはかった角度」(外側目盛りと同じ数え方)。
 * 中心からの光線は SVG の rotate 変換で角度をそのまま表す (rotate(-angle) は
 * 右向きの基準線を反時計回りに angle 度だけ回す)。
 */

export interface ProtractorProps {
  angle: number;
  showReading?: boolean;
}

const CX = 200;
const CY = 210;
const R = 168;

function polar(radius: number, mathAngleDeg: number): { x: number; y: number } {
  const rad = (mathAngleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY - radius * Math.sin(rad) };
}

const TICKS = Array.from({ length: 19 }, (_, i) => i * 10); // 0,10,...,180

export function Protractor({ angle, showReading }: ProtractorProps) {
  const clamped = Math.max(0, Math.min(180, angle));

  return (
    <div data-testid="lesson-figure" data-kind="protractor" style={figureWrapperStyle()}>
      <svg viewBox="0 0 400 240" style={svgStyle()} role="img" aria-label={`${angle}° の角`}>
        {/* 半円の弧と底辺 */}
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke={FIGURE_COLORS.stroke}
          strokeWidth={3}
        />
        <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke={FIGURE_COLORS.stroke} strokeWidth={3} />

        {/* 目盛り (10°ごと。30°ごとに内側・外側の数字) */}
        {TICKS.map((t) => {
          const labeled = t % 30 === 0;
          const inner = polar(R - (labeled ? 18 : 10), t);
          const outer = polar(R, t);
          const innerValue = 180 - t;
          const outerValue = t;
          return (
            <g key={t}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={FIGURE_COLORS.stroke}
                strokeWidth={labeled ? 2.5 : 1.5}
              />
              {labeled && (
                <>
                  <text
                    x={polar(R + 22, t).x}
                    y={polar(R + 22, t).y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={13}
                    fontWeight={700}
                    fill={FIGURE_COLORS.text}
                  >
                    {outerValue}
                  </text>
                  <text
                    x={polar(R - 34, t).x}
                    y={polar(R - 34, t).y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={12}
                    fontWeight={700}
                    fill={FIGURE_COLORS.primary}
                  >
                    {innerValue}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* showReading: angle にぴったりの目盛り・数字を強調 */}
        {showReading && (
          <g data-testid="protractor-reading-highlight">
            <line
              x1={polar(R - 30, clamped).x}
              y1={polar(R - 30, clamped).y}
              x2={polar(R + 14, clamped).x}
              y2={polar(R + 14, clamped).y}
              stroke={FIGURE_COLORS.secondary}
              strokeWidth={5}
            />
            <text
              x={polar(R + 26, clamped).x}
              y={polar(R + 26, clamped).y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={16}
              fontWeight={900}
              fill={FIGURE_COLORS.secondary}
            >
              {Math.round(clamped)}
            </text>
            <text
              x={polar(R - 44, clamped).x}
              y={polar(R - 44, clamped).y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={15}
              fontWeight={900}
              fill={FIGURE_COLORS.secondary}
            >
              {Math.round(180 - clamped)}
            </text>
          </g>
        )}

        {/* 中心からの光線。rotate の角度がそのまま angle を表す */}
        <g transform={`rotate(${-angle} ${CX} ${CY})`}>
          <line
            data-testid="protractor-ray"
            x1={CX}
            y1={CY}
            x2={CX + R - 4}
            y2={CY}
            stroke={FIGURE_COLORS.secondary}
            strokeWidth={4}
          />
        </g>
        <circle cx={CX} cy={CY} r={5} fill={FIGURE_COLORS.stroke} />
      </svg>
    </div>
  );
}

import { FIGURE_COLORS, figureWrapperStyle, svgStyle } from "./shared";

/*
 * アナログ時計 — 12の数字と、分に応じて短針もすこし進む長針・短針。
 * second があれば右側にひとまわり小さい「点線の時計」を並べ、
 * 「いま」と「あと(比較先)」がひと目でわかるようにする。
 * 針の角度は 12時方向を0として時計回りに測り、SVG の rotate 変換をそのまま使う
 * (rotate は正の角度で時計回りなので、この向きの数え方とぴったり合う)。
 */

export interface ClockProps {
  hour: number;
  minute: number;
  second?: { hour: number; minute: number };
}

function handAngle(hour: number, minute: number): { hourDeg: number; minuteDeg: number } {
  const hourDeg = (hour % 12) * 30 + minute * 0.5;
  const minuteDeg = minute * 6;
  return { hourDeg, minuteDeg };
}

function ClockFace({
  cx,
  cy,
  r,
  hour,
  minute,
  ghost,
}: {
  cx: number;
  cy: number;
  r: number;
  hour: number;
  minute: number;
  ghost?: boolean;
}) {
  const { hourDeg, minuteDeg } = handAngle(hour, minute);
  const numberRadius = r - r * 0.2;
  const hourLen = r * 0.5;
  const minuteLen = r * 0.78;
  const strokeColor = ghost ? "rgba(255,255,255,0.55)" : FIGURE_COLORS.stroke;
  const handColor = ghost ? "rgba(255,217,61,0.75)" : FIGURE_COLORS.secondary;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={FIGURE_COLORS.empty}
        stroke={strokeColor}
        strokeWidth={ghost ? 3 : 4}
        strokeDasharray={ghost ? "6 6" : undefined}
      />
      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
        const deg = n * 30;
        const rad = (deg * Math.PI) / 180;
        const x = cx + numberRadius * Math.sin(rad);
        const y = cy - numberRadius * Math.cos(rad);
        return (
          <text
            key={n}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={ghost ? 11 : 15}
            fontWeight={700}
            fill={ghost ? "rgba(255,255,255,0.7)" : FIGURE_COLORS.text}
          >
            {n}
          </text>
        );
      })}
      {/* 時針 (分に応じて少し進む) */}
      <line
        data-testid="clock-hour-hand"
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - hourLen}
        stroke={handColor}
        strokeWidth={ghost ? 3 : 5}
        strokeLinecap="round"
        transform={`rotate(${hourDeg} ${cx} ${cy})`}
      />
      {/* 分針 */}
      <line
        data-testid="clock-minute-hand"
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - minuteLen}
        stroke={handColor}
        strokeWidth={ghost ? 2 : 3}
        strokeLinecap="round"
        transform={`rotate(${minuteDeg} ${cx} ${cy})`}
      />
      <circle cx={cx} cy={cy} r={ghost ? 3 : 4} fill={handColor} />
    </g>
  );
}

export function Clock({ hour, minute, second }: ClockProps) {
  const mainR = 110;
  const ghostR = 72;
  const viewWidth = second ? 500 : 260;
  const viewHeight = 260;
  const mainCx = second ? 140 : 130;
  const mainCy = 140;
  const ghostCx = 400;
  const ghostCy = 140;

  return (
    <div data-testid="lesson-figure" data-kind="clock" style={figureWrapperStyle()}>
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        style={svgStyle()}
        role="img"
        aria-label={`${hour}時${minute}分${second ? `、比べる時刻 ${second.hour}時${second.minute}分` : ""}`}
      >
        <ClockFace cx={mainCx} cy={mainCy} r={mainR} hour={hour} minute={minute} />
        {second && (
          <>
            <defs>
              <marker id="clockArrowHead" markerWidth={8} markerHeight={8} refX={6} refY={4} orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="rgba(255,255,255,0.6)" />
              </marker>
            </defs>
            <line
              x1={mainCx + mainR + 10}
              y1={mainCy}
              x2={ghostCx - ghostR - 10}
              y2={mainCy}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={2}
              markerEnd="url(#clockArrowHead)"
            />
            <ClockFace cx={ghostCx} cy={ghostCy} r={ghostR} hour={second.hour} minute={second.minute} ghost />
          </>
        )}
      </svg>
    </div>
  );
}

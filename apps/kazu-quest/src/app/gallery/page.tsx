"use client";

import { useEffect, useRef } from "react";
import type { PixelArt } from "@/content/art/format";
import { artSize } from "@/content/art/format";
import { TILE_ART } from "@/content/art/tiles";
import { ACTOR_ART } from "@/content/art/actors";
import { MONSTER_ART } from "@/content/art/monsters";
import { Figure } from "@/components/figures/Figure";
import type { FigureSpec } from "@/content/lessons/types";
import { SFX_NAMES } from "@/game/audio/sfxTable";
import { playSfx } from "@/game/audio/sfx";

/*
 * スプライトギャラリー — ビジュアル開発用のプレビューページ。
 * dev サーバーで /gallery を開くと、アート定義 (src/content/art/) の編集が
 * HMR で即座に反映される。タイルは 3x3 連結でつなぎ目も確認できる。
 */

function drawArt(canvas: HTMLCanvasElement, art: PixelArt, pixel: number, repeat = 1) {
  const scale = art.scale ?? 1;
  const { w, h } = artSize(art);
  canvas.width = w * pixel * repeat;
  canvas.height = h * pixel * repeat;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  for (let ry = 0; ry < repeat; ry++) {
    for (let rx = 0; rx < repeat; rx++) {
      art.rows.forEach((row, y) => {
        [...row].forEach((ch, x) => {
          if (ch === ".") return;
          const color = art.palette[ch];
          if (!color) return;
          ctx.fillStyle = color;
          ctx.fillRect(
            (rx * w + x * scale) * pixel,
            (ry * h + y * scale) * pixel,
            scale * pixel,
            scale * pixel,
          );
        });
      });
    }
  }
}

function ArtCard({
  name,
  art,
  repeat,
}: {
  name: string;
  art: PixelArt;
  repeat?: boolean;
}) {
  const bigRef = useRef<HTMLCanvasElement>(null);
  const tileRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (bigRef.current) drawArt(bigRef.current, art, 6);
    if (repeat && tileRef.current) drawArt(tileRef.current, art, 2, 3);
  }, [art, repeat]);

  return (
    <div
      style={{
        background: "var(--kids-panel-bg)",
        border: "2px solid var(--kids-panel-border)",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <canvas ref={bigRef} style={{ imageRendering: "pixelated" }} />
      {repeat && (
        <canvas
          ref={tileRef}
          title="3x3 連結 (つなぎ目チェック)"
          style={{ imageRendering: "pixelated", opacity: 0.9 }}
        />
      )}
      <code style={{ fontSize: 13, color: "var(--kids-text-soft)" }}>{name}</code>
    </div>
  );
}

function Section({
  title,
  arts,
  repeat,
}: {
  title: string;
  arts: Record<string, PixelArt>;
  repeat?: boolean;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontSize: 22,
          margin: "0 0 12px",
          color: "var(--kids-accent)",
          borderBottom: "2px solid var(--kids-panel-border)",
          paddingBottom: 6,
        }}
      >
        {title}
        <span style={{ fontSize: 14, marginLeft: 10, color: "var(--kids-text-soft)" }}>
          {Object.keys(arts).length} 件
        </span>
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        {Object.entries(arts).map(([name, art]) => (
          <ArtCard key={name} name={name} art={art} repeat={repeat} />
        ))}
      </div>
    </section>
  );
}

/*
 * ず (視覚モデル) ギャラリー — FigureSpec の 17 kind すべてを1つずつ並べる (LP-05)。
 * FIGURE_EXAMPLES に { label, spec } を足すだけで一覧に反映される (LP-05/LP-06/LP-07 共通)。
 * 未実装の kind は Figure が「(ず) じゅんびちゅう」を描くので、そのまま並べておけば
 * 実装が届き次第、置き換わったものが自然に表示される。
 */
const FIGURE_EXAMPLES: { label: string; spec: FigureSpec }[] = [
  { label: "tenFrame", spec: { kind: "tenFrame", count: 6, second: 3 } },
  { label: "numberLine", spec: { kind: "numberLine", from: 0, to: 20, marks: [5, 12], highlight: [8, 15] } },
  { label: "cherry", spec: { kind: "cherry", total: 9, split: [4, 5] } },
  { label: "columnCalc (+)", spec: { kind: "columnCalc", op: "+", a: 48, b: 27, showCarry: true } },
  { label: "columnCalc (÷)", spec: { kind: "columnCalc", op: "÷", a: 84, b: 4 } },
  { label: "array", spec: { kind: "array", rows: 3, cols: 4, groupBy: "row", remainder: 2 } },
  { label: "kukuTable", spec: { kind: "kukuTable", highlightRow: 7, highlightCol: 8 } },
  { label: "fractionBar", spec: { kind: "fractionBar", parts: 4, filled: 1 } },
  {
    label: "fractionBar (2本比較)",
    spec: { kind: "fractionBar", parts: 4, filled: 1, second: { parts: 3, filled: 2 } },
  },
  { label: "placeValue", spec: { kind: "placeValue", value: "3.25", highlightDigit: 1 } },
  { label: "placeValue (整数)", spec: { kind: "placeValue", value: "12000000", highlightDigit: 1 } },
  { label: "areaGrid", spec: { kind: "areaGrid", w: 4, h: 3, unit: "cm" } },
  { label: "areaGrid (三角形)", spec: { kind: "areaGrid", w: 6, h: 4, shape: "triangle" } },
  { label: "areaGrid (平行四辺形)", spec: { kind: "areaGrid", w: 6, h: 3, shape: "parallelogram" } },
  { label: "protractor", spec: { kind: "protractor", angle: 60, showReading: true } },
  { label: "clock", spec: { kind: "clock", hour: 3, minute: 15 } },
  {
    label: "clock (あと なんぷんで)",
    spec: { kind: "clock", hour: 3, minute: 45, second: { hour: 4, minute: 20 } },
  },
  { label: "percentBar", spec: { kind: "percentBar", base: 200, part: 50, label: "25%" } },
  {
    label: "tapeDiagram",
    spec: {
      kind: "tapeDiagram",
      segments: [
        { label: "りんご", length: 3 },
        { label: "みかん", length: 5 },
      ],
      total: "8",
    },
  },
  { label: "treeDiagram", spec: { kind: "treeDiagram", levels: [["A"], ["B", "C"]] } },
  { label: "letterBox", spec: { kind: "letterBox", expr: "□ + 3 = 8", value: 5 } },
  {
    label: "balance",
    spec: {
      kind: "balance",
      left: [{ label: "りんご", weight: 3 }],
      right: [{ label: "みかん", weight: 3 }],
    },
  },
  { label: "measureCup", spec: { kind: "measureCup", capacityDl: 10, filledDl: 6 } },
];

function FigureSection() {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontSize: 22,
          margin: "0 0 12px",
          color: "var(--kids-accent)",
          borderBottom: "2px solid var(--kids-panel-border)",
          paddingBottom: 6,
        }}
      >
        ず (figures)
        <span style={{ fontSize: 14, marginLeft: 10, color: "var(--kids-text-soft)" }}>
          {FIGURE_EXAMPLES.length} 件
        </span>
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {FIGURE_EXAMPLES.map(({ label, spec }) => (
          <div
            key={label}
            style={{
              background: "var(--kids-panel-bg)",
              border: "2px solid var(--kids-panel-border)",
              borderRadius: 12,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Figure spec={spec} />
            <code style={{ fontSize: 13, color: "var(--kids-text-soft)" }}>{label}</code>
          </div>
        ))}
      </div>
    </section>
  );
}

/*
 * おと (効果音) ギャラリー — AU-02: SFX_TABLE の全 SfxName をボタン1つずつ並べ、
 * タップで playSfx(name) を鳴らして試聴する (Playwright は無音なので実機での手動確認用)。
 */
function SfxSection() {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontSize: 22,
          margin: "0 0 12px",
          color: "var(--kids-accent)",
          borderBottom: "2px solid var(--kids-panel-border)",
          paddingBottom: 6,
        }}
      >
        おと (sfx)
        <span style={{ fontSize: 14, marginLeft: 10, color: "var(--kids-text-soft)" }}>
          {SFX_NAMES.length} 件
        </span>
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 10,
        }}
      >
        {SFX_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            data-testid={`gallery-sfx-${name}`}
            onClick={() => playSfx(name)}
            style={{
              background: "var(--kids-panel-bg)",
              border: "2px solid var(--kids-panel-border)",
              borderRadius: 10,
              padding: "14px 8px",
              minHeight: 56,
              color: "var(--kids-text-soft)",
              fontFamily: "var(--kids-font)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function GalleryPage() {
  return (
    <main
      style={{
        height: "100vh",
        overflow: "auto",
        padding: "24px 28px 60px",
        background: "var(--kids-bg)",
        fontFamily: "var(--kids-font)",
        touchAction: "auto",
        userSelect: "text",
      }}
    >
      <h1 style={{ fontSize: 28, margin: "0 0 6px", color: "#ffffff" }}>
        カズクエ スプライトギャラリー
      </h1>
      <p style={{ margin: "0 0 24px", color: "var(--kids-text-soft)", fontSize: 14 }}>
        src/content/art/ を編集すると即時反映されます。マップ確認は{" "}
        <code>/?map=&lt;mapId&gt;&amp;spawn=&lt;name&gt;</code>、戦闘確認は{" "}
        <code>/?battle=&lt;monsterId,...&gt;</code> (dev のみ)。
      </p>
      <Section title="タイル (tile-*)" arts={TILE_ART} repeat />
      <Section title="キャラクター (actor-*)" arts={ACTOR_ART} />
      <Section title="モンスター (monster-*)" arts={MONSTER_ART} />
      <FigureSection />
      <SfxSection />
    </main>
  );
}

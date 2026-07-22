"use client";

import { useEffect, useRef } from "react";
import type { PixelArt } from "@/content/art/format";
import { artSize } from "@/content/art/format";
import { TILE_ART } from "@/content/art/tiles";
import { ACTOR_ART } from "@/content/art/actors";
import { MONSTER_ART } from "@/content/art/monsters";

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
    </main>
  );
}

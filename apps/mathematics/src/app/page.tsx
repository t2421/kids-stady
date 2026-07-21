"use client";

import dynamic from "next/dynamic";

/* Phaser は window に依存するためサーバーサイドでは読み込まない */
const PhaserGame = dynamic(
  () => import("@/components/PhaserGame").then((m) => m.PhaserGame),
  { ssr: false },
);

export default function Home() {
  return <PhaserGame />;
}

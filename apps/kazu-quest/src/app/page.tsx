"use client";

import dynamic from "next/dynamic";

/* Phaser は window に依存するためサーバーサイドでは読み込まない */
const PhaserGame = dynamic(
  () => import("@/components/PhaserGame").then((m) => m.PhaserGame),
  { ssr: false },
);

/* 算数プロンプトは Phaser と同じ EventBus モジュールを共有する必要がある */
const MathPromptPanel = dynamic(
  () => import("@/components/MathPromptPanel").then((m) => m.MathPromptPanel),
  { ssr: false },
);

export default function Home() {
  return (
    <>
      <PhaserGame />
      <MathPromptPanel />
    </>
  );
}

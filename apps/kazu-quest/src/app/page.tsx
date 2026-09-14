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

const SpellTestScreen = dynamic(
  () => import("@/components/SpellTestScreen").then((m) => m.SpellTestScreen),
  { ssr: false },
);

const DrillQuestScreen = dynamic(
  () => import("@/components/DrillQuestScreen").then((m) => m.DrillQuestScreen),
  { ssr: false },
);

const ProfileGate = dynamic(
  () => import("@/components/ProfileGate").then((m) => m.ProfileGate),
  { ssr: false },
);

/* 会話UI・メニューは DOM で描画する (Canvas はゲーム世界のみ) */
const GameUiOverlay = dynamic(
  () => import("@/components/GameUiOverlay").then((m) => m.GameUiOverlay),
  { ssr: false },
);

const StatusPanelOverlay = dynamic(
  () => import("@/components/StatusPanelOverlay").then((m) => m.StatusPanelOverlay),
  { ssr: false },
);

const MenuButton = dynamic(
  () => import("@/components/MenuButton").then((m) => m.MenuButton),
  { ssr: false },
);

/* 縦持ち警告は全 UI の最前面。matchMedia は window 依存なので client のみ */
const OrientationGuard = dynamic(
  () => import("@/components/OrientationGuard").then((m) => m.OrientationGuard),
  { ssr: false },
);

export default function Home() {
  return (
    <>
      <PhaserGame />
      <MathPromptPanel />
      <SpellTestScreen />
      <DrillQuestScreen />
      <GameUiOverlay />
      <StatusPanelOverlay />
      <MenuButton />
      <ProfileGate />
      <OrientationGuard />
    </>
  );
}

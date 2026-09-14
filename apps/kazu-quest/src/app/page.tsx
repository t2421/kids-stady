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

/* とっくん (KQ-11): 習得テストの前の練習。テストと同じ出題ループ、EventBus 共有のため client のみ */
const SpellPracticeScreen = dynamic(
  () => import("@/components/SpellPracticeScreen").then((m) => m.SpellPracticeScreen),
  { ssr: false },
);

const DrillQuestScreen = dynamic(
  () => import("@/components/DrillQuestScreen").then((m) => m.DrillQuestScreen),
  { ssr: false },
);

/* ふくしゅうのほこら (KQ-13): おだいと同じ出題ループ、EventBus 共有のため client のみ */
const ReviewQuestScreen = dynamic(
  () => import("@/components/ReviewQuestScreen").then((m) => m.ReviewQuestScreen),
  { ssr: false },
);

/* まなびやのレッスン画面 (LP-08): EventBus "open-lesson" で開く、client のみ */
const LessonScreen = dynamic(
  () => import("@/components/LessonScreen").then((m) => m.LessonScreen),
  { ssr: false },
);

/* 前提チェック (LP-10): EventBus "open-readiness" で開く、client のみ */
const ReadinessScreen = dynamic(
  () => import("@/components/ReadinessScreen").then((m) => m.ReadinessScreen),
  { ssr: false },
);

/* おさらい (LP-11): EventBus "open-review" で開く、client のみ */
const ReviewScreen = dynamic(
  () => import("@/components/ReviewScreen").then((m) => m.ReviewScreen),
  { ssr: false },
);

/* さきどり (LP-11): EventBus "open-preview" で開く、client のみ */
const PreviewMenu = dynamic(
  () => import("@/components/PreviewMenu").then((m) => m.PreviewMenu),
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

/* ぼうけんのせいせき (KQ-14): 単独オーバーレイ。EventBus "show-stats" で開く */
const StatsScreen = dynamic(
  () => import("@/components/StatsScreen").then((m) => m.StatsScreen),
  { ssr: false },
);

/* 戦闘後の まちがいノート (BattleScene と EventBus で往復する) */
const MistakeNoteOverlay = dynamic(
  () => import("@/components/MistakeNoteOverlay").then((m) => m.MistakeNoteOverlay),
  { ssr: false },
);

const MenuButton = dynamic(
  () => import("@/components/MenuButton").then((m) => m.MenuButton),
  { ssr: false },
);

/* タイトルメニュー (KQ-22): つづきから / はじめから / せいせき。EventBus 共有のため client のみ */
const TitleMenu = dynamic(
  () => import("@/components/TitleMenu").then((m) => m.TitleMenu),
  { ssr: false },
);

/* 縦持ち警告は全 UI の最前面。matchMedia は window 依存なので client のみ */
const OrientationGuard = dynamic(
  () => import("@/components/OrientationGuard").then((m) => m.OrientationGuard),
  { ssr: false },
);

/* FPS 表示 (KQ-40): ?debug=1 のときだけ左上に出す。window 依存なので client のみ */
const FpsMeter = dynamic(
  () => import("@/components/FpsMeter").then((m) => m.FpsMeter),
  { ssr: false },
);

export default function Home() {
  return (
    <>
      <PhaserGame />
      <MathPromptPanel />
      <SpellTestScreen />
      <SpellPracticeScreen />
      <DrillQuestScreen />
      <ReviewQuestScreen />
      <LessonScreen />
      <ReadinessScreen />
      <ReviewScreen />
      <PreviewMenu />
      <GameUiOverlay />
      <StatusPanelOverlay />
      <StatsScreen />
      <MistakeNoteOverlay />
      <MenuButton />
      <TitleMenu />
      <ProfileGate />
      <OrientationGuard />
      <FpsMeter />
    </>
  );
}

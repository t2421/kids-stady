"use client";

import dynamic from "next/dynamic";

/* Phaser とプロフィールUI (localStorage) は window に依存するため SSR しない */
const PhaserGame = dynamic(
  () => import("@/components/PhaserGame").then((m) => m.PhaserGame),
  { ssr: false },
);
const ProfileGate = dynamic(
  () => import("@/components/ProfileGate").then((m) => m.ProfileGate),
  { ssr: false },
);
const ProblemPanel = dynamic(
  () => import("@/components/ProblemPanel").then((m) => m.ProblemPanel),
  { ssr: false },
);
const StatsScreen = dynamic(
  () => import("@/components/StatsScreen").then((m) => m.StatsScreen),
  { ssr: false },
);

export default function Home() {
  return (
    <>
      <PhaserGame />
      <ProblemPanel />
      <StatsScreen />
      <ProfileGate />
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { getProfileId, getSave } from "@/game/session";
import { loadLearning } from "@/lib/learning";
import { buildStats, type StatsData } from "@/lib/stats";
import { actionButton, dqWindow, UI_COLORS } from "@/components/uiTheme";
import { DailyChart, GradeBar, Orb } from "@/components/StatsCharts";

/*
 * ぼうけんのせいせき (KQ-14)。
 * - StatsBody: 本文だけ (ステータスパネルの「せいせき」タブが埋め込む)
 * - StatsScreen: 単独オーバーレイ。EventBus "show-stats" で開き、"stats-closed" で閉じる
 *   (タイトルメニューから使う)。開いている間のタップはゲームへ伝えない。
 * 集計は lib/stats.buildStats (純関数)。絵文字は使わない (絵は StatsCharts の SVG)。
 */

const font: React.CSSProperties = {
  fontFamily: "var(--kids-font)",
  fontWeight: 700,
  color: "#ffffff",
};

const lineFont: React.CSSProperties = {
  ...font,
  fontSize: "clamp(16px, 2.3vw, 21px)",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        ...font,
        fontSize: "clamp(17px, 2.4vw, 22px)",
        color: UI_COLORS.yellow,
        marginBottom: 10,
        paddingBottom: 4,
        borderBottom: `2px solid ${UI_COLORS.accent}`,
      }}
    >
      {children}
    </div>
  );
}

function Section({
  title,
  full,
  children,
}: {
  title: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        gridColumn: full ? "1 / -1" : undefined,
        border: `2px solid rgba(255,255,255,0.25)`,
        borderRadius: 12,
        padding: "12px 16px 14px",
      }}
    >
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
  );
}

function WeakList({ weak }: { weak: StatsData["weak"] }) {
  if (weak.length === 0) {
    return (
      <div style={{ ...lineFont, color: UI_COLORS.textSub, padding: "8px 0" }}>
        にがてな もんだいは まだ ないよ。もっと あそぼう!
      </div>
    );
  }
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
      {weak.map((w, i) => (
        <li
          key={w.skillId}
          data-testid="stats-weak-row"
          style={{
            ...lineFont,
            display: "flex",
            alignItems: "center",
            gap: 12,
            minHeight: 44,
            padding: "6px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              flex: "0 0 32px",
              height: 32,
              lineHeight: "32px",
              textAlign: "center",
              borderRadius: 8,
              background: UI_COLORS.navy,
              color: UI_COLORS.yellow,
              fontSize: 18,
            }}
          >
            {i + 1}
          </span>
          <span style={{ flex: "1 1 auto" }}>{w.label}</span>
          <span style={{ color: "#ff9c9c", whiteSpace: "nowrap" }}>{w.accuracy}%</span>
          <span style={{ color: UI_COLORS.textSub, fontSize: 15, whiteSpace: "nowrap" }}>
            {w.attempts}かい
          </span>
        </li>
      ))}
    </ol>
  );
}

/* 本文 (タブ埋め込み・単独オーバーレイ共通) */
export function StatsBody({ data }: { data: StatsData }) {
  return (
    <div
      data-testid="stats-body"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 14,
      }}
    >
      <Section title="あつめた 数晶" full>
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8 }}>
          {data.orbs.map((lit, i) => (
            <Orb key={i} index={i} lit={lit} />
          ))}
        </div>
      </Section>

      <Section title="がくねんごとの せいせき">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.byGrade.map((g) => (
            <GradeBar key={g.grade} stat={g} />
          ))}
        </div>
        <div style={{ ...font, fontSize: 14, color: UI_COLORS.textSub, marginTop: 8 }}>
          ぜんぶで せいかい {data.totals.correct} / まちがい {data.totals.wrong}
        </div>
      </Section>

      <Section title="にがてな もんだい">
        <WeakList weak={data.weak} />
      </Section>

      <Section title="14にちの れんしゅう (せいかいの かず)" full>
        <DailyChart daily={data.daily} />
      </Section>

      <Section title="あそんだ じかん" full>
        <div data-testid="stats-playtime" style={{ ...lineFont, fontSize: "clamp(18px, 2.6vw, 24px)" }}>
          {data.playtime}
        </div>
      </Section>
    </div>
  );
}

function collectStats(): StatsData {
  const profileId = getProfileId();
  return buildStats(getSave(), profileId ? loadLearning(profileId) : null);
}

/* 単独オーバーレイ (タイトルメニューなどから "show-stats" で開く) */
export function StatsScreen() {
  const [data, setData] = useState<StatsData | null>(null);
  const openRef = useRef(false);
  openRef.current = data !== null;
  const openedAtRef = useRef(0);

  const close = useCallback(() => {
    if (!openRef.current) return;
    setData(null);
    EventBus.emit("stats-closed");
  }, []);

  useEffect(() => {
    const onShow = () => {
      openedAtRef.current = performance.now();
      setData(collectStats());
    };
    EventBus.on("show-stats", onShow);
    return () => {
      EventBus.off("show-stats", onShow);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!openRef.current) return;
      /* 開く前に発火した同一キーで即閉じない (StatusPanelOverlay と同じガード) */
      if (e.timeStamp <= openedAtRef.current) return;
      const key = e.key.toLowerCase();
      if (["x", "escape"].includes(key)) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  if (!data) return null;

  /* 背景タップでは閉じない (誤タップ対策)。タップはゲームへ伝えない */
  const swallow = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      data-testid="stats-screen"
      onClick={swallow}
      onPointerDown={swallow}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 46,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 8, 20, 0.6)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ぼうけんの せいせき"
        style={dqWindow({
          width: "min(94vw, 920px)",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 14,
          padding: "18px 22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        })}
      >
        <div style={{ ...font, fontSize: "clamp(22px, 3vw, 30px)", color: UI_COLORS.yellow, textAlign: "center" }}>
          ぼうけんの せいせき
        </div>
        <StatsBody data={data} />
        <div style={{ display: "flex" }}>
          <button
            data-testid="stats-close"
            style={{ ...actionButton("#8a2f1c"), marginLeft: "auto", minWidth: 170, minHeight: 60 }}
            onClick={close}
          >
            とじる
          </button>
        </div>
      </div>
    </div>
  );
}

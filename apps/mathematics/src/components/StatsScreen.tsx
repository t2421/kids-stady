"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import { getActiveProfileId } from "@/game/session";
import { getSkill } from "@/lib/curriculum";
import {
  emptyLog,
  loadLearning,
  recentDaily,
  skillReports,
  weakSkills,
  type LearningLog,
  type SkillReport,
} from "@/lib/learning";
import "./stats-screen.css";

type DailyReport = ReturnType<typeof recentDaily>[number];

function skillDetails(report: SkillReport) {
  const skill = getSkill(report.skillId);
  return {
    grade: skill?.grade ?? Number.POSITIVE_INFINITY,
    label: skill?.label ?? report.skillId,
  };
}

function accuracyClass(accuracy: number): string {
  if (accuracy >= 80) return "st-accuracy-good";
  if (accuracy >= 50) return "st-accuracy-ok";
  return "st-accuracy-weak";
}

function trendLabel(trendMs: number): string {
  if (trendMs < -300) return "⏫ はやくなってる!";
  if (trendMs > 300) return "🐢 ゆっくりめ";
  return "—";
}

function appNote(app: string) {
  return app === "keisan-shooter" ? (
    <span className="st-app-note">けいさんシューター</span>
  ) : null;
}

function formatDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export function StatsScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [log, setLog] = useState<LearningLog>(() => emptyLog());
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const openStats = () => {
      const profileId = getActiveProfileId();
      setLog(profileId ? loadLearning(profileId) : emptyLog());
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setIsOpen(true);
    };

    EventBus.on("stats-open", openStats);
    return () => {
      EventBus.off("stats-open", openStats);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => previousFocusRef.current?.focus());
  };

  const daily = useMemo(() => recentDaily(log, 7), [log]);
  const maxDailyAttempts = Math.max(1, ...daily.map((day) => day.c + day.w));
  const weak = useMemo(() => weakSkills(log), [log]);
  const reports = useMemo(
    () =>
      skillReports(log)
        .filter((report) => report.attempts > 0)
        .sort((a, b) => {
          const aSkill = skillDetails(a);
          const bSkill = skillDetails(b);
          return (
            aSkill.grade - bSkill.grade ||
            aSkill.label.localeCompare(bSkill.label, "ja") ||
            a.skillId.localeCompare(b.skillId)
          );
        }),
    [log],
  );

  if (!isOpen) return null;

  return (
    <div className="st-overlay">
      <div
        ref={dialogRef}
        className="st-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="st-title"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
      >
        <header className="st-header">
          <h1 id="st-title">📊 せいせき</h1>
          <button className="st-close" type="button" onClick={close}>
            とじる
          </button>
        </header>

        <main className="st-content">
          <section className="st-section" aria-labelledby="st-week-title">
            <h2 id="st-week-title">こんしゅうの がんばり</h2>
            <div className="st-chart">
              {daily.map((day: DailyReport, index) => {
                const attempts = day.c + day.w;
                const accuracy = attempts ? Math.round((day.c / attempts) * 100) : 0;
                const height = attempts ? Math.max(10, (attempts / maxDailyAttempts) * 100) : 0;
                const isToday = index === daily.length - 1;

                return (
                  <div className={`st-day${isToday ? " st-day-today" : ""}`} key={day.date}>
                    <span className="st-day-accuracy">{accuracy}%</span>
                    <div className="st-bar-track" aria-hidden="true">
                      <span className="st-bar" style={{ height: `${height}%` }} />
                    </div>
                    <span className="st-day-count">{attempts} もん</span>
                    <span className="st-day-date">{isToday ? "きょう" : formatDate(day.date)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="st-section" aria-labelledby="st-weak-title">
            <h2 id="st-weak-title">にがて トップ3</h2>
            {weak.length > 0 ? (
              <div className="st-weak-grid">
                {weak.map((report, index) => {
                  const details = skillDetails(report);
                  return (
                    <article className="st-weak-card" key={report.skillId}>
                      <span className="st-rank">{index + 1}</span>
                      <div className="st-weak-copy">
                        <h3>{details.label}</h3>
                        {appNote(report.app)}
                        <p>
                          <strong>{report.accuracy}%</strong> せいかい
                        </p>
                        <small>{report.attempts} かい ちょうせんしたよ</small>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="st-empty">まだ データが たりないよ。いっぱい あそぼう!</p>
            )}
          </section>

          <section className="st-section" aria-labelledby="st-skills-title">
            <h2 id="st-skills-title">スキルべつ せいせき</h2>
            {reports.length > 0 ? (
              <div className="st-table-wrap">
                <table className="st-table">
                  <thead>
                    <tr>
                      <th scope="col">スキル</th>
                      <th scope="col">せいかいりつ</th>
                      <th scope="col">へいきん びょう</th>
                      <th scope="col">トレンド</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const details = skillDetails(report);
                      return (
                        <tr key={report.skillId}>
                          <th scope="row">
                            <span className="st-skill-name">{details.label}</span>
                            {Number.isFinite(details.grade) && (
                              <span className="st-grade">{details.grade} ねんせい</span>
                            )}
                            {appNote(report.app)}
                          </th>
                          <td>
                            <span className={`st-accuracy ${accuracyClass(report.accuracy)}`}>
                              {report.accuracy}%
                            </span>
                          </td>
                          <td>{report.avgMs > 0 ? (report.avgMs / 1000).toFixed(1) : "—"}</td>
                          <td className="st-trend">{trendLabel(report.trendMs)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="st-empty">まだ せいせきが ないよ。もんだいに ちょうせんしよう!</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

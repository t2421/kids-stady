/*
 * KQ-07 バランス表の生成: `npx tsx scripts/balance-report.ts`
 * tests/balanceScenarios.ts のシナリオを想定Lv−3 / 想定Lv / 想定Lv+3 で
 * 200回ずつ自動戦闘し、docs/kazu-quest-balance.md を書き出す。
 * 加えて 70% に届く最小Lv の1刻み探索、装備なし・正答率60% の感度、
 * 必須戦闘 (ボス) の EXP だけで想定Lv に届くかの概算も載せる。
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getItem } from "../src/content/items";
import { DEFAULT_SIM_OPTIONS, buildParty, simulate } from "../src/lib/battle/simulate";
import type { SimOptions } from "../src/lib/battle/simulate";
import { expForLevel } from "../src/lib/battle/stats";
import {
  BALANCE_SCENARIOS,
  LEVEL_OFFSETS,
  MAX_WIN_RATE_BELOW_LEVEL,
  MIN_WIN_RATE_AT_LEVEL,
  partyLabel,
  scenarioMonsters,
  type BalanceScenario,
} from "../tests/balanceScenarios";

const OUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../../../docs/kazu-quest-balance.md");
/* 1刻み探索は点数が多いので回数を落とす */
const SWEEP_RUNS = 100;
const SENSITIVITY_CORRECT_RATE = 0.6;

interface LevelRow {
  level: number;
  winRate: number;
  avgRounds: number;
}

interface ScenarioReport {
  scenario: BalanceScenario;
  rows: LevelRow[];
  /* 測定3点のうち ≥70% を満たす最小Lv (受け入れ条件の定義)。なければ undefined */
  recommended: number | undefined;
  /* Lv1 〜 想定+3 を1刻みで探した ≥70% の最小Lv */
  threshold: number | undefined;
  /* 想定Lv での感度 */
  noEquipWinRate: number;
  lowAccuracyWinRate: number;
  issues: string[];
}

function winRate(s: BalanceScenario, level: number, options: Partial<SimOptions> = {}): number {
  return simulate(buildParty(s.members, level), scenarioMonsters(s), options).winRate;
}

function measureRows(s: BalanceScenario): LevelRow[] {
  return LEVEL_OFFSETS.map((offset) => {
    const level = s.level + offset;
    const summary = simulate(buildParty(s.members, level), scenarioMonsters(s));
    return { level, winRate: summary.winRate, avgRounds: summary.avgRounds };
  });
}

function findThreshold(s: BalanceScenario): number | undefined {
  const levels = Array.from({ length: s.level + 3 }, (_, i) => i + 1);
  return levels.find((level) => winRate(s, level, { runs: SWEEP_RUNS }) >= MIN_WIN_RATE_AT_LEVEL);
}

function noEquipWinRate(s: BalanceScenario): number {
  const bare = { ...s, members: s.members.map((m) => ({ ...m, equipment: {} })) };
  return winRate(bare, s.level);
}

function runScenario(s: BalanceScenario): ScenarioReport {
  const rows = measureRows(s);
  return {
    scenario: s,
    rows,
    recommended: rows.find((r) => r.winRate >= MIN_WIN_RATE_AT_LEVEL)?.level,
    threshold: findThreshold(s),
    noEquipWinRate: noEquipWinRate(s),
    lowAccuracyWinRate: winRate(s, s.level, { correctRate: SENSITIVITY_CORRECT_RATE }),
    issues: findIssues(s, rows),
  };
}

function findIssues(s: BalanceScenario, rows: LevelRow[]): string[] {
  const at = rows.find((r) => r.level === s.level);
  const below = rows.find((r) => r.level === s.level - 3);
  const measured = [
    at && at.winRate < MIN_WIN_RATE_AT_LEVEL
      ? `想定Lv${s.level} の勝率 ${pct(at.winRate)} < ${pct(MIN_WIN_RATE_AT_LEVEL)}`
      : undefined,
    below && below.winRate > MAX_WIN_RATE_BELOW_LEVEL
      ? `Lv${s.level - 3} でも勝率 ${pct(below.winRate)} > ${pct(MAX_WIN_RATE_BELOW_LEVEL)} (ぬるすぎ)`
      : undefined,
  ];
  const flagged = Object.values(s.flags ?? {}).map((reason) => `テストで skip 中: ${reason}`);
  return [...measured.filter((m): m is string => !!m), ...flagged];
}

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function equipmentLabel(s: BalanceScenario): string {
  const eq = s.members[0]?.equipment ?? {};
  return Object.values(eq)
    .map((id) => (id ? (getItem(id)?.name ?? id) : ""))
    .filter(Boolean)
    .join("・");
}

function levelLabel(threshold: number | undefined, fallback: string): string {
  return threshold === undefined ? fallback : `Lv${threshold}`;
}

function tableRows(reports: ScenarioReport[]): string[] {
  return reports.flatMap(({ scenario: s, rows, recommended }) =>
    rows.map((r) => {
      const mark = r.level === s.level ? " (想定)" : "";
      const rec = levelLabel(recommended, "— (要調整)");
      return `| ${s.chapter} | ${s.label} | ${partyLabel(s)} | Lv${r.level}${mark} | ${pct(r.winRate)} | ${r.avgRounds.toFixed(1)} | ${rec} |`;
    }),
  );
}

function renderIssues(reports: ScenarioReport[]): string[] {
  const broken = reports.filter((r) => r.issues.length > 0);
  if (broken.length === 0) return ["問題なし — 全シナリオが合格ラインを満たしている。"];
  return broken.flatMap((r) => [
    `- **章${r.scenario.chapter} ${r.scenario.label}** (想定Lv${r.scenario.level})`,
    ...r.issues.map((i) => `  - ${i}`),
  ]);
}

function renderRecommended(reports: ScenarioReport[]): string[] {
  return reports.map(({ scenario: s, recommended, threshold }) => {
    const rec = levelLabel(recommended, "— (Lv+3 でも 70% 未満)");
    const thr = levelLabel(threshold, "— (Lv+3 まで届かず)");
    return `| ${s.chapter} | ${s.label} | Lv${s.level} | ${rec} | ${thr} |`;
  });
}

function renderSensitivity(reports: ScenarioReport[]): string[] {
  return reports.map(({ scenario: s, rows, noEquipWinRate: bare, lowAccuracyWinRate: low }) => {
    const base = rows.find((r) => r.level === s.level)?.winRate ?? 0;
    return `| ${s.chapter} | ${s.label} | Lv${s.level} | ${pct(base)} | ${pct(bare)} | ${pct(low)} |`;
  });
}

/* 章ごとに1行: 章頭Lv → 想定Lv に必要な EXP と、その章のボス (必須戦闘) EXP 合計 */
function renderExp(reports: ScenarioReport[]): string[] {
  const chapters = [...new Set(reports.map((r) => r.scenario.chapter))];
  return chapters.map((chapter) => {
    const own = reports.filter((r) => r.scenario.chapter === chapter).map((r) => r.scenario);
    const final = own[own.length - 1];
    const need = expForLevel(final.level) - expForLevel(final.startLevel);
    const bossExp = own
      .flatMap((s) => scenarioMonsters(s).flat())
      .reduce((sum, m) => sum + m.exp, 0);
    const share = need === 0 ? 100 : Math.round((bossExp / need) * 100);
    return `| ${chapter} | Lv${final.startLevel} → Lv${final.level} | ${need} | ${bossExp} | ${share}% |`;
  });
}

function renderHeader(): string[] {
  const o = DEFAULT_SIM_OPTIONS;
  return [
    "# カズクエ ボス戦バランス表 (KQ-07)",
    "",
    "`npx tsx scripts/balance-report.ts` (apps/kazu-quest) で再生成する。手で編集しない。",
    "",
    "## 前提",
    "",
    `- 各シナリオ ${o.runs} 回の自動戦闘 (seed=${o.seed}、算数正答率 ${pct(o.correctRate)}、かいしん率 ${pct(o.criticalRate)}、${o.maxRounds} ラウンド超は負け扱い)`,
    "- 単純AI: 味方の誰かが HP 50% 未満なら回復呪文 (1ラウンド1回)、それ以外は MP の足りる期待ダメージ最大の攻撃呪文、なければ通常攻撃。アイテム・ぼうぎょ・バフ/デバフは使わない",
    "- パーティ: その章時点の全員、ボス直前に全回復。想定Lv は章1=設計値 (Lv7)、以降は仲間の加入Lv (6/13/20) から補間。中ボスは章末 −2。ゼロム → 真の姿は HP/MP 持ち越しの連戦",
    "- 呪文: 勇者は章1〜Nの spellIds 全部。**仲間は加入時の initialSpells のみ** (呪文テストで覚えるのは勇者だけ、というエンジン仕様のまま)",
    "- 装備: その章の店で買える部位ごとの最強を全員分そろえた想定 (ゴールドの実現性は未検証)",
    `- 合格ライン: 想定Lv で勝率 ≥ ${pct(MIN_WIN_RATE_AT_LEVEL)}、想定Lv−3 で ≤ ${pct(MAX_WIN_RATE_BELOW_LEVEL)}`,
    "",
  ];
}

function renderReport(reports: ScenarioReport[]): string {
  return [
    ...renderHeader(),
    "## 推奨レベル (ボス前の すいしょうレベル案内 KQ-23 の根拠)",
    "",
    "- **推奨レベル** = 測定した3点 (想定−3 / 想定 / 想定+3) のうち勝率 70% 以上になる最小Lv (受け入れ条件の定義)",
    `- **70%到達Lv** = Lv1 から1刻みで探した勝率 70% 以上の最小Lv (${SWEEP_RUNS} 回/点)。案内に使うなら こちらが実態に近い`,
    "",
    "| 章 | ボス | 想定Lv | 推奨レベル | 70%到達Lv (1刻み) |",
    "|---|---|---|---|---|",
    ...renderRecommended(reports),
    "",
    "## 要調整",
    "",
    "数値 (モンスター・呪文・装備) は本タスクでは直していない。以下は別タスクで調整する。",
    "",
    ...renderIssues(reports),
    "",
    "## 全シナリオ",
    "",
    "| 章 | ボス | パーティ | Lv | 勝率 | 平均ターン | 推奨レベル |",
    "|---|---|---|---|---|---|---|",
    ...tableRows(reports),
    "",
    "## 感度 (想定Lv での勝率)",
    "",
    `装備なし = 全員 装備ゼロ。正答率${pct(SENSITIVITY_CORRECT_RATE)} = 算数プロンプトの正答率を落とした場合。`,
    "",
    `| 章 | ボス | Lv | 基準 | 装備なし | 正答率${pct(SENSITIVITY_CORRECT_RATE)} |`,
    "|---|---|---|---|---|---|",
    ...renderSensitivity(reports),
    "",
    "## EXP 概算 (必須戦闘だけで想定Lvに届くか)",
    "",
    "必要EXP = 章頭Lv → 想定Lv。ボスEXP = その章の boss:true 戦闘の EXP 合計。残りは雑魚戦で稼ぐ必要がある。",
    "",
    "| 章 | Lv | 必要EXP | ボスEXP | ボスで賄える割合 |",
    "|---|---|---|---|---|",
    ...renderExp(reports),
    "",
    "## 装備の想定",
    "",
    ...[...new Set(reports.map((r) => r.scenario.chapter))].map((chapter) => {
      const s = reports.find((r) => r.scenario.chapter === chapter)!.scenario;
      return `- 章${chapter}: ${equipmentLabel(s)}`;
    }),
    "",
  ].join("\n");
}

function main(): void {
  const reports = BALANCE_SCENARIOS.map(runScenario);
  const markdown = renderReport(reports);
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, markdown, "utf8");
  console.log(markdown);
  console.log(`\nwrote ${OUT_PATH}`);
}

main();

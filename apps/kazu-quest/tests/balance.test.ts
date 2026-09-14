/*
 * KQ-07: 章クリア想定パーティでのボス戦バランス。
 *   - 想定Lv で勝率 ≥ 70% (グラインド不要)
 *   - 想定Lv−3 で勝率 ≤ 95% (ぬるすぎない)
 * 破綻している章は BALANCE_SCENARIOS の flagged に理由を書いて skip する
 * (数値は直さない — 調整は別タスク)。表の再生成は `npx tsx scripts/balance-report.ts`。
 */

import { describe, expect, it } from "vitest";
import { buildParty, simulate } from "../src/lib/battle/simulate";
import {
  BALANCE_SCENARIOS,
  MAX_WIN_RATE_BELOW_LEVEL,
  MIN_WIN_RATE_AT_LEVEL,
  scenarioMonsters,
  type BalanceScenario,
} from "./balanceScenarios";

function winRateAt(s: BalanceScenario, level: number): number {
  return simulate(buildParty(s.members, level), scenarioMonsters(s)).winRate;
}

describe("ボス戦バランス (KQ-07)", () => {
  for (const s of BALANCE_SCENARIOS) {
    const name = `章${s.chapter} ${s.label}`;
    /* flags = 破綻が判明している項目。assert は残し、緑を保つために該当項目だけ skip */
    const hardCheck = s.flags?.tooHard ? it.skip : it;
    const easyCheck = s.flags?.tooEasy ? it.skip : it;

    hardCheck(`${name}: 想定Lv${s.level} で勝率 ≥ ${MIN_WIN_RATE_AT_LEVEL * 100}%`, () => {
      expect(winRateAt(s, s.level)).toBeGreaterThanOrEqual(MIN_WIN_RATE_AT_LEVEL);
    });

    easyCheck(`${name}: Lv${s.level - 3} で勝率 ≤ ${MAX_WIN_RATE_BELOW_LEVEL * 100}%`, () => {
      expect(winRateAt(s, s.level - 3)).toBeLessThanOrEqual(MAX_WIN_RATE_BELOW_LEVEL);
    });

    for (const reason of Object.values(s.flags ?? {})) {
      it.todo(`${name}: 要調整 — ${reason}`);
    }
  }
});

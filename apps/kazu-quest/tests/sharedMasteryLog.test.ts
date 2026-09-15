/*
 * src/lib/sharedMasteryLog.ts (LP-11b (3)): save.mastery → 共有学習ログの
 * 任意フィールド mastery への変換・書き込み。後方互換 (旧ログに影響しない・
 * mastery 無しのログも壊れず読める) が最重要の受け入れ条件なので重点的に見る。
 */
import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorageStub } from "./localStorageStub";
import { masterySnapshotForLearningLog, writeMasterySnapshot } from "../src/lib/sharedMasteryLog";
import { defaultSave, type SaveData } from "../src/lib/save";
import { loadLearning, normalizeLog, recordLearning } from "../src/lib/learning";

function withMastery(entries: Record<string, SaveData["mastery"][string]["state"]>): SaveData {
  const save = defaultSave();
  const mastery: SaveData["mastery"] = {};
  for (const [skillId, state] of Object.entries(entries)) {
    mastery[skillId] = { state, reviewDue: null, streak: 0, passedAt: null };
  }
  return { ...save, mastery };
}

beforeEach(() => {
  installLocalStorageStub();
});

describe("masterySnapshotForLearningLog", () => {
  it("skillId に kq_ 接頭辞を付けて state をそのまま写す", () => {
    const save = withMastery({ g1_add_nc: "mastered", g3_div: "can" });
    expect(masterySnapshotForLearningLog(save)).toEqual({
      kq_g1_add_nc: "mastered",
      kq_g3_div: "can",
    });
  });

  it("mastery が空なら空オブジェクト", () => {
    expect(masterySnapshotForLearningLog(defaultSave())).toEqual({});
  });
});

describe("writeMasterySnapshot / 後方互換性", () => {
  it("書いた mastery が loadLearning で読み戻せる (往復)", () => {
    const save = withMastery({ g1_add_nc: "mastered" });
    writeMasterySnapshot("p1", save);
    const log = loadLearning("p1");
    expect(log.mastery).toEqual({ kq_g1_add_nc: "mastered" });
    /* skills/daily はそのまま (今回は空) で壊れていない */
    expect(log.skills).toEqual({});
    expect(log.daily).toEqual({});
  });

  it("mastery フィールドの無い旧ログは normalizeLog を通しても壊れない (後方互換)", () => {
    const legacy = { version: 1, skills: { g1_add_carry: { app: "mathematics", c: 3, w: 1, ms: [], lastTs: 0 } }, daily: {} };
    const log = normalizeLog(legacy);
    expect(log.mastery).toBeUndefined();
    expect(log.skills.g1_add_carry).toMatchObject({ app: "mathematics", c: 3, w: 1 });
  });

  it("null/未設定の旧ログは正規化しても mastery キー自体を含まない", () => {
    expect(normalizeLog(null)).toEqual({ version: 1, skills: {}, daily: {} });
  });

  it("mastery を書いたあと他アプリ由来の recordLearning を呼んでも mastery は消えない", () => {
    const save = withMastery({ g1_add_nc: "mastered" });
    writeMasterySnapshot("p1", save);
    recordLearning("p1", "mathematics", "g1_add_carry", true, 1200);
    const log = loadLearning("p1");
    expect(log.mastery).toEqual({ kq_g1_add_nc: "mastered" });
    expect(log.skills.g1_add_carry).toMatchObject({ c: 1, w: 0, app: "mathematics" });
  });

  it("writeMasterySnapshot は既存の skills/daily を壊さない", () => {
    recordLearning("p1", "kazu-quest", "kq_g1_add_nc", true, 500);
    const save = withMastery({ g1_add_nc: "can" });
    writeMasterySnapshot("p1", save);
    const log = loadLearning("p1");
    expect(log.skills.kq_g1_add_nc).toMatchObject({ c: 1, w: 0 });
    expect(log.mastery).toEqual({ kq_g1_add_nc: "can" });
  });
});

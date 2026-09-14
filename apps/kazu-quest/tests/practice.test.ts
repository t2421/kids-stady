/* とっくん (KQ-11): 練習セッションの形と、出題依頼が時間無制限であること */

import { describe, expect, it } from "vitest";
import { getSpell, SPELLS } from "../src/content/spells";
import { generate, mulberry32 } from "../src/lib/curriculum";
import {
  cherryTop,
  PRACTICE_QUESTIONS,
  practiceSession,
  textHint,
} from "../src/lib/curriculum/practice";
import { defaultSave } from "../src/lib/save";
import { learnSpell } from "../src/lib/learnSpell";
import { mistakeEntryFromResult, recordMistake } from "../src/lib/mistakes";
import {
  questionRequest,
  questionRequestId,
  type QuestionSession,
} from "../src/lib/questionSession";

describe("practiceSession", () => {
  it("呪文の習得テストと同じ単元から 5 問、合否なしの practice セッションを作る", () => {
    const spell = getSpell("hikidama")!;
    const session = practiceSession(spell);
    expect(session).toEqual({
      key: "hikidama",
      questions: PRACTICE_QUESTIONS,
      context: "practice",
      skillIds: spell.learnTest.skillIds,
    });
    expect(session.questions).toBe(5);
    /* 元の spell 定義の配列を共有しない (不変) */
    expect(session.skillIds).not.toBe(spell.learnTest.skillIds);
  });

  it("全呪文で practice の出題依頼は timeLimitMs === null", () => {
    for (const spell of Object.values(SPELLS)) {
      const req = questionRequest("practice-", practiceSession(spell), 0);
      expect(req.timeLimitMs).toBeNull();
      expect(req.context).toBe("practice");
      expect(req.skillIds).toEqual(spell.learnTest.skillIds);
    }
  });
});

describe("questionRequest", () => {
  const session: QuestionSession = {
    key: "tashiria",
    questions: 10,
    context: "test",
    skillIds: ["g1_add_nc"],
  };

  it("requestId は prefix + key + index で、ループ側の照合 (startsWith) に合う", () => {
    expect(questionRequestId("spelltest-", session, 3)).toBe("spelltest-tashiria-3");
    const req = questionRequest("spelltest-", session, 3);
    expect(req.requestId.startsWith("spelltest-tashiria-")).toBe(true);
    expect(req.timeLimitMs).toBeNull();
    expect(req.context).toBe("test");
  });

  it("skillId 固定のセッション (drill) はそのまま渡す", () => {
    const req = questionRequest("drill-", {
      key: "g1_add_10",
      questions: 10,
      context: "drill",
      skillId: "g1_add_10",
    }, 0);
    expect(req.skillId).toBe("g1_add_10");
    expect(req.skillIds).toBeUndefined();
    expect(req.timeLimitMs).toBeNull();
  });
});

describe("hints", () => {
  it("くりあがり / くりさがりの問題は さくらんぼ図で、てっぺんは枝の和", () => {
    for (const skillId of ["g1_add_carry", "g1_sub_borrow"]) {
      for (let seed = 1; seed <= 30; seed++) {
        const p = generate(skillId, mulberry32(seed));
        expect(p.hint?.type).toBe("cherry");
        const top = cherryTop(p.hint!);
        /* たしざんは b を、ひきざんは a を分ける */
        expect(top).toBe(skillId === "g1_add_carry" ? p.b : p.a);
        expect(textHint(p)).toBeNull();
      }
    }
  });

  it("図解のない問題は explain の先頭を文章ヒントにする", () => {
    const p = generate("g1_sub_nc", mulberry32(7));
    expect(p.hint).toBeNull();
    expect(textHint(p)).toBe(p.explain[0]);
    expect(textHint({ hint: null, explain: [] })).toBeNull();
  });
});

describe("mistakeEntryFromResult", () => {
  it("テストの不正解を まちがいノート項目にして積める", () => {
    const problem = generate("g1_add_carry", mulberry32(3));
    const entry = mistakeEntryFromResult({ problem, chosen: "99" }, 1234);
    expect(entry).toEqual({
      ts: 1234,
      skillId: "g1_add_carry",
      text: problem.text,
      answer: problem.answer,
      chosen: "99",
      explain: problem.explain,
    });
    expect(entry.explain).not.toBe(problem.explain);
    /* 時間切れは "" */
    expect(mistakeEntryFromResult({ problem, chosen: null }, 1).chosen).toBe("");
    const save = recordMistake(defaultSave(), entry);
    expect(save.mistakes[0]).toEqual(entry);
  });
});

describe("learnSpell", () => {
  it("勇者だけが覚え、learned.<spellId> フラグが立つ (不変更新・重複なし)", () => {
    const before = defaultSave();
    const once = learnSpell(before, "hikidama");
    const twice = learnSpell(once, "hikidama");
    expect(before.party[0].learnedSpells).not.toContain("hikidama");
    expect(once.party[0].learnedSpells).toContain("hikidama");
    expect(once.flags["learned.hikidama"]).toBe(true);
    expect(twice.party[0].learnedSpells.filter((s) => s === "hikidama")).toHaveLength(1);
    expect(once).not.toBe(before);
  });
});

/*
 * ルビ記法 (｜漢字《かんじ》 / 漢字《かんじ》) のパーサと、
 * 全章の会話文・メッセージが整形式であることの全数検査。
 */

import { describe, expect, it } from "vitest";
import type { EventCommand, MapDef } from "../src/content/types";
import { CHAPTERS } from "../src/content/chapters";
import {
  parseRuby,
  sliceRuby,
  stripRuby,
  validateRuby,
  visibleLength,
} from "../src/lib/text/ruby";

describe("parseRuby", () => {
  it("plain text is a single segment without ruby", () => {
    expect(parseRuby("こんにちは")).toEqual([{ base: "こんにちは" }]);
    expect(parseRuby("")).toEqual([]);
  });

  it("explicit form ｜base《ruby》", () => {
    expect(parseRuby("｜漢字《かんじ》")).toEqual([{ base: "漢字", ruby: "かんじ" }]);
    expect(parseRuby("わしが ｜町《まち》おさじゃ")).toEqual([
      { base: "わしが " },
      { base: "町", ruby: "まち" },
      { base: "おさじゃ" },
    ]);
  });

  it("explicit form may cover non-kanji bases", () => {
    expect(parseRuby("｜ワケーラ《まち》へ")).toEqual([
      { base: "ワケーラ", ruby: "まち" },
      { base: "へ" },
    ]);
  });

  it("short form takes the preceding kanji run as base", () => {
    expect(parseRuby("この砂漠《さばく》を")).toEqual([
      { base: "この" },
      { base: "砂漠", ruby: "さばく" },
      { base: "を" },
    ]);
    expect(parseRuby("々を含む人々《ひとびと》")).toEqual([
      { base: "々を含む" },
      { base: "人々", ruby: "ひとびと" },
    ]);
  });

  it("mixed forms in one page", () => {
    expect(parseRuby("｜王《おう》さまは 城《しろ》に いる。")).toEqual([
      { base: "王", ruby: "おう" },
      { base: "さまは " },
      { base: "城", ruby: "しろ" },
      { base: "に いる。" },
    ]);
  });

  it("malformed markup falls back to the raw text (never throws)", () => {
    expect(parseRuby("｜漢字《かんじ")).toEqual([{ base: "｜漢字《かんじ" }]);
    expect(parseRuby("かな《かんじ》")).toEqual([{ base: "かな《かんじ》" }]);
  });
});

describe("validateRuby", () => {
  it("accepts plain and well-formed text", () => {
    expect(validateRuby("こんにちは")).toBeNull();
    expect(validateRuby("｜漢字《かんじ》 と 砂漠《さばく》")).toBeNull();
    expect(validateRuby("かぎかっこ 「すうしょう・参」 は ルビでは ない")).toBeNull();
  });

  it.each([
    ["｜漢字《かんじ", "《 に 対応する 》 が ない"],
    ["漢字《かんじ", "《 に 対応する 》 が ない"],
    ["かんじ》", "対応する 《 が ない 》"],
    ["｜漢字 かんじ", "｜ の あとに 《 が ない"],
    ["｜《かんじ》", "｜ と 《 の あいだが 空"],
    ["｜漢字《》", "《》 の なかが 空"],
    ["漢字《》", "《》 の なかが 空"],
    ["かな《かんじ》", "《 の まえに 漢字が ない"],
    ["｜漢字《か《ん》じ》", "《 の なかに 《 や ｜ が ある"],
    ["｜漢｜字《かんじ》", "｜ が 二重に ある"],
  ])("rejects %s", (text, expected) => {
    const error = validateRuby(text);
    expect(error).not.toBeNull();
    expect(error).toContain(expected);
  });
});

describe("stripRuby / visibleLength / sliceRuby", () => {
  it("strips markup down to the base text", () => {
    expect(stripRuby("わしが ｜町《まち》おさじゃ")).toBe("わしが 町おさじゃ");
    expect(stripRuby("砂漠《さばく》")).toBe("砂漠");
    expect(stripRuby("ふつうの 文")).toBe("ふつうの 文");
  });

  it("visibleLength counts base characters only", () => {
    expect(visibleLength("｜町《まち》おさ")).toBe(3);
    expect(visibleLength("")).toBe(0);
  });

  it("sliceRuby reveals base characters progressively; partial words lose their ruby", () => {
    const segs = parseRuby("あ｜漢字《かんじ》い");
    expect(sliceRuby(segs, 0)).toEqual([]);
    expect(sliceRuby(segs, 1)).toEqual([{ base: "あ" }]);
    expect(sliceRuby(segs, 2)).toEqual([{ base: "あ" }, { base: "漢" }]);
    expect(sliceRuby(segs, 3)).toEqual([{ base: "あ" }, { base: "漢字", ruby: "かんじ" }]);
    expect(sliceRuby(segs, 99)).toEqual(segs);
  });
});

/* ---------- 全章の会話文の全数検査 ---------- */

/* choice / quiz の分岐も含めて再帰的に平坦化する */
function flattenCommands(commands: readonly EventCommand[]): EventCommand[] {
  const out: EventCommand[] = [];
  const walk = (cmds: readonly EventCommand[]) => {
    for (const c of cmds) {
      out.push(c);
      if (c.type === "choice") {
        walk(c.yes);
        walk(c.no);
      } else if (c.type === "quiz") {
        walk(c.onCorrect);
        walk(c.onWrong);
      }
    }
  };
  walk(commands);
  return out;
}

/* マップ内の「会話ウィンドウに出る文字列」を出所ラベルつきで列挙する */
function collectDialogTexts(map: MapDef): Array<{ where: string; text: string }> {
  const out: Array<{ where: string; text: string }> = [];
  const pushCommands = (where: string, cmds: readonly EventCommand[]) => {
    for (const c of flattenCommands(cmds)) {
      if (c.type === "message") {
        c.pages.forEach((p, i) => out.push({ where: `${where} message[${i}]`, text: p }));
      } else if (c.type === "choice") {
        out.push({ where: `${where} choice.prompt`, text: c.prompt });
      }
    }
  };
  for (const npc of map.npcs) {
    npc.dialog.forEach((entry, d) => {
      entry.pages.forEach((p, i) =>
        out.push({ where: `${map.id}/${npc.id} dialog[${d}].pages[${i}]`, text: p }),
      );
      pushCommands(`${map.id}/${npc.id} dialog[${d}].then`, entry.then ?? []);
    });
  }
  for (const ev of map.events) pushCommands(`${map.id}/${ev.id}`, ev.commands);
  return out;
}

describe("content ruby markup", () => {
  const allTexts = CHAPTERS.flatMap((ch) => ch.maps.flatMap(collectDialogTexts));

  it("sweeps every chapter's dialog and message text", () => {
    expect(allTexts.length).toBeGreaterThan(0);
  });

  it("every dialog page / message / choice prompt is well-formed", () => {
    for (const { where, text } of allTexts) {
      expect(validateRuby(text), where).toBeNull();
    }
  });

  it("chapter 3's start town carries the trial ruby (checked by E2E)", () => {
    const ch3 = CHAPTERS.find((c) => c.id === 3);
    expect(ch3).toBeDefined();
    const town = ch3!.maps.find((m) => m.id === ch3!.startMap);
    expect(town).toBeDefined();
    const withRuby = collectDialogTexts(town!).filter((t) =>
      parseRuby(t.text).some((s) => s.ruby !== undefined),
    );
    expect(withRuby.map((t) => t.where)).toEqual(["ch3-wakeera/wakeera-chief dialog[2].pages[0]"]);
    expect(parseRuby(withRuby[0].text)).toContainEqual({ base: "町", ruby: "まち" });
  });
});

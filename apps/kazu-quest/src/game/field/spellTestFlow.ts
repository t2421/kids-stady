/*
 * まなびやの習得テストの流れ (設計 A4 / KQ-11)。openSpellTest effect から呼ばれる。
 *
 *   「とっくんしてから テストする?」 → はい: とっくん (5問) → テスト
 *                                    → いいえ: すぐ テスト
 *   テスト合格 → 習得。不合格 → 「とっくんから やりなおす?」 → はい: とっくん → テスト …
 *
 * React 側との往復は EventBus のみ:
 *   "open-spell-practice" {spellId} → "spell-practice-finished" {spellId}
 *   "open-spell-test"     {spellId} → "spell-test-finished"     {spellId, passed, correct, total}
 * 不合格時の不正解は useQuestionLoop が まちがいノートに積む。
 *
 * LP-09: その呪文の学習テスト対象単元 (learnTest.skillIds[0]) に LessonDef が
 * あるなら、上のとっくん/テストではなく handleOpenLesson (lessonFlow.ts) の
 * レッスン (story→concept→れい→穴埋め→れんしゅう→テスト) へ丸ごと委譲する。
 * まだレッスンが無い ~45 の呪文は、このファイルの従来どおりの流れのまま
 * (章1 golden path E2E が無変更で緑であることの前提)。
 */

import { EventBus } from "../EventBus";
import { autosave, getSave, updateSave } from "../session";
import { getSpell } from "../../content/spells";
import { hasLesson } from "../../content/lessons/index";
import type { SpellPracticeResult } from "../../lib/curriculum/practice";
import { learnSpell } from "../../lib/learnSpell";
import type { LessonFinishedPayload } from "./lessonFlow";
import type { UiScene } from "../scenes/UiScene";

export interface SpellTestResult {
  spellId: string;
  passed: boolean;
  correct: number;
  total: number;
}

export const PRACTICE_BEFORE_TEST_PROMPT = "とっくんしてから テストする?";
export const PRACTICE_RETRY_PROMPT = "とっくんから やりなおす?";

function passedPages(result: SpellTestResult): string[] {
  const spellName = getSpell(result.spellId)?.name ?? result.spellId;
  return [
    `${result.total}もん中 ${result.correct}もん せいかい!`,
    `ごうかく! ${spellName}を おぼえた!`,
  ];
}

function failedPages(result: SpellTestResult): string[] {
  return [
    `${result.total}もん中 ${result.correct}もん せいかい…`,
    "あと すこし! まちがえた もんだいは ノートに のこしたよ。",
  ];
}

/* テストを1回受け、結果を onResult に渡す (spellId の一致だけ受ける) */
function runSpellTest(spellId: string, onResult: (r: SpellTestResult) => void): void {
  const onFinished = (result: SpellTestResult) => {
    if (result.spellId !== spellId) return;
    EventBus.off("spell-test-finished", onFinished);
    onResult(result);
  };
  EventBus.on("spell-test-finished", onFinished);
  EventBus.emit("open-spell-test", { spellId });
}

/* とっくん (5問・合否なし) を受け、終わったら onDone */
function runSpellPractice(spellId: string, onDone: () => void): void {
  const onFinished = (result: SpellPracticeResult) => {
    if (result.spellId !== spellId) return;
    EventBus.off("spell-practice-finished", onFinished);
    onDone();
  };
  EventBus.on("spell-practice-finished", onFinished);
  EventBus.emit("open-spell-practice", { spellId });
}

/*
 * その呪文の学習テスト対象単元にレッスンがあれば、とっくん/テストの代わりに
 * handleOpenLesson と同じ契約 ("open-lesson" → "lesson-finished") でレッスンへ
 * 丸ごと委譲する。lesson-finished {outcome:"passed"} を合格として扱い、既存の
 * learnSpell/autosave をそのまま使う。レッスン側は不合格では lesson-finished を
 * 出さない (合格するまで続く) ので、"passed" 以外がここに来るのは想定外
 * (aborted 等) — 安全側で習得はせず advance だけする
 */
function delegateToLesson(
  ui: UiScene,
  spellId: string,
  lessonSkillId: string,
  advance: () => void,
): void {
  const onFinished = (result: LessonFinishedPayload) => {
    if (result.skillId !== lessonSkillId) return;
    EventBus.off("lesson-finished", onFinished);
    if (result.outcome !== "passed") {
      advance();
      return;
    }
    updateSave((s) => learnSpell(s, spellId));
    autosave();
    ui.showMessage(
      passedPages({ spellId, passed: true, correct: result.correct, total: result.total }),
      advance,
    );
  };
  EventBus.on("lesson-finished", onFinished);
  EventBus.emit("open-lesson", { skillId: lessonSkillId, entry: "story" });
}

/* まなびや: とっくんの有無を聞いてからテスト。合格なら習得、不合格なら やりなおしを提案 */
export function handleSpellTest(
  ui: UiScene,
  spellId: string,
  advance: () => void,
): void {
  const alreadyLearned = getSave().party.some((m) =>
    m.learnedSpells.includes(spellId),
  );
  if (alreadyLearned) {
    ui.showMessage(["その じゅもんは もう おぼえているよ!"], advance);
    return;
  }

  const spell = getSpell(spellId);
  const lessonSkillId = spell?.learnTest.skillIds[0];
  if (lessonSkillId && hasLesson(lessonSkillId)) {
    delegateToLesson(ui, spellId, lessonSkillId, advance);
    return;
  }

  const onTestResult = (result: SpellTestResult) => {
    if (result.passed) {
      updateSave((s) => learnSpell(s, result.spellId));
      autosave();
      ui.showMessage(passedPages(result), advance);
      return;
    }
    ui.showMessage(failedPages(result), () =>
      askPracticeThenTest(PRACTICE_RETRY_PROMPT),
    );
  };

  const startTest = () => runSpellTest(spellId, onTestResult);

  const askPracticeThenTest = (prompt: string) => {
    ui.showChoice(prompt, (yes) => {
      if (yes) {
        runSpellPractice(spellId, startTest);
        return;
      }
      if (prompt === PRACTICE_RETRY_PROMPT) {
        ui.showMessage(["また ちょうせん してね。"], advance);
        return;
      }
      startTest();
    });
  };

  askPracticeThenTest(PRACTICE_BEFORE_TEST_PROMPT);
}

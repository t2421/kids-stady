/*
 * まちがえたときの「責めない一言」(LP-03 §1.1)。純関数。
 *
 * 各レッスンは 単元ごとに 書いた mistakes[].feedback を持っている
 * (「10の たばを くずすのを わすれていないかな」など) が、以前は
 * どこにも表示されず、全単元で 共通の一言だけが出ていた。
 * ここで「その単元のレッスンの一言 → なければ 共通の一言」の順に引く。
 */

import type { LessonDef } from "../content/lessons/types";
import { getLesson } from "../content/lessons";
import { diagnose } from "./curriculum/diagnose";
import type { MistakePattern, Problem } from "./curriculum/types";

/* 誤答パターンごとの 共通の一言 (13種すべて) */
const MISTAKE_FEEDBACK: Record<MistakePattern, string> = {
  offByOne: "おしい! 1つ ちがいだよ",
  forgotCarry: "くりあがりを わすれていないかな?",
  forgotBorrow: "くりさがりを わすれていないかな?",
  echoOperand: "もんだいの すうじを そのまま えらんじゃったかな?",
  neighborRow: "となりの だんと まちがえたかも",
  placeShift: "くらいが 1つ ずれているよ",
  addedDenominators: "ぶんぼは たしちゃ だめだよ",
  noCommonDenominator: "ぶんぼを そろえてから けいさんしよう",
  swappedBase: "どちらが もとの かずか たしかめよう",
  reversedDivision: "わる かずと わられる かずが さかさまかも",
  doubleCounted: "おなじものを 2かい かぞえていないかな?",
  unitConfusion: "たんいに ちゅうい してみよう",
  other: "もういちど かんがえてみよう",
};

export function genericMistakeFeedback(pattern: MistakePattern): string {
  return MISTAKE_FEEDBACK[pattern] ?? MISTAKE_FEEDBACK.other;
}

/*
 * えらんだ こたえ (chosen) から 一言を決める。正解・時間切れ (null) は null。
 * lesson を省くと problem.skillId の レッスンを さがす
 */
export function mistakeFeedbackFor(
  problem: Problem,
  chosen: string | null,
  lesson: Pick<LessonDef, "mistakes"> | undefined = getLesson(problem.skillId),
): string | null {
  if (chosen === null) return null;
  const pattern = diagnose(problem, chosen);
  if (pattern === null) return null;
  const tailored = lesson?.mistakes.find((m) => m.pattern === pattern)?.feedback;
  return tailored ?? genericMistakeFeedback(pattern);
}

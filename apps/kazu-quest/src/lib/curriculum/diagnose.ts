/*
 * 選んだ答えから誤答パターンを推定する (LP-03)。
 * 3択で choiceTags があれば それを使い、無ければ数値差分のヒューリスティックで
 * 推定する。テンキー入力 (小3以降) は choiceTags を持たないため、こちらが主に使われる。
 * どんな入力が来ても例外を投げない — 判定できなければ "other"。
 */

import type { MistakePattern, Problem } from "./types";

export function diagnose(problem: Problem, chosen: string): MistakePattern | null {
  try {
    if (chosen === problem.answer) return null;

    if (problem.choiceTags) {
      const idx = problem.choices.indexOf(chosen);
      if (idx >= 0 && idx < problem.choiceTags.length) {
        return problem.choiceTags[idx];
      }
    }

    return diagnoseByHeuristic(problem, chosen);
  } catch {
    /* 何が来ても落ちない */
    return "other";
  }
}

function diagnoseByHeuristic(problem: Problem, chosen: string): MistakePattern {
  /* 数値どうしの差分 (整数・小数どちらも Number() で読める) */
  const chosenNum = Number(chosen);
  const answerNum = Number(problem.answer);
  if (Number.isFinite(chosenNum) && Number.isFinite(answerNum)) {
    const diff = chosenNum - answerNum;
    if (diff === 1 || diff === -1) return "offByOne";
    if (diff === 10) return "forgotCarry";
    if (diff === -10) return "forgotBorrow";
  }

  /* 分数どうし: えらんだ分子が もとの2つの分子の和 (= 分母を たしてしまう誤り) */
  const chosenFraction = /^(\d+)\/(\d+)$/.exec(chosen);
  if (chosenFraction && problem.a !== null && problem.b !== null) {
    const numerator = Number(chosenFraction[1]);
    if (numerator === problem.a + problem.b) return "addedDenominators";
  }

  return "other";
}

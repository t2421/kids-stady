/*
 * お店の おつりチャレンジ (KQ-33)。
 * 買い物のあと「<price>Gの しなものを <paid>Gで はらった。おつりは いくら?」を任意で出し、
 * 正解なら代金の 10% を返金する。純関数 — React / Phaser に依存しない。
 */

import { makeChoices } from "../curriculum/choices";
import type { Problem, Rng } from "../curriculum/types";

/* 出題パネルに渡すときの skillId (カリキュラムの単元ではないのでテレメトリは記録しない) */
export const SHOP_CHANGE_SKILL_ID = "shop_change";

/* 返金率 (10%)。端数は切り捨てるが、正解したのに 0G では寂しいので最低 1G */
const CASHBACK_RATE = 0.1;
const CASHBACK_MIN = 1;

export interface ChangeChallenge {
  /* はらった金額 (代金より上のキリのいい数。もちがねを超えない) */
  paid: number;
  /* おつり = paid − price */
  change: number;
  text: string;
  answer: string;
  choices: [string, string, string];
}

export function cashback(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  return Math.max(CASHBACK_MIN, Math.floor(price * CASHBACK_RATE));
}

/* price の桁に合わせた「お札・硬貨」の単位: 8 → 10, 120 → 100, 850 → 100 */
function magnitudeUnit(price: number): number {
  const digits = String(Math.max(1, Math.floor(price))).length;
  return Math.max(10, 10 ** (digits - 1));
}

/* price より大きい最小の unit の倍数 (ちょうど price のときも 1 段上げる → おつり > 0) */
function nextMultipleAbove(price: number, unit: number): number {
  return (Math.floor(price / unit) + 1) * unit;
}

/*
 * はらう金額の候補。桁の単位 u とその 5倍・10倍 (10/50/100 のような感覚) の
 * 次の倍数のうち、もちがねに収まるものを重複なしで返す。
 * 例: price 8 → [10, 50, 100] / price 120 → [200, 500, 1000]
 */
export function paidCandidates(price: number, gold: number): number[] {
  const unit = magnitudeUnit(price);
  const candidates = [unit, unit * 5, unit * 10].map((u) =>
    nextMultipleAbove(price, u),
  );
  return candidates.filter(
    (paid, i) => paid <= gold && candidates.indexOf(paid) === i,
  );
}

/*
 * 買い物 1 回分のチャレンジを作る。
 * gold は「はらう前の もちがね」。キリのいい額を出せない (もちがねが少ない) ときは
 * もちがね全額で払ったことにする。もちがね == 代金なら おつり 0 になる —
 * 呼び出し側は change === 0 ならチャレンジを出さない。
 */
export function changeChallenge(
  price: number,
  gold: number,
  rng: Rng,
): ChangeChallenge {
  const candidates = paidCandidates(price, gold);
  const paid =
    candidates.length > 0
      ? candidates[Math.floor(rng() * candidates.length)]
      : Math.max(price, gold);
  const change = paid - price;
  const choices = makeChoices(rng, change, "sub", [paid, price]);
  return {
    paid,
    change,
    /* ねだんも 問題文に書く (2つ前の画面の ねだんを おぼえていないと とけなかった) */
    text: `${price}Gの しなものを ${paid}Gで はらった。おつりは いくら?`,
    answer: String(change),
    choices,
  };
}

/* 出題パネル (MathPromptRequest.problem) に渡す形へ */
export function changeProblem(challenge: ChangeChallenge): Problem {
  return {
    skillId: SHOP_CHANGE_SKILL_ID,
    text: challenge.text,
    a: challenge.paid,
    b: challenge.paid - challenge.change,
    op: "-",
    answer: challenge.answer,
    choices: challenge.choices,
    hints: [
      `はらった 金がくから ねだんを ひくよ`,
      `${challenge.paid} から ねだんを ひいてみよう`,
      `${challenge.paid} − ${challenge.paid - challenge.change} を けいさんすると…`,
    ],
    hint: null,
    explain: [
      `はらった ${challenge.paid}G から ねだんを ひく。`,
      `${challenge.paid} − ${challenge.paid - challenge.change} = ${challenge.change}`,
    ],
  };
}

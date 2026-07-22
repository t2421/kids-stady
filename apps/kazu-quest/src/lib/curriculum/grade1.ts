/*
 * 小1のスキルと問題ジェネレータ。
 * skillId 体系はマスマティクス設計と共通 (g1_count / g1_compare / g1_add_nc /
 * g1_add_carry / g1_sub_nc / g1_sub_borrow)。
 */

import type { CountIcon, Problem, Rng } from "./types";
import { randInt } from "./types";
import { makeChoices } from "./choices";

const COUNT_ICONS: { icon: CountIcon; label: string }[] = [
  { icon: "apple", label: "りんご" },
  { icon: "acorn", label: "どんぐり" },
  { icon: "star", label: "ほし" },
  { icon: "fish", label: "さかな" },
  { icon: "flower", label: "はな" },
  { icon: "candy", label: "あめ" },
];

function genCount(rng: Rng): Problem {
  const n = randInt(rng, 3, 9);
  const { icon, label } = COUNT_ICONS[randInt(rng, 0, COUNT_ICONS.length - 1)];
  return {
    skillId: "g1_count",
    text: `${label}は いくつ あるかな?`,
    a: null,
    b: null,
    op: null,
    answer: String(n),
    choices: makeChoices(rng, n, "count"),
    hint: null,
    explain: [
      `ひとつずつ ゆびで かぞえてみよう`,
      `${label}は ぜんぶで ${n}こ だね`,
    ],
    visual: { icon, count: n },
  };
}

function genCompare(rng: Rng): Problem {
  const a = randInt(rng, 1, 20);
  let b = randInt(rng, 1, 20);
  while (b === a) b = randInt(rng, 1, 20);
  const answer = Math.max(a, b);
  const wrong = Math.min(a, b);
  /* 2値比較なので3択目はダミーの近い数 */
  let dummy = answer + randInt(rng, 1, 3);
  if (dummy === wrong) dummy += 1;
  const order = rng() < 0.5;
  const choices: [string, string, string] = order
    ? [String(answer), String(wrong), String(dummy)]
    : [String(wrong), String(answer), String(dummy)];
  return {
    skillId: "g1_compare",
    text: `${a} と ${b}\nおおきいのは どっち?`,
    a,
    b,
    op: null,
    answer: String(answer),
    choices,
    hint: null,
    explain: [
      `かずのせん で くらべてみよう`,
      `${answer} のほうが ${wrong} より おおきいね`,
    ],
  };
}

function genAddNoCarry(rng: Rng): Problem {
  let a = 0;
  let b = 0;
  do {
    a = randInt(rng, 1, 8);
    b = randInt(rng, 1, 8);
  } while (a + b > 9);
  const answer = a + b;
  return {
    skillId: "g1_add_nc",
    text: `${a} + ${b} = ?`,
    a,
    b,
    op: "+",
    answer: String(answer),
    choices: makeChoices(rng, answer, "add", [a, b]),
    hint: null,
    explain: [`${a} に ${b} を たすと ${answer}`],
  };
}

function genAddCarry(rng: Rng): Problem {
  let a = 0;
  let b = 0;
  do {
    a = randInt(rng, 2, 9);
    b = randInt(rng, 2, 9);
  } while (a + b < 11);
  const answer = a + b;
  const toTen = 10 - a; /* さくらんぼ: b を「10のなかま」と「のこり」に分ける */
  return {
    skillId: "g1_add_carry",
    text: `${a} + ${b} = ?`,
    a,
    b,
    op: "+",
    answer: String(answer),
    choices: makeChoices(rng, answer, "add", [a, b]),
    hint: { type: "cherry", split: { first: toTen, second: b - toTen } },
    explain: [
      `${b} を ${toTen} と ${b - toTen} に わけよう`,
      `${a} + ${toTen} = 10`,
      `10 + ${b - toTen} = ${answer}`,
    ],
  };
}

function genSubNoBorrow(rng: Rng): Problem {
  const a = randInt(rng, 3, 9);
  const b = randInt(rng, 1, a - 1);
  const answer = a - b;
  return {
    skillId: "g1_sub_nc",
    text: `${a} - ${b} = ?`,
    a,
    b,
    op: "-",
    answer: String(answer),
    choices: makeChoices(rng, answer, "sub", [a, b]),
    hint: null,
    explain: [`${a} から ${b} を ひくと ${answer}`],
  };
}

function genSubBorrow(rng: Rng): Problem {
  /* くりさがり必須: 11〜18 から 1桁を引き、b > a の一の位 */
  let a = 0;
  let b = 0;
  do {
    a = randInt(rng, 11, 18);
    b = randInt(rng, 2, 9);
  } while (b <= a % 10 || a - b < 1);
  const answer = a - b;
  const ones = a % 10; /* さくらんぼ: a を 10 と ones に分けて 10 から引く */
  return {
    skillId: "g1_sub_borrow",
    text: `${a} - ${b} = ?`,
    a,
    b,
    op: "-",
    answer: String(answer),
    choices: makeChoices(rng, answer, "sub", [a, b]),
    hint: { type: "cherry", split: { first: 10, second: ones } },
    explain: [
      `${a} を 10 と ${ones} に わけよう`,
      `10 - ${b} = ${10 - b}`,
      `${10 - b} + ${ones} = ${answer}`,
    ],
  };
}

export const GRADE1_GENERATORS: Record<string, (rng: Rng) => Problem> = {
  g1_count: genCount,
  g1_compare: genCompare,
  g1_add_nc: genAddNoCarry,
  g1_add_carry: genAddCarry,
  g1_sub_nc: genSubNoBorrow,
  g1_sub_borrow: genSubBorrow,
};

export const GRADE1_LABELS: Record<string, string> = {
  g1_count: "かぞえる",
  g1_compare: "どっちが おおきい",
  g1_add_nc: "たしざん (〜10)",
  g1_add_carry: "くりあがりの たしざん",
  g1_sub_nc: "ひきざん (〜10)",
  g1_sub_borrow: "くりさがりの ひきざん",
};

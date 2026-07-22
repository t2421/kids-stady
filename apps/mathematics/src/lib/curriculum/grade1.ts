/*
 * 1年生の問題生成器。
 * ねらい: くりあがり・くりさがりを「さくらんぼ計算」で頭の中でできるようになること。
 */

import type { Problem, SkillDef } from "./types";
import { shuffle, uniqueChoices } from "./util";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const COUNT_EMOJIS = ["🍎", "🍓", "⭐", "🐟", "🌸", "🚗"];

/* かぞえる: 絵文字を数える (3〜9) */
function genCount(): Problem {
  const n = randInt(3, 9);
  const emoji = COUNT_EMOJIS[randInt(0, COUNT_EMOJIS.length - 1)];
  const row = emoji.repeat(n);
  return {
    skillId: "g1_count",
    text: `${row}\nなんこ ある?`,
    a: null,
    b: null,
    op: null,
    answer: String(n),
    choices: uniqueChoices(n, [n - 1, n + 1, n - 2, n + 2], 0, 10),
    hint: null,
    explain: [`ひとつずつ かぞえよう: ${emoji}が ${n}こ`, `こたえは ${n}`],
  };
}

/* くらべる: どっちがおおきい? (「おなじ」は常にひっかけの誤答) */
function genCompare(): Problem {
  const a = randInt(1, 20);
  let b = randInt(1, 20);
  if (b === a) b = a === 20 ? 19 : a + 1;
  return {
    skillId: "g1_compare",
    text: `${a} と ${b}\nどっちが おおきい?`,
    a: null,
    b: null,
    op: null,
    answer: String(Math.max(a, b)),
    /* くらべる問題は3択の中身が固定 (a / b / おなじ)。シャッフルしない */
    choices: [String(a), String(b), "おなじ"],
    hint: null,
    explain: [`${Math.max(a, b)} のほうが ${Math.min(a, b)} より おおきい`],
  };
}

/* たしざん (くりあがりなし): 和が10以下 */
function genAddNoCarry(): Problem {
  const a = randInt(1, 8);
  const b = randInt(1, 9 - a);
  const sum = a + b;
  return {
    skillId: "g1_add_nc",
    text: `${a} + ${b} = ?`,
    a,
    b,
    op: "+",
    answer: String(sum),
    choices: uniqueChoices(sum, [sum - 1, sum + 1, sum + 2, sum - 2], 0, 10),
    hint: null,
    explain: [`${a} + ${b} = ${sum}`, "10までの たしざんは ぱっと いえると つよい!"],
  };
}

/* たしざん (くりあがり): 1けた同士で和が11〜18 → さくらんぼで10をつくる */
function genAddCarry(): Problem {
  const a = randInt(2, 9);
  const b = randInt(11 - a > 2 ? 11 - a : 2, 9);
  const sum = a + b;
  const first = 10 - a; // b から a を10にする分をもらう
  const second = b - first;
  return {
    skillId: "g1_add_carry",
    text: `${a} + ${b} = ?`,
    a,
    b,
    op: "+",
    answer: String(sum),
    choices: uniqueChoices(sum, [sum - 1, sum + 1, sum - 10, sum + 10], 0, 20),
    hint: { type: "cherry", split: { first, second } },
    explain: [
      `${b} を ${first} と ${second} に わける (さくらんぼ)`,
      `${a} + ${first} = 10`,
      `10 + ${second} = ${sum}`,
    ],
  };
}

/* ひきざん (くりさがりなし): 10以下から引く */
function genSubNoCarry(): Problem {
  const a = randInt(3, 10);
  const b = randInt(1, a - 1);
  const diff = a - b;
  return {
    skillId: "g1_sub_nc",
    text: `${a} - ${b} = ?`,
    a,
    b,
    op: "-",
    answer: String(diff),
    choices: uniqueChoices(diff, [diff - 1, diff + 1, diff + 2, diff - 2], 0, 10),
    hint: null,
    explain: [`${a} - ${b} = ${diff}`, "10までの ひきざんも ぱっと いえるように!"],
  };
}

/* ひきざん (くりさがり): 11〜18 から1けたを引き、くりさがりが必要 */
function genSubBorrow(): Problem {
  const a = randInt(11, 18);
  const ones = a % 10;
  const b = randInt(ones + 1, 9);
  const diff = a - b;
  const first = ones; // b を「aの1のくらい」と「のこり」に分けて 10 をつくる
  const second = b - first;
  return {
    skillId: "g1_sub_borrow",
    text: `${a} - ${b} = ?`,
    a,
    b,
    op: "-",
    answer: String(diff),
    choices: uniqueChoices(diff, [diff - 1, diff + 1, diff + 10, diff - 10], 0, 20),
    hint: { type: "cherry", split: { first, second } },
    explain: [
      `${b} を ${first} と ${second} に わける (さくらんぼ)`,
      `${a} - ${first} = 10`,
      `10 - ${second} = ${diff}`,
    ],
  };
}

/* 10といくつ: 「10と 4で いくつ?」/「14は 10と いくつ?」 */
function genTenPack(): Problem {
  const n = randInt(1, 9);
  const forward = Math.random() < 0.5;
  const answer = forward ? 10 + n : n;
  return {
    skillId: "g1_ten_pack",
    text: forward ? `10と ${n}で いくつ?` : `1${n}は 10と いくつ?`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, [answer - 1, answer + 1, forward ? n : 10 + n], 0, 20),
    hint: null,
    explain: forward
      ? [`10と ${n}で ${10 + n}`, "10のまとまりに たすだけ!"]
      : [`1${n}は 10と ${n}`, "10のまとまりを とりだそう"],
  };
}

/* 3つの数の計算: 途中の結果も 0〜10 に収まる組合せだけ出す */
function genThree(): Problem {
  for (;;) {
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    const c = randInt(1, 9);
    const op1 = Math.random() < 0.5 ? "+" : "-";
    const op2 = Math.random() < 0.5 ? "+" : "-";
    const mid = op1 === "+" ? a + b : a - b;
    if (mid < 0 || mid > 10) continue;
    const result = op2 === "+" ? mid + c : mid - c;
    if (result < 0 || result > 10) continue;
    return {
      skillId: "g1_three",
      text: `${a} ${op1} ${b} ${op2} ${c} = ?`,
      a: null,
      b: null,
      op: null,
      answer: String(result),
      choices: uniqueChoices(result, [result - 1, result + 1, result + 2, result - 2], 0, 10),
      hint: null,
      explain: [`まえから じゅんに: ${a} ${op1} ${b} = ${mid}`, `${mid} ${op2} ${c} = ${result}`],
    };
  }
}

/* かずのならび: 20までの連続3数の穴うめ */
function genSeq(): Problem {
  const start = randInt(1, 18);
  const holeIndex = randInt(0, 2);
  const nums: (number | null)[] = [start, start + 1, start + 2];
  const answer = nums[holeIndex] as number;
  nums[holeIndex] = null;
  const shown = nums.map((n) => (n === null ? "□" : String(n))).join("  ");
  return {
    skillId: "g1_seq",
    text: `${shown}\n□に はいる かずは?`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, [answer - 1, answer + 1, answer - 2, answer + 2], 0, 20),
    hint: null,
    explain: [`かずは 1ずつ ふえていくよ`, `${start} → ${start + 1} → ${start + 2}`],
  };
}

export const GRADE1_SKILLS: SkillDef[] = [
  { id: "g1_count", grade: 1, label: "かぞえる", generate: genCount },
  { id: "g1_compare", grade: 1, label: "くらべる", generate: genCompare },
  { id: "g1_add_nc", grade: 1, label: "たしざん", generate: genAddNoCarry },
  { id: "g1_add_carry", grade: 1, label: "くりあがり", generate: genAddCarry },
  { id: "g1_sub_nc", grade: 1, label: "ひきざん", generate: genSubNoCarry },
  { id: "g1_sub_borrow", grade: 1, label: "くりさがり", generate: genSubBorrow },
  { id: "g1_ten_pack", grade: 1, label: "10といくつ", generate: genTenPack },
  { id: "g1_three", grade: 1, label: "3つのかず", generate: genThree },
  { id: "g1_seq", grade: 1, label: "かずのならび", generate: genSeq },
];

export { shuffle };

/*
 * 小1のスキルと問題ジェネレータ。
 * skillId 体系はマスマティクス設計と共通 (g1_count / g1_compare / g1_add_nc /
 * g1_add_carry / g1_sub_nc / g1_sub_borrow)。
 *
 * 出題の段階 (LP-02, docs/kazu-quest-levels.md): 各ジェネレータは
 * `(rng, level?)` を取り、level 省略時は 2 (= 従来どおりの出題) を使う。
 * level 2 の分岐は既存コードと完全に同じ値域・同じ乱数消費順にしてある
 * (シード固定のテストが壊れないため)。
 *
 * 段階ヒント・誤答診断 (LP-03): 小1は全単元 手書きの3段ヒント。
 * 3択が makeChoices (数値) 由来の単元は makeChoicesTagged で誤答パターンも付ける。
 */

import type { CountIcon, MistakePattern, Problem, Rng } from "./types";
import { randInt, shuffle } from "./types";
import { makeChoicesTagged } from "./choices";

type Level = 1 | 2 | 3;

const COUNT_ICONS: { icon: CountIcon; label: string }[] = [
  { icon: "apple", label: "りんご" },
  { icon: "acorn", label: "どんぐり" },
  { icon: "star", label: "ほし" },
  { icon: "fish", label: "さかな" },
  { icon: "flower", label: "はな" },
  { icon: "candy", label: "あめ" },
];

function genCount(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [lo, hi] = lv === 1 ? [3, 5] : lv === 3 ? [6, 15] : [3, 9];
  const n = randInt(rng, lo, hi);
  const { icon, label } = COUNT_ICONS[randInt(rng, 0, COUNT_ICONS.length - 1)];
  const { choices, tags } = makeChoicesTagged(rng, n, "count");
  return {
    skillId: "g1_count",
    text: `${label}は いくつ あるかな?`,
    a: null,
    b: null,
    op: null,
    answer: String(n),
    choices,
    choiceTags: tags,
    hint: null,
    explain: [
      `ひとつずつ ゆびで かぞえてみよう`,
      `${label}は ぜんぶで ${n}こ だね`,
    ],
    hints: [
      `ひとつずつ ゆびで さしながら かぞえてみよう`,
      `いま かぞえた かずを おぼえておこう`,
      `さいごまで かぞえると ぜんぶで ${n}こ に なるはず`,
    ],
    visual: { icon, count: n },
  };
}

/*
 * かずの大小くらべ。3つの かずから いちばん おおきいのを えらぶ。
 * 以前は「2つの かず、おおきいのは どっち?」に 問題に無い 3つめの かず
 * (こたえ+1〜3) を まぜていた — 「どっち?」なのに 3択で、しかも その数は
 * いつも いちばん大きいので「いちばん おおきい数を えらぶ」子が まちがいに
 * なっていた。こたえの位置も 3ばんめには 一度も来なかった
 */
function genCompare(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [lo, hi] = lv === 1 ? [1, 10] : lv === 3 ? [1, 50] : [1, 20];
  const a = randInt(rng, lo, hi);
  let b = randInt(rng, lo, hi);
  while (b === a) b = randInt(rng, lo, hi);
  let c = randInt(rng, lo, hi);
  while (c === a || c === b) c = randInt(rng, lo, hi);
  const answer = Math.max(a, b, c);
  const order = shuffle(rng, [a, b, c]);
  const choices = order.map(String) as [string, string, string];
  /* こたえ以外は「問題の べつの かずを えらんだ」まちがい */
  const choiceTags = order.map((n) => (n === answer ? "other" : "echoOperand")) as [
    MistakePattern,
    MistakePattern,
    MistakePattern,
  ];
  return {
    skillId: "g1_compare",
    text: `${a} と ${b} と ${c}\nいちばん おおきいのは どれ?`,
    a,
    b,
    op: null,
    answer: String(answer),
    choices,
    choiceTags,
    hint: null,
    explain: [
      `かずのせん で くらべてみよう`,
      `いちばん うしろに あるのが いちばん おおきい`,
      `${answer} が いちばん おおきいね`,
    ],
    hints: [
      `かずの せんを あたまに うかべて くらべてみよう`,
      `${a} と ${b} と ${c}、かずのせんで いちばん うしろに あるのは どれかな`,
      `${a} と ${b} と ${c} を ならべると…`,
    ],
    /* 3つの かずを かずのせんに おく (a/b だけでは 3つめが 描けない) */
    figure: { kind: "numberLine", from: 0, to: answer, marks: [a, b, c] },
  };
}

function genAddNoCarry(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  /* 「くり上がりなし」は 一けた+一けた・和≤9 が上限なので、Lv3 は和の上限は
   * 広げられない。代わりに たされる数・たす数 の最小値を引き上げ、9に近い
   * 和 (むずかしい組み合わせ) だけを出すことで むずかしくする */
  const [lo, hi, cap] =
    lv === 1 ? [1, 4, 5] : lv === 3 ? [3, 8, 9] : [1, 8, 9];
  let a = 0;
  let b = 0;
  do {
    a = randInt(rng, lo, hi);
    b = randInt(rng, lo, hi);
  } while (a + b > cap);
  const answer = a + b;
  const { choices, tags } = makeChoicesTagged(rng, answer, "add", [a, b]);
  return {
    skillId: "g1_add_nc",
    text: `${a} + ${b} = ?`,
    a,
    b,
    op: "+",
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: null,
    explain: [`${a} に ${b} を たすと ${answer}`],
    hints: [
      `ゆびや ○を つかって ひとつずつ たしてみよう`,
      `${a} に ${b} を たすと いくつに なるかな`,
      `${a} + ${b} を けいさんすると…`,
    ],
  };
}

function genAddCarry(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  let a = 0;
  let b = 0;
  let tensPart = 0;
  if (lv === 1) {
    /* Lv1: 9 + x のかたち だけ */
    a = 9;
    b = randInt(rng, 2, 6);
  } else if (lv === 3) {
    /* Lv3: 十の位を足した 2桁+1桁 のくり上がり (一の位の考え方は同じ) */
    tensPart = randInt(rng, 1, 8) * 10;
    do {
      a = randInt(rng, 2, 9);
      b = randInt(rng, 2, 9);
    } while (a + b < 11);
  } else {
    do {
      a = randInt(rng, 2, 9);
      b = randInt(rng, 2, 9);
    } while (a + b < 11);
  }
  const answer = tensPart + a + b;
  const toTen = 10 - a; /* さくらんぼ: b を「10のなかま」と「のこり」に分ける */
  const displayA = tensPart + a;
  const { choices, tags } = makeChoicesTagged(rng, answer, "add", [displayA, b]);
  return {
    skillId: "g1_add_carry",
    text: `${displayA} + ${b} = ?`,
    a: displayA,
    b,
    op: "+",
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: { type: "cherry", split: { first: toTen, second: b - toTen } },
    explain:
      tensPart > 0
        ? [
            /* 47 + 5: 5 を 3 と 2 に わけて、47 を ちょうど 50 に する */
            `${b} を ${toTen} と ${b - toTen} に わけよう`,
            `${displayA} + ${toTen} = ${tensPart + 10}`,
            `${tensPart + 10} + ${b - toTen} = ${answer}`,
          ]
        : [
            `${b} を ${toTen} と ${b - toTen} に わけよう`,
            `${a} + ${toTen} = 10`,
            `10 + ${b - toTen} = ${answer}`,
          ],
    hints:
      tensPart > 0
        ? [
            `${b} を わけて ${displayA} を ちょうど ${tensPart + 10} に しよう`,
            `${displayA} と ${toTen} を たすと ${tensPart + 10} に なるね`,
            `${tensPart + 10} と のこりの ${b - toTen} を たすと…`,
          ]
        : [
            `${b} を 10の なかまと のこりに わけて かんがえよう`,
            `${a} と ${toTen} を たすと 10に なるね`,
            `10 と のこりの ${b - toTen} を たすと…`,
          ],
  };
}

function genSubNoBorrow(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  if (lv === 3) {
    /* Lv3: 十の位を足した 2桁 - 1桁 (くり下がりなし) */
    const tensPart = randInt(rng, 1, 8) * 10;
    const onesA = randInt(rng, 3, 9);
    const b = randInt(rng, 1, onesA - 1);
    const a = tensPart + onesA;
    const answer = a - b;
    const { choices, tags } = makeChoicesTagged(rng, answer, "sub", [a, b]);
    return {
      skillId: "g1_sub_nc",
      text: `${a} - ${b} = ?`,
      a,
      b,
      op: "-",
      answer: String(answer),
      choices,
      choiceTags: tags,
      hint: null,
      explain: [`${a} から ${b} を ひくと ${answer}`],
      hints: [
        `${a} から ひとつずつ ${b}かい ひいて かんがえよう`,
        `${a} から ${b} を ひくと いくつに なるかな`,
        `${a} - ${b} を けいさんすると…`,
      ],
    };
  }
  const [lo, hi] = lv === 1 ? [3, 5] : [3, 9];
  const a = randInt(rng, lo, hi);
  const b = randInt(rng, 1, a - 1);
  const answer = a - b;
  const { choices, tags } = makeChoicesTagged(rng, answer, "sub", [a, b]);
  return {
    skillId: "g1_sub_nc",
    text: `${a} - ${b} = ?`,
    a,
    b,
    op: "-",
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: null,
    explain: [`${a} から ${b} を ひくと ${answer}`],
    hints: [
      `${a} から ひとつずつ ${b}かい ひいて かんがえよう`,
      `${a} から ${b} を ひくと いくつに なるかな`,
      `${a} - ${b} を けいさんすると…`,
    ],
  };
}

function genSubBorrow(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  let a = 0;
  let b = 0;
  if (lv === 3) {
    /* Lv3: 十の位を一般化した くり下がり (11〜18 の "1" を 1〜8 に広げる) */
    const tensA = randInt(rng, 1, 8);
    let onesA = 0;
    do {
      onesA = randInt(rng, 1, 8);
      b = randInt(rng, 2, 9);
    } while (b <= onesA);
    a = tensA * 10 + onesA;
  } else {
    /* くりさがり必須: 11〜18(Lv1は11〜13) から 1桁を引き、b > a の一の位 */
    const hi = lv === 1 ? 13 : 18;
    do {
      a = randInt(rng, 11, hi);
      b = randInt(rng, 2, 9);
    } while (b <= a % 10 || a - b < 1);
  }
  const answer = a - b;
  const tens = Math.floor(a / 10) * 10; /* さくらんぼ: a を 十の位 と 一の位 に分けて 十の位 から引く */
  const ones = a % 10;
  const { choices, tags } = makeChoicesTagged(rng, answer, "sub", [a, b]);
  return {
    skillId: "g1_sub_borrow",
    text: `${a} - ${b} = ?`,
    a,
    b,
    op: "-",
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: { type: "cherry", split: { first: tens, second: ones } },
    explain: [
      `${a} を ${tens} と ${ones} に わけよう`,
      `${tens} - ${b} = ${tens - b}`,
      `${tens - b} + ${ones} = ${answer}`,
    ],
    hints: [
      `${a} を 十のくらいと 一のくらいに わけて かんがえよう`,
      `${tens} から ${b} を ひくと いくつかな`,
      `${tens} - ${b} = ${tens - b}。あとは ${ones} を たすと…`,
    ],
  };
}

export const GRADE1_GENERATORS: Record<string, (rng: Rng, level?: Level) => Problem> = {
  g1_count: genCount,
  g1_compare: genCompare,
  g1_add_nc: genAddNoCarry,
  g1_add_carry: genAddCarry,
  g1_sub_nc: genSubNoBorrow,
  g1_sub_borrow: genSubBorrow,
};

export const GRADE1_LABELS: Record<string, string> = {
  g1_count: "かぞえる",
  g1_compare: "いちばん おおきい かず",
  g1_add_nc: "たしざん (〜10)",
  g1_add_carry: "くりあがりの たしざん",
  g1_sub_nc: "ひきざん (〜10)",
  g1_sub_borrow: "くりさがりの ひきざん",
};

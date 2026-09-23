/*
 * 小2のスキルと問題ジェネレータ (第2章「九九の塔と海のひっさん」)。
 * 3択UIの制約に合わせ、答えはすべて非負整数の文字列にする
 * (単位換算は「なんmm?」のように換算後の数だけを答えさせる)。
 *
 * 出題の段階 (LP-02, docs/kazu-quest-levels.md): 各ジェネレータは
 * `(rng, level?)` を取り、level 省略時は 2 (= 従来どおりの出題) を使う。
 * level 2 の分岐は既存コードと完全に同じ値域・同じ乱数消費順にしてある
 * (シード固定のテストが壊れないため)。
 *
 * 段階ヒント・誤答診断 (LP-03): g2_kuku・g2_add_column・g2_sub_column は
 * 手書きの3段ヒント、他は genericHints()。3択は makeChoices 由来なので
 * makeChoicesTagged で誤答パターンも付ける。
 */

import type { Problem, Rng } from "./types";
import { randInt } from "./types";
import { makeChoicesOf, makeChoicesTagged } from "./choices";
import { genericHints } from "./hints";
import { columnAddSteps, columnSubSteps } from "./columnSteps";

type Level = 1 | 2 | 3;

/* 九九 (a×b, 1..9)。Lv1/Lv3 は「だん」を絞ってやさしさ/むずかしさを作る
 * (Lv2 = 現行そのまま = 全段からランダム) */
function genKuku(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  let a: number;
  if (lv === 1) {
    const dans = [2, 5];
    a = dans[randInt(rng, 0, dans.length - 1)];
  } else if (lv === 3) {
    const dans = [7, 8, 9];
    a = dans[randInt(rng, 0, dans.length - 1)];
  } else {
    a = randInt(rng, 1, 9);
  }
  const b = randInt(rng, 1, 9);
  const answer = a * b;
  const explain = [
    `${a}のだんの 九九だよ`,
    `${a} × ${b} = ${answer}`,
    `「${a}を ${b}かい たす」のと おなじだね`,
  ];
  const { choices, tags } = makeChoicesTagged(rng, answer, "mul", [a, b]);
  return {
    skillId: "g2_kuku",
    text: `${a} × ${b} = ?`,
    a,
    b,
    op: "×",
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: null,
    explain,
    hints: [
      `${a}の だんを おもいだしてみよう`,
      `${a} を ${b}かい たすと どうなるかな`,
      `${a} × ${b} を けいさんすると…`,
    ],
  };
}

/* 2桁のたし算ひっ算 (くり上がりあり)。Lv3 は 3桁どうしに広げる */
function genAddColumn(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [lo, hi] = lv === 1 ? [10, 49] : lv === 3 ? [100, 899] : [10, 89];
  const a = randInt(rng, lo, hi);
  let b = randInt(rng, lo, hi);
  /* この単元は「くり上がりのある ひっ算」。そのまま引くと 6割が くり上がり
     なしに なっていたので、多くは くり上がりが おきるまで 引きなおす */
  if (rng() < 0.6) {
    for (let i = 0; i < 10 && (a % 10) + (b % 10) < 10; i++) b = randInt(rng, lo, hi);
  }
  const answer = a + b;
  /* くらいごとの説明 (3けたの Lv3 でも 百のくらいまで 正しく書く) */
  const explain = columnAddSteps(a, b);
  const { choices, tags } = makeChoicesTagged(rng, answer, "add", [a, b]);
  return {
    skillId: "g2_add_column",
    text: `ひっさんで けいさんしよう\n${a} + ${b} = ?`,
    a,
    b,
    op: "+",
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: null,
    explain,
    hints: [
      `くらいを そろえて、一のくらいから じゅんに たしざんしよう`,
      `一のくらい: ${a % 10} + ${b % 10} を けいさんしてみよう`,
      `くり上がりに 気をつけて 上のくらいまで じゅんに けいさんすると…`,
    ],
  };
}

/* 2桁のひき算ひっ算 (くり下がりあり)。Lv3 は 3桁どうしに広げる */
function genSubColumn(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [aLo, aHi, bLo] =
    lv === 1 ? [20, 49, 10] : lv === 3 ? [200, 999, 100] : [20, 99, 10];
  const a = randInt(rng, aLo, aHi);
  let b = randInt(rng, bLo, a - 1);
  /* 「くり下がりのある ひっ算」なので 多くは くり下がりが おきるまで 引きなおす */
  if (rng() < 0.6) {
    for (let i = 0; i < 10 && a % 10 >= b % 10; i++) b = randInt(rng, bLo, a - 1);
  }
  const answer = a - b;
  const explain = columnSubSteps(a, b);
  const { choices, tags } = makeChoicesTagged(rng, answer, "sub", [a, b]);
  return {
    skillId: "g2_sub_column",
    text: `ひっさんで けいさんしよう\n${a} - ${b} = ?`,
    a,
    b,
    op: "-",
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: null,
    explain,
    hints: [
      `くらいを そろえて、一のくらいから じゅんに ひきざんしよう`,
      `一のくらい: ${a % 10} から ${b % 10} を ひけるかな`,
      `くり下がりに 気をつけて 上のくらいまで じゅんに けいさんすると…`,
    ],
  };
}

/* ながさ (cm/mm 換算)。Lv1 はちいさい数、Lv3 は2桁cmまで広げる */
function genLength(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const single = lv === 1 ? [2, 5] : lv === 3 ? [10, 99] : [2, 9];
  const small = lv === 1 ? [1, 5] : lv === 3 ? [10, 99] : [1, 9];
  if (rng() < 0.5) {
    const cm = randInt(rng, single[0], single[1]);
    const answer = cm * 10;
    const explain = [`1cm = 10mm だから`, `${cm}cm = ${answer}mm`];
    const { choices, tags } = makeChoicesTagged(rng, answer, "convert", [cm]);
    return {
      skillId: "g2_length",
      text: `${cm}cm は なんmm?`,
      a: cm,
      b: null,
      op: null,
      answer: String(answer),
      choices,
      choiceTags: tags,
      hint: null,
      explain,
      hints: genericHints(explain),
    };
  }
  const cm = randInt(rng, small[0], small[1]);
  const mm = randInt(rng, 1, 9);
  const answer = cm * 10 + mm;
  const explain = [
    `${cm}cm = ${cm * 10}mm`,
    `${cm * 10}mm + ${mm}mm = ${answer}mm`,
  ];
  const { choices, tags } = makeChoicesTagged(rng, answer, "convert", [cm, mm]);
  return {
    skillId: "g2_length",
    text: `${cm}cm${mm}mm は なんmm?`,
    a: cm,
    b: mm,
    op: null,
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: null,
    explain,
    hints: genericHints(explain),
  };
}

/* かさ (L/dL 換算)。Lv1 はちいさい数、Lv3 は2桁Lまで広げる */
function genVolume(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const single = lv === 1 ? [2, 5] : lv === 3 ? [10, 20] : [2, 9];
  const small = lv === 1 ? [1, 5] : lv === 3 ? [10, 20] : [1, 9];
  if (rng() < 0.5) {
    const l = randInt(rng, single[0], single[1]);
    const answer = l * 10;
    const explain = [`1L = 10dL だから`, `${l}L = ${answer}dL`];
    const { choices, tags } = makeChoicesTagged(rng, answer, "convert", [l]);
    return {
      skillId: "g2_volume",
      text: `${l}L は なんdL?`,
      a: l,
      b: null,
      op: null,
      answer: String(answer),
      choices,
      choiceTags: tags,
      hint: null,
      explain,
      hints: genericHints(explain),
    };
  }
  const l = randInt(rng, small[0], small[1]);
  const dl = randInt(rng, 1, 9);
  const answer = l * 10 + dl;
  const explain = [`${l}L = ${l * 10}dL`, `${l * 10}dL + ${dl}dL = ${answer}dL`];
  const { choices, tags } = makeChoicesTagged(rng, answer, "convert", [l, dl]);
  return {
    skillId: "g2_volume",
    text: `${l}L${dl}dL は なんdL?`,
    a: l,
    b: dl,
    op: null,
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: null,
    explain,
    hints: genericHints(explain),
  };
}

/* とけいと じかん (時間の計算 — 答えは数)。Lv1 は小さい範囲、Lv3 は
 * 正午をまたぐ計算・時間の単位換算を広くする */
function genTime(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const kind = randInt(rng, 0, 2);
  if (kind === 0) {
    /* なんじ? (じ + じかん) */
    const startHi = lv === 1 ? 5 : lv === 3 ? 9 : 9;
    /* Lv3 は 正午を またぐ。小2 は「ごぜん・ごご」で言うので 13じ〜 とは書かない
       (こたえは ごごの なんじ = 1〜11。ごご12じ は まぎらわしいので 出さない) */
    const addCap = lv === 3 ? 23 : 12;
    const start = randInt(rng, 1, startHi);
    const add = randInt(rng, 1, addCap - start);
    const total = start + add;
    const crossesNoon = total > 12;
    const answer = crossesNoon ? total - 12 : total;
    const explain = crossesNoon
      ? [
          `ごぜん ${start}じ から ひるの 12じ まで ${12 - start}じかん`,
          `のこりの ${add - (12 - start)}じかん で ごご ${answer}じ`,
        ]
      : [`${start}じ + ${add}じかん = ${answer}じ`];
    /* 正午またぎは「24じかんの まま答える (13じ〜)」が いちばん ありがちな まちがい。
       0じ や 13じ以上の となりの数は 時こくに ならないので 候補にしない */
    const { choices, tags } = crossesNoon
      ? {
          choices: makeChoicesOf(rng, String(answer), [
            String(total),
            String(answer === 11 ? 10 : answer + 1),
            String(answer === 1 ? 2 : answer - 1),
          ]),
          tags: undefined,
        }
      : makeChoicesTagged(rng, answer, "add", [start, add]);
    return {
      skillId: "g2_time",
      text: crossesNoon
        ? `ごぜん ${start}じから ${add}じかん たつと ごご なんじ?`
        : `${start}じから ${add}じかん たつと なんじ?`,
      a: start,
      b: add,
      op: null,
      /* 出発の時こくを とけいで見せる。他の2種 (じかん→ぷん / つぎのちょうどまで)
         は とけいにすると かえって まぎらわしいので 図なし */
      figure: { kind: "clock", hour: start, minute: 0 },
      answer: String(answer),
      choices,
      choiceTags: tags,
      hint: null,
      explain,
      hints: genericHints(explain),
    };
  }
  if (kind === 1) {
    /* 1じかん = 60ぷん の換算 */
    const hoursHi = lv === 1 ? 2 : lv === 3 ? 6 : 3;
    const hours = randInt(rng, 1, hoursHi);
    const answer = hours * 60;
    const explain = [`1じかん = 60ぷん だから`, `${hours}じかん = ${answer}ぷん`];
    const { choices, tags } = makeChoicesTagged(rng, answer, "time", [hours]);
    return {
      skillId: "g2_time",
      text: `${hours}じかんは なんぷん?`,
      a: hours,
      b: null,
      op: null,
      answer: String(answer),
      choices,
      choiceTags: tags,
      hint: null,
      explain,
      hints: genericHints(explain),
    };
  }
  /* あと なんぷんで つぎの じ? */
  const stepHi = lv === 1 ? 3 : lv === 3 ? 11 : 5;
  const step = lv === 3 ? 5 : 10;
  const minutes = randInt(rng, 1, stepHi) * step;
  const answer = 60 - minutes;
  const explain = [`60ぷんで つぎの じに なるから`, `60 - ${minutes} = ${answer}ぷん`];
  const { choices, tags } = makeChoicesTagged(rng, answer, "time", [minutes]);
  return {
    skillId: "g2_time",
    text: `いま ${minutes}ぷん。つぎの 「ちょうど」まで あと なんぷん?`,
    a: minutes,
    b: null,
    op: null,
    answer: String(answer),
    choices,
    choiceTags: tags,
    hint: null,
    explain,
    hints: genericHints(explain),
  };
}

export const GRADE2_GENERATORS: Record<string, (rng: Rng, level?: Level) => Problem> = {
  g2_kuku: genKuku,
  g2_add_column: genAddColumn,
  g2_sub_column: genSubColumn,
  g2_length: genLength,
  g2_volume: genVolume,
  g2_time: genTime,
};

export const GRADE2_LABELS: Record<string, string> = {
  g2_kuku: "九九",
  g2_add_column: "たしざんの ひっさん",
  g2_sub_column: "ひきざんの ひっさん",
  g2_length: "ながさ (cm/mm)",
  g2_volume: "かさ (L/dL)",
  g2_time: "とけいと じかん",
};

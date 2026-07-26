/*
 * 小2のスキルと問題ジェネレータ (第2章「九九の塔と海のひっさん」)。
 * 3択UIの制約に合わせ、答えはすべて非負整数の文字列にする
 * (単位換算は「なんmm?」のように換算後の数だけを答えさせる)。
 */

import type { Problem, Rng } from "./types";
import { randInt } from "./types";
import { makeChoices } from "./choices";

/* 九九 (a×b, 1..9) */
function genKuku(rng: Rng): Problem {
  const a = randInt(rng, 1, 9);
  const b = randInt(rng, 1, 9);
  const answer = a * b;
  return {
    skillId: "g2_kuku",
    text: `${a} × ${b} = ?`,
    a,
    b,
    op: "×",
    answer: String(answer),
    choices: makeChoices(rng, answer, "mul", [a, b]),
    hint: null,
    explain: [
      `${a}のだんの 九九だよ`,
      `${a} × ${b} = ${answer}`,
      `「${a}を ${b}かい たす」のと おなじだね`,
    ],
  };
}

/* 2桁のたし算ひっ算 (くり上がりあり) */
function genAddColumn(rng: Rng): Problem {
  const a = randInt(rng, 10, 89);
  const b = randInt(rng, 10, 89);
  const answer = a + b;
  const onesSum = (a % 10) + (b % 10);
  const carry = onesSum >= 10;
  return {
    skillId: "g2_add_column",
    text: `ひっさんで けいさんしよう\n${a} + ${b} = ?`,
    a,
    b,
    op: "+",
    answer: String(answer),
    choices: makeChoices(rng, answer, "add", [a, b]),
    hint: null,
    explain: carry
      ? [
          `一のくらい: ${a % 10} + ${b % 10} = ${onesSum} → ${onesSum % 10} をかいて 1くり上げる`,
          `十のくらい: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} + 1 = ${Math.floor(answer / 10)}`,
          `こたえは ${answer}`,
        ]
      : [
          `一のくらい: ${a % 10} + ${b % 10} = ${onesSum}`,
          `十のくらい: ${Math.floor(a / 10)} + ${Math.floor(b / 10)} = ${Math.floor(answer / 10)}`,
          `こたえは ${answer}`,
        ],
  };
}

/* 2桁のひき算ひっ算 (くり下がりあり) */
function genSubColumn(rng: Rng): Problem {
  const a = randInt(rng, 20, 99);
  const b = randInt(rng, 10, a - 1);
  const answer = a - b;
  const borrow = a % 10 < b % 10;
  return {
    skillId: "g2_sub_column",
    text: `ひっさんで けいさんしよう\n${a} - ${b} = ?`,
    a,
    b,
    op: "-",
    answer: String(answer),
    choices: makeChoices(rng, answer, "sub", [a, b]),
    hint: null,
    explain: borrow
      ? [
          `一のくらい: ${a % 10} から ${b % 10} は ひけない → 十のくらいから 1かりる`,
          `${10 + (a % 10)} - ${b % 10} = ${10 + (a % 10) - (b % 10)}`,
          `十のくらい: ${Math.floor(a / 10) - 1} - ${Math.floor(b / 10)} = ${Math.floor(answer / 10)}`,
          `こたえは ${answer}`,
        ]
      : [
          `一のくらい: ${a % 10} - ${b % 10} = ${a % 10 - (b % 10)}`,
          `十のくらい: ${Math.floor(a / 10)} - ${Math.floor(b / 10)} = ${Math.floor(answer / 10)}`,
          `こたえは ${answer}`,
        ],
  };
}

/* ながさ (cm/mm 換算) */
function genLength(rng: Rng): Problem {
  if (rng() < 0.5) {
    const cm = randInt(rng, 2, 9);
    const answer = cm * 10;
    return {
      skillId: "g2_length",
      text: `${cm}cm は なんmm?`,
      a: cm,
      b: null,
      op: null,
      answer: String(answer),
      choices: makeChoices(rng, answer, "convert", [cm]),
      hint: null,
      explain: [`1cm = 10mm だから`, `${cm}cm = ${answer}mm`],
    };
  }
  const cm = randInt(rng, 1, 9);
  const mm = randInt(rng, 1, 9);
  const answer = cm * 10 + mm;
  return {
    skillId: "g2_length",
    text: `${cm}cm${mm}mm は なんmm?`,
    a: cm,
    b: mm,
    op: null,
    answer: String(answer),
    choices: makeChoices(rng, answer, "convert", [cm, mm]),
    hint: null,
    explain: [
      `${cm}cm = ${cm * 10}mm`,
      `${cm * 10}mm + ${mm}mm = ${answer}mm`,
    ],
  };
}

/* かさ (L/dL 換算) */
function genVolume(rng: Rng): Problem {
  if (rng() < 0.5) {
    const l = randInt(rng, 2, 9);
    const answer = l * 10;
    return {
      skillId: "g2_volume",
      text: `${l}L は なんdL?`,
      a: l,
      b: null,
      op: null,
      answer: String(answer),
      choices: makeChoices(rng, answer, "convert", [l]),
      hint: null,
      explain: [`1L = 10dL だから`, `${l}L = ${answer}dL`],
    };
  }
  const l = randInt(rng, 1, 9);
  const dl = randInt(rng, 1, 9);
  const answer = l * 10 + dl;
  return {
    skillId: "g2_volume",
    text: `${l}L${dl}dL は なんdL?`,
    a: l,
    b: dl,
    op: null,
    answer: String(answer),
    choices: makeChoices(rng, answer, "convert", [l, dl]),
    hint: null,
    explain: [`${l}L = ${l * 10}dL`, `${l * 10}dL + ${dl}dL = ${answer}dL`],
  };
}

/* とけいと じかん (時間の計算 — 答えは数) */
function genTime(rng: Rng): Problem {
  const kind = randInt(rng, 0, 2);
  if (kind === 0) {
    /* なんじ? (じ + じかん) */
    const start = randInt(rng, 1, 9);
    const add = randInt(rng, 1, 12 - start);
    const answer = start + add;
    return {
      skillId: "g2_time",
      text: `${start}じから ${add}じかん たつと なんじ?`,
      a: start,
      b: add,
      op: null,
      answer: String(answer),
      choices: makeChoices(rng, answer, "add", [start, add]),
      hint: null,
      explain: [`${start}じ + ${add}じかん = ${answer}じ`],
    };
  }
  if (kind === 1) {
    /* 1じかん = 60ぷん の換算 */
    const hours = randInt(rng, 1, 3);
    const answer = hours * 60;
    return {
      skillId: "g2_time",
      text: `${hours}じかんは なんぷん?`,
      a: hours,
      b: null,
      op: null,
      answer: String(answer),
      choices: makeChoices(rng, answer, "time", [hours]),
      hint: null,
      explain: [`1じかん = 60ぷん だから`, `${hours}じかん = ${answer}ぷん`],
    };
  }
  /* あと なんぷんで つぎの じ? */
  const minutes = randInt(rng, 1, 5) * 10;
  const answer = 60 - minutes;
  return {
    skillId: "g2_time",
    text: `いま ${minutes}ぷん。つぎの 「ちょうど」まで あと なんぷん?`,
    a: minutes,
    b: null,
    op: null,
    answer: String(answer),
    choices: makeChoices(rng, answer, "time", [minutes]),
    hint: null,
    explain: [`60ぷんで つぎの じに なるから`, `60 - ${minutes} = ${answer}ぷん`],
  };
}

export const GRADE2_GENERATORS: Record<string, (rng: Rng) => Problem> = {
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

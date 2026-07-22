/* 2年生: 2けたの計算、九九、時こく、長さ。 */

import type { Problem, SkillDef } from "./types";
import { shuffle, uniqueChoices } from "./util";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function stringChoices(answer: string, candidates: string[]): [string, string, string] {
  const wrong = [...new Set(candidates)].filter((choice) => choice !== answer).slice(0, 2);
  if (wrong.length !== 2) throw new Error("not enough unique choices");
  const choices = shuffle([answer, wrong[0], wrong[1]]);
  return [choices[0], choices[1], choices[2]];
}

function genAdd2(): Problem {
  const carry = Math.random() < 0.5;
  for (;;) {
    const a = randInt(10, 89);
    const b = randInt(10, 89);
    const answer = a + b;
    if (answer >= 100 || (a % 10 + (b % 10) >= 10) !== carry) continue;
    return {
      skillId: "g2_add2",
      text: `${a} + ${b} = ?`,
      a,
      b,
      op: "+",
      answer: String(answer),
      choices: uniqueChoices(answer, [answer - 10, answer + 10, answer - 1, answer + 1], 0, 110),
      hint: null,
      explain: carry
        ? [`1のくらいから たすと、10をこえたら 1くりあげる`, `${a} + ${b} = ${answer}`]
        : [`1のくらい、10のくらいの じゅんに たそう`, `${a} + ${b} = ${answer}`],
    };
  }
}

function genSub2(): Problem {
  const borrow = Math.random() < 0.5;
  for (;;) {
    const a = randInt(20, 99);
    const b = randInt(10, 89);
    if (a <= b || ((a % 10 < b % 10) !== borrow)) continue;
    const answer = a - b;
    return {
      skillId: "g2_sub2",
      text: `${a} - ${b} = ?`,
      a,
      b,
      op: "-",
      answer: String(answer),
      choices: uniqueChoices(answer, [answer + 10, answer - 10, answer + 1, answer - 1], 0, 99),
      hint: null,
      explain: borrow
        ? [`1のくらいで ひけないので、10のくらいから 1かりる`, `${a} - ${b} = ${answer}`]
        : [`1のくらい、10のくらいの じゅんに ひこう`, `${a} - ${b} = ${answer}`],
    };
  }
}

function genKuku(): Problem {
  const n = randInt(1, 9);
  const m = randInt(1, 9);
  const answer = n * m;
  return {
    skillId: "g2_kuku",
    text: `${n} × ${m} = ?`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, [(n - 1) * m, (n + 1) * m, n * (m - 1), n * (m + 1)], 0, 90),
    hint: null,
    explain: [`${n}のだんを おもいだそう`, `${n} × ${m} = ${answer}`],
  };
}

function genKukuHole(): Problem {
  const n = randInt(1, 9);
  const missing = randInt(2, 9);
  const product = n * missing;
  return {
    skillId: "g2_kuku_hole",
    text: `${n} × □ = ${product}`,
    a: null,
    b: null,
    op: null,
    answer: String(missing),
    choices: uniqueChoices(missing, [missing - 1, missing + 1, missing - 2, missing + 2], 1, 9),
    hint: null,
    explain: [`${n}のだんで ${product}に なるところを さがす`, `${n} × ${missing} = ${product}`],
  };
}

function genKazu(): Problem {
  if (Math.random() < 0.5) {
    const n = randInt(2, 9);
    const answer = n * 10;
    return {
      skillId: "g2_kazu",
      text: `10が ${n}こで?`,
      a: null,
      b: null,
      op: null,
      answer: String(answer),
      choices: uniqueChoices(answer, [n, answer - 10, answer + 10], 0, 100),
      hint: null,
      explain: [`10が ${n}こだから、10 × ${n}`, `こたえは ${answer}`],
    };
  }
  const hundreds = randInt(1, 9);
  const tens = randInt(0, 9);
  const answer = hundreds * 100 + tens * 10;
  return {
    skillId: "g2_kazu",
    text: `100が ${hundreds}こと 10が ${tens}こで?`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, [hundreds * 100 + tens, answer - 10, answer + 10, hundreds * 10 + tens * 100], 0, 1000),
    hint: null,
    explain: [`100が ${hundreds}こで ${hundreds * 100}`, `10が ${tens}こで ${tens * 10}、あわせて ${answer}`],
  };
}

function genTime(): Problem {
  if (Math.random() < 1 / 3) {
    return {
      skillId: "g2_time",
      text: "1じかん = なんぷん?",
      a: null,
      b: null,
      op: null,
      answer: "60ぷん",
      choices: stringChoices("60ぷん", ["30ぷん", "100ぷん"]),
      hint: null,
      explain: ["1じかんは 60ぷん"],
    };
  }
  const hour = randInt(1, 12);
  const halfPast = Math.random() < 0.5;
  const nextHour = hour === 12 ? 1 : hour + 1;
  const answer = halfPast ? `${nextHour}じ` : `${hour}じ30ぷん`;
  const wrongHour = hour === 1 ? 12 : hour - 1;
  return {
    skillId: "g2_time",
    text: `${hour}じ${halfPast ? "30ぷん" : ""}の 30ぷんあとは?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, halfPast
      ? [`${hour}じ`, `${nextHour}じ30ぷん`, `${wrongHour}じ`]
      : [`${nextHour}じ`, `${hour}じ`, `${wrongHour}じ30ぷん`]),
    hint: null,
    explain: halfPast
      ? [`${hour}じ30ぷんから 30ぷん すすむと、つぎの じこく`, `こたえは ${nextHour}じ`]
      : [`${hour}じから 30ぷん すすむ`, `こたえは ${hour}じ30ぷん`],
  };
}

function genLength(): Problem {
  if (Math.random() < 1 / 3) {
    return {
      skillId: "g2_length",
      text: "1cm = なんmm?",
      a: null,
      b: null,
      op: null,
      answer: "10mm",
      choices: stringChoices("10mm", ["1mm", "100mm"]),
      hint: null,
      explain: ["1cmは 10mm"],
    };
  }
  const cm = randInt(1, 9);
  const mm = randInt(1, 9);
  const answer = cm * 10 + mm;
  return {
    skillId: "g2_length",
    text: `${cm}cm ${mm}mm = なんmm?`,
    a: null,
    b: null,
    op: null,
    answer: `${answer}mm`,
    choices: stringChoices(`${answer}mm`, [`${cm + mm}mm`, `${cm * 10}mm`, `${answer + 10}mm`]),
    hint: null,
    explain: [`${cm}cmは ${cm * 10}mm`, `${cm * 10}mm + ${mm}mm = ${answer}mm`],
  };
}

export const GRADE2_SKILLS: SkillDef[] = [
  { id: "g2_add2", grade: 2, label: "2けたのたし算", generate: genAdd2 },
  { id: "g2_sub2", grade: 2, label: "2けたのひき算", generate: genSub2 },
  { id: "g2_kuku", grade: 2, label: "九九", generate: genKuku },
  { id: "g2_kuku_hole", grade: 2, label: "九九の穴うめ", generate: genKukuHole },
  { id: "g2_kazu", grade: 2, label: "数のしくみ", generate: genKazu },
  { id: "g2_time", grade: 2, label: "時こくと時間", generate: genTime },
  { id: "g2_length", grade: 2, label: "長さのたんい", generate: genLength },
];

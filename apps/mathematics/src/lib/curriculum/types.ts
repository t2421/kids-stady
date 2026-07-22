/* カリキュラム (問題生成) の型定義 */

export type Op = "+" | "-";

export interface CherryHint {
  type: "cherry";
  /* 分解する数 (たしざんは b、ひきざんも b) を first + second に割る */
  split: { first: number; second: number };
}

/* かんがえかたヒント: 答えは言わず、解き方の入口だけを教える */
export interface TextHint {
  type: "text";
  lines: string[];
}

export type Hint = CherryHint | TextHint;

export interface Problem {
  skillId: string;
  /* 出題文。かぞえる系は絵文字の行を含む */
  text: string;
  /* さくらんぼ図で使う。かぞえる・くらべる系は null */
  a: number | null;
  b: number | null;
  op: Op | null;
  /* 答えと選択肢は文字列統一 (将来の分数 "1/2"・小数 "0.6" 対応) */
  answer: string;
  choices: [string, string, string];
  hint: Hint | null;
  /* まちがえたときの解説ステップ (上から順に表示) */
  explain: string[];
}

export interface SkillDef {
  id: string;
  grade: number;
  label: string;
  generate: () => Problem;
}

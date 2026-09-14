/*
 * 青空文庫記法のルビ パーサ (純関数)。会話ページの文字列に
 *   ｜漢字《かんじ》   … 明示形 (｜ から 《 までが ベース)
 *   漢字《かんじ》     … 省略形 (《 の直前に続く漢字の連なりが ベース)
 * を書けるようにする。DOM 側は parseRuby の結果を <ruby>base<rt>ruby</rt></ruby> で描く。
 * Canvas (戦闘メッセージ) は対象外なので、そちらへ流す前に stripRuby で平文に戻す。
 */

export interface RubySegment {
  base: string;
  ruby?: string;
}

const BAR = "｜";
const OPEN = "《";
const CLOSE = "》";

/* 漢字の連なり (省略形のベース)。々〆ヶ〇 も漢字扱い */
const KANJI_RUN_TAIL = /[\p{Script=Han}々〆〇ヶ]+$/u;

interface ScanResult {
  segments: RubySegment[];
  /* 記法エラー。null なら整形式 */
  error: string | null;
}

function fail(message: string, text: string, at: number): ScanResult {
  return {
    segments: [],
    error: `${message} (位置 ${at}: 「${text}」)`,
  };
}

/* ルビ本体 (《 と 》 の間) の妥当性。問題があればエラー文、なければ null */
function rubyBodyError(ruby: string): string | null {
  if (ruby.length === 0) return "《》 の なかが 空";
  if (ruby.includes(OPEN) || ruby.includes(BAR)) return "《 の なかに 《 や ｜ が ある";
  return null;
}

/* 先頭から 1 パスで走査する。エラー時は segments を空にして error を返す */
function scan(text: string): ScanResult {
  const segments: RubySegment[] = [];
  let plain = "";
  let i = 0;
  const flushPlain = () => {
    if (plain.length > 0) segments.push({ base: plain });
    plain = "";
  };

  while (i < text.length) {
    const ch = text[i];

    if (ch === CLOSE) return fail("対応する 《 が ない 》", text, i);

    if (ch === BAR) {
      const open = text.indexOf(OPEN, i + 1);
      if (open === -1) return fail("｜ の あとに 《 が ない", text, i);
      const base = text.slice(i + 1, open);
      if (base.length === 0) return fail("｜ と 《 の あいだが 空", text, i);
      if (base.includes(BAR)) return fail("｜ が 二重に ある", text, i);
      const close = text.indexOf(CLOSE, open + 1);
      if (close === -1) return fail("《 に 対応する 》 が ない", text, open);
      const ruby = text.slice(open + 1, close);
      const bodyError = rubyBodyError(ruby);
      if (bodyError) return fail(bodyError, text, open);
      flushPlain();
      segments.push({ base, ruby });
      i = close + 1;
      continue;
    }

    if (ch === OPEN) {
      const close = text.indexOf(CLOSE, i + 1);
      if (close === -1) return fail("《 に 対応する 》 が ない", text, i);
      const ruby = text.slice(i + 1, close);
      const bodyError = rubyBodyError(ruby);
      if (bodyError) return fail(bodyError, text, i);
      const run = KANJI_RUN_TAIL.exec(plain)?.[0] ?? "";
      if (run.length === 0) return fail("《 の まえに 漢字が ない (｜ で 範囲を 指定する)", text, i);
      plain = plain.slice(0, plain.length - run.length);
      flushPlain();
      segments.push({ base: run, ruby });
      i = close + 1;
      continue;
    }

    plain += ch;
    i += 1;
  }
  flushPlain();
  return { segments, error: null };
}

/*
 * 文字列をルビ区間に分割する。記法エラーがある場合は例外を投げず、
 * 文字列全体をそのまま 1 区間として返す (表示が消えるより安全)。
 */
export function parseRuby(text: string): RubySegment[] {
  const { segments, error } = scan(text);
  if (error !== null) return text.length > 0 ? [{ base: text }] : [];
  return segments;
}

/* ルビ記法を取り除いた平文 (選択肢ラベル・Canvas 側・文字数カウント用) */
export function stripRuby(text: string): string {
  return parseRuby(text)
    .map((s) => s.base)
    .join("");
}

/* 記法の検証。エラーがあればその説明、なければ null (content の全数検査で使う) */
export function validateRuby(text: string): string | null {
  return scan(text).error;
}

/* 表示上の文字数 (ルビを除いた本文の長さ)。タイプライター表示のカウント用 */
export function visibleLength(text: string): number {
  return stripRuby(text).length;
}

/*
 * 先頭 count 文字ぶんの区間を返す (タイプライター表示用)。
 * 途中までしか出ていない区間はルビなしの平文として返し、幅の変動を抑える。
 */
export function sliceRuby(segments: readonly RubySegment[], count: number): RubySegment[] {
  const out: RubySegment[] = [];
  let remaining = count;
  for (const seg of segments) {
    if (remaining <= 0) break;
    if (seg.base.length <= remaining) {
      out.push(seg);
      remaining -= seg.base.length;
      continue;
    }
    out.push({ base: seg.base.slice(0, remaining) });
    break;
  }
  return out;
}

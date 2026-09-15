/*
 * まなびやの先生メニュー (学びの設計 LP-18)。旧 spellTestMenu() の役割を継ぐが、
 * EventCommand には元々一覧選択が無かった (だから spellTestMenu は はい/いいえ を
 * 入れ子にしていた) のに対し、こちらは openTeacherMenu 1コマンドで単元一覧を
 * まるごと TeacherMenu.tsx (React) に渡す — 一覧の見せ方・タップ処理は
 * すべて向こう側の責務。
 */

import type { EventCommand } from "../types";

export interface TeacherMenuEntry {
  skillId: string;
  /* 「わり算」のように 単元名で書く (呪文名を主にしない — LP-18 の方針) */
  label: string;
  /*
   * 旧・呪文の学習テスト対象単元だったときだけ付ける (習得させたい呪文)。
   * 同じ単元が複数の呪文の学習テスト対象になっているとき (章2 の g2_add_column
   * など) は配列で両方渡す
   */
  spellIds?: string[];
}

export function teacherMenu(entries: readonly TeacherMenuEntry[]): EventCommand[] {
  return [{ type: "openTeacherMenu", entries: entries.map((e) => ({ ...e })) }];
}

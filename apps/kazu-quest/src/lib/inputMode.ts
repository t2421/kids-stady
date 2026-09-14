import { SKILLS } from "./curriculum";

/*
 * 出題パネルの入力方式 (KQ-12、設計 A4/B6)。
 *   - 戦闘は常に3択 (テンポ優先。スコープ外: 戦闘中のテンキー)
 *   - それ以外 (習得テスト・おだい・とっくん・クイズ扉) は、出題スキルの学年が
 *     3 以上ならテンキー。小1〜2 は3択のまま
 * 学年が引けない skillId は安全側 (3択) に倒す。
 */

export type InputMode = "choices" | "keypad";

export const KEYPAD_MIN_GRADE = 3;

export function skillGrade(skillId: string): number | null {
  const info = SKILLS.find((s) => s.id === skillId);
  return info ? info.grade : null;
}

export function inputModeFor(context: string, skillId: string): InputMode {
  if (context === "battle") return "choices";
  const grade = skillGrade(skillId);
  if (grade === null) return "choices";
  return grade >= KEYPAD_MIN_GRADE ? "keypad" : "choices";
}

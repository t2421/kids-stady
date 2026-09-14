import type { Problem } from "@/lib/curriculum";

/*
 * いま出題中の問題 (MathPromptPanel が set する)。
 * DOM に答えを漏らさずに E2E が正解を打てるよう、
 * window.__KAZUQUEST_DEBUG__.currentAnswer() からだけ参照する (PhaserGame.tsx)。
 */

let current: Problem | null = null;

export function setCurrentProblem(problem: Problem | null): void {
  current = problem;
}

export function currentAnswer(): string | null {
  return current?.answer ?? null;
}

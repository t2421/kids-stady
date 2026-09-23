import type { Dir } from "../../lib/save";

/*
 * タップした場所まで 歩く道 (Phaser 非依存の純関数 — tests/tapPath.test.ts)。
 *
 * 以前は タップ1回で「その方向へ 1歩」だけ だったので、6マス先の村人を
 * タップしても 1歩しか動かず、子どもには 反応しないように 見えていた
 * (押しつづけると 歩く — は どこにも書いていない)。
 *
 * - 歩けるマスなら そこまでの 最短の道 (幅優先探索)
 * - 歩けないマス (村人・宝箱・壁) なら、そのとなりの 歩けるマス のうち
 *   いちばん近い所まで。村人なら 着いたら そちらを向いて 話しかけられる
 * - 道が無い・遠すぎる ときは null (呼び出し側は これまでどおり 1歩だけ歩く)
 */

export const MAX_TAP_PATH = 40;

const STEPS: { dir: Dir; dx: number; dy: number }[] = [
  { dir: "up", dx: 0, dy: -1 },
  { dir: "down", dx: 0, dy: 1 },
  { dir: "left", dx: -1, dy: 0 },
  { dir: "right", dx: 1, dy: 0 },
];

export interface TapPath {
  steps: Dir[];
  /* 目的地が 歩けないマスだったとき、着いてから向く方向 (話しかける相手の方) */
  faceAtEnd: Dir | null;
}

export function findTapPath(
  from: { x: number; y: number },
  target: { x: number; y: number },
  walkable: (x: number, y: number) => boolean,
  maxSteps = MAX_TAP_PATH,
): TapPath | null {
  if (from.x === target.x && from.y === target.y) return null;

  /* 目的地の候補: 歩けるなら そのマス、歩けないなら となりの マス (そこから向く) */
  const goals = new Map<string, Dir | null>();
  if (walkable(target.x, target.y)) {
    goals.set(`${target.x},${target.y}`, null);
  } else {
    for (const s of STEPS) {
      /* となり (target - 向き) に立って、向き s を向くと target を見る */
      goals.set(`${target.x - s.dx},${target.y - s.dy}`, s.dir);
    }
  }

  const prev = new Map<string, { key: string; dir: Dir } | null>();
  const startKey = `${from.x},${from.y}`;
  prev.set(startKey, null);
  let frontier = [{ x: from.x, y: from.y }];
  for (let depth = 0; depth <= maxSteps && frontier.length > 0; depth++) {
    const next: { x: number; y: number }[] = [];
    for (const cell of frontier) {
      const key = `${cell.x},${cell.y}`;
      if (goals.has(key)) return { steps: unwind(prev, key), faceAtEnd: goals.get(key) ?? null };
      for (const s of STEPS) {
        const nx = cell.x + s.dx;
        const ny = cell.y + s.dy;
        const nkey = `${nx},${ny}`;
        if (prev.has(nkey) || !walkable(nx, ny)) continue;
        prev.set(nkey, { key, dir: s.dir });
        next.push({ x: nx, y: ny });
      }
    }
    frontier = next;
  }
  return null;
}

function unwind(prev: Map<string, { key: string; dir: Dir } | null>, end: string): Dir[] {
  const steps: Dir[] = [];
  let cur = prev.get(end);
  let key = end;
  while (cur) {
    steps.push(cur.dir);
    key = cur.key;
    cur = prev.get(key);
  }
  return steps.reverse();
}

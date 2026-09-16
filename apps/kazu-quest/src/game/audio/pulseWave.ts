/*
 * AU-06: パルス波 (デューティ比つき矩形波) を PeriodicWave で近似合成する。
 * bgm.ts から分離した理由は単純なファイル分割 (責務が違う・800行制約) と、
 * AudioContext 無しの Node/Vitest からも純ロジックとして呼べるようにするため
 * (PeriodicWaveFactory は「createPeriodicWave を持つもの」という最小の構造型 —
 * 本物の AudioContext はこれを満たすので production コードでは素通しで渡せる)。
 *
 * 近似の考え方 (デューティ比 d のパルス波を高調波の正弦級数で作る):
 *   imag[n] = (2 / (n·π)) · sin(n·π·d)   (n = 1..harmonics)
 *   real[n] = 0
 * d = 0.5 (方形波) では偶数次高調波が消え、奇数次だけが残る — 古典的な矩形波の
 * フーリエ級数の形と一致する (振幅の絶対値は PeriodicWave の既定の正規化に任せる
 * ので、ここでは相対的な高調波の重みだけが合っていればよい)。d ≠ 0.5 では偶数次
 * 高調波が残り、それが「パルス幅による音色の違い」を作る。
 * これは thick/正確な帯域制限パルス合成ではなく、AU-06 の期限内で実装できる
 * 「聞いて違いがわかる」レベルの近似 — 将来 AU-09 でさらに磨いてよい。
 *
 * キャッシュ: (context, dutyCycle) の組ごとに 1 個だけ生成する (音符ごとに
 * createPeriodicWave するのは無駄なため)。WeakMap でコンテキストごとに保持する
 * ので、AudioContext が破棄されればキャッシュも一緒に GC される。
 */

const DEFAULT_HARMONICS = 24;

/* 本物の AudioContext はこれを満たす (W = PeriodicWave)。テストでは
   createPeriodicWave をスタブした最小オブジェクトを渡せる
   (AudioContext を必要としない純ロジックのテスト用) */
export interface PeriodicWaveFactory<W = unknown> {
  createPeriodicWave(real: Float32Array, imag: Float32Array): W;
}

const cache = new WeakMap<PeriodicWaveFactory<unknown>, Map<number, unknown>>();

/* デューティ比 d (0 < d < 1) のパルス波の PeriodicWave を作る (キャッシュなし) */
export function buildPulseWave<W>(
  ctx: PeriodicWaveFactory<W>,
  duty: number,
  harmonics: number = DEFAULT_HARMONICS,
): W {
  const real = new Float32Array(harmonics + 1);
  const imag = new Float32Array(harmonics + 1);
  for (let n = 1; n <= harmonics; n++) {
    imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
  }
  return ctx.createPeriodicWave(real, imag);
}

/* (ctx, duty) ごとにキャッシュして返す。同じ組み合わせでは createPeriodicWave を
   2 回呼ばない */
export function getPulseWave<W>(
  ctx: PeriodicWaveFactory<W>,
  duty: number,
  harmonics: number = DEFAULT_HARMONICS,
): W {
  let perCtx = cache.get(ctx as PeriodicWaveFactory<unknown>);
  if (!perCtx) {
    perCtx = new Map();
    cache.set(ctx as PeriodicWaveFactory<unknown>, perCtx);
  }
  const cached = perCtx.get(duty);
  if (cached !== undefined) return cached as W;
  const wave = buildPulseWave(ctx, duty, harmonics);
  perCtx.set(duty, wave);
  return wave;
}

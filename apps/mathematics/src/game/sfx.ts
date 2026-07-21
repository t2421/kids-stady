/*
 * WebAudio 合成の効果音 (音源ファイル0の方針)。
 * shared/js/audio.js の tone 合成パターンを TypeScript に移植したもの。
 * 初回のユーザー操作で init() を呼ぶこと (autoplay 制限対策)。
 */

type OscType = OscillatorType;

let ctx: AudioContext | null = null;

export function initAudio(): void {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(
  freq: number,
  dur = 0.12,
  type: OscType = "square",
  vol = 0.15,
  when = 0,
): void {
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  } catch {
    /* noop */
  }
}

export const sfx = {
  shoot() {
    tone(880, 0.05, "square", 0.05);
  },
  boom() {
    tone(140, 0.2, "sawtooth", 0.18);
    tone(70, 0.28, "triangle", 0.14, 0.02);
  },
  hurt() {
    tone(200, 0.2, "sawtooth", 0.2);
    tone(120, 0.3, "square", 0.16, 0.08);
  },
  capsule() {
    tone(660, 0.08, "sine", 0.16);
    tone(990, 0.1, "sine", 0.14, 0.07);
  },
  good() {
    tone(523, 0.1, "square", 0.13);
    tone(659, 0.1, "square", 0.13, 0.09);
    tone(784, 0.16, "square", 0.13, 0.18);
  },
  bad() {
    tone(220, 0.18, "sawtooth", 0.14);
    tone(174, 0.24, "sawtooth", 0.12, 0.12);
  },
  powerup() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.1, "square", 0.13, i * 0.07));
  },
  beam() {
    tone(1200, 0.3, "sawtooth", 0.16);
    tone(600, 0.4, "square", 0.14, 0.05);
    tone(300, 0.5, "triangle", 0.12, 0.1);
  },
  fanfare() {
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) =>
      tone(f, 0.16, "square", 0.14, i * 0.12),
    );
  },
  gauge() {
    tone(440, 0.08, "sine", 0.14);
    tone(880, 0.12, "sine", 0.12, 0.06);
  },
};

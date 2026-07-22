/* デバッグモード: URL に ?debug=1 を付けると有効になる。
   レッスンのゲートを飛ばして出撃/ボスせんを直接試せる (開発・調整用) */
export function isDebugMode(): boolean {
  try {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("debug") === "1";
  } catch {
    return false;
  }
}

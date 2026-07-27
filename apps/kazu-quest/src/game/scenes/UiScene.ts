import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import type { StatusData } from "../field/statusSections";

/*
 * 会話UIブリッジ。Canvas の手動レイアウトは崩れやすいため、描画は
 * React (GameUiOverlay / StatusPanelOverlay) が DOM で行う (設計変更 2026-07-27)。
 * このシーンは「シーン側から呼べる同期API + busy 管理」だけを担う:
 *   showMessage → EventBus "ui-message" {id, pages} → 完了 "ui-message-done"
 *   showChoice  → "ui-choice"  {id, prompt}         → "ui-choice-done" {yes}
 *   showList    → "ui-list"    {id, prompt, options} → "ui-list-done" {index}
 *   showStatusPanel → "ui-status" {id, data}        → "ui-status-closed"
 * ダイアログ表示中は isBusy() が true になり、FieldScene は移動入力を止める。
 */

export class UiScene extends Scene {
  private seq = 0;
  private activeIds = new Set<number>();

  constructor() {
    super({ key: "Ui", active: false });
  }

  isBusy(): boolean {
    return this.activeIds.size > 0;
  }

  /*
   * リクエストを1件発行し、React からの完了イベントを1回だけ受ける。
   * id を照合するので、遅れて届いた古い完了イベントでは解決しない。
   */
  private request<R extends { id: number }>(
    emitEvent: string,
    doneEvent: string,
    payload: Record<string, unknown>,
    onDone: (result: R) => void,
  ): void {
    const id = ++this.seq;
    this.activeIds.add(id);
    const handler = (result: R) => {
      if (result.id !== id) return;
      EventBus.off(doneEvent, handler);
      this.activeIds.delete(id);
      onDone(result);
    };
    EventBus.on(doneEvent, handler);
    EventBus.emit(emitEvent, { id, ...payload });
  }

  showMessage(pages: string[], onDone: () => void): void {
    this.request("ui-message", "ui-message-done", { pages }, () => onDone());
  }

  showChoice(prompt: string, onResult: (yes: boolean) => void): void {
    this.request<{ id: number; yes: boolean }>(
      "ui-choice",
      "ui-choice-done",
      { prompt },
      (r) => onResult(r.yes),
    );
  }

  /**
   * 選択肢のリストを表示する。決定で index、キャンセルで null を返す。
   * 呼び出し側が「やめる」相当の項目を入れておくのが親切。
   */
  showList(
    prompt: string,
    options: string[],
    onResult: (index: number | null) => void,
  ): void {
    this.request<{ id: number; index: number | null }>(
      "ui-list",
      "ui-list-done",
      { prompt, options },
      (r) => onResult(r.index),
    );
  }

  showStatusPanel(data: StatusData, onClose: () => void): void {
    this.request("ui-status", "ui-status-closed", { data }, () => onClose());
  }

  showMapName(name: string): void {
    EventBus.emit("ui-map-name", { name });
  }
}

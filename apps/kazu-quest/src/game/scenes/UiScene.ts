import { Scene } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";

/*
 * 常駐オーバーレイシーン。DQ風のメッセージウィンドウと はい/いいえ 選択を描く。
 * FieldScene のカメラズームの影響を受けないよう独立したシーンにしている。
 * ダイアログ表示中は isBusy() が true になり、FieldScene は移動入力を止める。
 */

const TYPE_MS = 28; /* 1文字あたりの表示間隔 */

interface MessageJob {
  pages: string[];
  pageIndex: number;
  onDone: () => void;
}

export class UiScene extends Scene {
  private windowBox?: Phaser.GameObjects.Rectangle;
  private windowFrame?: Phaser.GameObjects.Rectangle;
  private textObj?: Phaser.GameObjects.Text;
  private nextArrow?: Phaser.GameObjects.Text;
  private job: MessageJob | null = null;
  private typing = false;
  private charTimer?: Phaser.Time.TimerEvent;
  private fullPageText = "";

  private choiceBox?: Phaser.GameObjects.Container;
  private choiceResolve: ((yes: boolean) => void) | null = null;
  private choiceSelected = true; /* true = はい */
  private listBox?: Phaser.GameObjects.Container;
  private listResolve: ((index: number | null) => void) | null = null;
  private listOptions: string[] = [];
  private listIndex = 0;
  private mapLabel?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Ui", active: false });
  }

  create() {
    this.input.keyboard?.on("keydown-Z", () => this.onAdvance());
    this.input.keyboard?.on("keydown-ENTER", () => this.onAdvance());
    this.input.keyboard?.on("keydown-SPACE", () => this.onAdvance());
    this.input.on("pointerdown", () => this.onAdvance());
    this.input.keyboard?.on("keydown-UP", () => {
      this.moveChoice();
      this.moveList(-1);
    });
    this.input.keyboard?.on("keydown-DOWN", () => {
      this.moveChoice();
      this.moveList(1);
    });
    this.input.keyboard?.on("keydown-X", () => this.cancelList());
  }

  isBusy(): boolean {
    return (
      this.job !== null || this.choiceResolve !== null || this.listResolve !== null
    );
  }

  /* ---------- メッセージウィンドウ ---------- */

  showMessage(pages: string[], onDone: () => void): void {
    this.job = { pages, pageIndex: 0, onDone };
    this.ensureWindow();
    this.startPage();
  }

  private ensureWindow() {
    if (this.windowBox) return;
    const w = GAME_WIDTH - 120;
    const h = 150;
    const x = GAME_WIDTH / 2;
    const y = GAME_HEIGHT - h / 2 - 24;
    this.windowFrame = this.add
      .rectangle(x, y, w + 8, h + 8, 0xffffff, 1)
      .setDepth(10);
    this.windowBox = this.add.rectangle(x, y, w, h, 0x000000, 0.92).setDepth(11);
    this.textObj = this.add
      .text(x - w / 2 + 24, y - h / 2 + 20, "", {
        fontFamily: "sans-serif",
        fontSize: "26px",
        color: "#ffffff",
        lineSpacing: 10,
        wordWrap: { width: w - 48 },
      })
      .setDepth(12);
    this.nextArrow = this.add
      .text(x + w / 2 - 36, y + h / 2 - 34, "▼", {
        fontFamily: "sans-serif",
        fontSize: "22px",
        color: "#ffffff",
      })
      .setDepth(12)
      .setVisible(false);
    this.tweens.add({
      targets: this.nextArrow,
      alpha: { from: 1, to: 0.2 },
      duration: 450,
      yoyo: true,
      repeat: -1,
    });
  }

  private startPage() {
    if (!this.job || !this.textObj) return;
    this.fullPageText = this.job.pages[this.job.pageIndex] ?? "";
    this.textObj.setText("");
    this.nextArrow?.setVisible(false);
    this.typing = true;
    let i = 0;
    this.charTimer?.remove();
    this.charTimer = this.time.addEvent({
      delay: TYPE_MS,
      repeat: this.fullPageText.length - 1,
      callback: () => {
        i += 1;
        this.textObj?.setText(this.fullPageText.slice(0, i));
        if (i >= this.fullPageText.length) {
          this.typing = false;
          this.nextArrow?.setVisible(true);
        }
      },
    });
  }

  private onAdvance() {
    if (this.listResolve) {
      this.resolveList(this.listIndex);
      return;
    }
    if (this.choiceResolve) {
      this.resolveChoice();
      return;
    }
    if (!this.job) return;
    if (this.typing) {
      /* 全文即時表示 (子供が連打しても1ページ飛ばさない) */
      this.charTimer?.remove();
      this.typing = false;
      this.textObj?.setText(this.fullPageText);
      this.nextArrow?.setVisible(true);
      return;
    }
    this.job.pageIndex += 1;
    if (this.job.pageIndex < this.job.pages.length) {
      this.startPage();
    } else {
      const onDone = this.job.onDone;
      this.closeWindow();
      /* 閉じてから完了通知 (連続イベントで再度開ける) */
      onDone();
    }
  }

  private closeWindow() {
    this.job = null;
    this.charTimer?.remove();
    this.windowFrame?.destroy();
    this.windowBox?.destroy();
    this.textObj?.destroy();
    this.nextArrow?.destroy();
    this.windowFrame = undefined;
    this.windowBox = undefined;
    this.textObj = undefined;
    this.nextArrow = undefined;
  }

  /* ---------- はい/いいえ ---------- */

  showChoice(prompt: string, onResult: (yes: boolean) => void): void {
    this.ensureWindow();
    this.textObj?.setText(prompt);
    this.typing = false;
    this.nextArrow?.setVisible(false);
    this.choiceSelected = true;
    this.choiceResolve = onResult;
    this.renderChoice();
  }

  private renderChoice() {
    this.choiceBox?.destroy();
    const x = GAME_WIDTH - 240;
    const y = GAME_HEIGHT - 260;
    const frame = this.add.rectangle(0, 0, 200, 110, 0xffffff, 1);
    const box = this.add.rectangle(0, 0, 192, 102, 0x000000, 0.92);
    const yes = this.add.text(-60, -30, `${this.choiceSelected ? "▶" : "　"} はい`, {
      fontFamily: "sans-serif",
      fontSize: "26px",
      color: "#ffffff",
    });
    const no = this.add.text(-60, 8, `${this.choiceSelected ? "　" : "▶"} いいえ`, {
      fontFamily: "sans-serif",
      fontSize: "26px",
      color: "#ffffff",
    });
    yes.setInteractive().on("pointerdown", (p: Phaser.Input.Pointer, lx: number, ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      this.choiceSelected = true;
      this.resolveChoice();
    });
    no.setInteractive().on("pointerdown", (p: Phaser.Input.Pointer, lx: number, ly: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      this.choiceSelected = false;
      this.resolveChoice();
    });
    this.choiceBox = this.add.container(x, y, [frame, box, yes, no]).setDepth(13);
  }

  private moveChoice() {
    if (!this.choiceResolve) return;
    this.choiceSelected = !this.choiceSelected;
    this.renderChoice();
  }

  private resolveChoice() {
    const resolve = this.choiceResolve;
    if (!resolve) return;
    this.choiceResolve = null;
    this.choiceBox?.destroy();
    this.choiceBox = undefined;
    const yes = this.choiceSelected;
    this.closeWindow();
    resolve(yes);
  }

  /* ---------- 選択リスト (道具屋・メニューなど) ---------- */

  /**
   * 選択肢のリストを表示する。決定で index、X キーで null を返す。
   * 呼び出し側が「やめる」相当の項目を入れておくのが親切。
   */
  showList(
    prompt: string,
    options: string[],
    onResult: (index: number | null) => void,
  ): void {
    this.ensureWindow();
    this.textObj?.setText(prompt);
    this.typing = false;
    this.charTimer?.remove();
    this.nextArrow?.setVisible(false);
    this.listOptions = options;
    this.listIndex = 0;
    this.listResolve = onResult;
    this.renderList();
  }

  private renderList() {
    this.listBox?.destroy();
    const lineH = 34;
    const w = 320;
    const h = this.listOptions.length * lineH + 28;
    const x = GAME_WIDTH - w / 2 - 60;
    const y = GAME_HEIGHT - 190 - h / 2;
    const frame = this.add.rectangle(0, 0, w + 8, h + 8, 0xffffff, 1);
    const box = this.add.rectangle(0, 0, w, h, 0x000000, 0.94);
    const children: Phaser.GameObjects.GameObject[] = [frame, box];
    this.listOptions.forEach((label, i) => {
      const text = this.add
        .text(
          -w / 2 + 18,
          -h / 2 + 14 + i * lineH,
          `${i === this.listIndex ? "▶" : "　"} ${label}`,
          { fontFamily: "sans-serif", fontSize: "24px", color: "#ffffff" },
        )
        .setInteractive();
      text.on(
        "pointerdown",
        (
          _p: Phaser.Input.Pointer,
          _lx: number,
          _ly: number,
          ev: Phaser.Types.Input.EventData,
        ) => {
          ev.stopPropagation();
          this.resolveList(i);
        },
      );
      children.push(text);
    });
    this.listBox = this.add.container(x, y, children).setDepth(13);
  }

  private moveList(delta: number) {
    if (!this.listResolve || this.listOptions.length === 0) return;
    const len = this.listOptions.length;
    this.listIndex = (this.listIndex + delta + len) % len;
    this.renderList();
  }

  private cancelList() {
    if (!this.listResolve) return;
    this.resolveList(null);
  }

  private resolveList(index: number | null) {
    const resolve = this.listResolve;
    if (!resolve) return;
    this.listResolve = null;
    this.listBox?.destroy();
    this.listBox = undefined;
    this.closeWindow();
    resolve(index);
  }

  /* ---------- マップ名トースト ---------- */

  showMapName(name: string): void {
    this.mapLabel?.destroy();
    this.mapLabel = this.add
      .text(GAME_WIDTH / 2, 48, name, {
        fontFamily: "sans-serif",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: { x: 18, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(15);
    this.time.delayedCall(1800, () => {
      this.mapLabel?.destroy();
      this.mapLabel = undefined;
    });
  }
}

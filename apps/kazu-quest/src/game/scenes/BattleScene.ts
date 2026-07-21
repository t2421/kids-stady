import Phaser, { Scene } from "phaser";
import type { BattleEvent, BattleState, PlayerCommand } from "../../lib/battle/battle";
import { applyVictory, createBattle, submitRound } from "../../lib/battle/battle";
import { getMonster } from "../../content/monsters";
import { getItem } from "../../content/items";
import { getSpell } from "../../content/spells";
import type { SpellDef } from "../../content/types";
import { mulberry32 } from "../../lib/curriculum/types";
import { recordAnswer } from "../../lib/save";
import { autosave, getSave, updateSave } from "../session";
import { monsterTextureKey } from "../textures";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { EventBus } from "../EventBus";

/*
 * DQ式一人称ターン制バトル。FieldScene を sleep したまま起動し、
 * 終了時に wake して結果 (won/lost/fled) を渡す。
 * 戦闘ロジックは src/lib/battle (純関数)。ここは演出だけ。
 */

export interface BattleLaunchData {
  monsterIds: string[];
  boss: boolean;
  winFlag?: string;
}

export interface BattleResult {
  outcome: "won" | "lost" | "fled";
  winFlag?: string;
}

type MenuKind = "root" | "item" | "spell";

interface MathPromptResultEvent {
  requestId: string;
  correct: boolean;
  timedOut: boolean;
  elapsedMs: number;
  problem: { skillId: string };
}

const COMMANDS = ["たたかう", "じゅもん", "どうぐ", "ぼうぎょ", "にげる"] as const;

export class BattleScene extends Scene {
  private battle!: BattleState;
  private launch!: BattleLaunchData;
  private rng = mulberry32((Math.random() * 2 ** 32) >>> 0);
  private enemySprites = new Map<string, Phaser.GameObjects.Image>();
  private msgText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private menuIndex = 0;
  private menuKind: MenuKind = "root";
  private busy = false;

  constructor() {
    super("Battle");
  }

  init(data: BattleLaunchData) {
    this.launch = data;
    const monsters = data.monsterIds
      .map((id) => getMonster(id))
      .filter((m): m is NonNullable<typeof m> => !!m);
    this.battle = createBattle(getSave().party, monsters, data.boss);
    this.menuIndex = 0;
    this.menuKind = "root";
    this.busy = false;
    this.enemySprites.clear();
  }

  create() {
    /* 背景: 夜のフィールド風 */
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0b1e3a, 1);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 90, GAME_WIDTH, 180, 0x11305a, 1);

    /* 敵スプライト (中央に横並び・拡大表示) */
    const living = this.battle.enemies;
    const spacing = Math.min(220, (GAME_WIDTH - 200) / Math.max(1, living.length));
    const startX = GAME_WIDTH / 2 - (spacing * (living.length - 1)) / 2;
    living.forEach((enemy, i) => {
      const monster = getMonster(enemy.monsterId)!;
      const sprite = this.add
        .image(startX + i * spacing, GAME_HEIGHT * 0.42, monsterTextureKey(monster.art))
        .setScale(7);
      this.enemySprites.set(enemy.id, sprite);
      this.tweens.add({
        targets: sprite,
        y: sprite.y - 6,
        duration: 900 + i * 120,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    /* メッセージウィンドウ + ステータス */
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 84, GAME_WIDTH - 60, 152, 0xffffff, 1);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 84, GAME_WIDTH - 68, 144, 0x000000, 0.94);
    this.msgText = this.add.text(70, GAME_HEIGHT - 148, "", {
      fontFamily: "sans-serif",
      fontSize: "24px",
      color: "#ffffff",
      lineSpacing: 8,
      wordWrap: { width: GAME_WIDTH - 420 },
    });
    this.statusText = this.add.text(GAME_WIDTH - 240, GAME_HEIGHT - 148, "", {
      fontFamily: "sans-serif",
      fontSize: "22px",
      color: "#7cfc9a",
      lineSpacing: 8,
    });

    const keyboard = this.input.keyboard!;
    keyboard.on("keydown-UP", () => this.moveCursor(-1));
    keyboard.on("keydown-DOWN", () => this.moveCursor(1));
    keyboard.on("keydown-Z", () => this.confirm());
    keyboard.on("keydown-ENTER", () => this.confirm());
    keyboard.on("keydown-SPACE", () => this.confirm());
    keyboard.on("keydown-X", () => this.cancelMenu());

    this.updateStatus();
    this.showIntro();
    EventBus.emit("current-scene-ready", this);
  }

  /* ---------- メニュー ---------- */

  private showIntro() {
    this.busy = true;
    const names = [...new Set(this.battle.enemies.map((e) => e.name))].join(" と ");
    this.msgText.setText(`${names}が あらわれた!`);
    this.time.delayedCall(900, () => {
      this.busy = false;
      this.showRootMenu();
    });
  }

  private clearMenu() {
    this.menuTexts.forEach((t) => t.destroy());
    this.menuTexts = [];
  }

  private showRootMenu() {
    this.clearMenu();
    this.menuKind = "root";
    this.msgText.setText("どうする?");
    COMMANDS.forEach((label, i) => {
      const text = this.add
        .text(GAME_WIDTH - 420, GAME_HEIGHT - 148 + i * 26, this.menuLabel(label, i), {
          fontFamily: "sans-serif",
          fontSize: "22px",
          color: "#ffffff",
        })
        .setInteractive();
      text.on("pointerdown", () => {
        this.menuIndex = i;
        this.refreshMenu();
        this.confirm();
      });
      this.menuTexts.push(text);
    });
    this.menuIndex = 0;
    this.refreshMenu();
  }

  private menuLabel(label: string, index: number): string {
    return `${index === this.menuIndex ? "▶" : "　"} ${label}`;
  }

  private refreshMenu() {
    const labels: readonly string[] =
      this.menuKind === "root"
        ? COMMANDS
        : this.menuKind === "spell"
          ? this.learnedSpells().map((s) => `${s.name} (MP${s.mpCost})`)
          : this.itemLabels();
    this.menuTexts.forEach((t, i) => {
      t.setText(this.menuLabel(labels[i] ?? "", i));
    });
  }

  private itemLabels(): string[] {
    const save = getSave();
    return Object.entries(save.inventory.items)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => `${getItem(id)?.name ?? id} ×${count}`);
  }

  private moveCursor(delta: number) {
    if (this.busy || this.menuTexts.length === 0) return;
    const len = this.menuTexts.length;
    this.menuIndex = (this.menuIndex + delta + len) % len;
    this.refreshMenu();
  }

  private cancelMenu() {
    if (this.busy) return;
    if (this.menuKind === "item" || this.menuKind === "spell") this.showRootMenu();
  }

  private learnedSpells(): SpellDef[] {
    const hero = getSave().party.find((m) => m.memberId === "hero");
    return (hero?.learnedSpells ?? [])
      .map((id) => getSpell(id))
      .filter((s): s is SpellDef => !!s);
  }

  private showSpellMenu() {
    this.clearMenu();
    this.menuKind = "spell";
    const spells = this.learnedSpells();
    spells.forEach((spell, i) => {
      const text = this.add
        .text(
          GAME_WIDTH - 420,
          GAME_HEIGHT - 148 + i * 26,
          this.menuLabel(`${spell.name} (MP${spell.mpCost})`, i),
          {
            fontFamily: "sans-serif",
            fontSize: "22px",
            color: "#ffffff",
          },
        )
        .setInteractive();
      text.on("pointerdown", () => {
        this.menuIndex = i;
        this.refreshMenu();
        this.confirm();
      });
      this.menuTexts.push(text);
    });
    this.menuIndex = 0;
    this.refreshMenu();
    this.msgText.setText("どの じゅもんを つかう?");
  }

  /* 呪文選択 → 算数プロンプト (React) → 結果でラウンド解決 (設計 A3) */
  private castWithMathPrompt(spell: SpellDef) {
    this.busy = true;
    this.clearMenu();
    this.msgText.setText(`${spell.name}の じゅもんを となえる…`);
    const requestId = `battle-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

    const onResult = (result: MathPromptResultEvent) => {
      if (result.requestId !== requestId) return;
      EventBus.off("math-result", onResult);

      /* テレメトリ: 全解答箇所から recordAnswer (設計 A6) */
      updateSave((s) =>
        recordAnswer(s, result.problem.skillId, result.correct, result.elapsedMs),
      );
      autosave();

      const critical =
        result.correct && result.elapsedMs <= spell.battleTimeLimitMs / 2;
      const target =
        spell.kind === "attack" ? this.firstEnemyId() : "hero";
      this.runRound({
        kind: "spell",
        memberId: "hero",
        spell,
        targetId: target,
        outcome: { correct: result.correct, critical },
      });
    };
    EventBus.on("math-result", onResult);
    EventBus.emit("math-prompt", {
      requestId,
      skillIds: spell.skillIds,
      timeLimitMs: spell.battleTimeLimitMs,
      context: "battle",
    });
  }

  private confirm() {
    if (this.busy || this.menuTexts.length === 0) return;

    if (this.menuKind === "root") {
      const command = COMMANDS[this.menuIndex];
      if (command === "たたかう") {
        this.runRound({ kind: "attack", memberId: "hero", targetId: this.firstEnemyId() });
      } else if (command === "じゅもん") {
        const spells = this.learnedSpells();
        if (spells.length === 0) {
          this.flashMessage("まだ じゅもんを おぼえていない!");
          return;
        }
        this.showSpellMenu();
      } else if (command === "どうぐ") {
        const items = this.itemLabels();
        if (items.length === 0) {
          this.flashMessage("どうぐを もっていない!");
          return;
        }
        this.showItemMenu();
      } else if (command === "ぼうぎょ") {
        this.runRound({ kind: "defend", memberId: "hero" });
      } else if (command === "にげる") {
        this.runRound({ kind: "flee", memberId: "hero" });
      }
    } else if (this.menuKind === "spell") {
      const spell = this.learnedSpells()[this.menuIndex];
      if (!spell) return;
      const hero = this.battle.members[0];
      if (hero.mp < spell.mpCost) {
        this.flashMessage("MPが たりない!");
        return;
      }
      this.castWithMathPrompt(spell);
    } else if (this.menuKind === "item") {
      const save = getSave();
      const usable = Object.entries(save.inventory.items).filter(([, c]) => c > 0);
      const [itemId] = usable[this.menuIndex] ?? [];
      if (!itemId) return;
      const item = getItem(itemId);
      if (!item || item.kind !== "heal") {
        this.flashMessage("いまは つかえない!");
        return;
      }
      updateSave((s) => ({
        ...s,
        inventory: {
          ...s.inventory,
          items: { ...s.inventory.items, [itemId]: s.inventory.items[itemId] - 1 },
        },
      }));
      this.runRound({ kind: "item", memberId: "hero", itemId, heal: item.power ?? 0 });
    }
  }

  private showItemMenu() {
    this.clearMenu();
    this.menuKind = "item";
    const labels = this.itemLabels();
    labels.forEach((label, i) => {
      const text = this.add
        .text(GAME_WIDTH - 420, GAME_HEIGHT - 148 + i * 26, this.menuLabel(label, i), {
          fontFamily: "sans-serif",
          fontSize: "22px",
          color: "#ffffff",
        })
        .setInteractive();
      text.on("pointerdown", () => {
        this.menuIndex = i;
        this.refreshMenu();
        this.confirm();
      });
      this.menuTexts.push(text);
    });
    this.menuIndex = 0;
    this.refreshMenu();
    this.msgText.setText("どの どうぐを つかう?");
  }

  private flashMessage(text: string) {
    this.msgText.setText(text);
    this.busy = true;
    this.time.delayedCall(900, () => {
      this.busy = false;
      this.showRootMenu();
    });
  }

  private firstEnemyId(): string {
    return this.battle.enemies.find((e) => e.hp > 0)?.id ?? this.battle.enemies[0].id;
  }

  /* ---------- ラウンド解決と演出 ---------- */

  private runRound(command: PlayerCommand) {
    this.busy = true;
    this.clearMenu();
    const { state, events } = submitRound(this.battle, [command], this.rng);
    this.battle = state;
    this.playEvents(events, 0);
  }

  private playEvents(events: BattleEvent[], index: number) {
    if (index >= events.length) {
      this.updateStatus();
      if (this.battle.phase === "command") {
        this.busy = false;
        this.showRootMenu();
      }
      return;
    }
    const event = events[index];
    const next = () => this.playEvents(events, index + 1);

    switch (event.type) {
      case "message":
        this.msgText.setText(event.text);
        this.time.delayedCall(750, next);
        break;
      case "attack": {
        if (!event.onParty) {
          const sprite = this.enemySprites.get(event.targetId);
          if (sprite) {
            this.tweens.add({ targets: sprite, alpha: 0.2, duration: 70, yoyo: true, repeat: 2 });
            if (event.killed) {
              this.tweens.add({ targets: sprite, alpha: 0, scale: 0, duration: 350, delay: 250 });
            }
          }
        } else {
          this.cameras.main.shake(180, 0.008);
        }
        this.msgText.setText(`${event.damage} の ダメージ!`);
        this.updateStatus();
        this.time.delayedCall(750, next);
        break;
      }
      case "spellSuccess":
        this.msgText.setText(
          event.critical
            ? `${event.actorName}は ${event.spellName}を となえた! かいしん!`
            : `${event.actorName}は ${event.spellName}を となえた!`,
        );
        this.cameras.main.flash(200, 255, 255, 180);
        this.time.delayedCall(800, next);
        break;
      case "spellFizzle":
        this.msgText.setText(`${event.actorName}は ${event.spellName}を となえた…`);
        this.time.delayedCall(700, next);
        break;
      case "heal":
        this.msgText.setText(`HPが ${event.amount} かいふくした!`);
        this.updateStatus();
        this.time.delayedCall(700, next);
        break;
      case "fleeFailed":
        this.time.delayedCall(100, next);
        break;
      case "fled":
        this.endBattle({ outcome: "fled" });
        break;
      case "victory": {
        const save = getSave();
        const result = applyVictory(save.party, this.battle, event.exp, event.gold);
        updateSave((s) => ({
          ...s,
          party: result.party,
          inventory: { ...s.inventory, gold: s.inventory.gold + result.gold },
        }));
        autosave();
        const lines = [`けいけんち ${event.exp} と ${event.gold}ゴールドを てにいれた!`];
        for (const up of result.levelUps) {
          lines.push(`レベルが ${up.to} に あがった! げんきも かいふくした!`);
        }
        this.showLinesThen(lines, () =>
          this.endBattle({ outcome: "won", winFlag: this.launch.winFlag }),
        );
        break;
      }
      case "defeat":
        this.time.delayedCall(600, () => this.endBattle({ outcome: "lost" }));
        break;
    }
  }

  private showLinesThen(lines: string[], done: () => void) {
    if (lines.length === 0) {
      done();
      return;
    }
    this.msgText.setText(lines[0]);
    this.updateStatus();
    this.time.delayedCall(1100, () => this.showLinesThen(lines.slice(1), done));
  }

  private updateStatus() {
    const hero = this.battle.members[0];
    this.statusText.setText(`ゆうしゃ\nHP ${hero.hp}/${hero.maxHp}\nMP ${hero.mp}/${hero.maxMp}`);
  }

  private endBattle(result: BattleResult) {
    /* HP/MP を戦闘結果でセーブへ反映 (勝利時は applyVictory 済み) */
    if (result.outcome !== "won") {
      updateSave((s) => ({
        ...s,
        party: s.party.map((m) => {
          const c = this.battle.members.find((x) => x.id === m.memberId);
          return c ? { ...m, hp: c.hp, mp: c.mp } : m;
        }),
      }));
      autosave();
    }
    this.scene.stop();
    this.scene.wake("Field", result);
  }
}

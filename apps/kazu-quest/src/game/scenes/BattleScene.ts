import Phaser, { Scene } from "phaser";
import type { BattleEvent, BattleState, PlayerCommand } from "../../lib/battle/battle";
import { applyVictory, createBattle, submitRound } from "../../lib/battle/battle";
import { getMonster } from "../../content/monsters";
import { getItem } from "../../content/items";
import { getSpell } from "../../content/spells";
import { getChapter } from "../../content/chapters";
import type { SpellDef } from "../../content/types";
import { mulberry32 } from "../../lib/curriculum/types";
import { autosave, getSave, updateSave } from "../session";
import { monsterTextureKey } from "../textures";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { EventBus } from "../EventBus";
import { BattleMenu } from "../battle/BattleMenu";
import { requestBattleMath } from "../battle/mathRequest";

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

const COMMANDS = ["たたかう", "じゅもん", "どうぐ", "ぼうぎょ", "にげる"] as const;

/* 通常攻撃の出題は易しめ・短めの制限時間でテンポを保つ (設計変更 2026-07-22) */
const ATTACK_TIME_LIMIT_MS = 10000;

export class BattleScene extends Scene {
  private battle!: BattleState;
  private launch!: BattleLaunchData;
  private rng = mulberry32((Math.random() * 2 ** 32) >>> 0);
  private enemySprites = new Map<string, Phaser.GameObjects.Image>();
  private msgText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private menu!: BattleMenu;
  private menuKind: MenuKind = "root";
  private busy = false;
  /* 演出用の表示HP/MP。ラウンドは一括計算されるため、実際の値 (battle.members)
     を直接出すと「自分の攻撃で自分のHPが減って見える」— イベントごとに増分更新する */
  private displayHp = 0;
  private displayMp = 0;

  constructor() {
    super("Battle");
  }

  /* E2E がメニュー操作を状態駆動するための観測面 */
  get menuIndex(): number {
    return this.menu?.index ?? 0;
  }

  init(data: BattleLaunchData) {
    this.launch = data;
    const monsters = data.monsterIds
      .map((id) => getMonster(id))
      .filter((m): m is NonNullable<typeof m> => !!m);
    this.battle = createBattle(getSave().party, monsters, data.boss);
    this.menuKind = "root";
    this.busy = false;
    this.displayHp = this.battle.members[0]?.hp ?? 0;
    this.displayMp = this.battle.members[0]?.mp ?? 0;
    this.enemySprites.clear();
  }

  create() {
    this.buildStage();
    this.menu = new BattleMenu(this, GAME_WIDTH - 420, GAME_HEIGHT - 148, (i) =>
      this.onMenuSelect(i),
    );

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

  /* ---------- 舞台とステータス ---------- */

  private buildStage() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0b1e3a, 1);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 90, GAME_WIDTH, 180, 0x11305a, 1);

    const enemies = this.battle.enemies;
    const spacing = Math.min(220, (GAME_WIDTH - 200) / Math.max(1, enemies.length));
    const startX = GAME_WIDTH / 2 - (spacing * (enemies.length - 1)) / 2;
    enemies.forEach((enemy, i) => {
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
  }

  private updateStatus() {
    const hero = this.battle.members[0];
    this.statusText.setText(
      `ゆうしゃ\nHP ${this.displayHp}/${hero.maxHp}\nMP ${this.displayMp}/${hero.maxMp}`,
    );
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

  private showRootMenu() {
    this.menuKind = "root";
    this.msgText.setText("どうする?");
    this.menu.show([...COMMANDS]);
  }

  private showSpellMenu() {
    this.menuKind = "spell";
    this.msgText.setText("どの じゅもんを つかう?");
    this.menu.show(
      this.learnedSpells().map((s) => `${s.name} (MP${s.mpCost})`),
    );
  }

  private showItemMenu() {
    this.menuKind = "item";
    this.msgText.setText("どの どうぐを つかう?");
    this.menu.show(this.itemLabels());
  }

  private itemLabels(): string[] {
    return Object.entries(getSave().inventory.items)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => `${getItem(id)?.name ?? id} ×${count}`);
  }

  private learnedSpells(): SpellDef[] {
    const hero = getSave().party.find((m) => m.memberId === "hero");
    return (hero?.learnedSpells ?? [])
      .map((id) => getSpell(id))
      .filter((s): s is SpellDef => !!s);
  }

  private moveCursor(delta: number) {
    if (this.busy) return;
    this.menu.move(delta);
  }

  private confirm() {
    if (this.busy) return;
    this.menu.confirm();
  }

  private cancelMenu() {
    if (this.busy) return;
    if (this.menuKind === "item" || this.menuKind === "spell") this.showRootMenu();
  }

  private flashMessage(text: string) {
    this.msgText.setText(text);
    this.busy = true;
    this.time.delayedCall(900, () => {
      this.busy = false;
      this.showRootMenu();
    });
  }

  private onMenuSelect(index: number) {
    if (this.busy) return;
    if (this.menuKind === "root") {
      this.onRootCommand(COMMANDS[index]);
    } else if (this.menuKind === "spell") {
      const spell = this.learnedSpells()[index];
      if (spell) this.castSpell(spell);
    } else {
      this.useItem(index);
    }
  }

  private onRootCommand(command: (typeof COMMANDS)[number]) {
    if (command === "たたかう") {
      this.attack();
    } else if (command === "じゅもん") {
      if (this.learnedSpells().length === 0) {
        this.flashMessage("まだ じゅもんを おぼえていない!");
        return;
      }
      this.showSpellMenu();
    } else if (command === "どうぐ") {
      if (this.itemLabels().length === 0) {
        this.flashMessage("どうぐを もっていない!");
        return;
      }
      this.showItemMenu();
    } else if (command === "ぼうぎょ") {
      this.runRound({ kind: "defend", memberId: "hero" });
    } else if (command === "にげる") {
      this.runRound({ kind: "flee", memberId: "hero" });
    }
  }

  /* ---------- コマンド実行 (算数プロンプト連携) ---------- */

  /* 通常攻撃も基礎問題を出題。正解=命中、素早い正解=かいしん、不正解=外す */
  private attack() {
    this.busy = true;
    this.menu.clear();
    this.msgText.setText("こうげき!");
    const chapter = getChapter(getSave().chapter.current);
    const skillIds = chapter?.attackSkillIds ?? ["g1_add_nc", "g1_sub_nc"];
    requestBattleMath("attack", skillIds, ATTACK_TIME_LIMIT_MS, (outcome) => {
      this.runRound({
        kind: "attack",
        memberId: "hero",
        targetId: this.firstEnemyId(),
        outcome,
      });
    });
  }

  /* 呪文: 単元問題に正解で発動 (設計 A3) */
  private castSpell(spell: SpellDef) {
    const hero = this.battle.members[0];
    if (hero.mp < spell.mpCost) {
      this.flashMessage("MPが たりない!");
      return;
    }
    this.busy = true;
    this.menu.clear();
    this.msgText.setText(`${spell.name}の じゅもんを となえる…`);
    requestBattleMath("spell", spell.skillIds, spell.battleTimeLimitMs, (outcome) => {
      this.runRound({
        kind: "spell",
        memberId: "hero",
        spell,
        targetId: spell.kind === "attack" ? this.firstEnemyId() : "hero",
        outcome,
      });
    });
  }

  private useItem(index: number) {
    const usable = Object.entries(getSave().inventory.items).filter(
      ([, c]) => c > 0,
    );
    const [itemId] = usable[index] ?? [];
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

  private firstEnemyId(): string {
    return this.battle.enemies.find((e) => e.hp > 0)?.id ?? this.battle.enemies[0].id;
  }

  /* ---------- ラウンド解決と演出 ---------- */

  private runRound(command: PlayerCommand) {
    this.busy = true;
    this.menu.clear();
    const { state, events } = submitRound(this.battle, [command], this.rng);
    this.battle = state;
    this.playEvents(events, 0);
  }

  private playEvents(events: BattleEvent[], index: number) {
    if (index >= events.length) {
      /* 演出終了: 表示を実際の値に同期してからコマンドへ戻す */
      const hero = this.battle.members[0];
      this.displayHp = hero.hp;
      this.displayMp = hero.mp;
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
      case "attack":
        this.playAttack(event, next);
        break;
      case "spellSuccess":
        this.msgText.setText(
          event.critical
            ? `${event.actorName}は ${event.spellName}を となえた! かいしん!`
            : `${event.actorName}は ${event.spellName}を となえた!`,
        );
        this.displayMp = event.mpLeft;
        this.updateStatus();
        this.cameras.main.flash(200, 255, 255, 180);
        this.time.delayedCall(800, next);
        break;
      case "spellFizzle":
        this.msgText.setText(`${event.actorName}は ${event.spellName}を となえた…`);
        this.time.delayedCall(700, next);
        break;
      case "heal":
        if (event.onParty && event.targetId === "hero") {
          const hero = this.battle.members[0];
          this.displayHp = Math.min(hero.maxHp, this.displayHp + event.amount);
        }
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
      case "victory":
        this.playVictory(event);
        break;
      case "defeat":
        this.time.delayedCall(600, () => this.endBattle({ outcome: "lost" }));
        break;
    }
  }

  private playAttack(
    event: Extract<BattleEvent, { type: "attack" }>,
    next: () => void,
  ) {
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
      /* 味方が受けたダメージだけ表示HPを減らす (このイベントの分のみ) */
      if (event.targetId === "hero") {
        this.displayHp = Math.max(0, this.displayHp - event.damage);
      }
    }
    this.msgText.setText(`${event.damage} の ダメージ!`);
    this.updateStatus();
    this.time.delayedCall(750, next);
  }

  private playVictory(event: Extract<BattleEvent, { type: "victory" }>) {
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
    /* レベルアップの全回復を表示にも反映する */
    const heroAfter = result.party.find((m) => m.memberId === "hero");
    if (heroAfter) {
      this.displayHp = heroAfter.hp;
      this.displayMp = heroAfter.mp;
    }
    this.showLinesThen(lines, () =>
      this.endBattle({ outcome: "won", winFlag: this.launch.winFlag }),
    );
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

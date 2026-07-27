import Phaser, { Scene } from "phaser";
import type { BattleEvent, BattleState, Combatant, PlayerCommand } from "../../lib/battle/battle";
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
import { getMapDef, hasMap } from "../../content/maps";
import {
  addEnemyShadow,
  buildBattleBackdrop,
  playBuffFx,
  playEnemyAttackFx,
  playHealFx,
  playSlashFx,
  playSpellAttackFx,
  spawnDamagePopup,
  spawnImpactBurst,
  spawnVictorySparkles,
} from "../battle/battleFx";
import { SPELLS } from "../../content/spells";

/*
 * DQ式一人称ターン制バトル。FieldScene を sleep したまま起動し、
 * 終了時に wake して結果 (won/lost/fled) を渡す。
 * 戦闘ロジックは src/lib/battle (純関数)。ここは演出だけ。
 *
 * パーティ戦 (第2章〜): 生存メンバー全員のコマンドを順番に集めてから
 * 1ラウンドを一括解決する (DQと同じ)。問題に答えるのは常にプレイヤー。
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
  /* このラウンドで集めたコマンド (生存メンバー1人につき1つ) */
  private roundCommands: PlayerCommand[] = [];
  private commandIndex = 0;
  /* 演出用の表示HP/MP (メンバー別)。ラウンドは一括計算されるため、実際の値を
     直接出すと「自分の攻撃で自分のHPが減って見える」— イベントごとに増分更新する */
  private display = new Map<string, { hp: number; mp: number }>();
  /* 直前の spellSuccess で予約した攻撃エフェクト (次の attack イベントで再生) */
  private pendingSpellFxId: string | null = null;
  /* かいしん予約 (メッセージ/呪文イベントで立て、次の attack で強調表示) */
  private pendingCrit = false;

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
    this.roundCommands = [];
    this.commandIndex = 0;
    this.display = new Map(
      this.battle.members.map((m) => [m.id, { hp: m.hp, mp: m.mp }]),
    );
    this.enemySprites.clear();
    this.pendingSpellFxId = null;
    this.pendingCrit = false;
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

  /* ---------- パーティ ---------- */

  private livingMembers(): Combatant[] {
    return this.battle.members.filter((m) => m.hp > 0);
  }

  private currentMember(): Combatant {
    const living = this.livingMembers();
    return living[Math.min(this.commandIndex, living.length - 1)] ?? this.battle.members[0];
  }

  private learnedSpells(memberId: string): SpellDef[] {
    const member = getSave().party.find((m) => m.memberId === memberId);
    return (member?.learnedSpells ?? [])
      .map((id) => getSpell(id))
      .filter((s): s is SpellDef => !!s);
  }

  /* 単体回復の相手: いちばん弱っている生存メンバー (子供向けに自動選択) */
  private weakestMemberId(): string {
    const living = this.livingMembers();
    let best = living[0];
    for (const m of living) {
      if (m.hp / m.maxHp < best.hp / best.maxHp) best = m;
    }
    return best?.id ?? "hero";
  }

  /* ---------- 舞台とステータス ---------- */

  private buildStage() {
    /* 戦闘に入ったフィールドのテーマで背景を描き分ける */
    const mapId = getSave().location.mapId;
    const theme = hasMap(mapId) ? getMapDef(mapId).theme : "grass";
    buildBattleBackdrop(this, theme);

    const enemies = this.battle.enemies;
    const spacing = Math.min(220, (GAME_WIDTH - 200) / Math.max(1, enemies.length));
    const startX = GAME_WIDTH / 2 - (spacing * (enemies.length - 1)) / 2;
    enemies.forEach((enemy, i) => {
      const monster = getMonster(enemy.monsterId)!;
      const x = startX + i * spacing;
      const y = GAME_HEIGHT * 0.42;
      addEnemyShadow(this, x, y + 62);
      const sprite = this.add
        .image(x, y, monsterTextureKey(monster.art))
        .setScale(0);
      this.enemySprites.set(enemy.id, sprite);
      /* 登場ポップ → ゆらゆら待機 */
      this.tweens.add({
        targets: sprite,
        scale: 7,
        duration: 320,
        delay: 120 + i * 110,
        ease: "Back.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: sprite,
            y: y - 6,
            duration: 900 + i * 120,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        },
      });
    });

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 84, GAME_WIDTH - 60, 152, 0xffffff, 1);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 84, GAME_WIDTH - 68, 144, 0x000000, 0.94);
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 84, GAME_WIDTH - 78, 134)
      .setStrokeStyle(2, 0x8aa5d5, 0.9);
    this.msgText = this.add.text(70, GAME_HEIGHT - 148, "", {
      fontFamily: "sans-serif",
      fontSize: "24px",
      color: "#ffffff",
      lineSpacing: 8,
      wordWrap: { width: GAME_WIDTH - 460 },
    });
    this.statusText = this.add.text(GAME_WIDTH - 250, GAME_HEIGHT - 150, "", {
      fontFamily: "sans-serif",
      fontSize: "19px",
      color: "#7cfc9a",
      lineSpacing: 4,
    });
  }

  private updateStatus() {
    const lines: string[] = [];
    for (const member of this.battle.members) {
      const d = this.display.get(member.id) ?? { hp: member.hp, mp: member.mp };
      const marker =
        !this.busy && this.menuKind === "root" && this.currentMember().id === member.id
          ? "▶"
          : "　";
      lines.push(`${marker}${member.name}`);
      lines.push(`　HP ${d.hp}/${member.maxHp}  MP ${d.mp}/${member.maxMp}`);
    }
    this.statusText.setText(lines.join("\n"));
  }

  /* ---------- メニュー (メンバーごとにコマンドを集める) ---------- */

  private showIntro() {
    this.busy = true;
    const names = [...new Set(this.battle.enemies.map((e) => e.name))].join(" と ");
    this.msgText.setText(`${names}が あらわれた!`);
    this.time.delayedCall(900, () => {
      this.busy = false;
      this.startCommandPhase();
    });
  }

  /* 新しいラウンドのコマンド収集を最初のメンバーから始める */
  private startCommandPhase() {
    this.roundCommands = [];
    this.commandIndex = 0;
    this.showRootMenu();
  }

  private showRootMenu() {
    this.menuKind = "root";
    this.msgText.setText(`${this.currentMember().name}は どうする?`);
    this.menu.show([...COMMANDS]);
    this.updateStatus();
  }

  /* コマンド確定 → 次のメンバーへ。全員そろったらラウンド解決 */
  private queueCommand(command: PlayerCommand) {
    this.roundCommands.push(command);
    this.commandIndex += 1;
    if (this.commandIndex < this.livingMembers().length) {
      this.busy = false;
      this.showRootMenu();
      return;
    }
    this.runRound(this.roundCommands);
  }

  private showSpellMenu() {
    this.menuKind = "spell";
    this.msgText.setText(`${this.currentMember().name}は どの じゅもんを つかう?`);
    this.menu.show(
      this.learnedSpells(this.currentMember().id).map(
        (s) => `${s.name} (MP${s.mpCost})`,
      ),
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
      const spell = this.learnedSpells(this.currentMember().id)[index];
      if (spell) this.castSpell(spell);
    } else {
      this.useItem(index);
    }
  }

  private onRootCommand(command: (typeof COMMANDS)[number]) {
    const memberId = this.currentMember().id;
    if (command === "たたかう") {
      this.attack();
    } else if (command === "じゅもん") {
      if (this.learnedSpells(memberId).length === 0) {
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
      this.queueCommand({ kind: "defend", memberId });
    } else if (command === "にげる") {
      /* にげるはその場でラウンド解決 (残りメンバーの入力は不要) */
      this.runRound([...this.roundCommands, { kind: "flee", memberId }]);
    }
  }

  /* ---------- コマンド実行 (算数プロンプト連携) ---------- */

  /* 通常攻撃も基礎問題を出題。正解=命中、素早い正解=かいしん、不正解=外す */
  private attack() {
    const memberId = this.currentMember().id;
    this.busy = true;
    this.menu.clear();
    this.msgText.setText(`${this.currentMember().name}の こうげき!`);
    const chapter = getChapter(getSave().chapter.current);
    const skillIds = chapter?.attackSkillIds ?? ["g1_add_nc", "g1_sub_nc"];
    requestBattleMath("attack", skillIds, ATTACK_TIME_LIMIT_MS, (outcome) => {
      this.queueCommand({
        kind: "attack",
        memberId,
        targetId: this.firstEnemyId(),
        outcome,
      });
    });
  }

  /* 呪文: 単元問題に正解で発動 (設計 A3) */
  private castSpell(spell: SpellDef) {
    const member = this.currentMember();
    if (member.mp < spell.mpCost) {
      this.flashMessage("MPが たりない!");
      return;
    }
    this.busy = true;
    this.menu.clear();
    this.msgText.setText(`${spell.name}の じゅもんを となえる…`);
    requestBattleMath("spell", spell.skillIds, spell.battleTimeLimitMs, (outcome) => {
      const targetId =
        spell.kind === "attack" || spell.kind === "debuff"
          ? this.firstEnemyId()
          : spell.kind === "heal"
            ? this.weakestMemberId()
            : member.id;
      this.queueCommand({
        kind: "spell",
        memberId: member.id,
        spell,
        targetId,
        outcome,
      });
    });
  }

  private useItem(index: number) {
    const memberId = this.currentMember().id;
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
    this.busy = true;
    this.menu.clear();
    this.queueCommand({ kind: "item", memberId, itemId, heal: item.power ?? 0 });
  }

  private firstEnemyId(): string {
    return this.battle.enemies.find((e) => e.hp > 0)?.id ?? this.battle.enemies[0].id;
  }

  /* ---------- ラウンド解決と演出 ---------- */

  private runRound(commands: PlayerCommand[]) {
    this.busy = true;
    this.menu.clear();
    const { state, events } = submitRound(this.battle, commands, this.rng);
    this.battle = state;
    this.playEvents(events, 0);
  }

  private playEvents(events: BattleEvent[], index: number) {
    if (index >= events.length) {
      /* 演出終了: 表示を実際の値に同期してからコマンドへ戻す */
      for (const member of this.battle.members) {
        this.display.set(member.id, { hp: member.hp, mp: member.mp });
      }
      this.updateStatus();
      if (this.battle.phase === "command") {
        this.busy = false;
        this.startCommandPhase();
      }
      return;
    }
    const event = events[index];
    const next = () => this.playEvents(events, index + 1);

    switch (event.type) {
      case "message":
        /* 「かいしんの いちげき!」の次の attack を強調表示する */
        if (event.text.includes("かいしんの いちげき")) this.pendingCrit = true;
        this.msgText.setText(event.text);
        this.time.delayedCall(750, next);
        break;
      case "attack":
        this.playAttack(event, next);
        break;
      case "spellSuccess": {
        this.msgText.setText(
          event.critical
            ? `${event.actorName}は ${event.spellName}を となえた! かいしん!`
            : `${event.actorName}は ${event.spellName}を となえた!`,
        );
        const d = this.display.get(event.actorId);
        if (d) d.mp = event.mpLeft;
        this.updateStatus();
        /* 呪文の種類でエフェクトを予約/再生する */
        const spell = Object.values(SPELLS).find((s) => s.name === event.spellName);
        this.pendingCrit = event.critical;
        if (spell?.kind === "buff") {
          playBuffFx(this);
        } else if (spell?.kind === "attack" || spell?.kind === "debuff") {
          this.pendingSpellFxId = spell.id;
        }
        this.cameras.main.flash(160, 255, 255, 190);
        this.time.delayedCall(800, next);
        break;
      }
      case "spellFizzle":
        this.msgText.setText(`${event.actorName}は ${event.spellName}を となえた…`);
        this.time.delayedCall(700, next);
        break;
      case "heal": {
        if (event.onParty) {
          const member = this.battle.members.find((m) => m.id === event.targetId);
          const d = this.display.get(event.targetId);
          if (member && d) {
            d.hp = Math.min(member.maxHp, d.hp + event.amount);
          }
          playHealFx(this);
          spawnDamagePopup(
            this,
            GAME_WIDTH / 2,
            GAME_HEIGHT - 200,
            `+${event.amount}`,
            "#8cf5a2",
          );
        }
        this.msgText.setText(`HPが ${event.amount} かいふくした!`);
        this.updateStatus();
        this.time.delayedCall(700, next);
        break;
      }
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
    const showDamage = () => {
      this.msgText.setText(`${event.damage} の ダメージ!`);
      this.updateStatus();
      this.time.delayedCall(750, next);
    };

    if (!event.onParty) {
      const sprite = this.enemySprites.get(event.targetId);
      const crit = this.pendingCrit;
      this.pendingCrit = false;
      const spellFxId = this.pendingSpellFxId;
      this.pendingSpellFxId = null;

      /* 着弾の瞬間の表示 (点滅・ノックバック・ダメージ数字) */
      const impact = (withWhiteBurst: boolean) => {
        if (sprite) {
          if (withWhiteBurst) spawnImpactBurst(this, sprite.x, sprite.y);
          spawnDamagePopup(
            this,
            sprite.x,
            sprite.y - 50,
            `${event.damage}`,
            crit ? "#ffe066" : "#ffffff",
            crit,
          );
          if (crit) this.cameras.main.shake(170, 0.007);
          this.tweens.add({ targets: sprite, alpha: 0.2, duration: 70, yoyo: true, repeat: 2 });
          this.tweens.add({
            targets: sprite,
            x: sprite.x + (crit ? 20 : 14),
            duration: 60,
            yoyo: true,
            repeat: 1,
          });
          if (event.killed) {
            this.tweens.add({ targets: sprite, alpha: 0, scale: 0, duration: 350, delay: 250 });
          }
        }
        showDamage();
      };

      if (sprite && spellFxId) {
        /* 呪文: 弾や斬撃が届いてからダメージ (バーストはエフェクト側が出す) */
        playSpellAttackFx(this, spellFxId, sprite.x, sprite.y, () => impact(false));
      } else if (sprite) {
        /* 物理: 白い斬撃 → 着弾 */
        playSlashFx(this, sprite.x, sprite.y);
        this.time.delayedCall(150, () => impact(true));
      } else {
        impact(false);
      }
      return;
    }

    /* 敵 → 味方: ツメあと + 画面シェイク + 赤フラッシュ */
    playEnemyAttackFx(this);
    this.cameras.main.shake(180, 0.008);
    this.cameras.main.flash(160, 200, 40, 40);
    spawnDamagePopup(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT - 200,
      `-${event.damage}`,
      "#ff9c9c",
    );
    /* 受けたメンバーの表示HPだけを、このイベントの分だけ減らす */
    const d = this.display.get(event.targetId);
    if (d) d.hp = Math.max(0, d.hp - event.damage);
    showDamage();
  }

  private playVictory(event: Extract<BattleEvent, { type: "victory" }>) {
    spawnVictorySparkles(this);
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
    for (const member of result.party) {
      this.display.set(member.memberId, { hp: member.hp, mp: member.mp });
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

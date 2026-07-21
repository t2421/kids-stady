import Phaser, { Scene } from "phaser";
import type { EventCommand, MapDef, MapEvent, NpcDef } from "../../content/types";
import { getMapDef } from "../../content/maps";
import { TILE_SIZE } from "../../content/art/tiles";
import type { Dir } from "../../lib/save";
import type { RunnerInput, RunnerState } from "../../lib/events/runner";
import { evalCond, startRun, step } from "../../lib/events/runner";
import { actorTextureKey, tileTextureKey } from "../textures";
import { autosave, getSave, updateSave } from "../session";
import { EventBus } from "../EventBus";
import { fadeIn, fadeOutThen } from "../transition";
import type { UiScene } from "./UiScene";
import type { BattleLaunchData, BattleResult } from "./BattleScene";
import { getEncounterTable } from "../../content/encounters";
import { getSpell } from "../../content/spells";
import { mulberry32, randInt } from "../../lib/curriculum/types";
import { heroStats } from "../../lib/battle/stats";

const STEP_MS = 150;
const ZOOM = 3;
/* ダイアログを閉じた直後の action キー誤爆を防ぐクールダウン */
const INTERACT_COOLDOWN_MS = 200;

const DELTA: Record<Dir, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

interface FieldInitData {
  mapId?: string;
  spawn?: string;
}

/*
 * 汎用マップシーン: 町・ダンジョン・フィールドすべて MapDef データで動く
 * (docs/kazu-quest-design-plan.md B2)。専用シーンは作らない。
 */
export class FieldScene extends Scene {
  private map!: MapDef;
  private player!: Phaser.GameObjects.Image;
  private npcSprites = new Map<string, Phaser.GameObjects.Image>();
  private eventSprites = new Map<string, Phaser.GameObjects.Image>();
  private gridX = 0;
  private gridY = 0;
  private facing: Dir = "down";
  private moving = false;
  private transferring = false;
  private runActive = false;
  private lastRunEndAt = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private pointerHeld = false;
  private ui!: UiScene;
  private rng = mulberry32((Math.random() * 2 ** 32) >>> 0);
  private stepsToEncounter = Infinity;
  private battleStarting = false;
  /* ボス戦などイベント発の戦闘後にランナーを再開するためのコールバック */
  private pendingBattleAdvance: ((won: boolean) => void) | null = null;
  private pendingWinFlag: string | undefined;

  constructor() {
    super("Field");
  }

  init(data: FieldInitData) {
    const save = getSave();
    const mapId = data.mapId ?? save.location.mapId;
    this.map = getMapDef(mapId);

    if (data.spawn && this.map.spawns[data.spawn]) {
      const s = this.map.spawns[data.spawn];
      this.gridX = s.x;
      this.gridY = s.y;
      this.facing = s.facing;
    } else if (this.map.id === save.location.mapId) {
      this.gridX = save.location.x;
      this.gridY = save.location.y;
      this.facing = save.location.facing;
    } else {
      const fallback =
        this.map.spawns.start ?? Object.values(this.map.spawns)[0];
      this.gridX = fallback?.x ?? 1;
      this.gridY = fallback?.y ?? 1;
      this.facing = fallback?.facing ?? "down";
    }

    this.moving = false;
    this.transferring = false;
    this.runActive = false;
    this.battleStarting = false;
    this.pendingBattleAdvance = null;
    this.pendingWinFlag = undefined;
    this.npcSprites.clear();
    this.eventSprites.clear();
    this.resetEncounterCounter();
  }

  private resetEncounterCounter() {
    const table = this.map?.encounterTableId
      ? getEncounterTable(this.map.encounterTableId)
      : undefined;
    this.stepsToEncounter = table
      ? randInt(this.rng, table.stepRange[0], table.stepRange[1])
      : Infinity;
  }

  create() {
    /* 入場時点で現在地をセーブに確定させる (以後 save.location が常に真) */
    updateSave((save) => ({
      ...save,
      location: {
        mapId: this.map.id,
        x: this.gridX,
        y: this.gridY,
        facing: this.facing,
      },
    }));

    this.buildMapLayer();
    this.buildNpcs();
    this.buildEventSprites();

    this.player = this.add
      .image(...this.tileCenter(this.gridX, this.gridY), actorTextureKey("hero"))
      .setDepth(10);

    const widthPx = this.map.grid[0].length * TILE_SIZE;
    const heightPx = this.map.grid.length * TILE_SIZE;
    const cam = this.cameras.main;
    cam.setZoom(ZOOM);
    cam.setBounds(0, 0, widthPx, heightPx);
    cam.startFollow(this.player, true);
    /* startFollow 直後にカメラ位置を確定させてからフェードインを重ねる */
    cam.centerOn(this.player.x, this.player.y);
    fadeIn(this);

    const keyboard = this.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.wasd = {
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    keyboard.on("keydown-Z", () => this.interact());
    keyboard.on("keydown-ENTER", () => this.interact());
    keyboard.on("keydown-SPACE", () => this.interact());

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isUiBusy()) return;
      if (this.tryPointerInteract(pointer)) return;
      this.pointerHeld = true;
    });
    this.input.on("pointerup", () => (this.pointerHeld = false));

    /* 常駐UIシーンを確保 (初回のみ起動) */
    if (!this.scene.isActive("Ui")) {
      this.scene.launch("Ui");
    }
    this.ui = this.scene.get("Ui") as UiScene;

    /* 戦闘から戻ったとき (sleep → wake) の結果処理 */
    this.events.on(
      Phaser.Scenes.Events.WAKE,
      (_sys: unknown, data?: BattleResult) => {
        this.battleStarting = false;
        if (data) this.onBattleResult(data);
      },
    );
    /* Ui の create 完了を待ってからマップ名を出す */
    this.time.delayedCall(50, () => this.ui.showMapName?.(this.map.name));

    EventBus.emit("current-scene-ready", this);
    EventBus.emit("map-entered", { mapId: this.map.id, name: this.map.name });
  }

  update() {
    if (
      this.moving ||
      this.transferring ||
      this.runActive ||
      this.battleStarting ||
      this.isUiBusy()
    ) {
      return;
    }
    const dir = this.readDirection();
    if (dir) this.tryMove(dir);
  }

  private isUiBusy(): boolean {
    return typeof this.ui?.isBusy === "function" && this.ui.isBusy();
  }

  /* E2E・デバッグ用: 現在マップ内の任意タイルへ移動する */
  debugTeleport(x: number, y: number, facing: string): void {
    const dir: Dir = (["up", "down", "left", "right"] as const).includes(
      facing as Dir,
    )
      ? (facing as Dir)
      : "down";
    this.gridX = x;
    this.gridY = y;
    this.facing = dir;
    this.moving = false;
    this.player.setPosition(...this.tileCenter(x, y));
    updateSave((save) => ({
      ...save,
      location: { mapId: this.map.id, x, y, facing: dir },
    }));
  }

  /* ---------- 描画 ---------- */

  private buildMapLayer() {
    /*
     * タイルごとに静的 Image を置く。
     * DynamicTexture への一括焼き込みも試したが、Phaser 4.2 では draw() が
     * 描画されなかった (M4スパイクの結論)。マップは最大でも数千タイルなので
     * 静的 Image で十分。性能が問題になったらチャンク化を検討する。
     */
    this.map.grid.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const spec = this.map.legend[ch];
        if (!spec) return;
        this.add
          .image(...this.tileCenter(x, y), tileTextureKey(spec.art))
          .setDepth(0);
      });
    });
  }

  private buildNpcs() {
    for (const npc of this.map.npcs) {
      const sprite = this.add
        .image(...this.tileCenter(npc.x, npc.y), actorTextureKey(npc.art))
        .setDepth(5);
      this.npcSprites.set(npc.id, sprite);
    }
  }

  /* 宝箱など、見た目を持つイベントを描画する (onceFlag 済みなら出さない) */
  private buildEventSprites() {
    const flags = getSave().flags;
    for (const ev of this.map.events) {
      if (!ev.art) continue;
      if (ev.onceFlag && evalCond({ flag: ev.onceFlag, op: "set" }, flags)) {
        continue;
      }
      const sprite = this.add
        .image(...this.tileCenter(ev.x, ev.y), tileTextureKey(ev.art))
        .setDepth(4);
      this.eventSprites.set(ev.id, sprite);
    }
  }

  private refreshEventSprites() {
    const flags = getSave().flags;
    for (const ev of this.map.events) {
      const sprite = this.eventSprites.get(ev.id);
      if (!sprite) continue;
      if (ev.onceFlag && evalCond({ flag: ev.onceFlag, op: "set" }, flags)) {
        sprite.destroy();
        this.eventSprites.delete(ev.id);
      }
    }
  }

  /* ---------- 移動 ---------- */

  private tileCenter(x: number, y: number): [number, number] {
    return [x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2];
  }

  private readDirection(): Dir | null {
    if (this.cursors.up.isDown || this.wasd.W.isDown) return "up";
    if (this.cursors.down.isDown || this.wasd.S.isDown) return "down";
    if (this.cursors.left.isDown || this.wasd.A.isDown) return "left";
    if (this.cursors.right.isDown || this.wasd.D.isDown) return "right";
    if (this.pointerHeld) {
      const pointer = this.input.activePointer;
      const world = pointer.positionToCamera(
        this.cameras.main,
      ) as Phaser.Math.Vector2;
      const dx = world.x - this.player.x;
      const dy = world.y - this.player.y;
      if (Math.abs(dx) < TILE_SIZE / 2 && Math.abs(dy) < TILE_SIZE / 2) {
        return null;
      }
      if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
      return dy > 0 ? "down" : "up";
    }
    return null;
  }

  private isWalkable(x: number, y: number): boolean {
    if (y < 0 || y >= this.map.grid.length) return false;
    const row = this.map.grid[y];
    if (x < 0 || x >= row.length) return false;
    const spec = this.map.legend[row[x]];
    if (!spec || !spec.walkable) return false;
    if (this.map.npcs.some((n) => n.x === x && n.y === y)) return false;
    /* 見えている宝箱などのイベントもふさぐ */
    for (const ev of this.map.events) {
      if (ev.x === x && ev.y === y && this.eventSprites.has(ev.id)) return false;
    }
    return true;
  }

  private tryMove(dir: Dir) {
    this.facing = dir;
    const { dx, dy } = DELTA[dir];
    const nx = this.gridX + dx;
    const ny = this.gridY + dy;
    if (!this.isWalkable(nx, ny)) return;

    this.moving = true;
    this.gridX = nx;
    this.gridY = ny;
    const [px, py] = this.tileCenter(nx, ny);
    this.tweens.add({
      targets: this.player,
      x: px,
      y: py,
      duration: STEP_MS,
      onComplete: () => {
        this.moving = false;
        this.onStep();
      },
    });
  }

  /* 1歩ごとの処理: 座標イベント → イベントランナー */
  private onStep() {
    updateSave((save) => ({
      ...save,
      location: {
        mapId: this.map.id,
        x: this.gridX,
        y: this.gridY,
        facing: this.facing,
      },
    }));

    const event = this.findEvent("step", this.gridX, this.gridY);
    if (event) {
      this.runEvent(event);
      return;
    }

    /* ランダムエンカウント (encounter属性のタイルのみカウント) */
    const tile = this.map.legend[this.map.grid[this.gridY][this.gridX]];
    if (tile?.encounter && this.map.encounterTableId) {
      this.stepsToEncounter -= 1;
      if (this.stepsToEncounter <= 0) {
        const table = getEncounterTable(this.map.encounterTableId);
        if (table) {
          const sum = table.groups.reduce((s, g) => s + g.weight, 0);
          let roll = this.rng() * sum;
          let group = table.groups[table.groups.length - 1];
          for (const g of table.groups) {
            roll -= g.weight;
            if (roll <= 0) {
              group = g;
              break;
            }
          }
          this.resetEncounterCounter();
          this.startBattle({ monsterIds: group.monsterIds, boss: false });
        }
      }
    }
  }

  /* ---------- 戦闘 ---------- */

  private startBattle(data: BattleLaunchData) {
    if (this.battleStarting) return;
    this.battleStarting = true;
    this.cameras.main.shake(220, 0.006);
    this.time.delayedCall(320, () => {
      this.scene.sleep();
      this.scene.run("Battle", data);
    });
  }

  private onBattleResult(result: BattleResult) {
    if (result.outcome === "won") {
      if (result.winFlag) {
        updateSave((save) => ({
          ...save,
          flags: { ...save.flags, [result.winFlag!]: true },
        }));
        autosave();
      }
      this.refreshEventSprites();
      const advance = this.pendingBattleAdvance;
      this.pendingBattleAdvance = null;
      advance?.(true);
      return;
    }
    if (result.outcome === "fled") {
      const advance = this.pendingBattleAdvance;
      this.pendingBattleAdvance = null;
      /* ボス戦は逃走不可なので fled はランナー外のはず。安全側で中断扱い */
      if (advance) this.finishRun();
      return;
    }
    /* 全滅: ペナルティなしで ほこら (checkpoint) へ。HP/MP全回復 */
    this.pendingBattleAdvance = null;
    this.runActive = false;
    const save = getSave();
    updateSave((s) => ({
      ...s,
      party: s.party.map((m) => {
        const stats = heroStats(m.level);
        return { ...m, hp: stats.maxHp, mp: stats.maxMp };
      }),
    }));
    autosave();
    this.ui.showMessage(
      ["めのまえが まっくらに なった…", "…だいじょうぶ。", "もういちど ちょうせんしよう!"],
      () => {
        this.transferTo(save.checkpoint.mapId, save.checkpoint.spawn);
      },
    );
  }

  /* ---------- 調べる / 話しかける ---------- */

  private interact() {
    if (
      this.moving ||
      this.transferring ||
      this.runActive ||
      this.isUiBusy() ||
      this.time.now - this.lastRunEndAt < INTERACT_COOLDOWN_MS
    ) {
      return;
    }
    const { dx, dy } = DELTA[this.facing];
    this.interactAt(this.gridX + dx, this.gridY + dy);
  }

  /* タップした隣接タイルの NPC・宝箱に触れる。処理したら true */
  private tryPointerInteract(pointer: Phaser.Input.Pointer): boolean {
    if (this.moving || this.runActive) return false;
    if (this.time.now - this.lastRunEndAt < INTERACT_COOLDOWN_MS) return false;
    const world = pointer.positionToCamera(
      this.cameras.main,
    ) as Phaser.Math.Vector2;
    const tx = Math.floor(world.x / TILE_SIZE);
    const ty = Math.floor(world.y / TILE_SIZE);
    const adjacent =
      Math.abs(tx - this.gridX) + Math.abs(ty - this.gridY) === 1;
    if (!adjacent) return false;
    if (!this.findNpc(tx, ty) && !this.findEvent("inspect", tx, ty)) {
      return false;
    }
    /* 向きを合わせてから実行 */
    if (tx > this.gridX) this.facing = "right";
    else if (tx < this.gridX) this.facing = "left";
    else if (ty > this.gridY) this.facing = "down";
    else this.facing = "up";
    this.interactAt(tx, ty);
    return true;
  }

  private interactAt(x: number, y: number) {
    const npc = this.findNpc(x, y);
    if (npc) {
      this.talkTo(npc);
      return;
    }
    const event = this.findEvent("inspect", x, y);
    if (event) this.runEvent(event);
  }

  private findNpc(x: number, y: number): NpcDef | undefined {
    return this.map.npcs.find((n) => n.x === x && n.y === y);
  }

  private findEvent(
    trigger: MapEvent["trigger"],
    x: number,
    y: number,
  ): MapEvent | undefined {
    const flags = getSave().flags;
    return this.map.events.find(
      (e) =>
        e.trigger === trigger &&
        e.x === x &&
        e.y === y &&
        !(e.onceFlag && evalCond({ flag: e.onceFlag, op: "set" }, flags)),
    );
  }

  private talkTo(npc: NpcDef) {
    const flags = getSave().flags;
    const entry = npc.dialog.find((d) => evalCond(d.if, flags));
    if (!entry) return;
    const commands: EventCommand[] = [
      { type: "message", pages: entry.pages },
      ...(entry.then ?? []),
    ];
    this.runCommands(commands);
  }

  private runEvent(event: MapEvent) {
    const commands: EventCommand[] = event.onceFlag
      ? [...event.commands, { type: "setFlag", flag: event.onceFlag }]
      : event.commands;
    this.runCommands(commands);
  }

  /* ---------- イベントランナー駆動 ---------- */

  private runCommands(commands: EventCommand[]) {
    this.runActive = true;
    let state: RunnerState = startRun(commands, getSave());

    const advance = (input?: RunnerInput) => {
      const result = step(state, input);
      state = result.state;
      updateSave(() => result.state.save);

      if (result.done) {
        this.finishRun();
        return;
      }
      const effect = result.effect!;
      switch (effect.kind) {
        case "message":
          this.ui.showMessage(effect.pages, () => advance());
          break;
        case "choice":
          this.ui.showChoice(effect.prompt, (yes) =>
            advance({ choice: yes ? "yes" : "no" }),
          );
          break;
        case "transfer":
          this.finishRun();
          this.transferTo(effect.mapId, effect.spawn);
          break;
        case "savePoint":
          updateSave((save) => ({
            ...save,
            checkpoint: {
              mapId: this.map.id,
              spawn: this.map.spawns.save ? "save" : "start",
            },
          }));
          autosave();
          this.ui.showMessage(["ぼうけんを きろくした!"], () => advance());
          break;
        case "healInn": {
          const save = getSave();
          if (save.inventory.gold < effect.price) {
            this.ui.showMessage(["おかねが たりないみたい…"], () => advance());
            break;
          }
          updateSave((s) => ({
            ...s,
            inventory: { ...s.inventory, gold: s.inventory.gold - effect.price },
            party: s.party.map((m) => {
              const stats = heroStats(m.level);
              return { ...m, hp: stats.maxHp, mp: stats.maxMp };
            }),
          }));
          autosave();
          this.ui.showMessage(["ゆっくり やすんで…", "げんきに なった!"], () =>
            advance(),
          );
          break;
        }
        case "battle":
          /* 勝利したらランナー再開 (winFlag は onBattleResult が立てる)。
             敗北時は onBattleResult がラン中断+ほこら復帰を行う */
          this.pendingBattleAdvance = (won) => {
            if (won) advance();
          };
          this.startBattle({
            monsterIds: effect.monsterIds,
            boss: effect.boss,
            winFlag: effect.winFlag,
          });
          break;
        case "openSpellTest": {
          /* React の SpellTestScreen に委譲。合格なら習得 (設計 A4) */
          const alreadyLearned = getSave().party.some((m) =>
            m.learnedSpells.includes(effect.spellId),
          );
          if (alreadyLearned) {
            this.ui.showMessage(["その じゅもんは もう おぼえているよ!"], () =>
              advance(),
            );
            break;
          }
          const onFinished = (result: {
            spellId: string;
            passed: boolean;
            correct: number;
            total: number;
          }) => {
            if (result.spellId !== effect.spellId) return;
            EventBus.off("spell-test-finished", onFinished);
            const spellName = getSpell(result.spellId)?.name ?? result.spellId;
            if (result.passed) {
              updateSave((s) => ({
                ...s,
                party: s.party.map((m) =>
                  m.memberId === "hero" &&
                  !m.learnedSpells.includes(result.spellId)
                    ? { ...m, learnedSpells: [...m.learnedSpells, result.spellId] }
                    : m,
                ),
              }));
              autosave();
              this.ui.showMessage(
                [
                  `${result.total}もん中 ${result.correct}もん せいかい!`,
                  `ごうかく! ${spellName}を おぼえた!`,
                ],
                () => advance(),
              );
            } else {
              this.ui.showMessage(
                [
                  `${result.total}もん中 ${result.correct}もん せいかい…`,
                  "あと すこし! また ちょうせん してね。",
                ],
                () => advance(),
              );
            }
          };
          EventBus.on("spell-test-finished", onFinished);
          EventBus.emit("open-spell-test", { spellId: effect.spellId });
          break;
        }
        case "openShop":
          /* M9 で実装。いまはプレースホルダ */
          this.ui.showMessage(["(ここは じゅんびちゅう だよ)"], () => advance());
          break;
      }
    };

    advance();
  }

  private finishRun() {
    this.runActive = false;
    this.lastRunEndAt = this.time.now;
    this.refreshEventSprites();
    autosave();
  }

  private transferTo(mapId: string, spawn: string) {
    if (this.transferring) return;
    this.transferring = true;
    const target = getMapDef(mapId);
    const point = target.spawns[spawn] ?? Object.values(target.spawns)[0];
    updateSave((save) => ({
      ...save,
      location: {
        mapId: target.id,
        x: point?.x ?? 1,
        y: point?.y ?? 1,
        facing: point?.facing ?? "down",
      },
    }));
    autosave();
    fadeOutThen(this, () => {
      this.scene.restart({ mapId, spawn });
    });
  }
}

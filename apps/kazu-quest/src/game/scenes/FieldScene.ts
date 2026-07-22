import Phaser, { Scene } from "phaser";
import type { EventCommand, MapDef, MapEvent, NpcDef } from "../../content/types";
import { getMapDef } from "../../content/maps";
import { getEncounterTable } from "../../content/encounters";
import { TILE_SIZE } from "../../content/art/tiles";
import type { Dir } from "../../lib/save";
import type { RunnerInput, RunnerState } from "../../lib/events/runner";
import { evalCond, startRun, step } from "../../lib/events/runner";
import { pickEncounterGroup, rollEncounterSteps } from "../../lib/encounter";
import { mulberry32 } from "../../lib/curriculum/types";
import { heroStats } from "../../lib/battle/stats";
import { actorTextureKey } from "../textures";
import { autosave, getSave, updateSave } from "../session";
import { EventBus } from "../EventBus";
import { fadeIn, fadeOutThen } from "../transition";
import { MapView, tileCenter } from "../field/MapView";
import { buildStatusSections } from "../field/statusSections";
import {
  handleHealInn,
  handleSavePoint,
  handleShop,
  handleSpellTest,
} from "../field/effectHandlers";
import type { UiScene } from "./UiScene";
import type { BattleLaunchData, BattleResult } from "./BattleScene";

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
 * 描画は MapView、長いUIフローは field/effectHandlers に分離している。
 */
export class FieldScene extends Scene {
  private map!: MapDef;
  private view!: MapView;
  private player!: Phaser.GameObjects.Image;
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

  constructor() {
    super("Field");
  }

  /* ---------- ライフサイクル ---------- */

  init(data: FieldInitData) {
    const save = getSave();
    this.map = getMapDef(data.mapId ?? save.location.mapId);

    if (data.spawn && this.map.spawns[data.spawn]) {
      const s = this.map.spawns[data.spawn];
      [this.gridX, this.gridY, this.facing] = [s.x, s.y, s.facing];
    } else if (this.map.id === save.location.mapId) {
      const l = save.location;
      [this.gridX, this.gridY, this.facing] = [l.x, l.y, l.facing];
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
    this.resetEncounterCounter();
  }

  create() {
    /* 入場時点で現在地をセーブに確定させる (以後 save.location が常に真) */
    this.saveLocation();

    this.view = new MapView(this, this.map);
    this.view.build(getSave().flags);

    this.player = this.add
      .image(...tileCenter(this.gridX, this.gridY), actorTextureKey("hero"))
      .setDepth(10);
    this.applyHeroFacing();

    this.setupCamera();
    this.setupInput();
    this.setupUiScene();

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

  private setupCamera() {
    const cam = this.cameras.main;
    cam.setZoom(ZOOM);
    cam.setBounds(
      0,
      0,
      this.map.grid[0].length * TILE_SIZE,
      this.map.grid.length * TILE_SIZE,
    );
    cam.startFollow(this.player, true);
    /* startFollow 直後にカメラ位置を確定させてからフェードインを重ねる */
    cam.centerOn(this.player.x, this.player.y);
    fadeIn(this);
  }

  private setupInput() {
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
    keyboard.on("keydown-X", () => this.openStatusMenu());
    keyboard.on("keydown-M", () => this.openStatusMenu());
    keyboard.on("keydown-ESC", () => this.openStatusMenu());

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isUiBusy()) return;
      if (this.tryPointerInteract(pointer)) return;
      this.pointerHeld = true;
    });
    this.input.on("pointerup", () => (this.pointerHeld = false));
  }

  private setupUiScene() {
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

    /* 常設メニューボタン (UiScene) → ステータスパネル。restart で重複登録
       しないよう shutdown で解除する */
    const onMenuButton = () => this.openStatusMenu();
    EventBus.on("menu-button-pressed", onMenuButton);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
      EventBus.off("menu-button-pressed", onMenuButton),
    );

    /* Ui の create 完了を待ってからマップ名を出す */
    this.time.delayedCall(50, () => this.ui.showMapName?.(this.map.name));
  }

  private isUiBusy(): boolean {
    return typeof this.ui?.isBusy === "function" && this.ui.isBusy();
  }

  private saveLocation() {
    updateSave((save) => ({
      ...save,
      location: {
        mapId: this.map.id,
        x: this.gridX,
        y: this.gridY,
        facing: this.facing,
      },
    }));
  }

  /* ---------- 移動 ---------- */

  private readDirection(): Dir | null {
    if (this.cursors.up.isDown || this.wasd.W.isDown) return "up";
    if (this.cursors.down.isDown || this.wasd.S.isDown) return "down";
    if (this.cursors.left.isDown || this.wasd.A.isDown) return "left";
    if (this.cursors.right.isDown || this.wasd.D.isDown) return "right";
    if (this.pointerHeld) {
      const world = this.input.activePointer.positionToCamera(
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
    /* 表示中の NPC・宝箱がふさぐ (hideIf/onceFlag で消えたものは通れる) */
    if (this.map.npcs.some((n) => n.x === x && n.y === y && this.view.hasNpc(n.id))) {
      return false;
    }
    return !this.map.events.some(
      (e) => e.x === x && e.y === y && this.view.hasEventSprite(e.id),
    );
  }

  /* 向きに応じて勇者のスプライトを切り替える (下=正面/上=後ろ/左右=横+反転) */
  private applyHeroFacing() {
    if (!this.player) return;
    const art =
      this.facing === "up" ? "heroUp" : this.facing === "down" ? "hero" : "heroSide";
    this.player.setTexture(actorTextureKey(art));
    this.player.setFlipX(this.facing === "left");
  }

  private tryMove(dir: Dir) {
    this.facing = dir;
    this.applyHeroFacing();
    const { dx, dy } = DELTA[dir];
    const nx = this.gridX + dx;
    const ny = this.gridY + dy;
    if (!this.isWalkable(nx, ny)) return;

    this.moving = true;
    this.gridX = nx;
    this.gridY = ny;
    const [px, py] = tileCenter(nx, ny);
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

  /* 1歩ごとの処理: 座標イベント → エンカウント */
  private onStep() {
    this.saveLocation();

    const event = this.findEvent("step", this.gridX, this.gridY);
    if (event) {
      this.runEvent(event);
      return;
    }
    this.countEncounterStep();
  }

  /* ---------- エンカウント ---------- */

  private resetEncounterCounter() {
    const table = this.map?.encounterTableId
      ? getEncounterTable(this.map.encounterTableId)
      : undefined;
    this.stepsToEncounter = table ? rollEncounterSteps(table, this.rng) : Infinity;
  }

  private countEncounterStep() {
    const tile = this.map.legend[this.map.grid[this.gridY][this.gridX]];
    if (!tile?.encounter || !this.map.encounterTableId) return;
    this.stepsToEncounter -= 1;
    if (this.stepsToEncounter > 0) return;
    const table = getEncounterTable(this.map.encounterTableId);
    if (!table) return;
    this.resetEncounterCounter();
    this.startBattle({
      monsterIds: pickEncounterGroup(table, this.rng),
      boss: false,
    });
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
      this.view.refresh(getSave().flags);
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
    const checkpoint = getSave().checkpoint;
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
      () => this.transferTo(checkpoint.mapId, checkpoint.spawn),
    );
  }

  /* ---------- 調べる / 話しかける ---------- */

  private canAct(): boolean {
    return (
      !this.moving &&
      !this.transferring &&
      !this.runActive &&
      !this.battleStarting &&
      !this.isUiBusy() &&
      this.time.now - this.lastRunEndAt >= INTERACT_COOLDOWN_MS
    );
  }

  private interact() {
    if (!this.canAct()) return;
    const { dx, dy } = DELTA[this.facing];
    this.interactAt(this.gridX + dx, this.gridY + dy);
  }

  /* タップ: 自分=メニュー / 隣接タイルの NPC・宝箱=しらべる。処理したら true */
  private tryPointerInteract(pointer: Phaser.Input.Pointer): boolean {
    if (this.moving || this.runActive) return false;
    if (this.time.now - this.lastRunEndAt < INTERACT_COOLDOWN_MS) return false;
    const world = pointer.positionToCamera(
      this.cameras.main,
    ) as Phaser.Math.Vector2;
    const tx = Math.floor(world.x / TILE_SIZE);
    const ty = Math.floor(world.y / TILE_SIZE);
    if (tx === this.gridX && ty === this.gridY) {
      this.openStatusMenu();
      return true;
    }
    if (Math.abs(tx - this.gridX) + Math.abs(ty - this.gridY) !== 1) return false;
    if (!this.findNpc(tx, ty) && !this.findEvent("inspect", tx, ty)) return false;

    if (tx > this.gridX) this.facing = "right";
    else if (tx < this.gridX) this.facing = "left";
    else if (ty > this.gridY) this.facing = "down";
    else this.facing = "up";
    this.applyHeroFacing();
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
    return this.map.npcs.find(
      (n) => n.x === x && n.y === y && this.view.hasNpc(n.id),
    );
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
    const entry = npc.dialog.find((d) => evalCond(d.if, getSave().flags));
    if (!entry) return;
    this.runCommands([
      { type: "message", pages: entry.pages },
      ...(entry.then ?? []),
    ]);
  }

  private runEvent(event: MapEvent) {
    const commands: EventCommand[] = event.onceFlag
      ? [...event.commands, { type: "setFlag", flag: event.onceFlag }]
      : event.commands;
    this.runCommands(commands);
  }

  /* ---------- ステータスメニュー ---------- */

  private openStatusMenu() {
    /* 戦闘中 (sleep) は開かない */
    if (!this.scene.isActive() || !this.canAct()) return;
    const sections = buildStatusSections(getSave());
    if (!sections) return;
    this.runActive = true;
    this.ui.showStatusPanel(sections, () => this.finishRun());
  }

  /* ---------- イベントランナー駆動 ---------- */

  private runCommands(commands: EventCommand[]) {
    this.runActive = true;
    let state: RunnerState = startRun(commands, getSave());

    const advance = (input?: RunnerInput) => {
      /*
       * ステップ前にセッションのセーブを再同期する。
       * effect の処理中 (習得テスト合格・戦闘報酬・宿・店など) に行われた
       * updateSave が、ランナーが持つ古いスナップショットで上書きされて
       * 消えるのを防ぐ (実バグ: テスト合格で覚えた呪文が消えていた)。
       */
      state = { ...state, save: getSave() };
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
          handleSavePoint(
            this.ui,
            {
              mapId: this.map.id,
              spawn: this.map.spawns.save ? "save" : "start",
            },
            () => advance(),
          );
          break;
        case "healInn":
          handleHealInn(this.ui, effect.price, () => advance());
          break;
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
        case "openSpellTest":
          handleSpellTest(this.ui, effect.spellId, () => advance());
          break;
        case "openShop":
          handleShop(this.ui, effect.shopId, () => advance());
          break;
      }
    };

    advance();
  }

  private finishRun() {
    this.runActive = false;
    this.lastRunEndAt = this.time.now;
    this.view.refresh(getSave().flags);
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

  /* ---------- E2E・デバッグ用フック ---------- */

  debugWarp(mapId: string, spawn: string): void {
    this.transferTo(mapId, spawn);
  }

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
    this.player.setPosition(...tileCenter(x, y));
    this.applyHeroFacing();
    this.saveLocation();
  }
}

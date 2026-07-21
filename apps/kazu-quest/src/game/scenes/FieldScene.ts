import Phaser, { Scene } from "phaser";
import type { MapDef } from "../../content/types";
import { getMapDef } from "../../content/maps";
import { TILE_SIZE } from "../../content/art/tiles";
import type { Dir } from "../../lib/save";
import { actorTextureKey, tileTextureKey } from "../textures";
import { autosave, getSave, updateSave } from "../session";
import { EventBus } from "../EventBus";
import { fadeIn, fadeOutThen } from "../transition";

const STEP_MS = 150;
const ZOOM = 3;

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
  private gridX = 0;
  private gridY = 0;
  private facing: Dir = "down";
  private moving = false;
  private transferring = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  private pointerHeld = false;

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
    this.npcSprites.clear();
  }

  create() {
    this.buildMapLayer();
    this.buildNpcs();

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

    this.input.on("pointerdown", () => (this.pointerHeld = true));
    this.input.on("pointerup", () => (this.pointerHeld = false));

    EventBus.emit("current-scene-ready", this);
    /* マップ名の一時表示などの画面UIは UiScene (M5) が担当する */
    EventBus.emit("map-entered", { mapId: this.map.id, name: this.map.name });
  }

  update() {
    if (this.moving || this.transferring) return;
    const dir = this.readDirection();
    if (dir) this.tryMove(dir);
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

  /* 1歩ごとの処理: 座標イベント (M5で本実装のランナーに委譲) */
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

    const event = this.map.events.find(
      (e) => e.trigger === "step" && e.x === this.gridX && e.y === this.gridY,
    );
    if (!event) return;

    /* M4時点では transfer のみ処理する (他コマンドは M5 のイベントランナー) */
    const transfer = event.commands.find((c) => c.type === "transfer");
    if (transfer && transfer.type === "transfer") {
      this.transferTo(transfer.mapId, transfer.spawn);
    }
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

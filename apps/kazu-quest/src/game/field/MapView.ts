/*
 * マップの見た目 (タイル・NPC・宝箱スプライト) の構築と更新。
 * FieldScene から描画責務を分離したビュー。当たり判定に使う
 * 「いま表示されているか」(hasNpc / hasEventSprite) もここが持つ。
 */

import type { Scene } from "phaser";
import type Phaser from "phaser";
import type { HideCond, MapDef, TileSpec } from "../../content/types";
import type { SaveData } from "../../lib/save";
import { TILE_SIZE, isNegariaStagedArt, negariaStageArtKey } from "../../content/art/tiles";
import { TILE_ANIMATIONS } from "../../content/art/tileAnims";
import { evalCond, evalHideIf, type MasteryLookup } from "../../lib/events/runner";
import { masteredShardCount, negariaStageFor } from "../../lib/review";
import { getSave } from "../session";
import { actorTextureKey, tileTextureKey } from "../textures";
import { playSfx } from "../audio/sfx";

/* タイルアニメの切替間隔 (2コマをのんびり往復) */
const TILE_ANIM_MS = 620;
/* キャラの足元影の見た目 */
const SHADOW_COLOR = 0x10141c;
const SHADOW_ALPHA = 0.28;

export function tileCenter(x: number, y: number): [number, number] {
  return [x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2];
}

/*
 * variants 指定タイルの見た目を座標から決定的に選ぶ。
 * 乱数だと再訪のたびに景色が変わるので、必ず (x, y) だけから決める。
 */
export function pickTileArt(spec: TileSpec, x: number, y: number): string {
  const pool = spec.variants;
  if (!pool || pool.length === 0) return spec.art;
  const hash = (x * 7919 + y * 104729 + ((x * 31 + y * 7) % 13)) % pool.length;
  return pool[hash];
}

/* ネガリアの色戻し (LP-22): 全学年ぶんの mastered 単元数から いまの段を決める */
function currentNegariaStage(): 0 | 1 | 2 | 3 {
  return negariaStageFor(masteredShardCount(getSave()));
}

/* AU-04: refresh() で今回 hideIf を満たして消えるべき NPC の id 一覧 (純関数)。
 * 「表示中のものだけ」判定するので、初回 build() 前 (何も表示されていない) や
 * 既に消えた NPC を数え直さない — gateOpen は「今回の呼び出しで新しく消えた数」だけを見る */
export function npcsToHide(
  npcs: readonly { id: string; hideIf?: HideCond }[],
  visibleIds: ReadonlySet<string>,
  flags: SaveData["flags"],
  mastery: MasteryLookup,
): string[] {
  return npcs
    .filter((npc) => npc.hideIf && visibleIds.has(npc.id) && evalHideIf(npc.hideIf, flags, mastery))
    .map((npc) => npc.id);
}

/* AU-04: ネガリアの段が「上がった」かどうか (純関数)。段が変わらない/下がる場合は
 * colorReturn を鳴らさない (下がる遷移は現行ロジックでは起きないが、念のため増加のみを見る) */
export function didNegariaStageIncrease(previousStage: number, nextStage: number): boolean {
  return nextStage > previousStage;
}

/* キャラの足元に落とす楕円の影 (接地感を出す)。プレイヤーとNPCで共用 */
export function addFootShadow(
  scene: Scene,
  x: number,
  y: number,
): Phaser.GameObjects.Ellipse {
  return scene.add
    .ellipse(x, y + 6, 10, 4, SHADOW_COLOR, SHADOW_ALPHA)
    .setDepth(3);
}

export class MapView {
  private npcSprites = new Map<string, Phaser.GameObjects.Image>();
  private npcShadows = new Map<string, Phaser.GameObjects.Ellipse>();
  private eventSprites = new Map<string, Phaser.GameObjects.Image>();
  /* 地形タイルの静的 Image (性能監査 KQ-40 の計数用。描画には関与しない) */
  private tileImages: Phaser.GameObjects.Image[] = [];
  /* アニメーションするタイル: 2コマのテクスチャキーを持つ */
  private animTiles: { img: Phaser.GameObjects.Image; frames: [string, string] }[] =
    [];
  private animFrame = 0;
  /* ネガリアの色戻し対象タイル (LP-22): 段が変わったら貼りかえる */
  private negariaTiles: { img: Phaser.GameObjects.Image; baseArt: string }[] = [];
  private negariaStage: 0 | 1 | 2 | 3 = 0;

  constructor(
    private readonly scene: Scene,
    private readonly map: MapDef,
  ) {}

  build(flags: SaveData["flags"]): void {
    /*
     * タイルごとに静的 Image を置く。
     * DynamicTexture への一括焼き込みも試したが、Phaser 4.2 では draw() が
     * 描画されなかった (M4スパイクの結論)。マップは最大でも数千タイルなので
     * 静的 Image で十分。性能が問題になったらチャンク化を検討する。
     */
    this.negariaStage = currentNegariaStage();
    this.map.grid.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const spec = this.map.legend[ch];
        if (!spec) return;
        const art = pickTileArt(spec, x, y);
        const resolvedArt = negariaStageArtKey(art, this.negariaStage);
        const img = this.scene.add
          .image(...tileCenter(x, y), tileTextureKey(resolvedArt))
          .setDepth(0);
        this.tileImages.push(img);
        if (isNegariaStagedArt(art)) {
          this.negariaTiles.push({ img, baseArt: art });
        }
        const animArt = TILE_ANIMATIONS[resolvedArt];
        if (animArt) {
          this.animTiles.push({
            img,
            frames: [tileTextureKey(resolvedArt), tileTextureKey(animArt)],
          });
        }
      });
    });
    this.startTileAnimations();

    for (const npc of this.map.npcs) {
      if (evalHideIf(npc.hideIf, flags, getSave().mastery)) continue;
      const [px, py] = tileCenter(npc.x, npc.y);
      this.npcShadows.set(npc.id, addFootShadow(this.scene, px, py));
      const sprite = this.scene.add
        .image(px, py, actorTextureKey(npc.art))
        .setDepth(5);
      /* 呼吸のようなゆったりしたボブ。位相は座標からずらして揃い踏みを防ぐ */
      this.scene.tweens.add({
        targets: sprite,
        y: py - 1,
        duration: 1150,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: (npc.x * 137 + npc.y * 71) % 900,
      });
      this.npcSprites.set(npc.id, sprite);
    }

    for (const ev of this.map.events) {
      if (!ev.art) continue;
      if (ev.onceFlag && evalCond({ flag: ev.onceFlag, op: "set" }, flags)) {
        continue;
      }
      const sprite = this.scene.add
        .image(...tileCenter(ev.x, ev.y), tileTextureKey(ev.art))
        .setDepth(4);
      this.eventSprites.set(ev.id, sprite);
    }
  }

  /* 2コマのタイルアニメを一括で切り替えるタイマー (シーンと共に破棄される) */
  private startTileAnimations(): void {
    if (this.animTiles.length === 0) return;
    this.scene.time.addEvent({
      delay: TILE_ANIM_MS,
      loop: true,
      callback: () => {
        this.animFrame = this.animFrame === 0 ? 1 : 0;
        for (const { img, frames } of this.animTiles) {
          img.setTexture(frames[this.animFrame]);
        }
      },
    });
  }

  /*
   * ネガリアの色戻し (LP-22): マスター数の段が変わっていたら 対象タイルだけ
   * 貼りかえる。専用の EventBus 通知は無いので、既存の refresh() 呼び出し
   * (戦闘勝利後・イベント終了後) に相乗りする。段が変わらなければ何もしない
   */
  private refreshNegariaStage(): void {
    const stage = currentNegariaStage();
    if (stage === this.negariaStage) return;
    const increased = didNegariaStageIncrease(this.negariaStage, stage);
    this.negariaStage = stage;
    for (const { img, baseArt } of this.negariaTiles) {
      img.setTexture(tileTextureKey(negariaStageArtKey(baseArt, stage)));
    }
    /* 初回 build() はここを通らない (build() は negariaStage を直接代入する) ので、
     * ここに来る時点で「段が上がった」実際の遷移だけを対象にできる */
    if (increased) playSfx("colorReturn");
  }

  /* フラグ変化を反映: 開いた宝箱・条件を満たした hideIf NPC を消す */
  refresh(flags: SaveData["flags"]): void {
    this.refreshNegariaStage();
    for (const ev of this.map.events) {
      const sprite = this.eventSprites.get(ev.id);
      if (!sprite) continue;
      if (ev.onceFlag && evalCond({ flag: ev.onceFlag, op: "set" }, flags)) {
        sprite.destroy();
        this.eventSprites.delete(ev.id);
      }
    }
    const hiddenIds = npcsToHide(
      this.map.npcs,
      new Set(this.npcSprites.keys()),
      flags,
      getSave().mastery,
    );
    for (const id of hiddenIds) {
      const sprite = this.npcSprites.get(id);
      if (!sprite) continue;
      this.scene.tweens.killTweensOf(sprite);
      sprite.destroy();
      this.npcSprites.delete(id);
      this.npcShadows.get(id)?.destroy();
      this.npcShadows.delete(id);
    }
    /* 章ゲートの番人などが消えた回 (≥1件) にだけ1回鳴らす。build() 直後の初回
     * refresh() でもここは「実際に消えたか」だけを見るので安全 */
    if (hiddenIds.length > 0) playSfx("gateOpen");
  }

  /* 置いた地形タイル Image の数 (window.__KAZUQUEST_PERF__.sprites が読む) */
  get tileCount(): number {
    return this.tileImages.length;
  }

  hasNpc(id: string): boolean {
    return this.npcSprites.has(id);
  }

  hasEventSprite(id: string): boolean {
    return this.eventSprites.has(id);
  }
}

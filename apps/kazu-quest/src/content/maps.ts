/*
 * 全マップの索引。章データと開発マップをここで束ね、エンジンは
 * getMapDef(id) だけを見る。
 */

import type { MapDef } from "./types";
import { DEV_FIELD, DEV_VILLAGE } from "./dev/maps";

const ALL_MAPS: MapDef[] = [DEV_VILLAGE, DEV_FIELD];

const BY_ID = new Map(ALL_MAPS.map((m) => [m.id, m]));

/* セーブに未知の mapId が入っていても落ちないよう、必ずどこかへ着地させる */
export const FALLBACK_MAP_ID = DEV_VILLAGE.id;
export const FALLBACK_SPAWN = "start";

export function getMapDef(id: string): MapDef {
  return BY_ID.get(id) ?? BY_ID.get(FALLBACK_MAP_ID)!;
}

export function hasMap(id: string): boolean {
  return BY_ID.has(id);
}

export function listMaps(): MapDef[] {
  return ALL_MAPS.slice();
}

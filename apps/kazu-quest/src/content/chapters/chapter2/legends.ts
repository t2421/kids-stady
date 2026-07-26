/*
 * 第2章のレジェンド。基本は第1章と共通で、海の地方 (ワールド) と
 * 塔 (エンカウントあり石床) だけ拡張する。
 */

import type { MapDef } from "../../types";
import { WORLD_LEGEND, CASTLE_LEGEND } from "../chapter1/legends";

/* ワールド: 港 P / 灯台 L / 九九の塔 W / ミナトス V / ククリ v */
export const CH2_WORLD_LEGEND: MapDef["legend"] = {
  ...WORLD_LEGEND,
  P: { art: "locPort", walkable: true },
  L: { art: "locLighthouse", walkable: true },
  W: { art: "locTower", walkable: true },
};

/* 塔・灯台の内部: 石床はエンカウントあり (赤じゅうたんは安全地帯) */
export const CH2_TOWER_LEGEND: MapDef["legend"] = {
  ...CASTLE_LEGEND,
  S: { art: "stoneFloor", walkable: true, encounter: true },
};

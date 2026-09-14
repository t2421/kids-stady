/*
 * 終章「ムゲンのらせん」のタイル凡例 (KQ-30b)。
 * らせん: W=金の壁 S=ぞうげ色の床 %=床(エンカウント) V=ムゲンのそら(通れない)
 *         c=金の柱 r=青みどりの じゅうたん D=とびら
 * 色は art/tilesSpiral.ts (ネガリアと同じ色ちがい方式)。
 */

import type { MapDef } from "../../types";

const SPIRAL_VARIANTS = [
  "spiralFloor",
  "spiralFloor",
  "spiralFloor2",
  "spiralFloor",
  "spiralFloor2",
];

export const CH7_SPIRAL_LEGEND: MapDef["legend"] = {
  W: { art: "spiralWall", walkable: false },
  S: { art: "spiralFloor", variants: SPIRAL_VARIANTS, walkable: true },
  "%": {
    art: "spiralFloor",
    variants: SPIRAL_VARIANTS,
    walkable: true,
    encounter: true,
  },
  V: { art: "spiralVoid", walkable: false },
  c: { art: "spiralPillar", walkable: false },
  r: { art: "spiralCarpet", walkable: true },
  D: { art: "door", walkable: true },
};

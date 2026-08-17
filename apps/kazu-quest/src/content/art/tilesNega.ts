/*
 * 第6章「ゼロのあなと 下の世界ネガリア」の固有タイル。
 * ネガリアの地面・海・木・拠点アイコンは tiles.ts で色ちがいとして作るため、
 * ここには 上の世界と下の世界を つなぐ 「ゼロのあな」だけを おく。
 */
import type { PixelArt } from "./format";

export const NEGA_TILES: Record<string, PixelArt> = {
  /* ゼロのあな — 大地に ひらいた うずまき (踏むと 下の世界へ) */
  locZeroHole: {
    palette: { g: "#398447", k: "#0a0810", d: "#241c3d", p: "#5a4886", l: "#8fe0ff" },
    rows: [
      "gggggggggggggggg", "ggggkkkkkkkkgggg", "ggkkddddddddkkgg", "gkdddppppppdddkg",
      "kddppppppppppddk", "kdppppkkkkppppdk", "kdppkkddddkkppdk", "kdpkddplppddkpdk",
      "kdpkdppkkppdkpdk", "kdpkddppppddkpdk", "kdppkkddddkkppdk", "kdppppkkkkppppdk",
      "kddppppppppppddk", "gkdddppppppdddkg", "ggkkddddddddkkgg", "ggggkkkkkkkkgggg",
    ],
  },
};

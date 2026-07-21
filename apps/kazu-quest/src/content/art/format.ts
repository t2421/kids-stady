/*
 * ドット絵の文字列定義フォーマット。
 * rows の1文字が1ピクセル。palette のキーに対応する色で塗る。"." は透明。
 * scale で1文字を n×n ピクセルに拡大してテクスチャ化する (8x8定義×2 = 16x16 など)。
 */

export interface PixelArt {
  palette: Record<string, string>;
  rows: string[];
  scale?: number;
}

export function artSize(art: PixelArt): { w: number; h: number } {
  const scale = art.scale ?? 1;
  return {
    w: (art.rows[0]?.length ?? 0) * scale,
    h: art.rows.length * scale,
  };
}

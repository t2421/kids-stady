# カズクエ パフォーマンス監査 (KQ-40)

> 計測日: 2026-09-14。本番静的ビルド (`next build` → `out/`) を localhost で配信し、
> Playwright (Chromium headless) から CDP `Emulation.setCPUThrottlingRate = 4` を
> かけて計測。値は Phaser の `game.loop.actualFps` を 0.5 秒おきに 10 回サンプル。

## 方法

- フック: `window.__KAZUQUEST_PERF__ = { fps(), sprites() }` (`PhaserGame.tsx`)。
  `sprites()` はフィールドの地形タイル Image 数 (`MapView.tileCount`)
- 画面表示: URL に `?debug=1` を付けると左上に FPS メーター (`FpsMeter.tsx`)。
  dev / 本番どちらでも動く
- 対象: 各章のワールドマップ (最大のマップ) と大きめの町 2 つ

## 結果 (CPU 4x スロットル、Chromium、1280x720)

| map | タイル数 | 中央値 fps | 最小 fps |
|---|---|---|---|
| ch1-world | 476 | 107 | 98 |
| ch2-world | 360 | 113 | 112 |
| ch3-world | 416 | 120 | 118 |
| ch4-world | 416 | 119 | 118 |
| ch5-world | 416 | 120 | 120 |
| ch6-world | 416 | 120 | 120 |
| ch1-capital | 280 | 120 | 120 |
| ch6-hoshioki | 300 | 118 | 116 |

(計測機のディスプレイが 120Hz のため上限 120。60Hz の端末では 60 が上限になる)

## 判定

- 4x スロットルでも全マップ **≥ 98 fps**。設計時の懸念「タイルごとの静的 Image が
  数千枚になる」は、実際のマップが最大 476 タイルに収まっているため発生していない
- **カメラ外タイルのカリングや RenderTexture 焼き込みは不要**。実装しない
  (余計な状態を持たないほうが Phaser 4.2 の描画バグ回避方針とも整合する)
- 再計測が必要になる条件: 1 マップが 1500 タイルを超える / 常時アニメーションする
  タイルが 100 枚を超える / iPad 実機で 50 fps を割る

## 実機 iPad で確認する手順 (ユーザー作業)

1. Safari で GitHub Pages のカズクエ URL を開き、末尾に `?debug=1` を付ける
   (例: `https://<user>.github.io/kids-stady/apps/kazu-quest/?debug=1`)
2. プロフィールを選んで「つづきから」or「はじめから」でフィールドへ
3. 左上の FPS 表示を見ながら、ワールドマップ (章1〜6) を各 10 秒ほど歩く。
   戦闘 (通常戦・ボス戦) も 1 回ずつ見る
4. 判定基準: **常時 50 fps 以上なら合格**。40 台に落ちる場面があればマップ名と
   状況をメモして issue 化する (対処候補: カメラ外タイルの `setVisible(false)` カリング)
5. 音 (効果音・BGM) は最初のタップ後に鳴ること、縦持ちで「よこむきに してね」が
   出ることも同時に確認する

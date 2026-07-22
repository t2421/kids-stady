# マスマティクス スプライト仕様

グラディウス/R-TYPE 世代の16bit風ピクセルアートで統一する。
スプライトは `scripts/gen-sprites.mjs` (パレット+ピクセル行列 → PNG) で生成し、
出力先は `public/assets/sprites/`。**手描きバイナリはコミットしない** (常にスクリプトから再生成)。

## スタイル共通ルール

- 1ドット = 論理2px (@2x で出力: 例「39x22 ドット」→ 78x44 px PNG)
- 輪郭: 最外周に1ドットの暗色アウトライン (真っ黒 #000 ではなく各色の最暗色)
- シェーディング: 上面ハイライト/下面シャドウの2段。ディザは使わない
- 背景: 完全透過 (アルファ0)
- 進行方向: プレイヤー系は右向き、敵は左向き

## パレット (共通)

| 名前 | HEX |
|---|---|
| hull-light | #eef2fb |
| hull | #c3cfe6 |
| hull-shade | #8fa3c8 |
| hull-dark | #4a5e85 |
| blue | #2e6fd8 |
| cyan | #35c4ff |
| red | #e8483f |
| red-dark | #9c2b25 |
| orange | #ff9f43 |
| yellow | #ffd93d |
| green | #3ec46d |
| purple | #8447ff |
| purple-dark | #5a2fb8 |
| brown | #b08968 |
| brown-dark | #7a5c42 |
| outline | #1a2340 |

## スプライト一覧 (キー / ドット寸法 / 出力px / 内容)

| key | dots | px | 内容 |
|---|---|---|---|
| ship | 39x22 | 78x44 | ビックバイパー風戦闘機。ツインノーズ (上下の二又機首、間に暗いインテーク)、後退翼+赤前縁、青キャノピー、白銀の機体 |
| ship-flame | 10x5 | 20x10 | 噴射炎。orange外周+yellow芯。左向きに尖る |
| enemy-ufo | 18x11 | 36x22 | 紫の円盤メカ。ドーム+船体+黄色いランプ3つ |
| enemy-rock | 16x16 | 32x32 | 岩石メカ (茶)。クレーター2-3個、金属リベット |
| enemy-bird | 20x14 | 40x28 | 緑の鳥型メカ。くちばし・翼は機械的な直線 |
| enemy-red | 18x14 | 36x28 | 赤い小型戦闘機 (左向き)。編隊用。ビックバイパーの敵版シルエット |
| boss | 70x62 | 140x124 | 「けいさんキング・イチ」紫の大型メカ要塞+金の王冠。白目+暗瞳の大きな目2つ、暗い口。装甲パネル線 |
| capsule | 20x20 | 40x40 | パワーカプセル。黄色の菱形結晶+白ハイライト (グラディウスのカプセル風) |
| drone | 22x22 | 44x44 | ボス戦の?ドローン。水色の球形メカ、中央に「?」の白い刻印 |
| bullet | 7x2 | 14x4 | 自機弾。yellow、先端hull-light |
| missile | 9x5 | 18x9 | 小型ミサイル。orange本体+yellow弾頭 |
| laser | 21x4 | 42x8 | レーザービーム。cyan外周+白芯 |
| ebullet | 5x5 | 10x10 | 敵弾。red球+明るい芯 |
| option-orb | 10x10 | 20x20 | オプション。yellowの光球、外周に薄いグロー |
| shield-bubble | 34x34 | 68x68 | バリア。greenの円環 (内側は薄い緑 α~0.15) |

## 生成スクリプト要件

- Node 22 / ESM。依存は `pngjs` のみ (devDependency 追加可)
- 各スプライトは「パレット文字 → 色」のマップと ASCII アート行列で定義する
  (例: `.`=透過, `H`=hull, `h`=hull-light, `s`=hull-shade, `o`=outline …)。
  この形式ならレビュー・修正が目視でできる
- `npm run gen:sprites` で全PNGを再生成できるよう package.json にスクリプト追加
- 生成後、各PNGの寸法が仕様と一致することをスクリプト内で assert する

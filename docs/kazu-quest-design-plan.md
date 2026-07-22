# カズクエ 〜数の王国と伝説の勇者〜 — DQ3風・算数RPG 設計計画

> **ステータス**: 承認済み・実装中 (2026-07-21)
> 実装が進んだら、この文書との差分 (設計変更) をこのファイルに追記して更新すること。

## 設計変更ログ

- **2026-07-22 (ユーザー指示)**: 通常攻撃でも算数問題を出題する (当初は呪文・特技のみ)。
  出題は章の基礎スキル (`ChapterDef.attackSkillIds`、章1はくり上がりなしの基礎4種)、
  制限時間10秒。正解=命中、残り時間50%以上で「かいしんのいちげき」1.5倍、
  不正解/タイムアウト=攻撃を外す (ペナルティなし)。
- **2026-07-22 (ユーザー指示)**: 道具屋は品物リスト (UiScene.showList) から選択して購入する
  方式に変更 (当初の1品ずつ はい/いいえ 方式を廃止)。
- **2026-07-22 (実装知見)**: Phaser 4.2 ではカメラ fade エフェクトが進行せず、負荷下では
  tween の onComplete も落ちることがある → シーン遷移は黒矩形+Tween+壁時計 watchdog
  (`transition.ts`) で必ず完了させる。DynamicTexture の draw も描画されないため
  タイルはタイルごとの静的 Image で描画。
- **2026-07-21 (実装知見)**: React StrictMode の二重マウント対策として Phaser Game は
  モジュールレベルのシングルトン (`PhaserGame.tsx`)。

## Context

きっずスタディの3本目のアプリ。ドラクエ3風ターン制RPGに算数学習を統合する。

- **呪文・特技の習得 = 習得テスト**: テストをクリアしないと新しい呪文・特技を覚えられない
- **戦闘中の呪文・特技 = 算数問題**: 発動時に制限時間つき問題。答えられないと不発
- **通常攻撃・防御・道具は算数なし** (テンポ重視)
- **章 = 学年**: 第1章=小1 → 第6章=小6。ストーリー進行と学習進行が一致
- **規模**: クリアまで約20時間 (DQ3規模)。DQ3オマージュのストーリー (IPは全てオリジナル)
- **技術**: Phaser 4 + Next.js + TypeScript (mathematics と同構成)。static export → GitHub Pages
- **slug**: `kazu-quest` / セーブキー: `kidsStudy.kazuQuest.profileData.<id>` (恒久・変更不可)
- **最初のマイルストーン**: エンジン + 第1章 (約90分のプレイ)

---

# Part A: ゲームデザイン

## A1. 世界観とストーリー (DQ3オマージュ・法的に安全)

### 権利面の方針

- スクエニIPの固有名詞・デザインは一切使わない (ロト/ゾーマ/バラモス/スライム/ルイーダ等は不使用)
- コマンドメニュー構成や「王様に謁見」等のジャンル慣習はアイデアでありオマージュ可。UI外観・フォント・ジングルの模倣はしない
- マスコット敵はスライム形を避け、**消しゴム型モンスター**という独自デザイン

### 世界設定

- 世界: 数の力で成り立つ**カズール大陸**。橋も店も暦も「数」で動く
- 事件: 魔王**マイナドス**率いる**ケシケシ軍団** (数を消す文房具の魔物) が世界から数を消し始めた — 「算数ができないと世界が困る」を物語そのものにする
- 6つの**数晶 (すうしょう)** (6オーブ相当) を集めると聖鳥**アバカス**が目覚め、魔王城へ導く
- 真の黒幕: マイナドス撃破後、大陸に**ゼロのあな** (ギアガの大穴相当) が開き、下の世界**ネガリア** (アレフガルド相当) が現れる。君臨するのは**冥王ゼロム** (ゾーマ相当) — すべての数を「無」に還そうとする存在
- 伝説: 初代の数勇者**ピタゴラ** (ロト相当)。エンディングで女神**スーリア** (ルビス相当) から「ピタゴラの称号」を授かる

### 主要人物

| 役割 | 名前 | 備考 |
|---|---|---|
| 主人公 | プレイヤー命名 | **10才の誕生日**の朝、母に起こされ王様に呼ばれる |
| 父 | 勇者**ガウス** | マイナドス討伐に旅立ち消息不明 (オルテガ相当)。エンディングで**救出** (死なせない) |
| 仲間1 | 僧侶**タスク** (2章加入) | 「たす」=回復役 |
| 仲間2 | 武闘家**カケル** (3章加入) | 「かける」=連続攻撃役 |
| 仲間3 | 魔法使い**リトル** (4章加入) | 「リットル」=単位と魔法の少女 |
| 依頼主 | カズール国王カウント王 | 数晶探索を命じる |
| 導き手 | 数の女神スーリア | 各章の節目に夢で語りかける |

王都に**なかまの広場** (ルイーダ相当)。第4章以降パーティ入替可。**転職システムはカット** (章=学年と軸が二重になるため)。代わりに各キャラの呪文系統に分野の色を持たせる。

## A2. 章構成 = 学年構成 (計約20時間)

| 章 | 学年 | 章タイトル | 舞台・町 | ダンジョン | ボス | 加入 | 主な単元 | 時間 |
|---|---|---|---|---|---|---|---|---|
| 1 | 小1 | かずのしずくと はじまりの村 | ハジマリ村/王都カズール/モリカゲ村 | どんぐりの森/かぞえの洞くつ | 幹部**イレイサー** | — | 数〜120、たし算ひき算〜20、くりあがり/くりさがり、比較、とけい | 1.5h |
| 2 | 小2 | 九九の塔と 海のひっさん | 港町ミナトス/ククリ村 | しおかぜ灯台/**九九の塔**(9階=九九の段) | インクの魔女**ブロッタ** | タスク | 九九、2桁ひっ算、1000までの数、長さ/かさ、時刻、三角形四角形 | 2.5h |
| 3 | 小3 | 砂漠の盗賊王と わけまえのピラミッド | オアシス都市ワケーラ/隊商の宿場 | **わけまえのピラミッド**/大灯りの遺跡 | 盗賊王**アマリダ** (カンダタ相当) | カケル | わり算、あまり、×1桁ひっ算、万、小数分数入門、km/g/kg、円と球 | 3h |
| 4 | 小4 | 氷の国の はかりごと | 計測の都メジャーリア/雪村コゴエ | 氷の洞くつ/**角度の遺跡** | 小数の魔人**デシマロン** | リトル | 億兆、÷2桁、がい数、小数計算、同分母分数、角度、面積、グラフ。**章末で船入手** | 3h |
| 5 | 小5 | 割合の都と 魔王マイナドス | パーセンの都/バーゲンの町/ブンスウ諸島 | 空中庭園/海底神殿/**マイナドス城** | **魔王マイナドス (偽ラスボス)** | 入替解放 | 小数×÷、異分母分数、割合百分率、平均、単位量、面積、体積、倍数約数 | 3.5h |
| 6 | 小6 | ゼロのあなと 下の世界ネガリア | ノコリビの村/最後の町ホシオキ | はやさの回廊/エンの神殿/ピタゴラの試練/**ゼロム城** | **冥王ゼロム (真ラスボス・2形態)** | — | 分数×÷、文字と式、比、速さ、円の面積、体積、比例反比例、拡大縮小、場合の数 | 4h |
| 終 | 復習 | ムゲンのらせん (クリア後) | — | 裏ダンジョン**ムゲンのらせん** | 隠しボス**∞竜ムゲニア** | — | 小1〜小6ミックス演習 | 2.5h |

第5章クリア演出: マイナドス撃破 → 祝勝会 → ゼロのあなが開く → 「本当の戦いはこれからだ」(DQ3構造の踏襲)。ゼロム第2形態は6学年ミックス問題で集大成。

コンテンツ総量目安: 町14 / ダンジョン19 / 戦闘約320 / 習得テスト43。タイルセット6テーマ + 色違いモンスターで素材圧縮。

## A3. 戦闘システム

- DQ様式**一人称ターン制コマンドバトル**: たたかう/じゅもん/とくぎ/ぼうぎょ/どうぐ/にげる
- パーティ最大4人・全員手動コマンド。誰の呪文でも問題に答えるのは常にプレイヤー
- **たたかう・ぼうぎょ・どうぐは算数なし**。算数は呪文・特技のみ

### 呪文詠唱フロー

1. 呪文選択 → 問題パネル (呪文に紐づく単元から出題) + タイマーバー
2. 制限時間: Tier1=15秒 / Tier2=20秒 / Tier3=25秒
3. **正解** → 発動 + MP消費。残り時間50%以上なら「**かいしん!**」効果1.5倍
4. **不正解/タイムアウト** → 不発 (「じゅもんが みだれた!」)。**MPは消費しない**。正解を1行2秒表示して戦闘続行。詳しい解説は戦闘後
5. 全回答で `recordAnswer(skillId, correct, ms)` 記録

- 戦闘中の回答UIは**常に3択タップ** (makeChoices の誤答パターン: ±1、くりあがり忘れ等)
- 問題難度 = 呪文ティア連動 (ヒキダマ=ひき算〜10、ヒキダマン=くりさがり、…)

### 敵デザインと子供向け配慮

- **ケシケシ軍団**: 消しゴム・インク・修正液など文房具モチーフのかわいい魔物 (ケシゴムン/インクぐも/かずぬすみネズミ/モジバケバット/シュウセイエキン…)
- 1戦闘は敵2〜4体、3〜5ターン (60〜90秒) で終わるHP設計
- **グラインド不要**のEXP曲線。ボス部屋前に推奨レベル表示
- ランダムエンカウントは最低歩数保証つき低頻度。**にげるは雑魚戦なら必ず成功**。エンカウント半減アイテム「あんしんのすず」
- **全滅ペナルティなし**: めがみのほこら (checkpoint) で全回復復活。「だいじょうぶ、もういちど ちょうせんしよう!」

## A4. 呪文・特技の習得システム

1. レベルアップ or ストーリー進行で「しゅうとくの書」解放 (メニューに「!」)
2. 各町の**まなびや**で習得テスト: 単元から**10問、8問以上正解で合格** → 習得 + ボーナスEXP
3. 不合格 → 何度でも再挑戦。テスト前に**とっくん** (時間無制限・ヒントつき練習。くりあがりはさくらんぼ図)
4. 回答UI: 小1〜2は3択、小3以降はテンキー入力
5. 重要呪文のみストーリーゲート (例: 1章ボス前「くりさがりの じゅもんが ないと きけんだ」)。他は任意

### 章別呪文・特技リスト

**第1章 (小1) — 6個**

| 名前 | 種別 | 効果 | skillId |
|---|---|---|---|
| ヒキダマ | 呪文・攻 | 単体小ダメージ | g1_sub_nc |
| タシリア | 呪文・回復 | 単体小回復 | g1_add_nc |
| かぞえスラッシュ | 特技・攻 | 連続斬り | g1_count |
| ヒキダマン | 呪文・攻+ | 単体中ダメージ | g1_sub_borrow |
| タシリアン | 呪文・回復+ | 単体中回復 | g1_add_carry |
| くらべシールド | 特技・防 | 防御アップ | g1_compare |

**第2章 (小2) — 7個**: ククダマ (九九・全体攻撃) / ダンダンづき (九九・連撃) / ヒッサンブレイク (2桁ひっ算・単体大) / タシリアーダ (ひっ算・全体回復) / ナガサビーム (長さ換算) / カサミスト (かさ・攻撃ダウン) / トキシフト (時刻・行動順アップ)

**第3章 (小3) — 8個**: ワリダマ (わり算・防御無視) / アマリバインド (あまり・行動封じ) / ケタクラッシュ (×1桁) / マンライト (大きい数・聖) / ショウスウレイン (小数・全体) / ハーフン (分数・被ダメ半減) / オモサプレス (重さ) / エンサークル (円・全体防御)

**第4章 (小4) — 8個**: カクドスピン (角度) / メンセキウォール (面積・バリア) / デシマフリーズ (小数・氷) / ガイスウボム (がい数) / オクトビリオン (億兆) / ブンスウヒール (分数・回復+) / スイヘイガード (垂直平行・反撃) / グラフアイ (グラフ・弱点表示)

**第5章 (小5) — 8個**: パーセンフレア (百分率・%ダメージ) / ツウブンスラッシュ (通分・特大) / ショウスウストーム (小数×小数) / バイヤクブレイク (倍数約数・防御破壊) / ヘイキンヒール (平均・HP平均化全体回復) / タンイアタック (単位量・先制) / タイセキプレス (体積) / ゴウドウミラー (合同・反射)

**第6章 (小6) — 8個**: スピードスター (速さ・2回行動) / エンノハドウ (円の面積・全体聖) / ブンスウノヴァ (分数×÷・最強攻撃) / レシオブレイク (比) / モジシキサイン (文字と式・弱点直撃) / カクダイスラッシュ (拡大縮小) / バアイノカズ (場合の数・多段) / **フッカツノシキ** (蘇生=総復習ミックス問題)

**らせん復習の内蔵**: 回復のタシリア系 (小1たし算) を終盤まで使い続けるため低学年単元が自然に反復される。単元と効果の意味づけ: たす=回復、ひく=攻撃、かける=全体/連撃、わる=防御破壊、分数=半減、割合=%ダメージ、速さ=行動回数。

## A5. 戦闘外の算数タッチポイント (すべて任意・報酬型)

1. **お店のおつりチャレンジ**: 正解で10%引き (無視して普通に買える)
2. **すうじのカギつき宝箱**: 数字パズル錠。失敗ペナルティなし・再挑戦可
3. **NPCミニクイズ** → **ひらめきメダル** (小さなメダル相当)。王都の収集家がレア装備と交換
4. **九九の塔フロアギミック** (2章): 各階の扉に「その段」のクイズ
5. **とけい塔の鐘** (1章王都): 時計を読むと時間帯限定NPC出現

## A6. 学習テレメトリ

- 全回答箇所から `recordAnswer(skillId, correct, ms)` (コンテキストタグ battle/test/drill つき)
- **戦闘中**: 正解1行を2秒表示のみ (テンポ優先)
- **戦闘後**: リザルトに「**まちがいノート**」— さくらんぼ図・ひっ算図のステップ解説。メニューから読み返し可
- 呪文の出題は単元プール (skillId配列) から `pickSkill` パターンで**弱点skillを重み付け**
- 各町の**ふくしゅうのほこら**: 弱点skill上位3つから10問の復習クエスト自動生成 → ひらめきメダル

## A7. 第1章 詳細仕様 (約90分)

| # | シーン | 内容 | 目安 |
|---|---|---|---|
| 0 | オープニング | ピタゴラ伝説スクロール → 10才の誕生日 → 移動/会話チュートリアル | 5分 |
| 1 | ハジマリ村 | 村長の手紙。スクリプト戦闘 (ケシゴムン1体、たたかうのみ、負けない) | 10分 |
| 2 | 街道 | 敵: ケシゴムン/インクぐも/かずぬすみネズミ。宿とセーブの教え | 10分 |
| 3 | 王都カズール | カウント王に謁見 → 数晶・壱の探索 + 50G + どうのつるぎ。まなびやで**ヒキダマ**習得 (チュートリアル)。とけい塔 (任意) | 15分 |
| 4 | まなびや | Lv3で**タシリア**・**かぞえスラッシュ**解放 (任意・強く推奨導線) | 5分 |
| 5 | どんぐりの森 (3マップ) | 中ボス: でかインクぐも。宝箱 (かぞえ問題) → かわのたて。モリカゲ村へ | 15分 |
| 6 | モリカゲ村 | 橋の番人「くりさがりの じゅもんが ないと きけんだ」→ **ヒキダマン**・**タシリアン**のテスト = ストーリーゲート | 15分 |
| 7 | かぞえの洞くつ (3マップ+ボス部屋) | たいまつ数え扉。敵: モジバケバット/とげとげイモムシ/ケシゴムン+ | 15分 |
| 8 | ボス: 幹部イレイサー | HP120。けしけしビーム/まっしろフラッシュ/HP50%以下でケシゴムン2体召喚。ヒキダマン2〜3発で撃破設計 | 10分 |
| 9 | エピローグ | 帰還・報告 → ぼうけんのせいせき画面 → ミナトスへの通行証 + タスク顔見せ | 5分 |

数値仕様 (初期バランス案): 主人公 HP25/MP8/Lv1、章クリア想定Lv7。
敵: ケシゴムン (HP8,EXP2,1G) / インクぐも (HP12,EXP3,2G) / かずぬすみネズミ (HP10,EXP3,3G,盗み逃げ) / モジバケバット (HP14,EXP4,3G) / とげとげイモムシ (HP18,EXP5,4G) / 中ボスでかインクぐも (HP60,EXP20,30G) / ボスイレイサー (HP120)。
呪文: ヒキダマ 8〜12dmg(MP2) / タシリア 8〜12回復(MP2) / ヒキダマン 16〜22dmg(MP3) / タシリアン 16〜22回復(MP3) / かぞえスラッシュ 3〜5連×3dmg(MP2)。かいしん1.5倍。

---

# Part B: 技術アーキテクチャ

## B1. プロジェクト配置

- `apps/kazu-quest/` — **完全独立のNext.jsプロジェクト**。`apps/mathematics/` の scaffold をコピーして流用。dev port **3011**
- workspace/monorepo化はしない (リポジトリの「アプリごと独立」方針。共有は docs を正典とするコピー方式)
- mathematics 計画の `src/lib/profiles.ts` を kazu-quest が**先に実装**し、`docs/save-data.md` の実装参照を更新。mathematics は後日コピー

```
apps/kazu-quest/
├── package.json / next.config.ts / tsconfig.json
├── src/
│   ├── app/               # page.tsx: dynamic import ssr:false
│   ├── components/        # React UI
│   ├── game/              # Phaser (scenes/EventBus/main)
│   ├── content/           # データ駆動コンテンツ (章はすべてここ)
│   └── lib/               # 純ロジック: curriculum/battle/events/save/profiles
├── tests/                 # Vitest
└── e2e/                   # Playwright スモーク
```

## B2. Phaser シーン構成

| シーン | 役割 |
|---|---|
| BootScene | 手続きテクスチャ一括生成 (タイル・キャラ・モンスター)、pixelArt |
| TitleScene | タイトル。プロフィール選択はReactオーバーレイ |
| **FieldScene** | **汎用マップシーン1本** — 町・ダンジョン・フィールドすべて MapDef で駆動。グリッド移動・NPC・イベント・エンカウント |
| BattleScene | DQ式一人称ターン制。`sleep/wake` でフィールド状態保持のまま遷移 |
| MenuScene | つよさ/じゅもん/どうぐ/きろく (FieldScene 上に launch) |
| UiScene (常駐) | DQ風ダイアログウィンドウ・文字送り |

- 論理解像度 **960x540 / Scale.FIT** (mathematics 踏襲)。16pxタイル × zoom3 (=48px表示)、カメラ startFollow + roundPixels + pixelArt。可視範囲 20x11 タイル強
- **Arcade Physics 不使用** — グリッド移動は tween + 自前 walkable 判定 (config から physics を外す)
- フィールド⇔バトル: 歩数カウンタ→判定→渦巻き演出→ `scene.sleep("Field")` + `scene.run("Battle", {groupId, partySnapshot})` → 終了で `stop` + `wake("Field", result)`。全滅時は checkpoint へ transfer

## B3. タイルマップ / グラフィック方針

- **Tiled は使わず TS 内の文字列グリッド** (`grid: string[]` 1文字=1タイル + `legend`)
  - 理由: (1) Phaser 4 のタイルマップAPI差分リスクを回避 — `make.tilemap({data})` のデータ配列方式、ダメなら DynamicTexture 1枚絵焼き込み fallback (むしろ高速)。M4 でスパイクして確定 (2) diff が読める・AIでも人間でも書ける・**Vitest でバリデーション可能** (3) 20時間分のオーサリング効率
- **グラフィックはアセット0**: パレット付き文字列ドット絵定義 (`src/content/art/*.ts`) を Boot で generateTexture。16x16タイル、モンスター32x32〜48x48。パレット差し替えで色違い量産。品質不足なら CC0 タイルセット + CREDITS.md の余地は残す

## B4. React / Phaser 分担

**ルール: ゲーム世界の中のUIは Phaser、算数の出題・解答とメタ画面は React。通信は EventBus のみ (直接参照禁止)**

- **Phaser**: NPC会話ウィンドウ、バトルコマンド・戦闘メッセージ、フィールドメニュー
- **React**: `MathPromptPanel.tsx` (算数プロンプト、≥72pxボタン・タイマーバー、battle/test共用、`inputMode:"choices"|"keypad"`)、`SpellTestScreen.tsx` (習得テスト)、まちがい解説オーバーレイ、ProfileSelect/Create、統計画面、縦持ち警告

中核イベント:
```
Phaser → React: "math-prompt"  {requestId, skillId, timeLimitMs|null, context:"battle"|"test"|"drill"}
React → Phaser: "math-result"  {requestId, correct, timedOut, elapsedMs, problem}
Phaser → React: "open-spell-test" {spellId} / "show-stats" / "current-scene-ready"
React → Phaser: "spell-test-finished" {spellId, passed}
```

## B5. データ駆動コンテンツ (`src/content/`)

```
src/content/
├── art/            # ドット絵定義 (tiles.ts, heroes.ts, monsters.ts)
├── spells.ts       # 全章 SpellDef
├── items.ts        # ItemDef + ShopDef
├── monsters.ts     # 全 MonsterDef
└── chapters/
    ├── index.ts        # CHAPTERS: ChapterDef[] (章2+ は implemented:false → じゅんびちゅう)
    └── chapter1/
        ├── index.ts    # ChapterDef
        ├── maps/       # 1マップ1ファイル (town-hajimari.ts など)
        ├── encounters.ts
        └── quests.ts   # フラグレジストリ + ボスイベント
```

- **JSONでなくTypeScriptモジュール**: 型チェックがコンテンツlintになる (不正な monsterId/spellId/flagId 参照はコンパイルエラー)。fetch不要で basePath 問題なし
- **第1章完成 = エンジン + データ形式確定**。章2以降は `chapters/chapterN/` の追加のみ

### スキーマ概略

```ts
interface TileSpec { art: string; walkable: boolean; encounter?: boolean }
interface MapDef {
  id: string; name: string; theme: string;          // 章ごとのパレット差替え
  legend: Record<string, TileSpec>;
  grid: string[];                                    // 全行同長 (テストで検証)
  encounterTableId: string | null;                   // null = 町 (安全)
  npcs: NpcDef[]; events: MapEvent[];                // 座標トリガ
  spawns: Record<string, { x: number; y: number; facing: Dir }>;
}
interface NpcDef { id; x; y; art; movement: "static"|"wander"; dialog: DialogEntry[] }
interface DialogEntry { if?: FlagCond; pages: string[]; then?: EventCommand[] }
  // 先頭から if を評価し最初にマッチしたものを表示

type EventCommand =
  | { type: "message"; pages: string[] }
  | { type: "setFlag"; flag: string; value?: number|boolean }
  | { type: "giveItem"; itemId; count? } | { type: "giveGold"; amount }
  | { type: "transfer"; mapId; spawn }
  | { type: "battle"; monsterIds: string[]; boss?: boolean }
  | { type: "openShop"; shopId } | { type: "healInn"; price }
  | { type: "openSpellTest"; spellId }
  | { type: "savePoint" }
  | { type: "choice"; prompt; yes: EventCommand[]; no: EventCommand[] };

interface EncounterTable { id; stepRange: [number,number]; groups: {monsterIds: string[]; weight}[] }
interface MonsterDef { id; name; art; hp; atk; def; agi; exp; gold;
  actions: { kind: "attack"|"strongAttack"|"heal"; weight }[] }
interface SpellDef { id; name; kind: "attack"|"heal"|"buff"; mpCost; power;
  target: "enemy"|"self"; skillId: string;           // ← curriculum への唯一の接続点
  battleTimeLimitMs: number;
  learnTest: { skillIds: string[]; questions: number; passCount: number };
  description: string }
interface ChapterDef { id; grade; title; implemented: boolean;
  startMap; startSpawn; maps: MapDef[]; encounterTables: EncounterTable[];
  spellIds: string[]; flags: Record<string,string>;  // flagId → 説明 (レジストリ兼ドキュメント)
  clearFlag: string }
```

### 進行フラグとイベント実行系

- セーブの `flags: Record<string, number|boolean>` が唯一の進行状態。フラグ名は `c1.xxx` の章プレフィックス規約
- `EventCommand[]` を逐次消化する小さなインタプリタを純ロジックで実装 (`src/lib/events/runner.ts`)。シーンは表示指示を演出するだけ → Vitest で完全テスト可

## B6. カリキュラム (`src/lib/curriculum/`)

- mathematics 設計の Problem 型を継承:
```ts
type Problem = {
  skillId: string; text: string;
  a: number|null; b: number|null; op: "+"|"-"|"×"|"÷"|null;
  answer: string;                        // "1/2" "0.6" も可
  choices: [string, string, string];
  hint: Hint|null; explain: string[];
};
generate(skillId, rng): Problem          // rng注入 = テスト再現可能
makeChoices(answer, kind)                // ±1 / くりあがり忘れ / 分母分子取違い等
pickSkill(skillIds, skillStats)          // 苦手重み付け
```
- 第1章は grade1 のみ実装 (g1_count / g1_compare / g1_add_nc / g1_sub_nc / g1_add_carry / g1_sub_borrow — mathematics と同一体系)、grade2〜6 はラベル登録
- 戦闘=常に3択。習得テスト=章1は3択、章2以降テンキー (keypad は後続実装)
- React/Phaser 非依存の純関数 → 将来 mathematics へコピー or `shared/ts/` 抽出が機械的に可能

## B7. セーブスキーマ (`kidsStudy.kazuQuest.profileData.<id>`)

プロフィールごと**単一オートセーブ** (transfer時・戦闘終了時・メニュー閉時)。教会 savePoint は checkpoint 更新 + 「きろくした!」の儀式演出。

```ts
interface SaveData {
  version: 1;
  chapter: { current: number; cleared: number[] };
  flags: Record<string, number|boolean>;
  party: Array<{ memberId: string; level: number; exp: number;
                 hp: number; mp: number; learnedSpells: string[] }>;  // 章1は勇者のみ
  location: { mapId: string; x: number; y: number; facing: Dir };
  checkpoint: { mapId: string; spawn: string };      // 全滅時の復帰先
  inventory: { gold: number; items: Record<string, number> };
  playtimeMs: number;
  totalCorrect: number; totalWrong: number;
  skillStats: Record<string, { c: number; w: number; recentMs: number[] }>; // cap20
  history: Array<{ ts; kind: "battle"|"test"; chapter; correct; wrong; avgAnswerMs }>; // cap50
  updatedAt: number;
}
```

- maxHP/maxMP/atk はレベルから導出 (保存しない)
- `normalize(raw): SaveData` を読込時に必ず通す。localStorage は try/catch (docs/save-data.md 準拠)
- `src/lib/profiles.ts` は save-data.md 契約の TS 実装 (keisan 移行ロジック含む)

## B8. テスト戦略

| 対象 | 手法 |
|---|---|
| curriculum | Vitest プロパティテスト: skill毎 seed付き500問 → answer∈choices・3択ユニーク・値域正当 |
| 戦闘ロジック | `src/lib/battle/` 純状態機械 `step(state, action, rng) → {state, effects[]}`。ダメージ境界・agi順・レベル曲線をユニットテスト。シーンは effects の演出のみ |
| イベント実行系 | FlagCond評価・逐次実行・choice分岐を runner 単体でテスト |
| **コンテンツバリデーション** | 全 ChapterDef 走査: grid全行同長 / legend未定義文字なし / spawn・NPCがwalkable&盤内 / transfer先実在 / monsterId・spellId・skillId・itemId・flagId 参照実在。**章量産の安全網** |
| save/profiles | normalize 耐性、keisan 移行ルール |
| シーン | ユニット対象外。Playwright スモーク (ロード→タイトル→はじめから→1歩) + Chrome 手動プレイスルー |

開発ビルド限定デバッグ機能 (テレポート・フラグ強制・エンカウントOFF) を早期導入。

## B9. CI/CD (既存 `.github/workflows/deploy.yml` への追記)

1. `cache-dependency-path` を複数行化 (両 lock ファイル)
2. kazu-quest ステップ追加: `npm ci` → `typecheck && test` → `NEXT_PUBLIC_BASE_PATH=/kids-stady/apps/kazu-quest npm run build`
3. Assemble に `cp -r apps/kazu-quest/out _site/apps/kazu-quest` 追加
4. `shared/js/apps-registry.js` に登録

## B10. マイルストーン (エンジン + 第1章)

| # | 内容 | 検証 |
|---|---|---|
| M1 | scaffold + deploy.yml 追記 + registry 登録 | dev起動、Actions緑→本番サブパス表示、既存2アプリ無傷 |
| M2 | profiles.ts + save.ts + ProfileSelect/Create + Vitest 基盤 | vitest緑、keisanと同一プロフィール一覧 |
| M3 | curriculum grade1 + プロパティテスト | vitest 500問検証 |
| M4 | フィールドエンジン + 描画スパイク (Phaser 4 API確定) | テストマップを歩ける、FPS確認 |
| M5 | ダイアログ + イベントランナー + フラグ + 宝箱 + バリデーションテスト | vitest緑 + 会話プレイスルー |
| M6 | バトルエンジン (まず「たたかう」のみ) | vitest、雑魚戦通し |
| M7 | 呪文=算数統合 (MathPromptPanel、recordAnswer) | 呪文→問題→成功/不発通し、localStorage確認 |
| M8 | 習得テスト + とっくん + 教会セーブ + 全滅復帰 | 習得→使用→全滅→復帰の通し |
| M9 | 第1章コンテンツ投入 + メニュー + 店/宿 | バリデーション緑 + 第1章通しプレイ |
| M10 | ポリッシュ (sfx・統計・まちがいノート・縦持ち警告) + E2E + docs | E2E緑、3アプリ回帰、本番プレイスルー |

## B11. リスクと対策

- **Phaser 4 タイルマップAPI差分** (最大の技術リスク): データ配列方式限定、M4 スパイク、DynamicTexture fallback
- **コンテンツ量20h**: エンジン/データ分離をバリデーションテストで強制。章1完成時に「章テンプレート」を docs 化
- **出題が戦闘テンポを壊す**: 呪文時のみ・3択・15〜25秒・不発ペナルティ軽微。1戦闘の出題2〜4問
- **低学年の読み**: 章1〜2全文ひらがな+分かち書き、章3以降ルビ (会話データ属性で制御)
- **IP安全性**: 固有名詞・敵デザイン・UI外観・音すべてオリジナル。実装前に名称の商標簡易チェック推奨
- **二重実装ドリフト**: docs/save-data.md を正典とする既存規約に乗る
- **子供の操作**: 仮想D-pad + タップ移動 (隣接タイル) 両対応、ボタン≥72px
- **タブレット性能**: 物理なし・静的レイヤー1枚絵化・Boot一括テクスチャ・DPR上限。M4/M6 で CPU スロットル計測

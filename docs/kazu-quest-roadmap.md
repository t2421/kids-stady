# カズクエ ロードマップ v2 — 本編完結後の残作業計画とタスク分解

> **ステータス**: 実行済み (2026-09-14) — KQ-26 (任意) 以外の全タスクを完了。実行ログは §7。設計の正典は
> [kazu-quest-design-plan.md](kazu-quest-design-plan.md)。本書は「設計計画のうち
> まだ実装していないもの」を棚卸しし、優先順位を付け直し、**1タスク = 1セッション
> (Sonnet に丸ごと渡せる粒度)** に分解したもの。
> タスクを完了したら本書の表の状態列を更新し、設計変更があれば設計計画の変更ログに追記する。

## 0. 現状サマリ (2026-09-14 時点で確認済み)

| 領域 | 状態 |
|---|---|
| エンジン | フィールド / DQ式パーティ戦闘 (たたかう・じゅもん・どうぐ・ぼうぎょ・にげる) / イベントランナー / セーブ / 装備 / 店・宿・ほこら / おだいドリル |
| コンテンツ | 第1〜6章 (55マップ・呪文46種・モンスター41種)。小1〜小6 32単元のカリキュラム。本編クリアまで通しプレイ可 |
| UI | 会話・メニュー・ステータスパネルは DOM (iPad前提、タブ式)。算数パネルは3択のみ。プロフィール選択/切替は共通フロー準拠 |
| テスト | Vitest 1054件 (バリデーション713件を含む) 緑。E2E: スモーク + **章1・章2のゴールデンパスのみ** (`e2e/smoke.spec.ts` 651行) |
| CI/CD | typecheck + vitest + static export → GitHub Pages。E2E は CI 未実行 |
| 音 | **なし** (効果音・BGMとも未実装) |

### 設計計画にあって未実装のもの (棚卸し)

| 設計の節 | 項目 | 状態 |
|---|---|---|
| A3 | 戦闘後「まちがいノート」(解説の読み返し) | 未。curriculum は `hint` / `explain` を生成しているが **どこにも表示していない** |
| A4 | とっくん (無制限・ヒントつき練習)、さくらんぼ図 | 未 |
| A4 / B6 | 小3以降の習得テストは **テンキー入力** | 未 (全学年3択) |
| A5 | おつりチャレンジ / すうじのカギ宝箱 / NPCミニクイズ+ひらめきメダル / とけい塔の鐘 | 未 (九九の塔の扉クイズのみ) |
| A6 | ふくしゅうのほこら (弱点3単元の復習クエスト) | 未 (`weakSkills` ヘルパは shared にある) |
| A2 | 終章「ムゲンのらせん」+ 隠しボス | 未。章7を作ると出題が学年なしにフォールバックする (エンジン制約) |
| A7-9 / M10 | ぼうけんのせいせき画面 | 未 (mathematics の `StatsScreen.tsx` が移植元) |
| A3 | ボス部屋前の すいしょうレベル表示 | 未 (章2のNPC助言のみ) |
| M10 | 効果音・BGM | 未 (mathematics の `sfx.ts` / `bgm.ts` = アセット0の WebAudio が移植元) |
| M10 | 縦持ち警告 | 未 |
| B11 | 章3以降のルビ | 未 (全章ひらがな分かち書きのまま) |
| — | エンディング演出・タイトルの「つづきから/はじめから」・クリア後状態 | エンディングはメッセージ8ページのみ。タイトルは「タップして ぼうけんに でる」1択 |
| B7 | `playtimeMs` | セーブ項目はあるが **加算している箇所がない** |
| B8 | 章3〜6の E2E、タッチ操作の E2E | 未 |
| B11 | iPad 実機のパフォーマンス計測 (55マップ・タイルごと静的Image) | 未 |

## 1. ブラッシュアップ方針

### 1.1 優先順位の原則

1. **安全網を先に張る** — 章3〜6 は E2E がない。ここから機能を足すと 55マップの
   リグレッションを目視でしか検出できない。最初に E2E とバランス検証を整える
2. **「算数が身につく」機能を、「ゲームが豪華になる」機能より先に** — まちがいノート・
   とっくん・テンキー・復習ほこら・せいせき画面は、このアプリの存在理由
3. **音と演出は3番目** — 子供の没入感には効くが、学習機能の後
4. **終章と寄り道は最後** — 本編がクリアできる今、拡張は伸びしろ
5. **各タスクは既存の設計方針を守る**: アプリ独立 (見た目の共有禁止・コードはコピー方式)、
   iPad タッチ第一、絵文字不使用、データ駆動 + バリデーションテスト

### 1.2 設計計画からの変更・確定事項 (本書で決めること)

- **章=学年の一対一を緩める**: `ChapterDef` に `questionGrades?: number[]` を追加し、
  出題プール (おだい・通常攻撃・復習) はこれを参照する。省略時は `[grade]` (現状と同じ)。
  終章はこれで `[1,2,3,4,5,6]` を指定する。これが終章のブロッカーの解消策
- **ヒント表示はテスト前の「とっくん」と戦闘後の「まちがいノート」の2か所に限定**する。
  戦闘中は現状どおり正解1行のみ (テンポ優先)
- **テンキーは習得テスト・おだい・とっくんのみ**。戦闘は全学年3択のまま (制限時間つき
  でテンキーは幼児に酷)
- **ルビはエンジン対応だけ先行**し、章3〜6の本文を漢字化する作業は任意タスクに切り出す
  (現状のひらがな分かち書きでも読める)
- **音はアセット0方針を維持** (mathematics 同様 WebAudio シーケンサ)。曲はすべてオリジナル
- **終章は「縮約版」で作る**: 5層 + 隠しボス1形態。設計の 2.5h は目安であって必達ではない
- **パーティ入替・転職は引き続きカット** (設計変更ログ 2026-08-17 の判断を維持)

## 2. フェーズ一覧

| フェーズ | ねらい | タスク | 目安 |
|---|---|---|---|
| P0 安全網 | 55マップの回帰検出と数値バランスの根拠づくり | KQ-01〜09 | 9セッション |
| P1 学習体験 | 設計 A4/A6 の「学ぶ」機能を完成させる | KQ-10〜14 | 5セッション |
| P2 ゲーム体験 | 音・エンディング・案内・縦持ち・ルビ・プレイ時間 | KQ-20〜27 | 7セッション |
| P3 拡張 | 終章と寄り道の算数タッチポイント | KQ-30〜34 | 6セッション |
| P4 リリース品質 | iPad 実機性能・E2E の CI 化・本番チェック | KQ-40〜42 | 3セッション |
| P5 学びの設計 | 習っていない単元でも教えて「できる」まで導く (別紙) | [kazu-quest-learning-plan.md](kazu-quest-learning-plan.md) LP-01〜23 | 23セッション |

サイズ: S = 半セッション以内 / M = 1セッション / L = 1セッション超 (分割済み)。

## 3. Sonnet への共通ブリーフ (全タスクの前提)

タスクを渡すときは、このセクションと該当タスクの本文をそのまま貼る。

```
作業ディレクトリ: apps/kazu-quest  (リポジトリ: kids-stady)
設計の正典: docs/kazu-quest-design-plan.md / 本書: docs/kazu-quest-roadmap.md
構成の概観: apps/kazu-quest/README.md (content=データ, game=Phaser, lib=純ロジック, components=React)

必ず守ること
- iPad タッチ第一: 全操作はタップで完結。数値ボタン ≥72px、ナビ/タブ ≥56px。
  パネル内の誤タップで閉じない (背景タップの伝播を止める)。キー操作は補助
- デバイス既定の絵文字は使わない (アイコンは自前SVG or ドット絵)
- 見た目は他アプリと揃えない。他アプリのコードは「コピーして独立させる」(import しない)
- データ駆動: 章・呪文・モンスター・アイテムは src/content/ に足し、エンジンは変えない。
  参照整合性は tests/content.test.ts が守る (新しい EventCommand を足したら検証も足す)
- 純ロジックは src/lib/ に置き Vitest でテスト。React/Phaser の通信は EventBus のみ
- 不変更新 (spread で新オブジェクト)。ファイル 800 行以内。関数 50 行以内を目安
- Phaser→React のキーイベントは「開いたリクエストより古い e.timeStamp を無視」する既存ガードを壊さない

検証コマンド
  npm run typecheck && npm run test        # 常に緑にしてから終える
  npm run build && python3 -m http.server 3012 --directory out &   # E2E は先にビルド→手動serve
  npx playwright test -g "<テスト名の一部>"  # 変更に関係するテストだけ回す。フルは 15〜30分
  (別セッションが並行ビルド中だと next build がハングする。単体で緑なら環境起因)
  dev: npm run dev → http://localhost:3011/?map=<mapId>&spawn=<spawn>  /  ?battle=<monsterId>
  デバッグフック: window.__KAZUQUEST_DEBUG__ (teleport/warp/grantLevel/learnSpell/setFlag/getSave)

終わり方
- 受け入れ条件をすべて満たす。満たせない項目は「未達」と明記して残す (黙って縮小しない)
- 設計判断を変えたら docs/kazu-quest-design-plan.md の変更ログに日付つきで追記
- 本書 (roadmap) の該当タスクの状態を「済」に更新
- コミットは conventional commits (feat/fix/test/docs) + スコープ (kazu-quest)。push はしない
```

## 4. タスク一覧

各タスク: **目的 / 背景 / 触るファイル / 手順 / 受け入れ条件 / スコープ外**。
「状態」列: 未 / 進行中 / 済。

---

### P0 安全網

#### KQ-01 [S] E2E 共通ヘルパーの分離 — 状態: 済

- **目的**: `e2e/smoke.spec.ts` (651行) から操作ヘルパーを `e2e/helpers.ts` に切り出し、
  章3〜6のスペックを別ファイルで書けるようにする
- **背景**: 章ごとにゴールデンパスを足すと 800 行を超える。ヘルパーの重複を避ける
- **触るファイル**: `e2e/smoke.spec.ts` → `e2e/helpers.ts` (新規) + `e2e/chapter1.spec.ts` /
  `e2e/chapter2.spec.ts` に分割。`playwright.config.ts` は変更不要
- **手順**:
  1. `waitForScene / fieldPos / stepOnce / face / teleport / warp / startGame / walkUntil /
     interactAndAdvance / advanceDialog / grindBattleUntilField / takeSpellTestAllCorrect` と
     `declare global` を `helpers.ts` に移し export する
  2. 章1・章2ゴールデンパスをそれぞれの spec に移す。スモーク (dialog/encounter/spell/drill/transfer) は `smoke.spec.ts` に残す
  3. `takeSpellTestAllCorrect` を「N問のテストを全問正解で通す」汎用に整理 (章3以降は問題数が違っても動くこと)
  4. `advanceChapter` 済みセーブを一発で作る `seedChapter(page, n)` ヘルパーを追加:
     `setFlag("cN-1.clear")` + `advanceChapter` 相当を `__KAZUQUEST_DEBUG__` に足す必要があれば
     `src/game/debug*.ts` 側に `advanceToChapter(n)` を追加 (dev/E2E 限定フック)
- **受け入れ条件**: 既存 E2E が全件緑 (章1・章2 各 golden path を `-g` で個別実行して確認)。
  各ファイル 400 行以内。`helpers.ts` の関数に1行コメント
- **スコープ外**: 新しい章のテストを書くこと (KQ-02〜05)

#### KQ-02 [M] 章3 ゴールデンパス E2E — 状態: 済 (依存: KQ-01)

- **目的**: 章3「砂漠の盗賊王と わけまえのピラミッド」を開始→カケル加入→呪文習得→
  ピラミッド→ボス アマリダ→`c3.clear` まで自動で通す
- **背景**: 章3〜6は人手でしか検証されていない。マップ・NPC・フラグの「つながり」は
  バリデーションで守られているが、実プレイの遷移 (transfer/battle/joinParty) は E2E でしか検証できない
- **触るファイル**: `e2e/chapter3.spec.ts` (新規)。必要なら `src/game/debug*.ts` のフック追加
- **手順**:
  1. `src/content/chapters/chapter3/` を読み、必須フラグの順序を `index.ts` の `flags` から起こす
  2. 章2と同じ形式で: `seedChapter(3)` → 開始マップ確認 → 加入イベント → まなびやで必須呪文
     (ストーリーゲートになっているもの) を `takeSpellTestAllCorrect` → `grantLevel` で短縮 →
     ダンジョン → ボス → `c3.clear` と `chapter.current === 4`
  3. 途中で `party` に `kakeru` が入ること、装備店が開くことも assert
- **受け入れ条件**: `npx playwright test -g "chapter 3"` が単体で緑 (retry なしで2回連続)。
  所要 8 分以内。テレポート/ワープを多用してよいが、**ボス部屋への最後の1歩と
  加入イベントは実際に歩いて踏む**
- **スコープ外**: 章3のバランス調整 (見つけた問題は本書の §5 に記録して報告)

#### KQ-03 [M] 章4 ゴールデンパス E2E — 状態: 済 (依存: KQ-01)

KQ-02 と同じ形式で章4 (リトル加入・氷の洞くつ・角度の遺跡・デシマロン・章末の船入手フラグ)。
受け入れ条件・スコープ外も同じ。加えて `party.length === 4` を assert。

#### KQ-04 [M] 章5 ゴールデンパス E2E — 状態: 済 (依存: KQ-01)

KQ-02 と同じ形式で章5 (空→海→城の順番ゲート・マイナドス・ゼロのあな演出・`c5.clear`)。
順番ゲートが hideIf で一本道になっていることを「空の鍵なしで海の番人に話すと通れない」で assert。

#### KQ-05 [M] 章6 ゴールデンパス E2E — 状態: 済 (依存: KQ-01)

KQ-02 と同じ形式で章6 (3つの印→ガウス再会→ゼロム2形態→`c6.orb6`→`c6.clear`)。
**エンディングまで到達する** こと。KQ-22 (エンディング演出) 実装後はこのテストを更新する。

#### KQ-06 [M] タッチ操作 E2E (iPad エミュレーション) — 状態: 済 (依存: KQ-01)

- **目的**: キーボードなしで一連の操作が成立することを機械的に保証する
- **背景**: iPad がメイン環境だが、E2E はすべてキー操作。タップ経路の退行を検出できない
- **触るファイル**: `e2e/touch.spec.ts` (新規)、`playwright.config.ts` に `projects: [{name:"ipad", use: devices["iPad (gen 7)"] + hasTouch}]` を追加 (既定 project はそのまま)
- **手順**: `page.tap` / `locator.tap` のみで (1) タイトル→フィールド (2) 隣接タイルのタップ移動と
  NPC タップで会話 (3) 会話送り (4) 戦闘の たたかう→3択タップ→勝利 (5) メニューボタン→
  タブ切替→閉じる、を通す。`page.keyboard` を使ったら失敗にする lint (spec 内 grep)
- **受け入れ条件**: ipad project で緑。タップターゲット (数値ボタン・タブ) の boundingBox が ≥72/≥56px であることを assert
- **スコープ外**: 実機での確認 (KQ-40)

#### KQ-07 [M] バランス・シミュレータ (純ロジック) — 状態: 済

- **目的**: 章ごとのボス戦を `src/lib/battle/battle.ts` の状態機械だけで N 回自動戦闘し、
  「想定レベル・想定呪文で勝率がどうなるか」を数値で出す。ボス前の すいしょうレベル (KQ-23) の根拠にする
- **背景**: 設計は「グラインド不要・ボスは呪文2〜3発」だが、章3〜6は数値を置いただけで検証していない (ボスHPは 260〜1400)
- **触るファイル**: `tests/balance.test.ts` (新規) + `scripts/balance-report.ts` (新規、`npx tsx` or vitest 経由)。
  エンジンは変えない
- **手順**:
  1. 各章について「章クリア想定パーティ (メンバー・Lv・その章の呪文全部・店売り最強装備)」を定義
  2. 単純AI (HPが50%未満なら回復、それ以外は最大威力の呪文、正答率 p=0.8 で発動) で
     ボス戦を 200 回。勝率・平均ターン数を集計
  3. 想定Lv、想定Lv−3、想定Lv+3 の3点で出す
  4. `docs/kazu-quest-balance.md` に表として出力 (スクリプトで再生成できるようにする)
- **受け入れ条件**: テストとして「想定Lvで勝率 ≥ 70%」「想定Lv−3 で ≤ 95% (ぬるすぎない)」を assert。
  破綻している章があれば **数値を直さず** レポートに赤字で残して報告 (調整は別タスク)
- **スコープ外**: 数値調整そのもの、雑魚戦のEXP曲線検証 (余力があれば「必須戦闘だけで想定Lvに届くか」を概算)

#### KQ-43 [S] ゲート迂回路の封鎖 (章3〜6 ワールド・氷の洞くつ) — 状態: 済

- **目的**: 章3〜6 の E2E 作成中に見つかった「番人NPCの横を通れる」迂回路を地形で塞ぎ、
  呪文習得・鍵・印のストーリーゲートを実際に機能させる。氷の洞くつの中ボスを必須戦闘にする
- **触るファイル**: `world3.ts` / `world4.ts` / `world5.ts` / `world6.ts` / `icecave.ts` の grid のみ
- **受け入れ条件**: バリデーション緑、章3〜6 golden path E2E 緑 (番人はフラグ後に消えるので経路は不変)

---

### P1 学習体験

#### KQ-08 [M] ボス数値の再調整 (章2〜5) — 状態: 済 (依存: KQ-07, KQ-02〜05)

- **目的**: KQ-07 のシミュレータで「想定Lv−3 でも勝率100%」だった章2〜5のボス (中ボス含む) の
  HP/atk/def を、想定Lv−3 で勝率 60〜90%、想定Lv で ≥ 85% の帯に入るまで引き上げる
- **背景**: `docs/kazu-quest-balance.md` の 要調整 節。幹部イレイサー (章1) とゼロム連戦 (章6) は
  適正帯なので触らない。低学年向けなので「難しすぎ」側には倒さない (想定Lv で ≥ 85%)
- **触るファイル**: `src/content/monsters.ts` (該当ボスのみ)、`tests/balance.test.ts` (skip/todo の解除)、
  `docs/kazu-quest-balance.md` (再生成)。E2E の `grantLevel(n)` は十分高いので原則変更不要
- **受け入れ条件**: `tests/balance.test.ts` の skip/todo が 0 件で緑。章2〜6 golden path E2E 緑
- **スコープ外**: 雑魚のEXP曲線

#### KQ-09 [S] タップ移動の即応 (iPad) — 状態: 済 (依存: KQ-06)

- **目的**: フィールドで「一瞬のタップ」でも1歩動くようにする。現状は `pointerHeld` を
  フレームごとに読むため、touchstart→touchend が1フレーム内に収まると動かない (KQ-06 で実測)
- **触るファイル**: `src/game/scenes/FieldScene.ts` (pointerdown 時にタップしたタイル方向へ
  1歩をキューする)、`e2e/touch.spec.ts` (CDP の押し続けエミュレーションを `page.touchscreen.tap`
  に戻して緑になることを確認)
- **受け入れ条件**: touch E2E が `touchscreen.tap` で緑。キー操作・押し続け移動は不変

#### KQ-10 [M] 戦闘後の「まちがいノート」 — 状態: 済

- **目的**: 戦闘中に間違えた問題を集め、戦闘後リザルトで `explain` (ステップ解説) を見せる。
  メニューからも直近の間違いを読み返せる
- **背景**: 設計 A6 の中核。curriculum は全問に `explain: string[]` と `hint` を持っているのに表示していない
- **触るファイル**: `src/lib/save.ts` (`mistakes: MistakeEntry[]` cap 20 を追加・normalize)、
  `src/game/battle/mathRequest.ts` (不正解時に蓄積)、`src/components/MistakeNoteOverlay.tsx` (新規)、
  `src/components/StatusPanelOverlay.tsx` (タブ「ノート」追加)、`src/game/scenes/BattleScene.ts`
  (勝利後に `EventBus.emit("show-mistake-note", entries)`)
- **手順**:
  1. `MistakeEntry = { ts, skillId, text, answer, chosen, explain: string[] }` を定義、`recordMistake(save, entry)` 純関数 + テスト
  2. 戦闘勝利の演出 (`playVictory`) の後・フィールド復帰の前に、間違いが1件以上あればオーバーレイを表示。
     「つぎへ」で1問ずつ、最後に「とじる」。全滅時は出さない
  3. ステータスパネルに「ノート」タブ。直近 20 件を新しい順。タップで解説展開
  4. DQ風二重枠、既存 `uiTheme.ts` のトークンを使う。文字は大きめ (≥20px)
- **受け入れ条件**: Vitest (`recordMistake` の cap・normalize) 緑。E2E: 章1 encounter テストを拡張し、
  わざと不正解 → 勝利後にノートが出て「とじる」で field に戻る。キー操作なしで閉じられる
- **スコープ外**: さくらんぼ図の描画 (KQ-11)、テストの不正解の蓄積 (KQ-11 で扱う)

#### KQ-11 [M] とっくん (ヒントつき練習) + さくらんぼ図 — 状態: 済 (依存: KQ-10)

- **目的**: 習得テストの前に「とっくん する?」を挟み、時間無制限・ヒント表示・不正解で即解説の練習モードを提供する
- **背景**: 設計 A4。不合格→再挑戦のループだけでは学べない
- **触るファイル**: `src/components/CherryDiagram.tsx` (mathematics からコピーして独立させる)、
  `src/components/MathPromptPanel.tsx` (`showHint` オプション、`practice` context)、
  `src/components/SpellTestScreen.tsx` / `useQuestionLoop.ts` (練習セッション)、
  `src/lib/events/runner.ts` (`openSpellTest` の前段 choice はコンテンツ側でなくエンジン側で自動挿入)
- **手順**:
  1. `MathPromptRequest.context` に `"practice"` を追加。practice のときヒントボタン
     「ヒント」を表示、押すと `hint` (CherryHint はさくらんぼ図、それ以外は文章) を出す
  2. 不正解時は `explain` を全文表示してから次へ (正解時は短い祝福だけ)
  3. `openSpellTest` 実行時: 「とっくんしてから テストする? / すぐ テストする?」の choice を UiScene 経由で出す。
     とっくんは 5 問、合否なし、終了後にそのままテストへ
  4. テスト不合格時: 間違えた問題を KQ-10 の `mistakes` に積み、「とっくんから やりなおす?」を提示
- **受け入れ条件**: E2E (章1 spell テストを拡張): とっくんを選ぶ → ヒントボタンが出る →
  5問終えるとテストが始まる → 合格で習得。Vitest: `practice` context では `timeLimitMs === null`。
  さくらんぼ図は g1_add_carry / g1_sub_borrow で表示される (スクリーンショットを1枚 `test-results/` に残す)
- **スコープ外**: 小3以降向けの図解 (ひっ算図など) — 文章ヒントで可

#### KQ-12 [M] テンキー入力モード (小3以降のテスト・おだい・とっくん) — 状態: 済 (依存: KQ-11)

- **目的**: `MathPromptPanel` に `inputMode: "choices" | "keypad"` を実装し、章3以降の
  習得テスト・おだいドリル・とっくんはテンキーで答える
- **背景**: 設計 A4/B6。3択は当てずっぽうで通る。小3以降は自分で数を書かせたい
- **触るファイル**: `src/components/MathPromptPanel.tsx` (分割して `Keypad.tsx` 新規)、
  `src/components/useQuestionLoop.ts` (学年で inputMode 決定)、`src/lib/curriculum/answer.ts` (新規: 正規化比較)
- **手順**:
  1. `normalizeAnswer(s)`: 全角→半角、先頭0除去、`1/2`・`0.5` の表記ゆれは **問題の `answer` 表記に合わせる** (分数問題は分数、小数は小数)。単位つき答え (`cm` 等) は数値部分のみ比較。Vitest でパターン網羅
  2. `Keypad`: 0〜9、`.`、`/`、`−` (小6の負数がなければ省く)、`けす`、`こたえる`。各キー ≥72px、
     3列×4段 + 表示欄。iPad 横持ちでパネルに収まること
  3. `inputMode` の決定: `context === "battle"` は常に choices。それ以外は `problem.skillId` の学年 ≥ 3 で keypad
  4. `data-testid` を付けて E2E から `tap` で打てるようにする。`takeSpellTestAllCorrect` を keypad 対応に (helpers)
- **受け入れ条件**: Vitest (`normalizeAnswer`) 緑。E2E: 章3 golden path (KQ-02) の習得テストが keypad で通る。
  章1のテストは引き続き3択。Playwright ipad project でキーの boundingBox ≥72px
- **スコープ外**: 手書き認識、戦闘中のテンキー

#### KQ-13 [S] ふくしゅうのほこら (弱点3単元の復習クエスト) — 状態: 済

- **目的**: 各町のほこらで「にがてな もんだいを ふくしゅうする?」→ 弱点上位3スキルから10問 → ひらめきメダル
- **背景**: 設計 A6。`pickSkill` の弱点重み付けは戦闘で効いているが、能動的な復習の入口がない
- **触るファイル**: `src/content/types.ts` (`{ type: "openReviewQuest" }`)、`src/lib/events/runner.ts`、
  `src/components/DrillQuestScreen.tsx` (復習セッション: `skillIds = 弱点3つ`)、`src/content/items.ts`
  (`hiramekiMedal` kind:"key")、各章のほこらマップの NPC に dialog を1本追加
- **手順**:
  1. 弱点選定は `save.skillStats` から純関数 `weakSkillIds(stats, implementedIds, min=5, limit=3)` (shared の `weakSkills` と同じ規則) + テスト。
     弱点が3つ未満なら現在の章の `attackSkillIds` で埋める
  2. 10問終了: 8問以上でメダル1枚 + ゴールド (おだいと同じ単価)。何度でも可
  3. 章1〜6の各ほこら (めがみのほこら) に「ふくしゅう」の選択肢を追加。バリデーションに新コマンドを登録
- **受け入れ条件**: Vitest 緑 (弱点選定・バリデーション)。E2E: 王都のほこらで復習を選び 10 問 → メダル所持を assert
- **スコープ外**: メダル交換所 (KQ-31)

#### KQ-14 [M] ぼうけんのせいせき画面 — 状態: 済

- **目的**: 学年別の正答率・弱点単元・日別の学習量・プレイ時間・章クリア状況を見せる画面。
  ステータスパネルのタブ「せいせき」とタイトルから開ける
- **背景**: 設計 A7-9 / M10。共有学習ログ (`kidsStudy.learning.v1`) はすでに書いているが、カズクエ内から見る手段がない
- **触るファイル**: `src/components/StatsScreen.tsx` (mathematics からコピーし、カズクエの世界観で作り直す — 見た目は共有しない)、
  `src/components/StatusPanelOverlay.tsx`、`src/game/scenes/TitleScene.ts` (KQ-22 のタイトルメニューがあればそこに)
- **手順**:
  1. データ: `skillReports(loadLearning(profileId))` を `kq_` 接頭辞でフィルタ + `save.skillStats` を学年別に集計する純関数 (`src/lib/stats.ts` 新規、テスト)
  2. 表示: 学年ごとの帯グラフ (SVG 自前)、弱点3単元 (ラベルは `SKILLS` から)、直近14日の日別正解数、章クリア状況 (6つの数晶の点灯)
  3. 「せいせき」タブは子供にも読める文言 (「とくい」「もうすこし」)
- **受け入れ条件**: Vitest (集計) 緑。E2E: ステータスパネル → せいせき → 帯グラフ要素が描画される。絵文字不使用
- **スコープ外**: 保護者向けの詳細分析 (ハブページの せいせき画面が担う)

---

### P2 ゲーム体験

#### KQ-20 [M] 効果音 (アセット0 WebAudio) — 状態: 済

- **目的**: カーソル・決定・打撃・呪文成功/不発・正解/不正解・レベルアップ・宝箱・扉・回復・セーブ の効果音
- **背景**: 設計 M10。mathematics の `src/game/sfx.ts` (112行、OscillatorNode ベース) を**コピーして独立**させ、音色はカズクエ用 (ファミコン風・矩形波) に作り直す
- **触るファイル**: `src/game/audio/sfx.ts` (新規)、`BattleScene.ts` / `FieldScene.ts` / `UiScene.ts` / `MathPromptPanel.tsx` の各イベント箇所、
  `StatusPanelOverlay.tsx` (音量: おん/オフ トグル、セーブに `settings.sound` を追加)
- **手順**: AudioContext は最初のタップで resume (iOS 制約)。各シーンの既存イベント (`BattleEvent`・`ui-*`) に薄く挿す。
  React 側は EventBus 経由で `play("correct")` を呼ぶ (直接参照禁止)
- **受け入れ条件**: E2E は「音の呼び出しが例外を出さない」まで (Playwright は無音)。
  `sfx.ts` 単体テスト: 名前→パラメータ表の網羅、未知の名前で throw しない。iOS で最初のタップ後に鳴ることは手動確認項目に記録
- **スコープ外**: BGM (KQ-21)

#### KQ-21 [M] BGM (チップチューン・シーケンサ) — 状態: 済 (依存: KQ-20)

- **目的**: タイトル / 町 / フィールド / ダンジョン / 戦闘 / ボス / エンディング の7曲
- **背景**: mathematics の `bgm.ts` (147行) が移植元。曲はすべてオリジナル (DQ の旋律を模倣しない)
- **触るファイル**: `src/game/audio/bgm.ts` (新規)、`src/content/music.ts` (新規: 曲データ = 文字列の音符列)、
  `MapDef.theme` → 曲の対応表、`BattleScene` (boss フラグで曲切替)、シーン遷移 (`transition.ts`) でフェード
- **手順**: マップ遷移で同じ曲なら継続、違えば 300ms クロスフェード。ループ。おん/オフは KQ-20 の設定と共通
- **受け入れ条件**: 曲データのバリデーションテスト (音符の文法・小節長)。E2E: マップ遷移後に例外なし。7曲それぞれ 8〜16 小節
- **スコープ外**: 曲の作り込み (まず成立させる)

#### KQ-22 [M] エンディング演出 + タイトルメニュー + クリア後状態 — 状態: 済

- **目的**: (1) `c6.clear` 時に `EndingScene` (6つの数晶→スタッフロール風の学習サマリ→「おしまい」) を流す
  (2) タイトルに「つづきから / はじめから / せいせき」 (3) クリア後はホシオキから再開でき、王都の王が称号に言及する
- **背景**: 現状エンディングはメッセージ8ページ、タイトルは1択。クリア後の遊び (終章・復習) の入口も必要
- **触るファイル**: `src/game/scenes/EndingScene.ts` (新規)、`TitleScene.ts`、`src/lib/save.ts` (`cleared` に 6 を積む)、
  `chapter6/maps/zeromCastle.ts` (最後の message の後に `{ type: "ending" }` 新コマンド)、`runner.ts`、
  `chapter1/maps/capital.ts` (王の dialog に `c6.clear` 分岐を1本)
- **手順**:
  1. `EndingScene`: 黒背景に数晶6つが順に点灯 → 「あなたの ぼうけん」(戦った回数・覚えた呪文・正解数・プレイ時間) → 「おしまい」→ タップでタイトル
  2. タイトル: セーブがあれば「つづきから」を既定。「はじめから」はセーブ上書きの2段階確認 (プロフィール削除と同じ作法)
  3. クリア後の再開位置はホシオキの ほこら (checkpoint 更新)
- **受け入れ条件**: E2E 章6 golden path (KQ-05) を更新し、Ending → Title → つづきから → ホシオキで復帰まで通す。
  「はじめから」の誤タップでセーブが消えない (確認で「いいえ」→ 無変更) を assert
- **スコープ外**: 終章の解放 (KQ-30)。ただし `c6.clear` 後にほこらで「まだ なにかが…」の1行は入れておく

#### KQ-23 [S] ボス部屋前の すいしょうレベル案内 — 状態: 済 (依存: KQ-07)

- **目的**: 各章のボス部屋直前に立て札 (inspect イベント) を置き、「すいしょう Lv N / いまの ゆうしゃ Lv M」を表示。
  下回っていれば「まず まなびやか おだいで きたえよう」
- **触るファイル**: 各章ボス部屋マップ (`events` に1件)、`src/content/types.ts` に `{ type: "levelSign"; level: number }`、
  `runner.ts`、`content.test.ts` (全章にちょうど1つあること)
- **受け入れ条件**: バリデーションに「ボス (`boss:true` の battle) を持つマップごとに levelSign が1つ」。数値は KQ-07 の表から
- **スコープ外**: 入室制限 (あくまで案内)

#### KQ-24 [S] 縦持ち警告オーバーレイ — 状態: 済

- **目的**: iPad を縦に持ったとき「よこむきに してね」の全画面表示 (DQ風の枠)。横に戻すと消える
- **触るファイル**: `src/components/OrientationGuard.tsx` (新規)、`src/app/page.tsx`
- **手順**: `matchMedia("(orientation: portrait)")` + `resize`。表示中はゲーム入力を止めない (Phaser は動かしたまま覆うだけ)
- **受け入れ条件**: Playwright で viewport 768x1024 → 表示、1024x768 → 非表示。絵文字不使用
- **スコープ外**: 縦持ちレイアウト対応

#### KQ-25 [M] ルビのエンジン対応 (章3以降の本文用) — 状態: 済

- **目的**: 会話ページの文字列に `｜漢字《かんじ》` (青空文庫記法) を書けるようにし、DOM の会話ウィンドウで `<ruby>` 描画する
- **背景**: 設計 B11。会話は DOM 化済みなので CSS で成立する。Canvas 側 (戦闘メッセージ) は対象外
- **触るファイル**: `src/lib/text/ruby.ts` (新規: パーサ、純関数)、`src/components/GameUiOverlay.tsx` (描画)、
  `tests/content.test.ts` (記法の括弧が対応していること)、`globals.css` (ruby のサイズ)
- **受け入れ条件**: パーサの Vitest (通常文・記法混在・不正記法)。章3の冒頭1会話だけ試験的に記法を入れて E2E で `<ruby>` が出る
- **スコープ外**: 章3〜6の本文全体の漢字化 (KQ-26)

#### KQ-26 [L・任意] 章3〜6 の本文の漢字+ルビ化 — 状態: 保留 (ユーザー判断待ち §6-2。エンジン対応 KQ-25 は済)

学年配当漢字 (小3は小1〜3の漢字まで、以下同様) の範囲で本文を書き換える。1章 = 1セッション。
受け入れ条件: バリデーション緑 + 各章 golden path 緑。**任意** (ひらがなのままでも成立する)。

#### KQ-27 [S] プレイ時間の計測 — 状態: 済

- **目的**: `playtimeMs` を実際に加算し、せいせき (KQ-14) とエンディング (KQ-22) で使う
- **触るファイル**: `src/game/session.ts` (`tickPlaytime(deltaMs)`)、`FieldScene` / `BattleScene` の `update` から呼ぶ、autosave 時に書く
- **受け入れ条件**: Vitest (加算・normalize)。E2E: 30 秒プレイ後の `getSave().playtimeMs` が 20000 以上
- **スコープ外**: タブ非表示中の除外 (`visibilitychange` で止める程度は入れてよい)

---

### P3 拡張

#### KQ-30a [M] 章の出題プールを学年から切り離す (`questionGrades`) — 状態: 済

- **目的**: `ChapterDef.questionGrades?: number[]` を追加し、おだい・通常攻撃・復習が「章の学年」でなく
  これを見るようにする。省略時 `[grade]`。終章 (KQ-30b) のブロッカー解消
- **背景**: 設計変更ログ 2026-08-17 「章7を作ると出題が学年なしにフォールバックする」
- **触るファイル**: `src/content/types.ts`、`src/lib/curriculum/drills.ts`、`src/game/field/effectHandlers.ts` (`grade = chapter.current` の箇所)、
  `BattleScene.ts` (`attackSkillIds` はそのまま)、`content.test.ts` (指定学年が 1〜6 の範囲・実装済み)
- **受け入れ条件**: 章1〜6の挙動不変 (E2E golden path 緑)。Vitest: `questionGrades:[1,2]` の章でドリルが両学年から出る
- **スコープ外**: 終章のコンテンツ

#### KQ-30b [L] 終章「ムゲンのらせん」+ 隠しボス ∞竜ムゲニア — 状態: 済 (依存: KQ-30a, KQ-22)

- **目的**: クリア後にホシオキのほこらから入れる裏ダンジョン 5層 + ボス。出題は小1〜6ミックス
- **触るファイル**: `src/content/chapters/chapter7/` (新規: index/legends/maps)、`monsters.ts` (色違い 5種 + ムゲニア)、
  `spells.ts` (呪文追加なし)、`chapters/index.ts`、`hoshioki.ts` (入口 NPC: `c6.clear` で出現)
- **手順**: 各層は既存タイルのパレット差し替え (ネガリアと同じ方式)。層ごとに「その学年の扉クイズ」(小1→小5) で降り、
  最下層でムゲニア (HP は KQ-07 の表で章6ボスの 1.3 倍を目安、1形態)。撃破で `c7.clear` + 称号「ムゲンの ゆうしゃ」
- **受け入れ条件**: バリデーション緑。章7 golden path E2E (`e2e/chapter7.spec.ts`)。KQ-07 のシミュレータに章7を追加
- **スコープ外**: 周回要素、ランダム生成

#### KQ-31 [S] NPC ミニクイズ + ひらめきメダル交換所 — 状態: 済 (依存: KQ-13 のメダル)

各章の町に 1〜2 人「クイズ好き」NPC (既存 `quiz` コマンドで onceFlag つき、正解でメダル1枚)。
王都に収集家: メダル 3/6/10 枚で装備と交換 (`{ type: "exchange"; itemId; cost }` を追加 or `choice` + `giveItem` で組む)。
受け入れ条件: バリデーション緑、章1 E2E で1件交換。

#### KQ-32 [S] すうじのカギつき宝箱 — 状態: 済

章1〜3のダンジョンに各1つ、`quiz` ゲート付き宝箱 (不正解でも再挑戦可・ペナルティなし)。コンテンツのみ。
受け入れ条件: バリデーション緑、既存 golden path 緑。

#### KQ-33 [S] お店のおつりチャレンジ — 状態: 済

購入確定後に「おつりは いくら?」(小2ひっ算 / 小3以降は3桁) を任意で出し、正解で代金の 10% 返金。断れる。
触るファイル: `runner.ts` の `openShop` 後処理 or `UiScene.showList` の購入コールバック、`mathRequest.ts` の `requestFieldQuiz` を再利用。
受け入れ条件: Vitest (返金計算)、E2E: 王都の道具屋で購入 → チャレンジ → 正解でゴールド増。

#### KQ-34 [S] とけい塔の鐘 (王都) — 状態: 済

王都に とけい塔 (inspect): とけいの問題 (g1_clock) 正解で `c1.bellRang` を立て、時間帯限定 NPC (hideIf の逆 = `if` 条件で出現) が現れて
ヒント or メダルをくれる。コンテンツのみ。

---

### P4 リリース品質

#### KQ-40 [M] iPad 実機パフォーマンス監査 — 状態: 済

- **目的**: 大きいマップ (各章のワールド) でのフレームレートを実測し、50fps を下回るなら対策する
- **背景**: タイルはタイルごとの静的 Image (Phaser 4.2 で DynamicTexture が描けなかったための回避)。
  ワールドマップは数千スプライトになりうる
- **手順**: `?debug=1` で FPS 表示 (Phaser の `game.loop.actualFps`) を左上に出す →
  Chrome DevTools の CPU 4x スロットルで 6 章のワールド + 戦闘を計測 → 表にする。
  下回る場合: (a) カメラ外タイルの `setVisible(false)` カリング (b) Phaser 現行版で `RenderTexture` 焼き込みを再スパイク、の順で試す
- **受け入れ条件**: `docs/kazu-quest-perf.md` に計測表。対策した場合は E2E 全緑。実機 iPad の数値は **ユーザーが確認する手順** として書く
- **スコープ外**: Phaser のバージョン更新

#### KQ-41 [S] E2E の CI 実行 (サブセット) — 状態: 済 (依存: KQ-01)

`.github/workflows/e2e.yml` (新規、push/PR): Chromium だけ、`smoke.spec.ts` + `touch.spec.ts` を実行。
golden path は `workflow_dispatch` の手動起動で全章 (30分枠)。失敗時に trace を artifact 保存。
受け入れ条件: Actions が緑になるまで (Playwright のブラウザキャッシュを使う)。

#### KQ-42 [S] 本番プレイスルー・チェックリスト + docs 同期 — 状態: 済

`docs/kazu-quest-release-checklist.md`: GitHub Pages のサブパスで (1) プロフィール作成 (2) 章1の 10 分
(3) 各章の冒頭に `?map=` で飛ぶ (本番は debugBoot が無効なので、セーブ改変手順を書く) (4) 音 (5) 縦持ち (6) iPad Safari の「ホーム画面に追加」。
README と設計計画の「ステータス」行を更新。

## 5. 依存関係と並列実行

```
KQ-01 ─┬─ KQ-02 ─┐
       ├─ KQ-03  │
       ├─ KQ-04  ├─ (章3〜6の安全網が揃う) ─ KQ-12 の E2E / KQ-22 / KQ-30b
       ├─ KQ-05 ─┘
       ├─ KQ-06
       └─ KQ-41
KQ-07 ─── KQ-23
KQ-10 ─── KQ-11 ─── KQ-12
KQ-13 ─── KQ-31
KQ-20 ─── KQ-21
KQ-22 ─┬─ KQ-30b
KQ-30a ┘
KQ-25 ─── KQ-26 (任意)
```

同時に走らせてよい組 (触るファイルが重ならない):
- **第1波**: KQ-01 / KQ-07 / KQ-24 / KQ-27
- **第2波**: KQ-02〜05 (章ごと別ファイル) / KQ-06 / KQ-10 / KQ-20
- **第3波**: KQ-11 / KQ-13 / KQ-14 / KQ-21 / KQ-23 / KQ-30a
- **第4波**: KQ-12 / KQ-22 / KQ-25 / KQ-31〜34
- **第5波**: KQ-30b / KQ-26 / KQ-40 / KQ-41 / KQ-42

並列時の注意: `next build` の同時実行はハングする (memory 参照)。E2E を回すタスクは1つずつ。

## 6. 未決事項 (ユーザー判断)

1. **終章 (KQ-30b) をやるか**: 本編で 6 学年を網羅している。復習は KQ-13 (ふくしゅうのほこら) でも成立する。
   提案: P0〜P2 を終えてから判断
2. **ルビ化 (KQ-26)**: ひらがな分かち書きのままでも小3以上は読める。提案: エンジン対応 (KQ-25) まで
3. **音の ON/OFF の既定値**: 提案は ON (子供は音があると続く)。保護者が消せるトグルは必須
4. **CI の E2E (KQ-41)**: GitHub Actions の実行時間を使う。提案: サブセットのみ自動、全章は手動起動

## 7. 実行ログ (2026-09-14)

- 実行方式: ファイル所有権で分割した並列サブエージェント 5 波 (§5 の組) + オーケストレータが
  ビルド・E2E・コミットを一元管理 (`next build` の同時実行を避けるため)
- 結果: **フル E2E 35 件緑** (default 33 + ipad 2)、Vitest 1466 件緑、typecheck 緑
- 追加で見つけて対処したもの: KQ-08 (章2〜5 ボスが想定Lv−3 で勝率100% → 再調整)、
  KQ-09 (瞬間タップで動かない → pointerdown で1歩キュー)、KQ-43 (番人の迂回路)、
  デバッグフック `grantLevel` をパーティ全員対象に (終盤ボスの E2E が全滅していた)
- 設計判断: テンキーは戦闘外のみ / ヒントは とっくん と まちがいノート の2か所 /
  終章は `chapter.current` を進めず ほこらから transfer で入る (`questionGrades` と
  `chapterForMap` で出題プールを決める) / 音は既定 ON、メニューでオフ可
- 未着手: KQ-26 (章3〜6 本文の漢字+ルビ化、任意)。エンジン側 (KQ-25) は済で、章3 冒頭に
  試験的なルビが1語入っている
- 人手で確認する項目: [kazu-quest-release-checklist.md](kazu-quest-release-checklist.md)
  (iPad 実機の音・FPS・ホーム画面追加)

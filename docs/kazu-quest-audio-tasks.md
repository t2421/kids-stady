# カズクエ 音の作り込み — タスク仕様 (AU-01〜10、Sonnet 移譲用)

> 渡すときは [kazu-quest-roadmap.md](kazu-quest-roadmap.md) §3 の共通ブリーフ + 本書 §0〜§2 + 該当タスクの
> 本文を貼る。並列運用は `parallel-agent-waves` スキル。「状態」列: 未 / 進行中 / 済。
> **1 タスク = 1 セッション**。タスク内で §2 の契約を変えたくなったら、変えずに報告する。

## 0. 現状の診断 (事実。エージェントはここを再調査しない)

「BGM も効果音も無い」という体感の原因を調べた結果、**実装は存在するが、聞こえない・鳴らない場面が
大半**、というのが正確な状態。

| 項目 | 事実 (2026-09-16 時点、`apps/kazu-quest`) |
|---|---|
| 効果音 | **実装済み** (KQ-20)。`src/game/audio/sfxTable.ts` に 18 種 (cursor / confirm / cancel / hit / critical / miss / spellCast / spellFizzle / heal / correct / wrong / levelUp / treasure / door / save / encounter / victory / defeat)。WebAudio 合成 (矩形波・三角波・LFSR ノイズ)、音源ファイル 0 |
| BGM | **実装済み** (KQ-21)。`src/content/music.ts` に 7 曲 (title / town / field / dungeon / battle / boss / ending)、`src/game/audio/bgm.ts` がステップシーケンサで再生。300ms クロスフェード、iOS の初回タップ待ち対応 |
| テスト | `tests/sfx.test.ts` (名前の網羅・値域)、`tests/music.test.ts` (記譜文法・8〜16 小節・全マップのテーマ網羅)、`e2e/sound.spec.ts` (トグル保存・戦闘/遷移で例外なし・`__KAZUQUEST_BGM__.current()`) すべて緑 |

見つかった穴は 3 つ。**本計画はこの 3 つを埋める**。

1. **学びの設計の全画面が無音** (最重要)。`LessonScreen` / `LessonPractice` / `LessonTest` / `LessonFaded` /
   `LessonWorkedExample` / `TeacherMenu` / `ReadinessScreen` / `ReviewScreen` / `PreviewMenu` / `MasteryMap` /
   `StatsScreen` の 11 コンポーネントと `game/field/lessonFlow.ts` に `playSfx` / `playBgm` の呼び出しが **0 件**
   (`grep -rn "playSfx(" src` で確認)。以前は `MathPromptPanel.tsx` が正解/不正解音を鳴らしていたが、学びの設計
   (LP-09〜20) で全呪文の習得がレッスン経由になり、レッスンは `MathChoices` / `Keypad` を直接描くため、
   **プレイ時間の大半 (単元の学習) が丸ごと無音**になった。これは学びの設計で生まれた退行。
2. **音量が小さく、調整手段がオン/オフしかない**。BGM の音量定数は lead 0.05 / bass 0.08 / drum 0.03、効果音の
   gain は 0.07〜0.28。マスターバスが無く各ノードが `destination` に直結。iPad のスピーカーだと環境音に負ける
   水準で、`settings.sound` は boolean のみ (`src/lib/save.ts`)。
3. **曲が薄く、章ごとの違いが無い**。全曲が 2 声 (矩形波リード + 三角波ベース) + ハイハット/キックのみ、8〜16 小節、
   `THEME_SONGS` は grass / forest / desert / snow / interior を **全部同じ "town" / "field"** に写すので
   **6 章の町がすべて同じ曲**。KQ-21 が「曲の作り込みはスコープ外 (まず成立させる)」で止まったまま。

本計画で **やらないこと**: 音源ファイル (ogg/m4a) の導入。設計計画 (`kazu-quest-design-plan.md` §「音」/「IP安全性」)
の「アセット 0・すべてオリジナル」方針を維持する。ファイル導入は別途の判断が要る (§8)。

## 1. 方針の確定 (決定済み)

| 論点 | 決定 | 理由 |
|---|---|---|
| 音源 | **アセット 0 のまま** WebAudio 合成を作り込む | 設計計画の IP 方針・静的配信の容量・iOS の再生制約が今の構造で解決済み。まず合成の質を上げ、iPad 実機で足りるか判断する (§8) |
| 音量 | `settings.sound` (boolean) は残し、**`settings.volume: 0 / 1 / 2 / 3`** (オフ / ちいさい / ふつう / おおきい) を追加。既定 2 | 既存セーブと E2E を壊さない。子どもが触るのは 4 択のボタンで十分 |
| 学びの音 | 効果音は **全画面に**、BGM は **レッスン中とテスト中だけ専用曲に切り替え**、閉じたら元の曲へ戻す | 学習時間が最長なので最優先。「テストの緊張 → 合格の解放」を音で作る |
| 呼び出し規約 | React / Phaser どちらからも `@/game/audio/sfx` `@/game/audio/bgm` を **直接 import してよい** | `sfx.ts` 冒頭のコメントどおり (副作用のみの共有ユーティリティ。EventBus 経由の規約は「状態」の受け渡し用) |
| E2E | Playwright は無音なので、**フック `__KAZUQUEST_AUDIO__` (直近に鳴らした効果音の記録) で「鳴らそうとした」を検証**する | 既存の `__KAZUQUEST_BGM__.current()` と同じ思想。実機の聞こえ方はリリースチェックリストの手動項目 |
| 曲の増やし方 | 町は **章ごとに 1 曲** (6 曲)。テーマ (地形) ではなく章で選ぶ | 同じ地形テーマが複数章で使われるため。旅・洞くつは共通のまま作り込む |

## 2. 固定インターフェース (全タスクが従う契約)

### 2.1 効果音の追加名 (AU-02 が `sfxTable.ts` に定義。他タスクはこの名前だけを使う)

`SfxName` に以下 14 種を **追加** (既存 18 種は変えない。`tests/sfx.test.ts` の `EXPECTED_NAMES` も同時に更新):

| 名前 | 鳴らす場面 | 音の意図 (ファミコン風・≤ 2 秒) |
|---|---|---|
| `pageTurn` | レッスンの「つぎへ」 | 短い紙めくり (ノイズ短 + 高い矩形波 1 音)。cursor より柔らかい |
| `lessonOpen` | レッスン画面が開く | 上昇 3 音の優しいチャイム (三角波) |
| `hintReveal` | れんしゅうでヒントが 1 段深くなる | 「ピコッ」1 音 + 短い下降。責めない音 |
| `practiceLevelUp` | れんしゅう Lv1→2→3 に上がる | 2 音の短いファンファーレ (levelUp より短く軽い) |
| `testStart` | テスト開始 | 低い「ドン」+ 短いトリル (encounter より穏やか) |
| `testPass` | テスト合格 (→ できる) | victory と別の 5 音ファンファーレ + ベース。0.9〜1.2 秒 |
| `testFail` | テスト不合格 (→ べつの説明へ) | 2 音のゆっくり下降 (三角波)。defeat より短く・明るめ |
| `mastered` | おさらいで マスター に到達 | きらめくアルペジオ (矩形波 + 三角波の重ね)。levelUp と区別できる音程 |
| `shard` | かけらを 1 個入手 | treasure より短い「キラッ」1〜2 音 |
| `crystal` | かけら 6 個 → 数晶完成 | 和音の持続 (3 声同時) + 上昇。本計画で最も豪華な音、≤ 2 秒 |
| `gateOpen` | 章ゲートの番人が消える | 低いゴロゴロ (ノイズ低域) → 上昇する矩形波 |
| `companion` | なかまが口を挟むページ | 短い 2 音の「ピポッ」(キャラの声の代わり) |
| `teacherGreet` | 先生メニューが開く | 木琴風の 3 音 (三角波、gate: true) |
| `colorReturn` | ネガリアの色戻し段階が上がる | ゆっくり開く和音 (三角波 3 声、1.5 秒) |

制約: 既存テストの値域 (duration ≤ 2、gain ≤ 1、steps は時間順) を守る。`SFX_NAMES` は `Object.keys(SFX_TABLE)`。

### 2.2 音量 (AU-01 が実装)

- `SaveSettings` に `volume: 0 | 1 | 2 | 3` を追加、既定 `2`。`normalizeSettings` は無い/不正なら既定。
  `sound: false` は従来どおり完全ミュート (`volume` と独立)。`docs/save-data.md` の該当節を更新。
- `src/game/audio/sfx.ts` に **マスターバス**: `GainNode (master) → DynamicsCompressorNode → destination`。
  効果音・BGM の全ノードは `destination` ではなく `getMasterBus()` に接続する。
  `volume` → gain は `[0, 0.35, 0.7, 1.0]`。`setVolume(v)` / `getVolume()` を公開。
- **既定の聞こえ方を上げる**: BGM 定数を lead 0.12 / bass 0.14 / drum 0.06 に、効果音は表の gain を平均 1.6 倍に
  (相対バランスは保つ)。コンプレッサ (threshold -18dB, ratio 4) で重なりのクリップを防ぐ。
- UI: `StatusPanelOverlay.tsx` の「おと」行を **4 択ボタン** (オフ / ちいさい / ふつう / おおきい、各 ≥ 56px) に。
  `data-testid="volume-step"` + `data-level="0..3"`。押した瞬間に `confirm` を鳴らして試聴になる。
  既存の `sound-toggle` は **残す** (E2E 互換)。「オフ」は `sound:false`、他は `sound:true` + `volume`。

### 2.3 BGM の重ね (AU-03 が実装、AU-05 が使う)

`bgm.ts` の要求を **base / overlay の 2 段**にする (実際に鳴るのは overlay があれば overlay、無ければ base):

```ts
playBgm(id)          // base を設定 (FieldScene / BattleScene / Title / Ending — 既存呼び出しは無変更)
pushBgm(id)          // overlay を設定 (レッスン・テストなど React のオーバーレイ画面が開くとき)
popBgm()             // overlay を外す → base にクロスフェードで戻る
currentBgm()         // 実際に鳴っている曲 (E2E 互換: 既存の意味を保つ)
```

overlay は 1 段だけ (入れ子にしない。push 中に push したら置き換え)。`stopBgm()` は両方を消す。
`__KAZUQUEST_BGM__` に `base()` / `overlay()` を追加 (`current()` は維持)。

### 2.4 曲の追加 ID (AU-03 / AU-07 が `music.ts` に定義)

- AU-03: `lesson` (まなびや・レッスン中: 穏やか、96〜108 BPM、ヘ長調かト長調)、`test` (テスト中: 軽い緊張、
  132〜144 BPM、ベースが刻む。boss の「怖さ」は出さない)。
- AU-07: `town1`〜`town6` (章ごとの町)。`songForTheme(theme, isTown)` は残し、新設 `songForMap(map)` が
  `chapterForMap(map.id)` (`src/content/chapters/index.ts`) で章を求めて `town<N>` を返す。章が取れない
  マップ (dev/maps 等) は従来どおり `songForTheme` にフォールバック。`THEME_SONGS` の網羅テストは維持。
- すべて **オリジナル曲**。既存ゲームの旋律に似せない (設計計画 §IP安全性)。`MIN_BARS`/`MAX_BARS` は AU-06 が 8〜32 に
  広げるまで 8〜16。

### 2.5 E2E フック (AU-01 が実装)

`window.__KAZUQUEST_AUDIO__ = { contextState(): "running"|"suspended"|"closed"|null, enabled(): boolean,
volume(): number, recentSfx(): { name: SfxName; at: number }[] /* 直近 32 件 */, clearSfx(): void }`
`playSfx` は **鳴らせたかに関係なく** (AudioContext 不在でも) `recentSfx` に記録する — E2E は「その場面で
その名前を鳴らそうとした」を検証する。`e2e/helpers.ts` の `Window` 型宣言に追加する。

### 2.6 test id 規約

`volume-step` (+`data-level`)、`sound-toggle` (既存)、ギャラリーの `gallery-sfx-<name>` / `gallery-song-<id>` (AU-02 / AU-03)。

### 2.7 守るテスト

`tests/sfx.test.ts` (`EXPECTED_NAMES` を名前追加と同時に更新)、`tests/music.test.ts` (`SONG_IDS` の網羅・小節長・
`THEME_SONGS` が全マップのテーマを持つ)、`e2e/sound.spec.ts` (既存 3 件は無修正で緑のまま)。
Node (AudioContext 無し) で `playSfx` / `playBgm` / `pushBgm` / `setVolume` を呼んでも **決して throw しない**。

### 2.8 文言

設定 UI はひらがな (おと / オフ / ちいさい / ふつう / おおきい)。曲名 (`SongDef.title`) は既存どおりひらがな。

---

## 3. 波1: 土台 (並列可: AU-01 | AU-02)

#### AU-01 [M] 音量・マスターバス・iPad で聞こえる既定値・診断フック — 状態: 済

- **目的**: 「小さくて聞こえない」「調整できない」「鳴っているか確かめられない」を一度に解消する (§2.2 / §2.5)
- **触るファイル**: `src/game/audio/sfx.ts` (マスターバス・`setVolume`/`getVolume`・`__KAZUQUEST_AUDIO__`・
  `recentSfx` 記録)、`src/game/audio/bgm.ts` (layer の master を `getMasterBus()` へ接続、音量定数の引き上げのみ)、
  `src/game/audio/sfxTable.ts` (既存 18 種の gain を ×1.6。名前は増やさない — AU-02 と衝突させない)、
  `src/lib/save.ts` (`volume`)、`src/components/StatusPanelOverlay.tsx` (4 択)、`e2e/helpers.ts` (型)、
  `docs/save-data.md`、`tests/save.test.ts` / `tests/sfx.test.ts` / `e2e/sound.spec.ts` (追記)
- **手順**: (1) save.ts に `volume` と normalize → Vitest (欠落・不正値・既存セーブ) (2) sfx.ts にマスターバス、全ノードを
  `getMasterBus()` へ。`setSoundEnabled` は従来の挙動を保つ (3) bgm.ts の接続先変更と定数 (4) UI の 4 択 (5) フック (6) E2E
- **受け入れ条件**: Vitest 緑 (既存 + volume の正規化 + `recentSfx` が Node でも記録される)。`e2e/sound.spec.ts` に
  追記: 4 択を押すと `settings.volume` が保存され、`__KAZUQUEST_AUDIO__.recentSfx()` の末尾が `confirm`、
  タイトルの最初のタップ後に `contextState()` が `"running"` (Chromium は自動再生許可で running になる)。
  既存 3 件は無修正で緑
- **スコープ外**: 効果音の追加 (AU-02)、BGM の重ね (AU-03)

#### AU-02 [S] 学びの効果音 14 種の定義とギャラリー — 状態: 済

- **目的**: §2.1 の 14 種を **純データとして** 定義し、実機で試聴できるようにする。呼び出し側 (AU-04) は触らない
- **触るファイル**: `src/game/audio/sfxTable.ts` (14 種追加。既存の gain 値は触らない — AU-01 と衝突させない)、
  `tests/sfx.test.ts` (`EXPECTED_NAMES` に 14 追加)、`src/app/gallery/page.tsx` (「おと」節: `SFX_NAMES` 全件の
  ボタン `gallery-sfx-<name>`、押すと `playSfx`)、`e2e/gallery.spec.ts` (節が全名を網羅する 1 件を追加)
- **手順**: 既存の `victory` / `levelUp` / `treasure` の書き方 (`seq` ヘルパー、`gate`、`delay`) を踏襲。§2.1 の意図を
  コメントに書く。音の重なりで「区別がつく」ことを最優先 (`testPass` と `victory`、`mastered` と `levelUp`、
  `shard` と `treasure` は音程・長さを違える)
- **受け入れ条件**: `tests/sfx.test.ts` 緑 (32 種の網羅・値域)。ギャラリー E2E で 32 個のボタンが並ぶ。
  iPad 実機で 32 種を順に鳴らして聞き分けられること — リリースチェックリストに手動項目として追記
- **スコープ外**: 画面への差し込み (AU-04)、既存 18 種の作り直し (AU-09)

## 4. 波2: 学びの画面に音を通す (並列可: AU-03 | AU-04。依存: AU-01, AU-02)

#### AU-03 [M] BGM の base / overlay と「まなびや」「テスト」の 2 曲 — 状態: 未 (依存: AU-01)

- **目的**: React のオーバーレイ画面が曲を要求し、閉じたら元に戻れる仕組み (§2.3) と、それに乗せる 2 曲 (§2.4)
- **触るファイル**: `src/game/audio/bgm.ts` (`pushBgm` / `popBgm`、`requested` を base/overlay に分離、フック拡張)、
  `src/content/music.ts` (`lesson` / `test`、`SongId` / `SONG_IDS`)、`tests/music.test.ts` (2 曲の文法、
  push/pop の状態遷移を Node で)、`src/app/gallery/page.tsx` (「きょく」節: `gallery-song-<id>` で試聴、
  `stopBgm` ボタン)、`e2e/sound.spec.ts` (push → current が overlay、pop → base に戻る 1 件)
- **手順**: 既存の `playBgm` 呼び出し (Title / Field / Battle / Ending) は **無変更**で動くこと。tick は
  `effective = overlay ?? base` を見る。`stopBgm` は両方クリア
- **受け入れ条件**: Vitest 緑。E2E: `warp` で town を鳴らした状態で `page.evaluate(pushBgm("lesson"))`
  相当 (フック経由: `__KAZUQUEST_BGM__` に `push/pop` を **テスト専用**で足してよい、無害) → `current()` が
  `"lesson"`、pop で `"town"`。既存 3 件緑
- **スコープ外**: レッスン画面からの呼び出し (AU-05)、町 6 曲 (AU-07)

#### AU-04 [M] 学びの全画面に効果音を差す — 状態: 未 (依存: AU-01, AU-02)

- **目的**: §0 の穴 1 を塞ぐ。§2.1 の名前を **意図どおりの場面で** 鳴らす
- **触るファイル** (すべて `src/components/`): `LessonScreen.tsx` (`lessonOpen` 開始時 / `pageTurn` は
  `advanceWithinPages` と altExplain の「つぎへ」/ `testStart` は stage が test になる瞬間 / `testPass` は
  `finishPassed` / `testFail` は `restartAfterFailedTest` / `companion` はなかまページを差し込むとき)、
  `LessonWorkedExample.tsx` (ステップ送りは `pageTurn`)、`LessonFaded.tsx` `LessonPractice.tsx` `LessonTest.tsx`
  (`settle` で `correct` / `wrong`。`LessonPractice` は hintLevel が増えたら `hintReveal`、`onLevelComplete` で
  `practiceLevelUp`)、`TeacherMenu.tsx` (開く: `teacherGreet`、項目タップ: `confirm`、とじる: `cancel`)、
  `PreviewMenu.tsx` `MasteryMap.tsx` `ReadinessScreen.tsx` (開く `confirm`、項目 `confirm`、とじる `cancel`、
  Readiness の合否は `correct` / `wrong`)、`ReviewScreen.tsx` (各問 `correct`/`wrong`、`justMastered` で
  `mastered`、かけら付与で `shard`、付与後に `hasChapterCrystal` が false→true なら `crystal` — 比較は付与前後で)、
  `StatsScreen.tsx` (単元マップを開くボタン `confirm`)。加えて `src/game/field/MapView.ts` (`refresh()` で
  hideIf NPC のスプライトを消した回数 ≥ 1 なら `gateOpen`、`refreshNegariaStage()` で段が上がったら `colorReturn`。
  初回 `build()` では鳴らさない)
- **手順**: import は直接 (§1)。1 操作 1 音。`correct`/`wrong` の直後 900ms 以内に `pageTurn` を重ねない (AUTO_ADVANCE と
  同じタイミングで鳴らす)。E2E は `__KAZUQUEST_AUDIO__.recentSfx()` で「その順に鳴らそうとした」を見る
- **受け入れ条件**: Vitest: `MapView` の判定は純関数に切り出してテスト (消えた NPC 数 / 段の増加 → 鳴らす名前)。
  E2E: `e2e/learning-audio.spec.ts` (新): g1_add_carry を `openLesson` で開き、`recentSfx()` に
  `lessonOpen` → `pageTurn`… → `correct`… → `practiceLevelUp`×2 → `testStart` → `testPass` の**順序**が含まれる
  (完全一致ではなく部分列)。おさらい 4 回で `mastered` と `shard`。章1 の番人を 3 単元 can にして `gateOpen`。
  既存の `lesson.spec.ts` / `lesson-grade*.spec.ts` / `chapter1.spec.ts` は無修正で緑
- **スコープ外**: BGM の切替 (AU-05)、戦闘・フィールドの既存効果音の見直し (AU-09)

## 5. 波3: レッスン中の曲 (依存: AU-03, AU-04)

#### AU-05 [S] レッスン・テスト・おさらいで BGM を切り替える — 状態: 未

- **目的**: 学習中の空気を曲で作る。開く → `lesson`、テスト段階 → `test`、閉じる/合格 → 元の曲
- **触るファイル**: `src/components/LessonScreen.tsx` (open で `pushBgm("lesson")`、stage が test で
  `pushBgm("test")`、altExplain へ戻るとき `pushBgm("lesson")`、`finishPassed` / アンマウントで `popBgm()`)、
  `ReviewScreen.tsx` (open `pushBgm("lesson")`、close `popBgm()`)、`ReadinessScreen.tsx` (同上)、
  `e2e/learning-audio.spec.ts` (追記)、`e2e/lesson.spec.ts` (BGM の assert を 2 行追記してよい)
- **手順**: `testPass` の効果音 (1 秒) が鳴り終わってから `popBgm` (setTimeout 1000ms)。合格時は base に戻す前に
  `testPass` を聞かせる。React の StrictMode 二重マウントで push が 2 回走っても overlay は 1 段なので安全
- **受け入れ条件**: E2E: レッスン中 `__KAZUQUEST_BGM__.current()` が `"lesson"`、テスト中 `"test"`、閉じた後
  元の曲 (`town` 等)。章1〜7 golden path・`lesson-grade*` は無修正で緑 (BGM を変えても進行は変わらない)
- **スコープ外**: 町 6 曲 (AU-07)

## 6. 波4: 曲と音の作り込み (アセット 0 のまま。AU-06 → AU-07 | AU-08 | AU-09)

#### AU-06 [M] シーケンサの表現力 (4 声・パルス幅・ビブラート・エコー・32 小節) — 状態: 未 (依存: AU-03)

- **目的**: 「薄い」の根本原因である 2 声・単一波形を解消する土台。曲データは触らない
- **触るファイル**: `src/lib/music/notation.ts` (`SongDef` に `harmony?: string` (第 2 リード)、`arp?: string`
  (高速アルペジオ用、1 小節 16 ステップ許可 = `stepsPerBar` 既存機構)、`MAX_BARS` 16→32、`SongDef.style?:
  { pulse?: 0.125 | 0.25 | 0.5; vibrato?: number; echo?: number }`)、`src/game/audio/bgm.ts` (矩形波を
  `PeriodicWave` のパルス波 (12.5 / 25 / 50%) に、ビブラートは LFO → `frequency`、エコーは `DelayNode` + 減衰 GainNode
  を master に 1 系統)、`tests/music.test.ts` (新フィールドの文法・32 小節・style の値域)
- **受け入れ条件**: 既存 7 曲 + `lesson`/`test` が **無変更で同じに鳴る** (style 省略 = 従来どおり 50% 矩形波・
  エコーなし)。Vitest 緑。E2E `sound.spec.ts` 3 件緑
- **スコープ外**: 曲の書き換え (AU-07 / AU-08)

#### AU-07 [L] 章ごとの町の曲 6 曲 (`town1`〜`town6`) — 状態: 未 (依存: AU-06)

- **目的**: 6 章の町を音で区別する。章の世界観 (章1 はじまりの村・王都 / 章2 港と九九 / 章3 砂漠の隊商 / 章4 氷と計測 /
  章5 割合の都 / 章6 ネガリア (色を失った町)) を短いモチーフで表す
- **触るファイル**: `src/content/musicTowns.ts` (**新**。6 曲をここに置き、`music.ts` は 1 行で merge — AU-08 と
  同じファイルを触らないため)、`src/content/music.ts` (`SongId` に 6 追加・`songForMap` 新設・merge)、
  `src/game/scenes/FieldScene.ts` (`songForTheme(...)` の 2 箇所を `songForMap(this.map)` に)、
  `tests/music.test.ts` (6 曲の文法、全マップで `songForMap` が定義済み ID を返す)、`e2e/sound.spec.ts` (章 3 の町で
  `current()` が `"town3"` の 1 件、`seedChapter(3)` を使う)
- **手順**: 各曲 16〜32 小節、`harmony` を使う。章6 `town6` は短調・ゆっくり・`pulse: 0.125` で「色のない」感じ。
  すべてオリジナル。曲名 (`title`) はひらがな
- **受け入れ条件**: Vitest 緑、E2E 緑、章1〜7 golden path 無修正で緑。`town` (旧) は dev/maps のフォールバックとして残す
- **スコープ外**: 旅・洞くつ・戦闘の曲 (AU-08)

#### AU-08 [M] 既存 6 曲の作り込み (title / field / dungeon / battle / boss / ending) — 状態: 未 (依存: AU-06)

- **目的**: 2 声 → 3〜4 声、8〜16 小節 → 16〜32 小節、イントロ 1 小節、`pulse` / `vibrato` / `echo` を曲ごとに
- **触るファイル**: `src/content/music.ts` の該当 6 曲 (**`lesson`/`test`/町は触らない**)、`tests/music.test.ts`
- **手順**: 旋律の核 (最初の 2 小節) は残して発展させる (プレイヤーが「同じ曲が良くなった」と感じる)。boss は
  `pulse: 0.25` + ベースを 16 分刻みに。ending は `echo` を強めに
- **受け入れ条件**: Vitest 緑 (小節長 8〜32)、`e2e/sound.spec.ts` 緑、ギャラリーで 6 曲が試聴できる
- **スコープ外**: 町 (AU-07)、効果音 (AU-09)

#### AU-09 [S] 効果音 32 種の質感 (パルス幅・ピッチ包絡・重ね) — 状態: 未 (依存: AU-06)

- **目的**: `SfxVoice` に `pulse?` を足し (bgm と同じ `PeriodicWave` を共有)、既存 18 + 新 14 の音色を統一感のある
  ファミコン風に磨く。名前・場面・長さは変えない
- **触るファイル**: `src/game/audio/sfxTable.ts` (音色の値だけ)、`src/game/audio/sfx.ts` (`pulse` の再生)、
  `tests/sfx.test.ts` (値域に `pulse` 追加)
- **受け入れ条件**: Vitest 緑。ギャラリーで 32 種が以前より聞き分けやすい (手動)。E2E 全件緑
- **スコープ外**: 新しい場面への追加

## 7. 波5: 総仕上げ (依存: 全部)

#### AU-10 [S] E2E とドキュメントの総仕上げ — 状態: 未

- **目的**: 音の回帰を CI で守り、手動確認項目を残す
- **触るファイル**: `e2e/learning-audio.spec.ts` (AU-04/05 の 2 本を統合、`recentSfx` の順序と BGM の切替を 1 本で)、
  `.github/workflows/e2e.yml` (スモークに `sound.spec.ts` を追加。`learning-audio.spec.ts` は full のみ)、
  `docs/kazu-quest-release-checklist.md` §4 (iPad 実機: 4 択の音量が体感で違う / レッスン → テストで曲が変わる /
  合格で `testPass` / 32 種のギャラリー試聴)、`docs/kazu-quest-design-plan.md` の「音」行 (18 種 → 32 種、7 曲 →
  15 曲、音量 4 段)、`docs/kazu-quest-perf.md` (AudioContext ノード数の上限メモ: 同時発音は master 1 本で
  クリップしないこと)
- **受け入れ条件**: フル E2E (default + ipad) 緑。**小分けバッチで実行** (§9)
- **スコープ外**: 音源ファイル (§8)

---

## 8. 判断が必要: 音源ファイル (ogg / m4a) を入れるか

本計画 (AU-01〜10) は **合成のまま** 質を上げる。それでも「ちゃんとした音楽が欲しい」なら次の判断になる。
やるなら別計画 (AU-11〜) で、構造が変わる:

| 観点 | アセット 0 (現状 + 本計画) | 音源ファイル導入 |
|---|---|---|
| 容量 | 0 (曲は文字列) | ループ 1 曲 0.5〜1 MB × 15 曲 + 効果音 → 10〜20 MB。GitHub Pages の静的配信・iPad の初回ロードに影響 |
| IP | 設計計画の「すべてオリジナル」を満たす | 生成 AI 曲 / CC0 素材 / 発注のいずれか。ライセンス表記と出所管理が要る |
| iOS | 初回タップ待ちは同じ | 同じ + デコード遅延 (`decodeAudioData`)。先読みとメモリ管理が要る |
| 実装 | `bgm.ts` 拡張のみ | `AudioBufferSourceNode` のループ・プリロード・章ごとの遅延読み込みを新設 |
| 表現 | ファミコン風に限られる (それが世界観に合う面もある) | 制限なし |

**推奨**: まず AU-01〜05 (聞こえる・全画面で鳴る・レッスンで曲が変わる) を iPad 実機で確かめ、次に AU-06〜09
(作り込み) を聞いてから判断する。合成でも「音がある」体感は確実に得られる。ファイル導入を選ぶ場合は
効果音は合成のまま、**BGM だけ**をファイルにする折衷が容量・IP・工数のバランスが良い。

## 9. 実行順と並列の組

```
波1: AU-01 | AU-02                (2 並列。sfx.ts / sfxTable.ts で分担: AU-01 は gain の値のみ、AU-02 は名前追加のみ)
波2: AU-03 | AU-04                (2 並列。AU-03 は bgm.ts + music.ts、AU-04 は components/** + MapView.ts)
波3: AU-05                        (単独)
波4: AU-06 → AU-07 | AU-08 | AU-09 (AU-06 の後に 3 並列。music.ts は AU-08 だけ、町は musicTowns.ts)
波5: AU-10
```

衝突しやすい共有ファイル: `src/game/audio/sfx.ts` (AU-01, AU-09)、`sfxTable.ts` (AU-01 は値・AU-02 は名前・AU-09 は
音色 — **同じ波に 2 つ入れない**)、`bgm.ts` (AU-01 接続先・AU-03 push/pop・AU-06 波形 — 波をまたぐので順番で解決)、
`music.ts` (AU-03, AU-07 の 1 行 merge, AU-08)、`tests/sfx.test.ts` / `tests/music.test.ts` (各波 1 タスクだけ)、
`e2e/sound.spec.ts` (AU-01, AU-03, AU-07 — 追記のみ、既存 3 件は不変)、`StatusPanelOverlay.tsx` (AU-01 のみ)。

運用メモ (前計画で学んだこと):
- `next build` と Playwright はオーケストレータだけが回す。エージェントは `npm run typecheck && npm run test` と
  自分の spec 1 本まで。フル E2E は **2〜10 ファイルずつの小分け**で (一括実行は OOM で落ちたことがある)
- エージェントには「最終報告は自己完結。バックグラウンドの Monitor 待ちで turn を終えない」を明記する
- 音は Playwright で聞けない。**「鳴らそうとした」(`recentSfx`) と「曲の要求」(`__KAZUQUEST_BGM__`)** を検証し、
  聞こえ方はリリースチェックリストの手動項目で担保する
- `tsx` の単体スクリプトで音を「確認」しようとしない (Node に AudioContext は無い)。試聴は `/gallery`

# カズクエ 〜数の王国と伝説の勇者〜 — DQ3風・算数RPG 設計計画

> **ステータス**: 本編+終章 実装済み (2026-09-14)。残作業の管理は [kazu-quest-roadmap.md](kazu-quest-roadmap.md)
> 実装が進んだら、この文書との差分 (設計変更) をこのファイルに追記して更新すること。

## 設計変更ログ

- **2026-09-23 (さきどりで 物語を すすめる — 学習アプリとしての 中心の強化)**:
  「小2 の子が 小3・小4 の物語へ 先取りで 進める」を 中心に すえた。詳しい考え方は
  [kazu-quest-learning-plan.md](kazu-quest-learning-plan.md) §4.3 の 2026-09-23 改訂。
  - **がっこうの学年** `settings.schoolGrade` (1〜6 / null)。はじめから で「いま なんねんせい?」
    (ひみつ可)、せってい でも変えられる。さきどりの判定と 既定値にだけ使い、進行は しばらない
  - **めあて** `lib/goals.ts` (純関数): いまの章の とびらの3単元 + さきどりの はしご (まだ そろって
    いない いちばん近い先の章)。前提が足りない単元は `firstToLearn` で「まず ○○ から」。
    UI は 左上の常設「★ めあて」(`GoalsButton.tsx`、未達の「!」つき) と `GoalsPanel.tsx`。
    新しい EventCommand `openGoals` (runner → FieldScene → `lessonFlow.handleOpenGoals` が
    えらばれた単元を 前提チェックつきの ふつうのレッスンに つなぐ)
  - **番人**: 6章の とびらの番人すべてに「とびらを ひらく さんすうを いま まなぶ?」→ `openGoals`
  - **さきどり せいこう!** `lib/sakidori.ts`: 学年より上の単元を はじめて can に したとき 1回だけ
    (flag `ahead.<skillId>`) ゴールド (40G × 学年) と お祝い (`SakidoriCelebration.tsx`)。
    ★ の数は 保存せず mastery から数える。せいせきタブに「さきどり」欄 (★・とどいた学年・単元)
  - **どこで まなんでも 呪文を おぼえる** (`learnSpellsForSkill`): 以前は まなびやの先生から
    まなんだときだけ 単元の呪文 (learnTest.skillIds[0]) が 手に入り、めあて から 先取りした子は
    あとで 受けなおす ことになっていた。合格 = 呪文 に そろえ、お祝いに 呪文名を出す
  - **こたえる じかん** `settings.answerTime` (ふつう / ゆっくり 1.6倍 / なし)、`lib/answerTime.ts`。
    かいしん判定は もとの秒数のまま (ゆっくりでも 有利・不利に ならない)
  - **はじめての道しるべ** `FirstRunTips.tsx`: めあて と タップ移動の ふきだし (1セーブ1回、
    画面を ふさがない)
  - **4:3 の iPad を 画面いっぱいに**: 論理解像度の高さを 起動時の縦横比で 540〜720
    (`game/viewport.ts`)。配置は もともと GAME_HEIGHT からの相対。戦闘コマンドのマスも
    高さからの相対 (`battleMenuCell(i, height)`)、touch.spec は 実際の gameSize を読む
  - **小4 の角度から 三角形の内角の和 (小5) を はずし**「直角 90° の のこり」に。手書きの
    レッスン問題の ヒントも 登録時に 答えを かくす (`withMaskedHints`)
  - E2E: `sakidori.spec.ts` (小2 で はじめる → めあて → 小3 わり算に合格 → ★・120G →
    番人から めあて)。はじめから の学年の質問は `answerGradeQuestion` (既定 ひみつ)

- **2026-09-23 (iPad での あそびやすさ — 実機相当の タッチ操作で 監査して修正)**:
  - **レッスンの図が まちがっていた**: g1_add_carry の「4を 3と 1に わけよう」に
    total: 11 の さくらんぼ図 (「11 は 3 と 1 に わけられるよ」)。全レッスンの さくらんぼ図に
    `total === split[0] + split[1]` の検査を追加
  - **戦闘コマンドを 3列×2行の マスに** (`battle/BattleMenu.ts` + Phaser 非依存の
    `battleMenuLayout.ts`)。以前は 1行 約128×28px で 文字の形だけが タップ判定。じゅもん・
    どうぐ は 5つめより下が 画面外に はみ出して えらべず (勇者は 呪文を ぜんぶ おぼえる)、
    タッチでは もどれなかった → マス全体が判定 (iPad で 約240×54px)、「つぎへ ▶」で ページ送り、
    「もどる」を必ず置く。戦闘の どうぐ は 回復アイテムだけ (そうび・メダルは つかえないので出さない)。
    touch.spec は `battleMenuCell()` を import して マスの中心を押す
  - **タップした所まで 歩く** (`field/tapPath.ts` の幅優先探索)。以前は タップ1回 = 1歩で、
    6マス先の村人を タップしても 1歩しか動かなかった。村人・宝箱を タップすると となりまで歩いて
    そちらを向き、話しかける。キー入力・イベント・戦闘・場所移動で 道は とりけし
  - **店**: 品物が多いと「やめる」が スクロールの下に かくれていた → リストの さいごの
    やめる/もどる は スクロールの外に固定。お金が たりない品に「(おかねが たりない)」。
    1タップで 買わず、説明を見せてから「かう?」。おつりチャレンジの問題文に ねだんを入れ、
    「10%」(小5) を「すこし もどってくる」に
  - **まちがえたとき**: 自分が押した ボタンに ✕ と赤わく (以前は 正解が緑になるだけ)。
    戦闘で 答えを見せる時間 1.6秒 → 2.6秒
  - **ステータス画面**: 高さを固定し 本文だけ スクロール (タブの行が タブごとに 上下に
    動いて 押しそこねていた / 下段のボタンが 中身に かぶっていた)。タブの文字・学年名が
    途中で 折れない
  - **小1 の文字**: 章1 の 船・海・壱・塔・博士 に ルビ、章1ボスを「かんぶイレイサー」
    (戦闘文字は canvas で ルビが出せない)、せいせきの「数晶」を かなに。章1 の文に
    小1漢字 以外を ルビなしで 使わない テストを追加
  - **Split View**: iPad を 横に持っているのに ウィンドウが縦長のとき「よこむきに してね」
    ではなく「がめんを ひろげてね」
  - 見送り (提案として残す): 16:9 の canvas を 4:3 の iPad に広げる (Phaser の EXPAND)、
    はじめての プレイの 目的・操作の案内、小1 の 戦闘 10秒タイマーの 見なおし

- **2026-09-23 (学びの中身の監査と修正)**: 全単元 × Lv1〜3 を数千問ずつ生成して監査した。
  計算の答えそのものは 独立に検算して誤りゼロ。まちがっていたのは その周りだった。
  - **くり上がり・くり下がりの診断が逆**: たし算の −10 が「くり上がりわすれ」、ひき算の +10 が
    「くり下がりわすれ」なのに、符号だけで決めていた (`choices.ts` / `diagnose.ts`)。ひき算で
    まちがえた子に「くりあがりを わすれていないかな?」と出ていた。既存テストも逆を固定していた
  - **ヒントが答えを言っていた**: `genericHints` が explain を丸ごとつなぐので、27単元で
    最後のヒントに答えが入り、レッスンの穴埋め (hints[2] 出しっぱなし) は答えを見ながら選ぶだけ
    だった。`generate()` の出口で 答えを「?」に かくす (`hints.ts` の `maskAnswerInHints`。
    「= 答え」と「最後に言い直す答え」だけ — 広く かくすと 式や単位が壊れる)
  - **習っていない内容**: 小3・小4 の同分母ひき算が 約分 (小5) を要求 (4/6 − 1/6 → 1/2 で、
    子どもが出す 3/6 が選択肢に無い)。小2 の時こくが 24時間表記 (21じ) → 「ごご なんじ?」に。
    小1・小2 の文に 小4 の漢字「位」
  - **小数の単元なのに小数が出ない**: `3 × 2 = ?` (小5 で約1割)、`6 + 6 = ?` (小3 Lv3)。
    小数÷整数 で わられる数が整数 (`47 ÷ 5`) なのに「小数点を そろえて もどす」と説明
  - **説明が問題と合わない**: Lv3 (3けた) の ひっ算を 2けた決め打ちで説明
    (「十のくらい: 12 + 83 + 1」) → くらいごとに進む `columnSteps.ts`。わり算 Lv3 の
    2けたの商に「4の だんの 九九を つかうよ」。g1_add_carry Lv3 (47+5) を「7+3=10」で説明
  - **選択肢**: g1_compare は「どっち?」なのに 問題に無い数を3つめに出し、答えは3番目に
    一度も来なかった → 3つの数から「いちばん おおきいのは どれ?」に。0/2・5/1 のような
    分数、最小公倍数の選択肢の「1」を出さない
  - **かたより**: 最大公約数が 1 (たがいに素) の問題が約3割 → 約1割3分。くり上がりの単元の
    6割が くり上がりなし → 約7割が くり上がりあり。通分・分数のかけ算の問題の分数を約分ずみに
  - **読み**: 底辺を「そこへん」と書いていた → ていへん
  - **レッスンごとの まちがいの一言** (`mistakes[].feedback`) が どこにも出ていなかった →
    `lib/mistakeFeedback.ts` で「レッスンの一言 → 共通の一言」の順に引き、れんしゅう・穴埋め・
    とっくん で表示。まちがえたときは 読む時間をとる (0.9秒 → 2.2秒)
  - 分数の問題にも図 (分数バー)。問題文の分数から描くので 図と文が食いちがわない
  - 章3 の旅人の道案内が 東西南北あべこべ (ピラミッドは東、宿場は南)
  - 回帰テスト: 答えの位置のかたより / 小数・分数の単元に小数・分数が出る / 同分母は約分不要 /
    ヒントが「= 答え」で終わらない / ひっ算の説明は1けたずつ / レッスンの例題が生成問題と一致

- **2026-09-23 (問題を図でも見せる)**: 問題が文章だけだと読みとりで つまずくので、
  図で表せる問題は レッスンと同じ図 (`FigureSpec` / `components/figures`) を そえる。
  - `Problem` に `figure?: FigureSpec` を追加 (`lib/curriculum/types.ts`)。
    図が決まる問題は `lib/curriculum/figures.ts` の `figureForProblem()` が
    skillId と a/b から作り、ジェネレータが `figure` を持たせていれば そちらが優先
  - **原則: 図は「問題の じょうけん」だけを表し、こたえは見せない**。ひっ算は
    `revealSteps: 0` (答えのけたは "?")、分度器は `showReading` なし、
    %の数字が必ず出る `percentBar` は問題には使わない。Vitest で全単元 × Lv1〜3 ×
    60 seed を走査して検証する (`tests/problemFigures.test.ts`)
  - **a/b の意味は単元ごとに違う** (`g3_decimal` の a=2 は 0.2 の ×10 表現) ので、
    一般規則ではなく skillId ごとの表で決める。1単元が複数の形を出すもの
    (`g2_time` の「なんじ?/なんぷん?」、`g4_angle` の 一ちょくせん/三角形/一まわり、
    `g5_area` の 三角形/平行四辺形、`g6_letter_expr`) は ジェネレータ側で `figure` を
    持たせる — a/b だけでは 見分けられず、まちがった図を出してしまう
  - 表示は `components/ProblemFigure.tsx`。`MathPromptPanel` (戦闘・テスト・おだい・
    とっくん・フィールド回復)、`LessonPractice` / `LessonTest` / `ReadinessScreen` /
    `ReviewScreen` に入れた。戦闘は枠がせまいので `maxWidth` を小さくする
  - `ArrayGrid` の点の間かくが 直径より せまく 点どうしが重なっていた (実機で発覚) ので
    `DOT_R` から導く式に直した

- **2026-09-23 (もちものの出口 — うる・すてる)**: アイテムが たまる一方だった。
  - 道具屋を「かう / うる」の2択入口に (`effectHandlers.handleShop`)。うり値は
    かい値の半分 (切りすて・最低1G)
  - もちものタブに「すてる」(1回確認してから) を追加 (`FieldHealControls`)
  - **ねだんが つかないもの (ひらめきメダル・数晶のかけら) は たいせつなもの**として
    うる・すてる の対象外。純ロジックは `lib/inventory.ts`、実データ全数検査は
    `tests/inventory.test.ts`

- **2026-09-23 (番人に閉じこめられない — ピラミッド出口の詰み)**: ピラミッドから出た
  勇者が 番人と ピラミッドの間 (3マス) に 閉じこめられる詰みがあった (実機で再現)。
  - 原因: ダンジョン入口が 行き止まりの奥にあり、戻りの spawn が 番人の内側にある。
    同じ形が 章1 (どうくつ)・章3 (ピラミッド)・章4 (角度の遺跡)・章6 (試練) の4箇所
  - **`hideIf` に OR (`{ any: [...] }`) を追加** (`content/types.ts` の `HideCond` /
    `runner.evalHideIf`)。4つの番人を
    「中核3単元が can **または** 一度 中に入った (`cN.enteredX`)」にし、
    ダンジョン入口イベントに `setFlag` を `transfer` の前に置いた
    (既存の詰んだセーブも 入り直して出れば 抜けられる)
  - 回帰テスト: `content.test.ts` に「番人を全員表示とみなして spawn から歩いたとき、
    他の spawn へ行けない袋小路なら、中に 番人を消せるフラグを立てるイベントがある」

- **2026-09-15 (LP-20: 章ゲートの再設計 + 数晶ボーナス)**: 各章のボス前の番人を
  「呪文1つ学習済み」から「中核3単元が すべて できる」に切り替えた。
  - **`hideIf` を `FlagCond | FlagCond[]` に拡張** (`content/types.ts`)。配列は AND
    (全条件が成立して初めて番人が消える)。単一条件はそのまま `evalCond` に委譲する
    ラッパー `evalHideIf` を `runner.ts` に追加し、`MapView.ts` の2箇所 (build/refresh)
    をこれに置き換え (`getSave().mastery` を渡す)。`content.test.ts` の hideIf 検証
    (フラグ到達可能性・skill条件の実在チェック) も配列対応に拡張
  - **章1〜4**: 単一の `{flag: "learned.<spell>", op:"set"}` を丸ごと
    `[{skill,state:"can"}] × 3` (中核3単元) に置き換え。中核skillIdは
    `coreOfChapter: true` を実データから grep して確認 (章1=g1_count/g1_add_carry/
    g1_sub_borrow、章2=g2_add_column/g2_kuku/g2_time、章3=g3_div/g3_div_remainder/
    g3_fraction、章4=g4_angle/g4_decimal/g4_div_2digit)
  - **章5・章6**: 既存の「順番ゲート」(星のかぎ→波のかぎ、3つの印) は物語上の別の
    ゲートなので温存し、ボス直前の最終番人 (castle-gate-guard / castle-gate-guard6)
    だけ `hideIf` を「既存の flag 条件 + 中核3単元 can」の混在4条件配列に**拡張**
    (置き換えではなく追加)。章5=g5_decimal_muldiv/g5_fraction_diff/g5_percent、
    章6=g6_fraction_muldiv/g6_ratio/g6_speed。章7はゲート自体が無いため対象外
  - **既存セーブ互換**: `initMasteryFromFlags` (LP-04で実装済み・変更なし) が
    全 `SPELLS` を汎用的に走査して `learned.<id>` → `learnTest.skillIds` を can に
    昇格させる作りだったため、18個の中核skillIdすべてに対応する呪文が
    既に1:1で存在することを確認し (表は上記)、追加のマッピングテーブルは不要と判断。
    Vitest (`tests/mastery.test.ts`) に 章1〜6 ぶんの回帰テストを追加
  - **数晶ボーナス**: `src/lib/review.ts` に `hasChapterCrystal(save, chapter)` /
    `chapterCrystalMultiplier(save, chapter)` を追加。章のかけら
    (`kakera_<chapter>`) が **6個** で数晶完成、呪文の power に **×1.2** (+20%、
    計画§4.2/ロードマップの想定値を採用)。呪文は章に厳密には紐付いていないため、
    戦闘中は「いる場所の章 (`chapterForMap`) → 取れなければ `save.chapter.current`」
    を近似として使う (`BattleScene.castSpell` で計算し `PlayerCommand.powerMultiplier`
    として `submitRound` に渡す — `battle.ts` 自体は save/章の概念を持たない純関数のまま)
  - **E2E**: 章1〜6の golden path に `__KAZUQUEST_DEBUG__.setMastery` を追加し、
    実レッスンで学ばない残り2〜3の中核単元を can にしてから ボス/門番の区間へ進める
    ように更新 (章5は実際に歩いて城門を通る箇所があるため機能的に必須、他は
    warp で番人区間を素通りするため必須ではないが一貫性のため追加)
  - 単元マップ画面 (LP-11bで計画されていたもの) は本タスクのスコープ外のまま
    (数晶ボーナスは戦闘ダメージの数字と純関数テストで検証可能なため画面なしで完結)

- **2026-09-15 (LP-19: なかまが教える場面)**: 加入イベント直後に、その なかまの得意分野の
  単元を `{ type: "openLesson", skillId, entry: "concept", skipReadiness: true }` で
  差し込む (タスク=g2_add_column、カケル=g3_mul_column、リトル=g4_decimal)。
  - **entry/skipReadiness を EventCommand→RunnerEffect→handleOpenLesson まで貫通**
    (`content/types.ts` の `LessonEntryPoint`、`runner.ts`、`lessonFlow.ts` の
    `OpenLessonOptions`)。`LessonScreen.tsx` は元から `entry` に対応済みだったため無改修
  - **readiness ゲートは意図的にバイパス** (`skipReadiness: true`)。加入直後の
    「Xが なかまに くわわった!」の直後に前提チェック (ReadinessScreen) の割り込みを
    出すと唐突なため。プレイヤー自身がまなびやを訪ねる通常経路はこのフラグを立てない
    狭い特例で、readiness ゲートそのものの弱体化は意図していない
  - **companionLines の表示位置**: concept の 2ページ目 (0-based index 1) を読み終えて
    「つぎへ」を押した瞬間に、いま パーティに いる なかまの一言 (`LessonDef.companionLines`)
    を 図なしの1ページとして割り込ませ、次に「つぎへ」を押すと通常の3ページ目
    (または concept が2ページのみなら workedExample) へ進む。複数の加入済みなかまが
    同じ単元に一言を持つ場合は party 配列の並び順で最初の1件だけを採用 (現状の3組では
    起きないが念のため)
  - 3件とも `concept` が3〜4ページのため、実際には「2ページ目の直後に割り込み、
    3ページ目以降へ続く」経路のみ通る (2ページのみ→workedExampleへの分岐は
    今後そのような単元が増えたときのための保険)

- **2026-09-14 (ユーザー指示: 戦闘外でも回復できるように)**: メニューの「じゅもん」「もちもの」
  タブに「つかう」ボタンを追加。回復呪文 (kind: heal) は戦闘外でも使え、**戦闘と同じく算数の
  出題あり** (時間無制限・小3以降はテンキー)。正解で MP 消費 + 回復 (戦闘の回復式、かいしんなし、
  maxHP で上限)、不正解は不発で MP は減らず、間違いはノートに記録。回復アイテムは出題なし。
  単体対象は誤タップ防止のため常に なかま選択を挟み、`target: "party"` は全員即時。
  純ロジックは `src/lib/field/recover.ts`。デバッグフックに `setHp` / `setMp` を追加。

- **2026-09-14 (ロードマップ v2 の実行 — 残作業ほぼ完了)**: [kazu-quest-roadmap.md](kazu-quest-roadmap.md)
  の KQ-01〜43 (KQ-26 任意を除く) を実装。主な設計確定:
  - **学習**: 戦闘の不正解は `save.mistakes` (cap 20) に積み、勝利後に「まちがいノート」で
    解説を表示、メニュー「ノート」タブで読み返し。習得テスト前に「とっくん」(5問・無制限・
    ヒント/さくらんぼ図・不正解で即解説)。小3以降の テスト/おだい/とっくん は **テンキー入力**
    (戦闘は全学年3択のまま)。ほこらで「ふくしゅう」(弱点3単元10問 → ひらめきメダル)。
    メニュー「せいせき」タブとタイトルの「せいせき」で学年別正答率・弱点・14日推移・数晶
  - **音**: アセット0の WebAudio 効果音 18 種 + チップチューン BGM 7 曲 (すべてオリジナル)。
    `settings.sound` で ON/OFF (既定 ON)
  - **エンディング/タイトル**: `{ type: "ending" }` → EndingScene (数晶6つ → ぼうけんのまとめ)。
    タイトルは DOM メニュー (つづきから/はじめから/せいせき、はじめからは2段階確認)。
    クリア後は ホシオキのほこら から再開、王と司祭のセリフが変わる
  - **終章「ムゲンのらせん」**: `ChapterDef.questionGrades` と `chapterForMap()` で章=学年の
    一対一を緩め、`chapter.current` を進めずに ほこらから transfer で入る 5 層 + ∞竜ムゲニア
    (HP1820)。出題は小1〜6 ミックス
  - **寄り道**: NPC ミニクイズ (各町1人・メダル1枚)、王都のメダル交換所 (`exchange` コマンド)、
    章1〜3 ダンジョンの「すうじのカギつき宝箱」、店の おつりチャレンジ (10% 返金)、王都のとけい塔
  - **バランス**: 純ロジックのボス戦シミュレータ (`tests/balance.test.ts`、`docs/kazu-quest-balance.md`)
    を根拠に章2〜5 のボス HP/atk を引き上げ (想定Lv−3 で 60〜90%、想定Lv で ≥85%)。
    ボス部屋前に `levelSign` (すいしょう Lv) を設置
  - **iPad**: 縦持ち警告、瞬間タップでも1歩動く (`pendingTapStep`)、タッチ専用 E2E (ipad project)
  - **安全網**: 章1〜7 のゴールデンパス E2E + スモーク + タッチ = 35 件。E2E CI (`e2e.yml`、
    スモーク自動 / 全章は手動起動)。性能監査は 4x スロットルで全マップ ≥98fps → カリング不要
  - 設計 A5 の「なかまの広場・パーティ入替」は引き続きカット。ルビ化 (本文) は任意扱いで未着手

- **2026-09-14 (残作業の棚卸し・ロードマップ v2)**: 本編完結後に残っている設計項目
  (まちがいノート・とっくん・テンキー・復習ほこら・せいせき画面・効果音/BGM・
  エンディング演出・終章・章3〜6の E2E 等) を棚卸しし、優先順位とタスク分解を
  [kazu-quest-roadmap.md](kazu-quest-roadmap.md) にまとめた。設計上の確定事項:
  `ChapterDef.questionGrades` で章と学年の一対一を緩める (終章のブロッカー解消)、
  ヒント表示は とっくん と まちがいノート の2か所に限定、テンキーは戦闘外のみ、
  終章は縮約版 (5層 + 隠しボス1形態)。

- **2026-08-17 (第3〜6章実装 = 本編完結)**: 小3〜小6のカリキュラム32単元と、
  章3〜6のコンテンツ (計55マップ・呪文32種・モンスター28種) を実装。本編の
  ゴール (第6章クリア) まで通しでプレイできる状態になった。設計 A2 の表からの
  変更点:
  - **呪文名の差し替え2件**: 章4「スイヘイガード (垂直平行)」→ **ワリキリブレード
    (÷2桁)**、章5「ゴウドウミラー (合同)」→ **サンカクミラー (三角形の面せき)**。
    カリキュラム側の単元 (g4_div_2digit / g5_area) に合わせた。
  - **ダンジョン構成の縮約**: 章5の空中庭園・海底神殿・マイナドス城、章6の
    はやさの回廊・エンの神殿は各2〜3マップに縮約 (九九の塔と同じ方針)。
  - **鍵/印は「順番に集める」形式**: EventCommand にフラグ分岐がないため、
    複数条件の門 (章5の2つの鍵・章6の3つの印) は **番人NPCの hideIf** で
    一本道に並べた (空→海→城 / 速さ→円→ピタゴラ)。並列取得は不可。
  - **パーティ入替 (章5) はカット**: 加入は勇者+タスク+カケル+リトルの4人で
    ちょうど上限のため、入替UIは不要と判断。
  - **終章「ムゲンのらせん」は未実装**: 第6章クリアでは advanceChapter せず
    `c6.clear` を立てるのみ (章7を作ると おだいクエスト/通常攻撃の出題が
    学年なしにフォールバックするため)。
  - **エンジン追加**: `target:"party"` の buff を みかた全員に適用
    (エンサークル/メンセキウォール/サンカクミラー/スピードスター)。
  - **呪文テストの分割**: 1つの まなびやで扱うテストは最大4つ (入れ子 choice の
    深さ上限)。章3以降は2つの町に分けて配置し、`spellTestMenu()` で共通化。
  - **アートは色ちがい量産**: 砂漠・雪原・雲/サンゴ/魔王城の新規タイルに加え、
    ネガリア (章6) は上の世界のタイルのパレット差し替えで作る方式に統一。

- **2026-07-28 (全体レビュー指摘の修正)**: シーンイベント (WAKE/SLEEP) を
  shutdown で必ず解除するよう修正 — Phaser は restart でユーザーリスナーを
  掃除しないため、マップ遷移のたびに蓄積し全滅時の多重 showMessage → busy
  永久ロックに至っていた (CRITICAL)。全滅処理に再入ガード。タップ操作も
  キーボードと同じ canAct() ガードに統一 (戦闘開始320ms窓のレース解消)。
  バフ/デバフは base 値からの掛け直し式で累積しないように。敵の かいふくは
  対象がいなければ攻撃に切替。セーブの hp/mp 欠損時は満タン復帰。検証テストに
  quiz.skillId / joinParty・learnSpell の memberId / フラグ到達可能性
  (条件参照フラグが必ずどこかで set できる) を追加。STEP_MS を timing.ts に
  分離して E2E と共有。2章の塔番人のセリフを実態 (迂回可) に合わせ助言口調に。

- **2026-07-27 (会話UI・メニューの DOM 化)**: Canvas 手動レイアウトは崩れ
  やすいため、メッセージウィンドウ・はい/いいえ・選択リスト・マップ名
  トースト・ステータスパネル・常設メニューボタンを React/DOM 描画に移行
  (GameUiOverlay / StatusPanelOverlay / MenuButton)。折り返し・はみ出しは
  CSS に委ねる。UiScene は同期APIと busy 管理だけの薄いブリッジになり、
  シーン側の呼び出しコードは無変更 (契約: "ui-message" 等 ⇄ "ui-*-done"、
  id 照合)。Canvas に残る描画はゲーム世界と戦闘UIのみ。メニューは
  なかまごと表示 (名前ボタンで切替、もちもの はパーティ共有で切替なし)。

- **2026-07-27 (メニュー再設計・iPad前提)**: ステータスパネルを縦積み1枚から
  タブ式 (つよさ・そうび・じゅもん・もちもの) に変更。パーティ2人以降の
  文字はみ出しを構造的に解消 (1画面1トピック)。つよさは なかまごとのカード +
  HP/MPバー表示。**利用環境は iPad がメイン** — タブ・ボタンは指向けサイズ
  (≥56px)、タブはタップ/←→キー両対応、パネル内の誤タップでは閉じない
  (背景タップの伝播を遮断)、パネル表示中は常設メニューボタンを隠して
  ゴールド表示と重ならないようにした。データ層は buildStatusData (構造化) に刷新。

- **2026-07-27 (おだいクエスト)**: まなびやに「おだいの けいじばん」を設置
  (王都・モリカゲ・ミナトス・ククリ)。その学年 (= 現在の章) の単元ドリル10問に
  挑戦し、正解数 × 単価のゴールドを獲得。単価 = ★難易度 + (学年-1)×2 で、
  むずかしい単元・上の学年ほど高報酬。全問正解で単価×5のボーナス。時間無制限・
  何度でも挑戦可 (稼ぎながら反復学習する導線)。EventCommand に openDrillBoard、
  React に DrillQuestScreen を追加。バリデーション規則を「art つきイベントの
  onceFlag 必須は報酬 (giveItem/giveGold/learnSpell) を配る場合のみ」に緩和し、
  quiz 分岐内のコマンドも参照整合性検査の対象に含めた。

- **2026-07-26 (第2章実装)**: 小2カリキュラム6スキル (九九/ひっ算たし・ひき/
  ながさ/かさ/とけい) と呪文7種を実装。SpellDef を拡張 (target: allEnemies/party、
  hits 連撃、effect: guard/agiUp/atkDown)。パーティ戦闘 (メンバーごとにコマンド
  収集→一括解決、单体回復は最弱自動選択)。EventCommand に joinParty /
  advanceChapter / quiz (正誤分岐・時間無制限) を追加。僧侶タスクはミナトスの
  ほこら前で加入 (Lv6、タシリア持ち)。九九の塔は設計の9階を4階+最上階に縮約
  (各階の扉=九九クイズ、不正解で番人シュウセイエキン戦)。しおかぜ灯台は
  寄り道ダンジョン (とけいクイズで点灯)。ボス=インクの魔女ブロッタ (HP160)。
  E2E: 章2ゴールデンパス追加、Playwright は workers:1 直列 (Phaser 並列フレーク対策)。

- **2026-07-22 (ユーザー指示)**: 建物はDQ同様「外観は閉じて、扉から内部マップへ遷移」する。
  章1に内部マップ8つ (勇者の家/となりの家/カズール城/王都の宿・道具屋・ほこら/
  モリカゲのまなびや・宿) と内装タイル (ベッド・机・じゅうたん・つぼ) を追加。
  ビューポートより小さいマップはカメラ中央寄せ。
- **2026-07-22 (ユーザー指示)**: デバイス既定の絵文字は使わない。かぞえ問題は
  Problem.visual {icon, count} + 自前SVGアイコン (CountIcons.tsx) で描画。
  ウィンドウはDQ風の二重枠に。

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
| 2 | ワールドマップ (旧: 街道) | ドラクエ式の全体マップ。村・王都・森の入口・洞くつはアイコンタイルで、踏むと各マップへシーン遷移。敵: ケシゴムン/インクぐも/かずぬすみネズミ。宿とセーブの教え | 10分 |
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

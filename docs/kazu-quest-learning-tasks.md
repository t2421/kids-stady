# カズクエ 学びの設計 — タスク仕様 (LP-01〜23、Sonnet 移譲用)

> 計画本体は [kazu-quest-learning-plan.md](kazu-quest-learning-plan.md)。本書はそれを
> **1タスク = 1セッション** の仕様に落としたもの。渡すときは
> [kazu-quest-roadmap.md](kazu-quest-roadmap.md) §3 の共通ブリーフ + 本書 §1 (学習タスク共通の
> 前提と固定インターフェース) + 該当タスクの本文を貼る。並列運用は `parallel-agent-waves` スキル。
> 「状態」列: 未 / 進行中 / 済。

## 0. 方針の確定 (計画 §8 の判断 — 決定済み)

| 論点 | 決定 | 理由 |
|---|---|---|
| ゲートの厳しさ | 章の中核3単元が「できる」を **必須** にする。救済は §4.4 の3段 (別の説明 → なかまの助け → 前提へ戻す) | 「できるようになってから進む」が目的。抜け道を残すと学ばずに進める |
| 先取り | **入れる**。ほこらの「さきどり」から、前提を満たす上の学年の単元を学べる (物語は進めない) | 学校より先に進む子・興味が出た子の受け皿。前提グラフが安全網 |
| 漢字 | レッスン本文は **学年配当漢字 + ｜漢字《ルビ》** (小1〜2 はひらがな)。会話は現状どおり | 読める範囲で漢字に触れる。ルビはエンジン済 (KQ-25) |
| 保護者向け | 単元マップをハブページの せいせき にも **出す** (LP-11 の派生、共有学習ログに mastery を書く) | 家庭で「どこまでできたか」を見るため |
| 既存プレイヤー | 合格済み (learned.*) の単元は **「できる」に写す**。レッスンは受け直し不要 (受けたければ まなびやから) | 進行を巻き戻さない |

## 1. 学習タスク共通の前提と固定インターフェース

以下は **全タスクが従う契約**。タスク内で変えたくなったら、変えずに報告する。

### 1.1 型 (LP-01 が `src/content/lessons/types.ts` に置く。他タスクはこれを import)

```ts
/* 図の指定 — 視覚モデル部品 (LP-05〜07) が kind で描き分ける */
export type FigureSpec =
  | { kind: "tenFrame"; count: number; second?: number }               // 10のかたまり (2色)
  | { kind: "numberLine"; from: number; to: number; step?: number; marks?: number[]; highlight?: [number, number] }
  | { kind: "cherry"; total: number; split: [number, number] }         // 既存 CherryDiagram を包む
  | { kind: "columnCalc"; op: "+" | "-" | "×" | "÷"; a: number; b: number; showCarry?: boolean; revealSteps?: number }
  | { kind: "array"; rows: number; cols: number; groupBy?: "row" | "col"; remainder?: number }
  | { kind: "kukuTable"; highlightRow?: number; highlightCol?: number }
  | { kind: "fractionBar"; parts: number; filled: number; second?: { parts: number; filled: number } }
  | { kind: "placeValue"; value: string; highlightDigit?: number }     // "3.25" "12000000"
  | { kind: "areaGrid"; w: number; h: number; unit?: string; shape?: "rect" | "triangle" | "parallelogram" }
  | { kind: "protractor"; angle: number; showReading?: boolean }
  | { kind: "clock"; hour: number; minute: number; second?: { hour: number; minute: number } }
  | { kind: "percentBar"; base: number; part: number; label?: string }
  | { kind: "tapeDiagram"; segments: { label: string; length: number }[]; total?: string }
  | { kind: "treeDiagram"; levels: string[][] }
  | { kind: "letterBox"; expr: string; value?: number }                 // "□ + 3 = 8"
  | { kind: "balance"; left: { label: string; weight: number }[]; right: { label: string; weight: number }[] }
  | { kind: "measureCup"; capacityDl: number; filledDl: number };

/* 誤答の型。choices の各誤答に付け、選ばれた誤答から一言を出す */
export type MistakePattern =
  | "offByOne" | "forgotCarry" | "forgotBorrow" | "echoOperand" | "neighborRow"
  | "placeShift" | "addedDenominators" | "noCommonDenominator" | "swappedBase"
  | "reversedDivision" | "doubleCounted" | "unitConfusion" | "other";

export interface LevelSpec { level: 1 | 2 | 3; label: string }      // 「九九の はんい」など

export interface LessonPage { text: string; figure?: FigureSpec }

export interface LessonDef {
  skillId: string;
  title: string;
  prerequisites: string[];              // skillId。空でよい
  story: { pages: string[] };           // 町の困りごと (1〜3)
  concept: LessonPage[];                // 2〜4
  workedExample: { problem: Problem; steps: LessonPage[] };   // 2〜5 ステップ
  faded: { problem: Problem; blanks: number }[];              // 2〜3
  levels: [LevelSpec, LevelSpec, LevelSpec];
  altExplain: LessonPage[];             // 2回目の説明 (1〜3)
  mistakes: { pattern: MistakePattern; feedback: string }[];
  coreOfChapter?: boolean;              // 章の中核3単元なら true
}
```

### 1.2 セーブ (LP-04 が `src/lib/save.ts` に足す)

```ts
export type MasteryState = "none" | "practicing" | "can" | "mastered";
export interface MasteryEntry { state: MasteryState; reviewDue: number | null; streak: number; passedAt: number | null }
save.mastery: Record<string, MasteryEntry>     // skillId → 状態。normalize で欠損は {} に
```

### 1.3 EventBus (Phaser ⇄ React)

| 方向 | イベント | payload |
|---|---|---|
| Phaser → React | `open-lesson` | `{ skillId, entry: "story" \| "concept" \| "faded" \| "practice" \| "test" }` |
| React → Phaser | `lesson-finished` | `{ skillId, outcome: "passed" \| "failed" \| "aborted", correct, total }` |
| Phaser → React | `open-readiness` | `{ skillId, prerequisites: string[] }` |
| React → Phaser | `readiness-finished` | `{ skillId, ok: boolean, weakest: string \| null }` |
| Phaser → React | `open-review` | `{ skillIds: string[] }` (おさらい 5問) |
| React → Phaser | `review-finished` | `{ results: { skillId, correct, total }[] }` |

### 1.4 EventCommand (LP-01 が types.ts / runner.ts に足す)

- `{ type: "openLesson"; skillId: string }` — まなびやの先生から
- `{ type: "openReview" }` — ほこら/まなびやの「おさらい」 (期日の来た単元を自動選択)
- `{ type: "openPreview" }` — ほこらの「さきどり」 (前提を満たす未受講単元の一覧)
- `FlagCond` 拡張: `{ skill: string; state: MasteryState }` (指定状態 **以上** で成立。順序 none < practicing < can < mastered)

### 1.5 出題の段階 (LP-02)

`generate(skillId, rng, opts?: { level?: 1 | 2 | 3 })`。省略時は **現状と同じ出題** (= Lv2 相当)。
戦闘 = Lv2、おだい = Lv3、れんしゅう = Lv1→3、テスト = Lv2 と Lv3 を半々。

### 1.6 test id 規約 (E2E 用)

`lesson-screen` / `lesson-next` / `lesson-page-<n>` / `lesson-figure` / `faded-blank` / `faded-submit` /
`readiness-screen` / `review-screen` / `mastery-map` / `mastery-cell[data-skill][data-state]` /
`teacher-menu` / `teacher-menu-item[data-skill]` / `preview-menu`。

### 1.7 文言の規約

- 小1〜2 の単元: ひらがな + 分かち書き。小3以降: 学年配当漢字 + `｜漢字《ルビ》` (KQ-25 の記法)
- 声かけは先生の口調 (「〜してみよう」「いいね」)。責めない。絵文字なし
- 1ページ ≤ 60 文字、図がある ページは ≤ 40 文字

---

## 2. 波1: 基盤 (並列可: LP-01 / LP-02 / LP-03 / LP-04)

#### LP-01 [M] レッスンのスキーマ・登録表・バリデーション・コマンド — 状態: 未

- **目的**: §1.1 の型、`src/content/lessons/index.ts` (`LESSONS: Record<skillId, LessonDef>`、`getLesson`)、
  `tests/lessons.test.ts`、EventCommand 3種 + `FlagCond` の skill 条件を入れる
- **触るファイル**: `src/content/lessons/types.ts` (新)、`src/content/lessons/index.ts` (新、最初は空)、
  `src/content/types.ts` (EventCommand 追加、`FlagCond` に `skill`/`state` の別形を union で追加)、
  `src/lib/events/runner.ts` (3 コマンド → effect `{ kind: "openLesson" | "openReview" | "openPreview" }`、
  `evalCond` が skill 条件を `save.mastery` で評価 — mastery が無い間は `none` 扱い)、
  `src/game/scenes/FieldScene.ts` (effect を EventBus に流すだけの3 case、React 側が無い間は
  `ui.showMessage(["じゅんびちゅう"])` で閉じる)、`tests/content.test.ts` (walker に登録)、`tests/runner.test.ts`
- **手順**: 型 → 登録表 → バリデーション (prerequisites 実在・skillId が SKILLS に存在・figure.kind が
  §1.1 の集合・workedExample/faded の problem は `answer ∈ choices`・levels が 1,2,3・
  mistakes の pattern が §1.1 の集合・重複なし) → コマンド → runner テスト (skill 条件の順序比較)
- **受け入れ条件**: typecheck/test 緑。`LESSONS` に **ダミー1件** (g1_add_nc) を入れて全検証が通り、
  そのダミーを壊した (figure.kind を "bogus") ときに落ちることをテストで確認。章バリデーションが
  新コマンドを受け入れる
- **スコープ外**: 画面 (LP-08)、mastery の実体 (LP-04 — `evalCond` は `save.mastery ?? {}` で読む)

#### LP-02 [M] 生成器の level 対応 (小1〜小3の 20 単元) — 状態: 未

- **目的**: `generate(skillId, rng, { level })` を実装し、g1〜g3 の各単元を 3 段階に分ける
- **触るファイル**: `src/lib/curriculum/index.ts` (シグネチャ、省略時 = 2)、`grade1.ts` `grade2.ts` `grade3.ts`
  (各生成器に `level` 引数を追加。既存の引数なし呼び出しと同じ出力を level 2 が返すこと)、
  `docs/kazu-quest-levels.md` (新: 単元 × Lv の値域表)、`tests/curriculum.test.ts`
- **段階の例** (表は docs に全部書く): g1_add_carry Lv1 = 9+□ / Lv2 = 8+□, 7+□ / Lv3 = 全部。
  g2_kuku Lv1 = 2,5の段 / Lv2 = 3,4,6 / Lv3 = 7,8,9。g3_div Lv1 = 九九の範囲 / Lv2 = 0 を含む・2桁÷1桁 /
  Lv3 = あまりあり (g3_div_remainder とは別に「あまりなしの難しい形」)。g3_fraction Lv1 = 1/2,1/3 の
  読み / Lv2 = 同分母の大小 / Lv3 = 同分母のたしひき
- **受け入れ条件**: プロパティテスト: 全 20 単元 × Lv1〜3 × seed 300 問で `answer ∈ choices`、3択ユニーク、
  Lv が上がると値域 (answer の最大 or 桁数 or 演算の種類) が **単調に広がる**。引数なし = Lv2 と
  同一分布 (seed 固定で同じ問題列)。戦闘 (`BattleScene`/`mathRequest`) と おだい (`drills.ts`) は
  それぞれ Lv2 / Lv3 を明示して呼ぶ
- **スコープ外**: g4〜g6 (LP-02b として同形で後続。1セッション)

#### LP-03 [M] 段階ヒントと誤答診断 — 状態: 未

- **目的**: `Problem.hints: [string, string, string]` (考え方 → 途中まで → 直前) と
  `Problem.choiceTags: [MistakePattern, MistakePattern, MistakePattern]` を全生成器に付け、
  `diagnose(problem, chosen): MistakePattern | null` を実装。practice/field でヒントが段階的に深まる
- **触るファイル**: `src/lib/curriculum/types.ts` (Problem 拡張、`hints` は `explain` から自動生成の
  既定値を持たせて、生成器ごとに上書き)、`src/lib/curriculum/choices.ts` (`makeChoices` が
  `[string,string,string]` と並行して tags を返す `makeChoicesTagged`)、各 grade ファイル (最低限:
  g1 全部・g2_kuku・g2_add/sub_column・g3_div・g3_fraction・g5_fraction_diff・g5_percent・g6_speed は
  手書きの 3 段ヒント、他は既定値)、`src/lib/curriculum/diagnose.ts` (新: 3択は tag、テンキーは
  答えの差分から推定: ±1→offByOne、±10→forgotCarry/forgotBorrow、分母の和→addedDenominators …)、
  `src/components/MathPracticeAids.tsx` (ヒントボタンを押すたびに段が深まる、`data-testid="math-hint"`
  の `data-level`)、`tests/diagnose.test.ts`、`tests/curriculum.test.ts`
- **受け入れ条件**: 全単元の全問題で `hints.length === 3`、`choiceTags.length === 3`、
  `diagnose(problem, wrongChoice)` が正解以外の各 choice で null でない。`e2e/practice.spec.ts` を
  更新: ヒントを 3 回押すと `data-level` が 1→2→3、不正解時に誤答型の一言 (`data-testid="mistake-feedback"`)
- **スコープ外**: レッスンの `mistakes` 表との結合 (LP-08 が `LessonDef.mistakes` を優先し、無ければ
  `diagnose` の既定文言を出す)

#### LP-04 [M] 単元の状態 (mastery) と間隔復習のスケジューラ — 状態: 未

- **目的**: §1.2 の `save.mastery` と純ロジック `src/lib/mastery.ts`
- **API**: `masteryOf(save, skillId)`, `onLessonStarted(save, skillId, now)` (none→practicing),
  `onTestResult(save, skillId, passed, now)` (passed → can, reviewDue = now+1日, streak 0),
  `onReviewResult(save, skillId, correct, total, now)` (≥4/5 → 次の間隔 1→3→7日、streak+1、
  streak 2 で mastered / ≤3 → 間隔を1日に戻し practicing に戻さない),
  `dueReviews(save, now)`, `initMasteryFromFlags(save)` (learned.* が set の呪文の learnTest.skillIds を
  can に、`skillStats` で c+w ≥ 10 かつ正答率 ≥ 80% も can)。間隔の定数は `REVIEW_INTERVALS_MS = [1d, 3d, 7d]`
- **触るファイル**: `src/lib/save.ts` (型・default・normalize)、`src/lib/mastery.ts` (新)、`tests/mastery.test.ts`、
  `src/game/session.ts` (`startSession` で `initMasteryFromFlags` を1回適用。冪等)、
  `src/components/PhaserGame.tsx` (debug: `advanceClock(ms)` — mastery の `now` を進めるための
  オフセット。`src/lib/clock.ts` に `now()` を置き、全 mastery 呼び出しはこれを使う)、`e2e/helpers.ts` (型)
- **受け入れ条件**: Vitest (遷移表を全部、normalize 耐性、初期化の冪等性)。既存 E2E 緑
- **スコープ外**: 画面 (LP-11)、共有学習ログへの書き出し (LP-11)

---

## 3. 波2: 視覚モデル (並列可: LP-05 / LP-06 / LP-07)

共通仕様: `src/components/figures/<Kind>.tsx`、入口 `src/components/figures/Figure.tsx` (`<Figure spec={} />`
が kind で振り分け。未実装 kind は「(ず) じゅんびちゅう」を描く)。SVG 自前描画、絵文字なし、
`uiTheme.ts` の色、幅 100% (max 640px)、`data-testid="lesson-figure"` + `data-kind`。
`revealSteps` 系はプロパティで段階表示。テストは `tests/figures.test.tsx` (react-dom/server で
renderToString がエラーなく SVG を含む) と、`/gallery` に「ず」タブを足して全 kind のサンプルを一覧。

#### LP-05 [M] 第1群: tenFrame / numberLine / cherry (既存を包む) / columnCalc / array / kukuTable — 状態: 未

- columnCalc は くり上がりメモ (小さな 1) と `revealSteps` で 1 桁ずつ見せる。÷ は 立てる→かける→ひく→おろす の4段
- 受け入れ: 6 kind がギャラリーで表示、Vitest 緑、`/gallery` の E2E スモーク (`e2e/gallery.spec.ts` 新: 各 kind の `lesson-figure` が 1 つ以上)

#### LP-06 [M] 第2群: fractionBar / placeValue / areaGrid / protractor / clock — 状態: 未

- protractor は内側と外側の目盛りを両方描き、`showReading` で読む側を強調。clock は針を `second` で「あと」を示す
- 受け入れ: LP-05 と同じ

#### LP-07 [M] 第3群: percentBar / tapeDiagram / treeDiagram / letterBox / balance / measureCup — 状態: 未

- percentBar は「もとにする量」を常に 100% の帯で示す。treeDiagram は最大 4 段
- 受け入れ: LP-05 と同じ

---

## 4. 波3: 流れ (LP-08 → LP-09 → LP-10 / LP-11)

#### LP-08 [L] LessonScreen (導入 → 概念 → 例題 → 穴埋め) — 状態: 未 (依存: LP-01, LP-03, LP-05〜07 のうち最低 LP-05)

- **目的**: `open-lesson` で開く React 画面。`entry` で途中からも開ける
- **触るファイル**: `src/components/LessonScreen.tsx` (新、≤ 350 行。ページ送り・図・穴埋めは
  `LessonFaded.tsx` に分離)、`src/components/LessonWorkedExample.tsx` (ステップ再生: 「つぎ」で
  `revealSteps` を進める)、`src/app/page.tsx` (登録)、`src/game/field/lessonFlow.ts` (新: Phaser 側の
  流れ。`openLesson` effect → readiness (LP-10 が差し込む) → `open-lesson` → `lesson-finished` →
  mastery 更新 (LP-04) → 合格演出 → `advance()`)、`FieldScene.ts` (effect を lessonFlow へ)
- **穴埋め**: `faded[i].problem` の式を表示し、`blanks` 個の空欄 (答えと途中の数) を Keypad/3択で埋める。
  空欄の定義は `problem.a / b / answer` のうち後ろから blanks 個
- **受け入れ条件**: `e2e/lesson.spec.ts`: `LESSONS` のダミー g1_add_nc を本物に差し替えた最小レッスン
  (LP-12 の先行分として本タスクで 1 件書く) を通しで: story → concept (図あり) → 例題 3 ステップ →
  穴埋め 2 問 → `lesson-finished` (outcome は practice/test 未接続なので "passed" 扱いで良い) →
  mastery が practicing。全ボタン ≥56px、キー操作は補助
- **スコープ外**: れんしゅう・テストへの接続 (LP-09)、前提チェック (LP-10)

#### LP-09 [M] れんしゅう Lv1→3 とテストの統合・不合格の救済 — 状態: 済 (依存: LP-08, LP-02)

- **目的**: LessonScreen の続きとして「れんしゅう (Lv1 で 3 問連続正解 → Lv2 → Lv3)」→ テスト (10問・
  Lv2/Lv3 半々・8 で合格) → 結果。既存の とっくん/テスト (`spellTestFlow.ts`) を **レッスン経由に置き換え**、
  呪文の習得は「その呪文の learnTest.skillIds の単元が **can 以上**」で自動付与に変える
- **救済**: 不合格 1 回目 → `altExplain` → 穴埋めから。2 回目 → なかまが登場 (会話 1 ページ、
  加入済みの中で分野が合う人) → 穴埋めから。3 回目 → 前提チェック (LP-10) に戻し、前提が can でなければ
  前提レッスンへ
- **触るファイル**: `LessonScreen.tsx`/`LessonPractice.tsx` (新)、`useQuestionLoop.ts` (level 指定と
  「3問連続」判定)、`spellTestFlow.ts` (レッスンへ委譲。`openSpellTest` は互換のため残し、
  `openLesson(spell.learnTest.skillIds[0])` に読み替え)、`src/lib/learnSpell.ts` (mastery から自動付与
  `grantSpellsByMastery(save)`)、`tests/`、`e2e/lesson.spec.ts` (合格経路・不合格→altExplain 経路)
- **受け入れ条件**: 章1 golden path E2E が **無変更で緑** (openSpellTest 互換)、lesson E2E 2 経路緑、
  Vitest (昇段判定・自動付与)
- **スコープ外**: 章ゲートの変更 (LP-20)

#### LP-10 [M] 前提チェック (readiness) と案内 — 状態: 未 (依存: LP-08)

- **目的**: レッスン開始前に前提単元から 3 問 (Lv2)。2 問以上で進む。不足なら「さきに ○○ を
  おさらいしよう」→ 前提のレッスンへ (前提が can 以上なら省略)
- **触るファイル**: `src/components/ReadinessScreen.tsx` (新)、`lessonFlow.ts` (差し込み)、
  `src/content/lessons/prereqs.ts` (計画 §3.4 の前提グラフを **LessonDef が無い単元にも** 適用する
  既定表)、`tests/prereqs.test.ts` (グラフが DAG、全 skillId 実在)、`e2e/lesson.spec.ts` (前提不足で
  案内される経路: `setFlag` 等で g1_add_nc を none にして g1_add_carry を開く)
- **受け入れ条件**: Vitest + E2E。前提が can 以上のときは readiness 画面が出ない

#### LP-11 [M] 単元マップ・おさらい・さきどり・保護者向け — 状態: 未 (依存: LP-04, LP-08)

- **目的**: (1) せいせきタブに単元マップ (学年 × 単元、4 色、タップで状態と次の復習日)、
  (2) `openReview`: 期日の来た単元から最大 3 単元 × 5 問 → `onReviewResult`、(3) `openPreview`:
  前提を満たす未受講単元の一覧 → `openLesson`、(4) マスターで「数晶のかけら」(`inventory.items.kakera_<chapter>`
  を +1、6 つで章の呪文が強化 = `power` +20% を `equipment.ts` 相当の純関数で)、(5) 共有学習ログに
  `mastery` を書く (`shared/learning-core/learning.ts` に `kq_mastery` 相当の任意フィールド —
  正典は docs/save-data.md §4 に追記し、mathematics/keisan は無視して壊れないこと)
- **触るファイル**: `src/components/MasteryMap.tsx` (新)、`StatsScreen.tsx`/`StatusPanelOverlay.tsx` (タブ)、
  `ReviewScreen.tsx`/`PreviewMenu.tsx` (新)、`effectHandlers.ts` (3 effect)、各章の ほこら/まなびや NPC に
  「おさらい」「さきどり」の選択肢 (shrineMenu / spellTestMenu の拡張)、`../../shared/learning-core/learning.ts` +
  `docs/save-data.md`、ハブの せいせき (`shared/js/learning.js` 再生成 `npm run gen:shared` in mathematics)
- **受け入れ条件**: E2E: レッスン合格 → `advanceClock(1日)` → ほこら「おさらい」→ 5 問正解 →
  `advanceClock(3日)` → もう一度 → mastered、かけら +1、単元マップのセルが金。Vitest (かけら・強化)
- **スコープ外**: 先生キャラの見た目 (LP-18)

---

## 5. 波4: レッスン本文 (学年ごと並列: LP-12〜17、各 [L])

共通仕様: 1 学年 = その学年の全単元 (小1: 6 / 小2: 6 / 小3: 8 / 小4: 8 / 小5: 8 / 小6: 8)。
各単元 1 ファイル `src/content/lessons/gradeN/<skillId>.ts`、`index.ts` に登録。
内容: story 1〜3 ページ (町の困りごと、計画 §4.1 の表を埋める) / concept 2〜4 ページ (図必須 2 つ以上) /
workedExample (steps 2〜5、図つき) / faded 2〜3 問 / levels の label / altExplain 1〜3 ページ (**別の
見方**: 例 くりあがりは「さくらんぼ」に対し「10 の かたまりを つくる」) / mistakes 2〜4 件 /
`coreOfChapter` を章の中核 3 単元に付ける (小1: add_carry, sub_borrow, count / 小2: kuku, add_column, time /
小3: div, div_remainder, fraction / 小4: div_2digit, decimal, angle / 小5: percent, fraction_diff, decimal_muldiv /
小6: fraction_muldiv, speed, ratio)。§1.7 の文言規約。`workedExample.problem` と `faded[].problem` は
`generate(skillId, mulberry32(seed), { level })` で作った固定 seed の問題を **そのまま貼る** (手書きしない)。

受け入れ条件 (各学年共通): `tests/lessons.test.ts` 緑、`e2e/lesson-gradeN.spec.ts` でその学年の中核 1 単元を
通し (story → test 合格)、ルビ記法のバリデーション緑、`npm run typecheck`。
LP-12 小1 / LP-13 小2 / LP-14 小3 / LP-15 小4 / LP-16 小5 / LP-17 小6 — 状態: すべて 未。
(LP-02b: g4〜g6 の level 対応は LP-15 の前に 1 セッションで済ませる — 状態: 未)

---

## 6. 波5: 物語への組み込み

#### LP-18 [M] 先生キャラと まなびやの刷新 — 状態: 未 (依存: LP-08)

- 章ごとの先生 (章1 ふくろう博士 / 章2 そろばん船長 / 章3 計算商人 / 章4 はかりの女王 / 章5 割合ギルド長 /
  章6 星読み) のアート (`art/actors.ts` に 6 体、16x16、色違い不可 = 個性を出す)、まなびやの内装に
  黒板タイル、先生 NPC の会話 → `teacher-menu` (単元一覧 = 4 色、中核に印) → `openLesson`。
  既存の `spellTestMenu()` は先生メニューに置き換え (呪文名でなく単元名で並べる)
- 受け入れ: 6 章のまなびやで `teacher-menu` が開き、任意の単元で `lesson-screen` が出る E2E (章1・章4)。
  章 golden path E2E は呪文習得の入口が変わるので更新して緑

#### LP-19 [M] なかまが教える場面 — 状態: 未 (依存: LP-09, LP-18)

- 加入イベント直後に、その なかまの得意分野の短いレッスン (concept 1 ページ + 穴埋め 1 問) を
  `openLesson { entry: "concept" }` で差し込む (タスク=g2_add_column、カケル=g3_mul_column、リトル=g4_decimal)。
  レッスン中の口出し: `LessonDef` に `companionLines?: Record<memberId, string>` を追加し、
  concept の 2 ページ目の後に加入済みなら 1 行挟む
- 受け入れ: 章2〜4 golden path E2E 更新して緑、Vitest (companionLines の memberId 実在)

#### LP-20 [M] 章ゲートの再設計 (中核 3 単元が can) — 状態: 未 (依存: LP-04, LP-09, LP-12〜17)

- 各章のボス前の番人 (`hideIf`) を `{ skill: <core>, state: "can" }` × 3 に (複数条件は番人を 3 人並べる
  現行方式か、`hideIf: FlagCond[]` の AND 対応を runner に足すか — 後者を採用し `content.test.ts` を更新)。
  数晶は「かけら 6 つ」制 (LP-11) と統合。救済 3 段 (計画 §4.4) は LP-09 に含まれる
- 受け入れ: 章1〜6 golden path E2E を「中核単元をレッスン合格で can にしてから進む」に書き換えて緑
  (`__KAZUQUEST_DEBUG__.setMastery(skillId, state)` を追加してよい)。既存セーブは
  `initMasteryFromFlags` で詰まらない (learned.* → can) ことを Vitest で

#### LP-21 [S] 学びの経験値 — 状態: 未 (依存: LP-09)

- レッスン完了 +EXP (章の雑魚 3 戦分)、テスト合格 +EXP (5 戦分)、マスター +EXP (10 戦分)。
  `tests/balanceScenarios.ts` の想定 Lv 到達の概算に加える (`docs/kazu-quest-balance.md` 再生成)
- 受け入れ: Vitest、章1 E2E でレッスン合格後に exp が増える

#### LP-22 [S] ネガリアの色戻し演出 — 状態: 未 (依存: LP-04)

- 章6 のマップ (`tilesNega.ts` のパレット) を、mastered 単元数 0 / 8 / 16 / 24+ の 4 段で明るくする
  (`BootScene` でテクスチャを 4 セット生成、`MapView` が段を選ぶ)。受け入れ: Vitest (段の選択)、章6 E2E 緑

#### LP-23 [M] E2E 総仕上げ — 状態: 未 (依存: 全部)

- `e2e/learning.spec.ts`: 小1・小3・小5 の中核単元をレッスンから合格まで通す / 前提不足の案内 /
  おさらい → マスター / さきどり (小1 のセーブで小2 の単元を学ぶ) / 章ゲート (can 未満で番人が残る)。
  `e2e.yml` のスモークに `lesson.spec.ts` を追加。受け入れ: フル E2E 緑

---

## 7. 実行順と並列の組

```
波1: LP-01 | LP-02 | LP-03 | LP-04            (4 並列)
波2: LP-05 | LP-06 | LP-07 | LP-02b           (4 並列。LP-08 は LP-01+LP-05 が済めば着手可)
波3: LP-08 → LP-09 → (LP-10 | LP-11)          (LP-10/11 は並列)
波4: LP-12 | LP-13 | LP-14 | LP-15 | LP-16 | LP-17   (6 並列。LP-08 の画面が無くてもデータは書ける →
                                              実際は 波2 と同時に始めてよい。E2E の受け入れだけ LP-09 後)
波5: LP-18 | LP-21 | LP-22 → LP-19 → LP-20 → LP-23
```

衝突しやすい共有ファイル: `src/content/types.ts` / `runner.ts` / `content.test.ts` (LP-01 のみ)、
`page.tsx` (LP-08, LP-10, LP-11)、`effectHandlers.ts`・`FieldScene.ts` (LP-01, LP-08, LP-11)、
`useQuestionLoop.ts`・`MathPromptPanel.tsx` (LP-03, LP-09)、`save.ts` (LP-04 のみ)、
`e2e/helpers.ts` (LP-04 の advanceClock, LP-20 の setMastery)。同じ波では 1 タスクに 1 ファイル。

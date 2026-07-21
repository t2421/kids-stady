# マスマティクス — Phaser 4 + Next.js 算数シューティング 実装計画

> **ステータス**: 承認済み・実装前 (2026-07-21)
> 実装が進んだら、この文書との差分 (設計変更) をこのファイルに追記して更新すること。

## Context

きっずスタディの2本目のアプリ「マスマティクス」を本格実装する。ファミコンのグラディウスへのオマージュとなる横スクロールシューティングに算数学習を統合する。現状 `apps/mathematics/index.html` は18行の「準備中」スタブ。

- **アイテム取得 = 算数問題**: カプセルを取ると3択問題、正解でパワーアップ
- **ボス戦 = 算数バトル**: 正解で必殺技ゲージ+シールド
- **学年制**: 小1〜小6の6ステージ。各学年に「インプットステージ」(学習) と「アウトプットステージ」(実戦) がある
- 目的: 高いゲーム性で飽きさせず、計算の正確さとスピードを伸ばし、改善をデータで見える化

## 確定済み方針 (ユーザー回答)

- **技術**: **Phaser 4** (npm `phaser@^4`, 2026年正式リリース) + **Next.js** + TypeScript
  - 公式テンプレート **`phaserjs/template-nextjs`** (Phaser 4版) を骨格として採用: `PhaserGame.tsx` ブリッジ + `EventBus` によるReact↔Phaser通信パターン
  - v4はレンダラー刷新 (RenderNode化) だが、シーン/Arcade Physics/入力/Tween/Scale等の開発者向けAPIはv3と同一概念。新規開発なので移行負担なし。`Phaser.Create.GenerateTexture` パレットは削除済み → 手続きテクスチャは `Graphics.generateTexture()` / `DynamicTexture` (scaffold時にv4 APIで確認)
  - UI層: ゲーム内HUD・演出はPhaserシーン、**メニュー/問題パネル/解説/プロフィール/統計はReactコンポーネント** (Next.js採用によりReactがUI層。EventBusでゲームと連携)
  - テスト: Vitest (unit: カリキュラム/セーブ/移行) + Playwright (E2E)
- **デプロイ**: Next.js **static export** (`output:'export'`) を GitHub Actions でビルドし、既存静的サイトと合成して GitHub Pages へ配布。keisan-shooter は従来どおり無ビルド配信
- 操作: タッチ優先 — 相対ドラッグで自機移動、常時オートショット。マウスも同様
- 解答: 常に3択タップ
- スコープ: 6学年の枠組み + **1年生を完全実装**。2〜6年生はロック表示
- セーブ: プロフィール(名前+アバター)は keisan-shooter と共有 (localStorage契約)。ゲーム進行はアプリごと分離
- ※「ビルド不要」ポリシーはアプリ単位に緩和 (README/docs 更新)。mathematics はビルドあり、既存アプリは据え置き

---

## Part 1: 共有プロフィール基盤

### 新規 `shared/js/profiles.js` (vanilla、keisan用 ~120行)

`window.KidsProfiles` を公開。中立キー `kidsStudy.profiles.v1` に `{activeId, profiles:[{id,name,avatar}]}`。

- API: `AVATARS` / `readJSON` / `writeJSON` / `listProfiles()` / `getActiveId()` / `setActiveId(id)` / `createProfile(name,avatar)→id` / `deleteProfile(id)` (identityのみ削除)
- **移行**: `localStorage.getItem("kidsStudy.profiles.v1") === null` (キー完全不在) のときだけ `kidsStudy.keisanShooter.profiles.v1` を丸ごとコピー。空配列でも再移行しない (削除済み復活防止)。旧キーは消さない。IDは保存され `kidsStudy.keisanShooter.profileData.<id>` はそのまま有効

### 修正 `apps/keisan-shooter/progression.js` (~30行差分) + `index.html` (1行)

`Progression` API表面は不変。index管理関数を `KidsProfiles.*` への薄いラッパーに差し替え。旧単一セーブ (`kidsStudy.keisanShooter.profile.v1`) の移行は keisan 側に残す。index.html に `<script src="../../shared/js/profiles.js">` を1行追加。

### TS側 `src/lib/profiles.ts` (mathematics内)

同じストレージ契約を TypeScript で実装 (キー・移行ルール同一)。契約は `docs/save-data.md` (新規) に明文化して二重実装のドリフトを防ぐ。localStorage アクセスは client-only (`"use client"` コンポーネント/effect内のみ)。プロフィール削除時の他アプリデータ孤児は許容 (両アプリとも欠損はデフォルトへ正規化)。

## Part 2: プロジェクト構成 (`apps/mathematics/` を Next.js プロジェクト化)

公式 `phaserjs/template-nextjs` (Phaser 4版) をベースに再構成:

```
apps/mathematics/
├── package.json            # private。phaser@^4, next, react, typescript, vitest, playwright
├── next.config.ts          # output:'export', basePath/assetPrefix は env (CI: /kids-stady/apps/mathematics), images.unoptimized
├── tsconfig.json           # strict
├── playwright.config.ts
├── src/
│   ├── app/                # App Router。page.tsx はゲームを dynamic import (ssr:false)
│   ├── components/         # Reactコンポーネント (UI層)
│   │   ├── PhaserGame.tsx      # 公式テンプレのブリッジ (game生成・EventBus購読・ref公開)
│   │   ├── ProblemPanel.tsx    # 3択問題パネル (巨大ボタン≥72px、タイマーバー)
│   │   ├── MistakeOverlay.tsx  # 解説 (さくらんぼ図+ステップ)
│   │   ├── CherryDiagram.tsx   # インタラクティブさくらんぼ (ヒントと解説で共用)
│   │   ├── ProfileSelect.tsx / ProfileCreate.tsx
│   │   └── StatsScreen.tsx     # 履歴+スキル別トレンド
│   ├── game/               # Phaser側 (Reactから隔離)
│   │   ├── EventBus.ts         # React↔Phaser イベントバス (公式パターン)
│   │   ├── main.ts             # Phaser.Game 設定: 960x540, Scale.FIT + autoCenter
│   │   ├── scenes/  Boot / Title / GradeMap / Hangar / Flight / Hud
│   │   ├── entities/ ship / enemies / bullets / capsules / boss
│   │   ├── waves.ts  powerups.ts
│   │   └── sfx.ts              # WebAudio合成 (音源ファイル0)
│   └── lib/                # 純ロジック (React/Phaser非依存 → Vitest対象)
│       ├── curriculum/  types.ts  grade1.ts  index.ts
│       ├── profiles.ts  save.ts  grades.ts
├── tests/                  # Vitest
└── e2e/                    # Playwright スモーク
```

- **React↔Phaser通信は EventBus のみ** (直接参照禁止): 例 `capsule-collected {skillId}` → React が ProblemPanel 表示 → `answer-submitted {correct, ms}` → Phaser 再開。シーンpause/スローモはPhaser側で完結
- グラフィックは BootScene で手続き生成 + 絵文字テキスト (画像アセット0)。効果音も WebAudio 合成

## Part 3: カリキュラムモデル (`src/lib/curriculum/`)

```ts
type Problem = {
  skillId: string; text: string;           // 表示文字列 (かぞえるは絵文字列)
  a: number|null; b: number|null; op: "+"|"-"|null;  // さくらんぼ図用
  answer: string;                           // 文字列統一 (将来の "1/2" "0.6" 対応)
  choices: [string, string, string];        // 常に3択、シャッフル済み
  hint: { type:"cherry"; split:{first:number; second:number} } | null;
  explain: string[];                        // 解説ステップ
};
SKILLS: g1_count(🍎かぞえ3-9) / g1_compare(どっちがおおきい) / g1_add_nc(和≤10)
      / g1_add_carry(くりあがり≤20) / g1_sub_nc / g1_sub_borrow(くりさがり)
      / g2〜g6はラベルのみ登録・gen未実装 (九九/ひっさん/わりざん/小数/分数/比例…)
makeChoices(answer, kind)  // ±1、くりあがり忘れ(±10)、オペランドエコー。重複排除・負数クランプ
pickSkill(skillIds, skillStats)  // 正答率が低い/遅いスキルを重み付けで多く出題
```

純関数群。Vitest でプロパティテスト (各スキル500問生成: answer∈choices、3択ユニーク、値域正当)。

## Part 4: 進行とセーブ (`src/lib/`)

- `grades.ts`: `GRADES[6]` データ。1年生: インプット3レッスン (かずと くらべっこ→エンジン🔧 / たしざん こうじょう→ウイング🪽 / ひきざん こうじょう→キャノン🔫、各8問) + アウトプット定義 (capsuleSkills / bossSkills=くりあがり・くりさがり / answerTimeMs:12000 / waves / boss:{name:"けいさんキング・イチ", hp:100, chipCap:0.15})
- `save.ts`: キー `kidsStudy.mathematics.profileData.<id>`。
  `{ version:1, unlockedGrade:1, grades:{[g]:{inputMedals, inputCleared, outputCleared, bestScore}}, totalCorrect, totalWrong, history:[cap50: {ts,grade,mode:"input"|"output",stageName,correct,wrong,accuracy,avgAnswerMs,score}], skillStats:{[id]:{c,w,recentMs:[cap20]}} }`
  `recordAnswer(skillId, correct, ms)` を全解答箇所から呼ぶ。normalize でスキーマ防御
- ゲート: 全レッスンメダル≥1 → アウトプット解放。アウトプットクリア → `unlockedGrade=g+1` (2年生以降は `implemented` フラグも必要、なければ準備中)

## Part 5: FlightScene — シューティング本体

- **入力**: pointer相対ドラッグ (指のデルタ×1.1 — 指が自機を隠さない)。常時オートショット (パワーで連射短縮)。Arcade Physics overlap (自機当たり判定は見た目の~40%)
- **背景**: 3層パララックス星空 (TileSprite)。学年ごとに色調変更できるデータ構造
- **パワーアップラダー** (自動進行): ①スピードアップ→②ダブル→③ミサイル→④レーザー→⑤オプション(最大2、軌跡追従)→⑥バリア(2発吸収)。HUDに6枠ラダー、次枠が光る
- ハート3。被弾 → ハート1減+ラダー1段降格+1.5秒無敵点滅+画面シェイク。0でゲームオーバー (つづける=ウェーブ再開・パワー-2 / やめる)
- **カプセル→問題フロー**: 接触 → 0.4秒スローモ → pause → EventBus → React ProblemPanel (背景薄暗く、タイマーバー12秒)
  - 正解 → パワーアップ音+ラダー進行、5秒未満でスピードボーナス、復帰1秒無敵
  - 不正解 → MistakeOverlay (さくらんぼ図+ステップ)。ハート減なし、カプセル消費
  - タイムアウト → 「こたえは 15 だったよ」→誤答として記録→再開
  - 全解答で `recordAnswer(skillId, correct, elapsedMs)`
- **ウェーブ (1年生 ~2.5分)**: プチUFO(サイン波1HP) / ぐるぐる隕石(2HP) / つっこみ鳥(y追尾)。**赤い4機編隊を全滅→確定カプセル** (グラディウスオマージュ)。赤単機もドロップ。1ラン6〜8カプセル。ウェーブは grades.ts のデータ駆動

## Part 6: ボス戦 (FlightScene内フェーズ + `entities/boss.ts`)

- 最終ウェーブ後に登場、HPバー slide-in。通常ショットはチップダメージ (HPの15%上限) — 撃破には必殺技 (正解6〜8問) が必須
- **問題ドローン**: ~10秒ごとに「？カプセル」が横切る → bossSkills の問題
  - 正解 → 必殺ゲージ+1 (max3) + シールドバブル (次の被弾1回吸収8秒)。満タンでHUDの必殺ボタンが光る → タップで画面フラッシュビーム30ダメージ
  - 不正解 → 解説 (ボス停止)。次の攻撃がやや強化 (罰の連鎖はさせない)
- 攻撃は**全て1秒前に予告** (警告線/ゾーン点滅): 狙い3連射 / 扇形弾 / 縦スイープレーザー (安全地帯必ず可視)。HP66%/33%でフェーズ変化
- 勝利 → クリア画面: スコア・正答率・平均解答時間・メダル → unlock更新 + history記録

## Part 7: HangarScene — インプットステージ (整備ドック)

- テーマ: **機体を組み立てる**。正解ごとに機体シルエットへパーツが1ピースずつ装着 (tween)
- 各レッスン8問・時間表示なし (解答msは静かに記録)・3択・即時フィードバック
- くりあがり/くりさがりには解答前の**インタラクティブさくらんぼヒント** (`CherryDiagram.tsx`: タップで数を分解、正解判定つき。解説と共用)
- レッスン終了 → メダル (🥇8/8 🥈≥6 🥉クリア)、リプレイ可。3レッスン完了 → 格納庫ドア開放「しゅつげき じゅんび かんりょう!」

## Part 8: UI・統計・登録

- Reactコンポーネント: ProblemPanel / MistakeOverlay / CherryDiagram / ProfileSelect・Create (keisanのUXを踏襲、profiles.ts契約で駆動) / StatsScreen。タイトル・マップ・HUD・クリア画面はPhaserシーン
- **統計画面**: 直近ラン一覧 (日付・ステージ・正答率・**平均解答時間**) + スキル別正答率と速度トレンド (直近10問 vs 前10問 → 「はやくなってる! ⏫」)
- `sfx.ts`: shoot/hit/capsule/correct/wrong/powerup/beam/fanfare を WebAudio 合成。初回ポインタで resume
- `shared/js/apps-registry.js` の description を正式版に更新 (path は `apps/mathematics/index.html` → `apps/mathematics/` へ変更が必要か確認: export の出力は `index.html` を含むためそのままでも可)
- 縦持ちは「よこむきに してね 🔄」オーバーレイ

## Part 9: CI/CD (`.github/workflows/deploy.yml` 新規)

main への push で:
1. checkout → setup-node (cache) → `npm ci && npm run build` (apps/mathematics、`NEXT_PUBLIC_BASE_PATH=/kids-stady/apps/mathematics` を注入して static export → `out/`)
2. `_site/` を組み立て: ルート `index.html` + `shared/` + `apps/keisan-shooter/` をコピー、`apps/mathematics/out/` → `_site/apps/mathematics/`
3. `actions/upload-pages-artifact` → `actions/deploy-pages`
4. Pages のソースを branch→GitHub Actions に切替 (`gh api -X PUT repos/t2421/kids-stady/pages -f build_type=workflow`)。失敗時のフォールバック: out をコミットする方式に一時退避
5. CI で `vitest run` + `tsc --noEmit` (+ lint) も実行

README と docs/adding-a-new-app.md に「ビルドありアプリ (Next.js)」の追加手順を追記。

---

## 実装順序と検証

| # | マイルストーン | 検証 |
|---|---|---|
| 1 | 共有プロフィール: shared/js/profiles.js + keisan委譲 + docs/save-data.md | node --check、Chrome MCPで旧キーシード→移行→gems/履歴無傷→作成/削除/再読込 |
| 2 | template-nextjs ベースの scaffold (Boot/Titleが出るだけ) + **CI/Pagesワークフローを先に通す** | ローカル `npm run dev`、push→Actions緑→本番URLで新旧両アプリ表示 (basePath検証) |
| 3 | profiles.ts/save.ts + ProfileSelect/Create + GradeMapScene + Vitest基盤 | vitest緑 (移行・normalize)、Chrome MCPクリックスルー |
| 4 | curriculum 1年生 + プロパティテスト | vitest: 各スキル500問検証 |
| 5 | FlightScene コア (ドラッグ/オートショット/ウェーブ/衝突/ハート/ゲームオーバー) + HudScene | Chrome MCPプレイスルー、FPS確認 |
| 6 | カプセル→ProblemPanel (EventBus)、ラダー、MistakeOverlay+さくらんぼ、テレメトリ | プレイスルー + localStorage確認 |
| 7 | ボス (パターン/ゲージ/シールド/必殺技/クリア/解放) | ボス撃破まで通し |
| 8 | HangarScene (3レッスン/組み立て/メダル/ゲート) | 新規プロフィールでインプット→アウトプット通し |
| 9 | StatsScreen・バランス・sfx磨き・registry説明・Playwright E2E | E2E緑 + **両アプリ回帰** (プロフィール切替が双方に反映) |
| 10 | 最終デプロイ | Actions緑 → 本番プレイスルー (タブレット相当ビューポート) |

コミットは機能単位 (少なくとも: ①共有プロフィール ②scaffold+CI ③カリキュラム ④シューター ⑤ボス ⑥インプット ⑦統計+ポリッシュ)。

## リスクと対策

- **Next.js static export の basePath**: サブパス配信 (`/kids-stady/apps/mathematics`) は env 注入で切替、ローカル dev は basePath なし。マイルストーン2で最初に配管を証明。`next/image` は unoptimized (そもそも画像アセットほぼ0)
- **SSRとPhaser/localStorage**: ゲームは `dynamic(..., {ssr:false})`、localStorage は client-only。公式テンプレートが既に解決済みのパターン
- **Pages ソース切替**: 失敗時は out コミット方式に退避
- **プロフィール契約の二重実装** (vanilla JS + TS): docs/save-data.md に契約を明文化。TS側はVitest、JS側はブラウザ検証
- **移行エッジケース**: 中立キー完全不在時のみ移行。両アプリ同時初回でも冪等。keisan変更と profiles.js は同一コミット
- **タブレット性能**: Phaserのプール/グループ再利用、DPR上限、パーティクル控えめ。Chrome CPUスロットルで確認
- **幼児の誤タップ**: 選択ボタン≥72px、フィードバック中は入力無効、解答後1秒無敵
- **Phaser 4の新しさ**: 開発者向けAPIはv3とほぼ同一でv3の知見が使える。v4固有差分は公式移行ガイド (phaserjs/phaser changelog/v4) とContext7で確認
- **3択制約と将来学年**: answer/choices は最初から string 型

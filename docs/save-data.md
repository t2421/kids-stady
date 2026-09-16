# セーブデータ (localStorage) 契約

きっずスタディの全アプリが従うストレージ契約。**この文書を正典**とし、
挙動を変えるときは本書と実装を同時に更新する。

実装は `shared/learning-core/` に単一ソース化されている
(`profiles.ts` = §1 / `learning.ts` = §4)。vanilla 版 (`shared/js/*.js`) は
そこからの生成物なので直接編集しない — 詳細は
[shared/learning-core/README.md](../shared/learning-core/README.md)。

## 1. 共通プロフィール索引 (全アプリ共有)

| キー | 値 |
|---|---|
| `kidsStudy.profiles.v1` | `{ "activeId": string \| null, "profiles": [{ "id": string, "name": string, "avatar": string }] }` |

- `id` は `"p" + ランダム36進7文字` (例 `p3f8k2q1`)。**全アプリ横断の主キー**
- `activeId` は最後に選択されたプロフィール。`profiles` に存在しない id を指していたら `null` 扱いに正規化する
- アバター一覧: `🦊 🐱 🐶 🐰 🐻 🐼 🦁 🐸 🐵 🐧` (先頭がデフォルト)
- **実装は単一ソース**: `shared/learning-core/profiles.ts` が正典。
  - Next系アプリは `src/lib/profiles.ts` の再エクスポート経由で使う
  - 静的アプリは `shared/js/profiles.js` (`KidsProfiles.*`) を `<script>` で読む。
    **このファイルは自動生成** (`cd apps/mathematics && npm run gen:profiles`)。直接編集しない

### 旧データからの引き継ぎ (一度だけ)

1. **共通索引への移行**: `localStorage.getItem("kidsStudy.profiles.v1") === null`
   (キーが一度も作られていない) のときに限り、旧けいさんシューター索引
   `kidsStudy.keisanShooter.profiles.v1` の中身を正規化してそのままコピーする。
   - 空配列でも共通キーが存在するなら**再移行しない** (全プロフィール削除済みの状態を旧データで復活させない)
   - 旧キーは**削除しない** (ロールバック時の保険)
   - `id` を保存するので、既存の per-app データはそのまま有効
2. **単一セーブの移行** (けいさんシューター固有・`apps/keisan-shooter/progression.js` の責務):
   プロフィールが0件かつ `kidsStudy.keisanShooter.profile.v1` が存在するとき、
   「プレイヤー1」として `createProfile` し、旧データを
   `kidsStudy.keisanShooter.profileData.<id>` に書き込む

## 2. アプリごとのゲーム進行データ

| キー | 所有者 |
|---|---|
| `kidsStudy.keisanShooter.profileData.<id>` | けいさんシューター |
| `kidsStudy.mathematics.profileData.<id>` | マスマティクス |
| `kidsStudy.kazuQuest.profileData.<id>` | カズクエ |

- スキーマは各アプリが自由に定義するが、**読み込み時に必ず normalize** (欠損・型不正はデフォルト値で埋める)。存在しないキーの読み込みはデフォルトデータ扱い
- 例: カズクエの `settings` (音関連) は `{ sound: boolean, volume: 0 | 1 | 2 | 3 }`。`sound` は完全ミュート
  (既定 `true`)、`volume` は音量段階 (既定 `2` = ふつう) で両者は独立に保存される (`src/lib/save.ts` の
  `normalizeSettings` — AU-01)
- プロフィール削除 (`deleteProfile`) は索引からの除去 + **削除を実行したアプリ自身の** profileData 削除のみ。
  他アプリの profileData は残る (孤児データは小さいため許容。各アプリは normalize で耐える)

## 3. 実装上の注意

- `localStorage` アクセスは必ず try/catch (プライベートブラウズや `file://` の制限で throw する環境がある)。
  書けない場合はメモリ上の値で続行
- JSON.parse 失敗は `null` 扱い
- TypeScript 実装ではサーバーサイド (SSR) から触らない — client-only で使う

## 4. 共有学習ログ (全アプリ共通)

| キー | 所有者 |
|---|---|
| `kidsStudy.learning.v1.<id>` | 全アプリ共有 (書き込みは各アプリ、閲覧はせいせき画面) |

スキーマ:

```json
{
  "version": 1,
  "skills": {
    "<skillId>": { "app": "mathematics", "c": 12, "w": 3, "ms": [2400, 1800], "lastTs": 1784.. }
  },
  "daily": { "2026-07-24": { "c": 20, "w": 4 } }
}
```

- `skillId` はアプリ側で一意になる接頭辞を付ける (mathematics: `g1_add_carry` 等 / keisan-shooter: `ks_add_carry` 等 / kazu-quest: 内部ID `g3_div` 等に `kq_` を前置して `kq_g3_div`)
- `ms` は直近の解答時間 (cap 20)。**計測できない場合は記録しない** (0 を渡すと ms には積まれず正誤だけ記録)
- `daily` は日別の正誤集計 (cap 60日、古い日から削除)
- **実装は単一ソース**: `shared/learning-core/learning.ts` が正典。
  - Next系アプリはこれを直接 import する (mathematics は `src/lib/learning.ts` が再エクスポート)
  - 静的アプリは `shared/js/learning.js` (`KidsLearning.record/load/remove` + 分析ヘルパ) を `<script>` で読む。
    **このファイルは自動生成** (`cd apps/mathematics && npm run gen:learning`)。直接編集しない
    (§1 とまとめて再生成するなら `npm run gen:shared`)
- プロフィール削除時はこのキーも削除してよい (削除実行アプリの責務)

### 4.1 `mastery` (任意フィールド、kazu-quest 専用の書き込み — LP-11b)

```json
{
  "version": 1,
  "skills": { "...": "(§4 本体と同じ)" },
  "daily": { "...": "(§4 本体と同じ)" },
  "mastery": {
    "kq_g3_div": "mastered",
    "kq_g1_add_carry": "can"
  }
}
```

- kazu-quest の単元マップ (`src/components/MasteryMap.tsx`) と間隔復習が使う単元の習熟状態
  (`none` / `practicing` / `can` / `mastered`。kazu-quest 内部の `MasteryState` — `src/lib/save.ts` — と同じ4値)
  を、せいせき画面の外からも見えるように写した任意フィールド
- キーは `skills` と同じ規約で `kq_` 接頭辞を付ける (kazu-quest 内部の skillId、例 `g3_div` → `kq_g3_div`)
- **書き込みは kazu-quest のみ**: `src/game/session.ts` の `autosave()` から毎回、
  `save.mastery` (全単元) を丸ごと置き換える (`shared/learning-core/learning.ts` の `writeMastery`)。
  差分マージではなく完全な置換 — 書き手が1つだけなので単純さを優先した
- **後方互換 (必須)**: `version`/`skills`/`daily` は一切変更していない。既存の `LearningLog` に
  `mastery` キーが無い場合 (mathematics/keisan-shooter が書いたログ、または旧バージョンの記録) は
  `normalizeLog` がこのキー自体を出力に含めない — 呼び出し側が存在チェックをしなくても
  壊れない。mathematics/keisan-shooter はこのフィールドを**一切参照しない** (読み書きどちらもしない)。
  両アプリの既存テストは無変更のまま green (2026-09-15 時点で確認: `apps/mathematics` の
  `npm test` 79件 green。`apps/keisan-shooter` はそもそも `package.json`/自動テストを持たない
  静的アプリなので該当テストなし — `progression.js`/`index.html` は `KidsLearning.record` のみ呼び、
  `mastery` を読み書きしていないことをコードから確認済み)

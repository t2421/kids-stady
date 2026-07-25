# learning-core — 全アプリ共通のデータ基盤

アプリ間で共有するのは**データだけ** (ゲームロジック・見た目は共有しない)。
ここが唯一の実装 (正典) で、各アプリはこれを再エクスポートして使う。

| モジュール | 内容 | ストレージ契約 |
|---|---|---|
| `profiles.ts` | プレイヤープロフィール (名前+アバター) | `docs/save-data.md` §1 |
| `learning.ts` | ゲーム横断の学習ログ | `docs/save-data.md` §4 |

## アプリからの使い方

### Next系 (TypeScript)

アプリ内の `src/lib/*.ts` が再エクスポートしているので、そちらを import する。

```ts
import { listProfiles, createProfile } from "@/lib/profiles";
import { recordLearning, skillReports, weakSkills } from "@/lib/learning";

recordLearning(profileId, "kazu-quest", "kq_kuku", true, 2300);
```

(kazu-quest は `@/lib/profiles` — 再エクスポート元の相対パスはアプリの位置に合わせる)

### 静的HTML (vanilla)

```html
<script src="../../shared/js/profiles.js"></script>
<script src="../../shared/js/learning.js"></script>
<script>
  KidsProfiles.listProfiles();
  KidsLearning.record(profileId, "keisan-shooter", "ks_add_carry", true, 0);
</script>
```

## ルール

- `shared/js/profiles.js` と `shared/js/learning.js` は**生成物**
  (`cd apps/mathematics && npm run gen:shared`)。**直接編集しない**
- ロジックを変えるときは正典 (`profiles.ts` / `learning.ts`) を変更 → テスト
  (`apps/*/tests/profiles.test.ts`, `apps/mathematics/tests/learning.test.ts`)
  → `npm run gen:shared` で再生成
- 生成は mathematics の `prebuild` / `predev` に組み込み済み
- スキルIDはアプリ接頭辞付き (`g1_*`=mathematics, `ks_*`=keisan-shooter, `kq_*`=kazu-quest 推奨)
- 解答時間が計測できないときは `elapsedMs: 0` (正誤のみ記録される)

## 新しい共有モジュールを足すとき

1. `shared/learning-core/<name>.ts` に正典を書く (localStorage が無い環境でも落ちないこと)
2. 各アプリの `src/lib/<name>.ts` から `export *` で再エクスポート
3. vanilla が必要なら `vanilla-<name>-entry.ts` を足し、`gen:<name>` を
   `apps/mathematics/package.json` の `gen:shared` に連結する

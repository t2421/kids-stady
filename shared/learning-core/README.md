# learning-core — 全アプリ共通の学習ログ基盤

`learning.ts` が唯一の実装 (正典)。ストレージ契約は `docs/save-data.md` §4。

## アプリからの使い方

### Next系 (TypeScript)

```ts
import { recordLearning, loadLearning, skillReports, weakSkills, recentDaily } from "../../shared/learning-core/learning";

recordLearning(profileId, "kazu-quest", "kq_kuku", true, 2300);
```

(パスはアプリの位置に合わせる。mathematics は `@/lib/learning` の再エクスポート経由)

### 静的HTML (vanilla)

```html
<script src="../../shared/js/learning.js"></script>
<script>
  KidsLearning.record(profileId, "keisan-shooter", "ks_add_carry", true, 0);
</script>
```

## ルール

- `shared/js/learning.js` は生成物 (`cd apps/mathematics && npm run gen:learning`)。**直接編集しない**
- ロジックを変えるときは `learning.ts` を変更 → テスト (`apps/mathematics/tests/learning.test.ts`) → 再生成
- スキルIDはアプリ接頭辞付き (`g1_*`=mathematics, `ks_*`=keisan-shooter, `kq_*`=kazu-quest 推奨)
- 解答時間が計測できないときは `elapsedMs: 0` (正誤のみ記録される)

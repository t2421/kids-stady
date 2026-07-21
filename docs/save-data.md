# セーブデータ (localStorage) 契約

きっずスタディの全アプリが従うストレージ契約。実装が複数ある
(vanilla JS: `shared/js/profiles.js` / TypeScript: `apps/mathematics/src/lib/profiles.ts`)
ため、**この文書を正典とし、挙動を変えるときは両実装と本書を同時に更新する**。

## 1. 共通プロフィール索引 (全アプリ共有)

| キー | 値 |
|---|---|
| `kidsStudy.profiles.v1` | `{ "activeId": string \| null, "profiles": [{ "id": string, "name": string, "avatar": string }] }` |

- `id` は `"p" + ランダム36進7文字` (例 `p3f8k2q1`)。**全アプリ横断の主キー**
- `activeId` は最後に選択されたプロフィール。`profiles` に存在しない id を指していたら `null` 扱いに正規化する
- アバター一覧: `🦊 🐱 🐶 🐰 🐻 🐼 🦁 🐸 🐵 🐧` (先頭がデフォルト)

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

- スキーマは各アプリが自由に定義するが、**読み込み時に必ず normalize** (欠損・型不正はデフォルト値で埋める)。存在しないキーの読み込みはデフォルトデータ扱い
- プロフィール削除 (`deleteProfile`) は索引からの除去 + **削除を実行したアプリ自身の** profileData 削除のみ。
  他アプリの profileData は残る (孤児データは小さいため許容。各アプリは normalize で耐える)

## 3. 実装上の注意

- `localStorage` アクセスは必ず try/catch (プライベートブラウズや `file://` の制限で throw する環境がある)。
  書けない場合はメモリ上の値で続行
- JSON.parse 失敗は `null` 扱い
- TypeScript 実装ではサーバーサイド (SSR) から触らない — client-only で使う

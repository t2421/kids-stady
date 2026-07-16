# 新しいアプリの追加手順

苦手分野ひとつにつき、アプリを1つ追加する。ビルド不要・静的ファイルのみで動く構成。

## 手順

1. `templates/new-app/` を `apps/<アプリのslug>/` へコピーする。
   ```bash
   cp -r templates/new-app apps/kanji-quest
   ```
2. `apps/<slug>/index.html` の `<title>` と本文を、そのアプリ用に書き換える。
   - `shared/css/tokens.css` の `.pill` `.overlay` `.bigbtn` `.modebtn` などの共通クラスを使うと、
     他アプリと統一感のある見た目になる。ゲーム固有の見た目だけを `<style>` に追記する。
   - 効果音は `shared/js/audio.js` の `KidsAudio()` を使う (`shared/js/audio.js` 参照)。
   - 3Dモデルなど大きな素材を使う場合は `apps/<slug>/assets/` に置く。file:// で開いても
     fetch制限に引っかからないよう、テキスト系素材(OBJ/MTL等)はJSファイルに埋め込む方式を
     推奨する (`apps/keisan-shooter/assets/models-data.js` を参考にする)。
3. `shared/js/apps-registry.js` の `KIDS_APPS` 配列に1件追加する。
   ```js
   {
     id: "kanji-quest",
     title: "漢字クエスト",
     subject: "こくご（かんじ）",
     description: "...",
     emoji: "🈶",
     color: "#54d1a1",
     path: "apps/kanji-quest/index.html",
   }
   ```
4. トップページ (`index.html`) を開いて、カードが追加されていることを確認する。

## 設計方針

- **ビルド不要**: すべて classic `<script>` / `<link>` タグで完結させる。ES module (`type="module"`)
  は使わない — file:// で開いたときに動かなくなるため。
- **共通化するもの**: 見た目のトークン (`shared/css/tokens.css`)、効果音エンジン (`shared/js/audio.js`)、
  アプリ一覧 (`shared/js/apps-registry.js`) だけを共通化する。ゲームロジックは共通化しない
  (アプリごとに独立させ、1本のアプリの変更が他に影響しないようにする)。
- **外部素材のライセンス**: CDNやフリー素材を使う場合は CC0 など再配布可能なライセンスを選び、
  素材フォルダに `CREDITS.md` を置く (`apps/keisan-shooter/assets/models/CREDITS.md` 参照)。

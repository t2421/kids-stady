/*
 * kids-stady アプリ一覧レジストリ
 * 新しいアプリを追加したら、ここに1件追加するだけでトップページに表示される。
 * 手順: docs/adding-a-new-app.md 参照。
 */
(function (global) {
  "use strict";

  global.KIDS_APPS = [
    {
      id: "keisan-shooter",
      title: "モンスターけいさんシューター",
      subject: "さんすう（たしざん・ひきざん）",
      description: "ただしいこたえのモンスターをタップしてやっつけよう！コンボでハイスコアをねらえ。",
      emoji: "👾",
      color: "#3aa0ff",
      path: "apps/keisan-shooter/index.html",
    },
  ];
})(window);

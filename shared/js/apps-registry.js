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
    {
      id: "kazu-quest",
      title: "カズクエ",
      subject: "さんすう（小1〜小6）",
      description: "じゅもんを おぼえて まおうを たおす さんすうRPG！けいさんが つよさに なる。",
      emoji: "⚔️",
      color: "#9b59b6",
      path: "apps/kazu-quest/",
    },
    {
      id: "mathematics",
      title: "マスマティクス",
      subject: "さんすう（小1〜小6）",
      description: "けいさんで パワーアップする グラディウス風シューティング！ボスは ひっさつわざで たおせ。",
      emoji: "🚀",
      image: "shared/img/player-base.png",
      color: "#9be7ff",
      path: "apps/mathematics/",
    },
  ];
})(window);

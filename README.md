# きっずスタディ

子供向け学習アプリ集。苦手分野ごとに小さなアプリを追加していく構成。

## 構成

```
kids-stady/
├── index.html                 # トップページ (アプリ一覧)
├── apps/
│   └── keisan-shooter/        # モンスターけいさんシューター (さんすう: たしざん・ひきざん)
│       ├── index.html
│       └── assets/            # このアプリ専用の素材 (3Dモデルなど)
├── shared/
│   ├── css/tokens.css         # 共通デザイントークン & UIシェル (.pill/.overlay/.bigbtn 等)
│   └── js/
│       ├── audio.js           # 共通効果音エンジン
│       └── apps-registry.js   # トップページに表示するアプリ一覧
├── templates/
│   └── new-app/               # 新しいアプリのひな形
└── docs/
    └── adding-a-new-app.md    # アプリの追加手順
```

## 開発方針

- **ビルド不要**: 各アプリは classic `<script>`/`<link>` タグだけで完結する静的HTML。
  npm/バンドラは使わない。
- **file:// でも動く**: ローカルファイルをダブルクリックして開いても動くよう、
  ネットワーク取得(fetch)が必要な素材はJSファイルに文字列として埋め込む。
- **アプリは独立**: ゲームロジックはアプリごとに独立させ、見た目のトークンと効果音エンジンだけを
  `shared/` で共通化する。

新しいアプリを追加する手順は [docs/adding-a-new-app.md](docs/adding-a-new-app.md) を参照。

## 動かし方

`index.html` をブラウザで直接開くか、ローカルサーバーで配信する。

```bash
python3 -m http.server 8080
# → http://localhost:8080/index.html
```

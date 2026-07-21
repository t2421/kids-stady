# きっずスタディ

子供向け学習アプリ集。苦手分野ごとに小さなアプリを追加していく構成。

## 構成

```
kids-stady/
├── index.html                 # トップページ (アプリ一覧)
├── apps/
│   ├── keisan-shooter/        # モンスターけいさんシューター (静的HTML・ビルド不要)
│   │   ├── index.html
│   │   └── assets/            # このアプリ専用の素材 (3Dモデルなど)
│   └── mathematics/           # マスマティクス (Phaser 4 + Next.js・ビルドあり)
│       ├── package.json
│       └── src/
├── shared/
│   ├── css/tokens.css         # 共通デザイントークン & UIシェル (.pill/.overlay/.bigbtn 等)
│   └── js/
│       ├── audio.js           # 共通効果音エンジン
│       ├── profiles.js        # 全アプリ共有のプレイヤープロフィール (docs/save-data.md)
│       └── apps-registry.js   # トップページに表示するアプリ一覧
├── templates/
│   └── new-app/               # 新しいアプリのひな形 (静的HTML型)
├── docs/
│   ├── adding-a-new-app.md    # アプリの追加手順
│   ├── save-data.md           # localStorage セーブデータ契約
│   └── mathematics-design-plan.md
└── .github/workflows/deploy.yml  # GitHub Pages へのビルド&デプロイ
```

## 開発方針

- **アプリごとにビルド方式を選ぶ**:
  - *静的HTML型* (keisan-shooter): classic `<script>`/`<link>` のみ。file:// でも動く。
    fetch が必要な素材はJSファイルに文字列として埋め込む。
  - *ビルド型* (mathematics): Next.js 等を使い、CI (GitHub Actions) で静的書き出しして配信する。
- **アプリは独立**: ゲームロジックはアプリごとに独立させ、デザイントークン・効果音エンジン・
  プレイヤープロフィール ([docs/save-data.md](docs/save-data.md)) だけを `shared/` で共通化する。

新しいアプリを追加する手順は [docs/adding-a-new-app.md](docs/adding-a-new-app.md) を参照。

## 動かし方

静的部分はローカルサーバーで配信する。

```bash
python3 -m http.server 8080
# → http://localhost:8080/index.html
```

マスマティクスの開発は:

```bash
cd apps/mathematics
npm install
npm run dev   # → http://localhost:3010
```

## デプロイ

main へ push すると GitHub Actions がマスマティクスをビルドし、
静的アプリと合成して GitHub Pages に配布する (`.github/workflows/deploy.yml`)。

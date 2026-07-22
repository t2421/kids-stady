# カズクエ 〜数の王国と伝説の勇者〜

DQ3風・算数RPG (Phaser 4 + Next.js + TypeScript)。設計の正典は
[docs/kazu-quest-design-plan.md](../../docs/kazu-quest-design-plan.md)。

```bash
npm run dev        # http://localhost:3011
npm run test       # ユニット + バリデーション (Vitest)
npm run typecheck
npx playwright test  # E2E (本番ビルドで実行)
```

## 並行開発の分担 — ビジュアル班とストーリー班

エンジン (`src/game/`, `src/lib/`) に触れずに、以下の2領域を**独立して並行開発**できる
構造になっている。参照整合性は `npm run test` のバリデーションが機械的に守る
(存在しない art 名・mapId・spellId 等は即失敗する)。

### ビジュアル班: `src/content/art/`

| ファイル | 内容 | テクスチャ名 |
|---|---|---|
| `tiles.ts` | マップタイル (16x16) | `tile-<キー>` |
| `actors.ts` | キャラクター (16x16, 勇者は hero/heroUp/heroSide の3方向) | `actor-<キー>` |
| `monsters.ts` | モンスター (16x16, 戦闘で拡大表示) | `monster-<キー>` |

- 形式: `{ palette: {文字: "#rrggbb"}, rows: string[], scale? }`。`.` は透明。
  行長・パレット網羅・サイズは `tests/art.test.ts` が検証する
- **プレビュー: dev サーバーで [/gallery](http://localhost:3011/gallery)** —
  編集が即時反映。タイルは 3x3 連結でつなぎ目を確認できる
- React 側のアイコン (かぞえ問題など) は `src/components/CountIcons.tsx` (SVG)。
  **デバイス既定の絵文字は使わない** (設計方針)
- 既存キー名は変更しない (マップ・モンスター定義から名前参照されている)。追加は自由

### ストーリー班: `src/content/chapters/`, `spells.ts`, `monsters.ts`, `items.ts`

- 章 = `chapters/chapterN/` (マップ・NPC会話・イベント・エンカウント・ボス)。
  章の追加はデータ追加のみでエンジン変更不要
- マップは文字列グリッド + legend。イベントは `EventCommand` (message/choice/
  setFlag/giveItem/transfer/battle/openShop/healInn/openSpellTest/savePoint/learnSpell)
- 進行状態はセーブの `flags` のみ (`c1.xxx` 章プレフィックス)。呪文習得ゲートは
  `learned.<spellId>` フラグ + NPC の `hideIf`
- 整合性は `tests/content.test.ts` が全数検査 (盤外NPC・通行不能スポーン・
  未定義参照・無言NPC等)

### シーン・戦闘のデバッグ起動 (dev のみ)

| URL | 動作 |
|---|---|
| `/?map=ch1-capital-castle&spawn=start` | タイトルを飛ばして任意マップから開始 |
| `/?battle=eraser` | 開始後すぐ戦闘 (カンマ区切りで複数: `?battle=keshigomun,inkugumo`) |
| `/gallery` | 全スプライトの一覧プレビュー |

ゲーム内デバッグフック (`window.__KAZUQUEST_DEBUG__`): `teleport(x,y,facing)` /
`warp(mapId,spawn)` / `grantLevel(n)` / `learnSpell(id)` / `getSave()` — E2E と
手動デバッグの共通基盤。

## ディレクトリ概観

```
src/
├── app/          # Next.js (page + /gallery)
├── components/   # React UI (問題パネル・習得テスト・カウントアイコン)
├── content/      # ★ データ (art=ビジュアル班 / chapters ほか=ストーリー班)
├── game/         # Phaser (scenes / field / battle / session / textures)
└── lib/          # 純ロジック (curriculum / battle / events / save / encounter)
```

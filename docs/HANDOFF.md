# 引き継ぎ（2026-09-13 深夜の実装分＋同日午後の 2.0 転換）

発注者が就寝中に Phase 0〜4 を実装した。同日午後、発注者の指示で「初学者が学習するためのサイト」へ前提を置き直した（SPEC 2.0）。

## 0. 2.0 で変えたこと

- 「課題から」（scenarios）を廃止。データ・ページ・ナビから削除した
- 分類に `plain`（一言）、`role`（全体像での役割）、`connections`（隣接分野とのつながり）、`startWith` / `startWhy`（最初に触るツール）を追加し、12 分類すべてに初学者向けの解説本文（3〜5 段落）を書いた
- 全体像ページ `/map/` を新設。SVG の図（`src/components/StackMap.astro`）は分類データからリンクと名前を取り、配置だけを固定している
- トップを再構成：導入文 → 全体像の図 → 12 分野（一言＋最初に触るなら）→ ツール全量一覧
- `/tools/` を新設し、52 件を分野別・学習コスト順の表で全量表示
- ナビを「全体像／分野から／ツール一覧／目的から／検索／このサイト」に変更。「能力から」は「目的から」に改称

以下は 1.x 時点の記述で、2.0 でも有効なもの。

## 1. まず動かして見る

```bash
npm install
npm run dev
```

http://localhost:4321 を開く。トップ → 「課題から」→ 任意のシナリオ → 候補ツール → 制約表、の順にたどると 3 クリックで制約に到達できる（SPEC 第12章の到達性）。

## 2. レビューしてほしいこと（優先順）

1. **外観（Phase 2）**：`docs/DESIGN.md` に設計案と「見てほしい点」3 つ。承認前に先行適用している。差し戻しは `src/styles/global.css` の `@layer tokens` を変えるだけで全体に反映される。
2. **「できないこと」の反転ブロック**：詳細ページで最も目立つ要素として黒地白文字にした。強すぎると感じたら、太罫＋余白の案に切り替える（DESIGN.md 7-1）。
3. **エントリの中身**：52 件のうち 49 件は AI 執筆者が公式ドキュメントを取得して書いた。値はすべて取得したページで確認したものだが、**人間が原典を一度は見る**のが SPEC 9.2 の前提。特に料金は変わりやすい。`docs/AUTHORING.md` の規則に沿っているかを、まず自分が詳しいツール 2〜3 件で確かめてほしい。
4. **成熟度（maturity）の判断**：Supabase / Clerk / Ollama を `growing`、他を `stable` にした。これは執筆者の判断で出典はない。
5. **OAuth 2.0 / OIDC のような「プロトコル」の扱い**：制約が数値を持たないため、仕様の条項番号を添える形にした。違和感があれば layer=protocol のエントリだけ書き方を変える。

## 3. 公開までに発注者がやること

リポジトリ https://github.com/nakaya831/toolmap は作成・push 済み。CI も通っている。
公開は GitHub Actions（`.github/workflows/deploy.yml`）から Cloudflare Pages へ直接アップロードする方式。ダッシュボードでの「Git に接続」は不要。

1. Cloudflare ダッシュボード → 右上のプロフィール → **My Profile → API Tokens → Create Token**。テンプレートは使わず Custom token で、権限は **Account / Cloudflare Pages / Edit** の1つだけ。作成後に表示されるトークンを控える
2. Cloudflare ダッシュボード → **Workers & Pages** の画面右側にある **Account ID** を控える
3. GitHub の https://github.com/nakaya831/toolmap/settings/secrets/actions で **New repository secret** を2つ作る
   - `CLOUDFLARE_API_TOKEN` … 1 のトークン
   - `CLOUDFLARE_ACCOUNT_ID` … 2 の ID
4. GitHub の Actions タブ → **Deploy to Cloudflare Pages** → Run workflow。初回はプロジェクト `toolmap` を自動作成してからアップロードする。Summary にデプロイ URL が出る
5. 公開 URL は https://toolmap-frx.pages.dev （`toolmap.pages.dev` は他者のプロジェクトが取得済み）。独自ドメインへ移す場合は `astro.config.mjs` の `SITE` と `public/robots.txt` を直す
6. Actions タブで `Monthly freshness and link check` を手動実行し、Issue が立つことを確認する

トークンは Claude に渡さず、GitHub のシークレット画面に直接貼る。以後は main への push ごとに自動でデプロイされる。

## 4. 確認済みのこと

| 項目 | 結果 |
| --- | --- |
| `npm run build` | 型エラー 0、124 ページ生成、Pagefind 索引化 |
| `node scripts/validate-entries.ts` | 117 件、エラー 0（数値を含まない制約の注意はエラーにしない設計） |
| `npm run check:links` | 到達不能 0。ボット遮断で機械確認できないものが数件（freedesktop.org、hashicorp.com など。ページ自体は存在する）。最新の結果は `reports/links.md` |
| 検索（SPEC 6.5 の 3 条件） | 合格。詳細は SPEC 6.5 の判定結果 |
| モバイル（375px） | 横スクロールなし。制約表は 1 件ずつの積み上げ表示 |
| ダーク／ライト | 両方でトークンを定義。カテゴリ色は明度を変えて再定義 |

## 5. 既知の制限・未着手

- 第 2 優先ツール 10 件（Rust、SvelteKit、MongoDB、Meilisearch、Fly.io、GitLab、Playwright、Cloudflare WAF、Make、Notion）も執筆済み（2026-09-13 朝に追加）。付録 B の 52 件はすべて掲載。
- capability のうち 7 件（build-desktop-app、build-mobile-app、define-infra-as-code、manage-secrets、protect-edge、test-e2e、train-models）は紐づくツールが 2 件未満のため索引に出ない。Expo / Tauri / Pulumi / Vault 等を追加すると解消する。
- GitLab の料金ページは WebFetch がボット遮断（403）で取得できず、`cost.source` は docs.gitlab.com のクォータページで代替している。人間が料金ページを見て差し替えてよい。
- Cloudflare WAF は `can` が protect-edge の 1 件のみで、代替も Workers 1 件のみ。競合 WAF 製品を掲載するまで比較は成立しない。
- OG 画像は SVG の既定 1 枚のみ。ページごとの画像生成は行っていない。
- `docs/SPEC.md` の付録 B・C に書いた「主な can」と、実際のエントリの `can` は執筆中に増減している。正は各エントリ。
- OneDrive 配下で `node_modules` を同期すると重い。OneDrive の設定でこのフォルダを同期対象から外すか、`.gitignore` 済みなので clone し直して別フォルダで作業するほうが安全。

## 6. 日々の運用

- ツール追加：`docs/CONTRIBUTING.md` の 1
- 月次の再確認：Issue が立ったら `docs/CONTRIBUTING.md` の 2
- 検証だけ回す：`node scripts/validate-entries.ts`（ビルド不要、数秒）

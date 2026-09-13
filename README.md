# Toolmap — 課題から手段へ。制約つきで。

プログラミングのツール・言語・サービスを、「できること」「できないこと」「限界値」を同じ物差しで並べた図鑑。使い方は載せず、選定に必要な制約知識と、課題から手段への経路だけを載せる。

- 仕様：[docs/SPEC.md](docs/SPEC.md)
- 執筆手順：[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) / [docs/AUTHORING.md](docs/AUTHORING.md)
- 外観設計：[docs/DESIGN.md](docs/DESIGN.md)

## 開発

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # 型検査 + 静的生成（dist/）+ 検索インデックス
npm run preview
```

## 検査

```bash
node scripts/validate-entries.ts   # 全エントリのスキーマ・参照検証（ビルド不要）
npm run check:links                # 出典 URL の死活
npm run check:freshness            # 検証日の経過日数
```

## 構成

```
src/
  content.config.ts   スキーマ（Zod）。緩めない項目は SPEC 4.4
  config.ts           鮮度閾値・表示ラベル
  data/               コンテンツ本体（Markdown frontmatter）
    categories/ capabilities/ tools/ scenarios/
  components/ layouts/ pages/ styles/
scripts/              検証スクリプト（Node 22+ で直接実行）
.github/workflows/    CI（push/PR）と月次検査（Issue 自動起票）
```

## 公開

Cloudflare Pages。main への push で `.github/workflows/deploy.yml` がビルドし、プロジェクト `toolmap` へ直接アップロードする（シークレット `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` が必要。手順は docs/HANDOFF.md の 3）。独自ドメインへ移す際は `astro.config.mjs` の `SITE`（または環境変数 `SITE_URL`）と `public/robots.txt` の Sitemap 行を変える。

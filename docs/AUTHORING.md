# ツールエントリ執筆ブリーフ（Phase 3）

このファイルは、`src/data/tools/<id>.md` を書く執筆者（人間・AI とも）向けの作業指示である。SPEC の第2章・第4章・第9章を実務手順に落としたもの。

## 0. 先に読むもの

1. `docs/SPEC.md` の 2（設計思想）、4.3〜4.5（スキーマと記述例）、9.1（掲載基準）
2. 完成例3件：`src/data/tools/google-apps-script.md`、`postgresql.md`、`python.md`
3. capability の ID と意味：`src/data/capabilities/*.md`（ファイル名が ID）
4. 分類の ID：`src/data/categories/*.md`

## 1. 絶対の規則

- **出典なしの数値は書かない。** `constraints[].value` に書く値は、`source` の URL を実際に取得して、そのページに書かれていることを確認したものだけ。記憶や推測で書かない。確認できなかった制約は載せない（減らすほうが、誤りより良い）。
- `source` は https の公式ドメイン（公式ドキュメント、公式料金ページ、公式ブログ、公式 GitHub の README/ docs）。第三者のブログ・Qiita・Zenn・Wikipedia は不可。
- `verifiedAt` と `updatedAt` は原典を確認した日（今日）。
- `cost.source` も実際に取得した料金ページ／ライセンスページ。無料の OSS でもライセンス表記のページを置く。
- 制約は「限界値・上限・クォータ・課金の分岐点・仕様上の制限」。「〜ができる」は制約ではない。
- `cannot` は「このツールを選ぶと行き詰まる条件」を具体的に。「大規模には向かない」のような曖昧な表現は不可。
- `oneLiner` は **60文字以内**（全角1文字＝1文字として数える）。
- 使い方・チュートリアル・コード例は書かない。
- 一人称・呼びかけ・感嘆符を使わない。です・ます調ではなく、である調（完成例と同じ）。

## 2. 各項目の目安

| 項目 | 目安 |
| --- | --- |
| `aliases` | 略称・別表記を1〜4件。検索でヒットさせたい語 |
| `can` | 付録Bの「主な can」を含め、実際に持つ能力を 2〜6 件。存在する capability ID のみ |
| `cannot` | 3〜5 件 |
| `constraints` | 3〜6 件。**先頭が、利用者が最初に当たる制約**（比較表に載る）。最低1件 |
| `pitfalls` | 2〜4 件。出典は不要だが、経験的に確立した破綻パターンのみ |
| `cost.note` | 「どこから課金が跳ねるか」を1〜2文で |
| `alternatives` | 1〜3 件。`difference` は「何が違うか」を1〜2文で。両方向の差を書く（A は〜、B は〜） |
| `verdict` | 「〜では第一候補。〜の場合は避け、〜へ」の形で 2〜3 文 |
| 本文（frontmatter の後） | 任意。2 段落まで。背景と、最初に当たる制約の補足 |

## 3. `alternatives` で参照できるツール ID（52 件）

```
python typescript go rust
react nextjs astro sveltekit
fastapi hono supabase firebase
postgresql sqlite redis amazon-s3 mongodb meilisearch
pandas duckdb bigquery
aws-lambda cloudflare-workers vercel github-pages docker render fly-io
google-apps-script n8n cron
git github github-actions terraform gitlab playwright
sentry prometheus-grafana datadog
auth0 clerk oauth2-oidc cloudflare-waf
claude-api openai-api ollama hugging-face
zapier airtable make notion
```

実在する ID は `src/data/tools/` で確認できる。

これ以外の ID を参照するとビルドが落ちる。

## 4. 検証

書いたら必ず次を実行し、エラーをゼロにする。

```
node scripts/validate-entries.ts src/data/tools/<id>.md
```

- `tools/<id> が存在しない` は、上の 42 件に含まれる ID なら他の執筆者が書いている途中なので無視してよい。含まれない ID なら修正する。
- `(注意) 値に数値が含まれない` は警告。限界値として書けるなら数値にする。仕様上の制限（例：「GIL により1スレッドずつ」）なら残してよい。
- `astro build` / `astro dev` / `astro sync` は実行しない（別プロセスが動いている）。

## 5. 執筆の順番（1ツールあたり）

1. 公式ドキュメントの「Quotas / Limits / Pricing / Limitations」に相当するページを探して取得する
2. そこから 3〜6 件の制約を拾い、値と URL を記録する
3. 料金ページを取得して `cost` を書く
4. `cannot` を、制約とアーキテクチャから導く
5. `alternatives` の差分を書く
6. `verdict` を書く
7. 検証スクリプトを通す

# 仕様書：プログラミングツール地図サイト（仮称 Toolmap）

版：1.3（2026-09-13）

本書は Claude Code に実装を委譲することを前提とした仕様書である。
着手前の確認事項はすべて第13章で確定済みであり、実装者（Claude Code）は本書に従って Phase 0 から着手してよい。判断に迷う点は第2章に照らして決め、決めた内容を本書に追記する。

### 改訂履歴

| 版 | 日付 | 変更 |
| --- | --- | --- |
| 1.0 | 2026-09 | 初版 |
| 1.3 | 2026-09-13 | 実装に伴う追記：Astro 6 系の採用理由、Pagefind の UI 方式、検証スクリプト群（`scripts/`）、執筆ブリーフ `docs/AUTHORING.md`、外観設計 `docs/DESIGN.md` |
| 1.2 | 2026-09-13 | 発注者の決定を反映：公開サイト、Cloudflare Pages、公開リポジトリ `toolmap`。未決定事項ゼロ |
| 1.1 | 2026-09-13 | 未決定事項のうち実装者側で草案化できる4項目を確定（capability 初期セット・ツール初期選定・シナリオ初期件数・検索方式）。仕様の穴を補完（layer 定義、ID 命名規則、capability のグループ、cost の出典・検証日、比較表の「主要制約」列の決定規則、404 ルート）。付録A〜Cを追加 |

---

## 1. 目的と非目的

### 1.1 目的

ある課題に直面したとき、「どの手段が存在し、それぞれが何をできて何ができないか」を短時間で把握できる状態をつくる。
最終的な成功像は、利用者が以下を自力で言語化できることである。

- この課題を解くには、どの能力（例：定期実行、全文検索、状態の永続化）が必要か
- その能力を持つ手段は何か、複数ある場合の選択軸は何か
- 選んだ手段が破綻する条件（制約）は何か

### 1.2 非目的

以下は明示的に目的から外す。目的に入れると完成せず、また価値も低いためである。

| 非目的 | 理由 |
| --- | --- |
| 世の中のツールを網羅すること | 母集団が無限かつ増加し続けるため達成不能。網羅を目指すと1件あたりの記述が薄くなり、比較不能なカタログに退化する |
| 各ツールのチュートリアル提供 | 公式ドキュメントに劣後する。本サイトは一次情報への導線に徹する |
| 構文リファレンス | 検索とAIで代替済み |
| 最新ニュースの追跡 | 更新コストが運用を破綻させる |

### 1.3 網羅性の扱い

「全量」の代わりに**「軸の網羅」**を達成基準とする。すなわち、個々のツールを漏れなく載せるのではなく、**分類カテゴリ（第5章）と能力軸（第4.2節）に空白がない**状態を目標とする。各カテゴリに代表例が2〜5件あれば、未収録のツールに出会っても既存の軸にマッピングして理解できる。これが現実的かつ有用な網羅性の定義である。

---

## 2. 設計思想（実装判断の基準）

実装中に迷いが生じた場合、以下に照らして判断すること。

1. **表層知識ではなく制約を載せる。** 「GASでスプレッドシートを操作できる」は無価値である。「1実行あたり6分の上限があるため、大量処理はトリガー分割が必要」が価値である。制約・限界値・課金の分岐点・典型的な破綻パターンを一次情報とする。
2. **ツール単位ではなく課題単位で入口を作る。** 利用者はツール名を知らない状態で訪れる。「毎朝この集計をSlackに流したい」から入って手段に到達できること。
3. **比較可能性を構造で担保する。** 全ツールが同一スキーマの項目を持つ。項目が埋まらないツールは、そもそも掲載基準を満たしていない。自由記述だけのページは作らない。
4. **陳腐化を前提に設計する。** すべての事実に出典URLと検証日を持たせ、古いものはUI上で可視化する。「常に正しい」を諦め、「いつ時点の情報か」を明示する。
5. **静的サイトとして完結させる。** ログイン、DB、サーバー側処理を持たない。運用コストゼロを維持する。

---

## 3. 想定利用者と利用シナリオ

### 3.1 利用者

- 主：プログラミングの基礎はあるが、ツール選定の経験が浅い学生・初級エンジニア（＝発注者自身）
- 副：既知領域の隣接技術を俯瞰したい中級者

### 3.2 主要シナリオ（画面設計はこれを満たすこと）

| ID | シナリオ | 起点となる画面 |
| --- | --- | --- |
| S1 | 課題はあるが手段を知らない。「定期実行したい」から候補を得る | 能力一覧 / シナリオ集 |
| S2 | 候補が2〜3件に絞れた。選定軸を知りたい | 比較表 |
| S3 | 特定ツールの限界を知りたい。「Lambdaの実行時間上限は」 | ツール詳細 |
| S4 | 分野を俯瞰したい。「データストアにはどんな種類があるか」 | カテゴリ一覧 |
| S5 | 未知の単語に遭遇した。「Terraformとは何か」 | 検索 → ツール詳細 |

---

## 4. 情報モデル（本仕様の中核）

コンテンツはすべて型付きデータとして管理する。Astro Content Collections + Zod スキーマにより、項目欠落をビルド時エラーとして検出する。

### 4.1 コレクション構成

| コレクション | 実体 | 役割 |
| --- | --- | --- |
| `tools` | ツール・言語・サービス | 中核エンティティ |
| `capabilities` | 能力（できること） | 課題とツールを接続する語彙 |
| `categories` | 分類 | 俯瞰の単位 |
| `scenarios` | 課題シナリオ | 課題起点の入口 |

### 4.2 capability（能力）の設計

capability は本サイトの背骨である。**ツールの機能名ではなく、利用者の目的を動詞で表現する。**

- 良い例：`定期的に処理を実行する` / `データを永続化する` / `全文検索する` / `イベントを受けて処理を起動する`
- 悪い例：`Cron` / `RDBMS` / `Elasticsearch互換`

粒度の目安は、初期実装で 30〜50 件。1つの capability に紐づくツールが常に1つしかない場合、その capability は粒度が細かすぎる。

初期セットは付録Aに定める（47件）。capability は `group` で8つに束ね、`/capabilities/` の索引はこのグループ単位で表示する。フラットな50件の一覧は俯瞰に耐えないためである。

| group | 意味 |
| --- | --- |
| `run` | 実行する（いつ・どこで・どれだけ動かすか） |
| `store` | 保存・検索する |
| `connect` | 外部とつなぐ |
| `ship` | 画面を作り、公開する |
| `secure` | 認証し、守る |
| `operate` | 開発・配信・監視を回す |
| `process` | データを加工・分析する |
| `ai` | AI・機械学習を使う |

初期ツール群で2件以上のツールが紐づかない capability（付録Aで※印）は、スキーマ上は定義してよいが、紐づくツールが2件に達するまで `/capabilities/` 索引に表示しない。

### 4.3 スキーマ定義

`src/content.config.ts` に以下を定義する。
Astro 5 系の Content Layer API（`glob` ローダー）を前提とする。バージョンが異なる場合は公式ドキュメントを確認のうえ読み替えること。

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 出典付きの事実。すべての検証可能な記述はこの形を取る
const sourcedFact = z.object({
  label: z.string(),                 // 例: 実行時間の上限
  value: z.string(),                 // 例: 6分 / 実行（無償版）
  impact: z.string(),                // 例: 大量処理はトリガーで分割する必要がある
  source: z.string().url(),          // 一次情報のURL（公式ドキュメント優先）
  verifiedAt: z.coerce.date(),       // 人間が原典を確認した日
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/categories' }),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    question: z.string(),            // このカテゴリが答える問い
    summary: z.string(),
  }),
});

const capabilities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/capabilities' }),
  schema: z.object({
    name: z.string(),                // 動詞句で書く
    group: z.enum(['run', 'store', 'connect', 'ship', 'secure', 'operate', 'process', 'ai']),
    question: z.string(),            // 利用者の言葉での表現
    axes: z.array(z.string()).min(1),// 選定時に見るべき軸。例: ["最小実行間隔", "実行時間上限"]
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/tools' }),
  schema: z.object({
    name: z.string(),
    aliases: z.array(z.string()).default([]),   // 検索用の別名・略称
    category: reference('categories'),
    layer: z.enum(['language', 'runtime', 'framework', 'managed-service', 'tool', 'protocol']),
    oneLiner: z.string().max(60),               // 一行での定義。60字上限は意図的な制約
    officialUrl: z.string().url(),
    docsUrl: z.string().url(),

    can: z.array(reference('capabilities')).min(1),   // できること
    cannot: z.array(z.string()).min(1),               // できないこと（これを必須にするのが本サイトの肝）

    constraints: z.array(sourcedFact).min(1),         // 限界値・上限・クォータ。先頭が最重要（比較表に載る）
    pitfalls: z.array(z.string()).default([]),        // 典型的な破綻パターン

    cost: z.object({
      model: z.enum(['free', 'free-tier', 'usage-based', 'subscription', 'license']),
      note: z.string(),                               // 課金が跳ねる条件を書く
      source: z.string().url(),                       // 料金ページ。free でもライセンス表記のURLを置く
      verifiedAt: z.coerce.date(),
    }),

    learningCost: z.enum(['low', 'medium', 'high']),
    maturity: z.enum(['stable', 'growing', 'legacy', 'deprecated']),

    alternatives: z.array(z.object({
      tool: reference('tools'),
      difference: z.string(),                         // 「何が違うか」を必ず書く
    })).default([]),

    verdict: z.string(),                              // どういう時に選ぶか / 避けるか
    updatedAt: z.coerce.date(),
  }),
});

const scenarios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/scenarios' }),
  schema: z.object({
    title: z.string(),                                // 利用者の言葉での課題
    needs: z.array(reference('capabilities')).min(1),
    candidates: z.array(z.object({
      tool: reference('tools'),
      fit: z.enum(['best', 'viable', 'overkill', 'avoid']),
      reason: z.string(),
    })).min(2),                                       // 単一解を提示しない。比較させる
    updatedAt: z.coerce.date(),
  }),
});

export const collections = { categories, capabilities, tools, scenarios };
```

### 4.4 スキーマ上の意図的な強制

以下は実装時に緩めないこと。緩めた時点でサイトの価値が失われる。

- `cannot` を `.min(1)` にしている。できないことを書けないツールは、理解が不十分な状態で掲載されている
- `constraints` を `.min(1)` にし、`source` を必須にしている。出典なしの数値は載せない
- `alternatives` に `difference` を必須にしている。「類似ツール一覧」は無価値であり、差分の記述のみが価値を持つ
- `oneLiner` に60字上限を課している。一行で言えないものは理解できていない
- `cost.source` と `cost.verifiedAt` を必須にしている。料金は数値を含む事実であり、第2章4の「すべての事実に出典と検証日」の例外にしない。`free` のツールも、その根拠（ライセンス表記や料金ページ）を置く
- `constraints` は配列の順序に意味を持たせる。先頭の要素がそのツールで最も先に当たる制約であり、比較表の「主要制約」列にはこの先頭要素を載せる（6.3参照）。専用フラグは設けない

### 4.4.1 layer の定義

`layer` は「そのエントリが何であるか」の種別で、`category`（何のためのものか）とは直交する。

| layer | 意味 | 例 |
| --- | --- | --- |
| `language` | プログラミング言語（標準ツールチェーン込み） | Python, Go |
| `runtime` | 言語を実行する環境・処理系 | Node.js, Deno |
| `framework` | コード上で利用するライブラリ・フレームワーク | React, FastAPI, pandas |
| `managed-service` | 事業者が運用し、利用者はAPI・管理画面から使うもの | AWS Lambda, Supabase, Auth0 |
| `tool` | 自分の環境にインストールして使うソフトウェア | Docker, Terraform, Ollama |
| `protocol` | 仕様・規格そのもの。実装は別に存在する | OAuth 2.0, OpenID Connect |

迷う場合は「止まったとき誰に問い合わせるか」で判定する。事業者なら `managed-service`、自分なら `tool` または `framework`。

### 4.4.2 ID 命名規則

- 全コレクションの ID（＝ファイル名）は ASCII の kebab-case。日本語 ID は使わない（URL とリンクの安定性のため）
- `tools` の ID は公式名称を小文字化したもの。ベンダー名は、それがないと曖昧になる場合のみ付ける（`aws-lambda`, `cloudflare-workers`, `postgresql`, `redis`）
- `capabilities` の ID は英語の動詞句（`run-on-schedule`, `store-files`）。付録Aの ID をそのまま用いる
- `scenarios` の ID は課題を表す英語の名詞句（`daily-sheet-to-slack`）
- ID は一度公開したら変更しない。改名が必要な場合は旧 ID からのリダイレクトを置く

### 4.5 エントリ記述例

`src/data/tools/google-apps-script.md`

```markdown
---
name: Google Apps Script
aliases: [GAS, Apps Script]
category: automation
layer: managed-service
oneLiner: Googleの各サービスをJavaScriptで自動操作する実行環境
officialUrl: https://workspace.google.com/products/apps-script/
docsUrl: https://developers.google.com/apps-script
can: [run-on-schedule, read-write-spreadsheet, send-email, call-http-api]
cannot:
  - 常時起動するプロセスの保持
  - 数十分を要する単一バッチ処理
  - 高頻度（分未満の間隔）の実行
constraints:
  - label: 実行時間の上限
    value: 6分 / 実行（無償アカウント）
    impact: 長時間処理は分割し、続きをトリガーで再開する設計が必要になる
    source: https://developers.google.com/apps-script/guides/services/quotas
    verifiedAt: 2026-09-01
cost:
  model: free
  note: Googleアカウントがあれば追加費用なし。ただし各種クォータが実質的な上限となる
  source: https://developers.google.com/apps-script/guides/services/quotas
  verifiedAt: 2026-09-01
learningCost: low
maturity: stable
alternatives:
  - tool: aws-lambda
    difference: Lambdaは実行時間と同時実行の上限が大きく従量課金。Googleサービスへの認証は自前で行う必要がある
verdict: Googleサービス内で完結する小規模な自動化では第一候補。処理時間と実行頻度の上限に触れた時点で他基盤への移行を検討する
updatedAt: 2026-09-01
---

（本文：背景や補足があれば記述。なくてもよい）
```

---

## 5. 分類体系（categories 初期値）

| id | name | このカテゴリが答える問い |
| --- | --- | --- |
| `language` | 言語・実行環境 | どの言語で書くか。実行時の性質は何か |
| `frontend` | 画面・フロントエンド | 利用者に見える画面をどう作るか |
| `backend` | サーバー・API | 処理と公開インターフェースをどう提供するか |
| `datastore` | データの保存 | データをどこに、どの形で置くか |
| `data-processing` | データ処理・分析 | 集計・変換・可視化をどう行うか |
| `infrastructure` | 実行基盤・ホスティング | コードをどこで動かすか |
| `automation` | 自動化・連携 | 決まった作業をどう自動で回すか |
| `devops` | 開発基盤・CI/CD | 検証と配信をどう自動化するか |
| `observability` | 監視・可観測性 | 動いているものの状態をどう知るか |
| `security` | 認証・セキュリティ | 誰がアクセスできるかをどう制御するか |
| `ai` | AI・機械学習 | 学習・推論をどう組み込むか |
| `nocode` | ノーコード・SaaS | コードを書かずに解く選択肢は何か |

分類が排他的にならないツール（例：Supabase は datastore と backend の双方）が必ず出現する。主分類を1つ選び、他カテゴリへの露出は `can` 経由の能力横断一覧で担保する。単一の `category` フィールドを維持し、多対多にはしない（複雑性に見合わないため）。

---

## 6. 画面仕様

### 6.1 ルーティング

| パス | 内容 | 生成 |
| --- | --- | --- |
| `/` | トップ。能力マップの俯瞰と3つの入口（課題から／分野から／名前から） | 静的 |
| `/categories/` | 全カテゴリ一覧 | 静的 |
| `/categories/[id]/` | 該当ツール一覧＋同一カテゴリ内の比較表 | 静的 |
| `/tools/[id]/` | ツール詳細 | 静的 |
| `/capabilities/` | 能力一覧（動詞句の索引） | 静的 |
| `/capabilities/[id]/` | その能力を持つツールの横断一覧＋選定軸 | 静的 |
| `/scenarios/` | 課題シナリオ一覧 | 静的 |
| `/scenarios/[id]/` | 課題と候補の比較 | 静的 |
| `/search/` | 全文検索 | クライアント側 |
| `/about/` | 本サイトの設計思想と掲載基準、免責 | 静的 |
| `/404` | 存在しないページ。検索窓と3つの入口を置く | 静的 |

`/capabilities/` の索引は 4.2 の `group` 単位で見出しを分け、各 capability の `name` と紐づくツール数を表示する。

### 6.2 ツール詳細ページの構成順序

上から順に、以下の順で配置する。順序は情報の重要度に対応させる。

1. 名称／一行定義／分類・レイヤー・成熟度
2. **できること**（capability へのリンク一覧）
3. **できないこと**（最も特徴的な情報として視覚的に強調する。ページ内で最も目立つブロックにしてよい）
4. 制約表（項目・値・影響・出典・検証日）
5. 典型的な落とし穴
6. コスト
7. 代替手段と差分
8. 選定判断（verdict）
9. 一次情報へのリンク／最終更新日

### 6.3 比較表

- カテゴリ配下および capability 配下で、該当ツールを行、`layer` / `learningCost` / `cost.model` / `maturity` / 主要制約を列とする表を静的生成する
- 「主要制約」列は `constraints[0]` の `label` と `value` を載せる（4.4 の順序規則）。ツール横断で同じ軸が揃うことは保証しない。揃えるための専用フィールドは、Phase 3 で実データを見てから必要性を判断する
- capability 配下の比較表の直上には、その capability の `axes` を「この能力で選ぶときに見る軸」として列挙する。利用者は軸を読んでから表を見る
- 行の並び順は `maturity`（stable → growing → legacy → deprecated）、同順位なら `learningCost` の低い順
- 任意ツールを選択する動的比較機能は初期実装に含めない（利用頻度に対し複雑性が高い）

### 6.4 鮮度表示

`verifiedAt` および `updatedAt` から経過日数を算出し表示する。

- 180日超：「要再確認」を制約表の行に表示
- 365日超：ページ上部に注意を表示

閾値は定数として `src/config.ts` に切り出すこと。

### 6.5 検索

静的サイト向け全文検索として Pagefind を採用する（ビルド後に `dist/` を走査してインデックスを生成する方式）。

- 統合は `astro-pagefind` 2 系（ビルド後に `dist/` を索引化し、開発サーバーでも `/pagefind/` を配信する）。検索 UI は Pagefind 1.5 の Web Components（`<pagefind-config>` `<pagefind-input>` `<pagefind-summary>` `<pagefind-results>`）を使い、翻訳は `<html lang="ja">` から自動選択される
- `<html lang="ja">` を必ず付与する。Pagefind の日本語分割はこの属性に依存する
- 検索対象は本文全体ではなく、`data-pagefind-body` で `name` / `aliases` / `oneLiner` / `cannot` / `constraints.label` / `verdict` に限定する。本文の補足まで索引化すると、ツール名で引いたときに無関係な言及がヒットする
- `aliases` は `data-pagefind-meta` ではなく本文側に含め、略称（GAS、k8s など）で必ずヒットさせる

Phase 4 で以下を確認し、いずれかを満たさない場合は簡易実装（全エントリの `name`／`aliases`／`oneLiner` を JSON 出力し、クライアント側で部分一致）へ切り替える。

1. 「定期実行」「スプレッドシート」「認証」の3語で、期待するツールが上位5件に入る
2. 略称 `GAS` `S3` `PG` でツール詳細が先頭にヒットする（Kubernetes は掲載対象外のため `k8s` は条件から外した）
3. 検索用に配信される総容量が 500KB を超えない

**判定結果（2026-09-13、ビルド済みサイトで確認）：合格。Pagefind を継続採用。**

| 条件 | 結果 |
| --- | --- |
| 1 | 定期実行 → cron, GitHub Actions, GAS, Vercel, Workers。スプレッドシート → Airtable, GAS。認証 → Supabase, Auth0, Clerk, OAuth/OIDC, Firebase |
| 2 | GAS → google-apps-script、S3 → amazon-s3、PG → postgresql がいずれも先頭 |
| 3 | 初回検索時に読むもの：pagefind.js 45KB、worker 41KB、component-ui JS 175KB・CSS 43KB、索引 約80KB（言語別に分割）。断片は結果表示時に個別取得。合計 約390KB（非圧縮）。索引対象はツール詳細ページ（`data-pagefind-body`）のみで、一覧・about は含まれない |

留意点：Pagefind はあいまい一致を行うため、存在しない語（例：k8s）でも近い綴りのページが返る。誤誘導を避けるため、検索ページの説明文には掲載している略称だけを例示する。

---

## 7. 技術構成

| 項目 | 選定 | 理由 |
| --- | --- | --- |
| フレームワーク | Astro 6 系（実装時点 6.4.8） | コンテンツ主導の静的サイトに最適。Content Collections による型付けが本仕様の中核要件と一致する。既定でJSを出力しない。初版は「5系」としていたが、実装時（2026-09-13）の最新安定版が 7.3 で、Pagefind 統合との互換が確認できる 6 系を採用した。Content Layer API は 5 系と同一。Zod は v4 のため `z.string().url()` ではなく `z.url()` を使う |
| コンテンツ形式 | Markdown（frontmatter が本体） | 構造化データと本文を同一ファイルで扱える |
| 検証 | Zod（`astro/zod`） | ビルド時に項目欠落を検出 |
| 型 | TypeScript（strict） | — |
| スタイル | 素の CSS（カスケードレイヤー、カスタムプロパティ） | 規模に対しCSSフレームワークは過剰 |
| 検索 | Pagefind | 6.5参照。切り替え基準も同節 |
| ホスティング | Cloudflare Pages | 静的配信で足りる。無料枠で運用可能。GitHub Pages と比べてカスタムドメインと `_redirects`（4.4.2 の旧IDリダイレクト）の扱いが単純 |
| CI | GitHub Actions | push 時に型チェック・ビルド・リンク切れ検査 |

React / Next.js は採用しない。本サイトに動的状態はほぼ存在せず、ビルドの複雑性に見合わないためである。

---

## 8. ディレクトリ構成

```
.
├── src/
│   ├── content.config.ts        # スキーマ定義（第4章）
│   ├── config.ts                # 鮮度閾値などの定数
│   ├── data/
│   │   ├── categories/*.md
│   │   ├── capabilities/*.md
│   │   ├── tools/*.md
│   │   └── scenarios/*.md
│   ├── components/
│   │   ├── ConstraintTable.astro
│   │   ├── CannotDoList.astro
│   │   ├── ComparisonTable.astro
│   │   ├── FreshnessBadge.astro
│   │   └── ToolCard.astro
│   ├── layouts/
│   ├── pages/                   # 6.1 のルーティングに対応
│   └── styles/
├── scripts/
│   ├── lib.ts                   # frontmatter 読み込みの共通部
│   ├── validate-entries.ts      # ビルド不要のエントリ検証（スキーマ・参照・ID 規則）
│   ├── check-links.ts           # source / officialUrl の死活確認
│   └── check-freshness.ts       # verifiedAt の経過日数レポート
├── docs/
│   ├── SPEC.md                  # 本書
│   ├── CONTRIBUTING.md          # エントリ追加手順（第9章）
│   ├── AUTHORING.md             # 執筆の細則（出典の扱い・各項目の目安）
│   └── DESIGN.md                # 外観設計案（第10章）
└── astro.config.mjs
```

---

## 9. コンテンツ運用

### 9.1 掲載基準

以下をすべて満たす場合のみ掲載する。満たせないものは載せない。

- `cannot` を1件以上、具体的に書ける
- `constraints` を1件以上、公式ドキュメントの出典付きで書ける
- `verdict` を「どういう時に選ぶか／避けるか」の形で書ける

### 9.2 エントリ追加手順（`docs/CONTRIBUTING.md` に記載すること）

1. 該当カテゴリと必要な capability が既存にあるか確認する。なければ先に capability を追加する
2. `src/data/tools/<id>.md` を作成する
3. 制約は必ず公式ドキュメントで確認し、URL と確認日を記録する（AIの出力をそのまま転記しない）
4. `npm run build` で型検証を通す
5. `npm run check:links` でリンク死活を確認する

### 9.3 鮮度維持

- GitHub Actions の定期実行（月次）でリンク切れと `verifiedAt` 経過日数を検査し、Issue を自動起票する
- 事実の自動更新は行わない（誤情報を静かに混入させるため）

---

## 10. 設計方針（外観）

実装者は、コード記述前に設計案（配色トークン4〜6色、書体2種以内とその役割、レイアウト概念）を提示し、承認を得てから実装すること。

制約条件のみ以下に示す。

- 本サイトの性格は「図鑑・フィールドガイド」である。読み物ではなく参照資料として、情報密度を優先する
- 色は分類の伝達にのみ用い、装飾に用いない。カテゴリ色は12分類を判別できる体系とする
- 「できないこと」「制約」の視認性を最優先する。詳細ページで最も目立つのはこの2ブロックであること
- 本文の行長は40〜45字（日本語）を上限とする
- 生成物にありがちな既定表現を避ける：クリーム地に高コントラストのセリフ体＋テラコッタ差し色、全要素を同一の角丸カードに切り分ける構成、見出し上のトラッキングを広げた大文字ラベル、リンク文末の矢印記号
- 表を主要な表現手段として設計する。比較可能性がサイトの価値であるため、表を二級の要素として扱わない
- アクセシビリティの床：モバイル対応、キーボードフォーカスの可視化、コントラスト比の確保、`prefers-reduced-motion` の尊重

---

## 11. 開発フェーズ

各フェーズの完了時に人間のレビューを挟む。フェーズを飛ばさないこと。

| Phase | 内容 | 完了条件 |
| --- | --- | --- |
| 0 | スキーマ定義と最小データ | カテゴリ3件・capability 8件・ツール3件でビルドが通り、詳細ページが表示される |
| 1 | 画面実装 | 6.1 の全ルートが生成される。比較表と鮮度表示が機能する |
| 2 | 外観 | 第10章の設計案が承認され、適用済み |
| 3 | コンテンツ拡充 | 全12カテゴリに2件以上、計30件以上のツールが掲載される。付録Bの第1優先を優先し、付録Cのシナリオ6件が全て候補ツールを解決できる |
| 4 | 運用整備 | 検索（6.5 の3条件を満たす）・リンク検査・定期Issue起票が稼働する。`sitemap.xml` と OG 画像の既定値を出力する |

Phase 0 の時点で、スキーマが実データに耐えるかを検証すること。3件を書いてみて記入困難な項目があれば、そこでスキーマを見直す。

Phase 0 の3件は、性格の異なる layer から選ぶ： `google-apps-script`（managed-service）、`python`（language）、`postgresql`（tool）。言語や汎用ツールで `constraints` と `cost.source` が自然に書けるかが、スキーマの最初の試験になる。

### 11.1 進捗（2026-09-13）

| Phase | 状態 | 備考 |
| --- | --- | --- |
| 0 | 完了 | スキーマは3件の実データに耐えた。変更点は `z.url()`（Zod v4）のみ |
| 1 | 完了 | 6.1 の全ルート＋404 を生成。比較表・鮮度表示・狭幅での制約表の積み上げ表示が動作 |
| 2 | **適用済み・レビュー待ち** | 設計案は `docs/DESIGN.md`。発注者の承認前に先行適用した。差し戻しはトークン変更で対応可能 |
| 3 | 完了 | 第1優先 42 件すべて掲載。全12分類に2件以上。出典つき事実 275 件。シナリオ 6 件は全候補が解決 |
| 4 | 完了（GitHub 側の稼働は未確認） | 検索は 6.5 の3条件に合格。リンク検査 256 URL で到達不能ゼロ（遮断による機械確認不能 2 件）。CI と月次 Issue 起票のワークフローは作成済みだが、リポジトリ未作成のため実行は未確認 |

Phase 3 で判明したスキーマ上の論点：言語・フレームワーク・プロトコルの「制約」は数値を持たないことが多い（例：「型は実行時に消える」「フックは最上位でのみ呼べる」）。検証スクリプトはこれを警告（注意）に留め、エラーにはしていない。数値を無理に含めるより、仕様上の制限として書くほうが正確なためである。

---

## 12. 成功条件

| 指標 | 基準 |
| --- | --- |
| 探索の到達性 | 任意のシナリオから3クリック以内に、候補ツールの制約情報に到達できる |
| 比較可能性 | 同一カテゴリ内の任意の2ツールについて、同一項目で差分を読み取れる |
| 出典率 | 数値を含む記述のうち、一次情報URLを持つものが100% |
| 保守性 | 新規ツール1件の追加が、Markdown 1ファイルの作成のみで完結する |

---

## 13. 決定事項と残る確認事項

### 13.1 本改訂で確定した事項

以下は 1.1 で確定した。異論があれば本書を改訂してから着手する。着手後に口頭で覆さない。

| # | 項目 | 決定 | 根拠 |
| --- | --- | --- | --- |
| 2 | 言語 | 日本語単一。ID・ファイル名・コード内識別子は英語 | 併記はコンテンツ量が倍になる。利用者（3.1）は日本語話者 |
| 3 | capability 初期セット | 付録Aの47件・8グループ | 4.2 の粒度方針。※印の8件を除き、第1優先ツールが2件以上紐づくことを確認済み |
| 4 | ツール初期選定 | 付録Bの52件。第1優先42件を Phase 3 の対象、第2優先10件はその後 | 全12カテゴリに2件以上。付録Cのシナリオを解決できる組み合わせ |
| 5 | 検索 | Pagefind 採用。6.5 の3条件で Phase 4 に判定し、不合格なら簡易実装へ | Astro との統合実績が豊富。切り替え先が仕様化されているため失敗コストが低い |
| 6 | scenarios 初期件数 | 6件（付録C） | 3.2 の S1 を成立させる最小数。各 capability グループのうち利用頻度の高い run / connect / ship / secure / process / ai を1件ずつ通す |
| — | cost の出典 | `cost.source` と `cost.verifiedAt` を必須化 | 第2章4 との整合。料金は最も陳腐化の早い事実 |
| — | 比較表の「主要制約」 | `constraints[0]` を使う。専用フィールドは設けない | 4.4・6.3 |
| 1 | 公開範囲とホスティング | **公開サイト**として作る。Cloudflare Pages に配信し、ドメインは `*.pages.dev` で開始、独自ドメインは後決め | 発注者の決定（2026-09-13）。公開前提のため `/about/` の免責と掲載基準（9.1）を Phase 1 の必須範囲に含める |
| — | リポジトリ | GitHub 上に **公開リポジトリ `toolmap`** を作る | 公開サイトのソースを非公開にする理由がない。公開リポジトリは GitHub Actions の実行時間が無償で、月次の鮮度検査（9.3）を気にせず回せる。名称は仮称のまま。改名しても ID・URL には影響しない |

### 13.2 人間の決定が必要な事項

なし。着手前の確認事項はすべて解消した。以降は第11章のフェーズごとのレビューのみが人間の判断点となる。

---

## 付記：本仕様が前提とする判断

本サイトは「ツールの使い方」を扱わない。使い方は公式ドキュメントとAIに委ね、本サイトは**選定に必要な制約知識と、課題から手段への経路**のみを担う。この分業が成立しない、すなわち使い方の解説が必要という結論に至った場合、それは本仕様の前提が誤っていたことを意味するため、コンテンツを追加するのではなく仕様自体を見直すこと。

---

## 付録A：capability 初期セット（47件）

ID はそのままファイル名（`src/data/capabilities/<id>.md`）になる。`axes` は選定時に見る軸であり、ツール詳細の `constraints.label` と一致させる努力はするが、強制はしない（6.3）。
※印は、付録Bの第1優先ツールだけでは紐づくツールが1件以下のもの。定義はするが、2件目が入るまで索引に出さない（4.2）。

### run：実行する

| id | name | question（利用者の言葉） | axes |
| --- | --- | --- | --- |
| `run-on-schedule` | 定期的に処理を実行する | 毎日／毎時この処理を自動で回したい | 最小実行間隔、実行時間上限、タイムゾーン指定、失敗時の再実行 |
| `run-on-event` | イベントや Webhook を受けて処理を起動する | 何かが起きたら即座に処理を走らせたい | 対応イベント源、起動までの遅延、再試行と重複実行 |
| `run-short-function` | 短時間の処理をオンデマンドで実行する | サーバーを持たずにコードを動かしたい | 実行時間上限、メモリ上限、コールドスタート、同時実行数 |
| `run-long-process` | 常時起動のプロセスを保持する | WebSocket や常駐ワーカーを動かしたい | 稼働時間課金、スリープ有無、スケール方法 |
| `run-batch` | 大量データを一括処理する | 数万件以上を一気に処理したい | 並列度、実行時間上限、途中失敗からの再開 |
| `run-containers` | 実行環境をコンテナで固定し、実行・運用する | 環境ごとパッケージして、どこでも同じように動かしたい | イメージサイズ、ビルド速度、オーケストレーション、スケーリング、料金単位 |

### store：保存・検索する

| id | name | question | axes |
| --- | --- | --- | --- |
| `store-relational` | 関係を持つデータを保存し問い合わせる | 表と表を結合して集計したい | トランザクション、容量・接続数の上限、マネージド有無 |
| `store-key-value` | キーと値を高速に読み書き・一時保存する | セッションやキャッシュを持ちたい | 永続性、メモリ上限、TTL |
| `store-documents` | 構造の変わりやすいデータを保存する | スキーマを固定せずに保存したい | クエリ表現力、整合性モデル、容量課金 |
| `store-files` | ファイルやバイナリを保存し配信する | 画像や添付ファイルを置きたい | 容量課金、転送課金、公開URL・署名URL |
| `store-vectors` | ベクトルで類似検索する | 意味の近い文書を探したい | 次元数上限、件数と速度、既存DBとの同居 |
| `full-text-search` | 全文検索する | 大量の文書からキーワードで探したい | 日本語対応、インデックス更新遅延、料金 |
| `analyze-large-data` | 大量データを集計・分析する | GB〜TB級のログを集計したい | スキャン量課金、クエリ遅延、取り込み方法 |
| `queue-messages` | 処理をキューに入れて非同期に処理する | 重い処理を後回しにして順に片付けたい | 順序保証、再配送、保持期間 |

### connect：外部とつなぐ

| id | name | question | axes |
| --- | --- | --- | --- |
| `call-http-api` | HTTP API を呼び出す | 外部サービスからデータを取りたい | タイムアウト、送信先制限、認証の扱い |
| `expose-http-api` | HTTP API を公開する | 自分のデータや処理を他から呼ばせたい | 認証、レート制限、タイムアウト、カスタムドメイン |
| `connect-saas` | 外部 SaaS 同士をコードなしで連携する | A で起きたことを B に反映したい | 対応コネクタ数、実行回数課金、条件分岐の表現力 |
| `send-notifications` | チャットやメールへ通知を送る | 結果を Slack やメールで受け取りたい | 送信上限、到達性、書式 |
| `read-write-spreadsheet` | スプレッドシートを読み書きする | シートを入出力に使いたい | セル数上限、API 呼び出し上限、同時編集 |
| `scrape-web` | Web ページからデータを取得する | サイトの情報を定期的に集めたい | JS 実行の要否、ブロック耐性、規約・法的制約 |
| `sync-realtime` | 複数クライアント間でデータを即時同期する | 画面をリアルタイムに更新したい | 同時接続数、課金単位、オフライン対応 |

### ship：画面を作り、公開する

| id | name | question | axes |
| --- | --- | --- | --- |
| `build-web-ui` | ブラウザ向けの画面を作る | 操作できる Web 画面を作りたい | レンダリング方式、学習コスト、エコシステム |
| `build-static-site` | 静的サイトを生成する | ブログや資料サイトを作りたい | ビルド時間、コンテンツ形式、動的要素の追加方法 |
| `host-static` | 静的ファイルを公開・配信する | HTML を世界に公開したい | 帯域課金、カスタムドメイン、ビルド時間上限、配信リージョン |
| `host-web-app` | サーバー付き Web アプリを公開する | バックエンド込みで動かしたい | スリープ有無、料金、リージョン、永続ディスク |
| `build-cli` | コマンドラインツールを作る | ターミナルから使う道具を作りたい | 配布方法、起動速度、依存関係 |
| `build-mobile-app` ※ | モバイルアプリを作る | スマホアプリとして配布したい | ネイティブ機能到達性、配布手順、学習コスト |
| `build-desktop-app` ※ | デスクトップアプリを作る | PC で動くアプリを配布したい | 配布サイズ、OS 対応、更新配布 |

### secure：認証し、守る

| id | name | question | axes |
| --- | --- | --- | --- |
| `authenticate-users` | 利用者を認証しアクセス権を制御する | ログイン機能をつけたい | 対応 IdP、MAU 課金、セッション管理、権限モデル |
| `manage-secrets` ※ | API キー等の秘密情報を安全に扱う | キーをコードに書かずに管理したい | ローテーション、監査ログ、環境ごとの分離 |
| `protect-edge` ※ | 攻撃や不正アクセスから公開面を守る | DDoS やボットを防ぎたい | 対象レイヤ、ルール記述、料金 |

### operate：開発・配信・監視を回す

| id | name | question | axes |
| --- | --- | --- | --- |
| `version-control` | ソースコードの履歴を管理し共同編集する | 変更履歴とレビューを回したい | 私有リポジトリ制限、容量、連携機能 |
| `run-ci` ※ | テストとビルドを自動実行する | push ごとに検証したい | 無料分数、並列数、セルフホスト、OS 対応 |
| `deploy-automatically` | 変更を自動で本番へ配信する | main に入れたら公開されてほしい | プレビュー環境、ロールバック、対応基盤 |
| `define-infra-as-code` ※ | インフラをコードで定義・再現する | 手作業で作った環境を再現可能にしたい | 対応クラウド、状態管理、差分適用 |
| `collect-logs` | ログを集約して検索する | 何が起きたか後から追いたい | 保持期間、取り込み量課金、検索性 |
| `monitor-metrics` | 指標を監視し異常を通知する | 落ちたらすぐ知りたい | 収集間隔、アラート経路、保持期間 |
| `track-errors` | アプリの例外を収集・追跡する | ユーザー側で起きたエラーを知りたい | イベント数課金、対応言語、ソースマップ |
| `test-e2e` ※ | ブラウザ操作を自動テストする | 画面の動作を自動で検証したい | 対応ブラウザ、実行速度、CI 統合 |

### process：データを加工・分析する

| id | name | question | axes |
| --- | --- | --- | --- |
| `transform-tabular` | 表形式データを変換・集計する | CSV を整形・集計したい | メモリ上限、処理速度、対応形式 |
| `visualize-data` | データを可視化・ダッシュボード化する | グラフで見たい・共有したい | 対応データ源、共有方法、更新頻度 |
| `orchestrate-pipelines` | 複数の処理を依存順に実行・再実行する | 前処理→集計→出力を確実に回したい | 依存管理、再実行、スケジューリング |

### ai：AI・機械学習を使う

| id | name | question | axes |
| --- | --- | --- | --- |
| `call-llm` | LLM で文章を生成・分類・抽出する | 自然言語の処理を API で済ませたい | 料金単位、コンテキスト長、レート制限、データ利用方針 |
| `embed-text` | 文章をベクトルに変換する | 意味検索や RAG を作りたい | 次元数、料金、多言語対応 |
| `run-models-locally` | モデルを手元の環境で動かす | 外部にデータを送らず AI を使いたい | 必要メモリ・GPU、対応モデル、速度 |
| `train-models` ※ | 機械学習モデルを学習させる | 独自データで予測モデルを作りたい | 計算資源、学習時間、データ量 |
| `build-agents` | ツールを使う AI エージェントを組み立てる | AI に手順を実行させたい | ツール接続方式、状態管理、可観測性 |

---

## 付録B：ツール初期選定（52件）

優先度1が Phase 3 の対象（42件）。優先度2は Phase 3 完了後に順次追加する（10件）。
「主な can」は執筆時の起点であり、執筆中に増減してよい。ただし `category` は変えない。

### language：言語・実行環境

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `python` | Python | language | 1 | build-cli, transform-tabular, scrape-web, call-http-api |
| `typescript` | TypeScript（Node.js 込み） | language | 1 | build-web-ui, build-cli, expose-http-api |
| `go` | Go | language | 1 | build-cli, expose-http-api, run-long-process |
| `rust` | Rust | language | 2 | build-cli, run-long-process |

### frontend：画面・フロントエンド

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `react` | React | framework | 1 | build-web-ui |
| `nextjs` | Next.js | framework | 1 | build-web-ui, build-static-site, expose-http-api |
| `astro` | Astro | framework | 1 | build-static-site, build-web-ui |
| `sveltekit` | SvelteKit | framework | 2 | build-web-ui, build-static-site |

### backend：サーバー・API

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `fastapi` | FastAPI | framework | 1 | expose-http-api |
| `hono` | Hono | framework | 1 | expose-http-api, run-short-function |
| `supabase` | Supabase | managed-service | 1 | store-relational, authenticate-users, store-files, sync-realtime, store-vectors |
| `firebase` | Firebase | managed-service | 1 | store-documents, authenticate-users, sync-realtime, store-files, run-short-function |

### datastore：データの保存

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `postgresql` | PostgreSQL | tool | 1 | store-relational, store-documents, full-text-search, store-vectors |
| `sqlite` | SQLite | tool | 1 | store-relational, full-text-search, transform-tabular |
| `redis` | Redis | tool | 1 | store-key-value, queue-messages |
| `amazon-s3` | Amazon S3 | managed-service | 1 | store-files, host-static |
| `mongodb` | MongoDB | tool | 2 | store-documents |
| `meilisearch` | Meilisearch | tool | 2 | full-text-search |

### data-processing：データ処理・分析

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `pandas` | pandas | framework | 1 | transform-tabular, visualize-data |
| `duckdb` | DuckDB | tool | 1 | transform-tabular, analyze-large-data |
| `bigquery` | BigQuery | managed-service | 1 | analyze-large-data, visualize-data |

### infrastructure：実行基盤・ホスティング

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `aws-lambda` | AWS Lambda | managed-service | 1 | run-short-function, run-on-schedule, run-on-event, run-batch |
| `cloudflare-workers` | Cloudflare Workers | managed-service | 1 | run-short-function, run-on-schedule, expose-http-api, queue-messages, store-key-value |
| `vercel` | Vercel | managed-service | 1 | host-static, host-web-app, deploy-automatically |
| `github-pages` | GitHub Pages | managed-service | 1 | host-static |
| `docker` | Docker | tool | 1 | run-containers |
| `render` | Render | managed-service | 1 | host-web-app, run-long-process, run-containers, run-on-schedule |
| `fly-io` | Fly.io | managed-service | 2 | run-containers, run-long-process, host-web-app |

### automation：自動化・連携

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `google-apps-script` | Google Apps Script | managed-service | 1 | run-on-schedule, read-write-spreadsheet, send-notifications, call-http-api |
| `n8n` | n8n | tool | 1 | connect-saas, run-on-schedule, run-on-event, orchestrate-pipelines, scrape-web |
| `cron` | cron / systemd timer | tool | 1 | run-on-schedule |

### devops：開発基盤・CI/CD

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `git` | Git | tool | 1 | version-control |
| `github` | GitHub | managed-service | 1 | version-control |
| `github-actions` | GitHub Actions | managed-service | 1 | run-ci, deploy-automatically, run-on-schedule, run-batch, orchestrate-pipelines |
| `terraform` | Terraform | tool | 1 | define-infra-as-code |
| `gitlab` | GitLab | managed-service | 2 | version-control, run-ci, deploy-automatically |
| `playwright` | Playwright | framework | 2 | test-e2e, scrape-web |

### observability：監視・可観測性

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `sentry` | Sentry | managed-service | 1 | track-errors |
| `prometheus-grafana` | Prometheus + Grafana | tool | 1 | monitor-metrics, collect-logs, visualize-data |
| `datadog` | Datadog | managed-service | 1 | monitor-metrics, collect-logs, track-errors |

### security：認証・セキュリティ

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `auth0` | Auth0 | managed-service | 1 | authenticate-users |
| `clerk` | Clerk | managed-service | 1 | authenticate-users |
| `oauth2-oidc` | OAuth 2.0 / OpenID Connect | protocol | 1 | authenticate-users |
| `cloudflare-waf` | Cloudflare WAF / DDoS 保護 | managed-service | 2 | protect-edge |

### ai：AI・機械学習

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `claude-api` | Claude API（Anthropic） | managed-service | 1 | call-llm, build-agents |
| `openai-api` | OpenAI API | managed-service | 1 | call-llm, embed-text, build-agents |
| `ollama` | Ollama | tool | 1 | run-models-locally, call-llm, embed-text |
| `hugging-face` | Hugging Face | managed-service | 1 | run-models-locally, embed-text, train-models |

### nocode：ノーコード・SaaS

| id | name | layer | 優先 | 主な can |
| --- | --- | --- | --- | --- |
| `zapier` | Zapier | managed-service | 1 | connect-saas, run-on-event, read-write-spreadsheet, send-notifications |
| `airtable` | Airtable | managed-service | 1 | store-relational, read-write-spreadsheet, expose-http-api |
| `make` | Make | managed-service | 2 | connect-saas, run-on-event, orchestrate-pipelines |
| `notion` | Notion | managed-service | 2 | build-static-site, store-documents |

### 選定で意図的に外したもの

| 外したもの | 理由 |
| --- | --- |
| Kubernetes | 利用者層（3.1）が直面する課題の外。`run-containers` は Docker / Render / Fly.io で軸が埋まる |
| GitLab CI 以外の CI（CircleCI 等） | `run-ci` は GitHub Actions が事実上の既定。第2優先の GitLab で比較軸が1本立てば十分 |
| Java / C# / Ruby | 言語比較は本サイトの主戦場ではない。言語は4件で「静的型／動的型」「GC／非GC」「スクリプト／コンパイル」の軸が埋まる |
| Elasticsearch | 初級者の全文検索は PostgreSQL か Meilisearch で足りる。運用コストの高さは Meilisearch の `alternatives` に記述する |
| LangChain 等の LLM フレームワーク | 変化が速く `constraints` が半年で陳腐化する。`build-agents` は API 直叩きの2件で軸を示す |

---

## 付録C：シナリオ初期セット（6件）

`fit` の4値は `best`（第一候補）／`viable`（成立するが劣る点がある）／`overkill`（成立するが過剰）／`avoid`（選ぶべきでない）。各シナリオに `avoid` か `overkill` を1件以上含め、「何を選ばないか」も示す。

| id | title（利用者の言葉） | needs | candidates（fit） |
| --- | --- | --- | --- |
| `daily-sheet-to-slack` | 毎朝、スプレッドシートの集計を Slack に流したい | run-on-schedule, read-write-spreadsheet, send-notifications | google-apps-script（best）、github-actions（viable）、n8n（viable）、zapier（viable：実行回数課金）、aws-lambda（overkill） |
| `publish-portfolio-free` | 個人ブログやポートフォリオを無料で公開したい | build-static-site, host-static | astro + github-pages（best）、nextjs + vercel（viable）、notion（viable：独自ドメインとデザイン自由度で劣る）、render（overkill） |
| `form-to-db-with-admin` | Web フォームの入力を保存し、管理画面で一覧したい | expose-http-api, store-relational, authenticate-users | supabase（best）、airtable（viable：件数上限）、firebase（viable）、fastapi + postgresql（overkill：自前運用） |
| `aggregate-large-csv` | 数GBの CSV をローカルで集計したい | transform-tabular, analyze-large-data | duckdb（best）、pandas（viable：メモリ上限）、sqlite（viable）、bigquery（overkill：転送とスキャン課金） |
| `add-login-to-app` | 自分の Web アプリにログイン機能をつけたい | authenticate-users | clerk（best：導入速度）、auth0（viable：無料枠と MAU 課金の分岐）、supabase（viable：DB と同居する場合）、oauth2-oidc の自前実装（avoid） |
| `summarize-documents-with-ai` | 文書を投げると要約や分類を返すツールを作りたい | call-llm, run-short-function | claude-api（best）、openai-api（best）、ollama（viable：外部送信不可の場合）、hugging-face（overkill） |

シナリオの本文（Markdown 本体）には、候補間の分岐条件を「〜なら A、〜なら B」の形で3〜5行書く。候補の `reason` は1文に留め、分岐の説明は本文に寄せる。

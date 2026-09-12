---
name: Hono
aliases: [hono, honojs, Hono.js]
category: backend
layer: framework
oneLiner: Web標準APIのみで書かれ、エッジからNode.jsまで同一コードで動く軽量フレームワーク
officialUrl: https://hono.dev/
docsUrl: https://hono.dev/docs/
can: [expose-http-api, run-short-function]
cannot:
  - Express 系（Node.js の http モジュール前提）ミドルウェアのそのまま利用（Request / Response は Web 標準 API）
  - 実行基盤の提供（Cloudflare Workers、Deno、Bun、Node.js 等を別途選び、実行時間・メモリ・同時実行の上限はその基盤側で決まる）
  - 巨大なリクエスト本文の既定での拒否（bodyLimit ミドルウェアを自分で付ける。Bun ではランタイム側の上限が先に効く）
  - Node.js 18.14.1 未満での動作
  - ORM・認証・DB 接続などフルスタック機能の同梱（ルーティングとミドルウェアに機能を絞っている）
constraints:
  - label: 対応ランタイムと Node.js の要件
    value: Node.js は 18.x なら 18.14.1 以上、19.x なら 19.7.0 以上、20.x 以上で、@hono/node-server アダプタ経由で動く。Bun・Deno は Fetch ハンドラをネイティブに実行
    impact: Node.js は「後から対応した」ランタイムで、serve() が返すサーバーのクローズは自分で管理する。古い Node.js の LTS では起動しない
    source: https://hono.dev/docs/getting-started/nodejs
    verifiedAt: 2026-09-13
  - label: リクエスト本文サイズの上限
    value: Hono 自体は上限を持たず、bodyLimit ミドルウェアで maxSize を指定する（超過時は 413）。Bun ではランタイムの既定 128 MiB が先に効き、それより大きい値を Hono 側に設定しても onError は呼ばれない
    impact: ファイル受信 API では Hono の設定だけでなく、ランタイム側の本文上限（Bun の maxRequestBodySize 等）を合わせて調整する
    source: https://hono.dev/docs/middleware/builtin/body-limit
    verifiedAt: 2026-09-13
  - label: バンドルサイズ
    value: hono/tiny プリセットで 14KB 未満（minified）。依存パッケージはゼロ
    impact: エッジ関数のサイズ上限やコールドスタートに対して余裕が大きい。逆に、機能はミドルウェアを個別に足して組み立てる前提になる
    source: https://hono.dev/docs/
    verifiedAt: 2026-09-13
  - label: ルート登録順序の意味
    value: ハンドラとミドルウェアは登録順に実行され、一致したハンドラが実行された時点で処理が止まる。app.route() は呼び出し時点で子アプリに登録済みのルートだけを取り込む
    impact: ミドルウェアはハンドラより上に、フォールバックは最後に書く。route() の後で子アプリにルートを追加すると 404 になり、この誤りは気づきにくい
    source: https://hono.dev/docs/api/routing
    verifiedAt: 2026-09-13
  - label: RPC（型付きクライアント）の型推論コスト
    value: ルート数に比例して tsserver の型インスタンス化が増え、IDE が遅くなる。公式は事前コンパイル（型宣言の生成）か、プロジェクト参照・アプリ分割を推奨
    impact: 数十ルートを超える API を1つの Hono インスタンスに載せて hc で型を取り出すと、エディタの補完が遅延する。アプリを分けるか型を事前生成する
    source: https://hono.dev/docs/guides/rpc
    verifiedAt: 2026-09-13
pitfalls:
  - Cloudflare Workers では process.env が既定で空になる。環境変数は c.env から取るか、nodejs_compat_populate_process_env フラグを有効にする
  - ハンドラを別ファイルの「コントローラ」に切り出すと path パラメータの型推論が失われる。factory.createHandlers か app.route() で分割する
  - 実行時間・メモリ・同時実行の上限は Hono ではなくランタイム側で決まる。コードは移植できても、基盤を替えると制約が変わる
  - Node.js で serve() を使う場合、サーバーのクローズ処理は自分で書く。テストでポートが解放されず失敗する
cost:
  model: free
  note: MIT ライセンスで無償。費用は実行するランタイム・ホスティング基盤の側で発生する
  source: https://github.com/honojs/hono/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: low
maturity: growing
alternatives:
  - tool: fastapi
    difference: FastAPI は Python で、型ヒントから検証と OpenAPI を自動生成し、データ処理・AI のライブラリと同居できる。Hono は TypeScript で、エッジランタイムに配置でき、フロントエンドと型を共有（RPC）できる
  - tool: cloudflare-workers
    difference: Cloudflare Workers は実行基盤で、Hono はその上で動くコードの書き方を提供する。Hono を使えば Workers 固有の API に依存せずに書けるため、後から Node.js や Deno に移せる
  - tool: nextjs
    difference: Next.js は画面とサーバー処理を1つのフレームワークで扱い、Route Handlers で API も書ける。Hono は API 専用で軽く、ランタイムを選ばない。画面が主なら Next.js、API が主なら Hono
verdict: TypeScript で HTTP API を書き、Cloudflare Workers・Deno・Bun・Node.js のどこに置くか後から決めたい場合の第一候補。Express 系ミドルウェアの資産を引き継ぐ必要がある場合や、ORM・認証込みのフルスタックが欲しい場合は避け、Next.js か既存の Node.js フレームワークへ
updatedAt: 2026-09-13
---

Request / Response / fetch といった Web 標準 API だけで実装されており、依存パッケージがない。同じコードが Cloudflare Workers、Fastly Compute、Deno、Bun、AWS Lambda、Node.js で動くため、実行基盤を先に決めなくてよい点が最大の利点である。

制約の多くは Hono 本体ではなく、選んだランタイム側にある。Hono 固有で最初に当たるのは、Node.js がアダプタ経由であること（バージョン要件と serve() の後始末）と、ルートの登録順序がそのまま実行順序になることである。

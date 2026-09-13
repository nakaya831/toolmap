---
name: SvelteKit
aliases: [Svelte Kit, kit.svelte.dev]
category: frontend
layer: framework
oneLiner: Svelteでルーティング・サーバー処理・静的出力までを完結させるフレームワーク
officialUrl: https://svelte.dev/
docsUrl: https://svelte.dev/docs/kit
can: [build-web-ui, build-static-site, expose-http-api]
cannot:
  - アダプタなしでのオンデマンドなサーバー側描画(デプロイ先ごとにadapter-node/adapter-cloudflare等の追加が必須)
  - +page.server.js等のサーバー専用ロジックを含むページの完全な静的書き出し(adapter-staticは全ルートの事前レンダリング可能性かSPAフォールバックが前提)
  - フォームアクション(actions)を持つページの事前レンダリング(POSTを受けるサーバーが必須なため)
  - 事前レンダリング中のurl.searchParams(実行時のクエリパラメータ)へのアクセス
constraints:
  - label: デプロイ先ごとのアダプタ選定
    value: ビルド出力をデプロイ環境向けに変換する「アダプタ」の指定がsvelte.config.jsで必須。公式にNode・Cloudflare・Netlify・Vercel・静的サイト(adapter-static)向けがある
    impact: オンデマンドのサーバー処理(Cookie読み書き、フォーム受信等)を使うページがあると、配置先に対応するアダプタを先に決めないとビルドが機能しない
    source: https://svelte.dev/docs/kit/adapters
    verifiedAt: 2026-09-13
  - label: 静的出力(adapter-static)の前提条件
    value: 全ページ・全エンドポイントが事前レンダリング可能であるか、SPAフォールバックを明示設定している必要がある。フォールバックは検索エンジン最適化とパフォーマンスへの悪影響が大きいと明記されている
    impact: サーバー専用ロジックを含むルートが1つでもあると、そのままでは静的サイトとして書き出せない。該当ルートを分離するか他のアダプタに切り替える
    source: https://svelte.dev/docs/kit/single-page-apps
    verifiedAt: 2026-09-13
  - label: Node向けサーバーのリクエストボディ上限
    value: adapter-nodeのBODY_SIZE_LIMIT既定値は512kb
    impact: ファイルアップロードなど大きめのリクエストボディを扱うには環境変数で明示的に引き上げる必要がある
    source: https://svelte.dev/docs/kit/adapter-node
    verifiedAt: 2026-09-13
  - label: フォームアクションと事前レンダリングの排他性
    value: actions(フォーム送信処理)を持つページはprerender対象にできない。POSTリクエストを処理するサーバーが必須なため
    impact: 静的サイト中心の構成でフォームを使うと、そのページだけサーバーが必要になり完全な静的配信が崩れる
    source: https://svelte.dev/docs/kit/page-options
    verifiedAt: 2026-09-13
  - label: 動作に必要なNode.jsバージョン
    value: "@sveltejs/kit の engines 指定は node >=18.13"
    impact: 古いLTS(18.13未満)やCI環境ではインストール・ビルドが失敗する
    source: https://github.com/sveltejs/kit/blob/main/packages/kit/package.json
    verifiedAt: 2026-09-13
pitfalls:
  - 各ページのprerender/ssr/csr設定を理解せずに使うと、静的化したいページにサーバー依存のコードが混入してビルドが失敗する
  - アダプタを決めずに開発を進め、終盤でCookie認証やフォーム処理を足すと、対応アダプタの選定からやり直しになる
  - SPAフォールバックを安易に使うと、初期表示の遅さとSEOの悪化が本番で露見する
  - load関数とページオプションの継承関係(+layout.jsとの併用)を誤解し、意図しないルートまで事前レンダリング対象/非対象になる
cost:
  model: free
  note: MIT Licenseで無償。費用は配置先のホスティング(Vercel、Cloudflare、Node環境のサーバー等)側で発生する
  source: https://github.com/sveltejs/kit/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: nextjs
    difference: Next.jsは React ベースで Server Actions・ISR 等の機能が厚く、Vercel との統合が深い。SvelteKit は Svelte ベースで出力ランタイムが軽量。React エコシステムに乗るなら Next.js、軽さと書きやすさを優先するなら SvelteKit
  - tool: astro
    difference: Astro は既定で JavaScript を出さない文書中心の静的サイト生成に特化し、複数フレームワークを島として混在できる。SvelteKit は Svelte 単体でログイン後の操作画面のようなアプリ的な用途まで一貫して作る
  - tool: react
    difference: React は画面を作るライブラリそのもので、ルーティングやサーバー処理は別途組み合わせが必要。SvelteKit はルーティング・データ取得・サーバー処理・静的出力までを1つのフレームワークとして提供する
verdict: ルーティング・データ取得・フォーム処理・静的出力までを1つのフレームワークで完結させたいプロジェクトでは第一候補。React の資産に乗る必要がある場合は Next.js、文書中心で操作の少ないサイトは Astro を検討する
updatedAt: 2026-09-13
---

Svelte をコンパイラとして使い、ファイルベースのルーティング、サーバー側のデータ取得(load 関数)、フォーム処理(actions)、静的サイト生成までを1つのフレームワークにまとめたもの。出力する JavaScript が少なく、Svelte 自体の学習コストの低さを引き継いでいる。

利用者が最初に当たる制約はアダプタの選定である。オンデマンドのサーバー処理を使うページが1つでもあると、Node・Cloudflare・Vercel など配置先に対応したアダプタが必要になり、逆に全ページが事前レンダリング可能でなければ完全な静的サイト(adapter-static)としては書き出せない。配置先を後回しにして開発を進めると、この境界で手戻りが起きやすい。

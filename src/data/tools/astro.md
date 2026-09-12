---
name: Astro
aliases: [Astro.js, withastro]
category: frontend
layer: framework
oneLiner: 既定でJavaScriptを出さない静的サイト生成器。必要な部分だけ島として動かす
officialUrl: https://astro.build/
docsUrl: https://docs.astro.build/
can: [build-static-site, build-web-ui]
cannot:
  - アダプタなしでのサーバー側描画（Cookie の読み書き、リクエストヘッダの参照、server:defer はアダプタが必須）
  - ".astro コンポーネント自体をブラウザ側で動かすこと（client: ディレクティブを付けるとエラー）"
  - 1つのフレームワークのコンポーネントファイル（.jsx、.svelte 等）内で別フレームワークを混在させること（混在できるのは .astro のみ）
  - React Context などフレームワーク固有の仕組みで島同士の状態を共有すること
  - 奇数版の Node.js（v23 等）や v22.12.0 未満での実行
constraints:
  - label: 島（Island）の間の状態共有
    value: 部分ハイドレーションされた島の間では React Context 等のコンテキストラッパーが使えない。共有には Nano Stores（1 KB 未満、依存なし）のような外部ストアが推奨される
    impact: ヘッダーのカート数とページ本文のボタンのように、離れた場所の UI が状態を共有する設計は、最初からストア経由にする。画面全体が常に連動するアプリには向かない
    source: https://docs.astro.build/en/recipes/sharing-state-islands/
    verifiedAt: 2026-09-13
  - label: 既定の出力と対話性
    value: "フレームワークコンポーネントは既定でサーバー側で静的 HTML として描画され、client:* ディレクティブを付けたものだけがブラウザで動く。.astro コンポーネントはハイドレートできず、client: を付けるとエラーになる"
    impact: React で書いたボタンが「押しても動かない」のはディレクティブ忘れ。逆に全部に client:load を付けると JavaScript ゼロの利点が消える
    source: https://docs.astro.build/en/guides/framework-components/
    verifiedAt: 2026-09-13
  - label: Node.js の要件
    value: v22.12.0 以上。v23 のような奇数版は非対応
    impact: ローカルや CI の Node.js が奇数版だとビルドが保証されない。偶数 LTS に固定する
    source: https://docs.astro.build/en/install-and-setup/
    verifiedAt: 2026-09-13
  - label: サーバー側描画（オンデマンド）の要件
    value: 既定は全ページ事前描画（output は static）。オンデマンド描画にはアダプタの追加が必須で、ページ単位は prerender = false で切り替える。output を server にすると全ページが既定でオンデマンドになる
    impact: ログイン状態で表示を変える、フォームを受け取るなどの処理は、配置先（Cloudflare、Vercel、Node.js 等）に対応するアダプタの選定が先に必要になる
    source: https://docs.astro.build/en/guides/on-demand-rendering/
    verifiedAt: 2026-09-13
  - label: 旧メジャー版のサポート
    value: セキュリティ修正のみ、1つ前のメジャー版まで。Node.js の最低版はマイナー版でも引き上げられることがある
    impact: 2世代前のメジャーは修正が来ない。メジャー更新のたびに移行作業が発生する前提で運用する
    source: https://docs.astro.build/en/upgrade-astro/
    verifiedAt: 2026-09-13
  - label: client:only の制約
    value: client:only はサーバー側の HTML 描画を行わず、フレームワーク名（react、preact、svelte、vue、solid-js）の指定が必須
    impact: ブラウザ API に依存するコンポーネントの逃げ道だが、初回 HTML に内容が含まれないため検索エンジン向けの内容には使えない
    source: https://docs.astro.build/en/reference/directives-reference/
    verifiedAt: 2026-09-13
pitfalls:
  - 全コンポーネントに client:load を付けると、React の SPA と変わらない量の JavaScript が出る。client:visible / client:idle を既定にし、静的で済むものはディレクティブを付けない
  - 島の間の状態共有を親子の props や React Context で試みて動かない。ストア（Nano Stores）を最初から使う
  - メジャー版の更新でコンテンツコレクションなどの API が変わり、移行作業が発生する。1つ前までしかセキュリティ修正が来ないため放置できない
  - 全ページをビルド時に生成するため、ページ数に比例してビルド時間が伸びる。数万ページ規模ではオンデマンド描画との併用を検討する
cost:
  model: free
  note: MIT License で無償。費用は配信先のホスティング側で発生し、オンデマンド描画を使う場合はそのサーバー実行分が課金対象になる
  source: https://github.com/withastro/astro/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: nextjs
    difference: Next.js はアプリ的な画面、Server Actions、ISR を持つが、静的ホスティングでは機能が制限される。文書中心で JavaScript を最小にしたいなら Astro、操作の多いアプリなら Next.js
  - tool: react
    difference: React 単体は全画面をクライアント側で動かす SPA になる。Astro は静的 HTML が既定で、React を島として部分的に埋め込める。両者は排他ではなく、Astro の中で React を使う構成が一般的
verdict: ブログ・ドキュメント・製品紹介など文書中心のサイトでは第一候補で、静的ホスティングにそのまま置ける。画面全体がアプリ的に動く（ログイン後のダッシュボード、常に状態を共有する UI）場合は島の分離が足かせになるため Next.js か React へ
updatedAt: 2026-09-13
---

Markdown や .astro ファイルから静的 HTML を生成するフレームワークで、React・Vue・Svelte など複数の UI フレームワークのコンポーネントを同じページに置ける。既定ではブラウザに JavaScript を送らず、client: ディレクティブを付けた部分（島）だけがブラウザで動く。この「必要な場所だけ動かす」構造が、文書中心のサイトで表示が速い理由である。

最初に当たる制約は島の分離である。島同士は独立して描画・実行されるため、React Context のような親子ツリーに依存する状態共有が効かない。離れた UI が連動する設計はストアを介する前提になる。次に当たるのがサーバー側処理で、Cookie を読む・フォームを受けるといった処理はアダプタの選定（＝配置先の決定）が先に必要になる。

---
name: Next.js
aliases: [Next, NextJS, App Router]
category: frontend
layer: framework
oneLiner: Reactにルーティング・サーバー描画・APIを足した、Web アプリのフレームワーク
officialUrl: https://nextjs.org/
docsUrl: https://nextjs.org/docs
can: [build-web-ui, build-static-site, expose-http-api]
cannot:
  - 静的エクスポート（output を export にした構成）での Cookie・Proxy・ISR・Server Actions・既定ローダーの画像最適化・generateStaticParams のない動的ルート
  - Node.js 20.9 未満での実行
  - 1MB を超える本文を Server Action に既定設定のまま送ること
  - 複数インスタンス構成で、追加設定なしにキャッシュや revalidateTag の結果を共有すること
  - 標準の Route Handler での WebSocket サーバーなど常駐接続の保持（カスタムサーバーが必要）
constraints:
  - label: 静的エクスポートで使えない機能
    value: "output を export にすると Cookie、Rewrites・Redirects・Headers、Proxy、ISR、既定ローダーの画像最適化、Draft Mode、Server Actions、Intercepting Routes、generateStaticParams のない動的ルートが使えない。Route Handler は GET のみ、force-static の明示が必要"
    impact: GitHub Pages や S3 などの静的ホスティングに置きたい場合、Next.js の「サーバーが要る機能」はすべて使えない。それらが要るなら Node.js サーバーか対応ホスティングを前提にする
    source: https://nextjs.org/docs/app/guides/static-exports
    verifiedAt: 2026-09-13
  - label: 動作要件（Node.js・TypeScript・ブラウザ）
    value: Node.js 20.9 以上、TypeScript 5.1.0 以上。ブラウザは Chrome / Edge / Firefox 111 以上、Safari 16.4 以上が既定対象
    impact: 古い Node.js のサーバーや、古いブラウザ（IE 11 等）の対応が要件にある案件では、実行環境の更新かポリフィルの自前追加が先に必要になる
    source: https://nextjs.org/docs/app/getting-started/installation
    verifiedAt: 2026-09-13
  - label: Server Action の本文サイズ上限
    value: 1MB / リクエスト（既定。serverActions.bodySizeLimit で変更可）。multipart の境界・ヘッダ分も含めて計算される
    impact: ファイルアップロードを Server Action で受けると 1MB で止まる。上限を上げるか、アップロードはストレージへ直接送る
    source: https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions
    verifiedAt: 2026-09-13
  - label: Proxy（旧 Middleware）の制約
    value: プロジェクトに1ファイル・1関数のみ。matcher 未指定なら静的ファイルや画像も含む全リクエストで実行される。v16 以降は Node.js ランタイム固定で runtime 設定は不可。静的エクスポートでは使えない
    impact: 認証チェックを Proxy だけに置くと、matcher の変更や Server Action の移動で保護が外れる。各 Server Action・ページ側でも認可を検証する
    source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
    verifiedAt: 2026-09-13
  - label: 画像最適化の設定要件
    value: "外部画像は remotePatterns での許可が必須。qualities の指定は v16 から必須（既定 [75]）。SVG は既定で最適化されない。最適化済みキャッシュを無効化する手段はなく、minimumCacheTTL か src の変更で対処する"
    impact: CMS の画像を表示するだけでも設定が要る。キャッシュを消せないため、同じ URL で画像を差し替える運用と相性が悪い
    source: https://nextjs.org/docs/app/api-reference/components/image
    verifiedAt: 2026-09-13
  - label: メジャー版のサポート期間
    value: 最新メジャーが Active LTS、その前が Maintenance LTS。Maintenance は初回リリースから2年間で、重大なバグとセキュリティ修正のみ。Maintenance への修正は破壊的変更でもマイナー版として入る
    impact: メジャーは概ね年1回のため、2年に1度はメジャーアップグレードが必須になる。移行工数（ファイル名やキャッシュ既定の変更）を運用計画に入れる
    source: https://nextjs.org/support-policy
    verifiedAt: 2026-09-13
pitfalls:
  - 複数インスタンスやサーバーレスで動かすと、ISR のキャッシュがインスタンスごとに分かれ古い内容が混在する。cacheHandler で Redis 等の外部ストアに寄せる
  - use client を付けたファイルの import は配下ごとクライアントバンドルに入る。境界はできるだけ末端のコンポーネントに置く
  - Server Component で window や useState に触れてビルドエラーになる。サーバー／クライアントの境界を先に決めてから書く
  - Vercel 以外に置くと、画像最適化・ISR・Proxy の挙動がホスティングごとに異なる。配置先を決めてから機能を選ぶ
cost:
  model: free
  note: フレームワーク自体は MIT License で無償。費用はホスティング側で発生し、画像最適化・ISR のキャッシュ・サーバー実行時間はホスティングの課金項目になる
  source: https://github.com/vercel/next.js/blob/canary/license.md
  verifiedAt: 2026-09-13
learningCost: high
maturity: stable
alternatives:
  - tool: react
    difference: React 単体はビュー層のみで、ルーティングやサーバー描画を持たない。ログイン後の SPA で十分なら React 単体のほうが構成が軽く、検索エンジン対応やサーバー処理が要るなら Next.js
  - tool: astro
    difference: Astro は既定で JavaScript を出さず、文書中心のサイトで速く静的ホスティングに置きやすい。Server Actions やアプリ的な画面が中心なら Next.js
  - tool: vercel
    difference: Vercel は Next.js の開発元が運用するホスティングで、ISR・画像最適化・Proxy が設定なしで動く。他基盤では自前の Node.js サーバーかアダプタが要り、機能差が出る
verdict: React でサーバー描画・ルーティング・API を一体で持つ Web アプリでは第一候補。静的ホスティングだけに置きたい場合は静的エクスポートの制限に当たるため Astro か React 単体へ。Node.js サーバーを持てない、または年1回のメジャー追従ができない場合は避ける
updatedAt: 2026-09-13
---

Vercel が開発する React のフルスタックフレームワークで、ファイル配置によるルーティング、サーバーコンポーネント、Server Actions、画像最適化、ISR（増分静的再生成）を一体で提供する。React 本体が「ビュー層のみ」であるのに対し、Web アプリに必要な残りをまとめて引き受ける位置づけである。

最初に当たる制約は「置き場所」である。機能の多くは Node.js サーバーを前提としており、静的エクスポートでは Cookie・Proxy・ISR・Server Actions が使えない。GitHub Pages のような静的ホスティングに載せたい場合、Next.js を選ぶ利点の大半が消える。次に当たるのがサーバー／クライアントの境界設計と、年1回のメジャー更新への追従で、いずれも小規模な個人開発より、運用を続けるチーム開発で重くなる。

---
name: GitHub Pages
aliases: [Pages, gh-pages, github.io]
category: infrastructure
layer: managed-service
oneLiner: GitHubリポジトリから静的サイトを無料で公開するホスティング
officialUrl: https://pages.github.com/
docsUrl: https://docs.github.com/en/pages
can: [host-static, deploy-automatically]
cannot:
  - サーバーサイド処理（API、フォーム受信、認証）。静的ファイルの配信のみ
  - 商用サイト・EC・SaaS の運用（利用規約で禁止）
  - パスワードやクレジットカード番号などの機密情報の送受信
  - 1アカウントに複数のユーザー／組織サイト（user.github.io は 1 つ。プロジェクトサイトはリポジトリごと）
  - GitHub Free プランでのプライベートリポジトリからの公開（公開リポジトリが必須）
constraints:
  - label: 帯域の上限（ソフトリミット）
    value: 100 GB / 月
    impact: 画像や動画の多いサイトで超えると配信が制限される。大きなメディアは外部のストレージ・CDN に置く
    source: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
    verifiedAt: 2026-09-13
  - label: 公開サイトのサイズ
    value: 1 GB まで（ソースリポジトリも 1 GB が推奨上限）
    impact: 生成物にビルド成果物や画像を溜め込むと上限に届く。履歴に大きなバイナリを残さない
    source: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
    verifiedAt: 2026-09-13
  - label: ビルド回数と時間
    value: 10 ビルド / 時（ソフトリミット。独自の GitHub Actions ワークフローには適用されない）、1 ビルドは 10分でタイムアウト
    impact: 頻繁な push で 1 時間に 10 回を超えると反映されない。重いビルドは Actions 側で行い、成果物だけを配置する
    source: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
    verifiedAt: 2026-09-13
  - label: 商用利用の禁止
    value: 事業運営のための無料ホスティングとしての利用は不可。EC サイトや、商取引・SaaS 提供を主目的とするサイトは禁止
    impact: 個人サイト・OSS のドキュメント・ポートフォリオに限る。収益化するサイトは Vercel や Render などへ
    source: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
    verifiedAt: 2026-09-13
  - label: 無料プランで公開できるリポジトリ
    value: GitHub Free / GitHub Free for organizations では公開リポジトリのみ
    impact: ソースを非公開にしたまま Pages を使うには GitHub Pro 以上が必要になる
    source: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
    verifiedAt: 2026-09-13
pitfalls:
  - 無料プランでは公開リポジトリが必須で、ソースと履歴がすべて見える。API キーや下書きを置かない
  - 既定の Jekyll ビルドはプラグインが制限される。Astro・Next.js 等の他のジェネレータは GitHub Actions でビルドし、成果物だけを配置する
  - プロジェクトサイトはサブパス（/リポジトリ名/）で配信されるため、絶対パス（/css/...）のリンクが壊れる。ジェネレータ側で base path を設定する
  - 反映まで数分の遅延があり、CDN キャッシュも残る。「push したのに変わらない」の多くは待ち時間かキャッシュ
cost:
  model: free
  note: GitHub アカウントがあれば無料。増枠の購入手段はなく、帯域 100 GB / 月・サイト 1 GB を超える用途や商用サイトは他サービスへ移る
  source: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: vercel
    difference: Vercel はプレビュー URL・サーバーレス関数・Cron を持ち、商用も Pro で可能。GitHub Pages は静的配信だけだが、公開リポジトリと GitHub アカウントだけで完結し、追加のアカウント登録が要らない
  - tool: render
    difference: Render の静的サイトも無料で、同じワークスペースにバックエンドや DB を並べられる。GitHub Pages は GitHub 内で完結する反面、動的要素を足す道がない
verdict: OSS のドキュメント、個人ブログ、ポートフォリオなど、完全に静的で非商用のサイトでは第一候補。サーバー側処理・非公開ソース・商用利用・100 GB / 月を超える配信のいずれかが要る時点で避け、Vercel か Render へ
updatedAt: 2026-09-13
---

GitHub のリポジトリ内容をそのまま静的サイトとして公開する仕組みで、`<user>.github.io` のドメインと HTTPS が無料で付く。既定では Jekyll でビルドされるが、GitHub Actions のワークフローから任意の成果物を配置することもできる。

利用者が最初に当たるのは技術的な上限ではなく利用規約である。事業目的の運営・EC・SaaS は禁止で、無料プランでは公開リポジトリが必須になる。技術的には帯域 100 GB / 月、サイト 1 GB、ビルド 10分が実質的な上限で、いずれも増枠の手段がない。

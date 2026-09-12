---
title: 個人ブログやポートフォリオを無料で公開したい
needs: [build-static-site, host-static]
candidates:
  - tool: astro
    fit: best
    reason: Markdown を書けば静的 HTML になり、既定で JavaScript を出力しない。GitHub Pages や Cloudflare Pages にそのまま置ける
  - tool: github-pages
    fit: best
    reason: リポジトリに push するだけで公開され、無料で独自ドメインも使える。容量 1GB・帯域 100GB/月の目安に個人サイトは収まる
  - tool: nextjs
    fit: viable
    reason: 静的出力もできるが、機能の多くはサーバーを前提にしている。ブログだけなら Astro より学ぶ量が多い
  - tool: vercel
    fit: viable
    reason: Next.js との相性が最良で、プレビュー環境も付く。無料枠は個人利用に限られ、商用利用は有償プランになる
  - tool: render
    fit: overkill
    reason: 静的サイトも置けるが、サーバー付きアプリのための基盤。ブログに常駐サーバーは要らない
updatedAt: 2026-09-13
---

- 記事を Markdown で書き、動的な機能（ログイン、コメント投稿）が要らないなら **Astro + GitHub Pages**。ビルドも GitHub Actions で無料で回る。
- 将来 API やログインを足す見込みがあるなら **Next.js + Vercel**。ただし無料枠は非商用に限られる点を先に確認する。
- コードを書きたくないなら、ノーコードの選択肢（Notion の公開ページなど）がある。独自ドメインとデザインの自由度で劣る。
- 画像が多いサイトは帯域が先に効く。GitHub Pages の目安（100GB/月）を超える見込みなら Cloudflare Pages を検討する。

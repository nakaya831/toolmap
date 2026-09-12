---
title: 自分の Web アプリにログイン機能をつけたい
needs: [authenticate-users]
candidates:
  - tool: clerk
    fit: best
    reason: 画面部品まで同梱され、React / Next.js なら数十行で導入できる。無料枠を超えると MAU 単位で課金される
  - tool: auth0
    fit: viable
    reason: 対応する IdP と企業向け機能が最も広い。無料枠はあるが、料金体系が複雑で MAU 課金の分岐を先に読む必要がある
  - tool: supabase
    fit: viable
    reason: DB を Supabase に置くなら、認証も同じプロジェクトで済み、行レベルの権限制御まで一貫する。他の DB を使うなら利点は薄い
  - tool: oauth2-oidc
    fit: avoid
    reason: 仕様を自分で実装するのは避ける。パスワード保存・セッション・トークン失効を正しく作るコストが高く、失敗が致命的
updatedAt: 2026-09-13
---

- フロントエンドが React / Next.js で、早く動かしたいなら **Clerk**。
- 社内 SSO（SAML）や複数の IdP、監査ログが要件にあるなら **Auth0**。個人開発では過剰になりやすい。
- データベースを **Supabase** に置いているなら、認証も Supabase。行レベルセキュリティで「自分のデータだけ読める」を DB 側で担保できる。
- どの案でも、裏で動いているのは **OAuth 2.0 / OpenID Connect**。用語（アクセストークン、ID トークン、リダイレクト URI）だけは理解しておく。自前実装はしない。

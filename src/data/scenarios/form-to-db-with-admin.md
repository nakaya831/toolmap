---
title: Web フォームの入力を保存し、管理画面で一覧したい
needs: [expose-http-api, store-relational, authenticate-users]
candidates:
  - tool: supabase
    fit: best
    reason: PostgreSQL・REST API・認証・管理画面（Table Editor）が最初から揃う。フォームからは API に POST するだけで済む
  - tool: airtable
    fit: viable
    reason: フォーム機能と管理画面が同梱で、最も早く動く。ただし無料プランのレコード数上限と API 制限に当たりやすく、複雑な結合はできない
  - tool: firebase
    fit: viable
    reason: Firestore と Auth で同じ構成が組める。データが文書型になるため、後から集計や結合が要る場合は Supabase のほうが楽
  - tool: google-apps-script
    fit: viable
    reason: Google フォーム＋スプレッドシートで管理画面まで代替できる。件数が数万を超える、複数人が同時に編集する、ならば DB に移す
  - tool: fastapi
    fit: overkill
    reason: PostgreSQL と組み合わせれば何でもできるが、認証・管理画面・ホスティングを自前で用意する。BaaS で足りる規模で選ぶ理由はない
updatedAt: 2026-09-13
---

- とにかく早く、コードを最小にしたいなら **Airtable** か **Google フォーム＋スプレッドシート**。件数が少なく、後で集計する予定がないなら十分。
- 件数が増える、他システムから API で参照する、認証付きで公開する、のいずれかがあるなら **Supabase**。無料プランはプロジェクトが一定期間使われないと一時停止される点に注意。
- モバイルアプリからも書き込む、リアルタイムで画面を更新したいなら **Firebase** も同等。ただしデータは文書型なので、SQL で集計する想定なら Supabase。
- 自前の API サーバー（FastAPI 等）は、BaaS の制約（行数・MAU・リージョン）に当たってから移行先として検討する。

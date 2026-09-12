---
title: 毎朝、スプレッドシートの集計を Slack に流したい
needs: [run-on-schedule, read-write-spreadsheet, send-notifications]
candidates:
  - tool: google-apps-script
    fit: best
    reason: シートの読み取りに認証設定が不要で、時間主導トリガーだけで完結する。処理は数秒で終わり、6分の上限に触れない
  - tool: github-actions
    fit: viable
    reason: cron で毎朝起動でき、任意の言語が使える。ただし Google Sheets API の認証（サービスアカウント）を自前で設定する必要がある
  - tool: n8n
    fit: viable
    reason: Sheets ノードと Slack ノードをつなぐだけで組める。自己ホストなら無料だが、動かし続けるサーバーが要る
  - tool: zapier
    fit: viable
    reason: 最も早く組めるが、無料プランはタスク数と実行間隔の上限に当たりやすい。行数が増えると課金が跳ねる
  - tool: aws-lambda
    fit: overkill
    reason: 実行基盤としては十分だが、Google 認証・Slack 連携・スケジュールをすべて自前で組む。この規模では GAS で足りる
updatedAt: 2026-09-13
---

- シートが Google スプレッドシートで、処理が数秒で終わるなら **Google Apps Script**。ただし「9:00 ちょうど」は保証されず、9〜10時のどこかで動く。
- 時刻を分単位で守りたい、または npm のライブラリを使いたいなら **GitHub Actions**。ただし schedule も遅延することがあり、無料分数は月 2,000 分。
- Slack 以外にも通知先が増える、条件分岐が増えるなら **n8n** か **Zapier**。コードを書かずに保ちたいなら Zapier、無料で回したいなら n8n を自己ホスト。
- 集計対象が数十万行を超えるなら、シートではなく DB に置き換える課題になる。「数GBの CSV をローカルで集計したい」を参照。

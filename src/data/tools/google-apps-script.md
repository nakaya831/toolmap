---
name: Google Apps Script
aliases: [GAS, Apps Script]
category: automation
layer: managed-service
oneLiner: Googleの各サービスをJavaScriptで自動操作する、サーバー不要の実行環境
officialUrl: https://workspace.google.com/products/apps-script/
docsUrl: https://developers.google.com/apps-script
can: [run-on-schedule, read-write-spreadsheet, send-notifications, call-http-api, run-on-event]
cannot:
  - 常時起動するプロセスの保持（WebSocket サーバー、常駐ワーカー）
  - 6分を超える単一の処理
  - 分未満の間隔での定期実行
  - Google アカウントの外にあるデータベースへの直接接続（HTTP 経由か JDBC のみ）
  - npm パッケージのそのまま利用（Node.js ではない）
constraints:
  - label: 1実行あたりの実行時間上限
    value: 6分 / 実行（個人アカウント・Workspace とも）
    impact: 長時間処理は分割し、続きを時間主導トリガーで再開する設計が必要になる
    source: https://developers.google.com/apps-script/guides/services/quotas
    verifiedAt: 2026-09-13
  - label: トリガー実行の合計時間（1日）
    value: 90分 / 日（個人アカウント）、6時間 / 日（Workspace）
    impact: 5分ごとに1分かかる処理を回すと個人アカウントでは1日の上限を超える。頻度と処理時間の積で見積もる
    source: https://developers.google.com/apps-script/guides/services/quotas
    verifiedAt: 2026-09-13
  - label: URL Fetch 呼び出し回数（1日）
    value: 20,000回 / 日（個人アカウント）、100,000回 / 日（Workspace）
    impact: 外部 API を1行ごとに叩くループは、行数が数千を超えると1日で枯渇する。バッチ化する
    source: https://developers.google.com/apps-script/guides/services/quotas
    verifiedAt: 2026-09-13
  - label: メール送信の宛先数（1日）
    value: 100件 / 日（個人アカウント）、1,500件 / 日（Workspace）
    impact: 通知の一斉送信には使えない。個人アカウントでは1日100宛先で止まる
    source: https://developers.google.com/apps-script/guides/services/quotas
    verifiedAt: 2026-09-13
  - label: 同時実行数
    value: 30 / ユーザー
    impact: フォーム送信トリガーなどが集中すると、31件目以降は失敗する
    source: https://developers.google.com/apps-script/guides/services/quotas
    verifiedAt: 2026-09-13
  - label: 時間主導トリガーの実行時刻の精度
    value: 「9時」と指定すると 9時〜10時の間のいずれかの時刻で実行される（日ごとには一定）。最短間隔は1分
    impact: 「毎朝9:00ちょうど」は保証されない。時刻厳守が必要なら他基盤を使う
    source: https://developers.google.com/apps-script/guides/triggers/installable
    verifiedAt: 2026-09-13
pitfalls:
  - スプレッドシートをセル単位で読み書きすると極端に遅い。範囲ごとに getValues / setValues でまとめる
  - 実行ログが標準出力に出ない。Cloud Logging を有効にしないと失敗に気づけない
  - スクリプトの所有者アカウントの権限で動く。所有者が組織を離れるとトリガーが止まる
cost:
  model: free
  note: Google アカウントがあれば追加費用なし。ただし上記クォータが実質的な上限で、増枠の購入手段はない。Workspace 契約でクォータが上がる
  source: https://developers.google.com/apps-script/guides/services/quotas
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: github-actions
    difference: GitHub Actions は6時間まで1ジョブを実行でき npm も使えるが、Google サービスへの認証を自前で設定する必要がある。シートを触らない定期処理なら Actions のほうが制約が緩い
  - tool: aws-lambda
    difference: Lambda は実行時間15分・同時実行1,000で従量課金。Google 認証は自前。処理規模が GAS のクォータを超えたときの移行先
  - tool: n8n
    difference: n8n はノーコードで SaaS 連携を組める。分岐が複雑になる前に GAS へ、コードが不要なら n8n へ
verdict: Google サービス（スプレッドシート・Gmail・Drive・カレンダー）の中で完結する小規模な自動化では第一候補。処理時間6分・実行合計90分/日・外部呼び出し2万回/日のいずれかに触れた時点で他基盤への移行を検討する
updatedAt: 2026-09-13
---

Google が運用する実行環境で、スプレッドシート・Gmail・Drive などの API が認証なしで呼べる点が最大の利点である。言語は JavaScript（V8 ランタイム）だが Node.js ではなく、`require` や npm は使えない。

利用者が最初に当たるのは「実行時間6分」の壁で、次に当たるのが「トリガー実行合計90分/日」である。前者は処理の分割で回避できるが、後者は頻度と処理時間の積で決まるため、設計段階で見積もる必要がある。

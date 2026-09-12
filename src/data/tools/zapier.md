---
name: Zapier
aliases: [ザピアー]
category: nocode
layer: managed-service
oneLiner: 数千のSaaSをノーコードでつなぐ自動化サービス。タスク数課金
officialUrl: https://zapier.com/
docsUrl: https://help.zapier.com/hc/en-us
can: [connect-saas, run-on-event, read-write-spreadsheet, send-notifications]
cannot:
  - 無料プランでの3ステップ以上のZap（無料は1トリガー＋1アクションの2ステップのみ）
  - 無料プランでのリアルタイム起動（トリガーの確認間隔は15分固定のポーリング）
  - 月間タスク数を超える実行（無料は100タスク/月。超過分は上位プランへの移行が必要）
  - 複雑な分岐・ループを含む処理を、コードなしのまま保守し続けること（Code by Zapierや外部スクリプトが必要になる場面がある）
  - 大容量ファイルの添付処理（フォームでの添付は5MB・3ファイルまで）
constraints:
  - label: 無料プランの月間タスク数
    value: 100タスク/月
    impact: タスクはZapが1回実行されるたびに消費される。連携件数の多い自動化はすぐ上限へ達し、有料プランへの移行が必要になる
    source: https://zapier.com/pricing
    verifiedAt: 2026-09-13
  - label: 無料プランのトリガー確認間隔（ポーリング）
    value: 15分
    impact: 新着データの検知は最短でも15分遅れる。即時反応が必要な用途（Webhookの即時処理など）には向かない
    source: https://zapier.com/pricing
    verifiedAt: 2026-09-13
  - label: 無料プランのZapのステップ数
    value: 2ステップ（1トリガー＋1アクション）まで。Zapの本数自体は無制限
    impact: 複数アクションを連ねる自動化（通知後にシートへ記録する等）は有料プランが必須になる
    source: https://zapier.com/pricing
    verifiedAt: 2026-09-13
  - label: Zapier Tablesのレコード上限
    value: 1アカウントあたり2,500レコード
    impact: SaaS連携の受け皿として簡易データベース的に使う場合、件数がすぐに上限へ到達する
    source: https://zapier.com/pricing
    verifiedAt: 2026-09-13
  - label: 有料プランのタスク数と料金
    value: 750タスク/月が年払い$19.99・月払い$29.99から、最大200万タスク/月は年払い$3,389・月払い$5,099
    impact: タスク数に応じて料金が段階的に跳ね上がる。処理件数（＝Zap起動回数）を先に見積もってからプランを選ぶ必要がある
    source: https://zapier.com/pricing
    verifiedAt: 2026-09-13
pitfalls:
  - 「タスク数」を処理件数だと誤解し見積もりが外れる。課金対象はZapの起動回数であり、1回のZapで複数レコードをまとめて処理しても1タスクで済む場合がある
  - 無料プランの15分ポーリングに気づかず、Webhookトリガー前提で設計して遅延に驚く
  - Zap内の条件分岐・エラー処理が増えるとノーコードのまま保守が難しくなり、結局Code by Zapierでコードを書くことになる
cost:
  model: free-tier
  note: 無料プランは100タスク/月・2ステップZapまで。課金が跳ねるのはタスク数（Zapの起動回数）で、処理件数そのものではない
  source: https://zapier.com/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: n8n
    difference: n8nは自己ホストなら無料でワークフロー実行回数の上限がない。Zapierはフルマネージドで対応アプリ数が多く画面も平易だが、タスク課金と無料プランの2ステップ制限がある。運用を任せたいならZapier、コストを抑えて自前運用できるならn8n
  - tool: google-apps-script
    difference: GASはGoogleサービス内の処理を無料でコードで書ける。Zapierはコード不要で数千のSaaSに同じ手順で接続できるが実行はタスク課金になる。Google内で完結しコードが書けるならGAS、多様なSaaSをノーコードでつなぐならZapier
verdict: 複数SaaSの連携をノーコードで素早く組みたい場合の第一候補。無料プランの100タスク/月・2ステップ制限・15分ポーリングのいずれかに触れたら、有料プランへの移行かn8nなど自己ホストの選択肢への切り替えを検討する
updatedAt: 2026-09-13
---

「トリガー→アクション」をZapと呼ぶ単位で画面上に組む自動化サービスで、対応アプリの数と設定の平易さが最大の強みである。すべてフルマネージドで、サーバーの運用は不要である。

利用者が最初に当たるのは無料プランのタスク数上限（100タスク/月）とZapのステップ制限（2ステップまで）である。通知を送るだけの単純な連携であれば無料でも回るが、複数アクションを連ねたり実行頻度が上がったりした時点で有料プランへの移行を検討することになる。

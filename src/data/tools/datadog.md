---
name: Datadog
aliases: [Datadog APM, Datadog Logs, DD]
category: observability
layer: managed-service
oneLiner: インフラ指標・ログ・APM・エラーを一つの画面に集約する、ホスト課金の SaaS 監視基盤
officialUrl: https://www.datadoghq.com/
docsUrl: https://docs.datadoghq.com/
can: [monitor-metrics, collect-logs, track-errors, visualize-data]
cannot:
  - 費用の事前確定（ホスト数・ログ量・カスタムメトリクス数の 3 軸で変動し、製品ごとに単価が異なる）
  - 無料プランでの履歴分析（Free はメトリクス保持 1 日・5 ホストまで）
  - 自前サーバーへのホスティング（SaaS のみ。監視データは Datadog 側に置く）
  - 個人の小規模プロジェクトの低コスト運用（ホスト 1 台でも Pro $15 / 月から。APM を足すとホストあたり $31 / 月が加算）
constraints:
  - label: インフラ監視のホスト単位課金
    value: Pro $15 / ホスト / 月、Enterprise $23 / ホスト / 月（年契約。月次のオンデマンドはそれぞれ $18、$27）
    impact: サーバーを足すたびに固定費が増える。オートスケールで台数が揺れる環境では、月の最大台数ではなく時間按分の数え方を料金ページで確認する
    source: https://www.datadoghq.com/pricing/
    verifiedAt: 2026-09-13
  - label: 無料プランの範囲
    value: 5 ホストまで、メトリクス保持 1 日
    impact: 「昨日と比べる」すら不可能で、評価用途に限られる。トライアル終了後に Free に落ちると履歴が見えなくなる
    source: https://www.datadoghq.com/pricing/
    verifiedAt: 2026-09-13
  - label: ログ課金の二段構え
    value: 取り込み $0.10 / GB ＋ インデックス $1.70 / 100 万イベント（保持 15 日・年契約。オンデマンドは $2.55）
    impact: 「全部インデックスする」と請求が読めなくなる。取り込みだけ行い、検索対象を除外フィルタで絞るのが前提の設計
    source: https://www.datadoghq.com/pricing/
    verifiedAt: 2026-09-13
  - label: カスタムメトリクスの無償枠
    value: Pro 100 個 / ホスト、Enterprise 200 個 / ホスト。「メトリクス名 ＋ タグ値の組み合わせ」1 つで 1 個と数える
    impact: タグにユーザー ID などを付けると 1 つのメトリクス名から数万個に膨らみ、超過分（100 個単位）が課金される
    source: https://docs.datadoghq.com/account_management/billing/custom_metrics/
    verifiedAt: 2026-09-13
  - label: メトリクスの保持期間
    value: 15 か月（有料プラン）
    impact: 年単位の傾向比較ができる。Prometheus 既定の 15 日と比べたときの、費用と引き換えに得る主な価値
    source: https://docs.datadoghq.com/developers/guide/data-collection-resolution-retention/
    verifiedAt: 2026-09-13
  - label: API のレート制限
    value: イベント送信 250,000 件 / 分 / 組織。メトリクスとログの送信 API はレート制限なし。超過時は 429
    impact: メトリクス送信は止められないが、その分カスタムメトリクス数の課金で跳ねる。イベント API をログ代わりに使う設計は 25 万件 / 分で頭打ち
    source: https://docs.datadoghq.com/api/latest/rate-limits/
    verifiedAt: 2026-09-13
pitfalls:
  - タグに一意性の高い値（ユーザー ID、リクエスト ID、コンテナ ID）を付けるとカスタムメトリクス数が爆発し、請求が桁で跳ねる
  - ログを取り込んだまま全件インデックスすると、ログ課金がホスト課金を上回る。まず除外フィルタと保持期間を決める
  - コンテナやサーバーレスは「ホスト」とは別の単位で課金される製品がある。製品ごとに課金単位を料金表で確認する
  - 年契約とオンデマンドで単価が 2 割前後違う。コミット量を下回れば無駄、上回れば割高になるため、月次の使用量を見て契約量を調整する
cost:
  model: usage-based
  note: 基本はホスト数 × 導入製品数（Infrastructure、APM、Logs …）の月額で、年契約とオンデマンドで単価が異なる。ログの取り込み・インデックス量とカスタムメトリクス数が量に比例して跳ねる部分で、見積もりが外れやすい
  source: https://www.datadoghq.com/pricing/
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: prometheus-grafana
    difference: Prometheus + Grafana は無償だが、保持・冗長化・アラート経路・アップグレードを自分で運用する。Datadog はそれを丸ごと買い、ホスト単位で払う。運用者がいないなら Datadog、費用を抑えたいなら Prometheus + Grafana
  - tool: sentry
    difference: Sentry はエラー追跡に特化し、無料枠で一人から始められる。Datadog にもエラー追跡はあるが、それだけのために導入する価格ではない。例外だけ見たいなら Sentry
verdict: 監視の運用担当がおらず、インフラ・ログ・APM を一つの画面で見たい組織では第一候補。ホスト数が少なく費用に敏感な個人・小規模チームは避け、Prometheus + Grafana（メトリクス）と Sentry（例外）の組み合わせへ。導入するなら、ログのインデックス対象とカスタムメトリクスのタグ設計を最初に決める
updatedAt: 2026-09-13
---

ホストにエージェントを入れてインフラ指標を集め、ログ・トレース・エラー・RUM・合成監視まで同じ画面と同じタグで横断できる。相関して原因を追える点が最大の価値で、個々の機能単体では専用ツールに劣ることもある。

最初に当たる制約はホスト単位の月額で、次にログとカスタムメトリクスの従量部分である。前者は台数から計算できるが、後者はタグ設計とインデックス方針で数倍変わる。導入時に「何をインデックスしないか」「タグに何を付けないか」を決めないと、請求が予測できない。

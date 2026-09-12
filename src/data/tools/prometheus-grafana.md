---
name: Prometheus + Grafana
aliases: [Prometheus, Grafana, PromQL, Grafana Cloud]
category: observability
layer: tool
oneLiner: 時系列メトリクスを収集する Prometheus と、可視化・通知を担う Grafana の定番の組み合わせ
officialUrl: https://prometheus.io/
docsUrl: https://prometheus.io/docs/introduction/overview/
can: [monitor-metrics, visualize-data, collect-logs]
cannot:
  - 例外のスタックトレース収集とイシュー管理（数値の時系列しか扱わない。エラー追跡は Sentry 等の領域）
  - 課金計算など 100% の正確さが必要な集計（公式が「不適」と明記）
  - 1 台の Prometheus だけでの長期保存と冗長化（ローカルストレージは複製されず、既定 15 日で消える）
  - Prometheus 単体でのログ収集（ログは Loki など別コンポーネントを追加して Grafana で束ねる）
  - 運用ゼロでの利用（自前で立てる場合、サーバー・ディスク・アップグレードをすべて自分で持つ）
constraints:
  - label: ローカルストレージの既定保持期間
    value: 15 日（--storage.tsdb.retention.time の既定 15d。サイズ上限 retention.size は既定 0 = 無効）
    impact: 「先月と比較したい」は既定では不可能。長期保存は remote write で外部ストレージ（Thanos、Mimir、Grafana Cloud 等）へ送る設計にする
    source: https://prometheus.io/docs/prometheus/latest/storage/
    verifiedAt: 2026-09-13
  - label: ローカルストレージの冗長性
    value: 1 ノード。クラスタ化も複製もされない
    impact: ディスクやノードの障害でデータが消える。単一ノードの DB と同じ扱いで、耐久性が要るなら外部ストレージへ
    source: https://prometheus.io/docs/prometheus/latest/storage/
    verifiedAt: 2026-09-13
  - label: 取得（スクレイプ）間隔の既定
    value: scrape_interval 1m、scrape_timeout 10s、evaluation_interval 1m
    impact: 既定では 1 分粒度で、数秒の瞬間的なスパイクは見えない。間隔を短くすると系列あたりのサンプル数と保存量が比例して増える
    source: https://prometheus.io/docs/prometheus/latest/configuration/configuration/
    verifiedAt: 2026-09-13
  - label: 精度の前提
    value: 100% の正確さが必要な用途（リクエスト単位の課金など）には不適と公式が明記
    impact: 収集データは欠損しうる前提の「監視用」であり、請求や監査の根拠にしてはならない。会計用途は別系統で集計する
    source: https://prometheus.io/docs/introduction/overview/
    verifiedAt: 2026-09-13
  - label: Grafana Cloud 無料枠
    value: メトリクス 10k アクティブ系列 / 月、ログ・トレース各 50 GB / 月、保持 14 日、Grafana ユーザー 3 人
    impact: 自前運用を避けて Grafana Cloud に載せる場合、系列数 1 万が最初の壁。Pro は $19 / 月 + 1k 系列あたり $6.50 から
    source: https://grafana.com/pricing/
    verifiedAt: 2026-09-13
  - label: Grafana のライセンス
    value: AGPL v3（Prometheus は Apache 2.0）
    impact: Grafana を改変してネットワーク越しに提供する場合、改変部分のソース公開義務が生じる。組み込み配布には注意
    source: https://github.com/grafana/grafana/blob/main/LICENSE
    verifiedAt: 2026-09-13
pitfalls:
  - ラベルにユーザー ID やリクエスト ID など値の種類が多いものを付けると、系列数が爆発してメモリを食い尽くす（カーディナリティ問題）
  - Prometheus はプル型で、監視対象へ HTTP で取りに行く。NAT の内側や短命なバッチジョブは直接スクレイプできず、Pushgateway などの迂回が要る
  - Prometheus 単体は記録するだけで通知しない。Alertmanager か Grafana Alerting を別途設定するまで「落ちたら知らせる」は成立しない
  - Grafana のダッシュボードを画面上だけで作ると、環境の再構築時に消える。JSON をリポジトリに置くかプロビジョニングで管理する
cost:
  model: free
  note: 両者とも OSS で無償（Prometheus は Apache 2.0、Grafana は AGPL v3）。費用はサーバーとディスクとして発生し、系列数と保持期間の積で決まる。Grafana Cloud を使う場合は無料枠を超えた時点で Pro $19 / 月から
  source: https://github.com/prometheus/prometheus/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: datadog
    difference: Datadog は収集・保存・可視化・通知を SaaS で一括提供し、メトリクス保持 15 か月と運用不要を得る代わりにホスト単位で課金される。Prometheus + Grafana は無償だが保持・冗長化・アップグレードを自分で担う
  - tool: sentry
    difference: Sentry はアプリの例外をスタックトレース付きで追う。Prometheus + Grafana は「いつ・どれだけ」を数値で示し、「どのコードで」は示さない。両者は補完関係にあり、置き換えではない
verdict: 自前のサーバーや Kubernetes のメトリクス監視では事実上の標準で、費用をかけずに始めるなら第一候補。15 日を超える保持、冗長化、ログの集約が必要になった時点で外部ストレージ（Grafana Cloud、Thanos、Mimir）を足すか、運用を丸ごと買う Datadog へ。例外追跡は Sentry を併用する
updatedAt: 2026-09-13
---

Prometheus は監視対象から HTTP で数値を定期的に取りに行き（プル型）、ラベル付きの時系列として保存する。PromQL で集計し、Alertmanager 経由で通知する。Grafana はその時系列をダッシュボードにする可視化ツールで、Prometheus 以外のデータソース（PostgreSQL、Loki、CloudWatch 等）にもつながる。両者は別プロジェクトだが、組み合わせて使うのが通例である。

最初に当たる制約は「既定 15 日で消える」「1 ノードで複製されない」というローカルストレージの性質である。Prometheus 自身がこれを「単一ノードの DB として扱え」と明記しており、長期保存と耐久性は remote write の先に置く設計が前提になる。次に当たるのはラベルのカーディナリティで、これは保持期間の設定では解決しない。

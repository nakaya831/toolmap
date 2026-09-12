---
name: Sentry
aliases: [sentry.io, Sentry SDK, セルフホスト Sentry]
category: observability
layer: managed-service
oneLiner: アプリで起きた例外をスタックトレース付きで集め、発生源を特定するエラー追跡サービス
officialUrl: https://sentry.io/
docsUrl: https://docs.sentry.io/
can: [track-errors, monitor-metrics, collect-logs]
cannot:
  - サーバーの CPU・メモリ・ディスクなどインフラ指標の監視（ホストにエージェントを置く製品ではない）
  - 無料プランでの複数人利用（Developer プランは 1 ユーザー）
  - 月 5,000 件を超えるエラーの無料での受信（超過分は受け付けられず捨てられる）
  - 30 日より前のイベントの参照（Developer プラン。Team でも最長 90 日）
  - セルフホスト版を Sentry と競合するサービスとして他者に提供すること（FSL ライセンス）
constraints:
  - label: 無料プランのエラーイベント数
    value: 5,000 errors / 月（Developer）。ほかに 5M spans、50 replays、1 ユーザー、cron・uptime モニタ各 1
    impact: 例外を投げ続けるループが 1 つあると数時間で月枠を使い切り、以降のエラーは受け付けられない。SDK 側でサンプリングと重複抑制を入れる
    source: https://sentry.io/pricing/
    verifiedAt: 2026-09-13
  - label: データ保持期間
    value: 30 日（Developer）、最長 90 日（Team）
    impact: 過去のエラー傾向を長期で追う用途には使えない。必要なら外部にエクスポートする
    source: https://sentry.io/pricing/
    verifiedAt: 2026-09-13
  - label: イベント 1 件のペイロード上限
    value: 圧縮 200 KB / 展開後 1 MB。超過は 413 で即時破棄
    impact: 巨大なリクエストボディやコンテキストを添付すると、エラーそのものが届かない。添付は別枠（Attachments 1 GB）に載せる
    source: https://docs.sentry.io/concepts/data-management/size-limits/
    verifiedAt: 2026-09-13
  - label: プロジェクトキー単位のレート制限
    value: Business / Enterprise プランのみ設定可。超過したイベントは 429 で落とされる
    impact: Developer / Team では自前でレート制限を設けられず、クォータ消費の抑制は SDK 側のサンプリングとスパイク保護に頼ることになる
    source: https://docs.sentry.io/pricing/quotas/manage-event-stream-guide/
    verifiedAt: 2026-09-13
  - label: スパイク保護の発動条件
    value: 直近 7 日間の毎時データから閾値を算出し、超過分を破棄。閾値はスパイク中 1 時間ごとに再計算
    impact: 課金の暴発は防げるが、障害時に一番見たいイベントが捨てられる。発動時は Sentry の件数を実数と見なさない
    source: https://docs.sentry.io/pricing/quotas/spike-protection/
    verifiedAt: 2026-09-13
  - label: セルフホスト版のライセンス
    value: FSL-1.1-Apache-2.0。競合サービスとしての提供を禁止し、各リリースは 2 年後に Apache 2.0 へ移行
    impact: 自社内でのセルフホストは可能だが、Sentry 互換の監視サービスを他者に提供する用途には使えない
    source: https://github.com/getsentry/sentry/blob/master/LICENSE.md
    verifiedAt: 2026-09-13
pitfalls:
  - ソースマップをアップロードしないと、minify された JavaScript のスタックトレースが読めず、発生箇所が分からない
  - 同じ例外を毎回送るとクォータを食う。SDK の sampleRate や beforeSend でノイズ（ブラウザ拡張の例外、ネットワーク断）を捨てる
  - 環境（development / staging / production）を分けないと、開発中のエラーが本番のクォータを消費する
  - リクエストボディやユーザー情報が既定で送られる設定がある。個人情報の送信有無とデータスクラビングを最初に確認する
cost:
  model: free-tier
  note: Developer プランは無料だが 1 ユーザー・5,000 errors / 月。Team は $26 / 月から（年払い）。課金が跳ねるのはエラー件数より Span（トレース）と Replay で、Logs / Metrics は超過 $0.50 / GB
  source: https://sentry.io/pricing/
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: datadog
    difference: Datadog はインフラ・ログ・APM・エラーを一つに集約するがホスト単位課金で高い。エラー追跡だけが目的なら Sentry のほうが安く、SDK も軽い
  - tool: prometheus-grafana
    difference: Prometheus + Grafana は数値の時系列（メトリクス）を扱い、例外のスタックトレースは収集しない。「落ちたか」は Prometheus、「なぜ落ちたか」は Sentry
verdict: 「ユーザー側で起きた例外を、どのコードのどの行で起きたかまで知りたい」では第一候補。無料枠で一人で始められる。インフラ指標やログの集約まで一つで賄いたい場合は Datadog、費用をかけずメトリクスだけ見たい場合は Prometheus + Grafana へ。ただしどちらも例外追跡の代替にはならない
updatedAt: 2026-09-13
---

アプリケーションに SDK を組み込み、発生した例外をスタックトレース・リクエスト情報・ブレッドクラム（直前の操作履歴）とともに送信する。同種の例外は「イシュー」にまとめられ、初回・最終発生、影響ユーザー数、リリースとの対応が追える。対応言語は JavaScript、Python、Go、Java、モバイルまで広い。

最初に当たる制約は無料プランの「5,000 errors / 月」で、次が「1 ユーザー」である。前者はバグ 1 件で使い切ることがあり、SDK 側のサンプリングとフィルタが前提になる。チームで見るには Team プランが必要になり、そこからは Span と Replay の消費量が費用を決める。

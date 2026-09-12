---
name: AWS Lambda
aliases: [Lambda, Lambda 関数, AWS サーバーレス]
category: infrastructure
layer: managed-service
oneLiner: サーバー管理なしでコードをイベント駆動・従量課金で実行するAWSの基盤
officialUrl: https://aws.amazon.com/lambda/
docsUrl: https://docs.aws.amazon.com/lambda/latest/dg/welcome.html
can: [run-short-function, run-on-event, run-on-schedule, run-batch, expose-http-api]
cannot:
  - 15分を超える単一の実行（Lambda Managed Instances の非同期呼び出しでも 90分が上限）
  - WebSocket サーバーなど常時接続を保持するプロセスの運用（API Gateway 等の別サービスが前提）
  - 6 MB を超えるリクエスト／レスポンスの同期受け渡し（S3 を経由させる）
  - 呼び出し間での状態の保持（/tmp は再利用されることがあるが保証されない）
  - AWS アカウント・IAM 権限設計なしでの利用（GAS のような認証済み環境ではない）
constraints:
  - label: 1回の実行時間の上限
    value: 900秒（15分）/ 実行。Lambda Managed Instances の非同期・イベントソース呼び出しのみ 5,400秒（90分）
    impact: 15分で終わらない処理は分割して連鎖させるか、Step Functions・ECS・バッチ基盤へ移す
    source: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    verifiedAt: 2026-09-13
  - label: メモリ割り当ての範囲
    value: 128 MB〜10,240 MB（1 MB 刻み）。1,769 MB で 1 vCPU 相当
    impact: CPU はメモリに比例して割り当てられる。CPU が足りないときはメモリを増やすしかなく、その分 GB秒課金も上がる
    source: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    verifiedAt: 2026-09-13
  - label: 同時実行数（アカウント・リージョン単位）
    value: 既定 1,000（引き上げ申請可。新規アカウントはさらに低い値から始まる）
    impact: 超えた呼び出しはスロットリングされる。API Gateway の既定 10,000 req/s と釣り合わないため、負荷試験で先に確認する
    source: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    verifiedAt: 2026-09-13
  - label: デプロイパッケージのサイズ
    value: 50 MB（zip、直接アップロード時）、250 MB（展開後・レイヤー込み）。コンテナイメージは 10 GB
    impact: 依存が重い言語（Python の ML ライブラリ等）は zip の 250 MB に収まらないことが多く、コンテナイメージ方式に切り替える
    source: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    verifiedAt: 2026-09-13
  - label: 呼び出しペイロードのサイズ
    value: 同期 6 MB（リクエスト・レスポンス各）、非同期 1 MB、ストリーミング応答 200 MB
    impact: 大きなファイルは直接渡さず S3 に置いてキーだけ渡す。非同期は 1 MB とさらに小さい
    source: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    verifiedAt: 2026-09-13
  - label: 無料枠と課金単位
    value: 毎月 100万リクエストと 40万 GB秒が無料。超過分は $0.20 / 100万リクエスト、$0.0000166667 / GB秒（1 ms 単位で切り上げ）
    impact: 課金はメモリ×実行時間の積で決まる。常時トラフィックのある API では、同等の常駐サーバーより高くなることがある
    source: https://aws.amazon.com/lambda/pricing/
    verifiedAt: 2026-09-13
pitfalls:
  - コールドスタート。しばらく呼ばれていない関数の初回呼び出しは初期化に時間がかかる。レイテンシ要件が厳しい API では Provisioned Concurrency（有料）が必要になる
  - RDB へ直接接続すると同時実行数分の接続が張られ、DB 側の接続上限を先に枯渇させる。RDS Proxy かコネクションプーラーを挟む
  - 非同期呼び出しは失敗時に自動で再試行される。処理が冪等でないと二重実行になる
  - 料金は関数単体で完結しない。API Gateway・CloudWatch Logs・データ転送が別建てで加算され、ログ出力を絞らないと Logs の料金が関数本体を超える
cost:
  model: usage-based
  note: 毎月 100万リクエスト・40万 GB秒までは無料で、超過分がリクエスト数とメモリ×実行時間で課金される。跳ねるのはメモリを大きくした関数を高頻度で回したときと、周辺サービス（API Gateway、Logs）の分
  source: https://aws.amazon.com/lambda/pricing/
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: cloudflare-workers
    difference: Workers はコールドスタートがほぼなくエッジで動くが、CPU 時間（有料でも 5分）とメモリ 128 MB が小さい。Lambda はメモリ 10 GB・15分まで使え、AWS の他サービスとの接続が厚い
  - tool: google-apps-script
    difference: GAS は Google サービスへの認証が不要で無料だが 6分・90分/日の上限がある。Lambda は上限が大きく従量課金だが、Google 認証と AWS の権限設計を自前で行う
  - tool: render
    difference: Render は常駐プロセスを動かす基盤で、稼働時間で課金される。Lambda はリクエスト単位の課金で、アクセスが散発的なら安く、常時トラフィックがあるなら Render のほうが安い
verdict: イベント駆動・散発的なトラフィックの処理では第一候補。Webhook 受信、S3 へのアップロードを契機とする変換、日次バッチの分割実行に向く。15分を超える処理、常時接続の保持、AWS 以外に閉じた構成が必要な場合は避け、常駐サービス（Render 等）かバッチ基盤へ
updatedAt: 2026-09-13
---

AWS の関数実行サービスで、S3・SQS・EventBridge・API Gateway など 200 を超える AWS サービスのイベントを直接受けられる点が最大の利点である。zip かコンテナイメージでコードを置き、呼び出しがあった分だけ課金される。

利用者が最初に当たるのは「15分」の実行時間上限と、それより先に「メモリ＝CPU」の割り当てモデルである。CPU が足りない処理はメモリを増やして解決するため、料金の見積もりはメモリと実行時間の積で考える必要がある。

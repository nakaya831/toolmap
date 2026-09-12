---
name: Render
aliases: [Render.com, レンダー]
category: infrastructure
layer: managed-service
oneLiner: Git連携でWebサービス・常駐ワーカー・DBを運用するHeroku型のPaaS
officialUrl: https://render.com/
docsUrl: https://render.com/docs
can: [host-web-app, run-long-process, run-containers, run-on-schedule, host-static]
cannot:
  - 無料インスタンスでの常時稼働（15分無通信でスリープし、復帰に約 1分かかる）
  - 無料での Cron Job・Background Worker・Private Service・永続ディスク（有料コンピュートのみ）
  - 永続ディスクを付けたサービスの水平スケールとゼロダウンタイムデプロイ
  - 無料 Postgres の 30日を超える利用（作成から 30日で失効する）
  - リクエスト単位の従量課金（インスタンスは秒割りだが稼働中は常に課金。Lambda 型ではない）
constraints:
  - label: 無料インスタンスのスリープ
    value: 15分間リクエストがないと停止し、次のリクエストで再起動に約 1分かかる
    impact: Webhook の受信先や、初回表示が遅いと困るサイトには無料インスタンスを使えない。有料コンピュート（$7 / 月から）へ
    source: https://render.com/docs/free
    verifiedAt: 2026-09-13
  - label: 無料インスタンスの割当と制限
    value: 750 インスタンス時間 / 月 / ワークスペース。Cron Job・Background Worker・Private Service・永続ディスク・複数インスタンスへのスケールは不可
    impact: 無料で常時起動できるのは実質 1 サービス分（744時間 / 月）。無料 Web サービスを 2 つ以上動かすと月内に止まる
    source: https://render.com/docs/free
    verifiedAt: 2026-09-13
  - label: 有料コンピュートの価格
    value: 512 MB RAM・1 CPU 未満で $7 / 月、2 GB・1 CPU で $25 / 月、4 GB・2 CPU で $85 / 月（秒割り）。無料は 512 MB RAM
    impact: 常時稼働の月額が固定でかかる。アクセスがほぼないサービスでも $7 / 月は発生する
    source: https://render.com/pricing
    verifiedAt: 2026-09-13
  - label: ワークスペースプランと帯域の込み分
    value: Hobby $0 / 月（サービス 25 個まで、帯域 5 GB / 月、ビルド 500 分 / 月）、Pro $25 / 月（帯域 25 GB / 月、ビルド 1,000 分 / 月）。帯域超過は $0.15 / GB
    impact: Hobby の 5 GB / 月は画像を配るサイトならすぐ超える。ビルド分数も Hobby は 500 分で、頻繫な push とプレビューで消費する
    source: https://render.com/pricing
    verifiedAt: 2026-09-13
  - label: Cron Job の制約
    value: 1 回の実行は 12時間で強制停止。同一ジョブの同時実行は 1 つ（重なると次回が遅延）。スケジュールは UTC。最低 $1 / 月 / ジョブ
    impact: 日本時間で組むときは 9時間ずらす。長いバッチは 12時間で切られる前に分割する
    source: https://render.com/docs/cronjobs
    verifiedAt: 2026-09-13
  - label: 無料 Postgres の期限と容量
    value: 作成から 30日で失効。容量 1 GB
    impact: 検証以外では無料 DB を使わない。本番は有料 Postgres（$6 / 月から）か外部 DB へ
    source: https://render.com/docs/free
    verifiedAt: 2026-09-13
pitfalls:
  - 無料 Web サービスの復帰約 1分は、Webhook の送信元がタイムアウトして取りこぼす。Webhook 受信は有料インスタンスか関数基盤へ
  - 無料 Postgres は 30日で消え、データも失われる。期限を忘れて本番データを置くと事故になる
  - インスタンス課金は稼働時間ベースなので、トラフィックがゼロでも月額は固定でかかる。アクセスが散発的なら Lambda / Workers のほうが安い
  - 永続ディスクを付けるとゼロダウンタイムデプロイと水平スケールが無効になる。ファイルは S3 互換ストレージへ出す
cost:
  model: free-tier
  note: Hobby ワークスペースは $0 で無料インスタンス 750時間 / 月・帯域 5 GB・ビルド 500 分。跳ねるのは有料コンピュートを足したとき（512 MB $7 / 月から、秒割り）と、Pro ワークスペース $25 / 月に移るとき。帯域超過は $0.15 / GB
  source: https://render.com/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: vercel
    difference: Vercel はフロントエンドと短時間の関数に特化し、常駐ワーカーや永続ディスクを持てない。Render は常駐プロセス・Cron・DB を月額で運用でき、無料枠も商用利用できる。Next.js のフロントだけなら Vercel、バックエンド込みなら Render
  - tool: aws-lambda
    difference: Lambda はリクエスト単位の従量課金で、アクセスが散発的なら Render の固定月額より安い。Render は常駐・WebSocket・15分超の処理が動き、AWS の権限設計が要らない
  - tool: docker
    difference: Docker はコンテナを動かす道具で、動かす場所と運用は自分で持つ。Render はその Dockerfile を渡すだけでビルド・配信・再起動・TLS を引き受ける
verdict: Heroku 型の「Git に push したらバックエンドごと動く」体験を安く手に入れる用途では第一候補。常駐ワーカー・WebSocket・Cron・Postgres を一つの画面で揃えられる。避けるのは、アクセスが散発的で固定月額が無駄になる場合（Lambda / Workers へ）と、無料枠で本番運用しようとする場合（スリープと 30日 DB 失効で破綻する）
updatedAt: 2026-09-13
---

Heroku の後継として使われることが多い PaaS で、Git リポジトリか Dockerfile を渡すと、Web サービス・Background Worker・Cron Job・Postgres・Key Value（Redis 互換）・静的サイトを同じワークスペースで動かせる。課金は「ワークスペースプラン（固定）＋コンピュート（秒割り）＋帯域などの従量」の三層である。

利用者が最初に当たるのは無料インスタンスのスリープである。15分で止まり復帰に約 1分かかるため、無料で本番相当のサービスを動かす道はない。次に当たるのが無料 Postgres の 30日失効で、検証のつもりで置いたデータが消える。

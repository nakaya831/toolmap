---
name: Cloudflare Workers
aliases: [Workers, CF Workers]
category: infrastructure
layer: managed-service
oneLiner: V8アイソレートで動く、Cloudflareのエッジサーバーレス実行基盤
officialUrl: https://workers.cloudflare.com/
docsUrl: https://developers.cloudflare.com/workers/
can: [run-short-function, run-on-schedule, expose-http-api, queue-messages, store-key-value]
cannot:
  - Node.js の child_process・cluster・worker_threads・sqlite などプロセス／OSレベルAPIの利用（nodejs_compat を有効にしてもスタブのみで実際には動作しない）
  - インバウンドの生 TCP／UDP 接続の待ち受け（connect() は発信専用で、HTTP と WebSocket 以外のプロトコルでサーバーを公開できない）
  - 128 MB を超えるメモリを要する単一処理（isolate ごとの固定上限で、有料プランに上げても引き上げられない）
  - 無料プランで1リクエストあたり50件を超える外部 fetch 呼び出し（有料プランでも既定10,000件、上限1,000万件）
constraints:
  - label: CPU 時間の上限
    value: 無料プラン 10ms／リクエスト。有料プラン(Workers Paid)は既定30秒、設定で最大5分（300秒）。Cron Triggers・Queue コンシューマは間隔に応じ最大15分
    impact: 計測は壁時計時間ではなくCPU時間のため外部APIやKVへの待ち時間はカウントされないが、暗号化や画像処理など計算量の多い同期処理は無料プランでは実質使えない
    source: https://developers.cloudflare.com/workers/platform/limits/
    verifiedAt: 2026-09-13
  - label: メモリの上限
    value: 128 MB（isolate ごとに固定。プランを上げても変更不可）
    impact: 画像変換や大きなJSONのパースなどメモリを要する処理は、課金プランでは解決できず処理の分割や他基盤への切り出しが必要になる
    source: https://developers.cloudflare.com/workers/platform/limits/
    verifiedAt: 2026-09-13
  - label: 無料枠のリクエスト数と超過課金
    value: 無料10万リクエスト/日。有料は月額$5から、月1,000万リクエスト・CPU時間3,000万ミリ秒が込みで、超過は100万リクエストあたり$0.30、CPU時間100万ミリ秒あたり$0.02
    impact: リクエスト課金自体は緩やかだが、CPU時間を多く使う処理を高頻度で回すとCPU時間の超過分がリクエスト課金より先に効いてくる
    source: https://developers.cloudflare.com/workers/platform/pricing/
    verifiedAt: 2026-09-13
  - label: Cron Triggers の登録数
    value: 無料アカウント5個、有料アカウント250個（いずれもアカウント単位の上限）
    impact: 多数の定期ジョブを1アカウントに集約する運用では上限に当たり、複数ジョブを1つのWorker内でルーティングする設計に変える必要がある
    source: https://developers.cloudflare.com/workers/platform/limits/
    verifiedAt: 2026-09-13
  - label: Workers KV の書き込み・値サイズ制限
    value: 同一キーへの書き込みは1秒に1回まで。値は最大25 MiB、キーは最大512バイト。無料プランはアカウント全体で1 GBまで
    impact: カウンタやセッションのように同じキーを高頻度で更新する用途には向かない。頻繁な更新はDurable Objectsや別のインメモリストアに逃がす
    source: https://developers.cloudflare.com/kv/platform/limits/
    verifiedAt: 2026-09-13
  - label: Queues のメッセージサイズと保持期間
    value: 1メッセージ最大128 KB、1バッチ最大100件。保持期間は無料プラン固定24時間、有料プランは最大14日まで設定可
    impact: 大きなペイロードはキューに直接積めず、R2やKVにデータを置いてIDだけを渡す設計にする必要がある
    source: https://developers.cloudflare.com/queues/platform/limits/
    verifiedAt: 2026-09-13
pitfalls:
  - CPU時間は壁時計時間ではなく実処理時間のため、外部APIやKVへの待ち時間は影響しない一方、JSON整形やハッシュ計算のような同期処理だけで無料プランの10msにすぐ到達する
  - Node.js向けに書かれたライブラリ（ネイティブアドオンやfsに依存するもの）をnodejs_compat有効のまま持ち込むと、ビルドは通っても実行時に未実装エラーで落ちることがある
  - Workers KVは同一キーへの書き込みが1秒に1回に制限されるため、アクセスカウンタのような高頻度更新の実装に使うとすぐ頭打ちになる
cost:
  model: free-tier
  note: 無料プランは1日10万リクエスト・CPU時間10ms/回まで。Workers Paidは月額$5からで、含まれる分（月1,000万リクエスト・CPU時間3,000万ミリ秒）を超えると従量課金になる。KV・Queuesなど周辺サービスは別建てで加算される
  source: https://developers.cloudflare.com/workers/platform/pricing/
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: aws-lambda
    difference: Lambdaはメモリを10 GBまで、実行時間を15分（Managed Instancesの非同期は90分）まで確保できるが、リージョン起点でエッジには乗らない。Workersはコールドスタートがほぼなく世界中のエッジで即応するが、メモリ128 MB・CPU時間は有料でも数分と小さい
  - tool: vercel
    difference: Vercelはフレームワーク統合とプレビューデプロイが厚く関数は最大800秒まで動くが、無料のHobbyプランは非商用限定。Workersは無料プランでも商用利用ができ1日10万リクエストまで使えるが、フロントエンドのビルド・デプロイ連携は薄い
  - tool: render
    difference: Renderは常駐プロセスを月額で動かすため、常時接続やバックグラウンドジョブ、大きなメモリを要する処理に向く。Workersは常駐プロセスを持てず、リクエスト単位の短時間処理に特化する
verdict: グローバルなエッジで低レイテンシに応答する軽量なAPIやWebhook処理、静的サイトに付随する薄いバックエンドでは第一候補。CPU時間の大きい計算処理、128 MBを超えるメモリが必要な処理、Node.js資産をそのまま持ち込みたい場合は避け、AWS LambdaやRenderのようなメモリ・実行時間に余裕のある基盤へ
updatedAt: 2026-09-13
---

Cloudflareのグローバルネットワーク上でV8 isolateとしてコードを実行するサーバーレス基盤で、コンテナやVMを起動しないためコールドスタートがほぼ発生しない。HTTPリクエストへの応答のほか、Cron Triggersによる定期実行、Queuesによる非同期処理、KVによるキーバリューストアを同一のWorkerから組み合わせて使える。

利用者が最初に当たるのはCPU時間の上限である。壁時計時間ではなく実際にCPUを使った時間だけが計測されるため外部APIやKVへの待ち時間は影響しないが、無料プランの10msは同期的な計算処理にはすぐ不足する。あわせてメモリが128MBに固定されている点も、Lambdaのようにプランを上げても解決できない制約として先に把握しておく必要がある。

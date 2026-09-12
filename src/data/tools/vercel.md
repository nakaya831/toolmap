---
name: Vercel
aliases: [Vercel Functions, Zeit Now, ヴァーセル]
category: infrastructure
layer: managed-service
oneLiner: Gitに連携し、Next.jsなどのフロントエンドを自動デプロイするホスティング基盤
officialUrl: https://vercel.com/
docsUrl: https://vercel.com/docs
can: [host-static, host-web-app, deploy-automatically, run-short-function, run-on-schedule]
cannot:
  - Hobby（無料）プランでの商用利用（フェアユース規約で非商用・個人利用に限定）
  - 常時起動のバックエンドプロセス（常駐ワーカー、ソケットサーバー）の保持。実行単位は最長 800秒（Hobby は 300秒）の関数
  - 永続ディスクを持つサービスの運用（ファイルは Blob 等の外部ストレージへ）
  - 4.5 MB を超えるリクエスト／レスポンスボディを関数で扱うこと
  - Hobby プランで 1日1回より高頻度な Cron 実行
constraints:
  - label: 帯域（Fast Data Transfer）の込み分
    value: Hobby 100 GB / 月、Pro 1 TB / 月
    impact: 画像・動画の多いサイトは Hobby の 100 GB をすぐ超える。Pro でも超過は従量（$0.15 / GB から）で加算される
    source: https://vercel.com/docs/limits
    verifiedAt: 2026-09-13
  - label: 関数の実行時間上限
    value: Hobby 300秒（既定＝最大）。Pro / Enterprise は既定 300秒、最大 800秒（ベータで 1,800秒）
    impact: 超えると 504（FUNCTION_INVOCATION_TIMEOUT）で切られる。長い処理は Workflows か外部のバッチ基盤へ出す
    source: https://vercel.com/docs/functions/limitations
    verifiedAt: 2026-09-13
  - label: ビルド時間の上限
    value: 45分 / デプロイ（超えるとビルド失敗）
    impact: 数万ページの静的生成はビルドが 45分に届く。ISR で生成を分割する
    source: https://vercel.com/docs/limits
    verifiedAt: 2026-09-13
  - label: 関数のメモリと同時実行
    value: Hobby 2 GB / 1 vCPU（固定）。Pro / Enterprise は最大 4 GB / 2 vCPU。同時実行は自動で最大 30,000（Hobby・Pro）
    impact: メモリを食う処理（画像処理、大きな PDF 生成）は Hobby では収まらない。同時実行は大きいので、DB 側の接続上限のほうが先に詰まる
    source: https://vercel.com/docs/functions/limitations
    verifiedAt: 2026-09-13
  - label: Cron Jobs の最小間隔と精度
    value: Hobby は 1日1回まで、実行時刻は ±59分ずれる。Pro は 1分ごと・分単位の精度。いずれも 100件 / プロジェクト
    impact: Hobby では「毎時」「毎朝 9:00 ちょうど」は組めない。時刻精度が要る定期処理は Pro か他基盤へ
    source: https://vercel.com/docs/cron-jobs/usage-and-pricing
    verifiedAt: 2026-09-13
  - label: デプロイ回数の上限（Hobby）
    value: 100 / 日、100 / 時（Pro は 6,000 / 日）
    impact: push ごとにデプロイする運用で、複数プロジェクトを 1 アカウントに束ねると 1 日の上限に当たる
    source: https://vercel.com/docs/limits
    verifiedAt: 2026-09-13
pitfalls:
  - Hobby で商用サイトを運用すると凍結の対象になる。個人ブログや検証以外は Pro 前提で見積もる
  - Pro は $20 / ユーザー / 月に加えて従量課金が乗り、帯域・関数の Active CPU・画像最適化がそれぞれ別計上になる。トラフィックが増えると請求が読みにくい
  - 関数は既定で単一リージョン（iad1、米国東部）で動く。日本向けサービスは DB との往復遅延を確認し、リージョンを変更する
  - サーバーレス関数から RDB へ直接つなぐと接続が枯渇する。プーラー経由にする
cost:
  model: free-tier
  note: Hobby は無料だが非商用限定。Pro は $20 / ユーザー / 月に従量が乗り、帯域 1 TB 超で $0.15 / GB、Active CPU 4時間 / 月超で $0.128 / 時などが加算される
  source: https://vercel.com/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: github-pages
    difference: GitHub Pages は静的ファイルの配信のみで、サーバー側処理・プレビュー URL・関数がない。Vercel は関数と Cron を同梱するが、無料枠は非商用限定。完全に静的で個人用途なら Pages で足りる
  - tool: render
    difference: Render は常駐プロセス・ワーカー・DB を月額で動かす PaaS。Vercel はフロントエンドと短時間の関数に特化し、常駐ワーカーは持てない。WebSocket や常駐ジョブが要るなら Render
  - tool: cloudflare-workers
    difference: Workers は関数のみでフレームワーク連携やプレビューデプロイの統合は薄いが、無料でも商用利用でき 10万リクエスト/日まで使える。Vercel は Next.js との統合とプレビュー環境が厚い
verdict: Next.js・Astro などのフロントエンドを Git 連携で公開する用途では第一候補。個人・非商用なら Hobby で十分に動く。商用サイトは Pro（$20 / ユーザー / 月＋従量）が前提で、常駐プロセス・永続ディスク・800秒を超える処理が要る場合は避け、Render 等の常駐型 PaaS へ
updatedAt: 2026-09-13
---

Next.js の開発元が運営するホスティングで、Git リポジトリを接続すると push ごとにビルド・デプロイされ、プルリクエストごとにプレビュー URL が発行される。静的ファイルは CDN から、API やサーバーレンダリングは関数（Fluid compute）として実行される。

利用者が最初に当たるのは料金体系である。Hobby は無料だが非商用に限定され、商用は Pro の $20 / ユーザー / 月に帯域・CPU 時間の従量が乗る。次に当たるのが関数の実行時間（Hobby 300秒、Pro 800秒）で、常駐プロセスは持てない。

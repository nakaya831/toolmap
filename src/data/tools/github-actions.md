---
name: GitHub Actions
aliases: [Actions, GHA, GitHub Actions workflow]
category: devops
layer: managed-service
oneLiner: GitHub リポジトリの push・PR・スケジュールで動く CI/CD 実行基盤
officialUrl: https://github.com/features/actions
docsUrl: https://docs.github.com/en/actions
can: [run-ci, deploy-automatically, run-on-schedule, run-batch, orchestrate-pipelines, run-on-event]
cannot:
  - 6時間を超える1ジョブの実行（GitHub ホストランナー。分割するかセルフホストへ）
  - 5分未満の間隔での定期実行と、指定時刻ちょうどの実行保証（高負荷時、特に毎時0分は遅延する）
  - 常駐プロセスの保持（ジョブ終了で実行環境は破棄される。WebSocket サーバーやワーカーは置けない）
  - 私有リポジトリで無料分数（Free 2,000分 / 月）を超える量のビルドを無償で回すこと
  - 公開リポジトリで60日間活動がないままスケジュール実行を継続すること（自動で無効化される）
constraints:
  - label: ジョブ実行時間の上限
    value: 6時間 / ジョブ（GitHub ホストランナー）、5日 / ジョブ（セルフホストランナー）。ワークフロー全体は 35日でキャンセル
    impact: 大規模なビルド・E2E・機械学習の学習は6時間で切られる。ジョブを分割してマトリクスで並列化するか、セルフホストランナーに逃がす
    source: https://docs.github.com/en/actions/reference/limits
    verifiedAt: 2026-09-13
  - label: 無料分数とストレージ（私有リポジトリ）
    value: Free 2,000分 / 月・500 MB、Pro 3,000分・1 GB、Team 3,000分・2 GB、Enterprise Cloud 50,000分・50 GB。公開リポジトリとセルフホストランナーは無料。超過分は Linux $0.006 / 分、Windows $0.010 / 分、macOS $0.062 / 分
    impact: 公開リポジトリなら分数を気にしなくてよい。私有では macOS ランナーが Linux の約10倍の単価で、iOS ビルドのマトリクスは数日で無料枠を使い切る
    source: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
    verifiedAt: 2026-09-13
  - label: schedule トリガーの最短間隔と遅延
    value: 最短 5分間隔。高負荷時（毎時0分など）は遅延する。既定ブランチの最新コミットで実行される。公開リポジトリでは 60日間活動がないと自動で無効化
    impact: 「毎朝 9:00 ちょうど」は保証されない。時刻厳守なら cron から workflow_dispatch を叩く。schedule の定義は既定ブランチにマージされるまで動かない
    source: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows
    verifiedAt: 2026-09-13
  - label: 同時実行ジョブ数
    value: 標準ランナーの合計で Free 20、Pro 40、Team 60、Enterprise 500。マトリクスは1回のワークフロー実行で最大 256 ジョブ。ワークフロー実行のキュー投入は 500 / 10秒
    impact: モノレポで PR ごとに数十ジョブを回すと、Free では他の PR のジョブが待ちに入る。マトリクスの組み合わせは 256 を超えないよう絞る
    source: https://docs.github.com/en/actions/reference/limits
    verifiedAt: 2026-09-13
  - label: GITHUB_TOKEN の API レート制限
    value: 1,000リクエスト / 時 / リポジトリ
    impact: ワークフロー内から GitHub API を大量に叩く処理（全 Issue の走査、大量のコメント投稿）は1時間で枯渇する。GitHub App のトークンに切り替えるか呼び出しを減らす
    source: https://docs.github.com/en/actions/reference/limits
    verifiedAt: 2026-09-13
  - label: アーティファクトとログの保持期間
    value: 既定 90日で自動削除。公開リポジトリは 1〜90日、私有リポジトリは 1〜400日の範囲で変更可
    impact: ビルド成果物やテストレポートを長期保管する場所としては使えない。必要なものは Releases かオブジェクトストレージへ書き出す
    source: https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization
    verifiedAt: 2026-09-13
pitfalls:
  - schedule だけに頼ると、ワークフローが既定ブランチに入るまで一度も動かず、動いても時刻がずれる。定期処理の「動いた／動かなかった」を外から監視する
  - fork からの Pull Request には secrets が渡されない。外部貢献者の CI で認証が要るステップは失敗する前提で分ける
  - ジョブ間でファイルシステムは共有されない。ビルド成果物は artifact 経由で受け渡す。ジョブを細かく分けるほど転送時間が増える
  - サードパーティの Action をブランチ名（@main）で参照すると、上流の変更や乗っ取りで壊れる。コミット SHA で固定する
cost:
  model: free-tier
  note: 公開リポジトリとセルフホストランナーは無料。私有リポジトリは Free 2,000分 / 月を超えると課金され、Linux $0.006 / 分に対し macOS は $0.062 / 分で跳ねる。Windows・macOS のジョブが分数消費の主因になる
  source: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: cron
    difference: cron は自分のマシンで1分間隔・時刻厳守で起動できるが、マシンの運用と監視が必要。GitHub Actions はマシン不要で YAML に書くだけだが、最短5分間隔で遅延があり、実行環境は毎回作り直される
  - tool: google-apps-script
    difference: GAS は Google サービスへの認証なしアクセスが強みで、1実行6分・トリガー合計90分 / 日の上限がある。GitHub Actions は6時間 / ジョブで npm 等を自由に使えるが、Google への認証は自前で設定する
  - tool: n8n
    difference: n8n は SaaS 連携を画面で組み、失敗した実行の記録と再実行を持つ。GitHub Actions はコードのビルド・テスト・デプロイが本業で、SaaS 連携は API を自分で書く。開発リポジトリに紐づく処理なら Actions、業務データの連携なら n8n
verdict: GitHub にコードを置いているなら、テスト・ビルド・デプロイの自動化では第一候補。公開リポジトリなら無料で上限も緩い。避けるのは、時刻厳守の定期実行（schedule は遅延する）、6時間を超える処理、常駐プロセス、そして私有リポジトリでの macOS ビルドの大量実行（分数課金が跳ねる）
updatedAt: 2026-09-13
---

GitHub に組み込まれた CI/CD 基盤で、リポジトリ内の YAML に「いつ・どの環境で・何を実行するか」を書くと、push・Pull Request・スケジュール・手動などのイベントで GitHub 管理の仮想マシンが起動して実行する。公開リポジトリでは無料で使えるため、オープンソースの CI の事実上の標準になっている。

最初に当たる制約は、私有リポジトリでの無料分数（Free 2,000分 / 月）と、schedule トリガーの精度である。前者は Linux だけなら余裕があるが、macOS が混ざると単価が約10倍になる。後者は「毎朝9時」のつもりで書いても遅延し、既定ブランチにマージされるまで動かず、公開リポジトリでは60日放置で止まるという三重の落とし穴がある。

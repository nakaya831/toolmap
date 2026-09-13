---
name: GitLab
aliases: [GitLab.com, GL]
category: devops
layer: managed-service
oneLiner: リポジトリ管理からCI/CDまでを一体化したDevOpsプラットフォーム
officialUrl: https://about.gitlab.com/
docsUrl: https://docs.gitlab.com/
can: [version-control, run-ci, deploy-automatically]
cannot:
  - Free プランの私有トップレベル名前空間に6人目以降のメンバーを追加すること（5人を超えると読み取り専用になる）
  - Free プランの月400分を超えて共有RunnerでCI/CDジョブを追加費用なしで走らせ続けること
  - 1プロジェクトで10 GiBを超えるリポジトリ（LFS込み）を追加費用なしで保持すること
  - 1パイプラインで500ジョブ超、または1プロジェクト・グループあたり11件目以降のパイプラインスケジュールを設定すること
constraints:
  - label: Free プランのCI/CD compute minutes上限
    value: 400分 / 月（GitLab.com の Free namespace、共有Runner使用分）
    impact: 共有Runnerでのジョブ実行が主な消費源で、頻繁なCIやマトリクスビルドはすぐ枯渇する。自己ホストRunnerに切り替えれば消費されない
    source: https://docs.gitlab.com/ci/pipelines/compute_minutes/
    verifiedAt: 2026-09-13
  - label: Free プランの私有名前空間のユーザー数上限
    value: 5人まで（トップレベル私有namespace。グループ・サブグループ・プロジェクトを横断してユニークカウント）
    impact: 超過すると名前空間全体がリポジトリ・LFS・パッケージ・レジストリへの書き込み不可の読み取り専用状態になる
    source: https://docs.gitlab.com/user/free_user_limit/
    verifiedAt: 2026-09-13
  - label: プロジェクトあたりのストレージ上限
    value: 10 GiB（Free tier namespace内の各プロジェクト、Git LFS込み）
    impact: 上限を超えたプロジェクトは読み取り専用になりpushできなくなる。動画やビルド成果物を直接コミットする運用では早期に到達する
    source: https://docs.gitlab.com/user/storage_usage_quotas/
    verifiedAt: 2026-09-13
  - label: パイプライン・ランナーの上限
    value: 1パイプラインあたり最大500ジョブ、パイプラインスケジュール10件、登録ランナー50件（いずれもプロジェクト/グループ単位）
    impact: cronジョブ代わりに多数のスケジュールをGitLab CI単体で管理しようとすると10件で頭打ちになる
    source: https://docs.gitlab.com/user/gitlab_com/
    verifiedAt: 2026-09-13
  - label: ジョブ成果物（artifacts）のサイズと保持期間
    value: 1ジョブあたり最大1 GB（圧縮後）、既定保持期間30日
    impact: テストレポートやビルド成果物を長期保管する場所には使えず、必要なら別のストレージへ書き出す設計にする
    source: https://docs.gitlab.com/user/gitlab_com/
    verifiedAt: 2026-09-13
pitfalls:
  - 私有namespaceのユーザー数はグループ・サブグループ・プロジェクト全体でユニークカウントされるため、意図せず5人を超えて読み取り専用化することがある
  - compute minutesは共有Runner使用時のみ消費される仕組みを知らず、自己ホストRunnerに切り替えれば無償で回避できる点に気づかないまま有料プランへ移行してしまう
  - パイプラインスケジュール10件の上限に、定期バッチ処理をすべてGitLab CI側だけで賄おうとして到達する
cost:
  model: free-tier
  note: Free枠はCI/CD 400分/月・ストレージ10 GiB/プロジェクト・私有namespaceのユーザー5人までが上限。超えると追加compute minutesの購入かPremium/Ultimateへの移行が必要になる。両プランの具体的な月額は料金ページ（about.gitlab.com/pricing/）がクローラーからのアクセスを拒否しており本稿では確認できなかった
  source: https://docs.gitlab.com/ci/pipelines/compute_minutes/
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: github
    difference: GitHubはホスティングに特化しCI/CDはGitHub Actionsという別サービスが担う。GitLabはリポジトリ・CI/CD・Issue・コンテナレジストリを単一プラットフォームに統合し、自己ホストへの移行パスも用意する。無料枠のCI/CD分数はGitHub Actions（私有リポジトリで2,000分/月）のほうがGitLab Free（400分/月）より大きい
  - tool: github-actions
    difference: GitHub ActionsはGitHub上のCI/CD機能単体で、リポジトリホスティングはGitHub本体が担う。GitLabはリポジトリ・CI/CD・Issue管理を単一のSaaSで完結させる代わりに、無料枠のCI/CD分数がGitHub Actionsより小さい
verdict: 小規模チームでリポジトリ管理とCI/CDを単一プラットフォームで完結させたい場合の候補。自己ホストへの移行や統合ツールチェーンを重視するならGitLabを選ぶ。Free枠のCI/CD分数（400分/月）やユーザー数（5人）に早期に到達する場合は、GitHub+Actionsの組み合わせや上位プランへの移行を検討する
updatedAt: 2026-09-13
---

GitLabはリポジトリのホスティングに加えて、CI/CD・コンテナレジストリ・Issue管理・簡易的なセキュリティスキャンまでを単一のプラットフォームに統合している点が特徴で、SaaS版（GitLab.com）と自己ホスト版（Self-managed）の両方が同じ製品として提供される。

利用者が最初に当たるのはCI/CDのcompute minutesで、Free枠は月400分と小さく、共有Runnerでのビルド・テストがすぐに枠を消費する。次に当たるのが私有名前空間のユーザー数上限（5人）で、こちらは超過すると新規データの書き込みが止まる形で強制される。

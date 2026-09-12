---
name: Terraform
aliases: [TF, HCL, terraform CLI, テラフォーム]
category: devops
layer: tool
oneLiner: クラウド資源を HCL で宣言し、差分を計算して適用する IaC ツール
officialUrl: https://developer.hashicorp.com/terraform
docsUrl: https://developer.hashicorp.com/terraform/docs
can: [define-infra-as-code]
cannot:
  - state なしでの運用（設定と実資源の対応表が必須。state を失うと既存資源は管理外になる）
  - state に秘密情報を入れないこと（DB パスワード等の秘密値はローカルでは平文の state ファイルに保存される）
  - Terraform を組み込んだ製品やホスティングサービスを、HashiCorp / IBM の有償版と競合する形で第三者に提供すること（BSL 1.1）
  - Terraform の外で行われた変更の自動追従（plan 時の refresh で差分として検出されるが、設定側は自動更新されない。apply で元に戻される）
  - インプレース変更を許さない属性の無停止更新（API 上変更できない引数は資源の破棄・再作成として計画される）
constraints:
  - label: ライセンス（Terraform 1.6.0 以降）
    value: Business Source License 1.1。本番利用を含む利用は可だが、IBM の有償版と競合するホスト型・組み込み型での第三者提供は不可。各版は公開から4年後に MPL 2.0 へ移行
    impact: 社内のインフラ管理に使う限り費用も制限もない。Terraform を内包したサービスを売る場合はライセンス確認が必要。1.5 系までは MPL 2.0 のオープンソース
    source: https://github.com/hashicorp/terraform/blob/main/LICENSE
    verifiedAt: 2026-09-13
  - label: state の秘密情報
    value: ローカルで作業する場合、state は平文ファイルで、設定に定義した秘密値をすべて含む。公式の対策はリモート保存・保存時暗号化・アクセス制御・監査ログで、Git から除外することが求められる
    impact: state を Git にコミットしたり共有ドライブに置くと、DB パスワードや API キーが漏れる。個人の検証でも .gitignore に terraform.tfstate* を入れるのが最初の作業になる
    source: https://developer.hashicorp.com/terraform/language/state/sensitive-data
    verifiedAt: 2026-09-13
  - label: state の既定保存先
    value: ワークスペースごとにローカルファイル terraform.tfstate。直前の状態は terraform.tfstate.backup に残る。チームでは HCP Terraform かリモートバックエンドへの保存が推奨
    impact: 既定のままでは1台の PC にしか state がなく、他のメンバーは同じ資源を操作できない。2人目が参加する前に S3 等のリモートバックエンドへ移す
    source: https://developer.hashicorp.com/terraform/language/state
    verifiedAt: 2026-09-13
  - label: 並行実行と state ロック
    value: state に書き込む可能性のある全操作で自動的にロックを取るが、すべてのバックエンドがロックに対応しているわけではない。-lock=false での無効化は非推奨
    impact: ロック非対応のバックエンドで2人が同時に apply すると state が壊れる。バックエンド選定時にロック対応を確認する
    source: https://developer.hashicorp.com/terraform/language/state/locking
    verifiedAt: 2026-09-13
  - label: 変更の適用方式（更新か再作成か）
    value: 引数が変わった資源はインプレース更新。ただしリモート API の制約でインプレース変更できない引数は、資源を破棄して再作成する
    impact: DB の名前やサブネットのような属性を変えると、plan に「1 to destroy, 1 to add」が出てデータごと消える。plan の出力で replace を必ず確認する
    source: https://developer.hashicorp.com/terraform/language/resources/behavior
    verifiedAt: 2026-09-13
  - label: HCP Terraform の課金単位
    value: 管理下の資源1個あたり Essentials $0.10 / 月（$0.00013 / 時）、Standard $0.47 / 月、Premium $0.99 / 月。自己管理の Enterprise は個別見積
    impact: 資源数に比例して増えるため、数千資源を扱うと月額が読みにくい。CLI と S3 等の自前バックエンドなら Terraform 自体の費用はゼロ
    source: https://www.hashicorp.com/en/products/terraform/pricing
    verifiedAt: 2026-09-13
pitfalls:
  - state を Git にコミットする。秘密情報が履歴に残り、複数人で apply すると state が分岐する
  - クラウドのコンソールで手作業の変更をした後に apply すると、設定が正とされて手作業分が元に戻される。手で触った資源は import か設定への反映が必要
  - resource 名の変更やモジュール化で「アドレス」が変わると、破棄・再作成として計画される。moved ブロックか state mv で対応を教える
  - provider のバージョンを固定しないと、メジャー更新で既存資源に差分が出たり、属性名の変更で plan が通らなくなる。lock ファイルをコミットする
cost:
  model: free
  note: Terraform CLI は BSL 1.1 のもとで無償利用可（IBM の有償版と競合する提供のみ不可）。費用が発生するのは HCP Terraform（資源数課金、Essentials $0.10 / 資源 / 月から）を使う場合と、Terraform が作るクラウド資源そのもの
  source: https://github.com/hashicorp/terraform/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: docker
    difference: Docker はアプリの実行環境（OS・ライブラリ）をイメージとして再現する。Terraform はクラウド上の資源（VM・ネットワーク・DB・DNS）を宣言して作る。「環境を再現したい」の対象が1プロセスの中か、クラウドのアカウント全体かで使い分ける
  - tool: github-actions
    difference: GitHub Actions は Terraform を実行する場所として使われることが多く、代替ではない。ただし「push で本番へ反映する」だけが目的なら、Terraform を介さず Actions のデプロイステップで済む場合がある
verdict: 複数のクラウド資源を再現可能に管理し、変更を差分レビューしてから適用したいなら第一候補。プロバイダーの広さで他の IaC ツールに勝る。避けるのは、Terraform を内包した製品を販売する場合（BSL の競合条項）と、1〜2個の資源を一度作るだけで変更管理が不要な場合（コンソールや CLI のほうが早い）
updatedAt: 2026-09-13
---

HashiCorp（2025 年に IBM が買収）が開発する Infrastructure as Code ツールで、HCL で書いた「あるべき状態」と、state に記録された「現在の状態」の差分を計算し、plan で確認してから apply で適用する。AWS・Google Cloud・Azure・Cloudflare・GitHub など数千のプロバイダーがあり、クラウドをまたいだ資源を1つの言語で扱える。

最初に当たる制約は state である。state はローカルの平文ファイルとして始まり、秘密情報を含み、チームで共有するにはリモートバックエンドとロックが要る。もう一つは 2023 年のライセンス変更（MPL 2.0 から BSL 1.1）で、社内利用には影響がないが、Terraform を組み込んだサービスの提供には制限がかかる。

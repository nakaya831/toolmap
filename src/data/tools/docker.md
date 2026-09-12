---
name: Docker
aliases: [Docker Engine, Docker Desktop, Docker Compose, コンテナ]
category: infrastructure
layer: tool
oneLiner: アプリと実行環境をイメージに固め、どこでも同じに動かすコンテナ基盤
officialUrl: https://www.docker.com/
docsUrl: https://docs.docker.com/
can: [run-containers]
cannot:
  - 複数ホストにまたがるオーケストレーション（単体では 1 台。Kubernetes・Swarm・マネージドサービスが別途必要）
  - Windows / macOS でのネイティブ実行（Linux VM を介するため、ファイル I/O が遅く VM がメモリを占有する）
  - 従業員 250 人以上または年商 1,000 万ドル以上の企業での Docker Desktop の無償利用
  - VM と同等の隔離（ホストのカーネルを共有するため、セキュリティ境界としては VM より弱い）
  - コンテナ削除後のデータ保持（ボリュームに置かない限り消える）
constraints:
  - label: Docker Desktop の無償利用の条件
    value: 従業員 250 人未満かつ年商 1,000 万ドル未満の企業、個人利用、教育、非商用 OSS のみ無償。超える企業は Pro / Team / Business の有償サブスクリプションが必要。Docker Engine（Linux の CLI・デーモン）は対象外
    impact: 中堅以上の企業では開発者全員分のライセンス費が発生する。Linux 上で Docker Engine を直接使うなら不要
    source: https://docs.docker.com/subscription/desktop-license/
    verifiedAt: 2026-09-13
  - label: Docker Hub のイメージ取得（pull）回数
    value: 未認証 100 pull / 6時間（IPv4 アドレスまたは IPv6 /64 単位）、Personal 認証 200 pull / 6時間。Pro 以上は無制限。マルチアーキテクチャのイメージはアーキテクチャごとに 1 pull と数える
    impact: CI や社内 NAT のように IP を共有する環境では未認証の 100 回をすぐ超え、ビルドが 429 で止まる。ログインするか、ミラーや別レジストリを使う
    source: https://docs.docker.com/docker-hub/usage/pulls/
    verifiedAt: 2026-09-13
  - label: 有償プランの価格
    value: Pro $11 / ユーザー / 月（年払い $9）、Team $16（年払い $15）、Business $24
    impact: Desktop のライセンス条件に当たる企業は、開発者数×この単価が固定費になる
    source: https://www.docker.com/pricing/
    verifiedAt: 2026-09-13
  - label: Docker Desktop for Windows の要件
    value: 64 bit の Windows 10 22H2 または Windows 11 23H2 以降、8 GB RAM、SLAT 対応 CPU、WSL 2.1.5 以降または Hyper-V
    impact: 古い Windows や BIOS で仮想化が無効な PC では動かない。Home エディションは WSL 2 バックエンドのみ
    source: https://docs.docker.com/desktop/setup/install/windows-install/
    verifiedAt: 2026-09-13
  - label: Docker Hub Personal のプライベートリポジトリ
    value: 1 個まで
    impact: 非公開イメージを複数持つには有償プランか、GHCR・ECR など別レジストリが必要
    source: https://docs.docker.com/docker-hub/usage/
    verifiedAt: 2026-09-13
pitfalls:
  - latest タグは動く目印で再現性がない。バージョンタグかダイジェストで固定する
  - ビルド用ツールを含めたままのイメージは肥大化し、pull・デプロイが遅くなる。マルチステージビルドで実行に要るものだけ残す
  - コンテナ内で書いたファイルはコンテナ削除で消える。DB のデータなど状態はボリュームに置く
  - Mac / Windows でホストのディレクトリをマウントすると I/O が極端に遅くなる。node_modules 等はコンテナ側のボリュームに置く
cost:
  model: free-tier
  note: Docker Engine・CLI は Apache 2.0 で無償。Docker Desktop は従業員 250 人以上または年商 $10M 以上の企業で有償（Pro $11 / ユーザー / 月から）。Docker Hub は pull 回数とプライベートリポジトリ数がプランで変わる
  source: https://www.docker.com/pricing/
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: render
    difference: Docker は手元やサーバーでコンテナを動かす道具で、動かす場所は自分で用意する。Render はその Dockerfile を渡すとビルド・配信・再起動まで運用してくれる場所。運用を持ちたくないなら Render
  - tool: aws-lambda
    difference: Lambda はコンテナイメージ（10 GB まで）を関数として実行し、リクエスト単位で課金される。Docker は常駐プロセスを動かす前提で、Lambda の 15分・状態なしの制約を受けない
verdict: 「開発環境と本番環境を同じにしたい」「依存関係ごとパッケージして配布したい」場合の既定解。Web アプリの開発では最初から Dockerfile を置いてよい。避けるのは、Docker Desktop のライセンス費が問題になる企業で Linux 環境も用意できない場合と、単一の静的サイトや関数だけで済む場合（コンテナは過剰）
updatedAt: 2026-09-13
---

アプリケーションとその依存関係を「イメージ」に固め、Linux のカーネル機能で隔離して実行する仕組みである。Dockerfile で環境を宣言でき、同じイメージが開発者の PC・CI・本番で同じように動く。Render・AWS・Cloud Run など多くの実行基盤が Dockerfile を入力として受け付けるため、実行環境の共通語になっている。

利用者が最初に当たる制約は技術的なものではなく、Docker Desktop のライセンス条件（従業員 250 人・年商 $10M）と Docker Hub の pull 回数制限である。特に後者は CI で突然 429 が出て気づくことが多い。

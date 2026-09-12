---
name: GitHub
aliases: [GH, github.com, ギットハブ]
category: devops
layer: managed-service
oneLiner: Git リポジトリのホスティングに PR・Issue・CI を統合した開発基盤
officialUrl: https://github.com/
docsUrl: https://docs.github.com/
can: [version-control]
cannot:
  - 100 MiB を超える単一ファイルの push（Git LFS が必要）
  - 無料プラン（Free）の私有リポジトリでの保護ブランチ・必須レビュアーの強制（公開リポジトリのみ。私有では Pro / Team 以上）
  - 数 GB を超えるリポジトリの快適な運用（推奨は 1 GB 未満、5 GB 未満を強く推奨）
  - 自社ネットワーク内だけで完結するホスティング（標準はクラウド。オンプレミスは Enterprise Server の契約が必要）
  - リポジトリ内のディレクトリ単位でのアクセス権分離（権限はリポジトリ単位）
constraints:
  - label: 1ファイルのサイズ上限
    value: 100 MiB を超えるファイルは push がブロックされる。50 MiB 超で警告。ブラウザからの追加は 25 MiB まで。超える場合は Git LFS を使う
    impact: 動画・データセット・ビルド成果物を直接コミットすると push が失敗する。LFS を使うか、オブジェクトストレージに置いて参照だけを入れる
    source: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
    verifiedAt: 2026-09-13
  - label: リポジトリ容量の推奨上限
    value: 1 GB 未満が理想、5 GB 未満が強く推奨
    impact: 容量が増えると clone・fetch・Web 表示が遅くなり、上限に近づくとサポートから連絡が来る。バイナリを履歴から外す設計が前提
    source: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
    verifiedAt: 2026-09-13
  - label: 無料プランの範囲と有償化の分岐
    value: Free は $0 で私有リポジトリ無制限、Actions 2,000分 / 月、Packages 500 MB。保護ブランチ・必須レビュアーは公開リポジトリのみ。Team は $4 / ユーザー / 月で私有リポジトリにも適用でき、Actions 3,000分 / 月・Packages 2 GB
    impact: 個人や小規模チームは Free で足りる。私有リポジトリで「main への直接 push を禁止したい」となった時点で Team への移行が必要になる
    source: https://github.com/pricing
    verifiedAt: 2026-09-13
  - label: Git LFS の無料枠
    value: Free / Pro / Free for organizations は帯域 10 GiB・容量 10 GiB。Team / Enterprise Cloud は帯域・容量とも 250 GiB。超過分は帯域が GiB 単位、容量が時間単位で課金
    impact: LFS のファイルは clone のたびに帯域を消費する。CI が毎回フルクローンすると、月の帯域枠が数日で尽きる
    source: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-git-large-file-storage/about-billing-for-git-large-file-storage
    verifiedAt: 2026-09-13
  - label: push サイズと操作レートの上限
    value: 1回の push は 2 GB まで。Git 読み取り操作は 15回 / 秒 / リポジトリ、push は 6回 / 分 / リポジトリ。ブランチは 5,000 までが推奨
    impact: 大量の履歴を一度に移行する push は分割が必要。複数の CI・ボットが同一リポジトリを高頻度で fetch するとレート制限に当たる
    source: https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits
    verifiedAt: 2026-09-13
  - label: Pull Request の差分表示の上限
    value: 差分全体で 20,000行または 1 MB、変更ファイル数 300 を超えると一部が表示されない。1ファイルは 20,000行または 500 KB まで。比較ビューは 250 コミットまで
    impact: 巨大な PR は Web 上でレビューできなくなる。生成コードやロックファイルの更新は別 PR に分ける
    source: https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits
    verifiedAt: 2026-09-13
pitfalls:
  - 大きなバイナリを一度 push すると、履歴の書き換えだけでは GitHub 側のオブジェクトが消えず、完全削除にはサポートへの依頼が要る。最初から LFS か外部ストレージへ
  - 無料プランの私有リポジトリでは main への直接 push を仕組みで防げない。運用ルールだけで守ることになる
  - 個人アカウントの Personal Access Token をチームや CI で共有すると、その人の退職・権限変更で一斉に止まる。GitHub Apps か fine-grained token を使う
  - 公開リポジトリに一度でも push した秘密情報は、削除しても第三者のクローラーに取得済みと考える。キーの無効化が先
cost:
  model: free-tier
  note: Free で私有リポジトリと共同編集者は無制限。課金が跳ねるのは、私有リポジトリで保護ブランチ・必須レビューが必要になったとき（Team $4 / ユーザー / 月）と、Actions 分数・Packages 容量・LFS 帯域の無料枠超過
  source: https://github.com/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: git
    difference: Git は手元の履歴管理ツール、GitHub はそれを置く場所とレビュー・Issue・CI を提供するサービス。Git の制約（履歴の永続性、バイナリの肥大）はそのまま GitHub に持ち込まれ、その上にファイル 100 MiB・容量 5 GB といった GitHub 側の上限が乗る
  - tool: github-actions
    difference: GitHub Actions は GitHub の一機能で、CI/CD とスケジュール実行を担う。リポジトリのホスティングだけなら Actions は使わなくてよいが、無料分数（2,000分 / 月）はプランの一部として GitHub 側で決まる
verdict: 個人・チームのソースコードをホストし、Pull Request でレビューを回す用途では第一候補。無料プランで私有リポジトリも無制限に持てる。避けるのは、大きなバイナリ資産を本体に入れる運用（LFS 帯域と 100 MiB 上限に当たる）と、社外に一切データを出せない場合（Enterprise Server か自前ホスティングへ）
updatedAt: 2026-09-13
---

Git リポジトリのホスティングサービスとして最大の利用者数を持ち、Pull Request によるレビュー、Issue、Actions（CI/CD）、Pages（静的ホスティング）、Packages、Codespaces を1つのアカウントで提供する。オープンソースの大半がここにあるため、外部ライブラリの Issue 追跡や貢献もこの上で行うことになる。

最初に当たる制約は容量である。ファイル1個 100 MiB、リポジトリ 1〜5 GB という上限は、ソースコードだけなら届かないが、画像・動画・学習データ・ビルド成果物を入れ始めるとすぐに到達する。その次に当たるのが「私有リポジトリで保護ブランチを使いたい」という要求で、ここが Free から Team への課金の分岐点になる。

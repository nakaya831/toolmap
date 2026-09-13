---
name: Fly.io
aliases: [Fly, flyctl, Fly Machines]
category: infrastructure
layer: managed-service
oneLiner: Dockerイメージを世界中のリージョンにVM(Machine)として配置するPaaS
officialUrl: https://fly.io/
docsUrl: https://fly.io/docs/
can: [run-containers, run-long-process, host-web-app]
cannot:
  - クレジットカード登録なしでの利用開始(Linked Organizationsを除く全組織で登録必須)
  - Volume(永続ディスク)間の自動レプリケーション(単一障害点になるため、冗長化はアプリ側の設計が前提)
  - 一度拡張したVolumeサイズの縮小
  - リクエスト単位でのゼロ円起点課金(Lambda/Workersのような従量課金ではなく、Machineが起動している間は秒単位で課金され続ける)
constraints:
  - label: 支払い方法の登録
    value: Linked Organizationsを除くすべての組織でクレジットカード登録が必須
    impact: 個人の検証目的でも、カード登録なしには一切のリソースを作成できない
    source: https://fly.io/docs/about/pricing/
    verifiedAt: 2026-09-13
  - label: Machineの課金単価(共有CPU、例 アムステルダム)
    value: shared-cpu-1x(共有1CPU・256MB RAM)が1秒あたり0.00000078ドル(30日常時稼働で目安月額約2.02ドル)。稼働中のみ課金され、停止・一時停止中はCPU/RAM課金なし
    impact: 常時起動するサービスは秒単位で費用が積み上がる。オートストップを使わない設計だとアクセスがなくても課金が続く
    source: https://fly.io/docs/about/pricing/
    verifiedAt: 2026-09-13
  - label: Volume(永続ディスク)の最大サイズと拡張制約
    value: 1ボリュームの最大サイズは500GB(既定1GB)。拡張はできるが縮小はできない
    impact: 見積もりを誤って大きめに拡張すると、そのままではサイズを戻せず作り直しが必要になる
    source: https://fly.io/docs/volumes/overview/
    verifiedAt: 2026-09-13
  - label: Volumeのレプリケーションと障害耐性
    value: Volume間に組み込みのレプリケーション機能はない。ボリュームを保持するNVMeドライブが故障すると、そのインスタンスのアプリは停止する
    impact: 本番ではアプリごとに最低2つのボリュームを異なる場所にプロビジョニングすることが公式に推奨されている。1ボリューム構成は単一障害点になる
    source: https://fly.io/docs/volumes/overview/
    verifiedAt: 2026-09-13
  - label: データ転送(アウトバウンド)の価格
    value: 2024年7月18日以降作成の組織向けで、北米・欧州は0.02ドル/GB、アジア太平洋・南米は0.04ドル/GB、アフリカ・インドは0.12ドル/GB。インバウンドは無料
    impact: 配信先の地域によって帯域コストが数倍変わる。ユーザーの分布が偏る場合は地域別の見積もりが必要になる
    source: https://fly.io/docs/about/pricing/
    verifiedAt: 2026-09-13
pitfalls:
  - オートストップ/オートスタートを設定せず常時起動のままにし、アクセスがほぼないアプリでも秒課金が積み上がる
  - Volumeを1つしか作らず、ホスト障害でデータごとアプリが落ちて気づく
  - リージョンやVolumeの配置を意識せず、ユーザーから遠いリージョンにMachineが偏って応答が遅くなる
  - 帯域費用の地域差を見落とし、想定外の地域からのアクセスが多いサービスで転送費用が跳ねる
cost:
  model: usage-based
  note: 稼働中のMachineは秒単位のCPU/メモリ課金、Volumeは容量課金(月額)、アウトバウンド転送は地域別従量課金。固定の無料利用枠はなく、全組織にクレジットカード登録が必須
  source: https://fly.io/docs/about/pricing/
  verifiedAt: 2026-09-13
learningCost: medium
maturity: growing
alternatives:
  - tool: render
    difference: Renderはクレジットカードなしで使える無料インスタンス(スリープあり)を持つが、リージョン選択やVolumeの制御はFly.ioより限定的。Fly.ioは複数リージョンへのMachine配置と秒単位課金を前面に出す代わりに、開始時点でカード登録が必須
  - tool: aws-lambda
    difference: Lambdaはリクエストが来たときだけ課金される従量課金で、アクセスが散発的なら安い。Fly.ioは常駐Machineが前提で、オートストップを使っても起動中は秒課金が続く。WebSocketや常駐プロセスが必要ならFly.io、短時間処理が中心ならLambda
  - tool: docker
    difference: Dockerはコンテナをビルドするための道具そのもので、動かす場所は別に用意する必要がある。Fly.ioはそのDockerイメージをMachine(Firecracker VM)として世界中のリージョンに配置し、ネットワーク・TLS・スケールを引き受ける
verdict: Dockerイメージを複数リージョンに配置して低遅延で配信したい、WebSocketや常駐プロセスを動かしたい用途では第一候補。カード登録なしで無料に試したい場合や、アクセスが散発的でリクエスト単位課金が有利な場合は、それぞれRenderやLambda/Workers系を検討する
updatedAt: 2026-09-13
---

Dockerfile やコンテナイメージを渡すと、Firecracker VM(Machine)として世界中のリージョンに配置できるPaaSで、常駐プロセス・WebSocket・永続ディスク(Volume)・Postgresなどをまとめて運用できる。課金は稼働時間ベースの秒単位課金が基本で、リクエスト単位のサーバーレス課金とは性質が異なる。

利用者が最初に当たる制約はクレジットカード登録の必須化である。個人の検証用途であっても、カードを登録しない限りMachineを1つも作成できない。次に当たるのがVolumeの単一障害点としての性質で、レプリケーション機能を持たないため、本番運用では最低2つのボリュームを分けて持つ設計が公式に推奨されている。

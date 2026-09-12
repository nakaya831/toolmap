---
name: Amazon S3
aliases: [S3, AWS S3, Simple Storage Service]
category: datastore
layer: managed-service
oneLiner: 容量無制限・従量課金の、AWS のオブジェクト（ファイル）ストレージ
officialUrl: https://aws.amazon.com/s3/
docsUrl: https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html
can: [store-files, host-static, run-on-event]
cannot:
  - オブジェクトの部分更新・追記（変更は常にオブジェクト全体の置き換え）
  - ファイルシステムとしての利用（キー空間はフラットで、フォルダはプレフィックスの見せかけ。ディレクトリのリネームは全オブジェクトのコピー）
  - 同一キーへの同時書き込みの調停（ロック機構はなく、最後に書いた方が勝つ。必要ならアプリ側で条件付き書き込みを使う）
  - 複数キーにまたがる原子的な更新（トランザクションはない）
  - ウェブサイトエンドポイント単体での HTTPS 配信（HTTPS には CloudFront か Amplify Hosting を前に置く）
constraints:
  - label: 料金の構成（US East (N. Virginia)、S3 Standard）
    value: ストレージ $0.023 / GB・月（最初の 50 TB）。PUT/COPY/POST/LIST $0.005 / 1,000 リクエスト、GET/SELECT $0.0004 / 1,000 リクエスト。インターネットへの転送 $0.09 / GB（最初の 10 TB。月 100 GB までは AWS 全体で無料）。受信は無料
    impact: 小さいファイルを大量に置くとストレージよりリクエスト課金が、公開配信するとストレージより転送課金が支配的になる。「置いた量」ではなく「出した量」で見積もる
    source: https://aws.amazon.com/s3/pricing/
    verifiedAt: 2026-09-13
  - label: 1回のアップロードで送れるサイズ
    value: 単一 PUT は 5 GB まで。コンソールは 160 GB まで。それ以上はマルチパートアップロード（5 MB〜50 TB）
    impact: 5 GB を超えるファイルは API 1回では入らない。SDK の高レベル転送機能を使えば自動で分割されるが、REST を直接叩く実装では分割・並列・再試行を自前で書くことになる
    source: https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html
    verifiedAt: 2026-09-13
  - label: マルチパートアップロードの仕様
    value: パートサイズ 5 MiB〜5 GiB（最後のパートは下限なし）、最大 10,000 パート、最大オブジェクトサイズ 48.8 TiB
    impact: パート数の上限があるため、非常に大きなファイルではパートサイズを大きくしないと 10,000 パートを超える。100 MB 以上のオブジェクトはマルチパートが推奨されている
    source: https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html
    verifiedAt: 2026-09-13
  - label: リクエスト性能（プレフィックスあたり）
    value: 3,500 PUT/COPY/POST/DELETE または 5,500 GET/HEAD リクエスト / 秒 以上（分割されたプレフィックスごと）
    impact: 単一プレフィックスに集中したアクセスは、スケーリングが追いつくまで 503 Slow Down を返す。高頻度アクセスはプレフィックスを分けて並列化する
    source: https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html
    verifiedAt: 2026-09-13
  - label: バケット数と変更不可の属性
    value: 既定 10,000 バケット / アカウント（引き上げ申請可）。バケットサイズとオブジェクト数は無制限。作成後にバケット名とリージョンは変更できない
    impact: テナントごとにバケットを作る設計は上限に当たる。プレフィックスで分ける。名前とリージョンは最初に決めたら変えられないため、命名規則を先に固める
    source: https://docs.aws.amazon.com/AmazonS3/latest/userguide/BucketRestrictions.html
    verifiedAt: 2026-09-13
  - label: オブジェクトキーの長さ
    value: 1,024 バイト（UTF-8。プレフィックスと区切り文字を含む）
    impact: 日本語ファイル名は1文字 3 バイトで数えるため、深い階層と長い名前を組み合わせると上限に触れる。キーは ID にし、表示名はメタデータか DB に持つ
    source: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
    verifiedAt: 2026-09-13
pitfalls:
  - Block Public Access を解除して機密データを世界公開する事故が最も多い。公開が必要なのは静的サイト配信だけで、それ以外は署名付き URL か CloudFront 経由で配る
  - ライフサイクル規則なしでバージョニングを有効にすると、削除・上書きした旧版がすべて残り課金され続ける
  - 大量の小さいオブジェクトを LIST で走査する処理は 1,000 件ずつのページングになり、遅いうえにリクエスト課金が積み上がる。一覧は S3 Inventory か自前のインデックス（DB）で持つ
  - 動画配信やバックアップの頻繁な復元のように AWS 外へ出るデータが多い用途では、転送料金がストレージ料金を大きく上回る
cost:
  model: usage-based
  note: 無料枠を除き、ストレージ量・リクエスト数・転送量の3軸で従量課金。跳ねるのはインターネットへの転送（$0.09 / GB）と、小さいオブジェクトの大量 PUT/LIST である。保存だけなら安価
  source: https://aws.amazon.com/s3/pricing/
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: github-pages
    difference: GitHub Pages は静的サイト配信専用で無料・HTTPS 標準だが、容量と帯域に上限があり、ファイル置き場としての API はない。S3 は容量無制限の汎用ストレージで従量課金、HTTPS 配信には CloudFront が別途要る。公開資料サイトなら Pages、アプリの添付ファイル置き場なら S3
  - tool: supabase
    difference: Supabase Storage は認証・DB と一体で、ユーザーごとのアクセス制御をポリシーで書ける。S3 は IAM と署名付き URL で制御し、AWS の他サービスとの連携（Lambda トリガー、CloudFront、Athena）が厚い。Supabase を既に使うなら Storage、AWS 上に組むなら S3
verdict: アプリの添付ファイル・画像・バックアップ・ログなど「ファイルを置いて配る」用途では第一候補で、容量を気にせず始められる。避けるのは、部分更新やロックが要るデータ（DB へ）、HTTPS 付きの静的サイトを最短で公開したい場合（GitHub Pages や Vercel へ）、AWS 外への大量配信で転送料金が読めない場合
updatedAt: 2026-09-13
---

AWS の中核サービスで、「キーとバイト列」を保存する以外の機能を持たない代わりに、容量とオブジェクト数に上限がなく、書き込み直後の読み取りが一貫する（強い read-after-write 整合性）。イベント通知で Lambda を起動でき、ファイルが置かれたら処理を走らせる構成の起点になる。

利用者が最初に当たるのはサイズや個数の上限ではなく料金の構造である。保存自体は GB あたり数セントだが、リクエスト数と転送量が別に課金され、特にインターネットへの転送は月 100 GB を超えた分が GB あたり $0.09 かかる。「どれだけ置くか」ではなく「どれだけ読み出すか」で費用が決まる点が、ローカルディスクとの最大の違いである。

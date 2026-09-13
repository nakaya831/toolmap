---
name: MongoDB
aliases: [Mongo, mongod, MongoDB Atlas]
category: datastore
layer: tool
oneLiner: JSON風のドキュメントをスキーマレスに保存する、水平分散前提のNoSQL DB
officialUrl: https://www.mongodb.com/
docsUrl: https://www.mongodb.com/docs/manual/
can: [store-documents, store-files, full-text-search]
cannot:
  - 複数コレクションをまたぐ本格的なJOIN処理($lookupはあるが、正規化されたリレーショナルモデルの結合には向かない)
  - 16MBを超える1ドキュメントの保存(単体では不可。大きなファイルはGridFSで分割して扱う)
  - スキーマを強制しない運用でのデータ整合性の保証(バリデーションはオプションで既定では緩い)
  - ソースを非公開にしたままのSaaS/マネージドサービスとしての再提供(SSPLによりサービス提供側にソース公開義務が生じる)
constraints:
  - label: 1ドキュメントの最大サイズ(BSON)
    value: 16メビバイト(MiB)
    impact: 大きな添付ファイルや際限なく増える配列を1ドキュメントに入れる設計は上限に当たる。ファイルはGridFSか外部ストレージに分離する
    source: https://www.mongodb.com/docs/manual/reference/limits/
    verifiedAt: 2026-09-13
  - label: ドキュメントのネスト最大深度
    value: 100レベル
    impact: 深くネストしたオブジェクト(コメントへの返信の入れ子等)を持つ設計は、100階層を超えないよう配列参照など別モデルに切り替える
    source: https://www.mongodb.com/docs/manual/reference/limits/
    verifiedAt: 2026-09-13
  - label: 1コレクションあたりの最大インデックス数
    value: 64個(複合インデックスは最大32フィールド)
    impact: クエリパターンごとにインデックスを増やし続けると上限に達する。複合インデックスやクエリ自体の見直しで削減する
    source: https://www.mongodb.com/docs/manual/reference/limits/
    verifiedAt: 2026-09-13
  - label: マルチドキュメントトランザクションの最大実行時間
    value: 既定60秒
    impact: 長時間のバッチ処理を1つのトランザクションにまとめると途中で中断される。トランザクションは短く分割する
    source: https://www.mongodb.com/docs/manual/reference/limits/
    verifiedAt: 2026-09-13
  - label: Atlas無料クラスタ(M0)の上限
    value: ストレージ0.5GB、最大接続数500、スループット目安100操作/秒、30日間アクセスがないと自動停止。MongoDBバージョンは固定でシャーディング不可
    impact: 検証・学習用途に限られる。本番相当の接続数やスループットが必要になった時点で有料ティアへの移行が必要になる
    source: https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
    verifiedAt: 2026-09-13
  - label: ライセンス(SSPL)の適用条件
    value: MongoDB本体はServer Side Public License(SSPL) v1。プログラムの機能を第三者にサービスとして提供する場合、サービスを構成するソフトウェア一式のソースコードを無償公開する義務が生じる
    impact: 自社サービスのバックエンドとして使うだけなら実務上の制約は小さいが、MongoDB互換のマネージドサービスを他社に提供するビジネスは公開義務の対象になる
    source: https://www.mongodb.com/legal/licensing/server-side-public-license
    verifiedAt: 2026-09-13
pitfalls:
  - スキーマレスを理由に設計を省略すると、アプリ側のバリデーション漏れでフィールドの型や有無がドキュメントごとにばらつく
  - $lookupを多用してリレーショナルDBのようにJOINし続けると、非正規化を前提にした設計思想と逆行しパフォーマンスが悪化する
  - インデックスのない範囲クエリやソートはコレクションスキャンになり、データ量が増えると急激に遅くなる
  - Atlas M0で開発・検証したまま本番に持ち込み、接続数やスループットの上限で障害になる
cost:
  model: free
  note: Community版はSSPLで無償。運用費用はホスティングするサーバー、またはAtlasの有料ティア(M0を超えるストレージ・接続数・専有インスタンス)で発生する
  source: https://www.mongodb.com/legal/licensing/server-side-public-license
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: postgresql
    difference: PostgreSQLはJSONB列でドキュメント的な保存もできるが基本はスキーマを持つ関係モデル。MongoDBはスキーマレスなドキュメントを前提に設計され、水平分散(シャーディング)が組み込みで用意されている。強い整合性とJOINが中心ならPostgreSQL、ドキュメント単位の読み書きとスケールアウトが中心ならMongoDB
  - tool: firebase
    difference: FirebaseのFirestoreも同じドキュメント指向だがフルマネージドで、クライアントSDKからの直接アクセスとリアルタイム同期が前提。MongoDBは自前運用またはAtlasでのサーバーサイドアクセスが前提で、集計やインデックス設計の自由度が高い
verdict: JSON的な構造のデータをスキーマ固定なしで柔軟に、かつ将来の水平分散も見込んで保存したい場合の第一候補。複数コレクションを跨いだJOINが中心の設計や、強いトランザクション整合性が常に必要な用途は避け、PostgreSQLなど関係データベースを検討する
updatedAt: 2026-09-13
---

ドキュメント指向のNoSQLデータベースで、JSONに似たBSON形式のドキュメントをコレクション単位でスキーマレスに保存する。レプリカセットによる冗長化とシャーディングによる水平分散が組み込みで用意されており、Atlasとしてのマネージド提供も広く使われている。

利用者が最初に当たる制約は1ドキュメント16MiBというBSONのサイズ上限である。画像や大きな配列をそのまま1ドキュメントに詰め込む設計は早い段階でこの上限に触れ、GridFSや外部ストレージへの分離が必要になる。次に当たるのがJOINの弱さで、$lookupはあるものの複数コレクションを跨いだ結合を多用する設計は、非正規化を前提にしたMongoDBの思想と噛み合わない。

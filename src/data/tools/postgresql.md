---
name: PostgreSQL
aliases: [Postgres, PG, psql]
category: datastore
layer: tool
oneLiner: 標準SQLに忠実で拡張性の高い、オープンソースの関係データベース
officialUrl: https://www.postgresql.org/
docsUrl: https://www.postgresql.org/docs/current/
can: [store-relational, store-documents, full-text-search, store-vectors]
cannot:
  - 自動的な水平分散（複数サーバーへの書き込み分散は拡張や外部製品が必要）
  - サーバーレスな「使った分だけ」課金（自前運用では常時稼働のコストがかかる）
  - 日本語の全文検索を標準機能だけで実用水準にすること（形態素解析の拡張が別途必要）
  - スキーマなしでの運用（列定義は必須。JSONB 列で緩められるが表構造は残る）
constraints:
  - label: 同時接続数の既定値
    value: max_connections = 100（既定。カーネル設定によりさらに低い場合がある）
    impact: サーバーレス関数から直接つなぐと接続が枯渇する。コネクションプーラー（PgBouncer 等）を挟むか、接続数を管理する
    source: https://www.postgresql.org/docs/current/runtime-config-connection.html
    verifiedAt: 2026-09-13
  - label: 1テーブル（リレーション）の最大サイズ
    value: 32 TB（既定ブロックサイズ 8 KB のとき）
    impact: 単一テーブルでこの上限に近づく前に、パーティショニングで分割する
    source: https://www.postgresql.org/docs/current/limits.html
    verifiedAt: 2026-09-13
  - label: 1テーブルの列数上限
    value: 1,600 列（タプルが1ページに収まる範囲でさらに制限される）
    impact: 横に広い表（アンケートの全質問を列にする等）は設計を縦持ちに変える
    source: https://www.postgresql.org/docs/current/limits.html
    verifiedAt: 2026-09-13
  - label: 1フィールドの最大サイズ
    value: 1 GB
    impact: 大きなファイルは DB に入れず、オブジェクトストレージに置いてパスだけ保存する
    source: https://www.postgresql.org/docs/current/limits.html
    verifiedAt: 2026-09-13
  - label: 識別子（テーブル名・列名）の長さ
    value: 63 バイト
    impact: 長い名前は警告なく切り詰められ、別名同士が衝突する。自動生成する名前は特に注意
    source: https://www.postgresql.org/docs/current/limits.html
    verifiedAt: 2026-09-13
  - label: メジャーバージョンのサポート期間
    value: 初回リリースから5年。メジャーは年1回
    impact: 5年ごとにメジャーアップグレード（ダンプ・リストアか pg_upgrade）が必須になる
    source: https://www.postgresql.org/support/versioning/
    verifiedAt: 2026-09-13
pitfalls:
  - インデックスのない外部キー列で JOIN や削除が極端に遅くなる。外部キーには自動でインデックスが張られない
  - VACUUM を止めると（長いトランザクション等）テーブルが肥大化し、いずれトランザクション ID の周回で停止する
  - 文字列比較の照合順序（collation）が OS 依存で、環境を移すとソート順が変わることがある
  - マネージド版（RDS、Cloud SQL、Supabase、Neon 等）は本体と別の上限・料金を持つ。それぞれの制約を別途確認する
cost:
  model: free
  note: PostgreSQL ライセンス（BSD/MIT 類似）で無償。費用は動かすサーバーか、マネージドサービスの料金として発生する
  source: https://www.postgresql.org/about/licence/
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: sqlite
    difference: SQLite はサーバー不要の単一ファイルで、複数プロセスからの同時書き込みに弱い。1台で完結するなら SQLite、複数のアプリから同時に読み書きするなら PostgreSQL
  - tool: supabase
    difference: Supabase は PostgreSQL を運用込みで提供し、認証・ストレージ・API を同梱する。DB 本体の制約はここに書いたものが適用され、さらに Supabase 側のプラン上限が乗る
verdict: 「関係を持つデータを保存する」のほぼ既定解。迷ったら PostgreSQL で始めてよい。避けるのは、サーバーを1台も持ちたくない場合（SQLite かマネージド版へ）と、書き込みが1台に収まらない規模（分散 DB へ）
updatedAt: 2026-09-13
---

30年以上の歴史を持つ関係データベースで、JSONB による文書保存、tsvector による全文検索、pgvector 拡張によるベクトル検索まで、一つの DB で多くの「保存」系の能力を賄える。

初級者が最初に当たる制約は、テーブルの大きさではなく接続数である。サーバーレス関数やコンテナのスケールアウトと組み合わせると、100 接続はすぐ枯渇する。マネージドサービスの多くがプーラーを同梱している理由はここにある。

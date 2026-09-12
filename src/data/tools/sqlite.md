---
name: SQLite
aliases: [sqlite3, SQLite3, sqlite]
category: datastore
layer: tool
oneLiner: サーバー不要、単一ファイルで動く組み込み型の関係データベース
officialUrl: https://www.sqlite.org/
docsUrl: https://www.sqlite.org/docs.html
can: [store-relational, full-text-search, transform-tabular, store-documents]
cannot:
  - 複数のプロセスやホストからの同時書き込み（書き込みは常に同時1つ。待つか失敗する）
  - 複数サーバーからネットワーク越しに1つの DB ファイルを直接共有すること（ネットワークファイルシステム上のロックは信頼できず破損の原因になる）
  - ユーザー認証・権限管理（DB ファイルの OS 権限がすべて。テーブル単位の権限はない）
  - 日本語の全文検索を標準トークナイザだけで単語単位に行うこと（FTS5 の既定 unicode61 は空白区切り前提。trigram による部分一致で代替する）
  - 281 TB を超える単一データベース
constraints:
  - label: 同時書き込み数
    value: 1 ライター / 瞬間（読み取りは無制限）。WAL モードでも書き込みは同時に1つ
    impact: 複数の Web サーバーやワーカーから同時に書き込むと SQLITE_BUSY で待ちや失敗が起きる。書き込み経路を1プロセスに集約するか、書き込みが分散する規模になったらクライアント／サーバー型 DB へ移す
    source: https://www.sqlite.org/whentouse.html
    verifiedAt: 2026-09-13
  - label: WAL モードの動作条件
    value: DB を使う全プロセスが同一ホスト1台上にあること。ネットワークファイルシステム上では動作しない
    impact: 読み取りと書き込みを並行させる WAL は、NFS や SMB 越しに共有した DB では使えない。コンテナを複数ノードに広げた時点で前提が崩れる
    source: https://www.sqlite.org/wal.html
    verifiedAt: 2026-09-13
  - label: 1つの文字列 / BLOB の最大長
    value: 1,000,000,000 バイト（既定。SQLITE_MAX_LENGTH）
    impact: 1 GB 近いバイナリを1行に入れる設計は成り立たない。大きなファイルは DB 外に置いてパスだけ保存する
    source: https://www.sqlite.org/limits.html
    verifiedAt: 2026-09-13
  - label: データベースファイルの最大サイズ
    value: 約 281 TB（最大ページ数 2^32-2、ページサイズ 65,536 バイト時）
    impact: 事実上の上限はファイルシステムと1台のディスク容量。ここに近づく前に用途が単一ファイル DB の範囲を超えている
    source: https://www.sqlite.org/limits.html
    verifiedAt: 2026-09-13
  - label: 1テーブルの列数上限
    value: 2,000 列（既定。SQLITE_MAX_COLUMN）
    impact: 横に広い表（アンケートの全質問を列にする等）はコンパイル時設定を変えない限り入らない。縦持ちに設計を変える
    source: https://www.sqlite.org/limits.html
    verifiedAt: 2026-09-13
  - label: 1文中のホストパラメータ（? プレースホルダ）数
    value: 32,766（3.32.0 以降の既定。それ以前は 999）
    impact: 「IN (?, ?, ...)」に数万件を渡す、1文で数千行をバルク INSERT する、といった書き方で「too many SQL variables」になる。分割するか一時テーブルに入れる
    source: https://www.sqlite.org/limits.html
    verifiedAt: 2026-09-13
pitfalls:
  - 型付けが緩く、既定では INTEGER 列に文字列を格納できる。STRICT テーブルを使うか、アプリ側で型を検証する前提で設計する
  - ALTER TABLE でできることが限られる（列の型変更や制約の追加はテーブルの作り直しが必要）。マイグレーションツールの前提を確認する
  - 既定はロールバックジャーナルで、書き込み中は読み取りもブロックされる。読み書きが混在するなら最初に WAL を有効にする
  - Dropbox や OneDrive などの同期フォルダ、ネットワークドライブに DB ファイルを置くと、ロックが機能せず DB が破損することがある
cost:
  model: free
  note: パブリックドメインで、商用・非商用を問わず無償・無制限。費用が発生する要素はない
  source: https://www.sqlite.org/copyright.html
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: postgresql
    difference: PostgreSQL はサーバーを1台立てる代わりに、複数プロセス・複数ホストからの同時書き込みと権限管理を持つ。SQLite は1プロセス・1ホストで完結するアプリやツールの組み込みに向く。アプリが複数台に増えた時点で PostgreSQL へ
  - tool: duckdb
    difference: DuckDB も単一ファイル・組み込み型だが列指向で、大量行の集計に強い。SQLite は行単位の読み書きと小さなトランザクションに強い。アプリの状態保存なら SQLite、CSV や Parquet の分析なら DuckDB
verdict: 1台で動くアプリ・CLI ツール・モバイル／デスクトップアプリのローカル保存、テストや試作の DB では第一候補。複数のサーバーやワーカーから同時に書き込む構成、ネットワーク越しに DB ファイルを共有する構成になった時点で避け、PostgreSQL へ移す
updatedAt: 2026-09-13
---

ライブラリとしてアプリに組み込む関係データベースで、DB は1つのファイル、サーバープロセスも設定も不要である。JSON 関数と FTS5 による全文検索を標準で持ち、小規模なら「文書の保存」「検索」もこれ1つで賄える。

利用者が最初に当たる制約は容量ではなく「書き込みは同時に1つ」という点である。読み取りは無制限に並行できるため読み取り中心の Web サイトでは問題にならないが、複数のワーカーが同時に書き込む設計にすると SQLITE_BUSY が頻発する。WAL モードで読み書きの競合は緩和できるが、書き込み同士の直列化は変わらない。

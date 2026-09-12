---
name: DuckDB
aliases: [duckdb, Duck DB]
category: data-processing
layer: tool
oneLiner: 1プロセスに組み込んで動く、列指向の分析（OLAP）用 SQL エンジン
officialUrl: https://duckdb.org/
docsUrl: https://duckdb.org/docs/
can: [transform-tabular, analyze-large-data, store-relational]
cannot:
  - 複数プロセスからの同時書き込み（標準構成は「読み書き1プロセス」か「読み取り専用で複数プロセス」。複数プロセスからの書き込みは Quack リモートプロトコル経由で、ベータ段階）
  - 多数の同時接続から行単位の更新を受ける Web アプリのトランザクション DB（OLTP）としての利用
  - 複数マシンへのスケールアウト（分散実行はなく、1台の CPU・メモリ・ディスクが上限）
  - 常時起動のデータベースサーバーとしての運用（本体はライブラリ。ネットワーク越しの接続には別の仕組みが要る）
constraints:
  - label: 同時アクセスの制限
    value: 書き込みできるプロセスは1つ。読み取り専用なら複数プロセスで開ける。同じ行を同時に変更するトランザクションは競合エラーになる
    impact: Web サーバーとバッチが同じ DB ファイルに書く構成は成立しない。書き込みは1プロセスに集約し、他は読み取り専用で開くか、共有が要る段階で PostgreSQL や DuckLake（カタログを PostgreSQL に置く）へ
    source: https://duckdb.org/docs/current/connect/concurrency.html
    verifiedAt: 2026-09-13
  - label: メモリ上限とディスク退避の既定
    value: memory_limit の既定は RAM の 80%。threads の既定は CPU コア数。一時ファイルは DB 名.tmp（インメモリ時は .tmp）に書かれ、max_temp_directory_size の既定は空きディスクの 90%
    impact: 既定のままだと同じマシンの他プロセスとメモリを奪い合う。共有サーバーや小さなコンテナでは memory_limit を明示し、一時ディレクトリの空き容量を確保する
    source: https://duckdb.org/docs/current/configuration/overview.html
    verifiedAt: 2026-09-13
  - label: メモリを超える処理の対応範囲
    value: GROUP BY・JOIN・ORDER BY・ウィンドウ関数（PARTITION BY / ORDER BY）は larger-than-memory 対応。list() や string_agg() など一部の集約関数はディスク退避に対応しない
    impact: 大半の集計はメモリを超えても完走するが、配列や文字列連結で巨大な値を組み立てる集約はメモリ不足で落ちる。そこだけ処理を分ける
    source: https://duckdb.org/docs/current/guides/performance/how_to_tune_workloads.html
    verifiedAt: 2026-09-13
  - label: 単一の値・ファイルのサイズ上限
    value: 文字列 4 GB、BLOB 4 GB、1ベクトルのメモリ割り当て 128 GB、配列サイズ既定 100,000。DB ファイルサイズには実用上の上限がなく 15 TB 超で検証済み
    impact: 通常の分析で値の上限に当たることはない。DB ファイルが数 TB になると接続やチェックポイントが遅くなるため、生データは Parquet に置き DuckDB は処理エンジンとして使う構成が軽い
    source: https://duckdb.org/docs/current/operations_manual/limits.html
    verifiedAt: 2026-09-13
pitfalls:
  - 1つの接続オブジェクトを複数スレッドから共有すると壊れる。スレッドごとに cursor() で複製する
  - Python から pandas DataFrame を直接クエリできるが、結果を DataFrame に戻すとメモリを二重に持つ。大きい結果は Arrow か Parquet で受け渡す
  - メモリ上限を超えて一時ファイルに落ちると速度が桁で落ちる。memory_limit と threads は一緒に調整する（スレッドを増やすほどスレッドあたりのメモリが減る）
  - 拡張機能（httpfs、spatial 等）はバージョンごとにビルドされ、DuckDB 本体を更新すると再インストールが要る。オフライン環境では事前に取得する
cost:
  model: free
  note: MIT ライセンスで無償。費用は実行するマシンのメモリとディスクとして発生する。マネージド版（MotherDuck 等）は別料金
  source: https://duckdb.org/faq
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: sqlite
    difference: SQLite は行指向で、小さなトランザクションと行単位の読み書きに強く、アプリの状態保存に向く。DuckDB は列指向で、数千万行の集計・結合を数秒で返す代わりに、行単位の更新や多数の同時書き込みには向かない。「保存する」なら SQLite、「集計する」なら DuckDB
  - tool: pandas
    difference: pandas は Python 上で1行ずつ試行錯誤でき可視化・機械学習との接続が厚いが、メモリを超えると使えず単一スレッド。DuckDB は SQL で複数コアを使い、メモリを超えてもディスクに退避して完走する。GB 級までは pandas でよく、超えたら DuckDB で集計して結果だけ pandas へ
  - tool: bigquery
    difference: BigQuery は TB〜PB 級をサーバーレスに処理し複数人で共有できるが、スキャン量で課金され、Google Cloud への取り込みが要る。DuckDB は手元の1台で無料に動き、ローカルの CSV や Parquet、S3 上のファイルを直接読める。1台のディスクとメモリで足りる規模なら DuckDB
verdict: 手元の CSV・Parquet・JSON を SQL で集計する、数 GB〜数百 GB の分析を1台で完結させる、ETL の中間処理を軽く済ませる用途では第一候補。複数プロセスからの同時書き込み、多数の同時接続を受ける本番 DB、1台に収まらない規模では避け、PostgreSQL や BigQuery へ
updatedAt: 2026-09-13
---

SQLite と同じ「ライブラリとして組み込む単一ファイル DB」の形で、中身は列指向・ベクトル化実行の分析エンジンである。Python、R、Node.js、CLI から同じ SQL が使え、CSV・Parquet・JSON をテーブルとして直接クエリでき、S3 や HTTP 上のファイルも読める。

利用者が最初に当たる制約は同時アクセスである。DB ファイルに書き込めるプロセスは1つで、Web アプリのバックエンドのように複数プロセスが同時に書く構成には向かない。もう一つはメモリ上限の既定が RAM の 80% で、他のプロセスと同居するマシンでは明示的に下げる必要がある点である。この2点を守れば、pandas でメモリ不足になった処理をほぼそのまま SQL に置き換えて完走させられる。

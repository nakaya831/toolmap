---
name: pandas
aliases: [Pandas, pd, DataFrame]
category: data-processing
layer: framework
oneLiner: Python で表形式データをメモリ上で整形・集計・可視化する標準ライブラリ
officialUrl: https://pandas.pydata.org/
docsUrl: https://pandas.pydata.org/docs/
can: [transform-tabular, visualize-data, read-write-spreadsheet]
cannot:
  - メモリに収まらないデータの処理（アウトオブコア実行の仕組みは持たない。分割して読む「チャンク処理」は自前で組む）
  - 複数コアや複数マシンでの並列実行（単一スレッドで動く。並列化は Dask や Polars など別ライブラリの領域）
  - 複数プロセス間での DataFrame の共有や永続化（DB ではない。保存は毎回ファイルへの書き出し）
  - 厳密なスキーマの強制（欠損値が混じると整数列が float に変わる等、型が黙って変化する）
  - Python 以外の言語からの利用
constraints:
  - label: メモリ内処理の前提
    value: データセットは1台のメモリに収まる必要がある。メモリのかなりの割合を占めるデータでも、操作が中間コピーを作るため扱いにくくなる
    impact: 数 GB の CSV でも列選択（usecols）や型の縮小なしに読むとメモリ不足で落ちる。公式が示す対処は「読む列を減らす」「効率的な dtype（Categorical、縮小した数値型）」「チャンク処理」「他ライブラリ（Dask 等）」の4つ
    source: https://pandas.pydata.org/docs/user_guide/scale.html
    verifiedAt: 2026-09-13
  - label: 整数列の欠損値の扱い
    value: 欠損値が入ると int64 列は float64 に変換される（既定）。整数のまま欠損を持つには nullable な Int64 型を明示する
    impact: ID や件数の列が 1.0、2.0 になり、結合キーや出力の桁が変わる。読み込み時に dtype を指定するか、pyarrow 型を使う
    source: https://pandas.pydata.org/docs/user_guide/gotchas.html
    verifiedAt: 2026-09-13
  - label: バージョン方針（非推奨と破壊的変更）
    value: MAJOR.MINOR.PATCH の緩い SemVer。非推奨はマイナー版で警告として導入され、削除は次のメジャー版でのみ行われる（例：1.2.0 で非推奨 → 2.0.0 で削除）
    impact: メジャー更新（2.x → 3.x）では警告を出していた API がまとめて消える。更新前に警告を全て潰しておく必要がある
    source: https://pandas.pydata.org/docs/development/policies.html
    verifiedAt: 2026-09-13
  - label: Python・依存ライブラリのサポート期間（SPEC 0）
    value: Python は初回リリースから3年、NumPy 等のコア依存は2年で新版の pandas がサポートを打ち切る
    impact: 古い Python 環境では新しい pandas が入らず、逆に新しい Python では古い pandas が動かない。環境のバージョンを揃えて更新する計画が要る
    source: https://scientific-python.org/specs/spec-0000/
    verifiedAt: 2026-09-13
  - label: 必須・任意依存の最低バージョン（3.0 系）
    value: NumPy 1.26.0 以上が必須。可視化は matplotlib 3.8.3 以上、Parquet は pyarrow 13.0.0 以上、xlsx 読み書きは openpyxl 3.1.5 以上が別途必要
    impact: pandas だけ入れてもグラフ・Excel・Parquet は動かない。用途に応じて pip install "pandas[plot]" などの追加インストールが要る
    source: https://pandas.pydata.org/docs/getting_started/install.html
    verifiedAt: 2026-09-13
pitfalls:
  - df[a][b] = x のような連鎖代入は元の DataFrame を更新しない（3.0 以降は Copy-on-Write が既定で明確に「更新されない」、それ以前は警告付きで不定）。loc で一度に指定する
  - apply や iterrows で行ループを書くと極端に遅い。列単位のベクトル化された演算か、groupby に書き直す
  - read_csv の型推論に任せると、ID の先頭ゼロが落ちる・日付が文字列のまま・大きな数値が float になる。dtype と parse_dates を明示する
  - 「集計して Excel に出す」用途では、出力側の Excel の行数上限やシート数に先に当たる。集計結果だけを出し、明細は Parquet や DB に残す
cost:
  model: free
  note: BSD 3-Clause ライセンスで無償。商用利用の制限はない。費用は実行する計算機のメモリ量として発生する
  source: https://github.com/pandas-dev/pandas/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: duckdb
    difference: DuckDB は SQL で同じ表操作を行い、メモリを超えるデータもディスクに退避して処理でき、複数コアを使う。pandas は Python の関数として1行ずつ試行錯誤しやすく、可視化・機械学習ライブラリとの受け渡しが厚い。GB 級を超えたら DuckDB、結果を Python で加工・描画するなら pandas
  - tool: bigquery
    difference: BigQuery は TB 級をサーバーレスに集計し、スキャン量で課金される。pandas は手元のメモリが上限で費用はかからない。粗い集計を BigQuery で済ませ、結果の数万行を pandas に落として加工する組み合わせが典型
verdict: 数百 MB〜数 GB までの CSV・Excel・DB 抽出結果を Python で整形・集計・可視化する用途では第一候補。1台のメモリを超えるデータ、複数コアでの並列処理、複数人が同時に触る保存先が要る場合は避け、DuckDB や BigQuery、DB へ移す
updatedAt: 2026-09-13
---

Python のデータ処理における共通語で、CSV・Excel・SQL・Parquet を読んで DataFrame にし、結合・集計・欠損処理・時系列操作を行い、matplotlib 経由で描画するまでを一つの API で扱える。機械学習（scikit-learn）や可視化（seaborn、Plotly）のライブラリは DataFrame を入力として受け取る前提で作られている。

利用者が最初に当たる制約はメモリである。pandas はデータ全体をメモリに置き、操作のたびに中間コピーを作るため、ファイルサイズの数倍のメモリを消費することが多い。公式ドキュメントも「メモリを超えるデータは他のライブラリへ」と明言しており、規模が見えた時点で DuckDB や Polars、BigQuery に処理を寄せ、pandas は結果の加工と描画に使う分担が実務の標準になっている。

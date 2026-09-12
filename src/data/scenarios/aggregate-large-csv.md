---
title: 数GBの CSV をローカルで集計したい
needs: [transform-tabular, analyze-large-data]
candidates:
  - tool: duckdb
    fit: best
    reason: CSV を読み込まずに SQL で直接集計でき、メモリに収まらないデータもディスクに溢れさせて処理する。インストールは1ファイル
  - tool: pandas
    fit: viable
    reason: 最も普及しており学習資料が多い。ただし全データをメモリに載せるため、CSV の数倍のメモリが要る。数GBでは限界に近い
  - tool: sqlite
    fit: viable
    reason: CSV を取り込めば SQL で集計でき、どこにでもある。取り込みに時間がかかり、列指向でないため集計は DuckDB より遅い
  - tool: bigquery
    fit: overkill
    reason: TB 級なら第一候補だが、数GBをアップロードして集計するのは転送とスキャン課金の分だけ損。ローカルで済む
updatedAt: 2026-09-13
---

- 「SQL が書ける」なら **DuckDB**。CSV / Parquet をそのまま `SELECT` でき、pandas の DataFrame とも相互変換できる。
- 「Python で前処理から可視化まで一貫したい」なら **pandas**。メモリが足りなくなったら、DuckDB で集計してから pandas に渡す構成にする。
- 集計結果を他の人と共有したい、日次で増え続けるなら、ローカルではなく **BigQuery** のような DWH に移す課題になる。
- 1回限りの集計で行数が数十万なら、SQLite でも表計算ソフトでも足りる。道具を増やさない。

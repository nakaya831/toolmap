---
name: BigQuery
aliases: [BQ, Google BigQuery, Google Cloud BigQuery]
category: data-processing
layer: managed-service
oneLiner: サーバーレスで TB 級のデータを SQL で集計する、Google Cloud のデータウェアハウス
officialUrl: https://cloud.google.com/bigquery
docsUrl: https://docs.cloud.google.com/bigquery/docs
can: [analyze-large-data, visualize-data, store-relational, run-on-schedule]
cannot:
  - 行単位の高頻度な更新・削除を受けるアプリのバックエンド（OLTP）。DML の同時実行はテーブル単位で制限され、1行の更新でもスキャン量で課金される
  - ミリ秒単位の応答が必要な画面の直接のデータ源（クエリは秒単位。結果はキャッシュや別 DB に置く）
  - スキャン量の読めないアドホッククエリを無制限に許すこと（SELECT * が請求に直結する。カスタムクォータで上限を切る）
  - オンプレミスやローカル環境での実行（マネージド専用。手元で同じ SQL を動かすなら DuckDB 等）
constraints:
  - label: オンデマンド課金の単価と最低課金
    value: 処理（スキャン）量 1 TiB あたり $6.25（料金ページの既定表示リージョン。リージョンで異なる）。毎月最初の 1 TiB は無料。1クエリあたり、および参照テーブルごとに最低 10 MB を課金。エラーになったクエリとキャッシュヒットは無課金
    impact: 費用は「行数」ではなく「読んだ列のバイト数」で決まる。パーティション・クラスタリングと列の絞り込みなしに大テーブルへ繰り返し問い合わせると、無料枠 1 TiB は数回で消える。1日のスキャン量はプロジェクト単位のカスタムクォータで上限を切れる（既定 200 TiB / 日）
    source: https://cloud.google.com/bigquery/pricing
    verifiedAt: 2026-09-13
  - label: クエリ実行時間の上限
    value: 6 時間 / クエリ（マルチステートメントクエリも同じ）
    impact: 6 時間で失敗するため、巨大な変換は中間テーブルに分割する。通常の集計は数秒〜数分で終わるので、ここに当たるのは設計の問題である
    source: https://docs.cloud.google.com/bigquery/quotas
    verifiedAt: 2026-09-13
  - label: オンデマンドの同時スロット数
    value: 2,000 スロット / プロジェクト、20,000 スロット / 組織
    impact: 同時に多数のクエリを流すと互いにスロットを取り合い、個々のクエリが遅くなる。安定した性能が必要なら Editions（スロット時間課金）で容量を確保する
    source: https://docs.cloud.google.com/bigquery/quotas
    verifiedAt: 2026-09-13
  - label: テーブル変更回数と INSERT DML の同時実行
    value: 1,500 変更 / テーブル / 日（ロード・コピー・追記／上書きクエリが各1回）。INSERT DML はテーブルあたり 1,500 文まで即時実行、超えると同時実行が 10 に制限される
    impact: 1分ごとに小さなロードジョブで追記する設計は1日で上限に当たる。バッチをまとめるか、Storage Write API によるストリーミングに切り替える（別料金）
    source: https://docs.cloud.google.com/bigquery/quotas
    verifiedAt: 2026-09-13
  - label: クエリ応答サイズの上限
    value: 10 GB（圧縮時）。宛先テーブルへ書き出す場合は無制限
    impact: 大きな結果を API で直接受け取ることはできない。結果はテーブルに書き、エクスポートか Storage Read API で取り出す
    source: https://docs.cloud.google.com/bigquery/quotas
    verifiedAt: 2026-09-13
  - label: ストレージ料金と無料枠
    value: アクティブ論理ストレージ $0.000031507 / GiB・時（月換算で約 $0.023 / GiB）、90 日変更なしの長期ストレージ $0.000021918 / GiB・時。毎月最初の 10 GiB は無料。バッチロードは無料、ストリーミング挿入（Storage Write API REST）は $0.01 / 200 MiB
    impact: 保存自体は安価で、費用の中心はクエリのスキャン量になる。ただし高頻度の小さな書き込みをストリーミングにすると、保存より書き込み料金が先に効く
    source: https://cloud.google.com/bigquery/pricing
    verifiedAt: 2026-09-13
pitfalls:
  - LIMIT を付けても課金は減らない。読む列と読むパーティションを絞ることだけがスキャン量を減らす
  - パーティション列で絞らない WHERE（関数で加工した日付など）はフルスキャンになる。パーティションフィルタ必須の設定を有効にする
  - ダッシュボードの自動更新やスケジュールクエリが裏で毎回フルスキャンし、月末に請求で気づく。プロジェクト単位のカスタムクォータと請求アラートを先に設定する
  - テーブルの結果を BI ツールから直接毎回叩くと遅くて高い。集計済みの小さなテーブルを作り、BI はそこを見る
cost:
  model: free-tier
  note: 毎月 1 TiB のクエリと 10 GiB のストレージまで無料。跳ねるのはスキャン量で、パーティションのない大テーブルへの繰り返しクエリと、BI ツールの自動更新が典型。書き込みはバッチロード無料、ストリーミングは別料金
  source: https://cloud.google.com/bigquery/pricing
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: duckdb
    difference: DuckDB は手元の1台で無料に動き、ローカルや S3 上のファイルを直接読めるが、1台の CPU・メモリ・ディスクが上限で複数人での共有に弱い。BigQuery はサーバーレスで TB〜PB 級を扱い、チームで共有し権限管理できるが、スキャン量課金と Google Cloud への取り込みが前提。1台に収まる規模なら DuckDB
  - tool: postgresql
    difference: PostgreSQL は行単位の更新・トランザクション・低遅延の問い合わせに強く、アプリのバックエンドになれる。BigQuery は更新に弱く応答は秒単位だが、数十億行の集計を分散実行する。業務データの正本は PostgreSQL、そこから複製した履歴の分析は BigQuery という分担が典型
  - tool: pandas
    difference: pandas は Python 上で細かい加工と可視化ができるがメモリが上限。BigQuery で粗く集計した数万行を pandas に落として加工・描画する組み合わせが実務の標準
verdict: 数百 GB〜TB 級のログ・イベント・履歴データを SQL で集計し、チームで共有・可視化する用途では第一候補で、無料枠だけで検証を始められる。行単位の更新が多いデータ、ミリ秒応答が要る画面のデータ源、1台に収まる規模でスキャン課金を避けたい場合は避け、PostgreSQL や DuckDB へ
updatedAt: 2026-09-13
---

Google Cloud のサーバーレスなデータウェアハウスで、サーバーやインデックスの管理をせずに SQL を投げると、数十億行でも分散実行で数秒〜数分で返る。ストレージと計算が分離しており、保存は安価で、計算はスキャン量（オンデマンド）かスロット時間（Editions）で課金される。スケジュールクエリで定期集計を回し、Looker Studio 等の BI から直接参照する構成が典型である。

利用者が最初に当たる制約は性能ではなく課金の仕組みである。費用は「読んだ列のバイト数」で決まり、行数や LIMIT では減らない。無料枠 1 TiB / 月は検証には十分だが、パーティションのない大テーブルを BI ツールが自動更新で繰り返し叩くと数日で消える。カスタムクォータと請求アラートを最初に設定してから使い始めるのが前提である。

---
name: Redis
aliases: [Redis Open Source, redis-server, Remote Dictionary Server]
category: datastore
layer: tool
oneLiner: 全データをメモリに置く、ミリ秒未満で応答するキー・値／データ構造サーバー
officialUrl: https://redis.io/
docsUrl: https://redis.io/docs/latest/
can: [store-key-value, queue-messages, store-documents]
cannot:
  - 搭載メモリを超えるデータセットの保持（ディスクにあふれさせる仕組みは Redis Open Source にはない）
  - 条件を組み合わせた問い合わせや JOIN（キー名を知っている前提のアクセスが基本。二次索引は自前で持つ）
  - 既定設定での完全な耐久性（クラッシュ時、RDB では直近数分、AOF everysec でも1秒分の書き込みを失う）
  - 1インスタンスで複数 CPU コアを使い切ること（コマンド実行は基本シングルスレッド。複数インスタンスに分ける）
constraints:
  - label: メモリ上限（maxmemory）と到達時の動作
    value: 既定 0＝無制限（64bit）。32bit は暗黙に 3 GB。上限到達時は既定で書き込みコマンドにエラーを返す（読み取りは継続）
    impact: 上限を設定しないと OS のメモリを食い尽くし、設定だけすると noeviction で書き込みが失敗し始める。キャッシュ用途では allkeys-lru 等の追い出し方針を必ず選び、レプリケーションや永続化のバッファ分は maxmemory から差し引いておく
    source: https://redis.io/docs/latest/develop/reference/eviction/
    verifiedAt: 2026-09-13
  - label: 永続化の既定と喪失幅
    value: 既定は RDB スナップショット（dump.rdb）。クラッシュ時は直近数分分の書き込みを失う。AOF の既定 fsync は毎秒で、喪失は最大1秒分
    impact: セッションやキャッシュなら既定で足りるが、注文や決済のような失えないデータを Redis だけに置くことはできない。AOF + RDB の併用でも「PostgreSQL 相当」の安全度にとどまり、正本は別に持つ
    source: https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/
    verifiedAt: 2026-09-13
  - label: 1つの値（string）の最大サイズ
    value: 512 MB
    impact: 画像やファイル本体をそのまま値に入れる設計は上限に当たるうえ、メモリを直接消費する。ファイルはオブジェクトストレージに置き、Redis には参照だけ持つ
    source: https://redis.io/docs/latest/develop/data-types/strings/
    verifiedAt: 2026-09-13
  - label: キー数・コレクション要素数の上限
    value: 2^32 キー / インスタンス。hash・list・set・sorted set の要素数も各 2^32
    impact: 数値上の上限より先に、メモリが実質の上限になる（100万個の小さな string キーで約 85 MB が目安として示されている）
    source: https://redis.io/docs/latest/develop/get-started/faq/
    verifiedAt: 2026-09-13
  - label: ライセンス（バージョン別）
    value: 7.2 まで BSD-3-Clause。7.4 は RSALv2 または SSPLv1。8.0 以降は RSALv2 / SSPLv1 / AGPLv3 の三択
    impact: 8 系を製品に組み込んで配布する、あるいはマネージドサービスとして提供する場合はライセンスの選択と条件確認が必要になる。社内利用・自社サービスのバックエンドとしての利用には実務上の影響は小さい
    source: https://redis.io/legal/licenses/
    verifiedAt: 2026-09-13
pitfalls:
  - KEYS * や巨大なコレクションへの O(N) コマンドは、シングルスレッドの全体を止める。本番では SCAN 系を使う
  - RDB / AOF の書き出しは fork に依存し、書き込みが多い間はメモリが最大でデータセットの2倍近く必要になる。Linux では overcommit_memory=1 とメモリの余裕が前提
  - TTL を付け忘れたキャッシュキーが溜まり、maxmemory 到達で本来残したいデータが追い出される。キャッシュと永続データはインスタンスを分ける
  - マネージド版（ElastiCache、Redis Cloud、Upstash 等）はプランごとのメモリ・接続数・利用可能コマンドの制限が別に乗る。ここに書いた上限とは別に確認する
cost:
  model: free
  note: ソフトウェア自体は無償。費用は動かすサーバーのメモリ量として発生し、マネージド版はメモリ容量課金が中心。8 系のライセンスは三択で、配布・再提供の形態によって選択が必要
  source: https://redis.io/legal/licenses/
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: postgresql
    difference: PostgreSQL はディスク上に永続化され、SQL で条件検索と JOIN ができるが、応答はミリ秒単位で原子的なカウンタ更新や TTL 付きの一時保存には向かない。Redis はメモリ内でマイクロ秒〜ミリ秒未満の応答と原子的なデータ構造操作を提供するが、メモリ容量と耐久性に上限がある。小規模ならキューやセッションも PostgreSQL に置いて1つに寄せてよい
verdict: セッション・キャッシュ・レート制限・ランキング・軽量なジョブキューのように「速く、失っても復元できる」データでは第一候補。失えないデータの正本、メモリに収まらない量、複雑な条件検索が要る場合は避け、PostgreSQL などディスク型 DB を正本にして Redis は前段に置く
updatedAt: 2026-09-13
---

「メモリから配る」ことに割り切ったデータ構造サーバーで、string・hash・list・set・sorted set・stream などの構造をそのまま原子的に操作できる。8 系からは JSON・検索・時系列・確率的データ構造・ベクトル集合が本体に統合された。

利用者が最初に当たる制約はメモリ上限の扱いである。maxmemory の既定は無制限で、設定した場合の既定動作は「書き込みにエラーを返す」である。キャッシュとして使うなら追い出し方針を明示し、永続データとして使うなら永続化方式と喪失幅を選ぶ必要がある。この二つの用途を1インスタンスに混ぜるのが典型的な破綻パターンである。

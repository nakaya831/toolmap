---
name: Meilisearch
aliases: [Meili, Meilisearch Cloud]
category: datastore
layer: tool
oneLiner: あいまい検索とタイポ許容に強い、数十ミリ秒で応答する全文検索エンジン
officialUrl: https://www.meilisearch.com/
docsUrl: https://www.meilisearch.com/docs
can: [full-text-search, store-documents]
cannot:
  - 正規化されたデータ同士のJOINや複雑な集計クエリ(検索用インデックスへの投入が前提で、汎用データベースの代替ではない)
  - 唯一の正本データストアとしての運用(検索用途への特化が前提で、別のDBからの同期が想定されている)
  - クレジットカードなし・無期限のマネージド無料利用(Meilisearch Cloudは14日間の無料トライアルのみ)
  - セルフホストでのEnterprise Edition機能(SSO等)の無条件利用(該当部分はBusiness Source License 1.1で提供される)
constraints:
  - label: 自己ホスト時のHTTPペイロード上限
    value: 既定100,000,000バイト(約100MB)。http-payload-size-limitで変更可能
    impact: 大きなNDJSON/JSONを一括登録すると413エラーになる。バッチを分割するか起動オプションで上限を引き上げる
    source: https://www.meilisearch.com/docs/resources/self_hosting/configuration/reference
    verifiedAt: 2026-09-13
  - label: Meilisearch Cloudの手動アップロード上限
    value: 1ファイルあたり20MB
    impact: Cloud管理画面から直接データを流し込む検証では、20MBを超えるデータはAPI経由のバッチ投入に切り替える必要がある
    source: https://www.meilisearch.com/docs/learn/resources/known_limitations
    verifiedAt: 2026-09-13
  - label: 検索クエリの最大語数
    value: 10語(それを超える語は無視される)
    impact: 長い自然文をそのままクエリに投げても11語目以降は検索に反映されない。主要語を抽出して渡す設計が必要になる場合がある
    source: https://www.meilisearch.com/docs/learn/resources/known_limitations
    verifiedAt: 2026-09-13
  - label: フィルタの最大深度
    value: "200"
    impact: AND/ORを深くネストしたフィルタ条件を動的生成するUIでは、極端なネストが上限に達する可能性がある
    source: https://www.meilisearch.com/docs/learn/resources/known_limitations
    verifiedAt: 2026-09-13
  - label: 1インデックスの推奨・最大サイズ
    value: 推奨上限2TiB。Linux環境での理論上の最大は約80TiB
    impact: 推奨上限に近づく規模では、インデックス分割やsearchable/filterable属性の絞り込みが必要になる
    source: https://www.meilisearch.com/docs/learn/resources/known_limitations
    verifiedAt: 2026-09-13
  - label: ライセンス
    value: コア部分はMIT License。一部のEnterprise Edition機能はBusiness Source License 1.1
    impact: 通常の全文検索機能は無償で商用利用も自由だが、Enterprise機能を使う場合はBUSLの条件を別途確認する必要がある
    source: https://github.com/meilisearch/meilisearch/blob/main/LICENSE
    verifiedAt: 2026-09-13
pitfalls:
  - Meilisearchを正本データベースとして使い、検索用インデックスとしての同期設計を怠ると更新の反映漏れが起きる
  - filterableAttributes/sortableAttributesを事前に設定し忘れ、絞り込みや並び替えができないまま本番で気づく
  - Cloudの無料トライアル(14日間)を検証期間と誤認し、本番切り替え直前に有料化の壁に当たる
  - 大量データの初回インデックス投入を1リクエストで行い、ペイロード上限やタイムアウトで失敗する
cost:
  model: free-tier
  note: セルフホストはOSS(MIT)で無償。Meilisearch Cloudは14日間の無料トライアル後、使用量(ドキュメント数・検索数等)またはインスタンスサイズに基づく課金になり、月額20ドル程度から始まる
  source: https://www.meilisearch.com/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: growing
alternatives:
  - tool: postgresql
    difference: PostgreSQLのtsvectorによる全文検索は既存DBに追加費用なく組み込めるが、日本語のような分かち書きしない言語には形態素解析拡張が別途必要になる。Meilisearchは検索専用エンジンとして、あいまい一致・タイポ許容・CJK言語のセグメンテーションを標準で備える
  - tool: sqlite
    difference: SQLiteのFTS5も軽量な全文検索を提供するが、既定のトークナイザは空白区切り前提で日本語の単語分割には向かない。Meilisearchは別サーバーを立てる必要がある代わりに、あいまい検索・ファセット・ランキングのチューニングに特化している
verdict: あいまい一致やタイポ許容を含む検索体験そのものが価値になる場面での第一候補。正本データの保存先や複雑な結合を伴う分析用途には向かず、その場合は既存のデータベースを正本にしてMeilisearchへは検索用に同期する構成にする
updatedAt: 2026-09-13
---

タイポ許容とあいまい一致を前提にした検索専用エンジンで、ドキュメントをインデックスに投入するとミリ秒〜数十ミリ秒で結果が返る。日本語・中国語・韓国語向けの形態素解析ベースのトークナイザ(charabia)を内蔵しており、追加のプラグインなしでCJK言語のセグメンテーションに対応している点がPostgreSQLやSQLiteの標準全文検索と異なる。

利用者が最初に当たる制約は、検索エンジン単体では正本データストアになれないという設計思想である。既存のデータベースからMeilisearchへドキュメントを同期する構成が前提になり、同期を怠ると検索結果が古くなる。セルフホストは無償だが、Cloudを使う場合は14日間の無料トライアルしかない点にも注意が必要になる。

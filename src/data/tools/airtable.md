---
name: Airtable
aliases: [エアテーブル]
category: nocode
layer: managed-service
oneLiner: スプレッドシートの操作感でリレーショナルなデータを扱うノーコードDB
officialUrl: https://www.airtable.com/
docsUrl: https://airtable.com/developers/web/api/introduction
can: [store-relational, read-write-spreadsheet, expose-http-api]
cannot:
  - 無料プランで1ベースあたり1,000レコードを超えるデータを新規追加すること（既存データは保持されるが追記できなくなる）
  - 複雑なJOINや集計をSQLで直接実行すること（画面・APIはリレーショナルだがSQLエンジンではない）
  - 秒間5リクエストを超えるAPI呼び出しを1ベースに対して継続すること（レート制限に達し429が返る）
  - 無料プランでの大容量な添付ファイルの蓄積（1ベースあたり1GBまで）
  - 数百万件規模の大規模データセットの実運用（最上位プランのBusinessでも1ベース125,000レコードが上限）
constraints:
  - label: 無料プランのレコード上限
    value: 1ベースあたり1,000レコード
    impact: 数千件規模のデータを扱うプロジェクトでは早い段階で有料プランへの移行が必要になる
    source: https://support.airtable.com/docs/airtable-plans
    verifiedAt: 2026-09-13
  - label: 無料プランの添付ファイル容量
    value: 1ベースあたり1GB
    impact: 画像・PDFなどの添付を多用するベースはすぐに容量上限に達する
    source: https://support.airtable.com/docs/airtable-plans
    verifiedAt: 2026-09-13
  - label: 有料プランのレコード・添付上限
    value: Teamは1ベース50,000レコード・添付20GB（$20/ユーザー/月、年払い）。Businessは1ベース125,000レコード・添付100GB（$45/ユーザー/月、年払い）
    impact: 上位プランでも1ベースのレコード数には上限がある。超過すると新規レコード・添付の追加ができなくなる（既存データは削除されない）
    source: https://support.airtable.com/docs/airtable-plans
    verifiedAt: 2026-09-13
  - label: Web APIのレート制限
    value: 1ベースあたり秒間5リクエスト。個人アクセストークン単位では全トラフィック合計で秒間50リクエストまで
    impact: 超過すると429が返り、30秒待ってから再試行する必要がある。大量レコードの一括処理はバッチ化と待機処理が必須になる
    source: https://airtable.com/developers/web/api/rate-limits
    verifiedAt: 2026-09-13
pitfalls:
  - レコード上限を「ベース単位」ではなく「アカウント単位」だと誤解し、複数ベースに分けたつもりで実は1ベースが上限超過している
  - API連携をレート制限（秒間5リクエスト）を意識せずに実装し、大量データ投入時に429が頻発してリトライ処理が必要になる
  - 添付ファイルを画像・PDFの保管場所として多用し、ストレージ容量の上限に想定より早く到達する
cost:
  model: free-tier
  note: 無料プランは1ベース1,000レコード・添付1GBまで。課金が跳ねるのはレコード数と添付容量で、上限を超えると新規追加ができなくなり上位プランへの移行が必要になる
  source: https://support.airtable.com/docs/airtable-plans
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: postgresql
    difference: PostgreSQLは真のRDBMSでSQL・JOIN・トランザクションを完全にサポートするが、画面やAPIは自前で構築する必要がある。ノーコードで即座に使える画面が欲しいならAirtable、複雑なクエリや大規模データが必要ならPostgreSQL
  - tool: supabase
    difference: SupabaseはPostgreSQL本体に認証・自動生成APIを組み合わせたバックエンド基盤で、レコード数の上限は実質DBの容量次第。ノーコードの操作画面を優先するならAirtable、開発者向けのフル機能バックエンドが必要ならSupabase
  - tool: google-apps-script
    difference: スプレッドシート（Sheets/GAS）は無料でセル単位の操作に強いが構造化されたリレーションは弱い。テーブル間のリンクや添付管理を伴うならAirtable、Googleの他サービスと連携した自動化が主目的ならGAS
verdict: 少人数チームで構造化されたデータをノーコードの画面とAPIで扱う用途では第一候補。無料プランの1,000レコード/ベースや有料プランでも1ベース最大12.5万レコードという上限に触れたら、PostgreSQLやSupabaseなど本格的なRDBMSへの移行を検討する
updatedAt: 2026-09-13
---

テーブル・行・列というスプレッドシートに近い見た目のまま、列同士をリンクさせてリレーショナルなデータを扱える点が特徴で、ノーコードの画面編集とREST APIの両方から同じデータへアクセスできる。オートメーション機能によりGASやZapier的な自動化も内蔵する。

利用者が最初に当たるのは無料プランのレコード上限（1ベースあたり1,000件）である。プロトタイプの段階では問題にならないが、実データを溜め始めるとすぐに到達する規模で、超過後は既存データを保持したまま新規追加だけが止まる仕様である。API経由での大量操作では、1ベースあたり秒間5リクエストというレート制限にも早期に当たる。

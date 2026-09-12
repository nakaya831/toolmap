---
name: Supabase
aliases: [スーパーベース]
category: backend
layer: managed-service
oneLiner: PostgreSQLを中核に認証・ストレージ・リアルタイムをまとめたBaaS
officialUrl: https://supabase.com
docsUrl: https://supabase.com/docs
can: [store-relational, authenticate-users, store-files, sync-realtime, store-vectors]
cannot:
  - 無料プランでの常時稼働の保証（一定期間操作がないと自動的に一時停止される）
  - データベースエンジンの選択（PostgreSQL固定。MySQL等の他エンジンは使えない）
  - 無料プランでの複数プロジェクト運用（同時に有効化できるのは2プロジェクトまで）
  - 完全な使った分だけの課金（Pro以降はプロジェクト単位の基本料金が発生し、ゼロ利用でも課金される）
constraints:
  - label: 無料プロジェクトの自動一時停止
    value: 7日間（1週間）操作がないと自動的に一時停止される
    impact: デモや個人開発で放置すると次に開いたときにAPIが応答しなくなる。復帰には管理画面からの再開操作が必要になる
    source: https://supabase.com/docs/guides/platform/going-into-prod
    verifiedAt: 2026-09-13
  - label: 無料プランのデータベース容量
    value: 500 MB（到達するとデータベースが読み取り専用になる）
    impact: 書き込みが止まるため、本番相当のデータ量になる前にPro（8GB込み、以降$0.125/GB）へ上げる判断が必要
    source: https://supabase.com/docs/guides/platform/database-size
    verifiedAt: 2026-09-13
  - label: MAU（Monthly Active Users）の無料枠
    value: 50,000 MAU（無料）、Proは100,000 MAU込み、以降$0.00325/MAU
    impact: 認証ユーザー数がそのまま課金対象になる。Authだけを大量ユーザー向けに使う設計では早期に超過する
    source: https://supabase.com/pricing
    verifiedAt: 2026-09-13
  - label: ファイルストレージの無料枠
    value: 1 GB（無料）、Proは100GB込み、以降$0.0213/GB
    impact: 画像・動画等を多く扱うアプリは早期にProのストレージ従量課金に入る
    source: https://supabase.com/pricing
    verifiedAt: 2026-09-13
  - label: Realtimeの同時接続数
    value: 200接続（無料）、Proは500接続込み、以降1,000接続あたり$10
    impact: チャットやダッシュボード等で同時接続が伸びる用途は、接続数を監視しないと想定外の課金になる
    source: https://supabase.com/pricing
    verifiedAt: 2026-09-13
  - label: Edge Functionsの呼び出し回数
    value: 500,000回/月（無料）、Proは2,000,000回込み、以降100万回あたり$2
    impact: サーバーレス関数を高頻度に呼ぶAPIの裏側に使うと、無料枠は早期に尽きる
    source: https://supabase.com/pricing
    verifiedAt: 2026-09-13
pitfalls:
  - Row Level Security（RLS）を有効化し忘れ、匿名キー経由で全テーブルのデータに誰でもアクセスできる状態になる
  - 無料プランの自動一時停止を知らず、久しぶりに開いたデモ環境がAPIエラーで止まっているように見える
  - サーバーレス関数から直接（プーラーを介さず）多数の接続を張り、コネクション数の上限に達する
  - Realtimeの同時接続数がPro無料込み分を超えても気づかず、1,000接続あたり$10の従量課金が積み上がる
cost:
  model: free-tier
  note: 無料枠はデータベース500MB・ストレージ1GB・MAU 50,000などで構成される。課金が跳ねるのはPro以降のMAU・ストレージ・Egress・Realtime接続の従量部分
  source: https://supabase.com/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: growing
alternatives:
  - tool: postgresql
    difference: PostgreSQL単体は認証・ストレージ・APIを持たずデータベース本体のみ。Supabaseはそれを運用込みで提供し、認証・ファイル保存・自動生成APIを同梱する代わりにSupabase側のプラン上限が乗る
  - tool: firebase
    difference: FirebaseはドキュメントDB（Firestore）中心でGoogle基盤に閉じる。SupabaseはPostgreSQLベースでSQLがそのまま使え、オープンソースで自前ホストにも移行できる
verdict: 認証・DB・ストレージ・リアルタイムをPostgreSQLベースで一式揃えたい小〜中規模のアプリでは第一候補。無料プランの一時停止や500MBの上限に触れた時点でProへの移行を検討する。MySQL前提の既存資産がある場合や、Google認証・Firestoreのドキュメント構造を前提にしたい場合はFirebaseへ
updatedAt: 2026-09-13
---

PostgreSQLをコアに、認証（GoTrue）、ファイルストレージ、自動生成REST/GraphQL API、Realtime購読、pgvectorによるベクトル検索までを一つのプロジェクトとして提供するBaaSである。DB本体の制約はPostgreSQLと共通だが、それに加えてSupabase側のプラン上限（接続数ではなくMAU・ストレージ・Realtime接続数）が別軸で乗る。

初級者が最初に当たるのは、データ量ではなく無料プロジェクトの自動一時停止である。1週間操作がないと停止するため、個人のポートフォリオサイトなどを放置すると次のアクセス時にAPIが応答しなくなる。

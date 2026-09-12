---
name: Firebase
aliases: [Firebase, Firestore, ファイアベース]
category: backend
layer: managed-service
oneLiner: Google Cloud上で動く、モバイル/Web向けのドキュメント指向BaaS
officialUrl: https://firebase.google.com
docsUrl: https://firebase.google.com/docs
can: [store-documents, authenticate-users, sync-realtime, store-files, run-short-function]
cannot:
  - Firestoreでのリレーショナルな結合（JOIN）や複数コレクションを跨ぐ集計クエリ
  - 無料（Spark）プランのままでのCloud Functionsの利用（デプロイにはBlazeプランへの登録が必須）
  - SQLクライアントや既存のRDBMSツールからの直接接続
  - Google Cloud以外の基盤への低コストな移行（データ形式・API・課金体系がFirebase/GCP固有）
constraints:
  - label: Cloud Functionsのデプロイ条件
    value: Blaze（従量課金）プランへの登録が必須。無料枠（2M回/月など）の範囲内の利用でも課金設定と支払い方法の登録が前提になる
    impact: 関数を1つでも使うなら、Sparkプランのまま無料で試すことはできない。クレジットカード登録に抵抗がある入門者はここで止まる
    source: https://firebase.google.com/docs/functions/get-started
    verifiedAt: 2026-09-13
  - label: Firestoreの1ドキュメントサイズ上限
    value: 1 MiB（1,048,576バイト）
    impact: 大きな配列やテキストを1ドキュメントに詰め込む設計は上限に当たる。サブコレクションやストレージへの分割が必要になる
    source: https://firebase.google.com/docs/firestore/quotas
    verifiedAt: 2026-09-13
  - label: Firestoreの無料枠（Sparkプラン）
    value: 読み取り50,000回/日、書き込み20,000回/日、削除20,000回/日、保存1 GiB
    impact: 一覧画面で全件取得するクエリを作ると、読み取り回数の無料枠を数十ユーザーの利用で使い切る
    source: https://firebase.google.com/pricing
    verifiedAt: 2026-09-13
  - label: Cloud Functionsの実行時間上限
    value: 第1世代は540秒（9分）。第2世代はHTTPトリガー60分、スケジュール/タスクキューは1800秒（30分）、イベント駆動は540秒
    impact: 長時間バッチをCloud Functions単体で完結させる設計は上限に当たる。分割かCloud Run等への移行が必要
    source: https://firebase.google.com/docs/functions/quotas
    verifiedAt: 2026-09-13
  - label: Authenticationの無料枠
    value: 標準の認証プロバイダは50,000 MAU、SAML/OIDC連携は50 MAU
    impact: 企業向けSSO（SAML/OIDC）を使う設計は、一般ログインより大幅に低いMAU枠で課金が始まる
    source: https://firebase.google.com/pricing
    verifiedAt: 2026-09-13
  - label: Cloud Storageの無料枠
    value: 5 GB保存、ダウンロード1 GB/日（レガシーバケット）
    impact: 画像・動画配信を主用途にすると、ダウンロード量の無料枠は日次で早期に尽きる
    source: https://firebase.google.com/pricing
    verifiedAt: 2026-09-13
pitfalls:
  - Firestoreのセキュリティルールをテストモード（全許可）のまま公開し、全データが誰でも読み書き可能になる
  - 事前に複合インデックスを定義していないクエリが、開発中は動いても本番投入後にエラーになる
  - Cloud Functionsのコールドスタートとリージョン設定を意識せず、想定外のレイテンシが発生する
  - Firestoreの1日あたり読み取り無料枠（50,000回）を、一覧画面の全件取得クエリだけで使い切る
cost:
  model: free-tier
  note: Sparkプランの無料枠に加え、Blaze（従量課金）で使った分だけ課金される。主な課金対象はFirestoreの読み取り/書き込み/削除回数と、Cloud Functionsの実行時間・呼び出し回数
  source: https://firebase.google.com/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: supabase
    difference: SupabaseはPostgreSQLベースでSQLがそのまま使え、オープンソースで自前ホストにも移行できる。Firebaseはドキュメント指向（Firestore）でGoogle Cloudに閉じるが、モバイルSDKとGoogleサービス連携が充実している
  - tool: postgresql
    difference: PostgreSQLは自前運用が前提の関係データベース本体で、結合や集計クエリが得意。FirebaseはNoSQLで運用は不要だが、関係データの結合やSQLでの分析には向かない
verdict: モバイル/Webアプリでリアルタイム同期とGoogle認証を素早く組み込みたい用途では第一候補。関係データの結合や複雑な集計、SQLでの運用が必要ならSupabaseかPostgreSQLへ。Cloud Functionsを使う時点でクレジットカード登録（Blazeプラン）が前提になることは早い段階で確認しておく
updatedAt: 2026-09-13
---

GoogleのモバイルアプリプラットフォームからCloud Functions、Firestore（ドキュメントDB）、Cloud Storage、Authenticationまでを一体で提供するBaaSである。Firestoreはコレクション/ドキュメント構造のNoSQLで、リレーショナルなJOINは持たない代わりにクライアントからのリアルタイム購読に最適化されている。

初級者が最初に当たるのは、無料のSparkプランの範囲ではなく「Cloud Functionsを使うにはBlazeプラン（従量課金）への登録が必須」という点である。無料枠内の利用でも支払い方法の登録が前提になるため、DBとホスティングだけをSparkのまま使う場合と体験が分かれる。

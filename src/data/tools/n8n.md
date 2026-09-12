---
name: n8n
aliases: [n8n.io, nodemation, エヌエイトエヌ]
category: automation
layer: tool
oneLiner: SaaS 連携をノードで組む自動化ツール。自己ホスト可で実行回数課金
officialUrl: https://n8n.io/
docsUrl: https://docs.n8n.io/
can: [connect-saas, run-on-schedule, run-on-event, orchestrate-pipelines, scrape-web, call-http-api]
cannot:
  - 自己ホスト版を第三者向けのホスティングサービスや有償製品として提供すること（Sustainable Use License は内部業務・非商用・個人利用に限定）
  - Community 版（無償の自己ホスト）での SSO（SAML / LDAP）、環境分離、外部シークレット、Git 連携、プロジェクト単位の権限管理（有償版の機能）
  - Cloud 版でプランの同時実行数（Starter 5、Pro 20）を超える Webhook の即時処理（超過分はキュー待ち）
  - 実行履歴の長期保存（Cloud Starter は7日、自己ホストは既定14日または1万件で削除）
  - 1ノードで完結しない複雑な分岐・ループを、コードなしのまま保守し続けること（Code ノードか外部スクリプトが必要になる）
constraints:
  - label: Cloud 版の月間実行回数（課金単位）
    value: Starter 2,500回 / 月（€20 / 月・年払い）、Pro 10,000回 / 月（€50 / 月・年払い）。1回＝ワークフロー1回の実行で、ノード数や処理件数は問わない
    impact: 課金は「起動回数」で決まる。Webhook を1件ずつ受ける設計は件数分の実行を消費し、まとめて1回で処理する設計は消費が少ない。頻度×トリガー数で月の回数を見積もる
    source: https://n8n.io/pricing/
    verifiedAt: 2026-09-13
  - label: Cloud 版の同時実行数
    value: Starter 5、Pro 20、Enterprise 200+（本番実行のみ対象。超過分はキューに入り FIFO で処理）
    impact: 短時間に Webhook が集中すると6件目以降は待たされ、応答が遅れる。即時応答が必要な受け口には向かない
    source: https://n8n.io/pricing/
    verifiedAt: 2026-09-13
  - label: Cloud 版の実行ログ保持
    value: Starter 最大2,500件・7日、Pro 最大25,000件・30日、Enterprise 最大50,000件・無期限。インスタンスのデータ容量は最大 100 GB。件数か日数のどちらかに達した時点で古いものから削除
    impact: 障害の後追いは1週間以内に行う必要がある。監査目的の保存は外部へ書き出す
    source: https://docs.n8n.io/deploy/use-n8n-cloud/configure-cloud/manage-your-data/
    verifiedAt: 2026-09-13
  - label: 自己ホスト版の実行データ削除（既定）
    value: プルーニングは既定で有効。EXECUTIONS_DATA_MAX_AGE = 336時間（14日）、EXECUTIONS_DATA_PRUNE_MAX_COUNT = 10,000件
    impact: 既定のままでは2週間前の実行結果は消える。逆に無効化すると DB が肥大化して容量を使い切る
    source: https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/executions/
    verifiedAt: 2026-09-13
  - label: 自己ホスト版の1実行タイムアウト
    value: EXECUTIONS_TIMEOUT の既定は -1（無制限）。利用者がワークフロー単位で設定できる上限 EXECUTIONS_TIMEOUT_MAX の既定は 3,600秒
    impact: 既定では暴走した実行が止まらない。運用時は全体タイムアウトを設定し、1時間を超える処理は分割する
    source: https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables/executions/
    verifiedAt: 2026-09-13
  - label: 自己ホスト版のライセンス（Sustainable Use License）
    value: 利用・改変は「自社の内部業務目的」か「非商用・個人利用」に限る。他者への配布・提供は無償かつ非商用の場合のみ。ファイル名に .ee. を含むコードは別途 Enterprise License が必要
    impact: 社内の自動化基盤としては無償で使えるが、顧客向けに n8n を組み込んだサービスを売る形は不可。OSI 準拠のオープンソースではない
    source: https://github.com/n8n-io/n8n/blob/master/LICENSE.md
    verifiedAt: 2026-09-13
pitfalls:
  - 自己ホストの既定 DB は SQLite で、実行データを削除しても領域は自動で解放されない（VACUUM 設定が必要）。本格運用では PostgreSQL に切り替える
  - 認証情報は暗号鍵（N8N_ENCRYPTION_KEY）で暗号化して保存される。鍵をバックアップに含めないと、DB を復元しても全 credential が使えない
  - 実行回数の見積もりを「処理件数」で行うと外れる。課金は起動回数なので、Webhook 1件＝1実行、まとめ取り1回＝1実行
  - ワークフローが増えると変更履歴と環境分離（開発・本番）がないまま本番を直接編集する運用になりがち。Git 連携は有償版
cost:
  model: free-tier
  note: 自己ホスト（Community 版）は無料だが Sustainable Use License の制限がある。Cloud 版は Starter €20 / 月（年払い）で 2,500 実行 / 月から。課金が跳ねるのは月間実行回数の上限で、Business は 300,000 実行の追加バケットが €4,000
  source: https://n8n.io/pricing/
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: zapier
    difference: Zapier はフルマネージドで対応コネクタが多く、タスク（ステップ）単位で課金される。n8n はワークフロー実行単位の課金で自己ホストなら無料だが、サーバーの運用が自分の責任になる
  - tool: google-apps-script
    difference: GAS は Google サービス内の処理をコードで書く。n8n は複数 SaaS の連携を画面上で組み、Google 以外のサービスにも同じ手順で接続できる。Google 内で完結し、かつコードを書けるなら GAS のほうが制約が少ない
  - tool: github-actions
    difference: GitHub Actions は開発リポジトリに紐づく定期・イベント実行で、SaaS への接続は API を自分で叩く。n8n はコネクタが用意されているが、コードのバージョン管理は有償版の機能になる
verdict: 複数の SaaS をつなぐ自動化を、コードを最小限にして社内で回す用途では第一候補。自己ホストできる点が Zapier との最大の差になる。避けるのは、n8n を組み込んだサービスを顧客に販売する場合（ライセンス上不可）と、Webhook の即時応答や秒単位の高頻度実行が要る場合（同時実行数の上限に当たる）
updatedAt: 2026-09-13
---

ノードを線でつなぐ画面で「トリガー→変換→出力」を組む自動化ツールで、Zapier に近い体験を自己ホストで得られる点が支持されている。ライセンスは OSI 準拠のオープンソースではなく Sustainable Use License（fair-code）で、内部利用は無償、第三者向けの商用提供は不可という線引きになる。

利用者が最初に当たるのは Cloud 版の月間実行回数である。1実行＝ワークフロー1回の起動で数えるため、Webhook を1件ずつ受けるか、定期実行でまとめて処理するかという設計の違いが、そのまま月額に反映される。自己ホストではこの上限はないが、実行データの保持期間と DB の肥大化が代わりに運用課題になる。

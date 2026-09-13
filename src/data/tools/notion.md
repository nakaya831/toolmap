---
name: Notion
aliases: [ノーション]
category: nocode
layer: managed-service
oneLiner: ドキュメント・DB・Wikiを1つにまとめ、Webサイトとしても公開できるツール
officialUrl: https://www.notion.com/
docsUrl: https://www.notion.com/help
can: [build-static-site, store-documents]
cannot:
  - 無料プランでワークスペースのオーナーが2人以上いる状態で1,000ブロックを超える新規コンテンツを作成すること（削除してもカウントは減らない）
  - 無料プランで11人目以降の外部ゲストを招待すること（外部ゲスト上限10人）
  - 無料プランで5MBを超える単一ファイルを直接アップロードすること（外部リンクでの埋め込みは別）
  - 公開Webサイト（Notion Sites）を追加費用なしで独自ドメインで運用すること（notion.siteドメインは無料、独自ドメインは有料アドオン）
  - Notion APIをFree/Plus等の通常プランで平均秒3リクエスト（分間180）を超えて呼び出し続けること（Business/Enterpriseは平均秒10リクエスト）
constraints:
  - label: 無料プランのブロック数上限
    value: オーナー1人のワークスペースは無制限。オーナー2人以上は1,000ブロックまで（削除してもカウントは減らず、上限到達後3日間の猶予がある）
    impact: 個人利用では無制限だが、チームで共同編集を始めた途端に上限へ到達しやすい。ゲストとの共同編集に切り替えることで回避できる
    source: https://www.notion.com/help/understanding-block-usage
    verifiedAt: 2026-09-13
  - label: 無料プランの外部ゲスト数上限
    value: 10人まで（Plus/Business/Enterpriseは無制限）
    impact: 社外の関係者を多数招待する運用は無料プランでは早期に上限へ達する
    source: https://www.notion.com/pricing
    verifiedAt: 2026-09-13
  - label: 無料プランのファイルアップロードサイズ上限
    value: 1ファイルあたり5MB（有料プランは約5GB）
    impact: 動画や大きな画像・PDFを直接添付する用途には無料プランは向かず、外部ストレージへのリンクで代替する必要がある
    source: https://www.notion.com/pricing
    verifiedAt: 2026-09-13
  - label: 公開Webサイト（Notion Sites）の独自ドメイン対応
    value: 標準はnotion.siteサブドメイン1つが無料。既存の独自ドメインを使うには有料アドオンの購入が必要
    impact: 「Notionだけで無料で独自ドメイン公開したい」という要求は満たせず、追加費用が発生する
    source: https://www.notion.com/help/public-pages-and-web-publishing
    verifiedAt: 2026-09-13
  - label: Notion APIのレート制限
    value: 平均秒3リクエスト（分間180）。Business/Enterpriseプランは平均秒10リクエスト（分間600）
    impact: 大量ページの一括作成・同期処理はこの制約にすぐ当たり、待機・リトライ処理の実装が必要になる
    source: https://developers.notion.com/reference/request-limits
    verifiedAt: 2026-09-13
  - label: Notion APIのブロック・プロパティサイズ上限
    value: 1リクエストで最大1,000ブロック要素・合計500KB、テキストプロパティは2,000文字まで
    impact: 長大なページを一括投入するAPI連携は分割送信が前提になる
    source: https://developers.notion.com/reference/request-limits
    verifiedAt: 2026-09-13
pitfalls:
  - ブロック数の上限は「削除すれば減る」と誤解されがちだが、ゴミ箱を空にしても消費済みカウントは戻らない
  - オーナーを1人に固定しゲストで共同編集する運用に気づかず、複数人をオーナーのままメンバー追加してブロック上限に不意に到達する
  - Notion SitesをGitHub PagesやVercelのような汎用静的サイトホスティングと同列に考え、独自ドメインが標準機能だと誤解する
cost:
  model: free-tier
  note: 無料プランはオーナー1人なら実質無制限に近いが、オーナー2人以上でブロック数1,000件・ゲスト10人・添付5MBが上限になる。課金が跳ねるのは複数人でオーナー権限を持つチーム利用への移行時で、Plus ¥1,650/月・Business ¥3,150/月（いずれも1人あたりの表示価格）から
  source: https://www.notion.com/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: airtable
    difference: Airtableは表形式のリレーショナルデータ管理に特化し無料プランは1,000レコード/ベースが上限。Notionはドキュメント・Wikiに強く、データベース機能はAirtableほど厳密なリレーション操作には向かない。構造化データの集計や外部連携が主目的ならAirtable、ドキュメントと情報整理が主目的ならNotion
  - tool: github-pages
    difference: GitHub Pagesは静的サイトホスティングに特化し独自ドメインを無料で使えるが、コンテンツはMarkdownやビルド済みHTMLとして自分で用意する必要がある。Notion Sitesはページ編集がそのまま公開に反映され技術知識が不要だが、独自ドメインは有料アドオンが必要
verdict: 個人や少人数チームでドキュメント整理と簡易な情報公開を1つのツールで完結させたい場合の第一候補。オーナー2人以上でのブロック数上限（1,000件）やゲスト数上限（10人）に触れたら有料プランへの移行を検討し、独自ドメインでの本格的な公開が必要ならGitHub Pagesなど専用ホスティングとの使い分けを検討する
updatedAt: 2026-09-13
---

Notionはページ・データベース・Wikiを同一の編集体験で扱えるワークスペースツールで、ページをそのまま「Publish」するだけでWebサイト（Notion Sites）として公開できる点が他のドキュメントツールと一線を画す。オートメーション機能や公開APIも備え、社内Wikiから簡易な公開サイトまで同じツールで賄える。

利用者が最初に当たるのはブロック数の上限で、ワークスペースのオーナーが1人なら実質無制限だが、2人以上になった瞬間に無料プランで1,000ブロックという上限が発生する。削除してもカウントが戻らない仕様のため、チーム利用を始める前に把握しておく必要がある。

---
name: Auth0
aliases: [Auth0, Okta Auth0]
category: security
layer: managed-service
oneLiner: 多様なID連携に対応するエンタープライズ向け認証・認可基盤
officialUrl: https://auth0.com
docsUrl: https://auth0.com/docs
can: [authenticate-users]
cannot:
  - 無料プランでの本番運用の想定（ログ保持がわずか1日で、障害・不正調査に不向き）
  - 無料プランでの複数テナント運用（1テナントまで）
  - 大量トラフィックの認証を無料プランのレート制限内で捌くこと（認証系エンドポイントは概ね秒間数リクエスト単位）
  - Auth0のSaaS基盤を経由しない完全なセルフホスト運用（プライベート・デプロイは別契約が必要）
constraints:
  - label: 無料プランのMAU上限
    value: 25,000 MAU（B2C・B2Bとも同一。月内にログインしたユニークユーザー数で計測）
    impact: 登録者数ではなくログインしたユーザー数で数えるため、想定より早く枠に達することがある。超過が続くと有料プランへの移行が必要
    source: https://auth0.com/pricing
    verifiedAt: 2026-09-13
  - label: 無料プランのテナント数
    value: 1テナント
    impact: 開発・検証・本番でテナントを分ける典型構成が無料枠だけでは組めない
    source: https://auth0.com/pricing
    verifiedAt: 2026-09-13
  - label: Management APIのレート制限（無料枠）
    value: 一般エンドポイントは2リクエスト/秒
    impact: ユーザー一覧の同期やバッチ処理をManagement API経由で行うと、想定より早く429（レート制限）に当たる
    source: https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy/rate-limit-configurations/free-public
    verifiedAt: 2026-09-13
  - label: Authentication APIのレート制限（無料枠）
    value: 認証（ログイン）系エンドポイントは5リクエスト/秒、トークン取得は30リクエスト/秒
    impact: ログインが集中する時間帯にこの上限へ到達すると、一部のユーザーがログインできなくなる
    source: https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy/rate-limit-configurations/free-public
    verifiedAt: 2026-09-13
  - label: 無料プランのログ保持期間
    value: 1日
    impact: 数日前の不正ログインや障害の調査に、Auth0側のログをさかのぼって使えない
    source: https://auth0.com/pricing
    verifiedAt: 2026-09-13
  - label: 有料プランへの移行条件
    value: B2C Essentialsは500 MAUから$35/月、B2B Essentialsは500 MAUから$150/月
    impact: 無料枠を超えた時点で必要な最低契約規模と月額費用があらかじめ決まっている
    source: https://auth0.com/pricing
    verifiedAt: 2026-09-13
pitfalls:
  - レート制限に達すると429が返り、ログイン集中時にユーザーがログインできない事象として現れる
  - Rules/Actionsで外部API呼び出し等の重い処理を書くと、認証フロー全体のレイテンシが伸びる
  - MAUを「登録ユーザー数」だと誤解し、実際は「月内にログインしたユニークユーザー数」であることに気づかず枠を超える
  - コールバックURLの完全一致設定を誤り、redirect_uriの不一致エラーで開発が止まる
cost:
  model: free-tier
  note: 無料枠は25,000 MAU・1テナント。超えるとEssentials（500 MAUから月$35〜）以降のプランが必要になり、MAU数とテナント数・機能（SAML等）が課金を左右する
  source: https://auth0.com/pricing
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: clerk
    difference: Clerkはフロントエンド組み込み用のUIコンポーネントとより高い無料枠（50,000 MRU）を持つが、SAML等のエンタープライズ機能はAuth0の方が豊富。Auth0は設定の自由度が高い分、学習コストも高い
  - tool: oauth2-oidc
    difference: OAuth 2.0/OIDCは認証・認可の仕様そのもので、実装や運用は自前で用意する必要がある。Auth0はその仕様をマネージドサービスとして実装済みで提供する
verdict: SAMLや多様なソーシャル連携、詳細なルール/アクション拡張が必要なエンタープライズ向け認証では第一候補。個人開発でMAU無料枠を大きく取りたい場合はClerkへ、依存を避けて仕様レベルから自前実装したい場合はOAuth 2.0/OIDCの直接実装を検討する
updatedAt: 2026-09-13
---

ソーシャルログイン、企業向けSSO（SAML/OIDC）、多要素認証、Rules/Actionsによるカスタムロジックまでを備えたマネージド認証基盤である。認証・認可の実装をゼロから作らずに済む一方、無料プランはテナント数・MAU・ログ保持期間・APIレート制限のいずれも小さく、検証用途に留まる。

初級者が最初に当たるのは、MAUの数え方である。登録者数ではなく「その月にログインしたユニークユーザー数」で計測されるため、想定より早く無料枠（25,000 MAU）に達することがある。

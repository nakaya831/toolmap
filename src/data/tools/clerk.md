---
name: Clerk
aliases: [Clerk, Clerk Auth]
category: security
layer: managed-service
oneLiner: 作り込み済みUIコンポーネントごと導入できる開発者向け認証サービス
officialUrl: https://clerk.com
docsUrl: https://clerk.com/docs
can: [authenticate-users]
cannot:
  - 無料プランでのSAML等エンタープライズSSO利用（Proプラン以上でアドオンとして1接続から）
  - 無料プランのOrganizationで21人以上のメンバーを管理すること（上限20人/組織）
  - ダッシュボードへの4人目以降のチームメンバー追加（無料プランは3席まで）
  - Clerk基盤を経由しないセルフホスト運用（SaaS専業で、Clerk側インフラに依存する）
constraints:
  - label: 無料プランのMRU（Monthly Retained Users）上限
    value: 50,000 MRU/アプリ
    impact: MRUは「その月にアクティブだったか」に関わらず保持されているユーザーをカウントする指標で、想定より早く枠に達することがある
    source: https://clerk.com/pricing
    verifiedAt: 2026-09-13
  - label: 無料枠超過時の課金単価
    value: 追加1 MRUあたり$0.02/月
    impact: ユーザー数が読みにくいtoC向けサービスでは、成長時にMRU課金がそのまま費用増につながる
    source: https://clerk.com/pricing
    verifiedAt: 2026-09-13
  - label: 無料プランのOrganizationメンバー上限
    value: 1組織あたり最大20人
    impact: 社内向けB2B SaaSで大規模なチームを1つのOrganizationに入れる設計は無料枠では組めない
    source: https://clerk.com/pricing
    verifiedAt: 2026-09-13
  - label: 無料プランのダッシュボードシート数
    value: 3席まで
    impact: 開発チームが4人を超えると、管理画面へのアクセス権を全員に配れない
    source: https://clerk.com/pricing
    verifiedAt: 2026-09-13
  - label: Proプランの価格
    value: $25/月（年払いなら$20/月）。エンタープライズ接続（SAML/OIDC/EASIE）を1つ含む
    impact: SAML連携が必要になった時点でProへの移行と月額費用が発生する
    source: https://clerk.com/pricing
    verifiedAt: 2026-09-13
  - label: 無料プランのAPI Key作成回数
    value: 1,000回/月（検証は100,000回/月まで）
    impact: マシン間認証（M2M）でAPIキーを動的に大量発行する設計は、この上限に早期に当たる
    source: https://clerk.com/pricing
    verifiedAt: 2026-09-13
pitfalls:
  - MRU（アクティブ+休眠を含む「保持」ユーザー数）の定義を月間アクティブユーザーと混同し、想定より早く課金が発生する
  - 開発インスタンスと本番インスタンスでAPIキーが分かれており、切り替え忘れで本番に開発キーのまま運用してしまう
  - Webhookの署名検証を省略し、なりすましイベントを受け入れてしまう
  - Organizationのメンバー上限（無料20人）に気づかず、招待が失敗する
cost:
  model: free-tier
  note: 無料枠は50,000 MRU/アプリまで。超過は1 MRUあたり$0.02、Proは$25/月（年払い$20/月）からでエンタープライズ接続やOrganization機能が拡張される
  source: https://clerk.com/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: growing
alternatives:
  - tool: auth0
    difference: Auth0はSAML等のエンタープライズ機能とルール拡張が豊富だが無料MAUは25,000と少なくログ保持も短い。Clerkは作り込み済みUIコンポーネントで導入が速く無料枠のMRUも大きいが、拡張の自由度はAuth0の方が高い
  - tool: supabase
    difference: SupabaseのAuthはDB・ストレージと一体で無料MAUが50,000あるが認証専用のUI部品は薄い。Clerkは認証・ユーザー管理・組織機能のUIをそのまま使える代わりに単体サービスとして別料金になる
verdict: React/Next.js等のフロントエンドで作り込み済みのサインイン画面やユーザー管理UIごと素早く導入したい場合に第一候補。SAML等のエンタープライズSSOを無料で検証したい場合や、より詳細なルール拡張が必要な場合はAuth0へ
updatedAt: 2026-09-13
---

サインイン/サインアップ画面、ユーザープロフィール管理、Organization（B2Bのチーム機能）までを、フロントエンドに組み込み可能な出来合いのUIコンポーネントとして提供する認証サービスである。バックエンドのAPI設計だけでなく画面部分の実装コストも削減できる点がAuth0等との実質的な差である。

初級者が最初に当たるのは、課金指標がMAU（月間アクティブユーザー）ではなくMRU（月間保持ユーザー）である点である。ログインしていない休眠ユーザーもカウントされるため、想定より早く無料枠（50,000 MRU）に近づくことがある。

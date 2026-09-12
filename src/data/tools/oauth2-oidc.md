---
name: OAuth 2.0 / OpenID Connect
aliases: [OAuth2, OAuth 2.0, OIDC, OpenID Connect]
category: security
layer: protocol
oneLiner: 認可・認証の標準仕様。実装はAuth0等の各サービスに委ねる
officialUrl: https://datatracker.ietf.org/doc/html/rfc6749
docsUrl: https://openid.net/specs/openid-connect-core-1_0.html
can: [authenticate-users]
cannot:
  - 実装や運用そのものの提供（仕様書であり、認可サーバー・SDK・トークンストアは別途用意する必要がある）
  - トークンや認可コードの安全な保管の保証（安全に扱う責任は実装側にあり、仕様は要件を定めるだけ）
  - スコープの意味やアクセス制御の粒度設計（スコープの中身はサービスごとに独自に定義する必要がある）
  - パスワード等、実際のログイン手段そのものの規定（OAuth 2.0は認可の枠組みであり、認証手段の実装はIdP依存）
constraints:
  - label: リダイレクトURIの一致要件
    value: 完全な文字列一致が必須（RFC 6749 3.1.2.3節、RFC 3986 6.2.1節に基づく単純な文字列比較）
    impact: 末尾スラッシュや大文字小文字が1文字でも違うとredirect_uriの不一致エラーになり、実装者が最初に詰まる箇所になる
    source: https://datatracker.ietf.org/doc/html/rfc6749
    verifiedAt: 2026-09-13
  - label: 認可コードの有効期限と再利用
    value: 最大10分以内の有効期限がRECOMMENDED、かつ一度使った認可コードの再利用はMUST NOT（サーバーはMUSTで拒否）
    impact: 認可コードを長時間保持したり2回使い回す実装は仕様違反になり、認可サーバー側で拒否される設計にしなければならない
    source: https://datatracker.ietf.org/doc/html/rfc6749
    verifiedAt: 2026-09-13
  - label: Implicit Grant（response_type=token）の位置づけ
    value: クライアント認証を伴わずアクセストークンがブラウザ側（URLフラグメント）に直接渡される方式（RFC 6749 4.2節）
    impact: トークンがブラウザ履歴やリファラ経由で漏洩しうるため、新規実装では認可コードフロー＋PKCEを使うのが実務上の前提になる
    source: https://datatracker.ietf.org/doc/html/rfc6749
    verifiedAt: 2026-09-13
  - label: ID Tokenの必須クレーム
    value: iss, sub, aud, exp, iat の5つがREQUIRED
    impact: 自前でID Tokenを検証する実装は、この5クレームの存在と内容をすべて検証しないと仕様不適合になる
    source: https://openid.net/specs/openid-connect-core-1_0.html
    verifiedAt: 2026-09-13
  - label: expクレームの検証要件
    value: 検証手順（3.1.3.7節）でMUST。現在時刻がexpより前であることを検証する。クロックスキューの許容は「数分程度」まで実装者の裁量でよいとされる（Section 2）
    impact: サーバー間の時刻ずれを考慮せずに厳密比較すると、正当なトークンまで無効と判定することがある
    source: https://openid.net/specs/openid-connect-core-1_0.html
    verifiedAt: 2026-09-13
  - label: Implicit flowでのnonceパラメータ
    value: Implicit Flowの認証リクエストパラメータ（3.2.2.1節）でREQUIRED。リプレイ攻撃対策としてクライアントセッションとID Tokenを関連付ける
    impact: nonceの検証を省略すると、盗聴・再送されたID Tokenを正当なものとして受理してしまう
    source: https://openid.net/specs/openid-connect-core-1_0.html
    verifiedAt: 2026-09-13
pitfalls:
  - redirect_uriの末尾スラッシュや大文字小文字の違いだけで、原因が分かりにくい不一致エラーになる
  - 今なおImplicit Grantを新規採用し、アクセストークンがブラウザ履歴やRefererヘッダーから漏洩する
  - stateやnonceパラメータを省略し、CSRFやリプレイ攻撃を許してしまう
  - アクセストークンをJWTだと決めつけて中身をデコードして使うが、仕様上トークンの形式は規定されておらず不透明な文字列でもよい
cost:
  model: free
  note: 仕様（RFC 6749、OpenID Connect Core）自体は無償で公開されている。OpenID FoundationはIPR方針により、参加者が仕様実装への特許主張をしない旨を表明しており、実装は royalty-free で行える。費用が発生するのは、自前の認可サーバー実装の運用か、Auth0/Clerk等マネージドサービスの利用料としてである
  source: https://openid.net/intellectual-property/
  verifiedAt: 2026-09-13
learningCost: high
maturity: stable
alternatives:
  - tool: auth0
    difference: Auth0はOAuth 2.0/OIDCをマネージドサービスとして実装済みで提供し、認可サーバーの自前運用が不要になる。仕様そのものは無償だが、正しく安全に実装する工数はAuth0側が肩代わりする形になる
  - tool: clerk
    difference: ClerkもOAuth 2.0/OIDCの実装をUIコンポーネント込みで提供する。仕様を直接実装する場合と異なり、トークン管理やリダイレクトの検証はClerk側の責任範囲になる
verdict: 既存のIdP（Google、GitHub、社内SSO等）と連携する仕組みを理解し、実装や導入サービスを選ぶ基準にする際の出発点になる。今すぐ動くログイン機能が必要で実装コストをかけたくない場合は、仕様を直接実装せずAuth0やClerkなどのマネージドサービスへ。仕様の理解だけでは動くソフトウェアにはならない
updatedAt: 2026-09-13
---

OAuth 2.0（RFC 6749）は「あるサービスの権限を、パスワードを渡さずに別のアプリへ委譲する」ための認可の仕組みであり、OpenID Connectはその上に「誰であるか」を示すID Tokenを載せて認証の仕組みに拡張したものである。どちらも実装ではなく仕様であり、Auth0・Clerk・各クラウドのIDプロバイダはこの仕様を実装したサービスとして存在する。

初級者が最初に当たるのは、redirect_uriの完全一致要件である。仕様上は単純な文字列比較でしかないが、登録した値と実際のリクエストが1文字でも違うとエラーになり、原因が分かりにくい。

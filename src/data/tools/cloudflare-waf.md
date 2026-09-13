---
name: Cloudflare WAF / DDoS 保護
aliases: [Cloudflare WAF, WAF, Cloudflare DDoS Protection]
category: security
layer: managed-service
oneLiner: エッジでHTTPリクエストを検査し攻撃・DDoS・ボットを遮断するCDN型WAF
officialUrl: https://www.cloudflare.com/waf/
docsUrl: https://developers.cloudflare.com/waf/
can: [protect-edge]
cannot:
  - 無料プランで6個以上のWAFカスタムルールを同時に有効化すること（上限5件）
  - 無料プランで2個以上のレート制限ルールを設定すること（上限1件）
  - オリジンを介さないネットワーク層（L3）専用のDDoS保護をセルフサービスで契約すること（Magic TransitはContract/Enterprise契約者限定）
  - Cloudflareのプロキシ（オレンジ雲）を経由しない構成への適用（リバースプロキシ型のエッジサービスであり、トラフィックをCloudflare網に通す前提）
constraints:
  - label: 無料プランのWAFカスタムルール数上限
    value: 5ルール（Free）。Pro 20、Business 100、Enterprise 1,000
    impact: 複数の攻撃パターンやパスごとの例外処理をカスタムルールで賄おうとすると、無料プランではすぐに上限へ達し優先順位付けが必要になる
    source: https://developers.cloudflare.com/waf/custom-rules/
    verifiedAt: 2026-09-13
  - label: 無料プランのレート制限ルール数上限
    value: 1ルール（Free）。Pro 2、Business 5、Enterprise 100（契約内容による）
    impact: ログインとAPIなど複数のエンドポイントに個別のレート制限をかけたい場合、無料プランでは1箇所にしか設定できない
    source: https://developers.cloudflare.com/waf/rate-limiting-rules/
    verifiedAt: 2026-09-13
  - label: ボット対策のプラン差
    value: Free は Bot Fight Mode（クラウド事業者やヘッドレスブラウザ由来の単純なボットが対象、ドメイン全体に一律適用）。Super Bot Fight Mode は Pro / Business / Enterprise のみ
    impact: 無料プランではボット種別ごとの動作設定や静的リソースの保護ができない。ヘッドレスブラウザ以外の高度なボットへの対策が必要になった時点で Pro 以上への移行を検討する
    source: https://developers.cloudflare.com/bots/get-started/super-bot-fight-mode/
    verifiedAt: 2026-09-13
  - label: DDoS保護の範囲
    value: L3・L4・L7 の DDoS 保護を、全プラン・全サービスの全顧客に「unmetered and unlimited」で提供
    impact: 攻撃を受けても帯域課金や上限は発生しない。ただし高度な TCP / DNS 攻撃向けの Advanced DDoS Protection は別製品で、無料プランの範囲ではない
    source: https://developers.cloudflare.com/ddos-protection/about/
    verifiedAt: 2026-09-13
pitfalls:
  - カスタムルールとレート制限ルールは別枠のカウントであることに気づかず、無料プランの上限を勘違いする
  - Cloudflareをプロキシ経由（オレンジ雲）で有効化し忘れ、WAFがDNSのみのレコードには適用されないまま放置する
  - レート制限ルールの上限個数が少ないため、複数エンドポイントを1ルールの複雑な条件式に無理に詰め込み可読性が落ちる
cost:
  model: free-tier
  note: Free でも基本的な WAF（カスタムルール5件・レート制限1件）と DDoS 保護は無料。課金が跳ねるのはルール数の拡張とボット対策の高度化で、Pro → Business とプランを上げるたびに月額が段階的に上がる。金額は公式プランページで確認する
  source: https://www.cloudflare.com/plans/
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: cloudflare-workers
    difference: Cloudflare Workersはコードでレート制限やIPブロックを自作でき、WAFのルール数上限に縛られない柔軟なロジックを組める。WAFは既知の攻撃シグネチャや条件式を設定だけで検知・遮断できるが、ルール数と表現力に上限がある。既製の防御で足りるならWAF、独自ロジックが必要ならWorkersを前段に置く
verdict: エッジでのDDoS対策と基本的な攻撃遮断を、専用インフラを持たずに導入したい場合の第一候補。無料プランはルール数（カスタムルール5・レート制限1）が少なく高度なボット対策も持たないため、細かい条件分岐や多数のエンドポイント保護が必要になった時点でPro/Business以上への移行、または独自ロジックが必要ならCloudflare Workersとの併用を検討する
updatedAt: 2026-09-13
---

CloudflareのWAF/DDoS保護は、DNSと同じCloudflareのエッジネットワーク上でHTTPリクエストを検査し、オリジンサーバーに到達する前に攻撃・ボット・過剰なリクエストを遮断する。リバースプロキシ型のサービスであるため、対象ドメインをCloudflareのネームサーバーに向け、プロキシ（オレンジ雲）を有効にすることが前提になる。

利用者が最初に当たるのはルール数の少なさで、無料プランはWAFカスタムルールが5件、レート制限ルールに至っては1件しか作成できない。攻撃パターンやエンドポイントが増えるたびにルールの統廃合か、有料プランへの移行が必要になる。

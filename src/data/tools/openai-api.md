---
name: OpenAI API
aliases: [GPT API, ChatGPT API, OpenAI Platform]
category: ai
layer: managed-service
oneLiner: OpenAIのGPTモデルをHTTPで呼び出す、従量課金のLLM・埋め込みAPI
officialUrl: https://openai.com/api/
docsUrl: https://developers.openai.com/api/docs
can: [call-llm, embed-text, build-agents]
cannot:
  - オンプレミス・オフラインでの推論（API 経由のみで、モデルの重みは非公開）
  - 利用ティア（Usage Tier）の月間支出上限を超える利用（上限到達後は新規リクエストが止まる）
  - リアルタイム応答が必要な処理への Batch API の利用（completion window は24時間固定）
  - コンテキストウィンドウ（主要モデルで約1.05Mトークン）を超える単一リクエストの入力
  - 埋め込みの単一入力での長文一括処理（1リクエスト最大8,192トークン）
constraints:
  - label: 利用ティア（Usage Tier）別の月間利用上限
    value: Free/Tier1 は $100、Tier2 $500、Tier3 $1,000、Tier4 $5,000、Tier5 $200,000（支払い実績に応じ自動昇格）
    impact: 上限に達すると新規リクエストがレート制限にかかる。本番投入前に想定利用額とティアを照合し、必要なら引き上げ申請を行う
    source: https://developers.openai.com/api/docs/guides/rate-limits
    verifiedAt: 2026-09-13
  - label: コンテキスト長と最大出力トークン
    value: 主要モデル（GPT-6 Astra、GPT-5.6 系）は入力コンテキスト約1.05Mトークン、最大出力128Kトークン
    impact: 入力だけでこれを超えると呼び出しが失敗する。長い会話履歴は圧縮・要約してから送る設計が必要になる
    source: https://developers.openai.com/api/docs/models
    verifiedAt: 2026-09-13
  - label: 料金（100万トークンあたり、入力/出力、代表モデル）
    value: GPT-6 Astra $10/$50（キャッシュ入力 $1）、GPT-5.6 Sol $4/$20、GPT-4o-mini $0.15/$0.60、GPT-3.5-turbo $0.50/$1.50
    impact: 最上位モデルを常用すると出力単価（入力の5倍）でコストが跳ねる。用途に応じてミニ系モデルへの切り替えやキャッシュ活用が必要
    source: https://developers.openai.com/api/docs/pricing
    verifiedAt: 2026-09-13
  - label: Embeddings の入力上限と次元数
    value: 1リクエスト最大8,192トークン。text-embedding-3-small は1,536次元、text-embedding-3-large は3,072次元（dimensions パラメータで縮小可）
    impact: 長文はチャンク分割してから埋め込む必要がある。次元数はベクトルDBのスキーマ設計に直結する
    source: https://developers.openai.com/api/docs/guides/embeddings
    verifiedAt: 2026-09-13
  - label: Batch API の上限
    value: 入力ファイル最大200MB、1バッチ最大50,000リクエスト（embeddings も同上限）、completion window は24時間固定、バッチ作成は最大2,000件/時間
    impact: 即時応答が必要な処理には使えない。大量の非同期処理はこの上限を踏まえてファイル・件数を分割する
    source: https://developers.openai.com/api/docs/guides/batch
    verifiedAt: 2026-09-13
pitfalls:
  - 利用ティアが低いうちに大量の並列リクエストを投げると 429 が頻発する。段階的に負荷を上げてティアを引き上げてから本番投入する
  - キャッシュなしで同じ長い前置きを毎回送ると入力コストが線形に積み上がる。固定部分を先頭にまとめてキャッシュを効かせる
  - モデル名・価格・コンテキスト長は世代交代が速く、記憶で書くとすぐ古くなる。都度 Pricing / Models ページで確認する
cost:
  model: usage-based
  note: 入出力トークンの従量課金で、利用ティアの月間支出上限が実質の天井。埋め込みや Batch API など周辺エンドポイントを併用するほど費用が積み上がる
  source: https://developers.openai.com/api/docs/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: claude-api
    difference: Claude API は埋め込みエンドポイントを持たず、長文コンテキストとツール呼び出し・エージェント用途に強い。埋め込みや画像生成など周辺機能まで一本で揃えたいなら OpenAI API、長文処理とエージェント構築が中心なら Claude API
  - tool: ollama
    difference: Ollama は手元のGPU・メモリで無料に動きデータが外に出ないが、既定コンテキストは4,096トークンでモデル品質はハード依存。データを外に出せない要件や費用固定が必要なら Ollama、モデル品質と周辺エンドポイントの充実を優先するなら OpenAI API
  - tool: hugging-face
    difference: Hugging Face は自分でモデルを選び Inference Endpoints にホストするか、少量の無料推論クレジットを使う。モデル選択の自由度と自己ホストが必要なら Hugging Face、単一ベンダーの高品質モデルにAPI一本で任せるなら OpenAI API
verdict: 汎用的な文章生成・埋め込み・エージェント構築を単一ベンダーのAPIで揃えたい場合の第一候補。データを外部に送れない要件やコストを完全固定したい場合は避け、Ollama など自己ホストへ。利用量が増える前に Usage Tier と月間支出上限を確認する
updatedAt: 2026-09-13
---

Chat Completions・Responses・Embeddings・Batch など複数のエンドポイントを一つのアカウントで使える、最も対応言語・ライブラリが豊富な LLM API である。モデルはフラッグシップ級から軽量なミニ系まで幅が広く、用途に応じて単価を切り替えられる点が特徴である。

利用者が最初に当たるのは利用ティア（Usage Tier）の月間支出上限である。新規アカウントは低いティアから始まるため、本番投入前に想定利用額を見積もり、必要なら引き上げ申請を行う必要がある。次に当たりやすいのがコンテキスト長と埋め込みの入力上限で、長文を扱う設計では分割・圧縮が前提になる。

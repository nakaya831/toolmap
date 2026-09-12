---
name: Claude API（Anthropic）
aliases: [Anthropic API, Claude, Messages API, Anthropic SDK]
category: ai
layer: managed-service
oneLiner: Anthropic の Claude モデルを HTTP で呼び出す、従量課金の LLM API
officialUrl: https://platform.claude.com/
docsUrl: https://platform.claude.com/docs/en/intro
can: [call-llm, build-agents]
cannot:
  - 文章のベクトル化（Embeddings エンドポイントがない。埋め込みは別サービスと組み合わせる）
  - モデルの重みの取得や手元での実行（API 経由の推論のみ）
  - 独自データでの追加学習（ファインチューニングは第一者 API では提供されない）
  - 画像・音声の生成（入力に画像・PDF は渡せるが、出力はテキストのみ）
  - 月額固定での利用（従量課金のみ。claude.ai のサブスクリプションとは別勘定）
constraints:
  - label: レート制限（Start ティア、モデルごと）
    value: 1,000 リクエスト/分、入力 2,000,000 トークン/分、出力 400,000 トークン/分（Opus 5・Sonnet 5・Haiku 4.5）。Fable 5.x は 1,000 / 500,000 / 100,000。キャッシュ読み取り分は入力側に数えない
    impact: 超過すると 429 と retry-after ヘッダーが返る。並列に大量投入するバッチ処理は、同期 API ではなく Message Batches API に回す。新規組織は Evaluation ティアとしてこれより低い値から始まる
    source: https://platform.claude.com/docs/en/api/rate-limits
    verifiedAt: 2026-09-13
  - label: 月間支出上限（ティア別）
    value: Start $500/月、Build $1,000/月、Scale $200,000/月
    impact: 上限に達すると翌月1日 00:00 UTC まで全リクエストが 429（retry-after なし）で止まる。本番前に「Request rate limit increase」でティアを上げる
    source: https://platform.claude.com/docs/en/api/rate-limits
    verifiedAt: 2026-09-13
  - label: コンテキスト長と最大出力
    value: 1M トークン（Fable 5.1・Opus 5・Sonnet 5）、200K（Haiku 4.5）。1リクエストの最大出力は 128K トークン（Haiku 4.5 は 64K）
    impact: 入力だけで上限を超えると 400「prompt is too long」。会話履歴は毎回全部送るため、長い対話は圧縮（compaction）か履歴の切り詰めが必要
    source: https://platform.claude.com/docs/en/build-with-claude/context-windows
    verifiedAt: 2026-09-13
  - label: 料金（100万トークンあたり、入力/出力）
    value: Fable 5.1 $10/$50、Opus 5 $5/$25、Sonnet 5 $2/$10、Haiku 4.5 $1/$5。Batch API は 50% 引き、プロンプトキャッシュの読み取りは基本入力の 0.1 倍（5分キャッシュの書き込みは 1.25 倍）
    impact: 同じ長い前置き（システムプロンプト・文書）を毎回送る処理はキャッシュの有無で費用が約10倍違う。出力単価は入力の5倍なので、長文生成のほうが高くつく
    source: https://platform.claude.com/docs/en/about-claude/pricing
    verifiedAt: 2026-09-13
  - label: リクエストサイズ上限
    value: 32 MB（Messages・Token Counting）、256 MB（Message Batches）、500 MB（Files）
    impact: 超過は 413 request_too_large。大きな PDF や画像を毎回本文に埋め込むより、Files API に一度上げて参照する
    source: https://platform.claude.com/docs/en/api/overview
    verifiedAt: 2026-09-13
  - label: 1リクエストに含められる画像・PDF ページ数
    value: 600 枚（ページ）まで。200K コンテキストのモデルは 100
    impact: 数百ページの PDF を一括で読ませる処理は分割が前提になる。ページ数より先に 32 MB のサイズ上限に当たることもある
    source: https://platform.claude.com/docs/en/build-with-claude/context-windows
    verifiedAt: 2026-09-13
pitfalls:
  - max_tokens を小さく設定すると出力が途中で切れる（stop_reason が max_tokens）。長い出力はストリーミングで受ける前提にする
  - API はステートレスで会話履歴を毎回送るため、ターンが進むほど入力トークンが積み上がる。固定部分を先頭に置いてプロンプトキャッシュを効かせないと費用が線形に膨らむ
  - モデル ID や thinking・temperature などのパラメータの可否は世代ごとに変わる。記憶で書かず、Models API か公式のモデル一覧で確認する
  - ツール呼び出しの引数は JSON として parse する。文字列一致で判定するとエスケープの違いで壊れる
cost:
  model: usage-based
  note: 入出力トークン数の従量課金で、ティアの月間支出上限（Start は $500/月）が実質の天井。跳ねるのは、長い履歴をキャッシュなしで送り続ける場合と、Fable / Opus 系を大量に回す場合。無料枠は新規登録時の少額クレジットのみ
  source: https://platform.claude.com/docs/en/about-claude/pricing
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: openai-api
    difference: OpenAI API は埋め込み・画像生成・音声など周辺エンドポイントが一式揃う。Claude API はテキスト生成（画像・PDF 入力可）とツール呼び出し・エージェント系に絞られる。埋め込みが要るなら OpenAI API か別サービスを併用する
  - tool: ollama
    difference: Ollama は手元の GPU・メモリで無料に動き、データが外に出ない。品質と速度はハード次第で、コンテキストも既定 4096 トークン。データ持ち出し不可か費用固定が要件なら Ollama、品質と長いコンテキストが要件なら Claude API
verdict: 長文の読解・要約・コード生成、ツール呼び出しを伴うエージェント処理では第一候補。埋め込みや画像生成が主目的、あるいはデータを社外に送れない場合は避け、OpenAI API や Ollama へ。1,000 リクエスト/分と月間支出上限の枠内に収まる規模かを先に見積もる
updatedAt: 2026-09-13
---

Anthropic が運用する LLM API で、単一の Messages エンドポイントにテキスト・画像・PDF 入力、ツール呼び出し、構造化出力、プロンプトキャッシュが乗っている。1M トークンのコンテキストは追加料金なしの既定値で、長い文書をそのまま渡せる点が特徴である。

利用者が最初に当たるのはレート制限と月間支出上限である。新規組織は公表値より低い Evaluation ティアから始まるため、本番投入の前に Console でティアと上限を確認し、必要なら増枠を申請する。費用面ではキャッシュの有無が支配的で、同じ前置きを毎回送る設計はキャッシュなしだと約10倍の入力コストになる。

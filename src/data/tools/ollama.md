---
name: Ollama
aliases: [オラマ, ollama.com]
category: ai
layer: tool
oneLiner: LLMを手元のPC・サーバーで動かす、OSSのローカル実行ランタイム
officialUrl: https://ollama.com/
docsUrl: https://docs.ollama.com/
can: [run-models-locally, call-llm, embed-text]
cannot:
  - クラウド級の大規模モデルを一般的なPCで快適に動かすこと（速度・可否はGPU/RAMに強く依存する）
  - 商用クラウドAPI相当の同時多数ユーザー対応（1モデルあたりの並列リクエストは既定1）
  - 4,096トークンを超えるコンテキストをそのまま扱うこと（既定値。拡張は可能だがメモリ消費が比例して増える）
  - 古い・低性能なNVIDIA GPUでのアクセラレーション（compute capability 5.0未満は非対応）
  - モデルの追加学習・ファインチューニング（推論専用のランタイムである）
constraints:
  - label: 既定のコンテキストウィンドウ
    value: 4,096トークン（OLLAMA_CONTEXT_LENGTH 環境変数か num_ctx パラメータで変更可能）
    impact: クラウドAPIと同じ感覚で長いプロンプトを送ると既定設定では黙って切り詰められる。長文処理は明示的な拡張設定が必要
    source: https://docs.ollama.com/faq
    verifiedAt: 2026-09-13
  - label: 同時ロード・並列処理の既定値
    value: 同時にロードできるモデル数は既定でGPU数×3（CPUのみは3、Windows上のRadeon GPUは1）。1モデルあたりの並列リクエスト既定は1、リクエストキューの上限は512件
    impact: 複数モデルの切り替えや同時リクエストを想定する場合は環境変数での明示設定が必要。既定のままだと逐次待ちが発生する
    source: https://docs.ollama.com/faq
    verifiedAt: 2026-09-13
  - label: モデルのメモリ滞留時間（keep_alive）
    value: 既定5分でモデルはメモリから解放される（OLLAMA_KEEP_ALIVE か API の keep_alive パラメータで変更可）
    impact: アクセスが5分空くと次回リクエストで再ロードが発生し応答が遅くなる。常時応答が必要な用途は値を延ばす必要がある
    source: https://docs.ollama.com/faq
    verifiedAt: 2026-09-13
  - label: NVIDIA GPUアクセラレーションの要件
    value: compute capability 5.0以上、かつドライバ550以上が必要（5.0〜6.2のカードはドライバ570以上）
    impact: 古いGPUではCPU推論にフォールバックし速度が大きく落ちる。導入前にGPU世代とドライバを確認する
    source: https://docs.ollama.com/gpu
    verifiedAt: 2026-09-13
  - label: ライセンス
    value: MIT License
    impact: 商用利用・改変・再配布に制限がない。ただし個々のモデル自体のライセンスは別途モデルカードで確認が必要
    source: https://github.com/ollama/ollama/blob/main/LICENSE
    verifiedAt: 2026-09-13
pitfalls:
  - 「動く」ことと「実用的な速度で動く」ことは別問題。GPUのVRAMがモデルサイズに対して不足するとCPUへオフロードされ極端に遅くなる
  - 既定のコンテキスト4,096トークンに気づかず長い文書を渡すと、回答がかみ合わない・情報が欠落する
  - keep_alive の既定5分によりベンチマーク時と実運用時で応答速度の体感が変わる（初回はモデルロード待ちが発生する）
cost:
  model: free
  note: MITライセンスで無償。実質的なコストは自前のPC・サーバー（GPU/RAM）とその電力・運用のみで、クラウドAPIのような従量課金は発生しない
  source: https://github.com/ollama/ollama/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: low
maturity: growing
alternatives:
  - tool: openai-api
    difference: OpenAI APIはクラウド上の高品質モデルを従量課金で使え、ハードウェア管理が不要。データを外に出せない、または費用を固定したい場合はOllama、モデル品質と可用性を優先するならOpenAI API
  - tool: hugging-face
    difference: Hugging FaceはHub上のモデルをクラウドでホスト（Inference Endpoints）するか無料の推論クレジットで試せる。手元のマシンで完結させたいならOllama、クラウドでの共有・学習環境まで含めるならHugging Face
  - tool: claude-api
    difference: Claude APIは1Mトークン級の長いコンテキストと高品質な推論をクラウドから受けられる。オフライン・秘匿データ要件があればOllama、長文処理や高精度が要件ならClaude API
verdict: 秘匿データを外に出せない用途や、費用をハードウェア代のみに固定したい小規模な検証・個人利用では第一候補。既定のコンテキスト4,096トークンやモデル品質がハードウェア依存である点に触れたら、クラウドAPI（OpenAI API、Claude API等）への移行を検討する。大規模な同時アクセスやSLAが必要な本番用途は避ける
updatedAt: 2026-09-13
---

`ollama run llama3` のような単一コマンドでモデルの取得と対話が始まる手軽さが最大の特徴で、GGUF形式のモデルをOpenAI互換のローカルAPI（既定 `http://localhost:11434`）として公開できる。バックエンドはllama.cppで、NVIDIA・AMD・Apple Siliconの各GPUに対応する。

利用者が最初に当たる制約はモデルの大きさではなく、既定のコンテキストウィンドウ4,096トークンである。クラウドAPIの数十万〜100万トークン級のコンテキストに慣れていると、長い文書や会話履歴が黙って切り詰められることに気づきにくい。次に当たるのがハードウェア（VRAM・GPU世代）依存で、快適に動かせるモデルサイズは手元の機材でほぼ決まる。
